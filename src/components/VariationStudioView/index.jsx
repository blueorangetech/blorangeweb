import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import '../../styles/VariationStudioView.css';

import ImageSeedUploader from '../common/ImageSeedUploader';
import ToneSelectorGrid from './ToneSelectorGrid';
import PlacementGroupSelector from './PlacementGroupSelector';
import VariationHeroCard from './VariationHeroCard';
import VariationDetailModal from './VariationDetailModal';
import { PLACEMENT_SPECS_MAP, PLACEMENT_GROUPS } from './specs';

function VariationStudioView() {
  const [sourceImage, setSourceImage] = useState('');
  const [filePreview, setFilePreview] = useState('');
  const [sourceCopy, setSourceCopy] = useState('');
  const [selectedTone, setSelectedTone] = useState('benefit');
  const [customPrompt, setCustomPrompt] = useState('');

  const activeImage = sourceImage || filePreview || null;

  const [selectedPlacements, setSelectedPlacements] = useState({
    meta_feed_1_1: false,
    meta_feed_4_5: false,
    meta_reels_9_16: false,
    tiktok_story_9_16: false,
    tiktok_feed_1_1: false,
    naver_smart_4_7: false,
    naver_feed_1_1: false,
    naver_main_2_2: false,
    naver_feed_2_3: false,
    google_landscape_1_91: false,
    google_square_1_1: false,
    google_shorts_9_16: false,
    kakao_bizboard_2_1: false,
    kakao_feed_1_1: false,
    kakao_display_2_1: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [variations, setVariations] = useState([]);
  const [selectedModalItem, setSelectedModalItem] = useState(null);
  const [viewMode, setViewMode] = useState('visual');
  const [seedMode, setSeedMode] = useState('concept');
  const [showSeedUploader, setShowSeedUploader] = useState(false);

  useEffect(() => {
    if (activeImage) {
      setShowSeedUploader(true);
    }
  }, [activeImage]);

  const togglePlacement = (id) => {
    setSelectedPlacements((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleGroupAll = (group) => {
    const allSelected = group.placements.every((p) => selectedPlacements[p.id]);
    const nextState = !allSelected;
    setSelectedPlacements((prev) => {
      const updated = { ...prev };
      group.placements.forEach((p) => {
        updated[p.id] = nextState;
      });
      return updated;
    });
  };

  const selectAllPlacementsQuickly = () => {
    const allTrue = {};
    PLACEMENT_GROUPS.forEach((g) => {
      g.placements.forEach((p) => {
        allTrue[p.id] = true;
      });
    });
    setSelectedPlacements(allTrue);
  };

  const clearSeedImage = () => {
    setSourceImage('');
    setFilePreview('');
  };

  const handleGenerateVariations = async () => {
    if (!sourceCopy || !sourceCopy.trim()) {
      alert('베리에이션을 생성할 메인 메시지 또는 카피를 입력해주세요.');
      return;
    }

    const activePlacementKeys = Object.keys(selectedPlacements).filter((k) => selectedPlacements[k]);
    if (activePlacementKeys.length === 0) {
      alert('최소 하나 이상의 타겟 광고 지면 및 규격을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setStatusMessage(
      activeImage
        ? '시드 이미지와 지시어를 바탕으로 AI 배너 베리에이션을 생성 중입니다...'
        : '메시지 및 톤앤매너를 바탕으로 AI가 지면별 소재를 일괄 생성 중입니다...'
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
          tone: selectedTone,
          custom_prompt: customPrompt || null,
          target_placements: activePlacementKeys
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const resData = await response.json();
      if (resData.status === 'success' && resData.data && resData.data.length > 0) {
        setVariations(resData.data);
      } else {
        throw new Error(resData.message || '소재 생성 실패');
      }
    } catch (err) {
      console.error('Failed to generate variations:', err);
      alert('베리에이션 생성 중 오류가 발생했습니다: ' + (err.message || '서버 응답 없음'));
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const handleDownloadItem = (item) => {
    alert(`'${item.headline}' 소재 고화질 배너 다운로드가 시작되었습니다.`);
  };

  const handleSaveItem = (item) => {
    alert(`'${item.headline}' 소재가 라이브러리에 저장되었습니다.`);
  };

  return (
    <main className="variation-studio-main">
      <div className="variation-container">
        {/* 좌측 설정 제어판 */}
        <div className="control-panel glass-card">
          <div className="panel-header">
            <h3>AI 소재 베리에이션 센터</h3>
            <span className="variation-badge">Variation AI v1</span>
          </div>

          <div className="panel-scroll-content">
            {/* 1. 메인 메시지, 연출 지시어 및 시드 이미지 통합 설정 */}
            <div className="control-group">
              <div className="group-title-wrapper">
                <label className="group-title label-with-tooltip">
                  1. 메인 메시지 및 참조 이미지 설정
                  <span className="tooltip-wrap">
                    <span className="material-symbols-outlined info-icon">help_outline</span>
                    <span className="tooltip-content">
                      배너에 표시할 핵심 광고 카피와 이미지 연출 요청사항(예: '밝은 톤, 20대 타겟')을 자유롭게 작성하고, 참고할 시드 이미지가 있다면 업로드 후 활용 모드를 선택하세요.
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
                  resize: 'none',
                  marginBottom: '10px'
                }}
              />

              {/* 상시 노출 AI 동작 모드 상태 배지 */}
              <div style={{
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                background: activeImage ? '#eff6ff' : '#f0fdf4',
                color: activeImage ? '#1d4ed8' : '#15803d',
                border: activeImage ? '1px solid #bfdbfe' : '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {activeImage ? (seedMode === 'layout' ? 'dashboard' : 'palette') : 'auto_fix_high'}
                </span>
                <span style={{ lineHeight: 1.4 }}>
                  {activeImage ? (
                    seedMode === 'layout' ? (
                      <>
                        <strong style={{ fontWeight: 700 }}>구도 보존 모드</strong><br />
                        시드 이미지의 그래픽 배치와 구조를 기반으로 소재 베리에이션 생성
                      </>
                    ) : (
                      <>
                        <strong style={{ fontWeight: 700 }}>컨셉 참조 모드</strong><br />
                        시드 이미지의 무드, 톤앤매너, 오브젝트를 참고하여 맞춤 비주얼 생성
                      </>
                    )
                  ) : (
                    <>
                      <strong style={{ fontWeight: 700 }}>메시지 전용 AI 모드</strong><br />
                      입력된 카피 메시지를 분석하여 지면별 맞춤 그래픽 레이아웃 및 텍스트 자동 양산
                    </>
                  )}
                </span>
              </div>

              {/* 접이식 참조 시드 이미지 업로더 패널 */}
              <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowSeedUploader(!showSeedUploader)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#2563eb',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: showSeedUploader ? '10px' : 0
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {showSeedUploader ? 'indeterminate_check_box' : 'add_box'}
                  </span>
                  <span>{showSeedUploader ? '참조 이미지 선택 닫기' : '참조(시드) 이미지 추가하기'}</span>
                </button>

                {showSeedUploader && (
                  <div className="anim-fade" style={{ marginTop: '6px' }}>
                    <ImageSeedUploader
                      sourceImage={sourceImage}
                      setSourceImage={setSourceImage}
                      filePreview={filePreview}
                      setFilePreview={setFilePreview}
                    />

                    {activeImage && (
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>활용 방식:</span>
                        <button
                          type="button"
                          className={`seed-mode-btn ${seedMode === 'concept' ? 'active' : ''}`}
                          onClick={() => setSeedMode('concept')}
                        >
                          🎨 컨셉/무드 참조
                        </button>
                        <button
                          type="button"
                          className={`seed-mode-btn ${seedMode === 'layout' ? 'active' : ''}`}
                          onClick={() => setSeedMode('layout')}
                        >
                          📐 레이아웃/구도 보존
                        </button>
                        <button
                          type="button"
                          onClick={clearSeedImage}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            marginLeft: 'auto',
                            textDecoration: 'underline'
                          }}
                        >
                          지우기
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 2. 톤앤매너 프레임워크 선택 */}
            <div className="control-group">
              <div className="group-title-wrapper">
                <label className="group-title label-with-tooltip">
                  2. 톤앤매너 및 소구 포인트 지정
                  <span className="tooltip-wrap">
                    <span className="material-symbols-outlined info-icon">help_outline</span>
                    <span className="tooltip-content">
                      타겟 광고주의 소구 방식에 따라 혜택, 감성, 트렌드, 긴급 마감 등 카피 스타일 톤앤매너를 선택합니다.
                    </span>
                  </span>
                </label>
              </div>
              <ToneSelectorGrid
                selectedTone={selectedTone}
                setSelectedTone={setSelectedTone}
              />
            </div>

            {/* 3. 추가 연출 지시 프롬프트 (선택) */}
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

            {/* 4. 타겟 광고 매체 & 지면 멀티 선택 */}
            <div className="control-group">
              <div className="group-title-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="group-title label-with-tooltip" style={{ margin: 0 }}>
                  4. 생성 타겟 매체 및 지면 규격
                  <span className="tooltip-wrap">
                    <span className="material-symbols-outlined info-icon">help_outline</span>
                    <span className="tooltip-content">
                      AI 배너를 자동 생성할 광고 매체 및 배너 규격을 선택하세요. 각 규격의 글자수 제한 스펙에 맞춤 양산됩니다.
                    </span>
                  </span>
                </label>
                <button
                  type="button"
                  className="btn-select-all-quick"
                  onClick={selectAllPlacementsQuickly}
                >
                  ⚡ 전체 지면 일괄 선택
                </button>
              </div>

              <PlacementGroupSelector
                placementGroups={PLACEMENT_GROUPS}
                selectedPlacements={selectedPlacements}
                togglePlacement={togglePlacement}
                toggleGroupAll={toggleGroupAll}
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
                  <span>지면별 AI 소재 일괄 생성</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* 우측 소재 결과 및 미리보기 캔버스 */}
        <div className="preview-panel glass-card">
          <div className="panel-header">
            <h3>생성된 AI 배너 베리에이션</h3>
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
                <h4>지면별 AI 소재 양산 대기 중</h4>
                <p>좌측에서 광고 메시지 카피와 타겟 매체/지면을 선택하고 실행 버튼을 누르시면, 매체 가이드라인에 최적화된 배너 및 카피가 일괄 생성됩니다.</p>
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
    </main>
  );
}

export default VariationStudioView;
