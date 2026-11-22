/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي — الوحدة 12 « الأشعة في معلم » (modules 1 à 6) — des situations COMPLÈTES de
 * type امتحان, résolues pas à pas (common/problems/GuidedProblem.jsx), AVANT la وضعية du manuel (module 7 « الوضعية
 * وتحليلها ») et le إختبار أولي (module 10).
 *
 * Décision du propriétaire (2026-10-13), étendue de l'unité 1 (`wadiya-idmajiya-aadad`) à toutes les synthèses : que l'élève
 * s'exerce sur beaucoup de situations avant celle sur laquelle il est évalué. Ce sont des AJOUTS DE LA PLATEFORME, déclarés
 * comme tels (`addition('exam_style_problem')`), jamais présentés comme des exercices du manuel. Aucune ne reprend les
 * nombres de la وضعية des coureurs (p. 148), du lab `route-compare`, des exercices 22, 23, 25 ni du إختبار أولي
 * (Constantine) : problems.test.js le vérifie.
 *
 * Périmètre : exactement celui de la synthèse — lire un point, les composantes d'un شعاع et l'égalité de deux أشعة (دروس
 * 1–2), le milieu et la distance (درس 3), la nature d'un triangle ou d'un quadrilatère par le calcul (درس 4), la longueur
 * d'un demi-cercle π r et la valeur approchée d'une racine. Jamais de produit scalaire, jamais d'équation de cercle.
 *
 *   1 المكتبة المتنقلة   (sky)     composantes, point inconnu d'un متوازي أضلاع, périmètre          — العلم والقراءة
 *   2 البئر المشتركة    (indigo)  milieu, distance, triangle rectangle isocèle                    — التكافل
 *   3 ممرّ ساحة المدرسة (amber)   demi-cercle contre ligne brisée (arrondir à la fin)              — النظافة وإتقان العمل
 *   4 الجدارية          (emerald) vecteurs égaux, converse de Pythagore, rectangle, aire, coût     — التعاون
 *   5 فنار الشاطئ       (teal)    distance, point intérieur ou extérieur, translation              — حبّ الوطن
 *   6 حقل الزيتون       (violet)  milieux des diagonales, losange, aire                           — برّ الوالدين
 *
 * Chaque figure (content/figures.js › TRAIN1…6) ne porte que les données de l'énoncé : jamais le point cherché ni une
 * longueur calculée. Chaque nombre est recalculé dans ./problems.test.js. Aucune sous-étape n'est une `assessment` : la
 * maîtrise vient du إختبار أولي seulement.
 */
