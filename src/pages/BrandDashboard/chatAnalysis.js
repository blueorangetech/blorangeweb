import { BRANDS, MONTHS, getRows, aggregate, ratio, delta } from './data.js';
import { TRAFFIC_MONTHS, TRAFFIC_SERVICES, getTrafficComparison } from './trafficData.js';

const n = value => value == null ? '—' : Math.round(value).toLocaleString('ko-KR');
const won = value => value == null ? '—' : `₩${n(value)}`;
const pct = value => value == null ? '비교 불가' : `${(value * 100).toFixed(1)}%`;
const change = value => value == null ? '비교 불가' : `${value > 0 ? '+' : ''}${pct(value)}`;
export const CHAT_QUESTIONS = ['집행액이 가장 높은 브랜드와 예산 소진율은?', '사람인 월간 UV 추이를 요약해줘', '매체별 CPC를 비교해줘', '9월 사람인과 잡코리아 모바일 앱 UV를 비교해줘'];

export function analyzeChat(question, previousContext = {}, defaultMonth = '2026-06') {
  const q = question.trim();
  const text = q.replace(/\s/g, '').toLowerCase();
  const traffic = /트래픽|순방문|uv|pv|페이지뷰|잡코리아|원티드|리멤버|인크루트/.test(text);
  const mentions = BRANDS.filter(brand => text.includes(brand.name.replace(/\s/g, '')) || text.includes(brand.id));
  const explicitBrandDomain = mentions.length > 0 || /예산|집행|cpa|cpc|ctr|전환|광고|매체|브랜드|네이버|메타|구글|애플|\bsa\b|\bda\b|\bcpi\b/.test(text);
  const domain = traffic ? 'traffic' : explicitBrandDomain ? 'brand' : previousContext.domain || 'brand';
  const months = domain === 'traffic' ? TRAFFIC_MONTHS : MONTHS;
  const match = q.match(/(?:(20\d{2})\s*(?:년|[.\-/])\s*)?(1[0-2]|0?[1-9])\s*월/)
    || q.match(/(20\d{2})[-./](0?[1-9]|1[0-2])(?:\D|$)/);
  const sameDomain = previousContext.domain === domain;
  let month = match ? `${match[1] || '2026'}-${match[2].padStart(2, '0')}` : sameDomain ? previousContext.month : domain === 'traffic' ? TRAFFIC_MONTHS.at(-1) : defaultMonth;
  if (!match && /^(그럼|그러면)?(지난달|이전달|전월)(은|도|데이터|보여)/.test(text)) {
    const index = months.indexOf(month);
    month = months[index - 1] || '';
  }
  const context = { domain, month, brandIds: domain === 'brand' ? mentions.length ? mentions.map(brand => brand.id) : /전체|모든브랜드/.test(text) ? [] : sameDomain ? previousContext.brandIds || [] : [] : [] };
  const unavailable = message => ({ title: '분석 범위 확인', paragraphs: [message], table: null, source: '대시보드 데이터 범위', context, suggestions: CHAT_QUESTIONS.slice(0, 3) });
  if (!months.includes(month)) return unavailable(`요청한 기간의 데이터가 없습니다. ${domain === 'traffic' ? '트래픽 UV는 2025.10~2026.09' : '브랜드 광고 성과는 2026.04~2026.06'} 범위에서 조회할 수 있습니다.`);
  if (/실시간|오늘|어제|내일|예측|주가|날씨|경쟁사매출|개인정보|전화번호/.test(text)) return unavailable('현재는 저장된 월별 대시보드 데이터만 분석할 수 있습니다. 실시간 조회·미래 예측·개인별 정보는 제공하지 않습니다.');

  if (domain === 'traffic') {
    if (/페이지뷰|pv|일별|일간|주간|주별/.test(text)) return unavailable('트래픽 데이터는 월간 UV만 제공합니다. PV·주간·일간 수치를 임의로 만들지 않습니다. 기기와 월을 지정해 UV를 질문해 주세요.');
    const device = /pc|피씨|데스크톱/.test(text) ? 'PC' : /모바일|앱/.test(text) ? 'MO(APP)' : sameDomain ? previousContext.device || 'MO(APP)' : 'MO(APP)';
    context.device = device;
    const comparison = getTrafficComparison(device, TRAFFIC_MONTHS[0], month);
    const requested = TRAFFIC_SERVICES.filter(service => text.includes(service.name));
    const services = requested.length ? requested : sameDomain && previousContext.serviceIds?.length ? TRAFFIC_SERVICES.filter(service => previousContext.serviceIds.includes(service.id)) : TRAFFIC_SERVICES;
    context.serviceIds = services.map(service => service.id);
    const saramin = comparison.ranking.find(service => service.id === 'saramin');
    const competitor = comparison.ranking.find(service => service.id !== 'saramin');
    const selected = comparison.ranking.filter(service => context.serviceIds.includes(service.id));
    const series = /추이|트렌드|흐름/.test(text);
    return {
      title: `${month.replace('-', '.')} ${device === 'PC' ? 'PC' : '모바일 앱'} 트래픽 분석`,
      paragraphs: [`사람인의 월간 UV는 ${n(saramin.uv)}명으로 전체 5개 서비스 중 ${saramin.rank}위입니다. 전월 대비 ${change(saramin.mom)}입니다.`, `${competitor.name}의 UV는 ${n(competitor.uv)}명이며, 사람인이 ${n(Math.abs(saramin.uv - competitor.uv))}명 ${saramin.uv >= competitor.uv ? '많습니다' : '적습니다'}. 기기·서비스 간 중복이 있어 UV는 합산하지 않습니다.`],
      table: series ? { headers: ['월', ...services.map(service => `${service.name} UV`)], rows: comparison.rows.map(row => [row.month, ...services.map(service => n(row[service.id]))]) } : { headers: ['서비스', '전체 순위', '월간 UV', '전월 대비'], rows: selected.map(service => [service.name, `${service.rank}위`, `${n(service.uv)}명`, change(service.mom)]) },
      source: `코리안클릭 월간 UV · ${device} · ${month}`,
      context,
      suggestions: [`${month.slice(5)}월 사람인 PC UV도 비교해줘`, '사람인과 잡코리아 UV 추이를 보여줘', '6월 브랜드 집행액을 비교해줘'],
    };
  }

  const known = explicitBrandDomain || /요약|성과|효율|순위|비교|증감|지난달|전월|이전달|좋은|높은|낮은/.test(text);
  if (!known) return unavailable('브랜드별 예산·집행액·노출·클릭·CTR·CPC·전환·CPA와 경쟁 서비스 UV를 분석할 수 있습니다. 브랜드, 기간 또는 비교할 지표를 포함해 질문해 주세요.');
  if (/매출|roas|구매금액|객단가|리텐션|소재|키워드/.test(text)) return unavailable('이 챗의 분석 데이터에는 매출·ROAS·리텐션·소재별·키워드별 상세 지표가 포함되어 있지 않습니다. 브랜드·매체별 클릭, 전환, CPA 또는 경쟁 서비스 UV를 질문해 주세요.');
  const typeMatches = [...q.matchAll(/(?:^|[^a-z])(sa|da|cpi)(?=[^a-z]|$)/gi)].map(match => match[1].toUpperCase());
  const type = typeMatches.length === 1 ? typeMatches[0] : typeMatches.length > 1 || /전체유형|모든유형/.test(text) ? 'all' : sameDomain ? previousContext.type || 'all' : 'all';
  context.type = type;
  const typeLabel = typeMatches.length > 1 ? [...new Set(typeMatches)].join('·') : type === 'all' ? '전체 광고 유형' : type;
  const channelNames = [['NAVER', /네이버|naver/], ['Meta', /메타|meta/], ['Google Ads', /구글|google/], ['Apple Ads', /애플|apple/]].filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  context.channels = channelNames.length ? channelNames : /전체매체|모든매체|매체별/.test(text) ? [] : sameDomain ? previousContext.channels || [] : [];
  const brands = BRANDS.filter(brand => !context.brandIds.length || context.brandIds.includes(brand.id));
  const filter = row => brands.some(brand => brand.id === row.brandId) && (typeMatches.length > 1 ? typeMatches.includes(row.type) : type === 'all' || row.type === type) && (!context.channels.length || context.channels.includes(row.channel));
  const rows = getRows(month).filter(filter);
  const previousMonth = MONTHS[MONTHS.indexOf(month) - 1];
  const oldRows = previousMonth ? getRows(previousMonth).filter(filter) : [];
  if (!rows.length) return unavailable('선택한 브랜드와 광고 유형의 운영 내역이 없습니다. 전체 광고 유형 또는 다른 브랜드를 선택해 주세요.');
  const total = aggregate(rows);
  const oldTotal = aggregate(oldRows);
  const totals = brands.map(brand => ({ ...brand, ...aggregate(rows.filter(row => row.brandId === brand.id)) })).filter(brand => brand.spend > 0);
  const followup = !explicitBrandDomain && sameDomain;
  const cpc = /cpc|클릭당/.test(text) || (followup && previousContext.cpc);
  const conversions = /전환|cpa|회원가입|입사지원|구매완료|프로필/.test(text) || (followup && previousContext.conversions);
  const mediaIntent = /매체|채널|네이버|메타|구글|애플/.test(text) || typeMatches.length > 0 || (followup && previousContext.mediaIntent);
  Object.assign(context, { cpc: Boolean(cpc), conversions: Boolean(conversions), mediaIntent: Boolean(mediaIntent) });
  const paragraphs = [`${month.replace('-', '.')} · ${brands.map(brand => brand.name).join(', ')} · ${typeLabel}${context.channels.length ? ` · ${context.channels.join(', ')}` : ''} 기준입니다. 집행액 ${won(total.spend)}, 예산 소진율 ${pct(total.pacing)}, 노출 ${n(total.impressions)}회, 클릭 ${n(total.clicks)}회입니다.`, `가중 평균 CPC는 ${won(total.cpc)}, CTR은 ${pct(total.ctr)}입니다.${oldRows.length ? ` 전월 대비 집행액 ${change(delta(total.spend, oldTotal.spend))}, 클릭 ${change(delta(total.clicks, oldTotal.clicks))}, CPC ${change(delta(total.cpc, oldTotal.cpc))}입니다.` : ' 직전월 자료가 없어 전월 증감률은 계산하지 않습니다.'}`];
  let table;
  if (mediaIntent) {
    const improvement = cpc && /개선|증감|전월/.test(text);
    const channels = [...new Set(rows.map(row => row.channel))].map(channel => {
      const current = aggregate(rows.filter(row => row.channel === channel));
      const before = aggregate(oldRows.filter(row => row.channel === channel));
      return { channel, ...current, cpcChange: delta(current.cpc, before.cpc) };
    }).sort((a, b) => improvement ? (a.cpcChange ?? Infinity) - (b.cpcChange ?? Infinity) : cpc ? a.cpc - b.cpc : b.clicks - a.clicks);
    if (conversions) {
      const details = totals.flatMap(brand => [...new Set(rows.filter(row => row.brandId === brand.id).map(row => row.channel))].map(channel => ({ brand, channel, ...aggregate(rows.filter(row => row.brandId === brand.id && row.channel === channel)) })));
      table = { headers: ['브랜드', '매체', '전환 기준', '전환 수', 'CPA'], rows: details.map(row => [row.brand.name, row.channel, row.brand.primary, `${n(row.events[row.brand.primary] || 0)}건`, won(ratio(row.spend, row.events[row.brand.primary]))]) };
      paragraphs.push('브랜드마다 전환 정의가 달라 전환 수를 합산하지 않았습니다. 동일 브랜드 안에서 매체별 CPA를 비교하세요.');
    } else {
      table = { headers: ['매체', '집행액', '클릭', 'CTR', 'CPC', 'CPC 전월 대비'], rows: channels.map(row => [row.channel, won(row.spend), n(row.clicks), pct(row.ctr), won(row.cpc), change(row.cpcChange)]) };
      paragraphs.push(improvement ? oldRows.length ? `CPC 증감률이 가장 낮은 매체는 ${channels[0].channel}(${change(channels[0].cpcChange)})입니다. 음수는 클릭당 비용 감소, 양수는 증가입니다.` : '직전월 데이터가 없어 CPC 개선 순위는 계산하지 않습니다.' : cpc ? `클릭당 비용이 가장 낮은 매체는 ${channels[0].channel}(${won(channels[0].cpc)})입니다. 클릭 단가만으로 전환 품질을 판단하지 않으며 전환 효율도 함께 확인해야 합니다.` : `클릭 수가 가장 많은 매체는 ${channels[0].channel}(${n(channels[0].clicks)}회)입니다.`);
    }
  } else if (conversions) {
    if (totals.length === 1) {
      const brand = totals[0];
      const old = aggregate(oldRows);
      table = { headers: ['전환 이벤트', '전환 수', 'CPA', '전월 대비'], rows: [] };
      // aggregate.events contains counts; use the configured event definitions.
      const definitions = BRANDS.find(item => item.id === brand.id).events;
      table.rows = definitions.map(event => [event, `${n(brand.events[event] || 0)}건`, won(ratio(brand.spend, brand.events[event])), change(delta(brand.events[event], old.events[event]))]);
      paragraphs.push(`대표 KPI는 ${brand.primary}입니다. 이벤트 간 사용자가 중복될 수 있어 단계별 전환 수를 합산하지 않습니다.`);
    } else {
      table = { headers: ['브랜드', '대표 전환', '전환 수', 'CPA'], rows: totals.map(brand => [brand.name, brand.primary, `${n(brand.events[brand.primary] || 0)}건`, won(ratio(brand.spend, brand.events[brand.primary]))]) };
      paragraphs.push('브랜드별 대표 전환의 정의가 다르므로 CPA가 낮다는 이유만으로 브랜드 간 우열을 판단하지 않습니다.');
    }
  } else {
    const sorted = [...totals].sort((a, b) => cpc ? a.cpc - b.cpc : b.spend - a.spend);
    table = { headers: ['브랜드', '집행액', '계획예산', '소진율', 'CPC'], rows: sorted.map(brand => [brand.name, won(brand.spend), won(brand.budget), pct(brand.pacing), won(brand.cpc)]) };
    paragraphs.push(cpc ? `CPC가 가장 낮은 브랜드는 ${sorted[0].name}(${won(sorted[0].cpc)})입니다.` : `집행액 1위는 ${sorted[0].name}이며 ${won(sorted[0].spend)} 집행, 소진율 ${pct(sorted[0].pacing)}입니다.`);
    const attention = totals.filter(brand => brand.pacing > 1 || brand.pacing < .9);
    if (attention.length) paragraphs.push(`${attention.map(brand => brand.name).join(', ')}의 소진율이 90~100% 범위 밖에 있습니다. 운영 기간과 집행 계획을 확인하세요.`);
  }
  return { title: `${month.replace('-', '.')} ${conversions ? '전환 성과' : mediaIntent ? '매체 효율' : '브랜드 성과'} 분석`, paragraphs, table, source: `브랜드 대시보드 집계 · ${month} · ${typeLabel}`, context, suggestions: ['매체별 CPC를 비교해줘', '전환 성과도 요약해줘', '9월 사람인과 잡코리아 UV를 비교해줘'] };
}
