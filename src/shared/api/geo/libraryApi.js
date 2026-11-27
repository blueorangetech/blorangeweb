import { mainClient } from '../client';

/**
 * src/api/geo/libraryApi.js
 *
 * 이미지 라이브러리 관련 백엔드 API 서비스 클래스 (GEO 메인 서버 호출)
 */
export class LibraryApi {
  constructor(bucketName) {
    this.client = mainClient;
    this.bucketName = bucketName;
  }

  /**
   * 공통으로 전달되어야 하는 bucket_name 파라미터를 추가하는 헬퍼 메서드
   */
  _getParams(extraParams = {}) {
    const params = { ...extraParams };
    if (this.bucketName) {
      params.bucket_name = this.bucketName;
    }
    return params;
  }

  /**
   * 라이브러리 폴더 목록 조회
   */
  getFolders() {
    return this.client.get('/api/library/folders/list', this._getParams());
  }

  /**
   * 특정 폴더의 이미지 목록 조회
   */
  getImages(folderParam = 'all') {
    return this.client.get(`/api/library/${folderParam}`, this._getParams());
  }

  /**
   * 이미지 삭제
   */
  deleteImage(folderParam, filename) {
    return this.client.delete(
      `/api/library/${folderParam}/${encodeURIComponent(filename)}`,
      this._getParams()
    );
  }

  /**
   * 이미지 업로드
   */
  uploadImage(folderParam, formData) {
    return this.client.post(
      `/api/library/${folderParam}/upload`,
      formData,
      this._getParams()
    );
  }

  /**
   * 이미지 다운로드 URL 획득
   */
  getDownloadUrl(folderParam, filename) {
    return this.client.buildUrl(
      `/api/library/${folderParam}/${encodeURIComponent(filename)}/download`,
      this._getParams()
    );
  }
}
