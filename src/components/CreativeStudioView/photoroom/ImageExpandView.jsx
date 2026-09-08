import React, { useEffect, useState } from 'react';
import { aiApi } from '../../../api';
import { downloadFileFromUrl } from '../../../utils/downloadUtils';
import ImageUploadPreview from '../../common/ImageUploadPreview';
import StudioLoadingState from '../StudioLoadingState';

const SIZE_PRESETS = [
  ['1024x1024', '정사각형', '1:1'],
  ['1200x900', '가로형', '4:3'],
  ['1920x1080', '와이드', '16:9'],
  ['1080x1350', '세로형', '4:5'],
  ['1080x1920', '스토리', '9:16'],
];

export default function ImageExpandView({ embedded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [selectedSize, setSelectedSize] = useState('1920x1080');
  const [customWidth, setCustomWidth] = useState(1600);
  const [customHeight, setCustomHeight] = useState(1200);
  const [padding, setPadding] = useState(0.1);
  const [seed, setSeed] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => () => {
    if (result?.imageUrl?.startsWith('blob:')) URL.revokeObjectURL(result.imageUrl);
  }, [result]);

  const selectFile = (selected) => {
    if (!selected || !selected.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError('');
  };

  const outputSize = selectedSize === 'custom'
    ? `${customWidth}x${customHeight}`
    : selectedSize;

  const generate = async () => {
    if (!file) return setError('확장할 원본 이미지를 업로드해 주세요.');
    if (selectedSize === 'custom' && (!customWidth || !customHeight)) {
      return setError('출력 너비와 높이를 입력해 주세요.');
    }
    if (seed && Number(seed) <= 0) return setError('시드는 양의 정수로 입력해 주세요.');

    setLoading(true);
    setError('');
    try {
      const response = await aiApi.expandPhotoRoomImage(file, {
        outputSize,
        padding,
        seed: seed ? Number(seed) : undefined,
      });
      setResult({
        imageUrl: URL.createObjectURL(response),
        filename: `expanded_${outputSize}_${file.name.replace(/\.[^.]+$/, '')}.png`,
      });
    } catch (err) {
      setError(err.message || '이미지 확장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const download = async () => {
    if (!result?.imageUrl || downloading) return;
    setDownloading(true);
    try {
      await downloadFileFromUrl(result.imageUrl, result.filename || `expanded_${outputSize}.png`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`multiple-angle-layout image-expand-layout${embedded ? ' embedded' : ''}`}>
      <section className="angle-upload-card glass-card">
        <div className="panel-header">
          <h3>이미지 확장</h3>
          <span className="api-badge">PhotoRoom AI Expand</span>
        </div>

        <div className="panel-scroll-content">
          <p className="angle-description">
            원본 피사체와 배경을 유지하면서 선택한 캔버스 크기의 빈 영역을 AI로 자연스럽게 확장합니다.
          </p>

          <ImageUploadPreview
            file={file}
            previewUrl={preview}
            onFileSelect={selectFile}
            onInvalidFile={setError}
          />

          <div className="rmbg-option-section">
            <span className="rmbg-section-label">출력 크기</span>
            <div className="rmbg-mode-grid expand-size-grid">
              {SIZE_PRESETS.map(([size, label, ratio]) => (
                <button
                  type="button"
                  key={size}
                  className={`mode-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  <strong>{label}</strong>
                  <small>{ratio} · {size}</small>
                </button>
              ))}
              <button
                type="button"
                className={`mode-btn ${selectedSize === 'custom' ? 'active' : ''}`}
                onClick={() => setSelectedSize('custom')}
              >
                <strong>사용자 지정</strong>
                <small>직접 입력</small>
              </button>
            </div>
          </div>

          {selectedSize === 'custom' && (
            <div className="expand-custom-size">
              <label>너비<input type="number" min="1" step="1" value={customWidth} onChange={(e) => setCustomWidth(e.target.value)} /></label>
              <span>×</span>
              <label>높이<input type="number" min="1" step="1" value={customHeight} onChange={(e) => setCustomHeight(e.target.value)} /></label>
            </div>
          )}

          <div className="rmbg-option-section expand-padding-section">
            <div className="expand-padding-header">
              <span className="rmbg-section-label">확장 여백</span>
              <strong>{Math.round(padding * 100)}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.02"
              value={padding}
              onChange={(event) => setPadding(Number(event.target.value))}
            />
            <div className="expand-padding-labels">
              <span>원본 크게</span>
              <span>확장 영역 크게</span>
            </div>
            <p className="expand-help-text">
              여백을 높이면 원본이 작아지고 주변에 AI가 생성하는 확장 영역이 넓어집니다.
            </p>
          </div>

          <div className="rmbg-option-section">
            <label className="rmbg-section-label" htmlFor="expand-seed">시드 (선택)</label>
            <input
              id="expand-seed"
              className="expand-seed-input"
              type="number"
              min="1"
              step="1"
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
              placeholder="비워두면 매번 다른 결과 생성"
            />
            <p className="expand-help-text">같은 이미지와 시드를 사용하면 비슷한 확장 배경을 생성할 수 있습니다.</p>
          </div>
        </div>

        <div className="panel-footer">
          <button className="generate-btn" onClick={generate} disabled={loading || !file}>
            {loading ? (
              <div className="btn-loading-content"><div className="spinner-white" /><span>배경 확장 중...</span></div>
            ) : (
              <div className="btn-content"><span className="material-symbols-outlined">aspect_ratio</span><span>{outputSize}로 확장</span></div>
            )}
          </button>
        </div>
      </section>

      <section className="angle-results-card glass-card">
        <div className="panel-header">
          <h3>결과 미리보기</h3>
          {result && (
            <div className="rmbg-header-actions">
              <button type="button" className={`btn-compare-toggle ${compareMode ? 'active' : ''}`} onClick={() => setCompareMode(!compareMode)}>
                <span className="material-symbols-outlined">compare</span>{compareMode ? '단일 뷰로 보기' : '원본과 비교'}
              </button>
              <button type="button" className="btn-download-result" onClick={download} disabled={downloading}>
                <span className={`material-symbols-outlined ${downloading ? 'spinning' : ''}`}>{downloading ? 'sync' : 'download'}</span>
                {downloading ? '다운로드 중...' : '다운로드'}
              </button>
            </div>
          )}
        </div>

        <div className="angle-results-body rmbg-result-body">
          {loading ? (
            <StudioLoadingState
              title="PhotoRoom AI 이미지 확장 중"
              icon="aspect_ratio"
              steps={['원본 이미지와 배경 구조 분석 중...', '새 캔버스 영역 계산 중...', '빈 영역의 배경을 자연스럽게 생성 중...', '결과 이미지 저장 중...']}
            />
          ) : error ? (
            <div className="preview-error-container"><span className="material-symbols-outlined error-icon">warning</span><h4>처리 오류</h4><p>{error}</p></div>
          ) : result ? (
            <div className={`rmbg-canvas-container ${compareMode ? 'compare-split' : ''}`}>
              {compareMode ? (
                <>
                  <div className="rmbg-view-card"><div className="rmbg-view-badge">원본 이미지</div><div className="rmbg-image-box"><img src={preview} alt="원본 이미지" /></div></div>
                  <div className="rmbg-view-card"><div className="rmbg-view-badge result-badge">확장 결과 · {outputSize}</div><div className="rmbg-image-box"><img src={result.imageUrl} alt="이미지 확장 결과" /></div></div>
                </>
              ) : (
                <div className="rmbg-single-view">
                  <div className="rmbg-image-box large"><img src={result.imageUrl} alt="이미지 확장 결과" /></div>
                  <div className="rmbg-result-meta-bar"><span className="rmbg-meta-chip"><span className="material-symbols-outlined">check_circle</span>AI 확장 완료 · {outputSize}</span><span className="rmbg-file-label">{result.filename}</span></div>
                </div>
              )}
            </div>
          ) : preview ? (
            <div className="rmbg-canvas-container"><div className="rmbg-single-view"><div className="rmbg-image-box large"><img src={preview} alt="원본 이미지" /></div><div className="rmbg-result-meta-bar"><span className="rmbg-meta-chip"><span className="material-symbols-outlined">info</span>확장 대기 중 · {outputSize}</span></div></div></div>
          ) : (
            <div className="preview-placeholder"><span className="material-symbols-outlined placeholder-icon">aspect_ratio</span><h4>확장할 이미지를 업로드해 주세요</h4><p>출력 크기를 선택하면 PhotoRoom AI가 캔버스의 빈 영역을 자연스럽게 채웁니다.</p></div>
          )}
        </div>
      </section>
    </div>
  );
}
