/**
 * Les exercices de la leçon 4 « ترييض مشكلة » — RÉÉCRITS par la plateforme (rollout 2026-11-11, unité 4 ; conseil du 2026-11-11, verdict X1 / X2) : mêmes idées,
 * mêmes `id`, mêmes `learningPointId` (la preuve par كفاءة reste valide), mais contextes, mots et NOMBRES de la plateforme — plus aucun énoncé du manuel.
 * `source` garde l'élément du manuel avec `part: 'بأعداد المنصّة'` (le professeur voit que le texte est réécrit).
 *
 * Un exercice de ترييض se fait en ÉTAPES (choisir le modèle, résoudre, vérifier) : il est posé en lignes (`batch`), une décision par ligne, chaque
 * distracteur étant un modèle FAUX qui vient d'une erreur réelle — l'inconnue ajoutée une seule fois pour plusieurs personnes, une parenthèse oubliée,
 * une solution qui ne convient pas à la situation. Toutes les réponses sont recalculées dans content/mission.test.js. L'exercice 12 est STATIQUE (deux
 * frères, des âges d'aujourd'hui) : il ne répète pas la méthode « بعد x سنة » de la مسألة.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_tarrid-mushkila_P1',
  P2: '4am_tarrid-mushkila_P2',
};

const OWN = 'بأعداد المنصّة';
const E = (n, page, section, part) => ({ ...src(`ex-${n}`, page, section, n), part: part ? `${OWN} · ${part}` : OWN });

/** Module 2 — la métrajiha du hexagone et du carré : 6x ≥ 4(x + 5) ⇔ 2x ≥ 20 ⇔ x ≥ 10 (60 = 60 à 10). */
export const EXERCISES_1 = [
  {
    id: 'now-49-2', source: { ...src('now-49-2', 49, 'دوري الآن', 2), part: OWN }, learningPointId: LP.P1, difficulty: 'moyen',
    statement: '1) حل المتراجحة $6x \\geq 4x + 20$ . 2) ما هو أقصر ضلع للمسدّس بحيث يكون محيطه أكبر من أو يساوي محيط المربع؟',
    interaction: 'batch',
    question: {
      prompt: 'مسدّس منتظم ضلعه $x$ ومربّع ضلعه $x + 5$ (بالسنتيمتر، الشكل).',
      rows: [
        { label: '1) $6x \\geq 4x + 20$ تعني', options: ['$x \\leq 10$', '$x \\geq 10$', '$x \\geq 20$'], correct: 1, correction: '$6x - 4x \\geq 20$ أي $2x \\geq 20$ ، ونقسم على 2 (موجب): $x \\geq 10$ .' },
        { label: '2) المتراجحة التي تترجم المشكلة', options: ['$6x \\geq 4x + 5$', '$6x \\geq 4 \\times 5$', '$6x \\geq 4(x + 5)$'], correct: 2, correction: 'ضلع المربع هو $x + 5$ ، فمحيطه $4(x + 5) = 4x + 20$ : هي متراجحة السؤال 1.' },
        { label: 'أقصر ضلع للمسدّس', options: ['10cm', '5cm', '20cm'], correct: 0, correction: 'الحلول $x \\geq 10$ ، وأصغرها 10: المسدّس ضلعه 10cm ومحيطه 60cm ، والمربع ضلعه 15cm ومحيطه 60cm .' },
      ],
      explain: 'نسمّي $x$ ضلع المسدّس، نعبّر بمتراجحة، نحلّها، ثم نختار من الحلول ما يجيب عن السؤال: «أقصر» ضلع هو أصغر حلّ.',
    },
    method: 'نسمّي $x$ ضلع المسدّس؛ ضلع المربع $x + 5$ ؛ «أكبر من أو يساوي» تعطي متراجحة.',
    commonError: 'نسيان أن الأربعة تضرب $x + 5$ كله (المتراجحة $6x \\geq 4x + 5$).',
  },
];

