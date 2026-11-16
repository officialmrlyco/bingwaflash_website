## Vendora Public Website & Auth Redesign: Modern Layout & Visual Elevation (2026-11-02)

- Redesigned and refactored the Vendora public website (`myvendora.co.ke`), `/auth`, and all subpages (`VendoraWeb/policy/index.html`, `VendoraWeb/terms/index.html`, `VendoraWeb/privacy.html`), adhering to modern executive landing page architecture inspired by `home.bingwastore.com` while maintaining Vendora's signature brand blue palette (`#2563eb`, `#1d4ed8`, `#060b17`, `#0b1329`).
- Scope of improvements:
  1. *Cohesive Executive Royal Navy Dark Theme (`styles.css`)*:
     - Eliminated jarring contrast between hero and body by transitioning the entire site to a unified, luxurious dark royal navy palette (`--color-background-primary: #060b17`, `--color-background-secondary: #0b1329`, `--color-surface-card: #0d162f`, `--color-border-tertiary: #182649`).
     - Modern fintech typography with Google Fonts `DM Sans` (primary UI) and `IBM Plex Mono` (USSD execution logs & telemetry badges), matching `home.bingwastore.com`.
     - Preserves full optional `data-theme="light"` capabilities.
  2. *Sticky Header & Navigation (`styles.css`, `index.html`)*:
     - Frosted glass sticky header (`backdrop-filter: blur(16px)`), crisp brand mark, desktop navigation links, direct "Get Vendora" CTA button, and responsive mobile hamburger drawer with smooth open/close transitions.
  3. *Hero Section & Live Telemetry (`styles.css`, `index.html`)*:
     - High-impact dark royal navy background with ambient blue radial gradient orb (`radial-gradient(ellipse at 50% -15%, rgba(37, 99, 235, 0.38)...)`).
     - Pill eyebrow badge: `"✦ BUILT FOR KENYAN AIRTIME MERCHANTS"`.
     - Bold headline with italic gradient emphasis on `Automation` (`linear-gradient(135deg, #60a5fa 10%, #3b82f6 60%, #93c5fd 100%)`).
     - Dual CTA buttons (`Download Vendora` + `How it works`), telemetry pills, and 4-column live telemetry stat strip (`< 1s` SMS Intake, `Dual SIM` Safaricom/Airtel/Telkom, `100% On-Device`, `5 Profiles`).
  4. *Quick Navigation Category Cards (`.quick-links`)*:
     - 6 tactile squircle cards strictly preserving the test regex `assert.match(styles,/\.quick-links a\{[^}]*border-radius:13px/)` and destination targets (`#how-it-works`, `#features`, `#help`, `#download`, `#contact`, `/policy`).
  5. *How It Works & Interactive Real-Time USSD Terminal (`#how-it-works`, `app.mjs`)*:
     - Numbered 4-step walkthrough with blue circular badges.
     - Interactive 2-column split layout featuring real-time terminal simulation with live tabs (`Till to Till`, `Number to Till`, `Number to PayBill`, `Quick Dial`), terminal console output, and real-time signature matching status.
  6. *Interactive Execution Modes Showcase (`#modes`, `app.mjs`, `styles.css`)*:
     - Segmented tab bar (`Till to Till`, `Number to Till`, `Number to PayBill`, `Manual Quick Dial`).
     - Tab panels with execution details, SIM slot routing, and monospace flow code boxes.
  7. *Comprehensive 9-Card Feature Grid (`.feature-grid`)*:
     - 3-column responsive grid (2-col on tablet <=1000px, 1-col on mobile <=700px) strictly preserving `public-model.test.mjs` assertions.
     - Details: 01 Payments SMS Intake, 02 SIM & USSD Workflows, 03 Customer Records, 04 Business Reporting, 05 Dual-SIM Carrier Routing, 06 Scratch Card OCR & Inventory, 07 5 Isolated Merchant Profiles, 08 Runs, Time & Encrypted Unit Backups, 09 Durable Carrier Response History.
  8. *Merchant Personas & Craftsmanship Gallery (`#gallery`, `assets/images/`)*:
     - 4-card merchant audience grid (`.audience-grid`).
     - Added 5 compressed images from `LycoTechnologies` (all <200KB, zero 5MB images!): `lyco-development-session.jpg`, `lyco-design-review.jpg`, `lyco-product-planning.jpg`, `lyco-team-meeting.jpg`, `lyco-workshop.jpg`.
     - Displays the core automation engineering, UX reviews, offline architecture, and field testing behind Vendora.
  9. *Merchant Websites & Official Releases (`#websites`, `#download`)*:
     - Clear custom domain steps (Own domain, Request connection, Renewals).
     - Premium release card with app logo, version label `Vendora 1.0.3`, detail text, direct download button `id="apk-download"` with `?build=fa97752e018097eb`, file size `94.8 MB · Android APK`, retry button `id="retry-release"`, and release highlights.
  10. *FAQ Accordion (`#help`) & Schema.org Discovery*:
      - Upgraded FAQ container from generic `div` to `<section id="help">` so `scripts/build-discovery.mjs` cleanly recognizes the section.
      - Categorized into 4 groups with 28 static `<details><summary>` cards. `npm run build:discovery` successfully synchronized all 28 visible FAQs into the JSON-LD FAQPage schema.
  11. *Contact & Support (`#contact`)*:
      - WhatsApp Support (+254 748 008 585), Direct Email (support@myvendora.co.ke), and Parent Company (Lyco Technologies).
  12. *Modern Executive `/auth` & `/wdhh/` Screens (`wdhh/auth-action.css`, `auth/index.html`, `wdhh/index.html`)*:
      - Refactored with dark navy glassmorphism (`#070c18` / `#0d1527`), subtle borders, glowing spinner, accessible eye password toggles, and responsive cards. Preserves all 13 DOM IDs and event listeners required by `auth-action.mjs` and `auth-action-controller.test.mjs`.
  13. *Subpages Polish (`policy/index.html`, `terms/index.html`, `privacy.html`)*:
      - Modernized headers, breadcrumbs, table-of-contents cards, and footers. All mandatory legal clauses, carrier disclosures, ODPC references, and Lyco Technologies links preserved.
