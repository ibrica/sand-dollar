#[test_only]
module sand_dollar::sand_dollar_tests;

use sand_dollar::sand_dollar::{Self, Escrow, EscrowNFT, TokenType};
use sui::coin::{Self, Coin};
use sui::test_scenario::{Self as test, Scenario};

// Test constants
const USER: address = @0xA;
const TEST_AMOUNT: u64 = 1000;

// Test helper function to create a test coin
fun create_test_coin(ctx: &mut TxContext): Coin<TokenType> {
    coin::mint_for_testing<TokenType>(TEST_AMOUNT, ctx)
}

// Test helper function to setup test scenario
fun setup_test(): Scenario {
    test::begin(USER)
}

#[test]
fun test_create_escrow_success() {
    let mut scenario = setup_test();

    // Create test coin
    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));

    // Create escrow
    sand_dollar::create_escrow_mint_nft(
        TEST_AMOUNT,
        &mut coin,
        test::ctx(&mut scenario),
    );

    // Verify coin was split
    assert!(coin::value(&coin) == 0, 0);

    coin::destroy_zero(coin);
    test::end(scenario);
}

#[test]
#[expected_failure(abort_code = sand_dollar::EInvalidAmount)]
fun test_create_escrow_zero_amount() {
    let mut scenario = setup_test();

    // Create test coin
    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));

    // Try to create escrow with zero amount
    sand_dollar::create_escrow_mint_nft(
        0,
        &mut coin,
        test::ctx(&mut scenario),
    );

    coin::destroy_zero(coin);
    test::end(scenario);
}

#[test]
fun test_redeem_escrow_success() {
    let mut scenario = setup_test();

    // Create test coin and escrow
    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));

    sand_dollar::create_escrow_mint_nft(
        TEST_AMOUNT,
        &mut coin,
        test::ctx(&mut scenario),
    );

    // Get the escrow NFT
    test::next_tx(&mut scenario, USER);
    let escrow_nft = test::take_from_address<EscrowNFT>(&scenario, USER);
    let mut escrow = test::take_shared<Escrow>(&scenario);

    // Redeem the escrow
    sand_dollar::redeem_escrow(
        escrow_nft,
        &mut escrow,
        test::ctx(&mut scenario),
    );

    coin::destroy_zero(coin);
    test::return_shared(escrow);
    test::end(scenario);
}

#[test]
fun test_create_escrow_with_lbtc() {
    let mut scenario = setup_test();

    // Create test coin
    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));

    // Create escrow with LBTC
    sand_dollar::create_escrow_mint_nft(
        TEST_AMOUNT,
        &mut coin,
        test::ctx(&mut scenario),
    );

    // Verify coin was split
    assert!(coin::value(&coin) == 0, 0);
    coin::destroy_zero(coin);

    test::end(scenario);
}
