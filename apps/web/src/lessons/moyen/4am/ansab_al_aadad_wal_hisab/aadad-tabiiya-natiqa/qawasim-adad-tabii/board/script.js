/**
 * « الدرس على السبّورة » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter).
 * The kinds of step and what the board does with each: `features/classSession/lessonScripts.js`.
 * Reached only through the lesson's pack (`lesson.pack.js › board.script`).
 *
 * The four rules of the lesson are not all « found by the same mirror » (owner, 2026-11-17): on the board each one is
 * met by a question made for it, in the order the student's world gives them — a gap and its planks, the partner of a
 * plank, the plank that needs a part of a plank, the planks to try, the planks a number tells at a glance — and every
 * answer is PROVED by the bridge the board builds. Only then the rule gets its name (the tablet of the student's world).
 * No `forge` step here: the class's rule-writing mirror is the pilot's (the remainder); the four keys of this lesson
 * are forged by each student in his world.
 */
export const SCRIPT = {
  title: 'قواسم عدد طبيعي',
  steps: [
    {
      id: 'situation',
      kind: 'situation',
      chapter: 'نكتشف',
      title: 'هوّة من 60 خانة',
      text: 'بين جزيرتين هوّة من 60 خانة. لا نبحث عن لوح واحد يملؤها تمامًا، بل عن كلّ الألواح التي تفعل.',
      question: 'هل يثبت الجسر باللوح 8؟ وبأيّ ألواح أخرى؟',
      bridge: { a: 60, b: 8 },
      cue: 'قبل البناء: من يتوقّع؟ وكيف نعرف أنّنا وجدنا كلّ الألواح؟',
    },
    {
      id: 'partner',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'لوح يستدعي شريكه',
      text: 'ثبت الجسر باللوح 7 فوق هوّة من 56 خانة: $56 = 7 \\times 8$.',
      question: 'دون أيّ قسمة: أيّ لوح آخر يثبت بالتأكيد؟',
      a: 56,
      options: [6, 8, 9, 12],
      answer: [8],
      after: '7 ألواح ثمانية الطول، أو 8 ألواح سبعة الطول: $56 = 7 \\times 8 = 8 \\times 7$. العاملان قاسمان معًا.',
      cue: 'كيف عرفتم أنّ 8 يثبت دون أن تقسموا؟ وهل نجد بالطريقة نفسها شريكًا لعدد آخر؟',
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'jidaa-aamilayn',
      recall: ['جداء', 'قاسمين'],
      cue: 'اكتبوا 24 جداءَ عاملين بكلّ الأشكال: ماذا نقرأ؟',
    },
    {
      id: 'part',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'نصف لوح',
      text: 'هوّة من 31 خانة. بعض الألواح تترك في آخر الجسر «جزءًا من لوح».',
      question: 'أيّ لوحين يثبتان فعلًا؟',
      a: 31,
      options: [1, 2, 5, 31],
      answer: [1, 31],
      after:
        '$31 = 2 \\times 15{,}5$: لا يوجد جزء من لوح، فلا يثبت اللوح 2. نحتاج عددًا طبيعيًّا من الألواح: $31 = 1 \\times 31$.',
      cue: 'ماذا قال الحاصل بفاصلة عن اللوح؟',
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'qasim-rappel',
      recall: ['عدد طبيعي', 'يوجد'],
      cue: 'هل 4 قاسم للعدد 36؟ وهل 2 قاسم للعدد 31؟ برّروا بالجداء.',
    },
    {
      id: 'search',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'أين نتوقّف؟',
      text: 'هوّة من 60 خانة. نجرّب الألواح بالترتيب: 1 ثمّ 2 ثمّ 3 … وكلّ لوح يثبت يعطي شريكًا.',
      question: 'أيّ هذه الألواح يثبت؟ وإلى أيّ لوح يكفي أن نجرّب؟',
      a: 60,
      options: [4, 5, 7, 8, 12, 15],
      answer: [4, 5, 12, 15],
      after:
        '$60 = 1 \\times 60 = 2 \\times 30 = 3 \\times 20 = 4 \\times 15 = 5 \\times 12 = 6 \\times 10$. ونتوقّف عند 7: $7^2 = 49 \\leq 60 < 64 = 8^2$.',
      cue: 'بعد 7: هل نجد قاسمًا جديدًا؟ أم جداءات نعرفها مقلوبة؟',
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'tariqa-qawasim',
      recall: ['مربّعها', 'لا يتجاوز'],
      cue: 'لعدد 105: إلى أيّ لوح نجرّب؟ لماذا؟',
    },
    {
      id: 'glance',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'عدد كبير، دون قسمة',
      text: 'هوّة من 252 خانة، وخمسة ألواح: 2 و 3 و 4 و 5 و 9. لا نريد أن نقسم.',
      question: 'أيّ الألواح تثبت؟ اقرأوا أرقام العدد.',
      a: 252,
      options: [2, 3, 4, 5, 9],
      answer: [2, 3, 4, 9],
      after:
        'الآحاد 2 (زوجي، وليس 0 أو 5)؛ مجموع الأرقام $2+5+2 = 9$ فيقبل القسمة على 3 وعلى 9؛ الرقمان الأخيران 52 مضاعف للعدد 4.',
      cue: 'ما الذي نقرؤه في العدد لنعرف أنّ 5 لا يثبت؟',
    },
    {
      id: 'name-4',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'qawaid-qisma',
      recall: ['الآحاد', 'مجموع الأرقام'],
      cue: 'هل 4620 يقبل القسمة على 4؟ وعلى 9؟ دون قسمة.',
    },
    // the copybook is two pages of two keys: the four tablets of this lesson are too long for one screen
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 1 و 2',
      tablets: ['jidaa-aamilayn', 'qasim-rappel'],
      cue: 'بعد النقل: من يذكّرنا بالمفتاحين دون أن ينظر إلى السبّورة؟',
    },
    {
      id: 'trace-2',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 3 و 4',
      tablets: ['tariqa-qawasim', 'qawaid-qisma'],
      cue: 'بعد النقل: من يذكّرنا بالمفاتيح الأربعة دون أن ينظر إلى السبّورة؟',
    },
  ],
};
