import React, { useState } from 'react';
import { getCanonicalMedia, mediaLogos } from '../../../utils/mediaUtils';
import { normalizeCreativeMetrics } from './common/creativeMetrics';
import { creativeImageCandidates } from '../../../utils/hfCreativeImages';

function CreativeCard({ data, onImageResolved }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const metrics = normalizeCreativeMetrics(data);


  const canonicalMedia = getCanonicalMedia(data.media);

  // 설정 가능한 대체 이미지
  const DEFAULT_FALLBACK_IMAGE = import.meta.env.VITE_DEFAULT_FALLBACK_IMAGE || 'https://upload.wikimedia.org/wikipedia/commons/7/7b/%ED%95%9C%EC%83%98_%EB%A1%9C%EA%B3%A0.jpg';

  const candidates = creativeImageCandidates(data);
  const candidateKey = JSON.stringify(candidates);
  const [imageAttempt, setImageAttempt] = useState({ key: candidateKey, index: 0 });
  const attemptIndex = imageAttempt.key === candidateKey ? imageAttempt.index : 0;
  const imgSrc = candidates[attemptIndex] || DEFAULT_FALLBACK_IMAGE;
  const [failedFallback, setFailedFallback] = useState(null);
  const handleImgError = () => {
    if (attemptIndex < candidates.length) setImageAttempt({ key: candidateKey, index: attemptIndex + 1 });
    else setFailedFallback(candidateKey);
  };
  React.useEffect(() => {
    if (onImageResolved) onImageResolved(imgSrc);
  }, [imgSrc, onImageResolved]);

  const toggleFlip = (e) => {
    if (e) e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  // 안전한 수치 변환 함수
  const formatDecimal = (val) => val === null || val === undefined ? '—' : Number(val).toFixed(2);
  const formatInt = (val) => {
    if (val === undefined || val === null) return '—';
    return Math.round(val).toLocaleString('ko-KR');
  };

  return (
    <div className={`chart-card flip-container ${isFlipped ? 'flipped' : ''}`}>
      <div className="flip-card-inner">
        {/* 앞면 */}
        <div className="flip-card-front">
          <div className="chart-image-wrapper">
            {failedFallback === candidateKey ? <span>소재 이미지를 불러올 수 없습니다</span> : <img
              src={imgSrc}
              alt={data.title}
              className="creative-img"
              onError={handleImgError}
            />}
          </div>
          <div className="chart-content">
            {data.media && (
              <div className="card-title-area">
                <div className="media-ci-wrapper">
                  <img src={mediaLogos[canonicalMedia] || mediaLogos['기타']} alt={data.media} className="media-ci-img" title={data.media} />
                </div>
              </div>
            )}
            <h3 className="creative-title" title={data.creative_type || data.creative_name || data.title || data.media}>
              {data.creative_type || data.creative_name || data.title || data.media || '소재 정보 없음'}
            </h3>
            <div className="metrics-summary">
              <div className="metric-item">
                <span className="label">광고비</span>
                <span className="value">{formatInt(metrics.total_cost)} 원</span>
              </div>
              <div className="metric-item">
                <span className="label">유입 전환율</span>
                <span className="value">{formatDecimal(metrics.inflow_cvr)} %</span>
              </div>
              <div className="metric-item">
                <span className="label">주문 건수</span>
                <span className="value">{formatInt(metrics.total_orders)} 건</span>
              </div>
              <div className="metric-item">
                <span className="label">구매 CVR</span>
                <span className="value highlighting">{formatDecimal(metrics.purchase_cvr)} %</span>
              </div>
              <div className="metric-item">
                <span className="label">ROAS</span>
                <span className="value highlighting">{formatInt(metrics.roas)} %</span>
              </div>
            </div>
          </div>
          <div className="chart-footer" onClick={toggleFlip}>
            상세 성과 지표 확인
          </div>
        </div>

        {/* 뒷면 */}
        <div className="flip-card-back">
          <div className="back-header">
            <h4>상세 데이터</h4>
            <button className="close-btn" onClick={toggleFlip}>×</button>
          </div>
          <div className="back-content">
            <div className="detail-row">
              <span>소재명</span>
              <strong>{data.creative_type}</strong>
            </div>
            <div className="detail-row">
              <span>노출수</span>
              <strong>{formatInt(metrics.impressions)}</strong>
            </div>
            <div className="detail-row">
              <span>클릭수</span>
              <strong>{formatInt(metrics.clicks)}</strong>
            </div>
            <div className="detail-row">
              <span>클릭률(CTR)</span>
              <strong>{formatDecimal(metrics.ctr)} %</strong>
            </div>
            <div className="detail-row">
              <span>CPC</span>
              <strong>{formatInt(metrics.cpc)} 원</strong>
            </div>
            <div className="detail-row">
              <span>광고비</span>
              <strong>{formatInt(metrics.total_cost)} 원</strong>
            </div>
            <div className="detail-row">
              <span>유입 전환율</span>
              <strong>{formatDecimal(metrics.inflow_cvr)} %</strong>
            </div>
            <div className="detail-row">
              <span>주문 건수</span>
              <strong>{formatInt(metrics.total_orders)} 건</strong>
            </div>
            <div className="detail-row">
              <span>주문 금액</span>
              <strong>{formatInt(metrics.total_revenue)} 원</strong>
            </div>
            <div className="detail-row">
              <span>구매 CVR</span>
              <strong>{formatDecimal(metrics.purchase_cvr)} %</strong>
            </div>
            <div className="detail-divider"></div>
            <div className="detail-row highlight">
              <span>ROAS</span>
              <strong>{formatInt(metrics.roas)} %</strong>
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

export default CreativeCard;
