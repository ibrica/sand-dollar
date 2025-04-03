#[allow(unused_use)]
module sand_dollar::sand_dollar {
    use sui::event;
    use sui::coin::{Self, Coin};
    use sui::balance::{Balance};
    use sui::dynamic_field;

    /// Error codes
    const EInvalidAmount: u64 = 0;
    // const EInvalidTokenType: u64 = 1;
    // const EInvalidToken: u64 = 2;

    /// Token type constants
    const TOKEN_TYPE_WBTC: u8 = 0;
    const TOKEN_TYPE_LBTC: u8 = 1;

    /// Represents the type of BTC token being escrowed
    public struct BTCTokenType has store, copy, drop {
        token_type: u8
    }

    /// Escrow storage - shared object
    public struct EscrowStorage has key {
        id: UID
    }

    /// NFT representing escrowed BTC position
    public struct EscrowNFT<phantom T> has key, store {
        id: UID,
        amount: u64,
        token_type: BTCTokenType,
        timestamp: u64,
        balance: Balance<T>
    }

    /// Events
    public struct EscrowCreated has copy, drop {
        escrow_id: ID,
        amount: u64,
        token_type: BTCTokenType,
        owner: address,
    }

    public  struct EscrowRedeemed has copy, drop {
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
    public fun create_escrow<T>(
        amount: u64,
        is_wbtc: bool,
        mut coin: Coin<T>,
        ctx: &mut TxContext
    ): (EscrowNFT<T>, Coin<T>) {
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

        (escrow, coin)
    }

    /// Entry function to create escrow
    public entry fun create_escrow_entry<T>(
        amount: u64,
        is_wbtc: bool,
        coin: Coin<T>,
        ctx: &mut TxContext
    ) {
        let (escrow, remaining_coin) = create_escrow(amount, is_wbtc, coin, ctx);
        transfer::public_transfer(escrow, tx_context::sender(ctx));
        transfer::public_transfer(remaining_coin, tx_context::sender(ctx));
    }

    /// Redeem escrowed tokens
    public fun redeem_escrow<T>(
        escrow: EscrowNFT<T>,
        ctx: &mut TxContext
    ): Coin<T> {
        let escrow_id = object::id(&escrow);
        let EscrowNFT { id, amount, token_type, timestamp: _, balance } = escrow;

        // Create coin from balance
        let coin = coin::from_balance(balance, ctx);

        // Emit event before burning
        event::emit(EscrowRedeemed {
            escrow_id,
            amount,
            token_type,
            owner: tx_context::sender(ctx),
        });

        // Burn NFT
        object::delete(id);

        coin
    }

    /// Entry function to redeem escrow
    public entry fun redeem_escrow_entry<T>(
        escrow: EscrowNFT<T>,
        ctx: &mut TxContext
    ) {
        let coin = redeem_escrow(escrow, ctx);
        transfer::public_transfer(coin, tx_context::sender(ctx));
    }
} 