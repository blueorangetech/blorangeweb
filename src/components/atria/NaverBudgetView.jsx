import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { manageNaverApi } from '../../api';
import { FavoriteGroupsSection } from './FavoriteGroupsSection';
import { CampaignsTableSection } from './CampaignsTableSection';
import { BudgetModal } from './BudgetModal';
import { FavoriteAssignmentModal } from './FavoriteAssignmentModal';
import { ExcelUploadPreviewModal } from './ExcelUploadPreviewModal';
import { ExcelDownloadWidget } from './ExcelDownloadWidget';
import { BudgetLogDrawer } from './BudgetLogDrawer';

export function NaverBudgetView({ customer = 'atria', onApiStatusChange }) {
  const { userName } = useAuth();
  const currentUserName = userName || '관리자';

  // 날짜 조회 기간 설정: 어제가 소속한 월 범위
  const getDefaultDateRange = () => {
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yYear = yesterday.getFullYear();
    const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
    const yDay = String(yesterday.getDate()).padStart(2, '0');
    return {
      start: `${yYear}-${yMonth}-01`,
      end: `${yYear}-${yMonth}-${yDay}`
    };
  };

  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);

  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [expandedCampaignId, setExpandedCampaignId] = useState(null);
  const [adgroups, setAdgroups] = useState({});
  const [loadingAdgroups, setLoadingAdgroups] = useState(false);

  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);

  const [selectedFavoriteGroupId, setSelectedFavoriteGroupId] = useState(null);
  const [favoriteGroups, setFavoriteGroups] = useState([]);
  const [groupDrafts, setGroupDrafts] = useState({});
  const [editingBudgetGroupId, setEditingBudgetGroupId] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupBudget, setNewGroupBudget] = useState('');
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [pendingFavoriteKeys, setPendingFavoriteKeys] = useState(() => new Set());
  const [assignmentTarget, setAssignmentTarget] = useState(null);
  const [selectedGroupAdgroups, setSelectedGroupAdgroups] = useState([]);
  const [loadingSelectedGroupAdgroups, setLoadingSelectedGroupAdgroups] = useState(false);

  // 엑셀 일괄 수정 관련 State
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelDownloading, setExcelDownloading] = useState(false);
  const [excelParsing, setExcelParsing] = useState(false);
  const [excelSubmitting, setExcelSubmitting] = useState(false);
  const [excelPreviewData, setExcelPreviewData] = useState(null);

  // 예산 조정 모달 State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState(null);
  const [budgetOption, setBudgetOption] = useState('campaign');
  const [inputBudget, setInputBudget] = useState('');
  const [submittingBudget, setSubmittingBudget] = useState(false);

  // ON 상태 필터 토글
  const [showOnlyOn, setShowOnlyOn] = useState(true);

  // 토스트 알림 State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const favoriteAdgroupIds = useMemo(() => {
    const ids = new Set();
    favoriteGroups.forEach(group => {
      group.members.forEach(member => {
        ids.add(member.adgroupId);
      });
    });
    return ids;
  }, [favoriteGroups]);

  const selectedFavoriteGroup = useMemo(() => {
    return favoriteGroups.find(group => group.id === selectedFavoriteGroupId) || null;
  }, [favoriteGroups, selectedFavoriteGroupId]);

  const selectedFavoriteAdgroupIds = useMemo(() => {
    if (!selectedFavoriteGroup) return new Set();
    return new Set(selectedFavoriteGroup.members.map(member => member.adgroupId));
  }, [selectedFavoriteGroup]);

  const favoriteAdgroupCountsByCampaign = useMemo(() => {
    const counts = {};
    favoriteGroups.forEach(group => {
      group.members.forEach(member => {
        counts[member.parentCampaignId] = (counts[member.parentCampaignId] || 0) + 1;
      });
    });
    return counts;
  }, [favoriteGroups]);

  const fetchCampaigns = useCallback(async (start = startDate, end = endDate) => {
    setLoadingCampaigns(true);
    if (onApiStatusChange) onApiStatusChange('loading');
    try {
      const res = await manageNaverApi.getCampaigns(customer, start, end);
      if (res.data) {
        setCampaigns(res.data);
        if (onApiStatusChange) onApiStatusChange(res.mode === 'real' ? 'connected' : 'mock');
      }
    } catch (err) {
      console.error('Error fetching Naver campaigns:', err);
      if (onApiStatusChange) onApiStatusChange('error');
      showToast('네이버 캠페인 정보를 불러오지 못했습니다.', 'error');
    } finally {
      setLoadingCampaigns(false);
    }
  }, [customer, startDate, endDate, onApiStatusChange]);

  const fetchFavoriteGroups = useCallback(async (start = startDate, end = endDate) => {
    setLoadingFavorites(true);
    try {
      const res = await manageNaverApi.getFavoriteGroups(customer, start, end);
      const groups = res.data || [];
      setFavoriteGroups(groups);
      setGroupDrafts(prev => {
        const next = { ...prev };
        groups.forEach(group => {
          if (!next[group.id]) {
            next[group.id] = { name: group.name, budget: group.budget };
          }
        });
        return next;
      });
      return groups;
    } catch (err) {
      console.error('Error fetching favorite groups:', err);
      showToast('즐겨찾기 그룹을 불러오지 못했습니다.', 'error');
      return [];
    } finally {
      setLoadingFavorites(false);
    }
  }, [customer, startDate, endDate]);

  const loadFavoriteGroupAdgroups = useCallback(async (group, start = startDate, end = endDate) => {
    if (!group || group.members.length === 0) {
      setSelectedGroupAdgroups([]);
      return;
    }
    setLoadingSelectedGroupAdgroups(true);
    try {
      const parentCampaignIds = [...new Set(group.members.map(member => member.parentCampaignId))];
      const memberIdSet = new Set(group.members.map(member => member.adgroupId));
      const adgroupResponses = await Promise.all(
        parentCampaignIds.map(async campaignId => {
          try {
            return await manageNaverApi.getAdgroups(campaignId, customer, start, end);
          } catch (error) {
            console.error(`Failed to load adgroups for campaign ${campaignId}:`, error);
            return { data: [] };
          }
        })
      );

      const matchedAdgroups = [];
      adgroupResponses.forEach(res => {
        (res?.data || []).forEach(ag => {
          if (memberIdSet.has(ag.nccAdgroupId)) {
            matchedAdgroups.push(ag);
          }
        });
      });
      setSelectedGroupAdgroups(matchedAdgroups);
    } catch (err) {
      console.error('Error loading favorite group adgroups:', err);
      showToast('즐겨찾기 광고그룹 상세 정보를 불러오지 못했습니다.', 'error');
    } finally {
      setLoadingSelectedGroupAdgroups(false);
    }
  }, [customer, startDate, endDate]);

  useEffect(() => {
    fetchCampaigns();
    fetchFavoriteGroups();
  }, [fetchCampaigns, fetchFavoriteGroups]);

  const selectFavoriteGroup = async (group) => {
    if (selectedFavoriteGroupId === group.id) {
      setSelectedFavoriteGroupId(null);
      setSelectedGroupAdgroups([]);
      return;
    }
    setSelectedFavoriteGroupId(group.id);
    await loadFavoriteGroupAdgroups(group);
  };

  const toggleCampaignExpand = async (campaignId) => {
    if (expandedCampaignId === campaignId) {
      setExpandedCampaignId(null);
      return;
    }
    setExpandedCampaignId(campaignId);
    if (!adgroups[campaignId]) {
      setLoadingAdgroups(true);
      try {
        const res = await manageNaverApi.getAdgroups(campaignId, customer, startDate, endDate);
        if (res.data) {
          setAdgroups(prev => ({ ...prev, [campaignId]: res.data }));
        }
      } catch (err) {
        console.error('Error fetching Naver adgroups:', err);
        showToast('광고그룹을 불러오지 못했습니다.', 'error');
      } finally {
        setLoadingAdgroups(false);
      }
    }
  };

  // 엑셀 다운로드
  const downloadExcelTemplate = async () => {
    setExcelDownloading(true);
    try {
      let blob;
      let filename;
      if (selectedFavoriteGroup) {
        blob = await manageNaverApi.downloadFavoriteGroupExcel(selectedFavoriteGroup.id, customer, startDate, endDate);
        filename = `${selectedFavoriteGroup.name}_예산수정양식.xlsx`;
      } else {
        blob = await manageNaverApi.downloadAllAdgroupsExcel(customer, startDate, endDate);
        filename = `전체광고그룹_예산수정양식.xlsx`;
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('엑셀 양식 다운로드가 완료되었습니다.');
    } catch (err) {
      console.error('Failed to download excel:', err);
      showToast(`엑셀 다운로드 실패: ${err.message}`, 'error');
    } finally {
      setExcelDownloading(false);
    }
  };

  // 엑셀 파일 선택 및 분석
  const handleExcelFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelParsing(true);
    setExcelPreviewData(null);
    try {
      const res = await manageNaverApi.uploadAdgroupBudgetExcel(file, customer);
      setExcelPreviewData(res);
      showToast(`엑셀 분석 완료: 총 ${res.totalRows}건 (적용 가능 ${res.validCount}건, 오류 ${res.invalidCount}건)`);
    } catch (err) {
      console.error('Excel parse error:', err);
      showToast(`엑셀 파싱 실패: ${err.message}`, 'error');
    } finally {
      setExcelParsing(false);
      e.target.value = '';
    }
  };

  // 엑셀 일괄 적용 실행
  const handleApplyExcelBudgets = async () => {
    if (!excelPreviewData || !excelPreviewData.items) return;
    const validItems = excelPreviewData.items
      .filter(item => item.isValid)
      .map(item => ({
        adgroupId: item.adgroupId,
        name: item.name,
        budget: item.budget,
        useBudget: item.useBudget,
        prevBudget: item.currentBudget,
        parentCampaignId: item.parentCampaignId,
      }));

    if (validItems.length === 0) {
      showToast('적용할 유효한 광고그룹 항목이 없습니다.', 'error');
      return;
    }

    setExcelSubmitting(true);
    try {
      const res = await manageNaverApi.updateAdgroupBudgets(validItems, customer, currentUserName);
      showToast(`일괄 수정 완료: 성공 ${res.successCount}건 / 실패 ${res.failureCount}건`, res.status === 'success' ? 'success' : 'error');
      setIsExcelModalOpen(false);
      setExcelPreviewData(null);
      setAdgroups({});
      setExpandedCampaignId(null);
      await fetchCampaigns();
      const groups = await fetchFavoriteGroups();
      const selectedGroup = groups.find(g => g.id === selectedFavoriteGroupId);
      if (selectedGroup) await loadFavoriteGroupAdgroups(selectedGroup);
    } catch (err) {
      console.error('Bulk update error:', err);
      showToast(`일괄 수정 실패: ${err.message}`, 'error');
    } finally {
      setExcelSubmitting(false);
    }
  };

  // 즐겨찾기 그룹 CRUD
  const createFavoriteGroup = async () => {
    const name = newGroupName.trim();
    const budget = Number(String(newGroupBudget).replace(/,/g, '') || 0);
    if (!name) {
      showToast('그룹 이름을 입력해주세요.', 'error');
      return;
    }
    if (!Number.isFinite(budget) || budget < 0) {
      showToast('예산은 0원 이상의 숫자로 입력해주세요.', 'error');
      return;
    }
    setLoadingFavorites(true);
    try {
      await manageNaverApi.createFavoriteGroup(name, budget, customer, currentUserName);
      setNewGroupName('');
      setNewGroupBudget('');
      const groups = await fetchFavoriteGroups();
      const selectedGroup = groups.find(item => item.id === selectedFavoriteGroupId);
      if (selectedGroup) await loadFavoriteGroupAdgroups(selectedGroup);
      showToast('즐겨찾기 그룹을 만들었습니다.');
    } catch (err) {
      showToast(`그룹 생성 실패: ${err.message}`, 'error');
      setLoadingFavorites(false);
    }
  };

  const updateFavoriteGroup = async (groupId) => {
    const group = favoriteGroups.find(g => g.id === groupId);
    const draft = groupDrafts[groupId];
    const name = (draft?.name !== undefined ? draft.name : (group?.name || '')).trim();
    const rawBudget = draft?.budget !== undefined ? draft.budget : (group?.budget ?? 0);
    const budget = Number(String(rawBudget).replace(/,/g, ''));
    if (!name || !Number.isFinite(budget) || budget < 0) {
      showToast('그룹 이름과 0원 이상의 예산을 확인해주세요.', 'error');
      return;
    }
    setLoadingFavorites(true);
    try {
      await manageNaverApi.updateFavoriteGroup(groupId, name, budget, customer, currentUserName);
      setEditingBudgetGroupId(null);
      const groups = await fetchFavoriteGroups();
      const selectedGroup = groups.find(item => item.id === selectedFavoriteGroupId);
      if (selectedGroup) await loadFavoriteGroupAdgroups(selectedGroup);
      showToast('그룹 정보를 수정했습니다.');
    } catch (err) {
      showToast(`그룹 수정 실패: ${err.message}`, 'error');
      setLoadingFavorites(false);
    }
  };

  const deleteFavoriteGroup = async (group) => {
    if (!window.confirm(`'${group.name}' 그룹을 삭제할까요?`)) return;
    setLoadingFavorites(true);
    try {
      await manageNaverApi.deleteFavoriteGroup(group.id, customer);
      if (selectedFavoriteGroupId === group.id) {
        setSelectedFavoriteGroupId(null);
        setSelectedGroupAdgroups([]);
      }
      await fetchFavoriteGroups();
      showToast('즐겨찾기 그룹을 삭제했습니다.');
    } catch (err) {
      showToast(`그룹 삭제 실패: ${err.message}`, 'error');
      setLoadingFavorites(false);
    }
  };

  const handleSaveFavoriteAssignment = async (selectedIds, initialSelectedIds, target) => {
    const targetAdgroupId = target.adgroupId || target.id;
    const parentCampaignId = target.parentCampaignId;

    const toAdd = [];
    const toRemove = [];

    favoriteGroups.forEach(group => {
      const wasMember = initialSelectedIds.has(group.id);
      const isNowMember = selectedIds.has(group.id);
      if (!wasMember && isNowMember) {
        toAdd.push(group.id);
      } else if (wasMember && !isNowMember) {
        toRemove.push(group.id);
      }
    });

    if (toAdd.length === 0 && toRemove.length === 0) {
      return;
    }

    try {
      for (const groupId of toAdd) {
        await manageNaverApi.addFavoriteGroupMember(groupId, targetAdgroupId, parentCampaignId, customer);
      }
      for (const groupId of toRemove) {
        await manageNaverApi.removeFavoriteGroupMember(groupId, targetAdgroupId, customer);
      }

      const groups = await fetchFavoriteGroups();
      const selectedGroup = groups.find(item => item.id === selectedFavoriteGroupId);
      if (selectedGroup) await loadFavoriteGroupAdgroups(selectedGroup);
      showToast('즐겨찾기 그룹 설정이 저장되었습니다.');
    } catch (err) {
      showToast(`즐겨찾기 설정 저장 실패: ${err.message}`, 'error');
      throw err;
    }
  };

  // 모달 열기
  const openBudgetModal = (e, type, target) => {
    e.stopPropagation();
    const currentBudget = target.budget ?? target.dailyBudget ?? 0;
    const currentUseBudget = target.useBudget ?? target.useDailyBudget ?? false;

    let initialOption = 'custom';
    if (!currentUseBudget) {
      initialOption = type === 'adgroup' ? 'campaign' : 'unlimited';
    }

    const targetId = type === 'campaign' 
      ? (target.nccCampaignId || target.id) 
      : (target.nccAdgroupId || target.id);

    setModalTarget({
      type,
      id: targetId,
      name: target.name,
      currentBudget,
      currentUseBudget,
      parentCampaignId: target.parentCampaignId || target.nccCampaignId
    });
    setBudgetOption(initialOption);
    setInputBudget(currentBudget > 0 ? currentBudget : 10000);
    setIsModalOpen(true);
  };

  // 예산 변경 제출
  const handleBudgetSubmit = async () => {
    if (!modalTarget) return;

    let targetUseBudget = true;
    let targetBudget = 0;

    if (budgetOption === 'campaign' || budgetOption === 'unlimited') {
      targetUseBudget = false;
      targetBudget = 0;
    } else {
      targetUseBudget = true;
      targetBudget = Number(inputBudget);
      if (isNaN(targetBudget) || targetBudget < 50) {
        showToast('특정 금액 설정 시 최소 50원 이상 입력해야 합니다.', 'error');
        return;
      }
    }

    setSubmittingBudget(true);
    try {
      const { type, id, parentCampaignId, name, currentBudget, currentUseBudget } = modalTarget;
      let res;
      const metaOptions = {
        name,
        parentCampaignId,
        prevBudget: currentBudget,
        prevUseBudget: currentUseBudget,
        userName: currentUserName,
      };

      if (type === 'campaign') {
        res = await manageNaverApi.updateCampaignBudget(id, targetBudget, targetUseBudget, customer, metaOptions);
      } else {
        res = await manageNaverApi.updateAdgroupBudget(id, targetBudget, targetUseBudget, customer, metaOptions);
      }

      if (res.status === 'success') {
        showToast(`${modalTarget.name} 예산이 변경되었습니다.`);
        setIsModalOpen(false);

        if (type === 'campaign') {
          setCampaigns(prev => prev.map(c => 
            c.nccCampaignId === id 
              ? { ...c, budget: targetBudget, useBudget: targetUseBudget } 
              : c
          ));
        } else {
          if (parentCampaignId && adgroups[parentCampaignId]) {
            setAdgroups(prev => ({
              ...prev,
              [parentCampaignId]: prev[parentCampaignId].map(ag => 
                ag.nccAdgroupId === id 
                  ? { ...ag, budget: targetBudget, useBudget: targetUseBudget, dailyBudget: targetBudget, useDailyBudget: targetUseBudget } 
                  : ag
              )
            }));
          }
          if (selectedFavoriteGroup) {
            await loadFavoriteGroupAdgroups(selectedFavoriteGroup);
          }
        }
      } else {
        showToast('예산 변경에 실패했습니다.', 'error');
      }
    } catch (err) {
      console.error('Error updating budget:', err);
      showToast(`오류 발생: ${err.message}`, 'error');
    } finally {
      setSubmittingBudget(false);
    }
  };

  const visibleCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      if (showOnlyOn && c.userLock !== false) return false;
      if (selectedFavoriteGroup) {
        const campaignMemberCount = selectedFavoriteGroup.members.filter(
          member => member.parentCampaignId === c.nccCampaignId
        ).length;
        return campaignMemberCount > 0;
      }
      return true;
    });
  }, [campaigns, selectedFavoriteGroup, showOnlyOn]);

  const summary = useMemo(() => {
    let totalBudget = 0;
    let totalSpent = 0;
    let totalClicks = 0;
    let totalImpressions = 0;

    if (selectedFavoriteGroup) {
      totalBudget = selectedFavoriteGroup.budget;
      totalSpent = selectedFavoriteGroup.spent;
      totalClicks = selectedFavoriteGroup.clicks;
      totalImpressions = selectedFavoriteGroup.impressions;
    } else {
      campaigns.forEach(c => {
        if (c.useBudget) totalBudget += c.budget || 0;
        if (c.stats) {
          totalSpent += c.stats.salesAmt || 0;
          totalClicks += c.stats.clkCnt || 0;
          totalImpressions += c.stats.impCnt || 0;
        }
      });
    }

    const spendRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cpc = totalClicks > 0 ? totalSpent / totalClicks : 0;

    return {
      totalBudget,
      totalSpent,
      spendRate,
      totalClicks,
      totalImpressions,
      ctr,
      cpc,
    };
  }, [campaigns, selectedFavoriteGroup]);

  return (
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
            className="header-log-btn"
            onClick={() => setIsLogDrawerOpen(true)}
            title="예산 변경 이력(로그) 보기"
          >
            <span className="material-symbols-outlined">history</span>
            <span>변경 이력</span>
          </button>
          <button 
            className="refresh-btn" 
            onClick={async () => {
              fetchCampaigns();
              const groups = await fetchFavoriteGroups();
              const selectedGroup = groups.find(group => group.id === selectedFavoriteGroupId);
              if (selectedGroup) await loadFavoriteGroupAdgroups(selectedGroup);
            }}
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
            onClick={async () => {
              setAdgroups({});
              setExpandedCampaignId(null);
              fetchCampaigns(startDate, endDate);
              const groups = await fetchFavoriteGroups(startDate, endDate);
              const selectedGroup = groups.find(group => group.id === selectedFavoriteGroupId);
              if (selectedGroup) await loadFavoriteGroupAdgroups(selectedGroup, startDate, endDate);
            }}
            disabled={loadingCampaigns}
          >
            조회
          </button>
        </div>
      </div>

      {/* 즐겨찾기 그룹 섹션 */}
      <FavoriteGroupsSection
        favoriteGroups={favoriteGroups}
        loadingFavorites={loadingFavorites}
        selectedFavoriteGroupId={selectedFavoriteGroupId}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        newGroupBudget={newGroupBudget}
        setNewGroupBudget={setNewGroupBudget}
        groupDrafts={groupDrafts}
        setGroupDrafts={setGroupDrafts}
        editingBudgetGroupId={editingBudgetGroupId}
        setEditingBudgetGroupId={setEditingBudgetGroupId}
        onCreateGroup={createFavoriteGroup}
        onSelectGroup={selectFavoriteGroup}
        onUpdateGroup={updateFavoriteGroup}
        onDeleteGroup={deleteFavoriteGroup}
      />

      {/* 캠페인/광고그룹 목록 및 KPI 테이블 섹션 */}
      <CampaignsTableSection
        summary={summary}
        startDate={startDate}
        endDate={endDate}
        selectedFavoriteGroup={selectedFavoriteGroup}
        selectedGroupAdgroups={selectedGroupAdgroups}
        loadingSelectedGroupAdgroups={loadingSelectedGroupAdgroups}
        loadingCampaigns={loadingCampaigns}
        visibleCampaigns={visibleCampaigns}
        adgroups={adgroups}
        loadingAdgroups={loadingAdgroups}
        expandedCampaignId={expandedCampaignId}
        showOnlyOn={showOnlyOn}
        favoriteAdgroupIds={favoriteAdgroupIds}
        favoriteAdgroupCountsByCampaign={favoriteAdgroupCountsByCampaign}
        selectedFavoriteAdgroupIds={selectedFavoriteAdgroupIds}
        excelDownloading={excelDownloading}
        onDownloadExcelTemplate={downloadExcelTemplate}
        onOpenExcelUploadModal={() => {
          setExcelPreviewData(null);
          setIsExcelModalOpen(true);
        }}
        onToggleCampaignExpand={toggleCampaignExpand}
        onOpenBudgetModal={openBudgetModal}
        onOpenAssignmentModal={setAssignmentTarget}
      />

      {/* 즐겨찾기 그룹 배정 모달 */}
      <FavoriteAssignmentModal
        assignmentTarget={assignmentTarget}
        favoriteGroups={favoriteGroups}
        onSave={handleSaveFavoriteAssignment}
        onClose={() => setAssignmentTarget(null)}
      />

      {/* 예산 변경 모달 */}
      <BudgetModal
        isOpen={isModalOpen}
        modalTarget={modalTarget}
        budgetOption={budgetOption}
        setBudgetOption={setBudgetOption}
        inputBudget={inputBudget}
        setInputBudget={setInputBudget}
        submittingBudget={submittingBudget}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBudgetSubmit}
      />

      {/* 엑셀 대량 예산 수정 모달 */}
      <ExcelUploadPreviewModal
        isOpen={isExcelModalOpen}
        excelSubmitting={excelSubmitting}
        excelParsing={excelParsing}
        excelDownloading={excelDownloading}
        excelPreviewData={excelPreviewData}
        selectedFavoriteGroup={selectedFavoriteGroup}
        onClose={() => setIsExcelModalOpen(false)}
        onFileSelect={handleExcelFileSelect}
        onDownloadTemplate={downloadExcelTemplate}
        onApplyBudgets={handleApplyExcelBudgets}
      />

      {/* 엑셀 다운로드 로딩 플로팅 위젯 */}
      <ExcelDownloadWidget isVisible={excelDownloading} />

      {/* 예산 변경 이력 슬라이딩 드로어 */}
      <BudgetLogDrawer
        isOpen={isLogDrawerOpen}
        onClose={() => setIsLogDrawerOpen(false)}
        customer={customer}
      />

      {/* 토스트 알림 */}
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
    </>
  );
}
