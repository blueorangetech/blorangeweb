import React, { useState, useRef } from 'react';
import StudioControlPanel from './StudioControlPanel';
import StudioPreviewCanvas from './StudioPreviewCanvas';
import '../../styles/CreativeStudioView.css';
import { aiApi } from '../../api';

const SAMPLE_BEFORE_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop';
const SAMPLE_AFTER_IMAGE = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop';

function CreativeStudioView({ onGoToLibrary, embedded = false, pageName = 'playground', bucketName }) {
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  const [backgroundMode, setBackgroundMode] = useState('generated');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [backgroundPrompt, setBackgroundPrompt] = useState('');
  const [shadowMode, setShadowMode] = useState('ai.soft');
  const [padding, setPadding] = useState(0);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const [options, setOptions] = useState({
    beautify: true,
    lighting: false,
    ironing: false,
    textRemoval: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [resultImage, setResultImage] = useState('');
  const [uncertaintyScore, setUncertaintyScore] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [virtualModelModel, setVirtualModelModel] = useState('');
  const [virtualModelPose, setVirtualModelPose] = useState('');
  const [virtualModelScene, setVirtualModelScene] = useState('');
  const [virtualModelPrompt, setVirtualModelPrompt] = useState('');

  const fileInputRef = useRef(null);

  const handleOptionChange = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
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

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    if (e.target.value) {
      setFile(null);
      setFilePreview('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setImageUrl('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(droppedFile);
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
    setProcessStatus('PhotoRoom AI 엔진 연결 중...');

    try {
      let finalImageUrl = imageUrl;
      if (!finalImageUrl && filePreview) {
        finalImageUrl = filePreview;
      }

      setProcessStatus('AI 피사체 추출 및 스튜디오 배경 연출 중...');

      const payload = {
        message: backgroundPrompt || '',
        image_url: finalImageUrl,
        page_name: pageName,
        bucket_name: bucketName || undefined,
        background_mode: backgroundMode,
        background_color: backgroundColor,
        background_prompt: backgroundPrompt,
        shadow_mode: shadowMode,
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

      const result = await aiApi.processPhotoRoom(payload);

      if (result.status === 'success') {
        const aiTextResponse = result.response || '';
        const imgRegex = /(https?:\/\/[^\s"'<>\)]+\.(?:png|jpg|jpeg|webp))/gi;
        const match = aiTextResponse.match(imgRegex);

        if (match && match.length > 0) {
          setResultImage(match[0]);

          const scoreRegex = /(?:누끼 정밀도 점수|품질 점수|정밀도 점수|신뢰도).*?(\d+)/i;
          const scoreMatch = aiTextResponse.match(scoreRegex);
          if (scoreMatch) {
            const pct = parseInt(scoreMatch[1], 10);
            setUncertaintyScore((100 - pct) / 100);
          } else {
            setUncertaintyScore(0.08);
          }
        } else {
          throw new Error(`AI의 응답에서 이미지 경로(URL)를 파싱하는 데 실패했습니다.`);
        }
      } else {
        throw new Error(result.message || 'AI 에이전트 가공 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('PhotoRoom AI 가공 실패:', error);
      setErrorMessage(`AI 소재 제작 도중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
      setProcessStatus('');
    }
  };

  const applyRecommendedPrompt = (prompt) => {
    setBackgroundPrompt(prompt);
    setBackgroundMode('generated');
  };

  const currentInputImage = filePreview || imageUrl || SAMPLE_BEFORE_IMAGE;

  return (
    <main className={`hanssem-main creative-studio-main${embedded ? ' embedded' : ''}`}>
      <div className={`studio-container${embedded ? ' embedded' : ''}`}>
        <StudioControlPanel
          file={file}
          imageUrl={imageUrl}
          fileInputRef={fileInputRef}
          backgroundMode={backgroundMode}
          backgroundColor={backgroundColor}
          backgroundPrompt={backgroundPrompt}
          shadowMode={shadowMode}
          padding={padding}
          aspectRatio={aspectRatio}
          options={options}
          isLoading={isLoading}
          virtualModelModel={virtualModelModel}
          virtualModelPose={virtualModelPose}
          virtualModelScene={virtualModelScene}
          virtualModelPrompt={virtualModelPrompt}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
          onUrlChange={handleUrlChange}
          setBackgroundMode={setBackgroundMode}
          setBackgroundColor={setBackgroundColor}
          setBackgroundPrompt={setBackgroundPrompt}
          setShadowMode={setShadowMode}
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
          processStatus={processStatus}
          errorMessage={errorMessage}
          resultImage={resultImage}
          uncertaintyScore={uncertaintyScore}
          currentInputImage={currentInputImage}
          filePreview={filePreview}
          imageUrl={imageUrl}
          SAMPLE_BEFORE_IMAGE={SAMPLE_BEFORE_IMAGE}
          onClearError={() => setErrorMessage('')}
          onLoadSample={() => {
            setFilePreview(SAMPLE_BEFORE_IMAGE);
            setFile({ name: 'sample_sofa_source.png', size: 120400 });
          }}
          onGoToLibrary={onGoToLibrary}
        />
      </div>
    </main>
  );
}

export default CreativeStudioView;
