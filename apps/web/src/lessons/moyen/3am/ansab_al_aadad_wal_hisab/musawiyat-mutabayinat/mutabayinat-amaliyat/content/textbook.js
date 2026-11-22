/**
 * Le contenu du درس « المتباينات والعمليات » (3AM, unité 5) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit5/
 * extraction.json : نشاط 2 pp. 72–73, معارف 2 p. 74, طرائق p. 75, أستعدّ p. 71) ; chaque texte montré à l'élève est RÉÉCRIT par la
 * plateforme (guide §4ter-bis : mêmes propriétés et notations, autres mots, autres exemples, autres nombres). La `source` de chaque bloc
 * garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** LE LABO DE L'ENTRÉE — les خيوط النول (`loom-threads`, thème `loom`) : expérience de la plateforme, nombres du preset `levels.js`. */
export const LAB = {
  source: addition('platform_designed_entry'),
  /** Le monde posé SEUL dans معارف (`levels={false}`) : × (−2) fait passer −3 < 2 à 6 > −4. */
  alone: { step: '1', tasks: [{ id: 'm2', kind: 'reach', a: '-3', b: '2', target: ['6', '-4'] }] },
};

/** معارف 2 (p. 74) — les propriétés, RÉÉCRITES avec les exemples de la plateforme. */
export const KNOWLEDGE = {
  add: {
    source: src('know-2a', 74, 'معارف'),
    text: 'من أجل أعداد ناطقة $a$ و $b$ و $c$ : إذا كان $a<b$ فإنّ $a+c<b+c$ و $a-c<b-c$ . أي أنّ المتباينة تحتفظ باتجاهها عندما نضيف إلى طرفيها العدد نفسه أو نطرحه منهما، موجبًا كان أو سالبًا.',
    example: 'مثلًا: إذا كان $y<5$ فإنّ $y+3<8$ و $y-\\frac{1}{2}<\\frac{9}{2}$ .',
  },
  pos: {
    source: src('know-2b', 74, 'معارف'),
    text: 'إذا كان $a<b$ و $c>0$ فإنّ $a\\times c<b\\times c$ و $\\frac{a}{c}<\\frac{b}{c}$ . أي أنّ ضرب طرفي المتباينة في عدد موجب تمامًا (أو قسمتهما عليه) لا يغيّر اتجاهها.',
    example: 'مثلًا: إذا كان $z<-3$ فإنّ $4z<-12$ .',
  },
  neg: {
    source: src('know-2b', 74, 'معارف'),
    text: 'وإذا كان $a<b$ و $c<0$ فإنّ $a\\times c>b\\times c$ و $\\frac{a}{c}>\\frac{b}{c}$ . أي أنّ ضرب طرفي المتباينة في عدد سالب تمامًا (أو قسمتهما عليه) يغيّر اتجاهها.',
    example: 'مثلًا: إذا كان $x<12$ فإنّ $\\frac{x}{-4}>-3$ .',
  },
  weak: {
    source: src('know-2a', 74, 'معارف'),
    text: 'تبقى الخواص صحيحة مع $\\leq$ و $\\geq$ : $a\\leq b$ تُقرأ «$a$ أصغر من أو يساوي $b$» ، و $a\\geq b$ تُقرأ «$a$ أكبر من أو يساوي $b$». والقسمة على $c$ هي الضرب في $\\frac{1}{c}$ الذي له إشارة $c$ نفسها.',
  },
  zero: {
    source: addition('knowledge_formalization'),
    text: 'إذا ضربنا في $0$ صارت المتباينة $0=0$ : لم تعد متباينة تامّة، ولذلك نشترط $c\\neq 0$ في الخاصيتين.',
  },
};

