/**
 * « أوظّف تعلّماتي » du درس « المقاطع المستوية للمجسمات المألوفة » — AJOUTS DE LA PLATEFORME : le scan s'arrête p. 169, sans
 * aucun exercice (extraction › discrepancies › missing_page). Chaque entrée est déclarée `addition('interaction_generation')` ;
 * un exercice à plusieurs parties est découpé en une entrée par partie (la première porte l'énoncé). Tous les distracteurs sont
 * faux (vérifiés par le calcul, commentés). Les contextes : une pastèque (دلّاع) du marché, un silo de céréales, le gâteau de
 * l'Aïd, la couche de l'imprimante 3D. Aucun nombre du إختبار أولي n'apparaît ici.
 */
import { addition } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_maqati-mustawiya_P1',
  P2: '4am_maqati-mustawiya_P2',
  P3: '4am_maqati-mustawiya_P3',
  P4: '4am_maqati-mustawiya_P4',
};

const ADD = addition('interaction_generation');
const near = (v) => (n) => Number.isFinite(n) && Math.abs(n - v) < 1e-9;

export const EXERCISES = [
  // 1 — la pastèque du marché : une boule de rayon 15 cm tranchée à 9 cm du centre
  {
    id: 'w1-a', group: 'w1', source: ADD, learningPointId: LP.P1, difficulty: 'facile',
    statement: 'في سوق الخضر يقطع البائع الأمين، ليُري الزبون جودتها، دلّاعة كروية الشكل نصف قطرها $15\\,\\mathrm{cm}$ بسكين مستقيمة، فيكون مستوي القطع على بعد $9\\,\\mathrm{cm}$ من مركزها O.',
    interaction: 'numeric',
    question: {
      prompt: 'نصف قطر الدائرة التي يرسمها القطع على قشرة الدلّاعة (بـ $\\mathrm{cm}$):',
      expected: near(12),
      display: '12',
      explain: 'المثلث OAM قائم في A: $AM^2 = OM^2 - OA^2 = 15^2 - 9^2 = 225 - 81 = 144$ ، إذن $AM = 12\\,\\mathrm{cm}$ .',
    },
    method: 'نصف قطر المقطع $r = \\sqrt{R^2 - h^2}$ حيث h بعد المستوي عن المركز.',
    commonError: 'الطرح دون مربعات: $15 - 9 = 6$ ليس نصف قطر المقطع.',
  },
  {
    id: 'w1-b', group: 'w1', source: ADD, learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: 'لو كان مستوي القطع على بعد $15\\,\\mathrm{cm}$ من المركز، فإن السكين:',
      // une tranche de rayon 15 : h = 0 seulement (MISC-MAQTA-TARH inversé) ; rien : h > R seulement (MISC-MAQTA-MUMAS)
      options: ['تمسّ القشرة في نقطة واحدة', 'تقطع دائرة نصف قطرها $15\\,\\mathrm{cm}$', 'لا تلمس الدلّاعة إطلاقا'],
      correct: 0, cols: 1,
      explain: 'بعد المستوي عن المركز يساوي نصف القطر ($h = R$): المستوي مماس للكرة في نقطة واحدة.',
    },
    commonError: 'الخلط بين $h = R$ (نقطة تماس) و $h > R$ (لا تقاطع).',
  },
  // 2 — le silo de céréales : un cylindre de rayon 4 m, de hauteur 12 m, coupé parallèlement à son axe à 2,4 m de l'axe
  {
    id: 'w2', source: ADD, learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'صومعة حبوب يدّخر فيها الفلاحون قمح الوطن، على شكل أسطوانة دوران نصف قطر قاعدتها $4\\,\\mathrm{m}$ وارتفاعها $12\\,\\mathrm{m}$ . في مخطط هندسي نقطعها بمستو موازٍ لمحورها يبعد عنه بـ $2{,}4\\,\\mathrm{m}$ .',
    interaction: 'numeric',
    question: {
      prompt: 'المقطع مستطيل أحد بعديه $12\\,\\mathrm{m}$ . بعده الآخر (بـ $\\mathrm{m}$):',
      expected: near(6.4),
      display: '6,4',
      explain: 'في القاعدة: نصف العرض $\\sqrt{4^2 - 2{,}4^2} = \\sqrt{16 - 5{,}76} = \\sqrt{10{,}24} = 3{,}2$ ، فالعرض $2 \\times 3{,}2 = 6{,}4\\,\\mathrm{m}$ .',
    },
    method: 'نصف العرض ضلع قائم في المثلث الذي وتره نصف القطر وضلعه الآخر بعد المستوي عن المحور.',
    commonError: 'العرض $2(4 - 2{,}4) = 3{,}2$ : طرح الطولين بدل تطبيق خاصية فيثاغورس.',
  },
  // 3 — le gâteau de l'Aïd : un pavé 30 × 20 × 8 coupé parallèlement à une arête verticale
  {
    id: 'w3', source: ADD, learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'كعكة العيد على شكل بلاطة قائمة ABCDEFGH طولها $30\\,\\mathrm{cm}$ وعرضها $20\\,\\mathrm{cm}$ وارتفاعها $8\\,\\mathrm{cm}$ . تقطع الأم ركنا منها لتهديه إلى الجيران، بسكين شاقولية توازي الحرف الشاقولي للركن، وتمرّ على بعد $12\\,\\mathrm{cm}$ و $9\\,\\mathrm{cm}$ من هذا الركن على الحرفين الأفقيين.',
    interaction: 'choice',
    question: {
      prompt: 'مساحة المقطع (وجه القطعة المقطوعة) هي:',
      // 168 = (12 + 9) × 8 (la somme au lieu de l'hypoténuse) ; 96 = 12 × 8 (un seul côté)
      options: ['$120\\,\\mathrm{cm}^2$', '$168\\,\\mathrm{cm}^2$', '$96\\,\\mathrm{cm}^2$'],
      correct: 0, cols: 3,
      explain: 'المقطع مستطيل أحد بعديه الارتفاع $8$ ، والآخر وتر المثلث القائم: $\\sqrt{12^2 + 9^2} = \\sqrt{225} = 15$ ؛ المساحة $15 \\times 8 = 120\\,\\mathrm{cm}^2$ .',
    },
    commonError: 'جمع $12 + 9 = 21$ بدل حساب الوتر.',
  },
  // 4 — la couche de l'imprimante : une pyramide à base carrée de côté 6, SE/SA = 2/3
  {
    id: 'w4', source: ADD, learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'يتعاون تلاميذ النادي فتطبع الطابعة ثلاثية الأبعاد هرما منتظما SABCD قاعدته مربع ضلعه $6\\,\\mathrm{cm}$ . الطبقة EFGH موازية للقاعدة، و E من $[SA]$ حيث $SE = \\dfrac{2}{3}SA$ .',
    interaction: 'choice',
    question: {
      prompt: 'الطبقة EFGH هي:',
      // 6 : la base elle-même (MISC-MAQTA-HARAM) ; 2 = 6 × 1/3 : EA/SA au lieu de SE/SA
      options: ['مربع ضلعه $4\\,\\mathrm{cm}$', 'مربع ضلعه $6\\,\\mathrm{cm}$', 'مربع ضلعه $2\\,\\mathrm{cm}$'],
      correct: 0, cols: 1,
      explain: 'المقطع تصغير للقاعدة بنسبة $k = \\dfrac{SE}{SA} = \\dfrac{2}{3}$ : ضلعه $\\dfrac{2}{3} \\times 6 = 4\\,\\mathrm{cm}$ .',
    },
    commonError: 'استعمال $\\dfrac{EA}{SA}$ بدل $\\dfrac{SE}{SA}$ : النسبة تبدأ من الرأس.',
  },
];

/** Les exercices d'un groupe (plusieurs parties), dans l'ordre. */
export const partsOf = (g) => EXERCISES.filter((e) => (e.group ?? e.id) === g);
