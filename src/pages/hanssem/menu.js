export const HANSSEM_MENU_STRUCTURE = [
  {
    id: 'report',
    label: '리포트',
    icon: 'monitoring',
    subItems: [
      { id: 'report-overview', label: 'Overview' },
      { id: 'report-detail', label: '상세 성과 비교' },
      { id: 'report-chat', label: 'Data Chat' },
      { id: 'report-competitor', label: '경쟁사 모니터링' },
    ],
  },
  {
    id: 'creative',
    label: '크리에이티브',
    icon: 'palette',
    subItems: [
      { id: 'creative-integrated', label: '통합 소재 대시보드' },
      { id: 'creative-insight', label: '매체별 소재 인사이트' },
      { id: 'creative-compare', label: 'AI분석 / 인사이트' },
      { id: 'creative-ai-studio', label: 'AI 크리에이티브' },
      { id: 'creative-library', label: '에셋 라이브러리' },
    ],
  },
  {
    id: 'mediamix',
    label: '미디어믹스',
    icon: 'pie_chart',
    subItems: [
      { id: 'mediamix-campaign', label: '캠페인/매체별 성과' },
      { id: 'mediamix-target', label: '미디어믹스 점검' },
    ],
  },
  {
    id: 'etc',
    label: '설정',
    icon: 'settings',
    subItems: [
      { id: 'etc-account', label: '계정 관리(로그인/회원권한)' },
      { id: 'etc-upload', label: '데이터 업로드 및 수정' },
    ],
  },
];
