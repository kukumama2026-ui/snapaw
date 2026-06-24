# Order Flow Test Checklist ($1 end-to-end test order)

Goal: confirm a customer can upload a photo, pick a memorial style, check out,
and Printful automatically receives a matching order with the AI-generated
artwork — before spending more time on images/design.

## Current status (checked 2026-06-10)

- [ ] **App deployed to Vercel** — unknown. Need the live URL
      (`https://YOUR-APP.vercel.app`) to proceed with the rest.
- [ ] **Env vars set in Vercel** — `BLOB_READ_WRITE_TOKEN`,
      `SHOPIFY_WEBHOOK_SECRET`, `SHOPIFY_ADMIN_API_TOKEN`,
      `SHOPIFY_STORE_DOMAIN=njthzk-fj.myshopify.com`.
- [x] **Shopify order webhook** — checked via Admin API: **none registered**.
      Needs `webhookSubscriptionCreate` once the Vercel URL + secret exist.
- [x] **Widget embed on product page** — checked the live "Dawn" theme's
      `templates/product.json`: **no `snapaw-upload-widget` block present**.
      The widget is not yet embedded on the "Global Culture Pet Portrait Canvas"
      product (or any product) on the live theme.
      (Note: recent banner/menu edits were made on the *draft* theme
      "Dawn - Banner Update Draft", which is still unpublished — separate from
      this widget gap.)

## Steps to run the test

1. **Deploy** `printful-automation/` to Vercel (`vercel`), add a Blob store,
   and set the env vars above.
2. **Embed the widget** on the "Pet Memorial Portrait Canvas" product
   page: add a Custom Liquid block (or app embed) with:
   ```html
   <div id="snapaw-upload-widget" data-api-base="https://YOUR-APP.vercel.app"></div>
   <script src="https://YOUR-APP.vercel.app/widget/upload-widget.js" defer></script>
   ```
   Once you share the Vercel URL, this can be added to the live theme directly.
3. **Register the order webhook** (Admin API `webhookSubscriptionCreate`,
   topic `ORDERS_CREATE`, address `https://YOUR-APP.vercel.app/api/webhooks/shopify-order`,
   format JSON) — Shopify will show the signing secret once; put it in
   `SHOPIFY_WEBHOOK_SECRET` and redeploy.
4. **Run the $1 test order**:
   - Set the Canvas product's cheapest variant price to $1 temporarily (or use
     a 100%-off discount code on a real-priced variant — cleaner, no price
     edit to revert).
   - On the live storefront, go to the product page, upload a test photo,
     pick a memorial style, add to cart, and complete checkout with a real
     card (small charge) or test payment if Shopify test mode is enabled.
5. **Verify**:
   - Order appears in Shopify Admin with `properties[_customer_photo_url]`
     (the AI-generated artwork URL) and `properties[Memorial Style]` on the line item.
   - Vercel function logs for `/api/webhooks/shopify-order` show a `placed` entry
     with a `printfulOrderId`.
   - The order shows up in the Printful dashboard with that artwork attached.
6. **Revert** any temporary price/discount changes after the test.

## Open questions for the operator

- Is `printful-automation` already deployed to Vercel? If yes, what's the URL?
- Do you want the widget embedded on just the Canvas product, or on all
  product pages (so Mug/Tote/etc. also get the upload flow)?
