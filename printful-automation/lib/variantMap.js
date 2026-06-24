/**
 * Maps a Shopify variant ID (numeric, from the line item's variant_id) to the
 * matching Printful catalog product + variant. These are catalog variant IDs
 * (not "sync variant" IDs) because this store places orders directly via the
 * Printful Orders API rather than through Printful's Shopify sync app.
 *
 * Re-derive these with `node -r dotenv/config scripts/list-printful-variants.js`
 * if products/variants change.
 */
export const VARIANT_MAP = {
  // Cherished Moment Pet Memorial Mug
  61882768458098: { printfulProductId: 19, printfulVariantId: 1320 }, // 350ml -> 11oz White Glossy Mug
  61882768490866: { printfulProductId: 19, printfulVariantId: 4830 }, // 500ml (Large) -> 15oz White Glossy Mug

  // Forever Garden Pet Memorial Pillow
  61882768523634: { printfulProductId: 83, printfulVariantId: 4532 }, // Small (40x40cm) -> 18"x18" Basic Pillow
  61882768556402: { printfulProductId: 83, printfulVariantId: 11075 }, // Large (50x50cm) -> 22"x22" Basic Pillow

  // Guardian Among the Stars Memorial Phone Case
  61882768654706: { printfulProductId: 181, printfulVariantId: 17616 }, // iPhone 15 / 15 Pro
  61882768687474: { printfulProductId: 181, printfulVariantId: 20290 }, // iPhone 16 / 16 Pro
  61882768720242: { printfulProductId: 267, printfulVariantId: 18734 }, // Galaxy S24 / S24+
  61882768753010: { printfulProductId: 267, printfulVariantId: 21481 }, // Galaxy S25 / S25+

  // Gentle Clouds Pet Memorial Blanket
  61882769113458: { printfulProductId: 395, printfulVariantId: 22609 }, // Small (100x140cm) -> 30"x40" Throw Blanket
  61882769146226: { printfulProductId: 395, printfulVariantId: 10986 }, // Large (130x170cm) -> 50"x60" Throw Blanket

  // Pet Memorial Portrait Canvas
  61888824672626: { printfulProductId: 3, printfulVariantId: 19293 }, // 8x10 inch (Small)
  61888824705394: { printfulProductId: 3, printfulVariantId: 5 }, // 12x16 inch (Medium)
  61888824738162: { printfulProductId: 3, printfulVariantId: 6 }, // 16x20 inch (Large)
  61888824770930: { printfulProductId: 3, printfulVariantId: 19309 }, // 20x24 inch (XL)

  // Rainbow Bridge Pet Memorial Tote
  61888824869234: { printfulProductId: 367, printfulVariantId: 10458 }, // Natural Canvas -> Oyster
  61888824902002: { printfulProductId: 367, printfulVariantId: 10457 }, // Black Canvas

  // Until We Meet Again Framed Print
  61973529231730: { printfulProductId: 614, printfulVariantId: 17627 }, // 8x10 inch -> Framed Canvas (in) Black 8"x10"
  61973529264498: { printfulProductId: 614, printfulVariantId: 17629 }, // 11x14 inch -> Framed Canvas (in) Black 11"x14"

  // In Loving Memory Ornament
  61973529297266: { printfulProductId: 881, printfulVariantId: 22783 }, // Heart -> Ceramic Ornament (Heart)
  61973529330034: { printfulProductId: 881, printfulVariantId: 22782 }, // Circle -> Ceramic Ornament (Circle)
};

export function lookupPrintfulVariant(shopifyVariantId) {
  return VARIANT_MAP[Number(shopifyVariantId)] || null;
}
