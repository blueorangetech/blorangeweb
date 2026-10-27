import { useEffect, useMemo, useRef, useState } from 'react';
import { Area, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { aggregate, getMediaBudgetReport, groupBy, MEDIA, MONTHS, rows } from './data';
import { buildConversionInsight, buildKeywordInsights } from './analysis';
import './styles.css';

const num = value => Math.round(value).toLocaleString('ko-KR');
const won = value => `${num(value)}원`;
const pct = value => `${value.toFixed(2)}%`;
const sections = [['overview', '01', '성과 개요'], ['media', '02', '매체 분석'], ['funnel', '03', '전환 퍼널'], ['keywords', '04', '키워드 & 소재'], ['actions', '05', '운영 인사이트']];

function MediaBrand({ name }) {
  const assets = { NAVER: 'naver-icon.ico', Google: 'google-icon.ico', Daum: 'daum.ico' };
  return <span className="sf-media-brand"><span className="sf-media-logo"><img src={`/brands/samsungfire/${assets[name]}`} alt="" width="24" height="24" /></span><span className="sf-media-name">{name}</span></span>;
}

function NavIcon({ id }) {
  const paths = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    media: <><path d="M4 20h16M6 16V9h4v7m4 0V4h4v12" /></>,
    funnel: <path d="M3 4h18l-7 8v7l-4 2v-9Z" />,
    keywords: <><circle cx="10" cy="10" r="6" /><path d="m15 15 6 6" /></>,
    actions: <><path d="M4 18 10 12l4 3 6-10M14 5h6v6" /></>,
  };
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[id]}</svg>;
}

