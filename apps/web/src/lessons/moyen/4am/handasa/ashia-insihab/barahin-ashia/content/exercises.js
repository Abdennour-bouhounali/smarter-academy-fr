/**
 * Les exercices du MANUEL rattachés au درس 4 « حل مشكلات وإنجاز براهين بتوظيف الأشعة والانسحاب » et rendus au module 4
 * (extraction.json → destinations : ex-17, ex-18, ex-20, ex-21, ex-23, ex-24, p. 137 « أتعمّق »). Énoncés au mot près, un
 * exercice à plusieurs parties découpé en une entrée par partie (la première porte l'énoncé). Réponses : extraction
 * (`answerSource: computed`, chaque égalité assertée par build-extraction.py) ; chaque distracteur est FAUX et sa
 * confusion est dite (MISC-SHUAA-*). ex-21 est posé CORRIGÉ (K, pas L — extraction › ex-21 › correction) ; ex-24 dit en
 * une ligne que I et les longueurs ne servent pas. Les figures sont des DONNÉES GeoFigure (content/figures.js).
 */
import { src } from '../../_unit/unitMeta.js';
import { LP } from './textbook.js';

const S = (n, part) => ({ ...src(`ex-${n}`, 137, 'أتعمّق', n), ...(part ? { part } : {}) });
const v = (n) => `$\\overrightarrow{${n}}$`;

