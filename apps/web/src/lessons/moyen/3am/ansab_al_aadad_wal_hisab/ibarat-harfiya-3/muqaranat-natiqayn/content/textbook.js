/**
 * Le contenu du درس « مقارنة عددين ناطقين » (3AM, unité 4) — données pures. Le manuel (docs/sources/3am/unit4/extraction.json) est la RÉFÉRENCE des الكفاءات :
 * tout est réécrit par la plateforme (autres mots, autres nombres, autres contextes — guide §4ter-bis) ; chaque bloc cite l'élément dont il est tiré (`src`) pour la
 * traçabilité de `check:textbook`. Les tâches du labo (`LAB`) sont celles de `manipulations/levels.js › difference-meter` (module 1) et de
 * `logic/differenceMeter.js › PRESETS.race` (module 3, monde `race`) : recopiées ici, comparées par `content.test.js`.
 */
import { src, addition } from '../../_unit/unitMeta.js';

export const LAB = {
  rail: {
    beginner: [
      { id: 'd1', a: '5/4', b: '3/4', order: '>', diff: '1/2' },
      { id: 'd2', a: '-3/2', b: '-1/2', order: '<', diff: '-1' },
      { id: 'd3', a: '9/11', b: '13/16', order: '>', diff: '1/176' },
    ],
    advanced: [
      { id: 'd4', a: '17/12', b: '10/7', order: '<', diff: '-1/84' },
      { id: 'd5', a: '-7/6', b: '-9/8', order: '<', diff: '-1/24' },
      { id: 'd6', a: '2/5', b: '7/10', order: '<', diff: '-3/10', known: '-0,3' },
    ],
  },
  race: [
    { id: 'e1', A: '3x+5', B: '2x+9', diff: 'x-4', c: '4', below: 'lt', above: 'gt' },
    { id: 'e2', A: '2(x+3)', B: '2x+1', diff: '5', all: 'gt' },
    { id: 'e3', A: 'x²+3', B: 'x²+x', diff: '-x+3', c: '3', below: 'gt', above: 'lt' },
  ],
};

/** Les connaissances (معارف) — les mots de la plateforme. */
export const KNOWLEDGE = {
  side: {
    source: addition('knowledge_formalization'),
    text: 'المجسّ الأحمر على العدد $a$ والأسود على $b$ : تميل الإبرة إلى اليمين عندما يكون $a$ أكبر من $b$ ، وإلى اليسار عندما يكون $a$ أصغر من $b$ ، وتقف عند الصفر عندما $a=b$ ؛ وهذه الجهة هي إشارة الفرق $a-b$ .',
  },
  swap: {
    source: addition('knowledge_formalization'),
    text: 'تبديل المجسّين يبدّل إشارة الفرق ولا يبدّل الترتيب: $b-a=-(a-b)$ ، فمن $a-b=-1$ نجد $b-a=1$ ، والعدد الأصغر هو نفسه في الحالتين.',
  },
  alone: {
    source: addition('knowledge_formalization'),
    text: 'لنعرف ترتيب عددين لا نحتاج إلى العددين: تكفي إشارة فرقهما. إذا كان $a-b=-0{,}3$ فإنّ $a<b$ ؛ وإذا كان $b-a=7$ فإنّ $b>a$ أي $a<b$.',
  },
  rule: {
    source: src('know-5', 60, 'معارف', 5),
    text: 'ليكن $a$ و $b$ عددين ناطقين. $a>b$ معناه $a-b>0$ ، و $a<b$ معناه $a-b<0$ ، و $a=b$ معناه $a-b=0$.',
  },
  example1: {
    source: src('know-5', 60, 'معارف', 5),
    text: 'مثال: $\\frac74-\\frac53=\\frac{21-20}{12}=\\frac1{12}>0$ ، إذن $\\frac74>\\frac53$.',
  },
  example2: {
    source: src('know-5', 60, 'معارف', 5),
    text: 'مثال: $-\\frac{11}8-\\left(-\\frac43\\right)=\\frac{-33+32}{24}=-\\frac1{24}<0$ ، إذن $-\\frac{11}8<-\\frac43$.',
  },
  pi: {
    source: src('self-9', 65, 'أؤكّد تعلّماتي', 9),
    text: 'قد يحتوي العدد على $\\pi$ : $\\frac{\\pi}{2}-\\frac{\\pi}{3}=\\frac{\\pi}{6}>0$ ، فـ $\\frac\\pi2>\\frac\\pi3$ دون أيّ تقريب لـ $\\pi$.',
  },
  expr: {
    source: src('method-5', 61, 'طرائق', 5),
    text: 'لمقارنة عبارتين $A$ و $B$ نبسّط $A-B$ ثم نعيّن إشارته حسب قيم $x$ : إذا كان $A-B=x-4$ فهو موجب عندما $x>4$ ، ومعدوم عندما $x=4$ ، وسالب عندما $x<4$.',
  },
};

/** « تذكّر » — la comparaison de deux fractions (unité 2) : recalled, never rebuilt (item 3am.m1.r05 consolidated). */
export const RECALL_FRACTIONS = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — مقارنة كسرين',
  text: 'قارنّا كسرين بتوحيد مقاميهما: $\\frac58$ و $\\frac23$ تصيران $\\frac{15}{24}$ و $\\frac{16}{24}$ فنقارن البسطين. هنا نعود إلى الفرق: وهو يصلح أيضًا للأعداد السالبة وللعبارات الحرفية.',
  lesson: 'tasawi-muqaranat-kasrayn',
};

