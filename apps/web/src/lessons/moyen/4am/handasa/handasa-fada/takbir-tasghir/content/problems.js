/**
 * Les trois « مسائل » du درس « التكبير والتصغير وأثره على المقادير الفضائية » (modules 5, 6, 7) — des exercices COMPLETS de
 * type امتحان, résolus pas à pas (common/problems/GuidedProblem.jsx).
 *
 * AJOUTS DE LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`) : le manuel ne les contient pas. Ils restent
 * dans le périmètre de la leçon : la définition (le même k pour TOUTES les longueurs, k > 1 / 0 < k < 1), l'effet de k sur les
 * longueurs (× k), les aires (× k²), les volumes (× k³), k depuis deux longueurs, les mesures de l'image sans recalcul.
 * Prérequis utilisés : le volume et l'aire totale d'un pavé (masaha-kulliya), les conversions d'unités. Jamais le volume
 * d'un tronc (exclu), jamais une similitude plane hors solides usuels.
 *
 * LE PIÈGE commun aux trois : un volume se multiplie par k³ (pas k ni k²), une aire par k² (pas k).
 *
 * La مسألة 1 est « مسألة الدرس » : son énoncé et sa figure vivent dans `LESSON_CONFIG.lessonProblem` (montrés dès le sommaire
 * et rappelés à la fin du module 1), prolongement du lab متقدم (scale-blocks : un pavé de cubes dans le jeu de construction,
 * réduit par k, le contraste « + 1 cm » → ici « − 2 cm »). Contextes 2 et 3 : ceux réservés à cette leçon (la maquette d'un
 * monument, l'aquarium agrandi).
 *
 * Chaque nombre est vérifié par calcul dans ./problems.test.js.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

/** مسألة 2 — le نصب : pyramide régulière SABCD, base carrée de côté 6 m, hauteur SO = 4 m (apothème 5 m : aire latérale 60 m²). */
const FIG_MONUMENT = {
  kind: 'space',
  view: { azimuth: -58, elevation: 16 },
  points: { S: [0, 0, 4], A: [-3, -3, 0], B: [3, -3, 0], C: [3, 3, 0], D: [-3, 3, 0], O: [0, 0, 0] },
  solids: [{ type: 'polyhedron', faces: [['A', 'B', 'C', 'D'], ['S', 'A', 'B'], ['S', 'B', 'C'], ['S', 'C', 'D'], ['S', 'D', 'A']], tone: 'slate' }],
  segments: [{ from: 'S', to: 'O', label: '4 m', dashed: true, tone: 'rose' }, { from: 'A', to: 'B', label: '6 m', tone: 'rose' }],
  labels: { S: 'n', A: 'sw', B: 'se', C: 'e', D: 'nw', O: 'e' },
  ariaLabel: 'النصب التذكاري: هرم منتظم SABCD قاعدته المربع ABCD الذي طول ضلعه 6 m، وارتفاعه SO يساوي 4 m حيث O مركز القاعدة',
  maxWidth: 380,
};

/** مسألة 3 — l'aquarium ouvert en haut : 40 × 20 × 30 cm (dessiné en dizaines de cm : 4 × 2 × 3), aucune face supérieure. */
const FIG_AQUARIUM = {
  kind: 'space',
  view: { azimuth: -58, elevation: 22 },
  points: { A: [0, 0, 3], B: [4, 0, 3], C: [4, 2, 3], D: [0, 2, 3], E: [0, 0, 0], F: [4, 0, 0], G: [4, 2, 0], H: [0, 2, 0] },
  solids: [{ type: 'polyhedron', faces: [['E', 'F', 'G', 'H'], ['A', 'B', 'F', 'E'], ['B', 'C', 'G', 'F'], ['C', 'D', 'H', 'G'], ['D', 'A', 'E', 'H']], tone: 'sky' }],
  segments: [{ from: 'E', to: 'F', label: '40 cm', tone: 'sky' }, { from: 'F', to: 'G', label: '20 cm', tone: 'sky' }, { from: 'B', to: 'F', label: '30 cm', tone: 'sky' }],
  hidden: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  ariaLabel: 'حوض سمير: متوازي مستطيلات زجاجي مفتوح من الأعلى، طوله 40 cm وعرضه 20 cm وارتفاعه 30 cm',
  maxWidth: 380,
};

