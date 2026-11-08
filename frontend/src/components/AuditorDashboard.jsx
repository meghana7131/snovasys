import React, { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function AuditorDashboard() {
  const [logs, setLogs] = useState([]);
  const [conservation, setConservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAuditorData();
  }, []);

  const fetchAuditorData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsRes, consRes] = await Promise.all([
        api.getSystemAuditTrail(),
        api.getConservationStatus()
      ]);
      setLogs(logsRes.data || []);
      setConservation(consRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await api.getConservationStatus();
      setConservation(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Money Conservation Invariant Panel */}
      <div className="card" style={{ borderColor: '#374151' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>System Invariant Audit</h2>
            <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Mathematical proof that money across all user accounts & reserve pool is conserved</p>
          </div>

          <button onClick={handleRunAudit} disabled={auditLoading} className="btn btn-primary">
            {auditLoading ? 'Auditing Books...' : '⚡ Run Conservation Audit'}
          </button>
        </div>

        {conservation && (
          <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: '#0B0F19', borderRadius: '0.5rem', border: '1px solid #1F2937', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Total System Balance</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF' }}>
                ${Number(conservation.totalSystemMoney).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Invariant Condition</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span className={`badge ${conservation.conserved ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem' }}>
                  {conservation.conserved ? 'CONSERVED (BALANCED)' : 'VIOLATED'}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Status Note</span>
              <div style={{ fontSize: '0.85rem', color: '#D1D5DB', marginTop: '0.25rem' }}>
                {conservation.statusMessage}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Append-Only Audit Trail */}
      <div className="card">
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Append-Only Forensic Audit Trail</h2>
          <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Tamper-evident log of all system mutations and security events</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>Loading audit logs...</div>
        ) : error ? (
          <div style={{ color: '#F87171', padding: '1rem', textAlign: 'center' }}>{error}</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No audit logs recorded yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151', color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem' }}>Actor</th>
                  <th style={{ padding: '0.75rem' }}>Action</th>
                  <th style={{ padding: '0.75rem' }}>Entity</th>
                  <th style={{ padding: '0.75rem' }}>IP Address</th>
                  <th style={{ padding: '0.75rem' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #1F2937' }}>
                    <td style={{ padding: '0.75rem', color: '#9CA3AF', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#E5E7EB' }}>
                      {log.actor?.username || 'SYSTEM'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${log.action.includes('FAILED') ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#9CA3AF', fontSize: '0.8rem' }}>
                      {log.entityType} ({log.entityId ? log.entityId.slice(0, 8) + '...' : 'N/A'})
                    </td>
                    <td className="font-mono" style={{ padding: '0.75rem', color: '#9CA3AF', fontSize: '0.75rem' }}>
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#D1D5DB', fontSize: '0.8rem' }}>
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

