/**
 * Les exercices rattachés au درس 3 « المتراجحات من الدرجة الأولى بمجهول واحد » (couverture : extraction.json → destinations). Depuis le rollout
 * du 2026-11-11 (conseil, verdict X2) CHAQUE énoncé est celui de la plateforme — ses nombres, ses mots, ses vérifications recalculées — et garde l'`id`,
 * la compétence (`learningPointId`) et la structure de l'exercice du manuel qu'il couvre (`source.part` : « بأعداد المنصّة »). Aucun énoncé n'est
 * recopié, aucun écran n'envoie au livre. Un exercice à plusieurs inéquations est découpé en une entrée par inéquation (la première porte l'énoncé).
 *
 * Une solution d'inéquation est un CHOIX (`choice`) : les distracteurs sont FAUX (calculés à la main) et viennent d'erreurs réelles — le sens gardé
 * après une division par un négatif, le sens changé sans raison, un terme oublié en développant, une opération faite à l'envers. Une question
 * « مثّل بيانيا » porte un `graph` (trois droites DESSINÉES, components/RayFigure.jsx) : la bonne, le mauvais côté, le mauvais crochet.
 * Aucun terme ±3x n'y paraît, aucun nombre de la مسألة (content/forbidden.js, content/mission.test.js).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_mutarajiha-ula_P1',
  P2: '4am_mutarajiha-ula_P2',
  P3: '4am_mutarajiha-ula_P3',
};

const REWRITE = 'بأعداد المنصّة';
const E = (n, part) => ({ ...src(`ex-${n}`, 51, 'أوظّف تعلّماتي', n), part: part ? `${part} — ${REWRITE}` : REWRITE });
const C = (prompt, options, correct, explain, cols = 3) => ({ prompt, options, correct, cols, explain });
/** Les trois droites d'une question « مثّل بيانيا » (l'énoncé rappelle la ligne résolue) : juste, côté inversé, crochet inversé. */
const G = (from, to, at, side, closed, boundTex, explain, line) => ({
  prompt: line ? `أيّ تمثيل بياني لحلول هذه المتراجحة صحيح؟ ${line}` : 'أيّ تمثيل بياني لحلول هذه المتراجحة صحيح؟',
  options: [
    { from, to, at, side, closed, boundTex },
    { from, to, at, side: side === 'left' ? 'right' : 'left', closed, boundTex },
    { from, to, at, side, closed: !closed, boundTex },
  ],
  correct: 0,
  explain,
});

/* ── Module 4 — دوري الآن ────────────────────────────────────────────────── */
export const NOW_49_1 = [
  {
    id: 'now-49-1-a', source: { ...src('now-49-1', 49, 'دوري الآن', 1), part: `أ — ${REWRITE}` }, learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'حل كل متراجحة مما يلي ثم مثل بيانيا حلولها : $-4(x + 2) \\leq 3 - 2x$ ، $\\dfrac{5x - 1}{2} + 2 > 2x + 3$ .',
    interaction: 'choice',
    question: C('$-4(x + 2) \\leq 3 - 2x$', ['$x \\geq -\\dfrac{11}{2}$', '$x \\leq -\\dfrac{11}{2}$', '$x \\geq \\dfrac{11}{2}$'], 0,
      '$-4x - 8 \\leq 3 - 2x$ ثم $-2x \\leq 11$ ، ونقسم على $-2$ (سالب) فنغيّر الاتجاه: $x \\geq -\\dfrac{11}{2}$'),
    method: 'ننشر أولًا، ثم ننقل حدود $x$ إلى طرف والأعداد إلى الطرف الآخر، ثم نقسم على المعامل.',
    commonError: 'إبقاء الاتجاه بعد القسمة على $-2$ : $x \\leq -\\dfrac{11}{2}$.',
    graph: G(-8, -3, -5.5, 'right', true, '-\\dfrac{11}{2}', 'الحلول هي الأعداد الأكبر من أو تساوي $-\\dfrac{11}{2}$ : الجزء الملوّن على يمين $-\\dfrac{11}{2}$ والرمز موجّه نحوه.', '(الحلّ: $x \\geq -\\dfrac{11}{2}$ )'),
  },
  {
    id: 'now-49-1-b', source: { ...src('now-49-1', 49, 'دوري الآن', 1), part: `ب — ${REWRITE}` }, learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'choice',
    question: C('$\\dfrac{5x - 1}{2} + 2 > 2x + 3$', ['$x > 3$', '$x < 3$', '$x > 5$'], 0,
      'نضرب الطرفين في 2: $5x - 1 + 4 > 4x + 6$ أي $5x + 3 > 4x + 6$ ، ثم $x > 3$'),
    method: 'نضرب الطرفين في المقام 2 (موجب: الاتجاه لا يتغيّر)، دون أن ننسى ضرب كل الحدود.',
    commonError: 'ضرب الكسر وحده في 2 ونسيان العدد 2 والطرف الثاني.',
    graph: G(0, 6, 3, 'right', false, null, 'الحلول هي الأعداد الأكبر من 3 : الجزء الملوّن على يمين 3 ، و 3 ليس حلًّا فالرمز غير موجّه نحوه.', '(الحلّ: $x > 3$ )'),
  },
];

