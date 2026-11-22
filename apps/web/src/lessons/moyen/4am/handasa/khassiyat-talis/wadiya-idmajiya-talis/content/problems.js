/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي — unité 9 « خاصية طالس » (modules 1 à 6) — des situations COMPLÈTES
 * de type امتحان, résolues pas à pas (common/problems/GuidedProblem.jsx), AVANT « تحليل الوضعية النهائية للاختبار » (module 7)
 * et la وضعية du test final (module 8).
 *
 * Décision du propriétaire (2026-10-13) : étendre à toutes les synthèses le patron de l'unité 1
 * (`wadiya-idmajiya-aadad`) : que l'élève s'exerce sur beaucoup de situations avant celle sur laquelle il sera
 * évalué. Ce sont des AJOUTS DE LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`), jamais des
 * exercices du manuel ; chacune mobilise les trois leçons de l'unité et rien d'autre :
 *   1  سارية العلم        la méthode de l'ombre (leçon 1) : hauteur d'un mât, ombre d'un élève        — figure
 *   2  عارضة الرفّ        la réciproque (leçon 2) : produits en croix ≠, puis AN, MN, prix              — figure
 *   3  توزيع الممرّ       le partage d'un segment en 5 parts égales (leçon 3) : AM = 3/5 AB            — figure
 *   4  هدية عيد الأم       le cylindre dans le cône (coupe axiale, équation, volume, vérification)       — figure
 *   5  عرض البحيرة        la réciproque PUIS Thalès en papillon : une distance inaccessible AB = 45 m  — figure
 *   6  زربية ركن القراءة   le coefficient de réduction k, les longueurs et le périmètre image          — tableau
 * Aucun nombre n'est celui du تحدّ (bâton 1 m, 11,6 m), de la وضعية du manuel (cône 18/6), de « إختبار أولي »
 * (cône 12/6, bâton 1,5 m à 12 m), de l'oued (2, 5, 6) ni de la pyramide (146 m). Une valeur est tissée dans
 * chaque récit (حبّ الوطن، إتقان العمل، التكافل، برّ الوالدين، النظافة، العلم والقراءة) sans toucher aux nombres.
 * Les figures sont des données GeoFigure aux coordonnées CALCULÉES ; aucune ne porte une réponse écrite.
 *
 * Périmètre : jamais le volume du cône ni le maximum du volume du cylindre ; π n'est écrit qu'en coefficient.
 * Aucune sous-étape n'est une `assessment` : la maîtrise vient du dernier module seulement.
 * Chaque nombre et chaque égalité sont recalculés dans ./problems.test.js.
 */
import { addition } from '../../_unit/unitMeta.js';

const SOURCE = addition('exam_style_problem');

/** وضعية 1 — O fin commune des deux ombres ; B pied du bâton, E son sommet ; A pied du mât, M son sommet. */
const FIG_FLAG = {
  points: { O: [0, 0], B: [1.8, 0], A: [11.7, 0], E: [1.8, 1.2], M: [11.7, 7.8] },
  segments: [
    { from: 'O', to: 'B', label: '1,8 m', labelSide: -1 },
    { from: 'O', to: 'A', label: '11,7 m', labelSide: -1 },
    { from: 'B', to: 'E', label: '1,2 m', tone: 'emerald', bold: true },
    { from: 'A', to: 'M', tone: 'amber', bold: true },
    { from: 'O', to: 'M', tone: 'slate' },
  ],
  rightAngles: [['O', 'B', 'E'], ['O', 'A', 'M']],
  labels: { O: 'sw', B: 'se', A: 'se', E: 'nw', M: 'ne' },
  ariaLabel: 'السارية [AM] والعصا [BE] شاقوليتان على الأرض (OA)، وشعاع الشمس (OM) يمرّ بقمّة العصا E وقمّة السارية M وينتهي الظلّان في O؛ ظلّ العصا OB = 1,8 m وظلّ السارية OA = 11,7 m وطول العصا BE = 1,2 m',
  maxWidth: 340,
};

/** وضعية 2 — le هيكل ABC (AB = 100, AC = 65, BC = 105 cm ; 1 unité = 10 cm) ; M à 60 cm de A sur [AB], N à 40 cm de A sur [AC]. */
const FIG_SHELF = {
  points: { A: [0, 6], B: [-8, 0], C: [2.5, 0], M: [-4.8, 2.4], N: [1.5385, 2.3077] },
  segments: [
    { from: 'A', to: 'B', label: '100 cm', labelSide: 1 },
    { from: 'A', to: 'C', label: '65 cm', labelSide: 1 },
    { from: 'B', to: 'C', label: '105 cm', labelSide: -1 },
    { from: 'M', to: 'N', tone: 'amber', bold: true },
  ],
  labels: { A: 'n', B: 'sw', C: 'se', M: 'w', N: 'e' },
  ariaLabel: 'هيكل الرفّ مثلث ABC قاعدته [BC] على الأرض؛ AB = 100 cm و AC = 65 cm و BC = 105 cm؛ العارضة [MN] حيث M من [AB] و N من [AC]',
  maxWidth: 340,
};

/** وضعية 3 — [AB] = 11 m ; G1…G5 équidistants sur [Ax) ; les parallèles à (G5B) par G1…G4 coupent [AB] en P1, P2, M, P4. */
const FIG_PASSAGE = {
  points: {
    A: [0, 0], B: [11, 0],
    G1: [1.5, 1.2], G2: [3, 2.4], G3: [4.5, 3.6], G4: [6, 4.8], G5: [7.5, 6],
    P1: [2.2, 0], P2: [4.4, 0], M: [6.6, 0], P4: [8.8, 0],
  },
  segments: [
    { from: 'A', to: 'B', label: '11 m', labelSide: -1 },
    { from: 'A', to: 'G1', ticks: 1 }, { from: 'G1', to: 'G2', ticks: 1 }, { from: 'G2', to: 'G3', ticks: 1 },
    { from: 'G3', to: 'G4', ticks: 1 }, { from: 'G4', to: 'G5', ticks: 1 },
    { from: 'G5', to: 'B', tone: 'amber', bold: true },
    { from: 'G1', to: 'P1', tone: 'sky' }, { from: 'G2', to: 'P2', tone: 'sky' },
    { from: 'G3', to: 'M', tone: 'sky' }, { from: 'G4', to: 'P4', tone: 'sky' },
  ],
  hidden: ['G1', 'G2', 'G4', 'P1', 'P2', 'P4'],
  labels: { A: 'w', B: 'e', G3: 'nw', G5: 'n', M: 's' },
  ariaLabel: 'القطعة [AB] طولها 11 m؛ على نصف المستقيم [Ax) خمس نقط G1 إلى G5 على أبعاد متساوية من A، وموازيات للمستقيم (G5B) تمرّ بـ G1 و G2 و G3 و G4 وتقطع [AB]، ومنها النقطة M التي تقطعها الموازية المارّة بـ G3',
  maxWidth: 340,
};

/** وضعية 4 — la demi-coupe axiale : S centre de la base (SK = 12), O le sommet (SO = 20) ; une bougie quelconque (h = 8). */
const FIG_CANDLE = {
  points: { S: [0, 0], K: [0, 12], O: [20, 0], T: [8, 0], C: [8, 7.2], D: [0, 7.2] },
  segments: [
    { from: 'S', to: 'K', label: '12', labelSide: 1 }, { from: 'K', to: 'O' },
    { from: 'S', to: 'T', label: 'h', labelSide: -1 }, { from: 'T', to: 'O', labelSide: -1 },
    { from: 'T', to: 'C', label: 'r', tone: 'indigo', bold: true },
    { from: 'D', to: 'C', tone: 'indigo' }, { from: 'S', to: 'D', tone: 'indigo' },
  ],
  polygons: [{ points: ['O', 'T', 'C'], tone: 'amber' }],
  rightAngles: [['K', 'S', 'O'], ['C', 'T', 'O']],
  labels: { S: 'sw', K: 'nw', O: 'e', T: 's', C: 'n', D: 'w' },
  ariaLabel: 'نصف المقطع المحوري: المثلث القائم OSK حيث SK = 12 و SO = 20، والمستطيل SDCT للشمعة حيث ST = h و TC = r، والنقطة C على [OK]',
  caption: 'ارتفاع المخروط 20 ونصف قطر قاعدته 12 (cm)',
  maxWidth: 420,
};

/** وضعية 5 — O entre A et C, entre B et D ; 1 unité = 10 m ; OA = 3, OC = 1,2, OB = 3,5, OD = 1,4, CD = 1,8, AB = 4,5. */
const FIG_LAKE = {
  points: { O: [0, 0], A: [-3, 0], C: [1.2, 0], B: [-0.16667, 3.49603], D: [0.06667, -1.39841] },
  segments: [
    { from: 'A', to: 'O', label: '30 m', labelSide: -1 },
    { from: 'O', to: 'C', label: '12 m', labelSide: -1 },
    { from: 'B', to: 'O', label: '35 m', labelSide: 1 },
    { from: 'O', to: 'D', label: '14 m', labelSide: 1 },
    { from: 'C', to: 'D', label: '18 m' },
    { from: 'A', to: 'B', dashed: true, tone: 'rose' },
  ],
  labels: { O: 'ne', A: 'w', C: 'e', B: 'n', D: 's' },
  ariaLabel: 'النقطة O على اليابسة بين A و C وبين B و D؛ A و B على ضفّتي البحيرة؛ OA = 30 m و OC = 12 m و OB = 35 m و OD = 14 m و CD = 18 m، والمسافة AB مرسومة بخطّ متقطّع لأنّها لا تُقاس مباشرة',
  maxWidth: 340,
};

export const PROBLEMS = [
  /* ──────────────────────────────────────────────── 1 ── سارية العلم ── */
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — سارية العلم',
    context: 'ارتفاع لا نصل إليه بظلّ عصا',
    emoji: '🚩',
    source: SOURCE,
    tone: 'sky',
    figure: FIG_FLAG,
    statement: 'احتفالًا بعيد الاستقلال وحبًّا لعلم الوطن، أراد نادي المتوسطة تزيين سارية العلم بسلسلة أضواء من أسفلها إلى أعلاها، دون أن يتسلّق أحد السارية. في صباح مشمس غرس التلاميذ عصا شاقولية طولها $1{,}2\\,\\mathrm{m}$ بحيث ينتهي ظلّها في النقطة $O$ حيث ينتهي ظلّ السارية، وقاسوا ظلّ العصا $OB = 1{,}8\\,\\mathrm{m}$ وظلّ السارية $OA = 11{,}7\\,\\mathrm{m}$ (الشكل المقابل).',
    data: [
      { id: 'stick', text: 'طول العصا: 1,2 m', useful: true },
      { id: 'shadows', text: 'ظلّ العصا 1,8 m وظلّ السارية 11,7 m، وينتهيان في النقطة نفسها O', useful: true },
      { id: 'vertical', text: 'السارية والعصا شاقوليتان على أرض أفقية', useful: true },
      { id: 'price', text: 'ثمن سلسلة الأضواء: 1000 دج للمتر الواحد', useful: true },
      { id: 'pupils', text: 'شارك في القياس 14 تلميذًا', useful: false },
      { id: 'time', text: 'بدأ القياس على الساعة 9:30', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ارتفاع السارية',
        question: 'احسب ارتفاع السارية $AM$ .',
        asks: ['ارتفاع السارية'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tariqat-zill'],
            prompt: 'لماذا يكون المثلثان $OBE$ و $OAM$ في وضعية طالس؟',
            options: [
              'السارية والعصا شاقوليتان فهما متوازيتان، وظلّاهما ينتهيان في النقطة نفسها $O$',
              'لأنّ العصا أقصر من السارية',
              'لأنّ ظلّ العصا أقصر من ظلّ السارية',
            ],
            correct: 0,
            explain: 'العصا والسارية عموديتان على الأرض فهما متوازيتان، والنقط $O$ ، $E$ ، $M$ على استقامة (شعاع الشمس): مستقيمان متوازيان يقطعان مستقيمين متقاطعين في $O$ . قِصَر العصا أو قِصَر ظلّها لا يكفي لذلك.' },
          { kind: 'choice', role: 'translate', requires: ['tariqat-zill', 'talis-mubashira'],
            prompt: 'خاصية طالس تعطي:',
            options: [
              '$\\dfrac{AM}{BE} = \\dfrac{OA}{OB}$',
              '$\\dfrac{AM}{BE} = \\dfrac{OB}{OA}$',
              '$\\dfrac{AM}{OA} = \\dfrac{OB}{BE}$',
            ],
            correct: 0, cols: 1,
            explain: 'في كل نسبة: طول من المثلث الكبير $OAM$ على الطول الموافق له في المثلث الصغير $OBE$ ، ارتفاع على ارتفاع وظلّ على ظلّ. قلب نسبة واحدة أو خلط الارتفاع بالظلّ يعطي مساواة خاطئة.' },
          { kind: 'numeric', role: 'compute', requires: ['rabi-mutanasib'],
            prompt: 'نسبة الظلّين $\\dfrac{OA}{OB}$ :', expected: 6.5, shape: 'decimal',
            explain: '$\\dfrac{11{,}7}{1{,}8} = 6{,}5$ : ظلّ السارية ستّة أضعاف ظلّ العصا ونصف.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-zill', 'rabi-mutanasib'],
            prompt: 'ارتفاع السارية $AM$ بالمتر:', expected: 7.8, shape: 'quantity', unit: 'm',
            explain: '$AM = 1{,}2 \\times \\dfrac{11{,}7}{1{,}8} = 7{,}8$ .' },
          { kind: 'solution', ask: 0, lines: [
            'السارية $[AM]$ والعصا $[BE]$ شاقوليتان فهما متوازيتان، وظلّاهما ينتهيان في $O$ : المثلثان $OBE$ و $OAM$ في وضعية طالس.',
            '$\\dfrac{AM}{BE} = \\dfrac{OA}{OB}$ أي $\\dfrac{AM}{1{,}2} = \\dfrac{11{,}7}{1{,}8}$ .',
            '$AM = \\dfrac{1{,}2 \\times 11{,}7}{1{,}8} = 7{,}8$ : ارتفاع السارية $7{,}8\\,\\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'ثمن الأضواء وظلّ تلميذ',
        question: 'ما ثمن سلسلة أضواء تكفي لطول السارية كاملًا؟ وفي اللحظة نفسها، ما طول ظلّ تلميذ طوله $1{,}7\\,\\mathrm{m}$ ؟',
        asks: ['ثمن سلسلة الأضواء', 'طول ظلّ التلميذ'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-zill'],
            prompt: 'ثمن السلسلة بالدينار:', expected: 7800, shape: 'quantity', unit: 'دج',
            explain: 'طول السلسلة هو ارتفاع السارية $7{,}8\\,\\mathrm{m}$ : $7{,}8 \\times 1000 = 7800$ .' },
          { kind: 'choice', role: 'translate', requires: ['tariqat-zill'],
            prompt: 'في اللحظة نفسها، إذا رمزنا بـ $s$ إلى ظلّ التلميذ، فالشمس تعطي:',
            options: [
              '$\\dfrac{1{,}7}{s} = \\dfrac{1{,}2}{1{,}8}$',
              '$\\dfrac{1{,}7}{s} = \\dfrac{1{,}8}{1{,}2}$',
              '$s = 1{,}7$ لأنّ ظلّ الجسم يساوي ارتفاعه',
            ],
            correct: 0, cols: 1,
            explain: 'النسبة ارتفاع ÷ ظلّ هي نفسها لكل الأجسام الشاقولية في اللحظة نفسها (أشعة الشمس متوازية): $\\dfrac{1{,}2}{1{,}8}$ للعصا، فهي لتلميذ طوله $1{,}7$ . الظلّ لا يساوي الارتفاع إلا حين تكون النسبة $1$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tariqat-zill', 'rabi-mutanasib'],
            prompt: 'ظلّ التلميذ $s$ بالمتر:', expected: 2.55, shape: 'quantity', unit: 'm',
            explain: '$s = \\dfrac{1{,}7 \\times 1{,}8}{1{,}2} = 2{,}55$ .' },
          { kind: 'solution', ask: 0, lines: [
            'طول السلسلة $7{,}8\\,\\mathrm{m}$ : $7{,}8 \\times 1000 = 7800$ ، ثمنها 7800 دج.',
            'في اللحظة نفسها $\\dfrac{1{,}7}{s} = \\dfrac{1{,}2}{1{,}8}$ ومنه $s = \\dfrac{1{,}7 \\times 1{,}8}{1{,}2} = 2{,}55$ .',
            'ظلّ التلميذ $2{,}55\\,\\mathrm{m}$ .',
          ] },
        ],
      },
    ],
  },

  /* ──────────────────────────────────────────────── 2 ── عارضة الرفّ ── */
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — عارضة الرفّ',
    context: 'هل العارضة موازية للأرض؟',
    emoji: '🪚',
    source: SOURCE,
    tone: 'indigo',
    figure: FIG_SHELF,
    statement: 'في ورشة نجارة يصنع متربّص هيكل رفّ على شكل مثلث $ABC$ حيث $AB = 100\\,\\mathrm{cm}$ و $AC = 65\\,\\mathrm{cm}$ و $BC = 105\\,\\mathrm{cm}$ ، والضلع $[BC]$ على الأرض. يحرص معلّمه على إتقان العمل، فيجب أن تكون العارضة $[MN]$ موازية للأرض، حيث $M \\in [AB]$ و $N \\in [AC]$ (الشكل المقابل). ثبّت المتربّص الطرف $M$ عند $AM = 60\\,\\mathrm{cm}$ ثم الطرف $N$ عند $AN = 40\\,\\mathrm{cm}$ .',
    data: [
      { id: 'sides', text: 'طول الضلع AB هو 100 cm، وطول الضلع AC هو 65 cm', useful: true },
      { id: 'marks', text: 'النقطة M من [AB] على بعد 60 cm من A، والنقطة N من [AC] على بعد 40 cm من A', useful: true },
      { id: 'price', text: 'سعر المتر الواحد من الخشب: 800 دج', useful: true },
      { id: 'thick', text: 'سمك الخشب: 2 cm', useful: false },
      { id: 'pieces', text: 'يتكوّن الرفّ من 6 قطع خشبية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'هل العارضة موازية للأرض؟',
        question: 'هل المستقيم $(MN)$ يوازي $(BC)$ ؟',
        asks: ['هل $(MN)$ يوازي $(BC)$ ؟'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['talis-aksiya'],
            prompt: 'لمعرفة هل $(MN) \\parallel (BC)$ نقارن:',
            options: [
              'النسبتين $\\dfrac{AM}{AB}$ و $\\dfrac{AN}{AC}$ (مع ترتيب النقط على الضلعين)',
              'الطولين $AM$ و $AN$',
              'الطولين $MN$ و $BC$',
            ],
            correct: 0, cols: 1,
            explain: 'التوازي يُستنتج من الخاصية العكسية لخاصية طالس: النسبتان $\\dfrac{AM}{AB}$ و $\\dfrac{AN}{AC}$ متساويتان والنقط مرتّبة بالترتيب نفسه. مقارنة $AM$ بـ $AN$ لا تقول شيئا لأنّ الضلعين مختلفا الطول.' },
          { kind: 'numeric', role: 'compute', requires: ['talis-aksiya'],
            prompt: 'الجداء $AM \\times AC$ :', expected: 3900, shape: 'gap', subject: 'AM \\times AC',
            explain: '$AM \\times AC = 60 \\times 65 = 3900$ .' },
          { kind: 'numeric', role: 'compute', requires: ['talis-aksiya'],
            prompt: 'الجداء $AB \\times AN$ :', expected: 4000, shape: 'gap', subject: 'AB \\times AN',
            explain: '$AB \\times AN = 100 \\times 40 = 4000$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['talis-aksiya'],
            prompt: 'هل العارضة موازية للأرض؟',
            options: [
              'لا: $3900 \\neq 4000$ إذن $\\dfrac{60}{100} \\neq \\dfrac{40}{65}$',
              'نعم: النسبتان متقاربتان',
              'نعم: $M$ و $N$ على الارتفاع نفسه تقريبا',
            ],
            correct: 0, cols: 1,
            explain: 'الجداءان المتصالبان مختلفان فالنسبتان غير متساويتين، ولو كان $(MN) \\parallel (BC)$ لتساوتا (خاصية طالس). «متقاربتان» لا تعني «متساويتان»: الإتقان يطلب التساوي.' },
          { kind: 'solution', ask: 0, lines: [
            '$AM \\times AC = 60 \\times 65 = 3900$ و $AB \\times AN = 100 \\times 40 = 4000$ .',
            'الجداءان مختلفان إذن $\\dfrac{AM}{AB} \\neq \\dfrac{AN}{AC}$ ؛ ولو كان $(MN) \\parallel (BC)$ لتساوت النسبتان حسب خاصية طالس.',
            'العارضة غير موازية للأرض، وعلى المتربّص تصحيح موضع $N$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'تصحيح موضع N',
        question: 'عيّن الطول $AN$ الذي تصبح به $(MN)$ موازية لـ $(BC)$ مع بقاء $AM = 60\\,\\mathrm{cm}$ . احسب طول العارضة $MN$ . ما ثمنها؟',
        asks: ['الطول $AN$', 'طول العارضة $MN$', 'ثمن العارضة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['talis-aksiya', 'talis-mubashira'],
            prompt: 'لتكون $(MN) \\parallel (BC)$ يجب أن يتحقّق:',
            options: [
              '$\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ مع النقطتين $M$ و $N$ على الضلعين بالترتيب نفسه',
              '$AN = AM$',
              '$AN = AC - AM$',
            ],
            correct: 0, cols: 1,
            explain: 'التوازي يعني تساوي النسبتين (والترتيب نفسه). $AN = AM$ لا يصحّ لأنّ $AB \\neq AC$ ، و $AC - AM$ لا علاقة له بالنسبة.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['rabi-mutanasib'],
            prompt: 'الطول $AN$ بالسنتيمتر:', expected: 39, shape: 'quantity', unit: 'cm',
            explain: '$\\dfrac{60}{100} = \\dfrac{AN}{65}$ ومنه $AN = \\dfrac{60 \\times 65}{100} = 39$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['talis-mubashira', 'rabi-mutanasib'],
            prompt: 'طول العارضة $MN$ بالسنتيمتر:', expected: 63, shape: 'quantity', unit: 'cm',
            explain: 'المثلثان $AMN$ و $ABC$ في وضعية طالس: $\\dfrac{MN}{105} = \\dfrac{60}{100}$ ومنه $MN = \\dfrac{105 \\times 60}{100} = 63$ .' },
          { kind: 'numeric', role: 'answer', ask: 2,
            prompt: 'ثمن العارضة بالدينار:', expected: 504, shape: 'quantity', unit: 'دج',
            explain: 'طول العارضة $63$ cm أي $0{,}63$ m ، وثمنها $0{,}63 \\times 800 = 504$ .' },
          { kind: 'solution', ask: 0, lines: [
            'لتكون $(MN) \\parallel (BC)$ : $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ أي $\\dfrac{60}{100} = \\dfrac{AN}{65}$ ومنه $AN = \\dfrac{60 \\times 65}{100} = 39$ .',
            'خاصية طالس: $\\dfrac{MN}{BC} = \\dfrac{60}{100}$ أي $MN = \\dfrac{105 \\times 60}{100} = 63$ .',
            'العارضة طولها $63$ cm أي $0{,}63$ m ، وثمنها $0{,}63 \\times 800 = 504$ دينار.',
          ] },
        ],
      },
    ],
  },

  /* ──────────────────────────────────────────────── 3 ── توزيع الممرّ ── */
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — توزيع الممرّ',
    context: 'تقسيم قطعة إلى خمسة أجزاء متساوية',
    emoji: '🤝',
    source: SOURCE,
    tone: 'emerald',
    figure: FIG_PASSAGE,
    statement: 'تعاونًا وتكافلًا بين الجيران، تتقاسم خمس عائلات طلاء جدار الممرّ $[AB]$ الذي طوله $11\\,\\mathrm{m}$ بحصص متساوية الطول. لا يملكون شريط قياس، فرسم المهندس على المخطّط نصف المستقيم $[Ax)$ وعيّن عليه بالمدور خمس نقط $G_1$ إلى $G_5$ على أبعاد متساوية من $A$ ، ثم رسم الموازيات لـ $(G_5B)$ المارّة بـ $G_1$ و $G_2$ و $G_3$ و $G_4$ ؛ وهي تقطع $[AB]$ في $P_1$ و $P_2$ و $M$ و $P_4$ (الشكل المقابل).',
    parts: [
      {
        label: '1)', title: 'لماذا الحصص متساوية؟',
        question: 'لماذا تتساوى الحصص الخمس على $[AB]$ ؟ ما طول كل حصة؟',
        asks: ['لماذا تتساوى الحصص الخمس؟', 'طول كل حصة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['talis-mubashira'],
            prompt: 'المثلثان $AG_1P_1$ و $AG_5B$ في وضعية طالس، فخاصية طالس تعطي:',
            options: [
              '$\\dfrac{AP_1}{AB} = \\dfrac{AG_1}{AG_5} = \\dfrac{1}{5}$',
              '$\\dfrac{AP_1}{AB} = \\dfrac{AG_1}{AG_5} = \\dfrac{1}{4}$',
              '$\\dfrac{AP_1}{AB} = \\dfrac{G_1G_5}{AG_5}$',
            ],
            correct: 0, cols: 1,
            explain: '$G_1$ هي أولى النقط الخمس، فالنسبة $\\dfrac{AG_1}{AG_5} = \\dfrac{1}{5}$ (خمس قطع متقايسة، لا أربع). والنسبة الأخيرة تقارن $G_1G_5$ بـ $AG_5$ وليس $AG_1$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['talis-mubashira'],
            prompt: 'لماذا تتساوى القطع $AP_1$ و $P_1P_2$ و $P_2M$ و $MP_4$ و $P_4B$ ؟',
            options: [
              'لأنّ القطع $AG_1$ و $G_1G_2$ … على $[Ax)$ متقايسة والموازيات تنقل هذا التساوي إلى $[AB]$ بخاصية طالس',
              'لأنّ الموازيات الأربع متساوية الطول',
              'لأنّ المثلث $AG_5B$ متقايس الأضلاع',
            ],
            correct: 0, cols: 1,
            explain: 'كل موازٍ لـ $(G_5B)$ يعطي نسبة $\\dfrac{AP_k}{AB} = \\dfrac{AG_k}{AG_5} = \\dfrac{k}{5}$ ، فالنقط $P_k$ تقسم $[AB]$ مثلما تقسم $G_k$ القطعة $[AG_5]$ . أطوال الموازيات غير متساوية (تصغر قرب $A$ )، والمثلث $AG_5B$ ليس متقايس الأضلاع.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['talis-mubashira', 'rabi-mutanasib'],
            prompt: 'طول كل حصة بالمتر:', expected: 2.2, shape: 'quantity', unit: 'm',
            explain: '$AP_1 = \\dfrac{1}{5} \\times 11 = 2{,}2$ ، وكل حصة تساويها.' },
          { kind: 'solution', ask: 0, lines: [
            'المثلثان $AG_kP_k$ و $AG_5B$ في وضعية طالس: $\\dfrac{AP_k}{AB} = \\dfrac{AG_k}{AG_5} = \\dfrac{k}{5}$ .',
            'القطع $AG_1$ و $G_1G_2$ … متقايسة، فالنقط $P_k$ تقسم $[AB]$ إلى خمس قطع متقايسة.',
            'طول كل حصة $\\dfrac{11}{5} = 2{,}2$ ، أي $2{,}2\\,\\mathrm{m}$ لكل عائلة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'ما تطلبه العائلات الثلاث الأولى',
        question: 'تطلي العائلات الثلاث الأولى الجزء $[AM]$ والعائلتان الباقيتان الجزء $[MB]$ . احسب $AM$ . ثم احسب $MB$ .',
        asks: ['الطول $AM$', 'الطول $MB$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['talis-mubashira'],
            prompt: '$M$ هي النقطة الثالثة من $A$ . النسبة $\\dfrac{AM}{AB}$ تساوي:',
            options: ['$\\dfrac{3}{5}$', '$\\dfrac{3}{2}$', '$\\dfrac{2}{5}$'],
            correct: 0, cols: 3,
            explain: '$\\dfrac{AM}{AB} = \\dfrac{AG_3}{AG_5} = \\dfrac{3}{5}$ : ثلاث حصص من خمس. النسبة $\\dfrac{3}{2}$ هي $\\dfrac{AM}{MB}$ ، و $\\dfrac{2}{5}$ هي $\\dfrac{MB}{AB}$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['talis-mubashira', 'rabi-mutanasib'],
            prompt: 'الطول $AM$ بالمتر:', expected: 6.6, shape: 'quantity', unit: 'm',
            explain: '$AM = \\dfrac{3}{5} \\times 11 = 6{,}6$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['talis-mubashira'],
            prompt: 'الطول $MB$ بالمتر:', expected: 4.4, shape: 'quantity', unit: 'm',
            explain: '$MB = AB - AM = 11 - 6{,}6 = 4{,}4$ ، وهي حصّتان: $2 \\times 2{,}2 = 4{,}4$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$M$ هي النقطة الثالثة: $\\dfrac{AM}{AB} = \\dfrac{3}{5}$ ومنه $AM = \\dfrac{3}{5} \\times 11 = 6{,}6$ .',
            '$MB = 11 - 6{,}6 = 4{,}4$ ، وهي حصّتان: $2 \\times 2{,}2 = 4{,}4$ .',
            'تطلي العائلات الثلاث الأولى $6{,}6\\,\\mathrm{m}$ والعائلتان الباقيتان $4{,}4\\,\\mathrm{m}$ .',
          ] },
        ],
      },
    ],
  },

  /* ──────────────────────────────────────────────── 4 ── هدية عيد الأمّ ── */
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — هدية عيد الأمّ',
    context: 'شمعة أسطوانية داخل علبة مخروطية',
    emoji: '🕯️',
    source: SOURCE,
    tone: 'amber',
    figure: FIG_CANDLE,
    statement: 'بمناسبة عيد الأمّ، أراد سمير، برًّا بوالدته، أن يضع شمعة على شكل أسطوانة دوران داخل علبة هدايا على شكل مخروط دوران رأسه $O$ ، ارتفاعه $OS = 20\\,\\mathrm{cm}$ ونصف قطر قاعدته $SK = 12\\,\\mathrm{cm}$ . قاعدة الشمعة على قاعدة العلبة، ومحيط قاعدتها العلوية على سطح المخروط. نرمز بـ $h$ إلى ارتفاع الشمعة وبـ $r$ إلى نصف قطرها. الشكل المقابل يمثّل نصف المقطع المحوري.',
    parts: [
      {
        label: '1)', title: 'ارتفاع الشمعة',
        question: 'اختار سمير شمعة نصف قطرها $r = 9\\,\\mathrm{cm}$ . احسب ارتفاعها $h$ .',
        asks: ['ارتفاع الشمعة $h$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['maqta-mihwari-talis'],
            prompt: 'خاصية طالس في المثلثين $OTC$ و $OSK$ تعطي:',
            options: [
              '$\\dfrac{r}{12} = \\dfrac{20 - h}{20}$',
              '$\\dfrac{r}{12} = \\dfrac{h}{20}$',
              '$\\dfrac{12}{r} = \\dfrac{20 - h}{20}$',
            ],
            correct: 0, cols: 1,
            explain: 'الضلع الذي رأسه $O$ في المثلث الصغير $OTC$ هو $OT = 20 - h$ ، أمّا $h = ST$ فهو الطول من قاعدة المخروط. وقلب نسبة واحدة يعطي مساواة خاطئة.' },
          { kind: 'numeric', role: 'compute', requires: ['maqta-mihwari-talis'],
            prompt: 'من $\\dfrac{9}{12} = \\dfrac{OT}{20}$ ، الطول $OT$ بالسنتيمتر:', expected: 15, shape: 'quantity', unit: 'cm',
            explain: '$OT = \\dfrac{9 \\times 20}{12} = 15$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['maqta-mihwari-talis', 'muadala-ula'],
            prompt: 'ارتفاع الشمعة $h$ بالسنتيمتر:', expected: 5, shape: 'quantity', unit: 'cm',
            explain: '$h = ST = SO - OT = 20 - 15 = 5$ .' },
          { kind: 'solution', ask: 0, lines: [
            'المثلثان $OTC$ و $OSK$ في وضعية طالس: $\\dfrac{r}{12} = \\dfrac{OT}{20}$ مع $OT = 20 - h$ .',
            'أي $\\dfrac{9}{12} = \\dfrac{20 - h}{20}$ ومنه $20 - h = \\dfrac{9 \\times 20}{12} = 15$ .',
            '$h = 20 - 15 = 5$ : ارتفاع الشمعة $5\\,\\mathrm{cm}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'حجم الشمعة',
        question: 'احسب حجم هذه الشمعة بدلالة $\\pi$ . ما قيمته المقرّبة إلى الوحدة؟',
        asks: ['الحجم بدلالة $\\pi$', 'القيمة المقرّبة إلى الوحدة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['mulaamat-natija'],
            prompt: 'مساحة قاعدة الشمعة بدلالة $\\pi$ ، أي معامل $\\pi$ في $r^2 \\pi$ :', expected: 81, shape: 'form', subject: '\\pi r^2', factor: '\\pi',
            explain: '$r^2 = 9^2 = 81$ ، فمساحة القاعدة $81\\pi\\,\\mathrm{cm}^2$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mulaamat-natija'],
            prompt: 'حجم الشمعة $V = \\pi r^2 h$ : معامل $\\pi$ في $V$ :', expected: 405, shape: 'form', subject: 'V', factor: '\\pi',
            explain: '$V = 81\\pi \\times 5 = 405\\pi\\,\\mathrm{cm}^3$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['mulaamat-natija'],
            prompt: 'القيمة المقرّبة إلى الوحدة لـ $V$ بالسنتيمتر المكعب:', expected: 1272, shape: 'quantity', unit: 'cm³',
            explain: '$405\\pi \\approx 1272{,}3$ ، أي $1272\\,\\mathrm{cm}^3$ تقريبا.' },
          { kind: 'solution', ask: 0, lines: [
            '$V = \\pi \\times r^2 \\times h = \\pi \\times 9^2 \\times 5 = 405\\pi$ .',
            '$405\\pi \\approx 1272{,}3$ ، أي $V \\approx 1272\\,\\mathrm{cm}^3$ .',
            'حجم الشمعة $405\\pi\\,\\mathrm{cm}^3$ ، أي $1272\\,\\mathrm{cm}^3$ تقريبا.',
          ] },
        ],
      },
      {
        label: '3)', title: 'هل تتّسع علبة الهدايا؟',
        question: 'رغب سمير في شمعة أكبر نصف قطرها $r = 13\\,\\mathrm{cm}$ . هل يمكن وضعها في العلبة؟',
        asks: ['هل يمكن وضع هذه الشمعة في العلبة؟'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['mulaamat-natija'],
            prompt: 'بما أنّ الشمعة داخل المخروط فنصف قطرها يحقّق دائما:',
            options: [
              '$r < 12$ : أصغر من نصف قطر قاعدة العلبة',
              '$r < 20$ : أصغر من ارتفاع العلبة',
              '$r > 12$ : أكبر من نصف قطر قاعدة العلبة',
            ],
            correct: 0, cols: 1,
            explain: 'قاعدة الشمعة على قاعدة المخروط وحافتها العليا على سطحه: $r$ أصغر من نصف قطر القاعدة $12$ ، وإلا خرجت الشمعة من العلبة. الارتفاع $20$ يخصّ $h$ لا $r$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mulaamat-natija', 'maqta-mihwari-talis'],
            prompt: 'هل تتّسع العلبة لشمعة نصف قطرها $13\\,\\mathrm{cm}$ ؟',
            options: [
              'لا: $13 > 12$ ، ولو وُجد $h$ لكان $20 - h = \\dfrac{13 \\times 20}{12} > 20$ أي $h < 0$',
              'نعم: $13 < 20$',
              'نعم: نختار $h$ صغيرا جدا',
            ],
            correct: 0, cols: 1,
            explain: 'من $\\dfrac{r}{12} = \\dfrac{20 - h}{20}$ ينتج $20 - h = \\dfrac{20 r}{12}$ ؛ مع $r = 13$ نجد $20 - h$ أكبر من $20$ أي $h$ سالبا: مستحيل. النتيجة غير ملائمة، فالشمعة لا تتّسع مهما كان ارتفاعها.' },
          { kind: 'solution', ask: 0, lines: [
            'الشمعة داخل المخروط، فيجب أن يكون $r < 12$ ؛ و $13 > 12$ .',
            'وبحساب: $\\dfrac{13}{12} = \\dfrac{20 - h}{20}$ يعطي $20 - h = \\dfrac{13 \\times 20}{12} > 20$ أي $h < 0$ : مستحيل.',
            'لا تتّسع العلبة لشمعة نصف قطرها $13\\,\\mathrm{cm}$ ، ويجب أن نختار $r < 12$ .',
          ] },
        ],
      },
    ],
  },

  /* ──────────────────────────────────────────────── 5 ── عرض البحيرة ── */
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — عرض البحيرة',
    context: 'مسافة لا نقيسها مباشرة',
    emoji: '🏞️',
    source: SOURCE,
    tone: 'rose',
    figure: FIG_LAKE,
    statement: 'ضمن حملة نظافة بحيرة الحيّ، يريد نادي البيئة في المتوسطة معرفة المسافة $AB$ بين نقطتين $A$ و $B$ على ضفّتيها ليمدّ حبلًا عائمًا يحصر النفايات، ولا يمكن قياسها مباشرة. اختار التلاميذ نقطة $O$ على اليابسة، وعيّنوا $C$ على المستقيم $(AO)$ و $D$ على المستقيم $(BO)$ بحيث تقع $O$ بين $A$ و $C$ وبين $B$ و $D$ (الشكل المقابل)، وقاسوا: $OA = 30\\,\\mathrm{m}$ و $OC = 12\\,\\mathrm{m}$ و $OB = 35\\,\\mathrm{m}$ و $OD = 14\\,\\mathrm{m}$ و $CD = 18\\,\\mathrm{m}$ .',
    data: [
      { id: 'a', text: 'المسافة OA هي 30 m والمسافة OC هي 12 m، و O بين A و C', useful: true },
      { id: 'b', text: 'المسافة OB هي 35 m والمسافة OD هي 14 m، و O بين B و D', useful: true },
      { id: 'cd', text: 'المسافة CD هي 18 m', useful: true },
      { id: 'rope', text: 'يلزم حبلان متوازيان طول كل منهما AB، ويُزاد 5 m للربط', useful: true },
      { id: 'pupils', text: 'شارك في الحملة 25 تلميذًا', useful: false },
      { id: 'hours', text: 'دامت الحملة 3 ساعات', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'هل (AB) // (CD)؟',
        question: 'بيّن أنّ المستقيمين $(AB)$ و $(CD)$ متوازيان.',
        asks: ['تبرير توازي $(AB)$ و $(CD)$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['talis-aksiya'],
            prompt: 'لنثبت التوازي بالخاصية العكسية لخاصية طالس نقارن:',
            options: [
              'النسبتين $\\dfrac{OC}{OA}$ و $\\dfrac{OD}{OB}$ ، ونتأكّد من ترتيب النقط $A, O, C$ و $B, O, D$',
              'الطولين $OA$ و $OB$ فقط',
              'الطولين $CD$ و $AB$',
            ],
            correct: 0, cols: 1,
            explain: 'الخاصية العكسية: نسبتان متساويتان ونقط مرتّبة بالترتيب نفسه تعطيان التوازي. $AB$ مجهول فلا نقارنه بـ $CD$ ، ومقارنة $OA$ بـ $OB$ لا تكفي.' },
          { kind: 'numeric', role: 'compute', requires: ['talis-aksiya'],
            prompt: 'القيمة العشرية للنسبة $\\dfrac{OC}{OA}$ :', expected: 0.4, shape: 'decimal',
            explain: '$\\dfrac{OC}{OA} = \\dfrac{12}{30} = 0{,}4$ .' },
          { kind: 'numeric', role: 'compute', requires: ['talis-aksiya'],
            prompt: 'القيمة العشرية للنسبة $\\dfrac{OD}{OB}$ :', expected: 0.4, shape: 'decimal',
            explain: '$\\dfrac{OD}{OB} = \\dfrac{14}{35} = 0{,}4$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['talis-aksiya'],
            prompt: 'ماذا نستنتج؟',
            options: [
              'النسبتان متساويتان، و $O$ بين $A$ و $C$ وبين $B$ و $D$ (الترتيب نفسه) إذن $(AB) \\parallel (CD)$',
              'النسبتان متساويتان إذن $AB = CD$',
              'النسبتان متساويتان إذن المستقيمان متوازيان دون أيّ شرط على ترتيب النقط',
            ],
            correct: 0, cols: 1,
            explain: 'تساوي النسبتين وحده لا يكفي: يجب أن تكون النقطتان $C$ و $D$ على الجهتين نفسيهما من $O$ نسبة إلى $A$ و $B$ ، وهنا $O$ بين كل زوج. تساوي النسبتين لا يعني تساوي طولين: $AB \\neq CD$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$\\dfrac{OC}{OA} = \\dfrac{12}{30} = 0{,}4$ و $\\dfrac{OD}{OB} = \\dfrac{14}{35} = 0{,}4$ ، إذن $\\dfrac{OC}{OA} = \\dfrac{OD}{OB}$ .',
            'النقط $A, O, C$ على استقامة و $B, O, D$ على استقامة، و $O$ تقع بين $A$ و $C$ وبين $B$ و $D$ : الترتيب نفسه.',
            'حسب الخاصية العكسية لخاصية طالس، $(AB)$ و $(CD)$ متوازيان.',
          ] },
        ],
      },
      {
        label: '2)', title: 'عرض البحيرة والحبل',
        question: 'احسب المسافة $AB$ . ما طول الحبل اللازم؟',
        asks: ['المسافة $AB$', 'طول الحبل اللازم'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['talis-mubashira'],
            prompt: 'بما أنّ $(AB) \\parallel (CD)$ فخاصية طالس تعطي:',
            options: [
              '$\\dfrac{AB}{CD} = \\dfrac{OA}{OC}$',
              '$\\dfrac{AB}{CD} = \\dfrac{OC}{OA}$',
              '$\\dfrac{AB}{OA} = \\dfrac{OC}{CD}$',
            ],
            correct: 0, cols: 1,
            explain: 'المثلثان $OAB$ و $OCD$ في وضعية طالس (فراشة): كل طول من $OAB$ على الطول الموافق من $OCD$ ، أي $\\dfrac{OA}{OC} = \\dfrac{OB}{OD} = \\dfrac{AB}{CD}$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['talis-mubashira', 'rabi-mutanasib'],
            prompt: 'المسافة $AB$ بالمتر:', expected: 45, shape: 'quantity', unit: 'm',
            explain: '$AB = \\dfrac{18 \\times 30}{12} = 45$ . تحقّق: $\\dfrac{OB}{OD} = \\dfrac{35}{14} = 2{,}5 = \\dfrac{45}{18}$ .' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'طول الحبل اللازم بالمتر (حبلان طول كل منهما $AB$ ، و $5\\,\\mathrm{m}$ للربط):', expected: 95, shape: 'quantity', unit: 'm',
            explain: '$2 \\times 45 + 5 = 95$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$(AB) \\parallel (CD)$ ، والمثلثان $OAB$ و $OCD$ في وضعية طالس: $\\dfrac{AB}{CD} = \\dfrac{OA}{OC}$ أي $\\dfrac{AB}{18} = \\dfrac{30}{12}$ .',
            '$AB = \\dfrac{18 \\times 30}{12} = 45$ : عرض البحيرة $45\\,\\mathrm{m}$ .',
            'طول الحبل: $2 \\times 45 + 5 = 95$ ، أي $95\\,\\mathrm{m}$ .',
          ] },
        ],
      },
    ],
  },

  /* ──────────────────────────────────────────────── 6 ── زربية ركن القراءة ── */
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — زربية ركن القراءة',
    context: 'تصغير مثلث ومعامل k',
    emoji: '📖',
    source: SOURCE,
    tone: 'violet',
    table: {
      head: ['الضلع', 'الزربية الكبيرة ABC', 'الزربية الصغيرة AMN'],
      rows: [
        ['AB', '4,5 m', 'AM = 3 m'],
        ['AC', '6 m', 'AN = ؟'],
        ['BC', '7,5 m', 'MN = ؟'],
      ],
      caption: 'أضلاع الزربيتين',
    },
    statement: 'حبًّا للعلم والقراءة، تهيّئ مكتبة المتوسطة ركنًا للمطالعة بزربية كبيرة على شكل مثلث $ABC$ ، وتصنع للأطفال زربية صغيرة هي تصغير لها على شكل المثلث $AMN$ حيث $M \\in [AB]$ و $N \\in [AC]$ و $(MN) \\parallel (BC)$ . أطوال الأضلاع في الجدول المقابل.',
    parts: [
      {
        label: '1)', title: 'معامل التصغير',
        question: 'ما معامل التصغير $k$ ؟ ما طول $AN$ ؟ ما طول $MN$ ؟',
        asks: ['معامل التصغير $k$', 'طول $AN$', 'طول $MN$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['talis-mubashira'],
            prompt: 'لأنّ $(MN) \\parallel (BC)$ فالمثلث $AMN$ تصغير للمثلث $ABC$ ، ومعامل التصغير:',
            options: ['$k = \\dfrac{AM}{AB}$', '$k = \\dfrac{AB}{AM}$', '$k = AB - AM$'],
            correct: 0, cols: 3,
            explain: 'خاصية طالس: $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC} = k$ ، نسبة طول من الصغير إلى الطول الموافق من الكبير. $\\dfrac{AB}{AM}$ هو معامل التكبير، والفرق ليس نسبة.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['talis-mubashira', 'rabi-mutanasib'],
            prompt: 'قيمة $k$ :',
            options: ['$\\dfrac{2}{3}$', '$\\dfrac{3}{2}$', '$\\dfrac{3}{4}$'],
            correct: 0, cols: 3,
            explain: '$k = \\dfrac{AM}{AB} = \\dfrac{3}{4{,}5} = \\dfrac{2}{3}$ ، وهو أصغر من $1$ لأنّ الزربية الصغيرة تصغير. $\\dfrac{3}{2}$ هو معامل التكبير.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['talis-mubashira', 'rabi-mutanasib'],
            prompt: 'الطول $AN$ بالمتر:', expected: 4, shape: 'quantity', unit: 'm',
            explain: '$AN = k \\times AC = \\dfrac{2}{3} \\times 6 = 4$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['talis-mubashira', 'rabi-mutanasib'],
            prompt: 'الطول $MN$ بالمتر:', expected: 5, shape: 'quantity', unit: 'm',
            explain: '$MN = k \\times BC = \\dfrac{2}{3} \\times 7{,}5 = 5$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$(MN) \\parallel (BC)$ : $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC} = k$ مع $k = \\dfrac{3}{4{,}5} = \\dfrac{2}{3}$ .',
            '$AN = \\dfrac{2}{3} \\times 6 = 4$ و $MN = \\dfrac{2}{3} \\times 7{,}5 = 5$ .',
            'معامل التصغير $\\dfrac{2}{3}$ ، وطولا الضلعين $AN = 4\\,\\mathrm{m}$ و $MN = 5\\,\\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الشرابات على الحافة',
        question: 'تُزيَّن حافة الزربية الصغيرة بشرابات سعر المتر منها 150 دج. احسب محيط الزربية الكبيرة. احسب محيط الزربية الصغيرة باستعمال $k$ . ما ثمن الشرابات؟',
        asks: ['محيط الزربية الكبيرة', 'محيط الزربية الصغيرة', 'ثمن الشرابات'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'محيط الزربية الكبيرة بالمتر:', expected: 18, shape: 'quantity', unit: 'm',
            explain: '$4{,}5 + 6 + 7{,}5 = 18$ .' },
          { kind: 'choice', role: 'translate', requires: ['talis-mubashira'],
            prompt: 'محيط المثلث الصغير بدلالة محيط المثلث الكبير:',
            options: [
              'نضرب محيط الكبير في $k$',
              'نضرب محيط الكبير في $k^2$',
              'ننقص من محيط الكبير الفرق $AB - AM$',
            ],
            correct: 0, cols: 1,
            explain: 'كل ضلع من الصغير هو $k$ مرة الضلع الموافق من الكبير، فمجموع الأضلاع المحيط يُضرب في $k$ أيضا. $k^2$ معامل المساحات لا الأطوال.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['talis-mubashira', 'rabi-mutanasib'],
            prompt: 'محيط الزربية الصغيرة بالمتر:', expected: 12, shape: 'quantity', unit: 'm',
            explain: '$\\dfrac{2}{3} \\times 18 = 12$ ، وهو أيضا $3 + 4 + 5 = 12$ .' },
          { kind: 'numeric', role: 'answer', ask: 2,
            prompt: 'ثمن الشرابات بالدينار:', expected: 1800, shape: 'quantity', unit: 'دج',
            explain: '$12 \\times 150 = 1800$ .' },
          { kind: 'solution', ask: 0, lines: [
            'محيط الكبيرة: $4{,}5 + 6 + 7{,}5 = 18$ ، أي $18\\,\\mathrm{m}$ .',
            'محيط الصغيرة: $k \\times 18 = \\dfrac{2}{3} \\times 18 = 12$ ، أي $12\\,\\mathrm{m}$ (وهو $3 + 4 + 5$ ).',
            'ثمن الشرابات: $12 \\times 150 = 1800$ دينار.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
