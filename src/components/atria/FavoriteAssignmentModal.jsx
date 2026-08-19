import React, { useState, useEffect, useMemo } from 'react';

export function FavoriteAssignmentModal({
  assignmentTarget,
  favoriteGroups,
  onSave,
  onClose
}) {
  if (!assignmentTarget) return null;

  const targetAdgroupId = assignmentTarget.adgroupId || assignmentTarget.id;

  // 초기 소속된 즐겨찾기 그룹 ID Set
  const initialSelectedIds = useMemo(() => {
    return new Set(
      favoriteGroups
        .filter(group => group.members?.some(member => member.adgroupId === targetAdgroupId))
        .map(group => group.id)
    );
  }, [favoriteGroups, targetAdgroupId]);

  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [submitting, setSubmitting] = useState(false);

  // 모달이 열리거나 타겟이 변경될 때 상태 초기화
  useEffect(() => {
    setSelectedIds(initialSelectedIds);
  }, [initialSelectedIds]);

  const handleToggle = (groupId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await onSave(selectedIds, initialSelectedIds, assignmentTarget);
      onClose();
    } catch (err) {
      console.error('Favorite assignment save failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !submitting && onClose()}>
      <div className="budget-modal favorite-assignment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="material-symbols-outlined modal-icon-star">star</span>
            <div>
              <h4>즐겨찾기 그룹 설정</h4>
              <p className="modal-subtitle">광고그룹을 포함할 즐겨찾기 그룹을 선택하세요.</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} disabled={submitting}>&times;</button>
        </div>

        <div className="favorite-assignment-modal-body">
          {/* 상단 대상 정보 배너 */}
          <div className="modal-target-banner">
            <span className="target-badge adgroup">광고그룹</span>
            <strong className="target-name">{assignmentTarget.name}</strong>
            <span className="target-id">{targetAdgroupId}</span>
          </div>

          {favoriteGroups.length === 0 ? (
            <div className="favorite-assignment-empty">
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#94a3b8', marginBottom: '6px' }}>star_outline</span>
              <div>등록된 즐겨찾기 그룹이 없습니다.</div>
              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                화면 상단의 [광고그룹 즐겨찾기] 영역에서 먼저 그룹을 생성해주세요.
              </p>
            </div>
          ) : (
            <div className="favorite-assignment-list">
              {favoriteGroups.map(group => {
                const isSelected = selectedIds.has(group.id);
                return (
                  <label 
                    key={group.id} 
                    className={`favorite-assignment-option ${isSelected ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggle(group.id);
                    }}
                  >
                    <div className="assignment-checkbox-wrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                      />
                    </div>
                    <div className="assignment-info">
                      <span className="assignment-name">{group.name}</span>
                      <div className="assignment-meta">
                        <span className="meta-budget">
                          {group.budget > 0 ? `예산 ${group.budget.toLocaleString()}원` : '예산 제한 없음'}
                        </span>
                        <span className="meta-dot">·</span>
                        <span className="meta-count">{group.members?.length || 0}개 소속</span>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined assignment-star ${isSelected ? 'active' : ''}`}>
                      {isSelected ? 'star' : 'star_outline'}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={onClose}
            disabled={submitting}
          >
            취소
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={submitting || favoriteGroups.length === 0}
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined spinner" style={{ fontSize: '16px' }}>progress_activity</span>
                <span>저장 중...</span>
              </>
            ) : (
              '저장'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
