import { useEffect, useRef, useState } from 'react'
import Cookies from 'js-cookie'
import { Header, Footer, LoginModal, UserManagement } from '../components'
import '../styles/ImWeb.css'

import { uploadFile } from '../utils/fileUpload'

function Imweb() {
  const tableauRef = useRef(null)
  const fileInputRef = useRef(null)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [selectedDashboard, setSelectedDashboard] = useState('integrated')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' })
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [hasPermission, setHasPermission] = useState(true)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [currentUserInfo, setCurrentUserInfo] = useState({ role: '', is_master: false })

  const checkAuth = async () => {
    // === 인증 기능 임시 보류 ===
    setIsLoggedIn(true);
    setHasPermission(true);
    if (!Cookies.get('UserName')) {
      Cookies.set('UserName', '게스트');
    }
    return;
    // ===========================

    const token = Cookies.get('Authorization')
    if (!token) {
      setIsLoggedIn(false)
      setHasPermission(false)
      return
    }

    setIsLoggedIn(true)
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

    try {
      const response = await fetch(`${API_BASE_URL}/auth/imweb?site_id=analytics`, {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      })

      if (response.ok) {
        setHasPermission(true)
        const data = await response.json();
        setCurrentUserInfo({
          role: data.role || '',
          is_master: data.is_master || data.role === 'master'
        });
      } else {
        setHasPermission(false)
      }
    } catch (err) {
      console.error('Auth check error:', err)
      setHasPermission(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  // 대시보드 URL 설정
  const dashboardUrls = {
    integrated: 'https://10ay.online.tableau.com/t/blorange/views/Imweb_DashBoard_17627580791990/sheet0',
    media: 'https://10ay.online.tableau.com/t/blorange/views/Imweb_DashBoard_17627580791990/sheet1',
    monthly: 'https://10ay.online.tableau.com/t/blorange/views/Imweb_DashBoard_17627580791990/sheet2',
    weekly: 'https://10ay.online.tableau.com/t/blorange/views/Imweb_DashBoard_17627580791990/sheet3/45886a0a-9614-4580-83c5-2427c62a9620/9c581b8d-18f9-4c71-b2bd-b3cf1c1ac40e',
    daily: 'https://10ay.online.tableau.com/t/blorange/views/Imweb_DashBoard_17627580791990/sheet4',
    keyword: 'https://10ay.online.tableau.com/t/blorange/views/Imweb_KeywordDashBoard/KeywordReport',
    realtime: 'https://10ay.online.tableau.com/t/blorange/views/IMWEB_RealTime/sheet6',
    attribution: 'https://lookerstudio.google.com/embed/reporting/9f6fa878-30bd-4cf0-ae1c-f5d297c192db/page/LsJlF',
  }

  useEffect(() => {
    // Tableau Embedding API v3가 로드될 때까지 대기
    const checkTableauLoaded = setInterval(() => {
      if (tableauRef.current && window.tableau) {
        clearInterval(checkTableauLoaded)
      }
    }, 100)

    return () => clearInterval(checkTableauLoaded)
  }, [])

  const handleSendMessage = () => {
    if (inputValue.trim() !== '') {
      setMessages([...messages, { text: inputValue, timestamp: new Date() }])
      setInputValue('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const handleFileUploadClick = () => {
    // 파일 input 초기화 (같은 파일 재선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      await uploadFile(file, setUploadStatus)
    }
  }

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      Cookies.remove('Authorization')
      Cookies.remove('UserName')
      setIsLoggedIn(false)
      setHasPermission(false)
    }
  }

  const menuItems = [
    { id: 'integrated', label: '통합 대시보드' },
    { id: 'media', label: '매체 별' },
    { id: 'monthly', label: '월 별' },
    { id: 'weekly', label: '주차 별' },
    { id: 'daily', label: '일자 별' },
    { id: 'keyword', label: '키워드' },
    { id: 'realtime', label: '실시간' },
    { id: 'attribution', label: '매체 기여' },
    ...(currentUserInfo.role === 'master' || currentUserInfo.role === 'admin'
      ? [{ id: 'management', label: '권한 관리' }]
      : []),
  ]

  return (
    <div className="app">
      <Header title="데이터 대시보드">
        <div className="upload-section">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".csv,.xlsx,.xls"
          />
          <button
            className="upload-btn"
            onClick={handleFileUploadClick}
            disabled={uploadStatus.type === 'loading'}
          >
            {uploadStatus.type === 'loading' ? (
              <>
                <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M12 2 A10 10 0 0 1 22 12" />
                </svg>
                업로드 중...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                내부 데이터 파일 업로드
              </>
            )}
          </button>

          <button
            className="header-auth-btn"
            style={{
              marginLeft: '12px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onClick={() => {
              if (isLoggedIn) {
                handleLogout();
              } else {
                setIsLoginModalOpen(true);
              }
            }}
          >
            {isLoggedIn ? (
              <>
                <span style={{ marginRight: '12px', color: '#111' }}>{Cookies.get('UserName')}님</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                로그아웃
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13 12H3" />
                </svg>
                로그인
              </>
            )}
          </button>

          {uploadStatus.message && (
            <div className={`upload-status ${uploadStatus.type}`}>
              {uploadStatus.type === 'success' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {uploadStatus.type === 'error' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
              <span>{uploadStatus.message}</span>
            </div>
          )}
        </div>
      </Header>

      <main className="main">
        {!isLoggedIn ? (
          <div className="access-denied-container" style={{
            padding: '100px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            width: '100%'
          }}>
            <div className="lock-icon" style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#f8f9fa',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#adb5bd',
              marginBottom: '8px'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div className="text-content">
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111', marginBottom: '12px' }}>로그인이 필요한 메뉴입니다</h2>
              <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
                임웹 데이터 대시보드 기능은 승인된 관계자만 이용 가능합니다.
              </p>
            </div>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              style={{
                background: '#0a6abf',
                color: '#fff',
                padding: '16px 40px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s',
                marginTop: '12px',
                boxShadow: '0 4px 12px rgba(10, 106, 191, 0.2)'
              }}
            >
              로그인하고 계속하기
            </button>
          </div>
        ) : !hasPermission ? (
          <div className="access-denied-container" style={{
            padding: '100px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            width: '100%'
          }}>
            <div className="lock-icon" style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#fff1f0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ff4d4f',
              marginBottom: '8px'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div className="text-content">
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111', marginBottom: '12px' }}>접근 권한이 없습니다</h2>
              <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
                죄송합니다. 현재 계정으로는 임웹 대시보드에 접근할 수 없습니다.<br />
                관리자에게 권한을 요청해주세요.
              </p>
            </div>
          </div>
        ) : (
          <div className="container">
            <div className="menu-wrapper">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`menu-item ${selectedDashboard === item.id ? 'active' : ''}`}
                  onClick={() => setSelectedDashboard(item.id)}
                >
                  {item.label}
                </div>
              ))}
            </div>
            <div className="dashboard-wrapper">
              {selectedDashboard === 'management' ? (
                <div style={{ padding: '40px 0', background: '#f8f9fa', borderRadius: '24px', width: '100%' }}>
                  <UserManagement customerUrl="imweb" currentUserInfo={currentUserInfo} />
                </div>
              ) : (
                <>
                  <tableau-viz
                    ref={tableauRef}
                    id="tableau-viz"
                    src={dashboardUrls[selectedDashboard]}
                    width="100%"
                    height="808"
                    hide-tabs
                    toolbar="bottom"
                  />
                </>
              )}
            </div>
            {selectedDashboard !== 'management' && (
              <div className="chat-wrapper">
                <div className="chat-messages">
                  {messages.map((message, index) => (
                    <div key={index} className="chat-message" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: '8px 0' }}>
                      <p style={{ margin: 0 }}>{message.text}</p>
                      <span className="chat-time">
                        {message.timestamp.toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="chat-input-container">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="메시지를 입력하세요..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button className="chat-send-btn" onClick={handleSendMessage}>
                    등록
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(result) => {
          setIsLoggedIn(true)
          if (result.name) Cookies.set('UserName', result.name, { expires: 7 });
          setCurrentUserInfo({
            role: result.role || '',
            is_master: result.is_master || result.role === 'master'
          });
          setIsLoginModalOpen(false)
          checkAuth() // 권한 체크를 위해 다시 실행
        }}
      />
    </div>
  )
}

export default Imweb
