import React, { useRef, useState } from 'react';

export default function WorkspaceDivider({ ratio, onChange }) {
  const pointer = useRef(null);
  const [resizing, setResizing] = useState(false);

  function limits(element) {
    const parent = element.parentElement.getBoundingClientRect();
    const dividerWidth = element.getBoundingClientRect().width;
    const available = parent.width - dividerWidth;
    return { parent, dividerWidth, available, min: Math.max(20, 240 / available * 100), max: Math.min(70, (available - 300) / available * 100) };
  }

  function change(element, value) {
    const { min, max } = limits(element);
    onChange(Math.max(min, Math.min(max, value)));
  }

  function finish() {
    pointer.current = null;
    setResizing(false);
  }

  return <div
    className={`chat-workbook-divider${resizing ? ' is-resizing' : ''}`}
    role="separator"
    aria-label="챗과 엑셀 영역 비율 조절"
    aria-orientation="vertical"
    aria-valuemin={20}
    aria-valuemax={70}
    aria-valuenow={Math.round(ratio)}
    aria-valuetext={`챗 ${Math.round(ratio)}%, 엑셀 ${Math.round(100 - ratio)}%`}
    tabIndex={0}
    title="드래그하여 비율 조절 · 더블클릭으로 기본 비율 복원"
    onPointerDown={event => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.focus();
      pointer.current = event.pointerId;
      setResizing(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
    onPointerMove={event => {
      if (pointer.current !== event.pointerId) return;
      const { parent, dividerWidth, available } = limits(event.currentTarget);
      change(event.currentTarget, (event.clientX - parent.left - dividerWidth / 2) / available * 100);
    }}
    onPointerUp={event => {
      finish();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }}
    onPointerCancel={finish}
    onLostPointerCapture={finish}
    onDoubleClick={event => change(event.currentTarget, 38)}
    onKeyDown={event => {
      const values = { ArrowLeft: ratio - 2, ArrowRight: ratio + 2, Home: 20, End: 70 };
      if (!(event.key in values)) return;
      event.preventDefault();
      change(event.currentTarget, values[event.key]);
    }}
  ><span aria-hidden="true" /></div>;
}
