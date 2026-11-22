import MathText from '../../../../../common/components/MathText';
import { REMARKS, METHOD, SOLVE_ALL, EX26, CHECKS, ANGLE_FROM_SIDES } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Ce que le درس 4 établit. Le manuel n'a pas de معارف pour cette leçon : tout est une formalisation DÉCLARÉE de la
 * plateforme (`knowledge_formalization`, content/textbook.js), posée au moment où les modules la font vivre.
 *   tarid-muthallath   module 1 — traduire une situation en triangle rectangle, nommer les côtés relativement à l'angle
 *   ikhtiyar-nisba     module 1 — choisir le rapport qui contient le côté connu ET le côté cherché
 *   majhul-maqam       module 1 — l'inconnue au numérateur : on multiplie ; au dénominateur : on divise
 *   zawiyat-nazar      module 1 — une hauteur inaccessible : h = d × tan α, la même de partout (angle lu au degré)
 *   khatawat-tarid     module 2 — les six étapes de la modélisation
 *   tadwir-akhir       module 2 — arrondir à la fin seulement (ex-26)
 *   hall-muthallath    module 2 — résoudre le triangle rectangle entier (ex-27)
 *   zawiya-min-dilain  module 2 — un angle à partir de deux côtés : le rapport, puis la touche inverse
 *   burhan-qaim        module 3 — avant d'utiliser un rapport : prouver que le triangle est rectangle (ex-13, ex-24)
 * Les réponses du « إختبار أولي » (منارة جامع الجزائر, téléphérique, dune, sarah) ne sont dans aucun item.
 */
