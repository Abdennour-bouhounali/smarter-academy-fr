import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 2,
 * leçon 4, 2026-11-10). Les deux كفاءات alternent : quwa « مربّع جداء ومربّع حاصل قسمة » (1 → 3 → 5 → 7 → 9 : (ab)² = a²b², (a/b)² = a²/b²) et
 * jidhr « الجذر التربيعي » (2 → 4 → 6 → 8 → 10 : le nombre POSITIF dont le carré est a, et (√a)² = a). Écrites par la plateforme (indépendance
 * du manuel) : les six énoncés d'avant restent dans content/textbook.js (PREP_ITEMS).
 * `check` (recalculé par content/prep.test.js) :
 *   { kind: 'prodSq', a, b, claim }               — « (a × b)² = claim »
 *   { kind: 'quotSq', a: [p, q], claim: [r, s] }  — « (p/q)² = r/s »
 *   { kind: 'sqrt', a: [num, den], r: [num, den] }— « √a = r » : r ≥ 0 et r² = a
 *   { kind: 'sqOfRoot', a, claim }                — « (√a)² = claim »
 * Aucun nombre de la مسألة (180, 5 comme aire, 12, 36 dalles, 6√5, 2√3, 192, 45, 18, 90, 150) ; ni la somme 13 de la ورقة زميل du module 2
 * (4 et 9, trop petits pour être évités, y apparaissent seuls — jamais √(4 + 9)).
 */
export const PREP_LADDER = [
  { n: 1, skill: 'quwa', level: 1, text: '$(2 \\times 4)^2 = 64$', answer: true, why: '$2 \\times 4 = 8$ و $8^2 = 64$.', check: { kind: 'prodSq', a: 2, b: 4, claim: 64 } },
  { n: 2, skill: 'jidhr', level: 1, text: '$\\sqrt{49} = 7$', answer: true, why: '7 عدد موجب و $7^2 = 49$.', check: { kind: 'sqrt', a: [49, 1], r: [7, 1] } },
  { n: 3, skill: 'quwa', level: 2, text: '$(3 \\times 7)^2 = 441$', answer: true, why: '$(3 \\times 7)^2 = 3^2 \\times 7^2 = 9 \\times 49 = 441$.', check: { kind: 'prodSq', a: 3, b: 7, claim: 441 } },
  { n: 4, skill: 'jidhr', level: 2, text: '$\\sqrt{64} = 32$', answer: false, why: 'الجذر ليس النصف: $32^2 = 1024$. العدد الموجب الذي مربّعه 64 هو 8.', check: { kind: 'sqrt', a: [64, 1], r: [32, 1] } },
  { n: 5, skill: 'quwa', level: 3, text: '$(2 \\times 5)^2 = 50$', answer: false, why: 'نربّع العاملين معًا: $(2 \\times 5)^2 = 2^2 \\times 5^2 = 100$.', check: { kind: 'prodSq', a: 2, b: 5, claim: 50 } },
  { n: 6, skill: 'jidhr', level: 3, text: '$(\\sqrt{11})^2 = 11$', answer: true, why: '$\\sqrt{11}$ هو العدد الموجب الذي مربّعه 11.', check: { kind: 'sqOfRoot', a: 11, claim: 11 } },
  { n: 7, skill: 'quwa', level: 4, text: '$\\left(\\dfrac{3}{4}\\right)^2 = \\dfrac{9}{16}$', answer: true, why: 'نربّع البسط والمقام معًا: $3^2 = 9$ و $4^2 = 16$.', check: { kind: 'quotSq', a: [3, 4], claim: [9, 16] } },
  { n: 8, skill: 'jidhr', level: 4, text: '$\\sqrt{0{,}49} = 0{,}07$', answer: false, why: '$0{,}07^2 = 0{,}0049$. العدد الموجب الذي مربّعه 0,49 هو 0,7.', check: { kind: 'sqrt', a: [49, 100], r: [7, 100] } },
  { n: 9, skill: 'quwa', level: 5, text: '$\\left(\\dfrac{2}{3}\\right)^2 = \\dfrac{4}{3}$', answer: false, why: 'المقام يُربَّع أيضًا: $\\left(\\dfrac{2}{3}\\right)^2 = \\dfrac{4}{9}$.', check: { kind: 'quotSq', a: [2, 3], claim: [4, 3] } },
  { n: 10, skill: 'jidhr', level: 5, text: '$\\sqrt{\\dfrac{25}{4}} = \\dfrac{5}{2}$', answer: true, why: '$\\dfrac{5}{2}$ موجب و $\\left(\\dfrac{5}{2}\\right)^2 = \\dfrac{25}{4}$.', check: { kind: 'sqrt', a: [25, 4], r: [5, 2] } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
