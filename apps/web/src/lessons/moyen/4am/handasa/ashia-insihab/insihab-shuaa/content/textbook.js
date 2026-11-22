/**
 * Le contenu du MANUEL pour le درس « مفهوم الانسحاب والشعاع وتساوي شعاعين » (unité 11, entrée de l'unité) — données
 * pures (aucun JSX), au mot près ; chaque bloc cite son élément de docs/sources/4am/unit11/extraction.json :
 * أستعدّ 1, 2, 5, 6 (p. 127, module 0), نشاط 1 (p. 128, module 1), معارف 1 (p. 130, module 2), نشاط 2 أ et معارف 2
 * (pp. 128 et 130, module 3), أؤكّد تعلّماتي 1–3 (p. 136, doublon déclaré, module 5). Ce que la plateforme ajoute est
 * déclaré (`addition(…)`).
 * La figure du نشاط 1 est REDESSINÉE (content/figures.js › FIG_ACT1) : les réponses de ACTIVITY_LINES sont celles de la
 * nouvelle figure (noms Q, S, T pour les images qui coïncidaient dans le dessin du manuel).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;

/** نشاط 1 (p. 128) — « الانسحاب ومفهوم الشعاع ». */
export const ACTIVITY = {
  source: src('act-1', 128, 'أنشطة', 1),
  title: 'الانسحاب ومفهوم الشعاع',
  situation: 'عرض مسيّرات مضيئة فوق خليج الجزائر يتعاون على إتقانه فريق من الشباب: التشكيلة كلها تنتقل بحركة واحدة. كيف نصف هذه الحركة، ومتى تكون صورة مسيّرة «في مكانها»؟',
  intro: 'لاحظ الشكل.',
  // les puces « • » du manuel sont neutres en bidi et brouillaient l'ordre (« R ، • A إلى G … ») : remplacées par « ثم بالذي يحوّل » (des mots arabes séparent les couples de lettres)
  part1a: '1) أ) عيّن في كل حالة مما يلي صورة المثلث ABC بواسطة الانسحاب الذي يحوّل A إلى G، ثم بالذي يحوّل C إلى R، ثم بالذي يحوّل A إلى M.',
  part1b: 'ب) المستقيمان (AG) و (CE) متوازيان، نقول إنّ لهما نفس المنحى. تحقّق أن للمستقيمات: (AG) ، (CE) ، (KH) و (AM) نفس المنحى.',
  part1c: 'جـ) قارن اتجاهات أنصاف المستقيمات [AG) ، [CE) ، [KH) و [AM).',
  part1d: 'د) قارن بين الطولين AG و CE ثم بين AG و KH.',
  part2a: '2) أ) عيّن في كل حالة مما يلي صورة المثلث ABC بالانسحاب الذي يحوّل A إلى A′، ثم بالذي يحوّل C إلى D، ثم بالذي يحوّل K إلى H.',
  part2b: 'ب) اشرح لماذا الانسحاب الذي يحوّل A إلى A′ هو نفسه الانسحاب الذي يحوّل C إلى D وهو أيضا الانسحاب الذي يحوّل K إلى H.',
  part2c: 'جـ) هل يُمكن إيجاد انسحاب آخر بحيث تكون صورة المثلث ABC بهذا الانسحاب هي نفسها بالانسحاب الذي يحوّل K إلى H.',
  closing: 'نقول إنّ الثنائيات $(A\\,;\\,A\')$ ، $(C\\,;\\,D)$ ، $(K\\,;\\,H)$ ، … المتكونة من نقطة و صورتها بهذا الانسحاب تُعرّف شعاعا $\\vec{u}$ يُرمز إليه بـ $\\overrightarrow{AA\'}$ أو بـ $\\overrightarrow{BB\'}$ أو بـ $\\overrightarrow{CC\'}$ ونكتب $\\vec{u} = \\overrightarrow{AA\'} = \\overrightarrow{CD} = \\overrightarrow{KH} = \\ldots$ . كُل من $\\overrightarrow{AA\'}$ ( أو $\\overrightarrow{CD}$ أو $\\overrightarrow{KH}$ …) هو مُمثّل للشعاع $\\vec{u}$ .',
  part2d: 'د) هل $\\overrightarrow{GL} = \\overrightarrow{EF}$ ؟ هل $\\overrightarrow{RP} = \\overrightarrow{EF}$ ؟ لماذا؟',
  part2e: 'هـ) عيّن ممثلين للشعاع $\\overrightarrow{NM}$ .',
  questions: [
    'عيّن صورة المثلث ABC بالانسحاب الذي يحوّل A إلى G، ثم C إلى R، ثم A إلى M.',
    'هل للمستقيمات (AG) و (CE) و (KH) و (AM) نفس المنحى؟ قارن اتجاهات أنصاف المستقيمات وأطوال القطع.',
    'لماذا الانسحاب الذي يحوّل A إلى A′ هو نفسه الذي يحوّل C إلى D و K إلى H؟',
    'هل $\\overrightarrow{GL} = \\overrightarrow{EF}$ ؟ هل $\\overrightarrow{RP} = \\overrightarrow{EF}$ ؟',
    'عيّن ممثلين للشعاع $\\overrightarrow{NM}$ .',
  ],
};