export const EXERCISES = [
  // تمرين 20 — ABEF et ABCD : BC = DE, CE + FE = AD, M = E
  {
    id: 'ex-20-1', source: S(20, '1'), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex20',
    statement: 'لاحظ في الشكل التالي متوازي أضلاع ABEF مركزه D و متوازي أضلاع ABCD. 1) بيّن أن $\\overrightarrow{BC} = \\overrightarrow{DE}$ . 2) بسّط الكتابة $\\overrightarrow{CE} + \\overrightarrow{FE}$ . 3) أنشئ النقطة M حيث $\\overrightarrow{BM} = \\overrightarrow{DM} + \\overrightarrow{CM}$ .',
    interaction: 'choice',
    question: {
      prompt: `1) لماذا ${v('BC')} = ${v('DE')} ؟`,
      options: [
        `لأن ${v('BC')} = ${v('AD')} (ABCD متوازي أضلاع) و ${v('AD')} = ${v('DE')} (D منتصف [AE])`,
        'لأن الطولين BC و DE متساويان',
        `لأن ${v('BC')} = ${v('DA')} و ${v('DA')} = ${v('DE')}`,
        'لأن BCED مستطيل',
      ],
      correct: 0, cols: 1,
      explain: 'ABCD متوازي أضلاع فـ $\\overrightarrow{AD} = \\overrightarrow{BC}$ ، و D مركز ABEF أي منتصف [AE] فـ $\\overrightarrow{AD} = \\overrightarrow{DE}$ . تساوي الطولين لا يكفي (يلزم المنحى والاتجاه)، و $\\overrightarrow{DA}$ معاكس لـ $\\overrightarrow{BC}$ ، و BCED متوازي أضلاع غير مستطيل هنا.',
    },
    commonError: 'الاكتفاء بتساوي الطولين BC = DE: شعاعان متساويان لهما أيضا نفس المنحى ونفس الاتجاه.',
  },
  {
    id: 'ex-20-2', source: S(20, '2'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: `2) ${v('CE')} + ${v('FE')} يساوي:`,
      options: [v('AD'), v('CF'), v('DA'), 'لا يمكن تبسيطها لأن الشعاعين لا يتتابعان'],
      correct: 0, cols: 2,
      explain: 'BCED متوازي أضلاع (من السؤال 1: $\\overrightarrow{BC} = \\overrightarrow{DE}$ ) فـ $\\overrightarrow{CE} = \\overrightarrow{BD}$ ، و ABEF متوازي أضلاع فـ $\\overrightarrow{FE} = \\overrightarrow{AB}$ . إذن $\\overrightarrow{CE} + \\overrightarrow{FE} = \\overrightarrow{AB} + \\overrightarrow{BD} = \\overrightarrow{AD}$ (علاقة شال). شعاعان لا يتتابعان يُبسَّطان بعد تعويض أحدهما.',
    },
    method: 'نعوّض كل شعاع بشعاع يساويه حتى يتتابعا، ثم نطبّق علاقة شال.',
    commonError: 'التوقّف لأن الشعاعين لا يتتابعان: نعوّض أولا بشعاع يساويه (متوازي أضلاع).',
  },
  {
    id: 'ex-20-3', source: S(20, '3'), learningPointId: LP.P3, difficulty: 'difficile',
    interaction: 'choice',
    question: {
      prompt: `3) النقطة M حيث ${v('BM')} = ${v('DM')} + ${v('CM')} :`,
      options: ['تنطبق على E', 'تنطبق على F', 'منتصف [CE]', 'تنطبق على A'],
      correct: 0, cols: 2,
      explain: '$\\overrightarrow{BM} - \\overrightarrow{DM} = \\overrightarrow{BM} + \\overrightarrow{MD} = \\overrightarrow{BD}$ ، فالمساواة تصبح $\\overrightarrow{CM} = \\overrightarrow{BD}$ . ومن السؤال 2: $\\overrightarrow{CE} = \\overrightarrow{BD}$ ، إذن M تنطبق على E.',
    },
    method: 'نجمع كل ما فيه M في طرف ونختصر بعلاقة شال، فنحصل على شعاع مبدؤه نقطة معلومة ونهايته M.',
  },

  // تمرين 17 — J مركز ABCD : O et M, J منتصف [OM], JO = DA = CB
  {
    id: 'ex-17-1', source: S(17, '1'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex17',
    statement: 'النقطة J هي تقاطع قطري متوازي الأضلاع ABCD. 1) أنشئ النقطتين O و M بحيث يكون $\\overrightarrow{JO} = \\overrightarrow{JA} + \\overrightarrow{JB}$ و $\\overrightarrow{JM} = \\overrightarrow{JC} + \\overrightarrow{JD}$ . 2) بيّن أن J منتصف [OM]. 3) بيّن أن $\\overrightarrow{JO} = \\overrightarrow{DA} = \\overrightarrow{CB}$ .',
    interaction: 'choice',
    question: {
      prompt: `1) ${v('JO')} = ${v('JA')} + ${v('JB')} يعني أن:`,
      options: ['الرباعي JAOB متوازي أضلاع', 'الرباعي JABO متوازي أضلاع', 'O منتصف [AB]', 'O تنطبق على C'],
      correct: 0, cols: 1,
      explain: 'قاعدة متوازي الأضلاع: $\\overrightarrow{JA} + \\overrightarrow{JB} = \\overrightarrow{JO}$ حيث [JO] قطر متوازي الأضلاع JAOB الصادر من J. منتصف [AB] يعطي نصف المجموع لا المجموع، و JABO رباعي متقاطع الضلعين.',
    },
    commonError: 'وضع O في منتصف [AB]: المجموع $\\overrightarrow{JA} + \\overrightarrow{JB}$ هو القطر الكامل لمتوازي الأضلاع JAOB.',
  },
  {
    id: 'ex-17-2', source: S(17, '2'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'batch',
    question: {
      prompt: '2) لنبيّن أن J منتصف [OM]:',
      rows: [
        { label: `${v('JC')} يساوي (J منتصف [AC])`, options: ['$-\\overrightarrow{JA}$', v('JA'), v('JB')], correct: 0,
          correction: 'J منتصف [AC]: $\\overrightarrow{AJ} = \\overrightarrow{JC}$ أي $\\overrightarrow{JC} = -\\overrightarrow{JA}$ .' },
        { label: `${v('JD')} يساوي (J منتصف [BD])`, options: ['$-\\overrightarrow{JB}$', v('JB'), v('JA')], correct: 0,
          correction: 'J منتصف [BD]: $\\overrightarrow{JD} = \\overrightarrow{BJ} = -\\overrightarrow{JB}$ .' },
        { label: `إذن ${v('JM')} = ${v('JC')} + ${v('JD')} يساوي`, options: ['$-\\overrightarrow{JO}$', v('JO'), '$\\overrightarrow{0}$'], correct: 0,
          correction: '$\\overrightarrow{JM} = -\\overrightarrow{JA} - \\overrightarrow{JB} = -\\overrightarrow{JO}$ : $\\overrightarrow{JM}$ و $\\overrightarrow{JO}$ متعاكسان، فـ J منتصف [OM].' },
      ],
      explain: '$\\overrightarrow{JM} = -\\overrightarrow{JO}$ أي $\\overrightarrow{OJ} = \\overrightarrow{JM}$ : J منتصف [OM].',
    },
    method: 'نكتب كل شعاع بدلالة $\\overrightarrow{JA}$ و $\\overrightarrow{JB}$ باستعمال المنتصف.',
    commonError: 'كتابة $\\overrightarrow{JC} = \\overrightarrow{JA}$ : J منتصف [AC] يعطي شعاعين متعاكسين.',
  },
  {
    id: 'ex-17-3', source: S(17, '3'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: `3) لنبيّن أن ${v('JO')} = ${v('DA')} نكتب ${v('JA')} + ${v('JB')} = ${v('DJ')} + ${v('JA')} لأن:`,
      options: [
        `${v('JB')} = ${v('DJ')} (J منتصف [BD])`,
        `${v('JB')} = ${v('JD')}`,
        `${v('JB')} = ${v('AJ')}`,
      ],
      correct: 0, cols: 1,
      explain: 'J منتصف [BD] فـ $\\overrightarrow{DJ} = \\overrightarrow{JB}$ ، ثم بعلاقة شال $\\overrightarrow{DJ} + \\overrightarrow{JA} = \\overrightarrow{DA}$ ، و $\\overrightarrow{DA} = \\overrightarrow{CB}$ لأن ABCD متوازي أضلاع. $\\overrightarrow{JD}$ معاكس لـ $\\overrightarrow{JB}$ ، و $\\overrightarrow{AJ} = \\overrightarrow{JC}$ لا $\\overrightarrow{JB}$ .',
    },
    commonError: 'منتصف بشعاعين متعاكسين: J منتصف [BD] يعني $\\overrightarrow{DJ} = \\overrightarrow{JB}$ لا $\\overrightarrow{JD} = \\overrightarrow{JB}$ .',
  },

  // تمرين 23 — K et L ; A منتصف [KL]
  {
    id: 'ex-23-1', source: S(23, '1'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex23',
    statement: 'M نقطة خارج مثلث ABC. 1) أنشئ النقطتين K و L حيث $\\overrightarrow{MK} = \\overrightarrow{MA} + \\overrightarrow{BC}$ و $\\overrightarrow{ML} = \\overrightarrow{MB} + \\overrightarrow{CA}$ . 2) بيّن أن A منتصف [KL].',
    interaction: 'choice',
    question: {
      prompt: `1) ${v('MK')} = ${v('MA')} + ${v('BC')} يعني أن:`,
      options: [`${v('AK')} = ${v('BC')}`, `${v('KA')} = ${v('BC')}`, `${v('MK')} = ${v('AC')}`],
      correct: 0, cols: 1,
      explain: '$\\overrightarrow{MK} = \\overrightarrow{MA} + \\overrightarrow{AK}$ (علاقة شال)، فالمساواة تعطي $\\overrightarrow{AK} = \\overrightarrow{BC}$ : K صورة A بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ ، أي ABCK متوازي أضلاع. وبالطريقة نفسها $\\overrightarrow{BL} = \\overrightarrow{CA}$ .',
    },
    method: 'نُدخل النقطة A في $\\overrightarrow{MK}$ بعلاقة شال فيختفي M.',
    commonError: 'الخلط بين النقطة وصورتها: $\\overrightarrow{AK} = \\overrightarrow{BC}$ لا $\\overrightarrow{KA} = \\overrightarrow{BC}$ .',
  },
  {
    id: 'ex-23-2', source: S(23, '2'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'batch',
    question: {
      prompt: '2) لنبيّن أن A منتصف [KL]:',
      rows: [
        { label: `${v('AL')} = ${v('AB')} + ${v('BL')} = ${v('AB')} + ${v('CA')} يساوي`, options: [v('CB'), v('BC'), v('AC')], correct: 0,
          correction: '$\\overrightarrow{AB} + \\overrightarrow{CA} = \\overrightarrow{CA} + \\overrightarrow{AB} = \\overrightarrow{CB}$ (علاقة شال، بتبديل الترتيب).' },
        { label: `${v('CB')} يساوي`, options: ['$-\\overrightarrow{AK}$', v('AK'), v('BA')], correct: 0,
          correction: '$\\overrightarrow{AK} = \\overrightarrow{BC}$ فـ $\\overrightarrow{CB} = -\\overrightarrow{AK}$ .' },
        { label: `${v('AL')} = -${v('AK')} ، إذن`, options: ['A منتصف [KL]', 'K منتصف [AL]', 'AKBL متوازي أضلاع'], correct: 0,
          correction: '$\\overrightarrow{KA} = \\overrightarrow{AL}$ : A منتصف [KL].' },
      ],
      explain: '$\\overrightarrow{AL} = \\overrightarrow{CB} = -\\overrightarrow{AK}$ ، أي $\\overrightarrow{KA} = \\overrightarrow{AL}$ : A منتصف [KL].',
    },
    commonError: 'نسيان الإشارة: $\\overrightarrow{AL} = \\overrightarrow{CB}$ و $\\overrightarrow{AK} = \\overrightarrow{BC}$ متعاكسان.',
  },

  // تمرين 21 — posé CORRIGÉ (K منتصف [ED])
  {
    id: 'ex-21-1', source: S(21, '1'), learningPointId: LP.P2, difficulty: 'difficile', figure: 'ex21', correction: true,
    statement: 'A، B، K ثلاث نقط ليست في استقامية. نسمّي L منتصف [AB]. D النقطة التي من أجلها يكون الرباعي BLKD متوازي أضلاع و E النقطة المعرّفة كالآتي: $\\overrightarrow{LE} = \\overrightarrow{LA} + \\overrightarrow{LK}$ . أثبت أنّ K منتصف [ED].',
    interaction: 'batch',
    question: {
      prompt: 'لنثبت أن K منتصف [ED]:',
      rows: [
        { label: 'BLKD متوازي أضلاع يعطي', options: [`${v('KD')} = ${v('LB')}`, `${v('KD')} = ${v('BL')}`, `${v('KD')} = ${v('LA')}`], correct: 0,
          correction: 'BLKD متوازي أضلاع: $\\overrightarrow{BL} = \\overrightarrow{DK}$ أي $\\overrightarrow{KD} = \\overrightarrow{LB}$ ؛ $\\overrightarrow{BL}$ و $\\overrightarrow{LA}$ يعاكسان $\\overrightarrow{LB}$ .' },
        { label: `${v('LE')} = ${v('LA')} + ${v('LK')} يعطي`, options: [`${v('KE')} = ${v('LA')}`, `${v('KE')} = ${v('AL')}`, `${v('LE')} = ${v('AK')}`], correct: 0,
          correction: 'قاعدة متوازي الأضلاع: LAEK متوازي أضلاع، فـ $\\overrightarrow{KE} = \\overrightarrow{LA}$ .' },
        { label: `L منتصف [AB] يعطي ${v('LA')} =`, options: ['$-\\overrightarrow{LB}$', v('LB'), v('AB')], correct: 0,
          correction: 'L منتصف [AB]: $\\overrightarrow{LA}$ و $\\overrightarrow{LB}$ متعاكسان.' },
      ],
      explain: '$\\overrightarrow{KE} = \\overrightarrow{LA} = -\\overrightarrow{LB} = -\\overrightarrow{KD}$ : الشعاعان $\\overrightarrow{KE}$ و $\\overrightarrow{KD}$ متعاكسان، فـ K منتصف [ED].',
    },
    commonError: 'الاكتفاء بالشكل أو بالنص المطبوع: البرهان يعطي K منتصف [ED] (لا L).',
  },

  // تمرين 24 — KM + KJ′ = KL
  {
    id: 'ex-24-1', source: S(24, '1'), learningPointId: LP.P1, difficulty: 'difficile', figure: 'ex24',
    statement: 'KLM مثلث متساوي الساقين رأسه الأساسي L حيث KM = 6cm ، KL = 5cm . I منتصف [KM] و J منتصف [KL]. J′ صورة J بالانسحاب الذي شعاعه $\\overrightarrow{MJ}$ . بيّن أن $\\overrightarrow{KM} + \\overrightarrow{KJ\'} = \\overrightarrow{KL}$ .',
    interaction: 'batch',
    question: {
      prompt: `لنبيّن أن ${v('KM')} + ${v("KJ'")} = ${v('KL')} :`,
      rows: [
        { label: `J′ صورة J بالانسحاب الذي شعاعه ${v('MJ')} ، إذن ${v("JJ'")} =`, options: [v('MJ'), v('JM'), v('KJ')], correct: 0,
          correction: 'صورة J بالانسحاب الذي شعاعه $\\overrightarrow{MJ}$ هي J′ حيث $\\overrightarrow{JJ\'} = \\overrightarrow{MJ}$ (لا $\\overrightarrow{J\'J}$ ).' },
        { label: `${v('KM')} + ${v("KJ'")} = ${v('KM')} + ${v('KJ')} + ${v('MJ')} ، و ${v('KM')} + ${v('MJ')} =`, options: [v('KJ'), v('JK'), v('MK')], correct: 0,
          correction: '$\\overrightarrow{KJ\'} = \\overrightarrow{KJ} + \\overrightarrow{JJ\'}$ ، ثم $\\overrightarrow{KM} + \\overrightarrow{MJ} = \\overrightarrow{KJ}$ (علاقة شال).' },
        { label: `${v('KJ')} + ${v('KJ')} =`, options: [v('KL'), v('JL'), '$\\overrightarrow{0}$'], correct: 0,
          correction: 'J منتصف [KL]: $\\overrightarrow{KJ} = \\overrightarrow{JL}$ ، فـ $\\overrightarrow{KJ} + \\overrightarrow{KJ} = \\overrightarrow{KJ} + \\overrightarrow{JL} = \\overrightarrow{KL}$ .' },
      ],
      explain: '$\\overrightarrow{KM} + \\overrightarrow{KJ\'} = \\overrightarrow{KM} + \\overrightarrow{MJ} + \\overrightarrow{KJ} = \\overrightarrow{KJ} + \\overrightarrow{KJ} = \\overrightarrow{KL}$ .',
    },
    commonError: 'كتابة $\\overrightarrow{J\'J} = \\overrightarrow{MJ}$ : صورة J هي نهاية الشعاع الذي مبدؤه J.',
  },

  // تمرين 18 — la figure du manuel, puis les points du laboratoire
  {
    id: 'ex-18-1', source: S(18, '1'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex18',
    statement: 'ABC مثلث كيفي، النقطة O هي منتصف [AC] و D نظيرة B بالنسبة إلى O. 1) أنشئ النقط H، K و L حيث $\\overrightarrow{BH} = \\overrightarrow{AO}$ ، $\\overrightarrow{CL} = \\overrightarrow{OC}$ و $\\overrightarrow{CK} = \\overrightarrow{AB} + \\overrightarrow{AO}$ . 2) برهن أن $\\overrightarrow{HK} = \\overrightarrow{OL} = \\overrightarrow{AC}$ . 3) ما هي طبيعة الرباعي OHKL. 4) المستقيمان (CK) و (LH) متقاطعان في النقطة G. برهن أن G مركز ثقل المثلث OKL.',
    interaction: 'choice',
    question: {
      prompt: `1) ${v('CL')} = ${v('OC')} يعني أن L هي:`,
      options: ['نظيرة O بالنسبة إلى C', 'نظيرة C بالنسبة إلى O', 'منتصف [OC]', 'نظيرة A بالنسبة إلى O'],
      correct: 0, cols: 2,
      explain: '$\\overrightarrow{OC} = \\overrightarrow{CL}$ : C منتصف [OL]، أي L نظيرة O بالنسبة إلى C. (و H صورة B بالانسحاب الذي شعاعه $\\overrightarrow{AO}$ ، و K نهاية ممثّل $\\overrightarrow{AB} + \\overrightarrow{AO}$ الذي مبدؤه C.)',
    },
    commonError: 'قلب الشعاع: $\\overrightarrow{CL} = \\overrightarrow{OC}$ يضع L بعد C على [OC) لا بين O و C.',
  },
  {
    id: 'ex-18-2', source: S(18, '2'), learningPointId: LP.P1, difficulty: 'difficile',
    interaction: 'batch',
    question: {
      prompt: `2) لنبرهن أن ${v('HK')} = ${v('OL')} = ${v('AC')} :`,
      rows: [
        { label: `${v('OL')} = ${v('OC')} + ${v('CL')} =`, options: [`${v('AO')} + ${v('OC')} = ${v('AC')}`, `${v('OC')} + ${v('CO')} = $\\overrightarrow{0}$`, `${v('OC')} + ${v('AC')}`], correct: 0,
          correction: '$\\overrightarrow{CL} = \\overrightarrow{OC}$ (تعريف L) و $\\overrightarrow{OC} = \\overrightarrow{AO}$ (O منتصف [AC]) : $\\overrightarrow{OL} = \\overrightarrow{AO} + \\overrightarrow{OC} = \\overrightarrow{AC}$ .' },
        { label: `${v('HK')} = ${v('HB')} + ${v('BC')} + ${v('CK')} =`, options: [
          `${v('OA')} + ${v('BC')} + ${v('AB')} + ${v('AO')}`,
          `${v('AO')} + ${v('BC')} + ${v('AB')} + ${v('AO')}`,
          `${v('OA')} + ${v('BC')} + ${v('AB')}`,
        ], correct: 0,
          correction: '$\\overrightarrow{BH} = \\overrightarrow{AO}$ فـ $\\overrightarrow{HB} = \\overrightarrow{OA}$ (الاتجاه المعاكس)، و $\\overrightarrow{CK} = \\overrightarrow{AB} + \\overrightarrow{AO}$ (تعريف K).' },
        { label: `${v('OA')} + ${v('AO')} + ${v('AB')} + ${v('BC')} =`, options: [v('AC'), v('OC'), v('AO') + ' + ' + v('AC')], correct: 0,
          correction: '$\\overrightarrow{OA} + \\overrightarrow{AO} = \\overrightarrow{0}$ (متعاكسان) و $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ (علاقة شال).' },
      ],
      explain: '$\\overrightarrow{HK} = \\overrightarrow{AC}$ و $\\overrightarrow{OL} = \\overrightarrow{AC}$ ، إذن $\\overrightarrow{HK} = \\overrightarrow{OL} = \\overrightarrow{AC}$ — البرهان الذي أنجزته في المختبر.',
    },
    commonError: 'كتابة $\\overrightarrow{HB} = \\overrightarrow{AO}$ : من $\\overrightarrow{BH} = \\overrightarrow{AO}$ نستنتج $\\overrightarrow{HB} = \\overrightarrow{OA}$ .',
  },
  {
    id: 'ex-18-3', source: S(18, '3'), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex18done',
    interaction: 'choice',
    question: {
      prompt: '3) طبيعة الرباعي OHKL:',
      options: ['متوازي أضلاع', 'مستطيل', 'معين', 'رباعي ليس متوازي أضلاع'],
      correct: 0, cols: 2,
      explain: '$\\overrightarrow{OL} = \\overrightarrow{HK}$ يعني أن OLKH (أي OHKL) متوازي أضلاع. ليس مستطيلا ولا معينا: الزاوية في O ليست قائمة، و $OH = AB$ لا يساوي $OL = AC$ في مثلث كيفي.',
    },
    commonError: 'ترتيب الرؤوس: $\\overrightarrow{OL} = \\overrightarrow{HK}$ يعطي OLKH متوازي أضلاع، لا OLHK.',
  },
  {
    id: 'ex-18-4', source: S(18, '4'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'reasoning',
    question: {
      prompt: '4) برهن أن G مركز ثقل المثلث OKL.',
      solution: [
        'C منتصف [OL] ( $\\overrightarrow{OC} = \\overrightarrow{CL}$ )، فالمستقيم (KC) متوسط في المثلث OKL.',
        'OHKL متوازي أضلاع، فقطراه [OK] و [HL] متناصفان: (LH) يشمل منتصف [OK]، فهو متوسط ثانٍ في المثلث OKL.',
        'G نقطة تقاطع متوسطين في المثلث OKL، فهي مركز ثقله.',
      ],
    },
  },
];

/** Les parties d'un exercice (ex-20 → ex-20-1, ex-20-2…). */
export const partsOf = (n) => EXERCISES.filter((e) => e.id.startsWith(`ex-${n}-`));
