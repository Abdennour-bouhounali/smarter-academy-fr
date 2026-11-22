/**
 * Les trois « مسائل » du درس « مفهوم الانسحاب والشعاع وتساوي شعاعين » (modules 5, 6, 7) — des exercices COMPLETS de
 * type امتحان, résolus pas à pas (common/problems/GuidedProblem.jsx).
 *
 * AJOUTS DE LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`) : le manuel ne les contient pas. Ils
 * restent dans le périmètre de la leçon : la translation donnée par un point et son image, le vecteur (منحى، اتجاه،
 * طول), deux vecteurs égaux, AB = DC ⇔ ABCD متوازي أضلاع (l'ordre des lettres), AD = BC, le milieu commun des
 * diagonales et le cas aligné — plus les acquis (Pythagore pour une longueur sur quadrillage). Jamais le milieu d'un
 * segment par les vecteurs ni la construction de l'image (درس 2), ni la somme, Chasles, l'opposé ou le vecteur nul
 * (درس 3).
 *
 * CHAQUE ÉNONCÉ MONTRE SA FIGURE (`figure`, GeoFigure sur quadrillage) : tous les points sur des nœuds, chaque
 * déplacement se lit en carreaux. La مسألة 1 est « مسألة الدرس » : énoncé et figure vivent dans
 * `LESSON_CONFIG.lessonProblem` (montrés au sommaire et à la fin du module 1) — le monde du niveau متقدم (un triangle
 * de drones, une translation donnée par un point et son image) avec d'autres points et la flèche (4 ; 3).
 *
 * Chaque nombre et chaque égalité sont recalculés dans ./problems.test.js (packages/core/arithmetic/vectors.js).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

/* مسألة 2 — le portail coulissant (1 carreau = 1 m) : ABCD le vantail 4 m × 2 m, la translation B ↦ A (−4 ; 0). */
export const FIG_GATE = {
  points: { E: [0, 0], A: [4, 0], B: [8, 0], F: [0, 2], D: [4, 2], C: [8, 2] },
  grid: true,
  polygons: [{ points: ['A', 'B', 'C', 'D'], tone: 'indigo' }],
  segments: [{ from: 'A', to: 'B', bold: true }, { from: 'B', to: 'C', bold: true }, { from: 'C', to: 'D', bold: true },
    { from: 'D', to: 'A', bold: true }, { from: 'A', to: 'C', tone: 'amber', bold: true }],
  labels: { E: 'sw', A: 's', B: 'se', F: 'nw', D: 'n', C: 'ne' },
  ariaLabel: 'ورقة مرصوفة: لوحة الباب المستطيل ABCD (عرضه 4 مربعات وارتفاعه مربعان) وعارضته القطرية [AC]، والعلامتان E و F على يسار الباب على الجدار',
  maxWidth: 420,
};

