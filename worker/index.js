const json = (value, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });

export async function progressAPI(request, env) {
  const userId = request.headers.get('oai-authenticated-user-id');
  if (!userId) return json({ error: 'Sign in to open your saved Florir progress.' }, 401);
  if (!env.DB) return json({ error: 'Storage is temporarily unavailable.' }, 503);
  try {
    if (request.method === 'GET') {
      const row = await env.DB.prepare('SELECT payload, revision, updated_at FROM florir_progress WHERE user_id = ?').bind(userId).first();
      return json({ state: row ? JSON.parse(row.payload) : null, revision: row?.revision ?? 0, updatedAt: row?.updated_at ?? null });
    }
    if (request.method !== 'PUT') return json({ error: 'Method not allowed.' }, 405);
    if (![new URL(request.url).origin, 'https://florir.mark-twain.chatgpt.site'].includes(request.headers.get('Origin'))) return json({ error: 'Origin is not allowed.' }, 403);
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({ error: 'JSON required.' }, 415);
    if (Number(request.headers.get('Content-Length') || 0) > 300000) return json({ error: 'Your notes are too large to save together.' }, 413);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 300000) return json({ error: 'Your notes are too large to save together.' }, 413);
    let data;
    try { data = JSON.parse(raw); } catch { return json({ error: 'Invalid JSON.' }, 400); }
    if (!data.state || data.state.version !== 3 || !data.state.profile || !Array.isArray(data.state.notes) || !Array.isArray(data.state.plan) || !Number.isInteger(data.revision) || data.revision < 0) return json({ error: 'Invalid progress.' }, 400);
    const now = new Date().toISOString();
    const row = await env.DB.prepare('INSERT INTO florir_progress (user_id, payload, revision, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(user_id) DO UPDATE SET payload = excluded.payload, revision = florir_progress.revision + 1, updated_at = excluded.updated_at WHERE florir_progress.revision = ? RETURNING revision').bind(userId, JSON.stringify(data.state), now, data.revision).first();
    if (!row) return json({ error: 'Progress changed in another session. Reload before saving again.' }, 409);
    return json({ revision: row.revision, updatedAt: now });
  } catch (error) {
    console.error('Florir progress storage failed', error?.name || 'StorageError');
    return json({ error: 'Could not save right now. Your open draft is retained.' }, 503);
  }
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/progress') return progressAPI(request, env);
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
    const key = path === '/' ? '/index.html' : path.endsWith('/') ? path + 'index.html' : path;
    const asset = ASSETS[key];
    if (!asset) return new Response('Not found', { status: 404 });
    const headers = { 'Content-Type': asset[0], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
    if (request.method === 'HEAD') return new Response(null, { headers });
    const bytes = Uint8Array.from(atob(asset[1]), c => c.charCodeAt(0));
    return new Response(bytes, { headers });
  },
};
