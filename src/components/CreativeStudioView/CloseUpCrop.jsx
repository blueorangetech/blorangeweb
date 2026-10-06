import { useRef, useState } from 'react';

export default function CloseUpCrop({ src, region, onChange, disabled }) {
  const start = useRef(null);
  const [dragging, setDragging] = useState(false);
  const point = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
  };
  const move = (event) => {
    if (!start.current) return;
    const end = point(event);
    onChange({ x: Math.min(start.current.x, end.x), y: Math.min(start.current.y, end.y),
      width: Math.abs(end.x - start.current.x), height: Math.abs(end.y - start.current.y) });
  };
  return (
    <div style={{ position: 'relative', lineHeight: 0, touchAction: 'none', cursor: disabled ? 'default' : 'crosshair' }}
      onPointerDown={(event) => {
        if (disabled || event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        start.current = point(event); setDragging(true); onChange(null);
      }} onPointerMove={move}
      onPointerUp={(event) => { move(event); start.current = null; setDragging(false); }}
      onPointerCancel={() => { start.current = null; setDragging(false); onChange(null); }}>
      <img src={src} alt="클로즈업할 영역을 드래그하여 선택" draggable={false} style={{ width: '100%', display: 'block', userSelect: 'none' }} />
      {region && <div style={{ position: 'absolute', pointerEvents: 'none', boxSizing: 'border-box',
        border: '2px solid #4f46e5', background: 'rgba(79,70,229,.12)',
        left: `${region.x * 100}%`, top: `${region.y * 100}%`, width: `${region.width * 100}%`, height: `${region.height * 100}%` }} />}
      <span role="status" style={{ position: 'absolute', width: 1, height: 1, padding: 0,
        margin: -1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0 }}>
        {dragging ? '영역 선택 중' : '영역 선택 준비'}
      </span>
    </div>
  );
}

