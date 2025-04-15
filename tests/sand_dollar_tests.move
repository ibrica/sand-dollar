#[test_only]
module sand_dollar::sand_dollar_tests;

use sand_dollar::sand_dollar::{Self, Escrow, EscrowNFT};
use sui::clock;
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::test_scenario::{Self as test, Scenario, EEmptyInventory};

public struct DummyNFT has key, store {
    id: UID,
}

const USER: address = @0xA;
const TEST_AMOUNT: u64 = 1000;
const LOCK_PERIOD: u64 = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

fun create_test_coin(ctx: &mut TxContext): Coin<SUI> {
    coin::mint_for_testing<SUI>(TEST_AMOUNT, ctx)
}

fun create_test_dummy_nft(ctx: &mut TxContext): DummyNFT {
    DummyNFT { id: object::new(ctx) }
}

fun setup_test(): Scenario {
    test::begin(USER)
}

#[test]
fun test_create_escrow_success() {
    let mut scenario = setup_test();

    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));
    let escrow_coin = coin::split(&mut coin, TEST_AMOUNT, test::ctx(&mut scenario));
    let clock = clock::create_for_testing(test::ctx(&mut scenario));

    sand_dollar::create_escrow_mint_nft(
        escrow_coin,
        0, // YieldProvider::None
        &clock,
        test::ctx(&mut scenario),
    );

    assert!(coin::value(&coin) == 0, 0);

    coin::destroy_zero(coin);
    clock::destroy_for_testing(clock);
    test::end(scenario);
}

#[test]
#[expected_failure(abort_code = sand_dollar::EInvalidAmount)]
fun test_create_escrow_zero_amount() {
    let mut scenario = setup_test();

    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));
    let escrow_coin = coin::split(&mut coin, 0, test::ctx(&mut scenario));
    let clock = clock::create_for_testing(test::ctx(&mut scenario));

    sand_dollar::create_escrow_mint_nft(
        escrow_coin,
        0,
        &clock,
        test::ctx(&mut scenario),
    );

    coin::destroy_zero(coin);
    clock::destroy_for_testing(clock);
    test::end(scenario);
}

#[test]
fun test_redeem_escrow() {
    let mut scenario = setup_test();

    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));
    let escrow_coin = coin::split(&mut coin, TEST_AMOUNT, test::ctx(&mut scenario));
    let mut clock = clock::create_for_testing(test::ctx(&mut scenario));

    sand_dollar::create_escrow_mint_nft(
        escrow_coin,
        0,
        &clock,
        test::ctx(&mut scenario),
    );

    test::next_tx(&mut scenario, USER);
    let escrow_nft = test::take_from_address<EscrowNFT>(&scenario, USER);
    let mut escrow = test::take_shared<Escrow<SUI>>(&scenario);

    // Create a new clock for redemption attempt
    clock::increment_for_testing(&mut clock, 1000 + LOCK_PERIOD + 1);

    sand_dollar::redeem_escrow(
        escrow_nft,
        &mut escrow,
        &clock,
        test::ctx(&mut scenario),
    );

    coin::destroy_zero(coin);
    clock::destroy_for_testing(clock);
    test::return_shared(escrow);
    test::end(scenario);
}

#[test]
fun test_create_escrow_with_lbtc() {
    let mut scenario = setup_test();

    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));
    let escrow_coin = coin::split(&mut coin, TEST_AMOUNT, test::ctx(&mut scenario));
    let clock = clock::create_for_testing(test::ctx(&mut scenario));

    sand_dollar::create_escrow_mint_nft(
        escrow_coin,
        0,
        &clock,
        test::ctx(&mut scenario),
    );

    assert!(coin::value(&coin) == 0, 0);
    coin::destroy_zero(coin);
    clock::destroy_for_testing(clock);

    test::end(scenario);
}

#[test]
fun test_create_escrow_with_existing_nft() {
    let mut scenario = setup_test();

    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));
    let escrow_coin = coin::split(&mut coin, TEST_AMOUNT, test::ctx(&mut scenario));
    let clock = clock::create_for_testing(test::ctx(&mut scenario));

    let dummy_nft = create_test_dummy_nft(test::ctx(&mut scenario));

    sand_dollar::create_escrow_with_nft(
        escrow_coin,
        dummy_nft,
        0,
        &clock,
        test::ctx(&mut scenario),
    );

    assert!(coin::value(&coin) == 0, 0);
    coin::destroy_zero(coin);
    clock::destroy_for_testing(clock);

    test::end(scenario);
}

