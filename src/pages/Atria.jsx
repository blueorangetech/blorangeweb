import React, { useState, useEffect } from 'react';
import { DashboardHeader, Footer, LoginRequiredCard, ClientSidebar, UserManagement } from '../components';
import { useAuth } from '../context/AuthContext';
import { manageNaverApi } from '../api';
import '../styles/Atria.css';

const ATRIA_MENU_BASE = [
  {
    id: 'budget-manage',
    label: '운영 및 예산 관리',
    icon: 'payments',
    subItems: [
      { id: 'budget-naver', label: '네이버 검색광고 예산' }
    ]
  }
];

const ATRIA_MENU_ADMIN = [
  ...ATRIA_MENU_BASE,
  {
    id: 'etc',
    label: '설정',
    icon: 'settings',
    subItems: [
      { id: 'etc-account', label: '계정 관리(로그인/회원권한)' }
    ]
  }
];

function Atria() {
  const {
    isLoggedIn,
    hasPermission,
    userName,
    currentUserInfo,
    checkAuth,
    logout,
    openLoginModal,
  } = useAuth();

  const [activeMenu, setActiveMenu] = useState('budget-naver');
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [expandedCampaignId, setExpandedCampaignId] = useState(null);
  const [adgroups, setAdgroups] = useState({});
  const [loadingAdgroups, setLoadingAdgroups] = useState(false);
  const [apiMode, setApiMode] = useState('real'); // 'real' | 'mock'
  const [showOnlyOn, setShowOnlyOn] = useState(true); // 기본적으로 ON 상태만 보기 활성화

  // 날짜 조회 기간 설정: 어제가 소속한 월 범위
  const getDefaultDateRange = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const startYear = yesterday.getFullYear();
    const startMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
    const startDateStr = `${startYear}-${startMonth}-01`;
    
    const endDay = String(yesterday.getDate()).padStart(2, '0');
    const endDateStr = `${startYear}-${startMonth}-${endDay}`;
    
    return { startDateStr, endDateStr };
  };
  const { startDateStr, endDateStr } = getDefaultDateRange();
  const [startDate, setStartDate] = useState(startDateStr);
  const [endDate, setEndDate] = useState(endDateStr);


  const isAdmin = currentUserInfo && (currentUserInfo.role === 'master' || currentUserInfo.role === 'admin');
  const menuStructure = isAdmin ? ATRIA_MENU_ADMIN : ATRIA_MENU_BASE;
  const enabledMenuIds = [
    'budget-naver',
    ...(isAdmin ? ['etc-account'] : [])
  ];

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState(null); // { type: 'campaign'|'adgroup', id: string, name: string, budget: number, useBudget: boolean }
  const [inputBudget, setInputBudget] = useState(0);
  const [inputUseBudget, setInputUseBudget] = useState(true);
  const [submittingBudget, setSubmittingBudget] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    // 아트리아 페이지 권한 검증 패스 (Intro, Imweb과 동일하게 설정)
    checkAuth('atria', false);
  }, [checkAuth]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const fetchCampaigns = async (start = startDate, end = endDate) => {
    setLoadingCampaigns(true);
    try {
      const res = await manageNaverApi.getCampaigns('atria', start, end);
      if (res && res.status === 'success') {
        setCampaigns(res.data || []);
        setApiMode(res.mode || 'real');
        if (res.mode === 'mock') {
          console.log('실서버 API 자격증명이 없어 시뮬레이션(데모) 모드로 로드되었습니다.');
        }
      } else {
        throw new Error('API 응답 결과가 올바르지 않습니다.');
      }
    } catch (err) {
      showToast(`캠페인 로드 실패: ${err.message}`, 'error');
    } finally {
      setLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCampaigns();
    }
  }, [isLoggedIn]);

  const toggleCampaignExpand = async (campaignId) => {
    if (expandedCampaignId === campaignId) {
      setExpandedCampaignId(null);
      return;
    }

    setExpandedCampaignId(campaignId);

    // 하위 광고그룹 정보가 아직 캐싱되지 않은 경우에만 API 호출
    if (!adgroups[campaignId]) {
      setLoadingAdgroups(true);
      try {
        const res = await manageNaverApi.getAdgroups(campaignId, 'atria', startDate, endDate);
        if (res && res.status === 'success') {
          setAdgroups(prev => ({
            ...prev,
            [campaignId]: res.data || []
          }));
        } else {
          throw new Error('광고그룹 응답 결과가 올바르지 않습니다.');
        }
      } catch (err) {
        showToast(`광고그룹 로드 실패: ${err.message}`, 'error');
      } finally {
        setLoadingAdgroups(false);
      }
    }
  };

  const openBudgetModal = (e, type, target) => {
    e.stopPropagation(); // 캠페인 행 확장 이벤트 방지
    
    const budgetVal = target.budget || 0;
    const useBudgetVal = target.useBudget !== undefined ? target.useBudget : true;

    setModalTarget({
      type,
      id: type === 'campaign' ? target.nccCampaignId : target.nccAdgroupId,
      name: target.name,
      budget: budgetVal,
      useBudget: useBudgetVal
    });
    setInputBudget(budgetVal);
    setInputUseBudget(useBudgetVal);
    setIsModalOpen(true);
  };

  const handleBudgetSubmit = async () => {
    if (!modalTarget) return;

    if (inputUseBudget && inputBudget > 0 && inputBudget < 10000) {
      showToast('예산 제한을 사용할 경우 최소 10,000원 이상 입력해야 합니다.', 'error');
      return;
    }

    setSubmittingBudget(true);
    const { type, id } = modalTarget;

    try {
      let res;
      const targetBudget = inputUseBudget ? Number(inputBudget) : 0;
      if (type === 'campaign') {
        res = await manageNaverApi.updateCampaignBudget(id, targetBudget, inputUseBudget, 'atria');
      } else {
        res = await manageNaverApi.updateAdgroupBudget(id, targetBudget, inputUseBudget, 'atria');
      }

      if (res && res.status === 'success') {
        showToast(`${type === 'campaign' ? '캠페인' : '광고그룹'} 예산이 성공적으로 업데이트되었습니다.`);
        setIsModalOpen(false);
        
        // 로컬 상태 즉시 업데이트하여 화면에 반영
        if (type === 'campaign') {
          setCampaigns(prev => prev.map(c => {
            if (c.nccCampaignId === id) {
              const newBudget = inputUseBudget ? Number(inputBudget) : 0;
              const isExceeded = inputUseBudget && newBudget > 0 && c.stats.salesAmt >= newBudget;
              return { 
                ...c, 
                budget: newBudget, 
                useBudget: inputUseBudget,
                status: isExceeded ? 'BUDGET_EXCEEDED' : 'ELIGIBLE'
              };
            }
            return c;
          }));
        } else {
          // 광고그룹 목록 상태 업데이트
          setAdgroups(prev => {
            const updated = {};
            Object.entries(prev).forEach(([cId, agList]) => {
              updated[cId] = agList.map(ag => {
                if (ag.nccAdgroupId === id) {
                  const newBudget = inputUseBudget ? Number(inputBudget) : 0;
                  const isExceeded = inputUseBudget && newBudget > 0 && ag.stats.salesAmt >= newBudget;
                  return { 
                    ...ag, 
                    budget: newBudget, 
                    useBudget: inputUseBudget,
                    status: isExceeded ? 'BUDGET_EXCEEDED' : 'ELIGIBLE'
                  };
                }
                return ag;
              });
            });
            return updated;
          });
        }
      } else {
        throw new Error(res.message || '업데이트에 실패했습니다.');
      }
    } catch (err) {
      showToast(`예산 업데이트 실패: ${err.message}`, 'error');
    } finally {
      setSubmittingBudget(false);
    }
  };

  // 통계 집계 데이터 계산
  const aggregateData = () => {
    let totalBudget = 0;
    let totalSpent = 0;
    let totalImpressions = 0;
    let totalClicks = 0;

    const targetCampaigns = showOnlyOn ? campaigns.filter(c => c.userLock === false) : campaigns;

    targetCampaigns.forEach(c => {
      // 제한이 있는 예산만 합산
      if (c.useBudget && c.budget > 0) {
        totalBudget += c.budget;
      }
      if (c.stats) {
        totalSpent += c.stats.salesAmt || 0;
        totalImpressions += c.stats.impCnt || 0;
        totalClicks += c.stats.clkCnt || 0;
      }
    });

    const spendRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cpc = totalClicks > 0 ? totalSpent / totalClicks : 0;

    return {
      totalBudget,
      totalSpent,
      spendRate,
      totalImpressions,
      totalClicks,
      ctr,
      cpc
    };
  };

  const summary = aggregateData();

  return (
    <div className="atria-app">
      <DashboardHeader
        title={
          <div className="header-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.25rem', letterSpacing: '-0.03em' }}>ATRIA</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>| 검색광고 관리자</span>
          </div>
        }
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={currentUserInfo.role}
        onLogout={logout}
        onLoginClick={openLoginModal}
      />

      {!isLoggedIn ? (
        <LoginRequiredCard serviceName="ATRIA 광고 운영 관리" />
      ) : (
        <div className="atria-dashboard-layout">
          <ClientSidebar
            activeMenu={activeMenu}
            onMenuChange={setActiveMenu}
            enabledMenuIds={enabledMenuIds}
            menuStructure={menuStructure}
          />
          
          <main className="atria-viewport">
            {activeMenu === 'budget-naver' && (
              <>
                {/* 상단 타이틀 영역 */}
                <div className="atria-header-section">
              <div className="atria-title-group">
                <h2>네이버 검색광고 실시간 현황</h2>
                <p>계정 전체 캠페인 및 광고그룹의 예산 한도와 소진 속도를 제어합니다.</p>
              </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <label className="status-filter-toggle" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>
                      <input 
                        type="checkbox" 
                        checked={showOnlyOn} 
                        onChange={(e) => setShowOnlyOn(e.target.checked)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <span>ON 상태만 보기</span>
                    </label>
                    <button 
                      className="refresh-btn" 
                      onClick={fetchCampaigns} 
                      disabled={loadingCampaigns}
                    >
                      <span className={`material-symbols-outlined ${loadingCampaigns ? 'spinner' : ''}`}>
                        refresh
                      </span>
                      <span>새로고침</span>
                    </button>
                  </div>

            </div>

            {/* 날짜 조회 기간 선택 영역 */}
            <div className="atria-date-picker-bar">
              <div className="date-picker-inputs">
                <span className="material-symbols-outlined">calendar_month</span>
                <span className="picker-label">조회 기간:</span>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="date-input"
                />
                <span className="date-tilde">~</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="date-input"
                />
                <button 
                  className="date-query-btn"
                  onClick={() => {
                    setAdgroups({});
                    setExpandedCampaignId(null);
                    fetchCampaigns(startDate, endDate);
                  }}
                  disabled={loadingCampaigns}
                >
                  조회
                </button>
              </div>
            </div>

            {/* 연동 모드 배너 */}
            {apiMode === 'mock' ? (
              <div className="mode-banner mock">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>info</span>
                <span>현재 <strong>시뮬레이션(데모) 모드</strong>로 작동 중입니다. 백엔드 `.env` 파일에 유효한 네이버 API Key를 등록하면 실시간 데이터가 자동으로 표출됩니다.</span>
              </div>
            ) : (
              <div className="mode-banner real">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                <span>네이버 광고시스템 API가 성공적으로 <strong>실시간 연결</strong>되었습니다. 변경 사항은 즉시 네이버 센터에 반영됩니다.</span>
              </div>
            )}

            {/* KPI 카드 그리드 */}
            <div className="atria-kpi-grid">
              <div className="atria-kpi-card">
                <div className="kpi-title">총 예산 (일일 한도)</div>
                <div className="kpi-value">{summary.totalBudget ? `${summary.totalBudget.toLocaleString()}원` : '제한 없음'}</div>
                <div className="kpi-subtext">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>tune</span>
                  예산 한도 설정 캠페인 합계
                </div>
              </div>
              
              <div className="atria-kpi-card">
                <div className="kpi-title">선택 기간 누적 소진 비용</div>
                <div className="kpi-value">{summary.totalSpent.toLocaleString()}원</div>
                <div className="kpi-subtext">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                  {startDate} ~ {endDate} 누적치
                </div>
              </div>

              <div className="atria-kpi-card">
                <div className="kpi-title">전체 예산 소진율</div>
                <div className="kpi-value">{summary.spendRate.toFixed(1)}%</div>
                <div className="kpi-progress-bar-bg">
                  <div 
                    className={`kpi-progress-bar-fill ${summary.spendRate >= 90 ? 'danger' : summary.spendRate >= 70 ? 'warning' : ''}`}
                    style={{ width: `${Math.min(summary.spendRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="atria-kpi-card">
                <div className="kpi-title">종합 성과 지표 (클릭 / 노출)</div>
                <div className="kpi-value">{summary.totalClicks.toLocaleString()}회</div>
                <div className="kpi-subtext" style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                  노출 {summary.totalImpressions.toLocaleString()}회 | CTR {summary.ctr.toFixed(2)}% | CPC {Math.round(summary.cpc).toLocaleString()}원
                </div>
              </div>
            </div>

            {/* 캠페인 리스트 테이블 */}
            <div className="table-card">
              <div className="table-header">
                <h3>캠페인 소진 리스트</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>* 행을 클릭하면 하위 광고그룹이 표시됩니다.</span>
              </div>
              
              <div className="table-responsive">
                <table className="campaign-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }} />
                      <th>캠페인 정보</th>
                      <th>유형</th>
                      <th>상태</th>
                      <th style={{ textAlign: 'right' }}>일일 예산</th>
                      <th style={{ textAlign: 'right' }}>소진액</th>
                      <th style={{ width: '120px' }}>소진 속도</th>
                      <th style={{ textAlign: 'right' }}>클릭수</th>
                      <th style={{ textAlign: 'right' }}>노출수</th>
                      <th style={{ textAlign: 'right' }}>평균 CPC</th>
                      <th style={{ textAlign: 'center', width: '100px' }}>예산 조정</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingCampaigns ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '40px 0' }}>
                          <span className="material-symbols-outlined spinner" style={{ fontSize: '32px', color: '#3b82f6' }}>
                            sync
                          </span>
                          <div style={{ marginTop: '8px', color: '#64748b', fontWeight: '600' }}>캠페인 및 실시간 소진율을 로드하는 중...</div>
                        </td>
                      </tr>
                    ) : (showOnlyOn ? campaigns.filter(c => c.userLock === false) : campaigns).length === 0 ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                          표시할 캠페인이 존재하지 않습니다.
                        </td>
                      </tr>
                    ) : (
                      (showOnlyOn ? campaigns.filter(c => c.userLock === false) : campaigns).map(c => {
                        const isExpanded = expandedCampaignId === c.nccCampaignId;
                        const spent = c.stats ? c.stats.salesAmt : 0;
                        const budget = c.budget || 0;
                        const hasLimit = c.useBudget && budget > 0;
                        const rate = hasLimit ? (spent / budget) * 100 : 0;
                        
                        return (
                          <React.Fragment key={c.nccCampaignId}>
                            <tr 
                              className={`campaign-row ${isExpanded ? 'expanded' : ''}`}
                              onClick={() => toggleCampaignExpand(c.nccCampaignId)}
                            >
                              <td style={{ textAlign: 'center' }}>
                                <span className="material-symbols-outlined campaign-arrow-icon">
                                  keyboard_arrow_down
                                </span>
                              </td>
                              <td>
                                <div className="campaign-name-cell">
                                  <div>
                                    <div className="campaign-details-name">{c.name}</div>
                                    <div className="campaign-id-sub">{c.nccCampaignId}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="type-badge">{c.campaignTp}</span>
                              </td>
                              <td>
                                {c.userLock === true ? (
                                  <span className="status-badge paused">정지 (OFF)</span>
                                ) : c.status === 'ELIGIBLE' ? (
                                  <span className="status-badge eligible">노출 가능</span>
                                ) : c.status === 'BUDGET_EXCEEDED' ? (
                                  <span className="status-badge budget-exceeded">예산 초과</span>
                                ) : (
                                  <span className="status-badge paused">정지</span>
                                )}

                              </td>
                              <td style={{ textAlign: 'right', fontWeight: '700' }}>
                                {hasLimit ? `${budget.toLocaleString()}원` : '제한 없음'}
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                                {spent.toLocaleString()}원
                              </td>
                              <td>
                                {hasLimit ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="kpi-progress-bar-bg" style={{ margin: 0, flex: 1 }}>
                                      <div 
                                        className={`kpi-progress-bar-fill ${rate >= 90 ? 'danger' : rate >= 70 ? 'warning' : ''}`}
                                        style={{ width: `${Math.min(rate, 100)}%` }}
                                      />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', minWidth: '32px' }}>
                                      {rate.toFixed(0)}%
                                    </span>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>-</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: '600' }}>
                                {c.stats ? `${c.stats.clkCnt.toLocaleString()}회` : '0회'}
                              </td>
                              <td style={{ textAlign: 'right', color: '#64748b' }}>
                                {c.stats ? `${c.stats.impCnt.toLocaleString()}회` : '0회'}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {c.stats && c.stats.clkCnt > 0 ? `${Math.round(c.stats.salesAmt / c.stats.clkCnt).toLocaleString()}원` : '-'}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  className="edit-budget-btn"
                                  onClick={(e) => openBudgetModal(e, 'campaign', c)}
                                >
                                  조정
                                </button>
                              </td>
                            </tr>
                            
                            {/* 아코디언 하위 광고그룹 노출 */}
                            {isExpanded && (
                              <tr className="expanded-panel-row">
                                <td colSpan="11">
                                  <div className="adgroups-container">
                                    <div className="adgroups-header">
                                      <h4>소속 광고그룹 목록</h4>
                                    </div>
                                    
                                    {loadingAdgroups && !adgroups[c.nccCampaignId] ? (
                                      <div style={{ textAlign: 'center', padding: '20px 0', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <span className="material-symbols-outlined spinner" style={{ fontSize: '24px', color: '#3b82f6' }}>
                                          sync
                                        </span>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px', fontWeight: '600' }}>광고그룹 목록을 불러오는 중...</div>
                                      </div>
                                    ) : !adgroups[c.nccCampaignId] || adgroups[c.nccCampaignId].length === 0 ? (
                                      <div style={{ textAlign: 'center', padding: '20px 0', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                                        이 캠페인 아래에 등록된 광고그룹이 없습니다.
                                      </div>
                                    ) : (
                                      <table className="adgroup-table">
                                        <thead>
                                          <tr>
                                            <th>광고그룹 정보</th>
                                            <th>상태</th>
                                            <th style={{ textAlign: 'right' }}>일일 예산</th>
                                            <th style={{ textAlign: 'right' }}>소진액</th>
                                            <th style={{ textAlign: 'right' }}>클릭수</th>
                                            <th style={{ textAlign: 'right' }}>노출수</th>
                                            <th style={{ textAlign: 'right' }}>CTR</th>
                                            <th style={{ textAlign: 'right' }}>평균 CPC</th>
                                            <th style={{ textAlign: 'center', width: '80px' }}>예산</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(adgroups[c.nccCampaignId] || []).filter(ag => !showOnlyOn || ag.userLock === false).map(ag => {
                                            const agSpent = ag.stats ? ag.stats.salesAmt : 0;
                                            const agBudget = ag.budget || 0;
                                            const agHasLimit = ag.useBudget && agBudget > 0;
                                            
                                            return (
                                              <tr key={ag.nccAdgroupId}>
                                                <td>
                                                  <div style={{ fontWeight: '600', color: '#334155' }}>{ag.name}</div>
                                                  <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '2px' }}>ID: {ag.nccAdgroupId}</div>
                                                </td>
                                                <td>
                                                  {ag.userLock === true ? (
                                                    <span className="status-badge paused" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>정지 (OFF)</span>
                                                  ) : ag.status === 'ELIGIBLE' ? (
                                                    <span className="status-badge eligible" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>노출 가능</span>
                                                  ) : ag.status === 'BUDGET_EXCEEDED' ? (
                                                    <span className="status-badge budget-exceeded" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>예산 초과</span>
                                                  ) : (
                                                    <span className="status-badge paused" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>정지</span>
                                                  )}
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: '700' }}>
                                                  {agHasLimit ? `${agBudget.toLocaleString()}원` : '제한 없음'}
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: '700' }}>
                                                  {agSpent.toLocaleString()}원
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: '600' }}>
                                                  {ag.stats ? `${ag.stats.clkCnt.toLocaleString()}회` : '0회'}
                                                </td>
                                                <td style={{ textAlign: 'right', color: '#64748b' }}>
                                                  {ag.stats ? `${ag.stats.impCnt.toLocaleString()}회` : '0회'}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                  {ag.stats ? `${ag.stats.ctr.toFixed(2)}%` : '0.00%'}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                  {ag.stats && ag.stats.clkCnt > 0 ? `${Math.round(ag.stats.salesAmt / ag.stats.clkCnt).toLocaleString()}원` : '-'}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                  <button 
                                                    className="edit-budget-btn"
                                                    style={{ padding: '4px 8px', fontSize: '0.725rem' }}
                                                    onClick={(e) => openBudgetModal(e, 'adgroup', ag)}
                                                  >
                                                    조정
                                                  </button>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

            {activeMenu === 'etc-account' && (
              isLoggedIn && currentUserInfo && (currentUserInfo.role === 'master' || currentUserInfo.role === 'admin') ? (
                <div style={{ padding: '24px 0', background: '#ffffff', borderRadius: '16px', border: '1px solid #edf2f7' }}>
                  <UserManagement customerUrl="atria" currentUserInfo={currentUserInfo} />
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', color: '#64748b' }}>
                  <h3>접근 권한이 없습니다. 관리자 계정으로 로그인하세요.</h3>
                </div>
              )
            )}
          </main>
        </div>
      )}

      {/* 예산 변경 모달 팝업 */}
      {isModalOpen && modalTarget && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="budget-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>일일 예산 조정</h4>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="target-info">
                <div className="target-type">{modalTarget.type === 'campaign' ? '캠페인 대상' : '광고그룹 대상'}</div>
                <div className="target-name">{modalTarget.name}</div>
              </div>
              
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '14px' }}>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={inputUseBudget} 
                      onChange={(e) => setInputUseBudget(e.target.checked)}
                    />
                    <span>일일 예산 한도 적용</span>
                  </label>
                </div>

                {inputUseBudget && (
                  <div>
                    <label>한도 금액 설정</label>
                    <div className="budget-input-wrapper">
                      <input 
                        type="number" 
                        value={inputBudget} 
                        onChange={(e) => setInputBudget(e.target.value)}
                        placeholder="금액을 입력하세요"
                        min="10000"
                        step="10000"
                      />
                      <span className="budget-unit">원</span>
                    </div>
                    <span className="budget-limits-hint">* 네이버 규정상 한도 설정 시 최소 10,000원 이상 입력해야 합니다.</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setIsModalOpen(false)}
                disabled={submittingBudget}
              >
                취소
              </button>
              <button 
                className="btn-primary" 
                onClick={handleBudgetSubmit}
                disabled={submittingBudget}
              >
                {submittingBudget ? '저장 중...' : '저장 및 반영'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 성공/실패 토스트 메시지 */}
      {toast.show && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span className="material-symbols-outlined toast-icon">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => setToast(prev => ({ ...prev, show: false }))}>
              &times;
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Atria;
