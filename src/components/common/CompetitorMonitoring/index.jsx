import { useEffect, useRef, useState } from 'react';
import { competitors, monitoringEvents, monitoringSources } from './monitoringData';
import { eventPeriod, filterEvents, getEventStatus, koreanDate, matchesCategory } from './monitoringModel';
import '../../../styles/components/common/CompetitorMonitoring.css';

const categories = [
  { id: 'all', label: '전체 소식', description: '홈페이지·SNS·뉴스의 확인된 소식', icon: 'campaign' },
  { id: 'promotion', label: '행사·콘텐츠', description: '캠페인·팝업·시즌 행사', icon: 'local_activity' },
  { id: 'price', label: '혜택·가격 비교', description: '공식 기존가와 적용 가격', icon: 'price_check' },
  { id: 'ending', label: '종료 임박', description: '3일 이내 종료 예정', icon: 'event_upcoming' }
];
const money = value => `${value.toLocaleString('ko-KR')}원`;
const displayDate = value => value.replaceAll('-', '.');
const publicationDates = event => event.sources.filter(source => source.publishedOn);
function EventDates({ event }) {
  return <>
    {publicationDates(event).map(source => <div className="cm-event-period" key={source.url}><span className="material-symbols-outlined" aria-hidden="true">article</span>{source.channel} 게시일 {displayDate(source.publishedOn)}</div>)}
    {event.type !== 'content' && <div className="cm-event-period"><span className="material-symbols-outlined" aria-hidden="true">date_range</span>{eventPeriod(event)}</div>}
    {event.type === 'content' && !publicationDates(event).length && <div className="cm-event-period">게시일 미공개</div>}
  </>;
}

function SourceLink({ source, children }) {
  return <a className="cm-source-link" href={source.url} target="_blank" rel="noopener noreferrer">{children || source.title}<span className="material-symbols-outlined" aria-hidden="true">open_in_new</span></a>;
}

function EventImage({ event, detail = false }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className="cm-image-fallback"><span className="material-symbols-outlined" aria-hidden="true">image_not_supported</span><span>이미지는 공식 원문에서 확인하세요.</span></div>
  ) : (
    <img className={event.imageFit === 'contain' ? 'is-product' : ''} src={detail && event.detailImage ? event.detailImage : event.image} alt={event.imageAlt} loading="lazy" onError={() => setFailed(true)} />
  );
}

function PriceComparison({ comparison, compact = false }) {
  return <div className={`cm-price-comparison ${compact ? 'is-compact' : ''}`} aria-label="공식 페이지에 공개된 가격 비교">
    <div><span>{comparison.beforeLabel}</span><del>{money(comparison.before)}</del></div>
    <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
    <div><span>{comparison.afterLabel}</span><strong>{money(comparison.after)}</strong></div>
    {!compact && <p>{comparison.note}</p>}
  </div>;
}

