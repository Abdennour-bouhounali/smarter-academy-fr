import MathText from '../../../../../common/components/MathText';
import { ACTIVITY, ACTIVITY_LINES, KNOWLEDGE, METHOD_DRAW, METHOD_READ } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس 3 « التمثيل البياني لدالة خطية وقراءته بيانيًا » — SOURCE UNIQUE.
 * Une <KnowledgeBrick id="…"> dans un module et la carte rendent le même objet.
 *
 *   module 1 (نشاط 3)  tamthil-nashat — « نقول أنّ … » : la droite (OA) est le graphe de 0,5x ;
 *   module 2 (معارف)   tamthil-mustaqim (la propriété), munha-mustaqim (la ملاحظة sur le signe de a),
 *                      rasm-tamthil (طرائق : O et une seconde point), qiraa-bayaniya (طرائق : lire une
 *                      image, un nombre dont l'image est connue).
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'tamthil-nashat', type: 'concepts', title: 'المستقيم (OA)',
        memo: {
          rule: `M\\in(OA)\\Leftrightarrow y=${R('a')}x`,
          hook: 'ترتيب النقطة هو صورة فاصلتها',
          example: `B(4;2):\\;${R('0{,}5')}\\times 4=2`,
          trap: 'النقطة التي ترتيبها خطأ تُرفض ولو كانت قريبة من المستقيم',
          exam: 'احسب صورة الفاصلة ثم قارنها بالترتيب',
          chip: `y=${R('a')}x`,
          quiz: [
            { q: 'النقطة $(4;3)$ لا تقع على تمثيل $f(x)=0{,}5x$ لأنّ:', options: ['$f(4)=2\\neq 3$', '$4$ فاصلة كبيرة', '$f(4)=3$'], correct: 0 },
            { q: 'النقطة التي فاصلتها $6$ على تمثيل $f(x)=0{,}5x$ ترتيبها:', options: ['$3$', '$6{,}5$', '$12$'], correct: 0 },
          ],
        },
        predictPrompt: 'وضعت $A(1 ; 0{,}5)$ و $B(4 ; 2)$ ثم $C$ ذات الفاصلة $-2$ ، ورأيت المعلم يرفض كل نقطة لا تحقّق الحساب. بكلماتك: ما هو التمثيل البياني للدالة $f : x \\longmapsto 0{,}5x$؟ وماذا يربط ترتيب كل نقطة منه بفاصلتها؟',
        summary: 'النقط O و A و B على استقامة واحدة: التمثيل البياني للدالة الخطية التي تضرب كل عدد في 0,5 هو المستقيم (OA)، وكل نقطة منه ترتيبها صورة فاصلتها.',
        body: (
          <div className="space-y-2">
            <p><MathText>{ACTIVITY.closing}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{ACTIVITY_LINES.m}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'tamthil-mustaqim', type: 'concepts', title: 'التمثيل البياني لدالة خطية',
        memo: {
          rule: `(d):\\;y=${R('a')}x`,
          hook: 'مستقيم يشمل المبدأ ومعادلته ضرب',
          example: `f(x)=${R('1{,}5')}x\\;\\Rightarrow\\;(d):y=1{,}5x`,
          trap: 'مستقيم لا يشمل المبدأ لا يمثّل دالة خطية',
          exam: 'اكتب أنّ التمثيل مستقيم يشمل المبدأ ومعادلته المعروفة',
          chip: `y=${R('a')}x`,
          quiz: [
            { q: 'التمثيل البياني لدالة خطية هو:', options: ['مستقيم يشمل المبدأ', 'مستقيم لا يشمل المبدأ', 'منحنى'], correct: 0 },
            { q: 'معادلة تمثيل الدالة $f(x)=-3x$ هي:', options: ['$y=-3x$', '$y=x-3$', '$y=3x$'], correct: 0 },
          ],
        },
        predictPrompt: 'في النشاط 3 كان تمثيل $x \\longmapsto 0{,}5x$ المستقيم (OA)، وكل نقطة $M(x ; y)$ منه تحقّق $y = 0{,}5x$. لو أخذنا دالة خطية أخرى معاملها $a$ : ما شكل تمثيلها البياني، وبأيّ نقطة يمرّ دائمًا؟ وما العلاقة بين $x$ و $y$ لكل نقطة منه؟',
        summary: 'في معلم، التمثيل البياني لدالة خطية معاملها a مستقيم يشمل المبدأ O؛ نقول إنّ معادلته هي «y يساوي a في x» وإنّ a معامل توجيهه.',
        body: <p><MathText>{KNOWLEDGE.property}</MathText></p>,
      },
      {
        id: 'munha-mustaqim', type: 'regles', title: 'منحى المستقيم وإشارة a',
        memo: {
          rule: `${R('a')}>0\\;\\nearrow\\qquad ${R('a')}<0\\;\\searrow`,
          hook: 'إشارة المعامل تحدّد الاتجاه',
          example: `a=${R('-2')}<0\\;\\Rightarrow\\;\\searrow`,
          trap: 'المبدأ لا يتحرك أبدًا مهما تغيّر المعامل',
          exam: 'اذكر إشارة المعامل ثم استنتج الاتجاه',
          chip: `a<0\\to\\searrow`,
          quiz: [
            { q: 'تمثيل الدالة $f(x)=-0{,}5x$ مستقيم:', options: ['ينزل', 'يصعد', 'أفقي'], correct: 0 },
            { q: 'مستقيم يصعد من اليسار إلى اليمين معامله:', options: ['$a>0$', '$a<0$', '$a=0$'], correct: 0 },
          ],
        },
        predictPrompt: 'على الزالق ثبّتّ مستقيمات تشمل O: بعضها يصعد من اليسار إلى اليمين وبعضها ينزل. اكتب القاعدة بكلماتك: ما الذي يعيّن منحى المستقيم الذي يمثّل دالة خطية؟ ومتى يصعد ومتى ينزل؟',
        summary: 'يعيّن المعامل a منحى المستقيم: إذا كان موجبا فالمستقيم يصعد من اليسار إلى اليمين، وإذا كان سالبا فهو ينزل.',
        body: <p><MathText>{KNOWLEDGE.note}</MathText></p>,
      },
      {
        id: 'rasm-tamthil', type: 'methodes', title: 'نرسم التمثيل البياني',
        memo: {
          rule: `O\\to(1\\,;\\,${R('a')})`,
          hook: 'المبدأ ونقطة فاصلتها واحد',
          example: `h(x)=-2{,}5x:\\;(1\\,;\\,${R('-2{,}5')})`,
          trap: 'لا تقلب الإحداثيين فتضع المعامل في الفاصلة',
          exam: 'احسب الصورة ثم علّم النقطة وارسم المستقيم بالمسطرة',
          chip: `(1\\,;\\,${R('a')})`,
          quiz: [
            { q: 'لرسم تمثيل $f(x)=3x$ نصل O بالنقطة:', options: ['$(1;3)$', '$(3;1)$', '$(0;3)$'], correct: 0 },
            { q: 'لرسم تمثيل $g(x)=-2x$ نصل O بالنقطة:', options: ['$(1;-2)$', '$(1;2)$', '$(-2;1)$'], correct: 0 },
          ],
        },
        predictPrompt: 'في النشاط 3 رُسم المستقيم كلّه بمجرّد أن وضعت النقطة A بعد O. لو طُلب منك رسم تمثيل الدالة $x \\longmapsto 1{,}5x$ في معلم: كم نقطة تحتاج، وكيف تحصل على إحداثييها؟ اكتب الطريقة بخطوات.',
        summary: 'التمثيل يشمل المبدأ، فلرسمه تكفي نقطة ثانية: نختار فاصلة، مثلا 1، ونحسب صورتها، ثم نرسم المستقيم الذي يشمل المبدأ وهذه النقطة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD_DRAW.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{METHOD_DRAW.solution[1]}</MathText></p>
          </div>
        ),
      },
      {
        id: 'qiraa-bayaniya', type: 'methodes', title: 'نقرأ على التمثيل البياني',
        memo: {
          rule: `f(${R('x')})=${R('y')}`,
          hook: 'صورة من الفواصل وسابق من التراتيب',
          example: `f(4)=1{,}6\\qquad f(${R('8{,}75')})=3{,}5`,
          trap: 'لا تخلط الانطلاق من الفواصل بالانطلاق من التراتيب',
          exam: 'ارسم الخط المتقطع على الشكل ثم اكتب القراءة',
          chip: `x\\to f(x)`,
          quiz: [
            { q: 'لإيجاد صورة عدد نبدأ من:', options: ['محور الفواصل', 'محور التراتيب', 'المبدأ فقط'], correct: 0 },
            { q: 'لإيجاد عدد صورته $3$ نبدأ من:', options: ['محور التراتيب', 'محور الفواصل', 'المبدأ'], correct: 0 },
          ],
        },
        predictPrompt: 'حرّكت المسبار تحت محور الفواصل إلى 4، ثم المسبار على يسار محور التراتيب إلى 3,5، وتبعت الخط المتقطّع. لو أعطيناك مستقيمًا آخر: بأيّ خطوات تقرأ صورة عدد؟ وبأيّ خطوات تقرأ العدد الذي صورته معلومة؟',
        summary: 'لتعيين صورة عدد نقرأ ترتيب النقطة التي فاصلتها هذا العدد، ولتعيين عدد صورته معلومة نقرأ فاصلة النقطة التي ترتيبها هذه الصورة.',
        body: (
          <div className="space-y-2">
            {METHOD_READ.rule.map((r) => <p key={r}><MathText>{r}</MathText></p>)}
          </div>
        ),
      },
    ],
  },
};
