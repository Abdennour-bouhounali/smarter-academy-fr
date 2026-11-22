/**
 * Les trois « مسائل » du درس « حساب الرابع المتناسب » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). La مسألة 1 est un achat de tissu pour l'atelier de couture (le registre « prix ∝ longueur » de la leçon) —
 * `LESSON_CONFIG.lessonProblem` ; la 2 met à l'échelle une recette de couscous et cherche l'ingrédient qui limite (le manuel p. 82,
 * « استعمل حصصا », RÉÉCRIT) ; la 3 suit un robinet qui coule et corrige une erreur « on ajoute la même différence ». Chaque nombre est
 * vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — قماش لورشة الخياطة',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🧵',
    tone: 'sky',
    source: SOURCE,
    table: LESSON_CONFIG.lessonProblem.table,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'ثمن 3 m هو 2100 DA وثمن 5 m هو 3500 DA', useful: true },
      { id: 'd2', text: 'ثمن القماش يتناسب مع طوله', useful: true },
      { id: 'd3', text: 'الورشة تابعة للمتوسطة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ثمن 8 m',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['ثمن 8 m'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['turuq'], prompt: 'نلاحظ أنّ $8 = 3 + 5$ . كيف نحصل على ثمن $8$ m ؟',
            options: ['نجمع ثمن $3$ m وثمن $5$ m', 'نضرب $8$ في $3500$', 'نضيف $8$ إلى $2100$'], correct: 0, cols: 1,
            explain: 'الخاصية الجمعية: القماش الذي طوله $8$ m هو قطعة $3$ m وقطعة $5$ m ، وثمنه مجموع الثمنين.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['turuq'], prompt: 'ثمن $8$ m (بالدينار):', expected: 5600,
            explain: '$2100 + 3500 = 5600$ DA .' },
          { kind: 'solution', ask: 0, lines: [
            'الطول $8$ m هو $3$ m زائد $5$ m ، والثمن يتناسب مع الطول.',
            'ثمن $8$ m هو $2100 + 3500 = 5600$ DA .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الطول المشترى',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الطول'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['turuq'], prompt: 'ما ثمن المتر الواحد من هذا القماش؟',
            options: ['$700$ DA', '$7$ DA', '$2100$ DA'], correct: 0, cols: 3,
            explain: '$2100 \\div 3 = 700$ DA ، و $3500 \\div 5 = 700$ DA أيضًا.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-jidaan'], prompt: 'الطول الذي ثمنه $9100$ DA (بالمتر):', expected: 13,
            explain: '$9100 \\div 700 = 13$ m .' },
          { kind: 'solution', ask: 0, lines: [
            'ثمن المتر الواحد $700$ DA .',
            'الطول المطلوب $9100 \\div 700 = 13$ m ؛ أو الجداءان: $3 \\times 9100 = 2100 \\times x$ ، $x = 13$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'هل يكفي المبلغ؟',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['الجواب'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['turuq'], prompt: 'ثمن $28$ m (بالدينار):', expected: 19600,
            explain: '$28 \\times 700 = 19600$ DA .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ikhtiyar'], prompt: 'هل تكفي $20000$ DA لشراء $28$ m ؟',
            options: ['نعم، تكفي', 'لا، لا تكفي'], correct: 0, cols: 2,
            explain: '$19600 < 20000$ ، فتكفي وتبقى $400$ DA .' },
          { kind: 'solution', ask: 0, lines: [
            'ثمن $28$ m هو $28 \\times 700 = 19600$ DA .',
            '$19600 < 20000$ ، إذن المبلغ يكفي وتبقى $400$ DA .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — الكسكسي لحفل المدرسة',
    context: 'مقادير وصفة',
    emoji: '🍲',
    tone: 'amber',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [
      { title: 'وصفة الكسكسي', lines: [{ label: 'السميد', value: '500 g' }, { label: 'اللحم', value: '120 g' }, { label: 'الماء', value: '3 L' }] },
    ], ariaLabel: 'بطاقة وصفة كسكسي لستة أشخاص: 500 غرام من السميد و120 غرامًا من اللحم و3 لترات من الماء' },
    statement: 'تحضّر جمعية المتوسطة كسكسي لحفل آخر السنة. وصفة الكسكسي لـ $6$ أشخاص: $500$ g من السميد و $120$ g من اللحم و $3$ L من الماء، وكل المقادير تتناسب مع عدد الأشخاص.',
    data: [
      { id: 'a', text: 'لستة أشخاص: 500 g من السميد و 120 g من اللحم', useful: true },
      { id: 'b', text: 'المقادير تتناسب مع عدد الأشخاص', useful: true },
      { id: 'c', text: 'الحفل في نهاية السنة الدراسية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'السميد لـ 15 شخصًا',
        question: 'احسب كمية السميد اللازمة لـ $15$ شخصًا.',
        asks: ['كمية السميد'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['turuq'], prompt: 'أيّ مساواة صحيحة لحساب كمية السميد $x$ ؟',
            options: ['$6 \\times x = 500 \\times 15$', '$6 \\times 500 = 15 \\times x$', '$6 + x = 500 + 15$'], correct: 0, cols: 1,
            explain: 'الجدول: الأشخاص $6$ و $15$ ، السميد $500$ و $x$ . جداءا القطرين: $6 \\times x$ و $500 \\times 15$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-jidaan'], prompt: 'كمية السميد لـ $15$ شخصًا (بالغرام):', expected: 1250,
            explain: '$x = 500 \\times 15 \\div 6 = 7500 \\div 6 = 1250$ g .' },
          { kind: 'solution', ask: 0, lines: [
            'نكتب الجداءين المتصالبين: $6 \\times x = 500 \\times 15 = 7500$ .',
            'إذن $x = 7500 \\div 6 = 1250$ g من السميد.',
          ] },
        ],
      },
      {
        label: '2)', title: 'اللحم لـ 15 شخصًا',
        question: 'احسب كمية اللحم اللازمة لـ $15$ شخصًا.',
        asks: ['كمية اللحم'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['ikhtiyar'], prompt: 'أيّ طريق أسهل لحساب $120 \\times 15 \\div 6$ ؟',
            options: ['$120 \\div 6 = 20$ ثم $20 \\times 15$', '$120 \\div 15$ ثم الضرب في $6$', '$120 + 9$'], correct: 0, cols: 1,
            explain: '$120$ يقبل القسمة على $6$ : ثمن الشخص الواحد $20$ g ، فنمرّ بالوحدة ولا نحتاج إلى عدد كبير.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['turuq'], prompt: 'كمية اللحم لـ $15$ شخصًا (بالغرام):', expected: 300,
            explain: '$20 \\times 15 = 300$ g .' },
          { kind: 'solution', ask: 0, lines: [
            'اللحم لشخص واحد: $120 \\div 6 = 20$ g .',
            'اللحم لـ $15$ شخصًا: $20 \\times 15 = 300$ g .',
          ] },
        ],
      },
      {
        label: '3)', title: 'أكبر عدد من الأشخاص',
        question: 'عند الجمعية $2$ kg من السميد و $450$ g من اللحم. ما أكبر عدد من الأشخاص يمكن إطعامهم بالوصفة نفسها؟',
        asks: ['عدد الأشخاص'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['hisab-jidaan'], prompt: 'عدد الأشخاص الذي يكفيه السميد:', expected: 24,
            explain: '$2000 \\times 6 \\div 500 = 24$ شخصًا.' },
          { kind: 'numeric', role: 'compute', requires: ['hisab-jidaan'], prompt: 'عدد الأشخاص الذي يكفيه اللحم (قد يكون عددًا عشريًا):', expected: 22.5,
            explain: '$450 \\times 6 \\div 120 = 22{,}5$ شخصًا.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ikhtiyar'], prompt: 'أكبر عدد صحيح من الأشخاص يمكن إطعامهم:', expected: 22,
            explain: 'اللحم هو المكوّن الذي ينفد أوّلًا: يكفي $22{,}5$ شخصًا، ولا نطعم نصف شخص، فنأخذ $22$ .' },
          { kind: 'solution', ask: 0, lines: [
            'السميد يكفي $24$ شخصًا واللحم يكفي $22{,}5$ شخصًا.',
            'نأخذ الأصغر لأنّ كل المقادير لازمة معًا: $22{,}5$ ، ومنه $22$ شخصًا على الأكثر.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — الصنبور والحوض',
    context: 'صنبور يملأ حوضًا',
    emoji: '🚰',
    tone: 'teal',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [
      { title: 'الصنبور', lines: [{ label: 'الكمية', value: '150 L' }, { label: 'المدّة', value: '9 min' }] },
    ], ariaLabel: 'بطاقة صنبور: يجري 150 لترًا من الماء خلال 9 دقائق' },
    statement: 'يملأ صنبور حوضًا في ساحة المتوسطة بانتظام، فيجري منه $150$ L خلال $9$ min . كمية الماء الجارية تتناسب مع المدّة.',
    data: [
      { id: 'a', text: '150 L خلال 9 min', useful: true },
      { id: 'b', text: 'الجريان منتظم ويتناسب مع المدّة', useful: true },
      { id: 'c', text: 'الحوض في ساحة المتوسطة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الكمية خلال 36 min',
        question: 'احسب كمية الماء الجارية خلال $36$ min .',
        asks: ['الكمية'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['turuq'], prompt: '$36 = 9 \\times 4$ ، إذن نضرب $150$ L في:',
            options: ['$4$', '$27$', '$36$'], correct: 0, cols: 3,
            explain: 'الخاصية الضربية: المدّة صارت أربعة أمثال، فالكمية أربعة أمثال.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['turuq'], prompt: 'الكمية الجارية خلال $36$ min (باللتر):', expected: 600,
            explain: '$150 \\times 4 = 600$ L .' },
          { kind: 'solution', ask: 0, lines: [
            '$36 = 9 \\times 4$ : المدّة أربعة أمثال المدّة الأولى.',
            'الكمية $150 \\times 4 = 600$ L .',
          ] },
        ],
      },
      {
        label: '2)', title: 'المدّة اللازمة',
        question: 'كم دقيقة يلزم ليجري $450$ L من الماء؟',
        asks: ['المدّة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['turuq'], prompt: '$450 = 150 \\times 3$ ، إذن نضرب $9$ min في:',
            options: ['$3$', '$300$', '$0{,}3$'], correct: 0, cols: 3,
            explain: 'الكمية صارت ثلاثة أمثال، فالمدّة ثلاثة أمثال.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ikhtiyar'], prompt: 'المدّة اللازمة (بالدقائق):', expected: 27,
            explain: '$9 \\times 3 = 27$ min .' },
          { kind: 'solution', ask: 0, lines: [
            '$450 = 150 \\times 3$ ، فالمدّة $9 \\times 3 = 27$ min .',
            'لو مررنا بالوحدة لقسمنا $150 \\div 9$ وهو عدد غير منتهٍ، فالخاصية الضربية أنسب هنا.',
          ] },
        ],
      },
      {
        label: '3)', title: 'تصحيح خطأ',
        question: 'قال أحمد: « خلال $12$ min تجري $153$ L لأنّ $12 = 9 + 3$ فأضفت $3$ إلى $150$ ». صحّح خطأه واحسب الكمية الصحيحة.',
        asks: ['الكمية الصحيحة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['ikhtiyar'], prompt: 'أين خطأ أحمد؟',
            options: ['أضاف الفرق $3$ إلى الكمية بدل أن يضيف كمية الماء الجارية خلال $3$ min', 'لا خطأ عند أحمد', 'كان عليه أن يطرح $3$'], correct: 0, cols: 1,
            explain: 'الخاصية الجمعية تجمع كميتين متقابلتين: الجارية في $9$ min والجارية في $3$ min ($50$ L) ، لا $3$ L .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['turuq'], prompt: 'الكمية الصحيحة خلال $12$ min (باللتر):', expected: 200,
            explain: 'خلال $3$ min تجري $150 \\div 3 = 50$ L ، إذن $150 + 50 = 200$ L .' },
          { kind: 'solution', ask: 0, lines: [
            'الجدول: $9$ min ← $150$ L و $3$ min ← $50$ L (لأنّ $3$ هو ثلث $9$).',
            'خلال $12 = 9 + 3$ min تجري $150 + 50 = 200$ L .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
