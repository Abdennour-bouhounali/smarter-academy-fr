/**
 * « séance en classe » — what the class does DURING the lesson (owner, 2026-11-18: « rebuild entirely the during-the-lesson
 * classroom mode »). PURE data and logic; the board is LessonBoard.jsx; contract CLASS_SESSION.md §5bis–§5ter.
 *
 * The hour, as a script:
 *   revise   after the start test, the rules the lesson will USE, one per screen (`reviewCards`) — a student reads, or the teacher;
 *   lesson   the lesson itself, as a sequence of STEPS the class goes through together on the board — the lesson's own
 *            script, in its folder (`board/script.js`, named in its `lesson.pack.js`):
 *            a situation → the class EXPERIMENTS (bridges it predicts and builds) → it writes ITS rule and the board tests
 *            it on the class's own bridges → the rule gets its name → the next rule … → what goes in the copybook.
 * The method is the platform's, moved to the board: the class acts first, concludes itself, and only then the name.
 * Nothing here is saved as a student's progress.
 */
import {
  outcome,
  sameCase,
  ruleSays,
  QUANTITIES,
  CONDITIONS,
} from '../../lessons/common/gameworld/divisorIsles/ruleForge';
import {
  outcome as courtOutcome,
  rod as numberRod,
  rodText,
  rodTex,
  tex as numberTex,
} from '../../lessons/common/gameworld/rootCourts/logic';
import { layPlank } from '../../lessons/common/gameworld/divisorIsles/factorLadder';
import { sheetOf, zerosOf } from '../../lessons/common/gameworld/divisorIsles/sheet';
import { formatFr, texFr } from '@smarter-academy/core';
import { counted, PLANKS } from '../../lessons/common/gameworld/kit/authoring/numbers';

/**
 * The cards of the revision: the rules of the earlier savoir-faire the lesson stands on (`family.rules`), core tools first;
 * when the start test was taken, the savoir-faire the class missed most comes FIRST, with its count.
 * `tools` = toolsForLesson(lesson), `families` = launch-kit families, `startItems` = the start test's result per savoir-faire.
 */
export function reviewCards(tools, families, startItems = null) {
  const rate = (item) => {
    const s = (startItems ?? []).find((x) => x.item === item);
    return s && s.total ? s.right / s.total : null;
  };
  const order = tools
    .filter((t) => families[t.id]?.rules?.length)
    .map((t, i) => ({ t, i, r: rate(t.id) }))
    .sort(
      (a, b) =>
        (a.r ?? 2) - (b.r ?? 2) || (a.t.weight === 'support' ? 1 : 0) - (b.t.weight === 'support' ? 1 : 0) || a.i - b.i,
    );
  return order.flatMap(({ t }) => {
    const f = families[t.id];
    const s = (startItems ?? []).find((x) => x.item === t.id) ?? null;
    return f.rules.map((rule) => ({
      ...rule,
      item: t.id,
      family: f.name,
      icon: f.icon,
      weight: t.weight ?? null,
      lesson: t.lesson?.title ?? f.name,
      grade: t.grade,
      score: s && s.total ? { right: s.right, total: s.total } : null,
    }));
  });
}

/** The class's bridges as evidence: one line per different bridge, in the order the class built them — the last eight, what the board shows without scrolling. */
export const LOG_MAX = 8;
export function classLog(log, c) {
  return [...log.filter((x) => !sameCase(x, c)), outcome(c.a, c.b)].slice(-LOG_MAX);
}
/** Enough to conclude: at least four bridges, one that held and one that crumbled. */
export const readyToConclude = (log) => log.length >= 4 && log.some((x) => x.held) && log.some((x) => !x.held);
/** What is still missing before the class may conclude — said in the board's words (null when ready). */
export function missingEvidence(log) {
  if (!log.some((x) => x.held)) return 'held';
  if (!log.some((x) => !x.held)) return 'fell';
  return log.length < 4 ? 'more' : null;
}

