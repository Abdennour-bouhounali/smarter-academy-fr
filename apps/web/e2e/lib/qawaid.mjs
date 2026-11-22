// What the walks of lesson `qawaid-qabiliyat-qisma` (1AM « قواعد قابلية القسمة ») share: its grade, its page, its four
// keys, the words and numbers of OTHER lessons that must never be read on its screens (lib/walk.mjs › createWalk
// `foreign`), and the arithmetic the walks do THEMSELVES (a gate, a sentence: never the lesson's own answer).
// Each walk still writes the lesson's id as a literal: `scripts/lesson-v2-status.mjs` finds « a walk plays its world » by it.
// The words are read from the lessons' data (lib/lessonWords.mjs): a name this lesson writes itself (« قواعد قابلية القسمة »,
// its title and lesson 2's tablet; « باقي القسمة », inside its « باقي القسمة الإقليدية ») is left out by the set difference.
// Lesson 2's 96 and 252 are left out of the numbers: this lesson's mirror says « 8 يقسم 96 » and its gate dash offers 252.
import { lessonUrl, QAWASIM_NUMBERS } from './walk.mjs';
import { foreignWordsFor } from './lessonWords.mjs';

export const GRADE = '1am';
export const UNIT = 'ansab_al_aadad_wal_hisab';
export const pageOf = (id) => lessonUrl(UNIT, id, GRADE);
/** The four keys, in the order of the story (world/journey.js › KEYS). */
export const KEYS = ['raqm-alahad', 'majmu-arqam', 'raqmayn-akhirayn', 'baqi-sifr'];
/** The الكفاءة each key proves (world/evidence.js › POINTS). */
export const POINT = { 'raqm-alahad': 'P1', 'majmu-arqam': 'P2', 'raqmayn-akhirayn': 'P3', 'baqi-sifr': 'P4' };
/** The module of the lesson's world, as the dev server serves it (read for what a screen must SHOW, never for an answer). */
export const WORLD_MODULE =
  '/src/lessons/moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qawaid-qabiliyat-qisma/world/index.js';

/**
 * Every name of the other lessons of the world (lib/lessonWords.mjs). Extra, by hand: « جداء عاملين », lesson 2's knowledge
 * card (its tablet's name is longer: « جداء عاملين: قاسمان معًا »).
 */
export const QAWAID_FOREIGN = foreignWordsFor('qawaid-qabiliyat-qisma', ['جداء عاملين']);
/**
 * Their numbers this lesson never shows (checked on the screens with no generated number, `numbers: true`): lesson 2's
 * store (1400, 11200), lesson 3's long bridges, its store and its price (735, 280, 1015, 4350), the 1AM Euclidean division's
 * stone and store (692, 864), the 2AM lesson's gaps, its boats' boxes and its store (912, 4576, 5475, 644, 1080, 1250, 1872).
 */
export const QAWAID_FOREIGN_NUMBERS = [
  ...QAWASIM_NUMBERS.filter((x) => x !== 96 && x !== 252),
  735,
  280,
  1015,
  4350,
  692,
  864,
  912,
  4576,
  5475,
  644,
  1080,
  1250,
  1872,
];

// ───────────────────────────── the walks' own arithmetic ─────────────────────────────
export const digitSum = (n) =>
  String(n)
    .split('')
    .reduce((t, x) => t + Number(x), 0);
/** The number a « missing digit » makes with the digit d: □ in the units, or in the tens between `pre` and `post`. */
export const withDigit = (pos, pre, post, d) => (pos === 'units' ? pre * 10 + d : pre * 100 + d * 10 + post);
/** Is gate value n right for this wave of THIS lesson? Computed here from the wave's numbers (never its `good`). */
export const gateRight = (x, n) =>
  ({
    unitsBy: () => n >= 1 && n % x.b === 0,
    sumBy: () => n >= 1 && n % x.b === 0,
    last2By: () => n >= 1 && n % 4 === 0,
    divisibleBy: () => n >= 1 && n % x.b === 0,
    multipleOf: () => n >= 1 && n % x.b === 0,
    notBy: () => n >= 1 && n % x.b !== 0,
    sum3not9: () => n >= 1 && n % 3 === 0 && n % 9 !== 0,
    digitFor: () => n >= 0 && n <= 9 && withDigit(x.pos, x.pre, x.post, n) % x.b === 0,
    remainder: () => n === x.a % x.b,
    dividesNum: () => n >= 1 && x.a % n === 0,
  })[x.type]?.();
/** The reading waves: a number of three or four digits, read by a key at a glance (never a division in the head). */
export const READING = ['unitsBy', 'notBy', 'sumBy', 'sum3not9', 'last2By'];
/** The words of a sentence outside its formulas (`$…$`): what must be read on screen as it is written. */
export const wordsOf = (t) =>
  String(t)
    .split(/\$[^$]*\$/)
    .map((x) => x.replace(/\s+/g, ' ').trim())
    .filter((x) => x.length > 2);
