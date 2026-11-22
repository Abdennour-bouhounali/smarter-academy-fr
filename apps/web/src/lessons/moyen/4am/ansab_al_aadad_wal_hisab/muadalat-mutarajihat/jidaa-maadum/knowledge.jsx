import MathText from '../../../../../common/components/MathText';
import { ACTIVITY, ACTIVITY_A, KNOWLEDGE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس 2 « معادلات جداء معدوم » — SOURCE UNIQUE, construite à
 * partir des données de la leçon (content/textbook.js, nombres de la plateforme). Une <KnowledgeBrick id="…"> dans un module
 * et la carte rendent le même objet.
 *
 *   module 1 (نشاط 2)  khassiya-jidaa-maadum — la phrase de la propriété, posée quand le
 *                      terrain a disparu sous la main ;
 *   module 2 (معارف 2) taarif-muadala-jidaa — la définition ;
 *                      hulul-muadala-jidaa — la propriété formelle et les
 *                      solutions = celles des deux équations du premier degré ;
 *   module 3 (طرائق)   tariqat-jidaa-maadum — factoriser, puis la propriété.
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'khassiya-jidaa-maadum', type: 'regles', title: 'خاصية الجداء المعدوم',
        memo: {
          rule: `\\begin{aligned}AB=0&\\Rightarrow ${R('A=0')}\\\\&\\vee ${R('B=0')}\\end{aligned}`,
          hook: 'جداء معدوم يعني عاملًا معدومًا',
          example: `2(x-3)=0\\Rightarrow ${R('x-3=0')}`,
          trap: 'ظنّ أن العاملين ينعدمان معًا',
          exam: 'أقول إن أحد العاملين على الأقل معدوم',
          chip: `A\\times B=0`,
          quiz: [
            { q: 'إذا كان $A \\times B = 0$ فإن:', options: ['$A = 0$ و $B = 0$ معًا', '$A = 0$ أو $B = 0$', '$A = B$'], correct: 1 },
            { q: 'في $2(x-3)=0$ يختفي الملعب عند:', options: ['$x = 2$', '$x = 0$', '$x = 3$'], correct: 2 },
          ],
        },
        predictPrompt: 'في المختبر اختفى الملعب $2(x - 3)$ عند $x = 3$ وحدها، مع أنّ ضلعه 2 لم يتغيّر، واختفى الملعب $(x - 1)(x + 4)$ عند قيمتين. اكتب القاعدة بكلماتك: متى يكون جداء عاملين مساويًا لـ $0$؟',
        summary: 'إذا كان جداء عاملين معدوما فإن أحد هذين العاملين على الأقل معدوم.',
        body: (
          <div className="space-y-2">
            <p><MathText>{ACTIVITY_A.statement}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{ACTIVITY.bassam.join(' ؛ ')}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'taarif-muadala-jidaa', type: 'concepts', title: 'معادلة جداء معدوم',
        memo: {
          rule: `(ax+b)(cx+d)=${R('0')}`,
          hook: 'جداء عاملين يساوي صفرًا',
          example: `(x-1)(x+4)=${R('0')}`,
          trap: 'الخلط مع معادلة طرفها الثاني ليس صفرًا',
          exam: 'أتحقّق أن الطرف الأول جداء والثاني صفر',
          chip: `(ax+b)(cx+d)=0`,
          quiz: [
            { q: 'أيّ معادلة هي معادلة جداء معدوم؟', options: ['$(x-1)(x+4)=0$', '$(x-1)(x+4)=3$', '$(x-1)+(x+4)=0$'], correct: 0 },
            { q: 'في $(2x+1)(x-3)=0$ طرفها الثاني:', options: ['$3$', '$0$', '$x$'], correct: 1 },
          ],
        },
        predictPrompt: 'في الملعب حللت المعادلتين $2(x - 3) = 0$ و $(x - 1)(x + 4) = 0$ ، ولم تحتج إلى النشر. صف بكلماتك شكل هذه المعادلات: ماذا في طرفها الأول؟ وماذا في طرفها الثاني؟',
        summary: 'كل معادلة من الشكل (ax + b)(cx + d) = 0 حيث a و b و c و d أعداد معلومة تسمى معادلة جداء معدوم.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.definition}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.examples[0]}</MathText></p>
          </div>
        ),
      },
      {
        id: 'hulul-muadala-jidaa', type: 'regles', title: 'حلول معادلة جداء معدوم',
        memo: {
          rule: `\\begin{aligned}AB=0&\\Leftrightarrow ${R('A=0')}\\\\&\\vee ${R('B=0')}\\end{aligned}`,
          hook: 'أحلّ كل عامل على حدة',
          example: `x=1\\vee x=-4`,
          trap: 'نشر الجداء قبل الحلّ',
          exam: 'أكتب المعادلتين ثم أحلّ كلًّا منهما',
          chip: `A=0\\vee B=0`,
          quiz: [
            { q: 'حلّا $(x-1)(x+4)=0$ هما:', options: ['$1$ و $-4$', '$-1$ و $4$', '$1$ و $4$'], correct: 0 },
            { q: 'عدد حلول $(2x+1)^2=0$ هو:', options: ['حلّان', 'حلّ واحد', 'لا حلّ'], correct: 1 },
          ],
        },
        predictPrompt: 'لحلّ $(x - 1)(x + 4) = 0$ وجدت 1 و $-4$ دون أن تنشر. لو أعطيناك معادلة أخرى $(ax + b)(cx + d) = 0$ : كيف تجد كل حلولها؟ اكتب القاعدة بكلماتك.',
        summary: 'إذا كان جداء عددين معدوما فأحدهما معدوم، لذلك حلول معادلة جداء معدوم هي حلول المعادلتين من الدرجة الأولى.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.property[1]}</MathText></p>
            <p><MathText>{KNOWLEDGE.solutions}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.examples[1]}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqat-jidaa-maadum', type: 'methodes', title: 'طريقة: نحلّل ثم نحلّ',
        memo: {
          rule: `\\begin{aligned}F=0&\\to ${R('AB=0')}\\\\&\\to A=0\\\\&\\vee B=0\\end{aligned}`,
          hook: 'حلّل أولًا ثم أنهِ كل عامل',
          example: `(x-3)(2x-4)=0`,
          trap: 'حلّ المعادلة دون جعل الطرف الأول جداء',
          exam: 'أحلّل الطرف الأول ثم أطبّق الخاصية',
          chip: `F=0\\to AB=0`,
          quiz: [
            { q: 'قبل تطبيق الخاصية نحتاج أن يكون الطرف الأول:', options: ['مجموعًا', 'جداء عاملين', 'عددًا'], correct: 1 },
            { q: 'في $(x-3)(2x-4)=0$ نحلّ:', options: ['$x-3=0$ أو $2x-4=0$', '$x-3=2x-4$', '$(x-3)+(2x-4)=0$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المثال المحلول لم تكن المعادلة $(3x + 4)(x - 2) - 2(x - 2) = 0$ جداءً في البداية، ومع ذلك وصلنا إلى حلّيها. لو أعطيناك معادلة أخرى من هذا النوع: بماذا تبدأ؟ وماذا تفعل بعد ذلك؟ اكتب الطريقة في خطوتين.',
        summary: 'نحلّل الطرف الأول إلى جداء عاملين من الدرجة الأولى، ثم نطبّق خاصية الجداء المعدوم ونحلّ المعادلتين.',
        body: (
          <div className="space-y-2">
            {METHOD.steps.lines.map((line) => <p key={line}><MathText>{line}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{METHOD.solution[2]}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
