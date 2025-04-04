#[allow(unused_use)]
module sand_dollar::sand_dollar {
    use sui::{dynamic_field, event} ;
    use sui::coin::{Self, Coin};
    use sui::balance::{Balance};
    use std::string::{Self, String};
    use sui::url::{Self, Url};

    /// Error codes
    const EInvalidAmount: u64 = 0;
    // const EInvalidTokenType: u64 = 1;
    // const EInvalidToken: u64 = 2;

    /// Token type constants
    const TOKEN_TYPE_WBTC: u8 = 0;
    const TOKEN_TYPE_LBTC: u8 = 1;

    /// Represents the type of BTC token being escrowed
    public struct TokenType has store, copy, drop {
        token_type: u8
    }

    /// Escrow storage - shared object
    public struct EscrowStorage has key {
        id: UID
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
        amount: u64,
        accumulated_amount: u64,
        claimed_amount: u64,
        lock_start: u64,
        lock_end: u64,
        nft_id: ID, // linked NFT's ID
    }

    /// Events
    public struct EscrowCreated has copy, drop {
        escrow_id: ID,
        amount: u64,
        token_type: TokenType,
        owner_id: address,
    }

    public  struct EscrowRedeemed has copy, drop {
        escrow_id: ID,
        amount: u64,
        token_type: TokenType,
        owner_id: address,
    }

    /// Initialize the escrow storage
    fun init(ctx: &mut TxContext) {
        let storage = EscrowStorage {
            id: object::new(ctx)
        };
        transfer::share_object(storage);
    }


    /// Entry function to create escrow
    public entry fun create_escrow(
        amount: u64,
        coin: &mut Coin<TokenType>,
        storage: &mut EscrowStorage,
        ctx: &mut TxContext
    ){
        // Validate amount
        assert!(amount > 0, EInvalidAmount);

        // Extract balance from coin
        let escrow_balance = coin::into_balance(coin::split(coin, amount, ctx));



        let escrowNFT = EscrowNFT {
            id: object::new(ctx),
            name: string::utf8(b"Sand Dollar"),
            description: string::utf8(b"Sand Dollar"),
            url: url::new_unsafe_from_bytes(b"https://sanddollar.com"),
        };

        let escrow_id = object::id(&escrowNFT);

        // Emit event
        event::emit(EscrowCreated {
            escrow_id,
            amount,
            token_type: TokenType { token_type: TOKEN_TYPE_WBTC },
            owner_id: tx_context::sender(ctx),
        });
        // Store escrowed coins in secure storage
        dynamic_field::add(&mut storage.id, escrow_id, escrow_balance);


        // Transfer NFT to sender
        transfer::transfer(escrowNFT, tx_context::sender(ctx));

    }


    /// Entry function to redeem escrow
    public entry fun redeem_escrow_entry<T>(
        escrow: EscrowNFT,
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