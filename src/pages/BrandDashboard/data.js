// Independent presentation dataset. Never import client reports into this module.
export const MONTHS = ['2026-04', '2026-05', '2026-06'];
export const BRANDS = [
  { id: 'dongnealba', name: '동네알바', initial: '동', color: '#20b77a', description: '우리 동네 일자리 연결', budget: 28600000, cpc: 156, rate: .036, primary: '알바님 프로필등록', events: ['설치', '사장님 프로필등록', '알바님 프로필등록', '공고등록', '지원하기'], factors: [2.1, .075, 1, .12, .48], channels: [['Meta', 'DA', .45], ['Google Ads', 'CPI', .27], ['NAVER', 'SA', .28]] },
  { id: 'fostiny', name: '포스티니', initial: '포', color: '#9d00ff', description: '나를 알아가는 운세 서비스', budget: 14800000, cpc: 213, rate: .0024, primary: '구매완료', events: ['회원가입', '결과확인', '상담버튼', '구매완료'], factors: [5.5, 14, 8.2, 1], channels: [['NAVER', 'SA', .44], ['Meta', 'DA', .38], ['Google Ads', 'DA', .18]] },
  { id: 'komate', name: '코메이트', initial: '코', color: '#2868ff', description: '외국인을 위한 커리어 플랫폼', budget: 7800000, cpc: 287, rate: .019, primary: '이용동의', events: ['회원가입', '이용동의', '이력서저장', '입사지원'], factors: [1.2, 1, .27, .11], channels: [['Google Ads', 'SA', .42], ['Meta', 'DA', .58]] },
  { id: 'wonderful', name: '원더풀시니어', initial: '원', color: '#fc8800', description: '경험이 새로운 기회가 되는 곳', budget: 9200000, cpc: 114, rate: .024, primary: '이용동의', events: ['이용동의', '이력서저장', '입사지원', '컨설팅신청'], factors: [1, .19, .045, .018], channels: [['NAVER', 'SA', .19], ['Meta', 'DA', .49], ['Google Ads', 'DA', .32]] },
  { id: 'begins', name: '비긴즈', initial: '비', color: '#b334d1', description: '설렘의 시작, 가치관 기반 매칭', budget: 12600000, cpc: 706, rate: .092, primary: '프로필생성', events: ['설치', '이용동의', '프로필생성'], factors: [1.7, 1.18, 1], channels: [['Meta', 'DA', .72], ['Apple Ads', 'CPI', .28]] },
  { id: 'goodbuilder', name: '굿빌더', initial: '굿', color: '#4d4dff', description: '건설 인재와 현장을 잇다', budget: 4600000, cpc: 338, rate: .012, primary: '프로필완료', events: ['설치', '개인 회원가입', '프로필완료', '기업 회원가입'], factors: [3.1, 1.32, 1, .14], channels: [['NAVER', 'SA', .22], ['Meta', 'DA', .48], ['Google Ads', 'CPI', .30]] },
  { id: 'jumpit', name: '점핏', initial: '점', color: '#51c92b', description: '개발자의 다음 커리어', budget: 8400000, cpc: 189, rate: .0062, primary: '입사지원', events: ['설치', '이력서저장', '입사지원'], factors: [7.5, 2.3, 1], channels: [['Google Ads', 'CPI', .34], ['Meta', 'DA', .46], ['NAVER', 'SA', .20]] },
];

export const ratio = (numerator, denominator) => denominator > 0 ? numerator / denominator : null;
export const delta = (current, previous) => previous > 0 ? (current - previous) / previous : null;

// Stable, independent samples keep reloads consistent without linking CTR to CPC.
function sample(key) {
  let hash = 2166136261;
  for (const char of key) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}

export function getRows(month) {
  const monthIndex = MONTHS.indexOf(month);
  if (monthIndex < 0) return [];
  const days = new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate();
  return BRANDS.flatMap((brand, b) => brand.channels.flatMap(([channel, type, share], c) => {
    const budget = Math.round(brand.budget * share * [.92, 1.04, 1][monthIndex]);
    return Array.from({ length: days }, (_, d) => {
      const wave = 1 + .19 * Math.sin((d + b * 2 + c) * .63);
      const spend = Math.round(budget / days * wave * (.87 + b * .017 + c * .025));
      const date = `${month}-${String(d + 1).padStart(2, '0')}`;
      const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
      const seed = `${brand.id}:${month}:${channel}:${d}`;
      const cpcByWeekday = type === 'SA'
        ? [.87, 1.12, 1.08, 1.04, 1.02, .96, .89]
        : [1.07, .95, .98, 1.02, .97, 1.04, 1.1];
      const ctrByWeekday = type === 'SA'
        ? [.91, 1.08, 1.04, 1.02, 1.01, .97, .9]
        : [1.14, .96, .93, 1.01, .98, 1.06, 1.17];
      const cpcDrift = 1 + .06 * Math.sin(d / 5 + b + c * 1.7 + monthIndex);
      const ctrDrift = 1 + .09 * Math.cos(d / 6 + b * .7 - c + monthIndex);
      const dailyCpc = brand.cpc * (1 + c * .18) * cpcByWeekday[weekday]
        * cpcDrift * (.73 + .54 * sample(`${seed}:cpc`));
      const dailyCtr = (.009 + b * .0018 + c * .003) * ctrByWeekday[weekday]
        * ctrDrift * (.64 + .72 * sample(`${seed}:ctr`));
      const clicks = Math.max(1, Math.round(spend / dailyCpc));
      const impressions = Math.max(clicks, Math.round(clicks / dailyCtr));
      const primary = Math.round(clicks * brand.rate * (.88 + monthIndex * .09) * (1 + .17 * Math.cos(d * .4 + c)));
      const events = Object.fromEntries(brand.events.map((event, e) => [event, Math.round(primary * brand.factors[e])]));
      return { brandId: brand.id, channel, type, date, spend, clicks, impressions, events, budget: d === 0 ? budget : 0 };
    });
  }));
}

export function aggregate(rows) {
  const total = rows.reduce((acc, row) => {
    for (const key of ['budget', 'spend', 'impressions', 'clicks']) acc[key] += row[key];
    for (const [event, count] of Object.entries(row.events)) acc.events[event] = (acc.events[event] || 0) + count;
    return acc;
  }, { budget: 0, spend: 0, impressions: 0, clicks: 0, events: {} });
  return { ...total, ctr: ratio(total.clicks, total.impressions), cpc: ratio(total.spend, total.clicks), pacing: ratio(total.spend, total.budget) };
}

export function exportCsv(rows) {
  const columns = ['브랜드', '매체', '유형', '일자', '집행액', '노출', '클릭', '전환항목', '전환수'];
  const records = rows.flatMap(row => Object.entries(row.events).map(([event, count]) => [BRANDS.find(b => b.id === row.brandId).name, row.channel, row.type, row.date, row.spend, row.impressions, row.clicks, event, count]));
  // Event rows repeat delivery metrics; export one delivery row and separate event rows instead.
  const data = records.map((record, index) => {
    const previous = records[index - 1];
    return previous && previous.slice(0, 4).join('|') === record.slice(0, 4).join('|') ? record.map((v, i) => i >= 4 && i <= 6 ? '' : v) : record;
  });
  return '\uFEFF' + [columns, ...data].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
}
