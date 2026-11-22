/**
 * Les exercices du MANUEL rattachés au درس « قراءة مركبتي شعاع وتمثيلهما في معلم » (extraction.json → destinations :
 * ex-1 à ex-5, section « إحداثيتا نقطة - مركبتا شعاع », p. 146). Énoncés au mot près ; un exercice à plusieurs parties
 * est découpé en une entrée par partie (la première porte l'énoncé). Les figures sont des DONNÉES GeoFigure
 * (content/figures.js) que le module dessine (`figure`). Les « أنشئ / علّم » du manuel (construire, placer) deviennent
 * des questions vérifiables sur la figure dessinée par la plateforme (où est le point ? quelles composantes ?), le
 * tracé lui-même étant fait au module 1 (le lab) et au module 3 (دوري الآن).
 * Tous les distracteurs sont faux (calculés ; la confusion qu'ils portent est dite en commentaire, avec son
 * MISC-MAALAM-* quand il existe).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_murakkibata-shuaa_P1',
  P2: '4am_murakkibata-shuaa_P2',
  P3: '4am_murakkibata-shuaa_P3',
};

const SEC = 'إحداثيتا نقطة - مركبتا شعاع';
const E = (n, part) => ({ ...src(`ex-${n}`, 146, SEC, n), ...(part ? { part } : {}) });
const C = (a, b) => `$\\begin{pmatrix} ${a} \\\\ ${b} \\end{pmatrix}$`;
const V = (s) => `\\overrightarrow{${s}}`;

export const EXERCISES = [
  // تمرين 1 — placer A(−1 ; 2), B(3 ; −3), C(1/2 ; 1), D(−2,5 ; 0) ; le quadrilatère ABCD
  {
    id: 'ex-1-a', source: E(1, '2'), learningPointId: LP.P2, difficulty: 'facile', figure: 'ex1',
    statement: '1) ارسم معلما متعامدا ومتجانسا في المستوي، مبدؤه O. علّم النقطتين $I(1\\,;\\,0)$ و $J(0\\,;\\,1)$ . 2) علّم النقط $A(-1\\,;\\,2)$ ، $B(3\\,;\\,-3)$ ، $C\\left(\\dfrac{1}{2}\\,;\\,1\\right)$ ، $D(-2{,}5\\,;\\,0)$ . 3) أنشئ الرباعي ABCD.',
    interaction: 'batch',
    question: {
      prompt: 'قبل الرسم: أين تقع كل نقطة؟',
      rows: [
        // « à droite » : le signe de l'abscisse lu à l'envers (MISC-MAALAM-ISHARA)
        { label: '$A(-1\\,;\\,2)$', options: ['وحدة على يسار محور التراتيب ووحدتان فوق محور الفواصل', 'وحدة على يمين محور التراتيب ووحدتان فوق محور الفواصل', 'وحدتان على يسار محور التراتيب ووحدة فوق محور الفواصل'], correct: 0, correction: 'الفاصلة $-1$ : وحدة نحو اليسار ؛ الترتيب 2: وحدتان نحو الأعلى.' },
        { label: '$B(3\\,;\\,-3)$', options: ['تحت محور الفواصل وعلى يمين محور التراتيب', 'فوق محور الفواصل وعلى يمين محور التراتيب', 'تحت محور الفواصل وعلى يسار محور التراتيب'], correct: 0, correction: 'فاصلة موجبة (يمين) وترتيب سالب (تحت).' },
        { label: '$C\\left(\\dfrac{1}{2}\\,;\\,1\\right)$', options: ['نصف وحدة على يمين محور التراتيب ووحدة فوق محور الفواصل', 'وحدة على يمين محور التراتيب ونصف وحدة فوق محور الفواصل', 'على محور التراتيب'], correct: 0, correction: 'الفاصلة $\\dfrac{1}{2}$ أولا (أفقيا)، ثم الترتيب 1.' },
        { label: '$D(-2{,}5\\,;\\,0)$', options: ['على محور الفواصل، على يسار O', 'على محور التراتيب، تحت O', 'على محور الفواصل، على يمين O'], correct: 0, correction: 'الترتيب 0: D على محور الفواصل، وفاصلتها سالبة.' },
      ],
      explain: 'الفاصلة أولا (أفقيا، يمين إذا كانت موجبة) ثم الترتيب (عموديا، أعلى إذا كان موجبا).',
    },
    commonError: 'قراءة $(-1\\,;\\,2)$ بالترتيب المعكوس: الفاصلة هي العدد الأول، والترتيب هو الثاني.',
  },
  {
    id: 'ex-1-b', source: E(1, '3'), learningPointId: LP.P1, difficulty: 'moyen', figure: 'ex1',
    interaction: 'batch',
    question: {
      prompt: '3) على الرباعي ABCD المرسوم، اقرأ مركبتي ضلعين متقابلين:',
      rows: [
        // (4 ; 5) : le signe de la descente oublié ; (−5 ; 4) : échangé
        { label: `مركبتا $${V('AB')}$`, options: [C(4, -5), C(4, 5), C(-5, 4)], correct: 0, correction: 'من A إلى B: 4 وحدات نحو اليمين ثم 5 نحو الأسفل.' },
        { label: `مركبتا $${V('DC')}$`, options: [C(3, 1), C(-3, -1), C('\\tfrac{1}{2}', 1)], correct: 0, correction: 'من D إلى C: 3 وحدات نحو اليمين ثم وحدة نحو الأعلى (لا إحداثيتا C).' },
        { label: 'هل ABCD متوازي أضلاع؟', options: ['لا: للشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$ مركبتان مختلفتان', 'نعم: له أربعة أضلاع'], correct: 0, correction: 'رباعي كيفي: $\\overrightarrow{AB} \\neq \\overrightarrow{DC}$ .' },
      ],
      explain: 'شعاعان متساويان لهما نفس المركبتين؛ هنا $\\overrightarrow{AB}\\begin{pmatrix} 4 \\\\ -5 \\end{pmatrix}$ و $\\overrightarrow{DC}\\begin{pmatrix} 3 \\\\ 1 \\end{pmatrix}$ .',
    },
    commonError: 'كتابة $\\begin{pmatrix} 4 \\\\ 5 \\end{pmatrix}$ لأن الطول العمودي 5: النزول نحو الأسفل مركبته سالبة.',
  },
  // تمرين 2 — six points sur la figure, puis OA … OF
  {
    id: 'ex-2-a', source: E(2, '1'), learningPointId: LP.P2, difficulty: 'facile', figure: 'ex2',
    statement: 'المستوي مزوّد بمعلم متعامد ومتجانس، مبدؤه النقطة O. (الوحدة 1cm) A، B، C، D، E، F نقط من المستوي (الشكل) 1) بقراءة بيانية، عيّن كل من النقط A، B، C، D، E و F. 2) أوجد مركبتي كل من الأشعة: $\\overrightarrow{OA}$ ، $\\overrightarrow{OB}$ ، $\\overrightarrow{OC}$ ، $\\overrightarrow{OD}$ ، $\\overrightarrow{OE}$ ، $\\overrightarrow{OF}$ .',
    interaction: 'batch',
    question: {
      prompt: '1) إحداثيتا كل نقطة:',
      rows: [
        { label: 'B', options: ['$(-3\\,;\\,3)$', '$(3\\,;\\,3)$', '$(3\\,;\\,-3)$'], correct: 0, correction: 'B على يسار محور التراتيب: فاصلتها $-3$ .' },
        { label: 'C', options: ['$(0\\,;\\,2)$', '$(2\\,;\\,0)$', '$(0\\,;\\,0)$'], correct: 0, correction: 'C على محور التراتيب: فاصلتها 0 وترتيبها 2.' },
        { label: 'D', options: ['$(7\\,;\\,-2)$', '$(-2\\,;\\,7)$', '$(7\\,;\\,2)$'], correct: 0, correction: 'الفاصلة أولا: 7، ثم الترتيب $-2$ .' },
        { label: 'E', options: ['$(-2\\,;\\,-2)$', '$(2\\,;\\,2)$', '$(-2\\,;\\,2)$'], correct: 0, correction: 'E على يسار المحور وتحته: إحداثيتاها سالبتان.' },
      ],
      explain: 'على الشكل: $A(3\\,;\\,3)$ ، $B(-3\\,;\\,3)$ ، $C(0\\,;\\,2)$ ، $D(7\\,;\\,-2)$ ، $E(-2\\,;\\,-2)$ ، $F(0\\,;\\,-2)$ .',
    },
  },
  {
    id: 'ex-2-b', source: E(2, '2'), learningPointId: LP.P2, difficulty: 'facile', figure: 'ex2',
    interaction: 'batch',
    question: {
      prompt: '2) مركبتا كل شعاع:',
      rows: [
        { label: `$${V('OA')}$`, options: [C(3, 3), C(0, 0), C(-3, 3)], correct: 0, correction: 'مركبتا $\\overrightarrow{OA}$ هما إحداثيتا A.' },
        // (−2 ; 7) : échangé (MISC-MAALAM-TABDIL-X-Y)
        { label: `$${V('OD')}$`, options: [C(7, -2), C(-2, 7), C(7, 2)], correct: 0, correction: 'من O: 7 نحو اليمين ثم 2 نحو الأسفل — إحداثيتا D.' },
        { label: `$${V('OF')}$`, options: [C(0, -2), C(-2, 0), C(0, 2)], correct: 0, correction: 'F على محور التراتيب تحت O: لا إزاحة أفقية.' },
      ],
      explain: 'مركبتا الشعاع $\\overrightarrow{OM}$ هما إحداثيتا M.',
    },
    commonError: 'كتابة مركبتي $\\overrightarrow{OF}$ هكذا $\\begin{pmatrix} -2 \\\\ 0 \\end{pmatrix}$ : المركبة الأولى أفقية، و F على محور التراتيب.',
  },
  // تمرين 3 — symétriques, puis F tel que FB(1 ; 0)
  {
    id: 'ex-3-a', source: E(3, '2'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'المستوي مُزوّد بمعلم متعامد ومتجانس مبدؤه النقطة O. (الوحدة 1cm). 1) A و B نقطتان حيث $A(1\\,;\\,3)$ و $B(-2\\,;\\,-3)$ علّم النقطتين A و B. 2) عيّن النقط C، D، E، F بحيث: C نظير A بالنسبة لـ O. D نظير B بالنسبة لمحور التراتيب. E نظير D بالنسبة لمحور الفواصل. $\\overrightarrow{FB}\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$ .',
    interaction: 'batch',
    question: {
      prompt: 'إحداثيتا كل نقطة:',
      rows: [
        { label: 'C نظير A بالنسبة لـ O', options: ['$(-1\\,;\\,-3)$', '$(-1\\,;\\,3)$', '$(1\\,;\\,-3)$'], correct: 0, correction: 'نظير $(x\\,;\\,y)$ بالنسبة لـ O هو $(-x\\,;\\,-y)$ .' },
        { label: 'D نظير B بالنسبة لمحور التراتيب', options: ['$(2\\,;\\,-3)$', '$(-2\\,;\\,3)$', '$(2\\,;\\,3)$'], correct: 0, correction: 'بالنسبة لمحور التراتيب تتغيّر إشارة الفاصلة فقط.' },
        { label: 'E نظير D بالنسبة لمحور الفواصل', options: ['$(2\\,;\\,3)$', '$(-2\\,;\\,-3)$', '$(-2\\,;\\,3)$'], correct: 0, correction: 'بالنسبة لمحور الفواصل تتغيّر إشارة الترتيب فقط.' },
      ],
      explain: '$C(-1\\,;\\,-3)$ ، $D(2\\,;\\,-3)$ ، $E(2\\,;\\,3)$ .',
    },
  },
  {
    id: 'ex-3-b', source: E(3, '2'), learningPointId: LP.P3, difficulty: 'difficile',
    interaction: 'pair',
    question: {
      prompt: 'إحداثيتا F حيث $\\overrightarrow{FB}\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$ :',
      expected: { x: '-3', y: '-3' },
      explain: 'من F إلى B ننتقل وحدة نحو اليمين: إذن F على يسار $B(-2\\,;\\,-3)$ بوحدة، $F(-3\\,;\\,-3)$ .',
    },
    commonError: 'الانتقال من B بوحدة نحو اليمين فنجد $(-1\\,;\\,-3)$ : الشعاع $\\overrightarrow{FB}$ ينطلق من F وينتهي عند B.',
  },
  // تمرين 4 — deux représentants de u(−2 ; 3)
  {
    id: 'ex-4', source: E(4), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex4After',
    statement: '$\\vec{u}$ شعاع حيث $\\vec{u}\\begin{pmatrix} -2 \\\\ 3 \\end{pmatrix}$ . مثّل في معلم لمستوٍ، ثنائيتين نقطيتين تُمثّل كل منهما الشعاع $\\vec{u}$ .',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: 'الثنائية $(O\\,;\\,U)$ حيث $U(-2\\,;\\,3)$ تمثّل $\\vec{u}$', answer: true, why: 'من O: وحدتان نحو اليسار ثم 3 نحو الأعلى.' },
        { text: 'الثنائية $(E\\,;\\,F)$ حيث $E(3\\,;\\,-1)$ و $F(1\\,;\\,2)$ تمثّل $\\vec{u}$', answer: true, why: 'من E إلى F: وحدتان نحو اليسار ثم 3 نحو الأعلى.' },
        // le sens inversé
        { text: 'الثنائية $(G\\,;\\,H)$ حيث $G(1\\,;\\,1)$ و $H(3\\,;\\,-2)$ تمثّل $\\vec{u}$', answer: false, why: 'من G إلى H: وحدتان نحو اليمين ثم 3 نحو الأسفل — الاتجاه المعاكس.' },
        // l'ordre des déplacements échangé
        { text: 'الثنائية $(K\\,;\\,L)$ حيث $K(0\\,;\\,-1)$ و $L(3\\,;\\,-3)$ تمثّل $\\vec{u}$', answer: false, why: 'من K إلى L: 3 نحو اليمين ثم 2 نحو الأسفل، لا وحدتان نحو اليسار ثم 3 نحو الأعلى.' },
      ],
      explain: 'نختار مبدأ كيفيا ثم ننتقل وحدتين نحو اليسار و 3 نحو الأعلى: لكل اختيار ممثّل جديد.',
    },
    commonError: 'الظنّ أن للشعاع ممثّلا واحدا ينطلق من O: كل نقطة يمكن أن تكون مبدأ ممثّل.',
  },
  // تمرين 5 — AB lu sur la figure, I tel que AI = BC, la nature de AICB
  {
    id: 'ex-5-a', source: E(5, '1'), learningPointId: LP.P1, difficulty: 'facile', figure: 'ex5',
    statement: 'لاحظ الشكل الآتي: 1) بقراءة بيانيّة عيّن مركبتي الشعاع $\\overrightarrow{AB}$ . 2) عيّن النقطة I حيث $\\overrightarrow{AI} = \\overrightarrow{BC}$ . 3) ما هي طبيعة الرباعي AICB؟',
    interaction: 'choice',
    question: {
      prompt: '1) مركبتا $\\overrightarrow{AB}$ هما:',
      // (1 ; 6) : signe oublié ; (−6 ; 1) : échangé ; (−1 ; −2) : les coordonnées de B
      options: [C(1, -6), C(1, 6), C(-6, 1), C(-1, -2)],
      correct: 0,
      cols: 4,
      explain: 'من A إلى B: وحدة نحو اليمين ثم 6 وحدات نحو الأسفل: $\\overrightarrow{AB}\\begin{pmatrix} 1 \\\\ -6 \\end{pmatrix}$ .',
    },
    commonError: 'كتابة إحداثيتي B $(-1\\,;\\,-2)$ بدل مركبتي $\\overrightarrow{AB}$ : المبدأ A ليس O.',
  },
  {
    id: 'ex-5-b', source: E(5, '2'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex5',
    interaction: 'pair',
    question: {
      prompt: '2) إحداثيتا I حيث $\\overrightarrow{AI} = \\overrightarrow{BC}$ :',
      expected: { x: '5', y: '4' },
      explain: '$\\overrightarrow{BC}\\begin{pmatrix} 7 \\\\ 0 \\end{pmatrix}$ : من $A(-2\\,;\\,4)$ ننتقل 7 وحدات نحو اليمين، إذن $I(5\\,;\\,4)$ .',
    },
    commonError: 'وضع I عند $(7\\,;\\,0)$ : مركبتا $\\overrightarrow{BC}$ رحلة تبدأ من A، لا عنوان.',
  },
  {
    id: 'ex-5-c', source: E(5, '3'), learningPointId: LP.P1, difficulty: 'moyen', figure: 'ex5Sol',
    interaction: 'choice',
    question: {
      prompt: '3) طبيعة الرباعي AICB:',
      options: ['متوازي أضلاع', 'معين', 'مستطيل'],
      correct: 0,
      cols: 3,
      explain: '$\\overrightarrow{AI} = \\overrightarrow{BC}$ يعني أن AICB متوازي أضلاع؛ ليس معينا ($AI = 7$ و $AB = \\sqrt{37}$) ولا مستطيلا (الزاوية في A ليست قائمة).',
    },
  },
];

/** Les parties d'un exercice du manuel, dans l'ordre. */
export const partsOf = (n) => EXERCISES.filter((e) => e.source.elementId === `ex-${n}`);
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
