# LedgerLine — Interview Walkthrough & Live Coding Guide

> **Important**: Hackathon evaluators will ask you to explain your code line-by-line and make a small live change during the technical interview. Use this guide to prepare for every question.

---

## 1. Core Architecture Quick Summary
- **Backend**: Java 21, Spring Boot 3, Spring Data JPA, Spring Security (Stateless JWT).
- **Database**: PostgreSQL (with in-memory H2 profile for offline tests).
- **Frontend**: React 18, Vite.
- **Key Invariants**:
  1. **Double-Entry Bookkeeping**: Every transaction has equal debits and credits ($\sum \text{Debits} = \sum \text{Credits}$).
  2. **Money Conservation**: Total money across all user accounts plus the system reserve pool equals a fixed constant ($101,500.00).
  3. **Zero Negative Balances**: `CHECK (balance >= 0.00)` enforced at the database level and verified within locked transactions.

---

## 2. Walkthrough of Critical Code Locations

### A. How Race Conditions & Simultaneous Overdrafts are Prevented
- **File**: [`backend/src/main/java/com/ledgerline/repository/AccountRepository.java`](file:///c:/Users/ganga/OneDrive/Documents/Desktop/snovasys/backend/src/main/java/com/ledgerline/repository/AccountRepository.java)
  ```java
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT a FROM Account a WHERE a.id = :id")
  Optional<Account> findByIdWithLock(@Param("id") UUID id);
  ```
- **How to explain it to the interviewer**:
  > *"When two requests attempt to withdraw from the same account at the exact same millisecond, standard read isolation causes lost updates. I implemented pessimistic write locking (`SELECT ... FOR UPDATE` in SQL). The first thread locks the database row; the second thread must wait until the first transaction commits. When the second thread acquires the lock, it reads the updated reduced balance and throws an `InsufficientFundsException`."*

### B. How Deadlocks are Mathematically Prevented
- **File**: [`backend/src/main/java/com/ledgerline/service/LedgerService.java`](file:///c:/Users/ganga/OneDrive/Documents/Desktop/snovasys/backend/src/main/java/com/ledgerline/service/LedgerService.java#L58-L69)
  ```java
  if (senderAccountId.compareTo(recipientAccountId) < 0) {
      sender = getAccountWithLock(senderAccountId);
      recipient = getAccountWithLock(recipientAccountId);
  } else {
      recipient = getAccountWithLock(recipientAccountId);
      sender = getAccountWithLock(senderAccountId);
  }
  ```
- **How to explain it to the interviewer**:
  > *"If Alice transfers to Bob while Bob simultaneously transfers to Alice, locking `sender` then `recipient` causes a circular wait deadlock. I implemented **Deterministic Lock Ordering**: we compare the two UUIDs and always acquire the lock on the smaller UUID first. Because every thread acquires locks in the exact same global order, a circular deadlock is mathematically impossible."*

### C. How IDOR / Broken Object-Level Authorization is Prevented
- **File**: [`backend/src/main/java/com/ledgerline/service/LedgerService.java`](file:///c:/Users/ganga/OneDrive/Documents/Desktop/snovasys/backend/src/main/java/com/ledgerline/service/LedgerService.java#L231-L239)
  ```java
  private void verifyAccountOwnership(Account account, User actor) {
      if (actor.getRole() == Role.ROLE_ADMIN || actor.getRole() == Role.ROLE_AUDITOR) {
          return;
      }
      if (account.getUser() == null || !account.getUser().getId().equals(actor.getId())) {
          throw new UnauthorizedAccountAccessException(
              String.format("Access denied: User %s does not own account %s", actor.getUsername(), account.getAccountNumber()));
      }
  }
  ```
- **How to explain it to the interviewer**:
  > *"The account ID in the request body is never trusted on its own. We extract the authenticated `User` principal from Spring Security and verify that `account.getUser().getId()` matches `actor.getId()`. If an attacker specifies another user's account ID, the service immediately throws `UnauthorizedAccountAccessException` returning `403 Forbidden`."*

### D. How Idempotency Prevents Double-Charging
- **File**: [`backend/src/main/java/com/ledgerline/service/IdempotencyService.java`](file:///c:/Users/ganga/OneDrive/Documents/Desktop/snovasys/backend/src/main/java/com/ledgerline/service/IdempotencyService.java)
- **How to explain it to the interviewer**:
  > *"Clients send a unique `Idempotency-Key` header with mutating requests. We calculate a SHA-256 fingerprint of the request payload. If the key exists and the payload matches, we return the cached response without moving any funds. If the key exists but the payload is different, we reject it with `409 Conflict` to prevent payload tampering."*

### E. Why Audit Logging Uses `REQUIRES_NEW`
- **File**: [`backend/src/main/java/com/ledgerline/service/AuditService.java`](file:///c:/Users/ganga/OneDrive/Documents/Desktop/snovasys/backend/src/main/java/com/ledgerline/service/AuditService.java#L22-L26)
  ```java
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void log(...)
  ```
- **How to explain it to the interviewer**:
  > *"If someone attempts an overdraft or an unauthorized transfer, the business transaction rolls back. If audit logging ran inside the same transaction, the audit record would be discarded! By using `Propagation.REQUIRES_NEW`, the audit log is committed in its own independent transaction, ensuring an immutable record of all failed and fraudulent attempts."*

---

## 3. Likely Live Coding Modifications & How to Solve Them

### Question 1: "Add a 1% transfer fee that gets deposited into the System Reserve Pool"
**Where to change**: `LedgerService.java` inside `transfer()`:
```java
BigDecimal fee = amount.multiply(new BigDecimal("0.01")).setScale(2, RoundingMode.HALF_UP);
BigDecimal netAmount = amount.subtract(fee);

// Deduct full amount from sender
sender.setBalance(sender.getBalance().subtract(amount));

// Credit net amount to recipient
recipient.setBalance(recipient.getBalance().add(netAmount));

// Credit fee to System Reserve
Account reserve = accountRepository.findFirstByType(AccountType.SYSTEM_RESERVE).orElseThrow();
reserve.setBalance(reserve.getBalance().add(fee));

// Create 3 ledger entries: 1 Debit (sender for amount), 2 Credits (recipient for netAmount, reserve for fee)
// Notice: Debits (amount) == Credits (netAmount + fee) -> Books still balance!
```

### Question 2: "Add an account freeze feature where frozen accounts cannot send money"
**Where to change**:
1. Add `private boolean isFrozen = false;` in `Account.java` (with getter/setter).
2. In `LedgerService.java` inside `transfer()`:
   ```java
   if (sender.isFrozen()) {
       throw new AccountFrozenException("Account " + sender.getAccountNumber() + " is frozen");
   }
   ```

### Question 3: "Add a maximum single-transfer limit of $10,000"
**Where to change**: In `LedgerService.java` inside `validatePositiveAmount()`:
```java
if (amount.compareTo(new BigDecimal("10000.00")) > 0) {
    throw new InvalidAmountException("Transfer amount exceeds maximum single transaction limit of $10,000.00");
}
```

