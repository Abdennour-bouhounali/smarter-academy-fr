/**
 * Le contenu du درس « مقارنة كسرين » (2AM, unité 2) — données pures. Le manuel (docs/sources/2am/unit2/extraction.json) est la RÉFÉRENCE des الكفاءات, pas le script : les nombres,
 * les contextes et les mots sont ceux de la plateforme ; chaque bloc cite l'élément dont il reprend l'IDÉE (`src(<id>)`), et ce qui n'en vient pas est un ajout DÉCLARÉ
 * (`addition(<raison>)`). Les modules rendent ces données ; ils n'en réécrivent aucune.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Le labo `level-laser` : l'entrée de la plateforme. */
export const LAB = {
  source: addition('interaction_generation'),
  /** Le labo de « معارف » : 2/3 | 5/6 (tubes en tiers et en sixièmes). */
  maarif: { left: '2/3', right: '5/6', rewritten: '4/6' },
};

/** « تذكّر » — trois rappels, chacun avec le lien de sa leçon PUBLIÉE. */
export const RECALLS = {
  equal: {
    source: addition('prior_year_reminder'), lesson: 'ikhtizal-kitaba-kasriya', title: 'تذكّر — السنة الأولى: كتابات كسرية متساوية',
    text: 'ضرب حدّي كسر في العدد نفسه لا يغيّر قيمته: $\\frac{3}{4}=\\frac{3\\times 3}{4\\times 3}=\\frac{9}{12}$ . سنستعمل ذلك لنقرأ الارتفاع نفسه في أنبوبين مدرّجين بشكلين مختلفين.',
  },
  quotient: {
    source: addition('prior_year_reminder'), lesson: 'hasil-qisma-kasr', title: 'تذكّر — السنة الأولى: الكسر حاصل قسمة',
    text: 'الكسر $\\frac{a}{b}$ هو $a\\div b$ : $6\\div 8=\\frac{6}{8}$ . وحين يُقسَّم العدد نفسه على أجزاء أكثر تصغر الحصّة.',
  },
  unify: {
    source: addition('prior_year_reminder'), lesson: 'jam-tarh-kusur', title: 'تذكّر — توحيد المقامات',
    text: 'لجمع كسرين مقام أحدهما مضاعف لمقام الآخر كتبناهما بنفس المقام: $\\frac{5}{12}+\\frac{1}{4}=\\frac{5}{12}+\\frac{3}{12}$ . سنفعل الشيء نفسه لنقارن، ثم نقارن البسطين.',
  },
};

/** معارف — les quatre règles (idée de know-3a…3c et method-5 ; mots et exemples de la plateforme). */
export const KNOWLEDGE = {
  sameDen: {
    source: src('know-3b', 28, 'معارف', 3),
    text: 'إذا كان لكسرين نفس المقام فأكبرهما هو الذي له أكبر بسط، ولو كان البسطان عشريين.',
    example: '$\\frac{4}{11}<\\frac{9}{11}$ لأنّ $4<9$ ، و $\\frac{7{,}1}{6}>\\frac{7}{6}$ لأنّ $7{,}1>7$ .',
  },
  sameNum: {
    source: src('know-3a', 28, 'معارف', 3),
    text: 'إذا كان لكسرين نفس البسط فأكبرهما هو الذي له أصغر مقام: أجزاؤه أقلّ فهي أكبر.',
    example: '$\\frac{7}{9}>\\frac{7}{12}$ لأنّ $9<12$ .',
  },
  multiple: {
    source: src('know-3c', 28, 'معارف', 3),
    text: 'إذا كان مقام أحد الكسرين مضاعفًا لمقام الآخر كتبنا الكسرين بنفس المقام، ثم قارنّا البسطين الجديدين.',
    example: '$\\frac{3}{5}=\\frac{3\\times 4}{5\\times 4}=\\frac{12}{20}$ و $12>11$ ، إذن $\\frac{3}{5}>\\frac{11}{20}$ .',
  },
  one: {
    source: src('method-5', 29, 'طرائق', 5),
    text: 'الكسر أصغر من $1$ إذا كان بسطه أصغر من مقامه، وأكبر من $1$ إذا كان بسطه أكبر من مقامه؛ ونستعمل $1$ وسيطًا لنقارن كسرًا أصغر منه بكسر أكبر منه.',
    example: '$\\frac{11}{13}<1<\\frac{13}{12}$ ، إذن $\\frac{11}{13}<\\frac{13}{12}$ .',
  },
};

