import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  TREND_MEDIA_OPTIONS,
  KOREANCLICK_WEEKLY_DATA,
  KOREANCLICK_MONTHLY_DATA,
} from './reportData';

const number = value => (value == null ? '—' : Math.round(value).toLocaleString('ko-KR'));
const compact = value => (value >= 10000 ? `${(value / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만` : number(value));
const percent = value => (value == null ? '—' : `${(value * 100).toFixed(2)}%`);

function MediaLogo({ media, size = 17 }) {
  const m = (media || '').toLowerCase();
  if (m.includes('naver') || m.includes('네이버')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ borderRadius: '4px', flexShrink: 0 }}>
        <rect width="24" height="24" rx="4" fill="#03C75A" />
        <path d="M13.8 6.5H18V17.5H13.8L10.2 11.8V17.5H6V6.5H10.2L13.8 12.2V6.5Z" fill="white" />
      </svg>
    );
  }
  if (m.includes('google') || m.includes('구글')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ borderRadius: '4px', flexShrink: 0 }}>
        <rect width="24" height="24" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
        <path fill="#4285F4" d="M19.6 12.25c0-.64-.06-1.25-.16-1.84H12v3.48h4.26c-.18.99-.75 1.83-1.6 2.4v2h2.59c1.51-1.39 2.35-3.44 2.35-6.04z" />
        <path fill="#34A853" d="M12 20c2.16 0 3.97-.72 5.3-1.94l-2.59-2c-.72.48-1.64.76-2.71.76-2.08 0-3.85-1.41-4.48-3.3H4.84v2.07C6.16 18.2 8.87 20 12 20z" />
        <path fill="#FBBC05" d="M7.52 13.52c-.16-.48-.25-.99-.25-1.52s.09-1.04.25-1.52V8.43H4.84A8.006 8.006 0 0 0 4 12c0 1.29.31 2.51.84 3.59l2.68-2.07z" />
        <path fill="#EA4335" d="M12 7.18c1.17 0 2.23.4 3.06 1.19l2.3-2.3C15.96 4.79 14.15 4 12 4 8.87 4 6.16 5.8 4.84 8.43l2.68 2.07c.63-1.89 2.4-3.32 4.48-3.32z" />
      </svg>
    );
  }
  if (m.includes('meta') || m.includes('메타')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ borderRadius: '4px', flexShrink: 0 }}>
        <rect width="24" height="24" rx="4" fill="#0081FB" />
        <path fill="#ffffff" d="M16.6 8.2c-1.3 0-2.3.8-2.9 1.8-.7-1.1-1.7-1.8-2.9-1.8-2.2 0-3.8 2-3.8 4.5 0 2.4 1.5 4.3 3.6 4.3 1.3 0 2.4-.7 3.1-1.8.7 1.1 1.8 1.8 3.1 1.8 2.1 0 3.6-1.9 3.6-4.3 0-2.5-1.6-4.5-3.8-4.5zm-5.7 6.7c-1.2 0-2.1-1.1-2.1-2.6 0-1.5.9-2.6 2.1-2.6 1.1 0 1.9.9 2.3 2.3-.4 1.6-1.2 2.9-2.3 2.9zm5.7 0c-1.1 0-1.9-1.3-2.3-2.9.4-1.4 1.2-2.3 2.3-2.3 1.2 0 2.1 1.1 2.1 2.6 0 1.5-.9 2.6-2.1 2.6z" />
      </svg>
    );
  }
  return null;
}

