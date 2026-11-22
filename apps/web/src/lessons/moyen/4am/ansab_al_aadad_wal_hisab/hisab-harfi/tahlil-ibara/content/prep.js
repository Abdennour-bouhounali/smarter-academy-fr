import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 3,
 * leçon 3, 2026-11-11 ; conseil du 2026-11-11, verdict L3.5). Les deux كفاءات alternent : nashr « النشر بالخاصية التوزيعية » (1 → 3 → 5 → 7 → 9,
 * à réviser dans `nashr-tabsit`, la leçon 1 de l'unité — ses items ont des x²) et huwiyat « المتطابقات الشهيرة » (2 → 4 → 6 → 8 → 10, à réviser
 * dans `mutatabiqat-shahira`). Analyser, c'est développer à l'envers : chaque affirmation est un DÉVELOPPEMENT. Écrites par la plateforme : les
 * huit énoncés d'avant restent dans content/textbook.js (PREP_ITEMS).
 * `check` (recalculé par content/prep.test.js) : { factors: [somme…], claim: somme } — vrai ⇔ le produit développé des facteurs ÉGALE la somme
 * annoncée (`samePolynomial`). L'item 7 est l'erreur « à moitié sortie » lue à l'envers (2x(3x − 4) ≠ 6x² − 4x).
 * Ni nombre ni écriture de la مسألة (10x² + 15x, 5x(2x + 3), PGCD(10 ; 15)…), ni analyse incomplète k(…) dont le crochet partage un x
 * (content/forbidden.js › incompleteFactor).
 */
export const PREP_LADDER = [
  { n: 1, skill: 'nashr', level: 1, text: '$3(x + 4) = 3x + 12$', answer: true, why: 'نضرب 3 في كل حدّ: $3 \\times x + 3 \\times 4 = 3x + 12$ .', check: { factors: ['3', 'x+4'], claim: '3x+12' } },
  { n: 2, skill: 'huwiyat', level: 1, text: '$(x + 1)^2 = x^2 + 2x + 1$', answer: true, why: '$(x + 1)^2 = x^2 + 2 \\times x \\times 1 + 1^2 = x^2 + 2x + 1$ .', check: { factors: ['x+1', 'x+1'], claim: 'x^2+2x+1' } },
  { n: 3, skill: 'nashr', level: 1, text: '$x(x + 7) = x^2 + 7x$', answer: true, why: '$x \\times x + x \\times 7 = x^2 + 7x$ .', check: { factors: ['x', 'x+7'], claim: 'x^2+7x' } },
  { n: 4, skill: 'huwiyat', level: 2, text: '$(x + 7)^2 = x^2 + 49$', answer: false, why: 'ينقص الحدّ المضاعف: $(x + 7)^2 = x^2 + 2 \\times x \\times 7 + 7^2 = x^2 + 14x + 49$ .', check: { factors: ['x+7', 'x+7'], claim: 'x^2+49' } },
  { n: 5, skill: 'nashr', level: 2, text: '$-3(x - 4) = -3x - 12$', answer: false, why: '$-3 \\times (-4) = 12$ : النشر الصحيح $-3x + 12$ .', check: { factors: ['-3', 'x-4'], claim: '-3x-12' } },
  { n: 6, skill: 'huwiyat', level: 2, text: '$(x - 7)(x + 7) = x^2 - 49$', answer: true, why: 'جداء مجموع حدّين وفرقهما: $x^2 - 7^2 = x^2 - 49$ .', check: { factors: ['x-7', 'x+7'], claim: 'x^2-49' } },
  { n: 7, skill: 'nashr', level: 3, text: '$2x(3x - 4) = 6x^2 - 4x$', answer: false, why: 'نضرب $2x$ في كل حدّ: $2x \\times 3x - 2x \\times 4 = 6x^2 - 8x$ ، لا $6x^2 - 4x$ .', check: { factors: ['2x', '3x-4'], claim: '6x^2-4x' } },
  { n: 8, skill: 'huwiyat', level: 3, text: '$(3x - 1)^2 = 9x^2 - 6x + 1$', answer: true, why: '$(3x)^2 - 2 \\times 3x \\times 1 + 1^2 = 9x^2 - 6x + 1$ .', check: { factors: ['3x-1', '3x-1'], claim: '9x^2-6x+1' } },
  { n: 9, skill: 'nashr', level: 3, text: '$(x + 3)(x - 4) = x^2 - x - 12$', answer: true, why: '$x^2 - 4x + 3x - 12 = x^2 - x - 12$ .', check: { factors: ['x+3', 'x-4'], claim: 'x^2-x-12' } },
  { n: 10, skill: 'huwiyat', level: 3, text: '$(2x + 5)^2 = 4x^2 + 25$', answer: false, why: 'ينقص الحدّ المضاعف: $(2x + 5)^2 = 4x^2 + 2 \\times 2x \\times 5 + 25 = 4x^2 + 20x + 25$ .', check: { factors: ['2x+5', '2x+5'], claim: '4x^2+25' } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
