import MathText from '../../../../../common/components/MathText';
import { ACT3, ACT3_LINES, MEAN_REMINDER, ACT4_LINES, KNOW3, KNOW4, METHOD_1B, METHOD_2 } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « مدى ووسيط ومتوسط سلسلة إحصائية » — SOURCE UNIQUE.
 *
 *   module 1 (نشاط 3)  mada-nashat (« يسمى هذا الفرق مدى »), mutawassit-mutawazin (rappel déclaré : le المتوسط
 *                      المتوازن, et sa lecture « point d'équilibre » du lab)
 *   module 2 (نشاط 4 + معارف)  mada (معارف 3), wasit (معارف 4), markaz-fia (le poids moyen par مراكز الفئات),
 *                      fia-wasitiya (la ملاحظة 3 de معارف 4)
 *   module 3 (طرائق)   wasit-rutba (la méthode des rangs), qiyam-mutatarrifa (3 et 43 : la moyenne bouge, pas la médiane)
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'mada-nashat', type: 'concepts', title: 'مدى سلسلة الرواتب',
        memo: {
          rule: `E=x_{\\max}-${R('x_{\\min}')}`,
          hook: 'أكبر ناقص أصغر',
          example: `52000-${R('7000')}=45000`,
          trap: 'طرح أول قيمة من آخر قيمة دون ترتيب',
          exam: 'حدّد الأكبر والأصغر ثم اطرح',
          chip: `x_{\\max}-${R('x_{\\min}')}`,
          quiz: [
            { q: 'رواتب بآلاف الدنانير: $18,30,25,12$. المدى:', options: ['$85$', '$6$', '$18$'], correct: 2 },
            { q: 'مدى السلسلة $7,7,7$ هو:', options: ['$7$', '$0$', '$21$'], correct: 1 },
          ],
        },
        // Un NOM : la question du manuel le donne elle-même (« يسمى هذا الفرق مدى سلسلة الرواتب ») — rien à prédire.
        predict: false,
        summary: 'الفرق بين أكبر قيمة وأصغر قيمة في سلسلة يسمّى مداها: في نشاط 3 مدى الرواتب خمسة وأربعون ألف دينار.',
        body: (
          <div className="space-y-2">
            <p><MathText>{ACT3.q1}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{ACT3_LINES.salary}</MathText></p>
          </div>
        ),
      },
      {
        id: 'mutawassit-mutawazin', type: 'regles', title: 'المتوسط المتوازن',
        memo: {
          rule: `\\bar{x}=\\dfrac{\\sum f_ix_i}{${R('N')}}`,
          hook: 'اضرب ثم اجمع ثم اقسم',
          example: `\\dfrac{3\\times3+8\\times2}{${R('5')}}=5`,
          trap: 'القسمة على عدد القيم المختلفة لا التكرار الكلي',
          exam: 'أنشئ سطر الجداءات قبل القسمة',
          chip: `\\tfrac{\\sum fx}{N}`,
          quiz: [
            { q: 'القيمتان $3$ (تكرارها $3$) و $8$ (تكرارها $2$). المتوسط:', options: ['$5{,}5$', '$5$', '$4{,}5$'], correct: 1 },
            { q: 'مجموع $5$ قيم يساوي $40$ فمتوسطها:', options: ['$200$', '$5$', '$8$'], correct: 2 },
          ],
        },
        summary: 'المتوسط هو مجموع القيم مقسومًا على عددها؛ في جدول نضرب كل قيمة في تكرارها ثم نقسم على التكرار الكلّي. عنده تتوازن القيم.',
        body: (
          <div className="space-y-2">
            <p><MathText>{MEAN_REMINDER.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{MEAN_REMINDER.balance}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'mada', type: 'concepts', title: 'مدى سلسلة إحصائية',
        memo: {
          rule: `E=x_{\\max}-x_{\\min}`,
          hook: 'تشتت القيم',
          example: `15-${R('2')}=13`,
          trap: 'ظنّ المدى قيمة من السلسلة',
          exam: 'المدى يقيس التشتت لا الموقع',
          chip: `\\max-\\min`,
          quiz: [
            { q: 'سلسلتان لهما المتوسط نفسه ومداهما $4$ و $20$. الأكثر تشتتا:', options: ['التي مداها $4$', 'التي مداها $20$', 'لا فرق بينهما'], correct: 1 },
            { q: 'مدى السلسلة $2,9,15,11,4$ هو:', options: ['$13$', '$15$', '$9$'], correct: 0 },
          ],
        },
        summary: 'مدى سلسلة إحصائية هو الفرق بين أكبر قيمة وأصغر قيمة لها، ويعطي فكرة عن تشتّت قيمها.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOW3.definition}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOW3.note}</MathText></p>
          </div>
        ),
      },
      {
        id: 'wasit', type: 'concepts', title: 'وسيط سلسلة إحصائية',
        memo: {
          rule: `r=\\dfrac{N+1}{${R('2')}}`,
          hook: 'نصف يمين ونصف يسار',
          example: `N=11:\\;r=\\dfrac{11+1}{2}=${R('6')}`,
          trap: 'أخذ الوسيط قبل ترتيب القيم',
          exam: 'رتّب القيم ثم عيّن رتبة الوسيط',
          chip: `\\tfrac{N+1}{2}`,
          quiz: [
            { q: 'عدد القيم $11$ وهي مرتبة. رتبة الوسيط:', options: ['$5{,}5$', '$11$', '$6$'], correct: 2 },
            { q: 'وسيط السلسلة المرتبة $3,5,8,10$ هو:', options: ['$5$', '$6{,}5$', '$8$'], correct: 1 },
          ],
        },
        summary: 'الوسيط قيمة تجزئ السلسلة المرتّبة إلى سلسلتين لهما نفس التكرار، وليس بالضرورة قيمة من قيم السلسلة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOW4.definition}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOW4.notes[0]}</MathText></p>
          </div>
        ),
      },
      {
        id: 'markaz-fia', type: 'methodes', title: 'المتوسط بمراكز الفئات',
        memo: {
          rule: `c=\\dfrac{a+b}{${R('2')}}`,
          hook: 'عوّض الفئة بمركزها',
          example: `\\dfrac{34+38}{2}=${R('36')}`,
          trap: 'أخذ الحد الأدنى للفئة بدل مركزها',
          exam: 'اكتب مراكز الفئات في سطر ثم احسب المتوسط',
          chip: `\\tfrac{a+b}{2}`,
          quiz: [
            { q: 'مركز الفئة $[10;20[$ هو:', options: ['$15$', '$10$', '$20$'], correct: 0 },
            { q: 'الفئتان $[0;10[$ و $[10;20[$ تكراراهما $1$ و $3$. المتوسط بالمراكز:', options: ['$10$', '$7{,}5$', '$12{,}5$'], correct: 2 },
          ],
        },
        predictPrompt: 'الأوزان مجمّعة في فئات: نعرف فئة كل تلميذ، لا وزنه الدقيق. بأيّ عدد تعوّض كل فئة (مثلًا $34 \\le P < 38$) لتقدّر الوزن المتوسط للتلاميذ الـ 41؟ اكتب طريقتك خطوة بخطوة.',
        summary: 'في سلسلة مجمّعة في فئات نعوّض كل فئة بمركزها، نصف مجموع حدّيها، ثم نحسب المتوسط المتوازن: نحصل على تقدير للمتوسط.',
        body: (
          <div className="space-y-2">
            <p><MathText>{ACT4_LINES.centers}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{ACT4_LINES.weightsMean}</MathText></p>
          </div>
        ),
      },
      {
        id: 'fia-wasitiya', type: 'concepts', title: 'الفئة الوسيطية',
        memo: {
          rule: `\\uparrow\\;\\ge\\;\\dfrac{N}{${R('2')}}`,
          hook: 'أول فئة تبلغ النصف',
          example: `N=40:\\;18<20\\le${R('27')}`,
          trap: 'اختيار الفئة ذات أكبر تكرار',
          exam: 'علّل بالتكرارات المجمعة الصاعدة',
          chip: `\\uparrow\\ge\\tfrac{N}{2}`,
          quiz: [
            { q: 'التكرارات المجمعة الصاعدة لأربع فئات: $6,18,27,40$. الفئة الوسيطية:', options: ['الثانية', 'الثالثة', 'الرابعة'], correct: 1 },
            { q: 'التكرار الكلي $50$. نبحث عن أول فئة صاعدها يبلغ على الأقل:', options: ['$5$', '$50$', '$25$'], correct: 2 },
          ],
        },
        // Un NOM déjà donné deux fois avant la brique (ملاحظات de معارف 4 à l'étape 3, مثال 2 juste avant) et
        // l'élève vient de choisir « الفئة الوسيطية » par son nom dans la question des 41 poids — rien à prédire.
        predict: false,
        summary: 'في سلسلة مجمّعة في فئات نبحث عن الفئة التي تشمل الوسيط وتسمّى الفئة الوسيطية؛ التكرارات المجمّعة الصاعدة تدلّ عليها.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOW4.notes[2]}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{ACT4_LINES.medianClass}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'wasit-rutba', type: 'methodes', title: 'الوسيط بالرتب',
        memo: {
          rule: `\\dfrac{x_{${R('N/2')}}+x_{${R('N/2+1')}}}{2}`,
          hook: 'الرتبتان في الوسط',
          example: `N=60:\\;\\dfrac{x_{${R('30')}}+x_{${R('31')}}}{2}`,
          trap: 'الاكتفاء بنصف التكرار الكلي عند العدد الزوجي',
          exam: 'اكتب رتبة الوسيط قبل قراءته',
          chip: `x_{\\frac{N+1}{2}}`,
          quiz: [
            { q: 'عدد القيم $57$ وهي مرتبة. رتبة الوسيط:', options: ['$28{,}5$', '$29$', '$57$'], correct: 1 },
            { q: 'عدد القيم $60$. الوسيط منتصف القيمتين ذواتي الرتبتين:', options: ['$29$ و $30$', '$30$ و $31$', '$30$ فقط'], correct: 1 },
          ],
        },
        predictPrompt: 'في رواتب العمال الـ 11 أخذت القيمة السادسة، وفي حرارة الوادي (10 قيم) منتصف القيمتين الخامسة والسادسة. لسلسلة مرتّبة من $57$ قيمة، ثم من $60$ قيمة: كيف تعيّن رتبة الوسيط دون كتابة كل القيم؟ اكتب الطريقة بدلالة عدد القيم $N$.',
        summary: 'نرتّب السلسلة: إذا كان التكرار الكلّي فرديًا فالوسيط القيمة ذات الرتبة الوسطى، وإذا كان زوجيًا فهو منتصف القيمتين اللتين في الوسط.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD_2.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{METHOD_2.solution[0]}</MathText></p>
          </div>
        ),
      },
      {
        id: 'qiyam-mutatarrifa', type: 'regles', title: 'قيمة بعيدة: المتوسط والوسيط',
        memo: {
          rule: `\\Delta\\bar{x}\\neq0\\;,\\;\\Delta Me\\approx${R('0')}`,
          hook: 'المتوسط يتأثر والوسيط صامد',
          example: `\\bar{x}:6\\to11{,}7\\;,\\;Me:6\\to${R('6{,}5')}`,
          trap: 'القول إن الوسيط يتغيّر كالمتوسط',
          exam: 'قارن المؤشرات قبل الإضافة وبعدها',
          chip: `\\bar{x}\\uparrow\\;\\;Me\\approx`,
          quiz: [
            { q: 'أضفنا القيمة $40$ إلى السلسلة $4,5,6,7,8$. المؤشر الذي تغيّر أكثر:', options: ['الوسيط', 'المتوسط', 'لم يتغيّرا'], correct: 1 },
            { q: 'مدى $4,5,6,7,8$ بعد إضافة $40$:', options: ['$4$', '$40$', '$36$'], correct: 2 },
          ],
        },
        predictPrompt: 'أضفت إلى السلسلة القيمتين $3$ و $43$ وحسبت المؤشّرات الثلاثة من جديد. قارن المتوسط والوسيط والمدى قبل الإضافة وبعدها: ماذا تستنتج عن أثر قيمة بعيدة جدًّا في كل مؤشّر؟ ولماذا؟',
        summary: 'إضافة قيمة بعيدة جدًّا تغيّر المتوسط والمدى كثيرًا ولا تغيّر الوسيط إلّا قليلًا أو لا تغيّره: الوسيط يتعلّق بالرتب.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD_1B.solution[0]}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{METHOD_1B.solution[1]}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
