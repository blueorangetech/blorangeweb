// Public execution references; these images are not tied to the demo metrics.
const campaignSource = 'https://www.dcr8co.com/saramin';
const campaign = (file, title) => ({
  img: `/brands/saramin/creatives/${file}.jpg`,
  assetTitle: title,
  assetSource: campaignSource,
  assetSourceLabel: 'DCR8 · 2022.11 캠페인 스틸',
});

export const CREATIVE_ASSETS = {
  'cr-01': {
    img: '/brands/saramin/creatives/hanaad-branding.png',
    assetTitle: '든든한 취업의 기준, 사람인',
    assetSource: 'https://www.hanaad.net/sub/port_v?inout_no=161',
    assetSourceLabel: '하나애드IMC · DA 집행 사례',
  },
  'cr-02': campaign('match-1', 'THANK YOU VERY MATCH · 사람인 앱'),
  'cr-03': campaign('match-3', 'THANK YOU VERY MATCH · 프로필 등록'),
  'cr-04': campaign('match-4', 'THANK YOU VERY MATCH · 커리어 시작'),
  'cr-05': campaign('match-5', 'THANK YOU VERY MATCH · 커리어 제안'),
  'cr-06': campaign('match-6', 'THANK YOU VERY MATCH · 커리어 매칭'),
  'cr-07': campaign('match-7', 'THANK YOU VERY MATCH · 매칭 성공'),
  'cr-08': campaign('match-9', 'THANK YOU VERY MATCH · 브랜드 메시지'),
};
