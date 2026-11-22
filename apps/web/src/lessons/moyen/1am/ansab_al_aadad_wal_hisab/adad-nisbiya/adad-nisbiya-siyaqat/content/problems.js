/**
 * Les trois « مسائل » du درس « الأعداد النسبية وسياقات استعمالها » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). La مسألة 1 est `LESSON_CONFIG.lessonProblem` (le mur d'observation de Djelfa : cinq lectures, le plus froid, l'opposé) ; la 2 redessine
 * « حرارة غير عادية » du manuel (`deep-1`) avec ses propres valeurs : les écarts de cinq années à la moyenne d'une station ; la 3 un appareil d'altitude de
 * scouts (un chott sous le niveau de la mer, une colline, un port) où le plus loin de la mer n'est pas le plus grand nombre.
 * Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE.
 */
import { addition, src } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const ROWS = (pairs) => pairs.map(([label, right, wrong, correction]) => ({ label, options: [right, ...wrong], correct: 0, correction }));

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — مرصد الجلفة',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🌡️',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'الأحد: 3 درجات فوق الصفر', useful: true },
      { id: 'd2', text: 'الاثنين: درجتان تحت الصفر', useful: true },
      { id: 'd3', text: 'الثلاثاء: 6 درجات تحت الصفر', useful: true },
      { id: 'd4', text: 'الأربعاء: الصفر', useful: true },
      { id: 'd5', text: 'الخميس: درجتان فوق الصفر', useful: true },
      { id: 'thermo', text: 'اشترى المرصد 3 محارير جديدة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'القراءات والمسافة',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['القراءات بأعداد نسبية', 'المسافة إلى الصفر لقراءة الثلاثاء'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['adad-nisbi'],
            prompt: 'بعدد نسبي:',
            rows: ROWS([
              ['الأحد', '$3$', ['$-3$', '$0{,}3$'], '3 درجات فوق الصفر: عدد موجب يُكتب بلا إشارة، $3$ .'],
              ['الاثنين', '$-2$', ['$2$', '$-1$'], 'درجتان تحت الصفر: عدد سالب تسبقه الإشارة −، $-2$ .'],
              ['الثلاثاء', '$-6$', ['$6$', '$-5$'], '6 درجات تحت الصفر: $-6$ .'],
              ['الأربعاء', '$0$', ['$1$', '$-1$'], 'الصفر لا فوق الصفر ولا تحته: $0$ .'],
              ['الخميس', '$2$', ['$-2$', '$0{,}2$'], 'درجتان فوق الصفر: $2$ .'],
            ]) },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ishara-masafa'], prompt: 'المسافة إلى الصفر لقراءة الثلاثاء $-6$ :', expected: 6, display: '6',
            explain: 'المسافة هي عدد الدرجات بين المستوى والصفر دون إشارة: $6$ .' },
          { kind: 'solution', ask: 0, lines: [
            'فوق الصفر أعداد موجبة تُكتب بلا إشارة، وتحته أعداد سالبة تسبقها الإشارة −: $3$ ؛ $-2$ ؛ $-6$ ؛ $0$ ؛ $2$ .',
            'المسافة إلى الصفر لقراءة الثلاثاء $-6$ هي $6$ ، وهي دائمًا عدد موجب.',
          ] },
        ],
      },
      {
        label: '2)', title: 'اليوم الأبرد',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['اليوم الأبرد', 'الأبرد والعدد الأكبر'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['sayaqat-salib'],
            prompt: 'اليوم الأبرد:',
            options: ['الثلاثاء', 'الأحد', 'الأربعاء'], correct: 0, cols: 3,
            explain: 'الأبرد هو أدنى مستوى للسائل: $-6$ تحت الصفر بستّ درجات.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['sayaqat-salib'],
            prompt: 'هل الأبرد هو اليوم الذي له أكبر عدد؟',
            options: ['لا: الأبرد هو الأصغر عددًا', 'نعم: الأكبر عددًا هو الأبرد', 'لا يمكن الحكم'],
            correct: 0, cols: 1,
            explain: 'أكبر عدد هو $3$ (الأحد) وهو أدفأ الأيّام؛ والأبرد هو الأصغر $-6$ : $-6<-2<0<2<3$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نرتّب القراءات من الأصغر: $-6<-2<0<2<3$ .',
            'الأبرد هو الأصغر، أي الثلاثاء، وليس اليوم الذي له أكبر عدد (الأحد).',
          ] },
        ],
      },
      {
        label: '3)', title: 'المعاكس',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['معاكس قراءة الاثنين', 'اليوم الموافق'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['adad-mutaakisan'], prompt: 'معاكس قراءة الاثنين $-2$ :', expected: 2, display: '2',
            explain: 'له المسافة نفسها إلى الصفر على الجهة الأخرى: $2$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['adad-mutaakisan'],
            prompt: 'اليوم الذي سُجّلت فيه القراءة $2$ :',
            options: ['الخميس', 'الأحد', 'الأربعاء'], correct: 0, cols: 3,
            explain: 'الخميس: درجتان فوق الصفر، أي $2$ ، معاكس $-2$ .' },
          { kind: 'solution', ask: 0, lines: [
            'معاكس $-2$ هو $2$ : المسافة نفسها (2) والجهة الأخرى.',
            'القراءة $2$ سُجّلت يوم الخميس.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — حرارة السنوات',
    context: 'محطة الأرصاد',
    emoji: '📈',
    tone: 'emerald',
    source: src('deep-1', 74, 'أتعمّق', 1),
    illustration: { kind: 'tags', cards: [
      { title: 'سنوات أدفأ من المتوسط', icon: 'house', lines: [{ label: '2019', value: '0,4', unit: 'درجة فوقه' }, { label: '2021', value: '0,7', unit: 'درجة فوقه' }] },
      { title: 'سنوات أبرد من المتوسط', icon: 'house', lines: [{ label: '2020', value: '0,3', unit: 'درجة تحته' }, { label: '2022', value: '0,5', unit: 'درجة تحته' }] },
      { title: 'سنة مطابقة', icon: 'house', lines: [{ label: '2018', value: '0', unit: 'على المتوسط' }] },
    ], ariaLabel: 'خمس سنوات: 2019 و 2021 أدفأ من المتوسط بأربعة وسبعة أعشار الدرجة، و 2020 و 2022 أبرد منه بثلاثة وخمسة أعشار الدرجة، و 2018 على المتوسط' },
    statement: 'تسجّل محطة أرصاد كلّ سنة الفرق بين حرارة السنة والمتوسط المرجعي لها. كانت السنوات الخمس الأخيرة: 2018 على المتوسط تمامًا، 2019 أدفأ منه بـ 0,4 درجة، 2020 أبرد منه بـ 0,3 درجة، 2021 أدفأ منه بـ 0,7 درجة، 2022 أبرد منه بـ 0,5 درجة. للمحطة جهازان لتسجيل الرياح.',
    data: [
      { id: 'y1', text: '2018 على المتوسط تمامًا', useful: true },
      { id: 'y2', text: '2019 أدفأ من المتوسط بـ 0,4 درجة', useful: true },
      { id: 'y3', text: '2020 أبرد من المتوسط بـ 0,3 درجة', useful: true },
      { id: 'y4', text: '2021 أدفأ من المتوسط بـ 0,7 درجة', useful: true },
      { id: 'y5', text: '2022 أبرد من المتوسط بـ 0,5 درجة', useful: true },
      { id: 'wind', text: 'للمحطة جهازان لتسجيل الرياح', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الانحرافات',
        question: 'اكتب انحراف كلّ سنة عن المتوسط بعدد نسبي (أدفأ: موجب، أبرد: سالب).',
        asks: ['انحرافات السنوات'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['adad-nisbi'],
            prompt: 'الانحراف عن المتوسط:',
            rows: ROWS([
              ['2019', '$0{,}4$', ['$-0{,}4$', '$4$'], 'أدفأ من المتوسط: عدد موجب، $0{,}4$ .'],
              ['2020', '$-0{,}3$', ['$0{,}3$', '$-3$'], 'أبرد من المتوسط: عدد سالب، $-0{,}3$ .'],
              ['2021', '$0{,}7$', ['$-0{,}7$', '$7$'], 'أدفأ من المتوسط: $0{,}7$ .'],
              ['2022', '$-0{,}5$', ['$0{,}5$', '$-5$'], 'أبرد من المتوسط: $-0{,}5$ .'],
            ]) },
          { kind: 'solution', ask: 0, lines: [
            'أدفأ من المتوسط يعني فوق الصفر (عدد موجب)، وأبرد منه يعني تحت الصفر (عدد سالب).',
            '$0{,}4$ ؛ $-0{,}3$ ؛ $0{,}7$ ؛ $-0{,}5$ ، والسنة 2018 انحرافها $0$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الأدفأ والأبرد',
        question: 'أيّ السنوات أدفأ سنة، وأيّها أبرد سنة؟',
        asks: ['الأدفأ والأبرد'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['sayaqat-salib'],
            prompt: 'أدفأ سنة وأبرد سنة:',
            options: ['الأدفأ 2021 والأبرد 2022', 'الأدفأ 2019 والأبرد 2020', 'الأدفأ 2021 والأبرد 2020'], correct: 0, cols: 1,
            explain: 'الأدفأ هو الأكبر انحرافًا: $0{,}7$ ؛ والأبرد هو الأصغر: $-0{,}5$ ، ومن $-0{,}5$ و $-0{,}3$ الأصغر هو $-0{,}5$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نرتّب الانحرافات: $-0{,}5<-0{,}3<0<0{,}4<0{,}7$ .',
            'الأدفأ 2021 (الأكبر)، والأبرد 2022 (الأصغر).',
          ] },
        ],
      },
      {
        label: '3)', title: 'الأبعد عن المتوسط',
        question: 'أيّ السنتين أبعد عن المتوسط: 2020 أم 2022؟ وما المسافة إلى الصفر لانحرافها؟',
        asks: ['الأبعد عن المتوسط', 'المسافة إلى الصفر'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ishara-masafa'],
            prompt: 'الأبعد عن المتوسط:',
            options: ['2022 : انحرافها $-0{,}5$ ومسافته $0{,}5$', '2020 : لأنّ $-0{,}3$ أكبر من $-0{,}5$', 'المسافة نفسها'], correct: 0, cols: 1,
            explain: 'البعد عن المتوسط هو المسافة إلى الصفر دون إشارة: $0{,}5>0{,}3$ ، فالأبعد 2022 رغم أنّ $-0{,}5$ أصغر عددًا.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ishara-masafa'], prompt: 'المسافة إلى الصفر لانحراف 2022 $(-0{,}5)$ :', expected: 0.5, display: '0,5',
            explain: 'المسافة هي العدد دون إشارته: $0{,}5$ .' },
          { kind: 'solution', ask: 0, lines: [
            'بعد انحراف سنة عن المتوسط هو مسافته إلى الصفر: 2020 : $0{,}3$ ؛ 2022 : $0{,}5$ .',
            'الأبعد 2022، ومسافتها $0{,}5$ ، وهي دائمًا عدد موجب.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — بعثة الكشّافة',
    context: 'جهاز الارتفاع',
    emoji: '🧭',
    tone: 'amber',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'الشطّ', icon: 'leaf', lines: [{ label: 'يقع', value: '40', unit: 'م تحت سطح البحر' }] },
      { title: 'الربوة', icon: 'house', lines: [{ label: 'تقع', value: '30', unit: 'م فوق سطح البحر' }] },
      { title: 'الميناء', icon: 'bus', lines: [{ label: 'يقع', value: '0', unit: 'على سطح البحر' }] },
    ], ariaLabel: 'شطّ يقع أربعين مترًا تحت سطح البحر وربوة ثلاثين مترًا فوقه وميناء على سطح البحر' },
    statement: 'سجّل فريق كشّافة بجهاز قياس الارتفاع أنّ شطّ الملح يقع 40 م تحت سطح البحر، وأنّ ربوة قريبة تقع 30 م فوق سطح البحر، وأنّ الميناء على سطح البحر تمامًا. يضمّ الفريق 12 كشّافًا.',
    data: [
      { id: 'a1', text: 'الشطّ 40 م تحت سطح البحر', useful: true },
      { id: 'a2', text: 'الربوة 30 م فوق سطح البحر', useful: true },
      { id: 'a3', text: 'الميناء على سطح البحر تمامًا', useful: true },
      { id: 'team', text: 'يضمّ الفريق 12 كشّافًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ارتفاعات المواضع',
        question: 'اكتب ارتفاع كلّ موضع بعدد نسبي (سطح البحر هو الصفر).',
        asks: ['ارتفاعات المواضع'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['sayaqat-salib'],
            prompt: 'بالمتر:',
            rows: ROWS([
              ['الشطّ', '$-40$', ['$40$', '$-30$'], 'تحت سطح البحر: عدد سالب، $-40$ .'],
              ['الربوة', '$30$', ['$-30$', '$0{,}3$'], 'فوق سطح البحر: عدد موجب، $30$ .'],
              ['الميناء', '$0$', ['$1$', '$-1$'], 'على سطح البحر تمامًا: $0$ .'],
            ]) },
          { kind: 'solution', ask: 0, lines: [
            'فوق سطح البحر أعداد موجبة، وتحته أعداد سالبة، وعلى سطحه الصفر.',
            'الشطّ $-40$ ، الربوة $30$ ، الميناء $0$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الأخفض والأبعد',
        question: 'أيّ الموضعين الشطّ أم الربوة أخفض؟ وأيّهما أبعد عن سطح البحر؟',
        asks: ['الأخفض', 'الأبعد عن سطح البحر'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['sayaqat-salib'],
            prompt: 'الأخفض:',
            options: ['الشطّ: $-40<30$', 'الربوة: $30>-40$', 'هما في الارتفاع نفسه'], correct: 0, cols: 1,
            explain: 'الأخفض هو الأصغر عددًا: $-40<30$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['ishara-masafa'],
            prompt: 'الأبعد عن سطح البحر:',
            options: ['الشطّ: مسافته 40 م أكبر من 30 م', 'الربوة: لأنّ $30$ أكبر من $-40$', 'كلاهما على البعد نفسه'], correct: 0, cols: 1,
            explain: 'البعد عن سطح البحر هو المسافة إلى الصفر: $40>30$ ، فالشطّ هو الأبعد، وإن كان الأخفض.' },
          { kind: 'solution', ask: 0, lines: [
            'الأخفض هو الأصغر عددًا: $-40<30$ ، أي الشطّ.',
            'الأبعد هو الأكبر مسافة إلى الصفر: $40>30$ ، أي الشطّ أيضًا.',
          ] },
        ],
      },
      {
        label: '3)', title: 'المعاكس',
        question: 'يقع موضع على الجهة الأخرى من سطح البحر بالمسافة نفسها التي تبعدها الربوة. ما ارتفاعه؟',
        asks: ['ارتفاع المعاكس'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['adad-mutaakisan'],
            prompt: 'ارتفاع هذا الموضع:',
            options: ['$-30$ : 30 م تحت سطح البحر', '$30$ : 30 م فوق سطح البحر', '$-40$ : 40 م تحت سطح البحر'], correct: 0, cols: 1,
            explain: 'المعاكس لـ $30$ له المسافة نفسها (30 م) على الجهة الأخرى: $-30$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الربوة $30$ تبعد 30 م عن سطح البحر فوقه.',
            'الموضع المقابل يبعد 30 م تحته: $-30$ ، وهو معاكس $30$ .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
