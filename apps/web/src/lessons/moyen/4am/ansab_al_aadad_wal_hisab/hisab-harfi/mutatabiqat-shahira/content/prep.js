import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 3,
 * leçon 2, 2026-11-11 ; conseil du 2026-11-11). Les deux كفاءات alternent : nashr « نشر جداء قوسين وتبسيطه » (1 → 3 → 5 → 7 → 9, à réviser dans
 * `nashr-tabsit`, la leçon 1 de l'unité — la leçon qui l'ENSEIGNE) et murabba « مربّع عدد نسبي أو جداء » (2 → 4 → 6 → 8 → 10, à réviser dans
 * `quwat-adad-nisbi`, 3AM). Écrites par la plateforme (indépendance du manuel) : les huit énoncés d'avant restent dans content/textbook.js
 * (PREP_ITEMS), inutilisés par le lecteur.
 * `check` (recalculé par content/prep.test.js en plusieurs points) : `lhs(v)` et `rhs(v)` — les deux membres de l'égalité affirmée, `v` = { x } ;
 * l'affirmation est VRAIE ⇔ les deux membres sont égaux pour toutes les valeurs essayées.
 * Aucun nombre ni aucune écriture de la مسألة (27, 729, 720, 171, 900 ; x − 3 ; x² − 6x + 9, 6x − 9…), aucun carré mental ancré sur 30, aucune
 * identité de la leçon (on ne révise ici que ce qu'elle suppose).
 */
export const PREP_LADDER = [
  { n: 1, skill: 'nashr', level: 1, text: '$(x + 1)(x + 2) = x^2 + 3x + 2$', answer: true, why: 'كل حدّ من القوس الأول في كل حدّ من الثاني: $x^2 + 2x + x + 2 = x^2 + 3x + 2$ .', check: { lhs: (v) => (v.x + 1) * (v.x + 2), rhs: (v) => v.x ** 2 + 3 * v.x + 2 } },
  { n: 2, skill: 'murabba', level: 1, text: '$(-4)^2 = 16$', answer: true, why: '$(-4) \\times (-4) = 16$ : مربّع عدد سالب موجب.', check: { lhs: () => (-4) ** 2, rhs: () => 16 } },
  { n: 3, skill: 'nashr', level: 1, text: '$2x + 5x = 7x$', answer: true, why: 'حدّان متشابهان: نجمع معاملَيهما، $2 + 5 = 7$ .', check: { lhs: (v) => 2 * v.x + 5 * v.x, rhs: (v) => 7 * v.x } },
  { n: 4, skill: 'murabba', level: 2, text: '$(5x)^2 = 5x^2$', answer: false, why: 'المعامل يُربَّع أيضًا: $(5x)^2 = 5x \\times 5x = 25x^2$ .', check: { lhs: (v) => (5 * v.x) ** 2, rhs: (v) => 5 * v.x ** 2 } },
  { n: 5, skill: 'nashr', level: 2, text: '$(x + 4)(x - 1) = x^2 - 4$', answer: false, why: 'نسينا منطقتين: $x^2 - x + 4x - 4 = x^2 + 3x - 4$ .', check: { lhs: (v) => (v.x + 4) * (v.x - 1), rhs: (v) => v.x ** 2 - 4 } },
  { n: 6, skill: 'murabba', level: 2, text: '$(-0{,}5)^2 = 0{,}25$', answer: true, why: '$(-0{,}5) \\times (-0{,}5) = 0{,}25$ .', check: { lhs: () => (-0.5) ** 2, rhs: () => 0.25 } },
  { n: 7, skill: 'nashr', level: 3, text: '$(2x + 1)(x + 5) = 2x^2 + 11x + 5$', answer: true, why: '$2x^2 + 10x + x + 5 = 2x^2 + 11x + 5$ .', check: { lhs: (v) => (2 * v.x + 1) * (v.x + 5), rhs: (v) => 2 * v.x ** 2 + 11 * v.x + 5 } },
  { n: 8, skill: 'murabba', level: 3, text: '$(-2x)^2 = -4x^2$', answer: false, why: '$(-2x) \\times (-2x) = 4x^2$ : المربّع موجب.', check: { lhs: (v) => (-2 * v.x) ** 2, rhs: (v) => -4 * v.x ** 2 } },
  { n: 9, skill: 'nashr', level: 3, text: '$(x - 2)(x - 5) = x^2 - 7x - 10$', answer: false, why: '$(-2) \\times (-5) = +10$ : النشر الصحيح $x^2 - 7x + 10$ .', check: { lhs: (v) => (v.x - 2) * (v.x - 5), rhs: (v) => v.x ** 2 - 7 * v.x - 10 } },
  { n: 10, skill: 'murabba', level: 3, text: '$(2 \\times 10^3)^2 = 4 \\times 10^6$', answer: true, why: '$2^2 \\times (10^3)^2 = 4 \\times 10^6$ : كل عامل يُربَّع.', check: { lhs: () => (2 * 10 ** 3) ** 2, rhs: () => 4 * 10 ** 6 } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
