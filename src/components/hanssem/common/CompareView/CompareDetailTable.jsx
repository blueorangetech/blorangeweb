import React from 'react';

export default function CompareDetailTable({
  isExpanded,
  setIsExpanded,
  processedData,
  selectedCols,
  total,
  formatCell,
}) {
  return (
    <div className="table-card">
      <div className="accordion-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span>일자별 상세 성과 ({isExpanded ? '상세 접기 - 총 합계만 노출' : '상세 펼치기 - 일별 데이터 노출'})</span>
        <span className={`material-symbols-outlined icon ${isExpanded ? 'expanded' : ''}`}>
          expand_more
        </span>
      </div>
      <div className="detail-table-wrapper" style={{ marginTop: '0.75rem' }}>
        <table className="detail-table">
          <thead>
            <tr>
              <th>일자</th>
              {selectedCols.map(c => (
                <th key={c.key} className="number">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isExpanded && processedData.map((row, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>{row.date}</td>
                {selectedCols.map(c => (
                  <td key={c.key} className="number">{formatCell(row[c.key], c.format)}</td>
                ))}
              </tr>
            ))}
            {processedData.length > 0 && (
              <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #cbd5e1' }}>
                <td style={{ fontWeight: 800, color: '#0f172a' }}>Total</td>
                {selectedCols.map(c => (
                  <td key={c.key} className="number" style={{ fontWeight: 800, color: '#0f172a' }}>
                    {formatCell(total[c.key], c.format)}
                  </td>
                ))}
              </tr>
            )}
            {processedData.length === 0 && (
              <tr>
                <td colSpan={selectedCols.length + 1} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>데이터가 존재하지 않습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
