#!/usr/bin/env node
/**
 * Writes `src/features/books/data/dzCommunes.json` — the 1541 communes of the 58
 * wilayas, Arabic name + Latin transliteration (search only), grouped by wilaya
 * code and sorted in Arabic order. The book order form loads it lazily.
 *
 * Source: the official administrative division as published in
 * github.com/othmanus/algeria-cities (json/algeria_cities.json). Usage:
 *   curl -sfL -o /tmp/dz.json https://raw.githubusercontent.com/othmanus/algeria-cities/master/json/algeria_cities.json
 *   node apps/web/scripts/build-dz-communes.mjs /tmp/dz.json
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = process.argv[2];
if (!src) {
  console.error('usage: build-dz-communes.mjs <algeria_cities.json>');
  process.exit(1);
}

const rows = JSON.parse(readFileSync(src, 'utf8'));
const byWilaya = {};
for (const r of rows) {
  const code = String(Number(r.wilaya_code));
  (byWilaya[code] ??= []).push([r.commune_name.trim(), r.commune_name_ascii.trim()]);
}
const collator = new Intl.Collator('ar');
for (const list of Object.values(byWilaya)) list.sort((a, b) => collator.compare(a[0], b[0]));

const codes = Object.keys(byWilaya);
const total = Object.values(byWilaya).reduce((n, l) => n + l.length, 0);
if (codes.length !== 58 || total !== 1541) {
  console.error(`unexpected division: ${codes.length} wilayas, ${total} communes (expected 58 / 1541)`);
  process.exit(1);
}

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../src/features/books/data/dzCommunes.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(byWilaya)}\n`);
console.log(`wrote ${out}: ${codes.length} wilayas, ${total} communes`);
