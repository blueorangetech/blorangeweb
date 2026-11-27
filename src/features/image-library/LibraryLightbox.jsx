import React from 'react';

/**
 * 이미지 라이브러리 전체화면 모달 (Lightbox)
 */
function LibraryLightbox({ selectedImage, activeFolder, onClose, onCopyUrl, onDownload, onDelete }) {
  if (!selectedImage) return null;

  return (
    <div className="library-lightbox" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close-btn" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="lightbox-image-wrapper">
          <img src={selectedImage.url} alt={selectedImage.filename} />
        </div>

        <div className="lightbox-details">
          <div className="lightbox-details-header">
            <h3>{selectedImage.filename}</h3>
            <div className="lightbox-actions">
              <button
                className="library-btn secondary-btn"
                onClick={(e) => onCopyUrl(selectedImage.url, e)}
              >
                <span className="material-symbols-outlined">content_copy</span>
                URL 복사
              </button>
              <button
                className="library-btn primary-btn"
                onClick={(e) => onDownload(selectedImage.url, selectedImage.filename, e)}
              >
                <span className="material-symbols-outlined">download</span>
                다운로드
              </button>
              <button
                className="library-btn danger-btn"
                onClick={(e) => onDelete(selectedImage.filename, e)}
              >
                <span className="material-symbols-outlined">delete</span>
                삭제
              </button>
            </div>
          </div>

          <div className="lightbox-metadata">
            <div className="meta-item">
              <strong>GCS 저장 경로:</strong> <code>{selectedImage.blob_name || `${activeFolder}/${selectedImage.filename}`}</code>
            </div>

            <div className="meta-item">
              <strong>용량:</strong> {selectedImage.formatted_size}
            </div>
            <div className="meta-item">
              <strong>등록 일시:</strong> {selectedImage.formatted_date}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LibraryLightbox;
