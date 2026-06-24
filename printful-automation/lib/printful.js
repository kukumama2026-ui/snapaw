const PRINTFUL_API_BASE = 'https://api.printful.com';

async function printfulRequest(path, options = {}) {
  const res = await fetch(`${PRINTFUL_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Printful API error (${res.status}): ${data?.error?.message || res.statusText}`);
  }
  return data.result;
}

/**
 * Places an order directly with Printful using catalog variant IDs and a
 * print-ready artwork URL. `confirm: true` means the order is placed for
 * real (and charged) immediately — switch to `false` for a draft order you
 * approve manually first.
 */
export async function createOrder({ printfulVariantId, artworkUrl, quantity, recipient, externalId }) {
  return printfulRequest('/orders?confirm=true', {
    method: 'POST',
    body: JSON.stringify({
      external_id: externalId,
      recipient: {
        name: recipient.name,
        address1: recipient.address1,
        address2: recipient.address2 || undefined,
        city: recipient.city,
        state_code: recipient.state_code,
        country_code: recipient.country_code,
        zip: recipient.zip,
        email: recipient.email,
        phone: recipient.phone || undefined,
      },
      items: [
        {
          variant_id: printfulVariantId,
          quantity,
          files: [{ url: artworkUrl }],
        },
      ],
    }),
  });
}
