import React from 'react';

const AccessDeniedCard = ({ serviceName = '해당', customMessage }) => {
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
          backgroundColor: '#fff1f0',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ff4d4f',
          marginBottom: '8px'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>

        <div className="text-content">
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
            접근 권한이 없습니다
          </h2>
          <p style={{ color: '#6b7280', fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>
            {customMessage || (
              <>
                죄송합니다. 현재 계정으로는 {serviceName} 대시보드에 접근할 수 없습니다.<br />
                관리자에게 권한을 요청해주세요.
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  );
};

export default AccessDeniedCard;
