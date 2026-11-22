import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس 3 « تعيين دالة تآلفية انطلاقًا من عددين وصورتيهما » — SOURCE UNIQUE. Le
 * manuel fourni n'a pas d'encadré « معارف » : chaque item est une FORMALISATION déclarée de la plateforme
 * (content/textbook.js › KNOWLEDGE, `addition('knowledge_formalization')`), nommant ce que le نشاط 4 et
 * le laboratoire ont fait voir.
 *
 *   module 1 (نشاط 4)   tanasub-taghayyurat — nommé après les marches de l'élève (quotient constant) ;
 *   module 2 (تعيين)    burhan-taghayyurat, hisab-muamil-a, hisab-b, tariqat-jumla-ab.
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'tanasub-taghayyurat', type: 'regles', title: 'تناسب التغيّرات',
        memo: {
          rule: `\\dfrac{f(x_1)-f(x_2)}{x_1-x_2}=${R('a')}`,
          hook: 'الحاصل ثابت في كل درجة',
          example: `\\dfrac{f(4)-f(1)}{4-1}=\\dfrac{600}{3}=${R('200')}`,
          trap: 'ظنّ أنّ الحاصل يكبر مع اتّساع الدرجة',
          exam: 'اكتب أنّ الحاصل ثابت ويساوي المعامل',
          chip: `\\tfrac{f(x_1)-f(x_2)}{x_1-x_2}=${R('a')}`,
          quiz: [
            { q: 'لدالة $f(x) = 3x + 7$ ، حاصل القسمة $\\dfrac{f(5) - f(2)}{5 - 2}$ يساوي:', options: ['$3$', '$9$', '$7$'], correct: 0 },
            { q: 'إذا كان $\\dfrac{f(8) - f(3)}{8 - 3} = 4$ فإنّ $\\dfrac{f(20) - f(11)}{20 - 11}$ يساوي:', options: ['$4$', '$36$', '$9$'], correct: 0 },
          ],
        },
        predictPrompt: 'في درجاتك وفي حواصل الكتاب الثلاثة وجدت العدد نفسه 200 ، مهما كان العددان. لو غيّر المركّب الاشتراك السنوي وثمن المقابلة، ماذا تتوقّع لحاصل قسمة فرق مبلغين على فرق عددي المقابلات؟ بماذا يتعلّق، وبماذا لا يتعلّق؟ اكتب القاعدة بكلماتك.',
        summary: 'في دالة تآلفية حاصل قسمة فرق صورتي عددين متمايزين على فرق هذين العددين ثابت، يساوي المعامل a مهما كان العددان: تغيّرات الصور متناسبة مع تغيّرات الأعداد.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.tanasub.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.tanasub.example}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'burhan-taghayyurat', type: 'regles', title: 'لماذا يساوي الحاصل a؟',
        memo: {
          rule: `f(x_1)-f(x_2)=${R('a')}(x_1-x_2)`,
          hook: 'الحدّ الثابت يختفي في الطرح',
          example: `(5x_1-2)-(5x_2-2)=${R('5')}(x_1-x_2)`,
          trap: 'القسمة على فرق معدوم حين يتساوى العددان',
          exam: 'اذكر أنّ العددين متمايزان قبل القسمة',
          chip: `f(x_1)-f(x_2)=${R('a')}(x_1-x_2)`,
          quiz: [
            { q: 'إذا كان $f(x) = 4x + 9$ فإنّ $f(x_1) - f(x_2)$ يساوي:', options: ['$4(x_1 - x_2)$', '$4(x_1 - x_2) + 9$', '$4x_1 - 4x_2 - 18$'], correct: 0 },
            { q: 'نشترط $x_1 \\neq x_2$ في حاصل القسمة لأنّ:', options: ['فرق العددين مقام ولا قسمة على 0', 'الحاصل يصير سالبًا', 'الصورتين تتساويان دائمًا'], correct: 0 },
          ],
        },
        predictPrompt: 'مع $f(x) = 200x + 2000$ وجدت الحاصل 200 في كل درجة، ولم يظهر الاشتراك 2000 أبدًا. اكتب الفرق $f(x_1) - f(x_2)$ لمناصرَين تابعا $x_1$ و $x_2$ مقابلة: ماذا يحدث للعدد 2000؟ ولماذا يعطي الحاصل دائمًا 200؟ ومتى لا يمكن حسابه؟',
        summary: 'فرق صورتي عددين يساوي a ضرب فرق العددين لأن الحد الثابت b يختفي في الطرح؛ وبما أن العددين متمايزان نقسم على فرقهما فنجد a.',
        body: (
          <div className="space-y-2">
            {KNOWLEDGE.burhan.lines.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.burhan.remark}</MathText></p>
          </div>
        ),
      },
      {
        id: 'hisab-muamil-a', type: 'methodes', title: 'حساب a من عددين وصورتيهما',
        memo: {
          rule: `${R('a')}=\\dfrac{y_1-y_2}{x_1-x_2}`,
          hook: 'فرق الصورتين على فرق العددين',
          example: `${R('a')}=\\dfrac{86-50}{30-10}=\\dfrac{36}{20}=${R('1{,}8')}`,
          trap: 'قسمة فرق الصورتين وحده أو عكس الترتيب',
          exam: 'اكتب الكسر بالترتيب نفسه في البسط والمقام',
          chip: `${R('a')}=\\tfrac{y_1-y_2}{x_1-x_2}`,
          quiz: [
            { q: '$f(2) = 7$ و $f(6) = 19$ . المعامل $a$ يساوي:', options: ['$3$', '$12$', '$4$'], correct: 0 },
            { q: '$f(1) = 5$ و $f(4) = -4$ . المعامل $a$ يساوي:', options: ['$-3$', '$3$', '$-\\frac{1}{3}$'], correct: 0 },
          ],
        },
        predictPrompt: 'لا نعرف عبارة $f(x)$ ، نعرف فقط $f(10) = 50$ و $f(30) = 86$ . بما رأيته في درجات نشاط 4، كيف تحسب المعامل $a$ من هذه الأعداد الأربعة؟ اكتب الطريقة بكلماتك.',
        summary: 'نحسب المعامل a بقسمة فرق الصورتين على فرق العددين، مع الطرح بالترتيب نفسه في البسط وفي المقام.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.hisabA.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.hisabA.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'hisab-b', type: 'methodes', title: 'حساب b وكتابة العبارة',
        memo: {
          rule: `${R('b')}=y_1-a\\times x_1`,
          hook: 'الصورة ناقص جداء المعامل في العدد',
          example: `${R('b')}=50-1{,}8\\times 10=50-18=${R('32')}`,
          trap: 'أخذ الصورة نفسها أو قسمتها على العدد',
          exam: 'تحقّق من العبارة بالعدد الآخر',
          chip: `${R('b')}=y_1-ax_1`,
          quiz: [
            { q: '$a = 3$ و $f(2) = 7$ . العدد $b$ يساوي:', options: ['$1$', '$4$', '$13$'], correct: 0 },
            { q: '$a = 2$ و $f(5) = 4$ . العدد $b$ يساوي:', options: ['$-6$', '$6$', '$\\frac{4}{5}$'], correct: 0 },
          ],
        },
        predictPrompt: 'وجدت $a = 1{,}8$ ، وتعرف أنّ $f(10) = 50$ . كيف تجد العدد $b$ في $f(x) = ax + b$ ؟ وكيف تتأكّد بعد ذلك أنّ العبارة التي كتبتها صحيحة؟ اكتب الطريقة.',
        summary: 'بعد معرفة a نعوّض أحد العددين وصورته: b يساوي الصورة ناقص a ضرب العدد، ثم نكتب عبارة الدالة ونتحقق بالعدد الآخر.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.hisabB.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.hisabB.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'tariqat-jumla-ab', type: 'methodes', title: 'طريقة ثانية: جملة معادلتين',
        memo: {
          rule: `\\begin{aligned}ax_1+b&=y_1\\\\ax_2+b&=y_2\\end{aligned}`,
          hook: 'الطرح يزيل المجهول الثاني',
          example: `(30a+b)-(10a+b)=86-50\\Rightarrow ${R('a')}=1{,}8`,
          trap: 'نسيان أنّ المجهولين هما المعامل والحدّ الثابت',
          exam: 'اكتب الجملة ثم حلّها بالطرح',
          chip: `ax_1+b=y_1`,
          quiz: [
            { q: '$f(2) = 7$ و $f(6) = 19$ : الجملة هي:', options: ['$2a + b = 7$ و $6a + b = 19$', '$7a + b = 2$ و $19a + b = 6$', '$2a + 7 = b$ و $6a + 19 = b$'], correct: 0 },
            { q: 'بطرح المعادلة الأولى من الثانية في الجملة السابقة نجد:', options: ['$4a = 12$', '$8a + 2b = 26$', '$4a + b = 12$'], correct: 0 },
          ],
        },
        predictPrompt: 'دون حساب حاصل القسمة: $f(x) = ax + b$ مع $f(10) = 50$ و $f(30) = 86$ . اكتب ما تعنيه كل معلومة بدلالة $a$ و $b$ . ماذا تحصل؟ وكيف تجد منه $a$ و $b$ بما تعلّمته من قبل؟',
        summary: 'نكتب أن صورتي العددين معلومتان فنحصل على جملة معادلتين مجهولاها a و b، نحلها بطرح المعادلتين لنتخلص من b.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.jumla.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.jumla.example}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
