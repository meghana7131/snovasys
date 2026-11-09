import React from 'react';
import {
  LayoutDashboard,
  WalletCards,
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  Receipt,
  FileCheck2,
  ShieldCheck,
  UserCircle2,
  LogOut,
  Shield
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: WalletCards },
    { id: 'transfer', label: 'Money Transfer', icon: ArrowLeftRight },
    { id: 'deposit', label: 'Deposit', icon: ArrowDownToLine },
    { id: 'withdrawal', label: 'Withdrawal', icon: ArrowUpFromLine },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'audit', label: 'Audit Logs', icon: FileCheck2 },
    { id: 'security', label: 'Security Status', icon: ShieldCheck },
    { id: 'profile', label: 'Profile', icon: UserCircle2 },
  ];

  return (
    <aside style={{
      width: '240px',
      backgroundColor: '#0D1326',
      color: '#94A3B8',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '1.5rem 1rem',
      flexShrink: 0,
      minHeight: '100vh',
      borderRight: '1px solid rgba(255, 255, 255, 0.05)'
    }}>
      <div>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingLeft: '0.5rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              LedgerLine
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 500 }}>
              Trusted. Traceable. Secure.
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '0.65rem',
                  backgroundColor: isActive ? '#4F46E5' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#8E9BB0',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#8E9BB0';
                  }
                }}
              >
                <Icon size={18} color={isActive ? '#FFFFFF' : '#8E9BB0'} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.7rem 0.85rem',
              borderRadius: '0.65rem',
              backgroundColor: 'transparent',
              color: '#8E9BB0',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
              textAlign: 'left',
              width: '100%',
              marginTop: '0.5rem',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#F87171';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#8E9BB0';
            }}
          >
            <LogOut size={18} color="#8E9BB0" strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Bottom Security Card & Decorative Curve */}
      <div style={{ position: 'relative', marginTop: '1.5rem' }}>
        <div style={{
          background: 'linear-gradient(180deg, #131C38 0%, #0F172A 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '0.85rem',
          padding: '1.1rem 1rem',
          textAlign: 'center',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.45)'
          }}>
            <ShieldCheck size={20} color="#FFFFFF" />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#E2E8F0', fontWeight: 500, lineHeight: 1.45 }}>
            Your transactions are secured with bank-grade security.
          </p>
        </div>

        {/* Decorative Wave contour like mockup */}
        <div style={{ marginTop: '0.75rem', opacity: 0.35, display: 'flex', justifyContent: 'center' }}>
          <svg width="180" height="30" viewBox="0 0 180 30" fill="none">
            <path d="M 0 25 C 45 5, 90 35, 135 15 C 155 5, 170 12, 180 20" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 10 28 C 50 15, 100 38, 145 22 C 160 16, 172 20, 180 26" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
