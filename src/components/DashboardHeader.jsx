import React from 'react';
import AppLauncher from './AppLauncher';
import '../styles/Common.css';

/**
 * DashboardHeader
 * 대시보드 공통 헤더 컴포넌트.
 *
 * @param {string|ReactNode} title       - 헤더 좌측에 표시할 제목 (문자열 또는 JSX)
 * @param {boolean}          isLoggedIn  - 로그인 여부
 * @param {string}           userName    - 표시할 사용자 이름
 * @param {string}           userRole    - 사용자 역할 (선택, 없으면 뱃지 미표시)
 * @param {function}         onLogout    - 로그아웃 핸들러
 * @param {function}         onLoginClick - 로그인 버튼 클릭 핸들러
 */
function DashboardHeader({ title, isLoggedIn, userName, userRole, onLogout, onLoginClick }) {
  return (
    <header className="common-header">
      <div
        className="common-container"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <h1 className="common-header-title">{title}</h1>

        <div
          className="header-actions"
          style={{ display: 'flex', alignItems: 'center', gap: '15px' }}
        >
          {/* 사용자 정보 & 로그인/로그아웃 */}
          {isLoggedIn ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
                {' '}
                사용자: <span style={{ fontWeight: '700', color: '#0f172a' }}>{userName}</span>
                {userRole && (
                  <span
                    style={{
                      marginLeft: '6px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#f1f5f9',
                      color: '#475569',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    {userRole}
                  </span>
                )}
              </span>

              <button
                onClick={onLogout}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                  e.currentTarget.style.borderColor = '#f87171';
                  e.currentTarget.style.color = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#fca5a5';
                  e.currentTarget.style.color = '#dc2626';
                }}
                style={{
                  fontSize: '0.85rem',
                  color: '#dc2626',
                  backgroundColor: 'transparent',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #fca5a5',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1e293b';
              }}
              style={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: '600',
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s',
              }}
            >
              로그인
            </button>
          )}

          <AppLauncher />
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