/**
 * The script of a lesson: its STEPS. Kinds:
 *   situation   the problem that opens the lesson, with a bridge the class looks at;
 *   bridges     the class experiments: it chooses a gap and a plank, predicts, the board builds — `suggest` proposes bridges
 *               that lead somewhere, the class is free to try others;
 *   forge       the class writes its rule with two tiles; the board runs it on the class's bridges, then attacks it;
 *   ask         one question with choices, PROVED by bridges the board builds (`single` or several right answers);
 *               optional `words: { card, held, fell }` — the label of a card and its two verdicts, when the choices are
 *               not planks (bouquets, boxes…); a word left out keeps the board's « Planche » / « Tient » / « S’effondre »;
 *               optional `figure` — a GEOMETRY FIGURE, the same data as a bank sheet's `statement.figure` (plane:
 *               points, segments, parallels, lengths), drawn beside the question by the practice space's own
 *               StatementFigure (`boardFigure.js` says how wide); such a station draws NO bridge under its cards — a card
 *               agrees when it is in `answer` (`askProof`, `askHeld`); optional `figureAfter` — the figure once the class
 *               has checked (the proof drawn), `figure` being what it shows before, never the answer (2026-11-26);
 *   statements  sentences the class judges true or false, each proved by an equality;
 *   name        the rule gets its name: the tablet of the lesson (`tablet` key of the game's strings — one wording for the
 *               student's world and for the board), read aloud by a student or by the teacher;
 *   trace       what goes in the copybook;
 *   court       a square court of the `rootCourts` world (`rootCourts/`, drawn by its own `Court`): the class looks at ONE court and
 *               the board lowers the platform of the card the teacher taps — a rod over a given court (`area`, `rods`),
 *               or a given rod over candidate courts (`rod`, `areas`) — and shows what the world does: it rides, it
 *               leaves a band, it jams. `answer` = the cards that ride (a test computes it); `after` (the proof) comes
 *               once they were lowered, or once every card was when none rides. Its own `words`: `courtWords`.
 *   ladder      a FACTOR LADDER of the `divisorIsles` world (`divisorIsles/factorLadder.js`, the pure logic of the student's
 *               ladder): ONE gap of `n` cells; the class proposes the next plank, the board lays it — it holds (the gap
 *               becomes the number of planks laid, a rung « 168 = 2 × 84 » is written) or it falls (the gap stays, the
 *               division and what is left are written) — until the gap is 1 case. `rack` = the planks on offer, `whole`
 *               adds a plank as long as the whole gap, `group` counts the equal planks of the finished row, `sheet` replaces
 *               the rack by a SHEET of remainders (`divisorIsles/sheet.js`: column A the primes up to the stop, column B
 *               the remainders) — the class reads a 0 and taps its line, or says that no remainder is 0. The proof
 *               (`after`) comes once a ladder reached 1 case; « another ladder » keeps the finished ones beside it.
 */

/** The truth of a sentence about a (the bigger) and b: the same forms as the default tests. */
export const FORMS = {
  b_divides_a: (a, b) => a % b === 0,
  a_divides_b: (a, b) => b % a === 0,
  a_multiple_of_b: (a, b) => a % b === 0,
  b_multiple_of_a: (a, b) => b % a === 0,
  a_divisible_by_b: (a, b) => a % b === 0,
};
/** A choice of an `ask` step: does that plank fill the gap? And is the class's selection exactly the right one? */
export const fills = (step, option) => step.a % option === 0;
export const askRight = (step, picked) =>
  picked.length === step.answer.length && step.answer.every((v) => picked.includes(v));
/** The words of an `ask` step's cards: the label of a card and its two verdicts — the step's own `words`, or the planks'. */
const ASK_WORDS = { card: 'Planche', held: 'Tient', fell: 'S’effondre' };
export const askWords = (step) => ({ ...ASK_WORDS, ...step.words });
/**
 * What the board draws under an `ask` card once the class checks: the WORLD's drawing — `'bridge'` (the default: the
 * plank bridge of the divisor isles (`divisorIsles`) and its equality « a = b × q + r », every lesson before the geometry units) or
 * `'none'` (the verdict word only). The lesson's world content says it (`world/` › `boardAsk`, handed to the board by
 * `ClassSessionPage`); a station that carries its own `figure` draws nothing under its cards, whatever the world.
 */
const ASK_PROOFS = Object.freeze(['bridge', 'none']);
export const askProof = (step, world) => (step.figure ? 'none' : ASK_PROOFS.includes(world) ? world : 'bridge');
/** Does a card agree? Over a bridge: its plank fills the gap `a` (`ruleForge.js › outcome`); otherwise: it is in `answer`. */
export const askHeld = (step, option, proof = askProof(step)) =>
  proof === 'bridge' ? outcome(step.a, option).held : step.answer.includes(option);
/**
 * The words of a `court` step's cards: a card's label (« Toise », or « Salle » when the cards are courts — the words of `rootCourts/strings.js`) and the three
 * things a platform does — the world's own nouns, never a plank's (« Planche / Tient / S’effondre ») and never « wrong ».
 * A step's `words` overrides any of them; a card may carry its own `label` (« La calculatrice », « Côté de la salle »).
 */
