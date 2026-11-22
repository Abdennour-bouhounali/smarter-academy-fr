import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD_FIND } from './content/textbook';

// La carte progressive de la leçon — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « البحث عن أعداد ناقصة » (1AM) — SOURCE UNIQUE (content/textbook.js : les mots de la plateforme, tirés de نشاط 1, de la طريقة p. 82 et des exercices 15–16 du manuel ;
 * rien n'est copié au mot).
 */
/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'naqis-majmu', type: 'concepts', title: 'العدد الناقص في مجموع',
        memo: {
          rule: `\\square=54-${R('9')}`,
          hook: 'الطرح يُرجع الجمع',
          example: `46{,}2-17{,}5=28{,}7`,
          trap: 'لا أجمع مرّة أخرى: $54+9=63$ يُبعد الصندوق',
          exam: 'ترجم الوضعية بمساواة ثمّ اطرح العدد المعلوم من الناتج وتحقّق',
          chip: `\\square=54-9`,
          quiz: [
            { q: 'العدد الناقص في $\\square+20=75$ :', options: ['$55$', '$95$', '$75$'], correct: 0 },
            { q: 'نتحقّق من $\\square=55$ بالتعويض :', options: ['$55+20=75$', '$55-20=75$', '$75+20=55$'], correct: 0 },
          ],
        },
        predictPrompt: 'آلة بطاقتها « ⁦+ 9⁩ » أخرجت 54 قلمًا. بأيّ بطاقة أرجعتَ الحزام؟ وماذا وجدتَ في صندوق الدخول؟ وماذا خرج حين دفعتَ الصندوق إلى الأمام؟ اكتب ما لاحظتَه.',
        summary: 'في مجموع □ + a = b نجد العدد الناقص بالعملية العكسية للجمع، أي بالطرح : □ = b − a ؛ ثمّ نتحقّق بالتعويض : (b − a) + a = b.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.sum.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'naqis-farq', type: 'regles', title: 'العدد الناقص في فرق',
        memo: {
          rule: `${R('a')}-\\square=b\\to a-b`,
          hook: 'أين مكان □ في الفرق؟',
          example: `\\square-14=54\\to 68`,
          trap: 'في $80-\\square=54$ نطرح ولا نجمع',
          exam: 'انظر هل □ هو المطروح منه أم المطروح قبل أن تختار العملية',
          chip: `80-\\square=54`,
          quiz: [
            { q: 'العدد الناقص في $\\square-9=40$ :', options: ['$49$', '$31$', '$40$'], correct: 0 },
            { q: 'العدد الناقص في $50-\\square=18$ :', options: ['$32$', '$68$', '$18$'], correct: 0 },
          ],
        },
        predictPrompt: 'آلة بطاقتها « ⁦− 14⁩ » وآلة أخرى بطاقتها « ⁦80 −⁩ » أخرجتا 54. بأيّ بطاقة أرجعتَ كلاًّ منهما؟ هل الجواب في الحالتين جمعٌ؟ ماذا وجدتَ حين جرّبتَ « + » على الآلة « ⁦80 −⁩ »؟ اكتب ما لاحظتَه.',
        summary: 'في فرق □ − a = b نجمع : □ = b + a. وفي فرق a − □ = b نطرح الناتج من a : □ = a − b ؛ المطروح هو المجهول فلا نعكس الإشارة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.diff.first}</MathText></p>
            <p><MathText>{KNOWLEDGE.diff.second}</MathText></p>
          </div>
        ),
      },
      {
        id: 'naqis-judaa', type: 'regles', title: 'العدد الناقص في جداء',
        memo: {
          rule: `\\square=54\\div${R('6')}`,
          hook: 'القسمة تُرجع الضرب',
          example: `\\square=\\frac{20}{7}`,
          trap: 'أقسم الناتج على المعلوم لا العكس: $54\\div 6$',
          exam: 'اقسم الناتج على العدد المعلوم، وإن لم تتوقّف القسمة فاكتب كسرًا',
          chip: `\\square=54\\div 6`,
          quiz: [
            { q: 'العدد الناقص في $4\\times\\square=30$ :', options: ['$7{,}5$', '$120$', '$26$'], correct: 0 },
            { q: 'إذا لم تتوقّف القسمة نكتب العدد الناقص :', options: ['كسرًا', 'عددًا تقريبيًّا', 'لا يوجد عدد'], correct: 0 },
          ],
        },
        predictPrompt: 'آلة بطاقتها « ⁦× 6⁩ » أخرجت 54. بأيّ بطاقة أرجعتَ الحزام؟ وماذا ظهر على الصندوق حين كانت البطاقة « ⁦× 7⁩ » والناتج 20؟ اكتب ما لاحظتَه.',
        summary: 'في جداء a × □ = b نجد العدد الناقص بالقسمة : □ = b ÷ a ، وهي العملية العكسية للضرب ؛ وإذا لم تتوقّف القسمة كتبنا الناتج كسرًا b/a.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.product.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'tahaqquq', type: 'regles', title: 'التحقّق بالتعويض',
        memo: {
          rule: `${R('45')}+9=54`,
          hook: 'أُدخل ما وجدتُه في الآلة الأصلية',
          example: `\\frac{20}{7}\\times 7=20`,
          trap: 'القيمة التقريبية لا تحقّق المساواة بالضبط: $2{,}86\\times 7=20{,}02$',
          exam: 'اكتب التعويض والناتج، ثمّ قل إنّ العدد صحيح',
          chip: `45+9=54`,
          quiz: [
            { q: 'نعوّض $\\square=31$ في $80-\\square=54$ فنجد :', options: ['$49$ فالعدد خاطئ', '$54$ فالعدد صحيح', '$111$'], correct: 0 },
            { q: 'نتحقّق من $\\square=8$ في $6\\times\\square=48$ بـ :', options: ['$6\\times 8=48$', '$6+8=48$', '$48-8=6$'], correct: 0 },
          ],
        },
        predictPrompt: 'بعد أن وجدتَ العدد الناقص دفعتَ الصندوق إلى الأمام. ماذا خرج حين كانت البطاقة صحيحة؟ وماذا خرج حين اخترتَ بطاقة غير صحيحة؟ وكيف تحقّقتَ من الكسر؟ اكتب ما لاحظتَه.',
        summary: 'نتحقّق بالتعويض : نضع العدد الذي وجدناه مكان □ ونحسب ؛ إن وجدنا الناتج المعلوم بالضبط فالعدد صحيح، وإن لم يكن كذلك أعدنا الحساب بعملية أخرى.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.check.text}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'musawat-naqisa', type: 'concepts', title: 'المساواة والعدد الناقص □',
        memo: {
          rule: `\\square+a=b\\to b-a`,
          hook: 'أنظر مكان □ ثمّ أختار العملية العكسية',
          example: `6\\times\\square=54\\to 9`,
          trap: 'ليس كلّ فرق يُحلّ بالجمع: أنظر مكان □',
          exam: 'اكتب شكل المساواة ثمّ العملية التي تُرجع الحساب',
          chip: `\\square=b-a`,
          quiz: [
            { q: 'العملية العكسية للضرب هي :', options: ['القسمة', 'الجمع', 'الضرب'], correct: 0 },
            { q: 'في $a-\\square=b$ نحسب □ بـ :', options: ['$a-b$', '$b-a$', '$a+b$'], correct: 0 },
          ],
        },
        predictPrompt: 'لماذا نكتب مربعًا □ مكان العدد الذي لا نعرفه؟ وما العدد الناقص في □ + 9 = 54 ؟ وما العملية التي تُرجع الحساب في كلّ شكل من الأشكال الأربعة؟',
        summary: 'نرمز إلى العدد المجهول بمربع □ : هو العدد الذي يُحقّق المساواة إذا وضعناه مكانه. نجده بالعملية العكسية : الطرح للجمع، والجمع للطرح، والقسمة للضرب ؛ وفي a − □ = b نحسب a − b.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.hole.definition}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.diff.first}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqa-naqisa', type: 'methodes', title: 'أجد وأتحقّق',
        memo: {
          rule: `\\square=45{,}1-${R('18{,}6')}`,
          hook: 'أترجم ثمّ أُرجع ثمّ أتحقّق ثمّ أجيب',
          example: `\\square=41{,}6\\div 13`,
          trap: 'لا أنسى التحقّق: هو الذي يكشف الخطأ',
          exam: 'اكتب المساواة ثمّ الحساب ثمّ التحقّق ثمّ الجواب',
          chip: `\\square=45{,}1-18{,}6`,
          quiz: [
            { q: 'الخطوة الأخيرة في الطريقة :', options: ['أجيب بجملة بعد التحقّق', 'أترجم بمساواة', 'أحسب فقط'], correct: 0 },
            { q: 'نتحقّق من $\\square=3{,}2$ في $13\\times\\square=41{,}6$ بـ :', options: ['$13\\times 3{,}2=41{,}6$', '$13+3{,}2=41{,}6$', '$41{,}6-3{,}2=13$'], correct: 0 },
          ],
        },
        predictPrompt: 'لتجد العدد الذي ينقص بعد أن أُضيف إليه 18,6 فصار 45,1 : بماذا بدأتَ؟ وبأيّ عملية أرجعتَ الحساب؟ وكيف تأكّدتَ من نتيجتك؟ اكتب الطريقة.',
        summary: 'أترجم الوضعية بمساواة فيها □ ، أُرجع بالعملية العكسية (الطرح للجمع، والجمع للطرح، والقسمة للضرب)، أتحقّق بالتعويض ثمّ أجيب بجملة.',
        body: (
          <div className="space-y-2">
            {METHOD_FIND.solution.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{METHOD_FIND.rule}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
