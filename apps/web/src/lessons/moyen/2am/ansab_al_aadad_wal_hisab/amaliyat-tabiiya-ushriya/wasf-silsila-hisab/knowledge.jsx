import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « وصف سلسلة حسابات » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 3 p. 12 réécrit, طريقة = ajout de la plateforme).
 * L'ordre des opérations (`silsila-bidun-aqwas`), les parenthèses (`silsila-bi-aqwas`, PUBLIÉES) et le vocabulaire de la somme et de la différence (1AM, `mana-jam-tarh`) sont des prérequis
 * (`priorKnowledge`), mesurés par « أستعدّ » et rappelés avec lien au module 2, jamais un item ici.
 */
const { last, terms, sentence, examples, order } = KNOWLEDGE;

/**
 * `memo` — la FICHE DE MÉMOIRE de « 🔑 للتذكّر » (MemoCard) : `rule` la règle en grand (KaTeX PUR : jamais d'arabe, même dans \\text ; ce qui CHANGE en `R{…}`), `hook` le slogan, `example`,
 * `trap`, `exam`, `chip`.
 */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'akhir-amaliya', type: 'regles', title: 'آخر عملية تُنجز تسمّي السلسلة',
        memo: {
          rule: `7${R('+')}4\\times5`,
          hook: 'آخر عملية تُنجز هي التي تسمّي السلسلة',
          example: `7+4\\times5=7${R('+')}20=27`,
          trap: 'القصّ عند الضرب يعطي $11\\times5=55$ لا $27$ : الضرب أُنجز أوّلًا',
          exam: 'ضع خطًّا تحت العملية التي تُنجز في الأخير ثم سمِّ السلسلة',
          chip: `${R('+')}\\ \\ -\\ \\ \\times\\ \\ \\div`,
          quiz: [
            { q: '$30 - 4 \\times 5$ عبارة عن:', options: ['فرق', 'جداء', 'مجموع'], correct: 0 },
            { q: 'آخر عملية تُنجز في $(6 + 2) \\times 3$ هي:', options: ['الضرب', 'الجمع', 'الطرح'], correct: 0 },
          ],
        },
        predictPrompt: 'قصصتَ الشريط 7 + 4 × 5 عند الضرب فوجدتَ 55 لا 27، وعند الجمع وجدتَ 27. ماذا تلاحظ على العملية التي نجح عندها القصّ؟ اكتب جوابك.',
        summary: last.text,
        body: <p><MathText>{last.text}</MathText></p>,
      },
      {
        id: 'hudud-awamil', type: 'regles', title: 'حدّان وعاملان ومقسوم وقاسم',
        memo: {
          rule: `${R('(18+6)')}\\div${R('3')}`,
          hook: 'المقسوم أوّلًا ثم القاسم',
          example: `(18+6)\\div3=24\\div3=8`,
          trap: 'المقسوم هو $18+6$ كلّه لا $18$ وحده',
          exam: 'سمِّ القطعتين بعد القصّ: حدّان أو عاملان أو مقسوم وقاسم',
          chip: `A\\div B`,
          quiz: [
            { q: 'في $36 \\div 9$ القاسم هو:', options: ['$9$', '$36$', '$4$'], correct: 0 },
            { q: 'عاملا $6 \\times 7$ هما:', options: ['$6$ و $7$', '$6$ و $42$', '$7$ و $42$'], correct: 0 },
          ],
        },
        predictPrompt: 'بعد قصّ (18 + 6) ÷ 3 عند القسمة، ما اسم القطعة 18 + 6 وما اسم القطعة 3؟ اكتب جوابك.',
        summary: terms.text,
        body: <p><MathText>{terms.text}</MathText></p>,
      },
      {
        id: 'wasf-jumla', type: 'regles', title: 'الجملة التي تصف السلسلة',
        memo: {
          rule: `${R('6\\times(9-2)')}+5`,
          hook: 'أبدأ باسم السلسلة ثم أصف كلّ قطعة',
          example: `6\\times(9-2)+5=6\\times7+5=47`,
          trap: 'قطعة مثل $9-2$ ليست عددًا: تُوصف هي أيضًا بجملة',
          exam: 'اكتب الجملة من الخارج إلى الداخل: الاسم، ثم الحدّ الأول، ثم الثاني',
          chip: `A\\ \\circ\\ B`,
          quiz: [
            { q: 'جداء العدد 4 ومجموع العددين 3 و 5 تُكتب:', options: ['$4 \\times (3 + 5)$', '$4 \\times 3 + 5$', '$(4 + 3) \\times 5$'], correct: 0 },
            { q: '$20 - (6 + 4)$ عبارة عن:', options: ['فرق', 'مجموع', 'جداء'], correct: 0 },
          ],
        },
        predictPrompt: 'السلسلة 6 × (9 − 2) + 5 : بعد أن سمّيتها، كيف تصف حدّها الأول 6 × (9 − 2)؟ اكتب جملة.',
        summary: sentence.text,
        body: <p><MathText>{sentence.text}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'qaidat-tasmiya', type: 'regles', title: 'قاعدة تسمية السلسلة ووصفها', predict: false,
        memo: {
          rule: `A\\ ${R('\\circ')}\\ B`,
          hook: 'آخر عملية تسمّي · حدّاها يوصفان · الترتيب مهمّ',
          example: `(9+2)\\times7=${R('11')}\\times7=77`,
          trap: 'الأعداد نفسها والاسم يتغيّر مع القوسين: $9+2\\times7$ مجموع و $(9+2)\\times7$ جداء',
          exam: 'اذكر الحدّ الأول (المقسوم) أوّلًا ثم الثاني',
          chip: `+\\ \\ -\\ \\ \\times\\ \\ \\div`,
          quiz: [
            { q: '$(9 + 2) \\times 7$ عبارة عن:', options: ['جداء', 'مجموع', 'فرق'], correct: 0 },
            { q: 'في حاصل قسمة 12 على 4 المقسوم هو:', options: ['$12$', '$4$', '$3$'], correct: 0 },
          ],
        },
        summary: 'آخر عملية تُنجز تسمّي السلسلة، ولها قطعتان (حدّان أو عاملان أو مقسوم وقاسم) توصف كلّ منهما بالطريقة نفسها إن لم تكن عددًا، والترتيب مهمّ في الفرق وحاصل القسمة.',
        body: <div className="space-y-2"><p><MathText>{last.text}</MathText></p><p><MathText>{examples.text}</MathText></p><p><MathText>{order.text}</MathText></p></div>,
      },
    ],
    3: [
      {
        id: 'tariqa-wasf', type: 'methodes', title: 'نصف سلسلة بجملة ثم نحسبها',
        memo: {
          rule: `12\\times${R('(15-9)')}`,
          hook: 'أحدّد آخر عملية · أسمّي · أصف القطع',
          example: `12\\times(15-9)=12\\times6=72`,
          trap: 'لا تسمِّها فرقًا: الطرح أُنجز أوّلًا لا أخيرًا',
          exam: 'اكتب الجملة ثم احسب القيمة',
          chip: `12\\times(15-9)`,
          quiz: [
            { q: 'آخر عملية في $12 \\times (15 - 9)$ هي:', options: ['الضرب', 'الطرح', 'الجمع'], correct: 0 },
            { q: '$12 \\times (15 - 9) =$', options: ['$72$', '$171$', '$6$'], correct: 0 },
          ],
        },
        predictPrompt: 'لوصف 12 × (15 − 9) بجملة: ما أوّل ما تفعله؟ ثم ماذا؟ اكتب الخطوات.',
        summary: METHOD.describe.rule,
        body: <p><MathText>{METHOD.describe.rule}</MathText></p>,
      },
      {
        id: 'tariqa-kitaba', type: 'methodes', title: 'نكتب السلسلة من جملتها بالأقواس اللازمة',
        memo: {
          rule: `${R('(27+9)')}\\div6`,
          hook: 'آخر عملية أوّلًا · الأقواس لما يُحسب قبلها',
          example: `(27+9)\\div6=36\\div6=6`,
          trap: 'دون قوسين: $27+9\\div6=28{,}5$',
          exam: 'اقرأ سلسلتك بجملة للتأكّد أنّها تصف ما طُلب',
          chip: `(A)\\div B`,
          quiz: [
            { q: 'حاصل قسمة مجموع العددين 27 و 9 على 6 تُكتب:', options: ['$(27 + 9) \\div 6$', '$27 + 9 \\div 6$', '$6 \\div (27 + 9)$'], correct: 0 },
            { q: 'مجموع العدد 12 وحاصل قسمة 45 على 9 تُكتب:', options: ['$12 + 45 \\div 9$', '$(12 + 45) \\div 9$', '$12 \\div 45 + 9$'], correct: 0 },
          ],
        },
        predictPrompt: 'لكتابة «حاصل قسمة مجموع العددين 27 و 9 على 6» : هل تلزم الأقواس؟ ولماذا؟ اكتب جوابك.',
        summary: METHOD.write.rule,
        body: <div className="space-y-2"><p><MathText>{METHOD.write.rule}</MathText></p><p className="text-sm text-slate-600"><MathText>{METHOD.bracket.rule}</MathText></p></div>,
      },
    ],
  },
};
