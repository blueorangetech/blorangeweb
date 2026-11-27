import React from 'react';

export function ExcelDownloadWidget({ isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="excel-download-floating-widget">
      <div className="widget-spinner" />
      <div className="widget-content">
        <span className="widget-title">엑셀 파일 생성 중...</span>
        <span className="widget-desc">네이버 실시간 통계 및 예산 데이터를 집계하고 있습니다.</span>
      </div>
    </div>
  );
}
