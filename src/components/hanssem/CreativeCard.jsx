import React, { useState } from 'react';

function CreativeCard({ data, mediaLogos }) {
    const [isFlipped, setIsFlipped] = useState(false);

    // 대표 매체명 추출 함수 (GFA -> 카카오 등)
    const getCanonicalMedia = (mediaName) => {
        if (!mediaName) return '기타';
        const upperName = mediaName.toUpperCase();
        if (upperName.includes('GFA')) return "네이버";
        if (upperName.includes('당근')) return "당근";
        if (upperName.includes('카카오') || upperName.includes('KAKAO')) return '카카오';
        if (upperName.includes('메타') || upperName.includes('META') || upperName.includes('FACEBOOK') || upperName.includes('INSTAGRAM')) return '메타';
        if (upperName.includes('구글') || upperName.includes('GOOGLE')) return '구글';
        if (upperName.includes('유튜브') || upperName.includes('YOUTUBE')) return '유튜브';
        return mediaName;
    };

    const canonicalMedia = getCanonicalMedia(data.media);

    // 랜덤 이미지 풀
    const randomImages = [
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600',
        'https://images.unsplash.com/photo-1584622781514-f63f84ced453?w=600',
        'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600',
        'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600',
    ];

    // 제목 기반 고정 랜덤 인덱스 생성
    const getSafeIndex = (str) => {
        const target = str || "";
        let hash = 0;
        for (let i = 0; i < target.length; i++) {
            hash = target.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash) % randomImages.length;
    };

    // 이미지 선정을 위한 고유값 (제목이 없으면 매체+클릭수 등으로 조합)
    const itemName = data.title || data.creative_name || data.ad_name || `${data.media}_${data.clicks}`;
    const displayImg = data.img || randomImages[getSafeIndex(itemName)];

    const toggleFlip = (e) => {
        if (e) e.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    // 안전한 수치 변환 함수
    const formatDecimal = (val) => (val ? parseFloat(val).toFixed(2) : "0.00");
    const formatInt = (val) => {
        if (val === undefined || val === null) return "0";
        return Math.round(val).toLocaleString('ko-KR');
    };

    return (
        <div className={`chart-card flip-container ${isFlipped ? 'flipped' : ''}`}>
            <div className="flip-card-inner">
                {/* 앞면 */}
                <div className="flip-card-front">
                    <div className="chart-image-wrapper">
                        <img src={displayImg} alt={data.title} className="creative-img" />
                    </div>
                    <div className="chart-content">
                        <div className="card-title-area">
                            <div className="media-ci-wrapper">
                                <img src={mediaLogos[canonicalMedia] || mediaLogos['기타']} alt={data.media} className="media-ci-img" title={data.media} />
                            </div>
                            <h3 className="creative-title" title={data.media || data.creative_name}>
                                {data.media || data.creative_name || '소재 정보 없음'}
                            </h3>
                        </div>
                        <div className="metrics-summary">
                            <div className="metric-item">
                                <span className="label">Clicks</span>
                                <span className="value">{formatInt(data.clicks)}</span>
                            </div>
                            <div className="metric-item">
                                <span className="label">CTR</span>
                                <span className="value highlighting">{formatDecimal(data.ctr)} %</span>
                            </div>
                            <div className="metric-item">
                                <span className="label">CPC</span>
                                <span className="value highlighting">{formatInt(data.cpc)} 원</span>
                            </div>
                        </div>
                    </div>
                    <div className="chart-footer" onClick={toggleFlip}>
                        상세 성과 지표 확인
                    </div>
                </div>

                {/* 뒷면 */}
                <div className="flip-card-back">
                    <div className="back-header">
                        <h4>상세 데이터</h4>
                        <button className="close-btn" onClick={toggleFlip}>×</button>
                    </div>
                    <div className="back-content">
                        <div className="detail-row">
                            <span>노출수</span>
                            <strong>{formatInt(data.impressions)}</strong>
                        </div>
                        <div className="detail-row">
                            <span>클릭수</span>
                            <strong>{formatInt(data.clicks)}</strong>
                        </div>
                        <div className="detail-row">
                            <span>클릭률(CTR)</span>
                            <strong>{formatDecimal(data.ctr)} %</strong>
                        </div>
                        <div className="detail-row">
                            <span>광고비</span>
                            <strong>{formatInt(data.cost)} 원</strong>
                        </div>
                        <div className="detail-row">
                            <span>CPC</span>
                            <strong>{formatInt(data.cpc)} 원</strong>
                        </div>

                        <div className="detail-row">
                            <span>전환수</span>
                            <strong>{formatInt(data.consultation_requests)}</strong>
                        </div>
                        <div className="detail-row">
                            <span>전환율(CVR)</span>
                            <strong>{formatDecimal(data.cvr)} %</strong>
                        </div>
                        <div className="detail-divider"></div>
                        <div className="detail-row highlight">
                            <span>ROAS</span>
                            <strong>{formatInt(data.roas)}%</strong>
                        </div>
                    </div>
                    <div className="chart-footer" onClick={toggleFlip}>
                        돌아가기
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreativeCard;
