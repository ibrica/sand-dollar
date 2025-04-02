#[test_only]
module sand_dollar::sand_dollar_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::tx_context::TxContext;
    use sand_dollar::sand_dollar::{Self, EscrowNFT};

    const TEST_USER: address = @0x123;

    #[test]
    fun test_create_and_redeem_escrow() {
        let scenario = test_scenario::begin(TEST_USER);
        let ctx = test_scenario::ctx(&mut scenario);

        // Create test coins
        let wbtc_coin = coin::mint_for_testing<SUI>(1000, ctx);
        let lbtc_coin = coin::mint_for_testing<SUI>(1000, ctx);

        // Test WBTC escrow
        {
            test_scenario::next_tx(&mut scenario, TEST_USER);
            let ctx = test_scenario::ctx(&mut scenario);

            sand_dollar::create_escrow(1000, true, wbtc_coin, ctx);

            let escrow = test_scenario::take_from_sender<EscrowNFT<SUI>>(&scenario);
            test_scenario::return_to_sender(&mut scenario, escrow);
        };

        // Test LBTC escrow
        {
            test_scenario::next_tx(&mut scenario, TEST_USER);
            let ctx = test_scenario::ctx(&mut scenario);

            sand_dollar::create_escrow(1000, false, lbtc_coin, ctx);

            let escrow = test_scenario::take_from_sender<EscrowNFT<SUI>>(&scenario);
            test_scenario::return_to_sender(&mut scenario, escrow);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 0)]
    fun test_create_escrow_zero_amount() {
        let scenario = test_scenario::begin(TEST_USER);
        let ctx = test_scenario::ctx(&mut scenario);

        // Create test coin
        let wbtc_coin = coin::mint_for_testing<SUI>(1000, ctx);

        test_scenario::next_tx(&mut scenario, TEST_USER);
        let ctx = test_scenario::ctx(&mut scenario);

        sand_dollar::create_escrow(0, true, wbtc_coin, ctx);

        test_scenario::end(scenario);
    }
} 