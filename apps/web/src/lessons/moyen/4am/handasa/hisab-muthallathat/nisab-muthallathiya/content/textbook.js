/**
 * Le contenu du MANUEL pour le درس « النسب المثلثية لزاوية حادة في مثلث قائم » (unité 10, entrée de l'unité) —
 * données pures (aucun JSX), au mot près ; chaque bloc cite son élément de docs/sources/4am/unit10/extraction.json :
 * أستعدّ 1, 4–6 (p. 115, module 0), نشاط 1 et 2 (p. 116, module 1), نشاط 3, معارف 1 et 2 (pp. 116–118, module 2) et
 * l'encadré « نصير الدين الطوسي » (p. 115, doublon déclaré : les noms), طرائق sin / cos / tan et دوري الآن (p. 119,
 * module 3), أؤكّد تعلّماتي 1–5 (p. 124, doublon déclaré, module 8). Ce que la plateforme ajoute est déclaré (`addition(…)`).
 * Une coquille du manuel est CORRIGÉE ici (extraction › know-2 › correction) : l'exemple « tan B = AC/BC » → AC/AB.
 * Les séquences de touches de la calculatrice sont des DONNÉES ({ keys, screen }) : le module les montre en code LTR.
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;

/** L'encadré du début de l'unité (p. 115) — doublon déclaré au module 2 : les noms جيب، جيب التمام، الظل. */
export const TUSI = {
  source: src('intro-tusi', 115, 'مدخل الباب'),
  title: 'نصير الدين الطوسي',
  text: 'يُعتبر «نصير الدين الطوسي» و«أبو الوفاء» المؤسسين الحقيقيين لميدان حساب المثلثات. في أواخر القرون الوسطى، توصل هذان العالمان بصفة نهائية إلى إعطاء التسميات: الجيب، جيب التمام والظل على المفاهيم المكتشفة. إن مفهوم الظل أدرج في الرياضيات من طرف الرياضياتي العربي حبش الحاسب.',
};

/** نشاط 1 (p. 116) — « جيب تمام زاوية حادة في مثلث قائم ». */
export const ACTIVITY = {
  source: src('act-1', 116, 'أنشطة', 1),
  title: 'جيب تمام زاوية حادة في مثلث قائم',
  situation: 'في حديقة التزلج التي بناها شباب الحيّ بالتعاون، كل منحدر مثلث قائم: اللوح الذي ينزلق عليه المتزلج، الارتفاع، والأرض. أيّ الأضلاع هو الوتر؟ وماذا يبقى ثابتا حين يكبر المنحدر؟',
  text: '1) إليك الشكل المقابل. لاحظ أن المثلث ABC قائم في A. ما هو وتره؟ عيّن قيس الزاوية $\\widehat{B}$ (بالدرجات). ما هو الضلع المجاور للزاوية $\\widehat{C}$؟ ما هو الضلع المقابل لها؟',
  part2: '2) النسبة $\\dfrac{AC}{BC}$ تسمى جيب تمام الزاوية $\\widehat{C}$ ويرمز إليها $\\cos\\widehat{C}$. انقل وأتمم: $\\cos 25^{\\circ} = \\dfrac{\\ldots}{\\ldots}$ . ما هي القيمة المضبوطة للعدد $\\cos\\widehat{B}$؟ باستعمال حاسبة، عيّن المدوّر إلى الجزء من 100 للعددين $\\cos 75^{\\circ}$ و $\\cos 25^{\\circ}$ .',
  questions: [
    'ما هو وتر المثلث ABC القائم في A؟',
    'عيّن قيس الزاوية $\\widehat{B}$ علما أن $\\widehat{C} = 25^{\\circ}$ .',
    'ما هو الضلع المجاور للزاوية $\\widehat{C}$؟ ما هو الضلع المقابل لها؟',
    'أتمم: $\\cos 25^{\\circ} = \\dfrac{\\ldots}{\\ldots}$ ، وما القيمة المضبوطة للعدد $\\cos\\widehat{B}$؟',
    'المدوّر إلى الجزء من 100 للعددين $\\cos 75^{\\circ}$ و $\\cos 25^{\\circ}$ .',
  ],
  closing: 'النسبة $\\dfrac{AC}{BC}$ تسمى جيب تمام الزاوية $\\widehat{C}$ ويرمز إليها $\\cos\\widehat{C}$ .',
  answer: { B: 65, cos25: '0,91', cos75: '0,26' },
};

