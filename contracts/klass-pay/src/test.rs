#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::Env;

fn setup() -> (Env, SplitPayContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(SplitPayContract, ());
    let client = SplitPayContractClient::new(&env, &contract_id);
    (env, client)
}

#[test]
fn test_happy_path() {
    let (env, client) = setup();
    let organizer = Address::generate(&env);

    client.create(&organizer, &100);
    client.pay(&Address::generate(&env), &40);

    let bill = client.get();
    assert_eq!(bill.organizer, organizer);
    assert_eq!(bill.target, 100);
    assert_eq!(bill.funded, 40);
    assert_eq!(bill.settled, false);
    assert_eq!(bill.payers, 1);
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn test_zero_amount_rejected() {
    let (env, client) = setup();
    let organizer = Address::generate(&env);

    client.create(&organizer, &0);
}

#[test]
fn test_state_persists_two_pays() {
    let (env, client) = setup();
    let organizer = Address::generate(&env);

    client.create(&organizer, &100);
    client.pay(&Address::generate(&env), &30);
    client.pay(&Address::generate(&env), &25);

    let bill = client.get();
    assert_eq!(bill.funded, 55);
    assert_eq!(bill.payers, 2);
    assert_eq!(bill.settled, false);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_overfunding_rejected() {
    let (env, client) = setup();
    let organizer = Address::generate(&env);

    client.create(&organizer, &50);
    client.pay(&Address::generate(&env), &51);
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn test_cannot_pay_after_settled() {
    let (env, client) = setup();
    let organizer = Address::generate(&env);

    client.create(&organizer, &10);
    client.pay(&Address::generate(&env), &10);

    let bill = client.get();
    assert_eq!(bill.settled, true);

    // This pay should fail because the bill is already settled
    client.pay(&Address::generate(&env), &1);
}