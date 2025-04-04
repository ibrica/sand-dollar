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
        timestamp: u64
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


    /// Entry function to create escrow
    public entry fun create_escrow<T>(
        amount: u64,
        is_wbtc: bool,
        coin: &mut Coin<T>,
        storage: &mut EscrowStorage,
        ctx: &mut TxContext
    ){
        // Validate amount
        assert!(amount > 0, EInvalidAmount);

        // Extract balance from coin
        let escrow_balance = coin::into_balance(coin::split(coin, amount, ctx));

        let token_type = BTCTokenType {
            token_type: if (is_wbtc) TOKEN_TYPE_WBTC else TOKEN_TYPE_LBTC
        };

        let escrowNFT = EscrowNFT<T> {
            id: object::new(ctx),
            amount,
            token_type,
            timestamp: tx_context::epoch(ctx)
        };

        let escrow_id = object::id(&escrowNFT);

        // Emit event
        event::emit(EscrowCreated {
            escrow_id,
            amount,
            token_type,
            owner: tx_context::sender(ctx),
        });
        // Store escrowed coins in secure storage
        dynamic_field::add(&mut storage.id, escrow_id, escrow_balance);


        // Transfer NFT to sender
        transfer::transfer(escrowNFT, tx_context::sender(ctx));

    }


    /// Entry function to redeem escrow
    public entry fun redeem_escrow_entry<T>(
        escrow: EscrowNFT<T>,
        storage: &mut EscrowStorage,
        ctx: &mut TxContext
    ) {
        let escrow_id = object::id(&escrow);
        let EscrowNFT { id, amount, token_type, timestamp: _ } = escrow;

        // Get escrowed coins from storage
        let escrow_balance = dynamic_field::remove(&mut storage.id, escrow_id);

        // Create coin from balance
        let coin: Coin<T> = coin::from_balance(escrow_balance, ctx);

        // Emit event before burning
        event::emit(EscrowRedeemed {
            escrow_id,
            amount,
            token_type,
            owner: tx_context::sender(ctx),
        });

        transfer::public_transfer(coin, tx_context::sender(ctx));

        // Burn NFT
        object::delete(id);
    }

    #[test_only]
    /// Initialize the escrow storage for testing
    public fun init_for_testing(ctx: &mut TxContext): EscrowStorage {
        EscrowStorage {
            id: object::new(ctx)
        }
    }

    #[test_only]
    /// Clean up the escrow storage for testing
    public fun cleanup_storage(storage: EscrowStorage) {
        let EscrowStorage { id } = storage;
        object::delete(id);
    }
} 