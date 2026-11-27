import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';

export default function CompareFilterSection({
  title,
  isExpanded,
  setIsExpanded,
  startDate,
  endDate,
  onDateChange,
  filterKeys,
  filters,
  setFilters,
  filterOptions,
  initialFilters,
  onOpenEditor,
  onExport,
}) {
  return (
    <>
      <div className="compare-card-title">{title}</div>
      
      <div className="accordion-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span>
          필터 및 기간 설정 ({startDate && endDate
            ? `${startDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })} - ${endDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}`
            : '기간 선택'}
          ) - {isExpanded ? '접기' : '펼치기'}
        </span>
        <span className={`material-symbols-outlined icon ${isExpanded ? 'expanded' : ''}`}>
          expand_more
        </span>
      </div>

      {isExpanded && (
        <div className="compare-filter-panel" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
          <div className="filter-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr) !important' }}>
            {filterKeys.map(k => (
              <div className="filter-box" key={k.id}>
                <label>{k.label}</label>
                <select
                  className="filter-select"
                  value={filters[k.id]}
                  onChange={(e) => setFilters(prev => ({ ...prev, [k.id]: e.target.value }))}
                >
                  <option value="all">전체 - {k.label}</option>
                  {(filterOptions[k.id] || []).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="compare-action-row">
            <div className="compare-date-picker-box">
              <span className="control-label" style={{ fontWeight: 700 }}>기간 선택</span>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  const [start, end] = update;
                  onDateChange(start, end);
                }}
                locale={ko}
                dateFormat="yyyy.MM.dd"
                customInput={
                  <button className="period-btn" style={{ fontWeight: 700 }}>
                    {startDate && endDate
                      ? `${startDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })} - ${endDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}`
                      : '기간 선택'}
                  </button>
                }
              />
            </div>
            
            <div className="btn-group">
              <button className="action-btn" onClick={onOpenEditor}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>view_column</span>
                열 설정
              </button>
              <button className="action-btn" onClick={onExport}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>download</span>
                엑셀
              </button>
              <button className="action-btn" onClick={() => setFilters(initialFilters)}>
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
