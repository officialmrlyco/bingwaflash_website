import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { parseMaxOffers, allowedSiteLinkOffers } from '../order/sitelink-offer-policy.mjs';

// SiteLink admission follows saved order; display sorting must not select cheaper extras.
test('live cap changes drop an extra offer and raising the cap admits it', () => {
  const offers = Array.from({ length: 101 }, (_, i) => ({ id: i, offerCode: `O${i}`,
    enabled: true, webOrderEnabled: true, agentPrice: 500 - i }));
  const shown = maxOffers => allowedSiteLinkOffers(offers, { maxOffers, maxOfferPrice: 500 })
    .sort((a, b) => a.agentPrice - b.agentPrice);
  assert.equal(shown(25).length, 25);
  assert.equal(shown(25).some(o => o.id === 25), false);
  assert.equal(shown(100).length, 100);
  assert.equal(shown(10).some(o => o.id === 24), false);
  assert.equal(shown(null).length, 101);
  assert.equal(parseMaxOffers({ maxOffers: 25 }), 25);
  for (const value of [0, -1, 2.5, '25', null]) assert.equal(parseMaxOffers({ maxOffers: value }), 0);
});

test('disabled selections consume slots without destroying saved catalog', () => {
  const catalog = [{ id: 1, webOrderEnabled: true, enabled: false, agentPrice: 10, offerCode: 'A' },
    { id: 2, webOrderEnabled: true, enabled: true, agentPrice: 20, offerCode: 'B' }];
  assert.deepEqual(allowedSiteLinkOffers(catalog, { maxOffers: 1, maxOfferPrice: 500 }), []);
  assert.equal(catalog.length, 2);
});

// Exercise the page's actual refresh handler: lowering a cap must remove a
// previously selected package, and an empty live snapshot must clear stale cards.
test('catalog refresh clears an over-limit checkout selection and stale offers', () => {
  const page = fs.readFileSync(new URL('../order/index.html', import.meta.url), 'utf8');
  const start = page.indexOf('function refreshOfferCatalog()');
  const handler = page.slice(start, page.indexOf('\nfunction buildCategoryTabs', start));
  const context = vm.createContext({ allowedSiteLinkOffers,
    rawOffers: Array.from({ length: 26 }, (_, id) => ({ id, enabled: true, webOrderEnabled: true,
      offerCode: `O${id}`, agentPrice: 20 })), siteLinkConfig: { configured: true, maxOffers: 25, maxOfferPrice: 500 },
    selectedOffer: { id: 24 }, allOffers: [], clearOfferSelection() { this.selectedOffer = null; },
    buildCategoryTabs() {}, renderOffersForCategory() {}, el() { return {}; } });
  // A normal function invoked by page code does not bind a receiver; use the global slot explicitly.
  context.clearOfferSelection = () => { context.selectedOffer = null; };
  vm.runInContext(handler, context);
  context.refreshOfferCatalog();
  assert.equal(context.allOffers.length, 25);
  assert.equal(context.selectedOffer.id, 24);
  context.siteLinkConfig.maxOffers = 10;
  context.refreshOfferCatalog();
  assert.equal(context.selectedOffer, null);
  context.rawOffers = [];
  context.refreshOfferCatalog();
  assert.equal(context.allOffers.length, 0);
});
