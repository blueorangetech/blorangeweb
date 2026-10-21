import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { BRANDS, MONTHS, getRows, aggregate, ratio, delta, exportCsv } from './data';
import FilterSelect from './FilterSelect';
import AnalysisPanel from './AnalysisPanel';
import IntegratedReportView from './IntegratedReportView';
import KeywordReportView from './KeywordReportView';
import TrendReportView from './TrendReportView';
import CreativeReportView from './CreativeReportView';
import MonitoringView from './MonitoringView';
import CompetitorMonitoringView from './CompetitorMonitoringView';
import './styles.css';

const number = value => value == null ? '—' : Math.round(value).toLocaleString('ko-KR');
const money = value => value == null ? '—' : `₩${number(value)}`;
const percent = value => value == null ? '—' : `${(value * 100).toFixed(1)}%`;
const compact = value => value >= 10000 ? `${(value / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만` : number(value);
const monthLabel = month => `${month.slice(0, 4)}년 ${Number(month.slice(5))}월`;

const REPORT_MENUS = [
  { id: 'integrated', name: '통합 성과', icon: 'hub', desc: '전체 매체 및 채널 통합 성과 리포트' },
  { id: 'keyword', name: '키워드 분석', icon: 'search', desc: '검색광고 및 주요 키워드별 성과 분석' },
  { id: 'creative', name: '광고 소재 분석', icon: 'palette', desc: '디스플레이/영상 소재별 반응 및 효율 분석' },
  { id: 'trend', name: '트래픽 트렌드', icon: 'trending_up', desc: '코리안클릭 트래픽과 광고 매체 클릭 간의 기여도 및 상관관계 분석' },
  { id: 'chat', name: 'AI 데이터 챗', icon: 'smart_toy', desc: 'AI 기반 데이터 질의응답 및 인사이트 챗' },
];

const MONITORING_MENUS = [
  { id: 'recruitment-monitoring', name: '채용공고 모니터링', icon: 'work' },
  { id: 'competitor-monitoring', name: '경쟁사 모니터링', icon: 'travel_explore' },
];

function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    trend: <><path d="M3 17l6-6 4 4 8-10M15 5h6v6" /></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    download: <><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v5m10-5v5M3 11h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    filter: <><path d="M4 7h16M7 12h10m-7 5h4" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3 8V6a3 3 0 0 1 3-3h11M21 11h-5v5h5" /><circle cx="17.5" cy="13.5" r=".6" /></>,
    gauge: <><path d="M4.2 18a9 9 0 1 1 15.6 0M12 4v2M5.6 7.6 7 9m11.4-1.4L17 9M3 13h2m14 0h2m-9 0 4-4" /><circle cx="12" cy="13" r="1.5" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    cursor: <><path d="m8 5 1 15 4-5 6-1Z" /><path d="M5 2v2M2 6h2m13-3-2 2M3 13l2-2m9 5 3 5" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.grid}</svg>;
}

function BrandMark({ brand, small = false }) {
  const extension = brand.id === 'jumpit' ? 'ico' : brand.id === 'fostiny' ? 'svg' : 'png';
  const icon = `/brands/saramin/${brand.id}-icon.${extension}`;
  return <span className={`bd-mark ${small ? 'small' : ''}`} style={{ '--brand': brand.color }} aria-hidden="true"><img className="bd-brand-icon" src={icon} alt="" /></span>;
}

function Kpi({ label, value, change, inverse = false, note, icon }) {
  const positive = change != null && (inverse ? change <= 0 : change >= 0);
  return <section className="bd-kpi"><div className="bd-kpi-label">{label}<Icon name={icon || 'trend'} size={17} /></div><strong>{value}</strong><div className="bd-kpi-foot">{change != null ? <><span className={positive ? 'bd-positive' : 'bd-negative'}>{change >= 0 ? '↗' : '↘'} {percent(Math.abs(change))}</span><span>전월 대비</span></> : <span>{note || '선택 기간 기준'}</span>}</div></section>;
}

function Panel({ title, subtitle, children, extra, className = '' }) {
  return <section className={`bd-panel ${className}`}><div className="bd-panel-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{extra}</div>{children}</section>;
}

