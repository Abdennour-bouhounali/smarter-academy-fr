/**
 * Les exercices de la leçon 1 « حل معادلة من الدرجة الأولى بمجهول واحد » — RÉÉCRITS par la plateforme avec ses propres équations (verdict X2 du conseil
 * du 2026-11-11 : indépendance du manuel) ; les neuf familles, les `id`, les `learningPointId` et les difficultés sont gardés (la couverture et les preuves
 * restent), `source: src(ex-n)` aussi (traçabilité, `check:textbook`), avec `part: 'بأعداد المنصّة'`. Chaque solution est recalculée dans
 * content/exercises.test.js (fractions exactes). Un exercice à plusieurs équations est découpé en une entrée par équation (la première porte l'énoncé).
 *
 * Une solution est un NOMBRE tapé (`fraction`, sans exiger la forme irréductible : 1,4 et 7/5 sont tous deux justes) ; les solutions écrites avec √ et
 * l'équation SANS solution (تمرين 9, la deuxième) sont des CHOIX dont chaque distracteur est faux (vérifié par le calcul).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_muadala-ula_P1',
  P2: '4am_muadala-ula_P2',
};

const REWRITE = 'بأعداد المنصّة';
const E = (n) => ({ ...src(`ex-${n}`, 50, 'أوظّف تعلّماتي', n), part: REWRITE });
const F = (prompt, expected, explain) => ({ interaction: 'fraction', question: { prompt, expected, explain, requireIrreducible: false } });
const C = (prompt, options, correct, explain, cols = 1) => ({ interaction: 'choice', question: { prompt, options, correct, cols, explain } });

/* ── Module 3 — دورك الآن ──────────────────────────────────────────────────── */
const NOW_SRC = { ...src('now-47-1', 47, 'دوري الآن', 1), part: REWRITE };
export const NOW_47_1 = [
  {
    id: 'now-47-1-a', source: NOW_SRC, learningPointId: LP.P2, difficulty: 'facile',
    statement: 'حل كل معادلة مما يلي: $9 - 4x = 0$ ، $\\dfrac{-x + 5}{3} = \\dfrac{x + 1}{2}$ ، $3x - \\dfrac{1}{2} = \\dfrac{x}{4} + 5$ .',
    ...F('$9 - 4x = 0$ ، الحل:', '9/4', 'نطرح 9 من الطرفين: $-4x = -9$ ، ثم نقسم على $-4$ : $x = \\dfrac{-9}{-4} = \\dfrac{9}{4}$.'),
    method: 'نجمع الأعداد في طرف والحد الذي فيه $x$ في الطرف الآخر، ثم نقسم على المعامل مع إشارته.',
    commonError: 'نسيان إشارة المعامل $-4$ عند القسمة: $x = -\\dfrac{9}{4}$.',
  },
  {
    id: 'now-47-1-b', source: NOW_SRC, learningPointId: LP.P2, difficulty: 'difficile',
    ...F('$\\dfrac{-x + 5}{3} = \\dfrac{x + 1}{2}$ ، الحل:', '7/5', 'نضرب الطرفين في 6: $2(-x + 5) = 3(x + 1)$ أي $-2x + 10 = 3x + 3$ ، ومنه $7 = 5x$ و $x = \\dfrac{7}{5}$.'),
    method: 'نضرب الطرفين في العدد نفسه 6 لنتخلّص من المقامات، ثم ننشر.',
    commonError: 'ضرب البسطين فقط دون نشر: $-x + 5 \\times 2 = \\dots$ بدل $2(-x + 5)$.',
  },
  {
    id: 'now-47-1-c', source: NOW_SRC, learningPointId: LP.P2, difficulty: 'difficile',
    ...F('$3x - \\dfrac{1}{2} = \\dfrac{x}{4} + 5$ ، الحل:', '2', 'نضرب الطرفين في 4: $12x - 2 = x + 20$ أي $11x = 22$ ، ومنه $x = 2$.'),
    method: 'نضرب كل حدود الطرفين في 4، ثم ننقل المجاهيل إلى طرف والمعاليم إلى الآخر.',
    commonError: 'ضرب حدّ واحد فقط في 4: كل حدود الطرفين تُضرب.',
  },
];

