# 💸 KlassPay

**Campus split billing for Filipino college students.**

KlassPay is a decentralized, trustless split-billing application built on Stellar's Soroban smart contracts. It automates group payments, eliminates the need for messy GCash screenshots, and ensures complete transparency for student organizations and group projects.

## 🚀 Features
- **Create Bills**: Organizers can initialize a target amount securely on the blockchain.
- **Pay Shares**: Anyone can connect their Freighter wallet and contribute to the bill.
- **Auto-Settlement**: The smart contract automatically marks the bill as settled once the target is reached, preventing overfunding.
- **Live Transparency**: Real-time progress tracking and payer tracking directly from the blockchain state.

## 🛠 Tech Stack
- **Smart Contract**: Rust (Stellar Soroban)
- **Frontend**: React, TypeScript, Vite
- **Wallet Integration**: `@stellar/freighter-api`
- **Network**: Stellar Testnet

---

## 💻 How to Run Locally

If you want to run this project locally, follow these steps:

### 1. Prerequisites
- Node.js (v18 or higher)
- Rust and Cargo
- Soroban CLI
- Freighter Browser Extension (set to Testnet)

### 2. Clone the Repository
```bash
git clone https://github.com/Markyy0411/klass-pay.git
cd klass-pay

## Deployed Contract

| Field | Value |
|-------|-------|
| Contract ID | `CDQVUENXMPWVLDOJKAW7U3VHDOCMACBIUC7E5TIDIJXEOB4TOKT4KXOE` |
| Network | testnet |
| Explorer | [View on stellar.expert](https://stellar.expert/explorer/testnet/contract/CDQVUENXMPWVLDOJKAW7U3VHDOCMACBIUC7E5TIDIJXEOB4TOKT4KXOE) |
| Deploy Tx | [View transaction](https://stellar.expert/explorer/testnet/tx/fc75e226a61f29715c5f8ec3cabe8889ef31bd23a9b9d2b5fae0f0f4a10c7b4c) |
| Deployed | 2026-06-26 13:54:01 UTC |
| Wallet | freighter (`GC7P…DJEB`) |

