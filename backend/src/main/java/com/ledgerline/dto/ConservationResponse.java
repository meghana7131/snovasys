package com.ledgerline.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class ConservationResponse {
    private BigDecimal totalSystemMoney;
    private boolean conserved;
    private String statusMessage;
    private Instant auditedAt = Instant.now();

    public ConservationResponse() {}

    public ConservationResponse(BigDecimal totalSystemMoney, boolean conserved, String statusMessage) {
        this.totalSystemMoney = totalSystemMoney;
        this.conserved = conserved;
        this.statusMessage = statusMessage;
        this.auditedAt = Instant.now();
    }

    public BigDecimal getTotalSystemMoney() { return totalSystemMoney; }
    public boolean isConserved() { return conserved; }
    public String getStatusMessage() { return statusMessage; }
    public Instant getAuditedAt() { return auditedAt; }
}
