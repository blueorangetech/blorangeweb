import React, { createContext, useContext, useState, useCallback } from 'react';
import { checkPageAuth, logoutUser } from '../utils/auth';
import LoginModal from '../components/LoginModal';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentUserInfo, setCurrentUserInfo] = useState({ role: '', is_master: false });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  const checkAuth = useCallback(async (customerPath = '', checkPermission = true) => {
    if (customerPath) setCurrentPath(customerPath);
    const authResult = await checkPageAuth({ customerPath, checkPermission });
    setIsLoggedIn(authResult.isLoggedIn);
    setHasPermission(authResult.hasPermission);
    setUserName(authResult.userName);
    setCurrentUserInfo(authResult.currentUserInfo);
    return authResult;
  }, []);

  const logout = useCallback(() => {
    const resetState = logoutUser();
    setIsLoggedIn(resetState.isLoggedIn);
    setHasPermission(resetState.hasPermission);
    setUserName(resetState.userName);
    setCurrentUserInfo(resetState.currentUserInfo);
  }, []);

  const openLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const handleLoginSuccess = useCallback((authData) => {
    setIsLoginModalOpen(false);
    if (currentPath) {
      checkAuth(currentPath);
    } else {
      const savedName = authData?.name || '';
      setIsLoggedIn(true);
      setUserName(savedName);
    }
  }, [currentPath, checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        hasPermission,
        userName,
        currentUserInfo,
        isLoginModalOpen,
        checkAuth,
        logout,
        openLoginModal,
        closeLoginModal,
        handleLoginSuccess,
      }}
    >
      {children}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
