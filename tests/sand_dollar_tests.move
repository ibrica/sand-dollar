#[test_only]
module sand_dollar::sand_dollar_tests {
    use sui::test_scenario::{Self};
    use sand_dollar::sand_dollar::{Self, EscrowNFT};

    const USER: address = @0xA;

    #[test]
    fun test_create_wbtc_escrow() {
        let scenario = test_scenario::begin(USER);
        test_scenario::next_tx(&mut scenario, USER);
        {
            sand_dollar::create_escrow(1000, true, test_scenario::ctx(&mut scenario));
        };
        test_scenario::end(scenario);
    }

    #[test]
    fun test_create_lbtc_escrow() {
        let scenario = test_scenario::begin(USER);
        test_scenario::next_tx(&mut scenario, USER);
        {
            sand_dollar::create_escrow(1000, false, test_scenario::ctx(&mut scenario));
        };
        test_scenario::end(scenario);
    }

    #[test]
    fun test_redeem_wbtc_escrow() {
        let scenario = test_scenario::begin(USER);
        
        // First transaction: Create escrow
        test_scenario::next_tx(&mut scenario, USER);
        {
            sand_dollar::create_escrow(1000, true, test_scenario::ctx(&mut scenario));
        };
        
        // Second transaction: Redeem escrow
        test_scenario::next_tx(&mut scenario, USER);
        {
            let escrow = test_scenario::take_from_sender<EscrowNFT>(&scenario);
            sand_dollar::redeem_escrow(escrow, test_scenario::ctx(&mut scenario));
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_redeem_lbtc_escrow() {
        let scenario = test_scenario::begin(USER);
        
        // First transaction: Create escrow
        test_scenario::next_tx(&mut scenario, USER);
        {
            sand_dollar::create_escrow(1000, false, test_scenario::ctx(&mut scenario));
        };
        
        // Second transaction: Redeem escrow
        test_scenario::next_tx(&mut scenario, USER);
        {
            let escrow = test_scenario::take_from_sender<EscrowNFT>(&scenario);
            sand_dollar::redeem_escrow(escrow, test_scenario::ctx(&mut scenario));
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 0)]
    fun test_create_escrow_with_zero_amount() {
        let scenario = test_scenario::begin(USER);
        test_scenario::next_tx(&mut scenario, USER);
        {
            sand_dollar::create_escrow(0, true, test_scenario::ctx(&mut scenario));
        };
        test_scenario::end(scenario);
    }
} 