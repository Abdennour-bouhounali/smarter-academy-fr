/**
 * Le contenu du درس « التعليم في المستوي » (1AM, unité 5) — données pures. Le manuel (docs/sources/1am/unit5/extraction.json) est la RÉFÉRENCE des الكفاءات : ici tout est
 * réécrit par la plateforme (autres mots, autres nombres, autres contextes — guide §4ter-bis), chaque bloc citant seulement l'élément dont il est tiré (`src`) pour la traçabilité de
 * `check:textbook`. Les nombres du labo (`LAB`) sont ceux des préréglages de `manipulations/levels.js › courtyard-drone` et de la tâche posée seule au module 3.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Les nombres des labos (mêmes valeurs que `levels.js` pour les deux niveaux ; `method` est passé par le module 3). Les coordonnées sont en DIXIÈMES d'unité. */
export const LAB = {
  beginner: [
    { id: 'b1', kind: 'fly', paper: 'squared', reads: [{ x: 30, y: -20, what: 'fountain' }, { x: -40, y: 10, what: 'door' }] },
    { id: 'b2', kind: 'fly', paper: 'squared', reads: [{ x: 40, y: 0, what: 'bench' }, { x: 0, y: -30, what: 'tap' }] },
    { id: 'b3', kind: 'read', paper: 'squared', reads: [{ x: -30, y: 20, what: 'gate' }, { x: 20, y: -40, what: 'kiosk' }] },
  ],
  advanced: [
    { id: 'a1', kind: 'read', paper: 'squared', reads: [{ x: 15, y: -30, what: 'chair' }, { x: -25, y: 15, what: 'board' }] },
    { id: 'a2', kind: 'read', paper: 'plain', reads: [{ x: -40, y: 30, what: 'tree' }, { x: 35, y: -20, what: 'well' }] },
    { id: 'a3', kind: 'fly', paper: 'plain', reads: [{ x: 25, y: -15, what: 'fountain' }, { x: -10, y: 5, what: 'bench' }] },
  ],
  method: [{ id: 'm1', kind: 'fly', paper: 'plain', reads: [{ x: -40, y: 30, what: 'tree' }, { x: 0, y: -40, what: 'tap' }] }],
};

/** Les connaissances (معارف) — les mots de la plateforme. */
export const KNOWLEDGE = {
  frame: {
    source: src('know-3', 69, 'أحوصل تعلّماتي', 3),
    definition: 'المعلم المتعامد للمستوي يتشكّل من مستقيمين مدرّجين متعامدين لهما المبدأ نفسه. المحور الأفقي يسمّى محور الفواصل، والمحور الشاقولي يسمّى محور التراتيب.',
  },
  coordinates: {
    source: src('know-3', 69, 'أحوصل تعلّماتي', 3),
    definition: 'في معلم للمستوي نعلّم كلّ نقطة بعددين هما إحداثياها: الأول يُقرأ على محور الفواصل ويسمّى فاصلة النقطة، والثاني يُقرأ على محور التراتيب ويسمّى ترتيبها. نكتب $M(-3\\,;\\,5)$ .',
  },
  order: {
    source: src('act-3', 66, 'اكتشف', 3),
    text: 'الترتيب مهمّ: نقرأ الفاصلة أوّلًا ثمّ الترتيب، فالنقطة $(3\\,;\\,-2)$ غير النقطة $(-2\\,;\\,3)$ ، ولا يكفي عدد واحد لتعليم نقطة في المستوي.',
  },
  onAxis: {
    source: src('self-8', 73, 'أقوّم تعلّماتي', 8),
    text: 'نقطة على محور الفواصل ترتيبها $0$ مثل $B(4\\,;\\,0)$ ، ونقطة على محور التراتيب فاصلتها $0$ مثل $C(0\\,;\\,-2)$ ، والمبدأ $O(0\\,;\\,0)$ على المحورين معًا.',
  },
  parallels: {
    source: src('know-3', 69, 'أحوصل تعلّماتي', 3),
    text: 'لقراءة إحداثيي نقطة نرسم منها موازيين للمحورين: الموازي لمحور التراتيب يلاقي محور الفواصل عند الفاصلة، والموازي لمحور الفواصل يلاقي محور التراتيب عند الترتيب.',
  },
};

