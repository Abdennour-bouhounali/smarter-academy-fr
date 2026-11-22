/**
 * Les exercices du درس « خاصية فيثاغورس » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres triangles, autres nombres, la même
 * compétence). Chaque exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il
 * remplace (traçabilité de `check:textbook`) ; jamais montré à l'élève (`SourceTag` est muet, `src()` sans `number`). Chaque clé est
 * RECALCULÉE dans ./content.test.js en arithmétique exacte (core/arithmetic/pythagoras.js) et chaque distracteur y est vérifié FAUX.
 * Destinations (docs/sources/3am/unit11/extraction.json) : act-1 (application), ex-1 … ex-9, ex-11 … ex-17, now-1, now-2 (b) → module 4 ;
 * self-1 … self-4 (HDB) → le إختبار أولي (module 8) ; deep-31 → مسألة 2.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_khassiyat-fitaghuras_P1',
  P2: '3am_khassiyat-fitaghuras_P2',
  P3: '3am_khassiyat-fitaghuras_P3',
  P4: '3am_khassiyat-fitaghuras_P4',
};

export const EXERCISES = [
  {
    id: 'act-1', source: src('act-1', 168, 'أنشطة'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'على أضلاع مثلث ABC قائم في A رُسمت ثلاثة مربعات. مساحة المربع البرتقالي (على [AB]) $64\\,\\mathrm{cm}^2$ ، ومساحة المربع البنفسجي (على [AC]) $36\\,\\mathrm{cm}^2$.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'مساحة المربع الأزرق المنشأ على الوتر [BC]', options: ['$100\\,\\mathrm{cm}^2$', '$28\\,\\mathrm{cm}^2$', '$14\\,\\mathrm{cm}^2$'], correct: 0, correction: 'المثلث قائم في A: مساحة المربع على الوتر هي مجموع مساحتي المربعين الآخرين: $64+36=100$.' },
        { label: 'طول الوتر $BC$', options: ['$14\\,\\mathrm{cm}$', '$10\\,\\mathrm{cm}$', '$50\\,\\mathrm{cm}$'], correct: 1, correction: '$BC^2=100$ و $10\\times10=100$ ، إذن $BC=10\\,\\mathrm{cm}$ (لا $8+6=14$).' },
      ],
      explain: 'المربع المنشأ على الوتر يتّسع لما يتّسع له المربعان الآخران معًا.',
    },
    commonError: 'جمع الأطوال 8 + 6 بدل جمع المساحات 64 + 36.',
  },
  {
    id: 'ex-1', source: src('ex-1', 174, 'أوظّف تعلّماتي'), cites: [src('ex-2', 174, 'أوظّف تعلّماتي')], learningPointId: LP.P1, difficulty: 'facile',
    statement: 'اختر المساواة التي تعبّر عن خاصية فيثاغورس في كل حالة.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'المثلث GHI القائم في H (الشكل)', options: ['$GI^2=GH^2+HI^2$', '$GH^2=GI^2+HI^2$', '$HI^2=GH^2+GI^2$'], correct: 0, correction: 'الزاوية القائمة في H، فالوتر هو الضلع المقابل لها $[GI]$.' },
        { label: 'المثلث UVW القائم، ووتره $[VW]$', options: ['$UV^2=UW^2+VW^2$', '$VW^2=UV^2+UW^2$', '$UW^2=UV^2+VW^2$'], correct: 1, correction: 'مربع الوتر $VW^2$ في طرف، ومجموع مربعي الضلعين الآخرين في الطرف الآخر.' },
        { label: 'المثلث ACD القائم في C من شكل فيه أيضًا مثلث ABC قائم في B', options: ['$AC^2=AB^2+BC^2$', '$AD^2=AC^2+CD^2$', '$CD^2=AC^2+AD^2$'], correct: 1, correction: 'في المثلث ACD القائم في C الوتر $[AD]$ ؛ أمّا $AC^2=AB^2+BC^2$ فهي مساواة المثلث ABC.' },
      ],
      explain: 'نعيّن رأس الزاوية القائمة، فالوتر هو الضلع المقابل له.',
    },
    commonError: 'وضع ضلع قائم مكان الوتر.',
  },
  {
    id: 'ex-3', source: src('ex-3', 174, 'أوظّف تعلّماتي'), cites: [src('ex-4', 174, 'أوظّف تعلّماتي'), src('ex-5', 174, 'أوظّف تعلّماتي'), src('now-1', 171, 'دوري الآن')], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'احسب طول الضلع الثالث في كل من المثلثين ① و ② المرسومين.',
    interaction: 'batch',
    question: {
      rows: [
        { label: '① الطول $HF$', options: ['$4{,}9\\,\\mathrm{cm}$', '$3{,}5\\,\\mathrm{cm}$', '$12{,}25\\,\\mathrm{cm}$'], correct: 1, correction: '$HF^2=2{,}1^2+2{,}8^2=4{,}41+7{,}84=12{,}25$ ، و $3{,}5^2=12{,}25$ ، إذن $HF=3{,}5\\,\\mathrm{cm}$.' },
        { label: '② الطول $BC$', options: ['$6\\,\\mathrm{cm}$', '$4\\,\\mathrm{cm}$', '$\\sqrt{48{,}5}\\,\\mathrm{cm}$'], correct: 0, correction: 'الوتر $[AB]$: $BC^2=6{,}5^2-2{,}5^2=42{,}25-6{,}25=36$ ، إذن $BC=6\\,\\mathrm{cm}$.' },
      ],
      explain: 'للوتر نجمع المربعين، ولضلع قائم نطرح مربع الضلع القائم الآخر من مربع الوتر.',
    },
    commonError: 'جمع المربعين في ② مع أنّ المجهول ضلع قائم.',
  },
  {
    id: 'ex-9', source: src('ex-9', 175, 'أوظّف تعلّماتي'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'طُلب حساب الطول EG في المثلث EFG القائم في E (الشكل). كتب زميلك: « حسب خاصية فيثاغورس $EG^2=EF^2+FG^2=81+225=306$ ، إذن $EG\\approx17{,}5\\,\\mathrm{cm}$ ».',
    interaction: 'choice',
    question: {
      prompt: 'ما رأيك في عمل زميلك؟',
      options: ['خاطئ: الوتر هو $[FG]$، فـ $EG^2=15^2-9^2=144$ و $EG=12\\,\\mathrm{cm}$', 'صحيح: $EG\\approx17{,}5\\,\\mathrm{cm}$', 'خاطئ: $EG=15-9=6\\,\\mathrm{cm}$'],
      correct: 0, cols: 1,
      explain: 'الزاوية القائمة في E، فالوتر يقابلها: $[FG]$. ثم إنّ ضلعا قائما لا يمكن أن يكون أطول من الوتر 15. نطرح: $15^2-9^2=225-81=144$ ، و $12^2=144$.',
    },
    commonError: 'أخذ الضلع المطلوب على أنّه الوتر لأنّه المجهول.',
  },
  {
    id: 'ex-11', source: src('ex-11', 175, 'أوظّف تعلّماتي'), cites: [src('ex-12', 175, 'أوظّف تعلّماتي')], learningPointId: LP.P2, difficulty: 'facile',
    statement: 'ABCD مستطيل طوله $AB=6\\,\\mathrm{cm}$ وعرضه $BC=4{,}5\\,\\mathrm{cm}$ (الشكل).',
    interaction: 'numeric',
    question: {
      prompt: 'احسب طول القطر $AC$ بالسنتيمتر.',
      expected: 7.5, display: '7,5',
      explain: 'المثلث ABC قائم في B: $AC^2=6^2+4{,}5^2=36+20{,}25=56{,}25$ ، و $7{,}5^2=56{,}25$ ، إذن $AC=7{,}5\\,\\mathrm{cm}$.',
    },
    commonError: 'جمع الطولين 6 + 4,5 = 10,5.',
  },
  {
    id: 'ex-13', source: src('ex-13', 175, 'أوظّف تعلّماتي'), cites: [src('ex-14', 175, 'أوظّف تعلّماتي'), src('ex-15', 175, 'أوظّف تعلّماتي')], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'KJL مثلث متساوي الساقين رأسه K حيث $KJ=KL=5\\,\\mathrm{cm}$ و $JL=6\\,\\mathrm{cm}$ ، و $[KH]$ ارتفاعه المتعلّق بالقاعدة، فـ H منتصف $[JL]$ (الشكل).',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'الطول $JH$', options: ['$3\\,\\mathrm{cm}$', '$6\\,\\mathrm{cm}$', '$2{,}5\\,\\mathrm{cm}$'], correct: 0, correction: 'H منتصف $[JL]$: $JH=6\\div2=3\\,\\mathrm{cm}$.' },
        { label: 'الارتفاع $KH$', options: ['$\\sqrt{34}\\,\\mathrm{cm}$', '$2\\,\\mathrm{cm}$', '$4\\,\\mathrm{cm}$'], correct: 2, correction: 'المثلث KHJ قائم في H ووتره $[KJ]$: $KH^2=5^2-3^2=16$ ، إذن $KH=4\\,\\mathrm{cm}$.' },
        { label: 'مساحة المثلث KJL', options: ['$12\\,\\mathrm{cm}^2$', '$24\\,\\mathrm{cm}^2$', '$15\\,\\mathrm{cm}^2$'], correct: 0, correction: '$\\dfrac{JL\\times KH}{2}=\\dfrac{6\\times4}{2}=12\\,\\mathrm{cm}^2$.' },
      ],
      explain: 'الارتفاع يقسم المثلث المتساوي الساقين إلى مثلثين قائمين نطبّق في أحدهما خاصية فيثاغورس.',
    },
    commonError: 'أخذ $JL$ كاملا بدل نصفه.',
  },
  {
    id: 'ex-7', source: src('ex-7', 174, 'أوظّف تعلّماتي'), cites: [src('ex-6', 174, 'أوظّف تعلّماتي'), src('ex-8', 175, 'أوظّف تعلّماتي'), src('act-2', 168, 'أنشطة')], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'MNP مثلث قائم في N حيث $MP=6{,}1\\,\\mathrm{cm}$ و $MN=6\\,\\mathrm{cm}$. ضغطت ريم على الآلة الحاسبة: √ ( 6.1 x² − 6 x² ) =',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'ماذا تحسب ريم؟', options: ['الطول $NP$', 'الطول $MP$', 'مساحة المثلث'], correct: 0, correction: '$NP^2=MP^2-MN^2$ ، فـ $\\sqrt{6{,}1^2-6^2}$ هو $NP$.' },
        { label: 'ما الذي يظهر على الشاشة؟', options: ['$0{,}1$', '$1{,}1$', '$12{,}1$'], correct: 1, correction: '$6{,}1^2-6^2=37{,}21-36=1{,}21$ و $1{,}1^2=1{,}21$.' },
        { label: 'ومع $RT=6\\,\\mathrm{cm}$ و $ST=5{,}5\\,\\mathrm{cm}$ في مثلث RST قائم في S: الطول $RS$ مدوّرا إلى $0{,}1$', options: ['$2{,}4\\,\\mathrm{cm}$', '$2{,}3\\,\\mathrm{cm}$', '$0{,}5\\,\\mathrm{cm}$'], correct: 0, correction: '$RS^2=36-30{,}25=5{,}75$ ، الشاشة تعرض $2{,}397915762$ ، فالمدوّر إلى $0{,}1$ هو $2{,}4$ (لا $2{,}3$ المبتور).' },
      ],
      explain: 'القيمة المضبوطة $\\sqrt{5{,}75}$ ، وقيمتها المقرّبة نأخذها بتدوير ما تعرضه الشاشة.',
    },
    commonError: 'بتر العدد 2,39… إلى 2,3 بدل تدويره إلى 2,4.',
  },
  {
    id: 'ex-17', source: src('ex-17', 175, 'أوظّف تعلّماتي'), cites: [src('ex-16', 175, 'أوظّف تعلّماتي'), src('now-2', 171, 'دوري الآن')], learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'مثلث KJL أطوال أضلاعه $KJ=6{,}5\\,\\mathrm{cm}$ و $JL=7{,}2\\,\\mathrm{cm}$ و $KL=9{,}6\\,\\mathrm{cm}$ ؛ رسمه يبدو قائما في J (الشكل).',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'مع أيّ مربع نقارن $KJ^2+JL^2$؟', options: ['$KL^2$ ، مربع أطول الأضلاع', '$KJ^2$', '$JL^2$'], correct: 0, correction: 'لو كان المثلث قائما لكان وتره أطول أضلاعه $[KL]$.' },
        { label: '$KJ^2+JL^2$ و $KL^2$', options: ['$94{,}09$ و $92{,}16$', '$94{,}09$ و $94{,}09$', '$13{,}7$ و $9{,}6$'], correct: 0, correction: '$6{,}5^2+7{,}2^2=42{,}25+51{,}84=94{,}09$ ، و $9{,}6^2=92{,}16$.' },
        { label: 'النتيجة', options: ['المثلث قائم في J', 'المثلث غير قائم', 'لا يمكن أن نعرف'], correct: 1, correction: '$KL^2\\neq KJ^2+JL^2$ ، فحسب خاصية فيثاغورس المثلث KJL غير قائم، مع أنّ رسمه يبدو قائما.' },
      ],
      explain: 'الرسم لا يكفي: نقارن مربع أطول الأضلاع بمجموع مربعي الضلعين الآخرين.',
    },
    commonError: 'الحكم بالنظر إلى الرسم.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** « أؤكّد تعلّماتي » 1–4 (p. 177) — repris dans le إختبار أولي (module 8). */
