import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const routes = new Map([
  ['/', ['public/index.html', 'text/html; charset=utf-8']],
  ['/app.mjs', ['public/app.mjs', 'text/javascript; charset=utf-8']],
  ['/styles.css', ['public/styles.css', 'text/css; charset=utf-8']],
  ['/domain.mjs', ['src/domain.mjs', 'text/javascript; charset=utf-8']]
]);
export function createServer() {
  return http.createServer(async (req, res) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    const route = routes.get(req.url);
    if (!route || !['GET', 'HEAD'].includes(req.method)) { res.writeHead(404); res.end('Não encontrado'); return; }
    try { const body = await readFile(new URL(route[0], import.meta.url)); res.writeHead(200, { 'Content-Type': route[1] }); res.end(req.method === 'HEAD' ? undefined : body); }
    catch { res.writeHead(500); res.end('Não foi possível carregar o aplicativo.'); }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, '127.0.0.1', () => console.log(`DAIR Simulator: http://127.0.0.1:${port}`));
}
