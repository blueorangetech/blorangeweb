/**
 * src/api/client.js
 *
 * Fetch API를 감싸 공통 설정을 처리하는 HttpClient 기반 클래스
 */

export class ApiClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  /**
   * 엔드포인트 URL과 쿼리 파라미터를 조합
   */
  buildUrl(endpoint, params = {}) {
    // 상대 경로인 경우 window.location.origin 기준으로 절대 URL화하여 파라미터 파싱을 용이하게 함
    const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
    // baseUrl이 상대 경로(예: /api)인 경우 origin 부분을 제외하고 pathname + search만 반환
    if (this.baseURL.startsWith('/') || !this.baseURL) {
      return `${url.pathname}${url.search}`;
    }
    return url.toString();
  }

  /**
   * 공통 요청 처리 메서드
   */
  async request(endpoint, options = {}) {
    const { method = 'GET', params, headers = {}, body, ...customOptions } = options;

    const url = this.buildUrl(endpoint, params);

    const requestHeaders = { ...headers };

    // Body가 FormData가 아닌 경우 기본 JSON 헤더 적용
    if (body && !(body instanceof FormData) && !requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const config = {
      method,
      headers: requestHeaders,
      ...customOptions,
    };

    if (body) {
      config.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // 응답이 JSON 형식이 아닐 때 예외 처리
      }
      const rawDetail = errorData.detail || errorData.message;
      let errorMessage = `API 요청에 실패했습니다. (상태 코드: ${response.status})`;
      if (typeof rawDetail === 'string') {
        errorMessage = rawDetail;
      } else if (Array.isArray(rawDetail)) {
        errorMessage = rawDetail
          .map((item) => (typeof item === 'string' ? item : item.msg || (item.loc ? `${item.loc.join('.')}: ${item.msg}` : JSON.stringify(item))))
          .join(', ');
      } else if (rawDetail && typeof rawDetail === 'object') {
        errorMessage = rawDetail.msg || rawDetail.message || JSON.stringify(rawDetail);
      }
      throw new Error(errorMessage);
    }

    // 204 No Content 등의 경우 비어있는 데이터 반환
    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  get(endpoint, params, options = {}) {
    return this.request(endpoint, { method: 'GET', params, ...options });
  }

  post(endpoint, body, params, options = {}) {
    return this.request(endpoint, { method: 'POST', body, params, ...options });
  }

  put(endpoint, body, params, options = {}) {
    return this.request(endpoint, { method: 'PUT', body, params, ...options });
  }

  delete(endpoint, params, options = {}) {
    return this.request(endpoint, { method: 'DELETE', params, ...options });
  }
}

// 기본 API 인스턴스 내보내기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const mainClient = new ApiClient(API_BASE_URL);
