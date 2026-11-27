const number = value => Math.round(value || 0).toLocaleString('ko-KR');
const won = value => `${number(value)}원`;
const percent = value => `${value.toFixed(1)}%`;
const change = (current, previous) => {
  if (current === previous) return '동일한 수준을 유지';
  if (previous <= 0) return '이전 구간이 0으로, 증감률 비교가 어려운 상태에서 새롭게 발생';
  return `${percent(Math.abs((current - previous) / previous * 100))} ${current > previous ? '증가' : '감소'}`;
};
const sum = rows => rows.reduce((total, row) => {
  for (const key of Object.keys(total)) total[key] += Number(row[key] || 0);
  return total;
}, { cost: 0, distribution: 0, consultation: 0, orders: 0, users: 0, revenue: 0 });

export function buildPerformanceComments({ data, mediaBreakdownData, cfg, activeSubTab, selectedMedia, trendData = [], getPeriod = date => date }) {
  if (!data.length) return {
    daily: '조회 기간에 분석 가능한 성과 데이터가 없습니다. 기간과 매체 선택을 확인해 주세요.',
    weekly: '매체별 기여도와 효율을 진단하려면 집행비용과 전환 데이터가 필요합니다.',
    monthly: '데이터가 확보되면 성과 변화와 매체별 기여도를 바탕으로 운영 우선순위를 제안합니다.'
  };

  const isRevenue = cfg.lineKey === 'roas';
  const volumeKey = cfg.ordersKey;
  const efficiency = row => isRevenue
    ? (row.cost > 0 ? row.revenue / row.cost * 100 : null)
    : (row[volumeKey] > 0 ? row.cost / row[volumeKey] : null);
  const formatEfficiency = value => value === null ? '산출 불가' : isRevenue ? percent(value) : won(value);
  const total = sum(data);
  const overall = efficiency(total);
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  let daily = '비교 가능한 구간이 1개여서 직전 구간 대비 변화는 판단하기 어렵습니다. 조회 기간을 넓혀 추이를 확인해 주세요.';
  let improved = null;
  if (prev) {
    const currentEfficiency = efficiency(last);
    const previousEfficiency = efficiency(prev);
    if (currentEfficiency !== null && previousEfficiency !== null && previousEfficiency > 0 && last.cost > 0 && prev.cost > 0) {
      improved = isRevenue ? currentEfficiency > previousEfficiency : currentEfficiency < previousEfficiency;
    }
    const diagnosis = improved === null
      ? '효율 비교를 위한 비용·전환 기준이 충분하지 않아 개선 여부를 단정하기 어렵습니다.'
      : currentEfficiency === previousEfficiency
        ? '비용 대비 성과 효율은 이전 구간과 동일합니다.'
        : improved
          ? (last[volumeKey] >= prev[volumeKey] ? '성과 규모를 유지하거나 확대하면서 비용 대비 효율도 개선되었습니다.' : '비용 대비 효율은 개선되었지만 전환 규모가 줄어, 효율과 물량의 균형을 확인해야 합니다.')
          : (last[volumeKey] > prev[volumeKey] ? '전환 규모는 확대되었지만 비용 대비 효율은 낮아져, 추가 집행의 수익성을 점검해야 합니다.' : '전환 규모와 비용 대비 효율을 함께 점검할 필요가 있습니다.');
    daily = `${last.period}의 ${cfg.ordersLabel} ${number(last[volumeKey])}건은 ${prev.period}(${number(prev[volumeKey])}건) 대비 ${change(last[volumeKey], prev[volumeKey])}했습니다. 집행비용은 ${won(last.cost)}으로 ${change(last.cost, prev.cost)}했습니다.\n${cfg.lineLabel}: ${formatEfficiency(previousEfficiency)} → ${formatEfficiency(currentEfficiency)}. ${diagnosis}\n선택한 집계 구간의 최근 두 구간 비교이며, 주·월 단위에서는 집계 일수 차이도 확인해 주세요.`;
  }

  const eligible = mediaBreakdownData.filter(row => row.cost > 0 && row[volumeKey] > 0);
  const top = [...mediaBreakdownData].sort((a, b) => b[volumeKey] - a[volumeKey])[0];
  const best = [...eligible].sort((a, b) => isRevenue ? efficiency(b) - efficiency(a) : efficiency(a) - efficiency(b))[0];
  let weekly;
  if (activeSubTab === 'integrated') {
    weekly = total[volumeKey] > 0 && top
      ? `조회 기간의 전환 규모를 가장 크게 기여한 매체는 ${top.media}입니다. ${cfg.ordersLabel} ${number(top[volumeKey])}건으로 전체의 ${percent(top[volumeKey] / total[volumeKey] * 100)}를 차지하며, 집행비용 비중은 ${total.cost > 0 ? percent(top.cost / total.cost * 100) : '산출 불가'}입니다.`
      : '조회 기간에 확인된 전환이 없어 매체별 성과 기여도를 판단하기 어렵습니다.';
    weekly += best
      ? `\n${cfg.lineLabel} 기준 효율이 가장 높은 매체는 ${best.media}(${formatEfficiency(efficiency(best))}, 전환 ${number(best[volumeKey])}건)입니다. 전환 규모와 효율 순위를 함께 확인하고, 소수 전환으로 나타난 높은 효율은 추가 검증해 주세요.`
      : '\n비용과 전환이 함께 확인되는 매체가 없어 효율 순위는 산정하지 않았습니다.';
  } else {
    const all = sum(mediaBreakdownData);
    const benchmark = efficiency(all);
    weekly = `${selectedMedia}의 조회 기간 누적 집행비용은 ${won(total.cost)}, ${cfg.ordersLabel}는 ${number(total[volumeKey])}건입니다. 기간 합계 기준 ${cfg.lineLabel}는 ${formatEfficiency(overall)}이며, 전체 매체의 동일 기간 ${cfg.lineLabel}는 ${formatEfficiency(benchmark)}입니다.`;
    const denominator = isRevenue ? total.users : total.consultation;
    weekly += `\n${isRevenue ? '유입 유저수 대비 구매 비율' : '상담신청수 대비 배분 비율'}은 ${denominator > 0 ? percent(total[volumeKey] / denominator * 100) : '산출 불가'}입니다. 매체별 타겟·상품·운영 목적 차이를 확인한 뒤 효율 차이를 해석해 주세요.`;
  }

  // 최근 구간의 전체 매체를 집계해 선택 매체도 동일 구간의 전체 효율과 비교한다.
  const periods = { current: {}, previous: {} };
  {
    for (const row of trendData) {
      const period = getPeriod((row.date || '').split('T')[0]);
      const bucket = period === last.period ? periods.current : prev && period === prev.period ? periods.previous : null;
      if (!bucket) continue;
      const media = row.media_name || '기타';
      if (!bucket[media]) bucket[media] = { cost: 0, revenue: 0, orders: 0, distribution: 0 };
      bucket[media].cost += Number(row.cost || row.total_cost || 0);
      bucket[media].revenue += Number(row.total_revenue || 0);
      bucket[media].orders += Number(row.total_orders || 0);
      bucket[media].distribution += Number(row.distribution || 0);
    }
  }
  const currentAll = sum(Object.values(periods.current));
  const previousAll = sum(Object.values(periods.previous));
  const benchmark = efficiency(currentAll);
  const comparable = activeSubTab === 'integrated' && prev && (isRevenue ? last.cost > 0 && prev.cost > 0 : last[volumeKey] > 0 && prev[volumeKey] > 0);
  const contributions = comparable ? [...new Set([...Object.keys(periods.current), ...Object.keys(periods.previous)])].map(media => {
    const empty = { cost: 0, revenue: 0, orders: 0, distribution: 0 };
    const current = periods.current[media] || empty;
    const previous = periods.previous[media] || empty;
    const delta = isRevenue
      ? (current.revenue / last.cost - previous.revenue / prev.cost) * 100
      : current.cost / last[volumeKey] - previous.cost / prev[volumeKey];
    // ROAS = Σ(비용 비중 × 매체 ROAS). 대칭 분해로 순서에 따른 편향을 피한다.
    const currentShare = currentAll.cost > 0 ? current.cost / currentAll.cost : 0;
    const previousShare = previousAll.cost > 0 ? previous.cost / previousAll.cost : 0;
    const currentEff = efficiency(current);
    const previousEff = efficiency(previous);
    const canDecompose = isRevenue && current.cost > 0 && previous.cost > 0;
    const efficiencyEffect = canDecompose ? (currentShare + previousShare) / 2 * (currentEff - previousEff) : null;
    const mixEffect = canDecompose ? (currentShare - previousShare) * (currentEff + previousEff) / 2 : null;
    return { media, current, previous, currentShare, previousShare, efficiencyEffect, mixEffect, impact: isRevenue ? -delta : delta };
  }).sort((a, b) => b.impact - a.impact) : [];
  const drag = contributions.find(row => row.impact > 0.0001);
  const gain = [...contributions].reverse().find(row => row.impact < -0.0001);
  const currentEfficiency = efficiency(last);
  const previousEfficiency = prev ? efficiency(prev) : null;
  const canCompare = comparable && currentEfficiency !== null && previousEfficiency !== null;
  const net = canCompare ? (isRevenue ? currentEfficiency - previousEfficiency : previousEfficiency - currentEfficiency) : null;
  const effectText = effect => `${Math.abs(effect).toFixed(1)}%p ${effect >= 0 ? '상승' : '하락'}`;
  const contributionText = row => isRevenue
    ? `ROAS ${effectText(-row.impact)}`
    : `CPA ${won(Math.abs(row.impact))} ${row.impact > 0 ? '상승' : '하락'}`;
  const focus = net === null ? null : net > 0 ? gain : net < 0 ? drag : null;
  if (canCompare) {
    weekly = `${prev.period} → ${last.period} 전체 ${cfg.lineLabel}는 ${formatEfficiency(previousEfficiency)} → ${formatEfficiency(currentEfficiency)}로 ${net > 0 ? '개선' : net < 0 ? '악화' : '동일'}되었습니다.`;
    if (focus) {
      weekly += `\n${net > 0 ? '개선' : '악화'} 방향의 기여 변화가 가장 큰 매체는 ${focus.media}(${contributionText(focus)})입니다. 집행비용 ${won(focus.previous.cost)} → ${won(focus.current.cost)}, 매체 ${cfg.lineLabel} ${formatEfficiency(efficiency(focus.previous))} → ${formatEfficiency(efficiency(focus.current))}.`;
      if (focus.efficiencyEffect !== null) weekly += `\n기여 변화를 분해하면 자체 효율 변화 ${effectText(focus.efficiencyEffect)}, 비용 비중 변화 ${effectText(focus.mixEffect)}입니다. 비용 비중은 ${percent(focus.previousShare * 100)} → ${percent(focus.currentShare * 100)}입니다.`;
      else weekly += '\n신규·집행 중단 매체 또는 CPA 분석에서는 자체 효율과 비용 비중의 효과를 따로 산정하지 않습니다.';
    }
    const counter = net > 0 ? drag : net < 0 ? gain : null;
    if (counter) weekly += `\n반대 방향의 가장 큰 기여 변화는 ${counter.media}(${contributionText(counter)})입니다.`;
    weekly += '\n기여 변화는 전체 지표의 수학적 분해이며 예산 조정의 직접 근거는 아닙니다.';
  }
  let action;
  if (total.cost <= 0) action = '비용 데이터 누락 여부를 먼저 확인한 뒤 예산 조정 여부를 판단해 주세요.';
  else if (total[volumeKey] <= 0) action = '전환 추적과 집계 지연을 먼저 확인하고, 유입 이후 전환 단계 및 소재·랜딩의 이탈 요인을 점검해 주세요.';
  else {
    const candidates = Object.entries(periods.current)
      .filter(([media, row]) => row.cost > 0 && row[volumeKey] > 0 && (activeSubTab === 'integrated' || media === selectedMedia))
      .map(([media, current]) => ({ media, current, previous: periods.previous[media], value: efficiency(current) }));
    const below = row => benchmark !== null && (isRevenue ? row.value < benchmark : row.value > benchmark);
    const declining = row => row.previous && row.previous.cost > 0 && efficiency(row.previous) !== null && (isRevenue ? row.value < efficiency(row.previous) : row.value > efficiency(row.previous));
    const risks = candidates.filter(row => below(row) && declining(row)).sort((a, b) => b.current.cost - a.current.cost);
    const strong = candidates.filter(row => row.previous && row.previous.cost > 0 && efficiency(row.previous) !== null && !below(row) && !declining(row) && benchmark !== null && row.value !== benchmark)
      .sort((a, b) => b.current[volumeKey] - a.current[volumeKey])[0];
    // 기여 변화가 감소했어도 최신 구간 평균보다 효율이 높으면 감액/증액 보류를 제안하지 않는다.
    const decliningStrong = candidates.filter(row => !below(row) && declining(row)).sort((a, b) => b.current.cost - a.current.cost)[0];
    const risk = risks[0];
    if (risk) {
      action = `${last.period} 우선 재검토 후보는 ${risk.media}입니다. 자체 ${cfg.lineLabel}가 ${formatEfficiency(efficiency(risk.previous))} → ${formatEfficiency(risk.value)}로 악화됐고, 동일 구간 전체 ${formatEfficiency(benchmark)}보다 효율이 낮습니다. 집행비용은 ${won(risk.previous.cost)} → ${won(risk.current.cost)}입니다. ${risk.current.cost > risk.previous.cost ? '효율이 낮아지는 동안 비용도 늘어, 다음 집행에서는 추가 증액 보류를 제안합니다.' : '비용이 늘지 않았으므로 추가 감액을 자동 제안하지 않습니다. 기존 조정의 성과를 재검토할 우선 대상입니다.'}`;
    } else action = `${last.period} 기준으로 자체 효율 악화와 전체 평균 대비 낮은 효율이 함께 확인된 매체는 ${candidates.length ? '없습니다. 기여도 감소만으로 감액·증액 보류를 제안하지 않습니다.' : '판단할 수 없습니다. 매체별 비용·전환 데이터가 부족합니다.'}`;
    if (decliningStrong) action += `\n${decliningStrong.media}의 자체 ${cfg.lineLabel}는 ${formatEfficiency(efficiency(decliningStrong.previous))} → ${formatEfficiency(decliningStrong.value)}로 악화됐지만, 동일 구간 전체 ${formatEfficiency(benchmark)}와 비교하면 ${decliningStrong.value === benchmark ? '효율이 같습니다' : '효율이 높습니다'}. 효율 악화만으로 예산 축소를 권고할 대상은 아닙니다.`;
    if (strong) action += `\n재배분 검토의 비교 후보는 ${strong.media}입니다. 동일 구간 ${cfg.lineLabel} ${formatEfficiency(strong.value)}, 전환 ${number(strong.current[volumeKey])}건이며 전체 평균보다 효율이 높고 직전 구간 대비 악화가 확인되지 않았습니다. 이는 관측 성과 기준의 후보이며, 확대 시 효율 유지나 목표 충족을 보장하지 않습니다.`;
    else action += '\n동일 구간의 상대 효율과 추이를 함께 충족하는 재배분 비교 후보는 확인되지 않았습니다.';
  }

  return { daily, weekly, monthly: `${action}\n분석 기준은 ${last.period}와 직전 구간입니다. 목표 ${cfg.lineLabel}, 소재·타겟별 원인과 전환 집계 지연은 현재 데이터로 판단할 수 없습니다.` };
}
