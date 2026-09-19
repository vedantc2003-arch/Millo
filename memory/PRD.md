# MILLO Website PRD

## Original problem statement
Build a vibrant, modern Gen Z snack brand website for MILLO — “A New Way to Snack.” Guide visitors from discovery through product selection, pack size, cart, checkout, and purchase/order intent. Use the supplied MILLO logo and three packaging assets. Include homepage, shop/product discovery, offers and combos, product details, brand story, Why MILLO/trust, FAQ, footer, and a responsive purchase flow.

## Architecture decisions
- React frontend with local state for the prototype shopping journey; existing FastAPI/MongoDB starter remains available but no persistence is needed for the requested academic order-intent flow.
- Supplied public customer assets are used directly for the logo and all three package visuals.
- Checkout is intentionally a local order-intent form with no payment processing and no claim of completed sale.
- Proposed packaging claims are surfaced with context that they are pending final product validation.

## Implemented
- MILLO editorial storefront homepage with sticky navigation, hero CTA, offer marquee, product range, Why MILLO manifesto, discovery combo, FAQ, and footer.
- Product cards for MILLO CRUNCH, MILLO POPS, and MILLO CRISPS with 30 g / 60 g selectors and ₹29 / ₹59 pricing.
- Product detail modal with claims, pack selection, and add-to-cart action.
- Cart drawer with quantity controls, subtotal, empty state, and checkout entry.
- Checkout/order-intent form with validation and confirmation summary.
- Responsive mobile navigation menu and mobile layouts.
- Descriptive data-testid attributes across interactive and critical user-facing UI.
- Final visual asset pass completed with the newly supplied transparent MILLO logo and correctly matched red CRUNCH, yellow POPS, and green CRISPS pack images across hero, cards, modals, combo artwork, and cart.

## Backlog
- P0: Connect order-intent submissions to a backend collection or email workflow if persistence is required.
- P1: Add real payment provider only when the academic prototype is ready for actual fulfilment.
- P1: Add verified nutrition/allergen data from final formulation and laboratory/supplier documentation.
- P2: Add consent-based email signup and real social/community content.
## Iteration — Sep 2026 (hero rotation + Instagram)
- Hero now auto-rotates through all 3 product packs (CRUNCH → POPS → CRISPS) every 2.6s with crossfade; caption counter and label update per slide.
- Footer Instagram link now clickable → https://www.instagram.com/millo.snacks (opens in new tab); also added under "Need help?" column.
- Verified via Playwright: slide labels cycle 01/03 → 03/03 → 01/03; Instagram href/target confirmed.

## Iteration — Sep 2026 (Instagram feed + motion overhaul)
- Added dark "Join the MILLO Community" Instagram section: live-feed ready via GET /api/instagram/posts (FastAPI + httpx, 10-min cache); shows branded fallback tiles + Follow card until IG_ACCESS_TOKEN / IG_USER_ID are set in backend/.env (placeholders added).
- Motion overhaul: Lenis smooth momentum scrolling; masked line-by-line hero headline reveal; hero pack parallax + float + rotating packs; slow seamless editorial marquee; framer-motion scroll reveals on all sections; animated drawer/modals; animated Instagram icon in footer; hover micro-interactions on cards/buttons/nav.
- Verified: hero rotation, IG section render, footer icon href, cart add/drawer flow all pass via Playwright.

## Iteration — Sep 2026 (real order intents + owner log)
- Checkout form now POSTs to /api/orders (FastAPI + MongoDB `orders` collection); confirmation code comes from the server (MILLO-XXXXXX). No payment — order intent only, per user request.
- Owner view: footer "Owner · Order log" opens a modal listing all order intents (buyer name, phone, address, items, total, timestamp) via GET /api/orders. Not password-protected (prototype).
- Verified end-to-end: placed order in browser (MILLO-669022, Asha Rao), appeared in order log; API curl POST/GET validated.

## Iteration — Sep 2026 (Google Form pipeline, dormant)
- Checkout now also pushes each order into a dedicated Google Form (→ linked Google Sheet) via server-side POST to the form's /formResponse endpoint. Entry-ID mapping lives in backend/.env (GOOGLE_FORM_RESPONSE_URL + GOOGLE_FORM_ENTRY_*). Currently DORMANT: placeholders empty until user creates the form and shares the pre-filled link.
- Orders record google_form_status (pending/submitted/failed); order log shows "In Google Sheet ✓" badge when submitted.
- Verified: orders still save normally with integration unconfigured.
