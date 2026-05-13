import React from 'react';

function InsightPerformanceFilter({
    distributionFilterInput,
    setDistributionFilterInput,
    costFilterInput,
    setCostFilterInput,
    onApply,
    onReset,
    sortConfig,
    setSortConfig
}) {
    return (
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
                    <button className="performance-filter-btn apply" onClick={onApply}>적용</button>
                    <button className="performance-filter-btn reset" onClick={onReset}>초기화</button>
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
    );
}

export default InsightPerformanceFilter;
