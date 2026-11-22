/**
 * Le contenu du MANUEL pour le درس « الشعاعان المتساويان ومتوازي الأضلاع ومنتصف قطعة » (unité 11, leçon 2) —
 * données pures (aucun JSX), au mot près ; chaque bloc cite son élément de docs/sources/4am/unit11/extraction.json :
 * أستعدّ 3, 4, 7 (p. 127, module 0), نشاط 2 ب (p. 129, module 1), معارف 3 (p. 132, module 2), طرائق « إنشاء صورة نقطة
 * بانسحاب عُلم شعاعه » et « إثبات تساوي شعاعين » + دوري الآن (p. 131, module 3), أؤكّد تعلّماتي 6 (p. 136, doublon
 * déclaré, module 5). Ce que la plateforme ajoute est déclaré (`addition(…)`).
 * Lecture du scan : le début des lignes de نشاط 2 ب est mangé par la marge (extraction › discrepancies, « completed ») —
 * complété dans l'esprit du manuel (« ب) … تحقق … استنتج … 2) قارن »).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;

/** نشاط 2 ب (p. 129) — « تساوي شعاعين » : des points sur une droite, un milieu commun. */
export const ACTIVITY = {
  source: src('act-2', 129, 'أنشطة', 2),
  title: 'تساوي شعاعين — منتصف مشترك',
  situation: 'في مدرّجات ملعب 5 جويلية يرفع المشجّعون متعاونين وشاحا طويلا وراية تيفو عملاقة: من يقف في منتصف الوشاح؟ ومتى تُشدّ الراية بأركانها الأربعة؟ وماذا تقول الأشعة المتساوية في ذلك؟',
  text: 'ب) A، B، C، D، O نقط من المستقيم (d). (الشكل). 1) تحقق أن للقطعتين [BC] و [AD] نفس المنتصف O. استنتج العلاقة بين $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ ؟ 2) قارن بين الشعاعين $\\overrightarrow{AC}$ و $\\overrightarrow{DB}$ .',
  questions: [
    'تحقق أن للقطعتين [BC] و [AD] نفس المنتصف O.',
    'استنتج العلاقة بين $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ .',
    'قارن بين الشعاعين $\\overrightarrow{AC}$ و $\\overrightarrow{DB}$ .',
  ],
  closing: 'للقطعتين [AD] و [BC] نفس المنتصف O، إذن $\\overrightarrow{AB} = \\overrightarrow{CD}$ : الرباعي ABDC متوازي أضلاع «مسطّح» (النقط على استقامة واحدة).',
  scanNote: 'بداية أسطر هذا الجزء مقطوعة في نسخة الكتاب الممسوحة؛ أكملتها المنصّة بحسب معناها.',
};

/** Ce que la plateforme écrit des réponses du نشاط 2 ب (le livre les demande sans les écrire). */
export const ACTIVITY_LINES = {
  source: PLATFORM,
  midBC: 'الترميز: OA = OD و AC = DB. إذن OC = OA + AC = OD + DB = OB : O منتصف [BC]، وهي منتصف [AD] لأن OA = OD.',
  abcd: 'للشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ نفس المنحى (المستقيم (d))، ونفس الاتجاه (من اليسار نحو اليمين)، ونفس الطول (AB = AO + OB = DO + OC = CD): $\\overrightarrow{AB} = \\overrightarrow{CD}$ .',
  acdb: 'للشعاعين $\\overrightarrow{AC}$ و $\\overrightarrow{DB}$ نفس المنحى ونفس الطول (AC = DB)، لكن $\\overrightarrow{AC}$ يتجه نحو اليسار و $\\overrightarrow{DB}$ نحو اليمين: اتجاهان متعاكسان، فهما غير متساويين.',
};

