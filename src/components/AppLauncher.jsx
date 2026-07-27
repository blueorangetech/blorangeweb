import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import logoImage from '../assets/blueorange_logo.png';

function AppLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const launcherRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (launcherRef.current && !launcherRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const token = Cookies.get('Authorization');
  const geoDashboardUrl = token 
    ? `${import.meta.env.VITE_GEO_DASHBOARD_URL || 'http://localhost:5173'}?auth_token=${token}` 
    : (import.meta.env.VITE_GEO_DASHBOARD_URL || 'http://localhost:5173');
  const reportDashboardUrl = window.location.origin;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={launcherRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '9px',
          borderRadius: '12px',
          color: '#64748b',
          backgroundColor: isOpen ? '#f1f5f9' : 'transparent',
          border: '1px solid',
          borderColor: isOpen ? '#cbd5e1' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        title="Services"
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.color = '#0f172a';
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.color = '#64748b';
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 8px)',
          width: '280px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          padding: '16px 0',
          zIndex: 9999,
          color: '#1e293b',
          textAlign: 'left'
        }}>
          {/* Header */}
          <div style={{ padding: '0 20px 12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={logoImage} alt="BlueOrange Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>BlueOrange Communications</span>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginTop: '2px' }}>Marketing Platform</span>
          </div>
          
          {/* List Items */}
          <div style={{ marginTop: '8px', padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <a 
              href={reportDashboardUrl}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '12px',
                color: '#374151',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#111827';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#374151';
              }}
            >
              <span className="material-symbols-outlined" style={{ color: '#f97316', fontSize: '18px', flexShrink: 0, userSelect: 'none' }}>
                monitoring
              </span>
              <span style={{ flex: 1 }}>Creative Dash Board</span>
            </a>
            
            <a 
              href={geoDashboardUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '12px',
                color: '#374151',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#111827';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#374151';
              }}
            >
              <span className="material-symbols-outlined" style={{ color: '#2563eb', fontSize: '18px', flexShrink: 0, userSelect: 'none' }}>
                data_exploration
              </span>
              <span style={{ flex: 1 }}>GEO Dash Board</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppLauncher;
