import React, { useState } from 'react';
import { getCanonicalMedia, mediaLogos } from '../../utils/mediaUtils';

function CreativeCard({ data }) {
    const [isFlipped, setIsFlipped] = useState(false);


    const canonicalMedia = getCanonicalMedia(data.media);

    // 대체 이미지
    const randomImages = [
        'https://upload.wikimedia.org/wikipedia/commons/7/7b/%ED%95%9C%EC%83%98_%EB%A1%9C%EA%B3%A0.jpg',
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

    // Cloud Storage 이미지 경로 구성: 기본 주소 + utm_content
    const STORAGE_BASE_URL = 'https://storage.googleapis.com/hanssem_rh/';
    // 이미지 이미지 소스 상태 관리 (확장자 jpg/png 대응)
    const [imgSrc, setImgSrc] = useState(
        data.utm_content
            ? `${STORAGE_BASE_URL}${data.utm_content_5}.jpg`
            : (data.img || randomImages[getSafeIndex(itemName)])
    );

    // props 변경 시 이미지 경로 초기화
    React.useEffect(() => {
        setImgSrc(
            data.utm_content
                ? `${STORAGE_BASE_URL}${data.utm_content_5}.jpg`
                : (data.img || randomImages[getSafeIndex(itemName)])
        );
    }, [data.utm_content, data.img, itemName]);

    const handleImgError = () => {
        // .jpg 로 로드 실패 시 .png 로 재시도
        if (imgSrc.endsWith('.jpg') && data.utm_content_5) {
            setImgSrc(`${STORAGE_BASE_URL}${data.utm_content_5}.png`);
        } else {
            // 최종 실패 시 랜덤 이미지로 대체
            setImgSrc(randomImages[getSafeIndex(itemName)]);
        }
    };

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
                        <img
                            src={imgSrc}
                            alt={data.title}
                            className="creative-img"
                            onError={handleImgError}
                        />
                    </div>
                    <div className="chart-content">
                        {data.media && (
                            <div className="card-title-area">
                                <div className="media-ci-wrapper">
                                    <img src={mediaLogos[canonicalMedia] || mediaLogos['기타']} alt={data.media} className="media-ci-img" title={data.media} />
                                </div>
                            </div>
                        )}
                        <h3 className="creative-title" title={data.media || data.creative_name}>
                            {data.media || data.creative_name || data.utm_content_5 || '소재 정보 없음'}
                        </h3>
                        <div className="metrics-summary">
                            <div className="metric-item">
                                <span className="label">상담신청</span>
                                <span className="value">{formatInt(data.consultation)} 건</span>
                            </div>
                            <div className="metric-item">
                                <span className="label">배분수</span>
                                <span className="value">{formatInt(data.distribution)} 건</span>
                            </div>
                            <div className="metric-item">
                                <span className="label">배분 CVR</span>
                                <span className="value">{formatDecimal(data.cvr)} %</span>
                            </div>
                            <div className="metric-item">
                                <span className="label">배분 CPA</span>
                                <span className="value highlighting">{formatInt(data.cpa)} 원</span>
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
                            <span>소재 고유명</span>
                            <strong>{data.utm_content_5}</strong>
                        </div>
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
                            <span>상담신청</span>
                            <strong>{formatInt(data.consultation)}</strong>
                        </div>
                        <div className="detail-row">
                            <span>배분수</span>
                            <strong>{formatInt(data.distribution)}</strong>
                        </div>
                        <div className="detail-row">
                            <span>배분 CVR</span>
                            <strong>{formatDecimal(data.cvr)} %</strong>
                        </div>
                        <div className="detail-row">
                            <span>배분률</span>
                            <strong>{formatDecimal(data.distribution_cvr)} %</strong>
                        </div>
                        <div className="detail-divider"></div>
                        <div className="detail-row highlight">
                            <span>배분 CPA</span>
                            <strong>{formatInt(data.cpa)} 원</strong>
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
