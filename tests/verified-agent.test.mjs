import test from 'node:test';
import assert from 'node:assert/strict';
import { isPubliclyVerifiedAgent } from '../verified-agent.mjs';

const now = 1_800_000_000_000;
const futureTimestamp = (millis) => ({ toMillis: () => millis });

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
