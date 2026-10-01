import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRehouseCreativeMetrics as normalize } from './rehouseCreativeMetrics.js';

test('raw aggregate totals calculate all creative metrics despite stale zero fields', () => {
  const row = normalize({ impressions: 10000, clicks: 200, cost: 100000, consultation: 40, distribution: 20, confirm: 5, ctr: 0, cpa: 0, confirm_cvr: 0 });
  assert.equal(row.ctr, 2);
  assert.equal(row.cpc, 500);
  assert.equal(row.cvr, 10);
  assert.equal(row.distribution_cvr, 50);
  assert.equal(row.cpa, 5000);
  assert.equal(row.confirm_cvr, 25);
  assert.equal(row.confirm_cpa, 20000);
});

test('empty denominators are not zero efficiency and valid zero numerators remain zero', () => {
  const row = normalize({ impressions: 100, clicks: 0, cost: 1000, consultation: 0, distribution: 0, confirm: 0 });
  assert.equal(row.ctr, 0);
  for (const key of ['cpc', 'cvr', 'distribution_cvr', 'cpa', 'confirm_cvr', 'confirm_cpa']) assert.equal(row[key], null);
  assert.equal(normalize({ clicks: 100, distribution: 0 }).cvr, 0);
});

test('comma strings and supplied values are supported when source totals are absent', () => {
  assert.equal(normalize({ cost: '100,000', distribution: '20' }).cpa, 5000);
  assert.equal(normalize({ ctr: '2.50%' }).ctr, 2.5);
  assert.equal(normalize({ ctr: 'invalid' }).ctr, null);
  assert.equal(normalize({ impressions: ' ', clicks: null }).ctr, null);
});

test('CPA ordering uses calculated values rather than missing supplied fields', () => {
  const rows = [{ cost: 100000, distribution: 10 }, { cost: 50000, distribution: 20 }].map(normalize).sort((a, b) => a.cpa - b.cpa);
  assert.equal(rows[0].cpa, 2500);
});
