/**
 * Les exercices de « أوظّف تعلّماتي » du درس « مساحة الكرة وحجم الجلة ». Le scan s'arrête p. 169 : AUCUN exercice du manuel
 * (extraction › scope.missing_pages, discrepancies › objectives). Ces exercices sont donc des AJOUTS DÉCLARÉS de la plateforme
 * (`addition('interaction_generation')`, étiquette « مثال تفاعلي إضافي »), écrits dans l'esprit du programme algérien de la
 * 2e génération, en contextes algériens (le ballon de l'équipe nationale, la coupole d'une mosquée, le château d'eau
 * sphérique de la commune, une balle de ping-pong dans son étui). Toutes les valeurs sont calculées (ci-dessous en
 * commentaire, vérifiées par content/exercises.test.js sur space.js) ; tous les distracteurs sont FAUX et nommés.
 */
import { addition } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_misaha-hajm-kura_P1',
  P2: '4am_misaha-hajm-kura_P2',
  P3: '4am_misaha-hajm-kura_P3',
};
const PLATFORM = addition('interaction_generation');

export const EXERCISES = [
  // 1. Le ballon (taille 5) de l'équipe nationale : D = 22 cm → R = 11, 𝒜 = 484π ≈ 1520,5 cm²
  {
    id: 'ex-p1', source: PLATFORM, learningPointId: LP.P1, difficulty: 'facile',
    statement: 'قطر كرة المنتخب الوطني الجزائري (المقاس 5) حوالي $22\\,\\mathrm{cm}$ . احسب مساحة سطحها، مدوّرة إلى الجزء من عشرة (بالـ $\\mathrm{cm}^2$).',
    interaction: 'numeric',
    question: {
      prompt: 'مساحة سطح الكرة بالـ $\\mathrm{cm}^2$ (مدوّرة إلى الجزء من عشرة):',
      expected: 1520.5, display: '1520,5',
      explain: '$R = 22 \\div 2 = 11\\,\\mathrm{cm}$ ، $\\mathcal{A} = 4\\pi \\times 11^2 = 484\\pi = 1520{,}53\\ldots$ أي $\\mathcal{A} \\approx 1520{,}5\\,\\mathrm{cm}^2$ .',
    },
    commonError: 'التعويض بالقطر: $4\\pi \\times 22^2 = 1936\\pi \\approx 6082{,}1\\,\\mathrm{cm}^2$ ، أربعة أضعاف المساحة الحقيقية.',
  },
  // 2. La coupole d'une mosquée (demi-sphère, R = 6 m) : 2πR² = 72π m²
  {
    id: 'ex-p2', source: PLATFORM, learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'قبّة مسجد الحيّ على شكل نصف كرة نصف قطرها $6\\,\\mathrm{m}$ . يتطوّع البنّاؤون لطلاء سطحها الخارجي (دون القاعدة).',
    interaction: 'choice',
    question: {
      prompt: 'القيمة المضبوطة لمساحة سطح القبّة:',
      // 144π : la sphère entière ; 36π : un seul disque (πR²)
      options: ['$72\\pi\\,\\mathrm{m}^2$', '$144\\pi\\,\\mathrm{m}^2$', '$36\\pi\\,\\mathrm{m}^2$'],
      correct: 0, cols: 3,
      explain: 'نصف كرة: نصف مساحة الكرة، $\\frac{1}{2} \\times 4\\pi \\times 6^2 = 2\\pi \\times 36 = 72\\pi\\,\\mathrm{m}^2$ .',
    },
    commonError: 'أخذ مساحة الكرة كلها $144\\pi\\,\\mathrm{m}^2$ ، والقبّة نصفها فقط.',
  },
  // 3. Le château d'eau sphérique (R = 2,5 m) : 𝒱 = 125π/6 ≈ 65,4 m³
  {
    id: 'ex-p3', source: PLATFORM, learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'خزان الماء في أعلى برج البلدية، الذي يحرص العمال على نظافته، كروي، نصف قطره الداخلي $2{,}5\\,\\mathrm{m}$ . احسب حجم الماء الذي يملؤه، مدوّرا إلى الجزء من عشرة (بالـ $\\mathrm{m}^3$).',
    interaction: 'numeric',
    question: {
      prompt: 'حجم الخزان بالـ $\\mathrm{m}^3$ (مدوّرا إلى الجزء من عشرة):',
      expected: 65.4, display: '65,4',
      explain: '$\\mathcal{V} = \\frac{4}{3}\\pi \\times 2{,}5^3 = \\frac{4}{3}\\pi \\times 15{,}625 = \\frac{125}{6}\\pi = 65{,}449\\ldots$ أي $\\mathcal{V} \\approx 65{,}4\\,\\mathrm{m}^3$ .',
    },
    commonError: 'الأس 2 بدل 3: $\\frac{4}{3}\\pi \\times 2{,}5^2 \\approx 26{,}2$ — هذا ليس حجما.',
  },
  // 4. L'arrondi : 𝒱 = 4/3·π·1,5³ = 4,5π ≈ 14,137…
  {
    id: 'ex-p4', source: PLATFORM, learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'كرية زجاجية (بِيّة) نصف قطرها $1{,}5\\,\\mathrm{cm}$ .',
    interaction: 'batch',
    question: {
      prompt: 'حجم الجلة:',
      rows: [
        // 14,137… est déjà arrondi ; 4,5 oublie π
        { label: 'القيمة المضبوطة', options: ['$4{,}5\\pi\\,\\mathrm{cm}^3$', '$14{,}137\\,\\mathrm{cm}^3$', '$4{,}5\\,\\mathrm{cm}^3$'], correct: 0, correction: '$\\frac{4}{3}\\pi \\times 1{,}5^3 = \\frac{4}{3} \\times 3{,}375\\,\\pi = 4{,}5\\pi\\,\\mathrm{cm}^3$ .' },
        // 14,2 : arrondi par excès à tort ; 14,13 : deux chiffres
        { label: 'المدوّر إلى الجزء من عشرة', options: ['$14{,}1\\,\\mathrm{cm}^3$', '$14{,}2\\,\\mathrm{cm}^3$', '$14{,}13\\,\\mathrm{cm}^3$'], correct: 0, correction: '$4{,}5\\pi = 14{,}137\\ldots$ : الرقم الموالي 3 أصغر من 5، فـ $14{,}1$ .' },
        // 14,13 : troncature ; 14,1 : un seul chiffre
        { label: 'المدوّر إلى الجزء من مائة', options: ['$14{,}14\\,\\mathrm{cm}^3$', '$14{,}13\\,\\mathrm{cm}^3$', '$14{,}1\\,\\mathrm{cm}^3$'], correct: 0, correction: '$14{,}137\\ldots$ : الرقم الموالي 7، فنزيد 1: $14{,}14$ .' },
      ],
      explain: 'نكتب القيمة المضبوطة بدلالة $\\pi$ ، ثم ندوّر في آخر الحساب إلى الرتبة المطلوبة.',
    },
    commonError: 'البتر بدل التدوير: $14{,}13$ بدل $14{,}14$ .',
  },
  // 5. Archimède en vrai : la balle de ping-pong (D = 4 cm) dans son étui cylindrique (r = 2, h = 4)
  {
    id: 'ex-p5', source: PLATFORM, learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'كرة طاولة (بينغ بونغ) قطرها $4\\,\\mathrm{cm}$ توضع في علبة أسطوانية على مقاسها تماما: نصف قطر قاعدتها $2\\,\\mathrm{cm}$ وارتفاعها $4\\,\\mathrm{cm}$ .',
    interaction: 'batch',
    question: {
      prompt: 'أكمل:',
      rows: [
        // 16π/3 : le vide ; 8π : la moitié
        { label: 'حجم العلبة', options: ['$16\\pi\\,\\mathrm{cm}^3$', '$8\\pi\\,\\mathrm{cm}^3$', '$64\\pi\\,\\mathrm{cm}^3$'], correct: 0, correction: '$\\pi \\times 2^2 \\times 4 = 16\\pi\\,\\mathrm{cm}^3$ .' },
        { label: 'حجم الكرة (الجلة)', options: ['$\\frac{32}{3}\\pi\\,\\mathrm{cm}^3$', '$16\\pi\\,\\mathrm{cm}^3$', '$\\frac{256}{3}\\pi\\,\\mathrm{cm}^3$'], correct: 0, correction: '$\\frac{4}{3}\\pi \\times 2^3 = \\frac{32}{3}\\pi$ ، وهو ثلثا $16\\pi$ (أرخميدس).' },
        { label: 'الحجم الفارغ في العلبة', options: ['$\\frac{16}{3}\\pi\\,\\mathrm{cm}^3$', '$\\frac{32}{3}\\pi\\,\\mathrm{cm}^3$', 'لا فراغ: الكرة تملأ العلبة'], correct: 0, correction: '$16\\pi - \\frac{32}{3}\\pi = \\frac{16}{3}\\pi$ : ثلث العلبة فارغ.' },
      ],
      explain: 'الكرة تمسّ القاعدتين والسطح الجانبي: حجمها ثلثا حجم العلبة، ويبقى الثلث فارغا.',
    },
    commonError: 'التعويض بالقطر $4$ في $\\frac{4}{3}\\pi R^3$ : $\\frac{256}{3}\\pi$ أكبر من العلبة نفسها، وهذا مستحيل.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
