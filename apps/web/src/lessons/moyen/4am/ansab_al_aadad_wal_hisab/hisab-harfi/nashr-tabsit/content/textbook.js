/**
 * Le contenu du MANUEL pour le درس « نشر وتبسيط عبارة جبرية » (unité 3,
 * pp. 31–40) — données pures, au mot près ; chaque bloc cite son élément de
 * docs/sources/4am/unit3/extraction.json. Les modules rendent ces données ;
 * ils n'en réécrivent aucune. Dans les formules, la virgule décimale s'écrit
 * `{,}` (KaTeX) ; le texte arabe est celui du livre.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * L'accroche RÉELLE de l'activité (plateforme, déclarée) : le terrain de
 * l'école qu'on agrandit et qu'on découpe en zones. Même structure que le
 * calcul du livre : pour x = 9, le terrain 3 × (x + 5) EST 3 × (9 + 5).
 */
export const HOOK = {
  source: addition('interaction_generation'),
  headline: 'ملعب المتوسطة يكبر',
  text: 'قرّرت إدارة المتوسطة إطالة ملعب كرة القدم ليتّسع لجميع التلاميذ: عرضه 3 وطوله x، ويُضاف إلى طوله شريط طوله 5. ثم يُقسَّم الملعب إلى مناطق للتمارين. كيف نحسب مساحته الجديدة؟',
};

/** نشاط 1 (p. 32). */
export const ACTIVITY = {
  source: src('act-1', 32, 'أنشطة', 1),
  title: 'نشر عبارة جبرية',
  questions: [
    // Lecture CORRIGÉE (extraction › act-1.correction) : le « x » de « 3x(9 + 5) » est le signe ×.
    '1) احسب بطريقتين مختلفتين كلا مما يلي: $3 \\times (9 + 5)$ و $(4 - 2{,}5)(3 + 1{,}2)$.',
    '2) ميّز بين العبارات التي تدلّ على مجموع والعبارات التي تدل على جداء فيما يلي: $x(3x + 1)$ ، $x + (3 - 2x)$ ، $5x(1 - x)$ ، $x(x + 1) - 2 + (x + 1)$ و $(3x - 1)(3 + x)$.',
    '3) انشر كل عبارة مما يلي وبسّطها: $x(3x + 1)$ ، $5x(1 - x)$ و $(3x - 1)(3 + x)$. اذكر في كل حالة الخاصية التي اعتمدت عليها.',
  ],
  // (la lecture CORRIGÉE de la question 1 — « 3x(9 + 5) » se lit 3 × (9 + 5) — n'est plus montrée : indépendance du manuel, 2026-11-11)
  // Les nombres du livre, lus par le module et par la carte (jamais retapés).
  numbers: {
    q1a: { k: 3, a: 9, b: 5 },
    // (4 − 2,5)(3 + 1,2) en dixièmes : (40 − 25)(30 + 12) / 100.
    q1b: { a: 40, b: 25, c: 30, d: 12, scale: 10 },
  },
  // Les laboratoires : « f1|f2 » (MANIPULATION_CONTRACT, pitch-expansion).
  pitch: { beginner: '3|x+5', advanced: '3x-1|3+x' },
  // Les mêmes facteurs en termes { c, p } (core/polynomials), pour CALCULER les
  // développements affichés par la carte — jamais retapés.
  factors: {
    beginner: [[{ c: 3, p: 0 }], [{ c: 1, p: 1 }, { c: 5, p: 0 }]],
    advanced: [[{ c: 3, p: 1 }, { c: -1, p: 0 }], [{ c: 3, p: 0 }, { c: 1, p: 1 }]],
  },
};

/**
 * Deux phrases de la PLATEFORME (pas du livre), écrites une fois ici parce que
 * le module 1 les affiche et que la carte les cite : la règle qui tranche
 * « جداء أم مجموع ؟ » (question 2) et le refus de réunir deux termes non
 * semblables (le geste refusé du laboratoire, question 3).
 */
export const PLATFORM_NOTES = {
  source: addition('interaction_generation'),
  classify: 'نحدّد آخر عملية تُنجز في العبارة: إن كانت ضربًا فالعبارة جداء، وإن كانت جمعًا أو طرحًا فهي مجموع (أو فرق).',
  unlike: 'الحدّان $3x^2$ و $8x$ غير متشابهين: $x^2$ مساحة مربّع و $x$ مساحة شريط في الملعب، فلا يُجمعان في حدّ واحد.',
  unlikeWrong: 'كتابة $3x^2 + 8x - 3 = 11x^2 - 3$ بجمع معاملي $x^2$ و $x$.',
  unlikeRight: 'نجمع الحدود المتشابهة فقط: $9x - x = 8x$، ويبقى $(3x - 1)(3 + x) = 3x^2 + 8x - 3$.',
};

