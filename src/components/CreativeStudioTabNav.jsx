import React from 'react';

const CREATIVE_TABS = [
  { id: 'product', label: 'AI 제품 연출' },
  { id: 'variation', label: 'AI 소재 생성' },
  // { id: 'psd', label: 'PSD 규격 편집' }, // 비활성화
];

function CreativeStudioTabNav({ activeTab, onChange }) {
  return (
    <div className="creative-studio-tab-nav" role="tablist" aria-label="AI 크리에이티브 기능">
      {CREATIVE_TABS.map((tab) => (
        <button key={tab.id} type="button" role="tab"
          aria-selected={activeTab === tab.id}
          className={activeTab === tab.id ? 'active' : ''}
          onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default CreativeStudioTabNav;
