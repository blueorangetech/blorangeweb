import { ApiClient, mainClient } from './client';

/**
 * src/api/aiApi.js
 *
 * AI 관련 기능(배경 연출, A/B 비교 분석 등) 백엔드 API 서비스 클래스
 */

// AI 피사체 추출 및 스튜디오 전용 백엔드 주소 (없으면 로컬 백엔드 주소 기본값 사용)
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:8000';
export const aiClient = new ApiClient(AI_API_BASE_URL);

export class AiApi {
  constructor() {
    this.mainClient = mainClient;
    this.aiClient = aiClient;
  }

  /**
   * PhotoRoom AI 피사체 추출 및 배경 합성
   *
   * @param {object} payload - 배경 모드, 색상, 프롬프트, 크기 정보 등
   */
  processPhotoRoom(payload) {
    return this.aiClient.post('/api/ai/photoroom', payload);
  }

  /**
   * Creative A/B 소재 성과 데이터 및 비주얼 비교 분석 요청
   */
  compareAssets(payloadA, payloadB) {
    return this.mainClient.post('/api/ai/compare', {
      material_a: payloadA,
      material_b: payloadB,
    });
  }

  /**
   * 우수 에셋 다중 이미지 및 성과 데이터 공통점 종합 분석 요청
   */
  analyzeCommonality(payloadAssets) {
    return this.mainClient.post('/api/ai/commonality', {
      assets: payloadAssets,
    });
  }
}

// 싱글톤 API 인스턴스 내보내기
export const aiApi = new AiApi();
