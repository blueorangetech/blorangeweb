/**
 * 한샘 홈퍼니싱 (hanssem_hf) 페이지 API
 */

import { fetchBigQuery, formatDate } from './bigquery';
import { aiApi } from './aiApi';

const DATASET_ID = 'hanssem_hf';
const TABLE_ID = 'performance_raw';

export const fetchTrendData = ({ startDate, endDate }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'trend',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  });

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

export const fetchCompareData = ({ startDate, endDate }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'compare_data',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  });

export const fetchMaterialForCsv = ({ startDate, endDate }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'media_material_for_csv',
    startDate: typeof startDate === 'string' ? startDate : formatDate(startDate),
    endDate: typeof endDate === 'string' ? endDate : formatDate(endDate),
  });

export const fetchMaterialMonthly = ({ startDate, endDate }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'media_material_monthly',
    startDate: typeof startDate === 'string' ? startDate : formatDate(startDate),
    endDate: typeof endDate === 'string' ? endDate : formatDate(endDate),
  });

export const runAiCompare = (payloadA, payloadB) => {
  return aiApi.compareAssets(payloadA, payloadB);
};

export const runAiCommonality = (payloadAssets) => {
  return aiApi.analyzeCommonality(payloadAssets);
};
