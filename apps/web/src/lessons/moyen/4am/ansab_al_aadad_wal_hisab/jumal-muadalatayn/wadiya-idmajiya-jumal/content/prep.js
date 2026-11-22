import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA SYNTHÈSE — l'ÉCHELLE de dix affirmations bâtie sur les trois leçons de l'unité (recette de la synthèse, point 3 ; pilote
 * `wadiya-idmajiya-talis`). Trois كفاءات en cycle : mafhum « مفهوم جملة معادلتين » (1 → 4 → 7 → 10, à réviser dans `mafhum-jumla`), hall « الحل
 * الجبري » (2 → 5 → 8, `hall-jabri`), mushkila « حل مشكلات » (3 → 6 → 9, `mushkilat-jumla`) — les trois leçons sont dans l'unité, « راجع » n'est
 * jamais vide. De très facile (énoncés de règles, les trois premières VRAIES) à plus difficile (calculs). Les sept affirmations d'avant restent dans
 * content/textbook.js (PREP_ITEMS) comme source. `check` (recalculé en fractions exactes par content/prep.test.js) :
 *   { kind: 'rule', truth }                            — un énoncé de règle (niveau 1)
 *   { kind: 'pair', system, pair }                     — la ثنائية est-elle solution de la جملة ? (les deux équations)
 *   { kind: 'iso', a, c, claimK }                      — de « a·x + y = c » on tire « y = c + claimK·x » : vrai ⇔ claimK = −a
 *   { kind: 'translate', counts, claim }               — « n₁ أقلام و n₂ كراريس » traduit par « claim₁ x + claim₂ y » : vrai ⇔ mêmes coefficients
 *   { kind: 'add', e1, e2, claim }                     — la somme membre à membre de e1 et e2 donne « claim₀ x = claim₁ » (y disparaît)
 *   { kind: 'natural', pair }                          — une ثنائية de COMPTES acceptée par l'histoire : vrai ⇔ deux entiers naturels
 *   { kind: 'unique', system }                         — « la جملة a une solution unique » : vrai ⇔ classify = unique
 * Aucun nombre du حفل (le défi 🏆, la وضعية du module 7) ni d'une manche du module 7 (content/forbidden.js, content/mission.test.js).
 */
export const PREP_LADDER = [
  { n: 1, skill: 'mafhum', level: 1, text: 'حلّ جملة معادلتين بمجهولين هو ثنائية $(x ; y)$ تحقّق المعادلتين في آن واحد.', answer: true,
    why: 'ثنائية تحقّق معادلة واحدة فقط ليست حلًّا للجملة: الحلّ يحقّق المعادلتين معًا.', check: { kind: 'rule', truth: true } },
  { n: 2, skill: 'hall', level: 1, text: 'لحلّ جملة بطريقة التعويض، نعبّر عن أحد المجهولين بدلالة الآخر في معادلة، ثم نعوّضه في المعادلة الأخرى.', answer: true,
    why: 'بعد التعويض تبقى معادلة بمجهول واحد نحلّها، ثم نعود فنجد المجهول الآخر.', check: { kind: 'rule', truth: true } },
  { n: 3, skill: 'mushkila', level: 1, text: 'في مشكلة، نسمّي المجهولين ما يسأل عنه السؤال، ثم نترجم كل معلومة في النص بمعادلة.', answer: true,
    why: 'المجهولان ما نبحث عنه، وكل معلومة تربطهما تعطي معادلة: معلومتان تعطيان جملة.', check: { kind: 'rule', truth: true } },
  { n: 4, skill: 'mafhum', level: 2, text: 'الثنائية $(3 ; 4)$ حلّ للجملة $\\begin{cases} x + y = 7 \\\\ 2x + y = 10 \\end{cases}$', answer: true,
    why: '$3 + 4 = 7$ و $2 \\times 3 + 4 = 10$ : الثنائية تحقّق المعادلتين معًا.', check: { kind: 'pair', system: 'x+y=7|2x+y=10', pair: [3, 4] } },
  { n: 5, skill: 'hall', level: 2, text: 'من المعادلة $3x + y = 11$ ينتج $y = 11 + 3x$ .', answer: false,
    why: 'ننقل $3x$ إلى الطرف الآخر بتغيير إشارته: $y = 11 - 3x$ .', check: { kind: 'iso', a: 3, c: 11, claimK: 3 } },
  { n: 6, skill: 'mushkila', level: 2, text: 'ثمن 5 أقلام وكرّاسين هو 170 دج. إذا كان $x$ ثمن القلم و $y$ ثمن الكرّاس فإنّ $2x + 5y = 170$ .', answer: false,
    why: 'كل عدد يُضرب في ثمن الشيء الذي يعدّه: 5 أقلام ثمنها $5x$ وكرّاسان ثمنهما $2y$ ، أي $5x + 2y = 170$ .', check: { kind: 'translate', counts: [5, 2], claim: [2, 5] } },
  { n: 7, skill: 'mafhum', level: 2, text: 'الثنائية $(5 ; 1)$ حلّ للجملة $\\begin{cases} x - y = 4 \\\\ x + 2y = 8 \\end{cases}$', answer: false,
    why: '$5 - 1 = 4$ صحيحة، لكنّ $5 + 2 \\times 1 = 7$ لا 8: الثنائية تحقّق المعادلة الأولى فقط.', check: { kind: 'pair', system: 'x-y=4|x+2y=8', pair: [5, 1] } },
  { n: 8, skill: 'hall', level: 3, text: 'بجمع المعادلتين $2x + 3y = 13$ و $4x - 3y = 5$ طرفًا بطرف نحصل على $6x = 18$ .', answer: true,
    why: 'المعاملان $3$ و $-3$ متعاكسان فيختفي $y$ : $2x + 4x = 6x$ و $13 + 5 = 18$ .', check: { kind: 'add', e1: [2, 3, 13], e2: [4, -3, 5], claim: [6, 18] } },
  { n: 9, skill: 'mushkila', level: 3, text: 'نبحث عن عدد البنات وعدد الأولاد في قسم، فوجدنا حلّ الجملة الثنائية $(14 ; -2)$ . إذن في القسم 14 بنتًا.', answer: false,
    why: 'العدد $-2$ لا يكون عدد أولاد: القصة ترفض الثنائية، فنعود إلى الترجمة والحساب قبل أن نجيب.', check: { kind: 'natural', pair: [14, -2] } },
  { n: 10, skill: 'mafhum', level: 3, text: 'للجملة $\\begin{cases} x + 2y = 5 \\\\ 2x + 4y = 10 \\end{cases}$ حلّ وحيد.', answer: false,
    why: 'المعادلة الثانية ضعف الأولى: كل ثنائية تحقّق الأولى تحقّق الثانية، فللجملة ما لا نهاية من الحلول.', check: { kind: 'unique', system: 'x+2y=5|2x+4y=10' } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** La leçon de l'unité à réviser pour chaque كفاءة (Module00Astaidd › skills, carte « راجع ») — les trois leçons de l'unité. */
export const PREP_LESSON = { mafhum: 'mafhum-jumla', hall: 'hall-jabri', mushkila: 'mushkilat-jumla' };

/** Les جمل que l'échelle montre (lues par la règle des collisions de content/mission.test.js). */
export const PREP_SYSTEMS = PREP_LADDER.filter((it) => it.check.system).map((it) => ({ n: it.n, system: it.check.system }));
