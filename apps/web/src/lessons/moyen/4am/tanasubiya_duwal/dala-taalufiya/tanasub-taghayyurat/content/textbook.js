/**
 * Le contenu du درس 3 « تعيين دالة تآلفية انطلاقًا من عددين وصورتيهما » (unité 7 « الدالة التآلفية »,
 * manuel pp. 77–79) — données pures (aucun JSX). Chaque bloc cite sa source : un élément de
 * docs/sources/4am/unit7/extraction.json (`src(…)`) ou un ajout DÉCLARÉ de la plateforme (`addition(…)`).
 *
 * Ce que le manuel fournit à cette leçon : نشاط 4 « تناسب التغيّرات » (p. 79, destination principale) et
 * le تحدّ de la page d'ouverture (p. 77, °C → °F, doublon DÉCLARÉ : deux points lus (10 ; 50) et (30 ; 86)).
 * Le manuel fourni n'a NI معارف NI طرائق NI exercices : la propriété, sa preuve, les deux méthodes
 * (a puis b ; la جملة معادلتين) sont écrites par la plateforme (`addition('knowledge_formalization')`),
 * dans le vocabulaire du manuel, et jamais présentées comme ses mots.
 */
import { src, addition } from '../../_unit/unitMeta.js';

const FORMAL = addition('knowledge_formalization');

/* ── « أستعدّ » ─────────────────────────────────────────────────────────────────────────────── */
/**
 * Aucun item du « أستعدّ » du manuel n'est destiné à cette leçon (1–5 → L1, 6–7 → L2) : huit
 * affirmations de la plateforme dans la forme du manuel « أصحيح أم خاطئ؟ برّر إجابتك », les deux valeurs
 * de vérité présentes, aucune avec les nombres du نشاط 4 ni du تحدّ. Quatre acquis diagnostiqués :
 * l'image par une fonction affine (sura), l'équation ax + b = m (muadala), la جملة معادلتين (jumla),
 * le calcul sur les relatifs et les décimaux dans un quotient de différences (hisab).
 */
const DIAG = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { skill: 'sura', text: 'إذا كان $f(x) = 3x - 5$ فإنّ $f(4) = 7$ .', answer: true, why: '$f(4) = 3 \\times 4 - 5 = 12 - 5 = 7$', source: DIAG },
  { skill: 'sura', text: 'إذا كان $g(x) = -2x + 1$ فإنّ $g(-3) = -5$ .', answer: false, why: '$g(-3) = -2 \\times (-3) + 1 = 6 + 1 = 7$ : جداء عددين سالبين موجب.', source: DIAG },
  { skill: 'muadala', text: 'حلّ المعادلة $4x + 3 = 23$ هو العدد $5$ .', answer: true, why: '$4x = 23 - 3 = 20$ ، ومنه $x = \\dfrac{20}{4} = 5$', source: DIAG },
  { skill: 'muadala', text: 'العدد الذي صورته $10$ بالدالة $h : x \\longmapsto 2x - 6$ هو $2$ .', answer: false, why: 'نحلّ $2x - 6 = 10$ : $2x = 16$ ومنه $x = 8$ ؛ وفعلًا $h(8) = 16 - 6 = 10$ .', source: DIAG },
  { skill: 'jumla', text: 'الثنائية $(2 ; 3)$ حلّ للجملة $\\begin{cases} x + y = 5 \\\\ 2x - y = 1 \\end{cases}$ .', answer: true, why: '$2 + 3 = 5$ و $2 \\times 2 - 3 = 1$ : المعادلتان محقّقتان معًا.', source: DIAG },
  { skill: 'jumla', text: 'حلّ الجملة $\\begin{cases} 3a + b = 11 \\\\ a + b = 5 \\end{cases}$ هو $(a ; b) = (2 ; 3)$ .', answer: false, why: 'بطرح المعادلتين: $2a = 6$ ، $a = 3$ ثم $b = 5 - 3 = 2$ ؛ أمّا $(2 ; 3)$ فتعطي $3 \\times 2 + 3 = 9 \\neq 11$ .', source: DIAG },
  { skill: 'hisab', text: '$\\dfrac{-7 - 5}{2 - 6} = -3$', answer: false, why: '$-7 - 5 = -12$ و $2 - 6 = -4$ ، و $\\dfrac{-12}{-4} = 3$ : حاصل قسمة عددين سالبين موجب.', source: DIAG },
  { skill: 'hisab', text: '$\\dfrac{13{,}5 - 6}{5 - 2} = 2{,}5$', answer: true, why: '$\\dfrac{7{,}5}{3} = 2{,}5$', source: DIAG },
];

