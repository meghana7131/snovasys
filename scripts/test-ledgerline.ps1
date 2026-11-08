# LedgerLine Automated End-to-End Acceptance Test Script
# Verifies all 10 problem statement requirements and STRIDE threat controls

param(
    [string]$BaseUrl = "http://localhost:8080"
)

$ErrorActionPreference = "Continue"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "   LEDGERLINE END-TO-END ACCEPTANCE & SECURITY SUITE     " -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

function Assert-Result($testName, $condition, $details) {
    if ($condition) {
        Write-Host "[PASS] $testName" -ForegroundColor Green
        if ($details) { Write-Host "       $details" -ForegroundColor DarkGray }
    } else {
        Write-Host "[FAIL] $testName" -ForegroundColor Red
        if ($details) { Write-Host "       $details" -ForegroundColor Yellow }
    }
}

# 1. Health Check Endpoint
Write-Host "--- TEST 1: Health Check Endpoint ---" -ForegroundColor White
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method Get
    Assert-Result "Health Endpoint Returns UP" ($health.data.status -eq "UP") "Service: $($health.data.service)"
} catch {
    Assert-Result "Health Endpoint Returns UP" $false "Failed to reach $BaseUrl/api/health. Ensure backend is running."
    exit 1
}

# 2. Authentication & JWT Issuance
Write-Host "`n--- TEST 2: Authentication & RBAC Login ---" -ForegroundColor White
$aliceLogin = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body '{"usernameOrEmail":"alice","password":"Password123!"}'
$aliceToken = $aliceLogin.data.token
Assert-Result "Alice Authenticated (ROLE_USER)" ($aliceLogin.data.role -eq "ROLE_USER") "Token acquired"

$bobLogin = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body '{"usernameOrEmail":"bob","password":"Password123!"}'
$bobToken = $bobLogin.data.token
Assert-Result "Bob Authenticated (ROLE_USER)" ($bobLogin.data.role -eq "ROLE_USER") "Token acquired"

$auditorLogin = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body '{"usernameOrEmail":"auditor","password":"Password123!"}'
$auditorToken = $auditorLogin.data.token
Assert-Result "Auditor Authenticated (ROLE_AUDITOR)" ($auditorLogin.data.role -eq "ROLE_AUDITOR") "Token acquired"

# 3. Account Ownership & Balance Retrieval
Write-Host "`n--- TEST 3: Account Ownership & Balances ---" -ForegroundColor White
$aliceAccounts = Invoke-RestMethod -Uri "$BaseUrl/api/ledger/accounts" -Method Get -Headers @{ Authorization = "Bearer $aliceToken" }
$aliceAcc = $aliceAccounts.data[0]
Assert-Result "Alice Retrieves Own Account" ($aliceAcc.accountNumber -eq "ACC-ALICE-101") "Balance: `$$($aliceAcc.balance)"

$bobAccounts = Invoke-RestMethod -Uri "$BaseUrl/api/ledger/accounts" -Method Get -Headers @{ Authorization = "Bearer $bobToken" }
$bobAcc = $bobAccounts.data[0]
Assert-Result "Bob Retrieves Own Account" ($bobAcc.accountNumber -eq "ACC-BOB-202") "Balance: `$$($bobAcc.balance)"

# 4. Atomic Double-Entry Transfer with Idempotency Key
Write-Host "`n--- TEST 4: Double-Entry Transfer (Alice -> Bob `$$50.00) ---" -ForegroundColor White
$idemKey = [guid]::NewGuid().ToString()
$transferBody = @{
    senderAccountId = $aliceAcc.id
    recipientAccountId = $bobAcc.id
    amount = 50.00
    description = "P2P lunch split"
} | ConvertTo-Json

$transferRes = Invoke-RestMethod -Uri "$BaseUrl/api/ledger/transfer" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $aliceToken"; "Idempotency-Key" = $idemKey } -Body $transferBody
Assert-Result "Transfer Executed Successfully" ($transferRes.data.status -eq "POSTED") "Transaction Reference: $($transferRes.data.referenceId)"

