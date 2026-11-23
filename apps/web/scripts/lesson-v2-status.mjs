#!/usr/bin/env node
/**
 * THE STATE OF THE LESSON v2 ROLLOUT (docs/architecture/LESSON_V2.md §3) — run it at the start of a session instead of
 * exploring the code, and before saying a lesson is done.
 *
 *   node apps/web/scripts/lesson-v2-status.mjs                  # every lesson that has a pack, then the retirement ledger
 *   node apps/web/scripts/lesson-v2-status.mjs --lesson <id>    # the detail of one lesson; exit 1 unless it prints ✅
 *   node apps/web/scripts/lesson-v2-status.mjs --json
 *
 * It reads FILES and markers — it judges nothing: a lesson that prints ✅ has every part of a v2 lesson in its place.
 * Whether those parts are GOOD is decided by its tests, its walks at every screen size, and eyes on its screenshots.
 *   ✅ in place   ❌ missing   ➖ could not be checked here (said so, never counted as done) or PAUSED by the owner (the phone: never counted at all)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isV2Lesson } from '../../../scripts/validate-lib.mjs';

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(WEB, '../..');
const LESSONS = path.join(WEB, 'src/lessons');
const args = process.argv.slice(2);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const read = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null);
const json = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

const index = json(path.join(LESSONS, 'lessonIndex.generated.json')).lessons;
const folders = new Map();
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = path.join(dir, e.name);
    if (fs.existsSync(path.join(p, 'lesson.config.js'))) folders.set(e.name, p);
    else walk(p);
  }
})(LESSONS);

/** The parts of a lesson's world content, and which of them must have its own test. */
const WORLD_FILES = ['index', 'forges', 'practice', 'trainer', 'sitting', 'journey', 'evidence', 'knowledge', 'text'];
const WORLD_TESTED = ['forges', 'practice', 'trainer', 'sitting', 'journey', 'evidence'];

const examStyle = json(path.join(ROOT, 'content/practice/exam-style.json'));
const labRegistry = read(path.join(LESSONS, 'common/lessonlab/registry.js')) ?? '';
const families = read(path.join(LESSONS, 'common/launchkit/families.js')) ?? '';
const walks = fs
  .readdirSync(path.join(WEB, 'e2e'))
  .filter((f) => f.endsWith('.mjs'))
  .map((f) => ({ file: f, text: fs.readFileSync(path.join(WEB, 'e2e', f), 'utf8') }));
const catalogue = new Map();
for (const f of fs
  .readdirSync(path.join(ROOT, 'packages/core/curriculum/fr'))
  .filter((n) => /^lessons_.*\.json$/.test(n))) {
  const data = json(path.join(ROOT, 'packages/core/curriculum/fr', f));
  for (const l of Array.isArray(data) ? data : (data.lessons ?? [])) catalogue.set(l.code ?? l.id, l);
}

/** The core tools of the launch kit for a lesson (the learning net), or null when the net cannot be read from here. */
async function coreTools(lessonId) {
  try {
    const net = await import(pathToFileURL(path.join(ROOT, 'packages/core/curriculum/fr/net/learningNet.js')).href);
    return net.toolsForLesson(lessonId).filter((t) => t.weight !== 'support');
  } catch {
    return null;
  }
}

