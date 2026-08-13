import { ApiClient } from '../client';

/**
 * src/api/media/client.js
 * 
 * 매체 API 연동 및 운영 제어 서버와 통신하는 API 클라이언트 인스턴스
 */
const MEDIA_API_BASE_URL = import.meta.env.VITE_CSV_UPLOAD_AND_MEDIA_BASE_URL || 'http://localhost:8000';
export const mediaClient = new ApiClient(MEDIA_API_BASE_URL);
