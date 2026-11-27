import React from 'react';

/**
 * 이미지 라이브러리 커스텀 삭제 확인 모달 팝업
 */
function DeleteConfirmModal({ targetFilename, onClose, onConfirm }) {
  if (!targetFilename) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999,
        padding: '20px',
        animation: 'fadeInLightbox 0.2s ease forwards'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '28px 32px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
          이미지 삭제 확인
        </h3>
        <p style={{ margin: '0 0 24px 0', fontSize: '0.95rem', color: '#475569', lineHeight: '1.5', wordBreak: 'break-all' }}>
          정말로 <strong>'{targetFilename}'</strong> 이미지를 라이브러리에서 영구 삭제하시겠습니까?<br/>
          <span style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '6px', display: 'inline-block' }}>
            * 삭제된 파일은 다시 복구할 수 없습니다.
          </span>
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
