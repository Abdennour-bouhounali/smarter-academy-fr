/**
 * Le contenu du MANUEL pour le درس « قراءة مركبتي شعاع وتمثيلهما في معلم » (unité 12, entrée de l'unité) — données
 * pures (aucun JSX), au mot près ; chaque bloc cite son élément de docs/sources/4am/unit12/extraction.json :
 * أستعدّ 1 et 2 (p. 139, module 0), مدخل الباب « ديكارت وفيرما » (p. 139, doublon déclaré, module 1), نشاط 1 (p. 140,
 * module 1), معارف 1, 2, 3 أ et la « نتيجة » (pp. 142 et 144, module 2), طرائق « تمثيل شعاع علمت مركبتاه » et دوري الآن 1
 * (p. 143, module 3), أؤكّد تعلّماتي 1 (p. 148, doublon déclaré, module 5). Ce que la plateforme ajoute est déclaré
 * (`addition(…)`).
 * UNE COQUILLE corrigée (extraction › discrepancies) : la « نتيجة » de معارف imprime A « (2,5 ; -3-) » — un couple
 * retourné par la mise en page RTL ; les composantes imprimées dessous fixent A(−3 ; 2,5).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;
export const FORMALIZATION_SOURCE = addition('knowledge_formalization');

/** مدخل الباب (p. 139) — la mouche de Descartes, l'accroche concrète du معلم (doublon déclaré). */
export const DESCARTES = {
  source: src('intro-descartes', 139, 'مدخل الباب'),
  title: 'ديكارت وفيرما',
  text: 'ويحكى أن ديكارت، وبينما كان يشاهد ذبابة تحط على مواقع مختلفة من نافذته التي تتكون من بلاطات زجاجية صغيرة، أخذ يحدّد موقع هذه الذبابة بعددين سُمّيا فيما بعد إحداثيتي نقطة في معلم.',
};

/** نشاط 1 (p. 140) — « قراءة مركّبتي شعاع ». */
export const ACTIVITY = {
  source: src('act-1', 140, 'أنشطة', 1),
  title: 'قراءة مركّبتي شعاع',
  situation: 'تطبيق توصيل على هاتفك: سائق يحترم مواعيد زبائنه يجوب شوارع حيّ مرسوم كشبكة. كيف نكتب رحلته من مطعم إلى بيت زبون بعددين، كما كتب ديكارت موقع الذبابة بعددين؟',
  intro: 'المستوي مزوّد بمعلم متعامد ومتجانس $(O\\,;\\,I\\,,J)$ (يُسمّى المَعلم $(O\\,;\\,I\\,,J)$ مَعلمًا متعامدا ومتجانسا في حالة $OI = OJ = 1$ و $(OI) \\perp (OJ)$ ) (الشكل).',
  part1: '1) عيّن إحداثيتي كل نقطة من النقاط A، B، C.',
  part2: '2) النقطة C هي صورة النقطة A بالانسحاب الذي شعاعه $\\overrightarrow{AC}$ . ماهو طول هذا الشعاع؟ ماهو منحاه؟ ماهو اتجاهه؟ النقطة B هي صورة النقطة C بانسحاب. ماهو شعاع هذا الانسحاب؟ عيّن منحى، اتّجاه وطول هذا الشعاع.',
  part3: '3) لاحظ أنّ الإنتقال من A إلى C يكون، بموازاة المستقيم (OI)، في الاتجاه الموجب بـ 8 وحدات. ثم ننتقل من C إلى B، بموازاة المستقيم (OJ)، في الاتجاه السالب بوحدتين. نقول إنّ 8 و $-2$ هما مركبتا الشعاع $\\overrightarrow{AB}$ ونكتب $\\overrightarrow{AB}\\begin{pmatrix} 8 \\\\ -2 \\end{pmatrix}$ .',
  part4: '4) D هي نقطة إحداثياها $(3\\,;\\,-2)$ . باستعمال نفس الكيفية التي رأيتها في الجزء (3) للانتقال من النقطة B إلى النقطة D، استنتج مركبتي الشعاع $\\overrightarrow{BD}$ .',
  part5: '5) عيّن مركبتي كل شعاع من الأشعة $\\overrightarrow{OA}$ ، $\\overrightarrow{OB}$ ، $\\overrightarrow{OC}$ ، $\\overrightarrow{OD}$ . انقل وأتمم: «إذا كانت M نقطة إحداثياها $(x\\,;\\,y)$ في مَعلَم من المستوي مبدؤه O، فإنّ مركبتي الشعاع $\\overrightarrow{OM}$ هما… و …».',
  questions: [
    'عيّن إحداثيتي كل نقطة من النقاط A، B، C.',
    'ما طول الشعاع $\\overrightarrow{AC}$ ومنحاه واتجاهه؟ وما شعاع الانسحاب الذي يحوّل C إلى B؟',
    'ما مركبتا الشعاع $\\overrightarrow{AB}$ ؟',
    'D نقطة إحداثياها $(3\\,;\\,-2)$ : استنتج مركبتي الشعاع $\\overrightarrow{BD}$ .',
    'عيّن مركبتي $\\overrightarrow{OA}$ ، $\\overrightarrow{OB}$ ، $\\overrightarrow{OC}$ ، $\\overrightarrow{OD}$ وأتمم: مركبتا $\\overrightarrow{OM}$ هما… و …',
  ],
  closing: 'نقول إنّ 8 و $-2$ هما مركبتا الشعاع $\\overrightarrow{AB}$ ونكتب $\\overrightarrow{AB}\\begin{pmatrix} 8 \\\\ -2 \\end{pmatrix}$ .',
};

