import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { manageNaverApi } from '../../api';

export function BudgetLogDrawer({ isOpen, onClose, customer = 'atria' }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);

  // 필터 State
  const [targetType, setTargetType] = useState('all');
  const [changeType, setChangeType] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('30days'); // 'today', '7days', '30days', 'all'
  const [expandedBatchIds, setExpandedBatchIds] = useState(() => new Set());

  // 날짜 범위 계산
  const getDateRange = useCallback((filter) => {
    const now = new Date();
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = formatDate(now);

    if (filter === 'today') {
      return { start: todayStr, end: todayStr };
    } else if (filter === '7days') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: formatDate(past), end: todayStr };
    } else if (filter === '30days') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: formatDate(past), end: todayStr };
    }
    return { start: undefined, end: undefined };
  }, []);

  const fetchLogs = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const { start, end } = getDateRange(dateFilter);
      const res = await manageNaverApi.getBudgetLogs({
        customer,
        startDate: start,
        endDate: end,
        targetType,
        changeType,
        search,
        page,
        pageSize,
      });

      setLogs(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to fetch budget logs:', err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, customer, dateFilter, targetType, changeType, search, page, pageSize, getDateRange]);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, fetchLogs]);

  const toggleBatchExpand = (batchId) => {
    setExpandedBatchIds(prev => {
      const next = new Set(prev);
      if (next.has(batchId)) {
        next.delete(batchId);
      } else {
        next.add(batchId);
      }
      return next;
    });
  };

  // 날짜/시간 포맷팅 (KST)
  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    try {
      const dt = new Date(isoString);
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      const hours = String(dt.getHours()).padStart(2, '0');
      const mins = String(dt.getMinutes()).padStart(2, '0');
      const secs = String(dt.getSeconds()).padStart(2, '0');
      return `${year}.${month}.${day} ${hours}:${mins}:${secs}`;
    } catch {
      return isoString;
    }
  };

  // 배치 묶음 그룹화 (동일 batch_id 항목들을 묶음)
  const groupedLogs = useMemo(() => {
    const groups = [];
    const batchMap = new Map();

    logs.forEach(log => {
      const batchId = log.batch_id;
      if (log.batch_total > 1 && batchId) {
        if (!batchMap.has(batchId)) {
          const groupObj = {
            isBatch: true,
            batchId,
            batchTotal: log.batch_total,
            changeType: log.change_type,
            createdAt: log.created_at,
            userName: log.user_name,
            items: [],
          };
          batchMap.set(batchId, groupObj);
          groups.push(groupObj);
        }
        batchMap.get(batchId).items.push(log);
      } else {
        groups.push({
          isBatch: false,
          ...log,
        });
      }
    });

    return groups;
  }, [logs]);

  // 대상 유형 뱃지 렌더링
  const renderTargetBadge = (type) => {
    switch (type) {
      case 'campaign':
        return <span className="log-type-badge campaign">캠페인</span>;
      case 'favorite_group':
        return <span className="log-type-badge favorite">즐겨찾기</span>;
      default:
        return <span className="log-type-badge adgroup">광고그룹</span>;
    }
  };

  // 변경 방식 뱃지 렌더링
  const renderChangeTypeBadge = (type) => {
    switch (type) {
      case 'bulk_excel':
        return <span className="log-source-badge excel">엑셀 대량 수정</span>;
      case 'favorite_card':
        return <span className="log-source-badge favorite">즐겨찾기 카드</span>;
      default:
        return <span className="log-source-badge single">단일 수정</span>;
    }
  };

  // 예산 차이(Diff) 뱃지 렌더링
  const renderBudgetDiff = (prevBudget, prevUseBudget, newBudget, newUseBudget) => {
    const prevText = prevUseBudget && prevBudget > 0 ? `${prevBudget.toLocaleString()}원` : '제한 없음';
    const newText = newUseBudget && newBudget > 0 ? `${newBudget.toLocaleString()}원` : '제한 없음';

    let diffText = '';
    let diffClass = 'neutral';

    if (prevUseBudget && newUseBudget) {
      const diff = newBudget - prevBudget;
      if (diff > 0) {
        diffText = `+${diff.toLocaleString()}원 증액`;
        diffClass = 'increase';
      } else if (diff < 0) {
        diffText = `${diff.toLocaleString()}원 감액`;
        diffClass = 'decrease';
      } else {
        diffText = '금액 변동 없음';
      }
    } else if (!prevUseBudget && newUseBudget) {
      diffText = '한도 신규 설정';
      diffClass = 'increase';
    } else if (prevUseBudget && !newUseBudget) {
      diffText = '한도 해제 (제한 없음)';
      diffClass = 'decrease';
    }

    return (
      <div className="log-diff-row">
        <span className="diff-amount prev">{prevText}</span>
        <span className="material-symbols-outlined diff-arrow">arrow_forward</span>
        <span className="diff-amount new">{newText}</span>
        {diffText && <span className={`diff-pill ${diffClass}`}>{diffText}</span>}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="budget-drawer-overlay" onClick={onClose}>
      <aside className="budget-log-drawer" onClick={(e) => e.stopPropagation()}>
        {/* 드로어 헤더 */}
        <div className="drawer-header">
          <div className="drawer-title-wrap">
            <span className="material-symbols-outlined drawer-header-icon">history</span>
            <div>
              <h3>예산 변경 이력</h3>
              <p className="drawer-subtitle">캠페인 및 광고그룹의 실시간 예산 수정 기록을 확인합니다.</p>
            </div>
          </div>
          <div className="drawer-header-actions">
            <button 
              type="button" 
              className="drawer-refresh-btn" 
              onClick={fetchLogs} 
              disabled={loading}
              title="새로고침"
            >
              <span className={`material-symbols-outlined ${loading ? 'spinner' : ''}`}>
                refresh
              </span>
            </button>
            <button 
              type="button" 
              className="drawer-close-btn" 
              onClick={onClose}
              title="닫기"
            >
              &times;
            </button>
          </div>
        </div>

        {/* 필터 컨트롤 바 */}
        <div className="drawer-filter-bar">
          {/* 기간 필터 */}
          <div className="filter-pill-group">
            <button 
              className={`filter-pill ${dateFilter === 'today' ? 'active' : ''}`}
              onClick={() => { setDateFilter('today'); setPage(1); }}
            >
              오늘
            </button>
            <button 
              className={`filter-pill ${dateFilter === '7days' ? 'active' : ''}`}
              onClick={() => { setDateFilter('7days'); setPage(1); }}
            >
              최근 7일
            </button>
            <button 
              className={`filter-pill ${dateFilter === '30days' ? 'active' : ''}`}
              onClick={() => { setDateFilter('30days'); setPage(1); }}
            >
              최근 30일
            </button>
            <button 
              className={`filter-pill ${dateFilter === 'all' ? 'active' : ''}`}
              onClick={() => { setDateFilter('all'); setPage(1); }}
            >
              전체
            </button>
          </div>

          {/* 대상 유형 & 검색창 */}
          <div className="filter-inputs-row">
            <select 
              value={targetType} 
              onChange={(e) => { setTargetType(e.target.value); setPage(1); }}
              className="drawer-select"
            >
              <option value="all">전체 대상</option>
              <option value="campaign">캠페인</option>
              <option value="adgroup">광고그룹</option>
              <option value="favorite_group">즐겨찾기 그룹</option>
            </select>

            <select 
              value={changeType} 
              onChange={(e) => { setChangeType(e.target.value); setPage(1); }}
              className="drawer-select"
            >
              <option value="all">전체 변경 방식</option>
              <option value="single_modal">단일 수정</option>
              <option value="bulk_excel">엑셀 대량</option>
              <option value="favorite_card">즐겨찾기</option>
            </select>

            <div className="drawer-search-wrap">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchLogs(); } }}
                placeholder="대상명 / ID 검색"
                className="drawer-search-input"
              />
              <span 
                className="material-symbols-outlined search-icon"
                onClick={() => { setPage(1); fetchLogs(); }}
              >
                search
              </span>
            </div>
          </div>
        </div>

        {/* 통계 요약 바 */}
        <div className="drawer-summary-bar">
          <span>총 <strong>{total}</strong>건의 변경 이력</span>
          {loading && <span className="drawer-loading-hint">이력을 불러오는 중...</span>}
        </div>

        {/* 로그 리스트 본문 */}
        <div className="drawer-body">
          {loading && logs.length === 0 ? (
            <div className="drawer-empty-state">
              <span className="material-symbols-outlined spinner" style={{ fontSize: '32px', color: '#3b82f6' }}>
                progress_activity
              </span>
              <p>변경 이력을 불러오고 있습니다...</p>
            </div>
          ) : groupedLogs.length === 0 ? (
            <div className="drawer-empty-state">
              <span className="material-symbols-outlined empty-icon">manage_history</span>
              <p>해당 조건의 예산 변경 이력이 없습니다.</p>
            </div>
          ) : (
            <div className="log-timeline-list">
              {groupedLogs.map((entry, index) => {
                // 배치 묶음 카드
                if (entry.isBatch) {
                  const isExpanded = expandedBatchIds.has(entry.batchId);
                  const validNames = entry.items.map(i => i.target_name).filter(n => n && !n.startsWith('grp-'));
                  const targetSummary = validNames.length > 0
                    ? (validNames.slice(0, 2).join(', ') + (validNames.length > 2 ? ` 외 ${validNames.length - 2}건` : ''))
                    : (entry.items.map(i => i.target_name).slice(0, 2).join(', ') + (entry.items.length > 2 ? ` 외 ${entry.items.length - 2}건` : ''));

                  return (
                    <div key={entry.batchId || index} className="batch-log-card">
                      <div 
                        className="batch-log-header" 
                        onClick={() => toggleBatchExpand(entry.batchId)}
                      >
                        <div className="batch-header-left">
                          <span className="material-symbols-outlined batch-icon">layers</span>
                          <div className="batch-header-text-block">
                            <div className="batch-title-row">
                              <span className="batch-title">엑셀 대량 예산 수정</span>
                              <span className="batch-count-pill">{entry.batchTotal}건 일괄 반영</span>
                              {entry.items?.[0]?.user_name && (
                                <span className="log-user-badge batch" title="수정자">
                                  <span className="material-symbols-outlined user-icon">person</span>
                                  <span>{entry.items[0].user_name}</span>
                                </span>
                              )}
                            </div>
                            {targetSummary && (
                              <div className="batch-targets-summary">{targetSummary}</div>
                            )}
                            <span className="batch-time">{formatDateTime(entry.createdAt)}</span>
                          </div>
                        </div>
                        <div className="batch-header-right">
                          <span className="material-symbols-outlined chevron">
                            {isExpanded ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>
                      </div>

                      {/* 배치 아코디언 세부 항목 목록 */}
                      {isExpanded && (
                        <div className="batch-log-sublist">
                          {entry.items.map((item) => (
                            <div key={item.id} className="batch-sub-item">
                              <div className="sub-item-header">
                                <div className="sub-item-name-wrap">
                                  <div className="sub-item-name">{item.target_name}</div>
                                  <div className="sub-item-id-row">
                                    <span className="sub-item-id">{item.target_id}</span>
                                  </div>
                                </div>
                                <span className={`sub-item-status ${item.status}`}>
                                  {item.status === 'success' ? '성공' : '실패'}
                                </span>
                              </div>
                              {renderBudgetDiff(
                                item.prev_budget,
                                item.prev_use_budget,
                                item.new_budget,
                                item.new_use_budget
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // 단일 수정 로그 카드
                return (
                  <div key={entry.id || index} className="single-log-card">
                    <div className="log-card-header">
                      <div className="log-target-wrap">
                        <div className="log-target-title-row">
                          {renderTargetBadge(entry.target_type)}
                          <span className="log-target-name">{entry.target_name}</span>
                        </div>
                        <div className="log-target-id-row">
                          <span className="log-target-id">{entry.target_id}</span>
                        </div>
                      </div>
                      <span className="log-time">{formatDateTime(entry.created_at)}</span>
                    </div>

                    <div className="log-card-body">
                      {renderBudgetDiff(
                        entry.prev_budget,
                        entry.prev_use_budget,
                        entry.new_budget,
                        entry.new_use_budget
                      )}
                    </div>

                    <div className="log-card-footer">
                      <div className="footer-left">
                        {renderChangeTypeBadge(entry.change_type)}
                        {entry.user_name && (
                          <span className="log-user-badge" title="수정자">
                            <span className="material-symbols-outlined user-icon">person</span>
                            <span>{entry.user_name}</span>
                          </span>
                        )}
                        {entry.parent_name && (
                          <span className="log-parent-name">상위: {entry.parent_name}</span>
                        )}
                      </div>
                      <span className={`log-status-badge ${entry.status}`}>
                        {entry.status === 'success' ? '정상 반영' : '반영 실패'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 드로어 푸터 페이징 */}
        {total > pageSize && (
          <div className="drawer-footer">
            <button 
              type="button" 
              className="drawer-page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              이전
            </button>
            <span className="page-indicator">
              {page} / {Math.ceil(total / pageSize)}
            </span>
            <button 
              type="button" 
              className="drawer-page-btn"
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= total || loading}
            >
              다음
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
