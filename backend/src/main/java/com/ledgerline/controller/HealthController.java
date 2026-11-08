package com.ledgerline.controller;

import com.ledgerline.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealth() {
        Map<String, Object> status = Map.of(
                "status", "UP",
                "service", "LedgerLine Financial Core",
                "version", "1.0.0",
                "timestamp", Instant.now()
        );
        return ResponseEntity.ok(ApiResponse.ok("System healthy", status));
    }
}

