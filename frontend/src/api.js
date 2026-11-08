const API_BASE = '/api';

export function getStoredAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (token && user) {
    try {
      return { token, user: JSON.parse(user) };
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function setStoredAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function apiRequest(endpoint, options = {}) {
  const auth = getStoredAuth();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (auth && auth.token) {
    headers['Authorization'] = `Bearer ${auth.token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = data?.message || data || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: async (usernameOrEmail, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password })
    });
  },

  // Ledger & Accounts
  getAccounts: async () => {
    return apiRequest('/ledger/accounts');
  },

  getAccountLedger: async (accountId) => {
    return apiRequest(`/ledger/accounts/${accountId}/ledger`);
  },

  transfer: async (senderAccountId, recipientAccountId, amount, description, idempotencyKey) => {
    const headers = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    return apiRequest('/ledger/transfer', {
      method: 'POST',
      headers,
      body: JSON.stringify({ senderAccountId, recipientAccountId, amount: Number(amount), description })
    });
  },

  deposit: async (accountId, amount, description, idempotencyKey) => {
    const headers = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    return apiRequest('/ledger/deposit', {
      method: 'POST',
      headers,
      body: JSON.stringify({ accountId, amount: Number(amount), description })
    });
  },

  withdraw: async (accountId, amount, description, idempotencyKey) => {
    const headers = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    return apiRequest('/ledger/withdraw', {
      method: 'POST',
      headers,
      body: JSON.stringify({ accountId, amount: Number(amount), description })
    });
  },

  // Audit & Invariant
  getSystemAuditTrail: async () => {
    return apiRequest('/audit/system-trail');
  },

  getConservationStatus: async () => {
    return apiRequest('/audit/conservation');
  },

  // Health
  getHealth: async () => {
    return apiRequest('/health');
  }
};

