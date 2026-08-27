import React, { useRef, useState } from 'react';
import { aiApi } from '../../api';

const MAX_PSD_BYTES = 100 * 1024 * 1024;

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const getArtifactUrl = (url, bucketName, cacheKey = '') => {
  if (!url) return '';
  const absolute = /^https?:\/\//.test(url) ? url : `${API_BASE_URL}${url}`;
  const separator = absolute.includes('?') ? '&' : '?';
  const bucket = bucketName ? `&bucket_name=${encodeURIComponent(bucketName)}` : '';
  return `${absolute}${separator}_=${cacheKey || Date.now()}${bucket}`;
};

function PsdUploader({ document, onDocumentChange, pageName, bucketName }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.psd')) {
      setError('PSD 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > MAX_PSD_BYTES) {
      setError('PSD 파일은 최대 100MB까지 업로드할 수 있습니다.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const result = await aiApi.uploadPsd(file, { pageName, bucketName });
      onDocumentChange(result.data);
    } catch (err) {
      setError(err.message || 'PSD 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  if (document) {
    const editableCount = document.layers?.filter((layer) => layer.editable).length || 0;
    const previewSrc = getArtifactUrl(document.previewUrl || document.storagePreviewUrl, bucketName, document.revision);

    return (
      <div className="psd-uploaded-card">
        <div className="psd-uploaded-summary">
          <div className="psd-file-icon">
            <span className="material-symbols-outlined">layers</span>
          </div>
          <div className="psd-file-info">
            <strong title={document.filename}>{document.filename}</strong>
            <div className="psd-file-meta">
              <span className="badge-meta">{document.canvas?.width}×{document.canvas?.height}</span>
              <span>레이어 {document.layers?.length}개 (편집 {editableCount}개)</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-psd-replace"
            onClick={() => inputRef.current?.click()}
            title="다른 PSD 파일로 교체"
          >
            <span className="material-symbols-outlined">sync</span>
            교체
          </button>
        </div>

        {previewSrc && (
          <div className="psd-uploaded-preview">
            <img src={previewSrc} alt="PSD 마스터 템플릿 미리보기" />
            <span className="preview-resolution-tag">{document.canvas?.width}×{document.canvas?.height}</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".psd,image/vnd.adobe.photoshop"
          hidden
          onChange={(event) => upload(event.target.files?.[0])}
        />
        {error && <p className="psd-error-message">{error}</p>}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className="psd-upload-zone"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          upload(event.dataTransfer.files?.[0]);
        }}
      >
        <span className="material-symbols-outlined">layers</span>
        <strong>{uploading ? 'PSD 분석 및 미리보기 생성 중...' : '편집 가능한 PSD 템플릿 업로드'}</strong>
        <small>RGB 8-bit PSD · 최대 100MB</small>
      </button>
      <input ref={inputRef} type="file" accept=".psd,image/vnd.adobe.photoshop"
        hidden onChange={(event) => upload(event.target.files?.[0])} />
      {error && <p className="psd-error-message">{error}</p>}
    </>
  );
}

export default PsdUploader;