- Verification:
  - `npm test`: **16/16 tests passed** with zero failures in 0.26s.
  - `npm run build:discovery`: Regenerated structured data for 28 visible FAQs cleanly.
  - `git diff --check`: 100% clean with zero whitespace or line-ending errors.
  - Local preview server running on port 8088 (`http://localhost:8088`). Note that live `https://myvendora.co.ke` displays changes only after git commit & push to GitHub Pages.

## BingwaFlash public order package grid symmetry & multiline titles (2026-09-27)

- `bingwaflash_website/order/index.html` packages grid uses `grid-template-columns: repeat(2, minmax(0, 1fr))` on desktop (>=768px) and `min-width: 0; width: 100%` on `.offer-card`. Never use `repeat(2, 1fr)` without `minmax(0, 1fr)` because CSS Grid's default `minmax(auto, 1fr)` track sizing expands the column track based on long unbroken text content, forcing column 1 to 60-70% width, pushing column 2 to the far right, and throwing the whole page off-center.
- Long offer titles are allowed to branch across lines using a clean 2-line clamp (`display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; word-break: break-word; overflow-wrap: break-word; line-height: 1.35;`) instead of forcing `white-space: nowrap`. The full package name is assigned to `name.title` in JS so desktop users can inspect the complete label on hover.
- In the checkout summary drawer, `.cs-left` has `min-width: 0; flex: 1;` with `word-break: break-word` on `strong`, and `.cs-price` has `flex-shrink: 0`, preventing long package names from squishing the checkout price.

## Public Website and Download Subdomain

- The direct APK installer page moved from `bingwaflash.co.ke/download/` to `download.bingwaflash.co.ke` so it can stay on GitHub Pages without being encouraged into search results.
- The download repo uses `CNAME=download.bingwaflash.co.ke` and Cloudflare points `download` to `officialmrlyco.github.io` with a DNS-only `CNAME`. Do not point the subdomain to `bingwaflash.co.ke`; GitHub warns this can break HTTPS for subdomains.
- Keep `app-ads.txt` published at both `bingwaflash.co.ke/app-ads.txt` and `download.bingwaflash.co.ke/app-ads.txt`. AdMob crawls from the Developer Website host in the app store listing, so mirroring the seller snippet on the download subdomain avoids a false 404 if the listing points there.
- Use page-level `noindex` meta tags for the download page. Do not block it with `robots.txt`, because crawlers must be able to fetch the page before they can see the `noindex` instruction and remove it from results.
- Keep the old `bingwaflash_website/download/index.html` and plural `bingwaflash_website/downloads/index.html` as plain noindex "Nothing to see here" pages. Do not redirect `bingwaflash.co.ke/download/` or `/downloads/` to the installer subdomain, because the main-site URLs should stop being useful and disappear from search results.
- `bingwaflash_website/404.html` routes legacy nested `/download/...` and `/downloads/...` paths back to `/download/` so visitors see the same quiet noindex page.
- Root `bingwaflash_website/index.html` should stay a public marketing/order explanation page. It can have client-question/trust sections, FAQ/Q&A, email contact, legal links, and a fuller footer, but do not add download buttons, tutorial sections, ratings/feedback widgets, stay-updated blocks, or WhatsApp links there.
- Root FAQ should look like a compact help-center section with category chips and brief practical answers for general, automation, web order, security, and support questions. Keep it self-contained and do not use it to send visitors to APK, video, or community-link content.
- The `officialmrlyco/download` / `download.bingwaflash.co.ke` page owns the APK download, WhatsApp group/channel, Telegram link, support emails, and tutorial videos.
- Download tutorials use `bingwaflash_download/tutorials.js` as the single video list. The download homepage renders only three featured thumbnail cards; `/tutorials/` renders the full searchable/category-filtered library and opens videos in a modal popup. Leave `youtubeUrl` empty until an unlisted YouTube video is ready, and do not put inline YouTube iframes back into cards unless the user explicitly asks.
- Download-site redesign (2026-08-30): `officialmrlyco/download` now shares `bingwaflash_download/styles.css` and `theme.js` across the installer and tutorial library. Keep the flat editorial treatment (thin borders, no gradients/shadows/blur/lift), 44px theme/menu controls, shared `bf-theme` preference, real mobile navigation, and release-first mobile DOM order when extending either page.

### v1.3.8 release and legal-site ownership (2026-08-27)

