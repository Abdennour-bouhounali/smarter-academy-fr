import MathText from '../../../../../common/components/MathText';
import { METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** Ce qui CHANGE dans une règle de la fiche `memo` (rouge). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'jidaa-aamilayn',
        type: 'methodes',
        title: 'كتابة عدد على شكل جداء عاملين',
        memo: {
          rule: `a=${R('d\\times e')}\\ \\Rightarrow\\ d\\mid a\\ \\wedge\\ e\\mid a`,
          hook: 'جداء واحد، قاسمان معًا',
          example: `60=${R('4\\times15')}\\ \\Rightarrow\\ 4\\mid60\\ \\wedge\\ 15\\mid60`,
          trap: 'نسيان أنّ كل جداء يعطي قاسمين: العاملان معًا',
          exam: 'أكتب العدد جداءً بكل الأشكال الممكنة ثم أستخرج العاملين',
          chip: `a=${R('d\\times e')}`,
          quiz: [
            {
              q: '$60 = 4 \\times 15$. القاسمان اللذان تظهرهما المساواة هما:',
              options: ['$4$ فقط', '$60$ و $4$', '$4$ و $15$'],
              correct: 2,
            },
            {
              q: 'الكتابات $24 = 1 \\times 24 = 2 \\times 12 = 3 \\times 8 = 4 \\times 6$ تعطي عدد قواسم يساوي:',
              options: ['$8$', '$4$', '$12$'],
              correct: 0,
            },
          ],
        },
        summary: 'كل كتابة a = d × e تعطي قاسمين للعدد a في آن واحد: d و e.',
        body: (
          <div className="space-y-2">
            <p>
              لتعيين قواسم عدد، نكتبه على شكل جداء عاملين بكل الأشكال الممكنة:{' '}
              <MathText>
                {'$60 = 1 \\times 60 = 2 \\times 30 = 3 \\times 20 = 4 \\times 15 = 5 \\times 12 = 6 \\times 10$'}
              </MathText>
              .
            </p>
            <p>كل عامل في هذه الجداءات قاسم للعدد 60.</p>
          </div>
        ),
      },
      {
        id: 'qasim-rappel',
        type: 'vocabulaire',
        title: 'تذكير: قاسم عدد طبيعي',
        summary: 'b قاسم لـ a معناه a = b × q مع q عدد طبيعي.',
        memo: {
          rule: `b\\mid a\\iff a=b\\times${R('q')}\\ ,\\ q\\in\\mathbb{N}`,
          hook: 'قاسم يعني جداء بعدد طبيعي',
          example: `7\\mid105\\iff105=7\\times${R('15')}`,
          trap: 'قبول جداء بعدد عشري: 2 × 8٫5 لا يجعل 2 قاسمًا للعدد 17',
          exam: 'أتحقّق أنّ العامل الثاني في الجداء عدد طبيعي',
          chip: `b\\mid a\\iff q\\in\\mathbb{N}`,
          quiz: [
            {
              q: '$105 = 7 \\times 15$. إذن:',
              options: ['$105$ قاسم للعدد $7$', '$7$ قاسم للعدد $105$', '$15$ ليس قاسمًا للعدد $105$'],
              correct: 1,
            },
            {
              q: '$17 = 2 \\times 8{,}5$. هل $2$ قاسم للعدد $17$؟',
              options: [
                'نعم، لأنّ $17 = 2 \\times 8{,}5$',
                'نعم، لأنّ $17$ أكبر من $2$',
                'لا، لأنّ $8{,}5$ ليس عددًا طبيعيًّا',
              ],
              correct: 2,
            },
          ],
        },
        body: (
          <p>
            من الدرس 1: القول إنّ <MathText>{'$b$'}</MathText> قاسم للعدد <MathText>{'$a$'}</MathText> معناه يوجد عدد
            طبيعي <MathText>{'$q$'}</MathText> حيث <MathText>{'$a = b \\times q$'}</MathText>.
          </p>
        ),
      },
    ],
    2: [
      {
        id: 'tariqa-qawasim',
        type: 'methodes',
        title: 'طريقة: للبحث عن قواسم عدد طبيعي',
        memo: {
          rule: `d^{2}\\leq a\\ \\wedge\\ d\\mid a\\ \\Rightarrow\\ ${R('\\dfrac{a}{d}')}\\mid a`,
          hook: 'أختبر حتى المربّع فقط',
          example: `10^{2}\\leq105<11^{2}`,
          trap: 'الاختبار حتى نصف العدد أو حتى العدد كلّه دون داعٍ',
          exam: 'أحدّد العدد الذي مربّعه أقرب أسفل العدد وأتوقّف عنده',
          chip: `d^{2}\\leq${R('a')}`,
          quiz: [
            { q: 'لإيجاد قواسم $105$ نختبر القسمة حتى العدد:', options: ['$10$', '$52$', '$105$'], correct: 0 },
            { q: 'لإيجاد قواسم $36$ نختبر القسمة حتى العدد:', options: ['$18$', '$36$', '$6$'], correct: 2 },
          ],
        },
        summary: 'نختبر الأعداد التي مربعها ≤ a؛ كل باقٍ معدوم يعطي قاسمين.',
        body: (
          <div className="space-y-2">
            {METHOD.rule.map((r) => (
              <p key={r}>
                <MathText>{r}</MathText>
              </p>
            ))}
            <p className="text-sm text-slate-600">
              مثال: 105 محصور بين <MathText>{'$10^2$'}</MathText> و <MathText>{'$11^2$'}</MathText>، فنختبر من 1 إلى 10.
            </p>
          </div>
        ),
      },
      {
        id: 'qawaid-qisma',
        type: 'memoriser',
        title: 'قواعد قابلية القسمة تُسرّع الاختبار',
        memo: {
          rule: `3\\mid a\\iff 3\\mid${R('s(a)')}\\quad5\\mid a\\iff u(a)\\in\\{0\\,,5\\}`,
          hook: 'القاعدة أسرع من القسمة',
          example: `105:\\ s=${R('6')}\\Rightarrow3\\mid105\\ ,\\ u=${R('5')}\\Rightarrow5\\mid105`,
          trap: 'الخلط بين قاعدة 3 وقاعدة 9: مجموع الأرقام 6 يقبل القسمة على 3 لا على 9',
          exam: 'أطبّق القواعد على 2 و3 و4 و5 و9 قبل إجراء القسمة',
          chip: `3\\mid a\\iff 3\\mid s(a)`,
          quiz: [
            {
              q: 'هل يقبل $105$ القسمة على $9$؟',
              options: [
                'نعم، لأنّ مجموع أرقامه $6$',
                'لا، لأنّ رقم وحداته $5$',
                'لا، لأنّ مجموع أرقامه $6$ ليس من مضاعفات $9$',
              ],
              correct: 2,
            },
            {
              q: 'هل يقبل $2340$ القسمة على $4$؟',
              options: [
                'لا، لأنّ مجموع أرقامه $9$',
                'نعم، لأنّ الرقمين الأخيرين $40$ يقبلان القسمة على $4$',
                'لا، لأنّ رقم وحداته $0$',
              ],
              correct: 1,
            },
          ],
        },
        // Pas de prédiction : la ligne « في حالة الأعداد 2 ، 3 ، 4 ، 5 و 9 نطبق قواعد
        // قابلية القسمة » vient d'être lue (fin de la طريقة, étape 2 : corps de
        // `tariqa-qawasim` et boîte du manuel), et les règles sont des acquis antérieurs.
        predict: false,
        summary: 'من أجل 2 و3 و4 و5 و9 نطبق القواعد بدل إجراء القسمة.',
        body: (
          <p>
            في حالة الأعداد 2 ، 3 ، 4 ، 5 و 9 نطبق قواعد قابلية القسمة (رقم الوحدات، مجموع الأرقام، الرقمان الأخيران)
            بدل القسمة.
          </p>
        ),
      },
    ],
  },
};
