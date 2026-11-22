/**
 * Le contenu du درس « تبسيط عبارة جبرية وحذف الأقواس » (3AM, unité 4) — données pures. Le manuel
 * (docs/sources/3am/unit4/extraction.json) est la RÉFÉRENCE des الكفاءات : tout est réécrit par la plateforme (autres mots, autres
 * nombres, autres contextes — guide §4ter-bis) ; chaque bloc cite l'élément dont il est tiré (`src`) pour la traçabilité de `check:textbook`.
 * Les tâches du labo (`LAB`) sont celles des préréglages de `manipulations/levels.js › like-terms` (module 1) et de
 * `logic/likeTerms.js › BRACKET_TASKS` (module 3, monde `brackets`).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Les réglages des labos : mêmes valeurs que `levels.js` (module 1) et `BRACKET_TASKS` (module 3). */
export const LAB = {
  collect: {
    beginner: [{ id: 'collect-1', answer: '7x+4' }, { id: 'collect-2', answer: '3x+2' }],
    advanced: [{ id: 'collect-3', answer: '2x^2+4x-2' }, { id: 'collect-4', answer: '-3x+4' }],
  },
  brackets: [
    { id: 'plus', written: '7+(2x-3)', opened: '7+2x-3', answer: '2x+4' },
    { id: 'minus', written: '9-(4x-5)', opened: '9-4x+5', answer: '-4x+14' },
    { id: 'both', written: '3x+(x-2)-(5-2x)', opened: '3x+x-2-5+2x', answer: '6x-7' },
  ],
};

/** Les connaissances (معارف) — les mots de la plateforme. */
export const KNOWLEDGE = {
  like: {
    source: src('know-1', 58, 'معارف', 1),
    text: 'حدّان متشابهان إذا كان لهما الجزء الحرفي نفسه: $3x$ و $-5x$ متشابهان، والعددان $7$ و $-2$ متشابهان، أمّا $4x^2$ و $4x$ فليسا متشابهين.',
  },
  merge: {
    source: src('know-1', 58, 'معارف', 1),
    text: 'لتبسيط مجموع نجمع الحدود المتشابهة: نجمع معاملاتها ونُبقي الجزء الحرفي، $3x+5x=(3+5)x=8x$. وحدّان متشابهان معاملاهما متعاكسان يتلاشيان: $6x-6x=0$.',
  },
  noMix: {
    source: addition('knowledge_formalization'),
    text: 'لا نجمع حدّين غير متشابهين، فالمجموعان يختلفان: عند $x=3$ قيمة $4x^2+4x$ تساوي 48، وقيمة $8x^2$ تساوي 72، وقيمة $8x$ تساوي 24.',
  },
  valueKept: {
    source: addition('knowledge_formalization'),
    text: 'التبسيط يغيّر الكتابة ولا يغيّر القيمة: لعبارة وصورتها المبسّطة القيمة نفسها مهما كانت قيمة $x$.',
  },
  sumOrProduct: {
    source: src('self-1', 65, 'أؤكّد تعلّماتي', 1),
    text: 'العبارة مجموع إذا كانت آخر عملية فيها جمعًا أو طرحًا، مثل $6-3x+x^2$. وهي جداء إذا كانت آخر عملية فيها ضربًا، مثل $(2x+5)(x+1)$ أو $3x(2x-5)$.',
  },
  product: {
    source: src('know-1', 58, 'معارف', 1),
    text: 'لتبسيط جداء حدود نضرب الأعداد معًا والحروف معًا: $3x\\times5x=3\\times5\\times x\\times x=15x^2$.',
  },
  plus: {
    source: src('know-2', 58, 'معارف', 2),
    text: 'قوسان مسبوقان بالإشارة $+$ وغير متبوعين بـ $\\times$ أو $\\div$ نحذفهما ونُبقي إشارة كل حدّ كما هي: $7+(2x-3)=7+2x-3$.',
  },
  minus: {
    source: src('know-2', 58, 'معارف', 2),
    text: 'قوسان مسبوقان بالإشارة $-$ نحذفهما ونغيّر إشارة كل حدّ كان بينهما: $9-(4x-5)=9-4x+5$.',
  },
  history: {
    source: src('opener', 54, 'استعمال الرموز والعبارات الحرفية عند العرب'),
    text: 'كتب علماء الرياضيات العرب العبارات بالرموز منذ قرون: فقد استعمل القلصادي (القرن الخامس عشر) رموزًا للعدد وللمجهول ولمربّعه ولمكعّبه، وبها صارت العبارة الحرفية لغة يفهمها الجميع.',
  },
};

