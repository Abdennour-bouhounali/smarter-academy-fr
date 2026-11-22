/**
 * Le contenu du درس « جمع وطرح عددين نسبيين » (2AM, unité 3) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/2am/unit3/extraction.json :
 * know-2a, know-2b p. 44 ; method-3, method-4, now-45 p. 45 ; act-3, act-4 p. 41 ; ex-25 … ex-34 p. 48 ; self-7, self-8 p. 49) ; chaque texte montré
 * à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes notions et notations, autres mots, autres exemples, autres nombres). La `source`
 * de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * LE LABO — « أكياس المنطاد » (`balloon-ballast`, monde `balloonvalley`) : expérience de la plateforme. معارف : le même labo posé seul, deux cartes
 * (une somme puis une différence dont la charge à jeter manque), lecture seule.
 */
export const LAB = {
  source: addition('platform_designed_entry'),
  maarif: { tasks: [
    { id: 'm1', a: '-8', op: '+', b: '3' },
    { id: 'm2', a: '4', op: '-', b: '-6', predict: true },
  ] },
};

/** معارف 2 (p. 44) — les règles, RÉÉCRITES avec les mots de la plateforme. */
export const KNOWLEDGE = {
  same: {
    source: src('know-2a', 44, 'معارف'),
    text: 'لجمع عددين نسبيين لهما الإشارة نفسها نجمع مسافتيهما إلى الصفر ونحتفظ بالإشارة المشتركة.',
    example: 'مثال: $(-2{,}5)+(-4)=(-6{,}5)$ ، فمسافتا العددين $2{,}5$ و $4$ مجموعهما $6{,}5$ والإشارة $-$ .',
  },
  different: {
    source: src('know-2a', 44, 'معارف'),
    text: 'لجمع عددين نسبيين من إشارتين مختلفتين نطرح المسافة الصغرى إلى الصفر من المسافة الكبرى، ونأخذ إشارة العدد الأبعد عن الصفر.',
    example: 'مثال: $(+7)+(-10)=(-3)$ ، فالمسافتان $7$ و $10$ والفرق بينهما $3$ ، والأبعد عن الصفر هو $-10$ .',
  },
  opposites: {
    source: src('know-2a', 44, 'معارف'),
    text: 'مجموع عددين متعاكسين معدوم، لأنّ لهما المسافة نفسها إلى الصفر وإشارتين مختلفتين: $(-6)+(+6)=0$ .',
  },
  subtract: {
    source: src('know-2b', 44, 'معارف'),
    text: 'لطرح عدد نسبي نضيف معاكسه.',
    example: 'مثال: $(-6)-(+9)=(-6)+(-9)=(-15)$ .',
  },
  names: {
    source: addition('knowledge_formalization'),
    text: 'ناتج الجمع يسمّى المجموع، وناتج الطرح يسمّى الفرق. وفي كلّ منهما نحافظ على أقواس كلّ عدد وإشارته: $(+7)+(-10)$ ، $(+5)-(-7)$ .',
  },
};

