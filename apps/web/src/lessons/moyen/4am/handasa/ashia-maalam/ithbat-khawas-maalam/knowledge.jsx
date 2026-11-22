import MathText from '../../../../../common/components/MathText';
import { REMARKS, TRIANGLE, PERP, QUAD, CIRCLE, METHOD_PROOF, METHOD_UNKNOWN } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Ce que le درس 4 établit. Le manuel n'a pas de معارف pour cette leçon : ses طرائق (p. 145) sont citées telles quelles ;
 * le reste est une formalisation DÉCLARÉE de la plateforme (`knowledge_formalization`, content/textbook.js), posée au
 * moment où les modules la font vivre.
 *   dalil-hisabi       module 1 — la figure ne prouve pas : une égalité calculée depuis les coordonnées
 *   qaim-fithaghuras   module 1 — l'angle droit en A : AB² + AC² = BC², le côté SEUL est l'opposé de A
 *   mutasawi-saqayn    module 1 — isocèle de sommet C : CA² = CB² ; équilatéral : les trois
 *   adilla-kafiya      module 1 — des preuves suffisantes : parallélogramme seul ≠ rectangle ; diagonales égales seules non plus
 *   tabiat-muthallath  module 2 — la méthode pour un triangle (trois carrés, comparer)
 *   taamud             module 2 — la perpendicularité sans produit scalaire (Pythagore réciproque, isocèle + médiane)
 *   tabiat-rubai       module 2 — l'échelle des quadrilatères (parallélogramme → rectangle / losange → carré)
 *   intima-daira       module 2 — un point d'un cercle : distance au centre = rayon ; le cercle de diamètre [AB]
 *   tariqat-burhan     module 3 — la طريقة « إنجاز برهان » p. 145
 *   tariqat-majhul     module 3 — la طريقة « حساب مسافات » p. 145 : une coordonnée inconnue, le y² qui s'en va
 * Les réponses du « إختبار أولي » (KLM, EFG, la ساحة de Wahran, PQRS, Ω, R) ne sont dans aucun item.
 */
