import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD_VALUES } from './content/textbook';

// La carte progressive de la leçon — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « حساب قيمة عبارة حرفية » (3AM) — SOURCE UNIQUE (content/textbook.js : les mots de la plateforme, tirés de
 * معارف 4 et de طريقة 4 du manuel ; rien n'est copié au mot). Les opérations sur les rationnels (`amaliyat-natiqa-3am`), la règle littérale
 * de 1AM (`tatbiq-qaida-harfiya-1am`), la puissance d'un relatif (`quwat-adad-nisbi-3am`) et la priorité des opérations sont des
 * prérequis (`priorKnowledge`), mesurés par « أستعدّ », jamais des items ici.
 */
/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'ithar-darb', type: 'regles', title: 'علامة الضرب تُظهَر',
        memo: {
          rule: `ax\\to a${R('\\times')}x`,
          hook: 'أظهر علامة الضرب',
          example: `4${R('\\times')}3+7=19`,
          trap: 'دون العلامة يُقرأ 43 لا 12',
          exam: 'اكتب علامة الضرب قبل أن تحسب',
          chip: `a${R('\\times')}x`,
          quiz: [
            { q: '$5x$ من أجل $x=2$ تُكتب:', options: ['$5\\times2$', '$52$', '$5+2$'], correct: 0 },
            { q: 'قيمة $3x+1$ من أجل $x=4$ :', options: ['$13$', '$35$', '$8$'], correct: 0 },
          ],
        },
        predictPrompt: 'كتبتَ $4\\times3+7$ فقبله المسار، أمّا $43+7$ فرفضه. ماذا نفعل بعلامة الضرب عند تعويض حرف بعدد؟ اكتب ما لاحظته.',
        summary: 'عند التعويض نُظهر علامة الضرب المضمَرة: $4x$ من أجل $x=3$ تُكتب $4\\times3$.',
        body: <p><MathText>{KNOWLEDGE.times.text}</MathText></p>,
      },
      {
        id: 'aqwas-salib', type: 'regles', title: 'العدد السالب بين قوسين',
        memo: {
          rule: `(${R('-a')})^2=a^2`,
          hook: 'السالب بين قوسين',
          example: `(${R('-2')})^2=4`,
          trap: 'لا تكتب −2² : تساوي −4',
          exam: 'ضع كل قيمة سالبة بين قوسين عند التعويض',
          chip: `(${R('-a')})^2`,
          quiz: [
            { q: '$x^2$ من أجل $x=-3$ :', options: ['$9$', '$-9$', '$-6$'], correct: 0 },
            { q: '$2x$ من أجل $x=-5$ تُكتب:', options: ['$2\\times(-5)$', '$2\\times-5$', '$2-5$'], correct: 0 },
          ],
        },
        predictPrompt: 'سطرك دون قوسين حول $-2$ أعطى $2$ أمّا المسار فأعطى $10$. كيف نكتب العدد السالب عند التعويض ولماذا؟ اكتب ما لاحظته.',
        summary: 'نضع القيمة السالبة بين قوسين: $(-2)^2=4$ أمّا $-2^2=-4$.',
        body: <p><MathText>{KNOWLEDGE.brackets.text}</MathText></p>,
      },
      {
        id: 'nafs-al-adad', type: 'concepts', title: 'العدد نفسه في كل مكان',
        memo: {
          rule: `${R('(-2)')}^2-3${R('(-2)')}`,
          hook: 'حرف واحد، عدد واحد',
          example: `(-2)^2-3\\times(-2)=10`,
          trap: 'لا تعوّض الحرف نفسه بعددين مختلفين',
          exam: 'عوّض الحرف في كل مكان يظهر فيه',
          chip: `x\\to${R('-2')}`,
          quiz: [
            { q: '$x+x^2$ من أجل $x=3$ :', options: ['$12$', '$6$', '$9$'], correct: 0 },
            { q: '$2x-x$ من أجل $x=5$ :', options: ['$5$', '$10$', '$15$'], correct: 0 },
          ],
        },
        predictPrompt: 'خرجت من الخزّان كرية لكل مكان للحرف في العبارة. ماذا تحمل هذه الكريات، ولماذا؟ اكتب ما لاحظته.',
        summary: 'الحرف يأخذ العدد نفسه في كل مكان يظهر فيه، ويبقى دوره كما هو.',
        body: <p><MathText>{KNOWLEDGE.same.text}</MathText></p>,
      },
      {
        id: 'harfan', type: 'concepts', title: 'حرفان وعددان',
        memo: {
          rule: `${R('x')}=-1,\\ ${R('y')}=4`,
          hook: 'لكلّ حرف عدده',
          example: `3\\times(-1)-2\\times4=-11`,
          trap: 'لا تعطِ الحرفين العدد نفسه إلّا إذا طُلب',
          exam: 'عوّض كل حرف بقيمته هو',
          chip: `${R('x')},\\,${R('y')}`,
          quiz: [
            { q: '$x+y$ من أجل $x=2$ و $y=5$ :', options: ['$7$', '$4$', '$10$'], correct: 0 },
            { q: '$xy$ من أجل $x=-1$ و $y=3$ :', options: ['$-3$', '$3$', '$2$'], correct: 0 },
          ],
        },
        predictPrompt: 'في العبارة حرفان وخزّانان. هل يجب أن تحمل الكريتان العدد نفسه؟ اكتب ما لاحظته.',
        summary: 'لحرفين مختلفين قد نعوّض عددين مختلفين.',
        body: <p><MathText>{KNOWLEDGE.letters.text}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'tawid-qimat', type: 'methodes', title: 'عوّض ثم احسب',
        memo: {
          rule: `5-2${R('\\times(-3)^2')}`,
          hook: 'عوّض، أظهر، احسب',
          example: `5-2\\times9=-13`,
          trap: 'الأسّ قبل الضرب، والضرب قبل الطرح',
          exam: 'اكتب سطر التعويض ثم احسب بالأولويات',
          chip: `${R('\\times(-3)^2')}`,
          quiz: [
            { q: '$5-2x^2$ من أجل $x=-3$ :', options: ['$-13$', '$41$', '$23$'], correct: 0 },
            { q: '$6x-1$ من أجل $x=-\\frac12$ :', options: ['$-4$', '$2$', '$-7$'], correct: 0 },
          ],
        },
        predictPrompt: 'حسبتَ قيمتي عبارة من أجل $x=3$ ثم $x=-1$. كيف تحسب قيمة عبارة حرفية من أجل قيمة للحرف؟ اكتب الطريقة بكلماتك.',
        summary: 'نعوّض الحرف بالقيمة في كل مكان منه، ونُظهر علامة الضرب، ونضع السالب بين قوسين، ثم نحسب باحترام أولوية العمليات.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.definition.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.example.text}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'mithal-mudad', type: 'regles', title: 'مثال مضاد',
        memo: {
          rule: `A(${R('1')})\\ne B(${R('1')})`,
          hook: 'مثال واحد يكفي للإبطال',
          example: `(1+2)(1+3)=12\\ne 7`,
          trap: 'تساوي بعض القيم لا يثبت المساواة',
          exam: 'اذكر القيمة والعددين المختلفين',
          chip: `A(a)\\ne B(a)`,
          quiz: [
            { q: '$(x+1)^2$ و $x^2+1$ من أجل $x=1$ تعطيان:', options: ['$4$ و $2$', '$2$ و $2$', '$4$ و $4$'], correct: 0 },
            { q: 'تساوت عبارتان عند $x=0$ و $x=1$ . إذن:', options: ['لا نستطيع الحكم بعد', 'هما متساويتان', 'هما مختلفتان'], correct: 0 },
          ],
        },
        predictPrompt: 'في الزوج الأول تساوت السلّتان عند الكرية 0 ثم اختلفتا عند الكرية 1. ماذا تقول عن العبارتين؟ اكتب ما لاحظته.',
        summary: 'قيمة واحدة تختلف عندها عبارتان تثبت أنهما غير متساويتين؛ وتساوي القيم لا يثبت التساوي.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.counter.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.noProof.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'nashr-yuthbit', type: 'methodes', title: 'القيم تبطل والنشر يثبت',
        memo: {
          rule: `A=B\\ ${R('\\forall x')}`,
          hook: 'القيم تبطل، النشر يثبت',
          example: `(x-1)(x+1)=${R('x^2-1')}`,
          trap: 'لا تثبت المساواة بقيمة واحدة',
          exam: 'انشر العبارتين وقارن صورتيهما',
          chip: `${R('x^2-1')}`,
          quiz: [
            { q: 'لإثبات $(x+1)(x-1)=x^2-1$ :', options: ['ننشر الطرف الأوّل', 'نجرّب $x=2$', 'نجرّب ثلاث قيم'], correct: 0 },
            { q: '$(x+2)^2$ و $x^2+4$ :', options: ['مختلفتان: عند $x=1$ نجد $9$ و $5$', 'متساويتان', 'متساويتان لكل $x$ موجب'], correct: 0 },
          ],
        },
        predictPrompt: 'في الزوج الثالث تساوت السلّتان عند كل الكريات، ولم نجد مثالًا مضادًا. كيف نتأكد أنّ العبارتين متساويتان؟ اكتب طريقتك.',
        summary: 'لإبطال المساواة نبحث عن قيمة تفرّق بين العبارتين؛ ولإثباتها ننشر العبارتين ونقارن صورتيهما.',
        body: (
          <div className="space-y-2">
            {METHOD_VALUES.solution.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{METHOD_VALUES.rule}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
