import React, { useState, useEffect, useMemo } from 'react';
import '../../../../styles/HanssemMediaMix.css';
import * as hanssemApi from '../../../../api/hanssemApi';
import * as hanssemHfApi from '../../../../api/hanssemHfApi';

// 하위 컴포넌트 임포트
import PlanningSpreadsheet from './PlanningSpreadsheet';
import ComparisonDashboard from './ComparisonDashboard';
import AIReportSection from './AIReportSection';

// 데이터 포맷 유틸리티
const formatInt = (val) => Math.round(val || 0).toLocaleString('ko-KR');
const formatPercent = (val) => (val || 0).toFixed(2) + '%';
const formatWon = (val) => Math.round(val || 0).toLocaleString('ko-KR') + '원';
const formatPeople = (val) => Math.round(val || 0).toLocaleString('ko-KR') + '명';

const formatCell = (val, format) => {
  if (format === 'won') return formatWon(val);
  if (format === 'percent') return formatPercent(val);
  if (format === 'people') return formatPeople(val);
  return formatInt(val);
};

// 역산 공식 트리거 및 데이터 채우기 함수
const calculateRowValues = (row, datasetId) => {
  const isHf = datasetId === 'hanssem_hf';
  const budget = Number(row.budget || 0);
  const ctr = Number(row.ctr || 0);
  const cpc = Number(row.cpc || 0);

  let clicks = 0;
  let impressions = 0;
  let cpm = 0;

  if (cpc > 0) {
    clicks = budget / cpc;
  }
  if (ctr > 0 && clicks > 0) {
    impressions = (clicks / ctr) * 100;
  }
  if (impressions > 0) {
    cpm = (budget / impressions) * 1000;
  }

  if (isHf) {
    const roas = Number(row.roas || 0);
    const purchase_cvr = Number(row.purchase_cvr || 0);

    const revenue = budget * (roas / 100);
    const orders = clicks * (purchase_cvr / 100);
    const users = clicks; // 디폴트 1:1 매핑

    return {
      ...row,
      clicks,
      impressions,
      cpm,
      revenue,
      orders,
      users
    };
  } else {
    const consultation_cpa = Number(row.consultation_cpa || 0);
    const cpa = Number(row.cpa || 0);

    let consultation = 0;
    let distribution = 0;
    let cvr = 0;

    if (consultation_cpa > 0) {
      consultation = budget / consultation_cpa;
    }
    if (cpa > 0) {
      distribution = budget / cpa;
    }
    if (consultation > 0) {
      cvr = (distribution / consultation) * 100;
    }

    return {
      ...row,
      clicks,
      impressions,
      cpm,
      consultation,
      distribution,
      cvr
    };
  }
};