/** معارف 3 (p. 132) — « الشعاعان المتساويان ومفهوم منتصف قطعة ». */
export const KNOW3 = {
  source: src('know-3', 132, 'معارف', 3),
  title: 'الشعاعان المتساويان ومفهوم منتصف قطعة',
  property: [
    'I، A، B ثلاث نقط.',
    'إذا كان I منتصف [AB] فإن $\\overrightarrow{AI} = \\overrightarrow{IB}$ .',
    'إذا كان $\\overrightarrow{AI} = \\overrightarrow{IB}$ فإن I منتصف [AB].',
  ],
  example: 'على الشكل المقابل لدينا $\\overrightarrow{AI} = \\overrightarrow{IB}$ لأن للشعاعين $\\overrightarrow{AI}$ و $\\overrightarrow{IB}$ نفس المنحى ونفس الاتجاه و AI = IB إذن I منتصف [AB].',
};

/**
 * La propriété du درس 1 (« مفهوم الانسحاب والشعاع وتساوي شعاعين », معارف 2 p. 130), RAPPELÉE ici parce que ce درس
 * l'emploie pour prouver. L'élément know-2 appartient au درس 1 (extraction › destinations) : on ne le cite pas, on le
 * RAPPELLE, déclaré comme rappel de la plateforme (« تذكير من المنصّة »).
 */
export const KNOW2_REMINDER = {
  source: addition('prior_year_reminder'),
  property: 'A، B، C، D أربع نقط بحيث كل ثلاثة منها ليست في استقامية. $\\overrightarrow{AB} = \\overrightarrow{DC}$ تعني أنّ الرباعي ABCD متوازي أضلاع.',
  remark: '$\\overrightarrow{AB} = \\overrightarrow{DC}$ معناه للقطعتين [AC] و [BD] نفس المنتصف.',
  special: 'حالة خاصة: النقط A، B، C، D في استقامية.',
};

/** Ce que la plateforme FORMALISE pour prouver qu'un رباعي est un متوازي أضلاع (déclaré). */
export const PROOF_STEPS = {
  source: addition('knowledge_formalization'),
  lines: [
    'نكتب الرباعي بترتيب رؤوسه، ونختار ضلعين متقابلين: لإثبات أن ABCD متوازي أضلاع نثبت $\\overrightarrow{AB} = \\overrightarrow{DC}$ (الضلع الأول من A إلى B، ومقابله من D إلى C).',
    'نحصل على تساوي الشعاعين من معطى: متوازي أضلاع آخر، أو مستطيل، أو منتصف، أو انسحاب.',
    'نتحقق أن الرؤوس الثلاثة ليست على استقامة واحدة، ثم نستنتج: ABCD متوازي أضلاع.',
  ],
};

/** طرائق (p. 131) — « إنشاء صورة نقطة بانسحاب عُلم شعاعه ». */
export const METHOD_IMAGE = {
  source: src('method-image', 131, 'طرائق'),
  title: 'إنشاء صورة نقطة بانسحاب عُلم شعاعه',
  exercise: 'تمرين: 1) أنشئ مثلثا ABC ثم النقطة D صورة C بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ . 2) أنشئ النقطة E حيث $\\overrightarrow{EB} = \\overrightarrow{AC}$ .',
  solution: [
    '1) ننشئ مثلثا ABC (انظر الشكل المقابل).',
    'D هي صورة C بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ يعني $\\overrightarrow{CD} = \\overrightarrow{AB}$ . إذن الرباعي ACDB متوازي أضلاع.',
    'قطرا الرباعي ACDB هما [AD] و [BC].',
    'ينتج أن D هي نظيرة A بالنسبة إلى النقطة I منتصف [BC].',
    '2) على الشكل لدينا $\\overrightarrow{AC} = \\overrightarrow{BD}$ إذن $\\overrightarrow{EB} = \\overrightarrow{AC}$ أي $\\overrightarrow{EB} = \\overrightarrow{BD}$ .',
    'نلاحظ أن للشعاعين $\\overrightarrow{BD}$ و $\\overrightarrow{EB}$ نفس المنحى وهو منحى (BD)، نفس الطول وهو BD و نفس الاتجاه.',
    'بالتالي B هي منتصف [DE] أي النقطة E هي نظيرة D بالنسبة إلى B (ومنه إنشاء E).',
    'ينتج أن الانسحاب الذي يحول D إلى B هو الانسحاب الذي يحول B إلى E.',
  ],
  note: 'الرباعي ACDB هو نفسه الرباعي ABDC مقروءا في الاتجاه الآخر.',
};

