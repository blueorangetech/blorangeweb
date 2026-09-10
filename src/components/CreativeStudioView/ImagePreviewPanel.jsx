import StudioLoadingState from './StudioLoadingState';

export function PreviewPlaceholder({ icon = 'image', title, description, children }) {
  return (
    <div className="preview-placeholder">
      <span className="material-symbols-outlined placeholder-icon">{icon}</span>
      <h4>{title}</h4>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}

export default function ImagePreviewPanel({
  title = '결과 미리보기',
  resultCount = 0,
  headerActions,
  isLoading = false,
  loadingTitle,
  loadingIcon = 'image',
  loadingSteps = [],
  errorMessage = '',
  errorTitle = '처리 오류',
  onClearError,
  notice,
  bodyClassName = '',
  children,
}) {
  return (
    <section className="angle-results-card glass-card">
      <div className="panel-header">
        <h3>{title}</h3>
        {(resultCount > 0 || headerActions) && (
          <div className="preview-panel-actions">
            {resultCount > 0 && <span className="angle-count">{resultCount}개 생성됨</span>}
            {headerActions}
          </div>
        )}
      </div>

      {notice}

      <div
        className={`angle-results-body${bodyClassName ? ` ${bodyClassName}` : ''}`}
        aria-live="polite"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <StudioLoadingState title={loadingTitle} icon={loadingIcon} steps={loadingSteps} />
        ) : errorMessage ? (
          <div className="preview-error-container">
            <span className="material-symbols-outlined error-icon">warning</span>
            <h4>{errorTitle}</h4>
            <p>{errorMessage}</p>
            {onClearError && (
              <button type="button" className="btn-error-clear" onClick={onClearError}>
                확인
              </button>
            )}
          </div>
        ) : children}
      </div>
    </section>
  );
}
