// What the walks of lesson `bahth-pgcd` (lesson 6, 4AM « البحث عن القاسم المشترك الأكبر لعددين طبيعيين ») share: its id,
// its page, its five keys, the walk's OWN arithmetic (the two algorithms), and the words and numbers of OTHER lessons that
// must never be read on its screens (lib/walk.mjs › createWalk `foreign`). The words are read from the lessons' data
// (lib/lessonWords.mjs): a set difference, never a hand list.
import { lessonUrl } from './walk.mjs';
import { foreignWordsFor } from './lessonWords.mjs';
import { TAYIN_NUMBERS } from './tayin.mjs';

export const ID = 'bahth-pgcd';
export const URL = lessonUrl('ansab_al_aadad_wal_hisab', ID);
/** The five keys, in the order of the story (world/journey.js › KEYS). */
export const KEYS = ['farq-yabqi', 'khawarizmiyat-al-tarh', 'baqi-yabqi', 'iqlidis', 'aqall-khutuwat'];
/** The tablets of the student's world (world/story.js › TABLETS). */
export const TITLES = {
  'farq-yabqi': 'الفرق يحفظ الألواح المشتركة',
  'khawarizmiyat-al-tarh': 'خوارزمية الفروق',
  'baqi-yabqi': 'الباقي يحفظ الألواح المشتركة',
  iqlidis: 'خوارزمية إقليدس',
  'aqall-khutuwat': 'أيّ الخوارزميتين أسرع',
};

/** Every name of the other lessons of the world, and the two longer knowledge cards lessons 4 and 5 add by hand. */
export const BAHTH_FOREIGN = foreignWordsFor(ID, ['جداء عاملين', 'الرقمان الأخيران']);
/**
 * Numbers of the other lessons this lesson never shows by itself: lesson 5's list, then lesson 5's own headline numbers
 * (the store's piers 154 and 238 and their sum 392, the stream of the board 40 is small and left out).
 */
export const BAHTH_NUMBERS = [...TAYIN_NUMBERS, 154, 238, 392];

// ───────────────────────────── the walk's own arithmetic (never the lesson's answers) ─────────────────────────────
export const gcd = (a, b) => (b ? gcd(b, a % b) : a);
/** Euclid's divisions of (a ; b), down to the remainder 0. */
export function divisions(a, b) {
  const out = [];
  let [x, y] = [Math.max(a, b), Math.min(a, b)];
  while (y > 0) {
    out.push({ a: x, b: y, q: Math.floor(x / y), r: x % y });
    [x, y] = [y, x % y];
  }
  return out;
}
/** The subtractions of (a ; b): bigger minus smaller, down to 0. */
export function subtractions(a, b) {
  const out = [];
  let [x, y] = [Math.max(a, b), Math.min(a, b)];
  while (y > 0) {
    const d = x - y;
    out.push({ x, y, d });
    [x, y] = [Math.max(y, d), Math.min(y, d)];
  }
  return out;
}
