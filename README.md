# Anonymous Event Check-in on Midnight Network (Level 3)

[![CI/CD Pipeline](https://github.com/saikattanti/anonymous-event-checkin-v2/actions/workflows/ci.yml/badge.svg)](https://github.com/saikattanti/anonymous-event-checkin-v2/actions/workflows/ci.yml)
[![Midnight Network](https://img.shields.io/badge/Network-Midnight_Preprod-6b21a8.svg)](https://preprod.midnightexplorer.com)
[![Compact Language](https://img.shields.io/badge/Language-Compact_0.23-blue.svg)](https://midnight.network)
[![Tests Passing](https://img.shields.io/badge/Tests-10%2F10_Passing-emerald.svg)](https://github.com/saikattanti/anonymous-event-checkin-v2)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=flat-square&logo=vercel)](https://anonymous-event-checkin.vercel.app/)
[![Demo Video](https://img.shields.io/badge/Demo_Video-YouTube-FF0000?style=flat-square&logo=youtube)](https://youtu.be/gnPuRBhZtxc)

## Level 3 — Full-Stack DApp on Preprod

Level 3 delivered a working Compact contract, local unit tests, CI/CD pipeline, and a Preprod deployment with documented privacy behavior.

📄 **Product Proposal**: [PROPOSAL.md](PROPOSAL.md)
🎥 **1-Minute DApp Demo Video**: [https://youtu.be/gnPuRBhZtxc](https://youtu.be/gnPuRBhZtxc)
🌐 **Live Web Application**: [https://anonymous-event-checkin.vercel.app/](https://anonymous-event-checkin.vercel.app/)

---

## 📋 Submission Checklist & Requirement Audit

| Requirement / Checklist Item | Status | Verification Detail |
| --- | --- | --- |
| **Fully Functional Privacy DApp** | ✅ **PASSED** | Deployed `checkin.compact` with public check-in counts & private invite logic |
| **Minimum 3 Tests Passing** | ✅ **PASSED (10/10)** | `tests/contract.test.ts` & `tests/network.test.ts` |
| **CI/CD Pipeline Running** | ✅ **PASSED** | `.github/workflows/ci.yml` GitHub Actions workflow & status badge |
| **Approved Idea from Idea List** | ✅ **PASSED** | Anonymous Event Check-in System |
| **Minimum 10 Meaningful Commits** | ✅ **PASSED** | 26+ structured git commits |
| **Public GitHub Repository & README** | ✅ **PASSED** | https://github.com/saikattanti/anonymous-event-checkin-v2 |
| **Live Demo / Local Launch Link** | ✅ **PASSED** | Frontend dev server (`npm run dev:preprod`) |
| **Demo Video (1 Minute)** | ✅ **PASSED** | 🎥 [Watch Demo Walkthrough](https://youtu.be/gnPuRBhZtxc) |
| **README Privacy Model Section** | ✅ **PASSED** | Detailed "What an Observer CAN and CANNOT Learn" breakdown below |

---

## 🔒 Privacy Model: What an Observer CAN and CANNOT Learn

The `checkin.compact` smart contract separates data into on-chain public ledger state and off-chain private witness state:

### 👁️ What an On-Chain Observer CAN Learn (PUBLIC Data)
- **Total Check-ins Counter**: The cumulative number of successfully checked-in attendees.
- **Event Name**: The public identifier of the event taking place.
- **Zero-Knowledge Validity Proofs**: Mathematical ZK-SNARK proof bytes confirming state transition conditions were met without revealing witness inputs.

### 🙈 What an On-Chain Observer CANNOT Learn (PRIVATE Witness Data)
- **Attendee Identity**: Attendee names, wallet addresses, or identifying markers are **never published on-chain**.
- **Invite Secret**: The specific invite secret used to check in remains strictly inside local private witness state. A verifier receives a ZK proof for *"User holds a valid invite"* without learning what the secret is.
- **Who Checked In When**: An on-chain observer can see that *someone* checked in, but cannot correlate the check-in to a specific person or secret.

---

## 📜 Contract Address & Network Deployment

| Network | Contract Address / Status | Verification Explorer Link |
| --- | --- | --- |
| **Preprod** | `ed3c0b8bbdc6e2405d1b606dfe38ef7d895ad95c9d7ecd69b68b4c2a0fa5e68b` | [🌐 Midnight Explorer](https://preprod.midnightexplorer.com) \| [🌐 1am Explorer](https://explorer.1am.xyz) |

---

## 🛠️ Tech Stack & Prerequisites

### Tech Stack
- **Midnight Network**
- **Compact Language (v0.23)**
- **Node.js (v22+)**
- **Docker & Compose**
- **React / Vite / Tailwind CSS**

### Prerequisites
- Node.js v22+
- Docker Desktop or Docker Engine
- Midnight Compact Compiler (`compact` CLI toolchain)
- Lace Wallet or 1AM Wallet (Midnight Preprod testnet enabled)

---

## 🚀 Setup & Execution Guide

```bash
# 1. Clone Repository
git clone https://github.com/saikattanti/anonymous-event-checkin-v2.git
cd anonymous-event-checkin-v2

# 2. Install Workspace Dependencies
npm install

# 3. Start Local Proof Server
docker run -d -p 6300:6300 -e PORT=6300 midnightntwrk/proof-server:8.1.0

# 4. Compile the compact contract
npm run compact

# 5. Run Unit Tests (10 Tests)
npm test

# 6. Launch Frontend DApp
npm run dev:preprod
```

---

## 🧪 Local Test Output (10/10 Passing)

```text
 RUN  v4.1.10 contract

 ✓ tests/contract.test.ts (5 tests)
 ✓ tests/network.test.ts (5 tests)

 Test Files  2 passed (2)
      Tests  10 passed (10)
   Duration  265ms
```

---

## 🖼️ Screenshots & Evidence

### Project Demo & DApp Screenshots
![Dashboard](checkin-ui/public/dashboard.png)
![Check In](checkin-ui/public/check-in.png)
![Landing](checkin-ui/public/landing.png)

### CI/CD Workflow Screenshot
*(Please upload your CI/CD Pipeline screenshot to `checkin-ui/public/` and update this link, or remove this section)*

---

## 📁 Repository Folder Structure

```
anonymous-event-checkin/
├── .github/workflows/ci.yml       # GitHub Actions CI/CD Pipeline
├── contract/                       # Compact Smart Contract & Circuits
├── api/                            # Midnight JS API Layer
├── checkin-ui/                     # Production React / Vite UI Application
│   ├── src/
│   │   ├── AppShell.tsx           # Layout component
│   │   ├── DashboardPage.tsx      # Main Dashboard View
│   │   ├── CheckInPage.tsx        # Zero-Knowledge Proof Submission
│   │   ├── wallet-context.tsx     # Wallet Integration
│   └── package.json
├── checkin-cli/                    # CLI Interface
├── package.json                    # Root Workspace Configuration
├── PROPOSAL.md                     # Product Proposal Document
└── README.md                       # Main README Documentation
```
