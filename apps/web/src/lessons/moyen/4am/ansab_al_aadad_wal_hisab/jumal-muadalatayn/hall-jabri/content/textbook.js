/**
 * Le contenu du درس 2 « حل جملة معادلتين من الدرجة الأولى بمجهولين جبرياً (طريقتا التعويض والجمع) » — données pures (aucun JSX). Chaque bloc
 * garde son élément de docs/sources/4am/unit5/extraction.json (`src(...)`, métadonnées jamais montrées à l'élève), mais son TEXTE est celui de la
 * PLATEFORME (rollout du lecteur de mission, 2026-11-12 — indépendance du manuel, CLAUDE.md ; conseil du 2026-11-11, verdict L2 et X11 « règle P » :
 * avant le module 4, aucune ligne écrite ne montre un moins devant une parenthèse). Les modules rendent ces données ; ils n'en réécrivent aucune.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * L'ACTIVITÉ du module 1 (élément « act-2 ») — sur la jumla de la PLATEFORME x + 2y = 15 ; 3x − y = 3 → (3 ; 6) (verdict §4, règle P) : إكرام
 * substitue (y = 3x − 3 porté dans (1) : x + 2(3x − 3) = 15, un coefficient POSITIF), إسحاق additionne (× 2 sur (2), puis + (1)). La ثنائية qui
 * vérifie (1) seulement : (9 ; 3). La seconde jumla : x + 2y = 7 ; 3x + 4y = 11 → (−3 ; 5).
 */
const ACT_SRC = src('act-2', 56, 'أنشطة', 2);
export const ACTIVITY = {
  source: ACT_SRC,
  title: 'حل جملة معادلتين من الدرجة الأولى بمجهولين جبريا',
  text: 'إليك جملة المعادلتين الآتية: $\\begin{cases} x + 2y = 15 & ...(1) \\\\ 3x - y = 3 & ...(2) \\end{cases}$',
  questions: [
    'هل الثنائية $(9 ; 3)$ حل للمعادلة (1)؟ هل هي حل لجملة المعادلتين؟',
    'اقترح ثنائية أخرى حلا للمعادلة (1). هل هي حل لجملة المعادلتين؟',
    'لحل هذه الجملة كتبت إكرام وكتب إسحاق:',
    'اشرح عمل كل منهما، واستنتج حل الجملة.',
    'حل بالطريقتين جملة المعادلتين الآتية: $\\begin{cases} x + 2y = 7 \\\\ 3x + 4y = 11 \\end{cases}$',
  ],
  // les deux feuilles, ligne par ligne
  students: {
    1: [
      'من المعادلة (2) نجد $y = 3x - 3$ ، وبالتعويض في المعادلة (1): $x + 2(3x - 3) = 15$ ، وهي معادلة من الدرجة الأولى بالمجهول $x$ .',
      'وبحلها نجد $7x = 21$ أي $x = 3$ .',
      'وبالتعويض في إحدى المعادلتين نجد $y = 6$ .',
    ],
    2: [
      'بضرب المعادلة (2) في العدد 2 نجد $6x - 2y = 6$',
      'وبالجمع مع المعادلة (1) طرفا لطرف نجد المعادلة ذات المجهول $x$ : $7x = 21$',
      'وبحلّها نجد $x = 3$ .',
      'وبالتعويض في إحدى المعادلتين نجد $y = 6$ .',
    ],
  },
  names: { 1: 'إكرام', 2: 'إسحاق' },
  // Les jumal de l'activité (la forme « (1)|(2) » que lit le laboratoire et linearSystem).
  systems: { main: 'x+2y=15|3x-y=3', second: 'x+2y=7|3x+4y=11', onlyFirst: [9, 3] },
};

/**
 * L'ÉNIGME DU KIOSQUE (REAL) — une situation de la PLATEFORME : les ANCIENNES cartes du kiosque, 2x + y = 70 et 3x − 2y = 42 → (26 ; 18). Elle
 * répète le décor ET la méthode de la مسألة : elle vient APRÈS elle, au module 5 (verdict L2.1). Déclarée, jamais cachée.
 */
