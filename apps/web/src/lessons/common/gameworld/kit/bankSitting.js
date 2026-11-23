/**
 * The « brevet blanc » served FROM THE LESSON'S EXERCISE BANK, AS IT IS (owner, 2026-11-18: « you will use the exercises
 * bank as it is »). It names no lesson: a lesson gives its code, and its sheets are the ones its practice space serves —
 * `content/practice/<grade>/<lesson>/level-N/*.json`, read through the practice space's own loader
 * (`features/practice/practiceContent.js`), never copied, never rewritten, never generated.
 *
 * A level of the sitting is a level of the bank: level N serves `sheets` exam sheets drawn from the bank's level N. What a
 * sheet says is the bank's: its statement (content, formulas, table), its steps in order, its answer types, its points
 * (`metadata.exam.points`), its time (`metadata.estimatedMinutes`), its model solution and its hints. Two things are done
 * AT DISPLAY, never in the bank: nothing of `metadata.source` is shown, and a « PGCD(a ; b) » written in the words is drawn
 * as the formula it is (`namesAsMath`). Money is the bank's own, in euros, written as the bank writes it (the Algerian
 * rewrite of « DA » was removed with the dinar, 2026-11-22).
 *
 *   mark      the evaluator of the practice space (`@smarter-academy/core/practice › evaluateAnswer`): correct or
 *             equivalent → the points of the step; partially correct → half; anything else → 0. The SERVER judges again.
 *   points    a sheet's points are shared between its typed steps in quarter points; a « Montrer que » step (`selfCheck`) is
 *             written on the paper only: no box, no points, its model copy comes back with the copy.
 *   evidence  `sheetOf` — what goes to the practice engine (POST /practice/sessions…): the exercise and question ids and
 *             the raw answers; the server reads the question in the content and re-computes the verdict (bankEvidence.js).
 *
 * PURE but for `loadFromPractice`, the default loader (a lazy import of the practice space's loader).
 */
import * as practice from '@smarter-academy/core/practice/index.js';
import { shuffle } from './random';
import { BANK } from './text';

const { evaluateAnswer, isSuccessOutcome, OUTCOMES } = practice;

/**
 * The five levels of the « Espace brevet » — the bank's five levels, with the names the practice space gives them
 * (`text.js › BANK.levels`). How many sheets a level serves is the Algerian ladder's (1, 2, 2, 2, 1): the French bank's
 * contract (plan §5, 2G) settles it against the brevet's two parts.
 */
export const BANK_LEVELS = [
  { n: 1, title: BANK.levels[0], sheets: 1 },
  { n: 2, title: BANK.levels[1], sheets: 2 },
  { n: 3, title: BANK.levels[2], sheets: 2 },
  { n: 4, title: BANK.levels[3], sheets: 2 },
  { n: 5, title: BANK.levels[4], sheets: 1 },
];

