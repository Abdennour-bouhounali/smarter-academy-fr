/**
 * Les exercices de « أوظّف تعلّماتي » du درس 3 « تعيين دالة تآلفية انطلاقًا من عددين وصورتيهما ».
 * Le manuel fourni (pp. 77–79) n'a AUCUN exercice : chacun est un ajout DÉCLARÉ de la plateforme
 * (`addition('interaction_generation')`), dans la forme des exercices du manuel, sur d'autres nombres que
 * la leçon (a négatif, a fractionnaire, couples en tableau, en description graphique, en histoire, la
 * méthode de la جملة). Un exercice à plusieurs parties est découpé en une entrée par partie (la première
 * porte l'énoncé). Tous les distracteurs sont faux (vérifiés par le calcul, voir les explications).
 */
import { addition } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_tanasub-taghayyurat_P1',
  P2: '4am_tanasub-taghayyurat_P2',
};

const PLATFORM = (n, part) => ({ ...addition('interaction_generation'), number: n, ...(part ? { part } : {}) });
const near = (v) => (n) => Number.isFinite(n) && Math.abs(n - v) < 1e-9;

export const EXERCISES = [
  // 1 — deux couples dans un tableau, a négatif
  {
    id: 'p1-a', source: PLATFORM(1, 'أ'), learningPointId: LP.P1, difficulty: 'facile',
    statement: '$g$ دالة تآلفية. الجدول الآتي يعطي صورتي عددين:',
    items: ['$\\begin{array}{|c|c|c|} \\hline x & -2 & 4 \\\\ \\hline g(x) & 11 & -1 \\\\ \\hline \\end{array}$'],
    interaction: 'numeric',
    question: {
      prompt: 'أ) احسب المعامل $a$ :',
      expected: near(-2),
      display: '-2',
      explain: '$a = \\dfrac{g(4) - g(-2)}{4 - (-2)} = \\dfrac{-1 - 11}{6} = \\dfrac{-12}{6} = -2$ : الصورة تنقص لمّا يزيد العدد، فالمعامل سالب.',
      explainFor: (n) => (near(2)(n) ? 'عكستَ ترتيب الطرح في المقام وحده: $\\dfrac{-1 - 11}{-2 - 4} = 2$ خطأ في الإشارة.' : near(-12)(n) ? '$-12$ هو فرق الصورتين فقط: نقسمه على فرق العددين $6$ .' : null),
    },
    method: 'نقسم فرق الصورتين على فرق العددين، بالترتيب نفسه.',
    commonError: 'عكس ترتيب الطرح في المقام وحده يغيّر إشارة $a$ .',
  },
  {
    id: 'p1-b', source: PLATFORM(1, 'ب'), learningPointId: LP.P2, difficulty: 'facile',
    statement: '',
    interaction: 'numeric',
    question: {
      prompt: 'ب) احسب $b$ ، الترتيب عند المبدأ:',
      expected: near(7),
      display: '7',
      explain: '$b = g(-2) - a \\times (-2) = 11 - (-2) \\times (-2) = 11 - 4 = 7$ ؛ تحقّق: $g(4) = -8 + 7 = -1$ .',
      explainFor: (n) => (near(15)(n) ? 'انتبه للإشارات: $a \\times (-2) = (-2) \\times (-2) = 4$ ، و $11 - 4 = 7$ .' : null),
    },
  },
  // 2 — a fractionnaire
  {
    id: 'p2-a', source: PLATFORM(2, 'أ'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: '$h$ دالة تآلفية حيث $h(1) = 2$ و $h(4) = 4$ . اكتب النتائج على شكل كسر غير قابل للاختزال.',
    interaction: 'fraction',
    question: {
      prompt: 'أ) المعامل $a$ :',
      expected: '2/3',
      explain: '$a = \\dfrac{h(4) - h(1)}{4 - 1} = \\dfrac{4 - 2}{3} = \\dfrac{2}{3}$ : المعامل ليس عددًا صحيحًا بالضرورة.',
    },
  },
  {
    id: 'p2-b', source: PLATFORM(2, 'ب'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: '',
    interaction: 'fraction',
    question: {
      prompt: 'ب) العدد $b$ :',
      expected: '4/3',
      explain: '$b = h(1) - \\dfrac{2}{3} \\times 1 = 2 - \\dfrac{2}{3} = \\dfrac{4}{3}$ ؛ تحقّق: $h(4) = \\dfrac{8}{3} + \\dfrac{4}{3} = \\dfrac{12}{3} = 4$ .',
    },
  },
  // 3 — un graphique décrit
  {
    id: 'p3', source: PLATFORM(3), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'المستقيم الذي يمثّل دالة تآلفية $k$ يمرّ بالنقطتين $A(-1 ; 5)$ و $B(3 ; -3)$ ، أي $k(-1) = 5$ و $k(3) = -3$ .',
    interaction: 'pair',
    question: {
      prompt: 'عيّن المعاملين $a$ و $b$ :',
      expected: { x: '-2', y: '3' },
      names: ['a', 'b'],
      explain: '$a = \\dfrac{-3 - 5}{3 - (-1)} = \\dfrac{-8}{4} = -2$ ، ثم $b = k(-1) - a \\times (-1) = 5 - 2 = 3$ : $k(x) = -2x + 3$ ؛ تحقّق: $k(3) = -6 + 3 = -3$ .',
    },
    commonError: 'قراءة $b$ على إحدى النقطتين: $b$ ترتيب نقطة المستقيم التي فاصلتها 0 .',
  },
  // 4 — la méthode de la جملة
  {
    id: 'p4', source: PLATFORM(4), learningPointId: LP.P2, difficulty: 'moyen',
    statement: '$f$ دالة تآلفية حيث $f(2) = 1$ و $f(5) = 13$ . اكتب الجملة $\\begin{cases} 2a + b = 1 \\\\ 5a + b = 13 \\end{cases}$ وحلّها.',
    interaction: 'pair',
    question: {
      prompt: 'حلّ الجملة:',
      expected: { x: '4', y: '-7' },
      names: ['a', 'b'],
      explain: 'بطرح المعادلة الأولى من الثانية: $3a = 12$ ، أي $a = 4$ ، ثم $b = 1 - 2 \\times 4 = -7$ : $f(x) = 4x - 7$ ؛ تحقّق: $f(5) = 20 - 7 = 13$ .',
    },
  },
  // 5 — une histoire (transfert) : un taxi-application
  {
    id: 'p5-a', source: PLATFORM(5, 'أ'), learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'في تطبيق لسيارات الأجرة يلتزم سائقوه بالأمانة في الأجرة، كلّفت رحلة طولها 6km مبلغ 340DA ، وكلّفت رحلة طولها 10km مبلغ 500DA . ثمن الرحلة دالة تآلفية $f$ لطولها $x$ بالكيلومتر.',
    interaction: 'choice',
    question: {
      prompt: 'أ) عبارة $f(x)$ هي:',
      options: ['$f(x) = 40x + 100$', '$f(x) = 160x + 340$', '$f(x) = 40x + 340$', '$f(x) = \\dfrac{170}{3}x$'],
      correct: 0,
      cols: 2,
      explain: '$a = \\dfrac{500 - 340}{10 - 6} = \\dfrac{160}{4} = 40$ DA للكيلومتر، و $b = 340 - 40 \\times 6 = 100$ DA ثمن الانطلاق. $160x + 340$ تأخذ فرق الصورتين معاملًا، و $40x + 340$ تأخذ $f(6)$ مكان $b$ ، و $\\dfrac{170}{3}x$ دالة خطية تعطي $\\dfrac{1700}{3} \\neq 500$ من أجل 10km .',
    },
    commonError: 'اعتبار الثمن متناسبًا مع الطول: في الرحلة ثمن انطلاق ثابت $b = 100$ DA .',
  },
  {
    id: 'p5-b', source: PLATFORM(5, 'ب'), learningPointId: LP.P2, difficulty: 'difficile',
    statement: '',
    interaction: 'numeric',
    question: {
      prompt: 'ب) ثمن رحلة طولها 15km (بالدينار):',
      expected: near(700),
      display: '700',
      explain: '$f(15) = 40 \\times 15 + 100 = 600 + 100 = 700$ DA.',
      explainFor: (n) => (near(600)(n) ? 'نسيتَ ثمن الانطلاق $b = 100$ DA.' : null),
    },
  },
  // 6 — vrai / faux sur la propriété
  {
    id: 'p6', source: PLATFORM(6), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'أصحيح أم خاطئ؟',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: 'إذا كان $f(x) = -3x + 7$ فإنّ $\\dfrac{f(8) - f(2)}{8 - 2} = -3$ .', answer: true, why: '$\\dfrac{-17 - 1}{6} = \\dfrac{-18}{6} = -3$ : الحاصل هو المعامل.' },
        { text: 'إذا كان $f(3) = 10$ و $f(5) = 16$ لدالة تآلفية $f$ فإنّ $a = 16 - 10 = 6$ .', answer: false, why: '$a = \\dfrac{16 - 10}{5 - 3} = \\dfrac{6}{2} = 3$ .' },
        { text: 'الحاصل $\\dfrac{f(x_1) - f(x_2)}{x_1 - x_2}$ لدالة تآلفية يتغيّر حين نغيّر العددين $x_1$ و $x_2$ .', answer: false, why: 'هو نفسه من أجل كل عددين متمايزين: $f(x_1) - f(x_2) = a(x_1 - x_2)$ .' },
      ],
    },
  },
];

/** Les parties d'un exercice, par numéro (pour une étape du module). */
export const partsOf = (n) => EXERCISES.filter((ex) => ex.source.number === n);
