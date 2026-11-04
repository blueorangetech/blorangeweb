import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, ReferenceLine } from 'recharts';
import FilterSelect from './FilterSelect';
import AdClickComparison from './AdClickComparison';
import { TRAFFIC_SERVICES, TRAFFIC_MONTHS, getTrafficComparison, getTrafficChart, exportTrafficCsv, trafficMonthLabel } from './trafficData';
import './traffic.css';

const number = value => value == null ? '—' : Math.round(value).toLocaleString('ko-KR');
const compact = value => `${(value / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}만`;
const percent = value => value == null ? '비교 불가' : `${value > 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;
const direction = value => value == null || value === 0 ? '' : value > 0 ? 'bd-positive' : 'bd-negative';
const monthOptions = months => months.map(month => ({ id: month, name: trafficMonthLabel(month) }));

function TrafficTooltip({ active, payload, label, indexed }) {
  if (!active || !payload?.length) return null;
  return <div className="bd-traffic-tooltip"><strong>{label}</strong>{payload.map(item => <div key={item.dataKey}><span><i style={{ background: item.color }} />{item.name}</span><b>{indexed ? Number(item.value).toFixed(1) : number(item.value)}{indexed ? '' : '명'}</b></div>)}</div>;
}

export default function TrendReportView() {
  const [search, setSearch] = useSearchParams();
  const device = search.get('trafficDevice') === 'PC' ? 'PC' : 'MO(APP)';
  const start = TRAFFIC_MONTHS.includes(search.get('trafficStart')) ? search.get('trafficStart') : TRAFFIC_MONTHS[0];
  const requestedEnd = TRAFFIC_MONTHS.includes(search.get('trafficEnd')) ? search.get('trafficEnd') : TRAFFIC_MONTHS.at(-1);
  const end = requestedEnd < start ? start : requestedEnd;
  const [mode, setMode] = useState('uv');
  const [selected, setSelected] = useState(TRAFFIC_SERVICES.map(service => service.id));
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('competition');
  const { rows, ranking } = getTrafficComparison(device, start, end);
  const saramin = ranking.find(service => service.id === 'saramin');
  const competitor = ranking.find(service => service.id !== 'saramin');
  const chart = getTrafficChart(rows, selected, mode);
  const otherDevice = device === 'PC' ? 'MO(APP)' : 'PC';
  const otherSaramin = getTrafficComparison(otherDevice, start, end).ranking.find(service => service.id === 'saramin');
  const setFilter = (key, value) => {
    const next = new URLSearchParams(search);
    next.set(key, value);
    if (key === 'trafficStart' && value > end) next.set('trafficEnd', value);
    if (key === 'trafficEnd' && value < start) next.set('trafficStart', value);
    setSearch(next);
  };
  const toggle = id => setSelected(previous => previous.includes(id) ? previous.length > 1 ? previous.filter(item => item !== id) : previous : [...previous, id]);
  const download = () => {
    const url = URL.createObjectURL(new Blob([exportTrafficCsv(rows, device, selected)], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `koreanclick-UV-${device === 'PC' ? 'PC' : 'APP'}-${start}-${end}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('선택한 기기·기간·서비스의 월간 UV를 다운로드했습니다.');
  };

  return <div className="bd-report-view bd-traffic">
    <div className="bd-traffic-heading"><div><h1>트래픽 트렌드</h1><p>사람인과 경쟁 채용 서비스의 월간 순방문자 추이</p></div><span className="bd-traffic-source-tag">코리안클릭 · 월간 UV</span></div>
    <div className="bd-traffic-tabs" role="group" aria-label="트래픽 분석 화면"><button aria-pressed={tab === 'competition'} className={tab === 'competition' ? 'active' : ''} onClick={() => setTab('competition')}>경쟁 서비스 비교</button><button aria-pressed={tab === 'ad'} className={tab === 'ad' ? 'active' : ''} onClick={() => setTab('ad')}>광고 클릭 비교</button></div>
    <div className="bd-toolbar bd-traffic-toolbar"><div className="bd-traffic-filters">
      <FilterSelect label="트래픽 기기" value={device} onChange={value => setFilter('trafficDevice', value)} options={[{ id: 'MO(APP)', name: '모바일 앱' }, { id: 'PC', name: 'PC' }]} />
      <FilterSelect label="시작 월" value={start} onChange={value => setFilter('trafficStart', value)} options={monthOptions(TRAFFIC_MONTHS)} /><span>~</span>
      <FilterSelect label="종료 월" value={end} onChange={value => setFilter('trafficEnd', value)} options={monthOptions(TRAFFIC_MONTHS)} />
    </div><button className="bd-export" onClick={download}><span className="material-symbols-outlined" aria-hidden="true">download</span>{tab === 'ad' ? 'UV 다운로드' : '데이터 다운로드'}</button></div>
    <div className="bd-traffic-scope">조회 {trafficMonthLabel(start)} ~ {trafficMonthLabel(end)} · {rows.length}개월 <span>기준월 {trafficMonthLabel(end)} · {device === 'PC' ? 'PC' : '모바일 앱'}</span></div>
    {tab === 'ad' ? <AdClickComparison rows={rows} device={device} /> : <><div className="bd-kpis">
      <section className="bd-kpi"><div className="bd-kpi-label">사람인 월간 UV<span className="material-symbols-outlined" aria-hidden="true">group</span></div><strong>{number(saramin.uv)}<small>명</small></strong><div className="bd-kpi-foot"><span className={direction(saramin.mom)}>{percent(saramin.mom)}</span><span>전월 대비</span></div></section>
      <section className="bd-kpi"><div className="bd-kpi-label">사람인 순위<span className="material-symbols-outlined" aria-hidden="true">leaderboard</span></div><strong>{saramin.rank}<small>위 / 5개 서비스</small></strong><div className="bd-kpi-foot">기준월 전체 비교 서비스 기준</div></section>
      <section className="bd-kpi"><div className="bd-kpi-label">경쟁사 최대 UV<span className="material-symbols-outlined" aria-hidden="true">trending_up</span></div><strong>{number(competitor.uv)}<small>명</small></strong><div className="bd-kpi-foot">{competitor.name} · {percent(competitor.mom)} 전월 대비</div></section>
      <section className="bd-kpi"><div className="bd-kpi-label">{competitor.name} 대비 사람인 격차<span className="material-symbols-outlined" aria-hidden="true">compare_arrows</span></div><strong>{saramin.uv - competitor.uv > 0 ? '+' : ''}{number(saramin.uv - competitor.uv)}<small>명</small></strong><div className="bd-kpi-foot">사람인 UV − {competitor.name} UV</div></section>
    </div>
    <section className="bd-panel bd-traffic-trend">
      <div className="bd-panel-head"><div><h2>서비스별 월간 UV 추이</h2><p>{mode === 'uv' ? '월별 원자료 값을 비교합니다.' : `${trafficMonthLabel(start)} = 100 · 서비스별 기준월 대비 변화`} · {device === 'PC' ? 'PC' : '모바일 앱'}</p></div><div className="bd-segment" aria-label="트래픽 차트 표시"><button aria-pressed={mode === 'uv'} className={mode === 'uv' ? 'active' : ''} onClick={() => setMode('uv')}>실제 UV</button><button aria-pressed={mode === 'index'} className={mode === 'index' ? 'active' : ''} onClick={() => setMode('index')}>시작월 = 100</button></div></div>
      <div className="bd-traffic-services" aria-label="비교 서비스 선택">{TRAFFIC_SERVICES.map(service => <button key={service.id} aria-pressed={selected.includes(service.id)} className={selected.includes(service.id) ? 'active' : ''} onClick={() => toggle(service.id)}><i style={{ background: service.color }} /><span>{service.name}</span><span aria-hidden="true">{selected.includes(service.id) ? '✓' : '+'}</span></button>)}<small>최소 1개 선택 · 추이·월별 표·다운로드에 반영</small></div>
      <div className="bd-traffic-line" role="img" aria-label="선택 서비스의 월간 트래픽 추이. 상세 수치는 아래 월별 데이터 표에서 확인할 수 있습니다."><ResponsiveContainer width="100%" height="100%"><LineChart data={chart} margin={{ top: 18, right: 24, bottom: 10, left: 8 }}><CartesianGrid vertical={false} stroke="#edf0f5" strokeDasharray="3 4" /><XAxis dataKey="month" tickLine={false} axisLine={false} minTickGap={22} tick={{ fontSize: 11, fill: '#8290a6' }} /><YAxis width={62} tickFormatter={mode === 'uv' ? compact : number} domain={[0, 'auto']} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8290a6' }} /><Tooltip content={<TrafficTooltip indexed={mode === 'index'} />} />{mode === 'index' && <ReferenceLine y={100} stroke="#b3bfd5" strokeDasharray="4 4" />}{TRAFFIC_SERVICES.filter(service => selected.includes(service.id)).map(service => <Line key={service.id} type="linear" dataKey={service.id} name={service.name} stroke={service.color} strokeWidth={service.id === 'saramin' ? 3 : 2} dot={{ r: 3, strokeWidth: 1 }} activeDot={{ r: 5 }} isAnimationActive={false} />)}</LineChart></ResponsiveContainer></div>
      <div className="bd-table-foot"><span>단위: {mode === 'uv' ? '명(UV)' : '지수'} · {rows.length}개 월별 관측값</span><span>주간·일간 수치로 분할하거나 보간하지 않습니다.</span></div>
    </section>
    <div className="bd-traffic-comparison-grid">
      <section className="bd-panel"><div className="bd-panel-head"><div><h2>기준월 경쟁 구도</h2><p>{trafficMonthLabel(end)} · 전체 5개 서비스 · {device === 'PC' ? 'PC' : '모바일 앱'}</p></div></div><div className="bd-traffic-ranking" role="img" aria-label="전체 5개 서비스 UV 순위. 비교 표에서 수치를 확인할 수 있습니다."><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={ranking} margin={{ left: 0, right: 32, top: 0, bottom: 0 }}><CartesianGrid horizontal={false} stroke="#edf0f5" /><XAxis type="number" tickFormatter={compact} tick={{ fontSize: 11, fill: '#8290a6' }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12, fill: '#526580' }} axisLine={false} tickLine={false} /><Tooltip formatter={value => [`${number(value)}명`, '월간 UV']} cursor={{ fill: '#f5f7fc' }} /><Bar dataKey="uv" barSize={16} radius={[0, 4, 4, 0]} isAnimationActive={false}>{ranking.map(service => <Cell key={service.id} fill={service.color} />)}</Bar></BarChart></ResponsiveContainer></div><div className="bd-table-foot"><span>전체 5개 서비스</span><span>기준월 UV · 단위: 명</span></div></section>
      <section className="bd-panel"><div className="bd-panel-head"><div><h2>서비스별 비교</h2><p>전체 5개 서비스 · 기간 평균은 월간 UV의 산술평균</p></div></div><div className="bd-table-scroll"><table className="bd-table bd-traffic-summary"><thead><tr>{['서비스', '기준월 UV', '전월 대비', '기간 변화', '월평균 UV'].map(title => <th key={title}>{title}</th>)}</tr></thead><tbody>{ranking.map(service => <tr key={service.id} className={service.id === 'saramin' ? 'bd-traffic-highlight' : ''}><td><span className="bd-traffic-rank">{service.rank}</span>{service.name}</td><td>{number(service.uv)}</td><td className={direction(service.mom)}>{percent(service.mom)}</td><td className={direction(service.periodChange)}>{percent(service.periodChange)}</td><td>{number(service.average)}</td></tr>)}</tbody></table></div><div className="bd-table-foot"><span>기간 변화: 종료월 ÷ 시작월 − 1</span><span>UV 단위: 명</span></div></section>
    </div>
    <section className="bd-panel"><div className="bd-panel-head"><div><h2>경쟁 비교 인사이트</h2><p>기준월의 실제 UV와 기기별 순위를 기준으로 계산</p></div></div><div className="bd-traffic-insights"><div><span>01</span><p>{trafficMonthLabel(end)} {device === 'PC' ? 'PC' : '모바일 앱'}에서 사람인은 <strong>{saramin.rank}위</strong>입니다. {competitor.name}보다 UV가 <strong>{number(Math.abs(saramin.uv - competitor.uv))}명 {saramin.uv >= competitor.uv ? '많습니다' : '적습니다'}</strong>.</p></div><div><span>02</span><p>같은 달 {otherDevice === 'PC' ? 'PC' : '모바일 앱'}에서는 사람인이 <strong>{otherSaramin.rank}위({number(otherSaramin.uv)}명)</strong>입니다. 기기별 경쟁 상황을 나누어 확인하세요.</p></div><div><span>03</span><p>사람인의 전월 대비 UV는 <strong>{percent(saramin.mom)}</strong>, {competitor.name}는 <strong>{percent(competitor.mom)}</strong>입니다. {saramin.mom == null || competitor.mom == null ? '원자료에 직전월이 없어 전월 비교를 계산할 수 없습니다.' : `사람인의 증감률이 ${(Math.abs(saramin.mom - competitor.mom) * 100).toFixed(1)}%p ${saramin.mom >= competitor.mom ? '높습니다' : '낮습니다'}.`}</p></div></div></section>
    <section className="bd-panel"><div className="bd-panel-head"><div><h2>월별 데이터</h2><p>{device === 'PC' ? 'PC' : '모바일 앱'} · 선택 서비스 · 원자료 UV</p></div><span className="bd-unit">단위: 명</span></div><div className="bd-table-scroll"><table className="bd-table bd-traffic-monthly"><thead><tr><th>월</th>{TRAFFIC_SERVICES.filter(service => selected.includes(service.id)).map(service => <th key={service.id}>{service.name}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.month}><td>{trafficMonthLabel(row.month)}</td>{TRAFFIC_SERVICES.filter(service => selected.includes(service.id)).map(service => <td key={service.id} className={service.id === 'saramin' ? 'bd-blue bd-bold' : ''}>{number(row[service.id])}</td>)}</tr>)}</tbody></table></div></section>
    </>}
    <div className="bd-traffic-source"><strong>출처: 코리안클릭 · 채용서비스별 월 트래픽 추이</strong><p>제공 기간 2025.10 ~ 2026.09 · 기기 구분 MO(APP) / PC · 지표 UV. 모바일 웹 데이터는 제공되지 않았습니다. 기기·서비스 간 중복 방문자를 제거할 수 없어 UV를 합산하거나 시장점유율로 표시하지 않습니다. 광고 클릭 기여도 및 인과관계는 이 자료만으로 판단하지 않습니다.</p></div>
    {notice && <div role="status" className="bd-notice">{notice}<button aria-label="다운로드 알림 닫기" onClick={() => setNotice('')}>×</button></div>}
  </div>;
}
