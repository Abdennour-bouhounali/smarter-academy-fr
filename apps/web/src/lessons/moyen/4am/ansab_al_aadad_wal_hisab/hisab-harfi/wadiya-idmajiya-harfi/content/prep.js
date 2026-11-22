import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA SYNTHÈSE — l'ÉCHELLE de dix affirmations bâtie sur les leçons de l'unité (recette de la synthèse, point 3 ; pilote
 * `wadiya-idmajiya-talis`). Trois كفاءات en cycle : nashr « النشر » (1 → 4 → 7 → 10, à réviser dans `nashr-tabsit`), mutatabiqa « المتطابقات
 * الشهيرة » (2 → 5 → 8, `mutatabiqat-shahira`), tahlil « التحليل » (3 → 6 → 9, `tahlil-ibara`) — les trois leçons de l'unité, « راجع » n'est
 * jamais vide. De très facile (énoncés de règles, les trois premières VRAIES) à plus difficile. Les sept affirmations d'avant restent dans
 * content/textbook.js (PREP_ITEMS) comme source. `check` (recalculé par content/prep.test.js) :
 *   { kind: 'rule', truth }          — un énoncé de règle
 *   { kind: 'identity', lhs, rhs }   — « lhs = rhs » pour TOUT x (deux fonctions comparées en plusieurs points)
 * Aucun nombre du défi 🏆 ni de la وضعية du module 7 (content/forbidden.js, content/mission.test.js).
 */
export const PREP_LADDER = [
  { n: 1, skill: 'nashr', level: 1, text: 'لكل أعداد $k$ و $a$ و $b$: $k(a + b) = ka + kb$', answer: true,
    why: 'نضرب العدد $k$ في كل حدّ داخل القوسين: مثلًا $3(x + 2) = 3x + 6$.', check: { kind: 'rule', truth: true } },
  { n: 2, skill: 'mutatabiqa', level: 1, text: 'لكل عددين $a$ و $b$: $(a + b)^2 = a^2 + 2ab + b^2$', answer: true,
    why: 'مربّع مجموع: المربّعان والحدّ المضاعف $2ab$.', check: { kind: 'rule', truth: true } },
  { n: 3, skill: 'tahlil', level: 1, text: 'تحليل عبارة جبرية يعني كتابتها على شكل جداء.', answer: true,
    why: 'مثلًا $2x + 6 = 2(x + 3)$ : المجموع صار جداء عاملين.', check: { kind: 'rule', truth: true } },
  { n: 4, skill: 'nashr', level: 2, text: '$3(x - 4) = 3x - 4$', answer: false,
    why: 'نضرب 3 في الحدّين معًا: $3(x - 4) = 3x - 12$.', check: { kind: 'identity', lhs: (x) => 3 * (x - 4), rhs: (x) => 3 * x - 4 } },
  { n: 5, skill: 'mutatabiqa', level: 2, text: '$(x - 6)^2 = x^2 - 36$', answer: false,
    why: 'ينقص الحدّ المضاعف: $(x - 6)^2 = x^2 - 12x + 36$.', check: { kind: 'identity', lhs: (x) => (x - 6) ** 2, rhs: (x) => x ** 2 - 36 } },
  { n: 6, skill: 'tahlil', level: 2, text: '$6x + 15 = 3(2x + 5)$', answer: true,
    why: '3 عامل مشترك للحدّين: $3 \\times 2x = 6x$ و $3 \\times 5 = 15$.', check: { kind: 'identity', lhs: (x) => 6 * x + 15, rhs: (x) => 3 * (2 * x + 5) } },
  { n: 7, skill: 'nashr', level: 2, text: '$(x + 2)(x + 7) = x^2 + 9x + 14$', answer: true,
    why: '$x^2 + 7x + 2x + 14 = x^2 + 9x + 14$ : أربعة جداءات ثم نجمع الحدّين المتشابهين.', check: { kind: 'identity', lhs: (x) => (x + 2) * (x + 7), rhs: (x) => x ** 2 + 9 * x + 14 } },
  { n: 8, skill: 'mutatabiqa', level: 3, text: '$(2x + 3)^2 = 4x^2 + 6x + 9$', answer: false,
    why: 'الحدّ المضاعف هو $2 \\times 2x \\times 3 = 12x$ : $(2x + 3)^2 = 4x^2 + 12x + 9$.', check: { kind: 'identity', lhs: (x) => (2 * x + 3) ** 2, rhs: (x) => 4 * x ** 2 + 6 * x + 9 } },
  { n: 9, skill: 'tahlil', level: 3, text: '$x^2 - 49 = (x - 7)(x + 7)$', answer: true,
    why: 'فرق مربّعين: $x^2 - 7^2 = (x - 7)(x + 7)$.', check: { kind: 'identity', lhs: (x) => x ** 2 - 49, rhs: (x) => (x - 7) * (x + 7) } },
  { n: 10, skill: 'nashr', level: 3, text: '$5x - (2x - 3) = 3x - 3$', answer: false,
    why: 'القوسان مسبوقان بإشارة ناقص: نغيّر إشارة كل حدّ، $5x - 2x + 3 = 3x + 3$.', check: { kind: 'identity', lhs: (x) => 5 * x - (2 * x - 3), rhs: (x) => 3 * x - 3 } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** La leçon de l'unité à réviser pour chaque كفاءة (Module00Astaidd › skills, carte « راجع ») — les trois leçons de l'unité. */
export const PREP_LESSON = { nashr: 'nashr-tabsit', mutatabiqa: 'mutatabiqat-shahira', tahlil: 'tahlil-ibara' };
