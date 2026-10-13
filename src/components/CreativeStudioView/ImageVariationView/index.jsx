import { useEffect, useRef, useState } from 'react';
import ImageUploadPreview from '../../common/ImageUploadPreview';
import ImageDetailModal from '../../common/ImageDetailModal';
import ImagePreviewPanel, { PreviewPlaceholder } from '../ImagePreviewPanel';
import PlacementGroupSelector from './PlacementGroupSelector';
import usePlacementSelection from './hooks/usePlacementSelection';
import PinpointEditModal from './PinpointEditModal';
import GuideEditor from './GuideEditor';
import { PLACEMENT_GROUPS, PLACEMENT_SPECS_MAP } from './specs';
import { aiApi } from '../../../api';
import { downloadFileFromUrl } from '../../../utils/downloadUtils';
import '../../../styles/components/CreativeStudioView/CreativeStudioView.css';
import '../../../styles/components/CreativeStudioView/ImageVariationView/VariationStudioView.css';

const VARIATION_MODELS = [
  { key: 'grok', label: 'Grok', description: 'Imagine Image' },
  { key: 'gpt', label: 'GPT', description: 'Image 2' },
  { key: 'gemini', label: 'Gemini', description: '3 Pro Image' },
  { key: 'qwen', label: 'Qwen', description: 'Image Edit 2511' },
];

