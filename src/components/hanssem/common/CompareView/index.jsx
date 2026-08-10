import React, { useState, useEffect, useMemo } from 'react';
import '../../../../styles/HanssemPerformance.css';
import '../../../../styles/HanssemCompare.css';

// 하위 컴포넌트 임포트
import CompareFilterSection from './CompareFilterSection';
import CompareChartCard from './CompareChartCard';
import CompareDetailTable from './CompareDetailTable';
import ColumnEditorModal from './ColumnEditorModal';
import * as hanssemApi from '../../../../api/hanssemApi';
import * as hanssemHfApi from '../../../../api/hanssemHfApi';

// 데이터 포맷 유틸리티
const formatInt = (val) => Math.round(val || 0).toLocaleString('ko-KR');
const formatPercent = (val) => (val || 0).toFixed(2) + '%';
const formatWon = (val) => Math.round(val || 0).toLocaleString('ko-KR') + '원';
const formatPeople = (val) => Math.round(val || 0).toLocaleString('ko-KR') + '명';

const formatCell = (val, format) => {
  if (format === 'won') return formatWon(val);
  if (format === 'percent') return formatPercent(val);
  if (format === 'people') return formatPeople(val);
  return formatInt(val);
};

// 9대 필터 대상 키 및 한글 라벨 (부서별 상이함)
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
    { id: 'classification', label: '집행 구분', field: 'classification' },
    { id: 'media', label: '매체', field: 'media' },
    { id: 'media_detail', label: '매체 상세', field: 'media_detail' },
    { id: 'targeting', label: '타게팅', field: 'targeting' },
    { id: 'placement', label: '소재 유형', field: 'creative_type' },
    { id: 'category', label: '카테고리', field: 'landing' },
    { id: 'creative_name', label: '소재 고유명', field: 'utm_content_5' },
    { id: 'main_copy', label: '주 메시지', field: 'utm_content_3' },
    { id: 'sub_copy', label: '서브 메시지', field: 'utm_content_4' }
  ]
};

