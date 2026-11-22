/**
 * Les trois « مسائل » du درس « تبسيط عبارة جبرية وحذف الأقواس » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à
 * pas (GuidedProblem). Ajouts de la plateforme (`exam_style_problem`) : autres contextes et autres nombres que le manuel. La مسألة 1
 * (`LESSON_CONFIG.lessonProblem` : le périmètre d'un jardin triangulaire en x, puis la clôture sans l'entrée — un `−( )`) ; la 2 un autobus
 * (`+( )` et `−( )` dans une même chaîne) ; la 3 une salle de club (produit de monômes pour l'aire, somme pour le périmètre). Chaque
 * nombre est vérifié dans ./problems.test.js par une arithmétique indépendante.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — حديقة الحيّ',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🌳',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'أطوال أضلاع الحديقة بالمتر: 2x + 5 ، x + 8 ، 3x − 1', useful: true },
      { id: 'd2', text: 'فتحة المدخل عرضها (x − 3) متر دون سياج', useful: true },
      { id: 'd3', text: 'ثمن المتر الواحد من السياج 300 دج', useful: true },
      { id: 'd4', text: 'تتبرّع العائلات بثمن السياج', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'محيط الحديقة',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['محيط الحديقة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-muamilat'], prompt: 'أيّ عبارة تمثّل محيط الحديقة بأبسط شكل؟',
            options: ['$6x+12$', '$6x^3+12$', '$6x+2$'], correct: 0,
            explain: 'المحيط مجموع الأضلاع الثلاثة: $(2+1+3)x+(5+8-1)=6x+12$.' },
          { kind: 'solution', ask: 0, lines: [
            'المحيط مجموع أطوال الأضلاع: $(2x+5)+(x+8)+(3x-1)$.',
            'القوسان مسبوقان بـ $+$ فنحذفهما دون تغيير: $2x+5+x+8+3x-1$ ثم نجمع المتشابهة: $6x+12$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'السياج دون المدخل',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['عبارة طول السياج', 'قيمتها من أجل x = 5'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['aqwas-tarh'], prompt: 'أيّ عبارة تمثّل طول السياج بعد ترك المدخل؟',
            options: ['$(6x+12)-(x-3)$', '$(6x+12)+(x-3)$', '$(6x+12)-x-3$'], correct: 0,
            explain: 'نطرح عرض المدخل $(x-3)$ كله من المحيط، فنضعه بين قوسين بعد الإشارة $-$.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['aqwas-tarh'], prompt: 'بعد حذف القوسين وتبسيط العبارة نجد:',
            options: ['$5x+15$', '$5x+9$', '$7x+15$'], correct: 0,
            explain: 'القوسان مسبوقان بـ $-$ فتتغيّر الإشارتان: $6x+12-x+3=5x+15$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qima-thabita'], prompt: 'طول السياج بالمتر من أجل $x=5$:', expected: 40,
            explain: '$5\\times5+15=40$ متر.' },
          { kind: 'solution', ask: 0, lines: [
            'طول السياج $(6x+12)-(x-3)$.',
            'نحذف القوسين المسبوقين بـ $-$ بتغيير الإشارتين: $6x+12-x+3=5x+15$.',
            'من أجل $x=5$ : $5\\times5+15=40$ متر.',
          ] },
        ],
      },
      {
        label: '3)', title: 'ثمن السياج',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['ثمن السياج'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qima-thabita'], prompt: 'ثمن السياج بالدينار من أجل $x=5$:', expected: 12000,
            explain: '$40\\times300=12000$ دج.' },
          { kind: 'solution', ask: 0, lines: [
            'طول السياج من أجل $x=5$ هو 40 متر.',
            'الثمن $40\\times300=12000$ دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — حافلة الرحلة',
    context: 'رحلة مدرسية بتعاون التلاميذ',
    emoji: '🚌',
    tone: 'emerald',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'عند الانطلاق', icon: 'bus', lines: [{ label: 'التلاميذ', value: '3x + 4' }] },
      { title: 'نزلوا', lines: [{ label: 'التلاميذ', value: 'x - 2' }] },
      { title: 'صعدوا', lines: [{ label: 'التلاميذ', value: '2x + 5' }] },
    ], ariaLabel: 'حافلة تنطلق بـ 3x + 4 تلميذًا، ينزل منها x − 2 ويصعد إليها 2x + 5' },
    statement: 'تنظّم المتوسطة رحلة مدرسية يتعاون التلاميذ على تحضيرها. انطلقت حافلة وفيها $3x+4$ تلميذًا. في المحطة الأولى نزل $x-2$ تلميذًا وصعد $2x+5$ تلميذًا آخرين.',
    data: [
      { id: 'b1', text: 'عند الانطلاق 3x + 4 تلميذًا', useful: true },
      { id: 'b2', text: 'نزل x − 2 تلميذًا', useful: true },
      { id: 'b3', text: 'صعد 2x + 5 تلميذًا', useful: true },
      { id: 'b4', text: 'يتعاون التلاميذ على تحضير الرحلة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'العدد بعد المحطة',
        question: 'عبّر عن عدد التلاميذ في الحافلة بعد المحطة بدون أقواس.',
        asks: ['العدد بدون أقواس'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['aqwas-jam', 'aqwas-tarh'], prompt: 'أيّ عبارة تعطي عدد التلاميذ بعد المحطة؟',
            options: ['$(3x+4)-(x-2)+(2x+5)$', '$(3x+4)-(x-2)-(2x+5)$', '$(3x+4)+(x-2)+(2x+5)$'], correct: 0,
            explain: 'الذين نزلوا نطرحهم، والذين صعدوا نضيفهم.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['aqwas-tarh'], prompt: 'بعد حذف الأقواس نجد:',
            options: ['$3x+4-x+2+2x+5$', '$3x+4-x-2+2x+5$', '$3x+4-x+2-2x-5$'], correct: 0,
            explain: 'القوسان الأوّلان مسبوقان بـ $-$ فتتغيّر إشارة $x$ و $-2$ ؛ والأخيران مسبوقان بـ $+$ فتبقى إشارتاهما.' },
          { kind: 'solution', ask: 0, lines: [
            'الذين نزلوا بعد الإشارة $-$ بين قوسين: $-(x-2)$ فنغيّر الإشارتين فنجد $-x+2$.',
            'الذين صعدوا بعد الإشارة $+$ : $+(2x+5)$ فنُبقي الإشارتين: $+2x+5$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'أبسط شكل',
        question: 'عبّر عن العدد نفسه بأبسط شكل.',
        asks: ['العبارة المبسّطة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-muamilat'], prompt: 'نجمع الحدود المتشابهة فنجد:',
            options: ['$4x+11$', '$4x+7$', '$6x+11$'], correct: 0,
            explain: '$(3-1+2)x+(4+2+5)=4x+11$.' },
          { kind: 'solution', ask: 0, lines: ['حدود $x$ : $3x-x+2x=4x$.', 'الأعداد: $4+2+5=11$ ، فالعدد $4x+11$.'] },
        ],
      },
      {
        label: '3)', title: 'القيمة من أجل x = 6',
        question: 'كم تلميذًا في الحافلة من أجل $x=6$؟',
        asks: ['عدد التلاميذ'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qima-thabita'], prompt: 'عدد التلاميذ من أجل $x=6$:', expected: 35,
            explain: '$4\\times6+11=35$ تلميذًا. وبالعبارة الأصلية: $22-4+17=35$ أيضًا.' },
          { kind: 'solution', ask: 0, lines: ['العبارة المبسّطة التي وجدناها هي $4x+11$.', 'من أجل $x=6$ : $4\\times6+11=35$ تلميذًا.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — قاعة النادي',
    context: 'تجهيز قاعة بتطوّع التلاميذ',
    emoji: '🏫',
    tone: 'amber',
    source: addition('exam_style_problem'),
    illustration: { kind: 'plan', shape: 'rect', fill: 'floor', w: '3x', h: '2x', unit: 'م', ariaLabel: 'قاعة مستطيلة بعداها 3x و 2x بالمتر' },
    statement: 'يجهّز نادي الرياضيات قاعة مستطيلة بعداها $3x$ و $2x$ بالمتر، ويتطوّع تلاميذ النادي للعمل. يُفرش أرضها ببلاط ثمن المتر المربّع منه 800 دج، ويُحاط أسفل جدرانها الأربعة بشريط خشبي ثمن المتر الواحد منه 250 دج.',
    data: [
      { id: 'c1', text: 'بعدا القاعة 3x و 2x بالمتر', useful: true },
      { id: 'c2', text: 'ثمن المتر المربّع من البلاط 800 دج', useful: true },
      { id: 'c3', text: 'ثمن المتر من الشريط 250 دج', useful: true },
      { id: 'c4', text: 'يتطوّع تلاميذ النادي للعمل', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المساحة وثمن البلاط',
        question: 'عبّر عن مساحة القاعة بأبسط شكل ثم احسب ثمن البلاط من أجل $x=4$.',
        asks: ['مساحة القاعة', 'ثمن البلاط'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jidaa-hududayn'], prompt: 'مساحة القاعة بأبسط شكل:',
            options: ['$6x^2$', '$5x^2$', '$6x$'], correct: 0,
            explain: 'المساحة جداء: $3x\\times2x=3\\times2\\times x\\times x=6x^2$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qima-thabita'], prompt: 'ثمن البلاط بالدينار من أجل $x=4$:', expected: 76800,
            explain: 'المساحة $6\\times4^2=96$ م² ، والثمن $96\\times800=76800$ دج.' },
          { kind: 'solution', ask: 0, lines: ['المساحة $3x\\times2x=6x^2$.', 'من أجل $x=4$ : $6\\times16=96$ م² ، فثمن البلاط $96\\times800=76800$ دج.'] },
        ],
      },
      {
        label: '2)', title: 'المحيط وثمن الشريط',
        question: 'عبّر عن محيط القاعة بأبسط شكل ثم احسب ثمن الشريط من أجل $x=4$.',
        asks: ['محيط القاعة', 'ثمن الشريط'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-muamilat'], prompt: 'محيط القاعة بأبسط شكل:',
            options: ['$10x$', '$10x^2$', '$5x$'], correct: 0,
            explain: 'المحيط مجموع: $3x+2x+3x+2x=10x$ ، ولا نضرب $x$ في $x$ عند الجمع.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qima-thabita'], prompt: 'ثمن الشريط بالدينار من أجل $x=4$:', expected: 10000,
            explain: 'المحيط $10\\times4=40$ متر ، والثمن $40\\times250=10000$ دج.' },
          { kind: 'solution', ask: 0, lines: ['المحيط $3x+2x+3x+2x=10x$.', 'من أجل $x=4$ : $40$ متر ، فثمن الشريط $40\\times250=10000$ دج.'] },
        ],
      },
      {
        label: '3)', title: 'ثمن الأشغال',
        question: 'ما ثمن الأشغال كلها بالدينار من أجل $x=4$؟',
        asks: ['ثمن الأشغال'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qima-thabita'], prompt: 'ثمن الأشغال كلها بالدينار:', expected: 86800,
            explain: '$76800+10000=86800$ دج.' },
          { kind: 'solution', ask: 0, lines: ['ثمن البلاط 76800 دج وثمن الشريط 10000 دج.', 'المجموع $76800+10000=86800$ دج.'] },
        ],
      },
    ],
  },
];
export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
