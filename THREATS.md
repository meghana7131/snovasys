# THREATS.md — Threat Model & Security Controls

This document details the threat model for **LedgerLine** based on the **STRIDE** methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) and maps each threat directly to implementation controls and automated test cases.

---

## Threat Matrix

| Threat ID | Threat Name | STRIDE | Attack Description | Implementation Mitigation | Automated Test Proof |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **THREAT-01** | Simultaneous Withdrawal Race Condition | **Tampering** | Attacker issues multiple parallel withdrawal requests (e.g., 2 x \$80 from an account holding \$100) before balance updates are committed, attempting double spending. | Database-level row locking (`SELECT ... FOR UPDATE`) inside an explicit transaction. Lock ordering by `account_id ASC` prevents deadlocks. Database constraint `CHECK (balance >= 0)`. | `testConcurrentSimultaneousWithdrawalsOnlyOneSucceeds` |
| **THREAT-02** | Network Retry Double Charge | **Tampering** | Network drops before client receives 200 OK. Client/gateway retries identical transfer, causing recipient to be paid twice. | Mandatory `Idempotency-Key` header with SHA-256 hash of payload. First request stores response; duplicate key with matching hash returns cached result without re-executing. | `testIdempotentRequestReturnsCachedResultWithoutReExecuting` |
| **THREAT-03** | Idempotency Key Hijacking / Payload Tampering | **Tampering** | Attacker sends a different transaction using an already-used `Idempotency-Key` to confuse transaction records. | SHA-256 fingerprint validation: if `Idempotency-Key` matches but payload hash differs, server rejects request immediately with `422 Unprocessable Entity` or `409 Conflict`. | `testIdempotencyKeyWithMismatchedPayloadRejected` |
| **THREAT-04** | Insecure Direct Object Reference (IDOR) | **Elevation of Privilege** | Authenticated User A passes User B's `sender_account_id` in a transfer or withdrawal request to drain User B's funds. | Server-side identity validation: The backend resolves the authenticated user from the verified JWT/session and checks `account.user_id == authenticated_user.id`. Account IDs from request bodies are never trusted alone. | `testUserCannotTransferFromAnotherUsersAccount` |
| **THREAT-05** | Unauthorized Auditor Mutation | **Elevation of Privilege** | An Auditor user calls state-mutating endpoints (`/transfer`, `/withdraw`, `/deposit`) to alter ledger balances. | Strict RBAC enforcement. Only accounts with `ROLE_USER` or `ROLE_ADMIN` can initiate mutations; `ROLE_AUDITOR` is restricted exclusively to read-only endpoints (`GET /ledger`, `GET /audit`, `GET /health/conservation`). | `testAuditorCannotCallStateMutatingEndpoints` |
| **THREAT-06** | Out-of-Thin-Air Money Creation | **Tampering** | Backend buggy logic credits an account without a balancing counterparty or pool debit, violating double-entry principles. | Invariant validation: Every transaction requires $\sum \text{Debits} = \sum \text{Credits}$. Transactions violating this are aborted before commit. Background conservation check confirms $\sum \text{Balances} = \text{Constant}$. | `testTransactionFailsIfDebitsDoNotEqualCredits` |
| **THREAT-07** | Negative Amount / Decimal Precision Exploit | **Tampering** | Attacker passes negative amounts (e.g. transfer `-$500` to reverse flow) or fractional pennies (e.g. `0.000001`) to exploit floating-point rounding errors. | Strict input validation: `amount > 0` and format restricted to exact fixed-point cents / `BigDecimal` scale 2 (`0.01` minimum). Float/Double arithmetic is strictly prohibited. | `testNegativeAndZeroAmountsRejected` |
| **THREAT-08** | Audit Trail Tampering | **Repudiation** | Malicious insider or compromised application attempts to update or delete rows in the audit log to cover traces. | Append-only database design. No `UPDATE` or `DELETE` API endpoints exist. The database user is restricted to `INSERT` and `SELECT` privileges on the `audit_logs` table. | `testAuditLogEntriesAreImmutableAndAppendOnly` |

---

## Security Verification Checklist for Evaluators

1. **Attempt IDOR**: Login as User B, copy User A's `accountId`, post a transfer request specifying User A's account as source $\rightarrow$ Server responds `403 Forbidden`.
2. **Attempt Double Spend**: Fire two simultaneous `cURL` or test requests for \$100 against an account with \$100 $\rightarrow$ Exactly one request returns `200 OK`, the second returns `400 Insufficient Funds`.
3. **Attempt Replay**: Send the exact same POST request with identical `Idempotency-Key` $\rightarrow$ Second call returns the cached original response without creating new ledger entries.
4. **Attempt Role Escalation**: Access `/api/audit/system-trail` with a `USER` token $\rightarrow$ Server responds `403 Forbidden`. Access with an `AUDITOR` token $\rightarrow$ Server responds `200 OK`.
