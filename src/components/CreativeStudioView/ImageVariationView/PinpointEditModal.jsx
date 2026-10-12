import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { aiApi } from '../../../api';
import '../../../styles/components/CreativeStudioView/ImageVariationView/PinpointEditModal.css';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export default function PinpointEditModal({ image, onClose, onComplete }) {
  const [region, setRegion] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [dimensions, setDimensions] = useState(null);
  const [reference, setReference] = useState(null);
  const [referenceError, setReferenceError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const referenceInput = useRef(null);
  const stageRef = useRef(null);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const gesture = useRef(null);
  const requestBusy = useRef(false);

  useEffect(() => () => {
    if (reference?.url) URL.revokeObjectURL(reference.url);
  }, [reference]);

  const selectReference = (file) => {
    if (!file || loading) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setReferenceError('JPG, PNG, WebP 이미지를 선택해 주세요.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setReferenceError('참고 이미지는 최대 20MB까지 업로드할 수 있습니다.');
      return;
    }
    setReference({ file, url: URL.createObjectURL(file) });
    setReferenceError('');
  };

  useEffect(() => {
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const keydown = (event) => {
      if (event.key === 'Escape' && !requestBusy.current) onClose();
      if (event.key !== 'Tab') return;
      const elements = [...dialogRef.current.querySelectorAll('button:not(:disabled), textarea, input:not(:disabled), [tabindex="0"]')].filter((element) => element.getClientRects().length > 0);
      const first = elements[0], last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', keydown);
    return () => {
      window.removeEventListener('keydown', keydown);
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  const point = (event) => {
    const bounds = stageRef.current.getBoundingClientRect();
    return { x: clamp((event.clientX - bounds.left) / bounds.width), y: clamp((event.clientY - bounds.top) / bounds.height) };
  };
  const start = (event) => {
    if (loading || !dimensions || event.button !== 0) return;
    event.preventDefault();
    const corner = event.target.dataset.corner;
    const mode = corner ? 'resize' : event.target.dataset.selection ? 'move' : 'draw';
    gesture.current = { mode, corner, origin: point(event), initial: region };
    event.currentTarget.setPointerCapture(event.pointerId);
    if (mode === 'draw') setRegion({ ...point(event), width: 0, height: 0 });
  };
  const move = (event) => {
    if (!gesture.current) return;
    const { mode, origin, initial, corner } = gesture.current;
    const current = point(event);
    if (mode === 'move') {
      setRegion({ ...initial, x: clamp(initial.x + current.x - origin.x, 0, 1 - initial.width), y: clamp(initial.y + current.y - origin.y, 0, 1 - initial.height) });
    } else {
      const anchor = mode === 'draw' ? origin : {
        x: corner.includes('w') ? initial.x + initial.width : initial.x,
        y: corner.includes('n') ? initial.y + initial.height : initial.y,
      };
      setRegion({ x: Math.min(anchor.x, current.x), y: Math.min(anchor.y, current.y), width: Math.abs(anchor.x - current.x), height: Math.abs(anchor.y - current.y) });
    }
  };
  const finish = () => {
    gesture.current = null;
    setRegion((value) => value && value.width * dimensions.width >= 8 && value.height * dimensions.height >= 8 ? value : null);
  };
  const keyboardMove = (event) => {
    if (loading || !region || !event.key.startsWith('Arrow')) return;
    event.preventDefault();
    const step = event.shiftKey ? .05 : .01;
    setRegion({ ...region, x: clamp(region.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), 0, 1 - region.width), y: clamp(region.y + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0), 0, 1 - region.height) });
  };

  const generate = async () => {
    if (loading || !region || !prompt.trim() || referenceError) return;
    const selection = { ...region };
    const instruction = prompt.trim();
    requestBusy.current = true;
    setLoading(true); setError('');
    try {
      let file;
      // Remote Comfy output is downloaded by GEO, avoiding browser storage CORS.
      if (image.url.startsWith('data:') || image.url.startsWith('blob:')) {
        const download = await fetch(image.url);
        if (!download.ok) throw new Error('편집 원본을 불러올 수 없습니다.');
        const blob = await download.blob();
        if (blob.size > 20 * 1024 * 1024) throw new Error('편집 원본은 20MB 이하로 사용해 주세요.');
        file = new File([blob], 'pinpoint-source.png', { type: blob.type || 'image/png' });
      }
      const result = await aiApi.pinpointEdit(file, { imageUrl: file ? undefined : image.url, region: selection, prompt: instruction, referenceFile: reference?.file, parentResultId: image.resultId });
      if (!result.image_url) throw new Error('생성된 부분 수정 결과가 없습니다.');
      onComplete(result, instruction);
    } catch (err) {
      setError(err.message || '부분 수정에 실패했습니다.');
    } finally { requestBusy.current = false; setLoading(false); }
  };

  return createPortal(
    <div className="pinpoint-backdrop" onMouseDown={(event) => { if (!loading && event.target === event.currentTarget) onClose(); }}>
      <section className="pinpoint-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="pinpoint-title">
        <header className="pinpoint-header">
          <div><h2 id="pinpoint-title">이미지 부분 수정</h2><p>{image.label} · {image.width} × {image.height} px</p></div>
          <button ref={closeRef} type="button" disabled={loading} onClick={onClose} aria-label="부분 수정 닫기"><span className="material-symbols-outlined">close</span></button>
        </header>
        <div className="pinpoint-layout">
          <div className="pinpoint-workspace">
            <div className="pinpoint-toolbar"><span><span className="material-symbols-outlined">crop_free</span>수정할 영역을 드래그해 선택하세요</span><button type="button" disabled={loading || !region} onClick={() => setRegion(null)}>선택 초기화</button></div>
            <div className="pinpoint-canvas">
              <div className="pinpoint-image-stage" ref={stageRef} onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={() => { gesture.current = null; }}>
                <img src={image.url} alt="부분 수정할 원본 결과" draggable="false" onLoad={(event) => setDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} />
                {region && <div className="pinpoint-selection" data-selection="true" style={{ left: `${region.x * 100}%`, top: `${region.y * 100}%`, width: `${region.width * 100}%`, height: `${region.height * 100}%` }} tabIndex="0" role="group" aria-label="선택 영역. 방향키로 이동, Shift와 방향키로 크게 이동" onKeyDown={keyboardMove}>
                  {['nw', 'ne', 'sw', 'se'].map((corner) => <span key={corner} data-corner={corner} className={`pinpoint-handle ${corner}`} />)}
                </div>}
              </div>
            </div>
            <p className="pinpoint-canvas-help">선택 영역 안을 드래그하면 이동하고, 모서리를 드래그하면 크기를 조절할 수 있습니다.</p>
          </div>
          <aside className="pinpoint-controls">
            <div className="pinpoint-step"><span>1</span><h3>수정 영역</h3></div>
            <p className="pinpoint-region-status" aria-live="polite">{region ? '수정 영역 선택됨' : '이미지에서 수정할 부분을 선택해 주세요.'}</p>
            <div className="pinpoint-step"><span>2</span><h3 id="pinpoint-reference-title">참고 이미지 <small className="pinpoint-optional">선택</small></h3></div>
            <fieldset disabled={loading} className="pinpoint-reference" aria-labelledby="pinpoint-reference-title" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); selectReference(event.dataTransfer.files[0]); }}>
              <input ref={referenceInput} type="file" accept="image/jpeg,image/png,image/webp" hidden aria-label="참고 이미지 파일 선택" onChange={(event) => { selectReference(event.target.files[0]); event.target.value = ''; }} />
              {reference ? <>
                <img src={reference.url} alt="부분 수정 참고 이미지" onError={() => setReferenceError('참고 이미지를 읽을 수 없습니다. 다른 파일을 선택해 주세요.')} />
                <p className="pinpoint-reference-name" title={reference.file.name}>{reference.file.name}</p>
                <div className="pinpoint-reference-actions"><button type="button" onClick={() => referenceInput.current.click()}>이미지 교체</button><button type="button" onClick={() => { setReference(null); setReferenceError(''); }}>삭제</button></div>
              </> : <button type="button" className="pinpoint-reference-upload" onClick={() => referenceInput.current.click()}><span className="material-symbols-outlined" aria-hidden="true">add_photo_alternate</span><strong>참고 이미지 추가</strong><small>클릭하거나 이미지를 드래그하세요</small><small>JPG · PNG · WebP / 최대 20MB</small></button>}
            </fieldset>
            {referenceError && <p className="pinpoint-reference-error" role="alert">{referenceError}</p>}
            <p className="pinpoint-help">참고할 제품·색상·재질 이미지를 넣고, 아래에 어떻게 반영할지 설명해 주세요.</p>
            <div className="pinpoint-step"><span>3</span><label htmlFor="pinpoint-prompt">수정 내용</label></div>
            <textarea id="pinpoint-prompt" disabled={loading} value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={2000} rows={6} placeholder={reference ? '예: 선택한 소파에 참고 이미지의 색상과 재질을 적용하고, 형태와 조명은 유지해 주세요.' : '예: 선택한 소파를 베이지색 패브릭으로 변경하고, 형태와 조명은 유지해 주세요.'} />
            <div className="pinpoint-prompt-count">{prompt.length} / 2,000</div>
            <div className="pinpoint-footer">
              {loading && <p role="status">선택 영역을 수정하고 있습니다. 원본 이미지는 계속 확인할 수 있습니다.</p>}
              {error && <p className="pinpoint-reference-error" role="alert">{error}</p>}
              <button type="button" className="generate-btn" disabled={loading || !region || !prompt.trim() || !!referenceError} onClick={generate}>
                {loading ? <span className="btn-loading-content"><span className="spinner-white" aria-hidden="true" /><span>부분 수정 중…</span></span> : '부분 수정 생성'}
              </button>
            </div>
          </aside>
        </div>
      </section>
    </div>, document.body
  );
}
