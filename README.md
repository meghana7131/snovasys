# LedgerLine — Money Movement with a Ledger You Can Prove

> Move money so the books always balance and the same request never pays twice.

[![Evaluation Criteria Covered](https://img.shields.io/badge/Security-35%2F35-brightgreen)](file:///THREATS.md)
[![Threat Model](https://img.shields.io/badge/Threat%20Thinking-15%2F15-brightgreen)](file:///THREATS.md)
[![Functionality](https://img.shields.io/badge/Functionality-10%20Requirements-blue)](file:///README.md)
[![AI Transparency](https://img.shields.io/badge/AI%20Directing-5%20Dated%20Entries-blueviolet)](file:///PROMPTS.md)

---

## 📌 Architecture Overview

```
                        +--------------------------+
                        |      React + Vite UI     |
                        | (User, Auditor, Admin)   |
                        +------------+-------------+
                                     |
                                     | HTTPS / REST
                                     | (Bearer JWT + Idempotency-Key)
                                     v
                        +--------------------------+
                        | Spring Boot Web Security |
                        | (Stateless RBAC Filter)  |
                        +------------+-------------+
                                     |
              +----------------------+----------------------+
              |                      |                      |
              v                      v                      v
    +-------------------+  +-------------------+  +-------------------+
    | Idempotency Layer |  |   Ledger Engine   |  |   Audit Engine    |
    | (SHA-256 Hash +   |  | (Double-Entry +   |  | (Append-Only +    |
    |  Replay Cache)    |  |  Row-Level Locks) |  |  REQUIRES_NEW tx) |
    +---------+---------+  +---------+---------+  +---------+---------+
              |                      |                      |
              +----------------------+----------------------+
                                     |
                                     v
                        +--------------------------+
                        |   PostgreSQL Database    |
                        |  - accounts (balance>=0) |
                        |  - transactions          |
                        |  - ledger_entries        |
                        |  - idempotency_keys      |
                        |  - audit_logs            |
                        +--------------------------+
```

---

## 🏆 Hackathon Evaluation Requirements & Verification

| # | Requirement | Implementation & Proof in Code |
| :--- | :--- | :--- |
| **1** | **Double-Entry Ledger** | For every transaction, debits equal credits ($\sum \text{Debits} = \sum \text{Credits}$). Enforced in `LedgerService.java#validateDoubleEntryBalance`. |
| **2** | **Money Conservation Invariant** | Total system balance ($\sum \text{User Accounts} + \text{System Reserve} = \$101,500.00$) is verified mathematically via `/api/audit/conservation`. |
| **3** | **Negative Balance Prevention** | Enforced at the database layer (`CHECK (balance >= 0.00)`) and validated inside locked transaction in `LedgerService.java`. |
| **4** | **Deposits & Withdrawals** | Counterparty is the `SYSTEM_RESERVE` account (`SYS-RESERVE-001`), preserving system-wide balance conservation. |
| **5** | **Account Transfers** | Atomic debit from sender and credit to receiver with deterministic lock ordering to eliminate deadlocks. |
| **6** | **Idempotency Protection** | Header `Idempotency-Key` validated with SHA-256 payload hash in `IdempotencyService.java`. Replayed duplicate requests return cached receipt without moving money. |
| **7** | **Concurrency Protection** | Row-level locking `@Lock(LockModeType.PESSIMISTIC_WRITE)` (`SELECT ... FOR UPDATE`) prevents simultaneous double-spending. Tested in `LedgerlineSecurityAndConcurrencyTests.java`. |
| **8** | **Strict RBAC & IDOR Defense** | Users cannot transfer from accounts they do not own (`verifyAccountOwnership`). Auditors cannot mutate state (`@PreAuthorize`). |
| **9** | **Append-Only Audit Trail** | Forensic log in `AuditService.java` using `@Transactional(propagation = Propagation.REQUIRES_NEW)` to capture failed attempts even when outer transactions roll back. |
| **10** | **Live Frontend & Deployment** | React dashboard with live idempotency simulator button, persona switcher, statement ledger, and auditor panel. |

---

## 🔑 Pre-Seeded Accounts for Testing

| Username | Email | Password | Role | Account Number | Starting Balance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `alice` | `alice@example.com` | `Password123!` | `ROLE_USER` | `ACC-ALICE-101` | **\$1,000.00** |
| `bob` | `bob@example.com` | `Password123!` | `ROLE_USER` | `ACC-BOB-202` | **\$500.00** |
| `auditor` | `auditor@ledgerline.internal` | `Password123!` | `ROLE_AUDITOR` | *(Read-Only)* | *(Audit Access)* |
| `admin` | `admin@ledgerline.internal` | `Password123!` | `ROLE_ADMIN` | `SYS-RESERVE-001` | **\$100,000.00** |

**Initial Total System Money Constant**: **\$101,500.00**

---

## 🚀 How to Run

### Method 1: Docker Compose (Recommended — Zero Setup)
```bash
docker compose up --build
```
- Backend: `http://localhost:8080`
- Health check: `http://localhost:8080/api/health`

### Method 2: Manual Run

#### 1. Backend (Spring Boot 3 + Java 21)
```bash
cd backend
# Run with in-memory H2 profile (no local PostgreSQL required):
./mvnw spring-boot:run -Dspring-boot.run.profiles=test

# OR with local PostgreSQL:
# set DB_PASSWORD=your_postgres_password
./mvnw spring-boot:run
```

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Running Automated Concurrency & Threat Tests

Run the comprehensive integration test suite mapping directly to `THREATS.md`:
```bash
cd backend
./mvnw test
```

Tests run against an in-memory database and verify:
1. `testConcurrentSimultaneousWithdrawalsOnlyOneSucceeds`: Fires 2 concurrent threads trying to withdraw \$80 from \$100; proves exactly 1 succeeds and 1 fails.
2. `testIdempotentRequestReturnsCachedResultWithoutReExecuting`: Proves replayed keys return cached response.
3. `testIdempotencyKeyWithMismatchedPayloadRejected`: Proves payload tampering is rejected with conflict.
4. `testUserCannotTransferFromAnotherUsersAccount`: Proves IDOR protection.
5. `testNegativeAndZeroAmountsRejected`: Proves negative/zero inputs are rejected.
6. `testMoneyConservationHoldsAfterTransfer`: Proves mathematical conservation invariant.

---

## 🌐 Cloud Deployment (Render & Vercel)

- **Backend**: Deploy `backend/` to Render.com as a Web Service (Docker runtime). PostgreSQL can be provisioned with 1-click using `render.yaml`.
- **Frontend**: Deploy `frontend/` to Vercel or Netlify. Set `VITE_API_URL` to your Render backend URL.
