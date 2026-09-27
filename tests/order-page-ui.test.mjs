import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync(new URL('../order/index.html', import.meta.url), 'utf8');

// Public checkout must use the public mirror. A private Firestore read here is
// denied to customers and can regress into the old endless loading screen.
test('order page has a public-only data path and a boot escape hatch', () => {
  assert.match(page, /doc\(db, "publicAgents", username\)/);
  assert.doesNotMatch(page, /doc\(db, "agents",/);
  assert.match(page, /agentProfile\?\.phoneNumber/);
  assert.doesNotMatch(page, /agentProfile\?\.siteLinkContactPhone/);
  assert.match(page, /__orderBootTimer = setTimeout/);
  assert.match(page, /window\.retryOrderPage/);
  assert.match(page, /withTimeout\(getDoc/);
});

// These labels are customer-facing contract text: they explain the handoff
// without claiming that a payment confirmation means product execution.
test('order page explains the handoff and uses bottom-sheet overlays', () => {
  assert.match(page, /Choose what you want to receive/);
  assert.match(page, /Agent receives it/);
  assert.match(page, /border-radius: 24px 24px 0 0/);
  assert.match(page, /class="toast-region"/);
  assert.doesNotMatch(page, /window\.alert\(/);
});

// Offer cards must balance in a rigid 50/50 two-column grid on desktop,
// branching long titles into 2 lines rather than blowing out column width.
test('offer cards enforce 50/50 column grid and branch long titles across lines', () => {
  assert.match(page, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(page, /-webkit-line-clamp:\s*2/);
  assert.match(page, /line-clamp:\s*2/);
  assert.match(page, /overflow-wrap:\s*break-word/);
});
