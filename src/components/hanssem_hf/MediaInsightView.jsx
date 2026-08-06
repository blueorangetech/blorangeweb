import React, { useState, useEffect, useRef, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';
import '../../styles/HanssemInsight.css';
import '../../styles/HanssemCompare.css';
import { CreativeCard } from '.';
import { getCanonicalMedia, mediaLogos } from '../../utils/mediaUtils';
import { chartData } from './common/filterMaps';

function InsightView({ startDate, endDate, setStartDate, setEndDate }) {
  // 필터 상태 통합 관리
  const [selectedFilters, setSelectedFilters] = useState({
    media: ['all'],
    device: ['all'],
    ad_type: ['all'],
    business_unit: ['all'],
    creative_type: ['all'],
    landing: ['all'],
    ad_objective: ['all'],
    targeting: ['all']
  });

  // 어떤 드롭다운이 열려있는지 관리
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleDropdown = (id) => {
    if (openDropdown === id) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(id);
      setSearchQuery(''); // 드롭다운 열 때마다 검색어 초기화
    }
  };

  const [realData, setRealData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 무한 스크롤 관련 상태
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  // 성과 임계치 필터 관련 상태
  const [orderFilterInput, setOrderFilterInput] = useState(0);
  const [costFilterInput, setCostFilterInput] = useState(0);
  const [roasFilterInput, setRoasFilterInput] = useState(0);
  const [appliedOrder, setAppliedOrder] = useState(0);
  const [appliedCost, setAppliedCost] = useState(0);
  const [appliedRoas, setAppliedRoas] = useState(0);

  // 정렬 관련 상태 (기본값: ROAS 내림차순)
  const [sortConfig, setSortConfig] = useState('roas-desc');

  // 테이블 페이지네이션 상태
  const [tablePage, setTablePage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // 탭 메뉴 데이터 및 옵션은 동적 생성을 위해 아래 필터링된 데이터 부분으로 이동했습니다.

  const [realTableData, setRealTableData] = useState([]);

  // 날짜가 바뀌면 데이터와 오프셋 초기화
  useEffect(() => {
    setRealData([]);
    setRealTableData([]);
    setOffset(0);
    setHasMore(true);
  }, [startDate, endDate]);

  // 데이터 테이블용 Fetch
  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchTableData = async () => {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const startStr = formatDate(startDate);
      const endStr = formatDate(endDate);

      const validFilters = {};
      Object.entries(selectedFilters).forEach(([key, values]) => {
        if (!values.includes('all')) {
          validFilters[key] = values;
        }
      });
      const filterParam = Object.keys(validFilters).length > 0 ? `&filters=${encodeURIComponent(JSON.stringify(validFilters))}` : '';
      const perfParams = `&min_cost=${appliedCost}&min_roas=${appliedRoas}&min_distribution=${appliedOrder}`;

      try {
        const response = await fetch(
          `${API_BASE_URL}/search/bigquery/date?dataset_id=hanssem_hf&table_id=performance_raw&report_type=data_table&start_date=${startStr}&end_date=${endStr}${filterParam}${perfParams}`
        );
        if (response.ok) {
          const result = await response.json();
          setRealTableData(Array.isArray(result) ? result : (result.data || []));
        }
      } catch (error) {
        console.error('Table Data Fetch Error:', error);
      }
    };

    fetchTableData();
  }, [startDate, endDate, selectedFilters, appliedCost, appliedRoas, appliedOrder]);

  // 실제 데이터 가져오기 (useEffect)
  useEffect(() => {
    if (!startDate || !endDate || !hasMore || isLoading) return;

    const fetchBigQueryData = async () => {
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

      const validFilters = {};
      Object.entries(selectedFilters).forEach(([key, values]) => {
        if (!values.includes('all')) {
          validFilters[key] = values;
        }
      });
      const filterParam = Object.keys(validFilters).length > 0 ? `&filters=${encodeURIComponent(JSON.stringify(validFilters))}` : '';
      const perfParams = `&min_cost=${appliedCost}&min_roas=${appliedRoas}&min_distribution=${appliedOrder}`;

      try {
        const response = await fetch(
          `${API_BASE_URL}/search/bigquery/date?dataset_id=hanssem_hf&table_id=performance_raw&report_type=media_material&start_date=${startStr}&end_date=${endStr}&limit=${LIMIT}&offset=${offset}${filterParam}${perfParams}`
        );
        if (!response.ok) throw new Error('데이터 로드 실패');
        const result = await response.json();

        const newData = Array.isArray(result) ? result : (result.data || []);

        if (newData.length < LIMIT) {
          setHasMore(false);
        }

        setRealData(prev => offset === 0 ? newData : [...prev, ...newData]);
      } catch (error) {
        console.error('BigQuery Fetch Error:', error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBigQueryData();
  }, [startDate, endDate, offset, selectedFilters, appliedCost, appliedRoas, appliedOrder]);

  // 스크롤 감지 (Intersection Observer)
  const lastElementRef = useRef();
  useEffect(() => {
    if (isLoading || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setOffset(prev => prev + LIMIT);
      }
    }, { threshold: 0.1 });

    if (lastElementRef.current) {
      observer.observe(lastElementRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, hasMore]);

  // 필터 선택 처리
  const handleFilterSelect = (type, value) => {
    setSelectedFilters(prev => {
      if (value === 'all') {
        return { ...prev, [type]: ['all'] };
      } else {
        let next = prev[type].filter(v => v !== 'all');
        if (next.includes(value)) {
          next = next.filter(v => v !== value);
        } else {
          next = [...next, value];
        }
        if (next.length === 0) next = ['all'];
        return { ...prev, [type]: next };
      }
    });
  };

  // 성과 필터 적용/초기화
  const handleApplyPerformanceFilters = () => {
    setAppliedOrder(Number(orderFilterInput));
    setAppliedCost(Number(costFilterInput));
    setAppliedRoas(Number(roasFilterInput));
  };

  const handleResetPerformanceFilters = () => {
    setOrderFilterInput(0);
    setCostFilterInput(0);
    setRoasFilterInput(0);
    setAppliedOrder(0);
    setAppliedCost(0);
    setAppliedRoas(0);
  };

  // 필터링된 데이터 계산
  const displayData = realData.length > 0 ? realData : (offset === 0 ? chartData : []);

  // 동적 구성: 각 필드 고유값 추출
  const filterOptions = useMemo(() => {
    const sortedOptions = {
      media: [],
      device: [],
      ad_type: [],
      business_unit: [],
      creative_type: [],
      landing: [],
      ad_objective: [],
      targeting: []
    };

    const sets = {
      media: new Set(),
      device: new Set(),
      ad_type: new Set(),
      business_unit: new Set(),
      creative_type: new Set(),
      landing: new Set(),
      ad_objective: new Set(),
      targeting: new Set()
    };

    const dataForOptions = realTableData.length > 0 ? realTableData : chartData;
    dataForOptions.forEach(item => {
      if (item.media) sets.media.add(getCanonicalMedia(item.media));
      if (item.device) sets.device.add(item.device);
      if (item.ad_type) sets.ad_type.add(item.ad_type);
      if (item.business_unit) sets.business_unit.add(item.business_unit);
      if (item.creative_type) sets.creative_type.add(item.creative_type);
      if (item.landing) sets.landing.add(item.landing);
      if (item.ad_objective) sets.ad_objective.add(item.ad_objective);
      if (item.targeting) sets.targeting.add(item.targeting);
    });

    Object.keys(sets).forEach(key => {
      sortedOptions[key] = Array.from(sets[key]).sort();
    });

    const logos = Object.keys(mediaLogos);
    sortedOptions.media.sort((a, b) => {
      const idxA = logos.indexOf(a);
      const idxB = logos.indexOf(b);
      if (idxA === -1 && idxB === -1) return a.localeCompare(b);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    return sortedOptions;
  }, [realTableData]);

  const filterConfigs = useMemo(() => [
    { id: 'media', label: '매체', options: filterOptions.media },
    { id: 'device', label: '디바이스', options: filterOptions.device },
    { id: 'ad_type', label: '광고유형', options: filterOptions.ad_type },
    { id: 'business_unit', label: '사업부/기획전', options: filterOptions.business_unit },
    { id: 'creative_type', label: '소재분류', options: filterOptions.creative_type },
    { id: 'landing', label: '랜딩', options: filterOptions.landing },
    { id: 'ad_objective', label: '광고목표', options: filterOptions.ad_objective },
    { id: 'targeting', label: '타게팅', options: filterOptions.targeting },
  ], [filterOptions]);

  const filteredData = useMemo(() => {
    let data = displayData.filter(item => {
      const matchesMedia = selectedFilters.media.includes('all') || selectedFilters.media.includes(getCanonicalMedia(item.media));
      const matchesDevice = selectedFilters.device.includes('all') || selectedFilters.device.includes(item.device);
      const matchesAdType = selectedFilters.ad_type.includes('all') || selectedFilters.ad_type.includes(item.ad_type);
      const matchesBusinessUnit = selectedFilters.business_unit.includes('all') || selectedFilters.business_unit.includes(item.business_unit);
      const matchesCreativeType = selectedFilters.creative_type.includes('all') || selectedFilters.creative_type.includes(item.creative_type);
      const matchesLanding = selectedFilters.landing.includes('all') || selectedFilters.landing.includes(item.landing);
      const matchesAdObjective = selectedFilters.ad_objective.includes('all') || selectedFilters.ad_objective.includes(item.ad_objective);
      const matchesTargeting = selectedFilters.targeting.includes('all') || selectedFilters.targeting.includes(item.targeting);

      const matchesMinOrder = Number(item.total_orders || item.orders || 0) >= appliedOrder;
      const matchesMinCost = Number(item.total_cost || item.cost || 0) >= appliedCost;

      const costVal = Number(item.total_cost || item.cost || 0);
      const revenueVal = Number(item.total_revenue || item.revenue || 0);
      const itemRoas = costVal > 0 ? (revenueVal / costVal) * 100 : 0;
      const matchesMinRoas = itemRoas >= appliedRoas;

      return matchesMedia && matchesDevice && matchesAdType && matchesBusinessUnit && matchesCreativeType && matchesLanding && matchesAdObjective && matchesTargeting && matchesMinOrder && matchesMinCost && matchesMinRoas;
    });

    const sorted = [...data].sort((a, b) => {
      const [field, order] = sortConfig.split('-');

      const getVal = (obj, fieldKey) => {
        if (fieldKey === 'cost') return parseFloat(obj.total_cost || obj.cost || 0);
        if (fieldKey === 'orders') return parseFloat(obj.total_orders || obj.orders || 0);
        if (fieldKey === 'roas') {
          if (obj.roas !== undefined) return parseFloat(obj.roas);
          const c = parseFloat(obj.total_cost || obj.cost || 0);
          const r = parseFloat(obj.total_revenue || obj.revenue || 0);
          return c > 0 ? (r / c) * 100 : 0;
        }
        return parseFloat(obj[fieldKey] || 0);
      };

      const valA = getVal(a, field);
      const valB = getVal(b, field);

      if (valA === 0 && valB !== 0) return 1;
      if (valA !== 0 && valB === 0) return -1;
      if (valA === 0 && valB === 0) return 0;

      if (order === 'asc') {
        return valA - valB;
      } else {
        return valB - valA;
      }
    });

    return sorted;
  }, [displayData, selectedFilters, appliedOrder, appliedCost, appliedRoas, sortConfig]);

  // 테이블용 필터 적용된 데이터 계산
  const filteredTableData = useMemo(() => {
    return realTableData.filter(item => {
      const matchesMedia = selectedFilters.media.includes('all') || selectedFilters.media.includes(getCanonicalMedia(item.media));
      const matchesDevice = selectedFilters.device.includes('all') || selectedFilters.device.includes(item.device);
      const matchesAdType = selectedFilters.ad_type.includes('all') || selectedFilters.ad_type.includes(item.ad_type);
      const matchesBusinessUnit = selectedFilters.business_unit.includes('all') || selectedFilters.business_unit.includes(item.business_unit);
      const matchesCreativeType = selectedFilters.creative_type.includes('all') || selectedFilters.creative_type.includes(item.creative_type);
      const matchesLanding = selectedFilters.landing.includes('all') || selectedFilters.landing.includes(item.landing);
      const matchesAdObjective = selectedFilters.ad_objective.includes('all') || selectedFilters.ad_objective.includes(item.ad_objective);
      const matchesTargeting = selectedFilters.targeting.includes('all') || selectedFilters.targeting.includes(item.targeting);

      const matchesMinOrder = Number(item.total_orders || item.orders || 0) >= appliedOrder;
      const matchesMinCost = Number(item.total_cost || item.cost || 0) >= appliedCost;

      const costVal = Number(item.total_cost || item.cost || 0);
      const revenueVal = Number(item.total_revenue || item.revenue || 0);
      const itemRoas = costVal > 0 ? (revenueVal / costVal) * 100 : 0;
      const matchesMinRoas = itemRoas >= appliedRoas;

      return matchesMedia && matchesDevice && matchesAdType && matchesBusinessUnit && matchesCreativeType && matchesLanding && matchesAdObjective && matchesTargeting && matchesMinOrder && matchesMinCost && matchesMinRoas;
    });
  }, [realTableData, selectedFilters, appliedOrder, appliedCost, appliedRoas]);

  // 테이블 요약 데이터 계산 로직
  const summaryTableData = useMemo(() => {
    const aggr = {};
    filteredTableData.forEach(item => {
      // 그룹 단위: 날짜
      // (BigQuery 등에서 받은 날짜가 YYYY-MM-DD 문자열을 가지도록 앞 10자리만 절삭)
      const dateStr = item.date ? String(item.date).substring(0, 10) : '해당없음';
      const groupKey = dateStr;

      if (!aggr[groupKey]) {
        aggr[groupKey] = {
          key: groupKey, cost: 0, impressions: 0, clicks: 0,
          total_cost: 0, total_users: 0, total_orders: 0, total_revenue: 0,
          consultations: 0, distributions: 0
        };
      }
      aggr[groupKey].cost += Number(item.cost || 0);
      aggr[groupKey].impressions += Number(item.impressions || 0);
      aggr[groupKey].clicks += Number(item.clicks || 0);
      aggr[groupKey].total_cost += Number(item.total_cost || 0);
      aggr[groupKey].total_users += Number(item.total_users || 0);
      aggr[groupKey].total_orders += Number(item.total_orders || 0);
      aggr[groupKey].total_revenue += Number(item.total_revenue || 0);
      aggr[groupKey].consultations += Number(item.consultation || 0);
      aggr[groupKey].distributions += Number(item.distribution || 0);
    });

    return Object.values(aggr).map(row => {
      const actualCost = row.total_cost > 0 ? row.total_cost : row.cost; // Fallback to cost if total_cost is missing

      const ctr = row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0;
      const cpc = row.clicks > 0 ? actualCost / row.clicks : 0;
      const consult_cvr = row.clicks > 0 ? (row.consultations / row.clicks) * 100 : 0;
      const consult_cpa = row.consultations > 0 ? actualCost / row.consultations : 0;
      const dist_cvr = row.clicks > 0 ? (row.distributions / row.clicks) * 100 : 0;
      const dist_cpa = row.distributions > 0 ? actualCost / row.distributions : 0;
      const dist_rate = row.consultations > 0 ? (row.distributions / row.consultations) * 100 : 0;

      // hf metrics
      const inflow_cvr = row.clicks > 0 ? (row.total_users / row.clicks) * 100 : 0;
      const purchase_cvr = row.total_users > 0 ? (row.total_orders / row.total_users) * 100 : 0;
      const roas = actualCost > 0 ? (row.total_revenue / actualCost) * 100 : 0;
      const atv = row.total_orders > 0 ? row.total_revenue / row.total_orders : 0; // 객단가

      return {
        ...row,
        ctr, cpc, consult_cvr, consult_cpa, dist_cvr, dist_cpa, dist_rate, inflow_cvr, purchase_cvr, roas, atv
      };
    }).sort((a, b) => b.key.localeCompare(a.key)); // 날짜(key) 기준 최신순 정렬
  }, [filteredData]);

  // 테이블 데이터 페이징 처리
  useEffect(() => {
    setTablePage(1);
  }, [summaryTableData]);

  const totalTablePages = Math.max(1, Math.ceil(summaryTableData.length / ITEMS_PER_PAGE));

  const currentTableData = useMemo(() => {
    const start = (tablePage - 1) * ITEMS_PER_PAGE;
    return summaryTableData.slice(start, start + ITEMS_PER_PAGE);
  }, [summaryTableData, tablePage]);

  // 드롭다운 라벨 생성
  const getDropdownLabel = (type, defaultLabel) => {
    const selected = selectedFilters[type];
    if (selected.includes('all')) return defaultLabel;
    if (selected.length === 1) return selected[0];
    return `${selected[0]} 외 ${selected.length - 1}건`;
  };

  // 필터 라벨 포맷팅 (괄호 앞 줄바꿈)
  const formatFilterLabel = (label, type) => {
    if (label.includes('(')) {
      const [main, sub] = label.split('(');
      return (
        <>
          {main}
          <br />
          <span style={{ fontSize: '0.9rem', opacity: 1 }}>({sub}</span>
        </>
      );
    }
    return label;
  };

  return (
    <>
      <div className="compare-filter-panel" style={{ marginBottom: '2rem' }}>
        <div className="filter-grid">
          {filterConfigs.map((config) => (
            <div className="filter-box" key={config.id}>
              <label>{config.label}</label>
              <select
                className="filter-select"
                value={selectedFilters[config.id]?.[0] || 'all'}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedFilters(prev => ({
                    ...prev,
                    [config.id]: val === 'all' ? ['all'] : [val]
                  }));
                }}
              >
                <option value="all">전체</option>
                {config.options.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="compare-action-row">
          <div className="compare-date-picker-box">
            <span className="control-label" style={{ fontWeight: 700 }}>기간 선택</span>
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
                <button className="period-btn" style={{ fontWeight: 700 }}>
                  {startDate && endDate
                    ? `${startDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })} - ${endDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}`
                    : '기간 선택'}
                </button>
              }
            />
          </div>

          <div className="btn-group">
            <button
              className="action-btn"
              onClick={async () => {
                if (isExporting || isFullLoading) {
                  if (isFullLoading) alert('데이터 로딩 중입니다.');
                  return;
                }
                setIsExporting(true);
                try {
                  const exportData = [...filteredData];
                  exportData.sort((a, b) => {
                    const dA = a.date || '';
                    const dB = b.date || '';
                    return String(dA).localeCompare(String(dB));
                  });
                  const headers = ['날짜', '매체', '디바이스', '광고유형', '사업부/기획전', '소재분류', '랜딩', '광고목표', '타게팅', '소진비용', '노출', '클릭', '총 사용자', '주문 건수', '주문 금액'];
                  const rows = exportData.map(item => [
                    `"${item.date || ''}"`,
                    `"${item.media || ''}"`,
                    `"${item.device || ''}"`,
                    `"${item.ad_type || ''}"`,
                    `"${item.business_unit || ''}"`,
                    `"${item.creative_type || ''}"`,
                    `"${item.landing || ''}"`,
                    `"${item.ad_objective || ''}"`,
                    `"${item.targeting || ''}"`,
                    item.cost || item.total_cost || 0,
                    item.impressions || 0,
                    item.clicks || 0,
                    item.total_users || item.users || 0,
                    item.total_orders || item.orders || 0,
                    item.total_revenue || item.revenue || 0
                  ]);
                  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `Media_Insight_Data_${new Date().toISOString().slice(0, 10)}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } finally {
                  setIsExporting(false);
                }
              }}
            >
              엑셀 추출
            </button>
            <button className="action-btn" onClick={() => resetAllFilters()}>
              조건 초기화
            </button>
          </div>
        </div>
      </div>

      {/* 필터와 메인 영역 사이: 데이터 테이블 추가 */}
      <div className="summary-data-table-container">
        <table className="summary-data-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>노출</th>
              <th>클릭</th>
              <th>CTR</th>
              <th>CPC</th>
              <th>총 비용</th>
              <th>총 사용자</th>
              <th>유입 전환율</th>
              <th>주문 건수</th>
              <th>주문 금액</th>
              <th>ROAS</th>
              <th>CVR</th>
              <th>객단가</th>
            </tr>
          </thead>
          <tbody>
            {realTableData.length > 0 && currentTableData.length > 0 ? (
              currentTableData.map((row, idx) => (
                <tr key={idx}>
                  <td className="row-key">{row.key}</td>
                  <td>{Math.round(row.impressions).toLocaleString()}</td>
                  <td>{Math.round(row.clicks).toLocaleString()}</td>
                  <td>{row.ctr.toFixed(2)}%</td>
                  <td>{Math.round(row.cpc).toLocaleString()}</td>
                  <td>{Math.round(row.total_cost || row.cost).toLocaleString()}</td>
                  <td>{Math.round(row.total_users).toLocaleString()}</td>
                  <td>{row.inflow_cvr.toFixed(2)}%</td>
                  <td>{Math.round(row.total_orders).toLocaleString()}</td>
                  <td>{Math.round(row.total_revenue).toLocaleString()}</td>
                  <td>{row.roas.toFixed(0)}%</td>
                  <td>{row.purchase_cvr.toFixed(2)}%</td>
                  <td>{Math.round(row.atv).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="empty-message">
                  설정한 데이터 조건(필터/기간 등)에 맞는 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {summaryTableData.length > 0 && (
          <div className="table-pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '15px' }}>
            <button
              onClick={() => setTablePage(p => Math.max(1, p - 1))}
              disabled={tablePage === 1}
              style={{
                padding: '6px 14px', borderRadius: '4px', border: '1px solid #ddd',
                background: tablePage === 1 ? '#f5f5f5' : '#fff', color: tablePage === 1 ? '#aaa' : '#333', cursor: tablePage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.85rem'
              }}
            >
              이전
            </button>
            <span style={{ fontSize: '0.9rem', color: '#555', fontWeight: '500' }}>
              {tablePage} <span style={{ color: '#ccc', margin: '0 4px' }}>/</span> {totalTablePages}
            </span>
            <button
              onClick={() => setTablePage(p => Math.min(totalTablePages, p + 1))}
              disabled={tablePage === totalTablePages}
              style={{
                padding: '6px 14px', borderRadius: '4px', border: '1px solid #ddd',
                background: tablePage === totalTablePages ? '#f5f5f5' : '#fff', color: tablePage === totalTablePages ? '#aaa' : '#333', cursor: tablePage === totalTablePages ? 'not-allowed' : 'pointer', fontSize: '0.85rem'
              }}
            >
              다음
            </button>
          </div>
        )}
      </div>

      <main className="hanssem-main">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="insight-performance-filters" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* 성과 임계치 필터 그룹 */}
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
              <button className="performance-filter-btn apply" onClick={handleApplyPerformanceFilters}>적용</button>
              <button className="performance-filter-btn reset" onClick={handleResetPerformanceFilters}>초기화</button>
            </div>

            {/* 정렬 필터 그룹 */}
            <div className="sort-filter-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '0.5rem', paddingLeft: '1.5rem', borderLeft: '1px solid #eee' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#666' }}>정렬</span>
              <select
                className="performance-sort-select"
                value={sortConfig}
                onChange={(e) => setSortConfig(e.target.value)}
              >
                <option value="roas-desc">ROAS 높은 순 (기본)</option>
                <option value="roas-asc">ROAS 낮은 순</option>
                <option value="orders-desc">주문수 많은 순</option>
                <option value="cost-desc">광고비 높은 순</option>
                <option value="cost-asc">광고비 낮은 순</option>
              </select>
            </div>
          </div>
        </div>
        <div className="chart-grid">
          {filteredData.map((chart, index) => (
            <CreativeCard
              key={chart.id || `${chart.media}_${chart.title}_${index}`}
              data={chart}
            />
          ))}
        </div>

        {/* 무한 스크롤 트리거 */}
        <div ref={lastElementRef} style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {isLoading && <div style={{ color: '#667eea', fontWeight: 'bold' }}>데이터 로드 중...</div>}
          {!hasMore && realData.length > 0 && <div style={{ color: '#999' }}>모든 데이터를 불러왔습니다.</div>}
        </div>
      </main>
    </>
  );
}

export default InsightView;