import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION, analysisText } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle (LESSON_CONTRACT) : ce sont la DÉMARCHE du manuel
 * (قراءة → تحليل واختيار استراتيجية → تنفيذ) appliquée à la وضعية « مقام الشهيد », et le rappel de l'outil que le test final mobilise (un triangle rectangle dans un solide).
 *   talis-khatt-nazar   module 7 — Thalès dans la ligne de visée : deux verticales, un sommet commun A
 *   zawiya-bi-zill      module 7 — l'angle x par la tangente dans le petit triangle, la touche inverse, l'arrondi
 *   mulaamat-natija     module 7 — vérifier (même x dans le grand triangle, 92 m réels) et arrondir en fin de calcul
 *   tariqat-wadiya      module 7 — la démarche en trois phases (les mots du manuel)
 *   muthallath-fada     module 7 (rappel) — un triangle rectangle DANS un solide : Pythagore deux fois, puis le rapport
 * Les réponses de « إختبار أولي » (la minaret de جامع الجزائر, le conteneur) ne sont dans aucun item.
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'talis-khatt-nazar', type: 'methodes',
        memo: {
          rule: "\\dfrac{MS}{PQ}=\\textcolor{#e11d48}{\\dfrac{AM}{AP}}",
          hook: "الضلع الكبير يبدأ من الملاحظ",
          example: "\\dfrac{h}{2{,}30}=\\dfrac{98{,}1}{2{,}45}",
          trap: "نأخذ المسافة بين العمودين بدل الكلية",
          exam: "نكتب المسافة الكلية من الملاحظ",
          chip: "\\tfrac{AM}{AP}",
          quiz: [
            { q: "الضلع الكبير المقابل لـ $AP$ هو:", options: ["$AM$", "$PM$", "$MS$"], correct: 0 },
            { q: "$AM=2{,}45+95{,}65=$", options: ["$98{,}1$", "$95{,}65$", "$93{,}2$"], correct: 0 },
          ],
        },
        title: 'خاصية طالس في خط النظر', summary: 'عمود ومعلم شاقوليان وقمّتاهما على خط نظر واحد: المثلثان اللذان رأسهما موضع الملاحظ في وضعية طالس، والضلع الكبير هو المسافة الكلية من الملاحظ إلى قاعدة المعلم.',
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.nazar}</MathText></li>
            <li><MathText>{REMARKS.AM}</MathText></li>
            <li><MathText>{REMARKS.talisEq}</MathText></li>
          </ul>
        ) },
      { id: 'zawiya-bi-zill', type: 'methodes',
        memo: {
          rule: "\\tan x=\\dfrac{PQ}{AP}\\Rightarrow x=\\textcolor{#e11d48}{\\tan^{-1}\\dfrac{2{,}30}{2{,}45}}",
          hook: "المقابل فوق المجاور ثم العكسية",
          example: "x\\approx43{,}19^{\\circ}\\approx43^{\\circ}",
          trap: "نعدّ النسبة قيس الزاوية",
          exam: "نكتب الظل ثم الزاوية مدوّرة",
          chip: "x=\\tan^{-1}\\dfrac{PQ}{AP}",
          quiz: [
            { q: "$\\tan x\\approx0{,}94$ فإن $x\\approx$", options: ["$43^{\\circ}$", "$0{,}94^{\\circ}$", "$47^{\\circ}$"], correct: 0 },
            { q: "في المثلث $APQ$ القائم في $P$ الضلع المقابل لـ $x$ هو:", options: ["$PQ$", "$AP$", "$AQ$"], correct: 0 },
          ],
        },
        title: 'قيس زاوية النظر بالظل', summary: 'في المثلث القائم الصغير: الضلع المقابل لزاوية النظر هو العمود والمجاور لها هو المسافة إلى العمود، فنكتب الظل ثم نستعمل اللمسة العكسية للظل وندوّر إلى الدرجة.',
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.tanX}</MathText></li>
            <li><MathText>{REMARKS.xCalc}</MathText></li>
          </ul>
        ) },
      { id: 'mulaamat-natija', type: 'regles',
        memo: {
          rule: "\\dfrac{MS}{AM}=\\dfrac{PQ}{AP}=\\tan x",
          hook: "نتحقق ونُبقي التدوير للنهاية",
          example: "0{,}9\\to x\\approx42^{\\circ}\\ \\ne\\ 43^{\\circ}",
          trap: "نقرّب الظل قبل اللمسة العكسية",
          exam: "نتأكد أن النتيجة ملائمة للواقع",
          chip: "\\tfrac{MS}{AM}=\\tfrac{PQ}{AP}",
          quiz: [
            { q: "التدوير يكون:", options: ["في آخر الحساب", "قبل اللمسة العكسية", "بعد كل عملية"], correct: 0 },
            { q: "تدوير $\\tan x$ إلى $0{,}9$ قبل العكسية يعطي:", options: ["$42^{\\circ}$", "$43^{\\circ}$", "$47^{\\circ}$"], correct: 0 },
          ],
        },
        title: 'التحقّق والتدوير في آخر الحساب', summary: 'نتحقّق أنّ الزاوية نفسها تظهر في المثلث الكبير وأنّ الارتفاع ملائم للواقع، ولا ندوّر إلا النتيجة النهائية.',
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.check}</MathText></li>
            <li><MathText>{REMARKS.tadwirMubakkir}</MathText></li>
            <li><MathText>{REMARKS.real}</MathText></li>
          </ul>
        ) },
      { id: 'tariqat-wadiya', type: 'methodes',
        memo: {
          rule: "1\\to2\\to\\textcolor{#e11d48}{3}",
          hook: "اقرأ اختر نفّذ",
          example: "\\text{Thales}\\to\\tan\\to\\tan^{-1}",
          trap: "نبدأ بالحساب قبل فهم المطلوب",
          exam: "نكتب المعرفة المختارة ثم نحسب ونتحقق",
          chip: "1\\to2\\to3",
          quiz: [
            { q: "أول مرحلة في حل الوضعية:", options: ["قراءة النص وتحديد المطلوب", "الحساب بالحاسبة", "التدوير"], correct: 0 },
            { q: "نختار المعرفة المناسبة بحسب:", options: ["المعطيات والمطلوب", "طول النص", "عدد الأرقام"], correct: 0 },
          ],
        },
        title: 'طريقة: من النص إلى الجواب', summary: 'نقرأ الوضعية ونحدّد المطلوب، نختار المعرفة المناسبة للمعطيات (طالس، النسب المثلثية، فيثاغورس)، ثم نكتب المساواة ونحسب وندوّر ونتحقّق.',
        body: (
          <ol className="list-decimal ms-5 space-y-1">
            {SITUATION.analysis.map((a) => <li key={a.label}><strong>{a.label}</strong>: {analysisText(a)}</li>)}
          </ol>
        ) },
      { id: 'muthallath-fada', type: 'methodes',
        memo: {
          rule: "AC^2=AB^2+BC^2,\\ AD^2=AC^2+CD^2",
          hook: "فيثاغورس مرتين ثم النسبة",
          example: "AC^2=3{,}15^2+2{,}35^2=15{,}445",
          trap: "نجمع الأطوال بدل مربعاتها",
          exam: "نبحث عن المثلث القائم داخل المجسم",
          chip: "a^2+b^2=c^2",
          quiz: [
            { q: "$AC^2=3{,}15^2+2{,}35^2=$", options: ["$15{,}445$", "$5{,}5$", "$30{,}89$"], correct: 0 },
            { q: "الحرف $[CD]$ عمودي على الوجه فالمثلث $ACD$ قائم في:", options: ["$C$", "$A$", "$D$"], correct: 0 },
          ],
        },
        title: 'مثلث قائم داخل مجسّم', summary: 'نبحث في المجسّم عن مثلث قائم يضمّ الطول المطلوب، نحسب بخاصية فيثاغورس مرتين إن لزم، ونحتفظ بالقيم المضبوطة حتى النسبة المثلثية الأخيرة.',
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.fada}</MathText></li>
            <li><MathText>{REMARKS.fadaPyth}</MathText></li>
          </ul>
        ) },
    ],
  },
};
