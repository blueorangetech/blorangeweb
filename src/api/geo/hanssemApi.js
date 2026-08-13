/**
 * 한샘 리하우스 (hanssem) 페이지 API
 */

import { fetchBigQuery, formatDate } from './bigquery';

const DATASET_ID = 'hanssem';
const TABLE_ID = 'performance_raw';

export const fetchTrendData = ({ startDate, endDate }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'trend',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  });

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

export const fetchMediaMaterialFullData = ({ startDate, endDate }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'media_material_for_csv',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  });

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

export const fetchAllMaterialFullData = ({ startDate, endDate }) =>
  fetchBigQuery({
    datasetId: DATASET_ID,
    tableId: TABLE_ID,
    reportType: 'all_material_for_csv',
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
