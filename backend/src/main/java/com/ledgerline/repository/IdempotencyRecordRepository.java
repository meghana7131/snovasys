package com.ledgerline.repository;

import com.ledgerline.entity.IdempotencyRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IdempotencyRecordRepository extends JpaRepository<IdempotencyRecord, UUID> {
    Optional<IdempotencyRecord> findByKey(String key);
    Optional<IdempotencyRecord> findByKeyAndUserId(String key, UUID userId);
}

