import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION, analysisText } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE dans la règle s'écrit en rouge. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

/**
 * Une synthèse n'introduit aucune notion nouvelle (LESSON_CONTRACT) : ce sont la DÉMARCHE du manuel (قراءة → تحليل واختيار
 * استراتيجية → تنفيذ) appliquée à la وضعية « أعمدة الإنارة حول الحيّز الدائري ».
 *   tawzi-dawaran   module 7 — n poteaux également espacés = sommets d'un polygone régulier, chacun image du précédent par
 *                   le دوران (O, 360°/n) — le دوران garde les écarts
 *   masafa-amudayn  module 7 — n = 6 : triangles équilatéraux, d = r = 3 m
 *   qanun-masafa    module 7 — le triangle rectangle de la hauteur : d = 2r·sin(180°/n)
 *   tariqat-wadiya  module 7 — la démarche en trois phases (les mots du manuel)
 * Les réponses de « وضعية الاختبار النهائي » (le rond-point d'Oran) ne sont dans aucun item.
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'tawzi-dawaran', type: 'methodes', title: 'توزيع أعمدة بانتظام بالدوران',
        memo: {
          rule: `P_{k+1}=r\\left(O\\,;\\,${R('\\dfrac{360^{\\circ}}{n}')}\\right)(P_k)`,
          hook: 'كل عمود صورة الذي قبله',
          example: `P_2=r\\left(O\\,;\\,${R('60^{\\circ}')}\\right)(P_1)`,
          trap: 'الاكتفاء بوضع الأعمدة بالعين',
          exam: 'اكتب زاوية الدوران ثم أن الأعمدة رؤوس مضلع منتظم',
          chip: `\\tfrac{360^{\\circ}}{n}`,
          quiz: [
            { q: '$6$ أعمدة موزعة بانتظام على دائرة، الزاوية عند المركز بين عمودين متتاليين:', options: ['$60^\\circ$', '$30^\\circ$', '$120^\\circ$'], correct: 0 },
            { q: '$8$ أعمدة موزعة بانتظام، زاوية الدوران:', options: ['$45^\\circ$', '$40^\\circ$', '$60^\\circ$'], correct: 0 },
          ],
        },
 summary: 'n عمودا متباعدة بنفس المسافة على دائرة هي رؤوس مضلع منتظم مركزه مركز الدائرة: كل عمود صورة الذي قبله بالدوران الذي مركزه المركز وزاويته 360 درجة على n.',
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.muntazam}</MathText></li>
            <li><MathText>{REMARKS.zawiya}</MathText></li>
            <li><MathText>{REMARKS.dawaran}</MathText></li>
            <li><MathText>{REMARKS.tasawi}</MathText></li>
          </ul>
        ) },
      { id: 'masafa-amudayn', type: 'regles', title: 'السداسي: المسافة تساوي نصف القطر',
        memo: {
          rule: `d=${R('r')}`,
          hook: 'في السداسي المسافة تساوي نصف القطر',
          example: `d=r=${R('3')}\\ \\mathrm{m}`,
          trap: 'تعميم هذه النتيجة على كل عدد من الأعمدة',
          exam: 'اكتب أن المثلث متساوي الساقين وزاويته ستون درجة فهو متقايس الأضلاع',
          chip: `d=r`,
          quiz: [
            { q: 'ستة أعمدة على دائرة نصف قطرها $5\\ \\mathrm{m}$، المسافة بين عمودين متتاليين:', options: ['$5\\ \\mathrm{m}$', '$10\\ \\mathrm{m}$', '$2{,}5\\ \\mathrm{m}$'], correct: 0 },
            { q: 'لماذا تساوي المسافة نصف القطر في السداسي؟', options: ['لأن المثلث الذي رأساه عمودان ورأسه المركز متقايس الأضلاع', 'لأن الدائرة مقسومة إلى ستة أقواس فقط', 'لأن جيب $30^\\circ$ يساوي $1$'], correct: 0 },
          ],
        },
 summary: 'في السداسي المنتظم، المثلث الذي رأساه عمودان متتاليان ورأسه الثالث المركز متقايس الأضلاع، فالمسافة بين عمودين متتاليين تساوي نصف القطر.',
        body: <p><MathText>{REMARKS.mutaqayis}</MathText></p> },
      { id: 'qanun-masafa', type: 'regles', title: 'المسافة في المثلث القائم',
        memo: {
          rule: `d=2${R('r')}\\sin\\dfrac{180^{\\circ}}{n}`,
          hook: 'ضعف الجيب لنصف الزاوية',
          example: `d=2\\times ${R('2')}\\times\\sin 45^{\\circ}\\approx 2{,}83`,
          trap: 'استعمال جيب الزاوية كلها بدل نصفها',
          exam: 'اكتب المثلث القائم ثم نصف الزاوية ثم المسافة',
          chip: `2r\\sin\\tfrac{180^{\\circ}}{n}`,
          quiz: [
            { q: 'أربعة أعمدة على دائرة نصف قطرها $2\\ \\mathrm{m}$، المسافة بين عمودين متتاليين:', options: ['$2\\sqrt{2}\\ \\mathrm{m}$', '$4\\ \\mathrm{m}$', '$2\\ \\mathrm{m}$'], correct: 0 },
            { q: 'في قانون المسافة نستعمل جيب:', options: ['نصف الزاوية المركزية', 'الزاوية المركزية كلها', 'ضعف الزاوية المركزية'], correct: 0 },
          ],
        },
 summary: 'الارتفاع النازل من المركز ينصّف الزاوية المركزية والوتر: في المثلث القائم جيب نصف الزاوية يساوي نصف المسافة على نصف القطر، ومنه المسافة بين عمودين متتاليين.',
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.jaib}</MathText></li>
            <li><MathText>{REMARKS.qanun}</MathText></li>
          </ul>
        ) },
      { id: 'tariqat-wadiya', type: 'methodes', title: 'طريقة: من النص إلى المخطط',
        memo: {
          rule: `n\\to ${R('\\alpha')}\\to ${R('d')}`,
          hook: 'العدد ثم الزاوية ثم المسافة',
          example: `6\\to ${R('60^{\\circ}')}\\to ${R('3')}`,
          trap: 'الحساب قبل قراءة معطيات الوضعية',
          exam: 'اكتب تحليل الوضعية ثم خطة الحل ثم التحقق',
          chip: `n\\to\\alpha\\to d`,
          quiz: [
            { q: 'أول خطوة في وضعية الأعمدة:', options: ['قراءة المعطيات: العدد ونصف القطر', 'حساب المسافة مباشرة', 'رسم المخطط بمقياس'], correct: 0 },
            { q: 'بعد إيجاد زاوية الدوران نحسب:', options: ['المسافة بين عمودين', 'نصف القطر', 'عدد الأعمدة'], correct: 0 },
          ],
        },
 summary: 'نقرأ الوضعية (الشكل، العدد، نصف القطر)، نحلّلها (مضلع منتظم، زاوية الدوران، المسافة في المثلث القائم)، ثم ننفّذ المخطط بمقياس مناسب ونتحقّق.',
        body: (
          <ol className="list-decimal ms-5 space-y-1">
            {SITUATION.analysis.map((a) => <li key={a.label}><strong>{a.label}</strong>: <MathText>{analysisText(a)}</MathText></li>)}
            <li><MathText>{REMARKS.sullam}</MathText></li>
          </ol>
        ) },
    ],
  },
};
