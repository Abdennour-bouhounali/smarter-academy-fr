import MathText from '../../../../../common/components/MathText';
import { SITUATION, REMARKS } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle : ce sont la DÉMARCHE (la poursuite de Tipaza) et les moments de choix.
 *   tarjama-muadala  module 7 — traduire une situation : nommer l'inconnue puis égaler deux quantités
 *   hall-wa-tahaqqaq module 7 — résoudre (inconnue d'un côté, nombres de l'autre) puis vérifier par substitution
 *   qarar-bi-hasr    module 7 — décider avec une inégalité ou un encadrement (le sens se garde pour un facteur positif, s'inverse pour un négatif)
 * Le module 8 évalue une AUTRE situation (les deux camions) : aucune valeur du test n'est dans un item.
 */
/** `memo` : la fiche de « 🔑 للتذكّر » — ce qui CHANGE en `R(…)` (rouge). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'tarjama-muadala', type: 'methodes', title: 'أترجم الوضعية إلى معادلة', summary: 'نسمّي المجهول ثم نساوي بين كمّيتين تعبّر كلّ منهما عن الشيء نفسه.',
        memo: {
          rule: `a${R('x')}+b=c${R('x')}+d`,
          hook: 'سمِّ المجهول ثم ساوِ بين كمّيتين',
          example: `40t=36t+2`,
          trap: 'نجمع الكمّيتين بدل المساواة بينهما',
          exam: 'اكتب «نضع x = …» ثم المعادلة',
          chip: `A(x)=B(x)`,
          quiz: [
            { q: 'تحمل شاحنة $12x+40$ وأخرى $8x+140$ والكتلتان متساويتان. المعادلة:', options: ['$12x+40=8x+140$', '$12x+8x=40+140$', '$12x+40+8x+140=0$'], correct: 0 },
            { q: 'نسمّي $t$ مدّة اللحاق. ما الذي نساوي بين طرفيه؟', options: ['ما قطعه الدرّاجان من النقطة نفسها', 'سرعتا الدرّاجين', 'عمرا الدرّاجين'], correct: 0 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p><MathText>{SITUATION.analysis[0].text}</MathText></p>
            <p><MathText>{SITUATION.analysis[1].text}</MathText></p>
          </div>
        ) },
      { id: 'hall-wa-tahaqqaq', type: 'methodes', title: 'أحلّ ثم أتحقّق', summary: 'نجمع المجهول في طرف والأعداد في الآخر ثم نقسم، وبعدها نعوّض في الطرفين.',
        memo: {
          rule: `ax+b=cx+d\\ \\Rightarrow\\ (a-c)x=${R('d-b')}`,
          hook: 'المجهول في طرف والأعداد في الآخر',
          example: `4t=2\\ \\Rightarrow\\ t=\\tfrac12`,
          trap: 'ننقل حدًّا دون تغيير إشارته',
          exam: 'عوّض في الطرفين وقارن',
          chip: `x=\\tfrac{d-b}{a-c}`,
          quiz: [
            { q: 'حلّ $12x+40=8x+140$ هو:', options: ['$25$', '$45$', '$-25$'], correct: 0 },
            { q: 'بعد الحلّ نتحقّق بأن:', options: ['نعوّض الحلّ في الطرفين ونقارن', 'نقسم الطرفين على $2$', 'نحذف المجهول'], correct: 0 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p><MathText>{SITUATION.analysis[2].text}</MathText></p>
            <p><MathText>{SITUATION.analysis[3].text}</MathText></p>
          </div>
        ) },
      { id: 'qarar-bi-hasr', type: 'regles', title: 'أقرّر بمتباينة أو حصر', summary: 'نضرب الحصر في عدد موجب فيبقى الاتجاه، وفي عدد سالب فينعكس، ثم نقارن بالقيمة المسموحة.',
        memo: {
          rule: `a\\le x<b\\ \\Rightarrow\\ ka+m\\le kx+m<kb+m\\ \\ (${R('k>0')})`,
          hook: 'الضرب في موجب يحفظ الاتجاه وفي سالب يعكسه',
          example: `0{,}75\\le m<0{,}85\\ \\Rightarrow\\ 9\\le 12m<10{,}2`,
          trap: 'ندخل الحدّ الأعلى أو نحذف الأرقام بدل التدوير',
          exam: 'قارن الحدّين بالقيمة المسموحة ثم قرّر',
          chip: `ka+m\\le kx+m<kb+m`,
          quiz: [
            { q: 'قراءة ميزان $25{,}0$ مدوّرة إلى $0{,}1$ تعني:', options: ['$24{,}95 \\le x < 25{,}05$', '$25 \\le x < 25{,}1$', '$24{,}9 \\le x \\le 25{,}1$'], correct: 0 },
            { q: 'إذا كان $-22 \\le T \\le -18$ فإنّ $-2T$ محصور بين:', options: ['$36$ و $44$', '$-44$ و $-36$', '$-22$ و $-18$'], correct: 0 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p><MathText>{REMARKS.gapRound}</MathText></p>
            <p><MathText>{REMARKS.gapBound}</MathText></p>
          </div>
        ) },
    ],
  },
};
