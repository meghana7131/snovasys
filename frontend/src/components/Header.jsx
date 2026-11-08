import React from 'react';

export default function Header({ user, onSwitchUser, onLogout, conservation }) {
  return (
    <header style={{ borderBottom: '1px solid #1F2937', backgroundColor: '#111827', padding: '1rem 0' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', backgroundColor: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem', color: '#FFF' }}>
            LL
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>LedgerLine</h1>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Double-Entry Money Movement Engine</p>
          </div>
        </div>

        {/* Conservation Invariant Status Banner */}
        {conservation && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0B0F19', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #1F2937' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: conservation.conserved ? '#10B981' : '#EF4444', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Money Conservation:</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: conservation.conserved ? '#34D399' : '#F87171' }}>
              {conservation.conserved ? 'BALANCED ($' + Number(conservation.totalSystemMoney).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ')' : 'VIOLATED'}
            </span>
          </div>
        )}

        {/* Persona Switcher & Current User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Quick Demo Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', backgroundColor: '#1F2937', padding: '0.25rem', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#9CA3AF', padding: '0 0.375rem' }}>Switch:</span>
            <button
              onClick={() => onSwitchUser('alice', 'Password123!')}
              className={`btn ${user?.username === 'alice' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              Alice ($1k)
            </button>
            <button
              onClick={() => onSwitchUser('bob', 'Password123!')}
              className={`btn ${user?.username === 'bob' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              Bob ($500)
            </button>
            <button
              onClick={() => onSwitchUser('auditor', 'Password123!')}
              className={`btn ${user?.username === 'auditor' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              Auditor
            </button>
          </div>

          {/* User info */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.username}</div>
            <div className="badge badge-info" style={{ fontSize: '0.65rem', padding: '0.125rem 0.375rem' }}>
              {user?.role}
            </div>
          </div>

          <button onClick={onLogout} className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
            Logout
          </button>
        </div>

      </div>
    </header>
  );
}
