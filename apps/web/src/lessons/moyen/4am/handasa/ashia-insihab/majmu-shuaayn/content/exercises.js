/**
 * Les exercices du MANUEL rattachés au درس 3 « مجموع شعاعين » et rendus au module 4 (extraction.json → destinations :
 * تمارين 10, 11, 13, 14, 15, 16, p. 135, section « مجموع شعاعين - علاقة شال »). Énoncés au mot près ; un exercice à
 * plusieurs parties est découpé en une entrée par partie (la première porte l'énoncé). Réponses : extraction
 * (`answerSource: computed`, chaque égalité vérifiée par build-extraction.py) ; chaque distracteur est FAUX et sa
 * confusion est dite. Les constructions (« أنشئ », « عيّن ») deviennent le CHOIX du représentant construit.
 * Lectures de l'extraction : ex-13 « $\overrightarrow{AC} + \overrightarrow{AA}$ » gardé tel qu'imprimé (AA = 0) ;
 * A′, B′, C′ milieux des côtés (lus sur la figure). Les figures sont des DONNÉES GeoFigure (content/figures.js).
 */
import { src } from '../../_unit/unitMeta.js';
import { LP } from './textbook.js';

const S = (n, part) => ({ ...src(`ex-${n}`, 135, 'مجموع شعاعين - علاقة شال', n), ...(part ? { part } : {}) });
const V = (n) => `$\\overrightarrow{${n}}$`;

export const EX13_READING = 'قراءة الشكل: A′ و B′ و C′ منتصفات [BC] و [AC] و [AB]. ويُطبع في الكتاب « $\\overrightarrow{AC} + \\overrightarrow{AA}$ » كما هو: $\\overrightarrow{AA} = \\vec{0}$ .';

