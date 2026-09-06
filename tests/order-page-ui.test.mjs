import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync(new URL('../order/index.html', import.meta.url), 'utf8');

// Public checkout must use the public mirror. A private Firestore read here is
// denied to customers and can regress into the old endless loading screen.
test('order page has a public-only data path and a boot escape hatch', () => {
  assert.match(page, /doc\(db, "publicAgents", username\)/);
  assert.doesNotMatch(page, /doc\(db, "agents",/);
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
