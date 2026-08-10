import React, { useState, useEffect, useRef, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';
import '../../../styles/HanssemInsight.css';
import '../../../styles/HanssemCompare.css';
import CreativeCard from './CreativeCard';
import { categoryMap, targetingMap, placementMap, chartData } from './filterMaps';
import InsightSummaryTable from './InsightSummaryTable';
import InsightPerformanceFilter from './InsightPerformanceFilter';
import { useInsightData } from './hooks/useInsightData';

const initialFilters = {
  creative_name: ['all'],
  explore: ['all'],
  main_copy: ['all'],
  sub_copy: ['all']
};

const filterMappings = {
  creative_name: { field: 'utm_content_5' },
  explore: { field: 'utm_content_8', map: targetingMap },
  main_copy: { field: 'utm_content_3' },
  sub_copy: { field: 'utm_content_4' }
};

function AllMaterialInsightView({ startDate, endDate, setStartDate, setEndDate }) {
  const [isExporting, setIsExporting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const {
    realData, isLoading, hasMore, lastElementRef,
    fullData, fullFilteredData, isFullDataLoading,
    displayData, filteredData, applyFiltersToData, availableFilterOptions,
    selectedFilters, setSelectedFilters, handleFilterSelect,
    distributionFilterInput, setDistributionFilterInput,
    costFilterInput, setCostFilterInput,
    appliedDistribution, appliedCost,
    handleApplyPerformanceFilters, handleResetPerformanceFilters,
    sortConfig, setSortConfig, resetAllFilters
  } = useInsightData('all_material', startDate, endDate, initialFilters, filterMappings, chartData);

  const filterConfigs = useMemo(() => {
    const getOptions = (key, defaultOptions) => {
      const available = availableFilterOptions?.[key];
      if (!available) return defaultOptions || [];
      if (defaultOptions) {
        return defaultOptions.filter(opt => available.has(opt));
      }
      return Array.from(available).sort();
    };

    return [
      { id: 'creative_name', label: '소재 고유명', options: getOptions('creative_name') },
      { id: 'explore', label: '타게팅', options: getOptions('explore', Object.keys(targetingMap)) },
      { id: 'main_copy', label: '주 메시지', options: getOptions('main_copy') },
      { id: 'sub_copy', label: '서브 메시지', options: getOptions('sub_copy') },
    ];
  }, [availableFilterOptions]);

  const summaryTableData = useMemo(() => {
    const aggr = {};
    fullFilteredData.forEach(item => {
      const creativeStr = item.utm_content_5 || '기타';
      if (!aggr[creativeStr]) {
        aggr[creativeStr] = {
          key: creativeStr, cost: 0, impressions: 0, clicks: 0,
          consultations: 0, distributions: 0, confirms: 0
        };
      }
      aggr[creativeStr].cost += Number(item.cost || 0);
      aggr[creativeStr].impressions += Number(item.impressions || 0);
      aggr[creativeStr].clicks += Number(item.clicks || 0);
      aggr[creativeStr].consultations += Number(item.consultation || 0);
      aggr[creativeStr].distributions += Number(item.distribution || 0);
      aggr[creativeStr].confirms += Number(item.confirm || 0);
    });

    return Object.values(aggr).map(row => {
      const ctr = row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0;
      const cpc = row.clicks > 0 ? Math.round(row.cost / row.clicks) : 0;
      const consult_cvr = row.clicks > 0 ? (row.consultations / row.clicks) * 100 : 0;
      const consult_cpa = row.consultations > 0 ? Math.round(row.cost / row.consultations) : 0;
      const dist_cvr = row.clicks > 0 ? (row.distributions / row.clicks) * 100 : 0;
      const dist_cpa = row.distributions > 0 ? Math.round(row.cost / row.distributions) : 0;
      const dist_rate = row.consultations > 0 ? (row.distributions / row.consultations) * 100 : 0;
      const confirm_cvr = row.distributions > 0 ? (row.confirms / row.distributions) * 100 : 0;
      const confirm_cpa = row.confirms > 0 ? Math.round(row.cost / row.confirms) : 0;

      return {
        ...row,
        ctr, cpc, consult_cvr, consult_cpa, dist_cvr, dist_cpa, dist_rate, confirm_cvr, confirm_cpa
      };
    }).sort((a, b) => b.cost - a.cost);
  }, [fullFilteredData]);

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
                if (isExporting || isFullDataLoading) {
                  if (isFullDataLoading) alert('전체 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
                  return;
                }
                setIsExporting(true);
                try {
                  const exportData = [...fullFilteredData];
                  exportData.sort((a, b) => {
                    const dA = a.date?.value || a.date || '';
                    const dB = b.date?.value || b.date || '';
                    return String(dA).localeCompare(String(dB));
                  });
                  const headers = [
                    '날짜', '소재 고유명', '타게팅', '주 메시지', '서브 메시지',
                    '소진비용', '노출수', '클릭수', '상담신청', '배분', '확정건수'
                  ];
                  const rows = exportData.map(item => {
                    let dateStr = '';
                    if (item.date) {
                      const rawDate = typeof item.date === 'object' && item.date.value ? item.date.value : String(item.date);
                      dateStr = rawDate.substring(0, 10);
                    }
                    return [
                      `"${dateStr}"`,
                      `"${item.utm_content_5 || ''}"`,
                      `"${item.utm_content_8 || ''}"`,
                      `"${item.utm_content_3 || ''}"`,
                      `"${item.utm_content_4 || ''}"`,
                      item.cost || 0,
                      item.impressions || 0,
                      item.clicks || 0,
                      item.consultation || 0,
                      item.distribution || 0,
                      item.confirm || 0
                    ];
                  });
                  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `Material_Insight_Data_${new Date().toISOString().slice(0, 10)}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } catch (error) {
                  console.error("Excel Export Error: ", error);
                  alert("엑셀 데이터 추출 중 오류가 발생했습니다.");
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
      <InsightSummaryTable data={summaryTableData} hasRealData={fullData.length > 0 || realData.length > 0} />

      <main className="hanssem-main">
        <InsightPerformanceFilter
          distributionFilterInput={distributionFilterInput}
          setDistributionFilterInput={setDistributionFilterInput}
          costFilterInput={costFilterInput}
          setCostFilterInput={setCostFilterInput}
          onApply={handleApplyPerformanceFilters}
          onReset={handleResetPerformanceFilters}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
        />
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

export default AllMaterialInsightView;