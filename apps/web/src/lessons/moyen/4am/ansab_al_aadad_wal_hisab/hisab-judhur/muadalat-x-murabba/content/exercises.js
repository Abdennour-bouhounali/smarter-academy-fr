/**
 * Les exercices du MANUEL rattachés au درس 3 de l'unité 2 (couverture :
 * extraction.json → destinations) : دوري الآن 2 (p. 23), تمارين 11–14
 * (p. 26) — la وضعية de « أدمج تعلّماتي » (p. 28) va à la leçon de synthèse
 * wadiya-idmajiya-judhur. Chaque énoncé est au mot
 * près ; l'interaction ne change pas la tâche mathématique. Les solutions
 * contenant un radical sont des CHOIX (`batch`), dont chaque distracteur est
 * FAUX et vient d'une erreur réelle : oublier −√a, confondre x² = a avec
 * x = a/2 ou x = a², garder le signe de −x², déclarer « لا حل » pour a > 0.
 *
 * Les options sont des chaînes `$…$` : le module les passe par MathText.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_muadalat-x-murabba_P1',
  P2: '4am_muadalat-x-murabba_P2',
};

const S = (n) => src(`ex-${n}`, 26, 'أوظّف تعلّماتي', n);
const NONE = 'لا تقبل أي حل';
/** « x = r أو x = −r » en LaTeX. */
const pm = (r) => `$x = ${r}$ أو $x = -${r}$`;

