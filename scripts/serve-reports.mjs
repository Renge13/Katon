#!/usr/bin/env node
// ============================================================
// scripts/serve-reports.mjs — static server for reports/
// ============================================================
//   npm run serve:reports        http://localhost:4178/
//
// WHY THIS EXISTS, AND IT IS NOT CONVENIENCE. `reports/card-export-probe.html`
// reads pixels back out of a canvas with `getImageData`, and that is a
// same-origin operation. Opened as a `file://` document — or as the `data:`
// snapshot a preview pane makes of one — the page has an OPAQUE origin, so every
// image drawn into the canvas taints it and the read throws a SecurityError. The
// probe cannot assert anything about pixels from there.
//
// Served over http://localhost the origin is real, the canvas is clean, and the
// readback works. Nothing else in this repo needs a server; the other report
// pages are static and open fine from the filesystem.
//
// Deliberately dependency-free (no `serve`, no express): the repo has no static
// server in its tree and adding one to run a probe would be a dependency for a
// dev tool. Node's own `http` is enough for four files on localhost.
// ============================================================

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'reports');
const PORT = Number(process.env.PORT || 4178);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const rel = url === '/' ? 'index.html' : url.replace(/^\/+/, '');
  // LOCALHOST ONLY AND reports/ ONLY. Resolve, then check the result is still
  // inside DIR — a `..` segment that escapes is the whole class of bug a
  // hand-rolled static server exists to have, so it is closed explicitly rather
  // than by trusting the path to be well-formed.
  const file = path.resolve(DIR, rel);
  if (!file.startsWith(DIR + path.sep) && file !== DIR) {
    res.writeHead(403).end('outside reports/');
    return;
  }
  fs.readFile(file, (err, buf) => {
    if (err) {
      const list = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith('.html')) : [];
      res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'content-type': 'text/html; charset=utf-8' });
      res.end(`<h1>${err.code}</h1><ul>${list.map((f) => `<li><a href="/${f}">${f}</a></li>`).join('')}</ul>`);
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
});

// 127.0.0.1, not 0.0.0.0: this serves generated review pages off a working tree
// and has no business being reachable from the network.
server.listen(PORT, '127.0.0.1', () => {
  console.log(`serving ${path.relative(ROOT, DIR)} at http://localhost:${PORT}/`);
  for (const f of fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((x) => x.endsWith('.html')) : []) {
    console.log(`  http://localhost:${PORT}/${f}`);
  }
});
