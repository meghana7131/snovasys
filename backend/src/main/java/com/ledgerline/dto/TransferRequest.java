package com.ledgerline.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class TransferRequest {

    @NotNull(message = "Sender account ID is required")
    private UUID senderAccountId;

    @NotNull(message = "Recipient account ID is required")
    private UUID recipientAccountId;

    @NotNull(message = "Transfer amount is required")
    @DecimalMin(value = "0.01", message = "Transfer amount must be at least 0.01")
    @Digits(integer = 13, fraction = 2, message = "Amount cannot have more than 2 decimal digits")
    private BigDecimal amount;

    private String description;

    public TransferRequest() {}

    public TransferRequest(UUID senderAccountId, UUID recipientAccountId, BigDecimal amount, String description) {
        this.senderAccountId = senderAccountId;
        this.recipientAccountId = recipientAccountId;
        this.amount = amount;
        this.description = description;
    }

    public UUID getSenderAccountId() { return senderAccountId; }
    public void setSenderAccountId(UUID senderAccountId) { this.senderAccountId = senderAccountId; }

    public UUID getRecipientAccountId() { return recipientAccountId; }
    public void setRecipientAccountId(UUID recipientAccountId) { this.recipientAccountId = recipientAccountId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

