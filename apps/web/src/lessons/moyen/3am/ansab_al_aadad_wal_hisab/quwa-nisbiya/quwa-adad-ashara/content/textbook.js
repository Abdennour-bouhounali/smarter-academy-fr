/**
 * Le contenu du درس « قوى العدد 10 » (3AM, unité 3) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit3/extraction.json :
 * نشاط 1–3 p. 40, معارف 1–2 p. 42, طرائق p. 43, أستعدّ p. 39) ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis :
 * mêmes définitions et notations, autres mots, autres exemples, autres nombres). La `source` de chaque bloc garde la traçabilité
 * (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * LE LABO — la عدسة القوى (`ten-zoom`, thème `science-lens`) : expérience de la plateforme. Les nombres sont ceux du preset `levels.js`
 * (مبتدئ : 1 000 · 1 000 000 avec prédiction · 0,001 · retour à 1 ; متقدم : مليار · ميكرومتر · 0,0000001 avec prédiction · 10 كم) ;
 * le monde `prefixes` se pose seul dans معارف.
 */
export const LAB = {
  source: addition('platform_designed_entry'),
  // act-3 (p. 40) : la lecture « 1 suivi de n zéros / le 1 au rang n » est ce que la plaque montre à chaque cran.
  evidence: src('act-3', 40, 'أنشطة'),
  beginner: { world: 'zoom' },
  advanced: { world: 'zoom' },
  prefixes: { world: 'prefixes' },
};

/** Écrit en LaTeX le décimal exact 10ⁿ : `10\,000`, `0{,}0001`. */
export const decTex = (digits) => { const [w, f] = digits.split(','); return w.replace(/[\u00A0 ]/g, '\\,') + (f ? `{,}${f}` : ''); };

/** معارف 1–2 (p. 42) et le tableau de l'نشاط 2 (p. 40) — réécrits : 10ⁿ, 10⁰, 10⁻ⁿ, les noms et les préfixes. */
export const KNOWLEDGE = {
  definition: {
    source: src('know-1', 42, 'معارف'),
    text: 'ليكن $n$ عددًا طبيعيًا غير معدوم. نرمز بـ $10^n$ إلى جداء $n$ عاملًا كلّها تساوي 10 : $10^n = 10 \\times 10 \\times \\ldots \\times 10$ ($n$ عاملًا). نقرأ $10^n$ : « 10 أس $n$ »، وكتابته العشرية هي الرقم 1 متبوعًا بـ $n$ صفرًا.',
    example: 'مثلًا: $10^7 = 10\\,000\\,000$ (1 متبوع بسبعة أصفار)، و $10^{15}$ هو الرقم 1 متبوعًا بـ 15 صفرًا.',
  },
  zero: {
    source: src('know-1', 42, 'معارف'),
    text: 'ملاحظة: $10^1 = 10$ و $10^0 = 1$ .',
  },
  inverse: {
    source: src('know-2', 42, 'معارف'),
    text: 'من أجل عدد طبيعي غير معدوم $n$ ، $10^{-n}$ هو مقلوب $10^n$ : $10^{-n} = \\frac{1}{10^n}$ . وكتابته العشرية فيها الرقم 1 في الرتبة $n$ بعد الفاصلة.',
    example: 'مثلًا: $10^{-4} = \\frac{1}{10^4} = 0{,}0001$ (الرقم 1 في الرتبة الرابعة بعد الفاصلة)، و $10^{-18}$ رقم 1 فيه في الرتبة 18 بعد الفاصلة.',
  },
  table: {
    source: src('act-2', 40, 'أنشطة'),
    text: 'كلما نزلنا درجة بقسمة على 10 نقص الأس بواحد:',
    lines: [
      '$10^{3} = 1\\,000$ ، $10^{2} = 100$ ، $10^{1} = 10$ ، $10^{0} = 1$',
      '$10^{-1} = 0{,}1$ ، $10^{-2} = 0{,}01$ ، $10^{-3} = 0{,}001$ ، $10^{-5} = 0{,}00001$',
    ],
  },
  names: {
    source: addition('knowledge_formalization'),
    text: 'للقوى الشائعة أسماء: $10^3$ ألف، $10^6$ مليون، $10^9$ مليار، $10^{12}$ ألف مليار ؛ و $10^{-3}$ جزء من ألف، $10^{-6}$ جزء من مليون، $10^{-9}$ جزء من مليار.',
  },
  prefixes: {
    source: addition('knowledge_formalization'),
    text: 'وبادئات الوحدات هي قوى للعدد 10 :',
    lines: [
      'تيرا $10^{12}$ ، جيغا $10^{9}$ ، ميغا $10^{6}$ ، كيلو $10^{3}$ ، هكتو $10^{2}$ ، ديكا $10^{1}$',
      'ديسي $10^{-1}$ ، سنتي $10^{-2}$ ، ميلي $10^{-3}$ ، ميكرو $10^{-6}$ ، نانو $10^{-9}$ ، بيكو $10^{-12}$',
    ],
  },
};

