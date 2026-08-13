import React, { useState, useEffect, useMemo } from 'react';
import '../../../../styles/HanssemMediaMix.css';
import * as hanssemApi from '../../../../api/geo/hanssemApi';
import * as hanssemHfApi from '../../../../api/geo/hanssemHfApi';
import { formatDate } from '../../../../api/geo/bigquery';

// 하위 컴포넌트 임포트
import MediaMixFilterPanel from './MediaMixFilterPanel';
import MediaMixDetailTable from './MediaMixDetailTable';
import MediaMixTrendChart from './MediaMixTrendChart';

// 데이터 포맷 유틸리티
const formatInt = (val) => Math.round(Number(val) || 0).toLocaleString('ko-KR');
const formatPercent = (val) => (Number(val) || 0).toFixed(2) + '%';
const formatWon = (val) => Math.round(Number(val) || 0).toLocaleString('ko-KR') + '원';
const formatPeople = (val) => Math.round(Number(val) || 0).toLocaleString('ko-KR') + '명';

const formatCell = (val, format) => {
  if (format === 'won') return formatWon(val);
  if (format === 'percent') return formatPercent(val);
  if (format === 'people') return formatPeople(val);
  return formatInt(val);
};

// CSV 다운로드 유틸리티
const downloadCSV = (headers, rows, filename) => {
  const content = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(val => `"${val}"`).join(','))
  ].join('\n');

  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 부서별 필터 설정
const FILTER_KEYS_CONFIG = {
  hanssem: [
    { id: 'classification', label: '집행 구분', field: 'classification' },
    { id: 'media', label: '매체', field: 'media' },
    { id: 'media_detail', label: '매체 상세', field: 'media_detail' },
    { id: 'targeting', label: '타게팅', field: 'utm_content_8' },
    { id: 'placement', label: '소재 유형', field: 'utm_content_2' },
    { id: 'category', label: '카테고리', field: 'utm_content_1' },
    { id: 'creative_name', label: '소재 고유명', field: 'utm_content_5' },
    { id: 'main_copy', label: '주 메시지', field: 'utm_content_3' },
    { id: 'sub_copy', label: '서브 메시지', field: 'utm_content_4' }
  ],
  hanssem_hf: [
    { id: 'media', label: '매체', field: 'media' },
    { id: 'device', label: '디바이스', field: 'device' },
    { id: 'ad_type', label: '광고 유형', field: 'ad_type' },
    { id: 'business_unit', label: '사업부', field: 'business_unit' },
    { id: 'creative_type', label: '크리에이티브 유형', field: 'creative_type' },
    { id: 'landing', label: '랜딩', field: 'landing' },
    { id: 'ad_objective', label: '광고 목적', field: 'ad_objective' },
    { id: 'targeting', label: '타겟팅', field: 'targeting' }
  ]
};

// 부서별 메트릭 정의
const METRIC_DEFINITIONS = {
  hanssem: [
    { key: 'cost', label: '소진비용', format: 'won' },
    { key: 'impressions', label: '노출', format: 'int' },
    { key: 'clicks', label: '클릭', format: 'int' },
    { key: 'ctr', label: 'CTR', format: 'percent' },
    { key: 'cpc', label: 'CPC', format: 'won' },
    { key: 'cpm', label: 'CPM', format: 'won' },
    { key: 'consultation', label: '상담신청수', format: 'int' },
    { key: 'consultation_cpa', label: '상담신청CPA', format: 'won' },
    { key: 'distribution', label: '배분수', format: 'int' },
    { key: 'cpa', label: '배분 CPA', format: 'won' },
    { key: 'cvr', label: '배분 CVR', format: 'percent' }
  ],
  hanssem_hf: [
    { key: 'cost', label: '소진비용', format: 'won' },
    { key: 'impressions', label: '노출', format: 'int' },
    { key: 'clicks', label: '클릭', format: 'int' },
    { key: 'ctr', label: 'CTR', format: 'percent' },
    { key: 'cpc', label: 'CPC', format: 'won' },
    { key: 'cpm', label: 'CPM', format: 'won' },
    { key: 'users', label: '유입 유저수', format: 'people' },
    { key: 'orders', label: '구매 건수', format: 'int' },
    { key: 'revenue', label: '매출액', format: 'won' },
    { key: 'roas', label: 'ROAS', format: 'percent' },
    { key: 'purchase_cvr', label: '구매 CVR', format: 'percent' }
  ]
};

