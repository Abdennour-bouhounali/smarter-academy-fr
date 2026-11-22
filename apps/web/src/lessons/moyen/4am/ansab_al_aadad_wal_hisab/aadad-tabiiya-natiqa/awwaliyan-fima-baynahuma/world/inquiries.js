/**
 * THE EXPERIMENTS of lesson « العددان الأوّليّان فيما بينهما » — their numbers and their words (the screens and their
 * logic are the world's: `divisorIsles/InquiryGcd.jsx` › ladder; the contract: GAME_WORLD.md « استكشف », the spec block
 * of `ladder`).
 *
 * The two benches the story's workshops carry, and the one experiment a mirror keeps:
 *   PROOF_BENCH    (island E's workshop, before key ✅) `ladder` / `divide`, `plain`, on the convoy « proof » (35 ; 26):
 *                  4 rows, the last remainder that is not 0 is 1
 *   HIDDEN_BENCH   (island I's workshop, before key ❌) `ladder` / `divide`, `plain`, on the convoy « hidden » (85 ; 119):
 *                  3 rows, the last remainder that is not 0 is 17
 *   PROOF_INQUIRY  (island G's MIRROR, key ✅ — it stays in the mirror) `ladder` / `divide`, NOT plain, on 440 ; 301
 *                  (ends on 1) then 341 ; 176 (ends on 11): the rows and, beside each, the planks that fill its gaps
 * The benches are the TOOL of lesson 6 (its divisions) on a convoy's own gaps, not a key's experiment: 🤝 and ❌ are met
 * on the islands; only ✅ has an experiment, the mirror's.
 *
 * A BENCH gives FACTS and stops there: it never shows which plank to make (defects.md B27). Both are `plain`: the rows
 * and their calculations only — no column of the planks common to each row's pair, no last value lit. Every sentence
 * says what the notebook just wrote — never the plank, never « the only plank », never « coprime », never « a common
 * divisor » (the forges' `inquiries.test.js` lists the forbidden words of each key). Arabic counts go through `counted`.
 */
import { NUMBERS, ROWS, ROWS_ACC, counted } from './math';

/** A row of the notebook as a formula: « 35 = 26 × 1 + 9 ». */
const rowTex = (f) => `$${f.a} = ${f.b} \\times ${f.q} + ${f.value}$`;
const pairTex = ([x, y]) => `$(${x} ; ${y})$`;

/** The words of the division notebook: what each row did, what he said, how many rows. */
const notebookText = {
  lead: (a, b) => `دفتر القسمة: هوّة ${a} خانة وهوّة ${b} خانة.`,
  goal: () => 'في كلّ سطر يقسم الدفتر عددًا على عدد. اكتب الزوج الذي يأتي في السطر التالي.',
  ask: ({ a, b }) => `ما الزوج الذي يأتي بعد ${pairTex([a, b])}؟`,
  write: 'اكتب السطر',
  seen: (f) =>
    f.next
      ? `${rowTex(f)}، والسطر التالي ${pairTex(f.next)}${f.hit ? '، كما كتبتَ.' : `، وكتبتَ ${pairTex(f.said)}.`}`
      : `${rowTex(f)}.`,
  planks: 'ألواح تملأ الهوّتين',
  // a notebook longer than the screen folds its first rows (InquiryGcd.jsx › MAXR): never at 3 or 4 rows, said rightly
  folded: (k) =>
    k === 1
      ? 'سطر واحد مطويّ'
      : k === 2
        ? 'سطران مطويّان'
        : k >= 3 && k <= 10
          ? `${k} أسطر مطويّة`
          : `${k} سطرًا مطويًّا`,
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

const [P1, P2] = NUMBERS.proof.gaps;
const [H1, H2] = NUMBERS.hidden.gaps;

/** Island E's workshop: the notebook of divisions on the convoy « proof » — the rows only. */
export const PROOF_BENCH = {
  kind: 'ladder',
  mode: 'divide',
  plain: true,
  rounds: [{ a: P1, b: P2 }],
  text: notebookText,
};
/** Island I's workshop: the notebook of divisions on the convoy « hidden » (the bigger gap first, as it divides). */
export const HIDDEN_BENCH = {
  kind: 'ladder',
  mode: 'divide',
  plain: true,
  rounds: [{ a: Math.max(H1, H2), b: Math.min(H1, H2) }],
  text: notebookText,
};

/**
 * The MIRROR of key ✅ (island G) keeps its experiment (written by the forges' agent): the same notebook of divisions,
 * NOT plain — beside every row the planks that fill both gaps of that row, and at the end the last value that is not 0
 * lit — on two new pairs (none from the bench, the bank or another story; `lesson-bank-numbers.mjs --check`):
 *   440 ; 301   4 rows: 440 = 301 × 1 + 139, 301 = 139 × 2 + 23, 139 = 23 × 6 + 1, 23 = 1 × 23 + 0 — the column
 *               reads « 1 » on every row, and the last value that is not 0 is 1
 *   341 ; 176   3 rows: 341 = 176 × 1 + 165, 176 = 165 × 1 + 11, 165 = 11 × 15 + 0 — the column reads « 1 11 » on every
 *               row, and the last value that is not 0 is 11
 * Facts only: what each row computes and which planks fill its two gaps. The forge turns every row into a case
 * (forges.js › ✅ `fromInquiry`).
 */
export const PROOF_INQUIRY = {
  kind: 'ladder',
  mode: 'divide',
  rounds: [
    { a: 440, b: 301 },
    { a: 341, b: 176 },
  ],
  text: {
    ...notebookText,
    goal: () =>
      'في كلّ سطر يقسم الدفتر عددًا على عدد، ويكتب بجانبه الألواح التي تملأ هوّتي السطر. اكتب الزوج الذي يأتي في السطر التالي.',
    done: 'إلى قاعدتك',
  },
};
