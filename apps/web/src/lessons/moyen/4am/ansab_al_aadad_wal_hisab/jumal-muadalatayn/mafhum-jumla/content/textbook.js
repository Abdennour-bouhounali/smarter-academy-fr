/**
 * Les données du درس 1 « مفهوم جملة معادلتين من الدرجة الأولى بمجهولين » — données pures (aucun JSX).
 *
 * Depuis le rollout mission (2026-11-12, conseil du 2026-11-11, verdict L1 et prompt §12.12 « l'indépendance du manuel atteint le test ») TOUT
 * ce qu'un module rend est écrit par la PLATEFORME (`addition(…)`) : ses propres nombres, ses propres jumal, ses propres mots. Le manuel n'est plus
 * que la RÉFÉRENCE des الكفاءات : ses « أستعدّ » (PREP_ITEMS) et ses QCM (QCM) restent ici comme SOURCE tracée (`src(…)`), rendus par aucun module
 * (l'échelle « أستعدّ » est content/prep.js, le test final content/test.js).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
// la TRAÇABILITÉ (`check:textbook`) : un bloc de la plateforme qui couvre un élément du manuel garde `src(<id>)` et `part: 'بأعداد المنصّة'`
// (précédent des unités 3 et 4) ; aucun texte du manuel n'est montré, `SourceTag` est muet pour l'élève.
const REWRITE = { part: 'بأعداد المنصّة' };

/**
 * La PAGE (enseignant) du module 1, niveau متقدم : le service « après un départ » sur les nombres de la plateforme (verdict L1.1 : ce monde
 * reste hors du lecteur). 29 employés ; 3 hommes et 2 femmes partent vers un autre service ; il reste deux fois plus de femmes que d'hommes.
 * x + y = 29 et 2(x − 3) = y − 2, réduite 2x − y = 4 → (11 ; 18) ; après : 8 hommes et 16 femmes. La ثنائية à une condition : (20 ; 9).
 */
export const ACTIVITY = {
  source: { ...src('act-1', 56, 'أنشطة', 1), ...REWRITE },
  text: 'يعمل في مصلحة إدارية 29 موظّفًا. انتقل 3 رجال وامرأتان إلى مصلحة أخرى، فأصبح عدد النساء الباقيات ضعف عدد الرجال الباقين. كم رجلًا وكم امرأة كانوا يعملون فيها؟',
  lead: 'انتقل 3 رجال وامرأتان إلى مصلحة أخرى، فأصبح عدد النساء الباقيات ضعف عدد الرجال الباقين.',
  system: 'x+y=29|2(x-3)=y-2',
  answer: { x: 11, y: 18 },
  half: { x: 20, y: 9 },
};

/** Les calculs de la page, écrits par la plateforme (les lectures exactes des jauges). */
export const ACTIVITY_LINES = {
  source: PLATFORM,
  a: 'بعد الانتقال يبقى $20 - 3 = 17$ رجلًا و $9 - 2 = 7$ نساء، و $2 \\times 17 = 34 \\neq 7$ : عدد النساء ليس ضعف عدد الرجال. إذن لا يمكن، رغم أنّ $20 + 9 = 29$.',
  b: 'عدد الموظّفين $x + y = 29$ . بعد الانتقال يبقى $x - 3$ رجلًا و $y - 2$ امرأة، وعدد النساء ضعف عدد الرجال: $y - 2 = 2(x - 3)$ ، أي $2(x - 3) = y - 2$.',
  c: '$2(x - 3) = y - 2$ تعطي $2x - 6 = y - 2$ ، أي $2x - y = 4$.',
  checkRight: 'من أجل $x = 11$ و $y = 18$ : $11 + 18 = 29$ و $2 \\times 11 - 18 = 4$ : المعادلتان محقّقتان معًا.',
  checkHalf: 'من أجل $x = 20$ و $y = 9$ : $20 + 9 = 29$ لكن $2 \\times 20 - 9 = 31 \\neq 4$ : المعادلتان غير محقّقتين معًا.',
  d: 'قبل الانتقال: 11 رجلًا و 18 امرأة. وللتحقّق في النص: $11 + 18 = 29$ ، وبعد الانتقال $8$ رجال و $16$ امرأة، و $16 = 2 \\times 8$.',
};

