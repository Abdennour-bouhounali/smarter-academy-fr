/**
 * Les exercices du MANUEL rattachés au درس 2 « مفهوم وتعيين الدالة الخطية » (couverture :
 * extraction.json → destinations : ex-1, ex-6, ex-7, ex-8, ex-9, p. 72). Chaque énoncé est celui du
 * livre, au mot près ; un exercice à plusieurs parties est découpé en une entrée par partie (la
 * première porte l'énoncé). Tous les distracteurs sont faux (vérifiés par le calcul, commentés).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_dala-khattiya_P1',
  P2: '4am_dala-khattiya_P2',
  P3: '4am_dala-khattiya_P3',
};

const E = (n, part) => ({ ...src(`ex-${n}`, 72, 'أوظّف تعلّماتي', n), ...(part ? { part } : {}) });
const near = (v) => (n) => Number.isFinite(n) && Math.abs(n - v) < 1e-9;

export const EXERCISES = [
  // تمرين 1 — le pantalon : 2500DA → 2400DA
  {
    id: 'ex-1-a', source: E(1, 'a'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'سعر سروال مدرسي هو 2500DA، يشتريه أب لابنه المجتهد. أصبح هذا السعر 2400DA بعد التخفيض. عيّن الدّالة الخطية التي تنمذج هذه الوضعية. ما هي نسبة هذا التخفيض؟',
    interaction: 'numeric',
    question: {
      prompt: 'الدالة الخطية $f : x \\longmapsto ax$ ترفق بالسعر قبل التخفيض السعر بعده. معاملها $a =$',
      expected: near(0.96),
      display: '0,96',
      explain: '$f(2500) = 2400$ معناه $2500a = 2400$ ، أي $a = \\dfrac{2400}{2500} = 0{,}96$ : $f(x) = 0{,}96x$.',
    },
    method: 'نكتب $f(m) = n$ على الشكل $am = n$ ، ثم نقسم على $m$ (غير المعدوم).',
    commonError: 'قلب المعامل: $\\dfrac{2500}{2400}$ هو العدد الذي يرفق بالسعر بعد التخفيض السعر قبله، وليس معامل $f$.',
  },
  {
    id: 'ex-1-b', source: E(1, 'b'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'numeric',
    question: {
      prompt: 'نسبة هذا التخفيض (بالمئة) هي:',
      expected: near(4),
      display: '4',
      explain: 'المعامل $0{,}96 = 1 - 0{,}04$ : يُطرح من كل سعر $4\\%$ منه. وللتحقّق: $2500 - 2400 = 100$ و $\\dfrac{100}{2500} = 0{,}04$.',
    },
  },
  // تمرين 6 — g(−2/3) = −3/5
  {
    id: 'ex-6', source: E(6), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'عيّن الدّالة الخطية $g$ إذا علمت أن $g\\left(\\dfrac{-2}{3}\\right) = \\dfrac{-3}{5}$ .',
    interaction: 'choice',
    question: {
      prompt: 'الدالة $g$ هي:',
      // 2/5 = le produit (−2/3)(−3/5) ; 10/9 = le quotient renversé ; −9/10 = erreur de signe
      options: ['$g(x) = \\dfrac{9}{10}x$', '$g(x) = \\dfrac{2}{5}x$', '$g(x) = \\dfrac{10}{9}x$', '$g(x) = -\\dfrac{9}{10}x$'],
      correct: 0,
      cols: 2,
      explain: '$a \\times \\left(-\\dfrac{2}{3}\\right) = -\\dfrac{3}{5}$ ، إذن $a = -\\dfrac{3}{5} \\div \\left(-\\dfrac{2}{3}\\right) = \\dfrac{3}{5} \\times \\dfrac{3}{2} = \\dfrac{9}{10}$.',
    },
    method: 'نحل المعادلة $am = n$ : $a = n \\div m$ ، وقسمة عدد على كسر هي ضربه في مقلوبه.',
    commonError: 'ضرب العددين بدل قسمة الصورة على العدد: $\\left(-\\dfrac{2}{3}\\right) \\times \\left(-\\dfrac{3}{5}\\right) = \\dfrac{2}{5}$.',
  },
  // تمرين 7 — 3πx, 3x + √2, x²
  {
    id: 'ex-7', source: E(7), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'هل الدّوال التالية دوال خطية؟ في حالة الإيجاب عيّن المعامل. $f : x \\longmapsto 3\\pi x$ ، $g : x \\longmapsto 3x + \\sqrt{2}$ ، $h : x \\longmapsto x^2$ .',
    interaction: 'batch',
    question: {
      prompt: 'لكل دالة:',
      rows: [
        { label: '$f : x \\longmapsto 3\\pi x$', options: ['خطية معاملها $3\\pi$', 'خطية معاملها $3$', 'ليست خطية'], correct: 0, correction: '$3\\pi$ عدد ثابت (ولو لم يكن عشريًا): $f(x) = (3\\pi)x$ من الشكل $ax$.' },
        { label: '$g : x \\longmapsto 3x + \\sqrt{2}$', options: ['خطية معاملها $3$', 'خطية معاملها $3 + \\sqrt{2}$', 'ليست خطية'], correct: 2, correction: '$g(0) = \\sqrt{2} \\neq 0$ : العبارة ليست من الشكل $ax$.' },
        { label: '$h : x \\longmapsto x^2$', options: ['خطية معاملها $x$', 'خطية معاملها $2$', 'ليست خطية'], correct: 2, correction: '$x^2 = x \\times x$ : المضروب في $x$ ليس عددًا ثابتًا ($h(1) = 1$ و $h(2) = 4 \\neq 2$).' },
      ],
      explain: 'دالة خطية: صورة كل عدد $x$ هي جداؤه في العدد الثابت نفسه $a$.',
    },
    commonError: 'الحكم على $3x + \\sqrt{2}$ بأنها خطية لأنّ فيها $3x$ : الحد الثابت $\\sqrt{2}$ يجعل $g(0) \\neq 0$.',
  },
  // تمرين 8 — f(x) = −(√3/2)x
  {
    id: 'ex-8-1', source: E(8, '1)'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: '$f$ هي الدّالة الخطية المعرّفة بالدّستور $f(x) = -\\dfrac{\\sqrt{3}}{2}x$ . 1) احسب $f\\left(\\dfrac{2\\sqrt{3}}{3}\\right)$ ، $f(-2)$ ، $f(4)$ . 2) عيّن صور الأعداد $-3$ ، 6 ، 0. 3) عيّن العدد الذي صورته $\\sqrt{3}$ . 4) عيّن العدد الذي صورته $\\sqrt{12}$ .',
    interaction: 'batch',
    question: {
      prompt: '1) الصور:',
      rows: [
        { label: '$f\\left(\\dfrac{2\\sqrt{3}}{3}\\right)$', options: ['$-1$', '$1$', '$-\\sqrt{3}$'], correct: 0, correction: '$-\\dfrac{\\sqrt{3}}{2} \\times \\dfrac{2\\sqrt{3}}{3} = -\\dfrac{2 \\times 3}{6} = -1$.' },
        { label: '$f(-2)$', options: ['$-\\sqrt{3}$', '$\\sqrt{3}$', '$\\dfrac{\\sqrt{3}}{4}$'], correct: 1, correction: '$-\\dfrac{\\sqrt{3}}{2} \\times (-2) = \\sqrt{3}$ (ناقص في ناقص يعطي موجبًا).' },
        { label: '$f(4)$', options: ['$-2\\sqrt{3}$', '$2\\sqrt{3}$', '$-\\dfrac{\\sqrt{3}}{8}$'], correct: 0, correction: '$-\\dfrac{\\sqrt{3}}{2} \\times 4 = -2\\sqrt{3}$.' },
      ],
      explain: 'صورة $m$ هي $f(m) = -\\dfrac{\\sqrt{3}}{2} \\times m$.',
    },
    method: 'نعوّض $x$ بالعدد ونحسب الجداء $a \\times m$.',
    commonError: 'نسيان إشارة المعامل: $f(-2) = \\sqrt{3}$ وليس $-\\sqrt{3}$.',
  },
  {
    id: 'ex-8-2', source: E(8, '2)'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'batch',
    question: {
      prompt: '2) صور الأعداد:',
      rows: [
        { label: '$-3$', options: ['$\\dfrac{3\\sqrt{3}}{2}$', '$-\\dfrac{3\\sqrt{3}}{2}$', '$\\dfrac{2\\sqrt{3}}{3}$'], correct: 0, correction: '$-\\dfrac{\\sqrt{3}}{2} \\times (-3) = \\dfrac{3\\sqrt{3}}{2}$.' },
        { label: '$6$', options: ['$3\\sqrt{3}$', '$-3\\sqrt{3}$', '$-\\dfrac{\\sqrt{3}}{12}$'], correct: 1, correction: '$-\\dfrac{\\sqrt{3}}{2} \\times 6 = -3\\sqrt{3}$.' },
        { label: '$0$', options: ['$0$', '$-\\dfrac{\\sqrt{3}}{2}$', '$1$'], correct: 0, correction: '$a \\times 0 = 0$ : صورة 0 بأي دالة خطية هي 0.' },
      ],
      explain: 'كل صورة جداء العدد في المعامل نفسه $-\\dfrac{\\sqrt{3}}{2}$.',
    },
  },
  {
    id: 'ex-8-3', source: E(8, '3)'), learningPointId: LP.P3, difficulty: 'difficile',
    interaction: 'choice',
    question: {
      prompt: '3) العدد الذي صورته $\\sqrt{3}$ هو:',
      // 2 : erreur de signe ; −3/2 : f(√3) au lieu de l'antécédent
      options: ['$-2$', '$2$', '$-\\dfrac{3}{2}$'],
      correct: 0,
      cols: 3,
      explain: '$-\\dfrac{\\sqrt{3}}{2} \\times x = \\sqrt{3}$ ، إذن $x = \\sqrt{3} \\div \\left(-\\dfrac{\\sqrt{3}}{2}\\right) = -2$. (وقد وجدنا في 1) أنّ $f(-2) = \\sqrt{3}$.)',
    },
  },
  {
    id: 'ex-8-4', source: E(8, '4)'), learningPointId: LP.P3, difficulty: 'difficile',
    interaction: 'choice',
    question: {
      prompt: '4) العدد الذي صورته $\\sqrt{12}$ هو:',
      // −2√3 = f(4), confondu avec l'antécédent ; 4 : erreur de signe ; −6 : √12 lu 12
      options: ['$-4$', '$4$', '$-2\\sqrt{3}$', '$-6$'],
      correct: 0,
      cols: 4,
      explain: '$\\sqrt{12} = 2\\sqrt{3}$ ، و $-\\dfrac{\\sqrt{3}}{2} \\times x = 2\\sqrt{3}$ تعطي $x = 2\\sqrt{3} \\div \\left(-\\dfrac{\\sqrt{3}}{2}\\right) = -4$.',
    },
  },
  // تمرين 9 — coefficient 2,1 : le tableau
  {
    id: 'ex-9-a', source: E(9, 'f(-3)'), learningPointId: LP.P2, difficulty: 'facile',
    statement: '$f$ هي الدّالة الخطية التي معاملها 2,1. انقل الجدول التالي ثم أتممه: ($x$ : $-3$ ، … ، … ، … ؛ $f(x)$ : … ، $0$ ، $14{,}7$ ، $-2{,}1$ )',
    interaction: 'numeric',
    question: {
      prompt: '$f(-3) =$',
      expected: near(-6.3),
      display: '-6,3',
      explain: '$f(-3) = 2{,}1 \\times (-3) = -6{,}3$.',
    },
    commonError: 'نسيان الإشارة: $2{,}1 \\times (-3)$ سالب.',
  },
  {
    id: 'ex-9-b', source: E(9, '0'), learningPointId: LP.P3, difficulty: 'facile',
    interaction: 'numeric',
    question: { prompt: 'العدد الذي صورته $0$ هو:', expected: near(0), display: '0', explain: '$2{,}1 \\times x = 0$ ، و $2{,}1 \\neq 0$ ، إذن $x = 0$.' },
  },
  {
    id: 'ex-9-c', source: E(9, '14,7'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'numeric',
    question: { prompt: 'العدد الذي صورته $14{,}7$ هو:', expected: near(7), display: '7', explain: '$2{,}1 \\times x = 14{,}7$ ، إذن $x = 14{,}7 \\div 2{,}1 = 7$.' },
  },
  {
    id: 'ex-9-d', source: E(9, '-2,1'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'numeric',
    question: { prompt: 'العدد الذي صورته $-2{,}1$ هو:', expected: near(-1), display: '-1', explain: '$2{,}1 \\times x = -2{,}1$ ، إذن $x = -2{,}1 \\div 2{,}1 = -1$.' },
  },
];

/** Les parties d'un exercice. */
export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));

/** Accès par id. */
export const EX = Object.fromEntries(EXERCISES.map((ex) => [ex.id, ex]));
