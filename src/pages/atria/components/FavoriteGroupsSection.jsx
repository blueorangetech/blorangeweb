import React from 'react';

export function FavoriteGroupsSection({
  favoriteGroups,
  loadingFavorites,
  selectedFavoriteGroupId,
  newGroupName,
  setNewGroupName,
  newGroupBudget,
  setNewGroupBudget,
  groupDrafts,
  setGroupDrafts,
  editingBudgetGroupId,
  setEditingBudgetGroupId,
  onCreateGroup,
  onSelectGroup,
  onUpdateGroup,
  onDeleteGroup
}) {
  return (
    <section className="favorite-groups-section">
      <div className="favorite-groups-heading">
        <div>
          <h3>광고그룹 즐겨찾기</h3>
          <p>그룹별 예산 대비 선택 기간의 광고그룹 소진액을 확인합니다.</p>
        </div>
        <div className="favorite-group-create-form">
          <input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="새 그룹 이름"
            maxLength={50}
          />
          <input
            type="text"
            value={newGroupBudget ? Number(String(newGroupBudget).replace(/,/g, '')).toLocaleString() : ''}
            onChange={(e) => {
              const rawVal = e.target.value.replace(/[^0-9]/g, '');
              setNewGroupBudget(rawVal);
            }}
            placeholder="예산 금액 (원)"
          />
          <button type="button" onClick={onCreateGroup} disabled={loadingFavorites}>
            그룹 추가
          </button>
        </div>
      </div>

      {loadingFavorites && favoriteGroups.length === 0 ? (
        <div className="favorite-groups-empty">즐겨찾기 그룹을 불러오는 중...</div>
      ) : favoriteGroups.length === 0 ? (
        <div className="favorite-groups-empty">그룹을 만든 뒤 광고그룹의 별 버튼으로 추가해보세요.</div>
      ) : (
        <div className="favorite-group-grid">
          {favoriteGroups.map(group => {
            const rate = group.budget > 0 ? group.spendRate : 0;
            const isSelected = selectedFavoriteGroupId === group.id;
            return (
              <article
                className={`favorite-group-card ${isSelected ? 'active' : ''}`}
                key={group.id}
                onClick={() => onSelectGroup(group)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectGroup(group);
                  }
                }}
                aria-pressed={isSelected}
              >
                {/* Header: Star, Name, Member count badge */}
                <div className="favorite-card-header">
                  <div className="favorite-card-title-wrap">
                    <span className={`material-symbols-outlined favorite-card-icon ${isSelected ? 'active' : ''}`}>
                      {isSelected ? 'star' : 'star_outline'}
                    </span>
                    <input
                      onClick={(e) => e.stopPropagation()}
                      className="favorite-group-name-input"
                      value={groupDrafts[group.id]?.name ?? group.name}
                      onChange={(e) => setGroupDrafts(prev => ({
                        ...prev,
                        [group.id]: { ...prev[group.id], name: e.target.value }
                      }))}
                      aria-label={`${group.name} 그룹 이름`}
                      placeholder="그룹명 입력"
                    />
                  </div>
                  <span className="favorite-member-count">{group.members.length}개</span>
                </div>

                {/* Body: Spent, Budget & Progress Bar */}
                <div className="favorite-card-body">
                  <div className="favorite-card-stat-row">
                    <span className="stat-label">소진액</span>
                    <span className="stat-value spent">{group.spent.toLocaleString()}원</span>
                  </div>
                  <div className="favorite-card-stat-row">
                    <span className="stat-label">관리 예산</span>
                    {editingBudgetGroupId === group.id ? (
                      <div className="budget-input-wrap editing" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          autoFocus
                          value={
                            groupDrafts[group.id]?.budget !== undefined
                              ? (groupDrafts[group.id].budget === '' ? '' : Number(String(groupDrafts[group.id].budget).replace(/,/g, '')).toLocaleString())
                              : (group.budget > 0 ? group.budget.toLocaleString() : '0')
                          }
                          onChange={(e) => {
                            const rawVal = e.target.value.replace(/[^0-9]/g, '');
                            setGroupDrafts(prev => ({
                              ...prev,
                              [group.id]: {
                                ...(prev[group.id] || { name: group.name }),
                                budget: rawVal
                              }
                            }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              onUpdateGroup(group.id);
                            } else if (e.key === 'Escape') {
                              setEditingBudgetGroupId(null);
                            }
                          }}
                          aria-label={`${group.name} 그룹 예산`}
                          placeholder="예산 입력"
                        />
                        <span className="unit">원</span>
                        <button 
                          type="button" 
                          className="budget-inline-action-btn save"
                          onClick={() => onUpdateGroup(group.id)}
                          title="예산 저장 (Enter)"
                        >
                          <span className="material-symbols-outlined">check</span>
                        </button>
                        <button 
                          type="button" 
                          className="budget-inline-action-btn cancel"
                          onClick={() => setEditingBudgetGroupId(null)}
                          title="취소 (Esc)"
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="favorite-budget-display-badge"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingBudgetGroupId(group.id);
                          setGroupDrafts(prev => ({
                            ...prev,
                            [group.id]: {
                              name: prev[group.id]?.name ?? group.name,
                              budget: String(group.budget)
                            }
                          }));
                        }}
                        title="클릭하여 예산 수정"
                      >
                        <span className="budget-amount">
                          {(groupDrafts[group.id]?.budget !== undefined
                            ? Number(String(groupDrafts[group.id].budget).replace(/,/g, '') || 0)
                            : group.budget
                          ).toLocaleString()}
                        </span>
                        <span className="unit">원</span>
                        <span className="material-symbols-outlined edit-pen-icon">edit</span>
                      </div>
                    )}
                  </div>

                  <div className="favorite-card-progress-wrap">
                    <div className="kpi-progress-bar-bg" style={{ margin: '8px 0 4px 0', height: '6px' }}>
                      <div 
                        className={`kpi-progress-bar-fill ${rate >= 90 ? 'danger' : rate >= 70 ? 'warning' : ''}`}
                        style={{ width: `${Math.min(rate, 100)}%` }}
                      />
                    </div>
                    <div className="favorite-card-rate-text">
                      <span className="rate-label">예산 소진율</span>
                      <span className={`rate-value ${rate >= 90 ? 'danger' : rate >= 70 ? 'warning' : ''}`}>
                        {group.budget > 0 ? `${rate.toFixed(1)}%` : '한도 없음'}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Footer actions */}
                <div className="favorite-card-footer" onClick={(e) => e.stopPropagation()}>
                  <button 
                    type="button" 
                    className="card-save-btn" 
                    onClick={() => onUpdateGroup(group.id)} 
                    disabled={loadingFavorites}
                  >
                    저장
                  </button>
                  <button 
                    type="button" 
                    className="card-delete-btn" 
                    onClick={() => onDeleteGroup(group)} 
                    disabled={loadingFavorites}
                  >
                    삭제
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
