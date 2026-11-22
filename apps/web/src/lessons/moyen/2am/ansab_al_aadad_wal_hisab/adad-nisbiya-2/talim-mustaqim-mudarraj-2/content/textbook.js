/**
 * Le contenu du درس « التعليم على مستقيم مدرّج » (2AM, unité 3) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/2am/unit3/
 * extraction.json : act-1 a-b p. 40, know-1a p. 42, أستعدّ p. 39, ex-1 … ex-11 p. 46, self-4 p. 49) ; chaque texte montré à l'élève
 * est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes notions et notations, autres mots, autres exemples, autres nombres). La
 * `source` de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève. Il n'y a PAS de طريقة dans le
 * manuel pour cette compétence : la plateforme écrit la sienne (choisir une graduation).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * LE LABO — « مسطرة الكورنيش » (`corniche-ruler`, monde `corniche`) : expérience de la plateforme. Les tâches du niveau sont celles de `levels.js`.
 * معارف : le même labo posé seul (graduation 5, drapeau sous le banc), lecture seule.
 */
export const LAB = {
  source: addition('platform_designed_entry'),
  // معارف : le labo seul — l'origine est le banc (−20) et la graduation 5 ; on écrit le lampadaire (−20), le palmier (+40), l'arrêt de bus (−15)
  maarif: { tasks: [{ id: 'm1', kind: 'read', pin: '-20', ask: ['lamp', 'palm', 'bus'] }] },
};

/** « تذكّر — السنة الأولى » (درس 1AM `talim-mustaqim-mudarraj`، منشور منذ 2026-10-30 : الرابط يظهر وحده). */
export const REMINDER = {
  source: addition('prior_year_reminder'),
  text: 'في السنة الماضية تعلّمت أنّ للمستقيم المدرّج مبدأً هو الصفر، وأنّ الأعداد الموجبة على يمينه والسالبة على يساره، وأنّ فاصلة النقطة $A$ التي تبعد عن المبدأ بثلاث تدريجات إلى اليسار هي $-3$ .',
};

/** معارف 1 (p. 42) — les mots, RÉÉCRITS avec ceux de la plateforme. */
export const KNOWLEDGE = {
  abscissa: {
    source: src('know-1a', 42, 'معارف'),
    text: 'فاصلة نقطة على مستقيم مدرّج هي العدد الذي يدلّ على موضعها من المبدأ: نعدّ التدريجات بين المبدأ والنقطة ونضرب عددها في قيمة التدريجة الواحدة، ونكتب الإشارة $+$ إذا كانت النقطة على يمين المبدأ و $-$ إذا كانت على يساره.',
    example: 'نكتب $A(-3)$ لنقول: النقطة $A$ فاصلتها $-3$ ، وهي على بعد ثلاث تدريجات يسار المبدأ إذا كانت التدريجة الواحدة وحدة.',
  },
  distance: {
    source: src('know-1a', 42, 'معارف'),
    text: 'المسافة إلى الصفر لعدد نسبي هي بعد نقطته عن المبدأ، ولا تكون سالبة أبدًا: نحذف الإشارة. فالمسافة إلى الصفر للعدد $-7$ هي $7$ ، وللعدد $12{,}5$ هي $12{,}5$ .',
  },
  opposites: {
    source: src('know-1a', 42, 'معارف'),
    text: 'العددان المتعاكسان لهما المسافة نفسها إلى الصفر وإشارتان مختلفتان، مثل $(+3)$ و $(-3)$ . معاكس العدد $-2{,}5$ هو $2{,}5$ ، ومعاكس $0$ هو $0$ .',
  },
  origin: {
    source: addition('knowledge_formalization'),
    text: 'فاصلة نقطة تتعلّق بالمبدأ وبقيمة التدريجة: إذا انتقل المبدأ تغيّرت فاصلات النقط كلّها مع أنّها لم تتحرّك، وإذا تغيّرت قيمة التدريجة تغيّر موضع الفاصلات على المستقيم.',
  },
};

