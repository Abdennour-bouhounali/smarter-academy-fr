/**
 * Les trois « مسائل » du درس « خاصية فيثاغورس » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). Ajouts de la plateforme (`exam_style_problem`) : autres contextes, autres nombres que le manuel. La مسألة 1
 * (`LESSON_CONFIG.lessonProblem` : le chemin en diagonale du jardin de l'école, son prix, un parterre « presque » droit) ; la 2 modelée
 * sur أتعمّق 31 (le cric en losange : de combien la voiture monte-t-elle ?) ; la 3 la diagonale d'un écran, exacte et arrondie, et une
 * annonce honnête ou non. Chaque nombre est vérifié dans ./problems.test.js (core/arithmetic/pythagoras.js, exact).
 */
import { addition, src } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';
import { PROBLEM_FIGURES } from './figures.js';

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — ممرّ الحديقة',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🌳',
    tone: 'emerald',
    source: addition('exam_style_problem'),
    figure: LESSON_CONFIG.lessonProblem.figure,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'الحديقة مستطيل ABCD فيه AB = 12 m و BC = 9 m', useful: true },
      { id: 'd2', text: 'الممرّ مستقيم من الركن A إلى الركن C', useful: true },
      { id: 'd3', text: 'ثمن تبليط المتر الواحد من الممرّ 850 دج', useful: true },
      { id: 'd4', text: 'أضلاع الحوض: EF = 1,2 m و EG = 1,6 m و FG = 2,1 m', useful: true },
      { id: 'd5', text: 'تتعاون جمعية التلاميذ على تهيئة الحديقة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'طول الممرّ',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['الطول AC'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['watar'], prompt: 'في أيّ مثلث قائم نحسب AC، وما وتره؟',
            options: ['ABC قائم في B، ووتره [AC]', 'ABC قائم في A، ووتره [BC]', 'ACD قائم في C، ووتره [AD]'], correct: 0,
            explain: 'زوايا المستطيل قائمة: المثلث ABC قائم في B، والضلع المقابل لـ B هو [AC].' },
          { kind: 'numeric', role: 'compute', requires: ['hisab-watar'], prompt: 'قيمة $AC^2$ (بالمتر المربع):', expected: 225,
            explain: '$AC^2=AB^2+BC^2=12^2+9^2=144+81=225$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-watar'], prompt: 'طول الممرّ AC بالمتر:', expected: 15,
            explain: '$15\\times15=225$ ، إذن $AC=15\\,\\mathrm{m}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'المثلث ABC قائم في B (زاوية مستطيل)، فحسب خاصية فيثاغورس: $AC^2=AB^2+BC^2$ .',
            '$AC^2=12^2+9^2=144+81=225$ ، ومنه $AC=15\\,\\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'ثمن التبليط',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['ثمن التبليط'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-watar'], prompt: 'ثمن تبليط الممرّ بالدينار:', expected: 12750,
            explain: 'طول الممرّ في ثمن المتر: $15\\times850=12750$ دج.' },
          { kind: 'solution', ask: 0, lines: ['الثمن هو طول الممرّ مضروبًا في ثمن المتر الواحد.', 'ثمن التبليط: $15\\times850=12750$ دج.'] },
        ],
      },
      {
        label: '3)', title: 'الحوض المثلث',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['هل الحوض قائم في E؟'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['ithbat-ghayr-qaim'], prompt: 'لو كان الحوض قائما في E لكان وتره:',
            options: ['[FG]، وهو أطول الأضلاع', '[EF]', '[EG]'], correct: 0,
            explain: 'الوتر يقابل الزاوية القائمة في E، وهو أطول الأضلاع: $[FG]$ .' },
          { kind: 'numeric', role: 'compute', requires: ['ithbat-ghayr-qaim'], prompt: 'قيمة $EF^2+EG^2$:', expected: 4,
            explain: '$1{,}2^2+1{,}6^2=1{,}44+2{,}56=4$ .' },
          { kind: 'numeric', role: 'compute', requires: ['ithbat-ghayr-qaim'], prompt: 'قيمة $FG^2$:', expected: 4.41,
            explain: '$2{,}1^2=4{,}41$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ghayr-qaim'], prompt: 'هل الحوض قائم في E؟',
            options: ['لا، لأنّ $FG^2\\neq EF^2+EG^2$', 'نعم، لأنّ 4 قريب من 4,41', 'نعم، لأنّ [FG] أطول الأضلاع'], correct: 0,
            explain: '$4{,}41\\neq4$ ، فحسب خاصية فيثاغورس الحوض غير قائم في E: على البستاني أن يعدّل أحد أضلاعه (مثلا $FG=2\\,\\mathrm{m}$).' },
          { kind: 'solution', ask: 0, lines: [
            'أطول الأضلاع $[FG]$ : $FG^2=2{,}1^2=4{,}41$ ، و $EF^2+EG^2=1{,}44+2{,}56=4$ .',
            '$FG^2\\neq EF^2+EG^2$ ، فحسب خاصية فيثاغورس الحوض EFG غير قائم في E.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — رافعة السيارة',
    context: 'مساعدة الجار',
    emoji: '🚗',
    tone: 'amber',
    source: src('deep-31', 178, 'أتعمّق'),
    figure: PROBLEM_FIGURES['masala-2'],
    statement: 'ثُقبت عجلة سيارة الجار، فأسرع يوسف ووالده لمساعدته. رافعة السيارة معيّن PQRS أذرعه الأربعة متساوية، طول كل ذراع 25 cm، وقطراه [QS] (المحور الأفقي) و [PR] (ارتفاع الرافعة) متعامدان ومتناصفان في O. في البداية طول المحور QS = 30 cm، ثم يدير الوالد المقبض فيقصر المحور حتى يصير QS = 14 cm.',
    data: [
      { id: 'j1', text: 'PQRS معيّن طول ضلعه 25 cm، قطراه متعامدان ومتناصفان في O', useful: true },
      { id: 'j2', text: 'في البداية QS = 30 cm', useful: true },
      { id: 'j3', text: 'في النهاية QS = 14 cm', useful: true },
      { id: 'j4', text: 'أسرع يوسف ووالده لمساعدة الجار', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الارتفاع في البداية',
        question: 'احسب ارتفاع الرافعة PR حين يكون QS = 30 cm.',
        asks: ['PR في البداية'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['watar'], prompt: 'المثلث ORS قائم في O. ما وتره؟',
            options: ['[RS]، الذراع', '[OR]', '[OS]'], correct: 0, explain: 'الضلع المقابل للزاوية القائمة في O هو الذراع $[RS]$ .' },
          { kind: 'numeric', role: 'compute', requires: ['hisab-dil'], prompt: 'الطول OR بالسنتيمتر (OS نصف QS):', expected: 20,
            explain: '$OS=15$ و $OR^2=25^2-15^2=625-225=400$ ، و $20^2=400$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-dil'], prompt: 'الارتفاع PR بالسنتيمتر:', expected: 40,
            explain: 'O منتصف $[PR]$ : $PR=2\\times20=40\\,\\mathrm{cm}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'قطرا المعيّن متعامدان ومتناصفان: المثلث ORS قائم في O، و $OS=30\\div2=15\\,\\mathrm{cm}$ .',
            'حسب خاصية فيثاغورس: $OR^2=RS^2-OS^2=625-225=400$ ، إذن $OR=20\\,\\mathrm{cm}$ و $PR=40\\,\\mathrm{cm}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الارتفاع في النهاية',
        question: 'احسب ارتفاع الرافعة PR حين يصير QS = 14 cm.',
        asks: ['PR في النهاية'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['hisab-dil'], prompt: 'الطول OR الجديد بالسنتيمتر:', expected: 24,
            explain: '$OS=7$ و $OR^2=625-49=576$ ، و $24^2=576$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-dil'], prompt: 'الارتفاع PR الجديد بالسنتيمتر:', expected: 48,
            explain: '$PR=2\\times24=48\\,\\mathrm{cm}$ .' },
          { kind: 'solution', ask: 0, lines: ['$OS=14\\div2=7$ والمثلث ORS قائم في O: $OR^2=25^2-7^2=576$ .', '$OR=24$ ، إذن $PR=2\\times24=48\\,\\mathrm{cm}$ .'] },
        ],
      },
      {
        label: '3)', title: 'كم ترتفع السيارة؟',
        question: 'بكم سنتيمترا ارتفعت السيارة؟',
        asks: ['الارتفاع الإضافي'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-dil'], prompt: 'الفرق بين الارتفاعين بالسنتيمتر:', expected: 8,
            explain: '$48-40=8\\,\\mathrm{cm}$ .' },
          { kind: 'solution', ask: 0, lines: ['ارتفاع الرافعة صار 48 cm بعد أن كان 40 cm.', 'ارتفعت السيارة بـ $48-40=8\\,\\mathrm{cm}$ ، وطول الذراع لم يتغيّر.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — شاشة الهاتف',
    context: 'الصدق في البيع',
    emoji: '📱',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    figure: PROBLEM_FIGURES['masala-3'],
    statement: 'كتب صاحب متجر في إعلان: « هاتف شاشته 6 بوصات ». قاس أمين الشاشة قبل أن يشتري: هي مستطيل ABCD عرضه AB = 7 cm وطوله BC = 13 cm. قياس الشاشة بالبوصة هو طول قطرها، والبوصة الواحدة 2,54 cm. أراد صاحب المتجر أن يكون صادقا مع زبائنه فطلب من أمين أن يتحقّق.',
    data: [
      { id: 's1', text: 'الشاشة مستطيل ABCD فيه AB = 7 cm و BC = 13 cm', useful: true },
      { id: 's2', text: 'قياس الشاشة هو طول قطرها', useful: true },
      { id: 's3', text: 'البوصة 2,54 cm', useful: true },
      { id: 's4', text: 'الإعلان: 6 بوصات', useful: true },
      { id: 's5', text: 'صاحب المتجر يريد أن يكون صادقا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'القيمة المضبوطة للقطر',
        question: 'احسب $AC^2$ ثم اكتب القيمة المضبوطة لطول القطر AC.',
        asks: ['AC²', 'القيمة المضبوطة'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-watar'], prompt: 'قيمة $AC^2$ :', expected: 218,
            explain: 'ABC قائم في B: $AC^2=7^2+13^2=49+169=218$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['lamsa-jidhr'], prompt: 'القيمة المضبوطة لطول القطر:',
            options: ['$\\sqrt{218}\\,\\mathrm{cm}$', '$20\\,\\mathrm{cm}$', '$109\\,\\mathrm{cm}$'], correct: 0,
            explain: 'لا يوجد عدد عشري مربعه 218 بالضبط ($14{,}7^2=216{,}09$ و $14{,}8^2=219{,}04$): القيمة المضبوطة $\\sqrt{218}$ .' },
          { kind: 'solution', ask: 0, lines: ['حسب خاصية فيثاغورس في ABC القائم في B: $AC^2=7^2+13^2=49+169=218$ .', 'لا يوجد عدد عشري مربعه 218، فالقيمة المضبوطة $AC=\\sqrt{218}\\,\\mathrm{cm}$ .'] },
        ],
      },
      {
        label: '2)', title: 'قيمة مقرّبة',
        question: 'أعط قيمة مقرّبة إلى $0{,}1$ لطول القطر بالسنتيمتر.',
        asks: ['قيمة مقرّبة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['lamsa-jidhr'], prompt: 'القطر مدوّرا إلى 0,1 cm:', expected: 14.8,
            explain: 'الشاشة تعرض 14,76482306 ، فالمدوّر إلى $0{,}1$ هو $14{,}8$ .' },
          { kind: 'solution', ask: 0, lines: ['بالآلة الحاسبة: √ 218 = يظهر 14,76482306 .', 'الرقم بعد الأعشار 6، فندوّر بالزيادة: $AC\\approx14{,}8\\,\\mathrm{cm}$ .'] },
        ],
      },
      {
        label: '3)', title: 'هل الإعلان صادق؟',
        question: 'هل قياس الشاشة 6 بوصات فعلا؟ برّر.',
        asks: ['الحكم على الإعلان'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['lamsa-jidhr'], prompt: '6 بوصات بالسنتيمتر:', expected: 15.24,
            explain: '$6\\times2{,}54=15{,}24\\,\\mathrm{cm}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['lamsa-jidhr'], prompt: 'الحكم:',
            options: ['الإعلان غير دقيق: القطر نحو 14,8 cm أي أقلّ من 15,24 cm', 'الإعلان صادق: 13 cm أقلّ من 15,24 cm', 'الإعلان صادق: 7 + 13 = 20 cm أكثر من 15,24 cm'], correct: 0,
            explain: 'القطر $\\sqrt{218}\\approx14{,}8\\,\\mathrm{cm}$ ، أي نحو $14{,}8\\div2{,}54\\approx5{,}8$ بوصة: يصحّح صاحب المتجر إعلانه.' },
          { kind: 'solution', ask: 0, lines: [
            '$6\\times2{,}54=15{,}24\\,\\mathrm{cm}$ ، والقطر $\\sqrt{218}\\approx14{,}8\\,\\mathrm{cm}$ فقط.',
            'الشاشة نحو 5,8 بوصات لا 6: الإعلان غير دقيق.',
          ] },
        ],
      },
    ],
  },
];
export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
