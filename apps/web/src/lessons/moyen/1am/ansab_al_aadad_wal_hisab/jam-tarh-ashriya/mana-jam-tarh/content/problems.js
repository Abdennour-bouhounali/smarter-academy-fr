/**
 * Les trois « مسائل » du درس « معنى الجمع والطرح » (modules 5, 6, 7) — des exercices COMPLETS de type امتحان
 * (اختبار الفصل الأول), résolus pas à pas (common/problems/GuidedProblem.jsx).
 *
 * AJOUTS DE LA PLATEFORME, déclarés (`addition('exam_style_problem')`). Périmètre : le SENS du جمع / طرح (le tout ou une
 * partie ?), les mots مجموع / فرق, l'مخطط بأقواس — jamais la technique en colonnes (leçon suivante) ni l'ordre de
 * grandeur (leçon 3). Chaque problème piège les mots « ينقص / أكثر / أقل / أقصر » dans les deux sens.
 *
 * La مسألة 1 est « مسألة الدرس » : son énoncé vit dans `LESSON_CONFIG.lessonProblem` (montré dès le sommaire et
 * rappelé au module 1 ; elle prolonge le niveau متقدم : un budget où « ينقصه » appelle une addition).
 * Chaque nombre est vérifié par calcul dans ./problems.test.js.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — مكتبة القسم',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '📚',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'total', text: 'جمع التلاميذ 2450 دج', useful: true },
      { id: 'dict', text: 'ثمن القاموس 1275 دج', useful: true },
      { id: 'left', text: 'بقي معهم 380 دج', useful: true },
      { id: 'lack', text: 'المبلغ الباقي ينقصه 140 دج لشراء لعبة الشطرنج', useful: true },
      { id: 'days', text: 'المكتبة مفتوحة 3 أيام في الأسبوع', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المبلغ المصروف',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['ما المبلغ الذي صرفه التلاميذ؟'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tamthil-aqwas'],
            prompt: 'في المخطط بأقواس، أين نضع المبلغ الذي جمعه التلاميذ؟',
            options: ['تحت الخطّ: هو الكلّ، والمبلغ المصروف والمبلغ الباقي جزآه', 'فوق الخطّ: هو جزء، والمبلغ المصروف هو الكلّ', 'لا نحتاج إلى مخطط: نجمع كل الأعداد'],
            correct: 0,
            explain: 'التلاميذ صرفوا جزءًا ممّا جمعوه وبقي جزء آخر: ما جمعوه هو الكلّ.' },
          { kind: 'choice', role: 'translate', requires: ['ikhtiyar-amaliya'],
            prompt: 'أيّ حساب يعطي المبلغ المصروف؟',
            options: ['$2450 - 380$', '$2450 + 380$', '$380 - 2450$', '$2450 - 1275$'],
            correct: 0, cols: 2,
            explain: 'المجهول جزء من الكلّ 2450 دج، والجزء الآخر هو الباقي 380 دج: نطرح.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ikhtiyar-amaliya'],
            prompt: 'المبلغ الذي صرفه التلاميذ:', expected: 2070, suffix: 'دج',
            explain: '$2450 - 380 = 2070$.' },
          { kind: 'solution', ask: 0, lines: [
            'المبلغ الذي جمعه التلاميذ هو الكلّ، والمبلغ المصروف والمبلغ الباقي جزآه.',
            'المبلغ المصروف: $2450 - 380 = 2070$ ، أي 2070 دج.',
          ] },
        ],
      },
      {
        label: '2)', title: 'ثمن القصص',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['ثمن القصص', 'بكم يزيد ثمن القاموس عن ثمن القصص؟'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tamthil-aqwas'],
            prompt: 'المبلغ المصروف هو الكلّ. ما جزآه؟',
            options: ['ثمن القاموس وثمن القصص', 'ثمن القاموس والمبلغ الباقي', 'المبلغ الذي جمعوه والمبلغ الباقي'],
            correct: 0,
            explain: 'التلاميذ صرفوا مالهم في شيئين: القاموس والقصص.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ikhtiyar-amaliya'],
            prompt: 'ثمن القصص:', expected: 795, suffix: 'دج',
            explain: 'ثمن القصص جزء: $2070 - 1275 = 795$.' },
          { kind: 'choice', role: 'translate', requires: ['farq-hadda'],
            prompt: 'المبلغ الذي يزيد به ثمن القاموس عن ثمن القصص هو:',
            options: ['فرق ثمن القاموس وثمن القصص (الأكبر ناقص الأصغر)', 'مجموع ثمن القاموس وثمن القصص', 'فرق ثمن القصص وثمن القاموس (الأصغر ناقص الأكبر)'],
            correct: 0,
            explain: 'ثمن القاموس هو الأكبر: هو الكلّ، وثمن القصص والزيادة جزآه، فالزيادة فرق.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['farq-hadda'],
            prompt: 'يزيد ثمن القاموس عن ثمن القصص بـ:', expected: 480, suffix: 'دج',
            explain: '$1275 - 795 = 480$.' },
          { kind: 'solution', ask: 0, lines: [
            'المبلغ المصروف هو مجموع ثمن القاموس وثمن القصص، إذن ثمن القصص: $2070 - 1275 = 795$ ، أي 795 دج.',
            'ثمن القاموس أكبر من ثمن القصص بـ: $1275 - 795 = 480$ ، أي 480 دج.',
          ] },
        ],
      },
      {
        label: '3)', title: 'لعبة الشطرنج',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['ما ثمن لعبة الشطرنج؟'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['ikhtiyar-amaliya'],
            prompt: 'المبلغ الباقي ينقصه 140 دج لشراء اللعبة. ثمن اللعبة هو:',
            options: ['الكلّ: المبلغ الباقي و 140 دج جزآه، فنجمع', 'جزء: نطرح 140 دج من الباقي لأنّ الكلمة «ينقصه»', 'لا يمكن معرفته من المعطيات'],
            correct: 0,
            explain: 'اللعبة أغلى من المبلغ الباقي بـ 140 دج: ثمنها هو الكلّ. الكلمة «ينقصه» تصف المبلغ، لا العملية.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ikhtiyar-amaliya'],
            prompt: 'ثمن لعبة الشطرنج:', expected: 520, suffix: 'دج',
            explain: '$380 + 140 = 520$.' },
          { kind: 'solution', ask: 0, lines: [
            'اللعبة أغلى من المبلغ الباقي: ثمنها هو الكلّ، والمبلغ الباقي وما ينقصه جزآه.',
            'ثمن لعبة الشطرنج: $380 + 140 = 520$ ، أي 520 دج.',
            'كلمة «ينقصه» تصف المبلغ الباقي، والعملية التي تعطي الكلّ هي الجمع.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — حافلة الرحلة المدرسية',
    context: 'المسافات في رحلة مدرسية',
    emoji: '🚌',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'route', from: 'المتوسطة', to: 'الحظيرة الطبيعية', distance: '68,4', unit: 'كيلومتر', vehicles: [{ icon: 'bus', at: 0 }], ariaLabel: 'حافلة تنطلق من المتوسطة نحو الحظيرة الطبيعية، والمسافة بينهما 68,4 كيلومتر' },
    statement: 'انطلقت حافلة رحلة مدرسية من المتوسطة على الساعة 8 صباحًا نحو حظيرة طبيعية، والمسافة بينهما $68{,}4\\,\\mathrm{km}$، وفيها 45 تلميذًا. توقّفت الحافلة في محطة استراحة بعد أن قطعت $27{,}85\\,\\mathrm{km}$، احترامًا لأوقات راحة السائق وحرصًا على سلامة التلاميذ.',
    data: [
      { id: 'dist', text: 'المسافة بين المتوسطة والحظيرة 68,4 كيلومتر', useful: true },
      { id: 'stop', text: 'قطعت الحافلة 27,85 كيلومتر قبل محطة الاستراحة', useful: true },
      { id: 'hour', text: 'انطلقت الحافلة على الساعة 8 صباحًا', useful: false },
      { id: 'kids', text: 'في الحافلة 45 تلميذًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'بعد محطة الاستراحة',
        question: 'احسب المسافة المتبقية بعد محطة الاستراحة.',
        asks: ['المسافة المتبقية بعد محطة الاستراحة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tamthil-aqwas'],
            prompt: 'في المخطط بأقواس للطريق كلّه:',
            options: ['المسافة 68,4 تحت الخطّ (الكلّ)، والمسافة المقطوعة والمسافة المتبقية فوقه', 'المسافة المتبقية تحت الخطّ (الكلّ)', 'المسافة المقطوعة تحت الخطّ (الكلّ)'],
            correct: 0,
            explain: 'الطريق كلّه من المتوسطة إلى الحظيرة هو الكلّ، ومحطة الاستراحة تقسمه إلى جزأين.' },
          { kind: 'choice', role: 'translate', requires: ['ikhtiyar-amaliya'],
            prompt: 'أيّ حساب يعطي المسافة المتبقية؟',
            options: ['$68{,}4 - 27{,}85$', '$68{,}4 + 27{,}85$', '$27{,}85 - 68{,}4$'],
            correct: 0, cols: 3,
            explain: 'المجهول جزء من الكلّ: نطرح من الكلّ الجزء الآخر.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ikhtiyar-amaliya'],
            prompt: 'المسافة المتبقية (بالكيلومتر):', expected: 40.55, suffix: 'km',
            explain: '$68{,}40 - 27{,}85 = 40{,}55$.' },
          { kind: 'solution', ask: 0, lines: [
            'الطريق كلّه هو الكلّ، والمسافة المقطوعة والمسافة المتبقية جزآه.',
            'المسافة المتبقية: $68{,}4 - 27{,}85 = 40{,}55\\,\\mathrm{km}$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'المقارنة بين المسافتين',
        question: 'بكم تزيد المسافة المتبقية عن المسافة المقطوعة قبل محطة الاستراحة؟',
        asks: ['بكم تزيد المسافة المتبقية عن المسافة المقطوعة؟'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['farq-hadda'],
            prompt: 'المقدار الذي تزيد به المسافة المتبقية هو:',
            options: ['فرق المسافة المتبقية والمسافة المقطوعة', 'مجموع المسافة المتبقية والمسافة المقطوعة', 'فرق الطريق كلّه والمسافة المتبقية'],
            correct: 0,
            explain: 'المسافة المتبقية هي الأطول: هي الكلّ، والمسافة المقطوعة والزيادة جزآه.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['farq-hadda'],
            prompt: 'تزيد المسافة المتبقية بـ (بالكيلومتر):', expected: 12.7, suffix: 'km',
            explain: '$40{,}55 - 27{,}85 = 12{,}7$.' },
          { kind: 'solution', ask: 0, lines: [
            'المسافة المتبقية أطول من المسافة المقطوعة، والزيادة هي فرقهما.',
            '$40{,}55 - 27{,}85 = 12{,}7$ : تزيد المسافة المتبقية بـ $12{,}7\\,\\mathrm{km}$.',
          ] },
        ],
      },
      {
        label: '3)', title: 'طريق العودة',
        question: 'في طريق العودة، سلك السائق طريقًا أقصر من طريق الذهاب بـ 5,6 كيلومتر. ما طول طريق العودة؟ وما مجموع المسافتين ذهابًا وإيابًا؟',
        asks: ['ما طول طريق العودة؟', 'ما مجموع المسافتين ذهابًا وإيابًا؟'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['ikhtiyar-amaliya'],
            prompt: '«طريق العودة أقصر من طريق الذهاب بـ 5,6 كيلومتر». في المخطط، طريق الذهاب هو:',
            options: ['الكلّ: طريق العودة و 5,6 جزآه، فنطرح', 'جزء: طريق العودة هو الكلّ، فنجمع'],
            correct: 0,
            explain: 'طريق الذهاب هو الأطول: هو الكلّ.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ikhtiyar-amaliya'],
            prompt: 'طول طريق العودة (بالكيلومتر):', expected: 62.8, suffix: 'km',
            explain: '$68{,}4 - 5{,}6 = 62{,}8$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['majmu-hadda'],
            prompt: 'مجموع المسافتين ذهابًا وإيابًا (بالكيلومتر):', expected: 131.2, suffix: 'km',
            explain: '$68{,}4 + 62{,}8 = 131{,}2$.' },
          { kind: 'solution', ask: 0, lines: [
            'طريق الذهاب هو الأطول: طول طريق العودة $68{,}4 - 5{,}6 = 62{,}8\\,\\mathrm{km}$.',
            'مجموع المسافتين: $68{,}4 + 62{,}8 = 131{,}2\\,\\mathrm{km}$.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — حملة جمع الملابس',
    context: 'أكثر بـ… أقلّ بـ…',
    emoji: '🧥',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'scene', icon: 'shirt', bg: 'green', chips: [{ label: 'القسم (أ)', value: '18,6', unit: 'kg', tone: 'blue' }, { label: '(ب) أكثر بـ', value: '4,75', unit: 'kg', tone: 'green' }, { label: '(ج) أقلّ من (ب) بـ', value: '7,2', unit: 'kg', tone: 'amber' }, { label: 'حمولة السيارة', value: 60, unit: 'kg', tone: 'rose' }], ariaLabel: 'حملة جمع الملابس: القسم (أ) 18,6 كيلوغرام، القسم (ب) أكثر بـ 4,75 كيلوغرام، القسم (ج) أقلّ من (ب) بـ 7,2 كيلوغرام، وحمولة السيارة 60 كيلوغرام' },
    statement: 'في حملة تضامنية لجمع الملابس الشتوية للمحتاجين شارك فيها 96 تلميذًا، جمع القسم (أ) $18{,}6\\,\\mathrm{kg}$ من الملابس، وجمع القسم (ب) أكثر من القسم (أ) بـ $4{,}75\\,\\mathrm{kg}$، أمّا القسم (ج) فجمع أقلّ من القسم (ب) بـ $7{,}2\\,\\mathrm{kg}$. ستنقل الجمعية الملابس في سيارة لا تحمل أكثر من $60\\,\\mathrm{kg}$ في الرحلة الواحدة.',
    data: [
      { id: 'a', text: 'جمع القسم (أ) 18,6 كيلوغرام', useful: true },
      { id: 'b', text: 'القسم (ب) جمع أكثر من القسم (أ) بـ 4,75 كيلوغرام', useful: true },
      { id: 'c', text: 'القسم (ج) جمع أقلّ من القسم (ب) بـ 7,2 كيلوغرام', useful: true },
      { id: 'car', text: 'السيارة لا تحمل أكثر من 60 كيلوغرام في الرحلة', useful: true },
      { id: 'pupils', text: 'شارك في الحملة 96 تلميذًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'القسم (ب)',
        question: 'احسب كتلة الملابس التي جمعها القسم (ب).',
        asks: ['كتلة ملابس القسم (ب)'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tamthil-aqwas'],
            prompt: '«جمع القسم (ب) أكثر من القسم (أ) بـ 4,75». في المخطط، كتلة القسم (ب):',
            options: ['تحت الخطّ: هي الكلّ، وكتلة (أ) و 4,75 جزآها', 'فوق الخطّ: هي جزء من كتلة (أ)', 'تحت الخطّ مع 4,75'],
            correct: 0,
            explain: 'القسم (ب) جمع أكثر: كتلته هي الكلّ.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ikhtiyar-amaliya'],
            prompt: 'كتلة ملابس القسم (ب) (بالكيلوغرام):', expected: 23.35, suffix: 'kg',
            explain: '$18{,}6 + 4{,}75 = 23{,}35$.' },
          { kind: 'solution', ask: 0, lines: [
            'كتلة القسم (ب) هي الكلّ: كتلة القسم (أ) و $4{,}75\\,\\mathrm{kg}$ جزآها.',
            'كتلة القسم (ب): $18{,}6 + 4{,}75 = 23{,}35\\,\\mathrm{kg}$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'القسم (ج)',
        question: 'احسب كتلة الملابس التي جمعها القسم (ج). عبّر عنها بجملة فيها كلمة «فرق».',
        asks: ['كتلة ملابس القسم (ج)', 'جملة فيها كلمة «فرق»'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['ikhtiyar-amaliya'],
            prompt: '«جمع القسم (ج) أقلّ من القسم (ب) بـ 7,2». كتلة القسم (ب) هي:',
            options: ['الكلّ: كتلة (ج) و 7,2 جزآها، فنطرح', 'جزء: كتلة (ج) هي الكلّ، فنجمع'],
            correct: 0,
            explain: 'القسم (ب) جمع أكثر من القسم (ج): كتلته هي الكلّ.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ikhtiyar-amaliya'],
            prompt: 'كتلة ملابس القسم (ج) (بالكيلوغرام):', expected: 16.15, suffix: 'kg',
            explain: '$23{,}35 - 7{,}2 = 16{,}15$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['farq-hadda'],
            prompt: 'أيّ جملة صحيحة؟',
            options: ['كتلة القسم (ج) هي فرق كتلة القسم (ب) و 7,2 كيلوغرام', 'كتلة القسم (ج) هي مجموع كتلة القسم (ب) و 7,2 كيلوغرام', 'كتلة القسم (ج) هي حدّ من حدّي الفرق'],
            correct: 0,
            explain: 'نتيجة طرح عددين تُسمّى فرقهما: $23{,}35 - 7{,}2$ هو فرق العددين 23,35 و 7,2.' },
          { kind: 'solution', ask: 0, lines: [
            'كتلة القسم (ب) هي الكلّ: كتلة القسم (ج): $23{,}35 - 7{,}2 = 16{,}15\\,\\mathrm{kg}$.',
            'كتلة ملابس القسم (ج) هي فرق العددين 23,35 و 7,2.',
          ] },
        ],
      },
      {
        label: '3)', title: 'رحلة السيارة',
        question: 'ما الكتلة الكلية للملابس التي جمعتها الأقسام الثلاثة؟ هل تكفي رحلة واحدة للسيارة؟ علّل.',
        asks: ['الكتلة الكلية للملابس', 'هل تكفي رحلة واحدة للسيارة؟'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['majmu-hadda'],
            prompt: 'الكتلة الكلية للملابس (بالكيلوغرام):', expected: 58.1, suffix: 'kg',
            explain: '$18{,}6 + 23{,}35 + 16{,}15 = 58{,}1$.' },
          { kind: 'choice', role: 'conclude', ask: 1,
            prompt: 'هل تكفي رحلة واحدة للسيارة؟',
            options: ['نعم: الكتلة الكلية أقلّ من 60 كيلوغرام', 'لا: الكتلة الكلية أكبر من 60 كيلوغرام', 'لا يمكن الحكم دون عدد التلاميذ'],
            correct: 0,
            explain: 'الكتلة الكلية أقلّ من $60\\,\\mathrm{kg}$: حمولة السيارة تكفي في رحلة واحدة.' },
          { kind: 'solution', ask: 0, lines: [
            'الكتلة الكلية هي مجموع الكتل الثلاث: $18{,}6 + 23{,}35 + 16{,}15 = 58{,}1\\,\\mathrm{kg}$.',
            '$58{,}1 < 60$ : تكفي رحلة واحدة للسيارة.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
