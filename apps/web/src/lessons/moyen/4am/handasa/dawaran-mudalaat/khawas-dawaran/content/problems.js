/**
 * Les trois « مسائل » du درس « خواص الدوران وتوظيفها في الأشكال الهندسية » (modules 5, 6, 7) — des exercices COMPLETS
 * de type امتحان, résolus pas à pas (common/problems/GuidedProblem.jsx).
 *
 * AJOUTS DE LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`) : le manuel ne les contient pas. Ils
 * restent dans le périmètre de la leçon : les quatre conservations (P1), la droite et son image — 90° ⇒ ⊥, 180° ⇒ ∥,
 * l'angle obtus replié (P2), prouver par un دوران (P2), le centre par deux médiatrices (P3) — et les acquis antérieurs
 * (image d'un point, médiatrice, Pythagore, milieu dans un repère). Jamais l'angle inscrit (درس 3) ni le polygone
 * régulier (درس 4).
 *
 *   مسألة 1 « مسألة الدرس » — la طريقة du niveau متقدم du laboratoire (deux triangles rectangles isocèles en O, [AC] et
 *            [BD]), autres nombres : OA = 6, OC = 8, B ∈ [OC] ⇒ AC = 10 (Pythagore) = BD, (AC) ⊥ (BD), aire 24 → 600 دج.
 *            Son énoncé ET sa figure vivent dans `LESSON_CONFIG.lessonProblem` (carte du sommaire et du module 1).
 *   مسألة 2 le باب دوّار d'un hôtel d'Oran : retrouver l'axe O (les médiatrices de [MM′] et [NN′] sont CONFONDUES —
 *            M, N, O sur une même aile —, celle de [PP′] tranche : O(6 ; 6)), la poignée après ¼ et ½ tour, le verre.
 *   مسألة 3 l'عنفة ريحية de Kabertène (Adrar) : 120° ⇒ droites à 60°, ½ tour pour la maintenance (29 m), la peinture.
 *
 * Chaque nombre est recalculé dans ./problems.test.js (figures : rotation.js, exact).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

/* ── مسألة 2 : le plan au sol (unité du repère = 20 cm), axe O(6 ; 6) NON dessiné ── */
export const DOOR_PTS = { M: [8, 6], N: [10, 6], P: [6, 12], "M'": [6, 8], "N'": [6, 10], "P'": [0, 6] };
const DOOR_FIGURE = {
  points: DOOR_PTS,
  segments: [{ from: 'M', to: 'N', tone: 'rose', bold: true }, { from: "M'", to: "N'", tone: 'indigo', bold: true }],
  grid: true,
  axes: { every: 2 },
  labels: { "M'": 'w', "N'": 'w', P: 'e', M: 's', N: 's', "P'": 'ne' },
  ariaLabel: 'مخطّط أرضية الباب الدوّار في معلم: المقبض [MN] وطرف الجناح P قبل ربع الدورة، والمقبض [M′N′] والنقطة P′ بعدها؛ المحور O غير معلّم',
  maxWidth: 420,
};

