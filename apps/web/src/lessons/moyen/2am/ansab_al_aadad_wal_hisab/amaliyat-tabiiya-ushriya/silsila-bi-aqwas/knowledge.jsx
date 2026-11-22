import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « سلسلة عمليات تتضمّن أقواسا » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 2 p. 10, طريقة 1 et 2 p. 11, ict p. 21, réécrits).
 * Le sens de l'ordre des opérations (leçon précédente, `silsila-bidun-aqwas`, PUBLIÉE) et celui de l'addition et de la soustraction (1AM, `mana-jam-tarh`) sont des prérequis (`priorKnowledge`),
 * mesurés par « أستعدّ », jamais un item ici.
 */
const { brackets, nested, useless, bar, calculator } = KNOWLEDGE;

/**
 * `memo` — la FICHE DE MÉMOIRE de « 🔑 للتذكّر » (MemoCard) : `rule` la règle en grand (KaTeX PUR : jamais d'arabe, même dans \\text ; ce qui CHANGE en `R{…}`), `hook` le slogan, `example`,
 * `trap`, `exam`, `chip`.
 */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'aqwas-awwalan', type: 'regles', title: 'الأقواس تفرض ما يُحسب أوّلًا',
        memo: {
          rule: `${R('(a+b)')}\\div c`,
          hook: 'ما بين القوسين يُحسب أوّلًا',
          example: `(45+15)\\div4=${R('60')}\\div4=15`,
          trap: 'دون قوسين تقسم الآلة $15\\div4$ وحده: $45+15\\div4=48{,}75$',
          exam: 'اكتب القوسين حول ما يجب حسابه أوّلًا',
          chip: `${R('(\\;)')}\\;\\to\\;\\times\\div\\;\\to\\;+-`,
          quiz: [
            { q: '$(8 + 4) \\times 3 =$', options: ['$36$', '$20$', '$15$'], correct: 0 },
            { q: 'ما بين القوسين يُحسب:', options: ['أوّلًا', 'آخرًا', 'عشوائيًّا'], correct: 0 },
          ],
        },
        predictPrompt: 'ثمن كتاب 45 DA وغلافه 15 DA ويتقاسم 4 أصدقاء ثمنهما. طبعت الآلة 48,75 ثم 15 بعد وضع القوسين. ماذا فعل القوسان؟ اكتب جوابك.',
        summary: brackets.text,
        body: <p><MathText>{brackets.text}</MathText></p>,
      },
      {
        id: 'aqwas-ghayr-daruriya', type: 'regles', title: 'قوسان لا يغيّران الترتيب غير ضروريين',
        memo: {
          rule: `a+(b\\times c)=a+b\\times c`,
          hook: 'إذا لم يتغيّر الناتج دونهما فهما غير ضروريين',
          example: `9+(2\\times5)=9+10=19`,
          trap: 'قوسان حول $9+2$ ضروريان: $(9+2)\\times5=55$',
          exam: 'احذف القوسين وتحقّق: إن بقي الناتج فهما غير ضروريين',
          chip: `9+(2\\times5)=9+2\\times5`,
          quiz: [
            { q: 'أيّها قوساه غير ضروريين؟', options: ['$12 + (3 \\times 4)$', '$(12 + 3) \\times 4$', '$(12 - 3) \\div 3$'], correct: 0 },
            { q: '$(9 + 2) \\times 5 =$', options: ['$55$', '$19$', '$70$'], correct: 0 },
          ],
        },
        predictPrompt: 'وضعتَ قوسين حول 2 × 5 في 9 + 2 × 5 فطبعت الآلة 19 كما تطبع دونهما. لماذا لم يتغيّر الناتج؟ اكتب جوابك.',
        summary: useless.text,
        body: <p><MathText>{useless.text}</MathText></p>,
      },
      {
        id: 'aqwas-mutadakhila', type: 'regles', title: 'الأقواس المتداخلة: من الداخل إلى الخارج',
        memo: {
          rule: `a\\times[b-(${R('c+d')})]`,
          hook: 'أبدأ بأعمق قوس ثم أخرج',
          example: `2\\times[50-(12+8)]=2\\times[50-20]=60`,
          trap: 'قوس واحد فقط يعطي $2\\times(50-12)+8=84$',
          exam: 'اكتب الأقواس الخارجية معقوفين [ ] لتسهل القراءة',
          chip: `[\\;(\\;)\\;]`,
          quiz: [
            { q: '$2 \\times [10 - (3 + 2)] =$', options: ['$10$', '$5$', '$15$'], correct: 0 },
            { q: 'في الأقواس المتداخلة نبدأ بـ:', options: ['الداخلية', 'الخارجية', 'اليسار'], correct: 0 },
          ],
        },
        predictPrompt: 'حافلتان في كلّ منهما 50 مقعدًا و 12 + 8 مقاعد للكبار. أيّ حساب أجريته أوّلًا لتطبع الآلة 60؟ اكتب ترتيب الحساب.',
        summary: nested.text,
        body: <p><MathText>{nested.text}</MathText></p>,
      },
      {
        id: 'khatt-kasr', type: 'regles', title: 'خطّ الكسر قوسان للبسط والمقام',
        memo: {
          rule: `\\dfrac{a+b}{c-d}=${R('(a+b)')}\\div${R('(c-d)')}`,
          hook: 'البسط عدد واحد والمقام عدد واحد',
          example: `\\dfrac{40+8}{15-9}=(40+8)\\div(15-9)=8`,
          trap: 'نسيان قوسي المقام: $(40+8)\\div15-9=-5{,}8$',
          exam: 'ضع قوسين للبسط وقوسين للمقام ثم احذف الخطّ',
          chip: `\\dfrac{A}{B}=(A)\\div(B)`,
          quiz: [
            { q: '$\\frac{36+12}{20-8}=$', options: ['$4$', '$34{,}2$', '$12$'], correct: 0 },
            { q: 'خطّ الكسر يعني:', options: ['قسمة البسط كلّه على المقام كلّه', 'قسمة آخر عدد فقط', 'جمع'], correct: 0 },
          ],
        },
        predictPrompt: 'في الكسر (40+8)/(15−9): ماذا يحدث إذا حجزنا على الآلة 40 + 8 ÷ 15 − 9 دون أقواس؟ اكتب جوابك.',
        summary: bar.text,
        body: <p><MathText>{bar.text}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'qaidat-aqwas', type: 'regles', title: 'قاعدة الأقواس', predict: false,
        memo: {
          rule: `(\\;)\\succ\\times\\div\\succ+-`,
          hook: 'الأقواس أوّلًا · ثم × ÷ · ثم + −',
          example: `E=6\\times(15-9)=6\\times6=36`,
          trap: 'دون قوسين يتغيّر ما تحسبه الآلة أوّلًا',
          exam: 'اكتب كلّ مرحلة في سطر، وابدأ بأعمق قوس',
          chip: `(\\;)\\succ\\times\\div\\succ+-`,
          quiz: [
            { q: '$(7 + 5) \\times (20 - 4) =$', options: ['$192$', '$47$', '$100$'], correct: 0 },
            { q: '$3 \\times [20 - (4 + 6)] =$', options: ['$30$', '$50$', '$14$'], correct: 0 },
          ],
        },
        summary: 'الأقواس تفرض ما يُحسب أوّلًا، وقد لا يغيّر القوسان شيئًا، وفي الأقواس المتداخلة نبدأ بالداخلية ونكتب الخارجية معقوفين، وخطّ الكسر قوسان للبسط والمقام.',
        body: <div className="space-y-2"><p><MathText>{brackets.text}</MathText></p><p><MathText>{nested.text}</MathText></p><p><MathText>{bar.text}</MathText></p></div>,
      },
    ],
    3: [
      {
        id: 'tariqa-mutadakhila', type: 'methodes', title: 'نحسب أقواسًا متداخلة مرحلة بعد مرحلة',
        memo: {
          rule: `4\\times[18-${R('(2+3)')}\\times3]`,
          hook: 'أعمق قوس · ثم المعقوفان · ثم الباقي',
          example: `4\\times[18-(2+3)\\times3]=4\\times[18-15]=12`,
          trap: 'لا تحسب $18-2$ أوّلًا: القوس الداخلي هو الأوّل',
          exam: 'اكتب ما تبقّى بعد كلّ مرحلة في سطر',
          chip: `(\\;)\\to[\\;]\\to\\times\\div\\to+-`,
          quiz: [
            { q: '$A = 4 \\times [18 - (2 + 3) \\times 3] =$', options: ['$12$', '$60$', '$36$'], correct: 0 },
            { q: 'داخل المعقوفين نحسب أوّلًا:', options: ['القوس الداخلي ثم الضرب', 'الطرح', 'الجمع'], correct: 0 },
          ],
        },
        predictPrompt: 'لحساب 4 × [18 − (2 + 3) × 3] : رتّب العمليات التي تحسبها بالترتيب.',
        summary: METHOD.nested.rule,
        body: <p><MathText>{METHOD.nested.rule}</MathText></p>,
      },
      {
        id: 'tariqa-khatt-kasr-alat', type: 'methodes', title: 'نكتب الكسر على الآلة بالأقواس اللازمة',
        memo: {
          rule: `54\\div${R('(4\\times3-3)')}+2=8`,
          hook: 'المقام قوسان · البسط قوسان · ثم "="',
          example: `\\dfrac{54}{4\\times3-3}+2=54\\div(4\\times3-3)+2=8`,
          trap: 'دون قوسين: $54\\div4\\times3-3+2=39{,}5$',
          exam: 'اكتب الأزرار واحدًا بعد واحد ثم تحقّق من القيمة',
          chip: `\\dfrac{A}{B}\\to(A)\\div(B)`,
          quiz: [
            { q: 'أزرار $\\frac{60}{4+8}$ :', options: ['$60 \\div ( 4 + 8 ) =$', '$60 \\div 4 + 8 =$', '$60 \\div 4 \\times 8 =$'], correct: 0 },
            { q: '$54 \\div (4 \\times 3 - 3) + 2 =$', options: ['$8$', '$39{,}5$', '$6$'], correct: 0 },
          ],
        },
        predictPrompt: 'لحساب 54 على (4 × 3 − 3) ثم إضافة 2 : اكتب الأزرار التي تضغطها.',
        summary: METHOD.keys.rule,
        body: <div className="space-y-2"><p><MathText>{METHOD.bar.rule}</MathText></p><p className="text-sm text-slate-600"><MathText>{calculator.text}</MathText></p></div>,
      },
    ],
  },
};
