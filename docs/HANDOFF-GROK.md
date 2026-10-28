# Frenchie Dad Club: theme ↔ store handoff

This repo is the Shopify theme. **Claude** writes the theme code here. **Grok** runs the store: products, Printful, payments, shipping, taxes, apps, domain and emails. This doc is the contract between the two, so neither side breaks the other.

## 1. Who owns what

| Area | Owner | Where it lives |
|---|---|---|
| Layout, sections, snippets, CSS, JS (`layout/`, `sections/*.liquid`, `snippets/`, `assets/`, `locales/`, `config/settings_schema.json`) | Claude (via GitHub) | This repo |
| Products, variants, prices, photos, collections, menus, policies, apps, domain, checkout, emails | Grok (Shopify admin) | Shopify admin |
| Theme editor content: text, images and order of sections (`templates/*.json`, `sections/*-group.json`, `config/settings_data.json`) | Grok (theme editor) | Shopify writes it back to the repo |

**Rule:** Grok doesn't hand-edit code files. Claude doesn't change `templates/*.json`, `sections/*-group.json` or `config/settings_data.json` on `main` after launch without asking first. When the theme editor saves, Shopify commits those JSON files back to the connected branch, so an edit from both sides at once can conflict.

## 2. Branches and themes

- `main` → connect to the **live** theme. Only reviewed work goes here.
- `dev` → connect to a second, **unpublished** theme for previews. Claude works here; the owner approves before merging to `main`.

Connect each one in Shopify admin → Online Store → Themes → Add theme → Connect from GitHub. Pick the repo and branch.

## 3. Product setup the theme depends on

### Product type = shop category (must match exactly)
The category buttons on the homepage and collection pages filter by each product's **Type** field:

| Type | Products |
|---|---|
| `Hats` | Classic Dad Hat, Vintage Wash, Rope Hat, Trucker, Performance, Corduroy, Camo |
| `Tees` | Classic Tee, Vintage Wash Tee, Premium Tee |
| `Hoodies` | Classic Hoodie |
| `Drinkware` | Ceramic Mug, Insulated Tumbler |
| `Extras` | Canvas Tote, Dog Bandana, Sticker, Gift Card (and Keychain if a supplier is found) |

The list and its order can be changed in the theme editor (Shop grid → "Categories"), but the spelling must match the Type field.

### Colors as variants, not separate products
Make one product per style (e.g. "Classic Tee") with a **Color** option and a **Size** option. The card shows "3 colors" or the single color name, and the product page shows a picker. The option must be named `Color` (or `Colour`).

Assign each variant its own photo in Shopify so the product page switches photos when a color is picked.

### Badges come from tags
Add a tag that starts with `badge:` to show a black label on the product photo:

- `badge:Bestseller` → Classic Dad Hat, Classic Tee
- `badge:New` → Performance hat, Sand hoodie
- `badge:For the dog` → Dog Bandana

The first `badge:` tag found is the one shown. Other tags are ignored.

### Gift card
Create it as a Shopify **gift card product** with Type `Extras`. The theme shows it as a black tile with the logo, and `templates/gift_card.liquid` styles the page customers get by email.

### Single-variant products
Products with no options (e.g. Sticker) get an "Add to cart" button right on the card. Everything else shows "Choose options" and links to the product page.

## 4. Customer tags from the theme's forms

| Form | Where | Tags added |
|---|---|---|
| Join the club | Footer of every page | `newsletter` |
| Custom hat waitlist | Homepage "Coming soon" section | `custom-waitlist` |
| Pre-launch signup | Password page | `newsletter`, `prelaunch` |

Use these tags as segments in Shopify Email or Klaviyo. **Custom hats are not orderable yet**: the waitlist only collects emails. Don't create a "Personalized hat" product until the custom-embroidery flow is confirmed with Printful.

## 5. Menus and pages to create

- Menu **`main-menu`**: Shop (`/collections/all`), Details (`/#details`), Coming soon (`/#custom`), About (`/#story`)
- Menu **`footer`**: Shipping, Returns & exchanges, Contact, Privacy, Terms
- Pages: Shipping, Returns & exchanges (30-day exchanges, no returns on custom items), Contact, plus Shopify's generated policies (Settings → Policies)

## 6. Store settings the copy relies on

The theme text promises these things, so the store must match or the text must change:

- **Free shipping over $50** (announcement bar, product page perks)
- **Ships in 3 to 5 business days** after production (Printful's typical time)
- **30-day exchanges**
- **Gift notes** at checkout and **no prices on the packing slip** (Printful → Settings → Packing slip)

## 7. Images

The theme ships with AI concept photos as stand-ins for the hero, detail tiles and story photo. Replace them in the theme editor (each section has an image picker; the stand-in shows only until one is picked). Product photos come from Printful mockups or sample photos uploaded to each product.

## 8. Before launch checklist (store side)

- [ ] Shopify plan, payments, domain (frenchiedadclub.com)
- [ ] Printful app connected; products synced with the Types, Color option and tags above
- [ ] Samples ordered and checked (embroidery detail on the logo, sizing)
- [ ] Menus `main-menu` and `footer`; policy pages
- [ ] Shipping rates incl. free over $50; taxes
- [ ] Customer accounts: use Shopify's new customer accounts (the theme has no classic account pages)
- [ ] Google & YouTube and Facebook & Instagram channels
- [ ] Password page on until launch (the theme's password page collects launch signups)
- [ ] Test order end to end on the `dev` preview theme

## 9. Asking for theme changes

Grok or the owner: open a GitHub issue (or tell the owner), describing the page and what should change. Claude makes the change on `dev`, the owner previews it, then it's merged to `main`.
