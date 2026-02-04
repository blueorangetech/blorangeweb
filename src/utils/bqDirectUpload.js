export const bqDirectUpload = async ({ file, datasetId, tableId, truncate = true, setUploadStatus }) => {
    if (!file) return;

    setUploadStatus({ type: 'loading', message: '데이터 분석 및 업로드 중...' });

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('dataset_id', datasetId);
        formData.append('table_id', tableId);
        formData.append('truncate', truncate.toString());

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

        const response = await fetch(
            `${API_BASE_URL}/csv/upload/direct`,
            {
                method: 'POST',
                body: formData
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || '업로드 중 오류가 발생했습니다.');
        }

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