/** La construction au compas, ligne à ligne (plateforme, déclarée) : les deux gestes qui réalisent la طريقة. */
export const CONSTRUCTION = {
  source: addition('knowledge_formalization'),
  title: 'الإنشاء بالمدور والمسطرة',
  exercise: 'لإنشاء D صورة C بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ (A، B، C ليست على استقامة):',
  solution: [
    'الطريقة الأولى (المنتصف): نعيّن I منتصف [BC]، ثم نرسم نصف المستقيم [AI).',
    'نأخذ بالمدور الطول AI، ونضع رأسه في I: القوس يقطع [AI) في D من الجهة الأخرى للنقطة I. إذن D نظيرة A بالنسبة إلى I.',
    'الطريقة الثانية (الأقواس): قوس مركزه C ونصف قطره AB، وقوس مركزه B ونصف قطره AC.',
    'D هي نقطة تقاطع القوسين التي تجعل ABDC متوازي أضلاع (لا تقع مع A في جهة واحدة من (BC)).',
    'نتحقق: الرباعي ABDC قطراه [AD] و [BC] متناصفان، و $\\overrightarrow{CD} = \\overrightarrow{AB}$ .',
  ],
};

/** طرائق (p. 131) — « إثبات تساوي شعاعين ». */
export const METHOD_EQUAL = {
  source: src('method-equal', 131, 'طرائق'),
  title: 'إثبات تساوي شعاعين',
  exercise: 'تمرين: OAB مثلث كيفي. نسمي C نظيرة O بالنسبة إلى النقطة A و D النقطة حيث $\\overrightarrow{AD} = \\overrightarrow{BA}$ . برهن أن $\\overrightarrow{OD} = \\overrightarrow{BC}$ .',
  solution: [
    'A هي منتصف [OC] ومنتصف [BD] لأن C هي نظيرة O بالنسبة إلى A و $\\overrightarrow{AD} = \\overrightarrow{BA}$ .',
    'وبالتالي الانسحاب الذي يحول B إلى C هو نفسه الذي يحوّل O إلى D.',
    'إذن $\\overrightarrow{OD} = \\overrightarrow{BC}$ .',
  ],
  rule: 'طريقة: لإثبات تساوي شعاعين نعتمد على متوازي أضلاع أو على الانسحاب.',
};

/** دوري الآن (p. 131). */
export const NOW = {
  source: src('now-131', 131, 'دوري الآن'),
  text: 'أنشئ مثلثا FHG. أنشئ النقطة E حيث $\\overrightarrow{FH} = \\overrightarrow{HE}$ والنقطة K حيث $\\overrightarrow{KH} = \\overrightarrow{HG}$ . أثبت أن (EG) و (FK) متوازيان.',
  answer: 'H منتصف [FE] و [KG] فالرباعي FGEK متوازي أضلاع (قطراه [FE] و [GK] لهما نفس المنتصف) ومنه $\\overrightarrow{GE} = \\overrightarrow{FK}$ : (EG) // (FK).',
};

/** « أؤكّد تعلّماتي » (p. 136) — l'item 6 (extraction › destinations › qcm : duplicatedIn ce درس, module 5). */
export const QCM6 = {
  source: src('qcm', 136, 'أؤكّد تعلّماتي', 6),
  text: 'A، B، C ثلاث نقط حيث $\\overrightarrow{AB} = \\overrightarrow{CA}$ . إذن',
  options: ['B و C متناظرتان بالنسبة إلى A', 'A و B متناظرتان بالنسبة إلى C', 'A و C متناظرتان بالنسبة إلى B'],
};

/**
 * Les erreurs que la leçon EXPLIQUE (la carte les cite mot pour mot) : l'ordre des lettres du milieu, l'ordre des
 * sommets du متوازي أضلاع. Leur « لماذا » est écrit dans les modules 1 à 3.
 */
