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
import { CreativeCard } from '.';

const METRIC_CONFIG = {
  impressions: { label: '노출수', unit: '', format: 'int', color: '#a4b0be' },
  clicks: { label: '클릭수', unit: '', format: 'int', color: '#667eea' },
  cost: { label: '광고비', unit: '원', format: 'int', color: '#ff6b81' },
  orders: { label: '주문수', unit: '건', format: 'int', color: '#2ed573' },
  revenue: { label: '총 수익', unit: '원', format: 'int', color: '#1e90ff' },
  ctr: { label: 'CTR', unit: '%', format: 'float', color: '#ffa502' },
  cpc: { label: 'CPC', unit: '원', format: 'int', color: '#3742fa' },
  cvr: { label: 'CVR', unit: '%', format: 'float', color: '#ff4757' },
  roas: { label: 'ROAS', unit: '%', format: 'float', color: '#4bc0c0' },
};

function PerformanceView({ startDate, endDate, setStartDate, setEndDate }) {
  const [topData, setTopData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 동적 차트 지표 상태
  const [metricLeft, setMetricLeft] = useState('cost');
  const [metricRight, setMetricRight] = useState('roas');

  // 필터 관련 상태
  const [orderFilterInput, setOrderFilterInput] = useState(0);
  const [costFilterInput, setCostFilterInput] = useState(0);
  const [roasFilterInput, setRoasFilterInput] = useState(0);

  const fetchData = async (sDate, eDate, minOrders = 0, minCost = 0, minRoas = 0) => {
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
        `${API_BASE_URL}/search/bigquery/date?dataset_id=hanssem_hf&table_id=performance_raw&report_type=media_material&start_date=${startStr}&end_date=${endStr}&limit=5&offset=0&min_orders=${minOrders}&min_cost=${minCost}&min_roas=${minRoas}`
      );
      const materialResult = await materialRes.json();
      setTopData(Array.isArray(materialResult) ? materialResult : (materialResult.data || []));

      // 2. 트렌드 데이터 (전체 데이터 추이)
      const trendRes = await fetch(
        `${API_BASE_URL}/search/bigquery/date?dataset_id=hanssem_hf&table_id=performance_raw&report_type=trend&start_date=${startStr}&end_date=${endStr}`
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
    fetchData(startDate, endDate, 0, 0, 0);
  }, [startDate, endDate]);

  const handleApplyFilters = () => {
    fetchData(startDate, endDate, orderFilterInput, costFilterInput, roasFilterInput);
  };

  const handleResetFilters = () => {
    setOrderFilterInput(0);
    setCostFilterInput(0);
    setRoasFilterInput(0);
    fetchData(startDate, endDate, 0, 0, 0);
  };

  // 날짜별 데이터 집계
  const processedTrendData = useMemo(() => {
    if (!trendData.length) return [];

    const dailyMap = {};
    trendData.forEach(item => {
      const d = item.date ? item.date.split('T')[0] : 'Unknown';
      if (!dailyMap[d]) {
        dailyMap[d] = {
          date: d,
          impressions: 0,
          clicks: 0,
          cost: 0,
          orders: 0,
          revenue: 0
        };
      }
      dailyMap[d].impressions += Number(item.impressions || 0);
      dailyMap[d].clicks += Number(item.clicks || 0);
      dailyMap[d].cost += Number(item.total_cost || 0);
      dailyMap[d].orders += Number(item.total_orders || 0);
      dailyMap[d].revenue += Number(item.total_revenue || 0);
    });

    return Object.values(dailyMap).map(day => ({
      ...day,
      displayDate: day.date.substring(5).replace('-', '/'),
      ctr: day.impressions > 0 ? (day.clicks / day.impressions) * 100 : 0,
      cpc: day.clicks > 0 ? Math.round(day.cost / day.clicks) : 0,
      cvr: day.clicks > 0 ? (day.orders / day.clicks) * 100 : 0,
      roas: day.cost > 0 ? (day.revenue / day.cost) * 100 : 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [trendData]);

  // 전체 요약 데이터 계산
  const summaryMetrics = useMemo(() => {
    const initial = { clicks: 0, impressions: 0, cost: 0, orders: 0, revenue: 0 };
    const totals = processedTrendData.reduce((acc, curr) => {
      acc.clicks += curr.clicks;
      acc.impressions += curr.impressions;
      acc.cost += curr.cost;
      acc.orders += curr.orders;
      acc.revenue += curr.revenue;
      return acc;
    }, initial);

    return {
      ...totals,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      cpc: totals.clicks > 0 ? Math.round(totals.cost / totals.clicks) : 0,
      cvr: totals.clicks > 0 ? (totals.orders / totals.clicks) * 100 : 0,
      roas: totals.cost > 0 ? (totals.revenue / totals.cost) * 100 : 0
    };
  }, [processedTrendData]);

  const formatInt = (val) => Math.round(val || 0).toLocaleString('ko-KR');
  const formatDecimal = (val) => (val || 0).toFixed(2);

  const leftConfig = METRIC_CONFIG[metricLeft];
  const rightConfig = METRIC_CONFIG[metricRight];

  const formatAxisTick = (val, type) => {
    if (type === 'float') return `${val.toFixed(1)}%`;
    if (val >= 100000000) return `${(val / 100000000).toFixed(1)}억`;
    if (val >= 10000) return `${(val / 10000).toFixed(0)}만`;
    return val.toLocaleString('ko-KR');
  };

  return (
    <main className="hanssem-main">
      {/* 대시보드 2 - 전 매체 통합 성과 트렌드 */}
      <section className="dashboard-section">
        <div className="section-header-with-action" style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <h2>[ 전 매체 통합 성과 트렌드 ]</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: '#555', fontWeight: 'bold' }}>좌측 축(막대):</span>
              <select 
                value={metricLeft} 
                onChange={(e) => setMetricLeft(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', background: '#fff' }}
              >
                {Object.entries(METRIC_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: '#555', fontWeight: 'bold' }}>우측 축(선):</span>
              <select 
                value={metricRight} 
                onChange={(e) => setMetricRight(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', background: '#fff' }}
              >
                {Object.entries(METRIC_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
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
        </div>

        <div className="dashboard-card" style={{ marginTop: '20px' }}>
          <div className="chart-placeholder" style={{ padding: '2rem 1rem 1rem' }}>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={processedTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="displayDate" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#667eea"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => formatAxisTick(val, leftConfig.format)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#ff7300"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => formatAxisTick(val, rightConfig.format)}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  formatter={(value, name, props) => {
                    const config = Object.values(METRIC_CONFIG).find(c => c.label === name);
                    const type = config ? config.format : 'int';
                    const unit = config ? config.unit : '';
                    
                    if (type === 'float') return [`${value.toFixed(2)}${unit}`, name];
                    return [`${value.toLocaleString('ko-KR')}${unit}`, name];
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey={metricLeft} name={leftConfig.label} fill="#667eea" radius={[4, 4, 0, 0]} barSize={30} />
                <Line yAxisId="right" type="monotone" dataKey={metricRight} name={rightConfig.label} stroke="#ff7300" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="metrics-placeholder" style={{ padding: '10px', borderTop: '1px solid #f0f0f0' }}>
            <table className="simple-table" style={{ width: '100%', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th>총 노출수</th>
                  <th>총 클릭수</th>
                  <th>평균 CTR</th>
                  <th>평균 CPC</th>
                  <th>총 집행비용</th>
                  <th>총 주문수</th>
                  <th>총 수익</th>
                  <th>평균 CVR</th>
                  <th>평균 ROAS</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ textAlign: 'center', color: '#111' }}>
                  <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatInt(summaryMetrics.impressions)}</td>
                  <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatInt(summaryMetrics.clicks)}</td>
                  <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatDecimal(summaryMetrics.ctr)} %</td>
                  <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatInt(summaryMetrics.cpc)} 원</td>
                  <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatInt(summaryMetrics.cost)} 원</td>
                  <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatInt(summaryMetrics.orders)}</td>
                  <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatInt(summaryMetrics.revenue)} 원</td>
                  <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatDecimal(summaryMetrics.cvr)} %</td>
                  <td style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatDecimal(summaryMetrics.roas)} %</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 대시보드 3 - CPA 기준 우수 소재 */}
      <section className="dashboard-section" style={{ marginTop: '4rem' }}>
        <div className="section-header-with-action">
          <h2>[ 전 매체 통합, 우수 소재 이미지 및 성과 ]</h2>
          <div className="performance-filter-group">
            <div className="performance-input-wrapper">
              <label>주문수</label>
              <input
                type="number"
                className="performance-filter-input"
                placeholder="건"
                value={orderFilterInput}
                onChange={(e) => setOrderFilterInput(e.target.value)}
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
            <div className="performance-input-wrapper">
              <label>ROAS</label>
              <input
                type="number"
                className="performance-filter-input"
                placeholder="%"
                value={roasFilterInput}
                onChange={(e) => setRoasFilterInput(e.target.value)}
              />
              <span className="filter-unit">% 이상</span>
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
