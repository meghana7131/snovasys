package com.ledgerline.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ledgerline.dto.*;
import com.ledgerline.entity.Account;
import com.ledgerline.entity.IdempotencyRecord;
import com.ledgerline.entity.LedgerEntry;
import com.ledgerline.entity.Transaction;
import com.ledgerline.entity.User;
import com.ledgerline.security.UserDetailsImpl;
import com.ledgerline.service.IdempotencyService;
import com.ledgerline.service.LedgerService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ledger")
public class LedgerController {

    private final LedgerService ledgerService;
    private final IdempotencyService idempotencyService;
    private final ObjectMapper objectMapper;

    public LedgerController(
            LedgerService ledgerService,
            IdempotencyService idempotencyService,
            ObjectMapper objectMapper) {
        this.ledgerService = ledgerService;
        this.idempotencyService = idempotencyService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<?> executeTransfer(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody TransferRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            HttpServletRequest httpRequest) throws JsonProcessingException {

        User actor = userDetails.getUser();
        String ipAddress = getClientIp(httpRequest);
        String requestJson = objectMapper.writeValueAsString(request);

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            String hash = idempotencyService.computeHash(requestJson);
            Optional<IdempotencyRecord> cached = idempotencyService.checkAndLockKey(idempotencyKey, actor, hash);
            if (cached.isPresent() && cached.get().getResponseBody() != null) {
                return ResponseEntity
                        .status(cached.get().getResponseCode() != null ? cached.get().getResponseCode() : 200)
                        .header("X-Cache-Lookup", "HIT")
                        .body(objectMapper.readTree(cached.get().getResponseBody()));
            }
        }

        try {
            Transaction txn = ledgerService.transfer(
                    request.getSenderAccountId(),
                    request.getRecipientAccountId(),
                    request.getAmount(),
                    request.getDescription(),
                    actor,
                    ipAddress);

            TransactionResponse response = new TransactionResponse(txn);
            ApiResponse<TransactionResponse> body = ApiResponse.ok("Transfer posted successfully", response);

            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                idempotencyService.recordSuccess(idempotencyKey, HttpStatus.OK.value(), objectMapper.writeValueAsString(body));
            }

            return ResponseEntity.ok(body);
        } catch (Exception e) {
            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                ApiResponse<?> errBody = ApiResponse.error(e.getMessage());
                idempotencyService.recordFailure(idempotencyKey, HttpStatus.BAD_REQUEST.value(), objectMapper.writeValueAsString(errBody));
            }
            throw e;
        }
    }

    @PostMapping("/deposit")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<?> executeDeposit(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody DepositRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            HttpServletRequest httpRequest) throws JsonProcessingException {

        User actor = userDetails.getUser();
        String ipAddress = getClientIp(httpRequest);
        String requestJson = objectMapper.writeValueAsString(request);

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            String hash = idempotencyService.computeHash(requestJson);
            Optional<IdempotencyRecord> cached = idempotencyService.checkAndLockKey(idempotencyKey, actor, hash);
            if (cached.isPresent() && cached.get().getResponseBody() != null) {
                return ResponseEntity
                        .status(cached.get().getResponseCode() != null ? cached.get().getResponseCode() : 200)
                        .header("X-Cache-Lookup", "HIT")
                        .body(objectMapper.readTree(cached.get().getResponseBody()));
            }
        }

        try {
            Transaction txn = ledgerService.deposit(
                    request.getAccountId(),
                    request.getAmount(),
                    request.getDescription(),
                    actor,
                    ipAddress);

            TransactionResponse response = new TransactionResponse(txn);
            ApiResponse<TransactionResponse> body = ApiResponse.ok("Deposit posted successfully", response);

            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                idempotencyService.recordSuccess(idempotencyKey, HttpStatus.OK.value(), objectMapper.writeValueAsString(body));
            }

            return ResponseEntity.ok(body);
        } catch (Exception e) {
            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                ApiResponse<?> errBody = ApiResponse.error(e.getMessage());
                idempotencyService.recordFailure(idempotencyKey, HttpStatus.BAD_REQUEST.value(), objectMapper.writeValueAsString(errBody));
            }
            throw e;
        }
    }

    @PostMapping("/withdraw")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<?> executeWithdrawal(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody WithdrawRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            HttpServletRequest httpRequest) throws JsonProcessingException {

        User actor = userDetails.getUser();
        String ipAddress = getClientIp(httpRequest);
        String requestJson = objectMapper.writeValueAsString(request);

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            String hash = idempotencyService.computeHash(requestJson);
            Optional<IdempotencyRecord> cached = idempotencyService.checkAndLockKey(idempotencyKey, actor, hash);
            if (cached.isPresent() && cached.get().getResponseBody() != null) {
                return ResponseEntity
                        .status(cached.get().getResponseCode() != null ? cached.get().getResponseCode() : 200)
                        .header("X-Cache-Lookup", "HIT")
                        .body(objectMapper.readTree(cached.get().getResponseBody()));
            }
        }

        try {
            Transaction txn = ledgerService.withdraw(
                    request.getAccountId(),
                    request.getAmount(),
                    request.getDescription(),
                    actor,
                    ipAddress);

            TransactionResponse response = new TransactionResponse(txn);
            ApiResponse<TransactionResponse> body = ApiResponse.ok("Withdrawal posted successfully", response);

            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                idempotencyService.recordSuccess(idempotencyKey, HttpStatus.OK.value(), objectMapper.writeValueAsString(body));
            }

            return ResponseEntity.ok(body);
        } catch (Exception e) {
            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                ApiResponse<?> errBody = ApiResponse.error(e.getMessage());
                idempotencyService.recordFailure(idempotencyKey, HttpStatus.BAD_REQUEST.value(), objectMapper.writeValueAsString(errBody));
            }
            throw e;
        }
    }

    @GetMapping("/accounts")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getAccounts(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Account> accounts = ledgerService.getAccountsForUser(userDetails.getUser());
        List<AccountResponse> responses = accounts.stream().map(AccountResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Accounts retrieved", responses));
    }

    @GetMapping("/accounts/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccount(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Account account = ledgerService.getAccountForUser(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Account retrieved", new AccountResponse(account)));
    }

    @GetMapping("/accounts/{id}/ledger")
    public ResponseEntity<ApiResponse<List<LedgerEntry>>> getAccountLedger(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<LedgerEntry> entries = ledgerService.getAccountLedger(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.ok("Ledger entries retrieved", entries));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}

