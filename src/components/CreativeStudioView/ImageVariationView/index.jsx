import { useEffect, useState } from 'react';
import ImageUploadPreview from '../../common/ImageUploadPreview';
import ImageDetailModal from '../../common/ImageDetailModal';
import ImagePreviewPanel, { PreviewPlaceholder } from '../ImagePreviewPanel';
import PlacementGroupSelector from './PlacementGroupSelector';
import usePlacementSelection from './hooks/usePlacementSelection';
import { PLACEMENT_GROUPS, PLACEMENT_SPECS_MAP } from './specs';
import { aiApi } from '../../../api';
import { downloadFileFromUrl } from '../../../utils/downloadUtils';
import '../../../styles/CreativeStudioView.css';
import '../../../styles/VariationStudioView.css';

export default function ImageVariationView({ embedded = false }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const selection = usePlacementSelection(PLACEMENT_GROUPS);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const upload = (selected) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) return setError('JPG, PNG, WebP 이미지를 선택해 주세요.');
    if (selected.size > 20 * 1024 * 1024) return setError('이미지는 최대 20MB까지 업로드할 수 있습니다.');
    setFile(selected); setPreview(URL.createObjectURL(selected)); setError('');
  };
  const generate = async () => {
    if (!file || !selection.selectedPlacementKeys.length) return setError('원본 이미지와 매체 규격을 선택해 주세요.');
    setLoading(true); setError(''); setErrors([]);
    try {
      const response = await aiApi.generateImageVariations(file, selection.selectedPlacementKeys, 'expand');
      setResults(response.images || []); setErrors(response.errors || []);
      if (!response.images?.length) setError('생성된 결과가 없습니다. 아래 오류를 확인해 주세요.');
    } catch (err) { setError(err.message || '이미지 베리에이션 생성에 실패했습니다.'); }
    finally { setLoading(false); }
  };
  return (
    <div className={`multiple-angle-layout${embedded ? ' embedded' : ''}`}>
        <section className="angle-upload-card glass-card">
          <div className="panel-header"><h3>소재 베리에이션</h3><span className="variation-badge">이미지</span></div>
          <div className="panel-scroll-content">
            <p className="angle-description">기존 이미지를 선택한 매체 규격에 맞춰 변환합니다. JPG·PNG·WebP, 최대 20MB.</p>
            <ImageUploadPreview file={file} previewUrl={preview} onFileSelect={upload} onInvalidFile={setError} disabled={loading} />
            <p className="expand-help-text">원본을 비율에 맞춰 배치하고 빈 공간을 AI로 확장합니다.</p>
            <fieldset disabled={loading} style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="rmbg-section-label">매체 및 규격 선택</legend>
              <PlacementGroupSelector placementGroups={PLACEMENT_GROUPS} {...selection} />
            </fieldset>
          </div>
          <div className="panel-footer"><button className="generate-btn" disabled={loading || !file || !selection.selectedPlacementKeys.length} onClick={generate}>
            {loading ? '소재 베리에이션 생성 중...' : `${selection.selectedPlacementKeys.length}개 규격 생성`}
          </button></div>
        </section>
        <ImagePreviewPanel resultCount={results.length} isLoading={loading}
          loadingTitle="소재 베리에이션 생성 중" loadingIcon="resize"
          loadingSteps={['원본 이미지와 매체 규격 확인 중...', '매체별 배경 확장 중...', '결과 이미지 준비 중...']}
          errorMessage={error} onClearError={() => setError('')}
          notice={errors.length > 0 && <div style={{ padding: '12px 20px' }}>
            {errors.map((item) => <p role="alert" key={item.key}>{PLACEMENT_SPECS_MAP.find((s) => s.key === item.key)?.format}: {item.message}</p>)}
          </div>}>
          {results.length ? <div className="angle-result-grid">
            {results.map((item) => {
              const spec = PLACEMENT_SPECS_MAP.find((s) => s.key === item.key);
              return <article className="angle-result-item" key={item.key}>
                <div className="angle-result-image-box"><img src={item.url} alt={spec?.format} /></div>
                <div className="angle-result-header"><span>{spec?.channel} · {item.width} × {item.height}</span></div>
                <p style={{ padding: '0 12px' }}>{spec?.format}</p>
                <div className="angle-result-actions" style={{ padding: 12 }}>
                  <button onClick={() => setDetail({ ...item, label: spec?.format })}>자세히</button>
                  <button onClick={() => downloadFileFromUrl(item.url, item.filename)}>PNG 다운로드</button>
                </div>
              </article>;
            })}
          </div> : <PreviewPlaceholder title="이미지를 업로드해 주세요"
            description="좌측에서 원본 이미지와 매체 규격을 선택하면 결과가 이곳에 표시됩니다." />}
        </ImagePreviewPanel>
      <ImageDetailModal imageUrl={detail?.url} title={detail?.label} onClose={() => setDetail(null)} />
    </div>
  );
}
