import test from 'node:test';
import assert from 'node:assert/strict';
import { isPubliclyVerifiedAgent, publicVerifiedBadgeColor, showCurrentVerificationBadge } from '../verified-agent.mjs';

const now = 1_800_000_000_000;
const futureTimestamp = (millis) => ({ toMillis: () => millis });

// Public color inputs are normalized to the same small palette as native and Panel.
test('badge color trims and lowercases recognized values and safely defaults unknown values', () => {
  // / note: Every public swatch must match the same native/Panel palette, not merely accept its name.
  for (const [name, hex] of Object.entries({blue: '#1565C0', green: '#2E7D32', red: '#D32F2F', yellow: '#F9A825', pink: '#D81B60', purple: '#8E24AA'})) {
    assert.equal(publicVerifiedBadgeColor({verifiedBadgeColor: name}), hex);
  }
  assert.equal(publicVerifiedBadgeColor({ verifiedBadgeColor: ' PINK ' }), '#D81B60');
  assert.equal(publicVerifiedBadgeColor({ verifiedBadgeColor: 'Purple' }), '#8E24AA');
  assert.equal(publicVerifiedBadgeColor({ verifiedBadgeColor: 'url(javascript:alert(1))' }), '#1565C0');
  assert.equal(publicVerifiedBadgeColor({}), '#1565C0');
});

// Public badge policy requires fresh verification and any currently active SiteLink subscription.
test('verified badge requires unexpired verification and at least one live subscription', () => {
  const profile = {
    isVerified: true,
    verificationExpiresAt: futureTimestamp(now + 10_000),
    siteLinkSmsSubscriptionUntil: futureTimestamp(now - 1),
    siteLinkServerSubscriptionUntil: futureTimestamp(now + 1),
  };
  assert.equal(isPubliclyVerifiedAgent(profile, now), true);
  assert.equal(isPubliclyVerifiedAgent({ ...profile, siteLinkServerSubscriptionUntil: now }, now), false);
  assert.equal(isPubliclyVerifiedAgent({ ...profile, verificationExpiresAt: now }, now), false);
  assert.equal(isPubliclyVerifiedAgent({ ...profile, isVerified: false }, now), false);
});

// Old public profiles without an explicit verification expiry stay unverified even with active plans.
test('legacy profiles missing verification expiry are unverified', () => {
  assert.equal(isPubliclyVerifiedAgent({
    isVerified: true,
    siteLinkSmsSubscriptionUntil: futureTimestamp(now + 1),
  }, now), false);
});

// Firestore Timestamp objects and Date values are accepted for subscription expiries.
test('accepts Firestore timestamps and Date objects', () => {
  assert.equal(isPubliclyVerifiedAgent({
    isVerified: true,
    verificationExpiresAt: new Date(now + 10),
    webOrderSubscriptionUntil: futureTimestamp(now + 10),
  }, now), true);
});

// / note: A colour-only listener update must repaint both icon and text on an already-open public page.
test('live badge repaints purple then default blue without changing eligibility', (t) => {
  t.mock.method(globalThis, 'setTimeout', () => 1);
  t.mock.method(globalThis, 'clearTimeout', () => {});
  const profile = {isVerified: true, verificationExpiresAt: Date.now() + 60_000,
    siteLinkServerSubscriptionUntil: Date.now() + 60_000, verifiedBadgeColor: 'purple'};
  const badge = {style: {}}, note = {style: {}};
  showCurrentVerificationBadge(profile, badge, note);
  assert.equal(badge.style.color, '#8E24AA');
  assert.equal(note.style.color, '#8E24AA');
  assert.equal(badge.style.display, 'inline-block');
  showCurrentVerificationBadge({...profile, verifiedBadgeColor: 'blue'}, badge, note);
  assert.equal(badge.style.color, '#1565C0');
  assert.equal(note.style.color, '#1565C0');
  showCurrentVerificationBadge({...profile, isVerified: false}, badge, note);
  assert.equal(badge.style.display, 'none');
  assert.equal(note.style.display, 'none');
});