/**
 * طرائق p. 43 (قوة 10 ذات أس موجب / سالب) et ما بعد المعارف (كتابة عدد عشري بقوى 10) — réécrites, autres nombres.
 * `count` : de l'écriture décimale à la puissance (et le contraire) ; `expand` : le مفكوك ; `times` : k × 10ⁿ (rappel du décalage de la virgule de 1AM).
 */
export const METHOD = {
  count: {
    source: src('method-43a', 43, 'طرائق'),
    alsoCites: src('method-43b', 43, 'طرائق'),
    exercise: 'اكتب على شكل قوة للعدد 10 : $a = 100\\,000$ و $b = 0{,}0001$ ؛ ثم اكتب الكتابة العشرية لـ $c = 10^{8}$ و $d = 10^{-6}$ .',
    solution: [
      '$a = 100\\,000$ : الرقم 1 متبوع بخمسة أصفار، إذن $a = 10^5$ .',
      '$b = 0{,}0001$ : الرقم 1 في الرتبة الرابعة بعد الفاصلة، إذن $b = 10^{-4}$ .',
      '$c = 10^8$ : الرقم 1 متبوع بثمانية أصفار، إذن $c = 100\\,000\\,000$ .',
      '$d = 10^{-6}$ : الرقم 1 في الرتبة السادسة بعد الفاصلة، إذن $d = 0{,}000001$ .',
    ],
    rule: 'لكتابة 1 متبوع بأصفار على شكل $10^n$ نعدّ الأصفار ؛ ولكتابة $0{,}0\\ldots01$ على شكل $10^{-n}$ نعدّ رتبة الرقم 1 بعد الفاصلة. وللعكس نكتب الرقم 1 مع $n$ صفرًا، أو نضعه في الرتبة $n$ بعد الفاصلة.',
    numbers: { a: 5, b: -4, c: 8, d: -6 },
  },
  expand: {
    source: addition('knowledge_formalization'),
    exercise: 'اكتب مفكوك العدد $e = 7\\,040\\,300$ ثم مفكوك العدد $f = 0{,}0509$ .',
    solution: [
      'رتبة كل رقم هي قوة للعدد 10 : رتبة الوحدات $10^0$ ، العشرات $10^1$ ، المئات $10^2$ ... وبعد الفاصلة $10^{-1}$ ، $10^{-2}$ ...',
      '$e = 7\\,040\\,300$ : الرقم 7 في رتبة الملايين، و 4 في رتبة عشرات الآلاف، و 3 في رتبة المئات: $e = 7 \\times 10^6 + 4 \\times 10^4 + 3 \\times 10^2$ .',
      '$f = 0{,}0509$ : الرقم 5 في الرتبة الثانية بعد الفاصلة والرقم 9 في الرتبة الرابعة: $f = 5 \\times 10^{-2} + 9 \\times 10^{-4}$ .',
      'الرتب الفارغة (الأصفار) لا تظهر في المفكوك.',
    ],
    rule: 'مفكوك عدد عشري مجموع حدود، كلٌّ منها رقم من أرقامه مضروبٌ في $10^n$ حيث $n$ رتبة هذا الرقم (موجبة أو معدومة قبل الفاصلة وسالبة بعدها) ؛ والأصفار لا تظهر.',
    numbers: { e: [[7, 6], [4, 4], [3, 2]], f: [[5, -2], [9, -4]] },
  },
  times: {
    source: addition('knowledge_formalization'),
    exercise: 'عبّر بكتابة $k \\times 10^n$ ثم بالكتابة العشرية : $36$ مليونًا ؛ و $25$ ميكرومترًا مقدّرة بالمتر.',
    solution: [
      '$36$ مليونًا : المليون هو $10^6$ ، إذن $36 \\times 10^6$ .',
      'الضرب في $10^6$ يزيح الفاصلة 6 رتب إلى اليمين (كما في السنة الأولى) : $36 \\times 10^6 = 36\\,000\\,000$ .',
      '$25$ ميكرومترًا : الميكرومتر هو $10^{-6}$ م، إذن $25 \\times 10^{-6}$ م.',
      'الضرب في $10^{-6}$ يزيح الفاصلة 6 رتب إلى اليسار : $25 \\times 10^{-6} = 0{,}000025$ م.',
    ],
    rule: 'لكتابة عدد على شكل $k \\times 10^n$ نختار $k$ عددًا نعرفه ($36$ ، $25$ ، ...) ونعدّ الأصفار أو الرتبة ؛ وليس للعدد كتابة وحيدة: $45\\,000 = 45 \\times 10^3 = 4\\,500 \\times 10^1$ .',
    numbers: { million36: [36, 6], micro25: [25, -6] },
  },
};

