import React, { useState, useEffect, useRef, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';
import '../../styles/HanssemInsight.css';
import { CreativeCard } from './';
import { categoryMap, targetingMap, placementMap, messageMap, chartData } from './common/filterMaps';

function AllMaterialInsightView({ startDate, endDate, setStartDate, setEndDate }) {
    // 필터 상태 통합 관리
    const [selectedFilters, setSelectedFilters] = useState({
        creative_name: ['all'],
        explore: ['all'],
        main_copy: ['all'],
        sub_copy: ['all']
    });

    // 어떤 드롭다운이 열려있는지 관리
    const [openDropdown, setOpenDropdown] = useState(null);

    const [realData, setRealData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 무한 스크롤 관련 상태
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 20;

    // 성과 임계치 필터 관련 상태
    const [distributionFilterInput, setDistributionFilterInput] = useState(0);
    const [costFilterInput, setCostFilterInput] = useState(0);
    const [appliedDistribution, setAppliedDistribution] = useState(0);
    const [appliedCost, setAppliedCost] = useState(0);

    // 정렬 관련 상태 (기본값: CPA 오름차순)
    const [sortConfig, setSortConfig] = useState('cpa-asc');

    // 테이블 페이지네이션 상태
    const [tablePage, setTablePage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // 필터 옵션은 데이터 로딩 후 동적으로 생성되므로 displayData 아래로 이동했습니다.

    // 날짜가 바뀌면 데이터와 오프셋 초기화
    useEffect(() => {
        setRealData([]);
        setOffset(0);
        setHasMore(true);
    }, [startDate, endDate]);

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

            try {
                const response = await fetch(
                    `${API_BASE_URL}/search/bigquery/date?dataset_id=hanssem&table_id=performance_raw&report_type=all_material&start_date=${startStr}&end_date=${endStr}&limit=${LIMIT}&offset=${offset}`
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
    }, [startDate, endDate, offset]);

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

    // 필서 선택 처리
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
        setAppliedDistribution(Number(distributionFilterInput));
        setAppliedCost(Number(costFilterInput));
    };

    const handleResetPerformanceFilters = () => {
        setDistributionFilterInput(0);
        setCostFilterInput(0);
        setAppliedDistribution(0);
        setAppliedCost(0);
    };

    // 필터링된 데이터 계산
    const displayData = realData.length > 0 ? realData : (offset === 0 ? chartData : []);

    // 동적 구성: 소재 고유명(utm_content_5) 고유값 추출
    const creativeNameOptions = useMemo(() => {
        const names = new Set();
        displayData.forEach(item => {
            if (item.utm_content_5) names.add(item.utm_content_5);
        });
        return Array.from(names).sort();
    }, [displayData]);

    const filterConfigs = useMemo(() => [
        { id: 'creative_name', label: '소재 고유명', options: creativeNameOptions },
        { id: 'explore', label: '타게팅', options: Object.keys(targetingMap) },
        { id: 'main_copy', label: '주 메세지', options: Object.keys(messageMap) },
        { id: 'sub_copy', label: '서브 메세지', options: Object.keys(messageMap) },
    ], [creativeNameOptions, targetingMap, messageMap]);

    const filteredData = useMemo(() => {
        let data = displayData.filter(item => {
            // 2. 소재 고유명 필터 (utm_content_5 사용)
            const matchesCreativeName = selectedFilters.creative_name.includes('all') || selectedFilters.creative_name.includes(item.utm_content_5);

            // 3. 타게팅 필터 (utm_content_8 사용)
            const selectedTargetingValues = selectedFilters.explore.includes('all')
                ? ['all']
                : selectedFilters.explore.map(label => targetingMap[label]).flat();
            const matchesTargeting = selectedTargetingValues.includes('all') || selectedTargetingValues.includes(item.utm_content_8);

            // 4. 주 메세지 필터 (utm_content_3 사용)
            const selectedMainCopyValues = selectedFilters.main_copy.includes('all')
                ? ['all']
                : selectedFilters.main_copy.map(label => messageMap[label]).flat();
            const matchesMainCopy = selectedMainCopyValues.includes('all') || selectedMainCopyValues.includes(item.utm_content_3);

            // 5. 서브 메세지 필터 (utm_content_4 사용)
            const selectedSubCopyValues = selectedFilters.sub_copy.includes('all')
                ? ['all']
                : selectedFilters.sub_copy.map(label => messageMap[label]).flat();
            const matchesSubCopy = selectedSubCopyValues.includes('all') || selectedSubCopyValues.includes(item.utm_content_4);

            // 6. 성과 임계치 필터
            const matchesMinDist = Number(item.distribution || 0) >= appliedDistribution;
            const matchesMinCost = Number(item.cost || 0) >= appliedCost;

            return matchesCreativeName && matchesTargeting && matchesMainCopy && matchesSubCopy && matchesMinDist && matchesMinCost;
        });

        // 데이터 정렬 로직
        const sorted = [...data].sort((a, b) => {
            const [field, order] = sortConfig.split('-');
            const valA = parseFloat(a[field] || 0);
            const valB = parseFloat(b[field] || 0);

            // 0은 항상 맨 뒤로 보냄 (오름차순/내림차순 공통)
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
    }, [displayData, selectedFilters, targetingMap, messageMap, appliedDistribution, appliedCost, sortConfig]);

    // 테이블 요약 데이터 계산 로직
    const summaryTableData = useMemo(() => {
        const aggr = {};
        filteredData.forEach(item => {
            // 그룹 단위: 통합 소재 대시보드의 경우 소재 고유명(utm_content_5) 등으로 묶는것이 유용
            // 또는 개별 '소재 통합 요약' 이 필요하다면 단일행 '전체 소재 통합'으로 표기.
            // 여기서는 심플하게 '통합 소재 고유명별 요약' (utm_content_5 사용)으로 제공
            const creativeNameStr = item.utm_content_5 || '소재 미지정';
            const groupKey = creativeNameStr;

            if (!aggr[groupKey]) {
                aggr[groupKey] = {
                    key: groupKey, cost: 0, impressions: 0, clicks: 0,
                    consultations: 0, distributions: 0
                };
            }
            aggr[groupKey].cost += Number(item.cost || 0);
            aggr[groupKey].impressions += Number(item.impressions || 0);
            aggr[groupKey].clicks += Number(item.clicks || 0);
            aggr[groupKey].consultations += Number(item.consultation || 0);
            aggr[groupKey].distributions += Number(item.distribution || 0);
        });

        return Object.values(aggr).map(row => {
            const ctr = row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0;
            const cpc = row.clicks > 0 ? row.cost / row.clicks : 0;
            const consult_cvr = row.clicks > 0 ? (row.consultations / row.clicks) * 100 : 0;
            const consult_cpa = row.consultations > 0 ? row.cost / row.consultations : 0;
            const dist_cvr = row.clicks > 0 ? (row.distributions / row.clicks) * 100 : 0;
            const dist_cpa = row.distributions > 0 ? row.cost / row.distributions : 0;
            const dist_rate = row.consultations > 0 ? (row.distributions / row.consultations) * 100 : 0;

            return {
                ...row,
                ctr, cpc, consult_cvr, consult_cpa, dist_cvr, dist_cpa, dist_rate
            };
        }).sort((a, b) => b.cost - a.cost); // 비용 내림차순 정렬
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
                    <button
                        className="tab-btn reset-btn"
                        onClick={() => {
                            setSelectedFilters({
                                creative_name: ['all'],
                                explore: ['all'],
                                main_copy: ['all'],
                                sub_copy: ['all']
                            });
                            setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
                            setEndDate(new Date());
                            setOpenDropdown(null);
                            setSortConfig('cpa-asc');
                            handleResetPerformanceFilters();
                        }}
                    >
                        조건 초기화
                    </button>
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
                                        <span>{config.label}</span>
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
            <div className="summary-data-table-container">
                <table className="summary-data-table">
                    <thead>
                        <tr>
                            <th>구분</th>
                            <th>소진비용</th>
                            <th>노출</th>
                            <th>클릭</th>
                            <th>CTR</th>
                            <th>CPC</th>
                            <th className="consultation-group">상담신청</th>
                            <th className="consultation-group">상담신청_CVR</th>
                            <th className="consultation-group">상담신청_CPA</th>
                            <th className="consultation-group">배분</th>
                            <th className="consultation-group">배분_CVR</th>
                            <th className="consultation-group">배분_CPA</th>
                            <th className="consultation-group">배분율</th>
                        </tr>
                    </thead>
                    <tbody>
                        {realData.length > 0 && currentTableData.length > 0 ? (
                            currentTableData.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="row-key">{row.key}</td>
                                    <td>{Math.round(row.cost).toLocaleString()}</td>
                                    <td>{Math.round(row.impressions).toLocaleString()}</td>
                                    <td>{Math.round(row.clicks).toLocaleString()}</td>
                                    <td>{row.ctr.toFixed(2)}%</td>
                                    <td>{Math.round(row.cpc).toLocaleString()}</td>
                                    <td>{Math.round(row.consultations).toLocaleString()}</td>
                                    <td>{row.consult_cvr.toFixed(2)}%</td>
                                    <td>{Math.round(row.consult_cpa).toLocaleString()}</td>
                                    <td>{Math.round(row.distributions).toLocaleString()}</td>
                                    <td>{row.dist_cvr.toFixed(2)}%</td>
                                    <td>{Math.round(row.dist_cpa).toLocaleString()}</td>
                                    <td>{row.dist_rate.toFixed(0)}%</td>
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
                                <label>배분</label>
                                <input
                                    type="number"
                                    className="performance-filter-input"
                                    placeholder="건"
                                    value={distributionFilterInput}
                                    onChange={(e) => setDistributionFilterInput(e.target.value)}
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
                                <option value="cpa-asc">CPA 낮은 순 (기본)</option>
                                <option value="cpa-desc">CPA 높은 순</option>
                                <option value="cost-asc">광고비 낮은 순</option>
                                <option value="cost-desc">광고비 높은 순</option>
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

export default AllMaterialInsightView;