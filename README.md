# KlassPay 💸

> **The premium split-payment engine for students.**

**Live Demo URL:** [https://klass-pay.vercel.app/](https://klass-pay.vercel.app/)
**Pitch Deck:** [View on Canva](https://canva.link/au4fo5k0t0do5ew)
**Demo Video:** [Watch on Loom](https://www.loom.com/share/2e5c2070d6094b3485ec7c5757279aba)
**User Feedback Data:** [Google Sheets (Real User Data)](https://docs.google.com/spreadsheets/d/1wVUU7dA9LYpTh3xD6160iHV0KXrAzl-5a9QBc02mbXk/edit?usp=sharing)

---

## 🎯 About The Project
KlassPay solves a massive problem for university students: the awkward, stressful, and messy process of collecting money for group projects, class funds, or shared events. Instead of chasing classmates for cash, organizers can instantly generate a **Stellar-powered Bill ID** and share it with their peers.

### ✨ Key Features Built
- **Instant Bill Creation:** One-click deployment of a custom smart contract to handle the group's funds.
- **Real-Time Blockchain Tracking:** Everyone can easily view the exact percentage funded and the wallet addresses of those who have paid.
- **Frictionless Payments:** Friends can easily pay their exact share via the Freighter Wallet using XLM.
- **Automated Settlement & GCash Offramp:** Once the target goal is met, the contract is automatically marked as "Settled", and the Organizer gets access to a one-click button to withdraw their XLM directly into their GCash account.
- **Sleek UI/UX:** Built with React, Vite, and completely modern styling (Toast Notifications, Glassmorphism, CSS Variables).

## 🗣️ User Feedback Iteration Summary
Based on feedback from our initial pilot users, we made several critical iterations:
1. **The GCash Offramp:** Initially, organizers didn't know what to do with XLM once collected. Users demanded a way to convert to local fiat. We added the **"Withdraw to GCash"** button so organizers can instantly offramp their funds upon goal completion.
2. **Visual Feedback:** Payers were confused if their payment went through. We implemented **Toast Notifications** and a live-updating Progress Bar to give instant confirmation of successful blockchain transactions.
3. **Shareability:** Users didn't want to explain how to find the bill. We added a **Copy Link** button that generates a direct URL (e.g., `/?bill=123456`) that auto-loads the specific bill for friends to pay immediately.

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

*This project was built for the Stellar RiseIn Bootcamp - Level 5 Submission!*
