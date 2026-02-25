import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import '../../styles/HanssemPerformance.css';
import { CreativeCard } from './';
import { mediaLogos } from '../../utils/mediaUtils';

function PerformanceView({ startDate, endDate, setStartDate, setEndDate }) {
    const [topData, setTopData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 필터 관련 상태
    const [distributionFilterInput, setdistributionFilterInput] = useState(0);
    const [costFilterInput, setCostFilterInput] = useState(0);

    const fetchData = async (sDate, eDate, minDist, minCost) => {
        if (!sDate || !eDate) return;
        setIsLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const startStr = formatDate(sDate);
        const endStr = formatDate(eDate);

        try {
            // 1. 최상위 소재 데이터 (서버 사이드 필터링 적용)
            const materialRes = await fetch(
                `${API_BASE_URL}/search/bigquery/date?dataset_id=hanssem&table_id=performance_raw&report_type=material&start_date=${startStr}&end_date=${endStr}&limit=5&offset=0&min_distribution=${minDist}&min_cost=${minCost}`
            );
            const materialResult = await materialRes.json();
            setTopData(Array.isArray(materialResult) ? materialResult : (materialResult.data || []));

            // 2. 트렌드 데이터 (전체 데이터 추이)
            const trendRes = await fetch(
                `${API_BASE_URL}/search/bigquery/date?dataset_id=hanssem&table_id=performance_raw&report_type=trend&start_date=${startStr}&end_date=${endStr}`
            );
            const trendResult = await trendRes.json();
            setTrendData(Array.isArray(trendResult) ? trendResult : (trendResult.data || []));

        } catch (error) {
            console.error('Performance data fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(startDate, endDate, 0, 0);
    }, [startDate, endDate]);

    const handleApplyFilters = () => {
        fetchData(startDate, endDate, distributionFilterInput, costFilterInput);
    };

    const handleResetFilters = () => {
        setdistributionFilterInput(0);
        setCostFilterInput(0);
        fetchData(startDate, endDate, 0, 0);
    };

    // 날짜별 데이터 집계
    const processedTrendData = useMemo(() => {
        if (!trendData.length) return [];

        const dailyMap = {};
        trendData.forEach(item => {
            // 날짜 포맷 정리 (ISO string이나 YYYY-MM-DD 등에서 날짜만 추출)
            const d = item.date ? item.date.split('T')[0] : 'Unknown';
            if (!dailyMap[d]) {
                dailyMap[d] = {
                    date: d,
                    impressions: 0,
                    clicks: 0,
                    cost: 0,
                    consultation: 0
                };
            }
            dailyMap[d].impressions += Number(item.impressions || 0);
            dailyMap[d].clicks += Number(item.clicks || 0);
            dailyMap[d].cost += Number(item.cost || 0);
            dailyMap[d].consultation += Number(item.consultation || 0);
        });

        return Object.values(dailyMap).map(day => ({
            ...day,
            displayDate: day.date.substring(5).replace('-', '/'), // MM/DD 형식
            ctr: day.impressions > 0 ? (day.clicks / day.impressions) * 100 : 0,
            cpa: day.consultation > 0 ? Math.round(day.cost / day.consultation) : 0,
            cpc: day.clicks > 0 ? Math.round(day.cost / day.clicks) : 0
        })).sort((a, b) => a.date.localeCompare(b.date));
    }, [trendData]);

    // 전체 요약 데이터 계산
    const summaryMetrics = useMemo(() => {
        const initial = { clicks: 0, impressions: 0, cost: 0, consultation: 0 };
        const totals = processedTrendData.reduce((acc, curr) => {
            acc.clicks += curr.clicks;
            acc.impressions += curr.impressions;
            acc.cost += curr.cost;
            acc.consultation += curr.consultation;
            return acc;
        }, initial);

        return {
            ...totals,
            ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
            cpa: totals.consultation > 0 ? Math.round(totals.cost / totals.consultation) : 0,
            cpc: totals.clicks > 0 ? Math.round(totals.cost / totals.clicks) : 0
        };
    }, [processedTrendData]);

    const formatInt = (val) => Math.round(val || 0).toLocaleString('ko-KR');
    const formatDecimal = (val) => (val || 0).toFixed(2);

    return (
        <main className="hanssem-main">
            {/* 대시보드 2 - 전 매체 통합 성과 트렌드 */}
            <section className="dashboard-section">
                <div className="section-header-with-action">
                    <h2>[ 전 매체 통합 성과 트렌드 (통계 기준) ]</h2>
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
                                        ? `${startDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })} - ${endDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}`
                                        : '기간 조건'}
                                </button>
                            }
                        />
                    </div>
                </div>

                <div className="dashboard-grid-2">
                    {/* 좌측: 클릭 및 CTR 추이 */}
                    <div className="dashboard-card">
                        <div className="chart-placeholder" style={{ padding: '1.5rem 0.5rem 0.5rem' }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={processedTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="displayDate" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis
                                        yAxisId="left"
                                        orientation="left"
                                        stroke="#667eea"
                                        fontSize={11}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => val.toLocaleString('ko-KR')}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#ff7300"
                                        fontSize={11}
                                        axisLine={false}
                                        tickLine={false}
                                        unit="%"
                                        tickFormatter={(val) => val.toFixed(1)}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value, name) => {
                                            if (name === 'CTR') return [`${value.toFixed(2)}%`, name];
                                            return [value.toLocaleString('ko-KR'), name];
                                        }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                    <Bar yAxisId="left" dataKey="clicks" name="클릭수" fill="#667eea" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Line yAxisId="right" type="monotone" dataKey="ctr" name="CTR" stroke="#ff7300" strokeWidth={2} dot={{ r: 3 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="metrics-placeholder">
                            <table className="simple-table">
                                <thead>
                                    <tr><th>항목</th><th>수치</th><th>비중/기준</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>총 클릭수</td><td>{formatInt(summaryMetrics.clicks)}</td><td>100.0%</td></tr>
                                    <tr><td>평균 CTR</td><td>{formatDecimal(summaryMetrics.ctr)} %</td><td>-</td></tr>
                                    <tr><td>평균 CPC</td><td>{formatInt(summaryMetrics.cpc)} 원</td><td>-</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 우측: 전환수 및 CPA 추이 */}
                    <div className="dashboard-card">
                        <div className="chart-placeholder" style={{ padding: '1.5rem 0.5rem 0.5rem' }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={processedTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="displayDate" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis
                                        yAxisId="left"
                                        orientation="left"
                                        stroke="#4bc0c0"
                                        fontSize={11}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => val.toLocaleString('ko-KR')}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#f39c12"
                                        fontSize={11}
                                        axisLine={false}
                                        tickLine={false}
                                        unit="원"
                                        tickFormatter={(val) => val.toLocaleString('ko-KR')}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value, name) => {
                                            if (name === 'CTR') return [`${value.toFixed(2)}%`, name];
                                            return [`${value.toLocaleString('ko-KR')}${name === 'CPA' ? '원' : ''}`, name];
                                        }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                    <Bar yAxisId="left" dataKey="consultation" name="전환수" fill="#4bc0c0" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Line yAxisId="right" type="monotone" dataKey="cpa" name="CPA" stroke="#f39c12" strokeWidth={2} dot={{ r: 3 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="metrics-placeholder">
                            <table className="simple-table">
                                <thead>
                                    <tr><th>항목</th><th>수치</th><th>비중/기준</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>총 전환수</td><td>{formatInt(summaryMetrics.consultation)}</td><td>100.0%</td></tr>
                                    <tr><td>평균 CPA</td><td>{formatInt(summaryMetrics.cpa)} 원</td><td>-</td></tr>
                                    <tr><td>총 집행비용</td><td>{formatInt(summaryMetrics.cost)} 원</td><td>-</td></tr>
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
                    <div className="performance-filter-group">
                        <div className="performance-input-wrapper">
                            <label>배분</label>
                            <input
                                type="number"
                                className="performance-filter-input"
                                placeholder="건"
                                value={distributionFilterInput}
                                onChange={(e) => setdistributionFilterInput(e.target.value)}
                            />
                            <span className="filter-unit">건 이상</span>
                        </div>
                        <div className="performance-input-wrapper">
                            <label>광고비</label>
                            <input
                                type="number"
                                className="performance-filter-input"
                                placeholder="원"
                                value={costFilterInput}
                                onChange={(e) => setCostFilterInput(e.target.value)}
                            />
                            <span className="filter-unit">원 이상</span>
                        </div>
                        <button className="performance-filter-btn apply" onClick={handleApplyFilters}>적용</button>
                        <button className="performance-filter-btn reset" onClick={handleResetFilters}>초기화</button>
                    </div>
                </div>
                <div className="dashboard-grid-5">
                    {isLoading ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#667eea', fontWeight: 'bold' }}>
                            데이터 로드 중...
                        </div>
                    ) : topData.length > 0 ? (
                        topData.map((item, index) => (
                            <CreativeCard key={item.id || index} data={item} />
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#999' }}>
                            설정한 필터 조건에 맞는 우수 소재 데이터가 없습니다.
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default PerformanceView;
