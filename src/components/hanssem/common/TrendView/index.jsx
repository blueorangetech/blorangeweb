import React, { useState, useEffect, useMemo } from 'react';
import '../../../../styles/HanssemPerformance.css';
import * as hanssemApi from '../../../../api/geo/hanssemApi';
import * as hanssemHfApi from '../../../../api/geo/hanssemHfApi';

// 하위 컴포넌트 임포트
import TrendControls from './TrendControls';
import TrendChartSection from './TrendChartSection';
import TrendTableSection from './TrendTableSection';
import TrendAiSidebar from './TrendAiSidebar';

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
      const api = datasetId === 'hanssem_hf' ? hanssemHfApi : hanssemApi;
      try {
        const rawData = await api.fetchTrendData({ startDate, endDate });
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

    const dailyComment = `최근 분석 구간(${last.period})의 ${cfg.ordersLabel}는 이전 구간(${prev.period}) 대비 ${valWord}했습니다.\n효율 지표인 ${cfg.lineLabel}의 경우 기존 ${formatLine(prevLineVal)}에서 ${formatLine(lastLineVal)} 수준으로 ${lineWord}하여 전반적 성과 변동이 발생했습니다.`;

    const topMedia = mediaBreakdownData[0];
    const bestLineMedia = [...mediaBreakdownData].sort((a, b) =>
      cfg.lineKey === 'roas' ? b.roas - a.roas : (a.cpa || Infinity) - (b.cpa || Infinity)
    )[0];

    const formatLineMedia = (row) => row ? (cfg.lineKey === 'roas' ? formatPercent(row.roas) : formatWon(row.cpa)) : '0';

    const weeklyComment = activeSubTab === 'integrated'
      ? `전체 매체 중 가장 많은 성과를 낸 곳은 [${topMedia?.media || '기타'}] 매체로, 총 ${formatInt(topMedia?.[cfg.ordersKey])}건의 ${cfg.ordersLabel}를 견인했습니다.\n가장 우수한 효율을 기록한 매체는 [${bestLineMedia?.media || '기타'}] (지표: ${formatLineMedia(bestLineMedia)})입니다.`
      : `[${selectedMedia}] 매체의 기간 평균 효율은 ${cfg.lineLabel} 기준 ${formatLine(last[cfg.lineKey])}로 확인되며, 누적 집행비용은 ${formatWon(last.cost)}입니다.\nCPA/ROAS 효율 추이를 반영해 타겟팅 고도화 활동을 전개할 것을 제안합니다.`;

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
      <TrendControls
        activeSubTab={activeSubTab}
        setActiveSubTab={(tab) => {
          setActiveSubTab(tab);
          if (tab === 'integrated') setSelectedMedia('');
          else if (tab === 'media' && mediaList.length > 0) setSelectedMedia(mediaList[0]);
        }}
        mediaList={mediaList}
        selectedMedia={selectedMedia}
        setSelectedMedia={setSelectedMedia}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        timeUnit={timeUnit}
        setTimeUnit={setTimeUnit}
      />

      <div className="overview-layout">
        {/* 좌측 75% 영역 */}
        <div className="overview-left-panel">
          <TrendChartSection
            isLoading={isLoading}
            activeSubTab={activeSubTab}
            integratedData={integratedData}
            mediaTrendData={mediaTrendData}
            cfg={cfg}
            datasetId={datasetId}
            formatPercent={formatPercent}
            formatWon={formatWon}
            selectedMedia={selectedMedia}
          />

          <TrendTableSection
            activeSubTab={activeSubTab}
            timeUnit={timeUnit}
            integratedData={integratedData}
            mediaBreakdownData={mediaBreakdownData}
            cfg={cfg}
            formatValue={formatValue}
          />
        </div>

        {/* 우측 25% AI 사이드바 */}
        <div className="overview-right-panel">
          <TrendAiSidebar
            aiComments={aiComments}
            activeSubTab={activeSubTab}
          />
        </div>
      </div>
    </main>
  );
}

export default CommonTrendView;