- The official v1.3.8 APK is the GitHub release asset tagged `v38`: `BingwaFlash_v1.3.8.apk`, Build 38, SHA-256 `b484049d887127a6bbd909f3dfa648f7e84fb7cea78761bca62960cb7c5ea5a2`. Keep the installer button, checksum, visible release date, and `bingwaflash_website/version.json` aligned with that immutable asset.
- `download.bingwaflash.co.ke` is currently published by GitHub Pages from `officialmrlyco/download`, not `officialmrlyco/bingwaflash_download`. The latter is a requested mirror. Update both when asked to update the download repository, but treat `officialmrlyco/download` as the production deployment until Pages ownership changes explicitly.
- On stacked phone layouts, the release/install card must appear before requirements, community, and support cards. Do not restore the old mobile `order:-1` side-panel rule that hid the primary APK action below setup help.
- The August 27 Privacy Policy reflects actual v38 behaviour: full transactions and clients are primarily local; the agent profile/configuration is mirrored online; Portal and Online Relay transmit selected data only when enabled; Analytics and Crashlytics are present; the release APK declares Google advertising-identifier permissions through its analytics dependencies; and the app does not contain an in-app advertising network.
- Legal copy must not promise instant payout, claim that the platform never temporarily handles payment records, or imply that every app setting is device-only. Describe Bingwa Flash as an independent automation and payment-facilitation platform, keep the agent/customer sales relationship clear, and make all exclusions subject to mandatory Kenyan consumer and data-protection law.

## BingwaFlash public websites visual system (2026-08-30)

- `bingwaflash_website` shares `site-theme.css` and `site-theme.js` across every public, legal, utility, legacy-download, and scanner page. Keep one visible 44px theme control per page, the shared `bf-theme` preference, a real mobile menu, flat yellow/green surfaces, thin borders, and no clay-style gradients, blur, shadows, or hover lifts.
- The Recharge Scanner retains its page-specific `rechargescanner/site.css` but uses the shared theme controller. Keep explicit dark surfaces and text contrast, and contain the privacy table of contents so narrow phones never create document-level horizontal overflow.
- Cache-bust shared visual assets when they change. On `officialmrlyco/download`, keep the installer card first in stacked phone layouts, preserve page-level `noindex`, and keep the immutable v1.3.8 Build 38 URL, checksum, and exactly three featured homepage tutorials aligned with the release.

### Full public-site composition rebuild (2026-08-30)

- The public homepage is intentionally no longer the former centered hero, metric strip, feature-card grid, or five-step card row. `bingwaflash_website/index.html` plus `home.css` is an asymmetric editorial journey: a payment-to-record lane, divider-led explanations, a restrained execution view, practical FAQ, and support close. Do not restore fake metrics, blinking status dots, generic pills, or a card grid merely to fill space.
- `officialmrlyco/download` is a separate installer desk, not a mini copy of the marketing page. Its `styles.css`, homepage, and tutorial library use an editorial headline, release-first installer surface, side readiness rail, dark tutorial field, and divider-led support. Keep green/yellow/black/white, shared `bf-theme`, noindex, and the real v1.3.8 release metadata; avoid claymorphism, glow, browser-chrome mockups, decorative outlines, or invented statistics.

## Order autofill and profile name rules (2026-09-04)

- `bingwaflash_website/order/index.html` uses a real non-navigating checkout form, stable payment/recipient field names, linked labels, and separate `section-payment tel` / `section-recipient tel` autofill hints. The prior page had none of these and capped raw input at ten characters; do not restore that cap because saved numbers may contain spaces or +254. The inspected pre-redesign version also lacked autocomplete hints, so do not attribute the regression to one redesign commit without further evidence.
- `order/phone-input.mjs` validates recognized Kenyan 07/01 formats before producing payment payloads; do not strip arbitrary letters or truncate foreign/overlong values into a different recipient. Both same-number and separate-number checkout use this path, with duplicate-submit protection. Browser/keyboard settings still own whether a suggestion chip appears; desktop tests do not prove Android keyboard autofill.
- `profile-names.mjs` cleans legacy agent/business names on order and clients pages, including registration snapshots. Names use Unicode letters/marks/numbers, spaces, and ordinary punctuation (. , apostrophe & parentheses hyphen), with emoji components removed; agent names max 10 codepoints and business names max 20. Username creation/changes use lowercase ASCII letters, digits, underscore and period, max 16, with no trailing period. Existing username document IDs/links must never be silently renamed or truncated.
- Client registration list rendering uses text nodes and event listeners so legacy apostrophes/names cannot become HTML or inline JavaScript. Avoid fetching every old agent merely to clean a registration label; sanitize the existing snapshot locally.
- Website verification: Node policy tests and intercepted-request browser checks passed at 390px/1365px, light/dark, covering old emoji names, formatted phone payloads, same-number checkout, form semantics, and no overflow/runtime errors. No live payment was sent.

- Delivery status: website published from `officialmrlyco/bingwaflash_website` main, with successful phone/desktop light/dark checks. App identity policy tests passed standalone; full app compile was blocked by concurrent USSD-file errors, not released. Backend naming-only changes are committed separately from prior Telegram-removal/security-rule edits; actual Firestore emulator assertions passed. Backend deployment remains pending because the current cloud session returned HTTP 403 during active-rules verification. Recheck access and deploy the backend naming changes before releasing app username support for periods.

