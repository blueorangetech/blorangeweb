import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { monitoringEvents, monitoringSources, verifiedOn } from './monitoringData.js';
import { eventPeriod, filterEvents, getEventStatus, koreanDate, matchesCategory } from './monitoringModel.js';

test('Korean day boundary is used even when UTC is the previous date', () => {
  assert.equal(koreanDate(new Date('2026-10-18T15:00:00Z')), '2026-10-19');
});

test('ending soon excludes future and expired campaigns, includes the final day', () => {
  const event = { startDate: '2026-10-08', endDate: '2026-10-27' };
  assert.equal(getEventStatus(event, '2026-10-07').id, 'upcoming');
  assert.equal(getEventStatus(event, '2026-10-23').id, 'active');
  assert.equal(getEventStatus(event, '2026-10-24').label, '종료 D−3');
  assert.equal(getEventStatus(event, '2026-10-27').label, '오늘 종료');
  assert.equal(getEventStatus(event, '2026-10-28').id, 'ended');
  assert.equal(matchesCategory(event, 'ending', '2026-10-28'), false);
  assert.equal(getEventStatus({ endDate: null }, '2026-10-19').id, 'undated');
});

test('brand, search and status filters combine without confusing undated prices with live campaigns', () => {
  const filters = { brand: '이케아', query: '화이트', status: 'active' };
  assert.deepEqual(filterEvents(monitoringEvents, filters, verifiedOn).map(event => event.id), ['ikea-raskog-family-price']);
  assert.equal(filterEvents(monitoringEvents, { brand: '오늘의집' }, verifiedOn).length, 0);
  assert.equal(filterEvents(monitoringEvents, { channel: '인스타그램' }, verifiedOn).length, 0);
  assert.equal(filterEvents(monitoringEvents, { status: 'ended' }, '2026-11-02').length, 5);
});

test('every published record has source evidence, local images and coherent dates', () => {
  const ids = new Set();
  for (const event of monitoringEvents) {
    assert.ok(!ids.has(event.id)); ids.add(event.id);
    assert.ok(event.evidence && event.verifiedOn);
    assert.ok(existsSync(new URL(`../../../../public${event.image}`, import.meta.url)));
    if (event.detailImage) assert.ok(existsSync(new URL(`../../../../public${event.detailImage}`, import.meta.url)));
    for (const source of event.sources) {
      assert.match(new URL(source.url).hostname, /^(www\.)?(ikea\.com|iloom\.com|hyundailivart\.co\.kr|youtube\.com|hypebeast\.kr|newswire\.co\.kr)$/);
    }
    if (event.startDate && event.endDate) assert.ok(event.startDate <= event.endDate);
    if (event.comparison) assert.ok(event.comparison.before > event.comparison.after);
    assert.ok(!event.change); // No invented historical collection diffs.
  }
  assert.equal(monitoringSources.filter(source => source.status === 'verified').length, 3);
  assert.equal(monitoringEvents.filter(event => matchesCategory(event, 'ending', verifiedOn)).length, 0);
  assert.equal(eventPeriod(monitoringEvents.find(event => event.id === 'ikea-billy-lower-price')), '적용 기간 미공개');
});

test('same campaign is grouped across channels and publication is distinct from campaign dates', () => {
  const youtube = filterEvents(monitoringEvents, { channel: '유튜브' }, verifiedOn);
  const news = filterEvents(monitoringEvents, { channel: '뉴스' }, verifiedOn);
  assert.equal(youtube.length, 1);
  assert.equal(youtube[0].id, news[0].id);
  assert.equal(getEventStatus(youtube[0], verifiedOn).id, 'published');
  assert.equal(youtube[0].sources.find(source => source.channel === '유튜브').publishedOn, null);
  assert.equal(youtube[0].sources.find(source => source.channel === '뉴스').publishedOn, '2023-10-26');
  const popup = filterEvents(monitoringEvents, { channel: '보도자료' }, verifiedOn)[0];
  assert.equal(popup.sources[0].kind, 'press_release');
  assert.equal(popup.sources[0].publishedOn, '2026-01-07');
  assert.equal(popup.startDate, '2026-01-16');
  assert.equal(getEventStatus(popup, verifiedOn).id, 'ended');
  assert.ok(filterEvents(monitoringEvents, { query: 'Hypebeast' }, verifiedOn).length);
});
