import React from 'react';

function VariationHeroCard({ item, onZoom, onDownload, onSave }) {
  const hLen = item.headline ? item.headline.length : 0;
  const sLen = item.subText ? item.subText.length : 0;
  const maxH = item.maxHeadLen || 25;
  const maxS = item.maxSubLen || 45;
  const isCompliant = hLen <= maxH && sLen <= maxS;

  return (
    <div className="visual-hero-card">
      {/* 상단 타겟 매체 & 규격 뱃지 */}
      <div className="visual-card-top-bar">
        <span className={`variation-tag ${item.channelKey}`}>{item.channel}</span>
        <span className="format-badge-text">{item.format.split('(')[0]}</span>
      </div>

      {/* 메인 비주얼 히어로 캔버스 */}
      {item.hasError || !item.imageUrl ? (
        <div className="hero-image-error-box" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: '12px',
          color: '#e11d48',
          textAlign: 'center',
          minHeight: '200px',
          gap: '8px',
          margin: '10px 0'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#e11d48' }}>
            error_med
          </span>
          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
            AI 이미지 생성 에러
          </span>
          <span style={{ fontSize: '0.78rem', color: '#9f1239', maxWidth: '90%', wordBreak: 'break-all' }}>
            {item.errorMsg || '서버 통신 중 오류가 발생하여 이미지를 생성하지 못했습니다.'}
          </span>
        </div>
      ) : (
        <div
          className="hero-image-showcase"
          onClick={() => onZoom(item)}
          title="클릭하여 원본 고화질 확대 보기"
        >
          <img className="hero-blur-bg" src={item.imageUrl} alt="" />
          <img className="hero-main-img" src={item.imageUrl} alt={item.headline} />
          <div className="hero-hover-actions">
            <span className="material-symbols-outlined">zoom_in</span>
            <span>확대 미리보기</span>
          </div>
        </div>
      )}

      {/* 카피 및 CTA 안내 */}
      <div className="visual-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span className={`char-count-badge ${isCompliant ? 'valid' : 'invalid'}`}>
            헤드라인 {hLen}/{maxH}자 · 본문 {sLen}/{maxS}자 ({isCompliant ? '규격 준수' : '규격 초과'})
          </span>
        </div>

        <h4 className="visual-card-headline">{item.headline}</h4>
        <p className="visual-card-subtext">{item.subText}</p>
        <div className="visual-card-cta-row">
          <span className="visual-cta-pill">CTA: <strong>{item.ctaText}</strong></span>
        </div>
      </div>

      {/* 하단 관리 버튼 */}
      <div className="visual-card-footer">
        <button
          className="btn-card-action download"
          onClick={() => onDownload(item)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
          <span>다운로드</span>
        </button>
        <button
          className="btn-card-action save"
          onClick={() => onSave(item)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bookmark</span>
          <span>저장</span>
        </button>
      </div>
    </div>
  );
}

export default VariationHeroCard;
