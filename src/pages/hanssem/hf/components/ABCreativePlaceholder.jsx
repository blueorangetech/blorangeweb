import React from 'react';

export default function ABCreativePlaceholder({ variant }) {
  return (
    <div className={`ab-example-card ab-example-card-${variant.toLowerCase()}`} aria-label={`Creative ${variant} 선택 전 예시 카드`}>
      <div className="ab-example-visual">
        <span className="ab-example-badge">예시 카드</span>
        <div className="ab-example-product" aria-hidden="true"><span /><span /></div>
        <div className="ab-example-copy">{variant === 'A' ? '제품 중심 크리에이티브' : '메시지 중심 크리에이티브'}</div>
      </div>
      <div className="ab-example-content">
        <h3>Creative {variant}를 선택해 주세요</h3>
        <p>상단에서 소재를 선택하면 실제 이미지와 성과가 표시됩니다.</p>
        <div className="metrics-summary">
          {['광고비', '유입 전환율', '주문 건수', '구매 CVR', 'ROAS'].map(label => (
            <div className="metric-item" key={label}><span className="label">{label}</span><span className="value">—</span></div>
          ))}
        </div>
      </div>
      <div className="ab-example-footer">선택 전 미리보기 · 분석에는 사용되지 않습니다</div>
    </div>
  );
}
