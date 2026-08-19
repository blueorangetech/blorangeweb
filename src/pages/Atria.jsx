import React, { useState, useEffect } from 'react';
import {
  DashboardHeader,
  Footer,
  UserManagement,
  LoginRequiredCard,
  AccessDeniedCard,
  ClientSidebar,
  NaverBudgetView,
} from '../components';
import { useAuth } from '../context/AuthContext';
import '../styles/Atria.css';

function Atria() {
  const {
    isLoggedIn,
    hasPermission,
    userName,
    currentUserInfo,
    checkAuth,
    logout,
    openLoginModal,
  } = useAuth();

  const [activeMenu, setActiveMenu] = useState('budget-naver');
  const [apiStatus, setApiStatus] = useState('loading'); // 'connected', 'error', 'loading', 'mock'

  useEffect(() => {
    checkAuth('atria', true);
  }, [checkAuth]);

  // 활성화할 메뉴 ID 목록
  const enabledMenuIds = [
    'budget-naver',
    ...(currentUserInfo?.role === 'master' || currentUserInfo?.role === 'admin' ? ['etc-account'] : [])
  ];

  // 메뉴 구조 정의
  const menuStructure = [
    {
      id: 'budget',
      label: '예산 및 운영 관리',
      icon: 'payments',
      subItems: [
        { id: 'budget-naver', label: '네이버 검색광고' },
      ],
    },
    ...(currentUserInfo?.role === 'master' || currentUserInfo?.role === 'admin'
      ? [
          {
            id: 'etc',
            label: '설정 및 관리',
            icon: 'settings',
            subItems: [
              { id: 'etc-account', label: '계정 관리' },
            ],
          },
        ]
      : []),
  ];

  const renderApiStatusBadge = () => {
    switch (apiStatus) {
      case 'connected':
        return (
          <span className="api-status-badge connected" title="네이버 검색광고 API 실시간 정상 연동 중">
            <span className="status-dot" />
            <span className="badge-text">API 실시간 연동</span>
          </span>
        );
      case 'error':
        return (
          <span className="api-status-badge error" title="네이버 API 통신 오류">
            <span className="status-dot" />
            <span className="badge-text">API 연동 오류</span>
          </span>
        );
      case 'loading':
        return (
          <span className="api-status-badge loading" title="연결 상태 확인 중">
            <span className="status-dot" />
            <span className="badge-text">연결 확인 중...</span>
          </span>
        );
      default:
        return (
          <span className="api-status-badge mock" title="모의 데이터 모드">
            <span className="status-dot" />
            <span className="badge-text">Mock 모드</span>
          </span>
        );
    }
  };

  return (
    <div className="atria-app">
      <DashboardHeader
        title={
          <div className="header-title-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="header-title-text">Atria 대시보드</span>
            {renderApiStatusBadge()}
          </div>
        }
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={currentUserInfo?.role}
        onLogout={logout}
        onLoginClick={openLoginModal}
      />

      {!isLoggedIn ? (
        <LoginRequiredCard onLoginClick={openLoginModal} />
      ) : !hasPermission ? (
        <AccessDeniedCard />
      ) : (
        <div className="atria-dashboard-layout">
          <ClientSidebar
            activeMenu={activeMenu}
            onMenuChange={setActiveMenu}
            enabledMenuIds={enabledMenuIds}
            menuStructure={menuStructure}
          />
          
          <main className="atria-viewport">
            {activeMenu === 'budget-naver' && (
              <NaverBudgetView
                customer="atria"
                onApiStatusChange={setApiStatus}
              />
            )}

            {activeMenu === 'etc-account' && (
              isLoggedIn && currentUserInfo && (currentUserInfo.role === 'master' || currentUserInfo.role === 'admin') ? (
                <div style={{ padding: '24px 0', background: '#ffffff', borderRadius: '16px', border: '1px solid #edf2f7' }}>
                  <UserManagement customerUrl="atria" currentUserInfo={currentUserInfo} />
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', color: '#64748b' }}>
                  <h3>접근 권한이 없습니다. 관리자 계정으로 로그인하세요.</h3>
                </div>
              )
            )}
          </main>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Atria;
