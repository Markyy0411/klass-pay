#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, contracterror, symbol_short, Address, Env, panic_with_error, Vec};

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
    pub fn create(env: Env, organizer: Address, amount: u32) {
        organizer.require_auth();

        if amount == 0 {
            panic_with_error!(&env, Error::ZeroAmount);
        }

        if env.storage().instance().has(&symbol_short!("BILL")) {
            panic_with_error!(&env, Error::AlreadyInit);
        }

        let bill = BillInfo {
            organizer,
            target: amount,
            funded: 0,
            settled: false,
            payers: Vec::new(&env),
        };

        env.storage().instance().set(&symbol_short!("BILL"), &bill);
        env.storage().instance().extend_ttl(50, 100);
    }

    pub fn pay(env: Env, payer: Address, amount: u32) {
        payer.require_auth();

        if amount == 0 {
            panic_with_error!(&env, Error::ZeroAmount);
        }

        let mut bill: BillInfo = env
            .storage()
            .instance()
            .get(&symbol_short!("BILL"))
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

        env.storage().instance().set(&symbol_short!("BILL"), &bill);
        env.storage().instance().extend_ttl(50, 100);
    }

    pub fn get(env: Env) -> BillInfo {
        env.storage()
            .instance()
            .get(&symbol_short!("BILL"))
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound))
    }
}