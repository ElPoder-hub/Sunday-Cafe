// Локальный сервер сайта SUNDAY: node server.mjs [порт]   (по умолчанию 8080)
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.argv[2] || process.env.PORT || 8080)
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.png': 'image/png', '.ico': 'image/x-icon' }
const allowed = new Set(['index.html', 'style.css', 'app.js', 'favicon.svg'])

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html'
  const ok = allowed.has(p) || /^(img|fonts)\/[\w.-]+$/.test(p)
  const file = path.join(root, p)
  if (!ok || !file.startsWith(root) || !fs.existsSync(file)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Не найдено')
  }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' })
  fs.createReadStream(file).pipe(res)
}).listen(port, '0.0.0.0', () => console.log(`SUNDAY: http://localhost:${port}`))
