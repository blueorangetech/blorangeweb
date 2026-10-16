import { useState } from 'react';
import { competitors, demoEvents, demoSources } from './demoData';
import '../../../styles/components/common/CompetitorMonitoring.css';

const categories = [
  { id: 'all', label: '최근 수집 소식', description: '전체 소식' },
  { id: 'new', label: '새로운 소식', description: '처음 발견한 행사·콘텐츠' },
  { id: 'change', label: '혜택·기간 변경', description: '이전 수집 내용과 비교' },
  { id: 'ending', label: '종료 임박', description: '3일 이내 종료 예정' }
];

export default function CompetitorMonitoring() {
  const [tab, setTab] = useState('feed');
  const [kind, setKind] = useState('all');
  const [brand, setBrand] = useState('all');
  const [channel, setChannel] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const selected = demoEvents.find(event => event.id === selectedId);
  const matching = demoEvents.filter(event =>
    (brand === 'all' || event.brand === brand) &&
    (channel === 'all' || event.sources.includes(channel))
  );
  const visible = matching.filter(event => kind === 'all' || event.kind === kind);

  const resetFilters = () => {
    setBrand('all');
    setChannel('all');
    setKind('all');
    setSelectedId(null);
  };

  return (
    <section className="competitor-monitor" aria-label="경쟁사 모니터링">
      <header className="cm-page-header">
        <div>
          <span className="cm-eyebrow">COMPETITIVE INTELLIGENCE</span>
          <h1>경쟁사 모니터링</h1>
          <p>경쟁사의 새로운 소식과 달라진 혜택을 한눈에 확인하세요.</p>
        </div>
        <span className="cm-demo-badge">미리보기 · 예시 데이터</span>
      </header>
      <div className="cm-notice" role="note">
        <span className="material-symbols-outlined" aria-hidden="true">info</span>
        실제 수집 연동 전입니다. 아래 행사, 혜택, 수집 상태는 화면 검토를 위한 가상 데이터입니다.
      </div>
      <div className="cm-stats" aria-label="소식 유형 필터">
        {categories.map(category => (
          <button
            type="button"
            key={category.id}
            className={`cm-stat ${kind === category.id ? 'is-active' : ''}`}
            aria-pressed={kind === category.id}
            onClick={() => { setKind(category.id); setTab('feed'); setSelectedId(null); }}
          >
            <span>{category.label}</span>
            <strong>{matching.filter(event => category.id === 'all' || event.kind === category.id).length}<small>건</small></strong>
            <span className="cm-stat-description">{category.description}</span>
          </button>
        ))}
      </div>
      <div className="cm-tabs" role="tablist" aria-label="모니터링 화면">
        {[
          { id: 'feed', label: '최근 변화' },
          { id: 'sources', label: '수집 현황' }
        ].map(item => (
          <button
            key={item.id}
            id={`cm-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`cm-panel-${item.id}`}
            onClick={() => { setTab(item.id); setSelectedId(null); }}
          >{item.label}</button>
        ))}
      </div>
      <div id="cm-panel-feed" role="tabpanel" aria-labelledby="cm-tab-feed" hidden={tab !== 'feed'}>
        <div className="cm-filters">
          <label>경쟁사
            <select value={brand} onChange={event => { setBrand(event.target.value); setSelectedId(null); }}>
              <option value="all">전체</option>
              {competitors.map(name => <option key={name}>{name}</option>)}
            </select>
          </label>
          <label>채널
            <select value={channel} onChange={event => { setChannel(event.target.value); setSelectedId(null); }}>
              <option value="all">전체</option>
              {['홈페이지', '인스타그램', '페이스북', '유튜브', '블로그', '네이버 브랜드스토어', '핀터레스트'].map(name => <option key={name}>{name}</option>)}
            </select>
          </label>
          <button type="button" className="cm-text-button" onClick={resetFilters}>필터 초기화</button>
          <span className="cm-sample-period">예시 기준일 2026.10.16</span>
        </div>
        <div className="cm-list-heading">
          <h2>최근 변화 <span aria-live="polite">{visible.length}건</span></h2>
          <span>최신 발견순 · 예시</span>
        </div>
        <div className={`cm-feed-layout ${selected ? 'has-detail' : ''}`}>
          <div className="cm-event-list">
            {visible.length === 0 && (
              <div className="cm-empty"><span className="material-symbols-outlined" aria-hidden="true">search_off</span><h3>조건에 맞는 예시 소식이 없습니다.</h3><p>경쟁사 또는 채널 필터를 변경해 주세요.</p><button type="button" className="cm-text-button" onClick={resetFilters}>전체 소식 보기</button></div>
            )}
            {visible.map(event => (
              <article className={`cm-event ${selectedId === event.id ? 'is-selected' : ''}`} key={event.id}>
                <div className="cm-event-top"><strong>{event.brand}</strong><span className={`cm-tag cm-tag-${event.kind}`}>{event.label}</span><span className="cm-time">{event.time}</span></div>
                <h3>{event.title}</h3>
                <p>{event.summary}</p>
                {event.change && <div className="cm-change"><strong>변경 감지</strong> {event.change}</div>}
                <div className="cm-event-bottom"><span>{event.period}</span><span>출처 {event.sources.join(' · ')}</span><button type="button" className="cm-text-button" aria-expanded={selectedId === event.id} aria-controls="cm-event-detail" onClick={() => setSelectedId(selectedId === event.id ? null : event.id)}>상세 보기 <span aria-hidden="true">→</span></button></div>
              </article>
            ))}
          </div>
          {selected && (
            <aside className="cm-detail" id="cm-event-detail" aria-label="선택한 소식 상세" aria-live="polite">
              <div className="cm-detail-top"><span className="cm-demo-badge">예시 소식</span><button type="button" className="cm-close" aria-label="상세 닫기" onClick={() => setSelectedId(null)}><span className="material-symbols-outlined" aria-hidden="true">close</span></button></div>
              <p className="cm-detail-brand">{selected.brand}</p><h2>{selected.title}</h2><p>{selected.summary}</p>
              <dl><dt>행사·게시 기간</dt><dd>{selected.period}</dd><dt>주요 혜택·조건</dt><dd>{selected.benefit}</dd><dt>확인 채널</dt><dd>{selected.sources.join(' · ')}</dd></dl>
              <h3>변경 이력</h3><div className="cm-change">{selected.change || '처음 발견한 소식입니다. 이후 혜택·기간 변경을 비교합니다.'}</div>
              <div className="cm-detail-placeholder"><span className="material-symbols-outlined" aria-hidden="true">image</span><p>실제 연동 후 수집 당시 이미지와 원문 링크를 제공합니다.</p></div>
            </aside>
          )}
        </div>
      </div>
      <div id="cm-panel-sources" role="tabpanel" aria-labelledby="cm-tab-sources" hidden={tab !== 'sources'}>
        <div className="cm-list-heading"><h2>경쟁사별 수집 현황 <span>{competitors.length}개사</span></h2><span>아래 상태는 모두 예시입니다.</span></div>
        <p className="cm-source-help">수집 실패는 ‘새 소식 없음’과 구분하여 표시합니다.</p>
        <div className="cm-source-grid">{demoSources.map(source => (
          <article className="cm-source" key={source.brand}><div className="cm-event-top"><h3>{source.brand}</h3><span className={`cm-tag cm-source-${source.status}`}>{source.status === 'normal' ? '정상 · 예시' : source.status === 'error' ? '확인 필요 · 예시' : '미연동'}</span></div><p>{source.channels}</p><p>{source.message}</p></article>
        ))}</div>
      </div>
    </section>
  );
}
