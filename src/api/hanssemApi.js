/**
 * 한샘 리하우스 (hanssem) 페이지 API
 *
 * 사용하는 report_type:
 *  - trend               : TrendView (성과 트렌드)
 *  - media_material      : InsightView / MediaInsightView (소재 카드, 무한스크롤)
 *  - media_material_for_csv : CompareView, MediaMixCampaignView, MediaMixCompareView
 *  - all_material        : AllMaterialInsightView (전체 소재 카드)
 *  - all_material_for_csv: AllMaterialInsightView CSV 다운로드용
 */

import { fetchBigQuery, formatDate } from './bigquery';

const DATASET_ID = 'hanssem';
const TABLE_ID = 'performance_raw';

// ─── TrendView ───────────────────────────────────────────────────────────────

/**
 * 성과 트렌드 데이터 조회 (date × media × media_name 집계)
 * trend type은 파생지표(ctr, cpc, cpa 등) 포함 — 서버 값 그대로 사용
 */
export const fetchTrendData = ({ startDate, endDate }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'trend',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  });

// ─── InsightView (MediaInsightView) ──────────────────────────────────────────

/**
 * 소재별 성과 데이터 조회 (무한스크롤 / 페이지네이션)
 * raw 지표만 반환 — 파생지표는 프론트에서 계산
 */
export const fetchMediaMaterialData = ({ startDate, endDate, limit, offset, minCost, minDistribution, filters }) =>
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
    filters,
  });

/**
 * 소재별 전체 데이터 조회 (CSV 다운로드 / 요약 테이블 / 필터 옵션용)
 * date 차원 포함, raw 지표만 반환
 */
export const fetchMediaMaterialFullData = ({ startDate, endDate }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'media_material_for_csv',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  });

// ─── AllMaterialInsightView ───────────────────────────────────────────────────

/**
 * 전체 통합 소재 카드 데이터 조회 (media 차원 제외)
 * raw 지표만 반환
 */
export const fetchAllMaterialData = ({ startDate, endDate, limit, offset, minCost, minDistribution, filters }) =>
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
    filters,
  });

/**
 * 전체 통합 소재 전체 데이터 조회 (CSV 다운로드 / 필터 옵션용)
 * date 차원 포함, raw 지표만 반환
 */
export const fetchAllMaterialFullData = ({ startDate, endDate }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'all_material_for_csv',
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

