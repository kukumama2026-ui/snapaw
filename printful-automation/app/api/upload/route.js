import { put } from '@vercel/blob';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request) {
  const form = await request.formData();
  const file = form.get('file');

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400, headers: CORS_HEADERS });
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const key = `uploads/${crypto.randomUUID()}.${ext}`;

  const blob = await put(key, file, {
    access: 'public',
    contentType: file.type,
    token: process.env.UPLOADS_READ_WRITE_TOKEN,
  });

  return Response.json({ url: blob.url }, { headers: CORS_HEADERS });
}
