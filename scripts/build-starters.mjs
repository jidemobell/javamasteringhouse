// scripts/build-starters.mjs
// Walks apphome/starters/* and produces apphome/public/starters/<name>.zip
// Run via npm scripts (predev / prebuild).

import { readdir, mkdir, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC_DIR = join(ROOT, 'starters');
const OUT_DIR = join(ROOT, 'public', 'starters');

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function zipDir(srcDir, outFile, rootInZip) {
  await mkdir(dirname(outFile), { recursive: true });
  return new Promise((res, rej) => {
    const out = createWriteStream(outFile);
    const archive = archiver('zip', { zlib: { level: 9 } });
    out.on('close', () => res(archive.pointer()));
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') console.warn(err);
      else rej(err);
    });
    archive.on('error', rej);
    archive.pipe(out);
    archive.directory(srcDir, rootInZip);
    archive.finalize();
  });
}

async function main() {
  if (!(await exists(SRC_DIR))) {
    console.log('[starters] no starters/ directory — skipping');
    return;
  }
  const entries = await readdir(SRC_DIR, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  if (dirs.length === 0) {
    console.log('[starters] no starter projects to package');
    return;
  }
  for (const name of dirs) {
    const src = join(SRC_DIR, name);
    const out = join(OUT_DIR, `${name}.zip`);
    const bytes = await zipDir(src, out, name);
    console.log(`[starters] ${name}.zip — ${bytes} bytes`);
  }
}

main().catch((err) => {
  console.error('[starters] build failed:', err);
  process.exit(1);
});
