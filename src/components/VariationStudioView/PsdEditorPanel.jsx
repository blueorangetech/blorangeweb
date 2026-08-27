import React, { useMemo, useState } from 'react';
import { aiApi } from '../../api';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const artifactUrl = (url, bucketName, cacheKey = '') => {
  if (!url) return '';
  const absolute = /^https?:\/\//.test(url) ? url : `${API_BASE_URL}${url}`;
  const separator = absolute.includes('?') ? '&' : '?';
  const bucket = bucketName ? `&bucket_name=${encodeURIComponent(bucketName)}` : '';
  return `${absolute}${separator}_=${cacheKey || Date.now()}${bucket}`;
};

function PsdEditorPanel({ document, onDocumentChange, bucketName }) {
  const [instruction, setInstruction] = useState('');
  const [selectedLayers, setSelectedLayers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const editableLayers = useMemo(
    () => document.layers?.filter((layer) => layer.editable) || [], [document.layers]
  );

  const toggleLayer = (id) => setSelectedLayers((current) =>
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
  );

  const revise = async () => {
    if (!instruction.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await aiApi.revisePsd(document.documentId, {
        base_revision: document.revision,
        instruction: instruction.trim(),
        selected_layer_ids: selectedLayers.length ? selectedLayers : null,
        bucket_name: bucketName || null,
      });
      onDocumentChange(result.document);
      setInstruction('');
    } catch (err) {
      setError(err.message || 'PSD 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="psd-editor-panel">
      <div className="psd-editor-preview">
        <img src={artifactUrl(document.previewUrl, bucketName, document.revision)} alt="PSD revision preview" />
        <span>Revision {document.revision}</span>
      </div>
      {document.warnings?.map((warning) => <p className="psd-warning" key={warning}>{warning}</p>)}
      <div className="psd-layer-list">
        <strong>수정 대상 레이어 <small>선택하지 않으면 AI가 판단합니다</small></strong>
        {editableLayers.map((layer) => (
          <label key={layer.id}>
            <input type="checkbox" checked={selectedLayers.includes(layer.id)}
              onChange={() => toggleLayer(layer.id)} />
            <span>{layer.name || layer.id}</span>
            <small>{layer.type}{layer.text ? ` · ${layer.text}` : ''}</small>
          </label>
        ))}
      </div>
      <textarea value={instruction} onChange={(event) => setInstruction(event.target.value)}
        placeholder="예: 가격 문구를 39,900원으로 바꾸고 CTA 레이어를 숨겨줘"
        rows={3} />
      {error && <p className="psd-error-message">{error}</p>}
      <div className="psd-editor-actions">
        <button type="button" onClick={revise} disabled={submitting || !instruction.trim()}>
          {submitting ? 'AI 편집 적용 중...' : '현재 결과를 기반으로 다시 수정'}
        </button>
        <a href={artifactUrl(document.previewUrl, bucketName, document.revision)} download>PNG</a>
        <a href={artifactUrl(document.psdUrl, bucketName, document.revision)}>PSD</a>
      </div>
      {document.revisions?.length > 0 && (
        <div className="psd-revision-history">
          <strong>수정 이력</strong>
          {[...document.revisions].reverse().map((item) => (
            <span key={item.revision}>r{item.revision} · {item.instruction || '직접 수정'}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default PsdEditorPanel;
