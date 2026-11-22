/**
 * Le contenu du MANUEL pour le درس « حساب مركبتي شعاع وتساوي شعاعين في معلم » (unité 12, leçon 2) — données pures
 * (aucun JSX), au mot près ; chaque bloc cite son élément de docs/sources/4am/unit12/extraction.json :
 * أستعدّ 3, 4, 6 (p. 139, module 0), نشاط 2 (p. 140, module 1), معارف 3 ب et جـ (pp. 142 et 144, module 2), طرائق
 * « حساب مركبتا شعاع، علمت إحداثيات مبدئه ونهايته » + دوري الآن 2 (p. 143, module 3). Ce que la plateforme ajoute est
 * déclaré (`addition(…)`).
 * Coquille corrigée (extraction › discrepancies) : la طريقة conclut « AB = CD » après avoir montré que AB et DC ont les
 * mêmes composantes → AB = DC (une ligne discrète dans le module 3).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;

/** نشاط 2 (p. 140) — « مركبتا شعاع علمت إحداثيات مبدئه ونهايته ». */
export const ACTIVITY = {
  source: src('act-2', 140, 'أنشطة', 2),
  title: 'مركبتا شعاع علمت إحداثيات مبدئه ونهايته',
  situation: 'في لعبة تعليمية على الهاتف أتقن تلاميذ برمجتها، بوابات سحرية تنقل البطل من نقطة إلى أخرى على خريطة مزوّدة بمعلم. رمز كل بوابة هو مركبتا الشعاع الذي تقفز به. هل نحتاج إلى عدّ المربعات لنعرف الرمز؟',
  intro: 'المستوي مزود بمعلم مبدؤه O. (الشكل)',
  partA: 'أ) C و D نقطتان من المستوى. (الشكل) 1) عيّن إحداثيتي كل من C و D. 2) ما هما مركبتا الشعاع $\\overrightarrow{CD}$ ؟ 3) E نقطة حيث مركبتا $\\overrightarrow{DE}$ هما 3 و 4. أوجد إحداثيتي النقطة E.',
  partB: 'ب) نفرض أن إحداثيتي النقطتين A و B هما $(x_A\\,;\\,y_A)$ و $(x_B\\,;\\,y_B)$ على الترتيب. مركبتي الشعاع $\\overrightarrow{AB}$ هما $a$ و $b$ . 1) عبّر عن $a$ بدلالة $x_A$ و $x_B$ وعن $b$ بدلالة $y_A$ و $y_B$ . 2) $F(6\\,;\\,5)$ نقطة من المستوي. عيّن الشعاع $\\overrightarrow{CF}$ . تحقّق أن للشعاعين $\\overrightarrow{DE}$ و $\\overrightarrow{CF}$ نفس المركبتين. نقول إنّ الشعاعين $\\overrightarrow{DE}$ و $\\overrightarrow{CF}$ متساويان. نكتب $\\overrightarrow{DE} = \\overrightarrow{CF}$ .',
  questions: [
    'عيّن إحداثيتي كل من C و D.',
    'ما هما مركبتا الشعاع $\\overrightarrow{CD}$ ؟',
    'E نقطة حيث مركبتا $\\overrightarrow{DE}$ هما 3 و 4. أوجد إحداثيتي النقطة E.',
    'عبّر عن $a$ بدلالة $x_A$ و $x_B$ وعن $b$ بدلالة $y_A$ و $y_B$ .',
    '$F(6\\,;\\,5)$ : عيّن الشعاع $\\overrightarrow{CF}$ وتحقّق أن للشعاعين $\\overrightarrow{DE}$ و $\\overrightarrow{CF}$ نفس المركبتين.',
  ],
  closing: 'مركبتا الشعاع $\\overrightarrow{AB}$ هما $a = x_B - x_A$ و $b = y_B - y_A$ : إحداثيتا النهاية ناقص إحداثيتي المبدأ. وشعاعان لهما نفس المركبتين متساويان: $\\overrightarrow{DE} = \\overrightarrow{CF}$ .',
};

