/**
 * « أوظّف تعلّماتي » du درس 1 « مفهوم وتعيين دالة تآلفية » — AJOUTS DE LA PLATEFORME : le manuel fourni
 * (pp. 77–79) n'a aucun exercice pour cette unité (extraction › discrepancies › scope). Chaque entrée est
 * déclarée `addition('interaction_generation')` ; un exercice à plusieurs parties est découpé en une entrée
 * par partie (la première porte l'énoncé). Tous les distracteurs sont faux (vérifiés par le calcul,
 * commentés). TRANSFERT : un forfait de téléphone (un nouveau contexte), puis la règle nue.
 */
import { addition } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_mafhum-taalufiya_P1',
  P2: '4am_mafhum-taalufiya_P2',
  P3: '4am_mafhum-taalufiya_P3',
  P4: '4am_mafhum-taalufiya_P4',
};

const ADD = addition('interaction_generation');
const near = (v) => (n) => Number.isFinite(n) && Math.abs(n - v) < 1e-9;

export const EXERCISES = [
  // 1 — le forfait de téléphone : 500DA + 50DA par Go supplémentaire
  {
    id: 'w1-a', group: 'w1', source: ADD, learningPointId: LP.P1, difficulty: 'facile',
    statement: 'يقترح متعامل للهاتف النقال على التلاميذ، تيسيرًا لطلب العلم على الشبكة، صيغة: 500DA في الشهر، يضاف إليها 50DA عن كل جيغا (Go) إضافية. نسمّي $x$ عدد الجيغات الإضافية و $f(x)$ المبلغ الشهري.',
    interaction: 'choice',
    question: {
      prompt: 'عبارة $f(x)$ بدلالة $x$ هي:',
      // 550x : 500 + 50 compté à chaque Go (MISC-TARRID-JUZ-THABIT) ; 500x + 50 : a et b inversés ; 50x : b oublié
      options: ['$f(x) = 50x + 500$', '$f(x) = 550x$', '$f(x) = 500x + 50$', '$f(x) = 50x$'],
      correct: 0,
      cols: 2,
      explain: 'المبلغ الثابت 500 يُدفع مرة واحدة ($b = 500$) و 50 عن كل جيغا ($a = 50$) : $f(x) = 50x + 500$ ، دالة تآلفية.',
    },
    method: 'الجزء الذي يُدفع مرة واحدة هو $b$ ، والمبلغ عن كل وحدة هو $a$ .',
    commonError: 'ضرب المبلغ الثابت في عدد الجيغات: $550x$ ، كأنّ 500 تُدفع عن كل جيغا.',
  },
  {
    id: 'w1-b', group: 'w1', source: ADD, learningPointId: LP.P2, difficulty: 'facile',
    interaction: 'numeric',
    question: {
      prompt: 'المبلغ الشهري لتلميذ استهلك 6 جيغات إضافية: $f(6) =$',
      expected: near(800),
      display: '800',
      explain: '$f(6) = 50 \\times 6 + 500 = 300 + 500 = 800$ : 800DA.',
    },
    commonError: 'نسيان الحدّ الثابت: $50 \\times 6 = 300$ ليس المبلغ كله.',
  },
  {
    id: 'w1-c', group: 'w1', source: ADD, learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'numeric',
    question: {
      prompt: 'دفع تلميذ 1100DA. عدد الجيغات الإضافية التي استهلكها هو:',
      expected: near(12),
      display: '12',
      explain: '$50x + 500 = 1100$ ، إذن $50x = 600$ ، ومنه $x = 600 \\div 50 = 12$.',
    },
    method: 'نحلّ $ax + b = m$ : نطرح $b$ ثم نقسم على $a$ .',
    commonError: 'القسمة دون طرح المبلغ الثابت: $1100 \\div 50 = 22$ جيغا.',
  },
  // 2 — des images avec signes et fractions : f(x) = −3x + 4
  {
    id: 'w2-a', group: 'w2', source: ADD, learningPointId: LP.P2, difficulty: 'moyen',
    statement: '$f$ هي الدالة التآلفية حيث $f(x) = -3x + 4$ .',
    interaction: 'numeric',
    question: {
      prompt: '$f(-2) =$',
      expected: near(10),
      display: '10',
      explain: '$f(-2) = -3 \\times (-2) + 4 = 6 + 4 = 10$ (ناقص في ناقص يعطي موجبًا).',
    },
    commonError: 'خطأ في الإشارة: $-3 \\times (-2) = 6$ وليس $-6$ ، فالنتيجة 10 لا $-2$ .',
  },
  {
    id: 'w2-b', group: 'w2', source: ADD, learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'numeric',
    question: {
      prompt: '$f\\left(\\dfrac{1}{3}\\right) =$',
      expected: near(3),
      display: '3',
      explain: '$f\\left(\\dfrac{1}{3}\\right) = -3 \\times \\dfrac{1}{3} + 4 = -1 + 4 = 3$.',
    },
  },
  // 3 — l'antécédent : g(x) = 4x − 9
  {
    id: 'w3', group: 'w3', source: ADD, learningPointId: LP.P3, difficulty: 'moyen',
    statement: '$g$ هي الدالة التآلفية حيث $g(x) = 4x - 9$ . عيّن العدد الذي صورته 7.',
    interaction: 'numeric',
    question: {
      prompt: 'العدد $x$ حيث $g(x) = 7$ :',
      expected: near(4),
      display: '4',
      explain: '$4x - 9 = 7$ ، إذن $4x = 7 + 9 = 16$ ، ومنه $x = 16 \\div 4 = 4$. للتحقق: $4 \\times 4 - 9 = 7$.',
    },
    method: 'البرنامج العكسي لـ «اضرب في 4، اطرح 9» هو «أضف 9، ثم اقسم على 4».',
    commonError: 'عكس ترتيب العمليتين: $7 \\div 4 + 9 = 10{,}75$ ، و $g(10{,}75) = 34 \\neq 7$.',
  },
  // 4 — تآلفية، خطية، ثابتة
  {
    id: 'w4', group: 'w4', source: ADD, learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'صنّف كل دالة: خطية، ثابتة، تآلفية ليست خطية ولا ثابتة، أو ليست تآلفية.',
    interaction: 'batch',
    question: {
      prompt: 'لكل دالة:',
      rows: [
        { label: '$x \\longmapsto 7$', options: ['خطية', 'ثابتة', 'تآلفية فقط', 'ليست تآلفية'], correct: 1, correction: '$7 = 0 \\times x + 7$ : $a = 0$ ، صورة كل عدد هي 7 — دالة ثابتة (وهي تآلفية).' },
        { label: '$x \\longmapsto -4x$', options: ['خطية', 'ثابتة', 'تآلفية فقط', 'ليست تآلفية'], correct: 0, correction: '$-4x = -4x + 0$ : $b = 0$ — دالة خطية (وهي تآلفية).' },
        { label: '$x \\longmapsto 3 - \\dfrac{x}{4}$', options: ['خطية', 'ثابتة', 'تآلفية فقط', 'ليست تآلفية'], correct: 2, correction: '$a = -\\dfrac{1}{4} \\neq 0$ و $b = 3 \\neq 0$ : تآلفية، ليست خطية ولا ثابتة.' },
        { label: '$x \\longmapsto x^2 - 1$', options: ['خطية', 'ثابتة', 'تآلفية فقط', 'ليست تآلفية'], correct: 3, correction: '$x^2 = x \\times x$ : ليست من الشكل $ax + b$ .' },
      ],
      explain: 'كل دالة من الشكل $ax + b$ تآلفية؛ $b = 0$ : خطية ؛ $a = 0$ : ثابتة.',
    },
    commonError: 'القول إنّ $x \\longmapsto 7$ ليست دالة لأنّ $x$ لا يظهر فيها: إنها الدالة التآلفية التي $a = 0$ فيها.',
  },
];

/** Les parties d'un exercice, dans l'ordre. */
export const partsOf = (group) => EXERCISES.filter((e) => e.group === group);
