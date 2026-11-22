import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, DECIMAL_FRACTION, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « الكتابات الكسرية لحاصل قسمة واختزال كسر » (1AM) — SOURCE UNIQUE (content/textbook.js :
 * معارف 3 p. 55, le dernier exemple de معارف 1, طريقة p. 56).
 */
/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'kitabat-mutasawiya', type: 'regles', title: 'كتابات كسرية متساوية',
        memo: {
          rule: `\\dfrac{a}{b}=\\dfrac{a\\times ${R('k')}}{b\\times ${R('k')}}`,
          hook: 'نفس العدد فوق وتحت',
          example: `\\dfrac{3}{5}=\\dfrac{3\\times ${R('2')}}{5\\times ${R('2')}}=\\dfrac{6}{10}`,
          trap: 'إضافة نفس العدد للبسط والمقام تغيّر الكسر',
          exam: 'اكتب الضرب أو القسمة فوق وتحت معًا',
          chip: `\\tfrac{a\\times ${R('k')}}{b\\times ${R('k')}}`,
          quiz: [
            { q: 'أيّ كسر يساوي $\\frac{3}{5}$ ؟', options: ['$\\frac{12}{20}$', '$\\frac{4}{6}$', '$\\frac{6}{5}$'], correct: 0 },
            { q: '$\\frac{2}{7}=\\frac{\\ldots}{21}$ :', options: ['$6$', '$16$', '$3$'], correct: 0 },
          ],
        },
        predictPrompt: 'في دفترك: 3/5 ثم 6/10 ثم 12/20 ، ونفس الحصّة لم تتحرّك. ماذا يحدث للبسط وللمقام عندما نقطع كل قطعة إلى قطعتين؟ اكتب القاعدة بكلماتك: كيف نحصل على كتابة كسرية أخرى لنفس العدد؟',
        summary: 'لا يتغيّر الكسر عندما نضرب بسطه ومقامه في نفس العدد غير المعدوم، أو نقسمهما على نفس العدد غير المعدوم.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{'$\\frac{3}{5}=\\frac{3\\times 2}{5\\times 2}=\\frac{6}{10}$ ؛ $\\frac{12}{20}=\\frac{12\\div 4}{20\\div 4}=\\frac{3}{5}$'}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'kasr-ashri', type: 'regles', title: 'الكسر العشري والكتابة العشرية',
        memo: {
          rule: `\\dfrac{a}{${R('10')}}=0{,}a`,
          hook: 'مقام 10 أو 100: فاصلة',
          example: `\\dfrac{7}{4}=\\dfrac{175}{${R('100')}}=1{,}75`,
          trap: 'لا تلصق البسط بالمقام: 6 على 10 ليس 6,10',
          exam: 'اضرب حتى يصير المقام 10 أو 100 أو 1000',
          chip: `\\tfrac{6}{${R('10')}}=0{,}6`,
          quiz: [
            { q: '$\\frac{6}{10}$ يساوي:', options: ['$0{,}6$', '$6{,}10$', '$0{,}06$'], correct: 0 },
            { q: '$0{,}35$ يساوي:', options: ['$\\frac{35}{100}$', '$\\frac{35}{10}$', '$\\frac{3}{5}$'], correct: 0 },
          ],
        },
        predictPrompt: '$0{,}7$ هو سبعة أعشار، و $\\frac{6}{10}$ في الصينية هو $0{,}6$. كيف نحصل على الكتابة العشرية لكسر مثل $\\frac{7}{4}$ دون أن نقسم؟ اكتب الطريقة بكلماتك.',
        summary: 'كل عدد عشري يُكتب كسرًا عشريًا (مقامه 10 أو 100 أو 1000…): 0,7 = 7/10. ولكتابة كسر كتابة عشرية نبحث عن مقام 10 أو 100 أو 1000 بضرب البسط والمقام في نفس العدد، عندما يكون ذلك ممكنا.',
        body: (
          <div className="space-y-2">
            <p><MathText>{DECIMAL_FRACTION.text}</MathText></p>
            <p><MathText>{GUIDE.decimal}</MathText></p>
          </div>
        ),
      },
      {
        id: 'ikhtizal', type: 'concepts', title: 'اختزال كسر', predict: false,
        memo: {
          rule: `\\dfrac{a}{b}=\\dfrac{a\\div ${R('k')}}{b\\div ${R('k')}}`,
          hook: 'أصغر كتابة، نفس العدد',
          example: `\\dfrac{27}{45}=\\dfrac{27\\div ${R('9')}}{45\\div ${R('9')}}=\\dfrac{3}{5}`,
          trap: 'نقسم على قاسم مشترك للبسط والمقام، لا للمقام وحده',
          exam: 'اكتب القسمة على نفس العدد فوق وتحت',
          chip: `\\tfrac{a\\div ${R('k')}}{b\\div ${R('k')}}`,
          quiz: [
            { q: 'اختزال $\\frac{27}{45}$ :', options: ['$\\frac{3}{5}$', '$\\frac{3}{45}$', '$\\frac{27}{5}$'], correct: 0 },
            { q: 'نختزل $\\frac{12}{20}$ بالقسمة على:', options: ['$4$', '$3$', '$5$'], correct: 0 },
          ],
        },
        summary: 'نختزل كسرًا عندما نكتب كسرًا مساويًا له ببسط أصغر ومقام أصغر، بقسمة البسط والمقام على نفس العدد.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.remark}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqat-ikhtizal', type: 'methodes', title: 'طريقة اختزال كتابة كسرية',
        memo: {
          rule: `\\dfrac{45}{567}=\\dfrac{${R('5')}}{${R('63')}}`,
          hook: 'نقسم حتى لا يبقى قاسم',
          example: `\\dfrac{54}{45}=\\dfrac{${R('6')}}{${R('5')}}`,
          trap: 'لا تتوقّف ما دام للبسط والمقام قاسم مشترك',
          exam: 'استعمل قواعد قابلية القسمة على 2 و 3 و 5 و 9',
          chip: `\\tfrac{45}{567}=\\tfrac{${R('5')}}{${R('63')}}`,
          quiz: [
            { q: 'أبسط شكل لـ $\\frac{18}{24}$ :', options: ['$\\frac{3}{4}$', '$\\frac{9}{12}$', '$\\frac{6}{8}$'], correct: 0 },
            { q: '$\\frac{45}{567}$ : البسط والمقام يقبلان القسمة على:', options: ['$9$', '$5$', '$2$'], correct: 0 },
          ],
        },
        predictPrompt: 'لاختزال $\\frac{27}{45}$ في الصينية جمعنا كل 9 قطع في قطعة. لو أعطيناك كسرًا آخر، مثل $\\frac{45}{567}$ ، بأيّ خطوات تبدأ لتعرف على أيّ عدد تقسم؟ اكتب الطريقة.',
        summary: 'نبحث عن قاسم مشترك للبسط والمقام (جداول الضرب، قواعد قابلية القسمة)، ثم نقسم كلا منهما عليه؛ ونكرّر حتى لا يبقى قاسم مشترك غير 1: أبسط شكل ممكن.',
        body: (
          <div className="space-y-2">
            {METHOD.solution.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{GUIDE.simplest}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
