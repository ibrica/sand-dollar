#[test_only]
module sand_dollar::sand_dollar_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::tx_context::TxContext;
    use sand_dollar::sand_dollar::{Self, EscrowNFT, EscrowStorage};

    const TEST_USER: address = @0x123;

    #[test]
    fun test_create_and_redeem_escrow() {
        let mut scenario = test_scenario::begin(TEST_USER);
        let ctx = test_scenario::ctx(&mut scenario);

        // Create test coins
        let wbtc_coin = coin::mint_for_testing<SUI>(1000, ctx);
        let lbtc_coin = coin::mint_for_testing<SUI>(1000, ctx);

        // Initialize storage
        test_scenario::next_tx(&mut scenario, TEST_USER);
        let ctx = test_scenario::ctx(&mut scenario);
        sand_dollar::init(ctx);

        // Test WBTC escrow
        {
            test_scenario::next_tx(&mut scenario, TEST_USER);
            let ctx = test_scenario::ctx(&mut scenario);
            let storage = test_scenario::take_shared<EscrowStorage>(&mut scenario);

            let escrow = sand_dollar::create_escrow(1000, true, wbtc_coin, &storage, ctx);
            test_scenario::return_to_sender(&mut scenario, escrow);
            test_scenario::return_shared(storage);
        };

        // Test LBTC escrow
        {
            test_scenario::next_tx(&mut scenario, TEST_USER);
            let ctx = test_scenario::ctx(&mut scenario);
            let storage = test_scenario::take_shared<EscrowStorage>(&mut scenario);

            let escrow = sand_dollar::create_escrow(1000, false, lbtc_coin, &storage, ctx);
            test_scenario::return_to_sender(&mut scenario, escrow);
            test_scenario::return_shared(storage);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 0)]
    fun test_create_escrow_zero_amount() {
        let mut scenario = test_scenario::begin(TEST_USER);
        let ctx = test_scenario::ctx(&mut scenario);

        // Create test coin
        let wbtc_coin = coin::mint_for_testing<SUI>(1000, ctx);

        // Initialize storage
        test_scenario::next_tx(&mut scenario, TEST_USER);
        let ctx = test_scenario::ctx(&mut scenario);
        sand_dollar::init(ctx);

        test_scenario::next_tx(&mut scenario, TEST_USER);
        let ctx = test_scenario::ctx(&mut scenario);
        let storage = test_scenario::take_shared<EscrowStorage>(&mut scenario);

        let escrow = sand_dollar::create_escrow(0, true, wbtc_coin, &storage, ctx);
        test_scenario::return_to_sender(&mut scenario, escrow);
        test_scenario::return_shared(storage);

        test_scenario::end(scenario);
    }
} 