/** Le TRANSFERT de la page (étape 5) et la brique du module 1 : la cagnotte de la classe — la manche 2 du lecteur (x + y = 9 ∣ 50x + 20y = 300). */
export const COINS = {
  source: { ...src('challenge', 55, 'تحدّ'), ...REWRITE },
  text: 'جمع تلاميذ القسم في حصّالتهم 9 قطع نقدية من فئتي 50 دج و 20 دج، مبلغها 300 دج، لشراء أصيص نبتة. كم قطعة من كل فئة في الحصّالة؟',
  system: 'x+y=9|50x+20y=300',
  unknowns: 'نسمّي $x$ عدد قطع 50 دج و $y$ عدد قطع 20 دج.',
  answer: { x: '4', y: '5' },
  closing: 'نقول إنّ $\\begin{cases} x + y = 9 \\\\ 50x + 20y = 300 \\end{cases}$ جملة معادلتين من الدرجة الأولى بمجهولين، والثنائية $(4 ; 5)$ حلّ لهذه الجملة.',
  checkRight: 'من أجل $x = 4$ و $y = 5$ : $4 + 5 = 9$ و $50 \\times 4 + 20 \\times 5 = 300$ : المعادلتان محقّقتان معًا.',
  checkHalf: 'من أجل $x = 6$ و $y = 3$ : $6 + 3 = 9$ لكن $50 \\times 6 + 20 \\times 3 = 360 \\neq 300$ : المعادلة الثانية غير محقّقة.',
};

/**
 * معارف — écrites par la plateforme : la définition, l'exemple x + 2y = 4 ∣ 3x − y = 5 (solution (2 ; 1) ; (0 ; 2) ne vérifie que (1) ; (1 ; 2),
 * la renversée, aucune), l'ordre, les deux cas particuliers 2x + y = 3 ∣ 6x + 3y = 9 (une seule équation) et x − y = 1 ∣ 3x − 3y = 5 (contradiction).
 */
export const KNOWLEDGE = {
  system: {
    source: { ...src('know-1', 58, 'معارف', 1), ...REWRITE },
    title: 'جملة معادلتين من الدرجة الأولى بمجهولين',
    definition: 'جملة معادلتين من الدرجة الأولى بمجهولين $x$ و $y$ هي معادلتان نريدهما محقّقتين معًا، من الشكل $\\begin{cases} ax + by = c \\\\ a\'x + b\'y = c\' \\end{cases}$ حيث $a$ ، $b$ ، $c$ و $a\'$ ، $b\'$ ، $c\'$ أعداد معلومة.',
    example: 'في الجملة $\\begin{cases} x + 2y = 4 \\\\ 3x - y = 5 \\end{cases}$ : $a = 1$ ، $b = 2$ ، $c = 4$ و $a\' = 3$ ، $b\' = -1$ ، $c\' = 5$ .',
  },
  solution: {
    source: { ...src('know-2', 58, 'معارف', 2), ...REWRITE },
    title: 'حل جملة معادلتين',
    definition: 'حلّ الجملة $\\begin{cases} ax + by = c \\\\ a\'x + b\'y = c\' \\end{cases}$ هو كل ثنائية $(x_0 ; y_0)$ تكون من أجلها المعادلتان محقّقتين في آن واحد.',
    rule: 'حلّ جملة يعني إيجاد كل الثنائيات $(x ; y)$ التي تكون من أجلها المعادلتان محقّقتين في آن واحد.',
    examples: [
      'من أجل $x = 2$ و $y = 1$ : $2 + 2 \\times 1 = 4$ و $3 \\times 2 - 1 = 5$ : الثنائية $(2 ; 1)$ حلّ للجملة.',
      'من أجل $x = 0$ و $y = 2$ : $0 + 2 \\times 2 = 4$ لكن $3 \\times 0 - 2 = -2 \\neq 5$ : الثنائية $(0 ; 2)$ ليست حلًّا للجملة.',
    ],
    note: 'في الثنائية $(x ; y)$ الترتيب مهم: العدد الأول قيمة $x$ والثاني قيمة $y$ . الثنائية $(2 ; 1)$ حلّ للجملة أعلاه، أمّا $(1 ; 2)$ فتعطي $1 + 2 \\times 2 = 5 \\neq 4$ : ليست حلًّا.',
  },
  cases: {
    source: { ...src('know-cases', 58, 'معارف'), ...REWRITE },
    title: 'حالات خاصة',
    items: [
      'الجملة $\\begin{cases} 2x + y = 3 \\\\ 6x + 3y = 9 \\end{cases}$ : إذا قسمنا طرفي المعادلة الثانية على 3 وجدنا المعادلة الأولى. هي إذن معادلة واحدة، ولها عدد غير منته من الحلول.',
      'الجملة $\\begin{cases} x - y = 1 \\\\ 3x - 3y = 5 \\end{cases}$ : إذا قسمنا طرفي المعادلة الثانية على 3 وجدنا $x - y = \\dfrac{5}{3}$ ، و $x - y$ لا يساوي 1 و $\\dfrac{5}{3}$ في آن واحد. ليس لها حلول.',
    ],
  },
};

