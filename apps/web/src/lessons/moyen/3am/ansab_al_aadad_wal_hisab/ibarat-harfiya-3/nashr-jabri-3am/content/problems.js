/**
 * Les trois « مسائل » du درس « نشر عبارات جبرية » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). Ajouts de la plateforme (`exam_style_problem`) : autres contextes et autres nombres que le manuel. La مسألة 1
 * (`LESSON_CONFIG.lessonProblem` : une cour rectangulaire (x + 7)(x + 4) dont un bandeau est planté d'arbres) développe un produit de deux
 * sommes puis soustrait un k(a + b) ; la 2 un programme de calcul (un produit de deux sommes moins un carré : les x² se détruisent) ;
 * la 3 un terrain carré dont deux allées se croisent (le coin rendu : (x − 2)(x − 3)). Chaque nombre est vérifié dans ./problems.test.js
 * par une arithmétique indépendante.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — ساحة المدرسة',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🌳',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'بعدا الساحة بالمتر: x + 7 و x + 4', useful: true },
      { id: 'd2', text: 'شريط الأشجار عرضه 2 م على طول البعد x + 7', useful: true },
      { id: 'd3', text: 'ثمن المتر المربّع من العشب 150 دج', useful: true },
      { id: 'd4', text: 'تتعاون الأقسام على غرس الساحة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مساحة الساحة كلها',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['مساحة الساحة بعد النشر'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jidaa-qawsayn'], prompt: 'أيّ عبارة تمثّل مساحة الساحة بعد النشر والتبسيط؟',
            options: ['$x^2+11x+28$', '$x^2+28$', '$x^2+3x+28$'], correct: 0,
            explain: 'كل حدّ من القوس الأول يضرب كل حدّ من الثاني: $x^2+4x+7x+28=x^2+11x+28$.' },
          { kind: 'solution', ask: 0, lines: [
            'المساحة جداء البعدين: $(x+7)(x+4)$.',
            'ننشر بأربعة جداءات: $x\\times x+x\\times4+7\\times x+7\\times4=x^2+4x+7x+28$ ثم نجمع المتشابهة: $x^2+11x+28$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الجزء المعشوشب',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['مساحة الجزء المعشوشب', 'قيمتها من أجل x = 5'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tawzi-darb'], prompt: 'أيّ عبارة تعطي مساحة الجزء المعشوشب؟',
            options: ['$(x+7)(x+4)-2(x+7)$', '$(x+7)(x+4)-2$', '$(x+7)(x+4)+2(x+7)$'], correct: 0,
            explain: 'نطرح من مساحة الساحة كلها مساحة شريط الأشجار: عرضه 2 وطوله $(x+7)$.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['aqwas-tawzi'], prompt: 'بعد النشر والتبسيط نجد:',
            options: ['$x^2+9x+14$', '$x^2+9x+28$', '$x^2+13x+42$'], correct: 0,
            explain: '$x^2+11x+28-2x-14=x^2+9x+14$ : الإشارة $-$ قبل $2(x+7)$ تغيّر إشارة الحدّين بعد نشره.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tariqat-nashr'], prompt: 'مساحة الجزء المعشوشب بالمتر المربّع من أجل $x=5$:', expected: 84,
            explain: '$25+45+14=84$ م². وبالعبارة الأصلية: $12\\times9-2\\times12=108-24=84$ أيضًا.' },
          { kind: 'solution', ask: 0, lines: [
            'مساحة الجزء المعشوشب $(x+7)(x+4)-2(x+7)=x^2+11x+28-2x-14$.',
            'نجمع المتشابهة: $x^2+9x+14$ ؛ ومن أجل $x=5$ : $25+45+14=84$ م².',
          ] },
        ],
      },
      {
        label: '3)', title: 'ثمن العشب',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['ثمن العشب'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-nashr'], prompt: 'ثمن العشب بالدينار من أجل $x=5$:', expected: 12600,
            explain: '$84\\times150=12600$ دج.' },
          { kind: 'solution', ask: 0, lines: [
            'مساحة الجزء المعشوشب من أجل $x=5$ هي 84 م².',
            'الثمن $84\\times150=12600$ دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — برنامج حساب',
    context: 'لعبة في نادي الأعداد',
    emoji: '🎯',
    tone: 'emerald',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'نختار', lines: [{ label: 'عدد', value: 'x' }] },
      { title: 'نضرب', lines: [{ label: 'مجموع في فرق', value: '(x + 4)(x - 2)' }] },
      { title: 'نطرح', lines: [{ label: 'مربّع العدد', value: 'x²' }] },
    ], ariaLabel: 'برنامج: نختار x ثم نضرب x + 4 في x − 2 ثم نطرح مربّع x' },
    statement: 'يلعب أعضاء نادي الأعداد لعبة يتناوبون فيها بالدور على النتيجة. البرنامج: اختر عددًا $x$ ، ثم اضرب ($x+4$) في ($x-2$) ، ثم اطرح من الناتج مربّع العدد $x$.',
    data: [
      { id: 'b1', text: 'نختار عددًا x', useful: true },
      { id: 'b2', text: 'نضرب (x + 4) في (x − 2)', useful: true },
      { id: 'b3', text: 'نطرح مربّع x من الناتج', useful: true },
      { id: 'b4', text: 'يتناوب الأعضاء بالدور', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'نتيجة البرنامج',
        question: 'اكتب نتيجة البرنامج بدلالة $x$ دون نشر.',
        asks: ['عبارة النتيجة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jidaa-qawsayn'], prompt: 'أيّ عبارة تعطي نتيجة البرنامج؟',
            options: ['$(x+4)(x-2)-x^2$', '$x+4(x-2)-x^2$', '$(x+4)(x-2)+x^2$'], correct: 0,
            explain: 'نضرب المجموع $(x+4)$ في الفرق $(x-2)$ ثم نطرح مربّع $x$.' },
          { kind: 'solution', ask: 0, lines: [
            'الضرب يخصّ المجموعين كليهما فنكتبهما بين قوسين: $(x+4)(x-2)$.',
            'ثم نطرح $x^2$ فنجد $(x+4)(x-2)-x^2$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'النشر والتبسيط',
        question: 'انشر العبارة وبسّطها.',
        asks: ['العبارة المبسّطة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jidaa-qawsayn'], prompt: 'بعد النشر والتبسيط نجد:',
            options: ['$2x-8$', '$x^2+2x-8$', '$2x+8$'], correct: 0,
            explain: '$x^2-2x+4x-8-x^2=2x-8$ : الحدّان $x^2$ و $-x^2$ يتلاشيان.' },
          { kind: 'solution', ask: 0, lines: [
            'ننشر الجداء: $(x+4)(x-2)=x^2-2x+4x-8=x^2+2x-8$.',
            'نطرح $x^2$ : $x^2+2x-8-x^2=2x-8$.',
          ] },
        ],
      },
      {
        label: '3)', title: 'نتيجة عدد معيّن',
        question: 'ما نتيجة البرنامج إذا اختار أحد الأعضاء العدد 10؟',
        asks: ['نتيجة البرنامج من أجل 10'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-nashr'], prompt: 'نتيجة البرنامج من أجل $x=10$:', expected: 12,
            explain: '$2\\times10-8=12$. وبالبرنامج نفسه: $14\\times8-100=112-100=12$ أيضًا.' },
          { kind: 'solution', ask: 0, lines: [
            'العبارة المبسّطة $2x-8$ تغني عن المرور على خطوات البرنامج.',
            'من أجل $x=10$ : $2\\times10-8=12$.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — أرض وممرّان',
    context: 'تهيئة حديقة بتطوّع التلاميذ',
    emoji: '🌿',
    tone: 'amber',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'الأرض', lines: [{ label: 'مربّعة', value: 'x' }] },
      { title: 'الممرّ الأول', lines: [{ label: 'عرضه', value: '2' }] },
      { title: 'الممرّ الثاني', lines: [{ label: 'عرضه', value: '3' }] },
    ], ariaLabel: 'أرض مربّعة ضلعها x يقتطع منها ممرّان عرضاهما 2 و 3 متر' },
    statement: 'يتطوّع تلاميذ المدرسة لتهيئة أرض مربّعة ضلعها $x$ متر. يُقتطع منها ممرّ عرضه 2 م على طول أحد الضلعين وممرّ عرضه 3 م على طول الضلع المجاور، ويُغرس العشب في ما بقي، وثمن المتر المربّع منه 120 دج.',
    data: [
      { id: 'c1', text: 'ضلع الأرض x متر', useful: true },
      { id: 'c2', text: 'عرض الممرّين 2 م و 3 م', useful: true },
      { id: 'c3', text: 'ثمن المتر المربّع من العشب 120 دج', useful: true },
      { id: 'c4', text: 'يتطوّع التلاميذ لتهيئة الأرض', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مساحة ما بقي',
        question: 'عبّر عن مساحة ما بقي بعد الممرّين ثم انشرها وبسّطها.',
        asks: ['مساحة ما بقي بعد النشر'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['masaha-tariqatayn'], prompt: 'أيّ عبارة تعطي مساحة ما بقي؟',
            options: ['$(x-2)(x-3)$', '$x^2-2-3$', '$(x-2)+(x-3)$'], correct: 0,
            explain: 'ما بقي مستطيل بعداه $(x-2)$ و $(x-3)$ ، ومساحته جداؤهما.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ishara-jidaa'], prompt: 'بعد النشر والتبسيط نجد:',
            options: ['$x^2-5x+6$', '$x^2-5x-6$', '$x^2-x+6$'], correct: 0,
            explain: '$x^2-3x-2x+6=x^2-5x+6$ : جداء $-2$ و $-3$ يساوي $+6$.' },
          { kind: 'solution', ask: 0, lines: [
            'بعدا ما بقي $(x-2)$ و $(x-3)$ ، فمساحته $(x-2)(x-3)$.',
            'ننشر: $x^2-3x-2x+6$ ثم نجمع: $x^2-5x+6$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'لماذا $+6$ ؟',
        question: 'فسّر ظهور الحدّ $+6$ في الناتج.',
        asks: ['تفسير الحدّ +6'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['rukn-yuad'], prompt: 'ما سبب ظهور الحدّ $+6$ ؟',
            options: ['ركن الممرّين طُرح مرّتين فنردّه مرّة', 'لأنّ مساحة الأرض زادت 6 م²', 'لأنّ $2+3+1=6$'], correct: 0,
            explain: 'الممرّان يشتركان في مربّع $2\\times3=6$ م² طُرح في كل منهما، فنردّه مرّة واحدة: وهو جداء العددين السالبين.' },
          { kind: 'solution', ask: 0, lines: [
            'نطرح من $x^2$ الممرّ الأول $2x$ والثاني $3x$.',
            'الركن $2\\times3=6$ داخل الممرّين معًا فطُرح مرّتين، فنضيفه مرّة واحدة: $x^2-2x-3x+6$.',
          ] },
        ],
      },
      {
        label: '3)', title: 'ثمن العشب',
        question: 'ما ثمن العشب بالدينار من أجل $x=10$؟',
        asks: ['ثمن العشب'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-nashr'], prompt: 'ثمن العشب بالدينار من أجل $x=10$:', expected: 6720,
            explain: 'المساحة $100-50+6=56$ م² (وكذلك $8\\times7=56$) ، والثمن $56\\times120=6720$ دج.' },
          { kind: 'solution', ask: 0, lines: [
            'من أجل $x=10$ : $x^2-5x+6=100-50+6=56$ م².',
            'الثمن $56\\times120=6720$ دج.',
          ] },
        ],
      },
    ],
  },
];
export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
