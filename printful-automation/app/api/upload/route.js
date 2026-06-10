import { put } from '@vercel/blob';

export async function POST(request) {
  const form = await request.formData();
  const file = form.get('file');

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const key = `uploads/${crypto.randomUUID()}.${ext}`;

  const blob = await put(key, file, {
    access: 'public',
    contentType: file.type,
  });

  return Response.json({ url: blob.url });
}
