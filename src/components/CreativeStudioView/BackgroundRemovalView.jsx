import React, { useEffect, useRef, useState } from 'react';
import ComparisonResultCard from '../common/ComparisonResultCard';
import { aiApi } from '../../api';
import { downloadFileFromUrl } from '../../utils/downloadUtils';
import BackgroundRemovalControlPanel from './BackgroundRemovalControlPanel';
import ImagePreviewPanel, { PreviewPlaceholder } from './ImagePreviewPanel';

const SAMPLE_BEFORE_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop';
function BackgroundRemovalView({ embedded = false }) {
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  const [shadowMode, setShadowMode] = useState('ai.soft');
  const [shadowDirection, setShadowDirection] = useState('behindRight');
  const [shadowSpread, setShadowSpread] = useState('medium');
  const [shadowSoftness, setShadowSoftness] = useState(0.3);
  const [shadowIntensity, setShadowIntensity] = useState(0.8);
  const [padding, setPadding] = useState(0.12);


  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const resultUrls = useRef(new Set());
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => () => resultUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);


  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrl('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUrlChange = (value) => {
    setImageUrl(value);
    if (value) {
      setFile(null);
      setFilePreview('');
    }
  };

  const handleGenerate = async () => {
    setErrorMessage('');
    const inputSrc = imageUrl || filePreview;
    if (!inputSrc) {
      setErrorMessage('가공할 원본 이미지를 업로드하거나 절대 경로 URL을 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    try {
      let finalImageUrl = imageUrl;
      if (!finalImageUrl && filePreview) {
        finalImageUrl = filePreview;
      }

      const payload = {
        image_url: finalImageUrl,
        shadow_mode: shadowMode,
        shadow_direction: shadowDirection,
        shadow_spread: shadowSpread,
        shadow_softness: shadowSoftness,
        shadow_intensity: shadowIntensity,
        padding: padding,
      };

      const resultBlob = await aiApi.processPhotoRoom(payload);
      const nextImage = URL.createObjectURL(resultBlob);
      resultUrls.current.add(nextImage);
      setResults((current) => [{
        id: `${Date.now()}-${nextImage}`,
        resultUrl: nextImage,
        originalUrl: inputSrc,
        filename: file ? `photoroom_${file.name}` : `photoroom_${Date.now()}.png`,
        meta: `여백 ${Math.round(padding * 100)}%`,
      }, ...current]);
    } catch (error) {
      console.error('PhotoRoom AI 가공 실패:', error);
      setErrorMessage(`PhotoRoom 소재 제작 오류: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResult = (resultId) => {
    setResults((current) => {
      const removed = current.find((item) => item.id === resultId);
      const next = current.filter((item) => item.id !== resultId);

      if (removed?.resultUrl) {
        URL.revokeObjectURL(removed.resultUrl);
        resultUrls.current.delete(removed.resultUrl);
      }

      return next;
    });
  };

  return (
    <div className={`multiple-angle-layout remove-bg-layout${embedded ? ' embedded' : ''}`}>
      <BackgroundRemovalControlPanel
          file={file}
          imageUrl={imageUrl}
          filePreview={filePreview}
          shadowMode={shadowMode}
          shadowDirection={shadowDirection}
          shadowSpread={shadowSpread}
          shadowSoftness={shadowSoftness}
          shadowIntensity={shadowIntensity}
          padding={padding}
          isLoading={isLoading}
          onFileSelect={handleFileSelect}
          onUrlChange={handleUrlChange}
          setShadowMode={setShadowMode}
          setShadowDirection={setShadowDirection}
          setShadowSpread={setShadowSpread}
          setShadowSoftness={setShadowSoftness}
          setShadowIntensity={setShadowIntensity}
          setPadding={setPadding}
          onGenerate={handleGenerate}
        />

      <ImagePreviewPanel
        resultCount={results.length}
        isLoading={isLoading}
        loadingTitle="PhotoRoom AI 이미지 가공 중"
        loadingIcon="auto_fix_high"
        loadingSteps={[
          '피사체 3D 바닥면 및 외곽선 정밀 인식 중...',
          'PhotoRoom v2 AI 그림자 모델 렌더링 중...',
          '선택한 방향 및 입체 원근 음영 합성 중...',
          '결과 이미지 최적화 및 전송 중...',
        ]}
        errorMessage={errorMessage}
        onClearError={() => setErrorMessage('')}
        bodyClassName="rmbg-result-body"
      >
        {results.length ? (
          <div className="comparison-results-grid">
            {results.map((item, index) => (
              <ComparisonResultCard
                key={item.id}
                originalUrl={item.originalUrl}
                resultUrl={item.resultUrl}
                title={`PhotoRoom 결과 ${results.length - index}`}
                meta={item.meta}
                filename={item.filename}
                resultClassName="alpha-pattern"
                onDownload={() => downloadFileFromUrl(item.resultUrl, item.filename)}
                onDelete={() => handleDeleteResult(item.id)}
              />
            ))}
          </div>
        ) : (
          <PreviewPlaceholder
            icon="layers_clear"
            title="이미지를 업로드하고 실행해 주세요"
            description="좌측에서 원본 이미지를 업로드하고 그림자 옵션을 선택해 주세요."
          >
            <div className="placeholder-sample-btn-wrapper" style={{ marginTop: '14px' }}>
              <button
                type="button"
                className="btn-sample-load"
                onClick={() => {
                  setFilePreview(SAMPLE_BEFORE_IMAGE);
                  setFile({ name: 'sample_sofa_source.png', size: 120400 });
                }}
              >
                샘플 가구 이미지 불러오기
              </button>
            </div>
          </PreviewPlaceholder>
        )}
      </ImagePreviewPanel>
    </div>
  );
}

export default BackgroundRemovalView;
