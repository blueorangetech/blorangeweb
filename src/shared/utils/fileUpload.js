import { csvUploadApi } from '../api';

/**
 * src/utils/fileUpload.js
 *
 * GCS 업로드 및 파일 데이터 분할 처리 유틸리티 (중앙 csvUploadApi 사용)
 */
export const uploadFile = async (file, setUploadStatus, { datasetId = 'imweb', tableId = 'INNER_data', truncate = true } = {}) => {
  if (file) {
    setUploadStatus({ type: 'loading', message: '파일 업로드 중...' })

    try {
      // 1. 업로드 URL 요청 (중앙 API 호출)
      const formData1 = new FormData()
      formData1.append('filename', file.name)
      formData1.append('dataset_id', datasetId)
      formData1.append('table_id', tableId)
      
      const { upload_url, blob_name } = await csvUploadApi.requestUploadUrl(formData1);
      if (!upload_url || !blob_name) throw new Error('업로드 URL 응답이 올바르지 않습니다')

      // 2. GCS에 직접 업로드 (GCS 서명된 URL로 direct PUT 전송)
      setUploadStatus({ type: 'loading', message: 'GCS에 업로드 중...' })
      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/csv'
        },
        body: file
      })

      if (!uploadResponse.ok) {
        throw new Error('GCS 업로드 실패')
      }

      console.log('GCS 업로드 완료!')

      // 3. 서버에 처리 요청 (중앙 API 호출)
      setUploadStatus({ type: 'loading', message: '파일 처리 중...' })
      const formData2 = new FormData()
      formData2.append('blob_name', blob_name)
      formData2.append('dataset_id', datasetId)
      formData2.append('table_id', tableId)
      formData2.append('truncate', String(truncate))

      const result = await csvUploadApi.processUploadedFile(formData2);
      if (result.status !== 'success') throw new Error(result.message || 'BigQuery 업로드 실패')

      setUploadStatus({
        type: 'success',
        message: `업로드 완료! ${result.cleaned_rows}행`
      })

      // 5초 후 상태 메시지 제거
      setTimeout(() => {
        setUploadStatus({ type: '', message: '' })
      }, 5000)

    } catch (error) {
      console.error('파일 업로드 오류:', error)
      setUploadStatus({
        type: 'error',
        message: `파일 업로드 실패: ${error.message}`
      })
    }
  }
}
