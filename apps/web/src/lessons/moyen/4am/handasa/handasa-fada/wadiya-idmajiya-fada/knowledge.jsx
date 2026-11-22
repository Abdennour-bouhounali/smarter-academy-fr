import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION, analysisText } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle (LESSON_CONTRACT) : ce sont la DÉMARCHE (قراءة → تحليل واختيار استراتيجية →
 * تنفيذ) appliquée à la وضعية du seau.
 *   mukhrut-mukammal  module 7 — compléter le cône : Thalès dans la coupe axiale donne le sommet S et le rayon de la surface
 *   hajm-mabtur       module 7 — le petit cône est une réduction (k) du grand : V = V₁ − V₂ = V₁(1 − k³)
 *   tariqat-wadiya-fada module 7 — la démarche en trois phases, puis l'arrondi et le litre
 * Les réponses de « إختبار أولي » (le verre de frappé d'Oran) ne sont dans aucun item.
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'mukhrut-mukammal', type: 'methodes', title: 'نكمل المخروط', 
        memo: {
          rule: '\\dfrac{SO}{SO+H}=\\dfrac{\\textcolor{#e11d48}{r}}{R}',
          hook: 'نمدّد الجدارين حتى يلتقيا',
          example: 'r=15,R=20,H=35:\\ SO=105',
          trap: 'معاملة الدلو كأنه أسطوانة',
          exam: 'ارسم المقطع المحوري ثم طبّق خاصية طالس',
          chip: 'SO=\\tfrac{rH}{R-r}',
          quiz: [
            { q: 'تمديد جداري الدلو حتى يلتقيا يعطينا:', options: ['مخروطا كاملا رأسه على المحور', 'أسطوانة', 'كرة'], correct: 0 },
            { q: 'في دلو $r=15$ و $R=20$ و $H=35$ ، قيمة $SO$ :', options: ['$105$', '$140$', '$35$'], correct: 0 },
          ],
        },
        summary: 'الدلو مخروط مبتور: نمدّد جداريه حتى يلتقيا على المحور في رأس المخروط، ثم نطبّق خاصية طالس في المقطع المحوري لنجد بعد الرأس عن القاع ونصف قطر سطح الماء.',
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.shakl}</MathText></li>
            <li><MathText>{REMARKS.takmil}</MathText></li>
            <li><MathText>{REMARKS.talisRho}</MathText></li>
          </ul>
        ) },
      { id: 'hajm-mabtur', type: 'regles', title: 'حجم المخروط المبتور', 
        memo: {
          rule: 'V=V_1\\left(1-\\textcolor{#e11d48}{k^3}\\right)',
          hook: 'الكبير ناقص الصغير',
          example: 'k=\\tfrac{3}{4}:\\ V=V_1\\times\\tfrac{37}{64}',
          trap: 'استعمال النسبة k بدل مكعبها',
          exam: 'اكتب الفرق بين المخروطين ثم احسب k مكعبا',
          chip: 'V=V_1-V_2',
          quiz: [
            { q: 'إذا كان $k=\\frac{3}{4}$ فحجم المخروط الصغير بالنسبة إلى الكبير:', options: ['$\\frac{27}{64}$', '$\\frac{3}{4}$', '$\\frac{9}{16}$'], correct: 0 },
            { q: 'حجم المخروط المبتور يساوي:', options: ['حجم الكبير ناقص حجم الصغير', 'حجم الكبير ضرب حجم الصغير', 'متوسط الحجمين'], correct: 0 },
          ],
        },
        summary: 'حجم مخروط مبتور هو حجم المخروط الكبير ناقص حجم المخروط الصغير؛ والصغير تصغير للكبير نسبته k، فحجمه k مكعّب مرة حجم الكبير.',
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.k}</MathText></li>
            <li><MathText>{REMARKS.k3}</MathText></li>
            <li><MathText>{REMARKS.hajm}</MathText></li>
          </ul>
        ) },
      { id: 'tariqat-wadiya-fada', type: 'methodes', title: 'طريقة: من النص إلى الحجم', 
        memo: {
          rule: 'V_1-V_2\\ \\Rightarrow\\ \\mathrm{cm}^3\\to\\mathrm{L}',
          hook: 'اقرأ ثم حلّل ثم نفّذ ثم دوّر',
          example: '25539{,}1\\,\\mathrm{cm}^3\\approx25{,}54\\,\\mathrm{L}',
          trap: 'التدوير قبل نهاية الحساب',
          exam: 'اكتب القيمة المضبوطة ثم المدورة مع الوحدة',
          chip: '1\\,\\mathrm{L}=1000\\,\\mathrm{cm}^3',
          quiz: [
            { q: 'لتحويل السنتيمتر المكعب إلى لتر نقسم على:', options: ['$1000$', '$100$', '$10$'], correct: 0 },
            { q: 'متى ندوّر العدد؟', options: ['في آخر الحساب', 'بعد كل عملية', 'قبل قراءة الأبعاد'], correct: 0 },
          ],
        },
        summary: 'نقرأ الشكل (الأبعاد ومستوى الماء)، نحلّل (شكل الماء، المخروط المكتمل، نسبة التصغير)، ثم ننفّذ الحساب وندوّر في آخره ونحوّل إلى اللتر ونتحقّق.',
        body: (
          <ol className="list-decimal ms-5 space-y-1">
            {SITUATION.analysis.map((a) => <li key={a.label}><strong>{a.label}</strong>: <MathText>{analysisText(a)}</MathText></li>)}
            <li><MathText>{REMARKS.tadwir}</MathText></li>
          </ol>
        ) },
    ],
  },
};
