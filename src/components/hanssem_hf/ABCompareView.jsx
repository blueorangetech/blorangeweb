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
                
                <div className="chart-grid" style={{ display: 'flex', gap: '30px', justifyContent: 'center', marginBottom: '40px', marginTop: '20px' }}>
                    <div style={{ flex: 1, maxWidth: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ background: '#5C9CE6', color: '#fff', padding: '6px 20px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '15px', fontSize: '0.9rem' }}>Target A</div>
                        {cardDataA ? <CreativeCard data={cardDataA} /> : <div style={{ padding: '40px', color: '#999', border: '1px dashed #ddd', borderRadius: '12px', width: '100%', textAlign: 'center' }}>소재를 선택해주세요</div>}
                    </div>
                    <div style={{ flex: 1, maxWidth: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ background: '#F28F43', color: '#fff', padding: '6px 20px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '15px', fontSize: '0.9rem' }}>Target B</div>
                        {cardDataB ? <CreativeCard data={cardDataB} /> : <div style={{ padding: '40px', color: '#999', border: '1px dashed #ddd', borderRadius: '12px', width: '100%', textAlign: 'center' }}>소재를 선택해주세요</div>}
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
