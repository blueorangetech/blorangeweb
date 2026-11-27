import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';

export default function MediaMixFilterPanel({
  filterKeys,
  selectedFilters,
  setSelectedFilters,
  filterOptions,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  setIsDateModeActive,
  onExportExcel,
  onResetFilters
}) {
  return (
    <div className="mediamix-filter-panel">
      <div className="mediamix-filter-grid">
        {filterKeys.map(f => (
          <div className="mediamix-filter-box" key={f.id}>
            <label>{f.label}</label>
            <select
              className="mediamix-filter-select"
              value={selectedFilters[f.id] || 'all'}
              onChange={(e) => {
                setSelectedFilters(prev => ({
                  ...prev,
                  [f.id]: e.target.value
                }));
              }}
            >
              <option value="all">전체</option>
              {(filterOptions[f.id] || []).map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="mediamix-action-row">
        <div className="mediamix-left-actions">
          <div className="mediamix-date-box">
            <span className="mediamix-date-label">기간 선택</span>
            <div className="mediamix-datepicker-wrapper">
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  const [start, end] = update;
                  setStartDate(start);
                  setEndDate(end);
                  if (start && end) {
                    setIsDateModeActive(true);
                  }
                }}
                locale={ko}
                dateFormat="yyyy.MM.dd"
                className="mediamix-datepicker-input"
                placeholderText="날짜 조건을 선택하세요"
                isClearable={true}
              />
            </div>
          </div>
        </div>

        <div className="mediamix-right-actions">
          <button className="mediamix-btn mediamix-btn-secondary" onClick={onExportExcel}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            엑셀 추출
          </button>
          <button className="mediamix-btn mediamix-btn-secondary" onClick={onResetFilters}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span>
            조건 초기화
          </button>
        </div>
      </div>
    </div>
  );
}
