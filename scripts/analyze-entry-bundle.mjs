#!/usr/bin/env node
/**
 * analyze-entry-bundle — QUE contient le lot d'entrée, et POURQUOI (BUNDLE_BOUNDARIES.md §6).
 *
 *   node scripts/analyze-entry-bundle.mjs                 # build d'analyse + rapport
 *   node scripts/analyze-entry-bundle.mjs --reuse <dir>   # rapport sur un build d'analyse existant
 *   node scripts/analyze-entry-bundle.mjs --chain <suffixe de chemin>   # + la chaîne d'imports qui l'amène
 *   node scripts/analyze-entry-bundle.mjs --budget <Ko gzip>            # PORTE : échoue au-delà (npm run check:entry-budget)
 *   node scripts/analyze-entry-bundle.mjs --dist apps/web/dist --budget <Ko gzip>
 *       # même porte sur un build DÉJÀ fait (CI, après « Build ») : le JS initial = le <script type="module"> de
 *       # index.html et ses <link rel="modulepreload">, ce que le navigateur charge avant le premier rendu.
 *
 * Mesures : JS initial (le chunk d'entrée et ses imports statiques), brut et gzip -9 ; puis le
 * contenu par zone et les plus gros modules (taille RENDUE) ; puis, pour chaque --chain, le plus
 * court chemin d'imports STATIQUES depuis src/main.jsx. Écrit dans un dossier temporaire.
 *
 * Le BUDGET (2026-10-14, BUNDLE_BOUNDARIES.md §4 règle 10) : fixé juste au-dessus de la mesure. Une leçon, un
 * namespace ou un moteur qui fuit dans le lot d'entrée le fait échouer — on corrige la fuite, on ne relève pas le
 * budget sans le documenter (§5).
 */
import { readFileSync, mkdtempSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const reuse = argv.includes('--reuse') ? argv[argv.indexOf('--reuse') + 1] : null;
const chains = argv.flatMap((a, i) => (a === '--chain' ? [argv[i + 1]] : []));
const budget = argv.includes('--budget') ? Number(argv[argv.indexOf('--budget') + 1]) : null;
const dist = argv.includes('--dist') ? argv[argv.indexOf('--dist') + 1] : null;

function checkBudget(gzKb) {
  if (budget == null) return;
  if (!Number.isFinite(budget)) { console.error('✗ --budget attend un nombre de Ko gzip'); process.exit(2); }
  if (gzKb > budget) {
    console.error(`\n✗ BUDGET DU LOT D'ENTRÉE DÉPASSÉ : ${gzKb.toFixed(1)} Ko gzip > ${budget} Ko.`);
    console.error('  Quelque chose est entré dans le premier téléchargement de chaque visiteur. Trouvez-le :');
    console.error('  node scripts/analyze-entry-bundle.mjs --chain <module>   (docs/architecture/BUNDLE_BOUNDARIES.md §5–§6)');
    process.exit(1);
  }
  console.log(`✅ Lot d'entrée dans le budget : ${gzKb.toFixed(1)} Ko gzip ≤ ${budget} Ko.`);
}

if (dist) {
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  const files = new Set([
    ...[...html.matchAll(/<script[^>]*type="module"[^>]*src="\/?([^"]+\.js)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="\/?([^"]+\.js)"/g)].map((m) => m[1]),
  ]);
  if (files.size === 0) { console.error(`✗ aucun script module dans ${dist}/index.html`); process.exit(2); }
  let raw = 0; let gz = 0;
  for (const f of files) { const b = readFileSync(join(dist, f)); raw += b.length; gz += gzipSync(b, { level: 9 }).length; }
  console.log(`JS initial (${dist}) : ${files.size} fichier(s), ${(raw / 1024).toFixed(1)} KB brut, ${(gz / 1024).toFixed(1)} KB gzip`);
  checkBudget(gz / 1024);
  process.exit(0);
}

const OUT = reuse ?? mkdtempSync(join(tmpdir(), 'sa-entry-'));

if (!reuse) {
  const r = spawnSync('npx', ['vite', 'build', '--config', 'vite.analyze.config.js', '--logLevel', 'error'], {
    cwd: join(ROOT, 'apps/web'), stdio: 'inherit',
    env: { ...process.env, ANALYZE_OUT: OUT, NODE_OPTIONS: '--max-old-space-size=8192' },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const chunks = JSON.parse(readFileSync(join(OUT, 'chunks.json'), 'utf8'));
const graph = JSON.parse(readFileSync(join(OUT, 'graph.json'), 'utf8'));
const short = (id) => id.replace(`${ROOT}/`, '');
const initial = new Set();
const walk = (n) => { if (initial.has(n)) return; initial.add(n); for (const i of chunks[n]?.imports ?? []) walk(i); };
for (const [n, c] of Object.entries(chunks)) if (c.isEntry) walk(n);

let raw = 0; let gz = 0;
for (const n of initial) { const b = readFileSync(join(OUT, 'dist', n)); raw += b.length; gz += gzipSync(b, { level: 9 }).length; }
console.log(`JS initial : ${initial.size} fichier(s), ${(raw / 1024).toFixed(1)} KB brut, ${(gz / 1024).toFixed(1)} KB gzip — ${OUT}`);
if (budget != null && !chains.length) { checkBudget(gz / 1024); process.exit(0); }

const mods = [...initial].flatMap((n) => Object.entries(chunks[n].modules));
const area = (id) => {
  const m = short(id);
  if (m.includes('node_modules/')) { const p = m.split('node_modules/').pop().split('/'); return `npm:${p[0].startsWith('@') ? `${p[0]}/${p[1]}` : p[0]}`; }
  if (m.includes('/lessons/moyen/')) return `${m.split('/lessons/moyen/')[0]}/lessons/moyen/** (${m.split('/').pop()})`;
  return m.split('/').slice(0, 5).join('/');
};
const by = new Map();
for (const [id, l] of mods) by.set(area(id), (by.get(area(id)) ?? 0) + l);
console.log('\nPar zone (taille rendue, brute) :');
for (const [a, l] of [...by].sort((x, y) => y[1] - x[1]).slice(0, 30)) console.log(`${(l / 1024).toFixed(1).padStart(8)} KB  ${a}`);
console.log('\nPlus gros modules :');
for (const [id, l] of mods.sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(`${(l / 1024).toFixed(1).padStart(8)} KB  ${short(id)}`);

const main = Object.keys(graph).find((i) => i.endsWith('/src/main.jsx'));
for (const target of chains) {
  const prev = new Map([[main, null]]); const q = [main]; let hit = null;
  while (q.length && !hit) { const x = q.shift(); if (x.endsWith(target)) hit = x; for (const y of graph[x]?.imports ?? []) if (!prev.has(y)) { prev.set(y, x); q.push(y); } }
  const path = []; for (let y = hit; y; y = prev.get(y)) path.unshift(short(y));
  console.log(`\nChaîne vers « ${target} » :\n  ${hit ? path.join('\n  → ') : '(pas dans le graphe statique)'}`);
}
checkBudget(gz / 1024);
