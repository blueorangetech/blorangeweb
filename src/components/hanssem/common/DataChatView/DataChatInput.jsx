import React from 'react';

export default function DataChatInput({
  inputVal,
  setInputVal,
  isTyping,
  serviceTitle,
  onSend,
  onKeyPress
}) {
  return (
    <div style={{
      padding: '16px 20px 24px',
      backgroundColor: '#f8fafc',
      position: 'sticky',
      bottom: 0,
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '30px',
        border: '1.5px solid #e2e8f0',
        padding: '6px 12px 6px 24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.2s ease',
        maxWidth: '720px',
        margin: '0 auto',
        position: 'relative'
      }} className="ai-pulse-input">
        <textarea
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder={`${serviceTitle} 데이터 질문을 입력하세요...`}
          rows={1}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '0.95rem',
            color: '#334155',
            maxHeight: '120px',
            minHeight: '24px',
            fontFamily: 'inherit',
            lineHeight: '24px',
            padding: '6px 0',
            fontWeight: 500
          }}
        />
        <button
          onClick={() => onSend()}
          disabled={!inputVal.trim() || isTyping}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: inputVal.trim() && !isTyping ? '#2563eb' : '#f1f5f9',
            color: inputVal.trim() && !isTyping ? '#ffffff' : '#94a3b8',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputVal.trim() && !isTyping ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            flexShrink: 0,
            marginLeft: '12px'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 600 }}>
            arrow_upward
          </span>
        </button>
      </div>
      <p style={{
        fontSize: '0.75rem',
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: '12px',
        fontWeight: 500
      }}>
        AI 답변은 실제 대시보드 연동 데이터를 기반으로 생성된 마케팅 분석 리포트입니다.
      </p>
    </div>
  );
}
