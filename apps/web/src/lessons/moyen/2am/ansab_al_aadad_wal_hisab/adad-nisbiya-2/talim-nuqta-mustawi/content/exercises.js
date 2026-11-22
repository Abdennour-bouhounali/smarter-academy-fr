/**
 * Les exercices du درس « تعليم نقطة في المستوي » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, mêmes compétences). Chaque exercice porte en `source`
 * l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de `check:textbook`) ; `src()` sans numéro, jamais montré à l'élève.
 * Les clés sont des LITTÉRAUX, RE-vérifiés par ./content.test.js avec un code indépendant (BigInt).
 * Destinations (docs/sources/2am/unit3/extraction.json) : act-1 c, ex-21 … ex-24, deep-52, deep-55 → module 4 ; self-1 … self-3 → le إختبار أولي.
 */
import { src } from '../../_unit/unitMeta.js';
import { FIGURES } from './figures.js';

export const LP = {
  P1: '2am_talim-nuqta-mustawi_P1',
  P2: '2am_talim-nuqta-mustawi_P2',
  P3: '2am_talim-nuqta-mustawi_P3',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const ex = (id, source, learningPointId, difficulty, extra) => ({ id, source, learningPointId, difficulty, ...extra });
/** Une ligne à choix : la bonne réponse à la position `at` parmi les autres. */
const row = (label, right, wrongs, at, correction) => {
  const options = [...wrongs];
  options.splice(at % (wrongs.length + 1), 0, right);
  return { label, options, correct: at % (wrongs.length + 1), correction };
};

export const EXERCISES = [
  // 1. act-1 c (réécrit) : des points qui dessinent un chiffre
  ex('act-1', S('act-1', 40, 'أنشطة'), LP.P3, 'facile', {
    statement: 'علّمنا في معلم متعامد ومتجانس النقط $A(-2\\,;3)$ ، $B(-2\\,;0)$ ، $C(2\\,;0)$ ، $D(1\\,;3)$ ، $E(1\\,;-3)$ ، ثم رسمنا $[AB]$ و $[BC]$ و $[DE]$ .',
    figure: FIGURES.digit,
    interaction: 'choice',
    question: { prompt: 'ما الرقم الذي ظهر في الرسم؟', options: ['$4$', '$1$', '$7$'], correct: 0, cols: 3, explain: '$[AB]$ عمودي و $[BC]$ أفقي و $[DE]$ عمودي يقطع $[BC]$ : هذا هو الرقم $4$ .' },
    commonError: 'وضع الترتيب على المحور الأفقي.',
  }),
  // 2. ex-21 : lire cinq points
  ex('ex-21', S('ex-21', 47), LP.P2, 'facile', {
    statement: 'اقرأ في الشكل إحداثيي كلّ نقطة.',
    figure: FIGURES.read5,
    interaction: 'batch',
    question: {
      rows: [
        row('النقطة $A$', '$(3\\,;2)$', ['$(2\\,;3)$', '$(3\\,;-2)$'], 0, 'ثلاث وحدات يمين محور التراتيب ووحدتان فوق محور الفواصل: $(3\\,;2)$ .'),
        row('النقطة $B$', '$(-4\\,;1)$', ['$(1\\,;-4)$', '$(4\\,;1)$'], 1, 'يسار محور التراتيب بأربع وحدات: الفاصلة $-4$ ، والترتيب $1$ .'),
        row('النقطة $C$', '$(-2\\,;-3)$', ['$(2\\,;3)$', '$(-3\\,;-2)$'], 2, 'يسار المحور العمودي وتحت المحور الأفقي: العددان سالبان.'),
        row('النقطة $D$', '$(0\\,;-1{,}5)$', ['$(-1{,}5\\,;0)$', '$(0\\,;1{,}5)$'], 0, '$D$ على محور التراتيب: فاصلتها $0$ .'),
        row('النقطة $E$', '$(2{,}5\\,;0)$', ['$(0\\,;2{,}5)$', '$(2\\,;5)$'], 1, '$E$ على محور الفواصل: ترتيبها $0$ .'),
      ],
      explain: 'الفاصلة أولًا ثم الترتيب، مقيسان من المبدأ.',
    },
    commonError: 'عكس ترتيب الفاصلة والترتيب.',
  }),
  // 3. ex-22 : par région et sur les axes
  ex('ex-22', S('ex-22', 47), LP.P2, 'moyen', {
    statement: 'من بين النقط $A$ و $B$ و $C$ و $D$ و $E$ في الشكل السابق.',
    figure: FIGURES.read5,
    interaction: 'batch',
    question: {
      rows: [
        row('نقطة فاصلتها موجبة وترتيبها سالب', 'لا توجد', ['النقطة $C$', 'النقطة $D$'], 0, '$C$ فاصلتها سالبة و $D$ فاصلتها معدومة: لا توجد نقطة في هذه المنطقة.'),
        row('نقطة ترتيبها معدوم', 'النقطة $E$', ['النقطة $D$', 'النقطة $A$'], 1, 'ما كان ترتيبه $0$ على محور الفواصل: $E(2{,}5\\,;0)$ .'),
        row('نقطة فاصلتها معدومة', 'النقطة $D$', ['النقطة $E$', 'النقطة $B$'], 2, 'ما كانت فاصلته $0$ على محور التراتيب: $D(0\\,;-1{,}5)$ .'),
      ],
      explain: 'نقرأ إشارة كلّ إحداثية من موضع النقطة بالنسبة إلى المحورين.',
    },
    commonError: 'الخلط بين ما هو على محور الفواصل وما هو على محور التراتيب.',
  }),
  // 4. ex-23 : symétriques axiaux
  ex('ex-23', S('ex-23', 47), LP.P3, 'moyen', {
    statement: 'النقطة $M(3\\,;-2)$ . ما إحداثيا نظيرتها $A$ بالنسبة إلى محور الفواصل، ونظيرتها $B$ بالنسبة إلى محور التراتيب؟',
    interaction: 'batch',
    question: {
      rows: [
        row('نظيرة $M$ بالنسبة إلى محور الفواصل', '$(3\\,;2)$', ['$(-3\\,;-2)$', '$(-3\\,;2)$'], 0, 'الفاصلة نفسها والترتيب معاكس: $(3\\,;2)$ .'),
        row('نظيرة $M$ بالنسبة إلى محور التراتيب', '$(-3\\,;-2)$', ['$(3\\,;2)$', '$(-3\\,;2)$'], 1, 'الترتيب نفسه والفاصلة معاكسة: $(-3\\,;-2)$ .'),
      ],
      explain: 'في كلّ حالة تتغيّر إشارة إحداثية واحدة فقط.',
    },
    commonError: 'تغيير إشارتي الإحداثيتين معًا.',
  }),
  // 5. ex-24 : trois points sur un cercle
  ex('ex-24', S('ex-24', 47), LP.P2, 'moyen', {
    statement: 'النقط $A(3\\,;4)$ و $B(-5\\,;0)$ و $C(-4\\,;-3)$ على الدائرة التي مركزها $O$ ونصف قطرها $5$ وحدات.',
    figure: FIGURES.circle,
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: 'النقطة $B$ تقع على محور الفواصل.', answer: true, why: 'ترتيبها $0$ .' },
        { text: 'النقط الثلاث $A$ و $B$ و $C$ في المنطقة نفسها من المعلم.', answer: false, why: '$A$ فوق المحور الأفقي ويمين العمودي، $B$ على المحور، $C$ تحتهما ويسارهما.' },
        { text: 'النقطة $C$ فاصلتها وترتيبها سالبان.', answer: true, why: '$(-4\\,;-3)$ : العددان سالبان.' },
      ],
      explain: 'مواضع النقط الثلاث مختلفة بالنسبة إلى المحورين، مع أنّها على دائرة واحدة مركزها المبدأ.',
    },
    commonError: 'الظنّ أنّ النقط التي على الدائرة نفسها في المنطقة نفسها.',
  }),
  // 6. deep-55 / now-43 ② : compléter un triangle
  ex('deep-55', S('deep-55', 51, 'أعمّق'), LP.P3, 'difficile', {
    cites: [S('now-43', 43, 'أنشطة'), S('deep-54', 51, 'أعمّق'), S('deep-56', 51, 'أعمّق')],
    statement: 'النقطتان $A(-3\\,;2)$ و $B(-3\\,;-3)$ في معلم متعامد ومتجانس. نريد النقطة $C$ التي فاصلتها موجبة ليكون المثلث $ABC$ قائمًا في $B$ ومتقايس الضلعين.',
    figure: FIGURES.right,
    interaction: 'pair',
    question: { prompt: 'ما إحداثيا $C$ ؟', expected: { x: '2', y: '-3' }, names: ['x', 'y'], explain: '$AB=5$ وحدات بعدّ المربعات، فنأخذ $BC=5$ على الأفقي نحو اليمين: $C(2\\,;-3)$ .' },
    commonError: 'وضع $C$ على الوتر بدل الضلع القائم.',
  }),
  // 7. deep-52 : choisir la graduation (unité) d'un axe
  ex('deep-52', S('deep-52', 51, 'أعمّق'), LP.P3, 'moyen', {
    cites: [S('deep-51', 51, 'أعمّق')],
    statement: 'نريد وضع النقطة $A(-20\\,;60)$ ثم النقطة $B(-2\\,;-3)$ على ورقة، كلّ مرة في معلم متعامد ومتجانس، والورقة تتّسع لستّ سنتيمترات على الأكثر في كلّ جهة من كلّ محور.',
    interaction: 'batch',
    question: {
      rows: [
        row('وحدة المحورين للنقطة $A$', '$1\\,\\mathrm{cm}$ لكل $10$ وحدات', ['$1\\,\\mathrm{cm}$ لكل وحدة', '$1\\,\\mathrm{cm}$ لكل $100$ وحدة'], 0, 'مع $10$ وحدات لكل سنتيمتر: $60$ تبعد $6\\,\\mathrm{cm}$ ، وهي داخل الورقة.'),
        row('وحدة المحورين للنقطة $B$', '$1\\,\\mathrm{cm}$ لكل وحدة', ['$1\\,\\mathrm{cm}$ لكل $10$ وحدات', '$1\\,\\mathrm{cm}$ لكل $100$ وحدة'], 1, 'مع وحدة لكل سنتيمتر تبعد $-3$ ثلاثة سنتيمترات: نراها بوضوح، أمّا مع $10$ وحدات فتقترب النقطتان من المبدأ.'),
      ],
      explain: 'نختار وحدة تُبقي أبعد إحداثية داخل الورقة وتُظهر النقطة بوضوح، والوحدة نفسها على المحورين.',
    },
    commonError: 'اختيار وحدة مختلفة للمحورين.',
  }),
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. */
export const FINAL = [
  { id: 'E1', source: src('self-1', 49, 'أؤكّد تعلّماتي'), prompt: 'نقطة على بعد $3$ وحدات يمين المبدأ ووحدتين تحت محور الفواصل. إحداثياها:', options: ['(3 ; -2)', '(-2 ; 3)', '(3 ; 2)', '(-3 ; -2)'], correct: 0, kind: 'read', truth: { x: '3', y: '-2' } },
  { id: 'E2', source: src('self-2', 49, 'أؤكّد تعلّماتي'), prompt: 'النقطة $(0\\,;-4)$ تقع:', options: ['على محور التراتيب', 'على محور الفواصل', 'في المبدأ', 'تحت محور الفواصل وعلى يمين محور التراتيب'], correct: 0, kind: 'axis', truth: { x: '0', y: '-4' } },
  { id: 'E3', source: src('self-3', 49, 'أؤكّد تعلّماتي'), prompt: 'نظيرة النقطة $(-5\\,;2)$ بالنسبة إلى محور الفواصل:', options: ['(-5 ; -2)', '(5 ; 2)', '(5 ; -2)', '(2 ; -5)'], correct: 0, kind: 'sym', truth: { x: '-5', y: '2' } },
  { id: 'E4', source: null, prompt: 'موضع النقطة $(-2{,}5\\,;1{,}5)$ :', options: ['فوق محور الفواصل وعلى يسار محور التراتيب', 'فوق محور الفواصل وعلى يمين محور التراتيب', 'تحت محور الفواصل وعلى يسار محور التراتيب', 'تحت محور الفواصل وعلى يمين محور التراتيب'], correct: 0, kind: 'region', truth: { x: '-2.5', y: '1.5' } },
  { id: 'E5', source: null, prompt: 'معلم وحدته على المحور الأفقي مربّعان وعلى المحور العمودي مربّع واحد، ومحوراه متعامدان. هذا المعلم:', options: ['متعامد وغير متجانس', 'متعامد ومتجانس', 'غير متعامد', 'لا يمكن القراءة فيه'], correct: 0, kind: 'text' },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
