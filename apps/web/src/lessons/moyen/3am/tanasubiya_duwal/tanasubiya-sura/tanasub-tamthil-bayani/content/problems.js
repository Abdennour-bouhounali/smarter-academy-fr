/**
 * Les trois « مسائل » du درس « التناسبية والتمثيل البياني » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). La مسألة 1
 * (`LESSON_CONFIG.lessonProblem`) : les عسل d'une coopérative, (2 ; 900), (4 ; 1800), (6 ; 2700) — alignés avec O, 9 pots coûtent 4050 DA ; la 2 le خزّان d'un quartier
 * (2 ; 14), (4 ; 24), (6 ; 34) — alignés mais pas avec O (il contenait déjà 4 L) ; la 3 le riz d'un commerçant honnête (2 ; 350), (4 ; 700), (10 ; 1750) — 6 kg
 * coûtent 1050 DA (pas 1100), 2800 DA achètent 16 kg. Chaque مسألة suit la méthode de la leçon. Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — عسل التعاونية',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🍯',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'ثمن 2 علبة: 900 دج', useful: true },
      { id: 'd2', text: 'ثمن 4 علب: 1800 دج', useful: true },
      { id: 'd3', text: 'ثمن 6 علب: 2700 دج', useful: true },
      { id: 'd4', text: 'تتعاون ثلاثة بساتين في إنتاجه', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'نقطة الأثمان',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['إحداثيا النقطة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ihdathiyat'],
            prompt: 'النقطة التي تمثّل العمود $6 \\to 2700$ هي:',
            options: ['$(6\\ ;\\ 2700)$', '$(2700\\ ;\\ 6)$', '$(6\\ ;\\ 6)$', '$(8\\ ;\\ 2700)$'], correct: 0, cols: 2,
            explain: 'الفاصلة هي العدد الأول $6$ والترتيب هو الثاني $2700$ : $(6\\ ;\\ 2700)$ .' },
          { kind: 'solution', ask: 0, lines: [
            'كلّ عمود نقطة: الفاصلة عدد العلب والترتيب ثمنها.',
            'العمود $6 \\to 2700$ يعطي النقطة $(6\\ ;\\ 2700)$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'هل الوضعية تناسبية؟',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['هل الوضعية تناسبية'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tamthil-tanasub'],
            prompt: 'هل تُمثّل النقط وضعية تناسبية؟',
            options: ['نعم: النقط على استقامة واحدة مع $O$ لأنّ $\\frac{900}{2} = \\frac{1800}{4} = \\frac{2700}{6} = 450$', 'لا: الثمن يزيد مع عدد العلب فقط', 'لا: لأنّ الأثمان كبيرة', 'نعم لأنّ عدد العلب زوجي'], correct: 0, cols: 1,
            explain: 'المعامل $450$ واحد في الأعمدة الثلاثة، فالنقط على مستقيم يمرّ بـ $O$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نحسب ناتج قسمة الثمن على عدد العلب في كلّ عمود: $450$ ثلاث مرّات.',
            'المعامل واحد، فالنقط على استقامة واحدة مع $O$ ، والوضعية تناسبية.',
          ] },
        ],
      },
      {
        label: '3)', title: 'ثمن 9 علب',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['ثمن 9 علب'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['y-ax'], prompt: 'ثمن $9$ علب بالدينار:', expected: 4050,
            explain: '$y = 450 \\times 9 = 4050$ دج.' },
          { kind: 'solution', ask: 0, lines: [
            'معامل التناسبية $450$ دج للعلبة، فـ $y = 450 \\times x$ .',
            'من أجل $x = 9$ : $450 \\times 9 = 4050$ ، فثمن $9$ علب $4050$ دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — خزّان الحيّ',
    context: 'التعاون على خدمة الحيّ',
    emoji: '🚰',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'بعد دقيقتين', lines: [{ label: 'لترًا', value: '14' }] }, { title: 'بعد 4 دقائق', lines: [{ label: 'لترًا', value: '24' }] }, { title: 'بعد 6 دقائق', lines: [{ label: 'لترًا', value: '34' }] }], ariaLabel: 'ثلاث بطاقات: 14 لترًا بعد دقيقتين، 24 بعد 4 دقائق، 34 بعد 6 دقائق' },
    statement: 'يملأ متطوّعو الحيّ خزّانًا بمضخّة، ويسجّلون حجم الماء فيه بعد $2$ و $4$ و $6$ دقائق: $14$ و $24$ و $34$ لترًا. ورُسمت النقط $(2\\ ;\\ 14)$ و $(4\\ ;\\ 24)$ و $(6\\ ;\\ 34)$ في معلم.',
    data: [
      { id: 'a', text: 'بعد 2 دقيقة: 14 لترًا', useful: true },
      { id: 'b', text: 'بعد 4 دقائق: 24 لترًا', useful: true },
      { id: 'c', text: 'بعد 6 دقائق: 34 لترًا', useful: true },
      { id: 'd', text: 'المضخّة اشترتها الجمعية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'هل النقط على استقامة؟',
        question: 'هل النقط الثلاث على استقامة واحدة؟',
        asks: ['هل النقط على استقامة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tamthil-tanasub'],
            prompt: 'هل النقط الثلاث على استقامة واحدة؟',
            options: ['نعم: كلّما زادت المدّة دقيقتين زاد الحجم $10$ لترات', 'لا: الحجم لا يزيد بانتظام', 'لا: لأنّ الأعداد ليست مضاعفات', 'لا يمكن الحكم'], correct: 0, cols: 1,
            explain: 'الفروق متساوية: $24 - 14 = 34 - 24 = 10$ لكلّ دقيقتين، فالنقط على مستقيم.' },
          { kind: 'solution', ask: 0, lines: [
            'من $(2\\ ;\\ 14)$ إلى $(4\\ ;\\ 24)$ يزيد الحجم $10$ ، ومن $(4\\ ;\\ 24)$ إلى $(6\\ ;\\ 34)$ يزيد $10$ أيضًا.',
            'الزيادة نفسها لكلّ دقيقتين، فالنقط على استقامة واحدة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'هل الوضعية تناسبية؟',
        question: 'هل تُمثّل هذه النقط وضعية تناسبية؟ علّل.',
        asks: ['هل الوضعية تناسبية'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tamthil-tanasub'],
            prompt: 'هل هي وضعية تناسبية؟',
            options: ['لا: المستقيم لا يمرّ بـ $O$ لأنّ $\\frac{14}{2} = 7$ و $\\frac{24}{4} = 6$ مختلفان', 'نعم: لأنّ النقط على استقامة', 'نعم: لأنّ الحجم يزيد', 'لا: لأنّ المدّة قصيرة'], correct: 0, cols: 1,
            explain: 'لو كانت تناسبية لكان $\\frac{y}{x}$ ثابتًا؛ لكنّه $7$ ثم $6$ ، فالمستقيم لا يمرّ بـ $O$ .' },
          { kind: 'solution', ask: 0, lines: [
            'النقط على استقامة، لكنّ $\\frac{14}{2} = 7$ و $\\frac{24}{4} = 6$ و $\\frac{34}{6} \\approx 5{,}7$ ليست متساوية.',
            'المستقيم لا يمرّ بـ $O$ ، فالوضعية ليست تناسبية (كان في الخزّان ماء قبل التسجيل).',
          ] },
        ],
      },
      {
        label: '3)', title: 'ماذا يجب أن يتحقّق؟',
        question: 'ماذا يجب أن يكون في الخزّان عند بداية التسجيل لتصير الوضعية تناسبية؟',
        asks: ['الشرط'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tamthil-tanasub'],
            prompt: 'لتصير الوضعية تناسبية:',
            options: ['أن يكون الخزّان فارغًا عند الزمن $0$ فيمرّ المستقيم بـ $O$', 'أن يزيد الحجم أكثر', 'أن تكون النقط أكثر', 'أن تكون المدّة أطول'], correct: 0, cols: 1,
            explain: 'في التناسبية يقابل الزمن $0$ الحجمَ $0$ ، أي أنّ النقطة $O$ على المستقيم.' },
          { kind: 'solution', ask: 0, lines: [
            'في وضعية تناسبية يقابل $0$ العدد $0$ ، فالنقطة $(0\\ ;\\ 0)$ أي $O$ على المستقيم.',
            'هنا ماء موجود قبل البدء، فيقطع المستقيم المحور العمودي فوق $O$ ؛ يجب أن يبدأ الخزّان فارغًا.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — ميزان الأمانة',
    context: 'الأمانة في البيع',
    emoji: '⚖️',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: '2 كغ', lines: [{ label: 'دج', value: '350' }] }, { title: '4 كغ', lines: [{ label: 'دج', value: '700' }] }, { title: '10 كغ', lines: [{ label: 'دج', value: '1750' }] }], ariaLabel: 'ثلاث بطاقات: 2 كغ بـ 350 دج، 4 كغ بـ 700 دج، 10 كغ بـ 1750 دج' },
    statement: 'يبيع تاجر أمين الأرز، وتمثّل النقط $(2\\ ;\\ 350)$ و $(4\\ ;\\ 700)$ و $(10\\ ;\\ 1750)$ ثمنَ الأرز (بالدينار) بدلالة كتلته (بالكيلوغرام) على مستقيم يمرّ بـ $O$ . قال زبون إنّ ثمن $6$ كغ هو $1100$ دج.',
    data: [
      { id: 'a', text: '2 كغ بـ 350 دج', useful: true },
      { id: 'b', text: '4 كغ بـ 700 دج', useful: true },
      { id: 'c', text: '10 كغ بـ 1750 دج', useful: true },
      { id: 'd', text: 'التاجر أمين في بيعه', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'معامل التناسبية',
        question: 'ما معامل التناسبية؟ وما ثمن $6$ كغ؟',
        asks: ['المعامل', 'ثمن 6 كغ'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['y-ax'], prompt: 'معامل التناسبية (ثمن الكيلوغرام الواحد بالدينار):', expected: 175,
            explain: '$\\frac{350}{2} = \\frac{700}{4} = \\frac{1750}{10} = 175$ دج.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qiraa-qima'], prompt: 'ثمن $6$ كغ بالدينار:', expected: 1050,
            explain: '$y = 175 \\times 6 = 1050$ دج.' },
          { kind: 'solution', ask: 1, lines: [
            'معامل التناسبية ترتيب النقطة التي فاصلتها $1$ : $\\frac{350}{2} = 175$ .',
            '$y = 175 \\times x$ ؛ من أجل $x = 6$ : $175 \\times 6 = 1050$ دج.',
          ] },
        ],
      },
      {
        label: '2)', title: 'هل صدق الزبون؟',
        question: 'هل ثمن $6$ كغ هو $1100$ دج؟',
        asks: ['هل 1100 صحيح'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qiraa-qima'],
            prompt: 'هل ثمن $6$ كغ هو $1100$ دج؟',
            options: ['لا: ثمن $6$ كغ هو $1050$ دج، والنقطة $(6\\ ;\\ 1100)$ ليست على المستقيم', 'نعم: قريب من $1050$', 'نعم: لأنّ $1100$ عدد مستدير', 'لا يمكن الحكم'], correct: 0, cols: 1,
            explain: 'على المستقيم ترتيب الفاصلة $6$ هو $1050$ ؛ $1100$ يعطي نقطة فوقه، والأمانة تقتضي السعر الصحيح.' },
          { kind: 'solution', ask: 0, lines: [
            'ثمن $6$ كغ على المستقيم $175 \\times 6 = 1050$ دج.',
            '$1100 \\neq 1050$ ، فالنقطة $(6\\ ;\\ 1100)$ ليست من النقط، والزبون لم يصدق.',
          ] },
        ],
      },
      {
        label: '3)', title: 'كتلة الأرز',
        question: 'ما كتلة الأرز الذي ثمنه $2800$ دج؟',
        asks: ['كتلة الأرز'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qiraa-qima'], prompt: 'كتلة الأرز بالكيلوغرام:', expected: 16,
            explain: '$2800 = 175 \\times x$ ومنه $x = \\frac{2800}{175} = 16$ كغ.' },
          { kind: 'solution', ask: 0, lines: [
            'نبحث عن الفاصلة $x$ التي ترتيبها $2800$ : $175 \\times x = 2800$ .',
            '$x = \\frac{2800}{175} = 16$ ، فالأرز $16$ كغ.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
