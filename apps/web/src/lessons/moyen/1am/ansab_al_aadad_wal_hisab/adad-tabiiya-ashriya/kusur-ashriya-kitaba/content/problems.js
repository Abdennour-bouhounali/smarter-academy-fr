/**
 * Les trois « مسائل » du درس « الكسور العشرية والكتابة العشرية » (modules 6, 7, 8) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). Ajouts de la plateforme (`exam_style_problem`) : autres contextes, autres nombres que le manuel. La مسألة 1
 * (`LESSON_CONFIG.lessonProblem`, le sens du كسر عشري, le مفكوك et × 10) ; la 2 les trois tubes du laboratoire (كسور عشرية de même
 * dénominateur, leur somme, × 100) ; la 3 les cahiers de la coopérative (× 1000, × 100 et le passage au gramme). Chaque nombre est vérifié dans
 * ./problems.test.js en arithmétique décimale EXACTE.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — حبل ساحة المدرسة',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🪢',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'len', text: 'طول الحبل 4,075 مترًا', useful: true },
      { id: 'ten', text: 'يحتاج النادي إلى 10 حبال مثله', useful: true },
      { id: 'price', text: 'ثمن الحبل 480 دج', useful: false },
      { id: 'gift', text: 'تبرّع به صاحب مكتبة الحيّ', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'كسر عشري',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['الكسر العشري'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['kitaba-bifasila'],
            prompt: 'عدد الأرقام بعد الفاصلة في $4{,}075$ هو:',
            options: ['ثلاثة: فالمقام فيه ثلاثة أصفار', 'اثنان: فالمقام 100', 'أربعة: فالمقام 10000'],
            correct: 0, cols: 1,
            explain: 'الأرقام بعد الفاصلة هي 0 و 7 و 5: ثلاثة أرقام، إذن أجزاء من ألف.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tariqat-intiqal'],
            prompt: 'طول الحبل على شكل كسر عشري:',
            options: ['$\\frac{4075}{1000}$ متر', '$\\frac{4075}{100}$ متر', '$\\frac{475}{1000}$ متر'],
            correct: 0, cols: 1,
            explain: 'البسط هو العدد بلا فاصلة 4075، والمقام 1000. أمّا $\\frac{475}{1000}$ فيحذف الصفر.' },
          { kind: 'solution', ask: 0, lines: [
            'ثلاثة أرقام بعد الفاصلة، فالمقام 1000 والبسط 4075.',
            '$4{,}075=\\frac{4075}{1000}$ متر.',
          ] },
        ],
      },
      {
        label: '2)', title: 'مجموع وكسور عشرية',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['المفكوك'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['mafkuk-ashri'], prompt: 'رقم الأجزاء من مائة في $4{,}075$ هو:', expected: 7,
            explain: 'الرقم الثاني بعد الفاصلة هو 7.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mafkuk-ashri'],
            prompt: 'طول الحبل على شكل مجموع عدد طبيعي وكسور عشرية:',
            options: ['$4+\\frac{7}{100}+\\frac{5}{1000}$ متر', '$4+\\frac{7}{10}+\\frac{5}{100}$ متر', '$4+\\frac{7}{100}+\\frac{5}{100}$ متر'],
            correct: 0, cols: 1,
            explain: 'لا حدّ للأعشار لأنّ رقمها 0، و7 للأجزاء من مائة و5 للأجزاء من ألف.' },
          { kind: 'solution', ask: 0, lines: [
            'الرقم 0 في مرتبة الأعشار: لا حدّ له في المجموع.',
            '$4{,}075=4+\\frac{7}{100}+\\frac{5}{1000}$ متر.',
          ] },
        ],
      },
      {
        label: '3)', title: 'عشرة حبال',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['الطول الكلي'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['azaha-fasila'],
            prompt: 'الطول الكلي للحبال العشرة:',
            options: ['$4{,}075\\times10$', '$4{,}075\\div10$', '$4{,}075+10$'],
            correct: 0, cols: 3,
            explain: '10 حبال متساوية في الطول: نضرب طول الحبل في 10.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['azaha-fasila'], prompt: 'الطول الكلي:', expected: 40.75, display: '40,75', suffix: 'م',
            explain: 'الضرب في 10 يزيح الفاصلة مرتبة نحو اليمين: $4{,}075\\times10=40{,}75$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الطول الكلي هو $4{,}075\\times10$ ؛ الضرب في 10 يزيح الفاصلة مرتبة نحو اليمين.',
            '$4{,}075\\times10=40{,}75$ م.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — أنابيب المخبر',
    context: 'دقّة القياس',
    emoji: '🧪',
    tone: 'emerald',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'الأنبوب الأول', icon: 'bottle', lines: [{ label: 'الحجم', value: '0,25', unit: 'ل' }] },
      { title: 'الأنبوب الثاني', icon: 'bottle', lines: [{ label: 'الحجم', value: '1,5', unit: 'ل' }] },
      { title: 'الأنبوب الثالث', icon: 'bottle', lines: [{ label: 'الحجم', value: '0,075', unit: 'ل' }] },
    ], ariaLabel: 'ثلاثة أنابيب مدرّجة فيها 0,25 لتر و 1,5 لتر و 0,075 لتر من الماء' },
    statement: 'في مخبر المدرسة ثلاثة أنابيب مدرّجة فيها ماء: حجمه 0,25 لتر في الأول، و1,5 لتر في الثاني، و0,075 لتر في الثالث. تعلّم الأستاذة تلاميذها أن يسجّلوا كل قياس بأمانة ودقّة. في المخبر 12 مقعدًا.',
    data: [
      { id: 'v1', text: 'حجم الأنبوب الأول 0,25 لتر', useful: true },
      { id: 'v2', text: 'حجم الأنبوب الثاني 1,5 لتر', useful: true },
      { id: 'v3', text: 'حجم الأنبوب الثالث 0,075 لتر', useful: true },
      { id: 'seats', text: 'في المخبر 12 مقعدًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'بالأجزاء من ألف',
        question: 'عبّر عن حجم كل أنبوب بكسر عشري مقامه 1000.',
        asks: ['الكسور الثلاثة'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['kitaba-bifasila'],
            rows: [
              { label: '$0{,}25$ لتر', options: ['$\\frac{250}{1000}$', '$\\frac{25}{1000}$', '$\\frac{2500}{1000}$'], correct: 0, correction: '$0{,}25=0{,}250=\\frac{250}{1000}$ .' },
              { label: '$1{,}5$ لتر', options: ['$\\frac{150}{1000}$', '$\\frac{1500}{1000}$', '$\\frac{15}{1000}$'], correct: 1, correction: '$1{,}5=1{,}500=\\frac{1500}{1000}$ .' },
              { label: '$0{,}075$ لتر', options: ['$\\frac{750}{1000}$', '$\\frac{7500}{1000}$', '$\\frac{75}{1000}$'], correct: 2, correction: '$0{,}075=\\frac{75}{1000}$ : ثلاثة أرقام بعد الفاصلة، والبسط 75.' },
            ] },
          { kind: 'solution', ask: 0, lines: [
            'نكتب كل حجم بثلاثة أرقام بعد الفاصلة: $0{,}250$ و $1{,}500$ و $0{,}075$ .',
            '$\\frac{250}{1000}$ و $\\frac{1500}{1000}$ و $\\frac{75}{1000}$ لتر.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الحجم الكلي',
        question: 'احسب حجم الماء في الأنابيب الثلاثة معًا بالأجزاء من ألف من اللتر، ثم اكتبه بالفاصلة.',
        asks: ['الحجم بالأجزاء من ألف', 'الحجم بالفاصلة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['kasr-ashri'], prompt: '$250+1500=\\ldots$', expected: 1750,
            explain: 'أجزاء من ألف تُجمع بسطًا: لها المقام نفسه 1000.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['kasr-ashri'], prompt: 'حجم الماء كله بالأجزاء من ألف من اللتر:', expected: 1825, suffix: 'جزءًا من ألف',
            explain: '$1750+75=1825$ جزءًا من ألف.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tariqat-intiqal'],
            prompt: '$\\frac{1825}{1000}$ لتر بالفاصلة:',
            options: ['$1{,}825$ لتر', '$18{,}25$ لتر', '$182{,}5$ لتر'],
            correct: 0, cols: 3,
            explain: 'المقام 1000: ثلاثة أرقام بعد الفاصلة.' },
          { kind: 'solution', ask: 0, lines: [
            'الأجزاء من ألف تُجمع: $250+1500+75=1825$ جزءًا من ألف.',
            '$\\frac{1825}{1000}=1{,}825$ لتر.',
          ] },
        ],
      },
      {
        label: '3)', title: 'مئة أنبوب',
        question: 'تحتاج الأستاذة في حصة العمل إلى 100 أنبوب مثل الأنبوب الثالث. ما حجم الماء كله باللتر؟',
        asks: ['حجم الماء كله'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['azaha-fasila'],
            prompt: 'حجم الماء في 100 أنبوب متماثلة:',
            options: ['$0{,}075\\times100$', '$0{,}075\\div100$', '$0{,}075+100$'],
            correct: 0, cols: 3,
            explain: '100 أنبوب في كل منها 0,075 لتر: نضرب في 100.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['azaha-fasila'], prompt: 'حجم الماء كله:', expected: 7.5, display: '7,5', suffix: 'لتر',
            explain: 'الضرب في 100 يزيح الفاصلة مرتبتين نحو اليمين: $0{,}075\\times100=7{,}5$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الحجم الكلي $0{,}075\\times100$ ؛ نزيح الفاصلة مرتبتين نحو اليمين.',
            '$0{,}075\\times100=7{,}5$ لتر.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — دفاتر التعاونية',
    context: 'التضامن',
    emoji: '📒',
    tone: 'violet',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'الدفتر', icon: 'book', lines: [{ label: 'الكتلة', value: '0,235', unit: 'كغ' }, { label: 'الثمن', value: 42, unit: 'دج' }] },
      { title: 'الشراء', icon: 'crate', lines: [{ label: 'عدد الدفاتر', value: 1000 }] },
    ], ariaLabel: 'دفتر كتلته 0,235 كيلوغرام وثمنه 42 دج، واشتُريت منه ألف نسخة' },
    statement: 'اشترت جمعية الحيّ من تعاونية المدرسة 1000 دفتر لتوزّعها على تلاميذ يحتاجون إليها تضامنًا معهم. كتلة الدفتر الواحد 0,235 كغ وثمنه 42 دج. صاحب الشاحنة يقبل أن ينقل في الرحلة الواحدة 300 كغ على الأكثر.',
    data: [
      { id: 'n', text: 'عدد الدفاتر 1000', useful: true },
      { id: 'mass', text: 'كتلة الدفتر الواحد 0,235 كغ', useful: true },
      { id: 'max', text: 'الشاحنة تنقل 300 كغ على الأكثر', useful: true },
      { id: 'price', text: 'ثمن الدفتر الواحد 42 دج', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'كتلة الألف دفتر',
        question: 'ما كتلة الدفاتر الألف بالكيلوغرام؟',
        asks: ['الكتلة الكلية'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['azaha-fasila'],
            prompt: 'كتلة 1000 دفتر متماثلة:',
            options: ['$0{,}235\\times1000$', '$0{,}235\\div1000$', '$0{,}235\\times100$'],
            correct: 0, cols: 3,
            explain: '1000 دفتر في كل منها 0,235 كغ: نضرب في 1000.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['azaha-fasila'], prompt: 'الكتلة الكلية:', expected: 235, suffix: 'كغ',
            explain: 'الضرب في 1000 يزيح الفاصلة ثلاث مراتب نحو اليمين: $0{,}235\\times1000=235$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الكتلة الكلية $0{,}235\\times1000$ ؛ نزيح الفاصلة ثلاث مراتب نحو اليمين.',
            '$0{,}235\\times1000=235$ كغ.',
          ] },
        ],
      },
      {
        label: '2)', title: 'رحلة واحدة؟',
        question: 'هل تكفي رحلة واحدة لنقل الدفاتر؟',
        asks: ['كفاية الرحلة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['azaha-fasila'],
            prompt: 'كتلة الدفاتر 235 كغ، والشاحنة تنقل 300 كغ على الأكثر:',
            options: ['تكفي رحلة واحدة لأنّ 235 أقل من 300', 'لا تكفي لأنّ 235 أكبر من 300', 'لا نستطيع أن نعرف'],
            correct: 0, cols: 1,
            explain: '$235<300$ : الكتلة أقل من الحمولة المسموحة.' },
          { kind: 'solution', ask: 0, lines: [
            'كتلة الدفاتر 235 كغ، والحمولة المسموحة 300 كغ.',
            'بما أنّ $235<300$ فتكفي رحلة واحدة.',
          ] },
        ],
      },
      {
        label: '3)', title: 'مئة دفتر ودفتر واحد',
        question: 'احسب كتلة 100 دفتر بالكيلوغرام، ثم عبّر عن كتلة دفتر واحد بالغرام.',
        asks: ['كتلة المئة دفتر', 'كتلة الدفتر بالغرام'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['azaha-fasila'], prompt: 'كتلة 100 دفتر:', expected: 23.5, display: '23,5', suffix: 'كغ',
            explain: 'الضرب في 100 يزيح الفاصلة مرتبتين: $0{,}235\\times100=23{,}5$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['azaha-fasila'],
            prompt: 'كتلة الدفتر الواحد بالغرام (1 كغ = 1000 غ):',
            options: ['235 غ', '23,5 غ', '2350 غ'],
            correct: 0, cols: 3,
            explain: '$0{,}235\\times1000=235$ غرامًا.' },
          { kind: 'solution', ask: 0, lines: [
            '$0{,}235\\times100=23{,}5$ كغ.',
            '$0{,}235\\,\\mathrm{kg}=0{,}235\\times1000=235$ غ.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
