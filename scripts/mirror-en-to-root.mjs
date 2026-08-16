import fs from 'fs';
import path from 'path';

const OUT_DIR = path.join(process.cwd(), 'out');
const EN_DIR = path.join(OUT_DIR, 'en');

if (!fs.existsSync(EN_DIR)) {
  console.log('No en/ directory found, skipping mirror.');
  process.exit(0);
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  if (!exists) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    }
  } else {
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
    }
  }
}

copyRecursiveSync(EN_DIR, OUT_DIR);

const enHtml = path.join(OUT_DIR, 'en.html');
if (fs.existsSync(enHtml)) {
  fs.copyFileSync(enHtml, path.join(OUT_DIR, 'index.html'));
}

console.log('Mirrored en/ to root directory and created index.html');
