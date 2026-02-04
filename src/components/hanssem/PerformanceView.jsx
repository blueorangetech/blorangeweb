import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';
import '../../styles/HanssemPerformance.css';
import { CreativeCard } from './';

function PerformanceView() {
    // 날짜 상태 추가
    const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState(new Date());

    // 매체 로고 URL 매핑 (InsightView와 동일)
    const mediaLogos = {
        '카카오': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg',
        '메타': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
        '구글': 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
        '유튜브': 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg'
    };

    return (
        <main className="hanssem-main">
            {/* 대시보드 2 - 전 매체 통합 성과 */}
            <section className="dashboard-section">
                <div className="section-header-with-action">
                    <h2>[ 전 매체 통합, 배분 기준 전체 성과 지표 노출 ]</h2>
                    <div className="performance-datepicker-wrapper">
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => {
                                const [start, end] = update;
                                setStartDate(start);
                                setEndDate(end);
                            }}
                            locale={ko}
                            dateFormat="yyyy.MM.dd"
                            customInput={
                                <button className="period-btn">
                                    {startDate && endDate
                                        ? `${startDate.toLocaleDateString('ko-KR', { year: '2-digit', month: 'numeric', day: 'numeric' })} - ${endDate.toLocaleDateString('ko-KR', { year: '2-digit', month: 'numeric', day: 'numeric' })}`
                                        : '기간 조건'}
                                </button>
                            }
                        />
                    </div>
                </div>
                <div className="dashboard-grid-2">
                    <div className="dashboard-card">
                        <div className="chart-placeholder">
                            <div className="simple-bar-chart">
                                {[60, 80, 45, 90, 55].map((h, i) => (
                                    <div key={i} className="bar" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                        </div>
                        <div className="metrics-placeholder">
                            <table className="simple-table">
                                <thead>
                                    <tr><th>항목</th><th>수치</th><th>대비</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>클릭수</td><td>12,402</td><td>+5.2%</td></tr>
                                    <tr><td>CTR</td><td>3.21%</td><td>+0.4%</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="dashboard-card">
                        <div className="chart-placeholder">
                            <div className="simple-line-chart">
                                <svg viewBox="0 0 200 100" className="line-svg">
                                    <polyline fill="none" stroke="#667eea" strokeWidth="3" points="0,80 40,60 80,70 120,30 160,40 200,10" />
                                </svg>
                            </div>
                        </div>
                        <div className="metrics-placeholder">
                            <table className="simple-table">
                                <thead>
                                    <tr><th>항목</th><th>수치</th><th>대비</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>전환수</td><td>1,052</td><td>+12.1%</td></tr>
                                    <tr><td>CPA</td><td>15,200원</td><td>-2.5%</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* 대시보드 3 - CPA 기준 우수 소재 */}
            <section className="dashboard-section" style={{ marginTop: '4rem' }}>
                <div className="section-header-with-action">
                    <h2>[ 전 매체 통합, CPA 기준 우수 소재 이미지 및 성과 지표 노출 ]</h2>
                    <button className="period-btn">기간 조건</button>
                </div>
                <div className="dashboard-grid-5">
                    {[
                        { id: 1, media: '카카오', title: '소재_메인_거실_01', ctr: '2.45%', roas: '450%', clicks: '1,240', cpa: '12,500원', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=450&fit=crop' },
                        { id: 2, media: '메타', title: '소재_주방_리모델링', ctr: '3.12%', roas: '520%', clicks: '2,150', cpa: '11,200원', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&h=450&fit=crop' },
                        { id: 3, media: '메타', title: '소재_인테리어_토탈', ctr: '5.10%', roas: '720%', clicks: '5,200', cpa: '9,800원', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=450&fit=crop' },
                        { id: 4, media: '카카오', title: '소재_빌트인_주방', ctr: '3.55%', roas: '480%', clicks: '2,800', cpa: '13,100원', img: 'https://images.unsplash.com/photo-1556912176-12bb89e900ae?w=600&h=450&fit=crop' },
                        { id: 5, media: '유튜브', title: '소재_다이닝_테이블', ctr: '2.87%', roas: '610%', clicks: '1,560', cpa: '10,500원', img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&h=450&fit=crop' },
                    ].map((item) => (
                        <CreativeCard key={item.id} data={item} mediaLogos={mediaLogos} />
                    ))}
                </div>
            </section>
        </main>
    );
}

export default PerformanceView;
