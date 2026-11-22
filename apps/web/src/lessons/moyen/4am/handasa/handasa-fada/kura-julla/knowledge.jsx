import MathText from '../../../../../common/components/MathText';
import { SourceTag } from '../../../../../common/textbook';
import { ACTIVITY, KNOW1, METHOD_DRAW, METHOD_POINT, METHOD_DISTANCE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « الكرة والجلة (مفهوم والتمثيل الهندسي) » — SOURCE UNIQUE.
 *
 *   module 1 (نشاط 1)   kura-julla-nashat — les deux phrases complétées du نشاط 1 (la كرة : distance r ; la جلّة : ≤ r) ;
 *   module 2 (معارف 1)   tarif-kura, tarif-julla (les deux تعاريف), aqtar (les أقطار, longueur 2R), tawlid (une دائرة qui tourne
 *                       autour d'un قطر engendre la كرة), dawair (دوائر كبرى / صغرى) ;
 *   module 3 (طرائق)     tamthil-kura (représenter une كرة), tamthil-nuqta (représenter un point), masafa-maalam (OM² dans un
 *                       repère de l'espace — méthode DÉCLARÉE de la plateforme, point P4).
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
        id: 'kura-julla-nashat', type: 'concepts', title: 'الكرة والجلة: سطح أجوف ومجسم مملوء',
        memo: {
          rule: '\\begin{aligned}(\\delta)&:\\ OM=\\textcolor{#e11d48}{R}\\\\(\\beta)&:\\ OM\\le\\textcolor{#e11d48}{R}\\end{aligned}',
          hook: 'الكرة سطح والجلة مملوءة',
          example: 'R=3:\\ OM=3\\Rightarrow M\\in(\\delta)',
          trap: 'الجلة تشمل الكرة وكل ما بداخلها وليست الداخل وحده',
          exam: 'للكرة اكتب يساوي نصف القطر، وللجلة أصغر من أو يساوي',
          chip: 'OM=R\\ /\\ OM\\le R',
          quiz: [
            { q: 'نقطة بعدها عن $O$ يساوي $R$ تماما تنتمي إلى:', options: ['الكرة (وهي من الجلة أيضا)', 'الجلة فقط دون الكرة', 'خارج الجلة'], correct: 0 },
            { q: 'نقطة بعدها عن $O$ أصغر تماما من $R$ تنتمي إلى:', options: ['الكرة', 'الجلة وليست على الكرة', 'خارج الجلة'], correct: 1 },
          ],
        },
        predictPrompt: 'في السؤال 1 ميّزت نقاط الدائرة من نقاط القرص ببعدها عن O، وفي السؤال 2 رأيت كرة اليد جوفاء والكرية الحديدية مملوءة حتى مركزها. انقل ذلك إلى الفضاء: بأيّ شرط على بعد نقطة عن O تكون من سطح كرة اليد؟ وبأيّ شرط تكون من الكرية المملوءة كلّها؟ اكتب الجملتين بكلماتك.',
        summary: 'النقط التي تبعد عن O بمسافة ثابتة r تشكّل الكرة (سطح أجوف مثل كرة اليد)، والنقط التي تبعد عن O بمسافة أصغر من أو تساوي r تشكّل الجلة (مجسم مملوء مثل الكرية الحديدية).',
        body: <Body lines={[ACTIVITY.closing]} source={ACTIVITY.source} />,
      },
    ],
    2: [
      {
        id: 'tarif-kura', type: 'concepts', title: 'تعريف الكرة',
        memo: {
          rule: '(\\delta):\\ OM=\\textcolor{#e11d48}{R}',
          hook: 'بعد ثابت عن المركز',
          example: 'R=3:\\ OM^2=\\textcolor{#e11d48}{9}',
          trap: 'المساواة تامة: ليست أصغر ولا أكبر من نصف القطر',
          exam: 'الكرة مجموعة النقط M من الفضاء التي بعدها عن O يساوي R',
          chip: 'OM=R',
          quiz: [
            { q: 'الكرة التي مركزها $O$ ونصف قطرها $R$ هي مجموعة النقط $M$ التي:', options: ['$OM=R$', '$OM\\le R$', '$OM\\ge R$'], correct: 0 },
            { q: 'إذا كانت $R=3$ فنقطة من الكرة تحقّق:', options: ['$OM^2=9$', '$OM^2=3$', '$OM^2\\le 9$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المسبار وضعت M على سطح الكرة التي مركزها O ونصف قطرها 4، دون أن يُكتب لك البعد. لكرة مركزها O ونصف قطرها R: اكتب بالرموز الشرط الذي تحقّقه كل نقطة M من الفضاء تنتمي إليها، ثم عرّف الكرة بجملة.',
        summary: 'الكرة التي مركزها O ونصف قطرها R هي مجموعة النقط M من الفضاء التي تبعد عن O بالمسافة R تماما.',
        body: <Body lines={[KNOW1.intro, KNOW1.defSphere]} source={KNOW1.source} />,
      },
      {
        id: 'tarif-julla', type: 'concepts', title: 'تعريف الجلة',
        memo: {
          rule: '(\\beta):\\ OM\\le\\textcolor{#e11d48}{R}',
          hook: 'الكرة وكل ما بداخلها',
          example: 'OM=\\sqrt{3}<3:\\ M\\in(\\beta)',
          trap: 'نقط الكرة تنتمي أيضا إلى الجلة لأن الرمز يشمل المساواة',
          exam: 'اكتب أصغر من أو يساوي ولا تكتفِ بأصغر',
          chip: 'OM\\le R',
          quiz: [
            { q: '$OM=2$ و $R=3$ : النقطة $M$', options: ['من الجلة وليست من الكرة', 'من الكرة', 'خارج الجلة'], correct: 0 },
            { q: 'العلاقة التي تعرّف الجلة هي:', options: ['$OM\\le R$', '$OM<R$', '$OM=R$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المسبار وضعت P في الجلة المملوءة دون أن تكون على سطحها. لجلة مركزها O ونصف قطرها R: بأيّ شرط على $OM$ تكون نقطة M منها؟ فكّر أيضا في نقط سطحها، ثم اكتب التعريف بالرموز.',
        summary: 'الجلة التي مركزها O ونصف قطرها R هي مجموعة النقط M من الفضاء التي تبعد عن O بمسافة أصغر من أو تساوي R: الكرة وكل ما بداخلها.',
        body: <Body lines={[KNOW1.defBall]} source={KNOW1.source} />,
      },
      {
        id: 'aqtar', type: 'regles', title: 'أقطار الكرة',
        memo: {
          rule: 'MM\'=2\\times\\textcolor{#e11d48}{R}',
          hook: 'القطر ضعف نصف القطر',
          example: 'R=4:\\ MM\'=2\\times4=8',
          trap: 'نصف القطر ليس القطر',
          exam: 'بيّن أن O منتصف القطعة ثم اكتب طولها ضعف نصف القطر',
          chip: 'd=2R',
          quiz: [
            { q: 'كرة نصف قطرها $5$ ، طول قطرها:', options: ['$10$', '$5$', '$25$'], correct: 0 },
            { q: 'منتصف قطر الكرة هو:', options: ['مركز الكرة $O$', 'نقطة من الكرة', 'نقطة خارج الجلة'], correct: 0 },
          ],
        },
        predictPrompt: 'في الشكل ثلاث قطع، كل منها تمرّ بالمركز O وطرفاها على الكرة، وفي المسبار بنيت قطعة مثلها انطلاقا من M. ماذا تلاحظ في منتصفات هذه القطع؟ وكم طول كل منها بدلالة R؟ اكتب القاعدة.',
        summary: 'القطر قطعة طرفاها على الكرة ومنتصفها المركز O، وطوله ضعف نصف القطر.',
        body: <Body lines={[KNOW1.diameters]} source={KNOW1.source} />,
      },
      {
        id: 'tawlid', type: 'concepts', title: 'دائرة تدور حول قطرها',
        memo: {
          rule: '\\mathcal{C}\\circlearrowright\\ \\Rightarrow\\ (\\delta)(O,\\textcolor{#e11d48}{R})',
          hook: 'الدوران حول القطر يولّد كرة',
          example: 'R=2{,}5\\Rightarrow(\\delta)(O,2{,}5)',
          trap: 'المركز ونصف القطر لا يتغيّران عند التدوير',
          exam: 'اذكر مركز الكرة المتولّدة ونصف قطرها',
          chip: '\\mathcal{C}\\circlearrowright\\to(\\delta)',
          quiz: [
            { q: 'تدوير دائرة مركزها $O$ ونصف قطرها $4$ حول قطرها يولّد:', options: ['كرة مركزها $O$ ونصف قطرها $4$', 'جلة نصف قطرها $8$', 'أسطوانة'], correct: 0 },
            { q: 'مركز الكرة المتولّدة هو:', options: ['مركز الدائرة', 'أي نقطة من القطر', 'طرف القطر'], correct: 0 },
          ],
        },
        predictPrompt: 'أدِر قطعة نقدية بسرعة على الطاولة حول أحد أقطارها: تخيّل دائرة مركزها O ونصف قطرها R تدور هكذا. أيّ مجسّم «ترسمه» نقطها في الفضاء؟ ما مركزه وما نصف قطره؟ اكتب ما تستنتجه.',
        summary: 'عند تدوير دائرة مركزها O ونصف قطرها R حول أحد أقطارها يتولّد كرة مركزها O ونصف قطرها R.',
        body: <Body lines={[KNOW1.noteRotation]} source={KNOW1.source} />,
      },
      {
        id: 'dawair', type: 'vocabulaire', title: 'الدوائر الكبرى والصغرى',
        memo: {
          rule: 'r=\\textcolor{#e11d48}{R}\\ ;\\ r<R',
          hook: 'كبرى تمرّ بالمركز',
          example: 'R=4,\\ h=2:\\ r^2=16-4=12',
          trap: 'مركز الدائرة الصغرى ليس مركز الكرة',
          exam: 'قارن شعاع الدائرة بشعاع الكرة لتحكم هل هي كبرى أو صغرى',
          chip: 'r\\le R',
          quiz: [
            { q: 'مستو يمرّ بمركز كرة نصف قطرها $4$ يقطعها وفق دائرة نصف قطرها:', options: ['$4$', '$2$', '$8$'], correct: 0 },
            { q: 'دائرة مركزها غير مركز الكرة وهي على الكرة تسمّى:', options: ['دائرة صغرى', 'دائرة كبرى', 'قطرا'], correct: 0 },
          ],
        },
        summary: 'الدائرة الكبرى مركزها مركز الكرة ونصف قطرها نصف قطر الكرة؛ الدائرة الصغرى مركزها يختلف عن مركز الكرة ونصف قطرها أصغر.',
        body: <Body lines={[KNOW1.noteGreat, KNOW1.noteSmall]} source={KNOW1.source} />,
      },
    ],
    3: [
      {
        id: 'tamthil-kura', type: 'methodes', title: 'تمثيل كرة',
        memo: {
          rule: '\\mathcal{C}(O,\\textcolor{#e11d48}{R})+\\text{ellipse}',
          hook: 'كفاف ثم بيضوي نصفه متقطّع',
          example: '\\mathcal{C}(O,\\ 2{,}5\\,\\mathrm{cm})',
          trap: 'نسيان الخط المتقطّع للجزء الخلفي',
          exam: 'ارسم الكفاف ثم الدائرة البيضوية: الأمامي مستمر والخلفي متقطّع',
          chip: '\\bigcirc+\\ominus',
          quiz: [
            { q: 'عند تمثيل كرة، الجزء الخلفي من الدائرة البيضوية يُرسم:', options: ['بخط متقطّع', 'بخط مستمر', 'لا يُرسم'], correct: 0 },
            { q: 'الكفاف المرسوم أولا هو:', options: ['دائرة كبرى مركزها $O$', 'دائرة صغرى', 'قطر'], correct: 0 },
          ],
        },
        predictPrompt: 'على الورقة لا تظهر الكرة إلا دائرة، ومع ذلك نريد أن يرى القارئ مجسّما — كما رسمت المكعب بالمنظور وأحرفه المخفية. بأيّ خطوات ترسم كرة مركزها O ونصف قطرها $2{,}5\\,\\mathrm{cm}$؟ وكيف تُظهر ما يختفي خلفها؟ اكتب الطريقة.',
        summary: 'نرسم دائرة كبرى (الكفاف) مركزها O ونصف قطرها R، ثم دائرة كبرى أخرى بيضوية الشكل: جزؤها الأمامي بخط مستمر والخلفي بخط متقطّع.',
        body: <Body lines={METHOD_DRAW.solution.slice(1)} source={METHOD_DRAW.source} />,
      },
      {
        id: 'tamthil-nuqta', type: 'methodes', title: 'تمثيل نقطة من كرة أو من جلة',
        memo: {
          rule: 'A\\in\\mathcal{C},\\ B\\in[OA]',
          hook: 'نقطة على دائرة كبرى أو على نصف قطر',
          example: 'A\\in\\mathcal{C},\\ B\\in[OA]\\Rightarrow OB<R',
          trap: 'نقطة تظهر داخل الدائرة قد تكون على سطح الكرة',
          exam: 'ارسم نصف القطر أو الدائرة الكبرى التي تمرّ بالنقطة',
          chip: 'A\\in\\mathcal{C},\\ B\\in[OA]',
          quiz: [
            { q: 'لنبيّن أن نقطة داخل الجلة وليست من الكرة نضعها:', options: ['على نصف قطر دون طرفه', 'على الدائرة الكبرى', 'خارج الكفاف'], correct: 0 },
            { q: 'لتمثيل نقطة من الكرة نضعها:', options: ['على إحدى دوائرها الكبرى', 'في وسط القرص دون إشارة', 'على قطر دون تعيين'], correct: 0 },
          ],
        },
        predictPrompt: 'في الشكل المعطى تظهر A و B كلتاهما داخل الدائرة، مع أنّ A على الكرة و B داخل الجلة فقط. ماذا تضيف إلى الرسم حتى يرى القارئ أنّ A على سطح الكرة وأنّ B في داخلها؟ اكتب الطريقة.',
        summary: 'لتمثيل نقطة على كرة أو داخلها نستعمل إحدى الدوائر الكبرى لهذه الكرة: النقطة على الدائرة الكبرى أو على أحد أنصاف أقطارها.',
        body: <Body lines={[...METHOD_POINT.solution, METHOD_POINT.rule]} source={METHOD_POINT.source} />,
      },
      {
        id: 'masafa-maalam', type: 'methodes', title: 'موقع نقطة في معلم للفضاء',
        memo: {
          rule: 'OM^2=\\textcolor{#e11d48}{x^2+y^2+z^2}',
          hook: 'ربّع الثلاثة ثم اجمع',
          example: 'M(1\\,;2\\,;2):\\ OM^2=1+4+4=9',
          trap: 'نسيان الإحداثية الثالثة',
          exam: 'قارن OM مربعا مع R مربعا ثم استنتج',
          chip: 'OM^2=x^2+y^2+z^2',
          quiz: [
            { q: 'للنقطة $M(1\\,;\\,2\\,;\\,2)$ ، قيمة $OM^2$ :', options: ['$9$', '$5$', '$3$'], correct: 0 },
            { q: 'كرة $R=3$ ونقطة $OM^2=12$ : النقطة', options: ['خارج الجلة', 'على الكرة', 'داخل الجلة'], correct: 0 },
          ],
        },
        predictPrompt: 'في المسبار كنت تقرأ إحداثيات M ثم تحكم على موقعها. خذ النقطة $M(2\\,;\\,2\\,;\\,1)$ في معلم مبدؤه مركز الكرة O، ومسقطها على المستوي الأفقي $M_0(2\\,;\\,2\\,;\\,0)$ . كيف تحسب $OM^2$ انطلاقا من الإحداثيات؟ عمّم إلى $M(x\\,;\\,y\\,;\\,z)$ ، ثم اكتب كيف تقرّر هل M على الكرة أو داخل الجلة أو خارجها.',
        summary: 'في معلم متعامد ومتجانس للفضاء مبدؤه مركز الكرة نحسب مربع البعد بجمع مربعات الإحداثيات الثلاث (فيثاغورس مرتين)، ثم نقارنه بمربع نصف القطر.',
        body: <Body lines={[...METHOD_DISTANCE.lines, METHOD_DISTANCE.example]} source={METHOD_DISTANCE.source} />,
      },
    ],
  },
};
