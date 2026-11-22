import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « تساوي كسرين ومقارنتهما » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 3 p. 26, طرائق p. 27, réécrits). La comparaison
 * de deux fractions de même dénominateur, de même numérateur ou dont un dénominateur est multiple de l'autre (2AM, leçon `muqarana-kasrayn`) et l'égalité de fractions 1AM (×k) sont des
 * prérequis (`priorKnowledge`), mesurés par « أستعدّ », jamais des items ici.
 */
const { property, proof, rule, examples } = KNOWLEDGE;

/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'jidaa-mutasalib', type: 'regles', title: 'تساوي كسرين بالجداءين المتصالبين',
        memo: {
          rule: `\\dfrac{a}{b}=\\dfrac{c}{d}\\iff a\\times${R('d')}=b\\times${R('c')}`,
          hook: 'جداءان متصالبان متساويان',
          example: `\\dfrac{3}{4}=\\dfrac{6}{8}\\ :\\ 3\\times8=4\\times6`,
          trap: 'مقارنة البسطين وحدهما',
          exam: 'احسب الجداءين المتصالبين وقارن',
          chip: `a${R('d')}=b${R('c')}`,
          quiz: [
            { q: '$\\frac{3}{4}=\\frac{6}{8}$ لأنّ:', options: ['$3\\times8=4\\times6$', '$3+8=4+6$', '$3\\times6=4\\times8$'], correct: 0 },
            { q: 'هل $\\frac{2}{3}=\\frac{6}{9}$ ؟', options: ['نعم: $2\\times9=3\\times6$', 'لا: لأنّ $2\\neq6$', 'لا: لأنّ $3\\neq9$'], correct: 0 },
          ],
        },
        predictPrompt: 'دلو المرجع فيه $3$ طلقات أزرق مع $4$ علب أبيض، والدلو الذي طابقه فيه $6$ طلقات مع $8$ علب. قارن العددين $6\\times4$ و $3\\times8$ ، واكتب ما تلاحظه بكلماتك.',
        summary: 'a/b = c/d يكافئ a × d = b × c.',
        body: <p><MathText>{property.text}</MathText></p>,
      },
      {
        id: 'muqarana-mutasalib', type: 'regles', title: 'المقارنة بالجداءين المتصالبين',
        memo: {
          rule: `\\dfrac{a}{b}<\\dfrac{c}{d}\\iff a\\times${R('d')}<b\\times${R('c')}`,
          hook: 'قارن الجداءين المتصالبين',
          example: `\\dfrac{7}{10}<\\dfrac{3}{4}\\ :\\ 7\\times4<10\\times3`,
          trap: 'الحكم بالبسطين وحدهما',
          exam: 'اكتب الجداءين ثم اختم بالمقارنة',
          chip: `a${R('d')}<b${R('c')}`,
          quiz: [
            { q: 'الأكبر بين $\\frac{7}{10}$ و $\\frac{3}{4}$ :', options: ['$\\frac{3}{4}$', '$\\frac{7}{10}$', 'متساويان'], correct: 0 },
            { q: 'أيّ مقارنة صحيحة؟', options: ['$\\frac{7}{9}>\\frac{10}{13}$', '$\\frac{7}{9}<\\frac{10}{13}$', '$\\frac{7}{9}=\\frac{10}{13}$'], correct: 0 },
          ],
        },
        predictPrompt: 'مع $10$ علب أبيض كان $7$ طلقات أفتح من المرجع $\\frac{3}{4}$ و $8$ أغمق. ما علاقة ذلك بالجداءين $7\\times4$ و $3\\times10$ ؟ اكتب ملاحظتك.',
        summary: 'a/b < c/d يكافئ a × d < b × c.',
        body: <p><MathText>{rule.text}</MathText></p>,
      },
      {
        id: 'tawhid-maqamat', type: 'regles', title: 'توحيد المقامين',
        memo: {
          rule: `\\dfrac{a}{b}=\\dfrac{a\\times k}{${R('D')}}`,
          hook: 'مقام واحد ثم نقارن البسطين',
          example: `\\dfrac{3}{4}=\\dfrac{15}{20}>\\dfrac{14}{20}=\\dfrac{7}{10}`,
          trap: 'مقارنة المقامين بدل البسطين',
          exam: 'اكتب المقام المشترك ثم قارن',
          chip: `\\tfrac{a}{b}=\\tfrac{ak}{${R('D')}}`,
          quiz: [
            { q: 'العدد $\\frac{3}{4}$ بالمقام $20$ :', options: ['$\\frac{15}{20}$', '$\\frac{3}{20}$', '$\\frac{12}{20}$'], correct: 0 },
            { q: 'العدد $\\frac{7}{10}$ بالمقام $20$ :', options: ['$\\frac{14}{20}$', '$\\frac{7}{20}$', '$\\frac{17}{20}$'], correct: 0 },
          ],
        },
        predictPrompt: 'اكتب $\\frac{3}{4}$ و $\\frac{7}{10}$ بالمقام $20$ . ماذا تلاحظ عند مقارنة البسطين؟ وأيّ عدد آخر يصلح مقامًا مشتركًا؟',
        summary: 'نكتب الكسرين بمضاعف مشترك للمقامين ثمّ نقارن البسطين.',
        body: <p><MathText>{rule.text}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'jidaa-property', type: 'regles', title: 'الخاصية في الاتجاهين ولماذا تصحّ',
        memo: {
          rule: `\\dfrac{ad}{${R('bd')}}\\ ,\\ \\dfrac{bc}{${R('bd')}}`,
          hook: 'المقام المشترك يشرح القاعدة',
          example: `\\dfrac{3}{4}=\\dfrac{24}{32}\\ ,\\ \\dfrac{6}{8}=\\dfrac{24}{32}`,
          trap: 'اعتبار القاعدة سحرًا بلا سبب',
          exam: 'علّل بالمقام المشترك جداء المقامين',
          chip: `\\tfrac{ad}{${R('bd')}}\\ ,\\ \\tfrac{bc}{${R('bd')}}`,
          quiz: [
            { q: 'بالمقام $b\\times d$ يصبح بسط $\\frac{a}{b}$ :', options: ['$a\\times d$', '$a\\times b$', '$a+d$'], correct: 0 },
            { q: 'يتساوى الكسران بالمقام نفسه إذا:', options: ['تساوى البسطان', 'تساوى المقامان فقط', 'كان الأول أكبر'], correct: 0 },
          ],
        },
        predictPrompt: 'لماذا يكفي أن نكتب الكسرين بالمقام $b\\times d$ لنثبت أنّ $\\frac{a}{b}=\\frac{c}{d}$ يكافئ $a\\times d=b\\times c$ ؟ اكتب فكرتك.',
        summary: 'نكتب الكسرين بالمقام b×d: يتساويان إذا تساوى بسطاهما.',
        body: <div className="space-y-2"><p><MathText>{property.text}</MathText></p><p className="text-sm text-slate-600"><MathText>{proof.text}</MathText></p></div>,
      },
      {
        id: 'qaida-tawhid', type: 'regles', title: 'قاعدة توحيد المقامين',
        memo: {
          rule: `\\dfrac{a}{b}\\ \\square\\ \\dfrac{c}{d}\\to\\dfrac{a'}{${R('D')}}\\ \\square\\ \\dfrac{c'}{${R('D')}}`,
          hook: 'وحّد المقام ثم قارن البسطين',
          example: `\\dfrac{11}{18}=\\dfrac{22}{36}>\\dfrac{21}{36}=\\dfrac{7}{12}`,
          trap: 'ضرب أحد الكسرين فقط',
          exam: 'اكتب أصغر مضاعف مشترك ثم قارن',
          chip: `\\tfrac{a'}{${R('D')}}\\ \\square\\ \\tfrac{c'}{${R('D')}}`,
          quiz: [
            { q: 'أصغر مضاعف مشترك للعددين $18$ و $12$ :', options: ['$36$', '$216$', '$30$'], correct: 0 },
            { q: 'العدد $\\frac{11}{18}$ بالمقام $36$ :', options: ['$\\frac{22}{36}$', '$\\frac{11}{36}$', '$\\frac{33}{36}$'], correct: 0 },
          ],
        },
        predictPrompt: 'قارن $\\frac{5}{6}$ و $\\frac{7}{8}$ بكتابتهما بالمقام نفسه، ثم اكتب القاعدة التي اتّبعتها.',
        summary: 'مقام مشترك ثم مقارنة البسطين.',
        body: <div className="space-y-2"><p><MathText>{rule.text}</MathText></p><p className="text-sm text-slate-600"><MathText>{examples.text}</MathText></p></div>,
      },
    ],
    3: [
      {
        id: 'ikhtiyar-tariqa', type: 'methodes', title: 'اختيار طريقة المقارنة',
        memo: {
          rule: `a\\,d\\ \\square\\ b\\,c\\ \\ |\\ \\ \\tfrac{a'}{${R('D')}}\\ \\square\\ \\tfrac{c'}{${R('D')}}`,
          hook: 'اختر الأسهل حسب الأعداد',
          example: `\\dfrac{7}{9}\\ ,\\ \\dfrac{10}{13}\\to7\\times13>9\\times10`,
          trap: 'استعمال طريقة طويلة عند مقامين كبيرين',
          exam: 'اذكر الطريقة التي اخترتها ولماذا',
          chip: `a\\,d\\ \\square\\ b\\,c`,
          quiz: [
            { q: 'لمقارنة $\\frac{7}{9}$ و $\\frac{10}{13}$ (مقاماهما كبيران) الأنسب:', options: ['الجداءان المتصالبان', 'النظر إلى البسطين فقط', 'التقريب بالعين'], correct: 0 },
            { q: 'للعددين $\\frac{3}{4}$ و $\\frac{7}{10}$ طريقة سهلة:', options: ['مقام مشترك $20$', 'مقام مشترك $400$', 'البسطان فقط'], correct: 0 },
          ],
        },
        predictPrompt: 'لمقارنة $\\frac{125}{97}$ و $\\frac{61}{340}$ لا نحتاج إلى مقام مشترك. لماذا؟ اكتب طريقتك، وقل متى تختار الجداءين المتصالبين.',
        summary: METHOD.choose.rule,
        body: <div className="space-y-2"><p><MathText>{METHOD.choose.rule}</MathText></p><p className="text-sm text-slate-600"><MathText>{METHOD.digits.rule}</MathText></p></div>,
      },
    ],
  },
};
