import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « جمع وطرح كسرين » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 4 p. 26, طرائق 5–6 p. 27, réécrits). L'addition et la
 * soustraction de deux fractions de même dénominateur ou dont un dénominateur est multiple de l'autre (2AM, leçon `jam-tarh-kusur`), le dénominateur commun de `tasawi-muqaranat-kasrayn`
 * et les multiples (1AM) sont des prérequis (`priorKnowledge`), mesurés par « أستعدّ », jamais des items ici.
 */
const { same, rule, examples } = KNOWLEDGE;

/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'tawhid-qabl-jam', type: 'regles', title: 'نوحّد المقامين قبل أن نجمع',
        memo: {
          rule: `\\dfrac{a}{b}+\\dfrac{c}{d}=\\dfrac{a'}{${R('D')}}+\\dfrac{c'}{${R('D')}}`,
          hook: 'مقامان مختلفان لا يُجمعان مباشرة',
          example: `\\dfrac{1}{4}+\\dfrac{1}{6}=\\dfrac{3}{12}+\\dfrac{2}{12}=\\dfrac{5}{12}`,
          trap: 'جمع البسطين معًا والمقامين معًا',
          exam: 'اكتب الكسرين بالمقام نفسه قبل أن تجمع',
          chip: `\\tfrac{a'}{${R('D')}}+\\tfrac{c'}{${R('D')}}`,
          quiz: [
            { q: '$\\frac{1}{4}+\\frac{1}{6}=$', options: ['$\\frac{5}{12}$', '$\\frac{2}{10}$', '$\\frac{2}{24}$'], correct: 0 },
            { q: 'قبل جمع كسرين مقاماهما مختلفان نكتبهما:', options: ['بمقام مشترك', 'بالبسط نفسه', 'بأبسط شكل فقط'], correct: 0 },
          ],
        },
        predictPrompt: 'في الحوض لم تصلح المسافة $\\frac{1}{10}$ لجمع $\\frac{1}{4}$ و $\\frac{1}{6}$ ، ونجحت $\\frac{1}{12}$ بـ $3$ و $2$ شتلات. ماذا فعلنا بالكسرين قبل أن نجمعهما؟ اكتب ملاحظتك.',
        summary: 'نكتب الكسرين بنفس المقام ثمّ نجمع البسطين.',
        body: <p><MathText>{same.text}</MathText></p>,
      },
      {
        id: 'mudaaf-mushtarak', type: 'regles', title: 'المقام المشترك مضاعف مشترك للمقامين',
        memo: {
          rule: `D=${R('k')}\\times b=${R('m')}\\times d`,
          hook: 'أيّ مضاعف مشترك يصلح',
          example: `\\dfrac{5}{12}=\\dfrac{10}{24}`,
          trap: 'ظنّ أنّ مقامًا واحدًا فقط يصلح',
          exam: 'اختر مضاعفًا مشتركًا للمقامين',
          chip: `D=${R('k')}\\,b=${R('m')}\\,d`,
          quiz: [
            { q: 'أيّ هذه المقامات يصلح لجمع $\\frac{1}{4}$ و $\\frac{1}{6}$ ؟', options: ['$12$ و $24$ معًا', '$12$ فقط', '$10$'], correct: 0 },
            { q: 'الطولان $\\frac{5}{12}$ و $\\frac{10}{24}$ :', options: ['متساويان', 'مختلفان', 'الثاني أطول'], correct: 0 },
          ],
        },
        predictPrompt: 'نجحت المسافتان $\\frac{1}{12}$ و $\\frac{1}{24}$ معًا وأعطتا الطول $\\frac{5}{12}$ م نفسه. ما العلاقة بين $12$ و $24$ وبين $4$ و $6$ ؟ اكتب ملاحظتك.',
        summary: 'أيّ مضاعف مشترك للمقامين يصلح مقامًا مشتركًا، والنتيجة واحدة.',
        body: <p><MathText>{rule.text}</MathText></p>,
      },
      {
        id: 'asghar-mudaaf', type: 'regles', title: 'أصغر مضاعف مشترك',
        memo: {
          rule: `D=${R('\\operatorname{lcm}(b,d)')}`,
          hook: 'الأصغر هو الأوسع والأبسط',
          example: `\\operatorname{lcm}(4,6)=12`,
          trap: 'ضرب المقامين دائمًا',
          exam: 'ابحث عن أصغر مضاعف مشترك لتبسّط الحساب',
          chip: `D=${R('\\operatorname{lcm}')}(b,d)`,
          quiz: [
            { q: 'أصغر مضاعف مشترك للعددين $4$ و $6$ :', options: ['$12$', '$24$', '$10$'], correct: 0 },
            { q: 'أصغر مضاعف مشترك للعددين $3$ و $5$ :', options: ['$15$', '$8$', '$30$'], correct: 0 },
          ],
        },
        predictPrompt: 'أوسع مسافة نجحت في حوض $\\frac{1}{4}$ و $\\frac{1}{6}$ هي $\\frac{1}{12}$ . كيف نصل إليها بسرعة من العددين $4$ و $6$ ؟ اكتب فكرتك.',
        summary: 'أصغر مضاعف مشترك = أوسع مسافة = أبسط حساب.',
        body: <p><MathText>{rule.text}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'qaida-jam-tarh', type: 'regles', title: 'قاعدة جمع كسرين وطرحهما',
        memo: {
          rule: `\\dfrac{a}{D}\\pm\\dfrac{c}{D}=\\dfrac{${R('a\\pm c')}}{D}`,
          hook: 'وحّد، اجمع البسطين، أبقِ المقام',
          example: `\\dfrac{3}{4}-\\dfrac{1}{6}=\\dfrac{9}{12}-\\dfrac{2}{12}=\\dfrac{7}{12}`,
          trap: 'تغيير المقام عند الجمع',
          exam: 'اختزل الناتج إن أمكن',
          chip: `\\tfrac{a}{D}\\pm\\tfrac{c}{D}=\\tfrac{${R('a\\pm c')}}{D}`,
          quiz: [
            { q: '$\\frac{3}{4}-\\frac{1}{6}=$', options: ['$\\frac{7}{12}$', '$-1$', '$\\frac{2}{10}$'], correct: 0 },
            { q: '$\\frac{2}{3}+\\frac{1}{5}=$', options: ['$\\frac{13}{15}$', '$\\frac{3}{8}$', '$\\frac{3}{15}$'], correct: 0 },
          ],
        },
        predictPrompt: 'لجمع $\\frac{3}{4}$ و $\\frac{5}{6}$ كتبنا الكسرين بالمقام $12$ ثمّ جمعنا $9$ و $10$ . اكتب القاعدة التي اتّبعتها بكلماتك.',
        summary: 'نوحّد المقامين، نجمع أو نطرح البسطين، نُبقي المقام، نختزل.',
        body: <div className="space-y-2"><p><MathText>{rule.text}</MathText></p><p className="text-sm text-slate-600"><MathText>{examples.text}</MathText></p></div>,
      },
    ],
    3: [
      {
        id: 'tariqa-multiples', type: 'methodes', title: 'مضاعفات المقام الأكبر',
        memo: {
          rule: `d,\\ 2d,\\ 3d,\\ \\dots\\ \\to\\ ${R('D')}`,
          hook: 'مضاعفات الأكبر حتى يقبل الأصغر',
          example: `18,\\ 36\\ \\Rightarrow\\ 36\\div12=3`,
          trap: 'التوقف عند مضاعف لا يقبل القسمة على الآخر',
          exam: 'اكتب المضاعفات حتى تجد الأول',
          chip: `d,\\ 2d,\\ \\dots\\to${R('D')}`,
          quiz: [
            { q: 'لجمع $\\frac{7}{18}$ و $\\frac{5}{12}$ : أوّل مضاعف لـ $18$ يقبل القسمة على $12$ :', options: ['$36$', '$18$', '$54$'], correct: 0 },
            { q: 'أصغر مقام مشترك للعددين $20$ و $15$ :', options: ['$60$', '$300$', '$35$'], correct: 0 },
          ],
        },
        predictPrompt: 'لجمع $\\frac{7}{18}$ و $\\frac{5}{12}$ بحثنا عن $36$ . كيف وصلنا إليه من $18$ و $12$ دون تجربة كلّ الأعداد؟ اكتب طريقتك.',
        summary: METHOD.smallest.rule,
        body: <div className="space-y-2"><p><MathText>{METHOD.smallest.rule}</MathText></p><p className="text-sm text-slate-600"><MathText>{METHOD.natural.rule}</MathText></p></div>,
      },
    ],
  },
};
