import React, { useRef } from 'react';

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.78rem', color: '#475569', fontWeight: 600 },
  previewContainer: {
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #cbd5e1',
    background: '#0f172a',
    maxHeight: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewImg: { width: '100%', maxHeight: '140px', objectFit: 'contain' },
  clearBtn: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    background: 'rgba(15, 23, 42, 0.75)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  },
  dropzone: {
    border: '2px dashed #cbd5e1',
    borderRadius: '10px',
    padding: '16px',
    textAlign: 'center',
    cursor: 'pointer',
    background: '#f8fafc',
    transition: 'border-color 0.2s'
  },
  dropIcon: { fontSize: '28px', color: '#94a3b8' },
  dropText: { fontSize: '0.8rem', color: '#64748b', marginTop: '4px' },
  modeSelectorWrapper: { display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' },
  modeLabel: { fontSize: '0.74rem', color: '#64748b', fontWeight: 600 },
  modeOptionsContainer: { display: 'flex', gap: '6px' },
  modeBtnActive: {
    flex: 1,
    padding: '6px 8px',
    borderRadius: '8px',
    border: '1px solid #3b82f6',
    background: '#eff6ff',
    color: '#1d4ed8',
    fontSize: '0.74rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px'
  },
  modeBtnInactive: {
    flex: 1,
    padding: '6px 8px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#64748b',
    fontSize: '0.74rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px'
  },
  urlInput: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.78rem'
  },
  badgeActive: {
    padding: '8px 10px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  badgeInactive: {
    padding: '8px 10px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    background: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }
};

/**
 * 공통 시드 이미지 업로더 컴포넌트 (드래그앤드롭, 파일 선택, URL 입력 및 시드 모드 선택 지원)
 */
function ImageSeedUploader({
  activeImage,
  sourceImage,
  setSourceImage,
  setFilePreview,
  onClear,
  label = '참조 이미지 (선택)',
  modeBadges = true,
  seedMode = 'concept',
  setSeedMode
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSourceImage('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setSourceImage('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  return (
    <div style={styles.wrapper}>
      {label && <label style={styles.label}>{label}</label>}

      {activeImage ? (
        <div style={styles.previewContainer}>
          <img src={activeImage} alt="시드 이미지 프리뷰" style={styles.previewImg} />
          <button
            type="button"
            onClick={onClear}
            style={styles.clearBtn}
            title="이미지 제거"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={styles.dropzone}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <span className="material-symbols-outlined" style={styles.dropIcon}>
            add_photo_alternate
          </span>
          <div style={styles.dropText}>
            이미지 클릭 또는 드래그 업로드
          </div>
        </div>
      )}

      <input
        type="text"
        value={sourceImage}
        onChange={(e) => {
          setFilePreview('');
          setSourceImage(e.target.value);
        }}
        placeholder="또는 이미지 URL 직접 입력 (https://...)"
        style={styles.urlInput}
      />

      {setSeedMode && (
        <div style={styles.modeSelectorWrapper}>
          <label style={styles.modeLabel}>시드 이미지 활용 모드</label>
          <div style={styles.modeOptionsContainer}>
            <button
              type="button"
              style={seedMode === 'concept' ? styles.modeBtnActive : styles.modeBtnInactive}
              onClick={() => setSeedMode('concept')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>palette</span>
              <span>🎨 톤앤매너/컨셉 참조</span>
            </button>
            <button
              type="button"
              style={seedMode === 'layout' ? styles.modeBtnActive : styles.modeBtnInactive}
              onClick={() => setSeedMode('layout')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>dashboard</span>
              <span>📐 구도/레이아웃 유지</span>
            </button>
          </div>
        </div>
      )}

      {modeBadges && (
        <div style={activeImage ? styles.badgeActive : styles.badgeInactive}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            {activeImage ? (seedMode === 'layout' ? 'dashboard' : 'palette') : 'auto_fix_high'}
          </span>
          <span>
            {activeImage
              ? (seedMode === 'layout'
                  ? '구도 보존 모드: 시드 이미지의 그래픽 배치와 구조를 기반으로 소재 베리에이션 생성'
                  : '컨셉 참조 모드: 시드 이미지의 무드, 톤앤매너, 오브젝트를 참고하여 맞춤 비주얼 생성')
              : '메시지 전용 AI 모드: 메시지 및 톤앤매너 중심의 매체별 신규 비주얼 자동 생성'}
          </span>
        </div>
      )}
    </div>
  );
}

export default ImageSeedUploader;