/** Ce que la plateforme écrit des réponses du نشاط 1 (le livre les demande sans les écrire) — calculées (extraction › answer). */
export const ACTIVITY_LINES = {
  source: PLATFORM,
  images: 'بالانسحاب الذي يحوّل A إلى G صورة المثلث ABC هي GQE ؛ بالذي يحوّل C إلى R هي SPR ؛ وبالذي يحوّل A إلى M هي MNT (على الشكل الذي أعادت المنصّة رسمه).',
  manha: 'المستقيمات (AG) و (CE) و (KH) و (AM) كلها أفقية، أي متوازية: لها نفس المنحى.',
  ittijah: 'أنصاف المستقيمات [AG) و [CE) و [KH) لها نفس الاتجاه (نحو اليسار) ؛ [AM) اتجاهها معاكس (نحو اليمين).',
  atwal: '$AG = CE = 6$ و $KH = 3$ (بضلع مربع الرصف وحدةً) ، إذن $AG \\neq KH$ .',
  same: 'الانسحاب الذي يحوّل A إلى A′ يحوّل C إلى D و K إلى H: الثنائيات $(A\\,;\\,A\')$ ، $(C\\,;\\,D)$ ، $(K\\,;\\,H)$ لها نفس المنحى ونفس الاتجاه ونفس الطول (3 مربعات نحو اليسار).',
  other: 'لا: الانسحاب يتعيّن بنقطة وصورتها؛ صورة K هي H، فالانسحاب هو الذي يحوّل K إلى H نفسه.',
  gl: 'لا: للشعاعين $\\overrightarrow{GL}$ و $\\overrightarrow{EF}$ نفس الطول (2) لكن منحيين مختلفين ([GL] أفقية و [EF] شاقولية).',
  rp: 'لا: للشعاعين $\\overrightarrow{RP}$ و $\\overrightarrow{EF}$ نفس المنحى ونفس الطول لكن اتجاهين متعاكسين.',
  nm: 'ممثّلات للشعاع $\\overrightarrow{NM}$ : $\\overrightarrow{BA}$ ، $\\overrightarrow{C\'A\'}$ ، $\\overrightarrow{QG}$ ، $\\overrightarrow{PS}$ (مربعان نحو اليسار وثلاثة نحو الأعلى).',
};

