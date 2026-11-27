import React, { useRef } from 'react';

export default function DataChatInput({
  inputVal,
  setInputVal,
  isTyping,
  workbook,
  selection,
  serviceTitle,
  onSend,
  onKeyPress,
  allowAttachments,
  uploading,
  uploadingName,
  uploadError,
  onAttach,
  onRemoveAttachment,
}) {
  const fileInput = useRef(null);
  return (
    <div className="chat-composer-container">
      <div className="chat-composer" onPaste={event => {
        if (allowAttachments && event.clipboardData.files.length) {
          event.preventDefault();
          onAttach(event.clipboardData.files);
        }
      }}>
        {allowAttachments && <input ref={fileInput} type="file" accept=".xlsx" aria-label="엑셀 파일 선택" hidden onChange={event => {
          onAttach(event.target.files);
          event.target.value = '';
        }} />}
        {(workbook || uploading) && <div className="chat-attachment" aria-busy={uploading || undefined}>
          <span className="chat-attachment-icon" aria-hidden="true">{uploading ? <span className="chat-upload-spinner" /> : <span className="material-symbols-outlined">description</span>}</span>
          <div className="chat-attachment-info">
            <strong title={uploading ? uploadingName : workbook.filename}>{uploading ? uploadingName : workbook.filename}</strong>
            <span role="status">{uploading ? '엑셀 읽는 중…' : `XLSX · 시트 ${workbook.sheets.length}개 · 분석 준비 완료`}</span>
          </div>
          {workbook && !uploading && <button type="button" className="chat-attachment-remove" aria-label="첨부 파일 삭제" title="첨부 해제 시 대화가 초기화됩니다." disabled={isTyping} onClick={onRemoveAttachment}><span className="material-symbols-outlined" aria-hidden="true">close</span></button>}
        </div>}
        <textarea
          aria-label="데이터 질문"
          value={inputVal}
          onChange={event => setInputVal(event.target.value)}
          onKeyDown={onKeyPress}
          placeholder={selection ? `${selection.sheet}!${selection.range}에 대해 질문하세요` : workbook ? '이 엑셀에 대해 무엇이든 물어보세요' : `${serviceTitle} 데이터에 대해 물어보세요`}
          rows={2}
        />
        <div className="chat-composer-actions">
          <div className="chat-composer-attachment-action">
            {allowAttachments && <button type="button" className="chat-attach-button" aria-label={workbook ? '첨부 파일 교체' : '파일 첨부'} title={workbook ? '다른 엑셀 첨부 (대화 초기화)' : '엑셀 파일 첨부 (.xlsx)'} disabled={isTyping} onClick={() => fileInput.current?.click()}><span className="material-symbols-outlined" aria-hidden="true">add</span></button>}
            {allowAttachments && <span>{selection ? `${selection.sheet}!${selection.range}` : '엑셀을 첨부하거나 끌어다 놓으세요'}</span>}
          </div>
          <button type="button" className="chat-send-button" aria-label="메시지 보내기" onClick={() => onSend()} disabled={!inputVal.trim() || isTyping}>
            <span className="material-symbols-outlined" aria-hidden="true">arrow_upward</span>
          </button>
        </div>
      </div>
      {uploadError && <p role="alert" className="chat-upload-error">{uploadError}</p>}
      <p className="chat-composer-hint">{workbook ? '파일 교체·첨부 해제 시 대화가 초기화됩니다.' : allowAttachments ? 'XLSX · 최대 10MB · 전체 20,000셀' : '대시보드 연동 데이터를 바탕으로 답변합니다.'}</p>
    </div>
  );
}
