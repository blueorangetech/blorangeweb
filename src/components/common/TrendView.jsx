import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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

// 주차 계산 유틸리티 (월요일 시작 기준)
const getWeekKey = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));

  const year = monday.getFullYear();
  const startOfYear = new Date(year, 0, 1);

  const startDay = startOfYear.getDay();
  const startDiff = startOfYear.getDate() - startDay + (startDay === 0 ? -6 : 1);
  const startMonday = new Date(startOfYear.setDate(startDiff));

  const diffDays = Math.round((monday - startMonday) / (24 * 60 * 60 * 1000));
  const weekNum = Math.floor(diffDays / 7) + 1;

  return `${year}년 ${weekNum}주차`;
};

// 월 계산 유틸리티
const getMonthKey = (dateStr) => {
  return `${dateStr.substring(0, 4)}년 ${dateStr.substring(5, 7)}월`;
};

// 부서별 메트릭스 상세 설정 (리하우스 vs 홈퍼니싱)
const CONFIGS = {
  hanssem: {
    ordersKey: 'distribution',
    ordersLabel: '확보 배분수',
    bar2Key: 'consultation',
    bar2Label: '상담신청수',
    lineKey: 'cpa',
    lineLabel: '배분 CPA',
    lineColor: '#f59e0b',
    barColor: '#3b82f6',
    bar2Color: '#94a3b8',
    tableColumns: [
      { key: 'media', label: '매체' },
      { key: 'cost', label: '소진비용', format: 'won' },
      { key: 'consultation', label: '상담신청수', format: 'int' },
      { key: 'distribution', label: '확보 배분수', format: 'int' },
      { key: 'cpa', label: '배분 CPA', format: 'won' },
      { key: 'cvr', label: '배분 CVR', format: 'percent' }
    ]
  },
  hanssem_hf: {
    ordersKey: 'orders',
    ordersLabel: '구매 건수',
    bar2Key: 'users',
    bar2Label: '유입 유저수',
    lineKey: 'roas',
    lineLabel: 'ROAS',
    lineColor: '#06b6d4',
    barColor: '#10b981',
    bar2Color: '#94a3b8',
    tableColumns: [
      { key: 'media', label: '매체' },
      { key: 'cost', label: '소진비용', format: 'won' },
      { key: 'users', label: '유입 유저수', format: 'people' },
      { key: 'orders', label: '구매 건수', format: 'int' },
      { key: 'revenue', label: '매출액', format: 'won' },
      { key: 'roas', label: 'ROAS', format: 'percent' }
    ]
  }
};

