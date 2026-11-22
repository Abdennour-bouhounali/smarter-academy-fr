import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « إنتاج عبارة حرفية واستعمالها » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js). Les chaînes d'opérations, la dernière opération et la distributivité (unité 1) et « مجموع a و b » (1AM,
 * leçon PRÉVUE : une phrase, pas de lien) ne sont PAS des items ici : ce sont des prérequis, rappelés par les « تذكّر » du module 2.
 */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const M = (s) => <MathText>{s}</MathText>;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'harf-yaud', type: 'regles', title: 'الحرف يمثّل عدد الخلايا',
        memo: {
          rule: `n\\to ${R('5n+1')}`,
          hook: 'حرف واحد يمثّل كلّ الصفوف',
          example: `n=3\\ :\\ 5\\times 3+1=${R('16')}`,
          trap: 'لا تكتب عددًا لكلّ صفّ: الحرف يقبل كلّ الأعداد',
          exam: 'سمِّ الحرف ثم اكتب العبارة',
          chip: `n\\to 5n+1`,
          quiz: [
            { q: 'صفّ من خلية واحدة يحمل $6$ أعواد وصفّ من خليتين $11$ . الحرف $n$ يمثّل:', options: ['عدد الخلايا في الصفّ', 'عدد الأعواد', 'عدد الصفوف'], correct: 0 },
            { q: 'لماذا نستعمل حرفًا لكتابة قاعدة عدد الأعواد؟', options: ['لأنّ العدد يتغيّر من صفّ إلى آخر', 'لأنّ الأعواد كثيرة', 'لأنّ الخلايا سداسية'], correct: 0 },
          ],
        },
        predictPrompt: 'بنيتم صفّ خلية، ثمّ خليتين، ثمّ ثلاث خلايا. ما الذي يتغيّر من صفّ إلى آخر؟ وما الذي يمكن أن يمثّله حرف؟ اكتب ما لاحظته بكلماتك.',
        summary: 'الحرف يمثّل عددًا يتغيّر: هنا $n$ عدد خلايا الصفّ، وهو يقبل كلّ الأعداد من $1$ إلى $8$ وأكثر.',
        body: <p><MathText>{GUIDE.cells}</MathText></p>,
      },
      {
        id: 'qaida-5n1', type: 'regles', title: 'قاعدة عدد الأعواد',
        memo: {
          rule: `${R('5')}\\times n+${R('1')}=5n+1`,
          hook: 'خمسة لكلّ خلية وعود أوّل',
          example: `n=2\\ :\\ 5\\times 2+1=${R('11')}`,
          trap: 'لا تكتب $6n$ : العود المشترك يُعدّ مرّة واحدة',
          exam: 'اكتب العبارة ثم تحقّق منها على صفّين',
          chip: `5n+1`,
          quiz: [
            { q: 'عدد أعواد صفّ من $n$ خلية هو:', options: ['$5n+1$', '$6n$', '$5n$'], correct: 0 },
            { q: 'القاعدة $6n$ تعطي من أجل $n=2$ :', options: ['$12$ والصفّ يحمل $11$', '$11$', '$10$'], correct: 0 },
          ],
        },
        predictPrompt: 'كم عودًا تضيف كلّ خلية جديدة؟ وما العدد الذي يبقى وحده؟ كيف تكتب ذلك بالحرف $n$ ؟ اكتب قاعدتك.',
        summary: 'عدد أعواد صفّ من $n$ خلية هو $5\\times n+1=5n+1$ : خمسة أعواد لكلّ خلية وعود أوّل وحده.',
        body: <p><MathText>{GUIDE.rule}</MathText></p>,
      },
      {
        id: 'qima-40', type: 'regles', title: 'قيمة العبارة من أجل n = 40',
        memo: {
          rule: `5n+1\\ \\to\\ n=40`,
          hook: 'نعوّض الحرف ثم نحسب بالأولويات',
          example: `5\\times 40+1=200+1=${R('201')}`,
          trap: 'لا تلصق الرقمين: $5n$ من أجل $n=40$ ليست $540$',
          exam: 'اكتب التعويض ثم النتيجة',
          chip: `5\\times 40+1`,
          quiz: [
            { q: 'قيمة $5n+1$ من أجل $n=40$ :', options: ['$201$', '$541$', '$240$'], correct: 0 },
            { q: 'كم عودًا يحتاج صفّ من $12$ خلية؟', options: ['$61$', '$72$', '$60$'], correct: 0 },
          ],
        },
        predictPrompt: 'الإطار لا يتّسع إلا لثماني خلايا، فكيف عرفتم عدد أعواد أربعين خلية؟ اكتب الحساب الذي أجريته.',
        summary: 'نحسب قيمة عبارة بتعويض الحرف بعدد ثم نحسب باحترام الأولويات: $5\\times 40+1=201$ .',
        body: <p><MathText>{GUIDE.far}</MathText></p>,
      },
      {
        id: 'kitabatan', type: 'regles', title: 'كتابتان والجدول نفسه',
        memo: {
          rule: `6+5(n-1)=5n+1`,
          hook: 'ستّة للأولى ثم خمسة لكلّ خلية بعدها',
          example: `n=4\\ :\\ 6+5\\times 3=${R('21')}=5\\times 4+1`,
          trap: 'جدول متساوٍ في أعمدة قليلة لا يثبت المساواة مهما كان $n$',
          exam: 'قارن الجدولين عمودًا عمودًا',
          chip: `6+5(n-1)`,
          quiz: [
            { q: 'كتابة رانيا $6+5(n-1)$ وكتابة ياسين $5n+1$ تعطيان من أجل $n=4$ :', options: ['$21$ في الحالتين', '$21$ و $20$', '$26$ و $21$'], correct: 0 },
            { q: 'كتابتان للعدد نفسه تعطيان:', options: ['الجدول نفسه في كلّ الأعمدة التي رسمناها', 'جدولين مختلفين', 'عمودًا واحدًا متساويًا'], correct: 0 },
          ],
        },
        predictPrompt: 'قارنتم كتابة ياسين بكتابة رانيا على الصفّ الذي بنيتموه. ماذا لاحظتم في الجدولين؟ اكتب ما رأيته.',
        summary: 'يمكن أن نكتب العدد نفسه بعبارتين مختلفتين: في كلّ الأعمدة التي رسمناها يعطيان القيمة نفسها.',
        body: <p><MathText>{GUIDE.same}</MathText></p>,
      },
      {
        id: 'harfan', type: 'regles', title: 'عبارة بحرفين',
        memo: {
          rule: `5n+1+8m+3`,
          hook: 'حرف للصفّ وحرف للشريط',
          example: `n=6,\\ m=4\\ :\\ 31+35=${R('66')}`,
          trap: 'لا تعوّض الحرفين بالعدد نفسه إلا إذا قيل ذلك',
          exam: 'عوّض كلّ حرف بقيمته ثم احسب',
          chip: `5n+1+8m+3`,
          quiz: [
            { q: 'قيمة $5n+1+8m+3$ من أجل $n=6$ و $m=4$ :', options: ['$66$', '$44$', '$31$'], correct: 0 },
            { q: 'في العبارة $5n+1+8m+3$ الحرف $m$ يمثّل:', options: ['عدد أعمدة الشريط', 'عدد خلايا الصفّ', 'عدد الأعواد'], correct: 0 },
          ],
        },
        predictPrompt: 'ركّبنا صفًّا من $n$ خلية وشريطًا من $m$ عمودًا. كيف كتبتم عدد الأعواد؟ وكم هو من أجل $n=6$ و $m=4$ ؟',
        summary: 'عبارة بحرفين نحسب قيمتها بتعويض كلّ حرف بقيمته: $5n+1+8m+3$ من أجل $n=6$ و $m=4$ تساوي $66$ .',
        body: <p><MathText>{GUIDE.two}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'ta3rif', type: 'regles', title: 'العبارة الحرفية',
        memo: {
          rule: `4\\times x=4x`,
          hook: 'حروف تمثّل أعدادًا',
          example: `${R('4x')}\\ :\\ x=5\\Rightarrow 20`,
          trap: 'الحرف ليس اسمًا لشيء: إنّه عدد',
          exam: 'اذكر ما يمثّله الحرف أوّلًا',
          chip: `4\\times x`,
          quiz: [
            { q: 'محيط مربّع ضلعه $x$ يُكتب:', options: ['$4x$', '$x^4$', '$x+4$'], correct: 0 },
            { q: 'العبارة الحرفية هي عبارة:', options: ['بعض أعدادها ممثّلة بحروف', 'كلّها كلمات', 'كلّها أعداد'], correct: 0 },
          ],
        },
        predictPrompt: 'محيط المربّع ضلعه $5$ هو $4\\times 5$ ، وضلعه $8$ هو $4\\times 8$ . كيف تكتب المحيط إذا لم نعرف الضلع؟ وما اسم الكتابة التي تحتوي حرفًا؟ اكتب ما تراه بكلماتك.',
        summary: KNOWLEDGE.definition.text,
        body: (<div className="space-y-2"><p>{M(KNOWLEDGE.definition.text)}</p><p className="text-sm text-slate-600">{M(KNOWLEDGE.definition.example)}</p></div>),
      },
      {
        id: 'ikhtisar-kitaba', type: 'regles', title: 'اختصار الكتابة',
        memo: {
          rule: `5\\times n=5n`,
          hook: 'نحذف × أمام حرف أو قوس',
          example: `3\\times(n+2)=${R('3(n+2)')}`,
          trap: 'لا تحذف $\\times$ بين عددين: $3\\times 4\\ne 34$',
          exam: 'اكتب الأقصر ثم تحقّق من القيمة',
          chip: `1\\times a=a`,
          quiz: [
            { q: '$1\\times a+0\\times b+1\\times b$ تُبسَّط إلى:', options: ['$a+b$', '$a+b+1$', '$ab$'], correct: 0 },
            { q: 'نكتب $7\\times(a+1)$ بأبسط شكل:', options: ['$7(a+1)$', '$7a+1$', '$7+a1$'], correct: 0 },
          ],
        },
        summary: KNOWLEDGE.conventions.text,
        body: (<div className="space-y-2"><p>{M(KNOWLEDGE.conventions.text)}</p><p className="text-sm text-slate-600">{M(KNOWLEDGE.conventions.example)}</p></div>),
      },
      {
        id: 'murabba-mukaab', type: 'regles', title: 'المربّع والمكعّب',
        memo: {
          rule: `a\\times a=a^2`,
          hook: 'عدد مرّات التكرار فوق الحرف',
          example: `10\\times 10\\times 10=10^3=${R('1000')}`,
          trap: 'لا تقرأ $a^2$ على أنّها $2a$',
          exam: 'اكتب القوّة ثم احسبها',
          chip: `a^2,\\ a^3`,
          quiz: [
            { q: '$a\\times a\\times 5$ تُكتب مبسّطة:', options: ['$5a^2$', '$5a$', '$a^5$'], correct: 0 },
            { q: 'قيمة $x^2$ من أجل $x=4$ :', options: ['$16$', '$8$', '$6$'], correct: 0 },
          ],
        },
        summary: KNOWLEDGE.powers.text,
        body: (<div className="space-y-2"><p>{M(KNOWLEDGE.powers.text)}</p><p className="text-sm text-slate-600">{M(KNOWLEDGE.powers.example)}</p></div>),
      },
    ],
    3: [
      {
        id: 'tarjama-harf', type: 'methodes', title: 'من الكلمات إلى الحرف',
        memo: {
          rule: `35+x`,
          hook: 'نسمّي المتغيّر ثم نكتب الحساب',
          example: `x+x+7=${R('2x+7')}`,
          trap: 'ربح $x$ كرية يعني جمعًا لا ضربًا',
          exam: 'اكتب أوّلًا ما يمثّله الحرف',
          chip: `x+x+7`,
          quiz: [
            { q: 'كان مع كريم $35$ كرية وربح $x$ كرية. عدد كرياته:', options: ['$35+x$', '$35x$', '$35-x$'], correct: 0 },
            { q: 'ستّ علب في كلّ منها $x$ قلمًا. عدد الأقلام:', options: ['$6x$', '$6+x$', '$x^6$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تكتب «ربح $x$ كرية» و «ستّ علب في كلّ منها $x$ قلمًا» بالحرف؟ ما العملية في كلّ حالة؟ اكتب ذلك.',
        summary: METHOD.rule,
        body: (<div className="space-y-2"><p>{M(METHOD.solution[0])}</p></div>),
      },
      {
        id: 'taamim-hadd', type: 'methodes', title: 'تعميم نمط بطريقتين',
        memo: {
          rule: `4n+4=4(n+1)`,
          hook: 'كلّ عدّ يعطي عبارة',
          example: `n=5\\ :\\ 4\\times 5+4=${R('24')}=4\\times 6`,
          trap: 'ننظر إلى الرسم قبل أن نكتب القاعدة',
          exam: 'اعدّ بطريقتين وتحقّق من التساوي على قيمة',
          chip: `4n+4`,
          quiz: [
            { q: 'حوض من $n\\times n$ بلاطة وإطار حوله: عدد بلاطات الإطار:', options: ['$4n+4$', '$4n$', '$n+4$'], correct: 0 },
            { q: '$4n+4$ و $4(n+1)$ من أجل $n=5$ :', options: ['$24$ و $24$', '$24$ و $20$', '$20$ و $24$'], correct: 0 },
          ],
        },
        predictPrompt: 'عدّ بلاطات إطار حوض ضلعه خمس بلاطات: كيف عددتها؟ وهل توجد طريقة ثانية؟ اكتب الطريقتين.',
        summary: GUIDE.border,
        body: <p>{M(GUIDE.border)}</p>,
      },
      {
        id: 'barnamij', type: 'methodes', title: 'برنامج حساب بعبارة',
        memo: {
          rule: `3\\times x+5=3x+5`,
          hook: 'كلّ تعليمة عملية على الحرف',
          example: `x=4\\ :\\ 3\\times 4+5=${R('17')}`,
          trap: 'القوس يلزم إذا أخذنا نصف المجموع كلّه',
          exam: 'اكتب العبارة ثم جرّبها على عددين',
          chip: `3x+5`,
          quiz: [
            { q: '«اختر عددًا، اضربه في $3$ ، ثم أضف $5$»: العبارة:', options: ['$3x+5$', '$3(x+5)$', '$x+15$'], correct: 0 },
            { q: 'نتيجة البرنامج بالعدد $4$ :', options: ['$17$', '$27$', '$12$'], correct: 0 },
          ],
        },
        predictPrompt: 'برنامج الحساب «اضرب في 3 ثم أضف 5»: كيف تكتبه بعبارة؟ وكم يعطي إذا اخترت 4؟ اكتب ذلك.',
        summary: 'برنامج الحساب يُكتب عبارة حرفية بترتيب تعليماته، ونحسب قيمته بتعويض الحرف بالعدد المختار.',
        body: <p>{M(METHOD.solution[2])}</p>,
      },
      {
        id: 'tajmi', type: 'methodes', title: 'تجميع الحدود المتشابهة',
        memo: {
          rule: `ka+ma=(k+m)a`,
          hook: 'الحرف نفسه: نجمع المعاملين',
          example: `2a+5a-3a=(2+5-3)a=${R('4a')}`,
          trap: 'لا نجمع الأسس: $3a+4a=7a$ لا $7a^2$',
          exam: 'اكتب المعاملات ثم النتيجة',
          chip: `ka+ma`,
          quiz: [
            { q: '$3a+4a$ تساوي:', options: ['$7a$', '$7a^2$', '$12a$'], correct: 0 },
            { q: '$2a+5a-3a$ تساوي:', options: ['$4a$', '$10a$', '$0$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تجمع $2a+5a-3a$ ؟ أيّ خاصية تستعمل؟ اكتب طريقتك.',
        summary: KNOWLEDGE.like.text,
        body: (<div className="space-y-2"><p>{M(KNOWLEDGE.like.text)}</p><p className="text-sm text-slate-600">{M(KNOWLEDGE.like.example)}</p></div>),
      },
    ],
  },
};