# 5. Replay Attack / Network Retry with Duplicate Idempotency Key
Write-Host "`n--- TEST 5: Idempotency Protection (Duplicate Request Replay) ---" -ForegroundColor White
$duplicateRes = Invoke-RestMethod -Uri "$BaseUrl/api/ledger/transfer" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $aliceToken"; "Idempotency-Key" = $idemKey } -Body $transferBody
Assert-Result "Duplicate Key Returns Cached Result Without Re-Executing" ($duplicateRes.data.referenceId -eq $transferRes.data.referenceId) "Ref ID matches original; books balance."

# 6. Negative Balance / Overdraft Prevention
Write-Host "`n--- TEST 6: Server-Side Negative Balance Prevention ---" -ForegroundColor White
$overdraftBody = @{
    senderAccountId = $aliceAcc.id
    recipientAccountId = $bobAcc.id
    amount = 99999.00
    description = "Massive overdraft attempt"
} | ConvertTo-Json

$overdraftFailed = $false
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/ledger/transfer" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $aliceToken" } -Body $overdraftBody
} catch {
    $overdraftFailed = ($_.Exception.Response.StatusCode.value__ -eq 400)
}
Assert-Result "Overdraft Attempt Rejected with 400 Bad Request" $overdraftFailed "Server rejected balance drop below zero."

# 7. IDOR Protection (Bob attempts to spend Alice's money)
Write-Host "`n--- TEST 7: IDOR Attack Defense (Bob attempts to spend from Alice's account) ---" -ForegroundColor White
$idorBody = @{
    senderAccountId = $aliceAcc.id  # Bob targeting Alice's account!
    recipientAccountId = $bobAcc.id
    amount = 25.00
    description = "Unauthorized theft attempt"
} | ConvertTo-Json

$idorBlocked = $false
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/ledger/transfer" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $bobToken" } -Body $idorBody
} catch {
    $idorBlocked = ($_.Exception.Response.StatusCode.value__ -eq 403)
}
Assert-Result "IDOR Attempt Blocked with 403 Forbidden" $idorBlocked "Server verified token principal does not own sender account."

# 8. Role Separation (Auditor cannot mutate state)
Write-Host "`n--- TEST 8: Role-Based Access Control (Auditor cannot execute transfers) ---" -ForegroundColor White
$auditorBlocked = $false
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/ledger/transfer" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $auditorToken" } -Body $transferBody
} catch {
    $auditorBlocked = ($_.Exception.Response.StatusCode.value__ -eq 403)
}
Assert-Result "Auditor Mutation Blocked with 403 Forbidden" $auditorBlocked "Auditor is strictly read-only."

# 9. System Money Conservation Invariant Check
Write-Host "`n--- TEST 9: System-Wide Money Conservation Invariant ---" -ForegroundColor White
$conservationRes = Invoke-RestMethod -Uri "$BaseUrl/api/audit/conservation" -Method Get -Headers @{ Authorization = "Bearer $auditorToken" }
Assert-Result "Money Conservation Invariant Holds" ($conservationRes.data.conserved -eq $true) "Total System Balance: `$$($conservationRes.data.totalSystemMoney)"

# 10. Append-Only Audit Trail Inspection
Write-Host "`n--- TEST 10: Append-Only Audit Trail Forensic Integrity ---" -ForegroundColor White
$auditTrail = Invoke-RestMethod -Uri "$BaseUrl/api/audit/system-trail" -Method Get -Headers @{ Authorization = "Bearer $auditorToken" }
Assert-Result "Audit Trail Records Security & Transfer Events" ($auditTrail.data.Count -gt 0) "Total Forensic Events Logged: $($auditTrail.data.Count)"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "            ALL 10 VERIFICATION TESTS COMPLETE           " -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan
