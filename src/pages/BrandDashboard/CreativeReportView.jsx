import { useState, useMemo } from 'react';
import CreativeCard from './CreativeCard';
import FilterSelect from './FilterSelect';
import { CREATIVE_REPORT_DATA } from './reportData';

const number = value => (value == null ? '—' : Math.round(value).toLocaleString('ko-KR'));
const money = value => (value == null ? '—' : `₩${number(value)}`);
const percent = value => (value == null ? '—' : `${(value * 100).toFixed(2)}%`);

export default function CreativeReportView() {
  const [selectedMedia, setSelectedMedia] = useState('all');
  const [sortBy, setSortBy] = useState('conversions');

  // 매체 필터링
  const filteredData = useMemo(() => {
    let list = [...CREATIVE_REPORT_DATA];
    if (selectedMedia !== 'all') {
      list = list.filter(item => item.mediaKey === selectedMedia);
    }

    // 정렬
    list.sort((a, b) => {
      if (sortBy === 'conversions') return b.conversions - a.conversions;
      if (sortBy === 'ctr') return b.ctr - a.ctr;
      if (sortBy === 'spend') return b.spend - a.spend;
      if (sortBy === 'cpa') return a.cpa - b.cpa; // CPA는 낮을수록 좋음
      return 0;
    });

    return list;
  }, [selectedMedia, sortBy]);

  // 상단 KPI 집계
  const summary = useMemo(() => {
    const list = filteredData;
    const totalSpend = list.reduce((s, d) => s + d.spend, 0);
    const totalImpressions = list.reduce((s, d) => s + d.impressions, 0);
    const totalClicks = list.reduce((s, d) => s + d.clicks, 0);
    const totalConversions = list.reduce((s, d) => s + d.conversions, 0);

    const avgCtr = totalImpressions ? totalClicks / totalImpressions : 0;
    const avgCpc = totalClicks ? totalSpend / totalClicks : 0;
    const avgCpa = totalConversions ? totalSpend / totalConversions : 0;
    const avgCvr = totalClicks ? totalConversions / totalClicks : 0;

    return {
      totalSpend,
      totalImpressions,
      totalClicks,
      totalConversions,
      avgCtr,
      avgCpc,
      avgCpa,
      avgCvr,
      count: list.length,
    };
  }, [filteredData]);

  return (
    <div className="bd-report-view">
      {/* 상단 툴바: 좌측 타이틀 & 기간, 우측 필터 목록 몰아서 한쪽 정렬 */}
      <div className="bd-toolbar">
        <div className="bd-period">
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#74829a' }}>
            palette
          </span>
          <span style={{ fontWeight: 700, fontSize: '13px', color: '#43516a' }}>소재 리포트</span>
          <span className="bd-full-month">2026년 8월 · 디스플레이/SNS 광고 소재 성과</span>
        </div>

        {/* 필터 목록을 우측 한쪽으로 몰아서 배치 */}
        <div className="bd-toolbar-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FilterSelect
            label="매체 선택"
            value={selectedMedia}
            onChange={setSelectedMedia}
            options={[
              { id: 'all', name: '전체 매체' },
              { id: 'meta', name: '메타 (Meta)' },
              { id: 'naver', name: '네이버 GFA' },
              { id: 'google', name: '구글 GDN' },
            ]}
          />

          <FilterSelect
            compact
            label="정렬 기준"
            value={sortBy}
            onChange={setSortBy}
            options={[
              { id: 'conversions', name: '전환 많은 순' },
              { id: 'ctr', name: '클릭률(CTR) 높은 순' },
              { id: 'spend', name: '집행 광고비 높은 순' },
              { id: 'cpa', name: '전환단가(CPA) 낮은 순' },
            ]}
          />

          <span className="bd-pill">총 {summary.count}개 소재</span>
        </div>
      </div>

      {/* KPI 카드 그리드 */}
      <div className="bd-kpis">
        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>소재 총 집행액</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>
              payments
            </span>
          </div>
          <strong>{money(summary.totalSpend)}</strong>
          <div className="bd-kpi-foot">
            <span>평균 CPC {money(summary.avgCpc)}</span>
            <span>8월 누적</span>
          </div>
        </section>

        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>총 노출 / 클릭</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>
              ads_click
            </span>
          </div>
          <strong>
            {number(summary.totalClicks)}
            <small style={{ fontSize: '12px', fontWeight: 400, marginLeft: '3px' }}>회</small>
          </strong>
          <div className="bd-kpi-foot">
            <span className="bd-positive">평균 CTR {percent(summary.avgCtr)}</span>
            <span>노출 {number(summary.totalImpressions)}</span>
          </div>
        </section>

        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>총 발생 전환 (이력서/지원)</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>
              how_to_reg
            </span>
          </div>
          <strong>
            {number(summary.totalConversions)}
            <small style={{ fontSize: '12px', fontWeight: 400, marginLeft: '3px' }}>건</small>
          </strong>
          <div className="bd-kpi-foot">
            <span className="bd-positive">전환율(CVR) {percent(summary.avgCvr)}</span>
            <span>핵심 KPI 달성</span>
          </div>
        </section>

        <section className="bd-kpi">
          <div className="bd-kpi-label">
            <span>평균 획득단가 (CPA)</span>
            <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#aebbd7' }}>
              trending_down
            </span>
          </div>
          <strong>{money(summary.avgCpa)}</strong>
          <div className="bd-kpi-foot">
            <span>목표 대비 -18.4%</span>
            <span>효율 우수</span>
          </div>
        </section>
      </div>

      {/* 소재 카드 그리드 섹션 */}
      <section className="bd-panel">
        <div className="bd-panel-head">
          <div>
            <h2>디스플레이 광고 소재별 반응 및 효율 분석</h2>
            <p>
              공개 집행 사례의 배너 및 캠페인 영상 스틸입니다.
            </p>
            <p>성과 수치·매체·기간은 기존 예시 데이터이며, 표시된 과거 캠페인의 실제 집행 실적과 연결되지 않습니다.</p>
          </div>
          <span className="bd-pill">
            {selectedMedia === 'all'
              ? '모든 매체'
              : selectedMedia === 'meta'
              ? '메타 (Instagram/Facebook)'
              : selectedMedia === 'naver'
              ? '네이버 GFA'
              : '구글 GDN'}
          </span>
        </div>

        {/* CreativeCard 그리드 */}
        <div className="bd-creative-grid">
          {filteredData.map(item => (
            <CreativeCard key={item.id} data={item} />
          ))}
        </div>
      </section>

      {/* 모니터링 인사이트 */}
      <div className="bd-insights">
        <div className="bd-insight-icon">
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#5075ed' }}>
            lightbulb
          </span>
        </div>
        <div>
          <strong>실제 집행 캠페인 레퍼런스</strong>
          <p>
            ‘든든한 취업의 기준’은 하나애드IMC가 공개한 포털·네트워크 DA 집행 사례이며,
            ‘THANK YOU VERY MATCH’는 DCR8이 2022년 11월 진행한 통합 캠페인입니다.
            영상 스틸 여러 장은 동일 캠페인의 서로 다른 장면입니다.
          </p>
        </div>
        <span className="bd-rule">소재 최적화 리포트</span>
      </div>
    </div>
  );
}
