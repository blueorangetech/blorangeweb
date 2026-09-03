import { mainClient } from '../client';

/**
 * src/api/geo/aiApi.js
 *
 * AI 관련 기능(배경 연출, A/B 비교 분석 등) 백엔드 API 서비스 클래스 (GEO 서버 호출)
 */
export class AiApi {
  constructor() {
    this.client = mainClient;
  }

  generateMultipleAngles(file, { pageName = 'playground', bucketName, angles = [] } = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('page_name', pageName);
    formData.append('angles', JSON.stringify(angles));
    if (bucketName) formData.append('bucket_name', bucketName);
    return this.client.post('/api/ai/comfy/multiple-angles', formData);
  }

  removeBackground(file, {
    backgroundMode = 'Alpha',
    backgroundColor = '#FFFFFF',
    enableShadow = false,
    shadowDistanceX = 18,
    shadowDistanceY = 22,
    shadowBlur = 35,
    shadowGrow = 0,
    shadowOpacity = 30,
    shadowColor = '#000000',
    pageName = 'playground',
    bucketName
  } = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('background_mode', backgroundMode);
    formData.append('background_color', backgroundColor);
    formData.append('enable_shadow', enableShadow);
    formData.append('shadow_distance_x', shadowDistanceX);
    formData.append('shadow_distance_y', shadowDistanceY);
    formData.append('shadow_blur', shadowBlur);
    formData.append('shadow_grow', shadowGrow);
    formData.append('shadow_opacity', shadowOpacity);
    formData.append('shadow_color', shadowColor);
    formData.append('page_name', pageName);
    if (bucketName) formData.append('bucket_name', bucketName);
    return this.client.post('/api/ai/comfy/remove-background', formData);
  }

  restyleImage(file, { prompt, pageName = 'playground', bucketName, seed } = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);
    formData.append('page_name', pageName);
    if (bucketName) formData.append('bucket_name', bucketName);
    if (seed) formData.append('seed', seed);
    return this.client.post('/api/ai/comfy/restyle', formData);
  }

  /**
   * PhotoRoom AI 피사체 추출 및 배경 합성 (GEO 백엔드 호출)
   */
  processPhotoRoom(payload) {
    return this.client.post('/api/ai/photoroom', payload);
  }

  /**
   * Creative A/B 소재 성과 데이터 및 비주얼 비교 분석 요청
   */
  compareAssets(payloadA, payloadB) {
    return this.client.post('/api/ai/compare', {
      material_a: payloadA,
      material_b: payloadB,
    });
  }

  /**
   * 우수 에셋 다중 이미지 및 성과 데이터 공통점 종합 분석 요청
   */
  analyzeCommonality(payloadAssets) {
    return this.client.post('/api/ai/commonality', {
      assets: payloadAssets,
    });
  }

  uploadPsd(file, { pageName = 'playground', bucketName } = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('page_name', pageName);
    if (bucketName) formData.append('bucket_name', bucketName);
    return this.client.post('/api/ai/psd/documents', formData);
  }

  getPsdDocument(documentId, bucketName) {
    return this.client.get(`/api/ai/psd/documents/${documentId}`,
      bucketName ? { bucket_name: bucketName } : {});
  }

  revisePsd(documentId, payload) {
    return this.client.post(`/api/ai/psd/documents/${documentId}/revisions`, payload);
  }

  generatePsdVariations(documentId, payload) {
    return this.client.post(`/api/ai/psd/documents/${documentId}/variations`, payload);
  }

  adjustPsdPlacementVariation(documentId, placementKey, payload) {
    return this.client.post(`/api/ai/psd/documents/${documentId}/variations/${placementKey}/adjust`, payload);
  }

  regeneratePsdPlacementLayerImage(documentId, placementKey, payload) {
    return this.client.post(`/api/ai/psd/documents/${documentId}/variations/${placementKey}/regenerate-image`, payload);
  }
}

export const aiApi = new AiApi();