/** Ce que la plateforme écrit des réponses du نشاط 2 (le livre les demande sans les écrire). */
export const ACTIVITY_LINES = {
  source: PLATFORM,
  read: 'نقرأ على الشكل: $C(3\\,;\\,1)$ و $D(2\\,;\\,-5)$ .',
  cd: 'من C إلى D: وحدة واحدة نحو اليسار ثم 6 وحدات نحو الأسفل، أي $x_D - x_C = 2 - 3 = -1$ و $y_D - y_C = -5 - 1 = -6$ : $\\overrightarrow{CD}\\begin{pmatrix} -1 \\\\ -6 \\end{pmatrix}$ .',
  e: '$x_E - x_D = 3$ و $y_E - y_D = 4$ ، أي $x_E = 2 + 3 = 5$ و $y_E = -5 + 4 = -1$ : $E(5\\,;\\,-1)$ .',
  ab: '$a = x_B - x_A$ و $b = y_B - y_A$ : النهاية ناقص المبدأ، في كل مركبة.',
  cf: '$x_F - x_C = 6 - 3 = 3$ و $y_F - y_C = 5 - 1 = 4$ : $\\overrightarrow{CF}\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$ ، وهما مركبتا $\\overrightarrow{DE}$ أيضا.',
};

/** معارف 3 ب (p. 142) — « حساب مركبتي شعاع ». */
export const KNOW3B = {
  source: src('know-3', 142, 'معارف', 3),
  title: 'حساب مركبتي شعاع',
  property: 'خاصية: إذا كانت A و B نقطتان، إحداثياهما $(x_A\\,;\\,y_A)$ و $(x_B\\,;\\,y_B)$ على الترتيب في مَعلم فإن مركبتي الشعاع $\\overrightarrow{AB}$ هما $x_B - x_A$ و $y_B - y_A$ .',
  formula: '$\\overrightarrow{AB}\\begin{pmatrix} x_B - x_A \\\\ y_B - y_A \\end{pmatrix}$',
  example: 'مثال: نعتبر النقطتين $A(-2{,}5\\,;\\,4)$ و $B(1\\,;\\,-1)$ من المستوي المزوّد بمعلم متعامد ومتجانس مبدؤه O. لدينا $x_B - x_A = 1 - (-2{,}5) = 3{,}5$ و $y_B - y_A = -1 - 4 = -5$ . إذن مركبتا الشعاع $\\overrightarrow{AB}$ هما 3,5 و 5-. نكتب $\\overrightarrow{AB}\\begin{pmatrix} 3{,}5 \\\\ -5 \\end{pmatrix}$ .',
  intro: 'المستوي مزود بمعلم متعامد ومتجانس (O ; I , J)، مبدؤه O.',
};

/** معارف جـ (p. 144) — « الشعاعان المتساويان ». */
export const KNOW_EQUAL = {
  source: src('know-equal', 144, 'معارف', 3),
  title: 'الشعاعان المتساويان',
  property: 'خاصية: $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ شعاعان، مركبتاهما $\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ و $\\begin{pmatrix} x\' \\\\ y\' \\end{pmatrix}$ على الترتيب. نقول عن الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ إنّهما متساويان إذا كان $x = x\'$ و $y = y\'$ أي: $\\overrightarrow{AB} = \\overrightarrow{CD}$ معناه $x = x\'$ و $y = y\'$ .',
  example1: 'مثال: نقول إنّ الشعاعين $\\overrightarrow{DE}$ و $\\overrightarrow{CF}$ متساويان. نكتب $\\overrightarrow{DE} = \\overrightarrow{CF}$ .',
  example1Note: '(الشعاعان من نشاط 2.)',
  example2: 'مثال: A، B، C، D نقط إحداثياتها $(-4\\,;\\,-1)$ ، $(3\\,;\\,-1)$ ، $(-3\\,;\\,2)$ و $(4\\,;\\,2)$ على الترتيب. لدينا $x_B - x_A = 3 + 4 = 7$ و $y_B - y_A = -1 - (-1) = 0$ إذن $\\overrightarrow{AB}\\begin{pmatrix} 7 \\\\ 0 \\end{pmatrix}$ . ولدينا $x_D - x_C = 4 - (-3) = 7$ و $y_D - y_C = 2 - 2 = 0$ إذن $\\overrightarrow{CD}\\begin{pmatrix} 7 \\\\ 0 \\end{pmatrix}$ . الشعاعان $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ لهما نفس المركبتين. إذن $\\overrightarrow{AB} = \\overrightarrow{CD}$ .',
};

