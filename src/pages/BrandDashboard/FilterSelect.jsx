import { useEffect, useId, useRef, useState } from 'react';

export default function FilterSelect({ value, onChange, options, label, compact = false }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const list = useRef(null);
  const listId = useId();
  const selected = options.find(option => option.id === value) || options[0];

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector('[aria-selected="true"]')?.focus();
    const closeOutside = event => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
    };
  }, [open]);

  const onKeyDown = event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    }
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const items = [...list.current.querySelectorAll('[role="option"]')];
    const index = items.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  };

  return <div className={`bd-brand-filter${compact ? ' bd-filter-compact' : ''}`} ref={root}>
    <button ref={trigger} type="button" className={`bd-filter-trigger${open ? ' open' : ''}`} aria-label={`${label}: ${selected.name}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} onClick={() => setOpen(!open)} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape') setOpen(false);
    }}>
      <span className="bd-filter-label">{selected.name}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    {open && <div ref={list} id={listId} role="listbox" aria-label={label} className="bd-filter-options" onKeyDown={onKeyDown}>
      {options.map(option => <button key={option.id} type="button" role="option" aria-selected={value === option.id} tabIndex={-1} onClick={() => {
        onChange(option.id);
        setOpen(false);
        trigger.current?.focus();
      }}><span className="bd-filter-label">{option.name}</span><span aria-hidden="true">{value === option.id ? '✓' : ''}</span></button>)}
    </div>}
  </div>;
}
