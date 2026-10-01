const GROUP_FIELDS = ['device', 'ad_type', 'business_unit', 'creative_type', 'landing', 'ad_objective', 'targeting'];
const groupKey = row => JSON.stringify(GROUP_FIELDS.map(key => row[key] ?? null));

// 통합 성과는 그대로 두고 같은 집계 키에 해당하는 이미지 위치만 연결한다.
export function attachCreativeImageSources(rows, mediaRows) {
  const sources = new Map();
  for (const row of [...mediaRows].sort((a, b) => Number(b.total_cost || 0) - Number(a.total_cost || 0))) {
    if (!row.media || !row.creative_type) continue;
    const key = groupKey(row);
    const list = sources.get(key) || [];
    if (!list.some(source => source.media === row.media)) list.push({ media: row.media, business_unit: row.business_unit, creative_type: row.creative_type });
    sources.set(key, list);
  }
  return rows.map(row => ({ ...row, image_sources: sources.get(groupKey(row)) || row.image_sources || [] }));
}

export function creativeImageCandidates(data) {
  const urls = [];
  const add = url => { if (!urls.includes(url)) urls.push(url); };
  if (typeof data.img === 'string' && /^https?:\/\//i.test(data.img)) add(data.img);
  const sources = data.media ? [data, ...(data.image_sources || [])] : data.image_sources || [];
  const encodePath = value => String(value).trim().split('/').map(encodeURIComponent).join('/');
  for (const source of sources) {
    if (!source.media || !source.creative_type) continue;
    const filename = String(source.creative_type).trim();
    if (!filename) continue;
    const path = [source.business_unit, source.media].filter(Boolean).map(encodePath).join('/');
    const base = `https://storage.googleapis.com/hanssem_hf/${path}/`;
    const match = filename.match(/\.(png|jpg|jpeg|webp)$/i);
    const stem = match ? filename.slice(0, -match[0].length) : filename;
    if (match) add(`${base}${encodePath(filename)}`);
    for (const extension of ['png', 'jpg', 'jpeg', 'webp']) add(`${base}${encodePath(stem)}.${extension}`);
  }
  return urls;
}
