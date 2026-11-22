import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** Ce qui CHANGE dans une règle de la fiche `memo` (rouge). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

/**
 * Les connaissances du درس « التناسبية والتمثيل البياني » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 1 p. 90 et طرائق p. 91,
 * réécrits). Les liens « راجع » (tableau de proportionnalité 2AM, coordonnées 2AM) sont des prérequis (`priorKnowledge`), mesurés par « أستعدّ », jamais des items ici.
 */
const { definition, property1, property2, refuse, coefficient } = KNOWLEDGE;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'nuqta-jadwal', type: 'regles', title: 'عمود الجدول نقطة',
        memo: {
          rule: `x\\to y\\Longrightarrow ${R('M(x\\ ;\\ y)')}`,
          hook: 'الأول فاصلة والثاني ترتيب',
          example: `6\\to30\\Rightarrow${R('(6\\ ;\\ 30)')}`,
          trap: 'الفاصلة أوّلًا ثم الترتيب لا العكس',
          exam: 'اكتب الإحداثيين بين قوسين: الفاصلة ثم الترتيب',
          chip: `${R('M(x\\ ;\\ y)')}`,
          quiz: [
            { q: 'العمود $6\\to30$ تمثّله النقطة:', options: ['$(6\\ ;\\ 30)$', '$(30\\ ;\\ 6)$', '$(6\\ ;\\ 6)$'], correct: 0 },
            { q: 'في النقطة $A(2\\ ;\\ 3)$ الترتيب هو:', options: ['$3$', '$2$', '$5$'], correct: 0 },
          ],
        },
        predictPrompt: 'رفعتَ دبّوسًا على سكّته إلى ثمن عموده فصار نقطة في المعلم. كيف تكتب إحداثيي هذه النقطة من العمود؟ اكتب ما تضعه أولًا وما تضعه ثانيًا.',
        summary: 'عمود الجدول نقطة: العدد الأول فاصلتها والثاني ترتيبها.',
        body: <p><MathText>{GUIDE.onePin}</MathText></p>,
      },
      {
        id: 'khassiya-tanasub', type: 'regles', title: 'نقط التناسبية مع O',
        memo: {
          rule: `M_i\\in(d),\\ ${R('O\\in(d)')}`,
          hook: 'نقط على مستقيم واحد يمرّ بالمبدأ',
          example: `\\dfrac{3}{2}=\\dfrac{7{,}5}{5}=\\dfrac{12}{8}=${R('1{,}5')}`,
          trap: 'الاستقامة وحدها لا تكفي بل لا بدّ من المرور بالمبدأ',
          exam: 'تحقّق من الاستقامة ومن مرور المستقيم بالمبدأ',
          chip: `${R('O\\in(d)')}`,
          quiz: [
            { q: 'نقط وضعية تناسبية في معلم تقع على:', options: ['مستقيم يمرّ بالمبدأ $O$', 'مستقيم لا يمرّ بـ $O$', 'منحنى'], correct: 0 },
            { q: 'النقط $(1\\ ;\\ 2)$ و $(2\\ ;\\ 4)$ و $(3\\ ;\\ 6)$ تمثّل:', options: ['وضعية تناسبية', 'وضعية غير تناسبية لأنّها ليست على استقامة', 'وضعية غير تناسبية لأنّ المستقيم لا يمرّ بـ $O$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المحلّ الأول مسّت مسطرة واحدة النقط كلّها. أين تقع نقط وضعية تناسبية بالنسبة إلى النقطة $O$ ؟ اكتب ما لاحظتَه.',
        summary: 'نقط وضعية تناسبية على مستقيم واحد يمرّ بـ O.',
        body: <p><MathText>{property1.text}</MathText></p>,
      },
      {
        id: 'ghayr-tanasubi', type: 'regles', title: 'ما ليس تناسبيًا',
        memo: {
          rule: `${R('O\\notin(d)\\ \\lor\\ M_i\\notin(d)')}`,
          hook: 'مبلغ ثابت أو سعر يتغيّر: ليست تناسبية',
          example: `y=2{,}5x+${R('10')}\\Rightarrow O\\notin(d)`,
          trap: 'النقط على استقامة لا تعني وضعية تناسبية',
          exam: 'اذكر السبب: ليست على استقامة أو لا يمرّ المستقيم بالمبدأ',
          chip: `${R('O\\notin(d)')}`,
          quiz: [
            { q: 'نقط على مستقيم يقطع المحور العمودي عند $10$ :', options: ['ليست وضعية تناسبية', 'وضعية تناسبية', 'وضعية تناسبية معاملها $10$'], correct: 0 },
            { q: 'السعر يتغيّر بعد $8$ علب فتنكسر النقط، إذن:', options: ['ليست على استقامة واحدة', 'كلّها على مستقيم يمرّ بـ $O$', 'كلّها على المحور'], correct: 0 },
          ],
        },
        predictPrompt: 'في المحلّين الثاني والثالث لم تُصبح الوضعية تناسبية. اكتب حالتين تمنعان نقط تمثيل من أن تُمثّل وضعية تناسبية.',
        summary: 'نقط ليست على استقامة، أو مستقيم لا يمرّ بالمبدأ: ليست وضعية تناسبية.',
        body: <p><MathText>{refuse.text}</MathText></p>,
      },
      {
        id: 'muamil-qiraa', type: 'regles', title: 'ترتيب الفاصلة 1',
        memo: {
          rule: `(1\\ ;\\ ${R('a')})\\in(d)`,
          hook: 'ترتيب الفاصلة واحد هو المعامل',
          example: `(1\\ ;\\ ${R('1{,}5')})`,
          trap: 'نقرأ الترتيب عند الفاصلة واحد لا عند آخر نقطة',
          exam: 'اقرأ الترتيب عند الفاصلة واحد فهو معامل التناسبية',
          chip: `${R('a')}=y(1)`,
          quiz: [
            { q: 'على مستقيم تناسبية، ترتيب النقطة التي فاصلتها $1$ هو:', options: ['معامل التناسبية', 'فاصلة النقطة $O$', 'عدد النقط'], correct: 0 },
            { q: 'إذا مرّ المستقيم بـ $(2\\ ;\\ 3)$ فالنقطة التي فاصلتها $1$ ترتيبها:', options: ['$1{,}5$', '$3$', '$6$'], correct: 0 },
          ],
        },
        predictPrompt: 'قرأتَ على مستقيم التناسبية ترتيب النقطة التي فاصلتها $1$ . ماذا يمثّل هذا العدد في الوضعية؟ اكتب ما تظنّه.',
        summary: 'ترتيب النقطة التي فاصلتها 1 هو معامل التناسبية.',
        body: <p><MathText>{GUIDE.onO}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'ihdathiyat', type: 'vocabulaire', title: 'الفاصلة والترتيب', predict: false,
        memo: {
          rule: `M(${R('x')}\\ ;\\ ${R('y')})`,
          hook: 'الفاصلة أفقيًا والترتيب عموديًا',
          example: `A(${R('2')}\\ ;\\ 3)`,
          trap: 'لا نبدّل الفاصلة بالترتيب',
          exam: 'اكتب الفاصلة ثم الترتيب',
          chip: `(${R('x')}\\ ;\\ y)`,
          quiz: [
            { q: 'فاصلة النقطة $A(2\\ ;\\ 3)$ هي:', options: ['$2$', '$3$', '$5$'], correct: 0 },
            { q: 'الفاصلة تُقرأ على المحور:', options: ['الأفقي', 'العمودي', 'الأفقي والعمودي معًا'], correct: 0 },
          ],
        },
        summary: 'إحداثيا نقطة: الفاصلة (المحور الأفقي) ثم الترتيب (المحور العمودي).',
        body: <p><MathText>{definition.text}</MathText></p>,
      },
      {
        id: 'tamthil-tanasub', type: 'regles', title: 'التمثيل البياني لوضعية تناسبية',
        memo: {
          rule: `M_i,\\ O\\in(d)\\iff\\dfrac{y}{x}=${R('a')}`,
          hook: 'استقامة مع المبدأ تعني تناسبية',
          example: `(2\\ ;\\ 3),(4\\ ;\\ 6),O\\in(d)\\Rightarrow a=${R('1{,}5')}`,
          trap: 'لا يكفي أن تكون النقط على استقامة',
          exam: 'احكم بشرطين: استقامة النقط ومرور المستقيم بالمبدأ',
          chip: `M_i,\\ ${R('O')}\\in(d)`,
          quiz: [
            { q: 'يمثّل تمثيل بياني وضعية تناسبية إذا كانت نقطه:', options: ['على استقامة واحدة مع $O$', 'على استقامة واحدة فقط', 'تصاعدية فقط'], correct: 0 },
            { q: 'النقط $(1\\ ;\\ 3)$ و $(2\\ ;\\ 5)$ و $(4\\ ;\\ 9)$ :', options: ['لا تمثّل وضعية تناسبية', 'تمثّل وضعية تناسبية', 'تمثّل تناسبية معاملها $3$'], correct: 0 },
          ],
        },
        predictPrompt: 'اكتب بكلماتك متى تُمثّل نقطٌ في معلم وضعية تناسبية، وحالتين لا تُمثّل فيهما ذلك.',
        summary: 'نقط على استقامة واحدة مع O ⇔ وضعية تناسبية.',
        body: (
          <div className="space-y-2">
            <p><MathText>{property1.text}</MathText></p>
            <p><MathText>{property2.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{refuse.text}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'y-ax', type: 'methodes', title: 'العلاقة y = ax',
        memo: {
          rule: `y=${R('a')}\\times x`,
          hook: 'الترتيب هو المعامل ضرب الفاصلة',
          example: `y=${R('0{,}75')}\\times10=7{,}5`,
          trap: 'لا نجمع المعامل إلى الفاصلة بل نضربه فيها',
          exam: 'اكتب العلاقة ثم عوّض بالمعامل',
          chip: `y=${R('a')}x`,
          quiz: [
            { q: 'معامل التناسبية $0{,}75$ ، ترتيب النقطة التي فاصلتها $10$ :', options: ['$7{,}5$', '$10{,}75$', '$13{,}3$'], correct: 0 },
            { q: 'يمرّ مستقيم بـ $O$ وبالنقطة $(4\\ ;\\ 3)$ فمعامله:', options: ['$\\frac{3}{4}$', '$\\frac{4}{3}$', '$12$'], correct: 0 },
          ],
        },
        predictPrompt: 'نقطة $M(x\\ ;\\ y)$ من مستقيم يمرّ بـ $O$ وبالنقطة $(1\\ ;\\ a)$ . اكتب العلاقة بين $y$ و $x$ .',
        summary: 'النقطة (x ; y) من مستقيم التناسبية تحقّق y = a × x ، و a ترتيب الفاصلة 1.',
        body: <p><MathText>{coefficient.text}</MathText></p>,
      },
      {
        id: 'qiraa-qima', type: 'methodes', title: 'قراءة قيمة مجهولة',
        memo: {
          rule: `x=\\dfrac{y}{${R('a')}}`,
          hook: 'الفاصلة هي الترتيب مقسومًا على المعامل',
          example: `L=\\dfrac{4{,}5}{${R('0{,}75')}}=6`,
          trap: 'نقسم على المعامل حين نبحث عن الفاصلة',
          exam: 'حدّد المجهول: ترتيب بالضرب أو فاصلة بالقسمة',
          chip: `x=\\tfrac{y}{${R('a')}}`,
          quiz: [
            { q: 'معامل التناسبية $0{,}75$ ، فاصلة النقطة التي ترتيبها $4{,}5$ :', options: ['$6$', '$3{,}375$', '$5{,}25$'], correct: 0 },
            { q: 'كتلة $10\\ \\mathrm{m}$ من سلك معامله $0{,}75$ :', options: ['$7{,}5\\ \\mathrm{kg}$', '$13{,}3\\ \\mathrm{kg}$', '$10{,}75\\ \\mathrm{kg}$'], correct: 0 },
          ],
        },
        predictPrompt: 'على بيان تناسبية يقرأ تلميذ ترتيب نقطة معلومة الفاصلة، وآخر فاصلة نقطة معلومة الترتيب. كيف تحسب كلّ قيمة من المعامل؟ اكتب الطريقتين.',
        summary: METHOD.read.rule,
        body: <p><MathText>{METHOD.read.rule}</MathText></p>,
      },
    ],
  },
};
