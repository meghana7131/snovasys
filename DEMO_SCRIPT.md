# LedgerLine — 2-Minute Demo Video Script

> **Goal**: Record a crisp 2-to-3 minute video on Loom, OBS, or ScreenPal. Walk through functionality, security defenses, and the ledger proofs.

---

### Timeline & Script

#### [0:00 - 0:30] Introduction & Architecture
- **Screen**: Show the landing page at `http://localhost:5173` (or live URL).
- **Say**:
  > *"Hello, this is LedgerLine — a financial movement system built with Spring Boot 3, PostgreSQL, and React. The core requirement is that books must always balance, and the same request must never pay twice. In the top bar, you can see our live Money Conservation Invariant: BALANCED at \$101,500.00 across all accounts."*

#### [0:30 - 1:00] Double-Entry Transfer & Idempotency Demonstration
- **Screen**: Click **Transfer** on Alice's account ($1,000.00).
- **Actions**:
  1. Select **Bob** ($500.00) as recipient.
  2. Enter **$50.00** as the amount.
  3. Point out the auto-generated **Idempotency-Key** header displayed on screen.
  4. Click **Transfer Money**.
  5. Show Alice's balance decrease to **$950.00**.
  6. Open the Transfer modal again with the same parameters and click **⚡ Test Idempotency (Fire 2x Parallel)**.
- **Say**:
  > *"When we execute this transfer, the backend creates atomic double-entry ledger records. Now, to test network retry safety, I'll click our Idempotency Test button, which fires the exact same request twice in parallel. As you can see, the duplicate was intercepted by our idempotency layer using SHA-256 fingerprinting. The cached receipt is returned, and Alice's balance remains strictly protected without any double-deduction."*

#### [1:00 - 1:30] Full Ledger Statement Book
- **Screen**: Click **View Full Ledger Book** on Alice's account.
- **Say**:
  > *"Every financial change produces immutable, append-only ledger entries. Here we can see our \$50.00 DEBIT entry matched with the transaction reference ID. The books reflect every debit and credit with zero unbacked money movement."*

#### [1:30 - 2:00] Auditor Panel & Invariant Conservation Check
- **Screen**: In the top switcher bar, click **Auditor**.
- **Actions**:
  1. Click **⚡ Run Conservation Audit**.
  2. Point to the green **CONSERVED (BALANCED)** badge.
  3. Scroll down to show the **Append-Only Forensic Audit Trail** table.
- **Say**:
  > *"Now I switch to the Auditor role. Auditors have read-only access and cannot mutate accounts. The Auditor can run a mathematical conservation audit: the system calculates the sum of all user checking accounts plus the reserve pool. The total equals our baseline constant of \$101,500.00. Below is the append-only audit log, capturing actors, IPs, timestamps, and transactions with zero ability to modify or delete historical records."*

#### [2:00 - 2:15] Concurrency Tests & Wrap Up
- **Screen**: Briefly show terminal with `.\scripts\test-ledgerline.ps1` passing all 10 tests, or `mvn test` passing.
- **Say**:
  > *"Under the hood, we use pessimistic row-level locking (`SELECT ... FOR UPDATE`) with deterministic UUID lock ordering to eliminate race conditions and deadlocks. Our automated test suite proves that simultaneous withdrawals can never cause an overdraft. Thank you!"*

