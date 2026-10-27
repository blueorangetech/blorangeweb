import { aggregate, groupBy } from './data.js';

const steps = [
  { from: 'clicks', to: 'visits', fromLabel: '광고 클릭', toLabel: '랜딩 방문', action: '광고 연결 URL과 리다이렉트 구간을 점검하고, 중간 경유 없이 보험료 계산 랜딩으로 연결하는 안을 기존 연결 방식과 비교합니다.' },
  { from: 'visits', to: 'starts', fromLabel: '랜딩 방문', toLabel: '계산 시작', action: '해당 키워드의 랜딩 첫 화면에 보험료 계산 버튼을 배치하고, 광고 문구와 동일한 계산 안내를 버튼 위에 표시하는 안을 기존 화면과 비교합니다.' },
  { from: 'starts', to: 'quotes', fromLabel: '계산 시작', toLabel: '계산 완료', action: '계산 폼의 단계별 진입·입력 오류·이탈 이벤트를 먼저 수집합니다. 이탈이 가장 큰 입력 단계에서 필수 항목을 우선 표시하고, 오류 발생 시 기존 입력을 유지하는 안을 기존 폼과 비교합니다.' },
  { from: 'quotes', to: 'contracts', fromLabel: '계산 완료', toLabel: '가입 완료', action: '보험료 결과 화면의 가입 버튼을 보험료 바로 아래에 배치하고, 선택한 보장·차량 정보가 가입 화면에서도 유지되도록 연결하는 안을 기존 화면과 비교합니다.' },
];
const number = value => Math.round(value).toLocaleString('ko-KR');
const money = value => `${number(value)}원`;

function getKeywordTarget(items, keyword) {
  const selected = items.filter(row => row.keyword === keyword.name);
  const segments = [...new Set(selected.map(row => `${row.media}|${row.device}`))].map(key => {
    const [media, device] = key.split('|');
    return { media, device, ...aggregate(selected.filter(row => row.media === media && row.device === device)) };
  }).sort((a, b) => b.spend - a.spend);
  return segments[0];
}