/** طرائق (p. 143) — « حساب مركبتا شعاع، علمت إحداثيات مبدئه ونهايته » (la conclusion CORRIGÉE). */
export const METHOD_EQUAL = {
  source: src('method-equal', 143, 'طرائق'),
  title: 'حساب مركبتي شعاع، علمت إحداثيات مبدئه ونهايته',
  exercise: 'تمرين: المستوي مزود بمَعلم متعامد ومتجانس، مبدؤه النقطة O. $A(1\\,;\\,0)$ ، $B(0\\,;\\,3)$ ، $C(-3\\,;\\,0)$ ، $D(-2\\,;\\,-3)$ نقط من المستوى. 1) علّم النقط A، B، C، D. 2) احسب مركبتي كل من الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$ . ماذا تلاحظ؟',
  solution: [
    'حل: 1) تعليم النقط A، B، C، D (الشكل).',
    '2) حساب مركبتي كل من الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$ .',
    'لدينا $x_B - x_A = 0 - 1 = -1$ و $y_B - y_A = 3 - 0 = 3$ . إذن $\\overrightarrow{AB}\\begin{pmatrix} -1 \\\\ 3 \\end{pmatrix}$ .',
    '$x_C - x_D = -3 + 2 = -1$ و $y_C - y_D = 0 + 3 = 3$ . إذن $\\overrightarrow{DC}\\begin{pmatrix} -1 \\\\ 3 \\end{pmatrix}$ .',
    'الملاحظة: للشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$ نفس المركبتين: $\\overrightarrow{AB} = \\overrightarrow{DC}$ .',
  ],
  rule: 'طريقة: للتحقق من تساوي شعاعين، يمكن التحقّق من تساوي مركبتي أحدهما مع مركبتي الآخر.',
  correction: 'صحّحت المنصّة خطأً مطبعيًا: في الكتاب «$\\overrightarrow{AB} = \\overrightarrow{CD}$»، والصواب $\\overrightarrow{AB} = \\overrightarrow{DC}$ ($\\overrightarrow{CD}$ مركبتاه $(1\\,;\\,-3)$ : هو المعاكس).',
};

/** دوري الآن (p. 143) — l'item 2 (extraction › destinations › now-143 › items › 2). */
export const NOW2 = {
  source: src('now-143', 143, 'دوري الآن', 2),
  text: 'المستوي مزود بمَعلم متعامد ومتجانس، مبدؤه النقطة O. نعتبر النقط $A(2\\,;\\,3)$ ، $B(-4\\,;\\,5)$ ، $C(1\\,;\\,0)$ ، $D(-1\\,;\\,1)$ . عيّن مركبتي كل شعاع مما يلي: $\\overrightarrow{AB}$ ؛ $\\overrightarrow{BC}$ ؛ $\\overrightarrow{DA}$ .',
};

/**
 * Ce que la plateforme FORMALISE (déclaré) : calculer les coordonnées d'un point inconnu — un vecteur égal, le quatrième
 * sommet d'un متوازي أضلاع. Le manuel le fait dans l'activité (E) et les exercices 8, 9, 12, 14 sans l'écrire en méthode.
 */
export const METHOD_UNKNOWN = {
  source: addition('knowledge_formalization'),
  title: 'حساب إحداثيتي نقطة مجهولة',
  exercise: 'مثال: $A(1\\,;\\,-2)$ ، $B(4\\,;\\,1)$ ، $C(2\\,;\\,3)$ . عيّن إحداثيتي النقطة D بحيث يكون الرباعي ABCD متوازي أضلاع.',
  solution: [
    'نترجم بشعاعين متساويين، بترتيب الرؤوس: ABCD متوازي أضلاع يعني $\\overrightarrow{AB} = \\overrightarrow{DC}$ .',
    'نحسب مركبتي الشعاع المعلوم: $\\overrightarrow{AB}\\begin{pmatrix} 4 - 1 \\\\ 1 - (-2) \\end{pmatrix}$ ، أي $\\overrightarrow{AB}\\begin{pmatrix} 3 \\\\ 3 \\end{pmatrix}$ .',
    'نكتب مركبتي الشعاع الذي فيه المجهول: $\\overrightarrow{DC}\\begin{pmatrix} 2 - x_D \\\\ 3 - y_D \\end{pmatrix}$ .',
    'تساوي المركبتين يعطي معادلتين: $2 - x_D = 3$ و $3 - y_D = 3$ ، إذن $x_D = -1$ و $y_D = 0$ .',
    'نتحقّق: $D(-1\\,;\\,0)$ و $\\overrightarrow{DC}\\begin{pmatrix} 3 \\\\ 3 \\end{pmatrix}$ ، والنقط A، B، C ليست على استقامة واحدة.',
  ],
};

