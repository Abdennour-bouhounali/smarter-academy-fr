import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle : ce sont la DÉMARCHE (la terre de la coopérative) et les moments de choix.
 *   kasr-minhu    module 7 — un كسر est toujours « d'un tout » : de la terre (3/8, 1/4, 1/8) ou du verger (2/3)
 *   tartib-hisab  module 7 — l'ordre des calculs : chaque calcul a besoin du précédent
 *   tariqat-wadiya module 7 — la démarche complète, posée APRÈS les questions
 * La SOLUTION (3/4 ; 1/4 ; 1/6 ; 9600 m² ; 1600 m² ; 0,48 < … < 0,49) n'est dans aucun item : c'est la réponse de l'évaluation.
 */
/** `memo` : la fiche de « 🔑 للتذكّر » — ce qui CHANGE en `R(…)` (rouge). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'kasr-minhu', type: 'regles', title: 'كسر من ماذا؟', summary: 'كل كسر هو كسر من شيء: من الكلّ، أو من جزء منه.',
        memo: {
          rule: `\\dfrac{a}{b}\\times${R('P')}`,
          hook: 'اسأل: كسر من أيّ مقدار؟',
          example: `\\dfrac{c}{d}\\times T\\ ,\\ \\dfrac{a}{b}\\times\\left(\\dfrac{c}{d}\\times T\\right)`,
          trap: 'نحسب كسرًا من الكلّ وهو من جزء',
          exam: 'اكتب بعد كلّ كسر: من أيّ مقدار',
          chip: `\\tfrac{a}{b}\\times${R('P')}`,
          quiz: [
            { q: 'في أرض مساحتها $T$ زُرع $\\frac{1}{5}$ منها بستانًا و $\\frac{3}{4}$ البستان تفّاحًا. الكسر $\\frac{3}{4}$ هو كسر من:', options: ['$T$ كلّها', 'البستان', 'ما زُرع قمحًا'], correct: 1 },
            { q: 'ما يبقى من $T$ بعد أخذ $\\frac{3}{8}$ منها هو:', options: ['$\\frac{3}{8}T$', '$\\frac{8}{3}T$', '$\\frac{5}{8}T$'], correct: 2 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p><MathText>{REMARKS.baseWhy}</MathText></p>
            <p><MathText>{REMARKS.wholeRight}</MathText></p>
          </div>
        ) },
      { id: 'tartib-hisab', type: 'methodes', title: 'ترتيب الحسابات', summary: 'نبدأ بما نعرفه، وكل حساب يعتمد على نتيجة الذي قبله.',
        memo: {
          rule: `V=1-P\\ ,\\ A=\\dfrac{e}{f}\\times${R('V')}`,
          hook: 'كلّ حساب يبني على الذي قبله',
          example: `P\\to V\\to A`,
          trap: 'نقفز إلى المطلوب قبل حساب المرحلة الأولى',
          exam: 'رتّب الحسابات في أسطر متتالية',
          chip: `A=\\tfrac{e}{f}\\times V`,
          quiz: [
            { q: 'نحسب المزروع أوّلًا ثم:', options: ['كسر البستان من الأرض ثم نأخذ كسره', 'نأخذ كسر البستان قبل معرفته', 'نجمع كلّ الكسور مباشرة'], correct: 0 },
            { q: 'إذا كان البستان $\\frac{1}{5}$ من الأرض فنصفه يساوي من الأرض:', options: ['$\\frac{1}{2}$', '$\\frac{1}{10}$', '$\\frac{1}{5}+\\frac{1}{2}$'], correct: 1 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p><MathText>{REMARKS.orderWhy}</MathText></p>
            <p><MathText>{'الكلّ مجموع أجزائه، فما بقي هو $1$ ناقص المزروع؛ وحين يُؤخذ كسر من ذلك الجزء نضربه فيه.'}</MathText></p>
          </div>
        ) },
      { id: 'tariqat-wadiya', type: 'methodes', title: 'طريقة: من الوضعية إلى الحساب', summary: 'نقرأ، نختار العمليات وترتيبها، ثم ننفّذ ونتحقّق.',
        memo: {
          rule: `${R('1')}\\to2\\to3\\to4`,
          hook: 'اقرأ ثم اختر ثم احسب ثم تحقّق',
          example: `P\\to V\\to A`,
          trap: 'نبدأ بالحساب قبل فهم المعطيات',
          exam: 'اكتب المعطيات المفيدة ثم الحسابات ثم التحقق',
          chip: `1\\to2\\to3\\to4`,
          quiz: [
            { q: 'أوّل خطوة في الوضعية الإدماجية:', options: ['كتابة الجواب النهائي', 'قراءة المعطيات وتمييز المفيد منها', 'إجراء أكبر عملية'], correct: 1 },
            { q: 'آخر خطوة بعد الحساب:', options: ['التحقق من أنّ النتيجة توافق معطيات الوضعية', 'حذف المعطيات', 'البدء من جديد'], correct: 0 },
          ],
        },
        body: (
          <ol className="list-decimal ms-5 space-y-1">
            {SITUATION.analysis.map((a) => <li key={a.label}><strong>{a.label}</strong>: <MathText>{a.text}</MathText></li>)}
          </ol>
        ) },
    ],
  },
};
