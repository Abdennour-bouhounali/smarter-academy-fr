import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « قوى العدد 10 » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 1–2 p. 42, طرائق p. 43 et
 * le مفكوك, réécrits). Le décalage de la virgule de 1AM (`darb-ashara`), le مقلوب (`maqlub`) et les unités (`wahdat`) ne sont PAS des items ici : ce sont des
 * prérequis (`priorKnowledge`), mesurés par « أستعدّ ». Les règles sur les produits et quotients de puissances de 10 sont celles de la leçon SUIVANTE.
 */
const { definition, zero, inverse, names, prefixes } = KNOWLEDGE;

/** `memo` — la FICHE DE MÉMOIRE (MemoCard, prototype 2026-10-28) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'ashara-taarif', type: 'regles', title: 'القوة 10ⁿ',
        memo: {
          rule: `10^{${R('n')}}=\\underbrace{10\\times\\cdots\\times10}_{${R('n')}}`,
          hook: 'عوامل كلها تساوي عشرة',
          example: `10^{${R('3')}}=10\\times10\\times10=1000`,
          trap: 'ضرب العشرة في الأسّ',
          exam: 'اكتب العوامل ثم احسب الجداء',
          chip: `10^{n}`,
          quiz: [
            { q: '$10^{4}$ تساوي:', options: ['$10\\times10\\times10\\times10$', '$10\\times4$', '$4^{10}$'], correct: 0 },
            { q: '$10\\times10\\times10\\times10\\times10$ تُكتب:', options: ['$10^{5}$', '$10^{10}$', '$5^{10}$'], correct: 0 },
          ],
        },
        predictPrompt: 'ستة عوامل كلّها 10 تعطي مليونًا. كيف تقترح أن نكتب جداء $n$ عاملًا كلّها 10 باختصار؟ وكيف نقرؤه؟',
        summary: 'من أجل عدد طبيعي غير معدوم n ، 10ⁿ جداء n عاملًا كلّها تساوي 10 ، ويُقرأ « 10 أس n ».',
        body: (
          <div className="space-y-2">
            <p><MathText>{definition.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{definition.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'ashara-asfar', type: 'regles', title: 'عدد الأصفار',
        memo: {
          rule: `10^{${R('n')}}=1\\underbrace{0\\cdots0}_{${R('n')}}`,
          hook: 'واحد وبعده أصفار بعدد الأسّ',
          example: `10^{${R('5')}}=100\\,000`,
          trap: 'الخلط بين عدد الأرقام وعدد الأصفار',
          exam: 'عدد الأصفار يساوي الأسّ',
          chip: `1\\,0\\cdots0`,
          quiz: [
            { q: '$10^{6}$ بالكتابة العشرية هي:', options: ['$1\\,000\\,000$', '$100\\,000$', '$10\\,000\\,000$'], correct: 0 },
            { q: 'عدد الأصفار في $10^{9}$ هو:', options: ['$9$', '$10$', '$8$'], correct: 0 },
          ],
        },
        predictPrompt: 'بعد 3 نقرات قرأتَ 1 000 وبعد 6 نقرات 1 000 000. ماذا تلاحظ عن عدد الأصفار وعدد النقرات؟ عمّم على $n$ نقرة.',
        summary: 'الكتابة العشرية لـ 10ⁿ هي الرقم 1 متبوعًا بـ n صفرًا.',
        body: <p><MathText>{GUIDE.zeros}</MathText></p>,
      },
      {
        id: 'ashara-sifr', type: 'regles', title: 'الأس صفر',
        memo: {
          rule: `10^{1}=10\\ ;\\ 10^{${R('0')}}=${R('1')}`,
          hook: 'الأسّ صفر يعطي الواحد',
          example: `10^{${R('0')}}=${R('1')}`,
          trap: 'ظنّ أن عشرة أس صفر تساوي صفرًا',
          exam: 'اكتب أن عشرة أس صفر تساوي واحدًا',
          chip: `10^{0}=1`,
          quiz: [
            { q: '$10^{0}$ تساوي:', options: ['$1$', '$0$', '$10$'], correct: 0 },
            { q: '$10^{1}$ تساوي:', options: ['$10$', '$1$', '$0$'], correct: 0 },
          ],
        },
        predictPrompt: 'الإطار بلا أيّ نقرة: ماذا يساوي ضلعه؟ ماذا تستنتج عن $10^0$ ؟',
        summary: '10¹ = 10 و 10⁰ = 1.',
        body: (
          <div className="space-y-2">
            <p><MathText>{zero.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.zero}</MathText></p>
          </div>
        ),
      },
      {
        id: 'ashara-salib', type: 'regles', title: 'الأس السالب',
        memo: {
          rule: `10^{${R('-n')}}=\\dfrac{1}{10^{n}}`,
          hook: 'الأسّ السالب مقلوب القوة',
          example: `10^{${R('-3')}}=\\dfrac{1}{1000}=0{,}001`,
          trap: 'الخلط بين الأسّ السالب والعدد السالب',
          exam: 'اكتب مقلوب القوة ثم الكتابة العشرية',
          chip: `10^{-n}=\\tfrac{1}{10^{n}}`,
          quiz: [
            { q: '$10^{-2}$ تساوي:', options: ['$0{,}01$', '$-100$', '$0{,}2$'], correct: 0 },
            { q: 'الرقم $1$ في $10^{-4}$ يقع في الرتبة:', options: ['الرابعة بعد الفاصلة', 'الثالثة بعد الفاصلة', 'الرابعة قبل الفاصلة'], correct: 0 },
          ],
        },
        predictPrompt: 'ثلاث نقرات تصغير أعطت $0{,}001$ م. أين الرقم 1 في هذه الكتابة؟ وما علاقة $10^{-3}$ بـ $10^3$ ؟ اكتب القاعدة لأيّ $n$ .',
        summary: 'من أجل عدد طبيعي غير معدوم n : 10⁻ⁿ = 1/10ⁿ ، مقلوب 10ⁿ ، والرقم 1 فيه في الرتبة n بعد الفاصلة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{inverse.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{inverse.example}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'ashara-asma', type: 'regles', title: 'الأسماء والبادئات',
        memo: {
          rule: `\\mathrm{k}=10^{${R('3')}}\\ ;\\ \\mathrm{M}=10^{${R('6')}}\\ ;\\ \\mathrm{G}=10^{${R('9')}}`,
          hook: 'كيلو وميغا وجيغا وميلي وميكرو ونانو',
          example: `1\\ \\mathrm{km}=10^{${R('3')}}\\ \\mathrm{m}`,
          trap: 'قلب بادئة كبيرة ببادئة صغيرة',
          exam: 'حوّل البادئة إلى قوة للعدد عشرة',
          chip: `\\mathrm{k}=10^{3}`,
          quiz: [
            { q: '$1\\ \\mathrm{mm}$ يساوي بالمتر:', options: ['$10^{-3}\\ \\mathrm{m}$', '$10^{3}\\ \\mathrm{m}$', '$10^{-2}\\ \\mathrm{m}$'], correct: 0 },
            { q: 'البادئة ميغا تعني:', options: ['$10^{6}$', '$10^{-6}$', '$10^{3}$'], correct: 0 },
          ],
        },
        predictPrompt: 'ميكرومتر واحد جزء من مليون من المتر. ماذا تكتب من القوى للميكرومتر وللكيلومتر؟ حاول أن تعمّم على ميلي ونانو.',
        summary: 'كيلو 10³ ، ميغا 10⁶ ، جيغا 10⁹ ؛ ميلي 10⁻³ ، ميكرو 10⁻⁶ ، نانو 10⁻⁹ : كل بادئة قوة للعدد 10 ، وكذلك الأسماء ألف ومليون ومليار.',
        body: (
          <div className="space-y-2">
            <p><MathText>{names.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{[prefixes.text, ...prefixes.lines].join(' ')}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'ashara-adad', type: 'methodes', title: 'من الكتابة العشرية إلى القوة',
        memo: {
          rule: `\\begin{aligned}1\\underbrace{0\\cdots0}_{n}&=10^{${R('n')}}\\\\0{,}\\underbrace{0\\cdots0}_{n-1}1&=10^{${R('-n')}}\\end{aligned}`,
          hook: 'نعدّ الأصفار ونعدّ الرتبة',
          example: `1\\,000\\,000=10^{${R('6')}}\\ ;\\ 0{,}001=10^{${R('-3')}}`,
          trap: 'نسيان إشارة الأسّ السالب',
          exam: 'اكتب القوة بعد عدّ الأصفار',
          chip: `10^{\\pm n}`,
          quiz: [
            { q: 'القوة الموافقة لـ $100\\,000\\,000$ هي:', options: ['$10^{8}$', '$10^{9}$', '$10^{7}$'], correct: 0 },
            { q: 'القوة الموافقة لـ $0{,}00001$ هي:', options: ['$10^{-5}$', '$10^{-4}$', '$10^{5}$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تكتب $100\\,000$ و $0{,}0001$ على شكل قوة للعدد 10 دون أن تخطئ؟ ماذا تعدّ في كل حالة؟',
        summary: 'نعدّ الأصفار بعد الرقم 1 لنكتب 10ⁿ ، ونعدّ رتبة الرقم 1 بعد الفاصلة لنكتب 10⁻ⁿ.',
        body: <p><MathText>{METHOD.count.rule}</MathText></p>,
      },
      {
        id: 'ashara-mafkuk', type: 'methodes', title: 'مفكوك عدد عشري',
        memo: {
          rule: `A=\\cdots+d\\times10^{${R('n')}}+\\cdots`,
          hook: 'كل رقم مضروب في قوة رتبته',
          example: `305=3\\times10^{${R('2')}}+5\\times10^{${R('0')}}`,
          trap: 'كتابة حدّ للرتبة الفارغة',
          exam: 'لا تكتب حدًّا لرتبة فارغة',
          chip: `d\\times10^{n}`,
          quiz: [
            { q: 'مفكوك $4\\,052$ هو:', options: ['$4\\times10^{3}+5\\times10^{1}+2\\times10^{0}$', '$4\\times10^{3}+5\\times10^{2}+2\\times10^{1}$', '$4\\times10^{4}+5\\times10^{2}+2\\times10^{1}$'], correct: 0 },
            { q: 'مفكوك $0{,}27$ هو:', options: ['$2\\times10^{-1}+7\\times10^{-2}$', '$2\\times10^{1}+7\\times10^{2}$', '$2\\times10^{-2}+7\\times10^{-1}$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تكتب $3\\,985$ كمجموع حدود كل منها رقم مضروب في قوة للعدد 10 ؟ وماذا تفعل بصفر في عدد مثل $5\\,030$ ؟',
        summary: 'مفكوك عدد عشري مجموع حدود، كل منها رقم مضروب في 10ⁿ حيث n رتبته؛ والأصفار لا تظهر.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD.expand.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.mafkuk.right}</MathText></p>
          </div>
        ),
      },
      {
        id: 'ashara-kn', type: 'methodes', title: 'الكتابة k × 10ⁿ',
        memo: {
          rule: `A=${R('k')}\\times10^{${R('n')}}`,
          hook: 'أزح الفاصلة وعدّل الأسّ',
          example: `4\\,500=45\\times10^{${R('2')}}=4{,}5\\times10^{3}`,
          trap: 'ظنّ أن الكتابة وحيدة',
          exam: 'اذكر أن لكل عدد كتابات عديدة',
          chip: `k\\times10^{n}`,
          quiz: [
            { q: '$7\\,200=72\\times10^{n}$ ، فإن $n$ يساوي:', options: ['$2$', '$3$', '$1$'], correct: 0 },
            { q: '$0{,}036=36\\times10^{n}$ ، فإن $n$ يساوي:', options: ['$-3$', '$-2$', '$3$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تكتب $45\\,000$ بدلالة $45$ وقوة للعدد 10 ؟ وهل لهذا العدد كتابة واحدة بهذا الشكل؟',
        summary: 'نكتب عددًا على الشكل k × 10ⁿ بإزاحة الفاصلة ؛ وليس للعدد كتابة وحيدة بهذا الشكل.',
        body: <p><MathText>{METHOD.times.rule}</MathText></p>,
      },
    ],
  },
};
