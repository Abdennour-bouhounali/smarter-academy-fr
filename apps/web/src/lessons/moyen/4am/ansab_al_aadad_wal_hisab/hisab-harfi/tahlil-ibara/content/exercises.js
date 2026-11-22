/**
 * Les exercices du MANUEL rattachés au درس 3 « تحليل عبارة جبرية » (couverture :
 * extraction.json → destinations). Chaque énoncé est celui du livre, au mot
 * près ; un exercice à plusieurs expressions est découpé en une entrée par
 * expression (la première porte l'énoncé).
 *
 * Une forme factorisée est un CHOIX (`choice`) : les distracteurs sont FAUX
 * (aucun n'est égal à l'expression — vérifié par le calcul) et viennent
 * d'erreurs réelles : le « 1 » oublié après la mise en facteur, le signe
 * d'un terme précédé de « − », un facteur commun incomplet, (a − b)² au lieu
 * de (a − b)(a + b), le coefficient non élevé au carré.
 */
import { src } from '../../_unit/unitMeta.js';
import { withContext } from '../../../../../../common/textbook/exerciseParts.js';

export const LP = {
  P1: '4am_tahlil-ibara_P1',
  P2: '4am_tahlil-ibara_P2',
  P3: '4am_tahlil-ibara_P3',
};

const E = (n, page, part) => ({ ...src(`ex-${n}`, page, 'أوظّف تعلّماتي', n), ...(part ? { part } : {}) });
const C = (prompt, options, correct, explain, cols = 3) => ({ prompt, options, correct, cols, explain });

/* ── Module 3 — دوري الآن (p. 35 et 36) ──────────────────────────────────── */
export const NOW_35_2 = [
  {
    id: 'now-35-2-A', source: { ...src('now-35-2', 35, 'دوري الآن', 2), part: 'A' }, learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'حلّل كل عبارة مما يلي:',
    items: ['$A = (x - 1)(5x + 4) + (3 + x)(x - 1)$', '$B = (2x - 5)(x + 2) - (x - 2)(x + 2)$'],
    interaction: 'choice',
    question: C('$A = $', ['$(x - 1)(4x + 1)$', '$(x - 1)(6x + 7)$', '$(x - 1)(5x + 7)$'], 1,
      '$(x - 1)$ عامل مشترك: $A = (x - 1)[(5x + 4) + (3 + x)] = (x - 1)(6x + 7)$'),
    method: 'نحدّد العامل المشترك $(x - 1)$ ثم نجمع ما بقي من الحدين داخل قوس واحد.',
    commonError: 'نسيان أحد حدّي $(3 + x)$ عند جمع ما بقي: $(x - 1)(5x + 7)$.',
  },
  {
    id: 'now-35-2-B', source: { ...src('now-35-2', 35, 'دوري الآن', 2), part: 'B' }, learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'choice',
    question: C('$B = $', ['$(x + 2)(x - 3)$', '$(x + 2)(x - 7)$', '$(x + 2)(3x - 7)$'], 0,
      '$(x + 2)$ عامل مشترك: $B = (x + 2)[(2x - 5) - (x - 2)] = (x + 2)(2x - 5 - x + 2) = (x + 2)(x - 3)$'),
    commonError: 'نسيان تغيير إشارة $-2$ عند حذف القوس المسبوق بـ «−»: $(x + 2)(x - 7)$.',
  },
];

export const NOW_36_2 = [
  {
    id: 'now-36-2-E', source: { ...src('now-36-2', 36, 'دوري الآن', 2), part: 'E' }, learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'حلّل كل عبارة مما يلي:',
    items: ['$E = 144x^2 - 24x + 1$', '$F = (4x^2 - 1) + (12x^2 - 6x)$'],
    interaction: 'choice',
    question: C('$E = $', ['$(12x + 1)^2$', '$(72x - 1)^2$', '$(12x - 1)^2$'], 2,
      '$E = (12x)^2 - 2 \\times 12x \\times 1 + 1^2$ من الشكل $a^2 - 2ab + b^2$ ، إذن $E = (12x - 1)^2$'),
    method: 'نتعرّف على نوع المتطابقة ونعيّن الحدين $a$ و $b$.',
    commonError: 'أخذ $a = 72x$ (نصف 144) بدل $a = 12x$ (لأنّ $12^2 = 144$).',
  },
  {
    id: 'now-36-2-F', source: { ...src('now-36-2', 36, 'دوري الآن', 2), part: 'F' }, learningPointId: LP.P1, difficulty: 'difficile',
    interaction: 'choice',
    question: C('$F = $', ['$(2x - 1)(8x + 1)$', '$(2x - 1)(6x + 1)$', '$(2x - 1)(8x - 1)$'], 0,
      '$4x^2 - 1 = (2x - 1)(2x + 1)$ و $12x^2 - 6x = 6x(2x - 1)$ ، إذن $F = (2x - 1)[(2x + 1) + 6x] = (2x - 1)(8x + 1)$'),
    method: 'نحلّل كل قوس على حدة (متطابقة ثم عامل مشترك) ليظهر العامل المشترك $(2x - 1)$.',
    commonError: 'جمع الحدود قبل التحليل، فلا يظهر العامل المشترك $(2x - 1)$.',
  },
];

