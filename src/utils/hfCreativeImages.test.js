import { test } from 'node:test';
import assert from 'node:assert/strict';
import { attachCreativeImageSources, creativeImageCandidates } from './hfCreativeImages.js';

const creative = { device: 'app', ad_type: 'banner', business_unit: 'always', creative_type: 'always_nm_i_bnf-2', landing: 'home', ad_objective: 'purchase', targeting: 'all' };

test('integrated totals retain aggregation while media folders are attached', () => {
  const integrated = { ...creative, total_cost: 300, total_orders: 20 };
  const [enriched] = attachCreativeImageSources([integrated], [
    { ...creative, media: 'meta', total_cost: 100 },
    { ...creative, media: 'google', total_cost: 200 }
  ]);
  assert.equal(enriched.total_cost, 300);
  assert.equal(enriched.total_orders, 20);
  assert.equal(enriched.media, undefined);
  assert.deepEqual(enriched.image_sources.map(row => row.media), ['google', 'meta']);
  assert.match(creativeImageCandidates(enriched)[0], /always\/google\/always_nm_i_bnf-2\.png$/);
  assert.deepEqual(integrated, { ...creative, total_cost: 300, total_orders: 20 });
});

test('matching all grouping dimensions prevents unrelated image sources', () => {
  const [enriched] = attachCreativeImageSources([creative], [
    { ...creative, business_unit: 'other', media: 'google' },
    { ...creative, targeting: 'other', media: 'meta' }
  ]);
  assert.deepEqual(enriched.image_sources, []);
  assert.deepEqual(creativeImageCandidates(enriched), []);
});

test('media view and enriched integrated view use identical image paths', () => {
  const source = { ...creative, media: 'meta' };
  const [enriched] = attachCreativeImageSources([creative], [source]);
  assert.deepEqual(creativeImageCandidates(source), creativeImageCandidates(enriched));
});

test('explicit extensions do not repeat the failed URL and include webp', () => {
  const urls = creativeImageCandidates({ ...creative, media: 'meta', creative_type: 'asset.jpg' });
  assert.equal(urls.length, 4);
  assert.match(urls[0], /asset\.jpg$/);
  assert.match(urls[1], /asset\.png$/);
  assert.match(urls[3], /asset\.webp$/);
  assert.equal(new Set(urls).size, urls.length);
});

test('special filename characters are encoded and media sources deduplicated', () => {
  const row = { ...creative, creative_type: '소재 #1?', media: 'meta' };
  const [enriched] = attachCreativeImageSources([row], [row, row]);
  assert.equal(enriched.image_sources.length, 1);
  const urls = creativeImageCandidates(enriched);
  assert.equal(urls.length, 4);
  assert.ok(urls.every(url => !url.includes('#') && !url.includes('?') && !url.includes(' ')));
});

test('missing identifiers do not generate a guessed storage path', () => {
  assert.deepEqual(creativeImageCandidates({ creative_type: 'asset' }), []);
  assert.deepEqual(creativeImageCandidates({ media: 'meta' }), []);
  assert.deepEqual(creativeImageCandidates({ img: 'https://example.com/asset.png' }), ['https://example.com/asset.png']);
});
