import MathText from '../../../../../common/components/MathText';
import { MODEL_RULE, STEPS, INEQUALITY_RULE, REALITY_RULE, METHOD_MODELLING } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس 4 « ترييض مشكلة » — SOURCE UNIQUE, construite à partir de la
 * طريقة p. 49 et des exercices du manuel (content/textbook.js). Une <KnowledgeBrick id="…">
 * dans un module et la carte rendent le même objet.
 *
 *   module 1  tarrid-namdhaja   ce que le laboratoire a fait : chaque grandeur qui change
 *                               porte x, l'équation est l'instant où deux grandeurs s'égalent
 *   module 2  tarrid-tariqa     les quatre étapes du manuel (أ ب جـ التحقق)
 *             tarrid-mutarajiha « أكبر من أو يساوي », « أقصر » → une متراجحة (دوري الآن 2)
 *             tahaqquq-waqi     la solution doit convenir à la situation (ex. 30, 40)
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'tarrid-namdhaja', type: 'concepts', title: 'ترييض مشكلة: من النص إلى المعادلة',
        memo: {
          rule: `x\\to ${R('52+x')}\\ =\\ ${R('4x+37')}`,
          hook: 'سمِّ المجهول ثم عبّر بدلالته',
          example: `52+x=4x+37`,
          trap: 'إضافة x مرّة واحدة لمجموع الأبناء',
          exam: 'أكتب ماذا يمثّل x ثم أعبّر عن كل كمية',
          chip: `52+x=4x+37`,
          quiz: [
            { q: 'بعد $x$ سنة يصير مجموع أعمار أربعة أبناء:', options: ['المجموع $+x$', 'المجموع $+4x$', 'المجموع $\\times x$'], correct: 1 },
            { q: 'المعادلة تترجم:', options: ['لحظة تساوي كميتين', 'عمر الأب وحده', 'مجموع الأبناء وحده'], correct: 0 },
          ],
        },
        predictPrompt: 'في السباق وضعتَ البطاقة «$+ x$» على الأب وعلى كل واحد من الأبناء، ثم بحثتَ عن اللحظة التي يتساوى فيها العمودان. لو أعطيناك مشكلة أخرى، كيف تنتقل من نصّها إلى معادلة؟ اكتب بكلماتك: ماذا يمثّل $x$، ومن يحمله، وماذا تعبّر عنه علامة «$=$».',
        summary: 'نسمّي المجهول x، ونعبّر بدلالته عن كل كمية تتغيّر معه؛ المعادلة تترجم لحظة تساوي كميتين.',
        body: (
          <div className="space-y-2">
            <p><MathText>{MODEL_RULE.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{METHOD_MODELLING.solution[1]}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'tarrid-tariqa', type: 'methodes', title: 'طريقة ترييض مشكلة',
        memo: {
          rule: `\\begin{aligned}x&\\to A=B\\\\&\\to x=\\ldots\\to\\checkmark\\end{aligned}`,
          hook: 'سمِّ عبّر حلّ ثم تحقّق',
          example: `3x=15\\to x=5`,
          trap: 'نسيان التحقق من الحل في نصّ المشكلة',
          exam: 'أكتب الخطوات الأربع بالترتيب',
          chip: `A=B\\to x=\\ldots`,
          quiz: [
            { q: 'آخر خطوة في طريقة ترييض مشكلة:', options: ['تسمية المجهول', 'التحقق من الحل في النص', 'كتابة المعادلة'], correct: 1 },
            { q: 'حلّ $52+x=4x+37$ هو:', options: ['$x=5$', '$x=15$', '$x=3$'], correct: 0 },
          ],
        },
        predictPrompt: 'قرأتَ حلّ مشكلة الأب وأبنائه في أربعة أسطر: أ) ثم ب) ثم جـ) ثم التحقق. لو أعطيناك مشكلة أخرى (أعمار، أثمان، أطوال)، بأيّ خطوات تحلّها؟ اكتب الطريقة بكلماتك، خطوة بعد خطوة، دون أرقام هذا المثال.',
        summary: 'أربع خطوات: نسمّي المجهول، نعبّر عن الوضعية بمعادلة أو متراجحة، نحلّها، ثم نتحقّق من الحل في نص المشكلة.',
        body: (
          <ol className="space-y-1">
            {[STEPS.name, STEPS.express, STEPS.solve, STEPS.check].map((s) => <li key={s}><MathText>{s}</MathText></li>)}
          </ol>
        ),
      },
      {
        id: 'tarrid-mutarajiha', type: 'concepts', title: 'مشكلة تترجمها متراجحة',
        memo: {
          rule: `A\\ ${R('\\geq')}\\ B\\to\\ x\\geq\\ldots`,
          hook: 'أكبر أو أصغر يعني متراجحة',
          example: `2x\\geq20\\to x\\geq10`,
          trap: 'كتابة معادلة حيث يسأل النص عن أكبر أو أصغر',
          exam: 'أعبّر بمتراجحة ثم أختار من حلولها ما يلائم السؤال',
          chip: `A\\geq B`,
          quiz: [
            { q: 'متى نكتب متراجحة بدل معادلة؟', options: ['حين يسأل النص عن «أكبر من» أو «أصغر من»', 'حين يوجد عددان فقط', 'دائمًا'], correct: 0 },
            { q: 'حلّ $6x\\geq4x+20$ هو:', options: ['$x\\geq10$', '$x\\leq10$', '$x=10$'], correct: 0 },
          ],
        },
        predictPrompt: 'في مسألة المسدّس والمربّع لم تكتب معادلة بل $6x \\geq 4x + 20$ ، ثم اخترتَ من بين حلولها ضلعًا واحدًا. ما الكلمات في نصّ المشكلة التي تجعلنا نكتب ذلك بدل معادلة؟ وكيف نجد الجواب المطلوب من بين كل الحلول؟ اكتب القاعدة بكلماتك.',
        summary: 'عندما يسأل النص عن «أكبر من» أو «أصغر من» أو «أقصر» نعبّر بمتراجحة، ثم نختار من حلولها ما يجيب عن السؤال.',
        body: <p><MathText>{INEQUALITY_RULE.text}</MathText></p>,
      },
      {
        id: 'tahaqquq-waqi', type: 'regles', title: 'حلّ يلائم الواقع',
        memo: {
          rule: `x=${R('-3')}\\ \\Rightarrow\\ \\times`,
          hook: 'الحلّ يلائم الواقع أو يُرفض',
          example: `x=-3\\ \\times`,
          trap: 'قبول حلّ سالب لمدة أو طول',
          exam: 'أتحقّق أن الحلّ موجب أو صحيح حسب المقام',
          chip: `x<0\\ \\times`,
          quiz: [
            { q: 'هل يصلح $x=-3$ جوابًا لسؤال «بعد كم سنة؟»', options: ['نعم', 'لا، لأنّ المدة لا تكون سالبة', 'نعم إذا كان عمرًا'], correct: 1 },
            { q: 'عدد تلاميذ يجب أن يكون:', options: ['عددًا طبيعيًا', 'عددًا سالبًا', 'كسرًا دائمًا'], correct: 0 },
          ],
        },
        predictPrompt: 'في السباق الأخير أعطتك المعادلة $x = -3$ لسؤال «بعد كم سنة؟». متى نقبل حلّ المعادلة جوابًا للمشكلة، ومتى نرفضه؟ فكّر في عدد سنوات، وطول ضلع، وعدد تلاميذ، ثم اكتب القاعدة بكلماتك.',
        summary: 'نحتفظ فقط بالحلول التي تلائم الوضعية: طول أو مدة لا يكون سالبًا، وعدد أشياء يكون عددًا طبيعيًا.',
        body: <p><MathText>{REALITY_RULE.text}</MathText></p>,
      },
    ],
  },
};