const COURT_WORDS = {
  card: 'Toise',
  court: 'Salle',
  ride: 'Elle monte',
  band: 'Une bande',
  jam: 'Elle coince',
  lower: 'Abaisser la plateforme',
  rod: 'Toise',
};
export const courtWords = (step) => ({ ...COURT_WORDS, ...step.words });
/** A rod as a script writes it: « 4,2 », { q: '7,28', label }, or the wall of a court { root: '53', label }. */
const rodOf = (x) => (typeof x === 'object' && x.root != null ? { root: String(x.root) } : numberRod(x?.q ?? x));
/**
 * The cards of a `court` step, each with what the world does (`rootCourts/logic.js › outcome`, exact): its `key` (the rod
 * as it is written — « 18 », « 7,28 », « √53 » — or the court's area), the court and the rod lowered, its label and its
 * LaTeX.
 */
export function courtCards(step) {
  const w = courtWords(step);
  if (step.areas) {
    const r = rodOf(step.rod);
    return step.areas.map((a) => {
      const area = String(a);
      return { key: area, area, rod: r, label: w.court, tex: numberTex(area), out: courtOutcome(r, area) };
    });
  }
  const area = String(step.area);
  return step.rods.map((x) => {
    const r = rodOf(x);
    const label = (typeof x === 'object' && x.label) || w.card;
    return { key: rodText(r), area, rod: r, label, tex: rodTex(r), out: courtOutcome(r, area) };
  });
}
/** The proof (`after`) is shown once the riding cards were lowered — or every card, when none rides. */
export const courtShown = (step, tried) =>
  step.answer.length
    ? step.answer.every((k) => tried.includes(k))
    : courtCards(step).every((c) => tried.includes(c.key));
/** The rod of a step whose cards are courts, in LaTeX (« \\sqrt{61} »). */
export const courtRodTex = (step) => rodTex(rodOf(step.rod));

/** The rail of the board: one dot per step, with the chapter it belongs to (« On découvre », « On conclut », « On nomme », « On écrit »). */
export const railOf = (script) =>
  script.steps.map((s, i) => ({
    i,
    id: s.id,
    chapter: s.chapter,
    kind: s.kind,
    first: i === 0 || script.steps[i - 1].chapter !== s.chapter,
  }));

/**
 * The rail as the class understands it: one group per KEY of the lesson — what the class does, then the name it earns —
 * and ONE last group for the copybook, however many pages it has (2026-11-19: each page made its own group, and lesson 6's
 * five keys and three pages overflowed the rail at 1024 × 768, under the board's tools). `steps` are indices in the script.
 */
export function groupsOf(script) {
  const out = [];
  let cur = [];
  script.steps.forEach((s, i) => {
    cur.push(i);
    const next = script.steps[i + 1];
    if (s.kind === 'name' || (s.kind === 'trace' && next?.kind !== 'trace') || i === script.steps.length - 1) {
      out.push({ steps: cur, kind: s.kind, tablet: s.tablet ?? null });
      cur = [];
    }
  });
  return out;
}

const upFirst = (t) => t.charAt(0).toUpperCase() + t.slice(1);
/**
 * The CLASS's rule applied to one bridge, in the class's voice: « Le reste de la division de 18 par 4 vaut 2, et 2 n’est
 * pas égal à 0 : notre règle dit que le pont s’effondre. » The tiles' words are the world's (`ruleForge.js`).
 */
export function classExplain(rule, a, b) {
  const Q = QUANTITIES.find((x) => x.id === rule.q);
  const C = CONDITIONS.find((x) => x.id === rule.c);
  const v = Q.of(a, b);
  const yes = ruleSays(rule, a, b);
  return `${upFirst(Q.short(a, b))} vaut ${v}, et ${v} ${yes ? C.yes : C.no} : notre règle dit que le pont ${yes ? 'tient' : 's’effondre'}.`;
}
/** The rule of the class as one sentence: « Le pont tient quand : le reste de la division … est égal à 0. » */
export const classRuleText = (rule) =>
  `Le pont tient quand : ${QUANTITIES.find((x) => x.id === rule.q).label} ${CONDITIONS.find((x) => x.id === rule.c).label}.`;
/** The equality the board writes under a bridge: « 42 = 4 × 10 + 2 », or « 42 = 6 × 7 » when nothing is left. */
export const equalityOf = (c) =>
  c.r === 0 ? `${c.a} = ${c.b} \\times ${c.q}` : `${c.a} = ${c.b} \\times ${c.q} + ${c.r}`;
