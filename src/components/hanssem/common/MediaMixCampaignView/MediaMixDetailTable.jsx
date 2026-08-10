import React from 'react';

export default function MediaMixDetailTable({
  isDateModeActive,
  setIsDateModeActive,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  datasetId,
  isLoading,
  filteredData,
  condition1Data,
  condition2Data,
  metrics,
  formatCell
}) {
  return (
    <div className="mediamix-dashboard-grid">
      <div className="mediamix-card">
        <div className="mediamix-card-title">
          <span>상세 데이터</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`mediamix-btn ${!isDateModeActive ? 'mediamix-btn-primary' : 'mediamix-btn-secondary'}`}
              onClick={() => setIsDateModeActive(false)}
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
            >
              고정 기간 비교
            </button>
            <button
              className={`mediamix-btn ${isDateModeActive ? 'mediamix-btn-primary' : 'mediamix-btn-secondary'}`}
              onClick={() => {
                if (!startDate || !endDate) {
                  // 디폴트값 세팅
                  if (datasetId === 'hanssem_hf') {
                    setStartDate(new Date('2026-03-01'));
                    setEndDate(new Date('2026-06-15'));
                  } else {
                    setStartDate(new Date('2026-01-01'));
                    setEndDate(new Date('2026-01-31'));
                  }
                }
                setIsDateModeActive(true);
              }}
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
            >
              월별 성과 추이
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>데이터를 불러오는 중입니다...</div>
        ) : filteredData.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>해당 조건에 만족하는 데이터가 없습니다.</div>
        ) : (
          <div className="mediamix-table-wrapper">
            <table className="mediamix-table">
              <thead>
                <tr>
                  <th>구분</th>
                  {metrics.map(m => (
                    <th key={m.key}>{m.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 조건 1 테이블 렌더링 */}
                {!isDateModeActive && condition1Data.map((row, i) => (
                  <tr key={i}>
                    <td>{row.rowName}</td>
                    {metrics.map(m => (
                      <td key={m.key}>{formatCell(row[m.key], m.format)}</td>
                    ))}
                  </tr>
                ))}

                {/* 조건 2 테이블 렌더링 */}
                {isDateModeActive && (
                  <>
                    {condition2Data.list.map((row, i) => (
                      <tr key={i}>
                        <td>{row.rowName}</td>
                        {metrics.map(m => (
                          <td key={m.key}>{formatCell(row[m.key], m.format)}</td>
                        ))}
                      </tr>
                    ))}
                    {condition2Data.total && (
                      <tr className="total-row">
                        <td>{condition2Data.total.rowName}</td>
                        {metrics.map(m => (
                          <td key={m.key}>{formatCell(condition2Data.total[m.key], m.format)}</td>
                        ))}
                      </tr>
                    )}
                    {condition2Data.avg && (
                      <tr className="avg-row">
                        <td>{condition2Data.avg.rowName}</td>
                        {metrics.map(m => (
                          <td key={m.key}>{formatCell(condition2Data.avg[m.key], m.format)}</td>
                        ))}
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
