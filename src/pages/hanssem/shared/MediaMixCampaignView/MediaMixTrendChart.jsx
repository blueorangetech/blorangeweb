import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function MediaMixTrendChart({
  filteredData,
  selectedMetric,
  setSelectedMetric,
  metrics,
  trendChartData,
  activeMetricMeta,
  statsData,
  formatCell,
  formatWon
}) {
  return (
    <div className="mediamix-dashboard-grid">
      <div className="mediamix-card">
        <div className="mediamix-graph-header">
          <div className="mediamix-card-title" style={{ marginBottom: 0 }}>주요 성과/효율 지표의 추이 트렌드 그래프</div>
          <div className="mediamix-metric-selector">
            {/* 지표 선택 셀렉터 */}
            <select
              className="mediamix-filter-select"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              style={{ width: '160px' }}
            >
              {metrics.map(m => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            시각화할 트렌드 데이터가 없습니다.
          </div>
        ) : (
          <>
            <div className="mediamix-graph-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="key" stroke="#64748b" style={{ fontSize: '11px' }} />
                  <YAxis
                    stroke="#64748b"
                    style={{ fontSize: '11px' }}
                    tickFormatter={(val) => {
                      const num = Number(val);
                      if (isNaN(num)) return '';
                      if (activeMetricMeta.format === 'won') return `${Math.round(num).toLocaleString()}원`;
                      if (activeMetricMeta.format === 'percent') return `${num.toFixed(1)}%`;
                      return Math.round(num).toLocaleString();
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const change = data.pctChange;
                        let changeSpan = null;

                        if (change !== null) {
                          if (change > 0) {
                            changeSpan = <span className="tooltip-change up">▲ +{change.toFixed(2)}%</span>;
                          } else if (change < 0) {
                            changeSpan = <span className="tooltip-change down">▼ {change.toFixed(2)}%</span>;
                          } else {
                            changeSpan = <span className="tooltip-change flat">0.00%</span>;
                          }
                        }

                        return (
                          <div style={{ background: '#0f172a', padding: '12px', border: '1px solid #1e293b', borderRadius: '8px', color: '#ffffff', fontSize: '0.8rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <p style={{ margin: '0 0 6px 0', fontWeight: '700', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>{data.key}</p>
                            <p style={{ margin: 0 }}>
                              <span style={{ color: '#94a3b8' }}>{activeMetricMeta.label}: </span>
                              <span style={{ fontWeight: '700' }}>{formatCell(data.value, activeMetricMeta.format)}</span>
                              {changeSpan}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={activeMetricMeta.label}
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 4. 통계 테이블 */}
            <div className="mediamix-stats-section">
              <div className="mediamix-stats-title">조회 성과 데이터의 효율 범위 데이터 표</div>
              <div className="mediamix-stats-table-wrapper">
                <table className="mediamix-stats-table">
                  <thead>
                    <tr>
                      <th>전체 집행 예산</th>
                      <th>평균값</th>
                      <th>중앙값</th>
                      <th>최고값</th>
                      <th>최저값</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{formatWon(statsData.totalBudget)}</td>
                      <td>{formatCell(statsData.mean, activeMetricMeta.format)}</td>
                      <td>{formatCell(statsData.median, activeMetricMeta.format)}</td>
                      <td>{formatCell(statsData.max, activeMetricMeta.format)}</td>
                      <td>{formatCell(statsData.min, activeMetricMeta.format)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