/** A number of cells, agreed, the count bound to its noun: « 1 case », « 8 cases ». */
export const cellsOf = (n) => `${n} ${n <= 1 ? 'case' : 'cases'}`;
/** « il reste 1 case », « il reste 3 cases ». */
export const leftCells = (r) => `il reste ${cellsOf(r)}`;

/** Why a sentence about a (the bigger) and b is true or false — said with the equality or with the bridge. */
export function proofOf(form, a, b) {
  const q = a / b;
  return {
    b_divides_a: `$${a} = ${b} \\times ${q}$ : le reste est 0.`,
    a_divides_b: `Une planche de ${a} n’entre pas dans un fossé de ${cellsOf(b)}.`,
    a_multiple_of_b: `$${a} = ${b} \\times ${q}$ : ${a} est dans la table de ${b}.`,
    b_multiple_of_a: `Les multiples de ${a} sont 0 ; ${a} ; ${2 * a} ; … et ${b} n’en fait pas partie.`,
    a_divisible_by_b: `$${a} \\div ${b} = ${q}$ et le reste est 0.`,
  }[form];
}

/**
 * Is a tablet drawn DENSE on the board's naming card? Five list items, or a tablet whose words pass `DENSE_WORDS`
 * characters (its formulas counted as four): the second tablet of the first lesson of the `rootCourts` world (397) left its card at 1366×768 (the walk of
 * 2026-11-21); the longest tablet of every other lesson then was 279. A fraction of two storeys (`\\dfrac`, `\\frac`) in
 * its words is taller than a line: it counts `DENSE_FRAC` more — the first tablet of lesson 2 (304 characters, three
 * fractions in its words) left its card on the board's walk of 2026-11-21.
 */
