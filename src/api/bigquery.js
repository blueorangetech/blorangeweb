/**
 * BigQuery 데이터 조회 공통 유틸리티
 * 모든 페이지별 API 모듈의 기반 함수
 */

import { mainClient } from './client';

/**
 * 날짜 객체를 YYYY-MM-DD 문자열로 변환
 */
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * /search/bigquery/date 엔드포인트 공통 호출 함수
 *
 * @param {object} params
 * @param {string} params.datasetId       - BigQuery 데이터셋 ID (예: 'hanssem', 'hanssem_hf')
 * @param {string} params.tableId         - 테이블 ID (기본: 'performance_raw')
 * @param {string} params.reportType      - query_processor report_type 키
 * @param {string} params.startDate       - 시작일 YYYY-MM-DD
 * @param {string} params.endDate         - 종료일 YYYY-MM-DD
 * @param {number} [params.limit]         - 페이지당 행 수 (없으면 전체)
 * @param {number} [params.offset]        - 오프셋 (기본: 0)
 * @param {number} [params.minCost]       - 최소 비용 필터
 * @param {number} [params.minDistribution] - 최소 전환(배분/주문) 필터
 * @param {number} [params.minRoas]       - 최소 ROAS 필터
 * @param {object} [params.filters]       - 동적 필터 (컬럼명: 값 배열 또는 like 구조)
 * @returns {Promise<Array>}              - 조회 결과 배열
 */
export async function fetchBigQuery({
  datasetId,
  tableId = 'performance_raw',
  reportType,
  startDate,
  endDate,
  limit,
  offset = 0,
  minCost,
  minDistribution,
  minRoas,
  filters,
}) {
  const queryParams = {
    dataset_id: datasetId,
    table_id: tableId,
    report_type: reportType,
    start_date: startDate,
    end_date: endDate,
  };

  if (limit !== undefined) {
    queryParams.limit = limit;
    queryParams.offset = offset;
  }
  if (minCost !== undefined) queryParams.min_cost = minCost;
  if (minDistribution !== undefined) queryParams.min_distribution = minDistribution;
  if (minRoas !== undefined) queryParams.min_roas = minRoas;
  if (filters && Object.keys(filters).length > 0) {
    queryParams.filters = JSON.stringify(filters);
  }

  const result = await mainClient.get('/search/bigquery/date', queryParams);
  return Array.isArray(result) ? result : (result.data || []);
}