/** طريقة — حذف الأقواس وتبسيط عبارة حرفية : مثال محلول سطرًا سطرًا (MethodSteps). */
export const METHOD_BRACKETS = {
  source: src('method-1', 59, 'طرائق', 1),
  title: 'أحذف الأقواس وأبسّط عبارة حرفية',
  exercise: 'بسّط العبارة $A=4x^2-5+(7x-2x^2)-(3-4x)$.',
  solution: [
    '1. نحذف الأقواس: المسبوقان بـ $+$ دون تغيير، والمسبوقان بـ $-$ بتغيير إشارة كل حدّ: $A=4x^2-5+7x-2x^2-3+4x$.',
    '2. نجمع الحدود المتشابهة معًا: $A=4x^2-2x^2+7x+4x-5-3$.',
    '3. نجمع المعاملات: $A=(4-2)x^2+(7+4)x-8$.',
    '4. نكتب العبارة المبسّطة: $A=2x^2+11x-8$.',
    '5. نتحقّق عند $x=2$: العبارة الأصلية تساوي $16-5+6-(-5)=22$ والمبسّطة $8+22-8=22$.',
  ],
  rule: 'نحذف الأقواس بقاعدتها، ثم نجمع الحدود المتشابهة، ثم نكتب العبارة بأقل ما يمكن من الحدود.',
};

/** « أستعدّ » — six affirmations : la distributivité (1–2, `tawzi-darb-jam-tarh`), le calcul rationnel (3–4, `amaliyat-natiqa`), la lettre (5–6). */
export const PREP_ITEMS = [
  { skill: 'tawzi', text: '$7\\times(10+8)=7\\times10+7\\times8$.', answer: true, why: 'الضرب يتوزّع على الجمع: $7\\times18=126$ و $70+56=126$.', source: addition('prerequisite_diagnostic') },
  { skill: 'tawzi', text: '$2\\times(5+3)=2\\times5+3$.', answer: false, why: '$2\\times8=16$ أمّا $2\\times5+3=13$: العدد 2 يضرب الحدّين معًا.', source: addition('prerequisite_diagnostic') },
  { skill: 'natiqa', text: '$(-3)\\times(-5)=15$.', answer: true, why: 'جداء عددين سالبين موجب.', source: addition('prerequisite_diagnostic') },
  { skill: 'natiqa', text: '$-3-(-5)=-8$.', answer: false, why: 'طرح عدد سالب جمع لمعاكسه: $-3+5=2$.', source: addition('prerequisite_diagnostic') },
  { skill: 'harf', text: '$x+x+x+x+x=x^5$.', answer: false, why: 'خمس مرّات $x$ مجموعة: $5x$ ، أمّا $x^5$ فجداء خمسة عوامل.', source: src('prep', 55, 'أستعدّ', 5) },
  { skill: 'harf', text: '$5x\\times2x=10x^2$.', answer: true, why: '$5\\times2=10$ و $x\\times x=x^2$.', source: src('prep', 55, 'أستعدّ', 8) },
];

/** Les erreurs courantes, mot pour mot (knowledgeGraph.js les cite). */
export const GUIDE = {
  merge: {
    wrong: '$4x^2+4x=8x^2$ لأنّ في الحدّين المعامل 4 والحرف نفسه.',
    why: 'الحدّان غير متشابهين: $x^2$ و $x$ شكلان مختلفان. عند $x=3$ قيمة $4x^2+4x$ تساوي 48 أمّا $8x^2$ فتساوي 72.',
    right: '$4x^2+4x$ تبقى كما هي، ولا نجمع إلا الحدود المتشابهة.',
  },
  firstSign: {
    wrong: '$9-(4x-5)=9-4x-5$ : غيّرنا إشارة الحدّ الأول وحده.',
    why: 'إشارة $-$ قبل القوسين تعمل في كل حدّ بينهما. عند $x=3$ قيمة $9-(4x-5)$ تساوي 2 أمّا $9-4x-5$ فتساوي $-8$.',
    right: '$9-(4x-5)=9-4x+5$ : تتغيّر إشارة كل حدّ.',
  },
};
