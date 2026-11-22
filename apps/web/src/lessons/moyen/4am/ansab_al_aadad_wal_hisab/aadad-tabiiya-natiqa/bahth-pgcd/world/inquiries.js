/**
 * THE EXPERIMENTS of lesson « البحث عن القاسم المشترك الأكبر لعددين طبيعيين » — their numbers and their words (the screens
 * and their logic are the world's: `divisorIsles/InquiryGcd.jsx` › ladder, `InquiryGcdModes.jsx` › fold and both; the
 * contract: GAME_WORLD.md « استكشف », the spec blocks of `ladder` and its modes). All four are the `ladder` kind, each in
 * its own mode: the lesson IS the ladder, and no two keys share a (kind, mode).
 *
 *   TARH_BENCH     (island D's workshop, key 🪜) `ladder` / `subtract` on the convoy « tarh » (259 ; 185): 5 rows
 *   FOLD_INQUIRY   (island F's SECOND mirror, key 🧮 — it stays in the mirror) `ladder` / `fold` on 962 and 296: three
 *                  rows that take away 296 folded by him into 962 = 296 × 3 + 74
 *   IQLIDIS_BENCH  (island F's workshop, key 🔁) `ladder` / `divide` on the convoy « iqlidis » (1833 ; 546): 4 rows
 *   SIBAQ_BENCH    (island H's workshop, key ⏱️) `ladder` / `both` on the convoy « sibaq » (1003 ; 34): 31 rows against 2
 *
 * A BENCH gives FACTS and stops there: it never shows which plank to make. So the two one-mode benches are `plain` (the
 * world's option, GAME_WORLD.md `ladder`): no column of the planks common to each row's pair (on 259 and 185 it read
 * « 1 37 » on every row — the answer) and no last value lit gold; only the rows and their calculations. The mirror's fold
 * keeps its column: there the planks the rows keep are the facts the rule 🧮 is written from.
 * Every sentence says what the notebook just wrote — never the next pair as a rule, the stop, the plank, a « faster »
 * (`inquiries.test.js` lists the forbidden words of each key). Arabic counts go through `counted`.
 */
import { NUMBERS, ROWS, ROWS_ACC, counted } from './math';

/** « 3 أسطر مطويّة », with the agreement of the participle. */
const folded = (k) =>
  k === 1
    ? 'سطر واحد مطويّ'
    : k === 2
      ? 'سطران مطويّان'
      : k >= 3 && k <= 10
        ? `${k} أسطر مطويّة`
        : `${k} سطرًا مطويًّا`;
/** A row of a notebook as a formula: « 259 − 185 = 74 », « 1833 = 546 × 3 + 195 ». */
const rowTex = (f) =>
  f.mode === 'divide' ? `$${f.a} = ${f.b} \\times ${f.q} + ${f.value}$` : `$${f.a} - ${f.b} = ${f.value}$`;
const pairTex = ([x, y]) => `$(${x} ; ${y})$`;
const NOTEBOOK = { subtract: 'دفتر الطرح', divide: 'دفتر القسمة' };

/** The words of a one-mode notebook (`subtract` or `divide`): what each row did, what he said, how many rows. */
const notebookText = {
  lead: (a, b, mode) => `${NOTEBOOK[mode]}: هوّة ${a} خانة وهوّة ${b} خانة.`,
  goal: (a, b, mode) =>
    mode === 'divide'
      ? 'في كلّ سطر يقسم الدفتر عددًا على عدد. اكتب الزوج الذي يأتي في السطر التالي.'
      : 'في كلّ سطر يطرح الدفتر عددًا من عدد. اكتب الزوج الذي يأتي في السطر التالي.',
  ask: ({ a, b }) => `ما الزوج الذي يأتي بعد ${pairTex([a, b])}؟`,
  write: 'اكتب السطر',
  seen: (f) =>
    f.next
      ? `${rowTex(f)}، والسطر التالي ${pairTex(f.next)}${f.hit ? '، كما كتبتَ.' : `، وكتبتَ ${pairTex(f.said)}.`}`
      : `${rowTex(f)}.`,
  planks: 'ألواح تملأ الهوّتين',
  folded,
  countAsk: ({ a, b, written }) =>
    `كتب الدفتر ${counted(written, ROWS_ACC)}. كم سطرًا سيكتب الدفتر كلّه للهوّتين ${a} و ${b}؟`,
  countLabel: 'عدد الأسطر',
  finish: 'أكمل الدفتر',
  end: (f) =>
    `كتب الدفتر ${counted(f.steps, ROWS_ACC)} للهوّتين ${f.a} و ${f.b}${f.guessed === f.steps ? '، كما قلتَ.' : `، وقلتَ ${f.guessed}.`}`,
  foundLine: (f) => `${f.a} و ${f.b}: ${counted(f.steps, ROWS)}`,
  next: 'التالي',
  done: 'إلى الورشة',
};

