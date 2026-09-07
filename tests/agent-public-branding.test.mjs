import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const orderPage = fs.readFileSync(new URL('../order/index.html', import.meta.url), 'utf8');
const clientsPage = fs.readFileSync(new URL('../clients/index.html', import.meta.url), 'utf8');

// Public pages may brand themselves only from the agent profile already allowed
// on the page. A malformed or untrusted avatar must leave the platform favicon.
test('agent order and client pages safely apply public profile branding', () => {
  for (const page of [orderPage, clientsPage]) {
    assert.match(page, /id="agent-favicon"/);
    assert.match(page, /function isApprovedAgentAvatarUrl/);
    assert.match(page, /function applyAgentPageBranding/);
    assert.match(page, /document\.title = safeBusinessName/);
    assert.match(page, /favicon\.href = ['"]\/logo\.png['"]/);
    assert.match(page, /applyAgentPageBranding\(businessName, agentProfile\.profileImageUrl\)/);
  }
});

// Keep this CSS in the stylesheet block. A selector inside the module script
// prevents every client-page action from loading in the browser.
test('client avatar image CSS is not emitted into the JavaScript module', () => {
  const moduleStart = clientsPage.indexOf('<script type="module">');
  const moduleEnd = clientsPage.indexOf('</script>', moduleStart);
  const moduleSource = clientsPage.slice(moduleStart, moduleEnd);
  assert.doesNotMatch(moduleSource, /^\.ag-avatar-circle img/m);
});
