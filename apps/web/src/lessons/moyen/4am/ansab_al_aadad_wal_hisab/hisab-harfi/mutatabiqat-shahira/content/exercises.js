/**
 * Les exercices du MANUEL rattachés au درس « المتطابقات الشهيرة »
 * (extraction.json → destinations) : دوري الآن 1 (p. 36), أوظّف تعلّماتي
 * 9–19 (pp. 37–38, « الجداءات الشهيرة »), 28 — l'item أ seulement (p. 39 ;
 * l'item ب appartient à la leçon « تحليل عبارة جبرية »), أتعمّق 35 et 36
 * (p. 41). Énoncés du livre, SAUF (rollout 2026-11-11, conseil X3 / L2.1, SHARED-deliberate — la page de l'enseignant y gagne aussi) :
 * les lignes qui montraient la مسألة du module 5 ou son ancre mentale 30 sont refaites avec des nombres de la plateforme (now-B 729x³ →
 * 4x(4x + 1)², ex-11 31² → 21² et 1009² → 1008², ex-12 (x + 3)² → (x + 5)², ex-14 (2x − 3)² → (2x − 5)², ex-15 (x − 3)² → (x − 4)², ex-35
 * (x + 3)² → (x + 2)²), les renvois « سؤال التمرين السابق نفسه » sont réécrits et la note d'erreur d'impression est retirée.
 *
 * Chaque item d'un exercice est une LIGNE d'un `batch` : la réponse est un
 * développement réduit ou un nombre, et chaque distracteur est FAUX, construit
 * sur une erreur réelle (2ab oublié, ab au lieu de 2ab, coefficient non élevé
 * au carré, signe de b² dans un carré de différence, −b² dans (a + b)(a − b)…).
 * Les options sont des chaînes `$…$` : le module les rend par MathText.
 *
 * Exercice 36 : l'énoncé AFFICHÉ est la version corrigée décidée par le
 * propriétaire (extraction.json → ex-36.correction) : E₁ = x² − (x + 1)(x − 1).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_mutatabiqat-shahira_P1',
  P2: '4am_mutatabiqat-shahira_P2',
  P3: '4am_mutatabiqat-shahira_P3',
  P4: '4am_mutatabiqat-shahira_P4',
};

const row = (label, options, correct, correction) => ({ label, options, correct, ...(correction ? { correction } : {}) });
const S = (n, page) => src(`ex-${n}`, page, 'أوظّف تعلّماتي', n);
const GROUP = 'الجداءات الشهيرة';

/** دوري الآن 1 (p. 36) — l'application directe de la طريقة. */
export const NOW_EXERCISE = {
  id: 'now-36-1', source: src('now-36-1', 36, 'دوري الآن', 1), learningPointId: LP.P2, difficulty: 'difficile',
  statement: 'انشر كل عبارة مما يلي وبسّطها:',
  items: ['$A = (x - 2)^2 + 4(3x - 1)(3x + 3)$', '$B = 4x(4x + 1)^2 - x(x - 1)^2$'],
  interaction: 'batch',
  question: {
    rows: [
      row('$A =$', ['$37x^2 + 28x - 8$', '$37x^2 + 20x - 8$', '$37x^2 + 24x - 16$'], 1,
        '$x^2 - 4x + 4 + 4(9x^2 + 9x - 3x - 3) = x^2 - 4x + 4 + 36x^2 + 24x - 12 = 37x^2 + 20x - 8$'),
      row('$B =$', ['$63x^3 + 3x$', '$63x^3 + 30x^2 + 5x$', '$63x^3 + 34x^2 + 3x$'], 2,
        '$4x(16x^2 + 8x + 1) - x(x^2 - 2x + 1) = 64x^3 + 32x^2 + 4x - x^3 + 2x^2 - x = 63x^3 + 34x^2 + 3x$'),
    ],
    explain: 'ننشر كل مربع بالمتطابقة المناسبة أولًا، ثم نضرب في العامل، ونحذف القوسين المسبوقين بـ $-$ بتغيير كل الإشارات، ثم نجمع الحدود المتشابهة.',
  },
  method: 'ننشر المربع بالمتطابقة الشهيرة قبل الضرب في العامل الذي أمامه.',
  commonError: 'كتابة $(x - 2)^2 = x^2 - 4$ أو $(x - 2)^2 = x^2 + 4x + 4$ : الحد المضاعف $-4x$ سالب والحد الأخير $+4$ موجب.',
};