/** طرائق 3 و 4 (p. 45) — la plateforme écrit sa méthode (autres nombres). */
export const METHOD = {
  sum: {
    source: src('method-3', 45, 'طرائق'),
    cites: [src('now-45', 45, 'دوري الآن')],
    exercise: 'احسب $A=(-5)+(-8)$ و $B=(-5)+(+8)$ .',
    solution: [
      '$A$ : العددان لهما الإشارة نفسها، فنجمع المسافتين $5+8=13$ ونحتفظ بالإشارة $-$ : $A=-(5+8)=(-13)$ .',
      '$B$ : الإشارتان مختلفتان، فنطرح المسافة الصغرى من الكبرى $8-5=3$ .',
      'الأبعد عن الصفر هو $+8$ ، فالإشارة $+$ : $B=+(8-5)=(+3)$ .',
    ],
    rule: [
      'لحساب مجموع عددين نسبيين نميّز حالتين:',
      'الإشارتان متّفقتان: نجمع المسافتين ونكتب الإشارة المشتركة.',
      'الإشارتان مختلفتان: نطرح الصغرى من الكبرى ونكتب إشارة الأبعد عن الصفر.',
    ],
  },
  diff: {
    source: src('method-4', 45, 'طرائق'),
    exercise: 'احسب $C=(+6{,}3)-(-2{,}4)$ و $D=(+2)-(+9)$ و $E=(-4)-(+6)$ .',
    solution: [
      'نحوّل الطرح إلى جمع المعاكس: $C=(+6{,}3)+(+2{,}4)$ .',
      'الإشارتان متّفقتان: $6{,}3+2{,}4=8{,}7$ ، فـ $C=(+8{,}7)$ .',
      '$D=(+2)+(-9)$ : نطرح $9-2=7$ والأبعد عن الصفر $-9$ ، فـ $D=(-7)$ .',
      '$E=(-4)+(-6)=(-10)$ .',
    ],
    rule: [
      'لحساب فرق عددين نسبيين:',
      'نكتب الطرح جمعًا للمعاكس.',
      'ثم نطبّق قاعدة الجمع حسب الإشارتين.',
    ],
  },
};

/** « أستعدّ » — ست عبارات de la PLATEFORME : elles mesurent le lien « راجع » du réseau (2am.m4.r01), la comparaison et la somme des décimaux (1AM). JAMAIS bloquant. */
export const PREP_ITEMS = [];
export const PREP_PLATFORM_ITEMS = [
  { skill: 'masafa', text: 'المسافة إلى الصفر للعدد $-6{,}5$ هي $6{,}5$ .', answer: true, why: 'المسافة إلى الصفر هي العدد دون إشارته.' },
  { skill: 'mutaakis', text: 'معاكس العدد $+3{,}2$ هو $-2{,}3$ .', answer: false, why: 'معاكس $+3{,}2$ هو $-3{,}2$ : الأرقام نفسها بإشارة مخالفة.' },
  { skill: 'compare', text: 'العدد $-9$ أبعد عن الصفر من العدد $+5$ .', answer: true, why: 'مسافة $-9$ إلى الصفر $9$ ومسافة $+5$ هي $5$ .' },
  { skill: 'ashri', text: '$8{,}4+5{,}2=13{,}6$ و $5{,}2-3{,}7=1{,}5$ .', answer: true, why: '$8{,}4+5{,}2=13{,}6$ و $5{,}2-3{,}7=1{,}5$ .' },
  { skill: 'siyaq', text: 'ارتفعت الحرارة من $2\\,{}^{\\circ}\\mathrm{C}$ إلى $9\\,{}^{\\circ}\\mathrm{C}$ ، أي ارتفعت بسبع درجات.', answer: true, why: '$9-2=7$ .' },
  { skill: 'line', text: 'على مستقيم مدرّج، العدد $-4$ على يمين العدد $-1$ .', answer: false, why: '$-4$ أصغر من $-1$ فهو على يساره.' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  signLost: {
    wrong: 'نكتب $+8$ لمجموع $(-3)$ و $(-5)$ لأنّ «الجمع يعطي ناتجًا موجبًا».',
    why: 'كلّ ما في السلّة أكياس، والمنطاد يهبط.',
    right: '$(-3)+(-5)=(-8)$ .',
  },
  addDist: {
    wrong: 'نكتب $-14$ لمجموع $(-9)$ و $(+5)$ بجمع المسافتين دائمًا.',
    why: 'النفخات والأكياس تتقابل في أزواج فتتلاشى.',
    right: '$(-9)+(+5)=(-4)$ : نطرح $9-5=4$ ونأخذ إشارة الأبعد.',
  },
  subNoFlip: {
    wrong: 'نكتب $-10$ لفرق $(-7)$ و $(-3)$ كأنّه جمع.',
    why: 'رميُ الأكياس يرفع المنطاد لا ينزله.',
    right: '$(-7)-(-3)=(-7)+(+3)=(-4)$ .',
  },
};
