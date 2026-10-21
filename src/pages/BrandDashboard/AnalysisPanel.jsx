import { useEffect, useRef, useState } from 'react';
import { buildAnalysis } from './analysis';

export default function AnalysisPanel({ label, storageKey, rows, previousRows, onClose }) {
  const dialog = useRef(null);
  const [history, setHistory] = useState(() => {
    try { return localStorage.getItem(storageKey) || ''; } catch { return ''; }
  });
  const [saved, setSaved] = useState('');
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element.show();
    return () => {
      element.close();
      requestAnimationFrame(() => { if (trigger?.isConnected) trigger.focus(); });
    };
  }, []);
  useEffect(() => {
    const handleKey = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);
  const sections = buildAnalysis(rows, previousRows);
  const save = () => {
    try {
      localStorage.setItem(storageKey, history);
      setSaved('이 브라우저에 저장했습니다.');
    } catch { setSaved('저장할 수 없습니다. 브라우저 저장 공간을 확인하세요.'); }
  };
  return <dialog ref={dialog} className="bd-analysis-dialog" aria-labelledby="bd-analysis-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="bd-analysis-shell">
      <header className="bd-analysis-header"><div><span>PERFORMANCE INSIGHTS</span><h2 id="bd-analysis-title">AI 성과분석</h2><p>{label}</p></div><button type="button" aria-label="AI 성과분석 닫기" onClick={onClose}>×</button></header>
      <div className="bd-analysis-body">
        <p className="bd-analysis-note">선택한 조건의 집계 수치를 기준으로 분석합니다. 전환 지표는 브랜드별로 비교합니다.</p>
        {!sections.length ? <p className="bd-empty">선택한 조건의 운영 내역이 없습니다.</p> : sections.map((section, index) => <section className={`bd-analysis-section${index === 0 ? ' bd-analysis-summary' : ''}`} key={section.title}><h3><span>0{index + 1}</span>{section.title}</h3><ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul></section>)}
        <details className="bd-operation-history"><summary>운영 이력 참고</summary><p>현재 브랜드·월·광고 유형에 대한 변경 사항을 기록하세요. 입력 내용은 참고 메모로 보관하며, 수치 변화의 원인으로 자동 판단하지 않습니다.</p><label htmlFor="bd-history">날짜 · 매체 · 변경 내용</label><textarea id="bd-history" value={history} onChange={event => { setHistory(event.target.value); setSaved(''); }} placeholder="예: 5/12 · Meta · 신규 소재 운영 시작" rows={5} /><div><span role="status">{saved || '현재 브라우저에만 보관됩니다.'}</span><button type="button" onClick={save}>이력 저장</button></div></details>
      </div>
    </div>
  </dialog>;
}
