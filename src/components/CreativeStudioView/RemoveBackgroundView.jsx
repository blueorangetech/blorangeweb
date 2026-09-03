import React, { useRef, useState, useMemo } from 'react';
import StudioLoadingState from './StudioLoadingState';
import { aiApi } from '../../api';
import { downloadFileFromUrl } from '../../utils/downloadUtils';

function isLightColor(hex) {
  const cleanHex = (hex || '').replace('#', '');
  if (cleanHex.length !== 6) return true;
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return (r * 0.299 + g * 0.587 + b * 0.114) > 186;
}

// 8방향 드리움 각도 매핑
const SHADOW_DIRECTIONS = [
  { id: 'top_left', label: '좌상단 (↖)', icon: 'north_west', angle: 225 },
  { id: 'top', label: '상단 (↑)', icon: 'north', angle: 270 },
  { id: 'top_right', label: '우상단 (↗)', icon: 'north_east', angle: 315 },
  { id: 'left', label: '좌측 (←)', icon: 'west', angle: 180 },
  { id: 'center', label: '중앙 (●)', icon: 'adjust', angle: null },
  { id: 'right', label: '우측 (→)', icon: 'east', angle: 0 },
  { id: 'bottom_left', label: '좌하단 (↙)', icon: 'south_west', angle: 135 },
  { id: 'bottom', label: '하단 (↓)', icon: 'south', angle: 90 },
  { id: 'bottom_right', label: '우하단 (↘ 권장)', icon: 'south_east', angle: 45 },
];

// 입체감 스타일 프리셋 (가구 발밑 자연스러운 접지 그림자)
const SHADOW_PRESETS = {
  soft: { id: 'soft', label: '자연스러운 바닥 그림자 (권장)', distance: 26, blur: 28, grow: 0, opacity: 45 },
  natural: { id: 'natural', label: '스튜디오 자연광', distance: 20, blur: 22, grow: 0, opacity: 50 },
  contact: { id: 'contact', label: '발밑 밀착 (하드)', distance: 12, blur: 14, grow: -1, opacity: 60 },
  custom: { id: 'custom', label: '직접 설정', distance: 26, blur: 28, grow: 0, opacity: 45 },
};

function calculateShadowOffsets(directionId, distance) {
  // 가구 다리와 밑바닥 라인에 밀착되도록 바닥 방향 Y 오프셋을 안정적으로 산출
  const dirRatios = {
    top_left: { x: -0.55, y: 0.65 },
    top: { x: 0, y: 0.65 },
    top_right: { x: 0.55, y: 0.65 },
    left: { x: -0.7, y: 0.85 },
    center: { x: 0, y: 0.75 },
    right: { x: 0.7, y: 0.85 },
    bottom_left: { x: -0.6, y: 0.95 },
    bottom: { x: 0, y: 1.0 },
    bottom_right: { x: 0.6, y: 0.95 },
  };
  const r = dirRatios[directionId] || { x: 0.6, y: 0.95 };
  return {
    x: Math.round(distance * r.x),
    y: Math.max(10, Math.round(distance * r.y)),
  };
}

