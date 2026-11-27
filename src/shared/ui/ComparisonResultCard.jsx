import { useState } from 'react';
import ImageDetailModal from './ImageDetailModal';

export default function ComparisonResultCard({
  originalUrl,
  resultUrl,
  title = '생성 결과',
  meta,
  filename,
  resultClassName = '',
  resultStyle,
  onDownload,
  onDelete,
}) {
  const [position, setPosition] = useState(50);
  const [downloading, setDownloading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const updatePosition = (clientX, target) => {
    const bounds = target.getBoundingClientRect();
    setPosition(Math.min(100, Math.max(0, ((clientX - bounds.left) / bounds.width) * 100)));
  };

  const download = async () => {
    if (!onDownload || downloading) return;
    setDownloading(true);
    try { await onDownload(); } finally { setDownloading(false); }
  };

  return (
    <article className="comparison-result-card">
      <div
        className="comparison-stage"
        role="slider"
        tabIndex={0}
        aria-label={`${title} 원본과 결과 비교`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture?.(event.pointerId);
          updatePosition(event.clientX, event.currentTarget);
        }}
        onPointerMove={(event) => updatePosition(event.clientX, event.currentTarget)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            setPosition((value) => Math.max(0, value - 5));
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            setPosition((value) => Math.min(100, value + 5));
          }
        }}
      >
        <img className="comparison-image comparison-before" src={originalUrl} alt={`${title} 원본`} />
        <img
          className={`comparison-image comparison-after ${resultClassName}`}
          src={resultUrl}
          alt={`${title} 결과`}
          style={{ ...resultStyle, clipPath: `inset(0 0 0 ${position}%)` }}
        />
        <span className="comparison-label before-label">원본</span>
        <span className="comparison-label after-label">결과</span>
        <span className="comparison-divider" style={{ left: `${position}%` }} aria-hidden="true" />
      </div>
      <div className="comparison-card-body">
        <div className="comparison-card-copy">
          <strong>{title}</strong>
          {meta && <span>{meta}</span>}
          {filename && <small title={filename}>{filename}</small>}
        </div>
        <div className="comparison-card-actions">
          <button type="button" className="comparison-detail" onClick={() => setShowDetail(true)}>
            <span className="material-symbols-outlined">zoom_out_map</span>자세히
          </button>
          {onDownload && (
            <button type="button" className="comparison-download" onClick={download} disabled={downloading}>
              <span className={`material-symbols-outlined ${downloading ? 'spinning' : ''}`}>
                {downloading ? 'sync' : 'download'}
              </span>
              {downloading ? '저장 중' : '다운로드'}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="comparison-delete"
              onClick={onDelete}
              aria-label={`${title} 스택에서 삭제`}
            >
              <span className="material-symbols-outlined">delete</span>
              삭제
            </button>
          )}
        </div>
      </div>
      <ImageDetailModal imageUrl={showDetail ? resultUrl : ''} title={title} alt={`${title} 상세 이미지`} onClose={() => setShowDetail(false)} />
    </article>
  );
}
