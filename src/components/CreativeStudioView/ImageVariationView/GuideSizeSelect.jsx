import { useEffect, useRef, useState } from 'react';

export default function GuideSizeSelect({ sizes, guides, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event) => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);
  const status = (key) => <span className={`guide-size-status ${guides[key]?.trim() ? 'has-guide' : 'no-guide'}`}>
    {guides[key]?.trim() ? '가이드 있음' : '가이드 없음'}
  </span>;
  return <div className="guide-size-select" ref={root} onKeyDown={(event) => {
    if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    if (open && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const options = [...root.current.querySelectorAll('.guide-size-option')];
      const index = options.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
        : event.key === 'ArrowDown' ? (index + 1) % options.length : (index - 1 + options.length) % options.length;
      options[next]?.focus();
    }
  }}>
    <button ref={trigger} type="button" className="guide-size-trigger" disabled={disabled}
      aria-label="출력 크기 가이드 선택" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <span>{value.replace('x', ' × ')}</span>{status(value)}
      <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
    </button>
    {open && !disabled && <div className="guide-size-options" role="group" aria-label="출력 크기 목록">
      {sizes.map((key) => <button type="button" className="guide-size-option" key={key}
        aria-pressed={key === value} onClick={() => { onChange(key); setOpen(false); trigger.current?.focus(); }}>
        <span>{key.replace('x', ' × ')}</span>{status(key)}
      </button>)}
    </div>}
  </div>;
}
