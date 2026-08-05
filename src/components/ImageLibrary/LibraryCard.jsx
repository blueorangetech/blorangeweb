import React from 'react';

/**
 * 개별 에셋 카드 컴포넌트
 */
function LibraryCard({ img, fitMode, onSelect, onCopyUrl, onDownload, onDelete }) {
  return (
    <div
      className="library-card"
      onClick={() => onSelect(img)}
    >
      <div className={`library-card-thumb fit-${fitMode}`}>
        <img src={img.url} alt={img.filename} loading="lazy" />

        <div className="library-card-overlay">
          <button
            className="overlay-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(img);
            }}
            title="확대 보기"
          >
            <span className="material-symbols-outlined">zoom_in</span>
          </button>
          <button
            className="overlay-action-btn"
            onClick={(e) => onCopyUrl(img.url, e)}
            title="URL 복사"
          >
            <span className="material-symbols-outlined">link</span>
          </button>
          <button
            className="overlay-action-btn"
            onClick={(e) => onDownload(img.url, img.filename, e)}
            title="다운로드"
          >
            <span className="material-symbols-outlined">download</span>
          </button>
          <button
            className="overlay-action-btn delete-btn"
            onClick={(e) => onDelete(img.filename, e)}
            title="삭제"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
      <div className="library-card-info">
        <span className="library-card-filename" title={img.filename}>
          {img.filename}
        </span>
        <div className="library-card-meta">
          <span>{img.formatted_size}</span>
          <span>{img.formatted_date?.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
}

export default LibraryCard;