/* ── Module 1 : نشاط 4 « تناسب التغيّرات » (p. 79) ───────────────────────────────────────────── */

/** L'accroche du module 1 (plateforme) : le stade, l'abonnement, l'escalier du laboratoire. */
export const HOOK = {
  source: addition('interaction_generation'),
  headline: 'مناصر في المدرّجات!',
  text: 'فريق المدينة يلعب مقابلاته في المركّب الرياضي. في المخبر كل درجة من السلّم مقابلاتٌ يحضرها المناصر: تمتدّ أفقيًا بعدد المقابلات، وترتفع بما يدفعه مقابلها. هل يتغيّر حاصل قسمة الارتفاع على الامتداد من درجة إلى أخرى؟',
};

/** نشاط 4 — les mots du manuel (p. 79), découpés pour les étapes du module ; rien n'est réécrit. */
export const ACTIVITY = {
  source: src('act-4', 79, 'أنشطة', 4),
  title: 'تناسب التغيّرات',
  situation: '1) لمتابعة مباريات كرة القدم، يعرض مركّب رياضي، يدعو مناصريه إلى الروح الرياضية ونظافة المدرّجات، على مناصري فريق المدينة الصيغة التالية: اشتراك سنوي لموسم رياضي حيث يدفع كل مناصر مبلغ 2000DA يضاف إليه مبلغ 200DA يدفعه عند كل دخول للملعب لمشاهدة مقابلة فريقه المفضّل.',
  q1: [
    '• إذا تابع مناصر 7 مقابلات خلال موسم رياضي، فما هو المبلغ الإجمالي الذي يدفعه؟',
    '• إذا دفع مناصر مبلغا إجماليا قدره 4800DA، فما هو عدد المقابلات التي تابعها؟',
  ],
  q2intro: '2) $f$ هي الدّالة التآلفية التي ترفق بكل عدد المقابلات $x$ المبلغ $f(x)$ الذي يدفعه مناصر.',
  q2: [
    '• بيّن أن $f(x) = 200x + 2000$ .',
    '• ما هي صورة الأعداد 1 ، 4 ، 6 ، 9 ؟',
    '• احسب $f(11)$ و $f(15)$ .',
    '• ما هو العدد الذي صورته 2000؟',
  ],
  q3: '• احسب $\\dfrac{f(4) - f(1)}{4 - 1}$ ، $\\dfrac{f(1) - f(0)}{1 - 0}$ ، $\\dfrac{f(6) - f(4)}{6 - 4}$ . ماذا تلاحظ؟',
  q4: '• على الشكل المقابل $(d)$ هو التمثيل البياني للدالة $f$ ، أكمل البيانات على الشكل بالأعداد المناسبة في مكان النقاط.',
  // les réponses (extraction › act-4 › answer, calculées par build-extraction.py)
  answer: { seven: 3400, matches4800: 14, images: { 1: 2200, 4: 2800, 6: 3200, 9: 3800 }, f11: 4200, f15: 5000, pre2000: 0, ratio: 200 },
};

