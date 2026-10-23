import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  createOrderStatusController,
  createOrderStatusToken,
  isTerminalOrderStatus,
} from '../order/status-controller.mjs';

const orderPage = fs.readFileSync(new URL('../order/index.html', import.meta.url), 'utf8');

test('public checkout subscribes with the browser token before starting the STK request', () => {
  assert.match(orderPage, /doc\(db, "publicOrderStatuses", statusToken\)/);
  assert.match(orderPage, /statusToken,\s*\n\s*\}\)/);
  assert.ok(orderPage.indexOf('orderStatusController.attach(attempt)') < orderPage.indexOf('await fetch(FURL'));
  assert.doesNotMatch(orderPage, /setInterval\(\(\) => \{ pollOrderStatus/);
});

test('hiding the prompt or dismissing a pending result cannot release an unresolved receipt', () => {
  const cancelHandler = orderPage.match(/window\.cancelStkOverlay = function\(\) \{([\s\S]*?)\n\};/)?.[1] || '';
  const submitHandler = orderPage.match(/window\.submitOrder = async function\(\) \{([\s\S]*?)\n\};/)?.[1] || '';
  assert.doesNotMatch(cancelHandler, /resetStkState\(\)/);
  assert.match(cancelHandler, /setPayButtonPending\(\)/);
  assert.match(submitHandler, /hasUnresolvedOrder\(\)/);
});

function createHarness(overrides = {}) {
  const events = [];
  const listeners = new Map();
  const timers = [];
  let unsubscribeCount = 0;
  const controller = createOrderStatusController({
    subscribe: (token, next, error) => {
      listeners.set(token, { next, error });
      return () => { unsubscribeCount += 1; listeners.delete(token); };
    },
    fetchStatus: async () => ({ status: 'pending' }),
    onStatus: (data, attempt, source) => events.push({ data, attempt, source }),
    schedule: (callback, delayMs) => {
      const timer = { callback, delayMs, cancelled: false };
      timers.push(timer);
      return timer;
    },
    cancelSchedule: timer => { timer.cancelled = true; },
    ...overrides,
  });
  return { controller, events, listeners, timers, get unsubscribeCount() { return unsubscribeCount; } };
}

test('creates an unguessable-format status token from secure random bytes', () => {
  const bytes = new Uint8Array(32);
  const token = createOrderStatusToken({ getRandomValues: target => target.set(bytes.map((_, i) => i)) });
  assert.match(token, /^[0-9a-f]{64}$/);
  assert.equal(token.slice(0, 4), '0001');
  assert.equal(isTerminalOrderStatus('COMPLETED'), true);
  assert.equal(isTerminalOrderStatus('payout_failed'), false);
});

test('keeps a callback result delivered before the start response', () => {
  const h = createHarness();
  const attempt = h.controller.beginAttempt('a'.repeat(64));
  h.controller.attach(attempt);
  h.listeners.get(attempt.statusToken).next({ exists: true, data: { status: 'failed', failReason: 'M-Pesa was cancelled.' } });

  h.controller.applyStartResponse(attempt, { txId: 'tx-1', status: 'pending' });

  assert.deepEqual(h.events.map(event => event.data.status), ['failed']);
  assert.equal(attempt.terminal, true);
  assert.equal(h.unsubscribeCount, 1);
  assert.equal(h.listeners.size, 0);
});

test('ignores stale listener and start callbacks after a newer attempt owns the page', () => {
  const h = createHarness();
  const first = h.controller.beginAttempt('a'.repeat(64));
  h.controller.attach(first);
  const staleListener = h.listeners.get(first.statusToken).next;
  const second = h.controller.beginAttempt('b'.repeat(64));
  h.controller.attach(second);

  staleListener({ exists: true, data: { status: 'completed' } });
  h.controller.applyStartResponse(first, { txId: 'old-tx', status: 'failed' });
  h.controller.applyStartResponse(second, { txId: 'new-tx', status: 'pending' });

  assert.deepEqual(h.events.map(event => event.data.status), ['pending']);
  assert.equal(second.txId, 'new-tx');
  assert.equal(first.terminal, false);
});

