import React from 'react';

function VariationDetailModal({ item, activeImage, onClose, onDownload }) {
  if (!item) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`variation-tag ${item.channelKey}`}>
              {item.channel}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.format}</span>
          </div>
          <button className="btn-modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-scroll-area">
          <div className="modal-body">
            <div className="modal-image-preview">
              <img src={item.imageUrl} alt={item.headline} />
            </div>
            <div className="modal-info-panel">
              <h3 className="modal-headline">{item.headline}</h3>
              <p className="modal-subtext">{item.subText}</p>
              <div className="modal-cta-box">
                <span className="cta-chip">권장 CTA 버튼: <strong>{item.ctaText}</strong></span>
              </div>
              <div className="modal-footer-actions">
                <button
                  className="btn-generate-variation"
                  onClick={() => {
                    onDownload(item);
                    onClose();
                  }}
                >
                  <span className="material-symbols-outlined">download</span>
                  <span>고화질 이미지 다운로드</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI 소재 기획 의도 및 지면 추천 리포트 섹션 */}
          <div className="modal-rationale-section">
            <div className="rationale-header">
              <span className="material-symbols-outlined" style={{ color: '#8b5cf6', fontSize: '22px' }}>psychology</span>
              <h4>AI 크리에이티브 기획 의도 & 지면 최적화 리포트</h4>
            </div>

            <div className="rationale-grid">
              <div className="rationale-card">
                <div className="rationale-card-title">
                  <span className="material-symbols-outlined" style={{ color: '#ec4899', fontSize: '18px' }}>palette</span>
                  <span>비주얼 구도 전략</span>
                </div>
                <p className="rationale-card-text">
                  {item.visualStrategy
                    ? item.visualStrategy
                    : activeImage
                    ? '업로드된 시드 이미지의 웜톤 가구 구도를 분석하여, 브랜드 톤앤매너를 손상시키지 않고 선택 지면 비율에 어울리도록 시각적 조화를 형성했습니다.'
                    : '감성 인테리어 톤앤매너를 반영하여 아늑한 미니멀 룸 시그니처 구도로 비주얼을 배치하고 혜택 소구점을 중앙에 배치했습니다.'}
                </p>
              </div>

              <div className="rationale-card">
                <div className="rationale-card-title">
                  <span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: '18px' }}>ads_click</span>
                  <span>지면 추천 사유</span>
                </div>
                <p className="rationale-card-text">
                  {item.rationale
                    ? item.rationale
                    : item.channelKey === 'meta'
                    ? 'Instagram 유저의 피드 스크롤을 멈추게 하는(Pattern Disrupt) 모던 감성 카피와 정방형 비주얼 조합으로 클릭률(CTR) 유도에 최적화되었습니다.'
                    : item.channelKey === 'naver'
                    ? 'Naver GFA 지면 특성에 맞춰 핵심 혜택(단독 특가 및 무료배송)을 한눈에 식별할 수 있도록 가독성과 신뢰도 중심 카피를 배치했습니다.'
                    : item.channelKey === 'tiktok'
                    ? 'TikTok 숏폼 트렌드에 발맞춰 3초 이내 빠르게 시선을 사로잡는 이모지 및 직관적인 텍스트로 사용자 이탈을 최소화하도록 설계했습니다.'
                    : 'Google Ads 파이프라인 지면에서 브랜드 인지도 확보와 구매 전환(CVR)을 동시에 유도할 수 있는 CTA 밸런스를 적용했습니다.'}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VariationDetailModal;