/** Les calculs du نشاط 4 écrits par la plateforme (le manuel les demande sans les écrire). */
export const ACTIVITY_LINES = {
  source: addition('interaction_generation'),
  seven: 'المبلغ $= 2000 + 7 \\times 200 = 2000 + 1400 = 3400$ DA.',
  matches: 'ما يُدفع عند الدخول: $4800 - 2000 = 2800$ DA ، أي $\\dfrac{2800}{200} = 14$ مقابلة.',
  matchesWrong: '$\\dfrac{4800}{200} = 24$ ينسى الاشتراك السنوي 2000DA الذي يُدفع مرّة واحدة: نطرحه أولًا.',
  show: 'المناصر يدفع 2000DA مرّة واحدة، و 200DA عن كل مقابلة من المقابلات $x$ : المبلغ $f(x) = 200 \\times x + 2000 = 200x + 2000$ .',
  images: '$f(1) = 2200$ ، $f(4) = 2800$ ، $f(6) = 3200$ ، $f(9) = 3800$',
  f11: '$f(11) = 200 \\times 11 + 2000 = 4200$ و $f(15) = 200 \\times 15 + 2000 = 5000$',
  pre2000: '$200x + 2000 = 2000$ ، أي $200x = 0$ ومنه $x = 0$ : المناصر الذي لم يحضر أيّ مقابلة دفع الاشتراك وحده.',
  ratios: '$\\dfrac{f(4) - f(1)}{4 - 1} = \\dfrac{2800 - 2200}{3} = \\dfrac{600}{3} = 200$ ، $\\dfrac{f(1) - f(0)}{1 - 0} = \\dfrac{200}{1} = 200$ ، $\\dfrac{f(6) - f(4)}{6 - 4} = \\dfrac{400}{2} = 200$',
  observe: 'النسبة $\\dfrac{f(x_1) - f(x_2)}{x_1 - x_2}$ ثابتة وتساوي المعامل $a = 200$ : تغيّرات $f(x)$ متناسبة مع تغيّرات $x$ .',
  fill: 'الدرجات: من 4 إلى 6 : $2$ و $400$ ؛ من 6 إلى 10 : $4$ و $800$ ؛ من 10 إلى 12 : $2$ و $400$ ؛ من 12 إلى 15 : $3$ و $600$ — في كل درجة $\\dfrac{400}{2} = \\dfrac{800}{4} = \\dfrac{600}{3} = 200$ .',
};

/* ── Module 2 : le تحدّ de la page d'ouverture (p. 77), doublon déclaré ─────────────────────── */

/**
 * Le تحدّ (extraction › challenge, destination « unit page », `duplicatedIn` tanasub-taghayyurat
 * module 2) : la figure du manuel donne la droite et ses pointillés ; la leçon retient DEUX points lus,
 * (10 ; 50) et (30 ; 86) (destinations › challenge › note), comme deux nombres et leurs images.
 */
export const CHALLENGE = {
  source: src('challenge', 77, 'تحدّ'),
  title: 'تحدّ — من الدرجة سلسيوس إلى الدرجة فهرنهايت',
  text: 'يُمثّل البيان المقابل العلاقة بين الدرجة سلسيوس والدرجة فهرنهايت حيث يُرمز بـ $x$ لدرجة الحرارة بـ $(^{\\circ}\\mathrm{C})$ و $f(x)$ لدرجة الحرارة بـ $(^{\\circ}\\mathrm{F})$.',
  questions: [
    '1) إذا كانت درجة الحرارة $10\\,^{\\circ}\\mathrm{C}$ فما هي الدرجة المقابلة لها بالفهرنهايت؟',
    '2) عبّر عن $f(x)$ بدلالة $x$ .',
  ],
  answer: { f10: 50, a: '1,8', b: 32, rule: 'f(x) = 1{,}8x + 32' },
};

/** La lecture des deux points (plateforme) : le manuel trace la droite et ses pointillés, sans phrase. */
export const CHALLENGE_READ = {
  source: addition('interaction_generation'),
  text: 'نقرأ على البيان نقطتين: $(10 ; 50)$ و $(30 ; 86)$ ، أي $f(10) = 50$ و $f(30) = 86$ .',
  points: [[0, 32], [5, 41], [10, 50], [15, 59], [20, 68], [25, 77], [30, 86], [35, 95], [40, 104]],
};