export const PROBLEMS = [
  {
    id: 'masala-1',
    tone: 'indigo',
    title: 'مسألة 1 — صندوق الكنز في لعبة البناء',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🧱',
    source: SOURCE,
    statement: LESSON_CONFIG.lessonProblem.statement,
    figure: LESSON_CONFIG.lessonProblem.figure,
    data: [
      { id: 'dims', text: 'الصندوق متوازي مستطيلات أبعاده 8 cm و 6 cm و 4 cm', useful: true },
      { id: 'k', text: 'نسبة التصغير ثلاثة أرباع', useful: true },
      { id: 'resin', text: 'الراتنج بـ 12 دج لكل سنتيمتر مكعب', useful: true },
      { id: 'paint', text: 'الدهن بـ 5 دج لكل سنتيمتر مربع', useful: true },
      { id: 'budget', text: 'يملك أنس 1500 دج', useful: true },
      { id: 'time', text: 'استغرق البناء 12 دقيقة', useful: false },
      { id: 'levels', text: 'في اللعبة 250 مستوى', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حجم الصندوق وحجم تصغيره',
        question: 'ما حجم الصندوق $\\mathcal{V}$ ؟ احسب حجم المجسّم المصغّر $\\mathcal{V}\'$ دون أن تحسب أبعاده.',
        asks: ['حجم الصندوق $\\mathcal{V}$', 'حجم المجسّم المصغّر $\\mathcal{V}\'$'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'حجم الصندوق $\\mathcal{V}$ :', expected: 192, suffix: 'cm³',
            explain: '$\\mathcal{V} = 8 \\times 6 \\times 4 = 192\\,\\mathrm{cm}^3$ : الصندوق مبني من 192 مكعّبا.' },
          { kind: 'choice', role: 'translate', requires: ['takbir-khassiya'],
            prompt: 'في تصغير بالنسبة $k = \\dfrac{3}{4}$ ، الحجم يُضرب في:',
            options: [
              '$\\left(\\dfrac{3}{4}\\right)^3 = \\dfrac{27}{64}$',
              '$\\dfrac{3}{4}$',
              '$\\left(\\dfrac{3}{4}\\right)^2 = \\dfrac{9}{16}$',
            ],
            correct: 0, cols: 3,
            explain: 'للحجم ثلاثة أبعاد، وكل بعد يُضرب في $\\dfrac{3}{4}$ : $\\dfrac{3}{4} \\times \\dfrac{3}{4} \\times \\dfrac{3}{4} = \\dfrac{27}{64}$ . الضرب في $\\dfrac{9}{16}$ ينسى الارتفاع.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tariqat-maqadir'],
            prompt: 'حجم المجسّم المصغّر $\\mathcal{V}\'$ :', expected: 81, suffix: 'cm³',
            explain: '$\\dfrac{27}{64} \\times 192 = 27 \\times 3 = 81$ ، وتحقّق بالأبعاد: $6 \\times 4{,}5 \\times 3 = 81$ .' },
          { kind: 'solution', lines: [
            '$\\mathcal{V} = 8 \\times 6 \\times 4 = 192\\,\\mathrm{cm}^3$ .',
            'في تصغير بالنسبة $k = \\dfrac{3}{4}$ تُضرب الحجوم في $k^3 = \\dfrac{27}{64}$ .',
            '$\\mathcal{V}\' = \\dfrac{27}{64} \\times 192 = 81\\,\\mathrm{cm}^3$ : حجم المجسّم المصغّر $81\\,\\mathrm{cm}^3$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'المساحة، واقتراح ياسين',
        question: 'احسب المساحة الكلية $\\mathcal{A}\'$ لأوجه المجسّم المصغّر. اقترح ياسين، صديق أنس، أن يُنقص $2\\,\\mathrm{cm}$ من كل حرف من أحرف الصندوق بدل ذلك: هل المجسّم الذي يحصل عليه تصغير للصندوق؟',
        asks: ['المساحة الكلية $\\mathcal{A}\'$', 'هل مجسّم ياسين تصغير للصندوق؟'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['masaha-kulliya'],
            prompt: 'المساحة الكلية $\\mathcal{A}$ لأوجه الصندوق:', expected: 208, suffix: 'cm²',
            explain: '$\\mathcal{A} = 2(8 \\times 6 + 6 \\times 4 + 8 \\times 4) = 2 \\times 104 = 208\\,\\mathrm{cm}^2$ .' },
          { kind: 'choice', role: 'translate', requires: ['takbir-khassiya'],
            prompt: 'المساحة الكلية لأوجه المجسّم المصغّر:',
            options: [
              '$\\mathcal{A}\' = \\left(\\dfrac{3}{4}\\right)^2 \\times \\mathcal{A}$',
              '$\\mathcal{A}\' = \\dfrac{3}{4} \\times \\mathcal{A}$',
              '$\\mathcal{A}\' = \\left(\\dfrac{3}{4}\\right)^3 \\times \\mathcal{A}$',
            ],
            correct: 0,
            explain: 'لكل وجه بعدان، وكل بعد يُضرب في $\\dfrac{3}{4}$ : المساحات تُضرب في $k^2 = \\dfrac{9}{16}$ ، والحجوم وحدها في $k^3$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-maqadir'],
            prompt: 'المساحة الكلية $\\mathcal{A}\'$ :', expected: 117, suffix: 'cm²',
            explain: '$\\dfrac{9}{16} \\times 208 = 9 \\times 13 = 117$ ، وتحقّق بالأبعاد: $2(6 \\times 4{,}5 + 4{,}5 \\times 3 + 6 \\times 3) = 117$ .' },
          { kind: 'choice', role: 'translate', requires: ['takbir-tarif'],
            prompt: 'لنحكم على اقتراح ياسين، نقارن:',
            options: [
              'حاصل قسمة كل حرف جديد على الحرف الموافق له في الصندوق',
              'ما نقص من كل حرف',
              'حجمي المجسّمين فقط',
            ],
            correct: 0,
            explain: 'في تصغير تُضرب كل الأطوال في نفس العدد $k$ : نقارن حواصل القسمة، لا الفروق.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['takbir-tarif'],
            prompt: 'مجسّم ياسين:',
            options: [
              'ليس تصغيرا للصندوق: $\\dfrac{6}{8} = \\dfrac{3}{4}$ و $\\dfrac{4}{6} = \\dfrac{2}{3}$ و $\\dfrac{2}{4} = \\dfrac{1}{2}$ نسب مختلفة',
              'تصغير للصندوق: كل الأحرف نقصت بنفس الطول $2\\,\\mathrm{cm}$',
              'تصغير للصندوق بالنسبة $\\dfrac{3}{4}$ لأنّ الحرف 8 صار 6',
            ],
            correct: 0,
            explain: 'أحرف مجسّم ياسين $8 - 2 = 6$ و $6 - 2 = 4$ و $4 - 2 = 2$ ؛ حواصل القسمة مختلفة، فالأحرف لم تُضرب في نفس العدد وشكل الصندوق تغيّر.' },
          { kind: 'solution', lines: [
            '$\\mathcal{A} = 2(8 \\times 6 + 6 \\times 4 + 8 \\times 4) = 208\\,\\mathrm{cm}^2$ ، و $\\mathcal{A}\' = \\left(\\dfrac{3}{4}\\right)^2 \\times 208 = 117\\,\\mathrm{cm}^2$ .',
            'أحرف مجسّم ياسين 6 و 4 و 2، و $\\dfrac{6}{8} = \\dfrac{3}{4}$ بينما $\\dfrac{2}{4} = \\dfrac{1}{2}$ .',
            'الأحرف لم تُضرب في نفس العدد: مجسّم ياسين ليس تصغيرا للصندوق.',
          ] },
        ],
      },
      {
        label: '3)', title: 'طبع المجسّم المصغّر',
        question: 'احسب ثمن الراتنج اللازم لطبع المجسّم المصغّر مملوءا، وثمن دهن أوجهه الستة. هل تكفي أنس 1500 دج؟',
        asks: ['ثمن الراتنج', 'ثمن دهن الأوجه', 'هل تكفي 1500 دج؟'],
        steps: [
          { kind: 'choice', role: 'translate',
            prompt: 'ثمن الراتنج يُحسب انطلاقا من:',
            options: [
              'حجم المجسّم المصغّر $\\mathcal{V}\'$',
              'حجم الصندوق $\\mathcal{V}$',
              'المساحة الكلية $\\mathcal{A}\'$',
            ],
            correct: 0,
            explain: 'الراتنج يملأ المجسّم المطبوع، وهو المصغّر: نضرب حجمه $\\mathcal{V}\'$ في ثمن $1\\,\\mathrm{cm}^3$ . أمّا الدهن فيغطي الأوجه: نضرب $\\mathcal{A}\'$ في ثمن $1\\,\\mathrm{cm}^2$ .' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'ثمن الراتنج:', expected: 972, suffix: 'دج',
            explain: '$81 \\times 12 = 972$ دج.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ثمن دهن الأوجه:', expected: 585, suffix: 'دج',
            explain: '$117 \\times 5 = 585$ دج.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'الثمن الكلّي للطبع والدهن:', expected: 1557, suffix: 'دج',
            explain: '$972 + 585 = 1557$ دج.' },
          { kind: 'choice', role: 'conclude', ask: 2,
            prompt: 'هل تكفي أنس 1500 دج؟',
            options: [
              'لا: $1557 > 1500$ ، وينقصه $1557 - 1500 = 57$ دج',
              'نعم: يبقى له 57 دج',
              'نعم: لأنّ ثمن الراتنج وحده $972 < 1500$',
            ],
            correct: 0,
            explain: 'نقارن الثمن الكلّي بالمبلغ: $1557 > 1500$ ، والفرق $1557 - 1500 = 57$ دج ينقص أنس.' },
          { kind: 'solution', lines: [
            'ثمن الراتنج: $81 \\times 12 = 972$ دج، وثمن الدهن: $117 \\times 5 = 585$ دج.',
            'الثمن الكلّي: $972 + 585 = 1557$ دج، و $1557 > 1500$ .',
            'لا تكفي أنس 1500 دج: ينقصه $1557 - 1500 = 57$ دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    tone: 'teal',
    title: 'مسألة 2 — مجسّم النصب التذكاري',
    context: 'نادي التاريخ يصنع مجسّما مصغّرا لنصب الشهداء',
    emoji: '🏛️',
    source: SOURCE,
    statement: 'في ساحة بلديتنا نصب تذكاري للشهداء على شكل هرم منتظم $SABCD$ قاعدته المربع $ABCD$ الذي طول ضلعه $6\\,\\mathrm{m}$ ، وارتفاعه $SO = 4\\,\\mathrm{m}$ ، كما في الشكل المقابل؛ مساحة أوجهه الجانبية الأربعة $60\\,\\mathrm{m}^2$ وحجمه $48\\,\\mathrm{m}^3$ ، ودُشّن سنة 1984. وفاءً للشهداء، يصنع نادي التاريخ في المتوسطة مجسّما مصغّرا للنصب ارتفاعه $20\\,\\mathrm{cm}$ ، لمعرض يدوم 3 أيام. يُصبّ المجسّم مملوءا بالجبس: كيس الجبس يكفي لـ $2{,}5\\,\\mathrm{L}$ ويُباع بـ 180 دج.',
    figure: FIG_MONUMENT,
    data: [
      { id: 'monument', text: 'النصب هرم منتظم قاعدته مربع ضلعه 6 m وارتفاعه 4 m', useful: true },
      { id: 'measures', text: 'مساحة أوجهه الجانبية 60 m² وحجمه 48 m³', useful: true },
      { id: 'model', text: 'ارتفاع المجسّم 20 cm', useful: true },
      { id: 'plaster', text: 'كيس الجبس يكفي لـ 2,5 L ويُباع بـ 180 دج', useful: true },
      { id: 'year', text: 'دُشّن النصب سنة 1984', useful: false },
      { id: 'days', text: 'المعرض يدوم 3 أيام', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'نسبة التصغير وقاعدة المجسّم',
        question: 'احسب نسبة التصغير $k$ من النصب إلى المجسّم، ثم احسب طول ضلع قاعدة المجسّم.',
        asks: ['نسبة التصغير $k$', 'طول ضلع قاعدة المجسّم'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tariqat-k'],
            prompt: 'لإيجاد نسبة التصغير $k$ نقسم:',
            options: [
              'ارتفاع المجسّم على ارتفاع النصب، بعد كتابتهما بنفس الوحدة',
              'ارتفاع النصب على ارتفاع المجسّم',
              'العدد 20 على العدد 4 مباشرة',
            ],
            correct: 0,
            explain: 'النسبة $k$ هي حاصل قسمة طول في المجسّم الناتج (المجسّم) على الطول الموافق له في المجسّم الأصلي (النصب)، والطولان بنفس الوحدة.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'ارتفاع النصب بالسنتيمتر:', expected: 400, suffix: 'cm',
            explain: '$1\\,\\mathrm{m} = 100\\,\\mathrm{cm}$ ، إذن $4\\,\\mathrm{m} = 400\\,\\mathrm{cm}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tariqat-k'],
            prompt: 'نسبة التصغير:',
            options: [
              '$k = \\dfrac{20}{400} = \\dfrac{1}{20}$',
              '$k = \\dfrac{20}{4} = 5$',
              '$k = \\dfrac{400}{20} = 20$',
            ],
            correct: 0, cols: 3,
            explain: '$k = \\dfrac{20}{400} = \\dfrac{1}{20}$ ، و $k < 1$ : تصغير. القسمة على 4 تقسم سنتيمترات على أمتار، و 20 هي نسبة التكبير من المجسّم إلى النصب.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tariqat-maqadir'],
            prompt: 'طول ضلع قاعدة المجسّم:', expected: 30, suffix: 'cm',
            explain: '$6\\,\\mathrm{m} = 600\\,\\mathrm{cm}$ ، و $\\dfrac{1}{20} \\times 600 = 30$ .' },
          { kind: 'solution', lines: [
            '$4\\,\\mathrm{m} = 400\\,\\mathrm{cm}$ ، إذن $k = \\dfrac{20}{400} = \\dfrac{1}{20}$ ، و $k < 1$ : تصغير.',
            'الأطوال تُضرب في $k$ : $\\dfrac{1}{20} \\times 600 = 30$ .',
            'نسبة التصغير $\\dfrac{1}{20}$ ، وطول ضلع قاعدة المجسّم $30\\,\\mathrm{cm}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'مساحة الأوجه الجانبية للمجسّم',
        question: 'احسب مساحة الأوجه الجانبية للمجسّم بالسنتيمتر المربع. كم مرّة تفوق مساحةُ الأوجه الجانبية للنصب مساحةَ الأوجه الجانبية للمجسّم؟',
        asks: ['مساحة الأوجه الجانبية للمجسّم', 'كم مرّة تفوقها مساحة أوجه النصب؟'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['takbir-khassiya'],
            prompt: 'مساحة الأوجه الجانبية للمجسّم تساوي مساحة الأوجه الجانبية للنصب مضروبة في:',
            options: [
              '$k^2 = \\left(\\dfrac{1}{20}\\right)^2$',
              '$k = \\dfrac{1}{20}$',
              '$k^3 = \\left(\\dfrac{1}{20}\\right)^3$',
            ],
            correct: 0, cols: 3,
            explain: 'المساحة بعدان، وكل بعد يُضرب في $\\dfrac{1}{20}$ : $\\dfrac{1}{20} \\times \\dfrac{1}{20} = \\dfrac{1}{400}$ .' },
          { kind: 'numeric', role: 'compute',
            prompt: 'مساحة الأوجه الجانبية للنصب بالسنتيمتر المربع:', expected: 600000, suffix: 'cm²',
            explain: '$1\\,\\mathrm{m}^2 = 100 \\times 100 = 10000\\,\\mathrm{cm}^2$ ، إذن $60\\,\\mathrm{m}^2 = 60 \\times 10000 = 600000\\,\\mathrm{cm}^2$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-maqadir'],
            prompt: 'مساحة الأوجه الجانبية للمجسّم:', expected: 1500, suffix: 'cm²',
            explain: '$\\dfrac{1}{400} \\times 600000 = 1500$ .' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'عدد المرّات:', expected: 400,
            explain: '$\\dfrac{600000}{1500} = 400 = 20^2$ : مساحة النصب تفوق مساحة المجسّم $20^2$ مرّة، لا 20 مرّة.' },
          { kind: 'solution', lines: [
            'المساحات تُضرب في $k^2 = \\left(\\dfrac{1}{20}\\right)^2 = \\dfrac{1}{400}$ .',
            '$60\\,\\mathrm{m}^2 = 600000\\,\\mathrm{cm}^2$ ، إذن مساحة الأوجه الجانبية للمجسّم $\\dfrac{600000}{400} = 1500\\,\\mathrm{cm}^2$ .',
            'مساحة الأوجه الجانبية للنصب تفوق مساحة أوجه المجسّم $20^2 = 400$ مرّة.',
          ] },
        ],
      },
      {
        label: '3)', title: 'صبّ المجسّم بالجبس',
        question: 'احسب حجم المجسّم باللتر. كم كيسا من الجبس يلزم النادي؟ وكم يدفع ثمنا لها؟',
        asks: ['حجم المجسّم باللتر', 'عدد أكياس الجبس', 'الثمن المدفوع'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tariqat-maqadir'],
            prompt: 'حجم المجسّم بالمتر المكعب:',
            options: [
              '$\\mathcal{V}\' = \\left(\\dfrac{1}{20}\\right)^3 \\times 48$',
              '$\\mathcal{V}\' = \\dfrac{1}{20} \\times 48$',
              '$\\mathcal{V}\' = \\left(\\dfrac{1}{20}\\right)^2 \\times 48$',
            ],
            correct: 0,
            explain: 'الحجوم تُضرب في $k^3$ . الضرب في $\\dfrac{1}{20}$ يعطي $2{,}4\\,\\mathrm{m}^3$ : مجسّم لا يحمله تلميذ!' },
          { kind: 'numeric', role: 'compute',
            prompt: 'العدد $20^3$ :', expected: 8000,
            explain: '$20^3 = 20 \\times 20 \\times 20 = 8000$ .' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'حجم المجسّم باللتر:', expected: 6, suffix: 'L',
            explain: '$\\dfrac{48}{8000} = 0{,}006$ ، و $0{,}006\\,\\mathrm{m}^3 = 6\\,\\mathrm{dm}^3$ ، و $1\\,\\mathrm{dm}^3 = 1\\,\\mathrm{L}$ . تحقّق بأبعاد المجسّم: $\\dfrac{1}{3} \\times 30 \\times 30 \\times 20 = 6000\\,\\mathrm{cm}^3$ .' },
          { kind: 'numeric', role: 'compute',
            prompt: 'حاصل قسمة حجم المجسّم على ما يكفيه كيس واحد:', expected: 2.4,
            explain: '$6 \\div 2{,}5 = 2{,}4$ .' },
          { kind: 'choice', role: 'conclude',
            prompt: 'ماذا يعني هذا الحاصل في الوضعية؟',
            options: [
              'كيسان لا يكفيان: يلزم كيس ثالث',
              'يلزم كيسان ويبقى شيء من الجبس',
              'يلزم 24 كيسا',
            ],
            correct: 0,
            explain: 'كيسان يكفيان لـ $2 \\times 2{,}5 = 5$ لترات فقط، و $5 < 6$ : نشتري كيسا ثالثا ويبقى منه جبس.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'عدد أكياس الجبس:', expected: 3,
            explain: 'أصغر عدد طبيعي أكبر من $2{,}4$ هو 3.' },
          { kind: 'numeric', role: 'answer', ask: 2,
            prompt: 'الثمن المدفوع:', expected: 540, suffix: 'دج',
            explain: '$3 \\times 180 = 540$ دج.' },
          { kind: 'solution', lines: [
            '$\\mathcal{V}\' = \\left(\\dfrac{1}{20}\\right)^3 \\times 48 = \\dfrac{48}{8000} = 0{,}006\\,\\mathrm{m}^3$ ، أي $6\\,\\mathrm{L}$ .',
            '$6 \\div 2{,}5 = 2{,}4$ : كيسان لا يكفيان، فيلزم 3 أكياس.',
            'يدفع النادي $3 \\times 180 = 540$ دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    tone: 'rose',
    title: 'مسألة 3 — حوض الأسماك المكبَّر',
    context: 'سمير يكبّر حوض أسماكه',
    emoji: '🐠',
    source: SOURCE,
    statement: 'يحرص سمير على الرفق بالحيوان وعلى نظافة حوض أسماكه، وهو حوض زجاجي على شكل متوازي مستطيلات مفتوح من الأعلى، أبعاده الداخلية: الطول $40\\,\\mathrm{cm}$ والعرض $20\\,\\mathrm{cm}$ والارتفاع $30\\,\\mathrm{cm}$ ، كما في الشكل المقابل؛ اشتراه قبل سنتين بـ 6500 دج. في الحوض 8 أسماك، وهو العدد الذي ينصح به البائع: سمكة واحدة لكل $3\\,\\mathrm{L}$ من الماء. طلب سمير من محلّ لأسماك الزينة بمستغانم، يفتح على الساعة 9 صباحا، حوضا جديدا هو تكبير لحوضه بالنسبة $k = \\dfrac{3}{2}$ ، سينقل إليه أسماكه الثمانية ثم يكمله بأسماك من نفس النوع ثمن الواحدة 120 دج.',
    figure: FIG_AQUARIUM,
    data: [
      { id: 'dims', text: 'أبعاد الحوض 40 cm و 20 cm و 30 cm، مفتوح من الأعلى', useful: true },
      { id: 'k', text: 'الحوض الجديد تكبير بالنسبة ثلاثة أنصاف', useful: true },
      { id: 'rule', text: 'سمكة واحدة لكل 3 L، وفي الحوض 8 أسماك', useful: true },
      { id: 'price', text: 'ثمن السمكة 120 دج', useful: true },
      { id: 'old', text: 'ثمن الحوض القديم 6500 دج', useful: false },
      { id: 'hour', text: 'يفتح المحلّ على الساعة 9', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'سعة الحوضين',
        question: 'ما سعة حوض سمير باللتر؟ احسب سعة الحوض الجديد دون أن تحسب أبعاده.',
        asks: ['سعة حوض سمير', 'سعة الحوض الجديد'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute',
            prompt: 'حجم حوض سمير بالسنتيمتر المكعب:', expected: 24000, suffix: 'cm³',
            explain: '$40 \\times 20 \\times 30 = 24000$ .' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'سعة حوض سمير:', expected: 24, suffix: 'L',
            explain: '$1\\,\\mathrm{L} = 1000\\,\\mathrm{cm}^3$ ، و $24000 \\div 1000 = 24$ .' },
          { kind: 'choice', role: 'translate', requires: ['takbir-khassiya'],
            prompt: 'سعة الحوض الجديد تساوي سعة حوض سمير مضروبة في:',
            options: [
              '$\\left(\\dfrac{3}{2}\\right)^3 = \\dfrac{27}{8}$',
              '$\\dfrac{3}{2}$',
              '$\\left(\\dfrac{3}{2}\\right)^2 = \\dfrac{9}{4}$',
            ],
            correct: 0, cols: 3,
            explain: 'السعة حجم: ثلاثة أبعاد، كل منها يُضرب في $\\dfrac{3}{2}$ ، إذن تُضرب السعة في $\\dfrac{3}{2} \\times \\dfrac{3}{2} \\times \\dfrac{3}{2} = \\dfrac{27}{8}$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tariqat-maqadir'],
            prompt: 'سعة الحوض الجديد:', expected: 81, suffix: 'L',
            explain: '$\\dfrac{27}{8} \\times 24 = 27 \\times 3 = 81$ ، وتحقّق بالأبعاد $60$ و $30$ و $45$ : $60 \\times 30 \\times 45 = 81000$ ، أي $81\\,\\mathrm{L}$ .' },
          { kind: 'solution', lines: [
            '$\\mathcal{V} = 40 \\times 20 \\times 30 = 24000\\,\\mathrm{cm}^3$ ، أي $24\\,\\mathrm{L}$ .',
            'الحجوم تُضرب في $k^3 = \\left(\\dfrac{3}{2}\\right)^3 = \\dfrac{27}{8}$ .',
            'سعة الحوض الجديد: $\\dfrac{27}{8} \\times 24 = 81$ ، أي $81\\,\\mathrm{L}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'زجاج الحوض الجديد',
        question: 'احسب مساحة زجاج حوض سمير (خمسة أوجه، لأنه مفتوح من الأعلى). استنتج مساحة زجاج الحوض الجديد.',
        asks: ['مساحة زجاج حوض سمير', 'مساحة زجاج الحوض الجديد'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['masaha-kulliya'],
            prompt: 'مساحة زجاج حوض سمير:', expected: 4400, suffix: 'cm²',
            explain: 'القاع $40 \\times 20 = 800$ ، ووجهان $40 \\times 30 = 1200$ ، ووجهان $20 \\times 30 = 600$ : $800 + 2 \\times 1200 + 2 \\times 600 = 4400$ .' },
          { kind: 'choice', role: 'conclude', requires: ['takbir-khassiya'],
            prompt: 'قال عامل المحلّ: «الأحرف زادت بنصفها، فالزجاج يزيد بنصفه أيضا». مساحة الزجاج في الحقيقة تُضرب في:',
            options: [
              '$\\left(\\dfrac{3}{2}\\right)^2 = \\dfrac{9}{4}$ ، أي أكثر من الضعف',
              '$\\dfrac{3}{2}$ ، كما قال العامل',
              '$\\left(\\dfrac{3}{2}\\right)^3 = \\dfrac{27}{8}$ ، مثل السعة',
            ],
            correct: 0,
            explain: 'كل لوح زجاج له بعدان، وكل بعد يُضرب في $\\dfrac{3}{2}$ : المساحات تُضرب في $\\dfrac{9}{4} = 2{,}25$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tariqat-maqadir'],
            prompt: 'مساحة زجاج الحوض الجديد:', expected: 9900, suffix: 'cm²',
            explain: '$\\dfrac{9}{4} \\times 4400 = 9 \\times 1100 = 9900$ ، وتحقّق: $60 \\times 30 + 2 \\times 60 \\times 45 + 2 \\times 30 \\times 45 = 9900$ .' },
          { kind: 'solution', lines: [
            'مساحة زجاج حوض سمير: $40 \\times 20 + 2 \\times 40 \\times 30 + 2 \\times 20 \\times 30 = 4400\\,\\mathrm{cm}^2$ .',
            'المساحات تُضرب في $k^2 = \\dfrac{9}{4}$ : $\\dfrac{9}{4} \\times 4400 = 9900\\,\\mathrm{cm}^2$ .',
            'زجاج الحوض الجديد $9900\\,\\mathrm{cm}^2$ ، لا $1{,}5 \\times 4400 = 6600\\,\\mathrm{cm}^2$ كما ظنّ العامل.',
          ] },
        ],
      },
      {
        label: '3)', title: 'أسماك الحوض الجديد',
        question: 'كم سمكة يمكن أن يضع سمير في الحوض الجديد حسب نصيحة البائع؟ احسب ثمن الأسماك التي يشتريها بعد أن ينقل أسماكه الثمانية.',
        asks: ['عدد الأسماك في الحوض الجديد', 'ثمن الأسماك المشتراة'],
        steps: [
          { kind: 'choice', role: 'conclude',
            prompt: 'قال سمير: «الحوض كبُر بالنسبة $\\dfrac{3}{2}$ ، فأضع فيه $8 \\times \\dfrac{3}{2} = 12$ سمكة». هذا الاستدلال:',
            options: [
              'خاطئ: عدد الأسماك يتبع سعة الماء، والسعة ضُربت في $\\dfrac{27}{8}$ لا في $\\dfrac{3}{2}$',
              'صحيح: كل مقادير الحوض تُضرب في $k$',
              'خاطئ: يجب الضرب في $\\dfrac{9}{4}$ لأنّ الأسماك تحتاج مساحة القاع',
            ],
            correct: 0,
            explain: 'النصيحة سمكة لكل $3\\,\\mathrm{L}$ : العدد يتبع الحجم، والحجوم تُضرب في $k^3$ .' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'عدد الأسماك في الحوض الجديد:', expected: 27,
            explain: '$81 \\div 3 = 27$ ، أو $\\dfrac{27}{8} \\times 8 = 27$ .' },
          { kind: 'numeric', role: 'compute',
            prompt: 'عدد الأسماك التي يشتريها:', expected: 19,
            explain: '$27 - 8 = 19$ : الأسماك الثمانية تنتقل معه.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ثمن الأسماك المشتراة:', expected: 2280, suffix: 'دج',
            explain: '$19 \\times 120 = 2280$ دج.' },
          { kind: 'solution', lines: [
            'سمكة لكل $3\\,\\mathrm{L}$ : $81 \\div 3 = 27$ ، يمكن أن يضع 27 سمكة في الحوض الجديد.',
            'ينقل 8 أسماك ويشتري $27 - 8 = 19$ سمكة.',
            'يدفع سمير $19 \\times 120 = 2280$ دج.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
