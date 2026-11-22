// What the walks of lesson `qasim-mushtarak-akbar` (lesson 4, 4AM « القاسم المشترك الأكبر لعددين طبيعيين ») share: its id,
// its page, its four keys, and the words and numbers of OTHER lessons that must never be read on its screens (lib/walk.mjs ›
// createWalk `foreign`). The words are read from the lessons' data (lib/lessonWords.mjs): every name of lessons 1–3 and of
// the 1AM / 2AM lessons of the world that this lesson never writes itself (a set difference, never a hand list).
import { lessonUrl, QAWASIM_NUMBERS } from './walk.mjs';
import { foreignWordsFor } from './lessonWords.mjs';

export const ID = 'qasim-mushtarak-akbar';
export const URL = lessonUrl('ansab_al_aadad_wal_hisab', ID);
/** The four keys, in the order of the story (world/journey.js › KEYS). */
export const KEYS = ['qawasim-mushtaraka', 'al-akbar', 'baqat-mutamathila', 'qawasim-al-pgcd'];
/** The الكفاءة each key proves (world/evidence.js › POINTS): `4am_<id>_P<n>`. */
export const POINT = {
  'qawasim-mushtaraka': 'P1',
  'al-akbar': 'P2',
  'baqat-mutamathila': 'P3',
  'qawasim-al-pgcd': 'P4',
};
/** The module of the lesson's world, as the dev server serves it (read for the question, never for the answer). */
export const WORLD_MODULE = `/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/${ID}/world/index.js`;

/**
 * Every name of the other lessons of the world. Extra, by hand, two knowledge cards whose tablet has a longer name:
 * « جداء عاملين » (lesson 2's « جداء عاملين: قاسمان معًا »), « الرقمان الأخيران » (the 1AM « الرقمان الأخيران: القسمة على 4 »).
 */
export const MUSHTARAK_FOREIGN = foreignWordsFor(ID, ['جداء عاملين', 'الرقمان الأخيران']);
/**
 * Their numbers that this lesson never shows by itself (checked on the screens with no computed number, `numbers: true`,
 * and on every screen of the board): lesson 2's (252, 96, 1400, 11200), lesson 3's long bridges, card and store payment
 * (735, 280, 1015, 1800, 4350), the 1AM stores (1575, 864) and the 1AM stone (692). Small numbers are left out: this
 * lesson draws them.
 */
export const MUSHTARAK_NUMBERS = [...QAWASIM_NUMBERS, 735, 280, 1015, 1800, 4350, 1575, 864, 692];

// ───────────────────────────── the walk's own arithmetic (never the lesson's answers) ─────────────────────────────
export const gcd = (a, b) => (b ? gcd(b, a % b) : a);
export const divisors = (n) => {
  const out = [];
  for (let d = 1; d <= n; d += 1) if (n % d === 0) out.push(d);
  return out;
};
export const common = (a, b) => divisors(Math.min(a, b)).filter((d) => a % d === 0 && b % d === 0);
