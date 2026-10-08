# BISU DIGITAL NETWORK — Implementation Plan

## Product scope

BISU DIGITAL NETWORK is a Shopify-backed digital-services storefront for customers in India. The storefront will sell legitimate digital marketing and web/app creation services, with a clear distinction between Shopify checkout and external Razorpay payment links.

The unsafe requests for hacking/cheating, unauthorized location tracking, and lookup or disclosure of personal identity/address/alternate phone data are intentionally excluded. The catalog keeps the safe commercial intent: Instagram views, high-quality Instagram likes, website creation, mobile app creation, and a general inquiry for Instagram, Facebook, YouTube, and Telegram services.

Payment and support behavior is explicit and customer-controlled: Razorpay opens in a new tab; WhatsApp opens a prefilled message composer to +916296989639. The site never claims to verify a payment automatically or transmit screenshots/customer details without the customer choosing to do so.

## Design system

- **Design movement:** New-wave editorial commerce — a dark, high-contrast storefront that pairs a magazine-like headline system with compact product modules and glowing signal accents.
- **Core principles:** (1) signal over noise, (2) clear price-first decisions, (3) trust through plain-language disclosure, (4) mobile-first momentum.
- **Color philosophy:** Ink-black and warm paper create a serious, premium base; electric violet is the ownable BISU signal color for links and focus; acid lime marks success/availability; ember orange is reserved for external payment actions so customers understand when they are leaving the store.
- **Layout paradigm:** Offset editorial composition rather than a centered card grid: a left-aligned hero statement, a right-side service pulse panel, then a horizontal catalog rail that collapses into a vertical stack on mobile.
- **Signature elements:** oversized outlined numerals, thin signal lines with small node dots, and rounded “ticket” labels for payment/support states.
- **Interaction philosophy:** Every action explains what happens next. Add-to-cart is immediate and reversible; external links are labeled; WhatsApp copy is visible before opening.
- **Animation:** Use short 180–260ms ease-out transitions for hover, cart drawer, and tab state. Avoid looping motion except a very subtle hero signal pulse; respect reduced-motion preferences.
- **Typography system:** Space Grotesk for display/headings and Inter for body, metadata, and buttons. Display hierarchy: 12px eyebrow, clamp(3rem, 10vw, 7rem) hero, 1.05rem product title, 0.8rem metadata.
- **Brand essence:** “Small digital moves, shipped with clarity.” Personality: direct, energetic, dependable.
- **Brand voice:** Headlines are concise and practical; CTAs use verbs and outcomes. Example lines: “Pick the signal you want to send.” / “Pay your way. Send proof only when you’re ready.”
- **Wordmark & logo:** A compact BISU wordmark with the U formed as an open signal loop; use a small violet node as the mark beside the text.
- **Signature brand color:** BISU Violet `#7C5CFC`.

## Implementation approach

1. Use the initialized Webdev React/Express project with server enabled.
2. Enable Shopify through the dedicated Webdev integration flow. Storefront credentials remain managed by Webdev and are never committed.
3. Implement a server-side Shopify Storefront API adapter in `server/shopify.ts` for products, cart creation, cart line updates, cart line deletion, and checkout URL retrieval. When Shopify is not yet configured during local Preview, the UI falls back to the approved safe catalog so the storefront remains inspectable.
4. Expose `/api/shopify/*` Express endpoints that proxy the server-side Storefront calls. Keep cart identifiers in an `HttpOnly; Secure; SameSite=None` cookie for public HTTPS Preview, with a plain-HTTP local fallback.
5. Build a React storefront with a responsive editorial layout, safe catalog, cart drawer, checkout handoff, external Razorpay buttons, and explicit WhatsApp support instructions.
6. Keep external payment-link services as customer-invoked actions. Do not claim payment verification, auto-upload screenshots, or automatically forward data.
7. Add route metadata and a `/manus-routes.json` manifest for the home storefront route.

## Project structure

- `client/src/pages/Home.tsx` — storefront shell, hero, catalog, payment/support sections, cart drawer.
- `client/src/index.css` — BISU visual system, layout utilities, responsive behavior, reduced-motion rules.
- `client/src/lib/shopify.ts` — browser-facing API helpers and safe catalog fallback data.
- `server/shopify.ts` — Storefront API operations and typed normalization.
- `server/_core/index.ts` — Express API routes and cart cookie handling.
- `client/public/manus-routes.json` — route manifest for the home page.
- `app.config.ts` — project logo metadata.
- `plan.md` — this implementation and design plan.

## Material constraints

- Do not publish the unsafe requested listings.
- Do not expose Shopify tokens or use raw Admin HTTP calls.
- Do not add Stripe; Shopify and Stripe are mutually exclusive for this project.
- Do not publish until the Shopify connection, catalog behavior, cart persistence, and checkout handoff are verified.
