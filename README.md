# Frenchie Dad Club Shopify theme

Custom Online Store 2.0 theme for Frenchie Dad Club, built from the approved mockup: off-white paper, black, Montserrat, and the logo's underline rule repeated through every section.

**Store setup and the code/store split: read [docs/HANDOFF-GROK.md](docs/HANDOFF-GROK.md).**

## What's in it

| Page | Sections |
|---|---|
| Home (`templates/index.json`) | Hero, Shop grid with category buttons, Details, Custom hat waitlist (live preview), Story, Perks |
| Every page (section groups) | Header with announcement bar, "Join the club" signup, Footer |
| Product | Gallery, Color/Size picker, add to cart, Shopify's dynamic checkout buttons, Perks |
| Collection, Search, Collections list, Cart, Page, 404 | Matching styles |
| Password | Pre-launch page that collects signups |
| Gift card | Styled gift card email page |

Adding to cart opens a slide-out cart (Shopify's AJAX cart API). Every form also works without JavaScript.

## Layout

```
layout/      theme.liquid, password.liquid
templates/   JSON templates (edited through the theme editor) + gift_card.liquid
sections/    one file per section; header-group.json / footer-group.json
snippets/    product-card, product-grid, cart-drawer, section-image, meta-tags
assets/      base.css, theme.js, custom-hat.js, logo files, stand-in photos
config/      settings_schema.json (theme settings), settings_data.json (saved values)
```

## Working on it

Install [Shopify CLI](https://shopify.dev/docs/api/shopify-cli), then:

```bash
shopify theme dev --store frenchiedadclub.myshopify.com
```

```bash
shopify theme check
```

Branches: `dev` is connected to an unpublished preview theme; `main` is connected to the live theme.
