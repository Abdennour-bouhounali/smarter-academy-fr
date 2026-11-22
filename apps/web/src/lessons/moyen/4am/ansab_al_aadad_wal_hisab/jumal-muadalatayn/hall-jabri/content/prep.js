import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes ; rollout de l'unité 5, leçon 2, 2026-11-12 ;
 * conseil du 2026-11-11, design L2 §5). Deux كفاءات en alternance : naql « نقل حدّ وضرب طرفي مساواة » (1 → 3 → 5 → 7 → 9, à réviser dans
 * `musawiyat-amaliyat`, 3AM) et taawid « تعويض قيمتين في عبارة بحرفين » (2 → 4 → 6 → 8 → 10, à réviser dans `qimat-ibara-harfiya`, 3AM).
 * Les huit énoncés d'avant restent dans content/textbook.js (PREP_ITEMS, la page de l'enseignant).
 * `check` (recalculé par content/prep.test.js) : { given, claim } — vrai ⇔ les deux équations en x et y sont ÉQUIVALENTES (proportionnelles) ;
 * { expr, at: [x, y], value } — vrai ⇔ l'expression vaut `value` en (x ; y), en fractions exactes.
 * Aucun nombre ni aucune écriture de la مسألة (content/forbidden.js), aucune jumla de manche, aucun moins devant une parenthèse (règle P).
 */
export const PREP_LADDER = [
  { n: 1, skill: 'naql', level: 1, text: 'إذا كان $x + y = 9$ فإنّ $y = 9 - x$ .', answer: true, why: 'نطرح $x$ من الطرفين.', check: { given: 'x+y=9', claim: 'y=9-x' } },
  { n: 2, skill: 'taawid', level: 1, text: 'من أجل $x = 4$ و $y = 1$ قيمة $x + y$ هي 5 .', answer: true, why: '$4 + 1 = 5$ .', check: { expr: 'x+y', at: ['4', '1'], value: '5' } },
  { n: 3, skill: 'naql', level: 1, text: 'إذا كان $x - y = 4$ فإنّ $3x - 3y = 12$ .', answer: true, why: 'نضرب الطرفين معًا في 3: $3 \\times 4 = 12$ .', check: { given: 'x-y=4', claim: '3x-3y=12' } },
  { n: 4, skill: 'taawid', level: 2, text: 'من أجل $x = 3$ و $y = 2$ قيمة $2x - y$ هي 8 .', answer: false, why: '$2 \\times 3 - 2 = 4$ ، لا 8 .', check: { expr: '2x-y', at: ['3', '2'], value: '8' } },
  { n: 5, skill: 'naql', level: 2, text: 'إذا كان $4x + y = 9$ فإنّ $y = 9 + 4x$ .', answer: false, why: 'نطرح $4x$ من الطرفين: $y = 9 - 4x$ .', check: { given: '4x+y=9', claim: 'y=9+4x' } },
  { n: 6, skill: 'taawid', level: 2, text: 'من أجل $x = -1$ و $y = 3$ قيمة $2x + 3y$ هي 7 .', answer: true, why: '$-2 + 9 = 7$ .', check: { expr: '2x+3y', at: ['-1', '3'], value: '7' } },
  { n: 7, skill: 'naql', level: 3, text: 'إذا كان $x - 2y = 3$ فإنّ $x = 3 + 2y$ .', answer: true, why: 'نضيف $2y$ إلى الطرفين.', check: { given: 'x-2y=3', claim: 'x=3+2y' } },
  { n: 8, skill: 'taawid', level: 3, text: 'من أجل $x = 2$ و $y = 3$ قيمة $5x - 2y$ هي 16 .', answer: false, why: '$10 - 6 = 4$ ؛ أمّا 16 فتجمع بدل أن تطرح.', check: { expr: '5x-2y', at: ['2', '3'], value: '16' } },
  { n: 9, skill: 'naql', level: 3, text: 'إذا كان $x + 3y = 2$ فإنّ $2x + 6y = 2$ .', answer: false, why: 'ضُرب طرف واحد في 2: الصواب $2x + 6y = 4$ .', check: { given: 'x+3y=2', claim: '2x+6y=2' } },
  { n: 10, skill: 'taawid', level: 3, text: 'من أجل $x = \\dfrac{1}{2}$ و $y = -2$ قيمة $4x - 3y$ هي 8 .', answer: true, why: '$4 \\times \\dfrac{1}{2} = 2$ و $3 \\times 2 = 6$ ، إذن $2 + 6 = 8$ .', check: { expr: '4x-3y', at: ['1/2', '-2'], value: '8' } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
