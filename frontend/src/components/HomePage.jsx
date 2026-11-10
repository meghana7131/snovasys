import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  RefreshCw,
  FileCheck2,
  WalletCards,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  Database,
  KeyRound,
  ExternalLink
} from 'lucide-react';

export default function HomePage({ onNavigate, primaryAccount, totalBalance = 25750 }) {
  const [simAmount, setSimAmount] = useState(5000);

  const features = [
    {
      id: 'dashboard',
      icon: TrendingUp,
      title: 'Executive Dashboard',
      description: 'Real-time liquidity metrics, area spline trend charts, and high-level financial overview.',
      gradient: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
      badge: 'Real-Time Telemetry',
      actionText: 'Open Dashboard'
    },
    {
      id: 'accounts',
      icon: WalletCards,
      title: 'Multi-Account Portfolio',
      description: 'Manage checking, high-yield savings, and system reserve pools with individual ledger views.',
      gradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
      badge: 'Portfolio Hub',
      actionText: 'Manage Accounts'
    },
    {
      id: 'transfer',
      icon: ArrowLeftRight,
      title: 'Double-Entry Transfers',
      description: 'Atomic money movement backed by deterministic lock ordering to guarantee books balance.',
      gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      badge: 'Zero Race Conditions',
      actionText: 'Transfer Funds'
    },
    {
      id: 'deposit',
      icon: ArrowDownToLine,
      title: 'Instant Deposits',
      description: 'Fund your accounts via UPI, IMPS wire, or simulated central treasury reserve injection.',
      gradient: 'linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)',
      badge: 'Instant Settlement',
      actionText: 'Deposit Money'
    },
    {
      id: 'withdrawal',
      icon: ArrowUpFromLine,
      title: 'Safe Withdrawals',
      description: 'Enforces server-side zero-overdraft constraints. Never allows balance to drop below ₹0.',
      gradient: 'linear-gradient(135deg, #DC2626 0%, #F43F5E 100%)',
      badge: 'Overdraft Protected',
      actionText: 'Withdraw Funds'
    },
    {
      id: 'transactions',
      icon: Layers,
      title: 'Cryptographic Ledger History',
      description: 'Inspect every balanced debit and credit record with transaction hashes and exportable CSV/JSON.',
      gradient: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
      badge: 'Full Traceability',
      actionText: 'View History'
    },
    {
      id: 'audit',
      icon: FileCheck2,
      title: 'Append-Only Audit Trail',
      description: 'Independent transaction logging preserves unauthorized attempts and tampering events for auditors.',
      gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
      badge: 'Compliance Grade',
      actionText: 'Inspect Trail'
    },
    {
      id: 'security',
      icon: ShieldCheck,
      title: 'STRIDE Security & Concurrency Core',
      description: 'Interactive concurrency race simulator, SHA-256 idempotency workbench, and JWT claims inspector.',
      gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      badge: '100% STRIDE Covered',
      actionText: 'Explore Security'
    }
  ];

  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '3rem' }}>
      
      {/* 1. Hero Showcase Banner */}
      <div style={{
        position: 'relative',
        borderRadius: '1.75rem',
        background: 'radial-gradient(ellipse at top right, #1E1B4B 0%, #0B0F19 60%, #060911 100%)',
        color: '#FFFFFF',
        padding: '3rem 2.5rem',
        overflow: 'hidden',
        boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        
        {/* Ambient Glows */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-60px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(30px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-60px',
          left: '10%',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(30px)'
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '820px' }}>
          
          {/* Top Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.9rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#A5B4FC',
            marginBottom: '1.5rem'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 10px #10B981'
            }} />
            <Sparkles size={14} color="#FBBF24" />
            <span>LedgerLine Financial Core v1.0 • Bank-Grade Precision</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem'
          }}>
            Move money so the books{' '}
            <span style={{
              background: 'linear-gradient(135deg, #818CF8 0%, #C084FC 50%, #38BDF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              always balance.
            </span>
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: '#94A3B8',
            lineHeight: 1.6,
            maxWidth: '680px',
            marginBottom: '2rem'
          }}>
            Enterprise double-entry ledger engine powered by Spring Boot 3, deterministic row-level locking, cryptographic SHA-256 idempotency, and an immutable audit trail.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => onNavigate('dashboard')}
              className="btn-primary"
              style={{
                padding: '0.9rem 1.75rem',
                fontSize: '1rem',
                borderRadius: '0.85rem',
                gap: '0.75rem'
              }}
            >
              <span>Launch Dashboard</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => onNavigate('transfer')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '0.85rem',
                padding: '0.9rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
              }}
            >
              <ArrowLeftRight size={18} color="#A5B4FC" />
              <span>Try Money Transfer</span>
            </button>

            <button
              onClick={() => onNavigate('security')}
              style={{
                background: 'none',
                color: '#94A3B8',
                border: 'none',
                padding: '0.9rem 1.25rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
            >
              <ShieldCheck size={18} color="#10B981" />
              <span>STRIDE Threat Model</span>
            </button>
          </div>

        </div>

        {/* Floating Financial Cards (Visual Proof) */}
        <div className="hide-on-mobile" style={{
          position: 'absolute',
          right: '3rem',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '260px',
          zIndex: 2
        }}>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '1rem',
            padding: '1rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            animation: 'floatSlow 4s ease-in-out infinite'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Available Balance</span>
              <span className="badge-pill badge-pill-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Verified</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>
              ₹ {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={12} />
              <span>Double-entry balanced</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(79, 70, 229, 0.15)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '1rem',
            padding: '0.9rem',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.2)',
            animation: 'floatSlow 4s ease-in-out infinite 2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Lock size={14} color="#A5B4FC" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E0E7FF' }}>Row-Level Lock Active</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#C7D2FE', lineHeight: 1.3 }}>
              SELECT FOR UPDATE prevents concurrent race hazards.
            </p>
          </div>

        </div>

      </div>

      {/* 2. Live Interactive Money Conservation Simulator */}
      <div className="glass-panel" style={{ padding: '2rem 2.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '0.65rem',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Cpu size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                Mathematical Money Conservation Engine
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.35rem' }}>
              Simulate an atomic transfer. In double-entry bookkeeping, money cannot be created or destroyed: ∑ Debits == ∑ Credits.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            padding: '0.4rem 0.85rem',
            borderRadius: '9999px',
            color: '#065F46',
            fontWeight: 700,
            fontSize: '0.8rem'
          }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>Invariant Status: 100% Conserved</span>
          </div>
        </div>

        {/* Interactive Slider */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <span style={{ color: '#475569' }}>Simulated Transfer Amount:</span>
            <span style={{ color: '#4F46E5', fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 700 }}>
              ₹ {simAmount.toLocaleString('en-IN')}.00
            </span>
          </div>
          <input
            type="range"
            min="500"
            max="20000"
            step="500"
            value={simAmount}
            onChange={(e) => setSimAmount(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#4F46E5', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            <span>₹ 500</span>
            <span>₹ 10,000</span>
            <span>₹ 20,000</span>
          </div>
        </div>

        {/* 3-Column Atomic Balance Calculation Visualizer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          
          {/* Source Account Box */}
          <div style={{
            backgroundColor: '#FFF1F2',
            border: '1.5px solid #FECDD3',
            borderRadius: '1rem',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9F1239' }}>SOURCE: DEBIT ENTRY</span>
                <span className="badge-pill badge-pill-danger" style={{ fontSize: '0.65rem' }}>-₹ {simAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#881337' }}>Checking (AC-20261108-001)</div>
              <div style={{ fontSize: '0.78rem', color: '#BE123C', marginTop: '0.35rem' }}>
                Initial Balance: ₹ 25,750.00
              </div>
            </div>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #FECDD3', fontSize: '0.85rem', fontWeight: 700, color: '#9F1239' }}>
              Final: ₹ {(25750 - simAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Conservation Invariant Center */}
          <div style={{
            backgroundColor: '#EEF2FF',
            border: '1.5px solid #C7D2FE',
            borderRadius: '1rem',
            padding: '1.25rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <ArrowLeftRight size={20} />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#312E81' }}>
              Net Balance Invariant
            </div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: '#4338CA' }}>
              (-₹{simAmount}) + (+₹{simAmount}) = ₹0.00
            </div>
            <p style={{ fontSize: '0.72rem', color: '#6366F1' }}>
              Zero phantom currency creation guaranteed.
            </p>
          </div>

          {/* Target Account Box */}
          <div style={{
            backgroundColor: '#ECFDF5',
            border: '1.5px solid #A7F3D0',
            borderRadius: '1rem',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#065F46' }}>TARGET: CREDIT ENTRY</span>
                <span className="badge-pill badge-pill-success" style={{ fontSize: '0.65rem' }}>+₹ {simAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#064E3B' }}>Savings (AC-20261108-002)</div>
              <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '0.35rem' }}>
                Initial Balance: ₹ 15,000.00
              </div>
            </div>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #A7F3D0', fontSize: '0.85rem', fontWeight: 700, color: '#065F46' }}>
              Final: ₹ {(15000 + simAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

        </div>

      </div>

      {/* 3. Dedicated Feature Pages Navigation Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Explore LedgerLine Modules
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
              Every feature has a dedicated interactive page. Click any card to launch that view.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onNavigate(feat.id)}
                className="app-card app-card-hover"
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '0.85rem',
                      background: feat.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}>
                      <Icon size={22} />
                    </div>
                    <span className="badge-pill badge-pill-purple" style={{ fontSize: '0.7rem' }}>
                      {feat.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                    {feat.description}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#4F46E5',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '0.85rem'
                }}>
                  <span>{feat.actionText}</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

