-- LedgerLine Seed Data
-- Passwords below are hashed using BCrypt for password "Password123!"
-- BCrypt hash: $2a$10$wE9K2j6s96eC4L919gM7xOHm4LpI5m7Lg0H9q1h8oX/sH3.8g7h.e (or plain SHA256/argon2 in app)

-- System Reserve User (System internal)
INSERT INTO users (id, username, email, password_hash, role)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'system_admin', 'admin@ledgerline.internal', '$2a$10$wE9K2j6s96eC4L919gM7xOHm4LpI5m7Lg0H9q1h8oX/sH3.8g7h.e', 'ROLE_ADMIN'),
    ('00000000-0000-0000-0000-000000000002', 'compliance_auditor', 'auditor@ledgerline.internal', '$2a$10$wE9K2j6s96eC4L919gM7xOHm4LpI5m7Lg0H9q1h8oX/sH3.8g7h.e', 'ROLE_AUDITOR'),
    ('00000000-0000-0000-0000-000000000003', 'alice_holder', 'alice@example.com', '$2a$10$wE9K2j6s96eC4L919gM7xOHm4LpI5m7Lg0H9q1h8oX/sH3.8g7h.e', 'ROLE_USER'),
    ('00000000-0000-0000-0000-000000000004', 'bob_holder', 'bob@example.com', '$2a$10$wE9K2j6s96eC4L919gM7xOHm4LpI5m7Lg0H9q1h8oX/sH3.8g7h.e', 'ROLE_USER')
ON CONFLICT (id) DO NOTHING;

-- Accounts
-- 1. System Reserve Pool (Acts as counterparty for external deposits/withdrawals)
-- Initial system balance = 100,000.00
INSERT INTO accounts (id, user_id, account_number, type, balance, currency)
VALUES
    ('10000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'SYS-RESERVE-001', 'SYSTEM_RESERVE', 100000.00, 'USD'),
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'ACC-ALICE-101', 'USER_CHECKING', 1000.00, 'USD'),
    ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'ACC-BOB-202', 'USER_CHECKING', 500.00, 'USD')
ON CONFLICT (id) DO NOTHING;

-- Initial Conservation Baseline Constant:
-- Total System Money = 100,000 + 1,000 + 500 = $101,500.00

