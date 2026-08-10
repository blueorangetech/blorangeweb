import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';

export default function TrendControls({
  activeSubTab,
  setActiveSubTab,
  mediaList,
  selectedMedia,
  setSelectedMedia,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  timeUnit,
  setTimeUnit
}) {
  return (
    <section className="section-header-with-action">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          className={`period-btn ${activeSubTab === 'integrated' ? '' : 'upload-btn-light'}`}
          style={{
            backgroundColor: activeSubTab === 'integrated' ? '#2563eb' : '#f1f5f9',
            color: activeSubTab === 'integrated' ? 'white' : '#475569',
            border: activeSubTab === 'integrated' ? 'none' : '1px solid #cbd5e1'
          }}
          onClick={() => setActiveSubTab('integrated')}
        >
          일자별
        </button>
        <button
          className={`period-btn ${activeSubTab === 'media' ? '' : 'upload-btn-light'}`}
          style={{
            backgroundColor: activeSubTab === 'media' ? '#2563eb' : '#f1f5f9',
            color: activeSubTab === 'media' ? 'white' : '#475569',
            border: activeSubTab === 'media' ? 'none' : '1px solid #cbd5e1'
          }}
          onClick={() => setActiveSubTab('media')}
        >
          매체별
        </button>
      </div>

      <div className="overview-controls">
        {activeSubTab === 'media' && (
          <div className="control-item">
            <span className="control-label">매체 선택</span>
            <select
              className="media-select"
              value={selectedMedia}
              onChange={(e) => setSelectedMedia(e.target.value)}
            >
              {mediaList.map(media => (
                <option key={media} value={media}>{media}</option>
              ))}
            </select>
          </div>
        )}

        <div className="control-item">
          <span className="control-label">기간 선택</span>
          <div className="performance-datepicker-wrapper">
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                const [start, end] = update;
                setStartDate(start);
                setEndDate(end);
              }}
              locale={ko}
              dateFormat="yyyy.MM.dd"
              customInput={
                <button className="period-btn">
                  {startDate && endDate
                    ? `${startDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })} - ${endDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}`
                    : '기간 선택'}
                </button>
              }
            />
          </div>
        </div>

        <div className="control-item">
          <span className="control-label">일/주/월 단위</span>
          <div className="segmented-control">
            <button
              className={`segment-btn ${timeUnit === 'day' ? 'active' : ''}`}
              onClick={() => setTimeUnit('day')}
            >
              일별
            </button>
            <button
              className={`segment-btn ${timeUnit === 'week' ? 'active' : ''}`}
              onClick={() => setTimeUnit('week')}
            >
              주별
            </button>
            <button
              className={`segment-btn ${timeUnit === 'month' ? 'active' : ''}`}
              onClick={() => setTimeUnit('month')}
            >
              월별
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
