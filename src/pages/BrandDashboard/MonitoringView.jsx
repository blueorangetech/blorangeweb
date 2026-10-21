import { useCallback, useState } from 'react';
import BulkUrlPanel from './BulkUrlPanel';
import FilterSelect from './FilterSelect';
import { MONITORING_DATE, RECRUITMENT_POSTINGS, deadlineStatus } from './monitoringData';

export default function MonitoringView() {
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('all');
  const [sort, setSort] = useState('deadline');
  const [bulkOpen, setBulkOpen] = useState(false);
  const closeBulk = useCallback(() => setBulkOpen(false), []);
  const data = RECRUITMENT_POSTINGS;
  const title = '채용공고 모니터링';
  const filtered = data.filter(row => {
    const matchesQuery = `${row.id} ${row.title} ${row.company} ${row.platform}`.toLowerCase().includes(query.trim().toLowerCase());
    const days = row.daysUntilClose;
    const matchesPeriod = period === 'all' || (period === 'closed' ? days < 0 : period === 'today' ? days === 0 : period === 'urgent' ? days >= 1 && days <= 3 : period === 'soon' ? days >= 4 && days <= 7 : days >= 8);
    return matchesQuery && matchesPeriod;
  }).sort((a, b) => sort === 'recent' ? b.startDate.localeCompare(a.startDate) : (a.daysUntilClose < 0) - (b.daysUntilClose < 0) || a.daysUntilClose - b.daysUntilClose);
  const kpis = [
    ['전체 공고', data.length, '모니터링 대상'],
    ['접수 중', data.filter(row => row.daysUntilClose >= 0).length, '마감일 당일 포함'],
    ['마감 임박', data.filter(row => row.daysUntilClose >= 0 && row.daysUntilClose <= 3).length, '오늘 ~ 3일 이내'],
    ['마감 완료', data.filter(row => row.daysUntilClose < 0).length, '접수 종료 공고'],
  ];

  return <div className="bd-monitoring">
    <div className="bd-monitoring-heading">
      <div><div className="bd-monitoring-title-row"><h1>{title}</h1><span className="bd-pill">기준일 {MONITORING_DATE}</span></div><p>채용공고별 지원 기간과 마감까지 남은 일수를 확인합니다.</p></div>
      <div className="bd-monitoring-actions"><button type="button" className="bd-export" onClick={() => setBulkOpen(true)}><span className="material-symbols-outlined" aria-hidden="true">playlist_add_check</span>URL 일괄 정리</button></div>
    </div>
    <div className="bd-kpis">{kpis.map(([label, value, note]) => <section key={label} className="bd-kpi"><div className="bd-kpi-label">{label}</div><strong>{value}<small className="bd-monitoring-unit">건</small></strong><div className="bd-kpi-foot">{note}</div></section>)}</div>
    <section className="bd-panel">
      <div className="bd-panel-head"><div><h2>공고 현황</h2><p>마감 잔여일은 기준일과 지원 종료일의 날짜 차이입니다.</p></div><div className="bd-monitoring-head-right"><span className="bd-pill">{filtered.length} / {data.length}건</span><div className="bd-monitoring-legend">{[['today', '오늘 마감'], ['urgent', '1~3일'], ['soon', '4~7일'], ['normal', '8일 이상'], ['closed', '마감 완료']].map(([key, label]) => <span key={key} className={`bd-deadline bd-deadline-${key}`}>{label}</span>)}</div></div></div>
      <div className="bd-monitoring-filters">
        <input aria-label="공고 검색" type="search" placeholder="공고 ID, 공고명, 기업명 검색" value={query} onChange={event => setQuery(event.target.value)} />
        <FilterSelect label="마감 기간" value={period} onChange={setPeriod} options={[{ id: 'all', name: '전체 마감 기간' }, { id: 'today', name: '오늘 마감' }, { id: 'urgent', name: '1~3일 이내' }, { id: 'soon', name: '4~7일 이내' }, { id: 'normal', name: '8일 이상' }, { id: 'closed', name: '마감 완료' }]} />
        <FilterSelect label="공고 정렬" value={sort} onChange={setSort} options={[{ id: 'deadline', name: '마감 임박순' }, { id: 'recent', name: '지원 시작일 최신순' }]} />
      </div>
      <div className="bd-table-scroll"><table className="bd-table bd-monitoring-table">
        <thead><tr>{['공고 ID', '기업명', '공고명', '지원 시작일', '지원 종료일', '마감 잔여일'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{filtered.map(row => {
          const status = deadlineStatus(row.daysUntilClose);
          return <tr key={row.id}><td>{row.id}</td><td>{row.company}</td><td><strong>{row.title}</strong></td><td>{row.startDate}</td><td>{row.endDate}</td><td><span className={`bd-deadline bd-deadline-${status.key}`}>{status.text}</span></td></tr>;
        })}{!filtered.length && <tr><td colSpan={6} className="bd-monitoring-empty">조건에 맞는 공고가 없습니다.</td></tr>}</tbody>
      </table></div>

    </section>
    <BulkUrlPanel open={bulkOpen} onClose={closeBulk} />
  </div>;
}
