import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD_EXPAND, METHOD_DOUBLE } from './content/textbook';

// La carte progressive de la leçon — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « نشر عبارات جبرية » (3AM) — SOURCE UNIQUE (content/textbook.js : les mots de la plateforme, tirés de
 * معارف 3 et de طرائق 2–3 du manuel ; rien n'est copié au mot).
 */
/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'masaha-tariqatayn', type: 'concepts', title: 'مساحة بطريقتين',
        memo: {
          rule: `3(x+4)=${R('3x+12')}`,
          hook: 'مساحة واحدة، طريقتان',
          example: `x=5:\\ 3\\times 9=15+12`,
          trap: 'المساواة صحيحة لكل قيمة لـ x، لا لقيمة واحدة',
          exam: 'تحقّق بقيمة لـ x: الطرفان متساويان',
          chip: `3(x+4)=${R('3x+12')}`,
          quiz: [
            { q: 'من أجل $x=2$ ، $3(x+4)$ يساوي:', options: ['$18$', '$10$', '$14$'], correct: 0 },
            { q: 'مساحة مستطيل بُعداه $5$ و $x+2$ :', options: ['$5x+10$', '$5x+2$', '$x+10$'], correct: 0 },
          ],
        },
        predictPrompt: 'قطعتَ الأرض إلى أجزاء وحسبتَ مساحة كل جزء فتساوى العدّادان دائمًا مهما غيّرتَ $x$. ماذا تستنتج عن مساحة الأرض؟ اكتب ما لاحظته.',
        summary: 'مساحة المستطيل جداء بعديه، وهي أيضًا مجموع مساحات أجزائه: العبارتان متساويتان من أجل كل قيمة لـ x.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.areaTwoWays.text}</MathText></p></div>,
      },
      {
        id: 'hadd-matruh', type: 'regles', title: 'الممرّ يُطرح',
        memo: {
          rule: `k(x-a)=kx-${R('ka')}`,
          hook: 'الممرّ يُطرح',
          example: `2(x-3)=2x-${R('6')}`,
          trap: 'لا تكتب 2x − 3: العامل يضرب الحدّين',
          exam: 'وزّع العامل على الحدّين مع إشارتيهما',
          chip: `kx-${R('ka')}`,
          quiz: [
            { q: '$4(x-5)$ يساوي:', options: ['$4x-20$', '$4x-5$', '$4x+20$'], correct: 0 },
            { q: '$2(x-3)$ من أجل $x=5$ :', options: ['$4$', '$7$', '$16$'], correct: 0 },
          ],
        },
        predictPrompt: 'اقتطعتَ من الأرض ممرًّا مبلّطًا فقبلت الطاولة أن تُطرح مساحته. كيف تكتب مساحة ما بقي بدلالة مساحة الأرض كلها؟ اكتب ما فعلتَه.',
        summary: 'مساحة ما بقي بعد اقتطاع ممرّ هي مساحة الأرض كلها ناقص مساحة الممرّ: $k(x-3)=kx-3k$.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.bite.text}</MathText></p></div>,
      },
      {
        id: 'rukn-yuad', type: 'regles', title: 'ركن الممرّين يُردّ',
        memo: {
          rule: `(-a)\\times(-b)=${R('+ab')}`,
          hook: 'الركن يُردّ',
          example: `(x-2)(x-3)=x^2-5x${R('+6')}`,
          trap: 'جداء سالبين موجب: لا تكتب −6',
          exam: 'اكتب إشارة كل جداء قبل أن تجمع',
          chip: `(-)(-)=${R('+')}`,
          quiz: [
            { q: '$(-2)\\times(-3)$ يساوي:', options: ['$+6$', '$-6$', '$-5$'], correct: 0 },
            { q: 'الحدّ الثابت في نشر $(x-4)(x-1)$ :', options: ['$+4$', '$-4$', '$-5$'], correct: 0 },
          ],
        },
        predictPrompt: 'اقتطعتَ ممرّين متقاطعين فصارت قطعة الركن تُضاف. لماذا كانت إشارتها موجبة؟ اكتب ما لاحظته.',
        summary: 'ركن الممرّين المتقاطعين يُطرح مرّتين فنردّه مرّة: جداء عددين سالبين موجب.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.corner.text}</MathText></p></div>,
      },
    ],
    2: [
      {
        id: 'tawzi-darb', type: 'regles', title: 'نشر k(a + b)',
        memo: {
          rule: `k(a+b)=${R('ka')}+${R('kb')}`,
          hook: 'العامل يضرب كل حدّ',
          example: `5(x+2)=${R('5x')}+${R('10')}`,
          trap: 'لا تنسَ ضرب الحدّ الثاني',
          exam: 'اكتب كل جداء ثم بسّط',
          chip: `k(a+b)=${R('ka+kb')}`,
          quiz: [
            { q: '$5(x+2)$ يساوي:', options: ['$5x+10$', '$5x+2$', '$7x$'], correct: 0 },
            { q: '$-2(x-4)$ يساوي:', options: ['$-2x+8$', '$-2x-8$', '$-2x-4$'], correct: 0 },
          ],
        },
        predictPrompt: 'ضربتَ عددًا في مجموع حدّين وكتبتَ الناتج مجموعًا. ماذا فعلتَ بالعدد؟ اكتب ما فعلتَه.',
        summary: 'الضرب يتوزّع على الجمع والطرح: k(a + b) = ka + kb و k(a − b) = ka − kb.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.distribute1.text}</MathText></p></div>,
      },
      {
        id: 'jidaa-qawsayn', type: 'regles', title: 'نشر (a + b)(c + d)',
        memo: {
          rule: `\\begin{aligned}&(a+b)(c+d)\\\\=\\;&${R('ac+ad')}\\\\+\\;&${R('bc+bd')}\\end{aligned}`,
          hook: 'كل حدّ في كل حدّ',
          example: `(x+3)(x+2)=x^2+${R('5x')}+6`,
          trap: 'أربعة جداءات لا اثنان',
          exam: 'ارسم الأسهم الأربعة ثم اجمع الحدود المتشابهة',
          chip: `${R('ac+ad+bc+bd')}`,
          quiz: [
            { q: '$(x+1)(x+4)$ يساوي:', options: ['$x^2+5x+4$', '$x^2+4$', '$x^2+5x+5$'], correct: 0 },
            { q: 'كم جداءً في نشر $(a+b)(c+d)$ ؟', options: ['$4$', '$2$', '$3$'], correct: 0 },
          ],
        },
        predictPrompt: 'نشرتَ جداء مجموعين بأسهم من كل حدّ إلى كل حدّ. كم جداءً حصلتَ عليه ولماذا؟ اكتب ما لاحظته.',
        summary: 'كل حدّ من القوس الأول يضرب كل حدّ من الثاني ثم نجمع الجداءات: (a + b)(c + d) = ac + ad + bc + bd.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.distribute2.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.signs.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'aqwas-tawzi', type: 'concepts', title: 'حذف الأقواس هو النشر', predict: false,
        memo: {
          rule: `-(a-b)=${R('-a+b')}`,
          hook: 'العامل الخفيّ −1',
          example: `-(x-7)=${R('-x+7')}`,
          trap: 'الإشارة − تغيّر إشارة كل حدّ، لا الأوّل فقط',
          exam: 'اكتب −1 أمام القوس ووزّعه',
          chip: `-(a-b)=${R('-a+b')}`,
          quiz: [
            { q: '$-(2x-5)$ يساوي:', options: ['$-2x+5$', '$-2x-5$', '$2x-5$'], correct: 0 },
            { q: '$+(x-3)$ يساوي:', options: ['$x-3$', '$-x+3$', '$x+3$'], correct: 0 },
          ],
        },
        summary: 'قاعدة حذف الأقواس المسبوقة بـ + أو − هي توزيع العامل +1 أو −1 على كل حدّ.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.bridge.text}</MathText></p></div>,
      },
    ],
    3: [
      {
        id: 'ishara-jidaa', type: 'regles', title: 'إشارة كل جداء',
        memo: {
          rule: `(-)\\times(-)=${R('+')}`,
          hook: 'نفس الإشارة: موجب',
          example: `-3(x-4)=-3x${R('+12')}`,
          trap: 'انتبه: −3 في −4 يعطي +12',
          exam: 'حدّد إشارة كل جداء قبل كتابته',
          chip: `(-)(-)=${R('+')}`,
          quiz: [
            { q: '$(-5)\\times(+2)$ يساوي:', options: ['$-10$', '$+10$', '$-3$'], correct: 0 },
            { q: '$-4(x-2)$ يساوي:', options: ['$-4x+8$', '$-4x-8$', '$4x+8$'], correct: 0 },
          ],
        },
        predictPrompt: 'رسمتَ سهمًا إلى حدّ سالب فاختلفت إشارة الجداء. كيف تعرف إشارة كل جداء؟ اكتب ما لاحظته.',
        summary: 'نكتب كل جداء مع إشارته: موجب في موجب أو سالب في سالب موجب، ومختلفا الإشارة سالب.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.signs.text}</MathText></p></div>,
      },
      {
        id: 'tariqat-nashr', type: 'methodes', title: 'أنشر وأبسّط وأرتّب',
        memo: {
          rule: `-4(x-1)=${R('-4x+4')}`,
          hook: 'أنشر، اجمع، رتّب',
          example: `3(2-x)-4(x-1)=${R('-7x+10')}`,
          trap: 'الإشارة − أمام العامل تغيّر كل حدّ في القوس',
          exam: 'رتّب حسب قوى x تنازليًا وتحقّق بقيمة',
          chip: `${R('-mc-md')}`,
          quiz: [
            { q: '$2(x+1)-3(x-2)$ يساوي:', options: ['$-x+8$', '$-x-4$', '$5x-4$'], correct: 0 },
            { q: '$x(x+2)-x^2$ يساوي:', options: ['$2x$', '$2x^2+2x$', '$x^2+2x$'], correct: 0 },
          ],
        },
        predictPrompt: 'نشرتَ ثم جمعتَ المتشابهة ثم راقبتَ بقيمة. ما الخطوات التي اتّبعتَها بالترتيب؟ اكتبها بكلماتك.',
        summary: 'ننشر كل جداء، ثم نجمع الحدود المتشابهة، ثم نرتّب حسب قوى x تنازليًا، ونراقب بقيمة.',
        body: (
          <div className="space-y-2">
            {METHOD_EXPAND.solution.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.order.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{METHOD_DOUBLE.rule}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
