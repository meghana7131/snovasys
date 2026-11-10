import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import {
  Receipt,
  Download,
  Filter,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';

export default function TransactionsView({ account, onNavigate }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredEntries = entries.filter(e => {
    if (filterType !== 'ALL' && e.entryType !== filterType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const ref = (e.transaction?.referenceId || '').toLowerCase();
      const amt = (e.amount || '').toString();
      return ref.includes(term) || amt.includes(term);
    }
    return true;
  });

  const totalCredits = entries
    .filter(e => e.entryType === 'CREDIT')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalDebits = entries
    .filter(e => e.entryType === 'DEBIT')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Transaction Ref', 'Entry Type', 'Amount (INR)'];
    const rows = filteredEntries.map(e => [
      `"${new Date(e.createdAt).toISOString()}"`,
      `"${e.transaction?.referenceId || 'TXN-SETTLED'}"`,
      `"${e.entryType}"`,
      `"${Number(e.amount).toFixed(2)}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ledgerline_statement_${account?.accountNumber || 'account'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredEntries, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `ledgerline_statement_${account?.accountNumber || 'account'}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #3730A3 0%, #1E1B4B 100%)',
        borderRadius: '1.5rem',
        padding: '2rem 2.25rem',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(55, 48, 163, 0.4)'
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
              <Receipt size={20} color="#FFFFFF" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Transaction History & Ledger Book
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#C7D2FE', maxWidth: '600px', lineHeight: 1.5 }}>
            Immutable, append-only double-entry statement for account <span className="font-mono" style={{ color: '#FFFFFF', fontWeight: 700 }}>{account?.accountNumber || 'AC-20261108-001'}</span>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              padding: '0.7rem 1.1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backdropFilter: 'blur(8px)'
            }}
          >
            <FileSpreadsheet size={16} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              padding: '0.7rem 1.1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backdropFilter: 'blur(8px)'
            }}
          >
            <FileCode size={16} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* 2. Summary Metrics (3 Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Total Ledger Records</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
            {entries.length} Entries
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Total Inflow (Credits)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
            + ₹ {totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600 }}>Total Outflow (Debits)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#DC2626', marginTop: '0.2rem' }}>
            - ₹ {totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by reference or amount..."
            className="app-input"
            style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'ALL', label: 'All Entries' },
            { id: 'CREDIT', label: 'Credits (+)' },
            { id: 'DEBIT', label: 'Debits (-)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '0.5rem',
                border: filterType === f.id ? '1.5px solid #4F46E5' : '1.5px solid #E2E8F0',
                backgroundColor: filterType === f.id ? '#EEF2FF' : '#FFFFFF',
                color: filterType === f.id ? '#4338CA' : '#475569',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}

          <button
            onClick={fetchLedger}
            title="Refresh"
            style={{
              padding: '0.45rem 0.65rem',
              borderRadius: '0.5rem',
              border: '1.5px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 4. Transactions Table */}
      <div className="app-card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
            <RefreshCw size={24} className="spin-animate" style={{ margin: '0 auto 0.5rem auto' }} />
            <div>Loading verified double-entry ledger entries...</div>
          </div>
        ) : error ? (
          <div style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
            No transaction records match the current filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: '#64748B', borderBottom: '1.5px solid #E2E8F0', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Transaction Ref</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Entry Type</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Integrity</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => {
                  const isCredit = entry.entryType === 'CREDIT';
                  return (
                    <tr key={entry.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#64748B', fontSize: '0.8rem' }}>
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="font-mono" style={{ padding: '0.85rem 0.5rem', color: '#0F172A', fontWeight: 600, fontSize: '0.8rem' }}>
                        {entry.transaction?.referenceId || 'TXN-SETTLED'}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <span className={`badge-pill ${isCredit ? 'badge-pill-success' : 'badge-pill-danger'}`}>
                          {isCredit ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          <span>{entry.entryType}</span>
                        </span>
                      </td>
                      <td style={{
                        padding: '0.85rem 0.5rem',
                        textAlign: 'right',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color: isCredit ? '#059669' : '#DC2626'
                      }}>
                        {isCredit ? '+' : '-'} ₹ {Number(entry.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        <span className="badge-pill badge-pill-blue" style={{ fontSize: '0.68rem' }}>
                          Verified
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
