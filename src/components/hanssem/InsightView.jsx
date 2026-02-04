import React, { useState, useEffect } from 'react';
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

    // 날짜 상태 추가 (기본값: 최근 7일)
    const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState(new Date());

    // 탭 메뉴 데이터
    const tabMenus = [
        { id: 'concept', label: '카테고리 조건' },
        { id: 'explore', label: '타게팅 조건' },
        { id: 'copy', label: '메세지 조건' },
    ];

    // 매체 로고 URL 매핑
    const mediaLogos = {
        '카카오': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg',
        '메타': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
        '구글': 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
        '유튜브': 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg'
    };

    // 차트 데이터 (샘플)
    const chartData = [
        { id: 1, media: '카카오', title: '소재_메인_거실_01', ctr: '2.45%', roas: '450%', clicks: '1,240', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=450&fit=crop' },
        { id: 2, media: '메타', title: '소재_주방_리모델링', ctr: '3.12%', roas: '520%', clicks: '2,150', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&h=450&fit=crop' },
        { id: 3, media: '구글', title: '소재_침실_패키지', ctr: '1.98%', roas: '380%', clicks: '980', img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=450&fit=crop' },
        { id: 4, media: '유튜브', title: '소재_모던_바스', ctr: '4.21%', roas: '290%', clicks: '4,500', img: 'https://images.unsplash.com/photo-1584622781514-f63f84ced453?w=600&h=450&fit=crop' },
        { id: 5, media: '메타', title: '소재_다이닝_테이블', ctr: '2.87%', roas: '610%', clicks: '1,560', img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&h=450&fit=crop' },
        { id: 6, media: '카카오', title: '소재_빌트인_주방', ctr: '3.55%', roas: '480%', clicks: '2,800', img: 'https://images.unsplash.com/photo-1556912176-12bb89e900ae?w=600&h=450&fit=crop' },
        { id: 7, media: '구글', title: '소재_키즈룸_기획', ctr: '1.65%', roas: '420%', clicks: '850', img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=450&fit=crop' },
        { id: 8, media: '메타', title: '소재_인테리어_토탈', ctr: '5.10%', roas: '720%', clicks: '5,200', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=450&fit=crop' },
        { id: 9, media: '유튜브', title: '소재_무드_조명', ctr: '2.11%', roas: '350%', clicks: '1,100', img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=450&fit=crop' },
        { id: 10, media: '구글', title: '소재_프리미엄_욕실', ctr: '2.78%', roas: '540%', clicks: '1,420', img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=450&fit=crop' },
    ];

    // 실제 데이터 가져오기 (useEffect)
    useEffect(() => {
        const fetchBigQueryData = async () => {
            setIsLoading(true);
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            try {
                const response = await fetch(`${API_BASE_URL}/search/bigquery/all?dataset_id=hanssem&table_id=creative_performance`);
                if (!response.ok) throw new Error('데이터 로드 실패');
                const result = await response.json();
                console.log(result);
                // API 응답 구조가 { status: 'success', data: [...] } 형태라고 가정
                if (result.status === 'success' || Array.isArray(result)) {
                    setRealData(Array.isArray(result) ? result : result.data);
                }
            } catch (error) {
                console.error('BigQuery Fetch Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBigQueryData();
    }, []);

    // 필터링된 데이터 계산 (매체 필터 기준)
    const filteredData = !selectedMedia.includes('all')
        ? chartData.filter(item => selectedMedia.includes(item.media))
        : chartData;

    const handleTabChange = (tabId) => {
        // 필터 동작을 위한 로직 (추후 구현)
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
                {/* 다중 선택 매체 조건 드롭다운 */}
                <div className="tab-dropdown-wrapper">
                    <div className="custom-dropdown">
                        <button
                            className="dropdown-toggle tab-dropdown-btn"
                            onClick={() => {
                                setIsDropdownOpen(!isDropdownOpen);
                            }}
                        >
                            <span className="dropdown-label">
                                {selectedMedia.includes('all') ? (
                                    '매체 전체'
                                ) : (
                                    selectedMedia.length === 1 ? selectedMedia[0] : `${selectedMedia[0]} 외 ${selectedMedia.length - 1}건`
                                )}
                            </span>
                            <span className={`arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                        </button>

                        {isDropdownOpen && (
                            <ul className="dropdown-menu multi-select">
                                <li
                                    className={selectedMedia.includes('all') ? 'active' : ''}
                                    onClick={() => handleMediaSelect('all')}
                                >
                                    <div className="checkbox">{selectedMedia.includes('all') ? '✓' : ''}</div>
                                    매체 전체
                                </li>
                                {Object.keys(mediaLogos).map(media => (
                                    <li
                                        key={media}
                                        className={selectedMedia.includes(media) ? 'active' : ''}
                                        onClick={() => handleMediaSelect(media)}
                                    >
                                        <div className="checkbox">{selectedMedia.includes(media) ? '✓' : ''}</div>
                                        {media}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* 나머지 탭들 (필터 버튼) */}
                {tabMenus.map((tab) => (
                    <button
                        key={tab.id}
                        className="tab-btn"
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}

                {/* 기간 선택 (DatePicker) */}
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

                {/* 초기화 버튼 */}
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
                    <h2>[{!selectedMedia.includes('all')
                        ? (selectedMedia.length === 1 ? `${selectedMedia[0]} 성과` : `${selectedMedia[0]} 외 ${selectedMedia.length - 1}개 매체 성과`)
                        : '전체 통합'} 소재 성과 수치 ]</h2>
                </div>
                <div className="chart-grid">
                    {filteredData.map((chart) => (
                        <CreativeCard key={chart.id} data={chart} mediaLogos={mediaLogos} />
                    ))}
                </div>
            </main>
        </>
    );
}

export default InsightView;
