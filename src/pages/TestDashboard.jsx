import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, LabelList
} from 'recharts';
import '../styles/TestDashboard.css'

const trendData = [
  { date: '5월 1일', value: 25 }, { date: '5월 2일', value: 24 }, { date: '5월 3일', value: 21 },
  { date: '5월 4일', value: 28 }, { date: '5월 5일', value: 24 }, { date: '5월 6일', value: 25 },
  { date: '5월 7일', value: 27 }, { date: '5월 8일', value: 22 }, { date: '5월 9일', value: 21 },
  { date: '5월 10일', value: 24 }, { date: '5월 11일', value: 22 }, { date: '5월 12일', value: 24 },
  { date: '5월 13일', value: 21 }, { date: '5월 14일', value: 17 }, { date: '5월 15일', value: 20 },
  { date: '5월 16일', value: 21 }, { date: '5월 17일', value: 23 }, { date: '5월 18일', value: 21 },
  { date: '5월 19일', value: 21 }, { date: '5월 20일', value: 24 }, { date: '5월 21일', value: 24 },
  { date: '5월 22일', value: 28 }, { date: '5월 23일', value: 16 }, { date: '5월 24일', value: 19 },
  { date: '5월 25일', value: 22 }, { date: '5월 26일', value: 18 }, { date: '5월 27일', value: 26 },
  { date: '5월 28일', value: 20 }, { date: '5월 29일', value: 19 },
];

const mediaData = [
  { name: 'Tiktok', value: 128, color: '#0B0C5B' },
  { name: 'ASA', value: 5, color: '#2C3A8A' },
  { name: '몰로코', value: 99, color: '#4E68B8' },
  { name: '네이버BSA', value: 25, color: '#7096E6' },
  { name: '구글AC', value: 365, color: '#92C4FF' },
];

const cpaData = [
  { name: '구글AC', value: 410959, color: '#92C4FF' },
  { name: '네이버BSA', value: 40000, color: '#E0E0E0' },
  { name: '네이버SA', value: 200000, color: '#D0D0D0' },
  { name: '당근', value: 166667, color: '#B4E2FF' },
  { name: '메타', value: 312500, color: '#7096E6' },
  { name: '몰로코', value: 202020, color: '#4E68B8' },
  { name: 'ASA', value: 6000000, color: '#2C3A8A' },
  { name: 'Tiktok', value: 937500, color: '#0B0C5B' },
].reverse();

const tableData = [
  { media: '구글AC', cost: '150,000,000', downloads: '7,373', signups: '1,750', tests: '365', testCpa: '410,959', ratio: '54.40%' },
  { media: '네이버BSA', cost: '1,000,000', downloads: '500', signups: '119', tests: '25', testCpa: '40,000', ratio: '3.73%' },
  { media: '네이버SA', cost: '1,000,000', downloads: '100', signups: '24', tests: '5', testCpa: '200,000', ratio: '0.75%' },
  { media: '당근', cost: '2,000,000', downloads: '246', signups: '58', tests: '12', testCpa: '166,667', ratio: '1.79%' },
  { media: '메타', cost: '10,000,000', downloads: '655', signups: '155', tests: '32', testCpa: '312,500', ratio: '4.77%' },
  { media: '몰로코', cost: '20,000,000', downloads: '2,007', signups: '476', tests: '99', testCpa: '202,020', ratio: '14.75%' },
  { media: 'ASA', cost: '30,000,000', downloads: '100', signups: '24', tests: '5', testCpa: '6,000,000', ratio: '0.75%' },
  { media: 'Tiktok', cost: '120,000,000', downloads: '2,581', signups: '613', tests: '128', testCpa: '937,500', ratio: '19.08%' },
];

