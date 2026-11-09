import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import { Receipt, ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export default function TransactionsView({ account }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (account?.id) {
      fetchLedger();
    }
  }, [account]);

  const fetchLedger = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAccountLedger(account.id);
      setEntries(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>Transaction History & Ledger Book</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>
          Complete double-entry debit and credit entries for account <span className="font-mono">{account?.accountNumber || 'AC-20261108-001'}</span>
        </p>
      </div>

      <div className="app-card" style={{ padding: '1.25rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>Loading ledger entries...</div>
        ) : error ? (
          <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No ledger entries found for this account.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: '#64748B', borderBottom: '1.5px solid #E2E8F0', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Transaction Ref</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Entry Type</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#64748B', fontSize: '0.8rem' }}>
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="font-mono" style={{ padding: '0.75rem 0.5rem', color: '#0F172A', fontWeight: 600, fontSize: '0.8rem' }}>
                      {entry.transaction?.referenceId || 'TXN-SETTLED'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`badge-pill ${entry.entryType === 'CREDIT' ? 'badge-pill-success' : 'badge-pill-danger'}`}>
                        {entry.entryType}
                      </span>
                    </td>
                    <td style={{
                      padding: '0.75rem 0.5rem',
                      textAlign: 'right',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      color: entry.entryType === 'CREDIT' ? '#059669' : '#DC2626'
                    }}>
                      {entry.entryType === 'CREDIT' ? '+' : '-'} ₹ {Number(entry.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
