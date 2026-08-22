// Zero-dependency static file server for local testing only. Production
// serves site/public/ directly from Nginx -- this is purely a dev convenience
// so there's no need to stand up a whole web server just to preview static
// HTML/CSS/JS.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.env.PORT) || 4500;
const ROOT = join(import.meta.dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

createServer(async (req, res) => {
  try {
    let urlPath = normalize(decodeURIComponent(req.url.split('?')[0]));
    if (urlPath === '/' || urlPath === '\\') urlPath = '/index.html';
    const filePath = join(ROOT, urlPath);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    const st = await stat(filePath).catch(() => null);
    if (!st || !st.isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
      return;
    }
    const body = await readFile(filePath);
    res.writeHead(200, { 'content-type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(body);
  } catch (err) {
    res.writeHead(500).end('Internal error');
    console.error(err);
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Spur Protocol site (dev) at http://127.0.0.1:${PORT}`);
});