/** « تذكّر » : deux outils déjà acquis, JAMAIS reconstruits ici (frontière de l'unité) ; chacun renvoie à sa leçon. */
export const RECALL = {
  year2: {
    lesson: 'ikhtibar-musawat-mutabayina',
    title: 'تذكّر — السنة الثانية',
    text: 'اختبرنا في السنة الثانية صحّة متباينة بقيمة: $2x+5<15$ خاطئة من أجل $x=6$ لأنّ $17>15$ .',
    source: addition('prior_year_reminder'),
  },
  equality: {
    lesson: 'musawiyat-amaliyat',
    title: 'تذكّر — المساويات والعمليات',
    text: 'إذا كان $a=b$ فإنّ $a+c=b+c$ و $a\\times c=b\\times c$ ، وكذلك $\\frac{a}{c}=\\frac{b}{c}$ مع $c\\neq 0$ : لا يتغيّر شيء مهما كانت إشارة $c$ لأنّ المساواة لا اتجاه لها.',
    source: addition('prior_year_reminder'),
  },
  difference: {
    lesson: 'muqaranat-natiqayn',
    title: 'تذكّر — مقارنة عددين بإشارة فرقهما',
    text: '$a<b$ تعني أنّ $a-b<0$ ، و $a>b$ تعني أنّ $a-b>0$ . نقارن عددين بدراسة إشارة الفرق بينهما.',
    source: addition('prior_year_reminder'),
  },
};

/** طرائق p. 75 — « توظيف خواص المتباينات والعمليات », RÉÉCRITE avec d'autres nombres : A déduire, B comparer, C حصر. */
export const METHOD = {
  deduce: {
    source: src('now-75-2', 75, 'دوري الآن', 2),
    exercise: 'نفترض أنّ $7-2x\\geq 1$ . استنتج متباينة طرفها الأول $x$ .',
    solution: [
      'نطرح $7$ من الطرفين: $7-2x-7\\geq 1-7$ أي $-2x\\geq -6$ .',
      'نقسم الطرفين على $-2$ وهو سالب فنغيّر الاتجاه: $x\\leq 3$ .',
    ],
    rule: 'نستنتج متباينة من أخرى بعمليات على الطرفين معًا، ونغيّر الاتجاه في كل مرّة نضرب أو نقسم فيها في عدد سالب تمامًا.',
  },
  compare: {
    source: src('method-2', 75, 'طرائق'),
    exercise: 'نفترض أنّ $x>2$ ، و $A=4x+1$ و $B=2x+5$ . قارن $A$ و $B$ من أجل $x=3$ ثم $x=\\frac{5}{2}$ ، ضع تخمينًا ثم أثبته.',
    solution: [
      'من أجل $x=3$ : $A=13$ و $B=11$ . ومن أجل $x=\\frac{5}{2}$ : $A=11$ و $B=10$ . نخمّن أنّ $A>B$ .',
      'نحسب الفرق: $A-B=(4x+1)-(2x+5)=2x-4$ .',
      'لدينا $x>2$ ، فبالضرب في $2$ : $2x>4$ ثم بطرح $4$ : $2x-4>0$ . إذن $A-B>0$ أي $A>B$ .',
    ],
    rule: 'نقارن عبارتين بحساب فرقهما، ثم نستعمل خواص المتباينات لنعرف إشارة هذا الفرق.',
  },
  bracket: {
    source: src('ex-19', 79, 'أوظّف تعلّماتي', 19),
    exercise: 'نفترض أنّ $2\\leq t\\leq 5$ . احصر $3t-1$ ثم $-2t+4$ .',
    solution: [
      'نضرب في $3$ : $6\\leq 3t\\leq 15$ ، ثم نطرح $1$ : $5\\leq 3t-1\\leq 14$ .',
      'نضرب في $-2$ فينعكس الاتجاه: $-4\\geq -2t\\geq -10$ ، ونكتبها بالترتيب التصاعدي: $-10\\leq -2t\\leq -4$ .',
      'نضيف $4$ : $-6\\leq -2t+4\\leq 0$ .',
    ],
    rule: 'لنحصر $ax+b$ نحصر $ax$ أولًا ثم نضيف $b$ ؛ وإذا كان $a$ سالبًا تبادل الحدّان موضعيهما فنكتب الأصغر أولًا.',
  },
};

