/**
 * Le contenu du درس « مقارنة وترتيب أعداد نسبية » (2AM, unité 3) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/2am/unit3/
 * extraction.json : act-2, know-1b p. 42, method-1 p. 43, now-43 ①, أستعدّ p. 39) ; chaque texte montré à l'élève est RÉÉCRIT par la
 * plateforme (guide §4ter-bis : mêmes propriétés et notations, autres mots, autres exemples, autres nombres). La `source` de chaque
 * bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * LE LABO DE L'ENTRÉE — le « المسبار » (`zero-probe`, monde `sea`, thème `researchBoat`) : expérience de la plateforme. Les tâches
 * sont celles du preset `levels.js` (مبتدئ : A = −3 sous le zéro plus bas puis plus haut, A = 4 au-dessus plus bas, A = 2 : aucune
 * longueur ne convient ; متقدم : −4,5 < B < −4,3 ; plus bas que 1,2 des deux côtés ; −0,4 < B < −0,2).
 */
export const LAB = {
  source: addition('platform_designed_entry'),
  // معارف : le même labo posé seul (levels={false}) — insérer un nombre entre deux autres (le rangement), côté libre.
  insert: { tasks: [{ kind: 'between', lo: '-7', hi: '-5', side: null }, { kind: 'between', lo: '3', hi: '6', side: null }] },
};

/** معارف 1 (p. 42) — les trois propriétés, RÉÉCRITES avec les mots de la plateforme. */
export const KNOWLEDGE = {
  negatives: {
    source: src('know-1b', 42, 'معارف'),
    text: 'إذا قارنّا عددين نسبيين سالبين، فالأصغر منهما هو الأبعد عن الصفر. مثلًا $-5$ و $-3$ : المسافة إلى الصفر 5 ثم 3 ، إذن $-5 < -3$ .',
  },
  positives: {
    source: src('know-1b', 42, 'معارف'),
    text: 'إذا قارنّا عددين نسبيين موجبين، فالأصغر منهما هو الأقرب إلى الصفر. مثلًا $2{,}5$ و $4$ : $2{,}5 < 4$ .',
  },
  different: {
    source: src('know-1b', 42, 'معارف'),
    text: 'إذا كان أحد العددين سالبًا والآخر موجبًا، فالأصغر هو السالب. والصفر أكبر من كل عدد سالب وأصغر من كل عدد موجب: $-0{,}3 < 0 < 0{,}2$ .',
  },
  order: {
    source: src('know-1b', 42, 'معارف'),
    text: 'ترتيب أعداد تصاعديًا معناه كتابتها من الأصغر إلى الأكبر بالرمز $<$ ؛ وترتيبها تنازليًا معناه كتابتها من الأكبر إلى الأصغر بالرمز $>$ . على مستقيم مدرّج يكون الأصغر دائمًا على يسار الأكبر.',
    example: 'مثلًا: $-6 < -2{,}5 < 0 < 1{,}8$ تصاعديًا، و $1{,}8 > 0 > -2{,}5 > -6$ تنازليًا.',
  },
  between: {
    source: addition('knowledge_formalization'),
    text: 'بين أيّ عددين نسبيين مختلفين يوجد دائمًا عدد نسبي ثالث. مثلًا $-4{,}5 < -4{,}4 < -4{,}3$ ، وبين $-4{,}5$ و $-4{,}4$ يوجد أيضًا $-4{,}45$ .',
  },
};

