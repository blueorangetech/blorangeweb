import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';
import { CreativeCard } from '.'; 
import { getCanonicalMedia, mediaLogos } from '../../utils/mediaUtils';

function ABCompareView({ startDate, endDate, setStartDate, setEndDate }) {
    const [media, setMedia] = useState('all');
    const [device, setDevice] = useState('all');
    const [materialA, setMaterialA] = useState('');
    const [materialB, setMaterialB] = useState('');

    const [openDropdown, setOpenDropdown] = useState(null);
    const [fetchedData, setFetchedData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!startDate || !endDate) return;

        const fetchData = async () => {
            setIsLoading(true);
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const startStr = formatDate(startDate);
            const endStr = formatDate(endDate);

            try {
                const response = await fetch(
                    `${API_BASE_URL}/search/bigquery/date?dataset_id=hanssem_hf&table_id=performance_raw&report_type=compare_data&start_date=${startStr}&end_date=${endStr}`
                );
                if (response.ok) {
                    const result = await response.json();
                    setFetchedData(Array.isArray(result) ? result : (result.data || []));
                }
            } catch (error) {
                console.error('Fetch compare_data error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [startDate, endDate]);

    const commonFilteredData = useMemo(() => {
        return fetchedData.filter(item => {
            const mMedia = media === 'all' || getCanonicalMedia(item.media) === media;
            const mDevice = device === 'all' || item.device === device;
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

    const materialOptions = Array.from(aggregatedDataMap.keys()).map(name => ({ value: name, label: name }));

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

    const [searchQuery, setSearchQuery] = useState('');

    const toggleDropdown = (id) => {
        if (openDropdown === id) {
            setOpenDropdown(null);
        } else {
            setOpenDropdown(id);
            setSearchQuery('');
        }
    };

    const generateMockAIAnalysis = (dataA, dataB) => {
        if (!dataA || !dataB) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', textAlign: 'center', minHeight: '200px' }}>
                    비교 분석을 위해<br/>두 소재를 모두 선택해주세요.
                </div>
            );
        }

        const betterCtr = dataA.ctr >= dataB.ctr ? 'A' : 'B';
        const worseCtr = betterCtr === 'A' ? 'B' : 'A';
        
        const betterCvr = dataA.cvr >= dataB.cvr ? 'A' : 'B';
        const worseCvr = betterCvr === 'A' ? 'B' : 'A';
        
        const betterRoas = dataA.roas >= dataB.roas ? 'A' : 'B';

        // 분석 텍스트 생성 로직 (구체적이고 분석적인 리포트 형태)
        let design = "";
        let message = "";
        let performance = "";

        if (betterCtr === betterCvr && betterCvr === betterRoas) {
            design = `Target ${betterCtr}는 핵심 소구점(USP)을 시각적 중앙에 배치하고 불필요한 배경 요소를 덜어내어 '가시성(Visibility)'을 극대화했습니다. 반면 Target ${worseCtr}는 시각적 요소가 분산되어 있어 사용자가 스크롤을 멈추게 하는(Stop-scrolling) 매력이 상대적으로 부족했습니다.`;
            message = `Target ${betterCtr}의 카피는 고객의 페인포인트(Pain-point)를 정확히 짚어내는 직관적인 단어 선택과 명확한 콜투액션(CTA) 여백 배치를 통해 클릭에 대한 심리적 장벽을 크게 낮췄습니다.`;
            performance = `우수한 가독성과 명확한 시각적 계층 구조 덕분에, Target ${betterCtr}는 트래픽(CTR)을 효과적으로 모았을 뿐만 아니라 랜딩 후의 이탈률까지 최소화하여 최종 전환(CVR) 및 수익률(ROAS) 모두에서 Target ${worseCtr}와 큰 격차를 벌렸습니다.`;
        } else if (betterCtr !== betterCvr) {
            design = `Target ${betterCtr}는 시선을 사로잡는 강렬한 톤앤매너와 트렌디한 구도를 통해 호기심을 유발했습니다. 반면 Target ${betterCvr}는 다소 정제되고 차분한 라이프스타일 컷과 텍스트 레이아웃을 통해 브랜드의 '신뢰도'를 높이는 방향으로 설계되었습니다.`;
            message = `Target ${betterCtr}가 '단기적 혜택'이나 '자극적인 후킹(Hooking) 카피'로 즉각적인 반응을 이끌어냈다면, Target ${betterCvr}는 상품의 '기능적 가치와 상세 정보'를 설득력 있게 전달하여 고관여 고객의 지갑을 여는 데 성공했습니다.`;
            performance = `결론적으로 Target ${betterCtr}는 가벼운 탐색 목적의 유저 클릭(CTR)을 유도하는 데 탁월했으나 구매 의지가 약한 유저가 섞여 전환율은 낮았습니다. 반대로 Target ${betterCvr}는 클릭은 적었으나 텍스트를 읽고 들어온 진성 고객의 비율이 높아 최종 구매 전환율(CVR)과 수익(ROAS) 측면에서 훨씬 가치 있는 기여를 했습니다.`;
        } else {
            design = `Target A는 제품 중심의 클로즈업 샷(Close-up)을 활용해 디테일을 강조했고, Target B는 제품이 활용되는 전체적인 공간감(Wide-shot)을 보여주어 소비자에게 인테리어 영감을 제공한 것으로 분석됩니다.`;
            message = `두 소재 간 메시지의 방향성은 유사하나, 타이포그래피의 크기와 위치 등 미세한 레이아웃 차이가 서로 다른 유저층의 반응을 이끌어냈습니다.`;
            performance = `클릭 유도(CTR) 및 전환(CVR) 성과가 엇비슷한 상황이므로, 예산 효율성 판단의 최종 기준인 ROAS 지표에서 우위를 점한 Target ${betterRoas}를 메인 소재로 운영하면서 서브 소재로 교체 테스트를 진행하는 것을 권장합니다.`;
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>
                <div style={{ padding: '16px', background: '#fff', borderRadius: '12px', borderLeft: '4px solid #667eea', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <strong style={{ display: 'block', marginBottom: '10px', color: '#4a5568', fontSize: '1.05rem' }}>🏆 승리 지표 요약</strong>
                    <ul style={{ margin: '0', paddingLeft: '20px', color: '#555', lineHeight: '1.8', fontSize: '0.95rem' }}>
                        <li><strong>클릭 유도 (CTR):</strong> Target {betterCtr} 우세</li>
                        <li><strong>구매 전환 (CVR):</strong> Target {betterCvr} 우세</li>
                        <li><strong>예산 효율 (ROAS):</strong> Target {betterRoas} 우세</li>
                    </ul>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>🎨</span> 디자인 및 레이아웃 분석
                        </h4>
                        <p style={{ margin: '0', fontSize: '0.95rem', color: '#334155', lineHeight: '1.6' }}>{design}</p>
                    </div>

                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>✍️</span> 메시지 및 카피라이팅
                        </h4>
                        <p style={{ margin: '0', fontSize: '0.95rem', color: '#334155', lineHeight: '1.6' }}>{message}</p>
                    </div>

                    <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1d4ed8', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>💡</span> AI 핵심 인사이트 및 최적화 제안
                        </h4>
                        <p style={{ margin: '0', fontSize: '0.95rem', color: '#1e3a8a', lineHeight: '1.6' }}>{performance}</p>
                    </div>
                </div>
            </div>
        );
    };

    const filterOptions = useMemo(() => {
        const mediaSet = new Set();
        const deviceSet = new Set();

        fetchedData.forEach(item => {
            if (item.media) mediaSet.add(getCanonicalMedia(item.media));
            if (item.device) deviceSet.add(item.device);
        });

        const sortedMedia = Object.keys(mediaLogos);
        Array.from(mediaSet).forEach(m => {
            if (!sortedMedia.includes(m)) {
                sortedMedia.push(m);
            }
        });

        const sortedDevice = Array.from(deviceSet).sort();

        return {
            media: [ { value: 'all', label: '매체' }, ...sortedMedia.map(m => ({ value: m, label: m })) ],
            device: [ { value: 'all', label: '디바이스' }, ...sortedDevice.map(d => ({ value: d, label: d })) ]
        };
    }, [fetchedData]);

    const mediaOptions = filterOptions.media;
    const deviceOptions = filterOptions.device;

    const CustomSelect = ({ id, value, setValue, options, placeholder, style, searchable = false }) => {
        const displayOptions = searchable && searchQuery 
            ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
            : options;

        return (
            <div className="custom-dropdown" style={style}>
                <button
                    className="dropdown-toggle tab-dropdown-btn"
                    onClick={() => toggleDropdown(id)}
                    style={{ width: '100%' }}
                >
                    <span className="dropdown-label" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {value ? (options.find(opt => opt.value === value)?.label || value) : placeholder}
                    </span>
                    <span className={`arrow ${openDropdown === id ? 'open' : ''}`}>▼</span>
                </button>
                {openDropdown === id && (
                    <ul className="dropdown-menu" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {searchable && (
                            <li className="dropdown-search" style={{ padding: '8px', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="text"
                                    placeholder="소재 검색..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        boxSizing: 'border-box',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                />
                            </li>
                        )}
                        {displayOptions.length > 0 ? displayOptions.map(opt => (
                            <li 
                                key={opt.value} 
                                className={value === opt.value ? 'active' : ''} 
                                onClick={() => { setValue(opt.value); setOpenDropdown(null); }}
                                style={{ padding: '8px 12px', cursor: 'pointer' }}
                            >
                                <span className="option-text">{opt.label}</span>
                            </li>
                        )) : (
                            <li style={{ padding: '8px 12px', color: '#999', cursor: 'default' }}>{searchable && searchQuery ? '검색 결과가 없습니다' : '옵션이 없습니다'}</li>
                        )}
                    </ul>
                )}
            </div>
        );
    };

    const renderDatePicker = () => (
        <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
                const [start, end] = update;
                setStartDate(start);
                setEndDate(end);
            }}
            locale={ko}
            dateFormat="yyyy.MM.dd"
            customInput={
                <button className="tab-btn date-picker-btn">
                    {startDate && endDate
                        ? `${startDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })} - ${endDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}`
                        : '기간 조건'}
                </button>
            }
        />
    );

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div className="tab-datepicker-wrapper">
                        {renderDatePicker()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                        
                        <CustomSelect 
                            id="media" 
                            value={media} 
                            setValue={setMedia} 
                            options={mediaOptions} 
                            placeholder="전체" 
                            style={{ width: '120px' }} 
                        />
                        
                        <CustomSelect 
                            id="device" 
                            value={device} 
                            setValue={setDevice} 
                            options={deviceOptions} 
                            placeholder="전체" 
                            style={{ width: '120px' }} 
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', width: '100%', alignItems: 'center', background: '#f8f9fa', padding: '15px 20px', borderRadius: '12px', border: '1px solid #eee', position: 'relative', zIndex: 10 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <strong style={{ color: '#5C9CE6', minWidth: '100px' }}>Target A 소재</strong>
                        <CustomSelect 
                            id="materialA" 
                            value={materialA} 
                            setValue={setMaterialA} 
                            options={materialOptions} 
                            placeholder="소재를 선택하세요" 
                            style={{ flex: 1, minWidth: 0 }} 
                            searchable={true}
                        />
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#ccc', fontSize: '1.2rem', padding: '0 10px' }}>VS</div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '15px', minWidth: 0 }}>
                        <strong style={{ color: '#F28F43', minWidth: '100px' }}>Target B 소재</strong>
                        <CustomSelect 
                            id="materialB" 
                            value={materialB} 
                            setValue={setMaterialB} 
                            options={materialOptions} 
                            placeholder="소재를 선택하세요" 
                            style={{ flex: 1, minWidth: 0 }} 
                            searchable={true}
                        />
                    </div>
                </div>
            </nav>

            <main className="hanssem-main">
                {isLoading && <div style={{ textAlign: 'center', padding: '20px', color: '#667eea', fontWeight: 'bold' }}>데이터를 불러오는 중입니다...</div>}
                
                <div className="chart-grid" style={{ display: 'flex', gap: '30px', justifyContent: 'center', marginBottom: '40px', marginTop: '20px', alignItems: 'stretch' }}>
                    {/* Left: AB Cards */}
                    <div style={{ flex: 2, display: 'flex', gap: '30px', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ flex: 1, maxWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ background: '#5C9CE6', color: '#fff', padding: '6px 20px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '15px', fontSize: '0.9rem' }}>Target A</div>
                            {cardDataA ? <CreativeCard data={cardDataA} /> : <div style={{ padding: '40px', color: '#999', border: '1px dashed #ddd', borderRadius: '12px', width: '100%', textAlign: 'center' }}>소재를 선택해주세요</div>}
                        </div>
                        <div style={{ flex: 1, maxWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ background: '#F28F43', color: '#fff', padding: '6px 20px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '15px', fontSize: '0.9rem' }}>Target B</div>
                            {cardDataB ? <CreativeCard data={cardDataB} /> : <div style={{ padding: '40px', color: '#999', border: '1px dashed #ddd', borderRadius: '12px', width: '100%', textAlign: 'center' }}>소재를 선택해주세요</div>}
                        </div>
                    </div>
                    
                    {/* Right: AI Analysis */}
                    <div style={{ flex: 1.2, minWidth: '300px', backgroundColor: '#fdfdff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#2d3748' }}>
                            <span style={{ fontSize: '1.3rem' }}>✨</span> AI 소재 성과 분석
                        </h3>
                        <div style={{ flex: 1, fontSize: '0.95rem' }}>
                            {generateMockAIAnalysis(dataA, dataB)}
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
                                    <td className="row-key" style={{ fontWeight: 'bold', color: '#5C9CE6' }}>Target A ({dataA.name})</td>
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
                                    <td className="row-key" style={{ fontWeight: 'bold', color: '#F28F43' }}>Target B ({dataB.name})</td>
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

export default ABCompareView;