export default function Samsungfire() {
  const [month, setMonth] = useState(MONTHS[0]);
  const [media, setMedia] = useState('전체');
  const [device, setDevice] = useState('전체');
  const [group, setGroup] = useState('전체');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState(null);
  const [tab, setTab] = useState('keyword');
  const [metric, setMetric] = useState('contracts');
  const [sort, setSort] = useState('spend');
  const [activeSection, setActiveSection] = useState('overview');
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!detail) return;
    const trigger = document.activeElement;
    const closeButton = dialogRef.current?.querySelector('button');
    closeButton?.focus();
    const onKey = event => {
      if (event.key === 'Escape') setDetail(null);
      if (event.key === 'Tab') { event.preventDefault(); closeButton?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); trigger?.focus(); };
  }, [detail]);
  const filtered = useMemo(() => rows.filter(row => row.month === month && (media === '전체' || row.media === media) && (device === '전체' || row.device === device) && (group === '전체' || row.group === group)), [month, media, device, group]);
  const total = aggregate(filtered);
  const previousMonth = `2026-${String(Number(month.slice(5)) - 1).padStart(2, '0')}`;
  const previous = aggregate(rows.filter(row => row.month === previousMonth && (media === '전체' || row.media === media) && (device === '전체' || row.device === device) && (group === '전체' || row.group === group)));
  const mediaRows = groupBy(filtered, 'media');
  const budgetRows = getMediaBudgetReport(month, media);
  const budgetScale = Math.max(10000000, Math.ceil(Math.max(...budgetRows.map(row => Math.max(row.budget, row.spend))) / 10000000) * 10000000);
  const daily = groupBy(filtered, 'date').map(row => ({ ...row, day: row.name.slice(8), budget: Math.round(row.spend / 10000) }));
  const keywordRows = groupBy(filtered, tab === 'keyword' ? 'keyword' : 'campaign').filter(row => row.name.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b[sort] - a[sort]);
  const keywordRanking = groupBy(filtered, 'keyword').filter(row => row.contracts > 0).sort((a, b) => a.cpa - b.cpa);
  const best = keywordRanking[0];

  const target = Math.round(aggregate(rows.filter(row => row.month === month)).contracts * 1.08);
  const stages = [['광고 클릭', total.clicks], ['랜딩 방문', total.visits], ['계산 시작', total.starts], ['계산 완료', total.quotes], ['가입 완료', total.contracts]];
  const losses = stages.slice(1).map(([name, value], i) => ({ name, rate: (1 - value / (stages[i][1] || 1)) * 100 }));
  const bottleneck = [...losses].sort((a, b) => b.rate - a.rate)[0];
  const conversionInsight = buildConversionInsight(filtered);
  const keywordInsights = buildKeywordInsights(filtered);
  const delta = (key, lower = false) => {
    if (!previous[key]) return <span className="sf-neutral">전월 비교 없음</span>;
    const change = (total[key] / previous[key] - 1) * 100;
    return <span className={(lower ? change <= 0 : change >= 0) ? 'sf-positive' : 'sf-negative'}>{change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% <small>전월 대비</small></span>;
  };
  const exportCsv = () => {
    const csv = '\uFEFF' + [['검색어 / 캠페인', '광고비', '노출', '클릭', '계산 완료', '가입 완료', '가입 CPA'], ...keywordRows.map(row => [row.name, row.spend, row.impressions, row.clicks, row.quotes, row.contracts, Math.round(row.cpa)])].map(row => row.join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `samsungfire-${month}-${tab}.csv`; anchor.click(); URL.revokeObjectURL(url);
  };

  return <div className="sf-app">
    <aside className="sf-sidebar">
      <a className="sf-brand" href="#overview" onClick={() => setActiveSection('overview')}><img src="/brands/samsungfire/samsungfire.png" alt="삼성화재" /><small>자동차보험</small></a>
      <div className="sf-workspace">리포트</div>
      <nav aria-label="리포트 섹션">{sections.map(([id, , name]) => <a key={id} href={`#${id}`} className={activeSection === id ? 'active' : ''} onClick={() => setActiveSection(id)} aria-current={activeSection === id ? 'location' : undefined}><NavIcon id={id} />{name}</a>)}</nav>
    </aside>
    <main className="sf-main">
      <header className="sf-topbar"><h1>검색광고 리포트</h1><div><span>{month.replace('-', '년 ')}월</span><button onClick={() => window.print()}>↓ 리포트 인쇄</button></div></header>
      <div id="overview" className="sf-content">
        <div className="sf-filters">
          <label>분석 기간<select value={month} onChange={e => setMonth(e.target.value)}>{MONTHS.map(m => <option key={m} value={m}>{m.replace('-', '년 ')}월</option>)}</select></label>
          <label>검색 매체<select value={media} onChange={e => setMedia(e.target.value)}>{['전체', ...MEDIA].map(v => <option key={v}>{v}</option>)}</select></label>
          <label>디바이스<select value={device} onChange={e => setDevice(e.target.value)}>{['전체', '모바일', 'PC'].map(v => <option key={v}>{v}</option>)}</select></label>
          <label>키워드 유형<select value={group} onChange={e => setGroup(e.target.value)}>{['전체', '브랜드', '일반'].map(v => <option key={v}>{v}</option>)}</select></label>
          <button className="sf-reset" onClick={() => { setMonth(MONTHS[0]); setMedia('전체'); setDevice('전체'); setGroup('전체'); setQuery(''); }}>↺ 초기화</button><span className="sf-filter-note">검색광고 통합 기준</span>
        </div>
        <div className="sf-kpis">
          {[['집행 광고비', 'spend', won(total.spend), true, '매체 광고비 합계 · VAT 제외'], ['보험료 계산 완료', 'quotes', `${num(total.quotes)}건`, false, '보험료 계산 완료 이벤트'], ['가입 완료', 'contracts', `${num(total.contracts)}건`, false, '검색광고 기여 가입 완료'], ['가입 CPA', 'cpa', won(total.cpa), true, '광고비 ÷ 가입 완료 건수']].map(([label, key, value, lower, help], i) => <article className={`sf-kpi ${i === 2 ? 'sf-kpi-featured' : ''}`} key={key}><div>{label}<span title={help} aria-label={help} tabIndex={0}>ⓘ</span></div><strong>{value}</strong>{delta(key, lower)}</article>)}
        </div>
        <div className="sf-summary"><span className="sf-summary-icon">↗</span><div><strong>이번 달의 성과 포인트</strong><p>가입 {num(total.contracts)}건 · 클릭 대비 가입 전환율 {pct(total.cvr)}. {best?.name}의 가입 CPA는 {won(best?.cpa || 0)}으로 현재 선택 범위에서 가장 효율적입니다.</p></div><a href="#actions">운영 인사이트 보기 →</a></div>
        <div className="sf-chart-grid">
          <section className="sf-card sf-trend"><div className="sf-card-heading"><div><h2>일별 성과 추이</h2><p>광고비와 전환 흐름을 함께 확인합니다.</p></div><div className="sf-segment"><button className={metric === 'contracts' ? 'active' : ''} onClick={() => setMetric('contracts')}>가입 완료</button><button className={metric === 'quotes' ? 'active' : ''} onClick={() => setMetric('quotes')}>계산 완료</button></div></div><div className="sf-chart-legend"><span>● 광고비 (만원)</span><span>■ {metric === 'contracts' ? '가입 완료' : '계산 완료'} (건)</span></div><div className="sf-chart"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={daily} margin={{ top: 10, right: 0, left: -15, bottom: 0 }}><defs><linearGradient id="sfArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2e6aee" stopOpacity={0.18} /><stop offset="100%" stopColor="#2e6aee" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#edf0f5" vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} interval={4} tick={{ fontSize: 11, fill: '#8b95a6' }} /><YAxis yAxisId="money" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8b95a6' }} /><YAxis yAxisId="conversion" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8b95a6' }} /><Tooltip formatter={(value, name) => [num(value), name]} labelFormatter={label => `${month}-${label}`} /><Area yAxisId="money" type="monotone" dataKey="budget" name="광고비 (만원)" stroke="#326bef" fill="url(#sfArea)" strokeWidth={2} /><Bar yAxisId="conversion" dataKey={metric} name={metric === 'contracts' ? '가입 완료 (건)' : '계산 완료 (건)'} fill="#19b9ae" radius={[3, 3, 0, 0]} maxBarSize={18} /></ComposedChart></ResponsiveContainer></div></section>
          <div className="sf-chart-side">
            <section className="sf-card sf-target">
              <div className="sf-card-heading"><div><h2>월간 가입 목표</h2></div><span className="sf-muted">전체 검색광고 기준</span></div>
              <div className="sf-target-main"><div className="sf-target-number">{(total.contracts / target * 100).toFixed(1)}<span>%</span></div><p>목표까지 <strong>{num(Math.max(0, target - total.contracts))}건</strong></p></div>
              <div className="sf-progress"><span style={{ width: Math.min(100, total.contracts / target * 100) + '%' }} /></div>
              <div className="sf-target-counts"><div className="sf-target-row"><span>선택 가입</span><b>{num(total.contracts)}건</b></div><div className="sf-target-row"><span>전체 목표</span><b>{num(target)}건</b></div></div>
              <p className="sf-target-scope">선택 필터의 가입 ÷ 전체 월간 목표</p>
            </section>
            <section className="sf-card sf-spend-summary" aria-labelledby="sf-spend-title">
              <div className="sf-card-heading"><div><h2 id="sf-spend-title">매체별 예산 소진 현황</h2><p>월 전체 목표 광고비 대비 집행액</p></div><span className="sf-muted">단위: 원</span></div>
              <div className="sf-spend-rows">{budgetRows.map(row => <div className="sf-spend-row" key={row.name} tabIndex={0} role="group" aria-label={row.name + ' 예산 소진 현황'} aria-describedby={'sf-budget-tooltip-' + row.name}>
                <MediaBrand name={row.name} />
                <div className="sf-spend-plot" role="img" aria-label={row.name + ' 목표 ' + won(row.budget) + ', 집행 ' + won(row.spend) + ', 소진율 ' + (row.rate?.toFixed(1) || '0') + '%'}>
                  <span className="sf-spend-plan" style={{ width: row.budget / budgetScale * 100 + '%' }} />
                  <span className="sf-spend-actual" style={{ width: Math.min(row.spend, row.budget) / budgetScale * 100 + '%' }} />
                  {row.overrun > 0 && <span className="sf-spend-excess" style={{ left: row.budget / budgetScale * 100 + '%', width: row.overrun / budgetScale * 100 + '%' }} />}
                </div>
                <span className={row.overrun ? 'sf-spend-percent overrun' : 'sf-spend-percent'}>{row.rate?.toFixed(1)}%</span>
                <div className="sf-spend-tooltip" id={'sf-budget-tooltip-' + row.name} role="tooltip">
                  <strong>{row.name}</strong>
                  <div><span><i className="plan" />계획예산</span><b>{won(row.budget)}</b></div>
                  <div><span><i className="actual" />집행액</span><b>{won(row.spend)}</b></div>
                  <div><span>소진율</span><b>{row.rate?.toFixed(1)}%</b></div>
                  <div className={row.overrun ? 'sf-tooltip-overrun' : ''}><span>{row.overrun ? '초과 집행액' : '잔여 예산'}</span><b>{won(row.overrun || row.remaining)}</b></div>
                </div>
              </div>)}</div>
              <div className="sf-spend-axis"><span>0</span><span>{num(budgetScale / 10000)}만</span></div>
              <div className="sf-spend-legend"><span><i className="plan" />목표</span><span><i className="actual" />집행</span><span><i className="excess" />초과</span></div>
              <p className="sf-spend-scope">선택 월·매체 기준 · 디바이스·유형 전체</p>
            </section>
          </div>
        </div>

        <section id="media" className="sf-card"><div className="sf-card-heading"><div><h2>검색 매체별 성과</h2><p>매체를 선택하면 해당 매체의 상세 성과로 연결됩니다.</p></div></div><div className="sf-table-wrap"><table><thead><tr>{['검색 매체', '광고비', '노출수', '클릭수', 'CTR', '계산 완료', '가입 완료', '가입 CPA'].map(s => <th key={s}>{s}</th>)}</tr></thead><tbody>{mediaRows.map(row => <tr key={row.name}><td><button className="sf-media-link" onClick={() => setMedia(row.name)}><MediaBrand name={row.name} /></button></td><td>{won(row.spend)}</td><td>{num(row.impressions)}</td><td>{num(row.clicks)}</td><td>{pct(row.ctr)}</td><td>{num(row.quotes)}</td><td className="sf-blue">{num(row.contracts)}</td><td><b>{won(row.cpa)}</b></td></tr>)}</tbody><tfoot><tr><td>선택 범위 합계</td><td>{won(total.spend)}</td><td>{num(total.impressions)}</td><td>{num(total.clicks)}</td><td>{pct(total.ctr)}</td><td>{num(total.quotes)}</td><td>{num(total.contracts)}</td><td>{won(total.cpa)}</td></tr></tfoot></table></div></section>
        <section id="funnel" className="sf-card"><div className="sf-card-heading"><div><h2>클릭부터 가입까지, 전환 퍼널</h2></div><span className="sf-muted">이전 단계 대비 전환율</span></div><div className="sf-funnel">{stages.map(([label, value], i) => <div className="sf-stage" key={label}><div className="sf-stage-label"><span>0{i + 1}</span>{label}</div><strong>{num(value)}<small>건</small></strong><div className="sf-stage-bar"><span style={{ width: `${Math.max(8, value / total.clicks * 100)}%`, background: ['#b8cdfb', '#91b2f5', '#6996f3', '#407bed', '#1454d1'][i] }} /></div><p>{i ? `${(value / stages[i - 1][1] * 100).toFixed(1)}% 전환` : '유입 기준 100%'}</p></div>)}</div><div className="sf-funnel-note"><b>주요 점검 구간</b> {bottleneck.name} 단계의 이전 단계 대비 이탈률은 {bottleneck.rate.toFixed(1)}%입니다. 디바이스별 성과를 분리해 이탈 원인을 확인하세요.</div></section>
        <section id="keywords" className="sf-card"><div className="sf-card-heading"><div><h2>키워드 · 캠페인 성과</h2></div><button onClick={exportCsv}>↓ CSV 다운로드</button></div><div className="sf-table-controls"><div className="sf-tabs"><button className={tab === 'keyword' ? 'active' : ''} onClick={() => { setTab('keyword'); setQuery(''); }}>키워드 분석</button><button className={tab === 'campaign' ? 'active' : ''} onClick={() => { setTab('campaign'); setQuery(''); }}>캠페인 · 소재</button></div><div className="sf-search"><input aria-label="키워드 또는 캠페인 검색" placeholder="키워드 / 캠페인 검색" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="정렬 기준" value={sort} onChange={e => setSort(e.target.value)}><option value="spend">광고비순</option><option value="contracts">가입순</option><option value="cpa">CPA 높은 순</option></select></div></div><div className="sf-table-wrap"><table><thead><tr>{[tab === 'keyword' ? '키워드' : '캠페인', '광고비', '클릭수', '평균 CPC', '계산 완료', '가입 완료', '가입 전환율', '가입 CPA', '상세'].map(s => <th key={s}>{s}</th>)}</tr></thead><tbody>{keywordRows.map(row => <tr key={row.name}><td><strong>{row.name}</strong></td><td>{won(row.spend)}</td><td>{num(row.clicks)}</td><td>{won(row.cpc)}</td><td>{num(row.quotes)}</td><td className="sf-blue">{num(row.contracts)}</td><td>{pct(row.cvr)}</td><td>{won(row.cpa)}</td><td><button className="sf-detail-button" onClick={() => setDetail({ ...row, tab, month, media, device, group })}>보기 ↗</button></td></tr>)}</tbody></table>{!keywordRows.length && <p className="sf-empty">일치하는 결과가 없습니다. 검색어를 변경해주세요.</p>}</div><div className="sf-table-foot">총 {keywordRows.length}개 {tab === 'keyword' ? '키워드' : '캠페인'}<span>가입 전환율 = 가입 완료 ÷ 클릭수</span></div></section>
        <section id="actions"><div className="sf-section-title"><div><h2>운영 인사이트</h2></div></div><div className="sf-insights">{keywordInsights.map(insight => <article className="sf-conversion-insight" key={insight.id}><div className="sf-conversion-heading"><span className="sf-insight-index">{insight.label}</span><h3>{insight.title}</h3></div><div className="sf-conversion-body"><div><h4>{insight.evidenceHeading}</h4><p>{insight.evidence}</p></div><div><h4>{insight.actionHeading}</h4><p>{insight.action}</p></div><div><h4>{insight.validationHeading}</h4><p>{insight.validation}</p></div></div><p className="sf-conversion-note">{insight.limitation}</p></article>)}{conversionInsight && <article className="sf-conversion-insight"><div className="sf-conversion-heading"><span className="sf-insight-index">전환 개선</span><h3>{conversionInsight.title}</h3></div><div className="sf-conversion-body"><div><h4>01. 우선 개선 구간</h4><p>{conversionInsight.evidence}</p></div><div><h4>02. 실행할 변경</h4><p>{conversionInsight.action}</p></div><div><h4>03. 검증 기준</h4><p>{conversionInsight.validation}</p></div></div><p className="sf-conversion-note">{conversionInsight.limitation}</p></article>}</div></section>
        <details className="sf-definitions"><summary>지표 정의 및 집계 기준</summary><p>광고비는 VAT 제외 매체비입니다. 계산 완료·가입 완료는 각각 해당 완료 이벤트 기준입니다. 가입 기여는 마지막 검색광고 클릭 후 7일 이내, 단일 매체에 귀속하며 중복 가입은 제거합니다. CTR = 클릭 ÷ 노출, CPC = 광고비 ÷ 클릭, 가입 CPA = 광고비 ÷ 가입 완료입니다. 월간 목표는 전체 매체·디바이스 기준이며 필터에 따라 변경되지 않습니다. 전월 비교는 동일 조건의 월 전체 기준입니다.</p></details>
        <footer className="sf-footer"><img src="/brands/samsungfire/samsungfire.png" alt="삼성화재" /><span>자동차보험 검색광고 리포트 · {month.replace('-', '.')}</span><a href="#overview">맨 위로 ↑</a></footer>
      </div>
    </main>
    {detail && <div className="sf-detail-backdrop" onClick={() => setDetail(null)}><section ref={dialogRef} className="sf-detail" role="dialog" aria-modal="true" aria-label="검색광고 성과 상세" onClick={e => e.stopPropagation()}><button className="sf-close" autoFocus onClick={() => setDetail(null)} onKeyDown={e => { if (e.key === 'Escape') setDetail(null); }}>닫기 ✕</button><h2>{detail.name}</h2><p>{detail.month} · {detail.media} 매체 · {detail.device} · {detail.group} 키워드</p><div className="sf-detail-stats"><div>가입 완료<strong>{num(detail.contracts)}건</strong></div><div>가입 CPA<strong>{won(detail.cpa)}</strong></div></div><h3>검색 소재 메시지</h3><div className="sf-ad-preview"><small>검색광고 · 메시지 기획안</small><h3>삼성화재 자동차보험 | 내 차 보험료 확인</h3><p>자동차보험을 준비하는 첫 단계.<br />내 조건에 맞는 보험료를 확인해보세요.</p><span>보험료 확인 →</span></div><p className="sf-muted">성과는 선택한 {detail.tab === 'keyword' ? '키워드' : '캠페인'} 집계 기준입니다. 소재별 성과는 별도 집계하지 않습니다.</p><h3>운영 확인 항목</h3><p>검색어와 광고 메시지의 일치 여부, 디바이스별 계산 완료율, 가입 CPA를 함께 검토합니다.</p></section></div>}
  </div>;
}

