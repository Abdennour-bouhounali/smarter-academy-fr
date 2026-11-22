/**
 * Le contenu du درس « المسافة بين نقطتين على مستقيم مدرّج » (2AM, unité 3) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/2am/unit3/extraction.json :
 * act-5 p. 41 ; know-2c p. 44 ; ex-35 p. 48 ; self-9 p. 49 ; deep-40, deep-41, deep-42 p. 50 ; ict-1 p. 53) ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme
 * (guide §4ter-bis : mêmes notions et notations, autres mots, autres exemples, autres nombres). Le manuel n'a PAS de طريقة pour cet item : la plateforme écrit la sienne.
 * La `source` de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * LE LABO — « مسماك الفرق » (`gap-caliper`, monde `meteoboard`) : expérience de la plateforme. Les tâches du niveau sont celles de `levels.js`.
 * معارف : le même labo posé seul, le compas serré sur A(−4), ouvert jusqu'à B(+3) : 7.
 */
export const LAB = {
  source: addition('platform_designed_entry'),
  maarif: { tasks: [{ id: 'm1', anchor: '-4', target: '3' }] },
};

/** « تذكّر » AVEC lien : la soustraction de `jam-tarh-nisbiya` (PUBLIÉE). RAPPELÉE, jamais reconstruite. */
export const RECALL_JAM = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — الطرح',
  text: 'طرح عدد نسبي هو إضافة معاكسه: $(+9)-(-4)=(+9)+(+4)=(+13)$ .',
  lesson: 'jam-tarh-nisbiya',
};

/** « تذكّر » AVEC lien : la comparaison de `muqarana-nisbiya` (PUBLIÉE). */
export const RECALL_CMP = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — المقارنة',
  text: 'من عددين نسبيين على مستقيم مدرّج أكبرهما الأبعد نحو الاتجاه الموجب: فنقول $-2{,}5>-7$ لأنّ $-2{,}5$ على يمين $-7$ .',
  lesson: 'muqarana-nisbiya',
};

/** معارف 2 (p. 44) — la règle et la remarque, RÉÉCRITES avec les mots de la plateforme. */
export const KNOWLEDGE = {
  rule: {
    source: src('know-2c', 44, 'معارف'),
    text: 'المسافة بين نقطتين $A$ و $B$ على مستقيم مدرّج هي الفاصلة الكبرى ناقص الفاصلة الصغرى: إذا كانت $x_B>x_A$ فإنّ $AB=x_B-x_A$ .',
    example: 'مثال: $A(+5{,}5)$ و $B(-1)$ ، الفاصلة الكبرى $+5{,}5$ فنكتب $AB=(+5{,}5)-(-1)=(+5{,}5)+(+1)=6{,}5$ .',
  },
  positive: {
    source: src('know-2c', 44, 'معارف'),
    text: 'المسافة بين نقطتين عدد موجب دائمًا، ولا يتغيّر إذا بدّلنا النقطتين: $AB=BA$ .',
  },
  atDistance: {
    source: addition('knowledge_formalization'),
    text: 'النقطتان اللتان تبعدان $d$ عن نقطة فاصلتها $a$ فاصلتاهما $a-d$ و $a+d$ : نقطتان لا نقطة واحدة، واحدة من كلّ جهة.',
  },
  midpoint: {
    source: addition('knowledge_formalization'),
    text: 'منتصف $[AB]$ يبعد عن كلّ طرف نصف المسافة $AB$ : فاصلته هي الفاصلة الصغرى زائد نصف المسافة.',
  },
};

