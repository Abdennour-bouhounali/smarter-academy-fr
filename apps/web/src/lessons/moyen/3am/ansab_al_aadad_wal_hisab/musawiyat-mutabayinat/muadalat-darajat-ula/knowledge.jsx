import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « المعادلات من الدرجة الأولى بمجهول واحد » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js :
 * معارف 4–5 p. 76 et طرائق p. 77, réécrits). L'équation « a ÷ … = b » (2AM), la réduction d'une expression et les propriétés des égalités sont des
 * prérequis (`priorKnowledge`), mesurés par « أستعدّ », jamais des items ici.
 */
const { definition, solution, check, sign, divide, model } = KNOWLEDGE;

/** `memo` : la fiche de « 🔑 للتذكّر » — ce qui CHANGE en `R(…)` (rouge). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'naql-hadd', type: 'regles', title: 'الحدّ الذي يعبر يغيّر إشارته',
        memo: {
          rule: `x+b=c\\iff x=c${R('-b')}`,
          hook: 'يعبر فيغيّر إشارته',
          example: `3x+2=x+8\\Rightarrow 3x${R('-x')}=8${R('-2')}`,
          trap: 'ننسى تغيير الإشارة عند العبور',
          exam: 'اكتب: أضفت معاكس الحدّ إلى الطرفين',
          chip: `+b\\to ${R('-b')}`,
          quiz: [
            { q: 'في $3x+2=x+8$ ينتقل $x$ إلى الطرف الأيسر فيصير:', options: ['$+x$', '$-x$', '$2x$'], correct: 1 },
            { q: 'نقل الحدّ $+2$ إلى الطرف الآخر يعطي:', options: ['$-2$', '$+2$', '$\\frac{1}{2}$'], correct: 0 },
          ],
        },
        predictPrompt: 'في العبّارة عبر الصندوق إلى الضفّة الأخرى بعكس إشارته ولم تنكسر المعادلة. ماذا يحدث لإشارة حدّ ينتقل من طرف إلى آخر؟ ولماذا؟ اكتب القاعدة بكلماتك.',
        summary: 'عندما ينتقل حدّ إلى الطرف الآخر تتغيّر إشارته، لأنّنا أضفنا معاكسه إلى الطرفين.',
        body: (
          <div className="space-y-2">
            <p><MathText>{sign.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.moved}</MathText></p>
          </div>
        ),
      },
      {
        id: 'qisma-muamil', type: 'regles', title: 'نقسم على معامل x',
        memo: {
          rule: `ax=n\\Rightarrow x=\\dfrac{n}{${R('a')}}\\quad(a\\neq0)`,
          hook: 'اقسم على معامل x',
          example: `2x=6\\Rightarrow x=\\dfrac{6}{${R('2')}}=3`,
          trap: 'لا نطرح المعامل ولا نضربه: نقسم',
          exam: 'اشترط $a\\neq0$ ثم اكتب $x$ على أبسط شكل',
          chip: `x=\\tfrac{n}{${R('a')}}`,
          quiz: [
            { q: 'إذا كان $4x=12$ فإنّ $x=$', options: ['$8$', '$48$', '$3$'], correct: 2 },
            { q: 'إذا كان $-5x=15$ فإنّ $x=$', options: ['$3$', '$-3$', '$-75$'], correct: 1 },
          ],
        },
        predictPrompt: 'بقي $x$ وحده مضروبًا في عدد، مثل $4x = 12$ . ماذا فعلتَ بالعدد $4$ لتجد $x$ ؟ اكتب ما تفعله دائمًا.',
        summary: 'عندما يبقى ax = n (a ≠ 0) نقسم الطرفين على a فنجد x = n/a.',
        body: <p><MathText>{divide.text}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'muadala-taarif', type: 'vocabulaire', title: 'المعادلة من الدرجة الأولى', predict: false,
        memo: {
          rule: `${R('a')}x+b=${R('c')}x+d`,
          hook: 'مساواة فيها مجهول',
          example: `3x+2=x+8`,
          trap: 'ليست كلّ مساواة معادلة: لا بدّ من مجهول',
          exam: 'سمِّ المجهول واكتب المعادلة بمجهول واحد',
          chip: `ax+b=cx+d`,
          quiz: [
            { q: 'أيّ هذه معادلة من الدرجة الأولى بمجهول واحد؟', options: ['$3+2=5$', '$3x+2=x+8$', '$x^2=9$'], correct: 1 },
            { q: 'المجهول في $4x-3=2x+7$ هو:', options: ['$x$', '$4$', '$7$'], correct: 0 },
          ],
        },
        summary: 'المعادلة مساواة فيها مجهول؛ ومن الشكل ax + b = cx + d بمجهول واحد هي معادلة من الدرجة الأولى بمجهول واحد.',
        body: <p><MathText>{definition.text}</MathText></p>,
      },
      {
        id: 'hall-muadala', type: 'vocabulaire', title: 'حلّ معادلة', predict: false,
        memo: {
          rule: `a${R('s')}+b=c${R('s')}+d`,
          hook: 'قيمة تجعل الطرفين متساويين',
          example: `3\\times${R('3')}+2=${R('3')}+8=11`,
          trap: 'عدد يحقّق طرفًا واحدًا فقط ليس حلًّا',
          exam: 'اكتب: الحلّ هو كذا ثم عوّض في الطرفين',
          chip: `x=${R('s')}`,
          quiz: [
            { q: 'هل $x=3$ حلّ لـ $3x+2=x+8$ ؟', options: ['نعم: الطرفان يساويان $11$', 'لا: الطرف الأيسر $11$ والأيمن $8$', 'لا: الطرف الأيسر $9$ والأيمن $11$'], correct: 0 },
            { q: 'حلّ المعادلة $2x=10$ هو:', options: ['$8$', '$20$', '$5$'], correct: 2 },
          ],
        },
        summary: 'حلّ معادلة هو قيمة المجهول التي تجعل الطرفين متساويين.',
        body: <p><MathText>{solution.text}</MathText></p>,
      },
      {
        id: 'tahqqaq-taawid', type: 'methodes', title: 'أتحقق بالتعويض',
        memo: {
          rule: `a${R('s')}+b\\overset{?}{=}c${R('s')}+d`,
          hook: 'عوّض في الطرفين',
          example: `4\\times5-3=17\\quad2\\times5+7=17`,
          trap: 'نعوّض في المعادلة الأصلية لا في الأخيرة',
          exam: 'اكتب قيمة كل طرف ثم: إذن العدد حلّ',
          chip: `L(s)=R(s)`,
          quiz: [
            { q: 'للتحقق أنّ $5$ حلّ لـ $4x-3=2x+7$ نحسب:', options: ['الطرف الأيمن وحده', 'كلّ طرف من المعادلة عند $x=5$', 'المعادلة بعد التبسيط فقط'], correct: 1 },
            { q: '$4x-3=2x+7$ عند $x=5$ يعطي الطرفين:', options: ['$23$ و $17$', '$17$ و $15$', '$17$ و $17$'], correct: 2 },
          ],
        },
        predictPrompt: 'كيف تتأكّد أنّ عددًا حلّ لمعادلة دون أن تحلّها من جديد؟ اكتب ما تحسبه.',
        summary: 'نعوّض العدد في الطرفين ونحسب كلًّا منهما: إذا ساويا العدد نفسه فهو حلّ.',
        body: <p><MathText>{check.text}</MathText></p>,
      },
    ],
    3: [
      {
        id: 'tariqat-hall', type: 'methodes', title: 'مراحل حلّ معادلة',
        memo: {
          rule: `ax+b=cx+d\\Rightarrow(a${R('-c')})x=d${R('-b')}\\Rightarrow x=\\dfrac{d-b}{a-c}`,
          hook: 'انقل ثم اجمع ثم اقسم ثم عوّض',
          example: `6x-5=2x+7\\Rightarrow 4x=12\\Rightarrow x=3`,
          trap: 'ننسى القسمة بعد جمع الحدود',
          exam: 'اكتب كلّ مرحلة في سطر مستقل ثم تحقّق',
          chip: `\\tfrac{d-b}{a-c}`,
          quiz: [
            { q: 'حلّ $6x-5=2x+7$ هو:', options: ['$12$', '$\\frac{1}{2}$', '$3$'], correct: 2 },
            { q: 'بعد نقل الحدود في $6x-5=2x+7$ نجد:', options: ['$4x=12$', '$8x=2$', '$4x=2$'], correct: 0 },
          ],
        },
        predictPrompt: 'في $6x - 5 = 2x + 7$ ماذا فعلتَ أوّلًا، وماذا ثانيًا، وماذا أخيرًا؟ اكتب المراحل بترتيبها.',
        summary: METHOD.solve.rule,
        body: <p><MathText>{METHOD.solve.rule}</MathText></p>,
      },
      {
        id: 'tarhiq-mushkila', type: 'methodes', title: 'أرييض مشكلة',
        memo: {
          rule: `${R('x')}\\to ax+b=cx+d\\to x=s\\to\\checkmark`,
          hook: 'اختر ثم ترجم ثم حلّ ثم تحقّق',
          example: `3x+40=5x-20\\Rightarrow x=30`,
          trap: 'ننسى التحقق من الحلّ في نص المشكلة',
          exam: 'اختر المجهول مع وحدته ثم صرّح بالحلّ',
          chip: `x=${R('s')}`,
          quiz: [
            { q: 'ثمن القلم $x$ دج. ثمن $3$ أقلام وكرّاسة بـ $40$ دج يُكتب:', options: ['$43x$', '$3+40x$', '$3x+40$'], correct: 2 },
            { q: 'بعد أن وجدنا $x=30$ في المشكلة، آخر مرحلة هي:', options: ['التحقق في نص المشكلة', 'حذف المجهول', 'ضرب الطرفين في $30$'], correct: 0 },
          ],
        },
        predictPrompt: 'قبل أن تكتب المعادلة في مشكلة الأقلام: ماذا اخترتَ، وماذا ترجمتَ؟ وبعد الحلّ ماذا فعلتَ؟ اكتب المراحل.',
        summary: 'نختار المجهول مع وحدته، نترجم المعطيات، نكتب معادلة ونحلّها، نصرّح بالحلّ ونتحقق منه في نص المشكلة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{model.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{model.example}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
