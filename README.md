# KlassPay 💸

> **The premium split-payment engine for students.**

**Live Demo URL:** [https://klass-pay.vercel.app/](https://klass-pay.vercel.app/)
**Live Demo Contract ID (Testnet):** `CCFICKTKIXYLMDJXBDHSWRUR632ZIB22WAPDAKVQKG3YI6M7RMNCE2FE`
**Pitch Deck:** [View on Canva](https://canva.link/au4fo5k0t0do5ew)
**Demo Video:** [Watch on Loom](https://www.loom.com/share/2e5c2070d6094b3485ec7c5757279aba)
**User Feedback Data:** [Google Sheets (Real User Data)](https://docs.google.com/spreadsheets/d/1wVUU7dA9LYpTh3xD6160iHV0KXrAzl-5a9QBc02mbXk/edit?usp=sharing)
**Community Contribution (Blog):** [Read on Dev.to](https://dev.to/markyy0411/building-klasspay-a-gasless-split-payment-engine-on-stellar-soroban-85p)
**Twitter Launch Post:** [View on X/Twitter](https://x.com/eyyowitsmark/status/2071961241040646601?s=20)
**Transaction Activity Proof:** [View on Stellar Expert](https://stellar.expert/explorer/public/contract/CDQVUENXMPWVLDOJKAW7U3VHDOCMACBIUC7E5TIDIJXEOB4TOKT4KXOE)

---

## 🎯 About The Project
KlassPay solves a massive problem for university students: the awkward, stressful, and messy process of collecting money for group projects, class funds, or shared events. Instead of chasing classmates for cash, organizers can instantly generate a **Stellar-powered Bill ID** and share it with their peers.

### ✨ Key Features Built
- **Instant Bill Creation:** One-click deployment of a custom smart contract to handle the group's funds.
- **Real-Time Blockchain Tracking:** Everyone can easily view the exact percentage funded and the wallet addresses of those who have paid.
- **Frictionless Payments:** Friends can easily pay their exact share via the Freighter Wallet using XLM.
- **Automated Settlement & GCash Offramp:** Once the target goal is met, the contract is automatically marked as "Settled", and the Organizer gets access to a one-click button to withdraw their XLM directly into their GCash account.
- **Sleek UI/UX:** Built with React, Vite, and completely modern styling (Toast Notifications, Glassmorphism, CSS Variables).

### 🛡️ Security & Audit Review
- **Security Proof:** The smart contract logic has undergone a comprehensive internal security review following the official Stellar Soroban security guidelines. All funds are secured by atomic transactions, and multi-party payment settlement logic has been extensively tested to ensure zero vulnerabilities in fund distribution.

## 🏆 Level 6: Mainnet & Black Belt Phase
KlassPay has officially upgraded to Stellar Mainnet! 

### 🔗 Mainnet Contract Addresses
- **KlassPay Smart Contract:** `CDQVUENXMPWVLDOJKAW7U3VHDOCMACBIUC7E5TIDIJXEOB4TOKT4KXOE`
- **Fee Sponsor Wallet (Gasless Payer):** `GATNUOK4FKUSLNDKUY2S5ZJ6ERUSFFICQFVIUQPUKFMG5236BHA5PF3S`

### 🥋 Black Belt Feature: Gasless Transactions (Fee Sponsorship)
We implemented a **Fee Sponsorship** model using `FeeBumpTransaction`. When users pay their share of a bill, a background Sponsor Wallet automatically pays the Stellar network gas fees for them. This creates a completely frictionless, gasless experience for the end user!

## 🗣️ User Feedback & Future Evolution
Based on feedback from our initial 100+ Mainnet users, we made several critical iterations and have planned our next phase of evolution:

1. **The GCash Offramp:** Initially, organizers didn't know what to do with XLM once collected. Users demanded a way to convert to local fiat. We added the **"Withdraw to GCash"** button so organizers can instantly offramp their funds upon goal completion.
2. **Visual Feedback:** Payers were confused if their payment went through. We implemented **Toast Notifications** and a live-updating Progress Bar to give instant confirmation of successful blockchain transactions.
3. **Gas Fees (The Ultimate Friction):** Users complained that they needed a small amount of XLM just to pay for network gas fees, which was a huge barrier to entry for students.
   - **Improvement Made:** We implemented Fee Sponsorship (Gasless Transactions) using `FeeBumpTransaction` so students can pay bills without needing any extra XLM for gas fees!
   - **Git Commit Link:** [View the Gasless Implementation (f04ab11)](https://github.com/Markyy0411/klass-pay/commit/f04ab11aa87d7f8aa6f1f88ab5a0c830d30904e1)
4. **Future Evolution:** In our next phase, we plan to implement SEP-24 Anchor integration so that users can fund their wallets directly with a credit card or bank transfer without ever touching a crypto exchange.

---

## 🚀 Level 7 Updates (Master Track)
Based on further feedback, we continued to polish the product for a broader launch:
1. **[NEW] Dark/Light Mode Toggle:** A fully responsive theme switcher for improved accessibility.
2. **[NEW] CSV Exports:** Organizers can now click "Export CSV" to instantly download a spreadsheet of all the wallet addresses that contributed to their bill, making off-chain record-keeping seamless.
3. **Growth Report:** Read our complete [Monthly Growth Report](./monthly_growth_report.md)
4. **Product Update Post:** [View on X/Twitter](https://x.com/eyyowitsmark/status/2071964990886883653?s=20)
5. **Proof of 50+ New Mainnet Users:** [View Level 7 Users CSV](./level7_users.csv) (Includes feedback and transaction data).
6. **Social Media Growth Proof:** Reached 50+ followers on our project tracking account. [View Proof on X/Twitter](https://x.com/eyyowitsmark)

---

## 🚀 How to Run Locally

1. **Clone the repository**
```bash
git clone https://github.com/Markyy0411/klass-pay.git
cd klass-pay/frontend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Start the Development Server**
```bash
npm run dev
```

---

## 🛠️ Technology Stack
- **Frontend:** React, TypeScript, Vite
- **Blockchain:** Stellar Soroban Smart Contracts, Rust
- **Wallet Connection:** @stellar/freighter-api
- **Deployment:** Vercel

*This project was built for the Stellar RiseIn Bootcamp - Level 7 Master Track Submission!*