/** « أستعدّ » — أستعدّ p. 71, items 7 et 8, RÉÉCRITS en affirmations (l'ordre de deux relatifs). */
export const PREP_ITEMS = [
  { n: 7, skill: 'tartib', text: '$-\\frac{3}{4}<-\\frac{1}{2}$ .', answer: true, why: '$-\\frac{3}{4}=-0{,}75$ و $-\\frac{1}{2}=-0{,}5$ ، والعدد $-0{,}75$ على يسار $-0{,}5$ .' },
  { n: 8, skill: 'tartib', text: 'العدد الأصغر من بين $-\\frac{7}{3}$ و $-\\frac{8}{3}$ هو $-\\frac{7}{3}$ .', answer: false, why: 'بين عددين سالبين، الأصغر هو الأبعد عن الصفر: $-\\frac{8}{3}<-\\frac{7}{3}$ .' },
].map((it) => ({ ...it, source: src('prep', 71, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon s'appuie sur `2am.m4.r09` (اختبار صحة متباينة بقيمة معلومة, leçon 2AM
 * `ikhtibar-musawat-mutabayina`) et `3am.m1.r01` (جداء عددين نسبيين) ; la leçon sœur publiée donne le dernier (LEARNING_NET.md §4.4).
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'ikhtibar', text: 'من أجل $x=4$ المتباينة $2x-3<5$ صحيحة.', answer: false, why: 'من أجل $x=4$ : $2\\times 4-3=5$ ، و $5<5$ خاطئة.' },
  { skill: 'ikhtibar', text: 'من أجل $y=-1$ المتباينة $3-y>3$ صحيحة.', answer: true, why: 'من أجل $y=-1$ : $3-(-1)=4$ ، و $4>3$ صحيحة.' },
  { skill: 'jidaa', text: '$(-6)\\times\\left(-\\frac{2}{3}\\right)=-4$ .', answer: false, why: 'جداء عددين سالبين موجب: $(-6)\\times\\left(-\\frac{2}{3}\\right)=4$ .' },
  { skill: 'jidaa', text: '$(-5)\\times 1{,}2=-6$ .', answer: true, why: 'جداء عددين مختلفي الإشارة سالب: $5\\times 1{,}2=6$ ، فالناتج $-6$ .' },
  { skill: 'musawiya', text: 'إذا كان $a=b$ فإنّ $-3a=-3b$ .', answer: true, why: 'نضرب طرفي المساواة في العدد نفسه $-3$ : تبقى المساواة صحيحة.' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  subFlip: {
    wrong: 'من $a<b$ أكتب $a-4>b-4$ لأنّني طرحت.',
    why: 'الجمع والطرح لا يغيّران الاتجاه مهما كانت إشارة العدد المضاف أو المطروح.',
    right: '$a-4<b-4$ ، فالطرح يزيح العددين معًا.',
  },
  negNoFlip: {
    wrong: 'من $x>4$ أكتب $-3x>-12$.',
    why: 'الضرب في عدد سالب تمامًا يعكس ترتيب العددين على المستقيم.',
    right: '$-3x<-12$ ، ثم $-3x+5<-7$ .',
  },
  posFlip: {
    wrong: 'من $x<6$ أكتب $3x>18$ لأنّ الأمر ضرب.',
    why: 'الضرب في عدد موجب تمامًا يمدّد المستقيم دون أن يعكسه.',
    right: '$3x<18$ .',
  },
  boundOrder: {
    wrong: 'من $2\\leq t\\leq 5$ أكتب $0\\leq -2t+4\\leq -6$.',
    why: 'بعد الضرب في عدد سالب يتبادل الطرفان موضعيهما: الأصغر يُكتب أولًا.',
    right: '$-6\\leq -2t+4\\leq 0$ .',
  },
  together: 'العملية نفسها بالعدد نفسه على طرفي متباينة: الجمع والطرح يحفظان الاتجاه، والضرب في عدد موجب أيضًا، والضرب في عدد سالب يعكسه.',
  flip: 'نضرب أو نقسم في عدد سالب تمامًا فنغيّر اتجاه المتباينة.',
};