function CommonMediaMixCampaignView({ datasetId, startDate, endDate, setStartDate, setEndDate }) {
  const [fullData, setFullData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 상단 필터 선택 상태
  const [selectedFilters, setSelectedFilters] = useState({});

  // 그래프 가독 지표 선택 상태
  const [selectedMetric, setSelectedMetric] = useState(datasetId === 'hanssem' ? 'cpa' : 'roas');

  // 그래프 노출 단위 ('month' 고정 - 월 단위 집계 데이터 사용)
  const [timeUnit, setTimeUnit] = useState('month');

  // 조건 1 vs 조건 2 모드 상태 (기본은 고정 기간 비교 = 조건 1)
  const [isDateModeActive, setIsDateModeActive] = useState(false);

  // 1. 초기 필터 세팅 및 필터 변경 시 초기화
  const filterKeys = useMemo(() => FILTER_KEYS_CONFIG[datasetId] || FILTER_KEYS_CONFIG.hanssem, [datasetId]);
  const metrics = useMemo(() => METRIC_DEFINITIONS[datasetId] || METRIC_DEFINITIONS.hanssem, [datasetId]);

  useEffect(() => {
    const initial = {};
    filterKeys.forEach(f => {
      initial[f.id] = 'all';
    });
    setSelectedFilters(initial);
    setSelectedMetric(datasetId === 'hanssem' ? 'cpa' : 'roas');
  }, [datasetId, filterKeys]);

  // 날짜가 해제되면 고정 기간 비교 모드로 복귀
  useEffect(() => {
    if (!startDate && !endDate) {
      setIsDateModeActive(false);
    }
  }, [startDate, endDate]);

  // 2. 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const today = new Date();
      let startStr, endStr;

      if (isDateModeActive && startDate && endDate) {
        // 월별 성과 추이 모드: 사용자가 선택한 기간
        startStr = formatDate(startDate);
        endStr = formatDate(endDate);
      } else {
        // 고정 기간 비교 모드: 오늘 기준 직전 6개월 1일 ~ 오늘
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        startStr = formatDate(sixMonthsAgo);
        endStr = formatDate(today);
      }

      const api = datasetId === 'hanssem_hf' ? hanssemHfApi : hanssemApi;
      try {
        const data = await api.fetchMaterialMonthly({ startDate: startStr, endDate: endStr });
        setFullData(data);
      } catch (error) {
        console.error('BigQuery Fetch Error:', error);
        setFullData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, datasetId, isDateModeActive]);

  // 3. 필터 선택 항목을 기준으로 필터 옵션 추출 (Dynamic Dependent Dropdowns)
  const filterOptions = useMemo(() => {
    const options = {};
    filterKeys.forEach(f => {
      options[f.id] = new Set();
    });

    fullData.forEach(item => {
      let passes = true;
      for (const f of filterKeys) {
        const selectedVal = selectedFilters[f.id];
        if (selectedVal && selectedVal !== 'all') {
          const itemVal = String(item[f.field] || '');
          if (itemVal !== selectedVal) {
            passes = false;
            break;
          }
        }
      }

      if (passes) {
        filterKeys.forEach(f => {
          const val = item[f.field];
          if (val !== undefined && val !== null && val !== '') {
            options[f.id].add(String(val));
          }
        });
      }
    });

    const sortedOptions = {};
    filterKeys.forEach(f => {
      sortedOptions[f.id] = Array.from(options[f.id]).sort();
    });
    return sortedOptions;
  }, [fullData, selectedFilters, filterKeys]);

  // 4. 필터가 완벽하게 적용된 최종 데이터
  const filteredData = useMemo(() => {
    return fullData.filter(item => {
      for (const f of filterKeys) {
        const selectedVal = selectedFilters[f.id];
        if (selectedVal && selectedVal !== 'all') {
          const itemVal = String(item[f.field] || '');
          if (itemVal !== selectedVal) return false;
        }
      }
      return true;
    });
  }, [fullData, selectedFilters, filterKeys]);

  // 5. 조건 1 데이터 빌드 (당월, 전월, 3개월, 6개월)
  const condition1Data = useMemo(() => {
    if (filteredData.length === 0) return [];

    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();

    const toYM = (year, month0) => {
      const absMonth = ((year * 12 + month0) % (12 * 10000));
      const realYear = year + Math.floor(month0 / 12);
      const realMonth = ((month0 % 12) + 12) % 12;
      return `${realYear}-${String(realMonth + 1).padStart(2, '0')}`;
    };

    const ymCurrent = toYM(y, m);
    const ymPrev    = toYM(y, m - 1);
    const ym3Start  = toYM(y, m - 3);
    const ym6Start  = toYM(y, m - 6);

    const periods = [
      {
        key: 'current',
        label: `당월 (${y}.${String(m + 1).padStart(2, '0')})`,
        startYM: ymCurrent,
        endYM: ymCurrent,
      },
      {
        key: 'prev',
        label: `전월 (${ymPrev.replace('-', '.')})`,
        startYM: ymPrev,
        endYM: ymPrev,
      },
      {
        key: '3months',
        label: '직전 3개월',
        startYM: ym3Start,
        endYM: ymPrev,
      },
      {
        key: '6months',
        label: '직전 6개월',
        startYM: ym6Start,
        endYM: ymPrev,
      },
    ];

    const isHf = datasetId === 'hanssem_hf';
    return periods.map(p => {
      const rows = filteredData.filter(item => {
        const ym = item.year_month || (item.date ? item.date.slice(0, 7) : null);
        if (!ym) return false;
        return ym >= p.startYM && ym <= p.endYM;
      });

      let cost = 0, impressions = 0, clicks = 0;
      let consultation = 0, distribution = 0;
      let users = 0, orders = 0, revenue = 0;

      rows.forEach(r => {
        impressions += Number(r.impressions || 0);
        clicks      += Number(r.clicks || 0);
        if (isHf) {
          cost    += Number(r.total_cost || r.cost || 0);
          users   += Number(r.total_users || 0);
          orders  += Number(r.total_orders || 0);
          revenue += Number(r.total_revenue || 0);
        } else {
          cost         += Number(r.cost || 0);
          consultation += Number(r.consultation || 0);
          distribution += Number(r.distribution || 0);
        }
      });

      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cpc = clicks > 0 ? cost / clicks : 0;
      const cpm = impressions > 0 ? (cost / impressions) * 1000 : 0;

      if (isHf) {
        return {
          rowName: p.label,
          cost, impressions, clicks, ctr, cpc, cpm,
          users, orders, revenue,
          roas: cost > 0 ? (revenue / cost) * 100 : 0,
          purchase_cvr: users > 0 ? (orders / users) * 100 : 0,
        };
      } else {
        return {
          rowName: p.label,
          cost, impressions, clicks, ctr, cpc, cpm,
          consultation, distribution,
          consultation_cpa: consultation > 0 ? cost / consultation : 0,
          cpa: distribution > 0 ? cost / distribution : 0,
          cvr: consultation > 0 ? (distribution / consultation) * 100 : 0,
        };
      }
    });
  }, [filteredData, datasetId]);

  // 6. 조건 2 데이터 빌드 (선택 기간 월별 집계 및 합계 / 월평균)
  const condition2Data = useMemo(() => {
    if (filteredData.length === 0) return { list: [], total: null, avg: null };

    const isHf = datasetId === 'hanssem_hf';
    const groups = {};

    filteredData.forEach(r => {
      const ym = r.year_month
        || (r.date ? (() => {
            const d = new Date(r.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          })() : null);
      if (!ym) return;

      const [yearStr, monthStr] = ym.split('-');
      const label = `${yearStr}년 ${parseInt(monthStr, 10)}월`;

      if (!groups[ym]) {
        groups[ym] = { key: ym, label, rows: [] };
      }
      groups[ym].rows.push(r);
    });

    const list = Object.values(groups).map(g => {
      let cost = 0;
      let impressions = 0;
      let clicks = 0;
      let consultation = 0;
      let distribution = 0;
      let users = 0;
      let orders = 0;
      let revenue = 0;

      g.rows.forEach(r => {
        impressions += Number(r.impressions || 0);
        clicks += Number(r.clicks || 0);
        if (isHf) {
          cost += Number(r.total_cost || r.cost || 0);
          users += Number(r.total_users || 0);
          orders += Number(r.total_orders || 0);
          revenue += Number(r.total_revenue || 0);
        } else {
          cost += Number(r.cost || 0);
          consultation += Number(r.consultation || 0);
          distribution += Number(r.distribution || 0);
        }
      });

      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cpc = clicks > 0 ? cost / clicks : 0;
      const cpm = impressions > 0 ? (cost / impressions) * 1000 : 0;

      if (isHf) {
        const roas = cost > 0 ? (revenue / cost) * 100 : 0;
        const purchase_cvr = users > 0 ? (orders / users) * 100 : 0;
        return {
          rowName: g.label,
          key: g.key,
          cost, impressions, clicks, ctr, cpc, cpm,
          users, orders, revenue, roas, purchase_cvr
        };
      } else {
        const consultation_cpa = consultation > 0 ? cost / consultation : 0;
        const cpa = distribution > 0 ? cost / distribution : 0;
        const cvr = consultation > 0 ? (distribution / consultation) * 100 : 0;
        return {
          rowName: g.label,
          key: g.key,
          cost, impressions, clicks, ctr, cpc, cpm,
          consultation, consultation_cpa, distribution, cpa, cvr
        };
      }
    }).sort((a, b) => a.key.localeCompare(b.key));

    let totalCost = 0;
    let totalImp = 0;
    let totalClicks = 0;
    let totalConsult = 0;
    let totalDist = 0;
    let totalUsers = 0;
    let totalOrders = 0;
    let totalRev = 0;

    list.forEach(item => {
      totalCost += item.cost;
      totalImp += item.impressions;
      totalClicks += item.clicks;
      if (isHf) {
        totalUsers += item.users;
        totalOrders += item.orders;
        totalRev += item.revenue;
      } else {
        totalConsult += item.consultation;
        totalDist += item.distribution;
      }
    });

    const totalCtr = totalImp > 0 ? (totalClicks / totalImp) * 100 : 0;
    const totalCpc = totalClicks > 0 ? totalCost / totalClicks : 0;
    const totalCpm = totalImp > 0 ? (totalCost / totalImp) * 1000 : 0;

    let totalRow = {};
    let totalConsultCpa = 0;
    let totalCpa = 0;
    let totalCvr = 0;
    if (isHf) {
      const totalRoas = totalCost > 0 ? (totalRev / totalCost) * 100 : 0;
      const totalPurchaseCvr = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0;
      totalRow = {
        rowName: '합계',
        cost: totalCost, impressions: totalImp, clicks: totalClicks,
        ctr: totalCtr, cpc: totalCpc, cpm: totalCpm,
        users: totalUsers, orders: totalOrders, revenue: totalRev,
        roas: totalRoas, purchase_cvr: totalPurchaseCvr
      };
    } else {
      totalConsultCpa = totalConsult > 0 ? totalCost / totalConsult : 0;
      totalCpa = totalDist > 0 ? totalCost / totalDist : 0;
      totalCvr = totalConsult > 0 ? (totalDist / totalConsult) * 100 : 0;
      totalRow = {
        rowName: '합계',
        cost: totalCost, impressions: totalImp, clicks: totalClicks,
        ctr: totalCtr, cpc: totalCpc, cpm: totalCpm,
        consultation: totalConsult, consultation_cpa: totalConsultCpa,
        distribution: totalDist, cpa: totalCpa, cvr: totalCvr
      };
    }

    const monthCount = list.length || 1;
    let avgRow = {};
    if (isHf) {
      avgRow = {
        rowName: '월평균',
        cost: totalCost / monthCount,
        impressions: totalImp / monthCount,
        clicks: totalClicks / monthCount,
        ctr: totalCtr,
        cpc: totalCpc,
        cpm: totalCpm,
        users: totalUsers / monthCount,
        orders: totalOrders / monthCount,
        revenue: totalRev / monthCount,
        roas: totalCost > 0 ? (totalRev / totalCost) * 100 : 0,
        purchase_cvr: totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0
      };
    } else {
      avgRow = {
        rowName: '월평균',
        cost: totalCost / monthCount,
        impressions: totalImp / monthCount,
        clicks: totalClicks / monthCount,
        ctr: totalCtr,
        cpc: totalCpc,
        cpm: totalCpm,
        consultation: totalConsult / monthCount,
        consultation_cpa: totalConsultCpa,
        distribution: totalDist / monthCount,
        cpa: totalCpa,
        cvr: totalCvr
      };
    }

    return { list, total: totalRow, avg: avgRow };
  }, [filteredData, datasetId]);

  // 7. 성과 효율 추이 그래프 계산
  const trendChartData = useMemo(() => {
    if (filteredData.length === 0) return [];

    const isHf = datasetId === 'hanssem_hf';
    const groups = {};

    const getMonthKey = (ym) => {
      if (!ym) return 'Unknown';
      const [yearStr, monthStr] = ym.split('-');
      return `${yearStr}년 ${parseInt(monthStr, 10)}월`;
    };

    filteredData.forEach(r => {
      const ym = r.year_month || (r.date ? r.date.slice(0, 7) : null);
      if (!ym) return;
      const key = getMonthKey(ym);

      if (!groups[key]) {
        groups[key] = { key, rows: [] };
      }
      groups[key].rows.push(r);
    });

    const timeSeries = Object.values(groups).map(g => {
      let cost = 0;
      let impressions = 0;
      let clicks = 0;
      let consultation = 0;
      let distribution = 0;
      let users = 0;
      let orders = 0;
      let revenue = 0;

      g.rows.forEach(r => {
        impressions += Number(r.impressions || 0);
        clicks += Number(r.clicks || 0);
        if (isHf) {
          cost += Number(r.total_cost || r.cost || 0);
          users += Number(r.total_users || 0);
          orders += Number(r.total_orders || 0);
          revenue += Number(r.total_revenue || 0);
        } else {
          cost += Number(r.cost || 0);
          consultation += Number(r.consultation || 0);
          distribution += Number(r.distribution || 0);
        }
      });

      let value = 0;
      if (selectedMetric === 'cost') value = cost;
      else if (selectedMetric === 'impressions') value = impressions;
      else if (selectedMetric === 'clicks') value = clicks;
      else if (selectedMetric === 'ctr') value = impressions > 0 ? (clicks / impressions) * 100 : 0;
      else if (selectedMetric === 'cpc') value = clicks > 0 ? cost / clicks : 0;
      else if (selectedMetric === 'cpm') value = impressions > 0 ? (cost / impressions) * 1000 : 0;
      else if (selectedMetric === 'consultation') value = consultation;
      else if (selectedMetric === 'consultation_cpa') value = consultation > 0 ? cost / consultation : 0;
      else if (selectedMetric === 'distribution') value = distribution;
      else if (selectedMetric === 'cpa') value = distribution > 0 ? cost / distribution : 0;
      else if (selectedMetric === 'cvr') value = consultation > 0 ? (distribution / consultation) * 100 : 0;
      else if (selectedMetric === 'users') value = users;
      else if (selectedMetric === 'orders') value = orders;
      else if (selectedMetric === 'revenue') value = revenue;
      else if (selectedMetric === 'roas') value = cost > 0 ? (revenue / cost) * 100 : 0;
      else if (selectedMetric === 'purchase_cvr') value = users > 0 ? (orders / users) * 100 : 0;

      return {
        key: g.key,
        value,
        cost
      };
    });

    timeSeries.sort((a, b) => a.key.localeCompare(b.key));

    return timeSeries.map((point, index) => {
      let pctChange = null;
      if (index > 0) {
        const prev = timeSeries[index - 1].value;
        if (prev > 0) {
          pctChange = ((point.value - prev) / prev) * 100;
        }
      }
      return {
        ...point,
        pctChange
      };
    });
  }, [filteredData, datasetId, selectedMetric]);

  // 8. 효율 범위 데이터 표 계산
  const statsData = useMemo(() => {
    if (trendChartData.length === 0) return { mean: 0, median: 0, max: 0, min: 0, totalBudget: 0 };

    const values = trendChartData.map(p => p.value).filter(v => !isNaN(v) && isFinite(v));
    const totalBudget = trendChartData.reduce((acc, curr) => acc + curr.cost, 0);

    if (values.length === 0) return { mean: 0, median: 0, max: 0, min: 0, totalBudget };

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;

    const sorted = [...values].sort((a, b) => a - b);
    const half = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;

    const max = Math.max(...values);
    const min = Math.min(...values);

    return { mean, median, max, min, totalBudget };
  }, [trendChartData]);

  // 9. 리셋 및 엑셀 다운로드
  const handleResetFilters = () => {
    const reset = {};
    filterKeys.forEach(f => {
      reset[f.id] = 'all';
    });
    setSelectedFilters(reset);
    setStartDate(null);
    setEndDate(null);
    setIsDateModeActive(false);
  };

  const handleExportExcel = () => {
    const activeMetrics = metrics;
    const activeList = isDateModeActive
      ? [...condition2Data.list, condition2Data.total, condition2Data.avg].filter(Boolean)
      : condition1Data;

    const headers = ['구분', ...activeMetrics.map(m => m.label)];
    const rows = activeList.map(row => {
      return [
        row.rowName,
        ...activeMetrics.map(m => {
          const val = row[m.key];
          if (m.format === 'won') return Math.round(Number(val) || 0);
          if (m.format === 'percent') return (Number(val) || 0).toFixed(2) + '%';
          return Math.round(Number(val) || 0);
        })
      ];
    });

    const fileTitle = datasetId === 'hanssem' ? '한샘_리하우스' : '한샘_홈퍼니싱';
    downloadCSV(headers, rows, `${fileTitle}_캠페인_매체별_성과.csv`);
  };

  const activeMetricMeta = useMemo(() => {
    return metrics.find(m => m.key === selectedMetric) || metrics[0];
  }, [metrics, selectedMetric]);

  return (
    <div className="mediamix-container">
      <MediaMixFilterPanel
        filterKeys={filterKeys}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        filterOptions={filterOptions}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        setIsDateModeActive={setIsDateModeActive}
        onExportExcel={handleExportExcel}
        onResetFilters={handleResetFilters}
      />

      <MediaMixDetailTable
        isDateModeActive={isDateModeActive}
        setIsDateModeActive={setIsDateModeActive}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        datasetId={datasetId}
        isLoading={isLoading}
        filteredData={filteredData}
        condition1Data={condition1Data}
        condition2Data={condition2Data}
        metrics={metrics}
        formatCell={formatCell}
      />

      <MediaMixTrendChart
        filteredData={filteredData}
        selectedMetric={selectedMetric}
        setSelectedMetric={setSelectedMetric}
        metrics={metrics}
        trendChartData={trendChartData}
        activeMetricMeta={activeMetricMeta}
        statsData={statsData}
        formatCell={formatCell}
        formatWon={formatWon}
      />
    </div>
  );
}

export default CommonMediaMixCampaignView;