import { addition } from '../../_unit/unitMeta.js';
import { TRAIN1, TRAIN2, TRAIN3, TRAIN4, TRAIN5, TRAIN6 } from './figures.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  // ── 1 ─ la bibliothèque itinérante : composantes, quatrième sommet d'un متوازي أضلاع, périmètre ──
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — المكتبة المتنقلة',
    context: 'محطة رابعة تتمّ متوازي أضلاع',
    emoji: '📚',
    source: SOURCE,
    tone: 'sky',
    figure: TRAIN1,
    statement: 'تنقل المكتبة المتنقلة لبلدية الهضاب الكتب إلى القرى، فمديرها يؤمن بأنّ القراءة تفتح لكل تلميذ أبواب العلم. في معلم متعامد ومتجانس (كل مربّع من المرصوفة يمثّل $1\\,\\mathrm{km}$ ) تقع المحطات $A(-4\\,;\\,1)$ و $B(-1\\,;\\,3)$ و $C(1\\,;\\,-2)$ كما في الشكل. تريد البلدية فتح محطة رابعة $D$ بحيث يكون الرباعي $ABCD$ متوازي أضلاع، ثم تنظّم جولة تمرّ بالمحطات $A$ ثم $B$ ثم $C$ ثم $D$ وتعود إلى $A$ .',
    parts: [
      {
        label: '1)', title: 'مركبتا الشعاع',
        question: 'احسب مركبتي الشعاع $\\overrightarrow{AB}$ .',
        asks: ['المركبة الأفقية للشعاع $\\overrightarrow{AB}$', 'المركبة العمودية للشعاع $\\overrightarrow{AB}$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['hisab-murakkibat'],
            prompt: 'كيف نحسب مركبتي الشعاع $\\overrightarrow{AB}$ بدلالة إحداثيات طرفيه؟',
            options: [
              '$(x_B - x_A\\,;\\,y_B - y_A)$',
              '$(x_A - x_B\\,;\\,y_A - y_B)$',
              '$(x_A + x_B\\,;\\,y_A + y_B)$',
              '$(x_B - x_A\\,;\\,y_A - y_B)$',
            ],
            correct: 0, cols: 2,
            explain: 'مركبتا $\\overrightarrow{AB}$ هما إحداثيات النهاية ناقص إحداثيات المبدأ، كل واحدة على حدة. $(x_A - x_B\\,;\\,y_A - y_B)$ هما مركبتا الشعاع المعاكس $\\overrightarrow{BA}$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-murakkibat'],
            prompt: 'المركبة الأفقية $x_B - x_A$ :', expected: 3,
            explain: '$x_B - x_A = -1 - (-4) = 3$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hisab-murakkibat'],
            prompt: 'المركبة العمودية $y_B - y_A$ :', expected: 2,
            explain: '$y_B - y_A = 3 - 1 = 2$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$\\overrightarrow{AB}\\begin{pmatrix} x_B - x_A \\\\ y_B - y_A \\end{pmatrix}$ أي $\\overrightarrow{AB}\\begin{pmatrix} -1 - (-4) \\\\ 3 - 1 \\end{pmatrix}$ .',
            'إذن $\\overrightarrow{AB}\\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'المحطة الرابعة',
        question: 'عيّن إحداثيتي المحطة $D$ حتى يكون $ABCD$ متوازي أضلاع.',
        asks: ['فاصلة المحطة $D$', 'ترتيب المحطة $D$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['mutawazi-tartib'],
            prompt: 'الرباعي $ABCD$ متوازي أضلاع. أيّ تساوي شعاعين نكتب؟',
            options: [
              '$\\overrightarrow{AB} = \\overrightarrow{DC}$',
              '$\\overrightarrow{AB} = \\overrightarrow{CD}$',
              '$\\overrightarrow{AB} = \\overrightarrow{BC}$',
              '$\\overrightarrow{AB} = \\overrightarrow{AD}$',
            ],
            correct: 0, cols: 2,
            explain: 'في $ABCD$ الضلعان المتقابلان $[AB]$ و $[DC]$ متوازيان ومتقايسان وبنفس الاتجاه: $\\overrightarrow{AB} = \\overrightarrow{DC}$ . أمّا $\\overrightarrow{AB} = \\overrightarrow{CD}$ فيعني أنّ $ABDC$ هو متوازي الأضلاع (ترتيب الرؤوس).' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-murakkibat'],
            prompt: 'فاصلة $D$ :', expected: -2,
            explain: '$\\overrightarrow{DC}$ مركبتاه $1 - x_D$ و $-2 - y_D$ ، ويساوي $\\overrightarrow{AB}\\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix}$ . من $1 - x_D = 3$ نجد $x_D = -2$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hisab-murakkibat'],
            prompt: 'ترتيب $D$ :', expected: -4,
            explain: 'من $-2 - y_D = 2$ نجد $y_D = -4$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$ABCD$ متوازي أضلاع، إذن $\\overrightarrow{AB} = \\overrightarrow{DC}$ أي $x_C - x_D = 3$ و $y_C - y_D = 2$ .',
            '$1 - x_D = 3$ و $-2 - y_D = 2$ ، إذن $x_D = -2$ و $y_D = -4$ .',
            'المحطة الرابعة هي $D(-2\\,;\\,-4)$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'طول الجولة',
        question: 'احسب طول الجولة $A \\to B \\to C \\to D \\to A$ بالكيلومتر، مدوّرًا إلى $0{,}01$ .',
        asks: ['طول الجولة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'مربّع الطول $AB^2$ :', expected: 13,
            explain: '$\\overrightarrow{AB}\\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix}$ ومنه $AB^2 = 3^2 + 2^2 = 13$ .' },
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'مربّع الطول $BC^2$ :', expected: 29,
            explain: '$\\overrightarrow{BC}\\begin{pmatrix} 2 \\\\ -5 \\end{pmatrix}$ ومنه $BC^2 = 2^2 + (-5)^2 = 29$ .' },
          { kind: 'choice', role: 'conclude', requires: ['mutawazi-tartib'],
            prompt: 'ماذا نعرف عن طولي الضلعين $[CD]$ و $[DA]$ دون حساب جديد؟',
            options: [
              '$CD = AB$ و $DA = BC$ : في متوازي الأضلاع الضلعان المتقابلان متقايسان',
              '$CD = BC$ و $DA = AB$ : الضلعان المتجاوران متقايسان',
              '$CD = DA$ لأنّهما يلتقيان في $D$',
            ],
            correct: 0,
            explain: 'تساوي الشعاعين $\\overrightarrow{AB} = \\overrightarrow{DC}$ يعطي $AB = DC$ ، وكذلك $BC = AD$ . أمّا الضلعان المتجاوران فلا يتقايسان في متوازي أضلاع عادي.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qima-muqarraba'],
            prompt: 'طول الجولة مدوّرًا إلى $0{,}01\\,\\mathrm{km}$ :', expected: 17.98, suffix: 'km',
            explain: '$2\\sqrt{13} + 2\\sqrt{29} \\approx 7{,}2111 + 10{,}7703 \\approx 17{,}98$ . تدوير الجذرين قبل الجمع ( $3{,}61$ و $5{,}39$ ) يعطي $18{,}00$ : نقرّب في الأخير فقط.' },
          { kind: 'solution', ask: 0, lines: [
            '$AB = \\sqrt{3^2 + 2^2} = \\sqrt{13}$ و $BC = \\sqrt{2^2 + (-5)^2} = \\sqrt{29}$ .',
            'في متوازي الأضلاع $CD = AB$ و $DA = BC$ ، فطول الجولة $2\\,(AB + BC) = 2\\sqrt{13} + 2\\sqrt{29}$ .',
            'طول الجولة حوالي $17{,}98\\,\\mathrm{km}$ (نقرّب في الأخير فقط).',
          ] },
        ],
      },
    ],
  },

  // ── 2 ─ le puits commun : milieu, distance, triangle rectangle isocèle ──
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — البئر المشتركة',
    context: 'بئر في منتصف المسافة بين قريتين',
    emoji: '💧',
    source: SOURCE,
    tone: 'indigo',
    figure: TRAIN2,
    statement: 'قريتان في أعالي الأوراس، $A$ و $B$ ، تتكافلان فتحفران معًا بئرًا مشتركة في منتصف القطعة $[AB]$ ، فلا يبقى أحد بلا ماء. في معلم متعامد ومتجانس (كل مربّع من المرصوفة يمثّل $1\\,\\mathrm{km}$ ) إحداثيات القريتين $A(-4\\,;\\,-1)$ و $B(4\\,;\\,3)$ ، وتقع المدرسة الجديدة $C(2\\,;\\,-3)$ كما في الشكل.',
    parts: [
      {
        label: '1)', title: 'موقع البئر',
        question: 'احسب إحداثيتي النقطة $I$ ، موقع البئر.',
        asks: ['فاصلة البئر $I$', 'ترتيب البئر $I$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['muntasaf-qita'],
            prompt: 'البئر في منتصف $[AB]$ . كيف نحسب إحداثيتي $I$ ؟',
            options: [
              '$\\left(\\dfrac{x_A + x_B}{2}\\,;\\,\\dfrac{y_A + y_B}{2}\\right)$',
              '$\\left(\\dfrac{x_B - x_A}{2}\\,;\\,\\dfrac{y_B - y_A}{2}\\right)$',
              '$(x_A + x_B\\,;\\,y_A + y_B)$',
              '$\\left(\\dfrac{x_A + y_A}{2}\\,;\\,\\dfrac{x_B + y_B}{2}\\right)$',
            ],
            correct: 0, cols: 2,
            explain: 'إحداثيتا المنتصف هما نصف مجموع الفاصلتين ونصف مجموع الترتيبين. $\\dfrac{x_B - x_A}{2}$ هو نصف مركبة الشعاع $\\overrightarrow{AB}$ ، لا فاصلة المنتصف.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['muntasaf-qita'],
            prompt: 'فاصلة $I$ :', expected: 0,
            explain: '$x_I = \\dfrac{-4 + 4}{2} = 0$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['muntasaf-qita'],
            prompt: 'ترتيب $I$ :', expected: 1,
            explain: '$y_I = \\dfrac{-1 + 3}{2} = 1$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$I$ منتصف $[AB]$ ، إذن $x_I = \\dfrac{x_A + x_B}{2} = \\dfrac{-4 + 4}{2} = 0$ و $y_I = \\dfrac{y_A + y_B}{2} = \\dfrac{-1 + 3}{2} = 1$ .',
            'البئر المشتركة في النقطة $I(0\\,;\\,1)$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'المسافات',
        question: 'احسب المسافة $AB$ بالكيلومتر (القيمة المضبوطة)، ثم استنتج المسافة بين كل قرية والبئر مدوّرة إلى $0{,}01$ .',
        asks: ['المسافة $AB$', 'المسافة بين كل قرية والبئر'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'مربّع الطول $AB^2$ :', expected: 80,
            explain: '$\\overrightarrow{AB}\\begin{pmatrix} 8 \\\\ 4 \\end{pmatrix}$ ومنه $AB^2 = 8^2 + 4^2 = 64 + 16 = 80$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['masafa-nuqtatayn'],
            prompt: 'المسافة $AB$ بالكيلومتر:',
            options: [
              '$4\\sqrt{5} \\approx 8{,}94$',
              '$80$',
              '$12$',
              '$\\sqrt{40} \\approx 6{,}32$',
            ],
            correct: 0, cols: 2,
            explain: '$AB = \\sqrt{80} = \\sqrt{16 \\times 5} = 4\\sqrt{5} \\approx 8{,}94$ . العدد 80 هو $AB^2$ (نسيان الجذر)، و 12 هو $8 + 4$ (جمع الفرقين)، و $\\sqrt{40}$ نصف المربّع قبل الجذر.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['muntasaf-qita'], suffix: 'km',
            prompt: 'المسافة $AI$ بين القرية $A$ والبئر مدوّرة إلى $0{,}01$ :', expected: 4.47,
            explain: '$I$ منتصف $[AB]$ ، إذن $AI = IB = \\dfrac{AB}{2} = 2\\sqrt{5} \\approx 4{,}47$ . وللتحقّق: $AI = \\sqrt{4^2 + 2^2} = \\sqrt{20}$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$AB = \\sqrt{(4 - (-4))^2 + (3 - (-1))^2} = \\sqrt{64 + 16} = \\sqrt{80} = 4\\sqrt{5}\\,\\mathrm{km}$ .',
            '$I$ منتصف $[AB]$ ، إذن $AI = IB = \\dfrac{AB}{2} = 2\\sqrt{5}$ .',
            'تبعد كل قرية عن البئر حوالي $4{,}47\\,\\mathrm{km}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'موقع المدرسة',
        question: 'بيّن أنّ $CA = CB$ ، ثم بيّن أنّ المثلث $ABC$ قائم.',
        asks: ['المثلث $ABC$ متساوي الساقين', 'المثلث $ABC$ قائم'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'مربّع الطول $CA^2$ :', expected: 40,
            explain: '$\\overrightarrow{CA}\\begin{pmatrix} -6 \\\\ 2 \\end{pmatrix}$ ومنه $CA^2 = (-6)^2 + 2^2 = 36 + 4 = 40$ .' },
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'مربّع الطول $CB^2$ :', expected: 40,
            explain: '$\\overrightarrow{CB}\\begin{pmatrix} 2 \\\\ 6 \\end{pmatrix}$ ومنه $CB^2 = 2^2 + 6^2 = 4 + 36 = 40$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['masafa-nuqtatayn'],
            prompt: 'بمقارنة $CA^2$ و $CB^2$ ، ماذا نستنتج بخصوص الطولين $CA$ و $CB$ ؟',
            options: [
              'الطولان متساويان: المثلث $ABC$ متساوي الساقين رأسه $C$',
              'الطولان متساويان: لذلك $C$ منتصف $[AB]$',
              'الطولان مختلفان',
            ],
            correct: 0,
            explain: 'مربّعا عددين موجبين متساويان فالعددان متساويان: $CA = CB$ . هذا لا يعني أنّ $C$ على القطعة $[AB]$ ، فمنتصفها هو $I(0\\,;\\,1)$ .' },
          { kind: 'numeric', role: 'compute', requires: ['aks-fithaghuris'],
            prompt: 'قيمة المجموع $CA^2 + CB^2$ :', expected: 80,
            explain: '$CA^2 + CB^2 = 40 + 40 = 80$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['aks-fithaghuris'],
            prompt: 'بمقارنة هذا المجموع مع $AB^2$ (المحسوب في السؤال 2)، ما طبيعة المثلث $ABC$ ؟',
            options: [
              'قائم في $C$ ، لأنّ $CA^2 + CB^2 = AB^2$ (عكس خاصية فيثاغورس)',
              'قائم في $A$ ، لأنّ $CA^2 + CB^2 = AB^2$',
              'ليس قائمًا',
            ],
            correct: 0,
            explain: 'الضلع الأطول $[AB]$ يقابل الزاوية القائمة، فهي في الرأس $C$ . فالمدرسة تبعد عن القريتين بالقدر نفسه، والمثلث قائم ومتساوي الساقين.' },
          { kind: 'solution', ask: 0, lines: [
            '$CA^2 = (-6)^2 + 2^2 = 40$ و $CB^2 = 2^2 + 6^2 = 40$ ، إذن $CA = CB$ : المثلث $ABC$ متساوي الساقين رأسه $C$ .',
            '$CA^2 + CB^2 = 40 + 40 = 80$ و $AB^2 = 80$ ، أي $CA^2 + CB^2 = AB^2$ .',
            'حسب عكس خاصية فيثاغورس المثلث $ABC$ قائم في $C$ ، وهو قائم ومتساوي الساقين.',
          ] },
        ],
      },
    ],
  },

  // ── 3 ─ la cour de l'école : demi-cercle contre ligne brisée ──
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — ممرّ ساحة المدرسة',
    context: 'أيّ الممرّين أقصر لتنظيفه؟',
    emoji: '🧹',
    source: SOURCE,
    tone: 'amber',
    figure: TRAIN3,
    statement: 'في ساحة المدرسة حوض أزهار نصف دائري قطره $[AB]$ . يحرص السيد فريد، عامل النظافة، على إتقان عمله، فينظّف كل صباح ممرًّا بين البابين $A$ و $B$ ويتردّد بين مسارين: المسار (1) نصف دائرة قطرها $[AB]$ تمرّ فوق القطر، والمسار (2) الخط المنكسر $ACB$ . في معلم متعامد ومتجانس (كل مربّع من المرصوفة يمثّل $1\\,\\mathrm{m}$ ) نعطي $A(-3\\,;\\,1)$ و $B(3\\,;\\,1)$ و $C(1\\,;\\,5)$ كما في الشكل.',
    parts: [
      {
        label: '1)', title: 'طول المسار (1)',
        question: 'احسب طول المسار (1) (طول القوس وحده) مدوّرًا إلى $0{,}01$ .',
        asks: ['طول المسار (1)'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'طول القطر $AB$ بالمتر:', expected: 6,
            explain: 'للنقطتين $A$ و $B$ الترتيب نفسه، فـ $AB = 3 - (-3) = 6$ .' },
          { kind: 'numeric', role: 'compute', requires: ['tul-nisf-daira'],
            prompt: 'نصف القطر $r$ بالمتر:', expected: 3,
            explain: '$r = \\dfrac{AB}{2} = \\dfrac{6}{2} = 3$ .' },
          { kind: 'choice', role: 'translate', requires: ['tul-nisf-daira'],
            prompt: 'طول نصف دائرة نصف قطرها $r$ هو:',
            options: ['$\\pi r$', '$2\\pi r$', '$\\pi r^2$', '$\\pi \\times AB$'],
            correct: 0, cols: 2,
            explain: 'محيط الدائرة الكاملة $2\\pi r$ ونصف الدائرة نصفه: $\\pi r$ . العامل يمشي على القوس لا على القطر.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qima-muqarraba'],
            prompt: 'طول المسار (1) مدوّرًا إلى $0{,}01\\,\\mathrm{m}$ :', expected: 9.42, suffix: 'm',
            explain: '$\\pi \\times 3 = 3\\pi \\approx 9{,}42$ . أمّا $6\\pi \\approx 18{,}85$ فمحيط دائرة كاملة نصف قطرها 3.' },
          { kind: 'solution', ask: 0, lines: [
            '$AB = 3 - (-3) = 6$ ، فنصف القطر $r = \\dfrac{6}{2} = 3$ .',
            'المسار (1) نصف دائرة، طوله $\\pi r = 3\\pi$ .',
            'طول المسار (1) حوالي $9{,}42\\,\\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'طول المسار (2)',
        question: 'احسب طول المسار (2) مدوّرًا إلى $0{,}01$ .',
        asks: ['طول المسار (2)'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'مربّع الطول $AC^2$ :', expected: 32,
            explain: '$\\overrightarrow{AC}\\begin{pmatrix} 4 \\\\ 4 \\end{pmatrix}$ ومنه $AC^2 = 4^2 + 4^2 = 32$ .' },
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'مربّع الطول $CB^2$ :', expected: 20,
            explain: '$\\overrightarrow{CB}\\begin{pmatrix} 2 \\\\ -4 \\end{pmatrix}$ ومنه $CB^2 = 2^2 + (-4)^2 = 20$ .' },
          { kind: 'choice', role: 'conclude', requires: ['masafa-nuqtatayn'],
            prompt: 'طول الخط المنكسر $ACB$ هو:',
            options: [
              '$\\sqrt{32} + \\sqrt{20}$',
              '$\\sqrt{32 + 20}$',
              '$8 + 6$ (مجموع فرقي الإحداثيتين في كل قطعة)',
            ],
            correct: 0,
            explain: 'طول الخط المنكسر مجموع أطوال قطعه، وطول كل قطعة جذر مجموع مربّعي الفرقين. $\\sqrt{32 + 20}$ جذر المجموع لا مجموع الجذرين، و $8 + 6$ طول الطريق على أضلاع المرصوفة.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qima-muqarraba'],
            prompt: 'طول المسار (2) مدوّرًا إلى $0{,}01\\,\\mathrm{m}$ :', expected: 10.13, suffix: 'm',
            explain: '$\\sqrt{32} + \\sqrt{20} \\approx 5{,}657 + 4{,}472 \\approx 10{,}13$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$AC = \\sqrt{4^2 + 4^2} = \\sqrt{32} = 4\\sqrt{2}$ و $CB = \\sqrt{2^2 + (-4)^2} = \\sqrt{20} = 2\\sqrt{5}$ .',
            'طول المسار (2) هو $AC + CB = 4\\sqrt{2} + 2\\sqrt{5} \\approx 10{,}13\\,\\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'المقارنة',
        question: 'قارن المسارين، ثم احسب الفرق بين طوليهما بالمتر.',
        asks: ['أقصر المسارين', 'الفرق بين الطولين'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qima-muqarraba'],
            prompt: 'أقصر المسارين هو:',
            options: [
              'المسار (1)، لأنّ $9{,}42 < 10{,}13$',
              'المسار (2)، لأنّ قطعتيه مستقيمتان',
              'المساران متساويان تقريبًا فلا فرق بينهما',
            ],
            correct: 0,
            explain: 'القيمتان المقرّبتان تفصلان: $9{,}42 < 10{,}13$ . القطع المستقيمة ليست دليلًا، والعين لا تحسم.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qima-muqarraba'],
            prompt: 'الفرق بين الطولين مدوّرًا إلى $0{,}1\\,\\mathrm{m}$ (من القيمتين المضبوطتين):', expected: 0.7, suffix: 'm',
            explain: '$4\\sqrt{2} + 2\\sqrt{5} - 3\\pi \\approx 10{,}129 - 9{,}425 = 0{,}704$ ، أي $0{,}7$ بعد التقريب. ننقص أولًا ثم نقرّب.' },
          { kind: 'solution', ask: 0, lines: [
            '$3\\pi \\approx 9{,}42$ و $4\\sqrt{2} + 2\\sqrt{5} \\approx 10{,}13$ ، و $9{,}42 < 10{,}13$ .',
            'المسار (1) هو الأقصر، والفرق بين الطولين حوالي $0{,}7\\,\\mathrm{m}$ .',
          ] },
        ],
      },
    ],
  },

  // ── 4 ─ la fresque : vecteurs égaux, converse de Pythagore, rectangle, aire, coût ──
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — الجدارية',
    context: 'جدارية مستطيلة بتعاون التلاميذ',
    emoji: '🎨',
    source: SOURCE,
    tone: 'emerald',
    figure: TRAIN4,
    statement: 'يتعاون تلاميذ القسم على رسم جدارية على جدار المتوسطة، شكلها الرباعي $ABCD$ المبيّن في معلم متعامد ومتجانس (كل مربّع من المرصوفة يمثّل $1\\,\\mathrm{m}$ ) حيث $A(-3\\,;\\,0)$ و $B(1\\,;\\,-2)$ و $C(2\\,;\\,0)$ و $D(-2\\,;\\,2)$ . يريدون أن تكون الجدارية مستطيلة. ثمن طلاء المتر المربّع الواحد $800$ دج.',
    parts: [
      {
        label: '1)', title: 'متوازي أضلاع',
        question: 'بيّن أنّ $ABCD$ متوازي أضلاع.',
        asks: ['طبيعة الرباعي $ABCD$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['hisab-murakkibat'],
            prompt: 'مركبتا الشعاع $\\overrightarrow{AB}$ ثم مركبتا الشعاع $\\overrightarrow{DC}$ هما على الترتيب:',
            options: [
              '$\\begin{pmatrix} 4 \\\\ -2 \\end{pmatrix}$ و $\\begin{pmatrix} 4 \\\\ -2 \\end{pmatrix}$',
              '$\\begin{pmatrix} 4 \\\\ -2 \\end{pmatrix}$ و $\\begin{pmatrix} -4 \\\\ 2 \\end{pmatrix}$',
              '$\\begin{pmatrix} -4 \\\\ 2 \\end{pmatrix}$ و $\\begin{pmatrix} 4 \\\\ -2 \\end{pmatrix}$',
              '$\\begin{pmatrix} 4 \\\\ -2 \\end{pmatrix}$ و $\\begin{pmatrix} 4 \\\\ 2 \\end{pmatrix}$',
            ],
            correct: 0, cols: 2,
            explain: '$\\overrightarrow{AB}\\begin{pmatrix} 1 - (-3) \\\\ -2 - 0 \\end{pmatrix}$ أي $\\begin{pmatrix} 4 \\\\ -2 \\end{pmatrix}$ ، و $\\overrightarrow{DC}\\begin{pmatrix} 2 - (-2) \\\\ 0 - 2 \\end{pmatrix}$ أي $\\begin{pmatrix} 4 \\\\ -2 \\end{pmatrix}$ . المركبتان $\\begin{pmatrix} -4 \\\\ 2 \\end{pmatrix}$ هما مركبتا الشعاع المعاكس.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mutawazi-tartib'],
            prompt: 'ماذا نستنتج بخصوص الرباعي $ABCD$ ؟',
            options: [
              '$\\overrightarrow{AB} = \\overrightarrow{DC}$ ، إذن $ABCD$ متوازي أضلاع',
              '$\\overrightarrow{AB} = \\overrightarrow{DC}$ ، إذن $ABCD$ مستطيل',
              '$\\overrightarrow{AB} = \\overrightarrow{DC}$ ، إذن $ABDC$ متوازي أضلاع',
            ],
            correct: 0,
            explain: 'شعاعان متساويان $\\overrightarrow{AB} = \\overrightarrow{DC}$ يعنيان أنّ $ABCD$ متوازي أضلاع (بهذا الترتيب للرؤوس). لكنّ هذا لا يكفي ليكون مستطيلًا: نحتاج إلى زاوية قائمة.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\overrightarrow{AB}\\begin{pmatrix} 1 - (-3) \\\\ -2 - 0 \\end{pmatrix} = \\begin{pmatrix} 4 \\\\ -2 \\end{pmatrix}$ و $\\overrightarrow{DC}\\begin{pmatrix} 2 - (-2) \\\\ 0 - 2 \\end{pmatrix} = \\begin{pmatrix} 4 \\\\ -2 \\end{pmatrix}$ .',
            '$\\overrightarrow{AB} = \\overrightarrow{DC}$ ، إذن الرباعي $ABCD$ متوازي أضلاع.',
          ] },
        ],
      },
      {
        label: '2)', title: 'زاوية قائمة',
        question: 'بيّن أنّ $ABCD$ مستطيل.',
        asks: ['طبيعة الرباعي $ABCD$'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'مربّع الطول $AB^2$ :', expected: 20,
            explain: '$AB^2 = 4^2 + (-2)^2 = 16 + 4 = 20$ .' },
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'مربّع الطول $AD^2$ :', expected: 5,
            explain: '$\\overrightarrow{AD}\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}$ ومنه $AD^2 = 1^2 + 2^2 = 5$ .' },
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'مربّع الطول $BD^2$ :', expected: 25,
            explain: '$\\overrightarrow{BD}\\begin{pmatrix} -3 \\\\ 4 \\end{pmatrix}$ ومنه $BD^2 = (-3)^2 + 4^2 = 25$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['aks-fithaghuris'],
            prompt: 'بمقارنة $AB^2 + AD^2$ مع $BD^2$ ، ماذا نستنتج؟',
            options: [
              'المثلث $ABD$ قائم في $A$ (عكس خاصية فيثاغورس)، فمتوازي الأضلاع $ABCD$ مستطيل',
              'المثلث $ABD$ قائم في $B$ ، فمتوازي الأضلاع $ABCD$ مستطيل',
              'المثلث $ABD$ متساوي الساقين، فمتوازي الأضلاع $ABCD$ معيّن',
              'لا نستنتج شيئًا',
            ],
            correct: 0,
            explain: '$AB^2 + AD^2 = 20 + 5 = 25 = BD^2$ ، والضلع الأطول $[BD]$ يقابل الزاوية القائمة: هي في $A$ . متوازي أضلاع بزاوية قائمة هو مستطيل.' },
          { kind: 'solution', ask: 0, lines: [
            '$AB^2 = 4^2 + (-2)^2 = 20$ و $AD^2 = 1^2 + 2^2 = 5$ و $BD^2 = (-3)^2 + 4^2 = 25$ .',
            '$AB^2 + AD^2 = 20 + 5 = 25 = BD^2$ ، إذن المثلث $ABD$ قائم في $A$ (عكس خاصية فيثاغورس).',
            '$ABCD$ متوازي أضلاع وله زاوية قائمة، فهو مستطيل.',
          ] },
        ],
      },
      {
        label: '3)', title: 'المساحة والتكلفة',
        question: 'احسب مساحة الجدارية بالمتر المربّع، ثم احسب تكلفة طلائها.',
        asks: ['مساحة الجدارية', 'تكلفة الطلاء'],
        steps: [
          { kind: 'choice', role: 'translate',
            prompt: 'مساحة المستطيل $ABCD$ تساوي:',
            options: ['$AB \\times AD$', '$AB + AD$', '$\\dfrac{AB \\times AD}{2}$', '$2\\,(AB + AD)$'],
            correct: 0, cols: 2,
            explain: 'مساحة المستطيل طوله ضرب عرضه: $AB \\times AD$ . $\\dfrac{AB \\times AD}{2}$ مساحة المثلث $ABD$ ، و $2\\,(AB + AD)$ محيط المستطيل.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['masafa-nuqtatayn'],
            prompt: 'مساحة الجدارية بالمتر المربّع:', expected: 10, suffix: 'm²',
            explain: '$AB \\times AD = \\sqrt{20} \\times \\sqrt{5} = \\sqrt{100} = 10$ .' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'تكلفة طلاء الجدارية:', expected: 8000, suffix: 'دج',
            explain: '$10 \\times 800 = 8000$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$AB = \\sqrt{20}$ و $AD = \\sqrt{5}$ ، فمساحة المستطيل $AB \\times AD = \\sqrt{20 \\times 5} = \\sqrt{100} = 10\\,\\mathrm{m}^2$ .',
            'التكلفة: $10 \\times 800 = 8000$ ، أي $8000$ دج.',
          ] },
        ],
      },
    ],
  },

  // ── 5 ─ le phare : distance, point intérieur ou extérieur, translation ──
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — فنار الشاطئ',
    context: 'قاربان في مدى ضوء الفنار',
    emoji: '🗼',
    source: SOURCE,
    tone: 'teal',
    figure: TRAIN5,
    statement: 'يحرس حرس السواحل شواطئ الوطن، ويضيء الفنار $F$ كل نقطة تبعد عنه $5\\,\\mathrm{km}$ أو أقلّ. في معلم متعامد ومتجانس (كل مربّع من المرصوفة يمثّل $1\\,\\mathrm{km}$ ) الفنار في $F(1\\,;\\,2)$ ، وقاربا صيد في $P(4\\,;\\,6)$ و $T(6\\,;\\,5)$ كما في الشكل. يبحر القارب $T$ نحو الشاطئ فيصير بعد ساعة في النقطة $S$ حيث $\\overrightarrow{TS}\\begin{pmatrix} -1 \\\\ -1 \\end{pmatrix}$ .',
    parts: [
      {
        label: '1)', title: 'القارب P',
        question: 'هل القارب $P$ داخل مدى الفنار؟',
        asks: ['موقع القارب $P$ بالنسبة إلى المدى'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'مربّع المسافة $FP^2$ :', expected: 25,
            explain: '$\\overrightarrow{FP}\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$ ومنه $FP^2 = 3^2 + 4^2 = 25$ .' },
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'المسافة $FP$ بالكيلومتر:', expected: 5, suffix: 'km',
            explain: '$FP = \\sqrt{25} = 5$ .' },
          { kind: 'choice', role: 'conclude', ask: 0,
            prompt: 'القارب $P$ بالنسبة إلى مدى الفنار ( $5\\,\\mathrm{km}$ ):',
            options: [
              'داخل المدى، على حدّه تمامًا، لأنّ المسافة تساوي $5$ والفنار يضيء كل نقطة تبعد $5\\,\\mathrm{km}$ أو أقلّ',
              'خارج المدى، لأنّه على الدائرة المتقطعة',
              'لا يمكن الحكم دون قياس المسافة بالمسطرة',
            ],
            correct: 0,
            explain: 'المسافة $FP = 5 \\leq 5$ : القارب $P$ على الدائرة المتقطعة نفسها، وهي من المدى المضاء. الحساب هو الذي يحسم، لا الرسم.' },
          { kind: 'solution', ask: 0, lines: [
            '$FP = \\sqrt{(4 - 1)^2 + (6 - 2)^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$ .',
            '$FP = 5\\,\\mathrm{km}$ يساوي مدى الفنار، فالقارب $P$ داخل المدى على حدّه.',
          ] },
        ],
      },
      {
        label: '2)', title: 'القارب T',
        question: 'احسب المسافة $FT$ مدوّرة إلى $0{,}01\\,\\mathrm{km}$ ، ثم حدّد هل القارب $T$ داخل المدى.',
        asks: ['المسافة $FT$', 'موقع القارب $T$ بالنسبة إلى المدى'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'مربّع المسافة $FT^2$ :', expected: 34,
            explain: '$\\overrightarrow{FT}\\begin{pmatrix} 5 \\\\ 3 \\end{pmatrix}$ ومنه $FT^2 = 5^2 + 3^2 = 25 + 9 = 34$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qima-muqarraba'],
            prompt: 'المسافة $FT$ مدوّرة إلى $0{,}01\\,\\mathrm{km}$ :', expected: 5.83, suffix: 'km',
            explain: '$FT = \\sqrt{34} \\approx 5{,}83$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['qima-muqarraba'],
            prompt: 'القارب $T$ بالنسبة إلى مدى الفنار:',
            options: [
              'خارج المدى، لأنّ $5{,}83 > 5$',
              'داخل المدى، لأنّ $34 > 25$',
              'داخل المدى، لأنّه قريب من الدائرة المتقطعة',
            ],
            correct: 0,
            explain: '$\\sqrt{34} \\approx 5{,}83$ أكبر من $5$ : القارب $T$ خارج المدى. لاحظ أنّه قريب من الدائرة في الرسم: لا يحسم إلا الحساب.' },
          { kind: 'solution', ask: 0, lines: [
            '$FT = \\sqrt{(6 - 1)^2 + (5 - 2)^2} = \\sqrt{25 + 9} = \\sqrt{34} \\approx 5{,}83\\,\\mathrm{km}$ .',
            '$5{,}83 > 5$ ، إذن القارب $T$ خارج مدى الفنار.',
          ] },
        ],
      },
      {
        label: '3)', title: 'بعد ساعة',
        question: 'عيّن إحداثيتي النقطة $S$ ، ثم تحقّق من دخول القارب مدى الفنار بعد ساعة.',
        asks: ['فاصلة النقطة $S$', 'ترتيب النقطة $S$', 'موقع القارب بعد ساعة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['hisab-murakkibat'],
            prompt: 'كيف نحسب إحداثيتي $S$ علمًا أنّ $\\overrightarrow{TS}\\begin{pmatrix} -1 \\\\ -1 \\end{pmatrix}$ ؟',
            options: [
              '$x_S = x_T + (-1)$ و $y_S = y_T + (-1)$',
              '$x_S = x_T - (-1)$ و $y_S = y_T - (-1)$',
              '$x_S = -1 - x_T$ و $y_S = -1 - y_T$',
              '$x_S = x_T \\times (-1)$ و $y_S = y_T \\times (-1)$',
            ],
            correct: 0, cols: 1,
            explain: 'مركبتا $\\overrightarrow{TS}$ هما $x_S - x_T$ و $y_S - y_T$ ، فـ $x_S = x_T + (-1)$ و $y_S = y_T + (-1)$ . الخيار الثاني يحسب موقع القارب قبل التحرّك لا بعده.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-murakkibat'],
            prompt: 'فاصلة $S$ :', expected: 5,
            explain: '$x_S = 6 + (-1) = 5$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hisab-murakkibat'],
            prompt: 'ترتيب $S$ :', expected: 4,
            explain: '$y_S = 5 + (-1) = 4$ .' },
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'مربّع المسافة $FS^2$ :', expected: 20,
            explain: '$\\overrightarrow{FS}\\begin{pmatrix} 4 \\\\ 2 \\end{pmatrix}$ ومنه $FS^2 = 4^2 + 2^2 = 20$ .' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['qima-muqarraba'],
            prompt: 'بعد ساعة، القارب في النقطة $S$ . بالنسبة إلى مدى الفنار هو:',
            options: [
              'داخل المدى، لأنّ $FS = \\sqrt{20} \\approx 4{,}47 < 5$',
              'خارج المدى، لأنّ $20 > 5$',
              'خارج المدى، لأنّه ما زال بعيدًا عن الفنار',
            ],
            correct: 0,
            explain: 'نقارن $FS$ مع $5$ لا $FS^2$ مع $5$ : $\\sqrt{20} \\approx 4{,}47 < 5$ ، أو $FS^2 = 20 < 25$ . يدخل القارب المدى المضاء بعد ساعة.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\overrightarrow{TS}\\begin{pmatrix} -1 \\\\ -1 \\end{pmatrix}$ أي $x_S - 6 = -1$ و $y_S - 5 = -1$ ، إذن $S(5\\,;\\,4)$ .',
            '$FS = \\sqrt{(5 - 1)^2 + (4 - 2)^2} = \\sqrt{16 + 4} = \\sqrt{20} \\approx 4{,}47\\,\\mathrm{km}$ .',
            '$4{,}47 < 5$ ، إذن القارب يدخل مدى الفنار بعد ساعة.',
          ] },
        ],
      },
    ],
  },

  // ── 6 ─ le champ d'oliviers : milieux des diagonales, losange, aire ──
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — حقل الزيتون',
    context: 'ما نوع الرباعي وما مساحته؟',
    emoji: '🫒',
    source: SOURCE,
    tone: 'violet',
    figure: TRAIN6,
    statement: 'يملك والد سامي حقل زيتون يقصده ابنه كل عطلة ليساعده برًّا به. شكل الحقل الرباعي $ABCD$ المبيّن في معلم متعامد ومتجانس (كل مربّع من المرصوفة يمثّل $10\\,\\mathrm{m}$ ) حيث $A(-2\\,;\\,-1)$ و $B(1\\,;\\,3)$ و $C(4\\,;\\,-1)$ و $D(1\\,;\\,-5)$ . يريد سامي معرفة نوع هذا الرباعي ثم مساحة الحقل.',
    parts: [
      {
        label: '1)', title: 'منتصفا القطرين',
        question: 'احسب إحداثيتي منتصف كل من القطرين $[AC]$ و $[BD]$ ، ثم استنتج طبيعة الرباعي $ABCD$ .',
        asks: ['منتصف القطر $[AC]$', 'منتصف القطر $[BD]$', 'طبيعة الرباعي $ABCD$'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muntasaf-qita'],
            prompt: 'منتصف القطر $[AC]$ هو:',
            options: ['$(1\\,;\\,-1)$', '$(2\\,;\\,-2)$', '$(3\\,;\\,0)$', '$(-1\\,;\\,1)$'],
            correct: 0, cols: 2,
            explain: '$\\left(\\dfrac{-2 + 4}{2}\\,;\\,\\dfrac{-1 + (-1)}{2}\\right) = (1\\,;\\,-1)$ . النقطة $(2\\,;\\,-2)$ مجموع دون قسمة على 2، و $(3\\,;\\,0)$ نصف الفرق.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['muntasaf-qita'],
            prompt: 'منتصف القطر $[BD]$ هو:',
            options: ['$(1\\,;\\,-1)$', '$(1\\,;\\,-2)$', '$(2\\,;\\,-2)$', '$(0\\,;\\,-1)$'],
            correct: 0, cols: 2,
            explain: '$\\left(\\dfrac{1 + 1}{2}\\,;\\,\\dfrac{3 + (-5)}{2}\\right) = (1\\,;\\,-1)$ . النقطة $(1\\,;\\,-2)$ تنسى القسمة على 2 في الترتيب.' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['mutawazi-tartib'],
            prompt: 'ماذا نستنتج بخصوص الرباعي $ABCD$ ؟',
            options: [
              'للقطرين المنتصف نفسه، إذن $ABCD$ متوازي أضلاع',
              'للقطرين المنتصف نفسه، إذن $ABCD$ مستطيل',
              'للقطرين المنتصف نفسه، إذن $ABCD$ شبه منحرف',
            ],
            correct: 0,
            explain: 'إذا كان لقطري رباعي المنتصف نفسه فهو متوازي أضلاع (قطراه يتقاطعان في منتصفيهما). هذا لا يكفي لمعرفة هل هو مستطيل أو معيّن.' },
          { kind: 'solution', ask: 0, lines: [
            'منتصف $[AC]$ : $\\left(\\dfrac{-2 + 4}{2}\\,;\\,\\dfrac{-1 + (-1)}{2}\\right) = (1\\,;\\,-1)$ ، ومنتصف $[BD]$ : $\\left(\\dfrac{1 + 1}{2}\\,;\\,\\dfrac{3 + (-5)}{2}\\right) = (1\\,;\\,-1)$ .',
            'للقطرين المنتصف نفسه، إذن الرباعي $ABCD$ متوازي أضلاع.',
          ] },
        ],
      },
      {
        label: '2)', title: 'معيّن',
        question: 'بيّن أنّ $ABCD$ معيّن.',
        asks: ['طبيعة الرباعي $ABCD$'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'مربّع الطول $AB^2$ :', expected: 25,
            explain: '$\\overrightarrow{AB}\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$ ومنه $AB^2 = 3^2 + 4^2 = 25$ .' },
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'مربّع الطول $BC^2$ :', expected: 25,
            explain: '$\\overrightarrow{BC}\\begin{pmatrix} 3 \\\\ -4 \\end{pmatrix}$ ومنه $BC^2 = 3^2 + (-4)^2 = 25$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mutawazi-tartib'],
            prompt: 'ما الذي يجعل متوازي الأضلاع $ABCD$ معيّنًا؟',
            options: [
              'ضلعان متتاليان منه متقايسان: $AB = BC$',
              'ضلعان متقابلان منه متقايسان: $AB = DC$',
              'قطراه متقايسان',
            ],
            correct: 0,
            explain: 'تساوي ضلعين متتاليين في متوازي أضلاع يعطي معيّنًا (أضلاعه الأربعة متقايسة). تساوي الضلعين المتقابلين صحيح في كل متوازي أضلاع، وتقايس القطرين يصنع مستطيلًا.' },
          { kind: 'solution', ask: 0, lines: [
            '$AB^2 = 3^2 + 4^2 = 25$ و $BC^2 = 3^2 + (-4)^2 = 25$ ، إذن $AB = BC = 5$ .',
            '$ABCD$ متوازي أضلاع فيه ضلعان متتاليان متقايسان، فهو معيّن.',
          ] },
        ],
      },
      {
        label: '3)', title: 'مساحة الحقل',
        question: 'احسب مساحة الحقل بالمتر المربّع.',
        asks: ['مساحة الحقل'],
        steps: [
          { kind: 'choice', role: 'translate',
            prompt: 'مساحة المعيّن بدلالة قطريه هي:',
            options: ['$\\dfrac{AC \\times BD}{2}$', '$AC \\times BD$', '$AB \\times BC$', '$AC + BD$'],
            correct: 0, cols: 2,
            explain: 'مساحة المعيّن نصف جداء قطريه. $AC \\times BD$ ضعف المساحة، و $AB \\times BC$ ليس مساحته لأنّ زاويتيه غير قائمتين.' },
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'طول القطر $AC$ بوحدة المعلم:', expected: 6,
            explain: '$\\overrightarrow{AC}\\begin{pmatrix} 6 \\\\ 0 \\end{pmatrix}$ ومنه $AC = \\sqrt{6^2 + 0^2} = 6$ .' },
          { kind: 'numeric', role: 'compute', requires: ['masafa-nuqtatayn'],
            prompt: 'طول القطر $BD$ بوحدة المعلم:', expected: 8,
            explain: '$\\overrightarrow{BD}\\begin{pmatrix} 0 \\\\ -8 \\end{pmatrix}$ ومنه $BD = \\sqrt{0^2 + (-8)^2} = 8$ .' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'مساحة الحقل بالمتر المربّع:', expected: 2400, suffix: 'm²',
            explain: '$\\dfrac{6 \\times 8}{2} = 24$ وحدة مربّعة، ووحدة المساحة $10 \\times 10 = 100\\,\\mathrm{m}^2$ ، أي $24 \\times 100 = 2400$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$AC = 6$ و $BD = 8$ بوحدة المعلم، فمساحة المعيّن $\\dfrac{AC \\times BD}{2} = \\dfrac{6 \\times 8}{2} = 24$ وحدة مربّعة.',
            'كل وحدة مربّعة تمثّل $10 \\times 10 = 100\\,\\mathrm{m}^2$ ، إذن مساحة الحقل $24 \\times 100 = 2400\\,\\mathrm{m}^2$ .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
