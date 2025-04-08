#[allow(unused_use)]
module sand_dollar::sand_dollar;

use std::string::{Self, String};
use std::type_name;
use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::dynamic_field;
use sui::event;
use sui::url::{Self, Url};

/// Error codes
const EInvalidAmount: u64 = 0;
const EInvalidEscrow: u64 = 2;
const EInvalidSender: u64 = 3;
const EInactiveEscrow: u64 = 4;

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

/// Events
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

/// Entry function to create escrow with an existing NFT
public entry fun create_escrow_with_nft<T: key + store>(
    amount: u64,
    escrow_coin: &mut Coin<TokenType>,
    nft: T, // Object must be owned by the sender
    ctx: &mut TxContext,
) {
    let nft_id = object::id(&nft);

    create_escrow(amount, escrow_coin, nft_id, ctx);
    transfer::public_transfer(nft, tx_context::sender(ctx)); // back to sender
}

/// Entry function to create escrow with a newly minted NFT
public entry fun create_escrow_mint_nft(
    amount: u64,
    escrow_coin: &mut Coin<TokenType>,
    ctx: &mut TxContext,
) {
    assert!(amount > 0, EInvalidAmount);

    let escrow_nft = EscrowNFT {
        id: object::new(ctx),
        name: string::utf8(b"Sand Dollar"),
        description: string::utf8(b"Sand Dollar"),
        url: url::new_unsafe_from_bytes(b"https://sanddollar.com"),
    };

    create_escrow(amount, escrow_coin, object::id(&escrow_nft), ctx);

    transfer::transfer(escrow_nft, tx_context::sender(ctx));
}

/// Helper function with shared logic to create escrow
fun create_escrow(amount: u64, escrow_coin: &mut Coin<TokenType>, nft_id: ID, ctx: &mut TxContext) {
    assert!(amount > 0, EInvalidAmount);

    let escrow_balance = coin::into_balance(coin::split(escrow_coin, amount, ctx));
    let creator_address = tx_context::sender(ctx);
    let escrow = Escrow {
        id: object::new(ctx),
        creator_address,
        escrow_balance,
        amount,
        accumulated_amount: 0,
        claimed_amount: 0,
        lock_start: 0,
        lock_end: 0,
        nft_id,
        active: true,
    };

    let escrow_id = object::id(&escrow);

    // Emit event
    event::emit(EscrowCreated {
        escrow_id,
        amount,
        token_type: TokenType::WBTC, // TODO: change later for the real token types
        creator_address,
    });

    transfer::share_object(escrow);
}

/// Entry function to redeem escrow
public entry fun redeem_escrow(escrow_nft: EscrowNFT, escrow: &mut Escrow, ctx: &mut TxContext) {
    assert!(object::id(&escrow_nft) == escrow.nft_id, EInvalidEscrow);
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
        lock_end: _,
        nft_id: _,
        active: _,
    } = escrow;

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

    // Burn NFT
    let EscrowNFT { id: nft_id, name: _, description: _, url: _ } = escrow_nft;
    object::delete(nft_id);
    escrow.active = false;
}
