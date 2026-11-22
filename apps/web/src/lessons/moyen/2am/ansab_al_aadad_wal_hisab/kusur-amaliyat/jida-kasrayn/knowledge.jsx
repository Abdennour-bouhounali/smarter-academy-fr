import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « جداء كسرين » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js). Le produit de fractions décimales (1AM kusur-ashriya-kitaba), le quotient (1AM hasil-qisma-kasr),
 * « كسر من عدد » (leçon PRÉVUE de 1AM : une phrase, pas de lien) et le reste (jam-tarh-kusur) ne sont PAS des items ici : ce sont des prérequis, rappelés par les « تذكّر » du module 2.
 */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const M = (s) => <MathText>{s}</MathText>;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'juz-min-juz', type: 'regles', title: 'الجزء من الجزء جداء',
        memo: {
          rule: `\\dfrac{a}{b}\\times\\dfrac{c}{d}=\\dfrac{a${R('\\times c')}}{b${R('\\times d')}}`,
          hook: 'الركن المظلم: أعمدة × صفوف',
          example: `\\dfrac{2}{3}\\times\\dfrac{3}{4}=\\dfrac{2\\times 3}{3\\times 4}=\\dfrac{${R('6')}}{12}`,
          trap: 'لا تجمع الكسرين: الجزء من الجزء أصغر من كلّ منهما',
          exam: 'اكتب البسط ثم المقام ثم اختزل',
          chip: `\\tfrac{a}{b}\\times\\tfrac{c}{d}`,
          quiz: [
            { q: 'قسّم الظلاّن النافذة إلى $3$ أعمدة و $4$ صفوف. عدد المربّعات الصغيرة:', options: ['$12$', '$7$', '$34$'], correct: 0 },
            { q: 'الركن المظلم عمودان وثلاثة صفوف. عدد مربّعاته:', options: ['$6$', '$5$', '$23$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المهمة 1 سحبتم الستارة إلى 2/3 العرض والدوّارة إلى 3/4 الارتفاع. كم مربّعًا صغيرًا في النافذة؟ وكم منها مظلم مرّتين؟ اكتب ما لاحظته بكلماتك.',
        summary: 'الجزء الذي تغطّيه الستارتان معًا جزء من جزء: مربّعاته الصغيرة جداء البسطين من جداء المقامين.',
        body: <p><MathText>{GUIDE.panes}</MathText></p>,
      },
      {
        id: 'qaida-jida', type: 'regles', title: 'قاعدة جداء كسرين',
        memo: {
          rule: `\\dfrac{a}{b}\\times\\dfrac{c}{d}=\\dfrac{${R('a\\times c')}}{${R('b\\times d')}}`,
          hook: 'نضرب البسطين معًا والمقامين معًا',
          example: `\\dfrac{4}{5}\\times\\dfrac{2}{3}=\\dfrac{${R('8')}}{${R('15')}}`,
          trap: 'لا تجمع المقامين ولا تُبقِ مقامًا واحدًا',
          exam: 'اكتب البسط والمقام ثم الكسر المختزل',
          chip: `\\tfrac{a\\times c}{b\\times d}`,
          quiz: [
            { q: '$\\frac{4}{5}\\times\\frac{2}{3}$ تساوي:', options: ['$\\frac{8}{15}$', '$\\frac{6}{8}$', '$\\frac{8}{5}$'], correct: 0 },
            { q: '$\\frac{2}{9}\\times\\frac{3}{4}$ بعد الاختزال:', options: ['$\\frac{1}{6}$', '$\\frac{5}{13}$', '$\\frac{6}{36}$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المهمة 3 كان في النافذة 15 مربّعًا صغيرًا والمظلم منها 8. من أين جاء 15؟ ومن أين جاء 8؟ اكتب القاعدة بكلماتك.',
        summary: 'لجداء كسرين نضرب البسطين فيما بينهما والمقامين فيما بينهما، ثم نختزل.',
        body: <p><MathText>{GUIDE.product}</MathText></p>,
      },
      {
        id: 'jida-akbar-min-wahid', type: 'regles', title: 'جداء أكبر من الواحد',
        memo: {
          rule: `\\dfrac{a}{b}\\times\\dfrac{c}{d}>1`,
          hook: 'ستارتان تتجاوزان نافذة في الاتجاهين',
          example: `\\dfrac{7}{4}\\times\\dfrac{4}{3}=\\dfrac{28}{12}=${R('\\dfrac{7}{3}')}`,
          trap: 'ليس الضرب يكبّر دائمًا: قد يكون الجداء أصغر من كلّ عامل',
          exam: 'قارن البسط بالمقام لتعرف أهو أكبر من 1',
          chip: `\\tfrac{28}{12}>1`,
          quiz: [
            { q: '$\\frac{7}{4}\\times\\frac{4}{3}=\\frac{28}{12}$ وهو:', options: ['أكبر من $1$', 'أصغر من $1$', 'يساوي $1$'], correct: 0 },
            { q: 'الجداء $\\frac{1}{2}\\times\\frac{3}{5}$ هو:', options: ['أصغر من $\\frac{3}{5}$', 'أكبر من $\\frac{3}{5}$', 'يساوي $\\frac{3}{5}$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المهمة 3 من المستوى المتقدّم غطّت الستارة 7/4 نافذة والدوّارة 4/3. هل يمكن أن يكون الركن المظلم أكبر من نافذة؟ ولماذا؟ اكتب ما لاحظته.',
        summary: 'قد يكون جداء كسرين أكبر من $1$ إذا كان العاملان أكبر من $1$ ؛ ويكون أصغر من كلّ عامل إذا كان العاملان أصغر من $1$ .',
        body: <p><MathText>{GUIDE.big}</MathText></p>,
      },
      {
        id: 'adad-fi-kasr', type: 'regles', title: 'عدد طبيعي في كسر',
        memo: {
          rule: `n\\times\\dfrac{a}{b}=\\dfrac{${R('n\\times a')}}{b}`,
          hook: 'العدد الطبيعي مقامه 1 فلا يتغيّر المقام',
          example: `2\\times\\dfrac{3}{5}=\\dfrac{2\\times 3}{5}=${R('\\dfrac{6}{5}')}`,
          trap: 'لا تضرب المقام في العدد الطبيعي',
          exam: 'اكتب العدد كسرًا مقامه 1 ثم اضرب',
          chip: `n\\times\\tfrac{a}{b}`,
          quiz: [
            { q: '$4\\times\\frac{2}{9}$ تساوي:', options: ['$\\frac{8}{9}$', '$\\frac{8}{36}$', '$\\frac{6}{9}$'], correct: 0 },
            { q: '$2\\times\\frac{3}{5}$ تساوي:', options: ['$\\frac{6}{5}$', '$\\frac{6}{10}$', '$\\frac{3}{10}$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المهمة 4 غطّت الستارة نافذتين كاملتين والدوّارة 3/5. كم ركنًا مظلمًا في النافذتين؟ وكيف تحسب المجموع بالضرب؟ اكتب ما لاحظته.',
        summary: 'لضرب عدد طبيعي في كسر نضرب العدد في البسط ونحتفظ بالمقام.',
        body: <p><MathText>{GUIDE.natural}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'qaida-jida-maarif', type: 'regles', title: 'قواعد الجداء', predict: false,
        memo: {
          rule: `\\dfrac{a}{b}\\times\\dfrac{c}{d}=\\dfrac{a\\times c}{b\\times d}`,
          hook: 'البسطان معًا والمقامان معًا',
          example: `\\dfrac{3}{4}\\times\\dfrac{2}{5}=\\dfrac{6}{20}=${R('\\dfrac{3}{10}')}`,
          trap: 'اختزل الناتج في النهاية',
          exam: 'اكتب الجداء ثم الاختزال',
          chip: `\\tfrac{a\\times c}{b\\times d}`,
          quiz: [
            { q: '$\\frac{3}{4}\\times\\frac{2}{5}$ بعد الاختزال:', options: ['$\\frac{3}{10}$', '$\\frac{5}{9}$', '$\\frac{6}{20}$'], correct: 0 },
            { q: '$4\\times\\frac{3}{11}$ تساوي:', options: ['$\\frac{12}{11}$', '$\\frac{12}{44}$', '$\\frac{7}{11}$'], correct: 0 },
          ],
        },
        summary: 'نضرب البسطين معًا والمقامين معًا ثم نختزل؛ وعددًا طبيعيًا أو عشريًا في كسر بضربه في البسط وحده.',
        body: (
          <div className="space-y-2">
            <p>{M(KNOWLEDGE.product.text)}</p>
            <p className="text-sm text-slate-600">{M(KNOWLEDGE.product.example)}</p>
            <p>{M(KNOWLEDGE.natural.text)}</p>
            <p className="text-sm text-slate-600">{M(KNOWLEDGE.natural.example)}</p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'kasr-min-adad', type: 'methodes', title: 'كسر من كمية',
        memo: {
          rule: `x\\times\\dfrac{a}{b}=\\dfrac{x\\times ${R('a')}}{b}`,
          hook: '«من» تعني الضرب',
          example: `48\\times\\dfrac{3}{8}=\\dfrac{144}{8}=${R('18')}`,
          trap: 'لا تقسم على البسط ولا تضرب في المقام',
          exam: 'اكتب الجداء ثم النتيجة',
          chip: `\\tfrac{3}{8}\\times 48`,
          quiz: [
            { q: '$\\frac{3}{4}$ من $60$ هو:', options: ['$45$', '$80$', '$15$'], correct: 0 },
            { q: '$\\frac{5}{12}$ من $60$ هو:', options: ['$25$', '$144$', '$5$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تحسب ثلاثة أثمان 48 دون أن تخطئ؟ ماذا تفعل بالعدد 48؟ وبأيّ ترتيب؟ اكتب طريقتك.',
        summary: METHOD.rule,
        body: (<div className="space-y-2"><p>{M(KNOWLEDGE.of.text)}</p><p className="text-sm text-slate-600">{M(METHOD.solution[0])}</p></div>),
      },
      {
        id: 'kasr-min-baqi', type: 'regles', title: 'كسر من الباقي',
        memo: {
          rule: `\\dfrac{a}{b}\\times\\left(1-\\dfrac{s}{t}\\right)`,
          hook: 'الباقي أوّلًا ثم الضرب',
          example: `\\dfrac{2}{3}\\times\\left(1-\\dfrac{1}{4}\\right)=\\dfrac{2}{3}\\times\\dfrac{3}{4}=${R('\\dfrac{1}{2}')}`,
          trap: 'لا تأخذ الكسر من الكلّ إذا قيل «من الباقي»',
          exam: 'اكتب الباقي ثم الجداء ثم اختزل',
          chip: `\\tfrac{2}{3}\\times\\tfrac{3}{4}`,
          quiz: [
            { q: 'أنفق $\\frac{1}{3}$ ثم نصف الباقي. الثاني من المبلغ كلّه:', options: ['$\\frac{1}{3}$', '$\\frac{1}{2}$', '$\\frac{1}{6}$'], correct: 0 },
            { q: 'بيع $\\frac{1}{4}$ ثم $\\frac{2}{3}$ من الباقي. الثاني من الكلّ:', options: ['$\\frac{1}{2}$', '$\\frac{2}{3}$', '$\\frac{1}{6}$'], correct: 0 },
          ],
        },
        predictPrompt: 'بيع ربع الغلّة ثم ثلثا الباقي. أيّ كسر نضرب في ثلثين: الواحد، أم الربع، أم الباقي؟ اكتب ذلك بكلماتك.',
        summary: KNOWLEDGE.rest.text,
        body: <p>{M(KNOWLEDGE.rest.text)}</p>,
      },
    ],
  },
};
