import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import FilterSelect from './FilterSelect';
import { MEDIA_PERFORMANCE } from './reportData';
import { AD_MEDIA_OPTIONS, AD_WEEKLY_CLICKS, getAdMonthlyClicks, getAdSelectedRows, combineMonthlyTraffic, getAdMonthlySeries, getMonthlyAdShares } from './adClickData';
import { trafficMonthLabel, TRAFFIC_MONTHS } from './trafficData';

const number = value => Math.round(value).toLocaleString('ko-KR');
const compact = value => `${(value / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만`;
const monthly = getAdMonthlySeries(TRAFFIC_MONTHS, getAdMonthlyClicks(MEDIA_PERFORMANCE));

export default function AdClickComparison({ rows, device }) {
  const [period, setPeriod] = useState('monthly');
  const [mode, setMode] = useState('stacked');
  const [keys, setKeys] = useState(AD_MEDIA_OPTIONS.map(media => media.key));
  const [downloaded, setDownloaded] = useState(false);
  const selected = AD_MEDIA_OPTIONS.filter(media => keys.includes(media.key));
  const weekly = getAdSelectedRows(AD_WEEKLY_CLICKS, keys);
  const combined = combineMonthlyTraffic(rows, monthly, keys);
  const shareRows = getMonthlyAdShares(combined, keys);
  const monthlyTotal = shareRows.reduce((sum, row) => sum + row.total, 0);
  const clickTotal = period === 'weekly' ? weekly.reduce((sum, row) => sum + row.total, 0) : monthlyTotal;
  const toggle = key => setKeys(previous => previous.includes(key) ? previous.length > 1 ? previous.filter(item => item !== key) : previous : [...previous, key]);
  const download = (exportPeriod = period) => {
    const data = exportPeriod === 'weekly'
      ? [['구간', '시작일~종료일(연도 미확인)', ...selected.map(media => `${media.name} 클릭`)], ...weekly.map(row => [row.period, row.range, ...selected.map(media => row[media.key])])]
      : [['월', ...selected.flatMap(media => [`${media.name} 클릭`, `${media.name} 비중(%)`]), '선택 매체 클릭 합계'], ...shareRows.map(row => [row.month, ...selected.flatMap(media => [row[media.key], row.shares[media.key].toFixed(1)]), row.total])];
    const csv = '\uFEFF' + data.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `ad-click-reference-${exportPeriod}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  };
  return <div className="bd-ad-comparison">
    <div className="bd-ad-context"><strong>광고 운영 참고</strong><p>UV는 코리안클릭 실제 수치, 광고 클릭은 기존 리포트의 가공 데이터입니다. 광고 클릭은 기기 전체·일부 하위 서비스가 포함된 별도 범위입니다. 서로 다른 기간·집계 범위이므로 기여율이나 상관계수를 계산하지 않습니다.</p></div>
    {period === 'weekly' && <section className="bd-panel"><div className="bd-panel-head"><div><h2>사람인 월간 UV</h2><p>{trafficMonthLabel(rows[0].month)} ~ {trafficMonthLabel(rows.at(-1).month)} · {device === 'PC' ? 'PC' : '모바일 앱'} · 코리안클릭</p></div><span className="bd-unit">단위: 명</span></div><div className="bd-ad-uv-chart" role="img" aria-label="선택 기간의 사람인 실제 월간 UV. 경쟁 서비스 비교 탭의 월별 표에서 상세 수치 확인"><ResponsiveContainer width="100%" height="100%"><LineChart data={rows} margin={{ top: 12, right: 24, left: 8, bottom: 8 }}><CartesianGrid stroke="#edf0f5" vertical={false} /><XAxis dataKey="month" tickFormatter={trafficMonthLabel} tick={{ fontSize: 11, fill: '#8290a6' }} minTickGap={22} axisLine={false} tickLine={false} /><YAxis tickFormatter={compact} width={62} domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#8290a6' }} axisLine={false} tickLine={false} /><Tooltip labelFormatter={trafficMonthLabel} formatter={value => [`${number(value)}명`, '사람인 UV']} /><Line type="linear" dataKey="saramin" stroke="#5075ed" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} /></LineChart></ResponsiveContainer></div></section>}
    <section className="bd-panel"><div className="bd-panel-head"><div><h2>{period === 'monthly' ? '사람인 UV · 광고 클릭 추이' : '광고 매체별 클릭 추이'}</h2><p>{period === 'weekly' ? '기존 W26~W35 · 연도 미확인 · UV 조회 기간과 별도' : `UV: ${device === 'PC' ? 'PC' : '모바일 앱'} · 광고 클릭: 기기 전체 · ${rows.length}개월`}</p></div><div className="bd-ad-controls"><FilterSelect compact label="광고 클릭 집계" value={period} onChange={setPeriod} options={[{ id: 'monthly', name: '월간 통합 비교' }, { id: 'weekly', name: '기존 주간 추이' }]} /><FilterSelect compact label="광고 클릭 차트" value={mode} onChange={setMode} options={[{ id: 'stacked', name: '매체별 분할' }, { id: 'total', name: '선택 매체 합산' }]} /></div></div>
      <div className="bd-traffic-services" aria-label="광고 클릭 매체 선택">{AD_MEDIA_OPTIONS.map(media => <button key={media.key} aria-pressed={keys.includes(media.key)} className={keys.includes(media.key) ? 'active' : ''} onClick={() => toggle(media.key)}><i style={{ background: media.color }} />{media.name}<span aria-hidden="true">{keys.includes(media.key) ? '✓' : '+'}</span></button>)}</div>
      {period === 'monthly' ? <>
        <div className="bd-ad-axis-labels"><span>━ 사람인 UV · 왼쪽 축(명)</span><span>▰ 광고 클릭 · 오른쪽 축(회)</span></div>
        <div className="bd-ad-combined-chart" role="img" aria-label="월간 UV는 선, 선택 매체의 월별 광고 클릭은 막대로 표시합니다."><ResponsiveContainer width="100%" height="100%"><ComposedChart data={combined} margin={{ top: 12, right: 8, left: 8, bottom: 8 }}><CartesianGrid vertical={false} stroke="#edf0f5" /><XAxis dataKey="month" tickFormatter={trafficMonthLabel} minTickGap={22} tick={{ fontSize: 11, fill: '#8290a6' }} axisLine={false} tickLine={false} /><YAxis yAxisId="uv" width={62} tickFormatter={compact} domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#5075ed' }} axisLine={false} tickLine={false} /><YAxis yAxisId="clicks" orientation="right" width={62} tickFormatter={compact} domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#8290a6' }} axisLine={false} tickLine={false} /><Tooltip labelFormatter={trafficMonthLabel} formatter={(value, name) => [`${number(value)}${name === '사람인 UV' ? '명' : '회'}`, name]} />{mode === 'total' ? <Bar yAxisId="clicks" dataKey="adTotal" name="선택 매체 합산 클릭" fill="#16a6a0" maxBarSize={44} isAnimationActive={false} /> : selected.map(media => <Bar key={media.key} yAxisId="clicks" dataKey={media.key} name={`${media.name} 클릭`} fill={media.color} stackId="clicks" maxBarSize={44} isAnimationActive={false} />)}<Line yAxisId="uv" type="linear" dataKey="saramin" name="사람인 UV" stroke="#5075ed" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} /></ComposedChart></ResponsiveContainer></div>
      </> : <div className="bd-ad-click-chart" role="img" aria-label="선택 광고 매체의 클릭 수. 아래 클릭 데이터 표에서 상세 수치 확인"><ResponsiveContainer width="100%" height="100%"><BarChart data={weekly} margin={{ top: 12, right: 24, left: 8, bottom: 8 }}><CartesianGrid vertical={false} stroke="#edf0f5" /><XAxis dataKey="period" tick={{ fontSize: 11, fill: '#8290a6' }} axisLine={false} tickLine={false} /><YAxis width={62} tickFormatter={compact} tick={{ fontSize: 11, fill: '#8290a6' }} axisLine={false} tickLine={false} /><Tooltip formatter={(value, name) => [`${number(value)}회`, name]} />{mode === 'total' ? <Bar dataKey="total" name="선택 매체 합산 클릭" fill="#5075ed" maxBarSize={44} isAnimationActive={false} /> : selected.map(media => <Bar key={media.key} dataKey={media.key} name={media.name} fill={media.color} stackId="clicks" maxBarSize={44} isAnimationActive={false} />)}</BarChart></ResponsiveContainer></div>}
      <div className="bd-table-foot"><span>선택 {selected.length}개 매체 · {period === 'weekly' ? '10개 주간 구간 합계' : '선택 기간 합계'} {number(clickTotal)}회</span><span>기기 필터는 실제 UV에만 적용됩니다.</span></div>
    </section>
    <section className="bd-panel"><div className="bd-panel-head"><div><h2>월별 매체 클릭 비중</h2><p>{trafficMonthLabel(rows[0].month)} ~ {trafficMonthLabel(rows.at(-1).month)} · 각 월 선택 매체의 클릭 합계 대비 비중</p></div><button className="bd-export" onClick={() => download('monthly')}>월별 클릭·비중 다운로드</button></div><div className="bd-table-scroll"><table className="bd-table bd-ad-monthly-shares"><thead><tr><th>월</th>{selected.map(media => <th key={media.key}>{media.name}</th>)}<th>클릭 합계</th><th>비중 합계</th></tr></thead><tbody>{shareRows.map(row => <tr key={row.month}><td>{trafficMonthLabel(row.month)}</td>{selected.map(media => <td key={media.key}><strong>{row.shares[media.key].toFixed(1)}%</strong><small>{number(row[media.key])}회</small></td>)}<td>{number(row.total)}회</td><td>100.0%</td></tr>)}</tbody></table></div><div className="bd-table-foot"><span>선택 기간 클릭 합계 {number(monthlyTotal)}회</span><span>매체 선택에 따라 월별 비중을 다시 계산합니다.</span></div>{downloaded && <div className="bd-table-foot" role="status">광고 클릭 데이터를 다운로드했습니다.</div>}</section>
    {period === 'weekly' && <section className="bd-panel"><div className="bd-panel-head"><div><h2>주간 클릭 데이터</h2><p>기존 구간 표기를 유지합니다. 연도가 확인되지 않아 실제 월간 UV와 날짜를 맞추지 않습니다.</p></div></div><div className="bd-table-scroll"><table className="bd-table bd-ad-weekly"><thead><tr><th>구간</th><th>일자 범위</th>{selected.map(media => <th key={media.key}>{media.name}</th>)}<th>합계</th></tr></thead><tbody>{weekly.map(row => <tr key={row.period}><td>{row.period}</td><td>{row.range}</td>{selected.map(media => <td key={media.key}>{number(row[media.key])}</td>)}<td>{number(row.total)}</td></tr>)}</tbody></table></div></section>}
  </div>;
}
