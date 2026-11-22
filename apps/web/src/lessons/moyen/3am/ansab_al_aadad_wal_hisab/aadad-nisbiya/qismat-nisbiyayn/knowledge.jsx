import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « حاصل قسمة عددين نسبيين » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف et
 * طرائق réécrits). Le produit de deux relatifs et de plusieurs (les deux leçons précédentes), les priorités (2AM) et la somme algébrique ne sont PAS des items
 * ici : ce sont des prérequis (`priorKnowledge`), mesurés par « أستعدّ ».
 */
const { definition, signs, fraction, zero, priorities } = KNOWLEDGE;
const P = (s) => <p><MathText>{s}</MathText></p>;

/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'qisma-aamil', type: 'vocabulaire', title: 'حاصل القسمة عاملٌ مجهول', predict: false,
        memo: {
          rule: `a\\div b=q\\iff b\\times ${R('q')}=a`,
          hook: 'القسمة: العامل المجهول',
          example: `48\\div(-6)=${R('-8')}`,
          trap: 'لا تقسم بالعكس: الناتج المطلوب يُقسم على العدد المعلوم',
          exam: 'تحقّق دائمًا بالضرب: المقسوم عليه في الحاصل',
          chip: `b\\times${R('q')}=a`,
          quiz: [
            { q: '$(-9)\\times q=-54$ ، إذن $q$ يساوي:', options: ['$6$', '$-6$', '$-45$'], correct: 0 },
            { q: '$(-35)\\div 7$ يساوي:', options: ['$-5$', '$5$', '$-28$'], correct: 0 },
          ],
        },
        summary: 'حاصل قسمة a على b (b ≠ 0) هو العدد q الذي إذا ضُرب في b أعطى a : a ÷ b = q معناه b × q = a .',
        body: <div className="space-y-2">{definition.lines.map((t) => <React.Fragment key={t}>{P(t)}</React.Fragment>)}<p className="text-sm text-slate-600"><MathText>{definition.examples}</MathText></p></div>,
      },
      {
        id: 'ishara-qisma', type: 'regles', title: 'إشارة حاصل قسمة عددين نسبيين',
        memo: {
          rule: `\\dfrac{-}{-}=${R('+')},\\ \\ \\dfrac{-}{+}=${R('-')}`,
          hook: 'قاعدة إشارات الضرب نفسها',
          example: `(-63)\\div(-7)=${R('9')}`,
          trap: 'حاصل قسمة سالبين موجب، لا سالب',
          exam: 'عيّن الإشارة أوّلًا، ثم اقسم المسافتين',
          chip: `\\tfrac{-}{-}=${R('+')}`,
          quiz: [
            { q: '$(-72)\\div(-9)$ :', options: ['$8$', '$-8$', '$-63$'], correct: 0 },
            { q: '$56\\div(-7)$ :', options: ['$-8$', '$8$', '$49$'], correct: 0 },
          ],
        },
        predictPrompt: 'في الخزائن التي كان رمزها موجبًا لاحظتَ شيئًا على العددين المكتوبين على بابها. ماذا تلاحظ؟ اكتب القاعدة بكلماتك.',
        summary: 'حاصل قسمة عددين لهما الإشارة نفسها موجب، وحاصل قسمة عددين مختلفي الإشارة سالب؛ ومسافته إلى الصفر حاصل قسمة المسافتين.',
        body: (
          <div className="space-y-2">
            {signs.lines.map((t) => <React.Fragment key={t}>{P(t)}</React.Fragment>)}
            <p className="text-sm text-slate-600"><MathText>{signs.examples}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{signs.remark}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'kasr-qisma', type: 'regles', title: 'حاصل القسمة غير العشري وكتاباته',
        memo: {
          rule: `\\dfrac{-a}{b}=\\dfrac{a}{-b}=${R('-')}\\dfrac{a}{b}`,
          hook: 'السالب يتنقّل، العدد لا يتغيّر',
          example: `4\\div(-6)=${R('-')}\\dfrac{2}{3}`,
          trap: 'سالبان في الكسر يعطيان كسرًا موجبًا',
          exam: 'إذا لم يكن الحاصل عشريًا، اكتبه كسرًا مختزلًا',
          chip: `\\tfrac{-a}{-b}=${R('\\tfrac{a}{b}')}`,
          quiz: [
            { q: 'الكسر $\\frac{-15}{-4}$ يساوي:', options: ['$\\frac{15}{4}$', '$-\\frac{15}{4}$', '$\\frac{4}{15}$'], correct: 0 },
            { q: '$\\frac{2}{-3}$ يساوي:', options: ['$-\\frac{2}{3}$', '$\\frac{2}{3}$', '$-\\frac{3}{2}$'], correct: 0 },
          ],
        },
        predictPrompt: 'فتحتَ الخزانة (−6) × ؟ = 4 بأكثر من كتابة. ما الذي يجمع بين هذه الكتابات؟ اكتب ما لاحظته.',
        summary: 'إذا لم يكن حاصل القسمة عشريًا كتبناه كسرًا a/b ؛ ووضع إشارة السالب في البسط أو المقام أو أمام الكسر لا يغيّر العدد، و (−a)/(−b) = a/b .',
        body: (
          <div className="space-y-2">
            {fraction.lines.map((t) => <React.Fragment key={t}>{P(t)}</React.Fragment>)}
            <p className="text-sm text-slate-600"><MathText>{fraction.examples}</MathText></p>
          </div>
        ),
      },
      {
        id: 'qisma-sifr', type: 'regles', title: 'لا قسمة على الصفر',
        memo: {
          rule: `a\\div b,\\ \\ b${R('\\neq 0')}`,
          hook: 'لا قسمة على الصفر',
          example: `0\\div(-5)=${R('0')}`,
          trap: 'قسمة الصفر على عدد ممكنة، والقسمة على الصفر مستحيلة',
          exam: 'تأكّد قبل القسمة أنّ المقسوم عليه غير معدوم',
          chip: `\\div ${R('0')}`,
          quiz: [
            { q: '$0\\div(-8)$ :', options: ['$0$', '$-8$', 'غير ممكن'], correct: 0 },
            { q: '$(-8)\\div 0$ :', options: ['غير ممكن', '$0$', '$-8$'], correct: 0 },
          ],
        },
        predictPrompt: 'هل يوجد رمز يفتح القفل 0 × ؟ = 5 ؟ ماذا ترى؟ اكتب ملاحظتك.',
        summary: 'لا نقسم على العدد 0 : لا يوجد q يحقّق 0 × q = 5 لأنّ 0 × q = 0 مهما كان q .',
        body: P(zero.text),
      },
    ],
    3: [
      {
        id: 'tariqat-qisma', type: 'methodes', title: 'أحسب حاصل قسمة عددين',
        memo: {
          rule: `a\\div b=${R('\\pm')}\\,(|a|\\div|b|)`,
          hook: 'الإشارة، ثم المسافتان، ثم التحقّق',
          example: `(-7{,}5)\\div 2{,}5=${R('-')}3`,
          trap: 'لا تنسَ التحقّق بالضرب',
          exam: 'اكتب الإشارة، ثم حاصل قسمة المسافتين',
          chip: `${R('\\pm')}\\,|a|\\div|b|`,
          quiz: [
            { q: '$1{,}2\\div(-0{,}4)$ :', options: ['$-3$', '$3$', '$-0{,}3$'], correct: 0 },
            { q: '$(-2)\\div(-8)$ :', options: ['$0{,}25$', '$-0{,}25$', '$4$'], correct: 0 },
          ],
        },
        predictPrompt: 'حسبتَ (−63) ÷ 7 و 0,36 ÷ (−0,001) . ما الخطوات التي اتبعتها بالترتيب؟ اكتبها.',
        summary: 'نعيّن إشارة حاصل القسمة بقاعدة الإشارات، ثم نقسم المسافة إلى الصفر للأوّل على المسافة إلى الصفر للثاني، ونتحقّق بالضرب.',
        body: <div className="space-y-2">{P(METHOD.compute.rule[0])}<p className="text-sm text-slate-600"><MathText>{METHOD.sign.text}</MathText></p></div>,
      },
      {
        id: 'ishara-jadaa', type: 'regles', title: 'إشارة حاصل قسمة جداءين',
        memo: {
          rule: `\\dfrac{(-)(-)}{(-)}=${R('-')}`,
          hook: 'عُدّ كلّ السالبة، فوق وتحت',
          example: `\\dfrac{(-2)\\times 6}{(-3)}=${R('4')}`,
          trap: 'لا تنسَ العوامل السالبة في المقام',
          exam: 'إشارة البسط، ثم إشارة المقام، ثم إشارة الحاصل',
          chip: `\\tfrac{(-)(-)}{(-)}=${R('-')}`,
          quiz: [
            { q: 'إشارة $\\frac{(-1)\\times(-5)}{-2}$ :', options: ['سالبة', 'موجبة', 'معدومة'], correct: 0 },
            { q: '$\\frac{(-4)\\times 3}{-6}$ :', options: ['$2$', '$-2$', '$-\\frac{1}{2}$'], correct: 0 },
          ],
        },
        predictPrompt: 'عيّنتَ إشارة بسط Q ومقامها ثم إشارة Q . كيف عرفتها دون أن تحسب؟ اكتب الطريقة.',
        summary: 'في حاصل قسمة جداءين نعدّ العوامل السالبة في البسط وفي المقام، فنعرف إشارة كل منهما ثم إشارة الحاصل بقاعدة الإشارات.',
        body: P(METHOD.products.text),
      },
      {
        id: 'tariqat-awlawiya', type: 'methodes', title: 'سلسلة حسابات على الأعداد النسبية',
        memo: {
          rule: `(\\,)\\ \\to\\ ${R('\\times\\div')}\\ \\to\\ +-`,
          hook: 'الأقواس، ثم الضرب، ثم الجمع',
          example: `-3+2\\times(-4)=-3${R('-8')}=-11`,
          trap: 'لا تجمع قبل أن تضرب',
          exam: 'اكتب كل مرحلة في سطر وحدها',
          chip: `${R('\\times\\div')}\\to +-`,
          quiz: [
            { q: '$-3+2\\times(-4)$ :', options: ['$-11$', '$4$', '$-20$'], correct: 0 },
            { q: '$12\\div(-3)\\times 2$ :', options: ['$-8$', '$-2$', '$8$'], correct: 0 },
          ],
        },
        predictPrompt: 'حسبتَ A = 5 − (3 × (−4) + 7) . بأيّ ترتيب أنجزتَ العمليات؟ اكتبه.',
        summary: 'نحسب ما بين الأقواس أوّلًا، ثم الضرب والقسمة من اليسار إلى اليمين، ثم الجمع والطرح من اليسار إلى اليمين.',
        body: <div className="space-y-2">{priorities.lines.map((t) => <React.Fragment key={t}>{P(t)}</React.Fragment>)}<p className="text-sm text-slate-600"><MathText>{priorities.examples}</MathText></p></div>,
      },
    ],
  },
};
