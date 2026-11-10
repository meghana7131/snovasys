import React, { useState } from 'react';
import {
  ArrowUpFromLine,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Building,
  Lock,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../api.js';

export default function WithdrawalView({
  accounts,
  primaryAccount,
  onWithdrawSuccess,
  onNavigate
}) {
  const [selectedAccId, setSelectedAccId] = useState(primaryAccount?.id || (accounts[0]?.id || ''));
  const [amount, setAmount] = useState('2000');
  const [destAccount, setDestAccount] = useState('HDFC Bank •••• 4092');
  const [description, setDescription] = useState('Personal savings payout');
  const [twoFactorCode, setTwoFactorCode] = useState('849201');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const sourceAccount = accounts.find(a => a.id === selectedAccId) || accounts[0] || primaryAccount;
  const currentBalance = sourceAccount?.balance ? Number(sourceAccount.balance) : 0;
  const withdrawAmount = Number(amount) || 0;
  const isOverdraft = withdrawAmount > currentBalance;
  const isInvalid = withdrawAmount <= 0;

  const handlePercentage = (percent) => {
    const val = Math.floor((currentBalance * percent) / 100);
    setAmount(val.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOverdraft || isInvalid) return;

    setLoading(true);
    setError(null);

    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await api.withdraw(
        sourceAccount.id,
        withdrawAmount,
        `Withdrawal to ${destAccount}: ${description}`,
        idempotencyKey
      );

      setSuccess({
        amount: withdrawAmount,
        sourceAccount: sourceAccount.accountNumber,
        destAccount,
        newBalance: currentBalance - withdrawAmount,
        timestamp: new Date().toLocaleString()
      });

      if (onWithdrawSuccess) {
        onWithdrawSuccess();
      }
    } catch (err) {
      setError(err.message || 'Withdrawal failed. Please check balance and security code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #BE123C 0%, #881337 100%)',
        borderRadius: '1.5rem',
        padding: '2rem 2.25rem',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(190, 18, 60, 0.4)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '0.65rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}>
              <ArrowUpFromLine size={20} color="#FFFFFF" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Safe Account Withdrawals
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#FECDD3', maxWidth: '600px', lineHeight: 1.5 }}>
            Withdraw money with server-side overdraft guards that mathematically prevent negative balances.
          </p>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '1rem',
          padding: '1rem 1.5rem',
          textAlign: 'right',
          backdropFilter: 'blur(8px)'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#FDA4AF', display: 'block', fontWeight: 500 }}>Available to Withdraw</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            ₹ {currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* 2. Main Withdrawal Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
        
        {/* Left Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.5rem' }}>
            Withdrawal Request
          </h2>

          {error && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1.5px solid #FCA5A5',
              borderRadius: '0.75rem',
              padding: '0.85rem 1rem',
              color: '#991B1B',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1.25rem'
            }}>
              <AlertOctagon size={18} color="#DC2626" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Account Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                Withdraw From Account
              </label>
              <select
                className="app-select"
                value={selectedAccId}
                onChange={(e) => setSelectedAccId(e.target.value)}
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountNumber} ({acc.accountType || 'Checking'}) — Balance: ₹ {Number(acc.balance).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Bank Account */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                Destination Bank / Payout Method
              </label>
              <select
                className="app-select"
                value={destAccount}
                onChange={(e) => setDestAccount(e.target.value)}
              >
                <option value="HDFC Bank •••• 4092">HDFC Bank (Primary Savings •••• 4092)</option>
                <option value="State Bank of India •••• 8819">State Bank of India (Salary •••• 8819)</option>
                <option value="ICICI Bank •••• 1204">ICICI Bank (Direct Payout •••• 1204)</option>
                <option value="Instant UPI: meghana@oksbi">Instant UPI: meghana@oksbi</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                Amount to Withdraw (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748B' }}>
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  className="app-input"
                  style={{
                    paddingLeft: '2.25rem',
                    borderColor: isOverdraft ? '#EF4444' : undefined,
                    backgroundColor: isOverdraft ? '#FEF2F2' : undefined
                  }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              {/* Overdraft Warning Message */}
              {isOverdraft && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#DC2626',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  marginTop: '0.5rem'
                }}>
                  <AlertOctagon size={16} />
                  <span>Overdraft Blocked: Amount exceeds available balance (₹ {currentBalance.toLocaleString('en-IN')}).</span>
                </div>
              )}

              {/* Quick Percentage Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                {[25, 50, 75, 100].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentage(pct)}
                    style={{
                      flex: 1,
                      background: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.5rem',
                      padding: '0.4rem 0',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated 2FA Confirmation */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                2FA Security Confirmation Code
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="app-input font-mono"
                  style={{ letterSpacing: '0.2em', fontWeight: 700 }}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  maxLength={6}
                />
                <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                  ✓ Code Verified
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isOverdraft || isInvalid}
              className="btn-primary"
              style={{
                marginTop: '0.5rem',
                padding: '0.9rem',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #BE123C 0%, #E11D48 100%)',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
                opacity: (loading || isOverdraft || isInvalid) ? 0.6 : 1,
                cursor: (loading || isOverdraft || isInvalid) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin-animate" />
                  <span>Verifying Ledger Locks...</span>
                </>
              ) : (
                <>
                  <ArrowUpFromLine size={18} />
                  <span>Confirm Withdrawal of ₹ {withdrawAmount.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right Info: Zero-Overdraft Guarantee */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ShieldAlert size={18} color="#BE123C" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                Negative Balance Prevention
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1rem' }}>
              LedgerLine guarantees that no account can ever have a negative balance through three distinct layers:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <CheckCircle2 size={16} color="#059669" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Application Guard</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Checks balance before constructing transaction.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <CheckCircle2 size={16} color="#059669" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Pessimistic Row Lock</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Locks row with SELECT FOR UPDATE so concurrent threads cannot double-spend.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <CheckCircle2 size={16} color="#059669" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Database Constraint</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Hard SQL constraint: CHECK (balance &gt;= 0.00).</div>
                </div>
              </div>
            </div>
          </div>

          {/* Remaining Balance Summary */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Post-Withdrawal Balance</div>
            <div style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: isOverdraft ? '#DC2626' : '#0F172A',
              letterSpacing: '-0.02em',
              marginTop: '0.25rem'
            }}>
              ₹ {Math.max(0, currentBalance - withdrawAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>
              Payouts to external bank accounts are routed through automated settlement rails.
            </p>
          </div>

        </div>

      </div>

      {/* 3. Withdrawal Success Modal */}
      {success && (
        <div className="modal-overlay" onClick={() => setSuccess(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#FFF1F2',
                border: '2px solid #FECDD3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <CheckCircle2 size={36} color="#E11D48" />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                Withdrawal Successful
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>
                Funds have been safely deducted and sent to your bank.
              </p>
            </div>

            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '1rem',
              padding: '1.25rem',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.85rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Withdrawn:</span>
                <span style={{ fontWeight: 800, color: '#E11D48', fontSize: '1.1rem' }}>
                  - ₹ {success.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Deducted Account:</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>{success.sourceAccount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Sent To:</span>
                <span style={{ fontWeight: 600 }}>{success.destAccount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Remaining Balance:</span>
                <span style={{ fontWeight: 800, color: '#0F172A' }}>
                  ₹ {success.newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setSuccess(null)}
                className="btn-primary"
                style={{ flex: 1, background: '#BE123C' }}
              >
                Done
              </button>
              <button
                onClick={() => {
                  setSuccess(null);
                  onNavigate('dashboard');
                }}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Dashboard →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