export const EXERCISES = [
  // تمرين 10 — quatre triangles équilatéraux (EFD et ses milieux A, B, C)
  {
    id: 'ex-10-1', source: S(10, '1'), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex10',
    statement: 'ABC ، BCD ، AFC و EAB هي مثلثات متقايسة الأضلاع. 1) عيّن في كل حالة مما يلي ممثلا للشعاع: $\\overrightarrow{EA} + \\overrightarrow{EB}$ ، $\\overrightarrow{BA} + \\overrightarrow{AF}$ ، $\\overrightarrow{BA} + \\overrightarrow{CA}$ و $\\overrightarrow{EA} + \\overrightarrow{FA}$ . 2) أنشئ الممثل الذي مبدؤه C للشعاع $\\overrightarrow{BC} + \\overrightarrow{CA}$ . 3) أنشئ الممثل الذي مبدؤه E للشعاع $\\overrightarrow{AB} + \\overrightarrow{AC}$ . 4) أنشئ الممثل الذي مبدؤه A للشعاع $\\overrightarrow{BD} + \\overrightarrow{CD}$ .',
    interaction: 'batch',
    question: {
      prompt: '1) ممثل كل شعاع:',
      rows: [
        { label: '$\\overrightarrow{EA} + \\overrightarrow{EB}$', options: [V('EC'), V('AB'), V('ED')], correct: 0,
          correction: 'نفس المبدأ E: EACB معيّن (أضلاعه متقايسة)، فالمجموع هو القطر الصادر من E : $\\overrightarrow{EC}$ .' },
        { label: '$\\overrightarrow{BA} + \\overrightarrow{AF}$', options: [V('BF'), V('FB'), V('BC')], correct: 0,
          correction: 'متعاقبان: علاقة شال، $\\overrightarrow{BA} + \\overrightarrow{AF} = \\overrightarrow{BF}$ .' },
        { label: '$\\overrightarrow{BA} + \\overrightarrow{CA}$', options: [V('DA'), V('BC'), V('AD')], correct: 0,
          correction: '$\\overrightarrow{CA} = \\overrightarrow{DB}$ (BDCA متوازي أضلاع)، فـ $\\overrightarrow{BA} + \\overrightarrow{CA} = \\overrightarrow{DB} + \\overrightarrow{BA} = \\overrightarrow{DA}$ ( $\\overrightarrow{AD}$ هو معاكسه).' },
        { label: '$\\overrightarrow{EA} + \\overrightarrow{FA}$', options: ['$\\vec{0}$', V('EF'), '$2\\overrightarrow{EA}$'], correct: 0,
          correction: 'A منتصف [EF]: $\\overrightarrow{FA} = \\overrightarrow{AE}$ ، فـ $\\overrightarrow{EA} + \\overrightarrow{AE} = \\vec{0}$ .' },
      ],
      explain: 'متعاقبان: علاقة شال؛ نفس المبدأ: قاعدة متوازي الأضلاع؛ وإلا نعوّض أحدهما بشعاع يساويه.',
    },
    commonError: 'تطبيق علاقة شال على $\\overrightarrow{BA} + \\overrightarrow{CA}$ دون تعاقب (نهاية الأول A ليست مبدأ الثاني C).',
  },
  {
    id: 'ex-10-2', source: S(10, '2–4'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'batch',
    question: {
      prompt: '2) و 3) و 4) الممثلات المطلوبة:',
      rows: [
        { label: '2) الممثل الذي مبدؤه C للشعاع $\\overrightarrow{BC} + \\overrightarrow{CA}$', options: [V('CF'), V('CA'), V('CB')], correct: 0,
          correction: 'شال: $\\overrightarrow{BC} + \\overrightarrow{CA} = \\overrightarrow{BA}$ ، و $\\overrightarrow{BA} = \\overrightarrow{CF}$ (BCFA متوازي أضلاع).' },
        { label: '3) الممثل الذي مبدؤه E للشعاع $\\overrightarrow{AB} + \\overrightarrow{AC}$', options: ['$\\overrightarrow{EX}$ حيث $\\overrightarrow{EX} = \\overrightarrow{AD}$', V('ED'), V('EC')], correct: 0,
          correction: 'ABDC معيّن: $\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{AD}$ ؛ الممثل الذي مبدؤه E نقطته الثانية صورة E بالانسحاب الذي شعاعه $\\overrightarrow{AD}$ (نقطة جديدة).' },
        { label: '4) الممثل الذي مبدؤه A للشعاع $\\overrightarrow{BD} + \\overrightarrow{CD}$', options: [V('AD'), V('DA'), '$\\vec{0}$'], correct: 0,
          correction: '$\\overrightarrow{BD} = \\overrightarrow{AC}$ و $\\overrightarrow{CD} = \\overrightarrow{AB}$ ، فالمجموع $\\overrightarrow{AC} + \\overrightarrow{AB} = \\overrightarrow{AD}$ .' },
      ],
      explain: 'نعوّض كل شعاع بشعاع يساويه حتى يصبحا متعاقبين أو لهما نفس المبدأ.',
    },
  },
  // تمرين 11 — ABCD parallélogramme, N et M symétriques
  {
    id: 'ex-11', source: S(11), learningPointId: LP.P1, difficulty: 'moyen', figure: 'ex11',
    statement: 'ABCD متوازي أضلاع (الشكل). نسمي N نظيرة B بالنسبة إلى C و M نظيرة A بالنسبة إلى D. 1) ماهي صورة B بالانسحاب الذي شعاعه $\\overrightarrow{CD}$ متبوعًا بالانسحاب الذي شعاعه $\\overrightarrow{AM}$ ؟ 2) ماهي صورة N بالانسحاب الذي شعاعه $\\overrightarrow{MA}$ متبوعًا بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ ؟',
    interaction: 'batch',
    question: {
      prompt: 'صورة النقطة في كل حالة:',
      rows: [
        { label: '1) صورة B', options: ['M', 'D', 'N'], correct: 0,
          correction: '$\\overrightarrow{CD} = \\overrightarrow{BA}$ ، فالانسحابان المتتابعان شعاعهما $\\overrightarrow{BA} + \\overrightarrow{AM} = \\overrightarrow{BM}$ : صورة B هي M.' },
        { label: '2) صورة N', options: ['C', 'B', 'A'], correct: 0,
          correction: '$\\overrightarrow{MA} = 2\\overrightarrow{DA} = 2\\overrightarrow{CB} = \\overrightarrow{NB}$ ، فـ $\\overrightarrow{MA} + \\overrightarrow{BC} = \\overrightarrow{NB} + \\overrightarrow{BC} = \\overrightarrow{NC}$ : صورة N هي C.' },
      ],
      explain: 'انسحابان متتابعان = انسحاب واحد شعاعه مجموع الشعاعين؛ نجعل الشعاعين متعاقبين بشعاعين يساويانهما.',
    },
    method: 'نعوّض الشعاع الأول بشعاع يساويه مبدؤه النقطة المعطاة، ثم نطبّق علاقة شال.',
    commonError: 'تطبيق الانسحابين بالترتيب المعكوس أو اعتبار $\\overrightarrow{CD}$ مساويا لـ $\\overrightarrow{AB}$ (ترتيب الحروف).',
  },
  // تمرين 13 — le triangle et ses médianes
  {
    id: 'ex-13-1', source: S(13, '1'), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex13',
    statement: 'ABC مثلث مركز ثقله G. 1) بسّط الكتابات التالية: $\\overrightarrow{AA\'} + \\overrightarrow{A\'B}$ ، $\\overrightarrow{BB\'} + \\overrightarrow{CB}$ و $\\overrightarrow{AC} + \\overrightarrow{AA}$ . 2) عيّن في كل حالة مما يلي ممثلا للشعاع: $\\overrightarrow{AC\'} + \\overrightarrow{AB\'}$ ، $\\overrightarrow{GA} + \\overrightarrow{GC}$ و $\\overrightarrow{BG} + \\overrightarrow{CG}$ . 3) أنشئ الممثل الذي مبدؤه G للشعاع $\\overrightarrow{AB} + \\overrightarrow{AC}$ .',
    interaction: 'batch',
    question: {
      prompt: '1) التبسيط:',
      rows: [
        { label: '$\\overrightarrow{AA\'} + \\overrightarrow{A\'B}$', options: [V('AB'), V('BA'), V("AA'")], correct: 0,
          correction: 'متعاقبان: $\\overrightarrow{AA\'} + \\overrightarrow{A\'B} = \\overrightarrow{AB}$ .' },
        { label: '$\\overrightarrow{BB\'} + \\overrightarrow{CB}$', options: [V("CB'"), V("BB'"), V("B'C")], correct: 0,
          correction: 'نبدّل الترتيب: $\\overrightarrow{CB} + \\overrightarrow{BB\'} = \\overrightarrow{CB\'}$ .' },
        { label: '$\\overrightarrow{AC} + \\overrightarrow{AA}$', options: [V('AC'), '$2\\overrightarrow{AC}$', '$\\vec{0}$'], correct: 0,
          correction: '$\\overrightarrow{AA} = \\vec{0}$ : $\\overrightarrow{AC} + \\vec{0} = \\overrightarrow{AC}$ .' },
      ],
      explain: 'الشعاع المعدوم لا يغيّر المجموع، وترتيب الحدّين في مجموع لا يهمّ.',
    },
  },
  {
    id: 'ex-13-2', source: S(13, '2–3'), learningPointId: LP.P3, difficulty: 'difficile',
    interaction: 'batch',
    question: {
      prompt: '2) و 3) الممثلات:',
      rows: [
        { label: '$\\overrightarrow{AC\'} + \\overrightarrow{AB\'}$', options: [V("AA'"), V("B'C'"), V("C'B'")], correct: 0,
          correction: 'AC′A′B′ متوازي أضلاع (C′A′ يوازي AC ونصفه): المجموع هو القطر الصادر من A ، $\\overrightarrow{AA\'}$ .' },
        { label: '$\\overrightarrow{GA} + \\overrightarrow{GC}$', options: [V('BG'), V('GB'), V('AC')], correct: 0,
          correction: 'B′ منتصف [AC] و $GB\' = \\dfrac{1}{2}BG$ : الرأس الرابع لمتوازي الأضلاع على [AC] هو K حيث $\\overrightarrow{GK} = 2\\overrightarrow{GB\'} = \\overrightarrow{BG}$ .' },
        { label: '$\\overrightarrow{BG} + \\overrightarrow{CG}$', options: [V('GA'), V('AG'), V('BC')], correct: 0,
          correction: '$\\overrightarrow{BG} + \\overrightarrow{CG} = 2\\overrightarrow{A\'G} = \\overrightarrow{GA}$ (A′ منتصف [BC] و $AG = 2GA\'$).' },
        { label: '3) الممثل الذي مبدؤه G للشعاع $\\overrightarrow{AB} + \\overrightarrow{AC}$', options: ['$\\overrightarrow{GX}$ حيث $\\overrightarrow{GX} = 2\\overrightarrow{AA\'}$', V("GA'"), V('GA')], correct: 0,
          correction: '$\\overrightarrow{AB} + \\overrightarrow{AC}$ هو القطر الصادر من A لمتوازي الأضلاع على [AB] و [AC]، أي ضعف $\\overrightarrow{AA\'}$ ؛ ننقله إلى G.' },
      ],
      explain: 'القطران في متوازي الأضلاع متناصفان: القطر الصادر من المبدأ ضعف الشعاع نحو منتصف القطر الآخر.',
    },
    commonError: 'أخذ القطر الآخر لمتوازي الأضلاع (لا يمرّ بالمبدأ المشترك).',
  },
  // تمرين 14 — un triangle quelconque
  {
    id: 'ex-14', source: S(14), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'ABC مثلث كيفي. 1) أنشئ النقطة D حيث $\\overrightarrow{BD} = \\overrightarrow{AB} + \\overrightarrow{AC}$ . 2) أنشئ النقطة E حيث $\\overrightarrow{CE} = \\overrightarrow{BC} + \\overrightarrow{CA}$ . 3) أنشئ النقطة F حيث $\\overrightarrow{BF} = \\overrightarrow{BA} + \\overrightarrow{AC}$ .',
    interaction: 'batch',
    question: {
      prompt: 'كيف ننشئ كل نقطة؟',
      rows: [
        { label: '1) D', options: ['صورة B بالانسحاب الذي شعاعه $\\overrightarrow{AX}$ حيث ABXC متوازي أضلاع', 'صورة A بالانسحاب الذي شعاعه $\\overrightarrow{BC}$', 'منتصف [BC]'], correct: 0,
          correction: 'قاعدة متوازي الأضلاع: $\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{AX}$ (ABXC متوازي أضلاع)، ثم $\\overrightarrow{BD} = \\overrightarrow{AX}$ .' },
        { label: '2) E', options: ['صورة C بالانسحاب الذي يحوّل B إلى A', 'صورة A بالانسحاب الذي يحوّل B إلى C', 'النقطة A'], correct: 0,
          correction: 'شال: $\\overrightarrow{BC} + \\overrightarrow{CA} = \\overrightarrow{BA}$ ، فـ $\\overrightarrow{CE} = \\overrightarrow{BA}$ .' },
        { label: '3) F', options: ['تنطبق على C', 'تنطبق على A', 'نظيرة A بالنسبة إلى C'], correct: 0,
          correction: 'شال: $\\overrightarrow{BA} + \\overrightarrow{AC} = \\overrightarrow{BC}$ ، فـ $\\overrightarrow{BF} = \\overrightarrow{BC}$ و $F = C$ .' },
      ],
      explain: 'نبسّط المجموع أولا (شال أو متوازي الأضلاع)، ثم ننشئ النقطة بالانسحاب.',
    },
    method: 'نبسّط الطرف الثاني إلى شعاع واحد، ثم ننشئ النقطة بحيث يكون الشعاع الأول مساويا له.',
  },
  // تمرين 15 — deux vecteurs donnés
  {
    id: 'ex-15', source: S(15), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex15',
    statement: 'يعطى الشعاعان $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ : 1) أنشئ ممثلا للشعاع $\\overrightarrow{DC} + \\overrightarrow{AD}$ . 2) أنشئ ممثلا للشعاع $\\overrightarrow{BC} + \\overrightarrow{AB}$ . 3) أنشئ بطريقتين شعاعا يساوي $\\overrightarrow{AB} + \\overrightarrow{CD}$ .',
    interaction: 'batch',
    question: {
      prompt: 'الممثلات:',
      rows: [
        { label: '1) $\\overrightarrow{DC} + \\overrightarrow{AD}$', options: [V('AC'), V('CA'), V('DA')], correct: 0,
          correction: 'نبدّل الترتيب: $\\overrightarrow{AD} + \\overrightarrow{DC} = \\overrightarrow{AC}$ .' },
        { label: '2) $\\overrightarrow{BC} + \\overrightarrow{AB}$', options: [V('AC'), V('CA'), V('BA')], correct: 0,
          correction: '$\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ .' },
        { label: '3) الطريقة الأولى (علاقة شال)', options: ['$\\overrightarrow{AS}$ حيث $\\overrightarrow{BS} = \\overrightarrow{CD}$', '$\\overrightarrow{AD}$', '$\\overrightarrow{BC}$'], correct: 0,
          correction: 'ننقل $\\overrightarrow{CD}$ إلى نهاية $\\overrightarrow{AB}$ : $\\overrightarrow{AB} + \\overrightarrow{BS} = \\overrightarrow{AS}$ .' },
        { label: '3) الطريقة الثانية (متوازي الأضلاع)', options: ['$\\overrightarrow{AT} = \\overrightarrow{CD}$ ثم الرأس الرابع S لمتوازي الأضلاع ABST', 'القطر [BT] لمتوازي الأضلاع ABST', 'المنتصف بين B و D'], correct: 0,
          correction: 'ننقل $\\overrightarrow{CD}$ إلى المبدأ A ، ثم القطر الصادر من A في ABST هو المجموع $\\overrightarrow{AS}$ .' },
      ],
      explain: 'طريقتان، نفس الشعاع: شال (بالتتابع) أو متوازي الأضلاع (من نفس المبدأ).',
    },
    commonError: 'جمع $\\overrightarrow{AB} + \\overrightarrow{CD}$ بعلاقة شال مباشرة كأن $B = C$ .',
  },
  // تمرين 16 — E milieu des diagonales
  {
    id: 'ex-16', source: S(16), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex16',
    statement: 'A، B، C، D، E نقط حيث $\\overrightarrow{AE} = \\overrightarrow{EC}$ و $\\overrightarrow{BE} = \\overrightarrow{ED}$ و B لا تنتمي إلى (AC). 1) أنجز شكلا مناسبا. 2) ماهو نوع الرباعي ABCD؟ اشرح. 3) عيّن F حيث $\\overrightarrow{AF} = \\overrightarrow{AB} + \\overrightarrow{AD}$ و K حيث $\\overrightarrow{BK} = \\overrightarrow{BA} + \\overrightarrow{BC}$ .',
    interaction: 'batch',
    question: {
      prompt: '2) و 3):',
      rows: [
        { label: '2) الرباعي ABCD', options: ['متوازي أضلاع لأن قطريه [AC] و [BD] لهما نفس المنتصف E', 'مستطيل لأن E منتصف قطريه', 'رباعي كيفي'], correct: 0,
          correction: '$\\overrightarrow{AE} = \\overrightarrow{EC}$ : E منتصف [AC] ؛ $\\overrightarrow{BE} = \\overrightarrow{ED}$ : E منتصف [BD]. قطران متناصفان (و B خارج (AC)): متوازي أضلاع؛ لا شيء يقول إن القطرين متقايسان.' },
        { label: '3) F', options: ['تنطبق على C', 'تنطبق على E', 'نظيرة A بالنسبة إلى C'], correct: 0,
          correction: 'قاعدة متوازي الأضلاع في ABCD: $\\overrightarrow{AB} + \\overrightarrow{AD} = \\overrightarrow{AC}$ ، فـ $F = C$ .' },
        { label: '3) K', options: ['تنطبق على D', 'تنطبق على A', 'تنطبق على E'], correct: 0,
          correction: 'من المبدأ B: $\\overrightarrow{BA} + \\overrightarrow{BC} = \\overrightarrow{BD}$ ، فـ $K = D$ .' },
      ],
      explain: 'متوازي الأضلاع: مجموع شعاعين من رأس هو القطر الصادر من ذلك الرأس.',
    },
  },
];

/** Les parties d'un exercice. */
export const partsOf = (n) => EXERCISES.filter((e) => e.id === `ex-${n}` || e.id.startsWith(`ex-${n}-`));
