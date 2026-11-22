import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** Ce qui CHANGE dans une règle de la fiche `memo` (rouge). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

/**
 * Les connaissances du درس « النسبة المئوية » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 2 p. 90 et طرائق p. 91,
 * réécrits). Le pourcentage de la 2AM (leçon `nisba-miawiya`) est un prérequis (`priorKnowledge`), mesuré par « أستعدّ », jamais un item ici : la leçon
 * le TRAITE comme une situation de proportionnalité.
 */
const { definition, property, table, example, change, base } = KNOWLEDGE;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'khana-qima', type: 'regles', title: 'قيمة الخانة الواحدة',
        memo: {
          rule: `1\\%\\cdot x=${R('\\dfrac{x}{100}')}`,
          hook: 'المئة خانة: الواحدة جزء من مئة',
          example: `\\dfrac{240}{100}=${R('2{,}4')}`,
          trap: 'نقسم على مئة ولا نطرح مئة',
          exam: 'اكتب قيمة الخانة أوّلًا ثم اضربها في عدد الخانات',
          chip: `${R('\\tfrac{x}{100}')}`,
          quiz: [
            { q: 'مخزون $240$ كيسًا قُسِّم إلى مئة خانة متساوية، قيمة الخانة الواحدة:', options: ['$2{,}4$', '$24$', '$140$'], correct: 0 },
            { q: 'قيمة الخانة الواحدة لمخزون $x$ هي:', options: ['$\\frac{x}{100}$', '$100x$', '$x-100$'], correct: 0 },
          ],
        },
        predictPrompt: 'في الصينية قُسِّم المخزون إلى مئة خانة متساوية. ماذا تساوي الخانة الواحدة من المخزون؟ اكتب كيف تحسبها.',
        summary: 'الخانة الواحدة تساوي المخزون مقسومًا على 100.',
        body: <p><MathText>{GUIDE.oneCell}</MathText></p>,
      },
      {
        id: 'hissa-t', type: 'regles', title: 'نسبة مئوية من عدد',
        memo: {
          rule: `t\\%\\cdot x=x\\times${R('\\dfrac{t}{100}')}`,
          hook: 'عدد الخانات × قيمة الخانة',
          example: `240\\times${R('\\dfrac{15}{100}')}=36`,
          trap: 'النسبة المئوية لا تُطرح من العدد ولا تُجمع إليه',
          exam: 'اكتب الضرب في الكسر المئوي ثم احسب',
          chip: `x\\times${R('\\tfrac{t}{100}')}`,
          quiz: [
            { q: '$15\\%$ من $240$ تساوي:', options: ['$36$', '$225$', '$255$'], correct: 0 },
            { q: '$20\\%$ من $50$ تساوي:', options: ['$10$', '$30$', '$70$'], correct: 0 },
          ],
        },
        predictPrompt: 'رسمتَ $t$ خانة من مخزون $x$ فحملت السلّة جزءًا منه. كيف تحسب ما تحمله السلّة من $t$ و $x$ ؟ اكتب القاعدة بكلماتك.',
        summary: 't % من عدد x هي x × t/100: t خانة من المئة، كلّ خانة x/100.',
        body: <p><MathText>{property.text}</MathText></p>,
      },
      {
        id: 'ziyada-nuqsan', type: 'regles', title: 'الزيادة والتخفيض بنسبة مئوية',
        memo: {
          rule: `x\\left(1\\pm${R('\\dfrac{t}{100}')}\\right)`,
          hook: 'زيادة: واحد زائد · تخفيض: واحد ناقص',
          example: `200\\times(1+${R('0{,}15')})=230`,
          trap: 'لا نضيف النسبة إلى العدد بل نضرب في معامل',
          exam: 'اكتب المعامل ثم اضرب فيه العدد الأصلي',
          chip: `\\times\\left(1\\pm${R('\\tfrac{t}{100}')}\\right)`,
          quiz: [
            { q: 'زاد ثمن $400$ دج بـ $15\\%$ فصار:', options: ['$460$', '$415$', '$340$'], correct: 0 },
            { q: 'للتخفيض بـ $20\\%$ نضرب في:', options: ['$0{,}8$', '$0{,}2$', '$1{,}2$'], correct: 0 },
          ],
        },
        predictPrompt: 'زاد المخزون بـ $15\\%$ فأضفتَ خانات إلى المئة. كم خانة صار المخزون؟ وبأيّ عدد ضربتَ المخزون الأول لتجد الجديد؟ وماذا لو نقص بـ $15\\%$ ؟',
        summary: 'الزيادة بـ t % هي الضرب في 1 + t/100 ، والتخفيض بـ t % هو الضرب في 1 − t/100.',
        body: (
          <div className="space-y-2">
            <p><MathText>{change.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.moved}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'nisba-taarif', type: 'vocabulaire', title: 'النسبة المئوية', predict: false,
        memo: {
          rule: `t\\%=${R('\\dfrac{t}{100}')}`,
          hook: 'جزء من مئة جزء متساوٍ',
          example: `35\\%=${R('\\dfrac{35}{100}')}`,
          trap: 'النسبة المئوية كسر مقامه مئة وليست عددًا يُطرح',
          exam: 'اكتب النسبة المئوية كسرًا مقامه مئة',
          chip: `${R('\\tfrac{t}{100}')}`,
          quiz: [
            { q: '$35\\%$ تساوي الكسر:', options: ['$\\frac{35}{100}$', '$\\frac{100}{35}$', '$\\frac{35}{10}$'], correct: 0 },
            { q: 'الكسر $\\frac{7}{10}$ يساوي:', options: ['$70\\%$', '$7\\%$', '$0{,}7\\%$'], correct: 0 },
          ],
        },
        summary: 'النسبة المئوية t % هي الكسر t/100 : t جزءًا من مئة جزء متساوٍ.',
        body: <p><MathText>{definition.text}</MathText></p>,
      },
      {
        id: 'nisba-jadwal', type: 'methodes', title: 'جدول التناسبية 100 ↔ الكلّ',
        memo: {
          rule: `\\dfrac{a}{b}=${R('\\dfrac{t}{100}')}`,
          hook: 'الجزء على الكلّ كالنسبة على مئة',
          example: `\\dfrac{60}{150}=${R('\\dfrac{40}{100}')}`,
          trap: 'لا نطرح الجزء من الكلّ ولا نضربهما',
          exam: 'ارسم جدول التناسبية ثم اكتب المساواة',
          chip: `\\tfrac{a}{b}=${R('\\tfrac{t}{100}')}`,
          quiz: [
            { q: '$12$ تلميذًا من $30$ تساوي نسبة:', options: ['$40\\%$', '$12\\%$', '$18\\%$'], correct: 0 },
            { q: 'العلاقة بين الجزء $a$ والكلّ $b$ والنسبة $t$ هي:', options: ['$\\frac{a}{b}=\\frac{t}{100}$', '$a\\times b=t$', '$b-a=t$'], correct: 0 },
          ],
        },
        predictPrompt: 'في الصينية رسمتَ خانات حتى حملت السلّة عددًا معلومًا. كيف تجد النسبة المئوية من الجزء $a$ والكلّ $b$ ؟ اكتب المساواة التي استعملتها.',
        summary: 'الكلّ b يقابله 100 والجزء a يقابله t : a/b = t/100.',
        body: (
          <div className="space-y-2">
            <p><MathText>{table.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{example.text}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqat-hisab', type: 'methodes', title: 'ثلاث حالات للنسبة المئوية',
        memo: {
          rule: `a=b\\times${R('\\dfrac{t}{100}')}`,
          hook: 'جدول واحد ومجهول واحد',
          example: `b=\\dfrac{45\\times100}{30}=${R('150')}`,
          trap: 'نحدّد المجهول أوّلًا: جزء أو نسبة أو كلّ',
          exam: 'اكتب الجدول وسمِّ المجهول ثم احسب',
          chip: `a=b\\times${R('\\tfrac{t}{100}')}`,
          quiz: [
            { q: 'في مخزن $160$ كيسًا، $35\\%$ منها تساوي:', options: ['$56$', '$125$', '$195$'], correct: 0 },
            { q: '$45$ كيسًا هي $30\\%$ من المخزون، فالمخزون كلّه:', options: ['$150$', '$13{,}5$', '$75$'], correct: 0 },
          ],
        },
        predictPrompt: 'في جدول التناسبية (الكلّ ↔ 100 ، الجزء ↔ $t$ ) قد يكون المجهول الجزء أو النسبة أو الكلّ. كيف تحسب كلّ حالة؟ اكتب الحالات الثلاث.',
        summary: METHOD.cases.rule,
        body: <p><MathText>{METHOD.cases.rule}</MathText></p>,
      },
      {
        id: 'tatabu', type: 'regles', title: 'تغيّران متتاليان',
        memo: {
          rule: `x(1+r)(1-r)=${R('x(1-r^2)')}\\neq x`,
          hook: 'المعامل الثاني يُحسب من العدد الجديد',
          example: `1500\\times1{,}2\\times0{,}8=${R('1440')}`,
          trap: 'زيادة ثم تخفيض بالنسبة نفسها لا يعيدان إلى الأصل',
          exam: 'اضرب المعاملين ثم قارن الناتج بالأصل',
          chip: `\\times(1+r)\\times(1-r)`,
          quiz: [
            { q: 'زاد ثمن $1500$ دج بـ $20\\%$ ثم نقص بـ $20\\%$ فصار:', options: ['$1440$', '$1500$', '$1560$'], correct: 0 },
            { q: 'الزيادة بـ $20\\%$ ثم التخفيض بـ $20\\%$ تساوي الضرب في:', options: ['$1{,}2\\times0{,}8$', '$1{,}2\\times0{,}2$', '$1{,}2+0{,}8$'], correct: 0 },
          ],
        },
        predictPrompt: 'زاد ثمن بـ $20\\%$ ثم نقص بـ $20\\%$ . هل عاد إلى ثمنه الأول؟ ولماذا؟ اكتب ما تفعله بالمعاملين.',
        summary: METHOD.change.rule,
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD.change.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{base.text}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
