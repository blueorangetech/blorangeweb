import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import DataChatWelcome from './DataChatWelcome';
import DataChatHistory from './DataChatHistory';
import DataChatInput from './DataChatInput';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function DataChatView({ datasetId }) {
  const isHf = datasetId === 'hanssem_hf';
  const serviceTitle = isHf ? '한샘 홈퍼니싱' : '한샘 리하우스';

  const [inputVal, setInputVal] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    // 사용자 메시지 추가
    setChatHistory((prev) => [...prev, { type: 'user', content: text }]);
    setInputVal('');
    setIsTyping(true);

    try {
      const token = Cookies.get('Authorization');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = token;
      }

      const response = await fetch(`${API_BASE_URL}/api/ai_chat`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          message: text,
          dataset_id: datasetId,
          dataset_name: serviceTitle,
        }),
      });

      if (!response.ok) {
        throw new Error('서버 응답 오류가 발생했습니다.');
      }

      const result = await response.json();
      setIsTyping(false);

      if (result.status === 'success' && result.response) {
        const rawAnswer = result.response;
        let typedContent = '';

        // 타이핑 애니메이션 효과 구현을 위한 빈 챗 추가
        setChatHistory((prev) => [...prev, { type: 'ai', content: '' }]);

        let charIndex = 0;
        const interval = setInterval(() => {
          if (charIndex < rawAnswer.length) {
            typedContent += rawAnswer[charIndex];
            setChatHistory((prev) => {
              const nextHistory = [...prev];
              nextHistory[nextHistory.length - 1] = { type: 'ai', content: typedContent };
              return nextHistory;
            });
            charIndex++;
          } else {
            clearInterval(interval);
          }
        }, 10);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { type: 'ai', content: result.message || '답변을 생성하는 중에 오류가 발생했습니다.' },
        ]);
      }
    } catch (error) {
      console.error('Data Chat API Error:', error);
      setIsTyping(false);
      setChatHistory((prev) => [
        ...prev,
        { type: 'ai', content: '서버와의 통신이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.' },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const templateQuestions = isHf
    ? [
        "홈퍼니싱 광고 성과의 주요 상승 요인이 무엇인가요?",
        "Meta 전환 캠페인의 효율 분석",
        "구글 디스플레이 타겟팅 성과 리포트",
        "유튜브 비디오 캠페인 직접 전환 성과 요약"
      ]
    : [
        "지난 달 성과가 가장 좋았던 매체는 어디인가요?",
        "카카오 캠페인 효율 개선 방안을 추천해줘",
        "이번 주 전환당 비용(CPA) 트렌드 분석",
        "광고비 대비 매출액(ROAS) 최적화 제안"
      ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 120px)',
      maxWidth: '1000px',
      margin: '0 auto',
      position: 'relative',
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: '#f8fafc'
    }}>
      {/* Dynamic Keyframes Animation Injection */}
      <style>{`
        @keyframes pulseBorder {
          0% { border-color: #cbd5e1; }
          50% { border-color: #3b82f6; }
          100% { border-color: #cbd5e1; }
        }
        @keyframes bounceDot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .ai-pulse-input {
          animation: pulseBorder 2.5s infinite ease-in-out;
        }
        .loading-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #3b82f6;
          margin: 0 3px;
        }
        .loading-dot:nth-child(1) { animation: bounceDot 0.8s infinite 0.1s; }
        .loading-dot:nth-child(2) { animation: bounceDot 0.8s infinite 0.2s; }
        .loading-dot:nth-child(3) { animation: bounceDot 0.8s infinite 0.3s; }
        
        .chat-markdown p { margin: 0 0 10px 0; line-height: 1.6; }
        .chat-markdown p:last-child { margin-bottom: 0; }
        .chat-markdown ul, .chat-markdown ol { margin: 0 0 10px 20px; padding: 0; }
        .chat-markdown li { margin-bottom: 5px; line-height: 1.5; }
        .chat-markdown strong { color: #1e3a8a; font-weight: 700; }
      `}</style>

      {chatHistory.length === 0 ? (
        <DataChatWelcome
          isHf={isHf}
          serviceTitle={serviceTitle}
          templateQuestions={templateQuestions}
          onSend={handleSend}
        />
      ) : (
        <DataChatHistory
          chatHistory={chatHistory}
          isTyping={isTyping}
          chatEndRef={chatEndRef}
        />
      )}

      <DataChatInput
        inputVal={inputVal}
        setInputVal={setInputVal}
        isTyping={isTyping}
        serviceTitle={serviceTitle}
        onSend={handleSend}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
}

export default DataChatView;
