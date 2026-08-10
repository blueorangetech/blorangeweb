import React from 'react';

export default function PlanningSpreadsheet({
  planningRows,
  isHf,
  onReset,
  onAddRow,
  onPaste,
  onRowChange,
  onDeleteRow,
  formatInt,
  formatWon,
  formatPercent
}) {
  return (
    <div className="mediamix-dashboard-grid">
      <div className="mediamix-card">
        <div className="mediamix-card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>신규 작성 미디어믹스 입력 영역</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>
              (💡 엑셀 셀 복사 후 표 영역 선택한 뒤 Ctrl+V로 붙여넣기 가능)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="mediamix-btn mediamix-btn-secondary"
              onClick={onReset}
              style={{ borderColor: '#f87171', color: '#ef4444' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>clear_all</span>
              표 비우기
            </button>
            <button className="mediamix-btn mediamix-btn-primary" onClick={onAddRow}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              가상 매체 행 추가
            </button>
          </div>
        </div>

        <div className="mediamix-table-wrapper" onPaste={onPaste}>
          <table className="mediamix-table excel-style" style={{ minWidth: '1200px' }}>
            <thead>
              <tr className="excel-headers">
                <th style={{ width: '130px' }}>채널</th>
                <th style={{ width: '130px' }}>매체</th>
                <th style={{ width: '110px' }}>타겟</th>
                <th style={{ width: '90px' }}>디바이스</th>
                <th style={{ width: '110px' }}>예산</th>
                <th style={{ width: '70px' }}>CTR</th>
                <th style={{ width: '80px' }}>CPC</th>
                {isHf ? (
                  <>
                    <th style={{ width: '80px' }}>ROAS</th>
                    <th style={{ width: '80px' }}>구매CVR</th>
                  </>
                ) : (
                  <>
                    <th style={{ width: '85px' }}>상담CPA</th>
                    <th style={{ width: '85px' }}>배분CPA</th>
                  </>
                )}
                <th>노출수</th>
                <th>클릭수</th>
                <th>CPM</th>
                {isHf ? (
                  <>
                    <th>구매 건수</th>
                    <th>매출액</th>
                  </>
                ) : (
                  <>
                    <th>상담신청수</th>
                    <th>배분수</th>
                    <th>배분CVR</th>
                  </>
                )}
                <th style={{ width: '50px', textAlign: 'center' }}>삭제</th>
              </tr>
            </thead>
            <tbody>
              {planningRows.length === 0 && (
                <tr>
                  <td
                    colSpan={isHf ? 15 : 16}
                    style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontStyle: 'italic' }}
                  >
                    표 비어있음. 여기에 엑셀 데이터를 복사하여 붙여넣기(Ctrl+V) 하거나, 우측 상단 '가상 매체 행 추가' 버튼을 눌러주세요.
                  </td>
                </tr>
              )}
              {planningRows.map(row => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="text"
                      value={row.channel}
                      onChange={(e) => onRowChange(row.id, 'channel', e.target.value)}
                      style={{ textAlign: 'left' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.media}
                      onChange={(e) => onRowChange(row.id, 'media', e.target.value)}
                      style={{ textAlign: 'left' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.target}
                      onChange={(e) => onRowChange(row.id, 'target', e.target.value)}
                      style={{ textAlign: 'left' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.device}
                      onChange={(e) => onRowChange(row.id, 'device', e.target.value)}
                      style={{ textAlign: 'left' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.budget}
                      onChange={(e) => onRowChange(row.id, 'budget', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      value={row.ctr}
                      onChange={(e) => onRowChange(row.id, 'ctr', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.cpc}
                      onChange={(e) => onRowChange(row.id, 'cpc', e.target.value)}
                    />
                  </td>
                  {isHf ? (
                    <>
                      <td>
                        <input
                          type="number"
                          value={row.roas}
                          onChange={(e) => onRowChange(row.id, 'roas', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          value={row.purchase_cvr}
                          onChange={(e) => onRowChange(row.id, 'purchase_cvr', e.target.value)}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <input
                          type="number"
                          value={row.consultation_cpa}
                          onChange={(e) => onRowChange(row.id, 'consultation_cpa', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.cpa}
                          onChange={(e) => onRowChange(row.id, 'cpa', e.target.value)}
                        />
                      </td>
                    </>
                  )}
                  <td className="read-only-cell">{formatInt(row.impressions)}</td>
                  <td className="read-only-cell">{formatInt(row.clicks)}</td>
                  <td className="read-only-cell">{formatWon(row.cpm)}</td>
                  {isHf ? (
                    <>
                      <td className="read-only-cell">{formatInt(row.orders)}건</td>
                      <td className="read-only-cell">{formatWon(row.revenue)}</td>
                    </>
                  ) : (
                    <>
                      <td className="read-only-cell">{formatInt(row.consultation)}건</td>
                      <td className="read-only-cell">{formatInt(row.distribution)}건</td>
                      <td className="read-only-cell">{formatPercent(row.cvr)}</td>
                    </>
                  )}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="mediamix-btn"
                      style={{ padding: '4px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                      onClick={() => onDeleteRow(row.id)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