## Reserved website usernames (2026-09-05)

- The owner-managed reservation list is `config/ownedUsernames` with a canonical `prohibited` **array** of lowercase username terms, for example `['support', 'fuck']`. The previous `prohibitted` spelling is a read-only migration fallback; do not add new terms there or replace the canonical field with a multiline string.
- A term blocks an exact username, an embedded sequence, and dot/underscore-separated variants: reserving `fuck` blocks `ggfuckgg`, `f_u_c_k`, and `f.u.c.k`. Android checks it immediately for feedback, while the deployed `claimWebsiteUsername` callable makes the same final server decision before it creates `/usernames/{username}`.
- Client-side creation of a new `/usernames/{username}` document is intentionally denied by Firestore Rules. Never restore it for convenience: that would let an old APK bypass dynamic reserved-substring checks. Existing legacy usernames remain usable unchanged, and the callable creates the new reservation before the normal agent/public-profile transaction runs.
- Existing legacy usernames remain usable when unchanged. Adding a name to the list prevents future claims; it does not silently rename or delete an already-owned public URL.
- BFlashPanel Agent Details -> Web Orders shows the server-owned `usernameClaimedAt` audit with date and time. It must not substitute a panel-device timestamp or the last settings update when that field is absent.

## Agent-branded share previews and panel avatars (2026-09-09)

### Exact and strict prohibited username lists (2026-09-15)

- `config/ownedUsernames` uses two independent lists. `prohibited` is exact-only, while `prohibitedAll` uses normalized containment to block embedded or separator-disguised terms. Do not merge a term into both lists or restore broad matching for `prohibited`; Android preview and `claimWebsiteUsername` must preserve this distinction. The callable remains the authoritative strict reservation gate because Firestore Rules cannot dynamically normalize an owner-maintained list.

### Public username fallback route repair (2026-09-15)

- `bingwaflash_website/404.html` is the GitHub Pages fallback for root username links. Keep its safe route gate aligned with public username routing: dot and underscore handles, plus valid legacy hyphen handles, must forward to `/order/?u=...` (and `/clients/{username}` to the matching client query URL). The 404 redirect is not a database lookup, so reject slash-containing or edge-punctuation segments instead of attempting to normalize them.

- A browser can brand `/order/?u={username}` and `/clients/?u={username}` after Firestore loads, but WhatsApp/Facebook share crawlers never execute that JavaScript. The `bingwa-functions/site-share-worker` edge proxy must read only `publicAgents/{username}`, replace the static head metadata, and short-cache the result. A static HTML edit alone cannot make a pasted query-string link show an agent's business name or profile photo.
- The share worker must proxy GitHub Pages unchanged when no valid public username/profile exists. Never expose private agent records, original profile images, or Firestore service credentials for preview generation. Its cache key is normalized to the route plus `u` only so tracking parameters cannot create needless cache entries.
- BFlashPanel uses only `AgentProfile.profileImageUrl`, validates the immutable avatar host/path, and relies on Coil plus LazyColumn visibility for caching. Do not introduce whole-directory avatar preloading or image listeners.
- On public Order and Clients pages, an approved agent avatar is a focusable image button that opens a full-screen viewer. Keep its initials fallback non-interactive, restore focus when the viewer closes, and let touch outside/Escape close it without interfering with checkout or registration dialogs.
- Production share cards are served by the Cloudflare Worker `bingwaflash-site-share`, routed only at `bingwaflash.co.ke/order*` and `bingwaflash.co.ke/clients*`. The four apex GitHub Pages A records must remain Cloudflare-proxied; DNS-only mode bypasses the Worker and restores the generic card.
- The Worker reads the committed `order/index.html` or `clients/index.html` via GitHub's content API with its required User-Agent and raw-media Accept headers. Do not proxy `officialmrlyco.github.io/bingwaflash_website` from this Worker: GitHub redirects that host to the custom domain, creating a Worker loop. Preserve the catch-path neutral page/503 fallback so sharing metadata failures never become an opaque Cloudflare error.
- `bingwaflash.co.ke` must use Cloudflare SSL mode `full` (or a later verified stricter equivalent), never `flexible`, while its GitHub Pages A records are proxied. Flexible makes Cloudflare request the GitHub origin over HTTP; GitHub redirects to HTTPS and produces `ERR_TOO_MANY_REDIRECTS` for the entire site.
- Cloudflare route wildcards at `/order*` and `/clients*` also match nested modules such as `/order/phone-input.mjs`. In `bingwaflash-site-share`, rewrite only the exact HTML entry paths and proxy every nested asset with `fetch(request)` to the GitHub Pages origin. Also remove GitHub Content API's `content-security-policy: default-src 'none'` from proxied HTML; retaining it makes the page render as unstyled text and blocks Firebase/modules. Bump the private Worker cache-key version after a response-header repair so stale broken HTML is bypassed immediately.

# BingwaFlash public website handoff

## SiteLink Phone-Independent Auto Time Schedules & Live Catalog Watcher (2026-11-05)