/* ── Les connaissances (formalisation de la plateforme, vocabulaire du manuel) ───────────────── */
export const KNOWLEDGE = {
  tanasub: {
    source: FORMAL,
    title: 'تناسب التغيّرات',
    rule: 'إذا كانت $f$ دالة تآلفية حيث $f(x) = ax + b$ ، فمن أجل كل عددين متمايزين $x_1$ و $x_2$ : $\\dfrac{f(x_1) - f(x_2)}{x_1 - x_2} = a$ . نقول إنّ تغيّرات $f(x)$ متناسبة مع تغيّرات $x$ ، ومعامل التناسب هو $a$ .',
    example: 'في نشاط 4: $\\dfrac{f(4) - f(1)}{4 - 1} = \\dfrac{600}{3} = 200$ و $\\dfrac{f(6) - f(4)}{6 - 4} = \\dfrac{400}{2} = 200$ : الحاصل هو المعامل $a = 200$ في كل درجة.',
  },
  burhan: {
    source: FORMAL,
    title: 'لماذا يساوي الحاصل المعامل a؟',
    lines: [
      '$f(x_1) - f(x_2) = (a x_1 + b) - (a x_2 + b) = a x_1 - a x_2 = a(x_1 - x_2)$',
      'وبما أنّ $x_1 \\neq x_2$ فإنّ $x_1 - x_2 \\neq 0$ ، فنقسم عليه: $\\dfrac{f(x_1) - f(x_2)}{x_1 - x_2} = a$ .',
    ],
    remark: 'الحدّ الثابت $b$ يختفي في الفرق: لذلك لا يتعلّق الحاصل بالعددين المختارين.',
    warning: 'القسمة على $x_1 - x_2$ تشترط $x_1 \\neq x_2$ : من أجل $x_1 = x_2$ لا درجة، و $\\dfrac{0}{0}$ لا معنى له.',
  },
  hisabA: {
    source: FORMAL,
    title: 'حساب المعامل a من عددين وصورتيهما',
    rule: 'إذا علمنا صورتي عددين متمايزين $x_1$ و $x_2$ بدالة تآلفية $f$ ، فإنّ $a = \\dfrac{f(x_1) - f(x_2)}{x_1 - x_2}$ — نطرح بالترتيب نفسه في البسط وفي المقام.',
    example: 'في التحدّي: $f(10) = 50$ و $f(30) = 86$ ، إذن $a = \\dfrac{86 - 50}{30 - 10} = \\dfrac{36}{20} = 1{,}8$ .',
  },
  hisabB: {
    source: FORMAL,
    title: 'حساب b ثم كتابة f(x)',
    rule: 'بعد معرفة $a$ نعوّض أحد العددين وصورته في $f(x) = ax + b$ : $f(x_1) = a x_1 + b$ ، ومنه $b = f(x_1) - a x_1$ . ثم نكتب $f(x) = ax + b$ ونتحقّق بالعدد الآخر.',
    example: '$b = f(10) - 1{,}8 \\times 10 = 50 - 18 = 32$ ، إذن $f(x) = 1{,}8x + 32$ ؛ تحقّق: $f(30) = 54 + 32 = 86$ .',
  },
  jumla: {
    source: FORMAL,
    title: 'طريقة ثانية: جملة معادلتين',
    rule: 'نكتب أنّ للعددين صورتين معلومتين: $a x_1 + b = f(x_1)$ و $a x_2 + b = f(x_2)$ . هذه جملة معادلتين من الدرجة الأولى بمجهولين $a$ و $b$ ، نحلّها كما تعلّمنا: بطرح المعادلتين نتخلّص من $b$ .',
    example: '$\\begin{cases} 10a + b = 50 \\\\ 30a + b = 86 \\end{cases}$ : بالطرح $20a = 36$ ، أي $a = 1{,}8$ ، ثم $b = 50 - 18 = 32$ .',
  },
};