/** طريقة (la plateforme écrit la sienne, pas de طريقة dans le manuel pour cet item) : calculer une distance, trouver les points à distance donnée. */
export const METHOD = {
  distance: {
    source: addition('platform_method'),
    exercise: 'احسب $AB$ للنقطتين $A(+4{,}5)$ و $B(-3)$ ، ثم $CD$ للنقطتين $C(-7)$ و $D(-2{,}5)$ ، ثم عيّن النقطتين اللتين تبعدان $3$ عن $M(-1{,}5)$ .',
    solution: [
      'الفاصلة الكبرى $+4{,}5$ : $AB=(+4{,}5)-(-3)=(+4{,}5)+(+3)=7{,}5$ .',
      'الفاصلة الكبرى $-2{,}5$ : $CD=(-2{,}5)-(-7)=(-2{,}5)+(+7)=4{,}5$ .',
      'نضيف $3$ إلى $-1{,}5$ فنجد $+1{,}5$ ، ونطرح $3$ منه فنجد $-4{,}5$ : النقطتان $+1{,}5$ و $-4{,}5$ .',
    ],
    rule: [
      'لحساب مسافة وإيجاد نقطتين على بعد معلوم:',
      'نعيّن الفاصلة الكبرى، ثم نطرح منها الفاصلة الصغرى.',
      'وللنقطتين اللتين تبعدان $d$ عن $M$ : نضيف $d$ إلى فاصلة $M$ ونطرح $d$ منها.',
    ],
  },
  reverse: {
    source: addition('platform_method'),
    read: 'لو طرحنا الفاصلة الكبرى من الصغرى في $CD$ لوجدنا $(-7)-(-2{,}5)=-4{,}5$ ، وهو عدد سالب، والمسافة لا تكون سالبة.',
  },
};

/** « أستعدّ » — six affirmations de la PLATEFORME : elles mesurent la soustraction (2am.m4.r05, publiée), la comparaison, la graduation (2am.m4.r01) et la distance à zéro. JAMAIS bloquant. */
export const PREP_ITEMS = [];
export const PREP_PLATFORM_ITEMS = [
  { skill: 'sub', text: '$(+6)-(-2{,}5)=(+8{,}5)$ .', answer: true, why: 'نضيف معاكس $-2{,}5$ : $(+6)+(+2{,}5)=(+8{,}5)$ .' },
  { skill: 'sub', text: '$(-7)-(-2)=(-9)$ .', answer: false, why: 'نضيف معاكس $-2$ : $(-7)+(+2)=(-5)$ .' },
  { skill: 'cmp', text: '$-6{,}5$ أكبر من $-6$ .', answer: false, why: 'في السالبين الأكبر هو الأقرب إلى الصفر: $-6>-6{,}5$ .' },
  { skill: 'grad', text: 'على مستقيم تدريجته $1$ ، النقطة التي تبعد ثلاث تدريجات يسار $-1$ فاصلتها $-4$ .', answer: true, why: 'نعدّ ثلاثًا يسارًا ابتداءً من $-1$ : $-2$ ثم $-3$ ثم $-4$ .' },
  { skill: 'zero', text: 'المسافة إلى الصفر للعدد $-4{,}5$ هي $-4{,}5$ .', answer: false, why: 'المسافة عدد موجب: هي $4{,}5$ .' },
  { skill: 'sub', text: '$(+2)-(+9)=(-7)$ .', answer: true, why: 'نضيف معاكس $+9$ : $(+2)+(-9)=(-7)$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  subDist: {
    wrong: 'المسافة بين $-4$ و $+9$ هي $9-4=5$ .',
    why: 'الخرزتان على جانبي الصفر: المسماك يقطع $4$ تحت الصفر و $9$ فوقه.',
    right: '$4+9=13$ .',
  },
  addSame: {
    wrong: 'المسافة بين $-7$ و $-2$ هي $7+2=9$ .',
    why: 'الخرزتان في جهة واحدة من الصفر: مسافتاهما إلى الصفر تتداخلان.',
    right: '$(-2)-(-7)=5$ .',
  },
  negative: 'لو طرحنا الفاصلة الكبرى من الصغرى لوجدنا عددًا سالبًا، والمسماك لا يُفتح بقدر سالب.',
  twoPoints: 'نقطتان تبعدان $4$ عن $M(+1{,}5)$ : $+1{,}5+4=+5{,}5$ و $+1{,}5-4=-2{,}5$ .',
};
