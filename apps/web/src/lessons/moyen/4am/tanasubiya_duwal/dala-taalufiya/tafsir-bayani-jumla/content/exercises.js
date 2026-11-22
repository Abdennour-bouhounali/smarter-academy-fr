/**
 * Les exercices de « أوظّف تعلّماتي » du درس 4. Le manuel fourni (pp. 77–79) n'a AUCUN exercice : ces quatre
 * exercices sont écrits par la plateforme (`addition('practice_generation')`) et le disent. Un exercice à
 * plusieurs parties est découpé en une entrée par partie (la première porte l'énoncé). Tous les distracteurs
 * sont faux (le calcul est écrit dans le commentaire de chaque ligne) ; une solution est une ثنائية tapée
 * (`pair`, évaluée comme le moteur de pratique : fractions, décimaux à virgule, chiffres arabes).
 * `mistake` (non affiché par TextbookExercise, qui montre `commonError` sous la question) garde l'erreur qui
 * DÉVOILERAIT la réponse avant le choix ; la carte des connaissances la cite.
 */
import { addition } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_tafsir-bayani-jumla_P1',
  P2: '4am_tafsir-bayani-jumla_P2',
  P3: '4am_tafsir-bayani-jumla_P3',
};

const S = (part) => ({ ...addition('practice_generation'), part });
const PAIR = (prompt, x, y, explain) => ({ interaction: 'pair', question: { prompt, expected: { x, y }, explain } });

/** Les figures des exercices (components/LinesFigure) : les droites de l'énoncé, sans le point cherché. */
export const FIGURES = {
  A: { win: { xMin: -1, xMax: 7, yMin: -3, yMax: 7 }, lines: [{ a: -1, b: 6, label: '(d₁)' }, { a: 1, b: -2, label: '(d₂)' }],
    caption: 'الشكل: المستقيمان اللذان يمثّلان معادلتي الجملة، في معلم وحدته مربّع واحد.' },
  B: { win: { xMin: -1, xMax: 5, yMin: -1, yMax: 5 }, lines: [{ a: 1, b: 1, label: '(d₁)' }, { a: -1, b: 4, label: '(d₂)' }],
    caption: 'الشكل: المستقيمان (d₁) و (d₂)، في معلم وحدته مربّع واحد.' },
};

