export const MONTHS = ['2026-09', '2026-08', '2026-07'];
export const MEDIA = ['NAVER', 'Google', 'Daum'];
export const MEDIA_BUDGETS = {
  '2026-09': { NAVER: 100000000, Google: 45000000, Daum: 20000000 },
  '2026-08': { NAVER: 102000000, Google: 44000000, Daum: 22000000 },
  '2026-07': { NAVER: 98000000, Google: 42000000, Daum: 21000000 },
};
const mediaSettings = {
  NAVER: { volume: 1, cost: 1, quoteRate: 1, closeRate: 1 },
  Google: { volume: 0.48, cost: 0.87, quoteRate: 1, closeRate: 1 },
  Daum: { volume: 0.29, cost: 0.76, quoteRate: 0.93, closeRate: 1.08 },
};
const keywords = [
  ['삼성화재 자동차보험', '브랜드', 4200, 0.19, 0.34],
  ['삼성화재 다이렉트', '브랜드', 3800, 0.22, 0.32],
  ['삼성 자동차보험 견적', '브랜드', 2700, 0.18, 0.30],
  ['자동차보험 비교', '일반', 5100, 0.075, 0.19],
  ['자동차보험료 계산', '일반', 4500, 0.11, 0.24],
  ['다이렉트 자동차보험', '일반', 4800, 0.09, 0.22],
  ['자동차보험 갱신', '일반', 3400, 0.13, 0.26],
  ['첫 자동차보험', '일반', 3100, 0.065, 0.17],
];
export const rows = MONTHS.flatMap((month, mi) => Array.from({ length: new Date(2026, Number(month.slice(5)), 0).getDate() }, (_, d) =>
  MEDIA.flatMap((media, m) => ['모바일', 'PC'].flatMap((device, v) => keywords.map(([keyword, group, cpc, rate, close], k) => {
    const settings = mediaSettings[media];
    const wave = 1 + Math.sin((d + k) * 0.62) * 0.17;
    const clicks = Math.round((group === '브랜드' ? 92 : 65) * settings.volume * (v ? 0.38 : 1) * wave * (1 - mi * 0.06));
    const spend = Math.round(clicks * cpc * settings.cost * (1 + mi * 0.035));
    const visits = Math.round(clicks * 0.94);
    const starts = Math.round(visits * (group === '브랜드' ? 0.58 : 0.40));
    const quotes = Math.min(starts, Math.round(clicks * rate * settings.quoteRate * (v ? 0.88 : 1) * (1 - mi * 0.06)));
    const expectedContracts = quotes * close * settings.closeRate * (1 - mi * 0.05);
    const contracts = Math.floor(expectedContracts) + ((d + k + m + v) % 10 < (expectedContracts % 1) * 10 ? 1 : 0);
    return { date: `${month}-${String(d + 1).padStart(2, '0')}`, month, media, device, keyword, group, campaign: `${group} 검색 · ${device}`, clicks, spend, impressions: Math.round(clicks / (group === '브랜드' ? 0.13 : 0.045)), visits, starts, quotes, contracts };
  })))
)).flat();

export function aggregate(items) {
  const total = items.reduce((acc, row) => {
    for (const key of ['spend', 'impressions', 'clicks', 'visits', 'starts', 'quotes', 'contracts']) acc[key] += row[key];
    return acc;
  }, { spend: 0, impressions: 0, clicks: 0, visits: 0, starts: 0, quotes: 0, contracts: 0 });
  return { ...total, cpa: total.contracts ? total.spend / total.contracts : 0, cpc: total.clicks ? total.spend / total.clicks : 0, ctr: total.impressions ? total.clicks / total.impressions * 100 : 0, cvr: total.clicks ? total.contracts / total.clicks * 100 : 0 };
}
export function groupBy(items, key) {
  return [...new Set(items.map(row => row[key]))].map(name => ({ name, ...aggregate(items.filter(row => row[key] === name)) }));
}

export function getMediaBudgetReport(month, media = '전체') {
  return MEDIA.filter(name => media === '전체' || name === media).map(name => {
    const budget = MEDIA_BUDGETS[month]?.[name] || 0;
    const spend = aggregate(rows.filter(row => row.month === month && row.media === name)).spend;
    return { name, budget, spend, remaining: Math.max(0, budget - spend), overrun: Math.max(0, spend - budget), rate: budget ? spend / budget * 100 : null };
  });
}
