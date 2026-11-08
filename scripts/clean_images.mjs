#!/usr/bin/env node
// Photo hygiene for a public repo.
//   node scripts/clean_images.mjs --check   report photos with metadata (EXIF/GPS), oversize, or an
//                                           unsupported format (HEIC, GIF); exit 1 if any
//   node scripts/clean_images.mjs --fix     rewrite them: auto-rotate, strip metadata (keep colour profile),
//                                           max 2560 px on the long side, re-encode in the same format.
//                                           Exits 1 if metadata is left or a HEIC/HEIF is present (both
//                                           privacy); leftover size and GIFs are printed as warnings.
// Run by scripts/check.sh (--check) and by .github/workflows/images.yml (--fix) after admin uploads.
import { readdir, stat, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const ROOTS = ['src/assets', 'public'];
const MAX_SIDE = 2560;
const MAX_BYTES = 2 * 1024 * 1024;
const EDITABLE = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const REFUSED = new Set(['.heic', '.heif', '.gif']);

const mode = process.argv[2];
if (mode !== '--check' && mode !== '--fix') {
  console.error('usage: clean_images.mjs --check | --fix');
  process.exit(2);
}

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

function problems(meta, bytes) {
  const privacy = [];
  const size = [];
  if (meta.exif) privacy.push('has EXIF metadata (may include location)');
  if (meta.xmp || meta.iptc) privacy.push('has XMP/IPTC metadata');
  if (Math.max(meta.width ?? 0, meta.height ?? 0) > MAX_SIDE) size.push(`larger than ${MAX_SIDE} px`);
  if (bytes > MAX_BYTES) size.push('over 2 MB');
  return { privacy, size, all: [...privacy, ...size] };
}

async function clean(file, ext) {
  let img = sharp(file).rotate().resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true }).keepIccProfile();
  if (ext === '.png') img = img.png({ compressionLevel: 9 });
  else if (ext === '.webp') img = img.webp({ quality: 85 });
  else if (ext === '.avif') img = img.avif({ quality: 60 });
  else img = img.jpeg({ quality: 85, mozjpeg: true });
  const buf = await img.toBuffer(); // read fully before overwriting the same file
  await writeFile(file, buf);
}

let bad = 0; // fails the run: --check: anything; --fix: metadata left
let warned = 0; // --fix only: size or format problems that need a person
let fixed = 0;
let seen = 0;
for (const root of ROOTS) {
  for await (const file of walk(root)) {
    const ext = extname(file).toLowerCase();
    if (REFUSED.has(ext)) {
      console.log(`${file}: ${ext.slice(1).toUpperCase()} isn't supported; export as JPEG or PNG before uploading`);
      // HEIC can't be cleaned here and iPhone HEIC carries GPS by default: always fail on it.
      if (mode === '--fix' && ext === '.gif') warned++;
      else bad++;
      continue;
    }
    if (!EDITABLE.has(ext)) continue;
    seen++;
    const { size } = await stat(file);
    const found = problems(await sharp(file).metadata(), size);
    if (found.all.length === 0) continue;
    if (mode === '--fix') {
      await clean(file, ext);
      fixed++;
      const after = problems(await sharp(file).metadata(), (await stat(file)).size);
      if (after.privacy.length) {
        console.log(`${file}: STILL ${after.privacy.join(', ')}`);
        bad++;
      } else if (after.size.length) {
        console.log(`${file}: cleaned, but still ${after.size.join(', ')} (warning)`);
        warned++;
      } else {
        console.log(`${file}: cleaned (${found.all.join(', ')})`);
      }
    } else {
      console.log(`${file}: ${found.all.join(', ')}`);
      bad++;
    }
  }
}
console.log(`images: ${seen} checked, ${fixed} cleaned, ${bad} problems${warned ? `, ${warned} warnings` : ''}`);
process.exit(bad ? 1 : 0);
