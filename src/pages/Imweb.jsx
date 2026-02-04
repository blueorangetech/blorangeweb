import { useEffect, useRef, useState } from 'react'
import { Header, Footer } from '../components'
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

  const menuItems = [
    { id: 'integrated', label: '통합 대시보드' },
    { id: 'media', label: '매체 별' },
    { id: 'monthly', label: '월 별' },
    { id: 'weekly', label: '주차 별' },
    { id: 'daily', label: '일자 별' },
    { id: 'keyword', label: '키워드' },
    { id: 'realtime', label: '실시간' },
    { id: 'attribution', label: '매체 기여' },
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
          <div className="chat-wrapper">
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div key={index} className="chat-message">
                  <p>{message.text}</p>
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
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Imweb
