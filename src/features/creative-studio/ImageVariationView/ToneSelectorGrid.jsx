import React from 'react';

const TONE_PRESETS = [
  { id: 'benefit', icon: 'sell', label: '혜택/가격 강조형', desc: '할인·특가·사은품 중심' },
  { id: 'emotional', icon: 'auto_awesome', label: '감성/라이프스타일형', desc: '공간 분위기·감성 연출' },
  { id: 'social', icon: 'trending_up', label: '대중/트렌드 반응형', desc: 'SNS 인기·구매후기 강조' },
  { id: 'urgency', icon: 'timer', label: '긴급/마감 임박형', desc: '한정수량·타임세일 소구' },
];

function ToneSelectorGrid({ selectedTone, setSelectedTone }) {
  return (
    <div className="tone-grid-container">
      {TONE_PRESETS.map(t => (
        <button
          key={t.id}
          type="button"
          className={`tone-grid-card ${selectedTone === t.id ? 'active' : ''}`}
          onClick={() => setSelectedTone(t.id)}
        >
          <div className="tone-card-header">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{t.icon}</span>
            <span>{t.label}</span>
          </div>
          <span className="tone-card-desc">{t.desc}</span>
        </button>
      ))}
    </div>
  );
}

export default ToneSelectorGrid;
