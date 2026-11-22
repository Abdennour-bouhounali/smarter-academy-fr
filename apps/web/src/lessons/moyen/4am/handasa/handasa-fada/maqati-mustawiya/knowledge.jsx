import MathText from '../../../../../common/components/MathText';
import SpaceFigure from '../../../../../common/components/SpaceFigure';
import { SourceTag } from '../../../../../common/textbook';
import { ACTIVITY, KNOW3, KNOW_APEX, METHOD_RADIUS, METHOD_CYLINDER } from './content/textbook';
import { FIG_KNOW3_IN, FIG_KNOW_CONE } from './content/figures';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « المقاطع المستوية للمجسمات المألوفة » — SOURCE UNIQUE.
 *
 *   module 1 (نشاط 2)          maqta-tajribi — les couches de la sphère imprimées par l'élève : un cercle qui rétrécit quand
 *                              le plan s'éloigne de O, un point au pôle (la conclusion du نشاط 2) ;
 *   module 2 (معارف 3 + ajout) maqta-kura (أ : la propriété et ses quatre cas), maqta-balata (ب : face, arête — titre rétabli),
 *                              maqta-ustuwana (جـ : base, axe), maqta-haram (د : pyramide et cône — معارف من المنصّة) ;
 *   module 3 (طرائق ص 169)     tariqat-nisf-qutr (Pythagore dans OO′M), tariqat-ustuwana (la largeur 2√(r² − d²) — نشاط 4 et
 *                              دوري الآن, écrite par la plateforme).
 */
