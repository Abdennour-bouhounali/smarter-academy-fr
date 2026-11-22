/**
 * « قصر الساحات » — the rule forge IN THIS WORLD (PURE; the frame is kit/forge.js, the screen kit/RuleForge.jsx, the
 * drawing of a case forgeParts.jsx). It names no lesson: a lesson's `world/forges.js` builds its forges on these cases.
 *
 * A CASE is a court and a rod: `{ a: '30', s: { q: '5,47' }, held, kind, …extras }`
 *   a      the court's area, as TEXT (« 30 », « 0,25 », « 49/64 ») — written on its gate as it is given
 *   s      the rod: `{ q: '5,47' }` (a number) or `{ root: '30' }` (the court's own wall) — logic.js
 *   held   what the case is TRUE of: by default « the platform rides » (logic.js › outcome). A forge that asks another
 *          question of the same platform passes its own `held` in the extras; the drawing still shows what the world did
 *   kind   what the world did: 'ride' | 'band' | 'jam' (always computed, never given)
 *   extras what a lesson adds — `tag` (a short word shown in the line of evidence), `head` (the case's own name in that
 *          line, when « ساحة 36 · مقياس 6 » is not what it is about), `id` (an identity of its own), `zoom` (a forced
 *          magnifier factor for the mirror).
 * Every number is exact (logic.js): a rod of 5,477225575 does not ride the court of 30, and the forge knows it.
 */
import { counted, ltr } from '../kit/authoring/numbers';
import { read, write, rod as rodOfNumber, wall, isWall, outcome, rodText, rodTex, tex } from './logic';

// ───────────────────────────── the words: a number of tiles, agreed ─────────────────────────────

/** Tiles, as a subject or a predicate: « بلاطة واحدة », « بلاطتان », « 5 بلاطات », « 30 بلاطة », « 100 بلاطة ». */
export const TILES = ['بلاطة واحدة', 'بلاطتان', 'بلاطات', 'بلاطة', 'بلاطة'];
const isWhole = (x) => read(x).d === 1n;
const asText = (x) => (typeof x === 'string' ? x.trim() : write(x));

/**
 * A number of tiles with its noun (defects.md B11): a whole number through the kit's `counted` (1, 2, 3–10, 11+, the
 * hundreds); a decimal or a fraction takes « بلاطة » (« 0,0791 بلاطة », « 49/64 بلاطة »). The number is written as it was
 * given (a fraction stays a fraction).
 */
export function tiles(x) {
  const t = asText(x);
  return isWhole(t) ? counted(Number(read(t).n), TILES) : `${t} بلاطة`;
}
/** The noun alone, for a number already written above it (a gate's plaque): « بلاطة واحدة », « بلاطتان », « بلاطات », « بلاطة ». */
export function tileWord(x) {
  const t = asText(x);
  if (!isWhole(t)) return 'بلاطة';
  const n = Number(read(t).n);
  const full = counted(n, TILES);
  return n === 1 || n === 2 ? full : full.slice(String(n).length + 1);
}
/**
 * A number in the writing of its court: a court given as a fraction (« 49/64 ») has its band and its platform written as
 * fractions too (« 33/64 », never « 0,515625 » beside « 49/64 »); any other court as logic.js writes them.
 */
export function inCourtWriting(x, area) {
  if (!String(area).includes('/')) return asText(x);
  const { n, d } = read(x);
  return d === 1n ? String(n) : `${n}/${d}`;
}
/** « بـ » and a number of tiles (genitive): « ببلاطة واحدة », « ببلاطتين », « بـ 6 بلاطات », « بـ 0,0304 بلاطة ». */
export function byTiles(x) {
  const t = asText(x);
  if (isWhole(t) && read(t).n === 1n) return 'ببلاطة واحدة';
  if (isWhole(t) && read(t).n === 2n) return 'ببلاطتين';
  return `بـ ${tiles(t)}`;
}