export const HOOK = {
  source: addition('interaction_generation'),
  headline: 'لغز كشك الحي: البطاقتان القديمتان',
  text: 'قبل العطلة الصيفية كانت في كشك «عمّي الطاهر» قرب المتوسطة، المعروف بأمانته مع زبائنه، بطاقتان أخريان بخط البائع: «قطعتا كرنتيكة وقارورة قازوز: 70 دج» و«ثمن 3 قطع كرنتيكة يزيد بـ 42 دج عن ثمن قارورتي قازوز». كل بطاقة وحدها تقبل أثمانًا كثيرة… أمّا البطاقتان معًا فتحدّدان الثمنين.',
  unknowns: 'نرمز بـ $x$ إلى ثمن قطعة كرنتيكة وبـ $y$ إلى ثمن قارورة قازوز (بالدينار).',
  system: '2x+y=70|3x-2y=42',
  systemTex: '\\begin{cases} 2x + y = 70 \\\\ 3x - 2y = 42 \\end{cases}',
  answer: { x: '26', y: '18' },
  closing: 'من $2x + y = 70$ نجد $y = 70 - 2x$ ، ثم $3x - 2(70 - 2x) = 42$ أي $7x - 140 = 42$ ، ومنه $x = 26$ و $y = 70 - 52 = 18$ . للتحقق: $2 \\times 26 + 18 = 70$ و $3 \\times 26 - 2 \\times 18 = 78 - 36 = 42$ . قطعة الكرنتيكة بـ 26 دج وقارورة القازوز بـ 18 دج.',
};

/** Ce que les deux élèves ont fait, posé en briques au module 1 — avec les nombres de l'activité. */
export const IDEAS = {
  source: addition('interaction_generation'),
  takhallus: 'في العملين تخلّص التلميذ من أحد المجهولين فحصل على معادلة من الدرجة الأولى بمجهول واحد: $x + 2(3x - 3) = 15$ عند إكرام، و $7x = 21$ عند إسحاق.',
  thunaiya: 'بعد إيجاد $x = 3$ نعوّض في إحدى المعادلتين لنجد $y = 6$ : حل الجملة هو الثنائية $(3 ; 6)$ ، ونتحقّق منها في المعادلتين: $3 + 2 \\times 6 = 15$ و $3 \\times 3 - 6 = 3$ .',
  check: 'للتحقق، نعوّض $x$ و $y$ في المعادلتين معًا: الثنائية حل للجملة إذا تحقّقت المعادلتان في آن واحد.',
};

/** Les deux exemples résolus du module 2 (élément « method-example ») — deux jumal de la PLATEFORME, une par méthode. */
const METHOD_SRC = src('method-example', 59, 'طرائق');
export const METHOD = {
  source: METHOD_SRC,
  title: 'حل جملة معادلتين من الدرجة الأولى بمجهولين',
  exercise: 'حل كل من الجملتين: $\\begin{cases} 4x + y = 5 \\\\ x - 2y = 8 \\end{cases}$ ....(1) و $\\begin{cases} 3x + 2y = 11 \\\\ -3x + 5y = 10 \\end{cases}$ ....(2)',
  one: {
    source: METHOD_SRC,
    system: '4x+y=5|x-2y=8',
    exercise: 'الجملة (1): $\\begin{cases} 4x + y = 5 \\\\ x - 2y = 8 \\end{cases}$',
    solution: [
      'حل الجملة (1) بطريقة التعويض.',
      'من المعادلة $x - 2y = 8$ ينتج أن $x = 8 + 2y$ .',
      'بتعويض $x$ بالعبارة $8 + 2y$ في المعادلة $4x + y = 5$ نجد: $4(8 + 2y) + y = 5$ . هذه المعادلة تبسّط على الشكل $32 + 9y = 5$ . إذن $9y = -27$ . بالتالي $y = -3$',
      'نعوض $y$ بالعدد $-3$ في المعادلة $x = 8 + 2y$ ونجد $x = 8 - 6$ . بالتالي $x = 2$ .',
      'للتحقق، نعوض $x$ بالعدد 2 و $y$ بالعدد $-3$ في الجملة المعطاة ونجد: $4 \\times 2 - 3 = 5$ و $2 + 6 = 8$ ، بالتالي الثنائية $(2 ; -3)$ تحقق الجملة (1).',
      'إذن الثنائية $(2 ; -3)$ هي الحل الوحيد للجملة.',
    ],
  },
  two: {
    source: METHOD_SRC,
    system: '3x+2y=11|-3x+5y=10',
    exercise: 'الجملة (2): $\\begin{cases} 3x + 2y = 11 \\\\ -3x + 5y = 10 \\end{cases}$',
    solution: [
      'حل الجملة (2) بطريقة الجمع والتعويض.',
      'بجمع المعادلتين في الجملة (2) طرفا بطرف، نحصل على: $7y = 21$ . منه $y = 3$ .',
      'بالتعويض عن قيمة $y$ في إحدى المعادلتين، نجد: $3x + 2 \\times 3 = 11$ . منه $x = \\dfrac{5}{3}$ .',
      'للتحقق، نعوّض $x$ بالقيمة $\\dfrac{5}{3}$ و $y$ بالقيمة 3 في المعادلتين ونجد: $3 \\times \\dfrac{5}{3} + 2 \\times 3 = 11$ و $-3 \\times \\dfrac{5}{3} + 5 \\times 3 = 10$ أي أنّ الثنائية $\\left(\\dfrac{5}{3} ; 3\\right)$ تحقق الجملة (2).',
      'إذن الثنائية $\\left(\\dfrac{5}{3} ; 3\\right)$ هي الحل الوحيد للجملة.',
    ],
  },
};

