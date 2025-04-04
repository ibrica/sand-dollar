#[test_only]
module sand_dollar::sand_dollar_tests {
    use sui::test_scenario::{Self as test, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sand_dollar::sand_dollar::{Self, EscrowStorage, EscrowNFT};

    // Test constants
    const USER: address = @0xA;
    const ADMIN: address = @0xB;
    const TEST_AMOUNT: u64 = 1000;

    // Test helper function to create a test coin
    fun create_test_coin(ctx: &mut TxContext): Coin<SUI> {
        coin::mint_for_testing<SUI>(TEST_AMOUNT, ctx)
    }

    // Test helper function to setup test scenario
    fun setup_test(): Scenario {
        test::begin(USER)
    }

    // Test helper function to create escrow storage
    fun setup_escrow_storage(scenario: &mut Scenario): EscrowStorage {
        test::next_tx(scenario, ADMIN);
        sand_dollar::init_for_testing(test::ctx(scenario))
    }

    #[test]
    fun test_create_escrow_success() {
        let mut scenario = setup_test();
        let mut storage = setup_escrow_storage(&mut scenario);
        
        // Create test coin
        test::next_tx(&mut scenario, USER);
        let mut coin = create_test_coin(test::ctx(&mut scenario));
        
        // Create escrow
        sand_dollar::create_escrow<SUI>(
            TEST_AMOUNT,
            true, // is_wbtc
            &mut coin,
            &mut storage,
            test::ctx(&mut scenario)
        );

        // Verify coin was split
        assert!(coin::value(&coin) == 0, 0);
        
        coin::destroy_zero(coin);
        sand_dollar::cleanup_storage(storage);
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = sand_dollar::EInvalidAmount)]
    fun test_create_escrow_zero_amount() {
        let mut scenario = setup_test();
        let mut storage = setup_escrow_storage(&mut scenario);
        
        // Create test coin
        test::next_tx(&mut scenario, USER);
        let mut coin = create_test_coin(test::ctx(&mut scenario));
        
        // Try to create escrow with zero amount
        sand_dollar::create_escrow<SUI>(
            0,
            true,
            &mut coin,
            &mut storage,
            test::ctx(&mut scenario)
        );

        coin::destroy_zero(coin);
        sand_dollar::cleanup_storage(storage);
        test::end(scenario);

    }

    #[test]
    fun test_redeem_escrow_success() {
        let mut scenario = setup_test();
        let mut storage = setup_escrow_storage(&mut scenario);
        
        // Create test coin and escrow
        test::next_tx(&mut scenario, USER);
        let mut coin = create_test_coin(test::ctx(&mut scenario));
        
        sand_dollar::create_escrow<SUI>(
            TEST_AMOUNT,
            true,
            &mut coin,
            &mut storage,
            test::ctx(&mut scenario)
        );

        // Get the escrow NFT
        test::next_tx(&mut scenario, USER);
        let escrow_nft = test::take_from_address<EscrowNFT<SUI>>(&scenario, USER);
        
        // Redeem the escrow
        sand_dollar::redeem_escrow_entry<SUI>(
            escrow_nft,
            &mut storage,
            test::ctx(&mut scenario)
        );

        coin::destroy_zero(coin);
        sand_dollar::cleanup_storage(storage);
        test::end(scenario);
    }

    #[test]
    fun test_create_escrow_with_lbtc() {
        let mut scenario = setup_test();
        let mut storage = setup_escrow_storage(&mut scenario);
        
        // Create test coin
        test::next_tx(&mut scenario, USER);
        let mut coin = create_test_coin(test::ctx(&mut scenario));
        
        // Create escrow with LBTC
        sand_dollar::create_escrow<SUI>(
            TEST_AMOUNT,
            false, // is_wbtc = false for LBTC
            &mut coin,
            &mut storage,
            test::ctx(&mut scenario)
        );

        // Verify coin was split
        assert!(coin::value(&coin) == 0, 0);
        coin::destroy_zero(coin);

        sand_dollar::cleanup_storage(storage);
        test::end(scenario);
    }
}
