/**
 * Les trois « مسائل » du درس « اختبار صحة مساواة أو متباينة » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل الثاني, résolus pas à pas (GuidedProblem). AJOUTS DE LA PLATEFORME
 * (`addition('exam_style_problem')`), contextes de la plateforme (l'ascenseur d'un immeuble, les drapeaux du quartier, deux affirmations sur des entiers consécutifs). Périmètre : tester une inégalité, tester une égalité à des valeurs données,
 * réfuter une affirmation par UN contre-exemple ; jamais « معادلة » ni « حلّ ». La مسألة 1 est « مسألة الدرس » (`LESSON_CONFIG.lessonProblem`) ; chaque مسألة a son tableau ; chaque nombre est vérifié dans ./problems.test.js.
 */
import { addition, src } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — مصعد العمارة',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🛗',
    tone: 'sky',
    source: SOURCE,
    cites: [src('deep-54', 67, 'أتعمّق', 54)],
    table: LESSON_CONFIG.lessonProblem.table,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'limit', text: 'الحمولة القصوى: ⁦630 kg⁩', useful: true },
      { id: 'person', text: 'كتلة الشخص: ⁦70 kg⁩ ، وعددهم x', useful: true },
      { id: 'box', text: 'كتلة الصندوق: ⁦45 kg⁩', useful: true },
      { id: 'floor', text: 'العمارة من خمسة طوابق', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المتباينة',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['المتباينة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ikhtibar-mutabayina'],
            prompt: 'كتلة الأشخاص والصندوق معًا لا تتجاوز $630$ :',
            options: ['$70+45x\\le630$', '$70x+45\\le630$', '$70x+45\\ge630$'], correct: 1, cols: 1,
            explain: 'كتلة $x$ شخصًا هي $70x$ ، وتضاف إليها كتلة الصندوق $45$ ، و « على الأكثر » تعني $\\le$ . ($70+45x$ يضرب الصندوق لا الأشخاص.)' },
          { kind: 'solution', ask: 0, lines: ['كتلة الأشخاص $70\\times x=70x$ والصندوق $45$ .', 'المتباينة: $70x+45\\le630$ .'] },
        ],
      },
      {
        label: '2)', title: 'اختبار القيمتين',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['x=8', 'x=9'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tawid-wa-hisab'], prompt: 'من أجل $x=8$ : $70\\times8+45=$', expected: 605, suffix: 'kg',
            explain: '$70\\times8=560$ ثمّ $560+45=605$ ، و $605\\le630$ صحيحة.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tawid-wa-hisab'], prompt: 'من أجل $x=9$ : $70\\times9+45=$', expected: 675, suffix: 'kg',
            explain: '$70\\times9=630$ ثمّ $630+45=675$ ، و $675\\le630$ خاطئة.' },
          { kind: 'solution', ask: 0, lines: ['$x=8$ : $605\\le630$ صحيحة، فالمصعد يتحمّل.', '$x=9$ : $675\\le630$ خاطئة، فالمصعد لا يتحمّل.'] },
        ],
      },
      {
        label: '3)', title: 'أكبر عدد',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['العدد'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qiyam-muhaqqiqa'], prompt: 'من بين القيمتين المختبرتين، أكبر عدد يركب المصعد مع الصندوق:', expected: 8, suffix: 'أشخاص',
            explain: 'القيمة $8$ تحقّق المتباينة و $9$ لا تحقّقها: أكبر عدد هو $8$ .' },
          { kind: 'solution', ask: 0, lines: ['$8$ تحقّق $70x+45\\le630$ و $9$ لا تحقّقها.', 'أكبر عدد من الأشخاص: $8$ .'] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — أعلام الحيّ',
    context: 'جمعية الحيّ والمدرسة',
    emoji: '🇩🇿',
    tone: 'emerald',
    source: SOURCE,
    cites: [src('ex-27', 64, 'المعادلات', 27)],
    table: { caption: 'ما تدفعه المدرسة بحسب ثمن العلم', head: ['ثمن العلم ⁦DA⁩', 'ما تدفعه المدرسة ⁦DA⁩'], rows: [['150', '1500'], ['225', '2250'], ['300', '3000']] },
    statement: 'اشترت جمعية الحيّ $6$ أعلام وطنية ولافتة بـ $900$ دينار، واشترت المدرسة $10$ أعلام من النوع نفسه، فدفعتا المبلغ نفسه. نسمّي $x$ ثمن العلم الواحد بالدينار.',
    data: [
      { id: 'flags', text: 'الجمعية: 6 أعلام + لافتة بـ ⁦900 DA⁩', useful: true },
      { id: 'school', text: 'المدرسة: 10 أعلام من النوع نفسه', useful: true },
      { id: 'same', text: 'المبلغان متساويان', useful: true },
      { id: 'color', text: 'الأعلام من القماش', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المساواة',
        question: 'عبّر بمساواة عن أنّ المبلغين متساويان.',
        asks: ['المساواة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['musawat-qima'],
            prompt: 'ما تدفعه الجمعية يساوي ما تدفعه المدرسة:',
            options: ['$6x=10x+900$', '$6+900x=10x$', '$6x+900=10x$'], correct: 2, cols: 1,
            explain: 'الجمعية تدفع $6x+900$ والمدرسة $10x$ ، ويتساويان: $6x+900=10x$ . (اللافتة تُضاف إلى أعلام الجمعية لا إلى المدرسة.)' },
          { kind: 'solution', ask: 0, lines: ['الجمعية: $6x+900$ ، والمدرسة: $10x$ .', 'المساواة: $6x+900=10x$ .'] },
        ],
      },
      {
        label: '2)', title: 'اختبار ثلاثة أثمان',
        question: 'احسب ما تدفعه الجمعية من أجل كلّ ثمن: $150$ ثمّ $225$ ثمّ $300$ دينارًا.',
        asks: ['150', '225', '300'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tawid-wa-hisab'], prompt: 'من أجل $x=150$ : $6\\times150+900=$', expected: 1800, suffix: 'DA',
            explain: '$6\\times150=900$ ثمّ $900+900=1800$ ، والمدرسة $1500$ : مختلفان.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tawid-wa-hisab'], prompt: 'من أجل $x=225$ : $6\\times225+900=$', expected: 2250, suffix: 'DA',
            explain: '$6\\times225=1350$ ثمّ $1350+900=2250$ ، والمدرسة $2250$ : متساويان.' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['tawid-wa-hisab'], prompt: 'من أجل $x=300$ : $6\\times300+900=$', expected: 2700, suffix: 'DA',
            explain: '$6\\times300=1800$ ثمّ $1800+900=2700$ ، والمدرسة $3000$ : مختلفان.' },
          { kind: 'solution', ask: 0, lines: ['$150$ : $1800$ و $1500$ ؛ $225$ : $2250$ و $2250$ ؛ $300$ : $2700$ و $3000$.', 'المساواة صحيحة من أجل $225$ فقط من بين هذه القيم.'] },
        ],
      },
      {
        label: '3)', title: 'ثمن العلم',
        question: 'عيّن من بين القيم الثلاث ثمن العلم الواحد.',
        asks: ['الثمن'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['musawat-qima'],
            prompt: 'القيمة التي تجعل المبلغين متساويين:',
            options: ['$150$ دينارًا', '$300$ دينار', '$225$ دينارًا'], correct: 2, cols: 1,
            explain: 'عند $225$ يدفع كلّ منهما $2250$ ؛ أمّا $150$ و $300$ فتعطيان مبلغين مختلفين.' },
          { kind: 'solution', ask: 0, lines: ['المساواة صحيحة من أجل $x=225$ .', 'ثمن العلم الواحد $225$ دينارًا.'] },
        ],
      },
      {
        label: '4)', title: 'المبلغ المدفوع',
        question: 'احسب المبلغ الذي دفعته كلّ جهة.',
        asks: ['المبلغ'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tawid-wa-hisab'], prompt: 'المدرسة: $10\\times225=$', expected: 2250, suffix: 'DA',
            explain: '$10\\times225=2250$ ، وهو ما دفعته الجمعية أيضًا: $6\\times225+900=2250$ .' },
          { kind: 'solution', ask: 0, lines: ['المدرسة: $10\\times225=2250$ دينار.', 'والجمعية: $6\\times225+900=2250$ دينار.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — ادّعاءان عن الأعداد المتتالية',
    context: 'مباراة في الحساب',
    emoji: '🔢',
    tone: 'violet',
    source: SOURCE,
    cites: [src('deep-54', 67, 'أتعمّق', 54), src('deep-60', 67, 'أتعمّق', 60)],
    table: { caption: 'ثلاثة أعداد طبيعية متتالية', head: ['الأوّل', 'الأوسط', 'الأخير'], rows: [['4', '5', '6']] },
    statement: 'قال ياسين: مجموع ثلاثة أعداد طبيعية متتالية يساوي دائمًا ثلاثة أضعاف أوسطها. وقالت لينا: جداؤها يساوي دائمًا مكعّب أوسطها.',
    data: [
      { id: 'yacine', text: 'ياسين: المجموع = 3 × الأوسط', useful: true },
      { id: 'lina', text: 'لينا: الجداء = مكعّب الأوسط', useful: true },
      { id: 'nums', text: 'نختبر بالأعداد 4 و 5 و 6', useful: true },
      { id: 'club', text: 'المباراة في نادي الرياضيات', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الاختبار بثلاثة أعداد',
        question: 'احسب مجموع الأعداد $4$ و $5$ و $6$ ثمّ جداءها.',
        asks: ['المجموع', 'الجداء'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tawid-wa-hisab'], prompt: '$4+5+6=$', expected: 15,
            explain: '$4+5+6=15$ ، و $3\\times5=15$ : ادّعاء ياسين صحيح لهذه الأعداد.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tawid-wa-hisab'], prompt: '$4\\times5\\times6=$', expected: 120,
            explain: '$4\\times5=20$ ثمّ $20\\times6=120$ ، ومكعّب الأوسط $5^3=125$ : $120\\neq125$ .' },
          { kind: 'solution', ask: 0, lines: ['المجموع $15=3\\times5$ ، فادّعاء ياسين صحيح هنا.', 'الجداء $120$ ومكعّب الأوسط $125$ ، و $120\\neq125$ .'] },
        ],
      },
      {
        label: '2)', title: 'ادّعاء لينا',
        question: 'هل يكفي هذا الاختبار لإبطال ادّعاء لينا؟',
        asks: ['الحكم'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mithal-mudad'],
            prompt: 'الأعداد $4$ و $5$ و $6$ تعطي $120\\neq125$ :',
            options: ['لا، نحتاج مثالين على الأقلّ', 'نعم، مثال مضادّ واحد يكفي', 'لا، لا يمكن إبطال ادّعاء'], correct: 1, cols: 1,
            explain: 'ادّعاء « دائمًا » يسقط بمثال واحد يخالفه.' },
          { kind: 'solution', ask: 0, lines: ['ادّعاء لينا يقول « دائمًا ».', 'مثال مضادّ واحد يكفي لإبطاله.'] },
        ],
      },
      {
        label: '3)', title: 'ادّعاء ياسين',
        question: 'وهل يكفي مثال واحد لإثبات ادّعاء ياسين؟',
        asks: ['الحكم'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tasawi-ibaratayn'],
            prompt: 'ادّعاء ياسين صحيح من أجل $4$ و $5$ و $6$ :',
            options: ['نعم، يكفي مثال واحد', 'لا، مثال واحد لا يكفي لإثبات « دائمًا »', 'نعم، إن جرّبنا عددين'], correct: 1, cols: 1,
            explain: 'التساوي من أجل أعداد جرّبناها لا يثبت أنّه صحيح دائمًا؛ نحتاج إلى مبرّر عامّ.' },
          { kind: 'solution', ask: 0, lines: ['صحّة الادّعاء لأعداد قليلة لا تعني صحّته دائمًا.', 'نبرّره بالحرف في السؤال الموالي.'] },
        ],
      },
      {
        label: '4)', title: 'تبرير ادّعاء ياسين',
        question: 'عبّر بدلالة $n$ (الأوسط) عن مجموع الأعداد الثلاثة المتتالية.',
        asks: ['المجموع'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tasawi-ibaratayn'],
            prompt: 'الأعداد هي $n-1$ و $n$ و $n+1$ ، ومجموعها:',
            options: ['$3n+1$', '$3n$', '$n^3$'], correct: 1, cols: 1,
            explain: '$(n-1)+n+(n+1)=3n$ لأنّ $-1$ و $+1$ يلغي أحدهما الآخر: وهذا هو ثلاثة أضعاف الأوسط مهما كان $n$ .' },
          { kind: 'solution', ask: 0, lines: ['$(n-1)+n+(n+1)=3n$ لأنّ $-1+1=0$ .', 'فادّعاء ياسين صحيح مهما كان العدد الأوسط.'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
