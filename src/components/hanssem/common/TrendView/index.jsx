import React, { useState, useEffect, useMemo } from 'react';
import '../../../../styles/HanssemPerformance.css';
import * as hanssemApi from '../../../../api/geo/hanssemApi';
import * as hanssemHfApi from '../../../../api/geo/hanssemHfApi';

// 하위 컴포넌트 임포트
import TrendControls from './TrendControls';
import TrendChartSection from './TrendChartSection';
import TrendTableSection from './TrendTableSection';
import TrendAiSidebar from './TrendAiSidebar';
import { buildPerformanceComments } from './buildPerformanceComments';

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
  const aiComments = useMemo(() => buildPerformanceComments({
    data: activeSubTab === 'integrated' ? integratedData : mediaTrendData,
    mediaBreakdownData,
    cfg,
    activeSubTab,
    selectedMedia,
    trendData,
    getPeriod: date => timeUnit === 'week' ? getWeekKey(date) : timeUnit === 'month' ? getMonthKey(date) : date
  }), [integratedData, mediaTrendData, mediaBreakdownData, activeSubTab, selectedMedia, cfg, trendData, timeUnit]);
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
