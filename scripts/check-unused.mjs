#!/usr/bin/env node
/**
 * NO UNUSED EXPORT and NO UNUSED STRING in apps/web/src and packages/core.
 * (Unused imports and variables are ESLint's job; whole dead files are `check-unreached.mjs`.)
 * Contract: docs/architecture/CODE_HEALTH.md.
 *
 *   node scripts/check-unused.mjs                      fails on anything unused that the baseline does not name
 *   node scripts/check-unused.mjs --list               prints everything (baseline included), never fails
 *   node scripts/check-unused.mjs --only exports|i18n|tables
 *   node scripts/check-unused.mjs --update-baseline    rewrites the baseline from what is unused today
 *
 * THE BASELINE (`scripts/check-unused.baseline.json`) names what was already unused when the check was added
 * and is not removed yet. It may only SHRINK: a new unused thing fails, and so does a baseline line that is no
 * longer unused (delete the line — or run `--update-baseline`, which never adds silently: read its diff).
 *
 * Three things are checked, each by reading the code as a tree (Babel), never by searching text:
 *
 *  1. EXPORTS. An export is used when a file of the app, a script or a walk imports it. An export that only a test
 *     imports is used when its own file also uses it (it is exported to be tested); otherwise it is dead code that
 *     happens to have a test. `import * as ns` uses what is read from it (`ns.name`) — and EVERYTHING when `ns` is
 *     passed along, spread (`...ns`) or read with a computed key. `import('./file')`, `import.meta.glob(...)` and
 *     `export *` are followed.
 *  2. I18N KEYS of `apps/web/src/i18n/locales/fr/*.json`. A key is used when its path is written in the code, or when
 *     the code builds a path that can reach it (`t(`status.${kind}`)` uses every key under `status.`).
 *  3. STRING TABLES (`strings.js`, `text.js`: an exported object of sentences). Every read of the table is followed
 *     from its import: `T.objective.cross` uses that entry; `T.objective` handed over whole (assigned, passed, spread
 *     `...T.objective`, read with a computed key `T.objective[kind]`) uses everything under it.
 *
 * When the check cannot be sure, it says « used »: it must never ask to delete something alive.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';

const traverse = _traverse.default ?? _traverse;
// `CHECK_UNUSED_ROOT` points the check at another tree: its own test does (scripts/check-unused.test.mjs).
const ROOT = path.resolve(process.env.CHECK_UNUSED_ROOT ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const abs = (rel) => path.join(ROOT, rel);
const rel = (file) => path.relative(ROOT, file);

/** Where an unused export or string is REPORTED. */
const ANALYSED = ['apps/web/src', 'packages/core'];
/** Code that only CONSUMES: its imports count, its own exports are not reported. */
const CONSUMERS = ['scripts', 'apps/web/scripts', 'apps/web/e2e'];
const LOCALES = 'apps/web/src/i18n/locales/fr';
/** The server may send a key that the page then translates: its quoted strings count as written. */
const KEY_SOURCES_PHP = 'apps/api/app';
const BASELINE = abs('scripts/check-unused.baseline.json');
/**
 * Files that the tools load by a path they BUILD (`import(pathToFileURL(`${dir}/lesson.config.js`))`, and a
 * lesson's `content/*.js`): the check cannot follow that, so every export of these files counts as used.
 */
const READ_BY_PATH = /\/lessons\/.*\/(lesson\.config\.js|content\/[^/]+\.js)$/;
const isStringTable = (file) => /(^|\/)(strings|text)\.js$/.test(file);

/**
 * Kept on purpose. `'<file>'` keeps every export of the file, `'<file>#<name>'` one export, `'i18n:<path>'` a key
 * (a path ending with `.` keeps everything under it), `'table:<file>#<path>'` an entry. Each line says why.
 */
