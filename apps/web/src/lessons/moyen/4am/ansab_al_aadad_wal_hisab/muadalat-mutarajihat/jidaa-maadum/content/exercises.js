/**
 * Les exercices rattachés au درس 2 « معادلات جداء معدوم » (couverture : extraction.json → destinations), RÉÉCRITS en nombres de la plateforme
 * (rollout 2026-11-11, conseil du 2026-11-11, verdict X2 : « le manuel fixe les كفاءات, pas les énoncés » ; indépendance du manuel). Chaque exercice
 * garde son `id`, sa `source: src(…)` (marquée `part: REWRITE`) et son `learningPointId` : seuls les nombres et les mots changent. Un exercice à
 * plusieurs équations ou plusieurs questions est découpé en une entrée par question (la première porte l'énoncé ; `partsOf` donne aux autres leur
 * contexte — pas d'aller-retour).
 *
 * Un ensemble de solutions est un CHOIX : chaque distracteur est FAUX (il oublie une solution, ajoute un nombre qui n'annule aucun facteur, prend
 * l'opposé ou l'inverse) et vient d'une erreur réelle — la solution unique d'une équation qui en a deux, le signe du nombre dans la parenthèse, le
 * facteur constant pris pour une solution, la division par x qui fait perdre 0, la division b/a inversée. Les formes factorisées proposées sont,
 * sauf la bonne, des polynômes DIFFÉRENTS de l'expression. (Chaque affirmation est recalculée par content/mission.test.js.)
 */
import { src } from '../../_unit/unitMeta.js';
import { withContext } from '../../../../../../common/textbook/exerciseParts.js';

export const LP = {
  P1: '4am_jidaa-maadum_P1',
  P2: '4am_jidaa-maadum_P2',
  P3: '4am_jidaa-maadum_P3',
};

const REWRITE = 'بأعداد المنصّة';
const E = (n, page, part) => ({ ...src(`ex-${n}`, page, 'أوظّف تعلّماتي', n), part: part ? `${REWRITE} ${part}` : REWRITE });
const C = (prompt, options, correct, explain, cols = 2) => ({ prompt, options, correct, cols, explain });

