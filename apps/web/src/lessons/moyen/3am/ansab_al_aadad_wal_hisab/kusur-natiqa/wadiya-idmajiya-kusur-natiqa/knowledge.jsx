import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle : ce sont la DÉMARCHE (la tirelire de Meriem) et les moments de choix.
 *   kasr-minhu    module 7 — un كسر est toujours « d'un tout » : du tout (1/3, 1/4) ou du reste (3/5)
 *   tartib-hisab  module 7 — l'ordre des calculs : chaque calcul a besoin du précédent
 *   tariqat-wadiya module 7 — la démarche complète, posée APRÈS les trois questions
 * La SOLUTION (7/12 ; 5/12 ; 1/4 ; 1/6 ; 9000 DA) n'est dans aucun item : c'est la réponse de l'évaluation.
 */
/** `memo` : la fiche de « 🔑 للتذكّر » — ce qui CHANGE en `R(…)` (rouge). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'kasr-minhu', type: 'regles', title: 'كسر من ماذا؟', summary: 'كل كسر هو كسر من شيء: من الكلّ، أو من الباقي بعد ما أُخذ.',
        memo: {
          rule: `\\dfrac{a}{b}\\times${R('T')}`,
          hook: 'اسأل: كسر من أيّ مقدار؟',
          example: `\\dfrac{a}{b}\\times T\\ ,\\ \\dfrac{c}{d}\\times(T-\\dfrac{a}{b}T)`,
          trap: 'نحسب كسرًا من الكلّ وهو من الباقي',
          exam: 'اكتب بعد كلّ كسر: من أيّ مقدار',
          chip: `\\tfrac{c}{d}\\times${R('R_1')}`,
          quiz: [
            { q: 'أنفق علي $\\frac{2}{5}$ من مبلغ $T$ ثم $\\frac{1}{2}$ من الباقي. الكسر الثاني هو كسر من:', options: ['$T$ كلّه', 'ما بقي بعد الأوّل', 'ما أنفقه أوّلًا'], correct: 1 },
            { q: 'ما يبقى بعد إنفاق $\\frac{2}{5}$ من $T$ هو:', options: ['$\\frac{2}{5}T$', '$\\frac{5}{3}T$', '$\\frac{3}{5}T$'], correct: 2 },
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
          rule: `R_1=T-\\dfrac{a}{b}T\\ ,\\ R_2=R_1-\\dfrac{c}{d}${R('R_1')}`,
          hook: 'كلّ حساب يبني على الذي قبله',
          example: `T\\to R_1\\to R_2`,
          trap: 'نقفز إلى المطلوب قبل حساب المرحلة الأولى',
          exam: 'رتّب الحسابات في أسطر متتالية',
          chip: `R_2=R_1-\\tfrac{c}{d}R_1`,
          quiz: [
            { q: 'نحسب ما أُنفق أوّلًا ثم:', options: ['الكسر من الباقي قبل الباقي', 'ما بقي ثم الكسر من الباقي', 'نجمع الكسور مباشرة'], correct: 1 },
            { q: 'إذا بقي $R$ وأُعطي $\\frac{1}{2}$ منه فما يبقى:', options: ['$2R$', '$\\frac{1}{2}R$', '$R+\\frac{1}{2}$'], correct: 1 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p><MathText>{REMARKS.orderWhy}</MathText></p>
            <p><MathText>{'الكلّ مجموع أجزائه، فما بقي هو $1$ ناقص المُنفَق؛ وحين يُعطى كسر من الباقي نضربه في الباقي.'}</MathText></p>
          </div>
        ) },
      { id: 'tariqat-wadiya', type: 'methodes', title: 'طريقة: من الوضعية إلى الحساب', summary: 'نقرأ، نختار العمليات وترتيبها، ثم ننفّذ ونتحقّق.',
        memo: {
          rule: `${R('1')}\\to2\\to3\\to4`,
          hook: 'اقرأ ثم اختر ثم احسب ثم تحقّق',
          example: `T\\to R_1\\to R_2\\to T-R_2`,
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
