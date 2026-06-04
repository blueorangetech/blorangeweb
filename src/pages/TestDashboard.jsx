import { useState } from 'react'
import '../styles/TestDashboard.css'

function TestDashboard() {
  const [messages, setMessages] = useState([
    { text: '최근 일주일 동안 전환율이 가장 높은 광고 매체는 어디인가요?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), isUser: true },
    { text: '최근 일주일 기준, 메타(페이스북/인스타그램) 광고의 전환율이 2.8%로 가장 높습니다. 특히 30-40대 타겟에서 강세를 보이고 있습니다.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9), isUser: false },
    { text: '그렇군요. 그럼 메타 광고 예산을 얼마나 늘리면 좋을까요?', timestamp: new Date(Date.now() - 1000 * 60 * 30), isUser: true },
    { text: '현재 메타 광고의 고객 획득 단가(CPA)가 목표치보다 10% 낮게 유지되고 있으므로, 예산을 15~20% 증액하여 리드를 추가 확보하는 전략을 권장합니다.', timestamp: new Date(Date.now() - 1000 * 60 * 29), isUser: false },
  ])
  const [inputValue, setInputValue] = useState('')
  const [selectedDashboard, setSelectedDashboard] = useState('integrated')

  const handleSendMessage = () => {
    if (inputValue.trim() !== '') {
      setMessages([...messages, { text: inputValue, timestamp: new Date(), isUser: true }])
      setInputValue('')
      
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { text: '해당 데이터에 대한 답변입니다.', timestamp: new Date(), isUser: false }])
      }, 1000)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const menuItems = [
    { id: 'integrated', label: '통합' },
    { id: 'media', label: '매체별' },
    { id: 'keyword', label: '키워드' },
  ]

  return (
    <div className="app test-dashboard-app">
      <main className="main">
        <div className="container">
          {/* Left Menu */}
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

          {/* Center Dashboard */}
          <div className="dashboard-wrapper test-dashboard-wrapper">
            <div className="empty-dashboard">
              <h2>{menuItems.find(m => m.id === selectedDashboard)?.label} 대시보드 (준비중)</h2>
              <p>여기에 대시보드 콘텐츠가 표시될 예정입니다.</p>
            </div>
            <div className="ai-summary">
              <div className="ai-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                </svg>
                <span>AI Data Summary</span>
              </div>
              <div className="ai-analysis-content">
                <p><strong>[전체 지표 분석]</strong><br/>
                현재 <b>보험 설계사 모집</b> 캠페인의 전반적인 전환율이 전월 대비 15% 상승하며 긍정적인 추세를 보이고 있습니다. 고객 획득 단가(CPA) 또한 8% 감소하여 효율적인 예산 집행이 이루어지고 있습니다.</p>
                
                <p><strong>[매체별 퍼포먼스]</strong><br/>
                네이버 검색광고와 메타(페이스북/인스타그램) 스폰서드 광고가 전체 전환의 75%를 견인하고 있습니다. 특히 메타 광고의 경우, 직장인 타겟팅 최적화 이후 노출 대비 클릭률(CTR)이 2.4% 포인트 상승했습니다.</p>
                
                <p><strong>[기기별 유입]</strong><br/>
                모바일 기기를 통한 유입이 전체의 82%를 차지하고 있으며, 모바일에서의 폼(Form) 제출 완료율이 데스크톱 대비 1.5배 높게 나타나고 있습니다.</p>
                
                <p><strong>[핵심 키워드 인사이트]</strong><br/>
                '고수익 알바', '워라밸 직업', '자유로운 근무' 키워드의 검색량 및 클릭 비중이 급증했습니다. 해당 키워드 그룹에 대한 입찰가를 15~20% 상향 조정하여 공격적인 리드(Lead) 확보 전략을 전개할 것을 강력히 권장합니다.</p>
              </div>
            </div>
          </div>

          {/* Right Chat */}
          <div className="chat-wrapper ai-chat-wrapper">
            <div className="chat-header">
              <span className="chat-title">데이터 어시스턴트</span>
            </div>
            <div className="chat-messages">
              <div className="chat-message ai">
                <div className="avatar ai-avatar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                  </svg>
                </div>
                <div className="message-content">
                  <p>안녕하세요! 무엇을 도와드릴까요? 분석 데이터에 대해 궁금한 점을 질문해 주세요.</p>
                </div>
              </div>
              
              {messages.map((message, index) => (
                <div key={index} className={`chat-message ${message.isUser ? 'user' : 'ai'}`}>
                  {!message.isUser && (
                    <div className="avatar ai-avatar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                      </svg>
                    </div>
                  )}
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="chat-time">
                      {message.timestamp.toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {message.isUser && (
                    <div className="avatar user-avatar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="데이터 어시스턴트에게 메시지 보내기..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  className={`chat-send-btn ${inputValue.trim() ? 'active' : ''}`} 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
              <div className="chat-footer-text">
                AI는 실수가 있을 수 있으므로 중요 정보를 확인하세요.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TestDashboard
