#!/usr/bin/env node
/**
 * NO DEAD FILE in apps/web/src: every source file is reached from the app's entry (`main.jsx`) through static imports,
 * literal dynamic imports and `import.meta.glob`, or it is a test, or it is named below with its reason.
 * (docs/reports/LESSON_V2_MASTER_PLAN.md §2.4 and §4 step 3.)
 *
 *   node scripts/check-unreached.mjs           fails when a file is reached by nothing
 *   node scripts/check-unreached.mjs --list    prints the files, without failing
 *
 * It sees FILES, not unused exports inside a live file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'apps/web/src');
const ENTRY = path.join(SRC, 'main.jsx');

/** Files kept on purpose although the app does not reach them. Each line says why. */
const KEPT = {
  // Helpers of the games' simulation tests: imported by `sim.test.js` files only.
  'features/madar/defense/bound.js': 'test helper',
  'features/madar/engine/bound.js': 'test helper',
  'features/madar/mental/bound.js': 'test helper',
  'features/madar/odd/bound.js': 'test helper',
  'features/madar/sniper/bound.js': 'test helper',
  'features/madar/explorer/solver.js': 'test helper',
  // The v2 lesson path that no French lesson mounts yet (FRANCE_REBUILD_PLAN.md §4bis): these are reached only THROUGH
  // a lesson's own files. The check below fails on a kept file that becomes reached, so each line must be removed when
  // the first lesson mounts it. The first lesson (`decomposer-en-facteurs-premiers`, 2026-11-23) reached the route
  // builder, the home, its progress hooks and the teacher's card; the mission helpers wait for a unit's last lesson.
  'lessons/common/gameworld/missions/lots.js': 'mission data helpers of a synthesis lesson — no lesson yet',
  'lessons/common/gameworld/missions/words.js': 'mission data helpers of a synthesis lesson — no lesson yet',
  // Read by a script, not by the app.
  'lessons/common/components/statementFigure.js': 'imported by scripts/validate-exercises.mjs',
};

const isCode = (file) => /\.(jsx?|mjs)$/.test(file);
const isTest = (file) => /\.test\.|__tests__|\/test\/|setupTests/.test(file);

function listFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, out);
    else out.push(full);
  }
  return out;
}

const all = listFiles(SRC);
const known = new Set(all);

function resolveImport(from, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(from), spec.split('?')[0]);
  const candidates = [base, `${base}.js`, `${base}.jsx`, `${base}.json`, `${base}.css`, path.join(base, 'index.js'), path.join(base, 'index.jsx')];
  return candidates.find((candidate) => known.has(candidate)) ?? null;
}

function expandGlob(from, pattern) {
  const absolute = path.resolve(path.dirname(from), pattern);
  const source = absolute
    .replace(/[.+^$()|\\]/g, '\\$&')
    .replace(/\{([^}]+)\}/g, (_, list) => `(${list.split(',').join('|')})`)
    .replace(/\*\*\//g, '(.+/)?')
    .replace(/\*/g, '[^/]*');
  const matcher = new RegExp(`^${source}$`);
  return all.filter((file) => matcher.test(file));
}

function importsOf(file) {
  const text = fs.readFileSync(file, 'utf8');
  const found = new Set();
  const importRe = /(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const match of text.matchAll(importRe)) {
    const target = resolveImport(file, match[1] ?? match[2] ?? match[3]);
    if (target) found.add(target);
  }
  for (const match of text.matchAll(/import\.meta\.glob\(\s*(\[[^\]]+\]|['"][^'"]+['"])/g)) {
    for (const pattern of match[1].matchAll(/['"]([^'"]+)['"]/g)) {
      if (!pattern[1].startsWith('!')) expandGlob(file, pattern[1]).forEach((target) => found.add(target));
    }
  }
  return found;
}

const reached = new Set();
const queue = [ENTRY];
while (queue.length) {
  const file = queue.pop();
  if (reached.has(file)) continue;
  reached.add(file);
  if (!isCode(file)) continue;
  for (const target of importsOf(file)) if (!reached.has(target)) queue.push(target);
}

const relative = (file) => path.relative(SRC, file);
const unreached = all.filter((file) => isCode(file) && !isTest(file) && !reached.has(file)).map(relative);
const dead = unreached.filter((file) => !(file in KEPT));
const staleKept = Object.keys(KEPT).filter((file) => !unreached.includes(file));

if (process.argv.includes('--list')) {
  unreached.forEach((file) => console.log(file in KEPT ? `kept  ${file} (${KEPT[file]})` : `DEAD  ${file}`));
  process.exit(0);
}
if (staleKept.length) {
  console.error(`check-unreached: these files are listed as kept but are reached or gone — remove them from KEPT:\n  ${staleKept.join('\n  ')}`);
  process.exit(1);
}
if (dead.length) {
  console.error(`check-unreached: ${dead.length} file(s) are reached by nothing. Delete them, or name them in KEPT with a reason:\n  ${dead.join('\n  ')}`);
  process.exit(1);
}
console.log(`✅ No dead file: ${reached.size} files reached from main.jsx, ${Object.keys(KEPT).length} kept on purpose.`);
