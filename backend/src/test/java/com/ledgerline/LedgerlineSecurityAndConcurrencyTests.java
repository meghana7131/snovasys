package com.ledgerline;

import com.ledgerline.dto.TransferRequest;
import com.ledgerline.entity.*;
import com.ledgerline.exception.*;
import com.ledgerline.repository.*;
import com.ledgerline.service.IdempotencyService;
import com.ledgerline.service.LedgerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class LedgerlineSecurityAndConcurrencyTests {

    @Autowired
    private LedgerService ledgerService;

    @Autowired
    private IdempotencyService idempotencyService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private User alice;
    private User bob;
    private User auditor;
    private Account aliceAccount;
    private Account bobAccount;
    private Account reserveAccount;

    @BeforeEach
    void setUp() {
        // Clean state
        accountRepository.deleteAll();
        userRepository.deleteAll();

        alice = userRepository.save(new User("alice_test", "alice_test@example.com", "hash", Role.ROLE_USER));
        bob = userRepository.save(new User("bob_test", "bob_test@example.com", "hash", Role.ROLE_USER));
        auditor = userRepository.save(new User("auditor_test", "auditor_test@example.com", "hash", Role.ROLE_AUDITOR));

        reserveAccount = accountRepository.save(new Account(null, "SYS-TEST-001", AccountType.SYSTEM_RESERVE, new BigDecimal("100000.00"), "USD"));
        aliceAccount = accountRepository.save(new Account(alice, "ACC-ALICE-TEST", AccountType.USER_CHECKING, new BigDecimal("100.00"), "USD"));
        bobAccount = accountRepository.save(new Account(bob, "ACC-BOB-TEST", AccountType.USER_CHECKING, new BigDecimal("50.00"), "USD"));
    }

    @Test
    @DisplayName("THREAT-01: Simultaneous Withdrawal Race Condition (Double-Spending Defense)")
    void testConcurrentSimultaneousWithdrawalsOnlyOneSucceeds() throws InterruptedException {
        // Alice starts with $100.00.
        // Two threads fire simultaneously trying to withdraw $80.00 each.
        // In an unsafe system, both threads read $100, both succeed, leaving balance at -$60.
        // In LedgerLine with pessimistic locking, exactly ONE must succeed, and the other must fail with InsufficientFundsException!
        int numThreads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numThreads);
        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch endGate = new CountDownLatch(numThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < numThreads; i++) {
            executor.submit(() -> {
                try {
                    startGate.await(); // Synchronize thread start
                    ledgerService.withdraw(aliceAccount.getId(), new BigDecimal("80.00"), "Simultaneous withdrawal", alice, "127.0.0.1");
                    successCount.incrementAndGet();
                } catch (InsufficientFundsException e) {
                    failureCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                } finally {
                    endGate.countDown();
                }
            });
        }

        startGate.countDown(); // Fire both threads at once
        endGate.await(5, TimeUnit.SECONDS);
        executor.shutdown();

        assertEquals(1, successCount.get(), "Exactly one withdrawal should succeed");
        assertEquals(1, failureCount.get(), "The second simultaneous withdrawal must fail due to insufficient funds");

        Account updatedAlice = accountRepository.findById(aliceAccount.getId()).orElseThrow();
        assertEquals(new BigDecimal("20.00"), updatedAlice.getBalance(), "Final balance must be exactly $20.00 (no overdraft)");
    }

    @Test
    @DisplayName("THREAT-02: Idempotent Request Replay Returns Cached Result Without Re-Executing")
    void testIdempotentRequestReturnsCachedResultWithoutReExecuting() {
        String key = "test-idem-key-" + UUID.randomUUID();
        String payload = "{\"amount\": 30.00}";
        String hash = idempotencyService.computeHash(payload);

        // First call
        Optional<IdempotencyRecord> firstCheck = idempotencyService.checkAndLockKey(key, alice, hash);
        assertTrue(firstCheck.isEmpty(), "First request should be fresh");

        idempotencyService.recordSuccess(key, 200, "{\"status\": \"OK\"}");

        // Duplicate call with same key and payload
        Optional<IdempotencyRecord> duplicateCheck = idempotencyService.checkAndLockKey(key, alice, hash);
        assertTrue(duplicateCheck.isPresent(), "Duplicate request should be caught by idempotency layer");
        assertEquals(IdempotencyStatus.COMPLETED, duplicateCheck.get().getStatus());
        assertEquals("{\"status\": \"OK\"}", duplicateCheck.get().getResponseBody());
    }

    @Test
    @DisplayName("THREAT-03: Idempotency Key Replay with Mismatched Payload is Rejected")
    void testIdempotencyKeyWithMismatchedPayloadRejected() {
        String key = "tampered-idem-key-" + UUID.randomUUID();
        String payloadOriginal = "{\"amount\": 10.00, \"to\": \"bob\"}";
        String payloadTampered = "{\"amount\": 500.00, \"to\": \"mallory\"}";

        String originalHash = idempotencyService.computeHash(payloadOriginal);
        String tamperedHash = idempotencyService.computeHash(payloadTampered);

        // Register original
        idempotencyService.checkAndLockKey(key, alice, originalHash);

        // Attempt replay with tampered payload
        assertThrows(IdempotencyConflictException.class, () -> {
            idempotencyService.checkAndLockKey(key, alice, tamperedHash);
        }, "Replaying an idempotency key with different payload must throw IdempotencyConflictException");
    }

    @Test
    @DisplayName("THREAT-04: IDOR Protection — User Cannot Transfer From Another User's Account")
    void testUserCannotTransferFromAnotherUsersAccount() {
        // Bob attempts to initiate a transfer using Alice's account as source
        assertThrows(UnauthorizedAccountAccessException.class, () -> {
            ledgerService.transfer(
                    aliceAccount.getId(),
                    bobAccount.getId(),
                    new BigDecimal("10.00"),
                    "Malicious transfer attempt",
                    bob, // Bob is the caller, but source is Alice's account!
                    "127.0.0.1"
            );
        }, "Attempting to spend another user's funds must be rejected with UnauthorizedAccountAccessException");
    }

    @Test
    @DisplayName("THREAT-07: Negative and Zero Transfer Amounts are Strictly Rejected")
    void testNegativeAndZeroAmountsRejected() {
        assertThrows(InvalidAmountException.class, () -> {
            ledgerService.transfer(aliceAccount.getId(), bobAccount.getId(), new BigDecimal("-50.00"), "Negative amount", alice, "127.0.0.1");
        });

        assertThrows(InvalidAmountException.class, () -> {
            ledgerService.transfer(aliceAccount.getId(), bobAccount.getId(), BigDecimal.ZERO, "Zero amount", alice, "127.0.0.1");
        });
    }

    @Test
    @DisplayName("THREAT-06: System Money Conservation Invariant Holds After Valid Transfer")
    void testMoneyConservationHoldsAfterTransfer() {
        BigDecimal initialTotal = ledgerService.getTotalSystemMoney();

        // Transfer $25.00 from Alice to Bob
        ledgerService.transfer(aliceAccount.getId(), bobAccount.getId(), new BigDecimal("25.00"), "Valid transfer", alice, "127.0.0.1");

        BigDecimal finalTotal = ledgerService.getTotalSystemMoney();
        assertEquals(0, initialTotal.compareTo(finalTotal), "Total money in system must be strictly conserved after transfer");
    }
}

