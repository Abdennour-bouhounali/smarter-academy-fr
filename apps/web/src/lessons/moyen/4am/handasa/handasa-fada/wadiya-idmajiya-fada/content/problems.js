/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (modules 1 à 6) — des situations COMPLÈTES de type امتحان, résolues pas à pas
 * (common/problems/GuidedProblem.jsx), AVANT la وضعية du seau (module 7, le تحدّ du manuel p. 163, lue et résolue) et le « إختبار أولي » (8, le verre de frappé).
 *
 * Décision du propriétaire (2026-10-13), comme pour l'unité 1 : que l'élève s'exerce sur beaucoup de situations avant celle sur
 * laquelle il est évalué. Le scan de l'unité 14 s'arrête à la page 169 et n'a aucune situation d'entraînement : ces six énoncés
 * sont des AJOUTS DE LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`), jamais présentés comme des exercices
 * du manuel. Chacune mobilise les quatre leçons de l'unité (la كرة et la جلّة, l'aire et le volume, les sections planes, le
 * تكبير et le تصغير) avec des outils des années précédentes (Pythagore, Thalès, le volume du cône et de l'أسطوانة, le litre) :
 *
 *   1  الكرة الأرضية في المكتبة      كرة (δ) / جلّة (β) : OM ? R ; aire 4πR² = 324π, volume 4/3·πR³ = 972π            (leçons 1, 2)
 *   2  الكرة الحجرية وقاعدتها         section d'une sphère : r² = R² − d² (R = 25 : d = 15 → r = 20 ; r = 15 → d = 20) ; aire 400π   (leçons 2, 3)
 *   3  حاوية النفايات                 sections d'une أسطوانة (parallèle à la base ; parallèle à l'axe à 8 cm : 30 × 60), litres (leçon 3)
 *   4  نموذج الخزّان المائي           k = 1/40, aire × k², volume × k³ : 144π m² → 900π cm² ; 40³ = 64000                  (leçons 2, 4)
 *   5  القمع وزيت الزيتون              cône réduit + Thalès : k = 2/3, WM = 6, V = 405π, V_huile = (2/3)³·V = 120π ≈ 377 cm³ (leçons 3, 4)
 *   6  علبة كرات التنس                 boule et أسطوانة : 36π ×2 dans 108π, vide 36π, rapport 2/3                          (leçons 2, 3)
 *
 * Le périmètre reste celui de la synthèse : jamais la formule du volume d'un tronc de cône (exclue), jamais de nouvelle notion ;
 * les RÉPONSES de la وضعية du seau (SO = 105, WM = 19, k = 15/19, 24388π/3, 25,54 L), du cornet (32π/3, 256π/3, 1/8, k = 1/2, 8 cm)
 * et du verre (SO = 24, WM = 5,5, k = 8/11, 819π/4, 643,24) n'apparaissent dans aucune de ces six situations. Chaque énoncé tisse UNE valeur (LESSON_DEVELOPMENT_GUIDE § « Values in story contexts ») : العلم والقراءة
 * (1), إتقان العمل (2), النظافة (3), حبّ الوطن (4), التكافل (5), التعاون (6). Le coefficient de π est demandé comme `a` dans
 * « $a\pi$ » (`numeric`), l'exact avant l'arrondi. Aucune sous-étape n'est une `assessment` : la maîtrise vient du module 8 seulement.
 *
 * Chaque nombre est recalculé dans ./problems.test.js.
 */
import { addition } from '../../_unit/unitMeta.js';
import { TRAIN_1_FIGURE, TRAIN_2_FIGURE, TRAIN_3_FIGURE, TRAIN_4_FIGURE, TRAIN_5_FIGURE, TRAIN_6_FIGURE } from './figures.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — الكرة الأرضية في المكتبة',
    context: 'موضع نقطة من الكرة والجلة، ومساحة وحجم',
    emoji: '🌍',
    source: SOURCE,
    tone: 'sky',
    figure: TRAIN_1_FIGURE,
    statement: 'أهدت مدرسة الحيّ المكتبة العمومية كرة أرضية مجسّمة صغيرة، حثًّا للتلاميذ على القراءة وطلب العلم. نعتبرها كرة $(\\delta)$ مركزها $O$ ونصف قطرها $9\\,\\mathrm{cm}$ ، ونسمّي $(\\beta)$ الجلة التي لها نفس المركز ونفس نصف القطر. في الشكل المقابل ثلاث نقط من الفضاء: $A$ حيث $OA = 9\\,\\mathrm{cm}$ ، و $B$ حيث $OB = 7\\,\\mathrm{cm}$ ، و $C$ حيث $OC = 11\\,\\mathrm{cm}$ .',
    parts: [
      {
        label: '1)', title: 'موضع النقط',
        question: 'عيّن موضع كل من النقط $A$ و $B$ و $C$ بالنسبة إلى الكرة $(\\delta)$ وإلى الجلة $(\\beta)$ .',
        asks: ['موضع كل نقطة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['kura-julla'],
            prompt: 'لنعيّن موضع نقطة $M$ من الفضاء نقارن المسافة $OM$ مع:',
            options: [
              'نصف قطر الكرة $R = 9\\,\\mathrm{cm}$',
              'قطر الكرة $18\\,\\mathrm{cm}$',
              'مربع نصف القطر $R^2 = 81$',
            ],
            correct: 0,
            explain: 'نقطة من الكرة تحقّق $OM = R$ ؛ ونقطة الجلة تحقّق $OM \\leq R$ ؛ وإذا كان $OM > R$ فالنقطة خارج الجلة. المقارنة بالقطر أو بمربع نصف القطر تخلط بين مقدارين مختلفين.' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['kura-julla'],
            rows: [
              { label: 'النقطة $A$ حيث $OA = 9\\,\\mathrm{cm}$',
                options: ['على الكرة $(\\delta)$ ، وهي أيضا من الجلة $(\\beta)$', 'داخل الجلة $(\\beta)$ وليست على الكرة $(\\delta)$', 'خارج الجلة $(\\beta)$'], correct: 0,
                correction: '$OA = 9 = R$ : النقطة $A$ على الكرة، وكل نقطة من الكرة هي من الجلة.' },
              { label: 'النقطة $B$ حيث $OB = 7\\,\\mathrm{cm}$',
                options: ['على الكرة $(\\delta)$ ، وهي أيضا من الجلة $(\\beta)$', 'داخل الجلة $(\\beta)$ وليست على الكرة $(\\delta)$', 'خارج الجلة $(\\beta)$'], correct: 1,
                correction: '$OB = 7 < 9$ : النقطة $B$ داخل الجلة وليست على الكرة.' },
              { label: 'النقطة $C$ حيث $OC = 11\\,\\mathrm{cm}$',
                options: ['على الكرة $(\\delta)$ ، وهي أيضا من الجلة $(\\beta)$', 'داخل الجلة $(\\beta)$ وليست على الكرة $(\\delta)$', 'خارج الجلة $(\\beta)$'], correct: 2,
                correction: '$OC = 11 > 9$ : النقطة $C$ خارج الجلة، فهي ليست من الكرة أيضا.' },
            ] },
          { kind: 'solution', ask: 0, lines: [
            'نقارن $OM$ مع $R = 9\\,\\mathrm{cm}$ : $OA = 9 = R$ ، و $OB = 7 < R$ ، و $OC = 11 > R$ .',
            'النقطة $A$ على الكرة $(\\delta)$ وهي من الجلة $(\\beta)$ ؛ والنقطة $B$ داخل الجلة $(\\beta)$ فقط ؛ والنقطة $C$ خارج الجلة $(\\beta)$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'مساحة الكرة وحجم الجلة',
        question: 'احسب مساحة الكرة $(\\delta)$ وحجم الجلة $(\\beta)$ بدلالة $\\pi$ .',
        asks: ['مساحة الكرة', 'حجم الجلة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['misaha-kura'],
            prompt: 'مساحة كرة نصف قطرها $R$ تساوي:',
            options: ['$4\\pi R^2$', '$\\pi R^2$', '$\\dfrac{4}{3}\\pi R^3$'],
            correct: 0, cols: 3,
            explain: 'مساحة الكرة $4\\pi R^2$ . أمّا $\\pi R^2$ فمساحة قرص، و $\\dfrac{4}{3}\\pi R^3$ حجم الجلة.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['misaha-kura'],
            prompt: 'اكتب مساحة الكرة على الشكل $a\\pi\\,\\mathrm{cm}^2$ ؛ قيمة $a$ :', expected: 324,
            explain: '$4 \\times 9^2 = 4 \\times 81 = 324$ ، إذن مساحة الكرة $324\\pi\\,\\mathrm{cm}^2$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hajm-julla'],
            prompt: 'اكتب حجم الجلة على الشكل $a\\pi\\,\\mathrm{cm}^3$ ؛ قيمة $a$ :', expected: 972,
            explain: '$\\dfrac{4}{3} \\times 9^3 = \\dfrac{4}{3} \\times 729 = 972$ ، إذن حجم الجلة $972\\pi\\,\\mathrm{cm}^3$ .' },
          { kind: 'solution', ask: 0, lines: [
            'مساحة الكرة $\\mathcal{A} = 4\\pi R^2 = 4\\pi \\times 9^2 = 324\\pi\\,\\mathrm{cm}^2$ .',
            'حجم الجلة $\\mathcal{V} = \\dfrac{4}{3}\\pi R^3 = \\dfrac{4}{3}\\pi \\times 9^3 = 972\\pi\\,\\mathrm{cm}^3$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — الكرة الحجرية وقاعدتها',
    context: 'مقطع كرة بمستو',
    emoji: '🪨',
    source: SOURCE,
    tone: 'indigo',
    figure: TRAIN_2_FIGURE,
    statement: 'حرفيّ ماهر يتقن عمله وينحت كرة من الحجر مركزها $O$ ونصف قطرها $25\\,\\mathrm{cm}$ لتزيّن مدخل حديقة الحيّ. ليثبّتها على الأرض يقطع منها بمستوٍ $(P)$ يبعد عن المركز $O$ بـ $15\\,\\mathrm{cm}$ ، فيحصل على سطح مستوٍ هو قاعدتها. في الشكل المقابل $H$ مركز هذا السطح و $M$ نقطة من حافته.',
    parts: [
      {
        label: '1)', title: 'طبيعة القاعدة وقياسها',
        question: 'ما طبيعة المقطع الذي يحصل عليه الحرفي؟ احسب نصف قطره $r$ .',
        asks: ['طبيعة المقطع', 'نصف قطر المقطع'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['maqta-kura'],
            prompt: 'مقطع كرة بمستو لا يشمل مركزها هو:',
            options: [
              'دائرة مركزها $H$ ، وليست دائرة كبرى لأنّ المستوي لا يشمل $O$',
              'دائرة كبرى مركزها $O$',
              'نقطة واحدة هي $M$',
            ],
            correct: 0,
            explain: 'المستوي $(P)$ يقطع الكرة لأنّ $15 < 25$ ، وفق دائرة مركزها $H$ المسقط القائم للمركز $O$ على $(P)$ . تكون الدائرة كبرى فقط إذا شمل المستوي المركز.' },
          { kind: 'numeric', role: 'compute', requires: ['maqta-kura'],
            prompt: 'المثلث $OHM$ قائم في $H$ ، فحسب خاصية فيثاغورس $HM^2 = OM^2 - OH^2$ . قيمة $HM^2$ :', expected: 400,
            explain: '$HM^2 = 25^2 - 15^2 = 625 - 225 = 400$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['maqta-kura'],
            prompt: 'نصف قطر المقطع $r = HM$ بالسنتيمتر:', expected: 20, suffix: 'cm',
            explain: '$20^2 = 400$ ، إذن $r = 20\\,\\mathrm{cm}$ . ونلاحظ أنّ $r < R$ لأنّ الدائرة ليست كبرى.' },
          { kind: 'solution', ask: 0, lines: [
            'المستوي $(P)$ لا يشمل المركز $O$ ويبعد عنه $15 < 25$ : المقطع دائرة مركزها $H$ وليست دائرة كبرى.',
            'المثلث $OHM$ قائم في $H$ ، إذن $HM^2 = OM^2 - OH^2 = 25^2 - 15^2 = 400$ .',
            'نصف قطر المقطع $r = 20\\,\\mathrm{cm}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'مساحة القاعدة وبعد المستوي',
        question: 'احسب مساحة القاعدة بدلالة $\\pi$ . على أيّ بعد من المركز $O$ يجب أن يقطع المستوي الكرة ليكون نصف قطر المقطع $15\\,\\mathrm{cm}$ ؟',
        asks: ['مساحة القاعدة', 'بعد المستوي عن المركز'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['maqta-kura'],
            prompt: 'اكتب مساحة القاعدة على الشكل $a\\pi\\,\\mathrm{cm}^2$ ؛ قيمة $a$ :', expected: 400,
            explain: 'القاعدة قرص نصف قطره $r = 20\\,\\mathrm{cm}$ : $20^2 = 400$ ، إذن مساحتها $400\\pi\\,\\mathrm{cm}^2$ .' },
          { kind: 'numeric', role: 'compute', requires: ['maqta-kura'],
            prompt: 'ليكون نصف قطر المقطع $15\\,\\mathrm{cm}$ ، نكتب $d^2 = OM^2 - r^2 = 25^2 - 15^2$ ؛ قيمة $d^2$ :', expected: 400,
            explain: '$d^2 = 625 - 225 = 400$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['maqta-kura'],
            prompt: 'بعد المستوي عن المركز $d$ بالسنتيمتر:', expected: 20, suffix: 'cm',
            explain: '$20^2 = 400$ ، إذن $d = 20\\,\\mathrm{cm}$ : كلّما اقترب المستوي من المركز كبرت الدائرة.' },
          { kind: 'solution', ask: 0, lines: [
            'القاعدة قرص نصف قطره $20\\,\\mathrm{cm}$ : مساحتها $\\pi \\times 20^2 = 400\\pi\\,\\mathrm{cm}^2$ .',
            'من أجل $r = 15$ : $d^2 = 25^2 - 15^2 = 400$ ، إذن $d = 20\\,\\mathrm{cm}$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — حاوية النفايات',
    context: 'مقاطع أسطوانة وسعتها',
    emoji: '♻️',
    source: SOURCE,
    tone: 'amber',
    figure: TRAIN_3_FIGURE,
    statement: 'للمحافظة على نظافة ساحة المدرسة، وضع التلاميذ حاوية نفايات على شكل أسطوانة دوران، قاعدتها قرص نصف قطره $17\\,\\mathrm{cm}$ وارتفاعها $60\\,\\mathrm{cm}$ . يريد النجّار أن يعرف المقاطع المستوية لهذه الحاوية قبل أن يقصّ منها نافذة (الشكل المقابل).',
    parts: [
      {
        label: '1)', title: 'مقطع موازٍ للقاعدة، والسعة',
        question: 'ما شكل مقطع الحاوية بمستوٍ موازٍ لقاعدتها؟ احسب سعتها باللتر مدوّرة إلى $0{,}01$ .',
        asks: ['شكل المقطع', 'سعة الحاوية'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['maqta-ustuwana'],
            prompt: 'مقطع الأسطوانة بمستوٍ موازٍ لقاعدتها هو:',
            options: [
              'قرص يطابق القاعدة: نصف قطره $17\\,\\mathrm{cm}$',
              'مستطيل بعداه $17\\,\\mathrm{cm}$ و $60\\,\\mathrm{cm}$',
              'قرص نصف قطره $60\\,\\mathrm{cm}$',
            ],
            correct: 0,
            explain: 'كل مستوٍ موازٍ للقاعدة يقطع جدار الأسطوانة على نفس البعد من المحور، فالمقطع قرص مطابق للقاعدة. المستطيل مقطع بمستوٍ موازٍ للمحور.' },
          { kind: 'numeric', role: 'compute', requires: ['hajm-ustuwana'],
            prompt: 'اكتب حجم الحاوية على الشكل $a\\pi\\,\\mathrm{cm}^3$ ؛ قيمة $a$ :', expected: 17340,
            explain: '$\\mathcal{V} = \\pi r^2 h$ و $17^2 \\times 60 = 289 \\times 60 = 17340$ ، إذن $\\mathcal{V} = 17340\\pi\\,\\mathrm{cm}^3$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['litr'],
            prompt: 'سعة الحاوية باللتر مدوّرة إلى $0{,}01$ :', expected: 54.48, suffix: 'L',
            explain: '$17340\\pi \\approx 54\\,475{,}22\\,\\mathrm{cm}^3$ و $1\\,\\mathrm{L} = 1000\\,\\mathrm{cm}^3$ ، إذن السعة حوالي $54{,}48\\,\\mathrm{L}$ (ندوّر في آخر الحساب).' },
          { kind: 'solution', ask: 0, lines: [
            'المقطع بمستوٍ موازٍ للقاعدة قرص يطابق القاعدة، نصف قطره $17\\,\\mathrm{cm}$ .',
            '$\\mathcal{V} = \\pi \\times 17^2 \\times 60 = 17340\\pi\\,\\mathrm{cm}^3 \\approx 54\\,475{,}22\\,\\mathrm{cm}^3$ .',
            'سعة الحاوية حوالي $54{,}48\\,\\mathrm{L}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'النافذة',
        question: 'يقطع الحاوية مستوٍ موازٍ لمحورها ويبعد عنه $8\\,\\mathrm{cm}$ . ما طبيعة المقطع؟ احسب مساحته.',
        asks: ['طبيعة المقطع', 'مساحة المقطع'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['maqta-ustuwana'],
            prompt: 'مقطع الأسطوانة بمستوٍ موازٍ لمحورها هو:',
            options: [
              'مستطيل أحد بعديه ارتفاع الحاوية',
              'قرص مركزه على المحور',
              'مستطيل بعداه $17\\,\\mathrm{cm}$ و $60\\,\\mathrm{cm}$',
            ],
            correct: 0,
            explain: 'المستوي الموازي للمحور يقطع القاعدتين وفق قطعتين متقايستين وجدار الحاوية وفق مستقيمين موازيين للمحور: المقطع مستطيل ارتفاعه ارتفاع الحاوية $60\\,\\mathrm{cm}$ ، أمّا عرضه فيتغيّر بتغيّر بعد المستوي عن المحور. القرص مقطع بمستوٍ موازٍ للقاعدة.' },
          { kind: 'numeric', role: 'compute', requires: ['maqta-ustuwana'],
            prompt: 'في قاعدة الأسطوانة، نصف عرض المقطع $\\ell$ يحقّق $\\ell^2 = 17^2 - 8^2$ ؛ قيمة $\\ell^2$ :', expected: 225,
            explain: '$\\ell^2 = 289 - 64 = 225$ ، إذن $\\ell = 15\\,\\mathrm{cm}$ .' },
          { kind: 'numeric', role: 'compute', requires: ['maqta-ustuwana'],
            prompt: 'عرض المقطع كله ( $2\\ell$ ) بالسنتيمتر:', expected: 30, suffix: 'cm',
            explain: '$\\ell^2 = 225$ و $15^2 = 225$ ، إذن $\\ell = 15$ والعرض $2 \\times 15 = 30\\,\\mathrm{cm}$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['maqta-ustuwana'],
            prompt: 'مساحة المقطع بالسنتيمتر المربع:', expected: 1800, suffix: 'cm²',
            explain: '$30 \\times 60 = 1800$ ، إذن مساحة النافذة $1800\\,\\mathrm{cm}^2$ .' },
          { kind: 'solution', ask: 0, lines: [
            'المقطع مستطيل ارتفاعه $60\\,\\mathrm{cm}$ ، ونصف عرضه $\\ell$ حيث $\\ell^2 = 17^2 - 8^2 = 225$ ، أي $\\ell = 15\\,\\mathrm{cm}$ .',
            'عرضه $2 \\times 15 = 30\\,\\mathrm{cm}$ ، ومساحته $30 \\times 60 = 1800\\,\\mathrm{cm}^2$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — نموذج الخزّان المائي',
    context: 'تصغير: أثره على الأطوال والمساحات والحجوم',
    emoji: '🏗️',
    source: SOURCE,
    tone: 'emerald',
    figure: TRAIN_4_FIGURE,
    statement: 'يمثّل تلاميذ القسم ولايتهم في المعرض الوطني للعلوم بنموذج مصغّر للخزّان المائي الكروي الذي تعتزّ به مدينتهم، حبًّا لوطنهم وإظهارا لإبداع شبابه. نصف قطر الخزّان الحقيقي $6\\,\\mathrm{m}$ (الشكل المقابل)، ونصف قطر النموذج $15\\,\\mathrm{cm}$ .',
    parts: [
      {
        label: '1)', title: 'نسبة التصغير ومساحة الخزّان',
        question: 'احسب نسبة التصغير $k = \\dfrac{1}{n}$ ثم مساحة الخزّان الحقيقي بدلالة $\\pi$ .',
        asks: ['قيمة n', 'مساحة الخزان الحقيقي'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['takbir-k3'],
            prompt: 'لنقارن الطولين نكتبهما بنفس الوحدة. نصف قطر الخزّان الحقيقي بالسنتيمتر:', expected: 600, suffix: 'cm',
            explain: '$1\\,\\mathrm{m} = 100\\,\\mathrm{cm}$ ، إذن $6\\,\\mathrm{m} = 600\\,\\mathrm{cm}$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['takbir-k3'],
            prompt: 'النموذج تصغير للخزّان نسبته $k = \\dfrac{1}{n}$ ؛ قيمة $n$ :', expected: 40,
            explain: '$k = \\dfrac{15}{600} = \\dfrac{1}{40}$ ، إذن $n = 40$ : كل طول في النموذج هو $\\dfrac{1}{40}$ الطول الموافق في الخزّان.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['misaha-kura'],
            prompt: 'اكتب مساحة الخزّان الحقيقي على الشكل $a\\pi\\,\\mathrm{m}^2$ ؛ قيمة $a$ :', expected: 144,
            explain: '$4 \\times 6^2 = 4 \\times 36 = 144$ ، إذن مساحته $144\\pi\\,\\mathrm{m}^2$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$6\\,\\mathrm{m} = 600\\,\\mathrm{cm}$ ، و $k = \\dfrac{15}{600} = \\dfrac{1}{40}$ ، أي $n = 40$ .',
            'مساحة الخزّان الحقيقي $\\mathcal{A} = 4\\pi R^2 = 4\\pi \\times 6^2 = 144\\pi\\,\\mathrm{m}^2$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'مساحة النموذج وحجمه',
        question: 'احسب مساحة النموذج بدلالة $\\pi$ . كم مرة يفوق حجم الخزّان الحقيقي حجم النموذج؟',
        asks: ['مساحة النموذج', 'عدد المرات'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['takbir-k3'],
            prompt: 'في تصغير نسبته $k$ ، تُضرب مساحة المجسّم في:',
            options: ['$k^2$', '$k$', '$k^3$'],
            correct: 0, cols: 3,
            explain: 'للمساحة بُعدان وكل بُعد يُضرب في $k$ : المساحات تُضرب في $k^2$ . الأطوال تُضرب في $k$ ، والحجوم وحدها في $k^3$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['takbir-k3', 'misaha-kura'],
            prompt: 'اكتب مساحة النموذج على الشكل $a\\pi\\,\\mathrm{cm}^2$ ؛ قيمة $a$ :', expected: 900,
            explain: '$1\\,\\mathrm{m}^2 = 10000\\,\\mathrm{cm}^2$ ، فمساحة الخزّان $144 \\times 10000 = 1440000\\,\\mathrm{cm}^2$ ، و $k^2 = \\dfrac{1}{40^2} = \\dfrac{1}{1600}$ ، إذن $1440000 \\div 1600 = 900$ . تحقّق بنصف قطر النموذج: $4 \\times 15^2 = 900$ ، إذن مساحته $900\\pi\\,\\mathrm{cm}^2$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['takbir-k3'],
            prompt: 'عدد المرات التي يفوق بها حجم الخزّان الحقيقي حجم النموذج:', expected: 64000,
            explain: 'الحجوم تُضرب في $k^3 = \\left(\\dfrac{1}{40}\\right)^3 = \\dfrac{1}{64000}$ ، لأنّ $40^3 = 40 \\times 40 \\times 40 = 64000$ . حجم الخزّان يفوق حجم النموذج $64000$ مرة، لا $1600$ ولا $40$ .' },
          { kind: 'solution', ask: 0, lines: [
            'المساحات تُضرب في $k^2 = \\dfrac{1}{1600}$ : مساحة النموذج $\\dfrac{1440000}{1600}\\pi = 900\\pi\\,\\mathrm{cm}^2$ ، وهي $4\\pi \\times 15^2$ .',
            'الحجوم تُضرب في $k^3 = \\dfrac{1}{64000}$ : حجم الخزّان الحقيقي يفوق حجم النموذج $40^3 = 64000$ مرة.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — القمع وزيت الزيتون',
    context: 'مخروط مصغّر بخاصية طالس وحجم الزيت',
    emoji: '🫒',
    source: SOURCE,
    tone: 'teal',
    figure: TRAIN_5_FIGURE,
    statement: 'في جمعية خيرية للتكافل الاجتماعي، يستعمل المتطوعون قمعًا على شكل مخروط دوران رأسه $S$ إلى الأسفل لتعبئة قارورات زيت الزيتون التي توزَّع على الأسر المحتاجة. ارتفاع القمع $SI = 15\\,\\mathrm{cm}$ ونصف قطر فتحته $IB = 9\\,\\mathrm{cm}$ . صبّ المتطوعون الزيت حتى النقطة $W$ من المحور حيث $SW = 10\\,\\mathrm{cm}$ (الشكل المقابل مقطع محوري للقمع).',
    parts: [
      {
        label: '1)', title: 'نسبة التصغير ونصف قطر سطح الزيت',
        question: 'ما نسبة التصغير $k$ بين مخروط الزيت ومخروط القمع؟ احسب نصف قطر سطح الزيت $WM$ .',
        asks: ['نسبة التصغير k', 'نصف قطر سطح الزيت'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['maqta-mukhrut'],
            prompt: 'سطح الزيت مستوٍ موازٍ لفتحة القمع. المخروط الذي رأسه $S$ وقاعدته سطح الزيت هو:',
            options: [
              'تصغير لمخروط القمع، لأنّ المقطع الموازي للقاعدة دائرة مركزها على المحور',
              'أسطوانة نصف قطرها $9\\,\\mathrm{cm}$',
              'مخروط ليس له علاقة بمخروط القمع',
            ],
            correct: 0,
            explain: 'مستوٍ موازٍ للقاعدة يقطع المخروط وفق دائرة مركزها على المحور، والمخروط الصغير الذي رأسه $S$ تصغير للمخروط الكبير.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['takbir-k3'],
            prompt: 'نسبة التصغير $k$ هي:',
            options: ['$\\dfrac{2}{3}$', '$\\dfrac{3}{2}$', '$\\dfrac{10}{9}$'],
            correct: 0, cols: 3,
            explain: '$k = \\dfrac{SW}{SI} = \\dfrac{10}{15} = \\dfrac{2}{3}$ . $\\dfrac{3}{2} > 1$ تكبير لا تصغير، و $\\dfrac{10}{9}$ تقسم طولين ليسا متقابلين.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['talis'],
            prompt: 'في المثلث $SIB$ ، $(WM) \\parallel (IB)$ . نصف قطر سطح الزيت $WM$ بالسنتيمتر:', expected: 6, suffix: 'cm',
            explain: 'حسب خاصية طالس $\\dfrac{WM}{IB} = \\dfrac{SW}{SI}$ ، ومنه $WM = 9 \\times \\dfrac{10}{15} = 6\\,\\mathrm{cm}$ ، وهو أيضا $k \\times IB$ .' },
          { kind: 'solution', ask: 0, lines: [
            'مخروط الزيت تصغير لمخروط القمع، نسبته $k = \\dfrac{SW}{SI} = \\dfrac{10}{15} = \\dfrac{2}{3}$ .',
            'حسب خاصية طالس $WM = IB \\times \\dfrac{SW}{SI} = 9 \\times \\dfrac{2}{3} = 6\\,\\mathrm{cm}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'حجم القمع وحجم الزيت',
        question: 'احسب حجم القمع بدلالة $\\pi$ ، ثم حجم الزيت بدلالة $\\pi$ ، ثم حجم الزيت بالسنتيمتر المكعب مدوّرا إلى الوحدة.',
        asks: ['حجم القمع', 'حجم الزيت بدلالة π', 'حجم الزيت مدوّرا'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hajm-makhrut'],
            prompt: 'اكتب حجم القمع على الشكل $a\\pi\\,\\mathrm{cm}^3$ ؛ قيمة $a$ :', expected: 405,
            explain: '$\\dfrac{1}{3} \\times 9^2 \\times 15 = \\dfrac{1215}{3} = 405$ ، إذن حجم القمع $405\\pi\\,\\mathrm{cm}^3$ .' },
          { kind: 'choice', role: 'translate', requires: ['takbir-k3'],
            prompt: 'حجم مخروط الزيت يساوي حجم القمع مضروبا في:',
            options: ['$k^3 = \\dfrac{8}{27}$', '$k = \\dfrac{2}{3}$', '$k^2 = \\dfrac{4}{9}$'],
            correct: 0, cols: 3,
            explain: 'مخروط الزيت تصغير لمخروط القمع نسبته $k = \\dfrac{2}{3}$ ، والحجوم تُضرب في $k^3 = \\left(\\dfrac{2}{3}\\right)^3 = \\dfrac{8}{27}$ ، لا في $k$ ولا في $k^2$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['takbir-k3'],
            prompt: 'اكتب حجم الزيت على الشكل $a\\pi\\,\\mathrm{cm}^3$ ؛ قيمة $a$ :', expected: 120,
            explain: '$\\dfrac{8}{27} \\times 405 = 8 \\times 15 = 120$ . تحقّق بحجم مخروط الزيت مباشرة: $\\dfrac{1}{3} \\times 6^2 \\times 10 = 120$ ، إذن حجم الزيت $120\\pi\\,\\mathrm{cm}^3$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['litr'],
            prompt: 'حجم الزيت بالسنتيمتر المكعب مدوّرا إلى الوحدة:', expected: 377, suffix: 'cm³',
            explain: '$120\\pi \\approx 376{,}99$ ، فالحجم حوالي $377\\,\\mathrm{cm}^3$ ، أي أقل من $0{,}4\\,\\mathrm{L}$ (ندوّر في آخر الحساب).' },
          { kind: 'solution', ask: 0, lines: [
            'حجم القمع $\\mathcal{V} = \\dfrac{1}{3}\\pi \\times 9^2 \\times 15 = 405\\pi\\,\\mathrm{cm}^3$ .',
            'حجم الزيت $= k^3 \\mathcal{V} = \\dfrac{8}{27} \\times 405\\pi = 120\\pi\\,\\mathrm{cm}^3 \\approx 377\\,\\mathrm{cm}^3$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — علبة كرات التنس',
    context: 'كرتان داخل أسطوانة',
    emoji: '🎾',
    source: SOURCE,
    tone: 'violet',
    figure: TRAIN_6_FIGURE,
    statement: 'يتعاون صديقان على شراء علبة كرات تنس يهديانها إلى نادي الحيّ: علبة أسطوانية فيها كرتان متماثلتان نصف قطر كل منهما $3\\,\\mathrm{cm}$ ، تمسّ كل كرة جدار العلبة، وتمسّ إحداهما القاعدة والأخرى الغطاء، وارتفاع العلبة $12\\,\\mathrm{cm}$ . الشكل المقابل مقطع للعلبة بمستوٍ يشمل محورها.',
    parts: [
      {
        label: '1)', title: 'حجم الكرة وحجم العلبة',
        question: 'احسب حجم كرة واحدة وحجم العلبة بدلالة $\\pi$ .',
        asks: ['حجم الكرة', 'حجم العلبة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hajm-julla'],
            prompt: 'اكتب حجم كرة واحدة على الشكل $a\\pi\\,\\mathrm{cm}^3$ ؛ قيمة $a$ :', expected: 36,
            explain: '$\\dfrac{4}{3} \\times 3^3 = \\dfrac{4}{3} \\times 27 = 36$ ، إذن حجم الكرة $36\\pi\\,\\mathrm{cm}^3$ .' },
          { kind: 'choice', role: 'translate', requires: ['hajm-ustuwana'],
            prompt: 'نصف قطر قاعدة العلبة يساوي:',
            options: [
              'نصف قطر الكرة $3\\,\\mathrm{cm}$ ، لأنّ الكرة تمسّ جدار العلبة',
              'قطر الكرة $6\\,\\mathrm{cm}$',
              'ارتفاع العلبة $12\\,\\mathrm{cm}$',
            ],
            correct: 0,
            explain: 'الكرة تمسّ الجدار، وقطر العلبة يمرّ بمركزي الكرتين: نصف قطر القاعدة هو نصف قطر الكرة $3\\,\\mathrm{cm}$ ، وقطرها $6\\,\\mathrm{cm}$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hajm-ustuwana'],
            prompt: 'اكتب حجم العلبة على الشكل $a\\pi\\,\\mathrm{cm}^3$ ؛ قيمة $a$ :', expected: 108,
            explain: '$\\mathcal{V} = \\pi r^2 h$ و $3^2 \\times 12 = 9 \\times 12 = 108$ ، إذن حجم العلبة $108\\pi\\,\\mathrm{cm}^3$ .' },
          { kind: 'solution', ask: 0, lines: [
            'حجم الكرة $\\dfrac{4}{3}\\pi \\times 3^3 = 36\\pi\\,\\mathrm{cm}^3$ .',
            'قاعدة العلبة قرص نصف قطره $3\\,\\mathrm{cm}$ : حجمها $\\pi \\times 3^2 \\times 12 = 108\\pi\\,\\mathrm{cm}^3$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الفراغ داخل العلبة',
        question: 'احسب حجم الفراغ بين الكرتين وجدار العلبة بدلالة $\\pi$ . ما نسبة حجم الكرتين إلى حجم العلبة؟',
        asks: ['حجم الفراغ', 'نسبة حجم الكرتين إلى حجم العلبة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['hajm-julla'],
            prompt: 'حجم الكرتين معا على الشكل $a\\pi\\,\\mathrm{cm}^3$ ؛ قيمة $a$ :', expected: 72,
            explain: '$2 \\times 36 = 72$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hajm-julla', 'hajm-ustuwana'],
            prompt: 'حجم الفراغ على الشكل $a\\pi\\,\\mathrm{cm}^3$ ؛ قيمة $a$ :', expected: 36,
            explain: 'الفراغ هو حجم العلبة ناقص حجم الكرتين: $108 - 72 = 36$ ، إذن $36\\pi\\,\\mathrm{cm}^3$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['hajm-julla', 'hajm-ustuwana'],
            prompt: 'نسبة حجم الكرتين إلى حجم العلبة:',
            options: ['$\\dfrac{2}{3}$', '$\\dfrac{1}{2}$', '$\\dfrac{3}{4}$'],
            correct: 0, cols: 3,
            explain: '$\\dfrac{72\\pi}{108\\pi} = \\dfrac{72}{108} = \\dfrac{2}{3}$ ، والفراغ هو الثلث الباقي: $\\dfrac{36}{108} = \\dfrac{1}{3}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'حجم الكرتين معا $2 \\times 36\\pi = 72\\pi\\,\\mathrm{cm}^3$ ، فحجم الفراغ $108\\pi - 72\\pi = 36\\pi\\,\\mathrm{cm}^3$ .',
            'نسبة الحجمين $\\dfrac{72\\pi}{108\\pi} = \\dfrac{2}{3}$ : الكرتان تملآن ثلثي العلبة.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
