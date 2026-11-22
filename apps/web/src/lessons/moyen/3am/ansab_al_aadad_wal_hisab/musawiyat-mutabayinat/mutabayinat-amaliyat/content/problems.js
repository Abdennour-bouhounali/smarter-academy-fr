/**
 * Les trois « مسائل » du درس « المتباينات والعمليات » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). La مسألة 1 (`LESSON_CONFIG.lessonProblem`) : la note d'un concours culturel, S = 50 − 3e ; la 2 l'ascenseur d'un immeuble
 * (25x + 80 ≤ 630) ; la 3 la clôture du jardin de l'école (12 < L < 15, ex-27 en deux étapes ×positif). Chaque مسألة n'utilise que les
 * PROPRIÉTÉS (ajouter, retrancher, multiplier, diviser les deux membres d'une inégalité) : jamais « حلّ متراجحة », jamais de produit de deux
 * encadrements. Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — المسابقة الثقافية',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🏆',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'يبدأ كل متسابق بـ 50 نقطة', useful: true },
      { id: 'd2', text: 'يخسر 3 نقاط عن كل إجابة خاطئة: S = 50 − 3e', useful: true },
      { id: 'd3', text: 'المسابقة في المتوسطة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'متباينة لـ −3e',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['المتباينة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['darb-salib'],
            prompt: 'بضرب طرفي $e>8$ في $-3$ نجد:',
            options: ['$-3e<-24$', '$-3e>-24$', '$3e<-24$', '$-3e>24$'], correct: 0, cols: 2,
            explain: 'نضرب في $-3$ وهو سالب فينعكس الاتجاه: $-3e<-24$ . ($-3e>-24$ تنسى عكس الاتجاه.)' },
          { kind: 'solution', ask: 0, lines: [
            'نضرب طرفي $e>8$ في $-3$ ، وهو عدد سالب تمامًا: يتغيّر الاتجاه.',
            'إذن $-3e<-24$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'متباينة لنتيجة أمين',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['متباينة لـ S'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-mutabayina'],
            prompt: 'بإضافة $50$ إلى طرفي $-3e<-24$ نجد:',
            options: ['$S<26$', '$S>26$', '$S<-26$', '$S>74$'], correct: 0, cols: 2,
            explain: 'نضيف $50$ إلى الطرفين: $50-3e<50-24$ أي $S<26$ . الجمع لا يغيّر الاتجاه.' },
          { kind: 'solution', ask: 0, lines: [
            'نضيف $50$ إلى طرفي $-3e<-24$ : $50-3e<50-24$ .',
            'إذن $S<26$ : نتيجة أمين أقلّ من $26$ نقطة.',
          ] },
        ],
      },
      {
        label: '3)', title: 'حصر نتيجة سلمى',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['حصر S'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-ab'],
            prompt: 'حصر نتيجة سلمى $S$ هو:',
            options: ['$35\\leq S\\leq 50$', '$50\\leq S\\leq 35$', '$-15\\leq S\\leq 0$', '$65\\leq S\\leq 80$'], correct: 0, cols: 2,
            explain: 'نضرب $0\\leq e\\leq 5$ في $-3$ : $-15\\leq -3e\\leq 0$ (ينعكس الاتجاه فنكتب الأصغر أولًا) ، ثم نضيف $50$ : $35\\leq S\\leq 50$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نضرب $0\\leq e\\leq 5$ في $-3$ : $-15\\leq -3e\\leq 0$ ، فالأصغر يُكتب أوّلًا.',
            'نضيف $50$ : $35\\leq 50-3e\\leq 50$ أي $35\\leq S\\leq 50$ .',
          ] },
        ],
      },
      {
        label: '4)', title: 'من نتيجته أكبر؟',
        question: LESSON_CONFIG.lessonProblem.questions[3].text,
        asks: ['الأكبر نتيجة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-ab'],
            prompt: 'من نتيجته أكبر؟',
            options: ['سلمى: نتيجتها $35\\leq S$ وهي أكبر من $26$ التي تتجاوزها نتيجة أمين', 'أمين: لأنّه أخطأ أكثر', 'لا يمكن الحكم'], correct: 0, cols: 1,
            explain: 'نتيجة أمين $S<26$ ونتيجة سلمى $S\\geq 35$ ، و $35>26$ : نتيجة سلمى أكبر.' },
          { kind: 'solution', ask: 0, lines: [
            'نتيجة أمين $S<26$ ، ونتيجة سلمى $S\\geq 35$ .',
            'لأنّ $26<35$ فنتيجة سلمى أكبر.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — مصعد العمارة',
    context: 'مصعد عمارة',
    emoji: '🛗',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'المصعد', lines: [{ label: 'الحدّ الأقصى kg', value: '630' }] }, { title: 'العامل', lines: [{ label: 'كتلته kg', value: '80' }] }, { title: 'الصناديق', lines: [{ label: 'كتلة الصندوق kg', value: '25' }] }], ariaLabel: 'ثلاث بطاقات: المصعد يحمل 630 كيلوغرامًا على الأكثر، والعامل كتلته 80 كيلوغرامًا، وكتلة كل صندوق 25 كيلوغرامًا' },
    statement: 'يحمل مصعد عمارة 630 kg على الأكثر. يركبه عامل كتلته 80 kg ومعه $x$ صندوقًا كتلة كلّ منها 25 kg .',
    data: [
      { id: 'max', text: 'يحمل المصعد 630 kg على الأكثر', useful: true },
      { id: 'worker', text: 'كتلة العامل 80 kg وكتلة كل صندوق 25 kg', useful: true },
      { id: 'building', text: 'العمارة في وسط المدينة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'شرط الحمولة',
        question: 'اكتب المتباينة التي تعبّر عن أنّ الحمولة لا تتجاوز ما يحمله المصعد.',
        asks: ['المتباينة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-mutabayina'],
            prompt: 'الحمولة تساوي $25x+80$ و « على الأكثر » تعني:',
            options: ['$25x+80\\leq 630$', '$25x+80\\geq 630$', '$25x+80<630$', '$25x\\leq 630$'], correct: 0, cols: 2,
            explain: 'كتلة الصناديق $25x$ وكتلة العامل $80$ ؛ الحمولة لا تتجاوز $630$ لكنها قد تساويها: $25x+80\\leq 630$ .' },
          { kind: 'solution', ask: 0, lines: [
            'كتلة الصناديق $25x$ وكتلة العامل $80$ : الحمولة $25x+80$ .',
            '« على الأكثر » تسمح بالتساوي: $25x+80\\leq 630$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'متباينة لـ 25x',
        question: 'استنتج متباينة لـ $25x$ .',
        asks: ['متباينة لـ 25x'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-mutabayina'],
            prompt: 'بطرح $80$ من طرفي $25x+80\\leq 630$ نجد:',
            options: ['$25x\\leq 550$', '$25x\\geq 550$', '$25x\\geq 710$', '$25x\\leq 530$'], correct: 0, cols: 2,
            explain: 'نطرح $80$ من الطرفين: $25x\\leq 630-80=550$ . الطرح لا يغيّر الاتجاه.' },
          { kind: 'solution', ask: 0, lines: [
            'نطرح $80$ من طرفي $25x+80\\leq 630$ .',
            'إذن $25x\\leq 550$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'متباينة طرفها الأول x',
        question: 'استنتج متباينة طرفها الأول $x$ .',
        asks: ['متباينة لـ x'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['darb-mujab'],
            prompt: 'بقسمة طرفي $25x\\leq 550$ على $25$ نجد:',
            options: ['$x\\leq 22$', '$x\\geq 22$', '$x\\leq 2$', '$x\\leq 21$'], correct: 0, cols: 2,
            explain: 'نقسم على $25$ وهو موجب فلا يتغيّر الاتجاه: $x\\leq 22$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نقسم طرفي $25x\\leq 550$ على $25$ ، وهو عدد موجب: الاتجاه نفسه.',
            'إذن $x\\leq 22$ : لا يزيد عدد الصناديق عن $22$ .',
          ] },
        ],
      },
      {
        label: '4)', title: 'ثلاثة وعشرون صندوقًا؟',
        question: 'هل يمكن للعامل أن يحمل 23 صندوقًا؟',
        asks: ['هل يمكنه؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['darb-mujab'],
            prompt: 'هل يمكنه أن يحمل 23 صندوقًا؟',
            options: ['لا: $25\\times 23+80=655$ وهو أكبر من $630$', 'نعم: لأنّ $23\\times 25=575<630$', 'نعم: 23 قريب من 22'], correct: 0, cols: 1,
            explain: 'لأنّ $23>22$ فالشرط غير محقّق: الحمولة $655\\,\\mathrm{kg}$ . أمّا مع $22$ صندوقًا فالحمولة $630\\,\\mathrm{kg}$ بالضبط وهي مقبولة.' },
          { kind: 'solution', ask: 0, lines: [
            'من أجل $x=23$ : الحمولة $25\\times 23+80=655$ ، وهي أكبر من $630$ .',
            'لا يمكنه: أقصى عدد للصناديق هو $22$ (حمولة $630\\,\\mathrm{kg}$).',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — سياج حديقة المدرسة',
    context: 'حديقة المدرسة',
    emoji: '🌳',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'plan', shape: 'rect', fill: 'grass', w: '8', h: 'L', unit: 'm', ariaLabel: 'حديقة مستطيلة عرضها 8 أمتار وطولها L متر' },
    statement: 'حديقة المدرسة مستطيلة عرضها 8 m وطولها $L$ بالمتر حيث $12<L<15$ .',
    data: [
      { id: 'w', text: 'العرض 8 m', useful: true },
      { id: 'l', text: 'الطول L حيث 12 < L < 15', useful: true },
      { id: 'garden', text: 'حديقة المدرسة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حصر المحيط',
        question: 'احصر المحيط $P=2L+16$ .',
        asks: ['حصر P'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-ab'],
            prompt: 'حصر $P$ هو:',
            options: ['$40<P<46$', '$24<P<30$', '$46<P<40$', '$20<P<23$'], correct: 0, cols: 2,
            explain: 'نضرب $12<L<15$ في $2$ : $24<2L<30$ ، ثم نضيف $16$ : $40<P<46$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نضرب الأطراف الثلاثة في $2$ : $24<2L<30$ .',
            'نضيف $16$ : $40<2L+16<46$ أي $40<P<46$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'لفّة طولها 45 m',
        question: 'هل تكفي لفّة سياج طولها 45 m لسياج الحديقة كلّها؟',
        asks: ['هل تكفي 45 m؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-ab'],
            prompt: 'هل تكفي لفّة طولها 45 m؟',
            options: ['لا يمكن الجزم: قد يكون المحيط أصغر من $45$ وقد يكون أكبر منها', 'نعم دائمًا، لأنّ $45>40$', 'لا أبدًا، لأنّ $45<46$'], correct: 0, cols: 1,
            explain: 'نعلم فقط أنّ $40<P<46$ : المحيط $44$ تكفيه اللفّة ، والمحيط $45{,}5$ لا تكفيه.' },
          { kind: 'solution', ask: 0, lines: [
            'نعلم فقط أنّ $40<P<46$ .',
            'قد يكون $P=44$ فتكفي ، وقد يكون $P=45{,}5$ فلا تكفي: لا يمكن الجزم.',
          ] },
        ],
      },
      {
        label: '3)', title: 'لفّة طولها 46 m',
        question: 'وهل تكفي لفّة طولها 46 m؟',
        asks: ['هل تكفي 46 m؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-ab'],
            prompt: 'هل تكفي لفّة طولها 46 m؟',
            options: ['نعم دائمًا، لأنّ $P<46$', 'لا يمكن الجزم', 'لا، لأنّ $P>40$'], correct: 0, cols: 1,
            explain: 'كل قيمة ممكنة للمحيط أصغر من $46$ : اللفّة تكفي في كل الحالات.' },
          { kind: 'solution', ask: 0, lines: [
            'من $40<P<46$ نعلم أنّ $P<46$ .',
            'فاللفّة التي طولها $46\\,\\mathrm{m}$ تكفي دائمًا.',
          ] },
        ],
      },
      {
        label: '4)', title: 'حصر المساحة',
        question: 'احصر مساحة الحديقة $A=8L$ .',
        asks: ['حصر A'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['darb-mujab'],
            prompt: 'حصر $A$ هو:',
            options: ['$96<A<120$', '$20<A<23$', '$120<A<96$', '$96<A<15$'], correct: 0, cols: 2,
            explain: 'نضرب الأطراف الثلاثة من $12<L<15$ في $8$ وهو موجب: $96<8L<120$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نضرب $12<L<15$ في $8$ ، وهو عدد موجب: الاتجاه نفسه.',
            'إذن $96<A<120$ .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
