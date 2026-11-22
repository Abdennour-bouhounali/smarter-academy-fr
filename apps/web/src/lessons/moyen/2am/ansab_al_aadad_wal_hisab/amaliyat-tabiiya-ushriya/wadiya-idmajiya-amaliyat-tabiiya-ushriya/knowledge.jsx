import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle : ce sont la DÉMARCHE (l'atelier de nichoirs) et les moments de choix.
 *   kull-madda      module 7 — chaque matière se divise seule, on garde la partie entière du quotient
 *   al-asghar       module 7 — le plus petit quotient limite le nombre de nichoirs
 *   tariqat-wadiya  module 7 — la démarche complète, posée APRÈS les questions
 * La SOLUTION n'est dans aucun item : c'est la réponse de l'évaluation.
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'kull-madda', type: 'regles', title: 'كلّ مادّة تُقسم وحدها', summary: 'نقسم مخزون كلّ مادّة على حاجة الوحدة الواحدة منها ونأخذ الجزء الصحيح.',
      memo: {
        rule: `n_i=\\left\\lfloor\\dfrac{${R('s_i')}}{k_i}\\right\\rfloor`,
        hook: 'لكلّ مادّة قسمتها',
        example: `\\left\\lfloor\\dfrac{30}{4}\\right\\rfloor=7`,
        trap: 'جمع المخزون كلّه وقسمته على مجموع الحاجات',
        exam: 'اكتب لكلّ مادّة مخزونها وحاجتها ثم اقسم',
        chip: `\\lfloor s_i\\div k_i\\rfloor`,
        quiz: [
          { q: 'لدينا 30 قطعة وكلّ جهاز يحتاج إلى 4 قطع. كم جهازًا تكفيه القطع؟', options: ['$7$', '$8$', '$26$'], correct: 0 },
          { q: 'لماذا لا نجمع مخزون المواد كلّها ونقسمه على مجموع الحاجات؟', options: ['لأنّ قطعة من نوع لا تعوّض قطعة من نوع آخر', 'لأنّ الجمع صعب', 'لأنّ القسمة تعطي دائمًا عددًا عشريًا'], correct: 0 },
        ],
      },
        body: (<div className="space-y-1"><p><MathText>{REMARKS.perMaterial}</MathText></p><p><MathText>{REMARKS.sumWhy}</MathText></p></div>) },
      { id: 'al-asghar', type: 'methodes', title: 'الأصغر يحدّ العدد', summary: 'عدد الوحدات الكاملة هو أصغر الحواصل الصحيحة.',
      memo: {
        rule: `n=${R('\\min')}(n_1,\\,n_2,\\,n_3)`,
        hook: 'المادّة الأقلّ كفاية تحدّ العدد',
        example: `\\min(9,\\,5,\\,7)=5`,
        trap: 'أخذ أكبر حاصل لأنّه يعطي وحدات أكثر',
        exam: 'قارن الحواصل الصحيحة واختر الأصغر',
        chip: `n=\\min(n_i)`,
        quiz: [
          { q: 'الحواصل الصحيحة لثلاث مواد هي 9 و 5 و 7. كم وحدة كاملة يمكن صنعها؟', options: ['$5$', '$9$', '$21$'], correct: 0 },
          { q: 'ما الذي يحدث لما زاد من المادّتين الأخريين؟', options: ['يبقى في المخزن', 'يُرمى', 'يعوّض المادّة الناقصة'], correct: 0 },
        ],
      },
        body: (<div className="space-y-1"><p><MathText>{REMARKS.minWhy}</MathText></p><p><MathText>{REMARKS.maxWhy}</MathText></p></div>) },
      { id: 'tariqat-wadiya', type: 'methodes', title: 'طريقة: من الوضعية إلى القرار', summary: 'نقسم كلّ مادّة، نأخذ الأصغر، نحسب الباقي، ثم نكتب الربح بسلسلة واحدة.',
      memo: {
        rule: `P=n\\times p-${R('(')}n\\times c+g${R(')')}`,
        hook: 'اقسم، اختر الأصغر، ثم اطرح التكلفة كلّها',
        example: `P=5\\times 20-(5\\times 6+10)=60`,
        trap: 'طرح التكلفة الأولى وإضافة الثانية بإهمال القوسين',
        exam: 'اكتب سلسلة واحدة للربح ثم احسبها',
        chip: `P=n\\,p-(n\\,c+g)`,
        quiz: [
          { q: 'سعر بيع الوحدة 20 وتكلفتها 6 وثمن أداة واحدة للجميع 10. ما ربح 5 وحدات؟', options: ['$60$', '$80$', '$70$'], correct: 0 },
          { q: 'لماذا نضع التكلفة كلّها بين قوسين عند طرحها من المبيعات؟', options: ['لتُجمع التكاليف أوّلًا ثم تُطرح معًا', 'لأنّ القوسين يجعلان الحساب أصعب', 'لأنّ المبيعات تُحسب بعد التكلفة'], correct: 0 },
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