/** Ce que la plateforme écrit des réponses du نشاط 1 (le livre les demande sans les écrire) — extraction › answer (calculées). */
export const ACTIVITY_LINES = {
  source: PLATFORM,
  coords: 'على الشكل: $A(-2\\,;\\,4)$ ، $B(6\\,;\\,2)$ ، $C(6\\,;\\,4)$ .',
  ac: 'طول $\\overrightarrow{AC}$ هو 8، منحاه منحى (OI) (أفقي)، واتجاهه الاتجاه الموجب (من اليسار نحو اليمين).',
  cb: 'الشعاع $\\overrightarrow{CB}$ : منحاه منحى (OJ) (شاقولي)، اتجاهه الاتجاه السالب (نحو الأسفل)، وطوله 2.',
  bd: 'من $B(6\\,;\\,2)$ إلى $D(3\\,;\\,-2)$ ننتقل بـ 3 وحدات في الاتجاه السالب بموازاة (OI) ثم بـ 4 وحدات في الاتجاه السالب بموازاة (OJ): $\\overrightarrow{BD}\\begin{pmatrix} -3 \\\\ -4 \\end{pmatrix}$ .',
  om: '$\\overrightarrow{OA}\\begin{pmatrix} -2 \\\\ 4 \\end{pmatrix}$ ، $\\overrightarrow{OB}\\begin{pmatrix} 6 \\\\ 2 \\end{pmatrix}$ ، $\\overrightarrow{OC}\\begin{pmatrix} 6 \\\\ 4 \\end{pmatrix}$ ، $\\overrightarrow{OD}\\begin{pmatrix} 3 \\\\ -2 \\end{pmatrix}$ : مركبتا كل شعاع مبدؤه O هما إحداثيتا نهايته.',
  rule: 'مركبتا الشعاع $\\overrightarrow{OM}$ هما x و y: $\\overrightarrow{OM}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ .',
};

/** معارف 1 (p. 142) — « مركبتا شعاع ». */
export const KNOW1 = {
  source: src('know-1', 142, 'معارف', 1),
  title: 'مركبتا شعاع',
  property: 'المستوي مُزوّد بمعلم $(O\\,;\\,I\\,,J)$ مبدؤه النقطة O. إذا كانت M نقطة من المستوي إحداثيتاها $(x\\,;\\,y)$ ، فإنّ مركبتي الشعاع $\\overrightarrow{OM}$ هما x و y نكتب $\\overrightarrow{OM}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ .',
  example: 'مثال: إحداثيتا النقطة B هما $-3$ و 4 نكتب $B(-3\\,;\\,4)$ . مركبتا الشعاع $\\overrightarrow{OB}$ هما $-3$ و 4 نكتب $\\overrightarrow{OB}\\begin{pmatrix} -3 \\\\ 4 \\end{pmatrix}$ .',
};

/** معارف 2 (p. 142) — « أنواع المعالم ». */
export const KNOW2 = {
  source: src('know-2', 142, 'معارف', 2),
  title: 'أنواع المعالم',
  text: 'النقطة A إحداثياها 3 و 2 نكتب $A(3\\,;\\,2)$ والشعاع $\\overrightarrow{OA}$ مركبتاه 3 و 2 نكتب $\\overrightarrow{OA}\\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix}$',
  cases: [
    { id: 'mutaamid-mutajanis', name: 'معلم متعامد متجانس', conditions: ['$OI = OJ$', '$(OI) \\perp (OJ)$'] },
    { id: 'mutaamid', name: 'معلم متعامد', conditions: ['$OI \\neq OJ$', '$(OI) \\perp (OJ)$'] },
    { id: 'mutajanis', name: 'معلم متجانس', conditions: ['$OI = OJ$', '$(OI)$ و $(OJ)$ غير متعامدين'] },
    { id: 'kayfi', name: 'معلم كيفي', conditions: ['$OI \\neq OJ$', '$(OI)$ و $(OJ)$ غير متعامدين'] },
  ],
};

