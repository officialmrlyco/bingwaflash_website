// Missing config preserves legacy catalogs; an invalid explicit cap admits none.
export function parseMaxOffers(data = {}) {
  if (!Object.prototype.hasOwnProperty.call(data, "maxOffers")) return null;
  return typeof data.maxOffers === "number" && Number.isSafeInteger(data.maxOffers) && data.maxOffers > 0
    ? data.maxOffers : 0;
}

// Match backend admission: reserve SiteLink slots in saved order, then filter
// live availability. Price sorting is presentation only and cannot change slots.
export function allowedSiteLinkOffers(offers, config) {
  const selected = Array.isArray(offers) ? offers.filter(offer => offer?.webOrderEnabled === true) : [];
  const admitted = config.maxOffers == null ? selected : selected.slice(0, config.maxOffers);
  return admitted.filter(offer => offer.enabled === true && String(offer.offerCode || "").trim() &&
    Number(offer.agentPrice) >= 10 && Number(offer.agentPrice) <= config.maxOfferPrice);
}