function CommonTrendView({ datasetId, startDate, endDate, setStartDate, setEndDate }) {
  const [trendData, setTrendData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 탭 관리: 'integrated' (일자별_OverView), 'media' (매체별_OverView)
  const [activeSubTab, setActiveSubTab] = useState('integrated');

  // 노출 단위 선택: 'day', 'week', 'month'
  const [timeUnit, setTimeUnit] = useState('day');

  // 매체 필터
  const [selectedMedia, setSelectedMedia] = useState('');

  // 현재 부서 설정 로드
  const cfg = useMemo(() => CONFIGS[datasetId] || CONFIGS.hanssem, [datasetId]);

  // 1. 빅쿼리 데이터 조회
  useEffect(() => {
    const fetchData = async () => {
      if (!startDate || !endDate) return;
      setIsLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const startStr = formatDate(startDate);
      const endStr = formatDate(endDate);

      try {
        const trendRes = await fetch(
          `${API_BASE_URL}/search/bigquery/date?dataset_id=${datasetId}&table_id=performance_raw&report_type=trend&start_date=${startStr}&end_date=${endStr}`
        );
        const trendResult = await trendRes.json();
        const rawData = Array.isArray(trendResult) ? trendResult : (trendResult.data || []);
        setTrendData(rawData);

        // 첫 번째 매체 자동 선택
        if (rawData.length > 0) {
          const mediaSet = new Set(rawData.map(item => item.media_name).filter(Boolean));
          const list = Array.from(mediaSet);
          if (list.length > 0 && !selectedMedia) {
            setSelectedMedia(list[0]);
          }
        }
      } catch (error) {
        console.error(`Performance ${datasetId} data fetch error:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, datasetId]);

  // 매체 리스트 추출
  const mediaList = useMemo(() => {
    const mediaSet = new Set(trendData.map(item => item.media_name).filter(Boolean));
    return Array.from(mediaSet).sort();
  }, [trendData]);

  // 데이터 포맷 유틸리티
  const formatInt = (val) => Math.round(val || 0).toLocaleString('ko-KR');
  const formatPercent = (val) => (val || 0).toFixed(2) + '%';
  const formatWon = (val) => Math.round(val || 0).toLocaleString('ko-KR') + '원';
  const formatPeople = (val) => Math.round(val || 0).toLocaleString('ko-KR') + '명';

  const formatValue = (val, formatType) => {
    if (formatType === 'won') return formatWon(val);
    if (formatType === 'percent') return formatPercent(val);
    if (formatType === 'people') return formatPeople(val);
    return formatInt(val);
  };

  // ==========================================
  // [영역 1] OverView_성과 트렌드 계산 (통합)
  // ==========================================
  const integratedData = useMemo(() => {
    if (!trendData.length) return [];

    const grouped = {};
    trendData.forEach(item => {
      const dateStr = item.date ? item.date.split('T')[0] : 'Unknown';
      let key = dateStr;
      if (timeUnit === 'week') key = getWeekKey(dateStr);
      if (timeUnit === 'month') key = getMonthKey(dateStr);

      if (!grouped[key]) {
        grouped[key] = { period: key, cost: 0, consultation: 0, distribution: 0, users: 0, orders: 0, revenue: 0 };
      }
      grouped[key].cost += Number(item.cost || item.total_cost || 0);
      grouped[key].consultation += Number(item.consultation || 0);
      grouped[key].distribution += Number(item.distribution || 0);
      grouped[key].users += Number(item.total_users || 0);
      grouped[key].orders += Number(item.total_orders || 0);
      grouped[key].revenue += Number(item.total_revenue || 0);
    });

    return Object.values(grouped).map(row => ({
      ...row,
      cpa: row.distribution > 0 ? Math.round(row.cost / row.distribution) : 0,
      cvr: row.consultation > 0 ? (row.distribution / row.consultation) * 100 : 0,
      roas: row.cost > 0 ? (row.revenue / row.cost) * 100 : 0,
      purchase_cvr: row.users > 0 ? (row.orders / row.users) * 100 : 0
    })).sort((a, b) => a.period.localeCompare(b.period));
  }, [trendData, timeUnit]);

  // 영역 1 매체별 집계 표 데이터 (통합)
  const mediaBreakdownData = useMemo(() => {
    if (!trendData.length) return [];

    const grouped = {};
    trendData.forEach(item => {
      const media = item.media_name || '기타';
      if (!grouped[media]) {
        grouped[media] = { media, cost: 0, consultation: 0, distribution: 0, users: 0, orders: 0, revenue: 0 };
      }
      grouped[media].cost += Number(item.cost || item.total_cost || 0);
      grouped[media].consultation += Number(item.consultation || 0);
      grouped[media].distribution += Number(item.distribution || 0);
      grouped[media].users += Number(item.total_users || 0);
      grouped[media].orders += Number(item.total_orders || 0);
      grouped[media].revenue += Number(item.total_revenue || 0);
    });

    return Object.values(grouped).map(row => ({
      ...row,
      cpa: row.distribution > 0 ? Math.round(row.cost / row.distribution) : 0,
      cvr: row.consultation > 0 ? (row.distribution / row.consultation) * 100 : 0,
      roas: row.cost > 0 ? (row.revenue / row.cost) * 100 : 0,
      purchase_cvr: row.users > 0 ? (row.orders / row.users) * 100 : 0
    })).sort((a, b) => b[cfg.ordersKey] - a[cfg.ordersKey]);
  }, [trendData, cfg]);

  // ==========================================
  // [영역 2] 매체별_OverView 계산 (통합)
  // ==========================================
  const mediaTrendData = useMemo(() => {
    if (!trendData.length || !selectedMedia) return [];

    const filtered = trendData.filter(item => item.media_name === selectedMedia);
    const grouped = {};
    filtered.forEach(item => {
      const dateStr = item.date ? item.date.split('T')[0] : 'Unknown';
      let key = dateStr;
      if (timeUnit === 'week') key = getWeekKey(dateStr);
      if (timeUnit === 'month') key = getMonthKey(dateStr);

      if (!grouped[key]) {
        grouped[key] = { period: key, cost: 0, consultation: 0, distribution: 0, users: 0, orders: 0, revenue: 0 };
      }
      grouped[key].cost += Number(item.cost || item.total_cost || 0);
      grouped[key].consultation += Number(item.consultation || 0);
      grouped[key].distribution += Number(item.distribution || 0);
      grouped[key].users += Number(item.total_users || 0);
      grouped[key].orders += Number(item.total_orders || 0);
      grouped[key].revenue += Number(item.total_revenue || 0);
    });

    return Object.values(grouped).map(row => ({
      ...row,
      cpa: row.distribution > 0 ? Math.round(row.cost / row.distribution) : 0,
      cvr: row.consultation > 0 ? (row.distribution / row.consultation) * 100 : 0,
      roas: row.cost > 0 ? (row.revenue / row.cost) * 100 : 0,
      purchase_cvr: row.users > 0 ? (row.orders / row.users) * 100 : 0
    })).sort((a, b) => a.period.localeCompare(b.period));
  }, [trendData, selectedMedia, timeUnit]);

  // ==========================================
  // 💡 실시간 분석 기반 AI 코멘트 생성 (통합)
  // ==========================================
  const aiComments = useMemo(() => {
    const data = activeSubTab === 'integrated' ? integratedData : mediaTrendData;
    if (data.length < 2) {
      return {
        daily: '이전 비교 대상 데이터가 부족합니다.',
        weekly: '충분한 추이 분석 데이터가 없습니다.',
        monthly: '조회 기간을 늘려 상세 트렌드를 확인해 주세요.'
      };
    }

    const last = data[data.length - 1];
    const prev = data[data.length - 2];

    const lastVal = last[cfg.ordersKey];
    const prevVal = prev[cfg.ordersKey];
    const valDiff = lastVal - prevVal;
    const valPct = prevVal > 0 ? (valDiff / prevVal) * 100 : 0;

    const lastLineVal = last[cfg.lineKey];
    const prevLineVal = prev[cfg.lineKey];
    const lineDiff = lastLineVal - prevLineVal;
    const linePct = prevLineVal > 0 ? (lineDiff / prevLineVal) * 100 : 0;

    const valWord = valPct >= 0 ? `증가(+${valPct.toFixed(1)}%)` : `감소(${valPct.toFixed(1)}%)`;
    const lineWord = linePct >= 0 ? `상승(+${linePct.toFixed(1)}%)` : `하락(${linePct.toFixed(1)}%)`;

    const formatLine = (val) => cfg.lineKey === 'roas' ? formatPercent(val) : formatWon(val);

    // 1) 전기 비교 분석
    const dailyComment = `최근 분석 구간(${last.period})의 ${cfg.ordersLabel}는 이전 구간(${prev.period}) 대비 ${valWord}했습니다.\n효율 지표인 ${cfg.lineLabel}의 경우 기존 ${formatLine(prevLineVal)}에서 ${formatLine(lastLineVal)} 수준으로 ${lineWord}하여 전반적 성과 변동이 발생했습니다.`;

    // 2) 주간(매체별 기여) 분석
    const topMedia = mediaBreakdownData[0];
    const bestLineMedia = [...mediaBreakdownData].sort((a, b) =>
      cfg.lineKey === 'roas' ? b.roas - a.roas : (a.cpa || Infinity) - (b.cpa || Infinity)
    )[0];

    const formatLineMedia = (row) => row ? (cfg.lineKey === 'roas' ? formatPercent(row.roas) : formatWon(row.cpa)) : '0';

    const weeklyComment = activeSubTab === 'integrated'
      ? `전체 매체 중 가장 많은 성과를 낸 곳은 [${topMedia?.media || '기타'}] 매체로, 총 ${formatInt(topMedia?.[cfg.ordersKey])}건의 ${cfg.ordersLabel}를 견인했습니다.\n가장 우수한 효율을 기록한 매체는 [${bestLineMedia?.media || '기타'}] (지표: ${formatLineMedia(bestLineMedia)})입니다.`
      : `[${selectedMedia}] 매체의 기간 평균 효율은 ${cfg.lineLabel} 기준 ${formatLine(last[cfg.lineKey])}로 확인되며, 누적 집행비용은 ${formatWon(last.cost)}입니다.\nCPA/ROAS 효율 추이를 반영해 타겟팅 고도화 활동을 전개할 것을 제안합니다.`;

    // 3) 월간(종합 권장 사항) 분석
    const totalOrders = data.reduce((sum, item) => sum + item[cfg.ordersKey], 0);
    const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const overallLine = cfg.lineKey === 'roas'
      ? (totalCost > 0 ? (totalRevenue / totalCost) * 100 : 0)
      : (totalOrders > 0 ? Math.round(totalCost / totalOrders) : 0);

    const monthlyComment = `해당 기간 누적 ${cfg.ordersLabel}는 총 ${formatInt(totalOrders)}건이며, 평균 ${cfg.lineLabel}는 ${formatLine(overallLine)}로 집계되었습니다.\n종합 분석 결과를 감안하여 성과 기준치에 부합하는 고효율 채널로 매체 비중을 리밸런싱할 필요가 있습니다.`;

    return {
      daily: dailyComment,
      weekly: weeklyComment,
      monthly: monthlyComment
    };
  }, [integratedData, mediaTrendData, mediaBreakdownData, activeSubTab, selectedMedia, cfg]);

  return (
    <main className="hanssem-main">
      {/* 상단 탭 전환 바 */}
      <section className="section-header-with-action">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            className={`period-btn ${activeSubTab === 'integrated' ? '' : 'upload-btn-light'}`}
            style={{
              backgroundColor: activeSubTab === 'integrated' ? '#2563eb' : '#f1f5f9',
              color: activeSubTab === 'integrated' ? 'white' : '#475569',
              border: activeSubTab === 'integrated' ? 'none' : '1px solid #cbd5e1'
            }}
            onClick={() => {
              setActiveSubTab('integrated');
              setSelectedMedia('');
            }}
          >
            일자별_OverView
          </button>
          <button
            className={`period-btn ${activeSubTab === 'media' ? '' : 'upload-btn-light'}`}
            style={{
              backgroundColor: activeSubTab === 'media' ? '#2563eb' : '#f1f5f9',
              color: activeSubTab === 'media' ? 'white' : '#475569',
              border: activeSubTab === 'media' ? 'none' : '1px solid #cbd5e1'
            }}
            onClick={() => {
              setActiveSubTab('media');
              if (mediaList.length > 0) setSelectedMedia(mediaList[0]);
            }}
          >
            매체별_OverView
          </button>
        </div>

        {/* 필터 및 컨트롤 영역 */}
        <div className="overview-controls">
          {activeSubTab === 'media' && (
            <div className="control-item">
              <span className="control-label">매체 선택</span>
              <select
                className="media-select"
                value={selectedMedia}
                onChange={(e) => setSelectedMedia(e.target.value)}
              >
                {mediaList.map(media => (
                  <option key={media} value={media}>{media}</option>
                ))}
              </select>
            </div>
          )}

          <div className="control-item">
            <span className="control-label">기간 선택</span>
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
                      : '기간 선택'}
                  </button>
                }
              />
            </div>
          </div>

          <div className="control-item">
            <span className="control-label">일/주/월 단위</span>
            <div className="segmented-control">
              <button
                className={`segment-btn ${timeUnit === 'day' ? 'active' : ''}`}
                onClick={() => setTimeUnit('day')}
              >
                일별
              </button>
              <button
                className={`segment-btn ${timeUnit === 'week' ? 'active' : ''}`}
                onClick={() => setTimeUnit('week')}
              >
                주별
              </button>
              <button
                className={`segment-btn ${timeUnit === 'month' ? 'active' : ''}`}
                onClick={() => setTimeUnit('month')}
              >
                월별
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 1️⃣ [영역 1] OverView_성과 트렌드 렌더링 */}
      {/* ==================================================== */}
      {activeSubTab === 'integrated' && (
        <div className="overview-layout">
          {/* 좌측 75% 영역 */}
          <div className="overview-left-panel">
            {/* 차트 */}
            <div className="chart-card">
              <div className="chart-container-inner">
                {isLoading ? (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 600 }}>
                    데이터 분석 중...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={integratedData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="period" fontSize={11} tickLine={false} axisLine={false} minTickGap={40} />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke={cfg.barColor}
                        fontSize={11}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => val.toLocaleString('ko-KR')}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke={cfg.lineColor}
                        fontSize={11}
                        axisLine={false}
                        tickLine={false}
                        unit={datasetId === 'hanssem_hf' ? '%' : ''}
                        tickFormatter={(val) => val.toLocaleString('ko-KR')}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value, name) => {
                          if (name === cfg.lineLabel) {
                            return [datasetId === 'hanssem_hf' ? formatPercent(value) : formatWon(value), name];
                          }
                          return [value.toLocaleString('ko-KR') + '건', name];
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar yAxisId="left" dataKey={cfg.ordersKey} name={cfg.ordersLabel} fill={cfg.barColor} radius={[4, 4, 0, 0]} maxBarSize={20} />
                      <Line yAxisId="right" type="monotone" dataKey={cfg.lineKey} name={cfg.lineLabel} stroke={cfg.lineColor} strokeWidth={2.5} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* 일자별 요약 상세 데이터 테이블 */}
            <div className="table-card">
              <div className="detail-table-wrapper">
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>기간 ({timeUnit === 'day' ? '일별' : timeUnit === 'week' ? '주별' : '월별'})</th>
                      {cfg.tableColumns.slice(1).map((col) => (
                        <th key={col.key} className="number">{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {integratedData.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{row.period}</td>
                        {cfg.tableColumns.slice(1).map((col) => {
                          let val = row[col.key];
                          if (col.key === 'cvr') val = row.cvr;
                          if (col.key === 'roas') val = row.roas;
                          if (col.key === 'purchase_cvr') val = row.purchase_cvr;
                          return (
                            <td key={col.key} className="number" style={col.key === cfg.lineKey ? { color: cfg.lineColor, fontWeight: 600 } : col.key === cfg.ordersKey ? { color: cfg.barColor, fontWeight: 600 } : {}}>
                              {formatValue(val, col.format)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {integratedData.length === 0 && (
                      <tr>
                        <td colSpan={cfg.tableColumns.length} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>데이터가 존재하지 않습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 우측 25% AI 사이드바 */}
          <div className="overview-right-panel">
            <div className="ai-commentary-card">
              <div className="ai-commentary-header">
                <span className="material-symbols-outlined icon">smart_toy</span>
                <h3>AI 성과 코멘트</h3>
              </div>
              
              <div className="ai-comment-section">
                <div className="ai-comment-section-title">전기 성과 대조</div>
                <div className="ai-comment-content">{aiComments.daily}</div>
              </div>

              <div className="ai-comment-section">
                <div className="ai-comment-section-title">매체별 성과 기여</div>
                <div className="ai-comment-content">{aiComments.weekly}</div>
              </div>

              <div className="ai-comment-section">
                <div className="ai-comment-section-title">성과 최적화 권장사항</div>
                <div className="ai-comment-content">{aiComments.monthly}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2️⃣ [영역 2] 매체별_OverView 렌더링 */}
      {/* ==================================================== */}
      {activeSubTab === 'media' && (
        <div className="overview-layout">
          {/* 좌측 75% 영역 */}
          <div className="overview-left-panel">
            {/* 차트 */}
            <div className="chart-card">
              <h3 className="chart-title">[ {selectedMedia} 성과 트렌드 ]</h3>
              <div className="chart-container-inner">
                {isLoading ? (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 600 }}>
                    데이터 분석 중...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={mediaTrendData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="period" fontSize={11} tickLine={false} axisLine={false} minTickGap={40} />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke={cfg.barColor}
                        fontSize={11}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => val.toLocaleString('ko-KR')}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke={cfg.lineColor}
                        fontSize={11}
                        axisLine={false}
                        tickLine={false}
                        unit={datasetId === 'hanssem_hf' ? '%' : ''}
                        tickFormatter={(val) => val.toLocaleString('ko-KR')}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value, name) => {
                          if (name === cfg.lineLabel) {
                            return [datasetId === 'hanssem_hf' ? formatPercent(value) : formatWon(value), name];
                          }
                          return [value.toLocaleString('ko-KR') + (name === cfg.bar2Label ? (datasetId === 'hanssem_hf' ? '명' : '건') : '건'), name];
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar yAxisId="left" dataKey={cfg.bar2Key} name={cfg.bar2Label} fill={cfg.bar2Color} opacity={0.6} radius={[4, 4, 0, 0]} maxBarSize={15} />
                      <Bar yAxisId="left" dataKey={cfg.ordersKey} name={cfg.ordersLabel} fill={cfg.barColor} radius={[4, 4, 0, 0]} maxBarSize={15} />
                      <Line yAxisId="right" type="monotone" dataKey={cfg.lineKey} name={cfg.lineLabel} stroke={cfg.lineColor} strokeWidth={2.5} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* 매체별 요약 상세 데이터 테이블 */}
            <div className="table-card">
              <div className="detail-table-wrapper">
                <table className="detail-table">
                  <thead>
                    <tr>
                      {cfg.tableColumns.map((col) => (
                        <th key={col.key} className={col.key !== 'media' ? 'number' : ''}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mediaBreakdownData.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{row.media}</td>
                        {cfg.tableColumns.slice(1).map((col) => {
                          let val = row[col.key];
                          if (col.key === 'cvr') val = row.cvr;
                          if (col.key === 'roas') val = row.roas;
                          if (col.key === 'purchase_cvr') val = row.purchase_cvr;
                          return (
                            <td key={col.key} className="number" style={col.key === cfg.lineKey ? { color: cfg.lineColor, fontWeight: 600 } : col.key === cfg.ordersKey ? { color: cfg.barColor, fontWeight: 600 } : {}}>
                              {formatValue(val, col.format)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {mediaBreakdownData.length === 0 && (
                      <tr>
                        <td colSpan={cfg.tableColumns.length} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>데이터가 존재하지 않습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 우측 25% AI 사이드바 */}
          <div className="overview-right-panel">
            <div className="ai-commentary-card">
              <div className="ai-commentary-header">
                <span className="material-symbols-outlined icon">smart_toy</span>
                <h3>AI 매체 코멘트</h3>
              </div>
              
              <div className="ai-comment-section">
                <div className="ai-comment-section-title">전기 대비 변동</div>
                <div className="ai-comment-content">{aiComments.daily}</div>
              </div>

              <div className="ai-comment-section">
                <div className="ai-comment-section-title">매체 성과 진단</div>
                <div className="ai-comment-content">{aiComments.weekly}</div>
              </div>

              <div className="ai-comment-section">
                <div className="ai-comment-section-title">성과 최적화 권장사항</div>
                <div className="ai-comment-content">{aiComments.monthly}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default CommonTrendView;
