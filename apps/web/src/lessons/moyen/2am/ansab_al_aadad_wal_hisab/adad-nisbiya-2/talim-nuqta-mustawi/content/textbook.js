/**
 * Le contenu du درس « تعليم نقطة في المستوي » (2AM, unité 3) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/2am/unit3/extraction.json :
 * act-1 c p. 40, know-1c p. 42, method-2 et now-43 ② p. 43, أستعدّ 8–13 p. 39, ex-21 … ex-24 p. 47, deep-51 … deep-56 p. 51) ; chaque texte montré à l'élève
 * est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes notions et notations, autres mots, autres exemples, autres nombres). La `source` de chaque bloc garde
 * la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * LE LABO — « شبكة الحفرية » (`dig-grid`, monde `digsite`) : expérience de la plateforme. Les tâches du niveau sont celles de `levels.js`.
 * معارف : le même labo posé seul, le piquet en (4 ; 2) — la jarre (1 ; 2), le qandil (−2 ; 3), la tesson (−2 ; −1).
 */
export const LAB = {
  source: addition('platform_designed_entry'),
  maarif: { tasks: [{ id: 'm1', kind: 'typed', stake: '4;2', finds: ['jar', 'lamp', 'plate'] }] },
};

/** « تذكّر — السنة الأولى » (درس 1AM `talim-fi-mustawi`، منشور منذ 2026-10-30 : الرابط يظهر وحده). */
export const REMINDER = {
  source: addition('prior_year_reminder'),
  text: 'في السنة الماضية تعلّمت أنّ لنقطة في المستوي إحداثيين: الفاصلة أولًا ثم الترتيب، مثل $A(3\\,;5)$ ، وأنّ $(3\\,;5)$ و $(5\\,;3)$ ليستا النقطة نفسها.',
};

/** معارف 1 (p. 42) — les mots, RÉÉCRITS avec ceux de la plateforme. */
export const KNOWLEDGE = {
  frame: {
    source: src('know-1c', 42, 'معارف'),
    text: 'المعلم المتعامد والمتجانس للمستوي مبدأ $O$ ومحوران متعامدان يمرّان به: محور الفواصل الأفقي ومحور التراتيب العمودي، وللمحورين التدريجة نفسها، أي المتر نفسه على الحبلين.',
  },
  coordinates: {
    source: src('know-1c', 42, 'معارف'),
    text: 'لكلّ نقطة $M$ في المستوي إحداثيان: الفاصلة $x$ وهي العدد على محور الفواصل، ثم الترتيب $y$ وهو العدد على محور التراتيب، ونكتب $M(x\\,;y)$ ، فتختلف $(3\\,;5)$ عن $(5\\,;3)$ .',
    example: 'نكتب $A(-3\\,;2)$ لنقول: النقطة $A$ على ثلاث وحدات يسار محور التراتيب واثنتين فوق محور الفواصل.',
  },
  axes: {
    source: addition('knowledge_formalization'),
    text: 'كلّ نقطة على محور الفواصل ترتيبها معدوم، وكلّ نقطة على محور التراتيب فاصلتها معدومة، ومبدأ المعلم $O(0\\,;0)$ .',
  },
  regions: {
    source: addition('knowledge_formalization'),
    text: 'يقسّم المحوران المستوي إلى أربع مناطق: فوق محور الفواصل وعلى يمين محور التراتيب العددان موجبان، وعلى يساره الفاصلة سالبة والترتيب موجب، وتحت المحور وعلى يساره العددان سالبان، وتحته وعلى يمين المحور الفاصلة موجبة والترتيب سالب.',
  },
  symmetric: {
    source: addition('knowledge_formalization'),
    text: 'نظيرة النقطة $M(x\\,;y)$ بالنسبة إلى محور الفواصل هي $(x\\,;-y)$ ، وبالنسبة إلى محور التراتيب هي $(-x\\,;y)$ : تحتفظ بالإحداثية التي على المحور وتأخذ معاكس الأخرى.',
  },
  origin: {
    source: addition('knowledge_formalization'),
    text: 'إحداثيات نقطة تتعلّق بالمبدأ: إذا انتقل المبدأ تغيّرت إحداثيات النقط كلّها مع أنّها لم تتحرّك.',
  },
};

