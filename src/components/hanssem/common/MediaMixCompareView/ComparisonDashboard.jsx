import React from 'react';

export default function ComparisonDashboard({
  baselineYear,
  setBaselineYear,
  baselineMonth,
  setBaselineMonth,
  compareMode,
  setCompareMode,
  isLoadingHistory,
  comparisonResult,
  isHf,
  formatWon,
  formatPercent
}) {
  return (
    <div className="mediamix-dashboard-grid">
      <div className="mediamix-card">
        <div className="mediamix-graph-header">
          <div className="mediamix-card-title" style={{ marginBottom: 0 }}>
            기집행 데이터와 신규 작성 미디어믹스 비교/점검
          </div>
          
          <div className="mediamix-metric-selector">
            <span className="control-label">비교 기준:</span>
            <select
              className="mediamix-filter-select"
              value={baselineYear}
              onChange={(e) => setBaselineYear(e.target.value)}
              style={{ width: '90px' }}
            >
              <option value="2026">2026년</option>
              <option value="2025">2025년</option>
            </select>
            <select
              className="mediamix-filter-select"
              value={baselineMonth}
              onChange={(e) => setBaselineMonth(e.target.value)}
              style={{ width: '80px' }}
            >
              {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>

            <div className="segmented-control" style={{ marginLeft: '12px' }}>
              <button
                className={`segment-btn ${compareMode === 'channel' ? 'active' : ''}`}
                onClick={() => setCompareMode('channel')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  backgroundColor: compareMode === 'channel' ? '#ffffff' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                채널 비중
              </button>
              <button
                className={`segment-btn ${compareMode === 'media' ? 'active' : ''}`}
                onClick={() => setCompareMode('media')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  backgroundColor: compareMode === 'media' ? '#ffffff' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                매체 비중
              </button>
              <button
                className={`segment-btn ${compareMode === 'media_target' ? 'active' : ''}`}
                onClick={() => setCompareMode('media_target')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  backgroundColor: compareMode === 'media_target' ? '#ffffff' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                매체x타겟 비중
              </button>
            </div>
          </div>
        </div>

        {isLoadingHistory ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>비교 데이터를 분석하는 중입니다...</div>
        ) : (
          <div className="mediamix-table-wrapper">
            <table className="mediamix-table">
              <thead>
                <tr>
                  <th>구분</th>
                  <th>신규 계획 예산</th>
                  <th>신규 예산 비중</th>
                  <th>기집행 예산 ({baselineYear}.{baselineMonth})</th>
                  <th>기집행 예산 비중</th>
                  <th>비중 증감 (%p)</th>
                  <th>신규 계획 효율 ({isHf ? 'ROAS' : '배분 CPA'})</th>
                  <th>기집행 실적 효율 ({isHf ? 'ROAS' : '배분 CPA'})</th>
                  <th>효율 증감율 (%)</th>
                </tr>
              </thead>
              <tbody>
                {comparisonResult.list.map((item, i) => {
                  const isShareWarning = Math.abs(item.shareDiff) >= 30;
                  const isEffWarning = Math.abs(item.effChange) >= 30;

                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 'bold' }}>{item.key}</td>
                      <td>{formatWon(item.newBudget)}</td>
                      <td>{item.newShare.toFixed(2)}%</td>
                      <td>{formatWon(item.histBudget)}</td>
                      <td>{item.histShare.toFixed(2)}%</td>
                      <td className={isShareWarning ? 'warning-highlight' : ''}>
                        {item.shareDiff >= 0 ? '+' : ''}
                        {item.shareDiff.toFixed(2)}%p
                      </td>
                      <td>{isHf ? formatPercent(item.newEfficiency) : formatWon(item.newEfficiency)}</td>
                      <td>{isHf ? formatPercent(item.histEfficiency) : formatWon(item.histEfficiency)}</td>
                      <td className={isEffWarning ? 'warning-highlight' : ''}>
                        {item.effChange >= 0 ? '+' : ''}
                        {item.effChange.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
                
                <tr className="total-row">
                  <td>합계</td>
                  <td>{formatWon(comparisonResult.newTotalBudget)}</td>
                  <td>100.00%</td>
                  <td>{formatWon(comparisonResult.histTotalBudget)}</td>
                  <td>100.00%</td>
                  <td>0.00%p</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
