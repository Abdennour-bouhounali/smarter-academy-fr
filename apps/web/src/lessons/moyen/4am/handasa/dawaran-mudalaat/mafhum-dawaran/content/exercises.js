/**
 * Les exercices du MANUEL rattachés au درس « مفهوم الدوران وإنشاء صور أشكال هندسية بدوران » (extraction.json → destinations :
 * ex-1, 2, 3, 5, 7 « صورة شكل بدوران », pp. 158–159). Énoncés au mot près ; un exercice à plusieurs parties est découpé en
 * une entrée par partie (la première porte l'énoncé). Les figures sont des DONNÉES GeoFigure (content/figures.js) que le
 * module dessine (`figure`). Tous les distracteurs sont faux (vérifiés par content/figures.test.js ; la confusion qu'ils
 * portent est dite en commentaire).
 * Lectures honorées (extraction › discrepancies) : ex-1 — les trois réponses sont [OA], c'est voulu (95°, 230°, 265° y
 * mènent par trois chemins) ; ex-5 — aucune mesure imprimée : la figure est redessinée exacte avec les angles lus sur le
 * scan, et les écarts entre branches sont DONNÉS (EX5_GAPS) pour que la question se résolve.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_mafhum-dawaran_P1',
  P2: '4am_mafhum-dawaran_P2',
  P3: '4am_mafhum-dawaran_P3',
};

const SEC = 'صورة شكل بدوران';
const E = (n, page, part) => ({ ...src(`ex-${n}`, page, SEC, n), ...(part ? { part } : {}) });

export const EXERCISES = [
  // تمرين 1 — quatre segments égaux ; les trois réponses sont [OA]
  {
    id: 'ex-1-a', source: E(1, 158, '1'), learningPointId: LP.P3, difficulty: 'facile', figure: 'ex1',
    statement: '[OA]، [OB]، [OC]، [OD] قطع مستقيم متقايسة (الشكل). 1) ما هي صورة [OC] بالدوران الذي مركزه O وزاويته $95^\\circ$ في الاتجاه المباشر؟ 2) ما هي صورة [OD] بالدوران الذي مركزه O وزاويته $230^\\circ$ في الاتجاه المباشر؟ 3) ما هي قطعة المستقيم التي صورتها [OC] بالدوران الذي مركزه O وزاويته $265^\\circ$ في الاتجاه المباشر؟',
    interaction: 'choice',
    question: {
      prompt: '1) صورة [OC] بالدوران الذي مركزه O وزاويته $95^\\circ$ في الاتجاه المباشر هي:',
      // [OB] : 45° seulement ; [OD] : le sens inverse
      options: ['[OA]', '[OB]', '[OD]'],
      correct: 0, cols: 3,
      explain: 'من C في الاتجاه المباشر: $45^\\circ$ نحو B ثم $50^\\circ$ نحو A، أي $45^\\circ + 50^\\circ = 95^\\circ$ ؛ و OA = OC.',
    },
    commonError: 'التوقف عند B: $\\widehat{COB} = 45^\\circ$ فقط، والمطلوب $95^\\circ$ .',
  },
  {
    id: 'ex-1-b', source: E(1, 158, '2'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex1',
    interaction: 'choice',
    question: {
      prompt: '2) صورة [OD] بالدوران الذي مركزه O وزاويته $230^\\circ$ في الاتجاه المباشر هي:',
      // [OB] : 180° seulement (B, O, D alignés) ; [OC] : 135°
      options: ['[OA]', '[OB]', '[OC]'],
      correct: 0, cols: 3,
      explain: 'من D في الاتجاه المباشر: $135^\\circ$ نحو C، ثم $45^\\circ$ نحو B، ثم $50^\\circ$ نحو A: $135^\\circ + 45^\\circ + 50^\\circ = 230^\\circ$ .',
    },
  },
  {
    id: 'ex-1-c', source: E(1, 158, '3'), learningPointId: LP.P3, difficulty: 'difficile', figure: 'ex1',
    interaction: 'choice',
    question: {
      prompt: '3) القطعة التي صورتها [OC] بالدوران الذي مركزه O وزاويته $265^\\circ$ في الاتجاه المباشر هي:',
      // [OD] : on cherche l'ANTÉCÉDENT, pas l'image ; [OB] : 45° seulement
      options: ['[OA]', '[OD]', '[OB]'],
      correct: 0, cols: 3,
      explain: 'من A في الاتجاه المباشر: $130^\\circ$ نحو D ثم $135^\\circ$ نحو C، أي $265^\\circ$ . ونلاحظ أن الدوران بزاوية $265^\\circ$ في الاتجاه المباشر هو الدوران بزاوية $95^\\circ$ في الاتجاه غير المباشر: الأجوبة الثلاثة هي [OA].',
    },
    commonError: 'البحث عن صورة [OC] بدل القطعة التي صورتها [OC]: المطلوب نقطة البداية، لا نقطة الوصول.',
  },
  // تمرين 2 — la croix aux quatre triangles
  {
    id: 'ex-2-a', source: E(2, 158, '1'), learningPointId: LP.P1, difficulty: 'facile', figure: 'ex2',
    statement: 'الشكل الآتي يتكون من أربعة مثلثات. 1) الدوران الذي مركزه O و زاويته $90^\\circ$ يحوّل المثلث ① إلى المثلث ② في الاتجاه غير المباشر. ما هي صورة المثلث ② وصورة المثلث ④ بهذا الدوران؟ 2) ما هو مركز و زاوية و اتجاه الدوران الذي يحوّل المثلث ① إلى المثلث ④ ؟ المثلث ① إلى المثلث ③؟ المثلث ④ إلى المثلث ② ؟',
    interaction: 'batch',
    question: {
      prompt: '1) بالدوران الذي مركزه O وزاويته $90^\\circ$ في الاتجاه غير المباشر:',
      rows: [
        // ① : le sens direct (le retour)
        { label: 'صورة المثلث ②', options: ['المثلث ③', 'المثلث ①', 'المثلث ④'], correct: 0, correction: 'ربع دورة في اتجاه عقارب الساعة: من الأعلى إلى اليمين.' },
        { label: 'صورة المثلث ④', options: ['المثلث ①', 'المثلث ③', 'المثلث ②'], correct: 0, correction: 'من الأسفل إلى اليسار في اتجاه عقارب الساعة.' },
      ],
      explain: 'في اتجاه عقارب الساعة: ① ← ② ← ③ ← ④ ← ①.',
    },
  },
  {
    id: 'ex-2-b', source: E(2, 158, '2'), learningPointId: LP.P1, difficulty: 'moyen', figure: 'ex2',
    interaction: 'batch',
    question: {
      prompt: '2) مركز الدوران O في الحالات الثلاث. زاويته واتجاهه:',
      rows: [
        // 90° indirect : ① ↦ ② ; 180° : ① ↦ ③
        { label: 'المثلث ① إلى المثلث ④', options: ['$90^\\circ$ في الاتجاه المباشر', '$90^\\circ$ في الاتجاه غير المباشر', '$180^\\circ$'], correct: 0, correction: 'من اليسار إلى الأسفل عكس اتجاه عقارب الساعة: ربع دورة في الاتجاه المباشر.' },
        { label: 'المثلث ① إلى المثلث ③', options: ['$180^\\circ$ (التناظر بالنسبة إلى O)', '$90^\\circ$ في الاتجاه المباشر', '$90^\\circ$ في الاتجاه غير المباشر'], correct: 0, correction: 'نصف دورة: الاتجاهان يعطيان نفس الصورة، وهو التناظر الذي مركزه O.' },
        { label: 'المثلث ④ إلى المثلث ②', options: ['$180^\\circ$ (التناظر بالنسبة إلى O)', '$90^\\circ$ في الاتجاه المباشر', '$270^\\circ$ في الاتجاه المباشر'], correct: 0, correction: 'من الأسفل إلى الأعلى: نصف دورة حول O.' },
      ],
      explain: 'نعدّ الأرباع من مثلث إلى آخر، ونحدّد هل الحركة مع عقارب الساعة أم عكسها.',
    },
    commonError: 'الخلط بين الاتجاهين: الاتجاه المباشر هو عكس اتجاه حركة عقارب الساعة.',
  },
  // تمرين 3 — deux rotations de même centre et de même sens
  {
    id: 'ex-3', source: E(3, 158), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'A و B نقطتان كيفيتان. 1) أنشئ C صورة B بالدوران الذي مركزه A وزاويته $50^\\circ$ في اتجاه عقارب الساعة. 2) أنشئ D صورة B بالدوران الذي مركزه A وزاويته $139^\\circ$ في اتجاه عقارب الساعة. 3) ما هو قيس الزاوية $\\widehat{CAD}$ .',
    interaction: 'numeric',
    question: {
      prompt: '3) قيس الزاوية $\\widehat{CAD}$ بالدرجات:',
      expected: 89,
      explain: 'C و D على الدائرة التي مركزها A وتشمل B، في نفس الاتجاه انطلاقا من [AB): $\\widehat{CAD} = 139^\\circ - 50^\\circ = 89^\\circ$ . انتبه: الزاوية ليست قائمة ($89^\\circ \\neq 90^\\circ$).',
    },
    commonError: 'جمع الزاويتين ($50^\\circ + 139^\\circ = 189^\\circ$) أو قراءة $90^\\circ$ على الرسم: الدورانان في نفس الاتجاه فنطرح.',
  },
  // تمرين 5 — l'éventail (angles lus sur le scan, donnés comme écarts)
  {
    id: 'ex-5', source: E(5, 158), learningPointId: LP.P1, difficulty: 'difficile', figure: 'ex5', correction: 'ex5',
    statement: 'لاحظ الشكل التالي: أتمم ما يلي: 1) المثلث AMN صورة ABD بالدوران الذي مركزه … و زاويته … في الاتجاه… . 2) المثلث APQ صورة ABD بالدوران الذي مركزه … و زاويته … في الاتجاه… . 3) المثلث ARS صورة ABD بالدوران الذي مركزه … و زاويته … في الاتجاه… . 4) المثلث AEF صورة AMN بالدوران الذي مركزه … و زاويته … في الاتجاه… .',
    interaction: 'batch',
    question: {
      prompt: 'مركز الدوران في الحالات الأربع هو A. أتمم الزاوية والاتجاه:',
      rows: [
        // 120° indirect : le sens inverse ; 90° : un seul écart compté
        { label: '1) AMN صورة ABD', options: ['$120^\\circ$ في الاتجاه المباشر', '$120^\\circ$ في الاتجاه غير المباشر', '$90^\\circ$ في الاتجاه المباشر'], correct: 0, correction: 'من B إلى M عكس عقارب الساعة: $30^\\circ + 30^\\circ + 30^\\circ + 30^\\circ = 120^\\circ$ (زاوية الرأس ثم الفراغات).' },
        { label: '2) APQ صورة ABD', options: ['$150^\\circ$ في الاتجاه غير المباشر', '$150^\\circ$ في الاتجاه المباشر', '$210^\\circ$ في الاتجاه غير المباشر'], correct: 0, correction: 'من B إلى P مع عقارب الساعة: $60^\\circ + 30^\\circ + 30^\\circ + 30^\\circ = 150^\\circ$ (أو $210^\\circ$ في الاتجاه المباشر).' },
        { label: '3) ARS صورة ABD', options: ['$90^\\circ$ في الاتجاه غير المباشر', '$90^\\circ$ في الاتجاه المباشر', '$60^\\circ$ في الاتجاه غير المباشر'], correct: 0, correction: 'من B إلى R مع عقارب الساعة: $60^\\circ + 30^\\circ = 90^\\circ$ .' },
        { label: '4) AEF صورة AMN', options: ['$60^\\circ$ في الاتجاه غير المباشر', '$60^\\circ$ في الاتجاه المباشر', '$30^\\circ$ في الاتجاه غير المباشر'], correct: 0, correction: 'من M إلى E مع عقارب الساعة: $30^\\circ + 30^\\circ = 60^\\circ$ .' },
      ],
      explain: 'زاوية الرأس في ABD: $180^\\circ - 2 \\times 75^\\circ = 30^\\circ$ ؛ نجمع زوايا الرؤوس والفراغات من صورة نقطة إلى أخرى، ونقرأ الاتجاه.',
    },
    commonError: 'نسيان زاوية الرأس $30^\\circ$ في العدّ، أو قراءة الاتجاه معكوسا.',
  },
  // تمرين 7 — ② image de ① autour de O
  {
    id: 'ex-7', source: E(7, 159), learningPointId: LP.P1, difficulty: 'moyen', figure: 'ex7',
    statement: 'لاحظ في الشكلين الآتيين، ② صورة ① بدوران مركزه O. عيّن زاوية و اتجاه هذا الدّوران.',
    interaction: 'choice',
    question: {
      prompt: 'زاوية الدوران واتجاهه:',
      // indirect : le sens inverse ; 180° : un demi-tour
      options: ['$90^\\circ$ في الاتجاه المباشر', '$90^\\circ$ في الاتجاه غير المباشر', '$180^\\circ$'],
      correct: 0, cols: 1,
      explain: 'الضلع [CA] الشاقولي يصبح [HF] الأفقي: ربع دورة. A ← F، B ← G، C ← H، D ← L، E ← K: عكس اتجاه عقارب الساعة.',
    },
    commonError: 'قراءة الاتجاه من موضع الشكلين (يسار ثم يمين) بدل حركة كل نقطة حول O.',
  },
];

/** Les lignes discrètes de la leçon (extraction › discrepancies). */
export const CORRECTIONS = {
  ex5: 'الكتاب لا يكتب أي زاوية غير $75^\\circ$ : أعادت المنصّة رسم الشكل بالزوايا المقيسة على الكتاب، والفراغات بين المثلثات معطاة: $\\widehat{DAE} = \\widehat{FAM} = \\widehat{QAR} = 30^\\circ$ و $\\widehat{NAP} = \\widehat{SAB} = 60^\\circ$ .',
  ex1: 'الأجوبة الثلاثة هي نفس القطعة: ليس خطأ، بل ثلاث طرق للوصول إلى نفس المكان.',
};

export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
