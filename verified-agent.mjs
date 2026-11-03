// Keep public verification tied to both the approved review and a live SiteLink entitlement.
// / note: Public color is presentation only; this allowlist cannot make an unverified or expired profile display a badge.
const VERIFIED_BADGE_PALETTE = Object.freeze({
  // / note: Blue remains the legacy default and is selectable alongside every custom badge colour.
  blue: "#1565C0",
  green: "#2E7D32",
  red: "#D32F2F",
  yellow: "#F9A825",
  pink: "#D81B60",
  purple: "#8E24AA",
});

export function publicVerifiedBadgeColor(profile) {
  const requested = profile?.verifiedBadgeColor;
  // / Align legacy profile normalization with native/Panel while retaining a strict palette allowlist.
  const normalized = typeof requested === "string" ? requested.trim().toLowerCase() : "";
  const colorName = Object.prototype.hasOwnProperty.call(VERIFIED_BADGE_PALETTE, normalized)
    ? normalized
    : "blue";
  return VERIFIED_BADGE_PALETTE[colorName];
}

function timestampMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  return 0;
}

// Legacy profiles without explicit expiries fail closed until backend approval publishes them.
export function isPubliclyVerifiedAgent(profile, now = Date.now()) {
  if (!profile || profile.isVerified !== true) return false;
  const verificationUntil = timestampMillis(profile.verificationExpiresAt);
  const hasLiveSubscription = [
    profile.siteLinkSmsSubscriptionUntil,
    profile.siteLinkServerSubscriptionUntil,
    profile.webOrderSubscriptionUntil,
  ].some((expiry) => timestampMillis(expiry) > now);
  return verificationUntil > now && hasLiveSubscription;
}

// Recheck at the next expiry so an already-open public page drops a stale badge automatically.
const badgeTimers = new WeakMap();
export function showCurrentVerificationBadge(profile, badge, note) {
  clearTimeout(badgeTimers.get(badge));
  const update = () => {
    const now = Date.now();
    const verified = isPubliclyVerifiedAgent(profile, now);
    const badgeColor = publicVerifiedBadgeColor(profile);
    // / note: Both the icon and its text label take the same safe, canonical color only after the normal expiry checks pass.
    if (verified) {
      badge.style.color = badgeColor;
      note.style.color = badgeColor;
    }
    badge.style.display = verified ? "inline-block" : "none";
    note.style.display = verified ? "inline" : "none";

    const expiries = [
      profile?.verificationExpiresAt,
      profile?.siteLinkSmsSubscriptionUntil,
      profile?.siteLinkServerSubscriptionUntil,
      profile?.webOrderSubscriptionUntil,
    ].map(timestampMillis).filter((expiry) => expiry > now);
    if (expiries.length) {
      const delay = Math.min(Math.min(...expiries) - now + 1, 2_147_000_000);
      badgeTimers.set(badge, setTimeout(update, delay));
    }
  };
  update();
}
