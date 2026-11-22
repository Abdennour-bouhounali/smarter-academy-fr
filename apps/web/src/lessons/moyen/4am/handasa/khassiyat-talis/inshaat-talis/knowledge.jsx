import MathText from '../../../../../common/components/MathText';
import GeoFigure from '../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../common/textbook';
import { METHOD_RAY, METHOD_DIVIDE, METHOD_LENGTH, METHOD_RATIO, TWO_POINTS, ROOT13 } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** Le rouge de la fiche de mémoire (MemoCard) : ce qui CHANGE dans la règle. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

/**
 * Les connaissances du درس 3 « إنشاءات هندسية وتطبيقات خاصية طالس (تقسيم قطعة مستقيم) » — SOURCE UNIQUE.
 *
 *   module 1  taqsim-qitaa (la méthode du rayon auxiliaire — formulée par la plateforme, déclarée),
 *             tabrir-taqsim (pourquoi : Thalès, k/n — formulé, déclaré), tariqat-kitab-taqsim (طرائق ص 107) ;
 *   module 2  nuqta-nisba (طرائق ص 109), nuqtatan (les deux points — formulé, déclaré),
 *             insha-tul (طرائق ص 107 : 14/3), tul-ghayr-natiq (√13 puis ses 2/3 — exemple de la plateforme).
 */
