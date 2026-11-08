import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import AccountOverview from './components/AccountOverview.jsx';
import TransferModal from './components/TransferModal.jsx';
import DepositWithdrawModal from './components/DepositWithdrawModal.jsx';
import LedgerStatement from './components/LedgerStatement.jsx';
import AuditorDashboard from './components/AuditorDashboard.jsx';
import { api, getStoredAuth, setStoredAuth, clearStoredAuth } from './api.js';

export default function App() {
  const [auth, setAuth] = useState(getStoredAuth());
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [conservation, setConservation] = useState(null);
  const [transferSource, setTransferSource] = useState(null);
  const [depositAccount, setDepositAccount] = useState(null);
  const [withdrawAccount, setWithdrawAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-login to seeded Alice if fresh visitor
  useEffect(() => {
    if (!auth) {
      handleLogin('alice', 'Password123!');
    }
  }, []);

  useEffect(() => {
    if (auth) {
      loadDashboardData();
    }
  }, [auth]);

  const handleLogin = async (usernameOrEmail, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(usernameOrEmail, password);
      const user = res.data;
      setStoredAuth(user.token, user);
      setAuth({ token: user.token, user });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    setAuth(null);
    setAccounts([]);
    setSelectedAccount(null);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const accRes = await api.getAccounts();
      setAccounts(accRes.data || []);

      // If user has Auditor role, fetch conservation
      if (auth?.user?.role === 'ROLE_AUDITOR' || auth?.user?.role === 'ROLE_ADMIN') {
        const consRes = await api.getConservationStatus();
        setConservation(consRes.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAuditor = auth?.user?.role === 'ROLE_AUDITOR';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        user={auth?.user}
        onSwitchUser={handleLogin}
        onLogout={handleLogout}
        conservation={conservation}
      />

      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container">
          {error && (
            <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)', border: '1px solid #DC2626', color: '#FCA5A5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {isAuditor ? (
            <AuditorDashboard />
          ) : selectedAccount ? (
            <LedgerStatement
              account={selectedAccount}
              onBack={() => {
                setSelectedAccount(null);
                loadDashboardData();
              }}
            />
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Your Accounts</h2>
                  <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>All money movements are backed by balanced double-entry ledger entries</p>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading account balances...</div>
              ) : (
                <AccountOverview
                  accounts={accounts}
                  onSelectAccount={setSelectedAccount}
                  onOpenTransfer={setTransferSource}
                  onOpenDeposit={setDepositAccount}
                  onOpenWithdraw={setWithdrawAccount}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Transfer Modal */}
      {transferSource && (
        <TransferModal
          sourceAccount={transferSource}
          allAccounts={accounts}
          onClose={() => setTransferSource(null)}
          onSuccess={() => {
            setTransferSource(null);
            loadDashboardData();
          }}
        />
      )}

      {/* Deposit Modal */}
      {depositAccount && (
        <DepositWithdrawModal
          mode="deposit"
          account={depositAccount}
          onClose={() => setDepositAccount(null)}
          onSuccess={() => {
            setDepositAccount(null);
            loadDashboardData();
          }}
        />
      )}

      {/* Withdraw Modal */}
      {withdrawAccount && (
        <DepositWithdrawModal
          mode="withdraw"
          account={withdrawAccount}
          onClose={() => setWithdrawAccount(null)}
          onSuccess={() => {
            setWithdrawAccount(null);
            loadDashboardData();
          }}
        />
      )}

      <footer style={{ borderTop: '1px solid #1F2937', padding: '1.5rem 0', textAlign: 'center', fontSize: '0.75rem', color: '#6B7280' }}>
        <div className="container">
          LedgerLine &bull; Snovasys Hiring Challenge 2026 &bull; Strict Double-Entry Ledger &bull; Idempotency &bull; Concurrency Protected
        </div>
      </footer>
    </div>
  );
}
