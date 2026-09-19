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