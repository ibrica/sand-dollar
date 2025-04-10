#[allow(unused_use)]
module sand_dollar::sand_dollar;

use std::string::{Self, String};
use std::type_name;
use sui::balance::{Self, Balance};
use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin};
use sui::dynamic_field;
use sui::event;
use sui::url::{Self, Url};

/// Error codes
const EInvalidAmount: u64 = 0;
const EInvalidEscrow: u64 = 2;
const EInvalidSender: u64 = 3;
const EInactiveEscrow: u64 = 4;
const ELockedEscrow: u64 = 5;

/// Token type enumss
public enum TokenType has copy, drop, store {
    WBTC,
    LBTC,
}

/// NFT representing escrowed BTC position
public struct EscrowNFT has key, store {
    id: UID,
    name: String,
    description: String,
    url: Url,
}

public struct Escrow has key, store {
    id: UID,
    creator_address: address,
    escrow_balance: Balance<TokenType>,
    amount: u64,
    accumulated_amount: u64,
    claimed_amount: u64,
    lock_start: u64,
    lock_end: u64,
    nft_id: ID,
    active: bool,
}

/// Events
public struct EscrowCreated has copy, drop {
    escrow_id: ID,
    amount: u64,
    token_type: TokenType,
    creator_address: address,
}

public struct EscrowRedeemed has copy, drop {
    escrow_id: ID,
    amount: u64,
    token_type: TokenType,
    owner_address: address,
}

/// Helper function with shared logic to create escrow
fun create_escrow(
    amount: u64,
    escrow_coin: &mut Coin<TokenType>,
    nft_id: ID,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(amount > 0, EInvalidAmount);

    let escrow_balance = coin::into_balance(coin::split(escrow_coin, amount, ctx));
    let creator_address = tx_context::sender(ctx);
    let current_time = clock::timestamp_ms(clock);
    let one_year_ms = 365 * 24 * 60 * 60 * 1000;
    let lock_end = current_time + one_year_ms;

    let escrow = Escrow {
        id: object::new(ctx),
        creator_address,
        escrow_balance,
        amount,
        accumulated_amount: 0,
        claimed_amount: 0,
        lock_start: current_time,
        lock_end,
        nft_id,
        active: true,
    };

    let escrow_id = object::id(&escrow);

    event::emit(EscrowCreated {
        escrow_id,
        amount,
        token_type: TokenType::WBTC, // TODO: change later for the real token types
        creator_address,
    });

    transfer::share_object(escrow);
}

/// Entry function to create escrow with an existing NFT
public entry fun create_escrow_with_nft<T: key + store>(
    amount: u64,
    escrow_coin: &mut Coin<TokenType>,
    nft: T, // Object must be owned by the sender
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let nft_id = object::id(&nft);

    create_escrow(amount, escrow_coin, nft_id, clock, ctx);
    transfer::public_transfer(nft, tx_context::sender(ctx)); // back to sender
}

/// Entry function to create escrow with a newly minted NFT
public entry fun create_escrow_mint_nft(
    amount: u64,
    escrow_coin: &mut Coin<TokenType>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(amount > 0, EInvalidAmount);

    let escrow_nft = EscrowNFT {
        id: object::new(ctx),
        name: string::utf8(b"Sand Dollar"),
        description: string::utf8(b"Sand Dollar"),
        url: url::new_unsafe_from_bytes(b"https://sanddollar.com"),
    };

    create_escrow(amount, escrow_coin, object::id(&escrow_nft), clock, ctx);

    transfer::transfer(escrow_nft, tx_context::sender(ctx));
}

/// Entry function to redeem escrow
public entry fun redeem_escrow<T: key + store>(
    nft: T,
    escrow: &mut Escrow,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(object::id(&nft) == escrow.nft_id, EInvalidEscrow);
    assert!(escrow.active, EInactiveEscrow);
    assert!(tx_context::sender(ctx) == escrow.creator_address, EInvalidSender);

    // Destructure the escrow to get the balance
    let Escrow {
        id,
        creator_address: _,
        escrow_balance,
        amount,
        accumulated_amount: _,
        claimed_amount: _,
        lock_start: _,
        lock_end,
        nft_id: _,
        active: _,
    } = escrow;

    assert!(clock::timestamp_ms(clock) < *lock_end, ELockedEscrow);

    let total_balance = balance::withdraw_all<TokenType>(escrow_balance);

    // Create coin from balance
    let coin: Coin<TokenType> = coin::from_balance(total_balance, ctx);

    // Emit event before burning
    event::emit(EscrowRedeemed {
        escrow_id: object::uid_to_inner(id),
        amount: *amount, // TODO: think a bit about this
        token_type: TokenType::WBTC, // TODO: change later for the real token types
        owner_address: tx_context::sender(ctx),
    });

    transfer::public_transfer(coin, tx_context::sender(ctx));

    transfer::public_transfer(nft, tx_context::sender(ctx));

    escrow.active = false;
}

/// Entry function to burn escrow NFT
public entry fun burn_escrow_nft(nft: EscrowNFT) {
    let EscrowNFT { id: nft_id, name: _, description: _, url: _ } = nft;
    object::delete(nft_id);
}
