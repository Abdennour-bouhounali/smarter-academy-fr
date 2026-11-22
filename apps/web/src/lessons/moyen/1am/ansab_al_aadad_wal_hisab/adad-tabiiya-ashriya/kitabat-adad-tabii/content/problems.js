/**
 * Les trois « مسائل » du درس « كتابة الأعداد الطبيعية ودلالة الأرقام » (modules 6, 7, 8) — exercices COMPLETS de type
 * اختبار الفصل الأول, résolus pas à pas (GuidedProblem). AJOUTS DE LA PLATEFORME (`addition('exam_style_problem')`).
 * Périmètre : lire / écrire un entier par classes, رقم / عدد d'un rang, مفكوك d'un entier, le suivant d'un nombre (l'échange
 * en cascade). Chaque nombre est vérifié dans ./problems.test.js.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — صكّ جمعية الحيّ',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🧾',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'words', text: 'المبلغ بالحروف: مائتان وخمسة وأربعون ألفا وثلاثمائة وثمانون دينارًا', useful: true },
      { id: 'notes', text: 'أوراق من فئة 1000 دج', useful: true },
      { id: 'library', text: 'التبرّع لترميم مكتبة المدرسة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المبلغ بالأرقام',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['المبلغ بالأرقام'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['fiaat'],
            prompt: 'في «مائتان وخمسة وأربعون ألفا وثلاثمائة وثمانون» فئتان. ما هما؟',
            options: ['فئة الآلاف 245 وفئة الوحدات 380', 'فئة الآلاف 200 وفئة الوحدات 45380', 'فئة الملايين 245 وفئة الآلاف 380'],
            correct: 0,
            explain: 'ما قبل «ألفا» هو فئة الآلاف: 245 ؛ وما بعده فئة الوحدات: 380.' },
          { kind: 'numeric', role: 'answer', ask: 0, prompt: 'المبلغ بالأرقام (دج):', expected: 245380,
            explain: '$245\\,380$ : فئتان من ثلاثة أرقام.' },
          { kind: 'solution', ask: 0, lines: [
            'فئة الآلاف: مائتان وخمسة وأربعون = 245 ؛ فئة الوحدات: ثلاثمائة وثمانون = 380.',
            'المبلغ: $245\\,380$ دج.',
          ] },
        ],
      },
      {
        label: '2)', title: 'رقم الآلاف وعدد الآلاف',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['رقم الآلاف', 'عدد الآلاف'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jadwal-maratib'],
            prompt: 'رقم الآلاف في 245380 هو:',
            options: ['5', '245', '2'],
            correct: 0,
            explain: 'من اليمين: 0 آحاد، 8 عشرات، 3 مئات، 5 آلاف.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['raqm-adad'], prompt: 'عدد الآلاف في 245380:', expected: 245,
            explain: 'نحذف الأرقام الثلاثة التي على يمين الآلاف: 245. $245\\,380 = 245 \\times 1000 + 380$.' },
          { kind: 'solution', ask: 0, lines: [
            'رقم الآلاف هو 5.',
            'عدد الآلاف هو 245 لأنّ $245\\,380 = 245 \\times 1000 + 380$.',
          ] },
        ],
      },
      {
        label: '3)', title: 'أوراق من 1000 دج',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['كم ورقة؟', 'كم يبقى؟'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['raqm-adad'], prompt: 'عدد الأوراق من فئة 1000 دج:', expected: 245,
            explain: 'عدد الأوراق هو عدد الآلاف: 245.' },
          { kind: 'numeric', role: 'answer', ask: 1, prompt: 'المبلغ الباقي (دج):', expected: 380,
            explain: '$245\\,380 - 245\\,000 = 380$.' },
          { kind: 'solution', ask: 0, lines: [
            'كل ورقة 1000 دج: عدد الأوراق هو عدد الآلاف، 245 ورقة.',
            'يبقى 380 دج، أقلّ من ورقة واحدة.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — أوراق قاعة الطباعة',
    context: 'التحزيم والتفكيك',
    emoji: '📄',
    tone: 'amber',
    source: SOURCE,
    illustration: {
      kind: 'stacks',
      rows: [
        { icon: 'crate', count: 4, label: 'صناديق' },
        { icon: 'book', count: 12, label: 'رزم' },
        { icon: 'tile', count: 23, label: 'أوراق' },
      ],
      ariaLabel: 'مخزن قاعة الطباعة: 4 صناديق من 1000 ورقة، 12 رزمة من 100 ورقة، و 23 ورقة منفردة',
    },
    statement: 'في مخزن قاعة الطباعة بالمتوسطة 4 صناديق في كل منها 1000 ورقة، و 12 رزمة في كل منها 100 ورقة، و 23 ورقة منفردة. يحرص المسؤول على ألّا تُهدر أيّ ورقة، فيحصي المخزون بدقّة. تشتغل آلة الطباعة 6 ساعات في اليوم.',
    data: [
      { id: 'boxes', text: '4 صناديق من 1000 ورقة', useful: true },
      { id: 'reams', text: '12 رزمة من 100 ورقة', useful: true },
      { id: 'loose', text: '23 ورقة منفردة', useful: true },
      { id: 'hours', text: 'تشتغل الآلة 6 ساعات في اليوم', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'عدد الأوراق',
        question: 'كم ورقة في المخزن؟ اكتب العدد بالأرقام ثم بالحروف.',
        asks: ['العدد بالأرقام', 'العدد بالحروف'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tabadul'],
            prompt: '12 رزمة من 100 ورقة تساوي:',
            options: ['صندوقًا واحدًا (1000) ورزمتين (200)', '12 ورقة', '120 ورقة'],
            correct: 0,
            explain: '10 رزم = 1000 ورقة: $12 \\times 100 = 1200 = 1000 + 200$.' },
          { kind: 'numeric', role: 'answer', ask: 0, prompt: 'عدد الأوراق:', expected: 5223,
            explain: '$4000 + 1200 + 23 = 5223$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['fiaat'],
            prompt: 'العدد 5223 يُقرأ:',
            options: ['خمسة آلاف ومائتان وثلاثة وعشرون', 'أربعة آلاف واثنا عشر ألفا وثلاثة وعشرون', 'خمسمائة واثنان وعشرون ألفا وثلاثة'],
            correct: 0,
            explain: '$5\\,223$ : فئة الآلاف 5 ، فئة الوحدات 223.' },
          { kind: 'solution', ask: 0, lines: [
            '$4 \\times 1000 + 12 \\times 100 + 23 = 4000 + 1200 + 23 = 5223$.',
            'نلاحظ أنّ 12 مئة = 1 ألف و 2 مئتان: لا تحمل مرتبة أكثر من 9.',
            '5223 : خمسة آلاف ومائتان وثلاثة وعشرون.',
          ] },
        ],
      },
      {
        label: '2)', title: 'المفكوك النموذجي',
        question: 'اكتب المفكوك النموذجي للعدد 5223.',
        asks: ['المفكوك النموذجي'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mafkuk'],
            prompt: 'المفكوك النموذجي للعدد 5223 هو:',
            options: ['$5 \\times 1000 + 2 \\times 100 + 2 \\times 10 + 3$', '$4 \\times 1000 + 12 \\times 100 + 23$', '$5 + 2 + 2 + 3$'],
            correct: 0, cols: 1,
            explain: 'في المفكوك النموذجي كل رقم مضروب في قيمة مرتبته، وكل رقم بين 0 و 9: $4 \\times 1000 + 12 \\times 100 + 23$ صحيحة حسابيًا لكنها ليست المفكوك النموذجي.' },
          { kind: 'solution', ask: 0, lines: [
            'رقم الآلاف 5، رقم المئات 2، رقم العشرات 2، رقم الآحاد 3.',
            '$5223 = 5 \\times 1000 + 2 \\times 100 + 2 \\times 10 + 3$.',
          ] },
        ],
      },
      {
        label: '3)', title: 'رزم الامتحان',
        question: 'يحتاج امتحان الفصل إلى رزم كاملة من 100 ورقة. كم رزمة كاملة يمكن تحضيرها من المخزون؟ وكم ورقة تبقى؟',
        asks: ['عدد الرزم الكاملة', 'الأوراق الباقية'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['raqm-adad'], prompt: 'عدد الرزم الكاملة:', expected: 52,
            explain: 'عدد المئات في 5223: نحذف الرقمين اللذين على يمين المئات، 52.' },
          { kind: 'numeric', role: 'answer', ask: 1, prompt: 'الأوراق الباقية:', expected: 23,
            explain: '$5223 = 52 \\times 100 + 23$.' },
          { kind: 'solution', ask: 0, lines: [
            'عدد المئات في 5223 هو 52 (وليس 2، رقم المئات).',
            '$5223 = 52 \\times 100 + 23$ : 52 رزمة كاملة وتبقى 23 ورقة.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — عدّاد زوّار معرض الكتاب',
    context: 'العدد الذي يلي',
    emoji: '📚',
    tone: 'violet',
    source: SOURCE,
    illustration: { kind: 'scene', icon: 'book', bg: 'violet', chips: [{ label: 'العدّاد مساء الجمعة', value: 1099999, tone: 'violet' }, { label: 'زائر جديد', value: 1, tone: 'green' }], ariaLabel: 'عدّاد زوّار معرض الكتاب يشير إلى 1099999، ويدخل زائر جديد' },
    statement: 'يُظهر العدّاد الرقمي لزوّار المعرض الدولي للكتاب مساء الجمعة العدد 1099999، فرحًا بإقبال الشباب على المطالعة. صباح السبت يدخل زائر جديد.',
    data: [
      { id: 'counter', text: 'العدّاد يُظهر 1099999', useful: true },
      { id: 'one', text: 'يدخل زائر واحد', useful: true },
      { id: 'day', text: 'اليوم هو السبت', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'قراءة العدّاد',
        question: 'أعد كتابة العدد 1099999 بفئات من ثلاثة أرقام، ثم اكتبه بالحروف.',
        asks: ['قراءة العدد'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['fiaat'],
            prompt: 'تجزئة 1099999 إلى فئات:',
            options: ['$1\\,099\\,999$', '$109\\,999\\,9$', '$10\\,999\\,99$'],
            correct: 0,
            explain: 'من اليمين: 999 ثم 099 ثم 1.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['fiaat'],
            prompt: 'العدد يُقرأ:',
            options: ['مليون وتسعة وتسعون ألفا وتسعمائة وتسعة وتسعون', 'مائة وتسعة ملايين وتسعمائة وتسعة وتسعون', 'مليون وتسعمائة وتسعة وتسعون ألفا وتسعة وتسعون'],
            correct: 0, cols: 1,
            explain: 'فئة الملايين 1 ، فئة الآلاف 099 أي 99 ، فئة الوحدات 999.' },
          { kind: 'solution', ask: 0, lines: [
            'نجزّئ من اليمين: $1\\,099\\,999$ (فئة الملايين 1 ، فئة الآلاف 099 ، فئة الوحدات 999).',
            'يُقرأ: مليون وتسعة وتسعون ألفا وتسعمائة وتسعة وتسعون.',
          ] },
        ],
      },
      {
        label: '2)', title: 'زائر جديد',
        question: 'ماذا يُظهر العدّاد بعد دخول الزائر الجديد؟ اكتبه بالأرقام وبالحروف.',
        asks: ['العدد بالأرقام', 'العدد بالحروف'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tabadul'],
            prompt: 'عند إضافة 1 إلى 1099999، كم مرتبة تمتلئ بعشرة وتصبح واحدًا في المرتبة التالية؟',
            options: ['خمس مراتب: الآحاد، العشرات، المئات، الآلاف، عشرات الآلاف', 'مرتبة واحدة: الآحاد', 'كل المراتب السبع'],
            correct: 0, cols: 1,
            explain: 'الأرقام الخمسة 9 الأخيرة تصبح 0، و 0 مئات الآلاف يصبح 1.' },
          { kind: 'numeric', role: 'answer', ask: 0, prompt: 'العدد الجديد:', expected: 1100000,
            explain: '$1\\,099\\,999 + 1 = 1\\,100\\,000$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['fiaat'],
            prompt: 'يُقرأ:',
            options: ['مليون ومائة ألف', 'مليون ومائة', 'مائة وعشرة آلاف'],
            correct: 0,
            explain: 'فئة الملايين 1 ، فئة الآلاف 100 ، فئة الوحدات 000.' },
          { kind: 'solution', ask: 0, lines: [
            'بعد إضافة 1، تمتلئ الآحاد ثم العشرات ثم المئات ثم الآلاف ثم عشرات الآلاف، فيصبح رقم مئات الآلاف 1.',
            '$1\\,100\\,000$ : مليون ومائة ألف.',
          ] },
        ],
      },
      {
        label: '3)', title: 'المراتب',
        question: 'في العدد 1100000: ما رقم مئات الآلاف؟ وما عدد الآلاف؟ واكتب مفكوكه النموذجي.',
        asks: ['رقم مئات الآلاف', 'عدد الآلاف', 'المفكوك النموذجي'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jadwal-maratib'], prompt: 'رقم مئات الآلاف:', expected: 1,
            explain: 'من اليمين: آحاد، عشرات، مئات، آلاف، عشرات الآلاف (0)، مئات الآلاف (1).' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['raqm-adad'], prompt: 'عدد الآلاف:', expected: 1100,
            explain: 'نحذف الأرقام الثلاثة التي على يمين الآلاف: 1100.' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['mafkuk'],
            prompt: 'المفكوك النموذجي:',
            options: ['$1 \\times 1\\,000\\,000 + 1 \\times 100\\,000$', '$1 \\times 1000 + 1 \\times 100$', '$11 \\times 100\\,000$'],
            correct: 0, cols: 1,
            explain: 'رتبتان غير معدومتين فقط: الملايين ومئات الآلاف.' },
          { kind: 'solution', ask: 0, lines: [
            'رقم مئات الآلاف 1 ، وعدد الآلاف 1100 لأنّ $1\\,100\\,000 = 1100 \\times 1000$.',
            '$1\\,100\\,000 = 1 \\times 1\\,000\\,000 + 1 \\times 100\\,000$.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
