import React, { useState, useRef, useEffect } from 'react';
import { DashboardHeader, Footer, UserManagement, LoginRequiredCard, AccessDeniedCard } from '../components';
import { InsightView, PerformanceView, AllMaterialInsightView, ABCompareView } from '../components/hanssem_hf';
import { bqDirectUpload } from '../utils/bqDirectUpload';
import { useAuth } from '../context/AuthContext';
import '../styles/Hanssem.css';

function HanssemHf() {
  const {
    isLoggedIn,
    hasPermission,
    userName,
    currentUserInfo,
    checkAuth,
    logout,
    openLoginModal,
  } = useAuth();

  const [activeFilter, setActiveFilter] = useState('insight');
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const fileInputRef = useRef(null);

  useEffect(() => {
    checkAuth('hanssem_hf', true);
  }, [checkAuth]);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await bqDirectUpload({
        file,
        datasetId: 'hanssem_hf', // 한샘 홈퍼니싱 데이터셋 예시
        tableId: 'performance_raw', // 예시 테이블명
        truncate: true,
        setUploadStatus
      });
      // 파일 선택기 초기화
      e.target.value = '';
    }
  };

  const filterButtons = [
    { id: 'performance', label: '트렌드 대시보드' },
    { id: 'insight', label: '매체 별 소재 인사이트' },
    { id: 'all-material', label: '통합 소재 대시보드' },
    { id: 'ab-compare', label: 'A/B 비교' },
    ...(currentUserInfo.role === 'master' || currentUserInfo.role === 'admin'
      ? [{ id: 'management', label: '권한 관리' }]
      : []),
  ];

  return (
    <div className="hanssem-app">
      <DashboardHeader
        title={
          <div className="header-logo-container">
            <span display="flex" justifycontent="center" alignitems="center" width="100%" height="100%" className="Box__StyledBox-ds-styled-components__sc-71ddd825-0 flFJtn"><svg viewBox="0 0 356 34" fill="none" xmlns="http://www.w3.org/2000/svg" data-w="356" data-h="34" width="231" height="22"><g clip-path="url(#clip0_1989_46689)"><path d="M322.95 1.20651L316.65 7.50684L331.329 22.1864L337.63 15.886L322.95 1.20651Z" fill="white"></path><path d="M261.43 11.7197H241.64V20.5597H261.43V11.7197Z" fill="white"></path><path d="M355.28 1.21973H345.99V32.5897H355.28V1.21973Z" fill="white"></path><path d="M315.64 1.21973H306.35V32.5897H315.64V1.21973Z" fill="white"></path><path d="M276 1.21973H266.71V32.5897H276V1.21973Z" fill="white"></path><path d="M236.35 1.21973H227.06V32.5897H236.35V1.21973Z" fill="white"></path><path d="M295.82 1.21973H286.53V32.5897H295.82V1.21973Z" fill="white"></path><path d="M8.75 1.21973H0V32.5897H8.75V1.21973Z" fill="white"></path><path d="M113.83 10.2898C113.71 8.37977 112.09 7.14977 110.01 7.14977C108.12 7.14977 106.28 7.88977 106.28 9.74977C106.26 12.1898 109.09 12.8998 110.4 13.2898C116.41 15.0798 123.01 16.5098 123.01 23.7198C123.01 30.3798 117.39 33.7998 110.49 33.7998C103.59 33.7998 96.97 30.0498 97.22 22.6798H105.42C105.59 24.9298 107.69 26.8098 110.36 26.8098C112.33 26.8098 114.38 25.9198 114.38 23.9598C114.38 20.7198 107.93 20.8598 103.44 18.4898C99.76 16.5498 97.93 13.3898 97.97 9.71977C97.97 3.62977 103.65 0.00976562 110.12 0.00976562C117.01 0.00976562 122.19 3.92977 122.14 10.2998H113.81L113.83 10.2898Z" fill="white"></path><path d="M140.84 10.2898C140.72 8.37977 139.1 7.14977 137.02 7.14977C135.13 7.14977 133.29 7.88977 133.29 9.74977C133.27 12.1898 136.1 12.8998 137.41 13.2898C143.42 15.0798 150.02 16.5098 150.02 23.7198C150.02 30.3798 144.4 33.7998 137.5 33.7998C130.6 33.7998 123.98 30.0498 124.23 22.6798H132.43C132.6 24.9298 134.7 26.8098 137.37 26.8098C139.34 26.8098 141.39 25.9198 141.39 23.9598C141.39 20.7198 134.94 20.8598 130.45 18.4898C126.77 16.5498 124.94 13.3898 124.98 9.71977C124.98 3.62977 130.66 0.00976562 137.13 0.00976562C144.02 0.00976562 149.2 3.92977 149.15 10.2998H140.82L140.84 10.2898Z" fill="white"></path><path d="M160.72 26.0497V19.7197H172.69V13.4097H160.72V7.72973H176.17V1.21973H152.36V32.5797H176.57V26.0497H160.72Z" fill="white"></path><path d="M95.07 1.21973H86.77V17.6997H86.3L74.21 1.21973H66.37V32.5797H74.66V15.0497H75.08L87.61 32.5797H95.07V1.21973Z" fill="white"></path><path d="M12.62 20.1897H22.7V32.5797H31.3V1.21973H22.7V12.9197H12.62V20.1897Z" fill="white"></path><path d="M56.75 32.5797H65.1L53.99 1.21973H43.73L32.61 32.5897H40.82L43.15 25.3197H54.43L56.75 32.5797V32.5797ZM48.62 8.77973H48.99L52.25 18.6797H45.35L48.62 8.77973Z" fill="white"></path><path d="M216.53 1.21973H207.8V32.5897H216.53V1.21973Z" fill="white"></path><path d="M188.54 1.21973H179.44V32.5797H187.95V13.1097H188.26L197.29 21.8297L203.32 15.5997L188.54 1.21973Z" fill="white"></path></g><defs><clipPath id="clip0_1989_46689"><rect width="356" height="34" fill="white"></rect></clipPath></defs></svg></span>
            <span className="header-title-text">홈퍼니싱 데이터 대시보드</span>
          </div>
        }
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={currentUserInfo.role}
        onLogout={logout}
        onLoginClick={openLoginModal}
      />


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

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".csv,.xlsx,.xls, .xlsb"
              />
              <button
                className="upload-btn-light"
                onClick={handleFileUploadClick}
                disabled={uploadStatus.type === 'loading'}
              >
                {uploadStatus.type === 'loading' ? (
                  <>
                    <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" opacity="0.25" />
                      <path d="M12 2 A10 10 0 0 1 22 12" />
                    </svg>
                    업로드 중...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    성과 데이터 업로드
                  </>
                )}
              </button>
              {uploadStatus.message && (
                <span className={`upload-status-inline ${uploadStatus.type}`}>
                  {uploadStatus.message}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>


      {!isLoggedIn ? (
        <LoginRequiredCard serviceName="한샘 홈퍼니싱" />
      ) : !hasPermission ? (
        <AccessDeniedCard serviceName="한샘 홈퍼니싱" />
      ) : (

        <>

          {activeFilter === 'insight' && (
            <InsightView
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          )}
          {activeFilter === 'performance' && (
            <PerformanceView
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          )}
          {activeFilter === 'all-material' && (
            <AllMaterialInsightView
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          )}
          {activeFilter === 'ab-compare' && (
            <ABCompareView
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          )}
          {(activeFilter === 'mypage' || activeFilter === 'management') && isLoggedIn && hasPermission && (
            <main className="hanssem-main">
              <div className="section-header" style={{ borderBottom: 'none', textAlign: 'center', padding: '5rem 0' }}>
                {activeFilter === 'management' ? (
                  <UserManagement customerUrl="hanssem_hf" currentUserInfo={currentUserInfo} />
                ) : (
                  <h2 style={{ fontSize: '1.5rem', color: '#999' }}>준비 중인 페이지입니다.</h2>
                )}
              </div>
            </main>
          )}
        </>
      )
      }

      <Footer />
    </div>
  );
}


export default HanssemHf;
