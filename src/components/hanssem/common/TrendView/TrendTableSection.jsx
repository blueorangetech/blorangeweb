import React from 'react';

export default function TrendTableSection({
  activeSubTab,
  timeUnit,
  integratedData,
  mediaBreakdownData,
  cfg,
  formatValue
}) {
  if (activeSubTab === 'integrated') {
    return (
      <div className="table-card">
        <div className="detail-table-wrapper">
          <table className="detail-table">
            <thead>
              <tr>
                <th>기간 ({timeUnit === 'day' ? '일별' : timeUnit === 'week' ? '주별' : '월별'})</th>
                {cfg.tableColumns.slice(1).map((col) => (
                  <th key={col.key} className="number">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {integratedData.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{row.period}</td>
                  {cfg.tableColumns.slice(1).map((col) => {
                    let val = row[col.key];
                    if (col.key === 'cvr') val = row.cvr;
                    if (col.key === 'roas') val = row.roas;
                    if (col.key === 'purchase_cvr') val = row.purchase_cvr;
                    return (
                      <td key={col.key} className="number" style={col.key === cfg.lineKey ? { color: cfg.lineColor, fontWeight: 600 } : col.key === cfg.ordersKey ? { color: cfg.barColor, fontWeight: 600 } : {}}>
                        {formatValue(val, col.format)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {integratedData.length === 0 && (
                <tr>
                  <td colSpan={cfg.tableColumns.length} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>데이터가 존재하지 않습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  } else {
    return (
      <div className="table-card">
        <div className="detail-table-wrapper">
          <table className="detail-table">
            <thead>
              <tr>
                {cfg.tableColumns.map((col) => (
                  <th key={col.key} className={col.key !== 'media' ? 'number' : ''}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mediaBreakdownData.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{row.media}</td>
                  {cfg.tableColumns.slice(1).map((col) => {
                    let val = row[col.key];
                    if (col.key === 'cvr') val = row.cvr;
                    if (col.key === 'roas') val = row.roas;
                    if (col.key === 'purchase_cvr') val = row.purchase_cvr;
                    return (
                      <td key={col.key} className="number" style={col.key === cfg.lineKey ? { color: cfg.lineColor, fontWeight: 600 } : col.key === cfg.ordersKey ? { color: cfg.barColor, fontWeight: 600 } : {}}>
                        {formatValue(val, col.format)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {mediaBreakdownData.length === 0 && (
                <tr>
                  <td colSpan={cfg.tableColumns.length} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>데이터가 존재하지 않습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
