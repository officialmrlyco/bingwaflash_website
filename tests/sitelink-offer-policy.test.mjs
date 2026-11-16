import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {
  parseMaxOffers,
  allowedSiteLinkOffers,
  isOfferInAutoTimeWindow,
  getKenyaMinutes,
  parseTimeMinutes,
} from '../order/sitelink-offer-policy.mjs';

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

test('Kenya time conversion correctly adds UTC+3 without DST', () => {
  // 00:00 UTC is 03:00 EAT (180 minutes)
  const utcMidnight = Date.UTC(2026, 10, 5, 0, 0, 0);
  assert.equal(getKenyaMinutes(utcMidnight), 180);

  // 15:30 UTC is 18:30 EAT (18*60 + 30 = 1110 minutes)
  const utc1530 = Date.UTC(2026, 10, 5, 15, 30, 0);
  assert.equal(getKenyaMinutes(utc1530), 1110);

  // 21:00 UTC is 00:00 EAT next day (0 minutes)
  const utc2100 = Date.UTC(2026, 10, 5, 21, 0, 0);
  assert.equal(getKenyaMinutes(utc2100), 0);
});

test('daytime Auto Time schedule shows offer during open hours and hides outside', () => {
  const offer = {
    id: 'daytime',
    offerCode: 'D1',
    enabled: true,
    webOrderEnabled: true,
    agentPrice: 50,
    autoTimeEnabled: true,
    autoEnableTime: '06:00',
    autoDisableTime: '18:00',
  };
  const config = { maxOffers: 25, maxOfferPrice: 500 };

  // 02:59 UTC = 05:59 EAT (before 06:00) -> Closed
  const before6am = Date.UTC(2026, 10, 5, 2, 59, 0);
  assert.equal(isOfferInAutoTimeWindow(offer, before6am), false);
  assert.equal(allowedSiteLinkOffers([offer], config, before6am).length, 0);

  // 03:00 UTC = 06:00 EAT (exact enable time) -> Open
  const at6am = Date.UTC(2026, 10, 5, 3, 0, 0);
  assert.equal(isOfferInAutoTimeWindow(offer, at6am), true);
  assert.equal(allowedSiteLinkOffers([offer], config, at6am).length, 1);

  // 09:00 UTC = 12:00 EAT (noon) -> Open
  const atNoon = Date.UTC(2026, 10, 5, 9, 0, 0);
  assert.equal(isOfferInAutoTimeWindow(offer, atNoon), true);
  assert.equal(allowedSiteLinkOffers([offer], config, atNoon).length, 1);

  // 14:59 UTC = 17:59 EAT (one minute before 18:00) -> Open
  const at1759 = Date.UTC(2026, 10, 5, 14, 59, 0);
  assert.equal(isOfferInAutoTimeWindow(offer, at1759), true);
  assert.equal(allowedSiteLinkOffers([offer], config, at1759).length, 1);

  // 15:00 UTC = 18:00 EAT (exact disable time) -> Closed
  const at1800 = Date.UTC(2026, 10, 5, 15, 0, 0);
  assert.equal(isOfferInAutoTimeWindow(offer, at1800), false);
  assert.equal(allowedSiteLinkOffers([offer], config, at1800).length, 0);

  // 15:01 UTC = 18:01 EAT (one minute after 18:00) -> Closed, does not show
  const at1801 = Date.UTC(2026, 10, 5, 15, 1, 0);
  assert.equal(isOfferInAutoTimeWindow(offer, at1801), false);
  assert.equal(allowedSiteLinkOffers([offer], config, at1801).length, 0);
});

test('overnight Auto Time schedule spans midnight correctly', () => {
  const nightOffer = {
    id: 'night',
    offerCode: 'N1',
    enabled: true,
    webOrderEnabled: true,
    agentPrice: 100,
    autoTimeEnabled: true,
    autoEnableTime: '20:00',
    autoDisableTime: '06:00',
  };
  const config = { maxOffers: 25, maxOfferPrice: 500 };

  // 16:59 UTC = 19:59 EAT -> Closed
  const at1959 = Date.UTC(2026, 10, 5, 16, 59, 0);
  assert.equal(isOfferInAutoTimeWindow(nightOffer, at1959), false);
  assert.equal(allowedSiteLinkOffers([nightOffer], config, at1959).length, 0);

  // 17:00 UTC = 20:00 EAT -> Open
  const at2000 = Date.UTC(2026, 10, 5, 17, 0, 0);
  assert.equal(isOfferInAutoTimeWindow(nightOffer, at2000), true);
  assert.equal(allowedSiteLinkOffers([nightOffer], config, at2000).length, 1);

  // 23:00 UTC = 02:00 EAT (next day) -> Open
  const at0200 = Date.UTC(2026, 10, 5, 23, 0, 0);
  assert.equal(isOfferInAutoTimeWindow(nightOffer, at0200), true);
  assert.equal(allowedSiteLinkOffers([nightOffer], config, at0200).length, 1);

  // 02:59 UTC = 05:59 EAT (morning before 06:00) -> Open
  const at0559 = Date.UTC(2026, 10, 5, 2, 59, 0);
  assert.equal(isOfferInAutoTimeWindow(nightOffer, at0559), true);
  assert.equal(allowedSiteLinkOffers([nightOffer], config, at0559).length, 1);

  // 03:00 UTC = 06:00 EAT -> Closed
  const at0600 = Date.UTC(2026, 10, 5, 3, 0, 0);
  assert.equal(isOfferInAutoTimeWindow(nightOffer, at0600), false);
  assert.equal(allowedSiteLinkOffers([nightOffer], config, at0600).length, 0);
});

test('autoTimeDisabled with autoTimeWebOrderEnabledBeforePause is admitted when in window', () => {
  // Offer paused locally by Android phone but configured for SiteLink
  const pausedOffer = {
    id: 'paused-from-phone',
    offerCode: 'P1',
    enabled: false,
    autoTimeDisabled: true,
    webOrderEnabled: false,
    autoTimeWebOrderEnabledBeforePause: true,
    agentPrice: 50,
    autoTimeEnabled: true,
    autoEnableTime: '06:00',
    autoDisableTime: '22:00',
  };
  const config = { maxOffers: 25, maxOfferPrice: 500 };

  // At 10:00 EAT (07:00 UTC): admitted dynamically without waiting for phone to wake up
  const at10am = Date.UTC(2026, 10, 5, 7, 0, 0);
  assert.equal(allowedSiteLinkOffers([pausedOffer], config, at10am).length, 1);

  // At 23:00 EAT (20:00 UTC): excluded
  const at11pm = Date.UTC(2026, 10, 5, 20, 0, 0);
  assert.equal(allowedSiteLinkOffers([pausedOffer], config, at11pm).length, 0);
});

test('manually disabled offer remains excluded regardless of time', () => {
  const manualOff = {
    id: 'manual-off',
    offerCode: 'M1',
    enabled: false,
    autoTimeDisabled: false,
    webOrderEnabled: true,
    agentPrice: 50,
    autoTimeEnabled: true,
    autoEnableTime: '06:00',
    autoDisableTime: '22:00',
  };
  const at10am = Date.UTC(2026, 10, 5, 7, 0, 0);
  assert.equal(allowedSiteLinkOffers([manualOff], { maxOffers: 25, maxOfferPrice: 500 }, at10am).length, 0);
});