- Removed physical phone dependency for SiteLink offer scheduling on `bingwaflash.co.ke/order/`.
- SiteLink now evaluates `autoTimeEnabled`, `autoEnableTime`, and `autoDisableTime` directly against Kenya Time (`Africa/Nairobi`, UTC+3) using `getKenyaMinutes()` and `isOfferInAutoTimeWindow()`:
  - Daytime schedules (e.g. 06:00 to 18:00) hide offers outside the window (e.g. at 18:01 after closing).
  - Overnight schedules (e.g. 20:00 to 06:00) span midnight seamlessly.
  - Paused offers from phone Auto Time (`autoTimeDisabled: true, autoTimeWebOrderEnabledBeforePause: true`) are safely admitted when in-window so older phone pause states do not block cloud schedules.
  - A 30-second live watcher interval (`setInterval(refreshOfferCatalog, 30000)`) dynamically repaints the catalog without requiring a manual page refresh when opening or closing hours arrive.
- Added comprehensive unit tests in `tests/sitelink-offer-policy.test.mjs` (all 43 tests passing).

## Bridge product terminology and delivery evidence (2026-10-27)

- Relay is being renamed to Bridge in the Android app and backend. The privacy, terms and machine-readable guide now use Bridge. New connections select one processing phone; existing users confirm that phone once after both phones update.
- Internet Bridge retains immutable operation receipts for duplicate protection after removing packet content at a durable intake decision. Pending or unresolved packets remain recoverable. Do not claim all data disappears on the first cloud claim, or that a sender handoff proves a customer purchase completed.
- Pairing checks may listen for an inactive invitation; they are a separate non-executing control channel. Payment listeners still require an enabled processing connection. No separate Bridge subscription or automatic purchase retry is introduced.
- This source wording change is not a publication, APK release or live data migration. Ship it with the accepted Bridge release; preserve all unrelated checkout changes.

## Clients page registration permission repair (2026-10-01)

- `/clients/index.html` now calls `registerWebsiteClient` and `removeWebsiteClient` in Firebase Functions `us-central1` for writes that affect agent client inbox rows and the `clientSync` marker. It still reads registration/PIN information for the current UI and keeps the readable five-digit PIN support flow. Do not restore direct browser writes to `agents/{uid}/meta/clientSync`: Firestore restricts that marker to the signed-in agent, and a failed marker can leave partial registration data.
- The registration callable atomically checks the agent's current private registration setting and PIN, saves the registration/inbox, and advances the same marker consumed by the existing Android app. Retrying an old partly saved registration can signal the pending inbox. The Android source was not changed.
- The removal callable checks the PIN and exact registration ownership before deleting the website registration and matching inbox row. Android's local client book survives a website removal; the page's confirmation and success text disclose this.
- Roll out backend callables first, this website second, and tightened Firestore rules last. A cached old page may still show the former permission error until refreshed. Test the browser and a real phone separately; source tests alone do not establish a live app import.
- Production rollout completed on 2026-10-01: the two Firebase callables were created, website commit `010c0a0` was pushed to `main`, and the live `/clients/` HTML served the new callable imports with the old direct `touchClientSync` path absent. Firestore rules were then deployed and read back matching local source. No real customer registration or handset import was used as a smoke test.

## Order package grid centering and multiline title branching (2026-09-27)

- Offer cards in `order/index.html` use `grid-template-columns: repeat(2, minmax(0, 1fr))` on desktop (>=768px). Do not use `repeat(2, 1fr)` without `minmax(0, 1fr)`: `1fr` defaults to `minmax(auto, 1fr)`, which allows an unusually long offer name in column 1 to expand the track's intrinsic min-content, pushing column 2 to the far right edge and rendering the layout off-center.
- `.offer-name` uses a 2-line clamp (`display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; word-break: break-word; overflow-wrap: break-word; line-height: 1.35;`) instead of single-line `white-space: nowrap`. Long offer names branch cleanly across 2 lines without stretching or distorting cards, and excess characters truncate with an ellipsis.
- In JS DOM creation, `name.title` is assigned `o.name || "Offer"` so desktop users can view the full title on hover.
- `.cs-left` in the checkout summary banner has `min-width: 0; flex: 1;` with `word-break: break-word` on `strong`, and `.cs-price` has `flex-shrink: 0`, preventing long package names from squishing the checkout price.

## LYCO TECHNOLOGIES product ownership (2026-09-12)

- Bingwa Flash is owned and designed by LYCO TECHNOLOGIES. Every visible public Bingwa Flash footer must use the exact linked credit: `© 2026 Bingwa Flash. All rights reserved. Made and Designed by LYCO TECHNOLOGIES.` The LYCO TECHNOLOGIES text links to `https://lycotechnologies.co.ke/`.
- Airtime Recharge Scanner is the exception: its own footer says `© 2026 Airtime Recharge Scanner. All rights reserved. Made and Designed by LYCO TECHNOLOGIES.` Keep the scanner's product identity and package name intact.
- Keep the parent-company credit product-first: it belongs in the footer and must not replace Bingwa Flash support, legal, or checkout identity. `privacy.html` and `terms.html` each need an opening `<script>` tag before the table-of-contents listener; a closing tag without it renders the source JavaScript at the bottom of the legal page.

## Profile avatars (2026-09-06)

