import { useEffect, useRef, useState } from 'react';
import ImageUploadPreview from '../common/ImageUploadPreview';
import ComparisonResultCard from '../common/ComparisonResultCard';
import ImagePreviewPanel, { PreviewPlaceholder } from './ImagePreviewPanel';
import { aiApi } from '../../api';
import { downloadFileFromUrl } from '../../utils/downloadUtils';
import '../../styles/ImageComposeView.css';

const EXAMPLES = [
  '1번 의자에 2번 사람을 자연스럽게 앉혀줘. 사람의 얼굴과 의자의 디자인을 유지하고 크기, 원근감, 그림자를 맞춰줘.',
  '1번 사진의 소파 천 부분만 2번 이미지의 재질로 바꿔줘. 프레임, 배경, 카메라 각도는 유지해줘.',
  '1번 공간에 2번 가구를 배치하고, 가구의 천 부분에는 3번 이미지의 재질을 적용해줘.',
];
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageComposeView({ embedded, pageName, bucketName }) {
  const [images, setImages] = useState([]);
  const urls = useRef(new Set());
  const busy = useRef(false);
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const owned = urls.current;
    return () => owned.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const select = (index, selected) => {
    if (!selected || busy.current) return;
    if (!ACCEPTED.includes(selected.type)) return setError('JPG, PNG, WebP 이미지를 선택해 주세요.');
    if (selected.size > 20 * 1024 * 1024) return setError('이미지는 한 장당 20MB까지 업로드할 수 있습니다.');
    const url = URL.createObjectURL(selected);
    urls.current.add(url);
    setImages((current) => { const next = [...current]; next[index] = { file: selected, url }; return next; });
    setError('');
  };

  const removeLast = () => {
    if (busy.current) return;
    setImages((current) => current.slice(0, -1));
    setError('');
  };

  const generate = async () => {
    if (busy.current || !images.length || !prompt.trim()) return;
    busy.current = true;
    setLoading(true);
    setError('');
    try {
      const response = await aiApi.composeImages(images.map((item) => item.file), { prompt: prompt.trim(), pageName, bucketName });
      if (!response.image_url) throw new Error('생성 결과 이미지를 받지 못했습니다.');
      setResults((current) => [{
        ...response,
        id: `${Date.now()}-${response.image_url}`,
        originalUrl: images[0].url,
        prompt: prompt.trim(),
      }, ...current]);
    } catch (err) {
      setError(err.message || '이미지 합성에 실패했습니다.');
    } finally {
      busy.current = false;
      setLoading(false);
    }
  };

  const removeResult = (resultId) => {
    setResults((current) => current.filter((item) => item.id !== resultId));
  };

  return (
    <div className={`multiple-angle-layout restyle-layout compose-layout${embedded ? ' embedded' : ''}`}>
      <section className="angle-upload-card glass-card">
        <div className="panel-header"><h3>이미지 합성</h3><span>{images.length} / 3장</span></div>
        <div className="panel-scroll-content">
          <p className="angle-description">최대 3장의 이미지를 참조해 새로운 이미지를 만듭니다. 1번에는 편집할 사진을, 2·3번에는 사람이나 재질 등 참조할 사진을 넣어 주세요.</p>
          <fieldset className="compose-inputs" disabled={loading}>
            <legend className="restyle-section-label">참조 이미지 · JPG, PNG, WebP · 장당 최대 20MB</legend>
            {[0, 1, 2].map((index) => (
              <div className="compose-slot" key={index}>
                <div className="compose-slot-header">
                  <span><strong>{index + 1}번 이미지</strong> {index === 0 ? '편집 대상' : '참조 이미지 (선택)'}</span>
                  {index > images.length && <small>이전 이미지를 먼저 추가해 주세요</small>}
                </div>
                <ImageUploadPreview
                  file={images[index]?.file}
                  previewUrl={images[index]?.url}
                  onFileSelect={(selected) => select(index, selected)}
                  onInvalidFile={setError}
                  disabled={loading || index > images.length}
                />
                {images[index] && index === images.length - 1 && <button type="button" className="restyle-chip" onClick={removeLast}>{index + 1}번 삭제</button>}
              </div>
            ))}
            <p className="angle-description">이미지는 1번부터 순서대로 추가해 주세요. 번호가 바뀌지 않도록 삭제는 마지막 이미지부터 가능합니다.</p>
            <div className="restyle-prompt-section">
              <label htmlFor="compose-prompt" className="restyle-section-label">어떻게 합성할까요?</label>
              <textarea id="compose-prompt" className="restyle-prompt-textarea" rows={5} value={prompt} maxLength={4000}
                onChange={(event) => setPrompt(event.target.value)} placeholder="예: 1번 의자 사진에 2번 사람을 앉혀줘" />
              <div className="restyle-suggestion-wrap"><span className="suggestion-title">예시 프롬프트</span>
                <div className="restyle-chips-grid">{EXAMPLES.map((example, index) => <button key={example} type="button" className="restyle-chip" onClick={() => setPrompt(example)}>{['사람 합성', '재질 교체', '공간 + 가구 + 재질'][index]}</button>)}</div>
              </div>
            </div>
          </fieldset>
        </div>
        <div className="panel-footer"><button type="button" className="generate-btn" onClick={generate} disabled={loading || !images.length || !prompt.trim()}>{loading ? '이미지 합성 중...' : '이미지 생성'}</button></div>
      </section>
      <ImagePreviewPanel
        resultCount={results.length}
        isLoading={loading}
        loadingTitle="참조 이미지를 바탕으로 합성하고 있습니다"
        loadingIcon="photo_library"
        loadingSteps={['이미지 생성 결과를 기다리고 있습니다. 잠시만 기다려 주세요.']}
        notice={error ? <p className="compose-error" role="alert">{error}</p> : null}
        bodyClassName="restyle-result-body"
      >
        {results.length ? <div className="comparison-results-grid">{results.map((item, index) => (
          <ComparisonResultCard key={item.id} originalUrl={item.originalUrl} resultUrl={item.image_url}
            title={`합성 결과 ${results.length - index}`} meta={item.prompt} filename={item.filename}
            onDownload={() => downloadFileFromUrl(item.image_url, item.filename || 'composition.png')}
            onDelete={() => removeResult(item.id)} />
        ))}</div> : (
          <PreviewPlaceholder
            icon="photo_library"
            title="이미지와 지시문으로 새로운 장면을 만들어 보세요"
            description="1~3장의 이미지를 업로드하고 번호를 사용해 원하는 작업을 알려 주세요."
          />
        )}
      </ImagePreviewPanel>
    </div>
  );
}
