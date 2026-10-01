import React from 'react';

export default function ABAnalysisSummary({ dataA, dataB, result, expanded, onToggle }) {
  const winner = (a, b) => a === b ? '동일' : `Creative ${a > b ? 'A' : 'B'} 우세`;
  const metrics = [ ['CTR', dataA.ctr, dataB.ctr], ['CVR', dataA.cvr, dataB.cvr], ['ROAS', dataA.roas, dataB.roas] ];
  const proposal = typeof result.performance === 'string' ? result.performance : '';
  const sentences = proposal.match(/[^.!?。]+[.!?。]?(?:\s|$)/g);
  const preview = sentences?.slice(0, 2).join('').trim() || proposal;
  return (
    <div className="ab-analysis-summary">
      <div>
        <span className="ab-analysis-eyebrow">핵심 결론 · 관측 성과 기준</span>
        <p className="ab-analysis-conclusion">클릭 유도는 {winner(dataA.ctr, dataB.ctr)}, 구매 전환은 {winner(dataA.cvr, dataB.cvr)}입니다.</p>
      </div>
      <div className="ab-analysis-metrics">
        {metrics.map(([label, a, b]) => <div className="ab-analysis-metric" key={label}>
          <strong>{label}</strong><span><b className="ab-value-a">A {a.toFixed(2)}%</b><b className="ab-value-b">B {b.toFixed(2)}%</b></span>
          <small>{winner(a, b)} · 차이 {Math.abs(a - b).toFixed(2)}%p</small>
        </div>)}
      </div>
      <div className="ab-analysis-proposal">
        <strong>다음 테스트 제안</strong>
        <p>{preview || '테스트 제안이 반환되지 않았습니다.'}</p>
      </div>
      <small className="ab-analysis-note">집행 규모가 다른 관측값 비교입니다. 이미지·카피가 성과에 미친 영향은 AI의 해석입니다.</small>
      <button className="ab-analysis-toggle" onClick={onToggle} aria-expanded={expanded} aria-controls="ab-full-analysis">{expanded ? '전체 분석 접기' : '전체 분석 보기'} <span aria-hidden="true">{expanded ? '↑' : '↓'}</span></button>
    </div>
  );
}
