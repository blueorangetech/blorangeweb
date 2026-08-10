/**
 * 한샘 홈퍼니싱 (hanssem_hf) 페이지 API
 *
 * 사용하는 report_type:
 *  - trend               : TrendView (성과 트렌드)
 *  - data_table          : AllMaterialInsightView / MediaInsightView 날짜별 요약 테이블
 *  - media_material      : MediaInsightView 소재 카드 (무한스크롤)
 *  - all_material        : AllMaterialInsightView 소재 카드 (무한스크롤)
 *  - compare_data        : ABCompareView 소재 비교
 *  - media_material_for_csv : CompareView, MediaMixCampaignView, MediaMixCompareView
 */

import { fetchBigQuery, formatDate } from './bigquery';

const DATASET_ID = 'hanssem_hf';
const TABLE_ID = 'performance_raw';

// ─── TrendView ───────────────────────────────────────────────────────────────

/**
 * 성과 트렌드 데이터 조회 (date × media × media_name 집계)
 * trend type은 파생지표(ctr, cpc, roas 등) 포함 — 서버 값 그대로 사용
 */
export const fetchTrendData = ({ startDate, endDate }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'trend',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  });

// ─── MediaInsightView (소재별 인사이트) ──────────────────────────────────────

/**
 * 날짜별 요약 테이블 데이터 조회
 * raw 지표만 반환 — ctr, cpc, roas 등은 프론트에서 계산
 */
export const fetchDataTable = ({ startDate, endDate, filters, minCost, minDistribution, minRoas }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'data_table',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    filters,
    minCost,
    minDistribution,
    minRoas,
  });

/**
 * 소재별 성과 데이터 조회 (무한스크롤 / 페이지네이션)
 * media × 소재 차원 집계, raw 지표만 반환
 */
export const fetchMediaMaterialData = ({ startDate, endDate, limit, offset, minCost, minDistribution, minRoas, filters }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'media_material',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    limit,
    offset,
    minCost,
    minDistribution,
    minRoas,
    filters,
  });

// ─── AllMaterialInsightView (전체 통합 소재) ──────────────────────────────────

/**
 * 전체 통합 소재 카드 데이터 조회 (media 차원 제외, 무한스크롤)
 * raw 지표만 반환
 */
export const fetchAllMaterialData = ({ startDate, endDate, limit, offset, minCost, minDistribution, minRoas, filters }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'all_material',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    limit,
    offset,
    minCost,
    minDistribution,
    minRoas,
    filters,
  });

// ─── ABCompareView (A/B 소재 비교) ────────────────────────────────────────────

/**
 * A/B 소재 비교용 데이터 조회
 * media × device × business_unit × creative_type 집계, raw 지표만 반환
 * 파생지표(ctr, cpc, roas 등)는 프론트 aggregatedDataMap에서 계산
 */
export const fetchCompareData = ({ startDate, endDate }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'compare_data',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  });

// ─── CompareView / MediaMixCampaignView / MediaMixCompareView ─────────────────

/**
 * 기간 비교 / 미디어믹스 차트용 데이터 조회
 * date + 소재 차원 전체 포함, raw 지표만 반환
 * CompareView (기간 비교), MediaMixCampaignView (기간별 집계), MediaMixCompareView (기집행 비교)에서 공통 사용
 */
export const fetchMaterialForCsv = ({ startDate, endDate }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'media_material_for_csv',
    startDate: typeof startDate === 'string' ? startDate : formatDate(startDate),
    endDate: typeof endDate === 'string' ? endDate : formatDate(endDate),
  });

/**
 * 미디어믹스 성과용 월 단위 데이터 조회
 */
export const fetchMaterialMonthly = ({ startDate, endDate }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'media_material_monthly',
    startDate: typeof startDate === 'string' ? startDate : formatDate(startDate),
    endDate: typeof endDate === 'string' ? endDate : formatDate(endDate),
  });

// ─── AI Studio (AI 분석 / 인사이트) ────────────────────────────────────────────

/**
 * Creative A/B 소재 성과 데이터 및 비주얼 비교 분석 요청
 */
export const runAiCompare = async (payloadA, payloadB) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${API_BASE_URL}/api/ai/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      material_a: payloadA,
      material_b: payloadB
    })
  });
  if (!response.ok) {
    throw new Error('AI 분석 서버와 통신 실패');
  }
  return response.json();
};

/**
 * 우수 에셋 다중 이미지 및 성과 데이터 공통점 종합 분석 요청
 */
export const runAiCommonality = async (payloadAssets) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${API_BASE_URL}/api/ai/commonality`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assets: payloadAssets
    })
  });
  if (!response.ok) {
    throw new Error('AI 분석 서버와 통신 실패');
  }
  return response.json();
};

