import MathText from '../../../../../common/components/MathText';
import { ACTIVITY, ACTIVITY_LINES, KNOWLEDGE, METHOD_DRAW, METHOD_AB, METHOD_READ } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس 2 « التمثيل البياني لدالة تآلفية وقراءته بيانيًا » — SOURCE UNIQUE.
 *
 *   module 1 (نشاط 3)   irtifa-b (س 1 ب : (d′) est (d) montée de b), tartib-mabda (س 2 ب et « نسمّي … »)
 *   module 2 (معارف)    tamthil-taalufi (la propriété), muamil-tawjih (a, la marche et le sens),
 *                       rasm-taalufi (deux points suffisent) — écrits par la plateforme
 *   module 3 (القراءة)  qiraa-ab (lire b puis a, écrire f(x)), qiraa-sura-taalufi (image / antécédent)
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'irtifa-b', type: 'concepts', title: 'المستقيم المرفوع بـ b',
        memo: {
          rule: "f(x)=g(x)+\\textcolor{#e11d48}{b}\\quad(g(x)=ax)",
          hook: "كل نقطة تصعد بالمقدار نفسه",
          example: "f(2)=g(2)+\\textcolor{#e11d48}{1}=3+1=4",
          trap: "ظنّ أنّ الرفع يكبر كلما كبرت الفاصلة",
          exam: "اذكر أنّ الفرق بين الترتيبين ثابت",
          chip: "f(x)=g(x)+\\textcolor{#e11d48}{b}",
          quiz: [
            { q: "ترتيب نقطة من $(d)$ فاصلتها $2$ هو $3$ ، و $(d')$ مرفوع بـ $1$ . ترتيب نقطة $(d')$ التي فاصلتها $2$ :", options: ["$4$", "$3$", "$6$"], correct: 0 },
            { q: "ترتيب نظيرتها من $(d)$ هو $6$ والرفع $1$ . ترتيب نقطة $(d')$ التي لها الفاصلة نفسها:", options: ["$7$", "$5$", "$6$"], correct: 0 },
          ],
        },
        predictPrompt: 'بالمسبار قرأت عند الفاصلة 2 ترتيبين: 3 على $(d)$ و 4 على $(d\')$. جرّب فواصل أخرى، ثم اكتب القاعدة بكلماتك: كيف تنتقل من ترتيب نقطة من $(d)$ إلى ترتيب النقطة من $(d\')$ التي لها نفس الفاصلة، أيًّا كانت هذه الفاصلة؟',
        summary: 'ترتيب نقطة من تمثيل الدالة التآلفية يساوي ترتيب النقطة التي لها نفس الفاصلة من تمثيل الدالة الخطية ذات المعامل نفسه، مضافًا إليه b: المستقيم كلّه مرفوع بـ b.',
        body: <p><MathText>{ACTIVITY_LINES.rule}</MathText></p>,
      },
      {
        id: 'tartib-mabda', type: 'vocabulaire', title: 'الترتيب عند المبدأ',
        memo: {
          rule: "f(\\textcolor{#e11d48}{0})=a\\times \\textcolor{#e11d48}{0}+b=\\textcolor{#e11d48}{b}",
          hook: "عند الصفر يبقى الحدّ الثابت",
          example: "f(0)=\\tfrac{3}{2}\\times 0+1=\\textcolor{#e11d48}{1}",
          trap: "الخلط بين الترتيب عند المبدأ ومعامل التوجيه",
          exam: "اكتب نقطة محور التراتيب: الفاصلة صفر",
          chip: "f(0)=\\textcolor{#e11d48}{b}",
          quiz: [
            { q: "الترتيب عند المبدأ للدالة $f(x) = 3x - 2$ هو:", options: ["$-2$", "$3$", "$2$"], correct: 0 },
            { q: "تمثيل الدالة $x \\longmapsto 2x + 5$ يقطع محور التراتيب في:", options: ["$(0 ; 5)$", "$(5 ; 0)$", "$(0 ; 2)$"], correct: 0 },
          ],
        },
        summary: 'صورة العدد 0 بالدالة التآلفية هي العدد b، فالنقطة التي فاصلتها 0 وترتيبها b تنتمي إلى تمثيلها؛ نسمّي b الترتيب عند المبدأ.',
        body: (
          <div className="space-y-2">
            <p><MathText>{ACTIVITY_LINES.general}</MathText></p>
            <p className="font-semibold"><MathText>{ACTIVITY.naming}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'tamthil-taalufi', type: 'concepts', title: 'التمثيل البياني لدالة تآلفية',
        memo: {
          rule: "(d'):y=ax+\\textcolor{#e11d48}{b}\\parallel(d):y=ax",
          hook: "مستقيم موازٍ لتمثيل الخطية",
          example: "y=\\tfrac{3}{2}x+\\textcolor{#e11d48}{1}\\parallel y=\\tfrac{3}{2}x",
          trap: "ظنّ أنّ كل مستقيم يمرّ بالمبدأ",
          exam: "اذكر أنّه يقطع محور التراتيب في نقطة ترتيبها الحدّ الثابت",
          chip: "y=ax+\\textcolor{#e11d48}{b}",
          quiz: [
            { q: "تمثيل دالة تآلفية $x \\longmapsto ax + b$ مستقيم:", options: ["يقطع محور التراتيب في النقطة التي ترتيبها $b$", "يمرّ بالمبدأ دائمًا", "يوازي محور التراتيب"], correct: 0 },
            { q: "يمرّ تمثيل $x \\longmapsto ax + b$ بالمبدأ إذا كان:", options: ["$b = 0$", "$a = 0$", "$a = b$"], correct: 0 },
          ],
        },
        predictPrompt: 'في النشاط 3 رفعت تمثيل $x \\longmapsto \\dfrac{3}{2}x$ بـ 1 فصار $(d\')$ ، ورأيته يقطع محور التراتيب في $(0 ; 1)$. لدالة تآلفية أيًّا كانت $x \\longmapsto ax + b$ : ما شكل تمثيلها؟ ما علاقته بتمثيل $x \\longmapsto ax$ ؟ ومتى يشمل المبدأ O؟ اكتب ما تستنتجه.',
        summary: 'التمثيل البياني لدالة تآلفية مستقيم يقطع محور التراتيب في النقطة التي ترتيبها b، ويوازي تمثيل الدالة الخطية ذات المعامل a؛ ولا يشمل المبدأ إلا إذا كان b معدومًا.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.property}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.special}</MathText></p>
          </div>
        ),
      },
      {
        id: 'muamil-tawjih', type: 'regles', title: 'معامل التوجيه',
        memo: {
          rule: "x\\to x+1\\;\\Rightarrow\\;f(x)\\to f(x)+\\textcolor{#e11d48}{a}",
          hook: "خطوة إلى اليمين تغيّر الارتفاع بمعامل التوجيه",
          example: "f(x)=2x-3:\\;f\\to f+\\textcolor{#e11d48}{2}",
          trap: "نسيان الإشارة السالبة حين ينزل المستقيم",
          exam: "اذكر: يصعد إذا كان موجبًا وينزل إذا كان سالبًا",
          chip: "x+1\\to f+\\textcolor{#e11d48}{a}",
          quiz: [
            { q: "مستقيم معامل توجيهه $-\\frac{1}{2}$ : حين نتقدّم وحدة إلى اليمين", options: ["ينزل بمقدار $\\frac{1}{2}$", "يصعد بمقدار $\\frac{1}{2}$", "ينزل بمقدار $2$"], correct: 0 },
            { q: "معامل توجيه تمثيل $x \\longmapsto 3x - 2$ هو:", options: ["$3$", "$-2$", "$1$"], correct: 0 },
          ],
        },
        summary: 'العدد a معامل توجيه المستقيم: ما يصعده المستقيم عندما نتقدّم وحدة واحدة إلى اليمين؛ يصعد إذا كان a موجبًا وينزل إذا كان سالبًا.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.names}</MathText></p>
            <p><MathText>{KNOWLEDGE.slope}</MathText></p>
          </div>
        ),
      },
      {
        id: 'rasm-taalufi', type: 'methodes', title: 'نرسم التمثيل بنقطتين',
        memo: {
          rule: "A(0\\,;\\,b),\\;B(x_1\\,;\\,f(x_1))",
          hook: "نقطتان ثم مسطرة",
          example: "f(x)=2x-3:\\;(0\\,;\\,\\textcolor{#e11d48}{-3}),\\;(2\\,;\\,\\textcolor{#e11d48}{1})",
          trap: "اعتبار المبدأ نقطة من التمثيل دون تحقق",
          exam: "احسب صورتي عددين ثم صل النقطتين",
          chip: "(0\\,;\\,\\textcolor{#e11d48}{b})",
          quiz: [
            { q: "للدالة $f(x) = 2x - 3$ ، النقطة التي فاصلتها $2$ ترتيبها:", options: ["$1$", "$-1$", "$4$"], correct: 0 },
            { q: "كم نقطة تكفي لرسم تمثيل دالة تآلفية؟", options: ["نقطتان", "نقطة واحدة", "ثلاث نقاط"], correct: 0 },
          ],
        },
        predictPrompt: 'على المختبر وضعت نقاطًا من تمثيل $f(x) = 2x - 3$ ، ورفض المعلم المبدأ O. لو أعطيناك دالة تآلفية أخرى، بأيّ خطوات ترسم تمثيلها؟ كم نقطة تحتاج، وأيّ عدد تختاره لتجد إحداها دون عناء؟ اكتب الطريقة.',
        summary: 'لرسم تمثيل دالة تآلفية تكفي نقطتان: نحسب صورتي عددين نختارهما، والعدد 0 يعطي مباشرة نقطة محور التراتيب.',
        body: <p><MathText>{METHOD_DRAW.rule}</MathText></p>,
      },
    ],
    3: [
      {
        id: 'qiraa-ab', type: 'methodes', title: 'نقرأ a و b على التمثيل',
        memo: {
          rule: "b\\leftarrow x=0\\qquad a\\leftarrow x+1",
          hook: "اقرأ الثابت ثم المعامل ثم اكتب",
          example: "(0\\,;\\,\\textcolor{#e11d48}{2}),\\,(2\\,;\\,-1)\\Rightarrow f(x)=\\textcolor{#e11d48}{-\\tfrac{3}{2}}x+2",
          trap: "نسيان الإشارة السالبة حين ينزل المستقيم",
          exam: "اكتب عبارة الدالة بعد قراءة المعاملين",
          chip: "f(x)=ax+b",
          quiz: [
            { q: "مستقيم يقطع محور التراتيب في $(0 ; 2)$ ويمرّ بالنقطة $(2 ; -1)$ . قيمة $b$ :", options: ["$2$", "$-1$", "$-\\frac{3}{2}$"], correct: 0 },
            { q: "المستقيم نفسه: قيمة معامل توجيهه $a$ :", options: ["$-\\frac{3}{2}$", "$\\frac{3}{2}$", "$-3$"], correct: 0 },
          ],
        },
        predictPrompt: 'في النشاط 3 جعلت مستقيمك ينطبق على منحدر عبارته مخفية. أمامك المستقيم $(D)$ الذي يشمل $(0 ; 2)$ و $(2 ; -1)$ : بأيّ خطوات تقرأ عليه $b$ ثم $a$ لتكتب $f(x)$ ؟ وماذا تفعل إذا لم يمرّ المستقيم بعقدة من الشبكة بعد وحدة واحدة؟',
        summary: 'نقرأ b ترتيبًا لنقطة تقاطع المستقيم مع محور التراتيب، ونقرأ a بالتقدّم وحدة إلى اليمين ثم قياس ما يصعده أو ينزله المستقيم.',
        body: <div className="space-y-2">{METHOD_AB.rule.map((r) => <p key={r}><MathText>{r}</MathText></p>)}</div>,
      },
      {
        id: 'qiraa-sura-taalufi', type: 'methodes', title: 'نقرأ صورة عدد وعددًا صورته معلومة',
        memo: {
          rule: "m\\xrightarrow{f}\\textcolor{#e11d48}{y}\\qquad \\textcolor{#e11d48}{m}\\xleftarrow{f}y",
          hook: "الفاصلة تعطي الصورة والترتيب يعطي السابقة",
          example: "f(4)=7:\\;4\\xrightarrow{f}\\textcolor{#e11d48}{7}",
          trap: "عكس الصورة والسابقة",
          exam: "اتبع الخط المتقطع من محور إلى المستقيم ثم إلى المحور الآخر",
          chip: "x\\xrightarrow{f}y",
          quiz: [
            { q: "لقراءة صورة عدد على المستقيم نبدأ من:", options: ["محور الفواصل", "محور التراتيب", "المبدأ فقط"], correct: 0 },
            { q: "العدد الذي صورته $7$ هو فاصلة النقطة التي ترتيبها:", options: ["$7$", "$4$", "$0$"], correct: 0 },
          ],
        },
        predictPrompt: 'على المنحدر حرّكت مسبارًا تحت محور الفواصل إلى 4 ، ثم مسبارًا على يسار محور التراتيب إلى 4 ، وتبعت الخط المتقطع. اكتب الطريقتين بكلماتك: كيف تقرأ على المستقيم صورة عدد؟ وكيف تقرأ العدد الذي صورته معلومة؟',
        summary: 'صورة عدد هي ترتيب النقطة من التمثيل التي فاصلتها هذا العدد، والعدد الذي صورته معلومة هو فاصلة النقطة التي ترتيبها هذه الصورة.',
        body: <div className="space-y-2">{METHOD_READ.rule.map((r) => <p key={r}><MathText>{r}</MathText></p>)}</div>,
      },
    ],
  },
};