/** Les calculs des cas particuliers, ligne à ligne. */
export const CASES_LINES = {
  source: PLATFORM,
  infinite: [
    'نقسم طرفي $6x + 3y = 9$ على 3: $2x + y = 3$.',
    'المعادلتان صارتا معادلة واحدة: كل ثنائية تحقّق $2x + y = 3$ حلّ للجملة، مثل $(1 ; 1)$ و $(0 ; 3)$.',
  ],
  none: [
    'نقسم طرفي $3x - 3y = 5$ على 3: $x - y = \\dfrac{5}{3}$.',
    'لو وُجدت ثنائية حلّا لكان $x - y$ يساوي $1$ ويساوي $\\dfrac{5}{3}$ في آن واحد، و $1 \\neq \\dfrac{5}{3}$ : الجملة ليس لها حلول.',
  ],
  unique: 'وفي حصّالة القسم وجدنا ثنائية واحدة تحقّق الشرطين: $(4 ; 5)$ — حلّ وحيد.',
};

/** Les deux exemples de la vérification, écrits avec « × » (la carte des connaissances les vérifie). */
export const EXAMPLE_LINES = {
  source: PLATFORM,
  yes: KNOWLEDGE.solution.examples[0],
  no: KNOWLEDGE.solution.examples[1],
};

/** La méthode de vérification d'une ثنائية : on remplace x et y dans CHAQUE équation. */
export const CHECK_METHOD = {
  source: PLATFORM,
  rule: 'لنعرف هل ثنائية $(x_0 ; y_0)$ حلّ لجملة، نعوّض $x$ بـ $x_0$ و $y$ بـ $y_0$ في كل معادلة: إذا تحقّقت المعادلتان معًا فهي حلّ للجملة، وإذا لم تتحقّق إحداهما فليست حلًّا.',
};

/** Les jumal que les modules 1–2 montrent (le registre de l'unité les lit : `_unit/signatures/mafhum-jumla.js`). */
export const MODULE_SYSTEMS = {
  example: ['x + 2y = 4', '3x - y = 5'],
  infinite: ['2x + y = 3', '6x + 3y = 9'],
  none: ['x - y = 1', '3x - 3y = 5'],
  coefficients: ['3x + y = 5', 'x - 4y = -2'],
  isSystem: ['5x - y = 0', 'x + 3y = 7'],
  order: ['x + 2y = 7', '3x - y = 7'],
  classifyInfinite: ['x + y = 4', '2x + 2y = 8'],
  classifyNone: ['x + y = 4', 'x + y = 5'],
  classifyUnique: ['x + y = 8', 'x - y = 4'],
};

/**
 * SOURCE (non rendue) — « أؤكّد تعلّماتي » du manuel (p. 62), items 1 à 4 : le test final (module 7) pose les questions de la plateforme
 * (content/test.js) qui en gardent les ids, les compétences et les LP.
 */
