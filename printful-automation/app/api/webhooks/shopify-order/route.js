import crypto from 'crypto';

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

  // Automatic AI generation + Printful ordering is paused. Just surface the
  // personalized line items so they can be picked up and processed manually:
  // generate the artwork, then place the order in the Printful dashboard.
  const personalizedItems = [];
  for (const item of order.line_items) {
    const photoUrl = findProperty(item, '_customer_photo_url');
    if (!photoUrl) continue; // skip non-personalized items

    personalizedItems.push({
      orderName: order.name,
      lineItemId: item.id,
      variantId: item.variant_id,
      theme: findProperty(item, 'Culture Theme'),
      photoUrl,
      recipient,
    });
  }

  if (personalizedItems.length) {
    console.log('New personalized order(s) awaiting manual processing:', JSON.stringify(personalizedItems, null, 2));
  }

  return Response.json({ ok: true, pendingItems: personalizedItems.length, items: personalizedItems });
}
