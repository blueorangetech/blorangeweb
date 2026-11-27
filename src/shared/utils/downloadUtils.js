/**
 * Cross-Origin 제약 및 브라우저 손실 재인코딩(WebP 자동변환/압축 등)을 방지하기 위해,
 * 이미지 URL을 Blob 바이너리로 직접 fetch하여 원본 그대로 로컬에 다운로드합니다.
 * 
 * @param {string} url - 다운로드할 이미지 URL
 * @param {string} filename - 저장할 파일명 (확장자 포함)
 * @returns {Promise<boolean>} 성공 여부
 */
export const downloadFileFromUrl = async (url, filename = 'download.png') => {
  if (!url) return false;

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`이미지 다운로드 응답 실패: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    // 메모리 해제
    setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl);
    }, 1000);

    return true;
  } catch (error) {
    console.warn('[downloadFileFromUrl] Blob 직접 다운로드 실패, fallback 시도:', error);

    // Fallback: fetch가 차단되거나 CORS 실패 시 기존 방식으로 시도
    try {
      const fallbackLink = document.createElement('a');
      fallbackLink.href = url;
      fallbackLink.download = filename;
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noreferrer';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      fallbackLink.remove();
      return true;
    } catch (fallbackError) {
      console.error('[downloadFileFromUrl] Fallback 다운로드 실패:', fallbackError);
      return false;
    }
  }
};