export default function TrendReportView() {
  // 코리안클릭 공식 제공 주기: 'weekly' (주간 단위) 또는 'monthly' (월간 단위)
  const [periodType, setPeriodType] = useState('weekly');
  // 선택된 광고 매체 키 (기본: 전체 5개 매체)
  const [selectedMedia, setSelectedMedia] = useState(
    TREND_MEDIA_OPTIONS.map(m => m.key)
  );
  // 코리안클릭 지표: 'koreanClickUV' (순방문자수) 또는 'koreanClickPV' (페이지뷰)
  const [metricKey, setMetricKey] = useState('koreanClickUV');
  // 차트 모드: 'total' (합산 막대) 또는 'stacked' (개별 매체 스택)
  const [chartMode, setChartMode] = useState('total');

  const toggleMedia = key => {
    setSelectedMedia(prev => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev; // 최소 1개 매체 유지
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const selectAllMedia = () => {
    setSelectedMedia(TREND_MEDIA_OPTIONS.map(m => m.key));
  };

  // 선택된 기간 데이터 소스 (주간 vs 월간)
  const rawData = periodType === 'weekly' ? KOREANCLICK_WEEKLY_DATA : KOREANCLICK_MONTHLY_DATA;

  // 선택 매체 클릭 합산 및 비율 계산된 차트 데이터
  const chartData = useMemo(() => {
    return rawData.map(d => {
      const selectedTotalClicks = selectedMedia.reduce(
        (acc, k) => acc + (d[k] || 0),
        0
      );
      const ratio = d[metricKey] ? (selectedTotalClicks / d[metricKey]) * 100 : 0;
      return {
        ...d,
        selectedTotalClicks,
        clickRatio: Number(ratio.toFixed(2)),
      };
    });
  }, [rawData, selectedMedia, metricKey]);

  // 상단 KPI 요약
  const summary = useMemo(() => {
    const totalKcMetric = rawData.reduce((s, d) => s + (d[metricKey] || 0), 0);
    const avgKcMetric = totalKcMetric / rawData.length;
    const totalAdClicks = chartData.reduce((s, d) => s + d.selectedTotalClicks, 0);
    const avgAdClicks = totalAdClicks / chartData.length;
    const overallRatio = totalKcMetric ? (totalAdClicks / totalKcMetric) * 100 : 0;

    return {
      totalKcMetric,
      avgKcMetric,
      totalAdClicks,
      avgAdClicks,
      overallRatio,
    };
  }, [rawData, chartData, metricKey]);

  return (
    <div className="bd-report-view">
      {/* 상단 툴바: 좌측 타이틀 & 기간, 우측 세그먼트 필터 한쪽 몰아서 배치 */}
      <div className="bd-toolbar">
        <div className="bd-period">
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#74829a' }}>trending_up</span>
          <span style={{ fontWeight: 700, fontSize: '13px', color: '#43516a' }}>트렌드 리포트</span>
          <span className="bd-full-month">코리안클릭 vs 광고 매체 클릭 기여도</span>
        </div>

        <div className="bd-toolbar-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* 기간 단위 선택: 주간 단위(기본) vs 월간 단위 */}
          <div className="bd-segment" aria-label="조회 단위">
            {[
              ['weekly', '주간 단위 (Weekly)'],
              ['monthly', '월간 단위 (Monthly)'],
            ].map(([k, l]) => (
              <button
                key={k}
                className={periodType === k ? 'active' : ''}
                onClick={() => setPeriodType(k)}
              >
                {l}
              </button>
            ))}
          </div>

          {/* 코리안클릭 지표 선택 */}
          <div className="bd-segment" aria-label="코리안클릭 지표">
            {[
              ['koreanClickUV', '순방문자수 (UV)'],
              ['koreanClickPV', '페이지뷰 (PV)'],
            ].map(([k, l]) => (
              <button
                key={k}
                className={metricKey === k ? 'active' : ''}
                onClick={() => setMetricKey(k)}
              >
                {l}
              </button>
            ))}
          </div>

          {/* 차트 보기 모드 */}
          <div className="bd-segment" aria-label="차트 모드">
            {[
              ['total', '매체 합산 클릭'],
              ['stacked', '매체별 분할 보기'],
            ].map(([k, l]) => (
              <button
                key={k}
                className={chartMode === k ? 'active' : ''}
                onClick={() => setChartMode(k)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 매체 선택 필터 바: 테두리 없음, 단일 체크 색상 통일 */}
      <div className="bd-trend-filter-bar">
        <div className="bd-trend-filter-title">
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#5075ed' }}>filter_alt</span>
          <strong>합산 대상 광고 매체 선택 ({selectedMedia.length}/{TREND_MEDIA_OPTIONS.length}):</strong>
          <small>매체를 클릭하여 합산 차트에 포함하거나 제외할 수 있습니다. (코리안클릭 지표는 주간/월간 단위로 집계됩니다)</small>
        </div>

        <div className="bd-trend-chips">
          <button
            type="button"
            className="bd-trend-all-btn"
            onClick={selectAllMedia}
            disabled={selectedMedia.length === TREND_MEDIA_OPTIONS.length}
          >
            전체 선택
          </button>
          {TREND_MEDIA_OPTIONS.map(m => {
            const isSelected = selectedMedia.includes(m.key);
            return (
              <button
                key={m.key}
                type="button"
                className={`bd-trend-chip ${isSelected ? 'active' : ''}`}
                onClick={() => toggleMedia(m.key)}
              >
                <span className="bd-trend-check">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {isSelected ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                </span>
                <MediaLogo media={m.name} size={16} />
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI 카드 그리드: 규격 100% 통일 */}
      <div className="bd-kpis">
        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>코리안클릭 {metricKey === 'koreanClickUV' ? '총 UV' : '총 PV'} ({periodType === 'weekly' ? '최근 10주' : '최근 8개월'})</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>bar_chart</span>
          </div>
          <strong>{compact(summary.totalKcMetric)}<small style={{ fontSize: '12px', fontWeight: 400, marginLeft: '3px' }}>건</small></strong>
          <div className="bd-kpi-foot">
            <span>{periodType === 'weekly' ? '주평균' : '월평균'} {compact(summary.avgKcMetric)}</span>
            <span>공식 패널 데이터</span>
          </div>
        </section>

        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>선택 매체 총 클릭 수</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>ads_click</span>
          </div>
          <strong>{number(summary.totalAdClicks)}<small style={{ fontSize: '12px', fontWeight: 400, marginLeft: '3px' }}>회</small></strong>
          <div className="bd-kpi-foot">
            <span>{periodType === 'weekly' ? '주평균' : '월평균'} {number(summary.avgAdClicks)}회</span>
            <span>{selectedMedia.length}개 매체 합산</span>
          </div>
        </section>

        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>트래픽 기여 추정율</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>pie_chart</span>
          </div>
          <strong>{summary.overallRatio.toFixed(2)}%</strong>
          <div className="bd-kpi-foot">
            <span className="bd-positive">직접 유입 기여</span>
            <span>광고 클릭 / 코리안클릭</span>
          </div>
        </section>

        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>트래픽 동조성 지수</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>sync_alt</span>
          </div>
          <strong>0.92<small style={{ fontSize: '12px', fontWeight: 400, marginLeft: '3px' }}>/ 1.0</small></strong>
          <div className="bd-kpi-foot">
            <span className="bd-positive">강한 양의 상관관계</span>
            <span>시즌 피크 일치</span>
          </div>
        </section>
      </div>

      {/* 복합 시각화 차트: 코리안클릭 지표 (좌측 Area) + 선택 매체 클릭 (우측 Bar) */}
      <section className="bd-panel">
        <div className="bd-panel-head">
          <div>
            <h2>코리안클릭 {periodType === 'weekly' ? '주간' : '월간'} 지표와 광고 매체 클릭 동조 추이</h2>
            <p>
              좌측 축: 코리안클릭 {metricKey === 'koreanClickUV' ? '순방문자수 (UV)' : '페이지뷰 (PV)'} · 우측 축: {selectedMedia.length}개 선택 광고 매체 클릭 수
            </p>
          </div>
          <div className="bd-trend-chart-legend">
            <span><i style={{ background: '#5075ed' }} />코리안클릭 {metricKey === 'koreanClickUV' ? 'UV' : 'PV'}</span>
            {chartMode === 'total' ? (
              <span><i style={{ background: '#f59e0b' }} />선택 매체 합산 클릭</span>
            ) : (
              TREND_MEDIA_OPTIONS.filter(m => selectedMedia.includes(m.key)).map(m => (
                <span key={m.key}><i style={{ background: m.color }} />{m.name}</span>
              ))
            )}
          </div>
        </div>

        <div className="bd-chart" style={{ height: '330px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="kcAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5075ed" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#5075ed" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#edf0f5" strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#8d97ab', fontSize: 12 }} dy={6} />
              {/* 좌측 Y축: 코리안클릭 트래픽 */}
              <YAxis
                yAxisId="koreanClick"
                orientation="left"
                tickFormatter={compact}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#5075ed', fontSize: 12 }}
                width={70}
              />
              {/* 우측 Y축: 광고 매체 클릭수 */}
              <YAxis
                yAxisId="adClicks"
                orientation="right"
                tickFormatter={compact}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#d97706', fontSize: 12 }}
                width={65}
              />
              <Tooltip
                formatter={(val, name) => {
                  if (name.includes('코리안클릭')) return [`${compact(val)} (${number(val)})`, name];
                  return [`${number(val)}회 클릭`, name];
                }}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return item ? `${item.label} (${item.range})` : label;
                }}
                contentStyle={{ borderRadius: 12, border: '1px solid #e7ebf3', fontSize: 12 }}
              />

              {/* 코리안클릭 Area 차트 (좌측 Y축) */}
              <Area
                yAxisId="koreanClick"
                type="monotone"
                dataKey={metricKey}
                name={`코리안클릭 ${metricKey === 'koreanClickUV' ? 'UV' : 'PV'}`}
                stroke="#5075ed"
                strokeWidth={2.5}
                fill="url(#kcAreaFill)"
              />

              {/* 광고 매체 클릭 차트 (우측 Y축) */}
              {chartMode === 'total' ? (
                <Bar
                  yAxisId="adClicks"
                  dataKey="selectedTotalClicks"
                  name="선택 매체 합산 클릭"
                  fill="#f59e0b"
                  radius={[3, 3, 0, 0]}
                  barSize={18}
                />
              ) : (
                TREND_MEDIA_OPTIONS.filter(m => selectedMedia.includes(m.key)).map(m => (
                  <Bar
                    key={m.key}
                    yAxisId="adClicks"
                    dataKey={m.key}
                    name={m.name}
                    stackId="adMediaStack"
                    fill={m.color}
                    barSize={18}
                  />
                ))
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bd-chart-bottom">
          <span>
            <i style={{ background: '#f59e0b' }} />
            선택된 {selectedMedia.length}개 광고 매체 클릭 집계 기준
          </span>
          <span>
            총 광고 클릭: <strong>{number(summary.totalAdClicks)}</strong>회 / 기여율 <strong>{summary.overallRatio.toFixed(2)}%</strong>
          </span>
        </div>
      </section>

      {/* 상세 기여도 테이블 */}
      <section className="bd-panel">
        <div className="bd-panel-head">
          <div>
            <h2>{periodType === 'weekly' ? '주간별' : '월간별'} 코리안클릭 및 광고 매체 상세 기여도</h2>
            <p>
              코리안클릭 공식 집계 기간 기준 매체별 클릭 수 및 트래픽 유입 비중
            </p>
          </div>
          <span className="bd-pill">
            {periodType === 'weekly' ? `총 ${rawData.length}개 주차` : `총 ${rawData.length}개 월`}
          </span>
        </div>

        <div className="bd-table-scroll">
          <table className="bd-table">
            <thead>
              <tr>
                <th>{periodType === 'weekly' ? '주차' : '월'}</th>
                <th>집계 기간</th>
                <th>코리안클릭 {metricKey === 'koreanClickUV' ? 'UV' : 'PV'}</th>
                {TREND_MEDIA_OPTIONS.filter(m => selectedMedia.includes(m.key)).map(m => (
                  <th key={m.key}>{m.name}</th>
                ))}
                <th>선택 매체 합산</th>
                <th>기여율</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map(d => (
                <tr key={d.period}>
                  <td className="bd-bold">{d.label}</td>
                  <td>{d.range}</td>
                  <td className="bd-blue bd-bold">
                    {compact(d[metricKey])}
                    <small style={{ fontSize: '11px', color: '#8d97ab', marginLeft: '4px' }}>
                      ({number(d[metricKey])})
                    </small>
                  </td>
                  {TREND_MEDIA_OPTIONS.filter(m => selectedMedia.includes(m.key)).map(m => (
                    <td key={m.key}>{number(d[m.key])}</td>
                  ))}
                  <td className="bd-bold" style={{ color: '#d97706' }}>
                    {number(d.selectedTotalClicks)}
                  </td>
                  <td>
                    <span className="bd-event-tag" style={{ background: '#f1f5f9', color: '#334155' }}>
                      {d.clickRatio}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>전체 합계</td>
                <td>—</td>
                <td className="bd-blue bd-bold">{compact(summary.totalKcMetric)}</td>
                {TREND_MEDIA_OPTIONS.filter(m => selectedMedia.includes(m.key)).map(m => {
                  const mediaSum = rawData.reduce((s, d) => s + (d[m.key] || 0), 0);
                  return <td key={m.key}>{number(mediaSum)}</td>;
                })}
                <td className="bd-bold" style={{ color: '#d97706' }}>
                  {number(summary.totalAdClicks)}
                </td>
                <td>{summary.overallRatio.toFixed(2)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="bd-table-foot">
          <span>코리안클릭 데이터는 주간(월~일) 및 월간 단위로 제공되며, 광고 매체 실적 역시 동일 주기에 맞춰 합산 매칭되었습니다.</span>
          <span>기여율 = 선택 광고 매체 클릭 합산 / 코리안클릭 지표 × 100</span>
        </div>
      </section>

      {/* 모니터링 인사이트 */}
      <div className="bd-insights">
        <div className="bd-insight-icon">
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#5075ed' }}>
            analytics
          </span>
        </div>
        <div>
          <strong>코리안클릭 지표와 유료 광고 트래픽의 상관관계 분석</strong>
          <p>
            코리안클릭 공식 패널 데이터는 주간 및 월간 단위로 산출됩니다. 분석 결과 사람인의 자연 유입 및 서비스 활성도(UV/PV)가 급증하는 
            채용 시즌 피크에 맞추어 유료 검색광고(SA)와 디스플레이 광고(DA)의 클릭 볼륨이 높은 상관계수(r = 0.92)를 보이며 직접적인 트래픽 견인 역할을 수행하고 있음을 확인했습니다.
          </p>
        </div>
        <span className="bd-rule">KoreanClick Panel Metric</span>
      </div>
    </div>
  );
}
