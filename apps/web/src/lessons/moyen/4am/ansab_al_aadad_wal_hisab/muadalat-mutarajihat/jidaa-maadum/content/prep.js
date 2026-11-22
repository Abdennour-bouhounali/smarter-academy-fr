import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 4,
 * leçon 2, 2026-11-11 ; conseil du 2026-11-11, verdict L2.9). Les deux كفاءات alternent : muadala « حل معادلة من الدرجة الأولى » (1 → 3 → 5 → 7 → 9, à
 * réviser dans `muadala-ula`, la leçon 1 de l'unité) et tahlil « تحليل عبارة جبرية » (2 → 4 → 6 → 8 → 10, à réviser dans `tahlil-ibara`, la leçon 3 de
 * l'unité 3). Écrites par la plateforme : content/textbook.js réexporte cette liste sous le nom PREP_ITEMS (le test d'unité la lit).
 * `check` (recalculé par content/prep.test.js) :
 *   { solve: 'x-7', claim: '7' }                      — vrai ⇔ le nombre annoncé ANNULE l'expression du premier degré (`linear.js`) ;
 *   { lhs: [[…facteurs]…], rhs: [[…facteurs]…] }      — vrai ⇔ la somme des produits développés de gauche ÉGALE celle de droite (`polynomials.js`).
 * Ni facteur, ni solution, ni valeur de la مسألة (voir content/forbidden.js), ni solution refusée par une situation, ni « produit = nombre non nul ».
 */
export const PREP_LADDER = [
  { n: 1, skill: 'muadala', level: 1, text: 'حل المعادلة $x - 7 = 0$ هو $7$ .', answer: true, why: '$7 - 7 = 0$ .', check: { solve: 'x-7', claim: '7' } },
  { n: 2, skill: 'tahlil', level: 1, text: '$5x + 10 = 5(x + 2)$', answer: true, why: '$5(x + 2) = 5x + 10$ .', check: { lhs: [['5x+10']], rhs: [['5', 'x+2']] } },
  { n: 3, skill: 'muadala', level: 1, text: 'حل المعادلة $5x = 0$ هو $0$ .', answer: true, why: '$5 \\times 0 = 0$ .', check: { solve: '5x', claim: '0' } },
  { n: 4, skill: 'tahlil', level: 2, text: '$x^2 - 8x = x(x - 8)$', answer: true, why: '$x(x - 8) = x^2 - 8x$ .', check: { lhs: [['x^2-8x']], rhs: [['x', 'x-8']] } },
  { n: 5, skill: 'muadala', level: 2, text: 'حل المعادلة $x + 9 = 0$ هو $9$ .', answer: false, why: '$9 + 9 = 18 \\neq 0$ ؛ الحلّ الصحيح $-9$ .', check: { solve: 'x+9', claim: '9' } },
  { n: 6, skill: 'tahlil', level: 2, text: '$x^2 - 4 = (x - 2)^2$', answer: false, why: '$(x - 2)^2 = x^2 - 4x + 4$ ؛ الصحيح $x^2 - 4 = (x - 2)(x + 2)$ .', check: { lhs: [['x^2-4']], rhs: [['x-2', 'x-2']] } },
  { n: 7, skill: 'muadala', level: 3, text: 'حل المعادلة $2x + 10 = 0$ هو $-5$ .', answer: true, why: '$2 \\times (-5) + 10 = 0$ .', check: { solve: '2x+10', claim: '-5' } },
  { n: 8, skill: 'tahlil', level: 3, text: '$(x + 2)(x - 5) + 3(x + 2) = (x + 2)(x - 2)$', answer: true, why: 'ننشر الطرفين: كلاهما يساوي $x^2 - 4$ .', check: { lhs: [['x+2', 'x-5'], ['3', 'x+2']], rhs: [['x+2', 'x-2']] } },
  { n: 9, skill: 'muadala', level: 3, text: 'حل المعادلة $5x - 2 = 0$ هو $\\dfrac{5}{2}$ .', answer: false, why: '$5 \\times \\dfrac{5}{2} - 2 = \\dfrac{21}{2} \\neq 0$ ؛ الحلّ الصحيح $\\dfrac{2}{5}$ .', check: { solve: '5x-2', claim: '5/2' } },
  { n: 10, skill: 'tahlil', level: 3, text: '$8x^2 - 6x = 2x(4x - 6)$', answer: false, why: '$2x(4x - 6) = 8x^2 - 12x$ ؛ الصحيح $8x^2 - 6x = 2x(4x - 3)$ .', check: { lhs: [['8x^2-6x']], rhs: [['2x', '4x-6']] } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
