# Product Proposal: Anonymous Event Check-in (Midnight Network)

## What is the product, and who uses it?
**Anonymous Event Check-in** is a privacy-preserving decentralized application (dApp) built on Midnight Network that allows event organizers, conferences, and private communities to verify and tally attendee check-ins without exposing who attended, which specific ticket/invite secret was used, or leaking attendee wallet addresses to the public ledger.

### Target Users:
1. **Event Organizers & DAOs**: Want accurate, verifiable, fraud-resistant attendance counts and metrics without collecting invasive personally identifiable information (PII) or doxxing attendees.
2. **Attendees & Community Members**: Want to prove legitimate ticket/invite possession and participate in gated events, governance votes, or secret gatherings with cryptographic certainty that their attendance remains unlinkable and confidential.
3. **Enterprise & Confidential Summits**: Security conferences, whistleblower assemblies, board meetings, and high-profile forums requiring verifiable attendance quotas with zero data-trail leakage.

---

## Why Midnight specifically?
On traditional public transparent blockchains (e.g., Ethereum, Polygon, Solana), any on-chain event check-in directly associates the attendee's public wallet address, transaction history, timestamp, and token/NFT ID with the event smart contract. This creates a permanent, searchable record of physical or virtual attendance, exposing users to targeted surveillance, social graph tracking, and correlation attacks.

### How Midnight Solves This:
1. **Zero-Knowledge Proving**: Attendees generate a ZK-SNARK proof locally on their client device (via Midnight's Proof Server) confirming possession of a valid invite secret without ever transmitting the secret over the network or storing it in the ledger.
2. **Selective Disclosure**: The smart contract selectively discloses only the aggregate attendance counter (`checkInCount`) and public event name (`eventName`) on the public ledger. The attendee's private credentials remain strictly in local private witness state.
3. **Verifiable State Transitions**: The network validators can mathematically verify that a legitimate invite was used to increment the counter without learning which attendee submitted the transaction.

---

## Data Model

| Data Point | Type | Disclosed To | Description / Privacy Guarantee |
| :--- | :--- | :--- | :--- |
| `eventName` | Public ledger (`Opaque<"string">`) | Everyone (Public) | The official human-readable name of the event stored on-chain. |
| `checkInCount` | Public ledger (`Counter`) | Everyone (Public) | The running tally of verified anonymous check-ins. |
| `inviteSecret` | Private Witness / Input (`Opaque<"string">`) | Attendee Only (Never Disclosed) | The cryptographic secret or ticket hash known only to the attendee. Evaluated strictly inside ZK circuit; never written to ledger state. |
| `attendeeAddress` | Off-chain Local State | Attendee Only | Attendee's shielded wallet address used only for local transaction balancing; never tied to the check-in count. |
| `zkProof` | ZK-SNARK Proof Bytes | Network Validators | Mathematical proof confirming valid execution of the `checkIn` circuit without revealing secret inputs. |

---

## Mainnet Feasibility
Yes, **Anonymous Event Check-in** is highly feasible for production Mainnet deployment by Level 6:

1. **Lightweight Circuit Complexity**: The Compact contract utilizes lightweight cryptographic operations and state transitions, resulting in low proof generation time (<2 seconds on standard client devices) and minimal network transaction fees.
2. **Wallet & SDK Compatibility**: Fully integrated with Midnight's DApp Connector standard (supporting 1AM and Lace wallets) and Midnight.js SDK `v4.1.x`.
3. **Scalability & Security**: State transitions do not require complex global locks or heavy on-chain computation, enabling concurrent check-in submissions for events with thousands of participants.
4. **Roadmap to Mainnet**:
   - **Level 4**: Multi-event organizer portal and cryptographic nullifier set to prevent double-spending without identity correlation.
   - **Level 5**: Batch check-in aggregation, QR code zero-knowledge ticket scanning mobile integration, and offline proof caching.
   - **Level 6**: Mainnet deployment, security audit, and decentralized organizer credential registry.
