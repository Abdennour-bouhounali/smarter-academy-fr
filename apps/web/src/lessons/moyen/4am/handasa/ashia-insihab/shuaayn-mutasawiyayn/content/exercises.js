/**
 * Les exercices du MANUEL rattachés au درس « الشعاعان المتساويان ومتوازي الأضلاع ومنتصف قطعة » (extraction.json →
 * destinations : ex-6, 7, 9 p. 134 « الأشعة ومتوازي الأضلاع », ex-12 p. 135, ex-25 p. 137 « أتعمّق »). Énoncés au mot
 * près ; un exercice à plusieurs parties est découpé en une entrée par partie (la première porte l'énoncé). Les figures
 * sont des DONNÉES GeoFigure (content/figures.js) que le module dessine (`figure`).
 * Les exercices de construction (« أنشئ ») sont posés comme le manuel les pose, et l'élève CHOISIT la justification ou la
 * nature : tous les distracteurs sont faux (la confusion qu'ils portent est dite en commentaire).
 * ex-12 3) « عيّن BM + BN » demande la SOMME de deux vecteurs (درس « مجموع شعاعين ») : on la prépare ici (BN = MB) et on
 * le dit en une ligne (la somme elle-même est le درس suivant).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_shuaayn-mutasawiyayn_P1',
  P2: '4am_shuaayn-mutasawiyayn_P2',
  P3: '4am_shuaayn-mutasawiyayn_P3',
};

const SEC = 'الأشعة ومتوازي الأضلاع';
const E = (n, part) => {
  const page = n === 12 ? 135 : n === 25 ? 137 : 134;
  const section = n === 12 ? 'مجموع شعاعين - علاقة شال' : n === 25 ? 'أتعمّق' : SEC;
  return { ...src(`ex-${n}`, page, section, n), ...(part ? { part } : {}) };
};

export const EXERCISES = [
  // تمرين 6 — OAB : M صورة O بشعاع AO، N صورة A بشعاع BM
  {
    id: 'ex-6-a', source: E(6, '1'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'OAB مثلث. 1) أنشئ النقطة M صورة O بالانسحاب الذي شعاعه $\\overrightarrow{AO}$ . 2) أنشئ النقطة N صورة A بالانسحاب الذي شعاعه $\\overrightarrow{BM}$ . 3) ما هي طبيعة الرباعي BMNA؟',
    interaction: 'choice',
    question: {
      prompt: '1) M صورة O بالانسحاب الذي شعاعه $\\overrightarrow{AO}$ ، أي $\\overrightarrow{OM} = \\overrightarrow{AO}$ . إذن:',
      options: [
        'O منتصف [AM]: أنشئ M نظيرة A بالنسبة إلى O',
        'A منتصف [OM]', // l'ordre des lettres : AO = OM met O au milieu, pas A
        'M منتصف [AO]', // M est au-delà de O
      ],
      correct: 0, cols: 1,
      explain: '$\\overrightarrow{AO} = \\overrightarrow{OM}$ : حسب معارف 3، O منتصف [AM]، فـ M نظيرة A بالنسبة إلى O.',
    },
    commonError: 'قراءة $\\overrightarrow{OM} = \\overrightarrow{AO}$ كأن A هي المنتصف: نعيد الكتابة $\\overrightarrow{AO} = \\overrightarrow{OM}$ ، فالنقطة المشتركة في الوسط O هي المنتصف.',
  },
  {
    id: 'ex-6-b', source: E(6, '2'), learningPointId: LP.P3, difficulty: 'facile',
    interaction: 'choice',
    question: {
      prompt: '2) N صورة A بالانسحاب الذي شعاعه $\\overrightarrow{BM}$ يعني:',
      options: [
        '$\\overrightarrow{AN} = \\overrightarrow{BM}$',
        '$\\overrightarrow{NA} = \\overrightarrow{BM}$', // la flèche va de l'image vers le point : MISC-SHUAA-INSIHAB-SURA
        '$\\overrightarrow{AM} = \\overrightarrow{BN}$', // ABNM n'est pas un متوازي أضلاع en général
      ],
      correct: 0, cols: 3,
      explain: 'صورة A هي N حيث $\\overrightarrow{AN} = \\overrightarrow{BM}$ : من A نتحرّك كما نتحرّك من B إلى M.',
    },
    commonError: 'كتابة $\\overrightarrow{NA} = \\overrightarrow{BM}$ : الشعاع يبدأ من النقطة وينتهي عند صورتها.',
  },
  {
    id: 'ex-6-c', source: E(6, '3'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '3) طبيعة الرباعي BMNA:',
      options: [
        'متوازي أضلاع لأن $\\overrightarrow{BM} = \\overrightarrow{AN}$',
        'مستطيل لأن $\\overrightarrow{BM} = \\overrightarrow{AN}$', // rien ne donne d'angle droit
        'شبه منحرف ليس متوازي أضلاع', // les deux côtés parallèles ont aussi la même longueur
      ],
      correct: 0, cols: 1,
      explain: '$\\overrightarrow{BM} = \\overrightarrow{AN}$ تعني أن BMNA متوازي أضلاع (الضلع [BM] ومقابله [AN] في الاتجاه نفسه). لا شيء يعطي زاوية قائمة.',
    },
  },
  // تمرين 7 — المثلث ABD
  {
    id: 'ex-7-a', source: E(7, '2'), learningPointId: LP.P3, difficulty: 'facile', figure: 'ex7',
    statement: '1) انقل المثلث ABD (كما في الشكل). 2) أنشئ النقطة C حيث ABCD متوازي أضلاع. 3) أنشئ النقطة E حيث ABDE متوازي أضلاع. 4) ماذا تقول عن الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{DE}$ ؟ 5) قارن بين الشعاعين $\\overrightarrow{EA}$ و $\\overrightarrow{DB}$ ؟',
    interaction: 'choice',
    question: {
      prompt: '2) لإنشاء C حيث ABCD متوازي أضلاع:',
      options: [
        'C صورة D بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ ، أي $\\overrightarrow{DC} = \\overrightarrow{AB}$',
        'C صورة D بالانسحاب الذي شعاعه $\\overrightarrow{BA}$ ، أي $\\overrightarrow{CD} = \\overrightarrow{AB}$', // l'ordre : ABDC, pas ABCD
        'C نظيرة A بالنسبة إلى D', // ABDC aplati : C sur (AD)
      ],
      correct: 0, cols: 1,
      explain: 'ABCD متوازي أضلاع يعني $\\overrightarrow{AB} = \\overrightarrow{DC}$ : C صورة D بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ .',
    },
    commonError: 'كتابة $\\overrightarrow{AB} = \\overrightarrow{CD}$ لمتوازي الأضلاع ABCD: هذه المساواة تعطي ABDC، والراية تلتوي.',
  },
  {
    id: 'ex-7-b', source: E(7, '3'), learningPointId: LP.P3, difficulty: 'facile',
    interaction: 'choice',
    question: {
      prompt: '3) لإنشاء E حيث ABDE متوازي أضلاع:',
      options: [
        '$\\overrightarrow{ED} = \\overrightarrow{AB}$ : E صورة D بالانسحاب الذي شعاعه $\\overrightarrow{BA}$',
        '$\\overrightarrow{DE} = \\overrightarrow{AB}$ : E صورة D بالانسحاب الذي شعاعه $\\overrightarrow{AB}$', // ce serait C
        '$\\overrightarrow{AE} = \\overrightarrow{DB}$', // le sens est inversé : AE = BD
      ],
      correct: 0, cols: 1,
      explain: 'ABDE متوازي أضلاع: $\\overrightarrow{AB} = \\overrightarrow{ED}$ ، أي $\\overrightarrow{DE} = \\overrightarrow{BA}$ — E صورة D بالانسحاب الذي شعاعه $\\overrightarrow{BA}$ .',
    },
  },
  {
    id: 'ex-7-c', source: E(7, '4'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '4) الشعاعان $\\overrightarrow{AB}$ و $\\overrightarrow{DE}$ :',
      options: [
        'لهما نفس المنحى ونفس الطول، لكن اتجاهين متعاكسين',
        'متساويان', // DE = BA
        'ليس لهما نفس المنحى', // (DE) // (AB)
      ],
      correct: 0, cols: 1,
      explain: '$\\overrightarrow{ED} = \\overrightarrow{AB}$ ، فـ $\\overrightarrow{DE}$ يسير في الاتجاه المعاكس: نفس المنحى ونفس الطول واتجاهان متعاكسان. ومع $\\overrightarrow{DC} = \\overrightarrow{AB}$ تكون D منتصف [EC].',
    },
    commonError: 'الحكم بأن $\\overrightarrow{AB} = \\overrightarrow{DE}$ لأن AB = DE: يجب أيضا نفس الاتجاه.',
  },
  {
    id: 'ex-7-d', source: E(7, '5'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '5) قارن بين $\\overrightarrow{EA}$ و $\\overrightarrow{DB}$ :',
      options: [
        '$\\overrightarrow{EA} = \\overrightarrow{DB}$',
        '$\\overrightarrow{EA} = \\overrightarrow{BD}$', // le sens : de E vers A comme de D vers B
        'لا يتساويان لأن مبدأيهما مختلفان', // deux vecteurs égaux peuvent avoir des origines différentes
      ],
      correct: 0, cols: 3,
      explain: 'ABDE متوازي أضلاع: $\\overrightarrow{AB} = \\overrightarrow{ED}$ ومنه (معارف 2) $\\overrightarrow{AE} = \\overrightarrow{BD}$ ، أي $\\overrightarrow{EA} = \\overrightarrow{DB}$ .',
    },
  },
  // تمرين 9 — مستطيل ومتوازي أضلاع
  {
    id: 'ex-9', source: E(9), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex9',
    statement: 'ABCD مستطيل و CDEF متوازي أضلاع (الشكل). برهن أن الرباعي ABFE متوازي أضلاع.',
    interaction: 'batch',
    question: {
      prompt: 'أتمم البرهان سطرا سطرا:',
      rows: [
        // CD = AB : l'ordre ABDC ; AD = CB : sens contraire
        { label: 'ABCD مستطيل (فهو متوازي أضلاع)، إذن', options: ['$\\overrightarrow{AB} = \\overrightarrow{DC}$', '$\\overrightarrow{AB} = \\overrightarrow{CD}$', '$\\overrightarrow{AD} = \\overrightarrow{CB}$'], correct: 0, correction: 'ABCD متوازي أضلاع: $\\overrightarrow{AB} = \\overrightarrow{DC}$ .' },
        // CD = EF : CDEF donne CD = FE ; DE = FC : sens contraire
        { label: 'CDEF متوازي أضلاع، إذن', options: ['$\\overrightarrow{DC} = \\overrightarrow{EF}$', '$\\overrightarrow{CD} = \\overrightarrow{EF}$', '$\\overrightarrow{DE} = \\overrightarrow{FC}$'], correct: 0, correction: 'CDEF متوازي أضلاع: $\\overrightarrow{CD} = \\overrightarrow{FE}$ ، أي $\\overrightarrow{DC} = \\overrightarrow{EF}$ .' },
        // ABEF : l'ordre ; AB = FE : faux
        { label: 'إذن $\\overrightarrow{AB} = \\overrightarrow{EF}$ ، ومنه', options: ['ABFE متوازي أضلاع', 'ABEF متوازي أضلاع', 'ABFE مستطيل'], correct: 0, correction: '$\\overrightarrow{AB} = \\overrightarrow{EF}$ تعني أن ABFE متوازي أضلاع (A، B، F ليست على استقامة).' },
      ],
      explain: 'نسلسل التساويات: $\\overrightarrow{AB} = \\overrightarrow{DC}$ و $\\overrightarrow{DC} = \\overrightarrow{EF}$ ، إذن $\\overrightarrow{AB} = \\overrightarrow{EF}$ .',
    },
    commonError: 'كتابة $\\overrightarrow{DC} = \\overrightarrow{FE}$ من CDEF: نقرأ الضلعين المتقابلين في الاتجاه نفسه، $\\overrightarrow{CD} = \\overrightarrow{FE}$ .',
  },
  // تمرين 12 — دائرتان متماستان
  {
    id: 'ex-12-a', source: E(12, '1'), learningPointId: LP.P2, difficulty: 'difficile', figure: 'ex12',
    statement: 'لاحظ الشكل أدناه. 1) برهن أن $\\overrightarrow{MO\'} = \\overrightarrow{ON}$ . 2) هل MB = BN ؟ هل $\\overrightarrow{MB} = \\overrightarrow{BN}$ ؟ لماذا؟ 3) عيّن $\\overrightarrow{BM} + \\overrightarrow{BN}$ .',
    interaction: 'choice',
    question: {
      prompt: '1) البرهان على أن $\\overrightarrow{MO\'} = \\overrightarrow{ON}$ :',
      options: [
        'OM = O′N والزاويتان المتبادلتان متقايستان فـ (OM) // (O′N)، و M و N في جهتين مختلفتين من (OO′): $\\overrightarrow{OM} = \\overrightarrow{NO\'}$ ، فالرباعي OMO′N متوازي أضلاع، ومنه $\\overrightarrow{MO\'} = \\overrightarrow{ON}$',
        'لأن MO′ = ON في الطول', // la longueur seule ne suffit pas
        'لأن الدائرتين متقايستان', // il faut aussi le parallélisme et le sens
      ],
      correct: 0, cols: 1,
      explain: 'نثبت أولا $\\overrightarrow{OM} = \\overrightarrow{NO\'}$ (نفس الطول، نفس المنحى، نفس الاتجاه)، فيكون OMO′N متوازي أضلاع، ثم نقرأ الضلعين المتقابلين الآخرين.',
    },
  },
  {
    id: 'ex-12-b', source: E(12, '2'), learningPointId: LP.P1, difficulty: 'difficile',
    interaction: 'choice',
    question: {
      prompt: '2) هل MB = BN ؟ هل $\\overrightarrow{MB} = \\overrightarrow{BN}$ ؟',
      options: [
        'نعم ونعم: الدائرتان متقايستان ومتماستان في B فـ B منتصف [OO′]، وهي إذن منتصف القطر الآخر [MN] لمتوازي الأضلاع OMO′N',
        'نعم في الطول فقط، والشعاعان غير متساويين', // B est le milieu : les vecteurs sont égaux
        'لا ولا: M و N على دائرتين مختلفتين', // faux
      ],
      correct: 0, cols: 1,
      explain: 'قطرا متوازي الأضلاع OMO′N هما [OO′] و [MN]، لهما نفس المنتصف B. ومعارف 3: B منتصف [MN] يعني $\\overrightarrow{MB} = \\overrightarrow{BN}$ .',
    },
  },
  {
    id: 'ex-12-c', source: E(12, '3'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '3) نحضّر المجموع $\\overrightarrow{BM} + \\overrightarrow{BN}$ : الشعاع $\\overrightarrow{BN}$ يساوي',
      options: ['$\\overrightarrow{MB}$', '$\\overrightarrow{BM}$', '$\\overrightarrow{NB}$'], // BM : sens contraire ; NB : sens contraire
      correct: 0, cols: 3,
      explain: 'B منتصف [MN]: $\\overrightarrow{MB} = \\overrightarrow{BN}$ . المجموع $\\overrightarrow{BM} + \\overrightarrow{MB}$ هو موضوع الدرس الموالي «مجموع شعاعين».',
    },
  },
  // تمرين 25 — أتعمّق
  {
    id: 'ex-25-a', source: E(25, '2'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: '1) أرسم مثلثا ABC ثم عيّن النقطة M منتصف القطعة [BC]. 2) أنشئ النقطة E، نظيرة النقطة A بالنسبة للنقطة M. أثبت أنّ $\\overrightarrow{EC} = \\overrightarrow{BA}$ . 3) أنشئ النقطة F، صورة النقطة C بالانسحاب الذي شعاعه $\\overrightarrow{BA}$ . بيّن أن النقطة C هي منتصف القطعة [EF] ثم استنتج نوع الرباعي ABCF.',
    interaction: 'choice',
    question: {
      prompt: '2) لماذا $\\overrightarrow{EC} = \\overrightarrow{BA}$ ؟',
      options: [
        'M منتصف [BC] و [AE]: الرباعي ABEC قطراه متناصفان فهو متوازي أضلاع، ومنه $\\overrightarrow{AB} = \\overrightarrow{CE}$ أي $\\overrightarrow{EC} = \\overrightarrow{BA}$',
        'لأن EC = BA في الطول', // la longueur seule
        'لأن ABCE متوازي أضلاع', // l'ordre : les diagonales [AE] et [BC] donnent ABEC
      ],
      correct: 0, cols: 1,
      explain: 'قطرا الرباعي ABEC هما [AE] و [BC] ومنتصفهما المشترك M: ABEC متوازي أضلاع، فـ $\\overrightarrow{AB} = \\overrightarrow{CE}$ .',
    },
  },
  {
    id: 'ex-25-b', source: E(25, '3'), learningPointId: LP.P1, difficulty: 'difficile',
    interaction: 'choice',
    question: {
      prompt: '3) F صورة C بالانسحاب الذي شعاعه $\\overrightarrow{BA}$ . لماذا C منتصف [EF]؟',
      options: [
        '$\\overrightarrow{CF} = \\overrightarrow{BA} = \\overrightarrow{EC}$ ، أي $\\overrightarrow{EC} = \\overrightarrow{CF}$',
        '$\\overrightarrow{FC} = \\overrightarrow{BA}$ ، أي $\\overrightarrow{FC} = \\overrightarrow{EC}$', // l'ordre : CF = BA
        'لأن CF = CE في الطول', // la longueur seule
      ],
      correct: 0, cols: 1,
      explain: 'صورة C هي F: $\\overrightarrow{CF} = \\overrightarrow{BA}$ ، ومن 2) $\\overrightarrow{EC} = \\overrightarrow{BA}$ . إذن $\\overrightarrow{EC} = \\overrightarrow{CF}$ : C منتصف [EF] (معارف 3).',
    },
    commonError: 'كتابة $\\overrightarrow{FC} = \\overrightarrow{BA}$ : الشعاع يبدأ من C وينتهي عند صورتها F.',
  },
  {
    id: 'ex-25-c', source: E(25, '3'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'choice',
    question: {
      prompt: 'نوع الرباعي ABCF:',
      options: [
        'متوازي أضلاع لأن $\\overrightarrow{CF} = \\overrightarrow{BA}$',
        'مستطيل', // aucun angle droit n'est donné
        'رباعي كيفي لأن F خارج المثلث', // faux
      ],
      correct: 0, cols: 1,
      explain: '$\\overrightarrow{CF} = \\overrightarrow{BA}$ : بقراءة الرباعي C ثم F ثم A ثم B، $\\overrightarrow{CF} = \\overrightarrow{BA}$ تعني أن CFAB، أي ABCF، متوازي أضلاع.',
    },
  },
];

export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
