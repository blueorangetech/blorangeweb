import React, { useEffect, useRef, useState } from 'react';
import SSF from 'ssf';

function displayValue(sheet, address, value) {
  const format = sheet.format_codes?.[sheet.number_formats?.[address]];
  if (!format || !value || ['s', 'inlineStr'].includes(sheet.cell_types?.[address]) || sheet.calculation_errors?.[address]) return value;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value;
  try { return SSF.format(format, numeric); } catch { return value; }
}

function columnName(index) {
  let value = index + 1;
  let name = '';
  while (value > 0) {
    name = String.fromCharCode(65 + (value - 1) % 26) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

export default function WorkbookPanel({ workbook, sheetName, setSheetName, selection, setSelection, onAsk, onEdit, edits, disabled, exporting, exportError, onExport }) {
  const sheet = workbook.sheets.find(item => item.name === sheetName) || workbook.sheets[0];
  const [anchor, setAnchor] = useState(null);
  const [editing, setEditing] = useState(null);
  const grid = useRef(null);
  const dragSelection = useRef(null);
  const width = Math.max(1, ...sheet.rows.map(row => row.length));
  const selectedRange = selection?.sheet === sheet.name ? selection.range : '';
  useEffect(() => {
    if (!selectedRange || dragSelection.current) return;
    const container = grid.current;
    const cell = container?.querySelector(`[data-cell="${selectedRange.split(':')[0]}"]`);
    if (!cell) return;
    const bounds = container.getBoundingClientRect();
    const target = cell.getBoundingClientRect();
    if (target.top < bounds.top + 32 || target.bottom > bounds.bottom || target.left < bounds.left + 42 || target.right > bounds.right) {
      container.scrollTo({ top: container.scrollTop + target.top - bounds.top - 32, left: container.scrollLeft + target.left - bounds.left - 42, behavior: 'smooth' });
    }
  }, [selectedRange, sheet.name]);

  function selectCell(row, col, extend, origin) {
    const start = origin || (extend && anchor?.sheet === sheet.name ? anchor : { row, col, sheet: sheet.name });
    if (!extend) setAnchor(start);
    const first = `${columnName(Math.min(col, start.col))}${Math.min(row, start.row) + 1}`;
    const last = `${columnName(Math.max(col, start.col))}${Math.max(row, start.row) + 1}`;
    setSelection({ sheet: sheet.name, range: first === last ? first : `${first}:${last}` });
    return start;
  }

  function startEditing(address) {
    if (disabled || sheet.locked_cells?.includes(address)) return;
    const [, column, row] = /^([A-Z]+)(\d+)$/.exec(address);
    const col = [...column].reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0) - 1;
    setEditing({ sheet: sheet.name, address, value: sheet.formulas?.[address] ?? sheet.rows[Number(row) - 1][col] ?? '' });
  }

  const changeCount = Object.keys(edits).length;
  const formulaCount = workbook.sheets.reduce((sum, item) => sum + Object.keys(item.formulas || {}).length, 0);
  const errorCount = workbook.sheets.reduce((sum, item) => sum + Object.keys(item.calculation_errors || {}).length, 0);
  const canEditSelection = selectedRange && !selectedRange.includes(':') && !sheet.locked_cells?.includes(selectedRange);

  const toPosition = address => {
    const match = /^([A-Z]+)(\d+)$/.exec(address || '');
    if (!match) return [-1, -1];
    return [Number(match[2]) - 1, [...match[1]].reduce((sum, ch) => sum * 26 + ch.charCodeAt(0) - 64, 0) - 1];
  };
  const [start, end = start] = selectedRange.split(':').map(toPosition);
  return (
    <aside className="workbook-panel" aria-label="엑셀 데이터">
      <div className="workbook-heading"><strong title={workbook.filename}>{workbook.filename}</strong><div className="workbook-export-actions"><span>{changeCount ? `${changeCount}개 셀 수정됨` : '편집 가능'}</span><button type="button" disabled={disabled || !!editing} onClick={onExport}>{exporting ? '내보내는 중…' : '엑셀 내보내기'}</button></div></div>
      <div className="workbook-toolbar">
        <span>{selection ? `${selection.sheet}!${selection.range}` : '드래그 또는 Shift+클릭으로 범위 선택'}</span>
        <button type="button" disabled={!selection} onClick={onAsk}>선택 영역 질문하기</button>
        <button type="button" disabled={!canEditSelection || disabled || !!editing} onClick={() => startEditing(selectedRange)}>셀 편집</button>
        {selection && <button type="button" onClick={() => setSelection(null)}>선택 해제</button>}
      </div>
      {editing && <form className="workbook-cell-editor" onSubmit={event => { event.preventDefault(); onEdit(editing.sheet, editing.address, editing.value); setEditing(null); }}>
        <label htmlFor="workbook-cell-value">{editing.sheet}!{editing.address}</label>
        <input id="workbook-cell-value" aria-label="셀 값" autoFocus value={editing.value} maxLength={32767} onChange={event => setEditing({ ...editing, value: event.target.value })} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); setEditing(null); } }} />
        <button type="submit" disabled={disabled}>적용</button><button type="button" onClick={() => setEditing(null)}>취소</button>
      </form>}
      {exportError && <p className="workbook-export-error" role="alert">{exportError}</p>}
      <div className="workbook-grid" ref={grid} key={sheet.name}
        onDragStart={event => event.preventDefault()}
        onDoubleClick={event => {
          const cell = event.target.closest('td[data-cell]') || document.elementFromPoint(event.clientX, event.clientY)?.closest('td[data-cell]');
          if (cell && event.currentTarget.contains(cell)) startEditing(cell.dataset.cell);
        }}
        onPointerDown={event => {
          if (event.button !== 0 || event.pointerType !== 'mouse') return;
          const cell = event.target.closest('td[data-row]');
          if (!cell || !event.currentTarget.contains(cell)) return;
          cell.querySelector('button')?.focus({ preventScroll: true });
          const row = Number(cell.dataset.row);
          const col = Number(cell.dataset.col);
          const start = selectCell(row, col, event.shiftKey);
          dragSelection.current = { start, row, col, pointerId: event.pointerId };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={event => {
          const drag = dragSelection.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest('td[data-row]');
          if (!cell || !event.currentTarget.contains(cell)) return;
          const row = Number(cell.dataset.row);
          const col = Number(cell.dataset.col);
          if (row === drag.row && col === drag.col) return;
          drag.row = row;
          drag.col = col;
          selectCell(row, col, true, drag.start);
        }}
        onPointerUp={event => {
          dragSelection.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => { dragSelection.current = null; }}
        onLostPointerCapture={() => { dragSelection.current = null; }}
      >
        <table aria-label={`${sheet.name} 시트`}>
          <thead><tr><th aria-label="행 번호" />{Array.from({ length: width }, (_, col) => <th key={col}>{columnName(col)}</th>)}</tr></thead>
          <tbody>{sheet.rows.map((row, r) => <tr key={r}><th>{r + 1}</th>{Array.from({ length: width }, (_, c) => {
            const active = start && r >= start[0] && r <= end[0] && c >= start[1] && c <= end[1];
            const address = `${columnName(c)}${r + 1}`;
            const changed = !!edits[JSON.stringify([sheet.name, address])];
            const locked = sheet.locked_cells?.includes(address);
            const shown = displayValue(sheet, address, row[c]);
            return <td key={c} data-cell={address} data-row={r} data-col={c} className={`${active ? 'selected ' : ''}${changed ? 'is-edited' : ''}`}>
              <button type="button" title={`${sheet.formulas?.[address] || row[c] || ''}${locked ? ' (보호된 셀)' : ' · 더블클릭하여 편집'}`} aria-label={`${address}: ${shown || '빈 셀'}`} aria-pressed={!!active} onClick={event => { if (event.detail === 0 || ['touch', 'pen'].includes(event.nativeEvent.pointerType)) selectCell(r, c, event.shiftKey); }} onKeyDown={event => { if (event.key === 'F2') { event.preventDefault(); startEditing(address); } }}>{shown || '\u00a0'}</button>
            </td>;
          })}</tr>)}</tbody>
        </table>
      </div>
      <div className="workbook-tabs" role="tablist" aria-label="시트">{workbook.sheets.map(item => <button key={item.name} type="button" role="tab" aria-selected={sheet.name === item.name} disabled={!!editing} onClick={() => { setSheetName(item.name); setSelection(null); }}>{item.name}</button>)}</div>
      <small>셀 더블클릭 또는 F2로 편집 · Enter 적용 / Esc 취소 · 수정본으로 내보내기</small>
      <small role="status">수식 {formulaCount.toLocaleString()}개 계산 완료{errorCount ? ` · 오류 ${errorCount}개 (분석 근거에서 제외)` : ''} · 셀 수정 시 자동 재계산</small>
      {changeCount > 0 && <small>이전 AI 답변은 수정 전 값 기준일 수 있습니다. 다시 질문하면 현재 계산 결과를 사용합니다.</small>}
    </aside>
  );
}
