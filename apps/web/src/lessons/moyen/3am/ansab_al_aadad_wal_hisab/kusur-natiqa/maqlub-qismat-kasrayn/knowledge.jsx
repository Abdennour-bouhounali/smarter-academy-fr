import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « مقلوب عدد وقسمة كسرين » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 1 et 2 p. 26, réécrits). Le produit
 * de deux fractions (2AM, leçon `jida-kasrayn`) et le quotient de deux relatifs (3AM, `qismat-nisbiyayn`) sont des prérequis (`priorKnowledge`), mesurés par « أستعدّ »,
 * jamais des items ici.
 */
const { definition, zero, notation, property, examples } = KNOWLEDGE;

/**
 * `memo` — la FICHE DE MÉMOIRE de « 🔑 للتذكّر » (MemoCard, prototype 2026-10-28) : `rule` la règle en grand (KaTeX ; ce qui CHANGE en `R{…}`),
 * `hook` le slogan, `example`, `trap`, `exam`, `chip` (la mini-formule quand l'item est un acquis antérieur).
 */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'maqlub', type: 'regles', title: 'مقلوب عدد غير معدوم',
        memo: {
          rule: `\\dfrac{a}{b}\\times${R('\\dfrac{b}{a}')}=1`,
          hook: 'اقلب: البسط ينزل والمقام يصعد',
          example: `\\dfrac{3}{4}\\times${R('\\dfrac{4}{3}')}=1`,
          trap: 'المقلوب ليس المعاكس: المعاكس يغيّر الإشارة فقط',
          exam: 'تحقّق دائمًا: جداء العدد ومقلوبه يساوي $1$',
          chip: `\\tfrac{a}{b}\\to${R('\\tfrac{b}{a}')}`,
          quiz: [
            { q: 'مقلوب $\\frac{5}{7}$ هو:', options: ['$\\frac{7}{5}$', '$-\\frac{5}{7}$', '$\\frac{5}{7}$'], correct: 0 },
            { q: 'جداء عدد غير معدوم ومقلوبه يساوي:', options: ['$1$', '$0$', 'العدد نفسه'], correct: 0 },
          ],
        },
        predictPrompt: 'دورة واحدة للعجلة تحتاج $\\frac{4}{3}$ دورة للدوّاسة، ودورة واحدة للدوّاسة تُدير العجلة $\\frac{3}{4}$ دورة. ما العلاقة بين العددين $\\frac{3}{4}$ و $\\frac{4}{3}$ ؟ اكتبها بكلماتك.',
        summary: 'مقلوب x هو العدد الذي جداؤه مع x يساوي 1 ؛ مقلوب a/b هو b/a.',
        body: <p><MathText>{definition.text}</MathText></p>,
      },
      {
        id: 'qisma-darb', type: 'regles', title: 'القسمة ضرب في المقلوب',
        memo: {
          rule: `x\\div\\dfrac{c}{d}=x\\times${R('\\dfrac{d}{c}')}`,
          hook: 'القسمة على كسر = الضرب في مقلوبه',
          example: `6\\div\\dfrac{3}{4}=6\\times${R('\\dfrac{4}{3}')}=8`,
          trap: 'لا تضرب في الكسر نفسه، بل في مقلوبه',
          exam: 'حوّل كلّ «÷ كسر» إلى «× مقلوبه» قبل أيّ حساب',
          chip: `\\div\\tfrac{c}{d}=\\times${R('\\tfrac{d}{c}')}`,
          quiz: [
            { q: '$8 \\div \\frac{2}{3} =$', options: ['$8 \\times \\frac{3}{2}$', '$8 \\times \\frac{2}{3}$', '$\\frac{1}{8} \\times \\frac{2}{3}$'], correct: 0 },
            { q: '$6 \\div \\frac{3}{4} =$', options: ['$8$', '$\\frac{9}{2}$', '$\\frac{1}{8}$'], correct: 0 },
          ],
        },
        predictPrompt: 'العجلة تدور 6 دورات، ودورة واحدة للعجلة تحتاج $\\frac{4}{3}$ دورة للدوّاسة. كيف نجد عدد دورات الدوّاسة؟ ومن أين نحصل على العملية $6 \\div \\frac{3}{4}$ ؟',
        summary: 'القسمة على 3/4 هي الضرب في مقلوبه 4/3.',
        body: <p><MathText>{property.text}</MathText></p>,
      },
      {
        id: 'qismat-kasrayn', type: 'regles', title: 'قسمة كسر على كسر',
        memo: {
          rule: `\\dfrac{a}{b}\\div\\dfrac{c}{d}=\\dfrac{a}{b}\\times${R('\\dfrac{d}{c}')}`,
          hook: 'الأول كما هو · الثاني مقلوب · ثم اضرب',
          example: `\\dfrac{9}{2}\\div\\dfrac{3}{4}=\\dfrac{9}{2}\\times${R('\\dfrac{4}{3}')}=6`,
          trap: 'لا تقلب الكسر الأول، ولا الكسرين معًا',
          exam: 'اكتب سطر «× المقلوب» ثم الناتج على أبسط شكل',
          chip: `\\tfrac{a}{b}\\div\\tfrac{c}{d}=\\tfrac{a}{b}\\times${R('\\tfrac{d}{c}')}`,
          quiz: [
            { q: '$\\frac{2}{5} \\div \\frac{3}{7} =$', options: ['$\\frac{2}{5} \\times \\frac{7}{3}$', '$\\frac{5}{2} \\times \\frac{3}{7}$', '$\\frac{5}{2} \\times \\frac{7}{3}$'], correct: 0 },
            { q: '$\\frac{9}{2} \\div \\frac{3}{4} =$', options: ['$6$', '$\\frac{27}{8}$', '$\\frac{8}{27}$'], correct: 0 },
          ],
        },
        predictPrompt: 'الهدف $\\frac{9}{2}$ دورة للعجلة والدوّاسة تُدير العجلة $\\frac{3}{4}$ دورة في كلّ دورة. اكتب كيف نحسب عدد دورات الدوّاسة من الكسرين.',
        summary: 'a/b ÷ c/d = a/b × d/c.',
        body: <div className="space-y-2"><p><MathText>{property.text}</MathText></p><p className="text-sm text-slate-600"><MathText>{examples.text}</MathText></p></div>,
      },
    ],
    2: [
      {
        id: 'maqlub-tarif', type: 'vocabulaire', title: 'مقلوب طبيعي أو عشري أو كسر', predict: false,
        memo: {
          rule: `a\\to${R('\\dfrac{1}{a}')}\\qquad\\left(\\dfrac{a}{b}\\right)^{-1}=${R('\\dfrac{b}{a}')}`,
          hook: 'العشري: اكتبه كسرًا أولًا ثم اقلب',
          example: `0{,}4=\\dfrac{2}{5}\\;\\Rightarrow\\;${R('\\dfrac{5}{2}')}`,
          trap: 'مقلوب $0{,}4$ ليس $4{,}0$',
          exam: 'الكتابة $x^{-1}$ تعني: مقلوب $x$',
          chip: `x^{-1}=${R('\\tfrac{1}{x}')}`,
          quiz: [
            { q: 'مقلوب $0{,}5$ هو:', options: ['$2$', '$5{,}0$', '$0{,}2$'], correct: 0 },
            { q: '$\\left(\\frac{3}{8}\\right)^{-1} =$', options: ['$\\frac{8}{3}$', '$-\\frac{3}{8}$', '$\\frac{3}{8}$'], correct: 0 },
          ],
        },
        summary: 'مقلوب a هو 1/a ، ومقلوب a/b هو b/a ، ومقلوب العدد العشري نكتبه كسرًا ثم نقلبه.',
        body: <div className="space-y-2"><p><MathText>{definition.text}</MathText></p><p className="text-sm text-slate-600"><MathText>{notation.text}</MathText></p></div>,
      },
      {
        id: 'sifr-item', type: 'regles', title: 'العدد 0 ليس له مقلوب',
        memo: {
          rule: `0\\times x=0\\;${R('\\neq')}\\;1`,
          hook: 'الصفر وحده بلا مقلوب',
          example: `0\\times 7=0\\qquad 0\\times\\dfrac{1}{2}=0`,
          trap: 'لا قسمة على $0$، ولا على كسر بسطه $0$',
          exam: 'قبل أن تقلب، تأكّد أنّ العدد ليس $0$',
          chip: `0\\times x${R('\\neq')}1`,
          quiz: [
            { q: 'أيّ عدد ليس له مقلوب؟', options: ['$0$', '$1$', '$-1$'], correct: 0 },
            { q: 'مقلوب $\\frac{0}{4}$ :', options: ['غير موجود', '$\\frac{4}{0}$', '$4$'], correct: 0 },
          ],
        },
        predictPrompt: 'هل يوجد عدد جداؤه مع $0$ يساوي $1$ ؟ ولماذا لا تُدير دوّاسة بلا أسنان عجلةً؟ اكتب جوابك.',
        summary: 'لا مقلوب للعدد 0 : كلّ عدد مضروب في 0 يعطي 0 لا 1.',
        body: <p><MathText>{zero.text}</MathText></p>,
      },
    ],
    3: [
      {
        id: 'ikhtizal-qabl', type: 'methodes', title: 'الاختزال قبل الضرب',
        memo: {
          rule: `\\dfrac{a}{b}\\div\\dfrac{c}{d}=\\dfrac{a\\times ${R('d')}}{b\\times ${R('c')}}`,
          hook: 'حلّل · احذف · ثم اضرب',
          example: `\\dfrac{14}{15}\\times\\dfrac{10}{21}=\\dfrac{2\\cdot\\cancel{7}\\cdot2\\cdot\\cancel{5}}{3\\cdot\\cancel{5}\\cdot3\\cdot\\cancel{7}}=\\dfrac{4}{9}`,
          trap: 'لا تضرب الأعداد الكبيرة ثم تختزل: أخطاء أكثر',
          exam: 'يُطلب الناتج «على أبسط شكل»: اختزل حتى النهاية',
          chip: `\\tfrac{a\\times d}{b\\times c}`,
          quiz: [
            { q: '$\\frac{14}{15} \\div \\frac{21}{10}$ على أبسط شكل:', options: ['$\\frac{4}{9}$', '$\\frac{49}{25}$', '$\\frac{9}{4}$'], correct: 0 },
            { q: 'لحساب $\\frac{6}{35} \\times \\frac{14}{9}$ بسرعة:', options: ['نختزل $6$ مع $9$ و $14$ مع $35$ ثم نضرب', 'نضرب أوّلًا ثم نختزل', 'نجمع البسطين والمقامين'], correct: 0 },
          ],
        },
        predictPrompt: 'لقسمة $\\frac{14}{15}$ على $\\frac{21}{10}$ نضرب في المقلوب. كيف نتجنّب أعدادًا كبيرة في الحساب؟ اكتب طريقتك.',
        summary: METHOD.simplify.rule,
        body: <div className="space-y-2"><p><MathText>{METHOD.simplify.rule}</MathText></p><p className="text-sm text-slate-600"><MathText>{METHOD.compound.rule}</MathText></p></div>,
      },
    ],
  },
};
