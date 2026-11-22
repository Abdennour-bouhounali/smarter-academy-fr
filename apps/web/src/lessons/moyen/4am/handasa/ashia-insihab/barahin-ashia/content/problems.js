/**
 * Les trois « مسائل » du درس 4 « حل مشكلات وإنجاز براهين بتوظيف الأشعة والانسحاب » (modules 5, 6, 7) — des exercices
 * COMPLETS de type امتحان, résolus pas à pas (common/problems/GuidedProblem.jsx).
 *
 * AJOUTS DE LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`) : le manuel ne les contient pas. Ils
 * restent dans le périmètre de la leçon : traduire une donnée en égalité vectorielle, transformer une expression
 * (Chasles, remplacer un vecteur par un vecteur égal que les DONNÉES garantissent, supprimer deux opposés), conclure
 * (parallélogramme, parallèles, milieu), la figure ne prouve pas, construire une somme de vecteurs bout à bout — jamais
 * la multiplication d'un vecteur par un nombre ni les composantes dans un repère (hors leçon).
 * Chaque demande « برهن / بيّن » a SA conclusion à choisir (la chaîne de raisons valide), puis la rédaction.
 *
 *   masala-1  « مسألة الدرس » (LESSON_CONFIG.lessonProblem) : le métro du niveau متقدم (ex-18), d'autres stations —
 *             ABCD parallélogramme de centre O, BE = AO, DF = OC (figure : A(0;0), B(4;0), C(6;4), D(2;4), O(3;2),
 *             E(7;2), F(5;6)) :
 *               OE = OB + BE = OB + AO = AO + OB = AB → ABEO parallélogramme ;
 *               EF = EB + BD + DF = OA + BD + OC = BD + 0⃗ = BD (OA + OC = 0⃗ : O milieu de [AC]) → BDFE parallélogramme ;
 *               EF = BD = 3 km = 3000 m ; 3000 ÷ 250 = 12 semaines. Leurres : 2011, 50 دج.
 *   masala-2  une table pliante (contexte réservé) : pieds [AC] et [BD] de milieu commun O (A(0;0), B(8;0), C(8;6),
 *             D(0;6), O(4;3), 1 unité = 10 cm) :
 *               AB = AO + OB = OC + DO = DO + OC = DC → (DC) // (AB), DC = AB = 80 cm ;
 *               la preuve fautive « OB = OD » (opposés, pas égaux) ;
 *               plateau 80 + 2 × 15 = 110 cm ; 220 = 2 × 110 → 2 plateaux par planche ; 12 ÷ 2 = 6 planches ;
 *               6 × 1200 = 7200 دج. Leurres : 100 cm (les pieds), 6500 دج.
 *   masala-3  une nacelle à ciseaux (contexte réservé), deux étages (A(0;0), B(4;0), C(0;3), D(4;3), E(0;6), F(4;6),
 *             I(2;1,5), J(2;4,5), 1 carreau = 50 cm) :
 *               [AD], [BC] de milieu commun I → ABDC parallélogramme → AB = CD ; [CF], [DE] de milieu J → CDFE → CD = EF ;
 *               AB = EF → ABFE parallélogramme, quelle que soit la hauteur ;
 *               AE = AC + CE, C sur [AE] : 150 + 150 = 300 cm ; 60 + 300 = 360 cm ; 360 + 190 = 550 > 500 (le piège :
 *               300 + 190 = 490 en oubliant le chariot). Leurres : 850 kg, 4000 دج.
 *
 * Chaque égalité (vectorielle sur les coordonnées des figures, numérique) est recalculée dans ./problems.test.js.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

/** La table pliante, vue de côté (1 unité = 10 cm) : pieds [AC] et [BD], plateau sur [DC], sol [AB]. */
const FIG_TABLE = {
  points: { A: [0, 0], B: [8, 0], C: [8, 6], D: [0, 6], O: [4, 3] },
  segments: [{ from: 'A', to: 'C', tone: 'amber' }, { from: 'B', to: 'D', tone: 'amber' }, { from: 'D', to: 'C', tone: 'indigo' }, { from: 'A', to: 'B', dashed: true }],
  labels: { A: 'sw', B: 'se', C: 'ne', D: 'nw', O: 'e' },
  ariaLabel: 'إطار الطاولة من الجانب: الرجلان [AC] و [BD] تتقاطعان في O، والسطح على [DC]، والقدمان A و B على الأرض',
  maxWidth: 340,
};

