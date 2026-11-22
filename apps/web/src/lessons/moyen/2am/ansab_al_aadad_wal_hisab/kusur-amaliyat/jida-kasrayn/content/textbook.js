/**
 * Le contenu du درس « جداء كسرين » (2AM, unité 2) — données pures. Le manuel (docs/sources/2am/unit2/extraction.json) est la RÉFÉRENCE des الكفاءات, pas le script : les nombres,
 * les contextes et les mots sont ceux de la plateforme ; chaque bloc cite l'élément dont il reprend l'IDÉE (`src(<id>)`), et ce qui n'en vient pas est un ajout DÉCLARÉ
 * (`addition(<raison>)`). Les modules rendent ces données ; ils n'en réécrivent aucune.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Le labo `window-blinds` : l'entrée de la plateforme. */
export const LAB = {
  source: addition('interaction_generation'),
  /** Le labo de « معارف » : 3/4 × 2/5 sur une fenêtre à 4 crans de rail et 5 crans de cordon. */
  maarif: { curtain: '3/4', blind: '2/5', product: '6/20', reduced: '3/10' },
};

/** « تذكّر » — le rappel de la 1re année (lien de sa leçon PUBLIÉE), celui de « كسر من عدد » (leçon PRÉVUE de 1AM : jamais de lien) et celui du quotient (lien). */
export const RECALLS = {
  decimal: {
    source: addition('prior_year_reminder'), lesson: 'kusur-ashriya-kitaba', title: 'تذكّر — السنة الأولى متوسط',
    text: 'في الكسور العشرية نضرب الأعشار في الأعشار فنجد أجزاءً من مئة: $0{,}3\\times 0{,}7=\\frac{3}{10}\\times\\frac{7}{10}=\\frac{21}{100}=0{,}21$ . سنعمّم ذلك على أيّ مقامين، لا على $10$ و $100$ فقط.',
  },
  ofNumber: {
    source: addition('prior_year_reminder'), title: 'تذكّر — أخذ كسر من عدد',
    text: 'ثلاثة أرباع $20$ تلميذًا هي $15$ تلميذًا: نقسم $20$ على $4$ ثم نضرب في $3$ . سنكتب ذلك الآن بعملية ضرب واحدة.',
  },
  quotient: {
    source: addition('prior_year_reminder'), lesson: 'hasil-qisma-kasr', title: 'تذكّر — السنة الأولى: الكسر حاصل قسمة',
    text: 'العدد $b\\times\\frac{a}{b}$ يساوي $a$ ، فمثلًا $7\\times\\frac{3}{7}=3$ ؛ والكسر $\\frac{a}{b}$ هو $a\\div b$ .',
  },
};

/** معارف — les règles (idée de know-2c ; mots et exemples de la plateforme). */
export const KNOWLEDGE = {
  product: {
    source: src('know-2c', 28, 'معارف', 2),
    text: 'لحساب جداء كسرين نضرب البسطين فيما بينهما ونضرب المقامين فيما بينهما: $\\frac{a}{b}\\times\\frac{c}{d}=\\frac{a\\times c}{b\\times d}$ ، ثم نختزل الناتج إن أمكن.',
    example: '$\\frac{2}{3}\\times\\frac{5}{7}=\\frac{2\\times 5}{3\\times 7}=\\frac{10}{21}$ ، و $\\frac{2}{9}\\times\\frac{3}{4}=\\frac{6}{36}=\\frac{1}{6}$ .',
  },
  natural: {
    source: src('know-2c', 28, 'معارف', 2),
    text: 'لضرب عدد طبيعي في كسر نكتب العدد الطبيعي على المقام $1$ : $n\\times\\frac{a}{b}=\\frac{n\\times a}{b}$ ، فنضرب في البسط ونحتفظ بالمقام.',
    example: '$4\\times\\frac{3}{11}=\\frac{4\\times 3}{11}=\\frac{12}{11}$ ، و $2\\times\\frac{3}{5}=\\frac{6}{5}$ .',
  },
  decimal: {
    source: src('know-2c', 28, 'معارف', 2),
    text: 'وإذا كان العامل عددًا عشريًا ضربناه في البسط كما هو: $\\frac{5}{7}\\times 2{,}8=\\frac{5\\times 2{,}8}{7}=\\frac{14}{7}=2$ .',
  },
  of: {
    source: src('method-4', 29, 'طرائق', 4),
    text: 'كلمة «من» بعد كسر تعني الضرب: $\\frac{a}{b}$ من $x$ هو $\\frac{a}{b}\\times x$ ، سواء كان $x$ عددًا أم كسرًا.',
    example: '$\\frac{3}{8}$ من $48$ هو $\\frac{3}{8}\\times 48=18$ ، و $\\frac{3}{4}$ من $\\frac{2}{5}$ هو $\\frac{3}{4}\\times\\frac{2}{5}=\\frac{3}{10}$ .',
  },
  rest: {
    source: addition('interaction_generation'),
    text: 'كسر من «الباقي» نأخذه من الباقي لا من الكلّ: بعد صرف $\\frac{1}{4}$ يبقى $\\frac{3}{4}$ ، و $\\frac{2}{3}$ من الباقي هو $\\frac{2}{3}\\times\\frac{3}{4}=\\frac{1}{2}$ من الكلّ.',
  },
};