/** طريقة (le manuel donne la sienne p. 70 ; ici la plateforme écrit la sienne, avec d'autres nombres) — marquer trois points dont deux sont sur un axe. */
export const METHOD_PLANE = {
  source: src('method-2', 70, 'أكتسب طرائق', 2),
  title: 'أعلّم نقطًا في المستوي',
  exercise: 'في معلم متعامد علّم النقط $A(-4\\,;\\,3)$ و $B(4\\,;\\,0)$ و $C(0\\,;\\,-2)$ .',
  solution: [
    '1. أقرأ الفاصلة أوّلًا: $A$ فاصلتها $-4$ ، فأعدّ أربع وحدات من المبدإ نحو اليسار على محور الفواصل، وترتيبها $3$ : ثلاث وحدات نحو الأعلى.',
    '2. على ورق مرصوف أتبع خطوط المربّعات: أعدّ على الخط الأفقي ثمّ أصعد على الخط الشاقولي.',
    '3. على ورق غير مرصوف أرسم الموازي لمحور التراتيب المارّ بالتدريجة $-4$ ، ثمّ الموازي لمحور الفواصل المارّ بالتدريجة $3$ ، وتقاطعهما هو $A$ .',
    '4. $B(4\\,;\\,0)$ ترتيبها $0$ فهي على محور الفواصل عند التدريجة $4$ ؛ و $C(0\\,;\\,-2)$ فاصلتها $0$ فهي على محور التراتيب عند التدريجة $-2$ .',
  ],
  rule: 'لتعليم نقطة $M(x\\,;\\,y)$ : أبدأ بالفاصلة $x$ على محور الفواصل ثمّ بالترتيب $y$ على محور التراتيب، وتقاطع الموازيين هو النقطة.',
};

/** « أستعدّ » — six affirmations : lire et placer une abscisse sur une droite graduée (items 1–3, lien 1am.m5.r06) et le symétrique, la distance, le placement d'un nombre à un chiffre décimal (items 4–6, même item). */
export const PREP_ITEMS = [
  { skill: 'abscissa', text: 'فاصلة المبدإ على مستقيم مدرّج هي $0$ .', answer: true, why: 'المبدأ هو التدريجة التي فاصلتها $0$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'abscissa', text: 'النقطة التي على يسار المبدإ بثلاث وحدات فاصلتها $3$ .', answer: false, why: 'على يسار المبدإ الفاصلة سالبة: فاصلتها $-3$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'abscissa', text: 'النقطة التي فاصلتها $-2{,}5$ تقع بين العلامتين $-3$ و $-2$ .', answer: true, why: '$-3<-2{,}5<-2$ : نعدّ من المبدإ نحو اليسار.', source: addition('prerequisite_diagnostic') },
  { skill: 'mark', text: 'نظيرة النقطة التي فاصلتها $4$ بالنسبة إلى المبدإ فاصلتها $-4$ .', answer: true, why: 'النظيرة على الجهة الأخرى بالبعد نفسه: فاصلتها العدد المعاكس.', source: addition('prerequisite_diagnostic') },
  { skill: 'mark', text: 'نقطتان لهما المسافة نفسها إلى المبدإ لهما الفاصلة نفسها.', answer: false, why: 'قد تكونان على جهتين مختلفتين، مثل $-3$ و $3$ : المسافة نفسها وفاصلتان مختلفتان.', source: addition('prerequisite_diagnostic') },
  { skill: 'mark', text: 'لتعليم النقطة $B(-1{,}5)$ نضعها على يمين المبدإ بوحدة ونصف.', answer: false, why: 'الفاصلة سالبة فنضعها على يسار المبدإ: بين العلامتين $-2$ و $-1$ .', source: addition('prerequisite_diagnostic') },
];

/** Les erreurs courantes, mot pour mot (knowledgeGraph.js les cite). */
export const GUIDE = {
  swapOrder: {
    wrong: 'النقطة $(3\\,;\\,-2)$ هي النقطة $(-2\\,;\\,3)$ لأنّ العددين نفسهما.',
    why: 'العدد الأول لمحور الفواصل والثاني لمحور التراتيب: إن بدّلناهما تغيّر المكان.',
    right: '$(3\\,;\\,-2)$ و $(-2\\,;\\,3)$ نقطتان مختلفتان.',
  },
  zeroAxis: {
    wrong: 'نقطة على محور الفواصل فاصلتها $0$ .',
    why: 'على محور الفواصل لا نصعد ولا ننزل: ما يساوي $0$ هو الترتيب.',
    right: 'ترتيبها $0$ ، مثل $B(4\\,;\\,0)$ ؛ والفاصلة هي التي تساوي $0$ على محور التراتيب.',
  },
  signDown: {
    wrong: 'نقطة تقع تحت محور الفواصل بوحدتين ترتيبها $2$ .',
    why: 'النزول تحت محور الفواصل يعطي ترتيبًا سالبًا، مثلما يعطي اليسار فاصلة سالبة.',
    right: 'ترتيبها $-2$ .',
  },
};
