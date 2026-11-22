import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 5,
 * leçon 1, 2026-11-12 ; dessin §5, verdict L1 / X6). Deux كفاءات en alternance : qima « قيمة عبارة بحرفين » (1 → 3 → 5 → 7 → 9, à réviser dans
 * `qimat-ibara-harfiya`, 3AM — le geste même des jauges) et hall « حلّ معادلة من الدرجة الأولى بمجهول واحد » (2 → 4 → 6 → 8 → 10, à réviser dans
 * `muadalat-darajat-ula`, 3AM : le `requires` du réseau). Écrites par la plateforme : les huit énoncés d'avant restent dans content/textbook.js
 * (PREP_ITEMS, source).
 * `check` (recalculé par content/prep.test.js) : { expr, x, y, value } — vrai ⇔ l'expression vaut `value` en (x ; y) ; { eq, at } — vrai ⇔ `at`
 * vérifie l'équation ; { eq, x, y } — vrai ⇔ (x ; y) vérifie l'équation à deux inconnues. Aucun nombre de la مسألة (content/forbidden.js), aucun
 * piège de l'ordre, aucun format « trois propositions ».
 */
export const PREP_LADDER = [
  { n: 1, skill: 'qima', level: 1, text: 'من أجل $x = 2$ و $y = 3$ : $x + y = 5$ .', answer: true, why: '$2 + 3 = 5$ .', check: { expr: 'x+y', x: '2', y: '3', value: '5' } },
  { n: 2, skill: 'hall', level: 1, text: 'حلّ المعادلة $x + 4 = 9$ هو العدد 5.', answer: true, why: '$5 + 4 = 9$ .', check: { eq: 'x+4=9', at: '5' } },
  { n: 3, skill: 'qima', level: 1, text: 'من أجل $x = 4$ و $y = 1$ : $2x + y = 9$ .', answer: true, why: '$2 \\times 4 + 1 = 8 + 1 = 9$ .', check: { expr: '2x+y', x: '4', y: '1', value: '9' } },
  { n: 4, skill: 'hall', level: 2, text: 'حلّ المعادلة $5x = 20$ هو العدد 15.', answer: false, why: 'نقسم على 5 ولا نطرح: $x = 20 \\div 5 = 4$ .', check: { eq: '5x=20', at: '15' } },
  { n: 5, skill: 'qima', level: 2, text: 'من أجل $x = 1$ و $y = 4$ : $3x - y = 1$ .', answer: false, why: '$3 \\times 1 - 4 = 3 - 4 = -1$ ، لا 1 .', check: { expr: '3x-y', x: '1', y: '4', value: '1' } },
  { n: 6, skill: 'hall', level: 2, text: 'حلّ المعادلة $2x + 3 = 11$ هو العدد 4.', answer: true, why: '$2 \\times 4 + 3 = 11$ .', check: { eq: '2x+3=11', at: '4' } },
  { n: 7, skill: 'qima', level: 3, text: 'من أجل $x = -2$ و $y = 3$ : $x - 2y = -8$ .', answer: true, why: '$-2 - 2 \\times 3 = -2 - 6 = -8$ .', check: { expr: 'x-2y', x: '-2', y: '3', value: '-8' } },
  { n: 8, skill: 'hall', level: 3, text: 'من أجل $x = 4$ ، المساواة $2x + y = 15$ تعطي $y = 11$ .', answer: false, why: '$2 \\times 4 + y = 15$ أي $8 + y = 15$ ومنه $y = 7$ .', check: { eq: '2x+y=15', x: '4', y: '11' } },
  { n: 9, skill: 'qima', level: 3, text: 'من أجل $x = \\dfrac{1}{2}$ و $y = -1$ : $4x + 3y = -1$ .', answer: true, why: '$4 \\times \\dfrac{1}{2} + 3 \\times (-1) = 2 - 3 = -1$ .', check: { expr: '4x+3y', x: '1/2', y: '-1', value: '-1' } },
  { n: 10, skill: 'hall', level: 3, text: 'حلّ المعادلة $4x - 1 = x + 8$ هو العدد 3.', answer: true, why: '$4 \\times 3 - 1 = 11$ و $3 + 8 = 11$ .', check: { eq: '4x-1=x+8', at: '3' } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
