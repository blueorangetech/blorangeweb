import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from '../components';
import '../styles/Hanssem.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="hanssem-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Header title={
        <div className="header-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="header-title-text" style={{ fontSize: '1.2rem', fontWeight: '800' }}>블루오렌지 리포트 대시보드</span>
        </div>
      } />

      <main className="hanssem-main" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '80px 20px',
        margin: '40px auto',
        maxWidth: '800px',
        width: '90%',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '6rem', 
          fontWeight: '900', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          marginBottom: '16px',
          letterSpacing: '-2px'
        }}>
          404
        </div>

        <h2 style={{ 
          fontSize: '1.75rem', 
          fontWeight: '800', 
          color: '#1e293b', 
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          페이지를 찾을 수 없습니다
        </h2>

        <p style={{ 
          fontSize: '1rem', 
          color: '#64748b', 
          maxWidth: '480px', 
          lineHeight: '1.6', 
          marginBottom: '36px',
          wordBreak: 'keep-all'
        }}>
          입력하신 웹 주소가 올바른지 확인해 주세요.<br />
          요청하신 페이지가 삭제되었거나 주소가 변경되었을 수 있습니다.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/hanssem_hf')}
            style={{
              backgroundColor: '#667eea',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(102, 126, 234, 0.35)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            대시보드 홈으로 이동
          </button>

          <button
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: '700',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            이전 페이지로 돌아가기
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default NotFound;
