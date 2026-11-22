/**
 * Les exercices du module 3 « أوظّف تعلّماتي » du درس « نشر وتبسيط عبارة جبرية » — RÉÉCRITS par la plateforme le 2026-11-11 (conseil du
 * 2026-11-11, verdict L1.7 : « rewrite now » ; INDÉPENDANCE DU MANUEL, CLAUDE.md). Chacun garde la COMPÉTENCE de l'élément du manuel qu'il
 * couvre (`source` : traçabilité des auteurs et `check:textbook`, muette pour l'élève ; `part` le dit pour l'enseignant) — dوري الآن 1 p. 35,
 * ex-1 … ex-8 p. 37 — mais ses nombres, ses contextes et sa rédaction sont ceux de la plateforme. Réponses CALCULÉES ; chaque distracteur est
 * FAUX et reproduit une erreur réelle (un seul terme multiplié, signe oublié, deux produits sur quatre, parenthèses précédées de −).
 *
 * Contraintes (content/mission.test.js) : aucun nombre, facteur, terme ni développement de la مسألة (module 4) ; dans chaque produit de deux
 * parenthèses les deux termes croisés ont le MÊME signe (réduire deux termes croisés opposés est la méthode de la مسألة) ; une vérification
 * par une valeur n'est jamais lue comme un écart (« le terme oublié »).
 * Non lus ailleurs (vérifié le 2026-11-11) : la banque de pratique (content/practice/4am/nashr-tabsit/), « بوصلتي »
 * (content/compass/index.generated.json, construit depuis content/practice) et les feuilles BEM ont leurs propres données.
 *
 * Les OPTIONS et CORRECTIONS d'une ligne `batch` passent par MathText (TextbookExercise) : toute écriture mathématique y est un îlot `$…$`.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_nashr-tabsit_P1',
  P2: '4am_nashr-tabsit_P2',
  P3: '4am_nashr-tabsit_P3',
  P4: '4am_nashr-tabsit_P4',
};

const REWRITE = 'بأعداد المنصّة';
const S = (n) => ({ ...src(`ex-${n}`, 37, 'أوظّف تعلّماتي', n), part: REWRITE });
const OK = 'صحيحة';
const KO = 'خاطئة';

export const EXERCISES = [
  {
    id: 'ex-1', source: S(1), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'في دفتر ورشة النجارة كُتبت أطوال القطع بعبارات. انشر كل عبارة وبسّطها:',
    items: ['$A = 4(2x - 3)$', '$B = -5(2 - x)$', '$C = \\dfrac{2}{3}\\left(9x - \\dfrac{3}{4}\\right)$', '$D = -3\\left(4 - \\dfrac{5}{3}x\\right)$'],
    interaction: 'batch',
    question: {
      prompt: 'اختر النشر المبسّط لكل عبارة.',
      rows: [
        { label: '$A = 4(2x - 3)$', options: ['$8x - 12$', '$8x - 3$', '$8x + 12$'], correct: 0, correction: '$4 \\times 2x - 4 \\times 3 = 8x - 12$' },
        { label: '$B = -5(2 - x)$', options: ['$-10 - 5x$', '$5x - 10$', '$-10 + x$'], correct: 1, correction: '$-5 \\times 2 - (-5) \\times x = -10 + 5x$' },
        { label: '$C = \\dfrac{2}{3}\\left(9x - \\dfrac{3}{4}\\right)$', options: ['$6x - \\dfrac{3}{4}$', '$6x - \\dfrac{1}{2}$', '$\\dfrac{2}{3}x - \\dfrac{1}{2}$'], correct: 1, correction: '$\\dfrac{2}{3} \\times 9x - \\dfrac{2}{3} \\times \\dfrac{3}{4} = 6x - \\dfrac{1}{2}$' },
        { label: '$D = -3\\left(4 - \\dfrac{5}{3}x\\right)$', options: ['$-12 - 5x$', '$12 - 5x$', '$5x - 12$'], correct: 2, correction: '$-3 \\times 4 - (-3) \\times \\dfrac{5}{3}x = -12 + 5x$' },
      ],
      explain: 'نضرب العدد الذي أمام القوسين في كل حدّ داخلهما، مع إشارته: $k(a + b) = ka + kb$ و $k(a - b) = ka - kb$.',
    },
    method: 'نضرب $k$ في كل حدّ من حدّي المجموع أو الفرق، ثم نحسب كل جداء مع إشارته.',
    commonError: 'ضرب العدد في الحدّ الأول فقط، أو نسيان إشارته: $-5(2 - x)$ يساوي $-10 + 5x$ وليس $-10 - 5x$.',
  },
  {
    id: 'ex-2', source: S(2), learningPointId: LP.P3, difficulty: 'facile',
    statement: 'تُبلَّط ساحة مستطيلة بعداها $x + 4$ و $2x + 1$ (بالمتر)، ومساحتها $A = (x + 4)(2x + 1)$ . 1) احسب $A$ من أجل $x = 1$ . 2) انشر $A$ وبسّطها. 3) احسب العبارة المنشورة من أجل $x = 1$ ، وقارن بما وجدته في السؤال 1.',
    interaction: 'batch',
    question: {
      prompt: 'أجب عن الأسئلة الثلاثة بالترتيب.',
      rows: [
        { label: '1) قيمة $A$ من أجل $x = 1$', options: ['$15$', '$8$', '$5$'], correct: 0, correction: '$(1 + 4)(2 \\times 1 + 1) = 5 \\times 3 = 15$' },
        { label: '2) النشر المبسّط للعبارة $A$', options: ['$2x^2 + 4$', '$2x^2 + 9x + 4$', '$2x^2 + 8x + 4$'], correct: 1, correction: '$2x^2 + x + 8x + 4 = 2x^2 + 9x + 4$' },
        { label: '3) قيمة العبارة المنشورة من أجل $x = 1$', options: ['$6$', '$13$', '$15$'], correct: 2, correction: '$2 + 9 + 4 = 15$ : القيمة نفسها.' },
      ],
      explain: 'العبارة وشكلها المنشور متساويتان من أجل كل قيمة لـ $x$ : إن اختلفت القيمتان ففي النشر خطأ. وإن تساوتا فذلك لا يكفي وحده لإثبات النشر.',
    },
    method: 'نتحقّق من نشر بحساب العبارتين من أجل قيمة بسيطة لـ $x$ : قيمتان مختلفتان تكشفان خطأً.',
    commonError: 'نشر جداء القوسين بجداءين فقط: $(x + 4)(2x + 1) = 2x^2 + 4$ ينسى المنطقتين $x$ و $8x$.',
  },
  {
    id: 'ex-3', source: S(3), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'انشر كل عبارة مما يلي وبسّطها:',
    items: ['$K = (3x + 2)(x + 5)$', '$L = (2x - 3)(3x - 1)$', '$M = (7 - x)(1 - 2x)$', '$P = (-x - 2)(x + 5)$'],
    interaction: 'batch',
    question: {
      prompt: 'اختر النشر المبسّط لكل عبارة.',
      rows: [
        { label: '$K = (3x + 2)(x + 5)$', options: ['$3x^2 + 17x + 10$', '$3x^2 + 10$', '$3x^2 + 15x + 10$'], correct: 0, correction: '$3x^2 + 15x + 2x + 10 = 3x^2 + 17x + 10$' },
        { label: '$L = (2x - 3)(3x - 1)$', options: ['$6x^2 + 3$', '$6x^2 - 11x + 3$', '$6x^2 - 11x - 3$'], correct: 1, correction: '$6x^2 - 2x - 9x + 3 = 6x^2 - 11x + 3$' },
        { label: '$M = (7 - x)(1 - 2x)$', options: ['$-2x^2 - 15x + 7$', '$2x^2 + 15x + 7$', '$2x^2 - 15x + 7$'], correct: 2, correction: '$7 - 14x - x + 2x^2 = 2x^2 - 15x + 7$' },
        { label: '$P = (-x - 2)(x + 5)$', options: ['$-x^2 - 7x - 10$', '$x^2 - 7x - 10$', '$-x^2 - 5x - 10$'], correct: 0, correction: '$-x^2 - 5x - 2x - 10 = -x^2 - 7x - 10$' },
      ],
      explain: '$(a + b)(c + d) = ac + ad + bc + bd$ : أربعة جداءات، كل منها بإشارته، ثم نجمع الحدود المتشابهة.',
    },
    method: 'نضرب كل حدّ من القوس الأول في كل حدّ من القوس الثاني، ثم نبسّط.',
    commonError: 'إهمال إشارة جداء حدّين سالبين: في $M$ لدينا $(-x) \\times (-2x) = +2x^2$ .',
  },
  {
    id: 'ex-4', source: S(4), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'قطعة قماش مستطيلة بعداها $\\dfrac{1}{2}x + 3$ و $4 + \\dfrac{1}{4}x$ (بالمتر)، ومساحتها $A = \\left(\\dfrac{1}{2}x + 3\\right)\\left(4 + \\dfrac{1}{4}x\\right)$ . 1) احسب $A$ من أجل $x = 4$ . 2) انشر $A$ وبسّطها. 3) احسب العبارة المنشورة من أجل $x = 4$ مرّة ثانية.',
    interaction: 'batch',
    question: {
      prompt: 'أجب عن الأسئلة الثلاثة بالترتيب.',
      rows: [
        { label: '1) قيمة $A$ من أجل $x = 4$', options: ['$25$', '$20$', '$9$'], correct: 0, correction: '$\\left(\\dfrac{1}{2} \\times 4 + 3\\right)\\left(4 + \\dfrac{1}{4} \\times 4\\right) = 5 \\times 5 = 25$' },
        { label: '2) النشر المبسّط للعبارة $A$', options: ['$\\dfrac{1}{8}x^2 + 12$', '$\\dfrac{1}{8}x^2 + \\dfrac{11}{4}x + 12$', '$\\dfrac{1}{2}x^2 + \\dfrac{11}{4}x + 12$'], correct: 1, correction: '$\\dfrac{1}{8}x^2 + 2x + \\dfrac{3}{4}x + 12 = \\dfrac{1}{8}x^2 + \\dfrac{11}{4}x + 12$' },
        { label: '3) قيمة العبارة المنشورة من أجل $x = 4$', options: ['$27$', '$23$', '$25$'], correct: 2, correction: '$\\dfrac{1}{8} \\times 16 + \\dfrac{11}{4} \\times 4 + 12 = 2 + 11 + 12 = 25$' },
      ],
      explain: '$\\dfrac{1}{2}x \\times \\dfrac{1}{4}x = \\dfrac{1}{8}x^2$ ، و $2x + \\dfrac{3}{4}x = \\dfrac{11}{4}x$ : والقيمة 25 نفسها في الشكلين.',
    },
    method: 'نحسب كل جداء بالكسور كما نحسب بالأعداد الطبيعية، ثم نجمع الحدود المتشابهة.',
    commonError: 'ضرب البسطين فقط: $\\dfrac{1}{2}x \\times \\dfrac{1}{4}x = \\dfrac{1}{8}x^2$ وليس $\\dfrac{1}{2}x^2$ .',
  },
  {
    id: 'ex-5', source: S(5), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'انشر كل عبارة مما يلي وبسّطها:',
    items: ['$B = \\left(3x + \\dfrac{1}{2}\\right)\\left(x + \\dfrac{1}{3}\\right)$', '$C = \\left(\\dfrac{2}{3}x - 1\\right)\\left(\\dfrac{3}{4}x - \\dfrac{1}{2}\\right)$'],
    interaction: 'batch',
    question: {
      prompt: 'اختر النشر المبسّط لكل عبارة.',
      rows: [
        { label: '$B = \\left(3x + \\dfrac{1}{2}\\right)\\left(x + \\dfrac{1}{3}\\right)$', options: ['$3x^2 + \\dfrac{1}{6}$', '$3x^2 + \\dfrac{3}{2}x + \\dfrac{5}{6}$', '$3x^2 + \\dfrac{3}{2}x + \\dfrac{1}{6}$'], correct: 2, correction: '$3x^2 + x + \\dfrac{1}{2}x + \\dfrac{1}{6} = 3x^2 + \\dfrac{3}{2}x + \\dfrac{1}{6}$' },
        { label: '$C = \\left(\\dfrac{2}{3}x - 1\\right)\\left(\\dfrac{3}{4}x - \\dfrac{1}{2}\\right)$', options: ['$\\dfrac{1}{2}x^2 - \\dfrac{13}{12}x + \\dfrac{1}{2}$', '$\\dfrac{1}{2}x^2 + \\dfrac{1}{2}$', '$\\dfrac{1}{2}x^2 - \\dfrac{5}{12}x + \\dfrac{1}{2}$'], correct: 0, correction: '$\\dfrac{1}{2}x^2 - \\dfrac{1}{3}x - \\dfrac{3}{4}x + \\dfrac{1}{2} = \\dfrac{1}{2}x^2 - \\dfrac{13}{12}x + \\dfrac{1}{2}$' },
      ],
      explain: 'أربعة جداءات في كل مرّة: $\\dfrac{2}{3}x \\times \\dfrac{3}{4}x = \\dfrac{1}{2}x^2$ ، $\\dfrac{2}{3}x \\times \\left(-\\dfrac{1}{2}\\right) = -\\dfrac{1}{3}x$ ، $(-1) \\times \\dfrac{3}{4}x = -\\dfrac{3}{4}x$ و $(-1) \\times \\left(-\\dfrac{1}{2}\\right) = \\dfrac{1}{2}$.',
    },
    commonError: 'جمع الثابتين بدل ضربهما: في $B$ الحدّ الثابت هو $\\dfrac{1}{2} \\times \\dfrac{1}{3} = \\dfrac{1}{6}$ وليس $\\dfrac{5}{6}$ .',
  },
  {
    id: 'ex-6', source: S(6), learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'نشر تلميذان وبسّطا العبارة $P = 2(x + 4) - (x + 1)(2x + 3)$ . كتب الأول: $P = 2x + 8 - 2x^2 + 3x + 2x + 3 = -2x^2 + 7x + 11$ . وكتب الثاني: $P = 2x + 8 - (2x^2 + 3x + 2x + 3) = 2x + 8 - 2x^2 - 3x - 2x - 3 = -2x^2 - 3x + 5$ . أيّ الإجابتين صحيحة؟',
    interaction: 'batch',
    question: {
      prompt: 'احكم على كل إجابة، ثم اختر النشر المبسّط للعبارة $P$ .',
      rows: [
        { label: 'إجابة التلميذ الأول', options: [OK, KO], correct: 1, correction: 'حذف الأقواس المسبوقة بـ $-$ وغيّر إشارة الحدّ الأول وحده.' },
        { label: 'إجابة التلميذ الثاني', options: [OK, KO], correct: 0, correction: 'حفظ القوسين ثم غيّر إشارة كل حدّ عند حذفهما: $-(2x^2 + 3x + 2x + 3) = -2x^2 - 3x - 2x - 3$' },
        { label: 'النشر المبسّط للعبارة $P$', options: ['$-2x^2 + 7x + 11$', '$-2x^2 - 3x + 5$', '$-2x^2 - 3x + 11$'], correct: 1, correction: '$2x + 8 - 2x^2 - 3x - 2x - 3 = -2x^2 - 3x + 5$' },
      ],
      explain: 'الجداء $(x + 1)(2x + 3)$ مسبوق بـ $-$ : نكتب نشره أولًا بين قوسين، ثم نحذف القوسين ونغيّر إشارة كل حدّ بداخلهما.',
    },
    method: 'نضع نشر الجداء المسبوق بـ $-$ بين قوسين قبل حذفهما.',
    commonError: 'حذف القوسين المسبوقين بـ $-$ مع تغيير إشارة الحدّ الأول وحده: $-(2x^2 + 3x + 2x + 3)$ يساوي $-2x^2 - 3x - 2x - 3$ .',
  },
  {
    id: 'ex-7', source: S(7), learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'انشر كل عبارة مما يلي وبسّطها:',
    items: ['$R = a + 5 - 3(a - 2)$', '$S = -(a + 3) - (3a - 2)(a - 1)$', '$T = (a + 2)\\left(a + \\dfrac{1}{2}\\right) - (a + 1)\\left(a + \\dfrac{1}{3}\\right)$'],
    interaction: 'batch',
    question: {
      prompt: 'اختر النشر المبسّط لكل عبارة.',
      rows: [
        { label: '$R = a + 5 - 3(a - 2)$', options: ['$-2a - 1$', '$-2a + 11$', '$4a - 1$'], correct: 1, correction: '$a + 5 - 3a + 6 = -2a + 11$' },
        { label: '$S = -(a + 3) - (3a - 2)(a - 1)$', options: ['$-3a^2 + 4a - 5$', '$-3a^2 - 6a - 1$', '$3a^2 + 4a - 5$'], correct: 0, correction: '$-a - 3 - (3a^2 - 3a - 2a + 2) = -a - 3 - 3a^2 + 5a - 2 = -3a^2 + 4a - 5$' },
        { label: '$T = (a + 2)\\left(a + \\dfrac{1}{2}\\right) - (a + 1)\\left(a + \\dfrac{1}{3}\\right)$', options: ['$2a^2 + \\dfrac{23}{6}a + \\dfrac{4}{3}$', '$\\dfrac{7}{6}a + \\dfrac{2}{3}$', '$\\dfrac{23}{6}a$'], correct: 1, correction: '$\\left(a^2 + \\dfrac{5}{2}a + 1\\right) - \\left(a^2 + \\dfrac{4}{3}a + \\dfrac{1}{3}\\right) = \\dfrac{7}{6}a + \\dfrac{2}{3}$' },
      ],
      explain: 'كل جداء مسبوق بـ $-$ نكتب نشره بين قوسين، ثم نحذفهما بتغيير الإشارات، ونجمع الحدود المتشابهة: في $T$ يتعادم $a^2$ و $-a^2$.',
    },
    method: 'ننشر كل جداء بين قوسين، ثم نحذف الأقواس، ثم نجمع الحدود المتشابهة.',
    commonError: 'في $R$ : $-3(a - 2) = -3a + 6$ وليس $-3a - 6$ ؛ الإشارة $-$ تُضرب في الحدّين.',
  },
  {
    id: 'ex-8', source: S(8), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'لنشر العبارة $A = -5(x + 1)(x + 2)$ وتبسيطها، بدأ تلميذان بطريقتين. الطريقة الأولى: $A = (-5x - 5)(x + 2)$ . الطريقة الثانية: $A = -5(x^2 + 2x + x + 2)$ . 1) اشرح كل بداية. 2) أكمل كل طريقة. ماذا تلاحظ؟',
    interaction: 'batch',
    question: {
      prompt: 'اشرح كل بداية، ثم أكملها.',
      rows: [
        { label: '1) ماذا حدث في الطريقة الأولى؟', options: ['ضُرب $-5$ في القوس الأول', 'نُشر جداء القوسين'], correct: 0, correction: '$-5(x + 1) = -5x - 5$' },
        { label: '1) ماذا حدث في الطريقة الثانية؟', options: ['ضُرب $-5$ في القوس الأول', 'نُشر جداء القوسين'], correct: 1, correction: '$(x + 1)(x + 2) = x^2 + 2x + x + 2$' },
        { label: '2) إكمال الطريقة الأولى: $(-5x - 5)(x + 2) = \\ldots$', options: ['$-5x^2 - 15x - 10$', '$-5x^2 - 5x - 10$', '$-5x^2 - 10$'], correct: 0, correction: '$-5x^2 - 10x - 5x - 10 = -5x^2 - 15x - 10$' },
        { label: '2) إكمال الطريقة الثانية: $-5(x^2 + 3x + 2) = \\ldots$', options: ['$-5x^2 + 3x + 2$', '$-5x^2 - 15x + 10$', '$-5x^2 - 15x - 10$'], correct: 2, correction: '$-5 \\times x^2 - 5 \\times 3x - 5 \\times 2 = -5x^2 - 15x - 10$' },
        { label: 'ماذا تلاحظ؟', options: ['النتيجتان مختلفتان: إحدى الطريقتين خاطئة', 'نحصل على النتيجة نفسها بالطريقتين'], correct: 1, correction: 'الطريقتان صحيحتان: يمكن البدء بأيّ جداء.' },
      ],
      explain: 'في الأولى وُزّع $-5$ على القوس الأول، وفي الثانية نُشر جداء القوسين أولًا: النتيجة واحدة، $-5x^2 - 15x - 10$.',
    },
    commonError: 'في الطريقة الثانية: $-5$ يُضرب في الحدود الثلاثة، لا في الأول وحده.',
  },
];

/** التدريب الأول (المهارة نفسها التي يغطّيها « دوري الآن 1 » ص 35) — جداءا قوسين بأعداد المنصّة. */
export const NOW_EXERCISE = {
  id: 'now-35-1', source: { ...src('now-35-1', 35, 'دوري الآن', 1), part: REWRITE }, learningPointId: LP.P3, difficulty: 'moyen',
  statement: 'انشر كل عبارة مما يلي وبسّطها:',
  items: ['$(2x + 3)(3x + 1)$', '$(5 - x)(4 - 3x)$'],
  interaction: 'batch',
  question: {
    prompt: 'اختر النشر المبسّط لكل عبارة.',
    rows: [
      { label: '$(2x + 3)(3x + 1)$', options: ['$6x^2 + 3$', '$6x^2 + 11x + 3$', '$6x^2 + 11x + 4$'], correct: 1, correction: '$6x^2 + 2x + 9x + 3 = 6x^2 + 11x + 3$' },
      { label: '$(5 - x)(4 - 3x)$', options: ['$3x^2 - 19x + 20$', '$3x^2 + 20$', '$-3x^2 - 19x + 20$'], correct: 0, correction: '$20 - 15x - 4x + 3x^2 = 3x^2 - 19x + 20$' },
    ],
    explain: 'في كل مرّة أربعة جداءات: الحدّان المتشابهان يُجمعان ($2x + 9x$ ، $-15x - 4x$) والحدّان الآخران يبقيان.',
  },
  method: 'ننشر كل جداء بالقاعدة $(a + b)(c + d) = ac + ad + bc + bd$، ثم نجمع الحدود المتشابهة.',
  commonError: 'نشر جداء القوسين بجداءين فقط: $(2x + 3)(3x + 1) = 6x^2 + 3$ ينسى $2x$ و $9x$ .',
};

export const EX = Object.fromEntries([...EXERCISES, NOW_EXERCISE].map((e) => [e.id, e]));
