import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « الكسر: نسبة وحاصل قسمة وقيم مقرّبة » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js). Le quotient comme fraction (1AM hasil-qisma-kasr), les écritures égales
 * (1AM ikhtizal-kitaba-kasriya) et l'encadrement à l'unité (qisma-iqlidiya-hasr) ne sont PAS des items ici : ce sont des prérequis, rappelés par les « تذكّر » des modules 1 et 2 avec leurs liens.
 */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'qima-madbuta', type: 'regles', title: 'القيمة المضبوطة لحاصل القسمة',
        memo: {
          rule: `a\\div b=${R('\\dfrac{a}{b}')}`,
          hook: 'الحاصل عدد واحد: a على b',
          example: `8\\div 3=${R('\\dfrac{8}{3}')}`,
          trap: 'لا تعتبر قيمة مقرّبة هي الحاصل نفسه',
          exam: 'اكتب القيمة المضبوطة كسرًا، ثم قيمتيها المقرّبتين',
          chip: `${R('\\tfrac{a}{b}')}`,
          quiz: [
            { q: 'القيمة المضبوطة لحاصل قسمة $8$ على $3$ :', options: ['$\\frac{8}{3}$', '$2{,}67$', '$2{,}66$'], correct: 0 },
            { q: 'العدد $2{,}67$ بالنسبة إلى $\\frac{8}{3}$ هو:', options: ['قيمة مقرّبة', 'القيمة المضبوطة', 'نصفه'], correct: 0 },
          ],
        },
        predictPrompt: 'في المهمة 1 دقّقت الرتبة حتى السنتيمتر ولم يبلغ الباقي 0. إذا لم تنتهِ القسمة، فما العدد الذي يساوي حاصل قسمة 8 على 3 بالضبط؟ وهل يساويه أيّ من الطولين اللذين وجدتهما؟ اكتب ذلك بكلماتك.',
        summary: 'حاصل قسمة $a$ على $b$ هو العدد $\\frac{a}{b}$ نفسه، وهو القيمة المضبوطة؛ وإذا لم تنتهِ القسمة فلا عدد عشري يساويه.',
        body: <p><MathText>{GUIDE.never}</MathText></p>,
      },
      {
        id: 'qiyam-muqarraba-ushr', type: 'regles', title: 'القيمتان المقرّبتان إلى 0,1 و 0,01',
        memo: {
          rule: `${R('x')}<\\dfrac{a}{b}<${R('x+10^{-k}')}`,
          hook: 'تكفي، ولا تكفي: الحاصل بينهما',
          example: `${R('2{,}66')}<\\dfrac{8}{3}<${R('2{,}67')}`,
          trap: 'القيمة بالزيادة هي التي لا تكفي، وليست الحاصل',
          exam: 'اكتب الحصر ثم سمِّ الطرفين: بالنقصان وبالزيادة',
          chip: `${R('x')}<\\tfrac{a}{b}<${R('x+u')}`,
          quiz: [
            { q: 'حصر $\\frac{5}{3}$ إلى $0{,}01$ :', options: ['$1{,}66<\\frac{5}{3}<1{,}67$', '$1{,}67<\\frac{5}{3}<1{,}68$', '$1{,}6<\\frac{5}{3}<1{,}66$'], correct: 0 },
            { q: 'القيمة المقرّبة بالنقصان إلى $0{,}1$ لـ $\\frac{8}{3}$ :', options: ['$2{,}6$', '$2{,}7$', '$2{,}66$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المختبر بحثت عن أكبر طول يكفي وأصغر طول لا يكفي، ثم دقّقت الرتبة. كيف تصف العلاقة بين الطولين الأخيرين وحاصل القسمة؟ وماذا نسمّي كلًّا منهما؟ اكتب القاعدة بكلماتك.',
        summary: 'القيمة المقرّبة بالنقصان تكفي والقيمة المقرّبة بالزيادة لا تكفي، وحاصل القسمة بينهما؛ وكلّما دقّقنا الرتبة ($0{,}1$ ثم $0{,}01$) ضاق الحصر.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.madbuta.muqarraba}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.bracket}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.comma.right}</MathText></p>
          </div>
        ),
      },
      {
        id: 'ashri-am-la', type: 'regles', title: 'متى يكون حاصل القسمة عشريًا؟',
        memo: {
          rule: `b\\times q=a\\ \\Rightarrow\\ \\dfrac{a}{b}=${R('q')}`,
          hook: 'تنتهي القسمة فيكون عشريًا',
          example: `4\\times ${R('2{,}25')}=9`,
          trap: 'رتبة أدقّ لا تجعل كلّ حاصل عشريًا',
          exam: 'جرّب: هل يوجد q يجعل b × q يساوي a بالضبط؟',
          chip: `b\\times q=a`,
          quiz: [
            { q: 'أيّ حاصل قسمة عشري؟', options: ['$9\\div 4$', '$8\\div 3$', '$5\\div 6$'], correct: 0 },
            { q: 'القسمة $8\\div 3$ :', options: ['لا تنتهي', 'تنتهي عند $2{,}67$', 'تنتهي عند $2{,}66$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المهمة 2 انتهت القسمة عند 2,25 وفي المهمة 1 لم تنتهِ. بماذا يختلف الحبلان؟ ومتى تتوقّف عن البحث عن رتبة أدقّ؟ اكتب القاعدة بكلماتك.',
        summary: 'حاصل القسمة عدد عشري إذا انتهت القسمة، أي إذا وُجد عدد عشري $q$ حيث $b \\times q = a$ ؛ وإلّا فنكتفي بحصره.',
        body: <p><MathText>{GUIDE.exact}</MathText></p>,
      },
      {
        id: 'tahwil-qasim', type: 'methodes', title: 'ضرب الحدّين في العدد نفسه',
        memo: {
          rule: `\\dfrac{a}{b}=\\dfrac{a\\times ${R('10^n')}}{b\\times ${R('10^n')}}`,
          hook: 'الحدّان معًا، لا حدّ واحد',
          example: `\\dfrac{4{,}6}{0{,}7}=\\dfrac{4{,}6\\times ${R('10')}}{0{,}7\\times ${R('10')}}=\\dfrac{46}{7}`,
          trap: 'ضرب حدّ واحد في 10 يغيّر الحاصل',
          exam: 'اكتب العدد الذي ضربت فيه الحدّين',
          chip: `\\tfrac{a\\times 10}{b\\times 10}`,
          quiz: [
            { q: '$\\frac{4{,}6}{0{,}7}$ تساوي:', options: ['$\\frac{46}{7}$', '$\\frac{46}{0{,}7}$', '$\\frac{4{,}6}{7}$'], correct: 0 },
            { q: 'لجعل قاسم $0{,}35$ طبيعيًا نضرب الحدّين في:', options: ['$100$', '$10$', '$35$'], correct: 0 },
          ],
        },
        predictPrompt: 'غيّرت وحدة الشريط من m إلى dm فصار الحبل 46 والحبل الواحد 7 ، ولم يتغيّر عدد الحبال. ماذا فعلنا بالطولين؟ ولماذا لم يتغيّر العدد؟ اكتب ذلك بكلماتك.',
        summary: 'ضرب المقسوم والمقسوم عليه في $10$ أو $100$ لا يغيّر حاصل القسمة، وبه نجعل القاسم عددًا طبيعيًا.',
        body: <p><MathText>{GUIDE.unit}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'nisba-kasriya', type: 'vocabulaire', title: 'نسبة a إلى b والكتابة الكسرية', predict: false,
        memo: {
          rule: `${R('\\dfrac{a}{b}')}=a\\div b`,
          hook: 'الجزء على الكلّ',
          example: `\\dfrac{12}{28}=${R('\\dfrac{3}{7}')}`,
          trap: 'لا تقلب النسبة: 12 من 28 هي 12 على 28',
          exam: 'اكتب النسبة كسرًا ثم اختزلها',
          chip: `\\tfrac{a}{b}`,
          quiz: [
            { q: 'نسبة $9$ تلاميذ إلى $36$ هي:', options: ['$\\frac{9}{36}$', '$\\frac{36}{9}$', '$\\frac{9}{27}$'], correct: 0 },
            { q: 'العدد $\\frac{4{,}2}{0{,}35}$ يسمّى:', options: ['كتابة كسرية', 'كسرًا', 'عددًا طبيعيًا'], correct: 0 },
          ],
        },
        summary: 'نقرأ $\\frac{a}{b}$ « نسبة $a$ إلى $b$ » وهي كتابة حاصل قسمة $a$ على $b$ ؛ كسر إذا كان الحدّان طبيعيين، وكتابة كسرية إذا كان أحدهما عشريًا.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.nisba.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.nisba.fractional}</MathText></p>
          </div>
        ),
      },
      {
        id: 'qisma-ashari', type: 'regles', title: 'قاسم عشري: نجعله طبيعيًا', predict: false,
        memo: {
          rule: `\\dfrac{a}{b}=\\dfrac{a\\times ${R('10^n')}}{b\\times ${R('10^n')}}`,
          hook: 'أرقام المقام بعد الفاصلة',
          example: `\\dfrac{4{,}2}{0{,}35}=\\dfrac{420}{35}`,
          trap: 'عدّ أرقام المقام، لا أرقام المقسوم',
          exam: 'اكتب القوّة التي ضربت فيها ثم أنجز القسمة',
          chip: `\\tfrac{\\times 10^n}{\\times 10^n}`,
          quiz: [
            { q: '$\\frac{4{,}2}{0{,}35}$ تساوي:', options: ['$\\frac{420}{35}$', '$\\frac{42}{35}$', '$\\frac{4200}{35}$'], correct: 0 },
            { q: '$\\frac{420}{35}$ تساوي:', options: ['$12$', '$1{,}2$', '$120$'], correct: 0 },
          ],
        },
        summary: 'لقسمة عدد على عدد عشري غير طبيعي نضرب الحدّين في $10$ أو $100$ أو $1000$ بحسب عدد الأرقام بعد الفاصلة في القاسم، ثم نقسم على عدد طبيعي.',
        body: <p><MathText>{KNOWLEDGE.clear.text}</MathText></p>,
      },
    ],
    3: [
      {
        id: 'hasr-ushri-tariqa', type: 'methodes', title: 'أحصر حاصل قسمة إلى 0,1 أو 0,01',
        memo: {
          rule: `\\dfrac{a\\times 10^n}{b\\times 10^n}\\ \\Rightarrow\\ ${R('x')}<\\dfrac{a}{b}<${R('x+10^{-k}')}`,
          hook: 'أنهي، ثم أنتظر الرتبة',
          example: `35{,}71<\\dfrac{1250}{35}<35{,}72`,
          trap: 'القيمة بالزيادة ليست تدويرًا: نضيف وحدة الرتبة',
          exam: 'اكتب القسمة، توقّف عند الرتبة، ثم أضف وحدة الرتبة',
          chip: `x<\\tfrac{a}{b}<x+u`,
          quiz: [
            { q: 'حصر $\\frac{5}{6}$ إلى $0{,}01$ :', options: ['$0{,}83<\\frac{5}{6}<0{,}84$', '$0{,}84<\\frac{5}{6}<0{,}85$', '$0{,}8<\\frac{5}{6}<0{,}9$'], correct: 0 },
            { q: 'الخطوة الأولى لحصر $12{,}5\\div 0{,}35$ :', options: ['ضرب الحدّين في $100$', 'ضرب $0{,}35$ في $100$ فقط', 'تدوير $0{,}35$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تحصر $12{,}5 \\div 0{,}35$ إلى $0{,}1$ ثم إلى $0{,}01$ دون آلة حاسبة؟ ماذا تفعل في الحدّين أوّلًا؟ وكيف تجد القيمة بالنقصان ثم بالزيادة؟ اكتب طريقتك.',
        summary: METHOD.rule,
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{METHOD.solution[3]}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
