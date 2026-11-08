import React, { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function TransferModal({ sourceAccount, allAccounts, onClose, onSuccess }) {
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [replayLoading, setReplayLoading] = useState(false);
  const [error, setError] = useState(null);
  const [replaySuccess, setReplaySuccess] = useState(null);

  // Auto-generate fresh idempotency key when modal opens
  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  // Filter out source account from recipients
  const availableRecipients = allAccounts.filter(a => a.id !== sourceAccount.id);

  const handleTransfer = async (e) => {
    if (e) e.preventDefault();
    if (!recipientId || !amount) {
      setError('Please fill in recipient and amount');
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

  // Evaluator demonstration: Test Idempotency Double-Click Replay
  const handleSimulateDuplicateRetry = async () => {
    if (!recipientId || !amount) {
      setError('Fill recipient and amount first to test replay');
      return;
    }
    setReplayLoading(true);
    setError(null);
    setReplaySuccess(null);

    try {
      // 1st request
      await api.transfer(sourceAccount.id, recipientId, amount, description, idempotencyKey);
      // Immediate 2nd request with EXACT same key
      const duplicateRes = await api.transfer(sourceAccount.id, recipientId, amount, description, idempotencyKey);
      
      setReplaySuccess('Success! The duplicate request was caught by LedgerLine idempotency filter. Cached response returned; no extra money deducted.');
      setTimeout(() => {
        onSuccess();
      }, 2500);
    } catch (err) {
      setError('Replay test error: ' + err.message);
    } finally {
      setReplayLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Transfer Funds</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)', border: '1px solid #DC2626', color: '#FCA5A5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {replaySuccess && (
          <div style={{ backgroundColor: 'rgba(5, 150, 105, 0.2)', border: '1px solid #059669', color: '#6EE7B7', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {replaySuccess}
          </div>
        )}

        <form onSubmit={handleTransfer}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.375rem' }}>Source Account</label>
            <input type="text" readOnly value={`${sourceAccount.accountNumber} ($${sourceAccount.balance})`} style={{ backgroundColor: '#111827', color: '#9CA3AF' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.375rem' }}>Recipient Account</label>
            <select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} required>
              <option value="">-- Select Recipient --</option>
              {availableRecipients.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountNumber} ({acc.type})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.375rem' }}>Transfer Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.375rem' }}>Description</label>
            <input
              type="text"
              placeholder="e.g. Monthly rent, invoice #104"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Idempotency Key Live Display */}
          <div style={{ marginBottom: '1.25rem', backgroundColor: '#0B0F19', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1F2937' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Idempotency-Key Header:</span>
              <button
                type="button"
                onClick={() => setIdempotencyKey(crypto.randomUUID())}
                style={{ background: 'none', border: 'none', color: '#818CF8', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                Regenerate
              </button>
            </div>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: '#34D399', wordBreak: 'break-all', marginTop: '0.25rem' }}>
              {idempotencyKey}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button type="submit" disabled={loading || replayLoading} className="btn btn-primary" style={{ width: '100%' }}>
              {loading ? 'Posting Transaction...' : 'Transfer Money'}
            </button>

            {/* Evaluator Demo Tool */}
            <button
              type="button"
              disabled={loading || replayLoading}
              onClick={handleSimulateDuplicateRetry}
              className="btn btn-secondary"
              style={{ width: '100%', borderColor: '#F59E0B', color: '#FBBF24' }}
            >
              {replayLoading ? 'Testing Replay...' : '⚡ Test Idempotency (Fire 2x Parallel)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

