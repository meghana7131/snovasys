package com.ledgerline.service;

import com.ledgerline.entity.IdempotencyRecord;
import com.ledgerline.entity.IdempotencyStatus;
import com.ledgerline.entity.User;
import com.ledgerline.exception.IdempotencyConflictException;
import com.ledgerline.repository.IdempotencyRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class IdempotencyService {

    private final IdempotencyRecordRepository idempotencyRecordRepository;

    public IdempotencyService(IdempotencyRecordRepository idempotencyRecordRepository) {
        this.idempotencyRecordRepository = idempotencyRecordRepository;
    }

    public String computeHash(String payload) {
        if (payload == null) {
            payload = "";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm unavailable", e);
        }
    }

    /**
     * Checks if key already processed or in-flight.
     * Returns existing record if cached, or empty if fresh.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Optional<IdempotencyRecord> checkAndLockKey(String key, User user, String requestHash) {
        Optional<IdempotencyRecord> existingOpt = idempotencyRecordRepository.findByKey(key);

        if (existingOpt.isPresent()) {
            IdempotencyRecord existing = existingOpt.get();

            // THREAT-03 Mitigation: Replay with mismatched payload rejected
            if (!existing.getRequestHash().equals(requestHash)) {
                throw new IdempotencyConflictException(
                        "Idempotency key '" + key + "' was previously submitted with a different payload");
            }

            return Optional.of(existing);
        }

        // Fresh request: reserve key in PROCESSING state
        Instant expiresAt = Instant.now().plus(24, ChronoUnit.HOURS);
        IdempotencyRecord freshRecord = new IdempotencyRecord(key, user, requestHash, expiresAt);
        idempotencyRecordRepository.save(freshRecord);
        return Optional.empty();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordSuccess(String key, int responseCode, String responseBody) {
        idempotencyRecordRepository.findByKey(key).ifPresent(record -> {
            record.setStatus(IdempotencyStatus.COMPLETED);
            record.setResponseCode(responseCode);
            record.setResponseBody(responseBody);
            idempotencyRecordRepository.save(record);
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailure(String key, int responseCode, String errorBody) {
        idempotencyRecordRepository.findByKey(key).ifPresent(record -> {
            record.setStatus(IdempotencyStatus.FAILED);
            record.setResponseCode(responseCode);
            record.setResponseBody(errorBody);
            idempotencyRecordRepository.save(record);
        });
    }
}

