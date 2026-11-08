# LedgerLine — Money Movement with a Ledger You Can Prove

> Move money so the books always balance and the same request never pays twice.

## 📌 Problem Overview
Financial systems fail when:
1. **Network Retries Cause Double Payments**: A customer clicks "Pay", the connection drops, they click again, and they get charged twice.
2. **Concurrent Race Conditions**: A user has \$100 and fires two simultaneous \$80 withdrawals; both read \$100 before either writes, resulting in a \$60 overdraft.
3. **Insecure Direct Object References (IDOR)**: User A specifies User B's `accountId` in a transfer request payload and drains their funds.
4. **Untracked Ledger Inbalances**: Money is credited to an account out of nowhere without a corresponding debit to a reserve pool or counterparty account.

**LedgerLine** solves all four issues using:
- **Strict Double-Entry Bookkeeping**: Every transaction consists of balanced debits and credits ($\sum \text{Debits} = \sum \text{Credits}$).
- **System-Wide Money Conservation Invariant**: Total money across all user accounts plus the system reserve pool equals a fixed constant.
- **Header-Based Idempotency**: Cryptographic request fingerprinting caching responses to guarantee once-and-only-once execution.
- **Pessimistic Row-Level Locking**: `SELECT ... FOR UPDATE` with deterministic lock ordering to guarantee zero race conditions and zero deadlocks.
- **Immutable Append-Only Audit Trail**: Full forensic traceability for auditors.

---

## 🏗️ Architecture

```
                       +-----------------------+
                       |   React + Vite UI     |
                       |  (User, Auditor, Admin)
                       +-----------+-----------+
                                   |
                 HTTPS REST API    | (Bearer JWT + Idempotency-Key)
                                   v
                       +-----------------------+
                       |    API Gateway &      |
                       |  Security Interceptor |
                       +-----------+-----------+
                                   |
         +-------------------------+-------------------------+
         |                         |                         |
         v                         v                         v
+------------------+     +-------------------+     +-------------------+
|  Auth & RBAC     |     |  Ledger Engine    |     |  Audit & Invariant|
|  (User/Auditor)  |     |  (Double-Entry &  |     |  Monitor          |
|                  |     |   Row Locking)    |     |                   |
+--------+---------+     +---------+---------+     +---------+---------+
         |                         |                         |
         +-------------------------+-------------------------+
                                   |
                                   v
                       +-----------------------+
                       |  PostgreSQL Database  |
                       | - accounts            |
                       | - transactions        |
                       | - ledger_entries      |
                       | - idempotency_keys    |
                       | - audit_logs          |
                       +-----------------------+
```

---

## 📋 Evaluation Checklist & Core Requirements

- [x] **Double-Entry Ledger Engine**: Equal debit and credit entries for every transaction.
- [x] **Money Conservation Checks**: Invariant check verifying total money is conserved.
- [x] **Server-Side Negative Balance Prevention**: DB constraint `CHECK (balance >= 0)` + application verification.
- [x] **Account Transfers & Deposits**: Complete money movements with state verification.
- [x] **Idempotency Protection**: `Idempotency-Key` header with payload hash validation.
- [x] **Concurrency & Race Condition Defense**: Deterministic row-locking to stop simultaneous overdrafts.
- [x] **Role-Based Authorization & IDOR Defense**: Strict account-ownership verification for Users, Auditors, and Admins.
- [x] **Append-Only Audit Trail**: Complete action history for compliance inspection.
- [x] **Automated Concurrency & Threat Tests**: Automated suites testing race conditions and unauthorized access.
- [x] **Live Cloud Deployment & Demo**: Deployed with public URLs and zero-install client access.

---

## 🏃 Local Setup & Run

### Prerequisites
- Node.js 20+ / Java 21+
- PostgreSQL 15+
- Git

*(Detailed setup instructions will be finalized once stack components are built).*
