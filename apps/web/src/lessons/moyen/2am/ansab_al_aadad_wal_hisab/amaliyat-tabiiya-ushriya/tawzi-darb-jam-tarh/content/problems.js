/**
 * Les trois « مسائل » du درس « توزيع الضرب على الجمع والطرح » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). Registres : le prix de 35 cartables de deux façons
 * (مسألة 1, un ticket lu par article / par cartable), des rideaux en décimaux calculés de tête (مسألة 2, `ex-26` refait) et une calculatrice trop courte (مسألة 3, `ex-28` et `deep-42` refaits :
 * 99 = 100 − 1). Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt). L'argent est entre isolats LTR ; aucun résultat négatif.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — حقائب النادي',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🎒',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'عدد الحقائب 35', useful: true },
      { id: 'd2', text: 'في كلّ حقيبة 4 كراريس ثمن الواحد منها ⁦45 DA⁩', useful: true },
      { id: 'd3', text: 'وفي كلّ حقيبة 3 أقلام ثمن الواحد منها ⁦25 DA⁩', useful: true },
      { id: 'd4', text: 'رصيد النادي ⁦9 000 DA⁩', useful: true },
      { id: 'd5', text: 'يوزَّع الحقائب على تلاميذ المدرسة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ثمن حقيبة',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['ثمن حقيبة واحدة'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-tawzi'], prompt: 'ثمن حقيبة واحدة ( DA ) :', expected: 255, display: '255',
            explain: 'الكراريس: $4 \\times 45 = 180$ والأقلام: $3 \\times 25 = 75$ ، والمجموع $180 + 75 = 255$ .' },
          { kind: 'solution', ask: 0, lines: [
            'ثمن الكراريس الأربعة $4 \\times 45 = 180 \\mathrm{DA}$ ، وثمن الأقلام الثلاثة $3 \\times 25 = 75 \\mathrm{DA}$ .',
            'ثمن الحقيبة $180 + 75 = 255 \\mathrm{DA}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'ثمن الحقائب كلّها بطريقتين',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الثمن بحقيبة حقيبة', 'الثمن صنفًا بصنف'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-tawzi'], prompt: 'حقيبة بحقيبة: $35 \\times 255$ ( DA ) :', expected: 8925, display: '8925',
            explain: '$35 \\times 255 = 35 \\times 200 + 35 \\times 55 = 7000 + 1925 = 8925$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qaidat-tawzi'], prompt: 'صنفًا بصنف: $35 \\times 180 + 35 \\times 75$ ( DA ) :', expected: 8925, display: '8925',
            explain: '$35 \\times 180 = 6300$ و $35 \\times 75 = 2625$ ، والمجموع $8925$ ؛ وهو العدد نفسه لأنّ $35 \\times 255 = 35 \\times (180 + 75)$ .' },
          { kind: 'solution', ask: 0, lines: [
            'حقيبة بحقيبة: $35 \\times 255 = 8925 \\mathrm{DA}$ .',
            'صنفًا بصنف: الكراريس $35 \\times 180 = 6300$ والأقلام $35 \\times 75 = 2625$ ، فالمجموع $6300 + 2625 = 8925 \\mathrm{DA}$ .',
            'الطريقتان تعطيان العدد نفسه: $35 \\times (180 + 75) = 35 \\times 180 + 35 \\times 75$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'هل يكفي الرصيد؟',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['الجواب', 'المتبقّي'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaidat-tawzi'],
            prompt: 'هل يكفي رصيد النادي ( $9\\,000 \\mathrm{DA}$ ) ؟',
            options: ['نعم، لأنّ $8\\,925 < 9\\,000$', 'لا، لأنّ $8\\,925 > 9\\,000$', 'لا يمكن الحكم'], correct: 0, cols: 1,
            explain: 'ثمن الحقائب $8\\,925 \\mathrm{DA}$ أقلّ من الرصيد $9\\,000 \\mathrm{DA}$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qaidat-tawzi'], prompt: 'المتبقّي بعد الشراء ( DA ) :', expected: 75, display: '75',
            explain: '$9000 - 8925 = 75$ .' },
          { kind: 'solution', ask: 0, lines: [
            'ثمن الحقائب $8\\,925 \\mathrm{DA}$ أقلّ من $9\\,000 \\mathrm{DA}$ ، فالرصيد يكفي.',
            'يبقى $9000 - 8925 = 75 \\mathrm{DA}$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — ورشة الخياطة',
    context: 'قماش الستائر',
    emoji: '🪡',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'ستارة واحدة', lines: [{ label: 'قماش', value: '2,35 m' }, { label: 'بطانة', value: '0,65 m' }] }, { title: 'الطلب', lines: [{ label: 'ستائر', value: '12' }, { label: 'لفّة القماش', value: '40 m' }] }], ariaLabel: 'بطاقتان: قماش ستارة وبطانتها، وعدد الستائر وطول لفّة القماش' },
    statement: 'تخيط أمّ أمين 12 ستارة؛ تحتاج كلّ ستارة إلى $2{,}35$ m من القماش و $0{,}65$ m من البطانة.',
    data: [
      { id: 'a', text: 'عدد الستائر 12', useful: true },
      { id: 'b', text: 'قماش الستارة 2,35 m وبطانتها 0,65 m', useful: true },
      { id: 'c', text: 'اشترت لفّة من القماش طولها 40 m', useful: true },
      { id: 'd', text: 'الستائر لغرفة الجلوس', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الطول الكلّي ذهنيًا',
        question: 'احسب ذهنيًا بإخراج عامل مشترك الطول الكلّي من القماش والبطانة.',
        asks: ['الطول الكلّي', 'العامل المشترك'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tariqa-dhihni'],
            prompt: 'أيّ كتابة تُظهر العامل المشترك في $12 \\times 2{,}35 + 12 \\times 0{,}65$ ؟',
            options: ['$12 \\times (2{,}35 + 0{,}65)$', '$12 \\times 2{,}35 \\times 0{,}65$', '$(12 + 12) \\times (2{,}35 + 0{,}65)$'], correct: 0, cols: 1,
            explain: 'العامل المشترك 12 يخرج ونجمع الطولين: $2{,}35 + 0{,}65 = 3$ . (الثانية ضربت الأطوال؛ والثالثة ضاعفت العامل.)' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqa-dhihni'], prompt: 'الطول الكلّي ( m ) :', expected: 36, display: '36',
            explain: '$12 \\times (2{,}35 + 0{,}65) = 12 \\times 3 = 36$ .' },
          { kind: 'solution', ask: 0, lines: [
            'طول الستارة بقماشها وبطانتها $2{,}35 + 0{,}65 = 3$ m .',
            'الطول الكلّي $12 \\times 3 = 36$ m ؛ وبالنشر $12 \\times 2{,}35 + 12 \\times 0{,}65 = 28{,}2 + 7{,}8 = 36$ m .',
          ] },
        ],
      },
      {
        label: '2)', title: 'ما يتبقّى من اللفّة',
        question: 'اشترت اللفّة 40 m : ما الباقي بعد الخياطة؟',
        asks: ['الباقي'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqa-dhihni'], prompt: 'الباقي ( m ) :', expected: 4, display: '4',
            explain: '$40 - 36 = 4$ .' },
          { kind: 'solution', ask: 0, lines: [
            'اللفّة طولها $40$ m وقد استعملت منها $36$ m .',
            'الباقي $40 - 36 = 4$ m .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — آلة لا تتّسع',
    context: 'الآلة الحاسبة',
    emoji: '🧮',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'الآلة', lines: [{ label: 'أقصى ما تعرضه', value: '8 أرقام' }] }, { title: 'المطلوب', lines: [{ label: 'الجداء', value: '12 345 678 × 99' }] }], ariaLabel: 'بطاقتان: الآلة تعرض 8 أرقام على الأكثر، والمطلوب حساب الجداء 12 345 678 ضرب 99' },
    statement: 'شاشة آلة حاسبة بسيطة لا تعرض أكثر من 8 أرقام. نريد حساب $12\\,345\\,678 \\times 99$ .',
    data: [
      { id: 'a', text: 'الشاشة تعرض 8 أرقام على الأكثر', useful: true },
      { id: 'b', text: 'نريد الجداء 12 345 678 × 99', useful: true },
      { id: 'c', text: 'الآلة حديثة الصنع', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'لماذا لا تكفي الآلة؟',
        question: 'لماذا لا تكفي الآلة لإظهار الجداء؟',
        asks: ['السبب'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaidat-tawzi'],
            prompt: 'جداء عدد من 8 أرقام في 99 :',
            options: ['يزيد على 8 أرقام: فهو قريب من $12\\,345\\,678 \\times 100$ أي 10 أرقام', 'يبقى من 8 أرقام', 'يصير عددًا من رقم واحد'], correct: 0, cols: 1,
            explain: 'الضرب في 99 يقارب الضرب في 100، فيضيف رقمين تقريبًا إلى العدد: النتيجة من 10 أرقام لا تعرضها الشاشة.' },
          { kind: 'solution', ask: 0, lines: [
            'الجداء قريب من $12\\,345\\,678 \\times 100 = 1\\,234\\,567\\,800$ وهو من 10 أرقام.',
            'الشاشة تعرض 8 أرقام على الأكثر، فلا تعرض الجداء كلّه.',
          ] },
        ],
      },
      {
        label: '2)', title: 'نكتب 99 = 100 − 1',
        question: 'اكتب 99 على شكل فرق ثم انشر الجداء.',
        asks: ['النشر'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaidat-tawzi'],
            prompt: 'أيّ كتابة هي نشر $12\\,345\\,678 \\times (100 - 1)$ ؟',
            options: ['$12\\,345\\,678 \\times 100 - 12\\,345\\,678 \\times 1$', '$12\\,345\\,678 \\times 100 - 1$', '$12\\,345\\,678 \\times 100 + 12\\,345\\,678$'], correct: 0, cols: 1,
            explain: 'العدد يضرب الحدّين: $12\\,345\\,678 \\times 100$ و $12\\,345\\,678 \\times 1$ ، والإشارة بينهما طرح. (الثانية ضربت الحدّ الأول وحده؛ والثالثة غيّرت الإشارة.)' },
          { kind: 'solution', ask: 0, lines: [
            '$99 = 100 - 1$ ، فـ $12\\,345\\,678 \\times 99 = 12\\,345\\,678 \\times 100 - 12\\,345\\,678 \\times 1$ .',
            'أي $1\\,234\\,567\\,800 - 12\\,345\\,678$ : جداءان سهلان وطرح واحد.',
          ] },
        ],
      },
      {
        label: '3)', title: 'النتيجة',
        question: 'أنجز الطرح بيدك وأعط الجداء.',
        asks: ['الجداء'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-tawzi'], prompt: 'الجداء $12\\,345\\,678 \\times 99$ :', expected: 1222222122, display: '1222222122',
            explain: '$1\\,234\\,567\\,800 - 12\\,345\\,678 = 1\\,222\\,222\\,122$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$1\\,234\\,567\\,800 - 12\\,345\\,678 = 1\\,222\\,222\\,122$ .',
            'الجداء $12\\,345\\,678 \\times 99 = 1\\,222\\,222\\,122$ ، وهو من 10 أرقام.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
