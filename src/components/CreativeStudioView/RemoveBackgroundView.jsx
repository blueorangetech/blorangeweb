import React, { useRef, useState } from 'react';
import StudioLoadingState from './StudioLoadingState';
import { aiApi } from '../../api';

function isLightColor(hex) {
  const cleanHex = (hex || '').replace('#', '');
  if (cleanHex.length !== 6) return true;
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return (r * 0.299 + g * 0.587 + b * 0.114) > 186;
}

export default function RemoveBackgroundView({ embedded, pageName, bucketName }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [bgMode, setBgMode] = useState('Alpha'); // 'Alpha' | 'Color'
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [result, setResult] = useState(null); // { imageUrl, filename }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [compareMode, setCompareMode] = useState(false);

  const selectFile = (selected) => {
    if (!selected || !selected.type.startsWith('image/')) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError('');
  };

  const handleGenerate = async () => {
    if (!file) return setError('배경을 제거할 원본 이미지를 업로드해 주세요.');
    setLoading(true);
    setError('');
    try {
      const response = await aiApi.removeBackground(file, {
        backgroundMode: bgMode,
        backgroundColor: bgMode === 'Color' ? bgColor : '#FFFFFF',
        pageName,
        bucketName,
      });
      if (!response.image_url) {
        throw new Error('ComfyUI가 배경 제거 결과 이미지를 반환하지 않았습니다.');
      }
      setResult({
        imageUrl: response.image_url,
        filename: response.filename,
      });
    } catch (err) {
      setError(err.message || '배경 제거 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.imageUrl) return;
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = result.filename || `removed_bg_${file?.name || 'image.png'}`;
    link.target = '_blank';
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className={`multiple-angle-layout remove-bg-layout${embedded ? ' embedded' : ''}`}>
      {/* 좌측 설정 패널 */}
      <section className="angle-upload-card glass-card">
        <div className="panel-header">
          <h3>배경 제거</h3>
          <span className="api-badge">ComfyUI RMBG-2.0</span>
        </div>

        <div className="panel-scroll-content">
          <p className="angle-description">
            AI 모델이 피사체를 자동으로 정밀 분리합니다. 
            <br/>
            투명 배경(누끼)으로 제거하거나 원하는 단색 배경으로 변경할 수 있습니다.
          </p>

          {/* 이미지 업로드 박스 */}
          <div
            className={`dropzone ${file ? 'has-file with-preview' : ''}`}
            onClick={() => !file && inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              selectFile(e.dataTransfer.files[0]);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => selectFile(e.target.files[0])}
            />
            {file && preview ? (
              <div className="dropzone-image-preview">
                <div className="preview-img-wrapper">
                  <img src={preview} alt="업로드 이미지 미리보기" />
                </div>
                <div className="preview-meta-row">
                  <div className="preview-file-text">
                    <span className="material-symbols-outlined icon-success">check_circle</span>
                    <p className="file-name" title={file.name}>{file.name}</p>
                    <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button
                    type="button"
                    className="btn-change-image"
                    onClick={(e) => {
                      e.stopPropagation();
                      inputRef.current?.click();
                    }}
                  >
                    <span className="material-symbols-outlined">sync</span>
                    변경
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

          {/* 배경 스타일 옵션 선택 */}
          <div className="rmbg-option-section">
            <label className="rmbg-section-label">배경 처리 방식 선택</label>
            <div className="rmbg-mode-grid">
              <button
                type="button"
                className={`rmbg-mode-card ${bgMode === 'Alpha' ? 'selected' : ''}`}
                onClick={() => setBgMode('Alpha')}
              >
                <div className="rmbg-mode-icon alpha-checker">
                  <span className="material-symbols-outlined">layers_clear</span>
                </div>
                <div className="rmbg-mode-info">
                  <strong>투명 배경 (Alpha)</strong>
                  <span>배경을 투명하게 누끼 처리 (PNG)</span>
                </div>
                <span className="material-symbols-outlined radio-icon">
                  {bgMode === 'Alpha' ? 'radio_button_checked' : 'radio_button_unchecked'}
                </span>
              </button>

              <button
                type="button"
                className={`rmbg-mode-card ${bgMode === 'Color' ? 'selected' : ''}`}
                onClick={() => setBgMode('Color')}
              >
                <div className="rmbg-mode-icon" style={{ backgroundColor: bgColor }}>
                  <span className="material-symbols-outlined" style={{ color: isLightColor(bgColor) ? '#334155' : '#FFFFFF' }}>palette</span>
                </div>
                <div className="rmbg-mode-info">
                  <strong>단색 배경 (Color)</strong>
                  <span>팔레트 또는 컬러 코드로 배경 채우기</span>
                </div>
                <span className="material-symbols-outlined radio-icon">
                  {bgMode === 'Color' ? 'radio_button_checked' : 'radio_button_unchecked'}
                </span>
              </button>
            </div>

            {/* 단색 배경 선택 시 팔레트 선택 및 코드 입력 */}
            {bgMode === 'Color' && (
              <div className="rmbg-color-picker-box">
                <div className="rmbg-color-picker-header">
                  <span className="color-box-title">배경 색상 설정</span>
                  <span className="color-box-desc">팔레트를 누르거나 HEX 코드를 직접 입력하세요</span>
                </div>

                <div className="rmbg-color-control-card">
                  {/* 컬러 팔레트 스와치 버튼 */}
                  <label className="rmbg-swatch-label" title="클릭하여 팔레트 열기">
                    <span className="swatch-inner" style={{ backgroundColor: bgColor }} />
                    <span className="swatch-icon material-symbols-outlined" style={{ color: isLightColor(bgColor) ? '#334155' : '#FFFFFF' }}>
                      colorize
                    </span>
                    <input
                      type="color"
                      className="rmbg-hidden-color-input"
                      value={bgColor.startsWith('#') && bgColor.length === 7 ? bgColor : '#FFFFFF'}
                      onChange={(e) => setBgColor(e.target.value.toUpperCase())}
                    />
                  </label>

                  {/* HEX 코드 입력창 */}
                  <div className="rmbg-hex-input-group">
                    <span className="hex-hash">#</span>
                    <input
                      type="text"
                      className="rmbg-hex-field"
                      value={bgColor.replace(/^#/, '')}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                        setBgColor(`#${val.toUpperCase()}`);
                      }}
                      placeholder="FFFFFF"
                      maxLength={6}
                      spellCheck={false}
                    />
                  </div>

                  {/* 현재 컬러 프리뷰 태그 */}
                  <div className="rmbg-color-preview-tag" style={{ backgroundColor: bgColor }}>
                    <span style={{ color: isLightColor(bgColor) ? '#334155' : '#FFFFFF' }}>
                      {bgColor}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="panel-footer">
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading || !file}
          >
            {loading ? (
              <div className="btn-loading-content">
                <div className="spinner-white" />
                <span>배경 분리 중...</span>
              </div>
            ) : (
              <div className="btn-content">
                <span className="material-symbols-outlined">auto_fix_high</span>
                <span>배경 제거 실행</span>
              </div>
            )}
          </button>
        </div>
      </section>

      {/* 우측 결과 패널 */}
      <section className="angle-results-card glass-card">
        <div className="panel-header">
          <h3>결과 미리보기</h3>
          {result && (
            <div className="rmbg-header-actions">
              <button
                type="button"
                className={`btn-compare-toggle ${compareMode ? 'active' : ''}`}
                onClick={() => setCompareMode(!compareMode)}
              >
                <span className="material-symbols-outlined">compare</span>
                {compareMode ? '단일 뷰로 보기' : '원본과 비교'}
              </button>
              <button type="button" className="btn-download-result" onClick={handleDownload}>
                <span className="material-symbols-outlined">download</span>
                다운로드
              </button>
              <a
                href={result.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-open-result"
              >
                <span className="material-symbols-outlined">open_in_new</span>
                새 탭
              </a>
            </div>
          )}
        </div>

        <div className="angle-results-body rmbg-result-body">
          {loading ? (
            <StudioLoadingState
              title="AI 배경 제거 작업 중"
              icon="layers_clear"
              steps={[
                '피사체 경계선 및 세부 엣지 감지 중...',
                'RMBG-2.0 신경망 모델 누끼 추출 중...',
                '배경 투명도 및 알파 채널 처리 중...',
                '최종 클린업 및 이미지 변환 중...',
              ]}
            />
          ) : error ? (
            <div className="preview-error-container">
              <span className="material-symbols-outlined error-icon">warning</span>
              <h4>처리 오류</h4>
              <p>{error}</p>
            </div>
          ) : result ? (
            <div className={`rmbg-canvas-container ${compareMode ? 'compare-split' : ''}`}>
              {compareMode ? (
                <>
                  <div className="rmbg-view-card">
                    <div className="rmbg-view-badge">원본 이미지</div>
                    <div className="rmbg-image-box">
                      <img src={preview} alt="원본 이미지" />
                    </div>
                  </div>
                  <div className="rmbg-view-card">
                    <div className="rmbg-view-badge result-badge">
                      {bgMode === 'Alpha' ? '배경 제거 (투명)' : `단색 배경 (${bgColor})`}
                    </div>
                    <div className={`rmbg-image-box ${bgMode === 'Alpha' ? 'alpha-pattern' : ''}`} style={bgMode === 'Color' ? { backgroundColor: bgColor } : {}}>
                      <img src={result.imageUrl} alt="배경 제거 결과" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="rmbg-single-view">
                  <div className={`rmbg-image-box large ${bgMode === 'Alpha' ? 'alpha-pattern' : ''}`} style={bgMode === 'Color' ? { backgroundColor: bgColor } : {}}>
                    <img src={result.imageUrl} alt="배경 제거 결과" />
                  </div>
                  <div className="rmbg-result-meta-bar">
                    <span className="rmbg-meta-chip">
                      <span className="material-symbols-outlined">check_circle</span>
                      {bgMode === 'Alpha' ? '투명 배경(Alpha PNG)' : `단색 배경 (${bgColor})`}
                    </span>
                    <span className="rmbg-file-label">{result.filename}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="preview-placeholder">
              <span className="material-symbols-outlined placeholder-icon">layers_clear</span>
              <h4>이미지를 업로드하고 실행해 주세요</h4>
              <p>좌측에서 원본 이미지를 업로드하고 배경 옵션(투명 누끼 또는 단색 컬러)을 선택해 주세요.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
