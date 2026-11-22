/**
 * Le contenu de la leçon 2 « معادلات جداء معدوم » rattaché aux éléments du manuel — données pures (aucun JSX). Chaque bloc cite son élément de
 * docs/sources/4am/unit4/extraction.json (`src(…)`) pour la traçabilité, mais le texte et les NOMBRES sont ceux de la plateforme (rollout
 * 2026-11-11, conseil du 2026-11-11, verdict L2 + X1 : « le manuel fixe les كفاءات, pas les nombres » ; indépendance du manuel, CLAUDE.md) :
 * `part: REWRITE` marque un bloc réécrit en nombres de la plateforme. Les modules rendent ces données ; ils n'en réécrivent aucune.
 *
 * Le تحدّ (challenge) et l'encadré الخوارزمي (history-khwarizmi) de la page d'ouverture de l'unité sont DUPLIQUÉS ici (destinations ›
 * duplicatedIn › jidaa-maadum, module 3) ; le تحدّ est reposé sur l'équation d'al-Khwārizmī x² + 10x = 39 (carré 5 × 5, x positif), jamais sur
 * le carré 6 × 6 ni l'aire 36 de la مسألة.
 */
import { src, addition } from '../../_unit/unitMeta.js';

const REWRITE = 'بأعداد المنصّة';
const S = (id, page, section, number) => ({ ...src(id, page, section, number), part: REWRITE });

/** نشاط 2 (p. 44), partie « الجداء المعدوم ». */
export const ACTIVITY_A = {
  source: S('act-2a', 44, 'أنشطة', 2),
  title: 'خاصية الجداء المعدوم',
  questions: [
    'الجداء المعدوم: انقل وأكمل كلًّا مما يلي، فكل جداء منها يساوي $0$ .',
    'عددان $a$ و $b$ جداؤهما $a \\times b = 0$ . إذن $a = \\ldots$ أو $b = \\ldots$ .',
    'عبّر بكلماتك عن الخاصية السابقة، وتُسمّى خاصية الجداء المعدوم.',
  ],
  // Les quatre produits de l'étape 2 : le facteur connu (`shown`), sa place, l'opposé en leurre (`wrong`).
  products: [
    { shown: '8', missing: 'right', wrong: '-8' },
    { shown: '(-11)', missing: 'left', wrong: '11' },
    { shown: '-\\dfrac{5}{4}', missing: 'right', wrong: '\\dfrac{5}{4}' },
    { shown: '\\sqrt{7}', missing: 'left', wrong: '-\\sqrt{7}' },
  ],
  // La phrase de la propriété, dans les mots de la plateforme (c'est aussi celle de معارف 2).
  statement: 'إذا كان جداء عددين معدومًا فأحدهما على الأقل معدوم.',
};

/** نشاط 2 (p. 44), « تطبيق أ » — حل معادلة من الشكل (ax + b)(cx + d) = 0, en nombres de la plateforme. */
export const ACTIVITY = {
  source: S('act-2b', 44, 'أنشطة', 2),
  title: 'حل معادلة من الشكل $(ax + b)(cx + d) = 0$',
  // Les deux cahiers (حاتم et بسّام), ligne à ligne : la même équation 2(x − 3) = 0, deux chemins.
  hatim: ['$2(x - 3) = 0$', '$2x - 6 = 0$', '$2x = 6$', 'ومنه $x = 3$'],
  bassam: ['$2(x - 3) = 0$', '$x - 3 = 0$ بما أنّ $2 \\neq 0$', 'ومنه $x = 3$'],
  questions: [
    'لاحظ عمل حاتم وبسّام لحلّ المعادلة $2(x - 3) = 0$ ، وحدّد أيّهما استعمل خاصية الجداء المعدوم، واشرح طريقة الآخر.',
    'حل المعادلة $-1{,}5(2x + 5) = 0$ بالطريقة التي استعملها حاتم، ثم بطريقة بسّام.',
    'حل المعادلة $(x - 1)(x + 4) = 0$ .',
  ],
  // Les nombres de la plateforme : les labs de la page les reçoivent, les questions les lisent.
  numbers: { beginner: '2|x-3', advanced: 'x-1|x+4' },
  q3note: 'بنشر الجداء نحصل على $x^2 + 3x - 4 = 0$ : ليست معادلة من الدرجة الأولى.',
};

/**
 * L'ACCROCHE — une expérience de la PLATEFORME : le monde est le terrain de football de l'unité 3 (« un produit de deux sommes est l'aire d'un
 * rectangle de côtés ces sommes »). Ici les deux CÔTÉS sont les deux FACTEURS, et l'aire est leur produit. Déclarée, jamais cachée.
 */
export const HOOK = {
  source: addition('interaction_generation'),
  headline: 'متى يختفي الملعب؟',
  text: 'يرسم مدرّب الحيّ، وهو يؤطّر أطفال الحيّ تطوّعًا، ملعب تدريب مستطيلًا، طولا ضلعيه يتعلّقان بعدد $x$ : ضلع طوله $x - 1$ وضلع طوله $x + 4$. مساحة الملعب هي جداء الضلعين $(x - 1)(x + 4)$. حرّك $x$ : متى يصير الملعب خطًّا، أي متى تنعدم مساحته؟',
};

