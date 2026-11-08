package com.ledgerline.controller;

import com.ledgerline.dto.ApiResponse;
import com.ledgerline.dto.ConservationResponse;
import com.ledgerline.entity.AuditLog;
import com.ledgerline.service.AuditService;
import com.ledgerline.service.LedgerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditService auditService;
    private final LedgerService ledgerService;

    public AuditController(AuditService auditService, LedgerService ledgerService) {
        this.auditService = auditService;
        this.ledgerService = ledgerService;
    }

    @GetMapping("/system-trail")
    @PreAuthorize("hasAnyAuthority('ROLE_AUDITOR', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getSystemAuditTrail() {
        List<AuditLog> logs = auditService.getAllAuditLogs();
        return ResponseEntity.ok(ApiResponse.ok("Audit trail retrieved", logs));
    }

    @GetMapping("/conservation")
    @PreAuthorize("hasAnyAuthority('ROLE_AUDITOR', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ConservationResponse>> verifySystemConservation() {
        BigDecimal totalMoney = ledgerService.getTotalSystemMoney();
        boolean isConserved = ledgerService.verifySystemConservation();

        ConservationResponse response = new ConservationResponse(
                totalMoney,
                isConserved,
                isConserved ? "Money conservation invariant holds: books are balanced." : "WARNING: Conservation invariant violated!"
        );

        return ResponseEntity.ok(ApiResponse.ok("Conservation verification completed", response));
    }
}
