import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD_COMPARE } from './content/textbook';

// La carte progressive de la leçon — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « مقارنة الأعداد العشرية وترتيبها » (1AM) — SOURCE UNIQUE (content/textbook.js : les mots de la plateforme,
 * tirés de معارف 6 et 7, de طريقة 3 et de نشاط 5 du manuel ; rien n'est copié au mot).
 */
/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'taqarun-rutab', type: 'regles', title: 'المقارنة رتبةً برتبة',
        memo: {
          rule: `${R('b')}>${R('c')}\\Rightarrow a{,}${R('b')}>a{,}${R('c')}`,
          hook: 'أوّل فرق من اليسار يحسم',
          example: `4{,}${R('6')}>4{,}${R('3')}5`,
          trap: '35 أكبر من 6، لكنّ 4,35 أصغر من 4,6',
          exam: 'قارن الجزأين الصحيحين، ثم الأعشار، ثم الأجزاء من مائة',
          chip: `4{,}${R('6')}>4{,}${R('3')}5`,
          quiz: [
            { q: 'أيّ كتابة صحيحة؟', options: ['$8{,}05<8{,}5$', '$8{,}05>8{,}5$', '$8{,}05=8{,}5$'], correct: 0 },
            { q: 'الأكبر بين $9{,}87$ و $10{,}2$ :', options: ['$10{,}2$', '$9{,}87$', 'متساويان'], correct: 0 },
          ],
        },
        predictPrompt: 'على المسطرة فصلتَ بين قفزتين: 4,6 م و 4,35 م. بأيّ رقم من الرقمين تمكّنتَ من معرفة الأبعد؟ وبأيّ رتبة بدأتَ؟ اكتب كيف تقارن عددين عشريين.',
        summary: 'نقارن الجزأين الصحيحين أوّلًا؛ فإن تساويا قارنّا رقمي الأعشار، ثم الأجزاء من مائة، وهكذا: أوّل رتبة يختلف فيها الرقمان تحسم المقارنة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.wholeParts.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.rankByRank.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'itmam-asfar', type: 'methodes', title: 'إتمام الأرقام بأصفار غير ضرورية',
        memo: {
          rule: `a{,}b=a{,}b${R('0')}`,
          hook: 'أتمم بأصفار، ثم قارن',
          example: `4{,}6${R('0')}>4{,}35`,
          trap: 'الصفر يُضاف في آخر الجزء العشري فقط، لا في وسطه',
          exam: 'اجعل للعددين عدد الأرقام نفسه بعد الفاصلة',
          chip: `4{,}6=4{,}6${R('0')}`,
          quiz: [
            { q: 'لنقارن $2{,}5$ و $2{,}47$ نكتب $2{,}5$ هكذا:', options: ['$2{,}50$', '$2{,}05$', '$20{,}5$'], correct: 0 },
            { q: '$7{,}3$ و $7{,}30$ :', options: ['متساويان', '$7{,}30$ أكبر', '$7{,}3$ أكبر'], correct: 0 },
          ],
        },
        predictPrompt: 'قفزتان طولهما 12,70 م و 12,7 م: ماذا لاحظتَ على المسطرة؟ وكيف يمكن أن نقارن 4,6 و 4,35 بعدد واحد من الأرقام بعد الفاصلة في الكتابتين؟ اكتب ما تفعله.',
        summary: 'نتمّ العددين بأصفار غير ضرورية حتى يكون لهما عدد الأرقام نفسه بعد الفاصلة ($4{,}6=4{,}60$)، فنقارن عددين طبيعيين من القطع نفسها: 60 جزءًا من مائة و 35 جزءًا من مائة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.zeros.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.trap.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'tartib-silsila', type: 'concepts', title: 'ترتيب سلسلة أعداد عشرية',
        memo: {
          rule: `a${R('<')}b${R('<')}c`,
          hook: 'تصاعديًا: الأصغر أوّلًا',
          example: `6{,}98${R('<')}7{,}04${R('<')}7{,}4`,
          trap: 'الترتيب لا يتبع طول الكتابة، بل قيمة العدد',
          exam: 'أتمم بالأصفار، ثم رتّب، ثم اكتب السلسلة بالرمز',
          chip: `a${R('<')}b${R('<')}c`,
          quiz: [
            { q: 'الترتيب التصاعدي لـ $0{,}5$ و $0{,}45$ و $0{,}05$ :', options: ['$0{,}05<0{,}45<0{,}5$', '$0{,}5<0{,}45<0{,}05$', '$0{,}45<0{,}05<0{,}5$'], correct: 0 },
            { q: 'أوّل عدد في الترتيب التنازلي لـ $3$ و $2{,}99$ و $3{,}01$ :', options: ['$3{,}01$', '$3$', '$2{,}99$'], correct: 0 },
          ],
        },
        predictPrompt: 'على منصّة التتويج وضعتَ خمس قفزات من الأقصر إلى الأبعد. كيف قرّرتَ أيّ القفزتين تأتي قبل الأخرى؟ وما التدريج الذي اخترتَه لقراءة السلسلة كلها؟',
        summary: 'لترتيب سلسلة نختار عدد أرقام بعد الفاصلة يكفي لها كلها (نتمّ بأصفار)، ثم نقارن مثنى مثنى: الأصغر أوّلًا في الترتيب التصاعدي، والأكبر أوّلًا في التنازلي.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.order.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.order.how}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'ramz-muqarana', type: 'concepts', title: 'الرمزان < و > وقراءتهما', predict: false,
        memo: {
          rule: `a${R('<')}b\\iff b${R('>')}a`,
          hook: 'الفم مفتوح نحو الأكبر',
          example: `4{,}35${R('<')}4{,}6`,
          trap: 'رأس الرمز المدبّب يشير دائمًا إلى العدد الأصغر',
          exam: 'اقرأ < « أصغر من » و > « أكبر من »',
          chip: `a${R('<')}b`,
          quiz: [
            { q: 'أكمل بالرمز: $7{,}1\\ \\square\\ 7{,}09$', options: ['$>$', '$<$', '$=$'], correct: 0 },
            { q: '$4{,}6>4{,}35$ تعني أيضًا:', options: ['$4{,}35<4{,}6$', '$4{,}35>4{,}6$', '$4{,}6<4{,}35$'], correct: 0 },
          ],
        },
        summary: 'الرمز $<$ أو $>$ يفتح فمه نحو العدد الأكبر: $4{,}35<4{,}6$ تُقرأ «أصغر من»، و $4{,}6>4{,}35$ تُقرأ «أكبر من» وهما تعنيان الشيء نفسه.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.symbols.definition}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqat-muqarana', type: 'methodes', title: 'أقارن وأرتّب',
        memo: {
          rule: `23{,}${R('4')}8<23{,}${R('5')}0`,
          hook: 'الصحيح أوّلًا، ثم الأعشار',
          example: `30{,}98<31{,}${R('0')}2<31{,}${R('2')}`,
          trap: 'لا تنسَ الجزء الصحيح: 30,98 أصغر من 31,02',
          exam: 'قارن مثنى مثنى، ثم اكتب السلسلة كاملة بالرمز نفسه',
          chip: `23{,}${R('4')}8<23{,}${R('5')}`,
          quiz: [
            { q: 'الأكبر بين $0{,}58$ و $0{,}6$ و $0{,}508$ :', options: ['$0{,}6$', '$0{,}58$', '$0{,}508$'], correct: 0 },
            { q: 'قارن $15{,}04$ و $15{,}4$ :', options: ['$15{,}04<15{,}4$', '$15{,}04>15{,}4$', '$15{,}04=15{,}4$'], correct: 0 },
          ],
        },
        predictPrompt: 'لمقارنة 23,48 و 23,5 ثم لترتيب أربعة أعداد جزؤها الصحيح 23 أو 19: بماذا تبدأ؟ وماذا تفعل إن تساوى الجزآن الصحيحان؟ اكتب الطريقة.',
        summary: 'الجزآن الصحيحان أوّلًا؛ إن تساويا قارنّا الأرقام رتبةً برتبة من الأعشار (أو أتممنا بأصفار)؛ ولترتيب سلسلة نقارنها مثنى مثنى ثم نكتبها بالرمز $<$ أو $>$ .',
        body: (
          <div className="space-y-2">
            {METHOD_COMPARE.solution.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-600">{METHOD_COMPARE.rule}</p>
          </div>
        ),
      },
    ],
  },
};
