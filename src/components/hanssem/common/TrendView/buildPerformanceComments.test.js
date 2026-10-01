import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPerformanceComments } from './buildPerformanceComments.js';

const hf = { ordersKey: 'orders', ordersLabel: '구매 건수', lineKey: 'roas', lineLabel: 'ROAS' };
const rehouse = { ordersKey: 'distribution', ordersLabel: '확보 배분수', lineKey: 'cpa', lineLabel: '배분 CPA' };
const raw = (date, media_name, cost, revenue, orders = 10) => ({ date, media_name, cost, total_revenue: revenue, total_orders: orders, distribution: orders });
const aggregate = rows => rows.reduce((total, row) => ({
  cost: total.cost + row.cost,
  revenue: total.revenue + row.total_revenue,
  orders: total.orders + row.total_orders,
  distribution: total.distribution + row.distribution
}), { cost: 0, revenue: 0, orders: 0, distribution: 0 });
const run = (trendData, cfg = hf, selectedMedia = '') => {
  const scoped = selectedMedia ? trendData.filter(row => row.media_name === selectedMedia) : trendData;
  const data = ['a', 'b'].map(period => ({ period, ...aggregate(scoped.filter(row => row.date === period)) }));
  return buildPerformanceComments({ data, trendData, cfg, selectedMedia, activeSubTab: selectedMedia ? 'media' : 'integrated', mediaBreakdownData: [] });
};

test('overall improvement describes gain first and protects high ROAS declining media', () => {
  const result = run([raw('a', 'apple', 100, 4000), raw('a', 'rtb', 900, 900), raw('b', 'apple', 25, 700), raw('b', 'rtb', 975, 7000)]);
  assert.match(result.weekly, /개선되었습니다/);
  assert.match(result.weekly, /개선 방향의 기여 변화가 가장 큰 매체는 rtb/);
  assert.match(result.weekly, /반대 방향.*apple/);
  assert.match(result.monthly, /apple.*동일 구간 전체 770.0%와 비교하면 효율이 높습니다/);
  assert.doesNotMatch(result.monthly, /apple.*추가 증액 보류를 제안/);
  assert.doesNotMatch(result.monthly, /비교 후보는 rtb/);
});

test('ROAS decomposition separates own efficiency from allocation effects', () => {
  const result = run([raw('a', 'A', 100, 400), raw('a', 'B', 100, 200), raw('b', 'A', 200, 200), raw('b', 'B', 100, 300)]);
  assert.match(result.weekly, /전체 ROAS.*악화되었습니다/);
  assert.match(result.weekly, /자체 효율 변화 175.0%p 하락, 비용 비중 변화 41.7%p 상승/);
  assert.match(result.monthly, /A.*추가 증액 보류를 제안/);
});

test('already reduced low efficiency spend does not receive another automatic cut', () => {
  const result = run([raw('a', 'A', 100, 100), raw('a', 'B', 100, 500), raw('b', 'A', 50, 25), raw('b', 'B', 100, 500)]);
  assert.match(result.monthly, /비용이 늘지 않았으므로 추가 감액을 자동 제안하지 않습니다/);
});

test('unchanged overall ROAS is not described as overall decline', () => {
  const result = run([raw('a', 'A', 100, 400), raw('a', 'B', 100, 200), raw('b', 'A', 100, 200), raw('b', 'B', 100, 400)]);
  assert.match(result.weekly, /동일되었습니다/);
  assert.doesNotMatch(result.weekly, /악화 방향/);
});

test('selected media benchmark uses latest whole market, not cumulative figures', () => {
  const result = run([raw('a', 'A', 100, 400), raw('a', 'B', 100, 200), raw('b', 'A', 100, 300), raw('b', 'B', 100, 100)], hf, 'A');
  assert.match(result.monthly, /동일 구간 전체 200.0%와 비교하면 효율이 높습니다/);
});

test('CPA improvement uses lower-is-better for both direction and recommendation', () => {
  const result = run([raw('a', 'A', 100, 0, 10), raw('a', 'B', 100, 0, 10), raw('b', 'A', 100, 0, 5), raw('b', 'B', 100, 0, 20)], rehouse);
  assert.match(result.weekly, /전체 배분 CPA.*개선되었습니다/);
  assert.match(result.monthly, /우선 재검토 후보는 A/);
  assert.match(result.monthly, /비교 후보는 B/);
});

test('new channel and missing previous period do not establish stable efficiency', () => {
  const result = run([raw('a', 'A', 100, 200), raw('b', 'A', 100, 200), raw('b', 'new', 10, 1000)]);
  assert.doesNotMatch(result.monthly, /비교 후보는 new/);
  assert.match(result.weekly, /따로 산정하지 않습니다/);
});

test('no data or no conversions does not recommend reallocating budget', () => {
  const empty = buildPerformanceComments({ data: [], mediaBreakdownData: [], cfg: hf });
  assert.match(empty.daily, /데이터가 없습니다/);
  const zero = run([raw('a', 'A', 100, 0, 0), raw('b', 'A', 100, 0, 0)]);
  assert.doesNotMatch(zero.monthly, /비교 후보는/);
});
