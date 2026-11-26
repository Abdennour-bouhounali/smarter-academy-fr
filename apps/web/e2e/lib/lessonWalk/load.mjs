// The lesson's OWN data, loaded in Node for a walk — the same esbuild bundle as lib/lessonWords.mjs (the lessons import
// without extensions and hold JSX: Node cannot import them as they are). ONE bundle holds every lesson of the world
// (`world/index.js`, `world/story.js`, `board/script.js`), and for the walked lesson its memo, config, trainer module and
// the kit's claim verifier; ~0.5 s.
//
// What a walk takes from here is the QUESTION (the road, the gaps, the purses, the forges' tiles, the script's stations,
// the cards of the map), never the answer: every verdict a walk asserts is computed by the walk itself (defects.md C1).
// Two exceptions are used for what they are, and said where they are used:
//   - which tiles write the rule that holds: the forge's `isTheRule` (the brief of 2026-11-19 allows deriving them);
//   - which trainer answers are owed as evidence: the lesson's `evidenceOf`, whose CLAIM is then judged by the kit's
//     `verifyClaim` (the server's rule) against the walk's own judgement of the answer.
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const LESSONS = join(WEB, 'src/lessons');
const INDEX = JSON.parse(readFileSync(join(LESSONS, 'lessonIndex.generated.json'), 'utf8'));
const CLAIMS = join(LESSONS, 'common/gameworld/kit/claims.js');

/** The folder of a lesson: src/lessons/<level>/<grade>/<chapter>/<sub-unit>/<id>. */
export function folderOf(id) {
  const entry = INDEX.lessons.find((l) => l.id === id);
  if (!entry) throw new Error(`lessonWalk: no lesson « ${id} » in lessonIndex.generated.json`);
  const unit = join(LESSONS, entry.level, entry.grade, entry.chapter);
  for (const sub of readdirSync(unit, { withFileTypes: true }))
    if (sub.isDirectory() && existsSync(join(unit, sub.name, id, 'lesson.pack.js'))) return join(unit, sub.name, id);
  throw new Error(`lessonWalk: no folder for lesson ${id}`);
}

