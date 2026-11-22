import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 4,
 * leçon 4, 2026-11-11 ; conseil du 2026-11-11, L4.6). Les deux كفاءات alternent : hall « حلّ معادلة من الدرجة الأولى » (1 → 3 → 5 → 7 → 9, à réviser dans
 * `muadala-ula`) et tarjama « ترجمة جملة إلى عبارة حرفية » (2 → 4 → 6 → 8 → 10, à réviser dans `muadalat-darajat-ula`, 3AM : la leçon que le réseau nomme
 * pour « ترييض مشكلات »). Les items d'avant restent dans content/textbook.js (PREP_ITEMS), inutilisés par le lecteur.
 * `check` (recalculé par content/prep.test.js) : `solves` = la valeur affirmée résout-elle l'équation ? ; `expr` = l'expression affirmée égale-t-elle la
 * vraie, en plusieurs points ? Aucun nombre de la مسألة (content/forbidden.js) : ni 7, ni −2 comme solution, ni 44, 39, 5, 9, 16.
 */
export const PREP_LADDER = [
  { n: 1, skill: 'hall', level: 1, text: 'العدد $6$ حلّ للمعادلة $x + 4 = 10$ .', answer: true, why: 'من أجل $x = 6$ : $6 + 4 = 10$ .', check: { kind: 'solves', lhs: (x) => x + 4, rhs: () => 10, x: 6 } },
  { n: 2, skill: 'tarjama', level: 1, text: '«عدد زائد 3» يُكتب $x + 3$ .', answer: true, why: 'الزيادة تُجمع: $x + 3$ .', check: { kind: 'expr', claim: (x) => x + 3, truth: (x) => x + 3 } },
  { n: 3, skill: 'hall', level: 1, text: 'حلّ المعادلة $3x = 12$ هو $x = 4$ .', answer: true, why: '$3 \\times 4 = 12$ .', check: { kind: 'solves', lhs: (x) => 3 * x, rhs: () => 12, x: 4 } },
  { n: 4, skill: 'tarjama', level: 2, text: '«ضعف عدد» يُكتب $x + 2$ .', answer: false, why: 'الضعف يعني الضرب في 2: $2x$ . من أجل $x = 4$ : $2x = 8$ لا $6$ .', check: { kind: 'expr', claim: (x) => x + 2, truth: (x) => 2 * x } },
  { n: 5, skill: 'hall', level: 2, text: 'حلّ المعادلة $x + 15 = 9$ هو $x = 6$ .', answer: false, why: '$x = 9 - 15 = -6$ . ومن أجل $6$ : $6 + 15 = 21$ لا $9$ .', check: { kind: 'solves', lhs: (x) => x + 15, rhs: () => 9, x: 6 } },
  { n: 6, skill: 'tarjama', level: 2, text: '«ثمن 3 أقلام بـ $x$ دينارًا للقلم وكرّاس بـ 40 دينارًا» يُكتب $3x + 40$ .', answer: true, why: 'ثمن الأقلام يتضاعف مع عددها، والكرّاس يُدفع مرة واحدة: $3x + 40$ .', check: { kind: 'expr', claim: (x) => 3 * x + 40, truth: (x) => 3 * x + 40 } },
  { n: 7, skill: 'hall', level: 3, text: 'حلّ المعادلة $4x - 3 = x + 15$ هو $x = 6$ .', answer: true, why: '$3x = 18$ أي $x = 6$ . تحقّق: $21 = 21$ .', check: { kind: 'solves', lhs: (x) => 4 * x - 3, rhs: (x) => x + 15, x: 6 } },
  { n: 8, skill: 'tarjama', level: 3, text: '«محيط مربّع ضلعه $x + 2$» يُكتب $4x + 2$ .', answer: false, why: 'الأربعة تضرب الضلع كله: $4(x + 2) = 4x + 8$ . من أجل $x = 1$ : $12$ لا $6$ .', check: { kind: 'expr', claim: (x) => 4 * x + 2, truth: (x) => 4 * (x + 2) } },
  { n: 9, skill: 'hall', level: 3, text: 'حلّ المعادلة $3(x + 2) = x + 14$ هو $x = 6$ .', answer: false, why: '$3x + 6 = x + 14$ أي $2x = 8$ ومنه $x = 4$ . ومن أجل $6$ : $24 \\neq 20$ .', check: { kind: 'solves', lhs: (x) => 3 * (x + 2), rhs: (x) => x + 14, x: 6 } },
  { n: 10, skill: 'tarjama', level: 3, text: '«قطعتا حبل: طول الأولى $x$ مترًا، والثانية أطول منها بـ 4 أمتار؛ طولهما معًا» يُكتب $2x + 4$ .', answer: true, why: '$x + (x + 4) = 2x + 4$ .', check: { kind: 'expr', claim: (x) => 2 * x + 4, truth: (x) => x + (x + 4) } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
