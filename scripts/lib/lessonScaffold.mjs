// THE SKELETON OF A v2 LESSON — the pure half of `scripts/lesson-new.mjs` (its test: `scripts/lesson-new.test.mjs`).
//
// What a new lesson needs that holds NO design decision is derived here from the catalogue and from the first lesson
// (`college/3e/nombres_calculs/multiples-et-diviseurs/decomposer-en-facteurs-premiers/`, « L1 » below): the glue files,
// the test files that call the shared suites of `gameworld/kit/authoring/test/suites.js`, and a stub for every content
// file. A stub exports what the pack, `world/index.js` and the suites read, each value `notWritten('<file> › <export>')`:
// touching it throws « SCAFFOLD: not written yet — … », so every test of the lesson FAILS with that message until the
// content is written. A stub never passes.
//
// INVISIBLE UNTIL ASSEMBLED. The tree discovers a lesson by four file names — `lesson.config.js` (the index generator,
// the validators, the status script, `resumePath.test.js`'s glob), `routes.jsx` and `lesson.pack.js` (the loaders'
// globs, check-routes) and `world/sitting.js` (`bankDisplay.test.js`'s eager glob). The scaffold writes those four with
// a `.draft` infix (`DRAFTS`) and imports them by that name inside the folder; `npm run lesson:assemble` renames them
// and rewrites the imports. Until then the lesson is in no index, no route, no glob, and the tree's checks stay green —
// except `check:unreached` and `check:unused`, which see every file of `apps/web/src`: they report the scaffold's files
// as dead until the lesson is assembled (which is true).
import fs from 'node:fs';
import path from 'node:path';
import * as prettier from 'prettier';

/** The string every unwritten value throws and every unwritten place carries; `lesson:assemble` refuses while it is in the folder. */
export const MARKER = 'SCAFFOLD: not written yet';
/** The helper file of the stubs, at the lesson's root; `lesson:assemble` deletes it once nothing imports it. */
export const HELPER = 'scaffold.notWritten.js';
/** The files the tree discovers by name: written `<name>.draft.<ext>` until `lesson:assemble`. */
export const DRAFTS = ['lesson.config.js', 'lesson.pack.js', 'routes.jsx', 'world/sitting.js'];
export const draftName = (file) => file.replace(/\.(jsx?)$/, '.draft.$1');

const L1 = 'college/3e/nombres_calculs/multiples-et-diviseurs/decomposer-en-facteurs-premiers';
const COMMON_FROM_ROOT = '../../../../../common';
const COMMON_FROM_SUB = '../../../../../../common';
const SUITES = `${COMMON_FROM_SUB}/gameworld/kit/authoring/test/suites.js`;

/**
 * What a WORLD asks of a lesson beyond L1's files (L1 plays `divisor-isles`; a world absent here needs nothing more).
 * `tablets`: the tablets live in their own `world/tablets.js` (not in `story.js`); `stubs`: the world's own content files,
 * stubbed like the others, each with the lesson whose shape it copies (`source`, a path from the repository).
 */
