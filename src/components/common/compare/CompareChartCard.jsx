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

const formatPercent = (val) => (val || 0).toFixed(2) + '%';
const formatWon = (val) => Math.round(val || 0).toLocaleString('ko-KR') + '원';

export default function CompareChartCard({
  isLoading,
  processedData,
  chartConfig,
  datasetId,
}) {
  return (
    <div className="chart-card">
      <div className="chart-container-inner">
        {isLoading ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 600 }}>
            데이터 분석 중...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={processedData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} minTickGap={40} />
              <YAxis yAxisId="left" orientation="left" stroke={chartConfig.barColor} fontSize={11} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke={chartConfig.lineColor} fontSize={11} axisLine={false} tickLine={false} unit={datasetId === 'hanssem_hf' ? '%' : ''} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value, name) => {
                  if (name === chartConfig.lineLabel) {
                    return [datasetId === 'hanssem_hf' ? formatPercent(value) : formatWon(value), name];
                  }
                  return [value.toLocaleString('ko-KR') + '건', name];
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey={chartConfig.barKey} name={chartConfig.barLabel} fill={chartConfig.barColor} radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Line yAxisId="right" type="monotone" dataKey={chartConfig.lineKey} name={chartConfig.lineLabel} stroke={chartConfig.lineColor} strokeWidth={2.5} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
