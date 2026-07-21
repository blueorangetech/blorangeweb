import React, { useState } from 'react';
import { getCanonicalMedia, mediaLogos } from '../../utils/mediaUtils';

function CreativeCard({ data, onImageResolved }) {
    const [isFlipped, setIsFlipped] = useState(false);


    const canonicalMedia = getCanonicalMedia(data.media);

    // 설정 가능한 대체 이미지
    const DEFAULT_FALLBACK_IMAGE = import.meta.env.VITE_DEFAULT_FALLBACK_IMAGE || 'https://upload.wikimedia.org/wikipedia/commons/7/7b/%ED%95%9C%EC%83%98_%EB%A1%9C%EA%B3%A0.jpg';

    // Cloud Storage 이미지 경로 구성
    const STORAGE_BASE_URL = 'https://storage.googleapis.com/hanssem_hf';

    const buildImageUrl = (ext = 'png') => {
        if (!data.creative_type) return DEFAULT_FALLBACK_IMAGE;
        const buSegment = data.business_unit ? `${data.business_unit}/` : '';
        const mediaSegment = data.media ? `${data.media}/` : '';
        let typeName = data.creative_type.trim();
        if (/\.(png|jpg|jpeg|webp)$/i.test(typeName)) {
            return `${STORAGE_BASE_URL}/${buSegment}${mediaSegment}${typeName}`;
        }
        return `${STORAGE_BASE_URL}/${buSegment}${mediaSegment}${typeName}.${ext}`;
    };

    // 이미지 소스 상태 관리 (.png -> .jpg -> 대체 이미지 로드)
    const [imgSrc, setImgSrc] = useState(() => buildImageUrl('png'));

    // props 변경 시 이미지 경로 초기화
    React.useEffect(() => {
        const url = buildImageUrl('png');
        setImgSrc(url);
        if (onImageResolved) onImageResolved(url);
    }, [data.creative_type, data.business_unit, data.media]);

    const handleImgError = () => {
        let nextUrl = DEFAULT_FALLBACK_IMAGE;
        if (imgSrc.endsWith('.png') && data.creative_type) {
            nextUrl = buildImageUrl('jpg');
        } else if (imgSrc.endsWith('.jpg') && data.creative_type) {
            nextUrl = buildImageUrl('jpeg');
        }
        setImgSrc(nextUrl);
        if (onImageResolved) onImageResolved(nextUrl);
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
                            {data.media || data.creative_name || '소재 정보 없음'}
                        </h3>
                        <div className="metrics-summary">
                            <div className="metric-item">
                                <span className="label">광고비</span>
                                <span className="value">{formatInt(data.total_cost)} 원</span>
                            </div>
                            <div className="metric-item">
                                <span className="label">유입 전환율</span>
                                <span className="value">{formatDecimal(data.inflow_cvr)} %</span>
                            </div>
                            <div className="metric-item">
                                <span className="label">주문 건수</span>
                                <span className="value">{formatInt(data.total_orders)} 건</span>
                            </div>
                            <div className="metric-item">
                                <span className="label">구매 CVR</span>
                                <span className="value highlighting">{formatDecimal(data.purchase_cvr)} %</span>
                            </div>
                            <div className="metric-item">
                                <span className="label">ROAS</span>
                                <span className="value highlighting">{formatInt(data.roas)} %</span>
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
                            <span>소재명</span>
                            <strong>{data.creative_type}</strong>
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
                            <span>CPC</span>
                            <strong>{formatInt(data.cpc)} 원</strong>
                        </div>
                        <div className="detail-row">
                            <span>광고비</span>
                            <strong>{formatInt(data.total_cost)} 원</strong>
                        </div>
                        <div className="detail-row">
                            <span>유입 전환율</span>
                            <strong>{formatDecimal(data.inflow_cvr)} %</strong>
                        </div>
                        <div className="detail-row">
                            <span>주문 건수</span>
                            <strong>{formatInt(data.total_orders)} 건</strong>
                        </div>
                        <div className="detail-row">
                            <span>주문 금액</span>
                            <strong>{formatInt(data.total_revenue)} 원</strong>
                        </div>
                        <div className="detail-row">
                            <span>CVR</span>
                            <strong>{formatDecimal(data.purchase_cvr)} %</strong>
                        </div>
                        <div className="detail-divider"></div>
                        <div className="detail-row highlight">
                            <span>ROAS</span>
                            <strong>{formatInt(data.roas)} %</strong>
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
