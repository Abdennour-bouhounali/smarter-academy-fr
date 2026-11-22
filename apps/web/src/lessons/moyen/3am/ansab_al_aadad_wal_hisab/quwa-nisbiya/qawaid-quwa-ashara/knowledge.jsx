import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « قواعد الحساب على قوى العدد 10 » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 3 p. 42, طرائق et دوري الآن
 * p. 43, réécrits). La décimale de 10ⁿ, 10⁰ et 10⁻ⁿ (leçon `quwa-adad-ashara`) et les unités (`wahdat`) ne sont PAS des items ici : ce sont des prérequis (`priorKnowledge`),
 * mesurés par « أستعدّ ». Le rappel de `quwat-adad-nisbi` est un encadré lié du module 2, pas un item.
 */
const { product, quotient, power, noSum } = KNOWLEDGE;
const L = (s) => <p className="text-center" dir="ltr"><MathText>{s}</MathText></p>;

/** `memo` — la FICHE DE MÉMOIRE (MemoCard, prototype 2026-10-28) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'jidaa-quwa-ashara', type: 'regles', title: 'جداء قوتين للعدد 10',
        memo: {
          rule: `10^{m}\\times10^{n}=10^{${R('m+n')}}`,
          hook: 'الجداء يجمع الأسّين',
          example: `10^{3}\\times10^{3}=10^{${R('6')}}`,
          trap: 'ضرب الأسّين بدل جمعهما',
          exam: 'اكتب القاعدة ثم طبّقها على الأسّين',
          chip: `10^{m+n}`,
          quiz: [
            { q: '$10^{4}\\times10^{5}$ تساوي:', options: ['$10^{9}$', '$10^{20}$', '$100^{9}$'], correct: 0 },
            { q: '$10^{-2}\\times10^{7}$ تساوي:', options: ['$10^{5}$', '$10^{-14}$', '$10^{9}$'], correct: 0 },
          ],
        },
        predictPrompt: 'شريطان متتابعان قطعا 3 أعمدة ثم 3 أعمدة. كم عمودًا بين لوحتي البداية والنهاية؟ وماذا يحدث للأسّين في $10^m \\times 10^n$ ؟',
        summary: '10ᵐ × 10ⁿ = 10ᵐ⁺ⁿ : نجمع الأسّين.',
        body: (
          <div className="space-y-2">
            <p><MathText>{product.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{product.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'hasil-quwa-ashara', type: 'regles', title: 'حاصل قسمة قوتين للعدد 10',
        memo: {
          rule: `\\dfrac{10^{m}}{10^{n}}=10^{${R('m-n')}}`,
          hook: 'القسمة تطرح الأسّين',
          example: `\\dfrac{10^{3}}{10^{-2}}=10^{${R('5')}}`,
          trap: 'إهمال إشارة الأسّ السالب عند الطرح',
          exam: 'اطرح أسّ المقام من أسّ البسط',
          chip: `10^{m-n}`,
          quiz: [
            { q: '$\\dfrac{10^{8}}{10^{3}}$ تساوي:', options: ['$10^{5}$', '$10^{11}$', '$10^{24}$'], correct: 0 },
            { q: '$\\dfrac{10^{3}}{10^{-2}}$ تساوي:', options: ['$10^{5}$', '$10^{1}$', '$10^{-5}$'], correct: 0 },
          ],
        },
        predictPrompt: 'بين لوحة كم ولوحة سم 5 أعمدة، وهما على جهتي لوحة المتر. اكتب قاعدة $\\frac{10^m}{10^n}$ ، وانتبه إلى إشارة الأسّ السالب.',
        summary: '10ᵐ / 10ⁿ = 10ᵐ⁻ⁿ : ننقص أسّ المقام من أسّ البسط.',
        body: (
          <div className="space-y-2">
            <p><MathText>{quotient.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{quotient.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'quwat-quwa-ashara', type: 'regles', title: 'قوة قوة للعدد 10',
        memo: {
          rule: `(10^{m})^{n}=10^{${R('mn')}}`,
          hook: 'قوة القوة تضرب الأسّين',
          example: `(10^{3})^{2}=10^{${R('6')}}`,
          trap: 'جمع الأسّين بدل ضربهما',
          exam: 'اكتب الأسّ الجديد جداء الأسّين',
          chip: `10^{mn}`,
          quiz: [
            { q: '$(10^{2})^{4}$ تساوي:', options: ['$10^{8}$', '$10^{6}$', '$10^{16}$'], correct: 0 },
            { q: '$(10^{-3})^{2}$ تساوي:', options: ['$10^{-6}$', '$10^{-1}$', '$10^{6}$'], correct: 0 },
          ],
        },
        predictPrompt: 'في جدول المساحة لكل وحدة عمودان: من كم² إلى م² قطع الشريط 6 أعمدة. ماذا تفعل بالأسّين في $(10^m)^n$ ؟',
        summary: '(10ᵐ)ⁿ = 10ᵐⁿ : نضرب الأسّين.',
        body: (
          <div className="space-y-2">
            <p><MathText>{power.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{power.example}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'qawaid-thalatha', type: 'regles', title: 'القواعد الثلاث',
        memo: {
          rule: `\\begin{aligned}10^{m}\\times10^{n}&=10^{${R('m+n')}}\\\\\\dfrac{10^{m}}{10^{n}}&=10^{${R('m-n')}}\\\\(10^{m})^{n}&=10^{${R('mn')}}\\end{aligned}`,
          hook: 'نجمع وننقص ونضرب',
          example: `10^{2}\\times10^{3}=10^{${R('5')}}`,
          trap: 'خلط القاعدة بين الجداء وقوة القوة',
          exam: 'سمِّ القاعدة المستعملة في كل خطوة',
          chip: `${R('+')}\\ ;\\ ${R('-')}\\ ;\\ ${R('\\times')}`,
          quiz: [
            { q: 'لحساب $10^{2}\\times10^{5}$ نفعل بالأسّين:', options: ['نجمعهما', 'نضربهما', 'نطرح أحدهما من الآخر'], correct: 0 },
            { q: 'لحساب $(10^{3})^{2}$ نفعل بالأسّين:', options: ['نضربهما', 'نجمعهما', 'نطرح أحدهما من الآخر'], correct: 0 },
          ],
        },
        predictPrompt: 'لخّص بكلماتك: ماذا نفعل بالأسّين في جداء قوتين؟ وفي حاصل قسمتهما؟ وفي قوة قوة؟',
        summary: 'جداء: نجمع الأسّين ؛ قسمة: ننقص ؛ قوة قوة: نضرب.',
        body: (
          <div className="space-y-2">
            {L('$10^m \\times 10^n = 10^{m+n}$')}
            {L('$\\frac{10^m}{10^n} = 10^{m-n}$')}
            {L('$(10^m)^n = 10^{m \\times n}$')}
          </div>
        ),
      },
      {
        id: 'majmu-laysa', type: 'regles', title: 'لا قاعدة للجمع',
        memo: {
          rule: `10^{m}+10^{n}\\ne10^{${R('m+n')}}`,
          hook: 'للجمع لا قاعدة فاحسب كل قوة',
          example: `10^{2}+10^{3}=100+1000=${R('1100')}`,
          trap: 'جمع الأسّين في مجموع قوتين',
          exam: 'احسب كل قوة ثم اجمع',
          chip: `10^{m}+10^{n}\\ne10^{m+n}`,
          quiz: [
            { q: '$10^{2}+10^{3}$ تساوي:', options: ['$1100$', '$10^{5}$', '$10^{6}$'], correct: 0 },
            { q: 'نصف $10^{4}$ هو:', options: ['$5\\times10^{3}$', '$10^{2}$', '$5\\times10^{4}$'], correct: 0 },
          ],
        },
        predictPrompt: 'هل $10^2 + 10^3$ يساوي $10^5$ ؟ وهل نصف $10^{10}$ هو $10^5$ ؟ جرّب بحساب كل قوة.',
        summary: 'في مجموع قوتين نحسب كل قوة ثم نجمع ؛ ونصف 10ⁿ ليس 10 أس n/2.',
        body: (
          <div className="space-y-2">
            <p><MathText>{noSum.text}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tabsit-ashara', type: 'methodes', title: 'اختصار عبارة إلى قوة واحدة',
        memo: {
          rule: `\\dfrac{(10^{a})^{b}\\times10^{c}}{10^{d}}=10^{${R('ab+c-d')}}`,
          hook: 'اختصر البسط ثم اقسم',
          example: `\\dfrac{(10^{2})^{3}\\times10^{-1}}{10^{4}}=10^{${R('1')}}`,
          trap: 'ضرب الأسّين في الجداء بدل جمعهما',
          exam: 'قوة قوة ثم جداء ثم قسمة',
          chip: `10^{ab+c-d}`,
          quiz: [
            { q: '$\\dfrac{10^{5}\\times10^{3}}{10^{2}}$ تساوي:', options: ['$10^{6}$', '$10^{10}$', '$10^{4}$'], correct: 0 },
            { q: '$\\dfrac{(10^{2})^{3}}{10^{4}}$ تساوي:', options: ['$10^{2}$', '$10^{-2}$', '$10^{10}$'], correct: 0 },
          ],
        },
        predictPrompt: 'أمامك عبارة فيها جداءات وقسمة وقوى قوى. بأيّ ترتيب تختصرها لتصل إلى قوة واحدة للعدد 10 ؟',
        summary: 'نختصر البسط والمقام أولًا (قوة قوة ثم جداءات)، ثم نطبّق قاعدة القسمة.',
        body: <p><MathText>{METHOD.chain.rule}</MathText></p>,
      },
      {
        id: 'adad-fi-quwa', type: 'methodes', title: 'جداء وحاصل قسمة عددين من الشكل k × 10ᵖ',
        memo: {
          rule: `(k\\times10^{p})(l\\times10^{q})=${R('kl')}\\times10^{${R('p+q')}}`,
          hook: 'الأعداد مع الأعداد والقوى مع القوى',
          example: `(2\\times10^{3})(4\\times10^{2})=${R('8')}\\times10^{${R('5')}}`,
          trap: 'نسيان ضبط الكتابة في نهاية الحساب',
          exam: 'اضرب الأعداد ثم اجمع الأسّين',
          chip: `kl\\times10^{p+q}`,
          quiz: [
            { q: '$(3\\times10^{4})(2\\times10^{5})$ تساوي:', options: ['$6\\times10^{9}$', '$6\\times10^{20}$', '$5\\times10^{9}$'], correct: 0 },
            { q: '$\\dfrac{8\\times10^{7}}{2\\times10^{3}}$ تساوي:', options: ['$4\\times10^{4}$', '$4\\times10^{10}$', '$6\\times10^{4}$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تحسب $6 \\times 10^4 \\times 5 \\times 10^{-7}$ ؟ ماذا تجمع مع ماذا؟ وهل تعدّل شكل النتيجة؟',
        summary: 'نجمع الأعداد مع الأعداد وقوى العدد 10 مع قوى العدد 10 ثم نطبّق القواعد ؛ والنتيجة تبقى k × 10ᵖ.',
        body: <p><MathText>{METHOD.times.rule}</MathText></p>,
      },
    ],
  },
};
