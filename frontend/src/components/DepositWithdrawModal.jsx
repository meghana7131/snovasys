import React, { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function DepositWithdrawModal({ mode, account, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  const isDeposit = mode === 'deposit';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;

    setLoading(true);
    setError(null);

    try {
      if (isDeposit) {
        await api.deposit(account.id, amount, description, idempotencyKey);
      } else {
        await api.withdraw(account.id, amount, description, idempotencyKey);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            {isDeposit ? 'Deposit Funds (From Reserve)' : 'Withdraw Funds (To Reserve)'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)', border: '1px solid #DC2626', color: '#FCA5A5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.375rem' }}>Target Account</label>
            <input type="text" readOnly value={`${account.accountNumber} ($${account.balance})`} style={{ backgroundColor: '#111827', color: '#9CA3AF' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.375rem' }}>Amount ($)</label>
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
              placeholder={isDeposit ? 'e.g. Salary direct deposit' : 'e.g. ATM cash withdrawal'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '1.25rem', backgroundColor: '#0B0F19', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1F2937' }}>
            <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Idempotency-Key Header:</span>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: '#34D399', wordBreak: 'break-all', marginTop: '0.25rem' }}>
              {idempotencyKey}
            </div>
          </div>

          <button type="submit" disabled={loading} className={`btn ${isDeposit ? 'btn-success' : 'btn-danger'}`} style={{ width: '100%' }}>
            {loading ? 'Processing...' : (isDeposit ? 'Execute Deposit' : 'Execute Withdrawal')}
          </button>
        </form>
      </div>
    </div>
  );
}
