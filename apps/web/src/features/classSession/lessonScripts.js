/**
 * « حصّة القسم » — what the class does DURING the lesson (owner, 2026-11-18: « rebuild entirely the during-the-lesson
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

/**
 * The cards of the revision: the rules of the earlier الكفاءات the lesson stands on (`family.rules`), core tools first; when
 * the start test was taken, the الكفاءة the class missed most comes FIRST, with its count.
 * `tools` = toolsForLesson(lesson), `families` = launch-kit families, `startItems` = the start test's result per الكفاءة.
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
      lesson: t.lesson?.titleAr ?? f.name,
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
 *               not planks (bouquets, boxes…); a word left out keeps the board's « لوح » / « يثبت » / « ينهار »;
 *   statements  sentences the class judges true or false, each proved by an equality;
 *   name        the rule gets its name: the tablet of the lesson (`tablet` key of the game's strings — one wording for the
 *               student's world and for the board), read aloud by a student or by the teacher;
 *   trace       what goes in the copybook;
 *   court       a square court of « قصر الساحات » (`rootCourts/`, drawn by its own `Court`): the class looks at ONE court and
 *               the board lowers the platform of the card the teacher taps — a rod over a given court (`area`, `rods`),
 *               or a given rod over candidate courts (`rod`, `areas`) — and shows what the world does: it rides, it
 *               leaves a band, it jams. `answer` = the cards that ride (a test computes it); `after` (the proof) comes
 *               once they were lowered, or once every card was when none rides. Its own `words`: `courtWords`.
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
const ASK_WORDS = { card: 'لوح', held: 'يثبت', fell: 'ينهار' };
export const askWords = (step) => ({ ...ASK_WORDS, ...step.words });
/**
 * The words of a `court` step's cards: a card's label (« المقياس », or « الساحة » when the cards are courts) and the three
 * things a platform does — the world's own nouns, never a plank's (« لوح / يثبت / ينهار ») and never « wrong ». A step's
 * `words` overrides any of them; a card may carry its own `label` (« الحاسبة », « ضلع الساحة »).
 */
const COURT_WORDS = {
  card: 'المقياس',
  court: 'الساحة',
  ride: 'تركب',
  band: 'شريط',
  jam: 'تعلق',
  lower: 'أنزل المنصّة',
  rod: 'المقياس',
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

/** The rail of the board: one dot per step, with the chapter it belongs to (« نكتشف », « نستنتج », « نسمّي », « نكتب »). */
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

/** The CLASS's rule applied to one bridge, in the class's voice: « باقي قسمة 18 على 4 هو 2، و 2 لا يساوي 0: قاعدتنا تقول إنّ الجسر ينهار ». */
export function classExplain(rule, a, b) {
  const Q = QUANTITIES.find((x) => x.id === rule.q);
  const C = CONDITIONS.find((x) => x.id === rule.c);
  const v = Q.of(a, b);
  const yes = ruleSays(rule, a, b);
  return `${Q.short(a, b)} هو ${v}، و ${v} ${yes ? C.yes : C.no}: قاعدتنا تقول إنّ الجسر ${yes ? 'يثبت' : 'ينهار'}.`;
}
/** The rule of the class as one sentence: « يثبت الجسر عندما: باقي قسمة طول الهوّة على طول اللوح يساوي 0. » */
export const classRuleText = (rule) =>
  `يثبت الجسر عندما: ${QUANTITIES.find((x) => x.id === rule.q).label} ${CONDITIONS.find((x) => x.id === rule.c).label}.`;
/** The equality the board writes under a bridge: « 42 = 4 × 10 + 2 », or « 42 = 6 × 7 » when nothing is left. */
export const equalityOf = (c) =>
  c.r === 0 ? `${c.a} = ${c.b} \\times ${c.q}` : `${c.a} = ${c.b} \\times ${c.q} + ${c.r}`;
/** A number of cells, agreed: « خانة واحدة », « خانتان », « 8 خانات », « 15 خانة ». */
export const cellsOf = (n) => (n === 1 ? 'خانة واحدة' : n === 2 ? 'خانتان' : n <= 10 ? `${n} خانات` : `${n} خانة`);
/** « بقيت خانة واحدة », « بقيت خانتان », « بقيت 3 خانات », « بقيت 11 خانة ». */
export const leftCells = (r) =>
  r === 1 ? 'بقيت خانة واحدة' : r === 2 ? 'بقيت خانتان' : r <= 10 ? `بقيت ${r} خانات` : `بقيت ${r} خانة`;

/** Why a sentence about a (the bigger) and b is true or false — said with the equality or with the bridge. */
export function proofOf(form, a, b) {
  const q = a / b;
  return {
    b_divides_a: `$${a} = ${b} \\times ${q}$: الباقي 0.`,
    a_divides_b: `لوح طوله ${a} لا يدخل في هوّة من ${cellsOf(b)}.`,
    a_multiple_of_b: `$${a} = ${b} \\times ${q}$: العدد ${a} في جدول ${b}.`,
    b_multiple_of_a: `مضاعفات ${a} هي 0، ${a}، ${2 * a}… والعدد ${b} ليس منها.`,
    a_divisible_by_b: `$${a} \\div ${b} = ${q}$ والباقي 0.`,
  }[form];
}

/**
 * Is a tablet drawn DENSE on the board's naming card? Five list items, or a tablet whose words pass `DENSE_WORDS`
 * characters (its formulas counted as four): the second tablet of the first lesson of « قصر الساحات » (397) left its card at 1366×768 (the walk of
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
 * « من يتذكّر؟ »: a line of a rule cut into parts, the `words` to recall hidden — never inside a formula.
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
