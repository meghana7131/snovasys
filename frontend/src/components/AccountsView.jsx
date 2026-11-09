import React from 'react';
import { Building2, ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine, FileText } from 'lucide-react';

export default function AccountsView({ accounts, onOpenTransfer, onOpenDeposit, onOpenWithdraw, onViewStatement }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>Your Accounts</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>
          Real-time double-entry balances with guaranteed non-negative constraints
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {accounts.map((acc) => (
          <div key={acc.id} className="app-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {acc.type ? acc.type.replace('_', ' ') : 'USER CHECKING'}
                </span>
                <span className="badge-pill badge-pill-success">Active</span>
              </div>

              <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>
                {acc.accountNumber}
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Available Balance</span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em' }}>
                  ₹ {Number(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid #F1F5F9', paddingTop: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => onOpenTransfer(acc)}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem' }}
              >
                Transfer
              </button>
              <button
                onClick={() => onOpenDeposit(acc)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem' }}
              >
                Deposit
              </button>
              <button
                onClick={() => onOpenWithdraw(acc)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem' }}
              >
                Withdraw
              </button>
              <button
                onClick={() => onViewStatement(acc)}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.55rem', fontSize: '0.8rem', backgroundColor: '#F8FAFC' }}
              >
                View Full Ledger Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
