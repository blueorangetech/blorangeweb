export const MONITORING_DATE = '2026-10-21';

export function daysUntilClose(endDate, referenceDate = MONITORING_DATE) {
  return Math.round((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${referenceDate}T00:00:00Z`)) / 86400000);
}

export function deadlineStatus(days) {
  if (days < 0) return { key: 'closed', label: '마감', text: `마감 ${Math.abs(days)}일 경과` };
  if (days === 0) return { key: 'today', label: '오늘 마감', text: 'D-day' };
  if (days <= 3) return { key: 'urgent', label: '3일 이내', text: `D-${days}` };
  if (days <= 7) return { key: 'soon', label: '7일 이내', text: `D-${days}` };
  return { key: 'normal', label: '8일 이상', text: `D-${days}` };
}

const posting = (id, company, title, startDate, endDate, platform) => ({
  id, company, title, startDate, endDate, platform,
  daysUntilClose: daysUntilClose(endDate),
});

// All postings and platform assignments below are fictional UI fixtures.
export const RECRUITMENT_POSTINGS = [
  posting('55325615', '블루테크', '프론트엔드 개발자 채용', '2026-10-01', '2026-10-21', '사람인'),
  posting('55325616', '오렌지리테일', '브랜드 마케터 경력 채용', '2026-10-07', '2026-10-22', '사람인'),
  posting('55325617', '그린모빌리티', '서비스 기획자 채용', '2026-10-10', '2026-10-24', '사람인'),
  posting('55325618', '넥스트커머스', '데이터 분석가 채용', '2026-10-12', '2026-10-26', '사람인'),
  posting('55325619', '루미나스랩', '프로덕트 디자이너 채용', '2026-10-14', '2026-10-28', '사람인'),
  posting('55325620', '파인클라우드', '백엔드 개발자 경력 채용', '2026-10-15', '2026-11-05', '사람인'),
  posting('55325621', '데일리웍스', '고객경험 매니저 채용', '2026-10-01', '2026-10-19', '사람인'),
];

