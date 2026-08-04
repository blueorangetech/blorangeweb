import { useEffect, useRef, useState } from 'react'
import Cookies from 'js-cookie'
import { DashboardHeader, Footer, UserManagement, LoginRequiredCard } from '../components'
import { uploadFile } from '../utils/fileUpload'
import { useAuth } from '../context/AuthContext'
import '../styles/ImWeb.css'


function Imweb() {
  const {
    isLoggedIn,
    hasPermission,
    userName,
    currentUserInfo,
    checkAuth,
    logout,
    openLoginModal,
  } = useAuth();

  const tableauRef = useRef(null)
  const fileInputRef = useRef(null)
  const [selectedDashboard, setSelectedDashboard] = useState('integrated')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' })

  useEffect(() => {
    // Imweb은 checkPermission: false로 세팅하여 권한 검증 패스
    checkAuth('imweb', false);
  }, [checkAuth])

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
    <DashboardHeader
    title="데이터 대시보드"
    isLoggedIn={isLoggedIn}
    userName={userName}
    userRole={currentUserInfo.role}
    onLogout={logout}
    onLoginClick={openLoginModal}
    />


    {/* 수평 메뉴 + 업로드 버튼 */}
    <section className="imweb-filter-section">
    <div className="imweb-filter-container">
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

      {/* 내부 데이터 파일 업로드 - 우측 끝 */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".csv,.xlsx,.xls"
        />
        <button
        className="upload-btn-light"
        onClick={handleFileUploadClick}
        disabled={uploadStatus.type === 'loading'}
        >
        {uploadStatus.type === 'loading' ? (
          <>
          <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" opacity="0.25" />
            <path d="M12 2 A10 10 0 0 1 22 12" />
          </svg>
          업로드 중...
          </>
        ) : (
          <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          내부 데이터 파일 업로드
          </>
        )}
        </button>
        {uploadStatus.message && (
        <span className={`upload-status-inline ${uploadStatus.type}`}>
          {uploadStatus.message}
        </span>
        )}
      </div>
      </div>
    </div>
    </section>

    <main className="main">
      {selectedDashboard === 'management' ? (
        isLoggedIn && (currentUserInfo.role === 'master' || currentUserInfo.role === 'admin') ? (
          <div style={{ padding: '40px 0', background: '#f8f9fa', borderRadius: '24px', width: '100%' }}>
            <UserManagement customerUrl="imweb" currentUserInfo={currentUserInfo} />
          </div>
        ) : (
          <LoginRequiredCard
            serviceName="아임웹"
            customTitle="권한 관리는 로그인 후 가능합니다"
            customMessage="관리자 권한을 가진 계정으로 로그인해주세요."
          />

        )
      ) : (
        <div className="dashboard-wrapper">
          <tableau-viz
            ref={tableauRef}
            id="tableau-viz"
            src={dashboardUrls[selectedDashboard]}
            width="100%"
            height="808"
            hide-tabs
            toolbar="bottom"
          />
        </div>
      )}
    </main>


    <Footer />
  </div>
  )
}


export default Imweb
