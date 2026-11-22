import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD_SIDE, METHOD_NOT_RIGHT } from './content/textbook';

// La carte progressive de la leçon — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** Ce qui CHANGE dans une règle de la fiche `memo` (rouge). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

/**
 * Les connaissances du درس « خاصية فيثاغورس » (3AM) — SOURCE UNIQUE (content/textbook.js : les mots de la plateforme, tirés de معارف 1,
 * de la طريقة p. 171 et du نشاط 2 du manuel ; rien n'est copié au mot).
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'fitaghuras', type: 'regles', title: 'خاصية فيثاغورس',
        memo: {
          rule: `${R('BC^2')}=AB^2+AC^2`,
          hook: 'مربّع الوتر يساوي مجموع مربّعي القائمين',
          example: `5^2+12^2=169=${R('13^2')}`,
          trap: 'لا نجمع الطولين بل مربّعيهما',
          exam: 'اكتب مساواة فيثاغورس ثم عوّض ثم احسب',
          chip: `a^2+b^2=${R('c^2')}`,
          quiz: [
            { q: 'مثلث قائم ضلعاه القائمان $3$ و $4$ ، مربّع وتره:', options: ['$25$', '$7$', '$49$'], correct: 0 },
            { q: 'في المثلث $ABC$ القائم في $A$ نكتب:', options: ['$BC^2=AB^2+AC^2$', '$BC=AB+AC$', '$AB^2=BC^2+AC^2$'], correct: 0 },
          ],
        },
        predictPrompt: 'لم يمتلئ الحوض الكبير تمامًا إلا عند زاوية واحدة، وكان الماء 9 + 16 = 25. اكتب بكلماتك ما الذي يساويه مربع الضلع المقابل لتلك الزاوية.',
        summary: 'في مثلث ABC قائم في A: مربع طول الوتر يساوي مجموع مربعي طولي الضلعين الآخرين، BC² = AB² + AC².',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.property.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.machine.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'ghayr-qaim', type: 'regles', title: 'مثلث غير قائم',
        memo: {
          rule: `${R('BC^2\\neq AB^2+AC^2')}\\Rightarrow\\widehat{A}\\neq90^\\circ`,
          hook: 'مساواة لا تتحقّق: المثلث غير قائم',
          example: `7{,}4^2=54{,}76\\ ${R('\\neq')}\\ 4{,}5^2+6^2=56{,}25`,
          trap: 'مثلث يبدو قائمًا في الرسم قد لا يكون قائمًا',
          exam: 'قارن الطرفين ثم استنتج أنّ المثلث غير قائم',
          chip: `${R('a^2\\neq b^2+c^2')}`,
          quiz: [
            { q: 'في مثلث أطوال أضلاعه $4$ و $5$ و $7$ ، نقارن $7^2$ مع:', options: ['$4^2+5^2$', '$4^2+7^2$', '$4+5$'], correct: 0 },
            { q: 'مثلث فيه $BC^2=26$ و $AB^2+AC^2=25$ ، إذن:', options: ['غير قائم في $A$', 'قائم في $A$', 'قائم في $B$'], correct: 0 },
          ],
        },
        predictPrompt: 'عند زاوية حادة فاض الماء وعند زاوية منفرجة بقي فراغ. إذا لم يتساوَ مربع الضلع الثالث مع مجموع المربعين الآخرين، ماذا تقول عن الزاوية؟ اكتب ما تستنتجه.',
        summary: 'إذا كان مربع طول أطول أضلاع مثلث لا يساوي مجموع مربعي طولي الضلعين الآخرين فالمثلث غير قائم.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.notRight.text}</MathText></p></div>,
      },
      {
        id: 'hisab-watar', type: 'methodes', title: 'حساب الوتر',
        memo: {
          rule: `${R('BC')}=\\sqrt{AB^2+AC^2}`,
          hook: 'اجمع المربّعين ثم خذ الجذر',
          example: `5^2+12^2=169,\\ ${R('BC=13')}`,
          trap: '169 مربّع الوتر وليس الوتر',
          exam: 'اكتب المساواة ثم عوّض ثم اجمع ثم استخرج الوتر',
          chip: `${R('a')}=\\sqrt{b^2+c^2}`,
          quiz: [
            { q: 'ضلعان قائمان طولاهما $6$ و $8$ ، طول الوتر:', options: ['$10$', '$14$', '$100$'], correct: 0 },
            { q: 'مربّع وتر مثلث قائم يساوي $169$ ، طول الوتر:', options: ['$13$', '$169$', '$84{,}5$'], correct: 0 },
          ],
        },
        predictPrompt: 'مع 5 و 12 امتلأ الحوض عند 13. كيف تجد طول الوتر دون أن تجرّب على الشريط؟ اكتب خطواتك.',
        summary: 'نجمع مربعي طولي الضلعين القائمين فنحصل على مربع الوتر، ثم نأخذ العدد الذي مربعه هذا المجموع: 5² + 12² = 169 = 13².',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.computeSide.text}</MathText></p></div>,
      },
    ],
    2: [
      {
        id: 'watar', type: 'concepts', title: 'الوتر', predict: false,
        memo: {
          rule: `\\widehat{A}=90^\\circ\\Rightarrow ${R('BC')}>AB,\\ ${R('BC')}>AC`,
          hook: 'الوتر يقابل القائمة وهو الأطول',
          example: `${R('13')}>12>5`,
          trap: 'الوتر ليس دائمًا الضلع الأسفل في الرسم',
          exam: 'عيّن الزاوية القائمة ثم سمِّ المقابل لها وترًا',
          chip: `\\widehat{A}=90^\\circ\\to${R('BC')}`,
          quiz: [
            { q: 'في المثلث $EFG$ القائم في $E$ الوتر هو:', options: ['$[FG]$', '$[EG]$', '$[EF]$'], correct: 0 },
            { q: 'الوتر في مثلث قائم هو:', options: ['أطول الأضلاع', 'أقصر الأضلاع', 'ضلع أفقي دائمًا'], correct: 0 },
          ],
        },
        summary: 'الوتر هو الضلع المقابل للزاوية القائمة في مثلث قائم، وهو أطول أضلاعه؛ والمساواة لا تُكتب إلا في مثلث قائم.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.hypotenuse.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.onlyRight.text}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'hisab-dil', type: 'methodes', title: 'حساب ضلع قائم',
        memo: {
          rule: `AB^2=${R('BC^2-AC^2')}`,
          hook: 'ضلع قائم: اطرح من مربّع الوتر',
          example: `DF^2=${R('6^2-4^2')}=20`,
          trap: 'لا نجمع حين نبحث عن ضلع قائم',
          exam: 'اكتب مساواة فيثاغورس أوّلًا ثم انقل المعلوم',
          chip: `b^2=${R('a^2-c^2')}`,
          quiz: [
            { q: 'وتر طوله $10$ وضلع قائم طوله $6$ ، مربّع الضلع القائم الآخر:', options: ['$64$', '$136$', '$16$'], correct: 0 },
            { q: 'في $DEF$ القائم في $D$ حيث $EF=6$ و $DE=4$ ، قيمة $DF^2$:', options: ['$20$', '$52$', '$4$'], correct: 0 },
          ],
        },
        predictPrompt: 'عرفتَ الوتر (السلّم) وأحد الضلعين القائمين، ووجدتَ الضلع الآخر. كيف حسبتَه؟ اكتب العملية التي استعملتها على المربعات.',
        summary: 'مربع ضلع قائم هو الفرق بين مربع الوتر ومربع الضلع القائم الآخر: AB² = BC² − AC².',
        body: (
          <div className="space-y-2">
            {METHOD_SIDE.solution.slice(2, 4).map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{METHOD_SIDE.rule}</MathText></p>
          </div>
        ),
      },
      {
        id: 'lamsa-jidhr', type: 'methodes', title: 'اللمسة √', predict: false,
        memo: {
          rule: `DF^2=20\\Rightarrow ${R('DF=\\sqrt{20}')}`,
          hook: 'المضبوط بالجذر والمقرّب بالآلة',
          example: `${R('\\sqrt{20}')}\\approx4{,}47`,
          trap: '4,47 قيمة مقرّبة وليست المضبوطة',
          exam: 'اكتب القيمة المضبوطة بالجذر ثم المقرّبة',
          chip: `x^2=a\\to${R('\\sqrt{a}')}`,
          quiz: [
            { q: 'إذا كان $DF^2=20$ فالقيمة المضبوطة للطول $DF$ هي:', options: ['$\\sqrt{20}$', '$10$', '$4{,}47$'], correct: 0 },
            { q: 'القيمة المقرّبة إلى $0{,}01$ للعدد $\\sqrt{20}$ هي:', options: ['$4{,}47$', '$4{,}5$', '$10$'], correct: 0 },
          ],
        },
        summary: 'إذا كان مربع طول هو 20 فالطول المضبوط √20، واللمسة √ تعطي قيمة مقرّبة: √20 ≈ 4,47.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.root.text}</MathText></p></div>,
      },
      {
        id: 'ithbat-ghayr-qaim', type: 'methodes', title: 'أُثبت أنّ مثلثا غير قائم',
        memo: {
          rule: `${R('a^2')}\\neq b^2+c^2,\\ a>b,\\ a>c`,
          hook: 'قارن مربّع الأطول بمجموع الباقيين',
          example: `7{,}4^2=54{,}76\\neq56{,}25`,
          trap: 'لا نقارن بمربّع ضلع واحد بل بمجموع',
          exam: 'عيّن الأطول واحسب كل طرف ثم استنتج',
          chip: `${R('a^2')}\\ ?\\ b^2+c^2`,
          quiz: [
            { q: 'أطوال مثلث $4{,}5$ و $6$ و $7{,}4$ ، نبدأ بمربّع الطول:', options: ['$7{,}4$', '$4{,}5$', '$6$'], correct: 0 },
            { q: '$KM^2=54{,}76$ و $KL^2+LM^2=56{,}25$ ، إذن:', options: ['المثلث غير قائم', 'المثلث قائم في $L$', 'المثلث قائم في $K$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المثلث KLM قارنتَ مربعًا بمجموع مربعين. أيّ ضلع اخترتَ أوّلًا، ولماذا؟ اكتب الطريقة بكلماتك.',
        summary: 'نعيّن أطول الأضلاع ونقارن مربع طوله بمجموع مربعي الضلعين الآخرين؛ إذا لم يتساويا فالمثلث غير قائم.',
        body: (
          <div className="space-y-2">
            {METHOD_NOT_RIGHT.solution.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{METHOD_NOT_RIGHT.rule}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
