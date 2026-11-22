import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION, analysisText } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle (LESSON_CONTRACT) : ce sont la DÉMARCHE du manuel
 * (قراءة → تحليل واختيار استراتيجية → تنفيذ) appliquée aux médailles d'or.
 *   qiraat-jadwal            module 7 — valeur / effectif / effectif total d'un tableau
 *   qima-makhfiya-wasit      module 7 — une valeur cachée qui contient les rangs de la médiane = la médiane
 *   qima-makhfiya-mutawassit module 7 — moyenne × N = Σ valeur × effectif : une équation en la valeur cachée
 *   kull-min-nisba           module 7 — le tout à partir d'un pourcentage (« أخذ نسبة من عدد » à l'envers)
 *   tariqat-wadiya           module 7 — la démarche en trois phases (les mots du manuel)
 * Les réponses de « إختبار أولي » (une autre compétition) ne sont dans aucun item.
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'qiraat-jadwal', type: 'methodes', title: 'قراءة جدول التكرارات', summary: 'كل قيمة في السطر الأول عدد ميداليات، وتكرارها عدد الدول التي فازت به؛ والتكرار الكلي مجموع التكرارات.',
      memo: {
        rule: `N=f_1+f_2+\\dots+${R('f_n')}`,
        hook: 'التكرار الكلي مجموع التكرارات',
        example: `N=5+7+3+${R('5')}=20`,
        trap: 'جمع القيم بدل جمع تكراراتها',
        exam: 'تحقق من التكرار الكلي قبل الحساب',
        chip: `N=\\sum f`,
        quiz: [
          { q: 'القيم $0,1,2$ بتكرارات $5,7,3$. التكرار الكلي:', options: ['$3$', '$12$', '$15$'], correct: 2 },
          { q: 'القيمة $2$ بتكرار $3$ تعني أن:', options: ['دولتين فازتا بثلاث ميداليات', 'ثلاث دول فازت بميداليتين', 'خمس دول فازت بميداليتين'], correct: 1 },
        ],
      },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.jadwal}</MathText></li>
            <li><MathText>{REMARKS.takrarKulli}</MathText></li>
          </ul>
        ) },
      { id: 'qima-makhfiya-wasit', type: 'methodes', title: 'قيمة مخفية يكشفها الوسيط', summary: 'نحدّد رتبتي الوسيط ونجمع التكرارات من البداية؛ إذا وقعت الرتبتان في عمود القيمة المخفية فهي تساوي الوسيط.',
      memo: {
        rule: `\\uparrow_{x-1}<\\dfrac{N}{2}\\le\\uparrow_{x}`,
        hook: 'الرتبتان تحدّدان العمود',
        example: `9<10\\le${R('14')}\\Rightarrow x=Me`,
        trap: 'نسيان أن الوسيط منتصف رتبتين',
        exam: 'حدّد رتبتي الوسيط ثم اجمع التكرارات',
        chip: `\\uparrow\\ge\\tfrac{N}{2}`,
        quiz: [
          { q: '$N=20$ . رتبتا الوسيط:', options: ['$9$ و $10$', '$10$ و $11$', '$20$ و $1$'], correct: 1 },
          { q: 'التكرارات المجمعة $4,9,14,20$ ورتبتا الوسيط $10$ و $11$. هما في العمود:', options: ['الثاني', 'الرابع', 'الثالث'], correct: 2 },
        ],
      },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.rutab}</MathText></li>
            <li><MathText>{REMARKS.mujamma}</MathText></li>
            <li><MathText>{REMARKS.wasitX}</MathText></li>
          </ul>
        ) },
      { id: 'qima-makhfiya-mutawassit', type: 'methodes', title: 'قيمة مخفية يكشفها المتوسط', summary: 'المتوسط مضروبا في التكرار الكلي يساوي مجموع جداءات القيم في تكراراتها، فنكتب معادلة مجهولها القيمة المخفية ونحلّها.',
      memo: {
        rule: `\\bar{x}\\times N=\\sum f_ix_i`,
        hook: 'المتوسط في الكلي هو المجموع',
        example: `4{,}1\\times20=4+18+10x\\Rightarrow x=${R('6')}`,
        trap: 'نسيان ضرب كل قيمة في تكرارها',
        exam: 'اكتب المعادلة ثم حلّها',
        chip: `\\bar{x}N=\\sum fx`,
        quiz: [
          { q: '$\\bar{x}=4{,}1$ و $N=20$. المجموع $\\sum f_ix_i$ يساوي:', options: ['$24{,}1$', '$82$', '$4{,}9$'], correct: 1 },
          { q: '$22+10x=82$ ، فإن $x$ يساوي:', options: ['$10{,}4$', '$60$', '$6$'], correct: 2 },
        ],
      },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.maloum}</MathText></li>
            <li><MathText>{REMARKS.muadala}</MathText></li>
            <li><MathText>{REMARKS.halY}</MathText></li>
            <li><MathText>{REMARKS.tahqiq}</MathText></li>
          </ul>
        ) },
      { id: 'kull-min-nisba', type: 'methodes', title: 'الكل من نسبة جزء', summary: 'إذا كانت نسبة مئوية من عدد مجهول تساوي عددا معلوما، نكتب المعادلة ونقسم المعلوم على النسبة، ثم ندوّر إلى الوحدة لأنّ الدول تُعدّ.',
      memo: {
        rule: `T=\\dfrac{a}{${R('p\\%')}}`,
        hook: 'اقسم المعلوم على النسبة',
        example: `\\dfrac{9}{${R('0{,}4')}}=22{,}5\\approx23`,
        trap: 'ضرب المعلوم في النسبة بدل قسمته',
        exam: 'دوّر الناتج إلى عدد صحيح لأن الدول تُعدّ',
        chip: `\\tfrac{a}{p}`,
        quiz: [
          { q: '$25\\%$ من عدد الدول يساوي $12$ دولة. عدد الدول:', options: ['$3$', '$48$', '$37$'], correct: 1 },
          { q: '$40\\%$ من عدد يساوي $9$. العدد يساوي:', options: ['$3{,}6$', '$22{,}5$', '$360$'], correct: 1 },
        ],
      },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.nisbaEq}</MathText></li>
            <li><MathText>{REMARKS.nisbaT}</MathText></li>
            <li><MathText>{REMARKS.nisbaFaqat}</MathText></li>
          </ul>
        ) },
      { id: 'tariqat-wadiya', type: 'methodes', title: 'طريقة: من النص إلى الجواب', summary: 'نقرأ الوضعية ونرتّب المعطيات، نختار المؤشر المناسب لكل مطلوب، ثم ننفّذ ونحرّر الحل بجمل واضحة.',
      memo: {
        rule: `1\\to2\\to3\\to${R('4')}`,
        hook: 'اقرأ اختر نفّذ حرّر',
        example: `\\sum f=20\\;\\to\\;\\bar{x}=\\dfrac{82}{20}=${R('4{,}1')}`,
        trap: 'كتابة رقم دون جملة تشرحه',
        exam: 'حرّر الحل بجمل واضحة',
        chip: `1\\to2\\to3\\to4`,
        quiz: [
          { q: 'بعد قراءة الوضعية وترتيب المعطيات نقوم بـ:', options: ['كتابة الجواب النهائي مباشرة', 'اختيار المؤشر المناسب لكل مطلوب', 'حذف أصغر قيمة'], correct: 1 },
          { q: 'المطلوب: القيمة الأكثر تكرارا. المؤشر المناسب:', options: ['المتوسط', 'المدى', 'المنوال'], correct: 2 },
        ],
      },
        body: (
          <ol className="list-decimal ms-5 space-y-1">
            {SITUATION.analysis.map((a) => <li key={a.label}><strong>{a.label}</strong>: {analysisText(a)}</li>)}
          </ol>
        ) },
    ],
  },
};
