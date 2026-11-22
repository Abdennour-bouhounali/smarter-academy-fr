import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle : ce sont la DÉMARCHE (deux températures, deux échelles) et les moments de choix.
 *   saffan-wahid   module 7 — on ne compare que deux températures du même سلّم : on convertit d'abord
 *   silsila-aksiya module 7 — la chaîne inverse de 1,8 × T_C + 32 : on défait dans l'ordre contraire
 *   tariqat-wadiya module 7 — la démarche complète, posée APRÈS les deux questions
 * La SOLUTION (26,6 °F ; −25 °C ; Montréal) n'est dans aucun item : c'est la réponse de l'évaluation.
 */
/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'saffan-wahid', type: 'regles', title: 'نقارن بسلّم واحد', summary: 'لا تُقارَن درجتا حرارة إلا بالسلّم نفسه: نحوّل إحداهما أوّلًا.',
        memo: {
          rule: `T_F=1{,}8\\times ${R('T_C')}+32`,
          hook: 'سلّم واحد قبل المقارنة',
          example: `1{,}8\\times (${R('-10')})+32=14`,
          trap: 'لا تقارن درجة بالسلسيوس بدرجة بالفهرنهايت مباشرة',
          exam: 'حوّل إلى سلّم واحد، ثم قارن',
          chip: `T_F=1{,}8\\,${R('T_C')}+32`,
          quiz: [
            { q: '$-10\\,^{\\circ}\\mathrm{C}$ بالفهرنهايت:', options: ['$14$', '$50$', '$39{,}6$'], correct: 0 },
            { q: 'أيّهما أبرد: $0\\,^{\\circ}\\mathrm{C}$ أم $30\\,^{\\circ}\\mathrm{F}$ ؟', options: ['$30\\,^{\\circ}\\mathrm{F}$', '$0\\,^{\\circ}\\mathrm{C}$', 'متساويتان'], correct: 0 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p><MathText>{REMARKS.scaleWhy}</MathText></p>
            <p><MathText>{REMARKS.scaleRight}</MathText></p>
          </div>
        ) },
      { id: 'silsila-aksiya', type: 'methodes', title: 'عكس سلسلة حسابات', summary: 'نعكس العمليات بالترتيب المعاكس: ما فُعل أخيرًا يُفكّ أوّلًا.',
        memo: {
          rule: `${R('T_C')}=\\dfrac{T_F-32}{1{,}8}`,
          hook: 'آخر عملية تُفكّ أوّلًا',
          example: `\\dfrac{50-32}{1{,}8}=${R('10')}`,
          trap: 'لا تقسم على 1,8 قبل أن تطرح 32',
          exam: 'اكتب السلسلة، ثم اعكسها خطوة خطوة',
          chip: `${R('-32')},\\ ${R('\\div 1{,}8')}`,
          quiz: [
            { q: '$T_F=50$ ، إذن $T_C$ :', options: ['$10$', '$122$', '$-10$'], correct: 0 },
            { q: 'لعكس « نضرب في $1{,}8$ ثم نضيف $32$ » نبدأ بـ:', options: ['طرح $32$', 'القسمة على $1{,}8$', 'الضرب في $1{,}8$'], correct: 0 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p><MathText>{'الحساب $T_C \\to T_F$ : نضرب في $1{,}8$ ثم نضيف $32$ .'}</MathText></p>
            <p><MathText>{REMARKS.chainWhy}</MathText></p>
          </div>
        ) },
      { id: 'tariqat-wadiya', type: 'methodes', title: 'طريقة: من الوضعية إلى الحساب', summary: 'نقرأ، نختار العمليات وترتيبها، ثم ننفّذ ونتحقّق.',
        memo: {
          rule: `?\\ \\to\\ ${R('\\times,\\ +')}\\ \\to\\ \\checkmark`,
          hook: 'أقرأ، أختار، أحسب، أتحقّق',
          example: `1{,}8\\times (-5)+32=${R('23')}`,
          trap: 'لا تبدأ الحساب قبل أن تحدّد ترتيب العمليات',
          exam: 'اكتب الجواب بجملة، مع الوحدة',
          chip: `${R('\\checkmark')}`,
          quiz: [
            { q: '$1{,}8\\times (-5)+32$ يساوي:', options: ['$23$', '$41$', '$-41$'], correct: 0 },
            { q: '$1{,}8\\times (-20)+32$ يساوي:', options: ['$-4$', '$68$', '$-68$'], correct: 0 },
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
