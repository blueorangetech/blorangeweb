import React from 'react';
import HanssemLogo from '../HanssemLogo';
import logoImage from '../../../../assets/blueorange_logo.png';

export default function DataChatWelcome({ isHf, serviceTitle, templateQuestions, onSend }) {
  const hanssemLogo = (
    <HanssemLogo fill="#1e293b" width="135" height="18" />
  );

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    }}>
      {/* 로고 컨테이너 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px',
        padding: '12px 24px',
        backgroundColor: '#ffffff',
        borderRadius: '50px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {hanssemLogo}
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }} />
        <img src={logoImage} alt="BlueOrange Logo" style={{ height: '24px', objectFit: 'contain' }} />
      </div>

      {/* 환영 문구 */}
      <h2 style={{
        fontSize: '2.2rem',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #1e293b 30%, #3b82f6 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '12px',
        letterSpacing: '-0.5px'
      }}>
        안녕하세요. 무엇을 도와드릴까요?
      </h2>
      
      <p style={{
        color: '#64748b',
        fontSize: '1.05rem',
        marginBottom: '40px',
        fontWeight: 500
      }}>
        {serviceTitle} 광고 성과 및 미디어믹스 요약 정보를 Data Chat에 질문해 보세요.
      </p>

      {/* 템플릿 추천 질문 카드 리스트 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        width: '100%',
        maxWidth: '720px',
        marginBottom: '40px'
      }}>
        {templateQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSend(q)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '20px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.02)';
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', lineHeight: 1.4 }}>{q}</span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>즉시 물어보기 &rarr;</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