- Order and Clients render a public avatar only from the approved HTTPS host, otherwise initials remain visible. Avatar URLs are immutable and browser-cacheable; do not add a duplicate image store.
- Once the public profile loads, Order and Clients use its business name for the browser title and visible header. Their favicon may switch only after an approved avatar URL has loaded; without one, retain `/logo.png`. Keep this branding public-data-only.

## Order and Clients agent portrait sizing (2026-09-27)

- Keep `.ag-avatar-circle` at the same responsive size on both public pages: `clamp(132px, 10vw, 152px)`. The first 76-88px version was too small and the later 152-176px version dominated the card; this middle size balances the agent portrait with the name and details. Scale initials with it.
- Keep the existing circular crop, approved-avatar URL gate, and initials fallback unchanged when adjusting portrait presentation.

## Public verification badge expiry (2026-09-27)

- Order and Clients show the verification badge only when public `isVerified` is true, `verificationExpiresAt` is in the future, and at least one of `siteLinkSmsSubscriptionUntil`, `siteLinkServerSubscriptionUntil`, or `webOrderSubscriptionUntil` is in the future. Firestore Timestamp objects are supported. Missing legacy verification expiry fails closed.
- Keep the shared policy in `verified-agent.mjs`; it schedules a page-local recheck at the next relevant expiry so an open page removes the badge without reload. The public pages must not expose Owner's Phone or read private agent documents for badge state.

## Public verified badge colors (2026-11-02)

- The public `verifiedBadgeColor` field is presentation only. The shared helper trims and lowercases strings, then accepts only `green`, `red`, `yellow`, `pink`, and `purple`; missing, malformed, or unknown values use green.
- Keep the field's color on the SVG badge and its adjacent Verified label only. Never change `isPubliclyVerifiedAgent`, expiry timers, subscription checks, or listener behavior to honor a color value.
- The public badge palette must match the native and Panel colors: green `#2E7D32`, red `#D32F2F`, yellow `#F9A825`, pink `#D81B60`, and purple `#8E24AA`.

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

## Public order callback status projection (2026-10-23)

- `/order/` creates a 32-byte cryptographic `statusToken`, stores only the receipt token and order ID in tab session storage, and attaches a Firestore listener to `publicOrderStatuses/{statusToken}` before it sends `initiateOrder`. This projection is customer-readable by exact document get only and server-write-only; never listen to private `webTransactions` or relax its admin-only rules.
- The backend must create the allowlisted projection in the same checkout reservation transaction, before any STK request, then update it with authoritative order state. Do not expose payer/recipient numbers, provider callback bodies or raw descriptions, checkout credentials/IDs, or payout diagnostics in the projection.
- The browser keeps the same payment receipt locked through `waiting_for_agent`, `agent_received`, `payout_processing`, and recoverable `payout_failed`. `completed` means delivery completed; only it and final `failed`/`cancelled`/`expired` states release the receipt. Hiding prompt instructions or dismissing a pending dialog cannot cancel an STK or enable another payment.
- Firestore's SDK owns transient listener reconnects. If the listener reports an error, use the existing `getOrderStatus` endpoint through serialized, bounded backoff reads; never use overlapping fixed-interval polling or start another STK for status recovery. Keep the stream read-only and close it on terminal outcome, explicit abandonment, or `pagehide`; reconnect a saved receipt on return.
- Bound REST fallback to 12 serialized reads (about nine minutes including backoff); stop immediately when the status ticket expires. Keep the receipt locked and show a friendly contact-the-agent/recheck-later message after fallback ends. Never display provider or HTTP diagnostic details.
- Send both `txId` and the matching bearer `statusToken` to `getOrderStatus` fallback whenever the ticket is available. Browser-issued ticket checkouts require an exact match; server-generated tickets for old cached clients and pre-projection legacy orders retain txId-only access to the safe allowlisted response. Do not omit a browser-issued ticket to accommodate a stale page.
- Deploy and verify the matching backend projection writer and get-only Firestore rule before publishing this page. The website's scoped tests verify receipt ordering and recovery behavior, but do not prove that production backend/rules have been deployed.

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
## Release metadata (2026-09-30)

- `version.json` mirrors Bingwa Flash v1.4.1 (Build 41) for website compatibility. The Android app update prompt remains owned by Firestore `config/version_update`; keep both records aligned when publishing a release.
- The mutable v41 APK is `BingwaFlash_v1.4.1.apk`, 16,378,302 bytes, SHA-256 `8b6a5b59bdbe0f46449c64b3a3c9c4bb8492b7e85d6249ff62cdb2d303d74374`.
- GitHub release immutability is intentionally disabled for `officialmrlyco/BingwaFlashApp`. A corrected build may replace the asset under the same tag, filename, and public URL, but its signature, alignment, version metadata, and checksum must be reverified before the website checksum is changed.

## Public username fallback routing (2026-09-15)

- GitHub Pages sends root username URLs to `404.html`. Its route gate must forward dot and underscore usernames, plus safe legacy hyphen routes, to `/order/?u=...`; do not limit it to underscore-only handles. Keep path separators and leading/trailing punctuation rejected so a route cannot resolve to a different path or account.

## Release v1.4.3 metadata (2026-11-04)

