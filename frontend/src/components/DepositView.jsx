import React, { useState } from 'react';
import {
  ArrowDownToLine,
  CheckCircle2,
  QrCode,
  Building,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  Wallet,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../api.js';

export default function DepositView({
  accounts,
  primaryAccount,
  onDepositSuccess,
  onNavigate
}) {
  const [selectedAccId, setSelectedAccId] = useState(primaryAccount?.id || (accounts[0]?.id || ''));
  const [amount, setAmount] = useState('5000');
  const [method, setMethod] = useState('upi');
  const [description, setDescription] = useState('Instant UPI account funding');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const targetAccount = accounts.find(a => a.id === selectedAccId) || accounts[0] || primaryAccount;
  const currentBalance = targetAccount?.balance ? Number(targetAccount.balance) : 0;
  const depositAmount = Number(amount) || 0;
  const projectedBalance = currentBalance + depositAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (depositAmount <= 0) return;

    setLoading(true);
    setError(null);

    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await api.deposit(
        targetAccount.id,
        depositAmount,
        `${method.toUpperCase()} Deposit: ${description}`,
        idempotencyKey
      );

      setSuccess({
        amount: depositAmount,
        method,
        accountNumber: targetAccount.accountNumber,
        newBalance: projectedBalance,
        timestamp: new Date().toLocaleString()
      });

      if (onDepositSuccess) {
        onDepositSuccess();
      }
    } catch (err) {
      setError(err.message || 'Deposit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-animate" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #047857 0%, #064E3B 100%)',
        borderRadius: '1.5rem',
        padding: '2rem 2.25rem',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(4, 120, 87, 0.4)'
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
              <ArrowDownToLine size={20} color="#FFFFFF" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Instant Account Deposits
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#A7F3D0', maxWidth: '600px', lineHeight: 1.5 }}>
            Credit funds instantly to your LedgerLine account with double-entry assurance and zero waiting periods.
          </p>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '1rem',
          padding: '1rem 1.5rem',
          textAlign: 'right',
          backdropFilter: 'blur(8px)'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#6EE7B7', display: 'block', fontWeight: 500 }}>Target Account</span>
          <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            {targetAccount?.accountNumber}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#E0E7FF', marginTop: '0.2rem' }}>
            Current: ₹ {currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* 2. Main Deposit Form Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
        
        {/* Left Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.5rem' }}>
            Deposit Configuration
          </h2>

          {error && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1.5px solid #FCA5A5',
              borderRadius: '0.75rem',
              padding: '0.85rem 1rem',
              color: '#991B1B',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Account Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                Deposit Into Account
              </label>
              <select
                className="app-select"
                value={selectedAccId}
                onChange={(e) => setSelectedAccId(e.target.value)}
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountNumber} ({acc.accountType || 'Checking'}) — Balance: ₹ {Number(acc.balance).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.65rem' }}>
                Payment Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {[
                  { id: 'upi', label: 'Instant UPI', icon: QrCode },
                  { id: 'netbanking', label: 'Net Banking', icon: Building },
                  { id: 'imps', label: 'IMPS Wire', icon: CreditCard },
                  { id: 'reserve', label: 'Treasury Pool', icon: Wallet },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = method === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMethod(item.id)}
                      style={{
                        padding: '0.85rem 0.5rem',
                        borderRadius: '0.75rem',
                        border: isSelected ? '2px solid #059669' : '1.5px solid #E2E8F0',
                        backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                        color: isSelected ? '#065F46' : '#334155',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={20} color={isSelected ? '#059669' : '#64748B'} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount & Preset Buttons */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                Amount to Deposit (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748B' }}>
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  className="app-input"
                  style={{ paddingLeft: '2.25rem' }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              {/* Preset Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {[1000, 5000, 10000, 25000, 50000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.5rem',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    +₹ {val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                Deposit Memo
              </label>
              <input
                type="text"
                className="app-input"
                placeholder="e.g. Monthly salary deposit"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || depositAmount <= 0}
              className="btn-primary"
              style={{
                marginTop: '0.5rem',
                padding: '0.9rem',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin-animate" />
                  <span>Processing Double-Entry Credit...</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine size={18} />
                  <span>Authorize Deposit of ₹ {depositAmount.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right Balance Projection & Accounting Mechanics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Balance Projection Card */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Sparkles size={18} color="#059669" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                Real-Time Balance Projection
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F8FAFC', borderRadius: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Current Balance:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                  ₹ {currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F8FAFC', borderRadius: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Deposit Inflow:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>
                  + ₹ {depositAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.85rem',
                background: '#ECFDF5',
                border: '1.5px solid #A7F3D0',
                borderRadius: '0.75rem',
                marginTop: '0.25rem'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065F46' }}>Projected New Balance:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#047857' }}>
                  ₹ {projectedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Double-Entry Mechanism Explanation */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <ShieldCheck size={18} color="#4F46E5" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                Double-Entry Inflow Safeguard
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              In LedgerLine, even a customer deposit creates paired balanced ledger entries:
            </p>

            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '0.75rem',
              padding: '0.85rem',
              border: '1px solid #E2E8F0',
              fontSize: '0.78rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontFamily: 'monospace'
            }}>
              <div style={{ color: '#059669' }}>+ CREDIT: Customer Account ({targetAccount?.accountNumber})</div>
              <div style={{ color: '#4F46E5' }}>- DEBIT:  Gateway Settlement Pool (SYS-VAULT-001)</div>
              <div style={{ color: '#0F172A', fontWeight: 700, borderTop: '1px solid #E2E8F0', paddingTop: '0.35rem' }}>
                NET VARIANCE = ₹ 0.00 (Books in Equilibrium)
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Deposit Confirmation Modal */}
      {success && (
        <div className="modal-overlay" onClick={() => setSuccess(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                border: '2px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <CheckCircle2 size={36} color="#059669" />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                Deposit Confirmed!
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>
                Funds have been credited to your account and balanced in the ledger.
              </p>
            </div>

            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '1rem',
              padding: '1.25rem',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.85rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Deposited Amount:</span>
                <span style={{ fontWeight: 800, color: '#059669', fontSize: '1.1rem' }}>
                  + ₹ {success.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Credited Account:</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>{success.accountNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>New Account Balance:</span>
                <span style={{ fontWeight: 800, color: '#0F172A' }}>
                  ₹ {success.newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Settlement Method:</span>
                <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{success.method}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setSuccess(null)}
                className="btn-primary"
                style={{ flex: 1, background: '#059669' }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSuccess(null);
                  onNavigate('dashboard');
                }}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                View Dashboard →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

