import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle : ce sont la DÉMARCHE (les départs décalés de la piste) et les moments de choix.
 *   ma-yataghayyar  module 7 — ce qui change d'un couloir à l'autre (les demi-cercles) et ce qui ne change pas (les droits)
 *   bil-huruf       module 7 — pourquoi on écrit en lettres : une valeur essayée ne juge pas tous les stades
 *   tariqat-wadiya  module 7 — la démarche complète, posée APRÈS les trois questions
 * La SOLUTION n’est dans aucun item : c'est la réponse de l'évaluation.
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'ma-yataghayyar', type: 'regles', title: 'ما الذي يتغيّر؟', summary: 'من رواق إلى آخر يتّسع نصفا الدائرة، أمّا المستقيمان فلا يتغيّران.',
      memo: {
        rule: `P=y+y+\\pi\\,${R('d')}`,
        hook: 'المستقيمان ثابتان والقطر يتّسع',
        example: `P_3-P_1=\\pi\\,(d_3-d_1)`,
        trap: 'عدّ المستقيمين مرّة واحدة أو إهمالهما',
        exam: 'اكتب طول كل رواق: مستقيمان ونصفا دائرة',
        chip: `y+y+\\pi\\,${R('d')}`,
        quiz: [
          { q: 'عرض الرواق $\\ell$ . بكم يزيد القطر عند الانتقال إلى الرواق التالي؟', options: ['$2\\ell$', '$\\ell$', '$4\\ell$'], correct: 0 },
          { q: 'ما الذي لا يتغيّر من رواق إلى آخر؟', options: ['طول المستقيمين', 'قطر نصفي الدائرة', 'طول المسار كلّه'], correct: 0 },
        ],
      },
        body: (<div className="space-y-1"><p><MathText>{REMARKS.sameWhy}</MathText></p></div>) },
      { id: 'bil-huruf', type: 'methodes', title: 'لماذا نكتب بالحروف؟', summary: 'قيمة مجرَّبة وحدها لا تحكم؛ العبارة المبسَّطة تحكم لكل القيم.',
      memo: {
        rule: `\\begin{aligned}&(${R('y+y')}+\\pi d_3)-(${R('y+y')}+\\pi d_1)\\\\&=\\pi\\,(d_3-d_1)\\end{aligned}`,
        hook: 'الحرف الذي يختفي لا يؤثّر',
        example: `\\pi\\,(d_3-d_1)=\\pi\\times4\\ell`,
        trap: 'الحكم على كل المضامير بقيمة واحدة مجرَّبة',
        exam: 'اكتب الفرق بالحروف ثم بسّط قبل التعويض',
        chip: `\\pi\\,(d_3-d_1)`,
        quiz: [
          { q: 'لماذا نبسّط الفرق بالحروف قبل التعويض؟', options: ['لأنّ الحرف المختفي لا يؤثّر في الفرق لأيّ مضمار', 'لأنّ التعويض ممنوع', 'لأنّ الحروف أسهل في الحساب'], correct: 0 },
          { q: 'في $(y+y+\\pi d_3)-(y+y+\\pi d_1)$ ما الذي يختفي؟', options: ['$y$ لأنّه في الطرفين', '$\\pi$ لأنّه ثابت', '$d_3$ لأنّه أكبر'], correct: 0 },
        ],
      },
        body: (<div className="space-y-1"><p><MathText>{REMARKS.letterWhy}</MathText></p><p><MathText>{REMARKS.valueWhy}</MathText></p></div>) },
      { id: 'tariqat-wadiya', type: 'methodes', title: 'طريقة: من الوضعية إلى الحساب', summary: 'نقرأ، نختار الكتابة والتبسيط، ثم ننفّذ ونتحقّق.',
      memo: {
        rule: `P_n=y+y+\\pi d_n\\ \\Rightarrow\\ ${R('\\pi\\,(d_3-d_1)')}`,
        hook: 'اكتب، بسّط، ثم عوّض',
        example: `\\pi\\,(d_3-d_1)=4\\ell\\pi`,
        trap: 'التعويض بأعداد قبل التبسيط',
        exam: 'اكتب جملة تفسّر الانطلاقات المتفاوتة',
        chip: `P_n\\to${R('\\pi\\,(d_3-d_1)')}`,
        quiz: [
          { q: 'ما الترتيب الصحيح للعمل؟', options: ['كتابة الأطوال بالحروف ثم تبسيط الفرق ثم التعويض', 'التعويض ثم الكتابة ثم التبسيط', 'التبسيط ثم الكتابة ثم التعويض'], correct: 0 },
          { q: 'عرض الرواق $\\ell$ . بكم يتقدّم متسابق الرواق الثالث عن الأول؟', options: ['$4\\ell\\pi$', '$2\\ell\\pi$', '$\\ell\\pi$'], correct: 0 },
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
