/**
 * Les trois « مسائل » du درس 4 de l'unité 7 (modules 4, 5, 6) — des exercices COMPLETS de type
 * امتحان, résolus pas à pas (common/problems/GuidedProblem.jsx).
 *
 * AJOUTS DE LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`) : le manuel ne les
 * contient pas. Ils restent dans le périmètre de la leçon : écrire chaque équation sous la forme
 * y = ax + b et l'attacher à sa droite, lire le حل comme les coordonnées du point d'intersection
 * (abscisse d'abord), le VÉRIFIER par le calcul, reconnaître qu'un point d'UNE seule droite n'est pas
 * une solution, et le cas « droites parallèles » sans dessin — avec les acquis antérieurs (traduire
 * une situation en جملة, isoler y, image par une fonction affine, résoudre une équation du 1er degré).
 * Les deux droites sont DESSINÉES (`visual`, CoordPlane comme la pratique) et se coupent sur un
 * nœud de la grille. La comparaison « laquelle est moins chère » ne se fait QUE par la position des
 * droites de part et d'autre de l'intersection et par des images calculées — jamais par une
 * inéquation (l'étude de deux tarifs est le درس tarrid-taalufi).
 *
 * La مسألة 1 est « مسألة الدرس » : son énoncé vit dans `LESSON_CONFIG.lessonProblem` (montré dès le
 * sommaire et rappelé au module 1), prolongement du lab متقدم « صندوق القسم » (des pièces de deux
 * valeurs, un nombre de pièces et une somme : deux droites, un point) avec d'autres nombres.
 * Les مسائل 2 et 3 (contextes réservés à cette leçon) : deux services de livraison de colis, et
 * deux puis trois imprimeries pour les cartes d'invitation d'un mariage (le cas parallèle).
 *
 * Chaque nombre est vérifié par calcul dans ./problems.test.js.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');
/** Une جملة en LaTeX. */
const sys = (a, b) => `$\\begin{cases} ${a} \\\\ ${b} \\end{cases}$`;

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — صندوق نادي البيئة',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🪙',
    source: SOURCE,
    statement: LESSON_CONFIG.lessonProblem.statement,
    // (d₁) : y = −x + 40 ; (d₂) : y = −(2/5)x + 25 — sécantes en (25 ; 15), un nœud de la grille.
    visual: LESSON_CONFIG.lessonProblem.visual,
    data: [
      { id: 'count', text: 'عدد القطع في الصندوق: 40 قطعة', useful: true },
      { id: 'sum', text: 'مبلغ الصندوق: 1250 دج', useful: true },
      { id: 'kinds', text: 'فئتا القطع: 20 دج و 50 دج', useful: true },
      { id: 'unknowns', text: 'المجهولان: عدد قطع 20 دج وعدد قطع 50 دج', useful: true },
      { id: 'members', text: 'في النادي 18 عضوًا', useful: false },
      { id: 'day', text: 'يجتمع النادي كل يوم ثلاثاء', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مستقيمان ونقطة',
        question: 'اكتب كل شرط من شرطي الصندوق على الشكل $y = ax + b$ ، وأرفق كل معادلة بمستقيمها في التمثيل البياني المرفق، ثم اقرأ إحداثيتي نقطة تقاطع المستقيمين. كم قطعة من فئة 20 دج في الصندوق؟ وكم قطعة من فئة 50 دج؟',
        asks: ['عدد قطع 20 دج', 'عدد قطع 50 دج'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tarjama-jumla'],
            prompt: 'عدد القطع ومبلغ الصندوق يُترجمان بالجملة:',
            options: [
              sys('x + y = 40', '20x + 50y = 1250'),
              sys('x + y = 1250', '20x + 50y = 40'),
              sys('x + y = 40', '50x + 20y = 1250'),
              sys('x + y = 40', '20x + 50y = 40'),
            ],
            correct: 0, cols: 2,
            explain: 'عدد القطع: $x + y = 40$. قطع 20 دج تعطي $20x$ وقطع 50 دج تعطي $50y$ : المبلغ $20x + 50y = 1250$. أمّا $50x + 20y$ فيعطي قطع 20 دج قيمة 50 دج.' },
          { kind: 'choice', role: 'conclude', requires: ['muadala-mustaqim', 'azl-y'],
            prompt: 'المعادلة (2) تُكتب على الشكل $y = ax + b$ :',
            options: ['$y = -\\dfrac{2}{5}x + 25$', '$y = \\dfrac{2}{5}x + 25$', '$y = -20x + 1250$', '$y = -\\dfrac{2}{5}x + 1250$'],
            correct: 0, cols: 2,
            explain: '$50y = -20x + 1250$ ، ثم نقسم كل الحدود على 50: $y = -\\dfrac{20}{50}x + \\dfrac{1250}{50} = -\\dfrac{2}{5}x + 25$. الثانية تنسى تغيير الإشارة، والثالثة تنسى القسمة، والرابعة تقسم حدًّا واحدًا.' },
          { kind: 'choice', role: 'conclude', requires: ['tamthil-taalufi'],
            prompt: 'المستقيم الذي يمثّل المعادلة (2) في التمثيل البياني هو:',
            options: [
              '$(d_2)$ ، لأنّه يقطع محور التراتيب في النقطة $(0 ; 25)$',
              '$(d_1)$ ، لأنّ المبلغ 1250 أكبر من عدد القطع 40',
              '$(d_1)$ ، لأنّه يقطع محور التراتيب في النقطة $(0 ; 40)$',
            ],
            correct: 0,
            explain: 'صورة 0 بالدالة $x \\longmapsto -\\dfrac{2}{5}x + 25$ هي 25: مستقيم المعادلة (2) يمرّ بالنقطة $(0 ; 25)$ ، وهو $(d_2)$. أمّا $(0 ; 40)$ فنقطة المعادلة (1): $y = -x + 40$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-taqatu'],
            prompt: 'فاصلة نقطة تقاطع المستقيمين، أي عدد قطع 20 دج:', expected: 25, suffix: 'قطعة',
            explain: 'المستقيمان يتقاطعان في النقطة التي فاصلتها 25: الفاصلة هي قيمة $x$ ، عدد قطع 20 دج.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hall-taqatu'],
            prompt: 'ترتيب نقطة التقاطع، أي عدد قطع 50 دج:', expected: 15, suffix: 'قطعة',
            explain: 'ترتيب نقطة التقاطع 15، والنقطة على المستقيمين معًا: $-25 + 40 = 15$ و $-\\dfrac{2}{5} \\times 25 + 25 = -10 + 25 = 15$.' },
          { kind: 'solution', ask: 0, lines: [
            '(1): $x + y = 40$ تعطي $y = -x + 40$ ؛ (2): $50y = -20x + 1250$ ، ومنه $y = -\\dfrac{2}{5}x + 25$.',
            'المستقيم $(d_1)$ يمثّل (1) لأنّه يقطع محور التراتيب في 40، و $(d_2)$ يمثّل (2)؛ ويتقاطعان في النقطة $(25 ; 15)$.',
            'في الصندوق 25 قطعة من فئة 20 دج و 15 قطعة من فئة 50 دج.',
          ] },
        ],
      },
      {
        label: '2)', title: 'نتحقّق بالحساب',
        question: 'تحقّق بالحساب من الثنائية التي قرأتها في السؤال 1: هل تحقّق شرطي الصندوق معًا؟ قرأت سلمى على الشكل النقطة $(30 ; 10)$ من المستقيم $(d_1)$ وقالت: «في الصندوق 30 قطعة من فئة 20 دج و 10 قطع من فئة 50 دج». هل الثنائية $(30 ; 10)$ حلّ للجملة؟',
        asks: ['هل تحقّق الثنائية المقروءة الشرطين معًا؟', 'هل $(30 ; 10)$ حلّ للجملة؟'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['thunaiya-hall'],
            prompt: 'المبلغ $20x + 50y$ الذي تعطيه الثنائية التي قرأتها:', expected: 1250, suffix: 'دج',
            explain: '$20 \\times 25 + 50 \\times 15 = 500 + 750 = 1250$ ، وعدد القطع $25 + 15 = 40$.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hall-bayani'],
            prompt: 'هل تحقّق الثنائية التي قرأتها شرطي الصندوق معًا؟',
            options: [
              'نعم: $25 + 15 = 40$ و $20 \\times 25 + 50 \\times 15 = 1250$ ، فالقراءة صحيحة',
              'نعم، ويكفي الشرط الأول: $25 + 15 = 40$',
              'لا حاجة إلى الحساب: ما نقرؤه على الشكل صحيح دائمًا',
            ],
            correct: 0,
            explain: 'نعوّض $x$ بالفاصلة 25 و $y$ بالترتيب 15 في المعادلتين معًا. الشرط الأول وحده لا يكفي، والقراءة على الشكل قد تكون تقريبية: الحساب هو الذي يؤكّدها.' },
          { kind: 'numeric', role: 'compute', requires: ['thunaiya-hall'],
            prompt: 'المبلغ $20x + 50y$ الذي تعطيه ثنائية سلمى:', expected: 1100, suffix: 'دج',
            explain: '$20 \\times 30 + 50 \\times 10 = 600 + 500 = 1100$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['hall-taqatu', 'thunaiya-hall'],
            prompt: 'هل الثنائية $(30 ; 10)$ حلّ للجملة؟',
            options: [
              'لا: تحقّق المعادلة (1) وحدها، لأنّ $1100 \\neq 1250$ ؛ النقطة على $(d_1)$ وليست على $(d_2)$',
              'نعم: النقطة على المستقيم $(d_1)$ ، وهذا يكفي',
              'نعم: لأنّ $30 + 10 = 40$',
              'لا: لا تحقّق أيّ معادلة من المعادلتين',
            ],
            correct: 0,
            explain: '$30 + 10 = 40$ : المعادلة (1) محقّقة، لكنّ $20 \\times 30 + 50 \\times 10 = 1100$ و $1100 \\neq 1250$. حلّ الجملة نقطة على المستقيمين معًا: نقطة تقاطعهما وحدها.' },
          { kind: 'solution', ask: 0, lines: [
            '$25 + 15 = 40$ و $20 \\times 25 + 50 \\times 15 = 500 + 750 = 1250$ : الثنائية $(25 ; 15)$ تحقّق المعادلتين، فالقراءة صحيحة.',
            '$30 + 10 = 40$ لكنّ $20 \\times 30 + 50 \\times 10 = 600 + 500 = 1100$ و $1100 \\neq 1250$.',
            'النقطة $(30 ; 10)$ على $(d_1)$ وحده: ليست حلًّا للجملة، وقراءة سلمى خاطئة.',
          ] },
        ],
      },
      {
        label: '3)', title: 'حاويتا الفرز',
        question: 'يريد النادي شراء حاويتين لفرز النفايات ثمنهما معًا 2000 دج، فيُكمل المبلغ بقطع من فئة 50 دج فقط. كم قطعة من فئة 50 دج يجب أن يضيف؟ وكم قطعة من فئة 50 دج يصبح في الصندوق؟',
        asks: ['عدد قطع 50 دج المضافة', 'عدد قطع 50 دج في الصندوق بعد الإضافة'],
        steps: [
          { kind: 'numeric', role: 'compute',
            prompt: 'المبلغ الذي ينقص الصندوق:', expected: 750, suffix: 'دج',
            explain: '$2000 - 1250 = 750$.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'عدد قطع 50 دج التي يجب إضافتها:', expected: 15, suffix: 'قطعة',
            explain: '$750 = 50 \\times 15$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hall-taqatu'],
            prompt: 'عدد قطع 50 دج في الصندوق بعد الإضافة:', expected: 30, suffix: 'قطعة',
            explain: 'كانت في الصندوق 15 قطعة من فئة 50 دج (ترتيب نقطة التقاطع)، ويُضاف مثلها: $15 + 15 = 30$.' },
          { kind: 'choice', role: 'conclude', requires: ['thunaiya-hall', 'tarjama-jumla'],
            prompt: 'محتوى الصندوق الجديد حلّ للجملة:',
            options: [
              sys('x + y = 55', '20x + 50y = 2000'),
              sys('x + y = 40', '20x + 50y = 2000'),
              sys('x + y = 55', '20x + 50y = 1250'),
            ],
            correct: 0, cols: 1,
            explain: 'تغيّر الشرطان معًا: عدد القطع $25 + 30 = 55$ والمبلغ $20 \\times 25 + 50 \\times 30 = 500 + 1500 = 2000$. الجملة الثانية تنسى القطع المضافة، والثالثة تنسى المبلغ الجديد.' },
          { kind: 'solution', ask: 0, lines: [
            'ينقص $2000 - 1250 = 750$ دج، و $750 = 50 \\times 15$.',
            'التحقق: $25 + 30 = 55$ قطعة، و $20 \\times 25 + 50 \\times 30 = 500 + 1500 = 2000$.',
            'يضيف النادي 15 قطعة من فئة 50 دج، فيصبح في الصندوق $15 + 15 = 30$ قطعة من هذه الفئة.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — توصيل الطرود',
    context: 'خدمتان للتوصيل: متى تتساوى التسعيرتان؟',
    emoji: '📦',
    source: SOURCE,
    statement: 'تصنع حرفية من تيزي وزو، تحافظ بإتقان على تراث الوطن، أواني فخّارية وترسلها إلى زبائنها في الولايات الأخرى في طرود. تقترح عليها خدمتان للتوصيل تسعيرتين: الخدمة A تأخذ 200 دج عن كل طرد ثم 60 دج عن كل كيلوغرام، والخدمة B تأخذ 500 دج عن كل طرد ثم 30 دج عن كل كيلوغرام. يصل الطرد في 48 ساعة في الخدمتين. نرمز بـ $x$ إلى كتلة الطرد بالكيلوغرام وبـ $y$ إلى ثمن إرساله بالدينار. يمثّل المستقيمان $(d_1)$ و $(d_2)$ في التمثيل البياني المرفق ثمني الإرسال في الخدمتين.',
    // (d₁) = A : y = 60x + 200 ; (d₂) = B : y = 30x + 500 — sécantes en (10 ; 800), un nœud de la grille.
    visual: {
      range: { xMin: 0, xMax: 16, yMin: 0, yMax: 1200 },
      unit: 26,
      unitY: 0.35,
      functions: [
        { id: 'd1', a: 60, b: 200, label: '(d₁)', tone: 'indigo' },
        { id: 'd2', a: 30, b: 500, label: '(d₂)', tone: 'amber' },
      ],
      xStep: 1,
      yStep: 100,
      frozen: true,
      ariaLabel: 'التمثيل البياني المرفق: المستقيم (d₁) يقطع محور التراتيب في 200، والمستقيم (d₂) يقطعه في 500',
      caption: false,
    },
    data: [
      { id: 'tariffA', text: 'الخدمة A: 200 دج عن الطرد ثم 60 دج عن كل كيلوغرام', useful: true },
      { id: 'tariffB', text: 'الخدمة B: 500 دج عن الطرد ثم 30 دج عن كل كيلوغرام', useful: true },
      { id: 'x', text: 'المجهول الأول: كتلة الطرد بالكيلوغرام', useful: true },
      { id: 'y', text: 'المجهول الثاني: ثمن الإرسال بالدينار', useful: true },
      { id: 'delay', text: 'يصل الطرد في 48 ساعة', useful: false },
      { id: 'city', text: 'الحرفية من تيزي وزو', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'متى يتساوى الثمنان؟',
        question: 'اكتب ثمن الإرسال في كل خدمة على الشكل $y = ax + b$ ، ثم اقرأ إحداثيتي نقطة تقاطع المستقيمين في التمثيل البياني المرفق وتحقّق منهما بالحساب. ما كتلة الطرد التي يتساوى عندها ثمنا الخدمتين؟ وما هذا الثمن؟',
        asks: ['الكتلة التي يتساوى عندها الثمنان', 'الثمن المشترك'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tarjama-jumla', 'dala-taalufiya'],
            prompt: 'ثمنا الإرسال في الخدمتين يُترجمان بالجملة:',
            options: [
              sys('y = 60x + 200', 'y = 30x + 500'),
              sys('y = 200x + 60', 'y = 500x + 30'),
              sys('y = 60x + 500', 'y = 30x + 200'),
              sys('y = 260x', 'y = 530x'),
            ],
            correct: 0, cols: 2,
            explain: 'في الخدمة A: 60 دج لكل كيلوغرام، أي $60x$ ، ثم 200 دج عن الطرد: $y = 60x + 200$. وفي الخدمة B: $y = 30x + 500$. ما يُدفع عن الطرد لا يُضرب في الكتلة.' },
          { kind: 'choice', role: 'conclude', requires: ['tamthil-taalufi', 'muadala-mustaqim'],
            prompt: 'المستقيم الذي يمثّل الخدمة A في التمثيل البياني هو:',
            options: [
              '$(d_1)$ : يقطع محور التراتيب في $(0 ; 200)$ ، وهو الأشدّ صعودًا لأنّ معامل توجيهه 60',
              '$(d_2)$ : يقطع محور التراتيب في $(0 ; 500)$',
              '$(d_2)$ : لأنّ ثمن الكيلوغرام في الخدمة A أكبر، فمستقيمها أعلى دائمًا',
            ],
            correct: 0,
            explain: 'صورة 0 بالدالة $x \\longmapsto 60x + 200$ هي 200، ومعامل توجيهها 60 أكبر من 30. النقطة $(0 ; 500)$ للخدمة B، ومستقيم A ليس أعلى دائمًا: هو تحت مستقيم B قبل نقطة التقاطع.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-taqatu'],
            prompt: 'فاصلة نقطة التقاطع، أي الكتلة:', expected: 10, suffix: 'kg',
            explain: 'المستقيمان يتقاطعان في النقطة التي فاصلتها 10: الفاصلة هي قيمة $x$ ، كتلة الطرد.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hall-taqatu'],
            prompt: 'ترتيب نقطة التقاطع، أي الثمن:', expected: 800, suffix: 'دج',
            explain: 'ترتيب نقطة التقاطع 800، وهي على المستقيمين معًا: $60 \\times 10 + 200 = 800$ و $30 \\times 10 + 500 = 800$.' },
          { kind: 'numeric', role: 'compute', requires: ['hall-bayani', 'hall-jabri'],
            prompt: 'نتحقّق بالحساب: المساواة $60x + 200 = 30x + 500$ تعطي $30x = \\ldots$', expected: 300,
            explain: '$60x - 30x = 30x$ و $500 - 200 = 300$ ، أي $30x = 300$ ، ومنه $x = \\dfrac{300}{30} = 10$ ، ثم $y = 60 \\times 10 + 200 = 800$ : القراءة صحيحة.' },
          { kind: 'solution', ask: 0, lines: [
            'الخدمة A: $y = 60x + 200$ ؛ الخدمة B: $y = 30x + 500$.',
            'المستقيمان يتقاطعان في $(10 ; 800)$ ، والتحقق: $60 \\times 10 + 200 = 800$ و $30 \\times 10 + 500 = 800$.',
            'لطرد كتلته 10 kg يتساوى ثمنا الخدمتين: 800 دج.',
          ] },
        ],
      },
      {
        label: '2)', title: 'أيّ الخدمتين أرخص؟',
        question: 'أيّ الخدمتين أرخص لطرد كتلته 4 kg؟ وبعد أيّ كتلة تصبح الخدمة B هي الأرخص؟ استعن بموضع المستقيمين في التمثيل البياني.',
        asks: ['الخدمة الأرخص لطرد 4 kg', 'الكتلة التي تصبح B أرخص بعدها'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['dala-taalufiya'],
            prompt: 'ثمن إرسال طرد كتلته 4 kg بالخدمة A:', expected: 440, suffix: 'دج',
            explain: '$60 \\times 4 + 200 = 240 + 200 = 440$.' },
          { kind: 'numeric', role: 'compute', requires: ['dala-taalufiya'],
            prompt: 'ثمن إرسال الطرد نفسه بالخدمة B:', expected: 620, suffix: 'دج',
            explain: '$30 \\times 4 + 500 = 120 + 500 = 620$.' },
          { kind: 'choice', role: 'conclude', ask: 0,
            prompt: 'أيّ الخدمتين أرخص لطرد كتلته 4 kg؟',
            options: [
              'الخدمة A: $440 < 620$ ، ومستقيمها $(d_1)$ تحت $(d_2)$ على يسار نقطة التقاطع',
              'الخدمة B: لأنّ ثمن الكيلوغرام فيها أقلّ',
              'الثمن نفسه في الخدمتين',
            ],
            correct: 0,
            explain: 'نقارن الثمنين لا ثمن الكيلوغرام وحده: $440 < 620$. ما تأخذه B عن الطرد (500 دج) لا يعوّضه ثمن الكيلوغرام الأقلّ في طرد خفيف.' },
          { kind: 'choice', role: 'conclude', requires: ['hall-taqatu'],
            prompt: 'على يمين نقطة تقاطع المستقيمين في التمثيل البياني:',
            options: [
              'المستقيم $(d_2)$ تحت المستقيم $(d_1)$ : ثمن الخدمة B أقلّ',
              'المستقيم $(d_1)$ تحت المستقيم $(d_2)$ : ثمن الخدمة A أقلّ',
              'المستقيمان منطبقان: الثمن نفسه',
            ],
            correct: 0,
            explain: 'المستقيمان يتبادلان موضعيهما عند نقطة التقاطع: لطرد كتلته 12 kg مثلًا، $60 \\times 12 + 200 = 920$ و $30 \\times 12 + 500 = 860$ ، و $860 < 920$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hall-taqatu'],
            prompt: 'تصبح الخدمة B هي الأرخص عندما تتجاوز كتلة الطرد:', expected: 10, suffix: 'kg',
            explain: 'فاصلة نقطة التقاطع 10: عندها يتساوى الثمنان، وبعدها يقع مستقيم B تحت مستقيم A.' },
          { kind: 'solution', ask: 0, lines: [
            'لـ 4 kg: $60 \\times 4 + 200 = 440$ و $30 \\times 4 + 500 = 620$ ، و $440 < 620$ : الخدمة A أرخص.',
            'على يمين نقطة التقاطع $(10 ; 800)$ يقع $(d_2)$ تحت $(d_1)$ ؛ مثلًا لـ 12 kg: $30 \\times 12 + 500 = 860$ و $60 \\times 12 + 200 = 920$.',
            'الخدمة A أرخص لطرد كتلته 4 kg، وتصبح الخدمة B هي الأرخص عندما تتجاوز كتلة الطرد 10 kg.',
          ] },
        ],
      },
      {
        label: '3)', title: 'طرد كل أسبوع',
        question: 'ترسل الحرفية كل أسبوع طردًا كتلته 14 kg. أيّ خدمة تختار؟ وكم دينارًا توفّر بهذا الاختيار في 4 أسابيع؟',
        asks: ['الخدمة التي تختارها', 'ما توفّره في 4 أسابيع'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hall-taqatu'],
            prompt: 'أيّ خدمة تختار لطرد كتلته 14 kg؟',
            options: [
              'الخدمة B: الكتلة 14 kg تتجاوز 10 kg، ومستقيمها تحت مستقيم A بعد نقطة التقاطع',
              'الخدمة A: لأنّ ما تأخذه عن الطرد أقلّ',
              'الخدمة A: لأنّها كانت الأرخص لطرد كتلته 4 kg',
            ],
            correct: 0,
            explain: 'بعد فاصلة نقطة التقاطع 10 تكون الخدمة B هي الأرخص، والكتلة 14 kg بعدها. ما كان صحيحًا لطرد خفيف لا يبقى صحيحًا لطرد ثقيل.' },
          { kind: 'numeric', role: 'compute', requires: ['dala-taalufiya'],
            prompt: 'ثمن الطرد بالخدمة A:', expected: 1040, suffix: 'دج',
            explain: '$60 \\times 14 + 200 = 840 + 200 = 1040$.' },
          { kind: 'numeric', role: 'compute', requires: ['dala-taalufiya'],
            prompt: 'ثمن الطرد بالخدمة B:', expected: 920, suffix: 'دج',
            explain: '$30 \\times 14 + 500 = 420 + 500 = 920$.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'ما توفّره في أسبوع واحد:', expected: 120, suffix: 'دج',
            explain: 'الفرق بين الثمنين: $1040 - 920 = 120$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ما توفّره في 4 أسابيع:', expected: 480, suffix: 'دج',
            explain: '$4 \\times 120 = 480$.' },
          { kind: 'solution', ask: 0, lines: [
            '$14 > 10$ : بعد نقطة التقاطع تكون الخدمة B هي الأرخص.',
            'A: $60 \\times 14 + 200 = 1040$ ؛ B: $30 \\times 14 + 500 = 920$ ؛ الفرق $1040 - 920 = 120$ دج في الأسبوع.',
            'تختار الحرفية الخدمة B، فتوفّر $4 \\times 120 = 480$ دج في 4 أسابيع.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — بطاقات دعوة العرس',
    context: 'مطبعتان ونقطة تقاطع، ثم مطبعة ثالثة',
    emoji: '💌',
    source: SOURCE,
    statement: 'تحضّر عائلة سليم في بجاية لعرس ابنها، وتريد طبع بطاقات دعوة تصل بها أرحامها دون إسراف في النفقات. عرضت عليها مطبعتان: المطبعة A تأخذ 1500 دج لتصميم البطاقة مرة واحدة ثم 30 دج عن كل بطاقة، والمطبعة B لا تأخذ شيئًا للتصميم وتبيع البطاقة بـ 45 دج. قاعة الحفلات تتّسع لـ 400 مدعوّ. نرمز بـ $x$ إلى عدد البطاقات وبـ $y$ إلى الثمن الكلّي بالدينار. يمثّل المستقيمان $(d_1)$ و $(d_2)$ في التمثيل البياني المرفق الثمن الكلّي في المطبعتين.',
    // (d₁) = A : y = 30x + 1500 ; (d₂) = B : y = 45x — sécantes en (100 ; 4500), un nœud de la grille.
    visual: {
      range: { xMin: 0, xMax: 160, yMin: 0, yMax: 8000 },
      unit: 2.8,
      unitY: 0.055,
      functions: [
        { id: 'd1', a: 30, b: 1500, label: '(d₁)', tone: 'indigo' },
        { id: 'd2', a: 45, b: 0, label: '(d₂)', tone: 'amber' },
      ],
      xStep: 20,
      yStep: 500,
      frozen: true,
      ariaLabel: 'التمثيل البياني المرفق: المستقيم (d₁) يقطع محور التراتيب في 1500، والمستقيم (d₂) يشمل المبدأ',
      caption: false,
    },
    data: [
      { id: 'printA', text: 'المطبعة A: 1500 دج للتصميم ثم 30 دج عن كل بطاقة', useful: true },
      { id: 'printB', text: 'المطبعة B: 45 دج عن كل بطاقة دون ثمن للتصميم', useful: true },
      { id: 'x', text: 'المجهول الأول: عدد البطاقات', useful: true },
      { id: 'y', text: 'المجهول الثاني: الثمن الكلّي بالدينار', useful: true },
      { id: 'hall', text: 'قاعة الحفلات تتّسع لـ 400 مدعوّ', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مطبعتان',
        question: 'عبّر عن الثمن الكلّي في كل مطبعة بدلالة $x$ ، ثم اقرأ إحداثيتي نقطة تقاطع المستقيمين في التمثيل البياني المرفق وتحقّق منهما بالحساب. لأيّ عدد من البطاقات يتساوى الثمنان؟ وما هذا الثمن؟',
        asks: ['الثمن الكلّي في كل مطبعة بدلالة $x$', 'عدد البطاقات الذي يتساوى عنده الثمنان', 'الثمن المشترك'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarjama-jumla', 'dala-taalufiya'],
            prompt: 'الثمن الكلّي في المطبعتين A ثم B:',
            options: [
              sys('y = 30x + 1500', 'y = 45x'),
              sys('y = 1500x + 30', 'y = 45x'),
              sys('y = 30x + 1500', 'y = 45x + 1500'),
              sys('y = 30x', 'y = 45x + 1500'),
            ],
            correct: 0, cols: 2,
            explain: 'في A: 30 دج لكل بطاقة، أي $30x$ ، ثم 1500 دج للتصميم مرة واحدة: $y = 30x + 1500$. في B لا تصميم: $y = 45x$. ثمن التصميم لا يُضرب في عدد البطاقات، ولا يُضاف إلى المطبعة B.' },
          { kind: 'choice', role: 'conclude', requires: ['tamthil-taalufi', 'muadala-mustaqim'],
            prompt: 'المستقيم الذي يمثّل المطبعة B في التمثيل البياني هو:',
            options: [
              '$(d_2)$ : يشمل المبدأ، لأنّ ثمن 0 بطاقة في المطبعة B هو 0 دج',
              '$(d_1)$ : لأنّ ثمن البطاقة الواحدة في المطبعة B أكبر',
              '$(d_1)$ : يقطع محور التراتيب في $(0 ; 1500)$',
            ],
            correct: 0,
            explain: '$y = 45x$ تمثّل دالة خطية: صورة 0 هي 0، فمستقيمها يشمل المبدأ، وهو $(d_2)$. أمّا $(0 ; 1500)$ فنقطة المطبعة A: ثمن التصميم.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hall-taqatu'],
            prompt: 'فاصلة نقطة التقاطع، أي عدد البطاقات:', expected: 100, suffix: 'بطاقة',
            explain: 'المستقيمان يتقاطعان في النقطة التي فاصلتها 100: الفاصلة هي قيمة $x$ ، عدد البطاقات.' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['hall-taqatu'],
            prompt: 'ترتيب نقطة التقاطع، أي الثمن الكلّي:', expected: 4500, suffix: 'دج',
            explain: 'ترتيب نقطة التقاطع 4500، وهي على المستقيمين معًا: $30 \\times 100 + 1500 = 4500$ و $45 \\times 100 = 4500$.' },
          { kind: 'numeric', role: 'compute', requires: ['hall-bayani', 'hall-jabri'],
            prompt: 'نتحقّق بالحساب: المساواة $30x + 1500 = 45x$ تعطي $15x = \\ldots$', expected: 1500,
            explain: '$45x - 30x = 15x$ ، أي $15x = 1500$ ، ومنه $x = \\dfrac{1500}{15} = 100$ ، ثم $y = 45 \\times 100 = 4500$ : القراءة صحيحة.' },
          { kind: 'solution', ask: 0, lines: [
            'المطبعة A: $y = 30x + 1500$ ؛ المطبعة B: $y = 45x$.',
            'المستقيمان يتقاطعان في $(100 ; 4500)$ ، والتحقق: $30 \\times 100 + 1500 = 4500$ و $45 \\times 100 = 4500$.',
            'لـ 100 بطاقة يتساوى الثمنان في المطبعتين: 4500 دج.',
          ] },
        ],
      },
      {
        label: '2)', title: 'مطبعة ثالثة',
        question: 'عرضت مطبعة ثالثة C أن تأخذ 1000 دج للتصميم ثم 45 دج عن كل بطاقة. دون رسم، كم حلًّا للجملة المكوّنة من معادلتي المطبعتين B و C؟ وأيّ المطبعتين B و C أرخص؟',
        asks: ['عدد حلول جملة B و C', 'المطبعة الأرخص بين B و C'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['dala-taalufiya'],
            prompt: 'الثمن الكلّي في المطبعة C بدلالة $x$ :',
            options: ['$y = 45x + 1000$', '$y = 1000x + 45$', '$y = 1045x$'],
            correct: 0, cols: 3,
            explain: '45 دج لكل بطاقة، أي $45x$ ، ثم 1000 دج للتصميم مرة واحدة.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['halat-thalath'],
            prompt: 'كم حلًّا للجملة المكوّنة من معادلتي المطبعتين B و C؟',
            options: [
              'لا حلّ: المستقيمان متوازيان، معامل التوجيه نفسه 45 وترتيبان مختلفان عند المبدأ 0 و 1000',
              'حلّ وحيد: كل مستقيمين يتقاطعان',
              'عدد لا نهائي من الحلول: لأنّ معامل التوجيه نفسه',
            ],
            correct: 0,
            explain: 'المعادلتان $y = 45x$ و $y = 45x + 1000$ : معامل التوجيه نفسه وترتيبان مختلفان عند المبدأ، فالمستقيمان متوازيان ولا نقطة مشتركة لهما. يكونان منطبقين لو تساوى الترتيبان أيضًا.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'الفرق بين الثمن في C والثمن في B، مهما كان عدد البطاقات:', expected: 1000, suffix: 'دج',
            explain: 'لكل عدد $x$ : $(45x + 1000) - 45x = 1000$ ؛ مثلًا لـ 100 بطاقة: $5500 - 4500 = 1000$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['halat-thalath'],
            prompt: 'أيّ المطبعتين B و C أرخص؟',
            options: [
              'المطبعة B دائمًا: ثمن C يزيد عليها بـ 1000 دج مهما كان عدد البطاقات',
              'المطبعة C عندما يكون عدد البطاقات كبيرًا',
              'تتساويان عند 1000 بطاقة',
            ],
            correct: 0,
            explain: 'المستقيمان متوازيان: لا يلتقيان أبدًا، فلا يتساوى الثمنان لأيّ عدد من البطاقات، ومستقيم C يبقى فوق مستقيم B بفارق 1000.' },
          { kind: 'solution', ask: 0, lines: [
            'المطبعة C: $y = 45x + 1000$ ، والمطبعة B: $y = 45x$.',
            'معامل التوجيه نفسه 45 وترتيبان مختلفان عند المبدأ: المستقيمان متوازيان، والجملة لا تقبل حلًّا.',
            'لا يتساوى الثمنان أبدًا: المطبعة B أرخص دائمًا، بفارق 1000 دج.',
          ] },
        ],
      },
      {
        label: '3)', title: 'قرار العائلة',
        question: 'قرّرت العائلة طبع 180 بطاقة. أيّ مطبعة تختار من بين المطابع الثلاث؟ وكم دينارًا توفّر مقارنة بالمطبعة B؟',
        asks: ['المطبعة المختارة', 'ما توفّره مقارنة بالمطبعة B'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['dala-taalufiya'],
            prompt: 'الثمن الكلّي لـ 180 بطاقة في المطبعة A:', expected: 6900, suffix: 'دج',
            explain: '$30 \\times 180 + 1500 = 5400 + 1500 = 6900$.' },
          { kind: 'numeric', role: 'compute', requires: ['dala-taalufiya'],
            prompt: 'الثمن الكلّي لـ 180 بطاقة في المطبعة B:', expected: 8100, suffix: 'دج',
            explain: '$45 \\times 180 = 8100$.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hall-taqatu', 'halat-thalath'],
            prompt: 'أيّ مطبعة تختار العائلة؟',
            options: [
              'المطبعة A: $180 > 100$ ، وبعد نقطة التقاطع مستقيمها تحت مستقيم B، والمطبعة C أغلى من B دائمًا',
              'المطبعة B: لأنّها لا تأخذ شيئًا للتصميم',
              'المطبعة C: لأنّ ما تأخذه للتصميم أقلّ ممّا تأخذه A',
            ],
            correct: 0,
            explain: '$6900 < 8100$ ، والمطبعة C تأخذ $8100 + 1000 = 9100$. بلا ثمن تصميم تكون B أرخص للأعداد الصغيرة فقط، قبل فاصلة نقطة التقاطع 100.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ما توفّره العائلة مقارنة بالمطبعة B:', expected: 1200, suffix: 'دج',
            explain: '$8100 - 6900 = 1200$.' },
          { kind: 'solution', ask: 0, lines: [
            'A: $30 \\times 180 + 1500 = 6900$ ؛ B: $45 \\times 180 = 8100$ ؛ C: $8100 + 1000 = 9100$.',
            '$180 > 100$ : بعد نقطة التقاطع المطبعة A هي الأرخص، و $6900 < 8100 < 9100$.',
            'تختار العائلة المطبعة A، فتوفّر $8100 - 6900 = 1200$ دج مقارنة بالمطبعة B.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
