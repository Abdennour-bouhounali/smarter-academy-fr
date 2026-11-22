// What the walks of lesson `tayin-pgcd` (lesson 5, 4AM « تعيين القاسم المشترك الأكبر لعددين طبيعيين ») share: its id, its
// page, its three keys, and the words and numbers of OTHER lessons that must never be read on its screens (lib/walk.mjs ›
// createWalk `foreign`). The words are read from the lessons' data (lib/lessonWords.mjs): every name of lessons 1–4 and of
// the 1AM / 2AM lessons of the world that this lesson never writes itself (a set difference, never a hand list).
import { lessonUrl } from './walk.mjs';
import { foreignWordsFor } from './lessonWords.mjs';
import { MUSHTARAK_NUMBERS } from './mushtarak.mjs';

export const ID = 'tayin-pgcd';
export const URL = lessonUrl('ansab_al_aadad_wal_hisab', ID);
/** The three keys, in the order of the story (world/journey.js › KEYS). */
export const KEYS = ['hasr-wa-taqatu', 'nataij-mubashira', 'b-yaqsim-a'];
/** The الكفاءة each key proves (world/evidence.js › POINTS): `4am_<id>_P<n>`. */
export const POINT = { 'hasr-wa-taqatu': 'P1', 'nataij-mubashira': 'P2', 'b-yaqsim-a': 'P3' };
/** The tablets of the student's world (world/story.js › TABLETS): the board and the hub read the same wording. */
export const TITLES = {
  'hasr-wa-taqatu': 'احصر القواسم ثم قاطعها',
  'nataij-mubashira': 'نتائج مباشرة',
  'b-yaqsim-a': 'عندما يقسم الأصغر الأكبر',
};
/** The module of the lesson's world, as the dev server serves it (read for the question, never for the answer). */
export const WORLD_MODULE = `/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/${ID}/world/index.js`;

/**
 * Every name of the other lessons of the world. Extra, by hand, the two knowledge cards of other lessons whose tablet has
 * a longer name (as lesson 4's list): « جداء عاملين », « الرقمان الأخيران ».
 */
export const TAYIN_FOREIGN = foreignWordsFor(ID, ['جداء عاملين', 'الرقمان الأخيران']);
/**
 * Their numbers that this lesson never shows by itself (checked on the screens with no computed number, `numbers: true`,
 * and on every screen of the board): those lesson 4's walks check (lessons 1–3, the 1AM stores and stone), then lesson 4's
 * own — its twins 198 and 234, the crown's 266 and 322, the bridge 342, the dates and figs 228 and 276, the market's 650
 * cells (364 + 286). Small numbers are left out: this lesson draws them.
 */
export const TAYIN_NUMBERS = [...MUSHTARAK_NUMBERS, 198, 234, 266, 322, 342, 228, 276, 650, 364, 286];

// ───────────────────────────── the walk's own arithmetic (never the lesson's answers) ─────────────────────────────
export const gcd = (a, b) => (b ? gcd(b, a % b) : a);
export const divisors = (n) => {
  const out = [];
  for (let d = 1; d <= n; d += 1) if (n % d === 0) out.push(d);
  return out;
};
export const common = (a, b) => divisors(Math.min(a, b)).filter((d) => a % d === 0 && b % d === 0);
