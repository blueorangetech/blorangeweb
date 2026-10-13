import { useEffect, useState } from 'react';
import { aiApi } from '../../../api';
import { PLACEMENT_SPECS_MAP } from './specs';
import GuideSizeSelect from './GuideSizeSelect';

export default function GuideEditor({ disabled, customSize, onPendingChange }) {
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [size, setSize] = useState('1080x1920');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const dirty = !!draft && JSON.stringify(draft) !== JSON.stringify(saved);
  useEffect(() => { onPendingChange(!draft || busy || dirty); }, [draft, busy, dirty, onPendingChange]);
  useEffect(() => {
    let active = true;
    aiApi.getVariationGuides().then((data) => {
      if (active) { setSaved(data); setDraft(data); }
    }).catch((error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, []);
  const sizes = [...new Set([
    ...PLACEMENT_SPECS_MAP.map((spec) => `${spec.width}x${spec.height}`),
    ...Object.keys(draft?.sizes || {}),
    ...(customSize ? [customSize] : []),
  ])];
  const save = async () => {
    setBusy(true); setMessage('');
    try {
      const data = await aiApi.saveVariationGuides(draft);
      setSaved(data); setDraft(data); setMessage('저장했습니다. 다음 생성부터 적용됩니다.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };
  const reload = async () => {
    setBusy(true); setMessage('');
    try {
      const data = await aiApi.getVariationGuides();
      setSaved(data); setDraft(data);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };
  return <section className="variation-guide-editor" aria-label="생성 가이드">
    <h4 className="rmbg-section-label variation-guide-title">생성가이드</h4>
    <fieldset disabled={disabled || busy || !draft}>
      <details className="variation-guide-group">
        <summary>공통 생성 가이드</summary>
        <textarea aria-label="공통 생성 가이드" rows={5} maxLength={6000} value={draft?.common || ''}
        onChange={(event) => setDraft((current) => ({ ...current, common: event.target.value }))} />
      </details>
      <details className="variation-guide-group">
        <summary>사이즈별 생성 가이드</summary>
      <div className="guide-size-field">
        <GuideSizeSelect sizes={sizes} guides={draft?.sizes || {}} value={size} onChange={setSize}
          disabled={disabled || busy || !draft} />
      </div>
      <label>선택 크기 가이드<textarea rows={8} maxLength={6000} value={draft?.sizes[size] || ''}
        placeholder="이 크기에 적용할 세이프존, 로고, 제품·문구 배치 기준을 입력하세요."
        onChange={(event) => setDraft((current) => ({ ...current, sizes: { ...current.sizes, [size]: event.target.value } }))} /></label>
      <p className="expand-help-text">좌표는 최종 출력 픽셀 기준입니다. 가이드가 없는 크기에 다른 규격의 기준을 자동 확대·축소하지 않습니다.</p>
      </details>
    </fieldset>
    {dirty && <p className="expand-help-text">변경한 가이드를 저장해 주세요.</p>}
    <div className="variation-guide-actions">
      <button type="button" className="mode-btn" disabled={disabled || busy || !draft || !dirty} onClick={save}>{busy ? '처리 중...' : '가이드 저장'}</button>
      <button type="button" className="mode-btn" disabled={disabled || busy} onClick={reload}>다시 불러오기</button>
    </div>
    {message && <p role="status" className="expand-help-text">{message}</p>}
  </section>;
}