/* ── Module 5 — أوظّف تعلّماتي ───────────────────────────────────────────── */
const ORDER = ['$<$', '$>$'];
const FITS = ['يحقّقها', 'لا يحقّقها'];

export const EXERCISES = [
  {
    id: 'ex-21', source: E(21), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'أكمل في كل حالة مما يلي بالرمز المناسب < أو >.',
    interaction: 'batch',
    question: {
      rows: [
        { label: '1) $-2{,}3 \\ldots -2{,}36$', options: ORDER, correct: 1, correction: '$2{,}3 < 2{,}36$ ، والعدد السالب الأقرب إلى الصفر هو الأكبر: $-2{,}3 > -2{,}36$' },
        { label: '2) $2{,}39 \\times 10^4 \\ldots 2{,}4 \\times 10^4$', options: ORDER, correct: 0, correction: '$2{,}39 < 2{,}40$ والقوة نفسها: $2{,}39 \\times 10^4 < 2{,}4 \\times 10^4$' },
        { label: '3) $2 + \\dfrac{1}{2} \\ldots \\dfrac{7}{3}$', options: ORDER, correct: 1, correction: '$2 + \\dfrac{1}{2} = \\dfrac{15}{6}$ و $\\dfrac{7}{3} = \\dfrac{14}{6}$ : $2 + \\dfrac{1}{2} > \\dfrac{7}{3}$' },
      ],
      explain: 'نقارن بعد كتابة العددين بنفس الشكل (نفس عدد الأرقام العشرية، نفس القوة، نفس المقام).',
    },
    method: 'نكتب العددين بنفس الشكل ثم نقارن.',
    commonError: 'اعتبار $-2{,}36$ أكبر من $-2{,}3$ لأنّ $2{,}36 > 2{,}3$ : بين عددين سالبين، الأكبر هو الأقرب إلى الصفر.',
  },
  {
    id: 'ex-22', source: E(22), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'إذا علمت أن $x > 4$ . أكمل كلا مما يلي: $5x > \\ldots$ ، $-2x \\ldots -8$ ، $5x + 1 \\ldots\\ldots$ .',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$5x > \\ldots$', options: ['$20$', '$25$', '$24$'], correct: 0, correction: 'نضرب في 5 (موجب): $5x > 5 \\times 4 = 20$' },
        { label: '$-2x \\ldots -8$', options: ORDER, correct: 0, correction: 'نضرب في $-2$ (سالب) فنغيّر الاتجاه: $-2x < -2 \\times 4 = -8$' },
        { label: '$5x + 1 \\ldots\\ldots$', options: ['$> 21$', '$< 21$', '$> 22$'], correct: 0, correction: 'من $5x > 20$ نضيف 1: $5x + 1 > 21$' },
      ],
      explain: 'الضرب في عدد موجب أو إضافة عدد يحافظ على الاتجاه؛ الضرب في عدد سالب يغيّره. والإكمال المطلوب هو ما ينتج بالضبط من $x > 4$.',
    },
    method: 'نطبّق على طرفي $x > 4$ العملية نفسها، ونغيّر الاتجاه عند الضرب في عدد سالب.',
    commonError: 'كتابة $-2x > -8$ : الضرب في $-2$ يغيّر الاتجاه.',
  },
  {
    id: 'ex-23', source: E(23), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'إذا علمت أن $x < -3$ . أكمل كلا مما يلي: $4x < \\ldots$ ، $-5x \\ldots 15$ ، $2x - 1 \\ldots\\ldots$ .',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$4x < \\ldots$', options: ['$-12$', '$-15$', '$-16$'], correct: 0, correction: 'نضرب في 4 (موجب): $4x < 4 \\times (-3) = -12$' },
        { label: '$-5x \\ldots 15$', options: ORDER, correct: 1, correction: 'نضرب في $-5$ (سالب) فنغيّر الاتجاه: $-5x > (-5) \\times (-3) = 15$' },
        { label: '$2x - 1 \\ldots\\ldots$', options: ['$< -7$', '$> -7$', '$< -9$'], correct: 0, correction: '$2x < -6$ ثم نطرح 1: $2x - 1 < -7$' },
      ],
      explain: 'الإشارة السالبة للطرف الثاني لا تغيّر شيئًا: وحده الضرب في عدد سالب يغيّر الاتجاه.',
    },
    commonError: 'كتابة $4x > -12$ لأنّ $-3$ سالب: الضرب في 4 (موجب) يحافظ على الاتجاه.',
  },
  {
    id: 'ex-24-1', source: E(24, '1'), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'حل كل متراجحة مما يلي:',
    items: ['$4x \\geq -3$', '$-2x < 14$', '$\\dfrac{7}{2}x > 14$'],
    interaction: 'choice',
    question: C('$4x \\geq -3$', ['$x \\geq -\\dfrac{3}{4}$', '$x \\leq -\\dfrac{3}{4}$', '$x \\geq -\\dfrac{4}{3}$'], 0,
      'نقسم على 4 (موجب): $x \\geq -\\dfrac{3}{4}$'),
    commonError: 'تغيير الاتجاه لأنّ $-3$ سالب: المعامل 4 موجب.',
  },
  {
    id: 'ex-24-2', source: E(24, '2'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: C('$-2x < 14$', ['$x < -7$', '$x > -7$', '$x > 7$'], 1, 'نقسم على $-2$ (سالب) فنغيّر الاتجاه: $x > -7$'),
    commonError: 'الإبقاء على الاتجاه: $x < -7$.',
  },
  {
    id: 'ex-24-3', source: E(24, '3'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: C('$\\dfrac{7}{2}x > 14$', ['$x > 49$', '$x > 4$', '$x < 4$'], 1, 'نضرب في $\\dfrac{2}{7}$ (موجب): $x > 14 \\times \\dfrac{2}{7} = 4$'),
    commonError: 'الضرب في $\\dfrac{7}{2}$ بدل $\\dfrac{2}{7}$ : $x > 49$.',
  },
  {
    id: 'ex-25-1', source: E(25, '1)'), learningPointId: LP.P1, difficulty: 'facile',
    statement: '1) إليك المتراجحة $4x - 3 < 5$ . عين قيم $x$ التي تحقّق هذه المتراجحة من بين القيم الآتية: $x = 0$ ، $x = -1$ ، $x = 3$ ، $x = 2$ . 2) حل المتراجحة المعطاة.',
    interaction: 'batch',
    question: {
      prompt: '1) هل القيمة تحقّق المتراجحة $4x - 3 < 5$ ؟',
      rows: [
        { label: '$x = 0$', options: FITS, correct: 0, correction: '$4 \\times 0 - 3 = -3$ و $-3 < 5$ صحيحة' },
        { label: '$x = -1$', options: FITS, correct: 0, correction: '$4 \\times (-1) - 3 = -7$ و $-7 < 5$ صحيحة' },
        { label: '$x = 3$', options: FITS, correct: 1, correction: '$4 \\times 3 - 3 = 9$ و $9 < 5$ خاطئة' },
        { label: '$x = 2$', options: FITS, correct: 1, correction: '$4 \\times 2 - 3 = 5$ و $5 < 5$ خاطئة (المتراجحة صارمة)' },
      ],
      explain: 'نعوّض $x$ ثم نحكم على المتباينة العددية الناتجة.',
    },
    method: 'نعوّض $x$ بالقيمة في الطرف الأول ثم نقارن بالطرف الثاني.',
    commonError: 'قبول $x = 2$ : نجد $5 < 5$ وهي خاطئة لأنّ الرمز $<$ صارم.',
  },
  {
    id: 'ex-25-2', source: E(25, '2)'), learningPointId: LP.P2, difficulty: 'facile',
    interaction: 'choice',
    question: C('2) $4x - 3 < 5$', ['$x < 2$', '$x > 2$', '$x < \\dfrac{1}{2}$'], 0,
      'نضيف 3: $4x < 8$ ، ثم نقسم على 4: $x < 2$ — وهذا يوافق الجزء 1): 0 و $-1$ حلّان، 3 و 2 ليسا حلّين.'),
    commonError: 'طرح 3 بدل إضافته: $4x < 2$.',
  },
  {
    id: 'ex-26', source: E(26), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'حل المتراجحة $6x - 1 \\leq 20 - x$ .',
    interaction: 'choice',
    question: C('$6x - 1 \\leq 20 - x$', ['$x \\leq 3$', '$x \\geq 3$', '$x \\leq \\dfrac{20}{7}$'], 0,
      'نضيف $x$ ثم 1 إلى الطرفين: $7x \\leq 21$ ، ونقسم على 7: $x \\leq 3$'),
    method: 'ننقل $-x$ بإضافة $x$ إلى الطرفين، ثم ننقل $-1$ بإضافة 1.',
    commonError: 'نسيان إضافة 1 إلى الطرفين: $7x \\leq 20$.',
  },
  {
    id: 'ex-27-1', source: E(27, '1'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'حل كل متراجحة مما يلي:',
    items: ['$\\dfrac{3}{2}x - \\dfrac{1}{4} > 0$', '$2{,}5x - 1 \\leq 4$', '$\\dfrac{x}{3} - \\dfrac{1}{2} \\geq 1$', '$\\dfrac{x + 2}{3} < 2x - 1$'],
    interaction: 'choice',
    question: C('$\\dfrac{3}{2}x - \\dfrac{1}{4} > 0$', ['$x > \\dfrac{1}{6}$', '$x > \\dfrac{3}{8}$', '$x < \\dfrac{1}{6}$'], 0,
      '$\\dfrac{3}{2}x > \\dfrac{1}{4}$ ، ثم نضرب في $\\dfrac{2}{3}$ : $x > \\dfrac{1}{6}$'),
    commonError: 'الضرب في $\\dfrac{3}{2}$ بدل $\\dfrac{2}{3}$ : $x > \\dfrac{3}{8}$.',
  },
  {
    id: 'ex-27-2', source: E(27, '2'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: C('$2{,}5x - 1 \\leq 4$', ['$x \\leq \\dfrac{6}{5}$', '$x \\geq 2$', '$x \\leq 2$'], 2,
      '$2{,}5x \\leq 5$ ، ثم نقسم على $2{,}5$ : $x \\leq 2$'),
    commonError: 'طرح 1 بدل إضافته: $2{,}5x \\leq 3$ أي $x \\leq \\dfrac{6}{5}$.',
  },
  {
    id: 'ex-27-3', source: E(27, '3'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: C('$\\dfrac{x}{3} - \\dfrac{1}{2} \\geq 1$', ['$x \\geq \\dfrac{1}{2}$', '$x \\geq \\dfrac{9}{2}$', '$x \\geq \\dfrac{3}{2}$'], 1,
      '$\\dfrac{x}{3} \\geq \\dfrac{3}{2}$ ، ثم نضرب في 3: $x \\geq \\dfrac{9}{2}$'),
    commonError: 'نسيان الضرب في 3 في الأخير: $x \\geq \\dfrac{3}{2}$.',
  },
  {
    id: 'ex-27-4', source: E(27, '4'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'choice',
    question: C('$\\dfrac{x + 2}{3} < 2x - 1$', ['$x < 1$', '$x > 3$', '$x > 1$'], 2,
      'نضرب في 3: $x + 2 < 6x - 3$ ، ثم $-5x < -5$ ونقسم على $-5$ فنغيّر الاتجاه: $x > 1$'),
    commonError: 'ضرب الطرف الأول وحده في 3: $x + 2 < 2x - 1$ أي $x > 3$ ؛ أو إبقاء الاتجاه بعد القسمة على $-5$.',
  },
  {
    id: 'ex-28', source: E(28), learningPointId: LP.P3, difficulty: 'facile',
    statement: '1) حل المتراجحة $5x - 1 \\leq 8$ . 2) مثّل بيانيا حلول هذه المتراجحة.',
    interaction: 'choice',
    question: C('1) $5x - 1 \\leq 8$', ['$x \\leq \\dfrac{9}{5}$', '$x \\leq \\dfrac{7}{5}$', '$x \\geq \\dfrac{9}{5}$'], 0,
      '$5x \\leq 9$ ، ثم نقسم على 5: $x \\leq \\dfrac{9}{5}$'),
    commonError: 'طرح 1 بدل إضافته: $5x \\leq 7$.',
    graph: G(0, 4, 1.8, 'left', true, '\\dfrac{9}{5}', 'الحلول هي الأعداد الأصغر من أو تساوي $\\dfrac{9}{5}$ : الجزء الملوّن على يسار $\\dfrac{9}{5}$ ، و $\\dfrac{9}{5}$ حلّ فالرمز موجّه نحوه.', '(الحلّ: $x \\leq \\dfrac{9}{5}$ )'),
  },
  {
    id: 'ex-29-1', source: E(29, '1)'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: '1) انشر وبسّط العبارة P حيث: $P = (-2x - 1)^2 - 2x(2x + 3)$ . 2) حلّل العبارة $R = (4x^2 - 9) - (2x - 3)(2x + 1)$ 3) حل المتراجحة $P \\leq R$ ثمّ مثّل بيانيا حلولها.',
    interaction: 'choice',
    question: C('1) $P = $', ['$-2x + 1$', '$-10x + 1$', '$8x^2 - 2x + 1$'], 0,
      '$(-2x - 1)^2 = 4x^2 + 4x + 1$ و $-2x(2x + 3) = -4x^2 - 6x$ ، إذن $P = -2x + 1$'),
    commonError: 'كتابة $(-2x - 1)^2 = 4x^2 - 4x + 1$ : الحد المضاعف $2 \\times (-2x) \\times (-1) = +4x$.',
  },
  {
    id: 'ex-29-2', source: E(29, '2)'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: C('2) $R = $', ['$2(2x - 3)$', '$-2(2x - 3)$', '$(2x - 3)(2x + 1)$'], 0,
      '$4x^2 - 9 = (2x - 3)(2x + 3)$ ، إذن $R = (2x - 3)[(2x + 3) - (2x + 1)] = (2x - 3) \\times 2 = 2(2x - 3)$'),
    commonError: 'حذف القوس المسبوق بـ «−» دون تغيير الإشارات: $(2x + 3) - 2x + 1$.',
  },
  {
    id: 'ex-29-3', source: E(29, '3)'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'choice',
    question: C('3) $P \\leq R$ أي $-2x + 1 \\leq 4x - 6$', ['$x \\leq \\dfrac{7}{6}$', '$x \\geq -\\dfrac{7}{6}$', '$x \\geq \\dfrac{7}{6}$'], 2,
      '$-6x \\leq -7$ ، ونقسم على $-6$ (سالب) فنغيّر الاتجاه: $x \\geq \\dfrac{7}{6}$'),
    commonError: 'إبقاء الاتجاه بعد القسمة على $-6$ : $x \\leq \\dfrac{7}{6}$.',
    graph: G(-1, 4, 7 / 6, 'right', true, '\\dfrac{7}{6}', 'الجزء الملوّن على يمين $\\dfrac{7}{6}$ ، و $\\dfrac{7}{6}$ حلّ فالرمز موجّه نحوه.', '(الحلّ: $x \\geq \\dfrac{7}{6}$ )'),
  },
  {
    id: 'ex-31', source: E(31), learningPointId: LP.P3, difficulty: 'moyen',
    statement: '1) حل المتراجحة الآتية: $5(2x - 1) \\geq 6x + 3$ . 2) مثّل بيانيا حلول هذه المتراجحة.',
    interaction: 'choice',
    question: C('1) $5(2x - 1) \\geq 6x + 3$', ['$x \\geq 2$', '$x \\geq 1$', '$x \\leq 2$'], 0,
      '$10x - 5 \\geq 6x + 3$ ، ثم $4x \\geq 8$ أي $x \\geq 2$'),
    commonError: 'نسيان ضرب $-1$ في 5: $10x - 1 \\geq 6x + 3$ أي $x \\geq 1$.',
    graph: G(-1, 5, 2, 'right', true, null, 'الجزء الملوّن على يمين 2 ، و 2 حلّ فالرمز موجّه نحوه.', '(الحلّ: $x \\geq 2$ )'),
  },
  {
    id: 'ex-32-1', source: E(32, '1'), learningPointId: LP.P2, difficulty: 'difficile',
    statement: '1) حلّ كلا من المتراجحتين الآتيتين: 2) مثّل بيانيا حلول كل متراجحة.',
    items: ['$2(4x - 1) + 4(x - 2) \\geq 5x + 1$', '$5(1 - x) - 2(x - 4) > 2(1 - x) - 5$'],
    interaction: 'choice',
    question: C('$2(4x - 1) + 4(x - 2) \\geq 5x + 1$', ['$x \\geq \\dfrac{11}{7}$', '$x \\leq \\dfrac{11}{7}$', '$x \\geq \\dfrac{5}{7}$'], 0,
      '$12x - 10 \\geq 5x + 1$ ، ثم $7x \\geq 11$ أي $x \\geq \\dfrac{11}{7}$'),
    commonError: 'كتابة $4(x - 2) = 4x - 2$ : نسيان ضرب $-2$ في 4.',
    graph: G(0, 4, 11 / 7, 'right', true, '\\dfrac{11}{7}', 'الجزء الملوّن على يمين $\\dfrac{11}{7}$ ، و $\\dfrac{11}{7}$ حلّ فالرمز موجّه نحوه.', '(الحلّ: $x \\geq \\dfrac{11}{7}$ )'),
  },
  {
    id: 'ex-32-2', source: E(32, '2'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'choice',
    question: C('$5(1 - x) - 2(x - 4) > 2(1 - x) - 5$', ['$x > \\dfrac{16}{5}$', '$x < \\dfrac{16}{5}$', '$x < \\dfrac{14}{5}$'], 1,
      '$13 - 7x > -2x - 3$ ، ثم $-5x > -16$ ونقسم على $-5$ فنغيّر الاتجاه: $x < \\dfrac{16}{5}$'),
    commonError: 'إبقاء الاتجاه بعد القسمة على $-5$ : $x > \\dfrac{16}{5}$.',
    graph: G(1, 6, 3.2, 'left', false, '\\dfrac{16}{5}', 'الجزء الملوّن على يسار $\\dfrac{16}{5}$ ، و $\\dfrac{16}{5}$ ليس حلًّا فالرمز غير موجّه نحوه.', '(الحلّ: $x < \\dfrac{16}{5}$ )'),
  },
];

/** Les entrées d'un exercice du module 5, par numéro : « 21 », « 27 »… */
export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));

/** Accès par id. */
export const EX = Object.fromEntries([...NOW_49_1, ...EXERCISES].map((ex) => [ex.id, ex]));
