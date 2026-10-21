import { useState } from 'react';

const number = value => (value == null ? '—' : Math.round(value).toLocaleString('ko-KR'));
const money = value => (value == null ? '—' : `${number(value)} 원`);
const percent = value => (value == null ? '—' : `${(value * 100).toFixed(2)} %`);

function MediaLogo({ media, size = 18 }) {
  const m = (media || '').toLowerCase();
  if (m.includes('naver') || m.includes('네이버')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ borderRadius: '4px', flexShrink: 0 }}>
        <rect width="24" height="24" rx="4" fill="#03C75A" />
        <path d="M13.8 6.5H18V17.5H13.8L10.2 11.8V17.5H6V6.5H10.2L13.8 12.2V6.5Z" fill="white" />
      </svg>
    );
  }
  if (m.includes('google') || m.includes('구글')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ borderRadius: '4px', flexShrink: 0 }}>
        <rect width="24" height="24" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
        <path fill="#4285F4" d="M19.6 12.25c0-.64-.06-1.25-.16-1.84H12v3.48h4.26c-.18.99-.75 1.83-1.6 2.4v2h2.59c1.51-1.39 2.35-3.44 2.35-6.04z" />
        <path fill="#34A853" d="M12 20c2.16 0 3.97-.72 5.3-1.94l-2.59-2c-.72.48-1.64.76-2.71.76-2.08 0-3.85-1.41-4.48-3.3H4.84v2.07C6.16 18.2 8.87 20 12 20z" />
        <path fill="#FBBC05" d="M7.52 13.52c-.16-.48-.25-.99-.25-1.52s.09-1.04.25-1.52V8.43H4.84A8.006 8.006 0 0 0 4 12c0 1.29.31 2.51.84 3.59l2.68-2.07z" />
        <path fill="#EA4335" d="M12 7.18c1.17 0 2.23.4 3.06 1.19l2.3-2.3C15.96 4.79 14.15 4 12 4 8.87 4 6.16 5.8 4.84 8.43l2.68 2.07c.63-1.89 2.4-3.32 4.48-3.32z" />
      </svg>
    );
  }
  if (m.includes('meta') || m.includes('메타')) {
    return (
      <img
        src="/brands/saramin/meta-logo.svg"
        alt="Meta"
        width={size}
        height={size}
        style={{ objectFit: 'contain', flexShrink: 0 }}
      />
    );
  }
  return null;
}

export default function CreativeCard({ data }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);

  const toggleFlip = e => {
    if (e) e.stopPropagation();
    setIsFlipped(prev => !prev);
  };

  const currentImg = imgError
    ? null
    : (data.img || data.fallbackImg);

  // 디바이스는 하나만 간결하게 표기 (Mobile 또는 PC)
  const primaryDevice = typeof data.device === 'string' && data.device.toLowerCase().includes('pc')
    ? 'PC'
    : 'Mobile';

  return (
    <div className={`chart-card flip-container ${isFlipped ? 'flipped' : ''}`}>
      <div className="flip-card-inner">
        {/* 앞면: hanssem_hf CreativeCard 와 동일한 구조 */}
        <div className="flip-card-front">
          <div className="chart-image-wrapper">
            {currentImg ? <img
              src={currentImg}
              alt={data.assetTitle || data.creative_type || data.title}
              className="creative-img"
              onError={() => setImgError(true)}
              loading="lazy"
            /> : <span>소재 이미지를 불러올 수 없습니다.</span>}
          </div>

          <div className="chart-content">
            {data.media && (
              <div className="card-title-area">
                <div className="media-ci-wrapper">
                  <MediaLogo media={data.media} size={20} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>
                  {data.media}
                </span>
              </div>
            )}

            <h3
              className="creative-title"
              title={data.assetTitle || data.creative_type || data.title || data.media}
            >
              {data.assetTitle || data.creative_type || data.title || data.media}
            </h3>

            <div className="metrics-summary">
              <div className="metric-item">
                <span className="label">광고비</span>
                <span className="value">{money(data.spend)}</span>
              </div>
              <div className="metric-item">
                <span className="label">노출수</span>
                <span className="value">{number(data.impressions)}</span>
              </div>
              <div className="metric-item">
                <span className="label">클릭수</span>
                <span className="value">{number(data.clicks)}</span>
              </div>
              <div className="metric-item">
                <span className="label">클릭률(CTR)</span>
                <span className="value">{percent(data.ctr)}</span>
              </div>
              <div className="metric-item">
                <span className="label">CPC</span>
                <span className="value">{money(data.cpc)}</span>
              </div>
              <div className="metric-item">
                <span className="label">전환 건수</span>
                <span className="value highlighting">{number(data.conversions)} 건</span>
              </div>
              <div className="metric-item">
                <span className="label">전환율(CVR)</span>
                <span className="value highlighting">{percent(data.cvr)}</span>
              </div>
              <div className="metric-item">
                <span className="label">획득단가(CPA)</span>
                <span className="value highlighting">{money(data.cpa)}</span>
              </div>
            </div>
          </div>

          <div className="chart-footer" onClick={toggleFlip}>
            상세 성과 지표 확인
          </div>
        </div>

        {/* 뒷면: 한국어 지표명 유지 + 디바이스 단일 표기 + 깔끔한 한 줄 정렬 */}
        <div className="flip-card-back">
          <div className="back-header">
            <h4>상세 데이터</h4>
            <button className="close-btn" onClick={toggleFlip} aria-label="닫기">
              ×
            </button>
          </div>

          <div className="back-content">
            <div className="detail-row">
              <span>소재명</span>
              <strong style={{ maxWidth: '65%', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={data.assetTitle || data.creative_type}>
                {data.assetTitle || data.creative_type}
              </strong>
            </div>
            <div className="detail-row">
              <span>디바이스</span>
              <strong>{primaryDevice}</strong>
            </div>
            <div className="detail-row">
              <span>노출수</span>
              <strong>{number(data.impressions)}</strong>
            </div>
            <div className="detail-row">
              <span>클릭수</span>
              <strong>{number(data.clicks)}</strong>
            </div>
            <div className="detail-row">
              <span>CTR</span>
              <strong>{percent(data.ctr)}</strong>
            </div>
            <div className="detail-row">
              <span>CPC</span>
              <strong>{money(data.cpc)}</strong>
            </div>
            <div className="detail-row">
              <span>광고비</span>
              <strong>{money(data.spend)}</strong>
            </div>
            <div className="detail-row">
              <span>전환수</span>
              <strong>{number(data.conversions)} 건</strong>
            </div>
            <div className="detail-row">
              <span>CVR</span>
              <strong>{percent(data.cvr)}</strong>
            </div>
            <div className="detail-divider" />
            <div className="detail-row highlight">
              <span>CPA</span>
              <strong>{money(data.cpa)}</strong>
            </div>
          </div>

          <div className="chart-footer" onClick={toggleFlip}>
            돌아가기
          </div>
        </div>
      </div>
    </div>
  );
}
