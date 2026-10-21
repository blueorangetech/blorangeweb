import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import {
  INTEGRATED_SUMMARY,
  MEDIA_PERFORMANCE,
  DAILY_INTEGRATED_TREND
} from './reportData';

const number = value => (value == null ? '—' : Math.round(value).toLocaleString('ko-KR'));
const money = value => (value == null ? '—' : `₩${number(value)}`);
const percent = value => (value == null ? '—' : `${(value * 100).toFixed(1)}%`);
const compact = value => (value >= 10000 ? `${(value / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만` : number(value));

function MediaLogo({ media, size = 20 }) {
  const m = (media || '').toLowerCase();
  if (m.includes('naver') || m.includes('네이버')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ borderRadius: '5px', flexShrink: 0 }}>
        <rect width="24" height="24" rx="5" fill="#03C75A" />
        <path d="M13.8 6.5H18V17.5H13.8L10.2 11.8V17.5H6V6.5H10.2L13.8 12.2V6.5Z" fill="white" />
      </svg>
    );
  }
  if (m.includes('google') || m.includes('구글')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ borderRadius: '5px', flexShrink: 0 }}>
        <rect width="24" height="24" rx="5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
        <path fill="#4285F4" d="M19.6 12.25c0-.64-.06-1.25-.16-1.84H12v3.48h4.26c-.18.99-.75 1.83-1.6 2.4v2h2.59c1.51-1.39 2.35-3.44 2.35-6.04z" />
        <path fill="#34A853" d="M12 20c2.16 0 3.97-.72 5.3-1.94l-2.59-2c-.72.48-1.64.76-2.71.76-2.08 0-3.85-1.41-4.48-3.3H4.84v2.07C6.16 18.2 8.87 20 12 20z" />
        <path fill="#FBBC05" d="M7.52 13.52c-.16-.48-.25-.99-.25-1.52s.09-1.04.25-1.52V8.43H4.84A8.006 8.006 0 0 0 4 12c0 1.29.31 2.51.84 3.59l2.68-2.07z" />
        <path fill="#EA4335" d="M12 7.18c1.17 0 2.23.4 3.06 1.19l2.3-2.3C15.96 4.79 14.15 4 12 4 8.87 4 6.16 5.8 4.84 8.43l2.68 2.07c.63-1.89 2.4-3.32 4.48-3.32z" />
      </svg>
    );
  }
  if (m.includes('meta') || m.includes('메타')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ borderRadius: '5px', flexShrink: 0 }}>
        <rect width="24" height="24" rx="5" fill="#0081FB" />
        <path fill="#ffffff" d="M16.6 8.2c-1.3 0-2.3.8-2.9 1.8-.7-1.1-1.7-1.8-2.9-1.8-2.2 0-3.8 2-3.8 4.5 0 2.4 1.5 4.3 3.6 4.3 1.3 0 2.4-.7 3.1-1.8.7 1.1 1.8 1.8 3.1 1.8 2.1 0 3.6-1.9 3.6-4.3 0-2.5-1.6-4.5-3.8-4.5zm-5.7 6.7c-1.2 0-2.1-1.1-2.1-2.6 0-1.5.9-2.6 2.1-2.6 1.1 0 1.9.9 2.3 2.3-.4 1.6-1.2 2.9-2.3 2.9zm5.7 0c-1.1 0-1.9-1.3-2.3-2.9.4-1.4 1.2-2.3 2.3-2.3 1.2 0 2.1 1.1 2.1 2.6 0 1.5-.9 2.6-2.1 2.6z" />
      </svg>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '5px',
        background: '#f1f5f9',
        color: '#64748b',
        fontSize: '11px',
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {(media || '').slice(0, 1)}
    </span>
  );
}

