/**
 * Le contenu du درس « الأعداد العشرية ونصف المستقيم المدرّج » (1AM, unité 1) — données pures. Le manuel (docs/sources/1am/unit1/extraction.json)
 * est la RÉFÉRENCE des الكفاءات : ici tout est réécrit par la plateforme (autres mots, autres nombres, autres contextes — guide §4ter-bis),
 * chaque bloc citant seulement l'élément dont il est tiré (`src`) pour la traçabilité de `check:textbook`.
 * Les nombres du labo (`LAB`) sont ceux des préréglages de `manipulations/levels.js › jump-tape` et de la tâche posée seule au module 3.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Les nombres des labos (mêmes valeurs que `levels.js` pour les deux niveaux ; `method` est passé par le module 3). */
export const LAB = {
  beginner: [
    { id: 'b1', kind: 'plant', jumps: ['2,4', '3,1', '1,8'], from: '0', step: '1', unit: 'free' },
    { id: 'b2', kind: 'plant', jumps: ['0,7', '2,9', '3'], from: '0', step: '1', unit: 'free' },
    { id: 'b3', kind: 'plant', jumps: ['0,8', '2+6/10', '3,3'], from: '0', step: '1', unit: 140 },
  ],
  advanced: [
    { id: 'a1', kind: 'read', flags: ['0,6', '1,9', '2,35'], from: '0', step: '1' },
    { id: 'a2', kind: 'read', flags: ['9,4', '10,8', '11,25'], from: '9', step: '1' },
    { id: 'a3', kind: 'read', flags: ['4,04', '4,12', '4,235'], from: '4', step: '0,1' },
  ],
  method: [{ id: 'm1', kind: 'plant', jumps: ['2,7', '1+3/10', '3,5'], from: '0', step: '1', unit: 140 }],
};

/** Les connaissances (معارف) — les mots de la plateforme. */
export const KNOWLEDGE = {
  halfLine: {
    source: src('know-5', 13, 'أحوصل تعلّماتي', 5),
    definition: 'لتدريج نصف مستقيم نختار عليه نقطة تسمّى المبدأ ونرمز إليها بـ $O$ ، ونختار وحدة طول مناسبة وننقلها عليه ابتداءً من المبدأ مرّة بعد مرّة، ثم نقسّم كلّ وحدة إلى عشرة أجزاء متساوية. فيكون التباعد بين تدريجتين صغيرتين متتاليتين $\\frac{1}{10}$ من الوحدة، أي $0{,}1$ .',
  },
  abscissa: {
    source: src('know-5', 13, 'أحوصل تعلّماتي', 5),
    definition: 'كلّ نقطة من نصف مستقيم مدرّج يعيّنها عدد يسمّى فاصلة تلك النقطة. فاصلة المبدأ $O$ هي $0$ ونكتب $O(0)$ . إذا كانت النقطة $A$ تبعد عن $O$ بوحدتين وأربع تدريجات صغيرة فإنّ فاصلتها $2+\\frac{4}{10}=2{,}4$ ، ونكتب $A(2{,}4)$ .',
  },
  writings: {
    source: src('act-4', 10, 'اكتشف', 4),
    text: 'للفاصلة نفسها كتابات مختلفة: $2{,}6=2+\\frac{6}{10}$ ، وفاصلة نقطة على علامة الوحدة عدد طبيعي: $3=3{,}0$ ، فلا تقع بين تدريجتين صغيرتين بل على العلامة نفسها.',
  },
  bounds: {
    source: src('know-5', 13, 'أحوصل تعلّماتي', 5),
    text: 'إذا وقعت نقطة على تدريجة قرأنا فاصلتها مضبوطة؛ وإذا وقعت بين تدريجتين صغيرتين متتاليتين حصرنا فاصلتها بينهما: $2{,}3<C<2{,}4$ ، ولا نقول إنّها $2{,}3$ ولا $2{,}4$ .',
  },
  hiddenOrigin: {
    source: src('know-5', 13, 'أحوصل تعلّماتي', 5),
    text: 'في حالات معيّنة لا يظهر مبدأ نصف المستقيم المدرّج، فنقرأ الفاصلة من الأعداد المكتوبة على التدريجات: علم بين العلامتين 10 و 11 بثماني تدريجات صغيرة بعد 10 فاصلته $10{,}8$ ، ويبقى المبدأ $O(0)$ موجودًا ولو لم نره.',
  },
  smallerScale: {
    source: src('ex-16', 18, 'أتمرّن', 16),
    text: 'يمكن تدريج الجزء الذي يهمّنا من نصف المستقيم أدقّ: إذا قسّمنا الفاصل بين $0$ و $0{,}1$ إلى عشرة أجزاء متساوية فالتباعد بين تدريجتين صغيرتين هو $0{,}01$ .',
  },
};

