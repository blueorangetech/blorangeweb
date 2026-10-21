import { BRANDS, aggregate, ratio, delta } from './data.js';

const count = value => Math.round(value).toLocaleString('ko-KR');
const money = value => value == null ? '—' : `₩${count(value)}`;
const rate = value => value == null ? '—' : `${(value * 100).toFixed(1)}%`;
const change = (current, previous) => {
  const value = delta(current, previous);
  return value == null ? '전월 비교 불가' : `전월 대비 ${rate(Math.abs(value))} ${value > 0 ? '증가' : value < 0 ? '감소' : '동일'}`;
};

function analyzeMedia(channel, channels, current, primary) {
  const { name, spend, clicks, conversions, before, cpa } = channel;
  const spendShare = ratio(spend, current.spend);
  const conversionShare = ratio(conversions, current.events[primary]);
  const spendChange = delta(spend, before.spend);
  const conversionChange = delta(conversions, before.conversions);
  const cpaChange = delta(cpa, before.cpa);
  const prefix = `${name} · `;
  if (spend > 0 && conversions === 0) {
    return `${prefix}${money(spend)} 집행, 클릭 ${count(clicks)}회에도 ${primary}는 0건입니다. 전환 수집 상태와 유입 이후 행동을 확인해야 합니다.`;
  }
  if (spend === 0) {
    return `${prefix}현재 집행액이 없어 유료 광고 효율 비교에서 제외합니다. ${primary} ${count(conversions)}건의 귀속 기간을 확인하세요.`;
  }
  const facts = `${primary} ${count(conversions)}건, CPA ${money(cpa)}`;
  const comparable = channels.filter(item => item.spend > 0 && item.conversions >= 10);
  const lowest = [...comparable].sort((a, b) => a.cpa - b.cpa)[0];
  const highest = [...comparable].sort((a, b) => b.cpa - a.cpa)[0];
  const averageCpa = ratio(current.spend, current.events[primary]);
  const position = comparable.length > 1 && lowest.cpa < highest.cpa
    ? channel === lowest ? '비교 가능한 매체 중 CPA가 가장 낮습니다. ' : channel === highest ? `비교 가능한 매체 중 CPA가 가장 높습니다.${cpa > averageCpa ? ` 브랜드 평균(${money(averageCpa)})보다 ${rate(cpa / averageCpa - 1)} 높습니다.` : ''} ` : ''
    : '';
  let insight;
  if (spendChange != null && conversionChange != null && spendChange > .05 && conversionChange < -.05) {
    insight = `집행액은 ${change(spend, before.spend)}했지만 전환은 ${change(conversions, before.conversions)}했습니다. 예산 증가가 전환 확대로 이어지지 않았습니다.`;
  } else if (cpaChange != null && cpaChange > .1) {
    insight = `CPA가 ${change(cpa, before.cpa)}했습니다. 전환은 ${change(conversions, before.conversions)}, 집행액은 ${change(spend, before.spend)}했습니다.`;
  } else if (cpaChange != null && cpaChange < -.1 && conversionChange > .05) {
    insight = `전환이 ${change(conversions, before.conversions)}하는 동안 CPA는 ${rate(Math.abs(cpaChange))} 낮아져 전환량과 비용 효율이 함께 개선됐습니다.`;
  } else if (!channel.hadPrevious) {
    insight = '전월 동일 매체의 운영 데이터가 없어 이번 달 성과를 비교 기준으로 기록합니다.';
  } else if (before.conversions === 0) {
    insight = '전월 0건에서 전환이 발생했습니다. 전월 CPA와의 증감률은 계산하지 않습니다.';
  } else {
    insight = `전환은 ${change(conversions, before.conversions)}, CPA는 ${change(cpa, before.cpa)}했습니다.`;
  }
  if (channels.length > 1 && conversionShare != null) {
    const gap = conversionShare - spendShare;
    insight += ` 집행 비중 ${rate(spendShare)} 대비 전환 기여도 ${rate(conversionShare)}로${gap >= .05 ? ' 전환 기여도가 더 높습니다.' : gap <= -.05 ? ' 전환 기여도가 낮습니다.' : ' 비슷한 수준입니다.'}`;
  } else {
    insight += ' 선택 조건에서 운영 매체가 하나이므로 매체 간 비교는 제외합니다.';
  }
  if (conversions < 10) insight += ' 전환이 10건 미만이므로 예산 조정 전 추가 관찰이 필요합니다.';
  return `${prefix}${facts}. ${position}${insight}`;
}

