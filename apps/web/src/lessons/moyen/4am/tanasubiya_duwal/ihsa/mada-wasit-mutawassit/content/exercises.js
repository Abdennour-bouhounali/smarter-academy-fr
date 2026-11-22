/**
 * Les exercices du MANUEL rattachés au درس « مدى ووسيط ومتوسط سلسلة إحصائية » (extraction.json → destinations :
 * ex-8 → ex-13 (أوظّف تعلّماتي, p. 99), ex-17, ex-18 (أتعمّق, p. 101)). Énoncés au mot près ; une entrée par partie.
 *
 * « اقترح سلسلة … » (ex-8 → ex-12) devient VÉRIFIABLE : choisir LA série qui vérifie les conditions parmi trois
 * (une seule convient, les autres sont fausses — calcul en commentaire) ; ex-13 (unique) se saisit comme
 * ensemble ; ex-17 (« خمس سلاسل ») devient un tri de séries.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_mada-wasit-mutawassit_P1',
  P2: '4am_mada-wasit-mutawassit_P2',
  P3: '4am_mada-wasit-mutawassit_P3',
};

const E = (n, page, section, part) => ({ ...src(`ex-${n}`, page, section, n), ...(part ? { part } : {}) });
const AW = 'أوظّف تعلّماتي';
const AT = 'أتعمّق';
const YN = ['نعم', 'لا'];

export const EXERCISES = [
  // تمرين 8 — 7 valeurs de somme 49
  {
    id: 'ex-8', source: E(8, 99, AW), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'اقترح سلسلة تكرارها الكلّي 7 و متوسطها 7.',
    interaction: 'choice',
    question: {
      prompt: 'أيّ هذه السلاسل تحقّق الشرطين؟',
      // A : 49/7 = 7 ✓ ; B : 6 valeurs (N = 6) ✗ ; C : 50/7 ≠ 7 ✗
      options: ['$4$ ، $5$ ، $6$ ، $7$ ، $8$ ، $9$ ، $10$', '$7$ ، $7$ ، $7$ ، $7$ ، $7$ ، $7$', '$1$ ، $3$ ، $5$ ، $7$ ، $9$ ، $11$ ، $14$'],
      correct: 0, cols: 1,
      explain: 'سبع قيم متوسطها 7 مجموعها $7 \\times 7 = 49$ : $4 + 5 + 6 + 7 + 8 + 9 + 10 = 49$. السلسلة الثانية فيها ست قيم فقط، ومجموع الثالثة $50$ فمتوسطها $\\dfrac{50}{7} \\neq 7$.',
    },
    method: 'متوسط 7 لسبع قيم يعني أنّ مجموعها $7 \\times 7 = 49$ : نختار سبع قيم مجموعها 49.',
  },
  // تمرين 9 — la 4e valeur rangée vaut 7
  {
    id: 'ex-9', source: E(9, 99, AW), learningPointId: LP.P3, difficulty: 'facile',
    statement: 'اقترح سلسلة تكرارها الكلّي 7 و وسيطها 7.',
    interaction: 'choice',
    question: {
      prompt: 'أيّ هذه السلاسل تحقّق الشرطين؟',
      // A : rangée, 4e = 7 ✓ ; B : rangée 1 2 3 4 7 8 9 → Med 4 ✗ (7 au milieu de l'écriture NON rangée) ; C : 6 valeurs ✗
      options: ['$1$ ، $3$ ، $5$ ، $7$ ، $9$ ، $11$ ، $13$', '$2$ ، $9$ ، $1$ ، $7$ ، $3$ ، $4$ ، $8$', '$5$ ، $6$ ، $7$ ، $7$ ، $8$ ، $9$'],
      correct: 0, cols: 1,
      explain: 'سبع قيم: الوسيط هو القيمة ذات الرتبة $\\dfrac{7 + 1}{2} = 4$ بعد الترتيب. في الأولى القيمة الرابعة $7$. الثانية مرتّبةً: $1$ ، $2$ ، $3$ ، $4$ ، $7$ ، $8$ ، $9$ ووسيطها $4$ . الثالثة فيها ست قيم.',
    },
    commonError: 'أخذ القيمة المكتوبة في الوسط قبل ترتيب السلسلة.',
  },
  // تمرين 10 — moyenne 9, étendue 16
  {
    id: 'ex-10', source: E(10, 99, AW), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'اقترح سلسلة متوسطها 9 و مداها 16.',
    interaction: 'choice',
    question: {
      prompt: 'أيّ هذه السلاسل تحقّق الشرطين؟',
      // A : 27/3 = 9, 17 − 1 = 16 ✓ ; B : m = 12,5 ✗ ; C : m = 9 mais 16 − 2 = 14 ✗
      options: ['$1$ ، $9$ ، $17$', '$9$ ، $16$', '$2$ ، $9$ ، $16$'],
      correct: 0, cols: 3,
      explain: '$\\dfrac{1 + 9 + 17}{3} = 9$ و $17 - 1 = 16$. في $9$ ، $16$ المتوسط $12{,}5$ ؛ وفي $2$ ، $9$ ، $16$ المتوسط $9$ لكنّ المدى $16 - 2 = 14$.',
    },
    commonError: 'الخلط بين المدى وأكبر قيمة: سلسلة أكبر قيمها 16 ليس مداها بالضرورة 16.',
  },
  // تمرين 11 — médiane 20, moyenne 17
  {
    id: 'ex-11', source: E(11, 99, AW), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'اقترح سلسلة وسيطها 20 و متوسطها 17',
    interaction: 'choice',
    question: {
      prompt: 'أيّ هذه السلاسل تحقّق الشرطين؟',
      // A : Med 20, 51/3 = 17 ✓ ; B : Med 17 ✗ ; C : m = 60/3 = 20 ✗
      options: ['$11$ ، $20$ ، $20$', '$14$ ، $17$ ، $20$', '$17$ ، $20$ ، $23$'],
      correct: 0, cols: 3,
      explain: '$11$ ، $20$ ، $20$ : القيمة المركزية $20$ ، و $\\dfrac{11 + 20 + 20}{3} = \\dfrac{51}{3} = 17$. في الثانية الوسيط $17$ ، وفي الثالثة المتوسط $20$.',
    },
  },
  // تمرين 12 — Med = 7 puis une série de 6 valeurs de médiane 21
  {
    id: 'ex-12-a', source: E(12, 99, AW, 'Med'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'إليك سلسلة إحصائية وسيطها Med. اقترح سلسلة أخرى لها نفس التكرار الكلّي و وسيطها 3Med.',
    items: ['السلسلة: $12$ ، $8$ ، $6$ ، $10$ ، $2$ ، $4$'],
    interaction: 'numeric',
    question: {
      prompt: 'أولًا: الوسيط Med لهذه السلسلة هو',
      expected: 7, display: '7',
      explain: 'مرتّبة: $2$ ، $4$ ، $6$ ، $8$ ، $10$ ، $12$ ؛ ست قيم، الوسيط منتصف الثالثة والرابعة: $\\dfrac{6 + 8}{2} = 7$.',
    },
    commonError: 'أخذ القيمتين المكتوبتين في الوسط ($6$ و $10$) قبل الترتيب.',
  },
  {
    id: 'ex-12-b', source: E(12, 99, AW, '3Med'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: 'سلسلة لها نفس التكرار الكلّي (6) ووسيطها $3 \\times 7 = 21$ :',
      // A : (18 + 24)/2 = 21 ✓ ; B : 3 valeurs ✗ ; C : (18 + 21)/2 = 19,5 ✗
      options: ['$6$ ، $12$ ، $18$ ، $24$ ، $30$ ، $36$', '$21$ ، $21$ ، $21$', '$6$ ، $12$ ، $18$ ، $21$ ، $24$ ، $30$'],
      correct: 0, cols: 1,
      explain: 'ضرب كل قيمة في 3 يضرب الوسيط في 3: $6$ ، $12$ ، $18$ ، $24$ ، $30$ ، $36$ وسيطها $\\dfrac{18 + 24}{2} = 21$. الثانية فيها ثلاث قيم، ووسيط الثالثة $\\dfrac{18 + 21}{2} = 19{,}5$.',
    },
  },
  // تمرين 13 — l'unique série (9 ; 13 ; 17)
  {
    id: 'ex-13', source: E(13, 99, AW), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'عيّن كل السلاسل الإحصائية التي تكرارها الكلّي 3 و وسيطها 13 ومداها 8 و متوسطها يساوي وسيطها.',
    interaction: 'integerSet',
    question: {
      prompt: 'اكتب قيم السلسلة (هي سلسلة واحدة):',
      expected: [9, 13, 17],
      explain: 'القيم $a \\le 13 \\le c$ : المدى $c - a = 8$ ، والمتوسط $13$ يعني $a + 13 + c = 39$ أي $a + c = 26$. إذن $a = 9$ و $c = 17$ : السلسلة الوحيدة $9$ ، $13$ ، $17$.',
    },
    method: 'نسمّي القيم المرتّبة $a$ ، $13$ ، $c$ ونترجم كل شرط إلى معادلة.',
  },
  // تمرين 17 — m/2, m, 3m/2
  {
    id: 'ex-17', source: E(17, 101, AT), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'عيّن خمس سلاسل إحصائية التكرار الكلي لكل منها 3 و أيضا في كل منها المدى و المتوسط و الوسيط متساوية.',
    interaction: 'batch',
    question: {
      prompt: 'في كل سلسلة: هل المدى والمتوسط والوسيط متساوية؟',
      rows: [
        { label: '$2$ ، $4$ ، $6$', options: YN, correct: 0, correction: 'المدى $4$ ، المتوسط $4$ ، الوسيط $4$.' },
        { label: '$1$ ، $2$ ، $4$', options: YN, correct: 1, correction: 'المدى $3$ ، المتوسط $\\dfrac{7}{3}$ ، الوسيط $2$.' },
        { label: '$3$ ، $6$ ، $9$', options: YN, correct: 0, correction: 'المدى $6$ ، المتوسط $6$ ، الوسيط $6$.' },
        { label: '$2$ ، $4$ ، $8$', options: YN, correct: 1, correction: 'المدى $6$ ، المتوسط $\\dfrac{14}{3}$ ، الوسيط $4$.' },
        { label: '$5$ ، $10$ ، $15$', options: YN, correct: 0, correction: 'المدى $10$ ، المتوسط $10$ ، الوسيط $10$.' },
      ],
      explain: 'إذا كانت القيم $a \\le m \\le c$ : الوسيط $m$ ، والمتوسط $m$ يعطي $a + c = 2m$ ، والمدى $m$ يعطي $c - a = m$ ؛ إذن $a = \\dfrac{m}{2}$ و $c = \\dfrac{3m}{2}$ : مثلا $1$ ، $2$ ، $3$ أو $4$ ، $8$ ، $12$.',
    },
  },
  // تمرين 18 — 2√3, 4√3, 5√3, 6√3, 3√3
  {
    id: 'ex-18', source: E(18, 101, AT), learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'إليك سلسلة أطوال أوتار خمسة مثلثات قائمة (بالسنتيمتر): $\\sqrt{12}$ ، $4\\sqrt{3}$ ، $\\sqrt{75}$ ، $6\\sqrt{3}$ ، $\\sqrt{27}$ . عيّن مدى، وسيط ومتوسط هذه السلسلة.',
    interaction: 'batch',
    question: {
      prompt: 'نكتب كل طول على الشكل $a\\sqrt{3}$ : $2\\sqrt{3}$ ، $4\\sqrt{3}$ ، $5\\sqrt{3}$ ، $6\\sqrt{3}$ ، $3\\sqrt{3}$ .',
      rows: [
        // √63 ≠ √48 = 4√3 ; 2√3 ≠ 4√3
        { label: 'المدى', options: ['$4\\sqrt{3}$', '$\\sqrt{63}$', '$2\\sqrt{3}$'], correct: 0, correction: 'أكبر قيمة $6\\sqrt{3}$ وأصغر قيمة $\\sqrt{12} = 2\\sqrt{3}$ : $6\\sqrt{3} - 2\\sqrt{3} = 4\\sqrt{3}$ . ولا نطرح ما تحت الجذرين: $\\sqrt{75 - 12} = \\sqrt{63}$ ليس فرقًا بين قيمتين.' },
        // √75 = 5√3 : la valeur écrite au milieu, pas la médiane
        { label: 'الوسيط', options: ['$5\\sqrt{3}$', '$4\\sqrt{3}$', '$3\\sqrt{3}$'], correct: 1, correction: 'مرتّبة: $2\\sqrt{3}$ ، $3\\sqrt{3}$ ، $4\\sqrt{3}$ ، $5\\sqrt{3}$ ، $6\\sqrt{3}$ : القيمة الثالثة $4\\sqrt{3}$ ($\\sqrt{75}$ مكتوبة في الوسط لكنّ السلسلة غير مرتّبة).' },
        { label: 'المتوسط', options: ['$20\\sqrt{3}$', '$\\sqrt{54}$', '$4\\sqrt{3}$'], correct: 2, correction: '$\\dfrac{(2 + 4 + 5 + 6 + 3)\\sqrt{3}}{5} = \\dfrac{20\\sqrt{3}}{5} = 4\\sqrt{3}$ .' },
      ],
      explain: 'المدى والوسيط والمتوسط كلّها $4\\sqrt{3}\\,\\mathrm{cm}$.',
    },
  },
];

/** Les parties d'un exercice. */
export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));
/** Accès par id. */
export const EX = Object.fromEntries(EXERCISES.map((ex) => [ex.id, ex]));
