import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 2,
 * leçon 3, 2026-11-10). Les deux كفاءات alternent : murabba « مربّع عدد ومعاكسه » (1 → 3 → 5 → 7 → 9 : le carré d'un nombre négatif, d'une
 * fraction, d'un décimal) et jidhr « الجذر التربيعي » (2 → 4 → 6 → 8 → 10 : le nombre POSITIF dont le carré est a). Écrites par la plateforme
 * (indépendance du manuel) : les six énoncés d'avant restent dans content/textbook.js (PREP_ITEMS).
 * `check` (recalculé par content/prep.test.js) :
 *   { kind: 'sq', x: [num, den], y: [num, den] }     — « x² = y »
 *   { kind: 'sqrt', a: [num, den], r: [num, den] }   — « √a = r » : r ≥ 0 et r² = a
 * Aucun nombre de la مسألة (64 et 8 ; 0,09 et 0,3 ; 11 et 3,3 ; 36 et 6 ; les 42 élèves) ; ni 0,16 (la ورقة زميل du module 2).
 */
export const PREP_LADDER = [
  { n: 1, skill: 'murabba', level: 1, text: '$3^2 = 9$', answer: true, why: '$3^2 = 3 \\times 3 = 9$.', check: { kind: 'sq', x: [3, 1], y: [9, 1] } },
  { n: 2, skill: 'jidhr', level: 1, text: '$\\sqrt{49} = 7$', answer: true, why: '7 عدد موجب و $7^2 = 49$.', check: { kind: 'sqrt', a: [49, 1], r: [7, 1] } },
  { n: 3, skill: 'murabba', level: 2, text: '$(-4)^2 = 16$', answer: true, why: '$(-4) \\times (-4) = 16$: جداء عددين سالبين موجب.', check: { kind: 'sq', x: [-4, 1], y: [16, 1] } },
  { n: 4, skill: 'jidhr', level: 2, text: '$\\sqrt{144} = 72$', answer: false, why: 'الجذر ليس النصف: $72^2 = 5184$. العدد الموجب الذي مربّعه 144 هو 12.', check: { kind: 'sqrt', a: [144, 1], r: [72, 1] } },
  { n: 5, skill: 'murabba', level: 3, text: '$(-7)^2 = -49$', answer: false, why: '$(-7) \\times (-7) = 49$: مربّع عدد سالب موجب.', check: { kind: 'sq', x: [-7, 1], y: [-49, 1] } },
  { n: 6, skill: 'jidhr', level: 3, text: '$\\sqrt{0{,}81} = 0{,}9$', answer: true, why: '0,9 موجب و $0{,}9^2 = 0{,}81$.', check: { kind: 'sqrt', a: [81, 100], r: [9, 10] } },
  { n: 7, skill: 'murabba', level: 4, text: '$\\left(-\\dfrac{2}{3}\\right)^2 = \\dfrac{4}{9}$', answer: true, why: '$\\left(-\\dfrac{2}{3}\\right) \\times \\left(-\\dfrac{2}{3}\\right) = \\dfrac{4}{9}$.', check: { kind: 'sq', x: [-2, 3], y: [4, 9] } },
  { n: 8, skill: 'jidhr', level: 4, text: '$\\sqrt{(-3)^2} = -3$', answer: false, why: '$(-3)^2 = 9$، والجذر التربيعي عدد موجب: $\\sqrt{9} = 3$.', check: { kind: 'sqrt', a: [9, 1], r: [-3, 1] } },
  { n: 9, skill: 'murabba', level: 5, text: '$(-0{,}2)^2 = -0{,}04$', answer: false, why: '$(-0{,}2) \\times (-0{,}2) = 0{,}04$: المربّع لا يكون سالبًا.', check: { kind: 'sq', x: [-2, 10], y: [-4, 100] } },
  { n: 10, skill: 'jidhr', level: 5, text: '$\\sqrt{\\dfrac{9}{16}} = \\dfrac{3}{4}$', answer: true, why: '$\\dfrac{3}{4}$ موجب و $\\left(\\dfrac{3}{4}\\right)^2 = \\dfrac{9}{16}$.', check: { kind: 'sqrt', a: [9, 16], r: [3, 4] } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