/* ── مسألة 3 : la vue de face (mètres) ; B, C images de A par (O, 120°) et (O, 240°), arrondies au millième ── */
export const TURBINE_PTS = {
  O: [0, 0], A: [0, 26], B: [-22.517, -13], C: [22.517, -13], H: [0, -55], G: [-24, -55], K: [24, -55],
};
const TURBINE_FIGURE = {
  points: TURBINE_PTS,
  segments: [{ from: 'O', to: 'H', tone: 'slate' }, { from: 'G', to: 'K', tone: 'slate' },
    { from: 'O', to: 'A', tone: 'emerald', bold: true }, { from: 'O', to: 'B', tone: 'emerald', bold: true },
    { from: 'O', to: 'C', tone: 'emerald', bold: true }],
  rightAngles: [['O', 'H', 'K']],
  angles: [{ at: 'O', from: 'A', to: 'B', label: '120°', arrow: true }],
  labels: { O: 'e', H: 's', A: 'n' },
  hidden: ['G', 'K'],
  ariaLabel: 'عنفة ريحية: المحور O على البرج العمودي [OH]، والشفرات [OA] (عمودية نحو الأعلى) و [OB] و [OC]، والزاوية من A إلى B قيسها 120 درجة في الاتجاه المباشر',
  maxWidth: 300,
};

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — نجمة الزليج',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '✴️',
    source: SOURCE,
    statement: LESSON_CONFIG.lessonProblem.statement,
    figure: LESSON_CONFIG.lessonProblem.figure,
    data: [
      { id: 'tri', text: 'المثلثان OAB و OCD قائمان في O ومتساويا الساقين', useful: true },
      { id: 'len', text: 'الضلع OA طوله 6 cm والضلع OC طوله 8 cm', useful: true },
      { id: 'onOC', text: 'النقطة B تنتمي إلى القطعة [OC]', useful: true },
      { id: 'dir', text: 'B و D في الاتجاه المباشر من A و C', useful: true },
      { id: 'gold', text: 'الطلاء الذهبي: 25 دج للسنتيمتر المربّع', useful: true },
      { id: 'paper', text: 'ثمن الورقة الشفافة 120 دج', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'دوران يحوّل [AC] إلى [BD]',
        question: 'بيّن أنّ $[BD]$ هي صورة $[AC]$ بدوران يُطلب تعيين مركزه وزاويته.',
        asks: ['$[BD]$ صورة $[AC]$ بدوران: مركزه وزاويته'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['surat-qita-dawaran'],
            prompt: 'لكي نبيّن أنّ $[BD]$ صورة $[AC]$ بدوران، يكفي أن نبيّن أنّ:',
            options: ['$B$ صورة $A$ و $D$ صورة $C$ بالدوران نفسه', '$AC = BD$', '$B$ صورة $A$ بدوران، و $D$ صورة $C$ بدوران آخر', '$(AC) \\perp (BD)$'],
            correct: 0,
            explain: 'صورة قطعة بدوران هي القطعة التي طرفاها صورتا طرفيها بالدوران نفسه. أمّا $AC = BD$ و $(AC) \\perp (BD)$ فهما ما نستنتجه بعد ذلك، لا ما نبدأ به.' },
          { kind: 'choice', role: 'conclude', requires: ['surat-nuqta-dawaran', 'muthallath-qaim-mutasawi'],
            prompt: 'لماذا $B$ صورة $A$ بدوران مركزه $O$ ؟ اختر التعليل الكامل:',
            options: [
              '$OA = OB$ و $\\widehat{AOB} = 90^\\circ$ ، ومن $A$ إلى $B$ عكس اتجاه عقارب الساعة',
              '$OA = OB$ فقط',
              '$\\widehat{AOB} = 90^\\circ$ فقط',
              '$B$ تنتمي إلى القطعة $[OC]$',
            ],
            correct: 0,
            explain: 'المثلث $OAB$ قائم في $O$ ومتساوي الساقين: $OA = OB = 6\\,\\mathrm{cm}$ و $\\widehat{AOB} = 90^\\circ$ . صورة نقطة تحتاج الشرطين معًا (نفس البعد عن المركز، والزاوية) مع الاتجاه.' },
          { kind: 'choice', role: 'conclude', requires: ['surat-nuqta-dawaran'],
            prompt: 'وبالطريقة نفسها، $D$ صورة $C$ بالدوران نفسه لأنّ:',
            options: [
              '$OC = OD = 8\\,\\mathrm{cm}$ و $\\widehat{COD} = 90^\\circ$ في الاتجاه المباشر',
              '$OD = OA = 6\\,\\mathrm{cm}$ و $\\widehat{COD} = 90^\\circ$',
              '$OC = OD = 8\\,\\mathrm{cm}$ و $\\widehat{COD} = 45^\\circ$',
            ],
            correct: 0,
            explain: 'المثلث $OCD$ قائم في $O$ ومتساوي الساقين: $OD = OC = 8\\,\\mathrm{cm}$ (لا $OA$)، والزاوية في الرأس $O$ قائمة ($45^\\circ$ هي زاوية القاعدة).' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['istimal-khawas'],
            prompt: 'إذن $[BD]$ صورة $[AC]$ بالدوران الذي:',
            options: [
              'مركزه $O$ وزاويته $90^\\circ$ في الاتجاه المباشر',
              'مركزه $O$ وزاويته $90^\\circ$ في الاتجاه غير المباشر',
              'مركزه $O$ وزاويته $180^\\circ$',
              'مركزه $B$ وزاويته $90^\\circ$ في الاتجاه المباشر',
            ],
            correct: 0,
            explain: 'الدوران نفسه يحوّل $A$ إلى $B$ و $C$ إلى $D$ : مركزه $O$ وزاويته $90^\\circ$ ، ومن $A$ إلى $B$ عكس عقارب الساعة (الاتجاه المباشر).' },
          { kind: 'solution', ask: 0, lines: [
            'المثلث $OAB$ قائم في $O$ ومتساوي الساقين: $OA = OB$ و $\\widehat{AOB} = 90^\\circ$ ، إذن $B$ صورة $A$ بالدوران الذي مركزه $O$ وزاويته $90^\\circ$ في الاتجاه المباشر.',
            'وكذلك $OC = OD$ و $\\widehat{COD} = 90^\\circ$ : $D$ صورة $C$ بنفس الدوران.',
            'ومنه $[BD]$ صورة $[AC]$ بالدوران الذي مركزه $O$ وزاويته $90^\\circ$ في الاتجاه المباشر.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الخيطان النحاسيان',
        question: 'احسب الطول $AC$ ، ثم استنتج الطول $BD$ ووضع المستقيمين $(AC)$ و $(BD)$ .',
        asks: ['الطول $AC$', 'الطول $BD$', 'وضع المستقيمين $(AC)$ و $(BD)$'],
        steps: [
          { kind: 'choice', role: 'translate',
            prompt: 'لماذا المثلث $OAC$ قائم في $O$ ؟',
            options: [
              'لأنّ $B$ تنتمي إلى $[OC]$ ، فالزاوية $\\widehat{AOC}$ هي الزاوية القائمة $\\widehat{AOB}$',
              'لأنّ $OA = OC$',
              'لأنّ $[BD]$ صورة $[AC]$',
            ],
            correct: 0,
            explain: 'نصف المستقيم $[OC)$ هو نفسه $[OB)$ ، إذن $\\widehat{AOC} = \\widehat{AOB} = 90^\\circ$ . و $OA = 6$ لا يساوي $OC = 8$ .' },
          { kind: 'numeric', role: 'compute',
            prompt: 'حسب خاصية فيتاغورس في المثلث $OAC$ : $AC^2 = OA^2 + OC^2 = \\ldots$', expected: 100,
            explain: '$6^2 + 8^2 = 36 + 64 = 100$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, prompt: 'الطول $AC$ بالسنتيمتر:', expected: 10, suffix: 'cm',
            explain: '$AC = \\sqrt{100} = 10$ ، لأنّ $10^2 = 100$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['khawas-dawaran'], prompt: 'الطول $BD$ بالسنتيمتر، دون قياس:', expected: 10, suffix: 'cm',
            explain: '$[BD]$ صورة $[AC]$ بدوران، والدوران يحافظ على الأطوال: $BD = AC$ .' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['zawiya-sura'],
            prompt: 'ما وضع المستقيمين $(AC)$ و $(BD)$ ؟',
            options: [
              'متعامدان: صورة مستقيم بدوران زاويته $90^\\circ$ تعامده',
              'متوازيان: صورة مستقيم بدوران توازيه دائمًا',
              'يتقاطعان بزاوية $45^\\circ$',
            ],
            correct: 0,
            explain: 'المستقيم وصورته يصنعان زاوية الدوران؛ وهي هنا $90^\\circ$ ، فـ $(BD) \\perp (AC)$ . التوازي لا يكون إلا بزاوية $180^\\circ$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$B \\in [OC]$ ، إذن $\\widehat{AOC} = 90^\\circ$ ، وحسب خاصية فيتاغورس: $AC^2 = 6^2 + 8^2 = 100$ ، أي $AC = 10\\,\\mathrm{cm}$ .',
            '$[BD]$ صورة $[AC]$ بالدوران الذي مركزه $O$ وزاويته $90^\\circ$ ، والدوران يحافظ على الأطوال: $BD = AC = 10\\,\\mathrm{cm}$ .',
            'وصورة مستقيم بدوران زاويته $90^\\circ$ تعامده: $(BD) \\perp (AC)$ ؛ الخيطان النحاسيان متقايسان ومتعامدان.',
          ] },
        ],
      },
      {
        label: '3)', title: 'الطلاء الذهبي',
        question: 'احسب مساحة المثلث $OBD$ دون قياس، ثم احسب ثمن الطلاء الذهبي.',
        asks: ['مساحة المثلث $OBD$', 'ثمن الطلاء الذهبي'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['khawas-dawaran'],
            prompt: 'المثلث $OBD$ هو صورة أيّ مثلث بهذا الدوران؟',
            options: ['المثلث $OAC$', 'المثلث $OAB$', 'المثلث $OCD$', 'المثلث $ABD$'],
            correct: 0, cols: 2,
            explain: 'الدوران يحوّل $O$ إلى $O$ (المركز) و $A$ إلى $B$ و $C$ إلى $D$ : صورة المثلث $OAC$ هي المثلث $OBD$ .' },
          { kind: 'numeric', role: 'compute', prompt: 'مساحة المثلث $OAC$ القائم في $O$ بالسنتيمتر المربّع:', expected: 24,
            explain: '$\\dfrac{OA \\times OC}{2} = \\dfrac{6 \\times 8}{2} = 24$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['khawas-dawaran'], prompt: 'مساحة المثلث $OBD$ بالسنتيمتر المربّع:', expected: 24, suffix: 'cm²',
            explain: 'الدوران يحافظ على المساحات، و $OBD$ صورة $OAC$ : لهما المساحة نفسها (وليست مساحة $OAB$ التي تساوي $\\dfrac{6 \\times 6}{2} = 18$).' },
          { kind: 'numeric', role: 'answer', ask: 1, prompt: 'ثمن الطلاء الذهبي:', expected: 600, suffix: 'دج',
            explain: '$24 \\times 25 = 600$ .' },
          { kind: 'solution', lines: [
            'المثلث $OBD$ صورة المثلث $OAC$ بالدوران الذي مركزه $O$ وزاويته $90^\\circ$ ، والدوران يحافظ على المساحات.',
            'مساحة $OBD$ تساوي مساحة $OAC$ : $\\dfrac{6 \\times 8}{2} = 24$ ، أي $24\\,\\mathrm{cm}^2$ .',
            'ثمن الطلاء الذهبي: $24 \\times 25 = 600$ ، أي 600 دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — الباب الدوّار',
    context: 'مخطّط باب دوّار: أين المحور؟',
    emoji: '🚪',
    source: SOURCE,
    statement: 'يركّب تقنيّ بابًا دوّارًا جديدًا في مدخل فندق بوهران يضمّ 120 غرفة، ويعاين قياساته مرتين أمانةً في عمله. للباب أربعة أجنحة زجاجية تدور حول محور عمودي، وكلّ دخول يدير الباب ربع دورة ($90^\\circ$) في الاتجاه المباشر، فيأخذ كلّ جناح مكان الجناح الذي يليه. في مخطّط الأرضية المزوّد بمعلم وحدته $20\\,\\mathrm{cm}$ (الشكل المقابل) رُسم مقبض الدفع $[MN]$ المثبّت على أحد الأجنحة وطرف جناح آخر $P$ ، ثم موضعاهما $[M\'N\']$ و $P\'$ بعد ربع دورة: $M(8\\,;\\,6)$ و $N(10\\,;\\,6)$ و $P(6\\,;\\,12)$ ، و $M\'(6\\,;\\,8)$ و $N\'(6\\,;\\,10)$ و $P\'(0\\,;\\,6)$ . لكنّ الرسّام نسي أن يعلّم المحور $O$. ارتفاع كلّ جناح $2\\,\\mathrm{m}$ ، وثمن المتر المربّع من الزجاج المقسّى 6500 دج.',
    figure: DOOR_FIGURE,
    data: [
      { id: 'unit', text: 'وحدة المعلم في المخطّط 20 cm', useful: true },
      { id: 'points', text: 'المقبض [MN] وطرف الجناح P قبل ربع الدورة وبعدها', useful: true },
      { id: 'turn', text: 'كلّ دخول يدير الباب ربع دورة في الاتجاه المباشر', useful: true },
      { id: 'height', text: 'ارتفاع كلّ جناح 2 m', useful: true },
      { id: 'glass', text: 'المتر المربّع من الزجاج المقسّى بـ 6500 دج', useful: true },
      { id: 'rooms', text: 'الفندق يضمّ 120 غرفة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'أين المحور؟',
        question: 'لماذا لا يكفي محورا القطعتين $[MM\']$ و $[NN\']$ لتعيين المحور $O$ ؟ ثم عيّن إحداثيتي $O$ مستعملًا $P$ و $P\'$ .',
        asks: ['لماذا لا يكفي المحوران؟', 'إحداثيتا $O$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['markaz-dawaran', 'mihwar-qita'],
            prompt: 'المحور $O$ هو مركز الدوران الذي يحوّل $M$ إلى $M\'$ . ماذا نعرف عن $O$ ؟',
            options: [
              '$OM = OM\'$ : النقطة $O$ تنتمي إلى محور القطعة $[MM\']$',
              '$O$ منتصف القطعة $[MM\']$',
              '$O$ تنتمي إلى المستقيم $(MM\')$',
            ],
            correct: 0,
            explain: 'صورة نقطة بدوران على نفس البعد من المركز، ومحور قطعة هو مجموعة النقط المتساوية البعد عن طرفيها. المنتصف نقطة واحدة من هذا المحور، لا غير.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['markaz-dawaran'],
            prompt: 'ماذا تلاحظ على محوري القطعتين $[MM\']$ و $[NN\']$ ؟',
            options: [
              'منطبقان: $M$ و $N$ على جناح واحد مع $O$ ، فالمحوران مستقيم واحد ولا يعيّنان نقطة',
              'متوازيان: لا يتقاطعان، إذن لا مركز لهذا الدوران',
              'متقاطعان في منتصف القطعة $[MN]$',
            ],
            correct: 0,
            explain: 'منتصف $[MM\']$ هو $(7\\,;\\,7)$ ومنتصف $[NN\']$ هو $(8\\,;\\,8)$ ، والمحوران كلاهما المستقيم الذي تتساوى عليه الفاصلة والترتيبة: مستقيم واحد. نحتاج زوجًا آخر: نقطة وصورتها ليستا على هذا الجناح.' },
          { kind: 'numeric', role: 'compute', prompt: 'فاصلة منتصف القطعة $[PP\']$ :', expected: 3,
            explain: '$\\dfrac{6 + 0}{2} = 3$ .' },
          { kind: 'numeric', role: 'compute', prompt: 'ترتيبة منتصف القطعة $[PP\']$ :', expected: 9,
            explain: '$\\dfrac{12 + 6}{2} = 9$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['markaz-dawaran'],
            prompt: 'محور $[PP\']$ يقطع محور $[MM\']$ في المركز $O$ . إحداثيتا $O$ :',
            options: ['$(6\\,;\\,6)$', '$(7\\,;\\,7)$', '$(3\\,;\\,9)$', '$(0\\,;\\,0)$'],
            correct: 0, cols: 2,
            explain: 'محور $[PP\']$ يمرّ بمنتصفها $(3\\,;\\,9)$ ويعامدها، فيقطع محور $[MM\']$ في $(6\\,;\\,6)$ . تحقّق: $OM = OM\' = 2$ و $OP = OP\' = 6$ . أمّا $(7\\,;\\,7)$ و $(3\\,;\\,9)$ فمنتصفان، و $(0\\,;\\,0)$ أصل المعلم.' },
          { kind: 'solution', ask: 0, lines: [
            'المركز $O$ على نفس البعد من كلّ نقطة ومن صورتها، فهو على محور $[MM\']$ وعلى محور $[NN\']$ .',
            'لكنّ $M$ و $N$ و $O$ على جناح واحد، فالمحوران منطبقان ولا يعيّنان نقطة.',
            'محور $[PP\']$ يقطع محور $[MM\']$ في $O(6\\,;\\,6)$ : هنا يُثبَّت محور الباب.',
          ] },
        ],
      },
      {
        label: '2)', title: 'مقبض الدفع',
        question: 'ما طول المقبض $[M\'N\']$ بالسنتيمتر؟ وما وضع المستقيم $(M\'N\')$ بالنسبة إلى $(MN)$ ؟ وبعد دخول شخص ثانٍ، ما وضع المقبض بالنسبة إلى وضعه الأول $(MN)$ ؟',
        asks: ['طول المقبض $[M\'N\']$', 'وضع $(M\'N\')$ بالنسبة إلى $(MN)$', 'وضع المقبض بعد دخول شخص ثانٍ'],
        steps: [
          { kind: 'numeric', role: 'compute', prompt: 'طول القطعة $[MN]$ بوحدة المعلم:', expected: 2,
            explain: '$M$ و $N$ لهما نفس الترتيبة 6: $MN = 10 - 8 = 2$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['khawas-dawaran'], prompt: 'طول المقبض $[M\'N\']$ بالسنتيمتر:', expected: 40, suffix: 'cm',
            explain: '$[M\'N\']$ صورة $[MN]$ بدوران، والدوران يحافظ على الأطوال: $M\'N\' = MN = 2$ وحدة، أي $2 \\times 20 = 40$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['zawiya-sura'],
            prompt: 'وضع المستقيم $(M\'N\')$ بالنسبة إلى $(MN)$ :',
            options: ['متعامدان', 'متوازيان', 'يصنعان زاوية $45^\\circ$'],
            correct: 0, cols: 3,
            explain: 'صورة مستقيم بدوران زاويته $90^\\circ$ تعامده: $(MN)$ أفقي و $(M\'N\')$ عمودي.' },
          { kind: 'choice', role: 'translate',
            prompt: 'بعد دخول الشخص الثاني، بأيّ زاوية دار الباب انطلاقًا من وضعه الأول؟',
            options: ['$180^\\circ$ : ربعا دورة، أي نصف دورة', '$90^\\circ$ فقط', '$360^\\circ$ : دورة كاملة'],
            correct: 0,
            explain: 'كلّ دخول يدير الباب $90^\\circ$ حول المحور نفسه وفي الاتجاه نفسه: $90^\\circ + 90^\\circ = 180^\\circ$ .' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['zawiya-sura'],
            prompt: 'وضع المقبض بعد دخول الشخص الثاني بالنسبة إلى وضعه الأول $(MN)$ :',
            options: [
              'على المستقيم $(MN)$ نفسه: صورة مستقيم بدوران زاويته $180^\\circ$ توازيه، وهنا $O$ تنتمي إلى $(MN)$',
              'عمودي على $(MN)$ ، كما بعد ربع دورة',
              'يوازي $(MN)$ على بعد وحدتين منه',
            ],
            correct: 0,
            explain: '$O(6\\,;\\,6)$ و $M(8\\,;\\,6)$ و $N(10\\,;\\,6)$ على مستقيم واحد. صورة $(MN)$ بدوران زاويته $180^\\circ$ توازيها وتمرّ بـ $O$ ، فهي $(MN)$ نفسها: يصل المقبض إلى $(4\\,;\\,6)$ و $(2\\,;\\,6)$ ، في الجهة الأخرى من المحور.' },
          { kind: 'solution', ask: 0, lines: [
            '$[M\'N\']$ صورة $[MN]$ بالدوران الذي مركزه $O$ وزاويته $90^\\circ$ : $M\'N\' = MN = 2$ وحدة، أي $40\\,\\mathrm{cm}$ ، و $(M\'N\') \\perp (MN)$ .',
            'بعد دخول شخص ثانٍ دار الباب $180^\\circ$ : صورة $(MN)$ توازيها، ولأنّ $O \\in (MN)$ فهي $(MN)$ نفسه.',
            'يعود المقبض إلى المستقيم $(MN)$ ، في الجهة الأخرى من المحور $O$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'زجاج الأجنحة',
        question: 'احسب طول الجناح بالمتر، ثم احسب ثمن زجاج الأجنحة الأربعة.',
        asks: ['طول الجناح', 'ثمن زجاج الأجنحة الأربعة'],
        steps: [
          { kind: 'numeric', role: 'compute', prompt: 'الطول $OP$ بوحدة المعلم:', expected: 6,
            explain: '$O$ و $P$ لهما نفس الفاصلة 6: $OP = 12 - 6 = 6$ .' },
          { kind: 'choice', role: 'translate', requires: ['khawas-dawaran'],
            prompt: 'لماذا للأجنحة الأربعة الطول نفسه $OP$ ؟',
            options: [
              'كلّ جناح صورة الجناح الذي قبله بربع دورة، والدوران يحافظ على الأطوال',
              'لأنّ المقبض مثبّت في وسط كلّ جناح',
              'لا نعرف: يجب قياس كلّ جناح',
            ],
            correct: 0,
            explain: 'ربع الدورة يحوّل كلّ جناح إلى الجناح الذي يليه، والصورة بدوران تقايس الأصل.' },
          { kind: 'numeric', role: 'answer', ask: 0, prompt: 'طول الجناح بالمتر:', expected: 1.2, suffix: 'm',
            explain: '$6 \\times 20 = 120$ : طول الجناح $120\\,\\mathrm{cm}$ ، أي $1{,}2\\,\\mathrm{m}$ .' },
          { kind: 'numeric', role: 'compute', prompt: 'مساحة زجاج الأجنحة الأربعة بالمتر المربّع:', expected: 9.6,
            explain: 'كلّ جناح مستطيل بعداه $1{,}2\\,\\mathrm{m}$ و $2\\,\\mathrm{m}$ : $4 \\times 1{,}2 \\times 2 = 9{,}6$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, prompt: 'ثمن زجاج الأجنحة الأربعة:', expected: 62400, suffix: 'دج',
            explain: '$9{,}6 \\times 6500 = 62400$ .' },
          { kind: 'solution', lines: [
            '$OP = 12 - 6 = 6$ وحدات، أي $6 \\times 20 = 120\\,\\mathrm{cm}$ : طول الجناح $1{,}2\\,\\mathrm{m}$ ، ولكلّ الأجنحة الطول نفسه لأنّ الدوران يحافظ على الأطوال.',
            'مساحة الزجاج: $4 \\times 1{,}2 \\times 2 = 9{,}6$ ، أي $9{,}6\\,\\mathrm{m}^2$ .',
            'ثمن الزجاج: $9{,}6 \\times 6500 = 62400$ ، أي 62400 دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — العنفة الريحية',
    context: 'شفرات عنفة كابرتن: ما يحفظه الدوران',
    emoji: '🌬️',
    source: SOURCE,
    statement: 'في الحظيرة الهوائية بكابرتن (ولاية أدرار) عنفة ريحية لها ثلاث شفرات $[OA]$ و $[OB]$ و $[OC]$ تدور حول المحور $O$. يقع $O$ على ارتفاع $55\\,\\mathrm{m}$ فوق النقطة $H$ من الأرض، والبرج $[OH]$ عمودي. $B$ صورة $A$ و $C$ صورة $B$ بالدوران الذي مركزه $O$ وزاويته $120^\\circ$ في الاتجاه المباشر. تعاون التقنيّون على إيقاف العنفة للصيانة والشفرة $[OA]$ عمودية نحو الأعلى (الشكل المقابل)، وقاسوا: $OA = 26\\,\\mathrm{m}$ ، ومساحة الوجه الواحد للشفرة $[OA]$ تساوي $27\\,\\mathrm{m}^2$ . تنتج العنفة 850 كيلوواط، وثمن طلاء المتر المربّع 1200 دج.',
    figure: TURBINE_FIGURE,
    data: [
      { id: 'hub', text: 'المحور O على ارتفاع 55 m فوق الأرض', useful: true },
      { id: 'blade', text: 'طول الشفرة OA هو 26 m', useful: true },
      { id: 'turn', text: 'الدوران من شفرة إلى التي تليها: 120° في الاتجاه المباشر', useful: true },
      { id: 'face', text: 'مساحة الوجه الواحد للشفرة 27 m²', useful: true },
      { id: 'paint', text: 'ثمن طلاء المتر المربّع 1200 دج', useful: true },
      { id: 'power', text: 'تنتج العنفة 850 كيلوواط', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الشفرة [OB]',
        question: 'ما طول الشفرة $[OB]$ ؟ وما قيس الزاوية بين المستقيمين $(OA)$ و $(OB)$ ؟',
        asks: ['طول الشفرة $[OB]$', 'الزاوية بين المستقيمين $(OA)$ و $(OB)$'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['khawas-dawaran'], prompt: 'طول الشفرة $[OB]$ بالمتر:', expected: 26, suffix: 'm',
            explain: '$O$ صورة نفسها و $B$ صورة $A$ : $[OB]$ صورة $[OA]$ ، والدوران يحافظ على الأطوال: $OB = OA$ .' },
          { kind: 'numeric', role: 'compute', requires: ['surat-nuqta-dawaran'], prompt: 'قيس الزاوية $\\widehat{AOB}$ بالدرجات:', expected: 120,
            explain: '$B$ صورة $A$ بالدوران الذي مركزه $O$ : الزاوية $\\widehat{AOB}$ هي زاوية الدوران.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['zawiya-sura'], prompt: 'قيس الزاوية بين المستقيمين $(OA)$ و $(OB)$ بالدرجات:', expected: 60,
            explain: 'زاوية الدوران منفرجة: المستقيمان يصنعان زاويتين متجاورتين، والزاوية بينهما هي الحادّة: $180^\\circ - 120^\\circ = 60^\\circ$ .' },
          { kind: 'solution', ask: 1, lines: [
            '$[OB]$ صورة $[OA]$ بالدوران الذي مركزه $O$ ، والدوران يحافظ على الأطوال: $OB = OA = 26\\,\\mathrm{m}$ .',
            'زاوية الدوران $\\widehat{AOB} = 120^\\circ$ منفرجة، فالمستقيمان $(OA)$ و $(OB)$ يصنعان زاوية $180^\\circ - 120^\\circ = 60^\\circ$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'نصف دورة للصيانة',
        question: 'لتنظيف طرف الشفرة $[OA]$ يدير التقنيّون الدوّار نصف دورة ($180^\\circ$) حول $O$ ، فتنتقل $A$ إلى $A_1$ . بيّن أنّ $A_1$ تنتمي إلى المستقيم $(OH)$ ، ثم احسب ارتفاع $A_1$ عن الأرض.',
        asks: ['$A_1$ تنتمي إلى المستقيم $(OH)$', 'ارتفاع $A_1$ عن الأرض'],
        steps: [
          { kind: 'choice', role: 'translate',
            prompt: 'الدوران الذي مركزه $O$ وزاويته $180^\\circ$ هو:',
            options: ['التناظر بالنسبة إلى النقطة $O$ : $O$ منتصف $[AA_1]$', 'التناظر بالنسبة إلى المستقيم $(OH)$', 'انسحاب يُنزل الشفرة'],
            correct: 0,
            explain: 'بزاوية $180^\\circ$ : $OA_1 = OA$ و $A$ و $O$ و $A_1$ على استقامية، أي $O$ منتصف $[AA_1]$ .' },
          { kind: 'choice', role: 'conclude', ask: 0,
            prompt: 'لماذا تنتمي $A_1$ إلى المستقيم $(OH)$ ؟',
            options: [
              'الشفرة $[OA]$ والبرج $[OH]$ عموديان فـ $A$ و $O$ و $H$ على استقامية، و $A_1$ على المستقيم $(AO)$ لأنّ $O$ منتصف $[AA_1]$',
              'لأنّ الدوران يحافظ على الأطوال',
              'لأنّ $A_1$ هي النقطة $H$',
            ],
            correct: 0,
            explain: 'المستقيم $(AO)$ هو المستقيم العمودي $(OH)$ ، و $A_1$ عليه. ولا تصل $A_1$ إلى $H$ : $OA_1 = 26$ أصغر من $OH = 55$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['khawas-dawaran'], prompt: 'ارتفاع $A_1$ عن الأرض بالمتر:', expected: 29, suffix: 'm',
            explain: '$OA_1 = OA$ (الدوران يحافظ على الأطوال) و $A_1$ بين $O$ و $H$ : $55 - 26 = 29$ (لا $55 + 26$ : ذلك ارتفاع $A$).' },
          { kind: 'solution', ask: 0, lines: [
            'الدوران الذي مركزه $O$ وزاويته $180^\\circ$ يجعل $O$ منتصف $[AA_1]$ ، فـ $A_1$ على المستقيم $(AO)$ ، وهو المستقيم العمودي $(OH)$ .',
            '$OA_1 = OA = 26\\,\\mathrm{m}$ و $A_1$ تحت $O$ : ارتفاعها $55 - 26 = 29$ ، أي $29\\,\\mathrm{m}$ فوق الأرض.',
          ] },
        ],
      },
      {
        label: '3)', title: 'طلاء الشفرات',
        question: 'يطلي التقنيّون الوجهين لكلّ شفرة من الشفرات الثلاث. احسب المساحة الكلّية التي تُطلى، ثم احسب ثمن الطلاء.',
        asks: ['المساحة الكلّية التي تُطلى', 'ثمن الطلاء'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['khawas-dawaran'],
            prompt: 'مساحة الوجه الواحد للشفرة $[OB]$ :',
            options: [
              'تساوي مساحة وجه $[OA]$ : الشفرة $[OB]$ صورة $[OA]$ ، والدوران يحافظ على المساحات',
              'أكبر، لأنّ $[OB]$ أقرب إلى الأرض',
              'لا تُعرف دون قياس جديد',
            ],
            correct: 0,
            explain: 'الدوران الذي مركزه $O$ وزاويته $120^\\circ$ ينقل الشفرة $[OA]$ إلى $[OB]$ ثم إلى $[OC]$ دون أن يغيّر مساحتها.' },
          { kind: 'numeric', role: 'compute', prompt: 'عدد الأوجه التي تُطلى:', expected: 6,
            explain: 'ثلاث شفرات، لكلّ منها وجهان: $3 \\times 2 = 6$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, prompt: 'المساحة الكلّية التي تُطلى بالمتر المربّع:', expected: 162, suffix: 'm²',
            explain: '$6 \\times 27 = 162$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, prompt: 'ثمن الطلاء:', expected: 194400, suffix: 'دج',
            explain: '$162 \\times 1200 = 194400$ .' },
          { kind: 'solution', lines: [
            '$[OB]$ صورة $[OA]$ و $[OC]$ صورة $[OB]$ بالدوران الذي مركزه $O$ وزاويته $120^\\circ$ ، والدوران يحافظ على المساحات: لكلّ وجه مساحة $27\\,\\mathrm{m}^2$ .',
            'المساحة الكلّية: $3 \\times 2 \\times 27 = 162$ ، أي $162\\,\\mathrm{m}^2$ .',
            'ثمن الطلاء: $162 \\times 1200 = 194400$ ، أي 194400 دج.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
