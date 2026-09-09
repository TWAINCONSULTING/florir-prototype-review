import { defineConfig } from 'vite';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { progressAPI } from './worker/index.js';

// Only the supervised local preview uses this local, isolated database.
// Published requests always use the authenticated Sites user and D1 binding.
export default defineConfig({
  server: { host: '0.0.0.0', allowedHosts: ['terminal.local'] },
  plugins: [{
    name: 'florir-preview-storage',
    configureServer(server) {
      mkdirSync('.preview-data', { recursive: true });
      const sqlite = new DatabaseSync('.preview-data/progress.sqlite');
      sqlite.exec('CREATE TABLE IF NOT EXISTS florir_progress (user_id TEXT PRIMARY KEY, payload TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL)');
      const DB = { prepare(sql) { return { bind(...values) { return { async first() { return sqlite.prepare(sql).get(...values) || null; } }; } }; } };
      server.middlewares.use('/api/progress', async (req, res) => {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const url = 'http://' + req.headers.host + '/api/progress';
        const headers = new Headers(req.headers);
        headers.set('oai-authenticated-user-id', 'isolated-local-preview');
        const request = new Request(url, { method: req.method, headers, ...(req.method === 'PUT' ? { body: Buffer.concat(chunks) } : {}) });
        const response = await progressAPI(request, { DB });
        res.statusCode = response.status;
        for (const [key, value] of response.headers) res.setHeader(key, value);
        res.end(await response.text());
      });
    },
  }],
});
