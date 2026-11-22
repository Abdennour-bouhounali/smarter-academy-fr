import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA SYNTHÈSE — l'ÉCHELLE de dix affirmations bâtie sur les leçons de l'unité (recette de la synthèse, point 3 ; pilote
 * `wadiya-idmajiya-talis`). Quatre كفاءات en cycle, une par leçon : muadala « حل معادلة » (1 → 5 → 9, à réviser dans `muadala-ula`), jidaa
 * « الجداء المعدوم » (2 → 6 → 10, `jidaa-maadum`), mutarajiha « المتراجحة » (3 → 7, `mutarajiha-ula`), tarrid « الترييض » (4 → 8,
 * `tarrid-mushkila`) — « راجع » n'est jamais vide. De très facile (énoncés de règles, les trois premières VRAIES) à plus difficile. Les sept
 * affirmations d'avant restent dans content/textbook.js (PREP_ITEMS) comme source. `check` (recalculé par content/prep.test.js) :
 *   { kind: 'rule', truth }               — un énoncé de règle
 *   { kind: 'identity', lhs, rhs }        — « lhs = rhs » pour TOUT x
 *   { kind: 'solution', lhs, rhs, x }     — x est LA solution de « lhs = rhs » (une équation du premier degré)
 *   { kind: 'roots', f, roots }           — les nombres annoncés annulent tous f (et ce sont tous ses zéros entiers sur [−50 ; 50])
 *   { kind: 'ineq', holds, claim }        — les solutions annoncées (`claim`) sont celles de l'inéquation (`holds`), comparées en plusieurs points
 * Aucun nombre du défi 🏆 ni de la وضعية du module 7 (content/forbidden.js, content/mission.test.js).
 */
export const PREP_LADDER = [
  { n: 1, skill: 'muadala', level: 1, text: 'إذا أضفنا العدد نفسه إلى طرفي معادلة، نحصل على معادلة لها الحلول نفسها.', answer: true,
    why: 'مثلًا $x - 3 = 4$ و $x - 3 + 3 = 4 + 3$ لهما الحلّ نفسه $x = 7$.', check: { kind: 'rule', truth: true } },
  { n: 2, skill: 'jidaa', level: 1, text: 'إذا كان $A \\times B = 0$ فإنّ $A = 0$ أو $B = 0$.', answer: true,
    why: 'جداء عاملين معدوم إذا كان أحدهما على الأقلّ معدومًا.', check: { kind: 'rule', truth: true } },
  { n: 3, skill: 'mutarajiha', level: 1, text: 'إذا ضربنا طرفي متراجحة في عدد سالب، يتغيّر اتجاهها.', answer: true,
    why: 'مثلًا $2 < 5$ ، وبالضرب في $-1$ نجد $-2 > -5$.', check: { kind: 'rule', truth: true } },
  { n: 4, skill: 'tarrid', level: 2, text: 'إذا كان ثمن قلم $x$ دج، فإنّ ثمن 3 أقلام وكرّاس ثمنه 40 دج هو $3(x + 40)$ .', answer: false,
    why: 'الكرّاس يُشترى مرّة واحدة: الثمن $3x + 40$ ، أمّا $3(x + 40)$ فثمن 3 أقلام و 3 كراريس.', check: { kind: 'identity', lhs: (x) => 3 * x + 40, rhs: (x) => 3 * (x + 40) } },
  { n: 5, skill: 'muadala', level: 2, text: 'حلّ المعادلة $4x - 9 = 2x + 5$ هو 7.', answer: true,
    why: '$4 \\times 7 - 9 = 19$ و $2 \\times 7 + 5 = 19$ : الطرفان متساويان.', check: { kind: 'solution', lhs: (x) => 4 * x - 9, rhs: (x) => 2 * x + 5, x: 7 } },
  { n: 6, skill: 'jidaa', level: 2, text: 'المعادلة $(x - 2)(3x + 12) = 0$ تقبل حلّين هما 2 و 4.', answer: false,
    why: '$3x + 12 = 0$ يعطي $x = -4$ لا 4: الحلّان هما 2 و $-4$.', check: { kind: 'roots', f: (x) => (x - 2) * (3 * x + 12), roots: [2, 4] } },
  { n: 7, skill: 'mutarajiha', level: 2, text: 'حلول المتراجحة $-3x < 12$ هي الأعداد $x$ حيث $x < -4$ .', answer: false,
    why: 'نقسم على $-3$ ، وهو سالب، فيتغيّر الاتجاه: $x > -4$.', check: { kind: 'ineq', holds: (x) => -3 * x < 12, claim: (x) => x < -4 } },
  { n: 8, skill: 'tarrid', level: 3, text: 'عمر أب اليوم 40 سنة وعمر ابنه 12 سنة. بعد $x$ سنة يصير عمر الأب ضعف عمر ابنه، والمعادلة $40 + x = 2(12 + x)$ حلّها 16.', answer: true,
    why: 'بعد 16 سنة: الأب $56$ سنة والابن $28$ سنة، و $56 = 2 \\times 28$.', check: { kind: 'solution', lhs: (x) => 40 + x, rhs: (x) => 2 * (12 + x), x: 16 } },
  { n: 9, skill: 'muadala', level: 3, text: 'حلّ المعادلة $\\dfrac{x}{3} + 2 = 5$ هو 1.', answer: false,
    why: '$\\dfrac{x}{3} = 3$ ، إذن $x = 9$ ؛ ومن أجل 1 نجد $\\dfrac{1}{3} + 2 \\neq 5$.', check: { kind: 'solution', lhs: (x) => x / 3 + 2, rhs: () => 5, x: 1 } },
  { n: 10, skill: 'jidaa', level: 3, text: 'المعادلة $x^2 - 25 = 0$ تقبل حلّين هما 5 و $-5$ .', answer: true,
    why: '$x^2 = 25$ : $5^2 = 25$ و $(-5)^2 = 25$.', check: { kind: 'roots', f: (x) => x ** 2 - 25, roots: [5, -5] } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** La leçon de l'unité à réviser pour chaque كفاءة (Module00Astaidd › skills, carte « راجع ») — les quatre leçons de l'unité. */
export const PREP_LESSON = { muadala: 'muadala-ula', jidaa: 'jidaa-maadum', mutarajiha: 'mutarajiha-ula', tarrid: 'tarrid-mushkila' };