// 지표 마스터 정의
const METRIC_DEFINITIONS = {
  hanssem: [
    { key: 'cost', label: '소진비용', type: 'basic', format: 'won' },
    { key: 'impressions', label: '노출', type: 'basic', format: 'int' },
    { key: 'clicks', label: '클릭', type: 'basic', format: 'int' },
    { key: 'ctr', label: 'CTR', type: 'basic', format: 'percent' },
    { key: 'cpc', label: 'CPC', type: 'basic', format: 'won' },
    { key: 'cpm', label: 'CPM', type: 'basic', format: 'won' },
    { key: 'consultation', label: '상담신청수', type: 'conversion', format: 'int' },
    { key: 'consultation_cpa', label: '상담신청CPA', type: 'conversion', format: 'won' },
    { key: 'distribution', label: '배분수', type: 'conversion', format: 'int' },
    { key: 'cpa', label: '배분 CPA', type: 'conversion', format: 'won' },
    { key: 'cvr', label: '배분 CVR', type: 'conversion', format: 'percent' }
  ],
  hanssem_hf: [
    { key: 'cost', label: '소진비용', type: 'basic', format: 'won' },
    { key: 'impressions', label: '노출', type: 'basic', format: 'int' },
    { key: 'clicks', label: '클릭', type: 'basic', format: 'int' },
    { key: 'ctr', label: 'CTR', type: 'basic', format: 'percent' },
    { key: 'cpc', label: 'CPC', type: 'basic', format: 'won' },
    { key: 'cpm', label: 'CPM', type: 'basic', format: 'won' },
    { key: 'users', label: '유입 유저수', type: 'conversion', format: 'people' },
    { key: 'orders', label: '구매 건수', type: 'conversion', format: 'int' },
    { key: 'revenue', label: '매출액', type: 'conversion', format: 'won' },
    { key: 'roas', label: 'ROAS', type: 'conversion', format: 'percent' },
    { key: 'purchase_cvr', label: '구매 전환율', type: 'conversion', format: 'percent' }
  ]
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

function CommonCompareView({ datasetId, startDate, endDate, setStartDate, setEndDate }) {
  // 📅 기간 선택 상태
  const startDate1 = startDate;
  const endDate1 = endDate;
  const setStartDate1 = setStartDate;
  const setEndDate1 = setEndDate;

  const [startDate2, setStartDate2] = useState(() => {
    if (datasetId === 'hanssem_hf') {
      return new Date('2026-05-15');
    }
    return new Date('2026-01-01');
  });
  const [endDate2, setEndDate2] = useState(() => {
    if (datasetId === 'hanssem_hf') {
      return new Date('2026-05-31');
    }
    return new Date('2026-01-15');
  });

  // 9대 필터 대상 로드
  const filterKeys = useMemo(() => FILTER_KEYS_CONFIG[datasetId] || FILTER_KEYS_CONFIG.hanssem, [datasetId]);

  const initialFilters = useMemo(() => {
    const f = {};
    filterKeys.forEach(k => { f[k.id] = 'all'; });
    return f;
  }, [filterKeys]);

  const [filters1, setFilters1] = useState(initialFilters);
  const [filters2, setFilters2] = useState(initialFilters);

  // 아코디언 접힘/펼침 상태 (기본값 접힘)
  const [isFilter1Expanded, setIsFilter1Expanded] = useState(false);
  const [isFilter2Expanded, setIsFilter2Expanded] = useState(false);
  const [isTable1Expanded, setIsTable1Expanded] = useState(false);
  const [isTable2Expanded, setIsTable2Expanded] = useState(false);

  // 로딩 및 원시 데이터 상태
  const [rawData1, setRawData1] = useState([]);
  const [rawData2, setRawData2] = useState([]);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  // 기본 노출할 열 설정
  const DEFAULT_VISIBLE_KEYS = useMemo(() => {
    return datasetId === 'hanssem_hf'
      ? ['cost', 'impressions', 'clicks', 'ctr', 'cpc', 'orders', 'revenue', 'roas']
      : ['cost', 'impressions', 'clicks', 'ctr', 'cpc', 'consultation', 'distribution'];
  }, [datasetId]);

  // 열 에디터 모달 상태
  const masterMetrics = useMemo(() => METRIC_DEFINITIONS[datasetId] || METRIC_DEFINITIONS.hanssem, [datasetId]);
  const [selectedCols, setSelectedCols] = useState(() => 
    masterMetrics.filter(m => DEFAULT_VISIBLE_KEYS.includes(m.key))
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // datasetId가 변경될 때 기본 노출 열 동기화
  useEffect(() => {
    setSelectedCols(masterMetrics.filter(m => DEFAULT_VISIBLE_KEYS.includes(m.key)));
  }, [datasetId, masterMetrics, DEFAULT_VISIBLE_KEYS]);

  // 1. Target 1 데이터 페칭
  useEffect(() => {
    const fetchData1 = async () => {
      if (!startDate1 || !endDate1) return;
      setIsLoading1(true);
      const api = datasetId === 'hanssem_hf' ? hanssemHfApi : hanssemApi;
      try {
        const data = await api.fetchMaterialForCsv({ startDate: startDate1, endDate: endDate1 });
        setRawData1(data);
      } catch (error) {
        console.error('Target 1 fetch error:', error);
      } finally {
        setIsLoading1(false);
      }
    };
    fetchData1();
  }, [startDate1, endDate1, datasetId]);

  // 2. Target 2 데이터 페칭
  useEffect(() => {
    const fetchData2 = async () => {
      if (!startDate2 || !endDate2) return;
      setIsLoading2(true);
      const api = datasetId === 'hanssem_hf' ? hanssemHfApi : hanssemApi;
      try {
        const data = await api.fetchMaterialForCsv({ startDate: startDate2, endDate: endDate2 });
        setRawData2(data);
      } catch (error) {
        console.error('Target 2 fetch error:', error);
      } finally {
        setIsLoading2(false);
      }
    };
    fetchData2();
  }, [startDate2, endDate2, datasetId]);

  // 🔍 필터 옵션 동적 추출
  const filterOptions1 = useMemo(() => {
    const opts = {};
    filterKeys.forEach(k => {
      const set = new Set();
      rawData1.forEach(item => {
        const val = item[k.field];
        if (val !== undefined && val !== null && val !== '') {
          set.add(String(val));
        }
      });
      opts[k.id] = Array.from(set).sort();
    });
    return opts;
  }, [rawData1, filterKeys]);

  const filterOptions2 = useMemo(() => {
    const opts = {};
    filterKeys.forEach(k => {
      const set = new Set();
      rawData2.forEach(item => {
        const val = item[k.field];
        if (val !== undefined && val !== null && val !== '') {
          set.add(String(val));
        }
      });
      opts[k.id] = Array.from(set).sort();
    });
    return opts;
  }, [rawData2, filterKeys]);

  // 🎯 데이터 필터링 및 집계 처리
  const processFilteredData = (rawData, filters) => {
    const filtered = rawData.filter(item => {
      for (const k of filterKeys) {
        const selected = filters[k.id];
        if (selected && selected !== 'all') {
          if (String(item[k.field] || '') !== selected) return false;
        }
      }
      return true;
    });

    const dailyGroup = {};
    filtered.forEach(item => {
      const dateKey = item.date ? item.date.split('T')[0] : 'Unknown';
      if (!dailyGroup[dateKey]) {
        dailyGroup[dateKey] = {
          date: dateKey,
          cost: 0,
          impressions: 0,
          clicks: 0,
          consultation: 0,
          distribution: 0,
          users: 0,
          orders: 0,
          revenue: 0
        };
      }
      dailyGroup[dateKey].cost += Number(item.cost || item.total_cost || 0);
      dailyGroup[dateKey].impressions += Number(item.impressions || 0);
      dailyGroup[dateKey].clicks += Number(item.clicks || 0);
      dailyGroup[dateKey].consultation += Number(item.consultation || 0);
      dailyGroup[dateKey].distribution += Number(item.distribution || 0);

      dailyGroup[dateKey].users += Number(item.total_users || 0);
      dailyGroup[dateKey].orders += Number(item.total_orders || 0);
      dailyGroup[dateKey].revenue += Number(item.total_revenue || 0);
    });

    return Object.values(dailyGroup).map(row => ({
      ...row,
      ctr: row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0,
      cpc: row.clicks > 0 ? Math.round(row.cost / row.clicks) : 0,
      cpm: row.impressions > 0 ? Math.round((row.cost / row.impressions) * 1000) : 0,
      consultation_cpa: row.consultation > 0 ? Math.round(row.cost / row.consultation) : 0,
      cpa: row.distribution > 0 ? Math.round(row.cost / row.distribution) : 0,
      cvr: row.consultation > 0 ? (row.distribution / row.consultation) * 100 : 0,
      roas: row.cost > 0 ? (row.revenue / row.cost) * 100 : 0,
      purchase_cvr: row.clicks > 0 ? (row.orders / row.clicks) * 100 : 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  };

  const processedData1 = useMemo(() => processFilteredData(rawData1, filters1), [rawData1, filters1]);
  const processedData2 = useMemo(() => processFilteredData(rawData2, filters2), [rawData2, filters2]);

  // 합계 행 계산
  const calcTotal = (data) => {
    const summary = { cost: 0, impressions: 0, clicks: 0, consultation: 0, distribution: 0, users: 0, orders: 0, revenue: 0 };
    data.forEach(row => {
      summary.cost += row.cost;
      summary.impressions += row.impressions;
      summary.clicks += row.clicks;
      summary.consultation += row.consultation;
      summary.distribution += row.distribution;
      summary.users += row.users;
      summary.orders += row.orders;
      summary.revenue += row.revenue;
    });

    return {
      ...summary,
      ctr: summary.impressions > 0 ? (summary.clicks / summary.impressions) * 100 : 0,
      cpc: summary.clicks > 0 ? Math.round(summary.cost / summary.clicks) : 0,
      cpm: summary.impressions > 0 ? Math.round((summary.cost / summary.impressions) * 1000) : 0,
      consultation_cpa: summary.consultation > 0 ? Math.round(summary.cost / summary.consultation) : 0,
      cpa: summary.distribution > 0 ? Math.round(summary.cost / summary.distribution) : 0,
      cvr: summary.consultation > 0 ? (summary.distribution / summary.consultation) * 100 : 0,
      roas: summary.cost > 0 ? (summary.revenue / summary.cost) * 100 : 0,
      purchase_cvr: summary.clicks > 0 ? (summary.orders / summary.clicks) * 100 : 0
    };
  };

  const total1 = useMemo(() => calcTotal(processedData1), [processedData1]);
  const total2 = useMemo(() => calcTotal(processedData2), [processedData2]);

  // 💡 AI 분석 성과 코멘트
  const aiComments = useMemo(() => {
    let t1Comment = '조회된 데이터가 없어 성과 코멘트를 작성할 수 없습니다.';
    if (processedData1.length > 0) {
      const isHf = datasetId === 'hanssem_hf';
      const mainVolume = isHf ? total1.orders : total1.distribution;
      const mainVolumeLabel = isHf ? '구매 건수' : '배분수';
      const effLabel = isHf ? 'ROAS' : '배분 CPA';
      const effVal = isHf ? (total1.roas.toFixed(1) + '%') : (Math.round(total1.cpa).toLocaleString() + '원');

      t1Comment = `기준 조회 결과, 해당 기간 동안 총 ${mainVolume.toLocaleString()}건의 ${mainVolumeLabel}를 확보했습니다.\n총 지출 광고 비용은 ${Math.round(total1.cost).toLocaleString()}원이며, 이로 인한 가중 평균 ${effLabel}는 ${effVal} 수준으로 집계되었습니다.\n시계열 분석 상 주차별 유입 균형이 맞는지 일별 트렌드 추이를 수시로 확인하는 것을 권장합니다.`;
    }

    let t2Comment = '비교할 기준 데이터가 불충분합니다.';
    if (processedData1.length > 0 && processedData2.length > 0) {
      const isHf = datasetId === 'hanssem_hf';
      const key1 = isHf ? 'orders' : 'distribution';
      const label = isHf ? '구매 건수' : '배분수';

      const v1 = total1[key1];
      const v2 = total2[key1];
      const diff = v2 - v1;
      const pct = v1 > 0 ? (diff / v1) * 100 : 0;

      const cost1 = total1.cost;
      const cost2 = total2.cost;
      const costDiff = cost2 - cost1;
      const costPct = cost1 > 0 ? (costDiff / cost1) * 100 : 0;

      const sign = diff >= 0 ? '+' : '';
      const cSign = costDiff >= 0 ? '+' : '';

      t2Comment = `비교 조회 결과, ${label}는 기존 대비 ${sign}${diff.toLocaleString()}건 (${sign}${pct.toFixed(1)}%), 광고 예산은 ${cSign}${Math.round(costDiff).toLocaleString()}원 (${cSign}${costPct.toFixed(1)}%) 변동했습니다.\n동일 매체 내에서 효율이 극대화되고 있는지 모니터링해 보시기 바랍니다.`;
    }

    return { target1: t1Comment, target2: t2Comment };
  }, [processedData1, processedData2, total1, total2, datasetId]);

  // 11대 지표 종합 비교 테이블을 위한 헬퍼 데이터 가공
  const summaryComparisonRows = useMemo(() => {
    const list = METRIC_DEFINITIONS[datasetId] || METRIC_DEFINITIONS.hanssem;
    return list.map(m => {
      const v1 = total1[m.key] || 0;
      const v2 = total2[m.key] || 0;
      const diff = v2 - v1;
      const pct = v1 > 0 ? (diff / v1) * 100 : 0;
      return {
        key: m.key,
        label: m.label,
        val1: v1,
        val2: v2,
        diff,
        pct,
        format: m.format
      };
    });
  }, [total1, total2, datasetId]);

  // 드래그 앤 드롭 정렬 핸들러
  const handleDragStart = (e, index) => { e.dataTransfer.setData('text/plain', index); };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const reordered = [...selectedCols];
    const [removed] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, removed);
    setSelectedCols(reordered);
  };

  const handleToggleCol = (colKey) => {
    const isExist = selectedCols.some(c => c.key === colKey);
    if (isExist) {
      setSelectedCols(prev => prev.filter(c => c.key !== colKey));
    } else {
      const masterItem = masterMetrics.find(c => c.key === colKey);
      if (masterItem) setSelectedCols(prev => [...prev, masterItem]);
    }
  };

  const filteredMasterMetrics = useMemo(() => {
    if (!searchKeyword.trim()) return masterMetrics;
    return masterMetrics.filter(m => m.label.includes(searchKeyword));
  }, [masterMetrics, searchKeyword]);

  const chartConfig = useMemo(() => {
    const isHf = datasetId === 'hanssem_hf';
    return {
      barKey: isHf ? 'orders' : 'distribution',
      barLabel: isHf ? '구매 건수' : '배분수',
      lineKey: isHf ? 'roas' : 'cpa',
      lineLabel: isHf ? 'ROAS' : '배분 CPA',
      barColor: isHf ? '#10b981' : '#3b82f6',
      lineColor: isHf ? '#06b6d4' : '#f59e0b'
    };
  }, [datasetId]);

  const handleExport = (targetNo, data) => {
    const headers = ['일자', ...selectedCols.map(c => c.label)];
    const rows = data.map(row => [
      row.date,
      ...selectedCols.map(c => formatCell(row[c.key], c.format))
    ]);
    const filename = `성과비교_Target${targetNo}_${new Date().toISOString().substring(0, 10)}.csv`;
    downloadCSV(headers, rows, filename);
  };

  return (
    <div className="compare-section">
      {/* 📊 기준 조회와 비교 조회 성과 지표 대조 분석 테이블 */}
      <div className="table-card" style={{ width: '100%', boxSizing: 'border-box', padding: '1.5rem', overflow: 'visible' }}>
        <div className="compare-card-title" style={{ borderLeft: '4px solid #10b981', display: 'block', position: 'relative', zIndex: 10, marginBottom: '1.5rem', paddingLeft: '0.75rem' }}>
          기준 조회 vs 비교 조회 종합 성과 대조
        </div>
        <div className="detail-table-wrapper" style={{ position: 'relative', zIndex: 1, width: '100%', overflowX: 'auto' }}>
          <table className="detail-table comparison-summary-table">
            <thead>
              <tr>
                <th>지표 구분</th>
                <th className="number">기준 조회 성과</th>
                <th className="number">비교 조회 성과</th>
                <th className="number">증감값</th>
                <th className="number">증감률</th>
              </tr>
            </thead>
            <tbody>
              {summaryComparisonRows.map(row => {
                const diffVal = row.diff;
                const pct = row.pct;
                const format = row.format;

                let displayDiff = formatCell(Math.abs(diffVal), format);
                let diffColor = '#64748b';
                let sign = '';

                if (diffVal > 0) {
                  diffColor = '#ef4444';
                  sign = '+';
                } else if (diffVal < 0) {
                  diffColor = '#2563eb';
                  sign = '-';
                }

                if (format === 'percent') {
                  displayDiff = Math.abs(diffVal).toFixed(2) + 'p';
                }

                return (
                  <tr key={row.key}>
                    <td style={{ fontWeight: 600 }}>{row.label}</td>
                    <td className="number">{formatCell(row.val1, format)}</td>
                    <td className="number">{formatCell(row.val2, format)}</td>
                    <td className="number" style={{ color: diffColor, fontWeight: 700 }}>
                      {sign}{displayDiff}
                    </td>
                    <td className="number" style={{ color: diffColor, fontWeight: 700 }}>
                      {sign}{pct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🤖 AI 진단 카드 영역 (단일 통합 카드 구성) */}
      <div className="ai-commentary-card" style={{width: '100%', boxSizing: 'border-box' }}>
        <div className="ai-commentary-header">
          <span className="material-symbols-outlined icon">smart_toy</span>
          <h3>성과 비교 AI 진단</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
          <div className="ai-comment-section" style={{ borderRight: '1px solid #f1f5f9', paddingRight: '2rem' }}>
            <div className="ai-comment-section-title" style={{ color: '#2563eb', fontWeight: 700, marginBottom: '0.75rem' }}>기준 조회 성과 분석</div>
            <div className="ai-comment-content" style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              {aiComments.target1 || '성과 분석 데이터가 로딩 중이거나 존재하지 않습니다.'}
            </div>
          </div>
          <div className="ai-comment-section">
            <div className="ai-comment-section-title" style={{ color: '#10b981', fontWeight: 700, marginBottom: '0.75rem' }}>비교 조회 성과 분석</div>
            <div className="ai-comment-content" style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              {aiComments.target2 || '성과 분석 데이터가 로딩 중이거나 존재하지 않습니다.'}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side 2단 비교 레이아웃 */}
      <div className="compare-grid-layout">
        {/* 1️⃣ 좌측: [기준 조회 성과] 컬럼 */}
        <div className="compare-column">
          <CompareFilterSection
            title="1. 기준 조회 성과 설정"
            isExpanded={isFilter1Expanded}
            setIsExpanded={setIsFilter1Expanded}
            startDate={startDate1}
            endDate={endDate1}
            onDateChange={(start, end) => {
              setStartDate1(start);
              setEndDate1(end);
            }}
            filterKeys={filterKeys}
            filters={filters1}
            setFilters={setFilters1}
            filterOptions={filterOptions1}
            initialFilters={initialFilters}
            onOpenEditor={() => setIsEditorOpen(true)}
            onExport={() => handleExport(1, processedData1)}
          />

          <CompareChartCard
            isLoading={isLoading1}
            processedData={processedData1}
            chartConfig={chartConfig}
            datasetId={datasetId}
          />

          <CompareDetailTable
            isExpanded={isTable1Expanded}
            setIsExpanded={setIsTable1Expanded}
            processedData={processedData1}
            selectedCols={selectedCols}
            total={total1}
            formatCell={formatCell}
          />
        </div>

        {/* 2️⃣ 우측: [비교 조회 성과] 컬럼 */}
        <div className="compare-column">
          <CompareFilterSection
            title="2. 비교 조회 성과 설정"
            isExpanded={isFilter2Expanded}
            setIsExpanded={setIsFilter2Expanded}
            startDate={startDate2}
            endDate={endDate2}
            onDateChange={(start, end) => {
              setStartDate2(start);
              setEndDate2(end);
            }}
            filterKeys={filterKeys}
            filters={filters2}
            setFilters={setFilters2}
            filterOptions={filterOptions2}
            initialFilters={initialFilters}
            onOpenEditor={() => setIsEditorOpen(true)}
            onExport={() => handleExport(2, processedData2)}
          />

          <CompareChartCard
            isLoading={isLoading2}
            processedData={processedData2}
            chartConfig={chartConfig}
            datasetId={datasetId}
          />

          <CompareDetailTable
            isExpanded={isTable2Expanded}
            setIsExpanded={setIsTable2Expanded}
            processedData={processedData2}
            selectedCols={selectedCols}
            total={total2}
            formatCell={formatCell}
          />
        </div>
      </div>

      {/* 3️⃣ 대시보드 노출 데이터 에디터 모달 */}
      <ColumnEditorModal
        isOpen={isEditorOpen}
        setIsOpen={setIsEditorOpen}
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        filteredMasterMetrics={filteredMasterMetrics}
        selectedCols={selectedCols}
        handleToggleCol={handleToggleCol}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
      />
    </div>
  );
}

export default CommonCompareView;
