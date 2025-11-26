import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
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
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setUploadStatus({ type: 'loading', message: '파일 업로드 중...' })

      // 파일을 서버로 전송
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('http://localhost:8000/csv/upload/imweb', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          console.log('파일 업로드 성공:', result)
          setUploadStatus({
            type: 'success',
            message: result.message || `파일 업로드 완료: ${file.name}`
          })

          // 3초 후 상태 메시지 제거
          setTimeout(() => {
            setUploadStatus({ type: '', message: '' })
          }, 5000)
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('파일 업로드 실패:', response.statusText)
          setUploadStatus({
            type: 'error',
            message: errorData.detail || '파일 업로드에 실패했습니다.'
          })
        }
      } catch (error) {
        console.error('파일 업로드 오류:', error)
        setUploadStatus({
          type: 'error',
          message: '파일 업로드 중 오류가 발생했습니다.'
        })
      }
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>데이터 대시보드</h1>
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
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="menu-wrapper">
            <div
              className={`menu-item ${selectedDashboard === 'integrated' ? 'active' : ''}`}
              onClick={() => setSelectedDashboard('integrated')}
            >
              통합 대시보드
            </div>
            <div
              className={`menu-item ${selectedDashboard === 'media' ? 'active' : ''}`}
              onClick={() => setSelectedDashboard('media')}
            >
              매체 별
            </div>

            <div
              className={`menu-item ${selectedDashboard === 'monthly' ? 'active' : ''}`}
              onClick={() => setSelectedDashboard('monthly')}
            >
              월 별
            </div>

            <div
              className={`menu-item ${selectedDashboard === 'weekly' ? 'active' : ''}`}
              onClick={() => setSelectedDashboard('weekly')}
            >
              주차 별
            </div>

            <div
              className={`menu-item ${selectedDashboard === 'daily' ? 'active' : ''}`}
              onClick={() => setSelectedDashboard('daily')}
            >
              일자 별
            </div>

            <div
              className={`menu-item ${selectedDashboard === 'keyword' ? 'active' : ''}`}
              onClick={() => setSelectedDashboard('keyword')}
            >
              키워드
            </div>

            <div
              className={`menu-item ${selectedDashboard === 'realtime' ? 'active' : ''}`}
              onClick={() => setSelectedDashboard('realtime')}
            >
              실시간
            </div>


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

      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 BlueOrange Communications. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
