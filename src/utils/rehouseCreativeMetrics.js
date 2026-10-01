const numeric = value => {
  if (value === undefined || value === null) return null;
  const cleaned = typeof value === 'string' ? value.replace(/[,％%]/g, '').trim() : value;
  if (cleaned === '') return null;
  const result = Number(cleaned);
  return Number.isFinite(result) ? result : null;
};

export function normalizeRehouseCreativeMetrics(data) {
  const impressions = numeric(data.impressions);
  const clicks = numeric(data.clicks);
  const cost = numeric(data.cost);
  const consultation = numeric(data.consultation);
  const distribution = numeric(data.distribution);
  const confirm = numeric(data.confirm);
  const ratio = (numerator, denominator, scale, key) => {
    if (denominator !== null && denominator <= 0) return null;
    if (numerator !== null && denominator !== null) return numerator / denominator * scale;
    return numeric(data[key]);
  };
  return {
    ...data, impressions, clicks, cost, consultation, distribution, confirm,
    ctr: ratio(clicks, impressions, 100, 'ctr'),
    cpc: ratio(cost, clicks, 1, 'cpc'),
    cvr: ratio(distribution, clicks, 100, 'cvr'),
    distribution_cvr: ratio(distribution, consultation, 100, 'distribution_cvr'),
    cpa: ratio(cost, distribution, 1, 'cpa'),
    confirm_cvr: ratio(confirm, distribution, 100, 'confirm_cvr'),
    confirm_cpa: ratio(cost, confirm, 1, 'confirm_cpa')
  };
}
