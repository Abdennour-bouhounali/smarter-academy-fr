/**
 * Les trois « مسائل » du درس « التعليم على مستقيم مدرّج » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). La مسألة 1 est la frise de la متوسطة (act-1 du manuel, RÉÉCRIT avec d'autres années) — `LESSON_CONFIG.lessonProblem` ;
 * la 2 un niveau de barrage en graduations décimales ; la 3 les étages d'un immeuble sur un axe vertical. Chaque nombre est vérifié dans
 * ./problems.test.js en arithmétique EXACTE (BigInt).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — خطّ زمن متوسطتنا',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '📏',
    tone: 'sky',
    source: SOURCE,
    table: LESSON_CONFIG.lessonProblem.table,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'المبدأ: سنة افتتاح المتوسطة $2000$', useful: true },
      { id: 'd2', text: 'الأحداث: $1985$ ، $1990$ ، $2010$ ، $2015$ ، $2024$', useful: true },
      { id: 'd3', text: 'تعمل لجنة الذاكرة بالمتوسطة على جمع صور قديمة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'فواصل الأحداث',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['فاصلة سنة $1985$', 'فاصلة سنة $2024$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['faasila'], prompt: 'فاصلة الحدث الذي وقع عام $1985$ :', expected: -15,
            explain: '$1985-2000=-15$ : قبل المبدأ، فالفاصلة سالبة.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['faasila'], prompt: 'فاصلة الحدث الذي وقع عام $2024$ :', expected: 24,
            explain: '$2024-2000=24$ : بعد المبدأ، فالفاصلة موجبة.' },
          { kind: 'solution', ask: 0, lines: [
            'فاصلة سنة هي الفرق بينها وبين سنة المبدأ $2000$ .',
            '$1985\\to -15$ ؛ $1990\\to -10$ ؛ $2010\\to +10$ ؛ $2015\\to +15$ ؛ $2024\\to +24$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'فاصلتان متعاكستان',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['زوج الحدثين'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mutaakisan'], prompt: 'أيّ حدثين فاصلتاهما متعاكستان؟',
            options: ['$1985$ و $2015$', '$1985$ و $2010$', '$1990$ و $2024$'], correct: 0, cols: 1,
            explain: '$-15$ و $+15$ لهما المسافة نفسها إلى الصفر وإشارتان مختلفتان؛ وكذلك $1990$ و $2010$ ($-10$ و $+10$).' },
          { kind: 'solution', ask: 0, lines: [
            '$1985\\to -15$ و $2015\\to +15$ : متعاكسان.',
            '$1990\\to -10$ و $2010\\to +10$ : متعاكسان أيضًا.',
          ] },
        ],
      },
      {
        label: '3)', title: 'تغيير المبدأ',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['الفاصلة الجديدة', 'التدريجة المناسبة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['faasila-tataghayyar'], prompt: 'لو اتّخذنا سنة $1990$ مبدأً، فاصلة سنة $2024$ هي:', expected: 34,
            explain: '$2024-1990=34$ ، والمبدأ الجديد يسبق الحدث فالفاصلة موجبة.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['ikhtiyar-tadrij'], prompt: 'بمبدأ $2000$ : ما أصغر تدريجة من بين $2$ ، $5$ ، $10$ سنوات تُبقي الأحداث الخمسة داخل مستقيم فيه $6$ تدريجات في كل جهة؟',
            options: ['$5$ سنوات', '$10$ سنوات', '$2$ سنتان'], correct: 0, cols: 3,
            explain: 'أبعد فاصلة $24$ : $24\\div 5=4{,}8<6$ فهي داخل المستقيم (بين التدريجة الرابعة والخامسة). مع $2$ سنتين تبعد $24$ عن المبدأ $12$ تدريجة وتخرج من المستقيم، و $10$ سنوات أكبر مما يلزم.' },
          { kind: 'solution', ask: 0, lines: [
            'الفاصلة الجديدة هي الفرق بين السنة والمبدأ الجديد: $2024-1990=34$ .',
            'بمبدأ $2000$ أبعد فاصلة $24$ ؛ مع تدريجة $5$ سنوات: $24\\div 5=4{,}8<6$ فتبقى داخل المستقيم، أمّا مع $2$ سنتين فتصير $12$ تدريجة وتخرج منه.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — منسوب السدّ',
    context: 'منسوب الماء',
    emoji: '💧',
    tone: 'teal',
    source: SOURCE,
    statement: 'نقيس منسوب الماء في سدّ بالنسبة إلى منسوبه العادي (الصفر). كانت القياسات: في جانفي $+1{,}5\\,\\mathrm{m}$ ، في أفريل $+0{,}5\\,\\mathrm{m}$ ، في جويلية $-0{,}75\\,\\mathrm{m}$ ، وفي سبتمبر $-2{,}25\\,\\mathrm{m}$ . ننشئ مستقيمًا مدرّجًا فيه $6$ تدريجات في كل جهة لتمثيلها.',
    table: { caption: 'منسوب الماء بالنسبة إلى المنسوب العادي (m)', head: ['الشهر', 'جانفي', 'أفريل', 'جويلية', 'سبتمبر'], rows: [['المنسوب', '+1,5', '+0,5', '-0,75', '-2,25']] },
    data: [
      { id: 'a', text: 'المناسيب الأربعة بالنسبة إلى المنسوب العادي (الصفر)', useful: true },
      { id: 'b', text: 'المستقيم فيه $6$ تدريجات في كل جهة من المبدأ', useful: true },
      { id: 'c', text: 'السدّ يزوّد المدينة بمياه الشرب', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'اختيار التدريجة',
        question: 'ما أصغر تدريجة من بين $0{,}25$ ، $0{,}5$ ، $1$ تُبقي المناسيب الأربعة داخل المستقيم؟',
        asks: ['التدريجة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ikhtiyar-tadrij'], prompt: 'التدريجة المناسبة (بالمتر):', options: ['$0{,}25$', '$0{,}5$', '$1$'], correct: 1, cols: 3,
            explain: 'مع $0{,}25$ : $-2{,}25\\div 0{,}25=-9$ خارج المستقيم. مع $0{,}5$ : $-4{,}5$ داخل المستقيم. $1$ تصلح أيضًا لكنّها ليست الأصغر.' },
          { kind: 'solution', ask: 0, lines: [
            'أبعد فاصلة عن الصفر $-2{,}25$ ، ومسافتها $2{,}25$ .',
            'نريد $2{,}25\\div v\\le 6$ ، أي $v\\ge 0{,}375$ ؛ أصغر الاختيارات التي تحقّق ذلك هي $0{,}5$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'المنسوب المعاكس',
        question: 'هل يوجد شهر منسوبه معاكس لمنسوب أفريل؟',
        asks: ['الجواب'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mutaakisan'], prompt: 'معاكس منسوب أفريل $+0{,}5$ هو:', options: ['لا يوجد: معاكسه $-0{,}5$ وليس بين القياسات', 'جويلية $-0{,}75$', 'سبتمبر $-2{,}25$'], correct: 0, cols: 1,
            explain: 'معاكس $0{,}5$ هو $-0{,}5$ ، والقياسات السالبة $-0{,}75$ و $-2{,}25$ مختلفة عنه.' },
          { kind: 'solution', ask: 0, lines: ['معاكس $0{,}5$ هو $-0{,}5$ .', 'لا قياس يساويه، إذن لا يوجد شهر منسوبه معاكس لمنسوب أفريل.'] },
        ],
      },
      {
        label: '3)', title: 'المسافة إلى الصفر',
        question: 'ما المسافة إلى الصفر لمنسوب سبتمبر؟',
        asks: ['المسافة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['masafa-ila-sifr'], prompt: 'المسافة إلى الصفر للمنسوب $-2{,}25$ :', expected: 2.25,
            explain: 'المسافة إلى الصفر لا تكون سالبة: نحذف الإشارة، $2{,}25$ .' },
          { kind: 'solution', ask: 0, lines: ['منسوب سبتمبر $-2{,}25$ .', 'المسافة إلى الصفر هي الفاصلة بلا إشارتها: $2{,}25\\,\\mathrm{m}$ .'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — أزرار المصعد',
    context: 'طوابق عمارة',
    emoji: '🏢',
    tone: 'emerald',
    source: SOURCE,
    statement: 'في عمارة طوابق من $-3$ (المرأب) إلى $+9$ . نمثّلها على مستقيم مدرّج عمودي مبدؤه الطابق الأرضي، والتدريجة طابق واحد.',
    table: { caption: 'طوابق العمارة (المبدأ: الطابق الأرضي)', head: ['الطابق', 'المرأب الأخفض', 'الأرضي', 'الأعلى'], rows: [['الفاصلة', '-3', '0', '+9']] },
    data: [
      { id: 'a', text: 'الطوابق من $-3$ إلى $+9$ ، والمبدأ هو الطابق الأرضي', useful: true },
      { id: 'b', text: 'مخبزة الحيّ تقع في الطابق $+4$', useful: true },
      { id: 'c', text: 'المصعد يتّسع لثمانية أشخاص', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'فاصلة الطابق الأخفض',
        question: 'ما فاصلة طابق المرأب الأخفض؟',
        asks: ['الفاصلة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['faasila'], prompt: 'فاصلة الطابق الأخفض:', expected: -3,
            explain: 'الطابق الأخفض على بعد ثلاثة طوابق تحت المبدأ: $-3$ .' },
          { kind: 'solution', ask: 0, lines: ['الطابق الأخفض تحت الطابق الأرضي (المبدأ) بثلاثة طوابق.', 'فاصلته $-3$ .'] },
        ],
      },
      {
        label: '2)', title: 'الطابق المعاكس',
        question: 'هل يوجد في العمارة الطابق المعاكس للطابق الذي فيه المخبزة $+4$ ؟',
        asks: ['الجواب'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mutaakisan'], prompt: 'معاكس $+4$ هو $-4$ . هل هذا الطابق موجود؟', options: ['لا، لأنّ أخفض طابق هو $-3$', 'نعم، هو المرأب', 'نعم، هو الطابق الأرضي'], correct: 0, cols: 1,
            explain: '$-4<-3$ : أخفض من المرأب الأخفض، فلا يوجد.' },
          { kind: 'solution', ask: 0, lines: ['معاكس $+4$ هو $-4$ .', 'لكنّ أخفض طابق هو $-3$ ، إذن الطابق $-4$ غير موجود.'] },
        ],
      },
      {
        label: '3)', title: 'تغيير المبدأ',
        question: 'نتّخذ الطابق $+2$ مبدأً. ما فاصلة المرأب الأخفض؟',
        asks: ['الفاصلة الجديدة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['faasila-tataghayyar'], prompt: 'فاصلة الطابق $-3$ بالنسبة إلى المبدأ الجديد:', expected: -5,
            explain: '$-3-2=-5$ : خمسة طوابق تحت الطابق $+2$ .' },
          { kind: 'solution', ask: 0, lines: ['المرأب الأخفض على بعد خمسة طوابق تحت الطابق $+2$ .', '$-3-2=-5$ .'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
