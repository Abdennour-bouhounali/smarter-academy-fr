import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD_DIFF } from './content/textbook';

// La carte progressive de la leçon — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « مقارنة عددين ناطقين » (3AM) — SOURCE UNIQUE (content/textbook.js : les mots de la plateforme, tirés de معارف 5 et de طريقة 5 du manuel ; rien n'est copié au mot).
 * La comparaison de deux fractions (`tasawi-muqaranat-kasrayn-3am`), la différence de deux fractions (`jam-tarh-kasrayn-3am`), l'ordre des relatifs (`muqarana-nisbiya-2am`) et la réduction d'une
 * expression (`tabsit-hadhf-aqwas-3am`) sont des prérequis (`priorKnowledge`), mesurés par « أستعدّ », jamais des items ici.
 */
/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'ishara-farq', type: 'regles', title: 'جهة الإبرة تدلّ على الأكبر',
        memo: {
          rule: `${R('a-b')}>0\\iff a>b`,
          hook: 'الإبرة يمينًا: الأحمر أكبر',
          example: `\\dfrac54-\\dfrac34=${R('\\dfrac12')}>0`,
          trap: 'الأبعد عن الصفر ليس دائمًا الأكبر',
          exam: 'اقرأ إشارة الفرق قبل أن تحكم',
          chip: `${R('a-b')}>0`,
          quiz: [
            { q: 'إذا كان $a-b=\\frac{2}{3}$ فإنّ:', options: ['$a>b$', '$a<b$', '$a=b$'], correct: 0 },
            { q: 'الإبرة إلى اليسار تعني أنّ عدد المجسّ الأحمر:', options: ['أصغر', 'أكبر', 'يساوي عدد المجسّ الأسود'], correct: 0 },
          ],
        },
        predictPrompt: 'في الأزواج التي رأيتها على السكّة، أين وقفت الإبرة حين كان عدد المجسّ الأحمر هو الأكبر؟ اكتب ما لاحظته.',
        summary: 'الإبرة إلى اليمين حين يكون عدد المجسّ الأحمر الأكبر، وإلى اليسار حين يكون الأصغر، وعند الصفر حين يتساويان.',
        body: <p><MathText>{KNOWLEDGE.side.text}</MathText></p>,
      },
      {
        id: 'ibdal-mujassayn', type: 'regles', title: 'التبديل يغيّر الجهة لا الترتيب',
        memo: {
          rule: `b-a=${R('-')}(a-b)`,
          hook: 'تتبدّل الإشارة ويبقى الترتيب',
          example: `-\\dfrac12-\\left(-\\dfrac32\\right)=${R('1')}`,
          trap: 'تبديل المجسّين لا يجعل الأصغر أكبر',
          exam: 'انتبه: أيّ عدد طرحتَ من أيّ عدد؟',
          chip: `b-a=${R('-')}(a-b)`,
          quiz: [
            { q: 'إذا كان $a-b=-4$ فإنّ $b-a$ يساوي:', options: ['$4$', '$-4$', '$0$'], correct: 0 },
            { q: 'إذا كان $a<b$ ثم بدّلنا المجسّين:', options: ['يبقى $a<b$', 'يصبح $a>b$', 'يصبح $a=b$'], correct: 0 },
          ],
        },
        predictPrompt: 'بدّلتَ المجسّين في الزوج الثاني فانتقلت الإبرة من اليسار إلى اليمين. هل تغيّر الترتيب بين الحبّتين؟ اكتب ما لاحظته.',
        summary: 'تبديل المجسّين يبدّل إشارة الفرق ولا يبدّل ترتيب العددين.',
        body: <p><MathText>{KNOWLEDGE.swap.text}</MathText></p>,
      },
      {
        id: 'farq-wahdahu', type: 'concepts', title: 'الفرق وحده يكفي',
        memo: {
          rule: `a-b=${R('-0{,}3')}\\Rightarrow a<b`,
          hook: 'الإشارة وحدها تكفي',
          example: `\\dfrac9{11}-\\dfrac{13}{16}=${R('\\dfrac1{176}')}`,
          trap: 'لا تحكم بالبسط الأكبر وحده',
          exam: 'لا حاجة إلى رؤية العددين: إشارة الفرق تحسم',
          chip: `${R('a-b')}<0`,
          quiz: [
            { q: 'علمنا فقط أنّ $a-b=-0{,}3$ . إذن:', options: ['$a<b$', '$a>b$', 'لا نستطيع الحكم'], correct: 0 },
            { q: 'الأكبر بين $\\frac{9}{11}$ و $\\frac{13}{16}$ :', options: ['$\\frac{9}{11}$', '$\\frac{13}{16}$', 'متساويان'], correct: 0 },
          ],
        },
        predictPrompt: 'الحبّتان 9/11 و 13/16 كانتا متراكبتين ومع ذلك حسمتِ الإبرة الترتيب. ماذا يعني ذلك لمعرفة الترتيب؟ اكتب ما لاحظته.',
        summary: 'لمعرفة ترتيب عددين تكفي إشارة فرقهما، ولو كانا قريبين جدًّا أو مجهولين.',
        body: <p><MathText>{KNOWLEDGE.alone.text}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'maana-farq', type: 'regles', title: 'معنى الترتيب بإشارة الفرق',
        memo: {
          rule: `a<b\\iff ${R('a-b<0')}`,
          hook: 'ثلاث إشارات، ثلاثة ترتيبات',
          example: `a=b\\iff ${R('a-b=0')}`,
          trap: 'لا تخلط بين الفرقين: a − b غير b − a',
          exam: 'اكتب: بما أنّ الفرق سالب فإنّ الأوّل أصغر',
          chip: `${R('a-b=0')}`,
          quiz: [
            { q: '$x-y=0$ معناه:', options: ['$x=y$', '$x>y$', '$x<y$'], correct: 0 },
            { q: '$m<n$ معناه:', options: ['$m-n<0$', '$m-n>0$', '$n-m<0$'], correct: 0 },
          ],
        },
        predictPrompt: 'أجبتَ عن سؤالين حول فروق معطاة. اكتب بكلماتك العلاقة بين ترتيب عددين وإشارة فرقهما.',
        summary: '$a>b$ معناه $a-b>0$ ، و $a<b$ معناه $a-b<0$ ، و $a=b$ معناه $a-b=0$.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.rule.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.example1.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'hisab-farq', type: 'methodes', title: 'احسب الفرق ثم اكتب الاستنتاج',
        memo: {
          rule: `\\dfrac{a}{b}-\\dfrac{c}{d}=\\dfrac{${R('ad-bc')}}{bd}`,
          hook: 'احسب، أشِر، استنتج',
          example: `\\dfrac{17}{12}-\\dfrac{10}{7}=${R('-\\dfrac{1}{84}')}`,
          trap: 'لا تكتفِ بالفرق: اكتب الاستنتاج',
          exam: 'بما أنّ الفرق سالب فإنّ العدد الأوّل أصغر',
          chip: `\\tfrac{${R('ad-bc')}}{bd}`,
          quiz: [
            { q: 'إشارة $\\frac{3}{4}-\\frac{5}{7}$ :', options: ['موجبة', 'سالبة', 'معدومة'], correct: 0 },
            { q: 'لمقارنة $\\frac{2}{3}$ و $\\frac{3}{5}$ نحسب:', options: ['$\\frac{2}{3}-\\frac{3}{5}=\\frac{1}{15}$', '$\\frac{2-3}{3-5}$', '$\\frac{2}{3}\\times\\frac{3}{5}$'], correct: 0 },
          ],
        },
        predictPrompt: 'حسبتَ فرق عددين ثم حكمتَ على ترتيبهما. ما الخطوات التي اتّبعتَها؟ اكتب الطريقة بكلماتك.',
        summary: 'نحسب الفرق، نعيّن إشارته، ثم نكتب: بما أنّ $a-b>0$ فإنّ $a>b$.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD_DIFF.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.example2.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.pi.text}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'farq-ibaratayn', type: 'methodes', title: 'أبسّط A − B وأقرأ إشارته',
        memo: {
          rule: `A-B=${R('x-4')}`,
          hook: 'بسّط ثم اقرأ الإشارة',
          example: `2(x+3)-(2x+1)=${R('5')}`,
          trap: 'انتبه لإشارات القوس عند طرح B كلّها',
          exam: 'بسّط A − B ثم ادرس إشارته حسب قيم x',
          chip: `A-B=${R('x-4')}`,
          quiz: [
            { q: '$A=3x+5$ و $B=2x+9$ . إذن $A-B$ :', options: ['$x-4$', '$5x+14$', '$x+14$'], correct: 0 },
            { q: 'إذا كان $A-B=5$ لكل $x$ فإنّ:', options: ['$A>B$ دائمًا', '$A<B$ دائمًا', '$A=B$ عند $x=5$'], correct: 0 },
          ],
        },
        predictPrompt: 'حرّكتَ x فعبرت الإبرة الصفر عند قيمة محدّدة. كيف تقارن عبارتين A و B لكل قيم x؟ اكتب طريقتك.',
        summary: 'نبسّط $A-B$ ثم نعيّن إشارته حسب قيم $x$ : موجب عند الجهة الأولى، ومعدوم عند القيمة الفاصلة، وسالب عند الجهة الأخرى.',
        body: <p><MathText>{KNOWLEDGE.expr.text}</MathText></p>,
      },
    ],
  },
};
