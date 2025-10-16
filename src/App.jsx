import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const tableauRef = useRef(null)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [selectedDashboard, setSelectedDashboard] = useState('integrated')

  // 대시보드 URL 설정
  const dashboardUrls = {
    integrated: 'https://10ay.online.tableau.com/t/blorange/views/__/sheet13/ce225dc4-3d38-4a61-94e9-23eb0b7402b0/bd72b2ed-5d48-4d5d-9eb8-7b072d36ff19',
    realtime: 'https://10ay.online.tableau.com/t/blorange/views/__/__7'
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

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>데이터 대시보드</h1>
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
              className={`menu-item ${selectedDashboard === 'realtime' ? 'active' : ''}`}
              onClick={() => setSelectedDashboard('realtime')}
            >
              실시간 대시보드
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
