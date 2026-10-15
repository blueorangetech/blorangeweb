import React from 'react';
import { marked } from 'marked';
import logoImage from '../../../../assets/blueorange_logo.png';

function safeMarkdown(content) {
  const doc = new DOMParser().parseFromString(marked.parse(content), 'text/html');
  const allowed = new Set(['P', 'BR', 'STRONG', 'EM', 'UL', 'OL', 'LI', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'CODE', 'PRE', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'HR', 'DEL', 'A']);
  for (const node of Array.from(doc.body.querySelectorAll('*'))) {
    if (!allowed.has(node.tagName)) {
      node.replaceWith(doc.createTextNode(node.textContent || ''));
      continue;
    }
    const href = node.getAttribute('href') || '';
    for (const attr of Array.from(node.attributes)) node.removeAttribute(attr.name);
    if (node.tagName === 'A' && (href.startsWith('#sheet=') || /^https?:\/\//i.test(href))) {
      node.setAttribute('href', href);
      if (!href.startsWith('#')) { node.setAttribute('target', '_blank'); node.setAttribute('rel', 'noopener noreferrer'); }
    }
  }
  return doc.body.innerHTML;
}

export default function DataChatHistory({ chatHistory, isTyping, chatEndRef, onCellReference }) {
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
              className="data-chat-bubble"
              style={{
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
                <div>{chat.scope && <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: 6 }}>{chat.scope}</div>}{chat.content}</div>
              ) : (
                /* AI 답변용 마크다운 파싱 (marked 적용) */
                <div 
                  className="chat-markdown"
                  onClick={event => {
                    const link = event.target.closest('a');
                    const href = link?.getAttribute('href') || '';
                    if (href.startsWith('#sheet=')) { event.preventDefault(); onCellReference?.(href); }
                  }}
                  dangerouslySetInnerHTML={{
                    __html: safeMarkdown(chat.content)
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
