import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import '../styles/VariationStudioView.css';

import ImageSeedUploader from './common/ImageSeedUploader';
import ToneSelectorGrid from './variation/ToneSelectorGrid';
import PlacementGroupSelector from './variation/PlacementGroupSelector';
import VariationHeroCard from './variation/VariationHeroCard';
import VariationDetailModal from './variation/VariationDetailModal';

// 매체별 타겟 규격 및 글자수 제한 스펙 정의
const PLACEMENT_SPECS_MAP = [
  // 1. Meta (Instagram / Facebook)
  { key: 'meta_feed_1_1', channel: 'Meta (Instagram)', channelKey: 'meta', aspectClass: 'ratio-1-1', maxHeadLen: 25, maxSubLen: 50, format: '피드 정방형 (1:1 - 1080x1080)' },
  { key: 'meta_feed_4_5', channel: 'Meta (Instagram)', channelKey: 'meta', aspectClass: 'ratio-4-5', maxHeadLen: 25, maxSubLen: 50, format: '피드 세로형 (4:5 - 1080x1350)' },
  { key: 'meta_reels_9_16', channel: 'Meta (Instagram)', channelKey: 'meta', aspectClass: 'ratio-9-16', maxHeadLen: 20, maxSubLen: 35, format: '릴스 / 스토리 전면 (9:16 - 1080x1920)' },

  // 2. TikTok
  { key: 'tiktok_story_9_16', channel: 'TikTok', channelKey: 'tiktok', aspectClass: 'ratio-9-16', maxHeadLen: 20, maxSubLen: 35, format: '숏폼 전면 (9:16 - 1080x1920)' },
  { key: 'tiktok_feed_1_1', channel: 'TikTok', channelKey: 'tiktok', aspectClass: 'ratio-1-1', maxHeadLen: 25, maxSubLen: 40, format: '피드 정사각형 (1:1 - 1080x1080)' },

  // 3. Naver GFA
  { key: 'naver_smart_4_7', channel: 'Naver GFA', channelKey: 'naver', aspectClass: 'ratio-4-7', maxHeadLen: 25, maxSubLen: 45, format: '스마트채널 (4.7:1 - 750x160)' },
  { key: 'naver_feed_1_1', channel: 'Naver GFA', channelKey: 'naver', aspectClass: 'ratio-1-1', maxHeadLen: 25, maxSubLen: 40, format: '네이티브 피드 (1:1 - 1200x1200)' },
  { key: 'naver_main_2_2', channel: 'Naver GFA', channelKey: 'naver', aspectClass: 'ratio-2-2', maxHeadLen: 20, maxSubLen: 35, format: '메인 배너 (2.23:1 - 1250x560)' },
  { key: 'naver_feed_2_3', channel: 'Naver GFA', channelKey: 'naver', aspectClass: 'ratio-2-3', maxHeadLen: 25, maxSubLen: 40, format: '네이티브 세로 피드 (2:3 - 1200x1800)' },

  // 4. Google AC / Ads
  { key: 'google_landscape_1_91', channel: 'Google AC', channelKey: 'google', aspectClass: 'ratio-1-91', maxHeadLen: 30, maxSubLen: 90, format: '디스플레이/YouTube (1.91:1 - 1200x628)' },
  { key: 'google_square_1_1', channel: 'Google AC', channelKey: 'google', aspectClass: 'ratio-1-1', maxHeadLen: 30, maxSubLen: 90, format: 'Play스토어/PMax (1:1 - 1200x1200)' },
  { key: 'google_shorts_9_16', channel: 'Google AC', channelKey: 'google', aspectClass: 'ratio-9-16', maxHeadLen: 25, maxSubLen: 45, format: 'YouTube Shorts (9:16 - 1080x1920)' },

  // 5. Kakao Moment
  { key: 'kakao_bizboard_2_1', channel: 'Kakao Moment', channelKey: 'kakao', aspectClass: 'ratio-2-1', maxHeadLen: 25, maxSubLen: 40, format: '카카오 비즈보드 (2.03:1 - 1029x507)' },
  { key: 'kakao_feed_1_1', channel: 'Kakao Moment', channelKey: 'kakao', aspectClass: 'ratio-1-1', maxHeadLen: 25, maxSubLen: 45, format: '톡피드 정방형 (1:1 - 1200x1200)' },
  { key: 'kakao_display_2_1', channel: 'Kakao Moment', channelKey: 'kakao', aspectClass: 'ratio-2-1', maxHeadLen: 30, maxSubLen: 60, format: '메인 와이드 배너 (2:1 - 1200x600)' }
];

