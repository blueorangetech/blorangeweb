import React, { useState } from 'react';

/**
 * CreativeStudioView 좌측 설정 제어판 컴포넌트 (PhotoRoom 공식 웹 UI 스타일)
 */
function StudioControlPanel({
  file,
  imageUrl,
  fileInputRef,
  backgroundMode,
  backgroundColor,
  backgroundPrompt,
  shadowMode,
  shadowDirection,
  shadowSpread,
  shadowSoftness,
  shadowIntensity,
  padding,
  isLoading,
  onDragOver,
  onDrop,
  onFileChange,
  onUrlChange,
  setBackgroundMode,
  setBackgroundColor,
  setShadowMode,
  setShadowDirection,
  setShadowSpread,
  setShadowSoftness,
  setShadowIntensity,
  setPadding,
  onGenerate
}) {
  const [shadowTab, setShadowTab] = useState('preset'); // 'preset' | 'advanced'
  const [enableDirection, setEnableDirection] = useState(false);
  const [enableSpread, setEnableSpread] = useState(false);
  const [enableSoftness, setEnableSoftness] = useState(true);
  const [enableIntensity, setEnableIntensity] = useState(true);

  const enableShadow = shadowMode !== 'none';

  const selectPreset = (mode) => {
    setShadowMode(mode);
    if (mode === 'ai.soft') {
      setShadowSoftness(0.35);
      setShadowIntensity(0.7);
      setShadowSpread('medium');
      setShadowDirection('behindRight');
    } else if (mode === 'ai.hard') {
      setShadowSoftness(0.05);
      setShadowIntensity(0.95);
      setShadowSpread('short');
      setShadowDirection('behindRight');
    } else if (mode === 'ai.floating') {
      setShadowSoftness(0.65);
      setShadowIntensity(0.5);
      setShadowSpread('long');
    }
  };

  return (
    <section className="angle-upload-card glass-card">
      <div className="panel-header">
        <h3>AI 그림자</h3>
        <span className="api-badge">PhotoRoom v2</span>
      </div>

      <div className="panel-scroll-content">
        {/* 이미지 업로드 박스 */}
        <div
          className={`dropzone ${file || imageUrl ? 'has-file with-preview' : ''}`}
          onClick={() => !file && !imageUrl && fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDrop={onDrop}
          style={{ marginBottom: '14px' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onFileChange}
          />
          {file || imageUrl ? (
            <div className="dropzone-image-preview">
              <div className="preview-img-wrapper">
                <img src={imageUrl || (file ? URL.createObjectURL(file) : '')} alt="업로드 이미지 미리보기" />
              </div>
              <div className="preview-meta-row">
                <div className="preview-file-text">
                  <span className="material-symbols-outlined icon-success">check_circle</span>
                  <p className="file-name" title={file ? file.name : imageUrl}>
                    {file ? file.name : (imageUrl.length > 25 ? `${imageUrl.substring(0, 22)}...` : imageUrl)}
                  </p>
                  {file && <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>}
                </div>
                <button
                  type="button"
                  className="btn-change-image"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
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

        {/* 상단 탭: [프리셋] | [고급] (포토룸 웹 100% 동일) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#f1f5f9',
          padding: '3px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <button
            type="button"
            onClick={() => setShadowTab('preset')}
            style={{
              padding: '7px 0',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              background: shadowTab === 'preset' ? '#ffffff' : 'transparent',
              color: shadowTab === 'preset' ? '#1e293b' : '#64748b',
              boxShadow: shadowTab === 'preset' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            프리셋
          </button>
          <button
            type="button"
            onClick={() => setShadowTab('advanced')}
            style={{
              padding: '7px 0',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              background: shadowTab === 'advanced' ? '#ffffff' : 'transparent',
              color: shadowTab === 'advanced' ? '#1e293b' : '#64748b',
              boxShadow: shadowTab === 'advanced' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            고급
          </button>
        </div>

        {/* 1. [프리셋] 탭 (포토룸 스크린샷 일치: 4개 카드 그리드) */}
        {shadowTab === 'preset' && (
          <div className="anim-fade">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              marginBottom: '12px'
            }}>
              {/* 없음 */}
              <button
                type="button"
                onClick={() => selectPreset('none')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  aspectRatio: '1',
                  background: '#ffffff',
                  border: shadowMode === 'none' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  padding: '8px 4px',
                  boxShadow: shadowMode === 'none' ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  background: 'repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 3px, #e2e8f0 3px, #e2e8f0 6px)'
                }} />
                <span style={{ fontSize: '11px', color: shadowMode === 'none' ? '#6366f1' : '#334155', fontWeight: 600 }}>
                  없음
                </span>
              </button>

              {/* 부드러운 그림자 */}
              <button
                type="button"
                onClick={() => selectPreset('ai.soft')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  aspectRatio: '1',
                  background: '#ffffff',
                  border: shadowMode === 'ai.soft' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  padding: '8px 4px',
                  boxShadow: shadowMode === 'ai.soft' ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  background: '#ffffff',
                  boxShadow: '0 8px 12px -2px rgba(99, 102, 241, 0.35)'
                }} />
                <span style={{ fontSize: '11px', color: shadowMode === 'ai.soft' ? '#6366f1' : '#334155', fontWeight: 600, textAlign: 'center' }}>
                  부드러운 그림자
                </span>
              </button>

              {/* 딱 떨어지는 그림자 */}
              <button
                type="button"
                onClick={() => selectPreset('ai.hard')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  aspectRatio: '1',
                  background: '#ffffff',
                  border: shadowMode === 'ai.hard' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  padding: '8px 4px',
                  boxShadow: shadowMode === 'ai.hard' ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  background: '#ffffff',
                  boxShadow: '6px 6px 0px 0px rgba(71, 85, 105, 0.5)'
                }} />
                <span style={{ fontSize: '11px', color: shadowMode === 'ai.hard' ? '#6366f1' : '#334155', fontWeight: 600, textAlign: 'center' }}>
                  딱 떨어지는 그림자
                </span>
              </button>
            </div>

            {/* 두 번째 줄: 떠 있는 그림자 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px'
            }}>
              <button
                type="button"
                onClick={() => selectPreset('ai.floating')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  aspectRatio: '1',
                  background: '#ffffff',
                  border: shadowMode === 'ai.floating' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  padding: '8px 4px',
                  boxShadow: shadowMode === 'ai.floating' ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  background: '#ffffff',
                  boxShadow: '0 12px 10px -4px rgba(99, 102, 241, 0.45)'
                }} />
                <span style={{ fontSize: '11px', color: shadowMode === 'ai.floating' ? '#6366f1' : '#334155', fontWeight: 600, textAlign: 'center' }}>
                  떠 있는 그림자
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 2. [고급] 탭 (포토룸 스크린샷 4번 일치: 토글 + 슬라이더 목록) */}
        {shadowTab === 'advanced' && (
          <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1) 그림자 선명도 */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>그림자 선명도</span>
                <label className="rmbg-switch" style={{ width: '36px', height: '20px' }}>
                  <input
                    type="checkbox"
                    checked={enableSoftness}
                    onChange={(e) => setEnableSoftness(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>부드러운 그림자</span>
                <span>딱 떨어지는 그림자</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                disabled={!enableSoftness}
                value={1 - shadowSoftness}
                onChange={(e) => {
                  setShadowSoftness(1 - parseFloat(e.target.value));
                  if (shadowMode !== 'custom') setShadowMode('custom');
                }}
                style={{ width: '100%', accentColor: '#4f46e5' }}
              />
            </div>

            {/* 2) 그림자 진하기 */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>그림자 진하기</span>
                <label className="rmbg-switch" style={{ width: '36px', height: '20px' }}>
                  <input
                    type="checkbox"
                    checked={enableIntensity}
                    onChange={(e) => setEnableIntensity(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>옅게</span>
                <span>어둡게</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                disabled={!enableIntensity}
                value={shadowIntensity}
                onChange={(e) => {
                  setShadowIntensity(parseFloat(e.target.value));
                  if (shadowMode !== 'custom') setShadowMode('custom');
                }}
                style={{ width: '100%', accentColor: '#4f46e5' }}
              />
            </div>

            {/* 3) 그림자 방향 */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: enableDirection ? '8px' : '0' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>그림자 방향</span>
                <label className="rmbg-switch" style={{ width: '36px', height: '20px' }}>
                  <input
                    type="checkbox"
                    checked={enableDirection}
                    onChange={(e) => setEnableDirection(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              {enableDirection && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
                  {[
                    { id: 'behindRight', label: '우측 뒤 ↘' },
                    { id: 'behindLeft', label: '좌측 뒤 ↙' },
                    { id: 'frontRight', label: '우측 앞 ↗' },
                    { id: 'frontLeft', label: '좌측 앞 ↖' },
                  ].map((dir) => (
                    <button
                      key={dir.id}
                      type="button"
                      className={`mode-btn ${shadowDirection === dir.id ? 'active' : ''}`}
                      onClick={() => {
                        setShadowDirection(dir.id);
                        if (shadowMode !== 'custom') setShadowMode('custom');
                      }}
                      style={{ padding: '6px 2px', fontSize: '10px' }}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4) 그림자 범위 */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: enableSpread ? '8px' : '0' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>그림자 범위 (길이)</span>
                <label className="rmbg-switch" style={{ width: '36px', height: '20px' }}>
                  <input
                    type="checkbox"
                    checked={enableSpread}
                    onChange={(e) => setEnableSpread(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              {enableSpread && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
                  {[
                    { id: 'short', label: '짧게 (Short)' },
                    { id: 'medium', label: '보통 (Medium)' },
                    { id: 'long', label: '길게 (Long)' },
                  ].map((spr) => (
                    <button
                      key={spr.id}
                      type="button"
                      className={`mode-btn ${shadowSpread === spr.id ? 'active' : ''}`}
                      onClick={() => {
                        setShadowSpread(spr.id);
                        if (shadowMode !== 'custom') setShadowMode('custom');
                      }}
                      style={{ padding: '6px 6px', fontSize: '11px' }}
                    >
                      {spr.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 5) 안전 여백 (그림자 잘림 방지) */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>안전 여백 (잘림 방지)</span>
                <strong style={{ fontSize: '12px', color: '#4f46e5' }}>{Math.round((padding || 0.12) * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="0.35"
                step="0.02"
                value={padding || 0.12}
                onChange={(e) => setPadding(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#4f46e5' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 포토룸 웹 하단 실행 버튼: [전체 적용] */}
      <div className="panel-footer">
        <button
          type="button"
          className="generate-btn"
          onClick={onGenerate}
          disabled={isLoading || (!file && !imageUrl)}
          style={{ background: '#4f46e5' }}
        >
          {isLoading ? (
            <div className="btn-loading-content">
              <div className="spinner-white" />
              <span>AI 그림자 적용 중...</span>
            </div>
          ) : (
            <div className="btn-content">
              <span className="material-symbols-outlined">auto_fix_high</span>
              <span>전체 적용</span>
            </div>
          )}
        </button>
      </div>
    </section>
  );
}

export default StudioControlPanel;
