// 화면 검토용 데이터입니다. 실제 수집 결과와 분리하여 관리합니다.
export const competitors = ['오늘의집', '리바트', '이케아', '까사미아', '일룸', '모던하우스', '에몬스', '데스커', '자코모', '아파트멘터리', 'LX Z:IN'];

export const demoEvents = [
  { id: 'ohou-fall', brand: '오늘의집', channel: '홈페이지', kind: 'new', label: '신규 행사', title: '가을 리빙 페스타', summary: '가구·패브릭 중심의 시즌 기획전. 상품별 할인과 쿠폰 혜택을 확인합니다.', period: '10.16 — 10.31', time: '09:00 발견', sources: ['홈페이지', '블로그'], benefit: '최대 30% 할인 · 대상 상품 및 쿠폰 조건 확인 필요' },
  { id: 'livart-refresh', brand: '리바트', channel: '홈페이지', kind: 'change', label: '기간 변경', title: '우리 집 리프레시 프로모션', summary: '거실·침실 가구 프로모션의 행사 종료일이 변경되었습니다.', period: '10.10 — 10.25', time: '09:00 변경', sources: ['홈페이지'], change: '종료일 10.20 → 10.25 · 5일 연장', benefit: '종료일 변경 · 기존 혜택 유지 여부 확인 필요' },
  { id: 'ikea-members', brand: '이케아', channel: '홈페이지', kind: 'ending', label: '종료 D−2', title: '멤버십 주말 특별 혜택', summary: '멤버십 고객 대상 홈퍼니싱 특별가 행사입니다.', period: '10.12 — 10.18', time: '08:58 확인', sources: ['홈페이지'], benefit: '멤버십 고객 대상 · 품목별 특별가' },
  { id: 'jakomo-coupon', brand: '자코모', channel: '홈페이지', kind: 'change', label: '혜택 변경', title: '소파 구매 고객 쿠폰 혜택', summary: '쿠폰존에 안내된 할인 혜택이 변경되었습니다.', period: '기간 확인 필요', time: '08:50 변경', sources: ['홈페이지'], change: '쿠폰 혜택 5% → 7% · 사용 조건 확인 필요', benefit: '7% 쿠폰 · 최소 구매 금액 확인 필요' },
  { id: 'desker-workspace', brand: '데스커', channel: '유튜브', kind: 'new', label: '신규 콘텐츠', title: '일하는 공간을 바꾸는 작은 아이디어', summary: '워크스페이스 구성과 제품 활용을 소개하는 신규 영상입니다.', period: '10.16 게시', time: '08:40 발견', sources: ['유튜브'], benefit: '콘텐츠 소식 · 할인 혜택 미확인' },
  { id: 'iloom-showroom', brand: '일룸', channel: '블로그', kind: 'new', label: '신규 행사', title: '새로운 공간을 만나는 쇼룸 행사', summary: '쇼룸 방문 프로그램과 현장 상담 이벤트를 소개합니다.', period: '10.20 — 10.27', time: '08:30 발견', sources: ['블로그', '홈페이지'], benefit: '방문 예약 행사 · 증정 조건 확인 필요' }
];

export const demoSources = [
  { brand: '오늘의집', channels: '홈페이지 · 유튜브 · 블로그', status: 'normal', message: '최근 성공 10.16 09:00' },
  { brand: '리바트', channels: '홈페이지 · 유튜브 · 블로그', status: 'normal', message: '최근 성공 10.16 09:00' },
  { brand: '자코모', channels: '홈페이지 이벤트 게시판', status: 'error', message: '페이지 구조 변경 감지 · 08:55 실패' },
  ...competitors.filter(brand => !['오늘의집', '리바트', '자코모'].includes(brand)).map(brand => ({ brand, channels: '수집 채널 설정 예정', status: 'pending', message: '실제 수집 연동 전입니다.' }))
];
