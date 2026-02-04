import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';
import '../../styles/HanssemInsight.css';
import { CreativeCard } from './';

function InsightView() {
    const [selectedMedia, setSelectedMedia] = useState(['all']);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [realData, setRealData] = useState([]); // API에서 가져온 실제 데이터 저장용
    const [isLoading, setIsLoading] = useState(false);

    // 무한 스크롤 관련 상태
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 20; // 한 번에 불러올 개수

    // 날짜 상태 추가 (기본값: 최근 7일)
    const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState(new Date());

    // 매체 로고 URL 매핑
    const mediaLogos = {
        '네이버': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Naver_Logotype.svg/250px-Naver_Logotype.svg.png',
        '카카오': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg',
        '메타': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
        '구글': 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
        '유튜브': 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
        '당근': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Daangn_Signature_RGB.jpg/250px-Daangn_Signature_RGB.jpg'
    };

    // 탭 메뉴 데이터
    const tabMenus = [
        { id: 'concept', label: '카테고리 조건' },
        { id: 'explore', label: '타게팅 조건' },
        { id: 'copy', label: '메세지 조건' },
    ];

    // 차트 데이터 (샘플/폴백용)
    const chartData = [
        { id: 1, media: '카카오', title: '소재_메인_거실_01', ctr: '2.45%', roas: '450%', clicks: '1,240', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=450&fit=crop' },
        { id: 2, media: '메타', title: '소재_주방_리모델링', ctr: '3.12%', roas: '520%', clicks: '2,150', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&h=450&fit=crop' },
        { id: 3, media: '구글', title: '소재_침실_패키지', ctr: '1.98%', roas: '380%', clicks: '980', img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=450&fit=crop' },
        { id: 4, media: '유튜브', title: '소재_모던_바스', ctr: '4.21%', roas: '290%', clicks: '4,500', img: 'https://images.unsplash.com/photo-1584622781514-f63f84ced453?w=600&h=450&fit=crop' },
        { id: 5, media: '메타', title: '소재_다이닝_테이블', ctr: '2.87%', roas: '610%', clicks: '1,560', img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&h=450&fit=crop' },
    ];

    // 날짜가 바뀌면 데이터와 오프셋 초기화
    useEffect(() => {
        setRealData([]);
        setOffset(0);
        setHasMore(true);
    }, [startDate, endDate]);

    // 실제 데이터 가져오기 (useEffect)
    useEffect(() => {
        if (!startDate || !endDate || !hasMore || isLoading) return;

        const fetchBigQueryData = async () => {
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
                    `${API_BASE_URL}/search/bigquery/date?dataset_id=hanssem&table_id=creative_performance&start_date=${startStr}&end_date=${endStr}&limit=${LIMIT}&offset=${offset}`
                );
                if (!response.ok) throw new Error('데이터 로드 실패');
                const result = await response.json();
                
                const newData = Array.isArray(result) ? result : (result.data || []);
                
                if (newData.length < LIMIT) {
                    setHasMore(false);
                }

                setRealData(prev => offset === 0 ? newData : [...prev, ...newData]);
            } catch (error) {
                console.error('BigQuery Fetch Error:', error);
                setHasMore(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBigQueryData();
    }, [startDate, endDate, offset]);

    // 스크롤 감지 (Intersection Observer)
    const lastElementRef = useRef();
    useEffect(() => {
        if (isLoading || !hasMore) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setOffset(prev => prev + LIMIT);
            }
        }, { threshold: 0.1 });

        if (lastElementRef.current) {
            observer.observe(lastElementRef.current);
        }

        return () => observer.disconnect();
    }, [isLoading, hasMore]);

    // 필터링된 데이터 계산
    const displayData = realData.length > 0 ? realData : (offset === 0 ? chartData : []);

    const filteredData = !selectedMedia.includes('all')
        ? displayData.filter(item => selectedMedia.includes(item.media))
        : displayData;

    const handleTabChange = (tabId) => {
        setIsDropdownOpen(false);
    };

    const handleMediaSelect = (media) => {
        if (media === 'all') {
            setSelectedMedia(['all']);
        } else {
            let nextSelected = selectedMedia.filter(m => m !== 'all');
            if (nextSelected.includes(media)) {
                nextSelected = nextSelected.filter(m => m !== media);
            } else {
                nextSelected.push(media);
            }

            if (nextSelected.length === 0) {
                setSelectedMedia(['all']);
            } else {
                setSelectedMedia(nextSelected);
            }
        }
    };

    return (
        <>
            <nav className="tab-navigation">
                <div className="tab-dropdown-wrapper">
                    <div className="custom-dropdown">
                        <button
                            className="dropdown-toggle tab-dropdown-btn"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className="dropdown-label">
                                {selectedMedia.includes('all') ? '매체 전체' : (selectedMedia.length === 1 ? selectedMedia[0] : `${selectedMedia[0]} 외 ${selectedMedia.length - 1}건`)}
                            </span>
                            <span className={`arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                        </button>

                        {isDropdownOpen && (
                            <ul className="dropdown-menu multi-select">
                                <li className={selectedMedia.includes('all') ? 'active' : ''} onClick={() => handleMediaSelect('all')}>
                                    <div className="checkbox">{selectedMedia.includes('all') ? '✓' : ''}</div>
                                    매체 전체
                                </li>
                                {Object.keys(mediaLogos).map(media => (
                                    <li key={media} className={selectedMedia.includes(media) ? 'active' : ''} onClick={() => handleMediaSelect(media)}>
                                        <div className="checkbox">{selectedMedia.includes(media) ? '✓' : ''}</div>
                                        {media}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {tabMenus.map((tab) => (
                    <button key={tab.id} className="tab-btn" onClick={() => handleTabChange(tab.id)}>
                        {tab.label}
                    </button>
                ))}

                <div className="tab-datepicker-wrapper">
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
                                    ? `${startDate.toLocaleDateString('ko-KR', { year: '2-digit', month: 'numeric', day: 'numeric' })} - ${endDate.toLocaleDateString('ko-KR', { year: '2-digit', month: 'numeric', day: 'numeric' })}`
                                    : '기간 조건'}
                            </button>
                        }
                    />
                </div>

                <button
                    className="tab-btn reset-btn"
                    onClick={() => {
                        setSelectedMedia(['all']);
                        setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
                        setEndDate(new Date());
                    }}
                >
                    조건 초기화
                </button>
            </nav>

            <main className="hanssem-main">
                <div className="section-header">
                    <h2>[{!selectedMedia.includes('all') ? (selectedMedia.length === 1 ? `${selectedMedia[0]} 성과` : `${selectedMedia[0]} 외 ${selectedMedia.length - 1}개 매체 성과`) : '전체 통합'} 소재 성과 수치 ]</h2>
                </div>
                <div className="chart-grid">
                    {filteredData.map((chart, index) => (
                        <CreativeCard 
                            key={chart.id || `${chart.media}_${chart.title}_${index}`} 
                            data={chart} 
                            mediaLogos={mediaLogos} 
                        />
                    ))}
                </div>

                {/* 무한 스크롤 트리거 */}
                <div ref={lastElementRef} style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {isLoading && <div style={{ color: '#667eea', fontWeight: 'bold' }}>데이터 로딩 중...</div>}
                    {!hasMore && realData.length > 0 && <div style={{ color: '#999' }}>모든 데이터를 불러왔습니다.</div>}
                </div>
            </main>
        </>
    );
}

export default InsightView;