/** طريقة (p. 43, réécrite) : مقارنة وترتيب — autres nombres, trois étapes pour comparer, puis un rangement complet. */
export const METHOD = {
  order: {
    source: src('method-1', 43, 'طرائق'),
    exercise: 'رتّب تصاعديًا الأعداد: $0{,}6$ ؛ $-2{,}3$ ؛ $1{,}5$ ؛ $-0{,}9$ ؛ $-2{,}03$ ؛ $0$ .',
    solution: [
      'نفصل الأعداد حسب إشاراتها: السالبة $-2{,}3$ و $-0{,}9$ و $-2{,}03$ ، والصفر، والموجبة $0{,}6$ و $1{,}5$ .',
      'السالبة: الأصغر هو الأبعد عن الصفر. المسافات $2{,}30$ و $2{,}03$ و $0{,}90$ ، إذن $-2{,}3 < -2{,}03 < -0{,}9$ .',
      'الموجبة: الأصغر هو الأقرب إلى الصفر: $0{,}6 < 1{,}5$ .',
      'نجمع: السالبة أوّلًا ثم الصفر ثم الموجبة: $-2{,}3 < -2{,}03 < -0{,}9 < 0 < 0{,}6 < 1{,}5$ .',
    ],
    rule: [
      'لمقارنة عددين أو لترتيب قائمة أعداد نسبية:',
      'أنظر أوّلًا إلى الإشارات: السالب أصغر من الصفر ومن كل موجب.',
      'بين سالبين: الأبعد عن الصفر هو الأصغر. بين موجبين: الأقرب إلى الصفر هو الأصغر.',
      'أستعين بمستقيم مدرّج وأقرأ الأعداد من اليسار إلى اليمين.',
    ],
    numbers: { ascending: ['-2,3', '-2,03', '-0,9', '0', '0,6', '1,5'] },
  },
  // دوري الآن ① (p. 43) réécrit : placer puis ranger dans l'ordre décroissant
  now: {
    source: src('now-43', 43, 'دوري الآن', 1),
    values: ['4,2', '-4,25', '0', '-4,2', '4,02'],
  },
};

/** « أستعدّ » — أستعدّ p. 39 : items 5, 6, 7 RÉÉCRITS en affirmations (les autres items vont aux leçons voisines). */
export const PREP_ITEMS = [
  { n: 5, skill: 'masafa', text: 'المسافة إلى الصفر للعدد النسبي $(-2{,}3)$ هي $2{,}3$ .', answer: true, why: 'المسافة إلى الصفر عدد موجب دائمًا: نحذف الإشارة، $2{,}3$ .' },
  { n: 6, skill: 'faasila', text: 'على مستقيم مدرّج، النقطة التي فاصلتها $-4$ تقع على يمين الصفر.', answer: false, why: 'الفاصلة السالبة تعني أنّ النقطة على يسار الصفر.' },
  { n: 7, skill: 'masafa', text: 'على مستقيم مدرّج وحدته 1 cm ، النقطة التي فاصلتها $-2{,}5$ تبعد عن الصفر $-2{,}5$ cm .', answer: false, why: 'المسافة لا تكون سالبة: تبعد عن الصفر $2{,}5$ cm .' },
].map((it) => ({ ...it, source: src('prep', 39, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon s'appuie sur `2am.m4.r01` (قراءة فاصلة نقطة أو وضع نقطة على مستقيم مدرّج,
 * leçon `talim-mustaqim-mudarraj-2`, non publiée) — « أستعدّ » doit le mesurer (LEARNING_NET.md §4.4) : lire, placer, opposé.
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'mutaakis', text: 'معاكس العدد النسبي $(-9)$ هو $(+9)$ .', answer: true, why: 'العددان المتعاكسان لهما المسافة نفسها إلى الصفر وإشارتان مختلفتان.' },
  { skill: 'faasila', text: 'على مستقيم مدرّج، النقطة التي فاصلتها $1{,}5$ تقع بين التدريجتين $1$ و $2$ .', answer: true, why: '$1 < 1{,}5 < 2$ : وسط المسافة بين $1$ و $2$ .' },
  { skill: 'mutaakis', text: 'العددان $(+1{,}2)$ و $(-2{,}1)$ متعاكسان.', answer: false, why: 'معاكس $1{,}2$ هو $-1{,}2$ ، أمّا $-2{,}1$ فمسافته إلى الصفر $2{,}1$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  farIsBig: {
    wrong: '$-8 > -3$ لأنّ $8 > 3$ .',
    why: 'نقارن المسافتين فقط: لكنّ العدد السالب كلما ابتعد عن الصفر صار أصغر.',
    right: '$-8 < -3$ : $-8$ أبعد عن الصفر وأخفض.',
  },
  decimals: {
    wrong: '$-0{,}25 < -0{,}5$ لأنّ $25 > 5$ .',
    why: 'نقارن المسافتين بالقطع نفسها: $0{,}25 < 0{,}50$ ، والأبعد عن الصفر هو الأصغر.',
    right: '$-0{,}5 < -0{,}25$ .',
  },
  zero: 'الصفر أكبر من كل عدد سالب وأصغر من كل عدد موجب: $-7 < 0 < 7$ .',
  different: 'السالب دائمًا أصغر من الموجب مهما كانت المسافة: $-1 < 0{,}001$ .',
};