export default function IntegratedReportView({ month = '2026-08' }) {
  const [mediaFilter, setMediaFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [trendMetric, setTrendMetric] = useState('spend');

  const filteredMedia = useMemo(() => {
    return MEDIA_PERFORMANCE.filter(item => {
      if (mediaFilter !== 'all' && !item.media.toLowerCase().includes(mediaFilter.toLowerCase())) return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (deviceFilter !== 'all' && item.device !== deviceFilter && item.device !== '전체') return false;
      return true;
    });
  }, [mediaFilter, typeFilter, deviceFilter]);

  const totals = useMemo(() => {
    const target = filteredMedia.length > 0 ? filteredMedia : MEDIA_PERFORMANCE;
    const spend = target.reduce((s, i) => s + i.spend, 0);
    const impressions = target.reduce((s, i) => s + i.impressions, 0);
    const clicks = target.reduce((s, i) => s + i.clicks, 0);
    const signUp = target.reduce((s, i) => s + i.signUp, 0);
    const apply = target.reduce((s, i) => s + i.apply, 0);
    return {
      spend,
      impressions,
      clicks,
      ctr: impressions ? clicks / impressions : 0,
      cpc: clicks ? spend / clicks : 0,
      signUp,
      signUpCpa: signUp ? spend / signUp : 0,
      apply,
      applyCpa: apply ? spend / apply : 0,
    };
  }, [filteredMedia]);

  const mediaShareData = useMemo(() => {
    const map = {};
    MEDIA_PERFORMANCE.forEach(item => {
      const key = item.media.split(' ')[0];
      if (!map[key]) {
        map[key] = { name: key, spend: 0, signUp: 0, apply: 0 };
      }
      map[key].spend += item.spend;
      map[key].signUp += item.signUp;
      map[key].apply += item.apply;
    });
    const colors = { Naver: '#03c75a', Google: '#4285f4', Meta: '#0668e1', 'Google GDN': '#ea4335', 'Naver GFA': '#10b981' };
    return Object.values(map).map(m => ({
      ...m,
      color: colors[m.name] || '#64748b',
    }));
  }, []);

  return (
    <div className="bd-report-view">
      {/* 툴바: 브랜드별 성과 탭 bd-toolbar 규격과 통일 */}
      <div className="bd-toolbar">
        <div className="bd-toolbar-controls">
          <div className="bd-period">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#74829a' }}>calendar_month</span>
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#43516a' }}>2026년 8월</span>
            <span className="bd-full-month">SA + DA 통합</span>
          </div>

          <div className="bd-segment" aria-label="매체 필터">
            {[['all', '전체 매체'], ['Naver', 'Naver'], ['Google', 'Google'], ['Meta', 'Meta']].map(([k, l]) => (
              <button
                key={k}
                className={mediaFilter === k ? 'active' : ''}
                onClick={() => setMediaFilter(k)}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="bd-segment" aria-label="광고 유형">
            {[['all', '전체 유형'], ['SA', 'SA'], ['DA', 'DA']].map(([k, l]) => (
              <button
                key={k}
                className={typeFilter === k ? 'active' : ''}
                onClick={() => setTypeFilter(k)}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="bd-segment" aria-label="기기 구분">
            {[['all', '전체 기기'], ['PC', 'PC'], ['MO', '모바일']].map(([k, l]) => (
              <button
                key={k}
                className={deviceFilter === k ? 'active' : ''}
                onClick={() => setDeviceFilter(k)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI 카드 그리드: 브랜드별 성과 탭 bd-kpis 규격 통일 */}
      <div className="bd-kpis">
        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>총 집행액</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>account_balance_wallet</span>
          </div>
          <strong>{money(totals.spend)}</strong>
          <div className="bd-kpi-foot">
            <span className="bd-negative">↗ 10.0%</span>
            <span>전월 대비</span>
          </div>
        </section>

        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>총 노출 / 클릭</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>visibility</span>
          </div>
          <strong>{compact(totals.impressions)} / {compact(totals.clicks)}</strong>
          <div className="bd-kpi-foot">
            <span>CTR <strong>{percent(totals.ctr)}</strong></span>
            <em />
            <span>CPC <strong>{money(totals.cpc)}</strong></span>
          </div>
        </section>

        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>회원가입 전환</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>person_add</span>
          </div>
          <strong>{number(totals.signUp)}<small style={{ fontSize: '12px', fontWeight: 400, marginLeft: '3px' }}>건</small></strong>
          <div className="bd-kpi-foot">
            <span className="bd-positive">↗ 5.0%</span>
            <span>CPA <strong>{money(totals.signUpCpa)}</strong></span>
          </div>
        </section>

        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>입사지원 전환</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>send</span>
          </div>
          <strong>{number(totals.apply)}<small style={{ fontSize: '12px', fontWeight: 400, marginLeft: '3px' }}>건</small></strong>
          <div className="bd-kpi-foot">
            <span>CPA <strong>{money(totals.applyCpa)}</strong></span>
            <em />
            <span>선택 기간 기준</span>
          </div>
        </section>
      </div>

      {/* 차트 그리드 */}
      <div className="bd-chart-grid">
        <section className="bd-panel">
          <div className="bd-panel-head">
            <div>
              <h2>8월 성과 추이</h2>
              <p>2026년 8월 · 일별 {trendMetric === 'spend' ? '집행액' : trendMetric === 'signUp' ? '회원가입 수' : '입사지원 수'}</p>
            </div>
            <div className="bd-segment">
              {[['spend', '집행액'], ['signUp', '회원가입'], ['apply', '입사지원']].map(([k, l]) => (
                <button
                  key={k}
                  className={trendMetric === k ? 'active' : ''}
                  onClick={() => setTrendMetric(k)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="bd-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_INTEGRATED_TREND} margin={{ top: 15, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="integratedTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5075ed" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#5075ed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf0f5" vertical={false} strokeDasharray="3 4" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={44} tick={{ fill: '#8d97ab', fontSize: 12 }} dy={8} />
                <YAxis
                  tickFormatter={compact}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8d97ab', fontSize: 12 }}
                  width={65}
                />
                <Tooltip
                  formatter={v => (trendMetric === 'spend' ? money(v) : `${number(v)}건`)}
                  labelFormatter={v => `8월 ${v} 성과`}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e7ebf3', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey={trendMetric}
                  name={trendMetric === 'spend' ? '집행액' : trendMetric === 'signUp' ? '회원가입' : '입사지원'}
                  stroke="#5075ed"
                  fill="url(#integratedTrendFill)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bd-chart-bottom">
            <span><i style={{ background: '#5075ed' }} />선택 조건: {trendMetric === 'spend' ? '집행액' : trendMetric === 'signUp' ? '회원가입' : '입사지원'}</span>
            <span>평균 CTR <strong>{percent(totals.ctr)}</strong><em />평균 CPC <strong>{money(totals.cpc)}</strong></span>
          </div>
        </section>

        <section className="bd-panel">
          <div className="bd-panel-head">
            <div>
              <h2>매체별 집행 비중</h2>
              <p>주요 매체별 광고비 및 운영 비중</p>
            </div>
            <span className="bd-unit">단위: 원</span>
          </div>
          <div className="bd-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mediaShareData} layout="vertical" margin={{ top: 9, right: 12, left: 0, bottom: 0 }} barGap={-8}>
                <CartesianGrid stroke="#edf0f5" horizontal={false} />
                <XAxis type="number" tickFormatter={compact} axisLine={false} tickLine={false} tick={{ fill: '#8d97ab', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={89} axisLine={false} tickLine={false} tick={{ fill: '#657086', fontSize: 12 }} />
                <Tooltip formatter={money} itemStyle={{ color: '#334155' }} labelStyle={{ color: '#0f172a', fontWeight: 700 }} contentStyle={{ borderRadius: 12, border: '1px solid #e7ebf3', fontSize: 12 }} />
                <Bar dataKey="spend" name="집행액" barSize={8} radius={[0, 3, 3, 0]}>
                  {mediaShareData.map(item => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bd-chart-bottom">
            <span><i className="bd-muted-dot" />Naver(44%) · Google(34%) · Meta(18%)</span>
            <span>총 {mediaShareData.length}개 주요 매체</span>
          </div>
        </section>
      </div>

      {/* 매체별 상세 성과 테이블: 매체 공식 정사각형 로고 + 깔끔한 UI 복원 */}
      <section className="bd-panel">
        <div className="bd-panel-head">
          <div>
            <h2>매체 및 캠페인별 상세 성과</h2>
            <p>검색광고(SA)와 디스플레이(DA) 매체별 지표 비교</p>
          </div>
          <span className="bd-pill">총 {filteredMedia.length}개 캠페인 세그먼트</span>
        </div>
        <div className="bd-table-scroll">
          <table className="bd-table">
            <thead>
              <tr>
                <th>매체</th>
                <th>캠페인 / 영역</th>
                <th>유형</th>
                <th>기기</th>
                <th>광고비</th>
                <th>노출</th>
                <th>클릭</th>
                <th>CTR</th>
                <th>CPC</th>
                <th>회원가입</th>
                <th>가입 CPA</th>
                <th>입사지원</th>
                <th>지원 CPA</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedia.map((m, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="bd-media-cell">
                      <MediaLogo media={m.media} size={20} />
                      <span className="bd-bold">{m.media}</span>
                    </div>
                  </td>
                  <td>{m.campaign}</td>
                  <td>
                    <span className="bd-event-tag">
                      {m.type}
                    </span>
                  </td>
                  <td>{m.device}</td>
                  <td><strong>{money(m.spend)}</strong></td>
                  <td>{number(m.impressions)}</td>
                  <td>{number(m.clicks)}</td>
                  <td>{percent(m.ctr)}</td>
                  <td>{money(m.cpc)}</td>
                  <td className="bd-blue bd-bold">{number(m.signUp)}<small className="bd-count-unit">건</small></td>
                  <td>{money(m.signUpCpa)}</td>
                  <td className="bd-blue bd-bold">{number(m.apply)}<small className="bd-count-unit">건</small></td>
                  <td>{money(m.applyCpa)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>선택 조건 합계</td>
                <td><strong>{money(totals.spend)}</strong></td>
                <td>{number(totals.impressions)}</td>
                <td>{number(totals.clicks)}</td>
                <td>{percent(totals.ctr)}</td>
                <td>{money(totals.cpc)}</td>
                <td>{number(totals.signUp)}<small className="bd-count-unit">건</small></td>
                <td>{money(totals.signUpCpa)}</td>
                <td>{number(totals.apply)}<small className="bd-count-unit">건</small></td>
                <td>{money(totals.applyCpa)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="bd-table-foot">
          <span>총 {filteredMedia.length}개 캠페인</span>
          <span>CTR·CPC·CPA는 선택한 세그먼트의 합계로 계산합니다.</span>
        </div>
      </section>

      {/* 운영 모니터링 인사이트: 브랜드별 성과 탭 bd-insights 규격 통일 */}
      <div className="bd-insights">
        <div className="bd-insight-icon">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
        </div>
        <div>
          <strong>운영 모니터링 · 8월 효율 분석 및 제안</strong>
          <p>
            네이버 PC/MO는 고효율 키워드 중심 입찰 방어로 CTR이 개선(PC +0.22%p, MO +0.37%p)되며 비수기 전환 단가를 안정적으로 유지했습니다.
            구글 PC는 CPC 급등(115원→216원)에 따라 9월 공채 시즌에는 효율이 검증된 모바일 비중 확대(35:65) 및 고효율 직무 키워드 집중 운영을 제안합니다.
          </p>
        </div>
        <span className="bd-rule">월간 운영 기준</span>
      </div>
    </div>
  );
}
