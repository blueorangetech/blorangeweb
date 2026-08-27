import React, { useState, useRef, useEffect } from 'react';
import {
  DashboardHeader,
  Footer,
  UserManagement,
  LoginRequiredCard,
  AccessDeniedCard,
  ImageLibrary,
  ClientSidebar,
  CreativeStudioView,
  VariationStudioView,
  PsdVariationStudioView,
  CreativeStudioTabNav
} from '../components';
import {
  TrendView as CommonTrendView,
  CompareView as CommonCompareView,
  MediaMixCampaignView as CommonMediaMixCampaignView,
  MediaMixCompareView as CommonMediaMixCompareView,
  DataChatView,
  HanssemLogo
} from '../components/hanssem/common';
import { InsightView, AllMaterialInsightView, ABCompareView } from '../components/hanssem/hf';
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
  const [creativeTab, setCreativeTab] = useState('product');
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
    'report-chat',
    'creative-integrated',
    'creative-insight',
    'creative-compare',
    'creative-ai-studio',
    'creative-library',
    'mediamix-campaign',
    'mediamix-target',
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
              <HanssemLogo fill="#0f172a" />
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
            {activeMenu === 'report-chat' && (
              <DataChatView datasetId="hanssem_hf" />
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
            {activeMenu === 'mediamix-campaign' && (
              <CommonMediaMixCampaignView
                datasetId="hanssem_hf"
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
              />
            )}
            {activeMenu === 'mediamix-target' && (
              <CommonMediaMixCompareView datasetId="hanssem_hf" />
            )}
            {activeMenu === 'creative-ai-studio' && (
              <div>
                <CreativeStudioTabNav activeTab={creativeTab} onChange={setCreativeTab} />
                
                {creativeTab === 'product' ? (
                  <CreativeStudioView embedded={true} pageName="hanssem_hf" bucketName="hanssem_hf" />
                ) : creativeTab === 'variation' ? (
                  <VariationStudioView embedded={true} />
                ) : (
                  <PsdVariationStudioView embedded={true} pageName="hanssem_hf" bucketName="hanssem_hf" />
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