async function statusOf(entry) {
  const dir = folders.get(entry.id);
  const flags = entry.pack ?? {};
  const world = path.join(dir, 'world');
  const has = (...p) => fs.existsSync(path.join(dir, ...p));
  const checks = [];
  const add = (part, ok, note = '', paused = false) => checks.push({ part, ok, note, paused });

  add('pack: lesson.pack.js, its flags in the generated index', has('lesson.pack.js') && Boolean(entry.pack));
  add('S2 world: named in the pack', Boolean(flags.world), flags.world ?? 'no world');
  // THE LAST LESSON OF A UNIT (« Vers le brevet », world « mission-isle », docs/reports/INTEGRATION_LESSON_PLAN.md) is not a
  // lesson of keys: no forge, no trainer, no knowledge map, no instrument. It is judged on its missions (data files of
  // `missions/`, each with its test), its island's content, its bank, its walk — and, like every lesson, on the board
  // and the class test.
  const missions = flags.world === 'mission-isle';
  const notHere = (part) => add(part, null, "not for a unit's last lesson", true);
  if (missions) {
    const files = has('missions') ? fs.readdirSync(path.join(dir, 'missions')).filter((f) => /\.js$/.test(f)) : [];
    const data = files.filter((f) => !f.endsWith('.test.js'));
    const bare = data.filter((f) => !files.includes(f.replace(/\.js$/, '.test.js')));
    const parts = ['index', 'sitting', 'text'].filter((f) => !fs.existsSync(path.join(world, `${f}.js`)));
    add(
      'M1 missions: two situations as data, each with its test',
      data.length >= 2 && bare.length === 0,
      bare.length ? `no test for ${bare.join(', ')}` : `${data.length} situation(s)`,
    );
    add(
      'M2 island content: index, sitting, text — and its test',
      parts.length === 0 && fs.existsSync(path.join(world, 'index.test.js')),
      parts.length ? `missing ${parts.join(', ')}` : '',
    );
    const index = read(path.join(world, 'index.js')) ?? '';
    add(
      "M3 the bank mission and the unit's recap are declared",
      /\bbank:\s*\{/.test(index) && /\brecap:\s*\[/.test(index),
    );
  }
  const missing = missions ? [] : WORLD_FILES.filter((f) => !fs.existsSync(path.join(world, `${f}.js`)));
  if (!missions)
    add(
      'S2–S7 world content: every part',
      missing.length === 0,
      missing.length ? `missing ${missing.join(', ')}` : WORLD_FILES.length + ' files',
    );
  const untested = missions ? [] : WORLD_TESTED.filter((f) => !fs.existsSync(path.join(world, `${f}.test.js`)));
  if (!missions)
    add(
      'world content: a test per part',
      untested.length === 0,
      untested.length ? `no test for ${untested.join(', ')}` : '',
    );
  // every rule is forged, never told. The keys are written as literals (`KEYS = ['a', 'b']`) or through the story's
  // name table (`KEYS = [K.ladder, …]` with `export const K = { ladder: 'a', … }` in story.js — the first French
  // lesson); a forge is keyed by the literal or by the same `[K.name]`.
  const names = Object.fromEntries(
    [
      ...(/\bK\s*=\s*\{([^}]*)\}/.exec(read(path.join(world, 'story.js')) ?? '')?.[1] ?? '').matchAll(
        /(\w+)\s*:\s*'([^']+)'/g,
      ),
    ].map((m) => [m[1], m[2]]),
  );
  const keyItems = [
    ...(/KEYS\s*=\s*\[([^\]]*)\]/.exec(read(path.join(world, 'journey.js')) ?? '')?.[1] ?? '').matchAll(
      /'([^']+)'|\bK\.(\w+)/g,
    ),
  ].map((m) => ({ id: m[1] ?? names[m[2]], name: m[2] ?? null }));
  const keys = keyItems.map((k) => k.id).filter(Boolean);
  const forges = read(path.join(world, 'forges.js')) ?? '';
  const told = keyItems
    .filter(({ id, name }) => id && !forges.includes(`'${id}'`) && !(name && forges.includes(`[K.${name}]`)))
    .map((k) => k.id);
  if (missions) notHere('S2 every rule is forged, never told');
  else
    add(
      'S2 every rule is forged, never told',
      keys.length > 0 && told.length === 0,
      keys.length ? (told.length ? `told: ${told.join(', ')}` : `${keys.length} forges`) : 'no keys found',
    );
  if (missions) {
    notHere('S3 knowledge: named in the pack');
    notHere('S6 exam coach: named in the pack');
  } else {
    add('S3 knowledge: named in the pack', Boolean(flags.knowledge));
    add('S6 exam coach: named in the pack', Boolean(flags.coach));
  }
  add('S4 practice bank is the brevet exam sheet', examStyle.includes(entry.id), 'content/practice/exam-style.json');
  // the exam sittings serve the lesson's bank AS IT IS (owner, 2026-11-18): its world/sitting.js goes through the kit's adapter
  const sitting = read(path.join(world, 'sitting.js')) ?? '';
  add(
    'S4bis the bank is served as it is',
    /createBankSittings\(/.test(sitting) && !/createSittings\(/.test(sitting),
    'world/sitting.js › createBankSittings (kit/bankSitting.js)',
  );
  if (missions) notHere('S8 « Mon labo »: an instrument of its own');
  else add('S8 « Mon labo »: an instrument of its own', labRegistry.includes(`lesson: '${entry.id}'`));
  const tools = await coreTools(entry.id);
  if (tools === null)
    add('S1 launch kit: a family per core tool', null, 'the learning net could not be read from this script');
  else {
    const bare = tools.filter((t) => !families.includes(`'${t.id}'`));
    add(
      'S1 launch kit: a family per core tool',
      bare.length === 0,
      bare.length ? `no family for ${bare.map((t) => t.id).join(', ')}` : `${tools.length} core tool(s)`,
    );
  }
  add(
    'T1–T3 board: script and written memo',
    Boolean(flags.board) && has('board', 'script.js') && has('board', 'memo.js'),
  );
  add(
    'T2 class test: its default',
    fs.existsSync(path.join(ROOT, 'content/class-tests', entry.grade, `${entry.id}.json`)),
  );
  // PHONES ARE PAUSED (owner, 2026-11-18): a lesson whose pack says `phone: false` is not judged on it — only a `true` is checked
  add(
    'phone: its home designed and walked (PAUSED since 2026-11-18)',
    flags.phone ? true : null,
    flags.phone ? '' : 'paused: pack.phone is false',
    !flags.phone,
  );
  const mine = walks.filter(
    (w) => w.text.includes(`/${entry.id}\``) || w.text.includes(`/${entry.id}'`) || w.text.includes(`'${entry.id}'`),
  );
  // a lesson walked through the shared library has ONE descriptor, `e2e/lessons/<id>.walk.mjs` (`e2e/lib/lessonWalk/`)
  const descriptor = fs.existsSync(path.join(WEB, 'e2e', 'lessons', `${entry.id}.walk.mjs`));
  // a unit's last lesson is walked by the two walks of the mission island (they open it at its preview address)
  const missionWalks =
    missions && ['missionHome.mjs', 'mission.mjs'].every((f) => fs.existsSync(path.join(WEB, 'e2e', f)));
  add(
    'a walk plays its world',
    descriptor || mine.some((w) => w.text.includes('data-di-start')) || missionWalks,
    missionWalks
      ? 'e2e/missionHome.mjs (its home) and e2e/mission.mjs (its missions)'
      : descriptor
        ? 'its descriptor for the shared walk'
        : mine.length
          ? `${mine.length} walk(s) name it`
          : 'no walk names it',
  );
  const cat = catalogue.get(entry.id);
  add(
    'published: status « available » in the catalogue',
    cat?.status === 'available',
    cat ? cat.status : 'not in the catalogue',
  );
  // what it replaced is deleted (owner, 2026-11-18: « for each lesson that is updated to the gaming version, delete the old
  // version »): no module page, no mission player in its config (LESSON_V2.md §2). A v2 lesson is what its pack makes it
  // (`scripts/validate-lib.mjs › isV2Lesson`), never a marker in its routes.jsx: `buildLessonRoutes` redirects the
  // module addresses of every lesson that has a pack.
  const config = read(path.join(dir, 'lesson.config.js')) ?? '';
  const left = [
    has('modules') && 'modules/',
    !isV2Lesson(dir) && 'no lesson.pack.js exporting LESSON_PACK',
    /^\s*studentView:\s*'mission'|^\s*mission:\s*\{/m.test(config) && 'the mission player in lesson.config.js',
  ].filter(Boolean);
  add('the old version is deleted: module pages, mission player', left.length === 0, left.join(', '));

  const failed = checks.filter((c) => c.ok === false).length;
  const unknown = checks.filter((c) => c.ok === null && !c.paused).length; // a PAUSED part (the phone) is shown ➖ and never counts
  return { id: entry.id, grade: entry.grade, checks, done: failed === 0 && unknown === 0, failed, unknown };
}

const mark = (ok) => (ok === null ? '➖' : ok ? '✅' : '❌');
const one = opt('--lesson');
if (one) {
  const entry = index.find((l) => l.id === one);
  if (!entry) {
    console.error(`✗ « ${one} » is not a built lesson (lessonIndex.generated.json).`);
    process.exit(1);
  }
  const s = await statusOf(entry);
  if (args.includes('--json')) console.log(JSON.stringify(s, null, 2));
  else {
    console.log(`\nLesson v2 — ${s.id} (${s.grade})\n`);
    for (const c of s.checks) console.log(`  ${mark(c.ok)} ${c.part}${c.note ? `  — ${c.note}` : ''}`);
    console.log(
      `\n${s.done ? '✅ every part of a v2 lesson is in its place' : `❌ ${s.failed} part(s) missing${s.unknown ? `, ${s.unknown} not checked` : ''}`}.`,
    );
    console.log('   Not judged here: its tests, its walk at 1366×768 (the ONE size), the screenshots.\n');
  }
  process.exit(s.done ? 0 : 1);
}

// ── every lesson that has a pack, then the ledger of what the old systems still serve ──
const packed = [];
for (const entry of index.filter((l) => l.pack)) packed.push(await statusOf(entry));
const configs = [];
for (const [id, dir] of folders) {
  const entry = index.find((l) => l.id === id);
  if (!entry) continue;
  const text = read(path.join(dir, 'lesson.config.js')) ?? '';
  const mission = /studentView:\s*'mission'/.test(text);
  // its old version is deleted: a v2 lesson by its pack, with no module page and no mission player left
  const retired = isV2Lesson(dir) && !fs.existsSync(path.join(dir, 'modules')) && !mission;
  configs.push({ entry, retired, mission });
}
const count = (fn) => configs.filter(fn).length;
const ledger = [
  ['lessons built', configs.length],
  ['v2: a pack with a world', count((c) => c.entry.pack?.world)],
  ['still on the mission player only (no world)', count((c) => c.mission && !c.entry.pack?.world)],
  ['still on the older lesson page (no mission, no world)', count((c) => !c.mission && !c.entry.pack?.world)],
  [
    'still open with a « prepare » (astaidd) module',
    count((c) => !c.retired && c.entry.modules.some(([, slug]) => slug === 'astaidd')),
  ],
  ['v2 whose old version is deleted (module pages, mission player)', count((c) => c.retired)],
  ['still without a board (old classroom mode, derived memo)', count((c) => !c.entry.pack?.board)],
];
if (args.includes('--json')) console.log(JSON.stringify({ packed, ledger: Object.fromEntries(ledger) }, null, 2));
else {
  console.log('\nLesson v2 — the lessons that have a pack\n');
  if (!packed.length) console.log('  (none yet: no lesson of the catalogue has a pack)');
  for (const s of packed)
    console.log(
      `  ${s.done ? '✅' : '❌'} ${s.id.padEnd(34)} ${s.grade}  ${s.done ? '' : `${s.failed} part(s) missing${s.unknown ? `, ${s.unknown} not checked` : ''}`}`,
    );
  console.log('\nThe retirement ledger — a legacy system is deleted in the commit that converts its last lesson\n');
  for (const [label, n] of ledger) console.log(`  ${String(n).padStart(4)}  ${label}`);
  console.log('');
}