#[test]
fun test_redeem_escrow_with_existing_nft() {
    let mut scenario = setup_test();
    let dummy_nft = create_test_dummy_nft(test::ctx(&mut scenario));

    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));
    let escrow_coin = coin::split(&mut coin, TEST_AMOUNT, test::ctx(&mut scenario));
    let mut clock = clock::create_for_testing(test::ctx(&mut scenario));

    sand_dollar::create_escrow_with_nft(
        escrow_coin,
        dummy_nft,
        0,
        &clock,
        test::ctx(&mut scenario),
    );

    test::next_tx(&mut scenario, USER);
    let dummy_nft = test::take_from_address<DummyNFT>(&scenario, USER);
    let mut escrow = test::take_shared<Escrow<SUI>>(&scenario);

    clock::increment_for_testing(&mut clock, 1000 + LOCK_PERIOD + 1);

    sand_dollar::redeem_escrow(
        dummy_nft,
        &mut escrow,
        &clock,
        test::ctx(&mut scenario),
    );

    coin::destroy_zero(coin);
    clock::destroy_for_testing(clock);
    test::return_shared(escrow);
    test::end(scenario);
}

#[test]
#[expected_failure(abort_code = EEmptyInventory)]
fun test_burn_escrow_nft() {
    let mut scenario = setup_test();

    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));
    let escrow_coin = coin::split(&mut coin, TEST_AMOUNT, test::ctx(&mut scenario));
    let clock = clock::create_for_testing(test::ctx(&mut scenario));

    sand_dollar::create_escrow_mint_nft(
        escrow_coin,
        0,
        &clock,
        test::ctx(&mut scenario),
    );

    test::next_tx(&mut scenario, USER);
    let escrow_nft = test::take_from_address<EscrowNFT>(&scenario, USER);

    sand_dollar::burn_escrow_nft(escrow_nft);

    test::next_tx(&mut scenario, USER);
    let burned_nft = test::take_from_address<EscrowNFT>(&scenario, USER); // This should fail with EEmptyInventory

    test::return_to_address(USER, burned_nft);

    coin::destroy_zero(coin);
    clock::destroy_for_testing(clock);
    test::end(scenario);
}

#[test]
#[expected_failure(abort_code = sand_dollar::ELockedEscrow)]
fun test_redeem_escrow_before_lock_expiry() {
    let mut scenario = setup_test();

    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));
    let escrow_coin = coin::split(&mut coin, TEST_AMOUNT, test::ctx(&mut scenario));
    let mut clock = clock::create_for_testing(test::ctx(&mut scenario));

    sand_dollar::create_escrow_mint_nft(
        escrow_coin,
        0,
        &clock,
        test::ctx(&mut scenario),
    );

    test::next_tx(&mut scenario, USER);
    let escrow_nft = test::take_from_address<EscrowNFT>(&scenario, USER);
    let mut escrow = test::take_shared<Escrow<SUI>>(&scenario);

    clock::increment_for_testing(&mut clock, 100_000);
    // This should fail with ELockedEscrow
    sand_dollar::redeem_escrow(
        escrow_nft,
        &mut escrow,
        &clock,
        test::ctx(&mut scenario),
    );

    coin::destroy_zero(coin);
    clock::destroy_for_testing(clock);
    test::return_shared(escrow);
    test::end(scenario);
}

#[test]
fun test_redeem_escrow_after_lock_expiry() {
    let mut scenario = setup_test();

    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));
    let escrow_coin = coin::split(&mut coin, TEST_AMOUNT, test::ctx(&mut scenario));
    let mut clock = clock::create_for_testing(test::ctx(&mut scenario));

    sand_dollar::create_escrow_mint_nft(
        escrow_coin,
        0,
        &clock,
        test::ctx(&mut scenario),
    );

    test::next_tx(&mut scenario, USER);
    let escrow_nft = test::take_from_address<EscrowNFT>(&scenario, USER);
    let mut escrow = test::take_shared<Escrow<SUI>>(&scenario);

    clock::increment_for_testing(&mut clock, 1000 + LOCK_PERIOD + 1);

    // Try to redeem the escrow (should succeed as lock has expired)
    sand_dollar::redeem_escrow(
        escrow_nft,
        &mut escrow,
        &clock,
        test::ctx(&mut scenario),
    );

    coin::destroy_zero(coin);
    clock::destroy_for_testing(clock);
    test::return_shared(escrow);
    test::end(scenario);
}

#[test]
#[expected_failure(abort_code = sand_dollar::EInvalidEscrow)]
fun test_redeem_escrow_wrong_nft() {
    let mut scenario = setup_test();

    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));
    let escrow_coin = coin::split(&mut coin, TEST_AMOUNT, test::ctx(&mut scenario));
    let clock = clock::create_for_testing(test::ctx(&mut scenario));

    sand_dollar::create_escrow_mint_nft(
        escrow_coin,
        0,
        &clock,
        test::ctx(&mut scenario),
    );

    test::next_tx(&mut scenario, USER);
    let mut escrow = test::take_shared<Escrow<SUI>>(&scenario);

    let wrong_nft = create_test_dummy_nft(test::ctx(&mut scenario));

    // Try to redeem with wrong NFT
    sand_dollar::redeem_escrow(
        wrong_nft,
        &mut escrow,
        &clock,
        test::ctx(&mut scenario),
    );

    coin::destroy_zero(coin);
    clock::destroy_for_testing(clock);
    test::return_shared(escrow);
    test::end(scenario);
}

