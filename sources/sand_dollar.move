#[allow(unused_use)]
module sand_dollar::sand_dollar {
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::dynamic_field;

    /// Error codes
    const EInvalidAmount: u64 = 0;
    const EInvalidTokenType: u64 = 1;
    const EInvalidToken: u64 = 2;

    /// Token type constants
    const TOKEN_TYPE_WBTC: u8 = 0;
    const TOKEN_TYPE_LBTC: u8 = 1;

    /// Represents the type of BTC token being escrowed
    struct BTCTokenType has store, copy, drop {
        token_type: u8
    }

    /// Escrow storage - shared object
    struct EscrowStorage has key {
        id: UID
    }

    /// NFT representing escrowed BTC position
    struct EscrowNFT<phantom T> has key, store {
        id: UID,
        amount: u64,
        token_type: BTCTokenType,
        timestamp: u64,
        balance: Balance<T>
    }

    /// Events
    struct EscrowCreated has copy, drop {
        escrow_id: ID,
        amount: u64,
        token_type: BTCTokenType,
        owner: address,
    }

    struct EscrowRedeemed has copy, drop {
        escrow_id: ID,
        amount: u64,
        token_type: BTCTokenType,
        owner: address,
    }

    /// Initialize the escrow storage
    fun init(ctx: &mut TxContext) {
        let storage = EscrowStorage {
            id: object::new(ctx)
        };
        transfer::share_object(storage);
    }

    /// Create a new escrow position
    public entry fun create_escrow<T>(
        amount: u64,
        is_wbtc: bool,
        coin: Coin<T>,
        ctx: &mut TxContext
    ) {
        // Validate amount
        assert!(amount > 0, EInvalidAmount);

        // Extract balance from coin
        let escrow_balance = coin::into_balance(coin::split(&mut coin, amount, ctx));

        let token_type = BTCTokenType {
            token_type: if (is_wbtc) TOKEN_TYPE_WBTC else TOKEN_TYPE_LBTC
        };

        let escrow = EscrowNFT<T> {
            id: object::new(ctx),
            amount,
            token_type,
            timestamp: tx_context::epoch(ctx),
            balance: escrow_balance
        };

        let escrow_id = object::id(&escrow);

        // Emit event
        event::emit(EscrowCreated {
            escrow_id,
            amount,
            token_type,
            owner: tx_context::sender(ctx),
        });

        // Transfer NFT to sender
        transfer::transfer(escrow, tx_context::sender(ctx));
    }

    /// Redeem escrowed tokens
    public entry fun redeem_escrow<T>(
        escrow: EscrowNFT<T>,
        ctx: &mut TxContext
    ) {
        let escrow_id = object::id(&escrow);
        let EscrowNFT { id, amount, token_type, timestamp: _, balance } = escrow;

        // Create coin from balance and transfer to sender
        let coin = coin::from_balance(balance, ctx);
        transfer::public_transfer(coin, tx_context::sender(ctx));

        // Emit event before burning
        event::emit(EscrowRedeemed {
            escrow_id,
            amount,
            token_type,
            owner: tx_context::sender(ctx),
        });

        // Burn NFT
        object::delete(id);
    }
} 