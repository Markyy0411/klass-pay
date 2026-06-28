# 💸 KlassPay

**Campus split billing for Filipino college students.**

KlassPay is a decentralized, trustless split-billing application built on Stellar's Soroban smart contracts. It automates group payments, eliminates the need for messy GCash screenshots, and ensures complete transparency for student organizations and group projects.

---

## 🚀 Level 5 Submission

### Product Improvements & User Feedback
- **User Feedback Summary**: We onboarded 50+ users and collected feedback via a Google Form. Users loved the clean interface and how easy it was to join a bill using the shareable link. The main request for future updates was to add fiat-to-crypto offramps directly into GCash.
- **New Feature Added**: Based directly on this user feedback, we implemented a **"Withdraw to GCash"** simulator button. This feature only appears to the Bill Organizer, and only after the bill has been fully settled. 
- **UX/UI Upgrades**: We also added beautiful Toast Notifications for key user interactions (like copying a shareable link or reaching a funding goal) to make the app feel much more premium.
- **Git Commit Link**: You can see the code for the new GCash offramp and UX improvements in this commit: [fd06588](https://github.com/Markyy0411/klass-pay/commit/fd06588)

### Required Links & Attachments
- **Pitch Deck**: [View on Canva](https://canva.link/au4fo5k0t0do5ew)
- **User Onboarding Data (50+ Users)**: [View Google Sheet Responses](https://docs.google.com/spreadsheets/d/1wVUU7dA9LYpTh3xD6160iHV0KXrAzl-5a9QBc02mbXk/edit?usp=sharing)
- **Live Demo (Vercel)**: [https://klass-pay.vercel.app](https://klass-pay.vercel.app)
- **Final Product Walkthrough Video**: [INSERT LOOM LINK HERE]

---

## 🚀 Core Features
- **Create Bills**: Organizers can initialize a target amount securely on the blockchain.
- **Pay Shares**: Anyone can connect their Freighter wallet and contribute to the bill.
- **Auto-Settlement**: The smart contract automatically marks the bill as settled once the target is reached, preventing overfunding.
- **Live Transparency**: Real-time progress tracking and payer tracking directly from the blockchain state.
- **Shareable Payment Links**: Instantly generate URL links (e.g. `/?bill=123456`) to securely onboard friends directly to a specific bill.

## 🛠 Tech Stack & Architecture
- **Smart Contract**: Rust (Stellar Soroban) - Multi-state dynamic mapping architecture.
- **Frontend**: React, TypeScript, Vite
- **Wallet Integration**: `@stellar/freighter-api`
- **Analytics**: `@vercel/analytics`
- **Network**: Stellar Testnet

---

## Deployed Contract

| Field | Value |
|-------|-------|
| Contract ID | `CBRIH3HBATDNMNKFGTLJ3G3WBGP4DDQTHPX7NOIFZRXRNI75V3EPWWLG` |
| Network | testnet |
| Explorer | [View on stellar.expert](https://stellar.expert/explorer/testnet/contract/CBRIH3HBATDNMNKFGTLJ3G3WBGP4DDQTHPX7NOIFZRXRNI75V3EPWWLG) |
| Deploy Tx | [View transaction](https://stellar.expert/explorer/testnet/tx/52e9a7d19fc460d67829273b60bedef693274f8c129695c0ef96226e7b3fcd42) |
| Deployed | 2026-06-28 01:11:11 UTC |
| Wallet | freighter (`GC7P…DJEB`) |

---

## 💻 How to Run Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- Rust and Cargo
- Soroban CLI
- Freighter Browser Extension (set to Testnet)

### 2. Clone the Repository
```bash
git clone https://github.com/Markyy0411/klass-pay.git
cd klass-pay/frontend
npm install
npm run dev
```

---

## 📸 Screenshots
<img width="1366" height="720" alt="image" src="https://github.com/user-attachments/assets/816514ae-bd14-4365-b75d-d62c3d8499a8" />
<img width="1366" height="720" alt="image" src="https://github.com/user-attachments/assets/fd39619c-b541-4a98-ba9b-cc4b9065088b" />
<img width="432" height="960" alt="image" src="https://github.com/user-attachments/assets/8f799471-c34e-4d92-97e0-0238ef022cc3" />
