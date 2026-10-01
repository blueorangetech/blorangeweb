import React from 'react';

export default function TrendAiSidebar({ aiComments, activeSubTab }) {
  return (
    <div className="ai-commentary-card">
      <div className="ai-commentary-header">
        <span className="material-symbols-outlined icon">smart_toy</span>
        <h3>{activeSubTab === 'integrated' ? 'AI 성과 코멘트' : 'AI 매체 코멘트'}</h3>
      </div>
      
      <div className="ai-comment-section">
        <div className="ai-comment-section-title">최근 성과 변화와 효율 진단</div>
        <div className="ai-comment-content">{aiComments.daily}</div>
      </div>

      <div className="ai-comment-section">
        <div className="ai-comment-section-title">
          {activeSubTab === 'integrated' ? '매체별 기여도와 효율' : '선택 매체의 누적 성과'}
        </div>
        <div className="ai-comment-content">{aiComments.weekly}</div>
      </div>

      <div className="ai-comment-section">
        <div className="ai-comment-section-title">운영 우선순위와 검증 제안</div>
        <div className="ai-comment-content">{aiComments.monthly}</div>
      </div>
    </div>
  );
}
