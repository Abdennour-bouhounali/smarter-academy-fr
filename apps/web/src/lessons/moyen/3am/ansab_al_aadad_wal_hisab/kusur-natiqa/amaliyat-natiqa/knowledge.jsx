import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « العمليات على الأعداد الناطقة » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 6 p. 28, طرائق 7–9 p. 29, réécrits).
 * Le produit de deux relatifs (leçon `jidaa-adadayn-nisbiyayn`), la division de deux fractions (`maqlub-qismat-kasrayn`), la somme de deux fractions (`jam-tarh-kasrayn`), le nombre ناطق
 * (`adad-natiq`, toutes PUBLIÉES) et les sommes de relatifs (2AM) sont des prérequis (`priorKnowledge`), mesurés par « أستعدّ », jamais des items ici : cette leçon les COMBINE.
 */
const { sum, prod, recip, quot } = KNOWLEDGE;

/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'jam-natiqa', type: 'regles', title: 'جمع وطرح عددين ناطقين',
        memo: {
          rule: `\\dfrac{a}{D}+\\dfrac{c}{D}=\\dfrac{${R('a+c')}}{D}`,
          hook: 'وحّد المقام ثم اجمع البسطين',
          example: `-\\dfrac{5}{4}+\\dfrac{11}{6}=-\\dfrac{15}{12}+\\dfrac{22}{12}=\\dfrac{7}{12}`,
          trap: 'جمع البسطين معًا والمقامين معًا',
          exam: 'اكتب الخطوة بالمقام المشترك قبل الجمع',
          chip: `\\tfrac{a}{D}+\\tfrac{c}{D}=\\tfrac{${R('a+c')}}{D}`,
          quiz: [
            { q: '$-\\frac{5}{4}+\\frac{11}{6}=$', options: ['$\\frac{7}{12}$', '$\\frac{6}{10}$', '$-\\frac{7}{12}$'], correct: 0 },
            { q: 'إشارة مجموع عددين مختلفي الإشارة هي إشارة:', options: ['العدد الأبعد عن الصفر', 'العدد الأول دائمًا', 'العدد الأصغر مقامًا'], correct: 0 },
          ],
        },
        predictPrompt: 'في $-\\frac{5}{4}+\\frac{11}{6}$ بقي الشريط الأزرق لأنّه الأطول، فكان الناتج موجبًا مع أنّ العدد الأوّل سالب. كيف نجمع عددين ناطقين؟ اكتب طريقتك.',
        summary: 'نحدّد إشارة الناتج ثمّ نوحّد المقامين ونجمع البسطين.',
        body: <div className="space-y-2"><p><MathText>{sum.text}</MathText></p></div>,
      },
      {
        id: 'jida-natiqa', type: 'regles', title: 'جداء عددين ناطقين',
        memo: {
          rule: `\\dfrac{a}{b}\\times\\dfrac{c}{d}=\\dfrac{${R('a\\times c')}}{${R('b\\times d')}}`,
          hook: 'الإشارة أوّلًا ثم نضرب البسطين والمقامين',
          example: `\\dfrac{7}{13}\\times\\left(-\\dfrac{8}{5}\\right)=-\\dfrac{56}{65}`,
          trap: 'توحيد المقامين قبل الضرب',
          exam: 'حدّد الإشارة ثم اضرب البسطين والمقامين',
          chip: `\\tfrac{a}{b}\\times\\tfrac{c}{d}=\\tfrac{${R('ac')}}{${R('bd')}}`,
          quiz: [
            { q: '$\\frac{7}{13}\\times\\left(-\\frac{8}{5}\\right)=$', options: ['$-\\frac{56}{65}$', '$\\frac{56}{65}$', '$-\\frac{15}{18}$'], correct: 0 },
            { q: 'جداء عددين مختلفي الإشارة:', options: ['سالب', 'موجب', 'معدوم'], correct: 0 },
          ],
        },
        predictPrompt: 'في $\\frac{7}{13}\\times\\left(-\\frac{8}{5}\\right)$ اختلفت الإشارتان فصار الناتج سالبًا. كيف نحسب جداء عددين ناطقين؟ اكتب طريقتك.',
        summary: 'الإشارة أوّلًا، ثمّ البسطان معًا والمقامان معًا.',
        body: <p><MathText>{prod.text}</MathText></p>,
      },
      {
        id: 'qisma-natiqa', type: 'regles', title: 'قسمة عددين ناطقين',
        memo: {
          rule: `\\dfrac{a}{b}\\div\\dfrac{c}{d}=\\dfrac{a}{b}\\times${R('\\dfrac{d}{c}')}`,
          hook: 'اقسم يعني اضرب في المقلوب',
          example: `-\\dfrac{9}{8}\\div\\left(-\\dfrac{3}{4}\\right)=\\dfrac{9}{8}\\times\\dfrac{4}{3}=\\dfrac{3}{2}`,
          trap: 'قلب الكسر الأول بدل القاسم',
          exam: 'اكتب مقلوب القاسم مع إشارته',
          chip: `\\div\\tfrac{c}{d}=\\times${R('\\tfrac{d}{c}')}`,
          quiz: [
            { q: 'مقلوب العدد $-\\frac{3}{4}$ هو:', options: ['$-\\frac{4}{3}$', '$\\frac{4}{3}$', '$\\frac{3}{4}$'], correct: 0 },
            { q: '$-\\frac{9}{8}\\div\\left(-\\frac{3}{4}\\right)=$', options: ['$\\frac{3}{2}$', '$-\\frac{3}{2}$', '$\\frac{27}{32}$'], correct: 0 },
          ],
        },
        predictPrompt: 'في $-\\frac{9}{8}\\div\\left(-\\frac{3}{4}\\right)$ قلبنا القاسم $-\\frac{3}{4}$ فبقيت بلاطته حمراء. ما مقلوب عدد سالب؟ وكيف نقسم عددًا ناطقًا؟ اكتب ملاحظتك.',
        summary: 'نضرب في مقلوب القاسم، ومقلوب العدد السالب سالب.',
        body: <div className="space-y-2"><p><MathText>{quot.text}</MathText></p></div>,
      },
      {
        id: 'awlawiya', type: 'methodes', title: 'أولوية العمليات',
        memo: {
          rule: `a+b\\times c=a+${R('(b\\times c)')}`,
          hook: 'ضرب وقسمة أوّلًا ثم جمع وطرح',
          example: `\\dfrac{7}{3}-\\dfrac{8}{15}\\div\\dfrac{11}{20}=\\dfrac{7}{3}-\\dfrac{32}{33}`,
          trap: 'إجراء الطرح أوّلًا لأنّه في اليسار',
          exam: 'اكتب ما تحسبه أوّلًا بين قوسين',
          chip: `${R('\\times\\div')}\\to+\\,-`,
          quiz: [
            { q: 'في $\\frac{7}{3}-\\frac{8}{15}\\div\\frac{11}{20}$ العملية الأولى هي:', options: ['القسمة', 'الطرح', 'لا فرق في الترتيب'], correct: 0 },
            { q: 'في $-\\frac{3}{4}+\\frac{5}{6}\\times\\left(-\\frac{9}{10}\\right)$ نحسب أوّلًا:', options: ['الجداء', 'المجموع', 'لا فرق في الترتيب'], correct: 0 },
          ],
        },
        predictPrompt: 'في $\\frac{7}{3}-\\frac{8}{15}\\div\\frac{11}{20}$ شدّ المغناطيس القسمة إلى $\\frac{8}{15}$ فلم نستطع طرح $\\frac{7}{3}$ أوّلًا. بأيّ ترتيب ننجز عمليات سلسلة؟ اكتب ملاحظتك.',
        summary: 'الأقواس، ثمّ الضرب والقسمة، ثمّ الجمع والطرح.',
        body: <p><MathText>{METHOD.chain.rule}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'maqlub-natiq', type: 'regles', title: 'مقلوب عدد ناطق',
        memo: {
          rule: `\\dfrac{a}{b}\\times${R('\\dfrac{b}{a}')}=1\\ ,\\ a\\neq0`,
          hook: 'المقلوب يحفظ الإشارة، ولا مقلوب للصفر',
          example: `-\\dfrac{3}{4}\\times\\left(-\\dfrac{4}{3}\\right)=1`,
          trap: 'ظنّ مقلوب العدد السالب موجبًا',
          exam: 'تحقّق أنّ جداء العدد ومقلوبه يساوي واحدًا',
          chip: `\\tfrac{a}{b}\\to${R('\\tfrac{b}{a}')}`,
          quiz: [
            { q: 'مقلوب العدد $-\\frac{8}{11}$ هو:', options: ['$-\\frac{11}{8}$', '$\\frac{11}{8}$', '$\\frac{8}{11}$'], correct: 0 },
            { q: 'العدد الذي لا مقلوب له:', options: ['$0$', '$1$', '$-1$'], correct: 0 },
          ],
        },
        predictPrompt: 'ما مقلوب $-5$ ؟ وما مقلوب $-\\frac{8}{11}$ ؟ وهل لـ $0$ مقلوب؟ اكتب أجوبتك.',
        summary: 'مقلوب $\\frac{a}{b}$ هو $\\frac{b}{a}$ بالإشارة نفسها، ولا مقلوب للعدد $0$ .',
        body: <p><MathText>{recip.text}</MathText></p>,
      },
    ],
    3: [
      {
        id: 'tariqa-amaliyat', type: 'methodes', title: 'حساب سلسلة بأعداد ناطقة',
        memo: {
          rule: `${R('(\\ )')}\\to\\times\\ \\div\\to+\\ -`,
          hook: 'رتّب الخطوات ثم احسب خطوة خطوة',
          example: `-\\dfrac{3}{4}+\\dfrac{5}{6}\\times\\left(-\\dfrac{9}{10}\\right)=-\\dfrac{3}{4}-\\dfrac{3}{4}=-\\dfrac{3}{2}`,
          trap: 'دمج الحدّين المتجاورين من غير نظر إلى الأولوية',
          exam: 'اكتب كل خطوة على سطر مع ناتجها',
          chip: `${R('\\times\\div')}\\to+\\,-`,
          quiz: [
            { q: '$-\\frac{3}{4}+\\frac{5}{6}\\times\\left(-\\frac{9}{10}\\right)=$', options: ['$-\\frac{3}{2}$', '$\\frac{3}{2}$', '$-\\frac{3}{40}$'], correct: 0 },
            { q: 'في $\\left(\\frac{1}{2}-\\frac{4}{3}\\right)\\times\\left(-\\frac{6}{5}\\right)$ نحسب أوّلًا:', options: ['ما بين القوسين', 'الضرب', 'لا فرق في الترتيب'], correct: 0 },
          ],
        },
        predictPrompt: 'لحساب $-\\frac{2{,}5}{14}-\\frac{3{,}1}{21}$ وجدنا المقام المشترك $42$ . ماذا نفعل بالبسطين العشريين، وكيف ننظّم السلاسل؟ اكتب طريقتك.',
        summary: METHOD.choose.rule,
        body: <div className="space-y-2"><p><MathText>{METHOD.sumDec.rule}</MathText></p><p className="text-sm text-slate-600"><MathText>{METHOD.choose.rule}</MathText></p></div>,
      },
    ],
  },
};
