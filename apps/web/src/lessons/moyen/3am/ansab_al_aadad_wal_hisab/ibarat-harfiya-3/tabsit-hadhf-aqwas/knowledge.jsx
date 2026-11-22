import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD_BRACKETS } from './content/textbook';

// La carte progressive de la leçon — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « تبسيط عبارة جبرية وحذف الأقواس » (3AM) — SOURCE UNIQUE (content/textbook.js : les mots de la plateforme, tirés de
 * معارف 1–2 et de طرائق 1 du manuel ; rien n'est copié au mot).
 */
/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'hudud-mutashabiha', type: 'concepts', title: 'الحدود المتشابهة',
        memo: {
          rule: `2${R('x')}+4${R('x')}=6${R('x')}`,
          hook: 'الجزء الحرفي نفسه',
          example: `2x+4x+x=${R('7x')}`,
          trap: 'لا تجمع x مع عدد أو مع x²',
          exam: 'لوّن الحدود المتشابهة بلون واحد قبل الجمع',
          chip: `a${R('x')}+b${R('x')}`,
          quiz: [
            { q: 'أيّ حدّين متشابهان؟', options: ['$3x$ و $-5x$', '$3x$ و $3x^2$', '$3x$ و $3$'], correct: 0 },
            { q: 'الحدّان $4x$ و $4$ :', options: ['غير متشابهين', 'متشابهان', 'متشابهان لأنّ لهما العدد نفسه'], correct: 0 },
          ],
        },
        predictPrompt: 'رتّبتَ حزمة $x$ في صينية $x$ ورفضت الطاولة حزمة $x^2$ في تلك الصينية. متى تكون حزمتان من نوع واحد؟ اكتب ما لاحظته.',
        summary: 'حدّان متشابهان إذا كان لهما الجزء الحرفي نفسه: 3x و −5x متشابهان، والعددان متشابهان، أمّا x² و x فلا.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.like.text}</MathText></p></div>,
      },
      {
        id: 'jam-muamilat', type: 'regles', title: 'جمع المعاملات',
        memo: {
          rule: `ax+bx=(${R('a+b')})x`,
          hook: 'اجمع المعاملات واحفظ الحرف',
          example: `5x-2x=${R('3')}x`,
          trap: 'لا تضرب المعاملين: 5x − 2x ليس 10x',
          exam: 'اكتب مجموع المعاملات أمام الجزء الحرفي',
          chip: `(${R('a+b')})x`,
          quiz: [
            { q: '$5x-2x$ يساوي:', options: ['$3x$', '$7x$', '$3$'], correct: 0 },
            { q: '$-x+4x$ يساوي:', options: ['$3x$', '$-5x$', '$4x^2$'], correct: 0 },
          ],
        },
        predictPrompt: 'في صينية $x$ اجتمعت حزمتان فصارتا حزمة واحدة، ومرّةً بقيت قطع بعد أن تلاشت أخرى. كيف تعرف عدد القطع في الصينية؟ اكتب ما فعلتَه بالأعداد.',
        summary: 'نبسّط مجموعًا بجمع معاملات الحدود المتشابهة وإبقاء الجزء الحرفي؛ وحدّان متشابهان معاملاهما متعاكسان يتلاشيان.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.merge.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.noMix.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'qima-thabita', type: 'regles', title: 'القيمة لا تتغيّر',
        memo: {
          rule: `2x+5x=${R('7x')}\\ \\forall x`,
          hook: 'التبسيط لا يغيّر القيمة',
          example: `x=2:\\ 7\\times2+4=${R('18')}`,
          trap: 'إذا اختلفت القيمتان فالتبسيط خاطئ',
          exam: 'تحقّق بقيمة لـ x قبل أن تجيب',
          chip: `${R('=')}\\ \\forall x`,
          quiz: [
            { q: 'من أجل $x=1$ ، $2x+3+4x+1+x$ يساوي:', options: ['$11$', '$7$', '$4$'], correct: 0 },
            { q: 'عبارة وصورتها المبسّطة، من أجل كل $x$ :', options: ['لهما القيمة نفسها', 'تختلفان أحيانًا', 'تتساويان عند $x=0$ فقط'], correct: 0 },
          ],
        },
        predictPrompt: 'غيّرتَ $x$ فتحرّك العدّادان معًا وبقيا متساويين طوال الترتيب. ماذا بقي ثابتًا بعد تبسيط العبارة؟ اكتب ما لاحظته.',
        summary: 'التبسيط يغيّر كتابة العبارة لا قيمتها: للعبارة وصورتها المبسّطة القيمة نفسها مهما كان x.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.valueKept.text}</MathText></p></div>,
      },
    ],
    2: [
      {
        id: 'majmu-wa-jidaa', type: 'concepts', title: 'مجموع أم جداء؟', predict: false,
        memo: {
          rule: `x+x=${R('2x')}`,
          hook: 'المجموع غير الجداء',
          example: `x\\times x=${R('x^2')}`,
          trap: 'لا تكتب x + x = x²',
          exam: 'حدّد أوّلًا: جمع أم ضرب؟',
          chip: `x\\cdot x=${R('x^2')}`,
          quiz: [
            { q: '$x+x$ يساوي:', options: ['$2x$', '$x^2$', '$2x^2$'], correct: 0 },
            { q: '$x\\times x$ يساوي:', options: ['$x^2$', '$2x$', '$x$'], correct: 0 },
          ],
        },
        summary: 'عبارة مجموع إذا كانت آخر عملية فيها جمعًا أو طرحًا، وجداء إذا كانت آخر عملية فيها ضربًا.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.sumOrProduct.text}</MathText></p></div>,
      },
      {
        id: 'jidaa-hududayn', type: 'regles', title: 'جداء حدود',
        memo: {
          rule: `ax\\times bx=${R('ab')}x^2`,
          hook: 'اضرب المعاملات واجمع القوى',
          example: `3x\\times 2x=${R('6x^2')}`,
          trap: 'لا تجمع المعاملين: 3x × 2x ليس 5x²',
          exam: 'اكتب جداء المعاملات ثم الحرف بقوّته',
          chip: `${R('ab')}x^2`,
          quiz: [
            { q: '$3x\\times 2x$ يساوي:', options: ['$6x^2$', '$5x^2$', '$6x$'], correct: 0 },
            { q: '$4\\times 5x$ يساوي:', options: ['$20x$', '$9x$', '$20x^2$'], correct: 0 },
          ],
        },
        predictPrompt: 'كتبتَ $3x\\times5x$ عوامل عاملًا عاملًا. كيف تحصل على العدد وكيف تحصل على الحرف؟ اكتب ما فعلتَه.',
        summary: 'نبسّط جداء حدود بضرب الأعداد معًا والحروف معًا: 3x × 5x = 15x².',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.product.text}</MathText></p></div>,
      },
    ],
    3: [
      {
        id: 'aqwas-jam', type: 'regles', title: 'قوسان مسبوقان بـ +',
        memo: {
          rule: `+(a-b)=${R('a-b')}`,
          hook: 'بعد + : انسخ كما هو',
          example: `7+(2x-3)=${R('2x+4')}`,
          trap: 'لا تغيّر أيّ إشارة بعد +',
          exam: 'احذف القوسين وانسخ الحدود بإشاراتها',
          chip: `+(${R('a-b')})`,
          quiz: [
            { q: '$5+(x-2)$ يساوي:', options: ['$x+3$', '$-x+7$', '$x+7$'], correct: 0 },
            { q: '$+(3-x)$ يساوي:', options: ['$3-x$', '$-3+x$', '$3+x$'], correct: 0 },
          ],
        },
        predictPrompt: 'أخرجتَ كل حزمة من صندوق مسبوق بالإشارة $+$ كما هي وقبلت الطاولة ذلك. ماذا يحدث لإشارة كل حدّ عند حذف القوسين؟ اكتب ما لاحظته.',
        summary: 'قوسان مسبوقان بـ + نحذفهما ونُبقي إشارة كل حدّ كما هي.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.plus.text}</MathText></p></div>,
      },
      {
        id: 'aqwas-tarh', type: 'regles', title: 'قوسان مسبوقان بـ −',
        memo: {
          rule: `-(a-b)=${R('-a+b')}`,
          hook: 'بعد − : كل الإشارات تنقلب',
          example: `9-(4x-5)=${R('-4x+14')}`,
          trap: 'لا تعكس إشارة الحدّ الأوّل وحده',
          exam: 'اعكس إشارة كل حدّ داخل القوسين',
          chip: `-(${R('a-b')})`,
          quiz: [
            { q: '$9-(4x-5)$ يساوي:', options: ['$-4x+14$', '$-4x+4$', '$4x+4$'], correct: 0 },
            { q: '$-(x+3)$ يساوي:', options: ['$-x-3$', '$-x+3$', '$x-3$'], correct: 0 },
          ],
        },
        predictPrompt: 'رفضت الطاولة إخراج الحزم كما هي من الصندوق المسبوق بالإشارة $-$ وقبلتها بعكس إشارتها. ماذا يحدث لإشارة كل حدّ عند حذف القوسين؟ اكتب ما لاحظته.',
        summary: 'قوسان مسبوقان بـ − نحذفهما ونغيّر إشارة كل حدّ كان بينهما.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.minus.text}</MathText></p></div>,
      },
      {
        id: 'tariqat-hadhf', type: 'methodes', title: 'أحذف الأقواس وأبسّط',
        memo: {
          rule: `-(5-2x)=${R('-5+2x')}`,
          hook: 'احذف، رتّب، اجمع',
          example: `3x+(x-2)-(5-2x)=${R('6x-7')}`,
          trap: 'انتبه لإشارة كل قوس على حدة',
          exam: 'احذف الأقواس ثم اجمع الحدود المتشابهة',
          chip: `${R('6x-7')}`,
          quiz: [
            { q: '$2x-(x-4)$ يساوي:', options: ['$x+4$', '$x-4$', '$3x+4$'], correct: 0 },
            { q: '$x+(2-x)-(3+x)$ يساوي:', options: ['$-x-1$', '$x-1$', '$x+5$'], correct: 0 },
          ],
        },
        predictPrompt: 'أخرجتَ الحزم من صناديقها ثم رتّبتها في الصواني. ما الخطوات التي اتّبعتَها بالترتيب؟ اكتبها بكلماتك.',
        summary: 'نحذف الأقواس بقاعدتها، ثم نجمع الحدود المتشابهة، ثم نكتب العبارة بأقل ما يمكن من الحدود.',
        body: (
          <div className="space-y-2">
            {METHOD_BRACKETS.solution.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{METHOD_BRACKETS.rule}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
