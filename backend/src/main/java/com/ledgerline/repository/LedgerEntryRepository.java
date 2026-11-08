package com.ledgerline.repository;

import com.ledgerline.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, UUID> {
    List<LedgerEntry> findAllByTransactionId(UUID transactionId);
    List<LedgerEntry> findAllByAccountIdOrderByCreatedAtDesc(UUID accountId);
}

