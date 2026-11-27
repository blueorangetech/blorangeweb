export async function readVariationStream(response, onEvent) {
  if (!response.body || !response.headers.get('content-type')?.includes('application/x-ndjson')) {
    throw new Error('서버의 소재 베리에이션 스트리밍 응답을 확인해 주세요.');
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let complete = false;
  const seen = new Set();
  const consume = (line) => {
    if (!line.trim()) return;
    const event = JSON.parse(line);
    if (event.type === 'fatal') throw new Error(event.message);
    if (event.type === 'image' || event.type === 'error') {
      const key = event.image?.key ?? event.error?.key;
      if (!key) throw new Error('소재 베리에이션 결과 형식이 올바르지 않습니다.');
      if (seen.has(key)) return;
      seen.add(key);
    } else if (event.type === 'done') {
      complete = true;
    } else if (event.type === 'heartbeat') {
      return;
    } else {
      throw new Error('소재 베리에이션 결과 형식이 올바르지 않습니다.');
    }
    onEvent(event);
  };
  try {
    while (!complete) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      let newline;
      while (!complete && (newline = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        consume(line);
      }
      if (done) {
        if (!complete && buffer.trim()) consume(buffer);
        break;
      }
    }
    if (!complete) throw new Error('전체 완료 전에 연결이 끊겼습니다. 받은 결과는 유지됩니다.');
  } finally {
    try { await reader.cancel(); } catch { /* The connection may already be closed. */ }
    reader.releaseLock();
  }
}