/* ── Module 4 — أوظّف تعلّماتي (pp. 38–39) ──────────────────────────────── */
const S20 = 'إليك العبارات: $A = x^2 - 5x$ ، $B = (x + 3)(1 - 2x) + 5(1 - 2x)$ ، $C = (1 + x)(x - 5) - (1 + 2x)(1 + x)$ . 1) بملاحظة أنّ $x^2 = x \\times x$ حلّل العبارة A الى جداء عاملين. 2) حدّد العامل المشترك بين $(x + 3)(1 - 2x)$ و $5(1 - 2x)$ ، ثمّ حلّل العبارة B الى جداء عوامل. 3) حلّل العبارة C الى جداء عوامل.';

export const EXERCISES = [
  {
    id: 'ex-20-1', source: E(20, 38, '1)'), learningPointId: LP.P2, difficulty: 'facile', statement: S20,
    interaction: 'choice',
    question: C('1) $A = x^2 - 5x = $', ['$x(x - 5)$', '$x(x^2 - 5)$', '$x(x + 5)$'], 0,
      '$x^2 - 5x = x \\times x - 5 \\times x = x(x - 5)$'),
    method: 'نكتب كل حدّ على شكل جداء يظهر فيه $x$، ثم نستخرجه.',
    commonError: 'ترك $x^2$ داخل القوس بعد استخراج $x$: $x(x^2 - 5) = x^3 - 5x$.',
  },
  {
    id: 'ex-20-2', source: E(20, 38, '2)'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'choice',
    question: C('2) $B = $', ['$(1 - 2x)(x + 8)$', '$(1 - 2x)(5x + 15)$', '$(1 - 2x)(x - 2)$'], 0,
      'العامل المشترك $(1 - 2x)$: $B = (1 - 2x)[(x + 3) + 5] = (1 - 2x)(x + 8)$'),
    commonError: 'ضرب ما بقي بدل جمعه: $(1 - 2x) \\times 5(x + 3)$.',
  },
  {
    id: 'ex-20-3', source: E(20, 38, '3)'), learningPointId: LP.P1, difficulty: 'difficile',
    interaction: 'choice',
    question: C('3) $C = $', ['$(1 + x)(3x - 4)$', '$(1 + x)(3x - 6)$', '$(1 + x)(-x - 6)$'], 2,
      'العامل المشترك $(1 + x)$: $C = (1 + x)[(x - 5) - (1 + 2x)] = (1 + x)(x - 5 - 1 - 2x) = (1 + x)(-x - 6)$'),
    commonError: 'حذف القوس المسبوق بـ «−» دون تغيير إشارة $2x$: $(1 + x)(3x - 6)$.',
  },
  {
    id: 'ex-21-1', source: E(21, 38, '1)'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'لتحليل العبارة $A = (x - 1)(x + 2) + x(x + 2) - (x + 2)$ إلى جداء عوامل كتب أحد التلاميذ: $A = (x - 1)(x + 2) + x(x + 2) - (x + 2) = (x + 2)(x - 1 + x) = (x + 2)(2x - 1)$ . 1) للمصادقة على ما عمله هذا التلميذ، احسب من أجل $x = 0$ قيمة A في العبارة المعطاة وقيمتها في النتيجة التي وجدها هذا التلميذ. ماذا تستنتج؟ 2) ابحث عن الخطإ المرتكب في عمل هذا التلميذ ثم اكتب التحليل الصحيح للعبارة A.',
    interaction: 'batch',
    question: {
      prompt: '1) من أجل $x = 0$ :',
      rows: [
        { label: 'قيمة A في العبارة المعطاة', options: ['$-4$', '$-2$', '$2$'], correct: 0, correction: '$(0 - 1)(0 + 2) + 0 \\times (0 + 2) - (0 + 2) = -2 + 0 - 2 = -4$' },
        { label: 'قيمتها في نتيجة التلميذ', options: ['$-4$', '$-2$', '$0$'], correct: 1, correction: '$(0 + 2)(2 \\times 0 - 1) = 2 \\times (-1) = -2$' },
        { label: 'نستنتج أنّ', options: ['تحليل التلميذ صحيح', 'تحليل التلميذ خاطئ'], correct: 1, correction: 'قيمتان مختلفتان من أجل $x = 0$ : العبارتان غير متساويتين، فالتحليل خاطئ.' },
      ],
      explain: 'يكفي مثال واحد بقيمتين مختلفتين لنعرف أنّ التحليل خاطئ.',
    },
    method: 'نعوّض $x$ بنفس القيمة في العبارة وفي تحليلها: إذا اختلفت القيمتان فالتحليل خاطئ.',
    commonError: 'الاكتفاء بالحساب دون استنتاج: قيمتان مختلفتان تعنيان أنّ العبارتين غير متساويتين.',
  },
  {
    id: 'ex-21-2', source: E(21, 38, '2)'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'choice',
    question: C('2) الخطأ والتحليل الصحيح:', [
      'لا خطأ في عمله، والتحليل الصحيح $A = (x + 2)(2x - 1)$',
      'نسي أنّ $-(x + 2) = (x + 2) \\times (-1)$ ، والتحليل الصحيح $A = (x + 2)(x - 1 + x - 1) = (x + 2)(2x - 2)$',
      'أخطأ في العامل المشترك، والتحليل الصحيح $A = (x - 1)(x + 2)(x + 1)$',
    ], 1,
      '$A = (x + 2)(x - 1) + (x + 2) \\times x + (x + 2) \\times (-1) = (x + 2)(x - 1 + x - 1) = (x + 2)(2x - 2) = 2(x + 2)(x - 1)$ ، وقيمته من أجل $x = 0$ هي $2 \\times (-2) = -4$.', 1),
    commonError: 'إهمال الحدّ $-(x + 2)$ عند استخراج العامل المشترك: هو $(x + 2) \\times (-1)$ ويترك $-1$ داخل القوس.',
  },
  {
    id: 'ex-22-C', source: E(22, 38, 'C'), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'حلّل كل عبارة مما يلي:',
    items: ['$C = 5x(2x + 1) + (2x + 1)$', '$D = (x + 7)(x - 3) - (x - 3)$', '$E = (x + 1)(x - 4) - x + 4$'],
    interaction: 'choice',
    question: C('$C = $', ['$5x(2x + 1)$', '$(2x + 1)(5x + 1)$', '$6x(2x + 1)$'], 1,
      '$(2x + 1) = (2x + 1) \\times 1$ ، إذن $C = (2x + 1)(5x + 1)$'),
    method: 'حدّ مثل $(2x + 1)$ وحده هو $(2x + 1) \\times 1$ : يبقى 1 داخل القوس.',
    commonError: 'نسيان الحد 1: $5x(2x + 1) + (2x + 1) = 5x(2x + 1)$ خطأ.',
  },
  {
    id: 'ex-22-D', source: E(22, 38, 'D'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: C('$D = $', ['$(x - 3)(x + 7)$', '$(x - 3)(x + 8)$', '$(x - 3)(x + 6)$'], 2,
      '$D = (x - 3)(x + 7) - (x - 3) \\times 1 = (x - 3)(x + 7 - 1) = (x - 3)(x + 6)$'),
    commonError: 'نسيان $-1$ : $(x - 3)(x + 7)$ ، أو تغيير الإشارة إلى $+1$.',
  },
  {
    id: 'ex-22-E', source: E(22, 38, 'E'), learningPointId: LP.P1, difficulty: 'difficile',
    interaction: 'choice',
    question: C('$E = $', ['$x(x - 4)$', '$(x - 4)(x + 2)$', '$(x + 1)(x - 5)$'], 0,
      '$-x + 4 = -(x - 4)$ ، إذن $E = (x - 4)(x + 1) - (x - 4) = (x - 4)(x + 1 - 1) = x(x - 4)$'),
    method: 'نكتب $-x + 4 = -(x - 4)$ ليظهر العامل المشترك.',
    commonError: 'قراءة $-x + 4$ على أنه $+(x - 4)$ : $(x - 4)(x + 2)$.',
  },
  {
    id: 'ex-23-A', source: E(23, 38, 'A'), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'حلّل كل عبارة مما يلي:',
    items: ['$A = 2x + 6$', '$B = 7x - 21$', '$C = x^2 - 3x$'],
    interaction: 'choice',
    question: C('$A = $', ['$2(x + 3)$', '$2(x + 6)$', '$2x(1 + 3)$'], 0, '$2x + 6 = 2 \\times x + 2 \\times 3 = 2(x + 3)$'),
    commonError: 'استخراج العامل من الحدّ الأول فقط: $2(x + 6) = 2x + 12$.',
  },
  {
    id: 'ex-23-B', source: E(23, 38, 'B'), learningPointId: LP.P2, difficulty: 'facile',
    interaction: 'choice',
    question: C('$B = $', ['$7(x + 3)$', '$7(x - 3)$', '$7(x - 21)$'], 1, '$7x - 21 = 7 \\times x - 7 \\times 3 = 7(x - 3)$'),
  },
  {
    id: 'ex-23-C', source: E(23, 38, 'C'), learningPointId: LP.P2, difficulty: 'facile',
    interaction: 'choice',
    question: C('$C = $', ['$x(x^2 - 3)$', '$3x(x - 1)$', '$x(x - 3)$'], 2, '$x^2 - 3x = x \\times x - 3 \\times x = x(x - 3)$'),
  },
  {
    id: 'ex-24-D', source: E(24, 38, 'D'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'حلّل كل عبارة مما يلي: (لاحظ وجود عامل مشترك).',
    items: ['$D = (x - \\sqrt{2})(4x + 3) - (x + 2)(x - \\sqrt{2})$', '$E = (2 - 5x)\\left(x - \\dfrac{2}{3}\\right) + (2 - 5x)\\left(x - \\dfrac{4}{3}\\right)$'],
    interaction: 'choice',
    question: C('$D = $', ['$(x - \\sqrt{2})(3x + 1)$', '$(x - \\sqrt{2})(5x + 5)$', '$(x - \\sqrt{2})(3x + 5)$'], 0,
      '$D = (x - \\sqrt{2})[(4x + 3) - (x + 2)] = (x - \\sqrt{2})(4x + 3 - x - 2) = (x - \\sqrt{2})(3x + 1)$'),
    commonError: 'حذف القوس المسبوق بـ «−» دون تغيير إشارة 2: $(x - \\sqrt{2})(3x + 5)$.',
  },
  {
    id: 'ex-24-E', source: E(24, 38, 'E'), learningPointId: LP.P1, difficulty: 'difficile',
    interaction: 'choice',
    question: C('$E = $', ['$(2 - 5x)\\left(2x + \\dfrac{2}{3}\\right)$', '$(2 - 5x)(2x - 2)$', '$(2 - 5x)\\left(x^2 - \\dfrac{8}{9}\\right)$'], 1,
      '$E = (2 - 5x)\\left[\\left(x - \\dfrac{2}{3}\\right) + \\left(x - \\dfrac{4}{3}\\right)\\right] = (2 - 5x)\\left(2x - \\dfrac{6}{3}\\right) = (2 - 5x)(2x - 2)$'),
    commonError: 'ضرب القوسين الباقيين بدل جمعهما.',
  },
  {
    id: 'ex-25-F', source: E(25, 38, 'F'), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'حلّل كل عبارة مما يلي:',
    items: ['$F = 2x\\left(\\dfrac{2}{7} - x\\right) + \\left(\\dfrac{2}{7} - x\\right)\\left(\\dfrac{5x - 4}{3}\\right)$', '$G = (1{,}2x - 3{,}5)(3{,}7 + x) - (0{,}2x - 6{,}5)(3{,}7 + x) + (3{,}7 + x)$'],
    interaction: 'choice',
    question: C('$F = $', ['$\\left(\\dfrac{2}{7} - x\\right)\\dfrac{7x - 4}{3}$', '$\\left(\\dfrac{2}{7} - x\\right)\\dfrac{11x - 4}{3}$', '$\\left(\\dfrac{2}{7} - x\\right)(7x - 4)$'], 1,
      '$F = \\left(\\dfrac{2}{7} - x\\right)\\left(2x + \\dfrac{5x - 4}{3}\\right) = \\left(\\dfrac{2}{7} - x\\right)\\dfrac{6x + 5x - 4}{3} = \\left(\\dfrac{2}{7} - x\\right)\\dfrac{11x - 4}{3}$', 1),
    method: 'نستخرج العامل المشترك $\\left(\\dfrac{2}{7} - x\\right)$ ثم نوحّد المقامات داخل القوس الثاني.',
    commonError: 'جمع $2x$ مع $\\dfrac{5x}{3}$ دون توحيد المقامين.',
  },
  {
    id: 'ex-25-G', source: E(25, 38, 'G'), learningPointId: LP.P1, difficulty: 'difficile',
    interaction: 'choice',
    question: C('$G = $', ['$(3{,}7 + x)(x + 4)$', '$(3{,}7 + x)(x + 3)$', '$(3{,}7 + x)(1{,}4x - 9)$'], 0,
      '$G = (3{,}7 + x)[(1{,}2x - 3{,}5) - (0{,}2x - 6{,}5) + 1] = (3{,}7 + x)(1{,}2x - 3{,}5 - 0{,}2x + 6{,}5 + 1) = (3{,}7 + x)(x + 4)$', 1),
    commonError: 'نسيان الحدّ 1 الذي يتركه $(3{,}7 + x)$ وحده: $(3{,}7 + x)(x + 3)$.',
  },
  ...[
    ['A', '$A = x^2 + 6x + 9$', ['$(x + 3)^2$', '$(x + 9)^2$', '$(x - 3)(x + 3)$'], 0, '$x^2 + 6x + 9 = x^2 + 2 \\times x \\times 3 + 3^2 = (x + 3)^2$'],
    ['B', '$B = 4x^2 + 20x + 25$', ['$(4x + 5)^2$', '$(2x + 5)^2$', '$(2x + 10)^2$'], 1, '$4x^2 + 20x + 25 = (2x)^2 + 2 \\times 2x \\times 5 + 5^2 = (2x + 5)^2$'],
    ['C', '$C = 9x^2 + 42x + 49$', ['$(3x + 7)^2$', '$(9x + 7)^2$', '$(3x + 14)^2$'], 0, '$9x^2 + 42x + 49 = (3x)^2 + 2 \\times 3x \\times 7 + 7^2 = (3x + 7)^2$'],
    ['D', '$D = 1 + 8x + 16x^2$', ['$(1 + 8x)^2$', '$(4 + x)^2$', '$(1 + 4x)^2$'], 2, '$1 + 8x + 16x^2 = 1^2 + 2 \\times 1 \\times 4x + (4x)^2 = (1 + 4x)^2$'],
  ].map(([k, tex, options, correct, explain], i) => ({
    id: `ex-26-${k}`, source: E(26, 39, k), learningPointId: LP.P3, difficulty: i < 2 ? 'facile' : 'moyen',
    ...(i === 0 ? {
      statement: 'تحليل عبارة باستعمال المتطابقة $a^2 + 2ab + b^2 = (a + b)^2$ . حلّل كل عبارة مما يلي: إرشاد: لتحليل العبارة A باستعمال المتطابقة $a^2 + 2ab + b^2 = (a + b)^2$ يمكن البدء بكتابة العبارة A على الشكل $a^2 + 2ab + b^2$ وتحديد كل من $a$ و $b$ ثمّ استعملها لتحليل العبارة A.',
      method: 'نكتب العبارة على الشكل $a^2 + 2ab + b^2$ ونعيّن $a$ و $b$.',
      commonError: 'نسيان تربيع المعامل: $4x^2 = (2x)^2$ وليس $(4x)^2$.',
    } : {}),
    interaction: 'choice', question: C(`${tex.replace(/\$$/, ' = $')}`, options, correct, explain),
  })),
  ...[
    ['A', '$A = x^2 - 10x + 25$', ['$(x + 5)^2$', '$(x - 5)^2$', '$(x - 5)(x + 5)$'], 1, '$x^2 - 10x + 25 = x^2 - 2 \\times x \\times 5 + 5^2 = (x - 5)^2$'],
    ['B', '$B = 9x^2 - 12x + 4$', ['$(3x - 2)^2$', '$(9x - 2)^2$', '$(3x + 2)^2$'], 0, '$9x^2 - 12x + 4 = (3x)^2 - 2 \\times 3x \\times 2 + 2^2 = (3x - 2)^2$'],
    ['C', '$C = 81x^2 - 18x + 1$', ['$(81x - 1)^2$', '$(9x - 9)^2$', '$(9x - 1)^2$'], 2, '$81x^2 - 18x + 1 = (9x)^2 - 2 \\times 9x \\times 1 + 1^2 = (9x - 1)^2$'],
    ['D', '$D = 9 - 6x + x^2$', ['$(3 - x)^2$', '$(3 + x)^2$', '$(9 - x)^2$'], 0, '$9 - 6x + x^2 = 3^2 - 2 \\times 3 \\times x + x^2 = (3 - x)^2$'],
  ].map(([k, tex, options, correct, explain], i) => ({
    id: `ex-27-${k}`, source: E(27, 39, k), learningPointId: LP.P3, difficulty: i < 2 ? 'facile' : 'moyen',
    ...(i === 0 ? {
      statement: 'تحليل عبارة باستعمال المتطابقة $a^2 - 2ab + b^2 = (a - b)^2$ . حلّل كل عبارة مما يلي: إرشاد: لتحليل العبارة A باستعمال المتطابقة $a^2 - 2ab + b^2 = (a - b)^2$ يمكن البدء بكتابة العبارة A على الشكل $a^2 - 2ab + b^2$ وتحديد كل من $a$ و $b$ ثمّ استعملها لتحليل العبارة A.',
      method: 'نكتب العبارة على الشكل $a^2 - 2ab + b^2$ ونعيّن $a$ و $b$.',
      commonError: 'الخلط بين $(a - b)^2$ و $(a - b)(a + b)$: الحدّ $-2ab$ يدلّ على مربع فرق.',
    } : {}),
    interaction: 'choice', question: C(`${tex.replace(/\$$/, ' = $')}`, options, correct, explain),
  })),
  ...[
    ['1', '$98^2 - 2^2$', 9600, '$98^2 - 2^2 = (98 - 2)(98 + 2) = 96 \\times 100 = 9600$'],
    ['2', '$408^2 - 407^2$', 815, '$408^2 - 407^2 = (408 - 407)(408 + 407) = 1 \\times 815 = 815$'],
    ['3', '$777^2 - 223^2$', 554000, '$777^2 - 223^2 = (777 - 223)(777 + 223) = 554 \\times 1000 = 554000$'],
  ].map(([k, tex, expected, explain], i) => ({
    id: `ex-28-b${k}`, source: E(28, 39, `ب) ${k}`), learningPointId: LP.P3, difficulty: 'moyen',
    ...(i === 0 ? {
      statement: 'احسب ذهنيا (دون وضع العملية) كل عدد مما يلي: ب) $98^2 - 2^2$ ، $408^2 - 407^2$ ، $777^2 - 223^2$ .',
      method: 'نحلّل $a^2 - b^2 = (a - b)(a + b)$ : أحد العاملين عدد «مستدير».',
      commonError: 'حساب المربعين ثم طرحهما: صحيح لكنه ليس حسابًا ذهنيًا.',
    } : {}),
    interaction: 'numeric', question: { prompt: `${tex} = `, expected, explain },
  })),
  {
    id: 'ex-29', source: E(29, 39), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'انقل المساويات الآتية وأتممها باستعمال المتطابقات الشهيرة: 1) $x^2 + 6x + \\ldots = (\\ldots + \\ldots)^2$ 2) $36x^2 - \\ldots + 1 = (\\ldots - \\ldots)^2$ 3) $\\ldots - \\ldots + 25 = (x - \\ldots)^2$ 4) $\\ldots - 81 = (x + \\ldots)(x - \\ldots)$',
    interaction: 'batch',
    question: {
      rows: [
        { label: '1)', options: ['$x^2 + 6x + 9 = (x + 3)^2$', '$x^2 + 6x + 36 = (x + 6)^2$', '$x^2 + 6x + 3 = (x + 3)^2$'], correct: 0, correction: '$2 \\times x \\times 3 = 6x$ و $3^2 = 9$' },
        { label: '2)', options: ['$36x^2 - 6x + 1 = (6x - 1)^2$', '$36x^2 - 12x + 1 = (6x - 1)^2$', '$36x^2 - 12x + 1 = (36x - 1)^2$'], correct: 1, correction: '$(6x)^2 = 36x^2$ و $2 \\times 6x \\times 1 = 12x$' },
        { label: '3)', options: ['$x^2 - 5x + 25 = (x - 5)^2$', '$x^2 - 25x + 25 = (x - 5)^2$', '$x^2 - 10x + 25 = (x - 5)^2$'], correct: 2, correction: '$5^2 = 25$ و $2 \\times x \\times 5 = 10x$' },
        { label: '4)', options: ['$x^2 - 81 = (x + 9)(x - 9)$', '$x^2 - 81 = (x + 81)(x - 81)$', '$x^2 - 81 = (x + 3)(x - 3)$'], correct: 0, correction: '$81 = 9^2$ ، إذن $x^2 - 81 = x^2 - 9^2 = (x + 9)(x - 9)$' },
      ],
    },
    method: 'نتعرّف على المتطابقة من الطرف المعطى، ثم نعيّن $a$ و $b$.',
    commonError: 'نسيان المعامل 2 في الحد المضاعف: $36x^2 - 6x + 1$.',
  },
  ...[
    ['A', '$A = 9x^2 + 24x + 16$', ['$(9x + 4)^2$', '$(3x + 4)^2$', '$(3x + 8)^2$'], 1, '$9x^2 + 24x + 16 = (3x)^2 + 2 \\times 3x \\times 4 + 4^2 = (3x + 4)^2$'],
    ['B', '$B = 121 - 22x + x^2$', ['$(11 - x)^2$', '$(11 + x)^2$', '$(121 - x)^2$'], 0, '$121 - 22x + x^2 = 11^2 - 2 \\times 11 \\times x + x^2 = (11 - x)^2$'],
  ].map(([k, tex, options, correct, explain], i) => ({
    id: `ex-30-${k}`, source: E(30, 39, k), learningPointId: LP.P3, difficulty: 'moyen',
    ...(i === 0 ? { statement: 'حلّل إلى جداء عوامل كل عبارة مما يلي:', commonError: 'أخذ $a = 9x$ بدل $a = 3x$ لأنّ $(3x)^2 = 9x^2$.' } : {}),
    interaction: 'choice', question: C(`${tex.replace(/\$$/, ' = $')}`, options, correct, explain),
  })),
  ...[
    ['R', '$R = \\dfrac{1}{9}x^2 + \\dfrac{1}{3}x + \\dfrac{1}{4}$', ['$\\left(\\dfrac{1}{3}x + \\dfrac{1}{4}\\right)^2$', '$\\left(\\dfrac{1}{3}x + \\dfrac{1}{2}\\right)^2$', '$\\left(\\dfrac{1}{9}x + \\dfrac{1}{2}\\right)^2$'], 1,
      '$\\dfrac{1}{9}x^2 = \\left(\\dfrac{1}{3}x\\right)^2$ ، $\\dfrac{1}{4} = \\left(\\dfrac{1}{2}\\right)^2$ و $2 \\times \\dfrac{1}{3}x \\times \\dfrac{1}{2} = \\dfrac{1}{3}x$ ، إذن $R = \\left(\\dfrac{1}{3}x + \\dfrac{1}{2}\\right)^2$'],
    ['S', '$S = \\dfrac{25}{9}x^2 - \\dfrac{5}{2}x + \\dfrac{9}{16}$', ['$\\left(\\dfrac{5}{3}x + \\dfrac{3}{4}\\right)^2$', '$\\left(\\dfrac{5}{3}x - \\dfrac{9}{16}\\right)^2$', '$\\left(\\dfrac{5}{3}x - \\dfrac{3}{4}\\right)^2$'], 2,
      '$\\dfrac{25}{9}x^2 = \\left(\\dfrac{5}{3}x\\right)^2$ ، $\\dfrac{9}{16} = \\left(\\dfrac{3}{4}\\right)^2$ و $2 \\times \\dfrac{5}{3}x \\times \\dfrac{3}{4} = \\dfrac{5}{2}x$ ، إذن $S = \\left(\\dfrac{5}{3}x - \\dfrac{3}{4}\\right)^2$'],
  ].map(([k, tex, options, correct, explain], i) => ({
    id: `ex-31-${k}`, source: E(31, 39, k), learningPointId: LP.P3, difficulty: 'difficile',
    ...(i === 0 ? { statement: 'حلّل إلى جداء عوامل كل عبارة مما يلي:', commonError: 'أخذ $b = \\dfrac{1}{4}$ نفسه بدل جذره $\\dfrac{1}{2}$.' } : {}),
    interaction: 'choice', question: C(`${tex.replace(/\$$/, ' = $')}`, options, correct, explain, 1),
  })),
  ...[
    ['A', '$A = (3 - 2x)^2 - 9$', ['$-2x(6 - 2x)$', '$(-6 - 2x)(12 - 2x)$', '$(-2x)^2$'], 0,
      '$A = (3 - 2x)^2 - 3^2 = [(3 - 2x) - 3][(3 - 2x) + 3] = -2x(6 - 2x)$'],
    ['B', '$B = \\dfrac{1}{4} - \\left(x + \\dfrac{3}{2}\\right)^2$', ['$(2 - x)(x + 2)$', '$(-x - 1)(x + 2)$', '$\\left(\\dfrac{1}{4} - x - \\dfrac{3}{2}\\right)\\left(\\dfrac{1}{4} + x + \\dfrac{3}{2}\\right)$'], 1,
      '$B = \\left(\\dfrac{1}{2}\\right)^2 - \\left(x + \\dfrac{3}{2}\\right)^2 = \\left(\\dfrac{1}{2} - x - \\dfrac{3}{2}\\right)\\left(\\dfrac{1}{2} + x + \\dfrac{3}{2}\\right) = (-x - 1)(x + 2)$'],
    ['C', '$C = (x + 2)^2 - (3x - 1)^2$', ['$(-2x + 1)(4x + 1)$', '$(x + 2 - 3x - 1)^2$', '$(-2x + 3)(4x + 1)$'], 2,
      '$C = [(x + 2) - (3x - 1)][(x + 2) + (3x - 1)] = (x + 2 - 3x + 1)(4x + 1) = (-2x + 3)(4x + 1)$'],
  ].map(([k, tex, options, correct, explain], i) => ({
    id: `ex-32-${k}`, source: E(32, 39, k), learningPointId: LP.P3, difficulty: 'difficile',
    ...(i === 0 ? {
      statement: 'تحليل عبارة باستعمال المتطابقة $a^2 - b^2 = (a + b)(a - b)$ . حلّل كل عبارة مما يلي: إرشاد: لتحليل عبارة A باستعمال المتطابقة $a^2 - b^2 = (a + b)(a - b)$ يمكن البدء بكتابة العبارة A على الشّكل $a^2 - b^2$ وتحديد كلا من $a$ و $b$ ثمّ استعملها لتحليل العبارة A.',
      method: 'نكتب العبارة على الشكل $a^2 - b^2$ ، ونضع $a$ و $b$ بين قوسين قبل الطرح.',
      commonError: 'نسيان القوسين حول $b$ : $(x + 2) - 3x - 1$ بدل $(x + 2) - (3x - 1)$.',
    } : {}),
    interaction: 'choice', question: C(`${tex.replace(/\$$/, ' = $')}`, options, correct, explain, 1),
  })),
  {
    id: 'ex-33-1A', source: E(33, 39, '1) A'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: '1) حلّل كل عبارة مما يلي: $A = (2 - x)^2 - 4x^2$ و $B = (2x + 3)^2 - (x + 1)^2$ . 2) انشر كلا من العبارتين A و B وبسّطهما ثمّ احسب كلا من $A + B$ و $A - B$ .',
    interaction: 'choice',
    question: C('1) $A = $', ['$(2 - 3x)(2 + x)$', '$(2 - 5x)(2 + 3x)$', '$(2 - 3x)^2$'], 0,
      '$4x^2 = (2x)^2$ ، إذن $A = [(2 - x) - 2x][(2 - x) + 2x] = (2 - 3x)(2 + x)$'),
    commonError: 'أخذ $b = 4x$ بدل $b = 2x$.',
  },
  {
    id: 'ex-33-1B', source: E(33, 39, '1) B'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'choice',
    question: C('1) $B = $', ['$(x + 4)(3x + 4)$', '$(x + 2)(3x + 4)$', '$(x + 2)^2$'], 1,
      '$B = [(2x + 3) - (x + 1)][(2x + 3) + (x + 1)] = (x + 2)(3x + 4)$'),
  },
  {
    id: 'ex-33-2', source: E(33, 39, '2)'), learningPointId: LP.P1, difficulty: 'difficile',
    interaction: 'batch',
    question: {
      prompt: '2) بعد النشر: $A = -3x^2 - 4x + 4$ و $B = 3x^2 + 10x + 8$ .',
      rows: [
        { label: '$A + B = $', options: ['$6x^2 + 6x + 12$', '$6x + 12$', '$-6x + 12$'], correct: 1, correction: '$(-3x^2 + 3x^2) + (-4x + 10x) + (4 + 8) = 6x + 12$' },
        { label: '$A - B = $', options: ['$-6x^2 - 14x - 4$', '$-6x^2 + 6x + 12$', '$6x^2 + 14x + 4$'], correct: 0, correction: '$-3x^2 - 4x + 4 - 3x^2 - 10x - 8 = -6x^2 - 14x - 4$' },
      ],
      explain: 'الشكل المنشور مناسب للجمع والطرح، والشكل المحلّل مناسب لكتابة جداء.',
    },
    commonError: 'حذف القوس في $A - B$ دون تغيير إشارات حدود B.',
  },
];

/** Les entrées d'un exercice du manuel (module 4), par numéro : « 20 », « 26 »… */
// lecteur : les parties sans énoncé portent celui de la partie 1 (« pas d'aller-retour », common/textbook/exerciseParts.js)
export const partsOf = (n) => withContext(EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`)));

/** Accès par id. */
export const EX = Object.fromEntries([...NOW_35_2, ...NOW_36_2, ...EXERCISES].map((ex) => [ex.id, ex]));
