# Snapaw Printful Automation

Backend service supporting the pet memorial portrait personalization flow for
Snapaw Club. The flow is fully automated:

1. Customer uploads their pet's photo and picks a memorial style on the product page.
2. The widget calls `/api/upload` then `/api/transform` to generate the AI memorial portrait.
3. Customer places the order as normal, with the finished artwork attached as a line item property.
4. The order webhook places a matching order with Printful automatically, using that artwork.

## Architecture

1. **`/api/upload`** — receives the customer's raw photo, stores it in Vercel Blob, returns a URL.
2. **`/api/transform`** — sends the photo + chosen memorial style to Replicate, generates the
   stylized portrait, re-hosts the result in Vercel Blob, returns the final URL.
3. **`widget/upload-widget.js`** — embeddable script for the Shopify product page. Adds an
   upload + style picker UI, calls the two endpoints above, and writes the resulting artwork
   URL into a hidden `properties[_customer_photo_url]` field on the Add to Cart form so it
   travels with the order as a line item property.
4. **`/api/webhooks/shopify-order`** — Shopify calls this when an order is created. For each
   line item with a `_customer_photo_url` property, it looks up the matching Printful catalog
   variant (see `lib/variantMap.js`) and places an order with Printful using that artwork.

## Setup

### 1. Install dependencies

```
cd printful-automation
npm install
```

### 2. Get API keys

| Key | Where to get it |
|---|---|
| `PRINTFUL_API_KEY` | printful.com → Settings → Stores → API access (private token) |
| `REPLICATE_API_TOKEN` | https://replicate.com/account/api-tokens |
| `REPLICATE_MODEL_VERSION` | `black-forest-labs/flux-kontext-pro` (already set) |
| `BLOB_READ_WRITE_TOKEN` | Auto-created when you add a Vercel Blob store to the project |
| `SHOPIFY_WEBHOOK_SECRET` | Set when you create the webhook (step 4) |
| `SHOPIFY_ADMIN_API_TOKEN` | Shopify admin → Settings → Apps → Develop apps → create app with `read_orders`, `read_products` scopes |

Copy `.env.example` to `.env.local` and fill these in for local testing.

### 3. Deploy to Vercel

```
npm i -g vercel
vercel
```

Add all env vars from `.env.example` in the Vercel project settings, and add a
Vercel Blob store (Storage tab → Create → Blob) which auto-populates `BLOB_READ_WRITE_TOKEN`.

### 4. Register the Shopify order webhook

In Shopify admin → Settings → Notifications → Webhooks → create webhook:
- Event: `Order creation`
- Format: JSON
- URL: `https://YOUR-APP.vercel.app/api/webhooks/shopify-order`

Shopify shows the signing secret once — put it in `SHOPIFY_WEBHOOK_SECRET`.

### 5. Embed the widget on product pages

In the Pagetify/Shopify product template, add a Custom Code block:

```html
<div id="snapaw-upload-widget" data-api-base="https://YOUR-APP.vercel.app"></div>
<script src="https://YOUR-APP.vercel.app/widget/upload-widget.js" defer></script>
```

## Variant mapping

This store places orders directly via the Printful Orders API (not Printful's Shopify
sync app), so each Shopify variant must map to a Printful **catalog** variant ID in
`lib/variantMap.js`. If products or variants change, re-derive the catalog IDs from
`https://api.printful.com/products/{id}` and update the map.

## Monitoring

Check the webhook logs (Vercel → project → Deployments → Functions →
`/api/webhooks/shopify-order`) after each order. Line items that fail (no variant
mapping, Printful API error) are logged with the reason so they can be placed manually
as a fallback.
