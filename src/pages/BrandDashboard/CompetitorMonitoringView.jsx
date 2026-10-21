import { useState } from 'react';
import FilterSelect from './FilterSelect';
import { MONITORING_DATE, daysUntilClose, deadlineStatus } from './monitoringData';
import { COMPETITORS, COMPETITOR_ACTIVITIES } from './competitorMonitoringData';

function statusFor(item) {
  if (item.imagePending) return { key: 'closed', text: '이미지 미확인' };
  if (!item.endDate) return { key: 'normal', text: '종료일 미확인' };
  return deadlineStatus(daysUntilClose(item.endDate));
}

export default function CompetitorMonitoringView() {
  const [competitor, setCompetitor] = useState('all');
  const [type, setType] = useState('event');
  const [query, setQuery] = useState('');
  const filtered = COMPETITOR_ACTIVITIES.filter(item => (competitor === 'all' || item.competitorId === competitor) && (type === 'all' || item.type === type) && `${item.title} ${item.copy} ${item.channel} ${COMPETITORS.find(brand => brand.id === item.competitorId).name}`.includes(query.trim())).sort((a, b) => b.firstSeen.localeCompare(a.firstSeen));
  const kpis = [
    ['모니터링 경쟁사', COMPETITORS.length, '잡코리아 · 리멤버 · 원티드'],
    ['이벤트', COMPETITOR_ACTIVITIES.filter(item => item.type === 'event').length, '프로모션 및 참여형 이벤트'],
    ['광고 소재', COMPETITOR_ACTIVITIES.filter(item => item.type === 'creative').length, '네이버 브랜드검색 대표이미지'],
    ['종료 임박 이벤트', COMPETITOR_ACTIVITIES.filter(item => item.endDate && daysUntilClose(item.endDate) >= 0 && daysUntilClose(item.endDate) <= 3).length, '오늘 ~ 3일 이내 종료'],
  ];
  return <div className="bd-monitoring">
    <div className="bd-monitoring-heading"><div><div className="bd-monitoring-title-row"><h1>경쟁사 모니터링</h1><span className="bd-pill">기준일 {MONITORING_DATE}</span></div><p>잡코리아·리멤버·원티드의 이벤트와 광고 소재, 핵심 메시지를 확인합니다.</p></div></div>
    <div className="bd-kpis">{kpis.map(([label, value, note]) => <section key={label} className="bd-kpi"><div className="bd-kpi-label">{label}</div><strong>{value}<small className="bd-monitoring-unit">{label === '모니터링 경쟁사' ? '개사' : '건'}</small></strong><div className="bd-kpi-foot">{note}</div></section>)}</div>
    <div className="bd-competitor-tabs" aria-label="경쟁사 모니터링 유형">{[['event', '이벤트'], ['creative', '광고 소재']].map(([id, label]) => <button key={id} type="button" className={type === id ? 'active' : ''} aria-pressed={type === id} onClick={() => setType(id)}>{label}<span>{COMPETITOR_ACTIVITIES.filter(item => item.type === id && (competitor === 'all' || item.competitorId === competitor)).length}</span></button>)}</div>
    <section className="bd-panel">
      <div className="bd-panel-head"><div><h2>{type === 'event' ? '경쟁사 이벤트' : '경쟁사 광고 소재'}</h2><p>{type === 'event' ? '이벤트 이미지와 참여 혜택, 진행 기간을 확인합니다.' : '네이버 브랜드검색의 대표이미지와 메인 카피를 확인합니다.'}</p></div><span className="bd-pill">{filtered.length}건</span></div>
      <div className="bd-monitoring-filters"><input type="search" aria-label="경쟁사 콘텐츠 검색" placeholder={type === 'event' ? '경쟁사, 이벤트명 검색' : '경쟁사, 광고 카피 검색'} value={query} onChange={event => setQuery(event.target.value)} /><FilterSelect label="경쟁사" value={competitor} onChange={setCompetitor} options={[{ id: 'all', name: '전체 경쟁사' }, ...COMPETITORS]} /></div>
      <div className="bd-competitor-grid">{filtered.map(item => {
        const brand = COMPETITORS.find(entry => entry.id === item.competitorId);
        const status = statusFor(item);
        return <article className="bd-competitor-card" key={item.id}>
          {item.image ? <a className="bd-competitor-image" href={item.image} target="_blank" rel="noopener noreferrer" aria-label={`${brand.name} ${item.title} 이미지 크게 보기`}><img src={item.image} alt={`${brand.name} ${item.title}`} loading="lazy" /></a> : <div className="bd-competitor-image bd-competitor-image-pending"><span className="material-symbols-outlined" aria-hidden="true">image_not_supported</span><strong>{brand.name}</strong><span>브랜드검색 대표이미지 미확인</span></div>}
          <div className="bd-competitor-details"><div className="bd-competitor-tags"><span className="bd-event-tag">{item.type === 'event' ? '이벤트' : '광고 소재'}</span><span>{item.channel}</span><span className={`bd-deadline bd-deadline-${status.key}`}>{status.text}</span></div><h3>{item.title}</h3><dl><div><dt>{item.imagePending ? '확인 시도' : '최초 확인'}</dt><dd>{item.firstSeen}</dd></div><div><dt>{item.type === 'event' ? '이벤트 기간' : '집행 기간'}</dt><dd>{item.startDate ? `${item.startDate} ~ ${item.endDate || '종료일 미확인'}` : '확인되지 않음'}</dd></div></dl><a className="bd-competitor-detail-button" href={item.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`${brand.name} ${item.title} 바로가기 (새 창)`}>바로가기<span className="material-symbols-outlined" aria-hidden="true">open_in_new</span></a></div>
        </article>;
      })}{!filtered.length && <p className="bd-monitoring-empty">조건에 맞는 이벤트 또는 광고 소재가 없습니다.</p>}</div>
    </section>
  </div>;
}
