import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ImageDetailModal({ imageUrl, alt = '이미지 상세 보기', title, onClose }) {
  const [dimensions, setDimensions] = useState(null);
  useEffect(() => {
    if (!imageUrl) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return createPortal(
    <div className="image-detail-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="image-detail-modal" role="dialog" aria-modal="true" aria-label={title || alt}>
        <header className="image-detail-header">
          <div>
            <strong>{title || '이미지 자세히 보기'}</strong>
            <span>원본 비율{dimensions?.url === imageUrl ? ` · ${dimensions.width} × ${dimensions.height} px` : ''}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="상세 이미지 닫기">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        <div className="image-detail-canvas">
          <img src={imageUrl} alt={alt} onLoad={(event) => setDimensions({
            url: imageUrl, width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight,
          })} />
        </div>
      </section>
    </div>,
    document.body
  );
}