const Body = ({ lines, source, children }) => (
  <div className="space-y-1.5">
    {lines.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
    {children}
    <SourceTag source={source} />
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'maqta-tajribi', type: 'concepts', title: 'طبقات الكرة',
        memo: {
          rule: 'r^2=R^2-\\textcolor{#e11d48}{h^2}',
          hook: 'كل طبقة مقطع، تصغر بالابتعاد',
          example: 'R=5,\\ h=3:\\ r^2=25-9=16',
          trap: 'الطابعة لا تصغّر شيئا: الكرة هي التي تضيق',
          exam: 'اكتب أن الطبقة مقطع للكرة بمستو قبل أي حساب',
          chip: 'r^2=R^2-h^2',
          quiz: [
            { q: 'كلما ابتعد المستوي عن مركز الكرة فإن شعاع الدائرة المطبوعة:', options: ['يصغر', 'يكبر', 'لا يتغير'], correct: 0 },
            { q: 'كرة $R=5$ ومستو على بعد $h=3$ : قيمة $r^2$ هي:', options: ['$16$', '$34$', '$4$'], correct: 0 },
          ],
        },
        predictPrompt: 'طبعتَ طبقات الكرة التي نصف قطرها 3 عند $x = 0$ ثم $1{,}25$ ثم $2$ ثم $2{,}8$ ثم $x = 3$ . ماذا تستنتج: ما شكل كل طبقة، وكيف تتغيّر كلما ابتعد المستوي عن المركز O، وماذا تطبع الطابعة عند القطب N؟',
        summary: 'كل طبقة تطبعها الطابعة مقطع للكرة بمستو: دائرة تصغر كلما ابتعد المستوي عن المركز، ونقطة واحدة عندما يمسّ المستوي الكرة.',
        body: <Body lines={[ACTIVITY.closing]} source={ACTIVITY.source} />,
      },
    ],
    2: [
      {
        id: 'maqta-kura', type: 'regles', title: 'مقطع كرة بمستو',
        memo: {
          rule: 'r=\\sqrt{R^2-\\textcolor{#e11d48}{h^2}}',
          hook: 'المقطع دائرة ما دام h أصغر من R',
          example: 'R=3,\\ h=2:\\ r=\\sqrt{5}',
          trap: 'الشعاع ليس R ناقص h بل جذر الفرق بين المربعين',
          exam: 'طبّق فيثاغورس في المثلث OAM القائم في A',
          chip: 'r=\\sqrt{R^2-h^2}',
          quiz: [
            { q: 'كرة $R=3$ ومستو على بعد $h=2$ ، شعاع المقطع:', options: ['$\\sqrt{5}$', '$1$', '$\\sqrt{13}$'], correct: 0 },
            { q: 'إذا كان $h=R$ فالمقطع:', options: ['نقطة واحدة', 'دائرة كبرى', 'لا شيء'], correct: 0 },
          ],
        },
        predictPrompt: 'في نشاط 2 كتبت $IM^2 = 9 - x^2$ لكرة نصف قطرها 3، وطبعت طبقات عند $x = 0$ و $x = 3$ وبينهما. لكرة مركزها O ونصف قطرها R ومستو يبعد عن O بالمسافة h: ما مقطع الكرة بهذا المستوي، وكيف تحسب نصف قطره؟ ميّز الحالات حسب قيمة h.',
        summary: 'مقطع كرة مركزها O ونصف قطرها R بمستو عمودي على قطرها [NS] في A ويبعد عن O بالمسافة h: دائرة مركزها A ونصف قطرها جذر الفرق بين مربعي R و h إذا كان h أصغر من R، دائرة كبرى إذا كان h معدوما، نقطة تماس إذا كان h يساوي R، ولا شيء إذا كان h أكبر من R.',
        body: (
          <Body lines={[KNOW3.property, KNOW3.setup, KNOW3.inside, KNOW3.zero, KNOW3.tangent, KNOW3.outside]} source={KNOW3.source}>
            <SpaceFigure {...FIG_KNOW3_IN} />
          </Body>
        ),
      },
      {
        id: 'maqta-balata', type: 'regles', title: 'مقطع بلاطة قائمة بمستو',
        memo: {
          rule: '\\text{face}\\parallel\\ \\Rightarrow\\ a\\times b',
          hook: 'موازٍ لوجه فمطابق له',
          example: '25\\times20\\ \\text{or}\\ 20\\times6',
          trap: 'مقطع يوازي حرفا ليس بالضرورة مطابقا لوجه',
          exam: 'ابنِ المستطيل ببعديه من الوجه الموازي أو من الحرف',
          chip: 'a\\times b',
          quiz: [
            { q: 'مقطع بلاطة بمستو موازٍ لأحد أوجهها هو:', options: ['مستطيل بعداه بعدا ذلك الوجه', 'مربع دائما', 'دائرة'], correct: 0 },
            { q: 'مقطع بلاطة بمستو موازٍ لأحد أحرفها مستطيل أحد بعديه:', options: ['طول ذلك الحرف', 'نصف الحرف', 'قطر الوجه'], correct: 0 },
          ],
        },
        predictPrompt: 'في نشاط 3 قطعت البلاطة التي أبعادها $25$ و $20$ و $6$ بمستو يوازي الوجه CBFG، ثم بمستو يوازي الحرف $[CG]$ الذي طوله $6$ . اكتب القاعدة: ما طبيعة المقطع في كل حالة، وبماذا ترتبط أبعاده؟',
        summary: 'مقطع بلاطة قائمة بمستو موازٍ لأحد أوجهها مستطيل له نفس بعدي ذلك الوجه، وبمستو موازٍ لأحد أحرفها مستطيل طوله أو عرضه يساوي طول ذلك الحرف.',
        body: <Body lines={[KNOW3.cuboidFace, KNOW3.cuboidEdge]} source={KNOW3.source} />,
      },
      {
        id: 'maqta-ustuwana', type: 'regles', title: 'مقطعا أسطوانة الدوران',
        memo: {
          rule: '\\begin{aligned}\\text{base}&:\\ r\\\\\\text{axis}&:\\ 2\\sqrt{r^2-\\textcolor{#e11d48}{d^2}}\\end{aligned}',
          hook: 'موازٍ للقاعدة دائرة وللمحور مستطيل',
          example: 'r=1{,}7,\\ d=0{,}8:\\ 2\\times1{,}5=3',
          trap: 'عرض المستطيل ضعف جذر الفرق وليس ضعف r',
          exam: 'ميّز أولا هل المستوي يوازي القاعدة أو المحور',
          chip: '2\\sqrt{r^2-d^2}',
          quiz: [
            { q: 'مقطع أسطوانة بمستو موازٍ لقاعدتها هو:', options: ['دائرة نصف قطرها نصف قطر القاعدة', 'مستطيل', 'دائرة أصغر دائما'], correct: 0 },
            { q: 'مقطع أسطوانة بمستو موازٍ لمحورها هو:', options: ['مستطيل', 'دائرة', 'نقطة'], correct: 0 },
          ],
        },
        predictPrompt: 'في نشاط 4 قطعت الأسطوانة التي نصف قطرها $1{,}7$ وارتفاعها $6$ بمستو يوازي قاعدتها، ثم بمستو يوازي محورها. اكتب القاعدة: ما طبيعة المقطع في كل حالة، وأيّ بعد من أبعاده تعرفه دون حساب؟',
        summary: 'مقطع أسطوانة دوران بمستو موازٍ لقاعدتها دائرة لها نفس نصف قطر القاعدة ومركزها على المحور، وبمستو موازٍ لمحورها مستطيل طوله أو عرضه ارتفاع الأسطوانة.',
        body: <Body lines={[KNOW3.cylinderBase, KNOW3.cylinderAxis]} source={KNOW3.source} />,
      },
      {
        id: 'maqta-haram', type: 'regles', title: 'مقطع الهرم والمخروط',
        memo: {
          rule: 'k=\\dfrac{SE}{SA}',
          hook: 'موازٍ للقاعدة فتصغير بنسبة k',
          example: 'k=\\dfrac{3}{4}:\\ 4\\to3',
          trap: 'لا تضرب المساحة في k بل في مربعه',
          exam: 'اكتب النسبة SE على SA ثم اضرب الأطوال فيها',
          chip: 'k=\\tfrac{SE}{SA}',
          quiz: [
            { q: 'مقطع هرم قاعدته مربع بمستو موازٍ لقاعدته هو:', options: ['مربع تصغير للقاعدة', 'مستطيل غير مربع', 'مثلث'], correct: 0 },
            { q: 'إذا كان $k=\\frac{3}{4}$ وضلع القاعدة $4$ فضلع المقطع:', options: ['$3$', '$\\frac{16}{3}$', '$1$'], correct: 0 },
          ],
        },
        predictPrompt: 'في نشاط 5 قطعت الهرم SABCD الذي ضلع قاعدته $4$ بمستو يوازي القاعدة حيث $\\dfrac{SE}{SA} = \\dfrac{3}{4}$ ، فوجدت الرباعي EFGH. لهرم أو مخروط يقطعه مستو يوازي قاعدته: ما علاقة المقطع بالقاعدة، وكيف تحسب أبعاده؟ اكتب القاعدة.',
        summary: 'مقطع هرم أو مخروط دوران بمستو موازٍ لقاعدته تصغير لهذه القاعدة: إذا قطع المستوي الحرف [SA] في E فنسبة التصغير k تساوي SE على SA، والأضلاع أو نصف القطر تُضرب في k.',
        body: (
          <Body lines={[KNOW_APEX.pyramid, KNOW_APEX.cone]} source={KNOW_APEX.source}>
            <p className="font-semibold"><MathText>{'E نقطة تقاطع المستوي مع الحرف $[SA]$ : نسبة التصغير $k = \\dfrac{SE}{SA}$ تبدأ من الرأس S.'}</MathText></p>
            <SpaceFigure {...FIG_KNOW_CONE} />
          </Body>
        ),
      },
    ],
    3: [
      {
        id: 'tariqat-nisf-qutr', type: 'methodes', title: 'نصف قطر مقطع كرة',
        memo: {
          rule: 'AM^2=OM^2-\\textcolor{#e11d48}{OA^2}',
          hook: 'فيثاغورس في OAM القائم في A',
          example: 'AM^2=3^2-2^2=5',
          trap: 'نسيان أن الوتر هو OM وهو نصف قطر الكرة',
          exam: 'ارسم المثلث القائم ثم طبّق فيثاغورس',
          chip: 'r^2=R^2-h^2',
          quiz: [
            { q: 'في المثلث $OAM$ القائم في $A$ ، الوتر هو:', options: ['$OM$', '$OA$', '$AM$'], correct: 0 },
            { q: 'إذا كان $OM=5$ و $OA=3$ فإن $AM$ يساوي:', options: ['$4$', '$2$', '$\\sqrt{34}$'], correct: 0 },
          ],
        },
        predictPrompt: 'كرة مركزها O ونصف قطرها $2{,}5\\,\\mathrm{cm}$ يقطعها مستو (P) وفق دائرة مركزها O′ حيث $OO\' = 1{,}5\\,\\mathrm{cm}$ (الشكل). كما حسبت $IM^2$ في نشاط 2: بأيّ خطوات تحسب نصف قطر هذه الدائرة؟ اكتب الطريقة: أيّ نقطة تختار، وفي أيّ مثلث تعمل، وماذا تحسب فيه؟',
        summary: 'لحساب نصف قطر مقطع كرة بمستو لا يمر بمركزها نطبّق خاصية فيثاغورس في المثلث القائم الذي رؤوسه مركز الكرة ومركز المقطع ونقطة من المقطع.',
        body: <Body lines={[METHOD_RADIUS.rule, METHOD_RADIUS.solution[2], METHOD_RADIUS.solution[3]]} source={METHOD_RADIUS.source} />,
      },
      {
        id: 'tariqat-ustuwana', type: 'methodes', title: 'عرض مقطع أسطوانة',
        memo: {
          rule: '\\dfrac{\\ell}{2}=\\sqrt{r^2-\\textcolor{#e11d48}{d^2}}',
          hook: 'نصف العرض بفيثاغورس',
          example: '\\sqrt{2{,}89-0{,}64}=1{,}5',
          trap: 'نسيان ضرب الناتج في 2 للحصول على العرض كله',
          exam: 'احسب نصف العرض ثم ضاعفه واذكر الارتفاع',
          chip: '\\ell=2\\sqrt{r^2-d^2}',
          quiz: [
            { q: 'إذا كان $\\sqrt{r^2-d^2}=1{,}5$ فالعرض يساوي:', options: ['$3$', '$1{,}5$', '$0{,}75$'], correct: 0 },
            { q: 'كلما زادت $d$ فإن عرض المستطيل:', options: ['يصغر', 'يكبر', 'لا يتغير'], correct: 0 },
          ],
        },
        predictPrompt: 'في نشاط 4 (نصف القطر $1{,}7$ والمستوي على بعد $0{,}8$ من المحور) وجدت عرض المقطع $3$ ، وفي دوري الآن (نصف القطر $2$ والبعد $1$) وجدت $2\\sqrt{3}$ . لأسطوانة نصف قطرها r يقطعها مستو يوازي محورها على بعد d منه: بأيّ خطوات تحسب بعدي المقطع؟ اكتب الطريقة.',
        summary: 'مقطع أسطوانة دوران بمستو موازٍ لمحورها يبعد عنه بـ d مستطيل: أحد بعديه الارتفاع، والآخر وتر في القاعدة نحسب نصفه بخاصية فيثاغورس.',
        body: <Body lines={[METHOD_CYLINDER.rule]} source={METHOD_CYLINDER.source} />,
      },
    ],
  },
};