// ───────────────────────────── a court and a rod as a case ─────────────────────────────

/**
 * The rod of a case, written once and for all: a rod object (`{ q }` or `{ root }`, its number rewritten — « 5.470 » is
 * « 5,47 »), a number or its text (`'5,47'`, `6`), or the word `'wall'` — the wall of the case's own court.
 */
export function rodFor(area, s) {
  if (s === 'wall') return wall(area);
  if (s && typeof s === 'object') return isWall(s) ? wall(s.root) : rodOfNumber(s.q);
  return rodOfNumber(s);
}

/** A case of this world: the court `a` (its area), the rod `s`, and what the world does with them. */
export function caseOf(a, s, extra = {}) {
  const area = String(a).trim();
  const r = rodFor(area, s);
  const { kind } = outcome(r, area);
  return { ...extra, a: area, s: r, kind, held: 'held' in extra ? extra.held : kind === 'ride' };
}

/** The identity of a case: its court and its rod, both rewritten (« 49/64 » and « 0,765625 » are one court). */
export const caseId = (c) => c.id ?? `${write(c.a)}|${rodText(rodFor(c.a, c.s))}`;

/** What the world does with the case: `{ kind, covers, diff }` (logic.js › outcome — exact, as text). */
export const runCase = (c) => outcome(rodFor(c.a, c.s), c.a);

/**
 * The lines of evidence from the world's log — rows `{ a, s, mirror?, …extras }` — one per identity, oldest first; when a
 * case comes again, its NEWEST row is kept, at its newest place. A case he made himself stays his own (`mirror: false`)
 * even when the mirror shows it again (the kit marks what the mirror built with `mirror: true`). `max` keeps the last ones.
 */
export function evidenceOf(log = [], { max } = {}) {
  const out = [];
  for (const row of log) {
    const { a, s, mirror, ...rest } = row;
    const c = caseOf(a, s, rest);
    const id = caseId(c);
    const i = out.findIndex((x) => caseId(x) === id);
    const was = i >= 0 ? out.splice(i, 1)[0] : null;
    out.push({ ...c, mirror: Boolean(mirror) && (was ? was.mirror : true) });
  }
  return max ? out.slice(-max) : out;
}

/**
 * A pool of cases for the predictions and the attacks: every court of `areas` with every rod of `rods` (an array, or a
 * function of the area — `(a) => ['5', '6', 'wall']`), one per identity. `extra(a, s)` gives a case its extras.
 */
export function courtPool({ areas, rods, extra }) {
  const out = [];
  for (const a of areas)
    for (const s of typeof rods === 'function' ? rods(String(a)) : rods) {
      const c = caseOf(a, s, extra?.(String(a), s) ?? {});
      if (!out.some((x) => caseId(x) === caseId(c))) out.push(c);
    }
  return out;
}

// ───────────────────────────── the wording of a case ─────────────────────────────

/** A rod inside an Arabic sentence, isolated left to right (« √30 », « -9 » would else be drawn « 30√ », « 9- »). */
const rodIn = (s) => ltr(rodText(s));
/** A number written in LaTeX as it was given: a fraction keeps its bar, a decimal its comma. */
const texOf = (t) => {
  const [n, d] = String(t).split('/');
  return d == null ? tex(t) : `\\dfrac{${tex(n)}}{${tex(d)}}`;
};
const KIND_COLOUR = { ride: '#34d399', band: '#fbbf24', jam: '#c4b5fd' };
const KIND_SIGN = { ride: '=', band: '<', jam: '>' };

/**
 * What the world did, as ONE fact (never « wrong »): « تركب المنصّة المصعد », « يبقى شريط مساحته … », « تعلق: تزيد بـ … ».
 * A MathText sentence: a difference that is a fraction is written over a real bar (« $\\dfrac{33}{64}$ بلاطة »), never
 * « 33/64 » as text.
 */
