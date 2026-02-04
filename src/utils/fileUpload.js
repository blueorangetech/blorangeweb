export const uploadFile = async (file, setUploadStatus) => {
  if (file) {
    setUploadStatus({ type: 'loading', message: '파일 업로드 중...' })

    try {
      // 1. 업로드 URL 요청
      const formData1 = new FormData()
      formData1.append('filename', file.name)
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

      const urlResponse = await fetch(
        `${API_BASE_URL}/csv/upload/request-upload-url`,
        {
          method: 'POST',
          body: formData1
        }
      )

      if (!urlResponse.ok) {
        throw new Error('업로드 URL 요청 실패')
      }

      const { upload_url, blob_name } = await urlResponse.json()
      console.log('업로드 URL 받음:', upload_url)

      // 2. GCS에 직접 업로드 (대용량 파일도 가능!)
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

      // 3. 서버에 처리 요청
      setUploadStatus({ type: 'loading', message: '파일 처리 중...' })
      const formData2 = new FormData()
      formData2.append('blob_name', blob_name)

      const processResponse = await fetch(
        `${API_BASE_URL}/csv/upload/process-uploaded-file`,
        {
          method: 'POST',
          body: formData2
        }
      )

      if (!processResponse.ok) {
        throw new Error('파일 처리 실패')
      }

      const result = await processResponse.json()
      console.log('처리 완료:', result)

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