test('serializes fallback reads and stops them after terminal delivery', async () => {
  let resolveRead;
  let readCount = 0;
  let fallbackTicket = '';
  const h = createHarness({
    fetchStatus: (_txId, statusToken) => {
      fallbackTicket = statusToken;
      readCount += 1;
      return new Promise(resolve => { resolveRead = resolve; });
    },
  });
  const attempt = h.controller.beginAttempt('c'.repeat(64));
  h.controller.attach(attempt);
  h.listeners.get(attempt.statusToken).error(new Error('listener unavailable'));
  h.controller.applyStartResponse(attempt, { txId: 'tx-2' });
  assert.equal(h.timers[0].delayMs, 0);

  const pendingRead = h.timers[0].callback();
  assert.equal(readCount, 1);
  assert.equal(fallbackTicket, attempt.statusToken);
  assert.equal(h.timers.length, 1, 'next read waits for the active request to settle');
  resolveRead({ status: 'completed' });
  await pendingRead;

  assert.equal(attempt.terminal, true);
  assert.equal(h.timers.length, 1, 'terminal status schedules no further fallback');
  assert.equal(h.events.at(-1).source, 'fallback');
});

test('stops fallback immediately for an expired status ticket and keeps the receipt unresolved', async () => {
  const stopped = [];
  const h = createHarness({
    fetchStatus: async () => { throw Object.assign(new Error('private response detail'), { httpStatus: 410 }); },
    onFallbackStopped: (attempt, reason) => stopped.push({ attempt, reason }),
  });
  const attempt = h.controller.beginAttempt('e'.repeat(64));
  h.controller.attach(attempt);
  h.listeners.get(attempt.statusToken).error(new Error('listener unavailable'));
  h.controller.applyStartResponse(attempt, { txId: 'tx-expired' });

  await h.timers[0].callback();

  assert.equal(attempt.fallbackReads, 1);
  assert.equal(attempt.fallbackStopped, true);
  assert.equal(attempt.fallbackStopReason, 'expired');
  assert.equal(attempt.terminal, false);
  assert.equal(stopped[0].reason, 'expired');
  assert.equal(h.timers.length, 1, 'expiry does not schedule another function read');
  assert.match(orderPage, /The secure status ticket expired[\s\S]*Contact the agent before paying again/);
  assert.match(orderPage.match(/window\.submitOrder = async function\(\) \{([\s\S]*?)\n\};/)?.[1] || '', /hasUnresolvedOrder\(\)/);
});

test('caps serialized fallback attempts and reports a friendly recoverable stop', async () => {
  const stopped = [];
  let activeReads = 0;
  let maxActiveReads = 0;
  const h = createHarness({
    fetchStatus: async () => {
      activeReads += 1;
      maxActiveReads = Math.max(maxActiveReads, activeReads);
      await Promise.resolve();
      activeReads -= 1;
      throw Object.assign(new Error('private response detail'), { httpStatus: 503 });
    },
    onFallbackStopped: (attempt, reason) => stopped.push({ attempt, reason }),
  });
  const attempt = h.controller.beginAttempt('f'.repeat(64));
  h.controller.attach(attempt);
  h.listeners.get(attempt.statusToken).error(new Error('listener unavailable'));
  h.controller.applyStartResponse(attempt, { txId: 'tx-bounded' });

  for (let read = 0; read < 12; read += 1) {
    const timer = h.timers[read];
    assert.ok(timer, `fallback attempt ${read + 1} is scheduled`);
    await timer.callback();
  }

  assert.equal(attempt.fallbackReads, 12);
  assert.equal(attempt.fallbackStopped, true);
  assert.equal(stopped[0].reason, 'exhausted');
  assert.equal(maxActiveReads, 1, 'fallback reads never overlap');
  assert.equal(h.timers.length, 12, 'no thirteenth read is scheduled');
  assert.match(orderPage, /We could not reconnect to check the latest order status[\s\S]*do not pay again/);
  assert.match(orderPage, /error\.httpStatus = response\.status/);
  assert.doesNotMatch(orderPage, /onFallbackStopped:\s*\([^)]*error[^)]*\)/);
});

test('suspension detaches the listener and resume reconnects the same token', () => {
  const h = createHarness();
  const attempt = h.controller.beginAttempt('d'.repeat(64));
  h.controller.attach(attempt);
  h.controller.applyStartResponse(attempt, { txId: 'tx-3' });
  h.controller.suspend();
  assert.equal(h.listeners.size, 0);
  h.controller.resume();
  assert.equal(h.listeners.has(attempt.statusToken), true);
});
