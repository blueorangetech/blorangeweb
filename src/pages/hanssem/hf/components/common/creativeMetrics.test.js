import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCreativeMetrics } from './creativeMetrics.js';

test('first reported card computes rates from totals despite supplied zero fields', () => {
  const metrics = normalizeCreativeMetrics({ impressions: 9695, clicks: 168, total_cost: 478505, total_orders: 20, total_revenue: 16187870, total_users: 100, ctr: 0, cpc: 0, roas: 0, inflow_cvr: 0, purchase_cvr: 0 });
  assert.equal(metrics.ctr.toFixed(2), '1.73');
  assert.equal(Math.round(metrics.cpc), 2848);
  assert.equal(Math.round(metrics.roas), 3383);
  assert.equal(metrics.inflow_cvr.toFixed(2), '59.52');
  assert.equal(metrics.purchase_cvr, 20);
});

test('second reported card computes CTR CPC ROAS and distinguishes absent user counts', () => {
  const metrics = normalizeCreativeMetrics({ impressions: 12441, clicks: 552, total_cost: 521211, total_orders: 20, total_revenue: 14593140 });
  assert.equal(metrics.ctr.toFixed(2), '4.44');
  assert.equal(Math.round(metrics.cpc), 944);
  assert.equal(Math.round(metrics.roas), 2800);
  assert.equal(metrics.inflow_cvr, null);
  assert.equal(metrics.purchase_cvr, null);
});

test('supports alternate names numeric strings commas and supplied percentage strings', () => {
  const metrics = normalizeCreativeMetrics({ cost: '1,000', clicks: '100', orders: '10', users: '50', revenue: '5,000', ctr: '2.45%' });
  assert.equal(metrics.ctr, 2.45);
  assert.equal(metrics.cpc, 10);
  assert.equal(metrics.roas, 500);
  assert.equal(metrics.purchase_cvr, 20);
});

test('zero numerators are valid zero rates and zero denominators are uncomputable', () => {
  const zero = normalizeCreativeMetrics({ impressions: 100, clicks: 0, total_cost: 100, total_users: 0, total_orders: 0, total_revenue: 0 });
  assert.equal(zero.ctr, 0);
  assert.equal(zero.roas, 0);
  assert.equal(zero.cpc, null);
  assert.equal(zero.purchase_cvr, null);
  assert.equal(normalizeCreativeMetrics({ total_cost: 0, cost: 100, total_revenue: 100 }).roas, null);
});

test('keeps precomputed metrics when component callers omit source totals', () => {
  const source = { ctr: 1.2, cpc: 3, roas: 200, inflow_cvr: 25, purchase_cvr: 5 };
  const metrics = normalizeCreativeMetrics(source);
  for (const key of Object.keys(source)) assert.equal(metrics[key], source[key]);
  assert.equal(normalizeCreativeMetrics(metrics).purchase_cvr, 5);
  assert.equal(normalizeCreativeMetrics({ total_cost: 'invalid', total_revenue: ' ' }).roas, null);
});
