import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, RANKS, DECOMPOSITION, METHOD, BIG, GUIDE } from './content/textbook';

// La carte progressive de la leçon — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « كتابة الأعداد الطبيعية ودلالة الأرقام » (1AM) — SOURCE UNIQUE (content/textbook.js : معارف 1
 * p. 11, معارف 4 (a) p. 13, l'échange dix pour un découvert au labo, le مفكوك d'un entier et « رقم / عدد » déclarés).
 */
/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'tabadul', type: 'concepts', title: 'عشرة بواحدة',
        memo: {
          rule: `10\\times 10=${R('100')}`,
          hook: 'عشرة هنا = واحدة على اليسار',
          example: `37=${R('3')}\\times 10+7`,
          trap: 'عمود فيه 10 أو أكثر لا يُكتب في خانة واحدة: اربط أوّلًا',
          exam: 'كل مرتبة تحمل رقمًا واحدًا من 0 إلى 9',
          chip: `10\\to${R('1')}`,
          quiz: [
            { q: 'في عمود 23 قطعة. بعد ربط كل عشرة يبقى فيه:', options: ['$3$', '$23$', '$2$'], correct: 0 },
            { q: '10 مئات تساوي:', options: ['ألفًا واحدًا', 'عشرة واحدة', 'مئة واحدة'], correct: 0 },
          ],
        },
        predictPrompt: 'في الورشة ربطت أقلامًا وحزمًا وعلبًا، ثم لم تستطع كتابة العدد إلّا بعد أن انتهيت. ما القاعدة التي تربط مرتبة بالمرتبة التي على يسارها؟ ومتى نستطيع أن نكتب رقمًا في عمود؟ اكتبها بكلماتك.',
        summary: 'كل 10 وحدات من مرتبة تساوي وحدة واحدة من المرتبة التي على يسارها. لذلك لا تحمل أيّ مرتبة أكثر من 9: رقمها هو ما يبقى فيها بعد الربط.',
        body: (
          <div className="space-y-2">
            <p><MathText>{'10 آحاد = عشرة ، 10 عشرات = مئة ، 10 مئات = ألف ، 10 آلاف = عشرة آلاف …'}</MathText></p>
            <p className="text-sm text-slate-600">{GUIDE.concat.right}</p>
          </div>
        ),
      },
      {
        id: 'qima-mawdi', type: 'concepts', title: 'قيمة الرقم حسب موقعه', predict: false,
        memo: {
          rule: `d\\times ${R('10')}=10d`,
          hook: 'نفس الرقم، قيمة أخرى',
          example: `2577:\\ 7\\times ${R('10')}=70,\\ \\ 7\\times 1=7`,
          trap: 'الرقم 7 في مرتبة العشرات لا يعدّ 7 بل 70',
          exam: 'حدّد مرتبة الرقم أوّلًا ثم أعطِ قيمته',
          chip: `d\\times ${R('10')}`,
          quiz: [
            { q: 'في $4382$ قيمة الرقم $3$ هي:', options: ['$300$', '$3$', '$30$'], correct: 0 },
            { q: 'في $555$ الرقم $5$ الذي على اليسار يعدّ:', options: ['$500$', '$5$', '$50$'], correct: 0 },
          ],
        },
        summary: 'يأخذ كل رقم معناه تبعًا لموقعه: في 2577 الرقم 7 الذي في مرتبة الآحاد يمثّل 7، والرقم 7 الذي في مرتبة العشرات يمثّل 70.',
        body: (
          <div className="space-y-2">
            <p>{RANKS.box}</p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'fiaat', type: 'regles', title: 'القراءة فئةً فئةً',
        memo: {
          rule: `${R('4')}\\quad 908\\quad ${R('732')}`,
          hook: 'ثلاثةً ثلاثةً من اليمين',
          example: `45\\,671\\to 45\\quad ${R('671')}`,
          trap: 'لا تبدأ التجزئة من اليسار: 456 71 خطأ',
          exam: 'اترك فراغًا بين الفئات، واقرأ كل فئة ثم اسمها',
          chip: `\\square\\;${R('\\square\\square\\square')}`,
          quiz: [
            { q: 'التجزئة الصحيحة لـ $56789$ :', options: ['$56\\quad 789$', '$567\\quad 89$', '$5\\quad 6789$'], correct: 0 },
            { q: 'كم فئة في $2040300$ ؟', options: ['$3$', '$7$', '$2$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تقرأ 4908732 دون أن تخطئ؟ أين تترك فراغًا، ومن أيّ جهة تبدأ؟ وكيف تقرأ كل جزء؟ اكتب القاعدة بكلماتك.',
        summary: 'لقراءة عدد طبيعي كبير وكتابته نجزّئه إلى فئات من ثلاثة أرقام مبتدئين من اليمين (فئة الوحدات، فئة الآلاف، فئة الملايين، …)، ونقرأ كل فئة ثم اسمها.',
        body: (
          <div className="space-y-2">
            <p>{KNOWLEDGE.reading}</p>
            {KNOWLEDGE.readingExamples.map((e) => (
              <p key={e.raw} className="text-sm text-slate-600"><MathText>{`$${e.raw} = ${e.spaced}$ : ${e.words}`}</MathText></p>
            ))}
          </div>
        ),
      },
      {
        id: 'jadwal-maratib', type: 'concepts', title: 'جدول المراتب', predict: false,
        memo: {
          rule: `6\\,${R('3')}92{,}${R('4')}59`,
          hook: 'العشرات قبل الفاصلة، الأعشار بعدها',
          example: `2\\,${R('0')}17`,
          trap: 'أوّل رقم بعد الفاصلة هو الأعشار، لا العشرات',
          exam: 'عُدّ المراتب من الفاصلة: يسارًا للأعداد الكبيرة، يمينًا للأجزاء',
          chip: `\\square\\,${R('\\square')}\\,\\square\\,\\square`,
          quiz: [
            { q: 'رقم العشرات في $6392{,}459$ :', options: ['$9$', '$4$', '$3$'], correct: 0 },
            { q: 'رقم الأعشار في $6392{,}459$ :', options: ['$4$', '$9$', '$5$'], correct: 0 },
          ],
        },
        summary: 'في جدول المراتب نقرأ رقم كل مرتبة: الآحاد، العشرات، المئات، الآلاف، … وبعد الفاصلة الأعشار (الأجزاء من عشرة)، الأجزاء من مائة، الأجزاء من ألف.',
        body: (
          <div className="space-y-2">
            <p>{RANKS.box}</p>
            <p className="text-sm text-slate-600"><MathText>{`$${RANKS.number}$ : ${RANKS.roles}`}</MathText></p>
          </div>
        ),
      },
      {
        id: 'mafkuk', type: 'regles', title: 'المفكوك النموذجي لعدد طبيعي',
        memo: {
          rule: `\\overline{ab}=${R('a')}\\times 10+${R('b')}`,
          hook: 'كل رقم في قيمة مرتبته',
          example: `604=6\\times 100+${R('0\\times 10')}+4`,
          trap: 'لا تجمع الأرقام وحدها: 2 + 0 + 1 + 7 ليس 2017',
          exam: 'اكتب كل رقم مضروبًا في قيمة مرتبته، واجمع',
          chip: `${R('a')}\\times 1000+\\dots`,
          quiz: [
            { q: 'المفكوك النموذجي لـ $604$ :', options: ['$6\\times 100+4$', '$6+0+4$', '$6\\times 10+4$'], correct: 0 },
            { q: '$3\\times 1000+5\\times 10+2$ يساوي:', options: ['$3052$', '$352$', '$3502$'], correct: 0 },
          ],
        },
        predictPrompt: 'في جدول المراتب، 6 في مرتبة الآلاف و 3 في مرتبة المئات و 9 في العشرات و 2 في الآحاد. اكتب 6392 مجموعًا يُظهر قيمة كل رقم.',
        summary: 'كل عدد طبيعي هو مجموع جداءات أرقامه في قيم مراتبها: $6\\,392 = 6 \\times 1000 + 3 \\times 100 + 9 \\times 10 + 2$ — المفكوك النموذجي.',
        body: (
          <div className="space-y-2">
            <p>{DECOMPOSITION.text}</p>
            <p><MathText>{DECOMPOSITION.example}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{DECOMPOSITION.zero}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'raqm-adad', type: 'methodes', title: 'رقم المرتبة وعدد وحداتها',
        memo: {
          rule: `\\overline{${R('ab')}c}=${R('ab')}\\times 10+c`,
          hook: 'العدد: احذف ما على اليمين',
          example: `2017=${R('201')}\\times 10+7`,
          trap: 'رقم المئات ليس عدد المئات: في 1345 الرقم 3 والعدد 13',
          exam: 'عدد المئات: نحذف رقمَي العشرات والآحاد ونقرأ ما يبقى',
          chip: `${R('\\overline{abc}')}\\times 100`,
          quiz: [
            { q: 'عدد العشرات في $2017$ :', options: ['$201$', '$1$', '$20$'], correct: 0 },
            { q: 'رقم المئات في $1345$ :', options: ['$3$', '$13$', '$4$'], correct: 0 },
          ],
        },
        predictPrompt: 'في الدكّان عوّضت 1345 دج بأوراق من 100 دج فأخذت 13 ورقة، مع أنّ رقم المئات في 1345 هو 3. كيف نقرأ عدد المئات مباشرة من كتابة العدد؟ اكتب الطريقة.',
        summary: 'رقم المرتبة هو الرقم المكتوب في موقعها؛ عدد وحداتها هو العدد الذي نقرؤه بعد حذف الأرقام التي على يمينها: في 2017 رقم العشرات 1 وعدد العشرات 201.',
        body: (
          <div className="space-y-2">
            <p>{METHOD.box}</p>
            <p className="text-sm text-slate-600"><MathText>{'$1345 = 13 \\times 100 + 45$ ، $2017 = 201 \\times 10 + 7$'}</MathText></p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'malyun-milyar', type: 'concepts', title: 'المليون والمليار', predict: false,
        memo: {
          rule: `${R('10^6')}=10^3\\times 10^3`,
          hook: 'ألف ألف: مليون',
          example: `1\\,000\\,000\\,000=1000\\times ${R('1\\,000\\,000')}`,
          trap: 'المليار ألف مليون، لا مئة مليون',
          exam: 'عُدّ الأصفار: 6 للمليون و 9 للمليار',
          chip: `${R('1\\,000\\,000')}`,
          quiz: [
            { q: 'كم صفرًا في كتابة المليار؟', options: ['$9$', '$6$', '$12$'], correct: 0 },
            { q: 'ألف مليون يساوي:', options: ['مليارًا', 'مليونًا', 'ألف ألف'], correct: 0 },
          ],
        },
        summary: 'المليون يساوي ألف ألف: $1\\,000\\,000$ ؛ المليار يساوي ألف مليون: $1\\,000\\,000\\,000$.',
        body: (
          <div className="space-y-2">
            {BIG.facts.map((f) => <p key={f}>{f}</p>)}
            <p className="text-sm text-slate-600"><MathText>{'$1\\,000\\,000$ (مليون) ، $1\\,000\\,000\\,000$ (مليار)'}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
