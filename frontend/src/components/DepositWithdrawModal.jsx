import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import { ArrowDownToLine, ArrowUpFromLine, X, AlertCircle } from 'lucide-react';

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
    if (!amount || Number(amount) <= 0) return;

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
      <div className="modal-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: isDeposit ? '#ECFDF5' : '#FFF1F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isDeposit ? <ArrowDownToLine size={18} color="#059669" /> : <ArrowUpFromLine size={18} color="#E11D48" />}
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
              {isDeposit ? 'Deposit Funds (From Reserve)' : 'Withdraw Funds (To Reserve)'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '0.35rem' }}>
              Target Account
            </label>
            <input
              type="text"
              readOnly
              className="app-input"
              value={`${account.accountNumber} (Available: ₹ ${Number(account.balance).toLocaleString('en-IN')})`}
              style={{ backgroundColor: '#F1F5F9', color: '#475569', fontWeight: 600 }}
            />
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
              Description
            </label>
            <input
              type="text"
              placeholder={isDeposit ? 'e.g. Salary direct deposit' : 'e.g. ATM cash withdrawal'}
              className="app-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '0.625rem', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B' }}>Idempotency-Key Header:</span>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: '#059669', wordBreak: 'break-all', marginTop: '0.2rem' }}>
              {idempotencyKey}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: isDeposit ? '#059669' : '#E11D48',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.625rem',
              padding: '0.75rem',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              marginTop: '0.5rem',
              boxShadow: isDeposit ? '0 4px 12px rgba(5, 150, 105, 0.3)' : '0 4px 12px rgba(225, 29, 72, 0.3)'
            }}
          >
            {loading ? 'Processing...' : (isDeposit ? 'Execute Deposit' : 'Execute Withdrawal')}
          </button>
        </form>
      </div>
    </div>
  );
}
