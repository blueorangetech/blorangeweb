// 매체별 타겟 규격 및 글자수 제한 스펙 정의
const PLACEMENT_SPECS_BASE = [
  // 1. Meta (Instagram / Facebook)
  { key: 'meta_feed_1_1', channel: 'Meta (Instagram)', channelKey: 'meta', aspectClass: 'ratio-1-1', maxHeadLen: 25, maxSubLen: 50, format: '피드 정방형 (1:1 - 1080x1080)' },
  { key: 'meta_feed_4_5', channel: 'Meta (Instagram)', channelKey: 'meta', aspectClass: 'ratio-4-5', maxHeadLen: 25, maxSubLen: 50, format: '피드 세로형 (4:5 - 1080x1350)' },
  { key: 'meta_reels_9_16', channel: 'Meta (Instagram)', channelKey: 'meta', aspectClass: 'ratio-9-16', maxHeadLen: 20, maxSubLen: 35, format: '릴스 / 스토리 전면 (9:16 - 1080x1920)' },

  // 2. TikTok
  { key: 'tiktok_story_9_16', channel: 'TikTok', channelKey: 'tiktok', aspectClass: 'ratio-9-16', maxHeadLen: 20, maxSubLen: 35, format: '숏폼 전면 (9:16 - 1080x1920)' },
  { key: 'tiktok_feed_1_1', channel: 'TikTok', channelKey: 'tiktok', aspectClass: 'ratio-1-1', maxHeadLen: 25, maxSubLen: 40, format: '피드 정사각형 (1:1 - 1080x1080)' },

  // 3. Naver GFA
  { key: 'naver_smart_4_7', channel: 'Naver GFA', channelKey: 'naver', aspectClass: 'ratio-4-7', maxHeadLen: 25, maxSubLen: 45, format: '스마트채널 (4.7:1 - 750x160)' },
  { key: 'naver_feed_1_1', channel: 'Naver GFA', channelKey: 'naver', aspectClass: 'ratio-1-1', maxHeadLen: 25, maxSubLen: 40, format: '네이티브 피드 (1:1 - 1200x1200)' },
  { key: 'naver_main_2_2', channel: 'Naver GFA', channelKey: 'naver', aspectClass: 'ratio-2-2', maxHeadLen: 20, maxSubLen: 35, format: '메인 배너 (2.23:1 - 1250x560)' },
  { key: 'naver_feed_2_3', channel: 'Naver GFA', channelKey: 'naver', aspectClass: 'ratio-2-3', maxHeadLen: 25, maxSubLen: 40, format: '네이티브 세로 피드 (2:3 - 1200x1800)' },

  // 4. Google AC / Ads
  { key: 'google_landscape_1_91', channel: 'Google AC', channelKey: 'google', aspectClass: 'ratio-1-91', maxHeadLen: 30, maxSubLen: 90, format: '디스플레이/YouTube (1.91:1 - 1200x628)' },
  { key: 'google_square_1_1', channel: 'Google AC', channelKey: 'google', aspectClass: 'ratio-1-1', maxHeadLen: 30, maxSubLen: 90, format: 'Play스토어/PMax (1:1 - 1200x1200)' },
  { key: 'google_shorts_9_16', channel: 'Google AC', channelKey: 'google', aspectClass: 'ratio-9-16', maxHeadLen: 25, maxSubLen: 45, format: 'YouTube Shorts (9:16 - 1080x1920)' },

  // Kakao and Naver Brand Search
  { key: 'kakao_wide', channel: 'Kakao', channelKey: 'kakao', format: '1200x600' },
  { key: 'kakao_square', channel: 'Kakao', channelKey: 'kakao', format: '500x500' },
  { key: 'kakao_portrait', channel: 'Kakao', channelKey: 'kakao', format: '800x1000' },
  { key: 'kakao_wide_alt', channel: 'Kakao', channelKey: 'kakao', format: '1200x600' },
  { key: 'naver_brand_pc_main', channel: 'Naver Brand Search', channelKey: 'naver_brand', format: 'PC 메인 (472x472)' },
  { key: 'naver_brand_pc_thumbnail', channel: 'Naver Brand Search', channelKey: 'naver_brand', format: 'PC 썸네일 (232x152)' },
  { key: 'naver_brand_mobile_main', channel: 'Naver Brand Search', channelKey: 'naver_brand', format: 'MO 메인 (208x208)' },
  { key: 'naver_brand_mobile_thumbnail', channel: 'Naver Brand Search', channelKey: 'naver_brand', format: 'MO 썸네일 (240x240)' }
];