/** نشاط 2 أ (p. 128) — « تساوي شعاعين » (la partie ب est celle du درس « الشعاعان المتساويان … »). */
export const ACTIVITY_2 = {
  source: src('act-2', 128, 'أنشطة', 2),
  title: 'تساوي شعاعين',
  text: 'أ) لاحظ الشكل المقابل حيث ABC مثلث كيفي. 1) انقل هذا الشكل ثم أنشئ النقطة D بحيث يكون الرباعي ABCD متوازي أضلاع. 2) قارن بين الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$ . واستنتج العلاقة بينهما. اذكر شعاعين آخرين متساويين في الشكل.',
  answer: 'D صورة C بالانسحاب الذي يحوّل B إلى A ؛ $\\overrightarrow{AB} = \\overrightarrow{DC}$ ، وكذلك $\\overrightarrow{AD} = \\overrightarrow{BC}$ .',
};
export const ACTIVITY_2_LINES = {
  source: PLATFORM,
  construct: 'ABCD متوازي أضلاع يعني $(AB) \\parallel (DC)$ و $AB = DC$ والضلعان [AB] و [DC] متقابلان: ننقل C بنفس حركة B نحو A، فـ D صورة C بالانسحاب الذي يحوّل B إلى A.',
  compare: 'للشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$ نفس المنحى ((AB) // (DC)) ونفس الاتجاه (من A نحو B ومن D نحو C) ونفس الطول (AB = DC) : $\\overrightarrow{AB} = \\overrightarrow{DC}$ .',
  other: 'وكذلك $\\overrightarrow{AD} = \\overrightarrow{BC}$ : الضلعان الآخران متوازيان ومتقايسان، ومن A نحو D كما من B نحو C.',
  order: 'انتبه إلى ترتيب الحروف: $\\overrightarrow{AB} = \\overrightarrow{DC}$ يعطي متوازي الأضلاع ABCD، أما $\\overrightarrow{AB} = \\overrightarrow{CD}$ فيعطي متوازي الأضلاع ABDC (نقرأ A ثم B ثم نهاية الشعاع الثاني D ثم مبدؤه C).',
};

/** معارف 1 (p. 130) — « الانسحاب ومفهوم الشعاع ». */
export const KNOW1 = {
  source: src('know-1', 130, 'معارف', 1),
  title: 'الانسحاب ومفهوم الشعاع',
  manha: 'عندما يكون مستقيمان متوازيين، نقول إنّ لهذين المستقيمين نفس المنحى. للمستقيمين (d) و (d′) نفس المنحى معناه (d) // (d′). النقطتان المتمايزتان A و B تعيّنان على المستقيم (AB)، اتجاهين أحدهما من A نحو B والآخر من B نحو A.',
  shuaa: 'A و B نقطتان متمايزتان. الانسحاب الذي يحوّل A إلى B يحوّل أيضا C إلى D، E إلى F و M إلى N. كل من الثنائيات $(A\\,;\\,B)$ ، $(E\\,;\\,F)$ ، $(C\\,;\\,D)$ ، $(M\\,;\\,N)$ ، تعرّف نفس الشعاع $\\vec{u}$ الذي:',
  shuaaItems: [
    'منحاه هو منحى المستقيم (AB).',
    'اتجاهه هو من A نحو B.',
    'طويلته هي طول القطعة [AB].',
  ],
  shuaaNotation: 'يمكن أن نرمز لهذا الشعاع بالرمز $\\overrightarrow{AB}$ (مبدؤه A ونهايته B) أو $\\overrightarrow{CD}$ أو $\\overrightarrow{EF}$ أو $\\overrightarrow{MN}$ . نقول إنّ كل من $\\overrightarrow{AB}$ ، $\\overrightarrow{CD}$ ، $\\overrightarrow{EF}$ ، $\\overrightarrow{MN}$ ، … هو مُمثّل للشعاع $\\vec{u}$ .',
  tasawi: 'القول عن شعاعين أنّهما متساويان يعني أنّ لهما نفس المنحى ونفس الاتجاه ونفس الطول.',
  tasawiExample: 'مثال: $\\overrightarrow{AB} = \\overrightarrow{CD}$ معناه: للشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ : نفس المنحى، نفس الاتجاه ونفس الطول؛ والانسحاب الذي يحوّل A إلى B يحوّل أيضا C إلى D.',
};

/** معارف 2 (p. 130) — « الشعاعان المتساويان ومتوازي الأضلاع ». */
export const KNOW2 = {
  source: src('know-2', 130, 'معارف', 2),
  title: 'الشعاعان المتساويان ومتوازي الأضلاع',
  property: 'خاصية: A، B، C، D أربع نقط بحيث كل ثلاثة منها ليست في استقامية. $\\overrightarrow{AB} = \\overrightarrow{DC}$ تعني أنّ الرباعي ABCD متوازي أضلاع.',
  remarksIntro: 'ملاحظات: من أجل كل أربع نقط A، B، C، D لدينا:',
  remarks: [
    '$\\overrightarrow{AB} = \\overrightarrow{DC}$ معناه للقطعتين [AC] و [BD] نفس المنتصف.',
    'إذا كان $\\overrightarrow{AB} = \\overrightarrow{DC}$ فإن $\\overrightarrow{AD} = \\overrightarrow{BC}$ .',
  ],
  special: 'حالة خاصة: النقط A، B، C، D في استقامية.',
  specialLine: 'في هذه الحالة $\\overrightarrow{AB} = \\overrightarrow{DC}$ لا يعطي رباعيا (متوازي أضلاع «مسطّح»)، لكن القطعتين [AC] و [BD] تبقى لهما نفس المنتصف.',
};