/** طريقة (method-2 p. 43, réécrite avec d'autres nombres) : placer, lire sur un axe, symétrique. */
export const METHOD = {
  place: {
    source: src('method-2', 43, 'طريقة'),
    exercise: 'ضع النقطة $R(-2{,}5\\,;3)$ في معلم متعامد ومتجانس، ثم اقرأ إحداثيي $T$ التي على محور التراتيب وتحت المبدأ بوحدتين، وعيّن نظيرتي $R$ بالنسبة إلى المحورين.',
    solution: [
      'نرسم المواز لمحور التراتيب المارّ بالعدد $-2{,}5$ على محور الفواصل.',
      'نرسم المواز لمحور الفواصل المارّ بالعدد $3$ على محور التراتيب: تقاطعهما هو $R$ (ويمكن أن نبدأ بأيّ المُوازيين).',
      '$T$ على محور التراتيب: فاصلتها $0$ وترتيبها $-2$ ، أي $T(0\\,;-2)$ .',
      'نظيرة $R$ بالنسبة إلى محور الفواصل: $(-2{,}5\\,;-3)$ ؛ وبالنسبة إلى محور التراتيب: $(2{,}5\\,;3)$ .',
    ],
    rule: [
      'لوضع نقطة معلومة الإحداثيين:',
      'نرسم من الفاصلة موازيًا لمحور التراتيب ومن الترتيب موازيًا لمحور الفواصل، فتقاطعهما هو النقطة.',
      'نقرأ نقطة على محور من عدده فقط، والإحداثية الأخرى معدومة.',
      'نظيرة نقطة بالنسبة إلى محور تحتفظ بالإحداثية التي على هذا المحور وتأخذ معاكس الأخرى.',
    ],
  },
  completeRect: {
    source: src('now-43', 43, 'أنشطة'),
    read: 'في معلم متعامد ومتجانس، $A(-3\\,;2)$ و $B(-3\\,;-3)$ على مستقيم عمودي واحد، والمسافة بينهما $5$ وحدات (نعدّ المربعات). فلتكون $ABC$ قائمة في $B$ ومتقايسة الضلعين نجعل $BC=5$ على الأفقي: $C(2\\,;-3)$ أو $C(-8\\,;-3)$ .',
  },
};

/** « أستعدّ » — أستعدّ 8–13 p. 39 : items RÉÉCRITS (les autres items vont aux leçons voisines). */
export const PREP_ITEMS = [
  { n: 8, skill: 'tartib', text: 'النقطة التي فاصلتها $5$ وترتيبها $3$ تُكتب $P(3\\,;5)$ .', answer: false, why: 'الفاصلة أولًا ثم الترتيب: تُكتب $P(5\\,;3)$ .' },
  { n: 9, skill: 'mihwar', text: 'النقطة $(0\\,;3)$ تقع على محور التراتيب.', answer: true, why: 'فاصلتها معدومة، فهي على محور التراتيب.' },
  { n: 10, skill: 'mihwar', text: 'كلّ نقطة على محور الفواصل ترتيبها معدوم.', answer: true, why: 'لا ارتفاع لها عن محور الفواصل، فترتيبها $0$ .' },
  { n: 12, skill: 'istiqama', text: 'النقط $M(-1\\,;1)$ و $O(0\\,;0)$ و $N(-3\\,;3)$ على استقامة واحدة.', answer: true, why: 'كلّ نقطة منها ترتيبها يساوي معاكس فاصلتها: تقع على المستقيم نفسه المارّ بالمبدأ.' },
].map((it) => ({ ...it, source: src('prep', 39, 'أستعدّ', it.n) }));

/** Les items de la PLATEFORME : ils mesurent les liens « راجع » du réseau (1am.m5.r07 — leçon non publiée — et le symétrique axial, 1AM). */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'nazir', text: '$K(2\\,;5)$ و $L(-2\\,;5)$ متناظرتان بالنسبة إلى محور التراتيب.', answer: true, why: 'لهما الترتيب نفسه والفاصلتان متعاكستان: المحور في وسط المسافة بينهما.' },
  { skill: 'faasila', text: 'على مستقيم مدرّج تدريجته $0{,}5$ ، النقطة الواقعة على التدريجة الخامسة يسار المبدأ فاصلتها $-2{,}5$ .', answer: true, why: '$5\\times 0{,}5=2{,}5$ ، ويسار المبدأ الإشارة سالبة.' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  swap: {
    wrong: 'النقطة التي فاصلتها $2$ وترتيبها $1$ كتبتُها $(1\\,;2)$ .',
    why: 'الفاصلة تُكتب أولًا: $(1\\,;2)$ و $(2\\,;1)$ مكانان مختلفان.',
    right: 'نكتب $(2\\,;1)$ .',
  },
  onAxis: 'الخرزة على محور التراتيب فاصلتها $0$ لا ترتيبها: $(0\\,;-2)$ وليست $(-2\\,;0)$ .',
  units: 'إذا اختلف المتر على الحبلين تغيّرت الأشكال: لذلك نريد المتر نفسه على المحورين.',
};