const QCM_SRC = (n) => src('qcm', 62, 'أؤكّد تعلّماتي', n);
export const QCM = {
  1: { n: 1, source: QCM_SRC(1), text: 'المعادلة $8x - 1 = y$ هي معادلة من الدرجة الأولى ...', options: ['ذات المجهول $x$ .', 'ذات المجهولين $x$ و $y$ .', 'ذات المجهول $y$ .'], correct: 1 },
  2: { n: 2, source: QCM_SRC(2), text: 'الثنائية $(0 ; 0)$ هي حل للمعادلة ...', options: ['$3x + y = 0$', '$x - 3y = 0$', '$\\dfrac{1}{3}x - y = 3$'], correct: [0, 1] },
  3: { n: 3, source: QCM_SRC(3), text: 'الثنائية $\\left(\\dfrac{1}{2} ; -\\dfrac{1}{2}\\right)$ هي حل للمعادلة...', options: ['$x + y = 0$', '$2x - \\dfrac{1}{2}y = 0$', '$\\dfrac{1}{2}x + y - \\dfrac{1}{4} = 0$'], correct: 0 },
  4: { n: 4, source: QCM_SRC(4), text: 'الجملة $\\begin{cases} 2a - b = 3 \\\\ a - 2b = -5 \\end{cases}$ ...', options: ['هي جملة معادلتين ذات مجهول واحد.', 'ليست جملة معادلتين من الدرجة الأولى.', 'هي جملة معادلتين من الدرجة الأولى ذات المجهولين $a$ و $b$ .'], correct: 2 },
};

/** SOURCE (non rendue) — « أستعدّ » du manuel (p. 55), items 1 à 8 ; l'échelle rendue est content/prep.js. */
const PREP = (n) => src('prep', 55, 'أستعدّ', n);
export const PREP_ITEMS = [
  { n: 1, skill: 'hal', text: 'إذا كان $5x = -3$ فإن $x = -3 - 5$ .', answer: false, why: 'نقسم على 5 ولا نطرح: $x = -\\dfrac{3}{5}$', source: PREP(1) },
  { n: 2, skill: 'taawid', text: 'حل المعادلة $5x = -8$ هو العدد 0.', answer: false, why: '$5 \\times 0 = 0 \\neq -8$ ؛ الحل هو $-\\dfrac{8}{5}$', source: PREP(2) },
  { n: 3, skill: 'hal', text: 'العلاقة $x + 6 = 6x + 1$ هي معادلة من الدرجة الأولى ذات المجهول $x$ .', answer: true, why: 'تؤول إلى $-5x = -5$ : المجهول $x$ من الدرجة الأولى', source: PREP(3) },
  { n: 4, skill: 'taawid', text: 'حل المعادلة $5x - 5 = 5 - 5x$ هو العدد 5.', answer: false, why: '$5 \\times 5 - 5 = 20$ و $5 - 5 \\times 5 = -20$ ؛ الحل هو 1', source: PREP(4) },
  { n: 5, skill: 'harfan', text: 'من أجل $x = 1$ و $y = 0$ ، المساواة $2x - y = 0$ محققة.', answer: false, why: '$2 \\times 1 - 0 = 2 \\neq 0$', source: PREP(5) },
  { n: 6, skill: 'harfan', text: 'من أجل $x = -3$ و $y = -2$ ، المساواتان $x - 2y = 7$ و $\\dfrac{1}{3}x + \\dfrac{1}{3}y = 0$ محققتان معا.', answer: false, why: '$-3 - 2 \\times (-2) = 1 \\neq 7$', source: PREP(6) },
  { n: 7, skill: 'taawid', text: '4 هو حل للمعادلة $3 - 2x = 5$ .', answer: false, why: '$3 - 2 \\times 4 = -5 \\neq 5$ ؛ الحل هو $-1$', source: PREP(7) },
  { n: 8, skill: 'hal', text: 'حل المعادلة $2x + 7 = 3 - x$ هو نفسه حل المعادلة $3x = -4$ .', answer: true, why: 'ننقل $-x$ و 7: $2x + x = 3 - 7$ أي $3x = -4$', source: PREP(8) },
];