/* ── Module 3 — دوري الآن 2 ─────────────────────────────────────────────── */
const NOW = (part) => ({ ...src('now-47-2', 47, 'دوري الآن', 2), part: `${REWRITE} ${part}` });
export const NOW_47_2 = [
  {
    id: 'now-47-2-a', source: NOW('1'), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'حل كلًّا من المعادلات الآتية: $3x(-x + 2) = 0$ ، $(2x - 5)^2 = 0$ ، $9x^2 - 4 = 0$ ، $5x^2 = 2x$ .',
    interaction: 'choice',
    question: C('حلول المعادلة $3x(-x + 2) = 0$ :', ['$0$ و $2$', '$2$ فقط', '$3$ و $2$', '$0$ و $-2$'], 0,
      '$3x = 0$ أو $-x + 2 = 0$ ، أي $x = 0$ أو $x = 2$ : العامل $3x$ ينعدم من أجل $x = 0$ .'),
    method: 'نكتب: أحد العاملين معدوم، ثم نحلّ كل معادلة من الدرجة الأولى.',
    commonError: 'نسيان أنّ العامل $3x$ نفسه ينعدم: $3x = 0$ يعني $x = 0$ .',
  },
  {
    id: 'now-47-2-b', source: NOW('2'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: C('حلول المعادلة $(2x - 5)^2 = 0$ :', ['$-\\dfrac{5}{2}$ و $\\dfrac{5}{2}$', '$\\dfrac{5}{2}$ فقط', '$5$ فقط', 'لا تقبل أي حل'], 1,
      '$(2x - 5)^2 = (2x - 5)(2x - 5)$ : العاملان متساويان، و $2x - 5 = 0$ يعني $x = \\dfrac{5}{2}$ — حلّ واحد.'),
    commonError: 'كتابة حلّين متعاكسين كما في $x^2 = a$ : هنا العاملان متساويان فلهما الصفر نفسه.',
  },
  {
    id: 'now-47-2-c', source: NOW('3'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'choice',
    question: C('حلول المعادلة $9x^2 - 4 = 0$ :', ['$\\dfrac{2}{3}$ فقط', '$-2$ و $2$', '$-\\dfrac{2}{3}$ و $\\dfrac{2}{3}$', '$\\dfrac{4}{9}$ فقط'], 2,
      '$9x^2 - 4 = (3x)^2 - 2^2 = (3x - 2)(3x + 2)$ ، و $(3x - 2)(3x + 2) = 0$ يعني $x = \\dfrac{2}{3}$ أو $x = -\\dfrac{2}{3}$ .'),
    method: 'نحلّل أولًا بالمتطابقة $a^2 - b^2 = (a - b)(a + b)$ ، ثم نطبّق خاصية الجداء المعدوم.',
    commonError: 'قلب حاصل القسمة: $3x = 2$ يعطي $x = \\dfrac{2}{3}$ لا $x = \\dfrac{3}{2}$ .',
  },
  {
    id: 'now-47-2-d', source: NOW('4'), learningPointId: LP.P3, difficulty: 'difficile',
    interaction: 'choice',
    question: C('حلول المعادلة $5x^2 = 2x$ :', ['$\\dfrac{2}{5}$ فقط', '$0$ و $\\dfrac{2}{5}$', '$0$ و $\\dfrac{5}{2}$', '$0$ و $-\\dfrac{2}{5}$'], 1,
      '$5x^2 = 2x$ يعني $5x^2 - 2x = 0$ أي $x(5x - 2) = 0$ ، إذن $x = 0$ أو $x = \\dfrac{2}{5}$ .'),
    method: 'ننقل كل الحدود إلى طرف واحد ليصير الطرف الآخر 0، ثم نستخرج العامل المشترك $x$ .',
    commonError: 'قسمة الطرفين على $x$ : نجد $5x = 2$ ونُضيّع الحل 0.',
  },
];

/* ── Module 4 — أوظّف تعلّماتي ──────────────────────────────────────────── */
const S14 = 'حل كل معادلة من المعادلات الآتية:';
const S18 = 'لتكن العبارة $q$ حيث $q = (4x^2 - 9) + 2x^2 + 7x - 15$ . 1) تحقّق أنّ: $(2x - 3)(x + 5) = 2x^2 + 7x - 15$ 2) حلّل العبارة $4x^2 - 9$ . 3) حلّل العبارة $q$ إلى جداء عاملين من الدرجة الأولى 4) حل المعادلة $q = 0$ .';
const S19 = '$p$ عبارة حيث: $p = (x^2 + 14x + 49) - (x^2 - 49)$ . 1) حلّل كل عبارة من العبارتين: $A = x^2 + 14x + 49$ و $B = x^2 - 49$ 2) حلّل العبارة $p$ إلى جداء عاملين من الدرجة الأولى. حل المعادلة $p = 0$ .';
const S20 = '1) تحقّق أنّ $(3x - 1)^2 - 25 = 9x^2 - 6x - 24$ . 2) استنتج تحليلًا للعبارة $A = 9x^2 - 6x - 24$ . 3) حل المعادلة $9x^2 - 6x - 24 = 0$ .';

export const EXERCISES = [
  {
    id: 'ex-14-1', source: E(14, 50, '1'), learningPointId: LP.P2, difficulty: 'facile', statement: S14,
    items: ['$9(x + 7) = 0$', '$(x + 8)(3 - x) = 0$', '$\\dfrac{3}{4}x(x - 9) = 0$', '$(7 - 2x)(3x - 9) = 0$'],
    interaction: 'choice',
    question: C('$9(x + 7) = 0$', ['$7$', '$-7$', '$-7$ و $9$', '$-9$ و $-7$'], 1,
      'بما أنّ $9 \\neq 0$ فإنّ $x + 7 = 0$ ، أي $x = -7$ : حلّ واحد.'),
    method: 'العامل الثابت 9 لا ينعدم: يكفي أن نحلّ $x + 7 = 0$ .',
    commonError: 'اعتبار العامل الثابت 9 حلًّا، أو أخذ العدد الذي في القوس بإشارته: $x = 7$ .',
  },
  {
    id: 'ex-14-2', source: E(14, 50, '2'), learningPointId: LP.P2, difficulty: 'facile',
    interaction: 'choice',
    question: C('$(x + 8)(3 - x) = 0$', ['$8$ و $-3$', '$-8$ فقط', '$-8$ و $3$', '$-8$ و $-3$'], 2,
      '$x + 8 = 0$ أو $3 - x = 0$ ، أي $x = -8$ أو $x = 3$ .'),
    commonError: 'الاكتفاء بحلّ واحد، أو كتابة $x = -3$ من $3 - x = 0$ .',
  },
  {
    id: 'ex-14-3', source: E(14, 50, '3'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: C('$\\dfrac{3}{4}x(x - 9) = 0$', ['$9$ فقط', '$\\dfrac{3}{4}$ و $9$', '$0$ و $-9$', '$0$ و $9$'], 3,
      '$\\dfrac{3}{4}x = 0$ أو $x - 9 = 0$ ، أي $x = 0$ أو $x = 9$ .'),
    commonError: 'نسيان الحل 0 الذي يعدم العامل $\\dfrac{3}{4}x$ .',
  },
  {
    id: 'ex-14-4', source: E(14, 50, '4'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: C('$(7 - 2x)(3x - 9) = 0$', ['$\\dfrac{7}{2}$ و $3$', '$\\dfrac{2}{7}$ و $\\dfrac{1}{3}$', '$-\\dfrac{7}{2}$ و $-3$', '$7$ و $9$'], 0,
      '$7 - 2x = 0$ يعني $-2x = -7$ أي $x = \\dfrac{7}{2}$ ؛ و $3x - 9 = 0$ يعني $x = 3$ .'),
    commonError: 'قلب حاصل القسمة: $-2x = -7$ يعطي $\\dfrac{-7}{-2} = \\dfrac{7}{2}$ لا $\\dfrac{2}{7}$ .',
  },
  {
    id: 'ex-15-1', source: E(15, 50, '1)'), learningPointId: LP.P3, difficulty: 'facile',
    statement: '1) حلّل إلى جداء عاملين العبارة $6x^2 - 9x$ . 2) حل المعادلة $6x^2 - 9x = 0$ .',
    interaction: 'choice',
    question: C('1) $6x^2 - 9x = $', ['$3x(2x - 3)$', '$3x(2x - 1)$', '$6x(x - 9)$', '$3x(x - 3)$'], 0,
      '$6x^2 - 9x = 3x \\times 2x - 3x \\times 3 = 3x(2x - 3)$'),
    method: 'العامل المشترك بين $6x^2$ و $9x$ هو $3x$ .',
    commonError: 'نسيان العدد 3 بعد استخراج $3x$ من $9x$ .',
  },
  {
    id: 'ex-15-2', source: E(15, 50, '2)'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'choice',
    question: C('2) حلول المعادلة $6x^2 - 9x = 0$ :', ['$\\dfrac{3}{2}$ فقط', '$0$ و $\\dfrac{3}{2}$', '$0$ و $\\dfrac{2}{3}$', '$-\\dfrac{3}{2}$ و $0$'], 1,
      '$3x(2x - 3) = 0$ يعني $3x = 0$ أو $2x - 3 = 0$ ، أي $x = 0$ أو $x = \\dfrac{3}{2}$ .'),
    commonError: 'قسمة الطرفين على $x$ فيضيع الحل 0.',
  },
  {
    id: 'ex-16-1', source: E(16, 50, '1)'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: '1) حلّل إلى جداء عاملين العبارة : $3(x - 7) + (x + 2)(x - 7)$ . 2) حل المعادلة $3(x - 7) + (x + 2)(x - 7) = 0$ .',
    interaction: 'choice',
    question: C('1) $3(x - 7) + (x + 2)(x - 7) = $', ['$3(x - 7)(x + 2)$', '$(x - 7)(x - 1)$', '$(x - 7)(x + 5)$', '$(x - 7)(x + 9)$'], 2,
      'العامل المشترك $(x - 7)$ : $(x - 7)[3 + (x + 2)] = (x - 7)(x + 5)$'),
    method: 'العامل المشترك هو القوس $(x - 7)$ كلّه؛ نجمع ما بقي: $3 + (x + 2)$ .',
    commonError: 'ضرب ما بقي بدل جمعه: $3(x - 7)(x + 2)$ .',
  },
  {
    id: 'ex-16-2', source: E(16, 50, '2)'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'choice',
    question: C('2) حلول المعادلة $3(x - 7) + (x + 2)(x - 7) = 0$ :', ['$-7$ و $5$', '$7$ فقط', '$7$ و $-5$', '$-7$ و $-5$'], 2,
      '$(x - 7)(x + 5) = 0$ يعني $x - 7 = 0$ أو $x + 5 = 0$ ، أي $x = 7$ أو $x = -5$ .'),
    commonError: 'أخذ إشارة العدد الذي في القوس: $x + 5 = 0$ يعني $x = -5$ لا $5$ .',
  },
  {
    id: 'ex-17-1', source: E(17, 50, '1)'), learningPointId: LP.P3, difficulty: 'facile',
    statement: '1) حلّل إلى جداء عاملين العبارة $x^2 - 64$ . 2) حل المعادلة $x^2 - 64 = 0$ .',
    interaction: 'choice',
    question: C('1) $x^2 - 64 = $', ['$(x - 8)^2$', '$(x - 8)(x + 8)$', '$(x - 64)(x + 64)$'], 1,
      '$x^2 - 64 = x^2 - 8^2 = (x - 8)(x + 8)$', 3),
    method: 'نتعرّف على الشكل $a^2 - b^2$ حيث $a = x$ و $b = 8$ .',
    commonError: 'كتابة $(x - 8)^2$ التي تساوي $x^2 - 16x + 64$ .',
  },
  {
    id: 'ex-17-2', source: E(17, 50, '2)'), learningPointId: LP.P3, difficulty: 'facile',
    interaction: 'choice',
    question: C('2) حلول المعادلة $x^2 - 64 = 0$ :', ['$8$ فقط', '$-64$ و $64$', '$-8$ و $8$'], 2,
      '$(x - 8)(x + 8) = 0$ يعني $x = 8$ أو $x = -8$ .', 3),
    commonError: 'الاكتفاء بالحل 8 ونسيان أنّ العامل $x + 8$ ينعدم أيضًا.',
  },
  {
    id: 'ex-18-1', source: E(18, 50, '1)'), learningPointId: LP.P3, difficulty: 'facile', statement: S18,
    interaction: 'trueFalse',
    question: {
      rows: [{ text: '$(2x - 3)(x + 5) = 2x^2 + 7x - 15$', answer: true, why: '$(2x - 3)(x + 5) = 2x^2 + 10x - 3x - 15 = 2x^2 + 7x - 15$' }],
    },
    method: 'ننشر الطرف الأول ونبسّط ثم نقارن.',
  },
  {
    id: 'ex-18-2', source: E(18, 50, '2)'), learningPointId: LP.P3, difficulty: 'facile',
    interaction: 'choice',
    question: C('2) $4x^2 - 9 = $', ['$(2x - 3)(2x + 3)$', '$(2x - 3)^2$', '$(4x - 9)(4x + 9)$'], 0,
      '$4x^2 - 9 = (2x)^2 - 3^2 = (2x - 3)(2x + 3)$', 3),
    commonError: 'أخذ $a = 4x$ بدل $a = 2x$ (لأنّ $(2x)^2 = 4x^2$).',
  },
  {
    id: 'ex-18-3', source: E(18, 50, '3)'), learningPointId: LP.P3, difficulty: 'difficile',
    interaction: 'choice',
    question: C('3) $q = (4x^2 - 9) + 2x^2 + 7x - 15 = $', ['$(2x - 3)(x - 2)$', '$(2x + 3)(3x + 8)$', '$(2x - 3)(3x + 8)$'], 2,
      '$q = (2x - 3)(2x + 3) + (2x - 3)(x + 5) = (2x - 3)[(2x + 3) + (x + 5)] = (2x - 3)(3x + 8)$', 1),
    method: 'نعوّض كل جزء بتحليله ليظهر العامل المشترك $(2x - 3)$ .',
    commonError: 'طرح ما بقي بدل جمعه: $(2x + 3) - (x + 5) = x - 2$ .',
  },
  {
    id: 'ex-18-4', source: E(18, 50, '4)'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'choice',
    question: C('4) حلول المعادلة $q = 0$ حيث $q = (2x - 3)(3x + 8)$ :', ['$-\\dfrac{3}{2}$ و $\\dfrac{8}{3}$', '$\\dfrac{3}{2}$ و $-\\dfrac{8}{3}$', '$\\dfrac{3}{2}$ فقط', '$\\dfrac{2}{3}$ و $-\\dfrac{3}{8}$'], 1,
      '$(2x - 3)(3x + 8) = 0$ يعني $x = \\dfrac{3}{2}$ أو $x = -\\dfrac{8}{3}$ .'),
    commonError: 'قلب حاصل القسمة: $3x = -8$ يعطي $-\\dfrac{8}{3}$ لا $-\\dfrac{3}{8}$ .',
  },
  {
    id: 'ex-19-1', source: E(19, 51, '1)'), learningPointId: LP.P3, difficulty: 'facile', statement: S19,
    interaction: 'batch',
    question: {
      prompt: '1) تحليل كل من A و B :',
      rows: [
        { label: '$A = x^2 + 14x + 49$', options: ['$(x + 7)^2$', '$(x - 7)(x + 7)$', '$(x + 49)^2$'], correct: 0, correction: '$x^2 + 2 \\times x \\times 7 + 7^2 = (x + 7)^2$' },
        { label: '$B = x^2 - 49$', options: ['$(x - 7)^2$', '$(x - 7)(x + 7)$', '$(x + 7)^2$'], correct: 1, correction: '$x^2 - 7^2 = (x - 7)(x + 7)$' },
      ],
    },
    method: 'نتعرّف على المتطابقة: مربع مجموع لـ A، وفرق مربّعين لـ B.',
  },
  {
    id: 'ex-19-2', source: E(19, 51, '2)'), learningPointId: LP.P3, difficulty: 'difficile',
    interaction: 'choice',
    question: C('2) $p = (x + 7)^2 - (x - 7)(x + 7) = $', ['$2x(x + 7)$', '$14(x + 7)$', '$-14(x + 7)$', '$(x + 7)(2x + 14)$'], 1,
      '$p = (x + 7)^2 - (x - 7)(x + 7) = (x + 7)[(x + 7) - (x - 7)] = 14(x + 7)$'),
    method: 'العامل المشترك $(x + 7)$ ، وما بقي $(x + 7) - (x - 7) = 14$ .',
    commonError: 'حذف القوس المسبوق بـ «−» دون تغيير إشارة $-7$ : نجد $2x$ بدل 14.',
  },
  {
    id: 'ex-19-3', source: E(19, 51, '3)'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: C('حلول المعادلة $p = 0$ حيث $p = 14(x + 7)$ :', ['$-7$ و $7$', '$-7$', '$-7$ و $14$', '$7$'], 1,
      '$14(x + 7) = 0$ وبما أنّ $14 \\neq 0$ فإنّ $x + 7 = 0$ ، أي $x = -7$ : حلّ واحد.'),
    commonError: 'اعتبار العامل الثابت 14 حلًّا، أو البحث عن حلّين لأنّ العبارة الأصلية فيها $x^2$ .',
  },
  {
    id: 'ex-20-1', source: E(20, 51, '1)'), learningPointId: LP.P3, difficulty: 'facile', statement: S20,
    interaction: 'trueFalse',
    question: {
      rows: [{ text: '$(3x - 1)^2 - 25 = 9x^2 - 6x - 24$', answer: true, why: '$(3x - 1)^2 - 25 = 9x^2 - 6x + 1 - 25 = 9x^2 - 6x - 24$' }],
    },
    method: 'ننشر المربّع بالمتطابقة $(a - b)^2 = a^2 - 2ab + b^2$ ثم نبسّط.',
  },
  {
    id: 'ex-20-2', source: E(20, 51, '2)'), learningPointId: LP.P3, difficulty: 'difficile',
    interaction: 'choice',
    question: C('2) $A = 9x^2 - 6x - 24 = $', ['$(3x - 5)(3x + 5)$', '$(3x - 6)(3x + 4)$', '$(3x - 1)^2$', '$(3x - 26)(3x + 24)$'], 1,
      '$A = (3x - 1)^2 - 5^2 = (3x - 1 - 5)(3x - 1 + 5) = (3x - 6)(3x + 4)$'),
    method: 'نقرأ $(3x - 1)^2 - 25$ على الشكل $a^2 - b^2$ حيث $a = 3x - 1$ و $b = 5$ .',
    commonError: 'أخذ $b = 25$ بدل $b = 5$ .',
  },
  {
    id: 'ex-20-3', source: E(20, 51, '3)'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'choice',
    question: C('3) حلول المعادلة $9x^2 - 6x - 24 = 0$ :', ['$6$ و $-4$', '$2$ فقط', '$-2$ و $\\dfrac{4}{3}$', '$2$ و $-\\dfrac{4}{3}$'], 3,
      '$(3x - 6)(3x + 4) = 0$ يعني $3x = 6$ أو $3x = -4$ ، أي $x = 2$ أو $x = -\\dfrac{4}{3}$ .'),
    commonError: 'أخذ العددين 6 و −4 الموجودين في القوسين حلّين دون القسمة على 3.',
  },
];

/** Toutes les parties d'un exercice (« 14 » → ex-14-1 … ex-14-4) ; chaque partie sans énoncé reçoit celui de la première (pas d'aller-retour). */
export const partsOf = (n) => withContext(EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`)));

/** Accès par id. */
export const EX = Object.fromEntries([...NOW_47_2, ...EXERCISES].map((ex) => [ex.id, ex]));