- Keep `version.json` aligned to the verified existing v43 asset: 17,791,870 bytes, SHA-256 `232636d7b9c10b93092e325e2101da8fe29e77eeb0abd5dc1bf26cb3973b7b8f`, and URL query `?build=232636d7b9c10b93` for cache refresh.
- Set versionCode 43, versionName 1.4.3.
- `apkSha256` and `apkSizeBytes` are public release integrity metadata. `tests/release-metadata.test.mjs` checks the JSON shape and exact v43 metadata; run it when changing `version.json`.
- Homepage release section highlights ultra-smooth UI with bubble effects, upgraded Relay to Bridge multi-transport, lightning USSD execution speed (120ms settlement), enhanced Portal integration, and resilient payment intake bug fixes.

## Release v1.4.2 metadata (2026-10-12)

- Superseded the v1.4.1 metadata above at the time: root version.json and homepage release section identified versionCode 42 / versionName 1.4.2 and the then-current v42 APK URL; the URL and integrity values were later corrected below.
- The user already published the APK. This task updates website metadata and GitHub release notes only; do not rebuild or replace the asset.
- Historical 2026-10-12 metadata was 16,611,212 bytes with SHA-256 `7c137919b88d2b2185514cd1d0cb1fc74600245a2a555b477b9a6df1ec10ade4`; this was stale and is superseded by the verified 2026-10-14 metadata correction below.
- Keep JSON parseable without comments; release maintenance notes belong here. Firestore config/version_update is separate and was not changed by this website request.

- Historical deployment verification: download site and release notes were live. Cloudflare Workers Builds failed for commit 39713b6; direct Wrangler 4.148.0 deployment from a clean git archive of that commit succeeded after one API gateway timeout retry. HTTP 200 readback confirmed homepage v1.4.2 and version.json versionCode 42 with the v42 APK URL then configured. The APK asset was untouched. Future automated build health still needs checking; no cause for its failure was established.

## v1.4.2 installer metadata correction (2026-10-14)

- Keep `version.json` aligned to the verified existing v42 asset: 16,643,996 bytes, SHA-256 `cb486f2a5b2c0a42d0cb198705852b1367063f19b5043284e786a318e013c24d`, and URL query `?build=cb486f2a5b2c0a42` for cache refresh. Preserve versionCode 42, versionName 1.4.2, and the existing filename. Do not rebuild or replace the APK.
- `apkSha256` and `apkSizeBytes` are public release integrity metadata. `tests/release-metadata.test.mjs` checks the JSON shape and exact v42 metadata; run it when changing `version.json`.
- Pushing this repository may trigger Cloudflare Workers Builds, but a GitHub push alone does not prove a Worker deployment. Verify the public website and live `version.json` after publishing.

## SiteLink offer count and live catalog (2026-10-13)

- config/sitelink.maxOffers caps selected SiteLink offers independently of price, with no hardcoded25. Missing field preserves legacy behavior; invalid explicit cap admits none. order/sitelink-offer-policy.mjs matches backend admission: firstN webOrderEnabled selections in saved order, then enabled/code/price filtering; UI price sorting follows admission. Ordinary disabled rows still reserve a selected slot, matching the Android editor. Keep saved catalog rows; do not fan out destructive mutations when the cap changes.
- Both live config and public-agent snapshot callbacks refresh the catalog; lowering the cap clears an excluded checkout selection, empty/malformed snapshots clear stale offers, and initial catalog loads before attaching listeners to avoid overwrite races. The public mirror is still the sole unauthenticated source.
- Sixteen website tests and embedded order-module syntax pass. Backend initiateOrder separately rejects excluded private/public offers before STK; no real payment used. Deploy only these scoped website files to the existing Worker; APK fixes require separate distribution.

- Production verification: scoped commit b37227b was pushed to origin/main and deployed with existing Wrangler 4.148.0 to Worker version f5fe0233-e394-4775-85b6-17bad7d39d2d. HTTP200 readback of order HTML and policy module exactly matched normalized scoped source. Backend initiateOrder was independently deployed with the same admission policy; no production payment/config/customer write was used. New app-side rejection/update-listener behavior requires an updated APK, not merely this website deployment.

## SiteLink username and business name limits (2026-10-19)

- New username rules are 3–20 ASCII letters/digits only. The website route fallback intentionally continues accepting existing dot, underscore, and hyphen handles so accounts keep their current links until renamed.
- profile-names.mjs is shared by public order and client pages; it cleans business names to 50 characters, with emoji/punctuation handling unchanged. Cloudflare share previews apply the same 50-character cap.
- Keep the profile module cache query in both pages aligned whenever its policy changes.

## STK initiation and PIN entry progress (2026-10-24)

