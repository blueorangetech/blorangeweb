import React from 'react';

export function FavoriteAssignmentModal({
  assignmentTarget,
  favoriteGroups,
  pendingFavoriteKeys,
  onToggleMembership,
  onClose
}) {
  if (!assignmentTarget) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="budget-modal favorite-assignment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="material-symbols-outlined modal-icon-star">star</span>
            <div>
              <h4>즐겨찾기 그룹 설정</h4>
              <p className="modal-subtitle">광고그룹을 포함할 즐겨찾기 그룹을 선택하세요.</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="modal-target-card">
            <span className="target-badge">광고그룹</span>
            <strong className="target-name">{assignmentTarget.name}</strong>
          </div>

          {favoriteGroups.length === 0 ? (
            <div className="favorite-assignment-empty">
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#94a3b8', marginBottom: '6px' }}>star_outline</span>
              <div>등록된 즐겨찾기 그룹이 없습니다.</div>
              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>화면 상단의 [광고그룹 즐겨찾기] 영역에서 먼저 그룹을 생성해주세요.</p>
            </div>
          ) : (
            <div className="favorite-assignment-list">
              {favoriteGroups.map(group => {
                const isMember = group.members.some(member => member.adgroupId === assignmentTarget.adgroupId);
                const pendingKey = `${group.id}:${assignmentTarget.adgroupId}`;
                const isPending = pendingFavoriteKeys.has(pendingKey);
                return (
                  <label key={group.id} className={`favorite-assignment-option ${isMember ? 'active' : ''} ${isPending ? 'pending' : ''}`}>
                    <div className="assignment-checkbox-wrap">
                      <input
                        type="checkbox"
                        checked={isMember}
                        disabled={isPending}
                        onChange={(e) => onToggleMembership(e, group, assignmentTarget)}
                      />
                    </div>
                    <div className="assignment-info">
                      <span className="assignment-name">{group.name}</span>
                      <div className="assignment-meta">
                        <span className="meta-budget">{group.budget > 0 ? `예산 ${group.budget.toLocaleString()}원` : '예산 제한 없음'}</span>
                        <span className="meta-dot">·</span>
                        <span className="meta-count">{group.members.length}개 소속</span>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined assignment-star ${isMember ? 'active' : ''}`}>
                      {isMember ? 'star' : 'star_outline'}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>완료</button>
        </div>
      </div>
    </div>
  );
}