function CommonMediaMixCompareView({ datasetId }) {
  const isHf = datasetId === 'hanssem_hf';

  // 1. 계획 수립 행 상태 관리 (기본 예시 로우 탑재)
  const [planningRows, setPlanningRows] = useState([]);

  // 기집행 데이터 비교 기준 년/월
  const [baselineYear, setBaselineYear] = useState('2026');
  const [baselineMonth, setBaselineMonth] = useState(isHf ? '05' : '01');

  // 비교 분석 기준 보기 토글 ('channel', 'media', 'media_target')
  const [compareMode, setCompareMode] = useState('channel');

  // 기집행 데이터 보관 상태
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 2. 과거 특정 년/월 데이터 로드
  useEffect(() => {
    const fetchHistoryData = async () => {
      setIsLoadingHistory(true);
      const yearStr = baselineYear;
      const monthStr = baselineMonth;
      const startStr = `${yearStr}-${monthStr}-01`;
      const lastDay = new Date(Number(yearStr), Number(monthStr), 0).getDate();
      const endStr = `${yearStr}-${monthStr}-${lastDay}`;

      const api = datasetId === 'hanssem_hf' ? hanssemHfApi : hanssemApi;
      try {
        const data = await api.fetchMaterialForCsv({ startDate: startStr, endDate: endStr });
        setHistoricalData(data);
      } catch (error) {
        console.error('History Fetch Error:', error);
        setHistoricalData([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistoryData();
  }, [baselineYear, baselineMonth, datasetId]);

  // 3. 신규 행 추가 / 삭제 및 수정 기능 핸들러
  const handleAddRow = () => {
    const newId = planningRows.length > 0 ? Math.max(...planningRows.map(r => r.id)) + 1 : 1;
    const newRow = isHf
      ? {
          id: newId,
          channel: '',
          media: '',
          target: '',
          device: '',
          budget: '',
          ctr: '',
          cpc: '',
          roas: '',
          purchase_cvr: ''
        }
      : {
          id: newId,
          channel: '',
          media: '',
          target: '',
          device: '',
          budget: '',
          ctr: '',
          cpc: '',
          consultation_cpa: '',
          cpa: ''
        };
    setPlanningRows([...planningRows, calculateRowValues(newRow, datasetId)]);
  };

  const handleDeleteRow = (id) => {
    setPlanningRows(planningRows.filter(r => r.id !== id));
  };

  const handleRowChange = (id, field, value) => {
    setPlanningRows(prev =>
      prev.map(row => {
        if (row.id !== id) return row;

        let nextRow = { ...row, [field]: value };

        // 숫자값 파싱 및 역산 트리거
        if (['budget', 'ctr', 'cpc', 'consultation_cpa', 'cpa', 'roas', 'purchase_cvr'].includes(field)) {
          nextRow[field] = value === '' ? '' : Number(value);
          return calculateRowValues(nextRow, datasetId);
        }

        return nextRow;
      })
    );
  };

  // 엑셀 복사/붙여넣기 기능 지원 (탭/개행 파싱)
  const handlePaste = (e) => {
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;
    const pastedText = clipboardData.getData('text');
    if (!pastedText) return;

    if (!pastedText.includes('\t') && !pastedText.includes('\n')) {
      return;
    }

    e.preventDefault();

    const lines = pastedText.split(/\r?\n/);
    const parsedGrid = lines
      .map(line => line.split('\t').map(cell => cell.trim()))
      .filter(row => row.length > 0 && row.some(cell => cell !== ''));

    if (parsedGrid.length === 0) return;

    const newRows = parsedGrid.map((rowCells, index) => {
      const channel = rowCells[0] || '';
      const media = rowCells[1] || '';
      const target = rowCells[2] || '';
      const device = rowCells[3] || '';

      const cleanNum = (str) => {
        if (!str) return 0;
        return Number(str.replace(/[^0-9.-]/g, '')) || 0;
      };

      const budget = cleanNum(rowCells[4]);
      const ctr = cleanNum(rowCells[5]);
      const cpc = cleanNum(rowCells[6]);

      let rowData = {
        id: Date.now() + index,
        channel,
        media,
        target,
        device,
        budget,
        ctr,
        cpc
      };

      if (isHf) {
        rowData.roas = cleanNum(rowCells[7]);
        rowData.purchase_cvr = cleanNum(rowCells[8]);
      } else {
        rowData.consultation_cpa = cleanNum(rowCells[7]);
        rowData.cpa = cleanNum(rowCells[8]);
      }

      return calculateRowValues(rowData, datasetId);
    });

    setPlanningRows(newRows);
  };

  // 4. 신규 및 기집행 비중 비교 계산 그룹핑
  const comparisonResult = useMemo(() => {
    const newTotalBudget = planningRows.reduce((sum, r) => sum + Number(r.budget || 0), 0);

    const newGroups = {};
    planningRows.forEach(row => {
      let key = String(row.channel || '기타');
      if (compareMode === 'media') key = String(row.media || '기타');
      if (compareMode === 'media_target') key = `${row.channel} x ${row.target}`;

      if (!newGroups[key]) {
        newGroups[key] = { key, budget: 0, cost: 0, clicks: 0, impressions: 0, convs: 0, revenue: 0 };
      }
      newGroups[key].budget += Number(row.budget || 0);
      newGroups[key].clicks += Number(row.clicks || 0);
      newGroups[key].impressions += Number(row.impressions || 0);
      
      if (isHf) {
        newGroups[key].convs += Number(row.orders || 0);
        newGroups[key].revenue += Number(row.revenue || 0);
      } else {
        newGroups[key].convs += Number(row.distribution || 0);
      }
    });

    const histTotalBudget = historicalData.reduce((sum, r) => sum + Number(r.cost || r.total_cost || 0), 0);
    const histGroups = {};

    historicalData.forEach(row => {
      const channelVal = String(row.media || row.media_name || '기타');
      const mediaVal = isHf ? String(row.ad_type || '기타') : String(row.media_detail || '기타');
      const targetVal = isHf ? String(row.targeting || '기타') : String(row.utm_content_8 || '기타');

      let key = channelVal;
      if (compareMode === 'media') key = mediaVal;
      if (compareMode === 'media_target') key = `${channelVal} x ${targetVal}`;

      if (!histGroups[key]) {
        histGroups[key] = { key, cost: 0, clicks: 0, impressions: 0, convs: 0, revenue: 0 };
      }
      histGroups[key].cost += Number(row.cost || row.total_cost || 0);
      histGroups[key].clicks += Number(row.clicks || 0);
      histGroups[key].impressions += Number(row.impressions || 0);
      
      if (isHf) {
        histGroups[key].convs += Number(row.total_orders || 0);
        histGroups[key].revenue += Number(row.total_revenue || 0);
      } else {
        histGroups[key].convs += Number(row.distribution || 0);
      }
    });

    const allKeys = Array.from(new Set([...Object.keys(newGroups), ...Object.keys(histGroups)]));

    const dataList = allKeys.map(key => {
      const nGroup = newGroups[key] || { budget: 0, clicks: 0, impressions: 0, convs: 0, revenue: 0 };
      const hGroup = histGroups[key] || { cost: 0, clicks: 0, impressions: 0, convs: 0, revenue: 0 };

      const newBudget = nGroup.budget;
      const newShare = newTotalBudget > 0 ? (newBudget / newTotalBudget) * 100 : 0;

      const histBudget = hGroup.cost;
      const histShare = histTotalBudget > 0 ? (histBudget / histTotalBudget) * 100 : 0;

      const shareDiff = newShare - histShare;

      let newEfficiency = 0;
      let histEfficiency = 0;

      if (isHf) {
        newEfficiency = newBudget > 0 ? (nGroup.revenue / newBudget) * 100 : 0;
        histEfficiency = histBudget > 0 ? (hGroup.revenue / histBudget) * 100 : 0;
      } else {
        newEfficiency = nGroup.convs > 0 ? newBudget / nGroup.convs : 0;
        histEfficiency = hGroup.convs > 0 ? histBudget / hGroup.convs : 0;
      }

      let effChange = 0;
      if (histEfficiency > 0) {
        effChange = ((newEfficiency - histEfficiency) / histEfficiency) * 100;
      }

      return {
        key,
        newBudget,
        newShare,
        histBudget,
        histShare,
        shareDiff,
        newEfficiency,
        histEfficiency,
        effChange
      };
    }).filter(item => item.newBudget > 0 || item.histBudget > 0);

    dataList.sort((a, b) => b.newBudget - a.newBudget);

    return {
      list: dataList,
      newTotalBudget,
      histTotalBudget
    };
  }, [planningRows, historicalData, compareMode, isHf]);

  // 5. AI 리포트 자동 생성 엔진
  const aiComments = useMemo(() => {
    if (comparisonResult.list.length === 0) return ['비교 분석할 미디어믹스 데이터가 충분하지 않습니다.'];

    const comments = [];
    const bigChanges = comparisonResult.list.filter(item => Math.abs(item.shareDiff) >= 15);
    const efficiencyDeteriorations = comparisonResult.list.filter(item => {
      if (isHf) {
        return item.effChange <= -20;
      } else {
        return item.effChange >= 20;
      }
    });

    const budgetPct = comparisonResult.histTotalBudget > 0
      ? ((comparisonResult.newTotalBudget - comparisonResult.histTotalBudget) / comparisonResult.histTotalBudget) * 100
      : 0;

    comments.push(
      `이번 신규 미디어믹스 총 예산안은 ${formatWon(comparisonResult.newTotalBudget)}으로, 기집행 대비 ${budgetPct.toFixed(1)}% ${budgetPct >= 0 ? '증가' : '감소'}한 규모입니다.`
    );

    if (bigChanges.length > 0) {
      bigChanges.forEach(item => {
        comments.push(
          `${item.key}의 예산 비중이 기집행 대비 ${item.shareDiff.toFixed(1)}%p 변동되었습니다. 특정 매체/지면의 급격한 비중 편중은 단가 상승 요인이 될 수 있으므로 주기적인 단가 체크가 요망됩니다.`
        );
      });
    }

    if (efficiencyDeteriorations.length > 0) {
      efficiencyDeteriorations.forEach(item => {
        const desc = isHf 
          ? `ROAS가 이전 ${formatPercent(item.histEfficiency)}에서 ${formatPercent(item.newEfficiency)}로 하락(${item.effChange.toFixed(1)}%)할 우려가 있습니다.`
          : `배분 CPA 단가가 이전 ${formatWon(item.histEfficiency)}에서 ${formatWon(item.newEfficiency)}로 상승(${item.effChange.toFixed(1)}% 악화)할 우려가 있습니다.`;
        
        comments.push(
          `${item.key} 채널의 가상 시뮬레이션 결과, ${desc} 입찰가 최적화 및 타겟 확장 계획을 동시 수립하십시오.`
        );
      });
    }

    if (comments.length <= 1) {
      comments.push(
        '기집행 데이터 대비 예산 분배 비율 및 효율 메트릭의 변동폭이 안정 범위(±15%) 내에서 조율되어 있어 균형 잡힌 믹스안으로 사료됩니다.'
      );
    } else {
      comments.push(
        '[믹스 검증 종합 제언] 예산 변동폭이 30%를 초과하는 지면에 대해 기집행 대비 전환 효율(CVR)의 타당성 조사를 병행하여 예산을 미세 조정할 것을 제안합니다.'
      );
    }

    return comments;
  }, [comparisonResult, isHf]);

  return (
    <div className="mediamix-container">
      <PlanningSpreadsheet
        planningRows={planningRows}
        isHf={isHf}
        onReset={() => setPlanningRows([])}
        onAddRow={handleAddRow}
        onPaste={handlePaste}
        onRowChange={handleRowChange}
        onDeleteRow={handleDeleteRow}
        formatInt={formatInt}
        formatWon={formatWon}
        formatPercent={formatPercent}
      />

      <ComparisonDashboard
        baselineYear={baselineYear}
        setBaselineYear={setBaselineYear}
        baselineMonth={baselineMonth}
        setBaselineMonth={setBaselineMonth}
        compareMode={compareMode}
        setCompareMode={setCompareMode}
        isLoadingHistory={isLoadingHistory}
        comparisonResult={comparisonResult}
        isHf={isHf}
        formatWon={formatWon}
        formatPercent={formatPercent}
      />

      <AIReportSection aiComments={aiComments} />
    </div>
  );
}

export default CommonMediaMixCompareView;
