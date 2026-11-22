/**
 * THE EXPERIMENTS of lesson « اختزال كسر » — their numbers and their words (the screens and their logic are the world's:
 * `divisorIsles/InquiryGcd.jsx` › ladder; the contract: GAME_WORLD.md « استكشف », the spec block of `ladder`).
 *
 * Written by wave 1: ONLY the two benches the story's workshops carry. The experiments of the mirrors (if a key needs
 * one) are the forges' agent's, added below.
 *   THULUTH_BENCH  (island C's workshop, before key 🎯) `ladder` / `divide`, `plain`, on the bridge 99 cells, 66 lit:
 *                  2 rows (99 = 66 × 1 + 33, 66 = 33 × 2 + 0)
 *   TUSU_BENCH     (island D's workshop, before key 🎯) `ladder` / `divide`, `plain`, on the bridge 243 cells, 189 lit:
 *                  3 rows (243 = 189 × 1 + 54, 189 = 54 × 3 + 27, 54 = 27 × 2 + 0)
 * The benches are the TOOL of lesson 6 (its divisions) on a marked bridge's two numbers — the whole gap and its lit
 * stretch — not a key's experiment. A BENCH gives FACTS and stops there: it never shows which plank to make (defects.md
 * B27). Both are `plain`: the rows and their calculations only. Every sentence says what the notebook just wrote —
 * never the plank, never « the longest », never PGCD, never a fraction's form. Arabic counts go through `counted`.
 */
import { NUMBERS, ROWS, ROWS_ACC, counted } from './math';

/** A row of the notebook as a formula: « 99 = 66 × 1 + 33 ». */
const rowTex = (f) => `$${f.a} = ${f.b} \\times ${f.q} + ${f.value}$`;
const pairTex = ([x, y]) => `$(${x} ; ${y})$`;

/** The words of the division notebook: what each row did, what he said, how many rows. */
const notebookText = {
  lead: (a, b) => `دفتر القسمة: الجسر ${a} خانة، والجزء المضاء ${b} خانة.`,
  goal: () => 'في كلّ سطر يقسم الدفتر عددًا على عدد. اكتب الزوج الذي يأتي في السطر التالي.',
  ask: ({ a, b }) => `ما الزوج الذي يأتي بعد ${pairTex([a, b])}؟`,
  write: 'اكتب السطر',
  seen: (f) =>
    f.next
      ? `${rowTex(f)}، والسطر التالي ${pairTex(f.next)}${f.hit ? '، كما كتبتَ.' : `، وكتبتَ ${pairTex(f.said)}.`}`
      : `${rowTex(f)}.`,
  planks: 'ألواح تملأ العددين',
  // a notebook longer than the screen folds its first rows (InquiryGcd.jsx › MAXR): never at 2 or 3 rows, said rightly
  folded: (k) =>
    k === 1
      ? 'سطر واحد مطويّ'
      : k === 2
        ? 'سطران مطويّان'
        : k >= 3 && k <= 10
          ? `${k} أسطر مطويّة`
          : `${k} سطرًا مطويًّا`,
  countAsk: ({ a, b, written }) =>
    `كتب الدفتر ${counted(written, ROWS_ACC)}. كم سطرًا سيكتب الدفتر كلّه للعددين ${a} و ${b}؟`,
  countLabel: 'عدد الأسطر',
  finish: 'أكمل الدفتر',
  end: (f) =>
    `كتب الدفتر ${counted(f.steps, ROWS_ACC)} للعددين ${f.a} و ${f.b}${f.guessed === f.steps ? '، كما قلتَ.' : `، وقلتَ ${f.guessed}.`}`,
  foundLine: (f) => `${f.a} و ${f.b}: ${counted(f.steps, ROWS)}`,
  next: 'التالي',
  done: 'إلى الورشة',
};

const T = NUMBERS.thuluth;
const S = NUMBERS.tusu;

/** Island C's workshop: the notebook of divisions on the bridge 99 / 66 — the rows only. */
export const THULUTH_BENCH = {
  kind: 'ladder',
  mode: 'divide',
  plain: true,
  rounds: [{ a: T.gap, b: T.mark }],
  text: notebookText,
};
/** Island D's workshop: the notebook of divisions on the bridge 243 / 189 — the rows only. */
export const TUSU_BENCH = {
  kind: 'ladder',
  mode: 'divide',
  plain: true,
  rounds: [{ a: S.gap, b: S.mark }],
  text: notebookText,
};
