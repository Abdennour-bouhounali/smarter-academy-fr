/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (modules 1 à 6) — des situations COMPLÈTES de type امتحان autour des trois leçons de l'unité 1
 * (جداء عددين نسبيين، جداء عدة أعداد نسبية، حاصل قسمة عددين نسبيين), résolues pas à pas (GuidedProblem) AVANT l'analyse (module 7) et la
 * situation évaluée (module 8). Ce sont des AJOUTS DE LA PLATEFORME (`addition('exam_style_problem')`) : l'intégration du manuel (la Lune, Vénus,
 * Mars) est REDESSINÉE en situation 1 (une nuit à l'Assekrem, nombres propres), le تحدّ ② en situation 5 ; les autres sont de la plateforme.
 * Aucune notion nouvelle : produits, quotients, séries avec priorités, et les acquis de 2AM (sommes, repère, moyenne). Aucune équation : l'inconnue
 * se trouve par un quotient (b × q = a) ou se vérifie par substitution. Chaque nombre est recalculé dans ./problems.test.js (BigInt).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const SOURCE = addition('exam_style_problem');
const S1 = src('integration', 20, 'أدمج تعلّماتي');
const S5 = src('challenge', 6, 'تحدّي');

export const PROBLEMS = [
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — ليلة في الأسكرام',
    context: 'تتبّع انخفاض الحرارة ليلًا',
    emoji: '🌡️',
    source: S1,
    tone: 'indigo',
    illustration: { kind: 'scene', icon: 'house', bg: 'blue', chips: [{ label: 'الساعة 18:00', value: 12, unit: '°C', tone: 'blue' }, { label: 'الانخفاض كل ساعة', value: '1,5', unit: '°C', tone: 'rose' }, { label: 'أعلى درجة في النهار', value: 18, unit: '°C', tone: 'amber' }], ariaLabel: 'هضبة الأسكرام: الحرارة عند السادسة مساءً وانخفاضها كل ساعة وأعلى درجة في النهار' },
    statement: 'في هضبة الأسكرام بالهقار كانت درجة الحرارة $12\\,^\\circ\\mathrm{C}$ عند الساعة 18:00، ثم أخذت تنخفض بانتظام $1{,}5\\,^\\circ\\mathrm{C}$ في كل ساعة حتى الساعة 4:00 صباحًا. وقد بلغت أعلى درجة في النهار $18\\,^\\circ\\mathrm{C}$.',
    data: [
      { id: 'start', text: 'الحرارة 12°C عند الساعة 18:00', useful: true },
      { id: 'rate', text: 'تنخفض 1,5°C في كل ساعة', useful: true },
      { id: 'max', text: 'أعلى درجة في النهار 18°C', useful: true },
      { id: 'place', text: 'الهضبة في الهقار', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الحرارة عند 23:00',
        question: 'ما درجة الحرارة عند الساعة 23:00؟',
        asks: ['درجة الحرارة عند 23:00'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['jidaa-nisbi'], prompt: 'التغيّر في الساعة الواحدة هو $-1{,}5$ . التغيّر الكلي بين 18:00 و 23:00 هو $(-1{,}5) \\times 5 =$', expected: -7.5, display: '−7,5',
            explain: 'إشارتان مختلفتان: الجداء سالب، و $1{,}5 \\times 5 = 7{,}5$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['majmu-jabri'], prompt: 'الحرارة عند 23:00 هي $12 + (-7{,}5) =$', expected: 4.5, display: '4,5', suffix: '°C',
            explain: '$12 - 7{,}5 = 4{,}5$ .' },
          { kind: 'solution', ask: 0, lines: ['بين 18:00 و 23:00 مرّت 5 ساعات: التغيّر $(-1{,}5) \\times 5 = -7{,}5$ .', 'الحرارة $12 + (-7{,}5) = 4{,}5\\,^\\circ\\mathrm{C}$ .'] },
        ],
      },
      {
        label: '2)', title: 'متى بلغت الصفر؟',
        question: 'بعد كم ساعة من الساعة 18:00 كانت الحرارة $0\\,^\\circ\\mathrm{C}$ ؟',
        asks: ['عدد الساعات'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['qisma-nisbi'], prompt: 'نريد انخفاضًا قدره $-12$ ، والتغيّر في الساعة $-1{,}5$ . عدد الساعات $h$ يحقّق:',
            options: ['$(-1{,}5) \\times h = -12$ ، أي $h = (-12) \\div (-1{,}5)$', '$(-1{,}5) \\times h = 12$ ، أي $h = 12 \\div (-1{,}5)$', '$h = 12 \\times (-1{,}5)$'], correct: 0,
            explain: 'من 12 إلى 0 تغيّر قدره $-12$ . العامل المجهول في جداء هو حاصل قسمة: $h = (-12) \\div (-1{,}5)$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qisma-nisbi'], prompt: '$(-12) \\div (-1{,}5) =$', expected: 8, suffix: 'ساعات',
            explain: 'للعددين الإشارة نفسها: الحاصل موجب. و $12 \\div 1{,}5 = 8$ . نتحقّق: $(-1{,}5) \\times 8 = -12$ .' },
          { kind: 'solution', ask: 0, lines: ['$(-1{,}5) \\times h = -12$ إذن $h = (-12) \\div (-1{,}5) = 8$ .', 'بعد 8 ساعات من 18:00، أي عند الساعة 2:00 صباحًا، كانت الحرارة $0\\,^\\circ\\mathrm{C}$ .'] },
        ],
      },
      {
        label: '3)', title: 'أدنى درجة والسعة الحرارية',
        question: 'احسب أدنى درجة عند الساعة 4:00، ثم السعة الحرارية لهذا اليوم (الفارق بين أعلى درجة وأدنى درجة).',
        asks: ['أدنى درجة', 'السعة الحرارية'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['majmu-jabri'], prompt: 'من 18:00 إلى 4:00 صباحًا مرّت كم ساعة؟', expected: 10, suffix: 'ساعات',
            explain: 'من 18:00 إلى منتصف الليل 6 ساعات، ثم 4 ساعات: $6 + 4 = 10$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jidaa-nisbi'], prompt: 'أدنى درجة: $12 + (-1{,}5) \\times 10 =$', expected: -3, display: '−3', suffix: '°C',
            explain: '$(-1{,}5) \\times 10 = -15$ ثم $12 + (-15) = -3$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['majmu-jabri'], prompt: 'السعة الحرارية: $18 - (-3) =$', expected: 21, suffix: '°C',
            explain: 'طرح عدد سالب هو جمع نظيره: $18 + 3 = 21$ .' },
          { kind: 'solution', ask: 0, lines: ['الانخفاض خلال 10 ساعات: $(-1{,}5) \\times 10 = -15$ ، فالأدنى $12 + (-15) = -3\\,^\\circ\\mathrm{C}$ .', 'السعة الحرارية $= 18 - (-3) = 21\\,^\\circ\\mathrm{C}$ .'] },
        ],
      },
      {
        label: '4)', title: 'بالكلفن',
        question: 'ما أدنى درجة بالكلفن؟',
        asks: ['أدنى درجة بالكلفن'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['majmu-jabri'], prompt: 'للانتقال من سيلسيوس إلى كلفن نضيف $273{,}15$ . العملية المناسبة هنا:',
            options: ['$-3 + 273{,}15$', '$-3 \\times 273{,}15$', '$273{,}15 - (-3) \\times (-1)$'], correct: 0,
            explain: 'القاعدة جمع: نضيف $273{,}15$ إلى الدرجة بالسيلسيوس، مهما كانت إشارتها.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['majmu-jabri'], prompt: '$-3 + 273{,}15 =$', expected: 270.15, display: '270,15', suffix: 'K',
            explain: '$273{,}15 - 3 = 270{,}15$ .' },
          { kind: 'solution', ask: 0, lines: ['الكلفن $= -3 + 273{,}15$ .', 'أدنى درجة هي $270{,}15\\,\\mathrm{K}$ .'] },
        ],
      },
      {
        label: '5)', title: 'المتوسّط',
        question: 'ما متوسّط أعلى درجة وأدنى درجة؟',
        asks: ['المتوسّط بالسيلسيوس'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['majmu-jabri'], prompt: 'مجموع الدرجتين: $18 + (-3) =$', expected: 15, explain: '$18 - 3 = 15$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qisma-nisbi'], prompt: 'المتوسّط $= 15 \\div 2 =$', expected: 7.5, display: '7,5', suffix: '°C',
            explain: '$15 \\div 2 = 7{,}5$ .' },
          { kind: 'solution', ask: 0, lines: ['المتوسّط هو مجموع الدرجتين مقسومًا على 2: $(18 + (-3)) \\div 2$ .', '$15 \\div 2 = 7{,}5\\,^\\circ\\mathrm{C}$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — رصيد جمعية الحيّ',
    context: 'تغيّر رصيد في المستقبل وفي الماضي',
    emoji: '🏘️',
    source: SOURCE,
    tone: 'emerald',
    illustration: { kind: 'scene', icon: 'coin', bg: 'green', chips: [{ label: 'يُدفع كل أسبوع', value: 750, unit: 'DA', tone: 'rose' }, { label: 'يُتلقّى كل أسبوع', value: 450, unit: 'DA', tone: 'green' }, { label: 'الرصيد اليوم', value: 5400, unit: 'DA', tone: 'amber' }], ariaLabel: 'رصيد جمعية الحيّ والمبالغ التي تدفعها وتتلقّاها كل أسبوع' },
    statement: 'تدفع جمعية الحيّ 750 DA في كل أسبوع لكراء القاعة، وتتلقّى 450 DA من الاشتراكات. رصيدها اليوم 5400 DA.',
    data: [
      { id: 'rent', text: 'تدفع 750 DA كل أسبوع', useful: true },
      { id: 'subs', text: 'تتلقّى 450 DA كل أسبوع', useful: true },
      { id: 'bal', text: 'رصيدها اليوم 5400 DA', useful: true },
      { id: 'hall', text: 'القاعة تُستعمل للاجتماعات', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'التغيّر الأسبوعي',
        question: 'ما تغيّر الرصيد في كل أسبوع؟',
        asks: ['التغيّر الأسبوعي'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['majmu-jabri'], prompt: 'الدفع يُعدّ تغيّرًا سالبًا: $-750 + 450 =$', expected: -300, display: '−300', suffix: 'DA',
            explain: '$-750 + 450 = -300$ : ينقص الرصيد 300 DA كل أسبوع.' },
          { kind: 'solution', ask: 0, lines: ['ما تدفعه $-750$ وما تتلقّاه $+450$ .', 'التغيّر الأسبوعي $= -750 + 450 = -300$ DA.'] },
        ],
      },
      {
        label: '2)', title: 'بعد 6 أسابيع',
        question: 'ما رصيد الجمعية بعد 6 أسابيع؟',
        asks: ['الرصيد بعد 6 أسابيع'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['jidaa-nisbi'], prompt: 'التغيّر الكلي: $(-300) \\times 6 =$', expected: -1800, display: '−1800', explain: 'إشارتان مختلفتان: سالب. و $300 \\times 6 = 1800$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['majmu-jabri'], prompt: 'الرصيد: $5400 + (-1800) =$', expected: 3600, suffix: 'DA', explain: '$5400 - 1800 = 3600$ .' },
          { kind: 'solution', ask: 0, lines: ['التغيّر خلال 6 أسابيع: $(-300) \\times 6 = -1800$ .', 'الرصيد $= 5400 + (-1800) = 3600$ DA.'] },
        ],
      },
      {
        label: '3)', title: 'قبل 6 أسابيع',
        question: 'ما كان رصيد الجمعية قبل 6 أسابيع إن كان الحال كذلك؟',
        asks: ['الرصيد قبل 6 أسابيع'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['jidaa-nisbi'], prompt: 'الماضي يُمثَّل بعدد أسابيع سالب. التغيّر بين ذلك الوقت واليوم هو:',
            options: ['$(-300) \\times (-6)$ ، أي $+1800$ : الرصيد كان أكبر', '$(-300) \\times 6$ ، أي $-1800$ : الرصيد كان أصغر', '$(-300) \\div 6$'], correct: 0,
            explain: 'قبل 6 أسابيع معناه $-6$ أسابيع. وجداء عددين سالبين موجب: $(-300) \\times (-6) = 1800$ ، فالرصيد القديم أكبر باليوم.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['majmu-jabri'], prompt: 'الرصيد قبل 6 أسابيع: $5400 + (-300) \\times (-6) =$', expected: 7200, suffix: 'DA', explain: '$5400 + 1800 = 7200$ . نتحقّق: $7200 - 6 \\times 300 = 5400$ .' },
          { kind: 'solution', ask: 0, lines: ['قبل 6 أسابيع: $(-300) \\times (-6) = 1800$ .', 'الرصيد $= 5400 + 1800 = 7200$ DA.'] },
        ],
      },
      {
        label: '4)', title: 'متى ينفد الرصيد؟',
        question: 'بعد كم أسبوعًا ينفد الرصيد إن بقي الحال كذلك؟',
        asks: ['عدد الأسابيع'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['qisma-nisbi'], prompt: 'ينفد الرصيد حين يتغيّر بمقدار $-5400$ ، أي حين $(-300) \\times n = -5400$ . إذن:',
            options: ['$n = (-5400) \\div (-300)$', '$n = (-5400) \\times (-300)$', '$n = (-300) \\div (-5400)$'], correct: 0,
            explain: 'العامل المجهول هو حاصل القسمة: $n = (-5400) \\div (-300)$ ، والترتيب مهم.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qisma-nisbi'], prompt: '$(-5400) \\div (-300) =$', expected: 18, suffix: 'أسبوعًا', explain: 'الإشارة نفسها: موجب. و $5400 \\div 300 = 18$ . نتحقّق: $(-300) \\times 18 = -5400$ .' },
          { kind: 'solution', ask: 0, lines: ['$(-300) \\times n = -5400$ إذن $n = (-5400) \\div (-300) = 18$ .', 'ينفد الرصيد بعد 18 أسبوعًا.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — خريطة الكنز',
    context: 'إحداثيات نقط وجداءات',
    emoji: '🗺️',
    source: SOURCE,
    tone: 'amber',
    statement: 'على خريطة كنز مرسومة في معلم متعامد ومتجانس كما في الشكل، علّم الرحّالة النقط $A(-3\\,;\\,2)$ و $B(4\\,;\\,-1)$ و $C(-2\\,;\\,-5)$ .',
    figure: {
      grid: true,
      axes: { every: 1 },
      points: { A: [-3, 2], B: [4, -1], C: [-2, -5], O: [0, 0] },
      labels: { A: 'nw', B: 'ne', C: 'sw', O: 'ne' },
      ariaLabel: 'خريطة كنز في معلم متعامد ومتجانس عليها النقط A و B و C والمبدأ O',
      maxWidth: 360,
    },
    data: [
      { id: 'pts', text: 'النقط A و B و C على الخريطة', useful: true },
      { id: 'rule', text: 'فاصلة الكنز وترتيبه يُحسبان بجداء وحاصل قسمة', useful: true },
      { id: 'map', text: 'الخريطة قديمة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'قراءة الإحداثيات',
        question: 'عيّن إحداثيي النقطتين B و C من الشكل.',
        asks: ['إحداثيا B و C'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['ihdathiyat'], prompt: 'فاصلة النقطة B:', expected: 4, explain: 'B على يمين محور التراتيب بأربع وحدات.' },
          { kind: 'numeric', role: 'compute', requires: ['ihdathiyat'], prompt: 'ترتيب النقطة C:', expected: -5, display: '−5', explain: 'C تحت محور الفواصل بخمس وحدات.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ihdathiyat'], prompt: 'إحداثيا B و C هما:',
            options: ['$B(4\\,;\\,-1)$ و $C(-2\\,;\\,-5)$', '$B(-1\\,;\\,4)$ و $C(-5\\,;\\,-2)$', '$B(4\\,;\\,1)$ و $C(2\\,;\\,-5)$'], correct: 0, cols: 1,
            explain: 'الفاصلة أوّلًا ثم الترتيب. $B$ تحت المحور الأفقي بوحدة: ترتيبها $-1$ ، و $C$ على يسار المحور الرأسي: فاصلتها $-2$ .' },
          { kind: 'solution', ask: 0, lines: ['نقرأ الفاصلة على المحور الأفقي ثم الترتيب على المحور الرأسي.', '$B(4\\,;\\,-1)$ و $C(-2\\,;\\,-5)$ .'] },
        ],
      },
      {
        label: '2)', title: 'نظيرة بالنسبة إلى المبدأ',
        question: 'اضرب كلًّا من فاصلة A وترتيبها في $-1$ فتحصل على A′. ما إحداثيا A′؟ وما علاقتها بـ A؟',
        asks: ['إحداثيا A′', 'علاقة A′ بـ A'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['jidaa-nisbi'], prompt: 'فاصلة A′: $(-3) \\times (-1) =$', expected: 3, explain: '$(-3) \\times (-1) = 3$ : ضرب في $-1$ يعطي المعاكس.' },
          { kind: 'numeric', role: 'compute', requires: ['jidaa-nisbi'], prompt: 'ترتيب A′: $2 \\times (-1) =$', expected: -2, display: '−2', explain: '$2 \\times (-1) = -2$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ihdathiyat'], prompt: 'إحداثيا A′ هما:', options: ['$(3\\,;\\,-2)$', '$(3\\,;\\,2)$', '$(-3\\,;\\,-2)$'], correct: 0, explain: 'الفاصلة $3$ والترتيب $-2$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['jidaa-nisbi'], prompt: 'النقطة A′ هي:',
            options: ['نظيرة A بالنسبة إلى المبدأ O', 'نظيرة A بالنسبة إلى محور الفواصل', 'نظيرة A بالنسبة إلى محور التراتيب'], correct: 0, cols: 1,
            explain: 'تغيّرت إشارتا الإحداثيين معًا: النقطتان متقابلتان على الاستقامة نفسها المارّة بالمبدأ وعلى بعدين متساويين منه.' },
          { kind: 'solution', ask: 0, lines: ['$A′(3\\,;\\,-2)$ لأنّ $(-3) \\times (-1) = 3$ و $2 \\times (-1) = -2$ .', 'تتغيّر إشارتا الإحداثيين: A′ نظيرة A بالنسبة إلى المبدأ.'] },
        ],
      },
      {
        label: '3)', title: 'تغيير إشارة الفاصلة فقط',
        question: 'اضرب فاصلة A وحدها في $-1$ فتحصل على A″. ما إحداثيا A″؟ وما علاقتها بـ A؟',
        asks: ['إحداثيا A″', 'علاقة A″ بـ A'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jidaa-nisbi'], prompt: 'إحداثيا A″ هما:', options: ['$(3\\,;\\,2)$', '$(3\\,;\\,-2)$', '$(-3\\,;\\,-2)$'], correct: 0,
            explain: 'الفاصلة $(-3) \\times (-1) = 3$ ، والترتيب لم يتغيّر: $2$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['ihdathiyat'], prompt: 'النقطة A″ هي:',
            options: ['نظيرة A بالنسبة إلى محور التراتيب', 'نظيرة A بالنسبة إلى محور الفواصل', 'نظيرة A بالنسبة إلى المبدأ O'], correct: 0, cols: 1,
            explain: 'الترتيب باقٍ والفاصلة تغيّرت إشارتها: النقطتان على المستوى نفسه من الأفق وعلى جانبي المحور الرأسي.' },
          { kind: 'solution', ask: 0, lines: ['$(-3) \\times (-1) = 3$ والترتيب $2$ على حاله: $A″(3\\,;\\,2)$ .', 'A″ نظيرة A بالنسبة إلى محور التراتيب.'] },
        ],
      },
      {
        label: '4)', title: 'موقع الكنز',
        question: 'فاصلة الكنز T هي $x_A \\times y_B$ ، وترتيبه $(y_A \\times y_C) \\div x_C$ . عيّن إحداثيي T.',
        asks: ['إحداثيا T'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['jidaa-nisbi'], prompt: 'فاصلة T: $x_A \\times y_B = (-3) \\times (-1) =$', expected: 3, explain: 'العددان سالبان: الجداء موجب.' },
          { kind: 'numeric', role: 'compute', requires: ['jidaa-nisbi'], prompt: 'البسط: $y_A \\times y_C = 2 \\times (-5) =$', expected: -10, display: '−10', explain: 'إشارتان مختلفتان: الجداء سالب.' },
          { kind: 'numeric', role: 'compute', requires: ['qisma-nisbi'], prompt: 'ترتيب T: $(-10) \\div (-2) =$', expected: 5, explain: 'الإشارة نفسها: الحاصل موجب. نتحقّق: $(-2) \\times 5 = -10$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ihdathiyat'], prompt: 'إحداثيا الكنز:', options: ['$T(3\\,;\\,5)$', '$T(5\\,;\\,3)$', '$T(3\\,;\\,-5)$'], correct: 0, explain: 'الفاصلة أوّلًا: $3$ ثم الترتيب $5$ .' },
          { kind: 'solution', ask: 0, lines: ['فاصلة T: $(-3) \\times (-1) = 3$ ، وترتيبه: $(2 \\times (-5)) \\div (-2) = (-10) \\div (-2) = 5$ .', '$T(3\\,;\\,5)$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — مسابقة الأسئلة',
    context: 'نقاط بأعداد نسبية ومتوسّط',
    emoji: '🏆',
    source: SOURCE,
    tone: 'sky',
    illustration: { kind: 'scene', icon: 'pen', bg: 'amber', chips: [{ label: 'عدد الأسئلة', value: 20, tone: 'slate' }, { label: 'إجابة صحيحة', value: 5, unit: 'نقاط', tone: 'green' }, { label: 'إجابة خاطئة', value: 3, unit: 'نقاط', tone: 'rose' }], ariaLabel: 'مسابقة من عشرين سؤالًا: نقاط الإجابة الصحيحة وخسارة الإجابة الخاطئة' },
    statement: 'مسابقة في المدرسة من 20 سؤالًا: يربح المتسابق +5 نقاط عن كل إجابة صحيحة، ويخسر 3 نقاط (أي −3) عن كل إجابة خاطئة، ولا يتغيّر شيء (0) عن سؤال بلا إجابة.',
    data: [
      { id: 'ok', text: '+5 للإجابة الصحيحة', useful: true },
      { id: 'ko', text: '−3 للإجابة الخاطئة', useful: true },
      { id: 'blank', text: '0 لسؤال بلا إجابة', useful: true },
      { id: 'year', text: 'المسابقة بين تلاميذ السنة الثالثة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'نقطة أيّوب',
        question: 'أجاب أيّوب إجابة صحيحة عن 12 سؤالًا، وخاطئة عن 6 أسئلة، وترك سؤالين. ما نقطته؟',
        asks: ['نقطة أيّوب'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['jidaa-nisbi'], prompt: 'ما ربحه: $12 \\times 5 =$', expected: 60, explain: '$12 \\times 5 = 60$ .' },
          { kind: 'numeric', role: 'compute', requires: ['jidaa-nisbi'], prompt: 'ما خسره: $6 \\times (-3) =$', expected: -18, display: '−18', explain: 'إشارتان مختلفتان: الجداء سالب.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['majmu-jabri'], prompt: 'نقطته: $60 + (-18) + 0 =$', expected: 42, explain: '$60 - 18 = 42$ .' },
          { kind: 'solution', ask: 0, lines: ['$12 \\times 5 + 6 \\times (-3) + 2 \\times 0 = 60 - 18 + 0$ .', 'نقطة أيّوب $42$ .'] },
        ],
      },
      {
        label: '2)', title: 'نقطتا إيناس ورانية',
        question: 'أجابت إيناس صحيحًا عن 14 سؤالًا وخطأً عن 6 أسئلة. وأجابت رانية صحيحًا عن 11 سؤالًا وخطأً عن 5 أسئلة وتركت 4 أسئلة. ما نقطة كل منهما؟',
        asks: ['نقطة إيناس', 'نقطة رانية'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jidaa-nisbi'], prompt: 'إيناس: $14 \\times 5 + 6 \\times (-3) =$', expected: 52, explain: '$70 - 18 = 52$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['jidaa-nisbi'], prompt: 'رانية: $11 \\times 5 + 5 \\times (-3) =$', expected: 40, explain: '$55 - 15 = 40$ .' },
          { kind: 'solution', ask: 0, lines: ['إيناس: $14 \\times 5 + 6 \\times (-3) = 70 - 18 = 52$ .', 'رانية: $11 \\times 5 + 5 \\times (-3) = 55 - 15 = 40$ .'] },
        ],
      },
      {
        label: '3)', title: 'نقطة أمين',
        question: 'نقطة أمين $-6$ ولم يُجب صحيحًا عن أيّ سؤال. كم سؤالًا أخطأ؟',
        asks: ['عدد الأسئلة الخاطئة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['qisma-nisbi'], prompt: 'إن أخطأ في $n$ سؤالًا فنقطته $(-3) \\times n$ . إذن:',
            options: ['$(-3) \\times n = -6$ ، أي $n = (-6) \\div (-3)$', '$(-3) + n = -6$ ، أي $n = -6 - 3$', '$n = (-3) \\times (-6)$'], correct: 0,
            explain: 'لا ربح له: كل نقطته من الأسئلة الخاطئة. العامل المجهول هو حاصل القسمة.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qisma-nisbi'], prompt: '$(-6) \\div (-3) =$', expected: 2, suffix: 'سؤالان', explain: 'الإشارة نفسها: الحاصل موجب. نتحقّق: $(-3) \\times 2 = -6$ .' },
          { kind: 'solution', ask: 0, lines: ['$(-3) \\times n = -6$ إذن $n = (-6) \\div (-3) = 2$ .', 'أخطأ أمين في سؤالين.'] },
        ],
      },
      {
        label: '4)', title: 'المتوسّط',
        question: 'ما متوسّط نقاط المتسابقين الأربعة؟',
        asks: ['متوسّط النقاط'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['majmu-jabri'], prompt: 'مجموع النقاط: $42 + 52 + 40 + (-6) =$', expected: 128, explain: '$42 + 52 + 40 = 134$ ثم $134 - 6 = 128$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qisma-nisbi'], prompt: 'المتوسّط: $128 \\div 4 =$', expected: 32, explain: '$128 \\div 4 = 32$ .' },
          { kind: 'solution', ask: 0, lines: ['المجموع $42 + 52 + 40 + (-6) = 128$ .', 'المتوسّط $128 \\div 4 = 32$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — تفكيك −36',
    context: 'كل كتابات عدد سالب على شكل جداء',
    emoji: '🧩',
    source: S5,
    tone: 'violet',
    illustration: { kind: 'scene', icon: 'tile', bg: 'violet', chips: [{ label: 'الجداء المطلوب', value: '−36', tone: 'violet' }], ariaLabel: 'تفكيك العدد سالب ستة وثلاثين إلى جداء عددين صحيحين نسبيين' },
    statement: 'نريد كتابة العدد $-36$ على شكل جداء عددين صحيحين نسبيين، بكل الطرق الممكنة ودون اعتبار الترتيب.',
    data: [
      { id: 'target', text: 'الجداء المطلوب هو −36', useful: true },
      { id: 'int', text: 'العاملان عددان صحيحان نسبيان', useful: true },
      { id: 'order', text: 'الترتيب غير مهم', useful: true },
      { id: 'sum', text: 'مجموع العاملين غير معطى', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'كل التفكيكات',
        question: 'كم طريقة لكتابة $-36$ جداءً لعددين صحيحين نسبيين؟',
        asks: ['عدد الطرق'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['jidaa-nisbi'], prompt: 'جداء $-36$ سالب، إذن العاملان:',
            options: ['أحدهما سالب والآخر موجب، ومسافتاهما جداؤهما 36', 'سالبان معًا', 'موجبان معًا'], correct: 0,
            explain: 'جداء سالب معناه إشارتان مختلفتان، والجداء بالمسافات $|a| \\times |b| = 36$ .' },
          { kind: 'choice', role: 'translate', requires: ['jidaa-nisbi'], prompt: 'أيّ هذه الكتابات ليس تفكيكًا للعدد $-36$ ؟',
            options: ['$(-5) \\times 8$', '$(-4) \\times 9$', '$4 \\times (-9)$', '$(-18) \\times 2$'], correct: 0,
            explain: '$(-5) \\times 8 = -40$ . أمّا الأخرى فجداؤها $-36$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jidaa-nisbi'], prompt: 'قواسم 36 الموجبة هي 1 و 2 و 3 و 4 و 6 و 9 و 12 و 18 و 36 ، وفي كل تفكيك عامل سالب مسافته أحد هذه القواسم. عدد الطرق:', expected: 9, suffix: 'طرق',
            explain: 'لكل قاسم $d$ تفكيك $(-d) \\times \\frac{36}{d}$ : تسعة تفكيكات، منها $(-6) \\times 6$ .' },
          { kind: 'solution', ask: 0, lines: ['$(-1) \\times 36$ ، $1 \\times (-36)$ ، $(-2) \\times 18$ ، $2 \\times (-18)$ ، $(-3) \\times 12$ ، $3 \\times (-12)$ .', '$(-4) \\times 9$ ، $4 \\times (-9)$ ، $(-6) \\times 6$ : تسع طرق.'] },
        ],
      },
      {
        label: '2)', title: 'أصغر مجموع',
        question: 'أيّ تفكيك مجموع عامليه أصغر ما يمكن؟',
        asks: ['التفكيك ذو أصغر مجموع'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['majmu-jabri'], prompt: 'مجموع عاملي $1 \\times (-36)$ هو $1 + (-36) =$', expected: -35, display: '−35', explain: '$1 - 36 = -35$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['majmu-jabri'], prompt: 'التفكيك الأصغر مجموعًا:', options: ['$1 \\times (-36)$', '$(-1) \\times 36$', '$(-4) \\times 9$', '$(-6) \\times 6$'], correct: 0,
            explain: 'مجاميعها على الترتيب: $-35$ و $35$ و $5$ و $0$ . أصغرها $-35$ .' },
          { kind: 'solution', ask: 0, lines: ['$1 + (-36) = -35$ و $(-1) + 36 = 35$ و $(-4) + 9 = 5$ و $(-6) + 6 = 0$ .', 'أصغر مجموع هو $-35$ ، تفكيكه $1 \\times (-36)$ .'] },
        ],
      },
      {
        label: '3)', title: 'مجموع معدوم',
        question: 'أيّ تفكيك مجموع عامليه معدوم؟',
        asks: ['التفكيك ذو المجموع المعدوم'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['jidaa-ida'], prompt: 'مجموع معدوم يعني أنّ العاملين متعاكسان $x$ و $-x$ ، وجداؤهما $-x^2 = -36$ ، أي أنّ مربع $x$ هو 36. أحد قيم $x$ الموجبة:', expected: 6, explain: '$6 \\times 6 = 36$ ، فالعاملان $6$ و $-6$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jidaa-ida'], prompt: 'التفكيك ذو المجموع المعدوم:', options: ['$(-6) \\times 6$', '$(-9) \\times 4$', '$(-3) \\times 12$'], correct: 0,
            explain: '$(-6) + 6 = 0$ ، وجداؤهما $(-6) \\times 6 = -36$ .' },
          { kind: 'solution', ask: 0, lines: ['عاملان متعاكسان $x$ و $-x$ جداؤهما $-x^2$ ، والمطلوب $x^2 = 36$ إذن $x = 6$ .', 'التفكيك $(-6) \\times 6$ .'] },
        ],
      },
      {
        label: '4)', title: 'ثلاثة عوامل سالبة',
        question: 'أيّ كتابة تعطي $-36$ جداءً لثلاثة أعداد صحيحة سالبة؟',
        asks: ['الكتابة المطلوبة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['jidaa-ida'], prompt: 'جداء ثلاثة أعداد سالبة هو:', options: ['سالب، لأنّ عدد العوامل السالبة فردي', 'موجب لأنّ عدد العوامل 3', 'معدوم'], correct: 0,
            explain: 'عدد فردي من العوامل السالبة: الجداء سالب.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jidaa-ida'], prompt: 'الجداء الذي يساوي $-36$ بثلاثة عوامل سالبة:', options: ['$(-1) \\times (-4) \\times (-9)$', '$(-1) \\times (-4) \\times 9$', '$(-3) \\times (-3) \\times (-5)$'], correct: 0, cols: 1,
            explain: '$(-1) \\times (-4) = 4$ ثم $4 \\times (-9) = -36$ . الثاني يساوي $36$ لأنّ فيه عاملين سالبين فقط، والثالث $-45$ .' },
          { kind: 'solution', ask: 0, lines: ['$(-1) \\times (-4) \\times (-9) = 4 \\times (-9) = -36$ .', 'ثلاثة عوامل سالبة (عدد فردي): الجداء سالب. وكتابة أخرى ممكنة: $(-2) \\times (-3) \\times (-6)$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — ورقة إجابات رياض',
    context: 'أحكم على حسابات زميل وأصحّحها',
    emoji: '📝',
    source: SOURCE,
    tone: 'rose',
    illustration: { kind: 'scene', icon: 'pen', bg: 'rose', chips: [{ label: 'عدد الإجابات', value: 5, tone: 'rose' }, { label: 'نقطة لكل إجابة صحيحة', value: 1, tone: 'green' }], ariaLabel: 'ورقة رياض: خمس إجابات تُمنح نقطة عن كل إجابة صحيحة' },
    statement: 'قدّم رياض ورقة بخمس إجابات: (a) $(-3) \\times (-5) = -15$ ، (b) $(-2)^2 = -4$ ، (c) $(-24) \\div (-6) = 4$ ، (d) $6 - 2 \\times (-3) = -12$ ، (e) $(-1) \\times (-1) \\times (-1) \\times (-1) \\times (-1) = -1$ . يمنح الأستاذ نقطة عن كل إجابة صحيحة.',
    data: [
      { id: 'a', text: 'الإجابات الخمس (a) إلى (e)', useful: true },
      { id: 'mark', text: 'نقطة عن كل إجابة صحيحة', useful: true },
      { id: 'who', text: 'رياض تلميذ في القسم نفسه', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'صحيح أم خاطئ؟',
        question: 'احكم على كل إجابة من الإجابات الخمس.',
        asks: ['الحكم على الإجابات الخمس'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['jidaa-nisbi', 'jidaa-ida', 'qisma-nisbi', 'awlawiya-amaliyat'], prompt: 'اختر الحكم:',
            rows: [
              { label: '$(-3) \\times (-5) = -15$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'عددان سالبان: الجداء موجب $15$ .' },
              { label: '$(-2)^2 = -4$', options: ['صحيح', 'خطأ'], correct: 1, correction: '$(-2)^2 = (-2) \\times (-2) = 4$ : المربع غير سالب.' },
              { label: '$(-24) \\div (-6) = 4$', options: ['صحيح', 'خطأ'], correct: 0, correction: 'الإشارة نفسها: موجب. و $(-6) \\times 4 = -24$ .' },
              { label: '$6 - 2 \\times (-3) = -12$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'الضرب أوّلًا: $6 - (-6) = 12$ .' },
              { label: '$(-1) \\times (-1) \\times (-1) \\times (-1) \\times (-1) = -1$', options: ['صحيح', 'خطأ'], correct: 0, correction: 'خمسة عوامل سالبة (عدد فردي): الجداء سالب.' },
            ] },
          { kind: 'solution', ask: 0, lines: ['(a) خطأ، (b) خطأ، (c) صحيح، (d) خطأ، (e) صحيح.', 'نتحقّق من كل واحدة بقاعدة الإشارات وأولوية العمليات.'] },
        ],
      },
      {
        label: '2)', title: 'تصحيح الخاطئة',
        question: 'ما القيمة الصحيحة في الإجابتين (a) و (b)؟ وما قيمة الإجابة (d) الصحيحة، وما سبب خطأ رياض فيها؟',
        asks: ['القيمة الصحيحة في (a)', 'القيمة الصحيحة في (b)', 'القيمة الصحيحة في (d)', 'سبب الخطأ في (d)'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jidaa-nisbi'], prompt: '$(-3) \\times (-5) =$', expected: 15, explain: 'عددان سالبان: الجداء موجب.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['jidaa-ida'], prompt: '$(-2)^2 =$', expected: 4, explain: '$(-2) \\times (-2) = 4$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['awlawiya-amaliyat'], prompt: '$6 - 2 \\times (-3) =$', expected: 12, explain: 'الضرب أوّلًا: $2 \\times (-3) = -6$ ثم $6 - (-6) = 12$ .' },
          { kind: 'choice', role: 'conclude', ask: 3, requires: ['awlawiya-amaliyat'], prompt: 'لقد حسب رياض $(6 - 2) \\times (-3) = -12$ . خطؤه:',
            options: ['أجرى الطرح قبل الضرب خلافًا للأولوية', 'أخطأ في إشارة $2 \\times (-3)$', 'أخطأ في جمع $6$ و $2$'], correct: 0, cols: 1,
            explain: 'الضرب والقسمة قبل الجمع والطرح ما لم توجد أقواس: كان عليه أن يحسب $2 \\times (-3)$ أوّلًا.' },
          { kind: 'solution', ask: 0, lines: ['(a) $(-3) \\times (-5) = 15$ و (b) $(-2)^2 = 4$ .', '(d) $6 - 2 \\times (-3) = 6 - (-6) = 12$ ؛ وقد طبّق رياض الطرح قبل الضرب.'] },
        ],
      },
      {
        label: '3)', title: 'نقطة رياض',
        question: 'ما نقطة رياض من 5؟',
        asks: ['نقطة رياض'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['jidaa-nisbi'], prompt: 'الإجابات الصحيحة عددها:', options: ['اثنتان: (c) و (e)', 'ثلاث', 'أربع'], correct: 0, explain: 'من الحكم في السؤال الأوّل: (c) و (e) فقط.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jidaa-nisbi'], prompt: 'نقطة رياض من 5:', expected: 2, explain: 'نقطة عن كل إجابة صحيحة: $2$ .' },
          { kind: 'solution', ask: 0, lines: ['الإجابتان (c) و (e) صحيحتان.', 'نقطة رياض: $2$ من 5.'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