const Lines = ({ lines }) => lines.map((l) => <p key={l}><MathText>{l}</MathText></p>);

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'taqsim-qitaa', type: 'methodes', title: 'تقسيم قطعة إلى قطع متقايسة',
        memo: {
          rule: `\\dfrac{AM_k}{AB}=\\dfrac{AP_k}{AP_{${R("n")}}}=\\dfrac{k}{n}`,
          hook: 'الأخيرة تُوصل بنهاية القطعة',
          example: `\\dfrac{AM_1}{AB}=\\dfrac{AP_1}{AP_{${R("3")}}}=\\dfrac{1}{3}`,
          trap: 'نربط علامة غير الأخيرة فنحصل على عدد أجزاء مختلف',
          exam: 'اذكر أن القطع على نصف المستقيم متساوية والموازيات توازي المستقيم الواصل',
          chip: `\\tfrac{AM_k}{AB}=\\tfrac{k}{n}`,
          quiz: [
            { q: "لقسمة [AB] إلى 5 أجزاء متساوية ننقل المدور 5 مرات ثم نصل بـ B العلامة رقم:", options: ["$5$", "$4$", "$6$"], correct: 0 },
            { q: "إذا ثبّتنا فتحة المدور على قيمة أخرى طوال النقل فإن نقط التقسيم على [AB]:", options: ["لا تتغير", "تتحرك نحو A", "تتحرك نحو B"], correct: 0 },
          ],
        },
        predictPrompt: 'قسمتَ اللافتة $[AB]$ إلى 3 قطع متساوية دون أن تقيس أي طول. لو طُلب منك تقسيم قطعة $[AB]$ إلى $n$ قطع متقايسة، فما خطواتك بالترتيب، من أوّل خطّ ترسمه إلى نقط التقسيم؟ اكتب الطريقة.',
        summary: 'لتقسيم قطعة [AB] إلى n قطع متقايسة بالمسطرة غير المدرّجة والمدور: نعيّن على نصف مستقيم مبدؤه A عددا n من القطع المتقايسة، نصل العلامة رقم n بالنقطة B، ثم نرسم بالمسطرة والكوس الموازيات المارّة بالعلامات الأخرى.',
        body: (
          <div className="space-y-1.5">
            <Lines lines={METHOD_RAY.lines} />
            <SourceTag source={METHOD_RAY.source} />
          </div>
        ),
      },
      {
        id: 'tabrir-taqsim', type: 'regles', title: 'لماذا تتقايس القطع؟',
        memo: {
          rule: `\\dfrac{AM_k}{AB}=\\dfrac{AP_k}{AP_n}=${R("\\dfrac{k}{n}")}`,
          hook: 'الموازيات تنقل التساوي',
          example: `\\dfrac{AM_2}{AB}=\\dfrac{2r}{3r}=${R("\\dfrac{2}{3}")}`,
          trap: 'نظن أن فتحة المدور تغيّر مواضع النقط',
          exam: 'طبّق خاصية طالس في المثلث ذي الرأس A ثم اكتب النسبة k على n',
          chip: `\\tfrac{AM_k}{AB}=\\tfrac{k}{n}`,
          quiz: [
            { q: "نقطة التقسيم رقم 2 من 3 أجزاء تبعد عن A بـ:", options: ["$\\frac{2}{3}$ من $AB$", "$\\frac{1}{3}$ من $AB$", "$\\frac{2}{5}$ من $AB$"], correct: 0 },
            { q: "فتحة المدور أثناء النقل:", options: ["لا تؤثر في مواضع نقط التقسيم", "تحدد مواضعها", "تحدد عدد الأجزاء"], correct: 0 },
          ],
        },
        predictPrompt: 'مع 3 علامات متقايسة وجدت $\\dfrac{AM_1}{AB}$ و $\\dfrac{AM_2}{AB}$ . لو عيّنت $n$ علامات متقايسة، فكم تساوي $\\dfrac{AM_k}{AB}$ لنقطة التقسيم رقم $k$ ؟ بأيّ خاصية تبرّر ذلك، وهل لفتحة المدور دور؟',
        summary: 'في المثلث الذي رؤوسه A وآخر علامة و B تحقّق الموازيات خاصية طالس: نقطة التقسيم رقم k تبعد عن A بـ k من n أجزاء من AB، مهما كانت فتحة المدور وميل نصف المستقيم.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{METHOD_RAY.why}</MathText></p>
            <GeoFigure {...METHOD_RAY.figure} />
            <SourceTag source={METHOD_RAY.source} />
          </div>
        ),
      },
      {
        id: 'tariqat-kitab-taqsim', type: 'methodes', title: 'طريقة ثانية: ثلاث قطع على مستقيم يشمل B',
        memo: {
          rule: `\\dfrac{BM}{BA}=\\dfrac{BC}{BE}=${R("\\dfrac{1}{3}")}`,
          hook: 'مستقيم ثانٍ من النهاية وموازيان',
          example: `BC=CD=DE\\Rightarrow\\dfrac{BC}{BE}=${R("\\dfrac{1}{3}")}`,
          trap: 'نرسم الموازيين لمستقيم غير الذي يصل A بآخر علامة',
          exam: 'أنشئ C وD وE ثم ارسم الموازيين للمستقيم الواصل بين A وE',
          chip: `\\tfrac{BM}{BA}=\\tfrac{BC}{BE}`,
          quiz: [
            { q: "نرسم الموازيين المارين بـ C و D موازيين للمستقيم:", options: ["$(AE)$", "$(AB)$", "$(BE)$"], correct: 0 },
            { q: "إذا كان $BC=CD=DE$ فإن أول نقطة تقسيم على $[BA]$ تبعد عن B بـ:", options: ["$\\frac{1}{3}$ من $BA$", "$\\frac{1}{2}$ من $BA$", "$\\frac{2}{3}$ من $BA$"], correct: 0 },
          ],
        },
        predictPrompt: 'في تمرين آخر: $ABC$ مثلث، $D$ نظيرة $B$ بالنسبة إلى $C$ ، و $E$ نظيرة $C$ بالنسبة إلى $D$ . كما فعلت باللافتة، كيف تستعمل النقط $C$ و $D$ و $E$ لتقسيم الضلع $[AB]$ إلى 3 قطع متقايسة؟ اكتب الخطوات.',
        summary: 'نعيّن على مستقيم يشمل B نقطا C و D و E متتالية تجعل القطع [BC] و [CD] و [DE] متقايسة (نظائر)، ثم نرسم الموازيين للمستقيم (AE) المارّين بـ C و D، فيقسمان [AB] إلى ثلاث قطع متقايسة.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{METHOD_DIVIDE.exercise}</MathText></p>
            <p><MathText>{METHOD_DIVIDE.solution[0]}</MathText></p>
            <p><MathText>{METHOD_DIVIDE.solution[5]}</MathText></p>
            <SourceTag source={METHOD_DIVIDE.source} />
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'nuqta-nisba', type: 'methodes', title: 'نقطة تقسم قطعة بنسبة معلومة',
        memo: {
          rule: `\\dfrac{MA}{MB}=\\dfrac{AF}{BE}=${R("\\dfrac{p}{q}")}`,
          hook: 'درّج بالوحدة نفسها وجهتان مختلفتان',
          example: `\\dfrac{MA}{MB}=\\dfrac{AF}{BE}=${R("\\dfrac{3}{2}")}`,
          trap: 'نستعمل وحدتين مختلفتين على المستقيمين المتوازيين',
          exam: 'درّج المستقيمين بالوحدة نفسها، اختر F وE في جهتين مختلفتين، ثم ارسم (EF)',
          chip: `\\tfrac{MA}{MB}=\\tfrac{AF}{BE}`,
          quiz: [
            { q: "لإيجاد M بحيث $\\frac{MA}{MB}=\\frac{3}{2}$ نأخذ $AF=3$ وحدات و $BE=$:", options: ["$2$ وحدة في الجهة المقابلة", "$3$ وحدات في الجهة نفسها", "$5$ وحدات في الجهة المقابلة"], correct: 0 },
            { q: "لتكون M داخل [AB] نضع F وE:", options: ["في جهتين مختلفتين", "في الجهة نفسها", "على المستقيم (AB)"], correct: 0 },
          ],
        },
        predictPrompt: 'في اللافتة صنعت قطعًا متقايسة وموازيات. نريد الآن نقطة $M$ من $[AB]$ حيث $\\dfrac{MA}{MB} = \\dfrac{3}{2}$ ، بالمسطرة غير المدرّجة والمدور فقط. أيّ وضعية طالس تبنيها لتظهر فيها النسبة $\\dfrac{3}{2}$ ؟ اكتب خطوات الإنشاء.',
        summary: 'لتعيين M من [AB] حيث نسبة MA إلى MB معلومة نرسم مستقيمين متوازيين يشملان A و B مدرّجين بانتظام وبنفس الوحدة، نعيّن F على الأول و E على الثاني في جهتين مختلفتين، فيقطع (EF) القطعة [AB] في M.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{METHOD_RATIO.solution[0]}</MathText></p>
            <p><MathText>{METHOD_RATIO.solution[1]}</MathText></p>
            <p><MathText>{METHOD_RATIO.solution[3]}</MathText></p>
            <SourceTag source={METHOD_RATIO.source} />
          </div>
        ),
      },
      {
        id: 'nuqtatan', type: 'regles', title: 'نقطتان من المستقيم (AB)',
        memo: {
          rule: `\\begin{aligned}\\dfrac{AM}{AB}&=\\dfrac{p}{p+q}\\\\[2pt]\\dfrac{AN}{AB}&=${R("\\dfrac{p}{p-q}")}\\end{aligned}`,
          hook: 'نقطتان: داخلية وخارجية',
          example: `\\dfrac{AM}{AB}=\\dfrac{3}{5}\\ ,\\ \\dfrac{AN}{AB}=${R("3")}`,
          trap: 'نكتفي بنقطة واحدة وننسى النقطة الخارجية',
          exam: 'اذكر نقطتين: M بين A وB، وN خارج القطعة',
          chip: `\\tfrac{AM}{AB}=\\tfrac{p}{p+q}`,
          quiz: [
            { q: "النقط P من (AB) التي تحقق $\\frac{PA}{PB}=\\frac{3}{2}$ عددها:", options: ["$2$", "$1$", "$3$"], correct: 0 },
            { q: "النقطة الخارجية تنتج عن علامتين:", options: ["في الجهة نفسها", "في جهتين مختلفتين", "على المستقيم (AB)"], correct: 0 },
          ],
        },
        predictPrompt: 'في الشكل أعطت العلامتان $F$ و $E$ النقطة $M$ ، وأعطت العلامتان $K$ و $E$ النقطة $N$ ، وكلتاهما تحقّق $\\dfrac{3}{2}$ . متى تقع النقطة بين $A$ و $B$ ، ومتى تقع خارج $[AB]$ ؟ ولو كانت النسبة $\\dfrac{2}{5}$ ، فمن أيّ جهة تقع النقطة الخارجية؟ اكتب القاعدة.',
        summary: 'إذا كان العددان مختلفين فإن نقطتين من المستقيم (AB) تحقّقان النسبة نفسها: واحدة بين A و B (علامتان في جهتين مختلفتين) وأخرى خارج [AB] (علامتان في نفس الجهة).',
        body: (
          <div className="space-y-1.5">
            <Lines lines={TWO_POINTS.lines} />
            <p className="text-sm text-slate-700"><MathText>{TWO_POINTS.example}</MathText></p>
            <SourceTag source={TWO_POINTS.source} />
          </div>
        ),
      },
      {
        id: 'insha-tul', type: 'methodes', title: 'إنشاء قطعة طولها معلوم',
        memo: {
          rule: `\\dfrac{a}{b}=\\dfrac{c}{${R("x")}}\\Rightarrow x=\\dfrac{bc}{a}`,
          hook: 'اكتب تناسبا ثم ارسم موازيا',
          example: `\\dfrac{3}{7}=\\dfrac{2}{AB}\\Rightarrow AB=${R("\\dfrac{14}{3}")}`,
          trap: 'نغيّر ترتيب الأطوال على نصفي المستقيمين',
          exam: 'اكتب التناسب أولا، ثم عيّن الأطوال على نصفي المستقيمين وارسم الموازي',
          chip: `\\tfrac{a}{b}=\\tfrac{c}{x}`,
          quiz: [
            { q: "لإنشاء الطول $x$ حيث $\\frac{3}{7}=\\frac{2}{x}$ قيمة $x$ هي:", options: ["$\\frac{14}{3}$", "$\\frac{6}{7}$", "$\\frac{21}{2}$"], correct: 0 },
            { q: "ما الذي يعطيه الموازي في هذا الإنشاء؟", options: ["الطول الرابع المناسب للتناسب", "الطول الأول", "منصف الزاوية"], correct: 0 },
          ],
        },
        predictPrompt: 'صنعت خاصية طالس نسبة معلومة على موازيين مدرّجين. نريد الآن قطعة $[AB]$ طولها $\\dfrac{14}{3}$ دون قياس، والمدور ينقل أطوالًا صحيحة مثل 2 و 3 و 7. كيف تجعل خاصية طالس تعطيك هذا الطول؟ اكتب خطوات الإنشاء.',
        summary: 'نكتب الطول المطلوب على شكل تناسب (مثل 3 على 7 يساوي 2 على AB)، نعيّن الأطوال الثلاثة المعلومة على نصفي مستقيمين، ونرسم موازيًا: خاصية طالس تعطي الطول الرابع.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{METHOD_LENGTH.solution[0]}</MathText></p>
            <p><MathText>{METHOD_LENGTH.why}</MathText></p>
            <SourceTag source={METHOD_LENGTH.source} />
          </div>
        ),
      },
      {
        id: 'tul-ghayr-natiq', type: 'methodes', title: 'طول غير ناطق',
        memo: {
          rule: `c=\\sqrt{${R("a^2+b^2")}}`,
          hook: 'الجذر وتر مثلث قائم',
          example: `\\sqrt{2^2+3^2}=${R("\\sqrt{13}")}`,
          trap: 'نحاول قياس الجذر بالمسطرة بدل إنشائه',
          exam: 'أنشئ مثلثا قائما ضلعاه معلومان، ثم اعتبر وتره وقسّمه',
          chip: `\\sqrt{a^2+b^2}`,
          quiz: [
            { q: "$\\sqrt{13}$ هو وتر مثلث قائم ضلعاه:", options: ["$2$ و $3$", "$1$ و $13$", "$4$ و $9$"], correct: 0 },
            { q: "لأخذ ثلثي طول نقسمه إلى:", options: ["ثلاث قطع متقايسة ونأخذ قطعتين", "قطعتين متقايستين ونأخذ ثلاثا", "ثلاث قطع ونأخذ قطعة واحدة"], correct: 0 },
          ],
        },
        predictPrompt: 'الطول $\\sqrt{13}$ لا يُقاس بالمسطرة، لكن $13 = 2^2 + 3^2$ . كيف تنشئ بالمسطرة والكوس والمدور قطعة طولها $\\sqrt{13}$ ؟ ثم كيف تأخذ ثلثيها دون قياس؟ اكتب الخطوات.',
        summary: 'طول مثل جذر 13 لا يُقاس بالمسطرة، لكنه يُنشأ وترًا لمثلث قائم ضلعاه 2 و 3؛ ثم نأخذ ثلثيه بتقسيمه إلى ثلاث قطع متقايسة.',
        body: (
          <div className="space-y-1.5">
            <Lines lines={ROOT13.lines} />
            <SourceTag source={ROOT13.source} />
          </div>
        ),
      },
    ],
  },
};
