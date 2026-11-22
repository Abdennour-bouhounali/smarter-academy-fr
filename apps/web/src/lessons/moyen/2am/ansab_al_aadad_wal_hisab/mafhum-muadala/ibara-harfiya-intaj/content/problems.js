/**
 * Les trois « مسائل » du درس « إنتاج عبارة حرفية واستعمالها » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل الثاني, résolus pas à pas (GuidedProblem). AJOUTS DE LA PLATEFORME
 * (`addition('exam_style_problem')`), contextes de la plateforme (la carte du bassin municipal, le cordage du jardin de l'école, un programme de calcul de « الساحر »). Périmètre : une part fixe + une part par unité, des valeurs dans un tableau,
 * un côté exprimé par l'autre, un programme simplifié ; jamais de résolution d'équation ni de valeur négative. La مسألة 1 est « مسألة الدرس » (`LESSON_CONFIG.lessonProblem`) ; chaque nombre est vérifié dans ./problems.test.js.
 */
import { addition, src } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — بطاقة المسبح البلدي',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🏊',
    tone: 'sky',
    source: SOURCE,
    cites: [src('act-2', 56, 'أنشطة', 2)],
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'fee', text: 'التسجيل السنوي: 1500 DA مرّة واحدة', useful: true },
      { id: 'session', text: 'كلّ حصّة: 120 DA', useful: true },
      { id: 'x', text: 'عدد الحصص: x', useful: true },
      { id: 'hours', text: 'المسبح مفتوح مساءً', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'عبارة المبلغ',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['العبارة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarjama-harf'],
            prompt: 'المبلغ الذي يدفعه المشترك بعد $x$ حصّة هو:',
            options: ['$1500+120x$', '$1500x+120$', '$(1500+120)x$'], correct: 0, cols: 1,
            explain: 'التسجيل $1500$ يُدفع مرّة واحدة، وكلّ حصّة تضيف $120$ : $1500+120\\times x=1500+120x$ . ($1500x$ يضرب التسجيل في عدد الحصص.)' },
          { kind: 'solution', ask: 0, lines: ['جزء ثابت: $1500$ DA ، وجزء يتغيّر مع $x$ : $120\\times x$ .', 'المبلغ: $1500+120x$ .'] },
        ],
      },
      {
        label: '2)', title: 'ثلاثة مبالغ',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['10 حصص', '25 حصّة', '50 حصّة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qima-40'], prompt: 'من أجل $x=10$ : $1500+120\\times 10=$', expected: 2700, suffix: 'DA',
            explain: '$120\\times 10=1200$ ثم $1500+1200=2700$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qima-40'], prompt: 'من أجل $x=25$ : $1500+120\\times 25=$', expected: 4500, suffix: 'DA',
            explain: '$120\\times 25=3000$ ثم $1500+3000=4500$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['qima-40'], prompt: 'من أجل $x=50$ : $1500+120\\times 50=$', expected: 7500, suffix: 'DA',
            explain: '$120\\times 50=6000$ ثم $1500+6000=7500$ .' },
          { kind: 'solution', ask: 0, lines: ['نعوّض الحرف بقيمته ثم نحسب: الضرب قبل الجمع.', '$x=10$ : $2700$ DA ؛ $x=25$ : $4500$ DA ؛ $x=50$ : $7500$ DA .'] },
        ],
      },
      {
        label: '3)', title: 'جدول القيم',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['x = 0', 'x = 1', 'x = 2'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qima-40'], prompt: 'من أجل $x=0$ : $1500+120\\times 0=$', expected: 1500, suffix: 'DA',
            explain: '$120\\times 0=0$ ، فالمبلغ $1500$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qima-40'], prompt: 'من أجل $x=1$ : $1500+120\\times 1=$', expected: 1620, suffix: 'DA',
            explain: '$1500+120=1620$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['qima-40'], prompt: 'من أجل $x=2$ : $1500+120\\times 2=$', expected: 1740, suffix: 'DA',
            explain: '$120\\times 2=240$ ثم $1500+240=1740$ .' },
          { kind: 'solution', ask: 0, lines: ['الجدول: $x=0$ ← $1500$ ؛ $x=1$ ← $1620$ ؛ $x=2$ ← $1740$ .', 'كلّ حصّة تزيد المبلغ بـ $120$ DA .'] },
        ],
      },
      {
        label: '4)', title: 'معنى العدد 1500',
        question: LESSON_CONFIG.lessonProblem.questions[3].text,
        asks: ['المعنى'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qima-40'],
            prompt: 'العدد $1500$ هو المبلغ من أجل $x=0$ ، أي:',
            options: ['التسجيل وحده قبل أيّ حصّة', 'ثمن الحصّة الأولى', 'ثمن $0$ حصّة وحصّة واحدة'], correct: 0, cols: 1,
            explain: 'من أجل $x=0$ لا توجد حصّة: يبقى التسجيل السنوي وحده.' },
          { kind: 'solution', ask: 0, lines: ['من أجل $x=0$ : $1500+120\\times 0=1500$ .', 'هو إذن مبلغ التسجيل وحده.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — حبل حديقة المدرسة',
    context: 'ترتيب الحديقة',
    emoji: '🪢',
    tone: 'emerald',
    source: SOURCE,
    cites: [src('deep-46', 66, 'أتعمّق', 46)],
    illustration: { kind: 'tags', cards: [{ title: 'الحبل', icon: 'plant', lines: [{ label: 'الطول', value: '24', unit: 'm' }] }, { title: 'المستطيل', icon: 'plant', lines: [{ label: 'أحد بُعديه', value: 'x', unit: 'm' }] }], ariaLabel: 'بطاقتان: حبل طوله أربعة وعشرون مترًا ومستطيل أحد بعديه x' },
    statement: 'يحيط تلاميذ قطعة مستطيلة من حديقة المدرسة بحبل طوله $24$ m ، فيستعملونه كلّه. أحد بُعدي القطعة $x$ بالمتر.',
    data: [
      { id: 'rope', text: 'طول الحبل: 24 m (محيط القطعة)', useful: true },
      { id: 'x', text: 'أحد البعدين: x', useful: true },
      { id: 'plants', text: 'سيزرعون شتلات زيتون', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'البعد الآخر',
        question: 'عبّر بدلالة $x$ عن البعد الآخر للقطعة.',
        asks: ['البعد الآخر'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tarjama-harf'],
            prompt: 'محيط المستطيل $24$ m ، فنصف المحيط (الطول والعرض معًا) هو:',
            options: ['$12$ m', '$24$ m', '$48$ m'], correct: 0, cols: 1,
            explain: 'المحيط هو ضعف مجموع الطول والعرض، فمجموع البعدين $24\\div 2=12$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarjama-harf'],
            prompt: 'إذا كان أحد البعدين $x$ فالبعد الآخر:',
            options: ['$12-x$', '$12+x$', '$24-x$'], correct: 0, cols: 1,
            explain: 'البعدان يجتمعان في $12$ : الآخر هو $12-x$ . ($24-x$ ينسى أنّ المحيط يضمّ كلّ بعد مرّتين.)' },
          { kind: 'solution', ask: 0, lines: ['نصف المحيط: $24\\div 2=12$ m .', 'البعد الآخر: $12-x$ .'] },
        ],
      },
      {
        label: '2)', title: 'عبارة المساحة',
        question: 'عبّر بدلالة $x$ عن مساحة القطعة.',
        asks: ['المساحة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ikhtisar-kitaba'],
            prompt: 'مساحة المستطيل هي الطول × العرض:',
            options: ['$x(12-x)$', '$x+12-x$', '$12x$'], correct: 0, cols: 1,
            explain: '$x\\times(12-x)=x(12-x)$ : نحذف $\\times$ أمام القوس. ($x+12-x$ يجمع البعدين بدل ضربهما.)' },
          { kind: 'solution', ask: 0, lines: ['المساحة: $x\\times(12-x)$ .', 'نكتبها مبسّطة: $x(12-x)$ .'] },
        ],
      },
      {
        label: '3)', title: 'قيمتان',
        question: 'احسب المساحة من أجل $x=5$ ثم من أجل $x=6$ .',
        asks: ['x = 5', 'x = 6'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qima-40'], prompt: 'من أجل $x=5$ : $5\\times(12-5)=$', expected: 35, suffix: 'm²',
            explain: '$12-5=7$ ثم $5\\times 7=35$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qima-40'], prompt: 'من أجل $x=6$ : $6\\times(12-6)=$', expected: 36, suffix: 'm²',
            explain: '$12-6=6$ ثم $6\\times 6=36$ .' },
          { kind: 'solution', ask: 0, lines: ['$x=5$ : بُعدان $5$ و $7$ ، المساحة $35$ m² .', '$x=6$ : المربّع $6\\times 6=36$ m² ، وهي أكبر.'] },
        ],
      },
      {
        label: '4)', title: 'قيمة ممنوعة',
        question: 'لماذا لا يمكن أن يكون $x=12$ ؟',
        asks: ['السبب'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarjama-harf'],
            prompt: 'من أجل $x=12$ يصبح البعد الآخر:',
            options: ['$0$ فلا توجد قطعة مستطيلة', '$24$ m', '$12$ m'], correct: 0, cols: 1,
            explain: '$12-12=0$ : بعد معدوم، فلا مستطيل.' },
          { kind: 'solution', ask: 0, lines: ['من أجل $x=12$ : $12-12=0$ .', 'القطعة تنعدم: لا بدّ أن يكون $x$ أصغر من $12$ .'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — برنامج الساحر',
    context: 'لعبة الحساب',
    emoji: '🎩',
    tone: 'violet',
    source: SOURCE,
    cites: [src('deep-52', 66, 'أتعمّق', 52)],
    illustration: { kind: 'tags', cards: [{ title: 'البرنامج', icon: 'leaf', lines: [{ label: 'أضف', value: '4', unit: 'ثم اضرب في 2' }, { label: 'اطرح', value: '2x', unit: 'في النهاية' }] }], ariaLabel: 'بطاقة: برنامج يضيف أربعة ثم يضرب في اثنين ثم يطرح ضعف العدد المختار' },
    statement: 'في معرض العلوم يقول الساحر: «اختر عددًا، أضف إليه $4$ ، اضرب الناتج في $2$ ، ثم اطرح ضعف العدد الذي اخترته، وسأعرف النتيجة قبل أن تقولها».',
    data: [
      { id: 'a', text: 'أضف 4 إلى العدد المختار', useful: true },
      { id: 'b', text: 'اضرب الناتج في 2', useful: true },
      { id: 'c', text: 'اطرح ضعف العدد المختار', useful: true },
      { id: 'd', text: 'يرتدي الساحر قبّعة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'جرّب البرنامج',
        question: 'طبّق البرنامج على $3$ ثم $10$ ثم $0$ .',
        asks: ['العدد 3', 'العدد 10', 'العدد 0'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['barnamij'], prompt: 'نختار $3$ : $(3+4)\\times 2-2\\times 3=$', expected: 8,
            explain: '$7\\times 2=14$ ثم $14-6=8$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['barnamij'], prompt: 'نختار $10$ : $(10+4)\\times 2-2\\times 10=$', expected: 8,
            explain: '$14\\times 2=28$ ثم $28-20=8$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['barnamij'], prompt: 'نختار $0$ : $(0+4)\\times 2-2\\times 0=$', expected: 8,
            explain: '$4\\times 2=8$ ثم $8-0=8$ .' },
          { kind: 'solution', ask: 0, lines: ['$3$ ← $8$ ، و $10$ ← $8$ ، و $0$ ← $8$ .', 'النتيجة واحدة في كلّ مرّة: لا بدّ أنّ في البرنامج سرًّا.'] },
        ],
      },
      {
        label: '2)', title: 'العبارة',
        question: 'اكتب البرنامج بعبارة حرفية بدلالة العدد المختار $x$ .',
        asks: ['العبارة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['barnamij'],
            prompt: 'العبارة التي تترجم البرنامج هي:',
            options: ['$2(x+4)-2x$', '$2x+4-2x$', '$x+4\\times 2-2x$'], correct: 0, cols: 1,
            explain: 'نجمع $4$ ثم نضرب المجموع كلّه في $2$ : القوس ضروري. ثم نطرح $2x$ . ($2x+4$ يضرب $x$ وحده في $2$ .)' },
          { kind: 'solution', ask: 0, lines: ['أضف $4$ : $x+4$ . اضرب في $2$ : $2(x+4)$ .', 'اطرح ضعف العدد: $2(x+4)-2x$ .'] },
        ],
      },
      {
        label: '3)', title: 'التبسيط',
        question: 'بسّط العبارة. ماذا تلاحظ؟',
        asks: ['العدد'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tajmi'], prompt: '$2(x+4)=2x+8$ ، إذن $2(x+4)-2x=2x+8-2x=$', expected: 8,
            explain: '$2x-2x=(2-2)\\times x=0\\times x=0$ ، فيبقى $8$ .' },
          { kind: 'solution', ask: 0, lines: ['$2(x+4)-2x=2x+8-2x$ .', '$2x-2x=(2-2)x=0\\times x=0$ ، فالنتيجة $8$ مهما كان $x$ .'] },
        ],
      },
      {
        label: '4)', title: 'هل يتغيّر العدد؟',
        question: 'هل يمكن أن يعطي البرنامج عددًا آخر غير $8$ ؟',
        asks: ['الجواب'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tajmi'],
            prompt: 'بعد التبسيط لم يبق الحرف $x$ في العبارة، لذلك:',
            options: ['لا: النتيجة $8$ دائمًا', 'نعم: النتيجة تتغيّر مع $x$', 'نعم: من أجل الأعداد الكبيرة'], correct: 0, cols: 1,
            explain: 'العبارة المبسّطة $8$ لا تحتوي الحرف، فلا تتغيّر النتيجة.' },
          { kind: 'solution', ask: 0, lines: ['العبارة المبسّطة هي العدد $8$ .', 'لا يتغيّر مهما اختير العدد: هذا سرّ الساحر.'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
