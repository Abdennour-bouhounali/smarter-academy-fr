import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « جمع وطرح عددين نسبيين » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف p. 44 réécrit, طرائق p. 45 réécrites).
 * Les règles sont NOMMÉES après le labo, jamais avant : chaque brique suit une question sur ce que l'élève vient de faire avec les sacs et les flammes.
 */
const { same, different, opposites, subtract, names } = KNOWLEDGE;

/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'jam-nafs-ishara', type: 'regles', title: 'جمع عددين من الإشارة نفسها',
        memo: {
          rule: `(-a)+(-b)=${R('-(a+b)')}`,
          hook: 'نجمع المسافتين ونحتفظ بالإشارة',
          example: `(-3{,}2)+(-5)=${R('(-8{,}2)')}`,
          trap: 'مجموع سالبين ليس موجبًا',
          exam: 'اجمع المسافتين إلى الصفر واكتب الإشارة المشتركة',
          chip: `(-a)+(-b)`,
          quiz: [
            { q: '$(-4)+(-7)$ يساوي', options: ['$-11$', '$11$', '$-3$'], correct: 0 },
            { q: '$(+2{,}5)+(+4)$ يساوي', options: ['$6{,}5$', '$1{,}5$', '$-6{,}5$'], correct: 0 },
          ],
        },
        predictPrompt: 'ربطتَ أكياسًا إلى أكياس ولم تنقفل نفخة وكيس. كيف حصلتَ على الارتفاع؟ اكتب القاعدة بكلماتك.',
        summary: 'إذا كان للعددين الإشارة نفسها جمعنا مسافتيهما إلى الصفر واحتفظنا بالإشارة المشتركة : (−3,2) + (−5) = (−8,2) .',
        body: <div className="space-y-2"><p><MathText>{same.text}</MathText></p><p className="text-sm text-slate-600"><MathText>{same.example}</MathText></p></div>,
      },
      {
        id: 'jam-ishara-mukhtalifa', type: 'regles', title: 'جمع عددين من إشارتين مختلفتين',
        memo: {
          rule: `(-a)+(+b)=${R('\\pm(a-b)')}`,
          hook: 'نطرح الصغرى من الكبرى والإشارة للأبعد',
          example: `(-9)+(+5)=${R('(-4)')}`,
          trap: 'ليست الإشارة إشارة العدد المضاف',
          exam: 'اطرح المسافة الصغرى من الكبرى وخذ إشارة الأبعد عن الصفر',
          chip: `(-a)+(+b)`,
          quiz: [
            { q: '$(-9)+(+5)$ يساوي', options: ['$-4$', '$4$', '$-14$'], correct: 0 },
            { q: '$(+7)+(-10)$ يساوي', options: ['$-3$', '$3$', '$17$'], correct: 0 },
          ],
        },
        predictPrompt: 'ربطتَ نفخات إلى أكياس فانقفلت أزواج. ما الذي بقي في السلّة، ومن حدّد إشارة الناتج؟',
        summary: 'إذا اختلفت الإشارتان طرحنا المسافة الصغرى من الكبرى وأخذنا إشارة العدد الأبعد عن الصفر : (−9) + (+5) = (−4) .',
        body: <div className="space-y-2"><p><MathText>{different.text}</MathText></p><p className="text-sm text-slate-600"><MathText>{different.example}</MathText></p></div>,
      },
      {
        id: 'mutaakisan-sifr', type: 'regles', title: 'مجموع متعاكسين',
        memo: {
          rule: `(-a)+(+a)=${R('0')}`,
          hook: 'كلّ نفخة قابلها كيس',
          example: `(-6)+(+6)=${R('0')}`,
          trap: 'ليس ضعف العدد',
          exam: 'مجموع عددين متعاكسين معدوم',
          chip: `(-a)+(+a)`,
          quiz: [
            { q: '$(-6)+(+6)$ يساوي', options: ['$0$', '$12$', '$-12$'], correct: 0 },
            { q: '$(+2{,}5)+(-2{,}5)$ يساوي', options: ['$0$', '$5$', '$-5$'], correct: 0 },
          ],
        },
        predictPrompt: 'ربطتَ ست نفخات إلى ستة أكياس فعاد المنطاد إلى الصفر. ماذا نقول عن مجموع عددين متعاكسين؟',
        summary: 'مجموع عددين متعاكسين معدوم : (−6) + (+6) = 0 .',
        body: <p><MathText>{opposites.text}</MathText></p>,
      },
      {
        id: 'tarh-bi-muakis', type: 'regles', title: 'الطرح هو جمع المعاكس',
        memo: {
          rule: `a-b=a+${R('(-b)')}`,
          hook: 'رمي كيس يعطي ما يعطيه ربط نفخة',
          example: `(+5)-(-7)=(+5)+${R('(+7)')}=(+12)`,
          trap: 'لا تغيّر إشارة العدد الأول',
          exam: 'اكتب الطرح جمعًا للمعاكس ثم طبّق قاعدة الجمع',
          chip: `a-b=a+(-b)`,
          quiz: [
            { q: '$(+6)-(-4)$ يساوي', options: ['$10$', '$2$', '$-10$'], correct: 0 },
            { q: '$(-7)-(-3)$ يساوي', options: ['$-4$', '$-10$', '$4$'], correct: 0 },
          ],
        },
        predictPrompt: 'رميتَ أكياسًا من السلّة فارتفع المنطاد. ربط ماذا يعطي الحركة نفسها؟ وماذا فعلتَ حين لم يكن في السلّة ما تريد رميه؟',
        summary: 'لطرح عدد نضيف معاكسه : (+5) − (−7) = (+5) + (+7) = (+12) .',
        body: <div className="space-y-2"><p><MathText>{subtract.text}</MathText></p><p className="text-sm text-slate-600"><MathText>{GUIDE.subNoFlip.right}</MathText></p></div>,
      },
    ],
    2: [
      {
        id: 'qaidat-jam', type: 'regles', title: 'قاعدتا الجمع',
        memo: {
          rule: `a+b`,
          hook: 'الإشارتان متّفقتان نجمع، مختلفتان نطرح',
          example: `(+7)+(-10)=${R('(-3)')}`,
          trap: 'لا نجمع المسافتين دائمًا',
          exam: 'ميّز الحالتين ثم اكتب إشارة الأبعد عن الصفر',
          chip: `a+b`,
          quiz: [
            { q: 'لجمع عددين من إشارتين مختلفتين :', options: ['نطرح الصغرى من الكبرى', 'نجمع المسافتين دائمًا', 'نأخذ إشارة العدد الأول'], correct: 0 },
            { q: '$(-2{,}5)+(-4)$ يساوي', options: ['$-6{,}5$', '$-1{,}5$', '$6{,}5$'], correct: 0 },
          ],
        },
        predictPrompt: 'قارن حالتي الجمع اللتين جرّبتهما: متى جمعتَ المسافتين ومتى طرحتَ إحداهما من الأخرى؟',
        summary: 'نميّز حالتين : الإشارتان متّفقتان فنجمع المسافتين، ومختلفتان فنطرح الصغرى من الكبرى ونأخذ إشارة الأبعد.',
        body: <div className="space-y-2"><p><MathText>{same.text}</MathText></p><p><MathText>{different.text}</MathText></p></div>,
      },
      {
        id: 'qaidat-tarh', type: 'regles', title: 'قاعدة الطرح',
        memo: {
          rule: `a-b=a+${R('(-b)')}`,
          hook: 'نضيف المعاكس',
          example: `(-6)-(+9)=(-6)+${R('(-9)')}=(-15)`,
          trap: 'العدد الأول يبقى كما هو',
          exam: 'غيّر إشارة العدد المطروح فقط ثم اجمع',
          chip: `a-b`,
          quiz: [
            { q: '$(-6)-(+9)$ يساوي', options: ['$-15$', '$3$', '$15$'], correct: 0 },
            { q: 'لطرح عدد نسبي :', options: ['نضيف معاكسه', 'نغيّر إشارة العدد الأول', 'نطرح المسافتين دائمًا'], correct: 0 },
          ],
        },
        predictPrompt: 'طرحتَ عددًا بالمنطاد دون أن تغيّر العدد الأول. ماذا فعلتَ بالعدد الثاني؟',
        summary: 'لطرح عدد نسبي نضيف معاكسه : (−6) − (+9) = (−6) + (−9) = (−15) .',
        body: <div className="space-y-2"><p><MathText>{subtract.text}</MathText></p><p className="text-sm text-slate-600"><MathText>{subtract.example}</MathText></p></div>,
      },
      {
        id: 'majmu-wa-farq', type: 'vocabulaire', title: 'المجموع والفرق',
        memo: {
          rule: `a+b=${R('S')}\\ ,\\ a-b=${R('D')}`,
          hook: 'ناتج الجمع مجموع وناتج الطرح فرق',
          example: `(+7)+(-10)\\ ,\\ (+5)-(-7)`,
          trap: 'نحافظ على الأقواس والإشارات',
          exam: 'اكتب كلّ عدد بين قوسين مع إشارته',
          chip: `a+b\\ ,\\ a-b`,
          quiz: [
            { q: 'ناتج الجمع يسمّى', options: ['المجموع', 'الفرق', 'المعاكس'], correct: 0 },
            { q: 'ناتج الطرح يسمّى', options: ['الفرق', 'المجموع', 'المسافة'], correct: 0 },
          ],
        },
        predictPrompt: 'نفّذتَ بطاقات جمع وبطاقات طرح. ماذا نسمّي ناتج كلّ منهما؟',
        summary: 'ناتج الجمع يسمّى المجموع وناتج الطرح يسمّى الفرق.',
        body: <p><MathText>{names.text}</MathText></p>,
      },
    ],
    3: [
      {
        id: 'tariqat-jam', type: 'methodes', title: 'أكتب حساب مجموع',
        memo: {
          rule: `A=-(${R('a+b')})`,
          hook: 'أميّز الحالتين ثم أحسب',
          example: `(-5)+(-8)=-(5+8)=${R('(-13)')}`,
          trap: 'لا أنسى إشارة الأبعد عن الصفر',
          exam: 'اكتب خطوات الحساب مع المسافتين والإشارة',
          chip: `A=-(a+b)`,
          quiz: [
            { q: '$(-5)+(+8)$ يساوي', options: ['$+3$', '$-3$', '$-13$'], correct: 0 },
            { q: 'الخطوة الأولى لحساب مجموع :', options: ['أنظر إلى الإشارتين', 'أغيّر الإشارة', 'أضرب المسافتين'], correct: 0 },
          ],
        },
        predictPrompt: 'حسبتَ مجموعين: ما الذي نظرتَ إليه أولًا لتختار طريقة الحساب؟',
        summary: 'لحساب مجموع نميّز حالتين : الإشارتان متّفقتان فنجمع المسافتين، مختلفتان فنطرح الصغرى من الكبرى ونأخذ إشارة الأبعد.',
        body: <ul className="list-disc ps-5 space-y-1 text-sm">{METHOD.sum.rule.slice(1).map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ul>,
      },
      {
        id: 'tariqat-tarh', type: 'methodes', title: 'أكتب حساب فرق',
        memo: {
          rule: `C=a+${R('(-b)')}`,
          hook: 'أحوّل الطرح إلى جمع ثم أطبّق القاعدة',
          example: `(+6{,}3)-(-2{,}4)=(+6{,}3)+${R('(+2{,}4)')}=(+8{,}7)`,
          trap: 'أحوّل أولًا ثم أحسب',
          exam: 'اكتب الطرح جمعًا للمعاكس في سطر مستقلّ',
          chip: `C=a+(-b)`,
          quiz: [
            { q: '$(+2)-(+9)$ يساوي', options: ['$-7$', '$7$', '$11$'], correct: 0 },
            { q: '$(-4)-(+6)$ يساوي', options: ['$-10$', '$2$', '$10$'], correct: 0 },
          ],
        },
        predictPrompt: 'حسبتَ فرقًا بالأعداد العشرية. اكتب الخطوات بالترتيب.',
        summary: 'لحساب فرق نكتب الطرح جمعًا للمعاكس ثم نطبّق قاعدة الجمع.',
        body: <ul className="list-disc ps-5 space-y-1 text-sm">{METHOD.diff.rule.slice(1).map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ul>,
      },
    ],
  },
};
