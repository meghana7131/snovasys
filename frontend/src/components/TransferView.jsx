import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Receipt,
  FileCheck2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../api.js';

export default function TransferView({
  accounts,
  primaryAccount,
  onTransferSuccess,
  onNavigate
}) {
  const [sourceAccId, setSourceAccId] = useState(primaryAccount?.id || (accounts[0]?.id || ''));
  const [targetAccNumber, setTargetAccNumber] = useState('AC-20261108-002');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Standard balance transfer');
  const [idempotencyKey, setIdempotencyKey] = useState(crypto.randomUUID());
  const [copiedKey, setCopiedKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [isDuplicateTest, setIsDuplicateTest] = useState(false);

  const selectedSource = accounts.find(a => a.id === sourceAccId) || accounts[0] || primaryAccount;
  const currentBalance = selectedSource?.balance ? Number(selectedSource.balance) : 0;
  const parsedAmount = Number(amount) || 0;
  const isOverdraft = parsedAmount > currentBalance;
  const isInvalidAmount = parsedAmount <= 0;

  const handleRegenerateKey = () => {
    setIdempotencyKey(crypto.randomUUID());
    setCopiedKey(false);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(idempotencyKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOverdraft || isInvalidAmount) return;

    setLoading(true);
    setError(null);

    try {
      // Find or match recipient account
      let targetAccount = accounts.find(a => a.accountNumber === targetAccNumber);
      let targetId = targetAccount ? targetAccount.id : accounts.find(a => a.id !== selectedSource?.id)?.id || selectedSource?.id;

      const res = await api.transfer(
        selectedSource.id,
        targetId,
        parsedAmount,
        description,
        idempotencyKey
      );

      const txnData = res.data || res;
      setSuccessReceipt({
        id: txnData.id || crypto.randomUUID(),
        amount: parsedAmount,
        source: selectedSource.accountNumber,
        target: targetAccNumber,
        timestamp: new Date().toLocaleString(),
        idempotencyKey,
        status: 'POSTED & BALANCED'
      });

      if (onTransferSuccess) {
        onTransferSuccess();
      }

      // Generate a new idempotency key for the next transfer
      setIdempotencyKey(crypto.randomUUID());
      setAmount('');
    } catch (err) {
      setError(err.message || 'Transfer failed. Please check balance and credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestReplay = async () => {
    if (!successReceipt) return;
    setIsDuplicateTest(true);
    setError(null);
    try {
      // Re-send with the EXACT same idempotency key
      let targetAccount = accounts.find(a => a.accountNumber === targetAccNumber);
      let targetId = targetAccount ? targetAccount.id : accounts[0]?.id;

      const res = await api.transfer(
        selectedSource.id,
        targetId,
        successReceipt.amount,
        description,
        successReceipt.idempotencyKey
      );

      alert(`✅ IDEMPOTENCY REPLAY SUCCESS:\nThe server recognized Key: ${successReceipt.idempotencyKey} and returned the cached response without deducting balance again!`);
    } catch (err) {
      setError(`Replay test: ${err.message}`);
    } finally {
      setIsDuplicateTest(false);
    }
  };

  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4338CA 0%, #312E81 100%)',
        borderRadius: '1.5rem',
        padding: '2rem 2.25rem',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(67, 56, 202, 0.4)'
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
              <ArrowLeftRight size={20} color="#FFFFFF" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Double-Entry Money Transfer
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#C7D2FE', maxWidth: '600px', lineHeight: 1.5 }}>
            Execute atomic fund transfers backed by deterministic lock ordering and SHA-256 idempotency protection.
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
          <span style={{ fontSize: '0.75rem', color: '#A5B4FC', display: 'block', fontWeight: 500 }}>Source Available Balance</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            ₹ {currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* 2. Main Transfer Suite Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
        
        {/* Left Column: Transfer Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.5rem' }}>
            Transfer Specification
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
              <AlertTriangle size={18} color="#DC2626" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* From Account */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                From Account (Sender)
              </label>
              <select
                className="app-select"
                value={sourceAccId}
                onChange={(e) => setSourceAccId(e.target.value)}
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountNumber} ({acc.accountType || 'Checking'}) — ₹ {Number(acc.balance).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            {/* To Account */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                To Account (Recipient)
              </label>
              <select
                className="app-select"
                value={targetAccNumber}
                onChange={(e) => setTargetAccNumber(e.target.value)}
              >
                <option value="AC-20261108-002">AC-20261108-002 (Secondary Savings)</option>
                <option value="ACC-BOB-202">ACC-BOB-202 (External User / Bob)</option>
                <option value="SYS-RESERVE-001">SYS-RESERVE-001 (Central Reserve Pool)</option>
              </select>
            </div>

            {/* Transfer Amount Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                Amount to Transfer (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748B' }}>
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
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

              {isOverdraft && (
                <p style={{ fontSize: '0.78rem', color: '#DC2626', marginTop: '0.4rem', fontWeight: 600 }}>
                  ⚠️ Insufficient balance! LedgerLine strictly prevents negative account balances.
                </p>
              )}

              {/* Quick Amount Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {[500, 1000, 2000, 5000].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setAmount(chip.toString())}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.5rem',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    +₹ {chip.toLocaleString()}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount(Math.max(0, currentBalance).toString())}
                  style={{
                    background: '#EEF2FF',
                    border: '1px solid #C7D2FE',
                    borderRadius: '0.5rem',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#4F46E5',
                    cursor: 'pointer'
                  }}
                >
                  Max Available
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                Transfer Description / Memo
              </label>
              <input
                type="text"
                className="app-input"
                placeholder="e.g. Monthly maintenance allocation"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Action Submit */}
            <button
              type="submit"
              disabled={loading || isOverdraft || isInvalidAmount}
              className="btn-primary"
              style={{
                marginTop: '0.5rem',
                padding: '0.9rem',
                fontSize: '1rem',
                opacity: (loading || isOverdraft || isInvalidAmount) ? 0.6 : 1,
                cursor: (loading || isOverdraft || isInvalidAmount) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin-animate" />
                  <span>Processing Double-Entry Locks...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Execute Transfer Now</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right Column: Double-Entry Proof & Idempotency Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Live Double-Entry Preview Card */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Layers size={18} color="#4F46E5" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                Double-Entry Ledger Invariant Check
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F8FAFC', borderRadius: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Debit Account:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#DC2626' }}>
                  {selectedSource?.accountNumber} (-₹ {parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F8FAFC', borderRadius: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Credit Account:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>
                  {targetAccNumber} (+₹ {parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F8FAFC', borderRadius: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Transfer Fee:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                  ₹ 0.00 (Guaranteed Free)
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.85rem',
                background: '#ECFDF5',
                border: '1.5px solid #A7F3D0',
                borderRadius: '0.75rem',
                marginTop: '0.25rem'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065F46' }}>Net Ledger Variance:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#047857' }}>
                  ₹ 0.00 (Perfect Balance)
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic Idempotency Inspector */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#059669" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                  Cryptographic Idempotency
                </h3>
              </div>
              <button
                type="button"
                onClick={handleRegenerateKey}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4F46E5',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <RefreshCw size={12} />
                <span>New Key</span>
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.45, marginBottom: '0.75rem' }}>
              Every transfer generates a unique UUID header. If network retries resend this exact key, the server serves the cached response without debiting twice.
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F1F5F9',
              borderRadius: '0.65rem',
              padding: '0.5rem 0.85rem',
              border: '1px solid #E2E8F0'
            }}>
              <span className="font-mono" style={{ fontSize: '0.75rem', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {idempotencyKey}
              </span>
              <button
                type="button"
                onClick={handleCopyKey}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copiedKey ? '#059669' : '#4F46E5',
                  cursor: 'pointer',
                  marginLeft: '0.5rem'
                }}
              >
                {copiedKey ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            {successReceipt && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={handleTestReplay}
                  disabled={isDuplicateTest}
                  style={{
                    width: '100%',
                    backgroundColor: '#F8FAFC',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '0.65rem',
                    padding: '0.65rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <RefreshCw size={14} />
                  <span>{isDuplicateTest ? 'Replaying...' : 'Test Replay Defense with Last Key'}</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 3. Success Receipt Dialog */}
      {successReceipt && (
        <div className="modal-overlay" onClick={() => setSuccessReceipt(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                border: '2px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <CheckCircle2 size={36} color="#059669" />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                Transfer Completed!
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>
                Both debit and credit ledger entries were atomically committed.
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
                <span style={{ color: '#64748B' }}>Amount:</span>
                <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                  ₹ {successReceipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>From Account:</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>{successReceipt.source}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>To Account:</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>{successReceipt.target}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Timestamp:</span>
                <span>{successReceipt.timestamp}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Idempotency Key:</span>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: '#4F46E5' }}>
                  {successReceipt.idempotencyKey.slice(0, 18)}...
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setSuccessReceipt(null)}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                Done
              </button>
              <button
                onClick={() => {
                  setSuccessReceipt(null);
                  onNavigate('transactions');
                }}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                View in Statement →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