/** L'encadré « طريقة » (élément « method-systems »), dit avec les mots de la PLATEFORME. */
export const METHOD_BOX = {
  source: src('method-systems', 59, 'طرائق'),
  title: 'طريقة',
  text: 'لحل جملة معادلتين من الدرجة الأولى بمجهولين نجعل أحد المجهولين يختفي، بإحدى طريقتين:',
  items: [
    'طريقة التعويض: نعبّر عن أحد المجهولين بدلالة الآخر انطلاقًا من إحدى المعادلتين، ثم نضع العبارة الناتجة بين قوسين مكان ذلك المجهول في المعادلة الأخرى.',
    'طريقة الجمع: نضرب طرفي معادلة (أو المعادلتين) في عدد مناسب حتى يصير معاملا أحد المجهولين متعاكسين، ثم نجمع المعادلتين طرفًا لطرف فنحصل على معادلة بمجهول واحد.',
  ],
};

/** Choisir la méthode (point d'apprentissage P3) : une phrase de la PLATEFORME, lue sur les coefficients — déclarée comme telle. */
export const CHOICE = {
  source: addition('interaction_generation'),
  rule: 'نختار الطريقة الأنسب بالنظر إلى المعاملات: إذا كان معامل أحد المجهولين $1$ أو $-1$ في إحدى المعادلتين فالتعويض سهل، لأنّ العبارة الناتجة لا كسور فيها؛ وإذا كان معاملا أحد المجهولين متعاكسين، أو يصيران كذلك بضرب معادلة في عدد بسيط، فالجمع أسرع.',
  sub: 'في الجملة (1) معامل $x$ في $x - 2y = 8$ هو 1: التعويض مناسب.',
  add: 'في الجملة (2) معاملا $x$ متعاكسان ($3x$ و $-3x$): الجمع مباشرة.',
  // les trois jumal de « أيّ طريقة نختار؟ » (module 2) : la bonne raison, puis deux raisons FAUSSES sur la jumla
  rows: [
    { id: 'k1', system: 'y=3x-1|2x+5y=12', tex: '\\begin{cases} y = 3x - 1 \\\\ 2x + 5y = 12 \\end{cases}',
      options: ['التعويض، لأنّ $y$ معبّر عنه بدلالة $x$ في المعادلة الأولى', 'الجمع، لأنّ معاملي $y$ متعاكسان', 'الجمع، لأنّ معاملي $x$ متعاكسان'],
      correct: 0, correction: 'العبارة $3x - 1$ جاهزة: $2x + 5(3x - 1) = 12$ أي $17x = 17$ ، ومنه $x = 1$ و $y = 2$ .' },
    { id: 'k2', system: '5x+3y=7|2x-3y=7', tex: '\\begin{cases} 5x + 3y = 7 \\\\ 2x - 3y = 7 \\end{cases}',
      options: ['التعويض، لأنّ معامل $x$ يساوي 1', 'الجمع، لأنّ معاملي $y$ متعاكسان', 'الجمع، لأنّ معاملي $x$ متعاكسان'],
      correct: 1, correction: '$3y$ و $-3y$ متعاكسان: بالجمع $7x = 14$ ، ومنه $x = 2$ ثم $y = -1$ .' },
    { id: 'k3', system: '4x+3y=10|6x-5y=34', tex: '\\begin{cases} 4x + 3y = 10 \\\\ 6x - 5y = 34 \\end{cases}',
      options: ['التعويض، لأنّ معامل $y$ يساوي 1', 'الجمع مباشرة، لأنّ معاملي $x$ متعاكسان', 'الجمع بعد الضرب في معاملين مناسبين، لأنه لا يوجد معامل يساوي 1 أو $-1$'],
      correct: 2, correction: 'نضرب الأولى في 3 والثانية في $-2$ : $12x + 9y = 30$ و $-12x + 10y = -68$ ؛ بالجمع $19y = -38$ ، ومنه $y = -2$ ثم $x = 4$ .' },
  ],
};