const DZ_PYRAMIDS = '../smarter-academy-dz/apps/web/src/lessons/moyen/4am/handasa/khassiyat-talis/talis-hisab-atwal';
const WORLD_CONTENT = {
  'nile-pyramids': {
    tablets: true,
    stubs: [
      {
        file: 'world/tablets.js',
        what: 'THE TABLETS of the lesson: the rule each key gives, shown once it is sealed (`lesson.rules`).',
        exports: [['TABLETS', '{ <key id>: { icon, title, lines, math, notes } } — the tablet of each rule']],
        source: `${DZ_PYRAMIDS}/world/tablets.js`,
      },
      {
        file: 'world/run.js',
        what: 'THE FELUCCA’S LEGS of the lesson: the kit’s rail between two docks (`story.legs[i]`, read by `nilePyramids/Game.js`).',
        exports: [
          ['LEGS', '[leg…] — leg i sails from the route’s dock i to the next; without a leg the felucca simply sails'],
        ],
        source: `${DZ_PYRAMIDS}/world/run.js`,
      },
    ],
  },
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

/**
 * The lesson `code` in the catalogue (`packages/core/curriculum/fr/lessons_<grade>_*.json`), with its unit and theme:
 * { code, grade, level, chapterId, chapterTitle, unitId, unitTitle, title, status, points, catalogueFile }.
 */
export function findLesson(root, code) {
  const dir = path.join(root, 'packages/core/curriculum/fr');
  for (const name of fs
    .readdirSync(dir)
    .filter((f) => /^lessons_.+\.json$/.test(f))
    .sort()) {
    const catalogue = readJson(path.join(dir, name));
    const lesson = catalogue.lessons?.find((l) => l.code === code);
    if (!lesson) continue;
    const grade = catalogue.grade;
    const suffix = name.slice('lessons_'.length);
    const unitsFile = path.join(dir, `units_${suffix}`);
    const programmeFile = path.join(dir, `programme_${suffix}`);
    const units = fs.existsSync(unitsFile) ? (readJson(unitsFile).units ?? []) : [];
    const domains = fs.existsSync(programmeFile) ? (readJson(programmeFile).domains ?? []) : [];
    const unit = units.find((u) => u.code === lesson.unitId);
    return {
      code,
      grade,
      level: 'college',
      kind: lesson.kind,
      chapterId: lesson.chapterId,
      chapterTitle: domains.find((d) => d.id === lesson.chapterId)?.title ?? null,
      unitId: lesson.unitId,
      unitTitle: unit?.title ?? null,
      title: lesson.title,
      status: lesson.status,
      points: (lesson.pointsToLearn ?? []).length,
      catalogueFile: path.relative(root, path.join(dir, name)),
    };
  }
  return null;
}

/** The worlds that exist (`gameworld/worlds.js › WORLDS`): a lesson plays one of them. */
export function knownWorlds(root) {
  const file = path.join(root, 'apps/web/src/lessons/common/gameworld/worlds.js');
  const text = fs.readFileSync(file, 'utf8');
  return [...text.matchAll(/^\s*'([a-z0-9-]+)'\s*:/gm)].map((m) => m[1]);
}

/** The lesson's folder, relative to the repository: `apps/web/src/lessons/<level>/<grade>/<theme>/<unit>/<code>`. */
export const lessonDir = (info) =>
  `apps/web/src/lessons/${info.level}/${info.grade}/${info.chapterId}/${info.unitId}/${info.code}`;

const words = (code) => code.split('-').filter(Boolean);
const pascal = (code) =>
  words(code)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');
const camel = (code) => {
  const p = pascal(code);
  return p[0].toLowerCase() + p.slice(1);
};
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/** A stub content file: its header, then one `notWritten` per export the tree reads. */
function stub({ file, what, l1, exports, depth = 1, source }) {
  const helper = depth === 0 ? `./${HELPER}` : `../${HELPER}`;
  const lines = exports.map(
    ([name, shape]) => `/** ${shape} */\nexport const ${name} = notWritten(${q(`${file} › ${name}`)});`,
  );
  const shape = source ? `Its shape is \`${source}\`` : `Its shape is L1's: \`apps/web/src/lessons/${L1}/${l1}\``;
  return `/**
 * ${what}
 *
 * ${MARKER}: written by \`npm run lesson:new\` as a STUB. ${shape}.
 * Replace every \`notWritten(…)\` with the lesson's content (and drop the import below when none is left).
 */
import { notWritten } from '${helper}';

${lines.join('\n\n')}
`;
}

/** A generated test: the shared suite with this lesson's modules, then ONE marked place for the lesson's own assertions. */
function suiteTest({ code, file, what, imports, own = [], call, l1, ownTitle }) {
  const ownBlock = own.length
    ? `\n// ── THE LESSON'S OWN INPUTS of the shared suite — write them here (L1: \`${l1}\`) ──\n${own
        .map(([name, shape]) => `/** ${shape} */\nconst ${name} = notWritten(${q(`${file} › ${name}`)});`)
        .join('\n')}\n`
    : '';
  return `// ${what}
// Generated by \`npm run lesson:new\`: the shared suite runs on this lesson's modules as it is; only the marked places
// are the lesson's to write.
import { describe, it } from 'vitest';
${imports.join('\n')}${own.length ? `\nimport { notWritten } from '../${HELPER}';` : ''}

const ID = ${q(code)};
${ownBlock}
${call}

// ── THE LESSON'S OWN ASSERTIONS — write them here, in place of the failing line (L1: \`${l1}\`) ──
describe(\`\${ID} — ${ownTitle}\`, () => {
  it('is written', () => {
    throw new Error(${q(`${MARKER} — ${file}: the lesson’s own assertions`)});
  });
});
`;
}

/** Every file of the scaffold: [{ file (relative to the lesson's folder), text }], in a stable order. */
export function scaffoldFiles(info, world, { hasBank = true } = {}) {
  const { code, title } = info;
  const base = `/courses/${info.level}/${info.grade}/${info.chapterId}/${code}`;
  const S = (n) => `world/${n}`;
  const W = WORLD_CONTENT[world] ?? {};
  // where `TABLETS` is exported: `story.js` (L1), or the world's own `tablets.js`
  const tabletsImport = W.tablets ? `import { TABLETS } from './tablets';` : null;
  const coach = Array.from({ length: Math.max(info.points, 1) }, (_, i) => `P${i + 1}`)
    .map((p) => `    ${p}: ${q(`${MARKER} — the knowledge sheet (world/knowledge.js) behind ${p}`)},`)
    .join('\n');
  const files = [];
  const add = (file, text) => files.push({ file, text });

  add(
    HELPER,
    `/**
 * SCAFFOLD of lesson \`${code}\` — written by \`npm run lesson:new\`, deleted by \`npm run lesson:assemble\` once no file
 * of the lesson imports it. A value the lesson has not written yet is \`notWritten('<file> › <export>')\`: reading it,
 * calling it, spreading it or iterating it throws « ${MARKER} — <file> › <export> », so every test that needs it
 * FAILS with that message. A stub never passes.
 */
const LOUD = new Set([Symbol.iterator, Symbol.asyncIterator, Symbol.toPrimitive]);

export function notWritten(what) {
  const fail = () => {
    throw new Error(\`${MARKER} — \${what}\`);
  };
  // \`then\` and the inspection symbols stay quiet: a stub is not a promise, and printing it must not hide the message
  const quiet = (key) => key === 'then' || (typeof key === 'symbol' && !LOUD.has(key));
  return new Proxy(function notWrittenYet() {}, {
    get: (_, key) => (quiet(key) ? undefined : fail()),
    has: fail,
    ownKeys: fail,
    apply: fail,
    construct: fail,
    set: fail,
    deleteProperty: fail,
    defineProperty: fail,
  });
}
`,
  );

  add(
    'index.jsx',
    `import LessonIndex from '${COMMON_FROM_ROOT}/components/LessonIndex';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config.draft';

export default function ${pascal(code)}Index() {
  return <LessonIndex config={LESSON_CONFIG} basePath={LESSON_BASE_PATH} />;
}
`,
  );

  add(
    draftName('routes.jsx'),
    `import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config.draft';
import { buildLessonRoutes } from '${COMMON_FROM_ROOT}/lessonRoutes';

// A v2 lesson (docs/architecture/LESSON_V2.md §2): its home is the game world; it has no module page. The module
// addresses of its config still answer — each one redirects to the home, never a 404. Its knowledge is the one its pack
// declares (the world's « carte des connaissances »), never a second map.
export default function ${camel(code)}Routes() {
  return buildLessonRoutes({
    config: LESSON_CONFIG,
    basePath: LESSON_BASE_PATH,
    loadIndex: () => import('./index.jsx'),
  });
}
`,
  );

  add(
    draftName('lesson.pack.js'),
    `/**
 * THE PACK of the lesson — the ONE place where it says what it gives the platform beyond its modules
 * (docs/architecture/LESSON_V2.md §1). \`scripts/generate-lesson-index.mjs\` reads this file and writes its flags into
 * \`lessons/lessonIndex.generated.json\`; the content stays behind each \`() => import()\`.
 * A data module: no static import (Node reads it).
 */
export const LESSON_PACK = {
  id: ${q(code)},
  // PAUSED (owner, 2026-11-18): phones are not built for now — the lesson is for the laptop and the tablet.
  phone: false,
  // the student's game world: the unit's world, played with this lesson's story and content
  world: { id: ${q(world)}, content: () => import('./world').then((m) => m.lesson) },
  // the lesson's knowledge sheets — the board's knowledge card, the rule the exam coach reminds (LESSON_V2.md §2)
  knowledge: () => import('./world/knowledge.js').then((m) => m.LESSON_KNOWLEDGE),
  // the exam coach: the knowledge sheet behind each learning point (savoir-faire) of the lesson (world/evidence.js ›
  // POINTS) — L1: \`coach: { P1: 'plus-petit-premier', … }\`
  coach: {
${coach}
  },
  // the class session: the lesson on the board and its written memo
  board: {
    script: () => import('./board/script.js').then((m) => m.SCRIPT),
    memo: () => import('./board/memo.js').then((m) => m.MEMO),
  },
};
`,
  );

  const facts = [
    `id: ${q(code)}`,
    `kind: ${q(info.kind ?? 'lesson')}`,
    `unit: ${q(info.unitId)}`,
    info.unitTitle ? `unitTitle: ${q(info.unitTitle)}` : null,
    `title: ${q(title)}`,
    `level: ${q(info.level)}`,
    `grade: ${q(info.grade)}`,
    `chapter: ${q(info.chapterId)}`,
    info.chapterTitle ? `chapterTitle: ${q(info.chapterTitle)}` : null,
  ].filter(Boolean);
  add(
    draftName('lesson.config.js'),
    `/**
 * ${info.grade} — « ${title} ». A v2 lesson played in the world \`${world}\` (\`lesson.pack.js\`, \`world/\`), built from the
 * net's learning points (\`npm run lesson:brief -- ${code}\`).
 *
 * ${MARKER}: written by \`npm run lesson:new\` as a STUB. Its shape is L1's: \`apps/web/src/lessons/${L1}/lesson.config.js\`
 * (its \`modules\` are DATA: their ids and numbers are how progress is stored). From the catalogue:
${facts.map((f) => ` *   ${f},`).join('\n')}
 */
import { notWritten } from './${HELPER}';

export const LESSON_BASE_PATH = ${q(base)};

/** { id, kind, unit, unitTitle, title, description, level, grade, chapter, chapterTitle, …, modules: [{ id, number, slug, path, … }] } */
export const LESSON_CONFIG = notWritten('lesson.config.js › LESSON_CONFIG');
`,
  );

  add(
    'world/index.js',
    `/**
 * THE CONTENT of lesson \`${code}\` for its game world: everything the kit's screens and frames need from the lesson,
 * in ONE object (\`lesson\`). The world's shell hands it down with \`<LessonProvider lesson={lesson}>\`; a screen of the kit
 * reads it with \`useLesson()\` and never imports this folder. Named in the lesson's pack (\`lesson.pack.js\`).
 */
import { evidence, trainerEvidence } from './evidence';
import { FORGES } from './forges';
import { KEYS, journey } from './journey';
import { CARDS, KNOWLEDGE } from './knowledge';
import { ladder, PRACTICE_MAP } from './practice';
import { sittings } from './sitting.draft';
${tabletsImport ? `import { MODULE_KEYS, STORY } from './story';\n${tabletsImport}` : `import { MODULE_KEYS, STORY, TABLETS } from './story';`}
import { TEXT } from './text';
import { trainer } from './trainer';

export const lesson = {
  /** The rules of the lesson, in the order the story gives them. */
  keys: KEYS,
  /** The tablet of each rule: { icon, title, lines, math, notes }. */
  rules: TABLETS,
  /** The keys the lesson's own progress proves: those the modules he completed teach (\`MODULE_KEYS\`). */
  keysFromModules(done = []) {
    const proved = new Set(done.flatMap((m) => MODULE_KEYS[Number(m)] ?? []));
    return KEYS.filter((k) => proved.has(k));
  },
  /** The story the world plays: its islands and gaps, and what happens on the way. */
  story: STORY,
  /** The forge of each rule: what the student predicts, the tiles of his rule, how the mirror tests and attacks it. */
  forges: FORGES,
  ladder,
  /** The practice hub: { root, positions, edges }. */
  practiceMap: PRACTICE_MAP,
  sittings,
  /** « S’entraîner » : its questions, how they are judged, and which of their answers are evidence. */
  trainer: { ...trainer, evidenceOf: trainerEvidence },
  journey,
  evidence,
  /** Which card of the knowledge map trains what a sitting missed (\`knowledge.js › CARDS\`). */
  cards: CARDS,
  /** « La carte des connaissances » : { graph, modules, positions }. */
  knowledge: KNOWLEDGE,
  text: TEXT,
};
`,
  );

  add(
    draftName('world/sitting.js'),
    `/**
 * « Brevet blanc » of lesson \`${code}\` — its EXERCISE BANK, served AS IT IS: \`content/practice/${info.grade}/${code}\`,
 * read through the practice space's loader. The frame, the marking and the evidence are the kit's:
 * \`gameworld/kit/bankSitting.js\`. Nothing of the bank is written here.
 */
import { BANK_LEVELS, createBankSittings } from '${COMMON_FROM_SUB}/gameworld/kit/bankSitting';

export const LEVELS = BANK_LEVELS;
export const sittings = createBankSittings({ lesson: ${q(code)}, levels: LEVELS });
`,
  );

  // ── the content stubs ──
  const stubs = [
    [
      S('story.js'),
      'THE STORY of the lesson: its keys, its road (islands, gaps, bridges), its tablets.',
      [
        ['K', "the names of the keys: { name: '<key id>' } (L1: { ladder: 'plus-petit-premier', … })"],
        ['MODULE_KEYS', '{ <module number>: [<key id>…] } — the keys each module of the config needs'],
        ...(W.tablets
          ? []
          : [['TABLETS', '{ <key id>: { icon, title, lines, math, notes } } — the tablet of each rule']]),
        ['STORY', '{ segments, text: { say, objective, … }, … } — the road the world plays'],
      ],
    ],
    [
      S('math.js'),
      'THE MATHS of the lesson: its numbers and the French writing of its formulas.',
      [['NUMBERS', '{ road: [...], boss: { … }, … } — the design’s numbers']],
    ],
    [
      S('text.js'),
      'The sentences of the lesson that the kit’s screens show.',
      [['TEXT', '{ levels: { <node>: [name…] }, worlds: {}, summary: { icon, title, text }, busy }']],
    ],
    [
      S('forges.js'),
      'THE FORGES of the lesson: one per key — predict, write his rule, the mirror tests it.',
      [['FORGES', '{ <key id>: forge } — see L1 and `gameworld/kit/forge.js`']],
    ],
    [
      S('inquiries.js'),
      'THE EXPERIMENTS of the lesson (the « Explore » screens), one spec per key that has one.',
      [['INQUIRIES', 'L1 exports one spec per experiment (LADDER_INQUIRY, STOP_INQUIRY, SHEET_INQUIRY): name yours']],
    ],
    [
      S('practice.js'),
      'THE PRACTICE LADDER of the lesson: its nodes, its waves, its hub.',
      [
        ['PRACTICE_NODES', '[{ key, levels: [...] }…, summary] — `createLadder` of `gameworld/kit/ladder.js`'],
        ['ladder', 'createLadder({ nodes: PRACTICE_NODES, generators, isRight })'],
        ['PRACTICE_MAP', '{ root, positions, edges } — the practice hub'],
      ],
    ],
    [
      S('trainer.js'),
      '« Entraîne-toi » of the lesson: its questions, how they are judged, their solutions.',
      [
        ['trainer', 'createTrainer({ … }) of `gameworld/kit/trainer.js`'],
        ['check', '(q, value) => verdict'],
        ['solution', '(q) => the right answer'],
        ['answerLabel', '(q, value) => the answer as written back'],
        ['PLAN_OF', '{ <card id>: plan } — what a session of each card asks'],
      ],
    ],
    [
      S('journey.js'),
      'The student’s road through the lesson: its keys bound to its ladder and its exam levels.',
      [
        ['KEYS', '[<key id>…] — the rules of the lesson, in the order the story gives them'],
        ['journey', 'createJourney({ keys, ladder, levels, stages, cards }) of `gameworld/kit/journey.js`'],
      ],
    ],
    [
      S('knowledge.js'),
      '« La carte des connaissances » of the lesson and its knowledge sheets.',
      [
        ['KNOWLEDGE_GRAPH', '{ nodes, links } — the cards of the map'],
        ['LESSON_KNOWLEDGE', '{ modules, … } — the pack’s knowledge (`lesson.pack.js › knowledge`)'],
        ['KNOWLEDGE', '{ graph, modules, positions }'],
        ['CARDS', '{ <card id>: … } — which card trains what a sitting missed'],
      ],
    ],
    [
      S('evidence.js'),
      'THE EVIDENCE of the lesson: which savoir-faire each answer proves.',
      [
        ['evidence', '{ ...createEvidence({ grade, points: POINTS }), caseEvidence } of `gameworld/kit/evidence.js`'],
        ['trainerEvidence', '(q, value, ctx) => claim | null'],
      ],
    ],
    [
      'board/script.js',
      'THE LESSON ON THE BOARD (the class session): its steps, its keys, its copybook.',
      [['SCRIPT', '{ … } — the board’s script (`features/classSession/boardLessons.js`)']],
    ],
    [
      'board/memo.js',
      'THE WRITTEN MEMO of the lesson for its teacher.',
      [['MEMO', '{ … } — the memo (`features/classSession/lessonMemos.js`)']],
    ],
  ];
  for (const [file, what, exports] of stubs) add(file, stub({ file, what, l1: file, exports }));
  for (const s of W.stubs ?? []) add(s.file, stub({ ...s, l1: s.file }));

  // ── the tests that call the shared suites ──
  const l1t = (n) => `apps/web/src/lessons/${L1}/world/${n}`;
  add(
    S('story.test.js'),
    suiteTest({
      code,
      file: S('story.test.js'),
      what: `THE STORY of ${code}: the shared checks (authoring kit), then the road's own.`,
      imports: [
        `import { describeStory } from '${SUITES}';`,
        ...(tabletsImport
          ? [`import { STORY } from './story';`, tabletsImport]
          : [`import { STORY, TABLETS } from './story';`]),
        `import { KEYS } from './journey';`,
      ],
      own: [
        ['SENTENCES', 'sentences built by the story’s functions, read with its fixed strings: [T.say.x(…), …]'],
        ['BEFORE', '{ <key id>: { words: /its name|its rule/, lines: [every sentence played before its forge] } }'],
      ],
      call: `describeStory({ id: ID, story: STORY, tablets: TABLETS, keys: KEYS, sentences: SENTENCES, before: BEFORE });`,
      l1: l1t('story.test.js'),
      ownTitle: 'its own road',
    }),
  );
  add(
    S('forges.test.js'),
    suiteTest({
      code,
      file: S('forges.test.js'),
      what: `THE FORGES of ${code}: the shared checks (authoring kit), then the false rules its students really hold.`,
      imports: [
        `import { describeForges } from '${SUITES}';`,
        `import { FORGES } from './forges';`,
        `import { KEYS } from './journey';`,
      ],
      own: [
        ['ROADS', '{ <road name>: { <key id>: log } } — the logs each forge is opened on (L1: AT_ONCE, WALKED, EVERY)'],
        ['INQUIRY', '{ <key id>: result } — what a forge’s own experiment handed back'],
        ['SOLVE', '{ <key id>: (case) => values } — the right answer of the last step'],
        ['FORBIDDEN', '{ <key id>: RegExp } — the words of the key’s name and of what it states'],
        // the suite reads the bank as it starts: with no bank yet, its name waits here, failing as « not written »
        ...(hasBank
          ? []
          : [['BANK', `ID, once the bank content/practice/${info.grade}/${code} is ported (L1: \`bank: ID\`)`]]),
      ],
      call: `describeForges({
  forges: FORGES,
  keys: KEYS,
  roads: ROADS,
  inquiry: INQUIRY,
  solve: SOLVE,
  forbidden: FORBIDDEN,
  bank: ${hasBank ? 'ID' : 'BANK'},
});`,
      l1: l1t('forges.test.js'),
      ownTitle: 'the rules its students really hold',
    }),
  );
  add(
    S('inquiries.test.js'),
    suiteTest({
      code,
      file: S('inquiries.test.js'),
      what: `THE EXPERIMENTS of ${code}: the shared checks (authoring kit), then the lesson's own.`,
      imports: [`import { describeExperiments } from '${SUITES}';`],
      own: [
        ['OF_KEY', '{ <key id>: the experiment spec of inquiries.js }'],
        ['LINES_OF', '(key, spec) => [every sentence the experiment can say]'],
        ['NEVER', 'RegExp — the words no experiment says (the lesson’s names)'],
        ['OWN', '{ <key id>: RegExp } — the words of each key’s name and of what it states'],
      ],
      call: `describeExperiments({ ofKey: OF_KEY, linesOf: LINES_OF, never: NEVER, own: OWN });`,
      l1: l1t('inquiries.test.js'),
      ownTitle: 'its own experiments',
    }),
  );
  add(
    S('evidence.test.js'),
    suiteTest({
      code,
      file: S('evidence.test.js'),
      what: `THE EVIDENCE of ${code}: the shared checks (authoring kit) — a claim is true exactly when \`check\` accepts the
// WHOLE answer — then the lesson's own.`,
      imports: [
        `import { describeEvidence } from '${SUITES}';`,
        `import { LESSON_CONFIG } from '../lesson.config.draft';`,
        `import { KNOWLEDGE } from './knowledge';`,
        `import { KEYS } from './journey';`,
        `import { evidence, trainerEvidence } from './evidence';`,
        `import { check, solution, trainer } from './trainer';`,
      ],
      own: [
        ['BOXES', '{ kind: [box…] } or (q) => [box…] | null — the kinds whose first exam try is evidence'],
        ['KINDS', '[kind…] — the kinds that must each be seen'],
        ['MISTAKES', '(q, right) => [answers] — the mistakes of THIS lesson'],
      ],
      call: `// a lesson with more keys than learning points passes \`pointOf: { <key id>: 'P<n>' }\` too (suites.js › describeEvidence)
describeEvidence({
  id: ID,
  keys: KEYS,
  evidence,
  trainerEvidence,
  trainer,
  check,
  solution,
  cards: KNOWLEDGE.graph.nodes.map((n) => n.id),
  boxes: BOXES,
  kinds: KINDS,
  mistakes: MISTAKES,
  config: LESSON_CONFIG,
});`,
      l1: l1t('evidence.test.js'),
      ownTitle: 'its own evidence',
    }),
  );
  add(
    S('trainer.test.js'),
    suiteTest({
      code,
      file: S('trainer.test.js'),
      what: `« Entraîne-toi » of ${code}: the shared checks (authoring kit), then the lesson's own.`,
      imports: [
        `import { describeTrainer } from '${SUITES}';`,
        `import { KNOWLEDGE } from './knowledge';`,
        `import { trainerEvidence } from './evidence';`,
        `import { PLAN_OF, answerLabel, check, solution, trainer } from './trainer';`,
      ],
      own: [['KINDS', '[kind…] — every kind a session can ask (each must be seen)']],
      call: `describeTrainer({
  trainer,
  check,
  solution,
  answerLabel,
  evidenceOf: trainerEvidence,
  planOf: PLAN_OF,
  cards: KNOWLEDGE.graph.nodes.map((n) => n.id),
  kinds: KINDS,
});`,
      l1: l1t('trainer.test.js'),
      ownTitle: 'its own trainer',
    }),
  );
  add(
    S('journey.test.js'),
    suiteTest({
      code,
      file: S('journey.test.js'),
      what: `The road and the knowledge map of ${code}: the shared checks of the map (authoring kit), then the lesson's own.`,
      imports: [
        `import { describeKnowledge } from '${SUITES}';`,
        `import { CARDS, KNOWLEDGE } from './knowledge';`,
        `import { KEYS } from './journey';`,
      ],
      call: `describeKnowledge({ knowledge: KNOWLEDGE, keys: KEYS, cards: CARDS });`,
      l1: l1t('journey.test.js'),
      ownTitle: 'the road and its modules',
    }),
  );
  add(
    S('limits.test.js'),
    suiteTest({
      code,
      file: S('limits.test.js'),
      what: `THE LIMITS of ${code}: its data against what the walks proved (the defaults of \`PROVEN_LIMITS\`; a limit is
// raised here ONLY with the number a walk of this lesson measured).`,
      imports: [
        `import { describeLimits } from '${SUITES}';`,
        `import { SCRIPT } from '../board/script';`,
        `import { FORGES } from './forges';`,
        `import { KEYS } from './journey';`,
        `import { KNOWLEDGE } from './knowledge';`,
        `import { PRACTICE_MAP } from './practice';`,
        tabletsImport ?? `import { TABLETS } from './story';`,
      ],
      own: [['OBJECTIVES', '[every instruction the story can show, with the longest arguments its road gives them]']],
      call: `describeLimits({
  forges: FORGES,
  keys: KEYS,
  tablets: TABLETS,
  objectives: OBJECTIVES,
  knowledge: KNOWLEDGE,
  practiceMap: PRACTICE_MAP,
  script: SCRIPT,
});`,
      l1: l1t('limits.test.js'),
      ownTitle: 'its own limits',
    }),
  );
  add(
    S('sitting.test.js'),
    suiteTest({
      code,
      file: S('sitting.test.js'),
      what: `« Brevet blanc » of ${code}: the REAL bank (content/practice/${info.grade}/${code}), served as it is.`,
      imports: [
        `import { describeSitting } from '${SUITES}';`,
        `import { evidence } from './evidence';`,
        `import { KEYS } from './journey';`,
        `import { LEVELS, sittings } from './sitting.draft';`,
      ],
      call: `/** What the sitting reads of the lesson (\`world/index.js › lesson\`): its keys and its evidence. */
describeSitting({ id: ID, lesson: { keys: KEYS, evidence }, sittings, levels: LEVELS });`,
      l1: l1t('sitting.test.js'),
      ownTitle: 'its own sitting',
    }),
  );

  return files.sort((a, b) => a.file.localeCompare(b.file));
}

/** The text as the tree's Prettier writes it (its config is found from the file's place). */
export async function formatted(file, text) {
  const options = (await prettier.resolveConfig(file)) ?? {};
  return prettier.format(text, { ...options, filepath: file });
}

/**
 * Writes the scaffold of `code` under `root`. Refuses an existing folder. Returns { dir, files } (files relative to the
 * repository); with `dryRun`, writes nothing.
 */
export async function scaffold(root, code, { world, dryRun = false } = {}) {
  const info = findLesson(root, code);
  if (!info) throw new Error(`« ${code} » is in no catalogue of packages/core/curriculum/fr/`);
  if (info.kind && info.kind !== 'lesson')
    throw new Error(`« ${code} » is a ${info.kind}, not a lesson: a unit's last lesson is built on the mission isle`);
  const worlds = knownWorlds(root);
  if (!world) throw new Error(`--world <id> is required (one of: ${worlds.join(', ')})`);
  if (!worlds.includes(world))
    throw new Error(`unknown world « ${world} » (gameworld/worlds.js: ${worlds.join(', ')})`);
  const dir = lessonDir(info);
  const abs = path.join(root, dir);
  if (fs.existsSync(abs)) throw new Error(`${dir} exists already — lesson:new never overwrites a lesson`);
  const hasBank = fs.existsSync(path.join(root, 'content/practice', info.grade, code));
  const files = scaffoldFiles(info, world, { hasBank });
  if (!dryRun)
    for (const { file, text } of files) {
      const target = path.join(abs, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, await formatted(target, text));
    }
  return { info, dir, files: files.map((f) => `${dir}/${f.file}`) };
}
