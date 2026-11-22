import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION, analysisText } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle (LESSON_CONTRACT) : ce sont les outils des quatre دروس de l'unité
 * mobilisés par la وضعية des deux coureurs, et la DÉMARCHE du manuel (قراءة → تحليل واختيار استراتيجية → تنفيذ).
 *   qiraat-masarayn      module 7 — lire la figure : (1) trois demi-cercles posés sur l'axe des abscisses, (2) une ligne brisée
 *   nisf-daira-markaz    module 7 — un demi-cercle : centre = milieu du diamètre, rayon = moitié, longueur π r
 *   tul-khatt-munkasir   module 7 — une ligne brisée : somme des distances √((Δx)² + (Δy)²)
 *   muqaranat-masarayn   module 7 — comparer : valeurs exactes, puis approchées (arrondir à la fin), jamais à l'œil
 *   tariqat-wadiya       module 7 — la démarche en trois phases (les mots du manuel)
 * Les réponses du « إختبار أولي » (les pistes de VTT de Constantine) ne sont dans aucun item.
 */
/** `memo` — la FICHE DE MÉMOIRE de chaque connaissance (MemoCard) : ce qui CHANGE dans la règle est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'qiraat-masarayn', type: 'concepts', title: 'قراءة المسارين في المعلم', summary: 'المسار الأول ثلاثة أنصاف دوائر أطرافها على محور الفواصل، والمسار الثاني خط منكسر من ثلاث قطع؛ نقرأ إحداثيات أطراف كل جزء.',
        memo: {
          rule: `P(${R('x')}\\,;\\,${R('y')})`,
          hook: 'ابدأ بقراءة الإحداثيات',
          example: `A(-2\\,;\\,0),\\ O(0\\,;\\,0),\\ E(2\\,;\\,0),\\ B(4\\,;\\,0)`,
          trap: 'خلط الفاصلة بالترتيب عند القراءة',
          exam: 'دوّن إحداثيات الأطراف قبل أي حساب',
          chip: `P(x\\,;\\,y)`,
          quiz: [
      { q: 'نقرأ إحداثيتي نقطة بترتيب:', options: ['الفاصلة ثم الترتيب', 'الترتيب ثم الفاصلة', 'أيهما كان'], correct: 0 },
      { q: 'أطراف أنصاف الدوائر على محور الفواصل ترتيبها:', options: ['$0$', '$1$', '$-1$'], correct: 0 },
          ],
        },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.tafsir1}</MathText></li>
            <li><MathText>{REMARKS.tartib}</MathText></li>
            <li><MathText>{REMARKS.axe}</MathText></li>
          </ul>
        ) },
      { id: 'nisf-daira-markaz', type: 'regles', title: 'نصف دائرة في معلم', summary: 'مركز نصف الدائرة هو منتصف قطرها، ونصف قطرها نصف طول القطر، وطولها يساوي π ضرب نصف القطر.',
        memo: {
          rule: `r=\\dfrac{AB}{2}\\ ,\\ \\ell=${R('\\pi r')}`,
          hook: 'نصف القطر ثم طول القوس',
          example: `r=\\dfrac{2}{2}=1,\\quad \\ell=\\pi\\times1=\\pi`,
          trap: 'أخذ القطر مكان نصف القطر في قانون الطول',
          exam: 'أوجد المركز ثم نصف القطر ثم الطول',
          chip: `\\ell=${R('\\pi r')}`,
          quiz: [
      { q: 'طول نصف دائرة نصف قطرها $2$ :', options: ['$2\\pi$', '$4\\pi$', '$\\pi$'], correct: 0 },
      { q: 'مركز نصف الدائرة التي قطرها $[AB]$ :', options: ['منتصف $[AB]$', 'النقطة $A$', 'النقطة $B$'], correct: 0 },
          ],
        },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.markaz}</MathText></li>
            <li><MathText>{REMARKS.centres}</MathText></li>
            <li><MathText>{REMARKS.muhit}</MathText></li>
          </ul>
        ) },
      { id: 'tul-khatt-munkasir', type: 'regles', title: 'طول خط منكسر في معلم', summary: 'طول القطعة هو المسافة بين طرفيها في المعلم المتعامد والمتجانس، وطول الخط المنكسر مجموع أطوال قطعه.',
        memo: {
          rule: `L=${R('AB')}+${R('BC')}+${R('CD')}`,
          hook: 'مجموع أطوال القطع',
          example: `MP=\\sqrt{3^2+(-2)^2}=\\sqrt{13}`,
          trap: 'جمع مركبات القطع بدل أطوالها',
          exam: 'اكتب كل طول بالجذر ثم اجمعها',
          chip: `L=AB+BC+CD`,
          quiz: [
      { q: 'طول القطعة بين $M(-2\\,;\\,3)$ و $P(1\\,;\\,1)$ :', options: ['$\\sqrt{13}$', '$5$', '$13$'], correct: 0 },
      { q: 'طول الخط المنكسر هو:', options: ['مجموع أطوال قطعه', 'طول القطعة الأولى والأخيرة', 'المسافة بين طرفيه'], correct: 0 },
          ],
        },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.qita}</MathText></li>
            <li><MathText>{REMARKS.MP}</MathText></li>
          </ul>
        ) },
      { id: 'muqaranat-masarayn', type: 'methodes', title: 'مقارنة طولي مسارين', summary: 'نكتب الطولين بالقيمة المضبوطة، ثم نقارن قيمتيهما المقرّبتين مع التدوير في الأخير؛ العين لا تكفي عندما يتقارب الطولان.',
        memo: {
          rule: `L_1\\approx ${R('9{,}42')}\\ ,\\ L_2\\approx ${R('9{,}96')}`,
          hook: 'قارن القيمتين المقرّبتين',
          example: `3\\pi\\approx 9{,}42<9{,}96\\approx\\sqrt{13}+\\sqrt{5}+\\sqrt{17}`,
          trap: 'الحكم بالعين حين يتقارب الطولان',
          exam: 'اكتب القيمتين المضبوطتين ثم المقرّبتين وقارن',
          chip: `3\\pi<\\sqrt{13}+\\sqrt{5}+\\sqrt{17}`,
          quiz: [
      { q: 'للمقارنة بين $3\\pi$ و $\\sqrt{13}+\\sqrt{5}+\\sqrt{17}$ نستعمل:', options: ['قيمتين مقرّبتين', 'النظر إلى الرسم', 'عدد القطع'], correct: 0 },
      { q: 'إذا كان $L_1\\approx9{,}42$ و $L_2\\approx9{,}96$ فالأقصر:', options: ['المسار الأول', 'المسار الثاني', 'متساويان'], correct: 0 },
          ],
        },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.muqarana}</MathText></li>
            <li><MathText>{REMARKS.tadwir}</MathText></li>
          </ul>
        ) },
      { id: 'tariqat-wadiya', type: 'methodes', title: 'طريقة: من النص إلى الجواب', summary: 'نقرأ الوضعية ونرتّب المعطيات، نحلّلها بتفسير التمثيلين البيانيين، ثم ننفّذ: إحداثيات، منتصفات، مسافات، ونقارن.',
        memo: {
          rule: `${R('A')}\\to${R('I')}\\to${R('d')}\\to${R('L')}`,
          hook: 'إحداثيات ثم منتصفات ثم مسافات ثم مقارنة',
          example: `I(-1\\,;\\,0),\\ r=1,\\ \\ell=\\pi`,
          trap: 'القفز إلى الحساب قبل قراءة الإحداثيات',
          exam: 'رتّب الكتابة: المعطيات ثم التحليل ثم التنفيذ ثم المقارنة',
          chip: `A\\to I\\to d\\to L`,
          quiz: [
      { q: 'أول خطوة في حل الوضعية:', options: ['قراءة المعطيات وإحداثيات الأطراف', 'المقارنة بالنظر', 'حساب الطول مباشرة'], correct: 0 },
      { q: 'نختم الوضعية بـ:', options: ['مقارنة القيمتين المقرّبتين وكتابة الجواب', 'رسم المسارين فقط', 'حساب المنتصفات'], correct: 0 },
          ],
        },
        body: (
          <ol className="list-decimal ms-5 space-y-1">
            {SITUATION.analysis.map((a) => <li key={a.label}><strong>{a.label}</strong>: <MathText>{analysisText(a)}</MathText></li>)}
          </ol>
        ) },
    ],
  },
};
