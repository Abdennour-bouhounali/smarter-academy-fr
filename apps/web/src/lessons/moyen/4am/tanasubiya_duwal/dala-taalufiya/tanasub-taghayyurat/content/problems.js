/**
 * Les trois « مسائل » du درس 3 de l'unité 7 « تعيين دالة تآلفية انطلاقًا من عددين وصورتيهما »
 * (modules 4, 5, 6) — des exercices COMPLETS de type امتحان, résolus pas à pas
 * (common/problems/GuidedProblem.jsx).
 *
 * AJOUTS DE LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`) : le manuel
 * ne les contient pas. Ils restent dans le périmètre de la leçon : a par تناسب التغيّرات
 * (quotient de deux différences), b = f(x₁) − a·x₁, l'expression f(x) = ax + b, la VÉRIFICATION
 * par un autre nombre, la méthode de la جملة معادلتين en a et b — avec les acquis antérieurs
 * (image par une fonction affine, équation ax + b = m, résolution d'une جملة). Jamais de
 * représentation graphique à construire (درس 2) ni d'interprétation graphique d'une جملة (درس 4).
 *
 * La مسألة 1 est « مسألة الدرس » : son énoncé vit dans `LESSON_CONFIG.lessonProblem` (montré dès
 * le sommaire et rappelé au module 1, prolongement de l'abonnement des supporters du niveau
 * متقدم : une nouvelle saison, deux montants connus, la formule inconnue), et se résout ici.
 * Les مسائل 2 et 3 (familles de contextes réservées à cette leçon) : la شتلة de عبّاد الشمس du
 * نادي العلوم (un `table` de mesures, une mesure fausse, quand atteint-elle le filet) et la
 * charge d'un téléphone (la جملة en a et b, une troisième lecture, l'heure de fin de la charge
 * rapide).
 *
 * Chaque nombre est vérifié par calcul EXACT (fractions) dans ./problems.test.js.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');
/** Une jumla en LaTeX. */
const sys = (a, b) => `$\\begin{cases} ${a} \\\\ ${b} \\end{cases}$`;

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — اشتراك الموسم الجديد',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🏟️',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'karim', text: 'كريم: 6 مقابلات، دفع 4100 دج', useful: true },
      { id: 'walid', text: 'وليد: 15 مقابلة، دفع 6800 دج', useful: true },
      { id: 'fixed', text: 'الاشتراك السنوي مبلغ ثابت يُدفع مرّة واحدة', useful: true },
      { id: 'entry', text: 'ثمن الدخول هو نفسه في كل مقابلة', useful: true },
      { id: 'seats', text: 'يتّسع الملعب لـ 20000 متفرّج', useful: false },
      { id: 'day', text: 'تُلعب المقابلات يوم الجمعة على الساعة 16', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ثمن المقابلة والاشتراك',
        question: 'احسب المعامل $a$ بتناسب التغيّرات، ثم عيّن العدد $b$ . عبّر عن $f(x)$ بدلالة $x$ .',
        asks: ['المعامل $a$', 'العدد $b$', 'عبارة $f(x)$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['notation-fx'],
            prompt: 'ما دفعه كريم وما دفعه وليد يُترجمان بلغة الدوال إلى:',
            options: ['$f(6) = 4100$ و $f(15) = 6800$', '$f(4100) = 6$ و $f(6800) = 15$', '$f(6) = 6800$ و $f(15) = 4100$', '$a = 4100$ و $b = 6800$'],
            correct: 0, cols: 2,
            explain: 'العدد $x$ هو عدد المقابلات وصورته $f(x)$ هي المبلغ: كريم تابع 6 مقابلات فدفع 4100 دج، أي $f(6) = 4100$ ؛ ووليد $f(15) = 6800$ .' },
          { kind: 'numeric', role: 'compute', requires: ['hisab-farq-nisbi'],
            prompt: 'فرق المبلغين $f(15) - f(6)$ :', expected: 2700, suffix: 'دج',
            explain: '$6800 - 4100 = 2700$ : ما دفعه وليد زيادة على كريم، مقابل $15 - 6 = 9$ مقابلات زائدة.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-muamil-a'],
            prompt: 'المعامل $a$ ، أي ثمن الدخول لمقابلة واحدة:', expected: 300, suffix: 'دج',
            explain: '$a = \\dfrac{f(15) - f(6)}{15 - 6} = \\dfrac{2700}{9} = 300$ . أمّا 2700 فهو ثمن 9 مقابلات لا مقابلة واحدة: نقسم فرق الصورتين على فرق العددين.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hisab-b'],
            prompt: 'العدد $b$ ، أي مبلغ الاشتراك السنوي:', expected: 2300, suffix: 'دج',
            explain: 'نعوّض العدد 6 وصورته: $b = 4100 - 300 \\times 6 = 4100 - 1800 = 2300$ . أمّا قسمة 4100 على 6 فلا تعطي $b$ : الدالة ليست خطية.' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['hisab-b'],
            prompt: 'عبارة $f(x)$ :',
            options: ['$f(x) = 300x + 2300$', '$f(x) = 2300x + 300$', '$f(x) = 300x + 4100$', '$f(x) = 2700x + 2300$'],
            correct: 0, cols: 2,
            explain: 'المعامل هو ثمن المقابلة والحدّ الثابت هو الاشتراك. تحقّق بعدد وليد: $300 \\times 15 + 2300 = 4500 + 2300 = 6800$ . أمّا $300x + 4100$ فتعطي لكريم $300 \\times 6 + 4100 = 5900$ لا 4100.' },
          { kind: 'solution', ask: 0, lines: [
            '$a = \\dfrac{f(15) - f(6)}{15 - 6} = \\dfrac{6800 - 4100}{9} = \\dfrac{2700}{9} = 300$ .',
            '$b = f(6) - 6a = 4100 - 300 \\times 6 = 2300$ ، إذن $f(x) = 300x + 2300$ .',
            'تحقّق: $300 \\times 15 + 2300 = 6800$ . ثمن الدخول 300 دج للمقابلة، والاشتراك السنوي 2300 دج.',
          ] },
        ],
      },
      {
        label: '2)', title: 'وصلان للتحقّق',
        question: 'أظهر أنيس وصلًا كُتب فيه «11 مقابلة: 5600 دج»، وأظهر رياض وصلًا كُتب فيه «12 مقابلة: 6000 دج». هل يوافق وصل أنيس صيغة الاشتراك؟ وهل يوافقها وصل رياض؟',
        asks: ['هل يوافق وصل أنيس الصيغة؟', 'هل يوافق وصل رياض الصيغة؟'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['tanasub-taghayyurat'],
            prompt: 'حاصل قسمة فرق مبلغي أنيس وكريم على فرق عددي مقابلاتهما: $\\dfrac{5600 - 4100}{11 - 6} = \\ldots$', expected: 300,
            explain: '$\\dfrac{1500}{5} = 300$ : بين كريم وأنيس 5 مقابلات زائدة و 1500 دج زائدة.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tanasub-taghayyurat'],
            prompt: 'وصل أنيس:',
            options: [
              'يوافق الصيغة: الحاصل يساوي المعامل $a = 300$ كما تقتضي خاصية تناسب التغيّرات',
              'لا يوافقها: $5600 \\neq 4100$',
              'لا نستطيع الحكم قبل حساب صورة كل عدد من 1 إلى 11',
            ],
            correct: 0,
            explain: 'تغيّرات المبلغ متناسبة مع تغيّرات عدد المقابلات بالمعامل 300: $5600 - 4100 = 300 \\times (11 - 6)$ . وفعلًا $300 \\times 11 + 2300 = 5600$ .' },
          { kind: 'numeric', role: 'compute', requires: ['surat-adad-taalufiya'],
            prompt: 'صورة العدد 12 بالدالة $f$ :', expected: 5900, suffix: 'دج',
            explain: '$f(12) = 300 \\times 12 + 2300 = 3600 + 2300 = 5900$ .' },
          { kind: 'choice', role: 'conclude', ask: 1,
            prompt: 'وصل رياض:',
            options: [
              'لا يوافق الصيغة: مناصر تابع 12 مقابلة يدفع 5900 دج، ففي الوصل 100 دج زائدة',
              'يوافقها: 6000 قريب من 5900',
              'يوافقها لأنّ $\\dfrac{6000}{12} = 500$ عدد طبيعي',
            ],
            correct: 0,
            explain: '$5900 \\neq 6000$ . وبتناسب التغيّرات أيضًا: $\\dfrac{6000 - 4100}{12 - 6} = \\dfrac{1900}{6}$ ، وهو لا يساوي 300. أمّا حاصل قسمة المبلغ على عدد المقابلات فليس ثابتًا: الدالة ليست خطية.' },
          { kind: 'solution', ask: 0, lines: [
            'أنيس: $\\dfrac{5600 - 4100}{11 - 6} = \\dfrac{1500}{5} = 300$ ، وهو المعامل $a$ : وصله يوافق الصيغة.',
            'رياض: $f(12) = 300 \\times 12 + 2300 = 5900$ و $5900 \\neq 6000$ : وصله لا يوافق الصيغة.',
            'وصل أنيس صحيح، أمّا وصل رياض ففيه 100 دج زائدة.',
          ] },
        ],
      },
      {
        label: '3)', title: 'ميزانية الموسم القادم',
        question: 'خصّص كريم للموسم القادم ميزانية قدرها 8250 دج، والصيغة لا تتغيّر. كم مقابلة على الأكثر يستطيع أن يتابع؟ وكم دينارًا يبقى له من ميزانيته؟',
        asks: ['أكبر عدد من المقابلات', 'المبلغ الذي يبقى له'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['hisab-b'],
            prompt: 'ما يبقى من الميزانية لثمن الدخول بعد دفع الاشتراك السنوي:', expected: 5950, suffix: 'دج',
            explain: '$8250 - 2300 = 5950$ : الاشتراك يُدفع مرّة واحدة مهما كان عدد المقابلات.' },
          { kind: 'choice', role: 'translate',
            prompt: 'عدد المقابلات $x$ يجب أن يحقّق:',
            options: ['$300x + 2300 \\leq 8250$', '$300x \\leq 8250$', '$2300x + 300 \\leq 8250$', '$300x + 2300 \\geq 8250$'],
            correct: 0, cols: 2,
            explain: 'المبلغ $f(x)$ لا يجب أن يتجاوز الميزانية. أمّا $300x$ وحده فينسى الاشتراك السنوي، ويصير عدد المقابلات أكبر ممّا تسمح به الميزانية.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['surat-adad-taalufiya'],
            prompt: 'أكبر عدد من المقابلات يستطيع كريم متابعتها:', expected: 19,
            explain: '$5950 = 300 \\times 19 + 250$ مع $250 < 300$ : تكفي الميزانية لـ 19 مقابلة، أمّا 20 مقابلة فتكلّف $300 \\times 20 = 6000$ زيادة على الاشتراك، و $6000 > 5950$ . العدد الذي صورته 8250 ليس عددًا طبيعيًا.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['surat-adad-taalufiya'],
            prompt: 'المبلغ الذي يبقى لكريم من ميزانيته:', expected: 250, suffix: 'دج',
            explain: '$300 \\times 19 + 2300 = 5700 + 2300 = 8000$ ، و $8250 - 8000 = 250$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$8250 - 2300 = 5950$ و $5950 = 300 \\times 19 + 250$ مع $250 < 300$ .',
            '$f(19) = 300 \\times 19 + 2300 = 8000$ و $8250 - 8000 = 250$ .',
            'يستطيع كريم متابعة 19 مقابلة على الأكثر، ويبقى له 250 دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — شتلة عبّاد الشمس',
    context: 'نادي العلوم: كم تنمو الشتلة في الأسبوع؟',
    emoji: '🌻',
    source: SOURCE,
    statement: 'غرس نادي العلوم شتلة عبّاد الشمس في حديقة المتوسطة، ثم قاس التلاميذ طولها في نهاية بعض الأسابيع. يضمّ النادي 12 تلميذًا، واشترى كيس البذور بـ 120 دج. لاحظ التلاميذ أنّ الشتلة تنمو بانتظام، فنقبل أنّ طولها $h(x)$ (بالسنتيمتر) دالة تآلفية لعدد الأسابيع $x$ منذ الغرس: $h(x) = ax + b$ . يعطي الجدول قياساتهم؛ القياس الأخير سجّله أمين بأمانة.',
    table: {
      head: ['عدد الأسابيع $x$', '2', '6', '10'],
      rows: [['الطول $h(x)$ (سم)', '13', '31', '50']],
      caption: 'قياسات نادي العلوم',
    },
    data: [
      { id: 'w2', text: 'في نهاية الأسبوع 2: الطول 13 سم', useful: true },
      { id: 'w6', text: 'في نهاية الأسبوع 6: الطول 31 سم', useful: true },
      { id: 'regular', text: 'الشتلة تنمو بانتظام: الطول دالة تآلفية لعدد الأسابيع', useful: true },
      { id: 'origin', text: 'نعدّ الأسابيع منذ يوم الغرس', useful: true },
      { id: 'club', text: 'يضمّ النادي 12 تلميذًا', useful: false },
      { id: 'seeds', text: 'ثمن كيس البذور 120 دج', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'سرعة النموّ وطول الغرس',
        question: 'باستعمال قياسَي الأسبوعين 2 و 6: احسب المعامل $a$ بتناسب التغيّرات، ثم عيّن العدد $b$ . ماذا يمثّل العدد $b$ في هذه الوضعية؟',
        asks: ['المعامل $a$', 'العدد $b$', 'ماذا يمثّل $b$؟'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['notation-fx'],
            prompt: 'القياسان يُترجمان بلغة الدوال إلى:',
            options: ['$h(2) = 13$ و $h(6) = 31$', '$h(13) = 2$ و $h(31) = 6$', '$h(2) = 31$ و $h(6) = 13$', '$a = 13$ و $b = 31$'],
            correct: 0, cols: 2,
            explain: 'العدد $x$ هو عدد الأسابيع وصورته $h(x)$ هي الطول: بعد أسبوعين 13 سم، أي $h(2) = 13$ ؛ وبعد 6 أسابيع $h(6) = 31$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-muamil-a'],
            prompt: 'المعامل $a$ ، أي ما تنموه الشتلة في أسبوع واحد (بالسنتيمتر):', expected: 4.5, display: '4,5',
            explain: '$a = \\dfrac{h(6) - h(2)}{6 - 2} = \\dfrac{31 - 13}{4} = \\dfrac{18}{4} = 4{,}5$ . أمّا 18 فهو ما تنموه في 4 أسابيع لا في أسبوع واحد.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hisab-b'],
            prompt: 'العدد $b$ :', expected: 4,
            explain: '$b = 13 - 4{,}5 \\times 2 = 13 - 9 = 4$ ؛ تحقّق بالأسبوع 6: $4{,}5 \\times 6 + 4 = 27 + 4 = 31$ . أمّا قسمة 13 على 2 فلا تعطي $b$ : الدالة ليست خطية.' },
          { kind: 'choice', role: 'conclude', ask: 2,
            prompt: 'ماذا يمثّل العدد $b$ في هذه الوضعية؟',
            options: [
              'طول الشتلة يوم الغرس، أي صورة العدد 0',
              'ما تنموه الشتلة في كل أسبوع',
              'طول الشتلة بعد أسبوعين',
              'عدد الأسابيع اللازمة لتنمو الشتلة سنتيمترًا واحدًا',
            ],
            correct: 0,
            explain: '$h(0) = 4{,}5 \\times 0 + b = b$ : العدد $b$ هو الطول يوم الغرس، أي 4 سم. ما تنموه الشتلة في الأسبوع هو المعامل $a$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$a = \\dfrac{31 - 13}{6 - 2} = \\dfrac{18}{4} = 4{,}5$ ، ثم $b = 13 - 4{,}5 \\times 2 = 4$ ، إذن $h(x) = 4{,}5x + 4$ .',
            'تحقّق: $4{,}5 \\times 6 + 4 = 31$ .',
            'تنمو الشتلة $4{,}5$ سم في الأسبوع، و $b = 4$ هو طولها يوم الغرس: 4 سم.',
          ] },
        ],
      },
      {
        label: '2)', title: 'قياس أمين',
        question: 'ما الطول الذي تبلغه الشتلة في نهاية الأسبوع 10 إذا نمت بانتظام؟ هل يوافق قياس أمين المسجّل في الجدول هذا النموّ؟',
        asks: ['الطول في نهاية الأسبوع 10', 'هل يوافق قياس أمين النموّ المنتظم؟'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['tanasub-taghayyurat'],
            prompt: 'ما تنموه الشتلة بين نهاية الأسبوع 6 ونهاية الأسبوع 10:', expected: 18, suffix: 'سم',
            explain: 'تغيّر الطول متناسب مع تغيّر عدد الأسابيع: $4{,}5 \\times (10 - 6) = 4{,}5 \\times 4 = 18$ .' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'الطول المنتظر في نهاية الأسبوع 10:', expected: 49, suffix: 'سم',
            explain: '$31 + 18 = 49$ ؛ وبالعبارة: $4{,}5 \\times 10 + 4 = 45 + 4 = 49$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tanasub-taghayyurat'],
            prompt: 'هل يوافق قياس أمين النموّ المنتظم؟',
            options: [
              'لا: الطول المنتظر 49 سم وقد سجّل 50 سم',
              'نعم: 50 سم قريب من 49 سم',
              'نعم: الطول يكبر من قياس إلى آخر',
              'لا: كان يجب أن يتضاعف الطول من 31 إلى 62 سم',
            ],
            correct: 0,
            explain: '$49 \\neq 50$ . وبتناسب التغيّرات: $\\dfrac{50 - 31}{10 - 6} = \\dfrac{19}{4} = 4{,}75$ لا يساوي $4{,}5$ . الطول لا يتضاعف: الدالة ليست خطية، وما تنموه الشتلة في 4 أسابيع هو 18 سم.' },
          { kind: 'solution', ask: 0, lines: [
            '$h(10) = 4{,}5 \\times 10 + 4 = 49$ ، أو $31 + 4{,}5 \\times (10 - 6) = 31 + 18 = 49$ .',
            '$49 \\neq 50$ .',
            'في نهاية الأسبوع 10 يكون طول الشتلة 49 سم: قياس أمين (50 سم) لا يوافق النموّ المنتظم، ففيه خطأ 1 سم.',
          ] },
        ],
      },
      {
        label: '3)', title: 'الشبكة الواقية',
        question: 'تحمي الشتلةَ شبكةٌ ارتفاعها 67 سم. بعد كم أسبوعًا من القياس الثاني (نهاية الأسبوع 6) يبلغ طول الشتلة ارتفاع الشبكة؟ وفي نهاية أيّ أسبوع منذ الغرس؟',
        asks: ['عدد الأسابيع بعد القياس الثاني', 'رقم الأسبوع منذ الغرس'],
        steps: [
          { kind: 'numeric', role: 'compute',
            prompt: 'ما يجب أن تنموه الشتلة بعد القياس الثاني لتبلغ الشبكة:', expected: 36, suffix: 'سم',
            explain: '$67 - 31 = 36$ .' },
          { kind: 'choice', role: 'translate', requires: ['tanasub-taghayyurat'],
            prompt: 'عدد الأسابيع اللازمة يُحسب بـ:',
            options: ['$\\dfrac{36}{4{,}5}$', '$36 \\times 4{,}5$', '$\\dfrac{67}{4{,}5}$', '$36 - 4{,}5$'],
            correct: 0, cols: 2,
            explain: 'تغيّر الطول يساوي $4{,}5$ ضرب تغيّر عدد الأسابيع، فعدد الأسابيع هو 36 مقسومًا على $4{,}5$ . أمّا قسمة 67 على $4{,}5$ فتنسى أنّ طول الشتلة كان 31 سم عند القياس الثاني.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'عدد الأسابيع بعد القياس الثاني:', expected: 8,
            explain: '$\\dfrac{36}{4{,}5} = 8$ ؛ تحقّق: $4{,}5 \\times 8 = 36$ .' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'رقم الأسبوع منذ الغرس:', expected: 14,
            explain: '$6 + 8 = 14$ ؛ وبالعبارة: $4{,}5 \\times 14 + 4 = 63 + 4 = 67$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$67 - 31 = 36$ و $\\dfrac{36}{4{,}5} = 8$ .',
            'تحقّق: $h(14) = 4{,}5 \\times 14 + 4 = 67$ .',
            'يبلغ طول الشتلة ارتفاع الشبكة بعد 8 أسابيع من القياس الثاني، أي في نهاية الأسبوع 14 منذ الغرس.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — شحن الهاتف',
    context: 'من قراءتين للشاشة إلى ساعة توقّف الشحن السريع',
    emoji: '🔋',
    source: SOURCE,
    illustration: { kind: 'timeline', icon: 'phone', title: 'شحن الهاتف', marks: [{ label: 'عند الوصل' }, { label: 'بعد 6 دقائق', value: 17, unit: '%' }, { label: 'بعد 20 دقيقة', value: 38, unit: '%' }], ariaLabel: 'محور زمن لشحن الهاتف: نسبة الشحن مجهولة عند وصله بالشاحن، 17 % بعد 6 دقائق و 38 % بعد 20 دقيقة' },
    statement: 'وصل أيمن، بعد أن أنجز واجباته المدرسية، هاتفه بالشاحن على الساعة 21 و 40 دقيقة. بعد 6 دقائق من وصله أشارت الشاشة إلى أنّ البطارية مشحونة بنسبة 17 %، وبعد 20 دقيقة من وصله أشارت إلى 38 %. سعة البطارية 5000 ميلي أمبير ساعي، وثمن الشاحن 2500 دج. في مرحلة الشحن السريع نقبل أنّ نسبة الشحن $g(x)$ دالة تآلفية للمدّة $x$ (بالدقائق) منذ وصل الهاتف: $g(x) = ax + b$ .',
    data: [
      { id: 'r6', text: 'بعد 6 دقائق من الوصل: 17 %', useful: true },
      { id: 'r20', text: 'بعد 20 دقيقة من الوصل: 38 %', useful: true },
      { id: 'affine', text: 'في الشحن السريع النسبة دالة تآلفية للمدّة', useful: true },
      { id: 'origin', text: 'نعدّ المدّة بالدقائق منذ وصل الهاتف بالشاحن', useful: true },
      { id: 'clock', text: 'وُصل الهاتف على الساعة 21 و 40 دقيقة', useful: true },
      { id: 'capacity', text: 'سعة البطارية 5000 ميلي أمبير ساعي', useful: false },
      { id: 'charger', text: 'ثمن الشاحن 2500 دج', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'جملة معادلتين',
        question: 'ترجم القراءتين بجملة معادلتين مجهولاها $a$ و $b$ وحلّها، ثم عبّر عن $g(x)$ بدلالة $x$ .',
        asks: ['قيمة $a$', 'قيمة $b$', 'عبارة $g(x)$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tariqat-jumla-ab'],
            prompt: 'القراءتان تُترجمان بالجملة:',
            options: [
              sys('6a + b = 17', '20a + b = 38'),
              sys('17a + b = 6', '38a + b = 20'),
              sys('6a + b = 38', '20a + b = 17'),
              sys('a + 6b = 17', 'a + 20b = 38'),
            ],
            correct: 0, cols: 2,
            explain: '$g(6) = 17$ يعني $6a + b = 17$ ، و $g(20) = 38$ يعني $20a + b = 38$ : المدّة هي العدد، والنسبة هي صورته.' },
          { kind: 'choice', role: 'conclude', requires: ['hall-jumla', 'tariqat-jumla-ab'],
            prompt: 'بطرح المعادلة الأولى من الثانية نحصل على:',
            options: ['$14a = 21$', '$14a = 55$', '$26a = 55$', '$14a + 2b = 21$'],
            correct: 0, cols: 2,
            explain: '$(20a + b) - (6a + b) = 14a$ و $38 - 17 = 21$ : العدد $b$ يختفي في الطرح.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-jumla'],
            prompt: 'قيمة $a$ :', expected: 1.5, display: '1,5',
            explain: '$a = \\dfrac{21}{14} = 1{,}5$ ؛ وهو أيضًا $\\dfrac{38 - 17}{20 - 6}$ بتناسب التغيّرات.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hisab-b'],
            prompt: 'قيمة $b$ :', expected: 8,
            explain: 'من المعادلة الأولى: $b = 17 - 6 \\times 1{,}5 = 17 - 9 = 8$ ؛ تحقّق في الثانية: $20 \\times 1{,}5 + 8 = 30 + 8 = 38$ .' },
          { kind: 'choice', role: 'conclude', ask: 2,
            prompt: 'عبارة $g(x)$ :',
            options: ['$g(x) = 1{,}5x + 8$', '$g(x) = 8x + 1{,}5$', '$g(x) = 1{,}5x + 17$', '$g(x) = 21x + 8$'],
            correct: 0, cols: 2,
            explain: '$a = 1{,}5$ هو المعامل و $b = 8$ هو الحدّ الثابت. أمّا $1{,}5x + 17$ فتعطي $1{,}5 \\times 6 + 17 = 26$ بعد 6 دقائق، لا 17.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\begin{cases} 6a + b = 17 \\\\ 20a + b = 38 \\end{cases}$ ؛ بالطرح: $14a = 21$ ، ومنه $a = \\dfrac{21}{14} = 1{,}5$ .',
            '$b = 17 - 6 \\times 1{,}5 = 8$ ؛ تحقّق: $20 \\times 1{,}5 + 8 = 38$ .',
            'إذن $g(x) = 1{,}5x + 8$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'قراءة ثالثة',
        question: 'بعد 30 دقيقة من وصل الهاتف أشارت الشاشة إلى 53 %. هل توافق هذه القراءة الدالة $g$؟ علّل بتناسب التغيّرات. ماذا يمثّل العدد $b$ في هذه الوضعية؟',
        asks: ['هل توافق القراءة 53 % الدالة $g$؟', 'ماذا يمثّل $b$؟'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['tanasub-taghayyurat'],
            prompt: 'حاصل قسمة تغيّر النسبة على تغيّر المدّة بين الدقيقة 20 والدقيقة 30: $\\dfrac{53 - 38}{30 - 20} = \\ldots$', expected: 1.5, display: '1,5',
            explain: '$\\dfrac{15}{10} = 1{,}5$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tanasub-taghayyurat'],
            prompt: 'هل توافق القراءة 53 % الدالة $g$؟',
            options: [
              'نعم: الحاصل يساوي المعامل $a = 1{,}5$',
              'لا: $53 - 38 = 15$ وليس $1{,}5$',
              'لا: المدّة زادت بمرّة ونصف، فكان يجب أن تبلغ النسبة $38 \\times 1{,}5 = 57$',
            ],
            correct: 0,
            explain: 'تغيّرات النسبة متناسبة مع تغيّرات المدّة بالمعامل $1{,}5$ ؛ وفعلًا $1{,}5 \\times 30 + 8 = 45 + 8 = 53$ . النسبة نفسها ليست متناسبة مع المدّة: الدالة ليست خطية.' },
          { kind: 'choice', role: 'conclude', ask: 1,
            prompt: 'ماذا يمثّل العدد $b$ في هذه الوضعية؟',
            options: [
              'نسبة شحن البطارية لحظة وصل الهاتف بالشاحن، أي صورة العدد 0',
              'ما تزيده النسبة في كل دقيقة',
              'المدّة اللازمة لشحن 1 % من البطارية',
              'نسبة الشحن بعد 6 دقائق',
            ],
            correct: 0,
            explain: '$g(0) = 1{,}5 \\times 0 + 8 = 8$ : كانت البطارية مشحونة بنسبة 8 % حين وصلها أيمن. ما تزيده النسبة في كل دقيقة هو المعامل $a$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$\\dfrac{53 - 38}{30 - 20} = \\dfrac{15}{10} = 1{,}5$ ، وهو المعامل $a$ ؛ وفعلًا $g(30) = 1{,}5 \\times 30 + 8 = 53$ .',
            'القراءة 53 % توافق الدالة $g$ .',
            '$g(0) = b = 8$ : لحظة وصل الهاتف بالشاحن كانت البطارية مشحونة بنسبة 8 %.',
          ] },
        ],
      },
      {
        label: '3)', title: 'نهاية الشحن السريع',
        question: 'يتوقّف الشحن السريع عندما تبلغ النسبة 80 %. بعد كم دقيقة من وصل الهاتف يحدث ذلك؟ وعلى أيّ ساعة؟',
        asks: ['المدّة بالدقائق', 'الساعة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['muadala-ax-b'],
            prompt: 'المدّة المطلوبة هي حلّ المعادلة:',
            options: ['$1{,}5x + 8 = 80$', '$x = 1{,}5 \\times 80 + 8$', '$1{,}5x = 80$', '$80x + 8 = 1{,}5$'],
            correct: 0, cols: 2,
            explain: 'نبحث عن المدّة $x$ التي صورتها 80، أي $g(x) = 80$ . أمّا $1{,}5 \\times 80 + 8$ فهو صورة العدد 80 لا العدد الذي صورته 80، والمعادلة التي ليس فيها العدد 8 تنسى الحدّ الثابت.' },
          { kind: 'numeric', role: 'compute', requires: ['muadala-ax-b'],
            prompt: 'أكمل: $1{,}5x = \\ldots$', expected: 72,
            explain: '$80 - 8 = 72$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['muadala-ax-b'],
            prompt: 'المدّة بالدقائق:', expected: 48, suffix: 'دقيقة',
            explain: '$x = \\dfrac{72}{1{,}5} = 48$ ؛ تحقّق: $1{,}5 \\times 48 + 8 = 72 + 8 = 80$ .' },
          { kind: 'choice', role: 'conclude', ask: 1,
            prompt: 'على أيّ ساعة يتوقّف الشحن السريع؟',
            options: ['على الساعة 22 و 28 دقيقة', 'على الساعة 22 و 22 دقيقة', 'على الساعة 22 و 8 دقائق', 'على الساعة 22 و 48 دقيقة'],
            correct: 0, cols: 2,
            explain: 'المدّة تُحسب منذ وصل الهاتف على الساعة 21 و 40 دقيقة: $40 + 48 = 88$ دقيقة، أي ساعة و 28 دقيقة. الساعة 22 و 22 دقيقة تضيف $\\dfrac{80 - 17}{1{,}5} = 42$ دقيقة، والساعة 22 و 8 دقائق تضيف $\\dfrac{80 - 38}{1{,}5} = 28$ دقيقة: مدّتان تبدآن من إحدى القراءتين لا من لحظة الوصل.' },
          { kind: 'solution', ask: 0, lines: [
            '$1{,}5x + 8 = 80$ ، أي $1{,}5x = 72$ ، ومنه $x = \\dfrac{72}{1{,}5} = 48$ .',
            'تحقّق: $g(48) = 1{,}5 \\times 48 + 8 = 80$ .',
            'يتوقّف الشحن السريع بعد 48 دقيقة من وصل الهاتف، أي على الساعة 22 و 28 دقيقة.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
