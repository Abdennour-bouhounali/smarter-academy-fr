// The words of each lesson of the shared world « أرخبيل القواسم » — READ FROM THE LESSONS' DATA, never kept by hand, so a
// renamed island or tablet can never leave a walk checking a stale name (2026-11-19: four lessons were repaired and their
// hand lists in lib/baqi.mjs, lib/qawaid.mjs, lib/hasr.mjs and lib/walk.mjs had gone stale).
//
// The lessons: every lesson whose pack plays the world `divisor-isles` (lessons/lessonIndex.generated.json › pack.world).
// Their content cannot be imported by Node as it is (imports without extension, JSX in the pilot's knowledge.jsx), so ONE
// esbuild bundle of the six `world/index.js` (+ `board/`, `lesson.config.js` and the kit's `divisorIsles/strings.js`) is
// built in memory when a walk starts (~0.3 s) and imported from a data: URL; CSS, images and Vite's `virtual:` modules are stubbed.
//
// A lesson's NAMES (what would betray it on another lesson's screen):
//   the lesson's title (lesson.config.js), its story's title (after « أرخبيل القواسم: », the world's name, shared),
//   its islands, its store (`story.text.boss.title`, or the kit's when the story keeps it), its tablets (`rules[*].title`),
//   its practice levels and real-world worlds (`text.levels`, `text.worlds[*].name`), its knowledge sheets
//   (`knowledge.modules[*].title`).
// Two rules drop a name that would be ordinary Arabic on any screen: fewer than 5 characters, or ONE word (« البرهان »,
// « المضاعفات »: a word of the subject, not a name).
// A lesson's OWN TEXT: every string of its world content, its board (script + memo), its config, and the kit's text as its
// story overrides it (`Game.js › withStory`; the kit's pilot tablets left out: they are the pilot's).
// foreignWordsFor(id) = the names of the OTHER lessons, minus every name that is a substring of the lesson's own text
// (« جزيرة الضوء » is the kit's dash island in every lesson; « جزيرة البقايا » is in two lessons; « القسمة الإقليدية » is
// inside the 2AM lesson's own title): a set difference, never a hand list.
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '../..');
const LESSONS = join(WEB, 'src/lessons');
const WORLD = 'divisor-isles';
const KIT_STRINGS = join(LESSONS, 'common/gameworld/divisorIsles/strings.js');

const index = JSON.parse(readFileSync(join(LESSONS, 'lessonIndex.generated.json'), 'utf8'));
/** The lessons of the world, in the order of the generated index. */
export const WORLD_LESSONS = index.lessons.filter((l) => l.pack?.world === WORLD).map((l) => l.id);

/** The folder of a lesson: src/lessons/<level>/<grade>/<chapter>/<sub-unit>/<id>. */
function folderOf({ id, level, grade, chapter }) {
  const unit = join(LESSONS, level, grade, chapter);
  for (const sub of readdirSync(unit, { withFileTypes: true })) {
    if (sub.isDirectory() && existsSync(join(unit, sub.name, id, 'lesson.pack.js'))) return join(unit, sub.name, id);
  }
  throw new Error(`lessonWords: no folder for lesson ${id}`);
}

