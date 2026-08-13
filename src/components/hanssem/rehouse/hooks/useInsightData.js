import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { fetchBigQuery, formatDate } from '../../../../api/geo/bigquery';

export function useInsightData(reportType, startDate, endDate, initialFilters, filterMappings, fallbackData) {
  // 1. 필터 및 드롭다운 상태
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);
  const [openDropdown, setOpenDropdown] = useState(null);

  // 2. 데이터 및 로딩 상태
  const [realData, setRealData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 전체 데이터 (summary table 및 dropdown 옵션, 엑셀 출력용)
  const [fullData, setFullData] = useState([]);
  const [isFullDataLoading, setIsFullDataLoading] = useState(false);

  // 3. 무한 스크롤 상태
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  // 4. 성과 임계치 필터 및 정렬 상태
  const [distributionFilterInput, setDistributionFilterInput] = useState(0);
  const [costFilterInput, setCostFilterInput] = useState(0);
  const [appliedDistribution, setAppliedDistribution] = useState(0);
  const [appliedCost, setAppliedCost] = useState(0);
  const [sortConfig, setSortConfig] = useState('cpa-asc');

  // -----------------------------------------------------
  // 상태 초기화 (날짜 변경 시)
  // -----------------------------------------------------
  useEffect(() => {
    setRealData([]);
    setFullData([]);
    setOffset(0);
    setHasMore(true);
  }, [startDate, endDate]);

  // -----------------------------------------------------
  // 전체 데이터 페칭 (for_csv 엔드포인트)
  // -----------------------------------------------------
  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchFullData = async () => {
      setIsFullDataLoading(true);
      try {
        const data = await fetchBigQuery({
          datasetId: 'hanssem',
          tableId: 'performance_raw',
          reportType: `${reportType}_for_csv`,
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        });
        setFullData(data);
      } catch (error) {
        console.error('Full Data Fetch Error:', error);
        setFullData([]);
      } finally {
        setIsFullDataLoading(false);
      }
    };

    fetchFullData();
  }, [startDate, endDate, reportType]);


  // -----------------------------------------------------
  // 페이징 데이터 페칭 (무한 스크롤 적용)
  // -----------------------------------------------------
  useEffect(() => {
    if (!startDate || !endDate || !hasMore || isLoading) return;

    const fetchBigQueryData = async () => {
      setIsLoading(true);
      try {
        const newData = await fetchBigQuery({
          datasetId: 'hanssem',
          tableId: 'performance_raw',
          reportType,
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          limit: LIMIT,
          offset,
        });

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
  }, [startDate, endDate, offset, reportType]);


  // -----------------------------------------------------
  // 스크롤 감지 옵저버
  // -----------------------------------------------------
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

  // -----------------------------------------------------
  // 공통 필터링 및 정렬 로직
  // -----------------------------------------------------
  const applyFiltersToData = useCallback((dataToFilter) => {
    return dataToFilter.filter(item => {
      // 1. 성과 임계치 필터
      const matchesMinDist = Number(item.distribution || 0) >= appliedDistribution;
      const matchesMinCost = Number(item.cost || 0) >= appliedCost;
      if (!matchesMinDist || !matchesMinCost) return false;

      // 2. 동적 필터 적용
      for (const key in filterMappings) {
        const config = filterMappings[key];
        const selected = selectedFilters[key];

        if (!selected || selected.includes('all')) continue;

        const itemValue = config.transform ? config.transform(item[config.field]) : item[config.field];

        if (config.map) {
          const mappedValues = selected.map(label => config.map[label]).flat();
          if (!mappedValues.includes('all') && !mappedValues.includes(itemValue)) {
            return false;
          }
        } else {
          if (!selected.includes(itemValue)) {
            return false;
          }
        }
      }
      return true;
    });
  }, [appliedDistribution, appliedCost, selectedFilters, filterMappings]);

  const sortData = useCallback((dataToSort) => {
    return [...dataToSort].sort((a, b) => {
      const [field, order] = sortConfig.split('-');
      const valA = parseFloat(a[field] || 0);
      const valB = parseFloat(b[field] || 0);

      if (valA === 0 && valB !== 0) return 1;
      if (valA !== 0 && valB === 0) return -1;
      if (valA === 0 && valB === 0) return 0;

      if (order === 'asc') {
        return valA - valB;
      } else {
        return valB - valA;
      }
    });
  }, [sortConfig]);

  const displayData = realData.length > 0 ? realData : (offset === 0 ? fallbackData : []);

  const filteredData = useMemo(() => {
    const filtered = applyFiltersToData(displayData);
    return sortData(filtered);
  }, [displayData, applyFiltersToData, sortData]);

  const fullFilteredData = useMemo(() => {
    return applyFiltersToData(fullData);
  }, [fullData, applyFiltersToData]);

  const availableFilterOptions = useMemo(() => {
    const result = {};
    for (const key in filterMappings) {
      result[key] = new Set();
    }

    fullData.forEach(item => {
      const matchesMinDist = Number(item.distribution || 0) >= appliedDistribution;
      const matchesMinCost = Number(item.cost || 0) >= appliedCost;
      if (!matchesMinDist || !matchesMinCost) return;

      let totalFails = 0;
      let failedKey = null;

      for (const key in filterMappings) {
        const config = filterMappings[key];
        const selected = selectedFilters[key];
        
        let passed = true;
        if (selected && !selected.includes('all')) {
          const itemValue = config.transform ? config.transform(item[config.field]) : item[config.field];
          if (config.map) {
            const mappedValues = selected.map(label => config.map[label]).flat();
            if (!mappedValues.includes('all') && !mappedValues.includes(itemValue)) {
              passed = false;
            }
          } else {
            if (!selected.includes(itemValue)) {
              passed = false;
            }
          }
        }
        if (!passed) {
          totalFails++;
          failedKey = key;
          if (totalFails > 1) break;
        }
      }

      if (totalFails > 1) return;

      for (const key in filterMappings) {
        if (totalFails === 1 && key !== failedKey) continue;
        
        const config = filterMappings[key];
        const itemValue = config.transform ? config.transform(item[config.field]) : item[config.field];

        if (config.map) {
          for (const label in config.map) {
            const mappedValues = Array.isArray(config.map[label]) ? config.map[label] : [config.map[label]];
            if (mappedValues.includes(itemValue) || mappedValues.includes('all')) {
              result[key].add(label);
            }
          }
        } else {
          if (itemValue !== undefined && itemValue !== null && itemValue !== '') {
            result[key].add(itemValue);
          }
        }
      }
    });

    return result;
  }, [fullData, selectedFilters, appliedDistribution, appliedCost, filterMappings]);

  // -----------------------------------------------------
  // 이벤트 핸들러
  // -----------------------------------------------------
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

  const handleApplyPerformanceFilters = () => {
    setAppliedDistribution(Number(distributionFilterInput));
    setAppliedCost(Number(costFilterInput));
  };

  const handleResetPerformanceFilters = () => {
    setDistributionFilterInput(0);
    setCostFilterInput(0);
    setAppliedDistribution(0);
    setAppliedCost(0);
  };

  const resetAllFilters = () => {
    setSelectedFilters(initialFilters);
    setOpenDropdown(null);
    setSortConfig('cpa-asc');
    handleResetPerformanceFilters();
  };

  return {
    realData,
    isLoading,
    hasMore,
    lastElementRef,
    
    fullData,
    fullFilteredData,
    isFullDataLoading,
    
    displayData,
    filteredData,
    applyFiltersToData,
    availableFilterOptions,

    selectedFilters,
    setSelectedFilters,
    handleFilterSelect,
    openDropdown,
    setOpenDropdown,

    distributionFilterInput,
    setDistributionFilterInput,
    costFilterInput,
    setCostFilterInput,
    appliedDistribution,
    appliedCost,
    handleApplyPerformanceFilters,
    handleResetPerformanceFilters,

    sortConfig,
    setSortConfig,
    resetAllFilters
  };
}
