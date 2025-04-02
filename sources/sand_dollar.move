#[allow(unused_use)]
module sand_dollar::sand_dollar {
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;

    /// Error codes
    const EInvalidAmount: u64 = 0;
    const EInvalidTokenType: u64 = 1;

    /// Mainnet addresses for BTC tokens
    const WBTC_ADDRESS: address = @0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881;
    const LBTC_ADDRESS: address = @0x3e8e9423d80e1774a7ca128fccd8bf5f1f7753be658c5e645929037f7c819040;

    /// Token type constants
    const TOKEN_TYPE_WBTC: u8 = 0;
    const TOKEN_TYPE_LBTC: u8 = 1;

    /// Represents the type of BTC token being escrowed
    struct BTCTokenType has store, copy, drop {
        token_type: u8
    }

    /// NFT representing escrowed BTC position
    struct EscrowNFT has key {
        id: UID,
        amount: u64,
        token_type: BTCTokenType,
        timestamp: u64,
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

    /// Create a new escrow position
    public fun create_escrow(
        amount: u64,
        is_wbtc: bool,
        ctx: &mut TxContext
    ) {
        // Validate amount
        assert!(amount > 0, EInvalidAmount);

        let token_type = BTCTokenType {
            token_type: if (is_wbtc) TOKEN_TYPE_WBTC else TOKEN_TYPE_LBTC
        };

        let escrow = EscrowNFT {
            id: object::new(ctx),
            amount,
            token_type,
            timestamp: tx_context::epoch(ctx),
        };

        // Emit event
        event::emit(EscrowCreated {
            escrow_id: object::id(&escrow),
            amount,
            token_type,
            owner: tx_context::sender(ctx),
        });

        // Transfer NFT to sender
        transfer::transfer(escrow, tx_context::sender(ctx));
    }

    /// Redeem escrowed tokens
    public fun redeem_escrow(
        escrow: EscrowNFT,
        ctx: &mut TxContext
    ) {
        let escrow_id = object::id(&escrow);
        let EscrowNFT { id, amount, token_type, timestamp: _ } = escrow;

        // Emit event before burning
        event::emit(EscrowRedeemed {
            escrow_id,
            amount,
            token_type,
            owner: tx_context::sender(ctx),
        });

        // Burn the NFT
        object::delete(id);
    }
} 