// The lesson engine is kept whole while few French lessons exist (FRANCE_REBUILD_PLAN.md §4bis): what only a deleted
// Algerian lesson used stays until a French lesson decides. The first one (`decomposer-en-facteurs-premiers`,
// 2026-11-23) took its lines out of this list; each line below is what no French lesson uses yet.
const LESSON_ENGINE = 'lesson engine — no French lesson yet';
// The pyramids world and its kit pieces (2026-11-24) are one code with Algeria, where its lesson uses these exports; the
// French lessons on it (`thales-configuration-papillon`, …) are not built yet. Each line leaves when one imports it.
const PYRAMIDS = 'pyramids world — read by the Algerian lesson; no French lesson on the world yet';
const KEPT = {
  'apps/web/src/lessons/common/gameworld/kit/claims.js#scaleClaim': PYRAMIDS,
  'apps/web/src/lessons/common/gameworld/nilePyramids/logic.js#CAMERA_BOX': PYRAMIDS,
  'apps/web/src/lessons/common/gameworld/nilePyramids/scale.js#copyOf': PYRAMIDS,
  'apps/web/src/lessons/common/components/kidFigure.js#HAIR_STYLES': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/divisorIsles/logic.js#DASH_WAVES': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/divisorIsles/logic.js#STATUES': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/divisorIsles/ruleForge.js#attackOn': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/divisorIsles/ruleForge.js#bridgeId': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/divisorIsles/ruleForge.js#casesOfKinds': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/divisorIsles/ruleForge.js#cellsOf': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/divisorIsles/ruleForge.js#nudgeWith': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/divisorIsles/ruleForge.js#remainderForge': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/divisorIsles/ruleForge.js#SMALL': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/authoring/forgeBlocks.js#differenceBox': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/authoring/forgeBlocks.js#fromRounds': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/authoring/forgeBlocks.js#makerOf': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/authoring/forgeBlocks.js#pairPool': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/authoring/forgeBlocks.js#pairsOutside': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/authoring/forgeBlocks.js#pgcdBox': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/authoring/forgeBlocks.js#pgcdPairBox': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/authoring/forgeBlocks.js#plankCase': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/authoring/forgeBlocks.js#subtractionRow': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/authoring/numbers.js#differences': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/authoring/numbers.js#divisionTex': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/authoring/numbers.js#emptyCells': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/authoring/numbers.js#planksFill': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/authoring/numbers.js#subTex': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/authoring/numbers.js#SUBTRACTIONS': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/missions/lots.js#advice': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/missions/lots.js#deal': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/missions/lots.js#euclid': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/missions/lots.js#fill': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/missions/words.js#leftOf': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/rootCourts/logic.js#magnitude': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/rootCourts/logic.js#minus': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/rootCourts/ruleForge.js#courtPool': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/rootCourts/ruleForge.js#COURT_TEXT': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/rootCourts/ruleForge.js#evidenceOf': LESSON_ENGINE,
  'apps/web/src/lessons/common/gameworld/kit/random.js#rng':
    'the seeded generator: every lesson\'s tests replay its generated content with it (the app itself draws with Math.random)',
  'apps/web/src/lessons/common/gameworld/kit/claims.js#CLAIM_KINDS':
    'the kinds of claim the browser can verify: claims.test.js compares the list with the server\'s (ClaimVerifier::KINDS) — a kind known on one side only is a bug',
};

const SKIP_DIRS = new Set(['node_modules', 'dist', 'public', 'vendor', '.git']);
const isCode = (file) => /\.(jsx?|mjs)$/.test(file);
const isTest = (file) => /\.test\.|__tests__|\/test\/|setupTests/.test(file);

function listFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, out);
    else out.push(full);
  }
  return out;
}

const analysedFiles = ANALYSED.flatMap((dir) => listFiles(abs(dir)));
const consumerFiles = [
  ...CONSUMERS.flatMap((dir) => listFiles(abs(dir))),
  ...fs.readdirSync(abs('apps/web')).map((name) => abs(`apps/web/${name}`)).filter((file) => fs.statSync(file).isFile()),
];
const allFiles = [...new Set([...analysedFiles, ...consumerFiles])];
const known = new Set(allFiles);
const inAnalysed = (file) => ANALYSED.some((dir) => file.startsWith(abs(dir) + path.sep));

// ───────────────────────────── resolving an import ─────────────────────────────

const CORE = abs('packages/core');

function resolveImport(from, spec) {
  let base;
  const clean = spec.split('?')[0];
  if (clean.startsWith('.')) base = path.resolve(path.dirname(from), clean);
  else if (clean === '@smarter-academy/core') base = path.join(CORE, 'index.js');
  else if (clean.startsWith('@smarter-academy/core/')) base = path.join(CORE, clean.slice('@smarter-academy/core/'.length));
  else return null;
  const candidates = [base, `${base}.js`, `${base}.jsx`, `${base}.mjs`, path.join(base, 'index.js'), path.join(base, 'index.jsx')];
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
  return allFiles.filter((file) => matcher.test(file));
}

// ───────────────────────────── reading one file ─────────────────────────────

