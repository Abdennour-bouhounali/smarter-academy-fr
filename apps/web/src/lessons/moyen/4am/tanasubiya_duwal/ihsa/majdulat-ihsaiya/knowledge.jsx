import MathText from '../../../../../common/components/MathText';
import { KNOW, EX7, EX7_OUTLIER, EX15, CALC } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس 3 « استعمال المجدولات (Excel) » — SOURCE UNIQUE. Le manuel n'a pas de معارف sur
 * le tableur : chaque texte vient de `content/textbook.js › KNOW` (écrit par la plateforme,
 * `knowledge_formalization`, dans les mots des exercices) ou des exercices eux-mêmes (le منوال défini par
 * le تمرين 7 ب).
 *
 *   module 1 (تمرين 7)   hajz-hifz (P1), khaliya-majal (P1), dustur (P2), dasatir-arbaa (P2), manwal (P2),
 *                        iadat-hisab (P2) ;
 *   module 2 (التمثيلات) tamthil-munasib (P3) ;
 *   module 3 (معارف)     asmaa-dawal (P2) ;
 *   module 4 (أدوات)     dhakira-hasiba (P2).
 * Les `summary` sont du texte simple, sans دستور (carte, مذكرة) : les دساتير restent dans `body`.
 */
const M = ({ children }) => <MathText>{children}</MathText>;

