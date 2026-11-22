import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « حلّ مشكل باستعمال معادلة » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js). L'équation « a + … = b » et « a × … = b » (1AM `bahth-adad-naqisa`, leçon PUBLIÉE : une phrase, le lien est dans le « تذكّر » du module 2),
 * la division par un décimal (`kasr-hasil-qisma`) et l'expression littérale (`ibara-harfiya-intaj`) ne sont PAS des items ici : ce sont des prérequis, rappelés par « أستعدّ » et par les « تذكّر ».
 */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const M = (s) => <MathText>{s}</MathText>;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'ma-qal-al-mil', type: 'regles', title: 'ماذا قال الملء',
        memo: {
          rule: `12\\times x=18`,
          hook: 'القوارير تحمل ما في الخزّان',
          example: `12\\times x=${R('18')}\\ \\Rightarrow\\ x=18\\div12`,
          trap: 'لا تجرّب بلا فكرة: التجارب قليلة',
          exam: 'اكتب ما يقوله الملء بعملية',
          chip: `12\\times x=18`,
          quiz: [
            { q: '$12$ قارورة سعة كلّ منها $x$ لترًا تحوي معًا:', options: ['$12\\times x$ لترًا', '$12+x$ لترًا', '$12\\div x$ لترًا'], correct: 0 },
            { q: 'إذا أعطى الملء $12$ قارورة تامّة وبقي جزء من الخزّان فالسعة:', options: ['أصغر ممّا يلزم', 'أكبر ممّا يلزم', 'هي المطلوبة'], correct: 0 },
          ],
        },
        predictPrompt: 'ملأ الخطّ قوارير فبقي عصير في الخزّان، وفي تجربة أخرى لم تكف الكمية. ماذا قال لكم كلّ ملء عن سعة القارورة؟ اكتب ما لاحظته بكلماتك.',
        summary: 'عدد القوارير مضروبًا في سعة القارورة يساوي كمية الخزّان: $12\\times x=18$ .',
        body: <p><MathText>{GUIDE.fill}</MathText></p>,
      },
      {
        id: 'muadala-kitabatan', type: 'regles', title: 'معادلتان للوضعية نفسها',
        memo: {
          rule: `12\\times x=18\\ ;\\ \\dfrac{18}{x}=12`,
          hook: 'ضرب وقسمة تقولان الشيء نفسه',
          example: `x=${R('1{,}5')}\\ \\to\\ 12\\times1{,}5=18`,
          trap: 'لا تكتب $18\\times x=12$ : الكمية الكلّية ليست عاملًا',
          exam: 'اختر كلّ المعادلات الصحيحة',
          chip: `12\\times x=18`,
          quiz: [
            { q: 'من المعادلات الآتية، الصحيحة للخطّ ($12$ قارورة و $18$ لترًا):', options: ['$12\\times x=18$ و $\\frac{18}{x}=12$', '$18\\times x=12$ فقط', '$\\frac{x}{12}=18$ فقط'], correct: 0 },
            { q: 'المعادلة $\\frac{18}{x}=12$ تقول:', options: ['$18$ لترًا موزّعة على القوارير تعطي $12$ قارورة', '$18$ قارورة تعطي $12$ لترًا', 'السعة $18$ لترًا'], correct: 0 },
          ],
        },
        predictPrompt: 'يمكن أن نكتب وضعية الخطّ بالضرب وبالقسمة. اكتب معادلتين لها، ثمّ قل: أيّ عدد مجهول فيهما؟',
        summary: 'الوضعية الواحدة تُكتب بمعادلتين صحيحتين: $12\\times x=18$ و $\\frac{18}{x}=12$ .',
        body: <p><MathText>{GUIDE.fill}</MathText></p>,
      },
      {
        id: 'qasim-naqis', type: 'regles', title: 'القاسم الناقص بالقسمة',
        memo: {
          rule: `\\dfrac{a}{x}=b\\ \\Rightarrow\\ x=a\\div b`,
          hook: 'المقسوم على حاصل القسمة',
          example: `\\dfrac{30}{x}=40\\ \\Rightarrow\\ x=30\\div40=${R('0{,}75')}`,
          trap: 'لا تضرب $30$ في $40$ : القالب لا يتّسع لذلك',
          exam: 'اقسم المقسوم على حاصل القسمة ثمّ تحقّق',
          chip: `x=a\\div b`,
          quiz: [
            { q: 'حلّ $\\frac{30}{x}=40$ :', options: ['$0{,}75$', '$1200$', '$1{,}33\\ldots$'], correct: 0 },
            { q: 'حلّ $12\\times x=18$ :', options: ['$1{,}5$', '$216$', '$0{,}66\\ldots$'], correct: 0 },
          ],
        },
        predictPrompt: 'في تجربتك الأخيرة جرّبتَ سعة ما. كيف تجد سعة القارورة التي تملأ $40$ قارورة من $30$ لترًا دون أن تجرّب؟ اكتب العملية.',
        summary: GUIDE.rule,
        body: (<div className="space-y-2"><p>{M(GUIDE.rule)}</p><p className="text-sm text-slate-600">{M(GUIDE.divisor)}</p></div>),
      },
      {
        id: 'maqsum-naqis', type: 'regles', title: 'المقسوم الناقص بالضرب',
        memo: {
          rule: `\\dfrac{x}{a}=b\\ \\Rightarrow\\ x=a\\times b`,
          hook: 'نعيد المقسوم بعكس القسمة',
          example: `\\dfrac{x}{24}=0{,}25\\ \\Rightarrow\\ x=24\\times0{,}25=${R('6')}`,
          trap: 'لا تقسم: $0{,}25\\div24$ عدد صغير جدًّا',
          exam: 'اضرب المقسوم عليه في حاصل القسمة',
          chip: `x=a\\times b`,
          quiz: [
            { q: 'حلّ $\\frac{x}{24}=0{,}25$ :', options: ['$6$', '$96$', '$0{,}01\\ldots$'], correct: 0 },
            { q: 'في $\\frac{x}{15}=1{,}5$ المجهول هو:', options: ['المقسوم', 'المقسوم عليه', 'حاصل القسمة'], correct: 0 },
          ],
        },
        predictPrompt: 'يريد أنيس $24$ قارورة سعة كلّ منها $0{,}25$ لتر. كم لترًا يضع في الخزّان؟ اكتب العملية قبل أن تضبط الخزّان.',
        summary: GUIDE.dividend,
        body: <p>{M(GUIDE.dividend)}</p>,
      },
      {
        id: 'akhir-amaliya', type: 'regles', title: 'نلغي آخر عملية أوّلًا',
        memo: {
          rule: `\\dfrac{4+x}{0{,}25}=40\\ \\Rightarrow\\ 4+x=10`,
          hook: 'نبدأ بعكس آخر عملية',
          example: `4+x=10\\ \\Rightarrow\\ x=${R('6')}`,
          trap: 'لا تطرح $4$ أوّلًا: القسمة هي الأخيرة',
          exam: 'اذكر آخر عملية ثمّ ألغِها بعكسها',
          chip: `\\dfrac{4+x}{0{,}25}=40`,
          quiz: [
            { q: 'في $\\frac{4+x}{0{,}25}=40$ آخر عملية هي:', options: ['القسمة على $0{,}25$', 'الجمع مع $4$', 'الضرب في $40$'], correct: 0 },
            { q: 'بعد إلغاء آخر عملية نجد:', options: ['$4+x=10$', '$x=36$', '$x+4=160$'], correct: 0 },
          ],
        },
        predictPrompt: 'في الخزّان $4$ لترات وتريد $40$ قارورة سعة كلّ منها $0{,}25$ لتر. ما العملية الأولى التي تفعلها لتعرف ما يجب إضافته؟ ولماذا؟',
        summary: GUIDE.twoSteps,
        body: <p>{M(GUIDE.twoSteps)}</p>,
      },
    ],
    2: [
      {
        id: 'ta3rif-muadala', type: 'regles', title: 'المعادلة وحلّها',
        memo: {
          rule: `\\dfrac{12}{x}=4\\ :\\ x=3`,
          hook: 'الحلّ يجعل المساواة صحيحة',
          example: `12\\div3=${R('4')}`,
          trap: 'لا يكفي أن نخمّن: نتحقّق بإنجاز العملية',
          exam: 'عوّض القيمة وأنجز العملية الواحدة',
          chip: `12\\div3=4`,
          quiz: [
            { q: 'العدد $3$ حلّ للمعادلة $\\frac{12}{x}=4$ لأنّ:', options: ['$12\\div3=4$', '$12-3=4$', '$3\\times4=4$'], correct: 0 },
            { q: 'المعادلة هي:', options: ['مساواة فيها عدد مجهول بحرف', 'عبارة بلا مساواة', 'عدد واحد'], correct: 0 },
          ],
        },
        predictPrompt: 'في المختبر وجدتَ سعة تملأ $12$ قارورة دون باقٍ. بماذا نسمّي هذه السعة بالنسبة إلى المعادلة $12\\times x=18$ ؟ اكتب بكلماتك.',
        summary: KNOWLEDGE.definition.text,
        body: (<div className="space-y-2"><p>{M(KNOWLEDGE.definition.text)}</p><p className="text-sm text-slate-600">{M(KNOWLEDGE.definition.example)}</p></div>),
      },
      {
        id: 'thalath-ashkal', type: 'regles', title: 'ثلاثة أشكال للمعادلة',
        memo: {
          rule: `a\\times x=b\\ ;\\ \\dfrac{x}{a}=b\\ ;\\ \\dfrac{a}{x}=b`,
          hook: 'عامل ناقص · مقسوم ناقص · قاسم ناقص',
          example: `\\dfrac{56}{x}=7\\ \\Rightarrow\\ x=56\\div7=${R('8')}`,
          trap: 'اسأل: ماذا يجهل $x$ ؟ ثمّ اختر العملية',
          exam: 'سمّ الشكل ثمّ اختر العملية العكسية',
          chip: `\\dfrac{a}{x}=b`,
          quiz: [
            { q: 'حلّ $2{,}5\\times x=10$ :', options: ['$4$', '$25$', '$7{,}5$'], correct: 0 },
            { q: 'حلّ $\\frac{x}{0{,}4}=15$ :', options: ['$6$', '$37{,}5$', '$0{,}6$'], correct: 0 },
          ],
        },
        predictPrompt: 'رأيتَ ثلاث مسائل: مجهول عامل، ومجهول مقسوم، ومجهول قاسم. ما العملية العكسية في كلّ منها؟ اكتبها بكلماتك.',
        summary: KNOWLEDGE.forms.text,
        body: (<div className="space-y-2"><p>{M(KNOWLEDGE.forms.text)}</p><p className="text-sm text-slate-600">{M(KNOWLEDGE.forms.example)}</p></div>),
      },
    ],
    3: [
      {
        id: 'tarjama-mushkil', type: 'methodes', title: 'نترجم المشكل بمعادلة',
        memo: {
          rule: `x+150=2x+60`,
          hook: 'نسمّي المجهول ثمّ نكتب كلّ جهة',
          example: `x+150\\ ;\\ ${R('2x+60')}`,
          trap: 'الترجمة لا تعني الحلّ: اكتب أوّلًا',
          exam: 'اذكر ما يمثّله الحرف ثمّ اكتب المعادلة',
          chip: `x+150=2x+60`,
          quiz: [
            { q: 'ثمن كتاب $x$ ومجلّة $150$ : المصروف:', options: ['$x+150$', '$150x$', '$x-150$'], correct: 0 },
            { q: 'كتابان من النوع نفسه وقلم بـ $60$ : المصروف:', options: ['$2x+60$', '$x+120$', '$2(x+60)$'], correct: 0 },
          ],
        },
        predictPrompt: 'اشترت سلمى كتابًا ومجلّة، واشترى أنس كتابين وقلمًا فصرفا المبلغ نفسه. كيف تكتب ما صرفه كلّ منهما بحرف؟ اكتب جملة لكلّ منهما.',
        summary: METHOD.solution[0],
        body: <p>{M(METHOD.solution[0])}</p>,
      },
      {
        id: 'tahaqquq-hall', type: 'methodes', title: 'نتحقّق من الحلّ',
        memo: {
          rule: `\\dfrac{63}{x}=4{,}5\\ :\\ x=14`,
          hook: 'نعوّض ونُنجز العملية',
          example: `63\\div14=${R('4{,}5')}`,
          trap: 'قسمة خاطئة تعطي عددًا آخر: انظر الناتج',
          exam: 'اكتب سطر التحقّق بعد الحلّ',
          chip: `63\\div14=4{,}5`,
          quiz: [
            { q: 'حلّ $\\frac{63}{x}=4{,}5$ :', options: ['$14$', '$283{,}5$', '$0{,}07$'], correct: 0 },
            { q: 'للتحقّق من $14$ نحسب:', options: ['$63\\div14$', '$63-14$', '$63\\times14$'], correct: 0 },
          ],
        },
        predictPrompt: 'وجدتَ حلًّا لمعادلة قاسمها مجهول. كيف تتأكّد أنّه صحيح دون أن تسأل أحدًا؟ اكتب الحساب الذي ستجريه.',
        summary: GUIDE.check,
        body: <p>{M(GUIDE.check)}</p>,
      },
      {
        id: 'khatwatan-tariqa', type: 'methodes', title: 'معادلة من خطوتين',
        memo: {
          rule: `2x+240=300\\ \\Rightarrow\\ 2x=60\\ \\Rightarrow\\ x=30`,
          hook: 'عملية بعد عملية بالعكس',
          example: `2\\times30+240=${R('300')}`,
          trap: 'لا تقسم على $2$ أوّلًا: الأخيرة هي $+240$',
          exam: 'اذكر آخر عملية ثمّ ألغِها',
          chip: `2x+240=300`,
          quiz: [
            { q: 'في $2x+240=300$ آخر عملية:', options: ['$+240$', '$\\times2$', '$=300$'], correct: 0 },
            { q: 'حلّ $2x+240=300$ :', options: ['$30$', '$270$', '$150$'], correct: 0 },
          ],
        },
        predictPrompt: 'في $2x+240=300$ أيّ العمليتين نعكسها أوّلًا؟ وماذا نجد بعدها؟ اكتب الخطوتين.',
        summary: KNOWLEDGE.twoSteps.text,
        body: (<div className="space-y-2"><p>{M(KNOWLEDGE.twoSteps.text)}</p><p className="text-sm text-slate-600">{M(KNOWLEDGE.twoSteps.example)}</p></div>),
      },
    ],
  },
};
