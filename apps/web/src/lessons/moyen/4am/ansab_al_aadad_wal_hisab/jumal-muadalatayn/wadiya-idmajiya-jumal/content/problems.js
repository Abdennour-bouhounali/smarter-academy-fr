/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (unité 5, modules 1 à 6) — des
 * situations COMPLÈTES de type امتحان (BEM) autour des جمل معادلتين, résolues pas
 * à pas (common/problems/GuidedProblem.jsx), AVANT « تحليل الوضعية » (module 7), puis la
 * situation évaluée du حفل البلدية (module 8).
 *
 * Demande du propriétaire (2026-10-13) : que l'élève s'exerce sur plusieurs
 * situations avant celle sur laquelle il est évalué (recette de wadiya-idmajiya-aadad,
 * MASAIL_GENERATION_GUIDE.md §14). Ce sont des AJOUTS DE LA PLATEFORME, déclarés comme
 * tels (`addition('exam_style_problem')`), jamais des exercices du manuel ; aucune ne
 * reprend le حفل البلدية (150 / 24 / 30 ; 11 250 / 2 100 DA) ni les contextes des
 * مسائل des trois leçons (kiosque, café, gare routière, état civil, librairie, ferme,
 * musée, coopérative, dattes).
 *
 * Périmètre : exactement celui de la synthèse — la notion de جملة et de solution
 * (درس 1), التعويض et الجمع (درس 2), la mise en équation d'un texte, la vérification
 * DANS le texte et la réponse rédigée (درس 3), plus un pourcentage de réduction
 * (acquis des années précédentes, comme l'ex. 31). Jamais de résolution graphique.
 *
 * Six mondes, six méthodes, six valeurs tissées dans l'énoncé :
 *   1  قفف رمضان           التكافل        somme + masse — التعويض ; un couple proposé est-il solution ?
 *   2  كرة السلة            التعاون        somme + points — الجمع ; un relevé impossible (solution négative)
 *   3  ورشة النجارة         إتقان العمل    deux ressources — ×4 et ×3 puis الجمع ; recette et bénéfice
 *   4  أعلام نوفمبر         حبّ الوطن      une réduction de 10 % — ×3 et ×2 puis الجمع
 *   5  حديقة نادي البيئة    النظافة        périmètre + écart — التعويض ; clôture et sacs de terre
 *   6  هدية الوالد          برّ الوالدين   âges (avant 5 ans) puis partage d'un cadeau
 *
 * Chaque nombre est recalculé dans ./problems.test.js. Aucune sous-étape n'est
 * une `assessment` : la maîtrise vient du module 8 seulement. Aucune de ces
 * situations n'emploie les nombres de la situation évaluée.
 */
import { addition } from '../../_unit/unitMeta.js';

const SOURCE = addition('exam_style_problem');
/** Une جملة معادلتين en LaTeX. */
const sys = (a, b) => `$\\begin{cases} ${a} \\\\ ${b} \\end{cases}$`;

export const PROBLEMS = [
  /* ───────────────────────── 1 — قفف رمضان (التكافل) ───────────────────────── */
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — قفف رمضان',
    context: 'جمعية خيرية تُعدّ قفف رمضان',
    emoji: '🧺',
    source: SOURCE,
    tone: 'emerald',
    illustration: {
      kind: 'tags',
      cards: [
        { title: 'القفة الصغيرة', icon: 'sack', lines: [{ label: 'الكتلة', value: 5, unit: 'kg' }] },
        { title: 'القفة الكبيرة', icon: 'sack', lines: [{ label: 'الكتلة', value: 8, unit: 'kg' }] },
        { title: 'ما أعدّته الجمعية', icon: 'crate', lines: [{ label: 'عدد القفف', value: 40 }, { label: 'الكتلة الإجمالية', value: 248, unit: 'kg' }] },
      ],
      ariaLabel: 'بطاقات قفف رمضان: قفة صغيرة كتلتها 5 كيلوغرامات وقفة كبيرة كتلتها 8 كيلوغرامات، والجمعية أعدّت 40 قفة كتلتها الإجمالية 248 كيلوغراما',
    },
    statement: 'تحضّر جمعية خيرية بالحيّ، تكافلًا مع الأسر المتعفّفة، قفف رمضان لتوزيعها قبل بداية الشهر الكريم. أعدّت الجمعية 40 قفة من نوعين: قفة صغيرة كتلتها 5 kg وقفة كبيرة كتلتها 8 kg، فبلغت الكتلة الإجمالية للقفف 248 kg. شارك في التحضير 12 متطوعًا، وبدأ العمل على الساعة 8 صباحًا.',
    data: [
      { id: 'count', text: 'أعدّت الجمعية 40 قفة', useful: true },
      { id: 'small', text: 'كتلة القفة الصغيرة 5 kg', useful: true },
      { id: 'large', text: 'كتلة القفة الكبيرة 8 kg', useful: true },
      { id: 'total', text: 'الكتلة الإجمالية للقفف 248 kg', useful: true },
      { id: 'volunteers', text: 'شارك في التحضير 12 متطوعًا', useful: false },
      { id: 'hour', text: 'بدأ العمل على الساعة 8 صباحًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'عدد القفف من كل نوع',
        question: 'اختر المجهولين وترجم معطيات النص بجملة معادلتين، ثم حلّها. كم قفة صغيرة وكم قفة كبيرة أعدّت الجمعية؟',
        asks: ['جملة المعادلتين', 'عدد القفف الصغيرة', 'عدد القفف الكبيرة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tarjama-jumla'],
            prompt: 'المجهولان المناسبان في هذه المشكلة:',
            options: [
              '$x$ عدد القفف الصغيرة و $y$ عدد القفف الكبيرة',
              '$x$ كتلة القفة الصغيرة و $y$ كتلة القفة الكبيرة (بـ kg)',
              '$x$ عدد القفف و $y$ الكتلة الإجمالية (بـ kg)',
            ],
            correct: 0,
            explain: 'السؤال يطلب عدد القفف من كل نوع. أمّا كتلة كل قفة والعدد الإجمالي للقفف والكتلة الإجمالية فمعطيات معلومة في النص.' },
          { kind: 'choice', role: 'translate', requires: ['tarjama-jumla'],
            prompt: 'المعلومة «بلغت الكتلة الإجمالية للقفف 248 kg» تُترجم بالمعادلة:',
            options: ['$5x + 8y = 248$', '$8x + 5y = 248$', '$x + y = 248$', '$13(x + y) = 248$'],
            correct: 0, cols: 2,
            explain: '$x$ قفة صغيرة كتلتها $5x$ ، و $y$ قفة كبيرة كتلتها $8y$ ، ومجموع الكتلتين 248 kg. أمّا $x + y$ فعدد القفف لا كتلتها، وضرب $x$ في 8 يقلب الكتلتين.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarjama-jumla'],
            prompt: 'جملة المعادلتين التي تترجم معطيات النص:',
            options: [
              sys('x + y = 40', '5x + 8y = 248'),
              sys('x + y = 40', '8x + 5y = 248'),
              sys('x + y = 248', '5x + 8y = 40'),
              sys('5x + 8y = 40', '13x = 248'),
            ],
            correct: 0, cols: 2,
            explain: 'المعلومة الأولى تعدّ القفف: $x + y = 40$ ؛ والثانية تجمع الكتل: $5x + 8y = 248$. أمّا الجملة الثالثة فتساوي عدد القفف بالكتلة وتخلط 40 و 248.' },
          { kind: 'numeric', role: 'compute', requires: ['tawid', 'hall-jumla'],
            prompt: 'من الأولى $y = 40 - x$ ؛ نعوّض في الثانية: $5x + 8(40 - x) = 248$ أي $320 - 3x = 248$ ، ومنه $3x = \\ldots$', expected: 72, shape: 'gap', subject: '3x',
            explain: '$5x + 8(40 - x) = 5x + 320 - 8x = 320 - 3x$ ، و $320 - 3x = 248$ تعني $3x = 320 - 248 = 72$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hall-jumla'],
            prompt: 'عدد القفف الصغيرة $x$ :', expected: 24, suffix: 'قفة',
            explain: '$x = 72 \\div 3 = 24$ ، لأنّ $3 \\times 24 = 72$.' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['hall-jumla'],
            prompt: 'عدد القفف الكبيرة $y$ :', expected: 16, suffix: 'قفة',
            explain: '$y = 40 - 24 = 16$.' },
          { kind: 'solution', ask: 0, lines: [
            `نسمّي $x$ عدد القفف الصغيرة و $y$ عدد القفف الكبيرة: ${sys('x + y = 40', '5x + 8y = 248')}`,
            'من الأولى $y = 40 - x$ ، نعوّض: $5x + 8(40 - x) = 248$ أي $320 - 3x = 248$ ، ومنه $x = 24$ ثم $y = 40 - 24 = 16$.',
            'تحقق: $24 + 16 = 40$ و $5 \\times 24 + 8 \\times 16 = 120 + 128 = 248$.',
            'أعدّت الجمعية 24 قفة صغيرة و 16 قفة كبيرة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'اقتراح متطوّع',
        question: 'قال أحد المتطوعين: «أعدّت الجمعية 20 قفة صغيرة و 20 قفة كبيرة». هل هذا القول صحيح؟',
        asks: ['هل الثنائية (20 ; 20) تحقق المعلومتين؟'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['mafhum-jumla'],
            prompt: 'الكتلة الإجمالية (بـ kg) لـ 20 قفة صغيرة و 20 قفة كبيرة:', expected: 260, shape: 'quantity', unit: 'kg',
            explain: '$5 \\times 20 + 8 \\times 20 = 100 + 160 = 260$.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hall-jumla', 'tahaqquq-wadiya'],
            prompt: 'هل الثنائية $(20 ; 20)$ حل للجملة؟',
            options: [
              'لا: تحقق المعادلة الأولى ($20 + 20 = 40$) ولا تحقق الثانية، فالكتلة 260 kg لا 248 kg',
              'نعم: تحقق المعادلة الأولى، وهذا يكفي',
              'نعم: لأنّ العددين متساويان فتتوازن القفف',
            ],
            correct: 0,
            explain: 'حل الجملة يحقق المعادلتين في آن واحد. هذه الثنائية تحقق عدد القفف فقط، فهي ليست حلًّا ولا يصحّ القول.' },
          { kind: 'solution', ask: 0, lines: [
            'نعوّض في المعادلتين: $20 + 20 = 40$ ، لكنّ $5 \\times 20 + 8 \\times 20 = 100 + 160 = 260 \\ne 248$.',
            'الثنائية $(20 ; 20)$ لا تحقق المعادلة الثانية: ليست حلًّا للجملة.',
            'القول غير صحيح: لا يمكن أن تكون الجمعية قد أعدّت 20 قفة من كل نوع.',
          ] },
        ],
      },
    ],
  },

  /* ───────────────────────── 2 — مباراة كرة السلة (التعاون) ───────────────────────── */
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — مباراة كرة السلة',
    context: 'مباراة مدرسية وروح التعاون',
    emoji: '🏀',
    source: SOURCE,
    tone: 'sky',
    illustration: {
      kind: 'scene', icon: 'ball', bg: 'amber',
      chips: [
        { label: 'سلة سجّلها الفريق', value: 24, tone: 'blue' },
        { label: 'نقطة للفريق', value: 52, tone: 'green' },
        { label: 'متفرجًا', value: 60, tone: 'slate' },
      ],
      extra: ['ball', 'ball'],
      ariaLabel: 'مباراة كرة سلة مدرسية: فريق سجّل 24 سلة وحصد 52 نقطة، وحضرها 60 متفرجًا',
    },
    statement: 'في مباراة مدرسية لكرة السلة، يتبادل لاعبو فريق متوسطتنا الكرة فيما بينهم بروح التعاون قبل كل تسديدة. سجّل الفريق 24 سلة، بعضها بنقطتين وبعضها بثلاث نقاط، فكان مجموع نقاطه 52 نقطة. حضر المباراة 60 متفرجًا.',
    data: [
      { id: 'baskets', text: 'سجّل الفريق 24 سلة', useful: true },
      { id: 'two', text: 'بعض السلات بنقطتين', useful: true },
      { id: 'three', text: 'بعض السلات بثلاث نقاط', useful: true },
      { id: 'points', text: 'مجموع نقاط الفريق 52 نقطة', useful: true },
      { id: 'spectators', text: 'حضر المباراة 60 متفرجًا', useful: false },
      { id: 'pass', text: 'يتبادل اللاعبون الكرة قبل كل تسديدة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'سلات النقطتين وسلات الثلاث نقاط',
        question: 'اختر المجهولين وترجم معطيات النص بجملة معادلتين، ثم حلّها. كم سلة بثلاث نقاط وكم سلة بنقطتين سجّل الفريق؟',
        asks: ['جملة المعادلتين', 'عدد السلات بثلاث نقاط', 'عدد السلات بنقطتين'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tarjama-jumla'],
            prompt: 'المجهولان المناسبان في هذه المشكلة:',
            options: [
              '$x$ عدد السلات بنقطتين و $y$ عدد السلات بثلاث نقاط',
              '$x$ عدد النقاط بنقطتين و $y$ عدد النقاط بثلاث نقاط',
              '$x$ عدد السلات و $y$ عدد النقاط',
            ],
            correct: 0,
            explain: 'السؤال يطلب عدد السلات من كل نوع. أمّا العدد الإجمالي للسلات (24) ومجموع النقاط (52) فمعطيات معلومة في النص.' },
          { kind: 'choice', role: 'translate', requires: ['tarjama-jumla'],
            prompt: 'المعلومة «مجموع نقاط الفريق 52 نقطة» تُترجم بالمعادلة:',
            options: ['$2x + 3y = 52$', '$3x + 2y = 52$', '$x + y = 52$', '$5(x + y) = 52$'],
            correct: 0, cols: 2,
            explain: 'كل سلة بنقطتين تُحصي نقطتين: $x$ سلة تعطي $2x$ نقطة، و $y$ سلة بثلاث نقاط تعطي $3y$ ، والمجموع 52. وضرب $x$ في 3 يخلط بين النوعين.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarjama-jumla'],
            prompt: 'جملة المعادلتين التي تترجم معطيات النص:',
            options: [
              sys('x + y = 24', '2x + 3y = 52'),
              sys('x + y = 24', '3x + 2y = 52'),
              sys('x + y = 52', '2x + 3y = 24'),
              sys('2x + 3y = 24', '5x = 52'),
            ],
            correct: 0, cols: 2,
            explain: 'السلات تُعدّ: $x + y = 24$ ؛ والنقاط تُجمع: $2x + 3y = 52$. ونخطئ إن ساوينا عدد السلات بمجموع النقاط (24 و 52).' },
          { kind: 'numeric', role: 'compute', requires: ['jam', 'hall-jumla'],
            prompt: 'نضرب المعادلة الأولى في 2 فنحصل على $2x + 2y = \\ldots$ ، ثم نطرحها من المعادلة الثانية طرفًا بطرف فيختفي $x$.', expected: 48, shape: 'gap', subject: '2x + 2y',
            explain: '$2 \\times (x + y) = 2x + 2y$ و $2 \\times 24 = 48$ ؛ والفرق $(2x + 3y) - (2x + 2y) = y$ يساوي $52 - 48$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['jam'],
            prompt: 'عدد السلات بثلاث نقاط $y$ :', expected: 4, suffix: 'سلات',
            explain: '$y = 52 - 48 = 4$.' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['hall-jumla'],
            prompt: 'عدد السلات بنقطتين $x$ :', expected: 20, suffix: 'سلة',
            explain: '$x = 24 - 4 = 20$.' },
          { kind: 'solution', ask: 0, lines: [
            `نسمّي $x$ عدد السلات بنقطتين و $y$ عدد السلات بثلاث نقاط: ${sys('x + y = 24', '2x + 3y = 52')}`,
            'نضرب الأولى في 2: $2x + 2y = 48$ ، ثم نطرحها من الثانية: $y = 52 - 48 = 4$ ، ومنه $x = 24 - 4 = 20$.',
            'تحقق: $20 + 4 = 24$ و $2 \\times 20 + 3 \\times 4 = 40 + 12 = 52$.',
            'سجّل الفريق 20 سلة بنقطتين و 4 سلات بثلاث نقاط.',
          ] },
        ],
      },
      {
        label: '2)', title: 'تدوين المحكّم',
        question: 'في مباراة أخرى دوّن المحكّم أنّ الفريق سجّل 24 سلة ومجموع نقاطه 80 نقطة. هل هذا التدوين ممكن؟',
        asks: ['هل التدوين ممكن؟'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['jam'],
            prompt: 'بالطريقة نفسها (نضرب المعادلة الأولى في 2 ثم نطرحها من الثانية) نجد عدد السلات بثلاث نقاط:', expected: 32,
            explain: '$2x + 2y = 48$ و $2x + 3y = 80$ ، فبالطرح $y = 80 - 48 = 32$.' },
          { kind: 'choice', role: 'conclude', requires: ['tahaqquq-wadiya'],
            prompt: 'ماذا نجد لعدد السلات بنقطتين $x$ ؟',
            options: ['$x = 24 - 32 = -8$ : عدد سالب', '$x = 24 + 32 = 56$', '$x = 32$ مثل $y$'],
            correct: 0,
            explain: 'من $x + y = 24$ نجد $x = 24 - 32 = -8$ : نتيجة سالبة.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tahaqquq-wadiya'],
            prompt: 'هل تدوين المحكّم ممكن؟',
            options: [
              'لا: حلّ الجملة $(-8 ; 32)$ ليس عددين طبيعيين، وعدد السلات لا يكون سالبًا؛ أخطأ المحكّم في أحد العددين',
              'نعم: الثنائية $(-8 ; 32)$ تحقق المعادلتين',
              'نعم: يكفي أن يكون $y = 32$ ، فنهمل $x$',
            ],
            correct: 0,
            explain: 'حلّ الجملة لا يجيب عن القصة: لا يوجد عدد سلات سالب، ثم إنّ 32 سلة بثلاث نقاط أكثر من 24 سلة كلها. نتحقق دائمًا في نص المشكلة.' },
          { kind: 'solution', ask: 0, lines: [
            `${sys('x + y = 24', '2x + 3y = 80')}؛ نضرب الأولى في 2 ثم نطرحها من الثانية: $y = 80 - 48 = 32$.`,
            'ومنه $x = 24 - 32 = -8$ : عدد السلات لا يكون سالبًا.',
            'التدوين غير ممكن: أخطأ المحكّم في عدد السلات أو في مجموع النقاط.',
          ] },
        ],
      },
    ],
  },

  /* ───────────────────────── 3 — ورشة النجارة (إتقان العمل) ───────────────────────── */
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — ورشة النجارة',
    context: 'ألواح وساعات عمل لا يبقى منها شيء',
    emoji: '🪑',
    source: SOURCE,
    tone: 'amber',
    illustration: {
      kind: 'tags',
      cards: [
        { title: 'طاولة', icon: 'crate', lines: [{ label: 'ألواح', value: 4 }, { label: 'ساعات عمل', value: 3 }] },
        { title: 'كرسي', icon: 'crate', lines: [{ label: 'ألواح', value: 3 }, { label: 'ساعات عمل', value: 4 }] },
        { title: 'ما يملكه النجّار', icon: 'tile', lines: [{ label: 'ألواح', value: 50 }, { label: 'ساعات عمل', value: 48 }] },
      ],
      ariaLabel: 'بطاقات الورشة: الطاولة تلزمها 4 ألواح و 3 ساعات عمل، والكرسي 3 ألواح و 4 ساعات عمل، ويملك النجّار 50 لوحًا و 48 ساعة عمل',
    },
    statement: 'في ورشة نجارة ببجاية، يحرص النجّار على إتقان عمله وعلى احترام مواعيد التسليم. لصنع طاولة يلزمه 4 ألواح خشبية و 3 ساعات عمل، ولصنع كرسي يلزمه 3 ألواح و 4 ساعات عمل. يملك هذا الأسبوع 50 لوحًا و 48 ساعة عمل، ويريد أن يستعملها كلها دون أن يبقى شيء. يبيع الطاولة بـ 6000 دج والكرسي بـ 1500 دج، ويدفع 800 دج ثمنًا للوح الواحد. تأسّست الورشة سنة 1998.',
    data: [
      { id: 'table', text: 'طاولة: 4 ألواح و 3 ساعات عمل', useful: true },
      { id: 'chair', text: 'كرسي: 3 ألواح و 4 ساعات عمل', useful: true },
      { id: 'planks', text: 'يملك النجّار 50 لوحًا', useful: true },
      { id: 'hours', text: 'يملك النجّار 48 ساعة عمل', useful: true },
      { id: 'year', text: 'تأسّست الورشة سنة 1998', useful: false },
      { id: 'town', text: 'تقع الورشة في مدينة بجاية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'عدد الطاولات وعدد الكراسي',
        question: 'اختر المجهولين وترجم معطيات النص بجملة معادلتين، ثم حلّها. كم طاولة وكم كرسيًا يصنع النجّار هذا الأسبوع؟',
        asks: ['جملة المعادلتين', 'عدد الطاولات', 'عدد الكراسي'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tarjama-jumla'],
            prompt: 'المجهولان المناسبان في هذه المشكلة:',
            options: [
              '$x$ عدد الطاولات و $y$ عدد الكراسي',
              '$x$ ثمن الطاولة و $y$ ثمن الكرسي',
              '$x$ عدد الألواح و $y$ عدد ساعات العمل',
            ],
            correct: 0,
            explain: 'السؤال يطلب عدد الطاولات وعدد الكراسي. أمّا الألواح (50) وساعات العمل (48) فمعطيات معلومة في النص.' },
          { kind: 'choice', role: 'translate', requires: ['tarjama-jumla'],
            prompt: 'استعمال الألواح كلها (50 لوحًا) يُترجم بالمعادلة:',
            options: ['$4x + 3y = 50$', '$3x + 4y = 50$', '$4x + 3y = 48$', '$x + y = 50$'],
            correct: 0, cols: 2,
            explain: 'كل طاولة تستهلك 4 ألواح وكل كرسي 3 ألواح: $x$ طاولة تستهلك $4x$ لوحًا و $y$ كرسي تستهلك $3y$ ، والمجموع 50. تبديل المعاملين يضرب كل عدد في ما يستهلكه الشيء الآخر، والمعادلة بالرقم 48 تخلط الألواح بساعات العمل.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarjama-jumla'],
            prompt: 'جملة المعادلتين التي تترجم معطيات النص (الألواح ثم الساعات):',
            options: [
              sys('4x + 3y = 50', '3x + 4y = 48'),
              sys('3x + 4y = 50', '4x + 3y = 48'),
              sys('4x + 4y = 50', '3x + 3y = 48'),
              sys('4x + 3y = 48', '3x + 4y = 50'),
            ],
            correct: 0, cols: 2,
            explain: 'الألواح: $4x + 3y = 50$ ؛ ساعات العمل: طاولة تستغرق 3 ساعات وكرسي 4 ساعات، أي $3x + 4y = 48$. تبديل المعاملين أو تبديل 50 و 48 يعطي جملة أخرى.' },
          { kind: 'numeric', role: 'compute', requires: ['jam', 'ikhtiyar-tariqa'],
            prompt: 'نضرب المعادلة الأولى في 4 والثانية في 3 ليتساوى معاملا $y$ : $16x + 12y = 200$ و $9x + 12y = \\ldots$', expected: 144, shape: 'gap', subject: '9x + 12y',
            explain: '$3 \\times (3x + 4y) = 9x + 12y$ و $3 \\times 48 = 144$ ؛ ومعاملا $y$ صارا متساويين (12) فنطرح.' },
          { kind: 'numeric', role: 'compute', requires: ['jam'],
            prompt: 'نطرح الثانية من الأولى طرفًا بطرف فيختفي $y$ : $7x = \\ldots$', expected: 56, shape: 'gap', subject: '7x',
            explain: '$(16x + 12y) - (9x + 12y) = 7x$ و $200 - 144 = 56$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['jam'],
            prompt: 'عدد الطاولات $x$ :', expected: 8, suffix: 'طاولات',
            explain: '$x = 56 \\div 7 = 8$.' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['hall-jumla'],
            prompt: 'عدد الكراسي $y$ :', expected: 6, suffix: 'كراسي',
            explain: 'من $4x + 3y = 50$ نجد $3y = 50 - 32 = 18$ ، ومنه $y = 6$.' },
          { kind: 'solution', ask: 0, lines: [
            `نسمّي $x$ عدد الطاولات و $y$ عدد الكراسي: ${sys('4x + 3y = 50', '3x + 4y = 48')}`,
            'نضرب الأولى في 4 والثانية في 3: $16x + 12y = 200$ و $9x + 12y = 144$ ، فبالطرح $7x = 56$ ، ومنه $x = 8$ ثم $y = 6$.',
            'تحقق: $4 \\times 8 + 3 \\times 6 = 32 + 18 = 50$ و $3 \\times 8 + 4 \\times 6 = 24 + 24 = 48$.',
            'يصنع النجّار 8 طاولات و 6 كراسي.',
          ] },
        ],
      },
      {
        label: '2)', title: 'مداخيل الورشة وربحها',
        question: 'احسب مدخول بيع الطاولات والكراسي كلها. ما ربح النجّار بعد دفع ثمن الألواح الخمسين؟',
        asks: ['مدخول البيع', 'ربح النجّار'],
        steps: [
          { kind: 'numeric', role: 'compute',
            prompt: 'ثمن بيع الطاولات الثماني (بالدينار):', expected: 48000, shape: 'quantity', unit: 'دج',
            explain: '$8 \\times 6000 = 48000$.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'مدخول بيع الطاولات والكراسي معًا:', expected: 57000, shape: 'quantity', unit: 'دج',
            explain: 'الكراسي الستة: $6 \\times 1500 = 9000$ ، والمدخول $48000 + 9000 = 57000$.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'ثمن الألواح الخمسين:', expected: 40000, shape: 'quantity', unit: 'دج',
            explain: '$50 \\times 800 = 40000$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ربح النجّار (المدخول ناقص ثمن الألواح):', expected: 17000, shape: 'quantity', unit: 'دج',
            explain: '$57000 - 40000 = 17000$.' },
          { kind: 'solution', ask: 0, lines: [
            'مدخول البيع: $8 \\times 6000 + 6 \\times 1500 = 48000 + 9000 = 57000$ دج.',
            'ثمن الألواح: $50 \\times 800 = 40000$ دج.',
            'الربح: $57000 - 40000 = 17000$ ، أي يربح النجّار 17000 دج.',
          ] },
        ],
      },
    ],
  },

  /* ───────────────────────── 4 — أعلام الفاتح من نوفمبر (حبّ الوطن) ───────────────────────── */
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — أعلام الفاتح من نوفمبر',
    context: 'طلبيتان وتخفيض بنسبة 10%',
    emoji: '🇩🇿',
    source: SOURCE,
    tone: 'rose',
    illustration: {
      kind: 'tags',
      cards: [
        { title: 'الطلبية الأولى', icon: 'kite', lines: [{ label: 'أعلام صغيرة', value: 4 }, { label: 'أعلام كبيرة', value: 3 }, { label: 'دفع', value: 300, unit: 'دج' }] },
        { title: 'الطلبية الثانية (تخفيض 10%)', icon: 'kite', lines: [{ label: 'أعلام صغيرة', value: 6 }, { label: 'أعلام كبيرة', value: 5 }, { label: 'دفع', value: 432, unit: 'دج' }] },
      ],
      ariaLabel: 'بطاقتا طلبيتين: 4 أعلام صغيرة و 3 كبيرة بـ 300 دج، و 6 أعلام صغيرة و 5 كبيرة بـ 432 دج بعد تخفيض 10%',
    },
    statement: 'إحياءً لذكرى الفاتح من نوفمبر وحبًّا للوطن، يريد نادي المدرسة تزيين الساحة بأعلام الجزائر. يبيع محلٌّ الأعلام الصغيرة بثمن واحد والأعلام الكبيرة بثمن واحد. في الطلبية الأولى اشترى النادي 4 أعلام صغيرة و 3 أعلام كبيرة ودفع 300 دج. وفي طلبية ثانية اشترى 6 أعلام صغيرة و 5 أعلام كبيرة، واستفاد من تخفيض قدره 10% على ثمن مشترياته، فدفع 432 دج.',
    parts: [
      {
        label: '1)', title: 'ثمن العلم الصغير وثمن العلم الكبير',
        question: 'ترجم الطلبيتين بجملة معادلتين بمجهولين، ثم حلّها. ما ثمن العلم الكبير؟ وما ثمن العلم الصغير؟',
        asks: ['جملة المعادلتين', 'ثمن العلم الكبير', 'ثمن العلم الصغير'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarjama-jumla'],
            prompt: 'نسمّي $x$ ثمن العلم الصغير و $y$ ثمن العلم الكبير (بالدينار). الطلبية الأولى تُترجم بالمعادلة:',
            options: ['$4x + 3y = 300$', '$3x + 4y = 300$', '$x + y = 300$', '$7(x + y) = 300$'],
            correct: 0, cols: 2,
            explain: '4 أعلام صغيرة ثمنها $4x$ و 3 أعلام كبيرة ثمنها $3y$ ، والمجموع 300 دج. تبديل المعاملين يضرب كل عدد في ثمن الشيء الآخر.' },
          { kind: 'choice', role: 'translate', requires: ['nisba-mia', 'tarjama-jumla'],
            prompt: 'في الطلبية الثانية دفع النادي 432 دج بعد تخفيض 10%. تُترجم هذه المعلومة بالمعادلة:',
            options: ['$0{,}9(6x + 5y) = 432$', '$6x + 5y = 432$', '$0{,}1(6x + 5y) = 432$', '$0{,}9 \\times 6x + 5y = 432$'],
            correct: 0, cols: 2,
            explain: 'بعد تخفيض 10% ندفع 90% من الثمن، أي $0{,}9$ ثمن المشتريات كلها: $0{,}9(6x + 5y) = 432$. أمّا نسيان التخفيض فيعطي المبلغ المدفوع بدل الثمن الأصلي، و $0{,}1$ هو مقدار التخفيض لا ما يُدفع.' },
          { kind: 'numeric', role: 'compute', requires: ['nisba-mia'],
            prompt: 'ثمن مشتريات الطلبية الثانية قبل التخفيض: $6x + 5y = 432 \\div 0{,}9 = \\ldots$', expected: 480, shape: 'gap', subject: '6x + 5y',
            explain: '$432 \\div 0{,}9 = 480$ ، لأنّ $480 \\times 0{,}9 = 432$.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarjama-jumla'],
            prompt: 'جملة المعادلتين التي تترجم الطلبيتين:',
            options: [
              sys('4x + 3y = 300', '6x + 5y = 480'),
              sys('4x + 3y = 300', '6x + 5y = 432'),
              sys('3x + 4y = 300', '5x + 6y = 480'),
              sys('4x + 3y = 300', 'x + y = 432'),
            ],
            correct: 0, cols: 2,
            explain: 'الأولى: $4x + 3y = 300$. الثانية قبل التخفيض: $6x + 5y = 480$. الجملة بـ 432 تجعل التخفيض مدفوعًا مرتين، وتبديل المعاملات يقلب الثمنين.' },
          { kind: 'numeric', role: 'compute', requires: ['jam', 'ikhtiyar-tariqa'],
            prompt: 'نضرب الأولى في 3 والثانية في 2 فنحصل على $12x + 9y = 900$ و $12x + 10y = \\ldots$', expected: 960, shape: 'gap', subject: '12x + 10y',
            explain: '$2 \\times 480 = 960$ ؛ ومعاملا $x$ صارا متساويين (12) فنطرح.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['jam'],
            prompt: 'بطرح المعادلتين طرفًا بطرف، ثمن العلم الكبير $y$ :', expected: 60, shape: 'quantity', unit: 'دج',
            explain: '$(12x + 10y) - (12x + 9y) = y$ و $960 - 900 = 60$.' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['hall-jumla'],
            prompt: 'ثمن العلم الصغير $x$ :', expected: 30, shape: 'quantity', unit: 'دج',
            explain: 'من $4x + 3y = 300$ : $4x = 300 - 180 = 120$ ، ومنه $x = 30$.' },
          { kind: 'solution', ask: 0, lines: [
            `الطلبية الثانية قبل التخفيض: $432 \\div 0{,}9 = 480$ ؛ ${sys('4x + 3y = 300', '6x + 5y = 480')}`,
            'نضرب الأولى في 3 والثانية في 2: $12x + 9y = 900$ و $12x + 10y = 960$ ، فبالطرح $y = 60$ ثم $4x = 300 - 180 = 120$ أي $x = 30$.',
            'تحقق: $4 \\times 30 + 3 \\times 60 = 300$ و $0{,}9 \\times (6 \\times 30 + 5 \\times 60) = 0{,}9 \\times 480 = 432$.',
            'ثمن العلم الصغير 30 دج وثمن العلم الكبير 60 دج.',
          ] },
        ],
      },
      {
        label: '2)', title: 'طلبية جديدة بالتخفيض',
        question: 'يريد النادي طلبية ثالثة بالتخفيض نفسه (10%). ما ثمن العلم الصغير وثمن العلم الكبير بعد التخفيض؟ وكم يدفع النادي ثمن 20 علمًا صغيرًا و 10 أعلام كبيرة؟',
        asks: ['ثمن العلم الصغير بعد التخفيض', 'ثمن العلم الكبير بعد التخفيض', 'المبلغ الذي يدفعه النادي'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['nisba-mia'],
            prompt: 'ثمن بضاعة بعد تخفيض 10% هو:',
            options: ['ثمنها الأصلي مضروبًا في $0{,}9$', 'ثمنها الأصلي مضروبًا في $0{,}1$', 'ثمنها الأصلي ناقص $0{,}1$ دينار', 'ثمنها الأصلي زائد 10 دنانير'],
            correct: 0, cols: 1,
            explain: 'التخفيض 10% يعني دفع $100\\% - 10\\% = 90\\%$ من الثمن، أي الضرب في $0{,}9$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['nisba-mia'],
            prompt: 'ثمن العلم الصغير بعد التخفيض:', expected: 27, shape: 'quantity', unit: 'دج',
            explain: '$30 \\times 0{,}9 = 27$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['nisba-mia'],
            prompt: 'ثمن العلم الكبير بعد التخفيض:', expected: 54, shape: 'quantity', unit: 'دج',
            explain: '$60 \\times 0{,}9 = 54$.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'ثمن 20 علمًا صغيرًا بعد التخفيض:', expected: 540, shape: 'quantity', unit: 'دج',
            explain: '$20 \\times 27 = 540$.' },
          { kind: 'numeric', role: 'answer', ask: 2,
            prompt: 'المبلغ الذي يدفعه النادي لـ 20 علمًا صغيرًا و 10 أعلام كبيرة:', expected: 1080, shape: 'quantity', unit: 'دج',
            explain: '10 أعلام كبيرة: $10 \\times 54 = 540$ ، والمجموع $540 + 540 = 1080$.' },
          { kind: 'solution', ask: 0, lines: [
            'بعد التخفيض: $30 \\times 0{,}9 = 27$ دج للعلم الصغير و $60 \\times 0{,}9 = 54$ دج للعلم الكبير.',
            '$20 \\times 27 + 10 \\times 54 = 540 + 540 = 1080$.',
            'يدفع النادي 1080 دج.',
          ] },
        ],
      },
    ],
  },

  /* ───────────────────────── 5 — حديقة نادي البيئة (النظافة) ───────────────────────── */
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — حديقة نادي البيئة',
    context: 'مستطيل: المحيط والفرق بين البعدين',
    emoji: '🌳',
    source: SOURCE,
    tone: 'teal',
    illustration: {
      kind: 'plan', shape: 'rect', fill: 'garden', w: 'x', h: 'y', unit: 'm',
      ariaLabel: 'مخطّط حديقة مستطيلة طولها x وعرضها y بالمتر، محيطها وفرق بُعديها معلومان في النص',
    },
    statement: 'يعمل نادي البيئة بالمتوسطة على نظافة المحيط وجماله، فأنشأ حديقة مستطيلة الشكل خلف قاعة الرياضة. محيط الحديقة 140 م، وطولها يزيد عن عرضها بـ 10 م. سيحيطها النادي بسياج ثمن المتر الواحد منه 350 دج، ثم يغطّي أرضها بالتربة، والكيس الواحد منها يكفي لتغطية 4 م². تأسّس النادي سنة 2019 ويضمّ 18 عضوًا.',
    parts: [
      {
        label: '1)', title: 'بُعدا الحديقة',
        question: 'ترجم معطيات النص بجملة معادلتين، ثم حلّها. ما طول الحديقة؟ وما عرضها؟',
        asks: ['جملة المعادلتين', 'عرض الحديقة', 'طول الحديقة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarjama-jumla'],
            prompt: 'المجهولان المناسبان في هذه المشكلة:',
            options: [
              '$x$ طول الحديقة و $y$ عرضها (بالمتر)',
              '$x$ محيط الحديقة و $y$ مساحتها',
              '$x$ طول السياج و $y$ ثمن المتر منه',
            ],
            correct: 0,
            explain: 'السؤال يطلب طول الحديقة وعرضها. أمّا المحيط (140 م) والفرق (10 م) فمعطيان معلومان.' },
          { kind: 'choice', role: 'translate', requires: ['tarjama-jumla'],
            prompt: 'المعلومة «محيط الحديقة 140 م» تُترجم بالمعادلة:',
            options: ['$2x + 2y = 140$', '$x + y = 140$', '$xy = 140$', '$2x + y = 140$'],
            correct: 0, cols: 2,
            explain: 'محيط المستطيل مجموع أضلاعه الأربعة: $x + y + x + y = 2x + 2y$. أمّا $x + y$ فنصف المحيط، و $xy$ هو المساحة.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarjama-jumla'],
            prompt: 'جملة المعادلتين التي تترجم معطيات النص (المحيط ثم الفرق):',
            options: [
              sys('2x + 2y = 140', 'x = y + 10'),
              sys('2x + 2y = 140', 'y = x + 10'),
              sys('x + y = 140', 'x = 10y'),
              sys('2x + 2y = 140', 'x + y = 10'),
            ],
            correct: 0, cols: 2,
            explain: 'الطول يزيد عن العرض بـ 10 م، أي $x = y + 10$ ؛ وليس العرض هو الذي يزيد عن الطول، ولا الطول 10 أمثال العرض. والمحيط $2x + 2y = 140$.' },
          { kind: 'numeric', role: 'compute', requires: ['ikhtiyar-tariqa'],
            prompt: 'نقسم طرفي المعادلة الأولى على 2 لنبسّطها: $x + y = \\ldots$', expected: 70, shape: 'gap', subject: 'x + y',
            explain: '$140 \\div 2 = 70$ : نصف المحيط.' },
          { kind: 'numeric', role: 'compute', requires: ['tawid', 'hall-jumla'],
            prompt: 'نعوّض $x = y + 10$ في $x + y = 70$ : $(y + 10) + y = 70$ أي $2y = \\ldots$', expected: 60, shape: 'gap', subject: '2y',
            explain: '$2y + 10 = 70$ ، ومنه $2y = 70 - 10 = 60$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hall-jumla'],
            prompt: 'عرض الحديقة $y$ :', expected: 30, shape: 'quantity', unit: 'm',
            explain: '$y = 60 \\div 2 = 30$.' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['hall-jumla'],
            prompt: 'طول الحديقة $x$ :', expected: 40, shape: 'quantity', unit: 'm',
            explain: '$x = y + 10 = 30 + 10 = 40$.' },
          { kind: 'solution', ask: 0, lines: [
            `نسمّي $x$ طول الحديقة و $y$ عرضها: ${sys('2x + 2y = 140', 'x = y + 10')}`,
            'نبسّط الأولى: $x + y = 70$ ، ونعوّض $x = y + 10$ : $2y + 10 = 70$ ، ومنه $y = 30$ ثم $x = 40$.',
            'تحقق: $2 \\times 40 + 2 \\times 30 = 140$ و $40 = 30 + 10$.',
            'طول الحديقة 40 م وعرضها 30 م.',
          ] },
        ],
      },
      {
        label: '2)', title: 'السياج والتربة',
        question: 'احسب تكلفة السياج الذي يحيط بالحديقة. وكم كيسًا من التربة يلزم لتغطية أرضها؟',
        asks: ['تكلفة السياج', 'عدد أكياس التربة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'تكلفة السياج (طوله محيط الحديقة):', expected: 49000, shape: 'quantity', unit: 'دج',
            explain: '$140 \\times 350 = 49000$.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'مساحة الحديقة (طولها × عرضها) بالمتر المربع:', expected: 1200, shape: 'quantity', unit: 'm²',
            explain: '$40 \\times 30 = 1200$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'عدد أكياس التربة:', expected: 300, suffix: 'كيس',
            explain: '$1200 \\div 4 = 300$ ، لأنّ كل كيس يغطي 4 م².' },
          { kind: 'solution', ask: 0, lines: [
            'تكلفة السياج: $140 \\times 350 = 49000$ دج.',
            'مساحة الحديقة: $40 \\times 30 = 1200$ م² ، وعدد الأكياس: $1200 \\div 4 = 300$.',
            'يدفع النادي 49000 دج للسياج، ويلزمه 300 كيس من التربة.',
          ] },
        ],
      },
    ],
  },

  /* ───────────────────────── 6 — هدية الوالد (برّ الوالدين) ───────────────────────── */
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — هدية الوالد',
    context: 'الأعمار ثم تقاسم ثمن هدية',
    emoji: '🎁',
    source: SOURCE,
    tone: 'violet',
    illustration: {
      kind: 'scene', icon: 'person', bg: 'violet',
      chips: [
        { label: 'مجموع عمري الابن والأب اليوم', value: 50, unit: 'سنة', tone: 'blue' },
        { label: 'قبل', value: 5, unit: 'سنوات', tone: 'amber' },
        { label: 'ثمن الهدية', value: 4800, unit: 'دج', tone: 'green' },
      ],
      ariaLabel: 'ابن وأبوه وهدية: مجموع عمريهما اليوم 50 سنة، وقبل 5 سنوات حالة أخرى، وثمن الهدية 4800 دج',
    },
    statement: 'يحبّ إسماعيل والده ويحرص على برّه. بمناسبة عيد ميلاد الوالد، أراد إسماعيل وأخته مريم أن يهديا له ساعة يدوية ثمنها 4800 دج. مجموع عمر إسماعيل وعمر والده اليوم 50 سنة، وقبل 5 سنوات كان عمر الأب 7 أمثال عمر ابنه. ساهم إسماعيل في ثمن الهدية بمبلغ يساوي ضعف مساهمة أخته ناقصًا 600 دج. يبعد محلّ الساعات 3 كم عن البيت.',
    parts: [
      {
        label: '1)', title: 'عمر إسماعيل وعمر والده',
        question: 'ترجم معطيات الأعمار بجملة معادلتين، ثم حلّها. ما عمر إسماعيل؟ وما عمر والده؟',
        asks: ['جملة المعادلتين', 'عمر إسماعيل', 'عمر والده'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarjama-jumla'],
            prompt: 'نسمّي $x$ عمر الأب و $y$ عمر ابنه اليوم (بالسنوات). المعلومة «قبل 5 سنوات كان عمر الأب 7 أمثال عمر ابنه» تُترجم بالمعادلة:',
            options: ['$x - 5 = 7(y - 5)$', '$x - 5 = 7y - 5$', '$x + 5 = 7(y + 5)$', '$x = 7(y - 5)$'],
            correct: 0, cols: 2,
            explain: 'قبل 5 سنوات كان عمر الأب $x - 5$ وعمر الابن $y - 5$ ، والأول 7 أمثال الثاني. تُطرح 5 سنوات من العمرين معًا.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarjama-jumla'],
            prompt: 'جملة المعادلتين التي تترجم معطيات الأعمار:',
            options: [
              sys('x + y = 50', 'x - 5 = 7(y - 5)'),
              sys('x + y = 50', 'x + 5 = 7(y + 5)'),
              sys('x + y = 50', 'x = 7y'),
              sys('x - y = 50', 'x - 5 = 7(y - 5)'),
            ],
            correct: 0, cols: 2,
            explain: 'اليوم: $x + y = 50$. قبل 5 سنوات: $x - 5 = 7(y - 5)$. ولا نكتب أنّ الأب اليوم 7 أمثال ابنه: النسبة 7 صحيحة قبل 5 سنوات فقط.' },
          { kind: 'numeric', role: 'compute', requires: ['ikhtiyar-tariqa', 'tawid'],
            prompt: 'نبسّط المعادلة الثانية: $x - 5 = 7y - 35$ ، ومنه $x = 7y - \\ldots$', expected: 30, shape: 'gap', subject: 'x = 7y - \\ldots',
            explain: '$7(y - 5) = 7y - 35$ ، فـ $x = 7y - 35 + 5 = 7y - 30$.' },
          { kind: 'numeric', role: 'compute', requires: ['hall-jumla'],
            prompt: 'نعوّض في $x + y = 50$ : $(7y - 30) + y = 50$ أي $8y = \\ldots$', expected: 80, shape: 'gap', subject: '8y',
            explain: '$8y - 30 = 50$ ، ومنه $8y = 50 + 30 = 80$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hall-jumla'],
            prompt: 'عمر إسماعيل $y$ :', expected: 10, suffix: 'سنوات',
            explain: '$y = 80 \\div 8 = 10$.' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['tahaqquq-wadiya'],
            prompt: 'عمر الأب $x$ :', expected: 40, suffix: 'سنة',
            explain: '$x = 50 - 10 = 40$. نتحقق: قبل 5 سنوات كان عمر الأب 35 وعمر ابنه 5، و $35 = 7 \\times 5$.' },
          { kind: 'solution', ask: 0, lines: [
            `نسمّي $x$ عمر الأب و $y$ عمر إسماعيل اليوم: ${sys('x + y = 50', 'x - 5 = 7(y - 5)')}`,
            'تُبسَّط الثانية إلى $x = 7y - 30$ ، فنعوّض: $8y - 30 = 50$ ، ومنه $y = 10$ ثم $x = 50 - 10 = 40$.',
            'تحقق: قبل 5 سنوات كان عمر الأب $40 - 5 = 35$ وعمر ابنه $10 - 5 = 5$ ، و $35 = 7 \\times 5$.',
            'عمر إسماعيل 10 سنوات وعمر والده 40 سنة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'ثمن الهدية',
        question: 'كم دينارًا ساهمت به مريم؟ وكم دينارًا ساهم به إسماعيل؟',
        asks: ['مساهمة مريم', 'مساهمة إسماعيل'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarjama-jumla'],
            prompt: 'نسمّي $x$ مساهمة إسماعيل و $y$ مساهمة مريم (بالدينار). المعلومة «ساهم إسماعيل بضعف مساهمة أخته ناقصًا 600 دج» تُترجم بالمعادلة:',
            options: ['$x = 2y - 600$', '$x = 2(y - 600)$', '$y = 2x - 600$', '$x = 2y + 600$'],
            correct: 0, cols: 2,
            explain: 'ضعف مساهمة مريم هو $2y$ ، ثم نطرح 600: $x = 2y - 600$. أمّا $2(y - 600)$ فتطرح 600 قبل الضعف. والمجموع $x + y = 4800$ هو ثمن الساعة.' },
          { kind: 'numeric', role: 'compute', requires: ['hall-jumla'],
            prompt: 'نعوّض $x = 2y - 600$ في $x + y = 4800$ فنجد $3y - 600 = 4800$ ، أي $3y = \\ldots$', expected: 5400, shape: 'gap', subject: '3y',
            explain: '$(2y - 600) + y = 3y - 600$ ، و $3y = 4800 + 600 = 5400$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-jumla'],
            prompt: 'مساهمة مريم $y$ :', expected: 1800, shape: 'quantity', unit: 'دج',
            explain: '$y = 5400 \\div 3 = 1800$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tahaqquq-wadiya'],
            prompt: 'مساهمة إسماعيل $x$ :', expected: 3000, shape: 'quantity', unit: 'دج',
            explain: '$x = 2 \\times 1800 - 600 = 3000$. نتحقق: $3000 + 1800 = 4800$.' },
          { kind: 'solution', ask: 0, lines: [
            `${sys('x + y = 4800', 'x = 2y - 600')}؛ نعوّض: $3y - 600 = 4800$ ، ومنه $y = 1800$.`,
            '$x = 2 \\times 1800 - 600 = 3000$. تحقق: $3000 + 1800 = 4800$.',
            'ساهمت مريم بـ 1800 دج وساهم إسماعيل بـ 3000 دج.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