/** طريقة — كسر من عدد، كسر من كسر، عدد عشري × كسر (idée de method-4 ; nombres de la plateforme). */
export const METHOD = {
  source: src('method-4', 29, 'طرائق', 4),
  exercise: 'احسب $\\frac{3}{8}$ من $48$ ، ثم $\\frac{2}{3}$ من $\\frac{3}{8}$ ، ثم $\\frac{5}{7}\\times 2{,}8$ .',
  solution: [
    '«من» تعني الضرب: $\\frac{3}{8}$ من $48$ هو $48\\times\\frac{3}{8}=\\frac{48\\times 3}{8}=\\frac{144}{8}=18$ . ويمكن أيضًا أن نقسم $48$ على $8$ ثم نضرب في $3$ : $48\\div 8\\times 3=18$ .',
    '$\\frac{2}{3}$ من $\\frac{3}{8}$ هو $\\frac{2}{3}\\times\\frac{3}{8}=\\frac{6}{24}=\\frac{1}{4}$ ، ثم نختزل بقسمة الحدّين على $6$ .',
    'العامل عشري: $\\frac{5}{7}\\times 2{,}8=\\frac{5\\times 2{,}8}{7}=\\frac{14}{7}=2$ .',
  ],
  rule: 'نترجم «كسر من ...» إلى ضرب ثم نضرب البسطين معًا والمقامين معًا ونختزل؛ وإذا كان أحد العاملين عددًا ضربناه في البسط.',
  numbers: { of: '3/8', x: 48, ofResult: 18, ofFraction: '2/3', ofFractionOf: '3/8', ofFractionResult: '1/4' },
};

/** « أستعدّ » — six affirmations de la plateforme sur les items du réseau que la leçon suppose : `1am.m5.r03` (items 1 et 2), le quotient (3), l'aire d'un rectangle (4), « كسر من عدد » (5) et « الباقي » (6). */
export const PREP_ITEMS = [];

export const PREP_PLATFORM_ITEMS = [
  { skill: 'decimal', text: '$\\frac{3}{10}\\times\\frac{2}{10}=\\frac{6}{100}$ .', answer: true, why: 'نضرب البسطين $3\\times 2=6$ والمقامين $10\\times 10=100$ .' },
  { skill: 'decimal', text: '$4\\times 0{,}25=0{,}1$ .', answer: false, why: '$4\\times 0{,}25=1$ : أربعة أرباع تساوي الواحد.' },
  { skill: 'quotient', text: '$7\\times\\frac{3}{7}=3$ .', answer: true, why: 'سبعة أسباع الثلاثة تساوي $3$ : $b\\times\\frac{a}{b}=a$ .' },
  { skill: 'area', text: 'مساحة مستطيل طوله $3$ cm وعرضه $2{,}5$ cm هي $7{,}5$ cm² .', answer: true, why: 'المساحة هي الطول × العرض: $3\\times 2{,}5=7{,}5$ .' },
  { skill: 'ofNumber', text: '«$\\frac{3}{4}$ من $20$ تلميذًا هو $15$ تلميذًا» .', answer: true, why: '$20\\div 4=5$ ثم $5\\times 3=15$ .' },
  { skill: 'rest', text: '$1-\\frac{3}{8}=\\frac{5}{8}$ .', answer: true, why: '$1=\\frac{8}{8}$ ، و $\\frac{8}{8}-\\frac{3}{8}=\\frac{5}{8}$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  panes: 'الظلّان قسّما النافذة إلى مربّعات صغيرة متساوية: $3$ أعمدة و $4$ صفوف، أي $3\\times 4=12$ مربّعًا؛ والركن المظلم مرّتين عمودان وثلاثة صفوف، أي $2\\times 3=6$ مربّعات.',
  product: '$\\frac{2}{3}\\times\\frac{3}{4}=\\frac{2\\times 3}{3\\times 4}=\\frac{6}{12}=\\frac{1}{2}$ : نضرب البسطين ونضرب المقامين.',
  sumWrong: { wrong: '$\\frac{2}{3}+\\frac{3}{4}=\\frac{17}{12}$ ، فيظنّ بعضهم أنّه الجزء المظلم مرّتين.', why: '$\\frac{17}{12}$ أكبر من النافذة كلّها، والجزء المظلم مرّتين جزء منها.', right: 'الجزء من الجزء ضرب: نضرب البسطين ونضرب المقامين.' },
  of: '«$\\frac{3}{4}$ من $\\frac{2}{3}$ النافذة» هو الركن الذي يغطّيه ثلاثة أرباع ارتفاع الستارة الجانبية: $\\frac{3}{4}\\times\\frac{2}{3}=\\frac{1}{2}$ .',
  big: 'قد يكون الجداء أكبر من $1$ إذا كان العاملان أكبر من $1$ : $\\frac{7}{4}\\times\\frac{4}{3}=\\frac{28}{12}=\\frac{7}{3}$ نافذة.',
  natural: 'ستارة تغطّي نافذتين كاملتين ودوّارة تغطّي $\\frac{3}{5}$ نافذة: ركنان من $\\frac{3}{5}$ ، أي $2\\times\\frac{3}{5}=\\frac{6}{5}$ .',
};

/** مسألة الدرس — تعاونية البرتقال (module 5). */
export const COOP = { sold1: '1/4', rest1: '3/4', second: '2/3', secondOfAll: '1/2', soldAll: '3/4', left: '1/4', crop: 2400, leftKg: 600 };
/** مسألة 2 — رحلة العائلة (module 6). */
export const TRIP = { first: '1/3', rest1: '2/3', secondOfAll: '1/3', used: '2/3', left: '1/3', tank: 45, leftL: 15 };
/** مسألة 3 — ورود الحديقة (module 7). */
export const GARDEN = { length: 18, width: 12, fl: '2/3', fw: '3/4', fraction: '1/2', area: 216, roses: 108, rl: 12, rw: 9 };
