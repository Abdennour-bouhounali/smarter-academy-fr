/**
 * Les trois « مسائل » du درس « حساب قيمة عبارة حرفية » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). Ajouts de la plateforme (`exam_style_problem`) : autres contextes et autres nombres que le manuel. La مسألة 1
 * (`LESSON_CONFIG.lessonProblem` : le potager du collège, un rectangle (x + 3)(2x − 1)) développe puis évalue à un décimal et décide ;
 * la 2 compare deux programmes de calcul par des valeurs (le contre-exemple 2) puis un troisième par le développement ; la 3 évalue
 * T = 15 − 6h à des valeurs décimales dont une négative (le Chott Melghir, 40 m sous le niveau de la mer : les parenthèses).
 * Chaque nombre est vérifié dans ./problems.test.js par une arithmétique indépendante.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — حديقة القسم',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🌱',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'بعدا الأرض بالمتر: x + 3 و 2x − 1', useful: true },
      { id: 'd2', text: 'كيس البذور يكفي 20 م²', useful: true },
      { id: 'd3', text: 'القيمتان المقترحتان: x = 2,5 ثم x = 3,5', useful: true },
      { id: 'd4', text: 'يعتني بالأرض تلاميذ القسم', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مساحة الأرض',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['مساحة الأرض S بعد النشر'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tawid-qimat'], prompt: 'أيّ عبارة تمثّل المساحة $S$ بعد النشر والتبسيط ؟',
            options: ['$2x^2+5x-3$', '$2x^2+7x-3$', '$2x^2-5x-3$'], correct: 0,
            explain: '$(x+3)(2x-1)=2x^2-x+6x-3=2x^2+5x-3$ ؛ أربعة جداءات ثم جمع المتشابهة.' },
          { kind: 'solution', ask: 0, lines: [
            'المساحة جداء البعدين: $S=(x+3)(2x-1)$.',
            'ننشر بأربعة جداءات: $2x^2-x+6x-3$ ثم نجمع المتشابهة: $S=2x^2+5x-3$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'القيمة من أجل $x=2{,}5$',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['قيمة S من أجل x = 2,5'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tawid-qimat'], prompt: 'قيمة $S$ بالمتر المربع من أجل $x=2{,}5$ :', expected: 22,
            explain: '$(2{,}5+3)(2\\times2{,}5-1)=5{,}5\\times4=22$ ؛ وبالصورة المنشورة $12{,}5+12{,}5-3=22$ أيضًا.' },
          { kind: 'solution', ask: 0, lines: [
            'نعوّض $x$ بـ $2{,}5$ في كل مكان: $S=(2{,}5+3)\\times(2\\times2{,}5-1)=5{,}5\\times4$.',
            'ومنه $S=22$ م². وبالصورة المنشورة: $2\\times2{,}5^2+5\\times2{,}5-3=12{,}5+12{,}5-3=22$ ، النتيجة نفسها.',
          ] },
        ],
      },
      {
        label: '3)', title: 'هل يكفي كيس واحد؟',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['الحكم على كفاية كيس واحد'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tawid-qimat'], prompt: 'هل يكفي كيس واحد من البذور (يكفي $20$ م²) ؟',
            options: ['لا: $22>20$ فيلزم كيسان', 'نعم: $22$ قريبة من $20$', 'نعم: الكيس يكفي كل أرض'], correct: 0,
            explain: 'مساحة الأرض $22$ م² أكبر من $20$ م²، فلا يكفي كيس واحد.' },
          { kind: 'solution', ask: 0, lines: [
            'مساحة الأرض من أجل $x=2{,}5$ هي $22$ م².',
            'الكيس يكفي $20$ م² فقط، وهي أصغر من $22$ ، فلا يكفي كيس واحد ويلزم كيسان.',
          ] },
        ],
      },
      {
        label: '4)', title: 'القيمة من أجل $x=3{,}5$',
        question: LESSON_CONFIG.lessonProblem.questions[3].text,
        asks: ['قيمة S من أجل x = 3,5'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tawid-qimat'], prompt: 'قيمة $S$ من أجل $x=3{,}5$ :', expected: 39,
            explain: '$(3{,}5+3)(2\\times3{,}5-1)=6{,}5\\times6=39$ ؛ وبالصورة المنشورة $24{,}5+17{,}5-3=39$.' },
          { kind: 'solution', ask: 0, lines: [
            'نعوّض بـ $3{,}5$: $S=(3{,}5+3)\\times(2\\times3{,}5-1)=6{,}5\\times6=39$ م².',
            'وهي أكبر من $20$ م² أيضًا، ولا يكفي كيس واحد.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — برنامجا حساب',
    context: 'تحدّي نادي الأعداد',
    emoji: '🎯',
    tone: 'emerald',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'البرنامج الأول', lines: [{ label: 'نضيف إلى العدد', value: '3' }, { label: 'نطرح من المربّع', value: '9' }] },
      { title: 'البرنامج الثاني', lines: [{ label: 'نضيف إلى المربّع', value: '6' }] },
      { title: 'تجربة أمين', lines: [{ label: 'جرّب العدد', value: '1' }, { label: 'وجد', value: '7' }] },
    ], ariaLabel: 'برنامجان للحساب وتجربة أمين بالعدد 1' },
    statement: 'يلعب أمين وسلمى في نادي الأعداد لعبة برنامجين للحساب. البرنامج الأول: اختر عددًا $x$ ، أضف إليه 3 ، ربّع الناتج ثم اطرح 9. البرنامج الثاني: اختر العدد $x$ نفسه، ربّعه ثم أضف 6. جرّب أمين العدد 1 فوجد 7 في البرنامجين، فقال: البرنامجان متساويان.',
    data: [
      { id: 'b1', text: 'البرنامج الأول: (x + 3)² − 9', useful: true },
      { id: 'b2', text: 'البرنامج الثاني: x² + 6', useful: true },
      { id: 'b3', text: 'جرّب أمين العدد 1 فوجد 7 في البرنامجين', useful: true },
      { id: 'b4', text: 'يلعب أمين وسلمى في نادي الأعداد', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'القيمتان من أجل 1',
        question: 'احسب نتيجة كل برنامج من أجل $x=1$.',
        asks: ['نتيجة البرنامج الأول من أجل 1', 'نتيجة البرنامج الثاني من أجل 1'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tawid-qimat'], prompt: 'نتيجة البرنامج الأول من أجل $x=1$ :', expected: 7,
            explain: '$(1+3)^2-9=16-9=7$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tawid-qimat'], prompt: 'نتيجة البرنامج الثاني من أجل $x=1$ :', expected: 7,
            explain: '$1^2+6=7$.' },
          { kind: 'solution', ask: 0, lines: [
            'البرنامج الأول: $x+3=4$ ثم $4^2=16$ ثم $16-9=7$.',
            'البرنامج الثاني: $1^2=1$ ثم $1+6=7$. فعلًا القيمتان متساويتان من أجل $x=1$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'القيمتان من أجل 2',
        question: 'احسب نتيجة كل برنامج من أجل $x=2$.',
        asks: ['نتيجة البرنامج الأول من أجل 2', 'نتيجة البرنامج الثاني من أجل 2'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tawid-qimat'], prompt: 'نتيجة البرنامج الأول من أجل $x=2$ :', expected: 16,
            explain: '$(2+3)^2-9=25-9=16$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tawid-qimat'], prompt: 'نتيجة البرنامج الثاني من أجل $x=2$ :', expected: 10,
            explain: '$2^2+6=4+6=10$.' },
          { kind: 'solution', ask: 0, lines: [
            'البرنامج الأول: $(2+3)^2-9=25-9=16$.',
            'البرنامج الثاني: $2^2+6=10$. القيمتان $16$ و $10$ مختلفتان.',
          ] },
        ],
      },
      {
        label: '3)', title: 'حكمك على قول أمين',
        question: 'هل البرنامجان متساويان ؟ برّر.',
        asks: ['الحكم على المساواة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mithal-mudad'], prompt: 'ما حكمك على قول أمين ؟',
            options: ['غير متساويين: العدد 2 مثال مضاد', 'متساويان لأنّ القيمتين تساويتا من أجل 1', 'لا يمكن الحكم بالقيم'], correct: 0,
            explain: 'القيمتان $16$ و $10$ من أجل $x=2$ مختلفتان، وذلك يكفي لإبطال المساواة؛ اتفاقهما من أجل $1$ لا يثبتها.' },
          { kind: 'solution', ask: 0, lines: [
            'من أجل $x=2$ تساوي نتيجة الأول $16$ ونتيجة الثاني $10$.',
            'قيمة واحدة مختلفة تكفي: البرنامجان غير متساويين و $2$ مثال مضاد، وتجربة أمين بالعدد $1$ لا تبرهن شيئًا.',
          ] },
        ],
      },
      {
        label: '4)', title: 'برنامج ثالث',
        question: 'البرنامج الثالث: اختر عددًا واضربه في نفسه مضافًا إليه 6. احسب نتيجته من أجل $x=-1$ ، ثم قارنه بالبرنامج الأول بعد النشر.',
        asks: ['نتيجة البرنامج الثالث من أجل -1', 'المقارنة بعد النشر'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tawid-qimat'], prompt: 'نتيجة البرنامج الثالث $x(x+6)$ من أجل $x=-1$ :', expected: -5,
            explain: '$(-1)\\times(-1+6)=(-1)\\times5=-5$ ؛ والبرنامج الأول يعطي أيضًا $(-1+3)^2-9=4-9=-5$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['mithal-mudad'], prompt: 'بعد نشر البرنامجين الأول والثالث نجد:',
            options: ['كلاهما $x^2+6x$ فهما متساويان', 'الأول $x^2+6x$ والثالث $x^2+6$', 'الأول $x^2+9$ والثالث $x^2+6x$'], correct: 0,
            explain: '$(x+3)^2-9=x^2+6x+9-9=x^2+6x$ و $x(x+6)=x^2+6x$ : الصورتان المنشورتان واحدة، فالمساواة صحيحة من أجل كل $x$.' },
          { kind: 'solution', ask: 0, lines: [
            'نتيجة الثالث من أجل $-1$ : $(-1)\\times(-1+6)=-5$ ، وهي نتيجة الأول نفسها.',
            'قيمة متفقة لا تكفي، فننشر: $(x+3)(x+3)-9=x^2+6x$ ، والثالث $x^2+6x$ : متساويان.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — من جرجرة إلى شطّ ملغيغ',
    context: 'رحلة علمية في الجزائر',
    emoji: '⛰️',
    tone: 'amber',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'درجة الحرارة', lines: [{ label: 'عند سطح البحر', value: '15' }, { label: 'تنخفض لكل كلم', value: '6' }] },
      { title: 'شطّ ملغيغ', lines: [{ label: 'تحت سطح البحر بالمتر', value: '40' }] },
    ], ariaLabel: 'درجة الحرارة عند سطح البحر 15 وتنخفض 6 درجات لكل كيلومتر، وشطّ ملغيغ 40 مترًا تحت سطح البحر' },
    statement: 'في يوم ما تنخفض درجة الحرارة (بالدرجة المئوية) حسب العلاقة $T=15-6h$ حيث $h$ الارتفاع بالكيلومتر عن سطح البحر: عند سطح البحر 15 درجة وتنخفض 6 درجات لكل كيلومتر. يزور تلاميذ القسم جبال جرجرة ثم شطّ ملغيغ الذي يقع 40 م تحت سطح البحر، أي $h=-0{,}04$.',
    data: [
      { id: 'c1', text: 'العلاقة T = 15 − 6h حيث h الارتفاع بالكيلومتر', useful: true },
      { id: 'c2', text: 'شطّ ملغيغ يقع 40 م تحت سطح البحر: h = −0,04', useful: true },
      { id: 'c3', text: 'عند سطح البحر 15 درجة وتنخفض 6 درجات لكل كيلومتر', useful: true },
      { id: 'c4', text: 'يزور تلاميذ القسم جبال جرجرة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'في جبال جرجرة',
        question: 'ما درجة الحرارة على ارتفاع $2{,}5$ كلم ثم على ارتفاع $3$ كلم؟',
        asks: ['الحرارة عند 2,5 كلم', 'الحرارة عند 3 كلم'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tawid-qimat'], prompt: 'درجة الحرارة من أجل $h=2{,}5$ :', expected: 0,
            explain: '$15-6\\times2{,}5=15-15=0$ °C.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tawid-qimat'], prompt: 'درجة الحرارة من أجل $h=3$ :', expected: -3,
            explain: '$15-6\\times3=15-18=-3$ °C.' },
          { kind: 'solution', ask: 0, lines: [
            'نعوّض $h$ بـ $2{,}5$ : $T=15-6\\times2{,}5=15-15=0$ °C.',
            'ثم بـ $3$ : $T=15-6\\times3=15-18=-3$ °C ؛ أي تحت الصفر.',
          ] },
        ],
      },
      {
        label: '2)', title: 'عند شطّ ملغيغ',
        question: 'ما درجة الحرارة عند شطّ ملغيغ، حيث $h=-0{,}04$ ؟',
        asks: ['الحرارة عند شطّ ملغيغ'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['aqwas-salib'], prompt: 'درجة الحرارة من أجل $h=-0{,}04$ :', expected: 15.24, display: '15,24',
            explain: '$15-6\\times(-0{,}04)=15+0{,}24=15{,}24$ °C ؛ نضع القيمة السالبة بين قوسين فتصير $-6\\times(-0{,}04)=+0{,}24$.' },
          { kind: 'solution', ask: 0, lines: [
            'نضع القيمة السالبة بين قوسين: $T=15-6\\times(-0{,}04)$.',
            'جداء $6$ و $-0{,}04$ يساوي $-0{,}24$ ، ونطرحه: $15-(-0{,}24)=15{,}24$ °C.',
          ] },
        ],
      },
      {
        label: '3)', title: 'على ارتفاع 2,3 كلم',
        question: 'ما درجة الحرارة على ارتفاع $2{,}3$ كلم ؟',
        asks: ['الحرارة عند 2,3 كلم'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tawid-qimat'], prompt: 'درجة الحرارة من أجل $h=2{,}3$ :', expected: 1.2, display: '1,2',
            explain: '$15-6\\times2{,}3=15-13{,}8=1{,}2$ °C.' },
          { kind: 'solution', ask: 0, lines: [
            'نعوّض: $T=15-6\\times2{,}3=15-13{,}8$.',
            'ومنه $T=1{,}2$ °C.',
          ] },
        ],
      },
      {
        label: '4)', title: 'أين الأدفأ؟',
        question: 'أين تكون الحرارة أعلى: عند شطّ ملغيغ أم عند سطح البحر ($h=0$) ؟',
        asks: ['المقارنة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['aqwas-salib'], prompt: 'من أجل $h=0$ نجد $15$ ، وعند شطّ ملغيغ $15{,}24$ . إذن:',
            options: ['شطّ ملغيغ أدفأ بقليل لأنّه أخفض من سطح البحر', 'سطح البحر أدفأ لأنّ $h=0$', 'الحرارتان متساويتان'], correct: 0,
            explain: 'كلّما نزلنا تحت سطح البحر صار $h$ سالبًا فتزداد الحرارة: $15{,}24>15$.' },
          { kind: 'solution', ask: 0, lines: [
            'من أجل $h=0$ : $T=15-6\\times0=15$ °C.',
            'عند شطّ ملغيغ $T=15{,}24$ °C وهي أكبر، لأنّ $h$ سالب.',
          ] },
        ],
      },
    ],
  },
];
export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
