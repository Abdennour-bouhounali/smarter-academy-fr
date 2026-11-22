/**
 * Les trois « مسائل » du درس « الأعداد العشرية ونصف المستقيم المدرّج » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus
 * pas à pas (GuidedProblem). Ajouts de la plateforme (`exam_style_problem`) : autres contextes, autres nombres que le manuel. La مسألة 1
 * (`LESSON_CONFIG.lessonProblem` : le ruban du tailleur — dix graduations par mètre, trois abscisses écrites de trois façons, l'ordre) ;
 * la 2 les bornes kilométriques d'une route dont l'origine ne se voit pas (abscisses, encadrement, l'origine reste 0) ; la 3 la page du
 * cahier (quelle unité tient dans 12 cm, la graduation en millimètres, le nombre de graduations jusqu'à un point).
 * Chaque nombre est vérifié dans ./problems.test.js en arithmétique décimale EXACTE.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — شريط الخيّاط',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🧵',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'b1', text: 'شريط طوله 3 أمتار، طرفه O هو الصفر', useful: true },
      { id: 'b2', text: 'كلّ متر مقسّم إلى عشر تدريجات صغيرة متساوية', useful: true },
      { id: 'b3', text: 'القطعة الأولى تنتهي عند 0,8 م', useful: true },
      { id: 'b4', text: 'القطعة الثانية تنتهي بعد المتر الثاني بأربع تدريجات صغيرة', useful: true },
      { id: 'b5', text: 'القطعة الثالثة تنتهي عند 1 + 7/10 م', useful: true },
      { id: 'buttons', text: 'اشترى الخيّاط 5 أزرار', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'التدريجات الصغيرة',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['عدد التدريجات في المتر', 'التباعد بين تدريجتين'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tadrij-nisf-mustaqim'], prompt: 'عدد التدريجات الصغيرة في المتر الواحد:', expected: 10, display: '10',
            explain: 'كلّ متر مقسّم إلى عشرة أجزاء متساوية، أي عشر تدريجات صغيرة.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tadrij-nisf-mustaqim'],
            prompt: 'التباعد بين تدريجتين صغيرتين متتاليتين:',
            options: ['$\\frac{1}{10}$ من المتر، أي $0{,}1$ م', '$\\frac{1}{100}$ من المتر، أي $0{,}01$ م', 'متر كامل'],
            correct: 0, cols: 1,
            explain: 'المتر مقسّم إلى عشرة أجزاء متساوية: كلّ جزء $\\frac{1}{10}$ م $=0{,}1$ م.' },
          { kind: 'solution', ask: 0, lines: [
            'كلّ متر مقسّم إلى عشرة أجزاء متساوية: في المتر عشر تدريجات صغيرة.',
            'التباعد بين تدريجتين متتاليتين $\\frac{1}{10}$ م $=0{,}1$ م.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الفاصلتان',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['فاصلتا النهايتين'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['faasila-nuqta'],
            prompt: 'القطعة الثانية تنتهي بعد المتر الثاني بأربع تدريجات صغيرة. فاصلة نهايتها:',
            options: ['$2{,}4$', '$4{,}2$', '$2{,}04$'],
            correct: 0, cols: 3,
            explain: 'متران كاملان ثم أربع تدريجات صغيرة، كلّ واحدة $0{,}1$ : $2+\\frac{4}{10}=2{,}4$ .' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['faasila-nuqta'],
            prompt: 'بالفاصلة:',
            rows: [
              { label: 'نهاية القطعة الثانية', options: ['$2{,}4$', '$2{,}04$', '$4{,}2$'], correct: 0, correction: '$2+\\frac{4}{10}=2{,}4$ .' },
              { label: 'نهاية القطعة الثالثة $1+\\frac{7}{10}$', options: ['$1{,}7$', '$1{,}07$', '$8$'], correct: 0, correction: 'سبعة أعشار رقم واحد بعد الفاصلة: $1+\\frac{7}{10}=1{,}7$ .' },
            ] },
          { kind: 'solution', ask: 0, lines: [
            'القطعة الثانية: متران وأربع تدريجات صغيرة، $2+\\frac{4}{10}=2{,}4$ م.',
            'القطعة الثالثة: $1+\\frac{7}{10}=1{,}7$ م.',
          ] },
        ],
      },
      {
        label: '3)', title: 'الترتيب',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['الترتيب من الأقرب إلى الأبعد'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['faasila-nuqta'],
            prompt: 'النهايات الثلاث فاصلاتها $0{,}8$ و $2{,}4$ و $1{,}7$ . الترتيب من الأقرب إلى الأبعد عن $O$ :',
            options: ['$0{,}8<1{,}7<2{,}4$', '$0{,}8<2{,}4<1{,}7$', '$1{,}7<0{,}8<2{,}4$'],
            correct: 0, cols: 1,
            explain: 'الأقرب إلى $O$ هو الأصغر فاصلةً: $0{,}8$ ثم $1{,}7$ ثم $2{,}4$ .' },
          { kind: 'solution', ask: 0, lines: [
            'فاصلة نقطة هي بُعدها عن $O$ بوحدة الطول (المتر).',
            'الأقرب هو الأصغر فاصلةً: $0{,}8<1{,}7<2{,}4$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — لوحات الكيلومترات',
    context: 'الطريق الوطني',
    emoji: '🛣️',
    tone: 'emerald',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'اللوحتان الظاهرتان', icon: 'car', lines: [{ label: 'بينهما عشر تدريجات', value: '14 و 15', unit: 'كم' }] },
      { title: 'النقطتان T و S', icon: 'bus', lines: [{ label: 'T بعد اللوحة 14 بـ', value: 'ثلاث تدريجات', unit: '' }, { label: 'S بعد اللوحة 14 بـ', value: 'تسع تدريجات', unit: '' }] },
      { title: 'محطة الوقود P', icon: 'house', lines: [{ label: 'بين الخامسة والسادسة بعد', value: '14', unit: '' }] },
    ], ariaLabel: 'لوحتان كيلومتريتان 14 و 15 ثم نقطتان وبعدهما محطة وقود بين تدريجتين' },
    statement: 'على طريق قريتنا لوحات تحمل أعدادًا بالكيلومتر، ولا يظهر مبدأ الطريق $O$ في الصورة: نرى اللوحتين 14 و 15 فقط، وبينهما عشر تدريجات صغيرة متساوية. تقف سيارة الإسعاف عند النقطة $T$ بعد اللوحة 14 بثلاث تدريجات صغيرة، وتقف شاحنة عند $S$ بعد اللوحة 14 بتسع تدريجات صغيرة، وتقع محطة الوقود $P$ بين التدريجة الخامسة والتدريجة السادسة بعد اللوحة 14. يحمل سائق الإسعاف قارورة ماء.',
    data: [
      { id: 'd1', text: 'لوحتان ظاهرتان: 14 و 15 ، وبينهما عشر تدريجات صغيرة', useful: true },
      { id: 'd2', text: 'النقطة T بعد اللوحة 14 بثلاث تدريجات صغيرة', useful: true },
      { id: 'd3', text: 'النقطة S بعد اللوحة 14 بتسع تدريجات صغيرة', useful: true },
      { id: 'd4', text: 'النقطة P بين التدريجتين الخامسة والسادسة بعد اللوحة 14', useful: true },
      { id: 'water', text: 'سائق الإسعاف يحمل قارورة ماء', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'فاصلتا T و S',
        question: 'اكتب فاصلتي النقطتين $T$ و $S$ .',
        asks: ['فاصلتا T و S'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['faasila-nuqta', 'mabda-ghayr-zahir'],
            prompt: 'بالكيلومتر:',
            rows: [
              { label: 'فاصلة $T$', options: ['$14{,}3$', '$3{,}14$', '$14{,}03$'], correct: 0, correction: 'العلامة المكتوبة 14 ثم ثلاث تدريجات صغيرة: $14+\\frac{3}{10}=14{,}3$ .' },
              { label: 'فاصلة $S$', options: ['$14{,}9$', '$9{,}14$', '$14{,}09$'], correct: 0, correction: 'العلامة 14 ثم تسع تدريجات صغيرة: $14+\\frac{9}{10}=14{,}9$ .' },
            ] },
          { kind: 'solution', ask: 0, lines: [
            'نقرأ العدد المكتوب على آخر لوحة قبل النقطة (14) ثم نعدّ التدريجات الصغيرة، كلّ واحدة $0{,}1$ كم.',
            '$T(14{,}3)$ و $S(14{,}9)$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'محطة الوقود',
        question: 'احصر فاصلة محطة الوقود $P$ بين فاصلتي تدريجتين متتاليتين.',
        asks: ['الحصر'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['hasr-faasila'],
            prompt: 'النقطة $P$ بين التدريجة الخامسة والتدريجة السادسة بعد اللوحة 14. فاصلتا هاتين التدريجتين:',
            options: ['$14{,}5$ و $14{,}6$', '$14{,}05$ و $14{,}06$', '$5$ و $6$'],
            correct: 0, cols: 1,
            explain: 'التدريجة الخامسة بعد 14 فاصلتها $14{,}5$ والسادسة $14{,}6$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-faasila'],
            prompt: 'حصر فاصلة $P$ :',
            options: ['$14{,}5<P<14{,}6$', '$P=14{,}5$', '$P=14{,}6$'],
            correct: 0, cols: 1,
            explain: 'بين تدريجتين لا نقرأ فاصلة مضبوطة بل نحصرها بين فاصلتيهما.' },
          { kind: 'solution', ask: 0, lines: [
            'التدريجتان المجاورتان للنقطة $P$ فاصلتاهما $14{,}5$ و $14{,}6$ .',
            'لا تقع $P$ على إحداهما، فنحصر فاصلتها: $14{,}5<P<14{,}6$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'المبدأ والأقرب',
        question: 'هل فاصلة مبدأ الطريق $O$ الذي لا يظهر معدومة؟ ومن $T$ و $S$ الأقرب إلى اللوحة 15 ؟',
        asks: ['فاصلة المبدأ', 'الأقرب إلى اللوحة 15'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mabda-ghayr-zahir'],
            prompt: 'فاصلة مبدأ الطريق $O$ :',
            options: ['معدومة، ولو لم يظهر', 'لا نعرفها لأنّه لا يظهر', '$14$'],
            correct: 0, cols: 1,
            explain: 'فاصلة المبدأ هي $0$ دائمًا: $O(0)$ ، ظهر في الصورة أم لم يظهر.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['faasila-nuqta'],
            prompt: 'الأقرب إلى اللوحة 15 :',
            options: ['الشاحنة $S(14{,}9)$', 'سيارة الإسعاف $T(14{,}3)$', 'المسافة نفسها'],
            correct: 0, cols: 1,
            explain: '$14{,}9$ أكبر من $14{,}3$ وأقرب إلى $15$ : بينها وبين اللوحة 15 تدريجة صغيرة واحدة فقط.' },
          { kind: 'solution', ask: 0, lines: [
            'فاصلة المبدأ $O$ هي $0$ في كلّ حال: $O(0)$ .',
            '$S(14{,}9)$ تبعد عن اللوحة 15 بتدريجة صغيرة، و $T(14{,}3)$ تبعد عنها بسبع تدريجات: الأقرب هي $S$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — ورقة الرسم',
    context: 'دفتر النشاط',
    emoji: '📓',
    tone: 'amber',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'صفحة الدفتر', icon: 'book', lines: [{ label: 'العرض', value: '12', unit: 'سم' }] },
      { title: 'وحدة الطول', icon: 'pen', lines: [{ label: 'الطول', value: '4', unit: 'سم' }] },
      { title: 'النقط', icon: 'leaf', lines: [{ label: 'A', value: '0,7', unit: '' }, { label: 'B', value: '1,6', unit: '' }, { label: 'C', value: '2,9', unit: '' }] },
    ], ariaLabel: 'صفحة عرضها 12 سم ووحدة طولها 4 سم وثلاث نقط فاصلاتها 0,7 و 1,6 و 2,9' },
    statement: 'عرض صفحة دفتر وليد 12 سم. يريد وليد أن يدرّج نصف مستقيم أفقيًا مبدؤه $O$ عند الحافة اليسرى للصفحة ليعلّم النقط $A(0{,}7)$ و $B(1{,}6)$ و $C(2{,}9)$ ، فاختار أن تكون وحدة الطول 4 سم ثم قسّمها إلى عشرة أجزاء متساوية. يستعمل وليد قلمًا أزرق.',
    data: [
      { id: 'e1', text: 'عرض الصفحة 12 سم، والمبدأ O عند حافتها اليسرى', useful: true },
      { id: 'e2', text: 'وحدة الطول 4 سم مقسّمة إلى عشرة أجزاء متساوية', useful: true },
      { id: 'e3', text: 'النقط A(0,7) و B(1,6) و C(2,9)', useful: true },
      { id: 'pen', text: 'يستعمل وليد قلمًا أزرق', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'تتّسع الصفحة؟',
        question: 'هل تتّسع الصفحة للنقطة $C$ بهذه الوحدة؟',
        asks: ['اتّساع الصفحة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tadrij-nisf-mustaqim'],
            prompt: 'الوحدة 4 سم، والصفحة 12 سم:',
            options: ['نعم: $C$ قبل العلامة 3 التي تقع عند 12 سم تمامًا', 'لا: لأنّ $2{,}9$ أكبر من 2', 'لا: لأنّ الوحدة 4 سم أكبر من تدريجة'],
            correct: 0, cols: 1,
            explain: 'العلامات 1 و 2 و 3 تقع عند 4 و 8 و 12 سم. فاصلة $C$ أقل من 3 فتقع قبل حافة الصفحة.' },
          { kind: 'solution', ask: 0, lines: [
            'بالوحدة 4 سم تقع العلامات 1 و 2 و 3 عند 4 سم و 8 سم و 12 سم من $O$ .',
            'فاصلة $C$ هي $2{,}9$ ، أقل من 3 ، فتقع $C$ قبل العلامة 3 ، أي داخل الصفحة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'التدريجة الصغيرة',
        question: 'احسب بالميليمتر طول التباعد بين تدريجتين صغيرتين متتاليتين.',
        asks: ['طول التدريجة بالميليمتر'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['tadrij-nisf-mustaqim'], prompt: 'كم ميليمترًا في الوحدة (4 سم) ؟', expected: 40,
            explain: '$1$ سم $=10$ ملم، فـ $4$ سم $=40$ ملم.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tadrij-nisf-mustaqim'], prompt: 'طول التباعد بين تدريجتين صغيرتين بالميليمتر:', expected: 4, display: '4',
            explain: 'الوحدة (40 ملم) مقسّمة إلى عشرة أجزاء متساوية: كلّ جزء 4 ملم.' },
          { kind: 'solution', ask: 0, lines: [
            'الوحدة 4 سم $=40$ ملم، مقسّمة إلى عشرة أجزاء متساوية.',
            'التباعد بين تدريجتين صغيرتين $40\\div10=4$ ملم.',
          ] },
        ],
      },
      {
        label: '3)', title: 'عدّ التدريجات',
        question: 'كم تدريجة صغيرة تفصل النقطة $C$ عن $O$ ؟',
        asks: ['عدد التدريجات الصغيرة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['tadrij-nisf-mustaqim'], prompt: 'عدد التدريجات الصغيرة في وحدتين كاملتين:', expected: 20,
            explain: 'في كلّ وحدة عشر تدريجات: $2\\times10=20$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['faasila-nuqta'], prompt: 'عدد التدريجات الصغيرة بين $O$ والنقطة $C(2{,}9)$ :', expected: 29, display: '29',
            explain: 'وحدتان (20 تدريجة) ثم تسع تدريجات صغيرة: $20+9=29$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$C(2{,}9)$ : وحدتان كاملتان، أي 20 تدريجة صغيرة، ثم تسع تدريجات صغيرة.',
            'عدد التدريجات بين $O$ و $C$ : $20+9=29$ .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
