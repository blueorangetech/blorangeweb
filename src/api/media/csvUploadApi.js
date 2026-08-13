import { mediaClient } from './client';

/**
 * src/api/media/csvUploadApi.js
 *
 * CSV 업로드 관련 API 서비스 (Media/Pandasai 서버 호출)
 */
export class CsvUploadApi {
  constructor() {
    this.client = mediaClient;
  }

  /**
   * BigQuery 다이렉트 업로드 요청
   */
  uploadDirect(formData) {
    return this.client.post('/csv/upload/direct', formData);
  }

  /**
   * GCS 업로드를 위한 서명된(Signed) 업로드 URL 발급 요청
   */
  requestUploadUrl(formData) {
    return this.client.post('/csv/upload/request-upload-url', formData);
  }

  /**
   * GCS 업로드 완료 후 BigQuery 테이블 전송 및 처리 요청
   */
  processUploadedFile(formData) {
    return this.client.post('/csv/upload/process-uploaded-file', formData);
  }
}

export const csvUploadApi = new CsvUploadApi();
