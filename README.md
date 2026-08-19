# Anonymous Event Check-in

A **Midnight** DApp where attendees prove they hold a valid invite/check-in secret **without revealing their identity or the secret**. The public ledger shows only the **event name** and a running **anonymous check-in count**.

[![CI](https://github.com/saikattanti/anonymous-event-checkin/actions/workflows/ci.yml/badge.svg)](https://github.com/saikattanti/anonymous-event-checkin/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=flat-square&logo=vercel)](https://anonymous-event-checkin.vercel.app/)
[![Demo Video](https://img.shields.io/badge/Demo_Video-YouTube-FF0000?style=flat-square&logo=youtube)](https://youtu.be/gnPuRBhZtxc)
[![Network](https://img.shields.io/badge/Network-Preprod-0ea5e9?style=flat-square)](https://midnight.network/)
[![Midnight](https://img.shields.io/badge/Midnight-ZK-1c7a4c?style=flat-square)](https://midnight.network)
[![Level 3](https://img.shields.io/badge/Rise--In-Level%203-0f766e?style=flat-square)](PROPOSAL.md)
[![Node.js](https://img.shields.io/badge/Node.js-22+-10b981?style=flat-square)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-111111?style=flat-square)](./package.json)

<p>
  <a href="https://anonymous-event-checkin.vercel.app/"><img src="https://img.shields.io/badge/Open_Live_App-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Open Live App" /></a>
  <a href="https://youtu.be/gnPuRBhZtxc"><img src="https://img.shields.io/badge/Watch_Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Watch Demo" /></a>
  <a href="https://github.com/saikattanti/anonymous-event-checkin/actions/workflows/ci.yml"><img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions" /></a>
</p>

---

## Live Demo & Deployment

| Resource | Link / value |
| --- | --- |
| **Live Web Application** | [https://anonymous-event-checkin.vercel.app/](https://anonymous-event-checkin.vercel.app/) |
| **Local App UI** | [http://localhost:5173/](http://localhost:5173/) (`npm run dev:preprod`) |

## Contract Address
| Network | Address |
|----------|----------------------------------|
| Preprod | da5a5c4b4869a2a2b7d654da1eb9ed63b9788ce6f3b15c92339df57e1113407f |

## What This Does
This application allows event organizers to issue anonymous invite secrets to attendees. Attendees can then check in to the event by providing their secret on-chain. The system increments the total check-in count on the public ledger without ever revealing which specific invite was used, who checked in, or the total list of invited attendees.

## Privacy Model
- **PUBLIC:** The name of the event (`eventName`) and the total number of checked-in attendees (`checkInCount`).
- **PRIVATE:** The `inviteSecret` provided to each attendee.
- **PROVED without revealing:** Attendees prove they possess a valid `inviteSecret` to increment the check-in count, without revealing the secret itself to the network or the organizer.

## Privacy Claim
An on-chain observer can see that someone successfully checked in and see the total check-in count increase. However, they cannot see who checked in or which invite secret was used.

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Smart Contract:** Midnight Compact, Midnight JS SDK
- **Backend/CLI:** Node.js, TypeScript

## Prerequisites
- Node.js v22
- Docker (for local proof server)
- Lace Wallet or Nightly Wallet (Midnight testnet enabled)

## Setup & Run Locally
1. Clone the repository
2. Install root dependencies:
   ```bash
   npm install
   ```
3. Start the local proof server:
   ```bash
   docker run -p 6300:6300 midnightnetwork/proof-server
   ```
4. Compile the compact contract:
   ```bash
   npm run compact
   ```
5. Run the frontend:
   ```bash
   npm run dev --workspace=@midnight-ntwrk/checkin-ui
   ```

## Run Tests
```bash
npm test
```

## CI/CD
This project uses GitHub Actions for Continuous Integration. The pipeline triggers on pushes and pull requests to the `main` branch. It automatically checks out the code, installs dependencies, compiles the Midnight Compact contract, and runs the full test suite to ensure circuit logic, state transitions, and privacy properties remain intact.

## Product Proposal
See [PROPOSAL.md](PROPOSAL.md)
