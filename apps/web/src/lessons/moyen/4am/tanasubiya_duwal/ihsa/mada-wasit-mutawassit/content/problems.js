/**
 * Les trois « مسائل » du درس 2 de l'unité 8 « الإحصاء » (modules 5, 6, 7) — des exercices COMPLETS de type
 * امتحان, résolus pas à pas (common/problems/GuidedProblem.jsx).
 *
 * AJOUTS DE LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`) : le manuel ne les contient
 * pas. Ils restent dans le périmètre de la leçon : المدى (différence de la plus grande et de la plus petite
 * valeur, signes compris), المتوسط المتوازن (chaque valeur × son effectif, ÷ التكرار الكلّي), الوسيط par les
 * rangs (N pair / impair, TOUJOURS après rangement — le piège « le milieu de la liste écrite » ou « le milieu
 * du tableau »), la lecture « 50 % au moins ≤ Med », l'effet d'une valeur extrême. L'effectif cumulé croissant
 * (leçon 1) ne sert qu'à situer un rang. Jamais le mode, ni les classes (non nécessaires ici).
 *
 * La مسألة 1 est « مسألة الدرس » : son énoncé vit dans `LESSON_CONFIG.lessonProblem` (montré dès le sommaire et
 * rappelé au module 1), prolongement du lab متقدم (la chaleur d'El Oued sur le ميزان) avec d'autres nombres :
 * dix jours de juillet, puis un jour de vent de sable (32) — la moyenne court, la médiane reste —, puis le
 * climatiseur (« 44 درجة أو أكثر » : la médiane le dit pour la moitié des jours au moins).
 * Les مسائل 2 et 3 (contextes réservés par le lead) : les notes d'un BEM blanc (tableau, N = 30 pair, moyenne
 * 10,3 > 10 mais médiane 9,5 : la phrase du directeur réfutée, les groupes de soutien) ; les nuits de janvier à
 * Tamanrasset (tableau, températures négatives, N = 31 impair, Med = 0 ; « ≤ 0 » n'est pas « < 0 »).
 *
 * Chaque nombre est recalculé dans ./problems.test.js (statistics.js du paquet core + arithmétique exacte).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');
const DEG = '$^{\\circ}\\mathrm{C}$';

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — حرارة جويلية بالوادي',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🌡️',
    tone: 'sky',
    source: SOURCE,
    statement: LESSON_CONFIG.lessonProblem.statement,
    table: LESSON_CONFIG.lessonProblem.table,
    data: [
      { id: 'temps', text: 'درجات الحرارة القصوى للأيام العشرة الأولى من جويلية', useful: true },
      { id: 'days', text: 'عدد الأيام: 10', useful: true },
      { id: 'ac', text: 'المكيّف يشتغل عندما تبلغ الحرارة القصوى 44 درجة أو أكثر', useful: true },
      { id: 'cost', text: 'كلفة كهرباء المكيّف: 120 دج في اليوم', useful: true },
      { id: 'every3h', text: 'تسجّل المحطّة القياسات كل 3 ساعات', useful: false },
      { id: 'city', text: 'المحطّة في مدينة الوادي', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المدى والمتوسط والوسيط',
        question: 'احسب مدى هذه السلسلة ومتوسطها، ثم عيّن وسيطها.',
        asks: ['مدى السلسلة', 'متوسط السلسلة', 'وسيط السلسلة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['mada'],
            prompt: 'مدى هذه السلسلة هو الفرق:',
            options: ['$48 - 39$', '$46 - 43$', '$48 - 43$'],
            correct: 0, cols: 3,
            explain: 'المدى فرق بين أكبر قيمة ($48$ ، اليوم الثامن) وأصغر قيمة ($39$ ، اليوم السادس). أمّا $46 - 43$ فهو فرق آخر يوم وأوّل يوم، لا أكبر قيمة وأصغرها.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mada'],
            prompt: 'مدى السلسلة (بالدرجة):', expected: 9,
            explain: '$48 - 39 = 9$ : تباعدت درجات الحرارة القصوى بـ 9 درجات.' },
          { kind: 'numeric', role: 'compute', requires: ['mutawassit-mutawazin'],
            prompt: 'مجموع درجات الحرارة العشر:', expected: 441,
            explain: '$43 + 45 + 41 + 47 + 44 + 39 + 46 + 48 + 42 + 46 = 441$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['mutawassit-mutawazin'],
            prompt: 'متوسط السلسلة $m$ (بالدرجة):', expected: 44.1, display: '44,1',
            explain: '$m = \\dfrac{441}{10} = 44{,}1$ : نقسم المجموع على عدد الأيام $10$. على الميزان، هذه نقطة توازن القيم.' },
          { kind: 'choice', role: 'translate', requires: ['wasit-rutba'],
            prompt: 'لتعيين وسيط هذه السلسلة:',
            options: [
              'نرتّب القيم العشر، ثم نأخذ منتصف القيمتين ذواتي الرتبتين $5$ و $6$',
              'نأخذ منتصف درجتي اليومين الخامس والسادس كما هما في الجدول',
              'نرتّب القيم العشر، ثم نأخذ القيمة ذات الرتبة $5$',
            ],
            correct: 0,
            explain: '$10$ قيم، عدد زوجي: الرتبتان $\\dfrac{10}{2} = 5$ و $5 + 1 = 6$ ، لكن بعد الترتيب. درجتا اليومين الخامس والسادس ($44$ و $39$) غير مرتّبتين: منتصفهما $\\dfrac{44 + 39}{2} = 41{,}5$ ليس وسيطًا.' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['wasit-rutba'],
            prompt: 'وسيط السلسلة $\\mathrm{Med}$ (بالدرجة):', expected: 44.5, display: '44,5',
            explain: 'بعد الترتيب التصاعدي: $39$ ، $41$ ، $42$ ، $43$ ، $\\mathbf{44}$ ، $\\mathbf{45}$ ، $46$ ، $46$ ، $47$ ، $48$ ؛ $\\mathrm{Med} = \\dfrac{44 + 45}{2} = 44{,}5$.' },
          { kind: 'solution', ask: 0, lines: [
            'أكبر قيمة $48$ وأصغر قيمة $39$ : المدى $48 - 39 = 9$.',
            '$m = \\dfrac{43 + 45 + 41 + 47 + 44 + 39 + 46 + 48 + 42 + 46}{10} = \\dfrac{441}{10} = 44{,}1$.',
            'بعد الترتيب، القيمتان ذواتا الرتبتين $5$ و $6$ هما $44$ و $45$ : $\\mathrm{Med} = \\dfrac{44 + 45}{2} = 44{,}5$.',
            'مدى درجات الحرارة القصوى 9 درجات، ومتوسطها $44{,}1$ درجة، ووسيطها $44{,}5$ درجة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'يوم الرياح الرملية',
        question: 'في اليوم الحادي عشر هبّت رياح رملية، فلم تتجاوز الحرارة القصوى 32 درجة. نضيف هذه القيمة إلى السلسلة. احسب المتوسط الجديد، ثم عيّن الوسيط الجديد. أيّ المؤشّرين تغيّر أكثر بهذه القيمة البعيدة؟',
        asks: ['المتوسط الجديد', 'الوسيط الجديد', 'أيّ المؤشّرين تغيّر أكثر؟'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['mutawassit-mutawazin'],
            prompt: 'مجموع القيم الإحدى عشرة (استعمل المجموع السابق):', expected: 473,
            explain: '$441 + 32 = 473$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mutawassit-mutawazin'],
            prompt: 'المتوسط الجديد (بالدرجة):', expected: 43,
            explain: '$\\dfrac{473}{11} = 43$ لأنّ $11 \\times 43 = 473$. عدد القيم صار $11$ : القسمة على $10$ خطأ.' },
          { kind: 'choice', role: 'translate', requires: ['wasit-rutba'],
            prompt: 'السلسلة الجديدة فيها $11$ قيمة، فوسيطها:',
            options: [
              'القيمة ذات الرتبة $6$ بعد الترتيب',
              'منتصف القيمتين ذواتي الرتبتين $5$ و $6$ بعد الترتيب',
              'درجة اليوم السادس في الجدول',
            ],
            correct: 0,
            explain: '$11$ عدد فردي: رتبة الوسيط $\\dfrac{11 + 1}{2} = 6$ ، فيبقى $5$ قيم قبله و $5$ قيم بعده. لا نأخذ منتصف قيمتين إلّا إذا كان عدد القيم زوجيًا.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['wasit-rutba'],
            prompt: 'الوسيط الجديد (بالدرجة):', expected: 44,
            explain: 'بعد الترتيب: $32$ ، $39$ ، $41$ ، $42$ ، $43$ ، $\\mathbf{44}$ ، $45$ ، $46$ ، $46$ ، $47$ ، $48$ : القيمة السادسة هي $44$.' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['qiyam-mutatarrifa'],
            prompt: 'أيّ المؤشّرين تغيّر أكثر بإضافة القيمة $32$؟',
            options: [
              'المتوسط: نقص بـ $44{,}1 - 43 = 1{,}1$ ، أمّا الوسيط فنقص بـ $44{,}5 - 44 = 0{,}5$ فقط',
              'الوسيط: لأنّ القيمة $32$ دخلت وسط السلسلة',
              'لم يتغيّر أيّ منهما: القيمة $32$ قيمة واحدة من إحدى عشرة',
            ],
            correct: 0,
            explain: 'المتوسط يجمع كل القيم، فتجرّه القيمة البعيدة $32$. الوسيط يتعلّق بالرتب: $32$ تأخذ الرتبة الأولى، ولا يتحرّك الوسط إلّا بنصف رتبة. (والمدى صار $48 - 32 = 16$ بدل $9$.)' },
          { kind: 'solution', ask: 2, lines: [
            '$m = \\dfrac{441 + 32}{11} = \\dfrac{473}{11} = 43$.',
            '$11$ قيمة، عدد فردي: الوسيط القيمة ذات الرتبة $\\dfrac{11 + 1}{2} = 6$ بعد الترتيب، أي $\\mathrm{Med} = 44$.',
            'نقص المتوسط بـ $44{,}1 - 43 = 1{,}1$ درجة، والوسيط بـ $44{,}5 - 44 = 0{,}5$ درجة فقط: المتوسط تأثّر أكثر بالقيمة البعيدة.',
          ] },
        ],
      },
      {
        label: '3)', title: 'مكيّف عائلة يونس',
        question: 'بيّن، باستعمال الوسيط الجديد، أنّ عائلة يونس شغّلت المكيّف في نصف الأيام الإحدى عشرة على الأقل. كم يومًا شغّلته؟ احسب ما دفعته العائلة للكهرباء من أجل ذلك.',
        asks: ['المكيّف اشتغل نصف الأيام على الأقل', 'عدد أيام التشغيل', 'كلفة الكهرباء'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['wasit'],
            prompt: 'ماذا يعني الوسيط الجديد في هذه الوضعية؟',
            options: [
              'نصف القيم على الأقل أكبر من أو تساوي $44$ : المكيّف اشتغل في نصف الأيام على الأقل',
              'نصف الأيام بالضبط بلغت حرارتها $44$ درجة',
              'المتوسط $43$ أصغر من $44$ : المكيّف اشتغل في أقلّ من نصف الأيام',
            ],
            correct: 0,
            explain: 'الوسيط $44$ هو القيمة ذات الرتبة $6$ من $11$ : القيم ذوات الرتب من $6$ إلى $11$ كلها أكبر من أو تساوي $44$ ، وهي أكثر من نصف القيم. المتوسط لا يعطي هذه المعلومة.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'عدد الأيام التي شغّلت فيها العائلة المكيّف:', expected: 6,
            explain: 'الأيام التي بلغت حرارتها 44 درجة أو أكثر: $44$ ، $45$ ، $46$ ، $46$ ، $47$ ، $48$. يوم الـ 44 درجة يُحسب («أو أكثر»)؛ من يعدّ الأيام التي تفوق 44 فقط يجد 5.' },
          { kind: 'numeric', role: 'answer', ask: 2, suffix: 'دج',
            prompt: 'ما دفعته العائلة للكهرباء:', expected: 720,
            explain: '$6 \\times 120 = 720$.' },
          { kind: 'solution', ask: 0, lines: [
            'الوسيط $44$ هو القيمة ذات الرتبة $6$ من $11$ : القيم من الرتبة $6$ إلى الرتبة $11$ كلها أكبر من أو تساوي $44$.',
            'هذه $6$ أيام من $11$ ، و $6 > \\dfrac{11}{2}$ : اشتغل المكيّف في نصف الأيام على الأقل.',
            'شغّلت العائلة المكيّف 6 أيام، ودفعت للكهرباء $6 \\times 120 = 720$ دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — الامتحان التجريبي',
    context: 'علامات قسم في امتحان تجريبي لشهادة التعليم المتوسط',
    emoji: '📝',
    tone: 'violet',
    source: SOURCE,
    statement: 'أجرى تلاميذ قسم من السنة الرابعة متوسط، وقد تعاهدوا على التعاون والمراجعة الجماعية، امتحانًا تجريبيًا في الرياضيات استعدادًا لشهادة التعليم المتوسط، ودام الامتحان ساعتين. في القسم 30 تلميذًا، منهم 16 بنتًا. يبيّن الجدول علامات التلاميذ (على 20) وعدد التلاميذ الذين تحصّلوا على كل علامة. تحرص المتوسطة على نجاح الجميع، فتنظّم حصص دعم لكل تلميذ علامته أقلّ من 10، في أفواج من 4 تلاميذ على الأكثر؛ لكل فوج 6 حصص، ويتقاضى الأستاذ 1500 دج عن الحصة الواحدة.',
    table: {
      head: ['العلامة', '4', '6', '7', '8', '9', '10', '12', '14', '17'],
      rows: [['عدد التلاميذ', '1', '2', '4', '4', '4', '3', '5', '4', '3']],
    },
    data: [
      { id: 'marks', text: 'العلامات وعدد التلاميذ لكل علامة (الجدول)', useful: true },
      { id: 'pupils', text: 'في القسم 30 تلميذًا', useful: true },
      { id: 'support', text: 'الدعم لكل تلميذ علامته أقلّ من 10', useful: true },
      { id: 'groups', text: 'أفواج من 4 تلاميذ على الأكثر', useful: true },
      { id: 'pay', text: 'لكل فوج 6 حصص، و 1500 دج للحصة', useful: true },
      { id: 'girls', text: 'منهم 16 بنتًا', useful: false },
      { id: 'hours', text: 'دام الامتحان ساعتين', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'متوسط القسم ومدى العلامات',
        question: 'احسب متوسط علامات القسم، ثم مدى هذه السلسلة.',
        asks: ['متوسط علامات القسم', 'مدى السلسلة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['mutawassit-mutawazin'],
            prompt: 'متوسط علامات القسم يُحسب بالكتابة:',
            options: [
              '$\\dfrac{4 \\times 1 + 6 \\times 2 + 7 \\times 4 + 8 \\times 4 + 9 \\times 4 + 10 \\times 3 + 12 \\times 5 + 14 \\times 4 + 17 \\times 3}{30}$',
              '$\\dfrac{4 + 6 + 7 + 8 + 9 + 10 + 12 + 14 + 17}{9}$',
              '$\\dfrac{4 \\times 1 + 6 \\times 2 + 7 \\times 4 + 8 \\times 4 + 9 \\times 4 + 10 \\times 3 + 12 \\times 5 + 14 \\times 4 + 17 \\times 3}{9}$',
            ],
            correct: 0,
            explain: 'كل علامة تُحسب بعدد التلاميذ الذين تحصّلوا عليها، ثم نقسم على التكرار الكلّي $30$ ، لا على عدد العلامات المختلفة $9$.' },
          { kind: 'numeric', role: 'compute', requires: ['mutawassit-mutawazin'],
            prompt: 'مجموع علامات التلاميذ الثلاثين (البسط):', expected: 309,
            explain: '$4 + 12 + 28 + 32 + 36 + 30 + 60 + 56 + 51 = 309$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mutawassit-mutawazin'],
            prompt: 'متوسط علامات القسم:', expected: 10.3, display: '10,3',
            explain: '$m = \\dfrac{309}{30} = 10{,}3$. متوسط العلامات التسع دون أعداد التلاميذ $\\dfrac{87}{9}$ لا يمثّل القسم.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['mada'],
            prompt: 'مدى السلسلة:', expected: 13,
            explain: 'أكبر علامة $17$ وأصغر علامة $4$ : $17 - 4 = 13$. المدى فرق بين علامتين، لا بين عددين من سطر التلاميذ.' },
          { kind: 'solution', ask: 0, lines: [
            '$m = \\dfrac{4 \\times 1 + 6 \\times 2 + 7 \\times 4 + 8 \\times 4 + 9 \\times 4 + 10 \\times 3 + 12 \\times 5 + 14 \\times 4 + 17 \\times 3}{30} = \\dfrac{309}{30} = 10{,}3$.',
            'أكبر علامة $17$ وأصغر علامة $4$ : المدى $17 - 4 = 13$.',
            'متوسط علامات القسم $10{,}3$ ، ومدى السلسلة $13$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'قول المدير',
        question: 'عيّن وسيط هذه السلسلة. قال المدير: «المتوسط أكبر من 10، إذن أكثر من نصف التلاميذ تحصّلوا على 10 أو أكثر». هل قوله صحيح؟',
        asks: ['وسيط السلسلة', 'هل قول المدير صحيح؟'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['wasit-rutba'],
            prompt: 'التكرار الكلّي $30$ عدد زوجي، فالوسيط هو:',
            options: [
              'منتصف القيمتين ذواتي الرتبتين $15$ و $16$ بعد الترتيب',
              'القيمة ذات الرتبة $15$ بعد الترتيب',
              'العلامة التي في وسط الجدول',
            ],
            correct: 0,
            explain: '$\\dfrac{30}{2} = 15$ : الرتبتان $15$ و $15 + 1 = 16$ ، والوسيط منتصف القيمتين اللتين تحملانهما. العلامة التي في وسط الجدول ($9$) لا تعتبر عدد التلاميذ.' },
          { kind: 'numeric', role: 'compute', requires: ['takrar-mujamma-said'],
            prompt: 'التكرار المجمع الصاعد للعلامة $9$ :', expected: 15,
            explain: '$1 + 2 + 4 + 4 + 4 = 15$ : العلامة $9$ تشغل الرتب من $12$ إلى $15$ ، والعلامة $10$ تبدأ من الرتبة $16$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['wasit-rutba'],
            prompt: 'وسيط السلسلة $\\mathrm{Med}$ :', expected: 9.5, display: '9,5',
            explain: 'القيمة ذات الرتبة $15$ هي $9$ ، وذات الرتبة $16$ هي $10$ : $\\mathrm{Med} = \\dfrac{9 + 10}{2} = 9{,}5$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['wasit'],
            prompt: 'هل قول المدير صحيح؟',
            options: [
              'لا: الوسيط $9{,}5$ أصغر من $10$ ؛ $15$ تلميذًا فقط من $30$ تحصّلوا على 10 أو أكثر، أي النصف لا أكثر',
              'نعم: المتوسط $10{,}3$ أكبر من $10$',
              'لا يمكن الحكم: الوسيط $9{,}5$ ليس علامة تحصّل عليها تلميذ',
            ],
            correct: 0,
            explain: 'المتوسط $10{,}3$ ترفعه العلامات الكبيرة ($14$ و $17$)؛ أمّا الوسيط فيقسم التلاميذ نصفين: $15$ علامة أصغر من أو تساوي $9$ ، و $15$ علامة أكبر من أو تساوي $10$. والوسيط ليس بالضرورة قيمة من قيم السلسلة.' },
          { kind: 'solution', ask: 0, lines: [
            '$N = 30$ عدد زوجي: الرتبتان $15$ و $16$ ؛ التكرار المجمع الصاعد للعلامة $9$ هو $15$.',
            '$\\mathrm{Med} = \\dfrac{9 + 10}{2} = 9{,}5$.',
            '$15$ تلميذًا تحصّلوا على أقلّ من 10 و $15$ على 10 أو أكثر: النصف بالضبط، لا أكثر. قول المدير خاطئ رغم أنّ $10{,}3 > 10$.',
          ] },
        ],
      },
      {
        label: '3)', title: 'حصص الدعم',
        question: 'كم فوج دعم تنظّم المتوسطة؟ احسب المبلغ الذي تدفعه للأستاذ.',
        asks: ['عدد أفواج الدعم', 'المبلغ المدفوع للأستاذ'],
        steps: [
          { kind: 'numeric', role: 'compute',
            prompt: 'عدد التلاميذ الذين علامتهم أقلّ من 10 :', expected: 15,
            explain: '$1 + 2 + 4 + 4 + 4 = 15$ : أصحاب العلامات $4$ ، $6$ ، $7$ ، $8$ ، $9$ ، وهم الذين وجدناهم قبل الوسيط في السؤال 2).' },
          { kind: 'numeric', role: 'compute',
            prompt: 'حاصل القسمة الإقليدية لعدد هؤلاء التلاميذ على 4:', expected: 3,
            explain: '$15 = 4 \\times 3 + 3$ مع $3 < 4$.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'عدد أفواج الدعم:', expected: 4,
            explain: 'ثلاثة أفواج من $4$ تلاميذ تستقبل $4 \\times 3 = 12$ تلميذًا فقط، ويبقى $3$ تلاميذ: يلزم فوج رابع.' },
          { kind: 'numeric', role: 'answer', ask: 1, suffix: 'دج',
            prompt: 'المبلغ الذي تدفعه المتوسطة للأستاذ:', expected: 36000,
            explain: '$4 \\times 6 = 24$ حصة، و $24 \\times 1500 = 36000$.' },
          { kind: 'solution', ask: 0, lines: [
            '$15 = 4 \\times 3 + 3$ مع $3 < 4$ : ثلاثة أفواج لا تكفي، ويلزم فوج رابع للتلاميذ الثلاثة الباقين.',
            'عدد الحصص $4 \\times 6 = 24$ ، والمبلغ $24 \\times 1500 = 36000$.',
            'تنظّم المتوسطة 4 أفواج دعم، وتدفع للأستاذ 36000 دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — ليالي تمنراست',
    context: 'الحرارة الدنيا في ليالي جانفي بتمنراست',
    emoji: '🌙',
    tone: 'emerald',
    source: SOURCE,
    statement: 'سجّلت محطّة الأرصاد الجوية بتمنراست درجة الحرارة الدنيا في كل ليلة من ليالي شهر جانفي (31 ليلة)، ويلخّص الجدول هذه القراءات. تقع المدينة على ارتفاع 1320 م تقريبًا. يشغّل فلاح مدفأة بيته البلاستيكي، حفاظًا على زرعه من الصقيع، في كل ليلة تكون فيها الحرارة الدنيا أقلّ من 0 درجة، فتستهلك 12 لترًا من المازوت في الليلة، وثمن اللتر 29 دج. ويتصدّق الفلاح بجزء من محصوله على الأسر المحتاجة.',
    table: {
      head: [`الحرارة الدنيا (${DEG})`, '-2', '-1', '0', '1', '2', '3', '4', '6'],
      rows: [['عدد الليالي', '3', '4', '9', '4', '4', '3', '2', '2']],
    },
    data: [
      { id: 'temps', text: 'درجات الحرارة الدنيا وعدد الليالي لكل درجة (الجدول)', useful: true },
      { id: 'nights', text: 'شهر جانفي: 31 ليلة', useful: true },
      { id: 'heater', text: 'المدفأة تشتغل في الليالي التي تكون حرارتها أقلّ من 0 درجة', useful: true },
      { id: 'fuel', text: 'استهلاك المدفأة: 12 لترًا من المازوت في الليلة', useful: true },
      { id: 'price', text: 'ثمن لتر المازوت 29 دج', useful: true },
      { id: 'altitude', text: 'ارتفاع المدينة 1320 م تقريبًا', useful: false },
      { id: 'station', text: 'القراءات من محطّة الأرصاد الجوية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المدى والمتوسط',
        question: 'احسب مدى هذه السلسلة ومتوسطها.',
        asks: ['مدى السلسلة', 'متوسط السلسلة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['mada'],
            prompt: 'مدى هذه السلسلة هو:',
            options: ['$6 - (-2)$', '$6 - 2$', '$9 - 2$'],
            correct: 0, cols: 3,
            explain: 'المدى فرق بين أكبر درجة $6$ وأصغر درجة $-2$ ، لا بين عددين من سطر الليالي ($9 - 2$). والكتابة $6 - 2$ تنسى إشارة $-2$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mada'],
            prompt: 'مدى السلسلة (بالدرجة):', expected: 8,
            explain: '$6 - (-2) = 6 + 2 = 8$.' },
          { kind: 'numeric', role: 'compute', requires: ['mutawassit-mutawazin'],
            prompt: 'مجموع جداءات كل درجة في عدد لياليها:', expected: 31,
            explain: '$-2 \\times 3 + (-1) \\times 4 + 0 \\times 9 + 1 \\times 4 + 2 \\times 4 + 3 \\times 3 + 4 \\times 2 + 6 \\times 2 = -6 - 4 + 0 + 4 + 8 + 9 + 8 + 12 = 31$. من ينسى إشارتي $-6$ و $-4$ يجد $51$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['mutawassit-mutawazin'],
            prompt: 'متوسط السلسلة $m$ (بالدرجة):', expected: 1,
            explain: '$m = \\dfrac{31}{31} = 1$ : نقسم على عدد الليالي $31$ ، لا على عدد الدرجات المختلفة $8$.' },
          { kind: 'solution', ask: 0, lines: [
            'أكبر درجة $6$ وأصغر درجة $-2$ : المدى $6 - (-2) = 8$.',
            '$m = \\dfrac{-2 \\times 3 + (-1) \\times 4 + 0 \\times 9 + 1 \\times 4 + 2 \\times 4 + 3 \\times 3 + 4 \\times 2 + 6 \\times 2}{31} = \\dfrac{31}{31} = 1$.',
            'مدى الحرارة الدنيا في جانفي 8 درجات، ومتوسطها درجة واحدة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الوسيط، ومقارنة بشهر جويلية',
        question: 'عيّن وسيط هذه السلسلة. في شهر جويلية من السنة نفسها تراوحت الحرارة الدنيا بتمنراست بين 21 و 27 درجة. في أيّ الشهرين كانت الحرارة الدنيا أكثر تشتّتًا؟',
        asks: ['وسيط السلسلة', 'الشهر الأكثر تشتّتًا'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['wasit-rutba'],
            prompt: 'التكرار الكلّي $31$ عدد فردي، فالوسيط هو:',
            options: [
              'القيمة ذات الرتبة $16$ بعد الترتيب',
              'منتصف القيمتين ذواتي الرتبتين $15$ و $16$',
              'منتصف الدرجتين اللتين في وسط الجدول ($1$ و $2$)',
            ],
            correct: 0,
            explain: 'رتبة الوسيط $\\dfrac{31 + 1}{2} = 16$ : تبقى $15$ ليلة قبله و $15$ ليلة بعده. وسط الجدول لا يعتبر عدد الليالي.' },
          { kind: 'numeric', role: 'compute', requires: ['takrar-mujamma-said'],
            prompt: 'التكرار المجمع الصاعد للدرجة $0$ :', expected: 16,
            explain: '$3 + 4 + 9 = 16$ : الليالي ذوات الرتب من $8$ إلى $16$ درجتها $0$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['wasit-rutba'],
            prompt: 'وسيط السلسلة (بالدرجة):', expected: 0,
            explain: 'التكرار المجمع الصاعد للدرجة $-1$ هو $3 + 4 = 7$ وللدرجة $0$ هو $16$ : الرتبة $16$ في الدرجة $0$ ، إذن الوسيط $0$.' },
          { kind: 'numeric', role: 'compute', requires: ['mada'],
            prompt: 'مدى الحرارة الدنيا في شهر جويلية (بالدرجة):', expected: 6,
            explain: '$27 - 21 = 6$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['mada'],
            prompt: 'في أيّ الشهرين كانت الحرارة الدنيا أكثر تشتّتًا؟',
            options: [
              'في جانفي: مداه $8$ أكبر من مدى جويلية $6$',
              'في جويلية: درجاته أعلى بكثير',
              'في جانفي: متوسطه $1$ أصغر',
            ],
            correct: 0,
            explain: 'المدى يقيس تباعد القيم، لا ارتفاعها ولا انخفاضها: $8 > 6$ ، فليالي جانفي أكثر تشتّتًا رغم أنّها أبرد.' },
          { kind: 'solution', ask: 0, lines: [
            '$N = 31$ عدد فردي: الوسيط القيمة ذات الرتبة $\\dfrac{31 + 1}{2} = 16$.',
            'التكرارات المجمعة الصاعدة $3$ ، $7$ ، $16$ : الرتبة $16$ في الدرجة $0$ ، إذن $\\mathrm{Med} = 0$.',
            'مدى جانفي $8$ ومدى جويلية $27 - 21 = 6$ : الحرارة الدنيا كانت أكثر تشتّتًا في جانفي.',
          ] },
        ],
      },
      {
        label: '3)', title: 'مدفأة البيت البلاستيكي',
        question: 'قال الفلاح: «وسيط السلسلة 0، إذن شغّلت المدفأة في نصف ليالي جانفي على الأقل». هل قوله صحيح؟ كم ليلة شغّل المدفأة فعلًا؟ احسب ثمن المازوت الذي استهلكته.',
        asks: ['هل قول الفلاح صحيح؟', 'عدد ليالي التشغيل', 'ثمن المازوت'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['wasit'],
            prompt: 'هل قول الفلاح صحيح؟',
            options: [
              'لا: الوسيط $0$ يعني أنّ نصف الليالي على الأقل درجتها $0$ أو أقلّ، والمدفأة لا تشتغل إلّا تحت الصفر',
              'نعم: نصف القيم على الأقل أصغر من أو تساوي الوسيط $0$',
              'نعم: المتوسط $1$ قريب من الصفر',
            ],
            correct: 0,
            explain: 'الوسيط يقول «أصغر من أو يساوي $0$»، وهذا يشمل ليالي الصفر ($9$ ليال) التي لا تشتغل فيها المدفأة: «أقلّ من 0» ليست «أصغر من أو تساوي 0».' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'عدد الليالي التي اشتغلت فيها المدفأة:', expected: 7,
            explain: 'الليالي تحت الصفر: درجة $-2$ ($3$ ليال) ودرجة $-1$ ($4$ ليال): $3 + 4 = 7$. العدد $16$ يضيف ليالي الصفر خطأً.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'كمية المازوت المستهلكة (باللتر):', expected: 84,
            explain: '$7 \\times 12 = 84$.' },
          { kind: 'numeric', role: 'answer', ask: 2, suffix: 'دج',
            prompt: 'ثمن المازوت المستهلك:', expected: 2436,
            explain: '$84 \\times 29 = 2436$.' },
          { kind: 'solution', ask: 0, lines: [
            'الوسيط $0$ : نصف الليالي على الأقل درجتها أصغر من أو تساوي $0$ ، وهذا يشمل ليالي الصفر التي لا تشتغل فيها المدفأة؛ قول الفلاح خاطئ.',
            'الليالي تحت الصفر $3 + 4 = 7$ ليال فقط، و $7 < \\dfrac{31}{2}$ : أقلّ من نصف ليالي الشهر.',
            'استهلكت المدفأة $7 \\times 12 = 84$ لترًا من المازوت، ثمنها $84 \\times 29 = 2436$ دج.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
