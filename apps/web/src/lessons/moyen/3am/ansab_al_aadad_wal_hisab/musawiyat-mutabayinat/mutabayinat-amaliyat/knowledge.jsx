import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « المتباينات والعمليات » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 2
 * p. 74 et طرائق p. 75, réécrits). Le test d'une inégalité par une valeur, le produit de nombres relatifs, l'ordre de deux relatifs et la leçon
 * sœur des égalités sont des prérequis (`priorKnowledge`), mesurés par « أستعدّ », jamais des items ici.
 */
const { add, pos, neg, weak, zero } = KNOWLEDGE;

/** `memo` : la fiche de « 🔑 للتذكّر » — ce qui CHANGE en `R(…)` (rouge). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'jam-mutabayina', type: 'regles', title: 'المتباينة والجمع والطرح',
        memo: {
          rule: `a<b\\Rightarrow a${R('+c')}<b${R('+c')}\\ ,\\ a${R('-c')}<b${R('-c')}`,
          hook: 'الجمع والطرح يحفظان الاتجاه',
          example: `1<3\\Rightarrow1${R('+2')}<3${R('+2')}`,
          trap: 'نظنّ أنّ العدد السالب يعكس الاتجاه عند الجمع',
          exam: 'اكتب المتباينة الجديدة بالاتجاه نفسه',
          chip: `a<b\\Rightarrow a\\pm c<b\\pm c`,
          quiz: [
            { q: 'إذا كان $a<b$ فإنّ $a-5$ و $b-5$ :', options: ['$a-5>b-5$', '$a-5<b-5$', '$a-5=b-5$'], correct: 1 },
            { q: 'من $-2<-1$ بإضافة $8$ إلى الطرفين نجد:', options: ['$6<7$', '$6>7$', '$-16<-8$'], correct: 0 },
          ],
        },
        predictPrompt: 'على النول بقي الأحمر على يسار الأزرق مهما كان العدد الذي أزحتَ به الخيوط. إذا كان $a<b$ فماذا يمكنك أن تقول عن $a+c$ و $b+c$ ؟ وعن $a-c$ و $b-c$ ؟ اكتب القاعدة بكلماتك.',
        summary: 'إذا كان a < b فإنّ a + c < b + c و a − c < b − c : الجمع والطرح لا يغيّران اتجاه المتباينة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{add.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{add.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'darb-mujab', type: 'regles', title: 'الضرب في عدد موجب',
        memo: {
          rule: `a<b\\ ,\\ c${R('>0')}\\Rightarrow ac<bc`,
          hook: 'الموجب يحفظ الاتجاه',
          example: `-2<-1\\ ,\\ c=${R('3')}\\Rightarrow-6<-3`,
          trap: 'نعكس الاتجاه بلا مبرّر مع عدد موجب',
          exam: 'اذكر أنّ العدد موجب تمامًا',
          chip: `c>0:\\ a<b\\Rightarrow ac<bc`,
          quiz: [
            { q: 'إذا كان $a<b$ فإنّ $4a$ و $4b$ :', options: ['$4a>4b$', '$4a<4b$', '$4a=4b$'], correct: 1 },
            { q: 'من $-2<-1$ بالضرب في $3$ نجد:', options: ['$-6>-3$', '$6<3$', '$-6<-3$'], correct: 2 },
          ],
        },
        predictPrompt: 'مدّدتَ الخيوط بعدد موجب فبقي الأحمر على يسار الأزرق. إذا كان $a<b$ و $c>0$ فماذا تقول عن $ac$ و $bc$ ؟ اكتب القاعدة بكلماتك.',
        summary: 'إذا كان a < b و c > 0 فإنّ ac < bc : الضرب في عدد موجب تمامًا لا يغيّر الاتجاه.',
        body: (
          <div className="space-y-2">
            <p><MathText>{pos.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{pos.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'darb-salib', type: 'regles', title: 'الضرب في عدد سالب',
        memo: {
          rule: `a<b\\ ,\\ c${R('<0')}\\Rightarrow ac${R('>')}bc`,
          hook: 'السالب يعكس الاتجاه',
          example: `-2<-1\\ ,\\ c=${R('-3')}\\Rightarrow6${R('>')}3`,
          trap: 'نضرب في السالب وننسى عكس الاتجاه',
          exam: 'اكتب الاتجاه الجديد عند كلّ ضرب سالب',
          chip: `c<0:\\ a<b\\Rightarrow ac>bc`,
          quiz: [
            { q: 'إذا كان $a<b$ فإنّ $-2a$ و $-2b$ :', options: ['$-2a<-2b$', '$-2a=-2b$', '$-2a>-2b$'], correct: 2 },
            { q: 'من $1<3$ بالضرب في $-1$ نجد:', options: ['$-1>-3$', '$-1<-3$', '$1>3$'], correct: 0 },
          ],
        },
        predictPrompt: 'مدّدتَ الخيوط بعدد سالب فصار الأحمر على يمين الأزرق. إذا كان $a<b$ و $c<0$ فماذا تقول عن $ac$ و $bc$ ؟ اكتب ما يحدث لاتجاه المتباينة.',
        summary: 'إذا كان a < b و c < 0 فإنّ ac > bc : الضرب في عدد سالب تمامًا يغيّر اتجاه المتباينة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{neg.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{neg.example}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'qisma-wa-taswiya', type: 'regles', title: '≤ و ≥ والقسمة',
        memo: {
          rule: `a\\le b\\ ,\\ c<0\\Rightarrow\\dfrac{a}{c}${R('\\ge')}\\dfrac{b}{c}`,
          hook: 'الشيء نفسه مع أصغر أو يساوي',
          example: `-6x\\le12\\Rightarrow x${R('\\ge')}-2`,
          trap: 'القسمة على سالب تعكس الاتجاه أيضًا',
          exam: 'اكتب الرمز الجديد عند كلّ قسمة',
          chip: `\\div c<0:\\ \\le\\to${R('\\ge')}`,
          quiz: [
            { q: 'من $-6x\\le12$ نقسم على $-6$ فنجد:', options: ['$x\\le-2$', '$x\\ge-2$', '$x\\ge2$'], correct: 1 },
            { q: 'من $3x\\ge12$ نقسم على $3$ فنجد:', options: ['$x\\le4$', '$x\\ge36$', '$x\\ge4$'], correct: 2 },
          ],
        },
        predictPrompt: 'هل تبقى الخواص صحيحة مع $\\leq$ و $\\geq$ ؟ وماذا تفعل القسمة على عدد باتجاه المتباينة؟ اكتب ما تعرفه.',
        summary: 'الخواص نفسها مع ≤ و ≥ ؛ والقسمة على c هي الضرب في 1/c الذي له إشارة c نفسها.',
        body: <p><MathText>{weak.text}</MathText></p>,
      },
      {
        id: 'sifr-mutabayina', type: 'regles', title: 'الضرب في صفر',
        memo: {
          rule: `a<b\\Rightarrow a\\times${R('0')}=b\\times${R('0')}`,
          hook: 'الصفر يفسد المتباينة التامّة',
          example: `1<3\\Rightarrow0=0`,
          trap: 'نكتب أصغر تمامًا بعد الضرب في الصفر',
          exam: 'اشترط أنّ العدد غير معدوم',
          chip: `c\\neq${R('0')}`,
          quiz: [
            { q: 'ضرب طرفي $1<3$ في $0$ يعطي:', options: ['$0<0$', '$0>0$', '$0=0$'], correct: 2 },
            { q: 'لماذا نشترط $c\\neq0$ ؟', options: ['لأنّ النتيجة لا تبقى متباينة تامّة', 'لأنّ الصفر عدد سالب', 'لأنّ الضرب في الصفر يعكس الاتجاه'], correct: 0 },
          ],
        },
        predictPrompt: 'عند المسمار في $0$ التقت العقدتان. ماذا يحدث لمتباينة تامّة حين نضرب طرفيها في $0$ ؟',
        summary: 'الضرب في 0 يعطي 0 = 0 : لم تعد متباينة تامّة، ولذلك نشترط c ≠ 0.',
        body: <p><MathText>{zero.text}</MathText></p>,
      },
    ],
    3: [
      {
        id: 'istintaj', type: 'methodes', title: 'أستنتج متباينة من أخرى',
        memo: {
          rule: `a<0:\\ ax<n\\Rightarrow x${R('>')}\\dfrac{n}{a}`,
          hook: 'خطوة خطوة وعكس عند السالب',
          example: `-2x<6\\Rightarrow x${R('>')}-3`,
          trap: 'ننسى عكس الاتجاه عند القسمة على سالب',
          exam: 'اكتب العملية بجانب كلّ سطر',
          chip: `\\div(a<0):\\ <\\to${R('>')}`,
          quiz: [
            { q: 'من $-2x<6$ نجد:', options: ['$x<-3$', '$x>3$', '$x>-3$'], correct: 2 },
            { q: 'من $3x\\le9$ نجد:', options: ['$x\\le3$', '$x\\ge3$', '$x\\le27$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تنتقل من متباينة معطاة إلى متباينة طرفها الأول $x$ ؟ وماذا تفعل عندما تقسم على عدد سالب؟ اكتب طريقتك.',
        summary: 'نجري العملية نفسها على الطرفين خطوة خطوة، ونغيّر الاتجاه في كل ضرب أو قسمة في عدد سالب تمامًا.',
        body: <p><MathText>{METHOD.deduce.rule}</MathText></p>,
      },
      {
        id: 'muqarana-bil-khawas', type: 'methodes', title: 'أقارن عبارتين',
        memo: {
          rule: `A-B${R('>0')}\\Rightarrow A>B`,
          hook: 'احسب الفرق وانظر إلى إشارته',
          example: `A-B=2>0\\Rightarrow A>B`,
          trap: 'التخمين بقيمتين لا يكفي برهانًا',
          exam: 'اكتب الفرق ثم إشارته ثم النتيجة',
          chip: `A-B>0\\iff A>B`,
          quiz: [
            { q: 'إذا كان $A-B<0$ فإنّ:', options: ['$A>B$', '$A<B$', '$A=B$'], correct: 1 },
            { q: 'لإثبات $A>B$ نحسب:', options: ['$A+B$', '$A\\times B$', '$A-B$'], correct: 2 },
          ],
        },
        predictPrompt: 'كيف تثبت أنّ $A>B$ بعد أن خمّنتَ ذلك بقيمتين؟ اكتب طريقتك.',
        summary: 'نحسب الفرق A − B ثم نستعمل الخواص لنعرف إشارته.',
        body: <p><MathText>{METHOD.compare.rule}</MathText></p>,
      },
      {
        id: 'hasr-ab', type: 'methodes', title: 'أحصر عبارة',
        memo: {
          rule: `at+b\\in[${R('aM')}+b\\,;\\,${R('am')}+b]\\ (a<0)`,
          hook: 'احصر ثم أضف b',
          example: `1\\le t\\le3\\Rightarrow-2\\le-2t+4\\le2`,
          trap: 'مع a سالب نكتب الأصغر أولًا',
          exam: 'احصر ax أولًا ثم أضف الحدّ الثابت',
          chip: `m\\le t\\le M`,
          quiz: [
            { q: 'إذا كان $1\\le t\\le3$ فإنّ $-2t$ يحقّق:', options: ['$-2\\le-2t\\le-6$', '$2\\le-2t\\le6$', '$-6\\le-2t\\le-2$'], correct: 2 },
            { q: 'وبالتالي $-2t+4$ يحقّق:', options: ['$-2\\le-2t+4\\le2$', '$-6\\le-2t+4\\le-2$', '$2\\le-2t+4\\le6$'], correct: 0 },
          ],
        },
        predictPrompt: 'علمتَ حصرًا لـ $t$ . كيف تحصر $-2t+4$ ؟ وماذا يحدث لترتيب الطرفين؟ اكتب طريقتك.',
        summary: 'نحصر ax أولًا ثم نضيف b ؛ ومع a سالب نكتب الأصغر أولًا.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD.bracket.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.boundOrder.right}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
