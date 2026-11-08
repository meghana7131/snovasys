# PROMPTS.md — AI Interaction & Oversight Log

This log documents the prompts given to AI tools during the development of **LedgerLine**, critical evaluation of the generated solutions, errors or vulnerabilities caught, and the engineering corrections implemented in our commits.

---

### Entry 1 — 2026-11-08: Initial Architecture & Maven / Java Version Configuration
- **What I asked for**:
  "Generate a clean project setup for a double-entry ledger application using Spring Boot, Maven, and PostgreSQL with Docker Compose."
- **What the tool produced**:
  The AI produced a `pom.xml` configured for Java 25 and included experimental enterprise governance starter dependencies that could not be resolved from Maven Central.
- **What was wrong with it**:
  1. The installed environment and LTS cloud deployment targets require standard stable JDK compatibility (Java 21 LTS). Specifying Java 25 caused build failures due to unsupported bytecode target flags in standard plugins.
  2. The unresolvable external dependencies prevented `mvn clean compile` from completing.
- **What I did instead**:
  Corrected the Java target version to Java 21, removed the extraneous starters, streamlined dependencies to standard `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, and `postgresql`, and established clean monorepo directories for backend and frontend.
- **Commit Reference**: `e124140: chore: initialize LedgerLine monorepo architecture, THREATS.md, and PROMPTS.md`

---

### Entry 2 — 2026-11-08: Idempotency Key Handling & Request Body Tampering Vulnerability
- **What I asked for**:
  "Write an idempotency middleware/filter in Spring/Express that reads an Idempotency-Key header and stores the response so identical requests are not executed twice."
- **What the tool produced**:
  The AI generated a simple lookup table checking only the `Idempotency-Key` string. If the key existed, it returned the cached response; if not, it executed the request and saved the response with the key.
- **What was wrong with it**:
  The AI's design was vulnerable to **Payload Tampering and Key Collisions**. If a client reused an `Idempotency-Key` with a completely different payload (for example, transferring \$10 to Alice, and later sending \$500 to Bob with the same key accidentally or maliciously), the system would either return Alice's receipt for Bob's transaction or execute unauthorized state mutations without checking request integrity.
- **What I did instead**:
  Added a cryptographic SHA-256 fingerprint of the normalized request body and endpoint path along with the `Idempotency-Key`. When a key is seen again:
  1. If the stored SHA-256 hash matches the current request hash: return the cached response.
  2. If the stored SHA-256 hash does NOT match: reject the request immediately with `409 Conflict`, logging a potential tampering attempt in the audit log.
- **Commit Reference**: `70f8755: feat(backend): implement double-entry ledger, pessimistic locking, JWT auth, and threat tests`

---

### Entry 3 — 2026-11-08: Insecure Direct Object Reference (IDOR) & Account Ownership Enforcement
- **What I asked for**:
  "Generate a Spring Boot controller endpoint for transferring money between two accounts where account IDs and amount are sent in a JSON body."
- **What the tool produced**:
  The AI created `@PostMapping("/transfer")` that directly took `senderAccountId` from `TransferRequest` and fetched the account via `accountRepository.findById(senderAccountId)` without checking whether the authenticated user owns that account.
- **What was wrong with it**:
  This introduced an **Insecure Direct Object Reference (IDOR / Broken Object Level Authorization)** flaw. Any authenticated user (e.g. Bob) could pass Alice's `senderAccountId` in the JSON request body and drain Alice's balance into his own account.
- **What I did instead**:
  In `LedgerService.java`, implemented strict ownership validation `verifyAccountOwnership(sender, actor)`:
  - Extracted the authenticated `User` principal from Spring Security.
  - Required that `sender.getUser().getId().equals(actor.getId())` unless the caller possesses `ROLE_ADMIN`.
  - Added unit test `testUserCannotTransferFromAnotherUsersAccount` in `LedgerlineSecurityAndConcurrencyTests.java` asserting a `403 Forbidden` (`UnauthorizedAccountAccessException`) is thrown when any user attempts to spend from an account they do not own.
- **Commit Reference**: `70f8755: feat(backend): implement double-entry ledger, pessimistic locking, JWT auth, and threat tests`

---

### Entry 4 — 2026-11-08: Concurrency Race Condition & Deadlock in Simultaneous Transfers
- **What I asked for**:
  "How should I protect against simultaneous withdrawals and transfers so balance doesn't drop below zero?"
- **What the tool produced**:
  The AI suggested using `@Transactional` with Spring's default isolation level and checking `if (account.getBalance().compareTo(amount) >= 0)` in memory, or simply locking accounts in the order they appeared in the transfer arguments (`lock(sender)`, then `lock(recipient)`).
- **What was wrong with it**:
  1. Default transaction isolation allows **lost updates and race conditions** under concurrent requests: two threads reading the account balance simultaneously will both pass the `balance >= amount` check before either writes.
  2. Locking `sender` then `recipient` causes **database deadlocks**: if User A transfers to User B while User B simultaneously transfers to User A, Thread 1 locks A and waits for B, while Thread 2 locks B and waits for A.
- **What I did instead**:
  1. Applied explicit pessimistic row-level locking via `@Lock(LockModeType.PESSIMISTIC_WRITE)` (`SELECT ... FOR UPDATE`) in `AccountRepository.java`.
  2. Implemented **Deterministic Lock Ordering** in `LedgerService.java`: compared the account UUID strings (`senderAccountId.compareTo(recipientAccountId)`) and always locked the lower UUID first. This guarantees a globally consistent acquisition order across all concurrent threads, mathematically preventing deadlock cycles.
  3. Added multi-threaded test `testConcurrentSimultaneousWithdrawalsOnlyOneSucceeds` using `CountDownLatch` and `ExecutorService` to verify that concurrent requests cannot trigger double-spending.
- **Commit Reference**: `70f8755: feat(backend): implement double-entry ledger, pessimistic locking, JWT auth, and threat tests`

---

### Entry 5 — 2026-11-08: Transaction Rollback Dropping Audit Records (Forensic Evasion)
- **What I asked for**:
  "Log failed security events (e.g. insufficient funds, failed authorization, negative amount attempts) inside the service methods so auditors can review suspicious activity."
- **What the tool produced**:
  The AI injected `auditLogRepository.save(new AuditLog(...))` inside the `@Transactional` business method right before throwing the runtime exception (e.g. `throw new InsufficientFundsException(...)`).
- **What was wrong with it**:
  Because the runtime exception triggers a complete database transaction rollback, the audit log insertion was rolled back with it! As a result, fraudulent or failed overdraft attempts left zero forensic trace in the database, directly defeating the non-repudiation requirement of an append-only audit trail.
- **What I did instead**:
  1. Separated audit logging into a dedicated `AuditService.java`.
  2. Annotated the logging method with `@Transactional(propagation = Propagation.REQUIRES_NEW)`. This suspends the outer transaction and commits the audit entry in an independent transaction immediately, guaranteeing that failed or unauthorized attempts are permanently recorded even when the money movement is rolled back.
  3. Created an Auditor dashboard in React connected to `/api/audit/system-trail` so auditors can inspect real-time security events.
- **Commit Reference**: `9500745: feat(frontend): build React dashboard, live idempotency test, ledger views, and auditor panel`
