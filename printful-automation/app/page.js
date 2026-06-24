export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Snapaw Printful Automation</h1>
      <p>This service exposes API endpoints used by the Snapaw Club product page widget:</p>
      <ul>
        <li><code>POST /api/upload</code> — store a customer photo</li>
        <li><code>POST /api/transform</code> — generate a memorial-style AI portrait</li>
        <li><code>POST /api/webhooks/shopify-order</code> — auto-place Printful orders</li>
      </ul>
      <p>See <code>README.md</code> for setup details.</p>
    </main>
  );
}