/** La méthode du تحدّ révélée ligne à ligne (MethodSteps) — écrite par la plateforme. */
export const METHOD = {
  source: FORMAL,
  exercise: 'عيّن الدالة التآلفية $f$ حيث $f(10) = 50$ و $f(30) = 86$ .',
  solution: [
    '$f$ دالة تآلفية، إذن $f(x) = ax + b$ .',
    'تناسب التغيّرات: $a = \\dfrac{f(30) - f(10)}{30 - 10} = \\dfrac{86 - 50}{20} = \\dfrac{36}{20} = 1{,}8$ .',
    'نعوّض العدد 10 وصورته: $1{,}8 \\times 10 + b = 50$ ، أي $18 + b = 50$ ومنه $b = 32$ .',
    'إذن $f(x) = 1{,}8x + 32$ . تحقّق: $f(30) = 1{,}8 \\times 30 + 32 = 54 + 32 = 86$ .',
  ],
  rule: ['لتعيين دالة تآلفية من عددين وصورتيهما: نحسب $a$ بتناسب التغيّرات، ثم $b = f(x_1) - a x_1$ ، ثم نتحقّق بالعدد الآخر.'],
};

/**
 * Trois erreurs que la leçon EXPLIQUE (modules 1–2), reprises telles quelles par la carte.
 * (MISC-TAGHAYYUR-BIDUN-QISMA, MISC-TAGHAYYUR-B-NISBA, MISC-TAGHAYYUR-TARTIB.)
 */
export const MISTAKES = {
  bidunQisma: {
    wrong: 'أخذ فرق الصورتين معاملًا: $a = 86 - 50 = 36$ .',
    why: 'المعامل هو ما يزيده $f(x)$ حين يزيد $x$ بواحد؛ والعددان 10 و 30 بينهما 20 وحدة لا وحدة واحدة: نقسم فرق الصورتين على فرق العددين.',
    right: '$a = \\dfrac{86 - 50}{30 - 10} = \\dfrac{36}{20} = 1{,}8$ .',
  },
  bNisba: {
    wrong: 'حساب $b$ بقسمة الصورة على العدد: $b = \\dfrac{50}{10} = 5$ .',
    why: 'الدالة ليست خطية: حاصل القسمة $\\dfrac{f(x)}{x}$ ليس ثابتًا ولا يساوي $b$ ؛ $b$ هو صورة العدد 0 .',
    right: '$b = f(10) - 1{,}8 \\times 10 = 50 - 18 = 32$ .',
  },
  tartib: {
    wrong: 'طرح الصورتين بترتيب والعددين بالترتيب المعاكس: $\\dfrac{86 - 50}{10 - 30} = -1{,}8$ .',
    why: 'إذا عكسنا ترتيب الطرح في المقام وحده تغيّرت إشارة الحاصل.',
    right: 'نطرح بالترتيب نفسه: $\\dfrac{86 - 50}{30 - 10} = \\dfrac{50 - 86}{10 - 30} = 1{,}8$ .',
  },
};

/** La conclusion de la leçon (la خلاصة de la carte). */
export const TAKEAWAY = {
  source: FORMAL,
  text: 'في دالة تآلفية حاصل قسمة تغيّر الصورتين على تغيّر العددين ثابت يساوي $a$ ؛ لذلك يكفي عددان وصورتاهما: $a$ من هذا الحاصل، ثم $b = f(x_1) - a x_1$ .',
};

/* ── Le laboratoire (slope-stairs) : les props de la leçon ───────────────────────────────────── */
export const LAB = {
  // module 1 — نشاط 4
  m1: {
    beginner: { rule: '50x+100', marks: '0|2|4', theme: 'stadium' },
    advanced: { rule: '200x+2000', marks: '0|1|4|6|10|12|15', shown: 2, theme: 'stadium' },
  },
  // module 2 — deux couples, f inconnue (le تحدّ en متقدم)
  m2: {
    beginner: { points: '4:1300|10:2500', theme: 'stadium' },
    advanced: { points: '10:50|30:86', theme: 'thermo' },
  },
};

/** Le مبتدئ du module 2 (plateforme) : un autre abonnement, deux relevés connus. */
export const BEGINNER_M2 = {
  source: addition('interaction_generation'),
  text: 'نادي الأحياء يعرض على مناصريه اشتراكًا آخر: من حضر 4 مقابلات دفع 1300DA ، ومن حضر 10 مقابلات دفع 2500DA . الصيغة دالة تآلفية لا نعرف عبارتها.',
};
