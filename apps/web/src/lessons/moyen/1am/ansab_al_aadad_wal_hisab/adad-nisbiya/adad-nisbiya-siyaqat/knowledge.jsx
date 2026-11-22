import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD_READ } from './content/textbook';

// La carte progressive de la leçon — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « الأعداد النسبية وسياقات استعمالها » (1AM) — SOURCE UNIQUE (content/textbook.js : les mots de la plateforme, tirés de نشاط 1, de معارف 1–2
 * et de l'ouverture du manuel ; rien n'est copié au mot).
 */
/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'sayaqat-salib', type: 'concepts', title: 'أعداد تحت الصفر',
        memo: {
          rule: `${R('-3')}<0<3`,
          hook: 'تحت الصفر عدد سالب',
          example: `-40<0<30`,
          trap: 'الأبرد ليس أكبر عدد: $-3$ أبرد من $5$',
          exam: 'اكتب الوضعية بعدد نسبي: فوق الصفر موجب وتحته سالب',
          chip: `-3<0<3`,
          quiz: [
            { q: 'حرارة 4 درجات تحت الصفر تُكتب:', options: ['$-4$', '$4$', '$0{,}4$'], correct: 0 },
            { q: 'أيّ القراءتين أبرد: $-2$ أم $3$ ؟', options: ['$3$', '$-2$', 'متساويتان'], correct: 1 },
          ],
        },
        predictPrompt: 'في الدفتر قراءات مثل « 3 درجات تحت الصفر ». كيف وضعتَ السائل لها؟ ومتى ظهرت الإشارة أمام القراءة؟ وأيّ صباح كان الأبرد ولماذا؟ اكتب ما لاحظتَه.',
        summary: 'نستعمل الأعداد السالبة حين نقيس على جهتي صفر مرجعيّ: الحرارة وسطح البحر والطوابق والتواريخ. تحت الصفر عدد سالب مسبوق بالإشارة −، وفوقه عدد موجب بلا إشارة، والأبرد هو الأصغر لا الأكبر عددًا.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.contexts.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.need.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'ishara-masafa', type: 'regles', title: 'الإشارة والمسافة إلى الصفر',
        memo: {
          rule: `-${R('3')}\\to ${R('3')}`,
          hook: 'الإشارة جهة والمسافة بُعد',
          example: `-6\\to 6`,
          trap: 'المسافة لا تكون سالبة: مسافة $-3$ هي $3$',
          exam: 'اقرأ الإشارة ثمّ احذفها لتجد المسافة إلى الصفر',
          chip: `-3\\to 3`,
          quiz: [
            { q: 'المسافة إلى الصفر للعدد $-9$ :', options: ['$-9$', '$9$', '$0$'], correct: 1 },
            { q: 'العددان $-5$ و $5$ لهما:', options: ['المسافة نفسها', 'الإشارة نفسها', 'مسافتان مختلفتان'], correct: 0 },
          ],
        },
        predictPrompt: 'حين سجّلتَ قراءة مثل $-3$ : أيّ جزء منها قال لك على أيّ جهة من الصفر يقف السائل، وأيّ جزء قال لك كم يبعد؟ اكتب كيف تقرأ عددًا نسبيًّا.',
        summary: 'للعدد النسبي إشارة تعيّن جهته من الصفر (فوقه أو تحته) ومسافة إلى الصفر تعيّن بُعده، وهي عدد موجب دائمًا: للعددين $-3$ و $3$ المسافة نفسها $3$ .',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.signDistance.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'adad-mutaakisan', type: 'regles', title: 'العددان المتعاكسان',
        memo: {
          rule: `${R('4')}\\ ;\\ ${R('-4')}`,
          hook: 'المسافة نفسها وإشارتان مختلفتان',
          example: `3\\ ;\\ -3`,
          trap: 'معاكس $-4$ هو $4$ ، لا $-4$ ولا $-5$',
          exam: 'اكتب العدد نفسه بإشارة مخالفة؛ ومعاكس $0$ هو $0$',
          chip: `4\\ ;\\ -4`,
          quiz: [
            { q: 'معاكس $-9$ :', options: ['$-9$', '$9$', '$-8$'], correct: 1 },
            { q: 'معاكس $0$ :', options: ['لا معاكس له', '$1$', '$0$'], correct: 2 },
          ],
        },
        predictPrompt: 'أمام المرآة وضعتَ المستوى عند $-4$ . أين وقف ظلّه؟ وماذا يجمع بين الرقمين؟ وأين وقف ظلّ الصفر؟ اكتب ما لاحظتَه.',
        summary: 'يكون عددان نسبيان متعاكسين إذا كان لهما المسافة نفسها إلى الصفر وإشارتان متعاكستان: $3$ و $-3$ ؛ ومعاكس $0$ هو $0$ .',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.opposites.definition}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'adad-nisbi', type: 'concepts', title: 'العدد النسبي موجبًا وسالبًا',
        memo: {
          rule: `${R('+')}3=3`,
          hook: 'الموجب بلا إشارة والسالب بإشارة −',
          example: `-5<0<+2`,
          trap: 'الصفر ليس موجبًا فقط ولا سالبًا فقط: هو الاثنان معًا',
          exam: 'صنّف الأعداد: ما تسبقه − سالب، وغيره موجب، والصفر موجب وسالب',
          chip: `+3=3`,
          quiz: [
            { q: 'العدد $0$ هو:', options: ['موجب فقط', 'سالب فقط', 'موجب وسالب معًا'], correct: 2 },
            { q: 'أيّ العددين صحيح نسبي؟', options: ['$-0{,}5$', '$-4$', '$1{,}2$'], correct: 1 },
          ],
        },
        predictPrompt: 'لماذا لا يكفي عدد طبيعي ليكون جوابًا لـ $6+\\ldots=4$ ؟ وما العدد الذي نحتاجه؟ وكيف نكتب عددًا موجبًا وعددًا سالبًا؟ وماذا عن الصفر؟',
        summary: 'الأعداد النسبية موجبة وسالبة: السالب مسبوق بإشارة − وأصغر من الصفر، والموجب أكبر من الصفر ولا تلزمه إشارة، والصفر موجب وسالب معًا. والأعداد النسبية بلا جزء عشري هي الأعداد الصحيحة النسبية.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.relative.definition}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.zero.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.relInt.text}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'qiraat-adad-nisbi', type: 'methodes', title: 'أقرأ وأكتب',
        memo: {
          rule: `-${R('4')}\\leftrightarrow ${R('4')}`,
          hook: 'أبدأ بالصفر ثمّ الجهة ثمّ العدّ',
          example: `3\\ ;\\ -4\\ ;\\ 4`,
          trap: 'لا أكتب الإشارة − لقراءة فوق الصفر',
          exam: 'اكتب العدد النسبي، ثمّ مسافته إلى الصفر، ثمّ معاكسه',
          chip: `-4\\leftrightarrow 4`,
          quiz: [
            { q: '5 درجات تحت الصفر ومعاكسها:', options: ['$-5$ و $5$', '$5$ و $-5$', '$-5$ و $-5$'], correct: 0 },
            { q: 'مسافة $-8$ إلى الصفر ومعاكسه:', options: ['$-8$ و $8$', '$8$ و $-8$', '$8$ و $8$'], correct: 1 },
          ],
        },
        predictPrompt: 'لتكتب قراءة محرار بعدد نسبي ثمّ مسافتها ومعاكسها: بماذا تبدأ؟ وماذا تفعل حين يقع السائل تحت الصفر؟ اكتب الطريقة.',
        summary: 'أبدأ بالصفر: فوقه عدد موجب بلا إشارة، وتحته عدد سالب تسبقه الإشارة − ؛ المسافة إلى الصفر هي العدد دون إشارته؛ ومعاكسه له المسافة نفسها على الجهة الأخرى.',
        body: (
          <div className="space-y-2">
            {METHOD_READ.solution.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{METHOD_READ.rule}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
