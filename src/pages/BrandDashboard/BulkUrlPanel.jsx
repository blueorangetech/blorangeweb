import { useEffect, useRef, useState } from 'react';
import { filterPostingUrls } from './bulkPostingUrls';

export default function BulkUrlPanel({ open, onClose }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('active');
  const dialog = useRef(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector('button')?.focus();
    const onKey = event => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const items = [...dialog.current.querySelectorAll('button:not(:disabled), textarea, a[href]')];
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  const output = (result?.[tab] || []).map(row => typeof row === 'string' ? row : row.url).join('\n');
  const copy = async () => {
    try { await navigator.clipboard.writeText(output); setNotice('결과 URL을 복사했습니다.'); }
    catch { setNotice('복사하지 못했습니다. 결과를 직접 선택하거나 TXT로 저장해 주세요.'); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([output], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `posting-urls-${tab}.txt`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className="bd-bulk-overlay" onClick={onClose}>
    <aside ref={dialog} role="dialog" aria-modal="true" aria-labelledby="bd-bulk-title" className="bd-bulk-panel" onClick={event => event.stopPropagation()}>
      <header><div><h2 id="bd-bulk-title">공고 URL 일괄 정리</h2><p>마감 공고를 제외하고 접수 중인 URL을 추출합니다.</p></div><button type="button" onClick={onClose} aria-label="패널 닫기">×</button></header>
      <div className="bd-bulk-body">
        <label htmlFor="bd-bulk-input">공고 URL <small>줄바꿈 또는 공백으로 구분</small></label>
        <textarea id="bd-bulk-input" value={input} onChange={event => { setInput(event.target.value); setResult(null); setNotice(''); }} placeholder={'https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=55325615\nhttps://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=55325621'} />
        <p className="bd-bulk-help">같은 공고는 한 번만 처리하며, 원본 URL과 입력 순서를 유지합니다.</p>
        <button className="bd-bulk-primary" type="button" disabled={!input.trim()} onClick={() => { setResult(filterPostingUrls(input)); setTab('active'); setNotice(''); }}>마감 공고 제외하기</button>
        {result && <>
          <div className="bd-bulk-summary">입력 {input.trim().split(/\s+/).length.toLocaleString()}건 · 중복 {result.duplicates.toLocaleString()}건 제거</div>
          <div className="bd-bulk-tabs" aria-label="분류별 결과">{[['active','접수 중'],['closed','마감 제외'],['invalid','형식 오류']].map(([key,label]) => <button key={key} type="button" className={tab === key ? 'active' : ''} aria-pressed={tab === key} onClick={() => { setTab(key); setNotice(''); }}>{label} <b>{result[key].length.toLocaleString()}</b></button>)}</div>
          <div className="bd-bulk-result-head"><strong>{tab === 'active' ? '접수 중인 공고 URL' : tab === 'closed' ? '제외된 마감 공고 URL' : tab === 'unknown' ? '마감 여부 확인이 필요한 URL' : '지원하지 않는 입력'}</strong><div><button type="button" disabled={!output} onClick={copy}>복사</button><button type="button" disabled={!output} onClick={download}>TXT 저장</button></div></div>
          <textarea className="bd-bulk-output" aria-label="분류 결과 URL" readOnly value={output} placeholder="해당하는 결과가 없습니다." />
        </>}
        <p role="status" className="bd-bulk-help">{notice}</p>
      </div>
    </aside>
  </div>;
}
