#[allow(unused_use)]
module sand_dollar::sand_dollar {
    use sui::{dynamic_field, event} ;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use std::string::{Self, String};



    use sui::url::{Self, Url};

    /// Error codes
    const EInvalidAmount: u64 = 0;
    const EInvalidTokenType: u64 = 1;
    const EInvalidToken: u64 = 2;
    const EInvalidEscrow: u64 = 3;

    /// Token type constants
    const TOKEN_TYPE_WBTC: u8 = 0;
    const TOKEN_TYPE_LBTC: u8 = 1;

    /// Represents the type of BTC token being escrowed
    public struct TokenType has store, copy, drop {
        token_type: u8
    }

    /// NFT representing escrowed BTC position
    public struct EscrowNFT has key, store {
        id: UID,
        name: String,
        description: String,
        url: Url,
        escrow_id: ID,
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
        nft_address: address, // linked NFT's ID
        active: bool,
    }

    /// Events
    public struct EscrowCreated has copy, drop {
        escrow_id: ID,
        amount: u64,
        token_type: TokenType,
        creator_address: address,
    }

    public  struct EscrowRedeemed has copy, drop {
        escrow_id: ID,
        amount: u64,
        token_type: TokenType,
        owner_id: address,
    }

    /// Entry function to create escrow
    public entry fun create_escrow(
        amount: u64,
        coin: &mut Coin<TokenType>,
        ctx: &mut TxContext
    ){
        // Validate amount
        assert!(amount > 0, EInvalidAmount);

        // Extract balance from coin
        let escrow_balance = coin::into_balance(coin::split(coin, amount, ctx));

        let escrow_uid = object::new(ctx);

        let creator_address = tx_context::sender(ctx);
        let nft_address = object::uid_to_address(&escrow_uid);

        let escrow =   Escrow {
            id: escrow_uid,
            creator_address,
            escrow_balance,
            amount,
            accumulated_amount: 0,
            claimed_amount: 0,
            lock_start: 0,
            lock_end: 0,
            nft_address,
            active: true,
        };

        let escrow_id = object::id(&escrow);

            let escrow_nft = EscrowNFT {
            id: object::new(ctx),
            name: string::utf8(b"Sand Dollar"),
            description: string::utf8(b"Sand Dollar"),
            url: url::new_unsafe_from_bytes(b"https://sanddollar.com"),
            escrow_id,
        };



        // Emit event
        event::emit(EscrowCreated {
            escrow_id,
            amount,
            token_type: TokenType { token_type: TOKEN_TYPE_WBTC },
            creator_address,
        });


       transfer::share_object( escrow);
        // Transfer NFT to sender
        transfer::transfer(escrow_nft, tx_context::sender(ctx));

    }


    /// Entry function to redeem escrow
    public entry fun redeem_escrow_entry<T>(
        escrowNFT: EscrowNFT,
        escrow: &mut Escrow,
        ctx: &mut TxContext 
    ) {
        assert!(object::id(escrow) == escrowNFT.escrow_id, EInvalidEscrow);
        
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
            nft_address: _,
            active: _,
        } = escrow;

        let total_balance = balance::withdraw_all<TokenType>(escrow_balance);

        // Create coin from balance
        let coin: Coin<TokenType> = coin::from_balance(total_balance, ctx);

        // Emit event before burning
        event::emit(EscrowRedeemed {
            escrow_id: object::uid_to_inner(id),
            amount: *amount,  // TODO: think a bit about this
            token_type: TokenType { token_type: TOKEN_TYPE_WBTC },
            owner_id: tx_context::sender(ctx),
        });

        transfer::public_transfer(coin, tx_context::sender(ctx));

        // Burn NFT
        let EscrowNFT { id: nft_id, name: _, description: _, url: _, escrow_id: _ } = escrowNFT;
        object::delete(nft_id);
        escrow.active = false;
    }
} 