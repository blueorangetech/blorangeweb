import React, { useState, useRef, useEffect } from 'react';
import {
  DashboardHeader,
  Footer,
  UserManagement,
  LoginRequiredCard,
  AccessDeniedCard,
  ImageLibrary,
  ClientSidebar,
  CommonTrendView,
  CommonCompareView,
  CreativeStudioView,
  VariationStudioView
} from '../components';
import { InsightView, AllMaterialInsightView, ABCompareView } from '../components/hanssem_hf';
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

  const [activeMenu, setActiveMenu] = useState('report-overview');
  const [creativeTab, setCreativeTab] = useState('product'); // 'product' 또는 'banner'
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
  const [startDate, setStartDate] = useState(new Date('2026-06-01'));
  const [endDate, setEndDate] = useState(new Date('2026-06-15'));
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

  const enabledMenuIds = [
    'report-overview',
    'report-detail',
    'creative-integrated',
    'creative-insight',
    'creative-compare',
    'creative-ai-studio',
    'creative-library',
    ...(currentUserInfo.role === 'master' || currentUserInfo.role === 'admin'
      ? ['etc-account', 'etc-upload']
      : [])
  ];

  return (
    <div className="hanssem-app">
      <DashboardHeader
        title={
          <div className="header-logo-container">
            <span display="flex" justifycontent="center" alignitems="center" width="100%" height="100%" className="Box__StyledBox-ds-styled-components__sc-71ddd825-0 flFJtn">
              <svg viewBox="0 0 356 34" fill="none" xmlns="http://www.w3.org/2000/svg" data-w="356" data-h="34" width="231" height="22">
                <g clipPath="url(#clip0_1989_46689)">
                  <path d="M322.95 1.20651L316.65 7.50684L331.329 22.1864L337.63 15.886L322.95 1.20651Z" fill="#0f172a"></path>
                  <path d="M261.43 11.7197H241.64V20.5597H261.43V11.7197Z" fill="#0f172a"></path>
                  <path d="M355.28 1.21973H345.99V32.5897H355.28V1.21973Z" fill="#0f172a"></path>
                  <path d="M315.64 1.21973H306.35V32.5897H315.64V1.21973Z" fill="#0f172a"></path>
                  <path d="M276 1.21973H266.71V32.5897H276V1.21973Z" fill="#0f172a"></path>
                  <path d="M236.35 1.21973H227.06V32.5897H236.35V1.21973Z" fill="#0f172a"></path>
                  <path d="M295.82 1.21973H286.53V32.5897H295.82V1.21973Z" fill="#0f172a"></path>
                  <path d="M8.75 1.21973H0V32.5897H8.75V1.21973Z" fill="#0f172a"></path>
                  <path d="M113.83 10.2898C113.71 8.37977 112.09 7.14977 110.01 7.14977C108.12 7.14977 106.28 7.88977 106.28 9.74977C106.26 12.1898 109.09 12.8998 110.4 13.2898C116.41 15.0798 123.01 16.5098 123.01 23.7198C123.01 30.3798 117.39 33.7998 110.49 33.7998C103.59 33.7998 96.97 30.0498 97.22 22.6798H105.42C105.59 24.9298 107.69 26.8098 110.36 26.8098C112.33 26.8098 114.38 25.9198 114.38 23.9598C114.38 20.7198 107.93 20.8598 103.44 18.4898C99.76 16.5498 97.93 13.3898 97.97 9.71977C97.97 3.62977 103.65 0.00976562 110.12 0.00976562C117.01 0.00976562 122.19 3.92977 122.14 10.2998H113.81L113.83 10.2898Z" fill="#0f172a"></path>
                  <path d="M140.84 10.2898C140.72 8.37977 139.1 7.14977 137.02 7.14977C135.13 7.14977 133.29 7.88977 133.29 9.74977C133.27 12.1898 136.1 12.8998 137.41 13.2898C143.42 15.0798 150.02 16.5098 150.02 23.7198C150.02 30.3798 144.4 33.7998 137.5 33.7998C130.6 33.7998 123.98 30.0498 124.23 22.6798H132.43C132.6 24.9298 134.7 26.8098 137.37 26.8098C139.34 26.8098 141.39 25.9198 141.39 23.9598C141.39 20.7198 134.94 20.8598 130.45 18.4898C126.77 16.5498 124.94 13.3898 124.98 9.71977C124.98 3.62977 130.66 0.00976562 137.13 0.00976562C144.02 0.00976562 149.2 3.92977 149.15 10.2998H140.82L140.84 10.2898Z" fill="#0f172a"></path>
                  <path d="M160.72 26.0497V19.7197H172.69V13.4097H160.72V7.72973H176.17V1.21973H152.36V32.5797H176.57V26.0497H160.72Z" fill="#0f172a"></path>
                  <path d="M95.07 1.21973H86.77V17.6997H86.3L74.21 1.21973H66.37V32.5797H74.66V15.0497H75.08L87.61 32.5797H95.07V1.21973Z" fill="#0f172a"></path>
                  <path d="M12.62 20.1897H22.7V32.5797H31.3V1.21973H22.7V12.9197H12.62V20.1897Z" fill="#0f172a"></path>
                  <path d="M56.75 32.5797H65.1L53.99 1.21973H43.73L32.61 32.5897H40.82L43.15 25.3197H54.43L56.75 32.5797V32.5797ZM48.62 8.77973H48.99L52.25 18.6797H45.35L48.62 8.77973Z" fill="#0f172a"></path>
                  <path d="M216.53 1.21973H207.8V32.5897H216.53V1.21973Z" fill="#0f172a"></path>
                  <path d="M188.54 1.21973H179.44V32.5797H187.95V13.1097H188.26L197.29 21.8297L203.32 15.5997L188.54 1.21973Z" fill="#0f172a"></path>
                </g>
                <defs>
                  <clipPath id="clip0_1989_46689">
                    <rect width="356" height="34" fill="#0f172a"></rect>
                  </clipPath>
                </defs>
              </svg>
            </span>
            <span className="header-title-text">홈퍼니싱 데이터 대시보드</span>
          </div>
        }
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={currentUserInfo.role}
        onLogout={logout}
        onLoginClick={openLoginModal}
      />

      {!isLoggedIn ? (
        <LoginRequiredCard serviceName="한샘 홈퍼니싱" />
      ) : !hasPermission ? (
        <AccessDeniedCard serviceName="한샘 홈퍼니싱" />
      ) : (
        <div className="hanssem-dashboard-layout" style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 70px)' }}>
          <ClientSidebar
            activeMenu={activeMenu}
            onMenuChange={setActiveMenu}
            enabledMenuIds={enabledMenuIds}
          />
          <div className="viewport-content" style={{ flex: 1, padding: '24px 32px', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
            {activeMenu === 'report-overview' && (
              <CommonTrendView
                datasetId="hanssem_hf"
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
              />
            )}
            {activeMenu === 'report-detail' && (
              <CommonCompareView
                datasetId="hanssem_hf"
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
              />
            )}
            {activeMenu === 'creative-integrated' && (
              <AllMaterialInsightView
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
              />
            )}
            {activeMenu === 'creative-insight' && (
              <InsightView
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
              />
            )}
            {activeMenu === 'creative-compare' && (
              <ABCompareView
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
              />
            )}
            {activeMenu === 'creative-ai-studio' && (
              <div>
                {/* 상단 서브 탭 */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                  <button
                    onClick={() => setCreativeTab('product')}
                    style={{
                      padding: '0.5rem 1.25rem',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: creativeTab === 'product' ? '#2563eb' : '#f1f5f9',
                      color: creativeTab === 'product' ? '#ffffff' : '#475569',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    AI 제품 연출
                  </button>
                  <button
                    onClick={() => setCreativeTab('banner')}
                    style={{
                      padding: '0.5rem 1.25rem',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: creativeTab === 'banner' ? '#2563eb' : '#f1f5f9',
                      color: creativeTab === 'banner' ? '#ffffff' : '#475569',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    AI 배너 양산
                  </button>
                </div>
                
                {creativeTab === 'product' ? (
                  <CreativeStudioView embedded={true} />
                ) : (
                  <VariationStudioView embedded={true} />
                )}
              </div>
            )}
            {activeMenu === 'creative-library' && (
              <main className="hanssem-main" style={{ margin: '0 auto 3rem', padding: '3rem 2rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)' }}>
                <ImageLibrary
                  pageName="all"
                  bucketName="hanssem_hf"
                  customTitle="한샘 HF 에셋 라이브러리"
                />
              </main>
            )}
            {activeMenu === 'etc-account' && (
              <main className="hanssem-main" style={{ margin: '0 auto 3rem', padding: '3rem 2rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)' }}>
                <UserManagement customerUrl="hanssem_hf" currentUserInfo={currentUserInfo} />
              </main>
            )}
            {activeMenu === 'etc-upload' && (
              <main className="hanssem-main" style={{ margin: '0 auto 3rem', padding: '3rem 2rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)' }}>
                <div className="section-header" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111' }}>데이터 업로드 및 수정</h2>
                </div>
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#64748b', marginBottom: '16px' }}>cloud_upload</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155', marginBottom: '16px' }}>성과 데이터 파일 업로드 (BigQuery)</h3>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept=".csv,.xlsx,.xls, .xlsb"
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <button
                      className="upload-btn-light"
                      onClick={handleFileUploadClick}
                      disabled={uploadStatus.type === 'loading'}
                      style={{ padding: '0.8rem 2rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      {uploadStatus.type === 'loading' ? '업로드 중...' : '파일 선택 및 업로드'}
                    </button>
                    {uploadStatus.message && (
                      <span className={`upload-status-inline ${uploadStatus.type}`} style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        {uploadStatus.message}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '20px' }}>지원 형식: .csv, .xlsx, .xls, .xlsb (한샘 홈퍼니싱 성과 데이터 raw 파일)</p>
                </div>
              </main>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default HanssemHf;