/** Ce que la plateforme écrit des réponses du نشاط 1 (le livre les demande sans les écrire). */
export const ACTIVITY_LINES = {
  source: PLATFORM,
  angles: '$\\widehat{B} = 180^{\\circ} - 90^{\\circ} - 25^{\\circ} = 65^{\\circ}$ .',
  sides: 'الوتر هو [BC] (يقابل الزاوية القائمة A). بالنسبة إلى $\\widehat{C}$ : المجاور [AC] (يمرّ بالرأس C) والمقابل [AB] (لا يمرّ به).',
  cos25: '$\\cos 25^{\\circ} = \\cos\\widehat{C} = \\dfrac{AC}{BC}$ (المجاور للزاوية C على الوتر).',
  cosB: 'بالنسبة إلى $\\widehat{B}$ المجاور هو [AB]: القيمة المضبوطة هي $\\cos\\widehat{B} = \\dfrac{AB}{BC}$ .',
  values: 'الحاسبة (بالدرجة) تعطي $\\cos 75^{\\circ} \\approx 0{,}2588$ و $\\cos 25^{\\circ} \\approx 0{,}9063$ ، فالمدوّران إلى الجزء من 100 هما $0{,}26$ و $0{,}91$ .',
};

/** نشاط 2 (p. 116) — « جيب زاوية حادة وظلها في مثلث قائم ». */
export const ACTIVITY_2 = {
  source: src('act-2', 116, 'أنشطة', 2),
  title: 'جيب زاوية حادة وظلها في مثلث قائم',
  part1: '1) أ) ارسم مثلثا ABC قائما في A حيث $\\widehat{ABC} = 40^{\\circ}$ . ب) أنجز على الشكل القياسات اللازمة لحساب كل من $\\dfrac{AC}{BC}$ و $\\dfrac{AC}{AB}$ . جـ) قارن ما وجدته مع زملائك. د) ماذا تلاحظ؟ ضع تخمينا اعتمادا على ملاحظتك.',
  part2: '2) من التخمين إلى البرهان. لاحظ الشكل المقابل. 1) برّر صحة المساواتين: $\\dfrac{BC}{BC\'} = \\dfrac{AC}{A\'C\'}$ و $BC\' \\times AC = BC \\times A\'C\'$ واستنتج أن $\\dfrac{AC}{BC} = \\dfrac{A\'C\'}{BC\'}$ . 2) برّر المساواة $\\dfrac{BA}{BA\'} = \\dfrac{AC}{A\'C\'}$ ثم أثبت أن $\\dfrac{AC}{AB} = \\dfrac{A\'C\'}{A\'B}$ . هل النسبتان $\\dfrac{AC}{BC}$ و $\\dfrac{AC}{AB}$ تتعلقان بموقع النقطة A على نصف المستقيم [Bx)؟',
  naming: 'النسبة $\\dfrac{AC}{BC}$ تسمى جيب الزاوية $\\widehat{B}$ ويرمز إليها $\\sin\\widehat{B}$ . النسبة $\\dfrac{AC}{AB}$ تسمى ظل الزاوية $\\widehat{B}$ ويرمز إليها $\\tan\\widehat{B}$ .',
  conjecture: 'النسبتان لا تتعلقان بطول الأضلاع بل بقيس الزاوية فقط: $\\dfrac{AC}{BC} \\approx 0{,}64$ و $\\dfrac{AC}{AB} \\approx 0{,}84$ لكل التلاميذ.',
};
export const ACTIVITY_2_LINES = {
  source: PLATFORM,
  parallel: 'المستقيمان (AC) و (A′C′) عموديان على المستقيم نفسه (Bx) فهما متوازيان: المثلثان BAC و BA′C′ في وضعية طالس، ومنه $\\dfrac{BA}{BA\'} = \\dfrac{BC}{BC\'} = \\dfrac{AC}{A\'C\'}$ .',
  cross: 'من $\\dfrac{BC}{BC\'} = \\dfrac{AC}{A\'C\'}$ (الجداء المتصالب) $BC\' \\times AC = BC \\times A\'C\'$ ، وبقسمة الطرفين على $BC \\times BC\'$ : $\\dfrac{AC}{BC} = \\dfrac{A\'C\'}{BC\'}$ . وبالطريقة نفسها من $\\dfrac{BA}{BA\'} = \\dfrac{AC}{A\'C\'}$ : $\\dfrac{AC}{AB} = \\dfrac{A\'C\'}{A\'B}$ .',
};

