// What the walks of lesson `qisma-iqlidiya-hasr` (2AM « القسمة الإقليدية وحصر حاصل القسمة ») share: its id, its page,
// its three keys, and the words and numbers of OTHER lessons that must never be read on its screens (lib/walk.mjs ›
// createWalk `foreign`). The words are read from the lessons' data (lib/lessonWords.mjs): a name this lesson writes itself
// (« القسمة الإقليدية », the 1AM lesson's title, inside this lesson's own; « جزيرة الضوء », the kit's) is left out by the set
// difference, not by hand.
import { lessonUrl, QAWASIM_NUMBERS } from './walk.mjs';
import { foreignWordsFor } from './lessonWords.mjs';

export const ID = 'qisma-iqlidiya-hasr';
export const GRADE = '2am';
export const URL = lessonUrl('ansab_al_aadad_wal_hisab', ID, GRADE);
/** The three keys, in the order of the story (world/journey.js › KEYS). */
export const KEYS = ['qisma-ay-adad', 'hasr-hasil', 'inidam-baqi'];
/** The الكفاءة each key proves (world/evidence.js › POINTS): `2am_<id>_P<n>`. */
export const POINT = { 'qisma-ay-adad': 'P1', 'hasr-hasil': 'P2', 'inidam-baqi': 'P3' };
/** The module of the lesson's world, as the dev server serves it (read for the question, never for the answer). */
export const WORLD_MODULE = `/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/kusur-amaliyat/${ID}/world/index.js`;

/**
 * Every name of the other lessons of the world. Extra, by hand, two knowledge cards whose tablet has a longer name:
 * « الرقمان الأخيران » (the 1AM « الرقمان الأخيران: القسمة على 4 »), « جداء عاملين » (lesson 2's).
 */
export const HASR_FOREIGN = foreignWordsFor(ID, ['الرقمان الأخيران', 'جداء عاملين']);
/**
 * Their numbers that this lesson never shows by itself (checked on the screens with no computed number, `numbers: true`,
 * and on every screen of the board): lesson 2's (252, 96, 1400, 11200), lesson 3's long bridges and card (735, 280, 1015,
 * 1800), the 1AM stores (1575, 864) and the 1AM stone (692). Small numbers are left out: this lesson draws them. The
 * investigation screens and the mirrors are full of computed numbers (the multiples of 208, 248, 312 and 365 on a ruler
 * or a line, what is left under a long plank): they do not check numbers, only words.
 */
export const HASR_FOREIGN_NUMBERS = [...QAWASIM_NUMBERS, 735, 280, 1015, 1800, 1575, 864, 692];

// ───────────────────────────── the walk's own arithmetic (never the lesson's answers) ─────────────────────────────
export const quo = (a, b) => Math.floor(a / b);
export const ceilDiv = (a, b) => Math.ceil(a / b);
/**
 * Is gate value n right for a wave of this lesson's dash? Computed HERE from the wave's numbers (its `type` says which
 * question the sentence over the rail asks): the quotient, the value by excess, the remainder, a divisor, a multiple, the
 * smallest number to add.
 */
export function gateRight(x, n) {
  switch (x.type) {
    case 'quotient':
    case 'byDefault':
    case 'full':
      return n === quo(x.a, x.b);
    case 'byExcess':
    case 'needed':
      return n === ceilDiv(x.a, x.b);
    case 'remainder':
      return n === x.a % x.b;
    case 'missing':
      return n * x.b === x.a;
    case 'divides':
      return n >= 1 && x.a % n === 0;
    case 'multipleOf':
    case 'divisibleBy':
      return n >= 1 && n % x.b === 0;
    case 'complete':
      return n >= 1 && n === (x.b - (x.a % x.b)) % x.b;
    default:
      throw new Error(`unknown wave type ${x.type}`);
  }
}
export const WAVE_TYPES = [
  'quotient',
  'byDefault',
  'full',
  'byExcess',
  'needed',
  'remainder',
  'missing',
  'divides',
  'multipleOf',
  'divisibleBy',
  'complete',
];
/** A sentence about two numbers, judged by arithmetic: « x يقسم y », « x مضاعف للعدد y », « x (لا) يقبل القسمة على y ». */
export function sentenceTruth(text) {
  const t = text.replace(/\s+/g, ' ').trim();
  let m = t.match(/^(\d+) لا يقبل القسمة على (\d+)$/);
  if (m) return Number(m[1]) % Number(m[2]) !== 0;
  m = t.match(/^(\d+) يقبل القسمة على (\d+)$/);
  if (m) return Number(m[1]) % Number(m[2]) === 0;
  m = t.match(/^(\d+) مضاعف للعدد (\d+)$/);
  if (m) return Number(m[1]) % Number(m[2]) === 0;
  m = t.match(/^(\d+) يقسم (\d+)$/);
  if (m) return Number(m[2]) % Number(m[1]) === 0;
  return null;
}
