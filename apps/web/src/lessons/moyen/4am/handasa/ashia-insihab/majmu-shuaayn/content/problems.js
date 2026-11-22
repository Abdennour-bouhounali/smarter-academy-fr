/**
 * Les trois « مسائل » du درس 3 de l'unité 11 « مجموع شعاعين (علاقة شال وقاعدة متوازي الأضلاع) » (modules 5, 6, 7) —
 * des exercices COMPLETS de type امتحان, résolus pas à pas (common/problems/GuidedProblem.jsx).
 *
 * AJOUTS DE LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`) : le manuel ne les contient pas.
 * Ils restent dans le périmètre de la leçon : deux translations successives = une seule (tarkib-insihabayn), علاقة شال
 * (alaqat-shal), le vecteur nul et les vecteurs opposés (shuaa-maadum, mutaakisan), la règle du parallélogramme
 * (qaidat-mutawazi) — avec Pythagore (acquis fithaghuras) pour les longueurs. Jamais de composantes dans un repère
 * (unité 12) ni de démonstration vectorielle (درس 4) ; aucun angle à calculer (le تحدّ l'a fait au module 2).
 * Le piège commun : LA LONGUEUR D'UNE SOMME N'EST PAS LA SOMME DES LONGUEURS (MISC-SHUAA-JAM-ATWAL).
 *
 * La مسألة 1 est « مسألة الدرس » : son énoncé ET sa figure vivent dans `LESSON_CONFIG.lessonProblem` (montrés dès le
 * sommaire et rappelés au module 1) — le monde du lab متقدم (le nageur et le courant, règle du parallélogramme) avec
 * d'autres nombres : 0,6 / 0,8 → 1 (triangle 3-4-5), 1,7 / 0,8 → 1,5 (triangle 8-15-17), et un nageur qui NE PEUT PAS
 * remonter le courant (0,6 < 0,8). Les مسائل 2 et 3 (familles réservées : le transport aérien — ici l'hélicoptère d'évacuation sanitaire, car
 * insihab-shuaa a déjà deux drones —, le bateau et le courant) se lisent sur une carte quadrillée (`grid`) ; aucune figure n'écrit une réponse demandée.
 *
 * Chaque nombre est vérifié par calcul dans ./problems.test.js (vectors.js pour les figures).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

/** مسألة 2 — la carte de l'évacuation (1 carreau = 100 m) : E base, K village de montagne, F hôpital. EF n'est PAS dessiné. */
export const FIG_HELICOPTER = {
  points: { E: [0, 0], K: [0, 6], F: [8, 0] },
  vectors: [{ from: 'E', to: 'K', tone: 'indigo' }, { from: 'K', to: 'F', tone: 'amber' }],
  labels: { E: 'sw', K: 'n', F: 'se' },
  grid: true,
  ariaLabel: 'خريطة مرصوفة: قاعدة الإسعاف E ، القرية الجبلية K فوقها بستة مربعات، والمستشفى F على يمين E بثمانية مربعات؛ سهم من E إلى K وسهم من K إلى F',
};

/** مسألة 3 — la carte de la baie (1 carreau = 1 km) : A port de départ, B phare (moteur seul, 1 h), C bouée (courant seul, 1 h), H port d'arrivée. */
export const FIG_BAY = {
  points: { A: [0, 0], B: [12, 9], C: [0, -4], H: [12, 5] },
  vectors: [{ from: 'A', to: 'B', tone: 'indigo' }, { from: 'A', to: 'C', tone: 'sky' }],
  labels: { A: 'w', B: 'n', C: 's', H: 'e' },
  grid: true,
  ariaLabel: 'خريطة مرصوفة للخليج: الميناء A ، المنارة B ، العوّامة C تحت A بأربعة مربعات، والميناء H تحت B بأربعة مربعات؛ سهم من A إلى B وسهم من A إلى C',
};

