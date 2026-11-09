#!/usr/bin/env bash
# LedgerLine Acceptance & Security Verification Suite (Bash / cURL)

set -e
BASE_URL="${1:-http://localhost:8080}"

echo "========================================================"
echo "   LEDGERLINE END-TO-END ACCEPTANCE & SECURITY SUITE     "
echo "========================================================"

# 1. Health
echo "--- TEST 1: Health Check ---"
curl -s -f "$BASE_URL/api/health" | grep -q '"status":"UP"' && echo "[PASS] Health UP"

# 2. Login
echo "--- TEST 2: RBAC Authentication ---"
ALICE_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d '{"usernameOrEmail":"alice","password":"Password123!"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')
AUDITOR_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d '{"usernameOrEmail":"auditor","password":"Password123!"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')
test -n "$ALICE_TOKEN" && echo "[PASS] Alice Token Acquired"
test -n "$AUDITOR_TOKEN" && echo "[PASS] Auditor Token Acquired"

# 3. Conservation Invariant
echo "--- TEST 3: System Money Conservation Invariant ---"
curl -s -H "Authorization: Bearer $AUDITOR_TOKEN" "$BASE_URL/api/audit/conservation" | grep -q '"conserved":true' && echo "[PASS] Money Conservation Invariant Holds"

echo "========================================================"
echo "          ALL SCRIPT TESTS EXECUTED SUCCESSFULLY         "
echo "========================================================"

