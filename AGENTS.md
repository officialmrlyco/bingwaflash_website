# BingwaFlash public website handoff

## LYCO TECHNOLOGIES product ownership (2026-09-12)

- Bingwa Flash is owned and designed by LYCO TECHNOLOGIES. Every visible public Bingwa Flash footer must use the exact linked credit: `© 2026 Bingwa Flash. All rights reserved. Made and Designed by LYCO TECHNOLOGIES.` The LYCO TECHNOLOGIES text links to `https://lycotechnologies.co.ke/`.
- Airtime Recharge Scanner is the exception: its own footer says `© 2026 Airtime Recharge Scanner. All rights reserved. Made and Designed by LYCO TECHNOLOGIES.` Keep the scanner's product identity and package name intact.
- Keep the parent-company credit product-first: it belongs in the footer and must not replace Bingwa Flash support, legal, or checkout identity. `privacy.html` and `terms.html` each need an opening `<script>` tag before the table-of-contents listener; a closing tag without it renders the source JavaScript at the bottom of the legal page.

## Profile avatars (2026-09-06)

- Order and Clients render a public avatar only from the approved HTTPS host, otherwise initials remain visible. Avatar URLs are immutable and browser-cacheable; do not add a duplicate image store.
- Once the public profile loads, Order and Clients use its business name for the browser title and visible header. Their favicon may switch only after an approved avatar URL has loaded; without one, retain `/logo.png`. Keep this branding public-data-only.

## Order and Clients agent portrait sizing (2026-09-27)

- Keep `.ag-avatar-circle` at the same responsive size on both public pages: `clamp(76px, 6vw, 88px)`. The larger portrait helps customers recognize the agent while the max size preserves the centered profile card layout on wide screens.
- Keep the existing circular crop, approved-avatar URL gate, and initials fallback unchanged when adjusting portrait presentation.

Read the parent workspace AGENTS.md first. This repository is the public source for bingwaflash.co.ke. It is deployed from `main` to Cloudflare Workers Static Assets using Cloudflare Workers Builds; GitHub remains the publishing source, but customer requests must never fetch HTML from GitHub's API. Preserve the domain and Firebase backend ownership.

## Cloudflare static site delivery (2026-09-18)

- `wrangler.jsonc` deploys the complete public site as static edge assets under the existing `bingwaflash-site-share` Worker. Static paths are free/unlimited and bypass Worker code; only `/order*` and `/clients*` invoke `cloudflare-worker/src/index.ts` for share metadata.
- The Worker must use `env.ASSETS.fetch()` as its page source. Do not restore a runtime GitHub Contents API fetch or return a provider error body as HTML. If public-brand metadata lookup fails, return the unmodified static page.
- `.assetsignore` prevents repository, test, workflow, notes, and Worker-source files from becoming public URLs. Update it whenever a non-public source folder is added at the website root.
- Use Cloudflare Workers Builds to connect this repository to the existing `bingwaflash-site-share` Worker with `main` as the production branch. Cloudflare creates and retains its deployment credential internally; do not add a Cloudflare API token, account ID, or any other deployment secret to this repository or GitHub Actions.

## SiteLink live checkout health (2026-09-06)

- The order page snapshot-listens to `config/sitelink` and the selected public agent. Offer eligibility is KES 10 through the live `maxOfferPrice`; missing or invalid config fails closed instead of falling back to a hardcoded ceiling.
- Pause checkout before STK when the selected entitlement is invalid, Server capacity is full, SiteLink health is paused, or Agent Profile has no valid phone. Show the customer-friendly problem message with the public Agent Profile `phoneNumber`, using text nodes rather than HTML interpolation; do not restore a separate SiteLink contact.
- Customer progress distinguishes payment pending, waiting for agent, received by agent, payout processing, and completed. Payment or Server acknowledgement must never be described as product execution.
- Once Server receipt is confirmed, present the customer with a green `Order Received` outcome: payment is complete, the phone saved the order, payout started, and the customer now waits for delivery. The optional Agent Profile phone is supplied by `getOrderStatus` from the checkout-time verified contact; omit it safely on old transactions. Do not call offer execution complete.
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
## Release metadata (2026-09-07)

- `version.json` mirrors Bingwa Flash v1.3.9 (Build 39) for website compatibility. The Android app update prompt remains owned by Firestore `config/version_update`; keep both records aligned when publishing a release.
- The immutable v39 APK is `BingwaFlash_v1.3.9.apk`, 16,181,210 bytes, SHA-256 `68f9782c5d9702f1c295afcfe9eb7b254f980ccbe573c8dcd48d775cf0fc78bc`.

## Public username fallback routing (2026-09-15)

- GitHub Pages sends root username URLs to `404.html`. Its route gate must forward dot and underscore usernames, plus safe legacy hyphen routes, to `/order/?u=...`; do not limit it to underscore-only handles. Keep path separators and leading/trailing punctuation rejected so a route cannot resolve to a different path or account.
