export function koreanDate(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
}

const dayNumber = value => Date.parse(`${value}T00:00:00+09:00`) / 86400000;

export function getEventStatus(event, today = koreanDate()) {
  if (event.type === 'content') return { id: 'published', label: '게시 콘텐츠' };
  if (event.startDate && today < event.startDate) return { id: 'upcoming', label: '진행 예정' };
  if (!event.endDate) return { id: 'undated', label: '기간 미정' };
  const days = dayNumber(event.endDate) - dayNumber(today);
  if (days < 0) return { id: 'ended', label: '종료' };
  if (days <= 3) return { id: 'ending', label: days === 0 ? '오늘 종료' : `종료 D−${days}` };
  return { id: 'active', label: '진행 중' };
}

export function matchesCategory(event, category, today) {
  if (category === 'all') return true;
  if (category === 'promotion') return ['promotion', 'content'].includes(event.type);
  if (category === 'price') return Boolean(event.comparison);
  return category === 'ending' && getEventStatus(event, today).id === 'ending';
}

export function filterEvents(events, { brand = 'all', channel = 'all', query = '', status = 'all' } = {}, today) {
  const term = query.trim().toLocaleLowerCase('ko-KR');
  return events.filter(event => {
    const eventStatus = getEventStatus(event, today).id;
    return (brand === 'all' || event.brand === brand) &&
      (channel === 'all' || event.sources.some(source => source.channel === channel)) &&
      (status === 'all' || (status === 'active' ? ['active', 'ending'].includes(eventStatus) : eventStatus === status)) &&
      (!term || `${event.brand} ${event.title} ${event.summary} ${event.benefit} ${event.sources.map(source => `${source.channel} ${source.publisher} ${source.title}`).join(' ')}`.toLocaleLowerCase('ko-KR').includes(term));
  });
}

export function eventPeriod(event) {
  if (event.type === 'content') return '캠페인 콘텐츠 · 행사 기간 해당 없음';
  const format = value => value?.replaceAll('-', '.');
  if (event.startDate && event.endDate) return `${format(event.startDate)} — ${format(event.endDate)}`;
  if (event.endDate) return `${format(event.endDate)}까지`;
  return '적용 기간 미공개';
}
