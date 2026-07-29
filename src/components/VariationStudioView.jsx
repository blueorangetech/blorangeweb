import React, { useState, useRef } from 'react';
import '../styles/VariationStudioView.css';

// 테스트용 샘플 소재 이미지 프리셋
const SAMPLE_VARIATIONS = [
  {
    id: 1,
    channel: 'Meta (Instagram)',
    channelKey: 'meta',
    format: '1:1 Square (1080x1080)',
    headline: '✨ 오직 이번 주만! 시그니처 가구 특별 할인',
    subText: '감성 인테리어의 완성을 위한 단 하나의 선택. 최대 40% 혜택을 놓치지 마세요.',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop',
    ctaText: '지금 구매하기'
  },
  {
    id: 2,
    channel: 'TikTok',
    channelKey: 'tiktok',
    format: '9:16 Vertical Story (1080x1920)',
    headline: '🔥 요즘 SNS에서 인기를 끄는 트렌디 미니멀 룸',
    subText: '공간이 확 넓어 보이는 마법의 스튜디오 레이아웃 컬렉션.',
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop',
    ctaText: '자세히 보기'
  },
  {
    id: 3,
    channel: 'Naver GFA',
    channelKey: 'naver',
    format: '4:3 Banner (1200x900)',
    headline: '집 분위기를 바꾸는 가장 쉬운 선택',
    subText: '전문 디자이너 큐레이션 가구 라인업. 무료 배송 & 전문 기사 방문 설치.',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop',
    ctaText: '혜택 확인하기'
  },
  {
    id: 4,
    channel: 'Google AC',
    channelKey: 'google',
    format: '16:9 Landscape (1920x1080)',
    headline: '공간의 미학을 완성하는 모던 인테리어',
    subText: '따뜻한 감성과 세련된 라인의 만남. 신규 회원 전용 추가 할인 쿠폰 제공.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&auto=format&fit=crop',
    ctaText: '쿠폰 받기'
  }
];

function VariationStudioView() {
  const [sourceImage, setSourceImage] = useState('');
  const [sourceCopy, setSourceCopy] = useState('세련된 모던 인테리어 컬렉션 타임 세일 진행 중');
  const [selectedTone, setSelectedTone] = useState('benefit'); // 'benefit', 'emotional', 'social', 'urgency'
  const [selectedChannels, setSelectedChannels] = useState({
    meta: true,
    tiktok: true,
    naver: true,
    google: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [variations, setVariations] = useState(SAMPLE_VARIATIONS);

  const fileInputRef = useRef(null);

  const handleChannelToggle = (channelKey) => {
    setSelectedChannels(prev => ({
      ...prev,
      [channelKey]: !prev[channelKey]
    }));
  };

  const handleGenerateVariations = async () => {
    setIsLoading(true);
    setStatusMessage('AI 베리에이션 엔진이 매체별 최적 멀티 소재를 생성 중입니다...');

    try {
      // 가상 베리에이션 생성 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500));

      const tonePrefixes = {
        benefit: '[초특가 혜택]',
        emotional: '[감성 라이프스타일]',
        social: '[SNS 대세 아이템]',
        urgency: '[마감 임박]'
      };

      const updatedVariations = SAMPLE_VARIATIONS.map(item => ({
        ...item,
        headline: `${tonePrefixes[selectedTone] || ''} ${item.headline.replace(/^\[.*?\]\s*/, '')}`
      }));

      setVariations(updatedVariations);
    } catch (err) {
      console.error('Variation generation error:', err);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
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
            {/* 1. 시드 이미지 / 카피 입력 */}
            <div className="control-group">
              <label className="group-title">1. 메인 메시지 / 카피 설정</label>
              <textarea
                value={sourceCopy}
                onChange={(e) => setSourceCopy(e.target.value)}
                placeholder="베리에이션을 생성할 핵심 광고 메시지나 카피를 입력하세요..."
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

            {/* 2. 톤앤매너 카피 프리셋 */}
            <div className="control-group">
              <label className="group-title">2. 카피 톤앤매너 (Tone & Manner)</label>
              <div className="preset-chips">
                {[
                  { id: 'benefit', label: '혜택/가격 강조형' },
                  { id: 'emotional', label: '감성/라이프스타일형' },
                  { id: 'social', label: '대중/트렌드 반응형' },
                  { id: 'urgency', label: '긴급/마감 임박형' },
                ].map(t => (
                  <button
                    key={t.id}
                    className={`preset-chip ${selectedTone === t.id ? 'active' : ''}`}
                    onClick={() => setSelectedTone(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 목표 광고 매체 선택 */}
            <div className="control-group">
              <label className="group-title">3. 타겟 광고 매체 & 규격 선택</label>
              <div className="format-checkbox-grid">
                {[
                  { id: 'meta', label: 'Meta (인스타그램)' },
                  { id: 'tiktok', label: 'TikTok (숏폼)' },
                  { id: 'naver', label: 'Naver GFA' },
                  { id: 'google', label: 'Google AC' },
                ].map(ch => (
                  <label key={ch.id} className="format-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedChannels[ch.id]}
                      onChange={() => handleChannelToggle(ch.id)}
                    />
                    <span>{ch.label}</span>
                  </label>
                ))}
              </div>
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
                  <span>멀티 베리에이션 파이프라인 작동 중...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <span>AI 멀티 베리에이션 일괄 생성</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 우측 베리에이션 결과 리스트 */}
        <div className="preview-panel glass-card">
          <div className="panel-header">
            <h3>생성된 베리에이션 결과 ({variations.length}개)</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              매체별 최적화 비율 & 카피 자동 매칭
            </span>
          </div>

          <div className="variation-grid">
            {variations.map(item => (
              <div key={item.id} className="variation-card">
                <div className="variation-card-header">
                  <span className={`variation-tag ${item.channelKey}`}>
                    {item.channel}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {item.format}
                  </span>
                </div>
                <div className="variation-image-wrapper">
                  <img src={item.imageUrl} alt={item.headline} />
                </div>
                <div className="variation-card-body">
                  <div className="variation-copy-headline">{item.headline}</div>
                  <div className="variation-copy-sub">{item.subText}</div>
                </div>
                <div className="variation-card-footer">
                  <button
                    className="btn-card-action"
                    onClick={() => alert(`'${item.headline}' 소재 다운로드가 시작되었습니다.`)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                    <span>다운로드</span>
                  </button>
                  <button
                    className="btn-card-action"
                    onClick={() => alert(`'${item.headline}' 소재가 대시보드 라이브러리에 저장되었습니다.`)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bookmark</span>
                    <span>저장</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}

export default VariationStudioView;