/** La nacelle à ciseaux, vue de côté (1 carreau = 50 cm) : deux étages de bras croisés, plateau [EF]. */
const FIG_LIFT = {
  points: { A: [0, 0], B: [4, 0], C: [0, 3], D: [4, 3], E: [0, 6], F: [4, 6], I: [2, 1.5], J: [2, 4.5] },
  segments: [{ from: 'A', to: 'B', tone: 'slate' }, { from: 'A', to: 'D', tone: 'amber' }, { from: 'B', to: 'C', tone: 'amber' },
    { from: 'C', to: 'F', tone: 'amber' }, { from: 'D', to: 'E', tone: 'amber' }, { from: 'E', to: 'F', tone: 'indigo' }],
  labels: { A: 'sw', B: 'se', C: 'w', D: 'e', E: 'nw', F: 'ne', I: 's', J: 's' },
  grid: true,
  ariaLabel: 'الرافعة المقصية من الجانب: القاعدة [AB]، الذراعان [AD] و [BC] يتقاطعان في I، والذراعان [CF] و [DE] يتقاطعان في J، والسطح [EF]',
  maxWidth: 300,
};

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — مترو الجزائر',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🚇',
    source: SOURCE,
    statement: LESSON_CONFIG.lessonProblem.statement,
    figure: LESSON_CONFIG.lessonProblem.figure,
    data: [
      { id: 'para', text: 'ABCD متوازي أضلاع مركزه O', useful: true },
      { id: 'be', text: 'تذكرة B نحو E تساوي تذكرة A نحو O', useful: true },
      { id: 'df', text: 'تذكرة D نحو F تساوي تذكرة O نحو C', useful: true },
      { id: 'bd', text: 'طول النفق BD هو 3 km', useful: true },
      { id: 'speed', text: 'تحفر الآلة 250 m في الأسبوع', useful: true },
      { id: 'year', text: 'افتُتح الخط الأول سنة 2011', useful: false },
      { id: 'ticket', text: 'ثمن التذكرة 50 دج', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المحطة E',
        question: 'برهن أنّ $\\overrightarrow{OE} = \\overrightarrow{AB}$ ، ثم استنتج طبيعة الرباعي $ABEO$ .',
        asks: ['برهن أنّ $\\overrightarrow{OE} = \\overrightarrow{AB}$', 'طبيعة الرباعي $ABEO$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['rabt-shal'],
            prompt: 'لنحوّل $\\overrightarrow{OE}$ ، نُدخل محطة تربطه بالمعطيات:',
            options: [
              '$\\overrightarrow{OE} = \\overrightarrow{OB} + \\overrightarrow{BE}$',
              '$\\overrightarrow{OE} = \\overrightarrow{OB} + \\overrightarrow{EB}$',
              '$\\overrightarrow{OE} = \\overrightarrow{OA} + \\overrightarrow{BE}$',
              'نقرأ على الشكل أنّ $[OE]$ و $[AB]$ متوازيتان ومتقايستان',
            ],
            correct: 0,
            explain: 'علاقة شال: من $O$ إلى $B$ ثم من $B$ إلى $E$ ، فنصل إلى $\\overrightarrow{BE}$ الذي تعطيه المعطيات. $\\overrightarrow{EB}$ يعاكس $\\overrightarrow{BE}$ ، و $\\overrightarrow{OA}$ لا ينتهي حيث يبدأ $\\overrightarrow{BE}$ ، والشكل لا يبرهن.' },
          { kind: 'choice', role: 'conclude', requires: ['taawid-musawi'],
            prompt: 'بأيّ شعاع نعوّض $\\overrightarrow{BE}$ ؟',
            options: ['$\\overrightarrow{AO}$ ، حسب تعريف المحطة $E$', '$\\overrightarrow{OA}$ ، حسب تعريف المحطة $E$', '$\\overrightarrow{OD}$ ، لأنّ $O$ منتصف $[BD]$'],
            correct: 0,
            explain: 'المعطى هو $\\overrightarrow{BE} = \\overrightarrow{AO}$ بهذا الاتجاه: من $A$ نحو $O$. ولا شيء يجعل $\\overrightarrow{BE}$ يساوي $\\overrightarrow{OD}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['rabt-shal', 'taawid-musawi', 'shakl-la-yubarhin'],
            prompt: 'أيّ سلسلة تبرهن المطلوب؟',
            options: [
              '$\\overrightarrow{OE} = \\overrightarrow{OB} + \\overrightarrow{BE} = \\overrightarrow{OB} + \\overrightarrow{AO} = \\overrightarrow{AO} + \\overrightarrow{OB} = \\overrightarrow{AB}$',
              '$\\overrightarrow{OE} = \\overrightarrow{OB} + \\overrightarrow{BE} = \\overrightarrow{OB} + \\overrightarrow{OA}$ ، ثم نربطهما فنجد $\\overrightarrow{AB}$',
              'على الشكل $(OE)$ يوازي $(AB)$ و $OE = AB$ ، إذن $\\overrightarrow{OE} = \\overrightarrow{AB}$',
            ],
            correct: 0,
            explain: 'بعد التعويض نرتّب الحدّين ليتتابعا: $\\overrightarrow{AO} + \\overrightarrow{OB} = \\overrightarrow{AB}$ . في السلسلة الثانية عُوّض $\\overrightarrow{BE}$ بالمعاكس، و $\\overrightarrow{OB}$ و $\\overrightarrow{OA}$ لا يتتابعان؛ والثالثة تقرأ الشكل ولا تستعمل المعطيات.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['istintajat'],
            prompt: 'ماذا تستنتج عن الرباعي $ABEO$ ؟',
            options: [
              '$ABEO$ متوازي أضلاع، لأنّ $\\overrightarrow{AB} = \\overrightarrow{OE}$ والنقط $A$ و $B$ و $O$ ليست على استقامة واحدة',
              '$ABOE$ متوازي أضلاع، لأنّ $\\overrightarrow{AB} = \\overrightarrow{OE}$',
              'لا نستنتج شيئًا قبل قياس أضلاعه على الشكل',
            ],
            correct: 0,
            explain: 'من $A$ إلى $B$ كما من $O$ إلى $E$ : الرؤوس بالترتيب $A$ ثم $B$ ثم $E$ ثم $O$ . والرباعي $ABOE$ متقاطع الضلعين.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\overrightarrow{OE} = \\overrightarrow{OB} + \\overrightarrow{BE}$ (علاقة شال).',
            'و $\\overrightarrow{BE} = \\overrightarrow{AO}$ (تعريف $E$)، إذن $\\overrightarrow{OE} = \\overrightarrow{AO} + \\overrightarrow{OB} = \\overrightarrow{AB}$ .',
            '$\\overrightarrow{AB} = \\overrightarrow{OE}$ والنقط $A$ و $B$ و $O$ ليست على استقامة واحدة، إذن الرباعي $ABEO$ متوازي أضلاع.',
          ] },
        ],
      },
      {
        label: '2)', title: 'النفق [EF]',
        question: 'برهن أنّ $\\overrightarrow{EF} = \\overrightarrow{BD}$ . ماذا تستنتج عن النفقين $[EF]$ و $[BD]$ ؟',
        asks: ['برهن أنّ $\\overrightarrow{EF} = \\overrightarrow{BD}$', 'ماذا تستنتج عن النفقين؟'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['rabt-shal'],
            prompt: 'لنستعمل التذكرتين المعطاتين، نكتب $\\overrightarrow{EF}$ رحلةً تمرّ بـ $B$ ثم بـ $D$ :',
            options: [
              '$\\overrightarrow{EF} = \\overrightarrow{EB} + \\overrightarrow{BD} + \\overrightarrow{DF}$',
              '$\\overrightarrow{EF} = \\overrightarrow{BE} + \\overrightarrow{BD} + \\overrightarrow{DF}$',
              '$\\overrightarrow{EF} = \\overrightarrow{EB} + \\overrightarrow{DB} + \\overrightarrow{DF}$',
            ],
            correct: 0,
            explain: 'كل تذكرة تنطلق من حيث وصلت السابقة: $E$ ثم $B$ ثم $D$ ثم $F$ (علاقة شال مرّتين).' },
          { kind: 'choice', role: 'conclude', requires: ['taawid-musawi', 'mutaakisan'],
            prompt: 'نعوّض $\\overrightarrow{EB}$ و $\\overrightarrow{DF}$ حسب المعطيات:',
            options: [
              '$\\overrightarrow{EB} = \\overrightarrow{OA}$ و $\\overrightarrow{DF} = \\overrightarrow{OC}$',
              '$\\overrightarrow{EB} = \\overrightarrow{AO}$ و $\\overrightarrow{DF} = \\overrightarrow{OC}$',
              '$\\overrightarrow{EB} = \\overrightarrow{OA}$ و $\\overrightarrow{DF} = \\overrightarrow{CO}$',
            ],
            correct: 0,
            explain: '$\\overrightarrow{BE} = \\overrightarrow{AO}$ ، ومعاكساهما متساويان: $\\overrightarrow{EB} = \\overrightarrow{OA}$ . و $\\overrightarrow{DF} = \\overrightarrow{OC}$ معطى كما هو.' },
          { kind: 'choice', role: 'conclude', requires: ['mutaakisan-sifr', 'muntasaf-shuaa'],
            prompt: 'ماذا يساوي $\\overrightarrow{OA} + \\overrightarrow{OC}$ ؟ ولماذا؟',
            options: [
              '$\\overrightarrow{0}$ : $O$ منتصف $[AC]$ فـ $\\overrightarrow{OC} = \\overrightarrow{AO}$ ، و $\\overrightarrow{OA}$ و $\\overrightarrow{AO}$ متعاكسان',
              'العدد 0 ، لأنّ $OA = OC$',
              '$\\overrightarrow{AC}$ (علاقة شال)',
            ],
            correct: 0,
            explain: 'مركز متوازي الأضلاع منتصف قطريه: $\\overrightarrow{OA} + \\overrightarrow{OC} = \\overrightarrow{OA} + \\overrightarrow{AO} = \\overrightarrow{OO} = \\overrightarrow{0}$ ، شعاع لا عدد. وعلاقة شال تربط شعاعين متتابعين، و $\\overrightarrow{OA}$ و $\\overrightarrow{OC}$ لهما نفس المبدأ.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['rabt-shal', 'taawid-musawi', 'mutaakisan-sifr'],
            prompt: 'أيّ سلسلة تبرهن المطلوب؟',
            options: [
              '$\\overrightarrow{EF} = \\overrightarrow{EB} + \\overrightarrow{BD} + \\overrightarrow{DF} = \\overrightarrow{OA} + \\overrightarrow{BD} + \\overrightarrow{OC} = \\overrightarrow{BD} + \\overrightarrow{0} = \\overrightarrow{BD}$',
              '$\\overrightarrow{EF} = \\overrightarrow{EB} + \\overrightarrow{BD} + \\overrightarrow{DF} = \\overrightarrow{AO} + \\overrightarrow{BD} + \\overrightarrow{OC}$ ، ثم نحذف $\\overrightarrow{AO}$ و $\\overrightarrow{OC}$ لأنهما متعاكسان',
              'على الشكل $(EF)$ يوازي $(BD)$ ، إذن $\\overrightarrow{EF} = \\overrightarrow{BD}$',
            ],
            correct: 0,
            explain: 'التعويض بالمعطيات ثم حذف المتعاكسين يترك $\\overrightarrow{BD}$ وحده. في السلسلة الثانية $\\overrightarrow{AO}$ و $\\overrightarrow{OC}$ متساويان لا متعاكسان (مجموعهما $\\overrightarrow{AC}$)، والتوازي على الشكل لا يبرهن ولا يعطي تساوي الطولين.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['istintajat', 'tariqat-abdc'],
            prompt: 'ماذا تستنتج عن النفقين؟',
            options: [
              '$(EF)$ يوازي $(BD)$ و $EF = BD$ : الرباعي $BDFE$ متوازي أضلاع',
              '$(EF)$ يوازي $(BD)$ و $EF = BD$ : الرباعي $BDEF$ متوازي أضلاع',
              'النفقان متقاطعان في $O$',
            ],
            correct: 0,
            explain: 'شعاعان متساويان لهما نفس المنحى ونفس الطول؛ و $\\overrightarrow{BD} = \\overrightarrow{EF}$ يعني أنّ $BDFE$ متوازي أضلاع ( $E$ ليست على $(BD)$ ). والرباعي $BDEF$ بهذا الترتيب متقاطع الضلعين.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\overrightarrow{EF} = \\overrightarrow{EB} + \\overrightarrow{BD} + \\overrightarrow{DF}$ (علاقة شال).',
            '$\\overrightarrow{EB} = \\overrightarrow{OA}$ و $\\overrightarrow{DF} = \\overrightarrow{OC}$ ، و $\\overrightarrow{OA} + \\overrightarrow{OC} = \\overrightarrow{0}$ لأنّ $O$ منتصف $[AC]$ .',
            'إذن $\\overrightarrow{EF} = \\overrightarrow{BD}$ : النفقان $[EF]$ و $[BD]$ متوازيان ولهما نفس الطول، و $BDFE$ متوازي أضلاع.',
          ] },
        ],
      },
      {
        label: '3)', title: 'مدّة الحفر',
        question: 'ما طول النفق $[EF]$ ؟ كم أسبوعًا تحتاج الآلة لحفره؟',
        asks: ['طول النفق $[EF]$', 'عدد الأسابيع'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['istintajat'],
            prompt: 'كيف نعرف طول $[EF]$ دون أن نقيسه؟',
            options: [
              'من المساواة الشعاعية التي برهنّاها: شعاعان متساويان لهما نفس الطول',
              'من توازي $(EF)$ و $(BD)$ وحده',
              'بقياسه على الشكل',
            ],
            correct: 0,
            explain: '$\\overrightarrow{EF} = \\overrightarrow{BD}$ : نفس المنحى ونفس الاتجاه ونفس الطول. أمّا مستقيمان متوازيان فقد يحملان قطعتين مختلفتي الطول.' },
          { kind: 'numeric', role: 'answer', ask: 0, prompt: 'طول النفق $[EF]$ بالمتر:', expected: 3000, suffix: 'm',
            explain: '$EF = BD = 3$ km، أي 3000 m.' },
          { kind: 'numeric', role: 'answer', ask: 1, prompt: 'عدد الأسابيع اللازمة:', expected: 12,
            explain: '$3000 \\div 250 = 12$ ، لأنّ $250 \\times 12 = 3000$ .' },
          { kind: 'solution', lines: [
            '$\\overrightarrow{EF} = \\overrightarrow{BD}$ ، إذن $EF = BD = 3$ km، أي 3000 m.',
            '$3000 \\div 250 = 12$ : تحتاج الآلة 12 أسبوعًا لحفر النفق $[EF]$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — الطاولة القابلة للطيّ',
    context: 'رجلان متقاطعتان: هل السطح أفقي؟ وكم ثمن الألواح؟',
    emoji: '🪚',
    source: SOURCE,
    statement: 'يصنع نجّار أمين في ورشته طاولات قابلة للطيّ لمعرض الصناعات التقليدية. يمثّل الشكل المقابل إطار طاولة مفتوحة، من الجانب: الرجلان $[AC]$ و $[BD]$ طول كل منهما 100 cm، ويربطهما مسمار $O$ هو منتصف كل منهما. القدمان $A$ و $B$ على الأرض و $AB = 80$ cm، والسطح الخشبي يُثبَّت على $[DC]$ ويتجاوزه بـ 15 cm من كل جهة. يقطع النجّار السطوح من ألواح طول اللوح منها 220 cm وثمنه 1200 دج، ويبيع الطاولة بـ 6500 دج.',
    figure: FIG_TABLE,
    data: [
      { id: 'mid', text: 'المسمار O منتصف الرجلين AC و BD', useful: true },
      { id: 'feet', text: 'المسافة بين القدمين 80 cm', useful: true },
      { id: 'over', text: 'السطح يتجاوز الإطار بـ 15 cm من كل جهة', useful: true },
      { id: 'plank', text: 'اللوح طوله 220 cm وثمنه 1200 دج', useful: true },
      { id: 'leg', text: 'طول الرجل 100 cm', useful: false },
      { id: 'price', text: 'تُباع الطاولة بـ 6500 دج', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'السطح والأرض',
        question: 'برهن أنّ $\\overrightarrow{AB} = \\overrightarrow{DC}$ ، ثم استنتج وضعية السطح $[DC]$ بالنسبة إلى الأرض وطوله.',
        asks: ['برهن أنّ $\\overrightarrow{AB} = \\overrightarrow{DC}$', 'وضعية السطح $[DC]$ وطوله'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['muntasaf-shuaa'],
            prompt: 'نترجم «$O$ منتصف $[AC]$ ومنتصف $[BD]$» إلى مساواتين شعاعيتين:',
            options: [
              '$\\overrightarrow{AO} = \\overrightarrow{OC}$ و $\\overrightarrow{DO} = \\overrightarrow{OB}$',
              '$\\overrightarrow{AO} = \\overrightarrow{CO}$ و $\\overrightarrow{DO} = \\overrightarrow{BO}$',
              '$\\overrightarrow{AO} = \\overrightarrow{OB}$ و $\\overrightarrow{DO} = \\overrightarrow{OC}$',
            ],
            correct: 0,
            explain: '$O$ منتصف $[AC]$ : من $A$ إلى $O$ كما من $O$ إلى $C$ . والخيار الثالث يخلط بين الرجلين: $O$ ليس منتصف $[AB]$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['rabt-shal', 'taawid-musawi'],
            prompt: 'أيّ سلسلة تبرهن المطلوب؟',
            options: [
              '$\\overrightarrow{AB} = \\overrightarrow{AO} + \\overrightarrow{OB} = \\overrightarrow{OC} + \\overrightarrow{DO} = \\overrightarrow{DO} + \\overrightarrow{OC} = \\overrightarrow{DC}$',
              '$\\overrightarrow{AB} = \\overrightarrow{AO} + \\overrightarrow{OB} = \\overrightarrow{CO} + \\overrightarrow{OD}$ ، ثم نربطهما فنجد $\\overrightarrow{DC}$',
              'على الشكل يبدو $[DC]$ موازيًا لـ $[AB]$ ، إذن $\\overrightarrow{AB} = \\overrightarrow{DC}$',
            ],
            correct: 0,
            explain: 'نُدخل $O$ ، نعوّض بالمعطيات، ثم نرتّب الحدّين ليتتابعا. في السلسلة الثانية عُوّض كل شعاع بمعاكسه (و $\\overrightarrow{CO} + \\overrightarrow{OD}$ يساوي $\\overrightarrow{CD}$ لا $\\overrightarrow{DC}$ )، والثالثة تقرأ الشكل.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['istintajat'],
            prompt: 'ماذا تستنتج عن السطح $[DC]$ ؟',
            options: [
              '$(DC)$ يوازي $(AB)$ : السطح يوازي الأرض، وطوله $DC = AB = 80$ cm',
              '$(DC)$ يوازي $(AB)$ ، وطوله 100 cm مثل الرجل',
              'السطح مائل لأنّ الرجلين مائلتان',
            ],
            correct: 0,
            explain: 'شعاعان متساويان لهما نفس المنحى ونفس الطول: $(DC) \\parallel (AB)$ و $DC = AB$ . وطول الرجل هو $AC$ ، لا $DC$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$O$ منتصف $[AC]$ و $[BD]$ : $\\overrightarrow{AO} = \\overrightarrow{OC}$ و $\\overrightarrow{OB} = \\overrightarrow{DO}$ .',
            '$\\overrightarrow{AB} = \\overrightarrow{AO} + \\overrightarrow{OB} = \\overrightarrow{OC} + \\overrightarrow{DO} = \\overrightarrow{DO} + \\overrightarrow{OC} = \\overrightarrow{DC}$ .',
            'إذن $(DC) \\parallel (AB)$ : السطح يوازي الأرض، وطوله $DC = AB = 80$ cm.',
          ] },
        ],
      },
      {
        label: '2)', title: 'برهان متعلّم',
        question: 'كتب متعلّم في الورشة: «$\\overrightarrow{AB} = \\overrightarrow{AO} + \\overrightarrow{OB}$ ، و $O$ منتصف $[BD]$ إذن $\\overrightarrow{OB} = \\overrightarrow{OD}$ ، ومنه $\\overrightarrow{AB} = \\overrightarrow{OC} + \\overrightarrow{OD}$ ». هل برهانه صحيح؟ عيّن السطر الخاطئ ثم صحّحه.',
        asks: ['هل برهانه صحيح؟', 'عيّن السطر الخاطئ'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['muntasaf-shuaa'],
            prompt: '$O$ منتصف $[BD]$ يعني:',
            options: ['$\\overrightarrow{BO} = \\overrightarrow{OD}$', '$\\overrightarrow{OB} = \\overrightarrow{OD}$', '$\\overrightarrow{BO} = \\overrightarrow{DO}$'],
            correct: 0, cols: 3,
            explain: 'من $B$ إلى $O$ كما من $O$ إلى $D$ . الشعاعان $\\overrightarrow{OB}$ و $\\overrightarrow{OD}$ ينطلقان من $O$ في اتجاهين متعاكسين.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['shakl-la-yubarhin'],
            prompt: 'هل برهان المتعلّم صحيح؟',
            options: ['لا: فيه مساواة شعاعية خاطئة', 'نعم: كل سطر فيه صحيح', 'نعم: لأنّ $OB = OD$ طولًا'],
            correct: 0,
            explain: 'تساوي الطولين لا يكفي لتساوي شعاعين: يلزم نفس المنحى ونفس الاتجاه.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['muntasaf-shuaa', 'mutaakisan'],
            prompt: 'السطر الخاطئ هو:',
            options: [
              'السطر الذي ترجم «$O$ منتصف $[BD]$»: $\\overrightarrow{OB}$ و $\\overrightarrow{OD}$ متعاكسان، والصحيح $\\overrightarrow{OB} = \\overrightarrow{DO}$',
              '«$\\overrightarrow{AB} = \\overrightarrow{AO} + \\overrightarrow{OB}$»: علاقة شال لا تنطبق هنا',
              'السطر الأخير وحده: الحدّان كُتبا بترتيب خاطئ',
            ],
            correct: 0,
            explain: 'علاقة شال صحيحة مهما كانت $O$ ، والخطأ في الاتجاه: $O$ منتصف $[BD]$ يعطي $\\overrightarrow{DO} = \\overrightarrow{OB}$ .' },
          { kind: 'choice', role: 'conclude', requires: ['rabt-shal', 'taawid-musawi'],
            prompt: 'بعد التصحيح، $\\overrightarrow{AO} + \\overrightarrow{OB}$ يساوي:',
            options: [
              '$\\overrightarrow{OC} + \\overrightarrow{DO} = \\overrightarrow{DO} + \\overrightarrow{OC} = \\overrightarrow{DC}$',
              '$\\overrightarrow{OC} + \\overrightarrow{OD}$ ، ولا يُختصر أكثر',
              '$\\overrightarrow{OC} + \\overrightarrow{DO} = \\overrightarrow{CD}$',
            ],
            correct: 0,
            explain: 'نرتّب الحدّين ليتتابعا: نهاية $\\overrightarrow{DO}$ هي $O$ ، مبدأ $\\overrightarrow{OC}$ ؛ فنجد $\\overrightarrow{DC}$ ، من $D$ إلى $C$ .' },
          { kind: 'solution', ask: 1, lines: [
            'البرهان خاطئ: $O$ منتصف $[BD]$ يعطي $\\overrightarrow{OB} = \\overrightarrow{DO}$ ، و $\\overrightarrow{OD}$ معاكس لـ $\\overrightarrow{OB}$ .',
            'التصحيح: $\\overrightarrow{AB} = \\overrightarrow{AO} + \\overrightarrow{OB} = \\overrightarrow{OC} + \\overrightarrow{DO} = \\overrightarrow{DO} + \\overrightarrow{OC} = \\overrightarrow{DC}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'ألواح السطوح',
        question: 'ما طول السطح الخشبي لطاولة واحدة؟ وكم يدفع النجّار ثمنًا للألواح ليصنع 12 طاولة؟',
        asks: ['طول السطح الخشبي', 'ثمن الألواح لـ 12 طاولة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['istintajat'],
            prompt: 'من أين نعرف طول $[DC]$ ؟',
            options: ['من $\\overrightarrow{DC} = \\overrightarrow{AB}$ : الطولان متساويان', 'من طول الرجل', 'نقيسه على الشكل'],
            correct: 0,
            explain: 'برهنّا $\\overrightarrow{DC} = \\overrightarrow{AB}$ ، إذن $DC = AB$ . أمّا 100 cm فهو طول الرجل $AC$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, prompt: 'طول السطح الخشبي بالسنتيمتر:', expected: 110, suffix: 'cm',
            explain: '$80 + 2 \\times 15 = 110$ : طول $[DC]$ وزيادة 15 cm من كل جهة.' },
          { kind: 'numeric', role: 'compute', prompt: 'عدد السطوح التي تُقطع من لوح واحد:', expected: 2,
            explain: '$2 \\times 110 = 220$ : اللوح يعطي سطحين بالضبط.' },
          { kind: 'numeric', role: 'compute', prompt: 'عدد الألواح اللازمة لـ 12 طاولة:', expected: 6,
            explain: '$12 \\div 2 = 6$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, prompt: 'ثمن الألواح:', expected: 7200, suffix: 'دج',
            explain: '$6 \\times 1200 = 7200$ .' },
          { kind: 'solution', lines: [
            '$DC = AB = 80$ cm، فطول السطح $80 + 2 \\times 15 = 110$ cm.',
            'اللوح يعطي سطحين لأنّ $2 \\times 110 = 220$ ، فيلزم $12 \\div 2 = 6$ ألواح.',
            'ثمن الألواح: $6 \\times 1200 = 7200$ ، أي 7200 دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — الرافعة المقصّية',
    context: 'سطح أفقي في كل ارتفاع: هل يصل العامل إلى السقف؟',
    emoji: '🏗️',
    source: SOURCE,
    statement: 'لتعليق ثريّا في سقف قاعة الحفلات، يصعد عامل متعاون مع زملائه على رافعة مقصّية. يمثّل الشكل المقابل الرافعة من الجانب: القاعدة $[AB]$ مثبّتة على عربة ارتفاعها 60 cm عن أرض القاعة؛ الذراعان $[AD]$ و $[BC]$ متقاطعان في $I$ منتصف كل منهما، والذراعان $[CF]$ و $[DE]$ متقاطعان في $J$ منتصف كل منهما؛ ويقف العامل على السطح $[EF]$ . عند الفتح الكامل تكون النقط $A$ و $C$ و $E$ على مستقيم عمودي بهذا الترتيب، مع $AC = CE = 150$ cm. السقف على ارتفاع 5 m، ويبلغ العامل بيده 190 cm فوق السطح. وزن الرافعة 850 kg، وكراؤها 4000 دج في اليوم.',
    figure: FIG_LIFT,
    data: [
      { id: 'i', text: 'الذراعان AD و BC متقاطعان في منتصفهما I', useful: true },
      { id: 'j', text: 'الذراعان CF و DE متقاطعان في منتصفهما J', useful: true },
      { id: 'ace', text: 'A و C و E على مستقيم عمودي و AC = CE = 150 cm', useful: true },
      { id: 'cart', text: 'العربة ارتفاعها 60 cm', useful: true },
      { id: 'reach', text: 'السقف على 5 m ويد العامل تبلغ 190 cm فوق السطح', useful: true },
      { id: 'mass', text: 'وزن الرافعة 850 kg', useful: false },
      { id: 'rent', text: 'كراء الرافعة 4000 دج في اليوم', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'طابقا الرافعة',
        question: 'برهن أنّ $\\overrightarrow{AB} = \\overrightarrow{CD}$ ، ثم بيّن أنّ $\\overrightarrow{AB} = \\overrightarrow{EF}$ .',
        asks: ['برهن أنّ $\\overrightarrow{AB} = \\overrightarrow{CD}$', 'بيّن أنّ $\\overrightarrow{AB} = \\overrightarrow{EF}$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tariqat-abdc'],
            prompt: 'في الرباعي $ABDC$ ، القطعتان $[AD]$ و $[BC]$ هما:',
            options: ['قطراه، ولهما نفس المنتصف $I$', 'ضلعان متقابلان فيه', 'قطراه، وهما متعامدان'],
            correct: 0,
            explain: 'رؤوس $ABDC$ بالترتيب $A$ ، $B$ ، $D$ ، $C$ : $[AD]$ و $[BC]$ يصلان رأسين غير متتاليين، وهما الذراعان المتقاطعان في منتصفهما $I$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tariqat-abdc', 'khatawat-burhan'],
            prompt: 'أيّ تعليل يبرهن المطلوب الأول؟',
            options: [
              'قطرا الرباعي $ABDC$ متناصفان في $I$ ، إذن $ABDC$ متوازي أضلاع، ومنه $\\overrightarrow{AB} = \\overrightarrow{CD}$',
              'قطرا الرباعي $ABCD$ متناصفان في $I$ ، إذن $ABCD$ متوازي أضلاع، ومنه $\\overrightarrow{AB} = \\overrightarrow{DC}$',
              'على الشكل $[CD]$ أفقي مثل $[AB]$ وله نفس الطول، إذن $\\overrightarrow{AB} = \\overrightarrow{CD}$',
            ],
            correct: 0,
            explain: 'طريقة الكتاب: لإثبات $\\overrightarrow{AB} = \\overrightarrow{CD}$ يكفي إثبات أنّ $ABDC$ متوازي أضلاع، وقطراه $[AD]$ و $[BC]$ متناصفان. أمّا $[AC]$ و $[BD]$ فليسا الذراعين.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tariqat-abdc', 'taawid-musawi'],
            prompt: 'كيف نصل إلى المطلوب الثاني؟',
            options: [
              'بنفس الطريقة في الطابق الثاني: قطرا $CDFE$ متناصفان في $J$ فـ $\\overrightarrow{CD} = \\overrightarrow{EF}$ ، ومع المساواة الأولى $\\overrightarrow{AB} = \\overrightarrow{EF}$',
              'بعلاقة شال: $\\overrightarrow{AB} = \\overrightarrow{AE} + \\overrightarrow{EF}$ ، إذن $\\overrightarrow{AB} = \\overrightarrow{EF}$',
              'قطرا $CDEF$ متناصفان في $J$ ، فـ $\\overrightarrow{CD} = \\overrightarrow{FE}$',
            ],
            correct: 0,
            explain: 'شعاعان يساويان شعاعًا ثالثًا متساويان. وعلاقة شال تعطي $\\overrightarrow{AE} + \\overrightarrow{EF} = \\overrightarrow{AF}$ ، لا $\\overrightarrow{AB}$ ؛ والرباعي $CDEF$ بهذا الترتيب متقاطع الضلعين.' },
          { kind: 'solution', ask: 0, lines: [
            '$[AD]$ و $[BC]$ قطرا الرباعي $ABDC$ ولهما نفس المنتصف $I$ : $ABDC$ متوازي أضلاع، إذن $\\overrightarrow{AB} = \\overrightarrow{CD}$ .',
            'وبالمثل $[CF]$ و $[DE]$ قطرا $CDFE$ ولهما نفس المنتصف $J$ : $\\overrightarrow{CD} = \\overrightarrow{EF}$ .',
            'إذن $\\overrightarrow{AB} = \\overrightarrow{EF}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'السطح في كل ارتفاع',
        question: 'استنتج طبيعة الرباعي $ABFE$ . هل يبقى السطح $[EF]$ موازيًا للقاعدة $[AB]$ مهما كان ارتفاع الرافعة؟',
        asks: ['طبيعة الرباعي $ABFE$', 'هل يبقى السطح موازيًا للقاعدة؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['istintajat'],
            prompt: 'طبيعة الرباعي $ABFE$ :',
            options: [
              'متوازي أضلاع، لأنّ $\\overrightarrow{AB} = \\overrightarrow{EF}$ والنقط $A$ و $B$ و $E$ ليست على استقامة واحدة',
              'لا نعرف: يلزم أن نقيس زواياه',
              'شبه منحرف فقط، لأنّ ضلعيه $[AE]$ و $[BF]$ لا نعرف عنهما شيئًا',
            ],
            correct: 0,
            explain: 'من $A$ إلى $B$ كما من $E$ إلى $F$ : $ABFE$ متوازي أضلاع، فيه $(EF) \\parallel (AB)$ و $\\overrightarrow{AE} = \\overrightarrow{BF}$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['shakl-la-yubarhin', 'khatawat-burhan'],
            prompt: 'هل يبقى السطح موازيًا للقاعدة عندما ترتفع الرافعة أو تنخفض؟',
            options: [
              'نعم: البرهان لم يستعمل إلا أنّ $I$ و $J$ منتصفا الذراعين، وهذا صحيح في كل وضعية',
              'لا: يكون موازيًا فقط في الوضعية المرسومة على الشكل',
              'نعم: لأنّ الذراعين يبدوان متقايسين على الشكل',
            ],
            correct: 0,
            explain: 'البرهان لا يعتمد على الشكل المرسوم ولا على زاوية الذراعين: ما دامت $I$ و $J$ منتصفين، يبقى $\\overrightarrow{AB} = \\overrightarrow{EF}$ ، فالعامل يقف على سطح يوازي القاعدة.' },
          { kind: 'solution', ask: 1, lines: [
            '$\\overrightarrow{AB} = \\overrightarrow{EF}$ والنقط $A$ و $B$ و $E$ ليست على استقامة واحدة، إذن $ABFE$ متوازي أضلاع و $(EF) \\parallel (AB)$ .',
            'البرهان لم يستعمل إلا أنّ $I$ و $J$ منتصفا الذراعين، وهذا يبقى صحيحًا في كل ارتفاع: السطح يبقى موازيًا للقاعدة.',
          ] },
        ],
      },
      {
        label: '3)', title: 'هل يصل العامل؟',
        question: 'عبّر عن $\\overrightarrow{AE}$ بمجموع شعاعين، ثم احسب ارتفاع السطح $[EF]$ عن أرض القاعة. هل يصل العامل إلى السقف؟',
        asks: ['$\\overrightarrow{AE}$ مجموع شعاعين', 'ارتفاع السطح عن أرض القاعة', 'هل يصل العامل إلى السقف؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['rabt-shal', 'insha-majmu'],
            prompt: 'نكتب $\\overrightarrow{AE}$ مجموعَ شعاعين يمرّ بالنقطة $C$ :',
            options: [
              '$\\overrightarrow{AE} = \\overrightarrow{AC} + \\overrightarrow{CE}$',
              '$\\overrightarrow{AE} = \\overrightarrow{AC} + \\overrightarrow{EC}$',
              '$\\overrightarrow{AE} = \\overrightarrow{CA} + \\overrightarrow{CE}$',
            ],
            correct: 0,
            explain: 'علاقة شال: من $A$ إلى $C$ ثم من $C$ إلى $E$ ؛ ممثّل $\\overrightarrow{CE}$ يبدأ من نهاية ممثّل $\\overrightarrow{AC}$ .' },
          { kind: 'choice', role: 'conclude', requires: ['istintajat'],
            prompt: 'لماذا يحقّ هنا أن نجمع الطولين $AC$ و $CE$ ؟',
            options: [
              'لأنّ $C$ تقع على $[AE]$ : للشعاعين $\\overrightarrow{AC}$ و $\\overrightarrow{CE}$ نفس المنحى ونفس الاتجاه',
              'لأنّ علاقة شال تجمع الأطوال دائمًا',
              'لأنّ $AC = CE$',
            ],
            correct: 0,
            explain: 'علاقة شال صحيحة مهما كانت $C$ ، لكنّ الأطوال لا تُجمع إلا إذا كانت $C$ على القطعة $[AE]$ ؛ وهنا $A$ و $C$ و $E$ على مستقيم عمودي بهذا الترتيب.' },
          { kind: 'numeric', role: 'compute', prompt: 'الطول $AE$ بالسنتيمتر:', expected: 300, suffix: 'cm',
            explain: '$150 + 150 = 300$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, prompt: 'ارتفاع السطح عن أرض القاعة بالسنتيمتر:', expected: 360, suffix: 'cm',
            explain: '$60 + 300 = 360$ : العربة ثم الطابقان.' },
          { kind: 'numeric', role: 'compute', prompt: 'أعلى ارتفاع تبلغه يد العامل عن أرض القاعة بالسنتيمتر:', expected: 550, suffix: 'cm',
            explain: '$360 + 190 = 550$ .' },
          { kind: 'choice', role: 'conclude', ask: 2,
            prompt: 'هل يصل العامل إلى السقف؟',
            options: [
              'نعم: يده تبلغ 550 cm والسقف على 500 cm',
              'لا: يده تبلغ 490 cm فقط، والسقف على 500 cm',
              'لا: يده تبلغ 340 cm فقط',
            ],
            correct: 0,
            explain: '$550 > 500$ . من وجد 490 نسي العربة ( $300 + 190 = 490$ )، ومن وجد 340 حسب طابقًا واحدًا ( $150 + 190 = 340$ ).' },
          { kind: 'solution', ask: 1, lines: [
            '$\\overrightarrow{AE} = \\overrightarrow{AC} + \\overrightarrow{CE}$ و $C$ على $[AE]$ ، إذن $AE = 150 + 150 = 300$ cm.',
            'ارتفاع السطح عن أرض القاعة: $60 + 300 = 360$ cm.',
            'يد العامل تبلغ $360 + 190 = 550$ cm و $550 > 500$ : يصل العامل إلى السقف ويعلّق الثريّا.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
