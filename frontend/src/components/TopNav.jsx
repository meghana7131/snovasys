import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

export default function TopNav({ user, onProfileClick }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem 2rem',
      backgroundColor: 'transparent',
      gap: '1.5rem'
    }}>
      {/* Search Bar */}
      <div style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
        <Search
          size={18}
          color="#94A3B8"
          style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          placeholder="Search transactions..."
          style={{
            width: '100%',
            padding: '0.65rem 1rem 0.65rem 2.75rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            color: '#1E293B',
            outline: 'none',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#4F46E5';
            e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.12)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#E2E8F0';
            e.target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.02)';
          }}
        />
      </div>

      {/* Right Controls: Notification & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        
        {/* Notification Bell with Badge */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
          }}>
            <Bell size={18} color="#475569" />
          </div>
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            borderRadius: '50%',
            fontSize: '0.65rem',
            fontWeight: 700,
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #F0F4FA'
          }}>
            2
          </span>
        </div>

        {/* Profile Pill */}
        <div
          onClick={onProfileClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
            borderRadius: '9999px',
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {/* Illustrated Female Avatar matching mockup */}
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#C7D2FE',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(99, 102, 241, 0.25)',
            border: '1.5px solid #FFFFFF'
          }}>
            <svg width="38" height="38" viewBox="0 0 64 64" fill="none">
              {/* Background */}
              <circle cx="32" cy="32" r="32" fill="#C7D2FE" />
              {/* Back Hair */}
              <path d="M18 28 C 16 12, 48 12, 46 28 C 47 40, 48 48, 48 48 L 16 48 C 16 48, 17 40, 18 28 Z" fill="#3E2723" />
              {/* Neck */}
              <rect x="28" y="36" width="8" height="8" rx="2" fill="#FED7AA" />
              {/* Purple Shirt */}
              <path d="M19 44 C 23 41, 41 41, 45 44 L 49 64 L 15 64 Z" fill="#6366F1" />
              {/* Face */}
              <circle cx="32" cy="27" r="11" fill="#FED7AA" />
              {/* Front Hair Bangs */}
              <path d="M21 24 C 23 16, 41 16, 43 24 C 39 19, 36 21, 32 21 C 28 21, 25 19, 21 24 Z" fill="#4E342E" />
              <path d="M20 25 C 21 34, 21 40, 23 43 C 21 39, 21 30, 21 25 Z" fill="#4E342E" />
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

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
              {user?.username || 'Meghana'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>Account Holder</span>
              <ChevronDown size={12} color="#64748B" />
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
