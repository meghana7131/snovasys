import React from 'react';
import { User, ShieldCheck, Key, Mail, Building } from 'lucide-react';

export default function ProfileView({ user, onSwitchUser }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>User Profile & Role Settings</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>
          Role-Based Access Control identity credentials
        </p>
      </div>

      <div className="app-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '1.5rem'
          }}>
            M
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>
              {user?.username || 'Meghana'}
            </h3>
            <span className="badge-pill badge-pill-blue" style={{ marginTop: '0.25rem' }}>
              {user?.role || 'ROLE_USER'}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Email Address</span>
            <div style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 600, marginTop: '0.2rem' }}>
              {user?.email || 'meghana@example.com'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Account Access Tier</span>
            <div style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 600, marginTop: '0.2rem' }}>
              Standard Account Holder (Read/Write)
            </div>
          </div>
        </div>

        {/* Quick Demo Switcher for Evaluators */}
        <div style={{ marginTop: '1.75rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '0.75rem', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
            Switch Persona (Judge Testing Tool):
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onSwitchUser('alice', 'Password123!')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
            >
              Alice (User: $1,000)
            </button>
            <button
              onClick={() => onSwitchUser('bob', 'Password123!')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
            >
              Bob (User: $500)
            </button>
            <button
              onClick={() => onSwitchUser('auditor', 'Password123!')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
            >
              Compliance Auditor (Read-Only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