export const PROBLEMS = [
  // ── مسألة 1 — نادي السباحة : 0,6 et 0,8 m/s (Anas, vers B), 1,7 m/s (Walid, contre le courant), [AB] = 60 m ──
  {
    id: 'masala-1',
    title: 'مسألة 1 — عبور النهر',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🏊',
    source: SOURCE,
    statement: LESSON_CONFIG.lessonProblem.statement,
    figure: LESSON_CONFIG.lessonProblem.figure,
    data: [
      { id: 'ab', text: 'المسار [AB] عمودي على الحافتين وطوله 60 m', useful: true },
      { id: 'current', text: 'سرعة التيار 0,8 m/s موازية للحافتين', useful: true },
      { id: 'anas', text: 'سرعة أنس في ماء ساكن 0,6 m/s', useful: true },
      { id: 'walid', text: 'سرعة وليد في ماء ساكن 1,7 m/s', useful: true },
      { id: 'temp', text: 'درجة حرارة الماء 19 درجة', useful: false },
      { id: 'hour', text: 'انطلقت الحصّة على الساعة 10', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'أنس يسبح نحو B',
        question: 'يسبح أنس متّجهًا نحو $B$ : شعاع سرعته الذاتية $\\vec{s}$ محمول على $(AB)$ وطوله $0{,}6\\,\\mathrm{m/s}$ ، وسرعته الفعلية هي $\\vec{s} + \\vec{c}$ . هل يصل أنس إلى $B$ ؟ احسب طول سرعته الفعلية.',
        asks: ['هل يصل أنس إلى $B$ ؟', 'طول سرعته الفعلية'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['qaidat-mutawazi'],
            prompt: 'للشعاعين $\\vec{s}$ و $\\vec{c}$ نفس المبدأ $A$ . ممثل مجموعهما $\\vec{s} + \\vec{c}$ هو:',
            options: [
              'قطر متوازي الأضلاع المنشأ على $\\vec{s}$ و $\\vec{c}$ ، الصادر من $A$',
              'القطر الآخر لمتوازي الأضلاع، الذي لا يمرّ بـ $A$',
              'شعاع محمول على $(AB)$ طوله $0{,}6 + 0{,}8$',
            ],
            correct: 0,
            explain: 'قاعدة متوازي الأضلاع: لشعاعين لهما نفس المبدأ $A$ ، المجموع هو القطر الصادر من $A$ . القطر الآخر لا يمرّ بالمبدأ المشترك، والسرعتان ليستا على نفس المنحى فلا نجمع طوليهما.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaidat-mutawazi'],
            prompt: 'هل يصل أنس إلى $B$ ؟',
            options: [
              'لا: القطر يميل عن $(AB)$ في اتجاه $\\vec{c}$ ، فيصل إلى الحافة الأخرى أسفل النهر بعد $B$',
              'نعم: لأنه يسبح متّجهًا نحو $B$',
              'نعم: لكن في وقت أطول، لأن التيار يبطئه',
            ],
            correct: 0,
            explain: 'متوازي الأضلاع المنشأ على $\\vec{s}$ و $\\vec{c}$ مستطيل، وقطره الصادر من $A$ لا يقع على $(AB)$ بل يميل نحو جهة التيار: التوجّه نحو $B$ لا يكفي.' },
          { kind: 'numeric', role: 'compute', requires: ['fithaghuras'],
            prompt: 'متوازي الأضلاع مستطيل لأن $\\vec{s}$ عمودي على $\\vec{c}$ . احسب $0{,}6^2 + 0{,}8^2$ :', expected: 1,
            explain: 'حسب خاصية فيثاغورس، مربّع طول القطر هو $0{,}6^2 + 0{,}8^2 = 0{,}36 + 0{,}64 = 1$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qaidat-mutawazi', 'fithaghuras'],
            prompt: 'طول سرعة أنس الفعلية:', expected: 1, suffix: 'm/s',
            explain: '$\\sqrt{1} = 1$ : سرعته الفعلية $1\\,\\mathrm{m/s}$ ، لا $0{,}6 + 0{,}8 = 1{,}4$ : طول مجموع شعاعين ليس مجموع طوليهما.' },
          { kind: 'solution', ask: 0, lines: [
            'للشعاعين $\\vec{s}$ و $\\vec{c}$ نفس المبدأ $A$ : حسب قاعدة متوازي الأضلاع، $\\vec{s} + \\vec{c}$ هو القطر الصادر من $A$ ، وهو لا يقع على $(AB)$ .',
            'إذن أنس لا يصل إلى $B$ : يجرفه التيار فيصل أسفل النهر.',
            'متوازي الأضلاع مستطيل: $0{,}6^2 + 0{,}8^2 = 0{,}36 + 0{,}64 = 1$ ، فطول سرعته الفعلية $\\sqrt{1} = 1\\,\\mathrm{m/s}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'أين يصل أنس؟',
        question: 'يقطع أنس المسافة $AB$ في ماء ساكن، وخلال نفس المدّة ينقله التيار وحده بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ ، حيث $C$ على الحافة الأخرى أسفل النهر. احسب المسافة $BC$ . عبّر عن $\\overrightarrow{AB} + \\overrightarrow{BC}$ بشعاع واحد، ثم احسب المسافة $AC$ التي قطعها أنس فعلًا.',
        asks: ['المسافة $BC$', '$\\overrightarrow{AB} + \\overrightarrow{BC}$ بشعاع واحد', 'المسافة $AC$'],
        steps: [
          { kind: 'numeric', role: 'compute',
            prompt: 'مدّة قطع 60 m بسرعة $0{,}6\\,\\mathrm{m/s}$ ، بالثانية:', expected: 100,
            explain: 'المدّة = المسافة ÷ السرعة: $60 \\div 0{,}6 = 100$ ثانية.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'المسافة $BC$ التي ينقله إليها التيار خلال هذه المدّة:', expected: 80, suffix: 'm',
            explain: 'المسافة = السرعة × المدّة: $0{,}8 \\times 100 = 80$ m.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tarkib-insihabayn', 'alaqat-shal'],
            prompt: 'الانسحاب الذي شعاعه $\\overrightarrow{AB}$ متبوعًا بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ هو الانسحاب الذي شعاعه:',
            options: ['$\\overrightarrow{AC}$', '$\\overrightarrow{CA}$', '$\\overrightarrow{BC}$', '$\\overrightarrow{AB}$'],
            correct: 0, cols: 4,
            explain: 'نهاية $\\overrightarrow{AB}$ هي مبدأ $\\overrightarrow{BC}$ : حسب علاقة شال $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ ، من مبدأ الأول إلى نهاية الثاني. $\\overrightarrow{CA}$ هو المعاكس، و $\\overrightarrow{AB}$ أو $\\overrightarrow{BC}$ وحده ينسى أحد الانتقالين.' },
          { kind: 'numeric', role: 'compute', requires: ['fithaghuras'],
            prompt: 'المثلث $ABC$ قائم في $B$ . احسب $AB^2 + BC^2$ :', expected: 10000,
            explain: '$(BC)$ موازٍ للحافتين و $(AB)$ عمودي عليهما: $AC^2 = 60^2 + 80^2 = 3600 + 6400 = 10000$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['fithaghuras'],
            prompt: 'المسافة $AC$ :', expected: 100, suffix: 'm',
            explain: '$AC = \\sqrt{10000} = 100$ m ، لا $60 + 80 = 140$ m: الطريق المنكسر $A \\to B \\to C$ أطول من القطعة $[AC]$ .' },
          { kind: 'choice', role: 'conclude', requires: ['qaidat-mutawazi'],
            prompt: 'قارن المسافة $AC$ بما يقطعه أنس خلال نفس المدّة بسرعته الفعلية التي وجدتها في السؤال 1):',
            options: [
              'متساويتان: $1 \\times 100 = 100$ ، فالانتقال $\\overrightarrow{AC}$ هو فعلًا انتقاله بسرعته الفعلية',
              'مختلفتان: بسرعته الفعلية يقطع $1{,}4 \\times 100 = 140$ m',
              'مختلفتان: بسرعته الفعلية يقطع $0{,}6 \\times 100 = 60$ m فقط',
            ],
            correct: 0,
            explain: 'طول سرعته الفعلية $1\\,\\mathrm{m/s}$ ، وفي 100 ثانية يقطع $1 \\times 100 = 100$ m: الطريقتان (قاعدة متوازي الأضلاع على السرعتين، وعلاقة شال على الانتقالين) تعطيان نفس النتيجة.' },
          { kind: 'solution', ask: 2, lines: [
            'مدّة العبور في ماء ساكن $60 \\div 0{,}6 = 100$ ثانية، وخلالها ينقله التيار $BC = 0{,}8 \\times 100 = 80$ m.',
            'حسب علاقة شال $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ : انتقال أنس هو $\\overrightarrow{AC}$ .',
            'المثلث $ABC$ قائم في $B$ : $AC^2 = 60^2 + 80^2 = 10000$ ، ومنه $AC = 100$ m.',
            'قطع أنس فعلًا 100 m ، ووصل إلى $C$ على بعد 80 m من $B$ أسفل النهر.',
          ] },
        ],
      },
      {
        label: '3)', title: 'وليد يسبح عكس التيار',
        question: 'يوجّه وليد سرعته الذاتية $\\vec{w}$ (طولها $1{,}7\\,\\mathrm{m/s}$) نحو أعلى النهر بحيث يكون المجموع $\\vec{w} + \\vec{c}$ محمولًا على $(AB)$ ، فيصل إلى $B$ . ما طول سرعته الفعلية؟ كم ثانية يستغرق عبوره؟ هل يستطيع أنس أن يصل إلى $B$ بنفس الطريقة؟',
        asks: ['طول سرعة وليد الفعلية', 'مدّة عبور وليد', 'هل يستطيع أنس ذلك؟'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['qaidat-mutawazi', 'fithaghuras'],
            prompt: 'في متوازي الأضلاع المنشأ على $\\vec{w}$ و $\\vec{c}$ من $A$ ، القطر $\\vec{w} + \\vec{c}$ عمودي على $\\vec{c}$ . المثلث القائم الذي نحسب فيه طول السرعة الفعلية:',
            options: [
              'وتره طول $\\vec{w}$ ، وأحد ضلعي الزاوية القائمة طول $\\vec{c}$',
              'ضلعا الزاوية القائمة طولا $\\vec{w}$ و $\\vec{c}$',
              'وتره طول $\\vec{c}$',
            ],
            correct: 0,
            explain: 'في متوازي الأضلاع، الضلع الذي ينطلق من نهاية $\\vec{w}$ يساوي $\\vec{c}$ ، وهو عمودي على القطر: المثلث المكوّن من $\\vec{w}$ وهذا الضلع والقطر قائم، وتره طول $\\vec{w}$ ، والقطر $\\vec{w} + \\vec{c}$ ضلع من ضلعي الزاوية القائمة.' },
          { kind: 'numeric', role: 'compute', requires: ['fithaghuras'],
            prompt: 'احسب $1{,}7^2 - 0{,}8^2$ :', expected: 2.25,
            explain: 'حسب خاصية فيثاغورس: مربّع الضلع = مربّع الوتر − مربّع الضلع الآخر: $2{,}89 - 0{,}64 = 2{,}25$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-mutawazi', 'fithaghuras'],
            prompt: 'طول سرعة وليد الفعلية:', expected: 1.5, suffix: 'm/s',
            explain: '$\\sqrt{2{,}25} = 1{,}5$ لأن $1{,}5^2 = 2{,}25$ : لا $1{,}7 + 0{,}8 = 2{,}5$ ولا $1{,}7 - 0{,}8 = 0{,}9$ .' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'مدّة عبور وليد، بالثانية:', expected: 40,
            explain: 'يقطع 60 m على $(AB)$ بسرعته الفعلية: $60 \\div 1{,}5 = 40$ ثانية.' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['qaidat-mutawazi'],
            prompt: 'هل يستطيع أنس أن يصل إلى $B$ بتوجيه سرعته نحو أعلى النهر؟',
            options: [
              'لا: في المثلث القائم يجب أن يكون الوتر (طول سرعته الذاتية) أطول من الضلع (طول $\\vec{c}$) ، و $0{,}6 < 0{,}8$',
              'نعم: يكفي أن يميل أكثر نحو أعلى النهر',
              'نعم: لأن $0{,}6 + 0{,}8 > 0{,}8$',
            ],
            correct: 0,
            explain: 'الوتر أطول أضلاع المثلث القائم. بسرعة ذاتية $0{,}6\\,\\mathrm{m/s}$ أمام تيار $0{,}8\\,\\mathrm{m/s}$ لا يوجد هذا المثلث: مهما مال أنس، يجرفه التيار أسفل $B$ .' },
          { kind: 'solution', ask: 0, lines: [
            'المجموع $\\vec{w} + \\vec{c}$ هو قطر متوازي الأضلاع الصادر من $A$ ، وهو عمودي على $\\vec{c}$ : في المثلث القائم، الوتر طوله $1{,}7$ .',
            'طول السرعة الفعلية $\\sqrt{1{,}7^2 - 0{,}8^2} = \\sqrt{2{,}25} = 1{,}5\\,\\mathrm{m/s}$ ، ومدّة العبور $60 \\div 1{,}5 = 40$ ثانية.',
            'أمّا أنس فسرعته الذاتية $0{,}6$ أصغر من $0{,}8$ : لا يمكن أن تكون وتر هذا المثلث، فلا يستطيع الوصول إلى $B$ .',
          ] },
        ],
      },
    ],
  },

  // ── مسألة 2 — مروحية الإسعاف : EK = 600 m, KF = 1000 m, EF = 800 m ; la tournée E → K → F → E = 2400 m ──
  {
    id: 'masala-2',
    title: 'مسألة 2 — مروحية الإسعاف',
    context: 'إجلاء مريض من قرية جبلية ثم العودة إلى القاعدة: الانتقال والمسافة المقطوعة',
    emoji: '🚑',
    source: SOURCE,
    statement: 'تلقّت مصلحة الإسعاف نداءً لإجلاء مريض من قرية جبلية تقطع الثلوج طريقها. على الخريطة المرصوفة في الشكل المقابل، ضلع المربّع يمثّل 100 m. أقلعت مروحية الإسعاف مستقيمًا من القاعدة $E$ إلى القرية $K$ ، ثم نقلت المريض مستقيمًا من $K$ إلى المستشفى $F$ ، ثم عادت مباشرة من $F$ إلى $E$ . الوقود الموجود في خزّانها عند الإقلاع يكفي لقطع 3000 m فقط. يتكوّن طاقمها من 3 أشخاص، وأقلعت على الساعة 7.',
    figure: FIG_HELICOPTER,
    data: [
      { id: 'scale', text: 'ضلع المربّع يمثّل 100 m', useful: true },
      { id: 'legs', text: 'مشوار من القاعدة E إلى القرية K ثم مشوار من K إلى المستشفى F', useful: true },
      { id: 'back', text: 'العودة مباشرة من F إلى E', useful: true },
      { id: 'fuel', text: 'الوقود الموجود يكفي لقطع 3000 m', useful: true },
      { id: 'crew', text: 'طاقم من 3 أشخاص', useful: false },
      { id: 'takeoff', text: 'أقلعت على الساعة 7', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مشواران متتابعان',
        question: 'عبّر عن $\\overrightarrow{EK} + \\overrightarrow{KF}$ بشعاع واحد. احسب المسافة $EF$ ، ثم احسب طول المسار $E \\to K \\to F$ .',
        asks: ['$\\overrightarrow{EK} + \\overrightarrow{KF}$ بشعاع واحد', 'المسافة $EF$', 'طول المسار $E \\to K \\to F$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['alaqat-shal', 'qaidat-mutawazi'],
            prompt: 'الشعاعان $\\overrightarrow{EK}$ و $\\overrightarrow{KF}$ :',
            options: [
              'متعاقبان (نهاية الأول مبدأ الثاني): نجمعهما بعلاقة شال',
              'لهما نفس المبدأ: نجمعهما بقاعدة متوازي الأضلاع',
              'لا يُجمعان لأنهما ليسا على نفس المنحى',
            ],
            correct: 0,
            explain: 'المروحية تصل إلى $K$ ثم تنطلق منه بالمريض: $K$ نهاية الشعاع الأول ومبدأ الثاني. قاعدة متوازي الأضلاع لشعاعين يبدآن من نفس النقطة، وشعاعان من منحيين مختلفين يُجمعان أيضًا.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['alaqat-shal'],
            prompt: '$\\overrightarrow{EK} + \\overrightarrow{KF} =$',
            options: ['$\\overrightarrow{EF}$', '$\\overrightarrow{FE}$', '$\\overrightarrow{KF}$'],
            correct: 0, cols: 3,
            explain: 'علاقة شال: من مبدأ الأول $E$ إلى نهاية الثاني $F$ ، $\\overrightarrow{EK} + \\overrightarrow{KF} = \\overrightarrow{EF}$ . $\\overrightarrow{FE}$ يعكس الاتجاه، و $\\overrightarrow{KF}$ ينسى المشوار الأول.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'المسافة $EF$ ، بالمتر:', expected: 800, suffix: 'm',
            explain: '$[EF]$ على خطّ من خطوط الشبكة، طوله 8 مربعات: $8 \\times 100 = 800$ m.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'طول المشوار الأول $EK$ ، بالمتر:', expected: 600,
            explain: '6 مربعات على خطّ من خطوط الشبكة: $6 \\times 100 = 600$ m.' },
          { kind: 'numeric', role: 'compute', requires: ['fithaghuras'],
            prompt: 'طول المشوار الثاني $KF$ ، بالمتر (المثلث $EKF$ قائم في $E$):', expected: 1000,
            explain: '$[KF]$ وتر المثلث $EKF$ القائم في $E$ : $KF^2 = 600^2 + 800^2 = 360000 + 640000 = 1000000$ ، ومنه $KF = 1000$ m.' },
          { kind: 'numeric', role: 'answer', ask: 2,
            prompt: 'طول المسار $E \\to K \\to F$ :', expected: 1600, suffix: 'm',
            explain: 'المسار مشواران: $600 + 1000 = 1600$ m.' },
          { kind: 'choice', role: 'conclude', requires: ['alaqat-shal'],
            prompt: 'قارن طول الشعاع $\\overrightarrow{EK} + \\overrightarrow{KF}$ بمجموع الطولين $EK + KF$ :',
            options: [
              'طول المجموع أصغر: $800 < 1600$ ، فطول مجموع شعاعين ليس مجموع طوليهما',
              'متساويان دائمًا: طول المجموع هو مجموع الطولين',
              'طول المجموع أكبر من مجموع الطولين',
            ],
            correct: 0,
            explain: 'طول $\\overrightarrow{EF}$ هو 800 m ، والمسار المنكسر طوله 1600 m: الطولان لا يُجمعان إلا لشعاعين لهما نفس المنحى ونفس الاتجاه.' },
          { kind: 'solution', ask: 0, lines: [
            'نهاية $\\overrightarrow{EK}$ هي مبدأ $\\overrightarrow{KF}$ : حسب علاقة شال $\\overrightarrow{EK} + \\overrightarrow{KF} = \\overrightarrow{EF}$ .',
            '$EF = 8 \\times 100 = 800$ m و $EK = 6 \\times 100 = 600$ m.',
            'المثلث $EKF$ قائم في $E$ : $KF^2 = 600^2 + 800^2 = 1000000$ ، ومنه $KF = 1000$ m.',
            'طول المسار $E \\to K \\to F$ هو $600 + 1000 = 1600$ m، ضعف المسافة $EF$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'العودة إلى القاعدة',
        question: 'بعد ترك المريض في المستشفى $F$ عادت المروحية مباشرة إلى $E$ . عبّر عن $\\overrightarrow{EK} + \\overrightarrow{KF} + \\overrightarrow{FE}$ بشعاع واحد. ما المسافة التي قطعتها المروحية في الرحلة كلّها؟',
        asks: ['$\\overrightarrow{EK} + \\overrightarrow{KF} + \\overrightarrow{FE}$ بشعاع واحد', 'المسافة المقطوعة في الرحلة كلّها'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['alaqat-shal'],
            prompt: 'نعوّض $\\overrightarrow{EK} + \\overrightarrow{KF}$ بالشعاع الذي وجدته في السؤال 1). يبقى أن نجمع:',
            options: [
              '$\\overrightarrow{EF} + \\overrightarrow{FE}$',
              '$\\overrightarrow{EF} + \\overrightarrow{EF}$',
              '$\\overrightarrow{FE} + \\overrightarrow{FE}$',
            ],
            correct: 0, cols: 3,
            explain: '$\\overrightarrow{EK} + \\overrightarrow{KF} = \\overrightarrow{EF}$ ، ومشوار العودة هو $\\overrightarrow{FE}$ من $F$ نحو $E$ ، لا $\\overrightarrow{EF}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mutaakisan', 'shuaa-maadum'],
            prompt: '$\\overrightarrow{EK} + \\overrightarrow{KF} + \\overrightarrow{FE} =$',
            options: ['$\\vec{0}$', 'العدد 0', '$\\overrightarrow{EF}$', '$2\\overrightarrow{EF}$'],
            correct: 0, cols: 4,
            explain: '$\\overrightarrow{EF}$ و $\\overrightarrow{FE}$ متعاكسان: $\\overrightarrow{EF} + \\overrightarrow{FE} = \\overrightarrow{EE} = \\vec{0}$ ، الشعاع المعدوم لا العدد 0. $2\\overrightarrow{EF}$ يجعل العودة ذهابًا ثانيًا.' },
          { kind: 'numeric', role: 'compute', requires: ['mutaakisan'],
            prompt: 'طول مشوار العودة $FE$ ، بالمتر:', expected: 800,
            explain: 'الشعاعان المتعاكسان $\\overrightarrow{FE}$ و $\\overrightarrow{EF}$ لهما نفس الطول: $FE = EF = 800$ m.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'المسافة التي قطعتها المروحية في الرحلة كلّها:', expected: 2400, suffix: 'm',
            explain: 'نجمع أطوال المشاوير الثلاثة: $600 + 1000 + 800 = 2400$ m.' },
          { kind: 'choice', role: 'conclude', requires: ['shuaa-maadum'],
            prompt: 'ماذا يعني المجموع الشعاعي الذي وجدته في هذه الوضعية؟',
            options: [
              'عادت المروحية إلى نقطة انطلاقها: انتقالها الكلّي معدوم، لكنها قطعت مسافة',
              'المروحية لم تقطع أيّ مسافة',
              'المروحية بقيت في المستشفى $F$',
            ],
            correct: 0,
            explain: 'المجموع $\\overrightarrow{EE}$ : نقطة البداية هي نقطة النهاية. الانتقال معدوم، أمّا المسافة المقطوعة فهي مجموع أطوال المشاوير.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\overrightarrow{EK} + \\overrightarrow{KF} + \\overrightarrow{FE} = \\overrightarrow{EF} + \\overrightarrow{FE} = \\overrightarrow{EE} = \\vec{0}$ : الشعاعان $\\overrightarrow{EF}$ و $\\overrightarrow{FE}$ متعاكسان.',
            'عادت المروحية إلى $E$ ، لكنها قطعت $600 + 1000 + 800 = 2400$ m.',
          ] },
        ],
      },
      {
        label: '3)', title: 'هل يكفي الوقود؟',
        question: 'هل يكفي الوقود الموجود للرحلة كلّها؟ كم مترًا يبقى ممّا يكفي له الوقود عند العودة إلى $E$ ؟',
        asks: ['هل يكفي الوقود الموجود؟', 'المسافة التي يكفي لها الوقود المتبقّي عند العودة'],
        steps: [
          { kind: 'choice', role: 'translate',
            prompt: 'لنعرف ما تستهلكه الرحلة من الوقود، نستعمل:',
            options: [
              'المسافة المقطوعة فعلًا: مجموع أطوال المشاوير',
              'طول المجموع الشعاعي للرحلة',
              'المسافة $EF$ وحدها',
            ],
            correct: 0,
            explain: 'الوقود ينقص مع كل متر تطيره المروحية: نجمع أطوال المشاوير. المجموع الشعاعي يدلّ على نقطة الوصول فقط.' },
          { kind: 'choice', role: 'conclude', ask: 0,
            prompt: 'هل يكفي الوقود الموجود؟',
            options: [
              'نعم: المسافة المقطوعة أقلّ من 3000 m',
              'نعم، دائمًا: المجموع الشعاعي معدوم فالرحلة لا تستهلك وقودًا',
              'لا: المسافة المقطوعة أكبر من 3000 m',
            ],
            correct: 0,
            explain: '$2400 < 3000$ : الوقود يكفي. أمّا الشعاع المعدوم فلا يعني أن المروحية لم تطر.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'المسافة التي يكفي لها الوقود المتبقّي عند العودة إلى $E$ :', expected: 600, suffix: 'm',
            explain: '$3000 - 2400 = 600$ m.' },
          { kind: 'choice', role: 'conclude', requires: ['alaqat-shal'],
            prompt: 'لو عادت المروحية من $F$ إلى $E$ مرورًا بـ $K$ ، هل يكفي الوقود الموجود؟',
            options: [
              'لا: الرحلة تصبح $1600 + 1600 = 3200$ m، أكثر ممّا يكفي له الوقود',
              'نعم: الانتقال هو نفسه $\\overrightarrow{FE}$ ، فالاستهلاك نفسه',
              'نعم: $\\overrightarrow{FK} + \\overrightarrow{KE} = \\overrightarrow{FE}$ وطوله 800 m',
            ],
            correct: 0,
            explain: '$\\overrightarrow{FK} + \\overrightarrow{KE} = \\overrightarrow{FE}$ ، لكن المروحية تطير $1000 + 600 = 1600$ m بدل 800 m: الرحلة $1600 + 1600 = 3200 > 3000$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الوقود يُستهلك حسب المسافة المقطوعة لا حسب الانتقال: الرحلة 2400 m.',
            '$2400 < 3000$ : يكفي الوقود الموجود، ويبقى منه ما يكفي لقطع $3000 - 2400 = 600$ m.',
            'أمّا العودة مرورًا بـ $K$ فتجعل الرحلة $1600 + 1600 = 3200$ m، أكثر ممّا يكفي له الوقود، رغم أن الانتقال هو نفسه $\\overrightarrow{FE}$ .',
          ] },
        ],
      },
    ],
  },

  // ── مسألة 3 — le bateau : AB = (12 ; 9) → 15 km/h, AC = (0 ; −4) → 4 km/h, AB + AC = AH = (12 ; 5) → 13 km/h ──
  {
    id: 'masala-3',
    title: 'مسألة 3 — قارب يعبر الخليج',
    context: 'المحرّك والتيار البحري على خريطة مرصوفة',
    emoji: '⛴️',
    source: SOURCE,
    statement: 'قارب نقل يعبر خليجًا، ويحرص قبطانه على سلامة ركّابه، من الميناء $A$ نحو الميناء $H$ . على الخريطة المرصوفة في الشكل المقابل، ضلع المربّع يمثّل 1 km. لو كان الماء ساكنًا لنقل المحرّك القارب في ساعة واحدة من $A$ إلى المنارة $B$ ، والتيار البحري وحده ينقل أيّ جسم عائم في ساعة واحدة من $A$ إلى العوّامة $C$ . يستهلك المحرّك 30 لترًا من الوقود في الساعة، وثمن اللتر 45 دج. يحمل القارب 28 مسافرًا، وارتفاع المنارة 18 m.',
    figure: FIG_BAY,
    data: [
      { id: 'scale', text: 'ضلع المربّع يمثّل 1 km', useful: true },
      { id: 'engine', text: 'المحرّك وحده: من A إلى B في ساعة', useful: true },
      { id: 'current', text: 'التيار وحده: من A إلى C في ساعة', useful: true },
      { id: 'fuel', text: 'المحرّك يستهلك 30 لترًا في الساعة', useful: true },
      { id: 'price', text: 'ثمن لتر الوقود 45 دج', useful: true },
      { id: 'people', text: 'يحمل القارب 28 مسافرًا', useful: false },
      { id: 'tower', text: 'ارتفاع المنارة 18 m', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'أين القارب بعد ساعة؟',
        question: 'انتقال القارب في ساعة واحدة هو $\\overrightarrow{AB} + \\overrightarrow{AC}$ . بيّن أنّ القارب يصل إلى الميناء $H$ بعد ساعة واحدة. احسب المسافة $AH$ .',
        asks: ['القارب في $H$ بعد ساعة', 'المسافة $AH$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['qaidat-mutawazi'],
            prompt: 'للشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{AC}$ نفس المبدأ $A$ . مجموعهما هو $\\overrightarrow{AD}$ حيث:',
            options: ['$ABDC$ متوازي أضلاع', '$ABCD$ متوازي أضلاع', '$D$ منتصف $[BC]$'],
            correct: 0, cols: 3,
            explain: 'قاعدة متوازي الأضلاع: $\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{AD}$ معناه $ABDC$ متوازي أضلاع، و $D$ الرأس المقابل لـ $A$ . في $ABCD$ يكون $C$ هو المقابل لـ $A$ ، ومنتصف $[BC]$ هو منتصف القطر لا نهايته.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'على الخريطة، للانتقال من $A$ إلى $C$ : كم مربّعًا نحو الأسفل؟', expected: 4,
            explain: '$C$ تحت $A$ مباشرة بأربعة مربعات.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'وللانتقال من $B$ إلى $H$ : كم مربّعًا نحو الأسفل؟', expected: 4,
            explain: '$H$ تحت $B$ مباشرة بأربعة مربعات: نفس الحركة من $A$ إلى $C$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaidat-mutawazi', 'tasawi-mutawazi'],
            prompt: 'ماذا تستنتج؟',
            options: [
              '$\\overrightarrow{BH} = \\overrightarrow{AC}$ ، فـ $ABHC$ متوازي أضلاع و $\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{AH}$ : القارب في $H$',
              '$\\overrightarrow{BH} = \\overrightarrow{AC}$ ، فـ $\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{BC}$',
              '$H$ ليست على $(AB)$ ، فلا يصل القارب إلى $H$',
            ],
            correct: 0, cols: 1,
            explain: '$\\overrightarrow{BH} = \\overrightarrow{AC}$ معناه $ABHC$ متوازي أضلاع، فـ $H$ هي النقطة $D$ : المجموع هو القطر الصادر من $A$ ، $\\overrightarrow{AH}$ . $[BC]$ هو القطر الآخر، والقارب لا يتّجه على $(AB)$ لأن التيار يحرفه.' },
          { kind: 'numeric', role: 'compute', requires: ['fithaghuras'],
            prompt: 'من $A$ إلى $H$ : 12 مربّعًا أفقيًا و 5 مربّعات عموديًا. احسب $AH^2$ :', expected: 169,
            explain: 'حسب خاصية فيثاغورس: $AH^2 = 12^2 + 5^2 = 144 + 25 = 169$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['fithaghuras'],
            prompt: 'المسافة $AH$ ، بالكيلومتر:', expected: 13, suffix: 'km',
            explain: '$AH = \\sqrt{169} = 13$ km.' },
          { kind: 'solution', ask: 0, lines: [
            'على الخريطة $\\overrightarrow{BH} = \\overrightarrow{AC}$ (4 مربعات نحو الأسفل): الرباعي $ABHC$ متوازي أضلاع.',
            'حسب قاعدة متوازي الأضلاع $\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{AH}$ : بعد ساعة واحدة يصل القارب إلى $H$ .',
            '$AH^2 = 12^2 + 5^2 = 169$ ، ومنه $AH = 13$ km.',
          ] },
        ],
      },
      {
        label: '2)', title: 'هل ساعد التيار القارب؟',
        question: 'في ماء ساكن يقطع القارب المسافة $AB$ في ساعة واحدة. احسب $AB$ . ما سرعة القارب الفعلية؟ هل ساعد التيار القارب أم أبطأه؟',
        asks: ['المسافة $AB$', 'سرعة القارب الفعلية', 'ساعد التيار أم أبطأه؟'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['fithaghuras'],
            prompt: 'من $A$ إلى $B$ : 12 مربّعًا أفقيًا و 9 مربّعات عموديًا. احسب $AB^2$ :', expected: 225,
            explain: '$AB^2 = 12^2 + 9^2 = 144 + 81 = 225$ .' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'المسافة $AB$ ، بالكيلومتر:', expected: 15, suffix: 'km',
            explain: '$AB = \\sqrt{225} = 15$ km: سرعة القارب الذاتية $15\\,\\mathrm{km/h}$ .' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'سرعة القارب الفعلية، بالكيلومتر في الساعة:', expected: 13, suffix: 'km/h',
            explain: 'في ساعة واحدة ينتقل القارب فعلًا من $A$ إلى $H$ : سرعته الفعلية $AH$ في الساعة، أي $13\\,\\mathrm{km/h}$ .' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['qaidat-mutawazi'],
            prompt: 'هل ساعد التيار القارب أم أبطأه؟',
            options: [
              'أبطأه: سرعته الفعلية أصغر من سرعته الذاتية، رغم أن التيار يجري بسرعة $4\\,\\mathrm{km/h}$',
              'ساعده: سرعته الفعلية $15 + 4 = 19\\,\\mathrm{km/h}$',
              'لم يغيّر شيئًا: سرعته تبقى $15\\,\\mathrm{km/h}$',
            ],
            correct: 0,
            explain: '$13 < 15$ : طول المجموع $\\overrightarrow{AH}$ ليس مجموع الطولين $15 + 4 = 19$ ، والتيار هنا يدفع القارب جزئيًا إلى الوراء.' },
          { kind: 'solution', ask: 0, lines: [
            '$AB^2 = 12^2 + 9^2 = 225$ ، ومنه $AB = 15$ km: سرعة القارب الذاتية $15\\,\\mathrm{km/h}$ .',
            'في ساعة ينتقل القارب فعلًا من $A$ إلى $H$ : سرعته الفعلية $13\\,\\mathrm{km/h}$ .',
            '$13 < 15$ : التيار أبطأ القارب، فطول المجموع ليس مجموع الطولين $15 + 4 = 19$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'ثمن الوقود الضائع',
        question: 'لو لم يكن هناك تيار، لوجّه الربّان قاربه نحو $H$ مباشرة بسرعته الذاتية. كم دقيقة يدوم العبور حينئذ؟ احسب ثمن الوقود الذي يضيع بسبب التيار في كل رحلة.',
        asks: ['مدّة العبور دون تيار', 'ثمن الوقود الضائع'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'مدّة قطع المسافة $AH$ بسرعة القارب الذاتية، بالدقيقة:', expected: 52,
            explain: '$13 \\div 15$ من الساعة، أي $\\dfrac{13}{15} \\times 60 = 52$ دقيقة.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'الوقت الضائع بسبب التيار، بالدقيقة:', expected: 8,
            explain: 'مع التيار يدوم العبور ساعة: $60 - 52 = 8$ دقائق.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'كمية الوقود التي يستهلكها المحرّك في هذا الوقت، باللتر:', expected: 4,
            explain: '30 لترًا في 60 دقيقة: $30 \\times \\dfrac{8}{60} = 4$ لترات.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ثمن الوقود الضائع في كل رحلة:', expected: 180, suffix: 'دج',
            explain: '$4 \\times 45 = 180$ دج.' },
          { kind: 'solution', ask: 1, lines: [
            'دون تيار: $13 \\div 15$ من الساعة، أي $\\dfrac{13}{15} \\times 60 = 52$ دقيقة.',
            'مع التيار يدوم العبور 60 دقيقة: يضيع $60 - 52 = 8$ دقائق.',
            'في 8 دقائق يستهلك المحرّك $30 \\times \\dfrac{8}{60} = 4$ لترات، ثمنها $4 \\times 45 = 180$ دج في كل رحلة.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