/** نشاط 2 (p. 44), « تطبيق ب » — المعادلة (E), en nombres de la plateforme. */
export const ACTIVITY_C = {
  source: S('act-2c', 44, 'أنشطة', 2),
  title: 'حل معادلة تؤول إلى الشكل $(ax + b)(cx + d) = 0$',
  text: 'إليك المعادلة (E): $(1 - 2x)(x - 5) + 6(x - 5) = 0$ .',
  questions: [
    'تحقّق من أنّ $(1 - 2x)(x - 5) + 6(x - 5) = (x - 5)(7 - 2x)$ .',
    'حل المعادلة (E).',
  ],
};

/** معارف 2 (p. 46) — « معادلات جداء معدوم », dans les mots de la plateforme. */
export const KNOWLEDGE = {
  source: S('know-2', 46, 'معارف', 2),
  title: 'معادلات جداء معدوم',
  definition: 'كل معادلة طرفها الأول جداء عاملين من الدرجة الأولى وطرفها الثاني $0$ ، أي من الشكل $(ax + b)(cx + d) = 0$ حيث $a$ ، $b$ ، $c$ و $d$ أعداد معلومة، تُسمّى معادلة جداء معدوم.',
  propertyTitle: 'خاصية الجداء المعدوم',
  property: [
    'جداء عاملين لا ينعدم إلا إذا انعدم أحدهما على الأقل.',
    'أي: إذا كان $a \\times b = 0$ فإنّ $a = 0$ أو $b = 0$ .',
  ],
  note: 'بهذه الخاصية نحوّل معادلة جداء معدوم إلى معادلتين من الدرجة الأولى.',
  solutions: 'حلول المعادلة $(ax + b)(cx + d) = 0$ هي حلول المعادلتين $ax + b = 0$ و $cx + d = 0$ .',
  examples: [
    'مثال: $(2x - 3)(x + 1) = 0$ معادلة جداء معدوم.',
    'مثال: $5x = 0$ يعني $x = 0$ لأنّ $5 \\neq 0$ .',
    'مثال محلول: نحل المعادلة $(2x - 3)(x + 1) = 0$ .',
  ],
  // المثال المحلول, ligne à ligne (révélé par MethodSteps).
  example3: [
    '$(2x - 3)(x + 1) = 0$ يعني $2x - 3 = 0$ أو $x + 1 = 0$ .',
    '$2x - 3 = 0$ يعني $2x = 3$ أي $x = \\dfrac{3}{2}$ .',
    '$x + 1 = 0$ يعني $x = -1$ .',
    'إذن للمعادلة $(2x - 3)(x + 1) = 0$ حلّان هما $-1$ و $\\dfrac{3}{2}$ .',
  ],
  example3Expr: '2x-3|x+1',
};

/** طرائق p. 47 — « حل معادلة من الشكل (ax + b)(cx + d) = 0 », en nombres de la plateforme. */
export const METHOD = {
  source: S('method-zero-product', 47, 'طرائق'),
  title: 'حل معادلة من الشكل $(ax + b)(cx + d) = 0$',
  exercise: 'لتكن العبارة $G = (3x + 4)(x - 2) - 2(x - 2)$ . 1) حلّل العبارة G إلى جداء عاملين من الدرجة الأولى. 2) حل المعادلة $(3x + 4)(x - 2) - 2(x - 2) = 0$ .',
  solution: [
    '1) لاحظ: العامل المشترك للحدّين $(3x + 4)(x - 2)$ و $2(x - 2)$ هو $(x - 2)$ . إذن $G = (x - 2)[(3x + 4) - 2]$ ومنه $G = (x - 2)(3x + 2)$',
    '2) ممّا سبق نستنتج أنّ حل المعادلة $(3x + 4)(x - 2) - 2(x - 2) = 0$ يؤول إلى حل المعادلة $(x - 2)(3x + 2) = 0$ .',
    'ينتج من المعادلة $(x - 2)(3x + 2) = 0$ أنّ: $x - 2 = 0$ أو $3x + 2 = 0$ . أي $x = 2$ أو $x = -\\dfrac{2}{3}$ .',
    'إذن للمعادلة $(3x + 4)(x - 2) - 2(x - 2) = 0$ حلّان هما: $-\\dfrac{2}{3}$ و $2$',
  ],
  // Les deux temps de la solution, nommés (la plateforme ne fait que les titrer).
  steps: {
    source: addition('interaction_generation'),
    lines: [
      'نحلّل الطرف الأول إلى جداء عاملين من الدرجة الأولى (عامل مشترك أو متطابقة شهيرة).',
      'نطبّق خاصية الجداء المعدوم: نحلّ المعادلتين من الدرجة الأولى، وحلولهما هي حلول المعادلة.',
    ],
  },
};