export const DENSE_WORDS = 320;
const DENSE_FRAC = 16;
export const denseTablet = (t) => {
  if ((t.list?.length ?? 0) >= 5) return true;
  const words = [...t.lines, ...(t.list ?? []), ...(t.notes ?? [])].join('');
  const fracs = (words.match(/\\d?frac\{/g) ?? []).length;
  return words.replace(/\$[^$]*\$/g, '····').length + fracs * DENSE_FRAC > DENSE_WORDS;
};

/**
 * « Qui s’en souvient ? »: a line of a rule cut into parts, the `words` to recall hidden — never inside a formula.
 * Parts: { t: 'text' | 'math' | 'blank', v }. The class says the hidden word; a tap shows it.
 */
export function blanks(text, words = []) {
  const out = [];
  const list = [...words].sort((x, y) => y.length - x.length);
  text.split(/(\$[^$]+\$)/).forEach((seg) => {
    if (!seg) return;
    if (seg.startsWith('$')) {
      out.push({ t: 'math', v: seg });
      return;
    }
    let rest = seg;
    while (rest) {
      let at = -1;
      let w = null;
      for (const x of list) {
        const i = rest.indexOf(x);
        if (i >= 0 && (at < 0 || i < at)) {
          at = i;
          w = x;
        }
      }
      if (at < 0) {
        out.push({ t: 'text', v: rest });
        break;
      }
      if (at > 0) out.push({ t: 'text', v: rest.slice(0, at) });
      out.push({ t: 'blank', v: w });
      rest = rest.slice(at + w.length);
    }
  });
  return out;
}

// ───────────────────────── the station `ladder`: a factor ladder on the board ─────────────────────────

/** A ladder before its first plank: the whole gap of n cells. */
export const ladderStart = (n) => ({ n, gap: n, rungs: [], fell: [], last: null, zeros: null });
/** Has the ladder reached a gap of 1 case? */
export const ladderDone = (st) => st.gap === 1;
/** The planks that held, in the order the class laid them. */
export const ladderRow = (st) => st.rungs.map((r) => r.plank);

/**
 * The class lays the plank d on the gap now on the board (`factorLadder.js › layPlank`): it holds → a rung, the gap
 * becomes the number of planks laid; it falls → the gap stays, the plank is kept with its quotient and remainder (one
 * line per plank on that gap). A plank longer than the gap, a gap already at 1, or anything but a plank of 2 or more:
 * nothing changes.
 */
export function ladderLay(st, d) {
  if (st.gap <= 1 || !Number.isInteger(d) || d < 2 || d > st.gap) return st;
  const a = layPlank(st.gap, d);
  if (a.held) {
    const rung = { plank: d, before: a.before, after: a.after };
    return { ...st, gap: a.after, rungs: [...st.rungs, rung], fell: [], last: { ...rung, held: true }, zeros: null };
  }
  const f = { plank: d, q: Math.floor(st.gap / d), r: st.gap % d };
  return {
    ...st,
    fell: [...st.fell.filter((x) => x.plank !== d), f],
    last: { ...f, before: st.gap, held: false },
    zeros: null,
  };
}
/** The last plank that held is taken back: the gap is what it was before it. */
export function ladderUndo(st) {
  if (!st.rungs.length) return st;
  const top = st.rungs.at(-1);
  return { ...st, gap: top.before, rungs: st.rungs.slice(0, -1), fell: [], last: null, zeros: null };
}

/** The planks a `ladder` step offers on the gap now: its rack (increasing, once each), and — `whole` — the whole gap. */
export function ladderRack(step, st) {
  const rack = [...new Set(step.rack ?? [])].sort((x, y) => x - y).map((d) => ({ d, whole: false }));
  if (step.whole && st.gap > 1 && !rack.some((x) => x.d === st.gap)) rack.push({ d: st.gap, whole: true });
  return rack;
}
/** The sheet of a `ladder` step in sheet mode, for the gap now (`sheet.js › sheetOf`, the step's `sheet.stop`): [{ p, r }]. */
export const ladderSheet = (step, st) => (st.gap > 1 ? sheetOf(st.gap, step.sheet?.stop ?? 'square') : []);
/**
 * The class says that no remainder of the sheet is 0. True → the whole gap is laid as one plank (its only plank); false
 * → nothing is laid and the lines whose remainder IS 0 are marked (`zeros`) — the fact, never « faux ».
 */
export function ladderNoZero(step, st) {
  if (st.gap <= 1) return st;
  const zeros = zerosOf(ladderSheet(step, st));
  return zeros.length ? { ...st, zeros } : ladderLay(st, st.gap);
}

/** A product written in LaTeX: « 2 \\times 2 \\times 3 » (a thousand written « 2\\,387 »). */
export const productTex = (xs) => xs.map(texFr).join(' \\times ');
/** The rung of a plank that held: « 168 = 2 \\times 84 ». */
export const rungTex = (r) => `${texFr(r.before)} = ${r.plank} \\times ${texFr(r.after)}`;
/** The division of a plank that fell on a gap: « 21 = 2 \\times 10 + 1 ». */
export const fellTex = (gap, f) => `${texFr(gap)} = ${texFr(f.plank)} \\times ${texFr(f.q)} + ${texFr(f.r)}`;
/**
 * What a FINISHED ladder still hides: each plank of its row that is itself laid in shorter planks, once, the shortest
 * first — « 6 = 2 × 3 », « 4 = 2 × 2 » for the ladder 7, 6, 4 of 168; [] when no plank of the row breaks. The board
 * writes this under a finished ladder instead of its last rung (« 4 = 4 × 1 » told the teacher nothing, 2026-11-23).
 * → [{ p, tex }]
 */
export function ladderBreaks(row) {
  const out = [];
  for (const p of [...new Set(row)].sort((x, y) => x - y)) {
    const parts = [];
    let m = p;
    for (let d = 2; d * d <= m; d += 1)
      while (m % d === 0) {
        parts.push(d);
        m /= d;
      }
    if (m > 1 && m !== p) parts.push(m);
    if (parts.length > 1) out.push({ p, tex: `${texFr(p)} = ${parts.map((x) => texFr(x)).join(' \\times ')}` });
  }
  return out;
}
/** The finished ladder as one equality: « 168 = 2 \\times 2 \\times 2 \\times 3 \\times 7 ». */
export const ladderTex = (st) => `${texFr(st.n)} = ${productTex(ladderRow(st))}`;
/** The equal planks of a row, counted, the shortest first: [{ p: 2, k: 4 }, { p: 3, k: 2 }, { p: 5, k: 1 }]. */
export function rowGroups(row) {
  const out = [];
  for (const p of [...row].sort((x, y) => x - y)) {
    const g = out.at(-1);
    if (g && g.p === p) g.k += 1;
    else out.push({ p, k: 1 });
  }
  return out;
}
/** « 4 planches de 2 » (the count bound to its noun; 1 takes the singular). */
export const groupText = (g) => `${counted(g.k, PLANKS)} de ${formatFr(g.p)}`;
/** A number of cells for a ladder, a thousand grouped: « 2 387 cases », « 1 case ». */
export const ladderCells = (n) => `${formatFr(n)}\u00a0${n < 2 ? 'case' : 'cases'}`;
