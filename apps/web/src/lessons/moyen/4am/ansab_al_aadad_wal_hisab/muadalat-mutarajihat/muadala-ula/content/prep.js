import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 4,
 * leçon 1, 2026-11-11 ; conseil du 2026-11-11, verdict L1.8). Deux كفاءات en alternance : musawat « العملية نفسها على طرفي مساواة » (1 → 3 → 5 → 7 → 9,
 * à réviser dans `musawiyat-amaliyat`, 3AM) et hall « هل العدد حلّ للمعادلة؟ » (2 → 4 → 6 → 8 → 10, à réviser dans `muadalat-darajat-ula`, 3AM : la
 * leçon d'origine de l'item de programme de celle-ci). Écrites par la plateforme : les six énoncés d'avant restent dans content/textbook.js (PREP_ITEMS).
 * `check` (recalculé par content/prep.test.js) : { eq, at } — vrai ⇔ les deux membres de l'équation ont la MÊME valeur en `at` (fractions exactes) ;
 * { lhs, rhs } — la conclusion d'une affirmation sur a = b, une fois b remplacé par a : vrai ⇔ les deux membres sont IDENTIQUES en a (écrits en x).
 * Aucun nombre ni aucune écriture de la مسألة (content/forbidden.js), ni le x ni l'équation des manches (la solution des équations 8 et 10 n'est pas imprimée).
 */
export const PREP_LADDER = [
  { n: 1, skill: 'musawat', level: 1, text: 'إذا كان $a = b$ فإن $a + 5 = b + 5$ .', answer: true, why: 'نضيف العدد نفسه إلى الطرفين.', check: { lhs: 'x+5', rhs: 'x+5' } },
  { n: 2, skill: 'hall', level: 1, text: 'العدد 3 حلّ للمعادلة $x + 4 = 7$ .', answer: true, why: '$3 + 4 = 7$ .', check: { eq: 'x+4=7', at: '3' } },
  { n: 3, skill: 'musawat', level: 1, text: 'إذا كان $a = b$ فإن $3a = 3b$ .', answer: true, why: 'نضرب الطرفين في العدد نفسه.', check: { lhs: '3x', rhs: '3x' } },
  { n: 4, skill: 'hall', level: 2, text: 'العدد 2 حلّ للمعادلة $3x - 1 = 7$ .', answer: false, why: '$3 \\times 2 - 1 = 5$ ، لا 7 .', check: { eq: '3x-1=7', at: '2' } },
  { n: 5, skill: 'musawat', level: 2, text: 'إذا كان $a = b$ فإن $a - 4 = b + 4$ .', answer: false, why: 'عمليتان مختلفتان: مثلًا $a = b = 1$ : $1 - 4 = -3$ و $1 + 4 = 5$ .', check: { lhs: 'x-4', rhs: 'x+4' } },
  { n: 6, skill: 'hall', level: 2, text: 'العدد $-2$ حلّ للمعادلة $4x + 9 = 1$ .', answer: true, why: '$4 \\times (-2) + 9 = -8 + 9 = 1$ .', check: { eq: '4x+9=1', at: '-2' } },
  { n: 7, skill: 'musawat', level: 3, text: 'إذا كان $a + 3 = b$ فإن $a = b - 3$ .', answer: true, why: 'نطرح 3 من الطرفين.', check: { lhs: 'x', rhs: 'x+3-3' } },
  { n: 8, skill: 'hall', level: 3, text: 'العدد 4 حلّ للمعادلة $2x + 1 = x + 6$ .', answer: false, why: '$2 \\times 4 + 1 = 9$ و $4 + 6 = 10$ .', check: { eq: '2x+1=x+6', at: '4' } },
  { n: 9, skill: 'musawat', level: 3, text: 'إذا كان $a = b$ فإن $2a = b + 2$ .', answer: false, why: 'ضربنا طرفًا في 2 وأضفنا 2 إلى الآخر: مثلًا $a = b = 1$ : $2$ و $3$ .', check: { lhs: '2x', rhs: 'x+2' } },
  { n: 10, skill: 'hall', level: 3, text: 'العدد $\\dfrac{1}{2}$ حلّ للمعادلة $4x + 1 = 8x - 1$ .', answer: true, why: '$4 \\times \\dfrac{1}{2} + 1 = 3$ و $8 \\times \\dfrac{1}{2} - 1 = 3$ .', check: { eq: '4x+1=8x-1', at: '1/2' } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
