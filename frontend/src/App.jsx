import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TopNav from './components/TopNav.jsx';
import DashboardView from './components/DashboardView.jsx';
import AccountsView from './components/AccountsView.jsx';
import TransactionsView from './components/TransactionsView.jsx';
import AuditLogsView from './components/AuditLogsView.jsx';
import SecurityStatusView from './components/SecurityStatusView.jsx';
import ProfileView from './components/ProfileView.jsx';
import TransferModal from './components/TransferModal.jsx';
import DepositWithdrawModal from './components/DepositWithdrawModal.jsx';
import LedgerStatement from './components/LedgerStatement.jsx';
import { api, getStoredAuth, setStoredAuth, clearStoredAuth } from './api.js';

export default function App() {
  const [auth, setAuth] = useState(getStoredAuth());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [modalAccount, setModalAccount] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Auto-authenticate as default user on fresh visitor
  useEffect(() => {
    if (!auth) {
      handleLogin('meghana', 'Password123!');
    }
  }, []);

  useEffect(() => {
    if (auth) {
      loadData();
    }
  }, [auth]);

  const handleLogin = async (usernameOrEmail, password) => {
    try {
      const res = await api.login(usernameOrEmail, password);
      const user = res.data;
      setStoredAuth(user.token, user);
      setAuth({ token: user.token, user });
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    setAuth(null);
    setAccounts([]);
  };

  const loadData = async () => {
    try {
      const accRes = await api.getAccounts();
      const loadedAccounts = accRes.data || [];
      setAccounts(loadedAccounts);
      if (loadedAccounts.length > 0 && !selectedAccount) {
        setSelectedAccount(loadedAccounts[0]);
      }
    } catch (err) {
      console.error('Error loading accounts:', err);
    }
  };

  // Primary active account (defaulting to primary checking AC-20261108-001)
  const primaryAccount = accounts.length > 0
    ? accounts[0]
    : { id: 'default-acc', accountNumber: 'AC-20261108-001', balance: 25750.00, currency: 'INR' };

  // Handle inline transfer from Dashboard form
  const handleInlineTransfer = async (fromAccNumber, toAccNumber, amount) => {
    setTransferLoading(true);
    setTransferError(null);
    setTransferSuccess(false);

    try {
      const sourceAcc = accounts.find(a => a.accountNumber === fromAccNumber) || accounts[0];
      const targetAcc = accounts.find(a => a.accountNumber === toAccNumber) || accounts[1] || accounts[0];

      const idempotencyKey = crypto.randomUUID();
      await api.transfer(
        sourceAcc.id,
        targetAcc.id,
        amount,
        `Dashboard Transfer to ${toAccNumber}`,
        idempotencyKey
      );

      setTransferSuccess(true);
      await loadData();
      setTimeout(() => setTransferSuccess(false), 4000);
    } catch (err) {
      setTransferError(err.message || 'Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleNavSelect = (tabId) => {
    if (tabId === 'transfer') {
      setModalAccount(primaryAccount);
      setShowTransferModal(true);
      return;
    }
    if (tabId === 'deposit') {
      setModalAccount(primaryAccount);
      setShowDepositModal(true);
      return;
    }
    if (tabId === 'withdrawal') {
      setModalAccount(primaryAccount);
      setShowWithdrawModal(true);
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F0F4FA' }}>
      
      {/* 1. Left Dark Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleNavSelect}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header Navigation */}
        <TopNav
          user={auth?.user}
          onProfileClick={() => setActiveTab('profile')}
        />

        {/* Content Body Area */}
        <main style={{ flex: 1, padding: '0 2rem 2rem 2rem' }}>
          {activeTab === 'dashboard' && (
            <DashboardView
              account={primaryAccount}
              allAccounts={accounts}
              onOpenTransfer={() => {
                setModalAccount(primaryAccount);
                setShowTransferModal(true);
              }}
              onOpenDeposit={() => {
                setModalAccount(primaryAccount);
                setShowDepositModal(true);
              }}
              onOpenWithdraw={() => {
                setModalAccount(primaryAccount);
                setShowWithdrawModal(true);
              }}
              onViewStatement={() => {
                setSelectedAccount(primaryAccount);
                setActiveTab('transactions');
              }}
              onInlineTransfer={handleInlineTransfer}
              transferLoading={transferLoading}
              transferError={transferError}
              transferSuccess={transferSuccess}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountsView
              accounts={accounts}
              onOpenTransfer={(acc) => {
                setModalAccount(acc);
                setShowTransferModal(true);
              }}
              onOpenDeposit={(acc) => {
                setModalAccount(acc);
                setShowDepositModal(true);
              }}
              onOpenWithdraw={(acc) => {
                setModalAccount(acc);
                setShowWithdrawModal(true);
              }}
              onViewStatement={(acc) => {
                setSelectedAccount(acc);
                setActiveTab('transactions');
              }}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView account={selectedAccount || primaryAccount} />
          )}

          {activeTab === 'audit' && (
            <AuditLogsView />
          )}

          {activeTab === 'security' && (
            <SecurityStatusView />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              user={auth?.user}
              onSwitchUser={(user, pass) => handleLogin(user, pass)}
            />
          )}
        </main>
      </div>

      {/* Transfer Modal Dialog */}
      {showTransferModal && (
        <TransferModal
          sourceAccount={modalAccount || primaryAccount}
          allAccounts={accounts}
          onClose={() => setShowTransferModal(false)}
          onSuccess={() => {
            setShowTransferModal(false);
            loadData();
          }}
        />
      )}

      {/* Deposit Modal Dialog */}
      {showDepositModal && (
        <DepositWithdrawModal
          mode="deposit"
          account={modalAccount || primaryAccount}
          onClose={() => setShowDepositModal(false)}
          onSuccess={() => {
            setShowDepositModal(false);
            loadData();
          }}
        />
      )}

      {/* Withdraw Modal Dialog */}
      {showWithdrawModal && (
        <DepositWithdrawModal
          mode="withdraw"
          account={modalAccount || primaryAccount}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={() => {
            setShowWithdrawModal(false);
            loadData();
          }}
        />
      )}

    </div>
  );
}
