import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import { ShieldCheck, RefreshCw, FileText } from 'lucide-react';

export default function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSystemAuditTrail();
      setLogs(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>Append-Only Audit Trail</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>
            Tamper-evident forensic log recorded via independent transactions (REQUIRES_NEW)
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '0.5rem',
            padding: '0.55rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#1E293B',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Trail</span>
        </button>
      </div>

      <div className="app-card" style={{ padding: '1.25rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>Loading forensic trail...</div>
        ) : error ? (
          <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
            {error} (Auditor or Admin role required)
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No audit events logged yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ color: '#64748B', borderBottom: '1.5px solid #E2E8F0', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Actor</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Action</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Entity</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>IP Address</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#0F172A' }}>
                      {log.actor?.username || 'SYSTEM'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`badge-pill ${log.action.includes('FAILED') ? 'badge-pill-danger' : 'badge-pill-blue'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#475569' }}>
                      {log.entityType} ({log.entityId ? log.entityId.slice(0, 8) + '...' : 'N/A'})
                    </td>
                    <td className="font-mono" style={{ padding: '0.75rem 0.5rem', color: '#64748B', fontSize: '0.75rem' }}>
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#334155' }}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
