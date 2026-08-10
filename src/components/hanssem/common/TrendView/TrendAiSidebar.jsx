import React from 'react';

export default function TrendAiSidebar({ aiComments, activeSubTab }) {
  return (
    <div className="ai-commentary-card">
      <div className="ai-commentary-header">
        <span className="material-symbols-outlined icon">smart_toy</span>
        <h3>{activeSubTab === 'integrated' ? 'AI 성과 코멘트' : 'AI 매체 코멘트'}</h3>
      </div>
      
      <div className="ai-comment-section">
        <div className="ai-comment-section-title">전기 성과 대조</div>
        <div className="ai-comment-content">{aiComments.daily}</div>
      </div>

      <div className="ai-comment-section">
        <div className="ai-comment-section-title">
          {activeSubTab === 'integrated' ? '매체별 성과 기여' : '매체 성과 진단'}
        </div>
        <div className="ai-comment-content">{aiComments.weekly}</div>
      </div>

      <div className="ai-comment-section">
        <div className="ai-comment-section-title">성과 최적화 권장사항</div>
        <div className="ai-comment-content">{aiComments.monthly}</div>
      </div>
    </div>
  );
}
