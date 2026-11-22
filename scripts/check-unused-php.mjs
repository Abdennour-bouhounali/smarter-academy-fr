#!/usr/bin/env node
/**
 * NO UNUSED CLASS and NO UNROUTED CONTROLLER ACTION in apps/api (the PHP side of `check-unused.mjs`).
 * Unused `use` lines are Pint's job (`apps/api/pint.unused.json`). Contract: docs/architecture/CODE_HEALTH.md.
 *
 *   node scripts/check-unused-php.mjs          fails when something is unused
 *   node scripts/check-unused-php.mjs --list   prints, never fails
 *
 *  1. CLASSES of `app/`. A class is used when its name is written in another file of the application (app, routes,
 *     config, bootstrap, database). A name written only in `tests/` does not count: that is dead code with a test.
 *     Laravel finds some classes by itself — console commands, policies named after their model: they are used.
 *  2. CONTROLLER ACTIONS. A public method of a controller is used when a route names it, or when the controller
 *     calls it itself.
 *
 * It reads names, not types: when it cannot be sure, it says « used ».
 * NOT covered: a route that no page calls (the web client builds its addresses from pieces).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../apps/api');
const rel = (file) => path.relative(API, file);

/** Kept on purpose: `'<file>'` for a class, `'<file>@<method>'` for an action. Each line says why. */
const KEPT = {};

function listPhp(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listPhp(full, out);
    else if (entry.name.endsWith('.php')) out.push(full);
  }
  return out;
}

const read = (file) => fs.readFileSync(file, 'utf8');
/** Code only: a name inside a comment is not a use. */
const code = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*(\/\/|#).*$/gm, '');

const appFiles = listPhp(path.join(API, 'app'));
const sources = ['app', 'routes', 'config', 'bootstrap', 'database'].flatMap((dir) => listPhp(path.join(API, dir)));
const texts = new Map(sources.map((file) => [file, code(read(file))]));

// Every identifier written in each file, once: looking a class name up is then a set lookup.
const words = new Map([...texts].map(([file, text]) => [file, new Set(text.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [])]));
const writtenElsewhere = (name, own) => [...words].some(([file, set]) => file !== own && set.has(name));

const problems = [];
const usedKept = new Set();
const keep = (key) => (key in KEPT ? usedKept.add(key) : false);

// ───────────────────────────── 1. classes ─────────────────────────────

const modelNames = new Set(listPhp(path.join(API, 'app/Models')).map((file) => path.basename(file, '.php')));
function foundByLaravel(file, name) {
  const where = rel(file);
  if (where.startsWith('app/Console/Commands/')) return true; // registered by their folder
  if (where.startsWith('app/Policies/') && modelNames.has(name.replace(/Policy$/, ''))) return true; // <Model>Policy
  return false;
}

for (const file of appFiles) {
  const declared = texts.get(file).match(/^\s*(?:final\s+|abstract\s+|readonly\s+)*(?:class|interface|trait|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/m);
  if (!declared) continue;
  const name = declared[1];
  if (foundByLaravel(file, name) || writtenElsewhere(name, file) || keep(rel(file))) continue;
  problems.push(`${rel(file)}  class ${name}  (written in no other file of the application)`);
}

// ───────────────────────────── 2. controller actions ─────────────────────────────

const routeText = listPhp(path.join(API, 'routes')).map((file) => texts.get(file)).join('\n');
const RESOURCE = ['index', 'store', 'show', 'update', 'destroy', 'create', 'edit'];
const routed = new Map(); // controller short name → Set of action names
const route = (controller, action) => routed.set(controller, (routed.get(controller) ?? new Set()).add(action));
for (const [, controller, action] of routeText.matchAll(/\[\s*\\?(?:[A-Za-z_\\]+\\)?([A-Za-z_]+)::class\s*,\s*['"]([A-Za-z_0-9]+)['"]\s*\]/g)) route(controller, action);
for (const [, controller, action] of routeText.matchAll(/['"](?:[A-Za-z_\\]+\\)?([A-Za-z_]+)@([A-Za-z_0-9]+)['"]/g)) route(controller, action);
for (const [, controller] of routeText.matchAll(/(?:apiResource|resource)\(\s*['"][^'"]+['"]\s*,\s*\\?(?:[A-Za-z_\\]+\\)?([A-Za-z_]+)::class/g)) RESOURCE.forEach((action) => route(controller, action));
for (const [, controller] of routeText.matchAll(/,\s*\\?(?:[A-Za-z_\\]+\\)?([A-Za-z_]+)::class\s*\)/g)) route(controller, '__invoke');

for (const file of listPhp(path.join(API, 'app/Http/Controllers'))) {
  const text = texts.get(file);
  const controller = path.basename(file, '.php');
  if (/^\s*abstract\s+class/m.test(text)) continue;
  for (const [, action] of text.matchAll(/^\s*public\s+function\s+([A-Za-z_0-9]+)\s*\(/gm)) {
    if (action.startsWith('__') && action !== '__invoke') continue;
    if (routed.get(controller)?.has(action)) continue;
    if (new RegExp(`(\\$this->|self::|static::)${action}\\s*\\(`).test(text)) continue;
    if (keep(`${rel(file)}@${action}`)) continue;
    problems.push(`${rel(file)}  ${controller}@${action}  (no route names it)`);
  }
}

// ───────────────────────────── report ─────────────────────────────

if (problems.length) console.log(`${problems.length} unused in apps/api:\n  ${problems.sort().join('\n  ')}`);
if (process.argv.includes('--list')) process.exit(0);
const staleKept = Object.keys(KEPT).filter((key) => !usedKept.has(key));
if (staleKept.length) console.error(`check-unused-php: these lines of KEPT keep nothing any more — remove them:\n  ${staleKept.join('\n  ')}`);
if (problems.length) console.error('check-unused-php: delete them, or name them in KEPT (scripts/check-unused-php.mjs) with the reason.');
if (problems.length || staleKept.length) process.exit(1);
console.log(`✅ Nothing unused in apps/api: ${appFiles.length} classes read, ${[...routed.values()].reduce((n, set) => n + set.size, 0)} routed actions, ${Object.keys(KEPT).length} kept on purpose.`);