export const EXERCISES = [
  // ── تمرين 1 — حل بياني ثم تحقّق : x + y = 6 et x − y = 2 → (4 ; 2)
  {
    id: 'ex-a-1', source: S('1'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'نعتبر الجملة $\\begin{cases} x + y = 6 \\\\ x - y = 2 \\end{cases}$ . 1) اكتب كل معادلة على الشكل $y = ax + b$ . 2) مثّل المستقيمين في معلم واحد واقرأ إحداثيتي نقطة تقاطعهما. 3) تحقّق بالحساب.',
    interaction: 'choice',
    question: {
      prompt: 'المعادلتان تُكتبان:',
      // x − y = 2 ⇒ y = x − 2 ; (B) signe de x oublié dans (1) ; (C) (2) mal transposée ; (D) les deux signes faux
      options: ['$y = -x + 6$ و $y = x - 2$', '$y = x + 6$ و $y = x - 2$', '$y = -x + 6$ و $y = -x + 2$', '$y = x - 6$ و $y = x + 2$'],
      correct: 0,
      cols: 1,
      explain: '$x + y = 6$ : ننقل $x$ مع تغيير إشارته، $y = -x + 6$ . و $x - y = 2$ تعطي $-y = -x + 2$ ، ثم نضرب في $-1$ : $y = x - 2$.',
    },
    method: 'ننقل حدّ $x$ إلى الطرف الثاني مع تغيير إشارته، ثم نقسم كل الحدود على معامل $y$ (هنا $1$ أو $-1$).',
    mistake: 'نسيان تغيير الإشارة عند نقل $x$ : كتابة $y = x + 6$ بدل $y = -x + 6$.',
  },
  {
    id: 'ex-a-2', source: S('2'), learningPointId: LP.P2, difficulty: 'facile',
    ...PAIR('اقرأ على الشكل إحداثيتي نقطة تقاطع المستقيمين: $(x ; y) =$', '4', '2',
      'المستقيمان يلتقيان في النقطة التي فاصلتها 4 وترتيبها 2: $(4 ; 2)$ — الفاصلة أولًا ثم الترتيب.'),
    mistake: 'قراءة الترتيب أولًا: كتابة $(2 ; 4)$ بدل $(4 ; 2)$.',
  },
  {
    id: 'ex-a-3', source: S('3'), learningPointId: LP.P2, difficulty: 'facile',
    interaction: 'choice',
    question: {
      prompt: 'التحقّق بالحساب:',
      // (2 ; 4) : 2 − 4 = −2 ≠ 2 ; une seule équation ne suffit pas
      options: ['$4 + 2 = 6$ و $4 - 2 = 2$ : الثنائية $(4 ; 2)$ حلّ الجملة', 'يكفي أن نتحقّق من $4 + 2 = 6$ : معادلة واحدة تكفي', 'الثنائية $(2 ; 4)$ حلّ أيضًا لأنّ $2 + 4 = 6$'],
      correct: 0,
      cols: 1,
      explain: 'نعوّض في المعادلتين معًا: $4 + 2 = 6$ و $4 - 2 = 2$. أمّا $(2 ; 4)$ فتعطي $2 - 4 = -2 \\neq 2$ : تقع على $(d_1)$ وحده.',
    },
  },
  // ── تمرين 2 — un croisement hors des nœuds : y = x + 1 et y = −x + 4 → (3/2 ; 5/2)
  {
    id: 'ex-b-1', source: S('1'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'نعتبر الجملة $\\begin{cases} y = x + 1 \\\\ y = -x + 4 \\end{cases}$ . الشكل يمثّل مستقيميها.',
    interaction: 'choice',
    question: {
      prompt: 'بقراءة الشكل، نقطة تقاطع المستقيمين:',
      // (1 ; 2) : −1 + 4 = 3 ≠ 2 ; (2 ; 3) : −2 + 4 = 2 ≠ 3
      options: ['فاصلتها بين 1 و 2 وترتيبها بين 2 و 3: لا نقرؤها بدقة', 'هي $(1 ; 2)$ بالضبط', 'هي $(2 ; 3)$ بالضبط'],
      correct: 0,
      cols: 1,
      explain: 'نقطة التقاطع ليست عقدة من الشبكة: القراءة تقريبية. و $(1 ; 2)$ على $(d_1)$ وحده ($-1 + 4 = 3 \\neq 2$)، و $(2 ; 3)$ كذلك ($-2 + 4 = 2 \\neq 3$).',
    },
    mistake: 'اعتبار أقرب عقدة من الشبكة حلًّا مضبوطًا: $(1 ; 2)$ لا تحقّق المعادلة الثانية.',
  },
  {
    id: 'ex-b-2', source: S('2'), learningPointId: LP.P2, difficulty: 'moyen',
    ...PAIR('بالحساب ($x + 1 = -x + 4$)، الحل المضبوط للجملة: $(x ; y) =$', '3/2', '5/2',
      '$x + 1 = -x + 4$ تعطي $2x = 3$ ، أي $x = \\dfrac{3}{2}$ ، ثم $y = \\dfrac{3}{2} + 1 = \\dfrac{5}{2}$ : الحل $(1{,}5 ; 2{,}5)$ ، وهذا ما قرأناه تقريبًا على الشكل.'),
  },
  // ── تمرين 3 — le nombre de solutions sans dessiner (P3)
  {
    id: 'ex-c', source: S('1'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'دون رسم المستقيمين، عيّن عدد حلول كل جملة.',
    interaction: 'batch',
    question: {
      rows: [
        // y = 2x + 1 et y = 2x − 3 : même a, b différents → parallèles
        { id: 'c1', label: '$\\begin{cases} y = 2x + 1 \\\\ y = 2x - 3 \\end{cases}$', options: ['حلّ وحيد', 'لا حلّ', 'عدد لا نهائي من الحلول'], correct: 1, correction: 'معامل التوجيه نفسه $2$ وترتيبان مختلفان عند المبدأ: المستقيمان متوازيان، فلا حلّ.' },
        // x + 2y = 4 ⇔ y = −x/2 + 2 ; 3x + 6y = 12 ⇔ y = −x/2 + 2 → confondues
        { id: 'c2', label: '$\\begin{cases} x + 2y = 4 \\\\ 3x + 6y = 12 \\end{cases}$', options: ['حلّ وحيد', 'لا حلّ', 'عدد لا نهائي من الحلول'], correct: 2, correction: 'المعادلتان تُكتبان $y = -\\dfrac{1}{2}x + 2$ : المستقيمان منطبقان، فللجملة عدد لا نهائي من الحلول.' },
        // 3 ≠ −1 → sécantes
        { id: 'c3', label: '$\\begin{cases} y = 3x - 1 \\\\ y = -x + 3 \\end{cases}$', options: ['حلّ وحيد', 'لا حلّ', 'عدد لا نهائي من الحلول'], correct: 0, correction: 'معاملا التوجيه $3$ و $-1$ مختلفان: المستقيمان متقاطعان، فللجملة حلّ وحيد.' },
        // 2x − y = 3 ⇔ y = 2x − 3 ; −4x + 2y = 1 ⇔ y = 2x + 1/2 → parallèles
        { id: 'c4', label: '$\\begin{cases} 2x - y = 3 \\\\ -4x + 2y = 1 \\end{cases}$', options: ['حلّ وحيد', 'لا حلّ', 'عدد لا نهائي من الحلول'], correct: 1, correction: 'المعادلتان تُكتبان $y = 2x - 3$ و $y = 2x + \\dfrac{1}{2}$ : معامل التوجيه نفسه وترتيبان مختلفان، فلا حلّ.' },
      ],
    },
    method: 'نكتب كل معادلة على الشكل $y = ax + b$ ، ثم نقارن معاملي التوجيه، وعند تساويهما نقارن الترتيبين عند المبدأ.',
    commonError: 'الخلط بين المتوازيين والمنطبقين: مستقيمان لهما معامل التوجيه نفسه ليسا منطبقين إلا إذا تساوى ترتيباهما عند المبدأ.',
  },
  // ── تمرين 4 — transfert : deux applis de taxi, y = 50x + 100 et y = 40x + 150 → (5 ; 350)
  {
    id: 'ex-d-1', source: S('1'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'تطبيقان لسيارات الأجرة في مدينتك، يلتزم سائقوهما بالأمانة في احتساب الرحلة: التطبيق A يأخذ 100DA عند الانطلاق ثم 50DA لكل كيلومتر، والتطبيق B يأخذ 150DA عند الانطلاق ثم 40DA لكل كيلومتر. نسمّي $x$ عدد الكيلومترات و $y$ ثمن الرحلة (DA).',
    interaction: 'choice',
    question: {
      prompt: 'الجملة التي تترجم الثمنين:',
      // (B) les deux nombres de chaque tarif échangés ; (C) les deux prix de départ échangés
      options: ['$\\begin{cases} y = 50x + 100 \\\\ y = 40x + 150 \\end{cases}$', '$\\begin{cases} y = 100x + 50 \\\\ y = 150x + 40 \\end{cases}$', '$\\begin{cases} y = 50x + 150 \\\\ y = 40x + 100 \\end{cases}$'],
      correct: 0,
      cols: 1,
      explain: 'لكل تطبيق: الثمن = ثمن الكيلومتر × عدد الكيلومترات + ثمن الانطلاق، أي $y = 50x + 100$ للتطبيق A و $y = 40x + 150$ للتطبيق B.',
    },
  },
  {
    id: 'ex-d-2', source: S('2'), learningPointId: LP.P2, difficulty: 'difficile',
    ...PAIR('نقطة تقاطع المستقيمين اللذين يمثّلان الجملة: $(x ; y) =$', '5', '350',
      '$50x + 100 = 40x + 150$ تعطي $10x = 50$ ، أي $x = 5$ ، ثم $y = 50 \\times 5 + 100 = 350$ : $(5 ; 350)$.'),
  },
  {
    id: 'ex-d-3', source: S('3'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: 'نفسّر هذه النقطة في الوضعية:',
      // (B) coordonnées inversées ; (C) faux : pour 10 km, A = 600 DA et B = 550 DA
      options: ['لرحلة من 5 كيلومترات يدفع الزبون الثمن نفسه، 350DA، في التطبيقين', 'لرحلة من 350 كيلومترا يدفع الزبون 5DA في التطبيقين', 'التطبيق A أرخص مهما كانت المسافة'],
      correct: 0,
      cols: 1,
      explain: 'الفاصلة عدد الكيلومترات والترتيب الثمن: 5 كيلومترات بـ 350DA في التطبيقين. و A ليس أرخص دائمًا: لـ 10 كيلومترات $50 \\times 10 + 100 = 600$ و $40 \\times 10 + 150 = 550$.',
    },
  },
];

/** Les entrées d'un exercice (« a », « b », « c », « d »). */
export const partsOf = (key) => EXERCISES.filter((ex) => ex.id === `ex-${key}` || ex.id.startsWith(`ex-${key}-`));
export const EX = Object.fromEntries(EXERCISES.map((ex) => [ex.id, ex]));
