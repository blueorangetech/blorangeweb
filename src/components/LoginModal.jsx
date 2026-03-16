import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
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

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const loginIdentifier = view === 'login' ?
            (location.pathname.split('/').filter(Boolean)[0] || 'hanssem') :
            userId;

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

        if (view === 'signup' && password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            setIsLoading(false);
            return;
        }

        try {
            const endpoint = view === 'login' ? `/auth/login` : `/auth/register`;
            const payload = view === 'login' ? {
                user_id: userId,
                password: password
            } : {
                user_id: userId,
                name: name,
                password: password
            };

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                if (view === 'login') {
                    Cookies.set('Authorization', result.token, { expires: 7 });
                    if (result.name) {
                        Cookies.set('UserName', result.name, { expires: 7 });
                    }
                    alert('반갑습니다! 성공적으로 로그인되었습니다.');
                    onLoginSuccess(result);
                } else {
                    alert('회원가입이 완료되었습니다! 로그인해주세요.');
                    setView('login');
                    setName('');
                    setUserId('');
                    setPassword('');
                    setConfirmPassword('');
                }
            } else {
                setError(result.message || (view === 'login' ? '로그인에 실패했습니다.' : '회원가입에 실패했습니다.'));
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
            <div className="login-modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="login-modal-close" onClick={onClose} aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="login-header">
                    <span
                        display="flex"
                        justifycontent="center"
                        alignitems="center"
                        width="100%"
                        height="100%"
                        className="Box__StyledBox-ds-styled-components__sc-71ddd825-0 flFJtn"
                        onClick={() => window.location.href = '/'}
                        style={{ cursor: 'pointer', marginBottom: '16px', display: 'block' }}
                    >
                        <svg viewBox="0 0 356 34" fill="none" xmlns="http://www.w3.org/2000/svg" data-w="356" data-h="34" width="231" height="22">
                            <g clipPath="url(#clip0_1989_46689)">
                                <path d="M322.95 1.20651L316.65 7.50684L331.329 22.1864L337.63 15.886L322.95 1.20651Z" fill="black"></path>
                                <path d="M261.43 11.7197H241.64V20.5597H261.43V11.7197Z" fill="black"></path>
                                <path d="M355.28 1.21973H345.99V32.5897H355.28V1.21973Z" fill="black"></path>
                                <path d="M315.64 1.21973H306.35V32.5897H315.64V1.21973Z" fill="black"></path>
                                <path d="M276 1.21973H266.71V32.5897H276V1.21973Z" fill="black"></path>
                                <path d="M236.35 1.21973H227.06V32.5897H236.35V1.21973Z" fill="black"></path>
                                <path d="M295.82 1.21973H286.53V32.5897H295.82V1.21973Z" fill="black"></path>
                                <path d="M8.75 1.21973H0V32.5897H8.75V1.21973Z" fill="black"></path>
                                <path d="M113.83 10.2898C113.71 8.37977 112.09 7.14977 110.01 7.14977C108.12 7.14977 106.28 7.88977 106.28 9.74977C106.26 12.1898 109.09 12.8998 110.4 13.2898C116.41 15.0798 123.01 16.5098 123.01 23.7198C123.01 30.3798 117.39 33.7998 110.49 33.7998C103.59 33.7998 96.97 30.0498 97.22 22.6798H105.42C105.59 24.9298 107.69 26.8098 110.36 26.8098C112.33 26.8098 114.38 25.9198 114.38 23.9598C114.38 20.7198 107.93 20.8598 103.44 18.4898C99.76 16.5498 97.93 13.3898 97.97 9.71977C97.97 3.62977 103.65 0.00976562 110.12 0.00976562C117.01 0.00976562 122.19 3.92977 122.14 10.2998H113.81L113.83 10.2898Z" fill="black"></path>
                                <path d="M140.84 10.2898C140.72 8.37977 139.1 7.14977 137.02 7.14977C135.13 7.14977 133.29 7.88977 133.29 9.74977C133.27 12.1898 136.1 12.8998 137.41 13.2898C143.42 15.0798 150.02 16.5098 150.02 23.7198C150.02 30.3798 144.4 33.7998 137.5 33.7998C130.6 33.7998 123.98 30.0498 124.23 22.6798H132.43C132.6 24.9298 134.7 26.8098 137.37 26.8098C139.34 26.8098 141.39 25.9198 141.39 23.9598C141.39 20.7198 134.94 20.8598 130.45 18.4898C126.77 16.5498 124.94 13.3898 124.98 9.71977C124.98 3.62977 130.66 0.00976562 137.13 0.00976562C144.02 0.00976562 149.2 3.92977 149.15 10.2998H140.82L140.84 10.2898Z" fill="black"></path>
                                <path d="M160.72 26.0497V19.7197H172.69V13.4097H160.72V7.72973H176.17V1.21973H152.36V32.5797H176.57V26.0497H160.72Z" fill="black"></path>
                                <path d="M95.07 1.21973H86.77V17.6997H86.3L74.21 1.21973H66.37V32.5797H74.66V15.0497H75.08L87.61 32.5797H95.07V1.21973Z" fill="black"></path>
                                <path d="M12.62 20.1897H22.7V32.5797H31.3V1.21973H22.7V12.9197H12.62V20.1897Z" fill="black"></path>
                                <path d="M56.75 32.5797H65.1L53.99 1.21973H43.73L32.61 32.5897H40.82L43.15 25.3197H54.43L56.75 32.5797V32.5797ZM48.62 8.77973H48.99L52.25 18.6797H45.35L48.62 8.77973Z" fill="black"></path>
                                <path d="M216.53 1.21973H207.8V32.5897H216.53V1.21973Z" fill="black"></path>
                                <path d="M188.54 1.21973H179.44V32.5797H187.95V13.1097H188.26L197.29 21.8297L203.32 15.5997L188.54 1.21973Z" fill="black"></path>
                            </g>
                            <defs>
                                <clipPath id="clip0_1989_46689">
                                    <rect width="356" height="34" fill="white"></rect>
                                </clipPath>
                            </defs>
                        </svg>
                    </span>
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
