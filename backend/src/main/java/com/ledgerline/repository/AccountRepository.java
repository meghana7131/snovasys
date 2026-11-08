package com.ledgerline.repository;

import com.ledgerline.entity.Account;
import com.ledgerline.entity.AccountType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {

    Optional<Account> findByAccountNumber(String accountNumber);

    List<Account> findAllByUserId(UUID userId);

    // Enforce IDOR protection: only return account if owned by the user
    Optional<Account> findByIdAndUserId(UUID id, UUID userId);

    Optional<Account> findFirstByType(AccountType type);

    // Concurrency defense: Acquire exclusive write lock (SELECT ... FOR UPDATE)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.id = :id")
    Optional<Account> findByIdWithLock(@Param("id") UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.accountNumber = :accountNumber")
    Optional<Account> findByAccountNumberWithLock(@Param("accountNumber") String accountNumber);

    // Money conservation invariant check: Total sum of all accounts
    @Query("SELECT COALESCE(SUM(a.balance), 0) FROM Account a")
    BigDecimal calculateTotalSystemMoney();
}

