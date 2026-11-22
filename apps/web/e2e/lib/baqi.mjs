// What the walks of lesson `qisma-iqlidiya-baqi` (1AM « القسمة الإقليدية ») share: its id, its page, its five keys, and
// the words and numbers of OTHER lessons that must never be read on its screens (lib/walk.mjs › createWalk `foreign`).
// The words are read from the lessons' data (lib/lessonWords.mjs): a name this lesson writes itself (« جزيرة البقايا »,
// « مخزن جسر المرفأ », lesson 3's too; « جزيرة الضوء », the kit's) is left out by the set difference, not by hand.
import { lessonUrl, QAWASIM_NUMBERS } from './walk.mjs';
import { foreignWordsFor } from './lessonWords.mjs';

export const ID = 'qisma-iqlidiya-baqi';
export const GRADE = '1am';
export const URL = lessonUrl('ansab_al_aadad_wal_hisab', ID, GRADE);
/** The five keys, in the order of the story (world/journey.js › KEYS). */
export const KEYS = ['majmuaat-kamila', 'baqi-asghar', 'musawat-qisma', 'taqdir-hasil', 'baqi-fi-masala'];
/** The module of the lesson's world, as the dev server serves it (read for the question, never for the answer). */
export const WORLD_MODULE = `/src/lessons/moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/${ID}/world/index.js`;

/**
 * Every name of the other lessons of the world. Extra, by hand, two knowledge cards whose tablet has a longer name:
 * « الرقمان الأخيران » (the next lesson's « الرقمان الأخيران: القسمة على 4 »), « جداء عاملين » (lesson 2's).
 */
export const BAQI_FOREIGN = foreignWordsFor(ID, ['الرقمان الأخيران', 'جداء عاملين']);
/**
 * The numbers THIS lesson's own estimate ruler computes (world/inquiries.js › ESTIMATE_INQUIRY: the stone's 692 with planks
 * of 27, then 940/38, 2100/52, 3172/26): a mark counts single planks, tens or hundreds, so it writes b × k × 10^p
 * (« 27 × 40 = 1080 »). Counted generously (k up to 20): a number the lesson computes is never another lesson's.
 */
const ESTIMATE_ROUNDS = [
  [692, 27],
  [940, 38],
  [2100, 52],
  [3172, 26],
];
const RULER = new Set(
  ESTIMATE_ROUNDS.flatMap(([, b]) => [1, 10, 100].flatMap((p) => Array.from({ length: 21 }, (_, k) => b * k * p))),
);
/**
 * Their numbers that this lesson never shows (checked on the screens with no generated number, `numbers: true`): lesson
 * 2's (252, 96, 1400, 11200), lesson 3's long bridges (735, 280, 1015), the next lesson's boss (1575), the 2AM lesson's
 * gaps (912, 4576, 5475, 644, 1080), its boats' boxes (1250) and its boss (1872). Small numbers are left out: this lesson draws them.
 * A number this lesson computes itself is left out too (RULER: 1080 = 27 × 40 on the estimate ruler).
 */
export const BAQI_FOREIGN_NUMBERS = [
  ...QAWASIM_NUMBERS,
  735,
  280,
  1015,
  1575,
  912,
  4576,
  5475,
  644,
  1080,
  1250,
  1872,
].filter((n) => !RULER.has(n));