/* ── Module 3 — أوظّف تعلّماتي ─────────────────────────────────────────────────── */
export const EXERCISES = [
  {
    // 4x + 11 = 35 ⇔ x = 6 ; 4(x + 11) = 35 ⇔ x = −9/4 ; 11x + 4 = 35 ⇔ x = 31/11
    id: 'ex-10', source: E(10, 50, 'أوظّف تعلّماتي'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'ما هو العدد الذي إذا ضربته في 4 وأضفت إلى الناتج 11، تحصل على 35؟',
    interaction: 'batch',
    question: {
      prompt: 'نسمّي $x$ العدد المطلوب.',
      rows: [
        { label: 'المعادلة', options: ['$4(x + 11) = 35$', '$4x + 11 = 35$', '$11x + 4 = 35$'], correct: 1, correction: 'نضرب أولًا في 4 ثم نضيف 11 إلى الناتج: $4x + 11 = 35$ .' },
        { label: 'العدد', options: ['$6$', '$-\\dfrac{9}{4}$', '$\\dfrac{31}{11}$'], correct: 0, correction: '$4x = 24$ أي $x = 6$ . تحقّق: $4 \\times 6 + 11 = 35$ .' },
      ],
    },
    method: 'نسمّي $x$ العدد، ونترجم «ضربته في 4 وأضفت 11» بالترتيب نفسه.',
    commonError: 'كتابة $4(x + 11)$ : إضافة 11 قبل الضرب.',
  },
  {
    // 5x − 36 = 2x ⇔ x = 12 ; 5(x − 36) = 2x ⇔ x = 60 ; 5x − 36 = x + 2 ⇔ x = 19/2
    id: 'ex-11', source: E(11, 50, 'أوظّف تعلّماتي'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'ما هو العدد الذي إذا ضربته في 5 وطرحت منه 36، تحصل على ضعف العدد الذي اخترته في البداية؟',
    interaction: 'batch',
    question: {
      prompt: 'نسمّي $x$ العدد الذي اخترته في البداية.',
      rows: [
        { label: 'المعادلة', options: ['$5x - 36 = 2x$', '$5(x - 36) = 2x$', '$5x - 36 = x + 2$'], correct: 0, correction: '«ضعف العدد» هو $2x$ ، و«ضربته في 5 وطرحت 36» هو $5x - 36$ .' },
        { label: 'العدد', options: ['$60$', '$\\dfrac{19}{2}$', '$12$'], correct: 2, correction: '$5x - 2x = 36$ أي $x = 12$ . تحقّق: $5 \\times 12 - 36 = 24 = 2 \\times 12$ .' },
      ],
    },
    commonError: 'ترجمة «ضعف العدد» بـ $x + 2$ بدل $2x$ .',
  },
  {
    // x + (x + 3) = 27 ⇔ x = 12 (et 15) ; x + 3 = 27 ⇔ x = 24 ; 2x = 27 + 3 ⇔ x = 15
    id: 'ex-12', source: E(12, 50, 'أوظّف تعلّماتي'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'مجموع عمري أخوين 27 سنة، والأكبر أكبر من الأصغر بـ 3 سنوات. ما عمر كل منهما؟',
    interaction: 'batch',
    question: {
      prompt: 'نسمّي $x$ عمر الأصغر بالسنوات.',
      rows: [
        { label: 'المعادلة', options: ['$x + 3 = 27$', '$x + (x + 3) = 27$', '$2x = 27 + 3$'], correct: 1, correction: 'عمر الأكبر $x + 3$ ، ومجموع العمرين $27$ : $x + (x + 3) = 27$ .' },
        { label: 'عمر الأصغر', options: ['$24$', '$15$', '$12$'], correct: 2, correction: '$2x + 3 = 27$ أي $2x = 24$ ومنه $x = 12$ .' },
        { label: 'التحقق', options: ['$12 + 15 = 27$', '$12 + 3 = 27$', '$15 + 15 = 27$'], correct: 0, correction: 'عمر الأكبر $12 + 3 = 15$ ، و $12 + 15 = 27$ .' },
      ],
    },
    method: 'عمر الأكبر يُكتب بدلالة عمر الأصغر، ثم نجمع العمرين.',
    commonError: 'كتابة $x + 3 = 27$ : عمر الأكبر وحده يساوي المجموع.',
  },
  {
    // 0,4N + 30 + 60 = N ⇔ 0,6N = 90 ⇔ N = 150 ; 0,4N + 30 = 60 ⇔ N = 75
    id: 'ex-13', source: E(13, 50, 'أوظّف تعلّماتي'), learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'قرأت فتاة 40% من صفحات رواية، ثم قرأت 30 صفحة أخرى، فبقي لها 60 صفحة. كم صفحة في الرواية؟',
    interaction: 'batch',
    question: {
      prompt: 'نسمّي $N$ عدد صفحات الرواية.',
      rows: [
        { label: 'المعادلة', options: ['$0{,}4N + 30 = 60$', '$0{,}4N + 30 + 60 = N$', '$40N + 90 = N$'], correct: 1, correction: 'الصفحات كلها = ما قرأته ($0{,}4N$) + 30 صفحة + ما بقي (60 صفحة).' },
        { label: 'عدد الصفحات', options: ['150 صفحة', '75 صفحة', '225 صفحة'], correct: 0, correction: '$N - 0{,}4N = 90$ أي $0{,}6N = 90$ ومنه $N = 150$ . تحقّق: $60 + 30 + 60 = 150$ .' },
      ],
    },
    commonError: 'نسيان أن عدد الصفحات الكلي $N$ هو المجهول في الطرفين.',
  },
  {
    // 2x + 20 > 4x ⇔ x < 10 ; x est une longueur : 0 < x < 10
    id: 'ex-30', source: E(30, 51, 'أوظّف تعلّماتي'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'لاحظ الشكل: ما هي قيم $x$ التي من أجلها يكون محيط المستطيل أكبر من محيط المربع؟',
    interaction: 'batch',
    question: {
      prompt: 'مستطيل بعداه $x$ و 10cm ، ومربع ضلعه $x$ (الشكل).',
      rows: [
        { label: 'المتراجحة', options: ['$2x + 20 > 4x$', '$2x + 20 < 4x$', '$x + 10 > 4x$'], correct: 0, correction: 'محيط المستطيل $2(x + 10) = 2x + 20$ ، ومحيط المربع $4x$ .' },
        { label: 'قيم $x$', options: ['$x > 10$', '$0 < x < 10$', '$x = 10$'], correct: 1, correction: '$20 > 2x$ أي $x < 10$ ، و $x$ طول فهو موجب: $0 < x < 10$ .' },
      ],
    },
    method: 'نكتب المحيطين بدلالة $x$ ، ثم نتذكّر أنّ $x$ طول موجب.',
    commonError: 'نسيان شرط الواقع: $x$ طول، فلا يكون سالبًا ولا معدومًا.',
  },
  {
    // P = 2x + 8 ; 2x + 8 ≥ 30 ⇔ x ≥ 11
    id: 'ex-33', source: E(33, 51, 'أوظّف تعلّماتي'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'ABCD مستطيل عرضه 4cm . 1) عبّر عن محيطه P بدلالة طوله $x$ . 2) ما القيم التي يمكن أن يأخذها $x$ حتى يكون محيطه أكبر من أو يساوي 30cm ؟',
    interaction: 'batch',
    question: {
      prompt: 'المستطيل ABCD عرضه $BC = 4cm$ وطوله $DC = x$ (الشكل).',
      rows: [
        { label: '1) $P = $', options: ['$x + 4$', '$2x + 4$', '$2x + 8$'], correct: 2, correction: '$P = 2(x + 4) = 2x + 8$' },
        { label: '2) قيم $x$', options: ['$x \\geq 11$', '$x \\geq 15$', '$x \\leq 11$'], correct: 0, correction: '$2x + 8 \\geq 30$ أي $2x \\geq 22$ ومنه $x \\geq 11$ .' },
      ],
    },
    commonError: 'كتابة المحيط $x + 4$ (نصف المحيط فقط).',
  },
  {
    // 4x − 6 = 34 ⇔ x = 10
    id: 'ex-37-1', source: E(37, 53, 'أتعمّق', '1)'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'إليك برنامج حساب: اختر عددًا، اضربه في 4، ثم اطرح 6. 1) ما العدد الذي ينبغي اختياره للحصول على 34؟ 2) ما العدد الذي ينبغي اختياره للحصول في النتيجة على 6 أمثال العدد المختار؟',
    interaction: 'numeric',
    question: {
      prompt: '1) العدد الذي يعطي 34 هو:',
      expected: 10,
      explain: 'نسمّي $x$ العدد المختار: $4x - 6 = 34$ أي $4x = 40$ ومنه $x = 10$ .',
    },
    method: 'نسمّي $x$ العدد المختار ونكتب نتيجة البرنامج $4x - 6$ .',
  },
  {
    // 4x − 6 = 6x ⇔ x = −3 (−18 = 6 × (−3))
    id: 'ex-37-2', source: E(37, 53, 'أتعمّق', '2)'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'batch',
    question: {
      prompt: '2) برنامج الحساب: اختر عددًا، اضربه في 4، ثم اطرح 6. نريد أن تكون النتيجة 6 أمثال العدد المختار.',
      rows: [
        { label: 'المعادلة', options: ['$4x - 6 = 6 \\times 34$', '$4x - 6 = 6x$', '$6(4x - 6) = x$'], correct: 1, correction: 'النتيجة $4x - 6$ ، و6 أمثال العدد المختار $6x$ .' },
        { label: 'العدد', options: ['$3$', '$-3$', '$-1$'], correct: 1, correction: '$4x - 6x = 6$ أي $-2x = 6$ ومنه $x = -3$ . تحقّق: $4 \\times (-3) - 6 = -18 = 6 \\times (-3)$ — عدد سالب، وهو مقبول هنا لأن «عددًا» لم يُشترط موجبًا.' },
      ],
    },
    commonError: 'رفض $-3$ دون سبب: في برنامج حساب يمكن اختيار عدد سالب.',
  },
  {
    // 6 < x, x < 14 : 4 < x + 10 toujours vraie
    id: 'ex-38', source: E(38, 53, 'أتعمّق'), learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'ما هي قيم $x$ التي من أجلها يُمكن إنشاء مثلث أطوال أضلاعه بالسنتيمتر: 4 ، $x$ و 10 ؟',
    interaction: 'choice',
    question: {
      prompt: 'في مثلث، طول كل ضلع أصغر من مجموع طولي الضلعين الآخرين. قيم $x$ هي:',
      options: ['$x < 14$', '$6 < x < 14$', '$6 \\leq x \\leq 14$', '$x > 6$'],
      correct: 1, cols: 2,
      explain: '$x < 4 + 10$ أي $x < 14$ ، و $10 < 4 + x$ أي $x > 6$ (و $4 < x + 10$ صحيحة دائمًا لأن $x$ موجب): $6 < x < 14$ . من أجل $x = 6$ أو $x = 14$ تكون النقاط الثلاث على استقامة واحدة.',
    },
    method: 'نكتب ثلاث متراجحات (متباينة المثلث) ونحتفظ بالقيم التي تحقّقها كلها.',
    commonError: 'الاكتفاء بالمتراجحة $x < 4 + 10$ ونسيان أن $x$ يجب أن يكون أكبر من $10 - 4$ .',
  },
  {
    // aire(EFGH) = 100 − 4 × x(10 − x)/2 = 2x² − 20x + 100 ; = 52 ⇔ 2x² − 20x + 48 = 0 ⇔ (2x − 8)(x − 6) = 0 ⇔ x ∈ {4 ; 6}
    id: 'ex-39', source: E(39, 53, 'أتعمّق'), learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'في الشكل، كل من الرباعيين ABCD و EFGH مربع. 1) عبّر عن مساحة المربع EFGH بدلالة $x$ . 2) تحقّق أنّ $2x^2 - 20x + 48 = (2x - 8)(x - 6)$ . 3) عيّن قيم $x$ التي من أجلها تكون مساحة EFGH تساوي $52cm^2$ .',
    interaction: 'batch',
    question: {
      prompt: 'المربع ABCD ضلعه 10cm ، و $AH = BE = CF = DG = x$ (الشكل).',
      rows: [
        { label: '1) مساحة EFGH', options: ['$2x^2 - 20x + 100$', '$4x^2 - 40x + 100$', '$100 - x^2$'], correct: 0, correction: 'مساحة ABCD ناقص أربعة مثلثات قائمة ضلعا كل منها $x$ و $10 - x$ : $100 - 4 \\times \\dfrac{x(10 - x)}{2} = 2x^2 - 20x + 100$ .' },
        { label: '2) $(2x - 8)(x - 6) = $', options: ['$2x^2 - 20x - 48$', '$2x^2 - 20x + 48$', '$2x^2 + 48$'], correct: 1, correction: '$2x^2 - 12x - 8x + 48 = 2x^2 - 20x + 48$' },
        { label: '3) قيم $x$', options: ['$x = 4$ فقط', '$x = 6$ أو $x = -4$', '$x = 4$ أو $x = 6$'], correct: 2, correction: '$2x^2 - 20x + 100 = 52$ أي $2x^2 - 20x + 48 = 0$ أي $(2x - 8)(x - 6) = 0$ : $x = 4$ أو $x = 6$ ، وكلاهما بين 0 و 10 فهما مقبولان.' },
      ],
    },
    method: 'نعبّر عن المساحة بدلالة $x$ ، ثم نكتب المعادلة على شكل جداء معدوم.',
    commonError: 'نسيان القسمة على 2 في مساحة المثلث القائم.',
  },
  {
    // (x + 6)(x − 2) = x² + 4x − 12 ; = 20 ⇔ x² + 4x − 32 = 0 ⇔ (x − 4)(x + 8) = 0 ; x = 4 (−8 refusé : longueur)
    id: 'ex-40', source: E(40, 53, 'أتعمّق'), learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'في الشكل ABCD مربع (الوحدة 1cm). 1) عبّر عن مساحة المستطيل الملوّن بدلالة $x$ . 2) تحقّق أنّ $(x - 4)(x + 8) = x^2 + 4x - 32$ . 3) عيّن قيمة $x$ التي من أجلها تكون مساحة المستطيل الملوّن $20cm^2$ .',
    interaction: 'batch',
    question: {
      prompt: 'المربع ABCD ضلعه $x$ ؛ $BE = 6cm$ و $GD = 2cm$ (الشكل).',
      rows: [
        { label: '1) مساحة المستطيل الملوّن', options: ['$(x + 6)(x + 2)$', '$(x + 6)(x - 2)$', '$x(x - 2) + 6$'], correct: 1, correction: 'بعداه $AE = x + 6$ و $AG = x - 2$ ، ومساحته $(x + 6)(x - 2) = x^2 + 4x - 12$ .' },
        { label: '2) $(x - 4)(x + 8) = $', options: ['$x^2 + 4x - 32$', '$x^2 - 4x - 32$', '$x^2 + 4x + 32$'], correct: 0, correction: '$x^2 + 8x - 4x - 32 = x^2 + 4x - 32$' },
        { label: '3) قيمة $x$', options: ['$x = 4$ أو $x = -8$', '$x = -4$ أو $x = 8$', '$x = 4$ ($-8$ مرفوض)'], correct: 2, correction: '$x^2 + 4x - 12 = 20$ أي $(x - 4)(x + 8) = 0$ : $x = 4$ أو $x = -8$ ، لكن $x$ طول فهو موجب: $x = 4$ . تحقّق: $10 \\times 2 = 20$ .' },
      ],
    },
    method: 'نحلّ بالجداء المعدوم، ثم نتأكّد أنّ كل حل يلائم الواقع (طول موجب، و $x - 2 > 0$).',
    commonError: 'الإبقاء على $x = -8$ : طول ضلع لا يكون سالبًا.',
  },
];

/** Les entrées d'un exercice (module 3), par numéro : « 10 », « 37 »… */
export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));

/** Accès par id. */
export const EX = Object.fromEntries([...EXERCISES_1, ...EXERCISES].map((ex) => [ex.id, ex]));
