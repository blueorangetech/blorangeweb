import React, { useState, useRef } from 'react';
import { Header, Footer } from '../components';
import { InsightView, PerformanceView } from '../components/hanssem';
import { bqDirectUpload } from '../utils/bqDirectUpload';
import hanssemLogo from '../assets/hanssem_logo.png';
import '../styles/Hanssem.css';

function Hanssem() {
  const [activeFilter, setActiveFilter] = useState('insight');
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await bqDirectUpload({
        file,
        datasetId: 'hanssem', // 한샘 데이터셋 고정
        tableId: 'performance_raw', // 예시 테이블명
        truncate: true,
        setUploadStatus
      });
      // 파일 선택기 초기화
      e.target.value = '';
    }
  };

  // 필터 버튼 데이터
  const filterButtons = [
    { id: 'performance', label: '소재 성과 대시보드' },
    { id: 'insight', label: '소재 인사이트' },
    { id: 'notice', label: '공지사항' },
    { id: 'mypage', label: '로그인 / 마이페이지' },
  ];

  return (
    <div className="hanssem-app">
      <Header title={
        <div className="header-logo-container">
          <img
            src={hanssemLogo}
            alt="HANSSEM"
            className="hanssem-header-ci"
          />
          <span className="header-title-text">소재 데이터 대시보드</span>
        </div>
      }>
        <div className="upload-section">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".csv,.xlsx,.xls"
          />
          <button
            className="upload-btn"
            onClick={handleFileUploadClick}
            disabled={uploadStatus.type === 'loading'}
          >
            {uploadStatus.type === 'loading' ? (
              <>
                <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M12 2 A10 10 0 0 1 22 12" />
                </svg>
                업로드 중...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                데이터 업로드
              </>
            )}
          </button>
          {uploadStatus.message && (
            <div className={`upload-status ${uploadStatus.type}`}>
              {uploadStatus.message}
            </div>
          )}
        </div>
      </Header>

      {/* 필터 섹션 */}
      <section className="hanssem-filter-section">
        <div className="header-container">
          <div className="filter-buttons">
            {filterButtons.map((filter) => (
              <button
                key={filter.id}
                className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 영역 (컴포넌트 분리) */}
      {activeFilter === 'insight' && <InsightView />}

      {/* {activeFilter === 'performance' && <PerformanceView />} */}

      {(activeFilter === 'notice' || activeFilter === 'mypage') && (
        <main className="hanssem-main">
          <div className="section-header" style={{ borderBottom: 'none', textAlign: 'center', padding: '5rem 0' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#999' }}>준비 중인 페이지입니다.</h2>
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}

export default Hanssem;