/** نشاط 3 (p. 116) — « في مثلث قائم ». */
export const ACT3 = {
  source: src('act-3', 116, 'أنشطة', 3),
  title: 'في مثلث قائم',
  part1: '1) ABC مثلث قائم في A، $\\widehat{B}$ زاوية حادة. انقل ما يلي وأتمم باستعمال العبارات: الضلع المقابل، الضلع المجاور، الوتر.',
  part2: '2) من أجل كل زاوية حادة $\\widehat{B}$ ، اشرح لماذا: $0 < \\sin\\widehat{B} < 1$ و $0 < \\cos\\widehat{B} < 1$',
  bounds: 'الأطوال موجبة تماما، والوتر أطول من كل ضلع من ضلعي الزاوية القائمة (فيثاغورس: $BC^2 = AB^2 + AC^2 > AC^2$)، فالبسط أصغر من المقام.',
};

/** معارف 1 (p. 118) — « جيب زاوية حادة ». */
export const KNOW1 = {
  source: src('know-1', 118, 'معارف', 1),
  title: 'جيب زاوية حادة',
  definition: 'في مثلث قائم، جيب زاوية حادة يساوي حاصل القسمة:',
  num: 'طول الضلع المقابل لهذه الزاوية',
  den: 'طول الوتر',
  example: 'ABC مثلث قائم في A، جيب الزاوية $\\widehat{B}$ يساوي النسبة $\\dfrac{AC}{BC}$ . يُرمز لهذه النسبة بالرمز $\\sin\\widehat{B}$ ونكتب $\\sin\\widehat{B} = \\dfrac{AC}{BC}$ .',
  reminder: 'تذكير: جيب تمام الزاوية $\\widehat{B}$ يساوي النسبة $\\dfrac{AB}{BC}$ يُرمز لهذه النسبة بالرمز $\\cos\\widehat{B}$ ويقرأ جيب تمام الزاوية $\\widehat{B}$ . نكتب $\\cos\\widehat{B} = \\dfrac{AB}{BC}$ .',
  remark: 'ملاحظة: الوتر هو أكبر ضلع في المثلث القائم. بالتالي $\\sin\\widehat{B}$ و $\\cos\\widehat{B}$ هما عددان محصوران بين 0 و 1',
  example2: 'مثال: في الشكل المقابل: لدينا $\\sin\\widehat{E} = \\dfrac{3}{\\sqrt{13}}$ ، $\\cos\\widehat{E} = \\dfrac{2}{\\sqrt{13}}$ ، $\\sin\\widehat{F} = \\dfrac{2}{\\sqrt{13}}$ ، $\\cos\\widehat{F} = \\dfrac{3}{\\sqrt{13}}$ .',
  exact: '$\\dfrac{3}{\\sqrt{13}}$ هي القيمة المضبوطة للعدد $\\sin\\widehat{E}$ . باستعمال حاسبة، نجد أن 0,83 هي قيمة مقربة إلى $\\dfrac{1}{100}$ للعدد $\\sin\\widehat{E}$ .',
};

/** معارف 2 (p. 118) — « ظل زاوية حادة » ; l'exemple CORRIGÉ (AC/BC → AC/AB). */
export const KNOW2 = {
  source: src('know-2', 118, 'معارف', 2),
  title: 'ظل زاوية حادة',
  definition: 'في مثلث قائم، ظل زاوية حادة يساوي حاصل القسمة:',
  num: 'طول الضلع المقابل لهذه الزاوية',
  den: 'طول الضلع المجاور لهذه الزاوية',
  example: 'مثال: ABC مثلث قائم في A، ظل الزاوية $\\widehat{B}$ يساوي النسبة $\\dfrac{AC}{AB}$ . يرمز لهذه النسبة بالرمز $\\tan\\widehat{B}$ ونكتب $\\tan\\widehat{B} = \\dfrac{AC}{AB}$ .',
  correction: 'صحّحت المنصّة خطأً مطبعيًا: الكتاب يكتب في المثال $\\tan\\widehat{B} = \\dfrac{AC}{BC}$ ، والصواب $\\tan\\widehat{B} = \\dfrac{AC}{AB}$ (السطر نفسه يقول إن الظل هو النسبة $\\dfrac{AC}{AB}$ ، و $\\dfrac{AC}{BC}$ هو الجيب).',
  remark: 'ملاحظة: ظل زاوية حادة في مثلث قائم هو عدد موجب.',
  example2: 'مثال: EFG مثلث قائم في F. لدينا $\\tan\\widehat{E} = \\tan 30^{\\circ} = \\dfrac{\\sqrt{3}}{3}$ .',
  remarks: [
    '$\\dfrac{\\sqrt{3}}{3}$ هي القيمة المضبوطة للعدد $\\tan 30^{\\circ}$ .',
    '0,58 هي قيمة عشرية مقرّبة للعدد $\\tan 30^{\\circ}$ .',
    '1,73 هي قيمة مقربة إلى الجزء من 100 للعدد $\\tan 60^{\\circ}$ .',
  ],
};

