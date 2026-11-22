/**
 * Les exercices du module 3 « أوظّف تعلّماتي » du درس 1 « مفهوم جملة معادلتين من الدرجة الأولى بمجهولين ». Depuis le rollout mission (2026-11-12,
 * verdict L1 et prompt §12.12) ils sont ÉCRITS PAR LA PLATEFORME : ses équations, ses ثنائيات, ses mots — les ids, les LP et la forme des
 * questions du manuel restent, `source: src(ex-n)` aussi (traçabilité, `check:textbook`) avec `part: 'بأعداد المنصّة'`. Chaque égalité et chaque
 * réponse est RECALCULÉE dans ./exercises.test.js (une seule rangée juste par ligne ; chaque distracteur contient une ثنائية qui ne vérifie PAS
 * l'équation).
 *
 * Une ثنائية demandée est une réponse `pair` (évaluateur `point`) ; « est-ce une solution ? » est un choix ou une rangée.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_mafhum-jumla_P1',
  P2: '4am_mafhum-jumla_P2',
  P3: '4am_mafhum-jumla_P3',
  P4: '4am_mafhum-jumla_P4',
};

const E = (n, part) => ({ ...src(`ex-${n}`, 60, 'أوظّف تعلّماتي', n), part: part ? `بأعداد المنصّة — ${part}` : 'بأعداد المنصّة' });

export const EXERCISES = [
  // une équation, trois ثنائيات
  {
    id: 'ex-1', source: E(1), learningPointId: LP.P3, difficulty: 'facile',
    statement: 'نعتبر المعادلة من الدرجة الأولى بمجهولين $2x - y = 5$ . هل كلّ من الثنائيات الآتية حلّ لهذه المعادلة؟ علّل. أ) $(1 ; 3)$ ب) $(3 ; 1)$ جـ) $(0 ; -5)$',
    interaction: 'batch',
    check: { eq: '2x-y=5', pairs: [[1, 3], [3, 1], [0, -5]] },
    question: {
      prompt: 'هل الثنائية حلّ للمعادلة $2x - y = 5$ ؟',
      rows: [
        { label: 'أ) $(1 ; 3)$', options: ['حلّ', 'ليست حلًّا'], correct: 1, correction: '$2 \\times 1 - 3 = -1 \\neq 5$' },
        { label: 'ب) $(3 ; 1)$', options: ['حلّ', 'ليست حلًّا'], correct: 0, correction: '$2 \\times 3 - 1 = 5$' },
        { label: 'جـ) $(0 ; -5)$', options: ['حلّ', 'ليست حلًّا'], correct: 0, correction: '$2 \\times 0 - (-5) = 0 + 5 = 5$' },
      ],
      explain: 'نعوّض $x$ بالعدد الأول و $y$ بالعدد الثاني من الثنائية، ثم نقارن النتيجة بـ 5.',
    },
    method: 'نعوّض $x$ بالعدد الأول من الثنائية و $y$ بالعدد الثاني، ثم نتحقّق من المساواة.',
    commonError: 'قلب الترتيب: في $(1 ; 3)$ لدينا $x = 1$ و $y = 3$ وليس العكس.',
  },
  // cinq équations, cinq ثنائيات
  {
    // en DEUX parties (une écran chacune, jamais réduit sous 0,9 — no-back-and-forth 2026-11-12) : chaque partie rappelle ses équations ET la liste
    id: 'ex-2', source: E(2), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'أرفق بكل معادلة الثنائية أو الثنائيات (إن وُجدت) التي هي حلول لها، من بين الثنائيات: $(1 ; 1)$ ، $(2 ; -1)$ ، $\\left(0 ; \\dfrac{1}{2}\\right)$ ، $(2 ; -3)$ ، $\\left(\\dfrac{1}{4} ; 0\\right)$',
    interaction: 'batch',
    check: {
      pairs: [[1, 1], [2, -1], ['0', '1/2'], [2, -3], ['1/4', '0']],
      rows: [
        { eq: '2x+y=3', options: [[[1, 1], [2, -1]], [[2, -1]], []], correct: 0 },
        { eq: 'x+4y=1', options: [[['1/4', '0']], [], [['0', '1/2']]], correct: 1 },
        { eq: 'x-y=3', options: [[[2, -1]], [[2, -1], [2, -3]], [[1, 1]]], correct: 0 },
      ],
    },
    question: {
      prompt: 'لكل معادلة، اختر الثنائيات التي هي حلول لها:',
      rows: [
        { label: 'أ) $2x + y = 3$', options: ['$(1 ; 1)$ و $(2 ; -1)$', '$(2 ; -1)$ فقط', 'لا شيء من الثنائيات'], correct: 0, correction: '$2 \\times 1 + 1 = 3$ و $2 \\times 2 + (-1) = 3$ : ثنائيتان.' },
        { label: 'ب) $x + 4y = 1$', options: ['$\\left(\\dfrac{1}{4} ; 0\\right)$ فقط', 'لا شيء من الثنائيات', '$\\left(0 ; \\dfrac{1}{2}\\right)$ فقط'], correct: 1, correction: 'لا تحقّقها أي ثنائية: مثلًا $\\left(\\dfrac{1}{4} ; 0\\right)$ تعطي $\\dfrac{1}{4}$ و $\\left(0 ; \\dfrac{1}{2}\\right)$ تعطي $2$ .' },
        { label: 'جـ) $x - y = 3$', options: ['$(2 ; -1)$ فقط', '$(2 ; -1)$ و $(2 ; -3)$', '$(1 ; 1)$ فقط'], correct: 0, correction: '$2 - (-1) = 3$ ؛ أمّا $(2 ; -3)$ فتعطي $5$ و $(1 ; 1)$ تعطي $0$ .' },
      ],
      explain: 'قد تقبل المعادلة الواحدة أكثر من ثنائية (المعادلة أ)، وقد لا تقبل أيًّا من الثنائيات المقترحة (المعادلة ب).',
    },
    method: 'نعوّض كل ثنائية في كل معادلة، ونحتفظ بالثنائيات التي تحقّق المساواة.',
    commonError: 'الظنّ أنّ لكل معادلة ثنائية واحدة: المعادلة أ) تقبل ثنائيتين، والمعادلة ب) لا تقبل أيًّا منها.',
  },
  {
    id: 'ex-2-b', source: E(2, 'د، هـ'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'المعادلتان د) و هـ)، والثنائيات نفسها: $(1 ; 1)$ ، $(2 ; -1)$ ، $\\left(0 ; \\dfrac{1}{2}\\right)$ ، $(2 ; -3)$ ، $\\left(\\dfrac{1}{4} ; 0\\right)$',
    interaction: 'batch',
    check: {
      pairs: [[1, 1], [2, -1], ['0', '1/2'], [2, -3], ['1/4', '0']],
      rows: [
        { eq: '3x+2y=0', options: [[[1, 1]], [[2, -3], [2, -1]], [[2, -3]]], correct: 2 },
        { eq: '4x-y=1', options: [[['1/4', '0'], ['0', '1/2']], [['1/4', '0']], [[2, -3]]], correct: 1 },
      ],
    },
    question: {
      prompt: 'لكل معادلة، اختر الثنائيات التي هي حلول لها:',
      rows: [
        { label: 'د) $3x + 2y = 0$', options: ['$(1 ; 1)$ فقط', '$(2 ; -3)$ و $(2 ; -1)$', '$(2 ; -3)$ فقط'], correct: 2, correction: '$3 \\times 2 + 2 \\times (-3) = 0$ ؛ أمّا $(2 ; -1)$ فتعطي $4$ و $(1 ; 1)$ تعطي $5$ .' },
        { label: 'هـ) $4x - y = 1$', options: ['$\\left(\\dfrac{1}{4} ; 0\\right)$ و $\\left(0 ; \\dfrac{1}{2}\\right)$', '$\\left(\\dfrac{1}{4} ; 0\\right)$ فقط', '$(2 ; -3)$ فقط'], correct: 1, correction: '$4 \\times \\dfrac{1}{4} - 0 = 1$ ؛ أمّا $\\left(0 ; \\dfrac{1}{2}\\right)$ فتعطي $-\\dfrac{1}{2}$ و $(2 ; -3)$ تعطي $11$ .' },
      ],
      explain: 'نعوّض كل ثنائية في المعادلة، ونحتفظ بالتي تحقّق المساواة.',
    },
  },
  // deux solutions différentes de chaque équation, puis deux systèmes « de tête »
  {
    id: 'ex-3-1', source: E(3, '1)'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: '1) اذكر حلّين مختلفين لكل معادلة من المعادلات الآتية: أ) $x + y = 0$ ب) $2x + 4y = 5$ جـ) $5x - 2y = 1$ . 2) عيّن ذهنيًّا الثنائية حلّ كلّ جملة: أ) $\\begin{cases} x = \\dfrac{1}{2} \\\\ 4x - y = 5 \\end{cases}$ ب) $\\begin{cases} y = x + 2 \\\\ y = 3x \\end{cases}$',
    interaction: 'batch',
    check: {
      rows: [
        { eq: 'x+y=0', options: [[[0, 0], [1, -1]], [[1, 1], [2, -2]], [[0, 0], [2, 1]]], correct: 0 },
        { eq: '2x+4y=5', options: [[['0', '5/4'], [1, 1]], [['0', '5/4'], ['5/2', '0']], [['5/2', '0'], [2, 0]]], correct: 1 },
        { eq: '5x-2y=1', options: [[[1, 1], [1, 2]], [[0, 0], [-1, -3]], [[1, 2], [-1, -3]]], correct: 2 },
      ],
    },
    question: {
      prompt: '1) في كل سطر، أيّ ثنائيتين هما حلّان مختلفان للمعادلة؟',
      rows: [
        { label: 'أ) $x + y = 0$', options: ['$(0 ; 0)$ و $(1 ; -1)$', '$(1 ; 1)$ و $(2 ; -2)$', '$(0 ; 0)$ و $(2 ; 1)$'], correct: 0, correction: '$0 + 0 = 0$ و $1 + (-1) = 0$ ؛ أمّا $(1 ; 1)$ فتعطي $2$ و $(2 ; 1)$ تعطي $3$ .' },
        { label: 'ب) $2x + 4y = 5$', options: ['$(0 ; 1{,}25)$ و $(1 ; 1)$', '$(0 ; 1{,}25)$ و $(2{,}5 ; 0)$', '$(2{,}5 ; 0)$ و $(2 ; 0)$'], correct: 1, correction: '$4 \\times 1{,}25 = 5$ و $2 \\times 2{,}5 = 5$ ؛ أمّا $(1 ; 1)$ فتعطي $6$ و $(2 ; 0)$ تعطي $4$ .' },
        { label: 'جـ) $5x - 2y = 1$', options: ['$(1 ; 1)$ و $(1 ; 2)$', '$(0 ; 0)$ و $(-1 ; -3)$', '$(1 ; 2)$ و $(-1 ; -3)$'], correct: 2, correction: '$5 - 4 = 1$ و $-5 + 6 = 1$ ؛ أمّا $(1 ; 1)$ فتعطي $3$ و $(0 ; 0)$ تعطي $0$ .' },
      ],
      explain: 'لمعادلة واحدة بمجهولين حلول كثيرة: نختار قيمة لـ $x$ ونحسب $y$ (مثلًا في ب: $x = 0$ يعطي $4y = 5$ أي $y = 1{,}25$).',
    },
    method: 'نختار قيمة لأحد المجهولين، ثم نحسب الآخر بحلّ معادلة من الدرجة الأولى بمجهول واحد.',
  },
  {
    id: 'ex-3-2a', source: E(3, '2) أ'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'pair',
    check: { system: ['x=1/2', '4x-y=5'] },
    question: {
      prompt: '2) أ) $\\begin{cases} x = \\dfrac{1}{2} \\\\ 4x - y = 5 \\end{cases}$ ، الحلّ:',
      expected: { x: '1/2', y: '-3' },
      explain: '$x = \\dfrac{1}{2}$ ، ثم $4 \\times \\dfrac{1}{2} - y = 5$ أي $2 - y = 5$ ومنه $y = -3$. الحلّ $\\left(\\dfrac{1}{2} ; -3\\right)$.',
    },
    commonError: 'كتابة $x = \\dfrac{1}{2}$ وحده: حلّ الجملة ثنائية، ونحسب $y$ أيضًا.',
  },
  {
    id: 'ex-3-2b', source: E(3, '2) ب'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'pair',
    check: { system: ['y=x+2', 'y=3x'] },
    question: {
      prompt: '2) ب) $\\begin{cases} y = x + 2 \\\\ y = 3x \\end{cases}$ ، الحلّ:',
      expected: { x: '1', y: '3' },
      explain: '$y$ يساوي $x + 2$ ويساوي $3x$ في آن واحد: $3x = x + 2$ أي $x = 1$ ، ثم $y = 3 \\times 1 = 3$. وللتحقّق: $1 + 2 = 3$.',
    },
    commonError: 'قلب الثنائية: الحلّ $(1 ; 3)$ وليس $(3 ; 1)$.',
  },
  // une ثنائية est-elle حل للجملة ?
  {
    id: 'ex-4-a', source: E(4, 'أ'), learningPointId: LP.P3, difficulty: 'facile',
    statement: 'أ) هل الثنائية $(1 ; 2)$ حلّ للجملة $\\begin{cases} 3x + y = 5 \\\\ x + y = 1 \\end{cases}$ ؟ ب) السؤال نفسه من أجل الثنائية $(2 ; -1)$ .',
    interaction: 'choice',
    check: { system: ['3x+y=5', 'x+y=1'], pair: [1, 2] },
    question: {
      prompt: 'أ) الثنائية $(1 ; 2)$:',
      options: ['حلّ للجملة', 'ليست حلًّا للجملة'],
      correct: 1,
      cols: 2,
      explain: '$3 \\times 1 + 2 = 5$ : المعادلة الأولى محقّقة، لكن $1 + 2 = 3 \\neq 1$ : الثانية غير محقّقة. إذن $(1 ; 2)$ ليست حلًّا للجملة.',
    },
    method: 'نعوّض في المعادلتين كلتيهما؛ الثنائية حلّ للجملة إذا تحقّقت المعادلتان في آن واحد.',
    commonError: 'الاكتفاء بالمعادلة الأولى: $(1 ; 2)$ تحقّق $3x + y = 5$ لكنها لا تحقّق $x + y = 1$.',
  },
  {
    id: 'ex-4-b', source: E(4, 'ب'), learningPointId: LP.P3, difficulty: 'facile',
    interaction: 'choice',
    check: { system: ['3x+y=5', 'x+y=1'], pair: [2, -1] },
    question: {
      prompt: 'ب) الثنائية $(2 ; -1)$:',
      options: ['حلّ للجملة', 'ليست حلًّا للجملة'],
      correct: 0,
      cols: 2,
      explain: '$3 \\times 2 + (-1) = 5$ و $2 + (-1) = 1$ : المعادلتان محقّقتان في آن واحد، إذن $(2 ; -1)$ حلّ للجملة.',
    },
  },
];

/** Les parties d'un exercice. */
export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));

/** Accès par id. */
export const EX = Object.fromEntries(EXERCISES.map((ex) => [ex.id, ex]));