/** « أستعدّ » — أستعدّ p. 39 (items 4, 6, 7, 15, 18, 22) RÉÉCRITS en affirmations. */
export const PREP_ITEMS = [
  { n: 4, skill: 'darb', text: '$4{,}37 \\times 100 = 437$ .', answer: true, why: 'الضرب في 100 يزيح الفاصلة رتبتين إلى اليمين : $4{,}37 \\times 100 = 437$ .' },
  { n: 7, skill: 'darb', text: 'القسمة على $0{,}1$ هي الضرب في 10 .', answer: true, why: '$0{,}1 = \\frac{1}{10}$ ، والقسمة على $\\frac{1}{10}$ هي الضرب في 10 : $3 \\div 0{,}1 = 30$ .' },
  { n: 6, skill: 'darb', text: '$0{,}6 \\times 0{,}01 = 0{,}06$ .', answer: false, why: 'الضرب في $0{,}01$ يقسم على 100 : $0{,}6 \\times 0{,}01 = 0{,}006$ .' },
  { n: 15, skill: 'maqlub', text: 'مقلوب $100$ هو $0{,}01$ .', answer: true, why: 'جداء عدد في مقلوبه يساوي 1 : $100 \\times 0{,}01 = 1$ .' },
  { n: 18, skill: 'darb', text: '$2 \\times 5 \\times 2 \\times 5 \\times 2 \\times 5 = 1000$ .', answer: true, why: '$2 \\times 5 = 10$ ثلاث مرّات : $10 \\times 10 \\times 10 = 1000$ .' },
  { n: 22, skill: 'wahdat', text: '$3{,}2\\ \\mathrm{km} = 320\\ \\mathrm{m}$ .', answer: false, why: '$1\\ \\mathrm{km} = 1000\\ \\mathrm{m}$ ، إذن $3{,}2\\ \\mathrm{km} = 3200\\ \\mathrm{m}$ .' },
].map((it) => ({ ...it, source: src('prep', 39, 'أستعدّ', it.n) }));

