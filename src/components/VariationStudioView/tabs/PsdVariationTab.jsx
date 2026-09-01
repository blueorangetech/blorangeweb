import React, { useState } from 'react';
import '../../../styles/VariationStudioView.css';
import PsdSetupPanel from '../panels/PsdSetupPanel';
import PsdVariationCard from '../PsdVariationCard';
import PsdLayerEditorModal from '../PsdLayerEditorModal';
import usePlacementSelection from '../hooks/usePlacementSelection';
import { PLACEMENT_GROUPS, PLACEMENT_SPECS_MAP } from '../specs';
import { aiApi } from '../../../api';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const getArtifactUrl = (url, bucketName, cacheKey = '') => {
  if (!url) return '';
  const absolute = /^https?:\/\//.test(url) ? url : `${API_BASE_URL}${url}`;
  const separator = absolute.includes('?') ? '&' : '?';
  const bucket = bucketName ? `&bucket_name=${encodeURIComponent(bucketName)}` : '';
  return `${absolute}${separator}_=${cacheKey || Date.now()}${bucket}`;
};

function PsdVariationTab({ embedded = false, pageName = 'playground', bucketName }) {
  const [psdDocument, setPsdDocument] = useState(null);
  const [instruction, setInstruction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedVariations, setGeneratedVariations] = useState([]);
  const [editingModalItem, setEditingModalItem] = useState(null);
  const [placementPlans, setPlacementPlans] = useState({});

  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const {
    selectedPlacements,
    selectedPlacementKeys,
    togglePlacement,
    toggleGroupAll,
    selectAllPlacements,
  } = usePlacementSelection(PLACEMENT_GROUPS);

  // Generate Variations via AI Layout Planner
  const handleGenerateVariations = async () => {
    if (!psdDocument) {
      showToast('먼저 PSD 템플릿을 업로드해주세요.', 'warning');
      return;
    }
    if (selectedPlacementKeys.length === 0) {
      showToast('베리에이션을 생성할 매체 규격을 1개 이상 선택해주세요.', 'warning');
      return;
    }

    setIsGenerating(true);
    setStatusMessage('Vision AI가 이미지 구도를 분석하여 지면별 최적 레이아웃 배치 중...');

    try {
      const res = await aiApi.generatePsdVariations(psdDocument.documentId, {
        target_placements: selectedPlacementKeys,
        instruction: instruction?.trim() || null,
        bucket_name: bucketName || null,
        page_name: pageName || 'playground',
      });

      const updatedDoc = res?.document || psdDocument;
      if (res?.document) {
        setPsdDocument(res.document);
      }

      const serverVariations = res?.data || [];
      const newPlans = {};
      const results = selectedPlacementKeys.map((key) => {
        const spec = PLACEMENT_SPECS_MAP.find((s) => s.key === key) || {};
        const vData = serverVariations.find((v) => v.key === key) || {};
        const headline = updatedDoc.layers?.find((l) => l.type === 'type' && l.text)?.text || updatedDoc.filename;
        const previewUrl = getArtifactUrl(vData.previewUrl || vData.storagePreviewUrl, bucketName, vData.revision || Date.now());
        const psdUrl = getArtifactUrl(vData.psdUrl, bucketName, vData.revision || Date.now());

        if (vData.layoutPlan) {
          newPlans[key] = vData.layoutPlan;
        }

        return {
          id: `${key}_${updatedDoc.documentId}_${vData.revision || 0}`,
          key,
          channel: spec.channel || 'Media',
          channelKey: spec.channelKey || 'meta',
          format: spec.format || key,
          width: vData.width || spec.width || 1080,
          height: vData.height || spec.height || 1080,
          aspectRatio: spec.aspectRatio || `${spec.width}:${spec.height}`,
          aspectClass: spec.aspectClass || 'ratio-1-1',
          previewUrl,
          imageUrl: previewUrl,
          psdUrl,
          filename: updatedDoc.filename,
          revision: vData.revision ?? updatedDoc.revision ?? 0,
          headline,
          subText: `${spec.format} 규격에 맞춘 AI 비전 레이아웃 베리에이션`,
          ctaText: '지금 확인하기',
          maxHeadLen: spec.maxHeadLen || 25,
          maxSubLen: spec.maxSubLen || 45,
          visualStrategy: `${spec.channel} (${spec.format}) 지면 규격에 최적화된 레이아웃 및 텍스트`,
          rationale: `Vision AI가 피사체와 여백을 분석하여 ${spec.channel} 규격 화면비에 맞게 레이어를 자동 재배치했습니다.`
        };
      });

      setPlacementPlans(newPlans);
      setGeneratedVariations(results);
      showToast(`총 ${results.length}개 규격의 AI 베리에이션이 생성되었습니다. 카드를 클릭해 레이어를 편집할 수 있습니다.`, 'success');
    } catch (err) {
      console.error('PSD variation generation failed:', err);
      const errMsg = err?.message || err?.detail || '서버 응답 오류가 발생했습니다.';
      showToast(`베리에이션 생성 실패: ${errMsg}`, 'error');
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  // Helper to update specific placement's plan
  const handleUpdatePlan = (placementKey, updates, targetLayerId) => {
    if (!placementKey || !targetLayerId) return;

    const currentList = placementPlans[placementKey]?.length > 0
      ? [...placementPlans[placementKey]]
      : (psdDocument?.layers || []).map((l) => ({
          id: l.id,
          x: l.bounds ? l.bounds[0] : 0,
          y: l.bounds ? l.bounds[1] : 0,
          scale: 1.0,
          visible: l.visible ?? true
        }));

    const idx = currentList.findIndex((p) => p.id === targetLayerId);
    if (idx >= 0) {
      currentList[idx] = { ...currentList[idx], ...updates };
    } else {
      currentList.push({ id: targetLayerId, ...updates });
    }

    setPlacementPlans((prev) => ({
      ...prev,
      [placementKey]: currentList
    }));
  };

  // Re-render current placement with manual tweaks
  const handleApplyPlacementAdjust = async (placementKey) => {
    if (!psdDocument || !placementKey) return;
    setIsAdjusting(true);
    try {
      const planToSend = placementPlans[placementKey] || [];
      const res = await aiApi.adjustPsdPlacementVariation(psdDocument.documentId, placementKey, {
        layout_plan: planToSend,
        bucket_name: bucketName || null
      });

      if (res?.data) {
        const updatedV = res.data;
        const newPreview = getArtifactUrl(updatedV.previewUrl || updatedV.storagePreviewUrl, bucketName, Date.now());
        const newPsd = getArtifactUrl(updatedV.psdUrl, bucketName, Date.now());

        setGeneratedVariations((prev) =>
          prev.map((v) => {
            if (v.key === placementKey) {
              return {
                ...v,
                previewUrl: newPreview,
                imageUrl: newPreview,
                psdUrl: newPsd,
                revision: updatedV.revision ?? v.revision
              };
            }
            return v;
          })
        );

        if (editingModalItem && editingModalItem.key === placementKey) {
          setEditingModalItem((prev) => ({
            ...prev,
            previewUrl: newPreview,
            imageUrl: newPreview,
            psdUrl: newPsd,
          }));
        }

        showToast('해당 지면의 레이아웃이 성공적으로 재렌더링되었습니다.', 'success');
      }
    } catch (err) {
      console.error('Adjust failed:', err);
      showToast(`레이아웃 재렌더링 실패: ${err.message || '서버 오류'}`, 'error');
    } finally {
      setIsAdjusting(false);
    }
  };

  // AI Image Regenerate Handler for current placement
  const handleRegenerateLayerImage = async (placementKey, layerId, promptText) => {
    if (!psdDocument || !placementKey || !layerId) return;
    setIsRegeneratingImage(true);
    try {
      showToast('해당 지면 비율에 맞춘 AI 이미지를 생성하고 있습니다...', 'warning');
      const res = await aiApi.regeneratePsdPlacementLayerImage(psdDocument.documentId, placementKey, {
        layer_id: layerId,
        prompt: promptText?.trim() || null,
        bucket_name: bucketName || null,
        page_name: pageName || 'playground',
      });

      if (res?.data) {
        const updatedV = res.data;
        const newPreview = getArtifactUrl(updatedV.previewUrl || updatedV.storagePreviewUrl, bucketName, Date.now());
        const newPsd = getArtifactUrl(updatedV.psdUrl, bucketName, Date.now());

        setGeneratedVariations((prev) =>
          prev.map((v) => {
            if (v.key === placementKey) {
              return {
                ...v,
                previewUrl: newPreview,
                imageUrl: newPreview,
                psdUrl: newPsd,
              };
            }
            return v;
          })
        );

        if (editingModalItem && editingModalItem.key === placementKey) {
          setEditingModalItem((prev) => ({
            ...prev,
            previewUrl: newPreview,
            imageUrl: newPreview,
            psdUrl: newPsd,
          }));
        }

        showToast('해당 지면의 이미지 레이어가 AI 이미지로 성공적으로 교체되었습니다!', 'success');
      }
    } catch (err) {
      console.error('Image regenerate failed:', err);
      showToast(`AI 이미지 재생성 실패: ${err.message || '서버 오류'}`, 'error');
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  const handleDownloadPng = (item) => {
    if (!item.previewUrl && !item.imageUrl) return;
    const link = document.createElement('a');
    link.href = item.previewUrl || item.imageUrl;
    link.download = `${item.channelKey}_${item.key}_r${item.revision}.png`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDownloadPsd = (item) => {
    if (!item.psdUrl) return;
    const link = document.createElement('a');
    link.href = item.psdUrl;
    link.download = `${item.channelKey}_${item.key}_r${item.revision}.psd`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleBatchDownloadPng = () => {
    generatedVariations.forEach((item, index) => {
      setTimeout(() => handleDownloadPng(item), index * 200);
    });
  };

  const handleBatchDownloadPsd = () => {
    generatedVariations.forEach((item, index) => {
      setTimeout(() => handleDownloadPsd(item), index * 200);
    });
  };

  return (
    <main className={`variation-studio-main${embedded ? ' embedded' : ''}`}>
      <div className={`variation-container${embedded ? ' embedded' : ''}`}>
        {/* 좌측 설정 제어판 */}
        <PsdSetupPanel
          document={psdDocument}
          onDocumentChange={(doc) => {
            setPsdDocument(doc);
            if (!doc) setGeneratedVariations([]);
          }}
          pageName={pageName}
          bucketName={bucketName}
          placementGroups={PLACEMENT_GROUPS}
          selectedPlacements={selectedPlacements}
          selectedCount={selectedPlacementKeys.length}
          onTogglePlacement={togglePlacement}
          onToggleGroupAll={toggleGroupAll}
          onSelectAll={selectAllPlacements}
          instruction={instruction}
          setInstruction={setInstruction}
          onGenerate={handleGenerateVariations}
          isGenerating={isGenerating}
        />

        {/* 우측 소재 결과 그리드 화면 */}
        <div className="preview-panel glass-card">
          <div className="panel-header">
            <div>
              <h3>생성된 PSD 매체별 베리에이션</h3>
              {generatedVariations.length > 0 && (
                <p className="psd-panel-subtitle">
                  마스터 파일: {psdDocument?.filename} · <strong>{generatedVariations.length}개</strong> 규격 (카드를 클릭하면 레이어 편집 팝업이 열립니다)
                </p>
              )}
            </div>

            {generatedVariations.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-batch-download"
                  onClick={handleBatchDownloadPng}
                  title="선택된 모든 규격의 PNG 다운로드"
                >
                  <span className="material-symbols-outlined">download</span>
                  PNG 전체
                </button>
                <button
                  type="button"
                  className="btn-batch-psd"
                  onClick={handleBatchDownloadPsd}
                  title="선택된 모든 규격의 PSD 다운로드"
                >
                  <span className="material-symbols-outlined">layers</span>
                  PSD 전체
                </button>
              </div>
            )}
          </div>

          <div className="preview-body">
            {isGenerating ? (
              <div className="processing-overlay">
                <div className="lottie-loader">
                  <div className="pulse-circle" />
                  <div className="pulse-circle-outer" />
                  <span className="material-symbols-outlined ai-processing-icon">auto_awesome</span>
                </div>
                <h4>Vision AI 레이아웃 최적 배치 중</h4>
                <p className="process-status-text">{statusMessage}</p>
              </div>
            ) : generatedVariations.length > 0 ? (
              /* 첫 화면: 모든 매체 카드가 상단에 매체명을 달고 정렬되는 비주얼 그리드 */
              <div className="visual-hero-grid">
                {generatedVariations.map((item) => (
                  <PsdVariationCard
                    key={item.id}
                    item={item}
                    onEdit={(selectedItem) => setEditingModalItem(selectedItem)}
                    onDownloadPng={handleDownloadPng}
                    onDownloadPsd={handleDownloadPsd}
                  />
                ))}
              </div>
            ) : psdDocument ? (
              /* PSD 업로드 후 생성 전 대기 화면 */
              <div className="preview-placeholder psd-placeholder">
                <span className="material-symbols-outlined placeholder-icon animate-pulse" style={{ color: '#7c3aed' }}>
                  auto_awesome_motion
                </span>
                <h4>Vision AI 기반 매체별 PSD 베리에이션</h4>
                <p>
                  업로드된 <strong>{psdDocument.filename}</strong>의 이미지 구도와 여백을 Vision AI가 분석하여<br />
                  선택한 <strong>{selectedPlacementKeys.length}개 규격</strong>에 맞게 인물/피사체를 가리지 않는 최적 레이아웃으로 자동 배치합니다.
                </p>
                <button
                  type="button"
                  className="btn-generate-variation"
                  style={{ maxWidth: '340px', margin: '16px auto 0' }}
                  onClick={handleGenerateVariations}
                  disabled={selectedPlacementKeys.length === 0 || isGenerating}
                >
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <span>{selectedPlacementKeys.length}개 규격으로 AI 자동 배치 생성</span>
                </button>
              </div>
            ) : (
              /* 최초 미업로드 플레이스홀더 */
              <div className="preview-placeholder psd-placeholder">
                <span className="material-symbols-outlined placeholder-icon">layers</span>
                <h4>PSD 템플릿을 선택해주세요</h4>
                <p>왼쪽에서 PSD 파일과 생성할 미디어 규격을 선택하면 Vision AI가 최적 구도로 베리에이션합니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 레이어 편집 & 미세조정 팝업 모달 */}
      {editingModalItem && (
        <PsdLayerEditorModal
          item={editingModalItem}
          allVariations={generatedVariations}
          onSelectVariation={(newKey) => {
            const found = generatedVariations.find((v) => v.key === newKey);
            if (found) setEditingModalItem(found);
          }}
          psdDocument={psdDocument}
          activePlan={placementPlans[editingModalItem.key] || []}
          onUpdatePlan={handleUpdatePlan}
          onApplyAdjust={handleApplyPlacementAdjust}
          onRegenerateImage={handleRegenerateLayerImage}
          isAdjusting={isAdjusting}
          isRegeneratingImage={isRegeneratingImage}
          onClose={() => setEditingModalItem(null)}
          onDownloadPng={handleDownloadPng}
          onDownloadPsd={handleDownloadPsd}
        />
      )}

      {/* 토스트 알림 */}
      {toast.show && (
        <div className="studio-toast-container">
          <div className={`studio-toast ${toast.type}`}>
            <span className="material-symbols-outlined studio-toast-icon">
              {toast.type === 'success' ? 'check_circle' : toast.type === 'warning' ? 'warning' : 'error'}
            </span>
            <span className="studio-toast-message">{toast.message}</span>
            <button
              type="button"
              className="studio-toast-close"
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default PsdVariationTab;