/** طرائق (p. 119) — les trois méthodes ; la ligne « clavier » est une donnée { keys, screen }. */
export const METHODS = {
  sin: {
    source: src('method-sin', 119, 'طرائق'),
    title: 'حساب طول ضلع مثلث قائم باستعمال الجيب',
    exercise: 'ABC مثلث قائم في A حيث $AC = 2{,}5\\,\\mathrm{cm}$ و $\\widehat{B} = 25^{\\circ}$ . احسب BC. أعط المدوّر إلى الجزء من 100 للطول BC.',
    solution: [
      'في المثلث ABC القائم في A، الضلع [BC] هو وتره و [AC] هو الضلع المقابل للزاوية $\\widehat{B}$ . إذن $\\sin\\widehat{B} = \\dfrac{AC}{BC}$',
      'إذن $\\sin 25^{\\circ} = \\dfrac{2{,}5}{BC}$ بالتالي $BC = \\dfrac{2{,}5}{\\sin 25^{\\circ}}$',
      'لحساب المدوّر إلى الجزء من 100 للطول BC، نستعمل حاسبة. نبرمج هذه الآلة إلى وحدة الدرجة ثم ننفذ البرنامج الآتي (من اليسار إلى اليمين):',
      { keys: ['ON', '2,5', '÷', 'sin', '25'], screen: '5,915503958' },
      'المدوّر إلى الجزء من 100 للطول BC هو 5,92. نكتب $BC \\approx 5{,}92\\,\\mathrm{cm}$ .',
    ],
    rule: 'لحساب طول ضلع في مثلث قائم يمكن استعمال النسبة المثلثية $\\sin$ .',
  },
  cos: {
    source: src('method-cos', 119, 'طرائق'),
    title: 'حساب طول ضلع مثلث قائم باستعمال جيب تمام',
    exercise: 'RST مثلث قائم في S حيث $RT = 3{,}5\\,\\mathrm{cm}$ و $\\widehat{R} = 37^{\\circ}$ . احسب RS. أعط المدوّر إلى الجزء من 10 للطول RS.',
    solution: [
      'في المثلث RST القائم في S، الضلع [RT] هو وتره و [RS] هو الضلع المجاور للزاوية $\\widehat{R}$ . إذن $\\cos\\widehat{R} = \\dfrac{RS}{RT}$',
      'إذن $\\cos 37^{\\circ} = \\dfrac{RS}{3{,}5}$ بالتالي $RS = 3{,}5 \\times \\cos 37^{\\circ}$ .',
      'لحساب المدوّر إلى الجزء من 10 للطول RS، ننفذ البرنامج الآتي (من اليسار إلى اليمين):',
      { keys: ['ON', '3,5', '×', 'cos', '37'], screen: '2,795224285' },
      'المدوّر إلى الجزء من 10 للطول RS هو 2,8. نكتب $RS \\approx 2{,}8\\,\\mathrm{cm}$ .',
    ],
    rule: 'لحساب طول ضلع في مثلث قائم يمكن استعمال النسبة المثلثية $\\cos$ .',
  },
  tan: {
    source: src('method-tan', 119, 'طرائق'),
    title: 'حساب طول ضلع مثلث قائم باستعمال الظل',
    exercise: 'EFG مثلث قائم في F حيث $EF = 4{,}5\\,\\mathrm{cm}$ و $\\widehat{E} = 53^{\\circ}$ . احسب FG. أعط المدوّر إلى الجزء من 100 للطول FG.',
    solution: [
      'في المثلث EFG القائم في F، الضلع [EF] هو الضلع المجاور للزاوية $\\widehat{E}$ و [FG] هو الضلع المقابل لها.',
      'إذن $\\tan\\widehat{E} = \\dfrac{FG}{EF}$ أي $\\tan 53^{\\circ} = \\dfrac{FG}{4{,}5}$ بالتالي $FG = 4{,}5 \\times \\tan 53^{\\circ}$',
      'لحساب المدوّر إلى الجزء من 100 للطول FG، ننفذ البرنامج المقابل (من اليسار إلى اليمين):',
      { keys: ['ON', '4,5', '×', 'tan', '53'], screen: '5,971701697' },
      'المدوّر إلى الجزء من 100 للطول FG هو 5,97. نكتب $FG \\approx 5{,}97\\,\\mathrm{cm}$ .',
    ],
  },
};

