import source from './koreanclick.json' with { type: 'json' };

export const TRAFFIC_SOURCE = source;
export const TRAFFIC_SERVICES = [
  { id: 'saramin', name: '사람인', color: '#5075ed' },
  { id: 'jobkorea', name: '잡코리아', color: '#079ca7' },
  { id: 'wanted', name: '원티드', color: '#9b62d1' },
  { id: 'remember', name: '리멤버', color: '#e59129' },
  { id: 'incruit', name: '인크루트', color: '#d95b82' },
];
export const TRAFFIC_MONTHS = [...new Set(source.records.map(row => row.month))].sort();
export const trafficChange = (current, previous) => previous > 0 ? current / previous - 1 : null;
export const trafficMonthLabel = month => `${month.slice(0, 4)}.${month.slice(5)}`;

export function getTrafficComparison(device, start, end) {
  const all = source.records.filter(row => row.device === device).sort((a, b) => a.month.localeCompare(b.month));
  const rows = all.filter(row => row.month >= start && row.month <= end);
  if (!rows.length) return { rows: [], ranking: [], previous: null };
  const first = rows[0];
  const last = rows[rows.length - 1];
  const previous = all[all.indexOf(last) - 1];
  const ranking = TRAFFIC_SERVICES.map(service => ({
    ...service,
    uv: last[service.id],
    mom: trafficChange(last[service.id], previous?.[service.id]),
    periodChange: rows.length > 1 ? trafficChange(last[service.id], first[service.id]) : null,
    average: rows.reduce((sum, row) => sum + row[service.id], 0) / rows.length,
  })).sort((a, b) => b.uv - a.uv).map((service, index, services) => ({
    ...service, rank: 1 + services.filter(item => item.uv > service.uv).length, order: index,
  }));
  return { rows, ranking, previous };
}

export function getTrafficChart(rows, ids, mode) {
  return rows.map(row => Object.fromEntries([
    ['month', trafficMonthLabel(row.month)],
    ...ids.map(id => [id, mode === 'index' ? (rows[0][id] > 0 ? row[id] / rows[0][id] * 100 : null) : row[id]]),
  ]));
}

export function exportTrafficCsv(rows, device, ids) {
  const services = TRAFFIC_SERVICES.filter(service => ids.includes(service.id));
  const records = [['기기', '월', ...services.map(service => `${service.name} UV`)], ...rows.map(row => [device, row.month, ...services.map(service => row[service.id])])];
  return '\uFEFF' + records.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
}
