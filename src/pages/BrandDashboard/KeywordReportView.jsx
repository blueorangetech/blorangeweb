import { useState, useMemo } from 'react';
import {
  KEYWORD_CATEGORIES,
  KEYWORD_LIST
} from './reportData';

const number = value => (value == null ? '—' : Math.round(value).toLocaleString('ko-KR'));
const money = value => (value == null ? '—' : `₩${number(value)}`);
const percent = value => (value == null ? '—' : `${(value * 100).toFixed(1)}%`);
const compact = value => (value >= 10000 ? `${(value / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만` : number(value));

function MediaLogo({ media, size = 18 }) {
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

export default function KeywordReportView() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [mediaFilter, setMediaFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('conversions');

  const filteredKeywords = useMemo(() => {
    return KEYWORD_LIST.filter(item => {
      if (selectedCategory !== '전체' && item.category !== selectedCategory) return false;
      if (mediaFilter !== 'all' && item.media !== mediaFilter) return false;
      if (searchQuery.trim() && !item.keyword.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      const convA = a.signUp + a.apply;
      const convB = b.signUp + b.apply;
      if (sortBy === 'conversions') return convB - convA;
      if (sortBy === 'spend') return b.spend - a.spend;
      if (sortBy === 'cpa') return a.cpa - b.cpa;
      if (sortBy === 'clicks') return b.clicks - a.clicks;
      return 0;
    });
  }, [selectedCategory, mediaFilter, searchQuery, sortBy]);

  const summary = useMemo(() => {
    const totalCount = filteredKeywords.length;
    const totalSpend = filteredKeywords.reduce((s, k) => s + k.spend, 0);
    const totalClicks = filteredKeywords.reduce((s, k) => s + k.clicks, 0);
    const totalSignUps = filteredKeywords.reduce((s, k) => s + k.signUp, 0);
    const totalApplies = filteredKeywords.reduce((s, k) => s + k.apply, 0);
    const totalConv = totalSignUps + totalApplies;
    const avgCpc = totalClicks ? totalSpend / totalClicks : 0;
    const avgCpa = totalConv ? totalSpend / totalConv : 0;
    return {
      totalCount,
      totalSpend,
      totalClicks,
      totalSignUps,
      totalApplies,
      totalConv,
      avgCpc,
      avgCpa,
    };
  }, [filteredKeywords]);

  const topKeywords = useMemo(() => {
    return [...KEYWORD_LIST]
      .sort((a, b) => (b.signUp + b.apply) - (a.signUp + a.apply))
      .slice(0, 3);
  }, []);

  return (
    <div className="bd-report-view">
      {/* 툴바: 브랜드별 성과 탭 bd-toolbar 규격 통일 */}
      <div className="bd-toolbar">
        <div className="bd-toolbar-controls">
          <div className="bd-period">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#74829a' }}>search</span>
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#43516a' }}>키워드 리포트</span>
            <span className="bd-full-month">사람인 채용 키워드 셋</span>
          </div>

          <div className="bd-segment" aria-label="매체 필터">
            {[['all', '전체 매체'], ['Naver', 'Naver'], ['Google', 'Google']].map(([k, l]) => (
              <button
                key={k}
                className={mediaFilter === k ? 'active' : ''}
                onClick={() => setMediaFilter(k)}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="bd-segment" aria-label="정렬 기준">
            {[
              ['conversions', '전환순'],
              ['spend', '광고비순'],
              ['cpa', '낮은 CPA순'],
              ['clicks', '클릭순'],
            ].map(([k, l]) => (
              <button
                key={k}
                className={sortBy === k ? 'active' : ''}
                onClick={() => setSortBy(k)}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="bd-keyword-search-box">
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#8d97ab' }}>search</span>
            <input
              type="text"
              placeholder="키워드 검색 (예: SK하이닉스)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>
        </div>
      </div>

      {/* 카테고리 필터 탭 */}
      <div className="bd-keyword-category-tabs">
        {KEYWORD_CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            className={`bd-cat-tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* KPI 카드 그리드: 브랜드별 성과 탭 bd-kpis 규격 통일 */}
      <div className="bd-kpis">
        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>조회 키워드 수</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>key</span>
          </div>
          <strong>{summary.totalCount}<small style={{ fontSize: '12px', fontWeight: 400, marginLeft: '3px' }}>개</small></strong>
          <div className="bd-kpi-foot">
            <span>전체 {KEYWORD_LIST.length}개 키워드 중 필터링</span>
          </div>
        </section>

        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>키워드 광고비</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>account_balance_wallet</span>
          </div>
          <strong>{money(summary.totalSpend)}</strong>
          <div className="bd-kpi-foot">
            <span>평균 CPC <strong>{money(summary.avgCpc)}</strong></span>
          </div>
        </section>

        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>총 전환 (가입+지원)</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>how_to_reg</span>
          </div>
          <strong>{number(summary.totalConv)}<small style={{ fontSize: '12px', fontWeight: 400, marginLeft: '3px' }}>건</small></strong>
          <div className="bd-kpi-foot">
            <span>가입 {number(summary.totalSignUps)} · 지원 {number(summary.totalApplies)}</span>
          </div>
        </section>

        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>평균 전환 CPA</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>target</span>
          </div>
          <strong>{money(summary.avgCpa)}</strong>
          <div className="bd-kpi-foot">
            <span className="bd-positive">고효율 방어군</span>
            <span>선택 조건 기준</span>
          </div>
        </section>
      </div>

      {/* 성과 리드 TOP 3 카드: 매체 로고 및 깔끔한 규격 */}
      <div className="bd-keyword-highlight-grid">
        {topKeywords.map((top, idx) => (
          <div key={top.id} className="bd-highlight-card">
            <div className="bd-highlight-head">
              <span className="bd-highlight-icon">
                <MediaLogo media={top.media} size={20} />
              </span>
              <div>
                <span className="bd-highlight-badge">성과 리드 TOP {idx + 1}</span>
                <h4>{top.keyword}</h4>
              </div>
            </div>
            <div className="bd-highlight-meta">
              <span className="bd-tag-cat">{top.category}</span>
              <span className="bd-tag-media">{top.media} · {top.device}</span>
            </div>
            <div className="bd-highlight-stats">
              <div>
                <span>총 전환</span>
                <strong>{top.signUp + top.apply}건</strong>
              </div>
              <div>
                <span>CPA</span>
                <strong>{money(top.cpa)}</strong>
              </div>
              <div>
                <span>CTR</span>
                <strong>{percent(top.ctr)}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 키워드 상세 성과 테이블: 매체 열에 정사각형 공식 로고 배치 */}
      <section className="bd-panel">
        <div className="bd-panel-head">
          <div>
            <h2>키워드별 상세 운영 성과</h2>
            <p>검색량, 유입 단가, 회원가입 및 입사지원 효율 분석</p>
          </div>
          <span className="bd-pill">총 {filteredKeywords.length}개 키워드</span>
        </div>
        <div className="bd-table-scroll">
          <table className="bd-table">
            <thead>
              <tr>
                <th>순번</th>
                <th>키워드명</th>
                <th>카테고리</th>
                <th>매체</th>
                <th>기기</th>
                <th>노출수</th>
                <th>클릭수</th>
                <th>CTR</th>
                <th>CPC</th>
                <th>광고비</th>
                <th>회원가입</th>
                <th>입사지원</th>
                <th>총 전환</th>
                <th>전환 CPA</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeywords.map((k, idx) => (
                <tr key={k.id}>
                  <td style={{ color: '#94a3b8', fontSize: '12px' }}>{idx + 1}</td>
                  <td className="bd-bold" style={{ color: '#1e293b' }}>{k.keyword}</td>
                  <td><span className="bd-event-tag">{k.category}</span></td>
                  <td>
                    <div className="bd-media-cell">
                      <MediaLogo media={k.media} size={18} />
                      <span className="bd-bold">{k.media}</span>
                    </div>
                  </td>
                  <td>{k.device}</td>
                  <td>{number(k.impressions)}</td>
                  <td>{number(k.clicks)}</td>
                  <td>{percent(k.ctr)}</td>
                  <td>{money(k.cpc)}</td>
                  <td className="bd-bold">{money(k.spend)}</td>
                  <td>{number(k.signUp)}</td>
                  <td>{number(k.apply)}</td>
                  <td className="bd-blue bd-bold">{number(k.signUp + k.apply)}<small className="bd-count-unit">건</small></td>
                  <td className="bd-bold" style={{ color: k.cpa <= 2500 ? '#28977d' : '#db7b54' }}>
                    {money(k.cpa)}
                  </td>
                  <td>
                    <span className={`bd-status-chip ${k.status === '효율우수' ? 'good' : k.status === '단가주의' ? 'warning' : 'stable'}`}>
                      {k.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5}>합계 ({filteredKeywords.length}개 키워드)</td>
                <td>{compact(filteredKeywords.reduce((s, k) => s + k.impressions, 0))}</td>
                <td>{number(summary.totalClicks)}</td>
                <td>—</td>
                <td>{money(summary.avgCpc)}</td>
                <td>{money(summary.totalSpend)}</td>
                <td>{number(summary.totalSignUps)}</td>
                <td>{number(summary.totalApplies)}</td>
                <td>{number(summary.totalConv)}<small className="bd-count-unit">건</small></td>
                <td>{money(summary.avgCpa)}</td>
                <td>—</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="bd-table-foot">
          <span>총 {filteredKeywords.length}개 키워드</span>
          <span>대표 전환은 회원가입 및 입사지원의 합계로 계산합니다.</span>
        </div>
      </section>

      {/* 하단 운영 모니터링: 브랜드별 성과 탭 bd-insights 규격 통일 */}
      <div className="bd-insights">
        <div className="bd-insight-icon">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
        </div>
        <div>
          <strong>키워드 운영 모니터링 · 하반기 채용 성수기 대응 전략</strong>
          <p>
            SK하이닉스·기아 등 주요 대기업 공채 키워드는 검색 즉시 입사지원으로 연결되는 최고 효율군입니다.
            구직자 검색 패턴 변화(공채 중심 → 직무/경력 기반)와 AI 역량 트렌드에 대응하여,
            '개발자 경력직', 'AI 인적성검사', 코메이트 외국인 취업 키워드를 선제적으로 확장 운영할 것을 제안합니다.
          </p>
        </div>
        <span className="bd-rule">키워드 최적화 기준</span>
      </div>
    </div>
  );
}