const PLACEMENT_DIMENSIONS = {
  meta_feed_1_1: [1080, 1080], meta_feed_4_5: [1080, 1350], meta_reels_9_16: [1080, 1920],
  tiktok_story_9_16: [1080, 1920], tiktok_feed_1_1: [1080, 1080],
  naver_smart_4_7: [750, 160], naver_feed_1_1: [1200, 1200], naver_main_2_2: [1250, 560],
  naver_feed_2_3: [1200, 1800], google_landscape_1_91: [1200, 628],
  google_square_1_1: [1200, 1200], google_shorts_9_16: [1080, 1920],
  kakao_wide: [1200, 600], kakao_square: [500, 500], kakao_portrait: [800, 1000], kakao_wide_alt: [1200, 600], naver_brand_pc_main: [472, 472], naver_brand_pc_thumbnail: [232, 152], naver_brand_mobile_main: [208, 208], naver_brand_mobile_thumbnail: [240, 240]
};

export const PLACEMENT_SPECS_MAP = PLACEMENT_SPECS_BASE.map((spec) => {
  const [width, height] = PLACEMENT_DIMENSIONS[spec.key];
  return { ...spec, width, height, aspectRatio: `${width}:${height}` };
});

export const PLACEMENT_GROUPS = [
  {
    title: 'Meta / Instagram',
    channelKey: 'meta',
    placements: [
      { id: 'meta_feed_1_1', label: '피드 정방형 (1:1 - 1080x1080)' },
      { id: 'meta_feed_4_5', label: '피드 세로형 (4:5 - 1080x1350)' },
      { id: 'meta_reels_9_16', label: '릴스/스토리 (9:16 - 1080x1920)' }
    ]
  },
  {
    title: 'TikTok',
    channelKey: 'tiktok',
    placements: [
      { id: 'tiktok_story_9_16', label: '숏폼 전면 (9:16 - 1080x1920)' },
      { id: 'tiktok_feed_1_1', label: '피드 정방형 (1:1 - 1080x1080)' }
    ]
  },
  {
    title: 'Naver GFA',
    channelKey: 'naver',
    placements: [
      { id: 'naver_smart_4_7', label: '스마트채널 (4.7:1 - 750x160)' },
      { id: 'naver_feed_1_1', label: '네이티브 피드 (1:1 - 1200x1200)' },
      { id: 'naver_main_2_2', label: '메인 배너 (2.23:1 - 1250x560)' },
      { id: 'naver_feed_2_3', label: '세로 피드 (2:3 - 1200x1800)' }
    ]
  },
  {
    title: 'Google Ads',
    channelKey: 'google',
    placements: [
      { id: 'google_landscape_1_91', label: '가로형 배너 (1.91:1 - 1200x628)' },
      { id: 'google_square_1_1', label: '정방형 배너 (1:1 - 1200x1200)' },
      { id: 'google_shorts_9_16', label: 'YouTube Shorts (9:16 - 1080x1920)' }
    ]
  },
  {
    title: 'Kakao',
    channelKey: 'kakao',
    placements: [
      { id: 'kakao_wide', label: '1200x600' },
      { id: 'kakao_square', label: '500x500' },
      { id: 'kakao_portrait', label: '800x1000' },
      { id: 'kakao_wide_alt', label: '1200x600' }
    ]
  },
  {
    title: 'Naver Brand Search',
    channelKey: 'naver_brand',
    placements: [
      { id: 'naver_brand_pc_main', label: 'PC 메인 (472x472)' },
      { id: 'naver_brand_pc_thumbnail', label: 'PC 썸네일 (232x152)' },
      { id: 'naver_brand_mobile_main', label: 'MO 메인 (208x208)' },
      { id: 'naver_brand_mobile_thumbnail', label: 'MO 썸네일 (240x240)' }
    ]
  }
];

