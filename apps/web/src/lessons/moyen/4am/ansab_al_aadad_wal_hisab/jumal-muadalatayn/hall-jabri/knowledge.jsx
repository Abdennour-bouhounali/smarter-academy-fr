import MathText from '../../../../../common/components/MathText';
import { IDEAS, METHOD, METHOD_BOX, CHOICE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس 2 « حل جملة معادلتين من الدرجة الأولى بمجهولين جبرياً » — SOURCE
 * UNIQUE. Une <KnowledgeBrick id="…"> dans un module et la carte rendent le même objet.
 *
 *   module 1 (نشاط 2)  takhallus-majhul — les deux élèves font disparaître une inconnue ;
 *                      hall-thunaiya — on revient chercher l'autre : la solution est une ثنائية ;
 *   module 2 (طرائق)   tariqat-tawid, tariqat-jam — l'encadré « طريقة » de la p. 59 ;
 *                      ikhtiyar-tariqa — choisir selon les coefficients (P3, phrase de la plateforme).
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'takhallus-majhul', type: 'concepts', title: 'نتخلّص من أحد المجهولين',
        memo: {
          rule: `ax+by=c\\to${R('mx=n')}`,
          hook: 'اختفاء مجهول ومعادلة بمجهول واحد',
          example: `x+y=10,x-y=2\\to${R('2x=12')}`,
          trap: 'محاولة حل معادلة واحدة من الجملة وحدها',
          exam: 'أقرّر أيّ مجهول أخفيه ثم أحلّ المعادلة الناتجة',
          chip: `ax+by=c\\to mx=n`,
          quiz: [
            { q: 'الهدف من التعويض أو الجمع هو:', options: ['جمع المجهولين معًا', 'حذف أحد المجهولين', 'حذف الثوابت'], correct: 1 },
            { q: 'بعد جمع $x+y=10$ و $x-y=2$ نحصل على:', options: ['$2y=12$', '$0=12$', '$2x=12$'], correct: 2 },
          ],
        },
        predictPrompt: 'بالبطاقتين: مرّة صار كل $y$ في البطاقة الأخرى عبارة بين قوسين، ومرّة ضربت بطاقة في عدد ثم وضعتها على الأخرى. ماذا حدث في المرّتين لعدد المجهولين في البطاقة؟ اكتب بكلماتك الفكرة المشتركة التي تحوّل جملة بمجهولين إلى معادلة تعرف حلّها.',
        summary: 'لحل جملة معادلتين بمجهولين نتخلّص من أحد المجهولين، فنحصل على معادلة من الدرجة الأولى بمجهول واحد نعرف كيف نحلّها.',
        body: <p><MathText>{IDEAS.takhallus}</MathText></p>,
      },
      {
        id: 'hall-thunaiya', type: 'memoriser', title: 'الحل ثنائية لا عدد واحد',
        memo: {
          rule: `(x\\ ;\\ y)=(a\\ ;\\ ${R('b')})`,
          hook: 'الحل ثنائية تحقّق المعادلتين',
          example: `(x\\ ;\\ y)=(3\\ ;\\ ${R('6')})`,
          trap: 'التوقّف عند قيمة مجهول واحد',
          exam: 'أكتب الحل ثنائية ثم أتحقّق منها في المعادلتين',
          chip: `(x\\ ;\\ y)`,
          quiz: [
            { q: 'حل جملة بمجهولين يُكتب:', options: ['قيمة $x$ فقط', 'ثنائية $(x ; y)$', 'المجموع $x+y$'], correct: 1 },
            { q: 'نتحقّق من ثنائية الحل في:', options: ['المعادلة الأولى فقط', 'المعادلة الثانية فقط', 'المعادلتين معًا'], correct: 2 },
          ],
        },
        predictPrompt: 'في جملة إكرام وإسحاق وُجد أوّلًا $x = 3$. هل يكفي هذا العدد جوابًا؟ اكتب بكلماتك: ماذا تفعل بعد إيجاد أحد المجهولين، وكيف تكتب حل الجملة، وكيف تتأكّد منه؟',
        summary: 'بعد إيجاد قيمة أحد المجهولين نعوّضها في إحدى المعادلتين لنجد الآخر؛ حل الجملة ثنائية نتحقّق منها في المعادلتين معًا.',
        body: <p><MathText>{IDEAS.thunaiya}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'tariqat-tawid', type: 'methodes', title: 'طريقة التعويض',
        memo: {
          rule: `y=${R('e')}\\ \\to\\ a_2x+b_2(${R('e')})`,
          hook: 'عبّر ثم عوّض بين قوسين',
          example: `x+2(${R('3x-3')})=15`,
          trap: 'نسيان القوسين عند التعويض فيُضرب حدّ واحد من العبارة',
          exam: 'أكتب العبارة المعوّضة بين قوسين ثم أنشر',
          chip: `y=e\\to a_2x+b_2(e)`,
          quiz: [
            { q: 'عند تعويض $y=3x-3$ في $x+2y=15$ نكتب:', options: ['$x+2\\times3x-3=15$', '$x+2(3x-3)=15$', '$x+2y(3x-3)=15$'], correct: 1 },
            { q: 'نشر $x+2(3x-3)$ يعطي:', options: ['$7x+6$', '$7x-3$', '$7x-6$'], correct: 2 },
          ],
        },
        predictPrompt: 'في المثال الأوّل انطلقنا من $x - 2y = 8$ ووصلنا إلى معادلة بالمجهول $y$ وحده. لو أعطيناك جملة أخرى لتحلّها بالطريقة نفسها: بأيّ خطوة تبدأ؟ ومن أين تأخذ العبارة، وأين تضعها؟ اكتب الطريقة.',
        summary: 'نعبّر عن أحد المجهولين بدلالة الآخر من إحدى المعادلتين، ثم نعوّض ذلك المجهول بالعبارة الناتجة في المعادلة الأخرى.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD_BOX.items[0]}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{METHOD.one.solution[2]}</MathText></p>
          </div>
        ),
      },
      {
        id: 'tariqat-jam', type: 'methodes', title: 'طريقة الجمع',
        memo: {
          rule: `kb+b_2=${R('0')}\\to(1)+(2)`,
          hook: 'اضرب لتتعاكس المعاملات',
          example: `(x+2y)+(6x-2y)=${R('7x')}`,
          trap: 'ضرب أحد طرفي المعادلة فقط',
          exam: 'أضرب الطرفين معًا ثم أجمع طرفًا لطرف',
          chip: `kb+b_2=0`,
          quiz: [
            { q: 'لإخفاء $y$ في $x+2y=15$ و $3x-y=3$ نضرب الثانية في:', options: ['$3$', '$-2$', '$2$'], correct: 2 },
            { q: 'جمع $x+2y=15$ مع $6x-2y=6$ يعطي:', options: ['$x=21$', '$7x=9$', '$7x=21$'], correct: 2 },
          ],
        },
        predictPrompt: 'في المثال الثاني جمعنا المعادلتين مباشرة فاختفى $x$، وفي الجولة 3 ضربت بطاقة في عدد قبل أن تضعها على الأخرى. أمام جملة لا يختفي فيها أيّ مجهول بالجمع مباشرة: ماذا تفعل أوّلًا، وإلى ماذا تنظر في المعاملات؟ اكتب الطريقة.',
        summary: 'نضرب طرفي كل معادلة في معامل مناسب ليصير معاملا أحد المجهولين متعاكسين، ثم نجمع المعادلتين طرفًا لطرف فنحصل على معادلة بمجهول واحد.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD_BOX.items[1]}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{METHOD.two.solution[1]}</MathText></p>
          </div>
        ),
      },
      {
        id: 'ikhtiyar-tariqa', type: 'memoriser', title: 'اختيار الطريقة الأنسب',
        memo: {
          rule: `\\begin{aligned}a=${R('\\pm1')}&\\Rightarrow y=e\\\\b_2=${R('-b')}&\\Rightarrow(1)+(2)\\end{aligned}`,
          hook: 'انظر إلى المعاملات أولًا',
          example: `x+y=10\\to y=10-x`,
          trap: 'استعمال الجمع دون التأكّد من تعاكس المعاملين',
          exam: 'أبرّر اختيار الطريقة بمعاملات الجملة',
          chip: `\\pm1\\to y=e`,
          quiz: [
            { q: 'في $x+y=10$ و $x-y=2$ الأنسب:', options: ['الجمع مباشرة لأنّ معاملَي $x$ متعاكسان', 'الجمع مباشرة لأنّ معاملَي $y$ متعاكسان', 'التعويض لأنّه لا يوجد معامل يساوي 1'], correct: 1 },
            { q: 'نختار التعويض مباشرة حين:', options: ['يكون معامل أحد المجهولين $1$ أو $-1$', 'تكون الثوابت متساوية', 'يكون المعاملان متساويين دائمًا'], correct: 0 },
          ],
        },
        predictPrompt: 'حللنا المثال الأوّل بالتعويض والمثال الثاني بالجمع. انظر إلى معاملات كل جملة: ما الذي جعل كل طريقة مناسبة لجملتها؟ اكتب بكلماتك متى تختار التعويض ومتى تختار الجمع.',
        summary: 'ننظر إلى المعاملات قبل أن نبدأ: معامل يساوي واحدًا أو سالب واحد يجعل التعويض سهلًا، ومعاملان متعاكسان أو يصيران كذلك بضرب بسيط يجعلان الجمع أسرع.',
        body: (
          <div className="space-y-2">
            <p><MathText>{CHOICE.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{`${CHOICE.sub} ${CHOICE.add}`}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