export const SELF = {
  1: { source: src('self-1', 177, 'أؤكّد تعلّماتي') },
  2: { source: src('self-2', 177, 'أؤكّد تعلّماتي') },
  3: { source: src('self-3', 177, 'أؤكّد تعلّماتي') },
  4: { source: src('self-4', 177, 'أؤكّد تعلّماتي') },
};

/**
 * Les cinq épreuves du إختبار أولي (module 8), en DONNÉES pour que ./content.test.js recalcule chaque clé (exacte) et vérifie chaque
 * distracteur FAUX. `kind` : `equality` (le vrai côté opposé à l'angle droit), `hyp` (legs → hypoténuse), `leg` (hypoténuse et un
 * côté → l'autre), `rounded` (√ arrondi), `notRight` (trois longueurs).
 */
export const FINAL = [
  { id: 'E1', lp: LP.P1, kind: 'equality', right: 'M', tri: ['L', 'M', 'N'],
    options: ['$LN^2=LM^2+MN^2$', '$LM^2=LN^2+MN^2$', '$MN^2=LM^2+LN^2$', '$LN=LM+MN$'], correct: 0 },
  { id: 'E2', lp: LP.P2, kind: 'hyp', legs: ['8', '6'], key: '10',
    options: ['$10\\,\\mathrm{cm}$', '$14\\,\\mathrm{cm}$', '$100\\,\\mathrm{cm}$', '$\\sqrt{28}\\,\\mathrm{cm}$'], correct: 0 },
  { id: 'E3', lp: LP.P2, kind: 'leg', hyp: '13', leg: '5', key: '12',
    options: ['$12\\,\\mathrm{cm}$', '$\\sqrt{194}\\,\\mathrm{cm}$', '$8\\,\\mathrm{cm}$', '$144\\,\\mathrm{cm}$'], correct: 0 },
  { id: 'E4', lp: LP.P3, kind: 'rounded', legs: ['3', '5'], places: 1, key: '5,8',
    options: ['$\\sqrt{34}\\approx5{,}8\\,\\mathrm{cm}$', '$\\sqrt{34}\\approx5{,}9\\,\\mathrm{cm}$', '$8\\,\\mathrm{cm}$', '$17\\,\\mathrm{cm}$'], correct: 0 },
  { id: 'E5', lp: LP.P4, kind: 'notRight', sides: ['5,1', '6,8', '8,6'],
    options: ['غير قائم، لأنّ $8{,}6^2\\neq5{,}1^2+6{,}8^2$', 'قائم، لأنّ $5{,}1^2+6{,}8^2$ قريب جدا من $8{,}6^2$', 'قائم، لأنّ أحد أضلاعه أطول من الآخرين', 'لا يمكن الحكم دون منقلة'], correct: 0 },
];
