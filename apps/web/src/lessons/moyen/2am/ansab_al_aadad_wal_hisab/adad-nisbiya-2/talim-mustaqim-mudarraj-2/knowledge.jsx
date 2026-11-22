import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « التعليم على مستقيم مدرّج » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js :
 * معارف p. 42 réécrit, طريقة de la plateforme). Les termes (abscisse, distance à zéro, opposés) sont NOMMÉS en معارف, après le labo.
 */
const { abscissa, distance, opposites, origin } = KNOWLEDGE;

/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'faasila', type: 'regles', title: 'قراءة فاصلة نقطة',
        memo: {
          rule: `${R('n')}\\times v`,
          hook: 'عدد التدريجات × قيمة التدريجة',
          example: `3\\times 10=${R('30')}`,
          trap: 'لا تكتب عدد التدريجات وحده',
          exam: 'اضرب عدد التدريجات في قيمة التدريجة الواحدة',
          chip: `${R('n')}\\times v`,
          quiz: [
            { q: 'نقطة على بعد $4$ تدريجات يمين المبدأ والتدريجة $5$ : فاصلتها', options: ['$20$', '$4$', '$-20$'], correct: 0 },
            { q: 'نقطة على بعد $2$ تدريجتين يسار المبدأ والتدريجة $10$ : فاصلتها', options: ['$-20$', '$-2$', '$20$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المسطرة، عدّدتَ التدريجات بين الصفر والمعلم ثم ضربتَها في قيمة التدريجة. اكتب القاعدة بكلماتك.',
        summary: 'فاصلة نقطة = عدد التدريجات × قيمة التدريجة، وإشارتها حسب الجهة : 3 × 10 = 30 .',
        body: <p><MathText>{abscissa.text}</MathText></p>,
      },
      {
        id: 'faasila-tataghayyar', type: 'regles', title: 'الفاصلة تتعلّق بالمبدأ',
        memo: {
          rule: `x-${R('o')}`,
          hook: 'انتقل الصفر فتغيّرت الأعداد',
          example: `30\\to ${R('50')}`,
          trap: 'المعلم لم يتحرّك والفاصلة تغيّرت',
          exam: 'اطرح موضع المبدأ الجديد من موضع النقطة',
          chip: `x-${R('o')}`,
          quiz: [
            { q: 'مبدؤنا انتقل $20$ يسارًا فصارت فاصلة نقطة كانت $30$ :', options: ['$50$', '$10$', '$30$'], correct: 0 },
            { q: 'هل تتغيّر فاصلة نقطة إذا نقلنا المبدأ؟', options: ['نعم', 'لا', 'أحيانًا فقط عند الصفر'], correct: 0 },
          ],
        },
        predictPrompt: 'نقلتَ دبّوس الصفر فتغيّرت فاصلة كشك المثلّجات مع أنّه لم يتحرّك. لماذا؟',
        summary: 'فاصلة نقطة تُقاس من المبدأ : إذا انتقل المبدأ تغيّرت فاصلات النقط كلّها.',
        body: <p><MathText>{origin.text}</MathText></p>,
      },
      {
        id: 'mutaakisan', type: 'regles', title: 'فاصلتان متعاكستان',
        memo: {
          rule: `${R('-a')}\\ ,\\ ${R('+a')}`,
          hook: 'المسافة نفسها وجهتان متقابلتان',
          example: `${R('-30')}\\ ,\\ ${R('+30')}`,
          trap: 'ليست كل فاصلتين متساويتين المسافة متعاكستين من أيّ مبدأ',
          exam: 'ضع المبدأ في منتصف المسافة بين النقطتين',
          chip: `${R('-a')}\\ ,\\ ${R('+a')}`,
          quiz: [
            { q: 'عددان متعاكسان :', options: ['$-6$ و $6$', '$-6$ و $-6$', '$6$ و $0{,}6$'], correct: 0 },
            { q: 'المبدأ في منتصف النقطتين $-40$ و $20$ يعطيهما', options: ['فاصلتين متعاكستين', 'فاصلتين متساويتين', 'فاصلتين موجبتين'], correct: 0 },
          ],
        },
        predictPrompt: 'وضعتَ دبّوس الصفر بحيث صار لعمود الإنارة وللنخلة المسافة نفسها إلى الصفر من جهتين. ماذا لاحظتَ على إشارتي فاصلتيهما؟',
        summary: 'لا يكون لنقطتين فاصلتان متعاكستان إلا إذا كان المبدأ في منتصف المسافة بينهما.',
        body: <p><MathText>{opposites.text}</MathText></p>,
      },
      {
        id: 'ikhtiyar-tadrij', type: 'methodes', title: 'اختيار قيمة التدريجة',
        memo: {
          rule: `\\frac{${R('max')}}{v}\\le 6`,
          hook: 'أبعد نقطة داخل اللوحة وكلّ النقط على تدريجات',
          example: `150\\div ${R('25')}=6`,
          trap: 'أصغر تدريجة ليست دائمًا الأنسب',
          exam: 'اقسم كل فاصلة على التدريجة وتحقّق من العدد الصحيح',
          chip: `\\frac{${R('max')}}{v}\\le 6`,
          quiz: [
            { q: 'نقاط فواصلها $-50$ ، $75$ ، $150$ والمستقيم فيه $6$ تدريجات في كل جهة. التدريجة المناسبة :', options: ['$25$', '$20$', '$50$'], correct: 0 },
            { q: 'تدريجة صغيرة جدًا تجعل النقاط البعيدة', options: ['خارج اللوحة', 'قريبة من المبدأ', 'على تدريجات دائمًا'], correct: 0 },
          ],
        },
        predictPrompt: 'جرّبتَ تدريجات مختلفة. متى خرجت نقطة من اللوحة؟ ومتى وقعت بين تدريجتين؟ اكتب كيف تختار التدريجة.',
        summary: 'نختار تدريجة تُبقي أبعد نقطة داخل اللوحة وتجعل كلّ النقط على تدريجات.',
        body: <p><MathText>{GUIDE.tooSmall}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'tarif-faasila', type: 'vocabulaire', title: 'الفاصلة والكتابة A(−3)',
        memo: {
          rule: `A(${R('-3')})`,
          hook: 'نكتب اسم النقطة ثم فاصلتها بين قوسين',
          example: `A(${R('-3')})`,
          trap: 'الفاصلة تُكتب بإشارتها',
          exam: 'اكتب $A(x)$ حيث $x$ فاصلة النقطة',
          chip: `A(${R('x')})`,
          quiz: [
            { q: 'كتابة النقطة $B$ التي فاصلتها $5$ :', options: ['$B(5)$', '$5(B)$', '$B=5$'], correct: 0 },
            { q: 'النقطة $C(-2)$ تقع', options: ['يسار المبدأ', 'يمين المبدأ', 'على المبدأ'], correct: 0 },
          ],
        },
        predictPrompt: 'قرأتَ فواصل ثلاث نقط. كيف نكتب اسم نقطة مع فاصلتها؟',
        summary: 'نكتب A(−3) لنقول إنّ فاصلة النقطة A هي −3 .',
        body: (
          <div className="space-y-2">
            <p><MathText>{abscissa.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{abscissa.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'masafa-ila-sifr', type: 'vocabulaire', title: 'المسافة إلى الصفر',
        memo: {
          rule: `|{-a}|=${R('a')}`,
          hook: 'نحذف الإشارة',
          example: `|{-7}|=${R('7')}`,
          trap: 'المسافة لا تكون سالبة',
          exam: 'المسافة إلى الصفر عدد موجب أو معدوم',
          chip: `|{-a}|=${R('a')}`,
          quiz: [
            { q: 'المسافة إلى الصفر للعدد $-12{,}5$ :', options: ['$12{,}5$', '$-12{,}5$', '$0$'], correct: 0 },
            { q: 'عددان لهما المسافة $4$ إلى الصفر :', options: ['$4$ و $-4$', '$4$ و $0{,}4$', '$-4$ و $-4{,}4$'], correct: 0 },
          ],
        },
        predictPrompt: 'قرأتَ فاصلة سالبة، لكنّ المسافة بين المعلم والمبدأ كانت موجبة. ماذا نسمّي هذه المسافة؟',
        summary: 'المسافة إلى الصفر هي بعد النقطة عن المبدأ، وهي لا تكون سالبة : المسافة إلى الصفر للعدد −7 هي 7 .',
        body: <p><MathText>{distance.text}</MathText></p>,
      },
      {
        id: 'mafhum-mutaakisan', type: 'vocabulaire', title: 'العددان المتعاكسان',
        memo: {
          rule: `${R('+a')}\\ ,\\ ${R('-a')}`,
          hook: 'المسافة نفسها وإشارتان مختلفتان',
          example: `${R('+3')}\\ ,\\ ${R('-3')}`,
          trap: 'معاكس العدد ليس مقلوبه',
          exam: 'معاكس $x$ هو $-x$ ، ومعاكس $0$ هو $0$',
          chip: `${R('+a')}\\ ,\\ ${R('-a')}`,
          quiz: [
            { q: 'معاكس $-2{,}5$ :', options: ['$2{,}5$', '$0{,}4$', '$-0{,}4$'], correct: 0 },
            { q: 'معاكس $0$ :', options: ['$0$', '$1$', '$-1$'], correct: 0 },
          ],
        },
        predictPrompt: 'وجدتَ فاصلتين لهما المسافة نفسها إلى الصفر وإشارتان مختلفتان. ماذا نسمّيهما؟',
        summary: 'العددان المتعاكسان لهما المسافة نفسها إلى الصفر وإشارتان مختلفتان : (+3) و (−3) .',
        body: <p><MathText>{opposites.text}</MathText></p>,
      },
    ],
    3: [
      {
        id: 'tariqa-tadrij', type: 'methodes', title: 'أختار تدريجة وأقرأ بدقّة',
        memo: {
          rule: `\\frac{x}{${R('v')}}\\in\\mathbb{Z}`,
          hook: 'أبعد عدد أولًا ثم نتحقّق من كل نقطة',
          example: `\\frac{45}{${R('15')}}=3`,
          trap: 'قسمة أبعد نقطة وحدها لا تكفي',
          exam: 'قسّم كل فاصلة على قيمة التدريجة المقترحة',
          chip: `\\frac{x}{${R('v')}}`,
          quiz: [
            { q: 'للنقاط $-30$ ، $45$ ، $60$ ، $-15$ وستّ تدريجات في كل جهة، التدريجة :', options: ['$15$', '$10$', '$5$'], correct: 0 },
            { q: 'فاصلة النقطة على بعد $3$ تدريجات يسار المبدأ والتدريجة $0{,}25$ :', options: ['$-0{,}75$', '$-3$', '$0{,}75$'], correct: 0 },
          ],
        },
        predictPrompt: 'اخترتَ تدريجة لأربع نقط. اكتب الخطوات التي اتّبعتَها.',
        summary: 'نبحث عن أبعد عدد عن الصفر، ثم نختار تدريجة تُبقيه داخل المستقيم وتجعل كلّ الأعداد على تدريجات.',
        body: <ul className="list-disc ps-5 space-y-1 text-sm">{METHOD.choose.rule.slice(1).map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ul>,
      },
    ],
  },
};