/** معارف 3 أ (p. 142) — « القراءة في تمثيل بياني » (la partie ب est celle du درس « حساب مركبتي شعاع … »). */
export const KNOW3 = {
  source: { ...src('know-3', 142, 'معارف', 3), part: 'أ' },
  title: 'مركبتا شعاع علمت إحداثيات مبدئه ونهايته — أ) القراءة في تمثيل بياني',
  intro: 'المستوي مزود بمعلم متعامد ومتجانس $(O\\,;\\,I\\,,J)$ ، مبدؤه O.',
  ab: 'لقراءة مركبتي الشعاع $\\overrightarrow{AB}$ ، ننتقل من النقطة A بالتوازي مع المستقيم (OI) في الاتجاه الموجب (نحو اليمين) بـ 7 وحدات ثم ننتقل بالتوازي مع المستقيم (OJ) في الاتجاه الموجب (نحو الأعلى) بـ 3 وحدات للوصول إلى النقطة B. ونقرأ: مركبتي الشعاع $\\overrightarrow{AB}$ هما 7 و 3. ونكتب $\\overrightarrow{AB}\\begin{pmatrix} 7 \\\\ 3 \\end{pmatrix}$ .',
  cd: 'لقراءة مركبتي الشعاع $\\overrightarrow{CD}$ ننتقل من النقطة C في الاتجاه السالب (نحو اليسار) بالتوازي مع المستقيم (OI) بـ 5 وحدات ثم ننتقل في الاتجاه الموجب (نحو الأعلى) بالتوازي مع المستقيم (OJ) بوحدة واحدة للوصول إلى النقطة D. ونقرأ: مركبتا الشعاع $\\overrightarrow{CD}$ هما $-5$ و 1. ونكتب عندئذ $\\overrightarrow{CD}\\begin{pmatrix} -5 \\\\ 1 \\end{pmatrix}$ .',
};

/** La « نتيجة » des معارف (p. 144) — OM et les coordonnées de M ; l'exemple CORRIGÉ (A « (2,5 ; -3-) » → A(−3 ; 2,5)). */
export const KNOW_ORIGIN = {
  source: src('know-origin', 144, 'معارف'),
  title: 'نتيجة: مركبتا الشعاع OM',
  property: 'نتيجة: في مستوٍ منسوب إلى مَعلم مبدؤه O، إذا كانت M نقطة إحداثيتاها $(x\\,;\\,y)$ فإنّ مركبتي الشعاع $\\overrightarrow{OM}$ هما x و y. نكتب $\\overrightarrow{OM}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ .',
  remark: 'ملاحظة: لتعيين ممثلا للشعاع $\\overrightarrow{OM}$ يكفي تعليم النقطة M.',
  example: 'مثال: إحداثيتا النقطة A هما $(-3\\,;\\,2{,}5)$ . إذن مركبتا الشعاع $\\overrightarrow{OA}$ هما $\\begin{pmatrix} -3 \\\\ 2{,}5 \\end{pmatrix}$ . نكتب $\\overrightarrow{OA}\\begin{pmatrix} -3 \\\\ 2{,}5 \\end{pmatrix}$ .',
  correction: 'صحّحت المنصّة خطأً مطبعيًا: طُبعت إحداثيتا A «(2,5 ; -3-)» مقلوبتين، والصحيح $A(-3\\,;\\,2{,}5)$ كما تدلّ عليه المركّبتان تحتها.',
};

