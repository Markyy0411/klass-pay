#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env, panic_with_error, Vec};

/// Bill information stored on-chain.
#[contracttype]
#[derive(Clone)]
pub struct BillInfo {
    pub organizer: Address,
    pub target: u32,
    pub funded: u32,
    pub settled: bool,
    pub payers: Vec<Address>,
}

/// Contract error codes.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInit = 1,
    NotFound = 2,
    Overfund = 3,
    AlreadySettled = 4,
    ZeroAmount = 5,
}

#[contract]
pub struct SplitPayContract;

#[contractimpl]
impl SplitPayContract {
    pub fn create(env: Env, organizer: Address, bill_id: u32, amount: u32) {
        organizer.require_auth();

        if amount == 0 {
            panic_with_error!(&env, Error::ZeroAmount);
        }

        // Check if this specific bill ID already exists
        if env.storage().persistent().has(&bill_id) {
            panic_with_error!(&env, Error::AlreadyInit);
        }

        let bill = BillInfo {
            organizer,
            target: amount,
            funded: 0,
            settled: false,
            payers: Vec::new(&env),
        };

        env.storage().persistent().set(&bill_id, &bill);
        env.storage().persistent().extend_ttl(&bill_id, 500, 1000);
    }

    pub fn pay(env: Env, payer: Address, bill_id: u32, amount: u32) {
        payer.require_auth();

        if amount == 0 {
            panic_with_error!(&env, Error::ZeroAmount);
        }

        let mut bill: BillInfo = env
            .storage()
            .persistent()
            .get(&bill_id)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));

        if bill.settled {
            panic_with_error!(&env, Error::AlreadySettled);
        }

        if bill.funded + amount > bill.target {
            panic_with_error!(&env, Error::Overfund);
        }

        bill.funded += amount;
        
        // Add payer to the list if they aren't already in it
        if !bill.payers.contains(&payer) {
            bill.payers.push_back(payer);
        }

        if bill.funded == bill.target {
            bill.settled = true;
        }

        env.storage().persistent().set(&bill_id, &bill);
        env.storage().persistent().extend_ttl(&bill_id, 500, 1000);
    }

    pub fn get(env: Env, bill_id: u32) -> BillInfo {
        env.storage()
            .persistent()
            .get(&bill_id)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound))
    }
}

#[cfg(test)]
mod test {
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
        client.create(&organizer, &1, &100);
        client.pay(&Address::generate(&env), &1, &40);
        let bill = client.get(&1);
        assert_eq!(bill.organizer, organizer);
        assert_eq!(bill.target, 100);
        assert_eq!(bill.funded, 40);
        assert_eq!(bill.settled, false);
        assert_eq!(bill.payers.len(), 1);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #5)")]
    fn test_zero_amount_rejected() {
        let (env, client) = setup();
        let organizer = Address::generate(&env);
        client.create(&organizer, &1, &0);
    }

    #[test]
    fn test_state_persists_two_pays() {
        let (env, client) = setup();
        let organizer = Address::generate(&env);
        client.create(&organizer, &2, &100);
        client.pay(&Address::generate(&env), &2, &30);
        client.pay(&Address::generate(&env), &2, &25);
        let bill = client.get(&2);
        assert_eq!(bill.funded, 55);
        assert_eq!(bill.payers.len(), 2);
    }
}