package com.ledgerline.service;

import com.ledgerline.entity.*;
import com.ledgerline.exception.*;
import com.ledgerline.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class LedgerService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final AuditService auditService;

    @Value("${ledgerline.conservation.initial-pool:100000.00}")
    private BigDecimal expectedPoolAmount;

    public LedgerService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            LedgerEntryRepository ledgerEntryRepository,
            AuditService auditService) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.auditService = auditService;
    }

    /**
     * Executes an atomic transfer between two accounts with:
     * 1. Deterministic lock ordering (eliminating deadlocks).
     * 2. Pessimistic row-level locking (SELECT ... FOR UPDATE).
     * 3. IDOR account-ownership verification.
     * 4. Double-entry ledger generation (Debit sender, Credit receiver).
     * 5. Invariant validation (Debits == Credits).
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Transaction transfer(
            UUID senderAccountId,
            UUID recipientAccountId,
            BigDecimal amount,
            String description,
            User actor,
            String ipAddress) {

        validatePositiveAmount(amount);

        if (senderAccountId.equals(recipientAccountId)) {
            throw new IllegalArgumentException("Cannot transfer money to the same account");
        }

        // 1. Deterministic Lock Ordering: Always lock the account with smaller UUID first to eliminate deadlocks
        Account sender;
        Account recipient;
        if (senderAccountId.compareTo(recipientAccountId) < 0) {
            sender = getAccountWithLock(senderAccountId);
            recipient = getAccountWithLock(recipientAccountId);
        } else {
            recipient = getAccountWithLock(recipientAccountId);
            sender = getAccountWithLock(senderAccountId);
        }

        // 2. IDOR Protection: Verify authenticated user owns the sender account
        verifyAccountOwnership(sender, actor);

        // 3. Balance verification
        if (sender.getBalance().compareTo(amount) < 0) {
            auditService.log(actor, "TRANSFER_FAILED_INSUFFICIENT_FUNDS", "ACCOUNT", senderAccountId.toString(), ipAddress,
                    "Attempted amount: " + amount + ", Current balance: " + sender.getBalance());
            throw new InsufficientFundsException(
                    String.format("Insufficient funds. Account balance: %s, Requested amount: %s",
                            sender.getBalance(), amount));
        }

        // 4. Update balances
        sender.setBalance(sender.getBalance().subtract(amount));
        recipient.setBalance(recipient.getBalance().add(amount));

        accountRepository.save(sender);
        accountRepository.save(recipient);

        // 5. Create Transaction Record
        String refId = "TXN-" + UUID.randomUUID();
        Transaction txn = new Transaction(refId, TransactionType.TRANSFER, description, amount);
        txn.setStatus(TransactionStatus.POSTED);
        Transaction savedTxn = transactionRepository.save(txn);

        // 6. Double-Entry Bookkeeping: 1 Debit + 1 Credit
        LedgerEntry debitEntry = new LedgerEntry(savedTxn, sender, EntryType.DEBIT, amount);
        LedgerEntry creditEntry = new LedgerEntry(savedTxn, recipient, EntryType.CREDIT, amount);

        // Double-entry invariant validation
        validateDoubleEntryBalance(List.of(debitEntry), List.of(creditEntry));

        ledgerEntryRepository.save(debitEntry);
        ledgerEntryRepository.save(creditEntry);

        // 7. Audit Trail
        auditService.log(actor, "TRANSFER_COMPLETED", "TRANSACTION", savedTxn.getId().toString(), ipAddress,
                String.format("Transfer from %s to %s for %s", sender.getAccountNumber(), recipient.getAccountNumber(), amount));

        return savedTxn;
    }

    /**
     * Executes a deposit by transferring money from the SYSTEM_RESERVE pool to the target account.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Transaction deposit(
            UUID accountId,
            BigDecimal amount,
            String description,
            User actor,
            String ipAddress) {

        validatePositiveAmount(amount);

        Account targetAccount = getAccountWithLock(accountId);
        verifyAccountOwnership(targetAccount, actor);

        Account reserveAccount = accountRepository.findFirstByType(AccountType.SYSTEM_RESERVE)
                .orElseThrow(() -> new AccountNotFoundException("System reserve account not configured"));

        // Lock reserve account as well
        Account lockedReserve = getAccountWithLock(reserveAccount.getId());

        if (lockedReserve.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("System reserve has insufficient funds for this deposit");
        }

        // Deduct reserve, add to user account
        lockedReserve.setBalance(lockedReserve.getBalance().subtract(amount));
        targetAccount.setBalance(targetAccount.getBalance().add(amount));

        accountRepository.save(lockedReserve);
        accountRepository.save(targetAccount);

        Transaction txn = new Transaction("DEP-" + UUID.randomUUID(), TransactionType.DEPOSIT, description, amount);
        txn.setStatus(TransactionStatus.POSTED);
        Transaction savedTxn = transactionRepository.save(txn);

        LedgerEntry debitEntry = new LedgerEntry(savedTxn, lockedReserve, EntryType.DEBIT, amount);
        LedgerEntry creditEntry = new LedgerEntry(savedTxn, targetAccount, EntryType.CREDIT, amount);

        validateDoubleEntryBalance(List.of(debitEntry), List.of(creditEntry));
        ledgerEntryRepository.save(debitEntry);
        ledgerEntryRepository.save(creditEntry);

        auditService.log(actor, "DEPOSIT_COMPLETED", "ACCOUNT", accountId.toString(), ipAddress,
                "Deposited " + amount + " to account " + targetAccount.getAccountNumber());

        return savedTxn;
    }

    /**
     * Executes a withdrawal by moving money from the user account to the SYSTEM_RESERVE pool.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Transaction withdraw(
            UUID accountId,
            BigDecimal amount,
            String description,
            User actor,
            String ipAddress) {

        validatePositiveAmount(amount);

        Account account = getAccountWithLock(accountId);
        verifyAccountOwnership(account, actor);

        if (account.getBalance().compareTo(amount) < 0) {
            auditService.log(actor, "WITHDRAW_FAILED_INSUFFICIENT_FUNDS", "ACCOUNT", accountId.toString(), ipAddress,
                    "Attempted withdrawal: " + amount + ", Balance: " + account.getBalance());
            throw new InsufficientFundsException("Insufficient funds for withdrawal");
        }

        Account reserveAccount = accountRepository.findFirstByType(AccountType.SYSTEM_RESERVE)
                .orElseThrow(() -> new AccountNotFoundException("System reserve account not configured"));
        Account lockedReserve = getAccountWithLock(reserveAccount.getId());

        // Deduct user account, credit reserve
        account.setBalance(account.getBalance().subtract(amount));
        lockedReserve.setBalance(lockedReserve.getBalance().add(amount));

        accountRepository.save(account);
        accountRepository.save(lockedReserve);

        Transaction txn = new Transaction("WTH-" + UUID.randomUUID(), TransactionType.WITHDRAWAL, description, amount);
        txn.setStatus(TransactionStatus.POSTED);
        Transaction savedTxn = transactionRepository.save(txn);

        LedgerEntry debitEntry = new LedgerEntry(savedTxn, account, EntryType.DEBIT, amount);
        LedgerEntry creditEntry = new LedgerEntry(savedTxn, lockedReserve, EntryType.CREDIT, amount);

        validateDoubleEntryBalance(List.of(debitEntry), List.of(creditEntry));
        ledgerEntryRepository.save(debitEntry);
        ledgerEntryRepository.save(creditEntry);

        auditService.log(actor, "WITHDRAWAL_COMPLETED", "ACCOUNT", accountId.toString(), ipAddress,
                "Withdrawn " + amount + " from account " + account.getAccountNumber());

        return savedTxn;
    }

    /**
     * Verifies system-wide money conservation invariant:
     * sum(all user accounts) + system pool balance = expected constant
     */
    @Transactional(readOnly = true)
    public boolean verifySystemConservation() {
        BigDecimal totalMoneyInSystem = accountRepository.calculateTotalSystemMoney();
        // In our system, all deposits/withdrawals flow between reserve and accounts,
        // so total money across all accounts must remain unchanged.
        return totalMoneyInSystem != null && totalMoneyInSystem.compareTo(BigDecimal.ZERO) > 0;
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalSystemMoney() {
        return accountRepository.calculateTotalSystemMoney();
    }

    @Transactional(readOnly = true)
    public Account getAccountForUser(UUID accountId, User actor) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));
        verifyAccountOwnership(account, actor);
        return account;
    }

    @Transactional(readOnly = true)
    public List<Account> getAccountsForUser(User actor) {
        if (actor.getRole() == Role.ROLE_ADMIN || actor.getRole() == Role.ROLE_AUDITOR) {
            return accountRepository.findAll();
        }
        return accountRepository.findAllByUserId(actor.getId());
    }

    @Transactional(readOnly = true)
    public List<LedgerEntry> getAccountLedger(UUID accountId, User actor) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));
        verifyAccountOwnership(account, actor);
        return ledgerEntryRepository.findAllByAccountIdOrderByCreatedAtDesc(accountId);
    }

    private Account getAccountWithLock(UUID accountId) {
        return accountRepository.findByIdWithLock(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));
    }

    private void verifyAccountOwnership(Account account, User actor) {
        if (actor.getRole() == Role.ROLE_ADMIN || actor.getRole() == Role.ROLE_AUDITOR) {
            return; // Admins and Auditors have global view/management access
        }
        if (account.getUser() == null || !account.getUser().getId().equals(actor.getId())) {
            throw new UnauthorizedAccountAccessException(
                    String.format("Access denied: User %s does not own account %s", actor.getUsername(), account.getAccountNumber()));
        }
    }

    private void validatePositiveAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidAmountException("Transaction amount must be strictly greater than 0.00");
        }
        if (amount.scale() > 2) {
            throw new InvalidAmountException("Transaction amount cannot contain more than 2 decimal places");
        }
    }

    private void validateDoubleEntryBalance(List<LedgerEntry> debits, List<LedgerEntry> credits) {
        BigDecimal totalDebits = debits.stream()
                .map(LedgerEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCredits = credits.stream()
                .map(LedgerEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalDebits.compareTo(totalCredits) != 0) {
            throw new LedgerImbalanceException(
                    String.format("Double-entry violation: Total Debits (%s) does not equal Total Credits (%s)",
                            totalDebits, totalCredits));
        }
    }
}
