const numeric = value => {
  if (value === null || value === undefined || value === '') return null;
  const cleaned = typeof value === 'string' ? value.replace(/[,％%]/g, '').trim() : value;
  if (cleaned === '') return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

// 동일 소재·조회 기간의 합계로 계산한다. 분모가 없거나 0이면 미산출로 구분한다.
export function normalizeCreativeMetrics(data) {
  const read = (...keys) => {
    for (const key of keys) {
      const value = numeric(data[key]);
      if (value !== null) return value;
    }
    return null;
  };
  const impressions = read('impressions');
  const clicks = read('clicks');
  const cost = read('total_cost', 'cost');
  const users = read('total_users', 'users');
  const orders = read('total_orders', 'orders');
  const revenue = read('total_revenue', 'revenue');
  const ratio = (numerator, denominator, scale, suppliedKey) => {
    if (denominator !== null && denominator <= 0) return null;
    if (numerator !== null && denominator !== null) return numerator / denominator * scale;
    return read(suppliedKey);
  };
  return {
    ...data,
    impressions,
    clicks,
    total_cost: cost,
    total_users: users,
    total_orders: orders,
    total_revenue: revenue,
    ctr: ratio(clicks, impressions, 100, 'ctr'),
    cpc: ratio(cost, clicks, 1, 'cpc'),
    inflow_cvr: ratio(users, clicks, 100, 'inflow_cvr'),
    purchase_cvr: ratio(orders, users, 100, 'purchase_cvr'),
    roas: ratio(revenue, cost, 100, 'roas')
  };
}
