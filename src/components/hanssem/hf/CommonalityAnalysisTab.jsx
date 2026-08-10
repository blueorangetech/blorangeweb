import React, { useState, useEffect, useMemo } from 'react';
import CreativeCard from './CreativeCard';
import CustomSelect from './common/CustomSelect';
import { runAiCommonality } from '../../../api/hanssemHfApi';

function CommonalityAnalysisTab({ fetchedData, renderDatePicker }) {
  const { mediaOptions, deviceOptions } = useMemo(() => {
    const mediaSet = new Set();
    const deviceSet = new Set();

    fetchedData.forEach(item => {
      if (item.media) mediaSet.add(item.media);
      if (item.device && String(item.device).trim()) {
        deviceSet.add(String(item.device).trim());
      }
    });

    const sortedMedia = Array.from(mediaSet).sort();
    const allDevices = Array.from(deviceSet).sort();

    return {
      mediaOptions: [ { value: 'all', label: '전체 매체' }, ...sortedMedia.map(m => ({ value: m, label: m })) ],
      deviceOptions: [ { value: 'all', label: '전체 디바이스' }, ...allDevices.map(d => ({ value: d, label: d })) ]
    };
  }, [fetchedData]);

  const [commonalityFilters, setCommonalityFilters] = useState({
    media: 'all',
    device: 'all',
    minImpressions: '',
    minClicks: '',
    minCost: '',
    sortBy: 'roas'
  });
  const [selectedAssetNames, setSelectedAssetNames] = useState(new Set());
  const [commonalityAnalysisResult, setCommonalityAnalysisResult] = useState(null);
  const [isCommonalityLoading, setIsCommonalityLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const getMaterialName = (item) => item.creative_name || item.creative_type || item.title || '알 수 없음';

  const aggregatedDataMap = useMemo(() => {
    const map = new Map();
    fetchedData.forEach(item => {
      const name = getMaterialName(item);
      if (!map.has(name)) {
        map.set(name, {
          name,
          media: item.media,
          creative_type: item.creative_type,
          business_unit: item.business_unit,
          title: item.title || name,
          cost: Number(item.cost || item.total_cost || 0),
          impressions: Number(item.impressions || 0),
          clicks: Number(item.clicks || 0),
          users: Number(item.total_users || item.users || 0),
          orders: Number(item.total_orders || item.orders || 0),
          revenue: Number(item.total_revenue || item.revenue || 0),
          device: item.device,
        });
      } else {
        const existing = map.get(name);
        existing.cost += Number(item.cost || item.total_cost || 0);
        existing.impressions += Number(item.impressions || 0);
        existing.clicks += Number(item.clicks || 0);
        existing.users += Number(item.total_users || item.users || 0);
        existing.orders += Number(item.total_orders || item.orders || 0);
        existing.revenue += Number(item.total_revenue || item.revenue || 0);
      }
    });

    map.forEach(row => {
      row.ctr = row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0;
      row.cpc = row.clicks > 0 ? row.cost / row.clicks : 0;
      row.inflow = row.clicks > 0 ? (row.users / row.clicks) * 100 : 0;
      row.cvr = row.users > 0 ? (row.orders / row.users) * 100 : 0;
      row.roas = row.cost > 0 ? (row.revenue / row.cost) * 100 : 0;
      row.atv = row.orders > 0 ? row.revenue / row.orders : 0;
    });

    return map;
  }, [fetchedData]);

  const topPerformers = useMemo(() => {
    const filtered = Array.from(aggregatedDataMap.values()).filter(item => {
      const matchMedia = commonalityFilters.media === 'all' || item.media === commonalityFilters.media;
      const itemDevice = item.device ? String(item.device).trim().toLowerCase() : '';
      const targetDevice = String(commonalityFilters.device).trim().toLowerCase();
      const matchDevice = commonalityFilters.device === 'all' || itemDevice === targetDevice;
      const matchImpressions = item.impressions >= Number(commonalityFilters.minImpressions || 0);
      const matchClicks = item.clicks >= Number(commonalityFilters.minClicks || 0);
      const matchCost = item.cost >= Number(commonalityFilters.minCost || 0);
      return matchMedia && matchDevice && matchImpressions && matchClicks && matchCost;
    });

    const sorted = [...filtered].sort((a, b) => {
      const metric = commonalityFilters.sortBy;
      if (metric === 'ctr') return b.ctr - a.ctr;
      if (metric === 'cvr') return b.cvr - a.cvr;
      if (metric === 'roas') return b.roas - a.roas;
      if (metric === 'orders') return b.orders - a.orders;
      if (metric === 'cost') return b.cost - a.cost;
      return b.roas - a.roas;
    });

    return sorted.slice(0, 5);
  }, [aggregatedDataMap, commonalityFilters]);

  useEffect(() => {
    setSelectedAssetNames(new Set());
  }, [topPerformers]);

  const formatCardData = (data) => {
    if (!data) return null;
    return {
      media: data.media || 'Meta',
      creative_type: data.creative_type || data.name,
      business_unit: data.business_unit,
      title: data.title,
      total_cost: data.cost,
      inflow_cvr: data.inflow,
      total_orders: data.orders,
      purchase_cvr: data.cvr,
      roas: data.roas,
      impressions: data.impressions,
      clicks: data.clicks,
      ctr: data.ctr,
      cpc: data.cpc,
      total_revenue: data.revenue
    };
  };

  const toggleDropdown = (id) => {
    if (openDropdown === id) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(id);
      setSearchQuery('');
    }
  };

  const handleRunCommonalityAnalysis = async () => {
    const selectedAssets = topPerformers.filter(item => selectedAssetNames.has(item.name));
    if (selectedAssets.length === 0) {
      showToast('공통점을 분석할 에셋을 최소 1개 이상 선택해 주세요.', 'error');
      return;
    }
    
    setIsCommonalityLoading(true);
    const STORAGE_BASE_URL = 'https://storage.googleapis.com/hanssem_hf';
    
    const buildImgUrl = (item) => {
      if (!item || !item.creative_type) return '';
      const buPath = item.business_unit ? `${item.business_unit.trim()}/` : '';
      let typeName = item.creative_type.trim();
      if (!/\.(png|jpg|jpeg|webp)$/i.test(typeName)) {
        typeName = `${typeName}.png`;
      }
      return `${STORAGE_BASE_URL}/${buPath}${item.media}/${typeName}`;
    };

    const payloadAssets = selectedAssets.map(item => {
      return {
        name: item.name,
        media: item.media || 'Meta',
        creative_type: item.creative_type || '',
        business_unit: item.business_unit || '',
        title: item.title || item.name,
        image_url: buildImgUrl(item),
        cost: Number(item.cost || 0),
        impressions: Number(item.impressions || 0),
        clicks: Number(item.clicks || 0),
        users: Number(item.users || 0),
        orders: Number(item.orders || 0),
        revenue: Number(item.revenue || 0),
        ctr: Number(item.ctr || 0),
        cpc: Number(item.cpc || 0),
        inflow: Number(item.inflow || 0),
        cvr: Number(item.cvr || 0),
        roas: Number(item.roas || 0),
        atv: Number(item.atv || 0)
      };
    });

    try {
      const result = await runAiCommonality(payloadAssets);
      if (result.status === 'success' && result.data) {
        setCommonalityAnalysisResult(result.data);
      } else {
        showToast('AI 공통점 분석 도중 에러가 발생했습니다: ' + (result.message || '알 수 없는 오류'), 'error');
      }
    } catch (err) {
      console.error('Fetch AI commonality analysis error:', err);
      showToast('네트워크 오류가 발생했습니다: ' + err.message, 'error');
    } finally {
      setIsCommonalityLoading(false);
    }
  };

  const commonalityMetricOptions = [
    { value: 'roas', label: 'ROAS 높은 순' },
    { value: 'ctr', label: 'CTR 높은 순' },
    { value: 'cvr', label: 'CVR 높은 순' },
    { value: 'orders', label: '주문 많은 순' },
    { value: 'cost', label: '광고비 높은 순' }
  ];

  const renderCommonalityAnalysis = () => {
    if (topPerformers.length === 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', textAlign: 'center', minHeight: '200px' }}>
          조건에 부합하는 우수 소재가 없습니다.<br/>필터 조건을 조정해 주세요.
        </div>
      );
    }

    if (isCommonalityLoading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#2563eb', textAlign: 'center', minHeight: '220px', gap: '14px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>🤖 AI가 선택한 이미지와 성과 데이터를 통합 분석 중입니다...</span>
        </div>
      );
    }

    if (!commonalityAnalysisResult) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', textAlign: 'center', minHeight: '200px', gap: '16px' }}>
          <p style={{ margin: 0, lineHeight: '1.6' }}>
            좌측 그리드에서 분석하고 싶은 에셋을 선택한 후,<br />
            우측 상단의 <strong>[분석 실행]</strong> 버튼을 누르면 AI가 공통 특징과 핵심 성과 요인을 도출합니다.
          </p>
          <button
            onClick={handleRunCommonalityAnalysis}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            ✨ AI 공통점 분석 실행
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>
        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🎨</span> 시각적 구성 및 디자인 공통점
          </h4>
          <p style={{ margin: '0', fontSize: '0.9rem', color: '#334155', lineHeight: '1.6' }}>
            {commonalityAnalysisResult.visual_commonalities}
          </p>
        </div>

        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>✍️</span> 카피라이팅 및 USP 메시지 공통점
          </h4>
          <p style={{ margin: '0', fontSize: '0.9rem', color: '#334155', lineHeight: '1.6' }}>
            {commonalityAnalysisResult.message_commonalities}
          </p>
        </div>

        <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💡</span> 핵심 성과 요인 분석
          </h4>
          <p style={{ margin: '0', fontSize: '0.9rem', color: '#14532d', lineHeight: '1.6' }}>
            {commonalityAnalysisResult.performance_factor}
          </p>
        </div>

        <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#1d4ed8', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🚀</span> 신규 소재 최적화 제작 제안
          </h4>
          <p style={{ margin: '0', fontSize: '0.9rem', color: '#1e3a8a', lineHeight: '1.6' }}>
            {commonalityAnalysisResult.recommendations}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <nav className="tab-navigation" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="tab-datepicker-wrapper">
            {renderDatePicker()}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', width: '100%', background: '#ffffff', padding: '15px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'relative', zIndex: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>매체</label>
            <CustomSelect 
              id="comm-media" 
              value={commonalityFilters.media} 
              setValue={(val) => setCommonalityFilters(prev => ({ ...prev, media: val }))} 
              options={mediaOptions} 
              placeholder="전체" 
              style={{ width: '100%' }} 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              toggleDropdown={toggleDropdown}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>디바이스</label>
            <CustomSelect 
              id="comm-device" 
              value={commonalityFilters.device} 
              setValue={(val) => setCommonalityFilters(prev => ({ ...prev, device: val }))} 
              options={deviceOptions} 
              placeholder="전체" 
              style={{ width: '100%' }} 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              toggleDropdown={toggleDropdown}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>최소 노출수</label>
            <input
              type="number"
              value={commonalityFilters.minImpressions}
              onChange={(e) => setCommonalityFilters(prev => ({ ...prev, minImpressions: e.target.value }))}
              placeholder="0"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>최소 클릭수</label>
            <input
              type="number"
              value={commonalityFilters.minClicks}
              onChange={(e) => setCommonalityFilters(prev => ({ ...prev, minClicks: e.target.value }))}
              placeholder="0"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>최소 광고비</label>
            <input
              type="number"
              value={commonalityFilters.minCost}
              onChange={(e) => setCommonalityFilters(prev => ({ ...prev, minCost: e.target.value }))}
              placeholder="0"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>우수 기준</label>
            <CustomSelect 
              id="comm-sort" 
              value={commonalityFilters.sortBy} 
              setValue={(val) => setCommonalityFilters(prev => ({ ...prev, sortBy: val }))} 
              options={commonalityMetricOptions} 
              placeholder="정렬 기준" 
              style={{ width: '100%' }} 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              toggleDropdown={toggleDropdown}
            />
          </div>
        </div>
      </nav>

      <main className="hanssem-main" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Top 5 Performers (Horizontal row) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
              📈 조건 만족 상위 소재 ({topPerformers.length}개 / 최대 5개)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setSelectedAssetNames(new Set(topPerformers.map(item => item.name)))}
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
              >
                전체 선택
              </button>
              <button 
                onClick={() => setSelectedAssetNames(new Set())}
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
              >
                전체 해제
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', width: '100%', justifyContent: 'flex-start', alignItems: 'stretch' }}>
            {topPerformers.length > 0 ? topPerformers.map(item => {
              const cardData = formatCardData(item);
              const isSelected = selectedAssetNames.has(item.name);
              return (
                <div key={item.name} style={{ position: 'relative', flex: '1 1 0px', minWidth: '180px' }}>
                  {/* Checkbox overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 20,
                    background: isSelected ? '#2563eb' : 'rgba(255, 255, 255, 0.9)',
                    color: isSelected ? '#ffffff' : '#334155',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: isSelected ? '1px solid #2563eb' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = new Set(selectedAssetNames);
                    if (next.has(item.name)) next.delete(item.name);
                    else next.add(item.name);
                    setSelectedAssetNames(next);
                  }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Click handled by parent div
                      style={{ cursor: 'pointer', accentColor: '#2563eb', margin: 0 }}
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{isSelected ? '선택됨' : '선택'}</span>
                  </div>

                  {/* Card wrapper to highlight selection */}
                  <div style={{
                    border: isSelected ? '2px solid #2563eb' : '2px solid transparent',
                    borderRadius: '16px',
                    boxShadow: isSelected ? '0 0 12px rgba(37, 99, 235, 0.2)' : 'none',
                    transition: 'all 0.15s ease',
                    height: '100%'
                  }}>
                    <CreativeCard data={cardData} />
                  </div>
                </div>
              );
            }) : (
              <div style={{ padding: '60px', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '16px', width: '100%', textAlign: 'center', backgroundColor: '#ffffff' }}>
                조건을 만족하는 성과 소재가 존재하지 않습니다. 필터 기준을 조절해 주세요.
              </div>
            )}
          </div>
        </div>

        {/* AI Commonality Analysis (Below Images, Full Width) */}
        <div style={{ width: '100%', backgroundColor: '#fdfdff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#2d3748' }}>
              <span style={{ fontSize: '1.3rem' }}>🤖</span> AI 우수 에셋 공통점 분석 리포트
            </h3>
            <button
              onClick={handleRunCommonalityAnalysis}
              disabled={isCommonalityLoading || topPerformers.length === 0 || selectedAssetNames.size === 0}
              style={{
                background: (isCommonalityLoading || topPerformers.length === 0 || selectedAssetNames.size === 0) ? '#cbd5e1' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: (isCommonalityLoading || topPerformers.length === 0 || selectedAssetNames.size === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: (isCommonalityLoading || topPerformers.length === 0 || selectedAssetNames.size === 0) ? 'none' : '0 2px 8px rgba(37, 99, 235, 0.3)'
              }}
            >
              {isCommonalityLoading ? '분석 중...' : '분석 실행'}
            </button>
          </div>
          <div style={{ fontSize: '0.95rem' }}>
            {renderCommonalityAnalysis()}
          </div>
        </div>
      </main>

      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 'bold',
          fontSize: '0.95rem'
        }}>
          <span>{toast.type === 'error' ? '⚠️' : '✓'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </>
  );
}

export default CommonalityAnalysisTab;
