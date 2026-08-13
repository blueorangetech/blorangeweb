import { csvUploadApi } from '../api';

/**
 * src/utils/bqDirectUpload.js
 *
 * BigQuery 직업 업로드 기능 유틸리티 (중앙 csvUploadApi 사용)
 */
export const bqDirectUpload = async ({ file, datasetId, tableId, truncate = true, setUploadStatus }) => {
  if (!file) return;

  setUploadStatus({ type: 'loading', message: '데이터 분석 및 업로드 중...' });

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dataset_id', datasetId);
    formData.append('table_id', tableId);
    formData.append('truncate', truncate.toString());

    const result = await csvUploadApi.uploadDirect(formData);

    if (result.status === 'success') {
      setUploadStatus({
        type: 'success',
        message: result.message // "BigQuery 업로드 완료: {N}행"
      });

      // 5초 후 상태 초기화
      setTimeout(() => {
        setUploadStatus({ type: '', message: '' });
      }, 5000);
    } else {
      throw new Error(result.message || 'BigQuery 업로드 실패');
    }

  } catch (error) {
    console.error('BQ Direct Upload Error:', error);
    setUploadStatus({
      type: 'error',
      message: `업로드 실패: ${error.message}`
    });
  }
};