/** « أؤكّد تعلّماتي » (p. 136) — items 1 à 3 (extraction › destinations › qcm : duplicatedIn ce درس, module 5). */
const QCM_SRC = (n) => src('qcm', 136, 'أؤكّد تعلّماتي', n);
export const QCM = {
  1: { source: QCM_SRC(1), text: 'على الشكل المقابل الشعاعان اللذان لهما نفس المنحى ونفس الاتجاه ونفس الطول هما…' },
  2: { source: QCM_SRC(2), text: 'إذا كانت النقطة T هي صورة S بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ فإن…' },
  3: { source: QCM_SRC(3), text: 'في الشكل المقابل لدينا…' },
};

/**
 * « أستعدّ » — les items 1, 2, 5 et 6 du manuel (p. 127) et deux affirmations de la plateforme (le parallélisme, le
 * sens d'une translation de 3AM). Une affirmation par question, une compétence par affirmation. Aucune n'utilise les
 * points du نشاط 1.
 */
const PREP_ADD = addition('prerequisite_diagnostic');
const PREP_SRC = (n) => src('prep', 127, 'أستعدّ', n);
export const PREP_ITEMS = [
  { n: '1', skill: 'qutr', text: 'الرباعي ABCD متوازي أضلاع يعني قطراه [AC] و [BD] لهما نفس المنتصف.', answer: true, why: 'خاصية متوازي الأضلاع وعكسها: القطران متناصفان.', source: PREP_SRC(1) },
  { n: '2', skill: 'tarif', text: 'في رباعي ABCD، لدينا (AB) و (CD) متوازيان. إذن ABCD متوازي أضلاع.', answer: false, why: 'شبه المنحرف له ضلعان متوازيان فقط: يلزم أن يكون (AD) // (BC) أيضا (أو AB = CD مع التوازي).', source: PREP_SRC(2) },
  { n: '5', skill: 'insihab', text: 'ABCD متوازي أضلاع. إذن C هي صورة D بالانسحاب الذي يحوّل A إلى B.', answer: true, why: 'في متوازي الأضلاع ABCD، الانسحاب الذي يحوّل A إلى B يحوّل D إلى C (السنة الثالثة).', source: PREP_SRC(5) },
  { n: '6', skill: 'atwal', text: 'A، B، C، D نقط حيث D هي صورة C بالانسحاب الذي يحوّل B إلى A. إذن القطعتان [AB] و [CD] متقايستان.', answer: true, why: 'الانسحاب يحافظ على الأطوال: BADC متوازي أضلاع (أو مسطّح) و CD = BA.', source: PREP_SRC(6) },
  { n: 'p1', skill: 'tawazi', text: 'إذا كان $(d) \\parallel (d\')$ و $(d\') \\parallel (\\Delta)$ فإن $(d) \\parallel (\\Delta)$ .', answer: true, why: 'مستقيمان يوازيان مستقيما ثالثا متوازيان.', source: PREP_ADD },
  { n: 'p2', skill: 'insihab', text: 'الانسحاب الذي يحوّل النقطة E إلى النقطة F يحوّل أيضا F إلى E.', answer: false, why: 'الانسحاب الذي يحوّل E إلى F يحرّك كل نقطة في نفس الجهة (من E نحو F)؛ الذي يحوّل F إلى E هو الانسحاب المعاكس له.', source: PREP_ADD },
];

/** Les deux mondes du lab (levels.js) : مبتدئ = le spectacle (plateforme) ; متقدم = le نشاط 1 du manuel. */
export const LAB = {
  beginner: { source: PLATFORM, numbers: { scene: 'show', grid: [9, 6], drones: { A: [1, 1], B: [3, 1], C: [2, 3] }, vector: [3, 1] } },
  advanced: { source: ACTIVITY.source, numbers: { scene: 'act1', grid: [14, 8] } },
};
