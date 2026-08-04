import React from 'react';
import { useAuth } from '../context/AuthContext';

const LoginRequiredCard = ({ serviceName = '해당', customTitle, customMessage, buttonText = '로그인하고 계속하기' }) => {
  const { openLoginModal } = useAuth();

  return (
    <main className="hanssem-main" style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="access-denied-container" style={{
        padding: '60px 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <div className="lock-icon" style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#f8f9fa',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#adb5bd',
          marginBottom: '8px'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>

        <div className="text-content">
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
            {customTitle || '로그인이 필요한 메뉴입니다'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>
            {customMessage || (
              <>
                {serviceName} 페이지 접근은 <br />
                승인된 관계자만 이용 가능합니다.
              </>
            )}
          </p>
        </div>

        <button
          onClick={openLoginModal}
          style={{
            background: '#000000',
            color: '#ffffff',
            padding: '15px 38px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginTop: '8px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.15)';
          }}
        >
          {buttonText}
        </button>
      </div>
    </main>
  );
};

export default LoginRequiredCard;
