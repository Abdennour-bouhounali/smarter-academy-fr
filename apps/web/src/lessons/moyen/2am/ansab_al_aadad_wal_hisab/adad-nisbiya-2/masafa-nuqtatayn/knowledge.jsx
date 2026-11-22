import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « المسافة بين نقطتين على مستقيم مدرّج » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف p. 44 réécrit, طريقة de la plateforme).
 * Les termes (الفاصلة الكبرى والصغرى, المسافة) sont NOMMÉS en معارف, après le labo.
 */
const { rule, positive, atDistance, midpoint } = KNOWLEDGE;

/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'masafa-abr-sifr', type: 'regles', title: 'المسافة عبر الصفر',
        memo: {
          rule: `${R('4')}+${R('9')}=13`,
          hook: 'خرزتان على جانبي الصفر: نضمّ الجزأين',
          example: `(-4)\\to(+9):\\ ${R('4')}+${R('9')}`,
          trap: 'لا نطرح الجزأين حين نعبر الصفر',
          exam: 'ارسم الصفر بين النقطتين واجمع الجزأين',
          chip: `${R('4')}+${R('9')}`,
          quiz: [
            { q: 'المسافة بين $-3$ و $+8$ :', options: ['$11$', '$5$', '$-11$'], correct: 0 },
            { q: 'المسافة بين $-6$ و $+2$ :', options: ['$8$', '$4$', '$-8$'], correct: 0 },
          ],
        },
        predictPrompt: 'فتحتَ المسماك من خرزة تحت الصفر إلى خرزة فوقه. اكتب كيف حسبتَ الفتحة بكلماتك.',
        summary: 'المسافة بين نقطتين على جانبي الصفر مجموع بُعديهما عن الصفر : من −4 إلى +9 تساوي 4 + 9 = 13 .',
        body: <p><MathText>{GUIDE.subDist.why}</MathText> <MathText>{GUIDE.subDist.right}</MathText></p>,
      },
      {
        id: 'masafa-nafs-jiha', type: 'regles', title: 'المسافة في جهة واحدة من الصفر',
        memo: {
          rule: `${R('7')}-${R('2')}=5`,
          hook: 'خرزتان في جهة واحدة: نطرح بُعديهما',
          example: `(-7)\\to(-2):\\ ${R('7')}-${R('2')}`,
          trap: 'لا نجمع بُعدين في جهة واحدة',
          exam: 'اسأل : هل الخرزتان على جانبي الصفر أم في جهة واحدة ؟',
          chip: `${R('7')}-${R('2')}`,
          quiz: [
            { q: 'المسافة بين $-9$ و $-4$ :', options: ['$5$', '$13$', '$-5$'], correct: 0 },
            { q: 'المسافة بين $+3$ و $+11$ :', options: ['$8$', '$14$', '$-8$'], correct: 0 },
          ],
        },
        predictPrompt: 'خرزتا سطيف وباتنة تحت الصفر معًا. كيف حسبتَ فتحة المسماك بينهما ؟',
        summary: 'إذا كانت النقطتان في جهة واحدة من الصفر فالمسافة بينهما الفارق بين بُعديهما عن الصفر : من −7 إلى −2 تساوي 7 − 2 = 5 .',
        body: <p><MathText>{GUIDE.addSame.why}</MathText> <MathText>{GUIDE.addSame.right}</MathText></p>,
      },
      {
        id: 'qaidat-masafa', type: 'regles', title: 'الفاصلة الكبرى ناقص الصغرى',
        memo: {
          rule: `AB=${R('(+9)')}-${R('(-4)')}`,
          hook: 'نطرح الصغرى من الكبرى فنجد المسافة',
          example: `(+9)-(-4)=${R('13')}`,
          trap: 'الصغرى لا تُطرح منها الكبرى',
          exam: 'عيّن الفاصلة الكبرى ثم اطرح منها الصغرى',
          chip: `x_B-x_A`,
          quiz: [
            { q: 'المسافة بين $A(-2{,}5)$ و $B(+6)$ :', options: ['$8{,}5$', '$3{,}5$', '$-8{,}5$'], correct: 0 },
            { q: 'عند حساب المسافة نطرح من الفاصلة الكبرى :', options: ['الفاصلة الصغرى', 'الفاصلة الكبرى نفسها', 'الصفر'], correct: 0 },
          ],
        },
        predictPrompt: 'في الحالات الأربع التي فتحتَ فيها المسماك، أيّ عملية أعطتك الفتحة دائمًا ؟',
        summary: 'المسافة بين نقطتين : الفاصلة الكبرى ناقص الفاصلة الصغرى ، مثل (+9) − (−4) = 13 .',
        body: <p><MathText>{rule.text}</MathText></p>,
      },
      {
        id: 'nuqtatan', type: 'regles', title: 'نقطتان على بعد معلوم',
        memo: {
          rule: `a-${R('d')}\\ ,\\ a+${R('d')}`,
          hook: 'نضيف المسافة ونطرحها من الفاصلة',
          example: `1{,}5\\pm4:\\ -2{,}5\\ ,\\ 5{,}5`,
          trap: 'لا تكتفِ بنقطة واحدة',
          exam: 'اكتب النقطتين : واحدة من كلّ جهة',
          chip: `a\\pm d`,
          quiz: [
            { q: 'النقطتان اللتان تبعدان $3$ عن $M(-1)$ :', options: ['$-4$ و $+2$', '$+2$ فقط', '$-2$ و $+4$'], correct: 0 },
            { q: 'كم نقطة تبعد $d>0$ عن نقطة معلومة ؟', options: ['اثنتان', 'واحدة', 'أربع'], correct: 0 },
          ],
        },
        predictPrompt: 'ثبّتَ المسماك على فتحة $4$ وقلبتَ جهته. ماذا وجدتَ ؟',
        summary: 'النقطتان اللتان تبعدان d عن نقطة فاصلتها a فاصلتاهما a − d و a + d : نقطتان.',
        body: <p><MathText>{atDistance.text}</MathText> <MathText>{GUIDE.twoPoints}</MathText></p>,
      },
      {
        id: 'masafa-mujaba', type: 'regles', title: 'المسافة موجبة ولا تتبدّل',
        memo: {
          rule: `AB=BA>0`,
          hook: 'لا يتغيّر المقدار إذا بدّلنا النقطتين',
          example: `CD=DC=${R('9{,}5')}`,
          trap: 'لا مسافة سالبة',
          exam: 'إذا خرج عدد سالب فقد عكستَ الطرح',
          chip: `AB=BA`,
          quiz: [
            { q: 'مسافة $AB=7$ . إذن $BA$ :', options: ['$7$', '$-7$', '$0$'], correct: 0 },
            { q: 'هل تكون المسافة سالبة ؟', options: ['أبدًا', 'أحيانًا', 'دائمًا'], correct: 0 },
          ],
        },
        predictPrompt: 'شددتَ المسماك على الخرزة العليا بدل السفلى. هل تغيّرت الفتحة ؟',
        summary: 'المسافة بين نقطتين عدد موجب دائمًا ، وهي لا تتغيّر إذا بدّلنا النقطتين : AB = BA .',
        body: <p><MathText>{positive.text}</MathText> <MathText>{rule.example}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'taarif-masafa', type: 'vocabulaire', title: 'الفاصلة الكبرى والفاصلة الصغرى',
        memo: {
          rule: `x_{\\max}-x_{\\min}`,
          hook: 'الكبرى هي الأبعد نحو الاتجاه الموجب',
          example: `(+5{,}5)-(-1)=${R('6{,}5')}`,
          trap: 'الكبرى ليست الأبعد عن الصفر',
          exam: 'قارن الفاصلتين أوّلًا ثم اطرح',
          chip: `x_{\\max}-x_{\\min}`,
          quiz: [
            { q: 'من $-8$ و $-3$ الفاصلة الكبرى :', options: ['$-3$', '$-8$', '$0$'], correct: 0 },
            { q: 'المسافة بين $-8$ و $-3$ :', options: ['$5$', '$11$', '$-5$'], correct: 0 },
          ],
        },
        predictPrompt: 'فتحتَ المسماك بين نقطتين جديدتين. ماذا نسمّي العددين اللذين تطرح أحدهما من الآخر ؟',
        summary: 'نطرح الفاصلة الصغرى من الفاصلة الكبرى : A(+5,5) و B(−1) → AB = (+5,5) − (−1) = 6,5 .',
        body: (
          <div className="space-y-2">
            <p><MathText>{rule.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{rule.example}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqa-masafa', type: 'methodes', title: 'أحسب مسافة وأجد نقطتين',
        memo: {
          rule: `AB=x_{\\max}-x_{\\min}`,
          hook: 'الكبرى ناقص الصغرى ؛ وللنقطتين أضيف وأطرح',
          example: `(+4{,}5)-(-3)=${R('7{,}5')}`,
          trap: 'قد يخرج عدد سالب إذا عكستَ الطرح',
          exam: 'عيّن الكبرى ثم اطرح ؛ ثم أضف d واطرحها',
          chip: `x_{\\max}-x_{\\min}`,
          quiz: [
            { q: 'منتصف $[AB]$ حيث $A(-6)$ و $B(+2)$ فاصلته :', options: ['$-2$', '$4$', '$-4$'], correct: 0 },
            { q: 'المسافة بين $-3$ و $+4{,}5$ :', options: ['$7{,}5$', '$1{,}5$', '$-7{,}5$'], correct: 0 },
          ],
        },
        predictPrompt: 'حسبتَ مسافة بين نقطتين ثم بحثتَ عن نقطتين على بعد معلوم. اكتب الخطوات التي اتّبعتَها.',
        summary: 'لحساب مسافة نعيّن الفاصلة الكبرى ونطرح منها الصغرى ؛ وللنقطتين على بعد d من M نضيف d ونطرحها من فاصلة M .',
        body: <ul className="list-disc ps-5 space-y-1 text-sm">{METHOD.distance.rule.slice(1).map((l) => <li key={l}><MathText>{l}</MathText></li>)}<li><MathText>{midpoint.text}</MathText></li></ul>,
      },
    ],
  },
};
