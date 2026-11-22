import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle : ce sont la DÉMARCHE (la sortie au musée) et les moments de choix.
 *   thabit-wa-liktul  module 7 — un montant FIXE ne change pas avec le nombre d'élèves, un montant PAR ÉLÈVE se multiplie par ce nombre
 *   ikhtiyar-hisab    module 7 — quel calcul répond à quelle question : tester une inéquation en valeurs données, ou une équation à deux étapes
 *   tariqat-wadiya    module 7 — la démarche complète, posée APRÈS les questions
 * La SOLUTION (12000 + 200x ; 19200 ; 25 et 30 ; 40 ; 500) n'est dans aucun item : c'est la réponse de l'évaluation.
 */
/** `memo` : la fiche de « 🔑 للتذكّر » — ce qui CHANGE en `R(…)` (rouge). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'thabit-wa-liktul', type: 'regles', title: 'مبلغ ثابت ومبلغ عن كلّ تلميذ', summary: 'الثابت يُكتب كما هو، وما يُدفع عن كلّ واحد يُضرب في عددهم.',
        memo: {
          rule: `F+${R('p')}\\times x`,
          hook: 'اسأل: هل يتغيّر مع عدد التلاميذ؟',
          example: `3000+50x`,
          trap: 'نضرب المبلغ الثابت في عدد التلاميذ',
          exam: 'اكتب أوّلًا ما هو ثابت وما هو عن كلّ واحد',
          chip: `F+${R('p')}x`,
          quiz: [
            { q: 'تدفع مدرسة $3000$ للحافلة و $50$ عن كلّ تلميذ. عبارة التكلفة لـ $x$ تلميذ:', options: ['$3000+50x$', '$3050x$', '$50+3000x$'], correct: 0 },
            { q: 'في العبارة $3000+50x$ المبلغ الذي يتغيّر مع $x$ هو:', options: ['$3000$', '$50x$', '$3000+50$'], correct: 1 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p><MathText>{REMARKS.fixedPer}</MathText></p>
          </div>
        ) },
      { id: 'ikhtiyar-hisab', type: 'methodes', title: 'أيّ حساب لأيّ سؤال؟', summary: 'قيمة، أو اختبار متباينة بقيم معطاة، أو معادلة نلغي فيها العمليات من الأخيرة.',
        memo: {
          rule: `p\\times x=T-${R('F')}`,
          hook: 'نلغي الإضافة أوّلًا ثمّ الضرب',
          example: `50x=4500-3000`,
          trap: 'نقسم التكلفة كلّها على السعر وننسى المبلغ الثابت',
          exam: 'اختبر الحلّ بالتعويض في الوضعية',
          chip: `p x=T-${R('F')}`,
          quiz: [
            { q: 'للتأكّد من أنّ التكلفة لا تتجاوز الصندوق من أجل قيم معطاة نقوم بـ:', options: ['اختبار متباينة بحساب التكلفة عند كلّ قيمة', 'حلّ معادلة واحدة فقط', 'جمع الصندوق إلى التكلفة'], correct: 0 },
            { q: 'من $3000+50x=4500$ أوّل خطوة هي:', options: ['نطرح $3000$ من $4500$ فنجد $50x=1500$', 'قسمة $4500$ على $50$', 'جمع $3000$ إلى $4500$'], correct: 0 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p><MathText>{REMARKS.testWhy}</MathText></p>
            <p><MathText>{REMARKS.twoStepWhy}</MathText></p>
          </div>
        ) },
      { id: 'tariqat-wadiya', type: 'methodes', title: 'طريقة: من الوضعية إلى الحساب', summary: 'نقرأ، نختار الحسابات وترتيبها، ثم ننفّذ ونتحقّق.',
        memo: {
          rule: `${R('1')}\\to2\\to3\\to4`,
          hook: 'اقرأ ثم اختر ثم احسب ثم تحقّق',
          example: `F+px\\to px=T-F`,
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