export const MISTAKES = {
  midpoint: {
    wrong: 'I منتصف [AB] يعني $\\overrightarrow{AI} = \\overrightarrow{BI}$',
    why: 'الشعاعان $\\overrightarrow{AI}$ و $\\overrightarrow{BI}$ لهما نفس المنحى ونفس الطول لكن اتجاهين متعاكسين: من A نحو I، ومن B نحو I.',
    right: 'I منتصف [AB] يعني $\\overrightarrow{AI} = \\overrightarrow{IB}$ : الشعاعان يتجهان كلاهما من A نحو B.',
  },
  order: {
    text: '$\\overrightarrow{AB} = \\overrightarrow{CD}$ يعني أن ABDC متوازي أضلاع، لا ABCD: نقرأ الضلعين المتقابلين في الاتجاه نفسه.',
    note: 'في المختبر، وضعُ D حيث $\\overrightarrow{DC} = \\overrightarrow{AB}$ يلوي الراية.',
  },
};

/**
 * « أستعدّ » — les items 3, 4 et 7 (deux affirmations) du manuel (p. 127) et deux affirmations de la plateforme sur
 * le درس 1 (l'égalité de deux vecteurs ; AB = DC ⇔ متوازي أضلاع). Une affirmation par question, une compétence par
 * affirmation. Aucune n'utilise les nombres du نشاط 2 ب.
 */
const PREP_ADD = addition('prerequisite_diagnostic');
const PREP_SRC = (n) => src('prep', 127, 'أستعدّ', n);
export const PREP_ITEMS = [
  { n: '3', skill: 'tanazur', text: 'الرباعي ABCD الآتي متوازي أضلاع. إذن المثلثان ABC و ADC متناظران بالنسبة إلى النقطة O.', answer: true, why: 'O منتصف [AC] و [BD]: نظيرة A هي C، نظيرة B هي D، نظيرة C هي A.', source: PREP_SRC(3), figure: 'prep3' },
  { n: '4', skill: 'muntasaf', text: 'في الشكل أدناه، النقط A، B، C، D تقع على استقامة واحدة و AC = BD . إذن القطعتان [AD] و [BC] لهما نفس المنتصف.', answer: true, why: 'AC = AB + BC و BD = BC + CD فـ AB = CD، ومنه منتصف [BC] هو منتصف [AD].', source: PREP_SRC(4), figure: 'prep4' },
  { n: '7-1', skill: 'qutr', text: 'MNPQ متوازي أضلاع، I نقطة تقاطع قطريه [MP] و [NQ]. إذن M هي نظيرة P بالنسبة إلى I.', answer: true, why: 'قطرا متوازي الأضلاع متناصفان: I منتصف [MP]، فـ M نظيرة P بالنسبة إلى I.', source: PREP_SRC(7) },
  { n: '7-2', skill: 'tanazur', text: 'MNPQ متوازي أضلاع، I نقطة تقاطع قطريه [MP] و [NQ]. إذن N هي نظيرة Q بالنسبة إلى (MP).', answer: false, why: 'N نظيرة Q بالنسبة إلى النقطة I (تناظر مركزي) لا بالنسبة إلى المستقيم (MP) — إلا إذا كان MNPQ معينا.', source: PREP_SRC(7) },
  { n: 'p1', skill: 'tasawi', text: 'إذا كان RS = TU (طولان متساويان) فإن $\\overrightarrow{RS} = \\overrightarrow{TU}$ .', answer: false, why: 'شعاعان متساويان لهما نفس المنحى ونفس الاتجاه ونفس الطول: تساوي الطولين وحده لا يكفي.', source: PREP_ADD },
  { n: 'p2', skill: 'mutawazi', text: 'EFGH رباعي حيث $\\overrightarrow{EF} = \\overrightarrow{HG}$ والنقط E، F، G ليست على استقامة واحدة. إذن EFGH متوازي أضلاع.', answer: true, why: 'الدرس السابق: $\\overrightarrow{EF} = \\overrightarrow{HG}$ تعني أن EFGH متوازي أضلاع.', source: PREP_ADD },
];

/** Les deux mondes du lab (levels.js) : مبتدئ = le foulard et le milieu (plateforme) ; متقدم = la طريقة p. 131. */
export const LAB = {
  beginner: { source: PLATFORM, numbers: { mode: 'midpoint', A: [0, 0], B: [4, 2] } },
  advanced: { source: METHOD_IMAGE.source, numbers: { mode: 'parallelogram', A: [1, 4], B: [2, 1], C: [5, 3] } },
};
