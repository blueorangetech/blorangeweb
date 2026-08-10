import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function TrendChartSection({
  isLoading,
  activeSubTab,
  integratedData,
  mediaTrendData,
  cfg,
  datasetId,
  formatPercent,
  formatWon,
  selectedMedia
}) {
  const chartData = activeSubTab === 'integrated' ? integratedData : mediaTrendData;

  return (
    <div className="chart-card">
      {activeSubTab === 'media' && <h3 className="chart-title">[ {selectedMedia} 성과 트렌드 ]</h3>}
      <div className="chart-container-inner">
        {isLoading ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 600 }}>
            데이터 분석 중...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="period" fontSize={11} tickLine={false} axisLine={false} minTickGap={40} />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke={cfg.barColor}
                fontSize={11}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => val.toLocaleString('ko-KR')}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={cfg.lineColor}
                fontSize={11}
                axisLine={false}
                tickLine={false}
                unit={datasetId === 'hanssem_hf' ? '%' : ''}
                tickFormatter={(val) => val.toLocaleString('ko-KR')}
              />
              <Tooltip
                contentStyle={{fontSize: '14px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value, name) => {
                  if (name === cfg.lineLabel) {
                    return [datasetId === 'hanssem_hf' ? formatPercent(value) : formatWon(value), name];
                  }
                  return [value.toLocaleString('ko-KR') + (name === cfg.bar2Label ? (datasetId === 'hanssem_hf' ? '명' : '건') : '건'), name];
                }}
              />
              <Legend wrapperStyle={{fontSize: '14px', paddingTop: '10px' }} />
              {activeSubTab === 'media' && (
                <Bar yAxisId="left" dataKey={cfg.bar2Key} name={cfg.bar2Label} fill={cfg.bar2Color} opacity={0.6} radius={[4, 4, 0, 0]} maxBarSize={15} />
              )}
              <Bar yAxisId="left" dataKey={cfg.ordersKey} name={cfg.ordersLabel} fill={cfg.barColor} radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Line yAxisId="right" type="monotone" dataKey={cfg.lineKey} name={cfg.lineLabel} stroke={cfg.lineColor} strokeWidth={2.5} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
