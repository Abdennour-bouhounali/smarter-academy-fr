/**
 * Le contenu du درس « جمع وطرح كسرين » (2AM, unité 2) — données pures. Le manuel (docs/sources/2am/unit2/extraction.json) est la RÉFÉRENCE des الكفاءات, pas le script : les nombres,
 * les contextes et les mots sont ceux de la plateforme ; chaque bloc cite l'élément dont il reprend l'IDÉE (`src(<id>)`), et ce qui n'en vient pas est un ajout DÉCLARÉ
 * (`addition(<raison>)`). Les modules rendent ces données ; ils n'en réécrivent aucune. (Les deux coquilles du manuel — 5/12 + 1/4 imprimé pour 5/12 + 11/4, « 34/21 » pour 24/21 —
 * ne sont jamais montrées : les exemples sont ceux de la plateforme.)
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Le labo `trail-odometer` : l'entrée de la plateforme. */
export const LAB = {
  source: addition('interaction_generation'),
  /** Le labo de « معارف » : 3/8 + 1/4 sur un sentier de 8 postes. */
  maarif: { n: 8, k: 2, legs: ['3/8', '1/4'], sum: '5/8' },
};

/** « تذكّر » — deux rappels avec le lien de leur leçon PUBLIÉE, et la phrase de renvoi (sans lien : la comparaison est une leçon suivante). */
export const RECALLS = {
  decimal: {
    source: addition('prior_year_reminder'), lesson: 'kusur-ashriya-kitaba', title: 'تذكّر — السنة الأولى متوسط',
    text: 'في الكسور العشرية نكتب الأعشار أجزاءً من مئة قبل أن نجمع: $\\frac{3}{10}+\\frac{5}{100}=\\frac{30}{100}+\\frac{5}{100}=\\frac{35}{100}$ ؛ فالأعشار مضاعفات للأجزاء من مئة.',
  },
  equal: {
    source: addition('prior_year_reminder'), lesson: 'ikhtizal-kitaba-kasriya', title: 'تذكّر — كتابات كسرية متساوية',
    text: 'لا يتغيّر الكسر إذا ضربنا بسطه ومقامه في العدد نفسه غير المعدوم: $\\frac{a}{b}=\\frac{a\\times k}{b\\times k}$ ، فمثلًا $\\frac{3}{4}=\\frac{9}{12}$ ؛ وتختزل الكسر بقسمة الحدّين على قاسم مشترك.',
  },
  /** La comparaison de deux fractions (renvoi en avant, plan §2) : leçon `muqarana-kasrayn` PUBLIÉE 2026-10-29, rappelée avec son lien, jamais reconstruite. */
  compare: {
    source: addition('prior_year_reminder'), lesson: 'muqarana-kasrayn', title: 'تذكّر — مقارنة كسرين لهما نفس المقام',
    text: 'بين كسرين لهما نفس المقام، الأكبر هو صاحب البسط الأكبر: $\\frac{5}{9}<\\frac{7}{9}$ . والمقارنة كاملة في درس مقارنة كسرين.',
  },
};

/** معارف — les règles (idée de know-2a, know-2b ; mots et exemples de la plateforme). */
export const KNOWLEDGE = {
  same: {
    source: src('know-2a', 28, 'معارف', 2),
    text: 'لجمع (أو طرح) كسرين لهما نفس المقام، أيًّا كان هذا المقام، نجمع (أو نطرح) البسطين ونحافظ على المقام المشترك: $\\frac{a}{c}+\\frac{b}{c}=\\frac{a+b}{c}$ و $\\frac{a}{c}-\\frac{b}{c}=\\frac{a-b}{c}$ .',
    example: '$\\frac{4}{9}+\\frac{2}{9}=\\frac{6}{9}=\\frac{2}{3}$ ، و $\\frac{3{,}5}{6}-\\frac{1{,}5}{6}=\\frac{2}{6}=\\frac{1}{3}$ : البسطان قد يكونان عشريين.',
  },
  multiple: {
    source: src('know-2b', 28, 'معارف', 2),
    text: 'إذا كان مقام أحد الكسرين مضاعفًا لمقام الآخر، كتبنا الكسر الآخر بالمقام الأكبر بضرب حدّيه في العدد نفسه، ثم جمعنا (أو طرحنا) البسطين وحافظنا على المقام، ثم اختزلنا الناتج.',
    example: '$\\frac{11}{18}-\\frac{1}{6}=\\frac{11}{18}-\\frac{3}{18}=\\frac{8}{18}=\\frac{4}{9}$ ، لأنّ $18=6\\times 3$ .',
  },
  rest: {
    source: addition('interaction_generation'),
    text: 'الجزء الباقي من الكلّ بعد أخذ كسر منه نجده بطرح هذا الكسر من $1$ ، ونكتب $1$ بمقام الكسر: $1-\\frac{3}{8}=\\frac{8}{8}-\\frac{3}{8}=\\frac{5}{8}$ ؛ وإذا أخذنا جزأين طرحنا مجموعهما.',
  },
  natural: {
    source: src('prep', 23, 'أستعدّ', 8),
    text: 'لجمع عدد طبيعي مع كسر نكتب العدد الطبيعي كسرًا بمقام الكسر: $2+\\frac{5}{6}=\\frac{12}{6}+\\frac{5}{6}=\\frac{17}{6}$ .',
  },
};

