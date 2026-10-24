import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createOrderStatusController } from '../order/status-controller.mjs';

const page = fs.readFileSync(new URL('../order/index.html', import.meta.url), 'utf8');

// / Execute the page's actual submit/render functions with a held network reply.
// / This catches phase and overlay races that string checks alone cannot detect.
function createPageHarness() {
  const elements = new Map();
  const results = [];
  const stored = new Map();
  let listener;
  let resolveStart;
  let rejectStart;
  let requests = 0;
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      style: {}, textContent: '', value: '0712345678', disabled: false,
      querySelector: () => element(`${id}-label`),
    });
    return elements.get(id);
  };
  const context = vm.createContext({
    window: {}, el: element, selectedOffer: { agentPrice: 10, name: 'Bundle', offerCode: 'code' },
    agentProfile: { uid: 'agent', username: 'agent', phoneNumber: '0712345678' },
    activeStatusAttempt: null, orderPageSuspended: false, pendingDialogShownForTx: '',
    ORDER_RECEIPT_STORAGE_KEY: 'receipt', FURL: 'https://test.invalid/start',
    localPhone: value => value, agentPaymentInfo: () => null,
    createOrderStatusToken: () => 'a'.repeat(64),
    sessionStorage: { setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) },
    showToast: () => {}, setPayButtonLabel: () => {}, showMaintenance: () => {},
    showResultDialog: (...args) => results.push(args),
    fetch: () => {
      requests += 1;
      return new Promise((resolve, reject) => { resolveStart = resolve; rejectStart = reject; });
    },
  });
  const controller = createOrderStatusController({
    subscribe: (_token, next) => { listener = next; return () => {}; },
    fetchStatus: async () => { throw new Error('Healthy streams must not poll'); },
    onStatus: (data, attempt) => {
      if (context.activeStatusAttempt === attempt) context.renderOrderStatus(attempt.statusToken, data);
    },
  });
  context.orderStatusController = controller;
  // / These boundaries contain ordinary page functions and no Firebase boot or real payment IO.
  const helpers = page.slice(page.indexOf('function norm(p)'), page.indexOf('function clearOfferSelection()'));
  const render = page.slice(page.indexOf('function formatAgentDeliveryContact('), page.indexOf('function resumeSavedOrderStatus()'));
  const submit = page.slice(page.indexOf('window.submitOrder = async function()'), page.indexOf('window.closeResultDialog = function()'));
  vm.runInContext(`${helpers}\n${render}\n${submit}`, context);
  return {
    context, element, results, stored,
    notify: data => listener({ exists: true, data }),
    reply: (data = { txId: 'tx-1' }, status = 200) => resolveStart({ ok: status < 400, status, json: async () => data }),
    reject: () => rejectStart(new Error('Lost acknowledgement')),
    get requests() { return requests; },
  };
}

test('checkout shows initiation until dispatch, then PIN entry and an immediate callback result', async () => {
  const h = createPageHarness();
  const pending = h.context.window.submitOrder();
  assert.equal(h.element('stk-title').textContent, 'Initiating payment...');
  assert.doesNotMatch(h.element('stk-status-message').textContent, /enter|approve/i);
  h.notify({ status: 'initiating' });
  h.notify({ status: 'pending' });
  assert.equal(h.element('stk-title').textContent, 'Enter your M-Pesa PIN');
  assert.match(h.element('stk-status-message').textContent, /STK push you'll receive/);
  h.notify({ status: 'failed', failReason: 'Incorrect M-Pesa PIN.' });
  assert.equal(h.results.at(-1)[2], 'Incorrect M-Pesa PIN.');
  assert.equal(h.element('stk-screen').style.display, 'none');
  h.reply();
  await pending;
  assert.equal(h.results.length, 1, 'late HTTP reply cannot cover the callback result');
  assert.equal(h.element('stk-screen').style.display, 'none');
});

test('successful older start responses advance initiation even without a status field', async () => {
  const h = createPageHarness();
  const pending = h.context.window.submitOrder();
  h.notify({ status: 'initiating' });
  h.reply();
  await pending;
  assert.equal(h.element('stk-title').textContent, 'Enter your M-Pesa PIN');
  assert.equal(h.element('pay-btn').disabled, true);
});

test('hiding instructions does not reopen them or allow a duplicate payment when dispatch arrives', async () => {
  const h = createPageHarness();
  const pending = h.context.window.submitOrder();
  h.context.window.cancelStkOverlay();
  h.notify({ status: 'pending' });
  h.reply();
  await pending;
  await h.context.window.submitOrder();
  assert.equal(h.element('stk-screen').style.display, 'none');
  assert.equal(h.requests, 1);
  assert.ok(h.stored.has('receipt'));
});

// / Money is already confirmed here, although delivery remains nonterminal.
// / Neither a rejected nor a missing start reply may replace the live handoff UI.
for (const lateReply of ['error', 'lost', 'missing-reference']) {
  test(`confirmed handoff stays visible after a ${lateReply} start response`, async () => {
    const h = createPageHarness();
    const pending = h.context.window.submitOrder();
    h.notify({ status: 'waiting_for_agent' });
    assert.equal(h.results.at(-1)[1], 'Sending to Agent');
    if (lateReply === 'lost') h.reject();
    else h.reply(lateReply === 'error' ? { error: 'Late error' } : {}, lateReply === 'error' ? 503 : 200);
    await pending;
    assert.equal(h.results.length, 1);
    assert.equal(h.element('stk-screen').style.display, 'none');
    assert.ok(h.stored.has('receipt'));
  });
}
