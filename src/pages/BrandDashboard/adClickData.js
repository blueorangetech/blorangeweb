// Restored original weekly ad clicks; source did not specify a year.
export const AD_MEDIA_OPTIONS = [
  { key: 'naverSA', name: '네이버 SA', color: '#03a85a', media: 'Naver', type: 'SA' },
  { key: 'googleSA', name: '구글 SA', color: '#4285f4', media: 'Google', type: 'SA' },
  { key: 'metaDA', name: '메타 DA', color: '#7463d5', media: 'Meta', type: 'DA' },
  { key: 'naverGFA', name: '네이버 GFA', color: '#16a6a0', media: 'Naver GFA', type: 'DA' },
  { key: 'googleGDN', name: '구글 GDN', color: '#e59129', media: 'Google GDN', type: 'DA' },
];

export function getAdMonthlyClicks(mediaRows) {
  // SA rows include both a total and device breakdowns: use the total once.
  return AD_MEDIA_OPTIONS.map(option => {
    const matches = mediaRows.filter(row => row.media === option.media && row.type === option.type);
    const total = matches.find(row => row.device === '전체');
    return { ...option, clicks: total ? total.clicks : matches.reduce((sum, row) => sum + row.clicks, 0) };
  });
}

export const getAdSelectedRows = (rows, keys) => rows.map(row => ({ ...row, total: keys.reduce((sum, key) => sum + row[key], 0) }));

export function getAdMonthlySeries(months, baseMedia) {
  // Independent of UV. Stable month/media samples preserve values across filters.
  return months.map(month => ({
    month,
    ...Object.fromEntries(baseMedia.map((media, index) => {
      let hash = 2166136261;
      for (const char of `${month}:${media.key}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
      const sample = (hash >>> 0) / 4294967296;
      const season = 1 + .12 * Math.sin(Number(month.slice(5)) * .8 + index);
      return [media.key, month === '2026-08' ? media.clicks : Math.round(media.clicks * season * (.68 + sample * .65))];
    })),
  }));
}

export function combineMonthlyTraffic(rows, monthlyRows, keys) {
  return rows.map(row => {
    const clicks = monthlyRows.find(item => item.month === row.month);
    return { ...row, ...Object.fromEntries(keys.map(key => [key, clicks?.[key] ?? null])), adTotal: clicks ? keys.reduce((sum, key) => sum + clicks[key], 0) : null };
  });
}

export function getMonthlyAdShares(rows, keys) {
  return rows.map(row => {
    const total = keys.reduce((sum, key) => sum + row[key], 0);
    const parts = keys.map(key => ({ key, exact: total > 0 ? row[key] / total * 1000 : 0 }));
    const shares = Object.fromEntries(parts.map(item => [item.key, Math.floor(item.exact)]));
    const remainder = total > 0 ? 1000 - Object.values(shares).reduce((sum, value) => sum + value, 0) : 0;
    [...parts].sort((a, b) => (b.exact % 1) - (a.exact % 1)).slice(0, remainder).forEach(item => { shares[item.key]++; });
    return { ...row, total, shares: Object.fromEntries(keys.map(key => [key, shares[key] / 10])) };
  });
}

export const AD_WEEKLY_CLICKS = [
  {
    period: 'W26',
    label: '6월 4주',
    range: '06.24 ~ 06.30',
    naverSA: 21500,
    googleSA: 34800,
    metaDA: 24200,
    naverGFA: 14600,
    googleGDN: 15300,
  },
  {
    period: 'W27',
    label: '7월 1주',
    range: '07.01 ~ 07.07',
    naverSA: 22800,
    googleSA: 36500,
    metaDA: 25800,
    naverGFA: 15400,
    googleGDN: 16200,
  },
  {
    period: 'W28',
    label: '7월 2주',
    range: '07.08 ~ 07.14',
    naverSA: 22400,
    googleSA: 35900,
    metaDA: 25100,
    naverGFA: 15100,
    googleGDN: 15900,
  },
  {
    period: 'W29',
    label: '7월 3주',
    range: '07.15 ~ 07.21',
    naverSA: 23600,
    googleSA: 37800,
    metaDA: 26500,
    naverGFA: 15900,
    googleGDN: 16800,
  },
  {
    period: 'W30',
    label: '7월 4주',
    range: '07.22 ~ 07.28',
    naverSA: 24500,
    googleSA: 39100,
    metaDA: 27400,
    naverGFA: 16500,
    googleGDN: 17400,
  },
  {
    period: 'W31',
    label: '8월 1주',
    range: '07.29 ~ 08.04',
    naverSA: 25400,
    googleSA: 40500,
    metaDA: 28600,
    naverGFA: 17200,
    googleGDN: 18100,
  },
  {
    period: 'W32',
    label: '8월 2주',
    range: '08.05 ~ 08.11',
    naverSA: 26200,
    googleSA: 41800,
    metaDA: 29500,
    naverGFA: 17900,
    googleGDN: 18800,
  },
  {
    period: 'W33',
    label: '8월 3주',
    range: '08.12 ~ 08.18',
    naverSA: 27400,
    googleSA: 43600,
    metaDA: 30800,
    naverGFA: 18700,
    googleGDN: 19600,
  },
  {
    period: 'W34',
    label: '8월 4주',
    range: '08.19 ~ 08.25',
    naverSA: 28900,
    googleSA: 45800,
    metaDA: 32400,
    naverGFA: 19800,
    googleGDN: 20700,
  },
  {
    period: 'W35',
    label: '8월 5주',
    range: '08.26 ~ 09.01',
    naverSA: 29800,
    googleSA: 47200,
    metaDA: 33500,
    naverGFA: 20400,
    googleGDN: 21300,
  },
];
