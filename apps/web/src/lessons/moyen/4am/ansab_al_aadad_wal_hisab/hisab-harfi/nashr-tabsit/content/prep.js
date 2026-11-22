import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 3,
 * leçon 1, 2026-11-11 ; conseil du 2026-11-11). Les deux كفاءات alternent : nashr « النشر بالخاصية التوزيعية » (1 → 3 → 5 → 7 → 9, à réviser dans
 * `nashr-jabri-3am`, 3AM — la leçon qui l'ENSEIGNE) et tabsit « تبسيط عبارة وحذف الأقواس » (2 → 4 → 6 → 8 → 10, à réviser dans
 * `tabsit-hadhf-aqwas`, 3AM). Écrites par la plateforme (indépendance du manuel) : les items d'avant restent dans content/textbook.js
 * (PREP_ITEMS, PREP_PLATFORM_ITEMS), inutilisés par le lecteur.
 * `check` (recalculé par content/prep.test.js en plusieurs points) : `lhs(v)` et `rhs(v)` — les deux membres de l'égalité affirmée, `v` = { a, b,
 * c, x, y } ; l'affirmation est VRAIE ⇔ les deux membres sont égaux pour toutes les valeurs essayées.
 * Aucun nombre ni aucune forme de la مسألة (1820, 1760, 1944, 124, 186000, 1500, 350 ; 2x + 10, x − 4, 2x + 12, x − 3 ; 2x² + 2x − 40…) ; aucun
 * couple de termes croisés opposés qui se réduisent (la méthode de la مسألة). Supprimer des parenthèses précédées de « − » reste permis ici :
 * c'est l'acquis de 3AM.
 */
export const PREP_LADDER = [
  { n: 1, skill: 'nashr', level: 1, text: '$3(x + 2) = 3x + 6$', answer: true, why: 'العدد $3$ يُضرب في الحدّين: $3 \\times x + 3 \\times 2 = 3x + 6$ .', check: { lhs: (v) => 3 * (v.x + 2), rhs: (v) => 3 * v.x + 6 } },
  { n: 2, skill: 'tabsit', level: 1, text: '$5x + 2x = 7x$', answer: true, why: 'حدّان متشابهان: نجمع معاملَيهما، $5 + 2 = 7$ .', check: { lhs: (v) => 5 * v.x + 2 * v.x, rhs: (v) => 7 * v.x } },
  { n: 3, skill: 'nashr', level: 1, text: '$2(a - 3) = 2a - 6$', answer: true, why: '$2 \\times a - 2 \\times 3 = 2a - 6$ .', check: { lhs: (v) => 2 * (v.a - 3), rhs: (v) => 2 * v.a - 6 } },
  { n: 4, skill: 'tabsit', level: 2, text: '$x \\times x = 2x$', answer: false, why: '$x \\times x = x^2$ ، أمّا $x + x = 2x$ . من أجل $x = 5$ : $25$ لا $10$ .', check: { lhs: (v) => v.x * v.x, rhs: (v) => 2 * v.x } },
  { n: 5, skill: 'nashr', level: 2, text: '$-2(y - 3) = -2y - 6$', answer: false, why: 'العدد $-2$ يُضرب في $-3$ أيضًا: $(-2) \\times (-3) = 6$ ، إذن $-2(y - 3) = -2y + 6$ .', check: { lhs: (v) => -2 * (v.y - 3), rhs: (v) => -2 * v.y - 6 } },
  { n: 6, skill: 'tabsit', level: 2, text: '$9 - (y + 2) = 7 - y$', answer: true, why: 'قوسان مسبوقان بـ $-$ : تتغيّر إشارة كل حدّ، $9 - y - 2 = 7 - y$ .', check: { lhs: (v) => 9 - (v.y + 2), rhs: (v) => 7 - v.y } },
  { n: 7, skill: 'nashr', level: 3, text: '$(2 + 5)(3 + 1) = 2 \\times 3 + 5 \\times 1$', answer: false, why: '$(2 + 5)(3 + 1) = 7 \\times 4 = 28$ ، و $2 \\times 3 + 5 \\times 1 = 11$ : نسينا جداءين، $2 \\times 1$ و $5 \\times 3$ .', check: { lhs: () => (2 + 5) * (3 + 1), rhs: () => 2 * 3 + 5 * 1 } },
  { n: 8, skill: 'tabsit', level: 3, text: '$a - (b - c) = a - b - c$', answer: false, why: 'الإشارة $-$ تغيّر إشارة الحدّين: $a - (b - c) = a - b + c$ .', check: { lhs: (v) => v.a - (v.b - v.c), rhs: (v) => v.a - v.b - v.c } },
  { n: 9, skill: 'nashr', level: 3, text: '$(a + 2)(b - 3) = ab - 3a + 2b - 6$', answer: true, why: 'كل حدّ من القوس الأول في كل حدّ من الثاني: $a \\times b$ ، $a \\times (-3)$ ، $2 \\times b$ و $2 \\times (-3)$ .', check: { lhs: (v) => (v.a + 2) * (v.b - 3), rhs: (v) => v.a * v.b - 3 * v.a + 2 * v.b - 6 } },
  { n: 10, skill: 'tabsit', level: 3, text: '$4x^2 + 3x - x^2 - 5x = 3x^2 - 2x$', answer: true, why: '$4x^2 - x^2 = 3x^2$ و $3x - 5x = -2x$ : لا نجمع $x^2$ مع $x$ .', check: { lhs: (v) => 4 * v.x ** 2 + 3 * v.x - v.x ** 2 - 5 * v.x, rhs: (v) => 3 * v.x ** 2 - 2 * v.x } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