export const EXERCISES = [
  {
    id: 'ex-9', source: S(9, 37), group: GROUP, learningPointId: LP.P1, difficulty: 'facile',
    statement: 'انشر كل عبارة مما يلي وبسّطها:',
    interaction: 'batch',
    question: {
      rows: [
        row('$A = (x + 5)^2$', ['$x^2 + 25$', '$x^2 + 10x + 25$', '$x^2 + 5x + 25$'], 1, '$x^2 + 2 \\times x \\times 5 + 5^2 = x^2 + 10x + 25$'),
        row('$B = (x + 0{,}3)^2$', ['$x^2 + 0{,}6x + 0{,}09$', '$x^2 + 0{,}3x + 0{,}09$', '$x^2 + 0{,}6x + 0{,}9$'], 0, '$x^2 + 2 \\times x \\times 0{,}3 + 0{,}3^2 = x^2 + 0{,}6x + 0{,}09$'),
        row('$C = \\left(x + \\dfrac{2}{3}\\right)^2$', ['$x^2 + \\dfrac{2}{3}x + \\dfrac{4}{9}$', '$x^2 + \\dfrac{4}{9}$', '$x^2 + \\dfrac{4}{3}x + \\dfrac{4}{9}$'], 2, '$x^2 + 2 \\times x \\times \\dfrac{2}{3} + \\left(\\dfrac{2}{3}\\right)^2 = x^2 + \\dfrac{4}{3}x + \\dfrac{4}{9}$'),
      ],
      explain: '$(a + b)^2 = a^2 + 2ab + b^2$ مع $a = x$ : الحد المضاعف $2ab$ لا يُنسى.',
    },
    method: 'نتعرّف على مربع مجموع، نعيّن الحدين $a$ و $b$ ، ثم نكتب $a^2 + 2ab + b^2$.',
    commonError: 'نسيان الحد المضاعف: $(x + 5)^2 \\neq x^2 + 25$.',
  },
  {
    id: 'ex-10', source: S(10, 37), group: GROUP, learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'انشر كل عبارة مما يلي وبسّطها:',
    interaction: 'batch',
    question: {
      rows: [
        row('$A = (4x + 1)^2$', ['$4x^2 + 8x + 1$', '$16x^2 + 4x + 1$', '$16x^2 + 8x + 1$'], 2, '$(4x)^2 + 2 \\times 4x \\times 1 + 1^2 = 16x^2 + 8x + 1$'),
        row('$B = (2x + 0{,}5)^2$', ['$4x^2 + 2x + 0{,}25$', '$2x^2 + 2x + 0{,}25$', '$4x^2 + x + 0{,}25$'], 0, '$(2x)^2 + 2 \\times 2x \\times 0{,}5 + 0{,}5^2 = 4x^2 + 2x + 0{,}25$'),
        row('$C = \\left(3x + \\dfrac{5}{3}\\right)^2$', ['$9x^2 + 5x + \\dfrac{25}{9}$', '$9x^2 + 10x + \\dfrac{25}{9}$', '$3x^2 + 10x + \\dfrac{25}{9}$'], 1, '$(3x)^2 + 2 \\times 3x \\times \\dfrac{5}{3} + \\left(\\dfrac{5}{3}\\right)^2 = 9x^2 + 10x + \\dfrac{25}{9}$'),
      ],
      explain: 'الحد الأول هنا $a = 4x$ أو $2x$ أو $3x$ : مربعه $16x^2$ ، $4x^2$ ، $9x^2$ — المعامل يُربَّع أيضًا.',
    },
    method: 'نكتب الحد الأول بين قوسين قبل تربيعه: $(4x)^2 = 16x^2$.',
    commonError: 'نسيان تربيع المعامل: $(4x)^2 \\neq 4x^2$.',
  },
  {
    id: 'ex-11', source: S(11, 37), group: GROUP, learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'احسب ذهنيا (دون وضع العملية) كل عدد مما يلي: $21^2$ ، $105^2$ ، $1008^2$ .',
    interaction: 'batch',
    question: {
      rows: [
        row('$21^2 = (20 + 1)^2 =$', ['$401$', '$441$', '$421$'], 1, '$400 + 40 + 1 = 441$'),
        row('$105^2 = (100 + 5)^2 =$', ['$11\\,025$', '$10\\,025$', '$10\\,525$'], 0, '$10\\,000 + 1000 + 25 = 11\\,025$'),
        row('$1008^2 = (1000 + 8)^2 =$', ['$1\\,000\\,064$', '$1\\,008\\,064$', '$1\\,016\\,064$'], 2, '$1\\,000\\,000 + 16\\,000 + 64 = 1\\,016\\,064$'),
      ],
      explain: 'نكتب العدد مجموع عدد «مدوّر» وعدد صغير، ثم نستعمل $(a + b)^2 = a^2 + 2ab + b^2$.',
    },
    method: 'نكتب $21 = 20 + 1$ ثم نطبّق مربع مجموع: ثلاثة حدود سهلة الحساب.',
    commonError: 'تربيع الجزأين فقط: $21^2 \\neq 400 + 1$ ، ينقص الحد المضاعف $2 \\times 20 \\times 1 = 40$.',
  },
  {
    id: 'ex-12', source: S(12, 37), group: GROUP, learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'انقل، باستعمال $a^2 + 2ab + b^2 = (a + b)^2$ المساويات الآتية وأتممها: 1) $x^2 + \\ldots x + \\ldots = (\\ldots + 5)^2$ 2) $16x^2 + \\ldots + 1 = (\\ldots + 1)^2$ 3) $\\ldots + 14x + 49 = (\\ldots + \\ldots)^2$',
    interaction: 'batch',
    question: {
      rows: [
        row('1)', ['$x^2 + 5x + 25 = (x + 5)^2$', '$x^2 + 10x + 25 = (x + 5)^2$', '$x^2 + 10x + 5 = (x + 5)^2$'], 1, '$2 \\times x \\times 5 = 10x$ و $5^2 = 25$'),
        row('2)', ['$16x^2 + 8x + 1 = (4x + 1)^2$', '$16x^2 + 4x + 1 = (4x + 1)^2$', '$16x^2 + 8x + 1 = (16x + 1)^2$'], 0, '$16x^2 = (4x)^2$ و $2 \\times 4x \\times 1 = 8x$'),
        row('3)', ['$x^2 + 14x + 49 = (x + 49)^2$', '$49x^2 + 14x + 49 = (7x + 7)^2$', '$x^2 + 14x + 49 = (x + 7)^2$'], 2, '$49 = 7^2$ و $14x = 2 \\times x \\times 7$'),
      ],
      explain: 'نقرأ المتطابقة من اليمين إلى اليسار: $a^2$ و $b^2$ هما المربعان، و $2ab$ هو الحد المضاعف.',
    },
    method: 'نعيّن $a$ و $b$ من المربعين، ثم نتحقق أن الحد الأوسط يساوي $2ab$.',
    commonError: 'كتابة الحد الأوسط $ab$ بدل $2ab$ : في 1) الحد الأوسط $10x$ لا $5x$.',
  },
  {
    id: 'ex-13', source: S(13, 38), group: GROUP, learningPointId: LP.P2, difficulty: 'facile',
    statement: 'انشر كل عبارة مما يلي وبسّطها:',
    interaction: 'batch',
    question: {
      rows: [
        row('$A = (x - 4)^2$', ['$x^2 - 8x + 16$', '$x^2 - 16$', '$x^2 - 8x - 16$'], 0, '$x^2 - 2 \\times x \\times 4 + 4^2 = x^2 - 8x + 16$'),
        row('$B = (x - 1{,}5)^2$', ['$x^2 + 3x + 2{,}25$', '$x^2 - 3x + 2{,}25$', '$x^2 - 1{,}5x + 2{,}25$'], 1, '$x^2 - 2 \\times x \\times 1{,}5 + 1{,}5^2 = x^2 - 3x + 2{,}25$'),
        row('$C = \\left(x - \\dfrac{5}{11}\\right)^2$', ['$x^2 - \\dfrac{5}{11}x + \\dfrac{25}{121}$', '$x^2 - \\dfrac{10}{11}x - \\dfrac{25}{121}$', '$x^2 - \\dfrac{10}{11}x + \\dfrac{25}{121}$'], 2, '$x^2 - 2 \\times x \\times \\dfrac{5}{11} + \\left(\\dfrac{5}{11}\\right)^2 = x^2 - \\dfrac{10}{11}x + \\dfrac{25}{121}$'),
      ],
      explain: '$(a - b)^2 = a^2 - 2ab + b^2$ : الحد المضاعف سالب، والحد الأخير $+b^2$ موجب دائمًا.',
    },
    method: 'نتعرّف على مربع فرق، نعيّن $a$ و $b$ ، ثم نكتب $a^2 - 2ab + b^2$.',
    commonError: 'كتابة $(x - 4)^2 = x^2 - 16$ : مربع فرق ليس فرق المربعين.',
  },
  {
    id: 'ex-14', source: S(14, 38), group: GROUP, learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'انشر كل عبارة مما يلي وبسّطها:',
    interaction: 'batch',
    question: {
      rows: [
        row('$A = (2x - 5)^2$', ['$4x^2 - 10x + 25$', '$4x^2 - 20x + 25$', '$2x^2 - 20x + 25$'], 1, '$(2x)^2 - 2 \\times 2x \\times 5 + 5^2 = 4x^2 - 20x + 25$'),
        row('$B = (5x - 1{,}4)^2$', ['$25x^2 - 14x + 1{,}96$', '$25x^2 - 7x + 1{,}96$', '$5x^2 - 14x + 1{,}96$'], 0, '$(5x)^2 - 2 \\times 5x \\times 1{,}4 + 1{,}4^2 = 25x^2 - 14x + 1{,}96$'),
        row('$C = \\left(\\dfrac{4}{3}x - \\dfrac{3}{5}\\right)^2$', ['$\\dfrac{16}{9}x^2 + \\dfrac{8}{5}x + \\dfrac{9}{25}$', '$\\dfrac{16}{9}x^2 - \\dfrac{4}{5}x + \\dfrac{9}{25}$', '$\\dfrac{16}{9}x^2 - \\dfrac{8}{5}x + \\dfrac{9}{25}$'], 2, '$2 \\times \\dfrac{4}{3}x \\times \\dfrac{3}{5} = \\dfrac{24}{15}x = \\dfrac{8}{5}x$'),
      ],
      explain: 'الحد الأول $a$ فيه معامل: $(2x)^2 = 4x^2$ ، $(5x)^2 = 25x^2$ ، $\\left(\\dfrac{4}{3}x\\right)^2 = \\dfrac{16}{9}x^2$.',
    },
    method: 'نربّع المعامل والحرف معًا، ونحسب $2ab$ بضرب الأعداد الثلاثة $2$ و $a$ و $b$.',
    commonError: 'حساب $ab$ بدل $2ab$ : في A الحد المضاعف $-20x$ لا $-10x$.',
  },
  {
    id: 'ex-15', source: S(15, 38), group: GROUP, learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'انشر كل عبارة مما يلي وبسّطها:',
    interaction: 'batch',
    question: {
      rows: [
        row('$A = (3x - 4)^2 + (x - 4)^2$', ['$10x^2 + 32$', '$10x^2 - 32x + 32$', '$10x^2 - 16x + 32$'], 1, '$9x^2 - 24x + 16 + x^2 - 8x + 16 = 10x^2 - 32x + 32$'),
        row('$B = 4(1 - 2x)^2 + (4x - 1)^2$', ['$32x^2 - 24x + 5$', '$32x^2 + 5$', '$80x^2 - 72x + 17$'], 0, '$4(1 - 4x + 4x^2) + 16x^2 - 8x + 1 = 32x^2 - 24x + 5$'),
      ],
      explain: 'ننشر كل مربع وحده، ونضرب في 4 بعد النشر لا قبله، ثم نجمع الحدود المتشابهة.',
    },
    method: 'ننشر المربع أولًا، ثم نوزّع العامل 4 على حدوده الثلاثة.',
    commonError: 'إدخال العامل 4 داخل المربع: $4(1 - 2x)^2 \\neq (4 - 8x)^2$.',
  },
  {
    id: 'ex-16', source: S(16, 38), group: GROUP, learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'انشر كل عبارة مما يلي وبسّطها:',
    interaction: 'batch',
    question: {
      rows: [
        row('$D = (5x + 1)^2 + 5(x - 1)^2$', ['$30x^2 + 20x + 6$', '$30x^2 + 6$', '$30x^2 + 10x - 4$'], 1, '$25x^2 + 10x + 1 + 5x^2 - 10x + 5 = 30x^2 + 6$'),
        row('$E = (3x - 4)^2 - 4(1 - x)^2$', ['$13x^2 - 32x + 12$', '$13x^2 - 24x + 12$', '$5x^2 - 16x + 12$'], 2, '$9x^2 - 24x + 16 - 4 + 8x - 4x^2 = 5x^2 - 16x + 12$'),
      ],
      explain: 'في E الإشارة $-$ أمام $4(1 - x)^2$ تغيّر إشارة كل حدود النشر: $-4(1 - 2x + x^2) = -4 + 8x - 4x^2$.',
    },
    method: 'نكتب نشر المربع بين قوسين، ثم نضرب في العامل بإشارته.',
    commonError: 'نسيان تغيير إشارة كل الحدود بعد $-4$ : $-4(1 - 2x + x^2) \\neq -4 - 8x + 4x^2$.',
  },
  {
    id: 'ex-17', source: S(17, 38), group: GROUP, learningPointId: LP.P3, difficulty: 'facile',
    statement: 'انشر كل عبارة مما يلي وبسّطها:',
    interaction: 'batch',
    question: {
      rows: [
        row('$A = (x + 7)(x - 7)$', ['$x^2 + 49$', '$x^2 - 14x - 49$', '$x^2 - 49$'], 2, '$x^2 - 7^2 = x^2 - 49$'),
        row('$B = (x + 0{,}2)(x - 0{,}2)$', ['$x^2 - 0{,}04$', '$x^2 - 0{,}4$', '$x^2 + 0{,}04$'], 0, '$x^2 - 0{,}2^2 = x^2 - 0{,}04$'),
        row('$C = \\left(x - \\dfrac{1}{3}\\right)\\left(x + \\dfrac{1}{3}\\right)$', ['$x^2 + \\dfrac{1}{9}$', '$x^2 - \\dfrac{1}{9}$', '$x^2 - \\dfrac{2}{3}$'], 1, '$x^2 - \\left(\\dfrac{1}{3}\\right)^2 = x^2 - \\dfrac{1}{9}$'),
      ],
      explain: '$(a + b)(a - b) = a^2 - b^2$ : الحدّان $+ab$ و $-ab$ يتعادمان ويبقى مربعان بينهما $-$.',
    },
    method: 'نتعرّف على جداء مجموع حدين وفرقهما (نفس الحدين، إشارتان مختلفتان)، ثم نكتب $a^2 - b^2$.',
    commonError: 'كتابة $(x + 7)(x - 7) = x^2 + 49$ : الحد $b^2$ مطروح.',
  },
  {
    id: 'ex-18', source: S(18, 38), group: GROUP, learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'انشر كل عبارة مما يلي وبسّطها:',
    interaction: 'batch',
    question: {
      rows: [
        row('$A = (3x + 5)(3x - 5)$', ['$3x^2 - 25$', '$9x^2 - 25$', '$9x^2 - 10$'], 1, '$(3x)^2 - 5^2 = 9x^2 - 25$'),
        row('$B = (1{,}5 + 2x)(1{,}5 - 2x)$', ['$2{,}25 - 4x^2$', '$4x^2 - 2{,}25$', '$2{,}25 + 4x^2$'], 0, '$1{,}5^2 - (2x)^2 = 2{,}25 - 4x^2$'),
        row('$C = \\left(\\dfrac{\\sqrt{2}}{5}x - \\dfrac{1}{3}\\right)\\left(\\dfrac{\\sqrt{2}}{5}x + \\dfrac{1}{3}\\right)$', ['$\\dfrac{2}{5}x^2 - \\dfrac{1}{9}$', '$\\dfrac{\\sqrt{2}}{25}x^2 - \\dfrac{1}{9}$', '$\\dfrac{2}{25}x^2 - \\dfrac{1}{9}$'], 2, '$\\left(\\dfrac{\\sqrt{2}}{5}x\\right)^2 = \\dfrac{2}{25}x^2$ و $\\left(\\dfrac{1}{3}\\right)^2 = \\dfrac{1}{9}$'),
      ],
      explain: 'في B الحد $a$ هو $1{,}5$ والحد $b$ هو $2x$ : النتيجة $a^2 - b^2 = 2{,}25 - 4x^2$ ، بهذا الترتيب.',
    },
    method: 'نعيّن الحد الذي لا تتغيّر إشارته ($a$) والحد الذي تتغيّر إشارته ($b$)، ثم $a^2 - b^2$.',
    commonError: 'قلب الترتيب في B: $(1{,}5 + 2x)(1{,}5 - 2x) \\neq 4x^2 - 2{,}25$.',
  },
  {
    id: 'ex-19', source: S(19, 38), group: GROUP, learningPointId: LP.P4, difficulty: 'difficile',
    statement: '1) انشر العبارة $A = x^2 - (x - 1)(x + 1)$ وبسطها. 2) اشرح كيف تستعمل نتيجة السؤال 1 لإعطاء نتيجة كل مما يلي دون حساب: $B = 978654321^2 - 978654320 \\times 978654322$ ، $C = 999888777^2 - 999888778 \\times 999888776$',
    interaction: 'batch',
    question: {
      rows: [
        row('1) $A =$', ['$2x^2 - 1$', '$1$', '$-1$'], 1, '$x^2 - (x^2 - 1) = x^2 - x^2 + 1 = 1$'),
        row('2) $B =$', ['$1$', '$0$', '$-1$'], 0, 'B هو A من أجل $x = 978654321$ ، إذن $B = 1$'),
        row('2) $C =$', ['$-1$', '$0$', '$1$'], 2, 'C هو A من أجل $x = 999888777$ ، إذن $C = 1$'),
      ],
      explain: 'A يساوي 1 مهما كان $x$ : المساواة $x^2 - (x - 1)(x + 1) = 1$ متطابقة، فتصحّ من أجل أي عدد، حتى الكبير جدًّا.',
    },
    method: 'نتعرّف على شكل A في العدد المعطى: $978654320 = x - 1$ و $978654322 = x + 1$.',
    commonError: 'نسيان القوسين: $x^2 - (x^2 - 1) \\neq x^2 - x^2 - 1$.',
  },
  {
    id: 'ex-28', source: src('ex-28', 39, 'أوظّف تعلّماتي', 28), learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'احسب ذهنيا (دون وضع العملية) كل عدد مما يلي: أ) $21 \\times 19$ ، $101 \\times 99$ ، $1008 \\times 992$ .',
    interaction: 'batch',
    question: {
      rows: [
        row('$21 \\times 19 = (20 + 1)(20 - 1) =$', ['$399$', '$401$', '$380$'], 0, '$400 - 1 = 399$'),
        row('$101 \\times 99 = (100 + 1)(100 - 1) =$', ['$10\\,001$', '$9999$', '$9900$'], 1, '$10\\,000 - 1 = 9999$'),
        row('$1008 \\times 992 = (1000 + 8)(1000 - 8) =$', ['$1\\,000\\,064$', '$999\\,984$', '$999\\,936$'], 2, '$1\\,000\\,000 - 64 = 999\\,936$'),
      ],
      explain: 'العددان متناظران حول عدد «مدوّر»: نكتبهما $a + b$ و $a - b$ ونستعمل $(a + b)(a - b) = a^2 - b^2$.',
    },
    method: 'نبحث عن العدد الذي يقع في منتصف العاملين: $20$ ، $100$ ، $1000$.',
    commonError: 'إضافة $b^2$ بدل طرحه: $101 \\times 99 \\neq 10\\,001$.',
  },
  {
    id: 'ex-35', source: src('ex-35', 41, 'أتعمّق', 35), learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'لتكن العبارة E حيث $E = (x + 1)(x + 4) - (x + 2)^2$ . 1) انشر وبسّط العبارة E. 2) استعمل نتيجة السؤال (1) لحساب كل مما يلي ذهنيا: $101 \\times 104 - 102^2$ ، $1{,}5 \\times 4{,}5 - (2{,}5)^2$',
    interaction: 'batch',
    question: {
      rows: [
        row('1) $E =$', ['$5x$', '$x$', '$9x + 8$'], 1, '$x^2 + 5x + 4 - (x^2 + 4x + 4) = x$'),
        row('2) $101 \\times 104 - 102^2 =$', ['$100$', '$10$', '$1000$'], 0, 'هي E من أجل $x = 100$ : $E = 100$'),
        row('2) $1{,}5 \\times 4{,}5 - (2{,}5)^2 =$', ['$5$', '$0{,}05$', '$0{,}5$'], 2, 'هي E من أجل $x = 0{,}5$ : $E = 0{,}5$'),
      ],
      explain: 'E يساوي $x$ من أجل كل عدد $x$ ؛ يكفي أن نجد قيمة $x$ التي تعطي العدد المطلوب: $x + 1 = 101$ ، ثم $x + 1 = 1{,}5$.',
    },
    method: 'ننشر $(x + 2)^2$ بالمتطابقة، ونحذف القوسين المسبوقين بـ $-$ بتغيير الإشارات.',
    commonError: 'كتابة $(x + 2)^2 = x^2 + 4$ فنجد $5x$ بدل $x$.',
  },
  {
    id: 'ex-36', source: src('ex-36', 41, 'أتعمّق', 36), learningPointId: LP.P4, difficulty: 'difficile',
    // L'énoncé corrigé (extraction.json → ex-36.correction) : E₁ = x² − (x + 1)(x − 1).
    statement: '1) استعمل حاسبة لحساب كل عدد مما يلي: $a = 35^2 - 36 \\times 34$ ، $b = 97^2 - 98 \\times 96$ ، $c = 321^2 - 322 \\times 320$ . 2) خمّن نتيجة الحساب $2018^2 - 2019 \\times 2017$ ، ثمّ تحقّق من ذلك. 3) اشرح لماذا كل من الصيغ الآتية تعبّر عن الحسابات السابقة، ثمّ انشر كلا منها وبسّطها: $E_1 = x^2 - (x + 1)(x - 1)$ ، $E_2 = (x - 1)^2 - x(x - 2)$ ، $E_3 = (x + 1)^2 - (x + 2)x$ .',
    interaction: 'batch',
    question: {
      rows: [
        row('1) $a = 35^2 - 36 \\times 34 =$', ['$1$', '$0$', '$35$'], 0, '$1225 - 1224 = 1$ ، وكذلك $b = 1$ و $c = 1$'),
        row('2) $2018^2 - 2019 \\times 2017 =$', ['$0$', '$1$', '$2018$'], 1, '$2019 \\times 2017 = (2018 + 1)(2018 - 1) = 2018^2 - 1$'),
        row('3) $E_1 = x^2 - (x + 1)(x - 1) =$', ['$2x^2 - 1$', '$-1$', '$1$'], 2, '$x^2 - (x^2 - 1) = 1$ ؛ من أجل $x = 35$ نجد $a$'),
        row('3) $E_2 = (x - 1)^2 - x(x - 2) =$', ['$1$', '$-4x + 1$', '$2x^2 - 4x + 1$'], 0, '$x^2 - 2x + 1 - x^2 + 2x = 1$ ؛ من أجل $x = 36$ نجد $a$'),
        row('3) $E_3 = (x + 1)^2 - (x + 2)x =$', ['$4x + 1$', '$1$', '$-1$'], 1, '$x^2 + 2x + 1 - x^2 - 2x = 1$ ؛ من أجل $x = 34$ نجد $a$'),
      ],
      explain: 'في كل حساب يظهر عدد مربّع وجداء جاريه: $36 \\times 34 = (35 + 1)(35 - 1) = 35^2 - 1$. الصيغ الثلاث تساوي 1 من أجل كل $x$ : هي متطابقات.',
    },
    method: 'نكتب العاملين بدلالة العدد المربّع: $36 = 35 + 1$ و $34 = 35 - 1$.',
    commonError: 'نسيان القوسين بعد $-$ : $x^2 - (x^2 - 1) \\neq x^2 - x^2 - 1$.',
  },
];

export const EX = Object.fromEntries([NOW_EXERCISE, ...EXERCISES].map((e) => [e.id, e]));
