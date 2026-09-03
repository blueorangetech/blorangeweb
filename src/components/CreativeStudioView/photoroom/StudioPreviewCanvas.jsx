import React, { useState } from 'react';
import StudioLoadingState from '../StudioLoadingState';

/**
 * CreativeStudioView 우측 캔버스 미리보기 및 비교 컴포넌트 (PhotoRoom API v2)
 */
function StudioPreviewCanvas({
  isLoading,
  processStatus,
  errorMessage,
  resultImage,
  uncertaintyScore,
  currentInputImage,
  file,
  filePreview,
  imageUrl,
  SAMPLE_BEFORE_IMAGE,
  backgroundMode,
  backgroundColor,
  onClearError,
  onLoadSample,
  onGoToLibrary
}) {
  const [compareMode, setCompareMode] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!resultImage) return;
    setDownloading(true);
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = file ? `photoroom_${file.name}` : `photoroom_${Date.now()}.png`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(resultImage, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const isAlpha = backgroundMode === 'transparent';
  const displayFileName = file ? `photoroom_${file.name}` : (resultImage ? 'photoroom_result.png' : '');

  return (
    <section className="angle-results-card glass-card">
      <div className="panel-header">
        <h3>결과 미리보기</h3>
        {resultImage && (
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
              href={resultImage}
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
        {isLoading ? (
          <StudioLoadingState
            title="PhotoRoom AI 이미지 가공 중"
            icon="auto_fix_high"
            steps={[
              '피사체 3D 바닥면 및 외곽선 정밀 인식 중...',
              'PhotoRoom v2 AI 그림자 모델 렌더링 중...',
              '선택한 방향 및 입체 원근 음영 합성 중...',
              'GCS 스토리지 영구 보관 및 최적화 중...',
            ]}
          />
        ) : errorMessage ? (
          <div className="preview-error-container">
            <span className="material-symbols-outlined error-icon">warning</span>
            <h4>처리 오류</h4>
            <p>{errorMessage}</p>
            <button className="btn-error-clear" onClick={onClearError} style={{ marginTop: '10px' }}>
              확인
            </button>
          </div>
        ) : resultImage ? (
          <div className={`rmbg-canvas-container ${compareMode ? 'compare-split' : ''}`}>
            {compareMode ? (
              <>
                <div className="rmbg-view-card">
                  <div className="rmbg-view-badge">원본 이미지</div>
                  <div className="rmbg-image-box">
                    <img src={currentInputImage} alt="원본 이미지" />
                  </div>
                </div>
                <div className="rmbg-view-card">
                  <div className="rmbg-view-badge result-badge">
                    PhotoRoom AI 결과
                  </div>
                  <div
                    className={`rmbg-image-box ${isAlpha ? 'alpha-pattern' : ''}`}
                    style={backgroundMode === 'color' ? { backgroundColor: backgroundColor } : {}}
                  >
                    <img src={resultImage} alt="PhotoRoom 가공 결과" />
                  </div>
                </div>
              </>
            ) : (
              <div className="rmbg-single-view">
                <div
                  className={`rmbg-image-box large ${isAlpha ? 'alpha-pattern' : ''}`}
                  style={backgroundMode === 'color' ? { backgroundColor: backgroundColor } : {}}
                >
                  <img src={resultImage} alt="PhotoRoom 가공 결과" />
                </div>
                <div className="rmbg-result-meta-bar">
                  <span className="rmbg-meta-chip">
                    <span className="material-symbols-outlined">check_circle</span>
                    {isAlpha ? '투명 배경(Alpha PNG)' : `단색 배경 (${backgroundColor})`}
                  </span>
                  <span className="rmbg-file-label">{displayFileName}</span>
                </div>
              </div>
            )}
          </div>
        ) : (file || imageUrl) ? (
          <div className="rmbg-canvas-container">
            <div className="rmbg-single-view">
              <div className="rmbg-image-box large">
                <img src={currentInputImage} alt="원본 이미지" />
              </div>
              <div className="rmbg-result-meta-bar">
                <span className="rmbg-meta-chip" style={{ background: '#f1f5f9', color: '#475569' }}>
                  <span className="material-symbols-outlined">info</span>
                  원본 대기 중
                </span>
                <span className="rmbg-file-label">좌측 하단의 [실행] 버튼을 누르면 가공이 시작됩니다.</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="preview-placeholder">
            <span className="material-symbols-outlined placeholder-icon">layers_clear</span>
            <h4>이미지를 업로드하고 실행해 주세요</h4>
            <p>좌측에서 원본 이미지를 업로드하고 그림자 및 배경 옵션을 선택해 주세요.</p>
            <div className="placeholder-sample-btn-wrapper" style={{ marginTop: '14px' }}>
              <button className="btn-sample-load" onClick={onLoadSample}>
                샘플 가구 이미지 불러오기
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default StudioPreviewCanvas;