/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'hajz-hifz', type: 'methodes', title: 'حجز سلسلة في مجدول وحفظها',
        memo: {
          rule: `\\mathtt{${R('A')}1,\\;${R('B')}1,\\;${R('C')}1,\\dots}`,
          hook: 'قيمة في كل خلية',
          example: `\\mathtt{A1=${R('12')},\\;B1=${R('15')}}`,
          trap: 'كتابة السلسلة كلها في خلية واحدة',
          exam: 'احفظ الملف قبل الإغلاق',
          chip: `\\mathtt{A1\\;B1\\;C1}`,
          quiz: [
            { q: 'لحجز سلسلة من $7$ قيم في سطر واحد نستعمل:', options: ['سبع خلايا متجاورة في السطر', 'خلية واحدة فيها القيم السبع', 'سبع خلايا متباعدة دون ترتيب'], correct: 0 },
            { q: 'نضغط ENTER:', options: ['بعد كل قيمة', 'مرة واحدة في النهاية', 'قبل كتابة القيمة'], correct: 0 },
          ],
        },
        predictPrompt: 'في المجدول حجزت القيم السبع 4 ، 10 ، 8 ، 4 ، 3 ، 2 ، 4 قبل أيّ حساب، ثم أغلقت النافذة. لو أعطيناك سلسلة أخرى، بأيّ خطوات تضعها في المجدول بحيث تجدها كاملة إذا عدت إليها غدًا؟ اكتب الطريقة.',
        summary: 'نكتب كل قيمة من السلسلة في خلية من سطر واحد ونضغط ENTER بعد كل قيمة، ثم نحفظ الملف لنعود إليه.',
        body: <p><M>{KNOW.entry}</M></p>,
      },
      {
        id: 'khaliya-majal', type: 'concepts', title: 'الخلية والمجال',
        memo: {
          rule: `\\mathtt{${R('A')}1\\!:\\!${R('G')}1}`,
          hook: 'حرف العمود ثم رقم السطر',
          example: `\\mathtt{A1,B1,\\dots,G1}:\\;${R('7')}`,
          trap: 'كتابة رقم السطر قبل حرف العمود',
          exam: 'اكتب المجال بنقطتين بين أول خلية وآخر خلية',
          chip: `\\mathtt{A1\\!:\\!G1}`,
          quiz: [
            { q: 'عدد خلايا المجال $\\mathtt{A1\\!:\\!E1}$:', options: ['$4$', '$5$', '$1$'], correct: 1 },
            { q: 'الخلية في العمود C والسطر $2$ هي:', options: ['$\\mathtt{2C}$', '$\\mathtt{B3}$', '$\\mathtt{C2}$'], correct: 2 },
          ],
        },
        predictPrompt: 'وضعت القيمة الأولى 4 في المربّع الذي يلتقي فيه العمود A بالسطر 1، والقيمة الأخيرة في العمود G من السطر نفسه. كيف يُسمّى كل مربّع من هذه المربّعات؟ وكيف تكتب باختصار «كل المربّعات من الأول إلى السابع»؟ اكتب ما تستنتجه.',
        summary: 'كل خلية تُسمّى بحرف عمودها ورقم سطرها مثل A1 ، والمجال من A1 إلى G1 هو الخلايا السبع من A1 إلى G1.',
        body: (
          <div className="space-y-1">
            <p><M>{KNOW.cells}</M></p>
            <p className="text-sm text-slate-600"><M>{KNOW.range}</M></p>
          </div>
        ),
      },
      {
        id: 'dustur', type: 'concepts', title: 'الدستور',
        memo: {
          rule: `\\mathtt{=F(${R('A1\\!:\\!G1')})}`,
          hook: 'ابدأ بإشارة يساوي',
          example: `\\mathtt{=SUM(${R('A1\\!:\\!G1')})}`,
          trap: 'نسيان إشارة يساوي في أول الدستور',
          exam: 'اكتب الدستور واذكر مجاله',
          chip: `\\mathtt{=F(A1\\!:\\!G1)}`,
          quiz: [
            { q: 'يبدأ الدستور بالإشارة:', options: ['$+$', '$=$', '$:$'], correct: 1 },
            { q: 'إذا تغيّرت خلية من المجال فنتيجة الدستور:', options: ['تبقى كما هي', 'تُمحى', 'تُحسب من جديد وحدها'], correct: 2 },
          ],
        },
        predictPrompt: 'لم تكتب العدد 8 في الخلية B2 بنفسك: كتبت شيئًا آخر فحسبه المجدول. صف بكلماتك ما تكتبه في الخلية لكي يحسب المجدول بنفسه: بماذا يبدأ، وعلى أيّ خلايا يحسب؟',
        summary: 'الدستور يبدأ بالإشارة يساوي ويحسب على مجال من الخلايا؛ يكتب المجدول نتيجته ويعيد حسابها إذا تغيّرت خلية من المجال.',
        body: <p><M>{KNOW.formula}</M></p>,
      },
      {
        id: 'dasatir-arbaa', type: 'regles', title: 'دساتير المؤشّرات الأربعة',
        memo: {
          rule: `\\mathtt{=MAX(${R('r')})-MIN(${R('r')})}`,
          hook: 'أربعة دساتير لأربعة مؤشرات',
          example: `\\mathtt{=MEDIANE(A1\\!:\\!G1)}`,
          trap: 'نسيان الطرح عند حساب المدى',
          exam: 'طبّق كل دستور على المجال كاملا',
          chip: `\\mathtt{MAX-MIN}`,
          quiz: [
            { q: 'الدستور الذي يعطي المدى:', options: ['$\\mathtt{=MAX(r)}$', '$\\mathtt{=MODE(r)}$', '$\\mathtt{=MAX(r)-MIN(r)}$'], correct: 2 },
            { q: 'الدستور الذي يعطي الوسيط (بالفرنسية):', options: ['$\\mathtt{=MEDIANE(r)}$', '$\\mathtt{=MOYENNE(r)}$', '$\\mathtt{=MODE(r)}$'], correct: 0 },
          ],
        },
        predictPrompt: 'حسبت باليد المدى 8 والوسيط 4 والمتوسط 5 والمنوال 4 للسلسلة المحجوزة في ⁦A1:G1⁩ ، ثم تأكّدت في الخلايا B2 إلى B5. اكتب لكل مؤشّر من الأربعة ما يجب حجزه في خليته.',
        summary: 'المدى بالفرق بين MAX و MIN ، الوسيط بـ MEDIANE ، المتوسط بـ MOYENNE ، والمنوال بـ MODE ، كلها على مجال السلسلة كاملة.',
        body: (
          <ul className="list-disc space-y-0.5 ps-5">
            {KNOW.four.map((l) => <li key={l}><M>{l}</M></li>)}
          </ul>
        ),
      },
      {
        id: 'manwal', type: 'concepts', title: 'المنوال',
        memo: {
          rule: `f(Mo)=${R('\\max f')}`,
          hook: 'أكثر قيمة تكرارا',
          example: `Mo=5\\;,\\;f(5)=${R('3')}`,
          trap: 'ذكر التكرار بدل القيمة نفسها',
          exam: 'اكتب القيمة لا تكرارها',
          chip: `f(Mo)=\\max f`,
          quiz: [
            { q: 'منوال السلسلة $3,5,5,7,5,9$:', options: ['$3$', '$5$', '$9$'], correct: 1 },
            { q: 'تكرار المنوال في السلسلة نفسها:', options: ['$5$', '$1$', '$3$'], correct: 2 },
          ],
        },
        // L'énoncé du تمرين 7 (ب), dans le brief juste au-dessus, DONNE la définition : rien à conclure.
        predict: false,
        summary: 'منوال سلسلة هو القيمة ذات أكبر تكرار.',
        body: (
          <div className="space-y-1">
            <p><M>{EX7.questions[1]}</M></p>
            <p className="text-sm text-slate-600"><M>{EX7.answers.mode}</M></p>
          </div>
        ),
      },
      {
        id: 'iadat-hisab', type: 'concepts', title: 'المجدول يعيد الحساب',
        memo: {
          rule: `\\mathtt{=MOYENNE(r)}\\;,\\;\\mathtt{=MEDIANE(r)}`,
          hook: 'الدستور حيّ والعدد باليد ميّت',
          example: `\\bar{x}:6\\to${R('20{,}4')}\\;,\\;Me:6\\to6`,
          trap: 'كتابة النتيجة باليد فلا تتبع تغيّر الخلية',
          exam: 'استعمل الدستور لا العدد المكتوب',
          chip: `\\mathtt{=f(r)}`,
          quiz: [
            { q: 'غيّرنا $8$ إلى $80$ في السلسلة $4,5,6,7,8$. المؤشر الذي لم يتغيّر:', options: ['المتوسط', 'المدى', 'الوسيط'], correct: 2 },
            { q: 'عدد كتبناه بأيدينا بعد تغيير خلية:', options: ['لا يتغيّر', 'يُحسب من جديد', 'يُمحى'], correct: 0 },
          ],
        },
        predictPrompt: 'غيّرت قيمة في السطر 1 دون أن تلمس الدساتير، وراقبت العمود B والعدد الذي كتبته باليد في C. ماذا يحدث لنتائج الدساتير ولعددك المكتوب عندما تتغيّر خلية؟ وإذا صارت إحدى القيم كبيرة جدًّا، أيّ المؤشّرات يتأثّر بها وأيّها لا يتأثّر؟ اكتب ما تستنتجه.',
        summary: 'إذا غيّرنا قيمة خلية أعاد المجدول حساب كل دستور وحده، أمّا العدد المكتوب باليد فلا يتغيّر. القيمة الكبيرة جدًّا تحرّك المتوسط ولا تحرّك الوسيط.',
        body: (
          <div className="space-y-1">
            <p><M>{EX7_OUTLIER.text}</M></p>
            <p className="text-sm"><M>{EX7_OUTLIER.mean}</M></p>
            <p className="text-sm"><M>{EX7_OUTLIER.median}</M></p>
            <p className="text-sm text-slate-600"><M>{EX7_OUTLIER.hand}</M></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'tamthil-munasib', type: 'regles', title: 'التمثيل البياني المناسب',
        memo: {
          rule: `\\theta=\\dfrac{f}{N}\\times${R('360^\\circ')}`,
          hook: 'الزاوية تتناسب مع التكرار',
          example: `\\dfrac{5}{20}\\times360^\\circ=${R('90^\\circ')}`,
          trap: 'الخلط بين المدرج والأعمدة المنفصلة',
          exam: 'علّل اختيار التمثيل بنوع المعطيات',
          chip: `\\tfrac{f}{N}\\times360^\\circ`,
          quiz: [
            { q: 'تكرار $5$ من $20$ في مخطط دائري: زاوية القطاع:', options: ['$25^\\circ$', '$90^\\circ$', '$180^\\circ$'], correct: 1 },
            { q: 'لتمثيل فئات متلاصقة نستعمل:', options: ['المخطط بالأعمدة المنفصلة', 'المدرّج التكراري', 'المخطط الدائري'], correct: 1 },
          ],
        },
        predictPrompt: 'في المجدول (المستوى المتقدّم) اخترت تمثيلًا لكل جدول من ثلاثة، وأمامك الآن نفايات الشاطئ: 60 و 40 و 50 كيلوغرامًا من ثلاثة أنواع. اكتب القاعدة بكلماتك: لأيّ نوع من المعطيات نرسم أعمدة، ولأيّها مخططًا دائريًا، ولأيّها مدرّجًا تكراريًا؟',
        summary: 'المخطط بالأعمدة لقيم منفصلة، المخطط الدائري لتوزيع كلّ على أجزائه (زاوية القطاع تتناسب مع التكرار)، والمدرّج التكراري لفئات متلاصقة.',
        body: (
          <div className="space-y-1">
            <ul className="list-disc space-y-0.5 ps-5">
              {KNOW.charts.map((l) => <li key={l}><M>{l}</M></li>)}
            </ul>
            <p className="text-sm text-slate-600"><M>{EX15.answers.angles}</M></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'asmaa-dawal', type: 'memoriser', title: 'أسماء الدوال: الفرنسية والإنجليزية',
        memo: {
          rule: `\\mathtt{MOYENNE}=\\mathtt{${R('AVERAGE')}}`,
          hook: 'الاسم يتغيّر والحساب نفسه',
          example: `\\mathtt{MEDIANE}=\\mathtt{${R('MEDIAN')}}`,
          trap: 'كتابة الاسم الفرنسي في مجدول بالإنجليزية',
          exam: 'اكتب اسم الدالة كما يطلبه البرنامج',
          chip: `\\mathtt{MOYENNE\\!=\\!AVERAGE}`,
          quiz: [
            { q: 'المقابل الإنجليزي لـ $\\mathtt{MOYENNE}$:', options: ['$\\mathtt{MEDIAN}$', '$\\mathtt{MODE}$', '$\\mathtt{AVERAGE}$'], correct: 2 },
            { q: 'المقابل الإنجليزي لـ $\\mathtt{MEDIANE}$:', options: ['$\\mathtt{AVERAGE}$', '$\\mathtt{MEDIAN}$', '$\\mathtt{MAX}$'], correct: 1 },
          ],
        },
        // Les noms anglais d'une fonction sont une CONVENTION du logiciel : rien à conclure.
        predict: false,
        summary: 'الكتاب يكتب MEDIANE و MOYENNE (مجدول بالفرنسية)؛ في مجدول بالإنجليزية تُكتب MEDIAN و AVERAGE وتحسب الشيء نفسه.',
        body: <p><M>{KNOW.names}</M></p>,
      },
    ],
    4: [
      {
        id: 'dhakira-hasiba', type: 'methodes', title: 'ذاكرة الحاسبة لحساب متوسط',
        memo: {
          rule: `\\bar{x}=\\dfrac{\\mathtt{MR}}{${R('N')}}`,
          hook: 'أضف الجداءات ثم اقسم',
          example: `\\dfrac{2\\times3+4\\times2}{${R('5')}}=2{,}8`,
          trap: 'قسمة ما في الذاكرة على عدد القيم المختلفة',
          exam: 'اكتب الجداءات المضافة إلى الذاكرة',
          chip: `\\tfrac{\\mathtt{MR}}{N}`,
          quiz: [
            { q: 'القيمة $2$ تكرارها $3$ والقيمة $4$ تكرارها $2$. الذي يُظهره MR:', options: ['$6$', '$14$', '$5$'], correct: 1 },
            { q: 'المتوسط في الحالة نفسها:', options: ['$14$', '$3$', '$2{,}8$'], correct: 2 },
          ],
        },
        predictPrompt: 'لمتوسط السلسلة 97 ، 104 ، 99 وتكراراتها 2 ، 3 ، 5 تحسب باليد مجموع جداءات ثم تقسم. الحاسبة تحفظ عددًا في ذاكرتها وتضيف إليه، ثم تُظهره عند الطلب. بأيّ خطوات تستعمل هذه الذاكرة لتحصل على المتوسط دون أن تكتب أيّ نتيجة وسيطة؟ اكتب الطريقة.',
        summary: 'نضيف كل جداء القيمة في تكرارها إلى الذاكرة بـ M+ ، ثم نقسم ما يُظهره MR على التكرار الكلي.',
        body: <p><M>{CALC.rule}</M></p>,
      },
    ],
  },
};
