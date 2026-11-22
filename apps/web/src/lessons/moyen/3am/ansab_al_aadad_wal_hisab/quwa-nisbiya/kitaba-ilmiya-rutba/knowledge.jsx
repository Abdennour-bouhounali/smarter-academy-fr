import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « الكتابة العلمية ورتبة القدر » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 4–5 p. 44, طرائق et دوري الآن p. 45,
 * réécrits). Les puissances de 10 (leçons `quwa-adad-ashara` et `qawaid-quwa-ashara`), le مدوّر et la رتبة المقدار de 1AM ne sont PAS des items ici : ce sont des prérequis
 * (`priorKnowledge`), mesurés par « أستعدّ ». Le rappel de la 1AM est un encadré « تذكّر » du module 2, pas un item.
 */
const { sci, bracket, order, compare } = KNOWLEDGE;
const Box = ({ k }) => (
  <div className="space-y-2">
    <p><MathText>{k.text}</MathText></p>
    <p className="text-sm text-slate-600"><MathText>{k.example}</MathText></p>
  </div>
);

/** `memo` — la FICHE DE MÉMOIRE (MemoCard, prototype 2026-10-28) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'kitaba-ilmiya', type: 'regles', title: 'الكتابة العلمية',
        memo: {
          rule: `${R('a')}\\times10^{${R('n')}}`,
          hook: 'رقم واحد قبل الفاصلة',
          example: `265=${R('2{,}65')}\\times10^{${R('2')}}`,
          trap: 'ظنّ كل جداء مساوٍ كتابة علمية',
          exam: 'ضع رقمًا واحدًا قبل الفاصلة ثم اضبط الأسّ',
          chip: `${R('a')}\\times10^{n}`,
          quiz: [
            { q: '$A = 3520$ . كتابته العلمية هي:', options: ['$3{,}52\\times10^{3}$', '$35{,}2\\times10^{2}$', '$0{,}352\\times10^{4}$'], correct: 0 },
            { q: '$0{,}00047$ . كتابته العلمية هي:', options: ['$4{,}7\\times10^{-4}$', '$4{,}7\\times10^{-5}$', '$47\\times10^{-5}$'], correct: 0 },
          ],
        },
        predictPrompt: 'بطاقة المنارة وقفت على الدرجة $10^2$ وفي الخانة 2 فكُتبت $2{,}65 \\times 10^2$ ، ولم تُكتب $26{,}5 \\times 10^1$ . متى تكون الكتابة $a \\times 10^n$ هي الكتابة العلمية للبطاقة؟',
        summary: 'الكتابة العلمية: a × 10ⁿ حيث 1 ≤ a < 10 و n عدد صحيح نسبي.',
        body: <Box k={sci} />,
      },
      {
        id: 'hasr-quwatayn', type: 'regles', title: 'الحصر بين قوتين متتاليتين',
        memo: {
          rule: `10^{${R('n')}}\\le A<10^{${R('n+1')}}`,
          hook: 'الدرجة حصر بين قوتين',
          example: `10^{${R('2')}}\\le265<10^{${R('3')}}`,
          trap: 'خلط الحصر بعدد الأرقام',
          exam: 'اكتب الحصر بين قوتين متتاليتين للعدد عشرة',
          chip: `10^{n}\\le A<10^{n+1}`,
          quiz: [
            { q: 'حصر $4800$ بين قوتين متتاليتين للعدد $10$ :', options: ['$10^{3}\\le4800<10^{4}$', '$10^{4}\\le4800<10^{5}$', '$10^{2}\\le4800<10^{3}$'], correct: 0 },
            { q: 'حصر $0{,}03$ بين قوتين متتاليتين للعدد $10$ :', options: ['$10^{-2}\\le0{,}03<10^{-1}$', '$10^{-3}\\le0{,}03<10^{-2}$', '$10^{-1}\\le0{,}03<10^{0}$'], correct: 0 },
          ],
        },
        predictPrompt: 'بطاقة ورقة الكرّاس طولها 0,0001 م وقفت على الدرجة التي تبدأ عند $10^{-4}$ وتنتهي عند $10^{-3}$ . اكتب حصرها بين قوتين متتاليتين للعدد 10 .',
        summary: 'إذا كان A = a × 10ⁿ فإنّ 10ⁿ ≤ A < 10ⁿ⁺¹ : الدرجة هي الحصر.',
        body: <Box k={bracket} />,
      },
      {
        id: 'rutbat-qadr', type: 'regles', title: 'رتبة القدر',
        memo: {
          rule: `a\\times10^{n}\\to${R("a'")}\\times10^{n}`,
          hook: 'قرّب العدد الأول ولا تحذف',
          example: `2{,}65\\times10^{2}\\to${R('3')}\\times10^{2}`,
          trap: 'حذف ما بعد الفاصلة بدل التقريب',
          exam: 'اكتب رتبة القدر بعد تدوير العدد الأول',
          chip: `\\approx${R("a'")}\\times10^{n}`,
          quiz: [
            { q: 'رتبة قدر $4{,}7\\times10^{5}$ هي:', options: ['$5\\times10^{5}$', '$4\\times10^{5}$', '$1\\times10^{6}$'], correct: 0 },
            { q: 'رتبة قدر $9{,}6\\times10^{3}$ هي:', options: ['$1\\times10^{4}$', '$9\\times10^{3}$', '$1\\times10^{3}$'], correct: 0 },
          ],
        },
        predictPrompt: 'المغناطيس جذب بطاقة المنارة $2{,}65 \\times 10^2$ إلى التدريجة $3 \\times 10^2$ ، وجذب بطاقة الحافلة $1{,}95 \\times 10^6$ إلى $2 \\times 10^6$ . كيف نعيّن رتبة قدر عدد من كتابته العلمية؟',
        summary: 'رتبة قدر a × 10ⁿ هي a′ × 10ⁿ حيث a′ مدوّر a إلى الوحدة (و a′ = 10 تُكتب 1 × 10ⁿ⁺¹).',
        body: <Box k={order} />,
      },
      {
        id: 'muqarana-ilmiya', type: 'regles', title: 'مقارنة عددين بكتابتهما العلمية',
        memo: {
          rule: `${R('m')}>${R('n')}\\Rightarrow a\\times10^{m}>b\\times10^{n}`,
          hook: 'الدرجة الأعلى أكبر دائمًا',
          example: `9{,}8\\times10^{${R('-5')}}<1{,}2\\times10^{${R('-4')}}`,
          trap: 'مقارنة العددين الأولين وإهمال الأسّين',
          exam: 'قارن الأسّين أولًا ثم العددين عند التساوي',
          chip: `10^{m}>10^{n}`,
          quiz: [
            { q: 'أكبر العددين $3{,}2\\times10^{6}$ و $9{,}9\\times10^{5}$ هو:', options: ['$3{,}2\\times10^{6}$', '$9{,}9\\times10^{5}$', 'متساويان'], correct: 0 },
            { q: 'أيّهما أكبر: $7\\times10^{-3}$ أم $2\\times10^{-2}$ ؟', options: ['$2\\times10^{-2}$', '$7\\times10^{-3}$', 'متساويان'], correct: 0 },
          ],
        },
        predictPrompt: 'بطاقتان: $9{,}8 \\times 10^{-5}$ و $1{,}2 \\times 10^{-4}$ . أيّهما على الدرجة الأعلى؟ ماذا نقارن أوّلًا: الأسّين أم العددين $a$ ؟',
        summary: 'نقارن الأسّين أوّلًا: الأكبر أسّه أكبر ؛ وإذا تساوى الأسّان قارنّا العددين a.',
        body: <Box k={compare} />,
      },
    ],
    2: [
      {
        id: 'shart-ilmiya', type: 'regles', title: 'ما الذي يجعل الكتابة علمية؟',
        memo: {
          rule: `1\\le ${R('a')}<10`,
          hook: 'المساواة وحدها لا تكفي',
          example: `45\\times10^{-2}=${R('4{,}5')}\\times10^{-1}`,
          trap: 'قبول كتابة تساوي العدد وعددها الأول كبير',
          exam: 'تحقّق من العدد الأول قبل الأسّ',
          chip: `1\\le a<10`,
          quiz: [
            { q: 'أيّ الكتابات التالية علمية؟', options: ['$7{,}2\\times10^{4}$', '$72\\times10^{3}$', '$0{,}72\\times10^{5}$'], correct: 0 },
            { q: '$10\\times10^{3}$ ليست كتابة علمية لأنّ:', options: ['العدد الأول $10$ ليس أقل من $10$', 'الأسّ $3$ موجب', 'العدد الأول $10$ زوجي'], correct: 0 },
          ],
        },
        predictPrompt: 'حكمتَ على ست كتابات: قبلتَ $7{,}2 \\times 10^{4}$ و $1 \\times 10^{-6}$ و $9{,}99 \\times 10^{8}$ ورفضتَ $0{,}72 \\times 10^{5}$ و $10 \\times 10^{3}$ و $45 \\times 10^{-2}$ . ما الذي يجمع الكتابات المقبولة؟',
        summary: 'هي علمية إذا كان العدد الأوّل من 1 إلى أقل من 10 ؛ والمساواة وحدها لا تكفي.',
        body: <p><MathText>{'تساوي $45 \\times 10^{-2}$ العدد $0{,}45$ ، لكنّها ليست كتابة علمية لأنّ $45$ ليس من 1 إلى أقل من 10 ؛ وكتابته العلمية $4{,}5 \\times 10^{-1}$ .'}</MathText></p>,
      },
    ],
    3: [
      {
        id: 'tariqa-ilmiya', type: 'methodes', title: 'من عدد إلى كتابته العلمية وحصره ورتبة قدره',
        memo: {
          rule: `A=${R('a')}\\times10^{${R('n')}}`,
          hook: 'أزح الفاصلة ثم عدّ الخطوات',
          example: `47\\,300\\,000=${R('4{,}73')}\\times10^{${R('7')}}`,
          trap: 'خطأ في عدّ الخطوات يُنقص الأسّ',
          exam: 'اكتب الكتابة العلمية ثم الحصر ثم رتبة القدر',
          chip: `A=a\\times10^{n}`,
          quiz: [
            { q: 'الكتابة العلمية لـ $528\\times10^{-6}$ هي:', options: ['$5{,}28\\times10^{-4}$', '$5{,}28\\times10^{-8}$', '$5{,}28\\times10^{-6}$'], correct: 0 },
            { q: 'الكتابة العلمية لـ $47\\,300\\,000$ هي:', options: ['$4{,}73\\times10^{7}$', '$4{,}73\\times10^{8}$', '$473\\times10^{5}$'], correct: 0 },
          ],
        },
        predictPrompt: 'أمامك عدد مثل $47\\,300\\,000$ أو $528 \\times 10^{-6}$ . كيف تصل إلى كتابته العلمية، ثم إلى حصره ورتبة قدره؟',
        summary: 'نزيح الفاصلة (أو نكتب k علميًا ونجمع الأسّين)، ثم نقرأ الحصر من الأسّ، ونعطي رتبة القدر بتدوير a إلى الوحدة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD.decimal.rule}</MathText></p>
            <p><MathText>{METHOD.times.rule}</MathText></p>
            <p><MathText>{METHOD.bracket.rule}</MathText></p>
          </div>
        ),
      },
      {
        id: 'hisab-ilmiya', type: 'methodes', title: 'نحسب ثم نكتب النتيجة كتابة علمية',
        memo: {
          rule: `k\\times10^{p}=${R('a')}\\times10^{${R('n')}}`,
          hook: 'احسب ثم عدّل العدد والأسّ معًا',
          example: `0{,}6\\times10^{4}=${R('6')}\\times10^{${R('3')}}`,
          trap: 'تعديل العدد دون تعديل الأسّ',
          exam: 'أنهِ الحساب ثم اكتب الناتج كتابة علمية',
          chip: `k\\times10^{p}\\to a\\times10^{n}`,
          quiz: [
            { q: '$25\\times10^{3}\\times4\\times10^{2}$ تساوي:', options: ['$1\\times10^{7}$', '$1\\times10^{6}$', '$100\\times10^{5}$'], correct: 0 },
            { q: 'الكتابة العلمية لـ $0{,}5\\times10^{-3}$ هي:', options: ['$5\\times10^{-4}$', '$5\\times10^{-3}$', '$5\\times10^{-2}$'], correct: 0 },
          ],
        },
        predictPrompt: 'في عبارة فيها جداءات وقسمة على قوى العدد 10 ، ماذا تحسب أوّلًا؟ وماذا تفعل إن لم يكن العدد الأوّل من 1 إلى أقل من 10 ؟',
        summary: 'نحسب بالقواعد الثلاث، ثم نعدّل العدد الأوّل والأسّ معًا حتى تصير الكتابة علمية.',
        body: <p><MathText>{METHOD.compute.rule}</MathText></p>,
      },
    ],
  },
};
