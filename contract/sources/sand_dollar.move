#[allow(unused_use)]
module sand_dollar::sand_dollar;

use std::ascii::String as AsciiString;
use std::string::{Self, String};
use std::type_name;
use sui::balance::{Self, Balance};
use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin};
use sui::dynamic_field;
use sui::event;
use sui::sui::SUI;
use sui::url::{Self, Url};

/// Constants
const LOCK_PERIOD: u64 = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

/// Error codes
const EInvalidAmount: u64 = 0;
const EInvalidEscrow: u64 = 2;
const EInvalidSender: u64 = 3;
const EInactiveEscrow: u64 = 4;
const ELockedEscrow: u64 = 5;
const EInvalidYieldProvider: u64 = 6;
const EUnsupportedTokenType: u64 = 7;

/// Yield provider enum
public enum YieldProvider has copy, drop, store {
    None,
    Navi,
    SuiLend,
}

/// Helper function to validate token type from coin
fun is_valid_token_type<T>(_coin: &Coin<T>): bool {
    let type_name = type_name::get<T>();
    let type_name_bytes = type_name::into_string(type_name).as_bytes();
    if (
        type_name_bytes == b"0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN" ||
        type_name_bytes == b"0x3e8e9423d80e1774a7ca128fccd8bf5f1f7753be658c5e645929037f7c819040::lbtc::LBTC" ||
        type_name == type_name::get<SUI>()
    ) {
        true
    } else {
        false
    }
}

/// NFT representing escrowed BTC position
public struct EscrowNFT has key, store {
    id: UID,
    name: String,
    description: String,
    url: Url,
}

public struct Escrow<phantom T> has key, store {
    id: UID,
    creator_address: address,
    owner_address: address,
    escrow_balance: Balance<T>,
    amount: u64,
    accumulated_amount: u64,
    claimed_amount: u64,
    lock_start: u64,
    lock_end: u64,
    nft_id: ID,
    yield_provider: YieldProvider,
    active: bool,
}

/// Events
public struct EscrowCreated has copy, drop {
    escrow_id: ID,
    amount: u64,
    token_type: AsciiString,
    creator_address: address,
    lock_start: u64,
    lock_end: u64,
}

public struct EscrowRedeemed has copy, drop {
    escrow_id: ID,
    amount: u64,
    token_type: AsciiString,
    owner_address: address,
}

/// Helper function with shared logic to create escrow
fun create_escrow<T>(
    escrow_coin: Coin<T>,
    nft_id: ID,
    yield_provider: YieldProvider,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let amount = coin::value(&escrow_coin);
    assert!(amount > 0, EInvalidAmount);
    assert!(is_valid_token_type<T>(&escrow_coin), EUnsupportedTokenType);

    let escrow_balance = coin::into_balance(escrow_coin);
    let creator_address = tx_context::sender(ctx);
    let lock_start = clock::timestamp_ms(clock);
    let lock_end = lock_start + LOCK_PERIOD;

    let escrow = Escrow<T> {
        id: object::new(ctx),
        creator_address,
        owner_address: creator_address,
        escrow_balance,
        amount,
        accumulated_amount: 0,
        claimed_amount: 0,
        lock_start,
        lock_end,
        nft_id,
        yield_provider,
        active: true,
    };

    let escrow_id = object::id(&escrow);

    event::emit(EscrowCreated {
        escrow_id,
        amount,
        token_type: type_name::get<T>().into_string(),
        creator_address,
        lock_start,
        lock_end,
    });

    transfer::share_object(escrow);
}

/// Entry function to create escrow with an existing NFT
public entry fun create_escrow_with_nft<NftType: key + store, T>(
    escrow_coin: Coin<T>,
    nft: NftType, // Object must be owned by the sender
    yield_provider_value: u8,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let nft_id = object::id(&nft);
    let yield_provider = yield_provider_from_u8(yield_provider_value);

    create_escrow(escrow_coin, nft_id, yield_provider, clock, ctx);
    transfer::public_transfer(nft, tx_context::sender(ctx)); // back to sender
}

/// Entry function to create escrow with a newly minted NFT
public entry fun create_escrow_mint_nft<T>(
    escrow_coin: Coin<T>,
    yield_provider_value: u8,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(coin::value(&escrow_coin) > 0, EInvalidAmount);

    let escrow_nft = EscrowNFT {
        id: object::new(ctx),
        name: string::utf8(b"Sand Dollar"),
        description: string::utf8(b"Sand Dollar"),
        url: url::new_unsafe_from_bytes(b"https://sanddollar.com"),
    };

    let yield_provider = yield_provider_from_u8(yield_provider_value);
    create_escrow(escrow_coin, object::id(&escrow_nft), yield_provider, clock, ctx);

    transfer::transfer(escrow_nft, tx_context::sender(ctx));
}

/// Entry function to redeem escrow
public entry fun redeem_escrow<NftType: key + store, T>(
    nft: NftType,
    escrow: &mut Escrow<T>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(object::id(&nft) == escrow.nft_id, EInvalidEscrow);
    assert!(escrow.active, EInactiveEscrow);
    assert!(tx_context::sender(ctx) == escrow.creator_address, EInvalidSender);

    let Escrow<T> {
        id,
        creator_address: _,
        owner_address: _,
        escrow_balance,
        amount,
        accumulated_amount: _,
        claimed_amount: _,
        lock_start: _,
        lock_end,
        nft_id: _,
        yield_provider: _,
        active: _,
    } = escrow;

    assert!(clock::timestamp_ms(clock) >= *lock_end, ELockedEscrow);

    let total_balance = balance::withdraw_all<T>(escrow_balance);

    let coin: Coin<T> = coin::from_balance(total_balance, ctx);

    event::emit(EscrowRedeemed {
        escrow_id: object::uid_to_inner(id),
        amount: *amount,
        token_type: type_name::get<T>().into_string(),
        owner_address: tx_context::sender(ctx),
    });

    transfer::public_transfer(coin, tx_context::sender(ctx));
    transfer::public_transfer(nft, tx_context::sender(ctx));

    escrow.active = false;
    escrow.owner_address = tx_context::sender(ctx);
}

/// Entry function to burn escrow NFT
public entry fun burn_escrow_nft(nft: EscrowNFT) {
    let EscrowNFT { id: nft_id, name: _, description: _, url: _ } = nft;
    object::delete(nft_id);
}

/// Helper function to convert u8 to YieldProvider
fun yield_provider_from_u8(value: u8): YieldProvider {
    assert!(value <= 2, EInvalidYieldProvider);
    if (value == 0) {
        YieldProvider::None
    } else if (value == 1) {
        YieldProvider::Navi
    } else {
        YieldProvider::SuiLend
    }
}
