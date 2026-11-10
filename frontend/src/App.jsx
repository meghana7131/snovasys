import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TopNav from './components/TopNav.jsx';
import HomePage from './components/HomePage.jsx';
import DashboardView from './components/DashboardView.jsx';
import AccountsView from './components/AccountsView.jsx';
import TransferView from './components/TransferView.jsx';
import DepositView from './components/DepositView.jsx';
import WithdrawalView from './components/WithdrawalView.jsx';
import TransactionsView from './components/TransactionsView.jsx';
import AuditLogsView from './components/AuditLogsView.jsx';
import SecurityStatusView from './components/SecurityStatusView.jsx';
import ProfileView from './components/ProfileView.jsx';
import { api, getStoredAuth, setStoredAuth, clearStoredAuth } from './api.js';

export default function App() {
  const [auth, setAuth] = useState(getStoredAuth());
  const [activeTab, setActiveTab] = useState('home');
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

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
    setActiveTab('home');
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

  const totalPortfolioBalance = accounts.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);

  const handleAccountAction = (acc) => {
    setSelectedAccount(acc);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F7FC' }}>
      
      {/* 1. Left Dark Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        
        {/* Top Header Navigation */}
        <TopNav
          user={auth?.user}
          activeTab={activeTab}
          onProfileClick={() => setActiveTab('profile')}
        />

        {/* Content Body Area - Renders Dedicated Page per tab */}
        <main style={{ flex: 1, padding: '0 2rem 2.5rem 2rem' }}>
          
          {/* Home / Showcase Landing Page */}
          {activeTab === 'home' && (
            <HomePage
              onNavigate={(tab) => setActiveTab(tab)}
              primaryAccount={primaryAccount}
              totalBalance={totalPortfolioBalance || 25750}
            />
          )}

          {/* Executive Dashboard */}
          {activeTab === 'dashboard' && (
            <DashboardView
              account={primaryAccount}
              allAccounts={accounts}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectAccountForAction={handleAccountAction}
            />
          )}

          {/* Dedicated Accounts Page */}
          {activeTab === 'accounts' && (
            <AccountsView
              accounts={accounts}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectAccountForAction={handleAccountAction}
            />
          )}

          {/* Dedicated Money Transfer Page */}
          {activeTab === 'transfer' && (
            <TransferView
              accounts={accounts}
              primaryAccount={selectedAccount || primaryAccount}
              onTransferSuccess={loadData}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {/* Dedicated Deposits Page */}
          {activeTab === 'deposit' && (
            <DepositView
              accounts={accounts}
              primaryAccount={selectedAccount || primaryAccount}
              onDepositSuccess={loadData}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {/* Dedicated Withdrawals Page */}
          {activeTab === 'withdrawal' && (
            <WithdrawalView
              accounts={accounts}
              primaryAccount={selectedAccount || primaryAccount}
              onWithdrawSuccess={loadData}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {/* Dedicated Transaction History Page */}
          {activeTab === 'transactions' && (
            <TransactionsView
              account={selectedAccount || primaryAccount}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {/* Dedicated Audit Logs Page */}
          {activeTab === 'audit' && (
            <AuditLogsView
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {/* Dedicated Security Page */}
          {activeTab === 'security' && (
            <SecurityStatusView
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {/* Dedicated Profile & Roles Page */}
          {activeTab === 'profile' && (
            <ProfileView
              user={auth?.user}
              onSwitchUser={(user, pass) => handleLogin(user, pass)}
            />
          )}

        </main>
      </div>

    </div>
  );
}
