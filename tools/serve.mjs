import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) || relative.split(/[\\/]/).some(part => part.startsWith('.') || ['node_modules', 'tools', 'qa'].includes(part))) {
      response.writeHead(403); response.end('Forbidden'); return;
    }
    const body = await readFile(file);
    const extension = path.extname(file);
    const compress = ['.html','.css','.js','.svg'].includes(extension) && /gzip/.test(request.headers['accept-encoding'] || '');
    const headers = { 'Content-Type': types[extension] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'Vary': 'Accept-Encoding' };
    if (compress) headers['Content-Encoding'] = 'gzip';
    response.writeHead(200, headers);
    response.end(compress ? gzipSync(body) : body);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Haus Majstor: http://127.0.0.1:${port}`));
