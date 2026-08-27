import React, { useState } from 'react';
import Cookies from 'js-cookie';
import '../../../styles/VariationStudioView.css';

import ImageSeedUploader from '../../common/ImageSeedUploader';
import VariationHeroCard from '../VariationHeroCard';
import VariationDetailModal from '../VariationDetailModal';

function AiVariationTab({ embedded = false }) {
  const [sourceImage, setSourceImage] = useState('');
  const [filePreview, setFilePreview] = useState('');
  const [sourceCopy, setSourceCopy] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const activeImage = sourceImage || filePreview || null;

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [variations, setVariations] = useState([]);
  const [selectedModalItem, setSelectedModalItem] = useState(null);
  const [viewMode, setViewMode] = useState('visual');
  const [seedMode, setSeedMode] = useState('concept');

  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const clearSeedImage = () => {
    setSourceImage('');
    setFilePreview('');
  };

  const handleGenerateVariations = async () => {
    if (!sourceCopy || !sourceCopy.trim()) {
      showToast('베리에이션을 생성할 메인 메시지 또는 카피를 입력해주세요.', 'warning');
      return;
    }

    setIsLoading(true);
    setStatusMessage(
      activeImage
        ? '시드 이미지와 지시어를 바탕으로 AI 배너 베리에이션을 생성 중입니다...'
        : '메시지 및 지시어를 바탕으로 AI 소재를 생성 중입니다...'
    );

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const token = Cookies.get('Authorization');

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/variation/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          source_copy: sourceCopy,
          source_image_url: activeImage,
          seed_mode: seedMode,
          custom_prompt: customPrompt || null
        })
      });

      if (!response.ok) {
        throw new Error(`서버 응답 오류 (${response.status})`);
      }

      const resData = await response.json();
      if (resData.status === 'success' && resData.data && resData.data.length > 0) {
        setVariations(resData.data);
        showToast('AI 베리에이션 생성이 완료되었습니다.', 'success');
      } else {
        throw new Error(resData.message || '소재 생성 실패');
      }
    } catch (err) {
      console.error('Failed to generate variations:', err);
      showToast(`베리에이션 생성 실패: ${err.message || '서버 응답 없음'}`, 'error');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const handleDownloadItem = (item) => {
    if (!item.imageUrl) return;
    const link = document.createElement('a');
    link.href = item.imageUrl;
    link.download = `${item.placementKey || item.channelKey || 'variation'}.png`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSaveItem = (item) => {
    showToast(`'${item.headline}' 소재가 라이브러리에 저장되었습니다.`, 'success');
  };

  return (
    <main className={`variation-studio-main${embedded ? ' embedded' : ''}`}>
      <div className={`variation-container${embedded ? ' embedded' : ''}`}>
        {/* 좌측 설정 제어판 */}
        <div className="control-panel glass-card">
          <div className="panel-header">
            <h3>AI 소재 생성</h3>
            <span className="variation-badge">Variation AI v1</span>
          </div>

          <div className="panel-scroll-content">
            {/* 1. 참조(시드) 이미지 추가 */}
            <div className="control-group">
              <div className="group-title-wrapper">
                <label className="group-title label-with-tooltip">
                  1. 참조(시드) 이미지 추가 (선택)
                  <span className="tooltip-wrap">
                    <span className="material-symbols-outlined info-icon">help_outline</span>
                    <span className="tooltip-content">
                      참고할 시드 이미지가 있다면 업로드하거나 URL을 입력하세요. 무드/컨셉 참조 또는 구도 보존 모드를 선택할 수 있습니다.
                    </span>
                  </span>
                </label>
              </div>
              <ImageSeedUploader
                activeImage={activeImage}
                sourceImage={sourceImage}
                setSourceImage={setSourceImage}
                filePreview={filePreview}
                setFilePreview={setFilePreview}
                onClear={clearSeedImage}
                seedMode={seedMode}
                setSeedMode={setSeedMode}
                modeBadges={true}
                label={null}
              />
            </div>

            {/* 2. 메인 메시지 및 광고 카피 입력 */}
            <div className="control-group">
              <div className="group-title-wrapper">
                <label className="group-title label-with-tooltip">
                  2. 메인 메시지 및 카피 입력
                  <span className="tooltip-wrap">
                    <span className="material-symbols-outlined info-icon">help_outline</span>
                    <span className="tooltip-content">
                      배너에 표시할 핵심 광고 카피와 이미지 연출 요청사항(예: '밝은 톤, 20대 타겟')을 자유롭게 작성하세요.
                    </span>
                  </span>
                </label>
              </div>
              <textarea
                value={sourceCopy}
                onChange={(e) => setSourceCopy(e.target.value)}
                placeholder="광고 메시지 카피 및 연출 지시사항을 자유롭게 입력하세요... (예: '강아지의 날 50% 역대급 특가 대전', '밝은 분위기의 20대 여성 타겟 연출')"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  resize: 'none'
                }}
              />
            </div>

            {/* 3. 프롬프트 세부 지시 (선택) */}
            <div className="control-group">
              <label className="group-title label-with-tooltip">
                3. 프롬프트 세부 지시 (선택)
                <span className="tooltip-wrap">
                  <span className="material-symbols-outlined info-icon">help_outline</span>
                  <span className="tooltip-content">
                    AI가 베리에이션을 생성할 때 특별히 강조하거나 포함해야 할 추가 텍스트/스타일 요청사항을 입력하세요.
                  </span>
                </span>
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="예: '블루 앤 오렌지 브랜드 컬러 사용', '30대 신혼부부 겨냥', '심플하고 깨끗한 그래픽 요소 강조'"
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
            </div>

          </div>

          {/* 하단 양산 실행 버튼 */}
          <div className="panel-footer">
            <button
              className={`generate-btn ${isLoading ? 'loading' : ''}`}
              onClick={handleGenerateVariations}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="btn-loading-content">
                  <div className="spinner-white" />
                  <span>소재 일괄 양산 중...</span>
                </div>
              ) : (
                <div className="btn-content">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <span>AI 소재 생성</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* 우측 소재 결과 및 미리보기 캔버스 */}
        <div className="preview-panel glass-card">
          <div className="panel-header">
            <h3>생성된 AI 소재</h3>
            {variations.length > 0 && (
              <div className="view-mode-toggle">
                <span className="variation-count-pill">총 <strong>{variations.length}개</strong>의 지면 소재 생성 완료</span>
                <button
                  className={`btn-view-toggle ${viewMode === 'visual' ? 'active' : ''}`}
                  onClick={() => setViewMode('visual')}
                >
                  비주얼 카드
                </button>
                <button
                  className={`btn-view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  스펙 리스트
                </button>
              </div>
            )}
          </div>

          <div className="preview-body">
            {isLoading ? (
              <div className="processing-overlay">
                <div className="lottie-loader">
                  <div className="pulse-circle" />
                  <div className="pulse-circle-outer" />
                  <span className="material-symbols-outlined ai-processing-icon">auto_awesome</span>
                </div>
                <h4>선택된 매체 규격별 AI 소재 양산 중</h4>
                <p className="process-status-text">{statusMessage}</p>
              </div>
            ) : variations.length > 0 ? (
              viewMode === 'visual' ? (
                /* 1. 비주얼 히어로 카드 그리드 뷰 */
                <div className="visual-hero-grid">
                  {variations.map((item) => (
                    <VariationHeroCard
                      key={item.id || item.placementKey}
                      item={item}
                      onZoom={setSelectedModalItem}
                      onDownload={handleDownloadItem}
                      onSave={handleSaveItem}
                    />
                  ))}
                </div>
              ) : (
                /* 2. 상세 스펙 리스트 뷰 */
                <div className="variations-results-list">
                  {variations.map((item) => {
                    const hLen = item.headline ? item.headline.length : 0;
                    const sLen = item.subText ? item.subText.length : 0;
                    const maxH = item.maxHeadLen || 25;
                    const maxS = item.maxSubLen || 45;
                    const isCompliant = hLen <= maxH && sLen <= maxS;

                    return (
                      <div key={item.id || item.placementKey} className="variation-result-card">
                        <div className="result-card-header">
                          <div className="header-left">
                            <span className={`variation-tag ${item.channelKey}`}>{item.channel}</span>
                            <span className="format-title">{item.format}</span>
                          </div>
                          <span className={`char-count-badge ${isCompliant ? 'valid' : 'invalid'}`}>
                            헤드라인 {hLen}/{maxH}자 · 본문 {sLen}/{maxS}자 ({isCompliant ? '규격 준수' : '규격 초과'})
                          </span>
                        </div>

                        <div className="result-card-body">
                          <div className="body-thumb" onClick={() => setSelectedModalItem(item)}>
                            <img src={item.imageUrl} alt={item.headline} />
                            <div className="thumb-zoom-overlay">
                              <span className="material-symbols-outlined">zoom_in</span>
                            </div>
                          </div>
                          <div className="body-details">
                            <h4 className="headline-text">{item.headline}</h4>
                            <p className="sub-text">{item.subText}</p>
                            <div className="cta-row">
                              <span className="cta-chip">버튼 CTA: <strong>{item.ctaText}</strong></span>
                            </div>
                          </div>
                          <div className="body-actions">
                            <button
                              className="btn-card-action download"
                              onClick={() => handleDownloadItem(item)}
                            >
                              <span className="material-symbols-outlined">download</span>
                              <span>다운로드</span>
                            </button>
                            <button
                              className="btn-card-action save"
                              onClick={() => handleSaveItem(item)}
                            >
                              <span className="material-symbols-outlined">bookmark</span>
                              <span>저장</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* 최초 플레이스홀더 */
              <div className="preview-placeholder">
                <span className="material-symbols-outlined placeholder-icon animate-pulse">view_carousel</span>
                <h4>AI 소재 생성 대기 중</h4>
                <p>좌측에서 광고 메시지와 톤앤매너를 설정하고 실행하면 AI가 배너와 카피를 생성합니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 상세 보기 및 추천 리포트 모달 */}
      <VariationDetailModal
        item={selectedModalItem}
        activeImage={activeImage}
        onClose={() => setSelectedModalItem(null)}
        onDownload={handleDownloadItem}
      />

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

export default AiVariationTab;