/** Ce que la plateforme FORMALISE des trois طرائق (déclaré `knowledge_formalization`) : les gestes nommés. */
export const METHOD_RULE = {
  source: addition('knowledge_formalization'),
  lines: [
    'نسمّي، بالنسبة إلى الزاوية المعلومة، الضلع المعلوم والضلع المطلوب: وتر، مقابل أو مجاور.',
    'نختار النسبة التي تجمعهما: المجاور والوتر يربطهما جيب التمام، المقابل والوتر يربطهما الجيب، المقابل والمجاور يربطهما الظل.',
    'نكتب المساواة ثم نعزل الطول المطلوب: إذا كان في البسط نضرب، وإذا كان في المقام نقسم.',
    'نحسب بالحاسبة المبرمجة بالدرجة، ولا ندوّر إلا النتيجة النهائية.',
  ],
};

/** دوري الآن (p. 119). */
export const NOW = {
  source: src('now-119', 119, 'دوري الآن'),
  item1: 'KLM مثلث قائم في L ومتقايس الساقين حيث $KM = 6\\,\\mathrm{cm}$ . احسب LM بطريقتين. أعط المدوّر إلى الجزء من 10 للطول LM.',
  item1Pyth: 'فيثاغورس: $LK^2 + LM^2 = KM^2$ و $LK = LM$ ، إذن $2LM^2 = 36$ أي $LM^2 = 18$ و $LM = \\sqrt{18} = 3\\sqrt{2} \\approx 4{,}24$ .',
  item1Cos: 'المثلث قائم ومتقايس الساقين فزاويتاه الحادتان $45^{\\circ}$ : $\\cos 45^{\\circ} = \\dfrac{LM}{KM}$ ومنه $LM = 6 \\times \\cos 45^{\\circ} \\approx 4{,}24$ ، والمدوّر إلى الجزء من 10 هو $4{,}2$ .',
  item2: 'PQR مثلث قائم في Q حيث $QR = 2{,}8\\,\\mathrm{cm}$ و $\\widehat{P} = 72^{\\circ}$ . احسب PQ. أعط المدوّر إلى الجزء من 10 للطول PQ.',
  item2Line: 'بالنسبة إلى $\\widehat{P}$ : [QR] مقابل و [PQ] مجاور، $\\tan 72^{\\circ} = \\dfrac{QR}{PQ}$ ومنه $PQ = \\dfrac{2{,}8}{\\tan 72^{\\circ}} \\approx 0{,}91$ ، والمدوّر إلى الجزء من 10 هو $0{,}9$ .',
  answer: { LM: 4.2, PQ: 0.9 },
};

/** « أؤكّد تعلّماتي » (p. 124) — items 1 à 5 (extraction › destinations › qcm : duplicatedIn ce درس, module 8). */
const QCM_SRC = (n) => src('qcm', 124, 'أؤكّد تعلّماتي', n);
export const QCM = {
  1: { source: QCM_SRC(1), text: 'في المثلث MOB القائم في O، لدينا:' },
  2: { source: QCM_SRC(2), text: 'في المثلث LMN القائم في M، لدينا:' },
  3: { source: QCM_SRC(3), text: 'في المثلث ABC القائم في B، لدينا:' },
  4: { source: QCM_SRC(4), text: 'إذا كان $\\cos 70^{\\circ} = \\dfrac{2}{MN}$ فإن…' },
  5: { source: QCM_SRC(5), text: 'في الشكل المقابل، لدينا:' },
};

/**
 * « أستعدّ » — les items 1, 4 (trois affirmations), 5 et 6 (deux affirmations) du manuel (p. 115) et trois
 * affirmations de la plateforme (Pythagore, Thalès — la preuve du نشاط 2 s'appuie sur la وحدة 9). Une affirmation
 * par question, une compétence par affirmation. Aucune n'utilise les nombres des أنشطة.
 */
