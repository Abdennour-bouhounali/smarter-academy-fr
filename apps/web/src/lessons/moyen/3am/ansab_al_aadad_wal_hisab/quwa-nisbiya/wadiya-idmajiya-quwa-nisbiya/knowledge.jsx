import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle : ce sont la DÉMARCHE (la feuille d'or de Nour) et les moments de choix.
 *   wahda-mushtaraka  module 7 — deux longueurs en unités différentes se convertissent d'abord en mètres, par des puissances de 10
 *   qisma-tulayn      module 7 — « combien de fois » = un quotient de deux longueurs de même unité
 *   rutba-ilmiya      module 7 — l'ordre de grandeur se lit sur l'écriture scientifique du résultat
 * La SOLUTION (2,88 × 10⁻¹⁰ ; 10⁻⁷ ; 3,47 × 10² ; 3 × 10² ; entre 10⁶ et 10⁷) n'est dans aucun item : c'est la réponse de l'évaluation.
 */
/** `memo` : la fiche de « 🔑 للتذكّر » — ce qui CHANGE en `R(…)` (rouge). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'wahda-mushtaraka', type: 'methodes', title: 'نوحّد الوحدة أوّلًا', summary: 'قبل أن نقسم قياسين نحوّلهما إلى وحدة واحدة بقوى العدد 10.',
        memo: {
          rule: `1\\,\\mu\\mathrm{m}=${R('10^{-6}')}\\,\\mathrm{m}\\ ,\\ 1\\,\\mathrm{pm}=${R('10^{-12}')}\\,\\mathrm{m}`,
          hook: 'نفس الوحدة قبل أيّ قسمة',
          example: `0{,}5\\,\\mu\\mathrm{m}=0{,}5\\times10^{-6}\\,\\mathrm{m}`,
          trap: 'نقسم $\\mu\\mathrm{m}$ على $\\mathrm{pm}$ دون تحويل',
          exam: 'اكتب تحويل كل قياس إلى المتر في سطر',
          chip: `\\mu\\mathrm{m}\\to10^{-6}\\,\\mathrm{m}`,
          quiz: [
            { q: 'قبل قسمة سُمك مُعطى بـ $\\mu\\mathrm{m}$ على قطر مُعطى بـ $\\mathrm{pm}$ نحوّلهما إلى:', options: ['وحدة واحدة', 'أصغر وحدة فقط', 'لا نحوّل'], correct: 0 },
            { q: 'ما قيمة $1\\,\\mu\\mathrm{m}$ بالمتر؟', options: ['$10^{6}$', '$10^{-6}$', '$10^{-3}$'], correct: 1 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p><MathText>{REMARKS.unitWhy}</MathText></p>
            <p><MathText>{REMARKS.unitRight}</MathText></p>
          </div>
        ) },
      { id: 'qisma-tulayn', type: 'regles', title: 'كم مرّة؟ قسمة طولين', summary: 'عدد المرّات التي يتّسع فيها طول داخل طول آخر هو خارج قسمتهما.',
        memo: {
          rule: `N=\\dfrac{e}{${R('d')}}`,
          hook: 'كم مرّة يتّسع الصغير في الكبير؟',
          example: `N=\\dfrac{2}{0{,}5}=4\\ \\ (\\mathrm{cm})`,
          trap: 'نقسم الصغير على الكبير',
          exam: 'اكتب العملية بالرموز ثم بالأعداد',
          chip: `N=\\dfrac{e}{d}`,
          quiz: [
            { q: 'عدد الطبقات في سُمك $e$ إذا كان قطر الطبقة $d$ هو:', options: ['$e\\times d$', '$\\dfrac{e}{d}$', '$\\dfrac{d}{e}$'], correct: 1 },
            { q: 'في قسمة طولين بالوحدة نفسها يكون الناتج:', options: ['طولًا', 'عددًا بلا وحدة', 'مساحة'], correct: 1 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p><MathText>{REMARKS.divWhy}</MathText></p>
            <p><MathText>{SITUATION.analysis[1].text}</MathText></p>
          </div>
        ) },
      { id: 'rutba-ilmiya', type: 'methodes', title: 'رتبة القدر من الكتابة العلمية', summary: 'نكتب النتيجة كتابة علمية ثم نُدوّر العدد الأوّل إلى الوحدة.',
        memo: {
          rule: `a\\times10^{n}\\ \\Rightarrow\\ ${R("a'")}\\times10^{n}`,
          hook: 'اكتب علميًّا ثم دوّر a',
          example: `6{,}2\\times10^{3}\\ \\Rightarrow\\ 6\\times10^{3}`,
          trap: 'نعدّ أرقام النتيجة بدل قراءة الأسّ',
          exam: 'اكتب الكتابة العلمية في سطر ثم رتبة القدر',
          chip: `a\\times10^{n}\\to a'\\times10^{n}`,
          quiz: [
            { q: 'رتبة قدر $4{,}7\\times10^{3}$ هي:', options: ['$4\\times10^{3}$', '$5\\times10^{3}$', '$5\\times10^{4}$'], correct: 1 },
            { q: 'رتبة القدر تُقرأ من:', options: ['عدد أرقام النتيجة', 'الكتابة العلمية للنتيجة', 'الوحدة فقط'], correct: 1 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p><MathText>{REMARKS.orderWhy}</MathText></p>
            <ol className="list-decimal ms-5 space-y-1">
              {SITUATION.analysis.map((a) => <li key={a.label}><strong>{a.label}</strong>: <MathText>{a.text}</MathText></li>)}
            </ol>
          </div>
        ) },
    ],
  },
};
