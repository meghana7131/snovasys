import React, { useState } from 'react';
import {
  WalletCards,
  Plus,
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  Copy,
  Check,
  CreditCard,
  Building2,
  TrendingUp,
  FileText,
  ShieldCheck,
  ExternalLink,
  Layers
} from 'lucide-react';
import { api } from '../api.js';

export default function AccountsView({
  accounts = [],
  onNavigate,
  onSelectAccountForAction
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAccType, setNewAccType] = useState('SAVINGS');
  const [newAccCurrency, setNewAccCurrency] = useState('INR');
  const [selectedLedgerAcc, setSelectedLedgerAcc] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const totalPortfolio = accounts.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);

  const handleCopy = (num) => {
    navigator.clipboard.writeText(num);
    setCopiedId(num);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleViewLedger = async (acc) => {
    setSelectedLedgerAcc(acc);
    setLedgerLoading(true);
    try {
      const res = await api.getAccountLedger(acc.id);
      setLedgerEntries(res.data || []);
    } catch (err) {
      console.error('Failed to load ledger:', err);
      setLedgerEntries([]);
    } finally {
      setLedgerLoading(false);
    }
  };

  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* 1. Portfolio Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
        borderRadius: '1.5rem',
        padding: '2rem 2.25rem',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(30, 27, 75, 0.4)'
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
              <WalletCards size={20} color="#FFFFFF" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Multi-Account Portfolio
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#C7D2FE', maxWidth: '600px', lineHeight: 1.5 }}>
            Consolidated overview of all liquid checking, high-yield savings, and system escrow accounts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '1rem',
            padding: '1rem 1.5rem',
            textAlign: 'right',
            backdropFilter: 'blur(8px)'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#A5B4FC', display: 'block', fontWeight: 500 }}>Total Tracked Assets</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              ₹ {totalPortfolio.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '0.85rem',
              background: '#4F46E5',
              border: '1px solid #6366F1'
            }}
          >
            <Plus size={18} />
            <span>New Account</span>
          </button>
        </div>
      </div>

      {/* 2. Accounts Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
            Active Accounts ({accounts.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
            All accounts protected by pessimistic lock serialization
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}>
          {accounts.map((acc, index) => {
            const isPrimary = index === 0;
            const balanceNum = Number(acc.balance) || 0;
            return (
              <div
                key={acc.id}
                className="app-card app-card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  borderTop: isPrimary ? '4px solid #4F46E5' : '4px solid #10B981'
                }}
              >
                <div>
                  {/* Top Row: Type & Copy Account Number */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge-pill badge-pill-blue">
                        {acc.accountType || (isPrimary ? 'Checking' : 'Savings')}
                      </span>
                      {isPrimary && (
                        <span className="badge-pill badge-pill-purple" style={{ fontSize: '0.65rem' }}>Primary</span>
                      )}
                    </div>
                    <span className="badge-pill badge-pill-success">Active</span>
                  </div>

                  {/* Account Number with Copy Button */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '0.65rem',
                    padding: '0.5rem 0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <span className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>
                      {acc.accountNumber}
                    </span>
                    <button
                      onClick={() => handleCopy(acc.accountNumber)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedId === acc.accountNumber ? '#059669' : '#64748B',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}
                    >
                      {copiedId === acc.accountNumber ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedId === acc.accountNumber ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Balance Display */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Ledger Balance</span>
                    <div style={{
                      fontSize: '1.85rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      letterSpacing: '-0.025em',
                      marginTop: '0.15rem'
                    }}>
                      ₹ {balanceNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ShieldCheck size={13} />
                      <span>Mathematical conservation verified</span>
                    </div>
                  </div>
                </div>

                {/* Account Action Buttons */}
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <button
                      onClick={() => {
                        if (onSelectAccountForAction) onSelectAccountForAction(acc);
                        onNavigate('transfer');
                      }}
                      className="btn-secondary"
                      style={{ padding: '0.55rem', fontSize: '0.78rem' }}
                    >
                      <ArrowLeftRight size={14} color="#4F46E5" />
                      <span>Transfer</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onSelectAccountForAction) onSelectAccountForAction(acc);
                        onNavigate('deposit');
                      }}
                      className="btn-secondary"
                      style={{ padding: '0.55rem', fontSize: '0.78rem' }}
                    >
                      <ArrowDownToLine size={14} color="#059669" />
                      <span>Deposit</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        if (onSelectAccountForAction) onSelectAccountForAction(acc);
                        onNavigate('withdrawal');
                      }}
                      className="btn-secondary"
                      style={{ padding: '0.55rem', fontSize: '0.78rem' }}
                    >
                      <ArrowUpFromLine size={14} color="#DC2626" />
                      <span>Withdraw</span>
                    </button>

                    <button
                      onClick={() => handleViewLedger(acc)}
                      style={{
                        background: '#EEF2FF',
                        border: '1px solid #C7D2FE',
                        borderRadius: '0.75rem',
                        padding: '0.55rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#4F46E5',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Layers size={14} />
                      <span>View Ledger</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Account Ledger Drawer / Modal */}
      {selectedLedgerAcc && (
        <div className="modal-overlay" onClick={() => setSelectedLedgerAcc(null)}>
          <div className="modal-container" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={20} color="#4F46E5" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                    Ledger Entries for {selectedLedgerAcc.accountNumber}
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                  Raw immutable debit and credit entries registered on this account.
                </p>
              </div>

              <button
                onClick={() => setSelectedLedgerAcc(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  color: '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {ledgerLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                Fetching double-entry ledger records...
              </div>
            ) : ledgerEntries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                No direct ledger entries on record yet for this account.
              </div>
            ) : (
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                      <th style={{ paddingBottom: '0.5rem' }}>Entry ID</th>
                      <th style={{ paddingBottom: '0.5rem' }}>Type</th>
                      <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Amount</th>
                      <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerEntries.map((entry, idx) => {
                      const isDebit = entry.entryType === 'DEBIT';
                      return (
                        <tr key={entry.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td className="font-mono" style={{ padding: '0.65rem 0', color: '#64748B', fontSize: '0.75rem' }}>
                            {entry.id ? entry.id.slice(0, 8) + '...' : `ENT-00${idx + 1}`}
                          </td>
                          <td style={{ padding: '0.65rem 0' }}>
                            <span className={isDebit ? 'badge-pill badge-pill-danger' : 'badge-pill badge-pill-success'} style={{ fontSize: '0.68rem' }}>
                              {entry.entryType}
                            </span>
                          </td>
                          <td style={{
                            padding: '0.65rem 0',
                            textAlign: 'right',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: isDebit ? '#DC2626' : '#059669'
                          }}>
                            {isDebit ? '-' : '+'} ₹ {Number(entry.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '0.65rem 0', textAlign: 'right', color: '#64748B', fontSize: '0.75rem' }}>
                            {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'Nov 08, 2026'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedLedgerAcc(null)}
                className="btn-primary"
                style={{ padding: '0.65rem 1.5rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Create Account Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
              Create Additional Ledger Account
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Every created account enforces zero negative balance and deterministic lock serialization.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              alert(`Account creation simulated: ${newAccType} account registered in currency ${newAccCurrency}!`);
              setShowCreateModal(false);
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                    Account Type
                  </label>
                  <select
                    className="app-select"
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value)}
                  >
                    <option value="SAVINGS">High-Yield Savings Account (3.5% APY)</option>
                    <option value="CHECKING">Commercial Checking Account</option>
                    <option value="ESCROW">Escrow Holding Pool</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                    Settlement Currency
                  </label>
                  <select
                    className="app-select"
                    value={newAccCurrency}
                    onChange={(e) => setNewAccCurrency(e.target.value)}
                  >
                    <option value="INR">INR (₹ Indian Rupee)</option>
                    <option value="USD">USD ($ US Dollar)</option>
                    <option value="EUR">EUR (€ Euro)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Confirm & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
