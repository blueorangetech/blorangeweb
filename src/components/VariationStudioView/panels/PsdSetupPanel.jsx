import React from 'react';
import PlacementGroupSelector from '../PlacementGroupSelector';
import PsdUploader from '../PsdUploader';

function PsdSetupPanel({
  document,
  onDocumentChange,
  pageName,
  bucketName,
  placementGroups,
  selectedPlacements,
  selectedCount,
  onTogglePlacement,
  onToggleGroupAll,
  onSelectAll,
  instruction = '',
  setInstruction,
  onGenerate,
  isGenerating = false,
}) {
  return (
    <div className="control-panel glass-card">
      <div className="panel-header">
        <h3>PSD 템플릿 설정</h3>
        <span className="variation-badge psd">PSD</span>
      </div>

      <div className="panel-scroll-content psd-setup-content">
        <section className="control-group">
          <label className="group-title">1. PSD 파일 선택</label>
          <PsdUploader document={document} onDocumentChange={onDocumentChange}
            pageName={pageName} bucketName={bucketName} />
        </section>

        <section className="control-group">
          <div className="group-title-wrapper psd-placement-title">
            <label className="group-title">2. 미디어별 사이즈 지정</label>
            <button type="button" className="btn-select-all-quick" onClick={onSelectAll}>
              전체 선택
            </button>
          </div>
          <PlacementGroupSelector placementGroups={placementGroups}
            selectedPlacements={selectedPlacements}
            togglePlacement={onTogglePlacement}
            toggleGroupAll={onToggleGroupAll} />
        </section>

        {setInstruction && (
          <section className="control-group">
            <label className="group-title label-with-tooltip">
              3. 문구 및 레이어 수정 (선택)
              <span className="tooltip-wrap">
                <span className="material-symbols-outlined info-icon">help_outline</span>
                <span className="tooltip-content">
                  베리에이션 생성 시 특정 텍스트를 바꾸거나 레이어를 제어하려면 자연어로 지시하세요.
                </span>
              </span>
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="예: '가격 문구를 39,900원으로 변경', '할인율 30% 강조'"
              rows={2}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                resize: 'none'
              }}
            />
          </section>
        )}
      </div>

      <div className="panel-footer">
        <button
          type="button"
          className={`btn-generate-variation ${isGenerating ? 'loading' : ''}`}
          onClick={onGenerate}
          disabled={!document || selectedCount === 0 || isGenerating}
        >
          {isGenerating ? (
            <div className="btn-loading-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="spinner-white" />
              <span>PSD 베리에이션 생성 중...</span>
            </div>
          ) : (
            <div className="btn-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">auto_awesome</span>
              <span>
                {!document
                  ? 'PSD 파일을 업로드하세요'
                  : selectedCount === 0
                  ? '규격을 1개 이상 선택하세요'
                  : `선택한 ${selectedCount}개 규격으로 생성`}
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

export default PsdSetupPanel;
