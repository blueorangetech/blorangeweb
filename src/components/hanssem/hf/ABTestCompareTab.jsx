import React, { useState, useEffect, useMemo } from 'react';
import CreativeCard from './CreativeCard';
import CustomSelect from './common/CustomSelect';
import { runAiCompare } from '../../../api/hanssemHfApi';


function ABTestCompareTab({ fetchedData, renderDatePicker }) {
  const [media, setMedia] = useState('all');
  const [device, setDevice] = useState('all');
  const [materialA, setMaterialA] = useState('');
  const [materialB, setMaterialB] = useState('');

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

  const [openDropdown, setOpenDropdown] = useState(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [resolvedImgA, setResolvedImgA] = useState('');
  const [resolvedImgB, setResolvedImgB] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const commonFilteredData = useMemo(() => {
    return fetchedData.filter(item => {
      const mMedia = media === 'all' || item.media === media;
      const itemDevice = item.device ? String(item.device).trim().toLowerCase() : '';
      const targetDevice = String(device).trim().toLowerCase();
      const mDevice = device === 'all' || itemDevice === targetDevice;
      return mMedia && mDevice;
    });
  }, [fetchedData, media, device]);

  const getMaterialName = (item) => item.creative_name || item.creative_type || item.title || '알 수 없음';

  const aggregatedDataMap = useMemo(() => {
    const map = new Map();
    commonFilteredData.forEach(item => {
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
  }, [commonFilteredData]);

  const materialOptions = useMemo(() => {
    return Array.from(aggregatedDataMap.keys()).map(name => ({ value: name, label: name }));
  }, [aggregatedDataMap]);

  useEffect(() => {
    if (materialA && !aggregatedDataMap.has(materialA)) setMaterialA('');
    if (materialB && !aggregatedDataMap.has(materialB)) setMaterialB('');
  }, [aggregatedDataMap, materialA, materialB]);

  const dataA = aggregatedDataMap.get(materialA);
  const dataB = aggregatedDataMap.get(materialB);

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

  const cardDataA = formatCardData(dataA);
  const cardDataB = formatCardData(dataB);

  const toggleDropdown = (id) => {
    if (openDropdown === id) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(id);
      setSearchQuery('');
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!dataA || !dataB) return;
    setIsAiLoading(true);
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

    const imgUrlA = resolvedImgA || buildImgUrl(dataA);
    const imgUrlB = resolvedImgB || buildImgUrl(dataB);

    const payloadA = { ...dataA, image_url: imgUrlA };
    const payloadB = { ...dataB, image_url: imgUrlB };

    try {
      const result = await runAiCompare(payloadA, payloadB);
      if (result.status === 'success' && result.data) {
        setAiAnalysisResult(result.data);
      }
    } catch (err) {
      console.error('Fetch AI compare analysis error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const renderAIAnalysis = (dataA, dataB) => {
    if (!dataA || !dataB) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', textAlign: 'center', minHeight: '200px' }}>
          비교 분석을 위해<br/>두 소재를 선택 후 상단 [분석 실행] 버튼을 눌러주세요.
        </div>
      );
    }

    if (isAiLoading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#667eea', textAlign: 'center', minHeight: '220px', gap: '14px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>🤖 AI가 소재 이미지와 성과 데이터를 정밀 분석 중입니다...</span>
        </div>
      );
    }

    if (!aiAnalysisResult) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', textAlign: 'center', minHeight: '200px', gap: '16px' }}>
          <p style={{ margin: 0, lineHeight: '1.6' }}>소재 선택이 완료되었습니다.<br />우측 상단의 <strong>[분석 실행]</strong> 버튼을 누르면 AI 분석이 시작됩니다.</p>
          <button
            onClick={handleRunAiAnalysis}
            style={{
              background: '#667eea',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            ✨ AI 성과 분석 실행
          </button>
        </div>
      );
    }

    const summary = aiAnalysisResult.summary || {
      ctr_winner: dataA.ctr >= dataB.ctr ? 'A' : 'B',
      cvr_winner: dataA.cvr >= dataB.cvr ? 'A' : 'B',
      roas_winner: dataA.roas >= dataB.roas ? 'A' : 'B',
    };

    const designText = aiAnalysisResult.design || '디자인 분석 결과가 없습니다.';
    const messageText = aiAnalysisResult.message || '메시지 분석 결과가 없습니다.';
    const performanceText = aiAnalysisResult.performance || '최적화 제안 결과가 없습니다.';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>
        <div style={{ padding: '16px', background: '#fff', borderRadius: '12px', borderLeft: '4px solid #667eea', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <strong style={{ display: 'block', marginBottom: '10px', color: '#4a5568', fontSize: '1.05rem' }}>🏆 승리 지표 요약</strong>
          <ul style={{ margin: '0', paddingLeft: '20px', color: '#555', lineHeight: '1.8', fontSize: '0.95rem' }}>
            <li><strong>클릭 유도 (CTR):</strong> Creative {summary.ctr_winner || 'A'} 우세</li>
            <li><strong>구매 전환 (CVR):</strong> Creative {summary.cvr_winner || 'A'} 우세</li>
            <li><strong>예산 효율 (ROAS):</strong> Creative {summary.roas_winner || 'A'} 우세</li>
          </ul>
        </div>

        {(aiAnalysisResult.image_a_description || aiAnalysisResult.image_b_description) && (
          <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#166534', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🔍</span> AI 이미지 인식 검증 (Test Verification)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: '#14532d', lineHeight: '1.5' }}>
              {aiAnalysisResult.image_a_description && (
                <div><strong>[Creative A 이미지 인식]:</strong> {aiAnalysisResult.image_a_description}</div>
              )}
              {aiAnalysisResult.image_b_description && (
                <div><strong>[Creative B 이미지 인식]:</strong> {aiAnalysisResult.image_b_description}</div>
              )}
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🎨</span> 디자인 및 레이아웃 분석
            </h4>
            <p style={{ margin: '0', fontSize: '0.95rem', color: '#334155', lineHeight: '1.6' }}>{designText}</p>
          </div>

          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✍️</span> 메시지 및 카피라이팅
            </h4>
            <p style={{ margin: '0', fontSize: '0.95rem', color: '#334155', lineHeight: '1.6' }}>{messageText}</p>
          </div>

          <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1d4ed8', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>💡</span> AI 핵심 인사이트 및 최적화 제안
            </h4>
            <p style={{ margin: '0', fontSize: '0.95rem', color: '#1e3a8a', lineHeight: '1.6' }}>{performanceText}</p>
          </div>
        </div>
      </div>
    );
  };

  const getDiffRow = () => {
    if (!dataA || !dataB) return null;

    const getDiffStr = (a, b, isPercent = false) => {
      const diff = a - b;
      const sign = diff > 0 ? '▲' : diff < 0 ? '▼' : '-';
      const color = diff > 0 ? '#ff4d4f' : diff < 0 ? '#1890ff' : '#555';
      const absDiff = Math.abs(diff);
      const text = isPercent ? `${sign}${absDiff.toFixed(2)}%` : `${sign}${Math.round(absDiff).toLocaleString()}`;
      return <td style={{ color }}>{text}</td>;
    };

    return (
      <tr style={{ background: '#f8f9fa' }}>
        <td className="row-key" style={{ fontWeight: 'bold', color: '#555' }}>비교 (A - B)</td>
        {getDiffStr(dataA.impressions, dataB.impressions)}
        {getDiffStr(dataA.clicks, dataB.clicks)}
        {getDiffStr(dataA.ctr, dataB.ctr, true)}
        {getDiffStr(dataA.cpc, dataB.cpc)}
        {getDiffStr(dataA.cost, dataB.cost)}
        {getDiffStr(dataA.users, dataB.users)}
        {getDiffStr(dataA.inflow, dataB.inflow, true)}
        {getDiffStr(dataA.orders, dataB.orders)}
        {getDiffStr(dataA.revenue, dataB.revenue)}
        {getDiffStr(dataA.roas, dataB.roas, true)}
        {getDiffStr(dataA.cvr, dataB.cvr, true)}
        {getDiffStr(dataA.atv, dataB.atv)}
      </tr>
    );
  };

  return (
    <>
      <nav className="tab-navigation" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Top Row: DatePicker */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="tab-datepicker-wrapper">
            {renderDatePicker()}
          </div>
        </div>

        {/* Bottom Row: 4 Filters Grid (Media, Device, Creative A, Creative B) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '12px', 
          width: '100%', 
          background: '#ffffff', 
          padding: '15px 20px', 
          borderRadius: '16px', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)', 
          position: 'relative', 
          zIndex: 10 
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>매체</label>
            <CustomSelect 
              id="media" 
              value={media} 
              setValue={setMedia} 
              options={mediaOptions} 
              placeholder="전체 매체" 
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
              id="device" 
              value={device} 
              setValue={setDevice} 
              options={deviceOptions} 
              placeholder="전체 디바이스" 
              style={{ width: '100%' }} 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              toggleDropdown={toggleDropdown}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#5C9CE6', marginBottom: '6px' }}>Creative A 선택</label>
            <CustomSelect 
              id="materialA" 
              value={materialA} 
              setValue={setMaterialA} 
              options={materialOptions} 
              placeholder="Creative A 선택" 
              style={{ width: '100%' }} 
              searchable={true}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              toggleDropdown={toggleDropdown}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#F28F43', marginBottom: '6px' }}>Creative B 선택</label>
            <CustomSelect 
              id="materialB" 
              value={materialB} 
              setValue={setMaterialB} 
              options={materialOptions} 
              placeholder="Creative B 선택" 
              style={{ width: '100%' }} 
              searchable={true}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              toggleDropdown={toggleDropdown}
            />
          </div>
        </div>
      </nav>

      <main className="hanssem-main">
        <div className="chart-grid" style={{ display: 'flex', gap: '30px', justifyContent: 'center', marginBottom: '40px', marginTop: '20px', alignItems: 'stretch' }}>
          <div style={{ flex: 2, display: 'flex', gap: '30px', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ flex: 1, maxWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: '#5C9CE6', color: '#fff', padding: '10px 0', width: '100%', textAlign: 'center', borderRadius: '10px', fontWeight: 'bold', marginBottom: '15px', fontSize: '0.95rem', boxShadow: '0 2px 6px rgba(92, 156, 230, 0.2)' }}>Creative A</div>
              {cardDataA ? <CreativeCard data={cardDataA} onImageResolved={setResolvedImgA} /> : <div style={{ padding: '40px', color: '#999', border: '1px dashed #ddd', borderRadius: '12px', width: '100%', textAlign: 'center' }}>소재를 선택해주세요</div>}
            </div>
            <div style={{ flex: 1, maxWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: '#F28F43', color: '#fff', padding: '10px 0', width: '100%', textAlign: 'center', borderRadius: '10px', fontWeight: 'bold', marginBottom: '15px', fontSize: '0.95rem', boxShadow: '0 2px 6px rgba(242, 143, 67, 0.2)' }}>Creative B</div>
              {cardDataB ? <CreativeCard data={cardDataB} onImageResolved={setResolvedImgB} /> : <div style={{ padding: '40px', color: '#999', border: '1px dashed #ddd', borderRadius: '12px', width: '100%', textAlign: 'center' }}>소재를 선택해주세요</div>}
            </div>
          </div>
          
          <div style={{ flex: 1.2, minWidth: '300px', backgroundColor: '#fdfdff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#2d3748' }}>
                <span style={{ fontSize: '1.3rem' }}>✨</span> AI 소재 성과 분석
              </h3>
              <button
                onClick={handleRunAiAnalysis}
                disabled={!dataA || !dataB || isAiLoading}
                style={{
                  background: (!dataA || !dataB || isAiLoading) ? '#cbd5e1' : '#667eea',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: (!dataA || !dataB || isAiLoading) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: (!dataA || !dataB || isAiLoading) ? 'none' : '0 2px 8px rgba(102, 126, 234, 0.3)'
                }}
              >
                {isAiLoading ? '분석 중...' : '분석 실행'}
              </button>
            </div>
            <div style={{ flex: 1, fontSize: '0.95rem' }}>
              {renderAIAnalysis(dataA, dataB)}
            </div>
          </div>
        </div>

        <div className="summary-data-table-container">
          <table className="summary-data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>소재 구분</th>
                <th>노출</th>
                <th>클릭</th>
                <th>CTR</th>
                <th>CPC</th>
                <th>총 비용</th>
                <th>총 사용자</th>
                <th>유입 전환율</th>
                <th>주문 건수</th>
                <th>주문 금액</th>
                <th>ROAS</th>
                <th>CVR</th>
                <th>객단가</th>
              </tr>
            </thead>
            <tbody>
              {dataA && (
                <tr>
                  <td className="row-key" style={{ fontWeight: 'bold', color: '#5C9CE6' }}>Creative A ({dataA.name})</td>
                  <td>{dataA.impressions.toLocaleString()}</td>
                  <td>{dataA.clicks.toLocaleString()}</td>
                  <td>{dataA.ctr.toFixed(2)}%</td>
                  <td>{Math.round(dataA.cpc).toLocaleString()}</td>
                  <td>{Math.round(dataA.cost).toLocaleString()}</td>
                  <td>{dataA.users.toLocaleString()}</td>
                  <td>{dataA.inflow.toFixed(2)}%</td>
                  <td>{dataA.orders.toLocaleString()}</td>
                  <td>{Math.round(dataA.revenue).toLocaleString()}</td>
                  <td>{dataA.roas.toFixed(0)}%</td>
                  <td>{dataA.cvr.toFixed(2)}%</td>
                  <td>{Math.round(dataA.atv).toLocaleString()}</td>
                </tr>
              )}
              {dataB && (
                <tr>
                  <td className="row-key" style={{ fontWeight: 'bold', color: '#F28F43' }}>Creative B ({dataB.name})</td>
                  <td>{dataB.impressions.toLocaleString()}</td>
                  <td>{dataB.clicks.toLocaleString()}</td>
                  <td>{dataB.ctr.toFixed(2)}%</td>
                  <td>{Math.round(dataB.cpc).toLocaleString()}</td>
                  <td>{Math.round(dataB.cost).toLocaleString()}</td>
                  <td>{dataB.users.toLocaleString()}</td>
                  <td>{dataB.inflow.toFixed(2)}%</td>
                  <td>{dataB.orders.toLocaleString()}</td>
                  <td>{Math.round(dataB.revenue).toLocaleString()}</td>
                  <td>{dataB.roas.toFixed(0)}%</td>
                  <td>{dataB.cvr.toFixed(2)}%</td>
                  <td>{Math.round(dataB.atv).toLocaleString()}</td>
                </tr>
              )}
              {!dataA && !dataB && (
                <tr>
                  <td colSpan="13" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>비교할 소재를 선택해주세요.</td>
                </tr>
              )}
              {getDiffRow()}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

export default ABTestCompareTab;
