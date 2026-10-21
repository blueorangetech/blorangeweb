// Temporary classification until the posting-status API is connected.
export function filterPostingUrls(input, random = Math.random) {
  const seen = new Set();
  const result = { active: [], closed: [], unknown: [], invalid: [], duplicates: 0 };
  for (const value of input.split(/\s+/).filter(Boolean)) {
    let url;
    try {
      url = new URL(value);
    } catch {
      result.invalid.push(value);
      continue;
    }
    const supported = ['http:', 'https:'].includes(url.protocol) && (url.hostname === 'saramin.co.kr' || url.hostname.endsWith('.saramin.co.kr'));
    const id = url.searchParams.get('rec_idx');
    if (!supported || !/^\d+$/.test(id || '')) {
      result.invalid.push(value);
      continue;
    }
    if (seen.has(id)) {
      result.duplicates++;
      continue;
    }
    seen.add(id);
    const entry = { url: value, id };
    if (random() < 0.3) result.closed.push(entry);
    else result.active.push(entry);
  }
  return result;
}
