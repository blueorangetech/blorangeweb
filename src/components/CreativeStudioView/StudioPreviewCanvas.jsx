import React from 'react';

/**
 * CreativeStudioView 우측 캔버스 미리보기 및 비교 컴포넌트
 */
function StudioPreviewCanvas({
  isLoading,
  processStatus,
  errorMessage,
  resultImage,
  uncertaintyScore,
  currentInputImage,
  filePreview,
  imageUrl,
  SAMPLE_BEFORE_IMAGE,
  onClearError,
  onLoadSample,
  onGoToLibrary
}) {
  return (
    <div className="preview-panel glass-card">
      <div className="panel-header">
        <h3>소재 미리보기</h3>
        {resultImage && (
          <div className="quality-score">
            <span className="score-dot" />
            <span>누끼 정밀도 점수: <strong>{(100 - (uncertaintyScore * 100)).toFixed(0)}%</strong> (최상)</span>
          </div>
        )}
      </div>

      <div className="preview-body">
        {isLoading ? (
          <div className="processing-overlay">
            <div className="lottie-loader">
              <div className="pulse-circle" />
              <div className="pulse-circle-outer" />
              <span className="material-symbols-outlined ai-processing-icon">temp_preferences_custom</span>
            </div>
            <h4>AI 크리에이티브 가공 중</h4>
            <p className="process-status-text">{processStatus}</p>
          </div>
        ) : errorMessage ? (
          <div className="preview-error-container">
            <span className="material-symbols-outlined error-icon">warning</span>
            <h4>AI 소재 제작 오류</h4>
            <p className="error-message-text">{errorMessage}</p>
            <button className="btn-error-clear" onClick={onClearError}>
              확인
            </button>
          </div>
        ) : resultImage ? (
          /* Side-by-Side 비교 뷰 */
          <div className="comparison-side-by-side">
            {/* 왼쪽: 원본 이미지 */}
            <div className="comparison-column">
              <div className="column-header">
                <span className="badge-before">Before (원본)</span>
              </div>
              <div className="column-image-container">
                <img src={currentInputImage} alt="Original Product" className="comparison-img" />
              </div>
            </div>

            {/* 오른쪽: AI 결과물 */}
            <div className="comparison-column">
              <div className="column-header">
                <span className="badge-after">After (AI 생성)</span>
              </div>
              <div className="column-image-container">
                <img src={resultImage} alt="AI Opt Product" className="comparison-img" />
              </div>
            </div>
          </div>
        ) : (filePreview || imageUrl) ? (
          /* 업로드/선택된 원본 이미지 단독 미리보기 */
          <div className="comparison-side-by-side" style={{ gridTemplateColumns: '1fr' }}>
            <div className="comparison-column">
              <div className="column-header" style={{ justifyContent: 'space-between' }}>
                <span className="badge-before">업로드된 원본 이미지</span>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  좌측 하단 [AI 소재 자동 완성 시작] 버튼을 누르면 AI 생성이 진행됩니다.
                </span>
              </div>
              <div className="column-image-container">
                <img src={currentInputImage} alt="Source Product" className="comparison-img" />
              </div>
            </div>
          </div>
        ) : (
          /* 최초 상태 플레이스홀더 */
          <div className="preview-placeholder">
            <span className="material-symbols-outlined placeholder-icon animate-pulse">image</span>
            <h4>편집할 이미지를 제공해 주세요</h4>
            <p>좌측에서 가공 옵션을 구성하고 완료 버튼을 누르시면 이곳에 실시간 변환 피드백이 표시됩니다.</p>

            <div className="placeholder-sample-btn-wrapper">
              <button className="btn-sample-load" onClick={onLoadSample}>
                샘플 가구 이미지 불러오기
              </button>
            </div>
          </div>
        )}
      </div>

      {resultImage && !isLoading && (
        <div className="preview-footer anim-slide-up">
          <button
            className="btn-action-outline"
            onClick={async () => {
              try {
                const response = await fetch(resultImage);
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `creative_result_${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
              } catch (err) {
                window.open(resultImage, '_blank');
              }
            }}
          >
            <span className="material-symbols-outlined">download</span>
            <span>고해상도 다운로드</span>
          </button>
          <button
            className="btn-action-primary"
            onClick={() => {
              if (onGoToLibrary) {
                onGoToLibrary();
              } else {
                alert('라이브러리 탭으로 이동합니다.');
              }
            }}
          >
            <span className="material-symbols-outlined">photo_library</span>
            <span>라이브러리에서 확인</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default StudioPreviewCanvas;
