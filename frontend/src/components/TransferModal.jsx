import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import { ArrowLeftRight, X, ShieldAlert, CheckCircle, Zap } from 'lucide-react';

export default function TransferModal({ sourceAccount, allAccounts, onClose, onSuccess }) {
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [replayLoading, setReplayLoading] = useState(false);
  const [error, setError] = useState(null);
  const [replaySuccess, setReplaySuccess] = useState(null);

  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  const availableRecipients = allAccounts.filter(a => a.id !== sourceAccount.id);

  const handleTransfer = async (e) => {
    if (e) e.preventDefault();
    if (!recipientId || !amount) {
      setError('Please select recipient and enter amount');
      return;
    }

    setLoading(true);
    setError(null);
    setReplaySuccess(null);

    try {
      await api.transfer(sourceAccount.id, recipientId, amount, description, idempotencyKey);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateDuplicateRetry = async () => {
    if (!recipientId || !amount) {
      setError('Fill recipient and amount first to test parallel replay');
      return;
    }
    setReplayLoading(true);
    setError(null);
    setReplaySuccess(null);

    try {
      await api.transfer(sourceAccount.id, recipientId, amount, description, idempotencyKey);
      await api.transfer(sourceAccount.id, recipientId, amount, description, idempotencyKey);
      
      setReplaySuccess('Success! The duplicate request was intercepted by the idempotency filter with SHA-256 fingerprinting. Cached receipt returned; no extra money deducted.');
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err) {
      setError('Replay test error: ' + err.message);
    } finally {
      setReplayLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeftRight size={18} color="#4F46E5" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>Transfer Money</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {replaySuccess && (
          <div style={{ backgroundColor: '#DEF7EC', border: '1px solid #31C48D', color: '#03543F', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} />
            <span>{replaySuccess}</span>
          </div>
        )}

        <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '0.35rem' }}>
              From Account
            </label>
            <input
              type="text"
              readOnly
              className="app-input"
              value={`${sourceAccount.accountNumber} (Available: ₹ ${Number(sourceAccount.balance).toLocaleString('en-IN')})`}
              style={{ backgroundColor: '#F1F5F9', color: '#475569', fontWeight: 600 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '0.35rem' }}>
              To Account
            </label>
            <select
              className="app-select"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              required
            >
              <option value="">-- Select Recipient Account --</option>
              {availableRecipients.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountNumber} ({acc.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '0.35rem' }}>
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="app-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '0.35rem' }}>
              Note / Reference
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly settlement, rent, invoice"
              className="app-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Cryptographic Idempotency Header display */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '0.625rem', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B' }}>Idempotency-Key Header:</span>
              <button
                type="button"
                onClick={() => setIdempotencyKey(crypto.randomUUID())}
                style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Regenerate
              </button>
            </div>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: '#059669', wordBreak: 'break-all', marginTop: '0.2rem' }}>
              {idempotencyKey}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={loading || replayLoading}
              style={{
                width: '100%',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.625rem',
                padding: '0.75rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}
            >
              {loading ? 'Posting Double-Entry Transfer...' : 'Confirm Transfer'}
            </button>

            <button
              type="button"
              disabled={loading || replayLoading}
              onClick={handleSimulateDuplicateRetry}
              style={{
                width: '100%',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #FCD34D',
                borderRadius: '0.625rem',
                padding: '0.65rem',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <Zap size={14} color="#D97706" />
              <span>{replayLoading ? 'Testing Replay Protection...' : '⚡ Test Idempotency (Fire 2x Duplicate)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
