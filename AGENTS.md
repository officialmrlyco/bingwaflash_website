# BingwaFlash public website handoff

Read the parent workspace AGENTS.md first. This repository is the existing GitHub Pages site at bingwaflash.co.ke, published from main root. Preserve that hosting owner and domain; do not migrate it to another host as part of a website fix.

## Profile names and checkout (2026-09-04)

- Order and clients pages import the same `profile-names.mjs` policy with a version query. Clean old private/public profiles and client-registration snapshots before displaying agent/business names. Agent names are at most 10 codepoints; business names at most 20; emoji components are removed while Unicode names and ordinary punctuation survive. Keep existing username identifiers intact for links and database lookups.
- Checkout phone fields must retain their actual form, name, linked label, and separate telephone autocomplete sections. Accept saved numbers with spaces, brackets, dashes, or +254 through `order/phone-input.mjs`, then validate before payment. Never cap formatted raw input to 10 characters or silently salvage letters/foreign numbers.
- The form suppresses fallback navigation and handles a real submit event; duplicate submissions while sending are ignored. Do not restore click-only submission or persist customer phone history in local storage for autocomplete.
- Registration list names are text nodes, not HTML interpolation or inline handlers. Keep registration identity and remove actions on the original document IDs.
- `node --test tests/profile-and-phone.test.mjs` covers normalization, emoji sequences, codepoint limits and unchanged legacy handles. Browser checks with intercepted data/payment requests passed at 390px and 1365px in light/dark. Actual Chrome/Android suggestion chips remain a device acceptance check; no real payment was used.
