export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Snapaw Printful Automation</h1>
      <p>This service exposes API endpoints used by the Snapaw Club product page widget:</p>
      <ul>
        <li><code>POST /api/upload</code> — store a customer photo</li>
        <li><code>POST /api/webhooks/shopify-order</code> — log personalized orders for manual processing</li>
      </ul>
      <p>AI generation and Printful ordering are currently done manually. See <code>README.md</code> for details.</p>
    </main>
  );
}
