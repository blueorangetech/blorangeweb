import React, { useRef, useState } from 'react';
import StudioLoadingState from './StudioLoadingState';
import { aiApi } from '../../api';
import { downloadFileFromUrl } from '../../utils/downloadUtils';

const QUICK_SUGGESTIONS = [
  '어두운 우드 인테리어로 변경하세요',
  '따뜻한 베이지 패브릭 재질로 변경',
  '고급스러운 화이트 대리석 질감으로 변경',
  '매트한 다크 그레이 가죽 텍스처로 변경',
  '밝은 내추럴 오크 원목으로 변경',
  '모던한 블랙 메탈 및 유리 재질로 변경',
];

export default function RestyleView({ embedded, pageName, bucketName }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [prompt, setPrompt] = useState('어두운 우드 인테리어로 변경하세요');
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
    if (!file) return setError('리스타일을 적용할 원본 이미지를 업로드해 주세요.');
    if (!prompt.trim()) return setError('변환할 재질/스타일 프롬프트를 입력해 주세요.');
    setLoading(true);
    setError('');
    try {
      const response = await aiApi.restyleImage(file, {
        prompt: prompt.trim(),
        pageName,
        bucketName,
      });
      if (!response.image_url) {
        throw new Error('ComfyUI가 리스타일 결과 이미지를 반환하지 않았습니다.');
      }
      setResult({
        imageUrl: response.image_url,
        filename: response.filename,
      });
    } catch (err) {
      setError(err.message || '리스타일 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!result?.imageUrl || downloading) return;
    setDownloading(true);
    try {
      const filename = result.filename || `restyle_${file?.name || 'image.png'}`;
      await downloadFileFromUrl(result.imageUrl, filename);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`multiple-angle-layout restyle-layout${embedded ? ' embedded' : ''}`}>
      {/* 좌측 설정 패널 */}
      <section className="angle-upload-card glass-card">
        <div className="panel-header">
          <h3>리스타일</h3>
          <span className="api-badge">ComfyUI Qwen Edit</span>
        </div>

        <div className="panel-scroll-content">
          <p className="angle-description">
            물체와 공간의 구조/형태는 그대로 유지하고, 표면 재질(패브릭, 우드, 대리석 등) 및 색감을 자연스럽게 변환합니다.
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

          {/* 프롬프트 입력 영역 */}
          <div className="restyle-prompt-section">
            <div className="restyle-prompt-header">
              <label className="restyle-section-label">변환할 재질 / 색상 프롬프트</label>
            </div>

            <textarea
              className="restyle-prompt-textarea"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 어두운 우드 인테리어로 변경하세요 (팁: '호텔풍' 같은 추상적인 단어 대신 '어두운 우드', '베이지 가죽'처럼 구체적인 재질/색상을 입력하면 구조 변형 없이 재질만 깔끔하게 변경됩니다)"
            />

            {/* 안내 팁 박스 */}
            <div className="restyle-tip-card">
              <span className="material-symbols-outlined tip-icon">lightbulb</span>
              <p className="tip-text">
                <strong>프롬프트 작성 팁:</strong> &apos;호텔풍&apos;, &apos;럭셔리&apos; 같은 추상적인 표현은 가구 구조를 왜곡할 수 있습니다. <strong>&apos;어두운 우드&apos;, &apos;화이트 대리석&apos;, &apos;베이지 패브릭&apos;</strong>처럼 구체적인 재질/색상을 지정해 주세요.
              </p>
            </div>

            {/* 추천 키워드 칩 */}
            <div className="restyle-suggestion-wrap">
              <span className="suggestion-title">추천 재질 키워드</span>
              <div className="restyle-chips-grid">
                {QUICK_SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`restyle-chip ${prompt === item ? 'active' : ''}`}
                    onClick={() => setPrompt(item)}
                  >
                    <span className="material-symbols-outlined chip-icon">texture</span>
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="panel-footer">
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading || !file || !prompt.trim()}
          >
            {loading ? (
              <div className="btn-loading-content">
                <div className="spinner-white" />
                <span>재질 변환 중...</span>
              </div>
            ) : (
              <div className="btn-content">
                <span className="material-symbols-outlined">brush</span>
                <span>리스타일 실행</span>
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
              <button 
                type="button" 
                className="btn-download-result" 
                onClick={handleDownload}
                disabled={downloading}
              >
                <span className={`material-symbols-outlined ${downloading ? 'spinning' : ''}`}>
                  {downloading ? 'sync' : 'download'}
                </span>
                {downloading ? '다운로드 중...' : '다운로드'}
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

        <div className="angle-results-body restyle-result-body">
          {loading ? (
            <StudioLoadingState
              title="AI 재질 리스타일 작업 중"
              icon="brush"
              steps={[
                '가구 및 공간 형태 보존 영역 고정 중...',
                '재질 및 텍스처 프롬프트 분석 중...',
                'Qwen 2511 모델 표면 텍스처 합성 중...',
                '자연스러운 조명 및 색감 매칭 중...',
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
                      리스타일 적용 결과
                    </div>
                    <div className="rmbg-image-box">
                      <img src={result.imageUrl} alt="리스타일 결과" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="rmbg-single-view">
                  <div className="rmbg-image-box large">
                    <img src={result.imageUrl} alt="리스타일 결과" />
                  </div>
                  <div className="rmbg-result-meta-bar">
                    <span className="rmbg-meta-chip">
                      <span className="material-symbols-outlined">check_circle</span>
                      재질 리스타일 완료
                    </span>
                    <span className="rmbg-file-label">{result.filename}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="preview-placeholder">
              <span className="material-symbols-outlined placeholder-icon">brush</span>
              <h4>이미지를 업로드하고 프롬프트를 입력해 주세요</h4>
              <p>좌측에서 원본 이미지를 업로드하고 원하는 구체적인 재질/색상(예: 어두운 우드, 화이트 대리석 등)을 입력해 주세요.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