const PREP_ADD = addition('prerequisite_diagnostic');
const PREP_SRC = (n) => src('prep', 115, 'أستعدّ', n);
export const PREP_ITEMS = [
  { n: '1', skill: 'zawaya', text: 'مجموع أقياس زوايا مثلث يساوي $180^{\\circ}$ .', answer: true, why: 'في كل مثلث: مجموع أقياس الزوايا الثلاث $180^{\\circ}$ .', source: PREP_SRC(1) },
  { n: '4-1', skill: 'watar', text: 'في المثلث ABC القائم في A: الوتر هو [BC].', answer: true, why: 'الوتر هو الضلع المقابل للزاوية القائمة A، أي [BC].', source: PREP_SRC(4), figure: 'prep4' },
  { n: '4-2', skill: 'adlaa', text: 'في المثلث ABC القائم في A: الضلع المقابل للزاوية $\\widehat{C}$ هو [BC].', answer: false, why: 'المقابل للزاوية C هو [AB] (لا يمرّ بالرأس C)؛ [BC] هو الوتر.', source: PREP_SRC(4), figure: 'prep4' },
  { n: '4-3', skill: 'adlaa', text: 'في المثلث ABC القائم في A: الضلع المجاور للزاوية $\\widehat{C}$ هو [AB].', answer: false, why: 'المجاور للزاوية C هو [AC]: ضلع الزاوية القائمة الذي يمرّ بالرأس C.', source: PREP_SRC(4), figure: 'prep4' },
  { n: '5', skill: 'cos', text: 'في مثلث قائم، جيب تمام زاوية حادة يساوي: طول الضلع المقابل ÷ طول الوتر.', answer: false, why: 'جيب التمام = طول الضلع المجاور ÷ طول الوتر (السنة الثالثة).', source: PREP_SRC(5), wordFraction: { num: 'طول الضلع المقابل', den: 'طول الوتر' } },
  { n: '6-1', skill: 'zawaya', text: 'ABC مثلث قائم في C و $\\widehat{ABC} = 59^{\\circ}$ . إذن $\\widehat{BAC} = 31^{\\circ}$ .', answer: true, why: '$180^{\\circ} - 90^{\\circ} - 59^{\\circ} = 31^{\\circ}$ .', source: PREP_SRC(6), figure: 'prep6' },
  { n: '6-2', skill: 'cos', text: 'ABC مثلث قائم في C و $\\widehat{ABC} = 59^{\\circ}$ . إذن $\\cos\\widehat{ABC} = \\dfrac{AC}{AB}$ .', answer: false, why: 'المجاور للزاوية B هو [BC]: $\\cos\\widehat{ABC} = \\dfrac{BC}{AB}$ .', source: PREP_SRC(6), figure: 'prep6' },
  { n: 'p1', skill: 'fithaghuras', text: 'DEF مثلث قائم في D حيث $DE = 6$ و $DF = 8$ . إذن $EF = 10$ .', answer: true, why: '$EF^2 = DE^2 + DF^2 = 36 + 64 = 100$ إذن $EF = 10$ .', source: PREP_ADD },
  { n: 'p2', skill: 'fithaghuras', text: 'RST مثلث قائم في R حيث $ST = 13$ و $RS = 5$ . إذن $RT = 8$ .', answer: false, why: '$RT^2 = ST^2 - RS^2 = 169 - 25 = 144$ إذن $RT = 12$ ؛ 8 هو $13 - 5$ : الأطوال لا تُطرح، مربعاتها هي التي تُطرح.', source: PREP_ADD },
  { n: 'p3', skill: 'talis', text: 'ABC مثلث، M من [AB] و N من [AC] حيث $(MN) \\parallel (BC)$ . إذن $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ .', answer: true, why: 'المثلثان AMN و ABC في وضعية طالس (الوحدة 9): $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$ .', source: PREP_ADD },
];

/** Les deux mondes du lab (levels.js) : مبتدئ = la rampe à nommer (plateforme) ; متقدم = le نشاط 2. */
export const LAB = {
  beginner: { source: PLATFORM, numbers: { angle: 30, hyp: 4, mode: 'name' } },
  advanced: { source: ACTIVITY_2.source, numbers: { angle: 40, hyps: [4, 6, 8], mode: 'scale' } },
};