#[test]
#[expected_failure(abort_code = sand_dollar::EInactiveEscrow)]
fun test_redeem_escrow_inactive() {
    let mut scenario = setup_test();

    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));
    let escrow_coin = coin::split(&mut coin, TEST_AMOUNT, test::ctx(&mut scenario));
    let mut clock = clock::create_for_testing(test::ctx(&mut scenario));

    sand_dollar::create_escrow_mint_nft(
        escrow_coin,
        0,
        &clock,
        test::ctx(&mut scenario),
    );

    test::next_tx(&mut scenario, USER);
    let escrow_nft = test::take_from_address<EscrowNFT>(&scenario, USER);
    let mut escrow = test::take_shared<Escrow<SUI>>(&scenario);

    // Advance clock past lock period
    clock::increment_for_testing(&mut clock, LOCK_PERIOD + 1);

    // First redemption to make escrow inactive
    sand_dollar::redeem_escrow(
        escrow_nft,
        &mut escrow,
        &clock,
        test::ctx(&mut scenario),
    );

    test::next_tx(&mut scenario, USER);

    let escrow_nft_after = test::take_from_address<EscrowNFT>(&scenario, USER);

    // Try to redeem again (should fail as escrow is inactive)
    sand_dollar::redeem_escrow(
        escrow_nft_after,
        &mut escrow,
        &clock,
        test::ctx(&mut scenario),
    );

    coin::destroy_zero(coin);
    clock::destroy_for_testing(clock);
    test::return_shared(escrow);
    test::end(scenario);
}

#[test]
#[expected_failure(abort_code = sand_dollar::EInvalidSender)]
fun test_redeem_escrow_wrong_sender() {
    let mut scenario = setup_test();

    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));
    let escrow_coin = coin::split(&mut coin, TEST_AMOUNT, test::ctx(&mut scenario));
    let mut clock = clock::create_for_testing(test::ctx(&mut scenario));

    sand_dollar::create_escrow_mint_nft(
        escrow_coin,
        0,
        &clock,
        test::ctx(&mut scenario),
    );

    test::next_tx(&mut scenario, USER);
    let escrow_nft = test::take_from_address<EscrowNFT>(&scenario, USER);
    let mut escrow = test::take_shared<Escrow<SUI>>(&scenario);

    clock::increment_for_testing(&mut clock, LOCK_PERIOD + 1);

    // Try to redeem with a different sender
    test::next_tx(&mut scenario, @0xB);
    sand_dollar::redeem_escrow(
        escrow_nft,
        &mut escrow,
        &clock,
        test::ctx(&mut scenario),
    );

    coin::destroy_zero(coin);
    clock::destroy_for_testing(clock);
    test::return_shared(escrow);
    test::end(scenario);
}

#[test]
#[expected_failure(abort_code = sand_dollar::EInvalidYieldProvider)]
fun test_create_escrow_invalid_yield_provider() {
    let mut scenario = setup_test();

    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));
    let escrow_coin = coin::split(&mut coin, TEST_AMOUNT, test::ctx(&mut scenario));
    let clock = clock::create_for_testing(test::ctx(&mut scenario));

    // Try to create escrow with invalid yield provider value
    sand_dollar::create_escrow_mint_nft(
        escrow_coin,
        2, // Invalid yield provider value
        &clock,
        test::ctx(&mut scenario),
    );

    coin::destroy_zero(coin);
    clock::destroy_for_testing(clock);
    test::end(scenario);
}

#[test]
fun test_create_escrow_with_navi_yield_provider() {
    let mut scenario = setup_test();

    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));
    let escrow_coin = coin::split(&mut coin, TEST_AMOUNT, test::ctx(&mut scenario));
    let clock = clock::create_for_testing(test::ctx(&mut scenario));

    sand_dollar::create_escrow_mint_nft(
        escrow_coin,
        1, // YieldProvider::Navi
        &clock,
        test::ctx(&mut scenario),
    );

    assert!(coin::value(&coin) == 0, 0);

    coin::destroy_zero(coin);
    clock::destroy_for_testing(clock);
    test::end(scenario);
}

#[test]
fun test_create_escrow_with_none_yield_provider() {
    let mut scenario = setup_test();

    test::next_tx(&mut scenario, USER);
    let mut coin = create_test_coin(test::ctx(&mut scenario));
    let escrow_coin = coin::split(&mut coin, TEST_AMOUNT, test::ctx(&mut scenario));
    let clock = clock::create_for_testing(test::ctx(&mut scenario));

    sand_dollar::create_escrow_mint_nft(
        escrow_coin,
        0,
        &clock,
        test::ctx(&mut scenario),
    );

    assert!(coin::value(&coin) == 0, 0);

    coin::destroy_zero(coin);
    clock::destroy_for_testing(clock);
    test::end(scenario);
}