const PLACEMENT_GROUPS = [
  {
    title: 'Meta / Instagram',
    channelKey: 'meta',
    placements: [
      { id: 'meta_feed_1_1', label: '피드 정방형 (1:1 - 1080x1080)' },
      { id: 'meta_feed_4_5', label: '피드 세로형 (4:5 - 1080x1350)' },
      { id: 'meta_reels_9_16', label: '릴스/스토리 (9:16 - 1080x1920)' }
    ]
  },
  {
    title: 'TikTok',
    channelKey: 'tiktok',
    placements: [
      { id: 'tiktok_story_9_16', label: '숏폼 전면 (9:16 - 1080x1920)' },
      { id: 'tiktok_feed_1_1', label: '피드 정방형 (1:1 - 1080x1080)' }
    ]
  },
  {
    title: 'Naver GFA',
    channelKey: 'naver',
    placements: [
      { id: 'naver_smart_4_7', label: '스마트채널 (4.7:1 - 750x160)' },
      { id: 'naver_feed_1_1', label: '네이티브 피드 (1:1 - 1200x1200)' },
      { id: 'naver_main_2_2', label: '메인 배너 (2.23:1 - 1250x560)' },
      { id: 'naver_feed_2_3', label: '세로 피드 (2:3 - 1200x1800)' }
    ]
  },
  {
    title: 'Google Ads',
    channelKey: 'google',
    placements: [
      { id: 'google_landscape_1_91', label: '가로형 배너 (1.91:1 - 1200x628)' },
      { id: 'google_square_1_1', label: '정방형 배너 (1:1 - 1200x1200)' },
      { id: 'google_shorts_9_16', label: 'YouTube Shorts (9:16 - 1080x1920)' }
    ]
  },
  {
    title: 'Kakao Moment',
    channelKey: 'kakao',
    placements: [
      { id: 'kakao_bizboard_2_1', label: '비즈보드 (2.03:1 - 1029x507)' },
      { id: 'kakao_feed_1_1', label: '톡피드 / 디스플레이 (1:1 - 1200x1200)' },
      { id: 'kakao_display_2_1', label: '메인 와이드 (2:1 - 1200x600)' }
    ]
  }
];

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
  const [viewMode, setViewMode] = useState('visual'); // 'visual' (default) or 'list'
  const [seedMode, setSeedMode] = useState('concept'); // 'concept' (톤앤매너/컨셉 참조) or 'layout' (구도/레이아웃 보존)
  const [showSeedUploader, setShowSeedUploader] = useState(false);

  useEffect(() => {
    if (activeImage) {
      setShowSeedUploader(true);
    }
  }, [activeImage]);

  const togglePlacement = (id) => {
    setSelectedPlacements(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleGroupAll = (group) => {
    const allSelected = group.placements.every(p => selectedPlacements[p.id]);
    const nextState = !allSelected;
    setSelectedPlacements(prev => {
      const updated = { ...prev };
      group.placements.forEach(p => {
        updated[p.id] = nextState;
      });
      return updated;
    });
  };

  const selectAllPlacementsQuickly = () => {
    const allTrue = {};
    PLACEMENT_GROUPS.forEach(g => {
      g.placements.forEach(p => {
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

    const activePlacementKeys = Object.keys(selectedPlacements).filter(k => selectedPlacements[k]);
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
          ...(token ? { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {})
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
                      메시지 및 톤앤매너 중심의 매체별 신규 비주얼 자동 생성
                    </>
                  )}
                </span>
              </div>

              {/* 참조 이미지 첨부 여부 가로 스위치 토글 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                margin: '8px 0 10px 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: showSeedUploader ? '#2563eb' : '#64748b' }}>
                    image
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                    참조 시드 이미지 첨부 (선택)
                  </span>
                </div>
                
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px',
                  cursor: 'pointer',
                  margin: 0
                }}>
                  <input
                    type="checkbox"
                    checked={showSeedUploader}
                    onChange={(e) => setShowSeedUploader(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0, margin: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: showSeedUploader ? '#2563eb' : '#cbd5e1',
                    transition: '0.3s ease',
                    borderRadius: '24px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: showSeedUploader ? '22px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      transition: '0.3s ease',
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </span>
                </label>
              </div>

              {showSeedUploader && (
                <ImageSeedUploader
                  activeImage={activeImage}
                  sourceImage={sourceImage}
                  setSourceImage={setSourceImage}
                  setFilePreview={setFilePreview}
                  onClear={clearSeedImage}
                  seedMode={seedMode}
                  setSeedMode={setSeedMode}
                  modeBadges={false}
                />
              )}
            </div>

            {/* 2. 카피 톤앤매너 (ToneSelectorGrid 모듈 활용) */}
            <div className="control-group">
              <div className="group-title-wrapper">
                <label className="group-title label-with-tooltip">
                  2. 카피 톤앤매너 (Tone & Manner)
                  <span className="tooltip-wrap">
                    <span className="material-symbols-outlined info-icon">help_outline</span>
                    <span className="tooltip-content">
                      AI가 광고 헤드라인 및 세부 카피를 작성할 때 강조할 분위기(혜택/가격, 감성, SNS 트렌드, 타임세일 마감 등)를 지정합니다.
                    </span>
                  </span>
                </label>
              </div>
              <ToneSelectorGrid
                selectedTone={selectedTone}
                setSelectedTone={setSelectedTone}
              />
            </div>

            {/* 3. 목표 광고 매체 및 지면/규격 선택 (PlacementGroupSelector 모듈 활용) */}
            <div className="control-group">
              <div className="group-title-wrapper">
                <label className="group-title label-with-tooltip">
                  3. 타겟 광고 매체 & 세부 지면 규격 선택
                  <span className="tooltip-wrap">
                    <span className="material-symbols-outlined info-icon">help_outline</span>
                    <span className="tooltip-content">
                      생성된 이미지와 카피를 노출할 매체(네이버, 메타, 구글, 틱톡) 및 비율 규격(1:1, 9:16, 스마트채널 등)을 선택하여 일괄 생성합니다.
                    </span>
                  </span>
                </label>
              </div>
              <PlacementGroupSelector
                placementGroups={PLACEMENT_GROUPS}
                selectedPlacements={selectedPlacements}
                togglePlacement={togglePlacement}
                toggleGroupAll={toggleGroupAll}
              />
            </div>
          </div>

          {/* 실행 버튼 */}
          <div className="panel-footer">
            <button
              className="btn-generate-variation"
              onClick={handleGenerateVariations}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner-purple" />
                  <span>이미지 생성 중...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <span>AI 베리에이션 생성</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 우측 베리에이션 결과 비주얼 갤러리 */}
        <div className="preview-panel glass-card">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3>생성된 크리에이티브 소재 - {variations.length}개</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="view-mode-toggle-group">
                <button
                  className={`btn-view-toggle ${viewMode === 'visual' ? 'active' : ''}`}
                  onClick={() => setViewMode('visual')}
                  title="비주얼 중심 크리에이티브 갤러리"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>grid_view</span>
                  <span>비주얼 갤러리</span>
                </button>
                <button
                  className={`btn-view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="리스트 뷰"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>view_list</span>
                  <span>리스트</span>
                </button>
              </div>

              <button
                className="btn-batch-download"
                onClick={() => alert('선택된 전체 소재 고화질 배너 일괄 다운로드가 시작되었습니다.')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download_for_offline</span>
                <span>전체 다운로드</span>
              </button>
            </div>
          </div>

          <div className="table-scroll-container">
            {variations.length === 0 ? (
              <div className="empty-state-welcome">
                <div className="welcome-hero-badge">
                  <div className="welcome-icon-box">
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </div>
                  <h3>AI 멀티 베리에이션</h3>
                  <p>
                    좌측 제어판에서 원하는 타겟 광고 지면과 규격을 선택하면,<br />
                    AI가 매체 규격과 자수 제한에 딱 맞춘 최적 크리에이티브 배너를 일괄 양산합니다.
                  </p>
                </div>

                <div className="welcome-action-box">
                  <button
                    className="btn-select-all-hero"
                    onClick={selectAllPlacementsQuickly}
                  >
                    <span className="material-symbols-outlined">checklist</span>
                    <span>전체 {PLACEMENT_SPECS_MAP.length}개 주요 지면 한 번에 선택하기</span>
                  </button>
                </div>

                <div className="welcome-guide-grid">
                  <div className="guide-card">
                    <div className="guide-step-tag">STEP 1</div>
                    <span className="material-symbols-outlined guide-icon">edit_note</span>
                    <h4>메시지 & 시드 이미지</h4>
                    <p>소구할 메시지와 톤앤매너, 브랜드 참조 이미지를 입력합니다.</p>
                  </div>

                  <div className="guide-card">
                    <div className="guide-step-tag">STEP 2</div>
                    <span className="material-symbols-outlined guide-icon">ads_click</span>
                    <h4>타겟 매체 지면 선택</h4>
                    <p>Meta, TikTok, Naver GFA, Google Ads, Kakao 중 타겟 지면을 체크합니다.</p>
                  </div>

                  <div className="guide-card">
                    <div className="guide-step-tag">STEP 3</div>
                    <span className="material-symbols-outlined guide-icon">rocket_launch</span>
                    <h4>AI 일괄 생성 실행</h4>
                    <p>이미지 생성 및 글자 수 준수 여부를 확인 할 수 있습니다.</p>
                  </div>
                </div>
              </div>
            ) : viewMode === 'visual' ? (

              /* --- 비주얼 중심 HERO 갤러리 뷰 (VariationHeroCard 모듈 활용) --- */
              <div className="visual-hero-grid">
                {variations.map(item => (
                  <VariationHeroCard
                    key={item.id}
                    item={item}
                    onZoom={(target) => setSelectedModalItem(target)}
                    onDownload={handleDownloadItem}
                    onSave={handleSaveItem}
                  />
                ))}
              </div>
            ) : (
              /* --- 테이블 리스트 뷰 --- */
              <table className="variation-table">
                <thead>
                  <tr>
                    <th style={{ width: '170px' }}>타겟 매체 / 규격</th>
                    <th style={{ width: '120px' }}>비주얼</th>
                    <th>AI 생성 카피라이팅 & 혜택 메시지</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>소재 관리</th>
                  </tr>
                </thead>
                <tbody>
                  {variations.map(item => (
                    <tr key={item.id}>
                      <td className="cell-channel">
                        <span className={`variation-tag ${item.channelKey}`}>
                          {item.channel}
                        </span>
                        <div className="format-spec-text">{item.format}</div>
                      </td>

                      <td className="cell-visual">
                        {item.hasError || !item.imageUrl ? (
                          <div style={{
                            padding: '8px',
                            background: '#fff1f2',
                            color: '#e11d48',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            border: '1px solid #fecdd3'
                          }}>
                            ⚠️ 생성 실패
                          </div>
                        ) : (
                          <div
                            className={`table-thumb-box ${item.aspectClass || item.channelKey}`}
                            onClick={() => setSelectedModalItem(item)}
                            title="클릭하여 크게 보기"
                          >
                            <img src={item.imageUrl} alt={item.headline} />
                            <div className="thumb-hover-overlay">
                              <span className="material-symbols-outlined">zoom_in</span>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="cell-copy">
                        <div className="table-copy-headline">{item.headline}</div>
                        <div className="table-copy-sub">{item.subText}</div>
                        <div className="table-copy-cta">
                          <span className="cta-tag">CTA: {item.ctaText}</span>
                        </div>
                      </td>

                      <td className="cell-actions">
                        <div className="action-button-group">
                          <button
                            className="btn-table-action download"
                            onClick={() => handleDownloadItem(item)}
                          >
                            <span className="material-symbols-outlined">download</span>
                            <span>다운로드</span>
                          </button>
                          <button
                            className="btn-table-action save"
                            onClick={() => handleSaveItem(item)}
                          >
                            <span className="material-symbols-outlined">bookmark</span>
                            <span>저장</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* 이미지 및 카피 상세 확대 팝업 모달 (VariationDetailModal 모듈 활용) */}
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
