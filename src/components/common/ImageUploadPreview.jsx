import React, { useRef } from 'react';

export default function ImageUploadPreview({
  file,
  previewUrl,
  imageUrl = '',
  onFileSelect,
  onUrlChange,
  onInvalidFile,
  allowUrl = false,
  disabled = false,
  style,
}) {
  const inputRef = useRef(null);
  const activePreview = previewUrl || imageUrl;

  const selectFile = (selected) => {
    if (!selected || disabled) return;
    if (!selected.type.startsWith('image/')) {
      onInvalidFile?.('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    onFileSelect(selected);
  };

  return (
    <div className="image-upload-preview" style={style}>
      <div
        className={`dropzone ${activePreview ? 'has-file with-preview' : ''}${disabled ? ' is-disabled' : ''}`}
        onClick={() => !disabled && !activePreview && inputRef.current?.click()}
        onDragOver={(event) => {
          if (!disabled) event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (disabled) return;
          selectFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          disabled={disabled}
          hidden
          onChange={(event) => {
            selectFile(event.target.files[0]);
            event.target.value = '';
          }}
        />
        {activePreview ? (
          <div className="dropzone-image-preview">
            <div className="preview-img-wrapper">
              <img src={activePreview} alt="업로드 이미지 미리보기" />
            </div>
            <div className="preview-meta-row">
              <div className="preview-file-text">
                <span className="material-symbols-outlined icon-success">check_circle</span>
                <p className="file-name" title={file?.name || imageUrl}>
                  {file?.name || (imageUrl.length > 32 ? `${imageUrl.slice(0, 29)}...` : imageUrl)}
                </p>
                {file && <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>}
              </div>
              <button
                type="button"
                className="btn-change-image"
                onClick={(event) => {
                  event.stopPropagation();
                  if (!disabled) inputRef.current?.click();
                }}
                disabled={disabled}
              >
                <span className="material-symbols-outlined">sync</span>변경
              </button>
            </div>
          </div>
        ) : (
          <div className="dropzone-placeholder">
            <span className="material-symbols-outlined">add_photo_alternate</span>
            <p>이미지를 드래그하거나 클릭하여 업로드</p>
          </div>
        )}
      </div>
      {allowUrl && (
        <input
          type="url"
          className="image-upload-url-input"
          value={imageUrl}
          disabled={disabled}
          onChange={(event) => onUrlChange?.(event.target.value)}
          placeholder="또는 이미지 URL 입력 (https://...)"
        />
      )}
    </div>
  );
}
