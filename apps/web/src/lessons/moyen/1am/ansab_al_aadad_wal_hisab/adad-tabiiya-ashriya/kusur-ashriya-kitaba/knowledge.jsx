import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD_CONVERT, METHOD_SHIFT, GUIDE } from './content/textbook';

// La carte progressive de la leçon — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « الكسور العشرية والكتابة العشرية » (1AM) — SOURCE UNIQUE (content/textbook.js : les mots de la
 * plateforme, tirés de معارف 2, 3 et 4 (b), de طريقة 1 et 2 du manuel ; rien n'est copié au mot).
 */
/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'fasila-hajm', type: 'concepts', title: 'الفاصلة تحدّد حجم القطعة',
        memo: {
          rule: `235\\to 23{,}5\\to ${R('2{,}35')}`,
          hook: 'خطوة يمينًا: القطعة أصغر بعشر مرّات',
          example: `0{,}5=${R('10')}\\times 0{,}05`,
          trap: 'الفاصلة لا تغيّر الأرقام، بل ما يعدّه كل رقم',
          exam: 'حدّد ما يعدّه كل رقم من مكانه بالنسبة إلى الفاصلة',
          chip: `2{,}35\\to ${R('0{,}235')}`,
          quiz: [
            { q: 'أيّ عدد هو الأصغر؟', options: ['$0{,}235$', '$2{,}35$', '$23{,}5$'], correct: 0 },
            { q: '$0{,}5$ يساوي كم مرّة $0{,}05$ ؟', options: ['$10$', '$5$', '$100$'], correct: 0 },
          ],
        },
        predictPrompt: 'في لوحتك: الأرقام 2 و 3 و 5 صنعت طلبيات مختلفة جدًا كلما حرّكت الفاصلة. ماذا يتغيّر في القطعة التي يعدّها كل رقم حين تتحرّك الفاصلة خطوة نحو اليمين؟ اكتب ملاحظتك.',
        summary: 'الفاصلة هي التي تقول أيّ قطعة يعدّها كل رقم: الرقم الذي قبلها يعدّ وحدات كاملة، وكل خطوة نحو اليمين تجعل القطعة أصغر بعشر مرّات.',
        body: (
          <div className="space-y-2">
            <p><MathText>{'2 ، 3 ، 5 : $235$ لوحة ، $23{,}5$ ، $2{,}35$ ، $0{,}235$ — الأرقام لم تتغيّر، والقطعة التي يعدّها كل رقم هي التي تغيّرت.'}</MathText></p>
          </div>
        ),
      },
      {
        id: 'kasr-ashri', type: 'concepts', title: 'الكسر العشري',
        memo: {
          rule: `0{,}1=\\dfrac{1}{${R('10')}},\\ \\ 0{,}01=\\dfrac{1}{${R('100')}}`,
          hook: 'مقامه 10 أو 100 أو 1000',
          example: `\\dfrac{3}{10}=\\dfrac{${R('30')}}{100}`,
          trap: 'العُشر عشرة أجزاء من مائة، لا جزء واحد',
          exam: 'مقام الكسر العشري: 1 متبوع بأصفار فقط',
          chip: `\\tfrac{1}{${R('10')}}`,
          quiz: [
            { q: 'أيّ كسر هو كسر عشري؟', options: ['$\\frac{7}{100}$', '$\\frac{7}{20}$', '$\\frac{10}{7}$'], correct: 0 },
            { q: '$\\frac{4}{10}$ يساوي:', options: ['$\\frac{40}{100}$', '$\\frac{4}{100}$', '$\\frac{400}{100}$'], correct: 0 },
          ],
        },
        predictPrompt: 'العمود الواحد من لوحة الزليج هو عشرة بلاطات متقايسة، والبلاطة قطعة من مائة. بأيّ كسر نكتب العمود الواحد من اللوحة؟ وبأيّ كسر نكتب البلاطة الواحدة؟ وكم بلاطة في ثلاثة أعمدة؟',
        summary: 'الكسر العشري كسر مقامه 10 أو 100 أو 1000 …: العُشر $\\frac{1}{10}$ والجزء من مائة $\\frac{1}{100}$ والجزء من ألف $\\frac{1}{1000}$ ؛ وكل عُشر يساوي عشرة أجزاء من مائة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.decimalFraction.definition}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.decimalFraction.equal}</MathText></p>
          </div>
        ),
      },
      {
        id: 'kitaba-bifasila', type: 'regles', title: 'الأرقام بعد الفاصلة وأصفار المقام',
        memo: {
          rule: `a{,}${R('bc')}=\\dfrac{\\overline{abc}}{1${R('00')}}`,
          hook: 'رقمان بعد الفاصلة: صفران',
          example: `3{,}${R('125')}=\\dfrac{3125}{1${R('000')}}`,
          trap: 'أصفار المقام بقدر الأرقام بعد الفاصلة، لا أكثر ولا أقل',
          exam: 'عُدّ الأرقام بعد الفاصلة، ثم اكتب بقدرها أصفارًا',
          chip: `\\tfrac{\\overline{abc}}{1${R('00')}}`,
          quiz: [
            { q: '$0{,}07$ يساوي:', options: ['$\\frac{7}{100}$', '$\\frac{7}{10}$', '$\\frac{7}{1000}$'], correct: 0 },
            { q: '$\\frac{605}{100}$ يساوي:', options: ['$6{,}05$', '$60{,}5$', '$0{,}605$'], correct: 0 },
          ],
        },
        predictPrompt: 'في الوصل 3125/1000 وضعتَ الفاصلة حتى طابق الطلب. كم رقمًا بعد الفاصلة؟ وكم صفرًا في المقام 1000؟ ما العلاقة بينهما؟ اكتب القاعدة بكلماتك.',
        summary: 'عدد الأرقام بعد الفاصلة هو عدد أصفار المقام: $2{,}35=\\frac{235}{100}$ (رقمان، صفران) ؛ والعدد المكتوب بلا فاصلة هو البسط.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.comma.rule}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'mafkuk-ashri', type: 'concepts', title: 'المفكوك النموذجي لعدد عشري',
        memo: {
          rule: `a{,}bc=a+\\dfrac{${R('b')}}{10}+\\dfrac{${R('c')}}{100}`,
          hook: 'كل رقم على مقام مرتبته',
          example: `2{,}35=2+\\dfrac{${R('3')}}{10}+\\dfrac{${R('5')}}{100}`,
          trap: 'لا تكتب 35 على 10: كل رقم وحده على مقام مرتبته',
          exam: 'الأعشار على 10، والأجزاء من مائة على 100',
          chip: `a+\\tfrac{${R('b')}}{10}+\\dots`,
          quiz: [
            { q: 'مفكوك $4{,}07$ :', options: ['$4+\\frac{7}{100}$', '$4+\\frac{7}{10}$', '$4+\\frac{70}{10}$'], correct: 0 },
            { q: '$3+\\frac{2}{10}+\\frac{9}{100}$ يساوي:', options: ['$3{,}29$', '$3{,}92$', '$32{,}9$'], correct: 0 },
          ],
        },
        predictPrompt: 'العدد 2,35 هو لوحتان وثلاثة أعمدة وخمس بلاطات. اكتبه على شكل مجموع عدد طبيعي وكسور عشرية، حدٌّ لكل نوع من القطع.',
        summary: 'المفكوك النموذجي لعدد عشري مجموع لعدد طبيعي وكسور عشرية: $2{,}35=2+\\frac{3}{10}+\\frac{5}{100}=2+3\\times0{,}1+5\\times0{,}01$ ؛ ولا حدّ للرقم 0.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.expansion.definition}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.expansion.order}</MathText></p>
          </div>
        ),
      },
      {
        id: 'asfar-ghayr-darurya', type: 'regles', title: 'الأصفار غير الضرورية',
        memo: {
          rule: `a{,}b${R('0')}=a{,}b`,
          hook: 'الصفر الأخير لا يعدّ شيئًا',
          example: `3{,}4${R('0')}=3{,}4,\\ \\ 0{,}${R('0')}5\\neq 0{,}5`,
          trap: 'لا تحذف صفرًا يليه رقم: 0,05 ليس 0,5',
          exam: 'احذف أصفار آخر الجزء العشري فقط',
          chip: `2{,}5${R('0')}=2{,}5`,
          quiz: [
            { q: 'أيّ كتابة تساوي $7{,}3$ ؟', options: ['$7{,}30$', '$7{,}03$', '$70{,}3$'], correct: 0 },
            { q: 'أيّ صفر يمكن حذفه؟', options: ['صفر $5{,}60$', 'صفر $5{,}06$', 'صفر $50{,}6$'], correct: 0 },
          ],
        },
        predictPrompt: 'في الورشة رأيتَ أنّ 2,50 و 2,5 يملآن الطاولة نفسها، وأنّ الصفر في 0,05 لا يمكن حذفه. متى يمكن حذف صفر من عدد عشري دون أن يتغيّر؟ ومتى لا يمكن؟ اكتب القاعدة.',
        summary: 'الصفر الأخير بعد الفاصلة لا يغيّر العدد ($3{,}40=3{,}4$) ؛ والصفر الذي يليه رقم يحفظ مرتبة فارغة ولا يُحذف ($0{,}05\\neq0{,}5$).',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.zeros.trailing}</MathText></p>
          </div>
        ),
      },
      {
        id: 'adad-al-aashar', type: 'concepts', title: 'رقم الأعشار وعدد الأعشار', predict: false,
        memo: {
          rule: `\\overline{a{,}bc}\\to ${R('\\overline{ab}')}`,
          hook: 'العدد: احذف ما بعد الأعشار',
          example: `2{,}35\\to ${R('23')}`,
          trap: 'رقم الأعشار 3 ليس عدد الأعشار 23',
          exam: 'رقم الأعشار هو أوّل رقم بعد الفاصلة',
          chip: `2{,}35\\to ${R('23')}`,
          quiz: [
            { q: 'عدد الأعشار في $5{,}61$ :', options: ['$56$', '$6$', '$561$'], correct: 0 },
            { q: 'رقم الأعشار في $5{,}61$ :', options: ['$6$', '$56$', '$1$'], correct: 0 },
          ],
        },
        summary: 'رقم الأعشار هو الرقم الأول بعد الفاصلة، وعدد الأعشار هو عدد الأجزاء من عشرة في العدد كله: في $2{,}35$ الرقم 3 والعدد 23.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.count.text}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqat-intiqal', type: 'methodes', title: 'من الفاصلة إلى الكسر وبالعكس',
        memo: {
          rule: `0{,}${R('052')}=\\dfrac{52}{1${R('000')}}`,
          hook: 'عُدّ، ثم اكتب الأصفار',
          example: `\\dfrac{3125}{1${R('000')}}=3{,}${R('125')}`,
          trap: 'في 52 على 1000 تلزم ثلاثة أرقام بعد الفاصلة: 0,052',
          exam: 'اكتب بعد الفاصلة أرقامًا بقدر أصفار المقام',
          chip: `\\tfrac{52}{1000}=${R('0{,}052')}`,
          quiz: [
            { q: '$\\frac{52}{1000}$ يساوي:', options: ['$0{,}052$', '$0{,}52$', '$5{,}2$'], correct: 0 },
            { q: '$31{,}25$ يساوي:', options: ['$\\frac{3125}{100}$', '$\\frac{3125}{1000}$', '$\\frac{3125}{10}$'], correct: 0 },
          ],
        },
        predictPrompt: 'لتكتب 31,25 كسرًا عشريًا: ماذا تعدّ بعد الفاصلة؟ وماذا تكتب في البسط وماذا في المقام؟ ولتكتب 9345/1000 بالفاصلة: ماذا تعدّ في المقام؟ اكتب الطريقة.',
        summary: 'من الكتابة العشرية إلى الكسر: نعدّ الأرقام بعد الفاصلة فنكتب 1 متبوعًا بعددها من الأصفار في المقام، وبسطه العدد بلا فاصلة. ومن الكسر إلى الفاصلة: نعدّ أصفار المقام ونعدّ بقدرها أرقامًا من اليمين.',
        body: (
          <div className="space-y-2">
            {METHOD_CONVERT.solution.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-600">{METHOD_CONVERT.rule}</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'azaha-fasila', type: 'regles', title: 'إزاحة الفاصلة',
        memo: {
          rule: `3{,}5\\times 1${R('00')}=35${R('0')}`,
          hook: 'كل صفر: مرتبة واحدة',
          example: `3{,}5\\div 1${R('00')}=${R('0{,}0')}35`,
          trap: 'الضرب في 10 لا يضيف صفرًا: الفاصلة هي التي تنتقل',
          exam: 'الضرب: الفاصلة يمينًا؛ القسمة: يسارًا؛ املأ الفراغ بأصفار',
          chip: `3{,}5\\times 10=${R('35')}`,
          quiz: [
            { q: '$4{,}7\\times 100$ يساوي:', options: ['$470$', '$4{,}700$', '$47$'], correct: 0 },
            { q: '$56{,}8\\div 1000$ يساوي:', options: ['$0{,}0568$', '$0{,}568$', '$5{,}68$'], correct: 0 },
          ],
        },
        predictPrompt: 'في الآلة: ×10 و ×100 و ×1000 تجعل الأرقام تعدّ قطعًا أكبر، و ÷10 و ÷100 و ÷1000 تجعلها أصغر. إلى أيّ جهة تتحرّك الفاصلة في كل حالة؟ وكم مرتبة؟ وماذا نكتب حين لا يبقى رقم؟',
        summary: 'الضرب في 10 أو 100 أو 1000 يزيح الفاصلة مرتبة أو مرتبتين أو ثلاثًا نحو اليمين، والقسمة عليها نحو اليسار، ونكتب أصفارًا في المراتب الجديدة الفارغة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.shift.rule}</MathText></p>
            <p className="text-sm text-slate-600">{METHOD_SHIFT.rule}</p>
          </div>
        ),
      },
      {
        id: 'darb-juz-ashar', type: 'regles', title: 'الضرب في 0,1 و 0,01 و 0,001',
        memo: {
          rule: `x\\times 0{,}${R('1')}=x\\div 1${R('0')}`,
          hook: 'الضرب في عُشر قسمة على 10',
          example: `27{,}5\\times 0{,}1=${R('2{,}75')}`,
          trap: 'الضرب في 0,1 لا يكبّر العدد بل يصغّره',
          exam: 'حوّل الضرب في 0,1 إلى قسمة على 10',
          chip: `\\times 0{,}1=${R('\\div 10')}`,
          quiz: [
            { q: '$0{,}6\\times 0{,}01$ يساوي:', options: ['$0{,}006$', '$60$', '$0{,}06$'], correct: 0 },
            { q: '$43\\times 0{,}1$ يساوي:', options: ['$4{,}3$', '$430$', '$0{,}43$'], correct: 0 },
          ],
        },
        predictPrompt: 'نعلم أنّ 0,1 هو العُشر. ماذا يعطي ضرب عدد في 0,1؟ هل يكبر أم يصغر؟ إلى أيّ جهة تتحرّك الفاصلة؟ اكتب ما تتوقّعه.',
        summary: 'الضرب في 0,1 أو 0,01 أو 0,001 هو القسمة على 10 أو 100 أو 1000، أي إزاحة الفاصلة نحو اليسار.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.shift.byTenth}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.addZero.right}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
