/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (modules 1 à 6) — des situations COMPLÈTES de type امتحان, résolues pas à pas
 * (common/problems/GuidedProblem.jsx), AVANT « الوضعية وتحليلها » (module 7) et le
 * « وضعية الاختبار النهائي » (8).
 *
 * Décision du propriétaire (2026-10-13), étendue à toutes les synthèses : que l'élève s'exerce sur beaucoup de situations avant
 * celle sur laquelle il est évalué (le tour de lampadaires d'Oran, 8 poteaux sur 5 m, jamais repris ici). Ce sont des AJOUTS DE
 * LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`), jamais des exercices du manuel.
 *
 * Périmètre : exactement celui de l'unité 13 — l'image d'un point par un دوران et ses propriétés (درسان 1 et 2), l'angle inscrit
 * et l'angle au centre (درس 3), le polygone régulier, sa زاوية مركزية 360°/n et son côté par le sinus (درس 4) ; l'unité 10
 * (le sinus, VALEURS DONNÉES dans l'énoncé « نعطي ») et, pour la وضعية 5 seulement, la خاصية طالس de l'unité 9 comme dans
 * l'exercice 20 du manuel. Six contextes, six teintes, six notions principales :
 *   1  la turbine d'Adrar        3 pales = 3 images par un دوران de 120° ; triangle équilatéral ; longueurs conservées
 *   2  le théâtre de Timgad      angle inscrit 35° ⇒ angle au centre 70° ; la corde par le sinus ; la corde, pas l'arc
 *   3  le bassin décagonal       centrale 36°, angle du polygone 144° ; le côté ≠ le rayon (hors hexagone) ; le périmètre
 *   4  le robot de la bibliothèque  دوران de 90° dans un معلم (A(3 ; 4) → A′(−4 ; 3)) ; distances conservées ; le carré
 *   5  la cour circulaire         demi-cercle ⇒ angle droit ; sinus ⇒ 37° ; angle au centre 74° ; طالس (BEM)
 *   6  le cadran de la salle de lecture  douze repères = polygone régulier ; sens indirect ; deux cordes ; le cordon lumineux
 * Une valeur de bonne conduite est tissée dans chaque énoncé (إتقان العمل، حبّ الوطن، التعاون والنظافة، العلم والقراءة،
 * برّ الوالدين، احترام الوقت) : jamais dans un nombre ni dans une condition.
 *
 * Chaque nombre est recalculé dans ./problems.test.js. Aucune sous-étape n'est une `assessment` : la maîtrise vient du module 8.
 * Les `requires` sont les connaissances préalables de la synthèse (lesson.config.js › priorKnowledge, diagnostiquées par « أستعدّ »).
 */
import { addition } from '../../_unit/unitMeta.js';
import { WADIYA_1, WADIYA_2, WADIYA_3, WADIYA_4, WADIYA_5, WADIYA_6 } from './figures.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  // ── 1 · la turbine d'Adrar ────────────────────────────────────────────────────────────────────────────────────────
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — عنفة الرياح بأدرار',
    context: 'ثلاث شفرات صور بعضها بدوران، والكابل بين أطرافها',
    emoji: '🌬️',
    source: SOURCE,
    tone: 'indigo',
    statement: 'تُنصّب شركة للطاقات المتجدّدة بأدرار عنفة رياح ذات ثلاث شفرات متقايسة. مركز العنفة $O$، وأطراف الشفرات $A$ و $B$ و $C$ على دائرة نصف قطرها $40\\,\\mathrm{m}$، وكل شفرة هي صورة الشفرة التي قبلها بنفس الدوران الذي مركزه $O$ (الشكل المقابل). يحرص التقنيّون على إتقان عملهم، فيمدّون كابل قياس يربط الأطراف على التوالي: $A$ ثم $B$ ثم $C$ ثم $A$. ثمن المتر الواحد من الكابل 150 دج. نعطي: $\\sin 60^\\circ \\approx 0{,}87$.',
    figure: WADIYA_1,
    parts: [
      {
        label: '1)', title: 'زاوية الدوران وطبيعة المثلث',
        question: 'عيّن قيس زاوية الدوران الذي ينقل كل شفرة إلى الشفرة التي تليها. ثم استنتج طبيعة المثلث $ABC$.',
        asks: ['قيس زاوية الدوران', 'طبيعة المثلث $ABC$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['sura-dawaran'],
            prompt: 'الشفرة $OB$ هي صورة الشفرة $OA$ بالدوران الذي مركزه $O$. زاوية هذا الدوران هي:',
            options: ['الزاوية $\\widehat{AOB}$ بين شفرتين متتاليتين', 'الزاوية $\\widehat{OAB}$ عند طرف شفرة', 'ربع دورة'],
            correct: 0,
            explain: 'صورة $A$ هي $B$ حيث $OB = OA$ و $\\widehat{AOB}$ هي زاوية الدوران.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['zawiya-markaziya-muntazam'],
            prompt: 'قيس زاوية الدوران (بالدرجات):', expected: 120,
            explain: 'ثلاث زوايا مركزية متقايسة تملأ الدورة: $360 \\div 3 = 120$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['khawas-dawaran-atwal'],
            prompt: 'ماذا تستنتج عن المثلث $ABC$؟',
            options: [
              'متقايس الأضلاع: الدوران يحافظ على الأطوال فصورة $[AB]$ هي $[BC]$ ثم $[CA]$',
              'متساوي الساقين فقط',
              'قائم في $B$ لأنّ الزاوية $120^\\circ$ أكبر من القائمة',
            ],
            correct: 0,
            explain: 'الدوران نفسه ينقل $A$ إلى $B$ ثم $B$ إلى $C$ ثم $C$ إلى $A$، وهو يحافظ على الأطوال: $AB = BC = CA$.' },
          { kind: 'solution', lines: [
            'الشفرات صور متتالية بالدوران الذي مركزه $O$: زاويته $\\widehat{AOB} = 360^\\circ \\div 3 = 120^\\circ$.',
            'هذا الدوران ينقل $A$ إلى $B$ ثم $B$ إلى $C$ ثم $C$ إلى $A$ ويحافظ على الأطوال، فـ $AB = BC = CA$.',
            'المثلث $ABC$ متقايس الأضلاع.',
          ] },
        ],
      },
      {
        label: '2)', title: 'طول الكابل',
        question: 'احسب المسافة $AB$. ثم احسب طول الكابل.',
        asks: ['المسافة $AB$', 'طول الكابل'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['irtifa-mutasawi-saqayn'],
            prompt: 'لتكن $H$ منتصف $[AB]$. في المثلث $OHA$ القائم في $H$، قيس الزاوية $\\widehat{AOH}$ هو:',
            options: ['$60^\\circ$: نصف الزاوية $\\widehat{AOB}$', '$120^\\circ$: الزاوية $\\widehat{AOB}$ كلّها', '$30^\\circ$: زاوية قاعدة المثلث $OAB$'],
            correct: 0,
            explain: 'في المثلث المتساوي الساقين $OAB$ الارتفاع $[OH]$ ينصّف الزاوية الرئيسية: $120 \\div 2 = 60$.' },
          { kind: 'numeric', role: 'compute', requires: ['jaib-zawiya'],
            prompt: 'الطول $AH$ (بالمتر):', expected: 34.8, display: '34,8',
            explain: '$\\sin \\widehat{AOH} = \\frac{AH}{OA}$، إذن $AH = 40 \\times \\sin 60^\\circ \\approx 40 \\times 0{,}87 = 34{,}8$.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'المسافة $AB$ (بالمتر):', expected: 69.6, display: '69,6',
            explain: '$H$ منتصف $[AB]$: $2 \\times 34{,}8 = 69{,}6$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['khawas-dawaran-atwal'],
            prompt: 'طول الكابل $AB + BC + CA$ (بالمتر):', expected: 208.8, display: '208,8',
            explain: 'الأضلاع الثلاثة متقايسة: $3 \\times 69{,}6 = 208{,}8$.' },
          { kind: 'solution', lines: [
            '$H$ منتصف $[AB]$، و $\\widehat{AOH} = 120^\\circ \\div 2 = 60^\\circ$ في المثلث $OHA$ القائم في $H$.',
            '$AH = 40 \\times \\sin 60^\\circ \\approx 40 \\times 0{,}87 = 34{,}8$، إذن $AB = 2 \\times 34{,}8 = 69{,}6$ أي $AB \\approx 69{,}6\\,\\mathrm{m}$.',
            'طول الكابل: $3 \\times 69{,}6 = 208{,}8$، أي $208{,}8\\,\\mathrm{m}$.',
          ] },
        ],
      },
      {
        label: '3)', title: 'بعد دوران العنفة',
        question: 'تدور العنفة بزاوية $50^\\circ$ في الاتجاه المباشر، فتنتقل الأطراف $A$ و $B$ و $C$ إلى $A\'$ و $B\'$ و $C\'$. ما طول $A\'B\'$؟ وكم يدفع التقنيّون ثمنًا لكابل يربط الأطراف الجديدة؟',
        asks: ['طول $A\'B\'$', 'ثمن الكابل'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['khawas-dawaran-atwal'],
            prompt: 'لمعرفة الطول $A\'B\'$ دون حساب جديد نستعمل أنّ:',
            options: ['الدوران يحافظ على الأطوال: $A\'B\' = AB$', 'الدوران يغيّر الأطوال بحسب زاويته', 'الدوران يحافظ على الزوايا فقط'],
            correct: 0,
            explain: '$A\'$ و $B\'$ صورتا $A$ و $B$ بنفس الدوران، والدوران يحافظ على المسافات.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'الطول $A\'B\'$ (بالمتر):', expected: 69.6, display: '69,6',
            explain: '$A\'B\' = AB = 69{,}6$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ثمن كابل يربط $A\'$ و $B\'$ و $C\'$ على التوالي:', expected: 31320, suffix: 'دج',
            explain: 'المثلث $A\'B\'C\'$ صورة المثلث $ABC$: طول كابله $208{,}8$، و $208{,}8 \\times 150 = 31320$.' },
          { kind: 'solution', lines: [
            'الدوران يحافظ على الأطوال: $A\'B\' = AB = 69{,}6$ أي $A\'B\' = 69{,}6\\,\\mathrm{m}$.',
            'للمثلث $A\'B\'C\'$ نفس محيط المثلث $ABC$: $208{,}8\\,\\mathrm{m}$.',
            'الثمن: $208{,}8 \\times 150 = 31320$، أي 31320 دج.',
          ] },
        ],
      },
    ],
  },

  // ── 2 · le théâtre de Timgad ──────────────────────────────────────────────────────────────────────────────────────
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — مسرح تيمقاد',
    context: 'زاوية محيطية وزاوية مركزية، ووتر الخشبة',
    emoji: '🏛️',
    source: SOURCE,
    tone: 'sky',
    statement: 'بمدينة تيمقاد الأثرية (ولاية باتنة) مسرح روماني تحافظ عليه الجزائر تراثًا وطنيًا يعتزّ به أبناؤها. حلبة المسرح دائرة مركزها $O$ ونصف قطرها $20\\,\\mathrm{m}$، وحافة الخشبة هي الوتر $[AB]$ (الشكل المقابل). يجلس متفرّج في $M$ على القوس الكبير فيرى الخشبة تحت الزاوية $\\widehat{AMB}$ التي قيسها $35^\\circ$، ويجلس متفرّج آخر في $N$ على القوس نفسه. يشدّ الحرّاس حبلًا مستقيمًا بين $A$ و $B$ لمنع الاقتراب من الخشبة، ثمن المتر الواحد منه 120 دج. نعطي: $\\sin 35^\\circ \\approx 0{,}57$.',
    figure: WADIYA_2,
    parts: [
      {
        label: '1)', title: 'الزاويتان المركزية والمحيطية',
        question: 'عيّن قيس الزاوية المركزية $\\widehat{AOB}$. ثم عيّن قيس الزاوية $\\widehat{ANB}$.',
        asks: ['قيس الزاوية $\\widehat{AOB}$', 'قيس الزاوية $\\widehat{ANB}$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['zawiya-muhitiya-markaziya'],
            prompt: 'الزاوية $\\widehat{AMB}$ محيطية والزاوية $\\widehat{AOB}$ مركزية، وكلتاهما تحصر القوس $AB$ نفسه. إذن:',
            options: ['$\\widehat{AOB} = 2 \\times \\widehat{AMB}$', '$\\widehat{AOB} = \\widehat{AMB}$', '$\\widehat{AOB} = \\widehat{AMB} \\div 2$'],
            correct: 0,
            explain: 'الزاوية المركزية ضعف الزاوية المحيطية التي تحصر معها القوس نفسه.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'قيس الزاوية $\\widehat{AOB}$ (بالدرجات):', expected: 70,
            explain: '$2 \\times 35 = 70$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['zawiya-muhitiya-markaziya'],
            prompt: 'قيس الزاوية $\\widehat{ANB}$ هو:',
            options: ['$35^\\circ$: زاويتان محيطيتان تحصران القوس نفسه فهما متقايستان', '$70^\\circ$: الزاوية المركزية', '$17{,}5^\\circ$: نصف الزاوية $\\widehat{AMB}$'],
            correct: 0,
            explain: 'الزاويتان $\\widehat{AMB}$ و $\\widehat{ANB}$ محيطيتان وتحصران القوس $AB$ نفسه: كل منهما نصف الزاوية المركزية $70^\\circ$.' },
          { kind: 'solution', lines: [
            '$\\widehat{AMB}$ محيطية و $\\widehat{AOB}$ مركزية تحصران القوس $AB$: $\\widehat{AOB} = 2 \\times 35^\\circ = 70^\\circ$.',
            '$\\widehat{ANB}$ محيطية تحصر القوس نفسه، إذن $\\widehat{ANB} = 70^\\circ \\div 2 = 35^\\circ$ مهما كان مكان المتفرّج على هذا القوس.',
          ] },
        ],
      },
      {
        label: '2)', title: 'طول الخشبة وثمن الحبل',
        question: 'احسب طول الخشبة $AB$. ثم احسب ثمن الحبل المشدود بين $A$ و $B$.',
        asks: ['الطول $AB$', 'ثمن الحبل'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['irtifa-mutasawi-saqayn'],
            prompt: 'لتكن $H$ منتصف $[AB]$. في المثلث $OHA$ القائم في $H$، قيس الزاوية $\\widehat{AOH}$ هو:',
            options: ['$35^\\circ$: نصف الزاوية المركزية $\\widehat{AOB}$', '$70^\\circ$: الزاوية المركزية كلّها', '$55^\\circ$: زاوية قاعدة المثلث $OAB$'],
            correct: 0,
            explain: '$[OH]$ ينصّف الزاوية الرئيسية في المثلث المتساوي الساقين $OAB$: $70 \\div 2 = 35$.' },
          { kind: 'numeric', role: 'compute', requires: ['jaib-zawiya'],
            prompt: 'الطول $AH$ (بالمتر):', expected: 11.4, display: '11,4',
            explain: '$AH = 20 \\times \\sin 35^\\circ \\approx 20 \\times 0{,}57 = 11{,}4$.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'طول الخشبة $AB$ (بالمتر):', expected: 22.8, display: '22,8',
            explain: '$H$ منتصف $[AB]$: $2 \\times 11{,}4 = 22{,}8$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ثمن الحبل:', expected: 2736, suffix: 'دج',
            explain: 'الحبل مستقيم بين $A$ و $B$: طوله $22{,}8$ لا طول القوس. $22{,}8 \\times 120 = 2736$.' },
          { kind: 'solution', lines: [
            '$\\widehat{AOH} = 70^\\circ \\div 2 = 35^\\circ$، و $AH = 20 \\times \\sin 35^\\circ \\approx 20 \\times 0{,}57 = 11{,}4$.',
            '$AB = 2 \\times 11{,}4 = 22{,}8$، أي $AB \\approx 22{,}8\\,\\mathrm{m}$.',
            'الحبل مستقيم: ثمنه $22{,}8 \\times 120 = 2736$، أي 2736 دج.',
          ] },
        ],
      },
    ],
  },

  // ── 3 · le bassin décagonal ───────────────────────────────────────────────────────────────────────────────────────
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — نافورة حديقة الحامة',
    context: 'حوض عشري منتظم: زاويتاه، ضلعه، وشريط حافته',
    emoji: '⛲',
    source: SOURCE,
    tone: 'amber',
    statement: 'في حديقة التجارب بالحامة (الجزائر العاصمة) نافورة حوضها على شكل عشري منتظم $ABCDEFGHIJ$ مركزه $O$، ورؤوسه على دائرة نصف قطرها $20\\,\\mathrm{m}$ (الشكل المقابل). تعاون تلاميذ المتوسطة المجاورة مع جمعية الحيّ على تنظيف الحوض وتجميل حافته، فالتعاون على النظافة خُلُق حسن. تُغطّى الحافة كلّها بشريط من الفسيفساء ثمن المتر الواحد منه 900 دج. نعطي: $\\sin 18^\\circ \\approx 0{,}31$.',
    figure: WADIYA_3,
    parts: [
      {
        label: '1)', title: 'الزاوية المركزية وزاوية الحوض',
        question: 'عيّن قيس الزاوية المركزية $\\widehat{AOB}$. ثم احسب قيس زاوية الحوض $\\widehat{JAB}$.',
        asks: ['قيس الزاوية المركزية $\\widehat{AOB}$', 'قيس الزاوية $\\widehat{JAB}$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['zawiya-markaziya-muntazam'],
            prompt: 'قيس الزاوية $\\widehat{AOB}$ (بالدرجات):', expected: 36,
            explain: 'عشر زوايا مركزية متقايسة تملأ الدورة: $360 \\div 10 = 36$.' },
          { kind: 'numeric', role: 'compute', requires: ['zawaya-mutasawi-saqayn'],
            prompt: 'المثلث $OAB$ متساوي الساقين رأسه الأساسي $O$. قيس كل من زاويتي قاعدته (بالدرجات):', expected: 72,
            explain: '$\\frac{180 - 36}{2} = 72$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['mudalla-muntazam'],
            prompt: 'قيس الزاوية $\\widehat{JAB}$ (بالدرجات):', expected: 144,
            explain: '$(OA)$ ينصّف الزاوية $\\widehat{JAB}$: $2 \\times 72 = 144$، وهو أيضًا $180 - 36 = 144$.' },
          { kind: 'solution', lines: [
            '$\\widehat{AOB} = \\frac{360^\\circ}{10} = 36^\\circ$.',
            '$\\widehat{OAB} = \\frac{180^\\circ - 36^\\circ}{2} = 72^\\circ$ و $(OA)$ ينصّف الزاوية $\\widehat{JAB}$، إذن $\\widehat{JAB} = 2 \\times 72^\\circ = 144^\\circ$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'طول الضلع',
        question: 'يقول متطوّع: «ضلع الحوض يساوي نصف القطر، أي $20\\,\\mathrm{m}$». احسب طول الضلع $AB$. هل المتطوّع على صواب؟',
        asks: ['طول الضلع $AB$', 'هل المتطوّع على صواب؟'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['irtifa-mutasawi-saqayn'],
            prompt: 'لتكن $H$ منتصف $[AB]$. في المثلث $OHA$ القائم في $H$، قيس الزاوية $\\widehat{AOH}$ هو:',
            options: ['$18^\\circ$: نصف الزاوية المركزية', '$36^\\circ$: الزاوية المركزية كلّها', '$72^\\circ$: زاوية قاعدة المثلث $OAB$'],
            correct: 0,
            explain: '$[OH]$ ينصّف الزاوية $\\widehat{AOB}$: $36 \\div 2 = 18$.' },
          { kind: 'numeric', role: 'compute', requires: ['jaib-zawiya'],
            prompt: 'الطول $AH$ (بالمتر):', expected: 6.2, display: '6,2',
            explain: '$AH = 20 \\times \\sin 18^\\circ \\approx 20 \\times 0{,}31 = 6{,}2$.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'طول الضلع $AB$ (بالمتر):', expected: 12.4, display: '12,4',
            explain: '$H$ منتصف $[AB]$: $2 \\times 6{,}2 = 12{,}4$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['mudalla-muntazam'],
            prompt: 'هل المتطوّع على صواب؟',
            options: [
              'لا: الضلع حوالي $12{,}4\\,\\mathrm{m}$ لا $20\\,\\mathrm{m}$؛ الضلع يساوي نصف القطر في السداسي المنتظم فقط',
              'نعم: ضلع كل مضلع منتظم يساوي نصف قطر دائرته المحيطة',
              'لا: الضلع يساوي القطر $40\\,\\mathrm{m}$',
            ],
            correct: 0,
            explain: 'الضلع يساوي نصف القطر عندما تكون الزاوية المركزية $60^\\circ$ (مثلث متقايس الأضلاع)، أي في السداسي المنتظم؛ هنا هي $36^\\circ$ فالضلع أقصر من نصف القطر.' },
          { kind: 'solution', lines: [
            '$H$ منتصف $[AB]$ و $\\widehat{AOH} = 36^\\circ \\div 2 = 18^\\circ$ في المثلث $OHA$ القائم في $H$.',
            '$AH = 20 \\times \\sin 18^\\circ \\approx 20 \\times 0{,}31 = 6{,}2$، إذن $AB = 2 \\times 6{,}2 = 12{,}4$ أي $AB \\approx 12{,}4\\,\\mathrm{m}$.',
            'المتطوّع ليس على صواب: الضلع حوالي $12{,}4\\,\\mathrm{m}$ لا $20\\,\\mathrm{m}$، لأنّ الضلع يساوي نصف القطر في السداسي المنتظم فقط.',
          ] },
        ],
      },
      {
        label: '3)', title: 'شريط الحافة',
        question: 'احسب طول الشريط اللازم لتغطية الحافة كلّها. ثم احسب ثمنه.',
        asks: ['طول الشريط', 'ثمن الشريط'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mudalla-muntazam'],
            prompt: 'طول الشريط، أي محيط الحوض (بالمتر):', expected: 124,
            explain: 'الأضلاع العشرة متقايسة: $10 \\times 12{,}4 = 124$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ثمن الشريط:', expected: 111600, suffix: 'دج',
            explain: '$124 \\times 900 = 111600$.' },
          { kind: 'solution', lines: [
            'الحافة هي محيط العشري: $10 \\times 12{,}4 = 124$، أي $124\\,\\mathrm{m}$.',
            'الثمن: $124 \\times 900 = 111600$، أي 111600 دج.',
          ] },
        ],
      },
    ],
  },

  // ── 4 · le robot de la bibliothèque ───────────────────────────────────────────────────────────────────────────────
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — روبوت المكتبة',
    context: 'ربع دورة في معلم: الإحداثيتان، والمسافات المحفوظة، والمربع',
    emoji: '🤖',
    source: SOURCE,
    tone: 'rose',
    statement: 'في مكتبة جامعية روبوت يوزّع الكتب ويشجّع الطلبة على القراءة والبحث، فالعلم نور. نمثّل أرضية المكتبة بمعلم متعامد مبدؤه $O$ محطة شحن الروبوت، ووحدة الطول فيه $1\\,\\mathrm{m}$ (الشكل المقابل). يوجد الروبوت عند النقطة $A(3\\,;\\,4)$. يدور الروبوت حول المحطة $O$ بزاوية $90^\\circ$ في الاتجاه المباشر (عكس عقارب الساعة) فينتقل إلى النقطة $A\'$.',
    figure: WADIYA_4,
    parts: [
      {
        label: '1)', title: 'إحداثيتا $A\'$',
        question: 'عيّن فاصلة النقطة $A\'$. ثم عيّن ترتيبها.',
        asks: ['فاصلة $A\'$', 'ترتيب $A\'$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['sura-dawaran'],
            prompt: 'النقطة $A\'$ هي صورة $A$ بهذا الدوران، إذن:',
            options: ['$OA\' = OA$ و $\\widehat{AOA\'} = 90^\\circ$ في الاتجاه المباشر', '$OA\' = 2 \\times OA$ و $\\widehat{AOA\'} = 90^\\circ$', '$AA\' = OA$ و $\\widehat{AOA\'} = 45^\\circ$'],
            correct: 0,
            explain: 'صورة نقطة بدوران مركزه $O$ على نفس البعد من $O$، والزاوية بين النقطة وصورتها هي زاوية الدوران.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'فاصلة $A\'$:', expected: -4,
            explain: 'للوصول إلى $A$ من $O$: 3 نحو اليمين و 4 نحو الأعلى. بعد ربع دورة عكس عقارب الساعة: 4 نحو اليسار و 3 نحو الأعلى، أي $A\'(-4\\,;\\,3)$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ترتيب $A\'$:', expected: 3,
            explain: 'الارتفاع 4 فوق المحور الأفقي يصير بعد الدوران ابتعادًا قدره 3 فوقه: $A\'(-4\\,;\\,3)$.' },
          { kind: 'solution', lines: [
            'ربع دورة في الاتجاه المباشر حول $O$: الانتقال (3 يمينًا، 4 أعلى) يصير (4 يسارًا، 3 أعلى).',
            'إذن $A\'(-4\\,;\\,3)$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'المسافات',
        question: 'احسب المسافة $OA$. ثم استنتج المسافة $OA\'$ دون حساب جديد. هل المثلث $OAA\'$ قائم؟',
        asks: ['المسافة $OA$', 'المسافة $OA\'$', 'هل المثلث $OAA\'$ قائم؟'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'المسافة $OA$ (بالمتر):', expected: 5,
            explain: 'المثلث الذي ضلعاه القائمان 3 و 4 وتره $\\sqrt{9 + 16} = \\sqrt{25} = 5$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['khawas-dawaran-atwal'],
            prompt: 'المسافة $OA\'$ (بالمتر):', expected: 5,
            explain: 'الدوران الذي مركزه $O$ يحافظ على المسافة إلى $O$: $OA\' = OA = 5$.' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['sura-dawaran'],
            prompt: 'المثلث $OAA\'$:',
            options: ['قائم في $O$ ومتساوي الساقين: $OA\' = OA$ والزاوية $\\widehat{AOA\'} = 90^\\circ$', 'متقايس الأضلاع', 'قائم في $A$'],
            correct: 0,
            explain: 'زاوية الدوران $90^\\circ$ هي الزاوية $\\widehat{AOA\'}$ عند $O$، و $OA = OA\'$.' },
          { kind: 'solution', lines: [
            '$OA = \\sqrt{3^2 + 4^2} = 5$، أي $OA = 5\\,\\mathrm{m}$.',
            'الدوران يحافظ على الأطوال: $OA\' = OA = 5\\,\\mathrm{m}$.',
            'المثلث $OAA\'$ قائم في $O$ ومتساوي الساقين.',
          ] },
        ],
      },
      {
        label: '3)', title: 'المربع',
        question: 'احسب $AA\'^2$. ثم احسب مساحة المربع الذي رؤوسه الأربعة الأوضاع التي يمرّ بها الروبوت عندما يكرّر الدوران نفسه: $A$ و $A\'$ و $A\'\'$ و $A\'\'\'$.',
        asks: ['$AA\'^2$', 'مساحة المربع'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['sura-dawaran'],
            prompt: 'قيمة $AA\'^2$ (المثلث $OAA\'$ قائم في $O$):', expected: 50,
            explain: '$AA\'^2 = OA^2 + OA\'^2 = 25 + 25 = 50$.' },
          { kind: 'choice', role: 'translate', requires: ['mudalla-muntazam'],
            prompt: 'الأوضاع الأربعة صور متتالية بدوران $90^\\circ$ حول $O$، فهي رؤوس:',
            options: ['مربع مركزه $O$', 'معيّن غير مربع', 'مستطيل غير مربع'],
            correct: 0,
            explain: 'أربع زوايا مركزية متقايسة $360 \\div 4 = 90$ و $OA = OA\' = OA\'\' = OA\'\'\'$: مضلع منتظم له 4 أضلاع، أي مربع.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'مساحة المربع (بالمتر المربع):', expected: 50,
            explain: 'مساحة المربع هي مربع ضلعه: $AA\'^2 = 50$.' },
          { kind: 'solution', lines: [
            'المثلث $OAA\'$ قائم في $O$: $AA\'^2 = OA^2 + OA\'^2 = 25 + 25 = 50$.',
            'الرؤوس الأربعة رؤوس مربع ضلعه $AA\'$، ومساحته $AA\'^2 = 50$، أي $50\\,\\mathrm{m}^2$.',
          ] },
        ],
      },
    ],
  },

  // ── 5 · la cour circulaire ────────────────────────────────────────────────────────────────────────────────────────
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — حديقة الجدّ',
    context: 'قطر ودائرة: زاوية قائمة، جيب، زاوية مركزية وخاصية طالس',
    emoji: '🌳',
    source: SOURCE,
    tone: 'violet',
    statement: 'ورث سمير عن جدّه حديقة دائرية مركزها $O$ وقطرها $[AB]$ حيث $AB = 10\\,\\mathrm{m}$، وغرس والده عند النقطة $C$ من محيطها شجرة زيتون حيث $BC = 6\\,\\mathrm{m}$ (الشكل المقابل). يساعد سمير والده بطاعة وحبّ، فبرّ الوالدين من أجمل الأخلاق، على شدّ سياجين مستقيمين من $A$ إلى $C$ ومن $B$ إلى $C$، ثم حبل من نقطة $E$ من $[AB]$ حيث $AE = 4\\,\\mathrm{m}$ إلى نقطة $F$ من $[AC]$ بحيث يوازي المستقيم $(EF)$ المستقيم $(BC)$. نعطي: $\\sin 37^\\circ \\approx 0{,}6$.',
    figure: WADIYA_5,
    parts: [
      {
        label: '1)', title: 'مثلث قائم في $C$',
        question: 'بيّن أنّ المثلث $ABC$ قائم في $C$. ثم احسب $AC$.',
        asks: ['المثلث $ABC$ قائم في $C$', 'الطول $AC$'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['zawiya-muhitiya-markaziya'],
            prompt: '$[AB]$ قطر، فالزاوية المركزية $\\widehat{AOB}$ قيسها $180^\\circ$. الزاوية المحيطية $\\widehat{ACB}$ تحصر معها القوس نفسه، إذن قيسها:',
            options: ['$90^\\circ$: نصف $180^\\circ$، فالمثلث $ABC$ قائم في $C$', '$180^\\circ$: مثل الزاوية المركزية', '$45^\\circ$: ربع $180^\\circ$'],
            correct: 0,
            explain: 'الزاوية المحيطية نصف الزاوية المركزية التي تحصر معها القوس نفسه: $180 \\div 2 = 90$.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'المثلث $ABC$ قائم في $C$ ووتره $[AB]$: قيمة $AC^2 = AB^2 - BC^2$:', expected: 64,
            explain: '$AC^2 = 100 - 36 = 64$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'الطول $AC$ (بالمتر):', expected: 8,
            explain: '$AC = \\sqrt{64} = 8$.' },
          { kind: 'solution', lines: [
            '$\\widehat{AOB} = 180^\\circ$ و $\\widehat{ACB}$ محيطية تحصر القوس نفسه: $\\widehat{ACB} = 180^\\circ \\div 2 = 90^\\circ$، فالمثلث $ABC$ قائم في $C$.',
            '$AC^2 = AB^2 - BC^2 = 100 - 36 = 64$، إذن $AC = 8$ أي $AC = 8\\,\\mathrm{m}$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الزاويتان $\\widehat{BAC}$ و $\\widehat{BOC}$',
        question: 'احسب قيس الزاوية $\\widehat{BAC}$ مدوّرًا إلى الوحدة. ثم استنتج قيس الزاوية المركزية $\\widehat{BOC}$.',
        asks: ['قيس الزاوية $\\widehat{BAC}$', 'قيس الزاوية $\\widehat{BOC}$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['jaib-zawiya'],
            prompt: 'في المثلث $ABC$ القائم في $C$: $\\sin \\widehat{BAC} =$',
            options: ['$\\dfrac{BC}{AB}$', '$\\dfrac{AC}{AB}$', '$\\dfrac{BC}{AC}$'],
            correct: 0,
            explain: 'الجيب هو الضلع المقابل على الوتر: المقابل للزاوية $\\widehat{BAC}$ هو $[BC]$ والوتر $[AB]$.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: '$\\sin \\widehat{BAC} = \\frac{6}{10} = 0{,}6$. بما أنّ $\\sin 37^\\circ \\approx 0{,}6$، قيس الزاوية $\\widehat{BAC}$ (بالدرجات):', expected: 37,
            explain: 'الزاوية الحادة التي جيبها $0{,}6$ هي حوالي $37^\\circ$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['zawiya-muhitiya-markaziya'],
            prompt: 'قيس الزاوية المركزية $\\widehat{BOC}$ (بالدرجات):', expected: 74,
            explain: 'الزاويتان $\\widehat{BAC}$ المحيطية و $\\widehat{BOC}$ المركزية تحصران القوس $BC$ نفسه: $2 \\times 37 = 74$.' },
          { kind: 'solution', lines: [
            '$\\sin \\widehat{BAC} = \\frac{BC}{AB} = \\frac{6}{10} = 0{,}6$، إذن $\\widehat{BAC} \\approx 37^\\circ$.',
            '$\\widehat{BAC}$ محيطية و $\\widehat{BOC}$ مركزية تحصران القوس $BC$: $\\widehat{BOC} = 2 \\times 37^\\circ = 74^\\circ$.',
          ] },
        ],
      },
      {
        label: '3)', title: 'حبل بموازاة $(BC)$',
        question: 'احسب الطولين $AF$ و $EF$.',
        asks: ['الطول $AF$', 'الطول $EF$'],
        steps: [
          { kind: 'choice', role: 'translate',
            prompt: 'لأنّ $(EF) \\parallel (BC)$ في المثلث $ABC$ حيث $E \\in [AB]$ و $F \\in [AC]$، تعطي خاصية طالس:',
            options: ['$\\dfrac{AE}{AB} = \\dfrac{AF}{AC} = \\dfrac{EF}{BC}$', '$\\dfrac{AE}{EB} = \\dfrac{AF}{AC} = \\dfrac{EF}{BC}$', '$\\dfrac{AE}{AB} = \\dfrac{AC}{AF} = \\dfrac{BC}{EF}$'],
            correct: 0,
            explain: 'النسب المتساوية هي نسب أضلاع المثلث الصغير $AEF$ إلى أضلاع المثلث $ABC$: $\\frac{4}{10} = 0{,}4$.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'الطول $AF$ (بالمتر):', expected: 3.2, display: '3,2',
            explain: '$\\frac{AF}{8} = \\frac{4}{10}$، إذن $AF = 0{,}4 \\times 8 = 3{,}2$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'الطول $EF$ (بالمتر):', expected: 2.4, display: '2,4',
            explain: '$\\frac{EF}{6} = \\frac{4}{10}$، إذن $EF = 0{,}4 \\times 6 = 2{,}4$.' },
          { kind: 'solution', lines: [
            '$(EF) \\parallel (BC)$: $\\frac{AE}{AB} = \\frac{AF}{AC} = \\frac{EF}{BC}$، أي $\\frac{4}{10} = \\frac{AF}{8} = \\frac{EF}{6}$.',
            '$AF = 0{,}4 \\times 8 = 3{,}2$ و $EF = 0{,}4 \\times 6 = 2{,}4$، أي $AF = 3{,}2\\,\\mathrm{m}$ و $EF = 2{,}4\\,\\mathrm{m}$.',
          ] },
        ],
      },
    ],
  },

  // ── 6 · le cadran de la salle de lecture ──────────────────────────────────────────────────────────────────────────
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — ساعة قاعة المطالعة',
    context: 'اثنا عشر تدريجًا رؤوس مضلع منتظم: الاتجاه، الأوتار، وخيط الإضاءة',
    emoji: '🕒',
    source: SOURCE,
    tone: 'teal',
    statement: 'في قاعة المطالعة بمكتبة البلدية ساعة جدارية دائرية مركزها $O$، تدريجاتها الاثنا عشر (من 1 إلى 12) على دائرة نصف قطرها $50\\,\\mathrm{cm}$، وهي رؤوس مضلع منتظم (الشكل المقابل). يدور عقرب الساعات حول $O$ في اتجاه عقارب الساعة. ولأنّ احترام الوقت من صفات التلميذ المجتهد، يريد أمين المكتبة تزيين الساعة بخيط إضاءة يربط التدريجات الاثني عشر على التوالي، ثمن المتر الواحد منه 800 دج. نعطي: $\\sin 15^\\circ \\approx 0{,}26$ و $\\sin 60^\\circ \\approx 0{,}87$.',
    figure: WADIYA_6,
    parts: [
      {
        label: '1)', title: 'الزاوية والدوران واتجاهه',
        question: 'عيّن قيس الزاوية المركزية بين تدريجين متتاليين. ثم عيّن قيس الدوران الذي ينقل التدريج 3 إلى التدريج 5، مع اتجاهه.',
        asks: ['قيس الزاوية المركزية بين تدريجين متتاليين', 'قيس الدوران الذي ينقل التدريج 3 إلى التدريج 5', 'اتجاه هذا الدوران'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['zawiya-markaziya-muntazam'],
            prompt: 'قيس الزاوية المركزية بين تدريجين متتاليين (بالدرجات):', expected: 30,
            explain: 'اثنا عشر زاوية مركزية متقايسة تملأ الدورة: $360 \\div 12 = 30$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['sura-dawaran'],
            prompt: 'من التدريج 3 إلى التدريج 5 فاصلان (التدريج 4 ثم 5): قيس الدوران (بالدرجات):', expected: 60,
            explain: 'زاويتان مركزيتان متتاليتان: $2 \\times 30 = 60$.' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['sura-dawaran'],
            prompt: 'العقرب ينتقل من 3 إلى 5 في اتجاه عقارب الساعة، فهذا الدوران:',
            options: ['غير مباشر (في اتجاه عقارب الساعة)', 'مباشر (عكس عقارب الساعة)', 'لا اتجاه له'],
            correct: 0,
            explain: 'الاتجاه المباشر هو عكس عقارب الساعة؛ والدوران في اتجاه عقارب الساعة غير مباشر.' },
          { kind: 'solution', lines: [
            'الزاوية المركزية بين تدريجين متتاليين: $360^\\circ \\div 12 = 30^\\circ$.',
            'من التدريج 3 إلى التدريج 5: $2 \\times 30^\\circ = 60^\\circ$، في اتجاه عقارب الساعة، أي في الاتجاه غير المباشر.',
          ] },
        ],
      },
      {
        label: '2)', title: 'أوتار الساعة',
        question: 'احسب المسافة بين تدريجين متتاليين. ثم احسب المسافة بين التدريجين 12 و 4.',
        asks: ['المسافة بين تدريجين متتاليين', 'المسافة بين التدريجين 12 و 4'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['irtifa-mutasawi-saqayn'],
            prompt: 'ننزل من $O$ العمود على الوتر بين تدريجين متتاليين. قيس الزاوية التي رأسها $O$ في المثلث القائم الناتج هو:',
            options: ['$15^\\circ$: نصف الزاوية المركزية', '$30^\\circ$: الزاوية المركزية كلّها', '$60^\\circ$'],
            correct: 0,
            explain: 'العمود من $O$ ينصّف الزاوية المركزية $30^\\circ$ وينصّف الوتر.' },
          { kind: 'numeric', role: 'compute', requires: ['jaib-zawiya'],
            prompt: 'نصف الوتر (بالسنتيمتر):', expected: 13,
            explain: '$50 \\times \\sin 15^\\circ \\approx 50 \\times 0{,}26 = 13$.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'المسافة بين تدريجين متتاليين (بالسنتيمتر):', expected: 26,
            explain: '$2 \\times 13 = 26$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['jaib-zawiya'],
            prompt: 'من 12 إلى 4 أربعة فواصل، أي زاوية مركزية $4 \\times 30 = 120$ درجة نصفها $60^\\circ$. المسافة بين التدريجين 12 و 4 (بالسنتيمتر):', expected: 87,
            explain: '$2 \\times 50 \\times \\sin 60^\\circ \\approx 2 \\times 50 \\times 0{,}87 = 87$.' },
          { kind: 'solution', lines: [
            'بين تدريجين متتاليين: نصف الزاوية المركزية $15^\\circ$، ونصف الوتر $50 \\times \\sin 15^\\circ \\approx 50 \\times 0{,}26 = 13$، فالمسافة $2 \\times 13 = 26$ أي $26\\,\\mathrm{cm}$.',
            'بين 12 و 4: الزاوية المركزية $4 \\times 30^\\circ = 120^\\circ$ ونصفها $60^\\circ$، فالمسافة $2 \\times 50 \\times \\sin 60^\\circ \\approx 2 \\times 50 \\times 0{,}87 = 87$ أي $87\\,\\mathrm{cm}$.',
          ] },
        ],
      },
      {
        label: '3)', title: 'خيط الإضاءة',
        question: 'احسب طول خيط الإضاءة بالسنتيمتر. ثم احسب ثمنه.',
        asks: ['طول خيط الإضاءة', 'ثمن خيط الإضاءة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['sura-dawaran'],
            prompt: 'طول خيط الإضاءة (بالسنتيمتر):', expected: 312,
            explain: 'الأوتار الاثنا عشر متقايسة (كل وتر صورة الذي قبله بالدوران الذي زاويته $30^\\circ$): $12 \\times 26 = 312$.' },
          { kind: 'choice', role: 'translate',
            prompt: 'ثمن المتر معطى بالدينار، فنحوّل الطول إلى المتر:',
            options: ['$312\\,\\mathrm{cm} = 3{,}12\\,\\mathrm{m}$', '$312\\,\\mathrm{cm} = 31{,}2\\,\\mathrm{m}$', '$312\\,\\mathrm{cm} = 0{,}312\\,\\mathrm{m}$'],
            correct: 0,
            explain: '$1\\,\\mathrm{m} = 100\\,\\mathrm{cm}$، إذن $312 \\div 100 = 3{,}12$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ثمن الخيط:', expected: 2496, suffix: 'دج',
            explain: '$3{,}12 \\times 800 = 2496$.' },
          { kind: 'solution', lines: [
            'الأوتار الاثنا عشر متقايسة: $12 \\times 26 = 312$، أي $312\\,\\mathrm{cm} = 3{,}12\\,\\mathrm{m}$.',
            'الثمن: $3{,}12 \\times 800 = 2496$، أي 2496 دج.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
