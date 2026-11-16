// / Missing config preserves legacy catalogs; an invalid explicit cap admits none.
export function parseMaxOffers(data = {}) {
  if (!Object.prototype.hasOwnProperty.call(data, "maxOffers")) return null;
  return typeof data.maxOffers === "number" && Number.isSafeInteger(data.maxOffers) && data.maxOffers > 0
    ? data.maxOffers : 0;
}

// / Accepts trimmed 24-hour HH:mm (e.g. "06:00", "6:00", "22:30"). Returns total minutes from midnight or null if invalid.
export function parseTimeMinutes(timeStr) {
  if (typeof timeStr !== "string") return null;
  const match = timeStr.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

// / Kenya operates strictly on East Africa Time (EAT, UTC+3) year-round with no Daylight Saving Time.
// / Converts any millisecond timestamp or Date into total minutes from midnight in Kenya Time.
export function getKenyaMinutes(now = Date.now()) {
  const ms = typeof now === "number" ? now : (now instanceof Date ? now.getTime() : Date.now());
  const kenyaDate = new Date(ms + (3 * 60 * 60 * 1000));
  return kenyaDate.getUTCHours() * 60 + kenyaDate.getUTCMinutes();
}

// / Evaluates whether an offer with Auto Time is currently open according to Kenya Time (Africa/Nairobi, UTC+3).
// / Handles both daytime schedules (e.g. 06:00 to 22:00) and overnight schedules (e.g. 20:00 to 06:00).
export function isOfferInAutoTimeWindow(offer, now = Date.now()) {
  if (!offer || offer.autoTimeEnabled !== true) return true;
  const enableMin = parseTimeMinutes(offer.autoEnableTime);
  const disableMin = parseTimeMinutes(offer.autoDisableTime);
  if (enableMin == null || disableMin == null || enableMin === disableMin) return true;

  const currentMin = getKenyaMinutes(now);

  if (enableMin < disableMin) {
    // / Normal daytime schedule (e.g. 06:00 to 22:00):
    return currentMin >= enableMin && currentMin < disableMin;
  } else {
    // / Overnight schedule (e.g. 20:00 to 06:00):
    return currentMin >= enableMin || currentMin < disableMin;
  }
}

// / Checks whether an offer was selected/enrolled for SiteLink by the agent.
export function isOfferWebEnrolled(offer) {
  return offer?.webOrderEnabled === true ||
    (offer?.autoTimeDisabled === true && offer?.autoTimeWebOrderEnabledBeforePause === true);
}

// / Checks whether an offer is active (not manually disabled by the agent).
export function isOfferActive(offer) {
  return offer?.enabled === true || offer?.autoTimeDisabled === true;
}

// / Match backend admission: reserve SiteLink slots in saved order, then filter
// / live availability including Auto Time schedules in Kenya Time (UTC+3). Price sorting
// / is presentation only and cannot change slots.
export function allowedSiteLinkOffers(offers, config, now = Date.now()) {
  const selected = Array.isArray(offers) ? offers.filter(isOfferWebEnrolled) : [];
  const admitted = config?.maxOffers == null ? selected : selected.slice(0, config.maxOffers);
  return admitted.filter(offer =>
    isOfferActive(offer) &&
    isOfferInAutoTimeWindow(offer, now) &&
    String(offer.offerCode || "").trim() &&
    Number(offer.agentPrice) >= 10 && Number(offer.agentPrice) <= (config?.maxOfferPrice ?? 50000)
  );
}
