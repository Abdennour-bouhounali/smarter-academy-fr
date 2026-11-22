import MathText from '../../../../../common/components/MathText';
import GeoFigure from '../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../common/textbook';
import { ACT5, KNOW4, METHOD_REL, METHOD_CONSTRUCT, POSSIBLE, LINES } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس 3 « العلاقات بين النسب المثلثية والإنشاءات الهندسية » — SOURCE UNIQUE.
 *
 *   module 1  takhmin-alaqat (la conjecture de نشاط 5, tableau de نشاط 4), burhan-alaqat (la preuve par Pythagore) ;
 *   module 2  alaqatan (معارف 4, l'encadré corrigé), kitabat-murabba (la remarque : sin²x = (sin x)²),
 *             mithal-60 (l'exemple du manuel) ;
 *   module 3  hisab-nisba (طرائق « استعمال العلاقات المثلثية »), shart-imkan (« إن أمكن » — formulé, déclaré),
 *             insha-zawiya (طرائق « إنشاء هندسي لزاوية حادة… »).
 *
 * « أتوقّع القاعدة » : takhmin-alaqat, burhan-alaqat, hisab-nisba, insha-zawiya ont leur predictPrompt (posé par une
 * <PredictRule> autour de la question / de la solution du manuel qui les écrirait) ; alaqatan (module 2) et shart-imkan
 * (module 3, la règle « hudud » du درس 1) sont posées en `rappel` ; mithal-60 est un exemple (`predict: false`).
 */
const Lines = ({ lines }) => lines.map((l) => <p key={l}><MathText>{l}</MathText></p>);

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'takhmin-alaqat', type: 'concepts',
        memo: {
          rule: "\\dfrac{\\sin x}{\\cos x}\\approx \\textcolor{#e11d48}{\\tan x}",
          hook: "الجدول يوحي بعلاقتين",
          example: "\\dfrac{0{,}87}{0{,}50}\\approx1{,}74",
          trap: "نعدّ الفرق الصغير دليلا ضد العلاقة وهو من التدوير",
          exam: "التخمين من الجدول ليس برهانا",
          chip: "\\tfrac{\\sin x}{\\cos x}\\approx\\tan x",
          quiz: [
            { q: "مجموع مربعي جيب التمام والجيب في الجدول يقارب:", options: ["$1$", "$\\cos x+\\sin x$", "$2$"], correct: 0 },
            { q: "$\\dfrac{\\sin x}{\\cos x}$ في الجدول يقارب:", options: ["$\\tan x$", "$\\dfrac{\\cos x}{\\sin x}$", "$1$"], correct: 0 },
          ],
        },
        title: 'تخمين من جدول النشاط 4',
        predictPrompt: 'بقيم جدول النشاط 4 حسبت $\\dfrac{0{,}50}{0{,}87}$ و $0{,}87^2 + 0{,}50^2$ ، ثم الشيء نفسه لـ $45^{\\circ}$ و $60^{\\circ}$ . قارن نتائجك بأعمدة الجدول: ماذا تخمّن لكل زاوية حادة $x$ ؟ اكتب علاقتين تربط $\\cos x$ و $\\sin x$ و $\\tan x$ .',
        summary: 'بقيم الجدول نجد أن جيب الزاوية مقسومًا على جيب تمامها قريب من ظلها، وأن مجموع مربعي جيب التمام والجيب قريب جدًا من 1؛ الفرق الصغير سببه التدوير، فنخمّن أن العلاقتين صحيحتان لكل زاوية حادة.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{LINES.table}</MathText></p>
            <p><MathText>{LINES.conjecture}</MathText></p>
            <SourceTag source={ACT5.source} />
          </div>
        ),
      },
      {
        id: 'burhan-alaqat', type: 'regles',
        memo: {
          rule: "AB^2+AC^2=BC^2\\Rightarrow \\textcolor{#e11d48}{\\cos^2x+\\sin^2x=1}",
          hook: "نقسم على مربع الوتر",
          example: "\\left(\\dfrac{3}{5}\\right)^2+\\left(\\dfrac{4}{5}\\right)^2=\\dfrac{9}{25}+\\dfrac{16}{25}=1",
          trap: "نجمع الجيب وجيب التمام دون تربيعهما",
          exam: "نبدأ من خاصية فيثاغورس ثم نقسم الطرفين",
          chip: "\\tfrac{AB^2+AC^2}{BC^2}=1",
          quiz: [
            { q: "نقسم $AB^2+AC^2=BC^2$ على:", options: ["$BC^2$", "$AB^2$", "$BC$"], correct: 0 },
            { q: "أضلاع مثلث قائم $3$ و $4$ والوتر $5$ : $\\cos^2x+\\sin^2x=$", options: ["$1$", "$\\dfrac{7}{5}$", "$\\dfrac{7}{25}$"], correct: 0 },
          ],
        },
        title: 'البرهان بخاصية فيثاغورس',
        predictPrompt: 'الجدول مدوّر، فتخمينك لم يُبرهن بعد. في المثلث $ABC$ القائم في $A$ حيث $x$ قيس الزاوية $\\widehat{B}$ : اكتب $\\cos x$ و $\\sin x$ بأطوال الأضلاع، ثم كيف تستعمل خاصية فيثاغورس لتثبت العلاقتين لكل زاوية حادة؟ اكتب خطوات برهانك.',
        summary: 'في المثلث ABC القائم في A حيث x قيس الزاوية B: مجموع مربعي AB و AC يساوي مربع الوتر BC، فمجموع مربعي جيب التمام والجيب يساوي 1؛ وقسمة الجيب على جيب التمام تختزل الوتر فتعطي AC على AB، أي الظل.',
        body: (
          <div className="space-y-1.5">
            <GeoFigure {...ACT5.figure} />
            <p><MathText>{LINES.proofSquares}</MathText></p>
            <p><MathText>{LINES.proofTan}</MathText></p>
            <SourceTag source={ACT5.source} />
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'alaqatan', type: 'memoriser',
        memo: {
          rule: "\\begin{aligned}\\cos^2x+\\sin^2x&=\\textcolor{#e11d48}{1}\\\\ \\tan x&=\\textcolor{#e11d48}{\\dfrac{\\sin x}{\\cos x}}\\end{aligned}",
          hook: "الجيب فوق جيب التمام",
          example: "\\cos^260^{\\circ}+\\sin^260^{\\circ}=\\dfrac14+\\dfrac34=1",
          trap: "نكتب الظل مقلوبا: جيب التمام فوق الجيب",
          exam: "نذكر أن الزاوية حادة ثم نطبق العلاقة",
          chip: "\\tfrac{\\sin x}{\\cos x}=\\tan x",
          quiz: [
            { q: "$\\tan x=$", options: ["$\\dfrac{\\sin x}{\\cos x}$", "$\\dfrac{\\cos x}{\\sin x}$", "$\\sin x\\times\\cos x$"], correct: 0 },
            { q: "$\\cos x=\\dfrac35$ و $\\sin x=\\dfrac45$ فإن $\\tan x=$", options: ["$\\dfrac43$", "$\\dfrac34$", "$\\dfrac{12}{25}$"], correct: 0 },
          ],
        },
        title: 'العلاقتان المثلثيتان',
        summary: 'من أجل كل زاوية حادة x في مثلث قائم: الظل يساوي الجيب مقسومًا على جيب التمام، ومجموع مربعي جيب التمام والجيب يساوي 1.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW4.property}</MathText></p>
            <p className="text-xs text-slate-500"><MathText>{KNOW4.correction}</MathText></p>
            <SourceTag source={KNOW4.source} />
          </div>
        ),
      },
      {
        id: 'kitabat-murabba', type: 'vocabulaire',
        memo: {
          rule: "\\cos^2x=\\textcolor{#e11d48}{(\\cos x)^2}",
          hook: "الأس على النسبة لا على الزاوية",
          example: "\\sin^260^{\\circ}=\\left(\\dfrac{\\sqrt3}{2}\\right)^2=\\dfrac34",
          trap: "نقرأ الأس على أنه تربيع الزاوية",
          exam: "نكتب الأس بعد اسم النسبة مباشرة",
          chip: "\\sin^2x=(\\sin x)^2",
          quiz: [
            { q: "$\\sin^2x$ تعني:", options: ["$(\\sin x)^2$", "$\\sin(x^2)$", "$2\\sin x$"], correct: 0 },
            { q: "$\\cos^260^{\\circ}=$", options: ["$\\dfrac14$", "$\\dfrac12$", "$1$"], correct: 0 },
          ],
        },
        title: 'الكتابة sin²x',
        summary: 'نكتب جيب تمام x مربعًا على شكل cos² x، وهو يعني مربع العدد cos x، لا جيب تمام مربع x.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW4.remark}</MathText></p>
            <SourceTag source={KNOW4.source} />
          </div>
        ),
      },
      {
        id: 'mithal-60', type: 'concepts',
        memo: {
          rule: "\\begin{aligned}\\cos60^{\\circ}&=\\dfrac12\\\\ \\sin60^{\\circ}&=\\dfrac{\\sqrt3}{2}\\\\ \\tan60^{\\circ}&=\\textcolor{#e11d48}{\\sqrt3}\\end{aligned}",
          hook: "نصف وجذر ثلاثة",
          example: "\\tan60^{\\circ}=\\dfrac{\\frac{\\sqrt3}{2}}{\\frac12}=\\sqrt3",
          trap: "نخلط بين قيمتي الجيب والظل لزاوية ستين",
          exam: "نكتب القيم المضبوطة لا المقربة",
          chip: "\\tan60^{\\circ}=\\sqrt3",
          quiz: [
            { q: "$\\sin60^{\\circ}=$", options: ["$\\dfrac{\\sqrt3}{2}$", "$\\dfrac12$", "$\\sqrt3$"], correct: 0 },
            { q: "$\\tan60^{\\circ}=$", options: ["$\\sqrt3$", "$\\dfrac{\\sqrt3}{2}$", "$\\dfrac{1}{\\sqrt3}$"], correct: 0 },
          ],
        },
        title: 'مثال: الزاوية 60°',
        predict: false, // un exemple que l'élève vient de calculer (tan 60° et la somme des carrés), pas une règle à formuler
        summary: 'في مثلث قائم وتره 2 وضلعه المجاور للزاوية 60° طوله 1: جيب التمام نصف والجيب جذر 3 على 2، والظل جذر 3، ومجموع المربعين ربع زائد ثلاثة أرباع، أي 1.',
        body: (
          <div className="space-y-1.5">
            <GeoFigure {...KNOW4.figure} />
            <Lines lines={KNOW4.example} />
            <SourceTag source={KNOW4.source} />
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'hisab-nisba', type: 'methodes',
        memo: {
          rule: "\\sin x=\\textcolor{#e11d48}{\\sqrt{1-\\cos^2x}}",
          hook: "نطرح من واحد ثم نجذر",
          example: "\\sin x=\\sqrt{1-0{,}36}=\\sqrt{0{,}64}=0{,}8",
          trap: "نكتفي بمربع الجيب وننسى الجذر",
          exam: "ندوّر في آخر الحساب فقط",
          chip: "\\sqrt{1-\\cos^2x}",
          quiz: [
            { q: "$\\cos x=0{,}6$ فإن $\\sin x=$", options: ["$0{,}8$", "$0{,}64$", "$0{,}4$"], correct: 0 },
            { q: "$\\cos x=0{,}8$ و $\\sin x=0{,}6$ فإن $\\tan x=$", options: ["$0{,}75$", "$\\dfrac43$", "$0{,}48$"], correct: 0 },
          ],
        },
        title: 'حساب نسبة من نسبة أخرى',
        predictPrompt: 'من $\\cos x = 0{,}6$ وصلت إلى $\\sin^2 x = 0{,}64$ دون أن تعرف قيس الزاوية. كيف تكمل لتحصل على $\\sin x$ ثم على $\\tan x$ ؟ اكتب الطريقة خطوة بخطوة، كما تطبّقها على أيّ نسبة معلومة، ومتى تدوّر.',
        summary: 'إذا علمنا جيب التمام نحسب مربع الجيب بطرح مربع جيب التمام من 1، ثم نأخذ الجذر الموجب؛ ثم نحسب الظل بقسمة الجيب على جيب التمام — دون حساب قيس الزاوية، وندوّر في النهاية فقط.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{METHOD_REL.exercise}</MathText></p>
            <Lines lines={METHOD_REL.solution} />
            <SourceTag source={METHOD_REL.source} />
          </div>
        ),
      },
      {
        id: 'shart-imkan', type: 'regles',
        memo: {
          rule: "\\begin{aligned}0&<\\sin x<\\textcolor{#e11d48}{1}\\\\ 0&<\\cos x<\\textcolor{#e11d48}{1}\\end{aligned}",
          hook: "الوتر أطول الأضلاع",
          example: "\\sin x=\\dfrac75>1",
          trap: "نقبل جيبا أكبر من واحد ونواصل الحساب",
          exam: "نتحقق من الإمكان قبل أي حساب",
          chip: "0<\\sin x<1",
          quiz: [
            { q: "أيّ عدد يمكن أن يكون جيب زاوية حادة؟", options: ["$0{,}9$", "$1{,}2$", "$-0{,}5$"], correct: 0 },
            { q: "أيّ عدد لا يمكن أن يكون ظلّ زاوية حادة؟", options: ["$-2$", "$5$", "$0{,}3$"], correct: 0 },
          ],
        },
        title: 'إن أمكن: نسبة ممكنة؟',
        summary: 'جيب زاوية حادة وجيب تمامها محصوران تمامًا بين 0 و 1 لأن الوتر أطول الأضلاع، وظلها موجب؛ فإن أُعطي جيب أكبر من 1 فلا زاوية ولا حساب.',
        body: (
          <div className="space-y-1.5">
            <Lines lines={POSSIBLE.lines} />
            <SourceTag source={POSSIBLE.source} />
          </div>
        ),
      },
      {
        id: 'insha-zawiya', type: 'methodes',
        memo: {
          rule: "\\sin x=\\dfrac{a}{\\textcolor{#e11d48}{b}}",
          hook: "ننقل البسط ونفتح المدور على المقام",
          example: "\\sin x=\\dfrac35",
          trap: "نعامل المقام ضلعا من الزاوية القائمة وهو الوتر",
          exam: "نذكر مراحل الإنشاء ثم نتحقق بالحاسبة",
          chip: "\\tfrac{a}{b}",
          quiz: [
            { q: "لإنشاء زاوية $\\sin x=\\dfrac25$ نفتح المدور على:", options: ["$5$", "$2$", "$7$"], correct: 0 },
            { q: "لإنشاء زاوية $\\tan x=\\dfrac23$ ننقل على ضلعي القائمة:", options: ["$2$ و $3$", "$3$ و $5$", "$2$ و $\\sqrt{13}$"], correct: 0 },
          ],
        },
        title: 'إنشاء زاوية علمت إحدى نسبها',
        predictPrompt: 'في مختبر النشاط 5 بنيت دون منقلة زاوية جيبها $\\dfrac{3}{5}$ . لو طُلبت منك زاوية جيبها $\\dfrac{2}{5}$ ، ثم زاوية ظلها $\\dfrac{7}{3}$ : أين تنقل كل عدد، ومتى تحتاج المدور ومتى تكفي المسطرة، وأين يكون رأس الزاوية $x$ ؟ اكتب الطريقة.',
        summary: 'نرسم بالكوس زاوية قائمة؛ للجيب أو جيب التمام ننقل البسط على ضلع ونرسم بالمدور دائرة نصف قطرها المقام مركزها طرف القطعة؛ للظل ننقل البسط والمقام على الضلعين؛ ثم نعيّن رأس الزاوية ونتحقّق بالحاسبة وبالمنقلة.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{METHOD_CONSTRUCT.ex1.solution[2]}</MathText></p>
            <p><MathText>{METHOD_CONSTRUCT.ex2.solution[2]}</MathText></p>
            <p><MathText>{LINES.construct}</MathText></p>
            <GeoFigure {...METHOD_CONSTRUCT.ex1.figure} />
            <SourceTag source={METHOD_CONSTRUCT.source} />
          </div>
        ),
      },
    ],
  },
};
