import crypto from 'crypto';
import { createOrder } from '../../../../lib/printful';
import { lookupPrintfulVariant } from '../../../../lib/variantMap';

export const runtime = 'nodejs';

function verifyHmac(rawBody, hmacHeader) {
  const digest = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader || ''));
}

function findProperty(lineItem, name) {
  const prop = (lineItem.properties || []).find((p) => p.name === name);
  return prop ? prop.value : null;
}

export async function POST(request) {
  const rawBody = await request.text();
  const hmacHeader = request.headers.get('x-shopify-hmac-sha256');

  if (!verifyHmac(rawBody, hmacHeader)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const order = JSON.parse(rawBody);

  const recipient = {
    name: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
    address1: order.shipping_address.address1,
    address2: order.shipping_address.address2 || '',
    city: order.shipping_address.city,
    state_code: order.shipping_address.province_code,
    country_code: order.shipping_address.country_code,
    zip: order.shipping_address.zip,
    email: order.email,
    phone: order.shipping_address.phone || '',
  };

  const placed = [];
  const failed = [];

  for (const item of order.line_items) {
    const artworkUrl = findProperty(item, '_customer_photo_url');
    if (!artworkUrl) continue; // skip non-personalized items

    const printfulVariant = lookupPrintfulVariant(item.variant_id);
    if (!printfulVariant) {
      failed.push({ lineItemId: item.id, variantId: item.variant_id, reason: 'No Printful variant mapping found' });
      continue;
    }

    try {
      const printfulOrder = await createOrder({
        printfulVariantId: printfulVariant.printfulVariantId,
        artworkUrl,
        quantity: item.quantity,
        recipient,
        externalId: `${order.name}-${item.id}`,
      });
      placed.push({ lineItemId: item.id, printfulOrderId: printfulOrder.id });
    } catch (err) {
      console.error(`Failed to place Printful order for line item ${item.id}:`, err);
      failed.push({ lineItemId: item.id, variantId: item.variant_id, reason: err.message });
    }
  }

  if (failed.length) {
    console.error(`Order ${order.name}: ${failed.length} line item(s) failed Printful fulfillment`, failed);
  }

  return Response.json({ ok: true, placed, failed });
}