/** Les erreurs que la leçon EXPLIQUE (la carte les cite mot pour mot). */
export const MISTAKES = {
  reversed: {
    wrong: 'مركبتا $\\overrightarrow{AB}$ هما $x_A - x_B$ و $y_A - y_B$',
    why: 'المبدأ ناقص النهاية يعطي مركبتي $\\overrightarrow{BA}$ ، الشعاع المعاكس: نفس الأعداد بإشارات معاكسة.',
    right: 'مركبتا $\\overrightarrow{AB}$ هما $x_B - x_A$ و $y_B - y_A$ : النهاية ناقص المبدأ.',
  },
  order: {
    text: 'لكي يكون ABCD متوازي أضلاع نكتب $\\overrightarrow{AB} = \\overrightarrow{DC}$ ، لا $\\overrightarrow{AB} = \\overrightarrow{CD}$ (الذي يجعل الرباعي ABCD متقاطعا).',
    note: 'في المختبر، وضعُ D حيث $\\overrightarrow{CD} = \\overrightarrow{AB}$ يجعل الرباعي ABCD متقاطعا فيُرفض.',
  },
  coords: 'مركبتا $\\overrightarrow{AB}$ ليستا إحداثيتي B، إلا إذا كانت A هي المبدأ O: مركبتا $\\overrightarrow{OM}$ هما إحداثيتا M.',
};

/**
 * « أستعدّ » — les items 3, 4 et 6 du manuel (p. 139) et trois affirmations de la plateforme sur les acquis déclarés
 * du catalogue (« قراءة وفهم مركبتي شعاع », « طرح الأعداد النسبية »). Une affirmation par question, une compétence par
 * affirmation. Aucune n'utilise les nombres du نشاط 2.
 */
const PREP_ADD = addition('prerequisite_diagnostic');
const PREP_SRC = (n) => src('prep', 139, 'أستعدّ', n);
export const PREP_ITEMS = [
  { n: '3', skill: 'mutawazi', text: 'ABCD متوازي أضلاع، إذن $\\overrightarrow{AB} = \\overrightarrow{DC}$ .', answer: true, why: 'في متوازي الأضلاع ABCD الضلعان المتقابلان [AB] و [DC] لهما نفس المنحى ونفس الاتجاه ونفس الطول (الوحدة السابقة).', source: PREP_SRC(3) },
  { n: '4', skill: 'insihab', text: 'ABCD متوازي أضلاع. إذن الانسحاب الذي يحول D إلى C يحوّل أيضا A إلى B.', answer: true, why: '$\\overrightarrow{DC} = \\overrightarrow{AB}$ : الانسحاب الذي شعاعه $\\overrightarrow{DC}$ يحوّل A إلى B.', source: PREP_SRC(4) },
  { n: '6', skill: 'mutawazi', text: 'ABCD متوازي أضلاع. إذن $\\overrightarrow{AD} = \\overrightarrow{BC}$ .', answer: true, why: 'الضلعان المتقابلان الآخران [AD] و [BC] مقروءان في الاتجاه نفسه.', source: PREP_SRC(6) },
  { n: 'p1', skill: 'qiraa', text: 'على ورقة مرصوفة، ننتقل من M إلى N بـ 4 وحدات نحو اليمين ثم بوحدتين نحو الأسفل. إذن مركبتا الشعاع $\\overrightarrow{MN}$ هما 4 و 2.', answer: false, why: 'نحو الأسفل تكون الإزاحة سالبة: $\\overrightarrow{MN}\\begin{pmatrix} 4 \\\\ -2 \\end{pmatrix}$ .', source: PREP_ADD },
  { n: 'p2', skill: 'tarh', text: '$-7 - 2 = -5$', answer: false, why: '$-7 - 2 = -9$ : نطرح 2 من $-7$ فنبتعد أكثر عن الصفر نحو السالب.', source: PREP_ADD },
  { n: 'p3', skill: 'tarh', text: '$4 - (-3) = 7$', answer: true, why: 'طرح عدد سالب يعني جمع معاكسه: $4 - (-3) = 4 + 3 = 7$ .', source: PREP_ADD },
];

/** Les deux mondes du lab (levels.js) : مبتدئ = les portails A, B, C (plateforme) ; متقدم = le نشاط 2. */
export const LAB = {
  beginner: {
    source: PLATFORM,
    numbers: {
      points: { A: [1, 2], B: [4, 3], C: [5, 5] },
      missions: [{ kind: 'calc', from: 'A', to: 'B' }, { kind: 'place', point: 'D', vec: ['D', 'C'], ref: ['A', 'B'] }],
    },
  },
  advanced: {
    source: ACTIVITY.source,
    numbers: {
      points: { C: [3, 1], D: [2, -5], F: [6, 5] },
      missions: [
        { kind: 'calc', from: 'C', to: 'D' },
        { kind: 'place', point: 'E', vec: ['D', 'E'], ref: [3, 4] },
        { kind: 'calc', from: 'C', to: 'F', compare: ['D', 'E'] },
      ],
      live: false,
    },
  },
};