/** طريقة — quatre pas (idée de method-5 ; nombres de la plateforme). */
export const METHOD = {
  source: src('method-5', 29, 'طرائق', 5),
  exercise: 'قارن $\\frac{7}{8}$ و $\\frac{13}{16}$ ، ثم رتّب $\\frac{5}{6}$ ، $\\frac{7}{12}$ ، $\\frac{2}{3}$ ، $\\frac{3}{4}$ تصاعديًا، ثم قارن $\\frac{9}{7}$ و $\\frac{8}{9}$ ، ثم $\\frac{4{,}2}{5}$ و $\\frac{8{,}1}{10}$ .',
  solution: [
    '$16$ مضاعف لـ $8$ : $\\frac{7}{8}=\\frac{7\\times 2}{8\\times 2}=\\frac{14}{16}$ ، و $14>13$ ، إذن $\\frac{7}{8}>\\frac{13}{16}$ .',
    '$12$ مضاعف لـ $6$ و $3$ و $4$ : $\\frac{5}{6}=\\frac{10}{12}$ و $\\frac{2}{3}=\\frac{8}{12}$ و $\\frac{3}{4}=\\frac{9}{12}$ ، فنرتّب البسوط $7<8<9<10$ : $\\frac{7}{12}<\\frac{2}{3}<\\frac{3}{4}<\\frac{5}{6}$ .',
    '$\\frac{9}{7}>1$ لأنّ $9>7$ ، و $\\frac{8}{9}<1$ لأنّ $8<9$ ، إذن $\\frac{8}{9}<1<\\frac{9}{7}$ أي $\\frac{9}{7}>\\frac{8}{9}$ .',
    'البسط عشري: $\\frac{4{,}2}{5}=\\frac{4{,}2\\times 2}{5\\times 2}=\\frac{8{,}4}{10}$ ، و $8{,}4>8{,}1$ ، إذن $\\frac{4{,}2}{5}>\\frac{8{,}1}{10}$ .',
  ],
  rule: 'نحدّد الحالة: نفس المقام؟ نفس البسط؟ مقام أحدهما مضاعف للآخر (نوحّد المقامين)؟ أحدهما أكبر من $1$ والآخر أصغر منه (نستعمل $1$)؟',
  numbers: { a: '7/8', b: '13/16', order: ['7/12', '2/3', '3/4', '5/6'], via: ['9/7', '8/9'], dec: ['4,2/5', '8,1/10'] },
};

/** « أستعدّ » — six affirmations de la plateforme sur les items du réseau que la leçon suppose : `1am.m5.r01` (1, 2), `1am.m5.r02` (3, 4), `jam-tarh-kusur` (5) et une droite graduée (6). */
export const PREP_ITEMS = [];

export const PREP_PLATFORM_ITEMS = [
  { skill: 'quotient', text: '$6\\div 8=\\frac{6}{8}$ .', answer: true, why: 'الكسر $\\frac{a}{b}$ هو $a\\div b$ ، فـ $6\\div 8=\\frac{6}{8}$ .' },
  { skill: 'quotient', text: '$\\frac{3}{4}=0{,}75$ .', answer: true, why: '$3\\div 4=0{,}75$ .' },
  { skill: 'reduce', text: '$\\frac{18}{24}=\\frac{3}{4}$ .', answer: true, why: 'نقسم الحدّين على $6$ : $\\frac{18}{24}=\\frac{3}{4}$ .' },
  { skill: 'reduce', text: '$\\frac{12}{16}=\\frac{4}{5}$ .', answer: false, why: 'نقسم الحدّين على $4$ : $\\frac{12}{16}=\\frac{3}{4}$ ، لا $\\frac{4}{5}$ .' },
  { skill: 'sum', text: '$\\frac{5}{12}+\\frac{1}{4}=\\frac{2}{3}$ .', answer: true, why: '$\\frac{1}{4}=\\frac{3}{12}$ ، و $\\frac{5}{12}+\\frac{3}{12}=\\frac{8}{12}=\\frac{2}{3}$ .' },
  { skill: 'line', text: 'على مستقيم مدرّج من $1$ إلى $2$ بالأسداس، فاصلة النقطة التي تبعد أربع علامات عن $1$ هي $1+\\frac{4}{6}=\\frac{10}{6}$ .', answer: true, why: '$1=\\frac{6}{6}$ ، و $\\frac{6}{6}+\\frac{4}{6}=\\frac{10}{6}$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  sameDen: 'علامات الأنبوبين واحدة: الأعلى هو الذي عليه علامات مملوءة أكثر، فنقارن البسطين: $\\frac{5}{8}<\\frac{7}{8}$ لأنّ $5<7$ .',
  multiple: 'الليزر عند زيت $\\frac{3}{4}$ يقطع الأنبوب المدرّج بالاثني عشريات عند العلامة $9$ : $\\frac{3}{4}=\\frac{9}{12}$ ، ولذلك $\\frac{7}{12}<\\frac{3}{4}$ .',
  sameNum: 'ثلاث علامات كبيرة أعلى من ثلاث علامات صغيرة: $\\frac{3}{8}<\\frac{3}{5}$ ، فحين يتساوى البسط يكون الأصغر مقامًا هو الأكبر.',
  one: 'خطّ الامتلاء هو $1$ : $\\frac{5}{6}<1<\\frac{9}{8}$ ، فبسط أصغر من المقام يعني كسرًا أصغر من $1$ ، وبسط أكبر من المقام يعني كسرًا أكبر منه.',
  numWrong: { wrong: '$\\frac{3}{4}$ و $\\frac{7}{12}$ : $7>3$ ، فيظنّ بعضهم أنّ $\\frac{7}{12}$ هو الأكبر.', why: 'الأنبوبان مدرّجان بعلامات مختلفة، فالبسطان وحدهما لا يقارنان: الليزر عند $\\frac{3}{4}$ يقطع الأنبوب الآخر عند $9$ من $12$ ، فزيت $\\frac{7}{12}$ تحته.', right: 'نكتب الكسرين بنفس المقام ثم نقارن البسطين.' },
};
