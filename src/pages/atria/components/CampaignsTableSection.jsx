import React from 'react';

export function CampaignsTableSection({
  summary,
  startDate,
  endDate,
  selectedFavoriteGroup,
  selectedGroupAdgroups,
  loadingSelectedGroupAdgroups,
  loadingCampaigns,
  visibleCampaigns,
  adgroups,
  loadingAdgroups,
  expandedCampaignId,
  showOnlyOn,
  favoriteAdgroupIds,
  favoriteAdgroupCountsByCampaign,
  selectedFavoriteAdgroupIds,
  excelDownloading,
  onDownloadExcelTemplate,
  onOpenExcelUploadModal,
  onToggleCampaignExpand,
  onOpenBudgetModal,
  onOpenAssignmentModal
}) {
  return (
    <>
      {/* KPI 카드 그리드 */}
      <div className="atria-kpi-grid">
        <div className="atria-kpi-card">
          <div className="kpi-title">{selectedFavoriteGroup ? `${selectedFavoriteGroup.name} 관리 예산` : '총 예산 (일일 한도)'}</div>
          <div className="kpi-value">{summary.totalBudget ? `${summary.totalBudget.toLocaleString()}원` : '제한 없음'}</div>
          <div className="kpi-subtext">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>tune</span>
            {selectedFavoriteGroup ? 'Atria 즐겨찾기 그룹 관리 기준' : '예산 한도 설정 캠페인 합계'}
          </div>
        </div>
        
        <div className="atria-kpi-card">
          <div className="kpi-title">{selectedFavoriteGroup ? '그룹 광고 소진액' : '선택 기간 누적 소진 비용'}</div>
          <div className="kpi-value">{summary.totalSpent.toLocaleString()}원</div>
          <div className="kpi-subtext">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
            {startDate} ~ {endDate} 누적치
          </div>
        </div>

        <div className="atria-kpi-card">
          <div className="kpi-title">{selectedFavoriteGroup ? '그룹 예산 소진율' : '전체 예산 소진율'}</div>
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
          <h3>{selectedFavoriteGroup ? `${selectedFavoriteGroup.name} 광고그룹 목록` : '캠페인 소진 리스트'}</h3>
          <div className="table-header-actions">
            {!selectedFavoriteGroup && (
              <span className="table-hint">* 행을 클릭하면 하위 광고그룹이 표시됩니다.</span>
            )}
            <button
              type="button"
              className="excel-btn download"
              onClick={onDownloadExcelTemplate}
              disabled={excelDownloading}
              title={selectedFavoriteGroup ? `${selectedFavoriteGroup.name} 예산 수정용 엑셀 다운로드` : '전체 광고그룹 예산 수정용 엑셀 다운로드'}
            >
              <span className={`material-symbols-outlined ${excelDownloading ? 'spinner' : ''}`}>
                {excelDownloading ? 'progress_activity' : 'download'}
              </span>
              {excelDownloading ? '엑셀 생성 중...' : '엑셀 양식 다운로드'}
            </button>
            <button
              type="button"
              className="excel-btn upload"
              onClick={onOpenExcelUploadModal}
              title="수정한 엑셀 파일을 업로드하여 예산을 일괄 적용합니다."
            >
              <span className="material-symbols-outlined">upload_file</span>
              엑셀 대량 예산 수정
            </button>
          </div>
        </div>

        {selectedFavoriteGroup ? (
          <div className="table-responsive">
            <table className="campaign-table favorite-flat-table">
              <thead>
                <tr>
                  <th style={{ width: '52px', textAlign: 'center' }}>즐겨찾기</th>
                  <th>광고그룹 정보</th>
                  <th>캠페인 ID</th>
                  <th>상태</th>
                  <th style={{ textAlign: 'right' }}>현재 예산</th>
                  <th style={{ textAlign: 'right' }}>소진액</th>
                  <th style={{ textAlign: 'right' }}>클릭수</th>
                  <th style={{ textAlign: 'right' }}>노출수</th>
                  <th style={{ textAlign: 'right' }}>CTR</th>
                  <th style={{ textAlign: 'right' }}>평균 CPC</th>
                  <th style={{ textAlign: 'center' }}>예산 조정</th>
                </tr>
              </thead>
              <tbody>
                {loadingSelectedGroupAdgroups ? (
                  <tr><td colSpan="11" className="favorite-flat-empty">광고그룹 목록을 불러오는 중...</td></tr>
                ) : selectedGroupAdgroups.length === 0 ? (
                  <tr><td colSpan="11" className="favorite-flat-empty">이 그룹에 광고그룹이 없습니다.</td></tr>
                ) : selectedGroupAdgroups.filter(ag => !showOnlyOn || ag.userLock === false).map(ag => {
                  const spent = ag.stats?.salesAmt || 0;
                  const clicks = ag.stats?.clkCnt || 0;
                  const impressions = ag.stats?.impCnt || 0;
                  return (
                    <tr key={ag.nccAdgroupId}>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="favorite-btn active"
                          onClick={() => onOpenAssignmentModal({
                            adgroupId: ag.nccAdgroupId,
                            parentCampaignId: ag.parentCampaignId,
                            name: ag.name
                          })}
                          aria-label={`${ag.name} 광고그룹 즐겨찾기 그룹 설정`}
                          aria-pressed="true"
                        >
                          <span className="material-symbols-outlined">star</span>
                        </button>
                      </td>
                      <td>
                        <div className="adgroup-name-wrap">
                          <div className="adgroup-name-text">{ag.name}</div>
                          <div className="adgroup-id-chip">{ag.nccAdgroupId}</div>
                        </div>
                      </td>
                      <td><span className="adgroup-id-chip">{ag.parentCampaignId}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        {ag.userLock === true ? (
                          <span className="status-pill off">정지 (OFF)</span>
                        ) : ag.status === 'ELIGIBLE' ? (
                          <span className="status-pill on">노출 가능</span>
                        ) : ag.status === 'BUDGET_EXCEEDED' ? (
                          <span className="status-pill warning">예산 초과</span>
                        ) : (
                          <span className="status-pill off">정지</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>
                        {(ag.useBudget ?? ag.useDailyBudget) && ((ag.budget ?? ag.dailyBudget) > 0)
                          ? `${(ag.budget ?? ag.dailyBudget).toLocaleString()}원`
                          : '제한 없음'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>{spent.toLocaleString()}원</td>
                      <td style={{ textAlign: 'right' }}>{clicks.toLocaleString()}회</td>
                      <td style={{ textAlign: 'right' }}>{impressions.toLocaleString()}회</td>
                      <td style={{ textAlign: 'right' }}>{impressions > 0 ? `${(clicks / impressions * 100).toFixed(2)}%` : '0.00%'}</td>
                      <td style={{ textAlign: 'right' }}>{clicks > 0 ? `${Math.round(spent / clicks).toLocaleString()}원` : '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="edit-budget-btn" onClick={(e) => onOpenBudgetModal(e, 'adgroup', ag)}>조정</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
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
                  <td colSpan="11" style={{ textAlign: 'center', padding: '40px 0' }}>
                    <span className="material-symbols-outlined spinner" style={{ fontSize: '32px', color: '#3b82f6' }}>
                      sync
                    </span>
                    <div style={{ marginTop: '8px', color: '#64748b', fontWeight: '600' }}>캠페인 및 실시간 소진율을 로드하는 중...</div>
                  </td>
                </tr>
              ) : visibleCampaigns.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    {selectedFavoriteGroup ? `'${selectedFavoriteGroup.name}' 그룹에 표시할 광고그룹이 없습니다.` : '표시할 캠페인이 존재하지 않습니다.'}
                  </td>
                </tr>
              ) : (
                visibleCampaigns.map(c => {
                  const isExpanded = expandedCampaignId === c.nccCampaignId;
                  const spent = c.stats ? c.stats.salesAmt : 0;
                  const budget = c.budget || 0;
                  const hasLimit = c.useBudget && budget > 0;
                  const rate = hasLimit ? (spent / budget) * 100 : 0;
                  const visibleFavoriteCount = selectedFavoriteGroup
                    ? selectedFavoriteGroup.members.filter(member => member.parentCampaignId === c.nccCampaignId).length
                    : (favoriteAdgroupCountsByCampaign[c.nccCampaignId] || 0);
                  
                  return (
                    <React.Fragment key={c.nccCampaignId}>
                      <tr 
                        className={`campaign-row ${isExpanded ? 'expanded' : ''}`}
                        onClick={() => onToggleCampaignExpand(c.nccCampaignId)}
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
                            onClick={(e) => onOpenBudgetModal(e, 'campaign', c)}
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
                                <div className="adgroups-title-group">
                                  <span className="material-symbols-outlined adgroups-icon">subdirectory_arrow_right</span>
                                  <h4>소속 광고그룹 목록</h4>
                                  <span className="adgroups-count-pill">
                                    {(adgroups[c.nccCampaignId] || []).length}개
                                  </span>
                                </div>
                                {visibleFavoriteCount > 0 && (
                                  <span className="favorite-count-badge">
                                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>star</span>
                                    즐겨찾기 {visibleFavoriteCount}개
                                  </span>
                                )}
                              </div>
                              
                              {loadingAdgroups && !adgroups[c.nccCampaignId] ? (
                                <div className="adgroups-loading-box">
                                  <span className="material-symbols-outlined spinner" style={{ fontSize: '24px', color: '#3b82f6' }}>
                                    sync
                                  </span>
                                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px', fontWeight: '600' }}>광고그룹 목록을 불러오는 중...</div>
                                </div>
                              ) : !adgroups[c.nccCampaignId] || adgroups[c.nccCampaignId].length === 0 ? (
                                <div className="adgroups-empty-box">
                                  이 캠페인 아래에 등록된 광고그룹이 없습니다.
                                </div>
                              ) : (
                                <table className="adgroup-table">
                                  <thead>
                                    <tr>
                                      <th style={{ width: '48px', textAlign: 'center' }}>즐겨찾기</th>
                                      <th>광고그룹 정보</th>
                                      <th style={{ textAlign: 'center', width: '90px' }}>상태</th>
                                      <th style={{ textAlign: 'right' }}>일일 예산</th>
                                      <th style={{ textAlign: 'right' }}>소진액</th>
                                      <th style={{ textAlign: 'right' }}>클릭수</th>
                                      <th style={{ textAlign: 'right' }}>노출수</th>
                                      <th style={{ textAlign: 'right' }}>CTR</th>
                                      <th style={{ textAlign: 'right' }}>평균 CPC</th>
                                      <th style={{ textAlign: 'center', width: '70px' }}>예산 조정</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(adgroups[c.nccCampaignId] || [])
                                      .filter(ag => !showOnlyOn || ag.userLock === false)
                                      .filter(ag => !selectedFavoriteGroup || selectedFavoriteAdgroupIds.has(ag.nccAdgroupId))
                                      .map(ag => {
                                      const agSpent = ag.stats ? ag.stats.salesAmt : 0;
                                      const agBudget = ag.budget ?? ag.dailyBudget ?? 0;
                                      const agUseBudget = ag.useBudget ?? ag.useDailyBudget ?? false;
                                      const agHasLimit = agUseBudget && agBudget > 0;
                                      
                                      return (
                                        <tr key={ag.nccAdgroupId}>
                                          <td style={{ textAlign: 'center' }}>
                                            <button
                                              type="button"
                                              className={`favorite-btn ${favoriteAdgroupIds.has(ag.nccAdgroupId) ? 'active' : ''}`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onOpenAssignmentModal({
                                                  adgroupId: ag.nccAdgroupId,
                                                  parentCampaignId: c.nccCampaignId,
                                                  name: ag.name
                                                });
                                              }}
                                              aria-label={`${ag.name} 광고그룹 즐겨찾기 그룹 설정`}
                                              aria-pressed={favoriteAdgroupIds.has(ag.nccAdgroupId)}
                                            >
                                              <span className="material-symbols-outlined">star</span>
                                            </button>
                                          </td>
                                          <td>
                                            <div className="adgroup-name-wrap">
                                              <div className="adgroup-name-text">{ag.name}</div>
                                              <div className="adgroup-id-chip">{ag.nccAdgroupId}</div>
                                            </div>
                                          </td>
                                          <td style={{ textAlign: 'center' }}>
                                            {ag.userLock === true ? (
                                              <span className="status-pill off">정지 (OFF)</span>
                                            ) : ag.status === 'ELIGIBLE' ? (
                                              <span className="status-pill on">노출 가능</span>
                                            ) : ag.status === 'BUDGET_EXCEEDED' ? (
                                              <span className="status-pill warning">예산 초과</span>
                                            ) : (
                                              <span className="status-pill off">정지</span>
                                            )}
                                          </td>
                                          <td style={{ textAlign: 'right', fontWeight: '700' }}>
                                            {agHasLimit ? (
                                              <span style={{ color: '#0f172a' }}>{agBudget.toLocaleString()}원</span>
                                            ) : (
                                              <span style={{ color: '#94a3b8', fontWeight: '500' }}>제한 없음</span>
                                            )}
                                          </td>
                                          <td style={{ textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                                            {agSpent.toLocaleString()}원
                                          </td>
                                          <td style={{ textAlign: 'right', fontWeight: '600', color: '#334155' }}>
                                            {ag.stats ? `${ag.stats.clkCnt.toLocaleString()}회` : '0회'}
                                          </td>
                                          <td style={{ textAlign: 'right', color: '#64748b' }}>
                                            {ag.stats ? `${ag.stats.impCnt.toLocaleString()}회` : '0회'}
                                          </td>
                                          <td style={{ textAlign: 'right', fontWeight: '600', color: '#0284c7' }}>
                                            {ag.stats ? `${ag.stats.ctr.toFixed(2)}%` : '0.00%'}
                                          </td>
                                          <td style={{ textAlign: 'right', color: '#475569' }}>
                                            {ag.stats && ag.stats.clkCnt > 0 ? `${Math.round(ag.stats.salesAmt / ag.stats.clkCnt).toLocaleString()}원` : '-'}
                                          </td>
                                          <td style={{ textAlign: 'center' }}>
                                            <button 
                                              className="adgroup-budget-btn"
                                              onClick={(e) => onOpenBudgetModal(e, 'adgroup', ag)}
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
        )}
      </div>
    </>
  );
}
