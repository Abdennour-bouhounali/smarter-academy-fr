import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 5,
 * leçon 3, 2026-11-12 ; design L3 §5, verdict §4 : les items 3, 7 et 9 changés). Les deux كفاءات alternent : hall « حلّ جملة والتحقّق من ثنائية »
 * (1 → 3 → 5 → 7 → 9, à réviser dans `hall-jabri`, le `requires` du réseau 4am.m5.r01) et tarjama « ترجمة جملة إلى عبارة أو معادلة »
 * (2 → 4 → 6 → 8 → 10, à réviser dans `tarrid-mushkila`, 4am.m3.r05). Les items d'avant restent dans content/textbook.js (PREP_ITEMS), inutilisés
 * par le lecteur. `check` (recalculé par content/prep.test.js) : `pair` = le couple affirmé vérifie-t-il CHAQUE équation ? `expr` = l'expression
 * affirmée égale-t-elle la vraie en plusieurs points ? `eq` = la valeur annoncée vérifie-t-elle l'équation affirmée ? Aucun nombre de la مسألة.
 */
const pairCheck = (eqs, pair) => ({ kind: 'pair', eqs, pair });

export const PREP_LADDER = [
  { n: 1, skill: 'hall', level: 1, text: 'الثنائية $(2 ; 5)$ تحقّق المعادلة $x + y = 7$ .', answer: true, why: '$2 + 5 = 7$ .', check: pairCheck([(x, y) => x + y === 7], [2, 5]) },
  { n: 2, skill: 'tarjama', level: 1, text: '«ثمن 4 كرّاسات بـ $x$ دينارًا للكرّاسة» يُكتب $4x$ .', answer: true, why: 'أربع مرّات ثمن الكرّاسة: $4x$ .', check: { kind: 'expr', claim: (x) => 4 * x, truth: (x) => 4 * x } },
  { n: 3, skill: 'hall', level: 1, text: 'الثنائية $(5 ; 1)$ حلّ للجملة $\\begin{cases} x + y = 6 \\\\ x - y = 4 \\end{cases}$ .', answer: true, why: '$5 + 1 = 6$ و $5 - 1 = 4$ : المعادلتان محقّقتان معًا.', check: pairCheck([(x, y) => x + y === 6, (x, y) => x - y === 4], [5, 1]) },
  { n: 4, skill: 'tarjama', level: 2, text: '«مجموع عددين $x$ و $y$ هو 12» يُكتب $xy = 12$ .', answer: false, why: 'المجموع ناتج الجمع: $x + y = 12$ ؛ أمّا $xy$ فهو جداؤهما.', check: { kind: 'expr2', claim: (x, y) => x * y, truth: (x, y) => x + y } },
  { n: 5, skill: 'hall', level: 2, text: 'الثنائية $(5 ; 5)$ حلّ للجملة $\\begin{cases} x + y = 10 \\\\ 2x + y = 16 \\end{cases}$ .', answer: false, why: '$5 + 5 = 10$ لكن $2 \\times 5 + 5 = 15$ لا $16$ : لا تكفي معادلة واحدة.', check: pairCheck([(x, y) => x + y === 10, (x, y) => 2 * x + y === 16], [5, 5]) },
  { n: 6, skill: 'tarjama', level: 2, text: '«$x$ كتابًا بـ 120 دج للكتاب و $y$ قلمًا بـ 30 دج للقلم، والمبلغ 600 دج» يُكتب $120x + 30y = 600$ .', answer: true, why: 'كل كتاب يُضرب في ثمنه وكل قلم في ثمنه، والمجموع 600 دج.', check: { kind: 'expr2', claim: (x, y) => 120 * x + 30 * y, truth: (x, y) => 120 * x + 30 * y } },
  { n: 7, skill: 'hall', level: 3, text: 'حلّ الجملة $\\begin{cases} x + 2y = 12 \\\\ x - y = 3 \\end{cases}$ هو $(6 ; 3)$ .', answer: true, why: '$6 + 2 \\times 3 = 12$ و $6 - 3 = 3$ .', check: pairCheck([(x, y) => x + 2 * y === 12, (x, y) => x - y === 3], [6, 3]) },
  { n: 8, skill: 'tarjama', level: 3, text: '«ثمن $x$ كيلوغرامًا من البرتقال بـ 160 دج للكيلوغرام» يُكتب $x + 160$ .', answer: false, why: 'كل كيلوغرام بـ 160 دج: $160x$ . من أجل $x = 2$ : $320$ لا $162$ .', check: { kind: 'expr', claim: (x) => x + 160, truth: (x) => 160 * x } },
  { n: 9, skill: 'hall', level: 3, text: 'حلّ الجملة $\\begin{cases} 2x + y = 17 \\\\ x - y = 4 \\end{cases}$ هو $(8 ; 1)$ .', answer: false, why: '$2 \\times 8 + 1 = 17$ لكن $8 - 1 = 7$ لا $4$ . الحلّ هو $(7 ; 3)$ .', check: pairCheck([(x, y) => 2 * x + y === 17, (x, y) => x - y === 4], [8, 1]) },
  { n: 10, skill: 'tarjama', level: 3, text: '«عدد $x$ إذا أضفنا إليه ربعه نجد 35» يُكتب $x + \\dfrac{x}{4} = 35$ .', answer: true, why: 'ربع العدد $\\dfrac{x}{4}$ ، يُضاف إلى العدد نفسه. ومنه $x = 28$ .', check: { kind: 'eq', lhs: (x) => x + x / 4, rhs: 35, x: 28 } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les jumal des items « hall » (pour la signature de la leçon : leur solution VRAIE, quoi que l'item affirme). */
export const PREP_SYSTEMS = [
  { n: 3, system: 'x+y=6|x-y=4' },
  { n: 5, system: 'x+y=10|2x+y=16' },
  { n: 7, system: 'x+2y=12|x-y=3' },
  { n: 9, system: '2x+y=17|x-y=4' },
];