export default function CompetitorMonitoring() {
  const [tab, setTab] = useState('feed');
  const [kind, setKind] = useState('all');
  const [brand, setBrand] = useState('all');
  const [channel, setChannel] = useState('all');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const detailHeading = useRef(null);
  const today = koreanDate();
  const matching = filterEvents(monitoringEvents, { brand, channel, query, status }, today);
  const visible = matching.filter(event => matchesCategory(event, kind, today));
  const selected = visible.find(event => event.id === selectedId);
  const verifiedBrands = monitoringSources.filter(source => source.status === 'verified').length;
  const channels = [...new Set(monitoringEvents.flatMap(event => event.sources.map(source => source.channel)))];

  useEffect(() => {
    if (selectedId) detailHeading.current?.focus({ preventScroll: true });
  }, [selectedId]);

  const resetFilters = () => {
    setBrand('all'); setChannel('all'); setKind('all'); setQuery(''); setStatus('all'); setSelectedId(null);
  };
  const changeFilter = setter => event => { setter(event.target.value); setSelectedId(null); };

  return (
    <section className="competitor-monitor" aria-label="경쟁사 모니터링">
      <header className="cm-page-header">
        <div><span className="cm-eyebrow">COMPETITIVE INTELLIGENCE</span><h1>경쟁사 모니터링</h1><p>경쟁사의 홈페이지·SNS·뉴스를 모아 캠페인과 혜택을 확인하세요.</p></div>
        <div className="cm-verification"><span className="material-symbols-outlined" aria-hidden="true">verified</span><div><strong>출처 확인</strong><span>원문·게시일 기준</span></div></div>
      </header>
      <div className="cm-stats" aria-label="소식 유형 필터">
        {categories.map(category => <button type="button" key={category.id} className={`cm-stat ${kind === category.id ? 'is-active' : ''}`} aria-pressed={kind === category.id} onClick={() => { setKind(category.id); setTab('feed'); setSelectedId(null); }}>
          <span className="cm-stat-title">{category.label}<span className="material-symbols-outlined" aria-hidden="true">{category.icon}</span></span>
          <strong>{matching.filter(event => matchesCategory(event, category.id, today)).length}<small>건</small></strong><span className="cm-stat-description">{category.description}</span>
        </button>)}
      </div>
      <div className="cm-tabs" role="tablist" aria-label="모니터링 화면">
        {[{ id: 'feed', label: '소식 모아보기' }, { id: 'sources', label: '출처 확인 현황' }].map(item => <button key={item.id} id={`cm-tab-${item.id}`} type="button" role="tab" aria-selected={tab === item.id} aria-controls={`cm-panel-${item.id}`} onClick={() => { setTab(item.id); setSelectedId(null); }}>{item.label}</button>)}
      </div>
      <div id="cm-panel-feed" role="tabpanel" aria-labelledby="cm-tab-feed" hidden={tab !== 'feed'}>
        <div className="cm-filters">
          <label className="cm-search"><span className="material-symbols-outlined" aria-hidden="true">search</span><input aria-label="소식 검색" type="search" placeholder="브랜드, 행사, 혜택 검색" value={query} onChange={changeFilter(setQuery)} /></label>
          <label>경쟁사<select value={brand} onChange={changeFilter(setBrand)}><option value="all">전체 경쟁사</option>{competitors.map(name => <option key={name}>{name}</option>)}</select></label>
          <label>채널<select value={channel} onChange={changeFilter(setChannel)}><option value="all">전체 채널</option>{channels.map(name => <option key={name}>{name}</option>)}</select></label>
          <label>상태<select value={status} onChange={changeFilter(setStatus)}><option value="all">전체 상태</option><option value="active">진행 중</option><option value="upcoming">진행 예정</option><option value="ended">종료</option><option value="undated">기간 미정</option><option value="published">게시 콘텐츠</option></select></label>
          <button type="button" className="cm-text-button" onClick={resetFilters}>초기화</button>
        </div>
        <div className="cm-channel-pills" aria-label="채널별 소식">
          {['all', ...channels].map(name => <button type="button" key={name} aria-pressed={channel === name} onClick={() => { setChannel(name); setSelectedId(null); }}>{name === 'all' ? '전체 채널' : name} <span>{monitoringEvents.filter(event => name === 'all' || event.sources.some(source => source.channel === name)).length}</span></button>)}
        </div>
        <div className="cm-list-heading"><h2>{categories.find(category => category.id === kind).label} <span aria-live="polite">{visible.length}건</span></h2><span>확인한 경쟁사 {verifiedBrands}개 · 행사 상태 기준 {displayDate(today)}</span></div>
        <div className={`cm-feed-layout ${selected ? 'has-detail' : ''}`}>
          <div className="cm-event-list">
            {!visible.length && <div className="cm-empty"><span className="material-symbols-outlined" aria-hidden="true">search_off</span><h3>{kind === 'ending' ? '3일 이내 종료 예정인 행사가 없습니다.' : '조건에 맞는 소식이 없습니다.'}</h3><p>원문에서 확인한 소식만 표시합니다. 검색어나 필터를 변경해 보세요.</p><button type="button" className="cm-text-button" onClick={resetFilters}>전체 소식 보기</button></div>}
            {visible.map(event => {
              const lifecycle = getEventStatus(event, today);
              return <article className={`cm-event ${selectedId === event.id ? 'is-selected' : ''}`} key={event.id}>
                <button className="cm-event-image" type="button" aria-label={`${event.brand} ${event.title} 상세 보기`} onClick={() => setSelectedId(event.id)}><EventImage event={event} /><span className={`cm-lifecycle cm-lifecycle-${lifecycle.id}`}>{lifecycle.label}</span></button>
                <div className="cm-event-content">
                  <div className="cm-event-top"><strong>{event.brand}</strong><span className={`cm-tag cm-tag-${event.type}`}>{event.label}</span></div>
                  <h3>{event.title}</h3><p>{event.summary}</p>
                  {event.comparison && <PriceComparison comparison={event.comparison} compact />}
                  <EventDates event={event} />
                  <div className="cm-event-bottom"><span>{[...new Set(event.sources.map(source => source.channel))].join(' · ')} · 출처 {event.sources.length}개</span><button type="button" className="cm-text-button" aria-expanded={selectedId === event.id} aria-controls="cm-event-detail" onClick={() => setSelectedId(selectedId === event.id ? null : event.id)}>상세 보기 <span aria-hidden="true">→</span></button></div>
                </div>
              </article>;
            })}
          </div>
          {selected && <aside className="cm-detail" id="cm-event-detail" aria-label="선택한 소식 상세" onKeyDown={event => { if (event.key === 'Escape') setSelectedId(null); }}>
            <div className="cm-detail-top"><span className="cm-official-label">출처 확인</span><button type="button" className="cm-close" aria-label="상세 닫기" onClick={() => setSelectedId(null)}><span className="material-symbols-outlined" aria-hidden="true">close</span></button></div>
            <p className="cm-detail-brand">{selected.brand}</p><h2 ref={detailHeading} tabIndex={-1}>{selected.title}</h2><p>{selected.summary}</p>
            <div className="cm-detail-image"><EventImage key={selected.id} event={selected} detail /></div>
            {selected.comparison && <PriceComparison comparison={selected.comparison} />}
            <dl><dt>행사·적용 기간</dt><dd>{eventPeriod(selected)}</dd><dt>주요 내용·혜택</dt><dd>{selected.benefit}</dd><dt>적용 조건</dt><dd><ul>{selected.conditions.map(condition => <li key={condition}>{condition}</li>)}</ul></dd></dl>
            <div className="cm-evidence"><strong>원문 확인 내용</strong><p>{selected.evidence}</p></div>
            <div className="cm-detail-sources"><h3>채널별 원문 · 게시일</h3>{selected.sources.map(source => <div className="cm-source-entry" key={source.url}>
              <div className="cm-source-meta"><strong>{source.channel}</strong><span>{source.kind === 'press_release' ? '기업 제공 보도자료' : source.kind === 'news' ? '언론 기사' : '브랜드 공식'}</span></div>
              <SourceLink source={source} /><p>{source.publisher} · {source.publishedOn ? `${displayDate(source.publishedOn)} 게시` : '게시일 미공개'}</p>
              {source.verificationNote && <p>{source.verificationNote}</p>}
            </div>)}</div>
          </aside>}
        </div>
      </div>
      <div id="cm-panel-sources" role="tabpanel" aria-labelledby="cm-tab-sources" hidden={tab !== 'sources'}>
        <div className="cm-list-heading"><h2>경쟁사별 출처 현황 <span>{verifiedBrands} / {competitors.length}개사 확인</span></h2><span>원문·게시일 기준</span></div>
        <div className="cm-source-grid">{monitoringSources.map(source => <article className="cm-source" key={source.brand}>
          <div className="cm-event-top"><h3>{source.brand}</h3><span className={`cm-tag cm-source-${source.status}`}>{source.status === 'verified' ? '원문 확인' : '미확인'}</span></div>
          <p>{source.count ? `${source.channels.join(' · ')} · 확인한 소식 ${source.count}건` : '아직 확인된 원문이 없습니다.'}</p>
          {source.url && <SourceLink source={source}>확인한 원문 열기</SourceLink>}
        </article>)}</div>
      </div>
    </section>
  );
}
