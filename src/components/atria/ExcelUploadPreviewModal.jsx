import React from 'react';

export function ExcelUploadPreviewModal({
  isOpen,
  excelSubmitting,
  excelParsing,
  excelDownloading,
  excelPreviewData,
  selectedFavoriteGroup,
  onClose,
  onFileSelect,
  onDownloadTemplate,
  onApplyBudgets
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => !excelSubmitting && onClose()}>
      <div className="modal-content excel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="material-symbols-outlined modal-icon-excel">upload_file</span>
            <div>
              <h3>엑셀 대량 예산 수정</h3>
              <p className="modal-subtitle">수정된 엑셀 파일을 업로드하여 광고그룹 예산을 일괄 적용합니다.</p>
            </div>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            disabled={excelSubmitting}
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* File upload dropzone */}
          <div className="excel-upload-dropzone">
            <input
              type="file"
              id="excel-file-input"
              accept=".xlsx, .xls"
              onChange={onFileSelect}
              disabled={excelParsing || excelSubmitting}
              style={{ display: 'none' }}
            />
            <label htmlFor="excel-file-input" className="dropzone-label">
              <span className="material-symbols-outlined upload-icon">cloud_upload</span>
              <div className="dropzone-text">
                <strong>클릭하여 엑셀 파일 선택</strong> 또는 파일을 여기로 드래그하세요
              </div>
              <span className="dropzone-hint">.xlsx, .xls 파일 지원</span>
            </label>
          </div>

          {/* Template Download Guide inside Modal */}
          <div className="excel-template-guide">
            <span>양식이 필요하신가요?</span>
            <button 
              type="button" 
              className="guide-download-link"
              onClick={onDownloadTemplate}
              disabled={excelDownloading}
            >
              <span className={`material-symbols-outlined ${excelDownloading ? 'spinner' : ''}`} style={{ fontSize: '15px' }}>
                {excelDownloading ? 'progress_activity' : 'download'}
              </span>
              {excelDownloading ? '다운로드 생성 중...' : (selectedFavoriteGroup ? `${selectedFavoriteGroup.name} 양식 다운로드` : '전체 광고그룹 양식 다운로드')}
            </button>
          </div>

          {/* Parsing status */}
          {excelParsing && (
            <div className="excel-status-loading">
              <span className="material-symbols-outlined spinner">progress_activity</span>
              <span>엑셀 파일을 분석하는 중입니다...</span>
            </div>
          )}

          {/* Preview Table */}
          {excelPreviewData && (
            <div className="excel-preview-section">
              <div className="excel-preview-summary">
                <div className="summary-pill total">총 {excelPreviewData.totalRows}건 감지</div>
                <div className="summary-pill valid">적용 가능 {excelPreviewData.validCount}건</div>
                {excelPreviewData.invalidCount > 0 && (
                  <div className="summary-pill invalid">제외/오류 {excelPreviewData.invalidCount}건</div>
                )}
              </div>

              <div className="excel-preview-table-wrap">
                <table className="excel-preview-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px', textAlign: 'center' }}>행</th>
                      <th>광고그룹 ID</th>
                      <th>광고그룹명</th>
                      <th style={{ textAlign: 'right' }}>수정 예산</th>
                      <th style={{ textAlign: 'center' }}>예산 사용</th>
                      <th>검증 상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelPreviewData.items.map((item, idx) => (
                      <tr key={idx} className={item.isValid ? 'row-valid' : 'row-invalid'}>
                        <td style={{ color: '#94a3b8', textAlign: 'center' }}>{item.rowNumber}</td>
                        <td style={{ fontWeight: '600' }}>{item.adgroupId}</td>
                        <td>{item.name || '-'}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>
                          {item.useBudget && item.budget > 0 ? `${item.budget.toLocaleString()}원` : '제한 없음'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`use-budget-pill ${item.useBudget ? 'on' : 'off'}`}>
                            {item.useBudget ? 'ON' : 'OFF'}
                          </span>
                        </td>
                        <td>
                          <span className={`validation-badge ${item.isValid ? 'valid' : 'invalid'}`}>
                            {item.message}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={onClose}
            disabled={excelSubmitting}
          >
            닫기
          </button>
          <button 
            className="btn-primary" 
            onClick={onApplyBudgets}
            disabled={!excelPreviewData || excelPreviewData.validCount === 0 || excelSubmitting}
          >
            {excelSubmitting ? (
              <>
                <span className="material-symbols-outlined spinner" style={{ fontSize: '16px' }}>progress_activity</span>
                <span>네이버 반영 중 ({excelPreviewData?.validCount}건)...</span>
              </>
            ) : (
              `일괄 변경 적용 (${excelPreviewData?.validCount || 0}건)`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