const STUB = {
  name: 'stub-assets',
  setup(b) {
    b.onResolve({ filter: /\.(css|svg|png|webp|jpe?g)$|^virtual:/ }, (a) => ({ path: a.path, namespace: 'stub' }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default {}', loader: 'js' }));
  },
};

async function loadLessons() {
  const { build } = createRequire(join(WEB, 'package.json'))('esbuild');
  const lines = [`export { T } from ${JSON.stringify(KIT_STRINGS)};`];
  WORLD_LESSONS.forEach((id, i) => {
    const dir = folderOf(index.lessons.find((l) => l.id === id));
    const part = (f, what) => (existsSync(join(dir, f)) ? `export ${what} from ${JSON.stringify(join(dir, f))};` : '');
    lines.push(
      part('world/index.js', `{ lesson as world${i} }`),
      part('board/script.js', `{ SCRIPT as script${i} }`),
      part('board/memo.js', `{ MEMO as memo${i} }`),
      part('lesson.config.js', `{ LESSON_CONFIG as config${i} }`),
    );
  });
  const out = await build({
    stdin: { contents: lines.join('\n'), resolveDir: WEB, loader: 'js' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
    resolveExtensions: ['.mjs', '.js', '.jsx', '.json'], // Vite's order: `./trainer` is trainer.js
    jsx: 'automatic',
    plugins: [STUB],
    logLevel: 'error',
  });
  return import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);
}

/** Every string inside a value (objects, arrays, React elements' props), functions left out. */
function stringsOf(value) {
  const out = [];
  const seen = new Set();
  const walk = (v) => {
    if (typeof v === 'string') out.push(v);
    else if (v && typeof v === 'object' && !seen.has(v)) {
      seen.add(v);
      for (const x of Object.values(v)) walk(x);
    }
  };
  walk(value);
  return out;
}

/** The kit's text as a story overrides it (the same merge as `divisorIsles/Game.js › withStory`). */
function withStory(base, over) {
  if (!over) return base;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && typeof base[k] === 'object' ? withStory(base[k], v) : v;
  }
  return out;
}

const WORLD_NAME_PREFIX = /^أرخبيل القواسم:\s*/;
/** A name worth checking: at least 5 characters and more than one word. */
const isName = (s) => typeof s === 'string' && s.trim().length >= 5 && /\s/.test(s.trim());

const mod = await loadLessons();
const { tablets: _pilotTablets, ...KIT_TEXT } = mod.T;

/** id → { names: Set, text: string } */
const BY_LESSON = new Map(
  WORLD_LESSONS.map((id, i) => {
    const world = mod[`world${i}`];
    const config = mod[`config${i}`];
    const text = withStory(KIT_TEXT, world.story?.text);
    const names = [
      config?.title,
      typeof text.title === 'string' ? text.title.replace(WORLD_NAME_PREFIX, '') : null,
      ...(world.story?.islands ?? []).map((x) => x.name),
      text.boss?.title,
      ...Object.values(world.rules ?? {}).map((x) => x?.title),
      ...Object.values(world.text?.levels ?? {}).flat(),
      ...Object.values(world.text?.worlds ?? {}).map((x) => x?.name),
      ...Object.values(world.knowledge?.modules ?? {})
        .flat()
        .map((x) => x?.title),
    ]
      .filter(isName)
      .map((s) => s.trim());
    const own = [world, text, mod[`script${i}`], mod[`memo${i}`], config].flatMap(stringsOf).join('\n');
    return [id, { names: new Set(names), text: own }];
  }),
);

/** The names of ONE lesson (its own, before any difference). */
export function namesOf(lessonId) {
  const l = BY_LESSON.get(lessonId);
  if (!l) throw new Error(`lessonWords: ${lessonId} is not a lesson of the world ${WORLD}`);
  return [...l.names];
}

/**
 * Every name of the OTHER lessons of the world that this lesson's own text never contains. `extra`: words a library adds
 * by hand (each justified where it is written) — they pass the same difference.
 */
export function foreignWordsFor(lessonId, extra = []) {
  const own = BY_LESSON.get(lessonId);
  if (!own) throw new Error(`lessonWords: ${lessonId} is not a lesson of the world ${WORLD}`);
  const out = new Set();
  for (const [id, l] of BY_LESSON) {
    if (id === lessonId) continue;
    for (const w of l.names) if (!own.text.includes(w)) out.add(w);
  }
  for (const w of extra) if (!own.text.includes(w)) out.add(w);
  return [...out];
}

/** The words foreign to EVERY lesson of `lessonIds`: the list for an export that walks of several lessons share. */
export function foreignToAll(lessonIds, extra = []) {
  // No lesson of the world yet (the empty catalogue): nothing is foreign.
  if (!lessonIds.length) return [];
  const [first, ...rest] = lessonIds.map((id) => foreignWordsFor(id, extra));
  return first.filter((w) => rest.every((l) => l.includes(w)));
}