const Lines = ({ lines }) => (
  <ul className="list-disc ms-5 space-y-1">{lines.map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ul>
);

/** `memo` — la FICHE DE MÉMOIRE de chaque connaissance (MemoCard) : ce qui CHANGE dans la règle est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      { id: 'dalil-hisabi', type: 'regles', title: 'الشكل لا يبرهن',
        memo: {
          rule: `AB^2+AC^2\\ ${R('\\overset{?}{=}')}\\ BC^2`,
          hook: 'احسب ولا تكتفِ بالنظر',
          example: `AB^2+AC^2=10+5=15\\neq 17=BC^2`,
          trap: 'الاعتماد على شكل يبدو قائمًا',
          exam: 'اكتب المساواة بالأعداد قبل أن تحكم',
          chip: `AB^2+AC^2\\overset{?}{=}BC^2`,
          quiz: [
      { q: 'مثلث يبدو قائمًا على المرصوفة. لنثبت ذلك:', options: ['نقارن مربعات أطوال أضلاعه', 'نقيس الزاوية بالمنقلة على الرسم', 'نكتفي بالنظر إلى الشبكة'], correct: 0 },
      { q: '$AB^2=10$ و $AC^2=5$ و $BC^2=17$ : المثلث ABC', options: ['ليس قائمًا في $A$', 'قائم في $A$', 'قائم في $B$'], correct: 0 },
          ],
        },
        predictPrompt: 'عند $C(-1\\,;\\,2)$ بدت الزاوية في A قائمة على المرصوفة، لكنّ الفار حسب $AB^2 + AC^2 = 15$ و $BC^2 = 17$ فرفض. على ماذا يعتمد الفار ليقبل طبيعة شكل، وعلى ماذا لا يعتمد؟ اكتب القاعدة بكلماتك.',
        summary: 'ما نراه على المرصوفة يوحي ولا يثبت: نثبت طبيعة شكل بمساواة محسوبة من إحداثيات رؤوسه.',
        body: <Lines lines={[REMARKS.look]} /> },
      { id: 'qaim-fithaghuras', type: 'regles', title: 'زاوية قائمة بعكس فيثاغورس',
        memo: {
          rule: `AB^2+AC^2=${R('BC^2')}\\Rightarrow\\widehat{A}=90^{\\circ}`,
          hook: 'مجموع مربعي الضلعين = مربع الثالث',
          example: `AB^2+AC^2=10+10=20=BC^2`,
          trap: 'اختيار الضلع المقابل الخطأ: الأطول وحده في الطرف الآخر',
          exam: 'احسب مربعات الأضلاع الثلاثة ثم قارن',
          chip: `AB^2+AC^2=${R('BC^2')}`,
          quiz: [
      { q: 'إذا كان $AB^2+AC^2=BC^2$ فالمثلث ABC قائم في:', options: ['$A$', '$B$', '$C$'], correct: 0 },
      { q: '$AB^2=5$ و $AC^2=20$ و $BC^2=25$ : المثلث قائم في:', options: ['$A$', '$B$', '$C$'], correct: 0 },
          ],
        },
        predictPrompt: 'عند $C(-1\\,;\\,3)$ قبل الفار «قائم في A» لأنّ $10 + 10 = 20$ . في المساواة التي تثبت زاوية قائمة في رأس ما، أيّ ضلع يكون مربّعه وحده في طرف؟ وكيف تعرفه من الرأس؟ اكتب القاعدة.',
        summary: 'المثلث ABC قائم في A إذا كان مجموع مربعي الطولين AB و AC يساوي مربع BC، الضلع المقابل لـ A وهو أطول الأضلاع.',
        body: <Lines lines={[REMARKS.watarRight]} /> },
      { id: 'mutasawi-saqayn', type: 'regles', title: 'متساوي الساقين بمربعين',
        memo: {
          rule: `CA^2=${R('CB^2')}\\Rightarrow CA=CB`,
          hook: 'مربعان متساويان = ضلعان متساويان',
          example: `CA^2=1+4=5,\\quad CB^2=4+1=5`,
          trap: 'مقارنة ضلعين لا يلتقيان في الرأس المطلوب',
          exam: 'احسب مربعي الضلعين المتجاورين عند الرأس ثم استنتج',
          chip: `CA^2=${R('CB^2')}`,
          quiz: [
      { q: 'إذا كان $CA^2=CB^2$ فالمثلث ABC متساوي الساقين رأسه:', options: ['$C$', '$A$', '$B$'], correct: 0 },
      { q: 'متقايس الأضلاع يعني:', options: ['$AB^2=BC^2=CA^2$', '$AB^2+BC^2=CA^2$', '$AB^2=BC^2$ فقط'], correct: 0 },
          ],
        },
        predictPrompt: 'عند $C(0\\,;\\,5)$ وجدت $CA^2 = 25$ و $CB^2 = 25$ . متى نقول بالحساب إنّ مثلثا متساوي الساقين رأسه C؟ وماذا يلزم ليكون متقايس الأضلاع؟ اكتب القاعدة.',
        summary: 'المثلث ABC متساوي الساقين رأسه C إذا تساوى مربعا الطولين CA و CB، ومتقايس الأضلاع إذا تساوت المربعات الثلاثة.',
        body: <Lines lines={[TRIANGLE.lines[1]]} /> },
      { id: 'adilla-kafiya', type: 'regles', title: 'أدلة كافية',
        memo: {
          rule: `\\overrightarrow{AB}=\\overrightarrow{DC}\\quad ${R('AC^2=BD^2')}`,
          hook: 'متوازي أضلاع وقطران متساويان يعطيان مستطيلًا',
          example: `AC^2=4+36=40,\\quad BD^2=36+4=40`,
          trap: 'متوازي الأضلاع وحده ليس مستطيلًا، والقطران وحدهما لا يكفيان',
          exam: 'اذكر كل دليل على حدة ثم الاستنتاج',
          chip: `\\overrightarrow{AB}=\\overrightarrow{DC},\\ ${R('AC=BD')}`,
          quiz: [
      { q: 'لإثبات أن ABCD مستطيل نحتاج:', options: ['متوازي أضلاع وقطرين متساويين', 'قطرين متساويين فقط', 'ضلعين متتاليين متساويين فقط'], correct: 0 },
      { q: 'متوازي أضلاع وضلعان متتاليان متساويان يثبتان أنه:', options: ['معيّن', 'مستطيل', 'مربع'], correct: 0 },
          ],
        },
        predictPrompt: 'عند $D(2\\,;\\,2)$ كان القطران متقايسين ورفض الفار «مستطيل». ماذا يثبت دليل تساوي شعاعين وحده؟ وماذا يثبت تقايس القطرين وحده؟ وأيّ دليلين معا يكفيان لنقول «مستطيل»؟ اكتب القاعدة.',
        summary: 'لا تُقبل نتيجة إلا بأدلة كافية: تساوي شعاعين يثبت متوازي أضلاع فقط، والقطران المتقايسان وحدهما لا يثبتان مستطيلا.',
        body: <Lines lines={[REMARKS.kafiRight, REMARKS.diagAlone]} /> },
    ],
    2: [
      { id: 'tabiat-muthallath', type: 'methodes', title: TRIANGLE.title,
        memo: {
          rule: `AB^2=${R('\\Delta x^2+\\Delta y^2')}`,
          hook: 'مربعات الأطوال الثلاثة ثم قارن',
          example: `AB^2=10,\\ AC^2=10,\\ BC^2=20`,
          trap: 'نسيان تربيع الفرقين أو جمع الأطوال بدل المربعات',
          exam: 'جدول المربعات الثلاثة ثم الخاصية المناسبة',
          chip: `AB^2=${R('\\Delta x^2+\\Delta y^2')}`,
          quiz: [
      { q: 'مربع المسافة $AB^2$ مع $A(0\\,;\\,0)$ و $B(3\\,;\\,1)$ هو:', options: ['$10$', '$4$', '$16$'], correct: 0 },
      { q: 'مربعات أطوال مثلث: $10$ و $10$ و $20$ فهو:', options: ['قائم ومتساوي الساقين', 'متقايس الأضلاع', 'قائم فقط'], correct: 0 },
          ],
        },
        predictPrompt: 'في الملعب طلبت من الفار «قائم في A» ثم «متساوي الساقين رأسه C». لو أعطيناك ثلاث نقط أخرى بإحداثياتها، بأيّ خطوات تحكم أنّ مثلثها متساوي الساقين أو متقايس الأضلاع أو قائم، وفي أيّ رأس؟ اكتب الطريقة.',
        summary: 'نحسب مربعات الأطوال الثلاثة من الإحداثيات ونقارنها: مربعان متساويان لمتساوي الساقين، وثلاثة لمتقايس الأضلاع، ومجموع الأصغرين يساوي الأكبر لزاوية قائمة مقابلة لأطول ضلع.',
        body: <Lines lines={TRIANGLE.lines} /> },
      { id: 'taamud', type: 'regles', title: PERP.title,
        memo: {
          rule: `AB^2+BC^2=${R('AC^2')}\\Rightarrow(AB)\\perp(BC)`,
          hook: 'التعامد يعني مثلثًا قائمًا',
          example: `20+20=40`,
          trap: 'استنتاج التعامد دون تعيين رأس الزاوية القائمة',
          exam: 'عيّن الرأس القائم ثم استنتج التعامد',
          chip: `AB^2+BC^2=${R('AC^2')}`,
          quiz: [
      { q: 'لإثبات $(AB)\\perp(BC)$ نثبت أن المثلث ABC:', options: ['قائم في $B$', 'قائم في $A$', 'متساوي الساقين رأسه $B$'], correct: 0 },
      { q: 'مع $AB^2=20$ و $BC^2=20$ و $AC^2=40$ :', options: ['$(AB)\\perp(BC)$', '$(AB)\\perp(AC)$', '$(BC)\\perp(AC)$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المستوى المتقدّم انزلق الشاخص C على مستقيمه حتى قبل الفار أنّ $(AB)$ و $(BC)$ متعامدان، دون أيّ كوس. كيف تثبت بالحساب من الإحداثيات أنّ مستقيمين متقاطعين في نقطة متعامدان؟ اكتب الطريقة.',
        summary: 'دون جداء سلمي: نثبت تعامد مستقيمين بمثلث قائم (الخاصية العكسية لخاصية فيثاغورس) أو بمتوسط مثلث متساوي الساقين.',
        body: <Lines lines={PERP.lines} /> },
      { id: 'tabiat-rubai', type: 'methodes', title: QUAD.title,
        memo: {
          rule: `\\begin{aligned} &\\overrightarrow{AB}=\\overrightarrow{DC} \\\\ &${R('AC=BD')}\\ ,\\ ${R('AB=BC')} \\end{aligned}`,
          hook: 'متوازي أضلاع أولًا ثم القطران أو الضلعان',
          example: `AC^2=BD^2=40,\\quad AB^2=BC^2=20`,
          trap: 'الاكتفاء بتساوي القطرين دون متوازي الأضلاع',
          exam: 'رتّب الأدلة: متوازي أضلاع ثم مستطيل أو معيّن ثم مربع',
          chip: `${R('AC=BD')}\\ ,\\ ${R('AB=BC')}`,
          quiz: [
      { q: 'لإثبات أن الرباعي معيّن نضيف إلى متوازي الأضلاع:', options: ['ضلعين متتاليين متساويين', 'قطرين متساويين', 'زاوية قائمة فقط'], correct: 0 },
      { q: 'قطران متناصفان يثبتان أن الرباعي:', options: ['متوازي أضلاع', 'مستطيل', 'مربع'], correct: 0 },
          ],
        },
        predictPrompt: 'في المستوى المتقدّم وضعت الشاخص D ورفض الفار الأدلة الناقصة. بأيّ ترتيب تثبت أنّ رباعيا متوازي أضلاع، ثم مستطيل، أو معيّن، أو مربّع؟ اكتب الدليل اللازم لكل خطوة.',
        summary: 'نثبت أولا أن الرباعي متوازي أضلاع (شعاعان متساويان أو قطران متناصفان)، ثم مستطيل بقطرين متقايسين، ومعيّن بضلعين متتاليين متقايسين، ومربّع بالاثنين معا.',
        body: <><Lines lines={QUAD.lines} /><p className="mt-1 text-sm"><MathText>{QUAD.warning}</MathText></p></> },
      { id: 'intima-daira', type: 'regles', title: CIRCLE.title,
        memo: {
          rule: `IB=IA=${R('r')}\\Rightarrow B\\in\\mathcal{C}(I\\,;\\,r)`,
          hook: 'نفس البعد عن المركز',
          example: `IA^2=IB^2=ID^2=10`,
          trap: 'نسيان أن المركز هو منتصف القطر',
          exam: 'احسب I ثم IA² و IB² و ID²',
          chip: `IB=IA=${R('r')}`,
          quiz: [
      { q: 'مركز الدائرة التي قطرها $[AC]$ هو:', options: ['منتصف $[AC]$', 'النقطة $A$', 'النقطة $C$'], correct: 0 },
      { q: 'تنتمي $B$ إلى الدائرة التي مركزها $I$ ونصف قطرها $IA$ إذا كان:', options: ['$IB=IA$', '$IB=2IA$', '$IB^2=IA$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المستوى المتقدّم أثبتّ للفار أنّ B و D على الدائرة التي قطرها $[AC]$ . كيف تثبت بالحساب أنّ نقطة تنتمي إلى دائرة علمت مركزها ونصف قطرها؟ وأين مركز دائرة قطرها قطعة معلومة؟ اكتب القاعدة.',
        summary: 'تنتمي نقطة إلى دائرة إذا كان بعدها عن المركز يساوي نصف القطر؛ ومركز الدائرة التي قطرها قطعة هو منتصف هذه القطعة.',
        body: <><Lines lines={CIRCLE.lines} /><p className="mt-1 text-sm"><MathText>{CIRCLE.trap}</MathText></p></> },
    ],
    3: [
      { id: 'tariqat-burhan', type: 'methodes', title: `طريقة الكتاب: ${METHOD_PROOF.title}`, summary: 'نحسب مركبتي كل شعاع ثم الأطوال، ونطبّق الخاصية العكسية لخاصية فيثاغورس على أطول ضلع، ونقارن الطولين لمتساوي الساقين.',
        memo: {
          rule: `\\overrightarrow{AB}(a\\,;\\,b)\\Rightarrow AB^2=${R('a^2+b^2')}`,
          hook: 'المركبتان ثم المربع ثم المقارنة',
          example: `\\overrightarrow{AB}\\begin{pmatrix} -1 \\\\ 3 \\end{pmatrix}\\Rightarrow AB^2=1+9=10`,
          trap: 'مقارنة مجموع المربعين بمربع ضلع ليس الأطول',
          exam: 'رتّب الأطوال ثم طبّق عكس فيثاغورس على أطولها',
          chip: `AB^2=${R('a^2+b^2')}`,
          quiz: [
      { q: 'إذا كانت مركبتا $\\overrightarrow{AB}$ هما $-1$ و $3$ فإن $AB^2=$', options: ['$10$', '$2$', '$4$'], correct: 0 },
      { q: 'نطبّق عكس خاصية فيثاغورس على:', options: ['أطول الأضلاع', 'أقصر الأضلاع', 'أي ضلع'], correct: 0 },
          ],
        },
        body: <Lines lines={[METHOD_PROOF.solution[1], METHOD_PROOF.solution[6], METHOD_PROOF.solution[7]]} /> },
      { id: 'tariqat-majhul', type: 'methodes', title: `طريقة الكتاب: ${METHOD_UNKNOWN.title}`,
        memo: {
          rule: `AB^2+BC^2=AC^2\\Rightarrow ${R('ay+b=0')}`,
          hook: 'يختفي مربع المجهول فتبقى معادلة بسيطة',
          example: `20+4+y^2=y^2-4y+8\\Rightarrow y=-4`,
          trap: 'خطأ في فك مربع الفرق',
          exam: 'اكتب شرط الزاوية القائمة بالمربعات ثم حلّ المعادلة',
          chip: `${R('ay+b=0')}`,
          quiz: [
      { q: 'عند حلّ $20+4+y^2=y^2-4y+8$ نجد:', options: ['$y=-4$', '$y=4$', '$y=-16$'], correct: 0 },
      { q: 'يحذف مربع المجهول من المعادلة لأنه يظهر:', options: ['في الطرفين', 'في طرف واحد فقط', 'مع عدد سالب فقط'], correct: 0 },
          ],
        },
        predictPrompt: 'وجدت $BC^2 = 4 + y^2$ ، وفي المختبر انزلق C على مستقيمه حتى قبل الفار التعامد. كيف تعيّن y بالحساب دون تجريب المواضع واحدا واحدا؟ أيّ مساواة تكتب بدلالة y ، وما نوع المعادلة التي تحصل عليها؟ اكتب الطريقة.',
        summary: 'لتعيين إحداثية مجهولة نكتب شرط الزاوية القائمة بمربعات المسافات بدلالة المجهول؛ يحذف مربع المجهول من الطرفين فتبقى معادلة من الدرجة الأولى.',
        body: <Lines lines={[METHOD_UNKNOWN.solution[0], METHOD_UNKNOWN.expand]} /> },
    ],
  },
};
