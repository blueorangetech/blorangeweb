import React from 'react';

export default function AIReportSection({ aiComments }) {
  return (
    <div className="mediamix-dashboard-grid">
      <div className="ai-comment-card">
        <div className="ai-comment-header">
          <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>auto_awesome</span>
          <span>신규 미디어믹스 비교/점검 AI 분석 레포트</span>
        </div>
        <ul className="ai-comment-list">
          {aiComments.map((comment, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: comment }}></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