/* مسألة 3 — le drone de cartographie : P, Q, R, S, T alignés, la translation P ↦ Q (4 ; 2). */
export const FIG_SURVEY = {
  points: { P: [0, 0], Q: [4, 2], R: [8, 4], S: [10, 5], T: [12, 6] },
  grid: true,
  segments: [{ from: 'P', to: 'T', dashed: true }],
  vectors: [{ from: 'P', to: 'Q', tone: 'rose' }],
  labels: { P: 'nw', Q: 'nw', R: 'nw', S: 'nw', T: 'nw' },
  ariaLabel: 'ورقة مرصوفة: نقاط التصوير P و Q و R و S والنقطة T على مستقيم واحد، والسهم من P نحو Q (أربعة مربعات نحو اليمين ومربعان نحو الأعلى)',
  maxWidth: 420,
};

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — عرض المسيّرات',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🚁',
    source: SOURCE,
    statement: LESSON_CONFIG.lessonProblem.statement,
    // A(1;2) ↦ E(5;5) : la flèche (4 ; 3). B ↦ F, C ↦ G, D ↦ M ; K = B + (3 ; 4) et L = D + (3 ; 4) : les carreaux inversés.
    figure: LESSON_CONFIG.lessonProblem.figure,
    data: [
      { id: 'move', text: 'المسيّرات الأربع تنتقل بالانسحاب الذي يحوّل A إلى E', useful: true },
      { id: 'grid', text: 'المسيّرات والمواضع على عقد ورقة مرصوفة (الشكل)', useful: true },
      { id: 'scale', text: 'ضلع مربع الرصف يمثّل 10 m', useful: true },
      { id: 'speed', text: 'سرعة كل مسيّرة 2 m في الثانية', useful: true },
      { id: 'count', text: 'تشارك في العرض 150 مسيّرة', useful: false },
      { id: 'time', text: 'يدوم العرض 12 دقيقة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'صورتا المسيّرتين B و C',
        question: 'عيّن صورة المسيّرة $B$ وصورة المسيّرة $C$ بهذا الانسحاب.',
        asks: ['صورة المسيّرة $B$', 'صورة المسيّرة $C$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['insihab-shuaa'],
            prompt: '«تنتقل المسيّرات كلّها بالانسحاب الذي يحوّل $A$ إلى $E$» معناه:',
            options: [
              'كل مسيّرة تتحرّك بنفس السهم الذي يذهب من $A$ إلى $E$: نفس المنحى ونفس الاتجاه ونفس الطول',
              'كل المسيّرات تتّجه نحو النقطة $E$ نفسها',
              'كل مسيّرة تقطع نفس الطول، في أيّ اتجاه كان',
            ],
            correct: 0,
            explain: 'الانسحاب يتعيّن بنقطة وصورتها: كل نقطة تتحرّك بنفس السهم من $A$ نحو $E$، لا نحو النقطة $E$ نفسها.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'السهم من $A$ إلى $E$: كم مربعًا نحو اليمين؟', expected: 4,
            explain: 'من العمود 1 إلى العمود 5: $5 - 1 = 4$ مربعات نحو اليمين.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'وكم مربعًا نحو الأعلى؟', expected: 3,
            explain: 'من السطر 2 إلى السطر 5: $5 - 2 = 3$ مربعات نحو الأعلى.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['insihab-shuaa'],
            prompt: 'صورة المسيّرة $B$ بهذا الانسحاب هي:',
            options: ['النقطة $F$', 'النقطة $K$', 'النقطة $E$'],
            correct: 0, cols: 3,
            explain: 'من $B$ نعدّ 4 مربعات نحو اليمين ثم 3 نحو الأعلى فنصل إلى $F$. أمّا $K$ فبعد 3 نحو اليمين و 4 نحو الأعلى (العددان مقلوبان)، و $E$ صورة $A$ وحدها.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['insihab-shuaa'],
            prompt: 'صورة المسيّرة $C$ بهذا الانسحاب هي:',
            options: ['النقطة $G$', 'النقطة $F$', 'النقطة $E$'],
            correct: 0, cols: 3,
            explain: 'من $C$: 4 مربعات نحو اليمين و 3 نحو الأعلى فنصل إلى $G$. النقطة $F$ تبعد عن $C$ ثلاثة مربعات نحو اليمين فقط.' },
          { kind: 'solution', ask: 0, lines: [
            'السهم من $A$ إلى $E$: 4 مربعات نحو اليمين و 3 مربعات نحو الأعلى.',
            'الانسحاب يحرّك كل نقطة بنفس السهم: من $B$ إلى $F$ ومن $C$ إلى $G$ نجد أيضًا 4 مربعات نحو اليمين و 3 نحو الأعلى.',
            'إذن $\\overrightarrow{BF} = \\overrightarrow{CG} = \\overrightarrow{AE}$: صورة المسيّرة $B$ هي $F$، وصورة المسيّرة $C$ هي $G$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'المسيّرة الضالّة',
        question: 'بعد المشهد وجد التقنيّ المسيّرة $D$ في الموضع $L$. هل وصلت إلى مكانها الصحيح؟ علّل. ثم عيّن مكانها الصحيح.',
        asks: ['هل وصلت المسيّرة $D$ إلى مكانها الصحيح؟', 'مكانها الصحيح'],
        steps: [
          { kind: 'numeric', role: 'compute',
            prompt: 'السهم من $D$ إلى $L$: كم مربعًا نحو اليمين؟', expected: 3,
            explain: 'من العمود 0 إلى العمود 3: $3 - 0 = 3$ مربعات.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'وكم مربعًا نحو الأعلى؟', expected: 4,
            explain: 'من السطر 6 إلى السطر 10: $10 - 6 = 4$ مربعات.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tasawi-shuaayn'],
            prompt: 'هل وصلت المسيّرة $D$ إلى مكانها الصحيح؟',
            options: [
              'لا: للشعاعين $\\overrightarrow{DL}$ و $\\overrightarrow{AE}$ نفس الطول لكن ليس لهما نفس المنحى، إذن $\\overrightarrow{DL} \\neq \\overrightarrow{AE}$',
              'نعم: لأنّ للقطعتين $[DL]$ و $[AE]$ نفس الطول',
              'نعم: لأنّ $L$ فوق $D$ كما أنّ $E$ فوق $A$',
            ],
            correct: 0,
            explain: 'ثلاثة نحو اليمين وأربعة نحو الأعلى ليس هو السهم أربعة نحو اليمين وثلاثة نحو الأعلى: الطول نفسه ($3^2 + 4^2 = 4^2 + 3^2$) لكن المنحى مختلف. تساوي شعاعين يتطلّب المنحى والاتجاه والطول معًا.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['insihab-shuaa'],
            prompt: 'المكان الصحيح للمسيّرة $D$ هو:',
            options: ['النقطة $M$', 'النقطة $L$', 'النقطة $K$'],
            correct: 0, cols: 3,
            explain: 'من $D$ نعدّ 4 مربعات نحو اليمين و 3 نحو الأعلى فنصل إلى $M$: $\\overrightarrow{DM} = \\overrightarrow{AE}$.' },
          { kind: 'solution', ask: 0, lines: [
            'السهم من $D$ إلى $L$: 3 مربعات نحو اليمين و 4 نحو الأعلى، والسهم من $A$ إلى $E$: 4 نحو اليمين و 3 نحو الأعلى.',
            'للشعاعين نفس الطول لكن ليس لهما نفس المنحى، إذن $\\overrightarrow{DL} \\neq \\overrightarrow{AE}$: المسيّرة $D$ ليست في مكانها.',
            'مكانها الصحيح هو $M$ لأنّ $\\overrightarrow{DM} = \\overrightarrow{AE}$ (4 مربعات نحو اليمين و 3 نحو الأعلى).',
          ] },
        ],
      },
      {
        label: '3)', title: 'المسافة ومدة الانتقال',
        question: 'لماذا تقطع المسيّرات الأربع المسافة نفسها في هذا المشهد؟ احسب هذه المسافة بالمتر، ثم مدة الانتقال بالثواني.',
        asks: ['لماذا تقطع المسيّرات المسافة نفسها؟', 'المسافة بالمتر', 'مدة الانتقال بالثواني'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tasawi-shuaayn'],
            prompt: 'المسيّرات الأربع تقطع المسافة نفسها لأنّ:',
            options: [
              '$\\overrightarrow{AE} = \\overrightarrow{BF} = \\overrightarrow{CG} = \\overrightarrow{DM}$: أشعة متساوية لها نفس الطول',
              'لها نفس السرعة',
              'المسيّرات متجاورة في السماء',
            ],
            correct: 0,
            explain: 'كل مسيّرة تذهب من موضعها إلى صورتها، وكل هذه الأسهم ممثّلات لشعاع واحد: لها نفس الطول. السرعة وحدها لا تكفي، فالمدة تتعلّق بالمسافة.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'طول القطعة $[AE]$ بعدد أضلاع المربعات (استعمل خاصية فيثاغورس):', expected: 5,
            explain: 'في المثلث القائم الذي ضلعاه 4 و 3 مربعات: $AE^2 = 4^2 + 3^2 = 25$، إذن $AE = 5$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'المسافة التي تقطعها كل مسيّرة:', expected: 50, suffix: 'm',
            explain: 'كل ضلع مربع يمثّل 10 m: $5 \\times 10 = 50$.' },
          { kind: 'numeric', role: 'answer', ask: 2,
            prompt: 'مدة الانتقال:', expected: 25, suffix: 'ثانية',
            explain: 'كل مسيّرة تقطع 2 m في الثانية: $50 \\div 2 = 25$.' },
          { kind: 'solution', ask: 1, lines: [
            '$\\overrightarrow{AE} = \\overrightarrow{BF} = \\overrightarrow{CG} = \\overrightarrow{DM}$، إذن تقطع المسيّرات الأربع المسافة نفسها $AE$.',
            '$AE^2 = 4^2 + 3^2 = 25$ إذن $AE = 5$ مربعات، أي $5 \\times 10 = 50$ m.',
            'مدة الانتقال: $50 \\div 2 = 25$، أي 25 ثانية.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — الباب المنزلق',
    context: 'باب المستودع ينسحب على سكّته',
    emoji: '🚪',
    source: SOURCE,
    statement: 'في مدخل مستودع جمعية خيرية لتوزيع الغذاء على المحتاجين ارتفاعه 5 m باب حديدي منزلق مدهون بالأخضر. في الشكل المقابل (ضلع مربع الرصف يمثّل 1 m) لوحة الباب هي المستطيل $ABCD$، تقوّيها عارضة قطرية $[AC]$، وتنزلق على سكّة أرضية مستقيمة تشمل $A$ و $B$؛ والنقطتان $E$ و $F$ علامتان على جدار المستودع. عند الفتح ينسحب الباب كلّه بالانسحاب الذي يحوّل $B$ إلى $A$. ثمن المتر الواحد من السكّة 3200 دج.',
    figure: FIG_GATE,
    data: [
      { id: 'move', text: 'عند الفتح ينسحب الباب بالانسحاب الذي يحوّل B إلى A', useful: true },
      { id: 'gate', text: 'لوحة الباب المستطيل ABCD وعارضتها القطرية [AC]', useful: true },
      { id: 'scale', text: 'ضلع مربع الرصف يمثّل 1 m', useful: true },
      { id: 'price', text: 'ثمن المتر من السكّة 3200 دج', useful: true },
      { id: 'height', text: 'ارتفاع المستودع 5 m', useful: false },
      { id: 'paint', text: 'الباب مدهون بالأخضر', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'أين تذهب أركان الباب؟',
        question: 'عيّن صورة النقطة $A$ وصورة النقطة $C$ بهذا الانسحاب.',
        asks: ['صورة النقطة $A$', 'صورة النقطة $C$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['insihab-shuaa'],
            prompt: 'الانسحاب الذي يحوّل $B$ إلى $A$ يحرّك كل نقطة من الباب:',
            options: [
              'بنفس السهم من $B$ نحو $A$: أفقيًا نحو اليسار وبطول $BA$',
              'بنفس السهم من $A$ نحو $B$: أفقيًا نحو اليمين',
              'نحو النقطة $A$ نفسها',
            ],
            correct: 0,
            explain: 'الانسحاب الذي يحوّل $B$ إلى $A$ يعطي كل نقطة نفس منحى السهم من $B$ نحو $A$ ونفس اتجاهه ونفس طوله.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'السهم من $B$ إلى $A$: كم مربعًا نحو اليسار؟', expected: 4,
            explain: 'من العمود 8 إلى العمود 4: $8 - 4 = 4$ مربعات، وهو عرض الباب.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['insihab-shuaa'],
            prompt: 'صورة النقطة $A$ بهذا الانسحاب هي:',
            options: ['النقطة $E$', 'النقطة $B$', 'النقطة $F$'],
            correct: 0, cols: 3,
            explain: 'من $A$ نعدّ 4 مربعات نحو اليسار فنصل إلى $E$. النقطة $B$ صورة $A$ بالانسحاب المعاكس (من $A$ نحو $B$).' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['insihab-shuaa'],
            prompt: 'صورة النقطة $C$ بهذا الانسحاب هي:',
            options: ['النقطة $D$', 'النقطة $F$', 'النقطة $B$'],
            correct: 0, cols: 3,
            explain: 'من $C$ نعدّ 4 مربعات نحو اليسار فنصل إلى $D$: الباب ينسحب بقدر عرضه، فيحلّ الركن $C$ محلّ الركن $D$. أمّا $F$ فتبعد 8 مربعات عن $C$.' },
          { kind: 'solution', ask: 0, lines: [
            'السهم من $B$ إلى $A$: 4 مربعات أفقيًا نحو اليسار.',
            'من $A$ نجد بنفس السهم $E$، ومن $C$ نجد $D$: $\\overrightarrow{AE} = \\overrightarrow{CD} = \\overrightarrow{BA}$.',
            'صورة $A$ هي $E$ وصورة $C$ هي $D$: عند الفتح يحلّ الركن $C$ محلّ الركن $D$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'العارضة في موضعها الجديد',
        question: 'بعد الفتح تنتقل العارضة $[AC]$ إلى موضع جديد. بيّن أنّ الرباعي $AEDC$ متوازي أضلاع، ثم استنتج شعاعًا من الشكل يساوي الشعاع $\\overrightarrow{AC}$.',
        asks: ['بيّن أنّ $AEDC$ متوازي أضلاع', 'شعاع يساوي $\\overrightarrow{AC}$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['mutawazi-adlaa'],
            prompt: 'النقط $A$ و $E$ و $D$ و $C$ كل ثلاث منها ليست في استقامية. لكي نبيّن أنّ $AEDC$ متوازي أضلاع يكفي أن نبيّن أنّ:',
            options: [
              '$\\overrightarrow{AE} = \\overrightarrow{CD}$',
              '$\\overrightarrow{AE} = \\overrightarrow{DC}$',
              '$AE = CD$',
            ],
            correct: 0, cols: 3,
            explain: 'الخاصية: $\\overrightarrow{AB} = \\overrightarrow{DC}$ تعني أنّ $ABCD$ متوازي أضلاع. للرباعي $AEDC$ نقرأ $A$ ثم $E$، ثم نهاية الشعاع الثاني $D$ ثم مبدؤه $C$: $\\overrightarrow{AE} = \\overrightarrow{CD}$. تساوي الطولين وحده لا يكفي.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tasawi-shuaayn'],
            prompt: 'لماذا $\\overrightarrow{AE} = \\overrightarrow{CD}$ ؟',
            options: [
              'الانسحاب نفسه يحوّل $A$ إلى $E$ ويحوّل $C$ إلى $D$ (السؤال 1)',
              'لأنّ $AE = CD$ فقط',
              'لأنّ النقط الأربع على ورقة مرصوفة',
            ],
            correct: 0,
            explain: 'نقطة وصورتها بانسحاب تعرّفان شعاعه: $\\overrightarrow{AE}$ و $\\overrightarrow{CD}$ ممثّلان لنفس الشعاع $\\overrightarrow{BA}$، إذن لهما نفس المنحى ونفس الاتجاه ونفس الطول.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['mulahazat'],
            prompt: 'شعاع من الشكل يساوي الشعاع $\\overrightarrow{AC}$ :',
            options: ['$\\overrightarrow{ED}$', '$\\overrightarrow{DE}$', '$\\overrightarrow{EF}$'],
            correct: 0, cols: 3,
            explain: 'في متوازي الأضلاع $AEDC$ الضلعان $[AC]$ و $[ED]$ متقابلان: من $\\overrightarrow{AE} = \\overrightarrow{CD}$ نستنتج $\\overrightarrow{AC} = \\overrightarrow{ED}$ (4 مربعات نحو اليمين ومربعان نحو الأعلى). $\\overrightarrow{DE}$ اتجاهه معاكس، و $\\overrightarrow{EF}$ شاقولي.' },
          { kind: 'solution', ask: 0, lines: [
            'الانسحاب الذي يحوّل $B$ إلى $A$ يحوّل $A$ إلى $E$ و $C$ إلى $D$، إذن $\\overrightarrow{AE} = \\overrightarrow{CD}$.',
            'النقط $A$ و $E$ و $D$ و $C$ كل ثلاث منها ليست في استقامية، إذن الرباعي $AEDC$ متوازي أضلاع.',
            'ومنه $\\overrightarrow{AC} = \\overrightarrow{ED}$: العارضة بعد الفتح هي $[ED]$، توازي موضعها الأول ولها نفس الطول.',
          ] },
        ],
      },
      {
        label: '3)', title: 'طول السكّة وثمنها',
        question: 'يجب أن تحمل السكّة الباب مغلقًا ومفتوحًا. احسب أصغر طول ممكن للسكّة، ثم ثمنها.',
        asks: ['أصغر طول للسكّة', 'ثمن السكّة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['insihab-shuaa'],
            prompt: 'الباب مغلقًا يشغل القطعة $[AB]$، ومفتوحًا يشغل صورتها. السكّة يجب أن تمتدّ:',
            options: ['من $E$ إلى $B$', 'من $A$ إلى $B$', 'من $E$ إلى $A$'],
            correct: 0, cols: 3,
            explain: 'صورة القطعة $[AB]$ بالانسحاب هي $[EA]$ ($A$ تذهب إلى $E$ و $B$ إلى $A$): السكّة تحمل $[EA]$ و $[AB]$ معًا، أي من $E$ إلى $B$.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'أصغر طول ممكن للسكّة:', expected: 8, suffix: 'm',
            explain: '$EB = EA + AB = 4 + 4 = 8$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ثمن السكّة:', expected: 25600, suffix: 'دج',
            explain: '$8 \\times 3200 = 25600$.' },
          { kind: 'solution', lines: [
            'مغلقًا يشغل الباب $[AB]$، ومفتوحًا يشغل صورتها $[EA]$، إذن تمتدّ السكّة من $E$ إلى $B$.',
            'طولها: $4 + 4 = 8$، أي 8 m.',
            'ثمنها: $8 \\times 3200 = 25600$، أي 25600 دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — مسيّرة تصوير البستان',
    context: 'نقاط تصوير على خطّ مستقيم',
    emoji: '🫒',
    source: SOURCE,
    statement: 'لرسم خريطة لبستان زيتون فيه 480 شجرة، برمج مهندس يتقن عمله مسيّرة تصوير تطير على ارتفاع 40 m في خطّ مستقيم، وتلتقط صورة عند كل نقطة من خطّتها. في الشكل المقابل نقاط الخطّة التي أعدّها مساعده: $P$ و $Q$ و $R$ و $S$، والنقطة $T$ من المستقيم نفسه. تنطلق المسيّرة من $P$، ويجب أن تنتقل من كل نقطة تصوير إلى التي تليها بنفس الحركة: الانسحاب الذي يحوّل $P$ إلى $Q$. المسافة بين $P$ و $Q$ هي 90 m، وتكفي بطارية المسيّرة لطيران 600 m.',
    figure: FIG_SURVEY,
    data: [
      { id: 'move', text: 'من كل نقطة إلى التي تليها: الانسحاب الذي يحوّل P إلى Q', useful: true },
      { id: 'points', text: 'نقاط الخطّة P و Q و R و S على عقد الرصف (الشكل)', useful: true },
      { id: 'pq', text: 'المسافة بين P و Q هي 90 m', useful: true },
      { id: 'battery', text: 'البطارية تكفي لطيران 600 m', useful: true },
      { id: 'trees', text: 'في البستان 480 شجرة', useful: false },
      { id: 'height', text: 'ارتفاع الطيران 40 m', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'خطّة المساعد',
        question: 'هل النقطة $R$ صورة $Q$ بهذا الانسحاب؟ وهل النقطة $S$ صورة $R$ بهذا الانسحاب؟',
        asks: ['هل $R$ صورة $Q$؟', 'هل $S$ صورة $R$؟'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tasawi-shuaayn'],
            prompt: '«$R$ صورة $Q$ بالانسحاب الذي يحوّل $P$ إلى $Q$» معناه:',
            options: [
              '$\\overrightarrow{QR} = \\overrightarrow{PQ}$',
              '$QR = PQ$',
              '$\\overrightarrow{RQ} = \\overrightarrow{PQ}$',
            ],
            correct: 0, cols: 3,
            explain: 'الانسحاب الذي يحوّل $P$ إلى $Q$ يحوّل $Q$ إلى $R$ معناه $\\overrightarrow{QR} = \\overrightarrow{PQ}$: نفس المنحى ونفس الاتجاه ونفس الطول، لا الطول وحده.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'السهم من $P$ إلى $Q$: كم مربعًا نحو اليمين؟', expected: 4,
            explain: '$4 - 0 = 4$.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'وكم مربعًا نحو الأعلى؟', expected: 2,
            explain: '$2 - 0 = 2$.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tasawi-shuaayn'],
            prompt: 'هل $R$ صورة $Q$ بهذا الانسحاب؟',
            options: [
              'نعم: من $Q$ إلى $R$ نجد السهم نفسه، إذن $\\overrightarrow{QR} = \\overrightarrow{PQ}$',
              'لا: لأنّ $R$ ليست على المستقيم $(PQ)$',
              'لا: لأنّ $R$ أبعد عن $P$ من $Q$',
            ],
            correct: 0,
            explain: 'من $Q$ إلى $R$: $8 - 4 = 4$ مربعات نحو اليمين و $4 - 2 = 2$ نحو الأعلى، كالسهم من $P$ إلى $Q$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['shuaa'],
            prompt: 'هل $S$ صورة $R$ بهذا الانسحاب؟',
            options: [
              'لا: لـ $\\overrightarrow{RS}$ و $\\overrightarrow{PQ}$ نفس المنحى ونفس الاتجاه لكن ليس لهما نفس الطول',
              'نعم: لأنّ $S$ على المستقيم $(PQ)$ بعد $R$',
              'لا: لأنّ اتجاه $\\overrightarrow{RS}$ معاكس لاتجاه $\\overrightarrow{PQ}$',
            ],
            correct: 0,
            explain: 'من $R$ إلى $S$: $10 - 8 = 2$ مربعان نحو اليمين و $5 - 4 = 1$ نحو الأعلى، أي نصف السهم من $P$ إلى $Q$: المنحى والاتجاه نفسهما، والطول ليس نفسه، إذن $\\overrightarrow{RS} \\neq \\overrightarrow{PQ}$.' },
          { kind: 'solution', ask: 0, lines: [
            'السهم من $P$ إلى $Q$: 4 مربعات نحو اليمين ومربعان نحو الأعلى، وكذلك من $Q$ إلى $R$: $\\overrightarrow{QR} = \\overrightarrow{PQ}$، إذن $R$ صورة $Q$.',
            'من $R$ إلى $S$: مربعان نحو اليمين ومربع واحد نحو الأعلى: نفس المنحى ونفس الاتجاه لكن الطول ليس نفسه.',
            'إذن $\\overrightarrow{RS} \\neq \\overrightarrow{PQ}$: النقطة $S$ ليست صورة $R$، والمساعد أخطأ في النقطة الرابعة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'سيارة الإسناد',
        question: 'صحّح المهندس الخطّة فجعل نقطة التصوير الرابعة $T$ صورة $R$ بالانسحاب الذي يحوّل $P$ إلى $Q$. لماذا لا تشكّل النقط $P$ و $Q$ و $T$ و $R$ متوازي أضلاع رغم أنّ $\\overrightarrow{PQ} = \\overrightarrow{RT}$؟ يريد المهندس ركن سيارة الإسناد تحت منتصف المسار $[PT]$، فركنها تحت منتصف القطعة $[QR]$. هل أصاب؟',
        asks: ['لماذا لا يتكوّن متوازي أضلاع؟', 'هل أصاب المهندس؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mulahazat'],
            prompt: 'لماذا لا تشكّل النقط $P$ و $Q$ و $T$ و $R$ متوازي أضلاع؟',
            options: [
              'لأنّ النقط الأربع في استقامية: لا يتكوّن رباعي',
              'لأنّ $\\overrightarrow{PQ} \\neq \\overrightarrow{RT}$',
              'لأنّ $PQ \\neq RT$',
            ],
            correct: 0,
            explain: 'المسيّرة تطير في خطّ مستقيم: $P$ و $Q$ و $R$ و $T$ على مستقيم واحد. الخاصية تشترط أن تكون كل ثلاث منها ليست في استقامية، وهنا الحالة الخاصة: متوازي أضلاع «مسطّح».' },
          { kind: 'choice', role: 'translate', requires: ['mulahazat'],
            prompt: 'من أجل كل أربع نقط، $\\overrightarrow{PQ} = \\overrightarrow{RT}$ يعني أيضًا:',
            options: [
              'للقطعتين $[PT]$ و $[QR]$ نفس المنتصف',
              'للقطعتين $[PR]$ و $[QT]$ نفس المنتصف',
              'النقطة $Q$ منتصف القطعة $[PT]$',
            ],
            correct: 0,
            explain: '$\\overrightarrow{AB} = \\overrightarrow{DC}$ معناه للقطعتين $[AC]$ و $[BD]$ نفس المنتصف. مع $A = P$ و $B = Q$ و $D = R$ و $C = T$: القطعتان $[PT]$ و $[QR]$، حتى حين تكون النقط في استقامية.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['mulahazat'],
            prompt: 'هل أصاب المهندس؟',
            options: [
              'نعم: منتصف $[QR]$ هو نفسه منتصف المسار $[PT]$',
              'لا: منتصف المسار $[PT]$ هو النقطة $R$',
              'لا: منتصف المسار $[PT]$ هو النقطة $Q$',
            ],
            correct: 0,
            explain: 'على الشكل: منتصف $[PT]$ يبعد 6 مربعات نحو اليمين و 3 نحو الأعلى عن $P$، وكذلك منتصف $[QR]$ ($4 + 2 = 6$ و $2 + 1 = 3$). النقطة $R$ أبعد من المنتصف.' },
          { kind: 'solution', ask: 1, lines: [
            '$\\overrightarrow{PQ} = \\overrightarrow{RT}$ لكن النقط $P$ و $Q$ و $R$ و $T$ في استقامية (المسيّرة تطير في خطّ مستقيم)، فلا يتكوّن رباعي.',
            'ومع ذلك $\\overrightarrow{PQ} = \\overrightarrow{RT}$ يعني أنّ للقطعتين $[PT]$ و $[QR]$ نفس المنتصف.',
            'إذن أصاب المهندس: سيارة الإسناد تحت منتصف $[QR]$ هي تحت منتصف المسار $[PT]$.',
          ] },
        ],
      },
      {
        label: '3)', title: 'هل تكفي البطارية؟',
        question: 'احسب بالمتر طول المسار $[PT]$. بعد آخر صورة تعود المسيّرة مباشرة إلى $P$: هل تكفي بطاريتها للمهمة كلّها؟',
        asks: ['طول المسار $[PT]$', 'هل تكفي البطارية؟'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tasawi-shuaayn'],
            prompt: 'في الخطّة المصحّحة، أطوال المراحل الثلاث من $P$ إلى $T$:',
            options: [
              'متساوية، لأنّ $\\overrightarrow{PQ} = \\overrightarrow{QR} = \\overrightarrow{RT}$',
              'مختلفة، لأنّ مبادئ الأسهم مختلفة',
              'متساوية، لأنّ النقط في استقامية فقط',
            ],
            correct: 0,
            explain: 'كل مرحلة ممثّل لنفس الشعاع $\\overrightarrow{PQ}$، فطولها 90 m. ولأنّ المراحل على مستقيم واحد وفي نفس الاتجاه، تُجمع أطوالها.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'طول المسار $[PT]$:', expected: 270, suffix: 'm',
            explain: '$3 \\times 90 = 270$.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'المسافة الكلّية للمهمة، ذهابًا وعودة إلى $P$:', expected: 540, suffix: 'm',
            explain: 'العودة مباشرة من $T$ إلى $P$ على نفس المستقيم: $270 + 270 = 540$.' },
          { kind: 'choice', role: 'conclude', ask: 1,
            prompt: 'هل تكفي البطارية؟',
            options: [
              'نعم: المسافة الكلّية أصغر من 600 m، ويبقى هامش 60 m',
              'لا: المسافة الكلّية أكبر من 600 m',
              'نعم: لأنّ طول المسار وحده أصغر من 600 m، ولا تهمّ العودة',
            ],
            correct: 0,
            explain: '$540 < 600$ و $600 - 540 = 60$. لا يكفي مقارنة الذهاب وحده: المسيّرة يجب أن تعود.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\overrightarrow{PQ} = \\overrightarrow{QR} = \\overrightarrow{RT}$ والنقط على مستقيم واحد، إذن $PT = 3 \\times 90 = 270$ m.',
            'مع العودة إلى $P$: $270 + 270 = 540$ m.',
            '$540 < 600$: تكفي البطارية للمهمة كلّها، ويبقى هامش 60 m.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
