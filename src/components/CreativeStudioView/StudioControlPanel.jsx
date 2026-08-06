import React from 'react';

/**
 * CreativeStudioView 좌측 설정 제어판 컴포넌트
 */
function StudioControlPanel({
  file,
  imageUrl,
  fileInputRef,
  backgroundMode,
  backgroundColor,
  backgroundPrompt,
  shadowMode,
  padding,
  aspectRatio,
  options,
  isLoading,
  virtualModelModel,
  virtualModelPose,
  virtualModelScene,
  virtualModelPrompt,
  recommendedPrompts,
  onDragOver,
  onDrop,
  onFileChange,
  onUrlChange,
  setBackgroundMode,
  setBackgroundColor,
  setBackgroundPrompt,
  setShadowMode,
  setPadding,
  setAspectRatio,
  setVirtualModelModel,
  setVirtualModelPose,
  setVirtualModelScene,
  setVirtualModelPrompt,
  onOptionChange,
  onApplyRecommendedPrompt,
  onGenerate
}) {
  return (
    <div className="control-panel glass-card">
      <div className="panel-header">
        <h3>AI 제품 연출</h3>
        <span className="api-badge">PhotoRoom API v2</span>
      </div>

      <div className="panel-scroll-content">
        {/* 1단계: 이미지 입력 */}
        <div className="control-group">
          <label className="group-title">1. 이미지 업로드</label>
          <div
            className={`dropzone ${file ? 'has-file' : ''}`}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={onFileChange}
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
              onChange={onUrlChange}
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
                    onClick={() => onApplyRecommendedPrompt(p)}
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
              <div key={opt.key} className="option-row" onClick={() => onOptionChange(opt.key)}>
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
          onClick={onGenerate}
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
  );
}

export default StudioControlPanel;
