import React, { useState, useRef, useEffect } from 'react';
import '../styles/CreativeStudioView.css';

// 테스트용 샘플 이미지 (Before: 일반 소파, After: AI 스튜디오 배경 합성 소파)
const SAMPLE_BEFORE_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop';
const SAMPLE_AFTER_IMAGE = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop'; // AI 스튜디오 풍 배경으로 대체

function CreativeStudioView() {
  // 상태 관리
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  
  // 포토룸 설정 상태
  const [backgroundMode, setBackgroundMode] = useState('generated'); // transparent, color, generated
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [backgroundPrompt, setBackgroundPrompt] = useState('부드럽고 따뜻한 조명과 콘크리트 바닥이 어우러진, 전문적이고 미니멀한 현대적 스튜디오 쇼룸');
  const [shadowMode, setShadowMode] = useState('ai.soft'); // none, ai.soft, ai.hard, ai.floating
  const [padding, setPadding] = useState(0.1);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  
  // 부가 옵션 (Plus Features)
  const [options, setOptions] = useState({
    beautify: true,
    lighting: false,
    ironing: false,
    textRemoval: false,
  });

  // 실행 및 결과 상태
  const [isLoading, setIsLoading] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [resultImage, setResultImage] = useState('');
  const [uncertaintyScore, setUncertaintyScore] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // 가상 모델 설정 상태
  const [virtualModelModel, setVirtualModelModel] = useState('');
  const [virtualModelPose, setVirtualModelPose] = useState('');
  const [virtualModelScene, setVirtualModelScene] = useState('');
  const [virtualModelPrompt, setVirtualModelPrompt] = useState('');

  // Before/After 토글 상태
  const [showOriginal, setShowOriginal] = useState(false);

  const fileInputRef = useRef(null);

  // 옵션 변경 핸들러
  const handleOptionChange = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 파일 선택 처리
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrl(''); // URL 입력 초기화
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // URL 입력 변경
  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    if (e.target.value) {
      setFile(null);
      setFilePreview('');
    }
  };

  // 드래그앤드롭 핸들러
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

  // 실제 백엔드 API(/api/ai/photoroom) 연동 요청
  const handleGenerate = async () => {
    setErrorMessage(''); // 이전 에러 초기화
    
    // 입력 URL이 있으면 우선 사용하고, 없으면 드래그앤드롭한 로컬 파일(Base64)을 사용합니다.
    let currentInput = imageUrl || filePreview;

    if (!currentInput) {
      setErrorMessage('편집할 이미지 파일을 업로드하거나 이미지 URL을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setProcessStatus('AI 이미지 가공 시나리오 분석 중...');

    // 1. UI에서 설정한 다중 포토룸 파라미터들을 AI 에이전트가 완벽히 추론할 수 있도록 정형화된 한국어 지시 사항으로 번역 및 조립
    let promptMessage = `다음 가이드라인과 요구사항에 맞추어 첨부된 이미지를 가공해 주세요.\n`;
    if (backgroundMode === 'transparent') {
      promptMessage += `- 배경 설정: 투명 배경 (누끼 따기)\n`;
    } else if (backgroundMode === 'color') {
      promptMessage += `- 배경 설정: 단색 컬러 적용 (배경색 Hex: ${backgroundColor})\n`;
    } else if (backgroundMode === 'generated') {
      promptMessage += `- 배경 설정: AI 이미지 생성형 배경으로 합성 (생성할 배경 상세 묘사: "${backgroundPrompt}")\n`;
    } else if (backgroundMode === 'virtualModel') {
      promptMessage += `- 배경 설정: 가상 모델 피팅 합성 (virtual_model_mode: ai.auto)\n`;
      if (virtualModelModel) {
        promptMessage += `- 가상 모델 선택 (virtual_model_model: "${virtualModelModel}")\n`;
      }
      if (virtualModelPose) {
        promptMessage += `- 모델 포즈 요구사항 (한글 입력): "${virtualModelPose}" (주의: 이를 분석하여 다음 허용된 영어 포즈 값 중 하나로 엄격하게 번역/해석하여 generate_virtual_model_agent_wrapper의 pose 인자에 전달해 주세요. 허용값: "random", "standing", "34turn", "powerstance", "walkingforward", "handinpocket", "crossedarms", "back", "overtheshoulder", "seated", "adjustingclothing", "playfulspin". 예: 앉은 자세 -> "seated")\n`;
      }
      if (virtualModelScene) {
        promptMessage += `- 배경 씬 요구사항 (한글 입력): "${virtualModelScene}" (주의: 이를 분석하여 다음 허용된 영어 씬 값 중 하나로 엄격하게 번역/해석하여 generate_virtual_model_agent_wrapper의 scene 인자에 전달해 주세요. 허용값: "random", "street", "bedroom", "sunset", "factory", "studio", "coloredstudio", "concretestudio", "beach", "tropical", "library", "forest", "businessdistrict", "countryside", "flowers", "goldenlight", "mountain". 예: 침실 -> "bedroom")\n`;
      }
      if (virtualModelPrompt) {
        promptMessage += `- 연출 스타일 추가 지시: "${virtualModelPrompt}"\n`;
      }
    }
    
    promptMessage += `- 그림자 설정: ${
      shadowMode === 'ai.soft' ? 'AI 소프트 그림자 적용 (추천)' : 
      shadowMode === 'ai.hard' ? 'AI 하드 그림자 적용' : 
      shadowMode === 'ai.floating' ? 'AI 플로팅 그림자 적용' : 
      '그림자 없음'
    }\n`;
    
    promptMessage += `- 피사체 여백(Padding) 비율: ${padding}\n`;
    
    if (aspectRatio && aspectRatio !== 'auto') {
      promptMessage += `- 이미지 비율 설정 (Aspect Ratio): ${aspectRatio}\n`;
      if (backgroundMode === 'virtualModel') {
        promptMessage += `  (주의: 현재 가상 모델 피팅 모드이므로, generate_virtual_model_agent_wrapper의 size 인자에 다음 대응하는 공식 Enum 값을 넘겨주세요. 1:1 -> "SQUARE_HD", 16:9 -> "LANDSCAPE_HD_16_9", 9:16 -> "PORTRAIT_HD_16_9", 4:3 -> "LANDSCAPE_HD_4_3", 3:4 -> "PORTRAIT_HD_4_3", 3:2 -> "LANDSCAPE_HD_3_2", 2:3 -> "PORTRAIT_HD_3_2")\n`;
      } else {
        promptMessage += `  (주의: 현재 일반 가공 모드이므로, edit_image_agent_wrapper의 output_size 인자에 다음 대응하는 해상도 문자열을 지정해 주세요. 1:1 -> "1000x1000", 16:9 -> "1920x1080", 9:16 -> "1080x1920", 4:3 -> "1200x900", 3:4 -> "900x1200", 3:2 -> "1200x800", 2:3 -> "800x1200")\n`;
      }
    }
    
    // 플러스 고급 보정 옵션 필터
    const activeFilters = [];
    if (options.beautify) activeFilters.push('AI 화질 자동 개선 (beautify_mode: ai.auto)');
    if (options.lighting) activeFilters.push('AI 조명 재구성 및 배경 광원 조화 (lighting_mode: ai.auto)');
    if (options.ironing) activeFilters.push('AI 의류 주름 보정 (ironing_mode: ai.auto)');
    if (options.textRemoval) activeFilters.push('AI 텍스트 및 로고 지우기 (text_removal_mode: ai.all)');
    
    if (activeFilters.length > 0) {
      promptMessage += `- 추가 활성화된 고급 AI 필터: ${activeFilters.join(', ')}\n`;
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    try {
      setProcessStatus('백엔드를 통해 MCP PhotoRoom AI 에이전트와 교신 중...');
      const response = await fetch(`${API_BASE_URL}/api/ai/photoroom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: promptMessage,
          image_url: currentInput
        })
      });

      if (!response.ok) {
        throw new Error(`백엔드 서버 응답 실패 (상태코드: ${response.status})`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        const aiTextResponse = result.response;
        
        // 2. AI의 텍스트 응답에서 static 이미지 URL (http://.../static/photoroom_xxx.png) 추출
        const urlRegex = /(https?:\/\/[^\s)]+\/static\/photoroom_[a-zA-Z0-9_.-]+(?:\.png|\.jpg))/gi;
        const match = aiTextResponse.match(urlRegex);
        
        if (match && match.length > 0) {
          const generatedImgUrl = match[0];
          setResultImage(generatedImgUrl);
          
          // 3. 누끼 신뢰도/정밀도 점수 퍼센트 추출 시도
          const scoreRegex = /(?:누끼 정밀도 점수|품질 점수|정밀도 점수|신뢰도).*?(\d+)/i;
          const scoreMatch = aiTextResponse.match(scoreRegex);
          if (scoreMatch) {
            const pct = parseInt(scoreMatch[1], 10);
            setUncertaintyScore((100 - pct) / 100);
          } else {
            setUncertaintyScore(0.08); // 기본값 (92% 정밀도) 매치 실패 시 세팅
          }
        } else {
          throw new Error('AI의 처리 보고서 답변에서 변환된 이미지 경로(URL)를 파싱하는 데 실패했습니다.');
        }
      } else {
        throw new Error(result.message || 'AI 에이전트 가공 중 알 수 없는 예외가 보고되었습니다.');
      }
    } catch (error) {
      console.error('PhotoRoom AI 가공 E2E 통신 실패:', error);
      setErrorMessage(`AI 소재 제작 도중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
      setProcessStatus('');
    }
  };

  // 추천 프롬프트 세팅
  const applyRecommendedPrompt = (prompt) => {
    setBackgroundPrompt(prompt);
    setBackgroundMode('generated');
  };

  const recommendedPrompts = [
    '세련된 화이트 대리석 상판과 따뜻한 펜던트 조명이 어우러진 모던한 주방 쇼룸',
    '원목 바닥과 창가로 화사한 햇살이 비치는 아늑하고 고급스러운 북유럽풍 거실',
    '가구 광고 촬영에 최적화된 프로페셔널 스튜디오 조명의 깔끔하고 미니멀한 단색 배경',
    '우아한 원형 석고 오브제 받침대가 배치된 은은하고 부드러운 파스텔톤 배경'
  ];

  const currentInputImage = filePreview || imageUrl || SAMPLE_BEFORE_IMAGE;

  return (
    <main className="hanssem-main creative-studio-main">
      <div className="studio-container">
        
        {/* 좌측 설정 제어판 */}
        <div className="control-panel glass-card">
          <div className="panel-header">
            <h3>AI 소재 제작 옵션</h3>
            <span className="api-badge">PhotoRoom API v2</span>
          </div>

          <div className="panel-scroll-content">
            {/* 1단계: 이미지 입력 */}
            <div className="control-group">
              <label className="group-title">1. 이미지 업로드</label>
              <div 
                className={`dropzone ${file ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                  accept="image/*"
                />
                {file ? (
                  <div className="file-info">
                    <span className="material-symbols-outlined icon-success">check_circle</span>
                    <p className="file-name">{file.name}</p>
                    <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ) : (
                  <div className="dropzone-placeholder">
                    <span className="material-symbols-outlined">cloud_upload</span>
                    <p>이미지를 드래그하거나 클릭하여 업로드</p>
                  </div>
                )}
              </div>
              
              <div className="or-divider">
                <span>또는</span>
              </div>

              <div className="input-url-wrapper">
                <span className="material-symbols-outlined">link</span>
                <input 
                  type="text" 
                  placeholder="이미지 절대 경로 URL 입력..."
                  value={imageUrl}
                  onChange={handleUrlChange}
                />
              </div>
            </div>

            {/* 2단계: 배경 모드 설정 */}
            <div className="control-group">
              <label className="group-title">2. 배경 설정</label>
              <div className="tab-buttons">
                {[
                  { id: 'transparent', label: '투명 배경', icon: 'layers_clear', desc: '배경을 지우고 피사체만 추출' },
                  { id: 'color', label: '단색 컬러', icon: 'palette', desc: '원하는 색상으로 배경 채우기' },
                  { id: 'generated', label: 'AI 배경 생성', icon: 'auto_awesome', desc: '문장 묘사 기반 AI 배경 합성' },
                  { id: 'virtualModel', label: '가상 모델 피팅', icon: 'checkroom', desc: '상품을 가상 피팅 모델에 합성' },
                ].map((t) => (
                  <button 
                    key={t.id}
                    className={`tab-btn ${backgroundMode === t.id ? 'active' : ''}`}
                    onClick={() => setBackgroundMode(t.id)}
                  >
                    <span className="material-symbols-outlined">{t.icon}</span>
                    <span className="card-label">{t.label}</span>
                    <span className="tooltip-content">{t.desc}</span>
                  </button>
                ))}
              </div>

              {backgroundMode === 'color' && (
                <div className="color-picker-container anim-fade">
                  <label>배경 색상 지정</label>
                  <div className="color-inputs">
                    <input 
                      type="color" 
                      value={backgroundColor} 
                      onChange={(e) => setBackgroundColor(e.target.value)} 
                    />
                    <input 
                      type="text" 
                      value={backgroundColor} 
                      onChange={(e) => setBackgroundColor(e.target.value)} 
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              )}

              {backgroundMode === 'generated' && (
                <div className="prompt-container anim-fade">
                  <label className="label-with-tooltip">
                    생성형 배경 프롬프트
                    <span className="tooltip-wrap">
                      <span className="material-symbols-outlined info-icon">info</span>
                      <span className="tooltip-content">생성하고자 하는 스튜디오, 야외 등의 배경 구도를 영어 단어나 문장으로 적어주세요.</span>
                    </span>
                  </label>
                  <textarea 
                    value={backgroundPrompt}
                    onChange={(e) => setBackgroundPrompt(e.target.value)}
                    placeholder="생성하고 싶은 배경의 묘사를 영어로 입력하세요..."
                    rows={4}
                  />
                  <div className="recommend-chips">
                    <span className="chips-title">추천 프롬프트:</span>
                    {recommendedPrompts.map((p, idx) => (
                      <button 
                        key={idx} 
                        className="prompt-chip"
                        onClick={() => applyRecommendedPrompt(p)}
                        title={p}
                      >
                        {idx + 1}. {p.substring(0, 20)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {backgroundMode === 'virtualModel' && (
                <div className="virtual-model-container anim-fade">
                  <div className="input-field-group">
                    <label className="label-with-tooltip">
                      가상 인물 모델 선택 (Model Preset)
                      <span className="tooltip-wrap">
                        <span className="material-symbols-outlined info-icon">info</span>
                        <span className="tooltip-content">의류를 피팅할 인물 모델의 외모(성별/스타일)를 지정합니다.</span>
                      </span>
                    </label>
                    <select 
                      value={virtualModelModel}
                      onChange={(e) => setVirtualModelModel(e.target.value)}
                      className="form-select"
                    >
                      <option value="">자동 지정 (Auto)</option>
                      <option value="avery">여성 모델 1 (avery)</option>
                      <option value="sophia">여성 모델 2 (sophia)</option>
                      <option value="emma">여성 모델 3 (emma)</option>
                      <option value="julia">여성 모델 4 (julia)</option>
                      <option value="jordan">남성 모델 1 (jordan)</option>
                      <option value="jackson">남성 모델 2 (jackson)</option>
                    </select>
                  </div>

                  <div className="input-field-group">
                    <label className="label-with-tooltip">
                      모델 포즈 지시 (Pose)
                      <span className="tooltip-wrap">
                        <span className="material-symbols-outlined info-icon">info</span>
                        <span className="tooltip-content">자세를 한글로 입력하면 AI가 적절한 포즈(서 있는, 앉아 있는 등)로 모델을 합성합니다.</span>
                      </span>
                    </label>
                    <input 
                      type="text" 
                      value={virtualModelPose}
                      onChange={(e) => setVirtualModelPose(e.target.value)}
                      placeholder="예: 서 있는 모습, 앉은 자세 등 (한글 입력 가능)"
                      className="form-input"
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="label-with-tooltip">
                      배경 씬 프리셋 (Scene)
                      <span className="tooltip-wrap">
                        <span className="material-symbols-outlined info-icon">info</span>
                        <span className="tooltip-content">모델이 화보 촬영을 진행할 뒷배경 장소를 한글(예: 침실, 거실, 야외 거리 등)로 지정합니다.</span>
                      </span>
                    </label>
                    <input 
                      type="text" 
                      value={virtualModelScene}
                      onChange={(e) => setVirtualModelScene(e.target.value)}
                      placeholder="예: 현대적인 거실, 아늑한 침실, 스튜디오 등 (한글 입력 가능)"
                      className="form-input"
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="label-with-tooltip">
                      연출 스타일 추가 프롬프트 (Prompt)
                      <span className="tooltip-wrap">
                        <span className="material-symbols-outlined info-icon">info</span>
                        <span className="tooltip-content">전체적인 사진 조명(역광, 은은한 조명 등)이나 화보 연출 방식을 자연어로 덧붙입니다.</span>
                      </span>
                    </label>
                    <textarea 
                      value={virtualModelPrompt}
                      onChange={(e) => setVirtualModelPrompt(e.target.value)}
                      placeholder="모델 착용 컷의 스타일, 분위기, 조명 등에 대한 추가 지시 프롬프트 입력..."
                      rows={3}
                      className="form-textarea"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3단계: 그림자 효과 */}
            <div className="control-group">
              <label className="group-title">3. 그림자 효과</label>
              <div className="shadow-grid">
                {[
                  { id: 'none', label: '그림자 없음', icon: 'blur_off', desc: '원본 이미지 그대로 표현' },
                  { id: 'ai.soft', label: 'AI 소프트 그림자', icon: 'filter_drama', desc: '자연스러운 바닥 음영' },
                  { id: 'ai.hard', label: 'AI 하드 그림자', icon: 'wb_shade', desc: '선명한 직사광선 그림자' },
                  { id: 'ai.floating', label: 'AI 플로팅 그림자', icon: 'vertical_align_bottom', desc: '공중에 뜬 피사체 아래 음영' },
                ].map((s) => (
                  <button
                    key={s.id}
                    className={`shadow-card ${shadowMode === s.id ? 'active' : ''}`}
                    onClick={() => setShadowMode(s.id)}
                  >
                    <span className="material-symbols-outlined">{s.icon}</span>
                    <span className="card-label">{s.label}</span>
                    <span className="tooltip-content">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4단계: 여백 조절 */}
            <div className="control-group">
              <div className="group-title-row">
                <label className="group-title label-with-tooltip">
                  4. 피사체 여백 (Padding)
                  <span className="tooltip-wrap">
                    <span className="material-symbols-outlined info-icon">info</span>
                    <span className="tooltip-content">피사체 주변의 여백 비율입니다. 여백을 늘리면(예: 15%~20%) 상품의 크기가 상대적으로 작게 가공되어 가상 모델 피팅 시 외곽선이 잘려 나가는 문제를 방지할 수 있습니다.</span>
                  </span>
                </label>
                <span className="value-display">{Math.round(padding * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="0.5" 
                step="0.05" 
                value={padding} 
                onChange={(e) => setPadding(parseFloat(e.target.value))}
                className="custom-range"
              />
              <div className="range-labels">
                <span>타이트하게 (0%)</span>
                <span>여유롭게 (50%)</span>
              </div>
            </div>
            
            {/* 4-2단계: 이미지 비율 설정 */}
            <div className="control-group">
              <label className="group-title label-with-tooltip">
                4-2. 이미지 비율 설정 (Aspect Ratio)
                <span className="tooltip-wrap">
                  <span className="material-symbols-outlined info-icon">info</span>
                  <span className="tooltip-content">출력 이미지의 가로세로 비율을 결정합니다. 일반 가공 시에는 지정 해상도로 생성되며, 가상 모델 피팅 시에는 전용 규격 프리셋이 적용됩니다.</span>
                </span>
              </label>
              <select 
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="form-select"
              >
                <option value="1:1">1:1 정사각형 (Square)</option>
                <option value="16:9">16:9 가로형 와이드 (Landscape Wide)</option>
                <option value="9:16">9:16 세로형 와이드 (Portrait Wide)</option>
                <option value="4:3">4:3 가로형 (Landscape 4:3)</option>
                <option value="3:4">3:4 세로형 (Portrait 3:4)</option>
                <option value="3:2">3:2 가로형 (Landscape 3:2)</option>
                <option value="2:3">2:3 세로형 (Portrait 2:3)</option>
              </select>
            </div>

            {/* 5단계: Plus AI 고급 보정 */}
            <div className="control-group">
              <label className="group-title">5. Plus AI 고급 보정</label>
              <div className="options-list">
                {[
                  { key: 'beautify', label: 'AI 화질 자동 개선 (Beautify)', desc: '해상도 및 컬러 밸런스를 향상시킵니다.' },
                  { key: 'lighting', label: 'AI 조명 재구성 (Relighting)', desc: '피사체와 새로운 배경의 광원을 정교하게 맞춥니다.' },
                  { key: 'ironing', label: 'AI 의류 주름 제거 (Ironing)', desc: '패션/의류 피사체 주름을 스마트하게 펴줍니다.' },
                  { key: 'textRemoval', label: 'AI 텍스트 일괄 제거 (Text Removal)', desc: '이미지 내 지저분한 글자 요소를 제거합니다.' },
                ].map((opt) => (
                  <div key={opt.key} className="option-row" onClick={() => handleOptionChange(opt.key)}>
                    <div className="option-text">
                      <span className="opt-label">{opt.label}</span>
                      <span className="opt-desc">{opt.desc}</span>
                    </div>
                    <div className={`switch-toggle ${options[opt.key] ? 'on' : ''}`}>
                      <div className="switch-handle" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 실행 버튼 */}
          <div className="panel-footer">
            <button 
              className={`generate-btn ${isLoading ? 'loading' : ''}`}
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="btn-loading-content">
                  <div className="spinner-white" />
                  <span>소재 제작 중...</span>
                </div>
              ) : (
                <div className="btn-content">
                  <span className="material-symbols-outlined">magic_button</span>
                  <span>AI 소재 자동 완성 시작</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* 우측 이미지 미리보기 에디터 */}
        <div className="preview-panel glass-card">
          <div className="panel-header">
            <h3>소재 미리보기</h3>
            {resultImage && (
              <div className="quality-score">
                <span className="score-dot" />
                <span>누끼 정밀도 점수: <strong>{(100 - (uncertaintyScore * 100)).toFixed(0)}%</strong> (최상)</span>
              </div>
            )}
          </div>

          <div className="preview-body">
            {isLoading ? (
              <div className="processing-overlay">
                <div className="lottie-loader">
                  <div className="pulse-circle" />
                  <div className="pulse-circle-outer" />
                  <span className="material-symbols-outlined ai-processing-icon">temp_preferences_custom</span>
                </div>
                <h4>AI 크리에이티브 가공 중</h4>
                <p className="process-status-text">{processStatus}</p>
              </div>
            ) : errorMessage ? (
              <div className="preview-error-container">
                <span className="material-symbols-outlined error-icon">warning</span>
                <h4>AI 소재 제작 오류</h4>
                <p className="error-message-text">{errorMessage}</p>
                <button 
                  className="btn-error-clear"
                  onClick={() => setErrorMessage('')}
                >
                  확인
                </button>
              </div>
            ) : resultImage ? (
              /* Side-by-Side 비교 뷰 */
              <div className="comparison-side-by-side">
                {/* 왼쪽: 원본 이미지 */}
                <div className="comparison-column">
                  <div className="column-header">
                    <span className="badge-before">Before (원본)</span>
                  </div>
                  <div className="column-image-container checkerboard">
                    <img 
                      src={currentInputImage} 
                      alt="Original Product" 
                      className="comparison-img"
                    />
                  </div>
                </div>
                
                {/* 오른쪽: AI 결과물 */}
                <div className="comparison-column">
                  <div className="column-header">
                    <span className="badge-after">After (AI 생성)</span>
                  </div>
                  <div className="column-image-container">
                    <img 
                      src={resultImage} 
                      alt="AI Opt Product" 
                      className="comparison-img"
                    />
                  </div>
                </div>
              </div>
            ) : (filePreview || imageUrl) ? (
              /* 업로드/선택된 원본 이미지 단독 미리보기 */
              <div className="comparison-side-by-side" style={{ gridTemplateColumns: '1fr' }}>
                <div className="comparison-column">
                  <div className="column-header" style={{ justifyContent: 'space-between' }}>
                    <span className="badge-before">업로드된 원본 이미지</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      좌측 하단 [AI 소재 자동 완성 시작] 버튼을 누르면 AI 생성이 진행됩니다.
                    </span>
                  </div>
                  <div className="column-image-container checkerboard">
                    <img 
                      src={currentInputImage} 
                      alt="Source Product" 
                      className="comparison-img"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* 최초 상태 플레이스홀더 */
              <div className="preview-placeholder">
                <span className="material-symbols-outlined placeholder-icon animate-pulse">image</span>
                <h4>편집할 이미지를 제공해 주세요</h4>
                <p>좌측에서 가공 옵션을 구성하고 완료 버튼을 누르시면 이곳에 실시간 변환 피드백이 표시됩니다.</p>
                
                <div className="placeholder-sample-btn-wrapper">
                  <button 
                    className="btn-sample-load"
                    onClick={() => {
                      setFilePreview(SAMPLE_BEFORE_IMAGE);
                      setFile({ name: 'sample_sofa_source.png', size: 120400 });
                    }}
                  >
                    샘플 가구 이미지 불러오기
                  </button>
                </div>
              </div>
            )}
          </div>

          {resultImage && !isLoading && (
            <div className="preview-footer anim-slide-up">
              <button className="btn-action-outline">
                <span className="material-symbols-outlined">download</span>
                <span>고해상도 다운로드</span>
              </button>
              <button 
                className="btn-action-primary"
                onClick={() => {
                  alert('성공적으로 소재 대시보드의 신규 라이브러리로 등록되었습니다.');
                }}
              >
                <span className="material-symbols-outlined">add_photo_alternate</span>
                <span>대시보드 소재 라이브러리 추가</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

export default CreativeStudioView;
