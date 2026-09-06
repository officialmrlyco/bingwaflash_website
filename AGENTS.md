# BingwaFlash public website handoff

## Profile avatars (2026-09-06)

- Order and Clients render a public avatar only from the approved HTTPS host, otherwise initials remain visible. Avatar URLs are immutable and browser-cacheable; do not add a duplicate image store.

Read the parent workspace AGENTS.md first. This repository is the existing GitHub Pages site at bingwaflash.co.ke, published from main root. Preserve that hosting owner and domain; do not migrate it to another host as part of a website fix.

## SiteLink live checkout health (2026-09-06)

- The order page snapshot-listens to `config/sitelink` and the selected public agent. Offer eligibility is KES 10 through the live `maxOfferPrice`; missing or invalid config fails closed instead of falling back to a hardcoded ceiling.
- Pause checkout before STK when the selected entitlement is invalid, Server capacity is full, or SiteLink health is paused. Show the customer-friendly problem message and the agent-owned `siteLinkContactPhone` when present, using text nodes rather than HTML interpolation.
- Customer progress distinguishes payment pending, waiting for agent, received by agent, payout processing, and completed. Payment or Server acknowledgement must never be described as product execution.
- Keep formatted phone entry, autofill semantics, light/dark behavior, and the existing responsive structure when changing SiteLink checks.

## Public order loading and checkout clarity (2026-09-06)

- The public order page must read the publicAgents mirror only. Do not add unauthenticated reads of private agents or agents/meta/offers documents: Firestore correctly denies those reads and the customer can be left on an indefinite loading state.
- The order page has a non-module 15-second boot fallback with a retry action, plus named loading steps (agent, availability, packages). Keep this fallback when changing module imports so a parse/import/network failure becomes a clear customer message.
- Checkout overlays are bottom sheets with a drag handle on mobile and desktop. Validation/payment failures use the shared bottom toast as well as the inline form message; do not use browser alert dialogs.

## Profile names and checkout (2026-09-04)

- Order and clients pages import the same `profile-names.mjs` policy with a version query. Clean old private/public profiles and client-registration snapshots before displaying agent/business names. Agent names are at most 10 codepoints; business names at most 20; emoji components are removed while Unicode names and ordinary punctuation survive. Keep existing username identifiers intact for links and database lookups.
- Checkout phone fields must retain their actual form, name, linked label, and separate telephone autocomplete sections. Accept saved numbers with spaces, brackets, dashes, or +254 through `order/phone-input.mjs`, then validate before payment. Never cap formatted raw input to 10 characters or silently salvage letters/foreign numbers.
- The form suppresses fallback navigation and handles a real submit event; duplicate submissions while sending are ignored. Do not restore click-only submission or persist customer phone history in local storage for autocomplete.
- Registration list names are text nodes, not HTML interpolation or inline handlers. Keep registration identity and remove actions on the original document IDs.
- `node --test tests/profile-and-phone.test.mjs` covers normalization, emoji sequences, codepoint limits and unchanged legacy handles. Browser checks with intercepted data/payment requests passed at 390px and 1365px in light/dark. Actual Chrome/Android suggestion chips remain a device acceptance check; no real payment was used.