const [T1, T2] = NUMBERS.tarh.gaps;
const [I1, I2] = NUMBERS.iqlidis.gaps;
const [S1, S2] = NUMBERS.sibaq.gaps;
const [F1, F2] = NUMBERS.fold.gaps;

/** Island D's workshop: the notebook of subtractions on the convoy « tarh » — the rows only. */
export const TARH_BENCH = {
  kind: 'ladder',
  mode: 'subtract',
  plain: true,
  rounds: [{ a: T1, b: T2 }],
  text: notebookText,
};
/** Island F's workshop: the notebook of divisions on the convoy « iqlidis » — the rows only. */
export const IQLIDIS_BENCH = {
  kind: 'ladder',
  mode: 'divide',
  plain: true,
  rounds: [{ a: I1, b: I2 }],
  text: notebookText,
};

/** Island H's workshop: the two notebooks of the same pair, side by side, on the convoy « sibaq ». */
export const SIBAQ_BENCH = {
  kind: 'ladder',
  mode: 'both',
  rounds: [{ a: S1, b: S2 }],
  text: {
    lead: (a, b) => `دفتران للهوّتين ${a} و ${b}: دفتر يطرح، ودفتر يقسم.`,
    goal: () => 'قل أوّلًا أيّ الدفترين سيكتب أسطرًا أقلّ، وبكم سطرًا، ثمّ شغّلهما معًا.',
    ladderLabel: (mode) => NOTEBOOK[mode],
    countLine: (mode, n) => counted(n, ROWS),
    ask: () => 'قبل أن يكتب الدفتران: أيّهما سيكتب أسطرًا أقلّ؟ وبكم سطرًا؟',
    shorter: { subtract: 'دفتر الطرح', divide: 'دفتر القسمة', same: 'العدد نفسه' },
    byLabel: 'أقلّ بـ',
    byUnit: 'من الأسطر',
    run: 'شغّل الدفترين',
    end: ({ steps, shorter, by, said }) =>
      `كتب دفتر الطرح ${counted(steps.subtract, ROWS_ACC)}، ودفتر القسمة ${counted(steps.divide, ROWS_ACC)}${
        said && said.shorter === shorter && said.by === by ? '، كما قلتَ.' : '.'
      }`,
    foundLine: (r) => `${r.a} و ${r.b}: ${r.steps.subtract} مقابل ${r.steps.divide}`,
    next: 'التالي',
    done: 'إلى الورشة',
  },
};

/**
 * Forge 🧮's experiment, in the mirror of island F after 🪜's tablet: the notebook of subtractions on 962 and 296 writes
 * the rows that take away 296 (666, 370, 74); he folds them into ONE line in its template 962 = 296 × □ + □; the world
 * folds the rest (296 = 74 × 4 + 0). The column « ألواح تملأ الهوّتين » stays: the same planks on every line.
 */
export const FOLD_INQUIRY = {
  kind: 'ladder',
  mode: 'fold',
  rounds: [{ a: F1, b: F2 }],
  text: {
    lead: (a, b) => `دفتر الطرح: هوّة ${a} خانة وهوّة ${b} خانة.`,
    goal: () => 'اطوِ في سطر واحد الأسطر التي تطرح العدد نفسه.',
    planks: 'ألواح تملأ الهوّتين',
    folded,
    foldAsk: ({ a, b, rows }) =>
      `${rows === 2 ? 'سطران يطرحان' : `${counted(rows, ROWS)} تطرح`} ${b} من ${a} مرّة بعد مرّة. اكتبها في سطر واحد: كم مرّة، وماذا بقي؟`,
    fold: 'اطوِ الأسطر',
    foldMiss: ({ a, b, said }) =>
      `كتبتَ $${a} = ${b} \\times ${said.q} + ${said.r}$. عُدّ الأسطر على الشاشة، وانظر إلى ما بقي بعد آخرها.`,
    foldSeen: (f) => `$${f.a} = ${f.b} \\times ${f.q} + ${f.r}$: ${counted(f.q, ROWS)} في سطر واحد.`,
    end: ({ steps, lines }) => `دفتر الطرح: ${counted(steps, ROWS)}. بعد الطيّ: ${counted(lines, ROWS)}.`,
    foundLine: (r) => `${r.a} و ${r.b}: ${counted(r.steps, ROWS)} صارت ${counted(r.lines, ROWS_ACC)}`,
    next: 'التالي',
    done: 'أكتب قاعدتي',
  },
};
