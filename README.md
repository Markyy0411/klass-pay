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
| Contract ID | `CBN6RLE22FDPNL5AEO7OZVZ7S3FDOE4R4DUCT62ZAMIN4IO5RSJJFJ2H` |
| Network | testnet |
| Explorer | [View on stellar.expert](https://stellar.expert/explorer/testnet/contract/CBN6RLE22FDPNL5AEO7OZVZ7S3FDOE4R4DUCT62ZAMIN4IO5RSJJFJ2H) |
| Deploy Tx | [View transaction](https://stellar.expert/explorer/testnet/tx/a3453515b1520650f8ed9c7b2b45f7800f5484a8ee59a38160c59e07f187680c) |
| Deployed | 2026-06-26 07:12:11 UTC |
| Wallet | freighter (`GD5X…SUA6`) |

