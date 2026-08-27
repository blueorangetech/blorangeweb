import React from 'react';

function PsdVariationCard({ item, onEdit, onDownloadPng, onDownloadPsd }) {
  return (
    <div className="visual-hero-card psd-card">
      {/* 상단 타겟 매체 & 규격 뱃지 */}
      <div className="visual-card-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className={`variation-tag ${item.channelKey}`}>{item.channel}</span>
          <span className="format-badge-text">{item.format?.split('(')[0]?.trim()}</span>
        </div>
        <span className="badge-meta">{item.width}×{item.height}</span>
      </div>

      {/* 메인 비주얼 히어로 캔버스 (클릭 시 레이어 편집 팝업 열기) */}
      <div
        className={`hero-image-showcase ${item.aspectClass || 'ratio-1-1'}`}
        onClick={() => onEdit(item)}
        title="클릭하여 레이어 편집 및 미세조정 팝업 열기"
        style={{ cursor: 'pointer' }}
      >
        <img className="hero-blur-bg" src={item.previewUrl} alt="" />
        <img className="hero-main-img" src={item.previewUrl} alt={item.headline || item.format} />
        <div className="hero-hover-actions">
          <span className="material-symbols-outlined">tune</span>
          <span>레이어 편집 및 미세조정</span>
        </div>
        <span className="psd-card-rev-badge">r{item.revision ?? 0}</span>
      </div>

      {/* 규격 정보 */}
      <div className="visual-card-body">
        <h4 className="visual-card-headline" title={item.headline || item.filename}>
          {item.headline || item.filename}
        </h4>
        <p className="visual-card-subtext">
          {item.format} · {item.width}×{item.height} ({item.aspectRatio})
        </p>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="visual-card-footer psd-card-footer" style={{ gridTemplateColumns: '1.2fr 1fr 1fr' }}>
        <button
          type="button"
          className="btn-card-action edit-btn"
          onClick={() => onEdit(item)}
          title="레이어 위치 및 이미지 편집 팝업"
          style={{ background: '#4338ca', color: '#ffffff', borderColor: '#4338ca' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>tune</span>
          <span>편집</span>
        </button>
        <button
          type="button"
          className="btn-card-action download"
          onClick={() => onDownloadPng(item)}
          title="PNG 이미지 다운로드"
        >
          <span className="material-symbols-outlined">image</span>
          <span>PNG</span>
        </button>
        <button
          type="button"
          className="btn-card-action psd-btn"
          onClick={() => onDownloadPsd(item)}
          title="편집 가능한 PSD 파일 다운로드"
        >
          <span className="material-symbols-outlined">layers</span>
          <span>PSD</span>
        </button>
      </div>
    </div>
  );
}

export default PsdVariationCard;

