import React, { useState } from 'react';
import ImageUploadPreview from '../common/ImageUploadPreview';
import ImageDetailModal from '../common/ImageDetailModal';
import ImagePreviewPanel, { PreviewPlaceholder } from './ImagePreviewPanel';
import { aiApi } from '../../api';
import { downloadFileFromUrl } from '../../utils/downloadUtils';

const ANGLES = [
  ['front_view', '정면 샷'],
  ['close_up', '클로즈업'], ['wide_shot', '와이드 앵글'], ['45_right', '오른쪽 45°'], ['90_right', '오른쪽 90°'],
  ['aerial_view', '항공 뷰'], ['low_angle', '로우 앵글'], ['45_left', '왼쪽 45°'], ['90_left', '왼쪽 90°'],
];

export default function MultipleAngleView({ embedded, pageName, bucketName }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [images, setImages] = useState([]);
  const [selectedAngles, setSelectedAngles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailImage, setDetailImage] = useState(null);

  const selectFile = (selected) => {
    if (!selected || !selected.type.startsWith('image/')) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError('');
  };

  const generate = async () => {
    if (!file) return setError('각도를 생성할 원본 이미지를 업로드해 주세요.');
    if (!selectedAngles.length) return setError('생성할 각도를 하나 이상 선택해 주세요.');
    setLoading(true);
    setError('');
    try {
      const response = await aiApi.generateMultipleAngles(file, { pageName, bucketName, angles: selectedAngles });
      if (!response.images?.length) throw new Error('ComfyUI가 생성 이미지를 반환하지 않았습니다.');
      setImages((current) => [...response.images, ...current]);
    } catch (err) {
      setError(err.message || '다양한 각도 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const [downloadingAll, setDownloadingAll] = useState(false);

  const handleDownloadAll = async () => {
    if (!images.length || downloadingAll) return;
    setDownloadingAll(true);
    try {
      for (let idx = 0; idx < images.length; idx++) {
        const img = images[idx];
        const filename = img.filename || `${img.label || `angle_${idx + 1}`}.png`;
        await downloadFileFromUrl(img.url, filename);
        if (idx < images.length - 1) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <div className={`multiple-angle-layout${embedded ? ' embedded' : ''}`}>
      {/* 좌측 설정 패널 */}
      <section className="angle-upload-card glass-card">
        <div className="panel-header">
          <h3>다양한 각도 생성</h3>
          <span className="api-badge">ComfyUI</span>
        </div>

        <div className="panel-scroll-content">
          <p className="angle-description">
            한 장의 원본으로 다양한 카메라 구도를 생성합니다. 제품 또는 인물이 선명하게 보이는 이미지를 사용해 주세요.
          </p>

          {/* 이미지 업로드 및 미리보기 박스 */}
          <ImageUploadPreview
            file={file}
            previewUrl={preview}
            onFileSelect={selectFile}
            onInvalidFile={setError}
          />

          {/* 각도 선택 */}
          <div className="angle-selection-header">
            <span>생성할 각도 선택</span>
            <button
              type="button"
              onClick={() => {
                setError('');
                setSelectedAngles(selectedAngles.length === ANGLES.length ? [] : ANGLES.map(([key]) => key));
              }}
            >
              {selectedAngles.length === ANGLES.length ? '전체 해제' : '전체 선택'}
            </button>
          </div>

          <div className="angle-guide-list">
            {ANGLES.map(([key, label]) => (
              <button
                type="button"
                key={key}
                className={selectedAngles.includes(key) ? 'selected' : ''}
                onClick={() => {
                  setError('');
                  setSelectedAngles((current) =>
                    current.includes(key) ? current.filter((angle) => angle !== key) : [...current, key]
                  );
                }}
              >
                <span className="material-symbols-outlined">
                  {selectedAngles.includes(key) ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="panel-footer">
          <button
            className="generate-btn"
            onClick={generate}
            disabled={loading || !selectedAngles.length}
          >
            {loading
              ? '선택한 각도를 생성하고 있습니다...'
              : `${selectedAngles.length}개 각도 생성하기`}
          </button>
        </div>
      </section>

      <ImagePreviewPanel
        resultCount={images.length}
        headerActions={images.length > 0 ? (
          <button
            type="button"
            className="btn-download-result"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            onClick={handleDownloadAll}
            disabled={downloadingAll}
          >
            <span className={`material-symbols-outlined ${downloadingAll ? 'spinning' : ''}`} style={{ fontSize: '15px' }}>
              {downloadingAll ? 'sync' : 'download'}
            </span>
            {downloadingAll ? '다운로드 중...' : '전체 다운로드'}
          </button>
        ) : null}
        isLoading={loading}
        loadingTitle="다양한 각도 렌더링 중"
        loadingIcon="360"
        loadingSteps={[
          '이미지 3D 공간 및 피사체 구조 분석 중...',
          '카메라 앵글 및 원근 좌표 매핑 중...',
          '선택된 각도별 고화질 렌더링 중...',
          '최종 해상도 최적화 및 결과 생성 중...',
        ]}
        errorMessage={error}
        errorTitle="생성 오류"
      >
          {images.length ? (
            <div className="angle-result-grid">
              {images.map((image) => (
                <div
                  key={image.url}
                  onClick={() => downloadFileFromUrl(image.url, image.filename || `${image.label || 'angle'}.png`)}
                  className="angle-result-item"
                  title={`${image.label || image.filename} (클릭하여 이미지 다운로드)`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      downloadFileFromUrl(image.url, image.filename || `${image.label || 'angle'}.png`);
                    }
                  }}
                >
                  <div className="angle-result-image-box">
                    <img src={image.url} alt={image.label || '생성된 다양한 각도'} />
                  </div>
                  <div className="angle-result-header">
                    <span>{image.label || image.filename}</span>
                    <div className="angle-result-actions">
                      <button type="button" onClick={(event) => {
                        event.stopPropagation();
                        setDetailImage(image);
                      }}>
                        <span className="material-symbols-outlined">zoom_out_map</span>자세히
                      </button>
                      <span className="angle-result-badge">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>download</span>
                        다운로드
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <PreviewPlaceholder
              title="이미지를 업로드해 주세요"
              description="좌측에서 원본 이미지와 생성할 각도를 선택하면 결과가 이곳에 표시됩니다."
            />
          )}
      </ImagePreviewPanel>
      <ImageDetailModal imageUrl={detailImage?.url} title={detailImage?.label || detailImage?.filename}
        alt={`${detailImage?.label || '다양한 각도 결과'} 상세 이미지`} onClose={() => setDetailImage(null)} />
    </div>
  );
}
