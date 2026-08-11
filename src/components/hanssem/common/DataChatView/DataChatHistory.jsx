import React from 'react';
import { marked } from 'marked';
import logoImage from '../../../../assets/blueorange_logo.png';

export default function DataChatHistory({ chatHistory, isTyping, chatEndRef }) {
  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {chatHistory.map((chat, idx) => {
        const isUser = chat.type === 'user';
        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: isUser ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              gap: '12px',
              width: '100%'
            }}
          >
            {/* AI 전용 아이콘 */}
            {!isUser && (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                flexShrink: 0
              }}>
                <img src={logoImage} alt="BlueOrange Logo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              </div>
            )}

            {/* 대화 버블 */}
            <div
              style={{
                maxWidth: '75%',
                backgroundColor: isUser ? '#2563eb' : '#ffffff',
                color: isUser ? '#ffffff' : '#334155',
                borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                padding: '16px 20px',
                boxShadow: isUser ? '0 4px 12px rgba(37, 99, 235, 0.15)' : '0 4px 15px rgba(0, 0, 0, 0.03)',
                border: isUser ? 'none' : '1px solid #f1f5f9',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                whiteSpace: isUser ? 'pre-line' : 'normal',
                wordBreak: 'break-word',
                fontWeight: isUser ? 600 : 500
              }}
            >
              {isUser ? (
                chat.content
              ) : (
                /* AI 답변용 마크다운 파싱 (marked 적용) */
                <div 
                  className="chat-markdown"
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(chat.content)
                  }}
                />
              )}
            </div>
          </div>
        );
      })}

      {/* AI가 타이핑하는 척하는 로더 */}
      {isTyping && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e2e8f0',
            flexShrink: 0
          }}>
            <img src={logoImage} alt="BlueOrange Logo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          </div>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '4px 18px 18px 18px',
            padding: '16px 20px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
            border: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            minWidth: '80px'
          }}>
            <div className="loading-dot" />
            <div className="loading-dot" />
            <div className="loading-dot" />
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  );
}
