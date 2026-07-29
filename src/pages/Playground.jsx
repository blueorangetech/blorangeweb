import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { DashboardHeader, Footer, LoginModal, CreativeStudioView, VariationStudioView, UserManagement } from '../components';
import { checkPageAuth, logoutUser } from '../utils/auth';

function Playground() {
  const [activeFilter, setActiveFilter] = useState('creative-studio');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(Cookies.get('UserName') || '');
  const [hasPermission, setHasPermission] = useState(true);
  const [currentUserInfo, setCurrentUserInfo] = useState({ role: '', is_master: false });

  const checkAuth = async () => {
    // Playground 페이지 권한 검증 설정
    const authResult = await checkPageAuth({ customerPath: 'playground', checkPermission: true });
    setIsLoggedIn(authResult.isLoggedIn);
    setHasPermission(authResult.hasPermission);
    setUserName(authResult.userName);
    setCurrentUserInfo(authResult.currentUserInfo);
  };

  const handleLoginSuccess = (result) => {
    setIsLoggedIn(true);
    if (result.name) setUserName(result.name);

    setCurrentUserInfo({
      role: result.role || '',
      is_master: result.is_master || result.role === 'master'
    });

    setIsLoginModalOpen(false);
    checkAuth();
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      const resetState = logoutUser();
      setIsLoggedIn(resetState.isLoggedIn);
      setUserName(resetState.userName);
      setHasPermission(resetState.hasPermission);
      setCurrentUserInfo(resetState.currentUserInfo);
    }
  };

  const filterButtons = [
    { id: 'creative-studio', label: 'AI 소재 제작실' },
    { id: 'variation-studio', label: '베리에이션 센터' },
    ...(currentUserInfo.role === 'master' || currentUserInfo.role === 'admin'
      ? [{ id: 'management', label: '권한 관리' }]
      : []),
  ];

  useEffect(() => {
    checkAuth();
  }, []);

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
        onLogout={handleLogout}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />
      <section className="hanssem-filter-section">
        <div className="header-container">
          <div className="filter-buttons">
            {filterButtons.map((filter) => (
              <button
                key={filter.id}
                className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeFilter === 'creative-studio' && <CreativeStudioView />}
      {activeFilter === 'variation-studio' && <VariationStudioView />}
      {activeFilter === 'management' && isLoggedIn && hasPermission && (
        <main className="hanssem-main">
          <div className="section-header" style={{ borderBottom: 'none', textAlign: 'center', padding: '5rem 0' }}>
            <UserManagement customerUrl="playground" currentUserInfo={currentUserInfo} />
          </div>
        </main>
      )}

      <Footer />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default Playground;