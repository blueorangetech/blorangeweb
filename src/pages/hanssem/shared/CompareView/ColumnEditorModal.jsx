import React from 'react';

export default function ColumnEditorModal({
  isOpen,
  setIsOpen,
  searchKeyword,
  setSearchKeyword,
  filteredMasterMetrics,
  selectedCols,
  handleToggleCol,
  handleDragStart,
  handleDragOver,
  handleDrop,
}) {
  if (!isOpen) return null;

  return (
    <div className="compare-modal-overlay">
      <div className="compare-modal-content">
        <div className="compare-modal-header">
          <h3>대시보드 노출 데이터 에디터 (열 맞춤 설정)</h3>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="compare-modal-body">
          <div className="compare-modal-left">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="지표 명 검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <span className="material-symbols-outlined search-icon-btn">search</span>
            </div>

            <div className="metric-group">
              <div className="metric-group-title">기본 성과 지표</div>
              {filteredMasterMetrics
                .filter(m => m.type === 'basic')
                .map(m => (
                  <label key={m.key} className="metric-item-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCols.some(c => c.key === m.key)}
                      onChange={() => handleToggleCol(m.key)}
                    />
                    {m.label}
                  </label>
                ))}
            </div>

            <div className="metric-group" style={{ marginTop: '0.5rem' }}>
              <div className="metric-group-title">전환 지표</div>
              {filteredMasterMetrics
                .filter(m => m.type === 'conversion')
                .map(m => (
                  <label key={m.key} className="metric-item-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCols.some(c => c.key === m.key)}
                      onChange={() => handleToggleCol(m.key)}
                    />
                    {m.label}
                  </label>
                ))}
            </div>
          </div>

          <div className="compare-modal-right">
            <div className="selected-header">{selectedCols.length}개 열이 선택되었습니다. (드래그하여 순서 변경)</div>
            <div className="draggable-list">
              {selectedCols.map((col, idx) => (
                <div
                  key={col.key}
                  className="draggable-item"
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                >
                  <div className="draggable-content">
                    <span className="drag-handle">::</span>
                    <span className="drag-label">{col.label}</span>
                  </div>
                  <button className="remove-btn" onClick={() => handleToggleCol(col.key)}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="compare-modal-footer">
          <button className="action-btn primary" onClick={() => setIsOpen(false)}>
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