/** طريقة (ajout de la plateforme : le manuel n'en a pas) — placer deux points, lire une troisième, encadrer une quatrième. */
export const METHOD_PLACE = {
  source: addition('knowledge_formalization'),
  title: 'تعليم نقطة وقراءة فاصلتها',
  exercise: 'على نصف مستقيم مدرّج وحدته مقسّمة إلى عشرة أجزاء متساوية، علّم النقطتين $M(2{,}7)$ و $N\\left(1+\\frac{3}{10}\\right)$ ، ثم اقرأ فاصلة النقطة $K$ التي تبعد عن $O$ بثلاث وحدات وخمس تدريجات صغيرة، ثم احصر فاصلة النقطة $L$ الواقعة بين التدريجة السادسة والتدريجة السابعة بعد العلامة 1 .',
  solution: [
    '1. لتعليم $M(2{,}7)$ : الجزء الصحيح 2، فنعدّ وحدتين من $O$ ؛ ورقم الأعشار 7، فنتقدّم سبع تدريجات صغيرة، ونغرس العلم هناك.',
    '2. $N\\left(1+\\frac{3}{10}\\right)$ : $1+\\frac{3}{10}=1{,}3$ ، فنعدّ وحدة واحدة ثم ثلاث تدريجات صغيرة.',
    '3. لقراءة $K$ : ثلاث وحدات كاملة ثم خمس تدريجات صغيرة، $3+\\frac{5}{10}=3{,}5$ ، إذن $K(3{,}5)$ .',
    '4. النقطة $L$ تقع بين التدريجة التي فاصلتها $1{,}6$ والتي فاصلتها $1{,}7$ ، فلا نقرأ لها فاصلة مضبوطة بل نحصرها: $1{,}6<L<1{,}7$ .',
  ],
  rule: 'الوحدات الكاملة أوّلًا ثم التدريجات الصغيرة (كلّ واحدة $0{,}1$)؛ وإذا وقعت النقطة بين تدريجتين حصرنا فاصلتها بينهما.',
};

/** « أستعدّ » — six affirmations : ranger des décimaux (items 1–2, lien du réseau 1am.m1.r04) et 1/10 = 0,1, 2 + 4/10 = 2,4 (items 3–6, 1am.m1.r02). */
export const PREP_ITEMS = [
  { skill: 'muqarana', text: '$3{,}1>2{,}9$ .', answer: true, why: 'الجزء الصحيح 3 أكبر من الجزء الصحيح 2، فالعدد $3{,}1$ أكبر.', source: addition('prerequisite_diagnostic') },
  { skill: 'muqarana', text: '$1{,}8<1{,}75$ لأنّ 8 أقل من 75 .', answer: false, why: 'الجزآن الصحيحان متساويان، و $1{,}8=1{,}80$ ، و 80 جزءًا من مائة أكثر من 75 : $1{,}8>1{,}75$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'ashar', text: '$\\frac{1}{10}=0{,}1$ .', answer: true, why: 'الجزء من عشرة يكتب بالفاصلة برقم واحد بعدها: $0{,}1$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'ashar', text: '$\\frac{1}{10}=0{,}01$ .', answer: false, why: '$0{,}01$ هو $\\frac{1}{100}$ ؛ أمّا $\\frac{1}{10}$ فهو $0{,}1$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'ashar', text: '$2+\\frac{4}{10}=2{,}4$ .', answer: true, why: 'الجزء الصحيح 2، وأربعة أعشار تُكتب 4 بعد الفاصلة: $2{,}4$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'ashar', text: '$3+\\frac{7}{10}=3{,}07$ .', answer: false, why: 'سبعة أعشار هي رقم واحد بعد الفاصلة: $3+\\frac{7}{10}=3{,}7$ . أمّا $3{,}07$ فهو $3+\\frac{7}{100}$ .', source: addition('prerequisite_diagnostic') },
];

/** Les erreurs courantes, mot pour mot (knowledgeGraph.js les cite). */
export const GUIDE = {
  swapDigits: {
    wrong: 'نغرس علم القفزة $2{,}4$ على بعد 4 وحدات وتدريجتين صغيرتين، لأنّنا نقرأ الرقم 4 قبل الرقم 2 .',
    why: 'الرقم الذي قبل الفاصلة يعدّ الوحدات الكاملة، والذي بعدها يعدّ التدريجات الصغيرة، لا العكس: وحدتان ثم أربع تدريجات.',
    right: '$A(2{,}4)$ : وحدتان كاملتان ثم أربع تدريجات صغيرة.',
  },
  ticksAsUnits: {
    wrong: 'في $2{,}4$ ، الرقم 4 يعني أربع وحدات إضافية: فاصلة العلم $2+4=6$ .',
    why: 'التدريجة الصغيرة ليست وحدة كاملة: هي $\\frac{1}{10}$ من الوحدة، فأربع تدريجات صغيرة هي $\\frac{4}{10}=0{,}4$ فقط.',
    right: '$2+\\frac{4}{10}=2{,}4$ .',
  },
  betweenIsExact: {
    wrong: 'علم يقع بين التدريجتين $2{,}3$ و $2{,}4$ فاصلته $2{,}3$ (أو $2{,}4$) لأنّها الأقرب.',
    why: 'نقرأ فاصلة مضبوطة فقط عند تدريجة؛ بين تدريجتين لا نعرف إلا حصرًا: $2{,}3<C<2{,}4$ .',
    right: '$2{,}3<C<2{,}4$ .',
  },
  firstMarkIsZero: {
    wrong: 'حين لا يظهر المبدأ، العلامة الأولى المرئية هي $0$ .',
    why: 'العدد المكتوب على التدريجة هو فاصلتها دائمًا: العلامة الأولى المرئية قد تكون $9$ ، والمبدأ $O(0)$ يقع قبلها خارج الصورة.',
    right: 'نقرأ الأعداد المكتوبة على التدريجات، ولا نبدأ العدّ من 0 .',
  },
};