export function buildKeywordInsights(items) {
  const total = aggregate(items);
  if (!items.length || !total.spend) return [];
  const keywords = groupBy(items, 'keyword').filter(row => row.spend > 0);
  const best = keywords.filter(row => row.contracts > 0).sort((a, b) => a.cpa - b.cpa)[0];
  const worst = [...keywords].sort((a, b) => {
    if (!a.contracts || !b.contracts) return Number(!b.contracts) - Number(!a.contracts) || b.spend - a.spend;
    return b.cpa - a.cpa;
  })[0];
  const insights = [];
  if (best) {
    const segment = getKeywordTarget(items, best);
    const enoughSample = segment.contracts >= 20;
    const cpaLimit = segment.contracts ? segment.cpa * 1.1 : null;
    const difference = (best.cpa / total.cpa - 1) * 100;
    insights.push({
      id: 'efficiency', label: '효율 개선', title: `‘${best.name}’ 확장 조건 확인`,
      evidenceHeading: '01. 확장 후보를 선정한 근거',
      evidence: `선택 범위에서 광고비 ${money(best.spend)}, 가입 ${number(best.contracts)}건, 가입 CPA ${money(best.cpa)}입니다. 선택 범위 평균 ${money(total.cpa)} 대비 ${Math.abs(difference).toFixed(1)}% ${difference <= 0 ? '낮습니다' : '높습니다'}. 클릭 대비 가입 전환율은 ${best.cvr.toFixed(2)}%이며, 광고비 비중은 ${(best.spend / total.spend * 100).toFixed(1)}%입니다.`,
      actionHeading: '02. 증액 전에 확인할 조건',
      action: `우선 검토 대상은 해당 키워드 내 광고비가 가장 큰 ${segment.media} ${segment.device}입니다. 이 범위의 가입은 ${number(segment.contracts)}건입니다. ${enoughSample ? '매체 관리 화면에서 예산 소진 시간과 예산 부족으로 놓친 노출을 확인합니다. 예산 제한이 확인되고 해당 키워드의 예산을 분리할 수 있을 때만 일 예산을 최대 10% 높이고, 입찰·소재는 고정합니다. 다른 키워드와 공유 예산이면 분리 전까지 증액을 보류합니다. 노출 점유율을 제공하지 않는 매체는 시간대별 소진·노출 중단 이력으로 확인합니다.' : '가입 표본이 20건 미만이므로 즉시 증액하지 않고, 같은 조건으로 추가 집계합니다. 20건 이상 확보한 뒤 예산 소진 시간과 예산 제한 여부를 확인해 최대 10% 증액 테스트를 검토합니다.'}`,
      validationHeading: '03. 확대·중단 판단 기준',
      validation: `시험 전후 각각 7일 이상, 동일 요일 구성으로 비교하고 전환 집계에 7일을 추가 반영합니다. ${segment.contracts ? `해당 범위의 가입 CPA ${money(segment.cpa)}를 기준으로, 가입의 일평균이 증가하면서 CPA가 ${money(cpaLimit)} 이내인지 확인합니다.` : '가입이 발생한 뒤 해당 범위의 CPA 기준값을 확정합니다.'} 증액 후 추가 지출 대비 추가 가입의 CPA도 함께 산출합니다. CPA가 기준 대비 10% 넘게 악화되거나 가입 증가가 없으면 증액분을 원복합니다. 표본이 부족하면 판정을 보류합니다.`,
      limitation: '낮은 CPA는 확장 후보를 고르는 근거입니다. 실제 증액은 가입 표본과 예산 제한을 확인한 뒤 판단하며, 브랜드·일반 키워드의 검색 의도 차이도 함께 검토합니다.',
      keyword: best, segment, cpaLimit,
    });
  }
  if (worst) {
    const segment = getKeywordTarget(items, worst);
    const targetCpa = segment.contracts ? segment.cpa * 0.9 : null;
    insights.push({
      id: 'optimization', label: '키워드 최적화', title: `‘${worst.name}’ 비용 발생 구간 점검`,
      evidenceHeading: '01. 우선 점검 키워드',
      evidence: `선택 범위에서 광고비 ${money(worst.spend)}, 클릭 ${number(worst.clicks)}회, 보험료 계산 완료 ${number(worst.quotes)}건, 가입 ${number(worst.contracts)}건입니다. ${worst.contracts ? `가입 CPA ${money(worst.cpa)}로 현재 키워드 중 가장 높습니다.` : '가입이 없어 CPA를 산출할 수 없습니다.'} 광고비 비중 ${(worst.spend / total.spend * 100).toFixed(1)}%에 비해 가입 기여 비중은 ${(worst.contracts / (total.contracts || 1) * 100).toFixed(1)}%입니다.`,
      actionHeading: '02. 검색어 정리 후 입찰 조정',
      action: `우선 대상은 해당 키워드 내 광고비가 가장 큰 ${segment.media} ${segment.device}입니다. 실제 검색어 보고서를 받아 가입 의도와 무관한 검색어를 분류하고, 확인된 검색어만 제외합니다. 변경 이력을 남긴 뒤 7일 이상 관찰합니다. 불필요한 검색어가 없거나 제외 후에도 CPA가 높으면, 수동 입찰에서 이 범위의 입찰가를 10% 낮추는 시험을 별도로 진행합니다. 자동 입찰이면 개별 입찰가 조정 대신 해당 키워드의 캠페인 분리 가능성을 검토합니다.`,
      validationHeading: '03. 비용 절감과 가입 유지 확인',
      validation: `검색어 제외와 입찰 변경은 동시에 진행하지 않습니다. 각 변경 전후를 동일 요일 구성으로 7일 이상 비교하고, 전환 집계에 7일을 추가 반영합니다. ${targetCpa ? `해당 범위의 CPA ${money(segment.cpa)} → ${money(targetCpa)}를 개선 목표로 두되, 가입의 일평균은 변경 전의 90% 이상을 유지하는지 확인합니다.` : '가입 발생 여부와 광고비 감소를 함께 확인하고, 가입이 발생하면 CPA 개선 기준을 설정합니다.'} 비용만 줄고 가입이 10% 넘게 감소하면 입찰을 원복하고 검색어별 성과를 재검토합니다.`,
      limitation: '현재 키워드 집계만으로 비관련 검색어를 확정할 수 없습니다. 실제 검색어와 입찰 방식 확인 후 실행하며, 목표 수치는 실험의 판단 기준입니다.',
      keyword: worst, segment, targetCpa,
    });
  }
  return insights;
}