export default function RemoveBackgroundView({ embedded, pageName, bucketName }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  
  // 1차 설정: 그림자 유무
  const [enableShadow, setEnableShadow] = useState(false);
  
  // 배경 모드 (그림자 OFF 시: Alpha 또는 Color)
  const [bgMode, setBgMode] = useState('Alpha');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  
  // 그림자 세부 설정 (가구 접지 그림자 제어)
  const [shadowDirection, setShadowDirection] = useState('bottom_right');
  const [shadowPreset, setShadowPreset] = useState('soft');
  const [shadowDistance, setShadowDistance] = useState(26);
  const [shadowBlur, setShadowBlur] = useState(28);
  const [shadowGrow, setShadowGrow] = useState(0);
  const [shadowOpacity, setShadowOpacity] = useState(45);
  const [shadowColor, setShadowColor] = useState('#000000');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [compareMode, setCompareMode] = useState(false);

  // 방향 및 거리에 따른 X, Y 오프셋 실시간 동적 계산
  const currentOffsets = useMemo(() => {
    return calculateShadowOffsets(shadowDirection, shadowDistance);
  }, [shadowDirection, shadowDistance]);

  const selectFile = (selected) => {
    if (!selected || !selected.type.startsWith('image/')) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError('');
  };

  const handlePresetSelect = (presetKey) => {
    setShadowPreset(presetKey);
    if (presetKey !== 'custom') {
      const p = SHADOW_PRESETS[presetKey];
      setShadowDistance(p.distance);
      setShadowBlur(p.blur);
      setShadowGrow(p.grow);
      setShadowOpacity(p.opacity);
    }
  };

  const handleGenerate = async () => {
    if (!file) return setError('배경을 제거할 원본 이미지를 업로드해 주세요.');
    setLoading(true);
    setError('');
    try {
      const response = await aiApi.removeBackground(file, {
        backgroundMode: enableShadow ? 'Color' : bgMode,
        backgroundColor: bgColor,
        enableShadow,
        shadowDistanceX: currentOffsets.x,
        shadowDistanceY: currentOffsets.y,
        shadowBlur,
        shadowGrow,
        shadowOpacity,
        shadowColor,
        pageName,
        bucketName,
      });
      if (!response.image_url) {
        throw new Error('ComfyUI가 배경 제거 결과 이미지를 반환하지 않았습니다.');
      }
      setResult({
        imageUrl: response.image_url,
        filename: response.filename,
        enableShadow: response.enable_shadow,
        backgroundMode: response.background_mode,
        backgroundColor: response.background_color,
      });
    } catch (err) {
      setError(err.message || '배경 제거 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!result?.imageUrl || downloading) return;
    setDownloading(true);
    try {
      const filename = result.filename || `removed_bg_${file?.name || 'image.png'}`;
      await downloadFileFromUrl(result.imageUrl, filename);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`multiple-angle-layout remove-bg-layout${embedded ? ' embedded' : ''}`}>
      {/* 좌측 설정 패널 */}
      <section className="angle-upload-card glass-card">
        <div className="panel-header">
          <h3>배경 제거 및 그림자</h3>
          <span className="api-badge">ComfyUI RMBG-2.0</span>
        </div>

        <div className="panel-scroll-content">
          <p className="angle-description">
            AI 모델이 피사체를 정밀 분리합니다. 
            <br/>
            투명 누끼 추출뿐만 아니라 자연스러운 <strong>입체 그림자 합성</strong>을 지원합니다.
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

          {/* 1차 설정: 그림자 유무 토글 */}
          <div className="rmbg-shadow-toggle-card">
            <div className="shadow-toggle-info">
              <div className="shadow-toggle-title">
                <span className="material-symbols-outlined">wb_shade</span>
                <strong>자연스러운 그림자 효과</strong>
              </div>
              <span className="shadow-toggle-desc">
                {enableShadow 
                  ? '빈 이미지 배경 위에 방향과 입체감을 계산하여 그림자를 합성합니다.' 
                  : '그림자 없이 깔끔한 투명 누끼 또는 단색 배경을 생성합니다.'}
              </span>
            </div>
            <label className="rmbg-switch">
              <input 
                type="checkbox" 
                checked={enableShadow} 
                onChange={(e) => setEnableShadow(e.target.checked)} 
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* CASE 1: 그림자 비활성화 (OFF) -> 기존 RMBG 직접 제어 모드 */}
          {!enableShadow && (
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
                    <span>RMBG 직접 단색 채우기</span>
                  </div>
                  <span className="material-symbols-outlined radio-icon">
                    {bgMode === 'Color' ? 'radio_button_checked' : 'radio_button_unchecked'}
                  </span>
                </button>
              </div>

              {bgMode === 'Color' && (
                <div className="rmbg-color-picker-box">
                  <div className="rmbg-color-picker-header">
                    <span className="color-box-title">배경 색상 설정</span>
                    <span className="color-box-desc">팔레트를 누르거나 HEX 코드를 직접 입력하세요</span>
                  </div>
                  <div className="rmbg-color-control-card">
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
                    <div className="rmbg-color-preview-tag" style={{ backgroundColor: bgColor }}>
                      <span style={{ color: isLightColor(bgColor) ? '#334155' : '#FFFFFF' }}>{bgColor}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CASE 2: 그림자 활성화 (ON) -> 빈 이미지 배경색(10진수) + DropShadow V3 동적 제어 */}
          {enableShadow && (
            <div className="rmbg-shadow-settings-group">
              {/* 배경색 선택기 (빈 이미지 노드로 전달됨) */}
              <div className="rmbg-option-section">
                <label className="rmbg-section-label">
                  배경 색상 (빈 이미지 노드)
                  <span className="field-note">16진수 HEX → 10진수 정수 변환 주입</span>
                </label>
                <div className="rmbg-color-control-card">
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
                  <div className="rmbg-color-preview-tag" style={{ backgroundColor: bgColor }}>
                    <span style={{ color: isLightColor(bgColor) ? '#334155' : '#FFFFFF' }}>{bgColor}</span>
                  </div>
                </div>
              </div>

              {/* 그림자 방향 다이얼 (8방향 + 중앙) */}
              <div className="rmbg-option-section">
                <div className="rmbg-section-header-row">
                  <label className="rmbg-section-label">그림자 드리움 방향 (동적 계산)</label>
                  <span className="offset-badge">
                    X: {currentOffsets.x > 0 ? `+${currentOffsets.x}` : currentOffsets.x}px, 
                    Y: {currentOffsets.y > 0 ? `+${currentOffsets.y}` : currentOffsets.y}px
                  </span>
                </div>
                
                <div className="rmbg-compass-grid">
                  {SHADOW_DIRECTIONS.map((dir) => (
                    <button
                      key={dir.id}
                      type="button"
                      className={`compass-btn ${shadowDirection === dir.id ? 'active' : ''}`}
                      onClick={() => setShadowDirection(dir.id)}
                      title={dir.label}
                    >
                      <span className="material-symbols-outlined">{dir.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 입체감 프리셋 선택 */}
              <div className="rmbg-option-section">
                <label className="rmbg-section-label">입체감 / 강도 스타일</label>
                <div className="rmbg-preset-grid">
                  {Object.keys(SHADOW_PRESETS).map((key) => {
                    const p = SHADOW_PRESETS[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`preset-chip-btn ${shadowPreset === key ? 'active' : ''}`}
                        onClick={() => handlePresetSelect(key)}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 세부 조절 슬라이더 (Custom 또는 프리셋 값 실시간 미세조정) */}
              <div className="rmbg-slider-box">
                <div className="slider-row">
                  <div className="slider-label-row">
                    <span>그림자 거리 (Distance)</span>
                    <strong>{shadowDistance}px</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    value={shadowDistance}
                    onChange={(e) => {
                      setShadowDistance(Number(e.target.value));
                      setShadowPreset('custom');
                    }}
                  />
                </div>

                <div className="slider-row">
                  <div className="slider-label-row">
                    <span>흐림도 (Blur)</span>
                    <strong>{shadowBlur}px</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={shadowBlur}
                    onChange={(e) => {
                      setShadowBlur(Number(e.target.value));
                      setShadowPreset('custom');
                    }}
                  />
                </div>


                <div className="slider-row">
                  <div className="slider-label-row">
                    <span>그림자 농도 (Opacity)</span>
                    <strong>{shadowOpacity}%</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={shadowOpacity}
                    onChange={(e) => {
                      setShadowOpacity(Number(e.target.value));
                      setShadowPreset('custom');
                    }}
                  />
                </div>
              </div>
            </div>
          )}
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
                <span>{enableShadow ? '바닥 그림자 생성 중...' : '배경 분리 중...'}</span>
              </div>
            ) : (
              <div className="btn-content">
                <span className="material-symbols-outlined">auto_fix_high</span>
                <span>{enableShadow ? '바닥 그림자 생성' : '배경 제거 실행'}</span>
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
                      {result.enableShadow ? `입체 그림자 (${bgColor})` : (bgMode === 'Alpha' ? '배경 제거 (투명)' : `단색 배경 (${bgColor})`)}
                    </div>
                    <div className={`rmbg-image-box ${!result.enableShadow && bgMode === 'Alpha' ? 'alpha-pattern' : ''}`} style={result.enableShadow || bgMode === 'Color' ? { backgroundColor: bgColor } : {}}>
                      <img src={result.imageUrl} alt="배경 제거 결과" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="rmbg-single-view">
                  <div className={`rmbg-image-box large ${!result.enableShadow && bgMode === 'Alpha' ? 'alpha-pattern' : ''}`} style={result.enableShadow || bgMode === 'Color' ? { backgroundColor: bgColor } : {}}>
                    <img src={result.imageUrl} alt="배경 제거 결과" />
                  </div>
                  <div className="rmbg-result-meta-bar">
                    <span className="rmbg-meta-chip">
                      <span className="material-symbols-outlined">check_circle</span>
                      {result.enableShadow 
                        ? `자연스러운 그림자 효과 적용 (${bgColor})` 
                        : (bgMode === 'Alpha' ? '투명 배경(Alpha PNG)' : `단색 배경 (${bgColor})`)}
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