/**
 * Le إختبار أولي (module 7) — E1 et E2 sur des jumal de la PLATEFORME (rollout 2026-11-12, verdict L2 : les items du manuel réécrits, ids, compétences
 * et LP gardés ; l'ancien E2 avait TROIS options justes : il devient un choix à UNE réponse juste).
 */
export const QCM = {
  5: {
    n: 5, source: addition('interaction_generation'),
    text: 'إليك الجملة الآتية: $\\begin{cases} 5x - y = 4 \\\\ 5x + y = 8 \\end{cases}$ حل هذه الجملة هو...',
    options: ['$(1 ; 1)$', '$\\left(2 ; \\dfrac{6}{5}\\right)$', '$\\left(\\dfrac{6}{5} ; 2\\right)$'],
    correct: 2,
    explain: 'بجمع المعادلتين طرفًا لطرف: $10x = 12$ أي $x = \\dfrac{6}{5}$ ، ثم $y = 5x - 4 = 2$ . للتحقق: $5 \\times \\dfrac{6}{5} - 2 = 4$ و $5 \\times \\dfrac{6}{5} + 2 = 8$ . أمّا $(1 ; 1)$ فتحقق المعادلة الأولى وحدها، والثنائية المقلوبة لا تحقق أيًّا منهما.',
  },
  6: {
    n: 6, source: addition('interaction_generation'),
    text: 'من المعادلة $2x - y = 5$ ينتج أن...',
    options: ['$y = 2x - 5$', '$y = 5 - 2x$', '$y = 2x + 5$', '$x = \\dfrac{y - 5}{2}$'],
    correct: 0,
    explain: 'ننقل $-y$ إلى الطرف الثاني و $5$ إلى الأول بتغيير الإشارة: $2x - 5 = y$ أي $y = 2x - 5$ . ومنه أيضًا $x = \\dfrac{y + 5}{2}$ ، لا $\\dfrac{y - 5}{2}$ .',
  },
};

/**
 * « أستعدّ » de la PAGE (l'enseignant) — items 9 et 10 du manuel (p. 55 : extraction › prep › items 9-10 → hall-jabri), puis des affirmations de
 * la plateforme. Le LECTEUR pose l'échelle de content/prep.js (PREP_LADDER).
 */
export const PREP_ITEMS = [
  { n: 9, skill: 'naql', text: 'إذا كان $y + 2x = 1$ فإنّ $y = 1 + 2x$ .', answer: false, why: 'نطرح $2x$ من الطرفين: $y = 1 - 2x$', source: src('prep', 55, 'أستعدّ', 9) },
  { n: 10, skill: 'taawid', text: 'إذا كان $y + 2x = 1$ و $x = 3$ فإنّ $y = 5$ .', answer: false, why: '$y + 6 = 1$ أي $y = -5$', source: src('prep', 55, 'أستعدّ', 10) },
  { skill: 'naql', text: 'إذا كان $x - 3y = 6$ فإنّ $x = 6 + 3y$ .', answer: true, why: 'نضيف $3y$ إلى الطرفين: $x - 3y + 3y = 6 + 3y$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'taawid', text: 'إذا كان $3x + y = 10$ و $y = 4$ فإنّ $x = 2$ .', answer: true, why: '$3x + 4 = 10$ أي $3x = 6$ ومنه $x = 2$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'darb', text: 'إذا كان $x + 2y = 5$ فإنّ $3x + 6y = 15$ .', answer: true, why: 'نضرب الطرفين معًا في 3: $3 \\times 5 = 15$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'darb', text: 'إذا كان $a - b = 4$ فإنّ $2a - 2b = 4$ .', answer: false, why: 'ضربنا طرفًا واحدًا في 2: $2a - 2b = 2 \\times 4 = 8$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'hal', text: 'حل المعادلة $-5x = 15$ هو $-3$ .', answer: true, why: '$x = \\dfrac{15}{-5} = -3$ ، وللتحقق $-5 \\times (-3) = 15$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'hal', text: 'حل المعادلة $4x - 3 = 9$ هو $\\dfrac{3}{2}$ .', answer: false, why: '$4x = 9 + 3 = 12$ ومنه $x = 3$ ؛ و $4 \\times \\dfrac{3}{2} - 3 = 3 \\neq 9$ .', source: addition('prerequisite_diagnostic') },
];
