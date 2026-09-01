import React, { useState, useEffect } from 'react';
import '../styles/Playground.css';
import {
  DashboardHeader,
  Footer,
  CreativeStudioView,
  UserManagement,
  LoginRequiredCard,
  AccessDeniedCard,
  ImageLibrary,
  ClientSidebar,
} from '../components';
import { useAuth } from '../context/AuthContext';

const PLAYGROUND_MENU_BASE = [
  {
    id: 'studio',
    label: '스튜디오',
    icon: 'auto_awesome',
    subItems: [
      { id: 'creative-ai-studio', label: 'AI 크리에이티브' },
    ],
  },
  {
    id: 'assets',
    label: '에셋',
    icon: 'photo_library',
    subItems: [
      { id: 'library', label: '라이브러리' },
    ],
  },
];

const PLAYGROUND_MENU_ADMIN = [
  ...PLAYGROUND_MENU_BASE,
  {
    id: 'admin',
    label: '관리',
    icon: 'admin_panel_settings',
    subItems: [
      { id: 'management', label: '권한 관리' },
    ],
  },
];

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

  const [activeMenu, setActiveMenu] = useState('creative-ai-studio');

  useEffect(() => {
    checkAuth('playground', true);
  }, [checkAuth]);

  const isAdmin = currentUserInfo.role === 'master' || currentUserInfo.role === 'admin';
  const menuStructure = isAdmin ? PLAYGROUND_MENU_ADMIN : PLAYGROUND_MENU_BASE;
  const enabledMenuIds = [
    'creative-ai-studio',
    'library',
    ...(isAdmin ? ['management'] : []),
  ];

  return (
    <div className="playground-app">
      <DashboardHeader
        title={
          <div className="header-logo-container">
            <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem' }}>Blue Orange Communications</span>
            <span className="header-title-text">Play Ground</span>
          </div>
        }
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={currentUserInfo.role}
        onLogout={logout}
        onLoginClick={openLoginModal}
      />

      {!isLoggedIn ? (
        <LoginRequiredCard serviceName="Play Ground" />
      ) : !hasPermission ? (
        <AccessDeniedCard serviceName="Play Ground" />
      ) : (
        <div className="hanssem-dashboard-layout" style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 70px)' }}>
          <ClientSidebar
            activeMenu={activeMenu}
            onMenuChange={setActiveMenu}
            enabledMenuIds={enabledMenuIds}
            menuStructure={menuStructure}
          />
          <div className="viewport-content" style={{ flex: 1, padding: '24px 32px', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
            {activeMenu === 'creative-ai-studio' && (
              <CreativeStudioView embedded={true} onGoToLibrary={() => setActiveMenu('library')} />
            )}
            {activeMenu === 'library' && (
              <main className="hanssem-main" style={{ margin: '0 auto 3rem', padding: '3rem 2rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)' }}>
                <ImageLibrary pageName="playground" />
              </main>
            )}
            {activeMenu === 'management' && (
              <main className="hanssem-main" style={{ margin: '0 auto 3rem', padding: '3rem 2rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)' }}>
                <UserManagement customerUrl="playground" currentUserInfo={currentUserInfo} />
              </main>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Playground;
