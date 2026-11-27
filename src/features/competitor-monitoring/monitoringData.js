// Official-source snapshot, verified 2026-10-19. No automated collection is implied.
// Previous/current prices below are published together by the source, not historical crawl diffs.
export const verifiedOn = '2026-10-19';
export const competitors = ['오늘의집', '리바트', '이케아', '까사미아', '일룸', '모던하우스', '에몬스', '데스커', '자코모', '아파트멘터리', 'LX Z:IN'];

const ikeaCampaign = 'https://www.ikea.com/kr/ko/campaigns/storage-week-fy27-l2-pub47d55da0/';
const iloomEvents = 'https://www.iloom.com/eventNews/event_main.do';
const imageRoot = '/images/competitor-monitoring/';

export const monitoringEvents = [
  {
    id: 'iloom-rm-creative', brand: '일룸', type: 'content', label: '브랜드 캠페인',
    title: '생활이 창작이 되는 곳 · 일룸 with RM',
    summary: 'RM의 창작 공간과 로이 뮤트 에디션을 소개하는 캠페인. 공식 매거진·유튜브 영상·관련 기사를 하나의 소식으로 모았습니다.',
    startDate: null, endDate: null,
    benefit: '일상의 공간에서 영감을 얻는 브랜드 메시지를 광고 영상과 화보로 전달합니다.',
    conditions: ['과거 공개된 캠페인 콘텐츠', '할인 행사 기간을 의미하지 않습니다.'],
    image: `${imageRoot}iloom-rm.jpg`, imageAlt: '일룸 제공 RM 캠페인 이미지',
    sources: [
      { channel: '홈페이지', title: '일룸 공식 매거진 · 로이 뮤트 에디션', url: 'https://www.iloom.com/magazine/idea_8' },
      { channel: '유튜브', kind: 'official', publisher: '일룸', title: '생활이 창작이 되는 곳 · 캠페인 영상', url: 'https://www.youtube.com/watch?v=uZ0tvQr2mn4', verificationNote: '일룸 공식 매거진에 삽입된 유튜브 영상으로 확인. 영상 게시일은 별도 확인되지 않았습니다.' },
      { channel: '뉴스', kind: 'news', publisher: 'Hypebeast', publishedOn: '2023-10-26', title: '일룸, RM과 함께 캠페인 전개', url: 'https://hypebeast.kr/2023/10/iloom-campaign-with-rm-of-bts', verificationNote: '기사에 일룸 제공 표기. 게시일은 기사 메타데이터 기준입니다.' }
    ],
    evidence: '공식 매거진의 캠페인 설명과 삽입 영상 주소를 확인하고, 같은 캠페인을 다룬 기사를 함께 연결했습니다.'
  },
  {
    id: 'iloom-study-popup-2026', brand: '일룸', type: 'promotion', label: '체험형 팝업',
    title: '공부하는 집 · 작은 작업자들의 리듬',
    summary: '아이의 학습 성향과 부모의 관찰을 주제로 한 일룸 체험형 팝업입니다.',
    startDate: '2026-01-16', endDate: '2026-02-14',
    benefit: '창의탐구·도전자율·집중몰입·감정공감 등 네 가지 유형에 맞춘 체험 프로그램을 소개했습니다.',
    conditions: ['서울 송파구 가락로40길 팝업 기준', '더현대 서울 소규모 팝업은 별도 일정으로 운영'],
    image: `${imageRoot}iloom-study-popup.jpg`, imageAlt: '일룸 공부하는 집 팝업 보도자료 이미지',
    sources: [{ channel: '보도자료', kind: 'press_release', publisher: '뉴스와이어 · 제공 일룸', publishedOn: '2026-01-07', title: '일룸, 공부하는 집 팝업 오픈', url: 'https://www.newswire.co.kr/newsRead.php?no=1026531' }],
    evidence: '일룸이 배포한 보도자료의 게시일과 송파구 팝업 운영 기간을 확인했습니다. 언론사의 독립 취재 기사와 구분합니다.'
  },
  {
    id: 'ikea-storage-october', brand: '이케아', type: 'promotion', label: '시즌 프로모션',
    title: '이케사는 세일 · 거실 수납 할인',
    summary: '거실 수납과 트롤리 등 대상 제품을 위한 IKEA Family 할인 행사입니다.',
    startDate: '2026-10-08', endDate: '2026-10-27',
    benefit: 'IKEA Family 멤버 대상 10% 할인. 일부 특별가 품목은 개별 상품에 표시된 가격을 적용합니다.',
    conditions: ['대상 제품 및 재고에 따라 적용', '온라인몰·전국 매장·헤이 전화주문에서 제공'],
    image: `${imageRoot}ikea-storage.jpg`, imageAlt: '이케아 이케사는 세일 공식 캠페인 이미지',
    sources: [{ channel: '홈페이지', title: '이케아 공식 캠페인', url: ikeaCampaign }],
    evidence: '공식 캠페인에 10.8–10.27 행사 기간과 IKEA Family 할인 조건이 공개되어 있습니다.'
  },
  {
    id: 'iloom-strato', brand: '일룸', type: 'promotion', label: '제품 프로모션',
    title: '스트라토 원목 식탁 할인 프로모션',
    summary: '스트라토 원목 식탁을 대상으로 진행하는 기간 한정 할인 행사입니다.',
    startDate: '2026-08-24', endDate: '2026-11-01',
    benefit: '스트라토 원목 식탁 기간 한정 할인. 구체적인 할인 금액과 구매 조건은 공식 행사 안내에서 확인합니다.',
    conditions: ['대상 상품과 구매 조건은 공식 행사 안내 기준'],
    image: `${imageRoot}iloom-strato.jpg`, imageAlt: '일룸 스트라토 원목 식탁 할인 프로모션 공식 배너',
    sources: [{ channel: '홈페이지', title: '일룸 공식 이벤트 목록 · 스트라토', url: iloomEvents }],
    evidence: '일룸 공식 이벤트 목록에 행사명과 2026.08.24–11.01 기간이 공개되어 있습니다.'
  },
  {
    id: 'livart-clean-partnership', brand: '리바트', type: 'promotion', label: '제휴 혜택',
    title: '새집 준비 · 영구크린 제휴 이벤트',
    summary: '가구 구매와 이사·청소 준비를 연결하는 현대리바트와 영구크린의 제휴 행사입니다.',
    startDate: '2026-09-01', endDate: '2026-11-30',
    benefit: '현대리바트·영구크린 제휴 혜택. 서비스 이용과 쿠폰 적용 조건은 원문의 유의사항을 확인합니다.',
    conditions: ['가구·이사·청소 서비스별 적용 조건 상이', '혜택 신청 및 쿠폰 적용 조건 확인 필요'],
    image: `${imageRoot}livart-clean.jpg`, imageAlt: '현대리바트 새집 준비 제휴혜택 공식 배너',
    detailImage: `${imageRoot}livart-benefits.jpg`,
    sources: [
      { channel: '홈페이지', title: '리바트 공식 제휴 이벤트', url: 'https://www.hyundailivart.co.kr/eventDetail/E200000624' },
      { channel: '홈페이지', title: '행사 기간 확인 · 리바트 이벤트 목록', url: 'https://www.hyundailivart.co.kr/event' }
    ],
    evidence: '공식 이벤트 목록에서 기간을 확인하고, 상세 페이지의 제휴 안내 이미지를 함께 확인했습니다.'
  },
  {
    id: 'ikea-billy-lower-price', brand: '이케아', type: 'price', label: '공식 가격 인하',
    title: 'BILLY / OXBERG 책장+도어 가격 인하',
    summary: '화이트 80×30×202cm 제품의 기존 가격과 새로운 가격이 공식 상품 페이지에 함께 안내됩니다.',
    startDate: null, endDate: null,
    benefit: '기존가 149,900원 → 새로운 가격 139,900원. 10,000원 인하.',
    conditions: ['화이트 80×30×202cm / 제품 번호 995.283.47', '공식 페이지에 표시된 기존가와 새 가격의 비교'],
    comparison: { before: 149900, after: 139900, beforeLabel: '공식 기존가', afterLabel: '새로운 가격', note: '가격 적용 시작일은 원문에 명시되어 있지 않습니다.' },
    image: `${imageRoot}ikea-billy.jpg`, imageAlt: '이케아 BILLY OXBERG 화이트 책장+도어 공식 제품 이미지', imageFit: 'contain',
    sources: [{ channel: '홈페이지', title: '이케아 공식 상품 · BILLY / OXBERG', url: 'https://www.ikea.com/kr/ko/p/billy-oxberg-bookcase-with-doors-white-s99528347/' }],
    evidence: '공식 상품 페이지의 기존가 149,900원과 현재 표시 가격 139,900원을 비교했습니다.'
  },
  {
    id: 'ikea-raskog-family-price', brand: '이케아', type: 'price', label: '멤버십 특별가',
    title: 'RÅSKOG 로스코그 트롤리 특별가',
    summary: '화이트 35×45×77cm 트롤리에 IKEA Family 멤버 가격이 적용됩니다.',
    startDate: '2026-10-08', endDate: '2026-10-27',
    benefit: '정가 42,900원 → IKEA Family 특별가 38,000원. 4,900원 할인.',
    conditions: ['IKEA Family 멤버 대상', '화이트 35×45×77cm / 재고 소진 시까지'],
    comparison: { before: 42900, after: 38000, beforeLabel: '공식 정가', afterLabel: 'Family 특별가', note: '동일 시점의 정가와 멤버십 특별가 비교입니다.' },
    image: `${imageRoot}ikea-raskog.jpg`, imageAlt: '이케아 화이트 로스코그 트롤리 공식 제품 이미지', imageFit: 'contain',
    sources: [
      { channel: '홈페이지', title: '이케아 공식 상품 · RÅSKOG', url: 'https://www.ikea.com/kr/ko/p/raskog-trolley-white-20586788/' },
      { channel: '홈페이지', title: '행사 기간·가격 확인 · 공식 캠페인', url: ikeaCampaign }
    ],
    evidence: '공식 캠페인에 게시된 제품별 정가·특별가·적용 기간을 확인했습니다.'
  },
  {
    id: 'iloom-october-card', brand: '일룸', type: 'promotion', label: '결제 혜택',
    title: '10월 카드사 무이자 할부 프로모션',
    summary: '일룸 공식 이벤트에서 안내하는 카드사별 무이자 할부 혜택입니다.',
    startDate: '2026-10-01', endDate: '2026-10-31',
    benefit: '카드사별 무이자 할부 혜택. 대상 카드·개월 수·최소 결제금액은 공식 행사 안내 기준입니다.',
    conditions: ['카드사별 적용 조건 상이', '결제 전 대상 카드 및 할부 조건 확인'],
    image: `${imageRoot}iloom-card.jpg`, imageAlt: '일룸 10월 카드사 프로모션 공식 안내 배너',
    sources: [{ channel: '홈페이지', title: '일룸 공식 이벤트 목록 · 카드사 프로모션', url: iloomEvents }],
    evidence: '일룸 공식 이벤트 목록에 2026.10.01–10.31 카드사 프로모션이 공개되어 있습니다.'
  }
].map(event => ({ ...event, verifiedOn, sources: event.sources.map(source => ({
  kind: 'official', publisher: event.brand, publishedOn: null, ...source
})) }));

export const monitoringSources = competitors.map(brand => {
  const events = monitoringEvents.filter(event => event.brand === brand);
  const links = events.flatMap(event => event.sources);
  return { brand, count: events.length, verifiedOn: events.length ? verifiedOn : null,
    channels: [...new Set(links.map(link => link.channel))],
    url: links[0]?.url || null, status: events.length ? 'verified' : 'pending' };
});