export default function BrandDashboard() {
  const { brandId } = useParams();
  const [search, setSearch] = useSearchParams();
  const month = MONTHS.includes(search.get('month')) ? search.get('month') : '2026-06';
  const type = ['SA', 'DA', 'CPI'].includes(search.get('type')) ? search.get('type') : 'all';
  const selected = BRANDS.some(b => b.id === search.get('brand')) ? search.get('brand') : 'all';
  const brand = BRANDS.find(b => b.id === brandId);
  const [sort, setSort] = useState('spend');
  const [selectedMetric, setTrendMetric] = useState('spend');
  const trendMetric = !brand && selectedMetric === 'conversions' ? 'spend' : selectedMetric;
  const [dailyEvent, setDailyEvent] = useState('');
  const [dailyOrder, setDailyOrder] = useState('asc');
  const [notice, setNotice] = useState('');
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const view = search.get('view');
  const currentReportMenu = REPORT_MENUS.find(m => m.id === view);
  const currentMonitoringMenu = MONITORING_MENUS.find(m => m.id === view);
  const [isMonitoringMenuOpen, setIsMonitoringMenuOpen] = useState(() => {
    try {
      return localStorage.getItem('saramin_monitoring_menu_open') !== 'false';
    } catch {
      return true;
    }
  });
  const toggleMonitoringMenu = () => {
    setIsMonitoringMenuOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('saramin_monitoring_menu_open', String(next));
      } catch {
        // Keep navigation usable when storage is unavailable.
      }
      return next;
    });
  };
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('saramin_report_menu_open');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const toggleReportMenu = () => {
    setIsReportMenuOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('saramin_report_menu_open', String(next));
      } catch {
        // Keep control usable when browser storage is unavailable.
      }
      return next;
    });
  };
  const overviewQuery = useMemo(() => {
    const p = new URLSearchParams(search);
    p.delete('view');
    const s = p.toString();
    return s ? `?${s}` : '';
  }, [search]);
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('saramin_brand_menu_open');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const toggleBrandMenu = () => {
    setIsBrandMenuOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('saramin_brand_menu_open', String(next));
      } catch {
        // Keep control usable when browser storage is unavailable.
      }
      return next;
    });
  };
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem('sidebar_collapsed', String(next));
    } catch {
      // Keep the control usable when browser storage is unavailable.
    }
  };
  const query = `?${search.toString()}`;
  const setFilter = (key, value) => {
    const next = new URLSearchParams(search);
    if (value === 'all') next.delete(key); else next.set(key, value);
    setSearch(next);
  };
  const filterRows = rows => rows.filter(row => (type === 'all' || row.type === type) && (brandId ? row.brandId === brandId : selected === 'all' || row.brandId === selected));
  const rows = filterRows(getRows(month));
  const previousMonth = MONTHS[MONTHS.indexOf(month) - 1];
  const previousRows = previousMonth ? filterRows(getRows(previousMonth)) : [];
  const total = aggregate(rows);
  const previous = aggregate(previousRows);
  const visibleBrands = BRANDS.filter(b => !brandId && (selected === 'all' || b.id === selected));
  const summaries = visibleBrands.map(b => {
    const result = aggregate(rows.filter(row => row.brandId === b.id));
    return { ...b, ...result, conversions: result.events[b.primary] || 0 };
  }).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name, 'ko') : b[sort] - a[sort]);
  const trend = [...new Set(rows.map(row => row.date))].map(date => {
    const daily = aggregate(rows.filter(row => row.date === date));
    return { ...daily, date: `${Number(date.slice(5, 7))}.${Number(date.slice(8))}`, conversions: brand ? daily.events[brand.primary] || 0 : 0 };
  });
  const media = [...new Set(rows.map(row => row.channel))].map(channel => ({ name: channel, ...aggregate(rows.filter(row => row.channel === channel)) }));
  const events = brand ? brand.events.map(event => ({ name: event, value: total.events[event] || 0, cpa: ratio(total.spend, total.events[event]), change: delta(total.events[event], previous.events[event]) })) : [];
  const allocation = useMemo(() => BRANDS.map(b => ({ name: b.name, color: b.color, ...aggregate(getRows(month).filter(row => row.brandId === b.id && (selected === 'all' || row.brandId === selected) && (type === 'all' || row.type === type))) })).filter(b => b.budget > 0), [month, selected, type]);
  const selectedEvent = brand?.events.includes(dailyEvent) ? dailyEvent : brand?.primary;
  const daily = [...new Set(rows.map(row => row.date))].sort().map(date => ({ date, ...aggregate(rows.filter(row => row.date === date)) }));
  if (dailyOrder === 'desc') daily.reverse();
  const download = () => {
    const url = URL.createObjectURL(new Blob([exportCsv(rows)], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = `brand-performance-${brandId || selected}-${month}-${type}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('선택한 조건의 리포트를 다운로드했습니다.');
  };
  const compare = key => previousRows.length ? delta(total[key], previous[key]) : null;
  const attention = summaries.filter(b => b.pacing > 1 || b.pacing < .9);

  return <div className={`bd-app${isCollapsed ? ' bd-collapsed' : ''}${analysisOpen ? ' bd-analysis-open' : ''}`}>
    <aside className="bd-sidebar" aria-label="대시보드 메뉴">
      <Link className="bd-logo" title="saramin" to={`/saramin${overviewQuery}`}><span className="bd-logo-full">saramin</span><span className="bd-logo-mini" aria-hidden="true">S</span><small>브랜드 인사이트</small></Link>

      <div className={`bd-category ${isReportMenuOpen ? 'open' : ''}`}>
        <button
          type="button"
          className="bd-category-header"
          onClick={toggleReportMenu}
          aria-expanded={isReportMenuOpen}
          aria-controls="bd-report-navigation"
          title="리포트"
        >
          <span className="bd-category-title">
            <span className="material-symbols-outlined bd-category-icon" aria-hidden="true">assessment</span>
            <span className="bd-nav-text">리포트</span>
          </span>
          <span className="material-symbols-outlined bd-category-arrow" aria-hidden="true">
            expand_more
          </span>
        </button>
        <nav
          id="bd-report-navigation"
          className={`bd-brand-nav-list ${isReportMenuOpen ? 'open' : 'closed'}`}
          aria-label="리포트 메뉴"
        >
          {REPORT_MENUS.map(m => (
            <Link
              key={m.id}
              className={`bd-nav ${view === m.id ? 'active' : ''}`}
              aria-current={view === m.id ? 'page' : undefined}
              title={m.name}
              to={`/saramin?view=${m.id}${month ? `&month=${month}` : ''}`}
            >
              <span className="material-symbols-outlined bd-menu-icon" aria-hidden="true">{m.icon}</span>
              <span className="bd-nav-text">{m.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className={`bd-category ${isMonitoringMenuOpen ? 'open' : ''}`}>
        <button type="button" className="bd-category-header" onClick={toggleMonitoringMenu} aria-expanded={isMonitoringMenuOpen} aria-controls="bd-monitoring-navigation" title="모니터링">
          <span className="bd-category-title"><span className="material-symbols-outlined bd-category-icon" aria-hidden="true">monitoring</span><span className="bd-nav-text">모니터링</span></span>
          <span className="material-symbols-outlined bd-category-arrow" aria-hidden="true">expand_more</span>
        </button>
        <nav id="bd-monitoring-navigation" className={`bd-brand-nav-list ${isMonitoringMenuOpen ? 'open' : 'closed'}`} aria-label="모니터링 메뉴">
          {MONITORING_MENUS.map(menu => <Link key={menu.id} className={`bd-nav ${view === menu.id ? 'active' : ''}`} aria-current={view === menu.id ? 'page' : undefined} title={menu.name} to={`/saramin?view=${menu.id}`}><span className="material-symbols-outlined bd-menu-icon" aria-hidden="true">{menu.icon}</span><span className="bd-nav-text">{menu.name}</span></Link>)}
        </nav>
      </div>

      <div className={`bd-category ${isBrandMenuOpen ? 'open' : ''}`}>
        <button
          type="button"
          className="bd-category-header"
          onClick={toggleBrandMenu}
          aria-expanded={isBrandMenuOpen}
          aria-controls="bd-brand-navigation"
          title="브랜드별 성과"
        >
          <span className="bd-category-title">
            <span className="material-symbols-outlined bd-category-icon" aria-hidden="true">domain</span>
            <span className="bd-nav-text">브랜드별 성과</span>
          </span>
          <span className="material-symbols-outlined bd-category-arrow" aria-hidden="true">
            expand_more
          </span>
        </button>
        <nav
          id="bd-brand-navigation"
          className={`bd-brand-nav-list ${isBrandMenuOpen ? 'open' : 'closed'}`}
          aria-label="브랜드별 성과 메뉴"
        >
          <Link className={`bd-nav ${!brandId && !view ? 'active' : ''}`} aria-current={!brandId && !view ? 'page' : undefined} title="통합 오버뷰" to={`/saramin${overviewQuery}`}><span className="material-symbols-outlined bd-menu-icon" aria-hidden="true">monitoring</span><span className="bd-nav-text">통합 오버뷰</span></Link>
          {BRANDS.map(b => <Link key={b.id} className={`bd-nav ${brandId === b.id && !view ? 'active' : ''}`} aria-current={brandId === b.id && !view ? 'page' : undefined} title={b.name} aria-label={b.name} to={`/saramin/${b.id}${overviewQuery}`}><BrandMark brand={b} small /><span className="bd-nav-text">{b.name}</span></Link>)}
        </nav>
      </div>
      <div className="bd-side-bottom"><button className="bd-collapse" onClick={toggleSidebar} aria-expanded={!isCollapsed} aria-controls="bd-brand-navigation" aria-label={isCollapsed ? '메뉴 펼치기' : '메뉴 접기'} title={isCollapsed ? '메뉴 펼치기' : '메뉴 접기'}><span className="material-symbols-outlined" aria-hidden="true">{isCollapsed ? 'menu' : 'menu_open'}</span></button></div>
    </aside>

    <main className="bd-main">
      <header className="bd-topbar"><div>Workspace <span>/</span> saramin{currentMonitoringMenu ? <> <span>/</span> 모니터링 <span>/</span> {currentMonitoringMenu.name}</> : currentReportMenu ? <> <span>/</span> 리포트 <span>/</span> {currentReportMenu.name}</> : brand ? <> <span>/</span> {brand.name}</> : ''}</div><span className="bd-top-tag">{currentMonitoringMenu ? 'MONITORING' : currentReportMenu ? 'REPORTING & INSIGHTS' : 'PERFORMANCE ANALYTICS'}</span></header>
      {currentMonitoringMenu ? (
        <div className="bd-content">{view === 'competitor-monitoring' ? <CompetitorMonitoringView /> : <MonitoringView />}</div>
      ) : currentReportMenu ? (
        <div className="bd-content bd-report-content">
          {currentReportMenu.id === 'integrated' ? (
            <IntegratedReportView month={month} />
          ) : currentReportMenu.id === 'keyword' ? (
            <KeywordReportView />
          ) : currentReportMenu.id === 'trend' ? (
            <TrendReportView />
          ) : currentReportMenu.id === 'creative' ? (
            <CreativeReportView />
          ) : (
            <>
          <div className="bd-report-hero">
            <div className="bd-report-hero-head">
              <span className="material-symbols-outlined bd-report-hero-icon">{currentReportMenu.icon}</span>
              <div>
                <div className="bd-report-hero-badges">
                  <span className="bd-report-badge">리포트</span>
                  <span className="bd-report-badge preparing">기능 준비 중</span>
                </div>
                <h1>{currentReportMenu.name} 리포트</h1>
                <p>{currentReportMenu.desc}</p>
              </div>
            </div>
            <div className="bd-report-hero-actions">
              <Link to={`/saramin${overviewQuery}`} className="bd-back-btn">
                <span className="material-symbols-outlined">arrow_back</span>
                통합 오버뷰로 이동
              </Link>
            </div>
          </div>

          {currentReportMenu.id === 'chat' ? (
            <div className="bd-chat-preview-card">
              <div className="bd-chat-preview-header">
                <div className="bd-chat-preview-title">
                  <span className="material-symbols-outlined">smart_toy</span>
                  <div>
                    <strong>사라민 데이터 챗 (AI Data Assistant)</strong>
                    <small>자연어로 질문하고 광고 성과 데이터 인사이트를 즉시 확인하세요</small>
                  </div>
                </div>
                <span className="bd-chat-status-pill">연동 준비 중</span>
              </div>
              <div className="bd-chat-preview-body">
                <div className="bd-chat-suggested-title">💡 추천 질문 예시</div>
                <div className="bd-chat-suggestions">
                  <span className="bd-chat-chip">“이번 달 집행액 1위 브랜드와 예산 소진율은?”</span>
                  <span className="bd-chat-chip">“전월 대비 CPC가 가장 많이 개선된 매체는 어디인가요?”</span>
                  <span className="bd-chat-chip">“SA와 DA의 대표 전환 CPA 효율을 비교해줘”</span>
                </div>
                <div className="bd-chat-input-mock">
                  <input type="text" placeholder="데이터에 대해 궁금한 점을 입력하세요 (예: 6월 점핏 성과 요약해줘)" readOnly />
                  <button type="button" disabled>전송</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bd-report-preview-grid">
              <div className="bd-report-info-card">
                <div className="bd-card-icon">
                  <span className="material-symbols-outlined">insights</span>
                </div>
                <h3>주요 제공 지표 및 분석 기능</h3>
                <ul>
                  <li>{currentReportMenu.name} 기준 일별/월별 추이 및 전월 대비 성과 비교</li>
                  <li>매체별/캠페인별 집행 효율 및 KPI 달성률 모니터링</li>
                  <li>맞춤 필터(기간, 광고 유형, 브랜드) 적용 및 엑셀 리포트 추출</li>
                </ul>
              </div>
              <div className="bd-report-info-card">
                <div className="bd-card-icon">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <h3>데이터 파이프라인 연동 예정</h3>
                <p>
                  현재 데이터 파이프라인과 대시보드 시각화 뷰를 구축 중입니다.
                  연동 완료 시 실시간 지표가 자동으로 업데이트됩니다.
                </p>
              </div>
            </div>
          )}
            </>
          )}
          <footer className="bd-footer"><span>saramin <b>Brand Insights</b></span><span>{monthLabel(month)} · {currentReportMenu.name} 리포트</span></footer>
        </div>
      ) : brandId && !brand ? <div className="bd-content"><h1>브랜드를 찾을 수 없습니다.</h1><Link to={`/saramin${overviewQuery}`}>통합 오버뷰로 이동</Link></div> : <div className="bd-content">
        <h1 className="bd-sr-only">{brand ? `${brand.name} 상세 성과` : 'saramin'}</h1>
        <div className="bd-toolbar">
          <div className="bd-toolbar-controls">
            <div className="bd-period">
              <Icon name="calendar" size={18} />
              <FilterSelect label="조회 월" value={month} onChange={value => setFilter('month', value)} options={[...MONTHS].reverse().map(m => ({ id: m, name: monthLabel(m) }))} />
              <span className="bd-full-month">월 전체</span>
            </div>
            {!brand && <FilterSelect label="브랜드 필터" value={selected} onChange={value => setFilter('brand', value)} options={[{ id: 'all', name: '전체 브랜드' }, ...BRANDS]} />}
            <div className="bd-segment" aria-label="광고 유형">
              {[['all', '전체'], ['SA', 'SA'], ['DA', 'DA'], ['CPI', 'CPI']].map(([value, label]) => <button key={value} aria-pressed={type === value} className={type === value ? 'active' : ''} onClick={() => setFilter('type', value)}>{label}</button>)}
            </div>
          </div>
          <div className="bd-toolbar-actions"><button className="bd-export bd-analysis-trigger" onClick={() => setAnalysisOpen(true)}><Icon name="trend" size={17} />AI 성과분석</button><button className="bd-export" onClick={download} disabled={!rows.length}><Icon name="download" size={17} />리포트 다운로드</button></div>
        </div>
        <div className="bd-kpis"><Kpi label="총 집행액" value={money(total.spend)} change={compare('spend')} icon="wallet" /><Kpi label="예산 소진율" value={percent(total.pacing)} note={`계획예산 ${money(total.budget)}`} icon="gauge" /><Kpi label="총 노출 수" value={number(total.impressions)} change={compare('impressions')} icon="eye" /><Kpi label="총 클릭 수" value={number(total.clicks)} change={compare('clicks')} icon="cursor" /></div>
        {!rows.length ? <div className="bd-empty"><Icon name="filter" size={32} /><h2>선택한 조건의 운영 내역이 없습니다.</h2><p>광고 유형을 전체로 변경해 확인하세요.</p><button onClick={() => setFilter('type', 'all')}>전체 유형 보기</button></div> : <>
          <div className="bd-chart-grid"><Panel title="성과 추이" subtitle={`${monthLabel(month)} · 일별 ${trendMetric === 'spend' ? '집행액' : trendMetric === 'clicks' ? '클릭 수' : '대표 전환 수'}`} extra={<FilterSelect compact label="추이 지표" value={trendMetric} onChange={setTrendMetric} options={[{ id: 'spend', name: '집행액' }, { id: 'clicks', name: '클릭 수' }, ...(brand ? [{ id: 'conversions', name: brand.primary }] : [])]} />}><div className="bd-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 15, right: 12, left: 0, bottom: 0 }}><defs><linearGradient id="bd-area-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5075ed" stopOpacity={.24} /><stop offset="100%" stopColor="#5075ed" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#edf0f5" vertical={false} strokeDasharray="3 4" /><XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={44} tick={{ fill: '#8d97ab', fontSize: 12 }} dy={8} /><YAxis tickFormatter={compact} tickLine={false} axisLine={false} tick={{ fill: '#8d97ab', fontSize: 12 }} width={65} /><Tooltip formatter={v => trendMetric === 'spend' ? money(v) : number(v)} labelFormatter={v => `${v} 성과`} contentStyle={{ borderRadius: 12, border: '1px solid #e7ebf3', fontSize: 12 }} /><Area type="monotone" dataKey={trendMetric} name={trendMetric === 'spend' ? '집행액' : trendMetric === 'clicks' ? '클릭' : brand?.primary} stroke="#5075ed" fill="url(#bd-area-fill)" strokeWidth={2.5} /></AreaChart></ResponsiveContainer></div><div className="bd-chart-bottom"><span><i />선택 기간</span><span>평균 CTR <strong>{percent(total.ctr)}</strong><em />평균 CPC <strong>{money(total.cpc)}</strong></span></div></Panel>
          <Panel title={brand ? '매체별 집행 비중' : '브랜드별 예산 현황'} subtitle={brand ? '매체별 집행액과 운영 비중' : '계획예산 대비 집행액 비교'} extra={<span className="bd-unit">단위: 원</span>}>{brand ? <div className="bd-media-shares"><div className="bd-stack">{media.map((m, i) => <span key={m.name} style={{ width: percent(ratio(m.spend, total.spend)), background: ['#5274e9', '#8d9feb', '#bdcaf8'][i] }} />)}</div>{media.map((m, i) => <div className="bd-share" key={m.name}><span><i style={{ background: ['#5274e9', '#8d9feb', '#bdcaf8'][i] }} />{m.name}</span><strong>{money(m.spend)}</strong><small>{percent(ratio(m.spend, total.spend))}</small></div>)}</div> : <div className="bd-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={allocation} layout="vertical" margin={{ top: 9, right: 12, left: 0, bottom: 0 }} barGap={-8}><CartesianGrid stroke="#edf0f5" horizontal={false} /><XAxis type="number" tickFormatter={compact} axisLine={false} tickLine={false} tick={{ fill: '#8d97ab', fontSize: 12 }} /><YAxis dataKey="name" type="category" width={89} axisLine={false} tickLine={false} tick={{ fill: '#657086', fontSize: 12 }} /><Tooltip formatter={money} itemStyle={{ color: '#334155' }} labelStyle={{ color: '#0f172a', fontWeight: 700 }} contentStyle={{ borderRadius: 12, border: '1px solid #e7ebf3', fontSize: 12 }} /><Bar dataKey="budget" name="계획예산" barSize={8} radius={[0, 4, 4, 0]}>{allocation.map(b => <Cell key={b.name} fill={b.color} fillOpacity={0.25} />)}</Bar><Bar dataKey="spend" name="집행액" barSize={8} radius={[0, 3, 3, 0]}>{allocation.map(b => <Cell key={b.name} fill={b.color} />)}</Bar></BarChart></ResponsiveContainer></div>}<div className="bd-chart-bottom"><span><i className="bd-muted-dot" />{brand ? '선택 조건 기준' : '계획예산'}{!brand && <><i />집행액</>}</span><span>{brand ? `${media.length}개 매체 운영` : `${allocation.length}개 브랜드`}</span></div></Panel></div>

          {brand ? <>
            <Panel className="bd-conversion-panel" title="전환 지표" subtitle="이벤트 간 중복 사용자가 포함될 수 있습니다." extra={<span className="bd-pill">대표 KPI · {brand.primary}</span>}>
              <div className="bd-event-summary">{events.map(event => <div key={event.name} className={event.name === brand.primary ? 'primary' : ''}>
                <div className="bd-event-heading"><span>{event.name}</span><strong>{number(event.value)}<small>건</small></strong></div>
                <div className="bd-event-meta"><span>CPA <b>{money(event.cpa)}</b></span>{previousRows.length > 0 && <span className={event.change >= 0 ? 'bd-positive' : 'bd-negative'}>전월 대비 {event.change == null ? '—' : `${event.change >= 0 ? '+' : ''}${percent(event.change)}`}</span>}</div>
              </div>)}</div>
            </Panel>
            <Panel title="매체별 상세 성과" subtitle={`전환 및 CPA 기준: ${brand.primary}`}><div className="bd-table-scroll"><table className="bd-table"><thead><tr>{['매체', '계획예산', '집행액', '노출', '클릭', 'CTR', brand.primary, 'CPA'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{media.map(m => <tr key={m.name}><td className="bd-bold">{m.name}</td><td>{money(m.budget)}</td><td>{money(m.spend)}</td><td>{number(m.impressions)}</td><td>{number(m.clicks)}</td><td>{percent(m.ctr)}</td><td className="bd-blue">{number(m.events[brand.primary])}</td><td>{money(ratio(m.spend, m.events[brand.primary]))}</td></tr>)}</tbody><tfoot><tr><td>합계</td><td>{money(total.budget)}</td><td>{money(total.spend)}</td><td>{number(total.impressions)}</td><td>{number(total.clicks)}</td><td>{percent(total.ctr)}</td><td>{number(total.events[brand.primary])}</td><td>{money(ratio(total.spend, total.events[brand.primary]))}</td></tr></tfoot></table></div></Panel>
            <Panel className="bd-daily-panel" title="일자별 상세 성과" subtitle={`${monthLabel(month)} · 선택한 광고 유형의 일별 합계`} extra={<div className="bd-daily-filters">
              <FilterSelect compact label="일별 전환 지표" value={selectedEvent} onChange={setDailyEvent} options={brand.events.map(event => ({ id: event, name: event }))} />
              <FilterSelect compact label="일자 정렬" value={dailyOrder} onChange={setDailyOrder} options={[{ id: 'asc', name: '오래된 날짜순' }, { id: 'desc', name: '최신 날짜순' }]} />
            </div>}>
              <div className="bd-table-scroll bd-daily-scroll"><table className="bd-table"><thead><tr>{['일자', '집행액', '노출', '클릭', 'CTR', 'CPC', selectedEvent, 'CPA'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>{daily.map(day => <tr key={day.date}><td>{day.date.replaceAll('-', '.')}</td><td>{money(day.spend)}</td><td>{number(day.impressions)}</td><td>{number(day.clicks)}</td><td>{percent(day.ctr)}</td><td>{money(day.cpc)}</td><td className="bd-blue">{number(day.events[selectedEvent] || 0)}<small className="bd-count-unit">건</small></td><td>{money(ratio(day.spend, day.events[selectedEvent]))}</td></tr>)}</tbody>
                <tfoot><tr><td>월 합계</td><td>{money(total.spend)}</td><td>{number(total.impressions)}</td><td>{number(total.clicks)}</td><td>{percent(total.ctr)}</td><td>{money(total.cpc)}</td><td>{number(total.events[selectedEvent] || 0)}<small className="bd-count-unit">건</small></td><td>{money(ratio(total.spend, total.events[selectedEvent]))}</td></tr></tfoot>
              </table></div><div className="bd-table-foot"><span>총 {daily.length}일</span><span>CTR·CPC·CPA는 선택한 기간의 합계로 계산합니다.</span></div>
            </Panel>
          </> : <>
            <Panel title="브랜드별 성과" subtitle="브랜드 고유의 KPI를 기준으로 성과를 확인하세요." extra={<FilterSelect compact label="브랜드 정렬" value={sort} onChange={setSort} options={[{ id: 'spend', name: '집행액 높은 순' }, { id: 'clicks', name: '클릭 높은 순' }, { id: 'name', name: '브랜드명 순' }]} />}><div className="bd-table-scroll"><table className="bd-table"><thead><tr>{['브랜드', '집행액 / 계획예산', '소진율', '노출 / 클릭', 'CTR', '대표 전환', '전환 수', 'CPA', ''].map((h, i) => <th key={i}>{h}</th>)}</tr></thead><tbody>{summaries.map(b => <tr key={b.id}><td><Link className="bd-brand-cell" to={`/saramin/${b.id}${query}`}><BrandMark brand={b} /><div><strong>{b.name}</strong><small>{b.channels.filter(([, t]) => type === 'all' || t === type).map(([c]) => c).join(' · ') || '운영 없음'}</small></div></Link></td><td><strong>{money(b.spend)}</strong><small>예산 {money(b.budget)}</small></td><td><span className={b.pacing > 1 ? 'bd-negative' : ''}>{percent(b.pacing)}</span><div className="bd-progress"><i style={{ width: `${Math.min(100, (b.pacing || 0) * 100)}%`, background: b.color }} /></div></td><td>{number(b.impressions)}<small>클릭 {number(b.clicks)}</small></td><td>{percent(b.ctr)}</td><td><span className="bd-event-tag">{b.primary}</span></td><td className="bd-blue bd-bold">{number(b.conversions)}<small className="bd-count-unit">건</small></td><td>{money(ratio(b.spend, b.conversions))}</td><td><Link className="bd-detail-link" aria-label={`${b.name} 상세 보기`} to={`/saramin/${b.id}${query}`}><Icon name="arrow" size={17} /></Link></td></tr>)}</tbody></table></div><div className="bd-table-foot"><span>총 {summaries.length}개 브랜드</span><span>대표 전환은 브랜드별로 정의되며, 브랜드 간 합산하지 않습니다.</span></div></Panel>
            <div className="bd-insights"><div className="bd-insight-icon"><Icon name="check" /></div><div><strong>운영 모니터링</strong><p>{attention.length ? `${attention.map(b => b.name).join(', ')}의 예산 소진율을 확인하세요. 선택 기간의 계획예산 대비 집행률이 90% 미만 또는 100% 초과입니다.` : '선택한 브랜드의 예산 소진율이 90~100% 범위에 있습니다.'}</p></div><span className="bd-rule">월간 예산 기준</span></div>
          </>}
        </>}
        {notice && <div role="status" className="bd-notice">{notice}<button aria-label="알림 닫기" onClick={() => setNotice('')}>×</button></div>}
        <footer className="bd-footer"><span>saramin <b>Brand Insights</b></span><span>{monthLabel(month)} · 브랜드 통합 퍼포먼스 리포트</span></footer>
      </div>}
    </main>
    {analysisOpen && <AnalysisPanel key={`${brandId || selected}-${month}-${type}`} label={`${brand?.name || BRANDS.find(b => b.id === selected)?.name || '전체 브랜드'} · ${monthLabel(month)} · ${type === 'all' ? '전체 광고 유형' : type}`} storageKey={`saramin-history:${brandId || selected}:${month}:${type}`} rows={rows} previousRows={previousRows} onClose={() => setAnalysisOpen(false)} />}
  </div>;
}
