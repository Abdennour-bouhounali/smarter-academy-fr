import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « قوة عدد نسبي » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 6–8
 * p. 44 et طرائق p. 45, réécrits). Le produit de nombres relatifs, la chaîne d'opérations et les règles des puissances de 10 ne
 * sont PAS des items ici : ce sont des prérequis (`priorKnowledge`), mesurés par « أستعدّ », rappelés en معارف.
 */
const { definition, zero, inverse, sign, rules } = KNOWLEDGE;
const L = (s) => <p className="text-center" dir="ltr"><MathText>{s}</MathText></p>;

/** `memo` — la FICHE DE MÉMOIRE (MemoCard, prototype 2026-10-28) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'quwa-taarif', type: 'vocabulaire', title: 'القوة: أساس وأس', predict: false,
        memo: {
          rule: `a^{${R('n')}}=\\underbrace{a\\times\\cdots\\times a}_{${R('n')}}`,
          hook: 'الأساس مكرّر بعدد الأسّ',
          example: `(-2)^{${R('4')}}=(-2)\\times(-2)\\times(-2)\\times(-2)=16`,
          trap: 'ضرب الأساس في الأسّ',
          exam: 'اكتب العوامل ثم احسب الجداء',
          chip: `a^{n}`,
          quiz: [
            { q: '$(-2)^{3}$ تساوي:', options: ['$-8$', '$-6$', '$8$'], correct: 0 },
            { q: 'في القوة $5^{4}$ الأساس هو:', options: ['$5$', '$4$', '$20$'], correct: 0 },
          ],
        },
        summary: 'من أجل عدد نسبي a وعدد طبيعي غير معدوم n ، aⁿ جداء n عاملًا كلّ منها يساوي a ؛ a الأساس و n الأس.',
        body: (
          <div className="space-y-2">
            <p><MathText>{definition.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{definition.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'ishara-quwa', type: 'regles', title: 'إشارة القوة',
        memo: {
          rule: `(-a)^{${R('2k')}}>0\\ ;\\ (-a)^{${R('2k+1')}}<0`,
          hook: 'الزوجي موجب والفردي سالب',
          example: `(-3)^{${R('4')}}=81\\ ;\\ (-3)^{${R('3')}}=-27`,
          trap: 'ظنّ أن كل قوة لأساس سالب سالبة',
          exam: 'احكم على الإشارة من زوجية الأسّ',
          chip: `(-a)^{2k}>0`,
          quiz: [
            { q: 'إشارة $(-5)^{6}$ هي:', options: ['موجبة', 'سالبة', 'معدومة'], correct: 0 },
            { q: 'إشارة $(-2)^{7}$ هي:', options: ['سالبة', 'موجبة', 'معدومة'], correct: 0 },
          ],
        },
        predictPrompt: 'في القطار ذي العربات $\\times (-2)$ رأيتَ الحمولة تتغيّر إشارتها مع كل عربة. متى تكون $(-2)^n$ موجبة ومتى تكون سالبة؟ وماذا عن قوة عدد موجب؟ اكتب القاعدة بكلماتك.',
        summary: 'إذا كان a موجبًا فإنّ aⁿ موجب ؛ وإذا كان a سالبًا فإنّ aⁿ موجب عندما يكون n زوجيًا وسالب عندما يكون n فرديًا.',
        body: (
          <div className="space-y-2">
            <p><MathText>{sign.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.parity}</MathText></p>
          </div>
        ),
      },
      {
        id: 'quwa-sifr', type: 'regles', title: 'الأس صفر',
        memo: {
          rule: `a^{${R('0')}}=${R('1')}\\ ;\\ a^{1}=a`,
          hook: 'أسّ صفر يعني واحدًا',
          example: `(-7)^{${R('0')}}=${R('1')}\\ ;\\ (-7)^{1}=-7`,
          trap: 'القول إن أيّ عدد أسّه صفر يساوي صفرًا',
          exam: 'اشترط أن يكون الأساس غير معدوم',
          chip: `a^{0}=1`,
          quiz: [
            { q: '$(-4)^{0}$ تساوي:', options: ['$1$', '$0$', '$-4$'], correct: 0 },
            { q: '$9^{1}$ تساوي:', options: ['$9$', '$1$', '$0$'], correct: 0 },
          ],
        },
        predictPrompt: 'القطار بلا أيّ عربة: ماذا يحمل؟ ماذا تستنتج عن $a^0$ ؟',
        summary: 'من أجل كل عدد نسبي غير معدوم a : a¹ = a و a⁰ = 1.',
        body: (
          <div className="space-y-2">
            <p><MathText>{zero.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.zero}</MathText></p>
          </div>
        ),
      },
      {
        id: 'quwa-salib', type: 'regles', title: 'الأس السالب',
        memo: {
          rule: `a^{${R('-n')}}=\\dfrac{1}{a^{n}}`,
          hook: 'الأسّ السالب مقلوب القوة',
          example: `(-3)^{${R('-2')}}=\\dfrac{1}{(-3)^{2}}=\\dfrac{1}{9}`,
          trap: 'جعل الناتج سالبًا بسبب الأسّ',
          exam: 'اكتب المقلوب ثم احسب القوة',
          chip: `a^{-n}=\\tfrac{1}{a^{n}}`,
          quiz: [
            { q: '$2^{-3}$ تساوي:', options: ['$\\frac{1}{8}$', '$-8$', '$-\\frac{1}{8}$'], correct: 0 },
            { q: '$(-3)^{-2}$ تساوي:', options: ['$\\frac{1}{9}$', '$-\\frac{1}{9}$', '$-9$'], correct: 0 },
          ],
        },
        predictPrompt: 'بعربتي قسمة على $-3$ حمل القطار $\\frac{1}{9}$ ، وبعربتي ضرب حمل $9$ . ما العلاقة بين $(-3)^{-2}$ و $(-3)^2$ ؟ اكتبها لأيّ أس.',
        summary: 'من أجل كل عدد نسبي غير معدوم a وكل عدد طبيعي n : a⁻ⁿ = 1/aⁿ ، مقلوب aⁿ.',
        body: <p><MathText>{inverse.text}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'jidaa-quwatayn', type: 'regles', title: 'جداء قوتين لهما الأساس نفسه',
        memo: {
          rule: `a^{m}\\times a^{n}=a^{${R('m+n')}}`,
          hook: 'الأساس نفسه فنجمع الأسّين',
          example: `2^{3}\\times2^{4}=2^{${R('7')}}`,
          trap: 'ضرب الأساسين أو ضرب الأسّين',
          exam: 'الأساس نفسه شرط جمع الأسّين',
          chip: `a^{m+n}`,
          quiz: [
            { q: '$(-2)^{3}\\times(-2)^{2}$ تساوي:', options: ['$(-2)^{5}$', '$(-2)^{6}$', '$4^{5}$'], correct: 0 },
            { q: '$5^{-1}\\times5^{4}$ تساوي:', options: ['$5^{3}$', '$5^{-4}$', '$25^{3}$'], correct: 0 },
          ],
        },
        predictPrompt: 'ربطتَ قطارًا أسّه 3 بقطار أسّه 4 فصار أس القطار الموصول 7 . اكتب $a^m \\times a^n$ على شكل قوة واحدة.',
        summary: 'aᵐ × aⁿ = aᵐ⁺ⁿ : نجمع الأسين.',
        body: L(rules.lines[0]),
      },
      {
        id: 'hasil-quwatayn', type: 'regles', title: 'حاصل قسمة قوتين لهما الأساس نفسه',
        memo: {
          rule: `\\dfrac{a^{m}}{a^{n}}=a^{${R('m-n')}}`,
          hook: 'الأساس نفسه فنطرح الأسّين',
          example: `\\dfrac{3^{5}}{3^{2}}=3^{${R('3')}}`,
          trap: 'قسمة الأساسين أو جمع الأسّين',
          exam: 'اطرح أسّ المقام من أسّ البسط',
          chip: `a^{m-n}`,
          quiz: [
            { q: '$\\dfrac{7^{6}}{7^{4}}$ تساوي:', options: ['$7^{2}$', '$7^{10}$', '$1^{2}$'], correct: 0 },
            { q: '$\\dfrac{2^{3}}{2^{5}}$ تساوي:', options: ['$2^{-2}$', '$2^{2}$', '$2^{8}$'], correct: 0 },
          ],
        },
        predictPrompt: 'قسمتَ قطارًا أسّه 5 على قطار أسّه 3 بقلب عربات الثاني، فصار الأس 2 . اكتب $\\frac{a^m}{a^n}$ على شكل قوة واحدة.',
        summary: 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ : نطرح الأسين.',
        body: L(rules.lines[1]),
      },
      {
        id: 'quwat-quwa', type: 'regles', title: 'قوة قوة',
        memo: {
          rule: `(a^{m})^{n}=a^{${R('mn')}}`,
          hook: 'قوة القوة تضرب الأسّين',
          example: `(2^{3})^{2}=2^{${R('6')}}`,
          trap: 'جمع الأسّين بدل ضربهما',
          exam: 'اكتب الأسّ الجديد جداء الأسّين',
          chip: `a^{mn}`,
          quiz: [
            { q: '$(3^{2})^{3}$ تساوي:', options: ['$3^{6}$', '$3^{5}$', '$3^{8}$'], correct: 0 },
            { q: '$((-2)^{3})^{2}$ تساوي:', options: ['$(-2)^{6}$', '$(-2)^{5}$', '$(-2)^{9}$'], correct: 0 },
          ],
        },
        predictPrompt: '$(2^3)^2 = 2^3 \\times 2^3$ . كم عاملًا يساوي 2 ؟ اكتب $(a^m)^n$ على شكل قوة واحدة.',
        summary: '(aᵐ)ⁿ = aᵐⁿ : نضرب الأسين.',
        body: L(rules.lines[2]),
      },
      {
        id: 'quwat-jidaa', type: 'regles', title: 'قوة جداء وقوة حاصل قسمة',
        memo: {
          rule: `(ab)^{${R('n')}}=a^{${R('n')}}b^{${R('n')}}`,
          hook: 'الأسّ يوزَّع على كل عامل',
          example: `(2\\times5)^{3}=2^{3}\\times5^{3}`,
          trap: 'توزيع الأسّ على المجموع',
          exam: 'وزّع الأسّ على كل عامل من الجداء',
          chip: `(ab)^{n}=a^{n}b^{n}`,
          quiz: [
            { q: '$(2\\times3)^{2}$ تساوي:', options: ['$2^{2}\\times3^{2}$', '$2^{2}+3^{2}$', '$2\\times3^{2}$'], correct: 0 },
            { q: '$\\left(\\dfrac{2}{5}\\right)^{3}$ تساوي:', options: ['$\\dfrac{2^{3}}{5^{3}}$', '$\\dfrac{2^{3}}{5}$', '$\\dfrac{2}{5^{3}}$'], correct: 0 },
          ],
        },
        predictPrompt: 'رتّب عوامل $(2 \\times 5)^3$ : ثلاثة عوامل 2 وثلاثة عوامل 5 . اكتب $(a \\times b)^n$ بدلالة $a^n$ و $b^n$ .',
        summary: '(ab)ⁿ = aⁿbⁿ و (a/b)ⁿ = aⁿ/bⁿ.',
        body: (
          <div className="space-y-1">
            {L(rules.lines[3])}
            {L(rules.lines[4])}
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqat-tabsit', type: 'methodes', title: 'أبسّط عبارة بقوى',
        memo: {
          rule: `a^{m}b^{p}a^{n}=a^{${R('m+n')}}b^{p}`,
          hook: 'اجمع القوى لكل أساس على حدة',
          example: `2^{3}\\times5\\times2^{4}=2^{${R('7')}}\\times5`,
          trap: 'جمع أسّي أساسين مختلفين',
          exam: 'اجمع الأسّين لكل أساس على حدة',
          chip: `a^{m+n}b^{p}`,
          quiz: [
            { q: '$3^{2}\\times7\\times3^{4}$ تساوي:', options: ['$3^{6}\\times7$', '$3^{8}\\times7$', '$21^{6}$'], correct: 0 },
            { q: '$\\dfrac{5^{4}\\times2^{3}}{5^{2}}$ تساوي:', options: ['$5^{2}\\times2^{3}$', '$5^{6}\\times2^{3}$', '$5^{4}\\times2^{3}$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تبسّط $\\frac{3^7 \\times 2^4}{2^2 \\times 3^5}$ دون حساب كل قوة؟ ماذا تفعل بالأساسين؟ اكتب طريقتك.',
        summary: 'نجمع القوى التي لها الأساس نفسه ثم نطبّق قواعد الجداء وحاصل القسمة وقوة القوة على كل أساس.',
        body: <p><MathText>{METHOD.simplify.rule}</MathText></p>,
      },
      {
        id: 'awlawiya-quwa', type: 'regles', title: 'أولوية القوى',
        memo: {
          rule: `-3^{2}=${R('-9')}\\ ;\\ (-3)^{2}=${R('9')}`,
          hook: 'الأقواس أولًا ثم القوى',
          example: `2+3\\times2^{2}=2+12=14`,
          trap: 'إهمال القوسين حول الأساس السالب',
          exam: 'ضع القوسين حول الأساس السالب',
          chip: `-3^{2}\\ne(-3)^{2}`,
          quiz: [
            { q: '$-4^{2}$ تساوي:', options: ['$-16$', '$16$', '$-8$'], correct: 0 },
            { q: '$2+3\\times2^{2}$ تساوي:', options: ['$14$', '$20$', '$10$'], correct: 0 },
          ],
        },
        predictPrompt: 'في $5 - 2 \\times (-3)^2$ وجدتَ $-13$ . بأيّ ترتيب أجريتَ العمليات؟ اكتب ترتيب الأولويات.',
        summary: 'في سلسلة حسابات: الأقواس، ثم القوى، ثم الضرب والقسمة، ثم الجمع والطرح ؛ و −3² = −9 أمّا (−3)² = 9.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD.priority.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{METHOD.priority.minus}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
