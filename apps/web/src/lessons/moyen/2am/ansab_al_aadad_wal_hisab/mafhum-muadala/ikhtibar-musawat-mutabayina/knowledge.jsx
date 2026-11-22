import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « اختبار صحة مساواة أو متباينة » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js). La valeur d'une expression (1AM `tatbiq-qaida-harfiya`, leçon PRÉVUE : une phrase, pas de lien)
 * et la somme algébrique (`majmu-jabri`) ne sont PAS des items ici : ce sont des prérequis, rappelés par « أستعدّ » et par les « تذكّر ». Les mots « معادلة » et « حلّ » n'apparaissent pas (ils sont à `hall-mushkil-muadala`).
 */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const M = (s) => <MathText>{s}</MathText>;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'tawid-wa-hisab', type: 'regles', title: 'نعوّض ونحسب كلّ طرف',
        memo: {
          rule: `4000+50\\times15`,
          hook: 'الميزان يحسب الطرف بعد التعويض',
          example: `${R('4750')}<5000`,
          trap: 'لا تحسب طرفًا واحدًا فقط',
          exam: 'اكتب سطر التعويض ثمّ قارن العددين',
          chip: `4000+50x`,
          quiz: [
            { q: 'كتلة الشاحنة الفارغة $4000$ والكيس $50$ : بـ $15$ كيسًا تصير الكتلة:', options: ['$4750$', '$4015$', '$4050$'], correct: 0 },
            { q: 'المتباينة $4000+50x<5000$ من أجل $x=15$ :', options: ['صحيحة لأنّ $4750<5000$', 'خاطئة لأنّ $4750>5000$', 'لا يمكن معرفة ذلك'], correct: 0 },
          ],
        },
        predictPrompt: 'حمّلتَ الشاحنة ثمّ مرّرتها على الميزان. ماذا كتبت الشاشة قبل أن تقول « صحيحة » أو « خاطئة »؟ صف ما رأيت بكلماتك.',
        summary: GUIDE.line,
        body: <p>{M(GUIDE.line)}</p>,
      },
      {
        id: 'hadd', type: 'regles', title: 'الحدّ: ليس أقلّ تمامًا',
        memo: {
          rule: `5000\\nless5000`,
          hook: 'التساوي لا يحقّق « أقلّ تمامًا »',
          example: `5000\\le5000`,
          trap: 'لا تُمرّر الحمولة التي تعطي الحدّ نفسه مع الرمز $<$',
          exam: 'عند التساوي $<$ خاطئة و $\\le$ صحيحة',
          chip: `5000\\nless5000`,
          quiz: [
            { q: 'القاعدة « أقلّ من $5000$ » والكتلة $5000$ بالضبط:', options: ['لا تعبر الشاحنة', 'تعبر الشاحنة', 'تعبر إذا خفّفنا العدد'], correct: 0 },
            { q: 'القاعدة « $\\le5000$ » والكتلة $5000$ بالضبط:', options: ['تعبر الشاحنة', 'لا تعبر الشاحنة', 'لا يمكن الحكم'], correct: 0 },
          ],
        },
        predictPrompt: 'جرّبتَ $18$ و $19$ و $20$ و $21$ كيسًا، ولم تعبر الشاحنة بـ $20$ كيسًا مع أنّ كتلتها $5000$ بالضبط. لماذا؟ اكتب تعليلك.',
        summary: GUIDE.edge,
        body: <p>{M(GUIDE.edge)}</p>,
      },
      {
        id: 'majhulan', type: 'regles', title: 'مجهولان في قاعدة واحدة',
        memo: {
          rule: `4500+50x+40y`,
          hook: 'نعوّض الحرفين معًا في القاعدة',
          example: `x=20,\\,y=30\\ \\to\\ 6700<7000`,
          trap: 'لا تبدّل القيمتين: $(x;y)$ ليس $(y;x)$',
          exam: 'اذكر ما يمثّله كلّ حرف ثمّ عوّض',
          chip: `4500+50x+40y`,
          quiz: [
            { q: 'في $4500+50x+40y$ من أجل $x=30$ و $y=25$ نجد:', options: ['$7000$', '$6000$', '$7500$'], correct: 0 },
            { q: 'المجهولان في قاعدة الجسر هما:', options: ['عدد أكياس الإسمنت وعدد أكياس الرمل', 'كتلة الشاحنة وكتلة الكيس', 'الحدّ المسموح والحمولة'], correct: 0 },
          ],
        },
        predictPrompt: 'القاعدة الجديدة فيها نوعان من الأكياس. كم مجهولًا فيها؟ وماذا يمثّل كلّ منهما؟ اكتب ما لاحظته.',
        summary: GUIDE.two,
        body: <p>{M(GUIDE.two)}</p>,
      },
      {
        id: 'musawat-qima', type: 'regles', title: 'مساواة صحيحة من أجل قيمة',
        memo: {
          rule: `x=30:\\ 5100=5100`,
          hook: 'طرفان متساويان عند حمولة واحدة',
          example: `x=20:\\ ${R('4400')}\\neq4600`,
          trap: 'لا تعمّم من حمولة واحدة',
          exam: 'عوّض ثمّ قارن العددين المحسوبين',
          chip: `5100=5100`,
          quiz: [
            { q: 'المساواة $3000+70x=3600+50x$ صحيحة من أجل:', options: ['$x=30$', '$x=20$', '$x=40$'], correct: 0 },
            { q: 'كتلتا الشاحنتين من أجل $x=40$ :', options: ['$5800$ و $5600$', '$5600$ و $5800$', '$5100$ و $5100$'], correct: 0 },
          ],
        },
        predictPrompt: 'حمّلتَ الشاحنتين بالحمولة نفسها وغيّرتها. هل تساوت كتلتاهما من أجل كلّ حمولة؟ ومن أجل أيّ حمولة تساوتا؟ اكتب إجابتك.',
        summary: GUIDE.equality,
        body: <p>{M(GUIDE.equality)}</p>,
      },
      {
        id: 'mithal-mudad', type: 'regles', title: 'مثال مضادّ واحد يكفي',
        memo: {
          rule: `x=31:\\ 5170>5150`,
          hook: 'حمولة واحدة تُبطل الادّعاء',
          example: `x=0:\\ 2000\\neq${R('2400')}`,
          trap: 'تساوٍ عند $x=10$ لا يثبت شيئًا',
          exam: 'أبطل الادّعاء بقيمة واحدة تخالفه',
          chip: `5170>5150`,
          quiz: [
            { q: 'ادّعى ياسين أنّ A أخفّ من B دائمًا. ما الذي يكفي لإبطاله؟', options: ['حمولة واحدة لا تحقّق الادّعاء', 'حمولات كثيرة تخالفه', 'لا يمكن إبطاله'], correct: 0 },
            { q: 'من أجل $x=0$ كتلتا الشاحنتين $2000$ و $2400$ ، فهما:', options: ['غير متساويتين', 'متساويتان', 'لا نعرف'], correct: 0 },
          ],
        },
        predictPrompt: 'قال ياسين إنّ الشاحنة A أخفّ من B دائمًا. كم حمولة تحتاج لتبيّن أنّه مخطئ؟ ولماذا؟',
        summary: GUIDE.counter,
        body: <div className="space-y-2"><p>{M(GUIDE.counter)}</p><p className="text-sm text-slate-600">{M(GUIDE.oneValue)}</p></div>,
      },
    ],
    2: [
      {
        id: 'tasawi-ibaratayn', type: 'regles', title: 'عبارتان متساويتان دائمًا',
        memo: {
          rule: `2(x+3)=2x+6`,
          hook: 'القيمة نفسها مهما كان $x$',
          example: `x=0:\\ 6=6\\ ;\\ x=5:\\ ${R('16')}=16`,
          trap: 'تجربة قيمتين لا تثبت التساوي',
          exam: 'برّر بقاعدة معروفة كالتوزيع',
          chip: `2(x+3)=2x+6`,
          quiz: [
            { q: 'العبارتان $2(x+3)$ و $2x+6$ متساويتان دائمًا لأنّ:', options: ['التوزيع قاعدة صحيحة دائمًا', 'تتساويان من أجل $x=1$', 'جرّبنا ثلاث قيم'], correct: 0 },
            { q: '$x^2+4$ و $5x$ تتساويان من أجل $1$ ومن أجل $4$ ، فهما:', options: ['غير متساويتين لأنّ $x=0$ يعطي $4\\neq0$', 'متساويتان دائمًا', 'متساويتان لأنّ القيمتين كافيتان'], correct: 0 },
          ],
        },
        predictPrompt: 'جرّبتَ أمثلة كثيرة لعبارتين. متى تقول إنّهما متساويتان دائمًا؟ اكتب شرطك بكلماتك.',
        summary: KNOWLEDGE.equal.text,
        body: <div className="space-y-2"><p>{M(KNOWLEDGE.equal.text)}</p><p className="text-sm text-slate-600">{M(KNOWLEDGE.equal.example)}</p></div>,
      },
      {
        id: 'ikhtibar-mutabayina', type: 'regles', title: 'اختبار متباينة والرموز الأربعة',
        memo: {
          rule: `<\\ ,\\ >\\ ,\\ \\le\\ ,\\ \\ge`,
          hook: 'نقارن العددين المحسوبين',
          example: `3+5x<20:\\ x=3\\to${R('18')}<20`,
          trap: '$<$ لا تقبل التساوي و $\\le$ تقبله',
          exam: 'عوّض واحسب الطرفين ثمّ قارن بالرمز',
          chip: `3+5x<20`,
          quiz: [
            { q: '$3+5x<20$ من أجل $x=4$ :', options: ['خاطئة لأنّ $23>20$', 'صحيحة لأنّ $23<20$', 'صحيحة لأنّ $18<20$'], correct: 0 },
            { q: 'الرمز الذي يقبل التساوي بين العددين:', options: ['$\\le$', '$<$', '$>$'], correct: 0 },
          ],
        },
        predictPrompt: 'ما الفرق بين « أقلّ من » و « أقلّ من أو يساوي » حين تكون كتلة الشاحنة $7000$ والحدّ $7000$ ؟ اكتب بكلماتك.',
        summary: KNOWLEDGE.inequality.text,
        body: <div className="space-y-2"><p>{M(KNOWLEDGE.inequality.text)}</p><p className="text-sm text-slate-600">{M(KNOWLEDGE.inequality.example)}</p></div>,
      },
    ],
    3: [
      {
        id: 'jadwal-ikhtibar', type: 'methodes', title: 'جدول الاختبار',
        memo: {
          rule: `2x+9=5x-3`,
          hook: 'عمودان للطرفين وعمود للنتيجة',
          example: `x=4:\\ 17=${R('17')}`,
          trap: 'احسب الطرفين لا طرفًا واحدًا',
          exam: 'ارسم الجدول ثمّ املأ سطرًا لكلّ قيمة',
          chip: `2x+9=5x-3`,
          quiz: [
            { q: 'قيمة $2x+9$ من أجل $x=2$ :', options: ['$13$', '$11$', '$9$'], correct: 0 },
            { q: 'قيمة $5x-3$ من أجل $x=2$ :', options: ['$7$', '$13$', '$10$'], correct: 0 },
          ],
        },
        predictPrompt: 'لتختبر مساواة بقيمتين (قيمة ثمّ أخرى) كيف تنظّم حسابك على الورق؟ اكتب أعمدة جدولك.',
        summary: METHOD.solution[0],
        body: <p>{M(METHOD.solution[0])}</p>,
      },
      {
        id: 'zawj-tartib', type: 'methodes', title: 'ترتيب القيمتين',
        memo: {
          rule: `3x+2y=24`,
          hook: 'القيمة الأولى للحرف الأوّل',
          example: `(4;6)\\to24\\ ;\\ (6;4)\\to${R('26')}`,
          trap: 'لا تبدّل $x$ و $y$',
          exam: 'اذكر قيمة كلّ حرف قبل الحساب',
          chip: `3x+2y=24`,
          quiz: [
            { q: '$(x;y)=(4;6)$ في $3x+2y$ نجد:', options: ['$24$', '$26$', '$20$'], correct: 0 },
            { q: '$(x;y)=(6;4)$ في $3x+2y$ نجد:', options: ['$26$', '$24$', '$22$'], correct: 0 },
          ],
        },
        predictPrompt: 'اختبرتَ مساواة بقيمتين $(4;6)$ ثمّ $(6;4)$ . هل يعطيان النتيجة نفسها؟ اكتب ما تتوقّعه ثمّ احسب.',
        summary: METHOD.solution[1],
        body: <p>{M(METHOD.solution[1])}</p>,
      },
      {
        id: 'qiyam-muhaqqiqa', type: 'methodes', title: 'القيم التي تحقّق المتباينة',
        memo: {
          rule: `4x-3\\le2x+7`,
          hook: 'نختبر كلّ قيمة معطاة وحدها',
          example: `x=5:\\ ${R('17')}\\le17`,
          trap: '$x=6$ لا تحقّق: $21\\le19$ خاطئة',
          exam: 'سجّل لكلّ قيمة: صحيحة أو خاطئة',
          chip: `4x-3\\le2x+7`,
          quiz: [
            { q: 'من بين $3$ و $4$ و $5$ و $6$ القيم التي تجعل $4x-3\\le2x+7$ صحيحة:', options: ['$3$ و $4$ و $5$', '$3$ و $4$ فقط', '$4$ و $5$ و $6$'], correct: 0 },
            { q: '$x=5$ في $4x-3\\le2x+7$ :', options: ['$17\\le17$ صحيحة', '$17\\le17$ خاطئة', '$17>17$ صحيحة'], correct: 0 },
          ],
        },
        predictPrompt: 'أعطيناك قيمًا معيّنة ومتباينة. كيف تعرف أيّ القيم تجعلها صحيحة؟ اكتب الطريقة.',
        summary: GUIDE.given,
        body: <div className="space-y-2"><p>{M(GUIDE.given)}</p><p className="text-sm text-slate-600">{M(METHOD.solution[2])}</p></div>,
      },
    ],
  },
};
