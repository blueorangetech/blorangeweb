import React, { useEffect, useState } from 'react';
import StudioControlPanel from './StudioControlPanel';
import StudioPreviewCanvas from './StudioPreviewCanvas';

import { aiApi } from '../../../api';

const SAMPLE_BEFORE_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop';
function PhotoRoomStudioView({ embedded = false }) {
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  const backgroundMode = 'transparent';
  const backgroundColor = '#FFFFFF';
  const backgroundPrompt = '';
  const [shadowMode, setShadowMode] = useState('ai.soft');
  const [shadowPose, setShadowPose] = useState('upright');
  const [shadowDirection, setShadowDirection] = useState('behindRight');
  const [shadowSpread, setShadowSpread] = useState('medium');
  const [shadowSoftness, setShadowSoftness] = useState(0.3);
  const [shadowIntensity, setShadowIntensity] = useState(0.8);
  const [padding, setPadding] = useState(0.12);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const [options, setOptions] = useState({
    beautify: true,
    lighting: false,
    ironing: false,
    textRemoval: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [resultImage, setResultImage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [virtualModelModel, setVirtualModelModel] = useState('');
  const [virtualModelPose, setVirtualModelPose] = useState('');
  const [virtualModelScene, setVirtualModelScene] = useState('');
  const [virtualModelPrompt, setVirtualModelPrompt] = useState('');

  useEffect(() => () => {
    if (resultImage.startsWith('blob:')) URL.revokeObjectURL(resultImage);
  }, [resultImage]);

  const handleOptionChange = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
        message: backgroundPrompt || '',
        image_url: finalImageUrl,
        background_mode: backgroundMode,
        background_color: backgroundColor,
        background_prompt: backgroundPrompt,
        shadow_mode: shadowMode,
        shadow_pose: shadowPose,
        shadow_direction: shadowDirection,
        shadow_spread: shadowSpread,
        shadow_softness: shadowSoftness,
        shadow_intensity: shadowIntensity,
        padding: padding,
        aspect_ratio: aspectRatio,
        options: options,
        virtual_model: {
          model: virtualModelModel,
          pose: virtualModelPose,
          scene: virtualModelScene,
          prompt: virtualModelPrompt
        }
      };

      const resultBlob = await aiApi.processPhotoRoom(payload);
      setResultImage(URL.createObjectURL(resultBlob));
    } catch (error) {
      console.error('PhotoRoom AI 가공 실패:', error);
      setErrorMessage(`PhotoRoom 소재 제작 오류: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const currentInputImage = filePreview || imageUrl || SAMPLE_BEFORE_IMAGE;

  return (
    <div className={`multiple-angle-layout remove-bg-layout${embedded ? ' embedded' : ''}`}>
      <StudioControlPanel
          file={file}
          imageUrl={imageUrl}
          filePreview={filePreview}
          shadowMode={shadowMode}
          shadowPose={shadowPose}
          shadowDirection={shadowDirection}
          shadowSpread={shadowSpread}
          shadowSoftness={shadowSoftness}
          shadowIntensity={shadowIntensity}
          padding={padding}
          aspectRatio={aspectRatio}
          options={options}
          isLoading={isLoading}
          virtualModelModel={virtualModelModel}
          virtualModelPose={virtualModelPose}
          virtualModelScene={virtualModelScene}
          virtualModelPrompt={virtualModelPrompt}
          onFileSelect={handleFileSelect}
          onUrlChange={handleUrlChange}
          setShadowMode={setShadowMode}
          setShadowPose={setShadowPose}
          setShadowDirection={setShadowDirection}
          setShadowSpread={setShadowSpread}
          setShadowSoftness={setShadowSoftness}
          setShadowIntensity={setShadowIntensity}
          setPadding={setPadding}
          setAspectRatio={setAspectRatio}
          setVirtualModelModel={setVirtualModelModel}
          setVirtualModelPose={setVirtualModelPose}
          setVirtualModelScene={setVirtualModelScene}
          setVirtualModelPrompt={setVirtualModelPrompt}
          onOptionChange={handleOptionChange}
          onGenerate={handleGenerate}
        />

        <StudioPreviewCanvas
          isLoading={isLoading}
          errorMessage={errorMessage}
          resultImage={resultImage}
          currentInputImage={currentInputImage}
          file={file}
          imageUrl={imageUrl}
          backgroundMode={backgroundMode}
          backgroundColor={backgroundColor}
          onClearError={() => setErrorMessage('')}
          onLoadSample={() => {
            setFilePreview(SAMPLE_BEFORE_IMAGE);
            setFile({ name: 'sample_sofa_source.png', size: 120400 });
          }}
        />
    </div>
  );
}

export default PhotoRoomStudioView;
