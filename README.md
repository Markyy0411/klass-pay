# 💸 KlassPay

**Campus split billing for Filipino college students.**

KlassPay is a decentralized, trustless split-billing application built on Stellar's Soroban smart contracts. It automates group payments, eliminates the need for messy GCash screenshots, and ensures complete transparency for student organizations and group projects.

## 🚀 Features
- **Create Bills**: Organizers can initialize a target amount securely on the blockchain.
- **Pay Shares**: Anyone can connect their Freighter wallet and contribute to the bill.
- **Auto-Settlement**: The smart contract automatically marks the bill as settled once the target is reached, preventing overfunding.
- **Live Transparency**: Real-time progress tracking and payer tracking directly from the blockchain state.

## 🚀 Stage 4 Features (Production Ready)
- **Unlimited Scalability**: Re-architected the smart contract to use `env.storage().persistent()`, allowing unlimited users to create unlimited bills simultaneously.
- **Shareable Payment Links**: Instantly generate URL links (e.g. `/?bill=123456`) to securely onboard friends directly to a specific bill.
- **Real-Time Vercel Analytics**: Fully integrated tracking to monitor user acquisition, wallet interactions, and geographic traffic.
- **Mobile-Responsive Glassmorphism UI**: Beautiful, premium interface that perfectly scales to iPhone and Android devices.
- **Auto-Settlement**: The smart contract automatically locks the bill from further payments once the exact target is reached.


## 🛠 Tech Stack & Architecture
- **Smart Contract**: Rust (Stellar Soroban) - Multi-state dynamic mapping architecture.
- **Frontend**: React, TypeScript, Vite
- **Wallet Integration**: `@stellar/freighter-api`
- **Analytics**: `@vercel/analytics`
- **Network**: Stellar Testnet
---

## 🔗 Live Deployment & Demo
- **Live Demo (Vercel)**: [https://klass-pay.vercel.app](https://klass-pay.vercel.app)
- **Demo Video**: [Watch the 1-minute demo on Loom!](https://www.loom.com/share/0a42a274560b4959b9b140f6efb1ca58)

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
```

## Deployed Contract

| Field | Value |
|-------|-------|
| Contract ID | `CBRIH3HBATDNMNKFGTLJ3G3WBGP4DDQTHPX7NOIFZRXRNI75V3EPWWLG` |
| Network | testnet |
| Explorer | [View on stellar.expert](https://stellar.expert/explorer/testnet/contract/CBRIH3HBATDNMNKFGTLJ3G3WBGP4DDQTHPX7NOIFZRXRNI75V3EPWWLG) |
| Deploy Tx | [View transaction](https://stellar.expert/explorer/testnet/tx/52e9a7d19fc460d67829273b60bedef693274f8c129695c0ef96226e7b3fcd42) |
| Deployed | 2026-06-28 01:11:11 UTC |
| Wallet | freighter (`GC7P…DJEB`) |

## 👥 User Onboarding & Validation
- **10+ Real Users Onboarded**: We successfully tested KlassPay with real users across campus. *(See Vercel Analytics & Blockchain UI screenshots below).*
- **User Feedback Summary**: Users loved the clean interface and how easy it was to join a bill using the shareable link. The main request for future updates is to add fiat-to-crypto offramps directly into GCash.
---

## 📸 Screenshots
<img width="1366" height="720" alt="image" src="https://github.com/user-attachments/assets/816514ae-bd14-4365-b75d-d62c3d8499a8" />
<img width="1366" height="720" alt="image" src="https://github.com/user-attachments/assets/fd39619c-b541-4a98-ba9b-cc4b9065088b" />
<img width="432" height="960" alt="image" src="https://github.com/user-attachments/assets/8f799471-c34e-4d92-97e0-0238ef022cc3" />





