import React, { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function LedgerStatement({ account, onBack }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, [account]);

  const fetchEntries = async () => {
    setLoading(true);
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
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button onClick={onBack} className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
            ← Back to Accounts
          </button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Account Statement: <span className="font-mono" style={{ color: '#818CF8' }}>{account.accountNumber}</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Immutable double-entry transaction record</p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Current Balance</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34D399' }}>
            ${Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>Loading ledger entries...</div>
      ) : error ? (
        <div style={{ color: '#F87171', padding: '1rem', textAlign: 'center' }}>{error}</div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No ledger entries found for this account.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #374151', color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>Timestamp</th>
                <th style={{ padding: '0.75rem' }}>Transaction Ref</th>
                <th style={{ padding: '0.75rem' }}>Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} style={{ borderBottom: '1px solid #1F2937' }}>
                  <td style={{ padding: '0.75rem', color: '#9CA3AF', fontSize: '0.8rem' }}>
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="font-mono" style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#E5E7EB' }}>
                    {entry.transaction?.referenceId || 'N/A'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`badge ${entry.entryType === 'CREDIT' ? 'badge-success' : 'badge-warning'}`}>
                      {entry.entryType}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: entry.entryType === 'CREDIT' ? '#34D399' : '#F87171' }}>
                    {entry.entryType === 'CREDIT' ? '+' : '-'}${Number(entry.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