export const EXERCISES = [
  {
    id: 'now-23-2', source: src('now-23-2', 23, 'دوري الآن', 2), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'حل كل معادلة مما يلي: $-x^2 = 2$ ، $2x^2 - 6 = 0$ ، $x + 1 - x^2 = x$ .',
    interaction: 'batch',
    question: {
      prompt: 'نكتب كل معادلة على الشكل $x^2 = a$ ثم نطبّق الطريقة. اختر حلول كل معادلة:',
      rows: [
        { label: '$-x^2 = 2$', options: [NONE, pm('\\sqrt{2}'), '$x = -\\sqrt{2}$'], correct: 0,
          correction: '$-x^2 = 2$ يعني $x^2 = -2$، و $-2 < 0$: لا تقبل أي حل.' },
        { label: '$2x^2 - 6 = 0$', options: [pm('3'), pm('\\sqrt{3}'), pm('\\sqrt{6}')], correct: 1,
          correction: '$2x^2 = 6$ يعني $x^2 = 3$، إذن $x = \\sqrt{3}$ أو $x = -\\sqrt{3}$.' },
        { label: '$x + 1 - x^2 = x$', options: ['$x = 1$', NONE, pm('1')], correct: 2,
          correction: 'نطرح $x$ من الطرفين: $1 - x^2 = 0$ يعني $x^2 = 1$، إذن $x = 1$ أو $x = -1$.' },
      ],
      explain: 'نعزل $x^2$ أولًا كما في معادلة من الدرجة الأولى، ثم ننظر إلى إشارة العدد $a$.',
    },
    method: 'نعزل $x^2$ في طرف (نطرح، نقسم) حتى نصل إلى الشكل $x^2 = a$، ثم نحدد إشارة العدد $a$.',
    commonError: 'تحويل $-x^2 = 2$ إلى $x^2 = 2$ بإهمال الإشارة: الصحيح $x^2 = -2$، ولا حل.',
  },
  {
    id: 'ex-11', source: S(11), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'حل كل معادلة مما يلي:',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$x^2 = 81$', options: ['$x = 9$', pm('9'), pm('40{,}5')], correct: 1,
          correction: '$81 = 9^2$ ولكن أيضًا $(-9)^2 = 81$: حلّان متعاكسان.' },
        { label: '$x^2 = 2{,}89$', options: [pm('1{,}7'), pm('0{,}17'), NONE], correct: 0,
          correction: '$1{,}7^2 = 2{,}89$، إذن $x = 1{,}7$ أو $x = -1{,}7$.' },
        { label: '$x^2 = 361$', options: [pm('18'), '$x = 19$', pm('19')], correct: 2,
          correction: '$19^2 = 361$، إذن $x = 19$ أو $x = -19$.' },
        { label: '$x^2 = 0$', options: ['$x = 0$', NONE, pm('1')], correct: 0,
          correction: 'إذا كان $a = 0$ فإنّ المعادلة تقبل حلا واحدا وهو العدد 0.' },
        { label: '$x^2 = -16$', options: [pm('4'), NONE, '$x = -4$'], correct: 1,
          correction: '$-16 < 0$، ومربع أي عدد موجب: لا تقبل أي حل. $(-4)^2 = 16$ وليس $-16$.' },
      ],
      explain: 'حلّان متعاكسان إذا كان $a > 0$، حل واحد هو 0 إذا كان $a = 0$، ولا حل إذا كان $a < 0$.',
    },
    method: 'نحدد إشارة العدد $a$، ثم نكتب $a$ على شكل مربع إن أمكن.',
    commonError: 'الاكتفاء بالحل الموجب ونسيان معاكسه: $x^2 = 81$ لا يعني $x = 9$ فقط، لأنّ $(-9)^2 = 81$.',
  },
  {
    id: 'ex-12', source: S(12), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'حل كل معادلة مما يلي:',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$x^2 = 2$', options: [pm('1'), pm('\\sqrt{2}'), '$x = \\sqrt{2}$'], correct: 1,
          correction: '$2 > 0$: حلّان متعاكسان $\\sqrt{2}$ و $-\\sqrt{2}$.' },
        { label: '$x^2 = 1$', options: [pm('1'), '$x = 1$', NONE], correct: 0,
          correction: '$1^2 = 1$ و $(-1)^2 = 1$.' },
        { label: '$x^2 = -1$', options: [pm('1'), '$x = -1$', NONE], correct: 2,
          correction: '$-1 < 0$: لا تقبل أي حل، لأنّ $(-1)^2 = 1$ وليس $-1$.' },
        { label: '$x^2 = (-1)^2$', options: ['$x = -1$', pm('1'), NONE], correct: 1,
          correction: '$(-1)^2 = 1$، فالمعادلة هي $x^2 = 1$: $x = 1$ أو $x = -1$.' },
        { label: '$x^2 = \\dfrac{1}{4}$', options: [pm('\\dfrac{1}{8}'), pm('\\dfrac{1}{16}'), pm('\\dfrac{1}{2}')], correct: 2,
          correction: '$\\left(\\dfrac{1}{2}\\right)^2 = \\dfrac{1}{4}$.' },
        { label: '$x^2 = \\dfrac{48}{49}$', options: [pm('\\dfrac{24}{49}'), pm('\\sqrt{\\dfrac{48}{49}}'), '$x = \\sqrt{\\dfrac{48}{49}}$'], correct: 1,
          correction: '$\\dfrac{48}{49} > 0$: $x^2 = \\left(\\sqrt{\\dfrac{48}{49}}\\right)^2$، إذن حلّان متعاكسان. $\\dfrac{24}{49}$ هو نصف $\\dfrac{48}{49}$ وليس جذره.' },
      ],
      explain: 'في كل مرة: إشارة العدد $a$ أولًا، ثم $x^2 = (\\sqrt{a})^2$.',
    },
    method: 'إذا كان $a > 0$، نكتب $x^2 = (\\sqrt{a})^2$ ومنه $x = \\sqrt{a}$ أو $x = -\\sqrt{a}$.',
    commonError: 'قراءة $x^2 = (-1)^2$ على أنها تعطي الحل $-1$ وحده: $(-1)^2 = 1$، والمعادلة تقبل حلين $1$ و $-1$.',
  },
  {
    id: 'ex-13', source: S(13), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'حل كل معادلة مما يلي:',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$3 - x^2 = 0$', options: [NONE, pm('\\sqrt{3}'), pm('3')], correct: 1,
          correction: '$3 - x^2 = 0$ يعني $x^2 = 3$، إذن $x = \\sqrt{3}$ أو $x = -\\sqrt{3}$.' },
        { label: '$3 + x^2 = 0$', options: [pm('\\sqrt{3}'), '$x = -\\sqrt{3}$', NONE], correct: 2,
          correction: '$3 + x^2 = 0$ يعني $x^2 = -3$، و $-3 < 0$: لا تقبل أي حل.' },
        { label: '$1 - 9x^2 = 0$', options: [pm('\\dfrac{1}{9}'), pm('\\dfrac{1}{3}'), pm('3')], correct: 1,
          correction: '$9x^2 = 1$ يعني $x^2 = \\dfrac{1}{9}$، و $\\left(\\dfrac{1}{3}\\right)^2 = \\dfrac{1}{9}$.' },
      ],
      explain: 'نعزل $x^2$ أولًا: $x^2 = 3$ ، $x^2 = -3$ ، $x^2 = \\dfrac{1}{9}$.',
    },
    method: 'نعزل $x^2$ في طرف ثم نطبّق خاصية 2.',
    commonError: 'حل $1 - 9x^2 = 0$ بـ $x = \\dfrac{1}{9}$: هذا هو $x^2$، و $x = \\dfrac{1}{3}$ أو $x = -\\dfrac{1}{3}$.',
  },
  {
    id: 'ex-14', source: S(14), learningPointId: LP.P2, difficulty: 'difficile',
    items: [
      '1) لتكن العبارة $A = x(x - 5) + 5(x + 2) + 6$. أ) انشر العبارة A وبسّطها. ب) عيّن قيم $x$ التي تكون من أجلها $A = 0$.',
      '2) أجب عن السؤالين السابقين نفسهما من أجل العبارة $A = (x - 7)(x + 4) + 3x + 21$.',
    ],
    interaction: 'batch',
    question: {
      rows: [
        { label: '1) أ)', options: ['$A = x^2 + 16$', '$A = x^2 - 10x + 16$', '$A = x^2 + 10x + 16$'], correct: 0,
          correction: '$x^2 - 5x + 5x + 10 + 6 = x^2 + 16$.' },
        { label: '1) ب)', options: [pm('4'), '$x = -16$', 'لا توجد أي قيمة'], correct: 2,
          correction: '$x^2 + 16 = 0$ يعني $x^2 = -16$، و $-16 < 0$.' },
        { label: '2) أ)', options: ['$A = x^2 - 49$', '$A = x^2 + 6x - 7$', '$A = x^2 - 7$'], correct: 2,
          correction: '$x^2 + 4x - 7x - 28 + 3x + 21 = x^2 - 7$.' },
        { label: '2) ب)', options: [pm('\\sqrt{7}'), pm('7'), '$x = \\sqrt{7}$'], correct: 0,
          correction: '$x^2 - 7 = 0$ يعني $x^2 = 7$، إذن $x = \\sqrt{7}$ أو $x = -\\sqrt{7}$.' },
      ],
      explain: 'بعد النشر والتبسيط تختفي الحدود من الدرجة الأولى، فنصل إلى معادلة من الشكل $x^2 = a$.',
    },
    method: 'ننشر ونبسّط العبارة، ثم نحل $A = 0$ بكتابتها على الشكل $x^2 = a$.',
    commonError: 'خطأ في إشارة النشر: $x(x - 5) = x^2 - 5x$ (وليس $x^2 + 5x$)، و $-7 \\times 4 = -28$.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