const STUB = {
  name: 'stub-assets',
  setup(b) {
    b.onResolve({ filter: /\.(css|svg|png|webp|jpe?g)$|^virtual:/ }, (a) => ({ path: a.path, namespace: 'stub' }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default {}', loader: 'js' }));
  },
};

async function bundle(lines) {
  const { build } = createRequire(join(WEB, 'package.json'))('esbuild');
  const out = await build({
    stdin: { contents: lines.filter(Boolean).join('\n'), resolveDir: WEB, loader: 'js' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
    resolveExtensions: ['.mjs', '.js', '.jsx', '.json'],
    jsx: 'automatic',
    plugins: [STUB],
    logLevel: 'error',
  });
  return import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);
}

/** Every string and every number inside a value (functions left out). */
function leaves(value) {
  const strings = [];
  const numbers = [];
  const seen = new Set();
  const walk = (v) => {
    if (typeof v === 'string') strings.push(v);
    else if (typeof v === 'number' && Number.isFinite(v)) numbers.push(v);
    else if (v && typeof v === 'object' && !seen.has(v)) {
      seen.add(v);
      for (const x of Object.values(v)) walk(x);
    }
  };
  walk(value);
  return { strings, numbers };
}
// a number grouped by thousands is ONE number: « 13 248 » (U+202F / U+2009 / U+00A0) and LaTeX `13\,248` are 13248,
// never 13 and 248 (lesson 4's 13 248 made 248 « another lesson's number » on lesson 2's screens, 2026-11-26)
const numbersIn = (s) =>
  (
    String(s)
      .replace(/(\d)(?:\\,|[   ])(?=\d{3}(?!\d))/g, '$1')
      .match(/\d+/g) ?? []
  ).map(Number);

/**
 * The numbers of the OTHER lessons of the world that this lesson never writes: their gaps of 100 cells or more (the
 * story's segments and the store's lanes), less every number this lesson's own data holds (its strings and its numbers).
 * Small numbers are left out: every lesson draws them. A derived list, never a hand one (the hand lists of lib/<x>.mjs
 * went stale twice).
 */
function foreignNumbersOf(mod, ids, at) {
  const own = new Set();
  const mine = [mod[`world${at}`], mod[`story${at}`]?.NUMBERS, mod[`script${at}`], mod.memo, mod.config];
  for (const v of mine) {
    const { strings, numbers } = leaves(v);
    numbers.forEach((n) => own.add(n));
    strings.forEach((s) => numbersIn(s).forEach((n) => own.add(n)));
  }
  const theirs = new Set();
  // a round hundred under 1000 is an ordinary number on any screen (a price, a maximum), never a lesson's signature
  const telling = (n) => n >= 100 && !(n < 1000 && n % 100 === 0);
  ids.forEach((id, i) => {
    if (i === at) return;
    const w = mod[`world${i}`];
    for (const s of w?.story?.segments ?? []) if (s.kind === 'bridge' && telling(s.a)) theirs.add(s.a);
    for (const n of leaves(mod[`story${i}`]?.NUMBERS ?? {}).numbers) if (telling(n)) theirs.add(n);
    // the numbers its tablets and its store write (a price paid, the stone's number)
    for (const s of leaves([w?.rules, w?.story?.text?.boss]).strings)
      for (const n of numbersIn(s)) if (telling(n)) theirs.add(n);
  });
  return [...theirs].filter((n) => !own.has(n)).sort((a, b) => a - b);
}

/**
 * Loads lesson `id`: { id, entry, folder, url, grade, unit, lesson, numbers, script, memo, config, planOf,
 * verifyClaim, foreignNumbers, worldLessons }.
 */
export async function loadLesson(id, { base = process.env.E2E_BASE || 'http://localhost:5173' } = {}) {
  const entry = INDEX.lessons.find((l) => l.id === id);
  if (!entry) throw new Error(`lessonWalk: no lesson « ${id} »`);
  const world = entry.pack?.world ?? null;
  const ids = INDEX.lessons.filter((l) => world && l.pack?.world === world).map((l) => l.id);
  if (!ids.includes(id)) ids.push(id);
  const at = ids.indexOf(id);
  const lines = [`export { verifyClaim } from ${JSON.stringify(CLAIMS)};`];
  ids.forEach((lid, i) => {
    const dir = folderOf(lid);
    const part = (f, what) => (existsSync(join(dir, f)) ? `export ${what} from ${JSON.stringify(join(dir, f))};` : '');
    lines.push(
      part('world/index.js', `{ lesson as world${i} }`),
      part('world/story.js', `* as story${i}`),
      part('board/script.js', `{ SCRIPT as script${i} }`),
    );
  });
  const dir = folderOf(id);
  const part = (f, what) => (existsSync(join(dir, f)) ? `export ${what} from ${JSON.stringify(join(dir, f))};` : '');
  lines.push(
    part('board/memo.js', '{ MEMO as memo }'),
    part('lesson.config.js', '{ LESSON_CONFIG as config }'),
    part('world/trainer.js', '* as trainerModule'),
  );
  const mod = await bundle(lines);
  return {
    id,
    entry,
    folder: dir,
    grade: entry.grade,
    unit: entry.chapter,
    url: `${base}/courses/${entry.level}/${entry.grade}/${entry.chapter}/${id}`,
    lesson: mod[`world${at}`] ?? null,
    numbers: mod[`story${at}`]?.NUMBERS ?? null,
    script: mod[`script${at}`] ?? null,
    memo: mod.memo ?? null,
    config: mod.config ?? null,
    planOf: mod.trainerModule?.PLAN_OF ?? null,
    verifyClaim: mod.verifyClaim,
    foreignNumbers: foreignNumbersOf(mod, ids, at),
    worldLessons: ids,
  };
}
