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
| Contract ID | `CBRIH3HBATDNMNKFGTLJ3G3WBGP4DDQTHPX7NOIFZRXRNI75V3EPWWLG` |
| Network | testnet |
| Explorer | [View on stellar.expert](https://stellar.expert/explorer/testnet/contract/CBRIH3HBATDNMNKFGTLJ3G3WBGP4DDQTHPX7NOIFZRXRNI75V3EPWWLG) |
| Deploy Tx | [View transaction](https://stellar.expert/explorer/testnet/tx/52e9a7d19fc460d67829273b60bedef693274f8c129695c0ef96226e7b3fcd42) |
| Deployed | 2026-06-28 01:11:11 UTC |
| Wallet | freighter (`GC7P…DJEB`) |