/** A result of the bank that is WORDS (« oui », « Le pont tient »), not a formula: a word of three letters or more, not a LaTeX command. */
const WORDS = /(?<![\\A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ]{3,}/;
/** A sheet the bank heads as the problem of the subject (the brevet's part 2): « Problème ». */
const PROBLEM = /probl[eè]me/i;
const EX = 'ex:';
/** The savoir-faire a step proves: its primary learning point (else its first). */
const pointOf = (q) => q.learningPoints?.find((p) => p.role === 'primary')?.code ?? q.learningPoints?.[0]?.code ?? null;

/**
 * The answer types a sitting draws (ChoiceInput, TemplateInput, IntegerSetInput; a « Montrer que » on paper). A sheet with another
 * (`multiChoice`, `affine`, `interval`, `point`) is not drawn in a sitting — it stays in « /espace/pratique », whose player
 * draws every type. None in the six v2 banks of 2026-11-18 (`docs/reports/BANK_AS_IS_2026-11-18.md`).
 * `factorization` (a decomposition in prime factors, 3e — 2026-11-23): its value is the LaTeX the practice space's
 * `FactorizationInput` writes, marked by the same evaluator (`packages/core/practice/factorization.js`).
 */
const SITTING_TYPES = ['choice', 'rational', 'integerSet', 'selfCheck', 'factorization'];

/** Can this sheet be sat? An exam sheet of the bank whose every step has a type the sitting draws. */
const sittable = (ex) =>
  Boolean(ex?.metadata?.exam) &&
  ex.questions?.length > 0 &&
  ex.questions.every((q) => SITTING_TYPES.includes(q.answerType));

/** « 02,5 » → 2.5 — the points as the exam paper writes them. */
export const examPoints = (s) => Number(String(s ?? '').replace(',', '.')) || 0;

/** `total` points shared between `n` steps in quarter points; the first steps take the quarters left over. */
export function shareQuarters(total, n) {
  if (n <= 0) return [];
  const quarters = Math.round(total * 4);
  const base = Math.floor(quarters / n);
  return Array.from({ length: n }, (_, i) => (base + (i < quarters - base * n ? 1 : 0)) / 4);
}

/**
 * « PGCD(a ; b) » (or « PPCM(a ; b) ») written in the WORDS of a bank line (« donc PGCD(252 ; 180) = 36 ») is drawn AT DISPLAY as the
 * formula it is, with the « = n » that follows it, so it is set as mathematics, never as a word. Inside a formula the name
 * gets upright letters (`\mathrm`), not KaTeX's italic P·G·C·D. Display only: the bank's file is not changed, the mark
 * reads the bank's own step.
 */
const NAMED_IN_WORDS = /(?<![A-Za-z\\])(PGCD|PPCM)\s*\(([^()$]*)\)((?:\s*=\s*\d+)?)/g;
const NAMED_IN_MATH = /(?<![A-Za-z\\{])(PGCD|PPCM)(?![A-Za-z])/g;
export function namesAsMath(text) {
  if (typeof text !== 'string' || !/PGCD|PPCM/.test(text)) return text;
  return text
    .split(/(\$[^$]*\$)/)
    .map((part, i) =>
      i % 2 === 1
        ? part.replace(NAMED_IN_MATH, '\\mathrm{$1}')
        : part.replace(
            NAMED_IN_WORDS,
            (_, name, args, eq) => `$\\mathrm{${name}}(${args.trim()})${eq.replace(/\s+/g, ' ')}$`,
          ),
    )
    .join('');
}
/** A string of the bank as the sitting SHOWS it: its PGCD drawn. */
const shown = (text) => namesAsMath(text);

/** A formula of the bank's `result` (LaTeX without dollars), as a line of MathText: with dollars unless it is words. */
function resultLine(result) {
  if (!result) return null;
  if (WORDS.test(result) && !/\\text\{/.test(result)) return shown(result);
  return shown(`$${result}$`);
}

/**
 * The step of the bank as the practice WIDGETS draw it (ChoiceInput, TemplateInput, IntegerSetInput): its words through
 * `shown`. Display only — the mark and the copy sent to the server read the bank's own step (`q.bank`).
 */
const shownOf = (q) => ({
  ...q,
  statement: shown(q.statement),
  lead: shown(q.lead),
  answerFormat: q.answerFormat,
  ...(q.choices ? { choices: q.choices.map((c) => ({ ...c, content: shown(c.content) })) } : {}),
});

/** One exam sheet of the bank → the exercise of a subject (`i` = its place on the sheet). */
function fromBank(ex, i, keyOf = {}) {
  const typed = ex.questions.filter((q) => q.answerType !== 'selfCheck');
  // a sheet whose every step is written on paper carries no points here (nothing on it can be marked by the machine)
  const points = typed.length ? examPoints(ex.metadata?.exam?.points) : 0;
  const share = shareQuarters(points, typed.length);
  const id = `e${i + 1}`;
  const heading = ex.metadata?.exam?.heading ?? '';
  let t = 0;
  return {
    id,
    bankId: ex.id,
    title: PROBLEM.test(heading) ? BANK.problem : BANK.exercise(i + 1),
    topic: namesAsMath(ex.metadata?.title ?? ''),
    points,
    minutes: ex.metadata?.estimatedMinutes ?? 5,
    statement: shown(ex.statement?.content ?? ''),
    formulas: (ex.statement?.formulas ?? []).map(shown),
    table: ex.statement?.table
      ? {
          ...ex.statement.table,
          head: ex.statement.table.head.map(shown),
          rows: ex.statement.table.rows.map((r) => r.map(shown)),
        }
      : null,
    questions: ex.questions.map((q, k) => {
      const paper = q.answerType === 'selfCheck';
      const learningPoint = pointOf(q);
      return {
        id: `${id}q${k + 1}`,
        qid: q.id,
        step: q.step,
        sub: q.sub ?? null,
        lead: shown(q.lead ?? null),
        text: shown(q.statement ?? ''),
        answerType: q.answerType,
        paper,
        points: paper ? 0 : share[t++],
        learningPoint,
        key: keyOf[learningPoint] ?? null,
        counted: q.counted !== false,
        bank: q,
        shown: shownOf(q),
      };
    }),
  };
}

/** Is the answer complete enough to be read? A step written on paper only has no answer here. */
export function answeredBank(q, v) {
  if (q.paper || v == null) return false;
  if (q.answerType === 'choice') return typeof v.choiceId === 'string' && v.choiceId !== '';
  return String(v.value ?? '').trim() !== '';
}

/** The verdict of the practice space's evaluator, or ABANDONED for an empty answer. Never throws. */
function outcomeOf(q, v) {
  if (!answeredBank(q, v)) return OUTCOMES.ABANDONED;
  try {
    return evaluateAnswer(v, q.bank).outcome;
  } catch {
    return OUTCOMES.SYNTAX_ERROR;
  }
}

/** The points of an answer: the step's points when right, half (in quarters) when partly right, else 0. */
function markBank(q, v) {
  const o = outcomeOf(q, v);
  if (isSuccessOutcome(o)) return q.points;
  if (o === OUTCOMES.PARTIALLY_CORRECT) return Math.floor(q.points * 2) / 4;
  return 0;
}

/** The model copy: the bank's solution lines, then its boxed result. */
const modelOf = (q) =>
  [...(q.bank.solution?.lines ?? []).map(shown), resultLine(q.bank.solution?.result)].filter(Boolean);

/** « Guide-moi »: the bank's hints, in their order — they never give the answer. */
const guideOf = (q) => (q.bank.hints ?? []).map((h) => shown(h.content));

/** What the corrector looks for ON THE PAPER, by the shape of the step. */
function schemeOf(q) {
  switch (q.answerType) {
    case 'selfCheck':
      return BANK.scheme.selfCheck;
    case 'choice':
      return BANK.scheme.choice;
    case 'integerSet':
      return BANK.scheme.integerSet;
    default:
      return BANK.scheme.value;
  }
}

/** What the student wrote, as a line of text (MathText): the choice he picked, or the value he typed. */
function writtenOf(q, v) {
  if (!answeredBank(q, v)) return null;
  if (q.answerType === 'choice') return shown(q.bank.choices?.find((c) => c.id === v.choiceId)?.content ?? '');
  // a decomposition is the LaTeX FactorizationInput wrote (« 2^{3}\\times3^{2} »): a formula, never raw LaTeX on the copy
  if (q.answerType === 'factorization') return `$${String(v.value).replaceAll('$', '')}$`;
  return String(v.value);
}

const range = (values, fmt) => {
  if (!values.length) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  return lo === hi ? fmt(lo) : `${fmt(lo)}–${fmt(hi)}`;
};
const comma = (n) => String(n).replace('.', ',');

/** The default loader: the practice space's own (`practiceContent.js`), imported lazily — it never enters a world's chunk. */
async function loadFromPractice(lesson, level) {
  const { exerciseIdsFor, loadExercise } = await import('../../../../features/practice/practiceContent');
  const ids = exerciseIdsFor(lesson, level);
  return (await Promise.all(ids.map((id) => loadExercise(lesson, level, id)))).filter(Boolean);
}

/** The key under which a walk names the sheet it wants (DEV only — `devSheet`). */
export const DEV_SHEET_KEY = 'di.dev.sheet';

/**
 * DEV ONLY — the sheet a walk asked for: `localStorage['di.dev.sheet']` holds the id of a bank exercise. In a production
 * build `import.meta.env.DEV` is false: the hook reads nothing and the bundler drops it.
 */
function devSheet() {
  if (!import.meta.env.DEV) return null;
  try {
    return globalThis.localStorage?.getItem(DEV_SHEET_KEY) ?? null;
  } catch {
    return null;
  }
}

/**
 * The sittings of a lesson, served from its bank.
 *   lesson  its code — the folder of its bank
 *   levels  the ladder (default BANK_LEVELS): { n, title, sheets }
 *   load    (lesson, level) => Promise<exam sheets> — default: the practice space's loader
 */
export function createBankSittings({ lesson, levels = BANK_LEVELS, load = loadFromPractice }) {
  const bank = {};
  let pending = null;

  /** Loads the five levels once (the ladder shows their minutes and points, the sitting draws its sheets). */
  const prepare = () => {
    pending ??= Promise.all(
      levels.map(async (L) => {
        bank[L.n] = [...(await load(lesson, L.n))].filter((ex) => sittable(ex)).sort((a, b) => (a.id < b.id ? -1 : 1));
      }),
    ).catch((e) => {
      pending = null;
      throw e;
    });
    return pending;
  };
  const ready = () => levels.every((L) => Array.isArray(bank[L.n]));
  const levelOf = (n) => levels[Math.max(1, Math.min(levels.length, n)) - 1];

  /** The points and the minutes a level's sheet may carry — known once the bank is loaded, else null. */
  const sums = (L, get) => {
    const pool = bank[L.n];
    if (!pool?.length) return [];
    if (L.sheets === 1) return pool.map(get);
    const v = pool.map(get).sort((a, b) => a - b);
    const k = Math.min(L.sheets, v.length);
    const sum = (xs) => xs.reduce((s, x) => s + x, 0);
    return [sum(v.slice(0, k)), sum(v.slice(-k))];
  };
  const levelPoints = (L) =>
    range(
      sums(L, (ex) => examPoints(ex.metadata.exam.points)),
      comma,
    );
  const levelMinutes = (L) =>
    range(
      sums(L, (ex) => ex.metadata.estimatedMinutes ?? 5),
      String,
    );

  /** A sheet that can be MARKED: at least one step with a box (a sheet written on paper only carries no points here). */
  const markable = (ex) => ex.questions.some((q) => q.answerType !== 'selfCheck');
  /** Can this level be sat? Its bank is loaded and holds a sheet with points. A level that cannot is shown unavailable. */
  const available = (n) => (bank[levelOf(n).n] ?? []).some(markable);
  /** The ids of the sheets a level can serve, in order (a walk loops over them with the DEV hook). */
  const sheetIds = (n) => (bank[levelOf(n).n] ?? []).map((ex) => ex.id);

  /**
   * The subject of a sitting at `level`: `sheets` sheets drawn from the bank's level — or NULL when the level has nothing
   * to mark (an empty pool, a lesson missing from the exercise index, sheets on paper only): an empty sitting never
   * passes. ADAPTED to the student:
   *   weak  what the last miss of this level left — rule keys, and `ex:<id>` for the sheets that lost points: the sheets
   *         that ask those keys come FIRST, the sheets already missed are left out while the level has others.
   * `keyOf` maps a savoir-faire code to the rule key of the lesson (its notebook, its « Guide-moi », its cards).
   * DEV only: `localStorage['di.dev.sheet']` naming a sheet of this level puts that sheet first (a walk chooses its sheet).
   */
  function makeSubject(rand, level = levels.length - 1, weak = [], keyOf = {}) {
    const L = levelOf(level);
    if (!available(L.n)) return null;
    const avoid = new Set(weak.filter((w) => w.startsWith(EX)).map((w) => w.slice(EX.length)));
    const want = new Set(weak.filter((w) => !w.startsWith(EX)));
    const asks = (ex) => ex.questions.some((q) => want.has(keyOf[pointOf(q)]));
    const pool = shuffle(rand, [...bank[L.n]]);
    const chosen = devSheet();
    const score = (ex) => (ex.id === chosen ? 100 : 0) + (avoid.has(ex.id) ? -2 : 0) + (asks(ex) ? 1 : 0);
    const picked = pool.sort((a, b) => score(b) - score(a)).slice(0, L.sheets);
    const exercises = picked.map((ex, i) => ({ ...fromBank(ex, i, keyOf), focus: asks(ex) }));
    const total = exercises.reduce((t, e) => t + e.points, 0);
    if (total <= 0) return null;
    return {
      level: L.n,
      minutes: exercises.reduce((t, e) => t + e.minutes, 0),
      total,
      title: BANK.title(L.n),
      lesson: L.title,
      exercises,
    };
  }

  const questions = (subject) => subject.exercises.flatMap((e) => e.questions);
  const totalMark = (subject, answers) => questions(subject).reduce((t, q) => t + markBank(q, answers[q.id]), 0);

  /** What the next sheet of this level puts first: the keys of the steps that lost points, then the sheets that did. */
  function weakKinds(subject, answers) {
    const lost = questions(subject).filter((q) => !q.paper && markBank(q, answers[q.id]) < q.points);
    const keys = [...new Set(lost.map((q) => q.key).filter(Boolean))];
    const sheets = subject.exercises.filter((e) => e.questions.some((q) => lost.includes(q))).map((e) => EX + e.bankId);
    return [...keys, ...sheets];
  }

  /**
   * What is sent to the practice engine for a handed-in copy: every typed step he ANSWERED, as he answered it, once — a
   * first and only try, no hint opened (there is none during a sitting). `id()` makes the uuids (injected: pure).
   * Every copy is evidence, whatever happened before it (owner, 2026-11-19): a sheet sat again is sent like the first time.
   * A step left blank is not sent: the server would read it as `abandoned`, which is inert (no evidence either way).
   */
  function sheetOf(subject, answers, id) {
    const items = questions(subject)
      .filter((q) => answeredBank(q, answers[q.id]))
      .map((q) => {
        const e = subject.exercises.find((x) => x.questions.includes(q));
        return {
          exerciseId: e.bankId,
          questionId: q.qid,
          attemptUuid: id(),
          answer: answers[q.id],
          outcome: outcomeOf(q, answers[q.id]),
        };
      });
    return { lesson, level: subject.level, sessionId: id(), items, exercises: subject.exercises.map((e) => e.bankId) };
  }

  /** Per rule key, the steps of this copy that count (right or not) — the tally of « Ma progression ». */
  const tallyOf = (subject, answers) =>
    questions(subject)
      .filter((q) => q.key && q.counted && answeredBank(q, answers[q.id]))
      .map((q) => ({ key: q.key, ok: isSuccessOutcome(outcomeOf(q, answers[q.id])) }));

  return {
    bank: true,
    lesson,
    levels,
    prepare,
    ready,
    available,
    sheetIds,
    levelPoints,
    levelMinutes,
    makeSubject,
    weakKinds,
    totalMark,
    mark: markBank,
    model: modelOf,
    scheme: schemeOf,
    guide: guideOf,
    written: writtenOf,
    sheetOf,
    tallyOf,
  };
}

/** The rule key of each savoir-faire code of a lesson, from its pack (`keys` and `evidence.learningPointOf`). */
export const keysOfPoints = (lessonCode, { keys = [], evidence } = {}) =>
  Object.fromEntries(
    keys.map((k) => [evidence?.learningPointOf?.(lessonCode, k), k]).filter(([code]) => Boolean(code)),
  );