export function courtFact(c) {
  const o = runCase(c);
  const diff = inCourtWriting(o.diff, c.a);
  if (o.kind === 'ride') return 'تركب المنصّة المصعد: غطّت الساحة بالضبط.';
  const frac = diff.includes('/') ? `$${texOf(diff)}$ بلاطة` : null;
  if (o.kind === 'band') return `يبقى شريط مساحته ${frac ?? tiles(diff)}.`;
  return `تعلق على الحافّة: تزيد على الساحة ${frac ? `بـ ${frac}` : byTiles(diff)}.`;
}
/** The case in words: « ساحة مساحتها 30 بلاطة، ومقياس طوله 5,47 ». */
const courtCase = (c) => `ساحة مساحتها ${tiles(c.a)}، ومقياس طوله ${rodIn(c.s)}`;
const rides = (yes) => (yes ? 'تركب' : 'لا تركب');

/**
 * The wording of a court as a case — shared by the forges of this world; a lesson's forge overrides what its rule
 * changes (`frame`, `buildLead`, `tryKey`, `use`…). Every sentence about a case is a FACT the world showed.
 * `eq` writes the platform's tiles beside the court's (`5 × 5 = 25 < 30`); a WALL has none (its product would state a
 * rule of the unit) — a forge that must not show the product (its tiles are about it) sets `eq: () => null`.
 */
export const COURT_TEXT = {
  title: 'قاعة المرايا',
  sub: 'اصنع مفتاحك: قاعدة تصمد أمام المرآة.',
  log: 'سجلّ منصّاتك',
  ask: (c) => `${courtCase(c)}. هل تركب المنصّة المصعد؟`,
  yes: 'تركب',
  no: 'لا تركب',
  fact: (c) => courtFact(c),
  eq: (c) => {
    if (isWall(c.s)) return null;
    const o = runCase(c);
    const q = c.s.q.startsWith('-') ? `(${tex(c.s.q)})` : rodTex(c.s);
    return `$${q} \\times ${q} = ${texOf(inCourtWriting(o.covers, c.a))} \\; \\textcolor{${KIND_COLOUR[o.kind]}}{${KIND_SIGN[o.kind]}} \\; ${texOf(c.a)}$`;
  },
  next: 'منصّة أخرى',
  frame: 'تركب المنصّة المصعد عندما:',
  buildLead: 'اختر بطاقتين. المرآة لا تصدّق أحدًا: ستجرّب قاعدتك على منصّاتك.',
  testing: 'المرآة تمرّ على منصّاتك واحدةً واحدة…',
  says: (yes) => `قاعدتك: ${rides(yes)}`,
  refuted: (m) =>
    `قاعدتك تقول إنّ المنصّة على المقياس ${rodIn(m.s)} في ساحة ${tiles(m.a)} ${rides(m.says)} — لكنّك رأيتها ${rides(m.held)}.`,
  agreed: 'قاعدتك توافق كلّ المنصّات التي رأيتَها. الآن المرآة تتحدّاها بساحة جديدة.',
  attack: (c) => `المرآة تتحدّى قاعدتك: ${courtCase(c)}. ماذا تقول قاعدتك؟`,
  fire: 'أنزِل المنصّة',
  survived: 'صمدت قاعدتك: المنصّة فعلت ما قالته.',
  broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${rides(yes)} »، والمنصّة ${yes ? 'لم تركب' : 'ركبت'}.`,
  wordsHint: 'مثال: تركب المنصّة عندما…',
  compare: (cases) => `قارن هاتين المنصّتين في الساحة نفسها (${tiles(cases[0].a)}). ماذا فعلت كلّ واحدة؟`,
  experiment: 'انظر جيّدًا: الساحة نفسها، مقياس ثمّ مقياس أطول منه. ماذا فعلت كلّ منصّة؟',
  useOk: 'مفتاحك يعمل حتّى حيث لا ترى الساحة!',
};
