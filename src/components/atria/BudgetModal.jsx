import React from 'react';

export function BudgetModal({
  isOpen,
  modalTarget,
  budgetOption,
  setBudgetOption,
  inputBudget,
  setInputBudget,
  submittingBudget,
  onClose,
  onSubmit
}) {
  if (!isOpen || !modalTarget) return null;

  return (
    <div className="modal-overlay" onClick={() => !submittingBudget && onClose()}>
      <div className="budget-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="material-symbols-outlined modal-icon-budget">tune</span>
            <div>
              <h4>{modalTarget.type === 'campaign' ? '캠페인 일일 예산 조정' : '광고그룹 일일 예산 조정'}</h4>
              <p className="modal-subtitle">일일 예산 소진 한도를 설정합니다.</p>
            </div>
          </div>
          <button 
            className="close-btn" 
            onClick={onClose}
            disabled={submittingBudget}
          >
            &times;
          </button>
        </div>
        
        <div className="modal-body">
          {/* Target Info Card */}
          <div className="modal-target-card">
            <span className="target-badge">{modalTarget.type === 'campaign' ? '캠페인' : '광고그룹'}</span>
            <strong className="target-name">{modalTarget.name}</strong>
          </div>

          {/* 3 Budget Option Cards */}
          <div className="budget-options-grid">
            {modalTarget.type === 'adgroup' && (
              <label className={`budget-option-card ${budgetOption === 'campaign' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="budgetOption"
                  value="campaign"
                  checked={budgetOption === 'campaign'}
                  onChange={() => setBudgetOption('campaign')}
                />
                <div className="option-content">
                  <div className="option-title-row">
                    <span className="option-title">캠페인 예산한도 적용</span>
                    <span className="option-tag">기본값</span>
                  </div>
                  <p className="option-desc">상위 캠페인의 일일 예산을 공유하여 함께 소진합니다.</p>
                </div>
              </label>
            )}

            <label className={`budget-option-card ${budgetOption === 'unlimited' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="budgetOption"
                value="unlimited"
                checked={budgetOption === 'unlimited'}
                onChange={() => setBudgetOption('unlimited')}
              />
              <div className="option-content">
                <div className="option-title-row">
                  <span className="option-title">제한 없음</span>
                </div>
                <p className="option-desc">일일 예산 한도를 두지 않고 잔액이 있는 한 계속 노출합니다.</p>
              </div>
            </label>

            <label className={`budget-option-card ${budgetOption === 'custom' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="budgetOption"
                value="custom"
                checked={budgetOption === 'custom'}
                onChange={() => setBudgetOption('custom')}
              />
              <div className="option-content">
                <div className="option-title-row">
                  <span className="option-title">특정 금액 한도 설정</span>
                </div>
                <p className="option-desc">독립적인 일일 예산 금액을 직접 지정하여 관리합니다.</p>
              </div>
            </label>
          </div>

          {/* Custom Budget Amount Input Box */}
          {budgetOption === 'custom' && (
            <div className="custom-budget-input-section">
              <label className="input-label">일일 한도 금액</label>
              <div className="budget-input-wrapper">
                <input 
                  type="number" 
                  value={inputBudget} 
                  onChange={(e) => setInputBudget(e.target.value)}
                  placeholder="예: 50000"
                  min="10000"
                  step="10000"
                  autoFocus
                />
                <span className="budget-unit">원</span>
              </div>

              {/* Quick Add Buttons */}
              <div className="quick-amount-buttons">
                <button type="button" onClick={() => setInputBudget(prev => Number(prev || 0) + 10000)}>+1만</button>
                <button type="button" onClick={() => setInputBudget(prev => Number(prev || 0) + 50000)}>+5만</button>
                <button type="button" onClick={() => setInputBudget(prev => Number(prev || 0) + 100000)}>+10만</button>
                <button type="button" onClick={() => setInputBudget(prev => Number(prev || 0) + 500000)}>+50만</button>
                <button type="button" onClick={() => setInputBudget(prev => Number(prev || 0) + 1000000)}>+100만</button>
                <button type="button" className="btn-reset" onClick={() => setInputBudget(10000)}>초기화</button>
              </div>
              <span className="budget-limits-hint">* 네이버 규정상 한도 설정 시 최소 10,000원 이상 입력해야 합니다.</span>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={onClose}
            disabled={submittingBudget}
          >
            취소
          </button>
          <button 
            className="btn-primary" 
            onClick={onSubmit}
            disabled={submittingBudget}
          >
            {submittingBudget ? (
              <>
                <span className="material-symbols-outlined spinner" style={{ fontSize: '16px' }}>progress_activity</span>
                <span>적용 중...</span>
              </>
            ) : (
              '예산 적용'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