const Lines = ({ lines }) => (
  <ul className="list-disc ms-5 space-y-1">{lines.map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ul>
);

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      { id: 'tarid-muthallath', type: 'methodes',
        memo: {
          rule: "\\mathrm{V}\\perp\\mathrm{H}\\Rightarrow\\widehat{A}=\\textcolor{#e11d48}{90^{\\circ}}",
          hook: "الشاقولي عمودي على الأفقي",
          example: "\\sin59^{\\circ}=\\dfrac{h}{L}",
          trap: "نرسم مثلثا بلا زاوية قائمة",
          exam: "نرسم المثلث ونسمّي أضلاعه أولا",
          chip: "\\perp\\Rightarrow90^{\\circ}",
          quiz: [
            { q: "الجدار شاقولي والأرض أفقية، فالزاوية بينهما:", options: ["$90^{\\circ}$", "$45^{\\circ}$", "$180^{\\circ}$"], correct: 0 },
            { q: "السلّم المائل على الجدار يمثّل في المثلث القائم:", options: ["الوتر", "ضلع الزاوية القائمة", "الارتفاع"], correct: 0 },
          ],
        },
        title: 'من الوضعية إلى المثلث القائم',
        predictPrompt: 'السلّم على الجدار: الجدار شاقولي والأرض أفقية، وعرفت أيّ ضلع هو الارتفاع $1{,}60\\,\\mathrm{m}$ وأيّ ضلع هو السلّم. أمام وضعية جديدة (عمود، كشّاف، منارة)، بماذا تبدأ قبل أيّ حساب؟ اكتب بكلماتك: أيّ شكل ترسم، وبالنسبة إلى ماذا تسمّي أضلاعه؟',
        summary: 'الشاقولي عمودي على الأفقي: نرسم مثلثا قائما يترجم الوضعية، ونسمّي أضلاعه بالنسبة إلى الزاوية المعلومة (المقابل، المجاور، الوتر).',
        body: <Lines lines={[METHOD.lines[0], REMARKS.muqabilWatar]} /> },
      { id: 'ikhtiyar-nisba', type: 'regles',
        memo: {
          rule: "\\begin{aligned}\\sin&=\\dfrac{O}{H}\\\\ \\cos&=\\dfrac{A}{H}\\\\ \\tan&=\\dfrac{O}{A}\\end{aligned}",
          hook: "المعلوم والمطلوب يحدّدان النسبة",
          example: "\\sin59^{\\circ}=\\dfrac{1{,}60}{L}",
          trap: "نختار نسبة لا تحوي الضلع المطلوب",
          exam: "نذكر سبب اختيار النسبة",
          chip: "\\tfrac{O}{H}\\ \\tfrac{A}{H}\\ \\tfrac{O}{A}",
          quiz: [
            { q: "نعرف المقابل ونطلب الوتر فنستعمل:", options: ["الجيب", "جيب التمام", "الظل"], correct: 0 },
            { q: "نعرف المجاور ونطلب المقابل فنستعمل:", options: ["الظل", "الجيب", "جيب التمام"], correct: 0 },
          ],
        },
        title: 'أيّ نسبة؟', summary: 'نختار النسبة التي تجمع الضلع المعلوم والضلع المطلوب: المقابل والوتر بالجيب، المجاور والوتر بجيب التمام، المقابل والمجاور بالظل.',
        body: <Lines lines={[METHOD.lines[2], REMARKS.sinChoice]} /> },
      { id: 'majhul-maqam', type: 'regles',
        memo: {
          rule: "\\sin\\alpha=\\dfrac{x}{a}\\Rightarrow x=\\textcolor{#e11d48}{a\\times\\sin\\alpha}",
          hook: "في البسط نضرب وفي المقام نقسم",
          example: "L=\\dfrac{1{,}60}{\\sin59^{\\circ}}\\approx1{,}87",
          trap: "نقسم حيث يجب الضرب",
          exam: "نكتب المساواة ثم نستخرج المجهول",
          chip: "x=a\\times\\sin\\alpha",
          quiz: [
            { q: "$\\sin\\alpha=\\dfrac{x}{12}$ فإن $x=$", options: ["$12\\times\\sin\\alpha$", "$\\dfrac{12}{\\sin\\alpha}$", "$12+\\sin\\alpha$"], correct: 0 },
            { q: "$\\cos\\alpha=\\dfrac{5}{x}$ فإن $x=$", options: ["$\\dfrac{5}{\\cos\\alpha}$", "$5\\times\\cos\\alpha$", "$\\dfrac{\\cos\\alpha}{5}$"], correct: 0 },
          ],
        },
        title: 'نضرب أم نقسم؟', summary: 'نكتب المساواة ونستخرج المجهول: في البسط نضرب، وفي المقام نقسم؛ الوتر أطول الأضلاع فلا يكون أقصر من المعلوم.',
        body: <Lines lines={[METHOD.lines[3], REMARKS.ladderCalc]} /> },
      { id: 'zawiyat-nazar', type: 'methodes',
        memo: {
          rule: "h=\\textcolor{#e11d48}{d\\times\\tan\\alpha}",
          hook: "المسافة في ظل الزاوية",
          example: "h=30\\times\\tan38^{\\circ}\\approx23{,}44",
          trap: "نضيف ارتفاع الملاحظ إن وُجد وننساه",
          exam: "نذكر أن الارتفاع واحد من أي مكان",
          chip: "h=d\\tan\\alpha",
          quiz: [
            { q: "$d=20$ و $\\alpha=45^{\\circ}$ فإن $h=$", options: ["$20$", "$20\\sqrt2$", "$10$"], correct: 0 },
            { q: "نقيس من مسافة أبعد: الارتفاع المحسوب", options: ["نفسه تقريبا", "يكبر", "يصغر"], correct: 0 },
          ],
        },
        title: 'ارتفاع لا نصل إليه',
        predictPrompt: 'كشّاف الملعب لا نتسلّقه: نعرف فقط بعد الهاتف عن قاعدة عموده على الأرض، وزاوية النظر التي يقرؤها الهاتف. كيف تحسب ارتفاع الكشّاف من هذين العددين؟ اكتب الطريقة، وقل: هل يتغيّر الارتفاع المحسوب إذا قِسنا من مسافة أخرى؟',
        summary: 'من المسافة على الأرض وزاوية النظر نحسب الارتفاع بضرب المسافة في ظل الزاوية؛ يبقى الارتفاع نفسه من كل مكان، والفروق الصغيرة من تدوير الزاوية.',
        body: <Lines lines={[REMARKS.nisbaRight, REMARKS.wobble]} /> },
    ],
    2: [
      { id: 'khatawat-tarid', type: 'methodes',
        memo: {
          rule: "1\\to2\\to3\\to4\\to5\\to\\textcolor{#e11d48}{6}",
          hook: "ارسم سمّ اختر استخرج احسب تحقّق",
          example: "\\sin59^{\\circ}=\\dfrac{1{,}60}{L}\\Rightarrow L\\approx1{,}87",
          trap: "نقفز إلى الحساب قبل الرسم",
          exam: "نكتب الخطوات الستّ بالترتيب",
          chip: "1\\to\\cdots\\to6",
          quiz: [
            { q: "أول خطوة في النمذجة:", options: ["رسم المثلث القائم", "التدوير", "الحساب بالحاسبة"], correct: 0 },
            { q: "التدوير يكون:", options: ["في آخر الحساب", "بعد كل خطوة", "قبل اختيار النسبة"], correct: 0 },
          ],
        },
        title: METHOD.title,
        predictPrompt: 'مع السلّم ( $1{,}60\\,\\mathrm{m}$ و $59^{\\circ}$ ) ثم مع كشّاف الملعب، حللت وضعيتين بالطريقة نفسها. لو أعطيناك وضعية أخرى، ما الخطوات التي تتّبعها بالترتيب، من قراءة النص إلى الجواب؟ اكتبها مرقّمة.',
        summary: 'نرسم المثلث القائم، نسمّي المعلوم والمطلوب بالنسبة إلى الزاوية، نختار النسبة، نستخرج المجهول، نحسب وندوّر في النهاية، ثم نتحقّق.',
        body: (
          <ol className="list-decimal ms-5 space-y-1">{METHOD.lines.map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ol>
        ) },
      { id: 'tadwir-akhir', type: 'regles',
        memo: {
          rule: "\\sqrt{20}\\times\\sqrt5=\\textcolor{#e11d48}{10}",
          hook: "القيمة المضبوطة حتى النهاية",
          example: "4{,}47\\times2{,}24=10{,}0128",
          trap: "نحسب بقيم مدوّرة ثم ندوّر مرة أخرى",
          exam: "ندوّر النتيجة الأخيرة فقط",
          chip: "\\sqrt{20}\\sqrt5=10",
          quiz: [
            { q: "$\\sqrt{20}\\times\\sqrt5$ تساوي بالضبط:", options: ["$10$", "$10{,}0128$", "$9{,}9$"], correct: 0 },
            { q: "القيمة المدوّرة إذا استُعملت في حساب موالٍ:", options: ["تغيّر النتيجة", "لا تغيّر شيئا", "تجعلها أدق"], correct: 0 },
          ],
        },
        title: 'ندوّر في النهاية فقط', summary: 'القيمة المدوّرة إذا استُعملت في حساب موالٍ تغيّر النتيجة؛ نحتفظ بالقيمة المضبوطة أو بكل أرقام الحاسبة ولا ندوّر إلا النتيجة الأخيرة.',
        body: <Lines lines={[EX26.earlyNote, CHECKS.earlyRight]} /> },
      { id: 'hall-muthallath', type: 'methodes',
        memo: {
          rule: "\\widehat{C}=90^{\\circ}-\\textcolor{#e11d48}{\\widehat{B}}",
          hook: "الحادتان تتتامّان",
          example: "90^{\\circ}-59^{\\circ}=31^{\\circ}",
          trap: "نطرح من مئة وثمانين بدل تسعين",
          exam: "نذكر أن مجموع الحادتين تسعون",
          chip: "90^{\\circ}-\\widehat{B}",
          quiz: [
            { q: "مجموع الزاويتين الحادتين في مثلث قائم:", options: ["$90^{\\circ}$", "$180^{\\circ}$", "$360^{\\circ}$"], correct: 0 },
            { q: "$\\widehat{B}=35^{\\circ}$ فإن الزاوية الحادة الأخرى:", options: ["$55^{\\circ}$", "$145^{\\circ}$", "$125^{\\circ}$"], correct: 0 },
          ],
        },
        title: SOLVE_ALL.title,
        predictPrompt: 'في التمرين 27 كنت تعرف زاوية وضلعا فقط، ثم وجدت $MS$ و $SF$ وقيس $\\widehat{F}$ ، وحسبت $SF$ بأربع طرق. كيف نجد كل العناصر المجهولة لمثلث قائم؟ اكتب الطريقة، وقل: متى تعطي كل الطرق النتيجة نفسها؟',
        summary: 'الزاوية الثانية بالتتام، وضلع بنسبة مثلثية، والثالث بنسبة أخرى أو بخاصية فيثاغورس؛ كل الطرق تعطي النتيجة نفسها بالقيم المضبوطة.',
        body: <Lines lines={[...SOLVE_ALL.lines, CHECKS.verify]} /> },
      { id: 'zawiya-min-dilain', type: 'methodes',
        memo: {
          rule: "\\tan x=\\dfrac{24}{30}\\Rightarrow x=\\textcolor{#e11d48}{\\tan^{-1}(0{,}8)}",
          hook: "النسبة أولا ثم العكسية",
          example: "x=\\tan^{-1}(0{,}8)\\approx38{,}7^{\\circ}",
          trap: "نعدّ النسبة قيس الزاوية",
          exam: "نكتب النسبة ثم الزاوية بالدرجة",
          chip: "x=\\tan^{-1}\\dfrac{a}{b}",
          quiz: [
            { q: "$\\tan x=1$ فإن $x=$", options: ["$45^{\\circ}$", "$1^{\\circ}$", "$90^{\\circ}$"], correct: 0 },
            { q: "نعرف المقابل والوتر فنستعمل:", options: ["$\\sin^{-1}$", "$\\cos^{-1}$", "$\\tan^{-1}$"], correct: 0 },
          ],
        },
        title: 'زاوية من ضلعين',
        predictPrompt: 'الكشّاف ارتفاعه $24\\,\\mathrm{m}$ والهاتف على بعد $30\\,\\mathrm{m}$ من قاعدته، ووجدت زاوية النظر بالحساب دون أن تقيسها. إذا عرفت طولي ضلعين في مثلث قائم، كيف تعيّن قيس إحدى زاويتيه الحادتين؟ اكتب الخطوات.',
        summary: 'إذا عرفنا ضلعين نختار النسبة التي تجمعهما، نحسب قيمتها، ثم نعيّن الزاوية باللمسة العكسية على الحاسبة.',
        body: <Lines lines={[ANGLE_FROM_SIDES.explain]} /> },
    ],
    3: [
      { id: 'burhan-qaim', type: 'regles',
        memo: {
          rule: "AB^2+AC^2=BC^2\\Rightarrow\\widehat{A}=\\textcolor{#e11d48}{90^{\\circ}}",
          hook: "نثبت القائم قبل أي نسبة",
          example: "3{,}4^2+2{,}55^2=4{,}25^2",
          trap: "نستعمل النسب في مثلث غير مثبت القائم",
          exam: "نكتب عكس خاصية فيثاغورس",
          chip: "a^2+b^2=c^2",
          quiz: [
            { q: "أضلاع $5$ و $12$ و $13$ : هل المثلث قائم؟", options: ["نعم لأن $5^2+12^2=13^2$", "لا لأن $5+12\\neq13$", "نعم لأن $5+12>13$"], correct: 0 },
            { q: "مثلث مرسوم في نصف دائرة قطرها $[AB]$ قائم في:", options: ["الرأس الثالث", "$A$", "$B$"], correct: 0 },
          ],
        },
        title: 'هل المثلث قائم؟', summary: 'لا نستعمل النسب المثلثية إلا في مثلث قائم: نثبت الزاوية القائمة (عكس فيثاغورس، مثلث في نصف دائرة، موازٍ لعمودي) قبل الحساب.',
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{'التمرين 13: $3{,}4^2 + 2{,}55^2 = 4{,}25^2$ فالمثلث ACD قائم في D، ثم (BE) // (CD).'}</MathText></li>
            <li>التمرين 24: المثلث المرسوم في نصف دائرة قطرها [AB] قائم في الرأس الثالث.</li>
          </ul>
        ) },
    ],
  },
};
