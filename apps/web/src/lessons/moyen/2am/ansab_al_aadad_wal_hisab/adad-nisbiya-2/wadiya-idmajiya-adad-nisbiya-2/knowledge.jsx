import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle : ce sont la DÉMARCHE (le camp d'hiver à Djelfa) et les moments de choix.
 *   ikhtiyar-hisab     module 7 — quel calcul pour quelle question : l'ordre (la plus froide), la distance (l'écart d'un jour), la différence orientée (le changement)
 *   taghayyur-wa-majmu module 7 — le changement est « nouveau − ancien » (son signe dit la hausse ou la baisse) et le total des changements est une somme algébrique qu'on peut contrôler
 *   tariqat-wadiya-2   module 7 — la démarche complète, posée APRÈS les questions
 * La SOLUTION (−5,5 < −3 < −2 < −0,5 < +1 ; 10 ; +6,5 ; +1 ; (4 ; −0,5)) n'est dans aucun item : c'est la réponse de l'évaluation.
 */
/** `memo` : la fiche de « 🔑 للتذكّر » — ce qui CHANGE en `R(…)` (rouge). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'ikhtiyar-hisab', type: 'regles', title: 'أيّ حساب لأيّ سؤال؟', summary: 'الأبرد بالترتيب، والفارق مسافة، والتغيّر جديد ناقص قديم.',
        memo: {
          rule: `d=${R('b')}-a`,
          hook: 'الفارق: الأكبر ناقص الأصغر',
          example: `(+7)-(-2)=9`,
          trap: 'نرتّب السالبة بحسب مسافاتها لا أعدادها',
          exam: 'اكتب الطرح أوّلًا ثم احسب',
          chip: `d=b-a`,
          quiz: [
            { q: 'درجتان: $-6$ و $+3$ . فارقهما هو:', options: ['$(+3)-(-6)=9$', '$6-3=3$', '$(-6)-(+3)=-9$'], correct: 0 },
            { q: 'بين العددين $-4$ و $-1$ ، الأصغر هو:', options: ['$-1$', '$-4$', 'لا يمكن تحديده'], correct: 1 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p><MathText>{REMARKS.orderWhy}</MathText></p>
            <p><MathText>{REMARKS.rangeRight}</MathText></p>
          </div>
        ) },
      { id: 'taghayyur-wa-majmu', type: 'regles', title: 'التغيّر ومجموع التغيّرات', summary: 'التغيّر جديد ناقص قديم، وإشارته تقول ارتفع أم انخفض.',
        memo: {
          rule: `x_2-${R('x_1')}`,
          hook: 'الجديد ناقص القديم',
          example: `(+2)-(-4)=+6`,
          trap: 'القديم ناقص الجديد يعكس الإشارة',
          exam: 'راجع المجموع: الأخيرة ناقص الأولى',
          chip: `x_2-x_1`,
          quiz: [
            { q: 'الدرجة من $-3$ إلى $+2$ : التغيّر هو:', options: ['$+5$', '$-5$', '$-1$'], correct: 0 },
            { q: 'التغيّرات $+3$ و $-1$ و $-4$ مجموعها الجبري:', options: ['$-2$', '$+2$', '$-8$'], correct: 0 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p><MathText>{REMARKS.oldNewRight}</MathText></p>
            <p><MathText>{REMARKS.sumCheck}</MathText></p>
          </div>
        ) },
      { id: 'tariqat-wadiya-2', type: 'methodes', title: 'طريقة: من الوضعية إلى الحساب', summary: 'نقرأ، نختار الحساب لكلّ سؤال، ثم ننفّذ ونتحقّق.',
        memo: {
          rule: `${R('1')}\\to2\\to3\\to4`,
          hook: 'اقرأ ثم اختر ثم احسب ثم تحقّق',
          example: `1\\to2\\to3`,
          trap: 'نبدأ بالحساب قبل فهم السؤال',
          exam: 'اكتب الحساب ثم الجواب بوحدته',
          chip: `1\\to2\\to3\\to4`,
          quiz: [
            { q: 'أوّل خطوة في الوضعية الإدماجية:', options: ['كتابة الجواب النهائي', 'قراءة المعطيات وتمييز المفيد منها', 'إجراء أكبر عملية'], correct: 1 },
            { q: 'آخر خطوة بعد الحساب:', options: ['التحقّق من إشارة النتيجة ومن معقوليتها', 'حذف المعطيات', 'البدء من جديد'], correct: 0 },
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
