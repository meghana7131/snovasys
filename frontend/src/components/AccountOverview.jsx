import React from 'react';

export default function AccountOverview({ accounts, onSelectAccount, onOpenTransfer, onOpenDeposit, onOpenWithdraw }) {
  if (!accounts || accounts.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#9CA3AF' }}>No accounts available for this user.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
      {accounts.map((acc) => (
        <div key={acc.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {acc.type.replace('_', ' ')}
                </span>
                <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 600, color: '#E5E7EB', marginTop: '0.25rem' }}>
                  {acc.accountNumber}
                </div>
              </div>
              <span className={`badge ${acc.balance > 0 ? 'badge-success' : 'badge-warning'}`}>
                Active
              </span>
            </div>

            <div style={{ margin: '1.5rem 0' }}>
              <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Available Balance</span>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.025em' }}>
                ${Number(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#9CA3AF', marginLeft: '0.375rem' }}>
                  {acc.currency}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid #1F2937', paddingTop: '1rem' }}>
            <button
              onClick={() => onOpenTransfer(acc)}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Transfer
            </button>
            <button
              onClick={() => onOpenDeposit(acc)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Deposit
            </button>
            <button
              onClick={() => onOpenWithdraw(acc)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Withdraw
            </button>
            <button
              onClick={() => onSelectAccount(acc)}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '0.25rem', backgroundColor: '#0B0F19' }}
            >
              View Full Ledger Book
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
