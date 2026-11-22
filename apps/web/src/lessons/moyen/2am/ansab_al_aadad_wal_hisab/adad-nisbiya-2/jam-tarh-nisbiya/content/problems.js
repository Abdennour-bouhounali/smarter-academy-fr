/**
 * Les trois « مسائل » du درس « جمع وطرح عددين نسبيين » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). La مسألة 1 est la matinée d'une station météo (`LESSON_CONFIG.lessonProblem`) ; la 2 un immeuble (ascenseur) ; la 3 un
 * quiz entre deux classes. Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt). Chaque مسألة porte son
 * tableau (son support dessiné) ; jamais d'argent, jamais de pari.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — صباحات الجلفة',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🌡️',
    tone: 'sky',
    source: SOURCE,
    table: LESSON_CONFIG.lessonProblem.table,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'حرارة الفجر $-4\\,{}^{\\circ}\\mathrm{C}$', useful: true },
      { id: 'd2', text: 'ارتفاع $11$ درجة حتى الظهر ثم انخفاض $9$ درجات في المساء', useful: true },
      { id: 'd3', text: 'تقع الجلفة في الهضاب العليا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حرارة الظهر',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['حرارة الظهر'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jam-ishara-mukhtalifa'], prompt: 'حرارة الظهر $(-4)+(+11)=$', expected: 7,
            explain: 'الارتفاع يضيف $(+11)$ : المسافتان $4$ و $11$ ، فرقهما $7$ ، والأبعد عن الصفر $+11$ : $+7$ .' },
          { kind: 'solution', ask: 0, lines: ['الارتفاع بـ $11$ درجة هو إضافة $(+11)$ .', '$(-4)+(+11)=(+7)$ : حرارة الظهر $7$ درجات فوق الصفر.'] },
        ],
      },
      {
        label: '2)', title: 'حرارة المساء',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['حرارة المساء'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jam-ishara-mukhtalifa'], prompt: 'حرارة المساء $(+7)+(-9)=$', expected: -2,
            explain: 'الانخفاض بـ $9$ درجات هو إضافة $(-9)$ : $9-7=2$ والأبعد عن الصفر $-9$ : $-2$ .' },
          { kind: 'solution', ask: 0, lines: ['الانخفاض بـ $9$ درجات هو إضافة $(-9)$ .', '$(+7)+(-9)=(-2)$ : حرارة المساء درجتان تحت الصفر.'] },
        ],
      },
      {
        label: '3)', title: 'الفرق بين المساء والفجر',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['الفرق'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tarh-bi-muakis'], prompt: 'حرارة المساء ناقص حرارة الفجر: $(-2)-(-4)=$', expected: 2,
            explain: '$(-2)-(-4)=(-2)+(+4)=(+2)$ : المساء أدفأ من الفجر بدرجتين.' },
          { kind: 'solution', ask: 0, lines: ['نطرح حرارة الفجر من حرارة المساء: $(-2)-(-4)$ .', 'نضيف المعاكس: $(-2)+(+4)=(+2)$ ، فالمساء أدفأ بدرجتين.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — مصعد البرج',
    context: 'طوابق برج',
    emoji: '🏢',
    tone: 'teal',
    source: SOURCE,
    statement: 'في برج طوابق من $-4$ (المرأب) إلى $+15$ . ركبت مريم المصعد في الطابق $-2$ ، فصعدت $9$ طوابق، ثم نزلت $11$ طابقًا.',
    table: { caption: 'تنقّل مريم في المصعد', head: ['البداية', 'الصعود', 'النزول'], rows: [['-2', '+9', '-11']] },
    data: [
      { id: 'a', text: 'الطوابق من $-4$ إلى $+15$ ، وانطلاق مريم من الطابق $-2$', useful: true },
      { id: 'b', text: 'صعدت $9$ طوابق ثم نزلت $11$ طابقًا', useful: true },
      { id: 'c', text: 'يتّسع المصعد لثمانية أشخاص', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الطابق بعد الصعود',
        question: 'في أيّ طابق صارت مريم بعد أن صعدت $9$ طوابق؟',
        asks: ['الطابق'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jam-ishara-mukhtalifa'], prompt: '$(-2)+(+9)=$', expected: 7,
            explain: '$9-2=7$ والأبعد عن الصفر $+9$ : الطابق $+7$ .' },
          { kind: 'solution', ask: 0, lines: ['الصعود بـ $9$ طوابق هو إضافة $(+9)$ .', '$(-2)+(+9)=(+7)$ .'] },
        ],
      },
      {
        label: '2)', title: 'الطابق بعد النزول',
        question: 'ثم نزلت $11$ طابقًا. في أيّ طابق وصلت؟',
        asks: ['الطابق'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jam-ishara-mukhtalifa'], prompt: '$(+7)+(-11)=$', expected: -4,
            explain: '$11-7=4$ والأبعد عن الصفر $-11$ : الطابق $-4$ ، وهو المرأب.' },
          { kind: 'solution', ask: 0, lines: ['النزول بـ $11$ طابقًا هو إضافة $(-11)$ .', '$(+7)+(-11)=(-4)$ : وصلت مريم إلى المرأب.'] },
        ],
      },
      {
        label: '3)', title: 'كم طابقًا بين الطابقين؟',
        question: 'من الطابق $+7$ إلى الطابق $-4$ : اكتب الفرق.',
        asks: ['الفرق'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tarh-bi-muakis'], prompt: 'الطابق الجديد ناقص القديم: $(-4)-(+7)=$', expected: -11,
            explain: '$(-4)-(+7)=(-4)+(-7)=(-11)$ : نزلت $11$ طابقًا.' },
          { kind: 'solution', ask: 0, lines: ['نطرح الطابق القديم من الجديد: $(-4)-(+7)$ .', '$(-4)+(-7)=(-11)$ : نزلت $11$ طابقًا.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — مسابقة بين قسمين',
    context: 'مسابقة ثقافية',
    emoji: '🏆',
    tone: 'emerald',
    source: SOURCE,
    statement: 'في مسابقة ثقافية بين قسمين: الإجابة الصحيحة تعطي $+5$ نقاط والخاطئة تعطي $-3$ . الجولة الأولى: القسم أ سجّل $(+10)$ ثم $(-6)$ ، والقسم ب سجّل $(+5)$ ثم $(-9)$ .',
    table: { caption: 'نقاط الجولة الأولى', head: ['القسم', 'النتيجة الأولى', 'النتيجة الثانية'], rows: [['أ', '+10', '-6'], ['ب', '+5', '-9']] },
    data: [
      { id: 'a', text: 'القسم أ: $(+10)$ ثم $(-6)$', useful: true },
      { id: 'b', text: 'القسم ب: $(+5)$ ثم $(-9)$', useful: true },
      { id: 'c', text: 'تقام المسابقة في قاعة المحاضرات', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حصيلة القسم أ',
        question: 'ما حصيلة القسم أ في الجولة؟',
        asks: ['الحصيلة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jam-ishara-mukhtalifa'], prompt: '$(+10)+(-6)=$', expected: 4,
            explain: '$10-6=4$ والأبعد عن الصفر $+10$ : $+4$ .' },
          { kind: 'solution', ask: 0, lines: ['المسافتان $10$ و $6$ ، فرقهما $4$ .', 'الأبعد عن الصفر $+10$ ، فالحصيلة $(+4)$ .'] },
        ],
      },
      {
        label: '2)', title: 'حصيلة القسم ب',
        question: 'ما حصيلة القسم ب في الجولة؟',
        asks: ['الحصيلة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jam-ishara-mukhtalifa'], prompt: '$(+5)+(-9)=$', expected: -4,
            explain: '$9-5=4$ والأبعد عن الصفر $-9$ : $-4$ .' },
          { kind: 'solution', ask: 0, lines: ['المسافتان $5$ و $9$ ، فرقهما $4$ .', 'الأبعد عن الصفر $-9$ ، فالحصيلة $(-4)$ .'] },
        ],
      },
      {
        label: '3)', title: 'هل الحصيلتان متعاكستان؟',
        question: 'هل حصيلتا القسمين متعاكستان؟',
        asks: ['الجواب'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mutaakisan-sifr'], prompt: '$(+4)$ و $(-4)$ :', options: ['متعاكستان، مجموعهما $0$', 'متساويان، مجموعهما $8$', 'متعاكستان، مجموعهما $8$'], correct: 0, cols: 1,
            explain: 'لهما المسافة نفسها $4$ إلى الصفر وإشارتان مختلفتان، فمجموعهما $(+4)+(-4)=0$ .' },
          { kind: 'solution', ask: 0, lines: ['$(+4)$ و $(-4)$ لهما المسافة نفسها وإشارتان مختلفتان: متعاكسان.', 'مجموعهما $0$ .'] },
        ],
      },
      {
        label: '4)', title: 'كم ينقص القسم ب؟',
        question: 'كم نقطة ينقص القسم ب ليلحق بالقسم أ؟',
        asks: ['الفرق'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tarh-bi-muakis'], prompt: 'حصيلة أ ناقص حصيلة ب: $(+4)-(-4)=$', expected: 8,
            explain: '$(+4)-(-4)=(+4)+(+4)=(+8)$ : ينقصه $8$ نقاط.' },
          { kind: 'solution', ask: 0, lines: ['نطرح حصيلة ب من حصيلة أ: $(+4)-(-4)$ .', '$(+4)+(+4)=(+8)$ : ينقص القسم ب ثماني نقاط.'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
