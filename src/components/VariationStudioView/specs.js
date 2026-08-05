// 매체별 타겟 규격 및 글자수 제한 스펙 정의
export const PLACEMENT_SPECS_MAP = [
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

  // 5. Kakao Moment
  { key: 'kakao_bizboard_2_1', channel: 'Kakao Moment', channelKey: 'kakao', aspectClass: 'ratio-2-1', maxHeadLen: 25, maxSubLen: 40, format: '카카오 비즈보드 (2.03:1 - 1029x507)' },
  { key: 'kakao_feed_1_1', channel: 'Kakao Moment', channelKey: 'kakao', aspectClass: 'ratio-1-1', maxHeadLen: 25, maxSubLen: 45, format: '톡피드 정방형 (1:1 - 1200x1200)' },
  { key: 'kakao_display_2_1', channel: 'Kakao Moment', channelKey: 'kakao', aspectClass: 'ratio-2-1', maxHeadLen: 30, maxSubLen: 60, format: '메인 와이드 배너 (2:1 - 1200x600)' }
];

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
    title: 'Kakao Moment',
    channelKey: 'kakao',
    placements: [
      { id: 'kakao_bizboard_2_1', label: '비즈보드 (2.03:1 - 1029x507)' },
      { id: 'kakao_feed_1_1', label: '톡피드 / 디스플레이 (1:1 - 1200x1200)' },
      { id: 'kakao_display_2_1', label: '메인 와이드 (2:1 - 1200x600)' }
    ]
  }
];
