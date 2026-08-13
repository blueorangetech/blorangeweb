import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';
import { fetchCompareData } from '../../../api/geo/hanssemHfApi';
import ABTestCompareTab from './ABTestCompareTab';
import CommonalityAnalysisTab from './CommonalityAnalysisTab';
import '../../../styles/HanssemInsight.css';
import '../../../styles/HanssemCompare.css';

function ABCompareView({ startDate, endDate, setStartDate, setEndDate }) {
  const [activeTab, setActiveTab] = useState('ab-test'); // 'ab-test' | 'commonality'
  const [fetchedData, setFetchedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCompareData({ startDate, endDate });
        setFetchedData(data);
      } catch (error) {
        console.error('Fetch compare_data error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const renderDatePicker = () => (
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
        <button className="date-picker-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.75 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>
            {startDate && endDate
              ? `${startDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })} - ${endDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}`
              : '기간 조건'}
          </span>
        </button>
      }
    />
  );

  return (
    <>
      {/* Sub-Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('ab-test')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'ab-test' ? '3px solid #2563eb' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'ab-test' ? '#2563eb' : '#64748b',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            borderRadius: '0px'
          }}
        >
          소재 A/B 테스트 비교
        </button>
        <button
          onClick={() => setActiveTab('commonality')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'commonality' ? '3px solid #2563eb' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'commonality' ? '#2563eb' : '#64748b',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            borderRadius: '0px'
          }}
        >
          우수 소재 공통점 분석 (AI)
        </button>
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#667eea', fontWeight: 'bold' }}>
          성과 데이터를 불러오는 중입니다...
        </div>
      )}

      {!isLoading && activeTab === 'ab-test' && (
        <ABTestCompareTab
          fetchedData={fetchedData}
          renderDatePicker={renderDatePicker}
        />
      )}

      {!isLoading && activeTab === 'commonality' && (
        <CommonalityAnalysisTab
          fetchedData={fetchedData}
          renderDatePicker={renderDatePicker}
        />
      )}
    </>
  );
}

export default ABCompareView;