/** Une affirmation de la plateforme : la division par une puissance de 10 (le décalage vers la gauche), pas dans les items du manuel. */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'darb', text: '$26{,}8 \\div 1000 = 0{,}268$ .', answer: false, why: 'القسمة على 1000 تزيح الفاصلة ثلاث رتب إلى اليسار : $26{,}8 \\div 1000 = 0{,}0268$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  six: 'ستة عوامل كلّها 10 : $10 \\times 10 \\times 10 \\times 10 \\times 10 \\times 10 = 1\\,000\\,000$ . أمّا $10 \\times 6 = 60$ و $10 + 10 + 10 + 10 + 10 + 10 = 60$ فهما العدد 60 لا ضلع المليون.',
  zeros: 'كل نقرة تضرب في 10 فتزيح الرقم 1 رتبة إلى اليسار وتترك صفرًا : ست نقرات، ستة أصفار. (سبعة أرقام نتيجة لا سبب، و $6 \\times 10$ ليس ضلع الإطار.)',
  zero: 'بلا نقرة لم نضرب في 10 أبدًا : يبقى الضلع 1 م، أي $10^0 = 1$ .',
  negExp: '$10^{-3} = \\frac{1}{10 \\times 10 \\times 10} = \\frac{1}{1000} = 0{,}001$ : ثلاث نقرات تصغير، والرقم 1 في الرتبة الثالثة بعد الفاصلة.',
  darb: {
    wrong: '$10^3 = 30$ لأنّ $10 \\times 3 = 30$ .',
    why: 'الأس يعدّ العوامل ولا يضرب فيها : ثلاثة عوامل كلّها 10 .',
    right: '$10^3 = 10 \\times 10 \\times 10 = 1\\,000$ .',
  },
  raqam: {
    wrong: '$1\\,000\\,000 = 10^7$ لأنّ فيه سبعة أرقام.',
    why: 'نعدّ الأصفار بعد الرقم 1 لا الأرقام كلّها : الأرقام تزيد واحدًا على الأصفار.',
    right: '$1\\,000\\,000 = 10^6$ (ستة أصفار).',
  },
  salib: {
    wrong: '$10^{-3} = -1000$ لأنّ الأس سالب.',
    why: 'الأس السالب لا يجعل العدد سالبًا : يعني المقلوب، أي عددًا صغيرًا موجبًا.',
    right: '$10^{-3} = \\frac{1}{10^3} = 0{,}001$ .',
  },
  fasila: {
    wrong: '$10^{-3} = 0{,}0001$ لأنّ بعد الفاصلة ثلاثة أصفار.',
    why: 'نعدّ رتبة الرقم 1 بعد الفاصلة : في $0{,}001$ الرقم 1 في الرتبة 3 وقبله صفران فقط بعد الفاصلة.',
    right: '$10^{-3} = 0{,}001$ (الرقم 1 في الرتبة الثالثة).',
  },
  wihda: {
    wrong: '$1\\ \\mathrm{mm} = 10^{3}\\ \\mathrm{m}$ .',
    why: 'الميلي بادئة للأجزاء : الملّيمتر جزء من ألف من المتر.',
    right: '$1\\ \\mathrm{mm} = 10^{-3}\\ \\mathrm{m} = 0{,}001\\ \\mathrm{m}$ .',
  },
  mafkuk: {
    wrong: '$5\\,030{,}07 = 5 \\times 10^3 + 3 \\times 10^2 + 7 \\times 10^{-2}$ (الرقم 3 في رتبة المئات).',
    why: 'نحدّد رتبة كل رقم ولا نرصّ الأرقام بعضها إلى بعض : الرقم 3 في رتبة العشرات لأنّ بينه وبين 5 رتبة فارغة.',
    right: '$5\\,030{,}07 = 5 \\times 10^3 + 3 \\times 10^1 + 7 \\times 10^{-2}$ .',
  },
};
