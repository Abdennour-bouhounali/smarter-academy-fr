import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD_PLACE } from './content/textbook';

// La carte progressive de la leçon — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « الأعداد العشرية ونصف المستقيم المدرّج » (1AM) — SOURCE UNIQUE (content/textbook.js : les mots de la plateforme,
 * tirés de نشاط 4, de معارف 5 et d'أتمرّن 16 du manuel ; rien n'est copié au mot).
 */
/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'tadrij-nisf-mustaqim', type: 'concepts', title: 'تدريج نصف مستقيم',
        memo: {
          rule: `\\frac{1}{10}=${R('0{,}1')}`,
          hook: 'في كلّ وحدة عشر تدريجات صغيرة',
          example: `10\\times${R('0{,}1')}=1`,
          trap: 'التدريجة الصغيرة ليست وحدة كاملة: هي $0{,}1$ فقط',
          exam: 'اختر المبدأ والوحدة، ثم قسّم الوحدة إلى عشرة أجزاء متساوية',
          chip: `\\frac{1}{10}=${R('0{,}1')}`,
          quiz: [
            { q: 'عدد التدريجات الصغيرة في الوحدة الواحدة:', options: ['$10$', '$100$', '$1$'], correct: 0 },
            { q: 'التباعد بين تدريجتين صغيرتين متتاليتين:', options: ['$1$', '$0{,}1$', '$0{,}01$'], correct: 1 },
          ],
        },
        predictPrompt: 'على الشريط لم يظهر في البداية إلا المبدأ. ماذا فعلتَ بالعلامة « 1 » حتى تتّسع الحفرة لأبعد قفزة؟ وكم تدريجة صغيرة رسم الشريط في كلّ وحدة؟ وماذا يمثّل التباعد بين تدريجتين؟ اكتب ما لاحظتَه.',
        summary: 'نختار مبدأً $O$ ووحدة طول ننقلها منه، ثم نقسّم كلّ وحدة إلى عشرة أجزاء متساوية: التباعد بين تدريجتين صغيرتين متتاليتين $\\frac{1}{10}=0{,}1$ .',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.halfLine.definition}</MathText></p>
          </div>
        ),
      },
      {
        id: 'faasila-nuqta', type: 'regles', title: 'فاصلة نقطة',
        memo: {
          rule: `${R('2')}{,}${R('4')}=${R('2')}+\\frac{${R('4')}}{10}`,
          hook: 'الوحدات أوّلًا ثم التدريجات الصغيرة',
          example: `A(2{,}4)\\ ,\\ O(0)`,
          trap: 'الرقم بعد الفاصلة يعدّ التدريجات الصغيرة لا الوحدات: $2{,}4$ ليست $4{,}2$',
          exam: 'اقرأ الوحدات الكاملة، ثم عدّ التدريجات الصغيرة، واكتب فاصلة النقطة',
          chip: `A(2{,}4)`,
          quiz: [
            { q: 'نقطة تبعد عن $O$ بثلاث وحدات وسبع تدريجات صغيرة، فاصلتها:', options: ['$7{,}3$', '$3{,}7$', '$3{,}07$'], correct: 1 },
            { q: 'فاصلة المبدأ $O$ هي:', options: ['$0$', '$1$', '$10$'], correct: 0 },
          ],
        },
        predictPrompt: 'ما فاصلة العلم الأزرق على الشريط؟ كيف قرأتَها؟ وماذا يعني الرقم قبل الفاصلة والرقم بعدها؟ اكتب كيف تقرأ فاصلة نقطة.',
        summary: 'فاصلة نقطة عدد يعيّن موضعها: الوحدات الكاملة قبل الفاصلة والتدريجات الصغيرة بعدها. $A(2{,}4)$ تبعد عن $O$ بوحدتين وأربع تدريجات، وفاصلة المبدأ $O(0)$ .',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.abscissa.definition}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.writings.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'hasr-faasila', type: 'regles', title: 'حصر فاصلة',
        memo: {
          rule: `2{,}${R('3')}<C<2{,}${R('4')}`,
          hook: 'بين تدريجتين أحصر ولا أقرأ مضبوطة',
          example: `1{,}9<B<2`,
          trap: 'علم بين تدريجتين لا فاصلة مضبوطة له على الشريط',
          exam: 'عيّن التدريجتين المتتاليتين المجاورتين، ثم اكتب الحصر بينهما',
          chip: `2{,}3<C<2{,}4`,
          quiz: [
            { q: 'علم بين التدريجتين $5{,}6$ و $5{,}7$ ، حصر فاصلته $x$ :', options: ['$x=5{,}6$', '$5{,}6<x<5{,}7$', '$5{,}7<x<5{,}8$'], correct: 1 },
            { q: 'نقرأ فاصلة مضبوطة لعلم يقع:', options: ['بين تدريجتين', 'على تدريجة', 'خارج الشريط'], correct: 1 },
          ],
        },
        predictPrompt: 'على الشريط علم لم يقع على أيّ تدريجة. كيف عرفتَ ذلك؟ وهل تستطيع أن تقول إنّ فاصلته $2{,}3$ أو $2{,}4$ ؟ اكتب ما تفعله لتقرأ فاصلة هذا العلم.',
        summary: 'نقرأ فاصلة مضبوطة إن وقعت النقطة على تدريجة؛ وإن وقعت بين تدريجتين متتاليتين حصرنا فاصلتها بينهما: $2{,}3<C<2{,}4$ .',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.bounds.text}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'mabda-ghayr-zahir', type: 'concepts', title: 'مبدأ لا يظهر',
        memo: {
          rule: `O(${R('0')})`,
          hook: 'المبدأ موجود ولو لم نره',
          example: `10{,}8=10+\\frac{8}{10}`,
          trap: 'أوّل علامة ظاهرة ليست $0$ بالضرورة: اقرأ العدد المكتوب عليها',
          exam: 'اقرأ آخر علامة مكتوبة قبل النقطة، ثم عدّ التدريجات الصغيرة',
          chip: `O(0)`,
          quiz: [
            { q: 'شريط تبدأ علاماته الظاهرة من $9$ ؛ علم بعد العلامة $10$ بثلاث تدريجات صغيرة فاصلته:', options: ['$9{,}3$', '$0{,}3$', '$10{,}3$'], correct: 2 },
            { q: 'فاصلة مبدأ نصف المستقيم حين لا يظهر في الصورة:', options: ['$9$', '$0$', 'غير معروفة'], correct: 1 },
          ],
        },
        predictPrompt: 'في الشريط الذي لا يظهر مبدؤه بدأت العلامات من 9. كيف قرأتَ فاصلة العلم الواقع بعد العلامة 10 بثماني تدريجات؟ ومن أين بدأتَ العدّ؟ وهل اختفى المبدأ؟',
        summary: 'في حالات معيّنة لا يظهر مبدأ نصف المستقيم المدرّج: نقرأ الأعداد المكتوبة على التدريجات ونعدّ التدريجات الصغيرة بعد آخر علامة؛ ويبقى $O(0)$ موجودًا.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.hiddenOrigin.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.smallerScale.text}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqat-taalim', type: 'methodes', title: 'أعلّم وأقرأ',
        memo: {
          rule: `${R('3')}+\\frac{${R('5')}}{10}=3{,}5`,
          hook: 'أعدّ الوحدات ثم التدريجات',
          example: `M(2{,}7)\\ :\\ 2+\\frac{7}{10}`,
          trap: 'لا أعدّ التدريجات قبل الوحدات الكاملة',
          exam: 'علّم بعدّ الوحدات ثم التدريجات، واقرأ بالطريق المعاكس، واحصر بين تدريجتين',
          chip: `3+\\frac{5}{10}=3{,}5`,
          quiz: [
            { q: 'لتعليم $M(2{,}7)$ نعدّ من $O$ :', options: ['وحدتين ثم 7 تدريجات صغيرة', '7 وحدات ثم تدريجتين', '27 وحدة'], correct: 0 },
            { q: 'نقطة بعد $3$ بخمس تدريجات صغيرة، فاصلتها:', options: ['$3{,}05$', '$5{,}3$', '$3{,}5$'], correct: 2 },
          ],
        },
        predictPrompt: 'لتعليم نقطة معلومة الفاصلة وقراءة نقطة معلومة الموضع: بماذا تبدأ؟ وماذا تعدّ بعد ذلك؟ وماذا تفعل إن وقعت النقطة بين تدريجتين؟ اكتب الطريقة.',
        summary: 'نعدّ الوحدات الكاملة أوّلًا ثم التدريجات الصغيرة (كلّ واحدة $0{,}1$)؛ ونقرأ بالطريق المعاكس؛ وإن وقعت النقطة بين تدريجتين حصرنا فاصلتها.',
        body: (
          <div className="space-y-2">
            {METHOD_PLACE.solution.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{METHOD_PLACE.rule}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
