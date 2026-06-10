# Snapaw Printful Automation

Backend service supporting the "Global Culture Series" personalization flow for
Snapaw Club. Full automation is currently paused — the flow is now:

1. Customer uploads their pet's photo and picks a culture theme on the product page.
2. Customer places the order as normal.
3. The order webhook logs which line items have a customer photo attached.
4. **You** generate the AI artwork manually and place the order on Printful manually.

## Architecture

1. **`/api/upload`** — receives the customer's raw photo, stores it in Vercel Blob, returns a URL.
2. **`widget/upload-widget.js`** — embeddable script for the Shopify product page. Adds an
   upload + theme picker UI, calls `/api/upload`, and writes the photo URL and chosen
   theme into hidden `properties[_customer_photo_url]` / `properties[Culture Theme]`
   fields on the Add to Cart form so they travel with the order as line item properties.
3. **`/api/webhooks/shopify-order`** — Shopify calls this when an order is created. For
   each line item with a `_customer_photo_url` property, it logs the recipient, theme,
   and photo URL so they can be picked up for manual processing.

## Setup

### 1. Install dependencies

```
cd printful-automation
npm install
```

### 2. Get API keys

| Key | Where to get it |
|---|---|
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

## Manual order workflow

For each new order, check the webhook logs (Vercel → project → Deployments →
Functions → `/api/webhooks/shopify-order`) for entries with a `photoUrl`. For each:

1. Download the customer's photo from `photoUrl`.
2. Generate the Global Culture Series artwork yourself for the chosen `theme`.
3. Place the order in the Printful dashboard using that artwork and the `recipient` info.

## Re-enabling automation later

The previous AI generation (Replicate) and auto-Printful-order code was removed for
now. If/when this flow is working reliably and you want to automate it again, that
code can be rebuilt: an `/api/transform` endpoint calling Replicate, and a Printful
`createOrder` call in the webhook handler keyed off a Shopify variant → Printful sync
variant map.
