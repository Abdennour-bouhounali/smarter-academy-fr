import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 2,
 * leçon 5, 2026-11-10). Les deux كفاءات alternent : huwiyat « النشر والخاصية التوزيعية » (1 → 3 → 5 → 7 → 9) et jidaa « جداء جذرين وجذر
 * a²b » (2 → 4 → 6 → 8 → 10). Écrites par la plateforme (indépendance du manuel) : les neuf énoncés d'avant restent dans content/textbook.js
 * (PREP_ITEMS).
 * `check` (recalculé par content/prep.test.js) :
 *   { kind: 'distrib', a, b, claim }     — « a(x + b) = ax + claim »
 *   { kind: 'collect', coefs, claim }    — « Σ coef·a = claim·a »
 *   { kind: 'expand', p, q, mid, c }     — « (x + p)(x + q) = x² + mid·x + c »
 *   { kind: 'prodRoot', a, b, claim }    — « √a × √b = claim » (claim entier, ou { rad } pour « √rad »)
 *   { kind: 'quotRoot', a, b, claim }    — « √a ÷ √b = claim » (entier)
 *   { kind: 'rootA2B', a2, b, claim }    — « √(a2 × b) = claim√b »
 * Aucun nombre de la مسألة (200, 10√2, 100, 50, 2√50, 5√8, 120, 12, 10, 25) ni de la ورقة زميل (96, 24, 6√…).
 */
export const PREP_LADDER = [
  { n: 1, skill: 'huwiyat', level: 1, text: '$3(x + 2) = 3x + 6$', answer: true, why: 'الخاصية التوزيعية: $3 \\times x + 3 \\times 2 = 3x + 6$.', check: { kind: 'distrib', a: 3, b: 2, claim: 6 } },
  { n: 2, skill: 'jidaa', level: 1, text: '$\\sqrt{3} \\times \\sqrt{3} = 3$', answer: true, why: '$\\sqrt{3} \\times \\sqrt{3} = \\sqrt{9} = 3$.', check: { kind: 'prodRoot', a: 3, b: 3, claim: 3 } },
  { n: 3, skill: 'huwiyat', level: 2, text: '$5a + 2a = 7a$', answer: true, why: 'بالخاصية التوزيعية: $5a + 2a = (5 + 2)a = 7a$.', check: { kind: 'collect', coefs: [5, 2], claim: 7 } },
  { n: 4, skill: 'jidaa', level: 2, text: '$\\sqrt{3} \\times \\sqrt{5} = \\sqrt{8}$', answer: false, why: 'نضرب العددين تحت الجذر، لا نجمعهما: $\\sqrt{3} \\times \\sqrt{5} = \\sqrt{15}$.', check: { kind: 'prodRoot', a: 3, b: 5, claim: { rad: 8 } } },
  { n: 5, skill: 'huwiyat', level: 3, text: '$4a - a = 3a$', answer: true, why: '$4a - a = (4 - 1)a = 3a$.', check: { kind: 'collect', coefs: [4, -1], claim: 3 } },
  { n: 6, skill: 'jidaa', level: 3, text: '$\\sqrt{63} \\div \\sqrt{7} = 3$', answer: true, why: '$\\sqrt{63} \\div \\sqrt{7} = \\sqrt{63 \\div 7} = \\sqrt{9} = 3$.', check: { kind: 'quotRoot', a: 63, b: 7, claim: 3 } },
  { n: 7, skill: 'huwiyat', level: 4, text: '$(x + 3)(x + 2) = x^2 + 6$', answer: false, why: 'ننشر الحدود الأربعة: $(x + 3)(x + 2) = x^2 + 2x + 3x + 6 = x^2 + 5x + 6$.', check: { kind: 'expand', p: 3, q: 2, mid: 0, c: 6 } },
  { n: 8, skill: 'jidaa', level: 4, text: '$\\sqrt{4 \\times 7} = 4\\sqrt{7}$', answer: false, why: 'جذر 4 هو 2، لا 4: $\\sqrt{4 \\times 7} = \\sqrt{2^2 \\times 7} = 2\\sqrt{7}$.', check: { kind: 'rootA2B', a2: 4, b: 7, claim: 4 } },
  { n: 9, skill: 'huwiyat', level: 5, text: '$(x + 3)^2 = x^2 + 9$', answer: false, why: 'ننسى الحدّ المضاعف: $(x + 3)^2 = x^2 + 6x + 9$.', check: { kind: 'expand', p: 3, q: 3, mid: 0, c: 9 } },
  { n: 10, skill: 'jidaa', level: 5, text: '$\\sqrt{9 \\times 7} = 3\\sqrt{7}$', answer: true, why: '$\\sqrt{9 \\times 7} = \\sqrt{3^2} \\times \\sqrt{7} = 3\\sqrt{7}$.', check: { kind: 'rootA2B', a2: 9, b: 7, claim: 3 } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