/** طريقة p. 61 (« مقارنة عددين ناطقين ») — réécrite, autres nombres. */
export const METHOD_DIFF = {
  source: src('method-5', 61, 'طرائق', 5),
  title: 'أحسب الفرق وأقرأ إشارته',
  exercise: 'قارن العددين $\\frac{11}{8}$ و $\\frac{15}{11}$ ، ثم العددين $-\\frac59$ و $\\frac{4}{-7}$.',
  solution: [
    '1. نحسب الفرق: $\\frac{11}{8}-\\frac{15}{11}=\\frac{11\\times11-15\\times8}{88}=\\frac{121-120}{88}=\\frac1{88}$.',
    '2. نعيّن إشارته: $\\frac1{88}>0$ ، إذن $\\frac{11}{8}>\\frac{15}{11}$.',
    '3. للعدد الثاني: $-\\frac59-\\frac4{-7}=-\\frac59+\\frac47=\\frac{-35+36}{63}=\\frac1{63}$.',
    '4. إشارته موجبة، إذن $-\\frac59>\\frac4{-7}$ ؛ ونكتب الاستنتاج: بما أنّ $a-b>0$ فإنّ $a>b$.',
  ],
  remark: 'يمكن أيضًا كتابة العددين بالمقام الموجب نفسه ثم ترتيب بسطيهما (طريقة الوحدة الثانية)، أمّا الفرق فيصلح للأعداد السالبة وللعبارات الحرفية.',
  rule: 'لمقارنة عددين نحسب فرقهما ونعيّن إشارته ثم نكتب الاستنتاج؛ ولمقارنة عبارتين نبسّط $A-B$ ثم نعيّن إشارته حسب قيم $x$.',
};

/** « أستعدّ » — six affirmations de la plateforme : deux sur la comparaison de fractions (`tasawi-muqaranat-kasrayn`, item 3am.m1.r05 du réseau), deux sur la différence de deux fractions (`jam-tarh-kasrayn`), un sur l'ordre des relatifs (`muqarana-nisbiya`, 2AM), un sur la réduction d'une expression (`tabsit-hadhf-aqwas`). */
export const PREP_ITEMS = [
  { skill: 'qarn', text: '$\\frac58<\\frac23$.', answer: true, why: 'بتوحيد المقامين: $\\frac{15}{24}<\\frac{16}{24}$.', source: addition('prerequisite_diagnostic') },
  { skill: 'qarn', text: '$-\\frac34>-\\frac35$.', answer: false, why: 'نقارن $-0{,}75$ و $-0{,}6$ : العدد $-0{,}75$ هو الأصغر، فـ $-\\frac34<-\\frac35$.', source: addition('prerequisite_diagnostic') },
  { skill: 'tarh', text: '$\\frac56-\\frac34=\\frac1{12}$.', answer: true, why: '$\\frac{10}{12}-\\frac{9}{12}=\\frac1{12}$.', source: addition('prerequisite_diagnostic') },
  { skill: 'tarh', text: '$\\frac25-\\frac37=-\\frac1{35}$.', answer: true, why: '$\\frac{14}{35}-\\frac{15}{35}=-\\frac{1}{35}$.', source: addition('prerequisite_diagnostic') },
  { skill: 'nisbi', text: '$-7<-2$.', answer: true, why: 'من عددين سالبين، الأبعد عن الصفر هو الأصغر: $-7<-2$.', source: addition('prerequisite_diagnostic') },
  { skill: 'ibara', text: '$5x-2-(3x+4)=2x+2$.', answer: false, why: 'نغيّر إشارة كل حدّ داخل القوسين: $5x-2-3x-4=2x-6$.', source: addition('prerequisite_diagnostic') },
];

/** Les erreurs courantes (knowledgeGraph.js les cite). */
export const GUIDE = {
  absFarther: {
    wrong: 'من العددين $-\\frac32$ و $-\\frac12$ الأكبر هو $-\\frac32$ لأنّه الأبعد عن الصفر.',
    why: 'مع العدد السالب يعكس الابتعاد عن الصفر الترتيب: $-\\frac32-\\left(-\\frac12\\right)=-1<0$ ، والإبرة مالت إلى اليسار.',
    right: 'الأكبر هو الذي يعطي فرقًا موجبًا: $-\\frac12>-\\frac32$.',
  },
  subTerms: {
    wrong: 'طرح كسرين بطرح البسطين وطرح المقامين: $\\frac56-\\frac79=\\frac{-2}{-3}$.',
    why: 'الفرق يحتاج مقامًا مشتركًا: $\\frac56-\\frac79=\\frac{15-14}{18}=\\frac1{18}$ ، وليس $\\frac23$.',
    right: 'نوحّد المقامين ثم نطرح البسطين.',
  },
  orderSub: {
    wrong: 'قراءة إشارة $b-a$ كأنها إشارة $a-b$.',
    why: 'تبديل العددين يبدّل إشارة الفرق: $a-b=-1$ و $b-a=1$ ، والترتيب لم يتبدّل.',
    right: 'نعرف أولًا أيّ العددين نطرح منه الآخر ثم نقرأ الإشارة.',
  },
};
