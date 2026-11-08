package com.ledgerline.dto;

import com.ledgerline.entity.Account;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class AccountResponse {
    private UUID id;
    private String accountNumber;
    private String type;
    private BigDecimal balance;
    private String currency;
    private Instant createdAt;

    public AccountResponse() {}

    public AccountResponse(Account account) {
        this.id = account.getId();
        this.accountNumber = account.getAccountNumber();
        this.type = account.getType().name();
        this.balance = account.getBalance();
        this.currency = account.getCurrency();
        this.createdAt = account.getCreatedAt();
    }

    public UUID getId() { return id; }
    public String getAccountNumber() { return accountNumber; }
    public String getType() { return type; }
    public BigDecimal getBalance() { return balance; }
    public String getCurrency() { return currency; }
    public Instant getCreatedAt() { return createdAt; }
}
