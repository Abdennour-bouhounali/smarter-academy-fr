import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION, analysisText } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle (LESSON_CONTRACT) : ce sont la DÉMARCHE du manuel
 * (قراءة → تحليل واختيار استراتيجية → تنفيذ) appliquée à la وضعية « ممر الراجلين ».
 *   thabit-mutaghayyir  module 7 — ce qui est fixe (A, B, MN = largeur) et ce qui varie (M, N)
 *   insihab-mamar       module 7 — B′ image de B par la translation de vecteur NM : MB′BN متوازي أضلاع, NB = MB′
 *   aqsar-masar         module 7 — M sur [AB′], N image de M par la translation de vecteur MN ; L = AB′ + MN
 *   tariqat-wadiya      module 7 — la démarche en trois phases (les mots du manuel)
 * Les réponses de « وضعية الاختبار النهائي » (la passerelle d'Oran) ne sont dans aucun item.
 */
/** La partie qui CHANGE dans une fiche de mémoire, en rouge. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'thabit-mutaghayyir', type: 'concepts', title: 'الثابت والمتغيّر في المسلك',
        memo: {
          rule: `NB=${R('MB^{\\prime}')}`,
          hook: 'الممر ثابت والباقي يتغيّر',
          example: `L=AM+NB+${R('2')}`,
          trap: 'طول الممر لا يتغيّر بتغيّر موضعه',
          exam: 'اذكر ما يبقى ثابتًا في المسلك',
          chip: `NB=${R('MB^{\\prime}')}`,
          quiz: [
            { q: 'عند تحريك الممر $[MN]$ العمودي على الضفتين، ما الذي يبقى ثابتًا؟', options: ['$AM$', '$NB$', '$MN$'], correct: 2 },
            { q: 'الرباعي $MB^{\\prime}BN$ متوازي أضلاع، إذن:', options: ['$NB=MN$', '$NB=MB^{\\prime}$', '$NB=BB^{\\prime}$'], correct: 1 },
          ],
        }, summary: 'طول المسلك هو AM + MN + NB: النقطتان A و B ثابتتان، والطول MN ثابت لأنه عرض الطريق، أمّا M و N فتتحرّكان مع الممر.',
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.thabit}</MathText></li>
            <li><MathText>{REMARKS.bud}</MathText></li>
          </ul>
        ) },
      { id: 'insihab-mamar', type: 'methodes', title: 'نقل B بشعاع الممر',
        memo: {
          rule: `B\\xrightarrow{\\overrightarrow{NM}}${R('B^{\\prime}')}`,
          hook: 'انقل B بشعاع الممر',
          example: `B^{\\prime}=t_{\\overrightarrow{NM}}(B)\\Rightarrow NB=${R('MB^{\\prime}')}`,
          trap: 'شعاع الممر هو NM من الضفة السفلى إلى العليا',
          exam: 'ابدأ بتعريف B′ بالانسحاب',
          chip: `B\\xrightarrow{\\overrightarrow{NM}}${R('B^{\\prime}')}`,
          quiz: [
            { q: 'نقل $B$ إلى $B^{\\prime}$ يكون بالانسحاب الذي شعاعه:', options: ['$\\overrightarrow{MN}$', '$\\overrightarrow{NM}$', '$\\overrightarrow{AB}$'], correct: 1 },
            { q: 'بعد النقل يصير المسلك $AM+MN+NB$ مساويًا لـ:', options: ['$AM+MB^{\\prime}+MN$', '$AB^{\\prime}$ فقط', '$AM+MN+MB$'], correct: 0 },
          ],
        }, summary: 'B′ صورة B بالانسحاب الذي شعاعه NM، فالرباعي MB′BN متوازي أضلاع و NB = MB′: المسلك المطلوب له نفس طول AM + MB′ + MN.',
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.istibdal}</MathText></li>
            <li><MathText>{REMARKS.mutawazi}</MathText></li>
            <li><MathText>{REMARKS.masar}</MathText></li>
          </ul>
        ) },
      { id: 'aqsar-masar', type: 'regles', title: 'أقصر مسلك: M على [AB′]',
        memo: {
          rule: `AM+MB^{\\prime}\\geq${R('AB^{\\prime}')}`,
          hook: 'أقصر طريق بين نقطتين مستقيم',
          example: `L_{\\min}=${R('AB^{\\prime}')}+MN=\\sqrt{85}+2`,
          trap: 'لا ننسى طول الممر في الجواب',
          exam: 'اكتب المتباينة ثم متى تتحقق المساواة',
          chip: `AM+MB^{\\prime}\\geq${R('AB^{\\prime}')}`,
          quiz: [
            { q: 'يكون $AM+MB^{\\prime}$ أصغر ما يمكن عندما تكون $M$:', options: ['منتصف $[AB^{\\prime}]$', 'على القطعة $[AB^{\\prime}]$', 'أقرب نقطة إلى $A$'], correct: 1 },
            { q: 'أقصر مسلك طوله:', options: ['$AB^{\\prime}$', '$AB+MN$', '$AB^{\\prime}+MN$'], correct: 2 },
          ],
        }, summary: 'MN ثابت، فالمسلك أقصر ما يمكن عندما تكون M على القطعة [AB′]، و N صورة M بالانسحاب الذي شعاعه MN؛ أقصر طول هو AB′ + MN.',
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.mutabayina}</MathText></li>
            <li><MathText>{REMARKS.M}</MathText></li>
            <li><MathText>{REMARKS.N}</MathText></li>
            <li><MathText>{REMARKS.min}</MathText></li>
          </ul>
        ) },
      { id: 'tariqat-wadiya', type: 'methodes', title: 'طريقة: من النص إلى الجواب',
        memo: {
          rule: `(1)\\to(2)\\to(3)\\to${R('(4)')}`,
          hook: 'اقرأ · حلّل · نفّذ · تحقّق',
          example: `(1)\\to(2)\\to(3)\\to${R('(4)\\ L_{\\min}=\\sqrt{85}+2')}`,
          trap: 'لا نبدأ الحساب قبل تحديد الثابت والمتغيّر',
          exam: 'اكتب المراحل الأربع بعناوينها',
          chip: `(1)\\to(2)\\to(3)\\to${R('(4)')}`,
          quiz: [
            { q: 'أول خطوة في حل وضعية:', options: ['الحساب مباشرة', 'قراءة الوضعية وتحديد الثابت والمتغيّر', 'كتابة النتيجة'], correct: 1 },
            { q: 'آخر خطوة هي:', options: ['اختيار الأداة', 'رسم الشكل', 'التحقق من أنّ النتيجة ملائمة للوضعية'], correct: 2 },
          ],
        }, summary: 'نقرأ الوضعية ونحدّد الثابت والمتغيّر، نحلّلها باختيار الأداة (انسحاب، تساوي شعاعين، متوازي أضلاع، أقصر مسافة)، ثم ننفّذ ونحسب ونتحقّق.',
        body: (
          <ol className="list-decimal ms-5 space-y-1">
            {SITUATION.analysis.map((a) => <li key={a.label}><strong>{a.label}</strong>: <MathText>{analysisText(a)}</MathText></li>)}
          </ol>
        ) },
    ],
  },
};
