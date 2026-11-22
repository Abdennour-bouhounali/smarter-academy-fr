/**
 * Les exercices du درس 2 « حل جملة معادلتين من الدرجة الأولى بمجهولين جبرياً » — les éléments du manuel rattachés à la leçon (couverture :
 * extraction.json → destinations, `src(...)` gardé en métadonnée), RÉÉCRITS par la plateforme (rollout du lecteur de mission, 2026-11-12 : indépendance
 * du manuel ; conseil du 2026-11-11, verdict L2.12 et X11 « règle P » : avant le module 4, aucune ligne `explain` / `method` ni aucune équation donnée
 * ne montre un moins devant une parenthèse — une substitution qui tomberait sur un coefficient négatif s'explique par la ADDITION). Chaque couple est
 * recalculé par content/exercises.test.js. Ids, LP et sources gardés.
 *
 * Une solution est une ثنائية tapée (`pair`, évaluée comme le moteur de pratique : fractions, décimaux à virgule, chiffres arabes ; un seul nombre juste
 * est une réponse partielle). Les inconnues gardent leurs lettres — (a ; b), (d ; t) — par `names`. Les valeurs non entières sont gardées EXACTES.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_hall-jabri_P1',
  P2: '4am_hall-jabri_P2',
  P3: '4am_hall-jabri_P3',
};

const E = (n, part, page = 60, section = 'أوظّف تعلّماتي') => ({ ...src(`ex-${n}`, page, section, n), ...(part ? { part } : {}) });
const PAIR = (prompt, x, y, explain, names) => ({ interaction: 'pair', question: { prompt, expected: { x, y }, explain, ...(names ? { names } : {}) } });

/* ── Module 2 — « دوري » ──────────────────────────────────────────── */
const NOW_SRC = (part) => ({ ...src('now-59', 59, 'دوري الآن'), part });
export const NOW_59 = [
  {
    id: 'now-59-1', system: '2x+y=13|x/2-y=-3', source: NOW_SRC('1'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'حل الجملتين الآتيتين مبيّنا طريقة الحل المستعملة. $\\begin{cases} 2x + y = 13 \\\\ \\dfrac{1}{2}x - y = -3 \\end{cases}$ ، $\\begin{cases} 4x - 2y = 6 \\\\ x + 2y = -1 \\end{cases}$',
    ...PAIR('الجملة الأولى $\\begin{cases} 2x + y = 13 \\\\ \\dfrac{1}{2}x - y = -3 \\end{cases}$ ، حلها:', '4', '5',
      'معاملا $y$ متعاكسان ($y$ و $-y$): طريقة الجمع مباشرة. $2x + \\dfrac{1}{2}x = 13 - 3$ أي $\\dfrac{5}{2}x = 10$ ومنه $x = 4$ ؛ ثم $y = 13 - 2x = 13 - 8 = 5$ . الحل $(4 ; 5)$ .'),
    method: 'نختار الجمع لأنّ معاملي $y$ متعاكسان.',
    commonError: 'التوقف عند $x = 4$ : الحل ثنائية، فنعوّض لنجد $y$ أيضًا.',
  },
  {
    id: 'now-59-2', system: '4x-2y=6|x+2y=-1', source: NOW_SRC('2'), learningPointId: LP.P3, difficulty: 'moyen',
    ...PAIR('الجملة الثانية $\\begin{cases} 4x - 2y = 6 \\\\ x + 2y = -1 \\end{cases}$ ، حلها:', '1', '-1',
      'معاملا $y$ متعاكسان ($-2y$ و $2y$): بالجمع $5x = 5$ ومنه $x = 1$ ؛ ثم $1 + 2y = -1$ أي $2y = -2$ ومنه $y = -1$ . الحل $(1 ; -1)$ .'),
    method: 'نختار الجمع لأنّ معاملي $y$ متعاكسان.',
    commonError: 'خطأ الإشارة في الطرف الثاني: $5x = 7$ بدل $5x = 6 + (-1) = 5$ .',
  },
];

/* ── Module 3 — أوظّف تعلّماتي ──────────────────────── */
export const EXERCISES = [
  // التعويض
  { id: 'ex-5-a', source: E(5, 'أ'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'حل الجملتين الآتيتين باستعمال طريقة التعويض.',
    items: ['أ) $\\begin{cases} x + 2y = 9 \\\\ 3x + 4y = 19 \\end{cases}$', 'ب) $\\begin{cases} 2a + 3b = 0 \\\\ 4a + 5b = -4 \\end{cases}$'],
    ...PAIR('أ) الحل:', '1', '4', 'من $x + 2y = 9$ ينتج $x = 9 - 2y$ ؛ بالتعويض: $3(9 - 2y) + 4y = 19$ أي $27 - 2y = 19$ ، ومنه $y = 4$ ثم $x = 9 - 8 = 1$ . الحل $(1 ; 4)$ .'),
    method: 'نعبّر عن المجهول الذي معامله 1 ($x$ في المعادلة الأولى) بدلالة الآخر، ثم نعوّض في المعادلة الأخرى.',
    commonError: 'التعويض في المعادلة نفسها $x + 2y = 9$ : نجد $9 - 2y + 2y = 9$ أي $9 = 9$ ، ولا نتعلّم شيئًا.' },
  { id: 'ex-5-b', source: E(5, 'ب'), learningPointId: LP.P1, difficulty: 'moyen',
    ...PAIR('ب) الحل $(a ; b)$:', '-6', '4', 'من $2a + 3b = 0$ ينتج $a = -\\dfrac{3}{2}b$ ؛ بالتعويض: $4 \\times \\left(-\\dfrac{3}{2}b\\right) + 5b = -4$ أي $-6b + 5b = -4$ ، ومنه $b = 4$ ثم $a = -6$ . للتحقق: $2 \\times (-6) + 3 \\times 4 = 0$ و $4 \\times (-6) + 5 \\times 4 = -4$ .', ['a', 'b']),
    commonError: 'قلب ترتيب الثنائية: $(4 ; -6)$ بدل $(a ; b) = (-6 ; 4)$ .' },
  { id: 'ex-6-a', source: E(6, 'أ'), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'نفس التمرين مع الجملتين:',
    items: ['أ) $\\begin{cases} 3x - 2y = 14 \\\\ 2x + 5y = 3 \\end{cases}$', 'ب) $\\begin{cases} d = 60t \\\\ d + 40t = 300 \\end{cases}$'],
    ...PAIR('أ) الحل:', '4', '-1', 'من $3x - 2y = 14$ ينتج $y = \\dfrac{3x - 14}{2}$ ؛ بالتعويض ثم الضرب في 2: $4x + 5(3x - 14) = 6$ أي $19x - 70 = 6$ ، ومنه $19x = 76$ و $x = 4$ ثم $y = \\dfrac{12 - 14}{2} = -1$ .'),
    commonError: 'نسيان ضرب الطرف الثاني في 2 بعد التعويض: $4x + 5(3x - 14) = 3$ .' },
  { id: 'ex-6-b', source: E(6, 'ب'), learningPointId: LP.P1, difficulty: 'facile',
    ...PAIR('ب) الحل $(d ; t)$:', '180', '3', 'المجهول $d$ معطى بدلالة $t$ : نعوّضه في المعادلة الثانية، $60t + 40t = 300$ أي $100t = 300$ ، ومنه $t = 3$ ثم $d = 60 \\times 3 = 180$ .', ['d', 't']) },
  // الجمع
  { id: 'ex-7-a', source: E(7, 'أ'), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'حل الجملتين الآتيتين باستعمال طريقة الجمع والتعويض.',
    items: ['أ) $\\begin{cases} -x + 2y = 1 \\\\ 3x + y = 11 \\end{cases}$', 'ب) $\\begin{cases} 4x + 3y = 10 \\\\ 5x + 2y = 9 \\end{cases}$'],
    ...PAIR('أ) الحل:', '3', '2', 'نضرب طرفي المعادلة الأولى في 3: $-3x + 6y = 3$ ، ونجمعها مع الثانية طرفًا لطرف: $7y = 14$ ، ومنه $y = 2$ ؛ ثم $3x + 2 = 11$ أي $x = 3$ .'),
    method: 'نضرب طرفي معادلة في معامل مناسب ليصير معاملا أحد المجهولين متعاكسين، ثم نجمع طرفًا لطرف.',
    commonError: 'ضرب طرف واحد: $-3x + 6y = 1$ بدل $-3x + 6y = 3$ .' },
  { id: 'ex-7-b', source: E(7, 'ب'), learningPointId: LP.P2, difficulty: 'moyen',
    ...PAIR('ب) الحل:', '1', '2', 'لنتخلّص من $y$ : نضرب الأولى في 2 والثانية في $-3$ : $8x + 6y = 20$ و $-15x - 6y = -27$ ؛ بالجمع $-7x = -7$ ، ومنه $x = 1$ ثم $4 + 3y = 10$ أي $y = 2$ .'),
    commonError: 'الجمع دون أن يكون المعاملان متعاكسين: $9x + 5y = 19$ يبقى فيها المجهولان.' },
  { id: 'ex-8-a', source: E(8, 'أ'), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'نفس التمرين مع الجملتين:',
    items: ['أ) $\\begin{cases} 3x - y = 1 \\\\ 2x + 3y = 19 \\end{cases}$', 'ب) $\\begin{cases} 2x + 5y = 11 \\\\ -3x + 4y = 18 \\end{cases}$'],
    ...PAIR('أ) الحل:', '2', '5', 'نضرب الأولى في 3: $9x - 3y = 3$ ، ونجمع مع الثانية: $11x = 22$ ، ومنه $x = 2$ ثم $y = 3x - 1 = 5$ .') },
  { id: 'ex-8-b', source: E(8, 'ب'), learningPointId: LP.P2, difficulty: 'moyen',
    ...PAIR('ب) الحل:', '-2', '3', 'لنتخلّص من $x$ : نضرب الأولى في 3 والثانية في 2: $6x + 15y = 33$ و $-6x + 8y = 36$ ؛ بالجمع $23y = 69$ ، ومنه $y = 3$ ثم $2x + 15 = 11$ أي $x = -2$ .'),
    commonError: 'ضرب معادلة واحدة: لا يتعاكس $6x$ و $-3x$ ؛ نضرب الثانية في 2 أيضًا.' },
  // طريقة من اختيارك
  { id: 'ex-9-a', source: E(9, 'أ'), learningPointId: LP.P3, difficulty: 'facile',
    statement: 'حل الجملتين الآتيتين باستعمال طريقة من اختيارك.',
    items: ['أ) $\\begin{cases} -3x + y = 1 \\\\ 4x - y = 2 \\end{cases}$', 'ب) $\\begin{cases} \\dfrac{x}{4} - y = 0 \\\\ 2x - 3y = 10 \\end{cases}$'],
    ...PAIR('أ) الحل:', '3', '10', 'معاملا $y$ متعاكسان: بالجمع مباشرة $x = 3$ ، ثم $y = 1 + 3x = 10$ .'),
    method: 'ننظر إلى المعاملات قبل أن نختار: معاملان متعاكسان → الجمع؛ معامل 1 أو $-1$ → التعويض.' },
  { id: 'ex-9-b', source: E(9, 'ب'), learningPointId: LP.P3, difficulty: 'moyen',
    ...PAIR('ب) الحل:', '8', '2', 'من الأولى $y = \\dfrac{x}{4}$ ؛ بالتعويض: $2x - \\dfrac{3x}{4} = 10$ أي $\\dfrac{5}{4}x = 10$ ، ومنه $x = 8$ ثم $y = 2$ .') },
  { id: 'ex-10-a', source: E(10, 'أ'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'نفس التمرين السابق مع الجملتين:',
    items: ['أ) $\\begin{cases} 3x = 4y \\\\ y = 2(x - 5) \\end{cases}$', 'ب) $\\begin{cases} x = -y \\\\ 4x + 3y = 2 \\end{cases}$'],
    ...PAIR('أ) الحل:', '8', '6', 'المجهول $y$ معطى بدلالة $x$ : نعوّضه في الأولى، $3x = 4 \\times 2(x - 5) = 8x - 40$ أي $5x = 40$ ، ومنه $x = 8$ ثم $y = 2 \\times 3 = 6$ .') },
  { id: 'ex-10-b', source: E(10, 'ب'), learningPointId: LP.P3, difficulty: 'facile',
    ...PAIR('ب) الحل:', '2', '-2', 'نعوّض $x$ بالعبارة $-y$ : $-4y + 3y = 2$ أي $-y = 2$ ، ومنه $y = -2$ و $x = 2$ . الحل $(2 ; -2)$ .') },
  { id: 'ex-11-a', source: E(11, 'أ'), learningPointId: LP.P3, difficulty: 'facile',
    statement: 'حل كلّ جملة باختيار طريقة مناسبة.',
    items: ['أ) $\\begin{cases} x + y = 15 \\\\ 2x + 3y = 38 \\end{cases}$', 'ب) $\\begin{cases} 4x - 3y = 2 \\\\ 10x - y = -8 \\end{cases}$', 'جـ) $\\begin{cases} 5x - 2y = 0 \\\\ 3x - y = 2 \\end{cases}$', 'د) $\\begin{cases} a - b = 4 \\\\ 2a - \\dfrac{b}{3} = 13 \\end{cases}$'],
    ...PAIR('أ) الحل:', '7', '8', '$y = 15 - x$ ؛ بالتعويض: $2x + 3(15 - x) = 38$ أي $45 - x = 38$ ، ومنه $x = 7$ ثم $y = 8$ .') },
  { id: 'ex-11-b', source: E(11, 'ب'), learningPointId: LP.P3, difficulty: 'moyen',
    ...PAIR('ب) الحل:', '-1', '-2', 'نضرب الثانية في $-3$ : $-30x + 3y = 24$ ، ونجمعها مع الأولى: $-26x = 26$ ، ومنه $x = -1$ ثم $-10 - y = -8$ أي $y = -2$ .'),
    commonError: 'خطأ الإشارة: من $10x - y = -8$ ينتج $y = 10x + 8$ وليس $y = 10x - 8$ .' },
  { id: 'ex-11-c', source: E(11, 'جـ'), learningPointId: LP.P3, difficulty: 'moyen',
    ...PAIR('جـ) الحل:', '4', '10', 'نضرب الثانية في $-2$ : $-6x + 2y = -4$ ، ونجمعها مع الأولى: $-x = -4$ ، ومنه $x = 4$ ثم $y = 3 \\times 4 - 2 = 10$ .') },
  { id: 'ex-11-d', source: E(11, 'د'), learningPointId: LP.P3, difficulty: 'difficile',
    ...PAIR('د) الحل $(a ; b)$:', '7', '3', '$a = b + 4$ ؛ بالتعويض: $2(b + 4) - \\dfrac{b}{3} = 13$ أي $\\dfrac{5}{3}b = 5$ ، ومنه $b = 3$ ثم $a = 7$ .', ['a', 'b']) },
  // جملة تُبسَّط أولًا
  { id: 'ex-12-1', source: E(12, '1', 61), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'حلّ الجملة باستعمال طريقة من اختيارك. $\\begin{cases} x + 2y = 9 \\\\ 4y - 1 = 3(x - 2) \\end{cases}$',
    interaction: 'choice',
    question: {
      prompt: 'نبدأ بتبسيط المعادلة الثانية $4y - 1 = 3(x - 2)$ ، فتُكتب:',
      options: ['$3x - 4y = 5$', '$3x - 4y = 1$', '$3x - 4y = -5$'],
      correct: 0, cols: 3,
      explain: '$4y - 1 = 3x - 6$ ، ننقل $4y$ إلى الطرف الثاني و $-6$ إلى الأول: $3x - 4y = -1 + 6 = 5$ .',
    },
    commonError: 'نشر $3(x - 2)$ إلى $3x - 2$ : العدد 3 يُضرب في الحدّين.' },
  { id: 'ex-12-2', source: E(12, '2', 61), learningPointId: LP.P3, difficulty: 'difficile',
    ...PAIR('الحل:', '23/5', '11/5', 'معامل $x$ في الأولى 1: $x = 9 - 2y$ ؛ بالتعويض في $3x - 4y = 5$ : $3(9 - 2y) - 4y = 5$ أي $27 - 10y = 5$ ، ومنه $y = \\dfrac{11}{5}$ ثم $x = 9 - \\dfrac{22}{5} = \\dfrac{23}{5}$ .') },
  { id: 'ex-13-1', source: E(13, '1', 61), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'السؤال نفسه مع الجملة: $\\begin{cases} x - 3y = 2 \\\\ 2(x - y) = -8 \\end{cases}$',
    interaction: 'choice',
    question: {
      prompt: 'المعادلة $2(x - y) = -8$ تُكتب أبسط:',
      options: ['$x - y = -4$', '$x - y = 4$', '$x - y = -6$'],
      correct: 0, cols: 3,
      explain: 'نقسم الطرفين على 2: $x - y = \\dfrac{-8}{2} = -4$ .',
    } },
  { id: 'ex-13-2', source: E(13, '2', 61), learningPointId: LP.P3, difficulty: 'moyen',
    ...PAIR('الحل:', '-7', '-3', 'معاملا $x$ متساويان في $x - 3y = 2$ و $x - y = -4$ : نضرب الثانية في $-1$ ، أي $-x + y = 4$ ، ثم نجمع: $-2y = 6$ ، ومنه $y = -3$ ثم $x = -4 + y = -7$ .'),
    commonError: 'جمع المعادلتين كما هما: $2x - 4y = -2$ ، معاملا $x$ متساويان وليسا متعاكسين.' },
  // أتعمّق
  { id: 'ex-22', source: E(22, null, 63, 'أتعمّق'), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'حل الجملة الآتية باستعمال طريقة من اختيارك. $\\begin{cases} 6x + 5y = 26{,}5 \\\\ 4x + 3y = 16{,}5 \\end{cases}$',
    ...PAIR('الحل:', '1,5', '3,5', 'لا معامل 1 هنا: الجمع أنسب. نضرب الأولى في 2 والثانية في $-3$ : $12x + 10y = 53$ و $-12x - 9y = -49{,}5$ ؛ بالجمع $y = 3{,}5$ ، ثم $6x = 26{,}5 - 17{,}5 = 9$ أي $x = 1{,}5$ .') },
  { id: 'ex-23', source: E(23, null, 63, 'أتعمّق'), learningPointId: LP.P3, difficulty: 'facile',
    statement: 'حل الجملة باستعمال طريقة من اختيارك. $\\begin{cases} 3x + y = 2 \\\\ -3x + 2y = -11 \\end{cases}$',
    ...PAIR('الحل:', '5/3', '-3', 'معاملا $x$ متعاكسان: بالجمع $3y = -9$ ، ومنه $y = -3$ ثم $3x - 3 = 2$ أي $x = \\dfrac{5}{3}$ .') },
];

/** Les entrées d'un exercice (« 5 », « 12 », « 22 »). */
export const partsOf = (n) => EXERCISES.filter((ex) => ex.source.number === Number(n));
/** Accès par id (la carte de connaissances cite ces textes). */
export const EX = Object.fromEntries([...EXERCISES, ...NOW_59].map((ex) => [ex.id, ex]));