export function buildAnalysis(rows, previousRows) {
  if (!rows.length) return [];
  const total = aggregate(rows);
  const previous = aggregate(previousRows);
  const brands = BRANDS.filter(brand => rows.some(row => row.brandId === brand.id));
  const summaries = brands.map(brand => {
    const current = aggregate(rows.filter(row => row.brandId === brand.id));
    const before = aggregate(previousRows.filter(row => row.brandId === brand.id));
    const conversions = current.events[brand.primary] || 0;
    const oldConversions = before.events[brand.primary] || 0;
    const cpa = ratio(current.spend, conversions);
    const oldCpa = ratio(before.spend, oldConversions);
    const channels = [...new Set(rows.filter(row => row.brandId === brand.id).map(row => row.channel))].map(channel => {
      const result = aggregate(rows.filter(row => row.brandId === brand.id && row.channel === channel));
      const priorRows = previousRows.filter(row => row.brandId === brand.id && row.channel === channel);
      const prior = aggregate(priorRows);
      const channelConversions = result.events[brand.primary] || 0;
      const priorConversions = prior.events[brand.primary] || 0;
      return { name: channel, ...result, conversions: channelConversions, cpa: ratio(result.spend, channelConversions), hadPrevious: priorRows.length > 0, before: { ...prior, conversions: priorConversions, cpa: ratio(prior.spend, priorConversions) } };
    }).sort((a, b) => b.spend - a.spend);
    const unconverted = channels.filter(channel => channel.spend > 0 && channel.conversions === 0);
    const deteriorating = channels.filter(channel => channel.cpa != null && delta(channel.cpa, channel.before.cpa) > .1);
    const candidates = channels.filter(channel => channel.spend > 0 && channel.conversions >= 10).sort((a, b) => a.cpa - b.cpa);
    const best = candidates[0];
    const worst = candidates[candidates.length - 1];
    const action = unconverted.length
      ? `${unconverted.map(channel => channel.name).join(', ')}에서 지출 후 대표 전환이 없습니다. 전환 수집과 랜딩 경로를 우선 점검하세요.`
      : deteriorating.length
        ? `${deteriorating.map(channel => channel.name).join(', ')}의 CPA가 전월보다 10% 넘게 상승했습니다. 해당 매체의 유입 구성과 전환율을 먼저 확인하세요.`
        : best && worst !== best && worst.cpa / best.cpa >= 1.2
          ? `${best.name}의 CPA(${money(best.cpa)})가 ${worst.name}(${money(worst.cpa)})보다 ${rate(1 - best.cpa / worst.cpa)} 낮습니다. 전환 품질과 추가 집행 여력을 확인한 뒤 소규모 예산 이동을 검토하세요.`
          : '매체 간 큰 효율 차이를 확인하기 어렵습니다. 현재 배분을 유지하며 대표 전환과 CPA 변화를 관찰하세요.';
    return {
      title: brand.name,
      performance: `${brand.primary} ${count(conversions)}건(${change(conversions, oldConversions)}), CPA ${money(cpa)}입니다.${oldCpa != null && cpa != null ? ` CPA는 ${change(cpa, oldCpa)}했습니다.` : ''}`,
      media: channels.map(channel => analyzeMedia(channel, channels, current, brand.primary)),
      action: `${brand.name}: ${action}`,
    };
  });
  return [
    { title: '핵심 요약', items: [`총 ${money(total.spend)}을 집행했고 계획예산 대비 소진율은 ${rate(total.pacing)}입니다.`, `클릭 ${count(total.clicks)}회, CTR ${rate(total.ctr)}, CPC ${money(total.cpc)}입니다.`] },
    { title: '주요 변화', items: [`집행액: ${change(total.spend, previous.spend)} · 클릭: ${change(total.clicks, previous.clicks)}`, ...summaries.map(item => `${item.title} · ${item.performance}`)] },
    { title: '매체별 분석', items: summaries.flatMap(item => item.media.map(text => `${item.title} · ${text}`)) },
    { title: '다음 운영 제안', items: [...(total.pacing > 1 ? ['계획예산을 초과했습니다. 추가 예산 승인 여부와 매체별 집행 한도를 확인하세요.'] : total.pacing < .9 ? ['예산 소진율이 90% 미만입니다. 미집행 사유와 운영 기간을 확인하세요.'] : []), ...summaries.map(item => item.action)] },
  ];
}
