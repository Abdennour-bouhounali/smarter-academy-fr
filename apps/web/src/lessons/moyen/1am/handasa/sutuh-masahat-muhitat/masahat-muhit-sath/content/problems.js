/**
 * Les trois « مسائل » du درس « مساحة سطح مستو ومحيطه » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). Ajouts de la plateforme (`exam_style_problem`) : autres contextes, autres formes, autres nombres que le manuel. La
 * مسألة 1 (`LESSON_CONFIG.lessonProblem` : la ساحة d'un quartier — compter dalles et éléments de clôture, chiffrer, comparer deux dispositions) ;
 * la 2 (modelée sur أتعمّق 2 : une surface aux bords en biais dont les demi-carreaux se complètent, un rectangle et un carré de même aire) ;
 * la 3 la pose du zellige sur un mur avec deux unités (21 petits carreaux = 10,5 grands). Chaque nombre est vérifié dans ./problems.test.js
 * à partir des cellules (arithmétique entière EXACTE).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';
import { PROBLEM_FIGURES } from './figures.js';

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — ساحة الحيّ',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🧱',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    figure: LESSON_CONFIG.lessonProblem.figure,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'الساحة مرسومة على ورقة مرصوفة: كل خانة بلاطة وضلع الخانة عصا من السياج', useful: true },
      { id: 'd2', text: 'ثمن البلاطة الواحدة 40 دج', useful: true },
      { id: 'd3', text: 'ثمن العصا الواحدة 150 دج', useful: true },
      { id: 'd4', text: 'الترتيب المقترح: مستطيل من ثلاثة صفوف في كل صفّ أربع بلاطات', useful: true },
      { id: 'd5', text: 'تعاونت العائلات على الشراء', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'البلاطات والعصي',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['عدد البلاطات', 'عدد العصي'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['masaha-adad'], prompt: 'عدد البلاطات التي تغطّي الساحة (نعدّها صفًّا صفًّا):', expected: 12,
            explain: 'في الصفوف الثلاثة: 4 و 5 و 3 بلاطات، فالمجموع $4+5+3=12$ بلاطة.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['mahit-hadd'], prompt: 'عدد العصي التي تلزم لسياج الساحة (نعدّ أضلاع الخانات الواقعة على الحدّ):', expected: 16,
            explain: 'نمشي حول الساحة ونعدّ الأضلاع على الحدّ: $4+1+1+1+2+1+3+3=16$ عصا.' },
          { kind: 'solution', ask: 0, lines: [
            'نعدّ البلاطات صفًّا صفًّا: $4+5+3=12$ بلاطة، وهذه هي المساحة.',
            'السياج يمرّ على حدّ الساحة: نمشي حولها ونعدّ الأضلاع الواقعة عليه فنجد 16 عصا، وهذا هو المحيط.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الثمن',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['ثمن البلاطات', 'ثمن السياج'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['masaha-adad'], prompt: 'ثمن البلاطات بالدينار:', expected: 480,
            explain: 'ثمن البلاطات هو عدد البلاطات مضروبًا في ثمن الواحدة: $12\\times40=480$ دج.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['mahit-hadd'], prompt: 'ثمن السياج بالدينار:', expected: 2400,
            explain: 'ثمن السياج هو عدد العصي مضروبًا في ثمن العصا: $16\\times150=2400$ دج.' },
          { kind: 'solution', ask: 0, lines: [
            'ثمن البلاطات من عدد البلاطات (المساحة): $12\\times40=480$ دج.',
            'ثمن السياج من عدد العصي (المحيط): $16\\times150=2400$ دج.',
          ] },
        ],
      },
      {
        label: '3)', title: 'ترتيب أوفر',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['المبلغ الموفَّر'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['naql-baqat-masaha'],
            prompt: 'عند الانتقال إلى الترتيب المقترح بالبلاطات نفسها، أيّ العددين يبقى ثابتًا؟',
            options: ['عدد البلاطات، فيبقى ثمنها 480 دج', 'عدد عصي السياج', 'ثمن السياج'],
            correct: 0,
            explain: 'لا نضيف بلاطة ولا نزيلها: المساحة ثابتة، أمّا المحيط فيتغيّر مع الترتيب.' },
          { kind: 'numeric', role: 'compute', requires: ['mahit-hadd'], prompt: 'عدد عصي سياج المستطيل المقترح (ثلاثة صفوف في كل صفّ أربع بلاطات):', expected: 14,
            explain: 'في أعلاه وأسفله 4 عصي في كل منهما، وفي كل جانب 3 عصي: $4+4+3+3=14$ عصا.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mahit-hadd'], prompt: 'المبلغ الذي يوفّره السياج الجديد بالدينار:', expected: 300,
            explain: 'يوفّر عصوين: $16-14=2$ ، وثمنهما $2\\times150=300$ دج.' },
          { kind: 'solution', ask: 0, lines: [
            'المستطيل المقترح فيه $3\\times4=12$ بلاطة أيضًا، وسياجه $4+4+3+3=14$ عصا.',
            'يوفّر الترتيب الجديد $16-14=2$ عصا، أي $2\\times150=300$ دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — حوض أزهار',
    context: 'العناية بحديقة المدرسة',
    emoji: '🌷',
    tone: 'emerald',
    source: addition('exam_style_problem'),
    figure: PROBLEM_FIGURES['masala-2'],
    statement: 'في حديقة المدرسة حوض أزهار سداسي رُسم على ورقة مرصوفة: كل خانة رقعة عشب جاهزة، وبعض الخانات على الجانبين مقطوع بقطر إلى نصفين. أراد بستاني المدرسة أن يعرف مساحة الحوض ليبدّله بمستطيل من الرقع نفسها العدد دون زيادة ولا نقصان، وأن يقارن سياجي مستطيلين لهما المساحة نفسها. وتتعاون الأسرة التربوية على غرس الأزهار.',
    data: [
      { id: 'b1', text: 'الحوض مرسوم على ورقة مرصوفة: كل خانة رقعة عشب', useful: true },
      { id: 'b2', text: 'بعض الخانات مقطوع بقطر إلى نصفين', useful: true },
      { id: 'b3', text: 'يُراد مستطيل من صفّين اثنين له المساحة نفسها', useful: true },
      { id: 'b4', text: 'تتعاون الأسرة التربوية على غرس الأزهار', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الرقع الكاملة والأنصاف',
        question: 'كم رقعة كاملة في الحوض وكم نصف رقعة؟',
        asks: ['عدد الرقع الكاملة', 'عدد الأنصاف'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-rasf'], prompt: 'عدد الرقع الكاملة (صفّ علوي، صفّ أوسط، صفّ سفلي):', expected: 14,
            explain: 'في الصفّ العلوي 4 رقع كاملة وفي الأوسط 6 وفي السفلي 4: $4+6+4=14$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tariqat-rasf'], prompt: 'عدد أنصاف الرقع (اثنان في الأعلى واثنان في الأسفل):', expected: 4,
            explain: 'على كل من الجانبين الأيمن والأيسر نصفان: $2+2=4$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الرقع الكاملة: $4+6+4=14$ .',
            'الأنصاف: اثنان في الأعلى واثنان في الأسفل: 4 أنصاف.',
          ] },
        ],
      },
      {
        label: '2)', title: 'مساحة الحوض ومستطيل مثله',
        question: 'ما مساحة الحوض؟ وكم رقعة في كل صفّ من المستطيل ذي الصفّين الذي له المساحة نفسها؟',
        asks: ['مساحة الحوض', 'عدد الرقع في الصفّ'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-rasf'], prompt: 'مساحة الحوض بالرقع الكاملة (كل نصفين رقعة):', expected: 16,
            explain: 'أربعة أنصاف هي رقعتان: $14+2=16$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tariqat-rasf'], prompt: 'كم رقعة في كل صفّ من مستطيل من صفّين مساحته 16 رقعة؟',
            options: ['8 رقع', '16 رقعة', '4 رقع'], correct: 0,
            explain: 'مستطيل من صفّين متساويين: في كل صفّ نصف الرقع، أي $16\\div2=8$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نضمّ كل نصفين في رقعة: الأنصاف الأربعة تعطي رقعتين.',
            'المساحة $14+2=16$ رقعة، وفي كل صفّ من المستطيل ذي الصفّين $16\\div2=8$ رقع.',
          ] },
        ],
      },
      {
        label: '3)', title: 'أيّ السياجين أقصر؟',
        question: 'أيّ السياجين أقصر: سياج المستطيل ذي الصفّين الذي مساحته 16 رقعة أم سياج المربّع الذي مساحته 16 رقعة؟ وبكم عصا؟',
        asks: ['السياج الأقصر', 'الفرق بين السياجين'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['mahit-hadd'], prompt: 'عدد عصي سياج المستطيل: صفّان في كل صفّ ثماني رقع:', expected: 20,
            explain: 'في أعلاه وأسفله 8 عصي في كل منهما، وفي كل جانب عصوان: $8+8+2+2=20$ .' },
          { kind: 'numeric', role: 'compute', requires: ['mahit-hadd'], prompt: 'عدد عصي سياج المربّع: أربعة صفوف في كل صفّ أربع رقع:', expected: 16,
            explain: 'على كل من الأضلاع الأربعة 4 عصي: $4+4+4+4=16$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['thalath-hallat'], prompt: 'أيّ السياجين أقصر؟',
            options: ['سياج المربّع', 'سياج المستطيل ذي الصفّين', 'السياجان متساويان'], correct: 0,
            explain: 'المربّع: 16 عصا، والمستطيل: 20 عصا، والمساحة واحدة (16 رقعة): نفس المساحة بمحيطين مختلفين.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['thalath-hallat'], prompt: 'الفرق بين السياجين بالعصي:', expected: 4,
            explain: '$20-16=4$ عصي.' },
          { kind: 'solution', ask: 0, lines: [
            'سياج المستطيل ذي الصفّين $8+8+2+2=20$ عصا، وسياج المربّع $4\\times4=16$ عصا.',
            'السياج الأقصر هو سياج المربّع، ويوفّر $20-16=4$ عصي، والمساحة في الحالتين 16 رقعة.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — ورشة الزليج',
    context: 'ورشة تكسية جدار',
    emoji: '🧱',
    tone: 'amber',
    source: addition('exam_style_problem'),
    figure: PROBLEM_FIGURES['masala-3'],
    statement: 'يكسو حرفي جدارًا بالزليج. رُسم الجدار على ورقة مرصوفة: ثلاثة صفوف في كل صفّ سبع خانات، وكل خانة بلاطة صغيرة. توجد أيضًا بلاطة كبيرة مساحتها ضعف مساحة البلاطة الصغيرة، وثمن البلاطة الكبيرة 90 دج. يشتري الحرفي بلاطات كبيرة ويقطع بلاطة منها نصفين إن لزم، ثم يهدي النصف الباقي لجارته التي تصلح جدار بيتها.',
    data: [
      { id: 'w1', text: 'الجدار ثلاثة صفوف في كل صفّ سبع خانات، وكل خانة بلاطة صغيرة', useful: true },
      { id: 'w2', text: 'مساحة البلاطة الكبيرة ضعف مساحة الصغيرة', useful: true },
      { id: 'w3', text: 'ثمن البلاطة الكبيرة 90 دج', useful: true },
      { id: 'w4', text: 'يهدي الحرفي النصف الباقي لجارته', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مساحة الجدار بالبلاطات الصغيرة',
        question: 'ما مساحة الجدار بوحدة البلاطة الصغيرة؟',
        asks: ['مساحة الجدار بالصغيرة'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['masaha-adad'], prompt: 'عدد البلاطات الصغيرة التي تغطّي الجدار (ثلاثة صفوف من سبع):', expected: 21,
            explain: 'ثلاثة صفوف في كل صفّ سبع بلاطات: $7+7+7=21$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نعدّ البلاطات صفًّا صفًّا: $7+7+7=21$ .',
            'مساحة الجدار 21 وحدة، وحدتها البلاطة الصغيرة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'مساحته بالبلاطات الكبيرة',
        question: 'ما مساحة الجدار بوحدة البلاطة الكبيرة؟',
        asks: ['مساحة الجدار بالكبيرة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['wahdatan-adad'], prompt: 'البلاطة الكبيرة تغطّي بلاطتين صغيرتين. لتغطية الجدار نفسه نحتاج من الكبيرة إلى:',
            options: ['نصف عدد الصغيرة', 'ضعف عدد الصغيرة', 'العدد نفسه'], correct: 0,
            explain: 'وحدة أكبر تغطّي أكثر، فنحتاج إلى عدد أقل منها: نصف العدد.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['wahdatan-adad'], prompt: 'مساحة الجدار بالبلاطات الكبيرة:', expected: 10.5,
            explain: '$21\\div2=10{,}5$ : عشر بلاطات كبيرة ونصف بلاطة.' },
          { kind: 'solution', ask: 0, lines: [
            'الوحدة الكبيرة ضعف الصغيرة، فعددها نصف عدد الصغيرة.',
            'المساحة $21\\div2=10{,}5$ وحدة كبيرة.',
          ] },
        ],
      },
      {
        label: '3)', title: 'عدد البلاطات الكبيرة وثمنها',
        question: 'كم بلاطة كبيرة يشتري الحرفي؟ وما ثمنها؟',
        asks: ['عدد البلاطات الكبيرة', 'ثمنها'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['wahdatan-adad'], prompt: 'لا تُباع نصف بلاطة. كم بلاطة كبيرة يشتريها الحرفي ليغطّي عشر بلاطات ونصفًا؟',
            options: ['11 بلاطة ويقطع واحدة منها نصفين', '10 بلاطات فقط', '21 بلاطة'], correct: 0,
            explain: 'عشر بلاطات لا تكفي لأنّ نصف بلاطة يبقى بلا تغطية: يشتري 11 ويقطع بلاطة نصفين، ويهدي النصف الباقي.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['wahdatan-adad'], prompt: 'عدد البلاطات الكبيرة المشتراة:', expected: 11,
            explain: '$10{,}5$ تقريب بالزيادة إلى 11 لأنّ البلاطة تُباع كاملة.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['wahdatan-adad'], prompt: 'ثمن البلاطات الكبيرة بالدينار:', expected: 990,
            explain: '$11\\times90=990$ دج.' },
          { kind: 'solution', ask: 0, lines: [
            'مساحة الجدار $10{,}5$ وحدة كبيرة، ولا تُباع نصف بلاطة، فيشتري الحرفي 11 بلاطة ويقطع واحدة منها نصفين.',
            'الثمن $11\\times90=990$ دج.',
          ] },
        ],
      },
    ],
  },
];
export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
