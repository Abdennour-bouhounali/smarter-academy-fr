import MathText from '../../../../../common/components/MathText';
import { SourceTag } from '../../../../../common/textbook';
import { ACTIVITY, ACTIVITY_LINES, CHALLENGE, FORGE_LINE, KNOW5, METHOD_ANGLE, METHOD_CONSTRUCT, METHOD_SIDE, FORMAL_SOURCE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE dans la règle s'écrit en rouge. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

/**
 * Les connaissances du درس « المضلعات المنتظمة وتطبيقاتها » — SOURCE UNIQUE.
 *
 *   module 1 (التحدّي ونشاط 5)  ruus-bidawaran — les sommets, images successives d'un sommet par (O, α) ; la figure se ferme
 *                               ⇔ n × α = 360° (le geste du lab, la réponse du تحدّ) ; muthallath-120 — le نشاط 5 ;
 *   module 2 (معارف 5)          tarif-muntazam, daira-muhita, markaziya-360, surat-mudalla ;
 *   module 3 (طرائق)            zawiyat-mudalla (108°, (n − 2)·180°/n), insha-mudalla (la construction par rotation),
 *                               dil-mudalla (le côté à partir du rayon).
 */
const Body = ({ lines, source }) => (
  <div className="space-y-1.5">
    {lines.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
    {source && <SourceTag source={source} />}
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'ruus-bidawaran', type: 'concepts', title: 'الرؤوس صور بالدوران',
        memo: {
          rule: `n\\times ${R('\\alpha')}=360^{\\circ}`,
          hook: 'تنغلق حين تكمل دورة',
          example: `6\\times ${R('60^{\\circ}')}=360^{\\circ}`,
          trap: 'ظنّ أن كل زاوية زوجية تغلق الحلقة',
          exam: 'اكتب أن عدد الدورانات مضروبا في الزاوية يساوي دورة كاملة',
          chip: `n\\times\\alpha=360^{\\circ}`,
          quiz: [
            { q: 'دورنا رأسا بالزاوية $72^\\circ$ مرة بعد مرة. تنغلق الحلقة بعد:', options: ['$5$ دورانات', '$4$ دورانات', '$6$ دورانات'], correct: 0 },
            { q: 'بالزاوية $50^\\circ$ تكون الحلقة:', options: ['لا تنغلق لأن $360 \\div 50$ ليس عددا صحيحا', 'تنغلق بعد $7$ دورانات', 'تنغلق بعد $8$ دورانات'], correct: 0 },
          ],
        },
        predictPrompt: 'في الورشة: بالزاوية $60^\\circ$ انغلقت خلية النحل بعد ستة دورانات، وبالزاوية $72^\\circ$ انغلقت رؤوس النجمة بعد خمسة، أمّا بالزاوية $50^\\circ$ فلم تنغلق الحلقة. متى تنغلق الحلقة مضلعًا منتظمًا ذا $n$ رأسًا؟ اكتب العلاقة بين $n$ وزاوية الدوران $\\alpha$.',
        summary: 'رؤوس المضلع المنتظم ذي n ضلعا صور متتالية لرأس واحد بالدوران الذي مركزه مركز المضلع وزاويته α؛ والحلقة لا تنغلق على الرأس الأول إلا إذا كان جداء n في α دورة كاملة، أي 360 درجة.',
        body: (
          <div className="space-y-1.5">
            <Body lines={[FORGE_LINE.text, FORGE_LINE.open]} source={FORGE_LINE.source} />
            <Body lines={[CHALLENGE.idea]} source={CHALLENGE.source} />
          </div>
        ),
      },
      {
        id: 'muthallath-120', type: 'regles', title: 'المثلث المتقايس الأضلاع في دائرته',
        memo: {
          rule: `\\widehat{MON}=\\widehat{NOP}=\\widehat{POM}=${R('120^{\\circ}')}`,
          hook: 'ثلاث زوايا مركزية متقايسة',
          example: `3\\times ${R('120^{\\circ}')}=360^{\\circ}`,
          trap: 'ظنّ أن الزاوية المركزية $60^\\circ$ لأن زوايا المثلث $60^\\circ$',
          exam: 'اكتب أن المركزية ضعف المحيطية التي تحصر القوس نفسه',
          chip: `${R('120^{\\circ}')}=2\\times 60^{\\circ}`,
          quiz: [
            { q: 'مثلث متقايس الأضلاع محاط بدائرة مركزها $O$. كل زاوية مركزية قيسها:', options: ['$120^\\circ$', '$60^\\circ$', '$90^\\circ$'], correct: 0 },
            { q: 'دوران مركزه $O$ يحوّل المثلث المتقايس الأضلاع إلى نفسه، زاويته:', options: ['$120^\\circ$', '$60^\\circ$', '$180^\\circ$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المثلث المتقايس الأضلاع $MPN$ المحاط بدائرة مركزها $O$: ماذا تلاحظ على الزوايا المركزية الثلاث $\\widehat{MON}$ و $\\widehat{NOP}$ و $\\widehat{POM}$؟ وأيّ دوران يحوّل المثلث إلى نفسه؟ اكتب القاعدة بكلماتك.',
        summary: 'في المثلث المتقايس الأضلاع المحاط بدائرة مركزها O، الزوايا المركزية الثلاث متقايسة وقيس كل منها 120 درجة، والدوران الذي مركزه O وزاويته 120 درجة يحوّل المثلث إلى نفسه.',
        body: (
          <div className="space-y-1.5">
            <Body lines={[ACTIVITY_LINES.a, ACTIVITY.closing]} source={ACTIVITY.source} />
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'tarif-muntazam', type: 'concepts', title: 'المضلع المنتظم',
        memo: {
          rule: `${R('AB=BC=\\dots')}\\ ,\\ ${R('\\widehat{A}=\\widehat{B}=\\dots')}`,
          hook: 'أضلاع وزوايا معا',
          example: `AB=r\\ ,\\ \\widehat{A}=${R('120^{\\circ}')}`,
          trap: 'الاكتفاء بتساوي الأضلاع كما في المعين',
          exam: 'اكتب أن الأضلاع متقايسة وأن الزوايا متقايسة',
          chip: `AB=BC=\\dots`,
          quiz: [
            { q: 'مضلع أضلاعه كلها متقايسة لكن زواياه مختلفة (كالمعين) هو:', options: ['ليس منتظما', 'منتظم', 'مربع دائما'], correct: 0 },
            { q: 'المضلع المنتظم ذو $4$ أضلاع هو:', options: ['المربع', 'المستطيل غير المربع', 'المعين غير المربع'], correct: 0 },
          ],
        },
        predictPrompt: 'خلية النحل السداسية، والخماسي الذي رؤوسه رؤوس نجمة العلم، والمثلث $MPN$: ماذا تلاحظ على أضلاع كل منها وعلى زواياه؟ متى نقول إنّ مضلعًا «منتظم»؟ اكتب التعريف بكلماتك.',
        summary: 'المضلع المنتظم مضلع أضلاعه كلها لها نفس الطول وزواياه كلها متقايسة؛ الشرطان معا.',
        body: <Body lines={[KNOW5.definition]} source={KNOW5.source} />,
      },
      {
        id: 'daira-muhita', type: 'regles', title: 'الدائرة المحيطة ومركز المضلع',
        memo: {
          rule: `OA=OB=OC=${R('r')}`,
          hook: 'كل الرؤوس على دائرة واحدة',
          example: `OA=OB=OC=${R('3')}`,
          trap: 'ظنّ أن الدائرة المحيطة تمس الأضلاع في منتصفاتها',
          exam: 'اكتب أن الرؤوس على دائرة مركزها مركز المضلع',
          chip: `OA=OB=${R('r')}`,
          quiz: [
            { q: 'الدائرة المحيطة بمضلع منتظم تمرّ بـ:', options: ['كل رؤوسه', 'منتصفات أضلاعه', 'رأسين منه فقط'], correct: 0 },
            { q: 'مركز المضلع المنتظم هو:', options: ['مركز دائرته المحيطة', 'أحد رؤوسه', 'منتصف أحد أضلاعه'], correct: 0 },
          ],
        },
        predictPrompt: 'في الورشة صنعت رؤوس الخلية ورؤوس النجمة بتدوير رأس واحد حول النقطة $O$ مرة بعد مرة. ماذا تقول عن بُعد كل رأس عن $O$؟ وماذا تستنتج عن رؤوس أيّ مضلع منتظم وعن النقطة $O$؟',
        summary: 'توجد دائرة تشمل كل رؤوس المضلع المنتظم: الدائرة المحيطة به، ومركزها هو مركز المضلع المنتظم.',
        body: <Body lines={[KNOW5.p1]} source={KNOW5.source} />,
      },
      {
        id: 'markaziya-360', type: 'regles', title: 'الزاوية المركزية لمضلع منتظم',
        memo: {
          rule: `\\widehat{AOB}=\\dfrac{360^{\\circ}}{${R('n')}}`,
          hook: 'دورة كاملة مقسومة على عدد الأضلاع',
          example: `\\dfrac{360^{\\circ}}{${R('6')}}=60^{\\circ}`,
          trap: 'قسمة $180$ بدل $360$',
          exam: 'اكتب أن الزاوية المركزية دورة كاملة مقسومة على عدد الأضلاع',
          chip: `\\tfrac{360^{\\circ}}{${R('n')}}`,
          quiz: [
            { q: 'الزاوية المركزية للمربع:', options: ['$90^\\circ$', '$45^\\circ$', '$180^\\circ$'], correct: 0 },
            { q: 'مضلع منتظم زاويته المركزية $40^\\circ$ عدد أضلاعه:', options: ['$9$', '$8$', '$10$'], correct: 0 },
          ],
        },
        summary: 'الزوايا المركزية التي تحصر كل منها ضلعا في مضلع منتظم ذي n ضلعا متقايسة، وقيس كل منها 360 درجة مقسومة على n: 120 للمثلث، 90 للمربع، 60 للسداسي.',
        body: <Body lines={[KNOW5.p2, ...KNOW5.examples.map((e) => `${e.name}: ${e.formula}`)]} source={KNOW5.source} />,
      },
      {
        id: 'surat-mudalla', type: 'regles', title: 'المضلع صورة نفسه بالدوران',
        memo: {
          rule: `A\\xrightarrow{${R('\\widehat{AOB}')}}B`,
          hook: 'كل رأس يذهب إلى الذي يليه',
          example: `A\\xrightarrow{${R('72^{\\circ}')}}B`,
          trap: 'نسيان أن مركز الدوران هو مركز المضلع',
          exam: 'اكتب أن المضلع هو صورة نفسه بدوران مركزه مركز المضلع',
          chip: `A\\xrightarrow{${R('\\alpha')}}B`,
          quiz: [
            { q: 'الدوران الذي مركزه $O$ وزاويته $\\widehat{AOB}$ يحوّل $A$ إلى:', options: ['$B$', '$C$', '$A$'], correct: 0 },
            { q: 'صورة الخماسي المنتظم بدوران مركزه مركز الخماسي وزاويته $72^\\circ$ هي:', options: ['الخماسي نفسه', 'خماسي أصغر', 'نجمة'], correct: 0 },
          ],
        },
        predictPrompt: 'في نشاط 5، الدوران الذي مركزه $O$ وزاويته $120^\\circ$ نقل $P$ إلى $M$ و $M$ إلى $N$ و $N$ إلى $P$. إذا كان $[AB]$ ضلعًا في مضلع منتظم مركزه $O$، فما الدوران الذي يحوّل هذا المضلع كلّه إلى نفسه؟ اكتب الخاصية بكلماتك.',
        summary: 'إذا كان [AB] ضلعا في مضلع منتظم مركزه O، فإن صورة هذا المضلع بالدوران الذي مركزه O وزاويته AOB هي المضلع نفسه.',
        body: <Body lines={[KNOW5.p3]} source={KNOW5.source} />,
      },
    ],
    3: [
      {
        id: 'zawiyat-mudalla', type: 'methodes', title: 'زاوية المضلع المنتظم',
        memo: {
          rule: `\\widehat{A}=180^{\\circ}-${R('\\dfrac{360^{\\circ}}{n}')}`,
          hook: 'ناقص الزاوية المركزية من 180',
          example: `180^{\\circ}-${R('72^{\\circ}')}=108^{\\circ}`,
          trap: 'الخلط بين زاوية المضلع والزاوية المركزية',
          exam: 'اكتب زاوية المضلع انطلاقا من المركزية في مثلث متساوي الساقين',
          chip: `180^{\\circ}-\\alpha`,
          quiz: [
            { q: 'زاوية السداسي المنتظم:', options: ['$120^\\circ$', '$60^\\circ$', '$108^\\circ$'], correct: 0 },
            { q: 'زاوية الخماسي المنتظم:', options: ['$108^\\circ$', '$72^\\circ$', '$120^\\circ$'], correct: 0 },
          ],
        },
        predictPrompt: 'حسبت زاوية الخماسي المنتظم $\\widehat{BAE}$ انطلاقًا من زاويته المركزية $\\widehat{AOE}$. لو كان المضلع المنتظم سداسيًا أو ذا $n$ ضلعًا، بأيّ خطوات تحسب زاويته؟ اكتب الطريقة.',
        summary: 'لحساب زاوية مضلع منتظم: الزاوية المركزية، ثم زاويتا قاعدة المثلث المتساوي الساقين الذي رأسه المركز، ثم نضاعف؛ للخماسي المنتظم 108 درجات، وفي الحالة العامة 180 درجة ناقص الزاوية المركزية.',
        body: (
          <div className="space-y-1.5">
            <Body lines={METHOD_ANGLE.solution} source={METHOD_ANGLE.source} />
            <Body lines={[METHOD_ANGLE.general]} source={FORMAL_SOURCE} />
          </div>
        ),
      },
      {
        id: 'insha-mudalla', type: 'methodes', title: 'إنشاء مضلع منتظم',
        memo: {
          rule: `E=r(A\\,;\\,${R('\\widehat{A}')})(B)`,
          hook: 'رأس جديد بدوران زاويته زاوية المضلع',
          example: `E=r(A\\,;\\,${R('108^{\\circ}')})(B)`,
          trap: 'استعمال الزاوية المركزية بدل زاوية المضلع لدوران رأس',
          exam: 'اكتب مركز الدوران وزاويته واتجاهه ثم صورة الرأس',
          chip: `r(A\\,;\\,\\widehat{A})`,
          quiz: [
            { q: 'لإنشاء الرأس $E$ من $B$ في خماسي منتظم نستعمل دورانا مركزه $A$ وزاويته:', options: ['$108^\\circ$', '$72^\\circ$', '$36^\\circ$'], correct: 0 },
            { q: 'نجد مركز المضلع المنتظم بتقاطع:', options: ['محوري ضلعين', 'منتصفي ضلعين', 'رأسين متجاورين'], correct: 0 },
          ],
        },
        predictPrompt: 'تريد إنشاء خماسي منتظم $ABCDE$ ضلعه $3\\,\\mathrm{cm}$ ولا تعرف مركزه، وقد حسبت للتو أنّ زاوية الخماسي $108^\\circ$. انطلاقًا من القطعة $[AB]$: كيف تنشئ الرأس $E$؟ ثم كيف تجد المركز $O$ وتكمل الرؤوس؟ اكتب الطريقة.',
        summary: 'لإنشاء خماسي منتظم علم ضلعه: نبني رأسا جديدا صورة رأس بالدوران الذي مركزه رأس آخر وزاويته زاوية المضلع، ثم نجد المركز بتقاطع محوري ضلعين، ونكمل بالمدور. وإذا علمنا المركز فكل رأس صورة الذي قبله بالدوران الذي زاويته الزاوية المركزية.',
        body: (
          <div className="space-y-1.5">
            <Body lines={METHOD_CONSTRUCT.solution} source={METHOD_CONSTRUCT.source} />
            <Body lines={[FORGE_LINE.text]} source={FORGE_LINE.source} />
          </div>
        ),
      },
      {
        id: 'dil-mudalla', type: 'methodes', title: 'طول الضلع ونصف القطر',
        memo: {
          rule: `AB=2${R('r')}\\sin\\dfrac{180^{\\circ}}{n}`,
          hook: 'ضعف الجيب لنصف الزاوية',
          example: `AB=2\\times ${R('3')}\\times\\sin 30^{\\circ}=3`,
          trap: 'نسيان أن الجيب يعطي نصف الضلع فقط',
          exam: 'اكتب المثلث القائم ثم نصف الزاوية المركزية ثم الضلع',
          chip: `2r\\sin\\tfrac{180^{\\circ}}{n}`,
          quiz: [
            { q: 'سداسي منتظم نصف قطره $4$، طول ضلعه:', options: ['$4$', '$8$', '$2$'], correct: 0 },
            { q: 'ضلع المربع المحاط بدائرة نصف قطرها $r$:', options: ['$r\\sqrt{2}$', '$r$', '$2r$'], correct: 0 },
          ],
        },
        predictPrompt: 'حسبت طول ضلع المثلث المتقايس الأضلاع انطلاقًا من نصف قطر دائرته $\\sqrt{3}$ في المثلث القائم $OAH$. لو أعطيناك نصف قطر الدائرة المحيطة بمربع أو بسداسي منتظم، بأيّ خطوات تحسب طول ضلعه؟ اكتب الطريقة.',
        summary: 'طول ضلع مضلع منتظم من نصف قطر دائرته: في المثلث القائم الذي رأسه المركز ونصف الضلع، نستعمل النسب المثلثية؛ للمثلث المتقايس الأضلاع r جذر 3، للمربع r جذر 2، وللسداسي الضلع يساوي نصف القطر.',
        body: (
          <div className="space-y-1.5">
            <Body lines={METHOD_SIDE.solution} source={METHOD_SIDE.source} />
            <Body lines={[METHOD_SIDE.general]} source={FORMAL_SOURCE} />
          </div>
        ),
      },
    ],
  },
};
