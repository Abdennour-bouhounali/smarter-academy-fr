/**
 * أوظّف تعلّماتي du درس « التكبير والتصغير وأثره على المقادير الفضائية » — le scan s'arrête p. 169 : il n'a AUCUN exercice
 * (extraction › discrepancies › objectives, missing_page). Ces cinq exercices sont donc des AJOUTS de la plateforme, déclarés
 * (`addition('interaction_generation')`), dans des contextes algériens ; chaque réponse est recalculée dans
 * content/lesson.test.js avec packages/core/arithmetic/space.js. Tous les distracteurs sont FAUX ; l'erreur qu'ils portent
 * est dite en commentaire.
 */
import { addition } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_takbir-tasghir_P1',
  P2: '4am_takbir-tasghir_P2',
};
const SOURCE = addition('interaction_generation');

export const EXERCISES = [
  {
    id: 'aw-1', source: SOURCE, learningPointId: LP.P1, difficulty: 'facile',
    statement: 'كرة الفريق الوطني نصف قطرها $11\\,\\mathrm{cm}$ ، وكرة مصغّرة لها تُباع للمشجّعين نصف قطرها $5{,}5\\,\\mathrm{cm}$ .',
    interaction: 'choice',
    question: {
      prompt: 'الكرة المصغّرة تصغير للكرة الأصلية بالنسبة:',
      // 2 : la fraction renversée (MISC-TAKBIR-ITTIJAH) ; 5,5 : la différence 11 − 5,5 (MISC-TAKBIR-JAM)
      options: ['$k = \\dfrac{1}{2}$', '$k = 2$', '$k = 5{,}5$'],
      correct: 0, cols: 3,
      explain: '$k = \\dfrac{5{,}5}{11} = \\dfrac{1}{2}$ : طول في المجسّم الناتج على الطول الموافق له في الأصلي، و $k < 1$ تصغير.',
    },
    commonError: 'قلب النسبة: $\\dfrac{11}{5{,}5} = 2$ هي نسبة تكبير الكرة الصغيرة لتصير الكبيرة.',
  },
  {
    id: 'aw-2', source: SOURCE, learningPointId: LP.P1, difficulty: 'facile',
    statement: 'في لعبة البناء، يتعاون لاعبان على بناء مدينة فيكبّر أحدهما مكعّبا بالنسبة $k = 3$ .',
    interaction: 'batch',
    question: {
      prompt: 'اختر لكل سطر العدد الذي يُضرب فيه:',
      rows: [
        { label: 'طول حرف المكعّب', options: ['3', '9', '27'], correct: 0, correction: 'الأطوال تُضرب في $k = 3$ .' },
        { label: 'مساحة وجه من أوجهه', options: ['3', '9', '27'], correct: 1, correction: 'المساحات تُضرب في $k^2 = 9$ : الوجه صار $3 \\times 3$ مربعات.' },
        { label: 'حجمه', options: ['3', '9', '27'], correct: 2, correction: 'الحجوم تُضرب في $k^3 = 27$ : $3 \\times 3 \\times 3$ مكعّبا.' },
      ],
      explain: 'الطول بعد واحد، والمساحة بعدان، والحجم ثلاثة أبعاد.',
    },
    commonError: 'ضرب الحجم في $k$ أو في $k^2$ فقط.',
  },
  {
    id: 'aw-3', source: SOURCE, learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'هرم حجمه $270\\,\\mathrm{cm}^3$ . يقطعه مستوٍ يوازي قاعدته فيعطي هرما صغيرا له نفس الرأس، ارتفاعه ثلث ارتفاع الهرم الأصلي.',
    interaction: 'numeric',
    question: {
      prompt: 'حجم الهرم الصغير بـ $\\mathrm{cm}^3$ :',
      expected: 10,
      explain: 'الهرم الصغير تصغير للأصلي بالنسبة $k = \\dfrac{1}{3}$ : $\\mathcal{V}\' = \\left(\\dfrac{1}{3}\\right)^3 \\times 270 = \\dfrac{270}{27} = 10\\,\\mathrm{cm}^3$ .',
    },
    commonError: 'قسمة الحجم على 3 فقط ($90\\,\\mathrm{cm}^3$): الحجم يُضرب في $k^3 = \\dfrac{1}{27}$ .',
  },
  {
    id: 'aw-4', source: SOURCE, learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'مخطّط شقة تبنيها جمعية خيرية لأسرة محتاجة، مرسوم بمقياس $\\dfrac{1}{100}$ : مساحة غرفة على المخطّط $12\\,\\mathrm{cm}^2$ .',
    interaction: 'choice',
    question: {
      prompt: 'المساحة الحقيقية للغرفة:',
      // 12 × 100 = 1200 cm² : × k au lieu de × k² (MISC-TAKBIR-MISAHA-K) ; 12 × 10⁶ : × k³
      options: ['$12\\,\\mathrm{m}^2$', '$1200\\,\\mathrm{cm}^2$', '$1200\\,\\mathrm{m}^2$'],
      correct: 0, cols: 3,
      explain: 'من المخطّط إلى الحقيقة تكبير بالنسبة 100: المساحة تُضرب في $100^2 = 10000$ ، أي $120000\\,\\mathrm{cm}^2 = 12\\,\\mathrm{m}^2$ .',
    },
    commonError: 'ضرب المساحة في 100 بدل $100^2$ .',
  },
  {
    id: 'aw-5', source: SOURCE, learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'ميدالية مفاتيح مطبوعة بطابعة ثلاثية الأبعاد هي تصغير لمجسّم خزّان مائي بالنسبة $\\dfrac{1}{50}$ . حجم الميدالية $12\\,\\mathrm{cm}^3$ .',
    interaction: 'choice',
    question: {
      prompt: 'سعة الخزّان المائي الحقيقي:',
      // 600 cm³ : × 50 (MISC-TAKBIR-HAJM-K) ; 30 000 cm³ = 30 L : × 50² (MISC-TAKBIR-HAJM-K)
      options: ['$1500\\,\\mathrm{L}$', '$30\\,\\mathrm{L}$', '$0{,}6\\,\\mathrm{L}$'],
      correct: 0, cols: 3,
      explain: '$\\mathcal{V} = 50^3 \\times 12 = 125000 \\times 12 = 1500000\\,\\mathrm{cm}^3$ ، و $1\\,\\mathrm{L} = 1000\\,\\mathrm{cm}^3$ : السعة $1500\\,\\mathrm{L}$ .',
    },
    commonError: 'ضرب الحجم في 50 أو في $50^2$ : الحجوم تُضرب في $50^3$ .',
  },
];