/** طريقة — الكسران ومقام أحدهما مضاعف لمقام الآخر (idée de method-3 ; nombres de la plateforme). */
export const METHOD = {
  source: src('method-3', 29, 'طرائق', 3),
  exercise: 'احسب $\\frac{7}{15}+\\frac{2}{5}$ ثم $\\frac{11}{6}-\\frac{2}{3}$ ثم $2+\\frac{3}{8}$ ثم $\\frac{4}{9}+\\frac{5}{18}+\\frac{1}{6}$ .',
  solution: [
    'هل $15$ مضاعف لـ $5$ ؟ نعم: $15=5\\times 3$ ، فنضرب حدّي $\\frac{2}{5}$ في $3$ : $\\frac{7}{15}+\\frac{2}{5}=\\frac{7}{15}+\\frac{6}{15}=\\frac{13}{15}$ .',
    '$6=3\\times 2$ : $\\frac{11}{6}-\\frac{2}{3}=\\frac{11}{6}-\\frac{4}{6}=\\frac{7}{6}$ .',
    'نكتب $2$ بمقام $8$ : $2+\\frac{3}{8}=\\frac{16}{8}+\\frac{3}{8}=\\frac{19}{8}$ .',
    '$18$ مضاعف لـ $9$ ولـ $6$ معًا: $\\frac{4}{9}+\\frac{5}{18}+\\frac{1}{6}=\\frac{8}{18}+\\frac{5}{18}+\\frac{3}{18}=\\frac{16}{18}=\\frac{8}{9}$ .',
  ],
  rule: 'نختار المقام الأكبر إذا كان مضاعفًا لكلّ المقامات الأخرى، نحوّل الكسور الأخرى إليه بضرب حدّي كلّ منها في العدد نفسه، نجمع (أو نطرح) البسطين ونحافظ على المقام، ثمّ نختزل.',
  numbers: { a: '7/15', b: '2/5', sum: '13/15' },
};

/** « أستعدّ » — l'item 8 de p. 23 (réécrit) ; les autres affirmations sont celles de la plateforme sur `1am.m5.r03` (la somme de fractions décimales), les écritures égales et le renvoi `2am.m1.r08`. */
export const PREP_ITEMS = [
  { n: 8, skill: 'natural', text: 'العدد $3+\\frac{4}{7}$ يساوي $\\frac{25}{7}$ .', answer: true, why: '$3=\\frac{21}{7}$ ، و $\\frac{21}{7}+\\frac{4}{7}=\\frac{25}{7}$ .' },
].map((it) => ({ ...it, source: src('prep', 23, 'أستعدّ', it.n) }));

export const PREP_PLATFORM_ITEMS = [
  { skill: 'decimal', text: '$\\frac{3}{10}+\\frac{45}{100}=\\frac{75}{100}$ .', answer: true, why: '$\\frac{3}{10}=\\frac{30}{100}$ و $30+45=75$ .' },
  { skill: 'decimal', text: '$\\frac{7}{10}-\\frac{25}{100}=\\frac{45}{100}$ .', answer: true, why: '$\\frac{7}{10}=\\frac{70}{100}$ و $70-25=45$ .' },
  { skill: 'equal', text: '$\\frac{3}{4}=\\frac{9}{12}$ .', answer: true, why: 'نضرب البسط والمقام في $3$ : $\\frac{3\\times 3}{4\\times 3}=\\frac{9}{12}$ .' },
  { skill: 'compare', text: '$\\frac{5}{9}<\\frac{7}{9}$ .', answer: true, why: 'للكسرين المقام نفسه، الأكبر هو صاحب البسط الأكبر: $5<7$ .' },
  { skill: 'compare', text: '$\\frac{11}{15}>\\frac{13}{15}$ .', answer: false, why: '$11<13$ : $\\frac{11}{15}<\\frac{13}{15}$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  sameOnly: 'لا نجمع إلا أجزاء من الحجم نفسه: خمسة أعمدة بيضاء وأربعة أعمدة بيضاء تعطي تسعة أعمدة بيضاء، فالمقام $12$ لا يتغيّر.',
  redToWhite: 'ربع المسلك ثلاثة أعمدة بيضاء: $\\frac{1}{4}=\\frac{3}{12}$ ، فنضيف $\\frac{5}{12}+\\frac{3}{12}=\\frac{8}{12}=\\frac{2}{3}$ .',
  across: { wrong: '$\\frac{5}{12}+\\frac{1}{4}=\\frac{6}{16}$ لأنّ $5+1=6$ و $12+4=16$ .', why: 'الراية $\\frac{6}{16}$ تقع قبل نهاية مرحلة الصباح وحدها، والفوج مشى أكثر منها.', right: 'نكتب الكسرين بنفس المقام أوّلًا ثم نجمع البسطين فقط.' },
  rest: 'الباقي إلى العين هو الكلّ ناقص ما مُشي: $1-\\frac{2}{3}=\\frac{1}{3}$ .',
  back: 'العودة تطرح مثلما يجمع المشي: $\\frac{3}{4}-\\frac{5}{12}=\\frac{9}{12}-\\frac{5}{12}=\\frac{4}{12}=\\frac{1}{3}$ .',
  loop: 'الدورة الكاملة هي $1=\\frac{6}{6}$ ، ثم نضيف $\\frac{5}{6}$ : $1+\\frac{5}{6}=\\frac{11}{6}$ ، وليس $\\frac{6}{6}$ .',
};

/** مسألة الدرس — مكتبة القسم (module 5). */
export const LIBRARY = { stories: '2/5', science: '3/10', both: '7/10', history: '3/10', twenty: ['14/20', '6/20'] };
/** مسألة 2 — جني الزيتون (module 6). */
export const OLIVES = { day1: '1/4', day2: '3/8', both: '5/8', rest: '3/8' };
/** مسألة 3 — خزّان المدرسة (module 7). */
export const TANK = { morning: '5/12', evening: '1/3', night: '1/12', used: '9/12', left: '1/4', next: '4/12' };