/** طرائق (p. 143) — « تمثيل شعاع علمت مركبتاه ». */
export const METHOD_DRAW = {
  source: src('method-draw', 143, 'طرائق'),
  title: 'تمثيل شعاع علمت مركبتاه',
  exercise: 'تمرين: المستوي مزود بمعلم متعامد ومتجانس، مبدؤه النقطة O. الوحدة هي طول ضلع مربّع من المرصوفة. 1) أنشئ الشعاع $\\overrightarrow{AB}$ حيث $\\overrightarrow{AB} = \\vec{u}$ و $\\vec{u}\\begin{pmatrix} 3 \\\\ -4 \\end{pmatrix}$ . 2) أنشئ ممثلا آخر $\\overrightarrow{EF}$ للشعاع $\\vec{u}$ .',
  solution: [
    'حل: 1) إنشاء الشعاع $\\overrightarrow{AB}$ حيث $\\overrightarrow{AB} = \\vec{u}$ .',
    'للحصول على ممثل أوّل، نختار نقطة A إحداثياها مثلا $(-2\\,;\\,1)$ نحوّل A بانسحاب مُوازٍ لمحور الفواصل بـ 3 وحدات إلى اليمين (في الاتجاه الموجب) فنتحصل على النقطة $A_1$ .',
    'نحوّل النقطة $A_1$ بانسحاب، مُوازٍ لمحور التراتيب بـ 4 وحدات إلى الأسفل (في الاتجاه السالب) فنتحصل على النقطة B.',
    'ننشئ الشعاع $\\overrightarrow{AB}$ . وهكذا نتحصل على ممثّل للشعاع $\\vec{u}$ .',
    '2) إنشاء الشعاع $\\overrightarrow{EF}$ حيث $\\overrightarrow{EF} = \\overrightarrow{AB}$ . نختار النقطة E ونعيّن النقطة F حيث $\\overrightarrow{EF} = \\overrightarrow{AB}$ . يعني الرباعي EABF متوازي أضلاع. لإنشاء F يكفي إنشاء المتوازي الأضلاع EABF.',
  ],
  // la « طريقة » réemploie la lettre u pour (a ; 0) : la plateforme écrit u₁ et u₂ (extraction › discrepancies, lecture)
  rule: 'طريقة: لتمثيل شعاع عُلمت مركبتاه $\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ ، نختار نقطة كمبدإ لهذا الممثل ثم نحولها بالانسحاب الذي شعاعه $\\vec{u_1}\\begin{pmatrix} a \\\\ 0 \\end{pmatrix}$ فنحصل على نقطة نحولها بدورها بالانسحاب الذي شعاعه $\\vec{u_2}\\begin{pmatrix} 0 \\\\ b \\end{pmatrix}$ للحصول على نهاية الشعاع المعطى.',
  rename: 'سمّت المنصّة الشعاعين $\\vec{u_1}$ و $\\vec{u_2}$ في الطريقة، لأن الكتاب يستعمل الحرف نفسه $\\vec{u}$ للشعاع $\\begin{pmatrix} 3 \\\\ -4 \\end{pmatrix}$ .',
  efLine: 'على الشكل الذي أعادت المنصّة رسمه اخترنا $E(3\\,;\\,3)$ : ننتقل 3 نحو اليمين ثم 4 نحو الأسفل فنجد $F(6\\,;\\,-1)$ .',
};

/** دوري الآن 1 (p. 143). */
export const NOW_143 = {
  source: src('now-143', 143, 'دوري الآن', 1),
  text: 'المستوي مزود بمَعلم متعامد ومتجانس، مبدؤه النقطة O. أنشئ ممثلا لكل شعاع من الشعاعين $\\vec{u}\\begin{pmatrix} 2 \\\\ 4 \\end{pmatrix}$ و $\\vec{v}\\begin{pmatrix} -3 \\\\ 2 \\end{pmatrix}$ .',
  lead: 'في تطبيق التوصيل: الكودان معطيان، ضع وجهة كل منهما انطلاقا من نقطة غير O ثم من O.',
};

/** « أؤكّد تعلّماتي » (p. 148) — item 1 (extraction › destinations › qcm : duplicatedIn ce درس, module 5). */
export const QCM1 = { source: src('qcm', 148, 'أؤكّد تعلّماتي', 1), text: 'في الشكل المقابل، مركبتا الشعاع $\\overrightarrow{AB}$ هما …' };

/**
 * « أستعدّ » — l'item 1 du manuel (p. 139, quatre affirmations sur le معلم dessiné), l'item 2, et deux affirmations de la
 * plateforme sur le vecteur de l'unité 11 (المنحى، الاتجاه، الطول ; l'égalité et la translation). Une affirmation par
 * question, une compétence par affirmation. Aucune n'utilise les points du نشاط 1.
 */