- MrLyco reported that the immediate-callback change opened a fixed "Approve M-Pesa Payment" screen before sending STK. Customers enter their M-Pesa PIN on the STK push they receive; never describe checkout as approving a prompt.
- The public order overlay now shows initiation before attaching its existing receipt listener and sending checkout. Both live projection payment phases and the successful start acknowledgement drive the visible phase. Old successful responses omit `status`, so the submit handler supplies `pending` only after acknowledgement; restoring a saved receipt starts with neutral status-check copy.
- The real backend `buildCheckoutResponseStatus` groups both unpaid stages as `status: payment_pending`; the allowlisted `paymentStatus` is `initiating` until dispatch and `pending` after dispatch. Normalize that public contract in the controller before updating attempt ownership and rendering. Do not assume the top-level status carries those raw phases. Regression fixtures exercise the real projection shape as well as legacy raw phases.
- `status-controller.mjs` may advance an initiating reservation to pending from the HTTP acknowledgement, but ignores late initiating snapshots and pending updates after a confirmed handoff. Confirmed delivery/payment evidence also outranks late HTTP failures or missing response fields. Keep the listener subscribed before STK and never add a polling delay or another payment request for progress updates.
- Updating the phase does not reopen hidden instructions. A hidden overlay keeps the receipt locked, and live results still appear immediately. Preserve owner/token fencing, bounded fallback reads, expiry handling, and terminal release rules.
- All 36 website tests passed, including actual page submit/render execution against a held start response, early callback failure, dispatch before acknowledgement, legacy replies, hidden instructions, duplicate prevention, and confirmed handoff followed by lost/error/missing-reference replies. No production payment or handset acceptance was performed. Website publication and Android APK distribution are separate from source verification.


## Website logo payload optimization (2026-11-02)

- Preserved each logo's original transparent PNG path and full pixel dimensions; encoded a 256-color indexed palette with alpha. No HTML/CSS/JavaScript references or brand artwork changed.
- Before/after bytes and dimensions:

| Asset | Before | After | Dimensions |
|---|---:|---:|---:|
| `logo.png` | 208,654 B | 32,304 B | 720 x 720 |
| `download/logo.png` | 776,974 B | 89,116 B | 1024 x 1024 |
| `rechargescanner/logo.png` | 271,427 B | 13,038 B | 512 x 512 |

## Isolated logo publication from reviewed assets (2026-11-02)

- Local asset commit `3ff5ffe` is not safe to push as a branch tip: local `main` also contains three unreleased order/payment/Bridge commits. Public commit `f2527fa8a22fada02176b27926413826aa292d9a` was independently created with parent `46d929a` (the fetched GitHub `main`) using only the three optimized logo blobs from `3ff5ffe` plus the logo optimization note. It is now the remote `main`; do not reset, rebase, or force-push the local branch to it.
- The commit deployed through the existing `bingwaflash-site-share` Cloudflare Workers Builds route. Live `bingwaflash.co.ke/logo.png` (32,304 B, 720x720), `/download/logo.png` (89,116 B, 1024x1024), and `/rechargescanner/logo.png` (13,038 B, 512x512) returned HTTP 200 and SHA-256 matches against the published tree. All remain under 200 KB.

- Verified badge colour final source acceptance: node --test tests/verified-agent.test.mjs passed 4/4, including exact matches for all five shared palette values, legacy normalization, malformed input fallback and unchanged verification/expiry gating. Evidence is .wrangler/reports/verified-badge-color-20261102. Backend mirror/rules support is in sibling bingwa-functions; updated native and Panel clients require later APK delivery. This task did not publish, push or change a live profile. Preserve the existing isolated-publication boundary: local main includes unreleased order/payment/Bridge work and must not be pushed or deployed wholesale for this badge change.


## Blue default and live saved badge colours (2026-11-03)

- Corrected the palette to six choices: blue (#1565C0), green, red, yellow, pink and purple. Missing/invalid colour defaults to blue; explicit valid stored colours remain intact. Verification and paid SiteLink expiry gates are unchanged. Both SiteLink and clients-page SVG/label use the same profile colour and versioned helper; colour-only updates repaint an open page.
- The reported account was lyco, not the earlier screenshot account. Read-only checks confirmed private and public stored colours were already purple. The live renderer still used a fixed-blue SVG and old helper, so the failure was website publication, not a missing saved choice. No account colour or approval/entitlement data was changed.
- Public commit 72eb48a21c304c3bca8846ef749beb4f66843101 was created independently with parent f2527fa8a22fada02176b27926413826aa292d9a and pushed through the existing Cloudflare Workers Builds route. It contains only badge helper, two HTML consumers, focused tests and notes; all other public checkout/Bridge/logo files remain unchanged. Local main still includes unrelated unreleased work and must not be pushed wholesale or force-pushed.
- Focused and exact-public-tree Node checks passed 5/5. HTTP200 reads confirm new helper/import/currentColor on both deployed pages; the actual deployed helper evaluated with the existing public record renders icon and label #8E24AA, keeps the badge visible, and defaults missing values to #1565C0. Evidence: .wrangler/reports/badge-blue-default-20261103, especially publication.json, live-check.json and live-purple-verification.json. This is deployed data/renderer acceptance, not a handset or browser screenshot. The connected Cloudflare API account did not own this Worker; existing Git-backed deployment was used successfully.

## Bingwa Flash legal notices (2026-11-13)

- `privacy.html` and `terms.html` are the canonical public legal sources. The November update describes actual data paths across Android, Portal, SiteLink and Bridge, customer messaging, paid access and account-deletion requests. Keep the no-sale statement, permission and provider distinctions, stable section anchors, and scrollable navigation. Checkout links to the Privacy Policy as a notice. Client registration and removal share the footer links.
- The website suite passed with 43 tests. Browser checks covered both legal pages at 320, 390, 900 and 1440 pixels, jump links, theme switching, account-deletion link and SiteLink notices. Keep the two legal pages and small notice changes scoped away from unrelated SiteLink work. Production publication is separate.
