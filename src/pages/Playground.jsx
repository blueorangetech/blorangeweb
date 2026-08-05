import React, { useState, useEffect } from 'react';
import '../styles/Playground.css';
import { DashboardHeader, Footer, CreativeStudioView, VariationStudioView, UserManagement, LoginRequiredCard, AccessDeniedCard, ImageLibrary } from '../components';
import { useAuth } from '../context/AuthContext';

function Playground() {
  const {
    isLoggedIn,
    hasPermission,
    userName,
    currentUserInfo,
    checkAuth,
    logout,
    openLoginModal,
  } = useAuth();

  const [activeFilter, setActiveFilter] = useState('creative-studio');

  useEffect(() => {
    checkAuth('playground', true);
  }, [checkAuth]);

  const filterButtons = [
    { id: 'creative-studio', label: 'AI 제품 연출' },
    { id: 'variation-studio', label: 'AI 배너 양산' },
    { id: 'library', label: '라이브러리' },
    ...(currentUserInfo.role === 'master' || currentUserInfo.role === 'admin'
      ? [{ id: 'management', label: '권한 관리' }]
      : []),
  ];



  return (
    <div className="playground-app">
      <DashboardHeader
        title={
          <div className="header-logo-container">
            <span>Blue Orange Communications</span>
            <span className="header-title-text">Play Ground</span>
          </div>
        }
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={currentUserInfo.role}
        onLogout={logout}
        onLoginClick={openLoginModal}
      />
      <section className="playground-filter-section">
        <div className="playground-header-container">
          <div className="playground-filter-buttons">
            {filterButtons.map((filter) => (
              <button
                key={filter.id}
                className={`playground-filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>


          <div className="playground-info-bar">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563eb' }}>
              info
            </span>
            <span>
              {activeFilter === 'creative-studio' && (
                <><strong>AI 제품 연출:</strong> 제품/소재 이미지를 고정한 채 AI 스튜디오 배경 연출, 조명 보정 및 디테일 개선을 수행합니다.</>
              )}
              {activeFilter === 'variation-studio' && (
                <><strong>AI 배너 양산:</strong> 메인 메시지나 시드 이미지를 참고하여 네이버, 메타, 구글, 틱톡, 카카오 등 매체 규격별 배너를 일괄 자동 양산합니다.</>
              )}
              {activeFilter === 'library' && (
                <><strong>라이브러리:</strong> Playground 전용 정적 이미지 및 생성/업로드된 에셋을 확인하고 다운로드합니다.</>
              )}
              {activeFilter === 'management' && (
                <><strong>권한 관리:</strong> 사용자 계정 승인 및 접근 권한을 통합 관리합니다.</>
              )}
            </span>
          </div>
        </div>
      </section>

      {!isLoggedIn ? (
        <LoginRequiredCard serviceName="Play Ground" />
      ) : !hasPermission ? (
        <AccessDeniedCard serviceName="Play Ground" />
      ) : (
        <>
          {activeFilter === 'creative-studio' && (
            <CreativeStudioView onGoToLibrary={() => setActiveFilter('library')} />
          )}
          {activeFilter === 'variation-studio' && <VariationStudioView />}
          {activeFilter === 'library' && <ImageLibrary pageName="playground" />}


          {activeFilter === 'management' && (
            <main className="hanssem-main">
              <div className="section-header" style={{ borderBottom: 'none', textAlign: 'center', padding: '5rem 0' }}>
                <UserManagement customerUrl="playground" currentUserInfo={currentUserInfo} />
              </div>
            </main>
          )}
        </>
      )}



      <Footer />
    </div>
  );
}

export default Playground;