/** طريقة (écrite par la plateforme) : choisir la graduation qui convient à des nombres donnés. */
export const METHOD = {
  choose: {
    source: addition('platform_method'),
    exercise: 'نريد وضع النقط ذات الفواصل $-30$ ؛ $45$ ؛ $60$ ؛ $-15$ على مستقيم فيه $6$ تدريجات في كل جهة من المبدأ. ما التدريجة المناسبة؟',
    solution: [
      'أبعد نقطة عن المبدأ فاصلتها $60$ ، ومسافتها إلى الصفر $60$ .',
      'لتبقى داخل المستقيم نقسم $60$ على $6$ : $60\\div 6=10$ ، فالتدريجة $10$ أو أكبر.',
      'نتحقّق من كل نقطة: $45\\div 10=4{,}5$ تقع بين تدريجتين، فلا تصلح $10$ .',
      'نجرّب $15$ : $-30\\div 15=-2$ ، $45\\div 15=3$ ، $60\\div 15=4$ ، $-15\\div 15=-1$ : كلّها أعداد صحيحة وداخل المستقيم. التدريجة المناسبة $15$ .',
    ],
    rule: [
      'لاختيار تدريجة تناسب أعدادًا معلومة:',
      'نبحث عن أبعد عدد عن الصفر ونتأكّد أنّ عدد تدريجاته لا يتجاوز ما في المستقيم.',
      'نقسم كل فاصلة على قيمة التدريجة: نريد أعدادًا صحيحة.',
      'نختار أصغر تدريجة تحقّق الشرطين معًا.',
    ],
  },
  fine: {
    source: addition('platform_method'),
    read: 'على مستقيم تدريجته $0{,}25$ ، نقطة تبعد عن المبدأ بثلاث تدريجات إلى اليسار: فاصلتها $-3\\times 0{,}25=-0{,}75$ .',
    place: 'لوضع $-1{,}25$ على المستقيم نفسه: $1{,}25\\div 0{,}25=5$ ، فنعدّ خمس تدريجات إلى يسار المبدأ.',
  },
};

/** « أستعدّ » — أستعدّ p. 39 : items 1–4 RÉÉCRITS (les autres items vont aux leçons voisines). */
export const PREP_ITEMS = [
  { n: 1, skill: 'siyaq', text: 'درجة حرارة $5$ تحت الصفر تُكتب $-5$ °C .', answer: true, why: 'ما كان تحت الصفر نكتبه بإشارة $-$ قبل العدد.' },
  { n: 3, skill: 'mutaakis', text: 'معاكس العدد $-8$ هو $8$ .', answer: true, why: 'للعددين المسافة نفسها إلى الصفر وإشارتان مختلفتان.' },
  { n: 4, skill: 'mutaakis', text: 'العددان $(+1{,}2)$ و $(-2{,}1)$ متعاكسان.', answer: false, why: 'معاكس $1{,}2$ هو $-1{,}2$ ، أمّا $-2{,}1$ فمسافته إلى الصفر $2{,}1$ .' },
  { n: 2, skill: 'siyaq', text: '$\\frac{1}{7}$ عدد نسبي من أعداد هذه السنة.', answer: false, why: 'أعداد هذه السنة النسبية تُكتب بالكتابة العشرية فقط، والكسر لا يُكتب هكذا.' },
].map((it) => ({ ...it, source: src('prep', 39, 'أستعدّ', it.n) }));

/** Les items de la PLATEFORME : ils mesurent les liens « راجع » du réseau (1am.m5.r04 et r06 — leçons non publiées, jamais reconstruites ici). */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'faasila', text: 'على مستقيم مدرّج وحدته $1$ ، النقطة التي تبعد عن المبدأ بثلاث تدريجات إلى اليسار فاصلتها $3$ .', answer: false, why: 'إلى اليسار الإشارة سالبة: فاصلتها $-3$ .' },
  { skill: 'nisf', text: 'على نصف مستقيم مدرّج تدريجته $0{,}1$ ، النقطة الواقعة على التدريجة السابعة بعد $2$ فاصلتها $2{,}7$ .', answer: true, why: '$2+7\\times 0{,}1=2{,}7$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  unitIgnored: {
    wrong: 'النقطة على ثلاث تدريجات يسار المبدأ والتدريجة $5$ : فاصلتها $-3$ .',
    why: 'عدد التدريجات ليس الفاصلة: الفاصلة تحسب قيمة كل تدريجة.',
    right: '$-3\\times 5=-15$ .',
  },
  originFixed: {
    wrong: 'انتقل المبدأ لكنّ فاصلة النقطة بقيت $30$ .',
    why: 'الفاصلة تقاس من المبدأ، فإذا انتقل المبدأ تغيّرت.',
    right: 'المبدأ الجديد على بعد $20$ يسارًا: فاصلتها $50$ .',
  },
  negDistance: 'المسافة إلى الصفر لا تكون سالبة: للعدد $-7$ مسافة $7$ .',
  tooSmall: 'تدريجة صغيرة جدًا تُخرج النقاط البعيدة من المستقيم، وتدريجة كبيرة جدًا تتركها بين تدريجتين.',
};
