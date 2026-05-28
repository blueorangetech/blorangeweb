import React, { useState, useEffect, useMemo } from 'react';

function InsightSummaryTable({ data, hasRealData }) {
    const [tablePage, setTablePage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // 데이터가 변경되면 페이지를 1로 초기화
    useEffect(() => {
        setTablePage(1);
    }, [data]);

    const totalTablePages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));

    const currentTableData = useMemo(() => {
        const start = (tablePage - 1) * ITEMS_PER_PAGE;
        return data.slice(start, start + ITEMS_PER_PAGE);
    }, [data, tablePage]);

    return (
        <div className="summary-data-table-container">
            <table className="summary-data-table">
                <thead>
                    <tr>
                        <th>구분</th>
                        <th>소진비용</th>
                        <th>노출</th>
                        <th>클릭</th>
                        <th>CTR</th>
                        <th>CPC</th>
                        <th className="consultation-group">상담신청</th>
                        <th className="consultation-group">상담신청_CVR</th>
                        <th className="consultation-group">상담신청_CPA</th>
                        <th className="consultation-group">배분</th>
                        <th className="consultation-group">배분_CVR</th>
                        <th className="consultation-group">배분_CPA</th>
                        <th className="consultation-group">배분율</th>
                        <th className="consultation-group">확정건수</th>
                        <th className="consultation-group">확정률</th>
                        <th className="consultation-group">확정_CPA</th>
                    </tr>
                </thead>
                <tbody>
                    {hasRealData && currentTableData.length > 0 ? (
                        currentTableData.map((row, idx) => (
                            <tr key={idx}>
                                <td className="row-key">{row.key}</td>
                                <td>{Math.round(row.cost).toLocaleString()}</td>
                                <td>{Math.round(row.impressions).toLocaleString()}</td>
                                <td>{Math.round(row.clicks).toLocaleString()}</td>
                                <td>{row.ctr.toFixed(2)}%</td>
                                <td>{Math.round(row.cpc).toLocaleString()}</td>
                                <td>{Math.round(row.consultations).toLocaleString()}</td>
                                <td>{row.consult_cvr.toFixed(2)}%</td>
                                <td>{Math.round(row.consult_cpa).toLocaleString()}</td>
                                <td>{Math.round(row.distributions).toLocaleString()}</td>
                                <td>{row.dist_cvr.toFixed(2)}%</td>
                                <td>{Math.round(row.dist_cpa).toLocaleString()}</td>
                                <td>{row.dist_rate.toFixed(0)}%</td>
                                <td>{Math.round(row.confirms || 0).toLocaleString()}</td>
                                <td>{(row.confirm_cvr || 0).toFixed(2)}%</td>
                                <td>{Math.round(row.confirm_cpa || 0).toLocaleString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="16" className="empty-message">
                                설정한 데이터 조건(필터/기간 등)에 맞는 데이터가 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {data.length > 0 && (
                <div className="table-pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '15px' }}>
                    <button
                        onClick={() => setTablePage(p => Math.max(1, p - 1))}
                        disabled={tablePage === 1}
                        style={{
                            padding: '6px 14px', borderRadius: '4px', border: '1px solid #ddd',
                            background: tablePage === 1 ? '#f5f5f5' : '#fff', color: tablePage === 1 ? '#aaa' : '#333', cursor: tablePage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.85rem'
                        }}
                    >
                        이전
                    </button>
                    <span style={{ fontSize: '0.9rem', color: '#555', fontWeight: '500' }}>
                        {tablePage} <span style={{ color: '#ccc', margin: '0 4px' }}>/</span> {totalTablePages}
                    </span>
                    <button
                        onClick={() => setTablePage(p => Math.min(totalTablePages, p + 1))}
                        disabled={tablePage === totalTablePages}
                        style={{
                            padding: '6px 14px', borderRadius: '4px', border: '1px solid #ddd',
                            background: tablePage === totalTablePages ? '#f5f5f5' : '#fff', color: tablePage === totalTablePages ? '#aaa' : '#333', cursor: tablePage === totalTablePages ? 'not-allowed' : 'pointer', fontSize: '0.85rem'
                        }}
                    >
                        다음
                    </button>
                </div>
            )}
        </div>
    );
}

export default InsightSummaryTable;
