/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (modules 1 à 6) — des situations COMPLÈTES de type امتحان autour des quatre leçons de l'unité 4 (تبسيط، نشر، حساب القيمة، مقارنة بإشارة
 * الفرق), résolues pas à pas (GuidedProblem) AVANT l'analyse (module 7) et la situation évaluée (module 8). Le مربّع سحري du manuel (`deep-47`, grille à moitié lisible) est REDESSINÉ
 * (grille complète de la plateforme), les trois triangles du rectangle (`deep-35`) et la distance d'arrêt (`evaluation`) sont REDESSINÉS avec d'autres nombres et d'autres formules ;
 * les situations 2, 3 et 4 sont de la plateforme. Aucune notion nouvelle : pas d'identité nommée (4AM), pas de factorisation, pas d'équation résolue formellement, pas d'inéquation manipulée.
 * Une réponse en expression se CHOISIT (le GuidedProblem saisit des nombres décimaux) ; chaque nombre est recalculé dans ./problems.test.js (BigInt).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const SOURCE = addition('exam_style_problem');
const T = 'tabsit-hadhf-aqwas-3am';
const N = 'nashr-jabri-3am';
const Q = 'qimat-ibara-harfiya-3am';
const M = 'muqaranat-natiqayn-3am';

export const PROBLEMS = [
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — المربّع السحري',
    context: 'ركن الألغاز في النادي: تتميم مربّع سحري بمجاميع عبارات',
    emoji: '🧩',
    source: src('deep-47', 67, 'أتعمّق', 47),
    tone: 'violet',
    table: {
      head: ['السطر', 'العمود الأوّل', 'العمود الثاني', 'العمود الثالث'],
      rows: [['الأوّل', '$-2a-2$', '؟', '$2a-4$'], ['الثاني', '؟', '$a-1$', '؟'], ['الثالث', '$2$', '؟', '$4a$']],
      caption: 'المربّع السحري (؟ خانة فارغة)',
    },
    statement: 'في ركن الألغاز بنادي المدرسة مربّع سحري $3 \\times 3$ : المجموع نفسه على كل سطر وعلى كل عمود وعلى كل قطر. أُعطيت الخانات: $-2a-2$ و $2a-4$ و $a-1$ و $2$ و $4a$ ، والباقي فارغ.',
    data: [
      { id: 'cells', text: 'الخانات المعطاة: −2a−2 و 2a−4 و a−1 و 2 و 4a', useful: true },
      { id: 'rule', text: 'المجموع نفسه على كل سطر وكل عمود وكل قطر', useful: true },
      { id: 'size', text: 'المربّع 3 × 3', useful: true },
      { id: 'corner', text: 'الألغاز في ركن النادي', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المجموع السحري',
        question: 'ما المجموع السحري بدلالة $a$ ، انطلاقًا من القطر الذي خاناته الثلاث معلومة؟',
        asks: ['المجموع السحري'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: [T], prompt: 'مجموع القطر الكامل: $(-2a-2) + (a-1) + 4a =$',
            options: ['$3a - 3$', '$3a + 3$', '$7a - 3$'], correct: 0, cols: 3,
            explain: 'نجمع الحدود التي فيها $a$ : $-2a + a + 4a = 3a$ ، والأعداد: $-2 - 1 = -3$ . الإجابة $3a + 3$ أخطأت في إشارة الثابت، و $7a - 3$ جمعت المعاملات دون إشاراتها.' },
          { kind: 'solution', ask: 0, lines: ['القطر الذي خاناته معلومة: $-2a-2$ و $a-1$ و $4a$ .', 'مجموعه $3a - 3$ ، وهو المجموع السحري.'] },
        ],
      },
      {
        label: '2)', title: 'تحقّق بالقطر الآخر',
        question: 'ما مجموع القطر الآخر، وهل يوافق المجموع السحري؟',
        asks: ['مجموع القطر الآخر', 'الحكم'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [T], prompt: '$(2a-4) + (a-1) + 2 =$', options: ['$3a - 3$', '$3a - 7$', '$3a + 5$'], correct: 0, cols: 3,
            explain: '$2a + a = 3a$ ، والأعداد: $-4 - 1 + 2 = -3$ . الإجابة $3a - 7$ طرحت العدد $2$ بدل أن تجمعه.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: [T], prompt: 'نقارن بما وجدناه قبل قليل:',
            options: ['يوافقه: المجموعان $3a - 3$ ، فالقيم متّسقة', 'لا يوافقه، فالمربّع غير ممكن', 'لا نستطيع الحكم قبل أن نعرف $a$'], correct: 0, cols: 1,
            explain: 'العبارتان متساويتان مهما كانت $a$ ، فلا حاجة إلى قيمة بعينها؛ وهذا تأكيد على صحة الخانات المعطاة.' },
          { kind: 'solution', ask: 0, lines: ['القطر الآخر: $(2a-4) + (a-1) + 2 = 3a - 3$ .', 'هو المجموع السحري نفسه: القطران متّسقان.'] },
        ],
      },
      {
        label: '3)', title: 'الخانات الأربع الناقصة',
        question: 'ما الخانات الأربع الفارغة: وسط السطر الأوّل، ووسط السطر الثاني على يساره، وعلى يمينه، ووسط السطر الثالث؟',
        asks: ['وسط السطر الأوّل', 'يسار وسط السطر الثاني', 'يمين وسط السطر الثاني', 'وسط السطر الثالث'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [T], prompt: 'السطر الأوّل: $(-2a-2) + ? + (2a-4) = 3a - 3$ ، فالخانة:',
            options: ['$3a + 3$', '$3a - 3$', '$a + 3$'], correct: 0, cols: 3,
            explain: '$? = 3a - 3 - (-2a-2) - (2a-4) = 3a - 3 + 2a + 2 - 2a + 4 = 3a + 3$ . نغيّر إشارة كل حدّ داخل القوسين المسبوقين بـ «ناقص».' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: [T], prompt: 'العمود الأوّل: $(-2a-2) + ? + 2 = 3a - 3$ ، فالخانة:',
            options: ['$5a - 3$', '$a - 3$', '$5a - 7$'], correct: 0, cols: 3,
            explain: '$? = 3a - 3 + 2a + 2 - 2 = 5a - 3$ .' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: [T], prompt: 'العمود الثالث: $(2a-4) + ? + 4a = 3a - 3$ ، فالخانة:',
            options: ['$1 - 3a$', '$3a - 1$', '$-3a - 7$'], correct: 0, cols: 3,
            explain: '$? = 3a - 3 - 2a + 4 - 4a = -3a + 1 = 1 - 3a$ . الإجابة $3a - 1$ هي الخانة بإشارة معكوسة.' },
          { kind: 'choice', role: 'conclude', ask: 3, requires: [T], prompt: 'السطر الثالث: $2 + ? + 4a = 3a - 3$ ، فالخانة:',
            options: ['$-a - 5$', '$-a + 5$', '$7a - 1$'], correct: 0, cols: 3,
            explain: '$? = 3a - 3 - 2 - 4a = -a - 5$ .' },
          { kind: 'solution', ask: 0, lines: ['وسط السطر الأوّل $3a + 3$ ، ويسار وسط الثاني $5a - 3$ ، ويمينه $1 - 3a$ .', 'ووسط السطر الثالث $-a - 5$ ؛ كلٌّ منها من سطر أو عمود ناقص خانة واحدة.'] },
        ],
      },
      {
        label: '4)', title: 'من أجل a = 2',
        question: 'من أجل $a = 2$ ، ما مجموع السطر الأوسط؟ وهل يساوي المجموع السحري $3a - 3$ ؟',
        asks: ['مجموع السطر الأوسط', 'الحكم'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: [Q], prompt: 'الخانة اليسرى $5a - 3$ من أجل $a = 2$ :', expected: 7, explain: '$5 \\times 2 - 3 = 7$ .' },
          { kind: 'numeric', role: 'compute', requires: [Q], prompt: 'الخانة اليمنى $1 - 3a$ من أجل $a = 2$ :', expected: -5, explain: '$1 - 3 \\times 2 = 1 - 6 = -5$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: [Q], prompt: 'مجموع السطر الأوسط: $7 + 1 + (-5) =$', expected: 3, explain: '$7 + 1 - 5 = 3$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: [Q], prompt: 'المجموع السحري $3a - 3$ من أجل $a = 2$ :',
            options: ['$3 \\times 2 - 3 = 3$ ، فهما متساويان', '$3 \\times 2 - 3 = 9$ ، فهما مختلفان', '$3 + 2 - 3 = 2$ ، فهما مختلفان'], correct: 0, cols: 1,
            explain: '$3 \\times 2 - 3 = 3$ : المجموع على السطر الأوسط يوافق المجموع السحري، وهذا لا يبرهن على المساواة لكل $a$ لكنه يؤكّد حسابنا.' },
          { kind: 'solution', ask: 0, lines: ['من أجل $a = 2$ : السطر الأوسط $7$ و $1$ و $-5$ ، ومجموعه $3$ .', 'والمجموع السحري $3 \\times 2 - 3 = 3$ : متساويان.'] },
        ],
      },
      {
        label: '5)', title: 'من أجل a = −1',
        question: 'ما المجموع السحري من أجل $a = -1$ ؟',
        asks: ['المجموع السحري'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [Q], prompt: '$3a - 3 = 3 \\times (-1) - 3 =$', expected: -6, explain: '$3 \\times (-1) = -3$ ثم $-3 - 3 = -6$ . نضع العدد السالب بين قوسين.' },
          { kind: 'solution', ask: 0, lines: ['نعوّض $a$ بـ $-1$ بين قوسين: $3 \\times (-1) - 3$ .', 'المجموع السحري $-6$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — ساحة وممرّ',
    context: 'مساحة بدلالة x ثم قيمتها وثمن التهيئة',
    emoji: '🌿',
    source: SOURCE,
    tone: 'emerald',
    illustration: { kind: 'plan', shape: 'rect', fill: 'grass', w: 'x+6', h: 'x+3', unit: 'م', ariaLabel: 'ساحة مستطيلة بعداها x+6 و x+3 بالمتر، يمتدّ ممرّ عرضه 1,5 متر على طول البعد الأكبر' },
    statement: 'ساحة مستطيلة بعداها بالمتر $(x+6)$ و $(x+3)$ . يُبلَّط ممرّ عرضه $1{,}5\\,\\text{m}$ على طول البعد $(x+6)$ ، ويُعشَّب الباقي؛ ثمن المتر المربّع من العشب $120$ DA .',
    data: [
      { id: 'dims', text: 'بعدا الساحة (x+6) و (x+3) بالمتر', useful: true },
      { id: 'path', text: 'عرض الممرّ 1,5 م على طول البعد (x+6)', useful: true },
      { id: 'price', text: 'ثمن المتر المربّع من العشب 120 DA', useful: true },
      { id: 'school', text: 'الساحة أمام مدخل المدرسة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مساحة الساحة',
        question: 'ما مساحة الساحة كلّها بدلالة $x$ ؟',
        asks: ['مساحة الساحة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: [N], prompt: '$(x+6)(x+3) =$',
            options: ['$x^2 + 9x + 18$', '$x^2 + 18$', '$2x + 18$'], correct: 0, cols: 3,
            explain: 'ننشر كل حدّ في كل حدّ: $x^2 + 3x + 6x + 18 = x^2 + 9x + 18$ . الإجابة $x^2 + 18$ نسيت الجداءين المتقاطعين، و $2x + 18$ جمعت بدل أن تضرب.' },
          { kind: 'solution', ask: 0, lines: ['الساحة مستطيل: المساحة جداء البعدين $(x+6)(x+3)$ .', 'بعد النشر: $x^2 + 3x + 6x + 18 = x^2 + 9x + 18$ .'] },
        ],
      },
      {
        label: '2)', title: 'مساحة العشب',
        question: 'ما مساحة العشب بدلالة $x$ ؟',
        asks: ['مساحة العشب'],
        steps: [
          { kind: 'choice', role: 'translate', requires: [T], prompt: 'العشب مستطيل بعداه $(x+6)$ و ...',
            options: ['$(x + 1{,}5)$', '$(x + 4{,}5)$', '$(x + 3 + 1{,}5)$'], correct: 0, cols: 3,
            explain: 'الممرّ يأخذ $1{,}5$ من البعد $(x+3)$ : يبقى $x + 3 - 1{,}5 = x + 1{,}5$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: [N], prompt: '$(x+6)(x+1{,}5) =$',
            options: ['$x^2 + 7{,}5x + 9$', '$x^2 + 9x + 16{,}5$', '$x^2 + 1{,}5x + 9$'], correct: 0, cols: 1,
            explain: 'ننشر: $x^2 + 1{,}5x + 6x + 9 = x^2 + 7{,}5x + 9$ . الإجابة الثانية طرحت $1{,}5$ من مساحة الساحة بدل مساحة الممرّ، والثالثة أسقطت $6x$ .' },
          { kind: 'solution', ask: 0, lines: ['بعدا العشب $(x+6)$ و $(x + 3 - 1{,}5) = (x + 1{,}5)$ .', 'مساحته $(x+6)(x+1{,}5) = x^2 + 7{,}5x + 9$ .'] },
        ],
      },
      {
        label: '3)', title: 'المساحات من أجل x = 3,5',
        question: 'من أجل $x = 3{,}5$ ، ما مساحة الساحة؟ وما مساحة العشب؟ وما مساحة الممرّ؟',
        asks: ['مساحة الساحة', 'مساحة العشب', 'مساحة الممرّ'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [Q], prompt: '$(x+6)(x+3)$ من أجل $x = 3{,}5$ : $9{,}5 \\times 6{,}5 =$', expected: 61.75, suffix: 'm²', explain: '$9{,}5 \\times 6{,}5 = 61{,}75$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: [Q], prompt: '$(x+6)(x+1{,}5)$ من أجل $x = 3{,}5$ : $9{,}5 \\times 5 =$', expected: 47.5, suffix: 'm²', explain: '$9{,}5 \\times 5 = 47{,}5$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: [Q], prompt: 'مساحة الممرّ: $61{,}75 - 47{,}5 =$', expected: 14.25, suffix: 'm²', explain: '$61{,}75 - 47{,}5 = 14{,}25$ ؛ ونتحقّق: الممرّ $1{,}5 \\times 9{,}5 = 14{,}25$ .' },
          { kind: 'solution', ask: 0, lines: ['الساحة $9{,}5 \\times 6{,}5 = 61{,}75\\,\\text{m}^2$ ، والعشب $9{,}5 \\times 5 = 47{,}5\\,\\text{m}^2$ .', 'الممرّ $61{,}75 - 47{,}5 = 14{,}25\\,\\text{m}^2$ .'] },
        ],
      },
      {
        label: '4)', title: 'ثمن العشب',
        question: 'ما ثمن العشب بالدينار؟',
        asks: ['ثمن العشب'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [Q], prompt: '$47{,}5 \\times 120 =$', expected: 5700, suffix: 'DA', explain: '$47{,}5 \\times 120 = 5700$ .' },
          { kind: 'solution', ask: 0, lines: ['مساحة العشب $47{,}5\\,\\text{m}^2$ وثمن المتر المربّع $120$ DA .', 'الثمن $47{,}5 \\times 120 = 5700$ DA .'] },
        ],
      },
      {
        label: '5)', title: 'التحقّق',
        question: 'ما مجموع مساحتي العشب والممرّ؟ وماذا نستنتج؟',
        asks: ['المجموع', 'الاستنتاج'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [Q], prompt: '$47{,}5 + 14{,}25 =$', expected: 61.75, suffix: 'm²', explain: '$47{,}5 + 14{,}25 = 61{,}75$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: [Q], prompt: 'نستنتج أنّ:',
            options: ['الحسابات متّسقة: المجموع هو مساحة الساحة', 'الحسابات خاطئة لأنّ المجموع مختلف', 'لا علاقة بين الأعداد الثلاثة'], correct: 0, cols: 1,
            explain: 'العشب والممرّ يملآن الساحة بلا تداخل، فمجموع مساحتيهما يساوي مساحتها: $61{,}75$ .' },
          { kind: 'solution', ask: 0, lines: ['$47{,}5 + 14{,}25 = 61{,}75$ .', 'وهي مساحة الساحة: الحسابات متّسقة.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — برامج الحساب',
    context: 'ثلاثة برامج حساب قال يونس إنّها متساوية',
    emoji: '🧮',
    source: SOURCE,
    tone: 'sky',
    illustration: { kind: 'tags', cards: [
      { title: 'البرنامج الأوّل', icon: 'pen', lines: [{ label: 'أضف', value: 4 }, { label: 'اضرب الناتج في', value: 'العدد − 1' }] },
      { title: 'البرنامج الثاني', icon: 'pen', lines: [{ label: 'ربّع العدد ثم أضف', value: 'ثلاثة أضعافه' }, { label: 'اطرح', value: 4 }] },
      { title: 'البرنامج الثالث', icon: 'pen', lines: [{ label: 'ربّع العدد ثم اطرح', value: 4 }] },
    ], ariaLabel: 'ثلاث بطاقات لبرامج حساب: الأوّل يضيف 4 ثم يضرب الناتج في العدد ناقص 1، والثاني يربّع العدد ويضيف ثلاثة أضعافه ثم يطرح 4، والثالث يربّع العدد ثم يطرح 4' },
    statement: 'يعرض يونس ثلاثة برامج حساب لعدد $x$ . البرنامج الأوّل: أضف $4$ إلى العدد، ثم اضرب الناتج في (العدد مطروحًا منه $1$). البرنامج الثاني: ربّع العدد، أضف إليه ثلاثة أضعافه، ثم اطرح $4$ . البرنامج الثالث: ربّع العدد ثم اطرح $4$ . قال يونس: «الثلاثة متساوية، جرّبتُ $0$ فوجدت $-4$ في كلٍّ منها».',
    data: [
      { id: 'p1', text: 'البرنامج الأوّل: (x + 4)(x − 1)', useful: true },
      { id: 'p2', text: 'البرنامج الثاني: x² + 3x − 4', useful: true },
      { id: 'p3', text: 'البرنامج الثالث: x² − 4', useful: true },
      { id: 'yunus', text: 'قال يونس: جرّبتُ 0 فوجدت −4 في كلٍّ منها', useful: true },
      { id: 'friend', text: 'يونس أسرع تلاميذ القسم في الحساب', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'تجربة يونس',
        question: 'ما نتيجة كل برنامج من أجل $x = 0$ ؟',
        asks: ['نتيجة البرامج الثلاثة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: [T], prompt: 'عبارة البرنامج الأوّل:', options: ['$(x + 4)(x - 1)$', '$x + 4(x - 1)$', '$(x + 4) - 1$'], correct: 0, cols: 3,
            explain: 'نضيف $4$ أوّلًا ثم نضرب الناتج كلّه: الأقواس ضرورية حول $x + 4$ .' },
          { kind: 'numeric', role: 'compute', requires: [Q], prompt: 'البرنامج الأوّل عند $0$ : $(0 + 4)(0 - 1) =$', expected: -4, explain: '$4 \\times (-1) = -4$ .' },
          { kind: 'numeric', role: 'compute', requires: [Q], prompt: 'البرنامج الثاني عند $0$ : $0^2 + 3 \\times 0 - 4 =$', expected: -4, explain: '$0 + 0 - 4 = -4$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: [Q], prompt: 'البرنامج الثالث عند $0$ : $0^2 - 4 =$', expected: -4, explain: '$-4$ ؛ فالنتائج الثلاث $-4$ كما وجد يونس.' },
          { kind: 'solution', ask: 0, lines: ['البرنامج الأوّل $(0+4)(0-1) = -4$ ، والثاني $0 + 0 - 4 = -4$ .', 'والثالث $0 - 4 = -4$ : وجد يونس ما يقوله.'] },
        ],
      },
      {
        label: '2)', title: 'عدد آخر',
        question: 'ما نتيجة كل برنامج من أجل $x = 2$ ؟',
        asks: ['نتيجة البرنامج الثالث'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: [Q], prompt: 'الأوّل عند $2$ : $(2 + 4)(2 - 1) =$', expected: 6, explain: '$6 \\times 1 = 6$ .' },
          { kind: 'numeric', role: 'compute', requires: [Q], prompt: 'الثاني عند $2$ : $2^2 + 3 \\times 2 - 4 =$', expected: 6, explain: '$4 + 6 - 4 = 6$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: [Q], prompt: 'الثالث عند $2$ : $2^2 - 4 =$', expected: 0, explain: '$4 - 4 = 0$ .' },
          { kind: 'solution', ask: 0, lines: ['عند $2$ : الأوّل $6$ والثاني $6$ والثالث $0$ .', 'الثالث يخالف الآخرين.'] },
        ],
      },
      {
        label: '3)', title: 'الحكم على البرنامج الثالث',
        question: 'هل البرنامج الثالث يساوي الأوّلين؟',
        asks: ['الحكم'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [Q], prompt: 'الحكم:',
            options: ['لا: عند $x = 2$ يعطي $0$ والأوّلان $6$ ، وهذا مثال مضادّ يكفي', 'نعم: وجدنا $-4$ عند $0$ في الثلاثة', 'لا نستطيع الحكم قبل تجريب كل الأعداد'], correct: 0, cols: 1,
            explain: 'قيمة واحدة تختلف فيها العبارتان تكفي لإبطال المساواة. أمّا تطابقهما عند $0$ فلا يُثبت شيئًا.' },
          { kind: 'solution', ask: 0, lines: ['عند $x = 2$ : $x^2 - 4 = 0$ بينما $(x+4)(x-1) = 6$ .', 'إذن البرنامج الثالث غير مساوٍ للأوّلين، ومثال مضادّ واحد يكفي.'] },
        ],
      },
      {
        label: '4)', title: 'الأوّل والثاني',
        question: 'هل البرنامجان الأوّل والثاني متساويان، ولماذا؟',
        asks: ['الحكم المبرَّر'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: [Q], prompt: 'الأوّل عند $-\\frac{1}{2}$ : $\\left(-\\frac{1}{2} + 4\\right)\\left(-\\frac{1}{2} - 1\\right) =$', expected: -5.25, explain: '$\\frac{7}{2} \\times \\left(-\\frac{3}{2}\\right) = -\\frac{21}{4} = -5{,}25$ .' },
          { kind: 'numeric', role: 'compute', requires: [Q], prompt: 'الثاني عند $-\\frac{1}{2}$ : $\\frac{1}{4} - \\frac{3}{2} - 4 =$', expected: -5.25, explain: '$\\frac{1}{4} - \\frac{6}{4} - \\frac{16}{4} = -\\frac{21}{4} = -5{,}25$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: [N], prompt: 'القيم متطابقة في ثلاث قيم جُرّبت، فنحكم بأنّ البرنامجين:',
            options: ['متساويان لأنّنا ننشر: $(x+4)(x-1) = x^2 - x + 4x - 4 = x^2 + 3x - 4$', 'متساويان لأنّ القيم تطابقت ثلاث مرّات', 'غير متساويين لأنّ شكليهما مختلفان'], correct: 0, cols: 1,
            explain: 'تطابق القيم لا يبرهن؛ النشر يبرهن: العبارتان تؤولان إلى $x^2 + 3x - 4$ من أجل كل عدد $x$ .' },
          { kind: 'solution', ask: 0, lines: ['ننشر: $(x+4)(x-1) = x^2 - x + 4x - 4 = x^2 + 3x - 4$ .', 'هي عبارة البرنامج الثاني: البرنامجان متساويان من أجل كل $x$ ، أمّا الثالث فلا.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — اشتراكا القاعة',
    context: 'أيّ العرضين أرخص؟ نقارن بإشارة الفرق',
    emoji: '🏋️',
    source: SOURCE,
    tone: 'rose',
    illustration: { kind: 'tags', cards: [
      { title: 'العرض A', icon: 'ticket', lines: [{ label: 'اشتراك شهري', value: 600, unit: 'دج' }, { label: 'كل حصّة', value: 25, unit: 'دج' }] },
      { title: 'العرض B', icon: 'ticket', lines: [{ label: 'اشتراك شهري', value: 625, unit: 'دج' }, { label: 'كل حصّة', value: 24, unit: 'دج' }] },
    ], ariaLabel: 'بطاقتان: العرض A اشتراكه الشهري 600 دينار وثمن كل حصّة 25 دينارًا، والعرض B اشتراكه الشهري 625 دينارًا وثمن كل حصّة 24 دينارًا' },
    statement: 'تقترح قاعة رياضة عرضين: العرض A بـ $600$ DA في الشهر و $25$ DA لكل حصّة؛ والعرض B بـ $625$ DA في الشهر و $24$ DA لكل حصّة. يريد تلميذ أن يختار العرض الأرخص حسب عدد حصصه $x$ في الشهر.',
    data: [
      { id: 'a', text: 'العرض A: 600 DA في الشهر و 25 DA للحصّة', useful: true },
      { id: 'b', text: 'العرض B: 625 DA في الشهر و 24 DA للحصّة', useful: true },
      { id: 'x', text: 'x عدد حصص التلميذ في الشهر', useful: true },
      { id: 'hall', text: 'القاعة قرب ملعب الحيّ', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'كلفة كل عرض',
        question: 'عبّر عن كلفة كل عرض في الشهر بدلالة $x$ .',
        asks: ['كلفة العرض A', 'كلفة العرض B'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: [T], prompt: 'كلفة العرض A:', options: ['$A = 600 + 25x$', '$A = 625 + 24x$', '$A = 600x + 25$'], correct: 0, cols: 3,
            explain: 'الاشتراك الثابت $600$ يُضاف إلى $25$ لكل حصّة، أي $25x$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: [T], prompt: 'كلفة العرض B:', options: ['$B = 625 + 24x$', '$B = 600 + 25x$', '$B = 625x + 24$'], correct: 0, cols: 3,
            explain: 'الاشتراك الثابت $625$ وكل حصّة $24$ ، أي $B = 625 + 24x$ .' },
          { kind: 'solution', ask: 0, lines: ['العرض A: $A = 600 + 25x$ .', 'العرض B: $B = 625 + 24x$ .'] },
        ],
      },
      {
        label: '2)', title: 'الفرق',
        question: 'ما أبسط شكل للفرق $A - B$ ؟',
        asks: ['الفرق A − B'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [T], prompt: '$A - B = (600 + 25x) - (625 + 24x) =$',
            options: ['$x - 25$', '$x + 25$', '$49x - 25$'], correct: 0, cols: 3,
            explain: 'نحذف الأقواس مسبوقة بـ «ناقص»: $600 + 25x - 625 - 24x = x - 25$ . الإجابة $x + 25$ أخطأت في إشارة الثابت، و $49x - 25$ جمعت المعاملين بدل أن تطرحهما.' },
          { kind: 'solution', ask: 0, lines: ['$A - B = 600 + 25x - 625 - 24x$ .', 'حدود $x$ : $25x - 24x = x$ ، والثوابت: $600 - 625 = -25$ ؛ فالفرق $x - 25$ .'] },
        ],
      },
      {
        label: '3)', title: '12 حصّة',
        question: 'ما كلفة كل عرض لاثنتي عشرة حصّة؟ وأيّهما أرخص؟',
        asks: ['كلفة العرض A', 'كلفة العرض B', 'الأرخص'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [Q], prompt: '$A = 600 + 25 \\times 12 =$', expected: 900, suffix: 'DA', explain: '$25 \\times 12 = 300$ ثم $600 + 300 = 900$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: [Q], prompt: '$B = 625 + 24 \\times 12 =$', expected: 913, suffix: 'DA', explain: '$24 \\times 12 = 288$ ثم $625 + 288 = 913$ .' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: [M], prompt: 'من أجل $x = 12$ : $A - B = 12 - 25 = -13$ ، وهذا عدد سالب، إذن:',
            options: ['$A < B$ : العرض A أرخص', '$A > B$ : العرض A أرخص', '$A > B$ : العرض B أرخص'], correct: 0, cols: 1,
            explain: 'الفرق السالب يعني أنّ الأوّل أصغر: $A < B$ ، فالعرض A أرخص؛ ونتأكّد: $900 < 913$ . الخيار الثاني يناقض نفسه.' },
          { kind: 'solution', ask: 0, lines: ['$A = 900$ DA و $B = 913$ DA .', 'الفرق $A - B = -13 < 0$ : العرض A أرخص.'] },
        ],
      },
      {
        label: '4)', title: '30 حصّة',
        question: 'ما كلفة كل عرض لثلاثين حصّة؟ وأيّهما أرخص؟',
        asks: ['كلفة العرض A', 'كلفة العرض B', 'الأرخص'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [Q], prompt: '$A = 600 + 25 \\times 30 =$', expected: 1350, suffix: 'DA', explain: '$25 \\times 30 = 750$ ثم $600 + 750 = 1350$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: [Q], prompt: '$B = 625 + 24 \\times 30 =$', expected: 1345, suffix: 'DA', explain: '$24 \\times 30 = 720$ ثم $625 + 720 = 1345$ .' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: [M], prompt: 'من أجل $x = 30$ : $A - B = 30 - 25 = 5$ ، وهذا عدد موجب، إذن:',
            options: ['$A > B$ : العرض B أرخص', '$A < B$ : العرض A أرخص', '$A = B$ : العرضان متساويان'], correct: 0, cols: 1,
            explain: 'الفرق الموجب يعني أنّ الأوّل أكبر: $A > B$ ، فالعرض B أرخص؛ ونتأكّد: $1350 > 1345$ .' },
          { kind: 'solution', ask: 0, lines: ['$A = 1350$ DA و $B = 1345$ DA .', 'الفرق $A - B = 5 > 0$ : العرض B أرخص.'] },
        ],
      },
      {
        label: '5)', title: 'عدد الحصص المتساوي',
        question: 'من أجل أيّ عدد من الحصص يتساوى العرضان؟',
        asks: ['عدد الحصص'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [M], prompt: 'يتساوى العرضان عندما $A - B = 0$ ، أي $x - 25 = 0$ ، فعدد الحصص:', expected: 25, explain: '$x - 25 = 0$ عند $x = 25$ .' },
          { kind: 'numeric', role: 'compute', requires: [Q], prompt: 'نتحقّق: $A = 600 + 25 \\times 25 =$', expected: 1225, suffix: 'DA', explain: '$600 + 625 = 1225$ ، و $B = 625 + 24 \\times 25 = 625 + 600 = 1225$ أيضًا.' },
          { kind: 'solution', ask: 0, lines: ['يتساوى العرضان عند $x = 25$ حصّة.', 'عندها كلفة كل منهما $1225$ DA .'] },
        ],
      },
      {
        label: '6)', title: 'النصيحة',
        question: 'أيّ العرضين تنصح به تلميذًا يتدرّب ثلاث مرّات في الأسبوع، أي نحو $12$ حصّة في الشهر؟',
        asks: ['العرض الموصى به'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [M], prompt: 'ننصحه بـ:',
            options: ['العرض A لأنّ $12 < 25$ فـ $A - B < 0$', 'العرض B لأنّ ثمن حصّته أقلّ', 'أيّ عرض فالفرق معدوم'], correct: 0, cols: 1,
            explain: 'العرض B يربح فقط بعد $25$ حصّة؛ وقبل ذلك $x - 25$ سالب فالعرض A أرخص. ثمن الحصّة وحده لا يكفي لأنّ الاشتراك الثابت يختلف.' },
          { kind: 'solution', ask: 0, lines: ['لثلاث حصص في الأسبوع نحو $12$ حصّة في الشهر، وهي أقلّ من $25$ .', 'إذن $A - B = x - 25 < 0$ : ننصحه بالعرض A.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — مثلّثات في مستطيل',
    context: 'مساحات بدلالة x ثم مقارنتها',
    emoji: '📐',
    source: src('deep-35', 66, 'أتعمّق', 35),
    tone: 'amber',
    figure: {
      points: { A: [0, 0], B: [6, 0], C: [6, 4], D: [0, 4], E: [2, 0], F: [6, 1.5] },
      segments: [{ from: 'A', to: 'B' }, { from: 'B', to: 'C' }, { from: 'C', to: 'D' }, { from: 'D', to: 'A', label: '4' }, { from: 'A', to: 'E', label: '2' }, { from: 'B', to: 'F', label: 'x' }, ['D', 'E'], ['E', 'F'], ['D', 'F']],
      polygons: [{ points: ['E', 'D', 'F'], tone: 'amber' }],
      rightAngles: [['D', 'A', 'B']],
      ariaLabel: 'مستطيل ABCD فيه AB = 6 و AD = 4 ، والنقطة E على [AB] حيث AE = 2 ، والنقطة F على [BC] حيث BF = x ، والمثلث EDF مظلّل',
      maxWidth: 360,
    },
    statement: 'ABCD مستطيل: $AB = 6$ cm و $AD = 4$ cm . النقطة $E$ من $[AB]$ حيث $AE = 2$ cm ، والنقطة $F$ من $[BC]$ حيث $BF = x$ cm ، علمًا أنّ $0 \\le x \\le 4$ . ينقسم المستطيل إلى أربعة مثلّثات: $AED$ و $EBF$ و $DFC$ و $EDF$ .',
    data: [
      { id: 'ab', text: 'AB = 6 cm و AD = 4 cm', useful: true },
      { id: 'ae', text: 'AE = 2 cm', useful: true },
      { id: 'bf', text: 'BF = x cm مع 0 ≤ x ≤ 4', useful: true },
      { id: 'tri', text: 'أربعة مثلّثات AED و EBF و DFC و EDF', useful: true },
      { id: 'ink', text: 'المثلث EDF مظلّل في الرسم', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مساحة AED',
        question: 'ما مساحة المثلث $AED$ ؟',
        asks: ['مساحة AED'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: [Q], prompt: '$\\frac{1}{2} \\times AE \\times AD = \\frac{1}{2} \\times 2 \\times 4 =$', expected: 4, suffix: 'cm²', explain: 'المثلث $AED$ قائم في $A$ : $\\frac{1}{2} \\times 2 \\times 4 = 4$ .' },
          { kind: 'solution', ask: 0, lines: ['$AED$ قائم في $A$ وضلعاه القائمان $AE = 2$ و $AD = 4$ .', 'مساحته $\\frac{1}{2} \\times 2 \\times 4 = 4\\,\\text{cm}^2$ .'] },
        ],
      },
      {
        label: '2)', title: 'مساحة EBF',
        question: 'عبّر عن مساحة المثلث $EBF$ بدلالة $x$ .',
        asks: ['مساحة EBF'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [T], prompt: '$EB = 6 - 2 = 4$ ، ومساحة $EBF$ :', options: ['$2x$', '$4x$', '$6x$'], correct: 0, cols: 3,
            explain: 'المثلث قائم في $B$ : $\\frac{1}{2} \\times EB \\times BF = \\frac{1}{2} \\times 4 \\times x = 2x$ . الإجابة $4x$ نسيت النصف.' },
          { kind: 'solution', ask: 0, lines: ['$EB = AB - AE = 4$ و $BF = x$ .', 'المساحة $\\frac{1}{2} \\times 4 \\times x = 2x$ .'] },
        ],
      },
      {
        label: '3)', title: 'مساحة DFC',
        question: 'عبّر عن مساحة المثلث $DFC$ بدلالة $x$ .',
        asks: ['مساحة DFC'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [T], prompt: '$FC = 4 - x$ و $DC = 6$ ، ومساحة $DFC$ :', options: ['$12 - 3x$', '$12 + 3x$', '$24 - 6x$'], correct: 0, cols: 3,
            explain: 'المثلث قائم في $C$ : $\\frac{1}{2} \\times 6 \\times (4 - x) = 3(4 - x) = 12 - 3x$ . الإجابة الثالثة نسيت النصف، والثانية أخذت $FC = 4 + x$ .' },
          { kind: 'solution', ask: 0, lines: ['$DC = 6$ و $FC = 4 - x$ .', 'المساحة $\\frac{1}{2} \\times 6 \\times (4 - x) = 12 - 3x$ .'] },
        ],
      },
      {
        label: '4)', title: 'مجموع المساحات الثلاث',
        question: 'ما أبسط شكل لمجموع مساحات المثلّثات $AED$ و $EBF$ و $DFC$ ؟',
        asks: ['المجموع'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [T], prompt: '$4 + 2x + (12 - 3x) =$', options: ['$16 - x$', '$16 + x$', '$16 + 5x$'], correct: 0, cols: 3,
            explain: 'الأعداد: $4 + 12 = 16$ ، وحدود $x$ : $2x - 3x = -x$ . الإجابة $16 + 5x$ أضافت $3x$ بدل أن تطرحه.' },
          { kind: 'solution', ask: 0, lines: ['$4 + 2x + 12 - 3x$ بعد حذف الأقواس.', 'المجموع $16 - x$ .'] },
        ],
      },
      {
        label: '5)', title: 'مساحة EDF',
        question: 'ما مساحة المثلث $EDF$ بدلالة $x$ ؟ (مساحة المستطيل $24$ cm² )',
        asks: ['مساحة EDF'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [T], prompt: 'المستطيل مقسوم إلى المثلثات الأربعة: $EDF = 24 - (16 - x) =$', options: ['$8 + x$', '$8 - x$', '$40 - x$'], correct: 0, cols: 3,
            explain: 'نحذف الأقواس المسبوقة بـ «ناقص» فتتغيّر الإشارات: $24 - 16 + x = 8 + x$ . الإجابة $8 - x$ نسيت تغيير إشارة $x$ .' },
          { kind: 'solution', ask: 0, lines: ['مساحة المستطيل $6 \\times 4 = 24$ ، والمثلّثات الأربعة تملؤه.', '$EDF = 24 - (16 - x) = 24 - 16 + x = 8 + x$ .'] },
        ],
      },
      {
        label: '6)', title: 'من أجل x = 1',
        question: 'من أجل $x = 1$ ، ما مجموع مساحات المثلّثات الثلاثة الأولى؟ وما مساحة $EDF$ ؟',
        asks: ['المجموع', 'مساحة EDF'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [Q], prompt: '$16 - x$ من أجل $x = 1$ :', expected: 15, suffix: 'cm²', explain: '$16 - 1 = 15$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: [Q], prompt: '$8 + x$ من أجل $x = 1$ :', expected: 9, suffix: 'cm²', explain: '$8 + 1 = 9$ ؛ ونتحقّق: $15 + 9 = 24$ .' },
          { kind: 'solution', ask: 0, lines: ['من أجل $x = 1$ : المجموع $16 - 1 = 15$ .', 'ومساحة $EDF$ $8 + 1 = 9$ ؛ والمجموع الكلّي $15 + 9 = 24$ .'] },
        ],
      },
      {
        label: '7)', title: 'مقارنة',
        question: 'أيّهما أكبر: مجموع المساحات الثلاث $16 - x$ أم مساحة $EDF$ ؟',
        asks: ['الأكبر'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: [M], prompt: 'الفرق $(16 - x) - (8 + x) = 8 - 2x = 2(4 - x)$ ، وبما أنّ $x \\le 4$ فهو:',
            options: ['موجب أو معدوم: المجموع لا يقلّ عن $EDF$ ، ويتساويان عند $x = 4$ فقط', 'سالب دائمًا: $EDF$ أكبر', 'يتغيّر بتغيّر $x$ فلا نحكم'], correct: 0, cols: 1,
            explain: '$4 - x \\ge 0$ لأنّ $x \\le 4$ ، فجداء العدد الموجب $2$ في عدد موجب أو معدوم موجب أو معدوم. وينعدم عند $x = 4$ حين تقع $F$ على $C$ فنجد $12$ و $12$ .' },
          { kind: 'solution', ask: 0, lines: ['$(16 - x) - (8 + x) = 8 - 2x = 2(4 - x)$ .', 'لأنّ $0 \\le x \\le 4$ فالفرق موجب أو معدوم: المجموع أكبر أو يساوي $EDF$ ، والتساوي عند $x = 4$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — مسافة التوقّف',
    context: 'أيتفادى السائق الحاجز؟ قيمة عبارة بأعداد عشرية والقرار بالمقارنة',
    emoji: '🚗',
    source: src('evaluation', 68, 'وضعية للتقويم'),
    tone: 'teal',
    illustration: { kind: 'route', from: 'السيارة', to: 'الحاجز', distance: 45, unit: 'م', vehicles: [{ icon: 'car' }], ariaLabel: 'سيارة تسير نحو حاجز يبعد عنها 45 مترًا' },
    statement: 'تسير سيارة بسرعة $V$ (بـ km/h). خلال ثانية ردّ الفعل تقطع $D_R = \\frac{5V}{18}$ مترًا، ثم تقطع أثناء الفرملة $D_F = \\frac{V^2}{250}$ مترًا على طريق جافّ و $D_F = \\frac{V^2}{125}$ مترًا على طريق مبلَّل. مسافة التوقّف $D_A = D_R + D_F$ . يرى السائق حاجزًا على بعد $45\\,\\text{m}$ وهو يسير بـ $72$ km/h .',
    data: [
      { id: 'dr', text: 'D_R = 5V ÷ 18', useful: true },
      { id: 'df', text: 'D_F = V² ÷ 250 على الجافّ و V² ÷ 125 على المبلَّل', useful: true },
      { id: 'speed', text: 'السرعة 72 km/h والحاجز على بعد 45 m', useful: true },
      { id: 'da', text: 'D_A = D_R + D_F', useful: true },
      { id: 'brand', text: 'لون السيارة أبيض', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مسافة ردّ الفعل',
        question: 'ما $D_R$ من أجل $V = 72$ ؟',
        asks: ['مسافة ردّ الفعل'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: [Q], prompt: '$D_R = \\frac{5 \\times 72}{18} =$', expected: 20, suffix: 'm', explain: '$5 \\times 72 = 360$ ثم $360 \\div 18 = 20$ .' },
          { kind: 'solution', ask: 0, lines: ['نعوّض $V$ بـ $72$ : $D_R = \\frac{5 \\times 72}{18}$ .', 'المسافة $20\\,\\text{m}$ .'] },
        ],
      },
      {
        label: '2)', title: 'الطريق الجافّ',
        question: 'ما $D_F$ و $D_A$ على الطريق الجافّ من أجل $V = 72$ ؟',
        asks: ['D_F', 'D_A'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [Q], prompt: '$D_F = \\frac{72^2}{250} = \\frac{5184}{250} =$', expected: 20.736, suffix: 'm', explain: '$72^2 = 5184$ ، و $5184 \\div 250 = 20{,}736$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: [Q], prompt: '$D_A = 20 + 20{,}736 =$', expected: 40.736, suffix: 'm', explain: '$D_A = D_R + D_F = 40{,}736$ .' },
          { kind: 'solution', ask: 0, lines: ['$D_F = \\frac{72^2}{250} = 20{,}736$ .', '$D_A = 20 + 20{,}736 = 40{,}736\\,\\text{m}$ .'] },
        ],
      },
      {
        label: '3)', title: 'هل يتوقّف قبل الحاجز؟',
        question: 'ما الفرق $45 - D_A$ على الطريق الجافّ؟ وهل يتوقّف السائق قبل الحاجز؟',
        asks: ['الفرق', 'القرار'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [M], prompt: '$45 - 40{,}736 =$', expected: 4.264, suffix: 'm', explain: '$45 - 40{,}736 = 4{,}264$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: [M], prompt: 'الفرق موجب، إذن:', options: ['يتوقّف قبل الحاجز', 'يصطدم بالحاجز', 'يتوقّف عند الحاجز تمامًا'], correct: 0, cols: 1,
            explain: '$45 - D_A > 0$ تعني $D_A < 45$ : مسافة التوقّف أقصر من البعد عن الحاجز.' },
          { kind: 'solution', ask: 0, lines: ['$45 - D_A = 4{,}264 > 0$ .', 'مسافة التوقّف أقصر من $45\\,\\text{m}$ : يتوقّف السائق قبل الحاجز.'] },
        ],
      },
      {
        label: '4)', title: 'الطريق المبلَّل',
        question: 'على الطريق المبلَّل، ما $D_F$ و $D_A$ ؟ وهل يصطدم السائق بالحاجز؟',
        asks: ['D_F', 'D_A', 'القرار'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: [Q], prompt: '$D_F = \\frac{72^2}{125} = \\frac{5184}{125} =$', expected: 41.472, suffix: 'm', explain: '$5184 \\div 125 = 41{,}472$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: [Q], prompt: '$D_A = 20 + 41{,}472 =$', expected: 61.472, suffix: 'm', explain: '$D_A = 61{,}472$ .' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: [M], prompt: '$45 - D_A = 45 - 61{,}472 = -16{,}472$ ، وهو سالب، إذن:', options: ['يصطدم بالحاجز', 'يتوقّف قبل الحاجز', 'لا يمكن الحكم'], correct: 0, cols: 1,
            explain: 'الفرق السالب يعني $D_A > 45$ : السيارة لم تتوقّف بعد عند بلوغ الحاجز.' },
          { kind: 'solution', ask: 0, lines: ['$D_F = 41{,}472$ ثم $D_A = 20 + 41{,}472 = 61{,}472\\,\\text{m}$ .', '$45 - 61{,}472 < 0$ : يصطدم السائق بالحاجز.'] },
        ],
      },
      {
        label: '5)', title: 'سرعة أكبر',
        question: 'ما مسافة التوقّف على طريق جافّ من أجل $V = 90$ ؟',
        asks: ['مسافة التوقّف'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: [Q], prompt: '$D_R = \\frac{5 \\times 90}{18} =$', expected: 25, suffix: 'm', explain: '$450 \\div 18 = 25$ .' },
          { kind: 'numeric', role: 'compute', requires: [Q], prompt: '$D_F = \\frac{90^2}{250} =$', expected: 32.4, suffix: 'm', explain: '$8100 \\div 250 = 32{,}4$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: [Q], prompt: '$D_A = 25 + 32{,}4 =$', expected: 57.4, suffix: 'm', explain: '$D_A = 57{,}4$ : أكبر من $45$ ، فعند $90$ km/h يصطدم السائق حتى على الجافّ.' },
          { kind: 'solution', ask: 0, lines: ['$D_R = 25$ و $D_F = 32{,}4$ .', '$D_A = 57{,}4\\,\\text{m} > 45\\,\\text{m}$ .'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
