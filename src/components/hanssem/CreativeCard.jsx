import React, { useState } from 'react';

function CreativeCard({ data, mediaLogos }) {
    const [isFlipped, setIsFlipped] = useState(false);

    const toggleFlip = (e) => {
        if (e) e.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    return (
        <div className={`chart-card flip-container ${isFlipped ? 'flipped' : ''}`}>
            <div className="flip-card-inner">
                {/* 앞면 */}
                <div className="flip-card-front">
                    <div className="chart-image-wrapper">
                        <img src={data.img} alt={data.title} className="creative-img" />
                    </div>
                    <div className="chart-content">
                        <div className="media-ci-wrapper">
                            <img src={mediaLogos[data.media]} alt={data.media} className="media-ci-img" title={data.media} />
                        </div>
                        <h3 className="creative-title">{data.title}</h3>
                        <div className="metrics-summary">
                            <div className="metric-item">
                                <span className="label">Clicks</span>
                                <span className="value">{data.clicks}</span>
                            </div>
                            <div className="metric-item">
                                <span className="label">CTR</span>
                                <span className="value highlighting">{data.ctr}</span>
                            </div>
                            <div className="metric-item">
                                <span className="label">ROAS</span>
                                <span className="value highlighting">{data.roas}</span>
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
                            <strong>54,230</strong>
                        </div>
                        <div className="detail-row">
                            <span>클릭수</span>
                            <strong>{data.clicks}</strong>
                        </div>
                        <div className="detail-row">
                            <span>클릭률(CTR)</span>
                            <strong>{data.ctr}</strong>
                        </div>
                        <div className="detail-row">
                            <span>전환수</span>
                            <strong>45</strong>
                        </div>
                        <div className="detail-row">
                            <span>전환율(CVR)</span>
                            <strong>0.85%</strong>
                        </div>
                        <div className="detail-divider"></div>
                        <div className="detail-row highlight">
                            <span>ROAS</span>
                            <strong>{data.roas}</strong>
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