export function buildConversionInsight(items) {
  const total = aggregate(items);
  const step = steps.filter(s => total[s.from] > 0)
    .map(s => ({ ...s, lossRate: 1 - total[s.to] / total[s.from] }))
    .sort((a, b) => b.lossRate - a.lossRate)[0];
  if (!step) return null;
  const segments = [...new Set(items.map(row => `${row.media}|${row.device}`))].map(key => {
    const [media, device] = key.split('|');
    const selected = items.filter(row => row.media === media && row.device === device);
    const data = aggregate(selected);
    return { media, device, items: selected, ...data, loss: data[step.from] - data[step.to] };
  }).sort((a, b) => b.loss - a.loss);
  const segment = segments[0];
  const rate = segment[step.to] / segment[step.from];
  const keyword = [...new Set(segment.items.map(row => row.keyword))].map(name => {
    const data = aggregate(segment.items.filter(row => row.keyword === name));
    return { name, ...data, loss: data[step.from] - data[step.to] };
  }).sort((a, b) => b.loss - a.loss)[0];
  const totalLoss = total[step.from] - total[step.to];
  const peer = segments.find(s => s.media === segment.media && s.device !== segment.device && s[step.from] > 0);
  const peerText = peer ? ` 같은 매체 ${peer.device} 전환율은 ${(peer[step.to] / peer[step.from] * 100).toFixed(1)}%입니다.` : '';
  const keywordRate = keyword[step.to] / keyword[step.from];
  const target = Math.min(1, keywordRate + 0.02);
  return {
    title: `${segment.media} ${segment.device} · ${step.fromLabel} → ${step.toLabel}`,
    evidence: `${step.fromLabel} ${number(segment[step.from])}건 중 ${step.toLabel} ${number(segment[step.to])}건으로 전환율은 ${(rate * 100).toFixed(1)}%입니다. 미전환 ${number(segment.loss)}건은 선택 범위 해당 구간 이탈의 ${(segment.loss / (totalLoss || 1) * 100).toFixed(1)}%를 차지합니다.${peerText}`,
    action: `우선 대상은 ‘${keyword.name}’ 유입입니다. ${step.fromLabel} ${number(keyword[step.from])}건 중 ${step.toLabel} ${number(keyword[step.to])}건으로, 미전환은 ${number(keyword.loss)}건입니다. ${step.action}`,
    validation: `해당 키워드의 ${segment.media} ${segment.device} 유입을 50:50으로 나누고 7일 이상 비교합니다. ${step.fromLabel} 대비 ${step.toLabel} 전환율 ${(keywordRate * 100).toFixed(1)}% → ${(target * 100).toFixed(1)}%를 개선 목표로 설정합니다. 표본이 부족하면 기간을 연장하고, 가입 CPA와 최종 가입 전환율이 악화되지 않는지 함께 확인합니다.`,
    limitation: '현재 집계는 이탈 위치를 보여줍니다. 원인 확정과 개선 효과 판단에는 단계별 오류 로그 및 비교 실험이 필요합니다.',
    from: step.from, to: step.to, segment, keyword, rate, keywordRate, target,
  };
}
