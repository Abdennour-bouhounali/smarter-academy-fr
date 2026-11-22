import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle (LESSON_CONTRACT) : ce sont les RESSOURCES des cinq
 * دروس, telles que la situation les mobilise, et la démarche en trois phases.
 *   jumla-bayaniya     module 7 — deux inconnues, deux informations : les droites et leur point commun (درس 4)
 *   taklifa-taalufiya  module 7 — un prix fixe + un prix par unité est une fonction affine ; image, antécédent (درس 1)
 *   min-thunaiyatayn   module 7 — un tarif connu par deux devis : تناسب التغيّرات puis b (درس 3)
 *   ikhtiyar-sigha     module 7 — comparer deux tarifs : l'intersection, le moins cher avant / après (درس 2 et 5)
 *   thalath-sigh       module 7 — trois tarifs : la droite la plus basse, trois plages (درس 5, laboratoire)
 *   tafsir-natija      module 7 — interpréter : nombre entier, en dinars, sans dépasser la somme
 *   tariqat-wadiya     module 7 — la démarche : قراءة · تحليل · تنفيذ
 * Les nombres sont ceux de la situation du module 7 ; ceux de « إختبار أولي » (la sortie aux Sablettes)
 * n'apparaissent dans aucun item.
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'jumla-bayaniya', type: 'methodes', title: 'عددان مجهولان: مستقيمان ونقطة تقاطعهما', summary: 'نكتب كل معادلة من الجملة على شكل دالة تآلفية ونمثّلها بمستقيم، وحلّ الجملة إحداثيتا نقطة تقاطع المستقيمين: الفاصلة أولا ثم الترتيب.',
      memo: {
        rule: `(${R('x')}\\,;\\,${R('y')})=(d_1)\\cap(d_2)`,
        hook: 'الحلّ نقطة تقاطع المستقيمين',
        example: `(${R('32')}\\,;\\,${R('4')})`,
        trap: 'عكس الفاصلة والترتيب',
        exam: 'اكتب كل معادلة بدلالة المجهول الثاني',
        chip: `(d_1)\\cap(d_2)`,
        quiz: [
          { q: 'تقاطع $(d_1)$ و $(d_2)$ هو $(32 ; 4)$ . عدد التلاميذ (الفاصلة):', options: ['$32$', '$4$', '$36$'], correct: 0 },
          { q: 'المعادلة $300x + 600y = 12000$ تُكتب $y =$', options: ['$-\\frac{1}{2}x + 20$', '$\\frac{1}{2}x + 20$', '$-2x + 40$'], correct: 0 },
        ],
      },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.eqY}</MathText></li>
            <li><MathText>{REMARKS.jumla}</MathText></li>
          </ul>
        ) },
      { id: 'taklifa-taalufiya', type: 'regles', title: 'مبلغ ثابت ومبلغ عن كل وحدة: دالة تآلفية', summary: 'ثمن يتكوّن من مبلغ ثابت يضاف إليه مبلغ عن كل وحدة دالة تآلفية: معاملها ثمن الوحدة وترتيبها عند المبدأ المبلغ الثابت.',
      memo: {
        rule: `f(x)=${R('a')}x+${R('b')}`,
        hook: 'ثمن الوحدة والمبلغ الثابت',
        example: `f(32)=${R('150')}\\times 32+${R('6000')}=10800`,
        trap: 'نسيان المبلغ الثابت',
        exam: 'عوّض عدد الوحدات ثم أضف المبلغ الثابت',
        chip: `${R('a')}x+${R('b')}`,
        quiz: [
          { q: '$f(x) = 150x + 6000$ . قيمة $f(20)$ :', options: ['$9000$', '$3000$', '$3150$'], correct: 0 },
          { q: 'أكبر عدد من التلاميذ لمبلغ $12000$ من $150x + 6000 = 12000$ :', options: ['$40$', '$80$', '$120$'], correct: 0 },
        ],
      },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.amal}</MathText></li>
            <li><MathText>{REMARKS.amalMax}</MathText></li>
          </ul>
        ) },
      { id: 'min-thunaiyatayn', type: 'methodes', title: 'ثمن معلوم بعرضين: عددان وصورتاهما', summary: 'المعامل هو فرق الصورتين مقسوما على فرق العددين، ثم نجد الترتيب عند المبدأ بتعويض أحد العددين وصورته.',
      memo: {
        rule: `${R('a')}=\\dfrac{y_1-y_2}{x_1-x_2}`,
        hook: 'المعامل ثم الثابت',
        example: `\\dfrac{12200-9800}{36-24}=${R('200')},\\;b=${R('5000')}`,
        trap: 'نسيان القسمة على فرق العددين',
        exam: 'تحقّق من العبارة بالعدد الآخر',
        chip: `${R('a')}=\\tfrac{y_1-y_2}{x_1-x_2}`,
        quiz: [
          { q: '9800 DA لـ 24 تلميذا و 12200 DA لـ 36 تلميذا. معامل الدالة:', options: ['$200$', '$2400$', '$12$'], correct: 0 },
          { q: 'المعامل $200$ و $g(24) = 9800$ . العدد $b$ :', options: ['$5000$', '$9800$', '$14600$'], correct: 0 },
        ],
      },
        body: <p><MathText>{REMARKS.nawras}</MathText></p> },
      { id: 'ikhtiyar-sigha', type: 'methodes', title: 'المقارنة بين صيغتين', summary: 'نساوي بين التكلفتين أو نقرأ نقطة تقاطع المستقيمين: قبلها صيغة هي الأرخص وبعدها الصيغة الأخرى، ونختار بحسب قيمة المتغيّر.',
      memo: {
        rule: `f(x)=g(x)\\Rightarrow x=${R('x_0')}`,
        hook: 'قبل التقاطع صيغة وبعده أخرى',
        example: `(${R('20')}\\,;\\,9000)`,
        trap: 'اعتبار الأصغر ثمنًا ثابتًا أرخص دائمًا',
        exam: 'اختر الصيغة بحسب قيمة المتغيّر',
        chip: `f(x)=g(x)`,
        quiz: [
          { q: '«الأمل» و«النورس» يتقاطعان عند 20 تلميذا، وعند 32 تلميذا ثمن «الأمل» 10800 و«النورس» 11400. الأرخص:', options: ['«الأمل»', '«النورس»', 'لا فرق'], correct: 0 },
          { q: 'بعد نقطة التقاطع الصيغة الأرخص هي التي مستقيمها:', options: ['تحت الآخر', 'فوق الآخر', 'يقطع محور التراتيب أولًا'], correct: 0 },
        ],
      },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.cross}</MathText></li>
            <li><MathText>{REMARKS.choice}</MathText></li>
          </ul>
        ) },
      { id: 'thalath-sigh', type: 'methodes', title: 'ثلاث صيغ: المستقيم الأدنى', summary: 'مع ثلاث صيغ، الأرخص عند كل عدد من الساعات هي صيغة المستقيم الأدنى، وتتغيّر الصيغة الأرخص عند نقط التقاطع.',
      memo: {
        rule: `\\min(f,g,h)`,
        hook: 'المستقيم الأدنى هو الأرخص',
        example: `${R('3')}<x<${R('6')}\\;:\\;50x+300`,
        trap: 'اختيار صيغة واحدة لكل المجالات',
        exam: 'اذكر الصيغة الأرخص في كل مجال',
        chip: `\\min(f,g,h)`,
        quiz: [
          { q: 'الصيغ $150x$ و $50x + 300$ و $600$ . من أجل $x = 4$ الأرخص:', options: ['$50x + 300$', '$150x$', '$600$'], correct: 0 },
          { q: 'من أجل $x = 7$ في الصيغ نفسها الأرخص:', options: ['$600$', '$50x + 300$', '$150x$'], correct: 0 },
        ],
      },
        body: <p><MathText>{REMARKS.kayakRanges}</MathText></p> },
      { id: 'tafsir-natija', type: 'regles', title: 'تفسير النتيجة في سياقها', summary: 'نكتب الجواب بوحدته وفي سياق الوضعية: عدد طبيعي من التلاميذ أو الساعات، ولا نتجاوز المبلغ المتاح.',
      memo: {
        rule: `x\\in\\mathbb{N}`,
        hook: 'عدد طبيعي ووحدة وسياق',
        example: `1200-1100=${R('100')}\\,\\mathrm{DA}`,
        trap: 'كتابة عدد عشري لعدد التلاميذ',
        exam: 'اكتب الجواب بالدينار في جملة',
        chip: `x\\in\\mathbb{N}`,
        quiz: [
          { q: 'حلّ المعادلة أعطى $x = 40{,}5$ تلميذا. أكبر عدد ممكن من التلاميذ:', options: ['$40$', '$41$', '$40{,}5$'], correct: 0 },
          { q: 'المتبقّي $1200$ DA وثمن قاربين $1100$ DA . المبلغ يكفي ويبقى:', options: ['$100$ DA', '$2300$ DA', '$1100$ DA'], correct: 0 },
        ],
      },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.tafsir}</MathText></li>
            <li><MathText>{REMARKS.rest}</MathText></li>
          </ul>
        ) },
      { id: 'tariqat-wadiya', type: 'methodes', title: 'طريقة: من النص إلى الجواب', summary: 'نقرأ الوضعية ونحدّد المهام والمتغيّرات، نربط كل جزء بالدرس الذي يحلّه ونختار استراتيجية جبرية أو بيانية، ثم ننفّذ ونفسّر النتيجة.',
      memo: {
        rule: `${R('1')}\\to${R('2')}\\to${R('3')}`,
        hook: 'اقرأ ثم حلّل ثم نفّذ',
        example: `1\\to2\\to3`,
        trap: 'البدء بالحساب قبل فهم المطلوب',
        exam: 'اربط كل جزء بالدرس الذي يحلّه',
        chip: `${R('1')}\\to${R('2')}\\to${R('3')}`,
        quiz: [
          { q: 'أول مرحلة في حلّ الوضعية:', options: ['قراءة الوضعية وتحديد المطلوب', 'تنفيذ الحساب', 'كتابة الجواب'], correct: 0 },
          { q: 'ثمن لا يُعطى دستوره بل عرضان معلومان يعيدنا إلى:', options: ['عددان وصورتاهما', 'جملة معادلتين فقط', 'رسم مستقيم بنقطة واحدة'], correct: 0 },
        ],
      },
        body: (
          <ol className="list-decimal ms-5 space-y-1">
            {SITUATION.analysis.map((a) => <li key={a.label}><strong>{a.label}</strong>: <MathText>{a.text}</MathText></li>)}
          </ol>
        ) },
    ],
  },
};
