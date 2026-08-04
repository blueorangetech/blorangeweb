import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { loginUser, registerUser } from '../utils/auth';
import logoImage from '../assets/blueorange_logo.png';
import '../styles/LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const location = useLocation();
  const [view, setView] = useState('login'); // 'login' or 'signup'
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (view === 'signup' && password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }

    try {
      if (view === 'login') {
        const res = await loginUser({ userId, password });
        if (res.success) {
          onLoginSuccess(res.data);
        } else {
          setError(res.message);
        }
      } else {
        const res = await registerUser({ userId, name, password });
        if (res.success) {
          showToast('회원가입이 완료되었습니다! 로그인해주세요.');
          setView('login');
          setName('');
          setUserId('');
          setPassword('');
          setConfirmPassword('');
        } else {
          setError(res.message);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };


  const toggleView = () => {
    setView(view === 'login' ? 'signup' : 'login');
    setError('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setUserId('');
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          fontWeight: '600',
          fontSize: '0.95rem',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
      <div className="login-modal-container" onClick={(e) => e.stopPropagation()}>

        <button className="login-modal-close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="login-header">
          <div
            onClick={() => window.location.href = '/'}
            style={{ cursor: 'pointer', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <img src={logoImage} alt="BlueOrange Communications Logo" className="login-logo" style={{ height: '44px', maxWidth: '250px', objectFit: 'contain' }} />
          </div>
          <h2>{view === 'login' ? '다시 오신 것을 환영합니다' : '계정 생성하기'}</h2>
          <p>{view === 'login' ? '서비스를 이용하기 위해 로그인해주세요.' : '블루오렌지 테크 서비스의 회원이 되어보세요.'}</p>
        </div>



        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error-message" style={{ color: '#ff4d4f', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>{error}</div>}

          {view === 'signup' && (
            <div className="input-group">
              <label htmlFor="name">이름 (또는 기업명)</label>
              <input
                id="name"
                type="text"
                placeholder="사용자 이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="userId">아이디 (ID)</label>
            <input
              id="userId"
              type="text"
              placeholder="아이디를 입력하세요"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {view === 'signup' && (
            <div className="input-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <span style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                  비밀번호가 일치하지 않습니다.
                </span>
              )}
            </div>
          )}

          {view === 'login' && (
            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>로그인 상태 유지</span>
              </label>
              <a href="#forgot" className="forgot-password">비밀번호 분실</a>
            </div>
          )}

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? (view === 'login' ? '로그인 중...' : '가입 중...') : (view === 'login' ? '로그인' : '회원가입')}
          </button>
        </form>

        <div className="login-footer">
          {view === 'login' ? (
            <>
              아직 계정이 없으신가요?
              <button className="signup-link-btn" onClick={toggleView}>회원가입</button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?
              <button className="signup-link-btn" onClick={toggleView}>로그인</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
