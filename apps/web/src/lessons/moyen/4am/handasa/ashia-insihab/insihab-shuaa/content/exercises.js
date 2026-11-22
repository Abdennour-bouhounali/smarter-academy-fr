/**
 * Les exercices du MANUEL rattachés au درس « مفهوم الانسحاب والشعاع وتساوي شعاعين » (extraction.json → destinations :
 * ex-1, 2, 3, 4, 5 « الأشعة والمساواة الشعاعية » et ex-8 « الأشعة ومتوازي الأضلاع », p. 134). Énoncés au mot près ; un
 * exercice à plusieurs parties est découpé en une entrée par partie (la première porte l'énoncé). Les figures sont des
 * DONNÉES GeoFigure (content/figures.js) que le module dessine (`figure`).
 * Tous les distracteurs sont faux (calculés ; la confusion qu'ils portent est dite en commentaire).
 * DEUX COQUILLES du manuel corrigées (extraction › discrepancies) : ex-4 demande « 6 أشعة » égaux à CM alors qu'il n'en
 * existe que 5 entre points nommés ; ex-8 demande « 4 أشعة » égaux à GE alors qu'il n'en existe que 3. Le module le dit
 * en une ligne (`correction`).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_insihab-shuaa_P1',
  P2: '4am_insihab-shuaa_P2',
  P3: '4am_insihab-shuaa_P3',
};

const SEC = 'الأشعة والمساواة الشعاعية';
const SEC2 = 'الأشعة ومتوازي الأضلاع';
const E = (n, part) => ({ ...src(`ex-${n}`, 134, n <= 5 ? SEC : SEC2, n), ...(part ? { part } : {}) });
const V = (s) => `$\\overrightarrow{${s}}$`;

export const EXERCISES = [
  // تمرين 1 — u : منحى (AB)، اتجاه من A إلى B، طول AC
  {
    id: 'ex-1-a', source: E(1, '1'), learningPointId: LP.P2, difficulty: 'facile', figure: 'ex1',
    statement: 'ABC مثلث كيفي. $\\vec{u}$ هو الشعاع الذي منحاه هو منحى المستقيم (AB)، اتجاهه من A إلى B وطوله AC. 1) انقل الشكل التالي: 2) أنشئ الشعاعين $\\overrightarrow{BE}$ و $\\overrightarrow{GC}$ الممثلين للشعاع $\\vec{u}$ .',
    interaction: 'batch',
    question: {
      prompt: 'قبل الإنشاء، اقرأ عناصر الشعاع $\\vec{u}$ :',
      rows: [
        { label: 'منحى $\\vec{u}$', options: ['منحى المستقيم (AB)', 'منحى المستقيم (AC)', 'منحى المستقيم (BC)'], correct: 0, correction: 'المنحى هو منحى المستقيم (AB) كما في النص (الطول وحده يأتي من AC).' },
        { label: 'اتجاه $\\vec{u}$', options: ['من A نحو B', 'من B نحو A'], correct: 0, correction: 'الاتجاه من A إلى B.' },
        // AB : la longueur du segment porteur, pas celle de l'énoncé
        { label: 'طول $\\vec{u}$', options: ['AC', 'AB', 'BC'], correct: 0, correction: 'الطول هو AC، لا AB: الشعاع $\\vec{u}$ ليس $\\overrightarrow{AB}$ .' },
      ],
      explain: 'ثلاثة عناصر تعيّن الشعاع: المنحى (AB)، الاتجاه من A نحو B، والطول AC.',
    },
    commonError: 'أخذ $\\vec{u} = \\overrightarrow{AB}$ : للشعاع $\\vec{u}$ منحى (AB) واتجاه A نحو B، لكن طوله AC وهو أطول من AB.',
  },
  {
    id: 'ex-1-b', source: E(1, '2'), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex1',
    interaction: 'batch',
    question: {
      prompt: '2) أين تقع النقطتان E و G؟',
      rows: [
        // BE = AB : la longueur oubliée ; E sur [BA) : le sens inversé
        { label: 'E', options: ['على نصف المستقيم [AB) بعد B حيث BE = AC', 'على نصف المستقيم [AB) بعد B حيث BE = AB', 'على [BA) من جهة A حيث BE = AC'], correct: 0, correction: '$\\overrightarrow{BE}$ مبدؤه B: نسير من B في اتجاه A نحو B مسافة AC.' },
        // G après C : l'origine et l'extrémité confondues
        { label: 'G', options: ['على الموازي لـ (AB) المار بـ C، قبل C (من جهة A) حيث GC = AC', 'على الموازي لـ (AB) المار بـ C، بعد C حيث CG = AC', 'على (AC) حيث GC = AC'], correct: 0, correction: '$\\overrightarrow{GC}$ نهايته C: G هي المبدأ، فنرجع من C عكس اتجاه $\\vec{u}$ مسافة AC.' },
      ],
      explain: 'ممثّل $\\vec{u}$ مبدؤه B ينتهي في E ؛ وممثّل نهايته C يبدأ من G.',
    },
    commonError: 'وضع G بعد C: في $\\overrightarrow{GC}$ ، C هي النهاية و G المبدأ.',
  },
  // تمرين 2 — quadrillage : AC = BD ؟ AE = CF ؟
  {
    id: 'ex-2', source: E(2), learningPointId: LP.P3, difficulty: 'facile', figure: 'ex2',
    statement: 'لاحظ الشكل. هل المساواة $\\overrightarrow{AC} = \\overrightarrow{BD}$ صحيحة؟ هل المساواة $\\overrightarrow{AE} = \\overrightarrow{CF}$ صحيحة؟',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: '$\\overrightarrow{AC} = \\overrightarrow{BD}$', answer: true, why: 'من A إلى C ومن B إلى D: مربع واحد يمينا وثلاثة نحو الأسفل (ABDC متوازي أضلاع).' },
        { text: '$\\overrightarrow{AE} = \\overrightarrow{CF}$', answer: true, why: 'من A إلى E ومن C إلى F: ستة مربعات يمينا ومربع نحو الأسفل (ACFE متوازي أضلاع).' },
      ],
      explain: 'على المرصوفة نعدّ المربعات أفقيا وشاقوليا مع الجهة.',
    },
  },
  // تمرين 3 — K milieu de [BC]
  {
    id: 'ex-3', source: E(3), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'ABC مثلث كيفي. K هي منتصف [BC]. 1) أنشئ ممثلين للشعاع $\\overrightarrow{AB}$ . 2) أنشئ الممثل الذي مبدؤه K للشعاع $\\overrightarrow{AK}$ .',
    interaction: 'batch',
    question: {
      prompt: 'اختر لكل سطر:',
      rows: [
        // ABCX : l'ordre des lettres (MISC-SHUAA-TARTIB-RUUS)
        { label: 'ممثّل للشعاع $\\overrightarrow{AB}$ مبدؤه C هو $\\overrightarrow{CX}$ حيث', options: ['ABXC متوازي أضلاع', 'ABCX متوازي أضلاع', 'X منتصف [AB]'], correct: 0, correction: '$\\overrightarrow{AB} = \\overrightarrow{CX}$ يعني أن ABXC متوازي أضلاع (A ثم B ثم X ثم C).' },
        // KA : le sens inversé
        { label: 'الممثل الذي مبدؤه K للشعاع $\\overrightarrow{AK}$ هو $\\overrightarrow{KA\'}$ حيث', options: ['A′ نظيرة A بالنسبة إلى K', 'A′ = A', 'A′ منتصف [AK]'], correct: 0, correction: '$\\overrightarrow{AK} = \\overrightarrow{KA\'}$ يعني K منتصف [AA′] ، و A′ هي أيضا الرأس الرابع لمتوازي الأضلاع ABA′C.' },
      ],
      explain: 'ممثّل شعاع: نفس المنحى ونفس الاتجاه ونفس الطول، انطلاقا من المبدأ المطلوب.',
    },
    commonError: 'اختيار $\\overrightarrow{KA}$ ممثلا للشعاع $\\overrightarrow{AK}$ : لهما نفس المنحى ونفس الطول لكن اتجاهين متعاكسين.',
  },
  // تمرين 4 — le sapin
  {
    id: 'ex-4-a', source: E(4, '1'), learningPointId: LP.P1, difficulty: 'facile', figure: 'ex4', correction: 'ex4',
    statement: 'لاحظ الشكل التالي. 1) عيّن صورة R بالانسحاب الذي شعاعه $\\overrightarrow{EM}$ . 2) اذكر 3 أشعة مساوية للشعاع $\\overrightarrow{SP}$ . 3) اذكر 5 أشعة مساوية للشعاع $\\overrightarrow{CM}$ .',
    interaction: 'choice',
    question: {
      prompt: '1) صورة R بالانسحاب الذي شعاعه $\\overrightarrow{EM}$ هي:',
      // M : on recopie l'extrémité de EM ; P : un seul pas
      options: ['N', 'M', 'P'],
      correct: 0, cols: 3,
      explain: 'من E إلى M: مربعان يمينا ومربعان نحو الأعلى. من R بنفس الحركة نصل إلى N: $\\overrightarrow{RN} = \\overrightarrow{EM}$ .',
    },
    commonError: 'أخذ M صورةً لـ R: M صورة E، أما R فتنتقل بنفس السهم انطلاقا منها.',
  },
  {
    id: 'ex-4-b', source: E(4, '2'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex4',
    interaction: 'choice',
    question: {
      prompt: '2) ثلاثة أشعة مساوية للشعاع $\\overrightarrow{SP}$ :',
      options: [
        `${V('DN')} ، ${V('PA')} ، ${V('RC')}`,
        `${V('PS')} ، ${V('ND')} ، ${V('AP')}`, // sens inversés
        `${V('DN')} ، ${V('QR')} ، ${V('BM')}`, // QR, BM : autre longueur / autre منحى
      ],
      correct: 0, cols: 1,
      explain: 'من S إلى P: مربعان يسارا ومربع نحو الأعلى. نفس الحركة: $\\overrightarrow{DN}$ ، $\\overrightarrow{FQ}$ ، $\\overrightarrow{PA}$ ، $\\overrightarrow{QM}$ ، $\\overrightarrow{RC}$ .',
    },
  },
  {
    id: 'ex-4-c', source: E(4, '3'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex4',
    interaction: 'numeric',
    question: {
      prompt: '3) كم شعاعا مساويا للشعاع $\\overrightarrow{CM}$ يمكن رسمه بين النقط المسمّاة في الشكل (دون $\\overrightarrow{CM}$ نفسه)؟',
      expected: 5,
      explain: 'من C إلى M: مربعان يمينا ومربع نحو الأعلى. الأشعة: $\\overrightarrow{EP}$ ، $\\overrightarrow{PN}$ ، $\\overrightarrow{RQ}$ ، $\\overrightarrow{SD}$ ، $\\overrightarrow{QB}$ — خمسة.',
    },
  },
  // تمرين 5 — le losange
  {
    id: 'ex-5', source: E(5), learningPointId: LP.P3, difficulty: 'difficile', figure: 'ex5',
    statement: 'ABCD معين. 1) أنشئ النقطة M حيث $\\overrightarrow{CM} = \\overrightarrow{AB}$ و النقطة N حيث $\\overrightarrow{CN} = \\overrightarrow{BC}$ . 2) ما هي طبيعة الرباعي BMND؟ 3) اذكر شعاعين مساويين للشعاع $\\overrightarrow{NC}$ .',
    interaction: 'batch',
    question: {
      prompt: 'اختر لكل سطر:',
      rows: [
        // ABMC : l'ordre des lettres
        { label: '$\\overrightarrow{CM} = \\overrightarrow{AB}$ يعني أن', options: ['ABMC متوازي أضلاع ، و C منتصف [DM]', 'ABCM متوازي أضلاع', 'M منتصف [AB]'], correct: 0, correction: '$\\overrightarrow{AB} = \\overrightarrow{CM}$ : ABMC متوازي أضلاع ؛ و $\\overrightarrow{DC} = \\overrightarrow{AB} = \\overrightarrow{CM}$ فـ C منتصف [DM].' },
        // losange : il faudrait des côtés consécutifs égaux ; carré : il faudrait un angle droit
        { label: 'طبيعة الرباعي BMND', options: ['مستطيل', 'معين', 'شبه منحرف فقط'], correct: 0, correction: 'C منتصف [DM] و [BN]: متوازي أضلاع ؛ و DM = 2DC = 2BC = BN: قطراه متقايسان، فهو مستطيل.' },
        // BC, AD : les sens inversés
        { label: 'شعاعان مساويان للشعاع $\\overrightarrow{NC}$', options: [`${V('CB')} و ${V('DA')}`, `${V('BC')} و ${V('AD')}`, `${V('CN')} و ${V('BC')}`], correct: 0, correction: '$\\overrightarrow{NC} = \\overrightarrow{CB}$ (لأن $\\overrightarrow{CN} = \\overrightarrow{BC}$) و $\\overrightarrow{CB} = \\overrightarrow{DA}$ (المعين متوازي أضلاع).' },
      ],
      explain: 'في المعين ABCD: $\\overrightarrow{AB} = \\overrightarrow{DC}$ و $\\overrightarrow{AD} = \\overrightarrow{BC}$ ، وكل أضلاعه متقايسة.',
    },
    commonError: 'قراءة $\\overrightarrow{CM} = \\overrightarrow{AB}$ على أنها «ABCM متوازي أضلاع»: الترتيب الصحيح ABMC.',
  },
  // تمرين 8 — le rectangle ABCD et ses milieux
  {
    id: 'ex-8-a', source: E(8, '1'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex8', correction: 'ex8',
    statement: 'لاحظ الشكل أدناه. 1) اذكر 3 أشعة مساوية للشعاع $\\overrightarrow{GE}$ . 2) برهن بطريقتين أن المستقيمين (GF) و (AC) متوازيان.',
    interaction: 'choice',
    question: {
      prompt: '1) الأشعة المساوية للشعاع $\\overrightarrow{GE}$ بين النقط المسمّاة هي:',
      options: [
        `${V('BO')} ، ${V('OD')} ، ${V('FH')}`,
        `${V('BO')} ، ${V('OD')} ، ${V('HF')}`, // HF : sens inversé
        `${V('AO')} ، ${V('OC')} ، ${V('FH')}`, // AO : autre منحى
      ],
      correct: 0, cols: 1,
      explain: 'من G إلى E: نصف العرض نحو اليمين ونصف الطول نحو الأعلى. نفس الحركة: B إلى O، O إلى D، F إلى H.',
    },
  },
  {
    id: 'ex-8-b', source: E(8, '2'), learningPointId: LP.P3, difficulty: 'difficile', figure: 'ex8',
    interaction: 'batch',
    question: {
      prompt: '2) برهن بطريقتين أن (GF) و (AC) متوازيان:',
      rows: [
        // GFOA : l'ordre ; OC = GF mais GFCO, pas GFOC
        { label: 'الطريقة 1 (الأشعة)', options: ['$\\overrightarrow{GF} = \\overrightarrow{OC}$ فـ GFCO متوازي أضلاع ومنه (GF) // (OC) أي (GF) // (AC)', '$\\overrightarrow{GF} = \\overrightarrow{CO}$ فـ (GF) // (AC)', 'GF = OC فقط، فـ (GF) // (AC)'], correct: 0, correction: 'من G إلى F كما من O إلى C: $\\overrightarrow{GF} = \\overrightarrow{OC}$ ، و O و C على (AC).' },
        { label: 'الطريقة 2', options: ['G منتصف [AB] و F منتصف [BC]: خاصية مستقيم المنتصفين في المثلث ABC', 'G و F على حافتي المستطيل', 'لأن GF = AC'], correct: 0, correction: 'في المثلث ABC، المستقيم المار بمنتصفي ضلعين يوازي الضلع الثالث.' },
      ],
      explain: 'شعاعان متساويان على مستقيمين مختلفين يعطيان مستقيمين متوازيين (متوازي أضلاع).',
    },
    commonError: 'الاكتفاء بـ GF = OC: تساوي الطولين لا يكفي، يلزم تساوي الشعاعين (نفس المنحى والاتجاه).',
  },
];

/** Les lignes « صحّحت المنصّة خطأً مطبعيًا » (extraction › discrepancies, ex-4 et ex-8). */
export const CORRECTIONS = {
  ex4: 'صحّحت المنصّة خطأً مطبعيًا: الكتاب يطلب «6 أشعة» مساوية للشعاع $\\overrightarrow{CM}$ ، ولا يوجد بين النقط المسمّاة إلا خمسة (EP، PN، RQ، SD، QB) ؛ السادس يحتاج نقطة غير مسمّاة.',
  ex8: 'صحّحت المنصّة خطأً مطبعيًا: الكتاب يطلب «4 أشعة» مساوية للشعاع $\\overrightarrow{GE}$ ، ولا يوجد بين النقط المسمّاة إلا ثلاثة (BO، OD، FH).',
};

export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