/* ── Module 4 — أوظّف تعلّماتي ─────────────────────────────────────────────── */
const SOLVE = 'حل كل معادلة من المعادلات المقترحة:';
export const EXERCISES = [
  // 1 — ax = b
  { id: 'ex-1-a', source: E(1), learningPointId: LP.P1, difficulty: 'facile', statement: SOLVE,
    items: ['$3x = 14$', '$-4x = 7$', '$1{,}5x = 4{,}5$', '$\\dfrac{x}{3} = 8$'],
    ...F('$3x = 14$ ، الحل:', '14/3', '$ax = b$ مع $a = 3$ و $b = 14$ : $x = \\dfrac{14}{3}$.'),
    method: 'المعادلة من الشكل $ax = b$ : نقسم الطرفين على $a$.',
    commonError: 'قلب حاصل القسمة: $x = \\dfrac{3}{14}$.' },
  { id: 'ex-1-b', source: E(1), learningPointId: LP.P1, difficulty: 'facile',
    ...F('$-4x = 7$ ، الحل:', '-7/4', 'نقسم الطرفين على $-4$ : $x = \\dfrac{7}{-4} = -\\dfrac{7}{4}$.'),
    commonError: 'إهمال إشارة المعامل: $x = \\dfrac{7}{4}$.' },
  { id: 'ex-1-c', source: E(1), learningPointId: LP.P1, difficulty: 'facile',
    ...F('$1{,}5x = 4{,}5$ ، الحل:', '3', '$x = \\dfrac{4{,}5}{1{,}5} = 3$.'),
    commonError: 'قسمة 1,5 على 4,5 بدل العكس: $x = \\dfrac{1{,}5}{4{,}5} = \\dfrac{1}{3}$.' },
  { id: 'ex-1-d', source: E(1), learningPointId: LP.P1, difficulty: 'moyen',
    ...F('$\\dfrac{x}{3} = 8$ ، الحل:', '24', '$\\dfrac{x}{3} = \\dfrac{1}{3}x$ : نضرب الطرفين في 3، $x = 24$.'),
    commonError: 'القسمة على 3 بدل الضرب: $x = \\dfrac{8}{3}$.' },
  // 2 — puissances
  { id: 'ex-2-a', source: E(2), learningPointId: LP.P1, difficulty: 'facile', statement: SOLVE,
    items: ['$10x = 10^3$', '$10^6x = 10^4$', '$3^2x = 3^4$'],
    ...F('$10x = 10^3$ ، الحل:', '100', '$x = \\dfrac{10^3}{10} = 10^2 = 100$.') },
  { id: 'ex-2-b', source: E(2), learningPointId: LP.P1, difficulty: 'moyen',
    ...F('$10^6x = 10^4$ ، الحل:', '1/100', '$x = \\dfrac{10^4}{10^6} = \\dfrac{1}{10^2} = \\dfrac{1}{100}$ (أي $0{,}01$).'),
    commonError: 'قلب حاصل القسمة: $x = \\dfrac{10^6}{10^4} = 100$.' },
  { id: 'ex-2-c', source: E(2), learningPointId: LP.P1, difficulty: 'facile',
    ...F('$3^2x = 3^4$ ، الحل:', '9', '$x = \\dfrac{3^4}{3^2} = 3^2 = 9$.') },
  // 3 — x + b = c
  { id: 'ex-3-a', source: E(3), learningPointId: LP.P2, difficulty: 'facile', statement: SOLVE,
    items: ['$x + 12 = 4$', '$x - 7 = 7$', '$\\sqrt{3} - x = 2 - \\sqrt{3}$', '$2{,}6 + x = 4$'],
    ...F('$x + 12 = 4$ ، الحل:', '-8', 'نطرح 12 من الطرفين: $x = 4 - 12 = -8$.'),
    method: 'نطرح العدد نفسه من الطرفين (أو نضيفه) ليبقى $x$ وحده.',
    commonError: 'نقل 12 دون تغيير إشارته: $x = 4 + 12 = 16$.' },
  { id: 'ex-3-b', source: E(3), learningPointId: LP.P2, difficulty: 'facile',
    ...F('$x - 7 = 7$ ، الحل:', '14', 'نضيف 7 إلى الطرفين: $x = 7 + 7 = 14$.'),
    commonError: 'طرح 7 بدل إضافته: $x = 7 - 7 = 0$ ، لكنّ $0 - 7 \\neq 7$ .' },
  { id: 'ex-3-c', source: E(3), learningPointId: LP.P2, difficulty: 'difficile',
    ...C('$\\sqrt{3} - x = 2 - \\sqrt{3}$ ، الحل:', ['$2 - 2\\sqrt{3}$', '$2\\sqrt{3} - 2$', '$2$'], 1,
      'نطرح $\\sqrt{3}$ من الطرفين: $-x = 2 - 2\\sqrt{3}$ ، ثم نضرب في $-1$ : $x = 2\\sqrt{3} - 2$.'),
    commonError: 'نسيان أنّ $-x = 2 - 2\\sqrt{3}$ يعطي $x = -(2 - 2\\sqrt{3})$.' },
  { id: 'ex-3-d', source: E(3), learningPointId: LP.P2, difficulty: 'facile',
    ...F('$2{,}6 + x = 4$ ، الحل:', '7/5', 'نطرح 2,6 من الطرفين: $x = 4 - 2{,}6 = 1{,}4 = \\dfrac{7}{5}$.') },
  // 4 — ax + b = cx + d
  { id: 'ex-4-a', source: E(4), learningPointId: LP.P2, difficulty: 'facile', statement: SOLVE,
    items: ['$4x + 9 = 17$', '$x - 5 = 2x + 3$', '$3x - 4 = -x + 6$', '$4x + 9 = 9x + 4$'],
    ...F('$4x + 9 = 17$ ، الحل:', '2', '$4x = 17 - 9 = 8$ ، ومنه $x = 2$.') },
  { id: 'ex-4-b', source: E(4), learningPointId: LP.P2, difficulty: 'moyen',
    ...F('$x - 5 = 2x + 3$ ، الحل:', '-8', 'نطرح $2x$ من الطرفين: $-x - 5 = 3$ ، ثم نضيف 5: $-x = 8$ ، فـ $x = -8$.'),
    method: 'ننقل المجاهيل إلى طرف والمعاليم إلى الطرف الآخر، ثم نجمع الحدود المتشابهة.',
    commonError: 'جمع $x$ و $2x$ بدل طرح أحدهما من الطرفين: $3x = 8$.' },
  { id: 'ex-4-c', source: E(4), learningPointId: LP.P2, difficulty: 'moyen',
    ...F('$3x - 4 = -x + 6$ ، الحل:', '5/2', 'نضيف $x$ و 4 إلى الطرفين: $4x = 10$ ، ومنه $x = \\dfrac{10}{4} = \\dfrac{5}{2}$.'),
    commonError: 'نقل $-x$ دون تغيير إشارته: $2x = 10$.' },
  { id: 'ex-4-d', source: E(4), learningPointId: LP.P2, difficulty: 'moyen',
    ...F('$4x + 9 = 9x + 4$ ، الحل:', '1', '$9 - 4 = 9x - 4x$ أي $5 = 5x$ ، ومنه $x = 1$.') },
  // 5 — coefficients avec √
  { id: 'ex-5-a', source: E(5), learningPointId: LP.P1, difficulty: 'moyen', statement: 'حل كل معادلة من المعادلات الآتية:',
    items: ['$\\sqrt{3}x = \\sqrt{12}$', '$3\\sqrt{2}x = \\sqrt{2}x + \\sqrt{50}$', '$\\sqrt{3}x + \\sqrt{12}x = 2\\sqrt{3} + 7\\sqrt{3}$', '$\\dfrac{1}{\\sqrt{3}}x - \\dfrac{1}{3}x = \\dfrac{2}{\\sqrt{3} + 1}$', '$3\\sqrt{2}x - \\dfrac{\\sqrt{2}}{2}x = \\dfrac{\\sqrt{2}}{4}$'],
    ...F('$\\sqrt{3}x = \\sqrt{12}$ ، الحل:', '2', '$x = \\dfrac{\\sqrt{12}}{\\sqrt{3}} = \\sqrt{4} = 2$.') },
  { id: 'ex-5-b', source: E(5), learningPointId: LP.P2, difficulty: 'moyen',
    ...F('$3\\sqrt{2}x = \\sqrt{2}x + \\sqrt{50}$ ، الحل:', '5/2', 'نطرح $\\sqrt{2}x$ من الطرفين: $2\\sqrt{2}x = \\sqrt{50} = 5\\sqrt{2}$ ، ومنه $x = \\dfrac{5}{2}$.') },
  { id: 'ex-5-c', source: E(5), learningPointId: LP.P2, difficulty: 'moyen',
    ...F('$\\sqrt{3}x + \\sqrt{12}x = 2\\sqrt{3} + 7\\sqrt{3}$ ، الحل:', '3', '$\\sqrt{12} = 2\\sqrt{3}$ : $3\\sqrt{3}x = 9\\sqrt{3}$ ، ومنه $x = 3$.') },
  { id: 'ex-5-d', source: E(5), learningPointId: LP.P1, difficulty: 'difficile',
    ...F('$\\dfrac{1}{\\sqrt{3}}x - \\dfrac{1}{3}x = \\dfrac{2}{\\sqrt{3} + 1}$ ، الحل:', '3', '$\\dfrac{1}{\\sqrt{3}} - \\dfrac{1}{3} = \\dfrac{\\sqrt{3} - 1}{3}$ و $\\dfrac{2}{\\sqrt{3} + 1} = \\sqrt{3} - 1$ : $\\dfrac{\\sqrt{3} - 1}{3}x = \\sqrt{3} - 1$ ، ومنه $x = 3$.') },
  { id: 'ex-5-e', source: E(5), learningPointId: LP.P1, difficulty: 'difficile',
    ...F('$3\\sqrt{2}x - \\dfrac{\\sqrt{2}}{2}x = \\dfrac{\\sqrt{2}}{4}$ ، الحل:', '1/10', '$\\left(3 - \\dfrac{1}{2}\\right)\\sqrt{2}x = \\dfrac{5}{2}\\sqrt{2}x = \\dfrac{\\sqrt{2}}{4}$ ، ومنه $x = \\dfrac{1}{4} \\times \\dfrac{2}{5} = \\dfrac{1}{10}$.') },
  // 6
  { id: 'ex-6-1', source: E(6), learningPointId: LP.P2, difficulty: 'moyen',
    statement: '1) انشر العبارة وبسطها $3x + 20 - 4(x - 3)$ . 2) حل المعادلة $3x + 20 - 4(x - 3) = 50$ .',
    ...C('1) $3x + 20 - 4(x - 3) = $', ['$-x + 8$', '$-x + 32$', '$-x + 17$'], 1,
      '$3x + 20 - 4x + 12 = -x + 32$ : $-4 \\times (-3) = +12$.', 3),
    commonError: 'نسيان أنّ $-4 \\times (-3) = +12$ : $-x + 8$.' },
  { id: 'ex-6-2', source: E(6), learningPointId: LP.P2, difficulty: 'moyen',
    ...F('2) حل المعادلة $3x + 20 - 4(x - 3) = 50$ ، الحل:', '-18', '$-x + 32 = 50$ أي $-x = 18$ ، ومنه $x = -18$.') },
  // 7
  { id: 'ex-7-1', source: E(7), learningPointId: LP.P2, difficulty: 'moyen',
    statement: '1) انشر كلا من العبارتين وبسطها $3(2x - 1) + 5$ و $4(x + 2) - x$ . 2) حل المعادلة $3(2x - 1) + 5 = 4(x + 2) - x$ .',
    interaction: 'batch',
    question: {
      prompt: '1) النشر والتبسيط:',
      rows: [
        { label: '$3(2x - 1) + 5 = $', options: ['$6x + 2$', '$6x + 8$', '$6x - 3$'], correct: 0, correction: '$6x - 3 + 5 = 6x + 2$' },
        { label: '$4(x + 2) - x = $', options: ['$3x + 2$', '$3x + 8$', '$5x + 8$'], correct: 1, correction: '$4x + 8 - x = 3x + 8$' },
      ],
    },
    commonError: 'ضرب الحد الأول وحده: $4(x + 2) = 4x + 2$.' },
  { id: 'ex-7-2', source: E(7), learningPointId: LP.P2, difficulty: 'moyen',
    ...F('2) حل المعادلة $3(2x - 1) + 5 = 4(x + 2) - x$ ، الحل:', '2', '$6x + 2 = 3x + 8$ أي $3x = 6$ ، ومنه $x = 2$.') },
  // 8
  { id: 'ex-8-a', source: E(8), learningPointId: LP.P2, difficulty: 'difficile', statement: 'حل كل معادلة من المعادلتين الآتيتين:',
    items: ['$\\dfrac{1}{2}(4x - 1) - 3\\left(\\dfrac{x}{3} - \\dfrac{1}{2}\\right) = 0$', '$9x^2 - 3(x + 4) - 2 - 3x(3x - 2) = 0$'],
    ...F('$\\dfrac{1}{2}(4x - 1) - 3\\left(\\dfrac{x}{3} - \\dfrac{1}{2}\\right) = 0$ ، الحل:', '-1', '$2x - \\dfrac{1}{2} - x + \\dfrac{3}{2} = 0$ أي $x + 1 = 0$ ، ومنه $x = -1$.') },
  { id: 'ex-8-b', source: E(8), learningPointId: LP.P2, difficulty: 'difficile',
    ...F('$9x^2 - 3(x + 4) - 2 - 3x(3x - 2) = 0$ ، الحل:', '14/3', '$9x^2 - 3x - 12 - 2 - 9x^2 + 6x = 3x - 14$ : الحدّان $9x^2$ يتلاشيان، $3x - 14 = 0$ ومنه $x = \\dfrac{14}{3}$.'),
    commonError: 'التوقّف عند $x^2$ : بعد النشر يتلاشى $9x^2 - 9x^2$ والمعادلة من الدرجة الأولى.' },
  // 9
  { id: 'ex-9-a', source: E(9), learningPointId: LP.P2, difficulty: 'moyen', statement: 'حل كل معادلة من المعادلات الآتية:',
    items: ['$\\dfrac{x - 2}{8} = \\dfrac{x + 1}{4}$', '$\\dfrac{1 + x}{2} = \\dfrac{2x + 5}{4}$', '$\\dfrac{x + 3}{6} = \\dfrac{1}{6} - \\dfrac{x}{3}$', '$x = \\dfrac{x + 5}{3} + 1$'],
    ...F('$\\dfrac{x - 2}{8} = \\dfrac{x + 1}{4}$ ، الحل:', '-4', 'نضرب الطرفين في 8: $x - 2 = 2(x + 1) = 2x + 2$ ، أي $-x = 4$ ومنه $x = -4$.') },
  { id: 'ex-9-b', source: E(9), learningPointId: LP.P2, difficulty: 'difficile',
    ...C('$\\dfrac{1 + x}{2} = \\dfrac{2x + 5}{4}$ :', ['$x = 0$', '$x = -\\dfrac{3}{2}$', 'لا يوجد أي عدد يحقّق المساواة'], 2,
      'نضرب الطرفين في 4: $2(1 + x) = 2x + 5$ أي $2 + 2x = 2x + 5$ ، ثم نطرح $2x$ من الطرفين: يبقى 2 في طرف و 5 في الآخر، و $2 \\neq 5$ مهما كان $x$ — لا يوجد أي عدد يحقّق المساواة.'),
    commonError: 'البحث عن قيمة لـ $x$ بعد أن يختفي من الطرفين: حين يبقى عددان مختلفان، لا يوجد أي عدد يحقّق المساواة.' },
  { id: 'ex-9-c', source: E(9), learningPointId: LP.P2, difficulty: 'difficile',
    ...F('$\\dfrac{x + 3}{6} = \\dfrac{1}{6} - \\dfrac{x}{3}$ ، الحل:', '-2/3', 'نضرب الطرفين في 6: $x + 3 = 1 - 2x$ ، أي $3x = -2$ ومنه $x = -\\dfrac{2}{3}$.') },
  { id: 'ex-9-d', source: E(9), learningPointId: LP.P2, difficulty: 'moyen',
    ...F('$x = \\dfrac{x + 5}{3} + 1$ ، الحل:', '4', 'نضرب الطرفين في 3: $3x = x + 5 + 3$ ، أي $2x = 8$ ومنه $x = 4$.'),
    commonError: 'ضرب الكسر وحده في 3 ونسيان الحد 1: $3x = x + 5 + 1$.' },
];

/** Les parties d'un exercice. */
export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));

/** Accès par id. */
export const EX = Object.fromEntries([...NOW_47_1, ...EXERCISES].map((ex) => [ex.id, ex]));
