/**
 * Les trois « مسائل » du درس « جداء عدة أعداد نسبية » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). La 1 est « مسألة الدرس » (`LESSON_CONFIG.lessonProblem`, le تحدّ de la page d'ouverture, refait avec 2025 nombres) : une
 * parité décide d'un produit de nombres tous égaux à −1 ; la 2 un carré magique multiplicatif du club (constante −27, neuf entrées
 * négatives) ; la 3 le calcul mental de la coopérative de l'école par la distributivité dans les deux sens. Chaque nombre est vérifié
 * dans ./problems.test.js en arithmétique EXACTE (BigInt).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — 2025 عددًا متساوية',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🔢',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'count', text: 'سلمى كتبت 2025 عددًا نسبيًا كلّها متساوية', useful: true },
      { id: 'sum', text: 'مجموع هذه الأعداد يساوي −2025', useful: true },
      { id: 'who', text: 'العددان في دفتر نادي الرياضيات', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ما قيمة كل عدد؟',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['قيمة العدد'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jidaa-adadayn'], prompt: '2025 عددًا متساويًا مجموعها $-2025$ ، فكل عدد يساوي $-2025 \\div 2025 =$', expected: -1, display: '−1',
            explain: 'جمع 2025 حدًّا متساويًا هو ضرب الحدّ في 2025: $(-1) \\times 2025 = -2025$ .' },
          { kind: 'solution', ask: 0, lines: ['العدد $a$ يحقّق $2025 \\times a = -2025$ .', 'إذن كل عدد يساوي $-1$ .'] },
        ],
      },
      {
        label: '2)', title: 'إشارة الجداء',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['إشارة الجداء'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['adad-salib'],
            prompt: 'جداء 2025 عاملًا كلّها $-1$ :',
            options: ['سالب، لأنّ عدد عوامله السالبة 2025 وهو فردي', 'موجب، لأنّ الأعداد متساوية', 'سالب، لأنّ المجموع سالب', 'موجب، لأنّ عدد العوامل كبير'], correct: 0, cols: 1,
            explain: '2025 عدد فردي (يساوي $2 \\times 1012 + 1$ )، فعدد العوامل السالبة فردي والجداء سالب.' },
          { kind: 'solution', ask: 0, lines: ['العوامل السالبة 2025 عاملًا وهو عدد فردي.', 'إذن جداء هذه الأعداد سالب.'] },
        ],
      },
      {
        label: '3)', title: 'قيمة الجداء',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['قيمة الجداء'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['adad-salib'], prompt: 'المسافة إلى الصفر لكل عدد $1$ ، فجداء المسافات $1$ . الجداء يساوي', expected: -1, display: '−1',
            explain: 'الإشارة سالبة (عدد فردي من العوامل السالبة) والمسافات كلّها $1$ : الجداء $-1$ .' },
          { kind: 'solution', ask: 0, lines: ['جداء المسافات $1 \\times 1 \\times \\ldots \\times 1 = 1$ .', 'والإشارة سالبة، إذن الجداء يساوي $-1$ .'] },
        ],
      },
      {
        label: '4)', title: 'لو كان العدد 2026؟',
        question: LESSON_CONFIG.lessonProblem.questions[3].text,
        asks: ['قيمة الجداء الجديد'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['adad-salib'],
            prompt: 'لو كتبت سلمى 2026 عددًا متساويًا مجموعها $-2026$ ، فكل عدد $-1$ وجداؤها:',
            options: ['$1$', '$-1$', '$2026$', '$-2026$'], correct: 0, cols: 2,
            explain: '2026 عدد زوجي: عدد العوامل السالبة زوجي والجداء موجب، ومسافاته $1$ ، إذن الجداء $1$ .' },
          { kind: 'solution', ask: 0, lines: ['2026 عدد زوجي، فعدد العوامل السالبة زوجي والجداء موجب.', 'إذن الجداء يساوي $1$ .'] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — مربّع النادي السحري',
    context: 'مربّع ضربي',
    emoji: '🎩',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'scene', icon: 'book', bg: 'blue', chips: [{ label: 'عدد الخانات', value: 9, tone: 'slate' }, { label: 'كل الخانات', value: 'سالبة', tone: 'rose' }, { label: 'الجداء في كل خط', value: 'نفسه', tone: 'amber' }], ariaLabel: 'مربّع سحري ضربي من تسع خانات سالبة: جداء كل سطر وعمود وقطر هو العدد نفسه' },
    statement: 'يُعدّ نادي الرياضيات مربّعًا سحريًا لحفل المدرسة: جداء الأعداد الثلاثة في كل سطر وكل عمود وكل قطر هو العدد نفسه. المربّع في الجدول الآتي (في كل خانة عدد).',
    table: { head: ['العمود الأول', 'العمود الثاني', 'العمود الثالث'], rows: [['−1', '−18', '−1,5'], ['−4,5', '−3', '−2'], ['−6', '−0,5', '−9']] },
    data: [
      { id: 'rule', text: 'جداء كل سطر وعمود وقطر هو العدد نفسه', useful: true },
      { id: 'grid', text: 'المربّع من تسع خانات كلّها سالبة', useful: true },
      { id: 'day', text: 'الحفل في آخر السنة الدراسية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'سطر وقطر',
        question: 'احسب جداء السطر الأول، ثم جداء القطر الذي يضمّ الخانات $-1$ و $-3$ و $-9$ .',
        asks: ['جداء السطر', 'جداء القطر'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-iddat'], prompt: '$(-1) \\times (-18) \\times (-1{,}5) =$', expected: -27, display: '−27',
            explain: 'ثلاثة عوامل سالبة: سالب، و $1 \\times 18 \\times 1{,}5 = 27$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tariqat-iddat'], prompt: '$(-1) \\times (-3) \\times (-9) =$', expected: -27, display: '−27',
            explain: 'ثلاثة عوامل سالبة: سالب، و $1 \\times 3 \\times 9 = 27$ .' },
          { kind: 'solution', ask: 0, lines: ['السطر الأول: $(-1) \\times (-18) \\times (-1{,}5) = -27$ .', 'القطر: $(-1) \\times (-3) \\times (-9) = -27$ .'] },
        ],
      },
      {
        label: '2)', title: 'لماذا كلّها سالبة؟',
        question: 'لماذا كل جداءات الأسطر والأعمدة والأقطر سالبة دون إجراء أيّ حساب؟',
        asks: ['السبب'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['adad-salib'],
            prompt: 'السبب:',
            options: ['في كل سطر وعمود وقطر ثلاثة عوامل سالبة، وهو عدد فردي', 'أنّ أكبر عدد في كل خط سالب', 'أنّ مجموع الأعداد في كل خط سالب', 'أنّ المربّع من تسع خانات'], correct: 0, cols: 1,
            explain: 'كل الخانات سالبة وفي كل خط ثلاث خانات: ثلاثة عوامل سالبة، عدد فردي، فالجداء سالب.' },
          { kind: 'solution', ask: 0, lines: ['كل خانة سالبة، وفي كل خط ثلاث خانات.', 'ثلاثة عوامل سالبة (عدد فردي)، إذن كل جداء سالب.'] },
        ],
      },
      {
        label: '3)', title: 'نعوّض كل عدد بمعاكسه',
        question: 'نعوّض كل عدد في المربّع بمعاكسه. ما الجداء السحري الجديد؟',
        asks: ['الجداء الجديد'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['maakus'], prompt: 'الجداء الجديد لسطر مثل $1 \\times 18 \\times 1{,}5 =$', expected: 27, display: '27',
            explain: 'كل خانة صارت موجبة: ثلاثة عوامل موجبة، والمسافات هي نفسها: $27$ .' },
          { kind: 'solution', ask: 0, lines: ['كل الخانات صارت موجبة ومسافاتها لم تتغيّر.', 'الجداء السحري الجديد $27$ .'] },
        ],
      },
      {
        label: '4)', title: 'نقلب إشارات الأركان الأربعة فقط',
        question: 'نقلب إشارات الخانات الأربع في أركان المربّع فقط. هل يبقى المربّع سحريًا؟',
        asks: ['الحكم'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['adad-salib'],
            prompt: 'بعد قلب إشارات الأركان الأربعة:',
            options: ['يبقى سحريًا والجداء الثابت $-27$ ', 'لا يبقى سحريًا لأنّ بعض الجداءات صارت موجبة', 'يبقى سحريًا والجداء الثابت $27$ ', 'لا يمكن الحكم دون حساب كل الخطوط'], correct: 0, cols: 1,
            explain: 'كل سطر وعمود وقطر يضمّ ركنين أو لا يضمّ أيّ ركن، فيتغيّر عدد عوامله السالبة بعدد زوجي: جداؤه لا يتغيّر. مثلًا السطر الأول $1 \\times (-18) \\times 1{,}5 = -27$ .' },
          { kind: 'solution', ask: 0, lines: ['كل خط يضمّ 0 أو 2 من الأركان، فتنقلب إشارتان أو لا شيء.', 'جداء كل خط يبقى $-27$ : المربّع سحري.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — حساب ذهني في التعاونية',
    context: 'خسارة كل كرّاس',
    emoji: '🧮',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'scene', icon: 'coin', bg: 'green', chips: [{ label: 'كرّاسات مباعة', value: 99, tone: 'blue' }, { label: 'الخسارة في كل كرّاس', value: '−4,5', unit: 'DA', tone: 'rose' }, { label: 'علب أقلام', value: '37 و 63', tone: 'slate' }], ariaLabel: 'تعاونية المدرسة تبيع 99 كرّاسًا بتخفيض وتخسر 4,5 دنانير في كل كرّاس، ثم 37 و 63 علبة أقلام تخسر 12 دينارًا في كل علبة' },
    statement: 'باعت تعاونية المدرسة 99 كرّاسًا بتخفيض، فخسرت 4,5 DA في كل كرّاس. نعبّر عن الخسارة بعدد سالب: $-4{,}5\\,\\mathrm{DA}$ لكل كرّاس.',
    data: [
      { id: 'n', text: '99 كرّاسًا مباعة', useful: true },
      { id: 'loss', text: 'الخسارة 4,5 DA في كل كرّاس', useful: true },
      { id: 'shop', text: 'التعاونية داخل المدرسة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'خسارة الكرّاسات',
        question: 'ما التغيّر الإجمالي لرصيد التعاونية؟ احسبه ذهنيًا بكتابة $99 = 100 - 1$ .',
        asks: ['التغيّر الإجمالي'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['tariqat-iddat'], prompt: '$(-4{,}5) \\times 100 =$', expected: -450, display: '−450',
            explain: 'جداء عدد في 100 يزيح الفاصلة منزلتين: $-4{,}5 \\times 100 = -450$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tawzi-aadad'], prompt: '$(-4{,}5) \\times (100 - 1) = -450 - (-4{,}5) =$', expected: -445.5, display: '−445,5',
            explain: 'ننشر الطرح: $(-4{,}5) \\times 100 - (-4{,}5) \\times 1 = -450 + 4{,}5 = -445{,}5$ . الخسارة $445{,}5\\,\\mathrm{DA}$ .' },
          { kind: 'solution', ask: 0, lines: ['$(-4{,}5) \\times 99 = (-4{,}5) \\times (100 - 1) = -450 + 4{,}5$ .', 'التغيّر $-445{,}5\\,\\mathrm{DA}$ .'] },
        ],
      },
      {
        label: '2)', title: 'علب الأقلام',
        question: 'في الشهر الموالي خسرت التعاونية 12 DA في كل علبة أقلام: 37 علبة في الأسبوع الأول و 63 علبة في الثاني. ما التغيّر الإجمالي؟',
        asks: ['التغيّر الإجمالي'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tawzi-aadad'], prompt: '$(-12) \\times 37 + (-12) \\times 63 = (-12) \\times 100 =$', expected: -1200, display: '−1200',
            explain: 'نخرج العامل المشترك $-12$ : $(-12) \\times (37 + 63) = (-12) \\times 100 = -1200$ .' },
          { kind: 'solution', ask: 0, lines: ['$(-12) \\times 37 + (-12) \\times 63 = (-12) \\times (37 + 63)$ .', '$(-12) \\times 100 = -1200$ ، أي خسارة $1200\\,\\mathrm{DA}$ .'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