export default function ImageVariationView({ embedded = false }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const requestRef = useRef(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(null);
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [width, setWidth] = useState('1080');
  const [height, setHeight] = useState('1080');
  const [model, setModel] = useState('gpt');
  const [guidePending, setGuidePending] = useState(true);
  const selection = usePlacementSelection(PLACEMENT_GROUPS);
  const targetCount = selection.selectedPlacementKeys.length + (useCustomSize ? 1 : 0);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const upload = (selected) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) return setError('JPG, PNG, WebP 이미지를 선택해 주세요.');
    if (selected.size > 20 * 1024 * 1024) return setError('이미지는 최대 20MB까지 업로드할 수 있습니다.');
    setFile(selected); setPreview(URL.createObjectURL(selected)); setError('');
  };
  const generate = async () => {
    if (guidePending) return setError('생성 가이드를 불러오고 변경 내용을 저장한 후 생성해 주세요.');
    if (requestRef.current) return;
    if (!file || !targetCount) return setError('원본 이미지와 매체 규격 또는 직접 입력 크기를 선택해 주세요.');
    const customSizes = useCustomSize ? [{ width: Number(width), height: Number(height) }] : [];
    if (useCustomSize && (![Number(width), Number(height)].every((value) => Number.isInteger(value) && value >= 128 && value <= 4096))) return setError('가로와 세로는 128~4096px 정수로 입력해 주세요.');
    if (useCustomSize && Math.max(Number(width), Number(height)) / Math.min(Number(width), Number(height)) > 8) return setError('가로·세로 비율은 8:1 이내로 입력해 주세요.');
    setLoading(true); setError(''); setErrors([]);
    const controller = new AbortController();
    requestRef.current = controller;
    setProgress({ completed: 0, total: targetCount });
    const batchId = crypto.randomUUID();
    const sourceName = file.name;
    let successCount = 0;
    try {
      await aiApi.generateImageVariations(file, selection.selectedPlacementKeys, 'expand', customSizes, {
        model,
        signal: controller.signal,
        onEvent: (event) => {
          if (controller.signal.aborted) return;
          if (event.type === 'image') {
            successCount += 1;
            const generatedAt = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
            setResults((previous) => [{ ...event.image, resultId: `${batchId}-${event.image.key}`, generatedAt, sourceName }, ...previous]);
          } else if (event.type === 'error') {
            setErrors((previous) => [...previous, event.error]);
          }
          if (event.type === 'image' || event.type === 'error') {
            setProgress((previous) => ({ ...previous, completed: previous.completed + 1 }));
          }
        },
      });
      if (!successCount) setError('생성된 결과가 없습니다. 아래 오류를 확인해 주세요.');
    } catch (err) { if (!controller.signal.aborted) setError(err.message || '이미지 베리에이션 생성에 실패했습니다.'); }
    finally {
      if (requestRef.current === controller) requestRef.current = null;
      if (!controller.signal.aborted) setLoading(false);
    }
  };
  return (
    <div className={`multiple-angle-layout image-variation-view${embedded ? ' embedded' : ''}`}>
        <section className="angle-upload-card glass-card">
          <div className="panel-header"><h3>소재 베리에이션</h3><span className="variation-badge">이미지</span></div>
          <div className="panel-scroll-content">
            <p className="angle-description">기존 이미지를 선택한 매체 규격에 맞춰 변환합니다. JPG·PNG·WebP, 최대 20MB.</p>
            <ImageUploadPreview file={file} previewUrl={preview} onFileSelect={upload} onInvalidFile={setError} disabled={loading} />
            <fieldset className="variation-custom-size" disabled={loading}>
              <legend className="rmbg-section-label">생성 모델</legend>
              <select className="variation-model-select" aria-label="생성 모델" value={model}
                onChange={(event) => setModel(event.target.value)}>
                {VARIATION_MODELS.map((option) => <option key={option.key} value={option.key}>
                  {option.label} · {option.description}
                </option>)}
              </select>
            </fieldset>
            <GuideEditor disabled={loading} onPendingChange={setGuidePending}
              customSize={useCustomSize && [Number(width), Number(height)].every((value) => Number.isInteger(value) && value >= 128 && value <= 4096) ? `${Number(width)}x${Number(height)}` : ''} />
            <fieldset className="variation-custom-size" disabled={loading}>
              <legend className="rmbg-section-label">출력 크기 직접 지정</legend>
              <div className="rmbg-mode-grid expand-size-grid variation-custom-mode">
                <button type="button" className={`mode-btn ${useCustomSize ? 'active' : ''}`}
                  aria-pressed={useCustomSize} aria-expanded={useCustomSize} aria-controls="variation-custom-inputs"
                  aria-label="직접 입력 크기 선택"
                  onClick={() => setUseCustomSize((current) => !current)}>
                  <small>{useCustomSize ? `${width || '—'} × ${height || '—'} px · 선택됨` : '너비와 높이 직접 입력'}</small>
                </button>
              </div>
              {useCustomSize && <div id="variation-custom-inputs" className="variation-custom-inputs">
                <div className="expand-custom-size">
                  <label htmlFor="variation-width">너비 (px)<input id="variation-width" type="number" min="128" max="4096" step="1" value={width} onChange={(event) => setWidth(event.target.value)} /></label>
                  <span aria-hidden="true">×</span>
                  <label htmlFor="variation-height">높이 (px)<input id="variation-height" type="number" min="128" max="4096" step="1" value={height} onChange={(event) => setHeight(event.target.value)} /></label>
                </div>
                <p className="expand-help-text">각 변 128~4096px · 가로·세로 비율 최대 8:1</p>
              </div>}
              <p className="expand-help-text variation-custom-hint">매체 규격과 함께 선택할 수 있습니다. 다시 누르면 해제됩니다.</p>
            </fieldset>
            <fieldset disabled={loading} style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="rmbg-section-label">매체 및 규격 선택</legend>
              <PlacementGroupSelector placementGroups={PLACEMENT_GROUPS} {...selection} />
            </fieldset>
          </div>
          <div className="panel-footer"><button className="generate-btn" disabled={loading || guidePending || !file || !targetCount} onClick={generate}>
            {loading ? `${progress.completed}/${progress.total}개 규격 처리 완료` : `${targetCount}개 규격 생성`}
          </button></div>
        </section>
        <ImagePreviewPanel resultCount={results.length} isLoading={loading}
          loadingTitle={`소재 베리에이션 생성 중 · ${progress.completed}/${progress.total}개 처리 완료`} loadingIcon="resize"
          loadingSteps={['원본 이미지와 매체 규격 확인 중...', '매체별 이미지 구도 재구성 중...', '결과 이미지 준비 중...']}
          notice={(error || errors.length > 0) && <div className="variation-error-notice" role="alert">
            <span className="material-symbols-outlined" aria-hidden="true">warning</span>
            <div className="variation-error-content">
              <p>{errors.length > 0 ? `${errors.length}개 규격을 생성하지 못했습니다.` : error}</p>
              {errors.length > 0 && <details>
                <summary>오류 상세 보기</summary>
                {error && <p>{error}</p>}
                {errors.map((item) => <p key={item.key}>{PLACEMENT_SPECS_MAP.find((s) => s.key === item.key)?.format || item.key.replace('custom_', '직접 입력 ')}: {item.message}</p>)}
              </details>}
            </div>
            <button type="button" aria-label="오류 알림 닫기" onClick={() => { setError(''); setErrors([]); }}>
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>}>
          {results.length ? <div className="angle-result-grid variation-results-grid">
            {results.map((item) => {
              const spec = PLACEMENT_SPECS_MAP.find((s) => s.key === item.key);
              const label = spec?.format || `직접 입력 (${item.width} × ${item.height})`;
              return <article className="angle-result-item" key={item.resultId}>
                <div className="angle-result-image-box"><img src={item.url} alt={label} /></div>
                <div className="angle-result-header"><span>{spec?.channel || '직접 입력'} · {item.width} × {item.height}</span></div>
                <p className="variation-result-source variation-edit-status">{item.editPrompt ? '부분 수정' : '\u00a0'}</p>
                <p className="variation-result-source" title={item.sourceName}>{item.generatedAt} · {VARIATION_MODELS.find((option) => option.key === item.model)?.label || 'Qwen'} · {item.sourceName}</p>
                <div className="angle-result-actions" style={{ padding: 12 }}>
                  <button onClick={() => setDetail({ ...item, label })}>자세히</button>
                  <button onClick={() => setEditing({ ...item, label })}>부분 수정</button>
                  <button onClick={() => downloadFileFromUrl(item.url, item.filename)}>PNG 다운로드</button>
                </div>
              </article>;
            })}
          </div> : <PreviewPlaceholder title={file ? '생성된 결과가 없습니다' : '이미지를 업로드해 주세요'}
            description={file ? '좌측에서 설정을 확인하고 다시 생성해 주세요.' : '좌측에서 원본 이미지와 매체 규격을 선택하면 결과가 이곳에 표시됩니다.'} />}
        </ImagePreviewPanel>
      <ImageDetailModal imageUrl={detail?.url} title={detail?.label} onClose={() => setDetail(null)} />
      {editing && <PinpointEditModal key={editing.resultId} image={editing} onClose={() => setEditing(null)} onComplete={(response, editPrompt) => {
        setResults((previous) => [{ ...editing, url: response.image_url, filename: response.filename,
          model: 'qwen',
          width: response.width, height: response.height, seed: response.seed, editPrompt,
          parentResultId: response.parent_result_id, resultId: crypto.randomUUID(),
          generatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        }, ...previous]);
        setEditing(null);
      }} />}
    </div>
  );
}
