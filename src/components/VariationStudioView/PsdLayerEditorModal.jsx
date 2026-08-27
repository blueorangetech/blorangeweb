import React, { useState, useEffect, useRef } from 'react';

function PsdLayerEditorModal({
  item,
  allVariations = [],
  onSelectVariation,
  psdDocument,
  activePlan = [],
  onUpdatePlan,
  onApplyAdjust,
  onRegenerateImage,
  isAdjusting,
  isRegeneratingImage,
  onClose,
  onDownloadPng,
  onDownloadPsd,
}) {
  const [selectedLayerId, setSelectedLayerId] = useState('');
  const [isDraggingId, setIsDraggingId] = useState(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const canvasImgRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Update canvas display size for accurate coordinate mapping
  const updateCanvasDisplaySize = () => {
    if (canvasImgRef.current) {
      setCanvasSize({
        width: canvasImgRef.current.clientWidth || 0,
        height: canvasImgRef.current.clientHeight || 0,
      });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateCanvasDisplaySize);
    return () => window.removeEventListener('resize', updateCanvasDisplaySize);
  }, []);

  // Default select first editable layer
  useEffect(() => {
    if (psdDocument?.layers && !selectedLayerId) {
      const firstEditable = psdDocument.layers.find((l) => l.editable && l.type !== 'group') || psdDocument.layers[0];
      if (firstEditable) setSelectedLayerId(firstEditable.id);
    }
  }, [psdDocument, selectedLayerId]);

  if (!item) return null;

  const selectedLayer = psdDocument?.layers?.find((l) => l.id === selectedLayerId);
  const selectedPlanItem = activePlan.find((p) => p.id === selectedLayerId) || {
    id: selectedLayerId,
    x: selectedLayer?.bounds ? selectedLayer.bounds[0] : 50,
    y: selectedLayer?.bounds ? selectedLayer.bounds[1] : 50,
    scale: 1.0,
    visible: selectedLayer?.visible ?? true,
  };

  // Canvas Mouse Drag & Drop Handler
  const handleLayerMouseDown = (e, layerId) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedLayerId(layerId);

    const layer = psdDocument?.layers?.find((l) => l.id === layerId);
    const planItem = activePlan.find((p) => p.id === layerId) || {
      x: layer?.bounds ? layer.bounds[0] : 0,
      y: layer?.bounds ? layer.bounds[1] : 0,
    };

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startPosX = planItem.x ?? 0;
    const startPosY = planItem.y ?? 0;

    const scaleX = (canvasSize.width || 1) / (item.width || 1);
    const scaleY = (canvasSize.height || 1) / (item.height || 1);

    setIsDraggingId(layerId);

    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startMouseX) / scaleX;
      const deltaY = (moveEvent.clientY - startMouseY) / scaleY;
      const newX = Math.round(startPosX + deltaX);
      const newY = Math.round(startPosY + deltaY);
      onUpdatePlan(item.key, { x: newX, y: newY }, layerId);
    };

    const handleMouseUp = () => {
      setIsDraggingId(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Scale factors
  const scaleX = (canvasSize.width || 1) / (item.width || 1);
  const scaleY = (canvasSize.height || 1) / (item.height || 1);

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-content glass-card psd-editor-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '1200px', width: '94vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* 모달 상단 헤더 */}
        <div className="modal-header" style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`variation-tag ${item.channelKey}`}>{item.channel}</span>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                {item.format} 레이어 편집
              </h3>
              <span className="badge-meta">{item.width}×{item.height} ({item.aspectRatio})</span>
            </div>

            {/* 타 지면 빠른 전환 드롭다운/탭 */}
            {allVariations.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>지면 전환:</span>
                <select
                  value={item.key}
                  onChange={(e) => onSelectVariation(e.target.value)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8rem',
                    background: '#f8fafc',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  {allVariations.map((v) => (
                    <option key={v.key} value={v.key}>
                      {v.channel} - {v.format?.split('(')[0]?.trim()} ({v.width}×{v.height})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button className="btn-modal-close" onClick={onClose} title="닫기">✕</button>
        </div>

        {/* 모달 본문: 좌측 캔버스 + 우측 레이어 인스펙터 */}
        <div className="modal-scroll-area" style={{ padding: '18px 20px', overflowY: 'auto', flex: 1 }}>
          <div className="psd-workspace-layout" style={{ minHeight: '480px' }}>
            {/* 좌측 캔버스 쇼케이스 */}
            <div className="psd-canvas-showcase" style={{ minHeight: '460px' }}>
              <div className="psd-canvas-badge">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>aspect_ratio</span>
                <span>{item.channel} · {item.width}×{item.height} ({item.aspectRatio})</span>
              </div>

              <div className="psd-canvas-wrap">
                <img
                  ref={canvasImgRef}
                  className="psd-canvas-img"
                  src={item.previewUrl}
                  alt={item.headline}
                  onLoad={updateCanvasDisplaySize}
                />

                {/* 드래그 앤 드롭 인터랙티브 레이어 오버레이 */}
                {canvasSize.width > 0 && (
                  <div className="psd-canvas-layer-overlay">
                    {psdDocument?.layers
                      ?.filter((l) => l.type !== 'group')
                      .map((layer) => {
                        const planItem = activePlan.find((p) => p.id === layer.id) || {
                          x: layer.bounds ? layer.bounds[0] : 0,
                          y: layer.bounds ? layer.bounds[1] : 0,
                          scale: 1.0,
                          visible: layer.visible ?? true,
                        };

                        if (planItem.visible === false) return null;

                        const origW = layer.bounds ? (layer.bounds[2] - layer.bounds[0]) : 120;
                        const origH = layer.bounds ? (layer.bounds[3] - layer.bounds[1]) : 40;
                        const boxW = Math.max(30, origW * (planItem.scale || 1.0) * scaleX);
                        const boxH = Math.max(20, origH * (planItem.scale || 1.0) * scaleY);
                        const boxLeft = Math.max(0, (planItem.x ?? 0) * scaleX);
                        const boxTop = Math.max(0, (planItem.y ?? 0) * scaleY);

                        const isSelected = layer.id === selectedLayerId;
                        const isDragging = layer.id === isDraggingId;

                        return (
                          <div
                            key={layer.id}
                            className={`psd-interactive-layer-box ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
                            style={{
                              left: `${boxLeft}px`,
                              top: `${boxTop}px`,
                              width: `${boxW}px`,
                              height: `${boxH}px`,
                            }}
                            onMouseDown={(e) => handleLayerMouseDown(e, layer.id)}
                            title={`[${layer.name}] 마우스로 드래그하여 이동`}
                          >
                            {isSelected && (
                              <>
                                <span className="layer-box-tag">
                                  {layer.type === 'type' ? '📝' : '🏷️'} {layer.name}
                                </span>
                                <span className="layer-box-coords">
                                  X: {planItem.x ?? 0}, Y: {planItem.y ?? 0}
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="psd-canvas-actions-bar">
                <button
                  type="button"
                  className="btn-card-action download"
                  onClick={() => onDownloadPng(item)}
                >
                  <span className="material-symbols-outlined">image</span>
                  <span>PNG 다운로드</span>
                </button>
                <button
                  type="button"
                  className="btn-card-action psd-btn"
                  onClick={() => onDownloadPsd(item)}
                >
                  <span className="material-symbols-outlined">layers</span>
                  <span>PSD 다운로드</span>
                </button>
              </div>
            </div>

            {/* 우측 레이어 인스펙터 & 컨트롤러 */}
            <div className="psd-layer-inspector">
              <h4 className="inspector-section-title">
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#6366f1' }}>layers</span>
                레이어 목록 ({psdDocument?.layers?.length || 0}개)
              </h4>

              {/* 레이어 트리 */}
              <div className="psd-layer-tree">
                {psdDocument?.layers?.map((layer) => {
                  const isSelected = layer.id === selectedLayerId;
                  const planItem = activePlan.find((p) => p.id === layer.id);
                  const isVisible = planItem ? planItem.visible !== false : layer.visible;

                  return (
                    <div
                      key={layer.id}
                      className={`psd-layer-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedLayerId(layer.id)}
                    >
                      <div className="psd-layer-info-left">
                        <span className={`psd-layer-type-tag ${layer.type}`}>
                          {layer.type === 'type' ? 'TXT' : layer.type === 'pixel' ? 'IMG' : 'GRP'}
                        </span>
                        <span className="psd-layer-name-text" title={layer.name}>
                          {layer.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={`btn-layer-vis ${isVisible ? '' : 'off'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdatePlan(item.key, { visible: !isVisible }, layer.id);
                        }}
                        title={isVisible ? '레이어 숨기기' : '레이어 보이기'}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          {isVisible ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* 선택 레이어 미세조정 패널 */}
              {selectedLayer && (
                <div className="psd-layer-control-box">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>
                      선택 레이어: <strong>{selectedLayer.name}</strong>
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      X: {selectedPlanItem.x ?? 0}px · Y: {selectedPlanItem.y ?? 0}px
                    </span>
                  </div>

                  {/* X, Y 슬라이더 조정 */}
                  <div className="psd-slider-group">
                    <div className="psd-slider-header">
                      <span>가로 위치 (X 좌표)</span>
                      <span>{selectedPlanItem.x ?? 0}px</span>
                    </div>
                    <input
                      type="range"
                      min={-100}
                      max={item.width}
                      value={selectedPlanItem.x ?? 0}
                      onChange={(e) => onUpdatePlan(item.key, { x: parseInt(e.target.value, 10) }, selectedLayer.id)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div className="psd-slider-group">
                    <div className="psd-slider-header">
                      <span>세로 위치 (Y 좌표)</span>
                      <span>{selectedPlanItem.y ?? 0}px</span>
                    </div>
                    <input
                      type="range"
                      min={-100}
                      max={item.height}
                      value={selectedPlanItem.y ?? 0}
                      onChange={(e) => onUpdatePlan(item.key, { y: parseInt(e.target.value, 10) }, selectedLayer.id)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* 크기 스케일 조정 */}
                  <div className="psd-slider-group">
                    <div className="psd-slider-header">
                      <span>크기 비율 (Scale)</span>
                      <span>{Math.round((selectedPlanItem.scale || 1.0) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={250}
                      value={Math.round((selectedPlanItem.scale || 1.0) * 100)}
                      onChange={(e) => onUpdatePlan(item.key, { scale: parseInt(e.target.value, 10) / 100 }, selectedLayer.id)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* AI 이미지 맞춤 재생성 / 배경 교체 도구 */}
                  {(selectedLayer.type === 'pixel' || selectedLayer.name.toLowerCase().includes('bg') || selectedLayer.name.toLowerCase().includes('배경')) && (
                    <div className="psd-ai-image-box">
                      <div className="psd-ai-box-title">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_awesome</span>
                        <span>{item.channel} ({item.aspectRatio}) 맞춤 AI 이미지 재생성</span>
                      </div>
                      <input
                        type="text"
                        className="psd-image-prompt-input"
                        placeholder="추가 요청 프롬프트 (예: 얼굴/상반신이 온전히 나오는 작업자)"
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        disabled={isRegeneratingImage}
                      />
                      <button
                        type="button"
                        className="btn-ai-regenerate-image"
                        onClick={() => onRegenerateImage(item.key, selectedLayer.id, imagePrompt)}
                        disabled={isRegeneratingImage}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          {isRegeneratingImage ? 'sync' : 'auto_fix_high'}
                        </span>
                        <span>{isRegeneratingImage ? 'AI 이미지 생성 및 레이어 교체 중...' : '이 규격에 맞게 AI 이미지 교체'}</span>
                      </button>
                    </div>
                  )}

                  {/* 실시간 재렌더링 적용 버튼 */}
                  <button
                    type="button"
                    className="btn-re-render-placement"
                    onClick={() => onApplyAdjust(item.key)}
                    disabled={isAdjusting}
                  >
                    <span className="material-symbols-outlined">
                      {isAdjusting ? 'refresh' : 'tune'}
                    </span>
                    <span>{isAdjusting ? '지면 레이아웃 재렌더링 중...' : '현재 지면 레이아웃 즉시 재렌더링'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 모달 하단 푸터 */}
        <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn-generate-variation"
            onClick={onClose}
            style={{ maxWidth: '140px', padding: '8px 16px', background: '#334155' }}
          >
            <span>편집 완료</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PsdLayerEditorModal;
