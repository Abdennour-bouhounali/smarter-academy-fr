/**
 * Les trois « مسائل » du درس « الكسر: نسبة وحاصل قسمة وقيم مقرّبة » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل الأول, résolus pas à pas (GuidedProblem). AJOUTS DE LA PLATEFORME
 * (`addition('exam_style_problem')`), contextes de la plateforme (la coopérative et le partage équitable, le club de cyclisme et la patience, le réservoir du village et le soin de l'eau).
 * Périmètre : l'écriture fractionnaire d'un quotient, la division par un décimal (×10ⁿ aux deux termes), l'encadrement à 0,1 / 0,01 et le CHOIX de la valeur (par défaut ou par excès) selon la situation.
 * La مسألة 1 est « مسألة الدرس » (`LESSON_CONFIG.lessonProblem`) ; chaque nombre est vérifié dans ./problems.test.js.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — زيت التعاونية',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🫒',
    tone: 'amber',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'oil', text: 'الزيت: 10 لترات', useful: true },
      { id: 'families', text: 'ثلاث عائلات تتقاسمه بالتساوي', useful: true },
      { id: 'bottle', text: 'لكلّ عائلة قارورة', useful: true },
      { id: 'hour', text: 'يُحمَّل الزيت صباحًا على الساعة 6', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حصّة كلّ عائلة',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['الكتابة الكسرية', 'عشري أم لا'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nisba-kasriya'],
            prompt: 'حصّة كلّ عائلة، بالكتابة الكسرية، بوحدة اللتر:',
            options: ['$\\frac{10}{3}$', '$\\frac{3}{10}$', '$10 - 3$'], correct: 0, cols: 1,
            explain: 'نقسم $10$ لترات على $3$ عائلات: حاصل قسمة $10$ على $3$ هو $\\frac{10}{3}$ لتر.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['ashri-am-la'],
            prompt: 'هل $\\frac{10}{3}$ عدد عشري؟',
            options: ['نعم، لأنّ القسمة تنتهي', 'لا، لأنّ $10 \\div 3 = 3{,}333\\ldots$ لا تنتهي'], correct: 1, cols: 1,
            explain: 'لو كان عشريًا لانتهت القسمة؛ أمّا $10 \\div 3$ فتعطي $3$ بعد الفاصلة إلى ما لا نهاية.' },
          { kind: 'solution', ask: 0, lines: [
            'حصّة كلّ عائلة هي حاصل قسمة $10$ على $3$ ، أي $\\frac{10}{3}$ لتر.',
            '$10 \\div 3 = 3{,}333\\ldots$ لا تنتهي: $\\frac{10}{3}$ ليس عددًا عشريًا.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الحصر إلى $0{,}01$',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الحصر'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qiyam-muqarraba-ushr'],
            prompt: 'حصر $\\frac{10}{3}$ إلى $0{,}01$ :',
            options: ['$3{,}33 < \\frac{10}{3} < 3{,}34$', '$3{,}34 < \\frac{10}{3} < 3{,}35$', '$3{,}32 < \\frac{10}{3} < 3{,}33$'], correct: 0, cols: 1,
            explain: '$3 \\times 3{,}33 = 9{,}99 < 10 < 10{,}02 = 3 \\times 3{,}34$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$3 \\times 3{,}33 = 9{,}99$ و $3 \\times 3{,}34 = 10{,}02$ ، و $9{,}99 < 10 < 10{,}02$ .',
            '$3{,}33 < \\frac{10}{3} < 3{,}34$ : القيمة بالنقصان $3{,}33$ والقيمة بالزيادة $3{,}34$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'اختيار القارورة',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['قارورة $3{,}3$ L', 'قارورة $3{,}5$ L'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qiyam-muqarraba-ushr'],
            prompt: 'هل تكفي قارورة سعتها $3{,}3$ L حصّة العائلة؟',
            options: ['نعم', 'لا'], correct: 1, cols: 2,
            explain: '$3{,}3 < 3{,}33 < \\frac{10}{3}$ : السعة أصغر من الحصّة، فيبقى جزء من الزيت خارج القارورة.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['qiyam-muqarraba-ushr'],
            prompt: 'هل تكفي قارورة سعتها $3{,}5$ L حصّة العائلة؟',
            options: ['نعم', 'لا'], correct: 0, cols: 2,
            explain: '$\\frac{10}{3} < 3{,}34 < 3{,}5$ : السعة أكبر من الحصّة. نختار قيمة بالزيادة حتى تتّسع القارورة للحصّة كلّها.' },
          { kind: 'solution', ask: 0, lines: [
            'القارورة $3{,}3$ L لا تكفي لأنّ $3{,}3 < \\frac{10}{3}$ .',
            'القارورة $3{,}5$ L تكفي لأنّ $\\frac{10}{3} < 3{,}34 < 3{,}5$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — نادي الدرّاجات',
    context: 'الصبر على المسافة',
    emoji: '🚴',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'scene', icon: 'person', bg: 'blue', chips: [{ label: 'المسافة', value: 25, unit: 'km', tone: 'blue' }, { label: 'المدّة', value: '1,5', unit: 'ساعة', tone: 'amber' }], ariaLabel: 'نادي الدرّاجات: 25 km في ساعة ونصف' },
    statement: 'قطع فريق نادي الدرّاجات في المدرسة $25$ km في $1{,}5$ ساعة بسرعة منتظمة، وصبر أفراده على المسافة حتى النهاية. انطلق الفريق من ساحة المدرسة.',
    data: [
      { id: 'km', text: 'قطع الفريق 25 km', useful: true },
      { id: 'h', text: 'في 1,5 ساعة بسرعة منتظمة', useful: true },
      { id: 'start', text: 'انطلق من ساحة المدرسة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المسافة في ساعة',
        question: 'عبّر بكتابة كسرية عن المسافة المقطوعة في ساعة واحدة، ثم عيّن مقامًا طبيعيًا لها.',
        asks: ['الكتابة الكسرية', 'المقام الطبيعي'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nisba-kasriya'],
            prompt: 'المسافة في ساعة واحدة، بوحدة km:',
            options: ['$\\frac{25}{1{,}5}$', '$\\frac{1{,}5}{25}$', '$25 \\times 1{,}5$'], correct: 0, cols: 1,
            explain: 'المسافة في ساعة واحدة هي حاصل قسمة $25$ على $1{,}5$ ، أي $\\frac{25}{1{,}5}$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qisma-ashari'], prompt: 'نضرب الحدّين في $10$ فنجد $\\frac{250}{\\ldots}$ ، المقام:', expected: 15,
            explain: '$1{,}5 \\times 10 = 15$ و $25 \\times 10 = 250$ : $\\frac{25}{1{,}5} = \\frac{250}{15}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'المسافة في ساعة: $\\frac{25}{1{,}5}$ km.',
            'نضرب الحدّين في $10$ : $\\frac{25}{1{,}5} = \\frac{250}{15} = \\frac{50}{3}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الحصر إلى $0{,}1$',
        question: 'احصر المسافة المقطوعة في ساعة إلى $0{,}1$ km.',
        asks: ['الحصر'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-ushri-tariqa'],
            prompt: 'حصر $\\frac{250}{15}$ إلى $0{,}1$ :',
            options: ['$16{,}6 < \\frac{250}{15} < 16{,}7$', '$16{,}7 < \\frac{250}{15} < 16{,}8$', '$16{,}5 < \\frac{250}{15} < 16{,}6$'], correct: 0, cols: 1,
            explain: '$250 \\div 15 = 16{,}666\\ldots$ : القيمة بالنقصان $16{,}6$ والقيمة بالزيادة $16{,}7$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$250 \\div 15 = 16{,}666\\ldots$ ننهي القسمة عند رقم واحد بعد الفاصلة: $16{,}6$ .',
            'نضيف $0{,}1$ : $16{,}6 < \\frac{250}{15} < 16{,}7$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'هل يبلغ الفريق $17$ km؟',
        question: 'هل يقطع الفريق $17$ km في ساعة واحدة؟',
        asks: ['الجواب'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qiyam-muqarraba-ushr'],
            prompt: 'هل يقطع الفريق $17$ km في ساعة واحدة؟',
            options: ['نعم', 'لا'], correct: 1, cols: 2,
            explain: 'المسافة في ساعة أصغر من $16{,}7$ km ، و $16{,}7 < 17$ : لا يبلغ الفريق $17$ km.' },
          { kind: 'solution', ask: 0, lines: [
            'المسافة في ساعة أصغر من $16{,}7$ km ، أي أصغر من $17$ km.',
            'لا يقطع الفريق $17$ km في ساعة واحدة.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — خزّان القرية',
    context: 'الماء نعمة',
    emoji: '💧',
    tone: 'violet',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'الخزّان', icon: 'bottle', lines: [{ label: 'فيه', value: 1000, unit: 'لتر' }] }, { title: 'القارورة', icon: 'bottle', lines: [{ label: 'سعتها', value: '1,5', unit: 'لتر' }] }], ariaLabel: 'بطاقتان: الخزّان فيه 1000 لتر، والقارورة سعتها 1,5 لتر' },
    statement: 'يحتوي خزّان قرية $1000$ لتر من الماء، يملأ منه المتطوّعون قارورات سعة كلّ منها $1{,}5$ لتر لتُوزَّع على العائلات، فالماء نعمة نحافظ عليها. يُفتح الخزّان كلّ يوم على الساعة 8.',
    data: [
      { id: 'tank', text: 'الخزّان فيه 1000 لتر', useful: true },
      { id: 'bottle', text: 'سعة القارورة 1,5 لتر', useful: true },
      { id: 'hour', text: 'يُفتح الخزّان على الساعة 8', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'القارورات المملوءة',
        question: 'كم قارورة يمكن ملؤها تمامًا؟',
        asks: ['عدد القارورات'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['qisma-ashari'], prompt: 'نضرب الحدّين في $10$ فنجد $\\frac{\\ldots}{15}$ ، البسط:', expected: 10000,
            explain: '$1000 \\times 10 = 10000$ و $1{,}5 \\times 10 = 15$ : $\\frac{1000}{1{,}5} = \\frac{10000}{15}$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qiyam-muqarraba-ushr'], prompt: 'عدد القارورات المملوءة تمامًا:', expected: 666,
            explain: '$15 \\times 666 = 9990$ و $15 \\times 667 = 10005 > 10000$ : $666$ قارورة.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\frac{1000}{1{,}5} = \\frac{10000}{15} = 666{,}666\\ldots$',
            'تُملأ $666$ قارورة تمامًا.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الحصر إلى $0{,}1$',
        question: 'احصر $\\frac{1000}{1{,}5}$ إلى $0{,}1$ .',
        asks: ['الحصر'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-ushri-tariqa'],
            prompt: 'حصر $\\frac{10000}{15}$ إلى $0{,}1$ :',
            options: ['$666{,}6 < \\frac{10000}{15} < 666{,}7$', '$666{,}7 < \\frac{10000}{15} < 666{,}8$', '$666{,}5 < \\frac{10000}{15} < 666{,}6$'], correct: 0, cols: 1,
            explain: '$10000 \\div 15 = 666{,}666\\ldots$ : القيمة بالنقصان $666{,}6$ والقيمة بالزيادة $666{,}7$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$10000 \\div 15 = 666{,}666\\ldots$',
            '$666{,}6 < \\frac{1000}{1{,}5} < 666{,}7$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'ماذا تمثّل $667$ ؟',
        question: 'ماذا يمثّل العدد $667$ في هذه الوضعية؟',
        asks: ['المعنى'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qiyam-muqarraba-ushr'],
            prompt: 'العدد $667$ هو:',
            options: ['عدد القارورات المملوءة تمامًا', 'عدد القارورات اللازمة لتوزيع كلّ الماء', 'عدد اللترات الباقية'], correct: 1, cols: 1,
            explain: '$666$ قارورة مملوءة تمامًا، والماء الباقي يحتاج قارورة أخرى: $667$ قيمة مقرّبة إلى الوحدة بالزيادة.' },
          { kind: 'solution', ask: 0, lines: [
            '$666 < \\frac{1000}{1{,}5} < 667$ .',
            '$667$ هو عدد القارورات اللازمة لتوزيع كلّ الماء (القيمة بالزيادة).',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
