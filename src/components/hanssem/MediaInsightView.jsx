import React, { useState, useEffect, useRef, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';
import '../../styles/HanssemInsight.css';
import { CreativeCard } from '.';
import { getCanonicalMedia, mediaLogos } from '../../utils/mediaUtils';
import { categoryMap, targetingMap, placementMap, chartData } from './common/filterMaps';
import InsightSummaryTable from './common/InsightSummaryTable';
import InsightPerformanceFilter from './common/InsightPerformanceFilter';
import { useInsightData } from './hooks/useInsightData';

const initialFilters = {
  media: ['all'],
  media_detail: ['all'],
  classification: ['all'],
  placement: ['all'],
  category: ['all'],
  creative_name: ['all'],
  explore: ['all'],
  main_copy: ['all'],
  sub_copy: ['all']
};

const filterMappings = {
  media: { field: 'media', transform: getCanonicalMedia },
  media_detail: { field: 'media_detail' },
  classification: { field: 'classification' },
  placement: { field: 'utm_content_2', map: placementMap },
  category: { field: 'utm_content_1' },
  explore: { field: 'utm_content_8', map: targetingMap },
  main_copy: { field: 'utm_content_3' },
  sub_copy: { field: 'utm_content_4' },
  creative_name: { field: 'utm_content_5' }
};

function InsightView({ startDate, endDate, setStartDate, setEndDate }) {
  const [isExporting, setIsExporting] = useState(false);

  const {
    realData, isLoading, hasMore, lastElementRef,
    fullData, fullFilteredData, isFullDataLoading,
    displayData, filteredData, applyFiltersToData, availableFilterOptions,
    selectedFilters, handleFilterSelect, openDropdown, setOpenDropdown,
    distributionFilterInput, setDistributionFilterInput,
    costFilterInput, setCostFilterInput,
    appliedDistribution, appliedCost,
    handleApplyPerformanceFilters, handleResetPerformanceFilters,
    sortConfig, setSortConfig, resetAllFilters
  } = useInsightData('media_material', startDate, endDate, initialFilters, filterMappings, chartData);

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
      { id: 'classification', label: '집행 구분', options: getOptions('classification') },
      { id: 'media', label: '매체', options: getOptions('media', Object.keys(mediaLogos)) },
      { id: 'media_detail', label: '매체 상세', options: getOptions('media_detail') },
      { id: 'explore', label: '타게팅', options: getOptions('explore', Object.keys(targetingMap)) },
      { id: 'placement', label: '소재 유형', options: getOptions('placement', Object.keys(placementMap)) },
      { id: 'category', label: '카테고리', options: getOptions('category') },
      { id: 'creative_name', label: '소재 고유명', options: getOptions('creative_name') },
      { id: 'main_copy', label: '주 메세지', options: getOptions('main_copy') },
      { id: 'sub_copy', label: '서브 메세지', options: getOptions('sub_copy') },
    ];
  }, [availableFilterOptions]);

  // 테이블 요약 데이터 계산 로직
  const summaryTableData = useMemo(() => {
    const aggr = {};
    fullFilteredData.forEach(item => {
      const mediaStr = item.media || '기타';
      const placementStr = item.utm_content_2 ? item.utm_content_2.toUpperCase() : '';
      const groupKey = placementStr ? `${mediaStr} ${placementStr}` : mediaStr;

      if (!aggr[groupKey]) {
        aggr[groupKey] = {
          key: groupKey, cost: 0, impressions: 0, clicks: 0,
          consultations: 0, distributions: 0, confirms: 0
        };
      }
      aggr[groupKey].cost += Number(item.cost || 0);
      aggr[groupKey].impressions += Number(item.impressions || 0);
      aggr[groupKey].clicks += Number(item.clicks || 0);
      aggr[groupKey].consultations += Number(item.consultation || 0);
      aggr[groupKey].distributions += Number(item.distribution || 0);
      aggr[groupKey].confirms += Number(item.confirm || 0);
    });

    return Object.values(aggr).map(row => {
      const ctr = row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0;
      const cpc = row.clicks > 0 ? row.cost / row.clicks : 0;
      const consult_cvr = row.clicks > 0 ? (row.consultations / row.clicks) * 100 : 0;
      const consult_cpa = row.consultations > 0 ? row.cost / row.consultations : 0;
      const dist_cvr = row.clicks > 0 ? (row.distributions / row.clicks) * 100 : 0;
      const dist_cpa = row.distributions > 0 ? row.cost / row.distributions : 0;
      const dist_rate = row.consultations > 0 ? (row.distributions / row.consultations) * 100 : 0;
      
      const confirm_cvr = row.clicks > 0 ? (row.confirms / row.distributions) * 100 : 0;
      const confirm_cpa = row.confirms > 0 ? row.cost / row.confirms : 0;

      return {
        ...row,
        ctr, cpc, consult_cvr, consult_cpa, dist_cvr, dist_cpa, dist_rate,
        confirm_cvr, confirm_cpa
      };
    }).sort((a, b) => b.cost - a.cost); // 비용 내림차순 정렬
  }, [fullFilteredData]);

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
      <nav className="tab-navigation" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* 상단: 날짜 필터 & 초기화 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="tab-datepicker-wrapper">
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
                <button className="tab-btn date-picker-btn">
                  {startDate && endDate
                    ? `${startDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })} - ${endDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}`
                    : '기간 조건'}
                </button>
              }
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <button
              className="tab-btn export-btn"
              style={{
                background: '#107c41',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onClick={async () => {
                if (isExporting || isFullDataLoading) {
                  if (isFullDataLoading) alert('전체 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
                  return;
                }
                setIsExporting(true);
                try {
                  const exportData = [...fullFilteredData];

                  // 날짜순 정렬
                  exportData.sort((a, b) => {
                    const dA = a.date?.value || a.date || '';
                    const dB = b.date?.value || b.date || '';
                    return String(dA).localeCompare(String(dB));
                  });

                  // 엑셀(CSV) 헤더
                  const headers = [
                    '날짜', '매체', '매체 상세', '집행 구분', '소재 유형', '카테고리',
                    '타게팅', '주 메세지', '서브 메세지', '소재 고유명',
                    '소진비용', '노출수', '클릭수', '상담신청', '배분', '확정건수'
                  ];

                  // 필터링된 데이터 기반으로 행 생성 (원본 값 그대로 출력)
                  const rows = exportData.map(item => {
                    // BigQuery DATE/DATETIME (타임존 없는 객체 형태) 대응
                    let dateStr = '';
                    if (item.date) {
                      const rawDate = typeof item.date === 'object' && item.date.value ? item.date.value : String(item.date);
                      dateStr = rawDate.substring(0, 10);
                    }

                    return [
                      `"${dateStr}"`,
                      `"${item.media || ''}"`,
                      `"${item.media_detail || ''}"`,
                      `"${item.classification || ''}"`,
                      `"${item.utm_content_2 || ''}"`,
                      `"${item.utm_content_1 || ''}"`,
                      `"${item.utm_content_8 || ''}"`,
                      `"${item.utm_content_3 || ''}"`,
                      `"${item.utm_content_4 || ''}"`,
                      `"${item.utm_content_5 || ''}"`,
                      item.cost || 0,
                      item.impressions || 0,
                      item.clicks || 0,
                      item.consultation || 0,
                      item.distribution || 0,
                      item.confirm || 0
                    ];
                  });

                  // 한글 깨짐 방지를 위한 BOM(\uFEFF) 추가
                  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `Media_Insight_Data_${new Date().toISOString().slice(0, 10)}.csv`);
                  link.style.visibility = 'hidden';
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
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 11V14H2V11H0V14C0 15.1 0.9 16 2 16H14C15.1 16 16 15.1 16 14V11H14ZM13 7L11.59 5.59L9 8.17V0H7V8.17L4.41 5.59L3 7L8 12L13 7Z" fill="currentColor" />
              </svg>
              {isExporting ? '추출 중...' : '엑셀 추출'}
            </button>
            <button
              className="tab-btn"
              style={{
                background: '#e53935',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0,
                transition: 'background 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#d32f2f'}
              onMouseOut={(e) => e.currentTarget.style.background = '#e53935'}
              onClick={() => {
                resetAllFilters();
                setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
                setEndDate(new Date());
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              조건 초기화
            </button>
          </div>
        </div>

        {/* 하단: 나머지 드롭다운 필터들 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', width: '100%' }}>
          {filterConfigs.map((config) => (
            <div key={config.id} className="custom-dropdown" style={{ flex: 1 }}>
              <button
                className="dropdown-toggle tab-dropdown-btn"
                onClick={() => setOpenDropdown(openDropdown === config.id ? null : config.id)}
                style={{ width: '100%' }}
              >
                <span className="dropdown-label">
                  {getDropdownLabel(config.id, config.label)}
                </span>
                <span className={`arrow ${openDropdown === config.id ? 'open' : ''}`}>▼</span>
              </button>

              {openDropdown === config.id && (
                <ul className="dropdown-menu multi-select">
                  <li className={selectedFilters[config.id].includes('all') ? 'active' : ''} onClick={() => handleFilterSelect(config.id, 'all')}>
                    <div className="checkbox">{selectedFilters[config.id].includes('all') ? '✓' : ''}</div>
                    <span> 전체 </span>
                  </li>
                  {config.options.map(option => (
                    <li key={option} className={selectedFilters[config.id].includes(option) ? 'active' : ''} onClick={() => handleFilterSelect(config.id, option)}>
                      <div className="checkbox" style={{ marginTop: option.includes('(') ? '4px' : '0' }}>
                        {selectedFilters[config.id].includes(option) ? '✓' : ''}
                      </div>
                      <span className="option-text">{formatFilterLabel(option, config.id)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </nav>

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

export default InsightView;