function TestDashboard() {
  const [messages, setMessages] = useState([
    { text: '최근 일주일 동안 시험신청 전환율이 가장 높은 광고 매체는 어디인가요?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), isUser: true },
    { text: '최근 일주일 기준, 메타(페이스북/인스타그램) 광고의 시험신청 전환율이 2.8%로 가장 높습니다. 특히 30-40대 타겟에서 강세를 보이고 있습니다.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9), isUser: false },
    { text: '그렇군요. 그럼 메타 광고 예산을 얼마나 늘리면 좋을까요?', timestamp: new Date(Date.now() - 1000 * 60 * 30), isUser: true },
    { text: '현재 메타 광고의 시험신청 CPA가 목표치보다 10% 낮게 유지되고 있으므로, 예산을 15~20% 증액하여 리드를 추가 확보하는 전략을 권장합니다.', timestamp: new Date(Date.now() - 1000 * 60 * 29), isUser: false },
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
            <div className="custom-dashboard-container">
              {/* Header */}
              <div className="custom-dashboard-header">
                <div className="custom-dashboard-title">
                  <div className="logo-placeholder">
                    <img src="https://www.brandb.net/_next/image?url=https%3A%2F%2Fapi.brandb.net%2Fapi%2Fv2%2Fcommon%2Fimage%3FfileId%3D17206&w=1080&q=75" alt="wonder logo" />
                  </div>
                  <h2>롯데손해보험 - 원더</h2>
                </div>
                <div className="custom-dashboard-controls">
                  <div className="control-group">
                    <label>광고매체</label>
                    <select><option>(전체)</option></select>
                  </div>
                  <div className="control-group date-slider-mock">
                    <label>날짜</label>
                    <div className="slider-container">
                      <span>2026-05-01</span>
                      <div className="slider-track"><div className="slider-thumb left"></div><div className="slider-thumb right"></div></div>
                      <span>2026-05-30</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Scorecards */}
              <div className="custom-summary-cards">
                <div className="summary-card"><span>노출</span><strong>55,666,667</strong></div>
                <div className="summary-card"><span>클릭</span><strong>1,113,333</strong></div>
                <div className="summary-card"><span>CTR</span><strong>2.00%</strong></div>
                <div className="summary-card"><span>CPC</span><strong>300</strong></div>
                <div className="summary-card"><span>비용</span><strong>334,000,000</strong></div>
                <div className="summary-card"><span>다운로드</span><strong>13,562</strong></div>
                <div className="summary-card"><span>회원가입</span><strong>3,219</strong></div>
                <div className="summary-card"><span>시험신청</span><strong>671</strong></div>
                <div className="summary-card"><span>다운로드 CPI</span><strong>24,628</strong></div>
                <div className="summary-card"><span>회원가입 CPA</span><strong>103,759</strong></div>
                <div className="summary-card"><span>시험신청 CPA</span><strong>497,765</strong></div>
              </div>

              {/* Main Grid */}
              <div className="custom-dashboard-grid">
                <div className="custom-grid-left">
                  <div className="custom-chart-card trend-chart">
                    <h3 className="chart-title">일자 별 전환 추이</h3>
                    <div className="chart-container-inner">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                          <XAxis dataKey="date" hide={true} />
                          <RechartsTooltip />
                          <Line type="linear" dataKey="value" stroke="#0B0C5B" strokeWidth={3} dot={{ r: 4, fill: '#0B0C5B' }}>
                            <LabelList dataKey="value" position="top" offset={10} fontSize={12} fontWeight={600} fill="#333" />
                          </Line>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="custom-grid-bottom-split">
                    <div className="custom-chart-card pie-chart">
                      <h3 className="chart-title">매체별 전환 비중</h3>
                      <div className="chart-container-inner">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Pie data={mediaData} cx="50%" cy="50%" innerRadius="55%" outerRadius="100%" dataKey="value" paddingAngle={2}>
                              {mediaData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="custom-chart-card bar-chart">
                      <h3 className="chart-title">매체 CPA</h3>
                      <div className="chart-container-inner">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart layout="vertical" data={cpaData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#666'}} width={70} />
                            <RechartsTooltip />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {cpaData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="custom-grid-right custom-chart-card table-card">
                  <table className="custom-data-table">
                    <thead>
                      <tr>
                        <th>매체</th><th>비용</th><th>다운로드</th><th>회원가입</th><th>시험신청</th><th>시험신청 CPA</th><th>전환 비중</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{fontWeight: 600}}>{row.media}</td>
                          <td>{row.cost}</td>
                          <td>{row.downloads}</td>
                          <td>{row.signups}</td>
                          <td>{row.tests}</td>
                          <td>{row.testCpa}</td>
                          <td>{row.ratio}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="ai-summary">
              <div className="ai-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                </svg>
                <span>AI Data Summary</span>
              </div>
              <div className="ai-analysis-content">
                <p><strong>[ 전체 지표 분석 ]</strong><br/>
                현재 시험신청 전환율이 전반적으로 전월 대비 15% 상승하며 긍정적인 추세를 보이고 있습니다. CPA 또한 8% 감소하여 효율적인 예산 집행이 이루어지고 있습니다.</p>
                
                <p><strong>[ 매체별 퍼포먼스 ]</strong><br/>
                구글AC와 Tiktok 광고가 전체 전환의 73.5%를 견인하고 있습니다. 특히 구글AC 광고는 직장인 타겟팅 최적화 이후 앱 설치율이 3%p 상승했습니다.</p>
                
                <p><strong>[ 운영체제별 유입 ]</strong><br/>
                여전히 AOS 운영체제가 전체의 90% 이상 견인하고 있지만, IOS 운영체제가 전월 대비 30% 증가해 향후 IOS 운영체제를 고려한 광고 확장이 필요할 것으로 보입니다.</p>
                
                <p><strong>[ 핵심 키워드 인사이트 ]</strong><br/>
                '부업사이트', '부업추천', '고수익알바' 키워드의 검색량 및 클릭 비중이 급증했습니다. 해당 키워드 그룹에 대한 입찰가를 15~20% 상향 조정하여 공격적인 앱설치 확보 전략을 전개할 것을 강력히 권장합니다.</p>
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
