package com.ledgerline.service;

import com.ledgerline.entity.AuditLog;
import com.ledgerline.entity.User;
import com.ledgerline.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    // MANDATORY: REQUIRES_NEW propagation ensures audit logs persist even if an operation fails or rolls back
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(User actor, String action, String entityType, String entityId, String ipAddress, String details) {
        AuditLog log = new AuditLog(actor, action, entityType, entityId, ipAddress, details);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsForActor(UUID actorId) {
        return auditLogRepository.findAllByActorIdOrderByCreatedAtDesc(actorId);
    }
}

