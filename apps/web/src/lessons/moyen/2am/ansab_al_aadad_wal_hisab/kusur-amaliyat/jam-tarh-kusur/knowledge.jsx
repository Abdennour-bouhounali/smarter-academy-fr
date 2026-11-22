import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « جمع وطرح كسرين » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js). Les fractions décimales (1AM kusur-ashriya-kitaba), les écritures égales
 * (1AM ikhtizal-kitaba-kasriya) et la comparaison de deux fractions de même dénominateur (leçon SUIVANTE de l'unité : une phrase, pas de lien) ne sont PAS des items ici : ce sont des prérequis,
 * rappelés par les « تذكّر » du module 2.
 */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const M = (s) => <MathText>{s}</MathText>;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'nafs-al-maqam', type: 'regles', title: 'أجزاء من الحجم نفسه نجمعها',
        memo: {
          rule: `\\dfrac{a}{c}+\\dfrac{b}{c}=\\dfrac{a${R('+')}b}{${R('c')}}`,
          hook: 'نعدّ الأجزاء، والمقام يبقى',
          example: `\\dfrac{5}{12}+\\dfrac{4}{12}=\\dfrac{${R('9')}}{12}`,
          trap: 'لا تجمع المقامين: الأجزاء لم تصغر',
          exam: 'اجمع البسطين واحتفظ بالمقام ثم اختزل',
          chip: `\\tfrac{a+b}{c}`,
          quiz: [
            { q: '$\\frac{5}{12}+\\frac{4}{12}$ تساوي:', options: ['$\\frac{9}{12}$', '$\\frac{9}{24}$', '$\\frac{20}{12}$'], correct: 0 },
            { q: 'أيّ كتابة صحيحة؟', options: ['$\\frac{3}{8}+\\frac{2}{8}=\\frac{5}{8}$', '$\\frac{3}{8}+\\frac{2}{8}=\\frac{5}{16}$', '$\\frac{3}{8}+\\frac{2}{8}=\\frac{6}{8}$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المهمة 1 مشيتم 5 أعمدة بيضاء ثم 4 أعمدة بيضاء. كم عمودًا أبيض صار عندكم؟ وهل تغيّر حجم العمود الأبيض؟ اكتب ما لاحظته بكلماتك.',
        summary: 'نجمع كسرين لهما نفس المقام بجمع البسطين مع الاحتفاظ بالمقام، لأنّ حجم الجزء لا يتغيّر.',
        body: <p><MathText>{GUIDE.sameOnly}</MathText></p>,
      },
      {
        id: 'tawhid-mudaaf', type: 'methodes', title: 'نكتب المرحلة الحمراء بأعمدة بيضاء',
        memo: {
          rule: `\\dfrac{a}{b}=\\dfrac{a${R('\\times k')}}{b${R('\\times k')}}`,
          hook: 'الأحمر يساوي k من الأبيض',
          example: `\\dfrac{1}{4}=\\dfrac{1\\times ${R('3')}}{4\\times ${R('3')}}=\\dfrac{3}{12}`,
          trap: 'اضرب الحدّين معًا، لا المقام وحده',
          exam: 'اكتب العدد الذي ضربت فيه الحدّين',
          chip: `\\tfrac{\\times k}{\\times k}`,
          quiz: [
            { q: '$\\frac{1}{4}$ مكتوبة بالمقام $12$ :', options: ['$\\frac{3}{12}$', '$\\frac{1}{12}$', '$\\frac{4}{12}$'], correct: 0 },
            { q: '$\\frac{3}{8}$ مكتوبة بالمقام $16$ :', options: ['$\\frac{6}{16}$', '$\\frac{3}{16}$', '$\\frac{8}{16}$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المهمة 2 كانت المرحلة الثانية «ربع المسلك» بأعمدة حمراء. كم عمودًا أبيض في المرحلة الحمراء الواحدة؟ وماذا فعلنا بالربع لنعدّه بالأبيض؟ اكتب ذلك بكلماتك.',
        summary: 'حين يكون مقام أحد الكسرين مضاعفًا لمقام الآخر نكتب الآخر بالمقام الأكبر بضرب حدّيه في العدد نفسه، فتصير الأجزاء من الحجم نفسه.',
        body: <p><MathText>{GUIDE.redToWhite}</MathText></p>,
      },
      {
        id: 'al-baqi', type: 'regles', title: 'الباقي من الكلّ',
        memo: {
          rule: `1-\\dfrac{a}{b}=\\dfrac{b${R('-')}a}{b}`,
          hook: 'الكلّ ناقص ما مُشي',
          example: `1-\\dfrac{9}{12}=\\dfrac{12}{12}-\\dfrac{9}{12}=${R('\\dfrac{3}{12}')}`,
          trap: 'الباقي ليس الجزء المقطوع نفسه',
          exam: 'اكتب 1 بمقام الكسر ثم اطرح',
          chip: `1-\\tfrac{a}{b}`,
          quiz: [
            { q: '$1-\\frac{5}{9}$ تساوي:', options: ['$\\frac{4}{9}$', '$\\frac{5}{9}$', '$\\frac{4}{8}$'], correct: 0 },
            { q: 'مشى الفوج $\\frac{2}{3}$ من المسلك، فالباقي:', options: ['$\\frac{1}{3}$', '$\\frac{2}{3}$', '$\\frac{3}{2}$'], correct: 0 },
          ],
        },
        predictPrompt: 'قطعتم 9 أعمدة بيضاء من أصل 12 في المهمة 1. كم بقي إلى العين؟ وكيف نكتبه بكسر؟ اكتب ذلك بكلماتك.',
        summary: 'الباقي من الكلّ هو $1$ ناقص الكسر المأخوذ، وهو $\\frac{b}{b}-\\frac{a}{b}$ .',
        body: <p><MathText>{GUIDE.rest}</MathText></p>,
      },
      {
        id: 'tarh-kajam', type: 'regles', title: 'الطرح مثل الجمع',
        memo: {
          rule: `\\dfrac{a}{b}-\\dfrac{c}{d}=\\dfrac{a\\times k${R('-')}c}{d}`,
          hook: 'نعود بالأعمدة البيضاء نفسها',
          example: `\\dfrac{3}{4}-\\dfrac{5}{12}=\\dfrac{9}{12}-\\dfrac{5}{12}=${R('\\dfrac{4}{12}')}=\\dfrac{1}{3}`,
          trap: 'لا تطرح المقامين: قد يصير سالبًا',
          exam: 'وحّد المقامين ثم اطرح البسطين واختزل',
          chip: `\\tfrac{9-5}{12}`,
          quiz: [
            { q: '$\\frac{3}{4}-\\frac{5}{12}$ تساوي:', options: ['$\\frac{1}{3}$', '$\\frac{2}{8}$', '$\\frac{8}{12}$'], correct: 0 },
            { q: '$\\frac{7}{10}-\\frac{2}{5}$ تساوي:', options: ['$\\frac{3}{10}$', '$\\frac{5}{5}$', '$\\frac{5}{10}$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المهمة 3 كان الفوج عند ثلاثة أرباع المسلك ثم عاد 5 أعمدة بيضاء. ماذا فعلتم بثلاثة الأرباع قبل أن تعدّوا العودة؟ اكتب القاعدة بكلماتك.',
        summary: 'نطرح كسرين كما نجمعهما: نكتبهما بنفس المقام ثم نطرح البسطين ونحافظ على المقام ونختزل.',
        body: <p><MathText>{GUIDE.back}</MathText></p>,
      },
      {
        id: 'adad-tabii-kasr', type: 'regles', title: 'عدد طبيعي وكسر',
        memo: {
          rule: `n+\\dfrac{a}{b}=\\dfrac{n\\times b${R('+')}a}{b}`,
          hook: 'الدورة الكاملة هي b من b',
          example: `1+\\dfrac{5}{6}=\\dfrac{6}{6}+\\dfrac{5}{6}=${R('\\dfrac{11}{6}')}`,
          trap: 'لا تكتب n + a على b',
          exam: 'اكتب العدد الطبيعي كسرًا بمقام الكسر',
          chip: `n+\\tfrac{a}{b}`,
          quiz: [
            { q: '$2+\\frac{5}{6}$ تساوي:', options: ['$\\frac{17}{6}$', '$\\frac{7}{6}$', '$\\frac{7}{12}$'], correct: 0 },
            { q: 'العدد $1$ مكتوبًا بمقام $6$ :', options: ['$\\frac{6}{6}$', '$\\frac{1}{6}$', '$\\frac{6}{1}$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المهمة 4 دار الفوج دورة كاملة ثم 5 أعمدة بيضاء. كم عمودًا أبيض عدّ العدّاد؟ وهل يساوي ذلك ستة أعمدة من ستة؟ اكتب ما لاحظته بكلماتك.',
        summary: 'نكتب العدد الطبيعي كسرًا مقامه مقام الكسر ثم نجمع البسطين: $1+\\frac{5}{6}=\\frac{11}{6}$ .',
        body: <p><MathText>{GUIDE.loop}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'qaida-jam-tarh', type: 'regles', title: 'قاعدتا الجمع والطرح', predict: false,
        memo: {
          rule: `\\dfrac{a}{b}\\pm\\dfrac{c}{d}=\\dfrac{a${R('\\times k')}\\pm c}{d}`,
          hook: 'نفس المقام، أو مقام مضاعف: نوحّد ثم نجمع',
          example: `\\dfrac{11}{18}-\\dfrac{1}{6}=\\dfrac{11}{18}-\\dfrac{3}{18}=${R('\\dfrac{4}{9}')}`,
          trap: 'تحقّق أنّ مقامًا يقسم الآخر قبل أن تبدأ',
          exam: 'اكتب العدد k الذي ضربت فيه الحدّين ثم اختزل',
          chip: `\\tfrac{a\\pm b}{c}`,
          quiz: [
            { q: '$\\frac{3{,}2}{3}-\\frac{1{,}6}{3}$ تساوي:', options: ['$\\frac{1{,}6}{3}$', '$\\frac{4{,}8}{3}$', '$\\frac{1{,}6}{0}$'], correct: 0 },
            { q: '$\\frac{7}{15}+\\frac{2}{5}$ تساوي:', options: ['$\\frac{13}{15}$', '$\\frac{9}{20}$', '$\\frac{9}{15}$'], correct: 0 },
          ],
        },
        summary: 'لجمع (أو طرح) كسرين لهما نفس المقام نجمع (أو نطرح) البسطين ونحافظ على المقام، ولو كان البسطان عشريين؛ وإذا كان مقام أحدهما مضاعفًا لمقام الآخر كتبنا الآخر بالمقام الأكبر أوّلًا.',
        body: (
          <div className="space-y-2">
            <p>{M(KNOWLEDGE.same.text)}</p>
            <p className="text-sm text-slate-600">{M(KNOWLEDGE.same.example)}</p>
            <p>{M(KNOWLEDGE.multiple.text)}</p>
            <p className="text-sm text-slate-600">{M(KNOWLEDGE.multiple.example)}</p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqa-tawhid', type: 'methodes', title: 'طريقة التوحيد ثم الجمع ثم الاختزال',
        memo: {
          rule: `\\dfrac{a}{b}+\\dfrac{c}{d}\\ \\Rightarrow\\ \\dfrac{${R('a\\times k')}}{d}+\\dfrac{c}{d}=\\dfrac{${R('ak+c')}}{d}`,
          hook: 'أوحّد، أجمع، أختزل',
          example: `\\dfrac{4}{9}+\\dfrac{5}{18}+\\dfrac{1}{6}=\\dfrac{16}{18}=${R('\\dfrac{8}{9}')}`,
          trap: 'اختر مقامًا يقبل القسمة عليه كلّ المقامات الأخرى',
          exam: 'اكتب المقام الموحّد ثم الناتج ثم الكسر المختزل',
          chip: `\\tfrac{\\times k}{\\times k}\\to\\tfrac{+}{d}`,
          quiz: [
            { q: 'لجمع ثلاثة كسرين مقاماتها $9$ و $18$ و $6$ نختار المقام:', options: ['$18$', '$9$', '$6$'], correct: 0 },
            { q: '$\\frac{4}{9}+\\frac{5}{18}+\\frac{1}{6}$ بعد الاختزال:', options: ['$\\frac{8}{9}$', '$\\frac{16}{36}$', '$\\frac{10}{33}$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تجمع كسورًا مقاماتها 9 و 18 و 6 دون أن تخطئ؟ ما المقام الذي تختاره؟ وماذا تفعل بعد الجمع؟ اكتب طريقتك.',
        summary: METHOD.rule,
        body: (<div className="space-y-2"><p>{M(METHOD.rule)}</p><p className="text-sm text-slate-600">{M(METHOD.solution[3])}</p></div>),
      },
    ],
  },
};
