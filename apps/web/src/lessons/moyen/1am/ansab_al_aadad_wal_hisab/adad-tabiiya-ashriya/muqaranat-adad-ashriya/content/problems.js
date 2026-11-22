/**
 * Les trois « مسائل » du درس « مقارنة الأعداد العشرية وترتيبها » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas
 * à pas (GuidedProblem). Ajouts de la plateforme (`exam_style_problem`) : autres contextes, autres nombres que le manuel. La مسألة 1
 * (`LESSON_CONFIG.lessonProblem` : quatre paniers de pommes — comparer, ranger, le plus lourd) ; la 2 les réservoirs d'eau (deux écritures
 * du même nombre, ranger, le plus petit) ; la 3 les cartes de chiffres (le plus petit et le plus grand décimal, puis une comparaison).
 * Chaque nombre est vérifié dans ./problems.test.js en arithmétique décimale EXACTE.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — سلال التعاونية',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🧺',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'b1', text: 'كتلة السلة الأولى 3,25 كغ', useful: true },
      { id: 'b2', text: 'كتلة السلة الثانية 3,205 كغ', useful: true },
      { id: 'b3', text: 'كتلة السلة الثالثة 3,5 كغ', useful: true },
      { id: 'b4', text: 'كتلة السلة الرابعة 3,052 كغ', useful: true },
      { id: 'twelve', text: 'اشترى أحد الأولياء 12 تفاحة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'السلة الأولى والثانية',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['المقارنة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['itmam-asfar'],
            prompt: 'أيّ كتابة تتمّ $3{,}25$ بصفر حتى يصير لها عدد الأرقام نفسه بعد الفاصلة كالعدد $3{,}205$ ؟',
            options: ['$3{,}250$', '$3{,}025$', '$3{,}205$'],
            correct: 0, cols: 3,
            explain: 'نضيف الصفر في آخر الجزء العشري فلا يتغيّر العدد: $3{,}25=3{,}250$ . أمّا $3{,}025$ فعدد آخر.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['taqarun-rutab'],
            prompt: 'قارن بين $3{,}25$ و $3{,}205$ :',
            options: ['$3{,}25>3{,}205$', '$3{,}25<3{,}205$', '$3{,}25=3{,}205$'],
            correct: 0, cols: 1,
            explain: '$3{,}250$ و $3{,}205$ : 250 جزءًا من ألف أكثر من 205 أجزاء من ألف.' },
          { kind: 'solution', ask: 0, lines: [
            'الجزآن الصحيحان متساويان (3)؛ أعشار الأول 2 وأعشار الثاني 2: نتمّ بصفر لنقارن الأجزاء من مائة.',
            '$3{,}25=3{,}250$ و $3{,}205$ : $250>205$ ، إذن $3{,}25>3{,}205$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'ترتيب السلال الأربع',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الترتيب التصاعدي'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['itmam-asfar'], prompt: 'بعد إتمام الأعداد الأربعة إلى ثلاثة أرقام بعد الفاصلة، كم جزءًا من ألف في الجزء العشري للعدد $3{,}5$ ؟', expected: 500,
            explain: '$3{,}5=3{,}500$ : الجزء العشري 500 جزء من ألف.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tartib-silsila'],
            prompt: 'الترتيب التصاعدي لكتل السلال:',
            options: ['$3{,}052<3{,}205<3{,}25<3{,}5$', '$3{,}205<3{,}25<3{,}5<3{,}052$', '$3{,}5<3{,}25<3{,}205<3{,}052$'],
            correct: 0, cols: 1,
            explain: 'الأجزاء الصحيحة كلها 3؛ أعشار الأعداد: 0 و 2 و 2 و 5. ويفصل بين $3{,}205$ و $3{,}25$ رقم الأجزاء من مائة: 0 و 5.' },
          { kind: 'solution', ask: 0, lines: [
            'نتمّ الأعداد بأصفار: $3{,}250$ و $3{,}205$ و $3{,}500$ و $3{,}052$ .',
            'نقارن عددين طبيعيين من الأجزاء من ألف: $52<205<250<500$ .',
            '$3{,}052<3{,}205<3{,}25<3{,}5$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'السلة التي تُهدى',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['السلة الأثقل'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tartib-silsila'],
            prompt: 'السلة الأثقل هي صاحبة العدد الأكبر في الترتيب التصاعدي:',
            options: ['السلة الثالثة ($3{,}5$ كغ)', 'السلة الأولى ($3{,}25$ كغ)', 'السلة الثانية ($3{,}205$ كغ)'],
            correct: 0, cols: 1,
            explain: 'العدد الأكبر في الترتيب هو $3{,}5$ ، أي السلة الثالثة.' },
          { kind: 'solution', ask: 0, lines: [
            'الأكبر في الترتيب التصاعدي $3{,}052<3{,}205<3{,}25<3{,}5$ هو $3{,}5$ .',
            'تُهدى السلة الثالثة لدار المسنّين.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — خزّانات الماء',
    context: 'الاقتصاد في الماء',
    emoji: '💧',
    tone: 'emerald',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'الخزّانان الأول والثاني', icon: 'bottle', lines: [{ label: 'الأول', value: '12,5', unit: 'ل' }, { label: 'الثاني', value: '12,50', unit: 'ل' }] },
      { title: 'الخزّان الثالث', icon: 'bottle', lines: [{ label: 'الماء', value: '12,05', unit: 'ل' }] },
      { title: 'الخزّان الرابع', icon: 'bottle', lines: [{ label: 'الماء', value: '11,95', unit: 'ل' }] },
    ], ariaLabel: 'أربعة خزّانات فيها 12,5 و 12,50 و 12,05 و 11,95 لترات من الماء' },
    statement: 'يسجّل عمّال حديقة المدرسة كمية الماء في كل خزّان قبل السقي، حرصًا على عدم التبذير: في الخزّان الأول 12,5 لترات وفي الثاني 12,50 لترات وفي الثالث 12,05 لترات وفي الرابع 11,95 لترات. يسقون الحديقة ثلاث مرّات في الأسبوع.',
    data: [
      { id: 't1', text: 'في الخزّان الأول 12,5 لترات', useful: true },
      { id: 't2', text: 'في الخزّان الثاني 12,50 لترات', useful: true },
      { id: 't3', text: 'في الخزّان الثالث 12,05 لترات', useful: true },
      { id: 't4', text: 'في الخزّان الرابع 11,95 لترات', useful: true },
      { id: 'days', text: 'يسقون ثلاث مرّات في الأسبوع', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الأول والثاني',
        question: 'هل في الخزّانين الأول والثاني كمية الماء نفسها؟ علّل.',
        asks: ['المساواة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['itmam-asfar'],
            prompt: 'قارن بين $12{,}5$ و $12{,}50$ :',
            options: ['$12{,}5=12{,}50$ : الصفر الأخير لا يغيّر العدد', '$12{,}5<12{,}50$ : الثاني فيه رقم أكثر', '$12{,}5>12{,}50$ : الأول أقصر'],
            correct: 0, cols: 1,
            explain: 'بعد الفاصلة: 5 أعشار في الأول، و 5 أعشار وصفر جزء من مائة في الثاني: القطع نفسها.' },
          { kind: 'solution', ask: 0, lines: [
            '$12{,}50$ هو $12{,}5$ مكتوبًا بصفر زائد في آخره.',
            'نعم: في الخزّانين الكمية نفسها، $12{,}5=12{,}50$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'ثلاث كميات مختلفة',
        question: 'رتّب كميات الماء $12{,}5$ و $12{,}05$ و $11{,}95$ ترتيبًا تنازليًا.',
        asks: ['الترتيب التنازلي'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['taqarun-rutab'], prompt: 'العدد الأقل في أجزائه الصحيحة هو $11{,}95$ . ما جزؤه الصحيح؟', expected: 11,
            explain: 'الجزء الصحيح في $11{,}95$ هو 11، وفي العددين الآخرين 12.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tartib-silsila'],
            prompt: 'الترتيب التنازلي (من الأكبر إلى الأصغر):',
            options: ['$12{,}5>12{,}05>11{,}95$', '$12{,}05>12{,}5>11{,}95$', '$11{,}95>12{,}05>12{,}5$'],
            correct: 0, cols: 1,
            explain: '$11{,}95$ جزؤه الصحيح 11 فهو الأصغر؛ و $12{,}5$ رقم أعشاره 5 أكبر من رقم أعشار $12{,}05$ وهو 0.' },
          { kind: 'solution', ask: 0, lines: [
            '$11{,}95$ أصغرها لأنّ $11<12$ .',
            'الجزآن الصحيحان في $12{,}5$ و $12{,}05$ متساويان: الأعشار 5 و 0، و $5>0$ .',
            '$12{,}5>12{,}05>11{,}95$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'أقل من 12 لترًا',
        question: 'أيّ الخزّانات يحوي أقل من 12 لترًا؟',
        asks: ['الخزّان'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['taqarun-rutab'],
            prompt: 'قارن كل كمية بالعدد 12:',
            options: ['الخزّان الرابع فقط ($11{,}95<12$)', 'الخزّان الثالث ($12{,}05<12$)', 'الخزّانان الأول والثاني'],
            correct: 0, cols: 1,
            explain: '$11{,}95<12$ لأنّ جزؤه الصحيح 11 أقل من 12؛ أمّا الباقية فجزؤها الصحيح 12 ومعها كسر.' },
          { kind: 'solution', ask: 0, lines: [
            '$12{,}5$ و $12{,}50$ و $12{,}05$ أكبر من 12 (جزؤها الصحيح 12 ومعه جزء عشري).',
            'فقط $11{,}95<12$ : هو الخزّان الرابع.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — بطاقات الأرقام',
    context: 'ألعاب الحساب',
    emoji: '🧩',
    tone: 'violet',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'البطاقات', icon: 'book', lines: [{ label: 'الأرقام', value: '4 ، 0 ، 7 ، 1' }] },
      { title: 'الشرط', icon: 'crate', lines: [{ label: 'الفاصلة', value: 'واحدة' }] },
    ], ariaLabel: 'أربع بطاقات عليها الأرقام 4 و 0 و 7 و 1، ويضع كل لاعب فاصلة واحدة' },
    statement: 'في نادي الحساب بالمدرسة تلعب ليلى وأنيس بأربع بطاقات عليها الأرقام 4 و 0 و 7 و 1. يستعمل كل لاعب البطاقات الأربع كلها مرّة واحدة، ويضع فاصلة واحدة ليكوّن عددًا عشريًا لا يحوي صفرًا غير ضروري. يربح من يكوّن العدد الأكبر. يجتمع النادي كل خميس.',
    data: [
      { id: 'cards', text: 'البطاقات 4 و 0 و 7 و 1', useful: true },
      { id: 'one', text: 'فاصلة واحدة وبلا صفر غير ضروري', useful: true },
      { id: 'thursday', text: 'يجتمع النادي كل خميس', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'أصغر عدد',
        question: 'ما أصغر عدد عشري تستطيع ليلى تكوينه؟',
        asks: ['أصغر عدد'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tartib-silsila'], prompt: 'أصغر عدد عشري:', expected: 0.147, display: '0,147',
            explain: 'نضع الصفر في الجزء الصحيح ثم الأرقام من الأصغر إلى الأكبر في الأعشار وما بعدها: $0{,}147$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الجزء الصحيح الأصغر هو 0، وبعده الأرقام 1 ثم 4 ثم 7 من الأصغر إلى الأكبر.',
            'أصغر عدد: $0{,}147$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'أكبر عدد',
        question: 'ما أكبر عدد عشري يستطيع أنيس تكوينه؟',
        asks: ['أكبر عدد'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['itmam-asfar'],
            prompt: 'لماذا لا يكتب أنيس $741{,}0$ ؟',
            options: ['لأنّ الصفر الأخير بعد الفاصلة غير ضروري ($741{,}0=741$)', 'لأنّ $741{,}0$ أصغر من $740{,}1$', 'لأنّ الفاصلة لا توضع في آخر العدد'],
            correct: 0, cols: 1,
            explain: 'الصفر الأخير بعد الفاصلة لا يغيّر العدد، فلا يُكتب.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tartib-silsila'], prompt: 'أكبر عدد عشري:', expected: 740.1, display: '740,1',
            explain: 'الأرقام الكبرى في الجزء الصحيح أوّلًا: 7 ثم 4 ثم 0، ويبقى 1 بعد الفاصلة: $740{,}1$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نضع الأرقام الأكبر في المراتب الأعلى: $741{,}0$ مرفوض (صفر غير ضروري).',
            'فيكون أكبر عدد مسموح $740{,}1$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'من يربح؟',
        question: 'كوّنت ليلى $4{,}017$ وكوّن أنيس $4{,}107$ في دور آخر. من يربح؟',
        asks: ['الرابح'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['taqarun-rutab'],
            prompt: 'قارن بين $4{,}017$ و $4{,}107$ :',
            options: ['أنيس يربح: $4{,}107>4{,}017$', 'ليلى تربح: $4{,}017>4{,}107$', 'تعادل'],
            correct: 0, cols: 1,
            explain: 'الجزآن الصحيحان متساويان؛ أعشار الأول 0 وأعشار الثاني 1، و $1>0$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الجزآن الصحيحان 4 و 4 متساويان.',
            'أعشار $4{,}107$ هو 1 وأعشار $4{,}017$ هو 0، و $1>0$ ، إذن أنيس يربح.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
