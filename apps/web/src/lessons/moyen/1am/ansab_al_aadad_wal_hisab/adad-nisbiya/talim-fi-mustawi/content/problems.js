/**
 * Les trois « مسائل » du درس « التعليم في المستوي » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). La مسألة 1 est
 * `LESSON_CONFIG.lessonProblem` (la cour d'une école : quatre lieux, deux sur un axe, le trajet de la مسيّرة, les nombres échangés) ; la 2 redessine « لعبة السهام » du manuel
 * (`deep-6`) en un jet de sacs de grains dans une cible à couronnes carrées, avec ses propres valeurs ; la 3 reprend « الأعداد النسبية والهندسة » (`deep-8`, les symétriques par rapport aux
 * axes) et la condition du même quart de plan (`ict-ex`). Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE.
 */
import { addition, src } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const ROWS = (pairs) => pairs.map(([label, right, wrong, correction]) => ({ label, options: [right, ...wrong], correct: 0, correction }));
const pr = (x, y) => `$(${x}\\,;\\,${y})$`;

const CORNERS4 = { c1: [-5, -4], c2: [5, 4] };
const ring = (h) => [[-h, -h], [h, -h], [h, h], [-h, h]];
const target = () => {
  const points = { ...CORNERS4 };
  const polygons = [];
  [[3, 'sky'], [2, 'emerald'], [1, 'amber']].forEach(([h, tone]) => {
    const names = ring(h).map((p, i) => { const n = `r${h}${i}`; points[n] = p; return n; });
    polygons.push({ points: names, tone });
  });
  return { points, polygons, grid: true, axes: true, hidden: Object.keys(points), maxWidth: 400, ariaLabel: 'هدف على معلم متعامد: ثلاثة مربّعات متداخلة مركزها المبدأ، ضلع الأصغر وحدتان وضلع الأوسط أربع وحدات وضلع الأكبر ستّ وحدات' };
};
const garden = () => ({
  points: { A: [-2, -1], ...CORNERS4 }, grid: true, axes: true, hidden: ['c1', 'c2'], maxWidth: 400,
  ariaLabel: 'معلم متعامد مبدؤه سارية العلم تظهر فيه نقطة A هي موضع شجرة',
});
export const PROBLEM_FIGURES = { 'masala-2': target(), 'masala-3': garden() };

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — ساحة المدرسة',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🏫',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    figure: LESSON_CONFIG.lessonProblem.figure,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'المعلم: المبدأ سارية العلم O ووحدة الطول 1 m', useful: true },
      { id: 'd2', text: 'أربعة أماكن في الشكل: المقصف K والبوابة G والمكتبة L والشجرة T', useful: true },
      { id: 'd3', text: 'المسيّرة لا تسير مائلة: على المحور الأفقي ثمّ على المحور الشاقولي', useful: true },
      { id: 'paint', text: 'تشتري المدرسة 6 علب طلاء كلّ سنة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'إحداثيا الأماكن',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['إحداثيا الأماكن الأربعة', 'المكانان اللذان على محور'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['ihdathiyyan'],
            prompt: 'إحداثيا كلّ مكان:',
            rows: ROWS([
              ['المقصف $K$', pr(4, 2), [pr(2, 4), pr(4, -2)], 'أربع وحدات على يمين السارية ثمّ وحدتان نحو الأعلى: $(4\\,;\\,2)$ .'],
              ['البوابة $G$', pr(-3, 0), [pr(0, -3), pr(3, 0)], 'ثلاث وحدات على يسار السارية على الخط الأفقي ولا تصعد ولا تنزل: $(-3\\,;\\,0)$ .'],
              ['المكتبة $L$', pr(-1, -3), [pr(-3, -1), pr(1, -3)], 'وحدة واحدة على يسار السارية ثمّ ثلاث وحدات نحو الأسفل: $(-1\\,;\\,-3)$ .'],
              ['الشجرة $T$', pr(0, 3), [pr(3, 0), pr(0, -3)], 'على الخط الشاقولي ثلاث وحدات فوق السارية: $(0\\,;\\,3)$ .'],
            ]) },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['nuqta-ala-muhwar'],
            prompt: 'المكانان اللذان يقعان على أحد المحورين:',
            options: ['البوابة $G$ والشجرة $T$', 'المقصف $K$ والمكتبة $L$', 'البوابة $G$ والمكتبة $L$'], correct: 0, cols: 1,
            explain: 'إحدى إحداثيتي $G(-3\\,;\\,0)$ و $T(0\\,;\\,3)$ معدومة: $G$ على محور الفواصل و $T$ على محور التراتيب.' },
          { kind: 'solution', ask: 0, lines: [
            'نقرأ الفاصلة على الخط الأفقي ثمّ الترتيب على الخط الشاقولي: $K(4\\,;\\,2)$ ؛ $G(-3\\,;\\,0)$ ؛ $L(-1\\,;\\,-3)$ ؛ $T(0\\,;\\,3)$ .',
            '$G$ ترتيبها $0$ فهي على محور الفواصل، و $T$ فاصلتها $0$ فهي على محور التراتيب.',
          ] },
        ],
      },
      {
        label: '2)', title: 'رحلة المسيّرة',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['المسافة على الخط الأفقي', 'المسافة على الخط الشاقولي', 'المجموع'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ihdathiyyan'], prompt: 'عدد الأمتار على الخط الأفقي:', expected: 4, display: '4',
            explain: 'فاصلة $K$ هي $4$ : تقطع المسيّرة $4$ m على الخط الأفقي.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ihdathiyyan'], prompt: 'عدد الأمتار على الخط الشاقولي:', expected: 2, display: '2',
            explain: 'ترتيب $K$ هو $2$ : تقطع المسيّرة $2$ m نحو الأعلى.' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['ihdathiyyan'], prompt: 'مجموع ما قطعته بالأمتار:', expected: 6, display: '6',
            explain: 'لا تسير مائلة: تقطع $4$ ثمّ $2$ ، أي $4+2=6$ m .' },
          { kind: 'solution', ask: 0, lines: [
            'المسيّرة تقطع أوّلًا $4$ m على الخط الأفقي (فاصلة $K$ ) ثمّ $2$ m على الخط الشاقولي (ترتيبها).',
            'المجموع $4+2=6$ m ، وليست مسافة الخط المائل لأنّها لا تسير مائلة.',
          ] },
        ],
      },
      {
        label: '3)', title: 'تبديل العددين',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['مكان المسيّرة بعد التبديل'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tartib-adadayn'],
            prompt: 'إذا بدّلنا العددين في إحداثيي $K(4\\,;\\,2)$ فإنّ المسيّرة:',
            options: ['تحطّ عند $(2\\,;\\,4)$ وهو مكان آخر', 'تحطّ عند $K$ نفسها', 'تحطّ عند $(-4\\,;\\,-2)$'], correct: 0, cols: 1,
            explain: 'تقطع $2$ على الخط الأفقي ثمّ $4$ على الخط الشاقولي: تصل إلى $(2\\,;\\,4)$ ، لا إلى $K$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الفاصلة أوّلًا ثمّ الترتيب: بتبديل العددين تصير الفاصلة $2$ والترتيب $4$ .',
            'النقطة $(2\\,;\\,4)$ غير $K(4\\,;\\,2)$ : المكان يتغيّر إذا تغيّر ترتيب العددين.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — رمي الأكياس',
    context: 'يوم رياضي',
    emoji: '🎯',
    tone: 'emerald',
    source: src('deep-6', 74, 'أتعمّق', 6),
    figure: PROBLEM_FIGURES['masala-2'],
    statement: 'في يوم رياضي بالمدرسة يرمي كلّ تلميذ ثلاثة أكياس من الحبوب نحو هدف مرسوم في الشكل على معلم متعامد مبدؤه مركز الهدف. تُحسب نقاط الرمية بحسب أبعد الإحداثيين عن الصفر (دون إشارته): حتى $1$ تكسب 10 نقاط، حتى $2$ تكسب 5 نقاط، حتى $3$ تكسب نقطتين، وما عدا ذلك لا شيء. رمى سلمى: $(1\\,;\\,-1)$ و $(-2\\,;\\,0)$ و $(3\\,;\\,3)$ ، ورمى أنيس: $(0\\,;\\,1)$ و $(-1\\,;\\,-1)$ و $(3\\,;\\,-2)$ ، ورمى ياسين: $(2\\,;\\,1)$ و $(-2\\,;\\,-2)$ و $(4\\,;\\,0)$ . يوزّع الأستاذ 12 كيسًا.',
    data: [
      { id: 't1', text: 'النقاط: حتى 1 ← 10 ؛ حتى 2 ← 5 ؛ حتى 3 ← 2 ؛ أبعد ← 0', useful: true },
      { id: 't2', text: 'رميات سلمى: (1 ; −1) و (−2 ; 0) و (3 ; 3)', useful: true },
      { id: 't3', text: 'رميات أنيس: (0 ; 1) و (−1 ; −1) و (3 ; −2)', useful: true },
      { id: 't4', text: 'رميات ياسين: (2 ; 1) و (−2 ; −2) و (4 ; 0)', useful: true },
      { id: 'bags', text: 'يوزّع الأستاذ 12 كيسًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مجموع سلمى',
        question: 'احسب نقاط كلّ رمية من رميات سلمى ثمّ مجموعها.',
        asks: ['نقاط كلّ رمية', 'مجموع سلمى'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['ihdathiyyan'],
            prompt: 'نقاط رمية سلمى:',
            rows: ROWS([
              [pr(1, -1), '10', ['5', '2'], 'أبعد الإحداثيين عن الصفر هو $1$ دون إشارة: داخل الأصغر، 10 نقاط.'],
              [pr(-2, 0), '5', ['10', '2'], 'أبعد الإحداثيين هو $2$ دون إشارة: 5 نقاط.'],
              [pr(3, 3), '2', ['5', '0'], 'أبعدهما $3$ : نقطتان.'],
            ]) },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ihdathiyyan'], prompt: 'مجموع نقاط سلمى:', expected: 17, display: '17',
            explain: '$10+5+2=17$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نأخذ لكلّ رمية أبعد الإحداثيين عن الصفر بإهمال الإشارة: $1$ ثمّ $2$ ثمّ $3$ .',
            'النقاط $10$ ثمّ $5$ ثمّ $2$ ، ومجموعها $17$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الفائز',
        question: 'من الفائز: سلمى (17 نقطة) أم أنيس أم ياسين؟',
        asks: ['مجموع أنيس', 'الفائز'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ihdathiyyan'], prompt: 'مجموع نقاط أنيس:', expected: 22, display: '22',
            explain: '$(0\\,;\\,1)$ داخل الأصغر: 10 ؛ $(-1\\,;\\,-1)$ : 10 ؛ $(3\\,;\\,-2)$ : أبعدهما $3$ فنقطتان. المجموع $10+10+2=22$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['ihdathiyyan'],
            prompt: 'الفائز بأكبر عدد من النقاط:',
            options: ['أنيس', 'سلمى', 'ياسين'], correct: 0, cols: 3,
            explain: 'مجموع أنيس $22$ وسلمى $17$ وياسين $5+5+0=10$ : الفائز أنيس.' },
          { kind: 'solution', ask: 0, lines: [
            'أنيس: $10+10+2=22$ ؛ سلمى: $17$ ؛ ياسين: $5+5+0=10$ ($(4\\,;\\,0)$ خارج المربّع الأكبر).',
            'الفائز هو صاحب أكبر مجموع: أنيس.',
          ] },
        ],
      },
      {
        label: '3)', title: 'نقاط معيّنة',
        question: 'أيّ هذه الرميات تكسب 5 نقاط بالضبط: $(-2\\,;\\,1)$ أم $(0\\,;\\,3)$ أم $(1\\,;\\,1)$ ؟',
        asks: ['الرمية التي تكسب 5 نقاط'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ihdathiyyan'],
            prompt: 'الرمية التي تكسب 5 نقاط:',
            options: ['$(-2\\,;\\,1)$', '$(0\\,;\\,3)$', '$(1\\,;\\,1)$'], correct: 0, cols: 3,
            explain: 'أبعد إحداثيي $(-2\\,;\\,1)$ هو $2$ دون إشارة: 5 نقاط ؛ $(0\\,;\\,3)$ تكسب نقطتين و $(1\\,;\\,1)$ تكسب 10.' },
          { kind: 'solution', ask: 0, lines: [
            '$(-2\\,;\\,1)$ : أبعدهما $2$ فتكسب 5 نقاط.',
            '$(0\\,;\\,3)$ أبعدها $3$ فنقطتان، و $(1\\,;\\,1)$ أبعدها $1$ فعشر نقاط.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — حديقة المدرسة',
    context: 'حديقة المدرسة',
    emoji: '🌳',
    tone: 'violet',
    source: src('deep-8', 74, 'أتعمّق', 8),
    figure: PROBLEM_FIGURES['masala-3'],
    statement: 'في حديقة المدرسة معلم متعامد مبدؤه سارية العلم $O$ ، وتقف شجرة عند $A(-2\\,;\\,-1)$ كما في الشكل. تريد المسيّرة تصوير نظيرة $A$ بالنسبة إلى المحور الأفقي وهي $A\'$ ، ونظيرتها بالنسبة إلى المحور الشاقولي وهي $B\'$ . اشترى الحارس 3 مكانس.',
    data: [
      { id: 'g1', text: 'الشجرة A عند (−2 ; −1)', useful: true },
      { id: 'g2', text: 'A\' نظيرة A بالنسبة إلى المحور الأفقي', useful: true },
      { id: 'g3', text: 'B\' نظيرة A بالنسبة إلى المحور الشاقولي', useful: true },
      { id: 'brooms', text: 'اشترى الحارس 3 مكانس', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'نظيرة بالنسبة إلى المحور الأفقي',
        question: 'ما ترتيب $A\'$ ؟ وماذا بقي من فاصلة $A$ ؟',
        asks: ['ترتيب النظيرة', 'فاصلة النظيرة'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ihdathiyyan'], prompt: 'ترتيب النقطة $A\'$ :', expected: 1, display: '1',
            explain: '$A$ تحت المحور الأفقي بوحدة، فنظيرتها فوقه بوحدة: ترتيبها $1$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['ihdathiyyan'],
            prompt: 'فاصلة $A\'$ :',
            options: ['$-2$ ، لم تتغيّر', '$2$', '$1$'], correct: 0, cols: 3,
            explain: 'النظيرة بالنسبة إلى المحور الأفقي على الخط الشاقولي نفسه: الفاصلة $-2$ نفسها، والترتيب هو الذي تغيّرت إشارته.' },
          { kind: 'solution', ask: 0, lines: [
            'النظيرة بالنسبة إلى المحور الأفقي تحافظ على الفاصلة وتعاكس الترتيب: $A\'(-2\\,;\\,1)$ .',
            'المحور الأفقي هو الذي ينصّف القطعة $[AA\']$ : $A$ تحته بوحدة و $A\'$ فوقه بوحدة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'نظيرة بالنسبة إلى المحور الشاقولي',
        question: 'ما فاصلة $B\'$ ؟ وماذا بقي من ترتيب $A$ ؟',
        asks: ['فاصلة النظيرة', 'ترتيب النظيرة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ihdathiyyan'], prompt: 'فاصلة النقطة $B\'$ :', expected: 2, display: '2',
            explain: '$A$ على يسار المحور الشاقولي بوحدتين، فنظيرتها على يمينه بوحدتين: فاصلتها $2$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['ihdathiyyan'],
            prompt: 'ترتيب $B\'$ :',
            options: ['$-1$ ، لم يتغيّر', '$1$', '$2$'], correct: 0, cols: 3,
            explain: 'النظيرة بالنسبة إلى المحور الشاقولي على الخط الأفقي نفسه: الترتيب $-1$ نفسه.' },
          { kind: 'solution', ask: 0, lines: [
            'النظيرة بالنسبة إلى المحور الشاقولي تعاكس الفاصلة وتحافظ على الترتيب: $B\'(2\\,;\\,-1)$ .',
            'المحور الشاقولي هو الذي ينصّف القطعة $[AB\']$ : $A$ على يساره بوحدتين و $B\'$ على يمينه بوحدتين.',
          ] },
        ],
      },
      {
        label: '3)', title: 'الربع نفسه',
        question: 'أيّ هذه النقط في الربع نفسه مع $A$ : $C(-3\\,;\\,-4)$ أم $D(3\\,;\\,-1)$ أم $E(-1\\,;\\,2)$ ؟',
        asks: ['النقطة التي في ربع A'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mu-allam-mutaamid'],
            prompt: 'النقطة التي في الربع نفسه مع $A$ :',
            options: ['$C(-3\\,;\\,-4)$', '$D(3\\,;\\,-1)$', '$E(-1\\,;\\,2)$'], correct: 0, cols: 1,
            explain: '$A(-2\\,;\\,-1)$ فاصلتها وترتيبها سالبان، مثل $C$ . أمّا $D$ فاصلتها موجبة و $E$ ترتيبها موجب.' },
          { kind: 'solution', ask: 0, lines: [
            'نقطتان في الربع نفسه إذا كان لفاصلتيهما الإشارة نفسها ولترتيبيهما الإشارة نفسها.',
            '$A$ و $C$ : فاصلتان سالبتان وترتيبان سالبان.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
