import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, PLATFORM } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « المتطابقات الشهيرة » — SOURCE UNIQUE, construite
 * à partir de معارف 2 (content/textbook.js). Une <KnowledgeBrick> dans un
 * module et la carte rendent le même objet.
 *
 *   محور 1  murabba-majmu, hisab-mutamaan, murabba-farq — établies par
 *           le terrain carré, les chaînes « انقل وأكمل », le calcul mental 41², 62², 49², 38²
 *           (nombres de la plateforme depuis le rollout du 2026-11-11 ; les exemples des cartes
 *           sont ceux de content/textbook.js › PLATFORM — aucun ne montre la مسألة)
 *   محور 2  jidaa-majmu-farq — l'activité 2 (3)
 *   محور 3  mutatabiqa — la définition de معارف 2
 *   محور 4  tariqat-nashr — la طريقة p. 35
 *
 * Les `summary` restent du texte simple (carte, مذكرة) : les formules sont dans `body`.
 */
const { squareSum, squareDiff, sumDiff } = KNOWLEDGE;
const { examples } = PLATFORM;

/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'murabba-majmu', type: 'regles', title: 'مربع مجموع',
        memo: {
          rule: `(a+b)^2=a^2+${R('2ab')}+b^2`,
          hook: 'مربّعان وضعف الجداء',
          example: `(x+5)^2=x^2+${R('10x')}+25`,
          trap: 'نسيان ضعف الجداء: مربّع المجموع ليس مجموع المربّعين',
          exam: 'أكتب المتطابقة ثم أعوّض الحدّين وأحسب كل حدّ',
          chip: `(a+b)^2`,
          quiz: [
            { q: '$(x+5)^2 =$', options: ['$x^2+10x+25$', '$x^2+25$', '$x^2+5x+25$'], correct: 0 },
            { q: '$(5x+1)^2 =$', options: ['$5x^2+10x+1$', '$25x^2+10x+1$', '$25x^2+1$'], correct: 1 },
          ],
        },
        predictPrompt: 'على ملعبك $(x + 4)^2$ حملتَ أربع مناطق: $x^2$ و $4x$ و $4x$ و $16$ ، ورأيت الشريطين متقايسين. لو أعطيناك حدّين آخرين $a$ و $b$ ، كيف تكتب $(a + b)^2$ دون قوسين؟ اكتب القاعدة بكلماتك.',
        summary: 'مربع مجموع حدّين يساوي مربع الأول زائد ضعف جداء الحدّين زائد مربع الثاني.',
        body: (
          <div className="space-y-2">
            <p><MathText>{squareSum.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{examples[0]}</MathText></p>
          </div>
        ),
      },
      {
        id: 'hisab-mutamaan', type: 'methodes', title: 'الحساب الذهني بمتطابقة',
        memo: {
          rule: `n^2=a^2\\pm${R('2ab')}+b^2`,
          hook: 'عدد مدوّر زائد عدد صغير',
          example: `21^2=400+${R('40')}+1`,
          trap: 'كتابة مربّع العدد بجمع مربّعين فقط دون ضعف الجداء',
          exam: 'أكتب العدد مجموعًا أو فرقًا لعدد مدوّر ثم أطبّق المتطابقة',
          chip: `n^2=(a\\pm b)^2`,
          quiz: [
            { q: '$19^2 =$', options: ['$401$', '$359$', '$361$'], correct: 2 },
            { q: '$52^2 =$', options: ['$2504$', '$2604$', '$2704$'], correct: 2 },
          ],
        },
        predictPrompt: 'حسبت $41^2$ و $62^2$ دون وضع العملية. لو أعطيناك عددًا آخر مثل $102^2$ أو $71^2$ ، بأيّ خطوة تبدأ؟ وماذا تفعل بعدها لتحسبه ذهنيًا؟ اكتب الطريقة.',
        summary: 'نكتب العدد مجموعًا أو فرقًا لعدد مدوّر وعدد صغير، ثم نستعمل متطابقة شهيرة فنحسب دون وضع العملية.',
        body: (
          <div className="space-y-2">
            <p>نكتب العدد مجموعًا أو فرقًا لعدد مدوّر وعدد صغير، ثم نحسب دون وضع العملية:</p>
            <p className="text-sm text-slate-600"><MathText>{'$21^2 = (20 + 1)^2 = 400 + 40 + 1 = 441$'}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{'$19^2 = (20 - 1)^2 = 400 - 40 + 1 = 361$'}</MathText></p>
          </div>
        ),
      },
      {
        id: 'murabba-farq', type: 'regles', title: 'مربع فرق',
        memo: {
          rule: `(a-b)^2=a^2-${R('2ab')}+b^2`,
          hook: 'ناقص ضعف الجداء وزائد المربّع',
          example: `(x-2)^2=x^2-${R('4x')}+4`,
          trap: 'كتابة ناقص مربّع الثاني بدل زائد مربّع الثاني',
          exam: 'أنتبه إلى إشارة كل حدّ ثم أتحقّق بقيمة واحدة',
          chip: `(a-b)^2`,
          quiz: [
            { q: '$(x-4)^2 =$', options: ['$x^2-16$', '$x^2-8x+16$', '$x^2-8x-16$'], correct: 1 },
            { q: '$(2x-5)^2 =$', options: ['$4x^2-20x+25$', '$4x^2-10x+25$', '$4x^2-20x-25$'], correct: 0 },
          ],
        },
        predictPrompt: 'على ملعبك $(x - 5)^2$ اقتُطع شريطان $-5x$ و $-5x$ وظهر الركن $+25$ ، وفي السلسلة وجدت $-ab - ba$ ثم $(-b) \\times (-b)$ . كيف تكتب $(a - b)^2$ دون قوسين؟ اكتب القاعدة، وانتبه إلى إشارة كل حدّ.',
        summary: 'مربع فرق حدّين يساوي مربع الأول ناقص ضعف جداء الحدّين زائد مربع الثاني.',
        body: (
          <div className="space-y-2">
            <p><MathText>{squareDiff.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{examples[1]}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'jidaa-majmu-farq', type: 'regles', title: 'جداء مجموع حدين وفرقهما',
        memo: {
          rule: `(a+b)(a-b)=a^2-${R('b^2')}`,
          hook: 'مربّع الأول ناقص مربّع الثاني',
          example: `(2x+5)(2x-5)=4x^2-${R('25')}`,
          trap: 'جمع المربّعين بدل طرحهما، أو نسيان تربيع معامل الحرف',
          exam: 'ألاحظ مجموعًا في فرقه ثم أكتب مربّع الأول ناقص مربّع الثاني',
          chip: `(a+b)(a-b)`,
          quiz: [
            { q: '$(x+6)(x-6) =$', options: ['$x^2+36$', '$x^2-12$', '$x^2-36$'], correct: 2 },
            { q: '$101 \\times 99 =$', options: ['$10001$', '$9999$', '$10000$'], correct: 1 },
          ],
        },
        predictPrompt: 'على الملعب $(x + 4)(x - 4)$ وضعتَ المنطقة $4x$ على المنطقة $-4x$ فبقي $0$ ، وفي البرهان اجتمع $-ab$ و $ba$ . لو أعطيناك حدّين آخرين $a$ و $b$ ، كيف تكتب $(a + b)(a - b)$ دون قوسين؟ اكتب القاعدة بكلماتك.',
        summary: 'جداء مجموع حدّين في فرقهما يساوي مربع الأول ناقص مربع الثاني.',
        body: (
          <div className="space-y-2">
            <p><MathText>{sumDiff.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{examples[2]}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{'$102 \\times 98 = (100 + 2)(100 - 2) = 10\\,000 - 4 = 9996$'}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'mutatabiqa', type: 'concepts', title: 'المتطابقة',
        memo: {
          rule: `A(x)=B(x)\\quad${R('\\forall x')}`,
          hook: 'صحيحة من أجل كل قيمة',
          example: `(x+5)^2=${R('x^2+10x+25')}`,
          trap: 'تجربة قيمة واحدة لا تكفي لإثبات متطابقة',
          exam: 'أنشر أو أتحقّق من أجل قيمتين على الأقل',
          chip: `A(x)\\equiv B(x)`,
          quiz: [
            { q: 'المساواة $(x+1)^2=x^2+2x+1$ صحيحة من أجل:', options: ['$x=0$ فقط', 'كل قيمة لـ $x$', '$x=1$ فقط'], correct: 1 },
            { q: 'المساواة $x^2=16$ هي:', options: ['متطابقة لأنّها تصحّ من أجل $x=4$', 'متطابقة لأنّ فيها مربّعًا', 'ليست متطابقة: تصحّ من أجل $x=4$ و $x=-4$ فقط'], correct: 2 },
          ],
        },
        predictPrompt: 'على الملعب صحّت المساواة $(x + 4)^2 = x^2 + 8x + 16$ من أجل كل قيمة جرّبتها لـ $x$ ، أمّا المساواة $x^2 = 16$ فتصحّ من أجل $x = 4$ ولا تصحّ من أجل $x = 1$ . ما الذي يميّز النوع الأول من المساواة؟ اكتب بكلماتك متى نسمّي مساواة فيها حروف «متطابقة».',
        summary: KNOWLEDGE.identity,
        body: (
          <div className="space-y-2">
            <p>{KNOWLEDGE.identity}</p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.remarkable}</MathText></p>
            <ul className="text-sm text-slate-700 list-disc ms-5 space-y-1">
              {[squareSum, squareDiff, sumDiff].map((p) => <li key={p.title}>{p.title}: <MathText>{p.text}</MathText></li>)}
            </ul>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'tariqat-nashr', type: 'methodes', title: 'نشر عبارة بمتطابقة شهيرة',
        memo: {
          rule: `a,b\\Rightarrow a^2\\pm${R('2ab')}+b^2`,
          hook: 'حدّد الحدّين ثم عوّض',
          example: `(2x-7)^2=4x^2-${R('28x')}+49`,
          trap: 'تربيع الحرف دون تربيع معامله',
          exam: 'أكتب الحدّين ثم المتطابقة ثم النتيجة مبسّطة',
          chip: `a=?,\\ b=?`,
          quiz: [
            { q: '$(3x+4)^2 =$', options: ['$3x^2+24x+16$', '$9x^2+12x+16$', '$9x^2+24x+16$'], correct: 2 },
            { q: '$(x+4)(x-4) =$', options: ['$x^2-8$', '$x^2-16$', '$x^2+16$'], correct: 1 },
          ],
        },
        predictPrompt: 'كشفت حلول الطريقة الثلاثة سطرًا سطرًا. لو أعطيناك عبارة أخرى مثل $(2x - 7)^2$ أو $(x + 4)(x - 4)$، بماذا تبدأ قبل أن تنشر؟ وماذا تفعل بعد ذلك؟ اكتب الطريقة في خطوات.',
        summary: METHOD.rule,
        body: (
          <div className="space-y-2">
            <p>{METHOD.rule}</p>
            <p className="text-sm text-slate-600"><MathText>{METHOD.solution[0]}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