/**
 * Le تحدّ de la page d'ouverture, posé sur l'équation d'al-Khwārizmī x² + 10x = 39 : un grand carré de côté x + 5 (un carré x × x, deux
 * rectangles x × 5 et un carré 5 × 5). x est un nombre POSITIF (dit dans l'énoncé : la question ne demande que la racine positive).
 */
export const CHALLENGE = {
  source: S('challenge', 43, 'تحدّ'),
  text: 'مربّع كبير ضلعه $x + 5$ مقسّم إلى مربّع ضلعه $x$ ، ومستطيلين بعدا كل منهما $x$ و $5$ ، ومربّع صغير ضلعه $5$ . علمًا أنّ $x$ عدد موجب وأنّ $x^2 + 10x = 39$ ، عيّن $x$ .',
  figure: 'مربّع ABCD مقسّم إلى المربّع AEGF (ضلعه $x$)، والمستطيلين EBHG و FGKD (بعدا كل منهما $x$ و 5)، والمربّع GHCK (ضلعه 5) ؛ $EB = 5$ و $FD = 5$.',
  side: 5,
  rhs: 39,
};

/** Le الخوارزمي — dupliqué depuis la page de l'unité, dans les mots de la plateforme. */
export const KHWARIZMI = {
  source: S('history-khwarizmi', 43, 'الخوارزمي'),
  caption: 'الخوارزمي (780م-850م)',
  quote: 'من «كتاب الجبر والمقابلة» للخوارزمي مثال: «مال وواحد وعشرون من العدد يعدل عشرة أجذاره» ، أي بالرموز الحالية $x^2 + 21 = 10x$ . وقد استخرج له جذرين: 3 و 7.',
  kinds: 'قسّم الخوارزمي ما يحتاجه الجبر إلى ثلاثة أنواع: الجذر $x$ ، والمال $x^2$ ، والمفرد وهو العدد الخالي من $x$ .',
};

/** Ligne discrète sur l'exercice 19 : p = 14(x + 7) n'est le produit que d'un nombre et d'un facteur du premier degré. */
export const EX19_NOTE = {
  source: addition('interaction_generation'),
  text: 'ملاحظة: هنا $p = 14(x + 7)$ ، جداء العدد 14 والعامل $(x + 7)$ من الدرجة الأولى. العامل 14 لا ينعدم، فللمعادلة $p = 0$ حلّ واحد.',
};

/**
 * « أؤكّد تعلّماتي » (p. 52) — les items 3 et 4 (destinations › qcm › duplicatedIn › jidaa-maadum, module 8) : l'إختبار أولي, réécrits en
 * nombres de la plateforme (verdict X1) ; `id`, `skill` et `learningPointIds` des épreuves ne changent pas.
 */
const QCM_SRC = (n) => S('qcm', 52, 'أؤكّد تعلّماتي', n);
export const QCM = {
  3: { n: 3, source: QCM_SRC(3), text: 'المعادلة $(x - 5)(3x + 6) = 0$ تقبل...', options: ['حلًّا واحدًا هو $5$', 'حلًّا واحدًا هو $-2$', 'حلّين هما $5$ و $-2$'], correct: 2,
    explain: '$(x - 5)(3x + 6) = 0$ يعني $x - 5 = 0$ أو $3x + 6 = 0$ ، أي $x = 5$ أو $x = -2$ : حلّان.' },
  4: { n: 4, source: QCM_SRC(4), text: 'المعادلة $4x^2 - 25 = 0$ تقبل ...', options: ['حلّين هما $\\dfrac{5}{2}$ و $-\\dfrac{5}{2}$', 'حلًّا واحدًا هو $\\dfrac{5}{2}$', 'حلّين هما $\\dfrac{5}{4}$ و $-\\dfrac{5}{4}$'], correct: 0,
    explain: '$4x^2 - 25 = (2x - 5)(2x + 5)$ ، و $(2x - 5)(2x + 5) = 0$ يعني $x = \\dfrac{5}{2}$ أو $x = -\\dfrac{5}{2}$ .' },
};

/** « أستعدّ » : les dix affirmations de la plateforme (content/prep.js) ; les neuf énoncés d'avant ne sont plus joués (rollout 2026-11-11). */
export { PREP_LADDER as PREP_ITEMS } from './prep.js';

/**
 * حاتم وبسّام — les corrections que le module 1 écrit (étape 3 et 5), réunies ici pour que la carte les cite telles quelles.
 */
export const NOTEBOOKS = {
  source: addition('interaction_generation'),
  hatimMethod: 'حاتم لم يستعمل الخاصية: نشر $2(x - 3)$ فحصل على معادلة من الدرجة الأولى $2x - 6 = 0$ ثم حلّها.',
  bassamMethod: 'بسّام استعمل خاصية الجداء المعدوم: بما أنّ $2 \\neq 0$ فإنّ العامل الآخر معدوم، $x - 3 = 0$ .',
  expandFails: 'نشر $(x - 1)(x + 4)$ لا يوصلنا إلى معادلة من الدرجة الأولى، أمّا خاصية الجداء المعدوم فتعطي معادلتين من الدرجة الأولى: $x - 1 = 0$ أو $x + 4 = 0$ ، أي $x = 1$ أو $x = -4$ .',
};