const PREP_ADD = addition('prerequisite_diagnostic');
const PREP_SRC = (n) => src('prep', 139, 'أستعدّ', n);
export const PREP_ITEMS = [
  { n: '1a', skill: 'ihdathiyat', text: 'في المعلم المرسوم: إحداثيتا A هما $(2\\,;\\,3)$ .', answer: true, why: 'A على يمين محور التراتيب بوحدتين وفوق محور الفواصل بثلاث وحدات.', source: PREP_SRC(1) },
  { n: '1b', skill: 'ihdathiyat', text: 'في المعلم المرسوم: إحداثيتا B هما $(3\\,;\\,3)$ .', answer: false, why: 'B على يسار محور التراتيب: إحداثيتاها $(-3\\,;\\,3)$ .', source: PREP_SRC(1) },
  { n: '1c', skill: 'mudarraj', text: 'في المعلم المرسوم: إحداثيتا منتصف القطعة [DC] هما $(0\\,;\\,0)$ .', answer: true, why: 'D و C على محور الفواصل عند $-3$ و 3: منتصف [DC] هو المبدأ O.', source: PREP_SRC(1) },
  { n: '1d', skill: 'mudarraj', text: 'في المعلم المرسوم: المسافة بين C و D هي 0.', answer: false, why: 'المسافة CD هي 6 وحدات (من $-3$ إلى 3)، وليست مجموع الفاصلتين 3 و $-3$ .', source: PREP_SRC(1) },
  { n: '2', skill: 'mihwar', text: 'في معلم للمستوي، النقطتان $M(0\\,;\\,1)$ و $N(1\\,;\\,0)$ تقعان على محور الفواصل.', answer: false, why: 'N على محور الفواصل (ترتيبها 0)، أما M فعلى محور التراتيب (فاصلتها 0).', source: PREP_SRC(2) },
  { n: 'p1', skill: 'shuaa', text: 'الشعاع $\\overrightarrow{EF}$ منحاه منحى المستقيم (EF) واتجاهه من F نحو E.', answer: false, why: 'اتجاه الشعاع $\\overrightarrow{EF}$ من مبدئه E نحو نهايته F (الوحدة السابقة).', source: PREP_ADD },
  { n: 'p2', skill: 'tasawi', text: 'إذا كان $\\overrightarrow{KL} = \\overrightarrow{RS}$ فإن الانسحاب الذي يحوّل K إلى L يحوّل أيضا R إلى S.', answer: true, why: 'شعاعان متساويان: نفس المنحى ونفس الاتجاه ونفس الطول، أي نفس الانسحاب (الوحدة السابقة).', source: PREP_ADD },
];

/** Les deux mondes du lab (levels.js) : مبتدئ = le quartier (plateforme) ; متقدم = le نشاط 1 du manuel. */
export const LAB = {
  beginner: {
    source: PLATFORM,
    numbers: {
      grid: [-4, 4, -3, 4],
      points: { A: [-4, -3], B: [-1, -1], C: [1, 1], D: [4, 3], E: [3, 1], F: [1, -2], M: [-3, 2], P: [-4, 4], Q: [-1, 2] },
      orders: [
        { id: '1', kind: 'walk', from: 'A', to: 'B' },
        { id: '2', kind: 'code', from: 'C', to: 'D' },
        { id: '3', kind: 'code', from: 'E', to: 'F' },
        { id: '4', kind: 'code', from: 'O', to: 'M' },
        { id: '5', kind: 'pin', from: 'P', u: [3, -2], to: 'Q' },
      ],
      live: true,
    },
  },
  advanced: {
    source: ACTIVITY.source,
    numbers: {
      grid: [-3, 7, -3, 5],
      points: { A: [-2, 4], B: [6, 2], C: [6, 4], D: [3, -2], E: [1, 0] },
      orders: [
        { id: 'AB', kind: 'walkCode', from: 'A', to: 'B' },
        { id: 'BD', kind: 'code', from: 'B', to: 'D', hidden: true },
        { id: 'OA', kind: 'code', from: 'O', to: 'A' },
        { id: 'OD', kind: 'code', from: 'O', to: 'D' },
        { id: 'u', kind: 'pin', from: 'A', u: [3, -4], to: 'E' },
      ],
      live: false,
    },
  },
  // دوري الآن 1, posé SEUL au module 3 (levels={false}) : u(2 ; 4) depuis R puis depuis O, v(−3 ; 2) depuis S.
  draw: {
    source: NOW_143.source,
    numbers: {
      grid: [-4, 4, -2, 5],
      points: { R: [-3, -2], U: [-1, 2], S: [4, 1], V: [1, 3], W: [2, 4] },
      orders: [
        { id: 'u', kind: 'pin', from: 'R', u: [2, 4], to: 'U' },
        { id: 'v', kind: 'pin', from: 'S', u: [-3, 2], to: 'V' },
        { id: 'uO', kind: 'pin', from: 'O', u: [2, 4], to: 'W' },
      ],
      live: true,
      story: 'draw',
    },
  },
};