/** معارف 1 (p. 34) — « النشر ». */
export const KNOWLEDGE = {
  source: src('know-1', 34, 'معارف', 1),
  title: 'النشر',
  definition: 'نشر عبارة جداء يعني كتابة هذه العبارة على شكل مجموع (أو فرق).',
  propertiesIntro: '$a$ ، $b$ ، $c$ و $k$ أعداد.',
  properties: [
    '$k(a + b) = ka + kb$',
    '$k(a - b) = ka - kb$',
    '$(a + b)(c + d) = ac + ad + bc + bd$',
  ],
  examples: [
    '$5(x - 1) = 5 \\times x - 5 \\times 1 = 5x - 5$',
    '$(2x - 1)(x + 4) = 2x^2 + 8x - x - 4 = 2x^2 + 7x - 4$',
  ],
  // L'exemple 2 dans le laboratoire (module 2, exemple travaillé).
  pitch: '2x-1|x+4',
};

/**
 * « أستعدّ » (p. 31), items 3, 4, 7 et 8 (extraction → destinations.prep.items) :
 * la distributivité connue depuis la 3AM, dans les deux sens.
 */
export const PREP_ITEMS = [
  { n: 3, skill: 'tawziiya', text: 'نشر العبارة $-2 \\times (a - 1)$ هو $-2a + 2$.', answer: true, why: '$-2 \\times a - 2 \\times (-1) = -2a + 2$' },
  { n: 4, skill: 'tawziiya', text: 'نشر العبارة $4(2 - b)$ هو $8 - b$.', answer: false, why: '$4(2 - b) = 4 \\times 2 - 4 \\times b = 8 - 4b$' },
  { n: 7, skill: 'tawziiya', text: 'العبارة $3a + \\sqrt{3}$ تساوي $3\\left(a + \\dfrac{\\sqrt{3}}{3}\\right)$.', answer: true, why: '$3 \\times a + 3 \\times \\dfrac{\\sqrt{3}}{3} = 3a + \\sqrt{3}$' },
  { n: 8, skill: 'tawziiya', text: 'العبارة $16 - \\dfrac{1}{2}x$ تساوي $\\dfrac{1}{2}(8 - x)$.', answer: false, why: '$\\dfrac{1}{2}(8 - x) = 4 - \\dfrac{1}{2}x$' },
].map((it) => ({ ...it, source: src('prep', 31, 'أستعدّ', it.n) }));

/**
 * Six ajouts de la plateforme, déclarés comme tels : les trois autres acquis
 * que la leçon suppose (catalogue › prerequisites) — l'ordre des opérations
 * sur des nombres relatifs, x × x = x² face à x + x = 2x, et les parenthèses
 * précédées de −. Une vraie et une fausse pour chacun ; aucun nombre de l'activité.
 */
export const PREP_PLATFORM_ITEMS = [
  { n: 'a', skill: 'awlawiyat', text: '$7 - 2 \\times 6 = 30$.', answer: false, why: '$7 - 2 \\times 6 = 7 - 12 = -5$: الضرب قبل الطرح.' },
  { n: 'b', skill: 'awlawiyat', text: '$(-4) \\times (-6) - 10 = 14$.', answer: true, why: '$(-4) \\times (-6) = 24$ و $24 - 10 = 14$: جداء عددين سالبين عدد موجب.' },
  { n: 'c', skill: 'hudud', text: '$a \\times a = 2a$.', answer: false, why: '$a \\times a = a^2$، أما $a + a = 2a$.' },
  { n: 'd', skill: 'hudud', text: '$7y - 2y + y = 6y$.', answer: true, why: '$7y - 2y + y = (7 - 2 + 1)y = 6y$: حدود متشابهة نجمع معاملاتها.' },
  { n: 'e', skill: 'aqwas', text: '$10 - (y + 8) = 10 - y + 8$.', answer: false, why: '$10 - (y + 8) = 10 - y - 8 = 2 - y$: القوسان مسبوقان بـ $-$ فتتغيّر إشارة كل حد بداخلهما.' },
  { n: 'f', skill: 'aqwas', text: '$a - (b - c) = a - b + c$.', answer: true, why: 'نحذف القوسين المسبوقين بـ $-$ ونغيّر إشارة كل حد بداخلهما: $-(b - c) = -b + c$.' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
