import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileText,
  Zap,
  Building2,
  ListFilter,
  Send,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Shield
} from 'lucide-react';

export default function DashboardView({
  account,
  allAccounts,
  transactions,
  onOpenTransfer,
  onOpenDeposit,
  onOpenWithdraw,
  onViewStatement,
  onInlineTransfer,
  transferLoading,
  transferError,
  transferSuccess
}) {
  const [targetAccount, setTargetAccount] = useState('AC-20261108-002');
  const [inlineAmount, setInlineAmount] = useState('');

  const balance = account?.balance ? Number(account.balance) : 25750;
  const accountNumber = account?.accountNumber || 'AC-20261108-001';

  const handleInlineSubmit = (e) => {
    e.preventDefault();
    if (!inlineAmount || Number(inlineAmount) <= 0) return;
    onInlineTransfer(accountNumber, targetAccount, inlineAmount);
    setInlineAmount('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Welcome & Assurance Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        
        {/* Welcome Card */}
        <div className="app-card" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FD 100%)',
          padding: '1.25rem 1.75rem'
        }}>
          {/* Illustrated Female Avatar matching mockup */}
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#C7D2FE',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(99, 102, 241, 0.25)',
            border: '2.5px solid #FFFFFF',
            flexShrink: 0
          }}>
            <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
              {/* Background */}
              <circle cx="32" cy="32" r="32" fill="#C7D2FE" />
              {/* Back Hair */}
              <path d="M17 28 C 15 11, 49 11, 47 28 C 48 40, 49 50, 49 50 L 15 50 C 15 50, 16 40, 17 28 Z" fill="#3E2723" />
              {/* Neck */}
              <rect x="28" y="36" width="8" height="8" rx="2" fill="#FED7AA" />
              {/* Purple Shirt */}
              <path d="M18 45 C 22 41, 42 41, 46 45 L 50 64 L 14 64 Z" fill="#6366F1" />
              {/* Face */}
              <circle cx="32" cy="27" r="11" fill="#FED7AA" />
              {/* Front Hair Bangs */}
              <path d="M21 24 C 23 16, 41 16, 43 24 C 39 19, 36 21, 32 21 C 28 21, 25 19, 21 24 Z" fill="#4E342E" />
              <path d="M20 25 C 21 34, 21 40, 23 43 C 21 39, 21 30, 20 25 Z" fill="#4E342E" />
              <path d="M44 25 C 43 34, 43 40, 41 43 C 43 39, 43 30, 44 25 Z" fill="#4E342E" />
              {/* Eyes */}
              <circle cx="28.5" cy="27" r="1.2" fill="#1E293B" />
              <circle cx="35.5" cy="27" r="1.2" fill="#1E293B" />
              {/* Smile */}
              <path d="M29.5 32 Q 32 34.5, 34.5 32" stroke="#EA580C" strokeWidth="1" strokeLinecap="round" fill="none" />
              {/* Blush */}
              <circle cx="27" cy="29.5" r="1.5" fill="#FDA4AF" opacity="0.6" />
              <circle cx="37" cy="29.5" r="1.5" fill="#FDA4AF" opacity="0.6" />
            </svg>
          </div>

          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Welcome back, Meghana!
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.35rem', fontWeight: 500 }}>
              Manage your money securely with LedgerLine
            </p>
          </div>
        </div>

        {/* Assurance Card */}
        <div style={{
          background: 'linear-gradient(135deg, #101B38 0%, #172554 100%)',
          borderRadius: '1rem',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
              flexShrink: 0
            }}>
              <ShieldCheck size={26} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                Safe Transactions.
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#93C5FD', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                Balanced Books.
              </div>
            </div>
          </div>

          {/* Classic Bank Architectural Graphic */}
          <div style={{ opacity: 0.35, position: 'absolute', right: '12px', bottom: '-4px' }}>
            <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
              {/* Pediment (Triangle Roof) */}
              <polygon points="60,6 12,30 108,30" fill="#93C5FD" opacity="0.6" />
              <polygon points="60,12 24,28 96,28" fill="#DBEAFE" opacity="0.8" />
              {/* Entablature Beam */}
              <rect x="10" y="30" width="100" height="6" fill="#DBEAFE" />
              {/* Columns (6 Classical Pillars) */}
              <rect x="16" y="36" width="7" height="38" rx="1.5" fill="#BFDBFE" />
              <rect x="32" y="36" width="7" height="38" rx="1.5" fill="#BFDBFE" />
              <rect x="48" y="36" width="7" height="38" rx="1.5" fill="#BFDBFE" />
              <rect x="64" y="36" width="7" height="38" rx="1.5" fill="#BFDBFE" />
              <rect x="80" y="36" width="7" height="38" rx="1.5" fill="#BFDBFE" />
              <rect x="96" y="36" width="7" height="38" rx="1.5" fill="#BFDBFE" />
              {/* Steps / Plinth */}
              <rect x="8" y="74" width="104" height="4" fill="#DBEAFE" />
              <rect x="4" y="78" width="112" height="4" fill="#93C5FD" />
              <rect x="0" y="82" width="120" height="6" fill="#60A5FA" opacity="0.7" />
            </svg>
          </div>
        </div>

      </div>

      {/* 2. Top Metrics (3 Cards) & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }}>
        
        {/* Metric 1: Total Balance */}
        <div style={{
          gridColumn: 'span 3',
          background: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
          borderRadius: '1rem',
          padding: '1.25rem',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '0.625rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}>
              <Wallet size={20} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#DBEAFE' }}>Total Balance</span>
          </div>

          <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
            ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: '#BFDBFE', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
              ↑ +2.5%
            </span>
            {/* Sparkline wave */}
            <svg width="80" height="24" viewBox="0 0 80 24" fill="none">
              <path d="M2 18 Q 20 4, 40 14 T 78 6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
            </svg>
          </div>
        </div>

        {/* Metric 2: Total Deposits */}
        <div style={{
          gridColumn: 'span 3',
          background: 'linear-gradient(135deg, #047857 0%, #10B981 100%)',
          borderRadius: '1rem',
          padding: '1.25rem',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '0.625rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}>
              <ArrowDownCircle size={20} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#D1FAE5' }}>Total Deposits</span>
          </div>

          <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
            ₹ 15,000.00
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: '#A7F3D0', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
              ↑ +5.0%
            </span>
            <svg width="80" height="24" viewBox="0 0 80 24" fill="none">
              <path d="M2 20 Q 25 18, 45 8 T 78 4" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
            </svg>
          </div>
        </div>

        {/* Metric 3: Total Withdrawals */}
        <div style={{
          gridColumn: 'span 3',
          background: 'linear-gradient(135deg, #BE123C 0%, #F43F5E 100%)',
          borderRadius: '1rem',
          padding: '1.25rem',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 20px -4px rgba(244, 63, 94, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '0.625rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}>
              <ArrowUpCircle size={20} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFE4E6' }}>Total Withdrawals</span>
          </div>

          <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
            ₹ 9,250.00
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: '#FECDD3', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
              ↑ +1.2%
            </span>
            <svg width="80" height="24" viewBox="0 0 80 24" fill="none">
              <path d="M2 16 Q 25 6, 50 14 T 78 8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
            </svg>
          </div>
        </div>

        {/* Quick Actions (2x2 Grid) */}
        <div className="app-card" style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Zap size={18} color="#4F46E5" fill="#4F46E5" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>Quick Actions</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            
            <button
              onClick={onOpenTransfer}
              style={{
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '0.65rem',
                padding: '0.65rem 0.35rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EEF2FF';
                e.currentTarget.style.borderColor = '#C7D2FE';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <ArrowLeftRight size={20} color="#4F46E5" />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1E293B' }}>Transfer Money</span>
            </button>

            <button
              onClick={onOpenDeposit}
              style={{
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '0.65rem',
                padding: '0.65rem 0.35rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ECFDF5';
                e.currentTarget.style.borderColor = '#A7F3D0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <ArrowDownToLine size={20} color="#059669" />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1E293B' }}>Deposit</span>
            </button>

            <button
              onClick={onOpenWithdraw}
              style={{
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '0.65rem',
                padding: '0.65rem 0.35rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFF1F2';
                e.currentTarget.style.borderColor = '#FECDD3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <ArrowUpFromLine size={20} color="#E11D48" />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1E293B' }}>Withdraw</span>
            </button>

            <button
              onClick={onViewStatement}
              style={{
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '0.65rem',
                padding: '0.65rem 0.35rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <FileText size={20} color="#0284C7" />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1E293B' }}>View Statement</span>
            </button>

          </div>
        </div>

      </div>

      {/* 3. Middle Row: Balance Overview Chart & Account Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }}>
        
        {/* Balance Overview Area Spline Chart */}
        <div className="app-card" style={{ gridColumn: 'span 8', padding: '1.5rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <TrendingUp size={20} color="#4F46E5" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Balance Overview</h3>
          </div>

          {/* SVG Spline Area Chart matching screenshot */}
          <div style={{ width: '100%', height: '220px', position: 'relative' }}>
            
            {/* Tooltip Pill directly floating over Sunday point like screenshot */}
            <div style={{
              position: 'absolute',
              right: '20px',
              top: '18px',
              backgroundColor: '#1E1B4B',
              color: '#FFFFFF',
              padding: '0.35rem 0.75rem',
              borderRadius: '0.45rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              boxShadow: '0 4px 10px rgba(30, 27, 75, 0.3)',
              zIndex: 2,
              pointerEvents: 'none'
            }}>
              ₹ 25,750
            </div>

            <svg width="100%" height="100%" viewBox="0 0 700 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="680" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="70" x2="680" y2="70" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="120" x2="680" y2="120" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="170" x2="680" y2="170" stroke="#F1F5F9" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="10" y="24" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">30k</text>
              <text x="10" y="74" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">20k</text>
              <text x="10" y="124" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">10k</text>
              <text x="25" y="174" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">0</text>

              {/* Area Fill */}
              <path
                d="M 60 140 
                   C 130 140, 160 100, 200 100 
                   C 240 100, 280 120, 320 120 
                   C 360 120, 400 80, 440 80 
                   C 480 80, 520 95, 560 95 
                   C 600 95, 630 65, 670 65 
                   L 670 180 L 60 180 Z"
                fill="url(#balanceGrad)"
              />

              {/* Curve Stroke */}
              <path
                d="M 60 140 
                   C 130 140, 160 100, 200 100 
                   C 240 100, 280 120, 320 120 
                   C 360 120, 400 80, 440 80 
                   C 480 80, 520 95, 560 95 
                   C 600 95, 630 65, 670 65"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data Point Circles */}
              <circle cx="60" cy="140" r="4.5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="200" cy="100" r="4.5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="320" cy="120" r="4.5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="440" cy="80" r="4.5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="560" cy="95" r="4.5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="670" cy="65" r="5.5" fill="#1E1B4B" stroke="#FFFFFF" strokeWidth="2.5" />
            </svg>

            {/* X-Axis Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '45px', paddingRight: '20px', marginTop: '0.25rem' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <span key={day} style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>{day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Account Details Card & Virtual Debit Card Graphic */}
        <div className="app-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Building2 size={18} color="#4F46E5" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Account Details</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
              <span className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                {accountNumber}
              </span>
              <span className="badge-pill badge-pill-success">Active</span>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Current Balance</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginTop: '0.15rem' }}>
                ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <button
                onClick={onViewStatement}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4F46E5',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                View Details →
              </button>
            </div>
          </div>

          {/* Graphical Bank Card */}
          <div style={{
            marginTop: '1.25rem',
            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #4338CA 100%)',
            borderRadius: '0.85rem',
            padding: '1.1rem 1.25rem',
            color: '#FFFFFF',
            boxShadow: '0 8px 18px -4px rgba(79, 70, 229, 0.45)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top row: Chip and Contactless Wave */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              {/* Gold EMV Chip with circuit pattern */}
              <div style={{
                width: '34px',
                height: '26px',
                backgroundColor: '#FDE047',
                borderRadius: '5px',
                border: '1px solid #CA8A04',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6)'
              }}>
                <div style={{ position: 'absolute', top: '7px', left: 0, right: 0, height: '1px', backgroundColor: '#CA8A04' }} />
                <div style={{ position: 'absolute', top: '16px', left: 0, right: 0, height: '1px', backgroundColor: '#CA8A04' }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '16px', width: '1px', backgroundColor: '#CA8A04' }} />
                <div style={{ position: 'absolute', top: '7px', bottom: '8px', left: '10px', width: '13px', borderRadius: '3px', border: '1px solid #CA8A04' }} />
              </div>

              {/* Contactless wave icon like mockup */}
              <div style={{ display: 'flex', alignItems: 'center', opacity: 0.85 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M7 16 A 8 8 0 0 1 7 8" />
                  <path d="M11 18 A 12 12 0 0 1 11 6" />
                  <path d="M15 20 A 16 16 0 0 1 15 4" />
                </svg>
              </div>
            </div>

            <div className="font-mono" style={{ fontSize: '0.85rem', letterSpacing: '0.15em', marginBottom: '0.85rem', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              •••• •••• •••• 8924
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.7rem' }}>
              <div>
                <span style={{ color: '#C7D2FE', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.05em' }}>Card Holder</span>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em' }}>MEGHANA</div>
              </div>
              <div style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '0.05em', fontStyle: 'italic', color: '#FFFFFF' }}>
                VISA
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Bottom Row: Recent Transactions, Money Transfer, Security Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }}>
        
        {/* Column 1: Recent Transactions */}
        <div className="app-card" style={{ gridColumn: 'span 5', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ListFilter size={18} color="#4F46E5" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>Recent Transactions</h3>
            </div>
            <button
              onClick={onViewStatement}
              style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              View All →
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ color: '#94A3B8', borderBottom: '1px solid #F1F5F9', textAlign: 'left', fontSize: '0.72rem' }}>
                  <th style={{ paddingBottom: '0.5rem', fontWeight: 600 }}>Date</th>
                  <th style={{ paddingBottom: '0.5rem', fontWeight: 600 }}>Type</th>
                  <th style={{ paddingBottom: '0.5rem', fontWeight: 600, textAlign: 'right' }}>Amount</th>
                  <th style={{ paddingBottom: '0.5rem', fontWeight: 600, textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: 'Nov 08, 2026 • 10:24 AM', type: 'Transfer', amount: '- ₹ 5,000.00', isNeg: true, icon: ArrowLeftRight, iconColor: '#4F46E5' },
                  { date: 'Nov 07, 2026 • 04:17 PM', type: 'Deposit', amount: '+ ₹ 10,000.00', isNeg: false, icon: ArrowDownToLine, iconColor: '#10B981' },
                  { date: 'Nov 06, 2026 • 11:30 AM', type: 'Withdrawal', amount: '- ₹ 2,000.00', isNeg: true, icon: ArrowUpFromLine, iconColor: '#EF4444' },
                  { date: 'Nov 05, 2026 • 03:12 PM', type: 'Transfer', amount: '- ₹ 3,000.00', isNeg: true, icon: ArrowLeftRight, iconColor: '#4F46E5' },
                  { date: 'Nov 04, 2026 • 01:45 PM', type: 'Deposit', amount: '+ ₹ 5,000.00', isNeg: false, icon: ArrowDownToLine, iconColor: '#10B981' },
                ].map((row, idx) => {
                  const Icon = row.icon;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '0.65rem 0', color: '#64748B', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                        {row.date}
                      </td>
                      <td style={{ padding: '0.65rem 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1E293B', fontWeight: 500 }}>
                          <Icon size={14} color={row.iconColor} />
                          <span>{row.type}</span>
                        </div>
                      </td>
                      <td style={{
                        padding: '0.65rem 0',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: row.isNeg ? '#EF4444' : '#10B981',
                        fontFamily: 'monospace'
                      }}>
                        {row.amount}
                      </td>
                      <td style={{ padding: '0.65rem 0', textAlign: 'right' }}>
                        <span className="badge-pill badge-pill-success" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                          Success
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 2: Money Transfer Inline Form */}
        <div className="app-card" style={{ gridColumn: 'span 4', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Send size={18} color="#4F46E5" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>Money Transfer</h3>
          </div>

          {transferError && (
            <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
              {transferError}
            </div>
          )}

          {transferSuccess && (
            <div style={{ backgroundColor: '#D1FAE5', border: '1px solid #34D399', color: '#065F46', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
              Transfer completed successfully! Books balanced.
            </div>
          )}

          <form onSubmit={handleInlineSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#64748B', marginBottom: '0.3rem' }}>
                From Account
              </label>
              <select className="app-select" value={accountNumber} readOnly>
                <option>{accountNumber} (₹ {balance.toLocaleString('en-IN')})</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#64748B', marginBottom: '0.3rem' }}>
                To Account
              </label>
              <select
                className="app-select"
                value={targetAccount}
                onChange={(e) => setTargetAccount(e.target.value)}
              >
                <option value="AC-20261108-002">AC-20261108-002 (Savings)</option>
                <option value="ACC-BOB-202">ACC-BOB-202 (External User)</option>
                <option value="SYS-RESERVE-001">SYS-RESERVE-001 (Reserve Pool)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#64748B', marginBottom: '0.3rem' }}>
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter amount"
                className="app-input"
                value={inlineAmount}
                onChange={(e) => setInlineAmount(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={transferLoading}
              style={{
                width: '100%',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.625rem',
                padding: '0.75rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.2s ease',
                marginTop: '0.25rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338CA'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
            >
              <Send size={15} color="#FFFFFF" />
              <span>{transferLoading ? 'Processing...' : 'Transfer Now'}</span>
            </button>
          </form>
        </div>

        {/* Column 3: Security Status */}
        <div className="app-card" style={{ gridColumn: 'span 3', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#059669" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>Security Status</h3>
              </div>
              <span className="badge-pill badge-pill-success">All Secure</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
              {[
                'Idempotency Protection',
                'Transaction Integrity',
                'Double-Entry Ledger',
                'Audit Logging',
                'Role-Based Access Control'
              ].map((text, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#059669" fill="#D1FAE5" />
                  <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 500 }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Shield Graphic */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '1rem'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              border: '2px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)'
            }}>
              <ShieldCheck size={36} color="#059669" />
            </div>
          </div>
        </div>

      </div>

      {/* 5. Footer */}
      <footer style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem 0.5rem 0.5rem 0.5rem',
        borderTop: '1px solid #E2E8F0',
        color: '#64748B',
        fontSize: '0.75rem',
        marginTop: '0.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '5px',
            backgroundColor: '#4F46E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '0.65rem'
          }}>
            L
          </div>
          <span style={{ fontWeight: 700, color: '#0F172A' }}>LedgerLine</span>
          <span>|</span>
          <span>© 2026 LedgerLine. All rights reserved.</span>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none' }}>Terms</a>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ color: '#64748B', textDecoration: 'none' }}>Help</a>
        </div>
      </footer>

    </div>
  );
}