const records = new Map(); // file → { exports: Map, stars: [file], uses: [{ from, name }] }
const literals = new Set(); // every short string the code writes
const keyCalls = new Set(); // first argument of a `t('…')` call, or an `i18nKey="…"`
const heads = new Set(); // static start of a built string: `status.${x}` → "status."
const pieces = new Set(); // every dotted chunk of a built string, without its outer dots: `${NS}.cp.${id}` → "cp"
const tails = new Set(); // static end of a built string: `${x}.title` → ".title"
const tableReads = []; // { file, trail }: `T.objective.cross` read somewhere → trail ['T', 'objective', 'cross']

const KEY_LIKE = /^[\w:.-]{1,160}$/;
const stripNamespace = (text) => (text.includes(':') ? text.slice(text.indexOf(':') + 1) : text);

const trimDots = (text) => text.replace(/^\.+|\.+$/g, '');
function noteString(value) {
  if (typeof value !== 'string' || !KEY_LIKE.test(value)) return;
  literals.add(stripNamespace(value));
  pieces.add(trimDots(stripNamespace(value)));
}

const nameOf = (node) => {
  if (!node) return null;
  if (node.type === 'Identifier' || node.type === 'JSXIdentifier') return node.name;
  if (node.type === 'StringLiteral') return node.value;
  if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') && !node.computed) return nameOf(node.property);
  return null;
};
const isStaticMember = (node) => (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') && !node.computed;

/**
 * The real reads of a name. Babel also counts the `export` statement of a name as a « reference » to it:
 * that one is not a read.
 */
const readsOf = (scope, name) => (scope.getBinding(name)?.referencePaths ?? []).filter((ref) => ref.isIdentifier() || ref.isJSXIdentifier());

/** The names read one after the other from a reference: for `T` in `T.objective.cross(n)` → ['objective', 'cross']. */
function chainFrom(ref) {
  const chain = [];
  let current = ref;
  while (isStaticMember(current.parent) && current.parent.object === current.node) {
    chain.push(nameOf(current.parent.property));
    current = current.parentPath;
  }
  return chain;
}

function readFile(file) {
  const record = { exports: new Map(), stars: [], uses: [], tables: [] };
  records.set(file, record);
  let ast;
  try {
    ast = parse(fs.readFileSync(file, 'utf8'), {
      sourceType: 'module',
      plugins: ['jsx', 'importAttributes'],
      errorRecovery: true,
      allowReturnOutsideFunction: true,
    });
  } catch (error) {
    console.error(`check-unused: cannot read ${rel(file)} — ${error.message}`);
    process.exitCode = 1;
    return;
  }
  const use = (target, name) => target && record.uses.push({ from: target, name });
  const table = isStringTable(file) && inAnalysed(file);

  traverse(ast, {
    ImportDeclaration(p) {
      const target = resolveImport(file, p.node.source.value);
      for (const spec of p.node.specifiers) {
        if (spec.type === 'ImportDefaultSpecifier') use(target, 'default');
        else if (spec.type === 'ImportSpecifier') {
          const imported = nameOf(spec.imported);
          use(target, imported);
          if (target && isStringTable(target)) {
            for (const ref of readsOf(p.scope, spec.local.name)) tableReads.push({ file: target, trail: [imported, ...chainFrom(ref)] });
          }
        } else {
          // `import * as ns`: what is read from it — or everything, when `ns` itself goes somewhere (`...ns`, `fn(ns)`).
          for (const ref of readsOf(p.scope, spec.local.name)) {
            const parent = ref.parent;
            const read = (isStaticMember(parent) && parent.object === ref.node) || (parent.type === 'JSXMemberExpression' && parent.object === ref.node);
            use(target, read ? nameOf(parent.property) : '*');
            if (target && isStringTable(target)) tableReads.push({ file: target, trail: chainFrom(ref) });
          }
        }
      }
    },
    ExportNamedDeclaration(p) {
      const { node } = p;
      if (node.source) {
        const target = resolveImport(file, node.source.value);
        for (const spec of node.specifiers) {
          const exported = nameOf(spec.exported);
          if (spec.type === 'ExportNamespaceSpecifier') record.exports.set(exported, { kind: 'all', from: target, line: node.loc.start.line });
          else record.exports.set(exported, { kind: 're', from: target, name: nameOf(spec.local), line: node.loc.start.line });
        }
        return;
      }
      const local = (name, exported, line) => {
        const inside = readsOf(p.scope, name).filter((ref) => !ref.findParent((parent) => parent.isExportSpecifier()));
        record.exports.set(exported, { kind: 'local', usedInside: inside.length > 0, line });
      };
      if (node.declaration) {
        const ids = p.get('declaration').getOuterBindingIdentifiers();
        for (const name of Object.keys(ids)) local(name, name, ids[name].loc.start.line);
        if (table && node.declaration.type === 'VariableDeclaration') {
          for (const declarator of node.declaration.declarations) {
            if (declarator.init?.type !== 'ObjectExpression') continue;
            record.tables.push({ name: declarator.id.name, node: declarator.init });
            // The table's own file may read it too (a sentence built from another one).
            for (const ref of readsOf(p.scope, declarator.id.name)) tableReads.push({ file, trail: [declarator.id.name, ...chainFrom(ref)] });
          }
        }
      }
      for (const spec of node.specifiers) local(spec.local.name, nameOf(spec.exported), spec.loc.start.line);
    },
    ExportDefaultDeclaration(p) {
      record.exports.set('default', { kind: 'local', usedInside: false, line: p.node.loc.start.line });
    },
    ExportAllDeclaration(p) {
      const target = resolveImport(file, p.node.source.value);
      if (target) record.stars.push(target);
    },
    CallExpression(p) {
      const { callee, arguments: args } = p.node;
      const first = args[0];
      // import('./file') — everything of the file may be read from the promise.
      if (callee.type === 'Import' && first?.type === 'StringLiteral') use(resolveImport(file, first.value), '*');
      // import.meta.glob('./**/x.js') — same, for every file it matches.
      if (callee.type === 'MemberExpression' && nameOf(callee) === 'glob' && callee.object.type === 'MetaProperty') {
        const patterns = first?.type === 'ArrayExpression' ? first.elements : [first];
        for (const pattern of patterns) {
          if (pattern?.type === 'StringLiteral' && !pattern.value.startsWith('!')) expandGlob(file, pattern.value).forEach((target) => use(target, '*'));
        }
      }
      // t('a.b') and friends: the first argument is a key (it may name a whole group, with `returnObjects`).
      if (/^(t|tr|translate)$/.test(nameOf(callee) ?? '') && first?.type === 'StringLiteral') keyCalls.add(stripNamespace(first.value));
    },
    NewExpression(p) {
      // new URL('./worker.js', import.meta.url)
      const [first] = p.node.arguments;
      if (nameOf(p.node.callee) === 'URL' && first?.type === 'StringLiteral') use(resolveImport(file, first.value), '*');
    },
    JSXAttribute(p) {
      if (p.node.name.name === 'i18nKey' && p.node.value?.type === 'StringLiteral') keyCalls.add(stripNamespace(p.node.value.value));
    },
    StringLiteral(p) {
      noteString(p.node.value);
    },
    TemplateLiteral(p) {
      const { quasis, expressions } = p.node;
      if (!expressions.length) return noteString(quasis[0].value.cooked);
      const head = stripNamespace(quasis[0].value.cooked ?? '');
      const tail = quasis[quasis.length - 1].value.cooked ?? '';
      if (/^[\w.-]+\.$/.test(head)) heads.add(head);
      else if (/^[\w.-]+\.[\w-]*$/.test(head)) heads.add(head.slice(0, head.lastIndexOf('.') + 1));
      if (/^\.[\w.-]+$/.test(tail)) tails.add(tail);
      for (const quasi of quasis) {
        const chunk = quasi.value.cooked ?? '';
        if (/^[\w:.-]+$/.test(chunk) && trimDots(chunk)) pieces.add(trimDots(stripNamespace(chunk)));
      }
    },
    BinaryExpression(p) {
      // 'status.' + kind   ·   prefix + '.title'
      const { operator, left, right } = p.node;
      if (operator !== '+') return;
      if (left.type === 'StringLiteral' && /^[\w:.-]+\.$/.test(left.value)) heads.add(stripNamespace(left.value));
      if (right.type === 'StringLiteral' && /^\.[\w.-]+$/.test(right.value)) tails.add(right.value);
    },
  });
}

for (const file of allFiles) if (isCode(file)) readFile(file);
for (const file of listFiles(abs(KEY_SOURCES_PHP))) {
  if (!file.endsWith('.php')) continue;
  for (const match of fs.readFileSync(file, 'utf8').matchAll(/['"]([\w:.-]{1,160})['"]/g)) noteString(match[1]);
}

// ───────────────────────────── 1. exports ─────────────────────────────

const used = new Map(); // "file#name" → { app, test }
function mark(file, name, byTest, seen = new Set()) {
  const record = records.get(file);
  const key = `${file}#${name}`;
  if (!record || seen.has(key)) return;
  seen.add(key);
  if (name === '*') {
    for (const exported of record.exports.keys()) mark(file, exported, byTest, seen);
    for (const star of record.stars) mark(star, '*', byTest, seen);
    return;
  }
  const entry = record.exports.get(name);
  if (!entry) return record.stars.forEach((star) => mark(star, name, byTest, seen));
  const flags = used.get(key) ?? { app: false, test: false };
  if (byTest) flags.test = true;
  else flags.app = true;
  used.set(key, flags);
  if (entry.kind === 're') mark(entry.from, entry.name, byTest, seen);
  if (entry.kind === 'all') mark(entry.from, '*', byTest, seen);
}
for (const [file, record] of records) for (const { from, name } of record.uses) mark(from, name, isTest(file));
for (const file of records.keys()) if (READ_BY_PATH.test(file)) mark(file, '*', false);

const problems = { exports: [], i18n: [], tables: [] };
const kept = (key) => key in KEPT;
const usedKept = new Set();
const keep = (key) => (kept(key) ? usedKept.add(key) : false);

for (const [file, record] of records) {
  if (!inAnalysed(file) || isTest(file)) continue;
  if (keep(rel(file))) continue;
  for (const [name, entry] of record.exports) {
    const flags = used.get(`${file}#${name}`) ?? { app: false, test: false };
    if (flags.app) continue;
    if (flags.test && entry.kind === 'local' && entry.usedInside) continue;
    if (keep(`${rel(file)}#${name}`)) continue;
    let why = 'imported by nothing';
    if (flags.test) why = 'imported by a test only, and its own file does not use it';
    else if (entry.usedInside) why = 'imported by nothing — its file uses it: remove the word `export`';
    problems.exports.push({ id: `${rel(file)}#${name}`, line: `${rel(file)}:${entry.line}  ${name}  (${why})` });
  }
}

// ───────────────────────────── 2. i18n keys ─────────────────────────────

const PLURAL = /_(zero|one|two|few|many|other)$/;
function flatten(value, prefix, out) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key, out);
  } else out.push(prefix);
  return out;
}
/**
 * A key is often written in several parts (`const NS = 'manipulation.eggTrays'`, then `${NS}.cp.${id}`): can the
 * path be rebuilt, part after part, from chunks the code writes? `reach[i]` = the first i parts can.
 */
function reachOf(parts) {
  const reach = [true];
  for (let end = 1; end <= parts.length; end += 1) {
    reach[end] = false;
    for (let start = 0; start < end && !reach[end]; start += 1) {
      reach[end] = reach[start] && pieces.has(parts.slice(start, end).join('.'));
    }
  }
  return reach;
}
function keyIsUsed(keyPath) {
  for (const candidate of new Set([keyPath, keyPath.replace(PLURAL, '')])) {
    if (literals.has(candidate)) return true;
    const parts = candidate.split('.');
    const reach = reachOf(parts);
    if (reach[parts.length]) return true;
    for (let i = 1; i < parts.length; i += 1) {
      const group = parts.slice(0, i).join('.');
      // a group named whole (`returnObjects`), a path built up to here then left open (`status.${kind}`),
      // or an open start closed by a written end (`${prefix}.title`)
      if (keyCalls.has(group) || heads.has(`${group}.`)) return true;
      if (reach[i] && [...Array(i).keys()].some((start) => reach[start] && heads.has(`${parts.slice(start, i).join('.')}.`))) return true;
      if (tails.has(`.${parts.slice(i).join('.')}`)) return true;
    }
  }
  return false;
}
/** The keys of a file that is merged UNDER a group of its namespace (BUNDLE_BOUNDARIES.md §3). */
const MERGED_UNDER = { 'lesson.manipulation': 'manipulation' };
for (const name of fs.readdirSync(abs(LOCALES)).filter((file) => file.endsWith('.json'))) {
  const namespace = name.replace(/\.json$/, '');
  for (const keyPath of flatten(JSON.parse(fs.readFileSync(abs(`${LOCALES}/${name}`), 'utf8')), '', [])) {
    if (keyIsUsed(MERGED_UNDER[namespace] ? `${MERGED_UNDER[namespace]}.${keyPath}` : keyPath)) continue;
    const id = `i18n:${namespace}:${keyPath}`;
    const keptGroup = Object.keys(KEPT).find((key) => key.endsWith('.') && id.startsWith(key));
    if (keep(id) || (keptGroup && usedKept.add(keptGroup))) continue;
    problems.i18n.push({ id, line: `${namespace}.json  ${keyPath}` });
  }
}

// ───────────────────────────── 3. string tables ─────────────────────────────

function entriesOf(objectNode, trail, out) {
  for (const property of objectNode.properties) {
    if (property.type !== 'ObjectProperty' && property.type !== 'ObjectMethod') continue; // a spread: unknown keys
    if (property.computed) continue;
    const key = nameOf(property.key);
    const here = [...trail, key];
    if (property.type === 'ObjectProperty' && property.value.type === 'ObjectExpression') entriesOf(property.value, here, out);
    else out.push({ trail: here, line: property.loc.start.line });
  }
  return out;
}
for (const [file, record] of records) {
  if (!record.tables.length) continue;
  // The whole file taken at once (`import('./strings')`, a glob): every entry may be read.
  const takenWhole = [...records.values()].some((other) => other.uses.some((u) => u.from === file && u.name === '*'));
  const reads = tableReads.filter((read) => read.file === file).map((read) => read.trail);
  for (const { name, node } of record.tables) {
    for (const { trail, line } of entriesOf(node, [name], [])) {
      // Read exactly, read deeper (`T.say.length`), or a group above it handed over whole (`T.objective`).
      const read = reads.some((seen) => seen.every((part, i) => i >= trail.length || part === trail[i]));
      if (takenWhole || read) continue;
      if (keep(`table:${rel(file)}#${trail.join('.')}`)) continue;
      problems.tables.push({ id: `table:${rel(file)}#${trail.join('.')}`, line: `${rel(file)}:${line}  ${trail.join('.')}` });
    }
  }
}

// ───────────────────────────── report ─────────────────────────────

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const kinds = Object.keys(problems).filter((kind) => !only || only === kind);
const TITLES = {
  exports: 'export(s) that nothing uses — delete the code, or remove the word `export` when its own file uses it',
  i18n: 'i18n key(s) that nothing reads — delete them from the locale file',
  tables: 'entry(ies) of a string table that nothing reads — delete them',
};

if (args.includes('--update-baseline')) {
  const next = Object.fromEntries(Object.keys(problems).map((kind) => [kind, problems[kind].map((p) => p.id).sort()]));
  fs.writeFileSync(BASELINE, `${JSON.stringify(next, null, 1)}\n`);
  console.log(`check-unused: baseline rewritten — ${Object.values(next).flat().length} line(s). Read its diff before committing.`);
  process.exit(0);
}

const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : {};
const listing = args.includes('--list');
let fresh = 0;
let inBaseline = 0;
const stale = [];
for (const kind of kinds) {
  const accepted = new Set(baseline[kind] ?? []);
  const found = new Set(problems[kind].map((p) => p.id));
  const lines = problems[kind].filter((p) => listing || !accepted.has(p.id)).map((p) => p.line).sort();
  inBaseline += problems[kind].filter((p) => accepted.has(p.id)).length;
  fresh += problems[kind].filter((p) => !accepted.has(p.id)).length;
  stale.push(...[...accepted].filter((id) => !found.has(id)));
  if (lines.length) console.log(`\n${lines.length} ${TITLES[kind]}:\n  ${lines.join('\n  ')}`);
}
if (listing) process.exit(0);

const staleKept = only ? [] : Object.keys(KEPT).filter((key) => !usedKept.has(key));
if (staleKept.length) console.error(`\ncheck-unused: these lines of KEPT keep nothing any more — remove them:\n  ${staleKept.join('\n  ')}`);
if (stale.length) {
  console.error(`\ncheck-unused: ${stale.length} line(s) of the baseline are not unused any more (removed or used again) — delete them from scripts/check-unused.baseline.json:\n  ${stale.slice(0, 40).join('\n  ')}${stale.length > 40 ? '\n  …' : ''}`);
}
if (fresh) console.error(`\ncheck-unused: ${fresh} unused. Delete them, or name them in KEPT (scripts/check-unused.mjs) with the reason.`);
if (fresh || stale.length || staleKept.length || process.exitCode) process.exit(1);
console.log(`✅ Nothing new is unused: ${records.size} files read, ${Object.keys(KEPT).length} kept on purpose, ${inBaseline} still in the baseline.`);
