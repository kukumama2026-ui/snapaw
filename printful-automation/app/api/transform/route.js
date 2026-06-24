import { put } from '@vercel/blob';
import { transformImage, SUPPORTED_THEMES } from '../../../lib/replicate';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request) {
  const { imageUrl, theme } = await request.json();

  if (!imageUrl || !theme) {
    return Response.json({ error: 'imageUrl and theme are required' }, { status: 400, headers: CORS_HEADERS });
  }
  if (!SUPPORTED_THEMES.includes(theme)) {
    return Response.json({ error: `Unknown theme: ${theme}` }, { status: 400, headers: CORS_HEADERS });
  }

  const replicateUrl = await transformImage(imageUrl, theme);

  const res = await fetch(replicateUrl);
  const blob = await res.blob();
  const key = `transformed/${crypto.randomUUID()}.png`;
  const uploaded = await put(key, blob, {
    access: 'public',
    contentType: 'image/png',
    token: process.env.UPLOADS_READ_WRITE_TOKEN,
  });

  return Response.json({ url: uploaded.url }, { headers: CORS_HEADERS });
}
