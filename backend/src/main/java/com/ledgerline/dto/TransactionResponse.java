package com.ledgerline.dto;

import com.ledgerline.entity.Transaction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class TransactionResponse {
    private UUID id;
    private String referenceId;
    private String transactionType;
    private BigDecimal amount;
    private String status;
    private String description;
    private Instant createdAt;

    public TransactionResponse() {}

    public TransactionResponse(Transaction transaction) {
        this.id = transaction.getId();
        this.referenceId = transaction.getReferenceId();
        this.transactionType = transaction.getTransactionType().name();
        this.amount = transaction.getAmount();
        this.status = transaction.getStatus().name();
        this.description = transaction.getDescription();
        this.createdAt = transaction.getCreatedAt();
    }

    public UUID getId() { return id; }
    public String getReferenceId() { return referenceId; }
    public String getTransactionType() { return transactionType; }
    public BigDecimal getAmount() { return amount; }
    public String getStatus() { return status; }
    public String getDescription() { return description; }
    public Instant getCreatedAt() { return createdAt; }
}

