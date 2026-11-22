/**
 * Les exercices du MANUEL rattachés au درس « خواص الدوران وتوظيفها في الأشكال الهندسية » (extraction.json → destinations :
 * ex-4, ex-6 p. 158 et ex-8 p. 159 « صورة شكل بدوران » ; ex-17 et ex-18 p. 161 « أتعمّق »). Énoncés au mot près (les
 * égalités en îlots) ; un exercice à plusieurs parties est découpé en une entrée par partie (la première porte l'énoncé).
 * Les figures sont des DONNÉES GeoFigure (content/figures.js) que le module dessine (`figure`). Toutes les réponses sont
 * recalculées par content/figures.test.js avec rotation.js ; tous les distracteurs sont faux (la confusion qu'ils portent
 * est dite en commentaire).
 *
 * CORRECTIONS (extraction › discrepancies) : ex-17 « ABCD مستطيل » → ABDC (les points dans l'ordre imprimé forment un
 * quadrilatère CROISÉ) ; ex-18 : figure presque effacée, COMPLÉTÉE sur les nœuds (N′ en bas, P′ en haut — la seule lecture
 * qui soit l'image d'un دوران). ex-8 Q1 a DEUX réponses justes (A, 60°, direct — ou O, 90°, indirect) : la seconde
 * n'est jamais proposée comme distracteur.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_khawas-dawaran_P1',
  P2: '4am_khawas-dawaran_P2',
  P3: '4am_khawas-dawaran_P3',
};

const SEC = 'صورة شكل بدوران';
const DEEP = 'أتعمّق';
const E = (n, part) => ({ ...src(`ex-${n}`, n <= 7 ? 158 : n <= 9 ? 159 : 161, n <= 9 ? SEC : DEEP, n), ...(part ? { part } : {}) });
const GRID = ['الفاصلة', 'الترتيبة'];

export const EXERCISES = [
  // تمرين 4 — ABC rectangle isocèle en A ; A′ = image de A par (B, 90°, indirect) ; image du triangle par (C, 45°, direct)
  {
    id: 'ex-4-a', source: E(4, '1'), learningPointId: LP.P3, difficulty: 'facile', figure: 'ex4',
    statement: 'ABC مثلث قائم في A و متساوي الساقين. 1) أنشئ A′ صورة A بالدوران الذي مركزه B وزاويته $90^\\circ$ في الاتجاه غير المباشر. هل ABA′C مربع؟ لماذا؟ 2) أنشئ صورة المثلث بالدوران الذي مركزه C وزاويته $45^\\circ$ في الاتجاه المباشر.',
    interaction: 'batch',
    question: {
      prompt: '1) اختر لكل سطر:',
      rows: [
        // la direction directe (anti-horaire) envoie A sous [AB], du côté opposé à C
        { label: 'A′ صورة A بالدوران (B ، $90^\\circ$ ، غير مباشر) تقع', options: ['في جهة C من المستقيم (AB)، حيث $BA\' = BA$', 'في الجهة الأخرى من (AB)، حيث $BA\' = BA$', 'على النقطة C'], correct: 0, correction: 'الاتجاه غير المباشر هو اتجاه عقارب الساعة: من A تدور حول B نحو الأعلى، في جهة C.' },
        // un losange (côtés égaux) ne suffit pas : l'angle droit est là ; « non » est faux
        { label: 'الرباعي ABA′C', options: ['مربع: أضلاعه الأربعة تساوي AB وزواياه قائمة', 'معين غير مربع', 'ليس متوازي أضلاع'], correct: 0, correction: '$BA\' = BA = AC$ ، و $\\widehat{ABA\'} = 90^\\circ$ و $\\widehat{CAB} = 90^\\circ$ ، و [AC] و [BA′] متوازيتان ومتقايستان: ABA′C مربع.' },
      ],
      explain: 'الدوران يحافظ على الأطوال: $BA\' = BA$ ، وزاويته $90^\\circ$ تعطي الزاوية القائمة في B.',
    },
    commonError: 'الدوران في الاتجاه المباشر (عكس عقارب الساعة) يضع A′ تحت [AB] فلا يتكوّن المربع ABA′C.',
  },
  {
    id: 'ex-4-b', source: E(4, '2'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex4',
    interaction: 'batch',
    question: {
      prompt: '2) صورة المثلث ABC بالدوران الذي مركزه C وزاويته $45^\\circ$ في الاتجاه المباشر هي $CA_1B_1$ :',
      rows: [
        { label: 'صورة C', options: ['C نفسها', 'منتصف [AB]', 'النقطة A'], correct: 0, correction: 'المركز صورة نفسه.' },
        // 2 × 45 : l'angle doublé
        { label: 'النقطة $A_1$', options: ['$CA_1 = CA$ و $\\widehat{ACA_1} = 45^\\circ$', '$CA_1 = CA$ و $\\widehat{ACA_1} = 90^\\circ$', '$CA_1 = CB$ و $\\widehat{ACA_1} = 45^\\circ$'], correct: 0, correction: 'صورة نقطة: نفس البعد عن المركز C، والزاوية $45^\\circ$ .' },
        { label: 'النقطة $B_1$', options: ['على المستقيم (CA′) لأن $\\widehat{ACB} = 45^\\circ$', 'على المستقيم (AB)', 'على المستقيم (AC)'], correct: 0, correction: '[CB] تصنع مع [CA] زاوية $45^\\circ$ ، فتدور $45^\\circ$ أخرى فتصبح عمودية على (CA): على المستقيم الأفقي المار بـ C، أي (CA′).' },
        // le دوران ne déforme pas
        { label: 'المثلث $CA_1B_1$', options: ['قائم في $A_1$ ومتساوي الساقين', 'قائم في C', 'متقايس الأضلاع'], correct: 0, correction: 'الدوران يحافظ على الأطوال والزوايا: صورة مثلث قائم في A ومتساوي الساقين مثلث قائم في $A_1$ ومتساوي الساقين.' },
      ],
      explain: 'ننشئ صورتي A و B فقط: C ثابتة، والمثلث $CA_1B_1$ يقايس ABC.',
    },
  },
  // تمرين 6 — BM = CN (preuve)
  {
    id: 'ex-6', source: E(6), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'A و B نقطتان كيفيتان. C هي صورة B بالدّوران الذي مركزه A و زاويته $90^\\circ$ في الاتجاه المباشر. M نقطة تنتمي إلى [AC]. N هي صورة M بالدّوران الذي مركزه A و زاويته $90^\\circ$ في الاتجاه المباشر. برهن أن $BM = CN$ .',
    interaction: 'batch',
    question: {
      prompt: 'رتّب البرهان: اختر لكل سطر.',
      rows: [
        // A est le centre : il est fixe, B → C
        { label: 'الدوران الذي مركزه A وزاويته $90^\\circ$ في الاتجاه المباشر يحوّل B إلى', options: ['C', 'N', 'A'], correct: 0, correction: 'C صورة B بهذا الدوران (المعطى).' },
        { label: 'ويحوّل M إلى', options: ['N', 'C', 'B'], correct: 0, correction: 'N صورة M بنفس الدوران (المعطى).' },
        // [CM] : l'ordre des images
        { label: 'إذن صورة القطعة [BM] هي القطعة', options: ['[CN]', '[CM]', '[BN]'], correct: 0, correction: 'صورة قطعة: القطعة التي طرفاها صورتا الطرفين، B ↦ C و M ↦ N.' },
        // l'aire, M milieu : pas des justifications de BM = CN
        { label: 'ومنه $BM = CN$', options: ['لأن الدوران يحافظ على الأطوال', 'لأن الدوران يحافظ على المساحات', 'لأن M منتصف [AC]'], correct: 0, correction: 'خاصية الدوران: يحافظ على الأطوال (M نقطة كيفية من [AC]).' },
      ],
      explain: 'نبحث عن دوران يحوّل [BM] إلى [CN]، ثم نطبّق الحفاظ على الأطوال.',
    },
    commonError: 'كتابة صورة [BM] هي [CM]: نسيان أن M نفسها تدور إلى N (ترتيب الصور).',
  },
  // تمرين 8 — compléter « مركزه … زاويته … في الاتجاه … »
  {
    id: 'ex-8', source: E(8), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex8',
    statement: 'لاحظ الشكل التالي: انقل و أتمم ما يلي: 1) C هي صورة B بالدوران الذي مركزه… و زاويته… في الاتجاه… . 2) E هي صورة B بالدوران الذي مركزه O وزاويته …في الاتجاه … . 3) D هي صورة E بالدوران الذي مركزه … وزاويته $90^\\circ$ في الاتجاه… . 4) M هي صورة D بالدوران الذي مركزه… وزاويته… في الاتجاه… . 5) M هي صورة B بالدوران الذي مركزه … وزاويته… في الاتجاه… .',
    interaction: 'batch',
    question: {
      prompt: 'BCDE مربع مركزه O، و ABC متقايس الأضلاع، و $ME = EB$ و $DN = DC$ . أتمم كل سطر:',
      rows: [
        // (O, 90°, indirect) est AUSSI juste : jamais proposé
        { label: '1) C صورة B بالدوران الذي', options: ['مركزه A وزاويته $60^\\circ$ في الاتجاه المباشر', 'مركزه A وزاويته $60^\\circ$ في الاتجاه غير المباشر', 'مركزه O وزاويته $90^\\circ$ في الاتجاه المباشر'], correct: 0, correction: '$AB = AC$ و $\\widehat{BAC} = 60^\\circ$ ، ومن B إلى C عكس عقارب الساعة حول A. (يصلح أيضا: المركز O و $90^\\circ$ في الاتجاه غير المباشر.)' },
        { label: '2) E صورة B بالدوران الذي مركزه O', options: ['وزاويته $90^\\circ$ في الاتجاه المباشر', 'وزاويته $90^\\circ$ في الاتجاه غير المباشر', 'وزاويته $180^\\circ$'], correct: 0, correction: 'قطرا المربع متعامدان ومتقايسان ومتناصفان: $OB = OE$ و $\\widehat{BOE} = 90^\\circ$ ، ومن B إلى E عكس عقارب الساعة.' },
        { label: '3) D صورة E بالدوران الذي زاويته $90^\\circ$', options: ['ومركزه O، في الاتجاه المباشر', 'ومركزه O، في الاتجاه غير المباشر', 'ومركزه E، في الاتجاه المباشر'], correct: 0, correction: '$OE = OD$ و $\\widehat{EOD} = 90^\\circ$ ، ومن E إلى D عكس عقارب الساعة.' },
        // E est le milieu de [MD] : 180° autour de E
        { label: '4) M صورة D بالدوران الذي', options: ['مركزه E وزاويته $180^\\circ$', 'مركزه E وزاويته $90^\\circ$ في الاتجاه المباشر', 'مركزه O وزاويته $180^\\circ$'], correct: 0, correction: '$ME = EB = ED$ و M و E و D على استقامية: E منتصف [MD]، فالدوران $180^\\circ$ (التناظر بالنسبة إلى E).' },
        { label: '5) M صورة B بالدوران الذي', options: ['مركزه E وزاويته $90^\\circ$ في الاتجاه المباشر', 'مركزه E وزاويته $90^\\circ$ في الاتجاه غير المباشر', 'مركزه O وزاويته $90^\\circ$ في الاتجاه المباشر'], correct: 0, correction: '$EB = EM$ و $\\widehat{BEM} = 90^\\circ$ (زاوية المربع ومجاورتها)، ومن B إلى M عكس عقارب الساعة.' },
      ],
      explain: 'لكل سطر: مركز على نفس البعد من النقطة وصورتها، والزاوية بينهما من هذا المركز، ثم جهة الدوران.',
    },
    commonError: 'الخلط بين الاتجاهين: من B إلى E حول O عكس عقارب الساعة (مباشر)، ومن B إلى C حول O مع عقارب الساعة.',
  },
  // تمرين 17 — BEM : E milieu, D image par (E, 180°), ABDC rectangle (corrigé)
  {
    id: 'ex-17-a', source: E(17, '2'), learningPointId: LP.P3, difficulty: 'facile', figure: 'ex17',
    statement: 'من امتحان شهادة التعليم المتوسط. المستوي مزود بمعلم متعامد ومتجانس $(O\\,;\\,\\vec{i},\\,\\vec{j})$ . 1) علّم النقط: $A(0\\,;\\,4)$ ، $B(-3\\,;\\,1)$ ، $C(5\\,;\\,-1)$ . 2) احسب إحداثيتي النقطة E منتصف القطعة [BC]. 3) أنشئ النقطة D صورة A بالدوران الذي مركزه E وزاويته $180^\\circ$ ثم استنتج إحداثيتي D. 4) بيّن أن الرباعي ABDC مستطيل.',
    correction: 'ex17',
    interaction: 'pair',
    question: {
      prompt: '2) إحداثيتا E منتصف [BC]:',
      expected: { x: '1', y: '0' }, names: GRID,
      explain: '$E\\left(\\dfrac{-3 + 5}{2}\\,;\\,\\dfrac{1 - 1}{2}\\right) = (1\\,;\\,0)$ .',
    },
    commonError: 'طرح الإحداثيات بدل جمعها: $\\dfrac{5 - (-3)}{2} = 4$ ليست فاصلة المنتصف.',
  },
  {
    id: 'ex-17-b', source: E(17, '3'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex17',
    interaction: 'pair',
    question: {
      prompt: '3) الدوران الذي زاويته $180^\\circ$ هو التناظر بالنسبة إلى E: E منتصف [AD]. إحداثيتا D:',
      expected: { x: '2', y: '-4' }, names: GRID,
      explain: '$x_D = 2x_E - x_A = 2 - 0 = 2$ و $y_D = 2y_E - y_A = 0 - 4 = -4$ : $D(2\\,;\\,-4)$ .',
    },
    commonError: 'أخذ D منتصف [AE]: صورة A بالتناظر بالنسبة إلى E تجعل E منتصف [AD].',
  },
  {
    id: 'ex-17-c', source: E(17, '4'), learningPointId: LP.P2, difficulty: 'difficile', figure: 'ex17sol',
    interaction: 'batch',
    question: {
      prompt: '4) بيّن أن الرباعي ABDC مستطيل:',
      rows: [
        // le carré : les côtés AB² = 18 et AC² = 50 diffèrent
        { label: 'E منتصف [BC] و [AD]، إذن ABDC', options: ['متوازي أضلاع (قطراه متناصفان)', 'مربع (قطراه متناصفان)', 'شبه منحرف'], correct: 0, correction: 'رباعي قطراه متناصفان متوازي أضلاع؛ والمربع يتطلب أضلاعا متقايسة ($AB^2 = 18$ و $AC^2 = 50$).' },
        { label: 'القطران', options: ['$AD^2 = BC^2 = 68$ : متقايسان', '$AD^2 = 50$ و $BC^2 = 68$ : غير متقايسين', '$AD = BC = 68$'], correct: 0, correction: '$AD^2 = 2^2 + 8^2 = 68$ و $BC^2 = 8^2 + 2^2 = 68$ .' },
        // ABCD : quadrilatère croisé (la coquille du manuel)
        { label: 'النتيجة', options: ['ABDC مستطيل', 'ABCD مستطيل', 'ABDC معين'], correct: 0, correction: 'متوازي أضلاع قطراه متقايسان مستطيل؛ ترتيب الرؤوس A ثم B ثم D ثم C (القطران [AD] و [BC]).' },
      ],
      explain: 'متوازي أضلاع (قطران متناصفان) + قطران متقايسان = مستطيل. ويمكن أيضا: $AB^2 + AC^2 = 18 + 50 = 68 = BC^2$ ، فالزاوية في A قائمة.',
    },
    commonError: 'كتابة ABCD: بهذا الترتيب تتقاطع الضلعان [BC] و [DA] فيتكوّن رباعي متقاطع لا مستطيل.',
  },
  // تمرين 18 — retrouver les centres (figure complétée)
  {
    id: 'ex-18-a', source: E(18, '1'), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex18',
    statement: 'لاحظ الشكل التالي: 1) [A′B′] هي صورة [AB] بدوران مركزه O. أنشئ O. 2) المثلث M′N′P′ هو صورة المثلث MNP بدوران مركزه W. أنشئ W.',
    interaction: 'choice',
    question: {
      prompt: 'كيف ننشئ O؟',
      options: [
        'O نقطة تقاطع محوري [AA′] و [BB′]',
        'O منتصف القطعة [AA′]', // (1 ; 0,5) : OA = OA′ mais OB ≠ OB′
        'O نقطة تقاطع المستقيمين (AA′) و (BB′)', // (1,5 ; 0,25)
      ],
      correct: 0, cols: 1,
      explain: 'المركز على نفس البعد من A و A′، فهو على محور [AA′]؛ ومن B و B′، فهو على محور [BB′].',
    },
    commonError: 'أخذ منتصف [AA′]: هذه النقطة على نفس البعد من A و A′، لكن ليس من B و B′.',
  },
  {
    id: 'ex-18-b', source: E(18, '1'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex18',
    interaction: 'pair',
    question: {
      prompt: '1) في المعلم المرسوم (ضلع مربع الشبكة وحدة)، إحداثيتا O (عدد عشري، مثل 2,5):',
      expected: { x: '3/2', y: '3/2' }, names: GRID,
      explain: 'محور [AA′] ومحور [BB′] يتقاطعان في $O(1{,}5\\,;\\,1{,}5)$ : $OA^2 = OA\'^2 = 2{,}5$ و $OB^2 = OB\'^2 = 2{,}5$ ، وزاوية الدوران $90^\\circ$ في الاتجاه المباشر.',
    },
  },
  {
    id: 'ex-18-c', source: E(18, '2'), learningPointId: LP.P3, difficulty: 'difficile', figure: 'ex18',
    interaction: 'pair',
    question: {
      prompt: '2) إحداثيتا W (انتبه: محورا [MM′] و [NN′] منطبقان؛ استعمل [PP′]):',
      expected: { x: '2', y: '4' }, names: GRID,
      explain: 'محور [MM′] هو المستقيم الذي فاصلته 2، ومحور [PP′] يقطعه في $W(2\\,;\\,4)$ : $WM^2 = WM\'^2 = 2$ ، $WN^2 = WN\'^2 = 8$ ، $WP^2 = WP\'^2 = 4$ ، وزاوية الدوران $90^\\circ$ في الاتجاه المباشر.',
    },
    commonError: 'الاكتفاء بمحوري [MM′] و [NN′]: هما المستقيم نفسه، فلا يعيّنان نقطة.',
  },
];

/** Les lignes « صحّحت المنصّة خطأً مطبعيًا » (extraction › discrepancies, ex-17). */
export const CORRECTIONS = {
  ex17: 'صحّحت المنصّة خطأً مطبعيًا: الكتاب يطلب «ABCD مستطيل»، والنقط بهذا الترتيب ترسم رباعيا متقاطعا؛ المستطيل هو ABDC (قطراه [AD] و [BC]).',
};

export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
