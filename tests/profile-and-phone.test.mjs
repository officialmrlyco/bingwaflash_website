import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanAgentProfile, cleanDisplayName } from '../profile-names.mjs';
import { localPhone } from '../order/phone-input.mjs';

// Cover actual saved-contact formats and reject values that could pay the wrong phone.
test('saved Kenyan phone formats normalize without truncation', () => {
  for (const value of ['0712345678', '0712 345 678', '+254 712 345 678', '254712345678', '(0712) 345-678']) {
    assert.equal(localPhone(value), '0712345678');
  }
  assert.equal(localPhone('+254 112 345 678'), '0112345678');
  for (const value of ['', '07123456789', '+255712345678', 'abc0712345678', '0712/345678', '+0712345678']) {
    assert.equal(localPhone(value), '');
  }
});

// Old public mirrors and registration snapshots need the same cleanup as new profiles.
test('legacy emoji components are removed while readable names survive', () => {
  assert.equal(cleanDisplayName('Joe 👨‍👩‍👧‍👦 🇰🇪 🔥', 10), 'Joe');
  assert.equal(cleanDisplayName('Cafe\u0301 & Sons™ ✅', 20), 'Café & Sons');
  assert.equal(cleanDisplayName('Shop 1️⃣', 20), 'Shop 1');
  assert.equal(cleanDisplayName("O'Neil", 10), "O'Neil");
  assert.equal(cleanDisplayName('中文名字', 10), '中文名字');
  assert.equal(cleanDisplayName('abcdefghijklmnop', 10), 'abcdefghij');
  assert.equal(cleanDisplayName('abcdefghijklmnopqrstuvwxyz', 20), 'abcdefghijklmnopqrst');
});

test('legacy username keys remain unchanged and emoji-only names have a fallback', () => {
  const profile = cleanAgentProfile({ agentName: '🔥', businessName: '🎉', username: 'old-agent-link-long' });
  assert.equal(profile.username, 'old-agent-link-long');
  assert.equal(profile.agentName, 'old-agent-');
  assert.equal(profile.businessName, profile.agentName);
  assert.equal(cleanAgentProfile({ agentName: '🔥' }).agentName, 'Agent');
});
