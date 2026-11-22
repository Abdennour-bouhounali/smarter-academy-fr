/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (unité 8 « الإحصاء », modules 1 à 6) — des situations COMPLÈTES de type
 * امتحان BEM, résolues pas à pas (common/problems/GuidedProblem.jsx), AVANT la situation du manuel (module 7 : les
 * médailles olympiques, lues en trois phases), l'analyse de la situation à évaluer et le test (module 8).
 *
 * Décision du propriétaire (2026-10-13) : étendre à toutes les synthèses le patron de l'unité 1 (`wadiya-idmajiya-aadad`) —
 * que l'élève s'exerce sur beaucoup de situations avant celle sur laquelle il est évalué. Ce sont des AJOUTS DE LA
 * PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`), jamais présentés comme des exercices du manuel.
 *
 * Périmètre : exactement celui des dernières leçons de l'unité — التكرار الكلّي et المجمع (صاعد / نازل, « على الأكثر » /
 * « على الأقل »), المدى, المتوسط (pondéré, par centres de classes), الوسيط par les rangs (N pair / impair), l'équation du premier
 * degré pour une valeur ou un effectif caché, la lecture d'un tableau, d'un diagramme en bâtons, d'un secteur et d'un histogramme,
 * les pourcentages (une part d'un nombre, le tout à partir d'une part, l'angle d'un secteur). Jamais le tableur (leçon 3).
 * Les contextes ne reprennent ni les médailles du module 7 ni la compétition africaine du test.
 *
 *   wadiya-1  sky      كتب المكتبة         tableau (N = 20) : cumulés « على الأكثر / على الأقل », m = 2,2 ; Med = 2
 *   wadiya-2  indigo   تأخّر الحافلة       diagramme en bâtons (N = 15, impair) : مدى 20, m = 8, Med = 10, « 15 فأكثر »
 *   wadiya-3  amber    حملة الكراريس       diagramme en secteurs (480) : parts, le tout (90 = 25 %) et l'angle (15 % → 54°)
 *   wadiya-4  emerald  نادي البيئة         6 jours, valeur cachée par le متوسط (34), مدى 16, Med = 24 (N pair), 40 % de 1800
 *   wadiya-5  teal     ورشة النجارة        tableau à EFFECTIF caché (5), m = 4,05, Med = 4, « 5 فأكثر » : 7 jours = 35 %
 *   wadiya-6  violet   برّ الوالدين        مدرّج (N = 40, classes) : 30 → 75 %, m ≈ 3,1, الفئة الوسيطية [2 ; 4[, « 4 فأكثر »
 *
 * Valeurs (règle du 2026-10-10) : القراءة والعلم · احترام الوقت · التكافل · النظافة · إتقان العمل · برّ الوالدين.
 * Chaque nombre est recalculé dans ./problems.test.js. Aucune sous-étape n'est une `assessment` : la maîtrise vient du
 * module 8 seulement. Aucun `requires` ne sort de `priorKnowledge` (la carte de la leçon n'est ouverte qu'au module 7).
 */
import { addition } from '../../_unit/unitMeta.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  // ── 1 · sky · tableau, cumulés, متوسط et وسيط ────────────────────────────────────────────────────────
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — كتب المكتبة المدرسية',
    context: 'قراءة جدول التكرارات وتكراراته المجمعة',
    emoji: '📚',
    source: SOURCE,
    tone: 'sky',
    statement: 'القراءة تنمّي العقل وتزيد العلم. في أسبوع القراءة سجّلت مكتبة المتوسطة عدد الكتب التي استعارها كل تلميذ من قسم السنة الرابعة (20 تلميذًا) خلال الشهر، ويلخّص الجدول المقابل النتائج. وعدت الإدارة بهدية قيمتها 150 دج لكل تلميذ استعار 3 كتب على الأقل.',
    table: {
      caption: 'عدد الكتب المستعارة خلال الشهر',
      head: ['عدد الكتب المستعارة', '0', '1', '2', '3', '4', '5'],
      rows: [['عدد التلاميذ', '2', '4', '6', '5', '2', '1']],
    },
    parts: [
      {
        label: '1)', title: 'كتابان على الأكثر',
        question: 'ما عدد التلاميذ الذين استعاروا كتابين على الأكثر؟ وما نسبتهم المئوية من تلاميذ القسم؟',
        asks: ['عدد التلاميذ الذين استعاروا كتابين على الأكثر', 'نسبتهم المئوية'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['takrar-mujamma'],
            prompt: 'عدد التلاميذ الذين استعاروا كتابين على الأكثر هو التكرار المجمع:',
            options: [
              'الصاعد للقيمة 2: نجمع تكرارات القيم 0 و 1 و 2',
              'النازل للقيمة 2: نجمع تكرارات القيم 2 و 3 و 4 و 5',
              'تكرار القيمة 2 وحدها',
            ],
            correct: 0,
            explain: '«على الأكثر 2» تعني القيم 0 أو 1 أو 2: نبدأ من الأصغر ونجمع حتى القيمة 2، وهذا هو التكرار المجمع الصاعد.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['takrar-mujamma'],
            prompt: 'عدد التلاميذ الذين استعاروا كتابين على الأكثر:', expected: 12, suffix: 'تلميذًا',
            explain: '$2 + 4 + 6 = 12$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['nisba-min-adad'],
            prompt: 'نسبتهم المئوية من تلاميذ القسم:', expected: 60, suffix: '%',
            explain: '$\\dfrac{12}{20} = 0{,}6 = 60\\%$ : نقسم على التكرار الكلي $20$.' },
          { kind: 'solution', ask: 0, lines: [
            '«كتابان على الأكثر»: القيم 0 و 1 و 2 ، أي $2 + 4 + 6 = 12$ تلميذًا.',
            '$\\dfrac{12}{20} = 0{,}6$ ، أي 60% من تلاميذ القسم.',
            'استعار 12 تلميذًا، أي 60% من القسم، كتابين على الأكثر.',
          ] },
        ],
      },
      {
        label: '2)', title: 'المتوسط والوسيط',
        question: 'احسب متوسط عدد الكتب المستعارة لكل تلميذ، ثم عيّن وسيط هذه السلسلة.',
        asks: ['متوسط عدد الكتب لكل تلميذ', 'وسيط السلسلة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['mutawassit-murajjah'],
            prompt: 'مجموع الكتب المستعارة (نضرب كل قيمة في تكرارها):', expected: 44,
            explain: '$0 \\times 2 + 1 \\times 4 + 2 \\times 6 + 3 \\times 5 + 4 \\times 2 + 5 \\times 1 = 0 + 4 + 12 + 15 + 8 + 5 = 44$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mutawassit-murajjah'],
            prompt: 'متوسط عدد الكتب لكل تلميذ:', expected: 2.2, display: '2,2',
            explain: '$m = \\dfrac{44}{20} = 2{,}2$ : نقسم المجموع على التكرار الكلي $20$ لا على عدد الأعمدة $6$.' },
          { kind: 'choice', role: 'translate', requires: ['wasit-rutba'],
            prompt: 'التكرار الكلي عدد زوجي، فالوسيط هو نصف مجموع القيمتين اللتين رتبتاهما:',
            options: ['$10$ و $11$', '$9$ و $10$', '$20$ و $21$'],
            correct: 0, cols: 3,
            explain: 'الرتبتان $\\dfrac{20}{2} = 10$ و $10 + 1 = 11$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['wasit-rutba', 'takrar-mujamma'],
            prompt: 'وسيط السلسلة:', expected: 2,
            explain: 'التكرارات المجمعة الصاعدة: $2$ (القيمة 0)، $2 + 4 = 6$ (القيمة 1)، $6 + 6 = 12$ (القيمة 2): الرتبتان 10 و 11 كلتاهما في القيمة 2، إذن $\\mathrm{Med} = 2$.' },
          { kind: 'solution', ask: 0, lines: [
            '$m = \\dfrac{0 \\times 2 + 1 \\times 4 + 2 \\times 6 + 3 \\times 5 + 4 \\times 2 + 5 \\times 1}{20} = \\dfrac{44}{20} = 2{,}2$.',
            'الرتبتان 10 و 11 : التكرارات المجمعة الصاعدة $2$ ، $6$ ، $12$ ، فالقيمتان كلتاهما 2 ، إذن $\\mathrm{Med} = 2$.',
            'متوسط عدد الكتب لكل تلميذ $2{,}2$ كتاب، ووسيط السلسلة كتابان.',
          ] },
        ],
      },
      {
        label: '3)', title: 'هدايا التشجيع',
        question: 'كم تلميذًا يستحقّ الهدية؟ وكم تدفع الإدارة في المجموع؟',
        asks: ['عدد التلاميذ المستحقّين للهدية', 'ما تدفعه الإدارة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['takrar-mujamma'],
            prompt: 'عدد التلاميذ الذين استعاروا 3 كتب على الأقل هو التكرار المجمع:',
            options: [
              'النازل للقيمة 3: نجمع تكرارات القيم 3 و 4 و 5',
              'الصاعد للقيمة 3: نجمع تكرارات القيم 0 و 1 و 2 و 3',
              'تكرار القيمة 3 وحدها',
            ],
            correct: 0,
            explain: '«على الأقل 3» تعني القيم 3 أو 4 أو 5: نبدأ من الأكبر. أمّا الصاعد للقيمة 3 فيعطي «3 كتب على الأكثر»: $2 + 4 + 6 + 5 = 17$ تلميذًا.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['takrar-mujamma'],
            prompt: 'عدد التلاميذ المستحقّين للهدية:', expected: 8, suffix: 'تلاميذ',
            explain: '$5 + 2 + 1 = 8$.' },
          { kind: 'numeric', role: 'answer', ask: 1, suffix: 'دج',
            prompt: 'ما تدفعه الإدارة للهدايا:', expected: 1200,
            explain: '$8 \\times 150 = 1200$.' },
          { kind: 'solution', ask: 0, lines: [
            '«3 كتب على الأقل»: القيم 3 و 4 و 5 ، أي $5 + 2 + 1 = 8$ تلاميذ.',
            'تدفع الإدارة $8 \\times 150 = 1200$ دج.',
          ] },
        ],
      },
    ],
  },

  // ── 2 · indigo · diagramme en bâtons (N impair) ──────────────────────────────────────────────────────
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — تأخّر الحافلة المدرسية',
    context: 'قراءة مخطط بالأعمدة، المدى والمتوسط والوسيط',
    emoji: '🚌',
    source: SOURCE,
    tone: 'indigo',
    statement: 'احترام الوقت من أخلاق المؤمن، وتأخّر الحافلة المدرسية يضيّع على التلاميذ دروسهم. سجّلت إدارة المتوسطة مدة تأخّر الحافلة صباحًا (بالدقائق) خلال أيام دراسية متتالية، ويمثّل المخطط بالأعمدة المقابل هذه المدد وعدد الأيام الموافق لكل مدة. تدفع شركة النقل للمتوسطة تعويضًا قدره 500 دج عن كل يوم بلغ فيه التأخّر 15 دقيقة فأكثر.',
    figure: {
      kind: 'chart', type: 'bar',
      ariaLabel: 'مخطط بالأعمدة لمدة تأخّر الحافلة المدرسية بالدقائق وعدد الأيام الموافق لكل مدة',
      xTitle: 'مدة التأخّر (دقيقة)', yTitle: 'عدد الأيام', y: { max: 6, step: 1 },
      bars: [{ label: '0', value: 3 }, { label: '5', value: 4 }, { label: '10', value: 5 }, { label: '15', value: 2 }, { label: '20', value: 1 }],
    },
    parts: [
      {
        label: '1)', title: 'قراءة المخطط',
        question: 'اقرأ المخطط: كم يومًا سُجّل في المجموع؟ وما مدى هذه السلسلة؟',
        asks: ['عدد الأيام المسجّلة', 'مدى السلسلة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['takrar-kulli'],
            prompt: 'عدد الأيام التي بلغ فيها التأخّر 10 دقائق بالضبط (ارتفاع العمود الموافق لـ 10):', expected: 5,
            explain: 'العمود الموافق لـ 10 دقائق يبلغ الخط الخامس: خمسة أيام.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['takrar-kulli'],
            prompt: 'عدد الأيام المسجّلة في المخطط:', expected: 15, suffix: 'يومًا',
            explain: 'التكرار الكلي مجموع ارتفاعات الأعمدة: $3 + 4 + 5 + 2 + 1 = 15$.' },
          { kind: 'choice', role: 'translate', requires: ['mada'],
            prompt: 'مدى هذه السلسلة هو الفرق بين:',
            options: [
              'أكبر مدة تأخّر وأصغر مدة تأخّر',
              'أكبر عدد أيام وأصغر عدد أيام',
              'مجموع مدد التأخّر وعدد الأيام',
            ],
            correct: 0,
            explain: 'قيم السلسلة هي مدد التأخّر (المحور الأفقي) لا ارتفاعات الأعمدة. فرق أكبر عدد أيام وأصغر عدد أيام ($5 - 1 = 4$) ليس هو المدى.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['mada'],
            prompt: 'مدى السلسلة (بالدقيقة):', expected: 20,
            explain: 'أكبر مدة $20$ وأصغر مدة $0$ : $20 - 0 = 20$ دقيقة.' },
          { kind: 'solution', ask: 0, lines: [
            'ارتفاعات الأعمدة 3 ، 4 ، 5 ، 2 ، 1 : التكرار الكلي $3 + 4 + 5 + 2 + 1 = 15$ يومًا.',
            'أكبر مدة تأخّر 20 دقيقة وأصغر مدة 0 : المدى $20 - 0 = 20$ دقيقة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'المتوسط والوسيط',
        question: 'احسب متوسط مدة التأخّر، ثم عيّن وسيط السلسلة.',
        asks: ['متوسط مدة التأخّر', 'وسيط السلسلة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['mutawassit-murajjah'],
            prompt: 'مجموع مدد التأخّر في كل الأيام (نضرب كل مدة في عدد أيامها):', expected: 120,
            explain: '$0 \\times 3 + 5 \\times 4 + 10 \\times 5 + 15 \\times 2 + 20 \\times 1 = 0 + 20 + 50 + 30 + 20 = 120$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mutawassit-murajjah'],
            prompt: 'متوسط مدة التأخّر (بالدقيقة):', expected: 8,
            explain: '$m = \\dfrac{120}{15} = 8$ : نقسم على عدد الأيام $15$.' },
          { kind: 'choice', role: 'translate', requires: ['wasit-rutba'],
            prompt: 'التكرار الكلي عدد فردي، فرتبة الوسيط هي:',
            options: [
              '$\\dfrac{N + 1}{2}$ : قبله وبعده عدد متساوٍ من القيم',
              '$\\dfrac{N}{2}$ فقط',
              'منتصف أكبر قيمة وأصغر قيمة',
            ],
            correct: 0,
            explain: 'عدد القيم فردي: يبقى في الوسط قيمة واحدة، رتبتها $\\dfrac{N + 1}{2}$. لا نأخذ منتصف قيمتين إلّا إذا كان $N$ زوجيًا.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['wasit-rutba', 'takrar-mujamma'],
            prompt: 'وسيط السلسلة (بالدقيقة):', expected: 10,
            explain: 'رتبة الوسيط $\\dfrac{15 + 1}{2} = 8$. التكرارات المجمعة الصاعدة: $3$ (القيمة 0)، $3 + 4 = 7$ (القيمة 5)، $7 + 5 = 12$ (القيمة 10): الرتبة 8 في القيمة 10، إذن $\\mathrm{Med} = 10$.' },
          { kind: 'solution', ask: 0, lines: [
            '$m = \\dfrac{0 \\times 3 + 5 \\times 4 + 10 \\times 5 + 15 \\times 2 + 20 \\times 1}{15} = \\dfrac{120}{15} = 8$.',
            '$N = 15$ فردي: رتبة الوسيط $\\dfrac{15 + 1}{2} = 8$ ؛ الصاعد $3$ ، $7$ ، $12$ : الرتبة 8 في القيمة 10 ، إذن $\\mathrm{Med} = 10$.',
            'متوسط التأخّر 8 دقائق، ووسيطه 10 دقائق.',
          ] },
        ],
      },
      {
        label: '3)', title: 'التعويض',
        question: 'كم يومًا بلغ فيه التأخّر 15 دقيقة فأكثر؟ وكم تدفع الشركة للمتوسطة؟',
        asks: ['عدد الأيام التي بلغ فيها التأخّر 15 دقيقة فأكثر', 'مبلغ التعويض'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['takrar-mujamma'],
            prompt: 'الأيام التي بلغ فيها التأخّر 15 دقيقة فأكثر هي التكرار المجمع:',
            options: [
              'النازل للقيمة 15: نجمع تكراري القيمتين 15 و 20',
              'الصاعد للقيمة 15: نجمع تكرارات القيم من 0 إلى 15',
              'تكرار القيمة 15 وحدها',
            ],
            correct: 0,
            explain: '«فأكثر» تعني القيمة 15 والقيم الأكبر منها. أمّا الصاعد للقيمة 15 فيعطي «15 دقيقة على الأكثر»: $3 + 4 + 5 + 2 = 14$ يومًا.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['takrar-mujamma'],
            prompt: 'عدد الأيام التي يُدفع عنها التعويض:', expected: 3, suffix: 'أيام',
            explain: '$2 + 1 = 3$.' },
          { kind: 'numeric', role: 'answer', ask: 1, suffix: 'دج',
            prompt: 'مبلغ التعويض:', expected: 1500,
            explain: '$3 \\times 500 = 1500$.' },
          { kind: 'solution', ask: 0, lines: [
            '«15 دقيقة فأكثر»: القيمتان 15 و 20 ، أي $2 + 1 = 3$ أيام.',
            'تدفع الشركة $3 \\times 500 = 1500$ دج.',
          ] },
        ],
      },
    ],
  },

  // ── 3 · amber · diagramme en secteurs, pourcentages et angle ─────────────────────────────────────────
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — حملة الكراريس',
    context: 'مخطط دائري ونسب مئوية',
    emoji: '📒',
    source: SOURCE,
    tone: 'amber',
    statement: 'التكافل بين التلاميذ يخفّف عن المحتاجين. نظّمت المتوسطة حملة جمعت فيها 480 كرّاسًا لأطفال قرية نائية، ويبيّن المخطط الدائري المقابل حصّة كل مستوى من هذه الكراريس. وفي الدفعة الثانية قدّمت السنة الأولى 90 كرّاسًا، وهي تمثّل 25% من مجموع الدفعة الثانية.',
    figure: {
      kind: 'chart', type: 'pie', show: 'percent',
      ariaLabel: 'مخطط دائري لحصة كل مستوى من المتوسطة في الكراريس المتبرَّع بها',
      parts: [
        { label: 'السنة الأولى', value: 25 }, { label: 'السنة الثانية', value: 20 },
        { label: 'السنة الثالثة', value: 15 }, { label: 'السنة الرابعة', value: 40 },
      ],
    },
    parts: [
      {
        label: '1)', title: 'حصة كل مستوى',
        question: 'كم كرّاسًا قدّمت السنة الأولى؟ وكم كرّاسًا قدّمت السنة الرابعة؟',
        asks: ['عدد كراريس السنة الأولى', 'عدد كراريس السنة الرابعة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['nisba-min-adad'],
            prompt: 'لإيجاد عدد الكراريس التي تمثّل 25% من الـ 480 كرّاسًا نحسب:',
            options: [
              '$\\dfrac{25}{100} \\times 480$',
              '$480 + 25$',
              '$\\dfrac{480}{100} + 25$',
            ],
            correct: 0, cols: 3,
            explain: 'أخذ نسبة من عدد: نضرب العدد في النسبة $\\dfrac{25}{100}$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['nisba-min-adad'],
            prompt: 'عدد كراريس السنة الأولى:', expected: 120, suffix: 'كرّاسًا',
            explain: '$\\dfrac{25}{100} \\times 480 = 0{,}25 \\times 480 = 120$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['nisba-min-adad'],
            prompt: 'عدد كراريس السنة الرابعة:', expected: 192, suffix: 'كرّاسًا',
            explain: '$\\dfrac{40}{100} \\times 480 = 0{,}4 \\times 480 = 192$. تحقّق: $25 + 20 + 15 + 40 = 100$.' },
          { kind: 'solution', ask: 0, lines: [
            'السنة الأولى: $\\dfrac{25}{100} \\times 480 = 120$ كرّاسًا.',
            'السنة الرابعة: $\\dfrac{40}{100} \\times 480 = 192$ كرّاسًا.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الدفعة الثانية',
        question: 'كم كرّاسًا في الدفعة الثانية كلّها؟',
        asks: ['عدد كراريس الدفعة الثانية'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['nisba-min-adad', 'muadala-ula'],
            prompt: 'نسمّي $T$ عدد كراريس الدفعة الثانية. الـ 90 كرّاسًا هي 25% من $T$ ، إذن:',
            options: [
              '$0{,}25 \\times T = 90$',
              '$T = 0{,}25 \\times 90$',
              '$T = 90 + 25$',
            ],
            correct: 0, cols: 3,
            explain: 'العدد 90 جزء من الكل $T$ وليس الكل. العلاقة $T = 0{,}25 \\times 90 = 22{,}5$ تعطي عددًا أصغر من 90 وهو غير معقول، لأنّ الكل أكبر من جزئه.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['muadala-ula'],
            prompt: 'عدد كراريس الدفعة الثانية:', expected: 360, suffix: 'كرّاسًا',
            explain: '$T = \\dfrac{90}{0{,}25} = 360$ : نقسم الجزء المعلوم على النسبة.' },
          { kind: 'solution', ask: 0, lines: [
            '$0{,}25 \\times T = 90$ ، إذن $T = \\dfrac{90}{0{,}25} = 360$.',
            'تحقّق: $0{,}25 \\times 360 = 90$. الدفعة الثانية فيها 360 كرّاسًا.',
          ] },
        ],
      },
      {
        label: '3)', title: 'قطاع السنة الثالثة',
        question: 'عيّن قيس الزاوية التي يشغلها قطاع السنة الثالثة في المخطط الدائري.',
        asks: ['قيس زاوية قطاع السنة الثالثة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['nisba-min-adad'],
            prompt: 'زاوية القطاع تتناسب مع نسبته، والدائرة كلها:',
            options: [
              '$360^{\\circ}$ تقابل $100\\%$',
              '$180^{\\circ}$ تقابل $100\\%$',
              '$100^{\\circ}$ تقابل $360\\%$',
            ],
            correct: 0, cols: 3,
            explain: 'الدائرة كلها $100\\%$ من المجموع، وقيس زاويتها $360^{\\circ}$ ؛ نصف الدائرة $180^{\\circ}$ يقابل $50\\%$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['nisba-min-adad'],
            prompt: 'قيس زاوية قطاع السنة الثالثة (بالدرجة):', expected: 54, suffix: 'درجة',
            explain: '$\\dfrac{15}{100} \\times 360 = 54$.' },
          { kind: 'solution', ask: 0, lines: [
            'السنة الثالثة نسبتها $15\\%$ من الدائرة التي قيسها $360^{\\circ}$.',
            '$\\dfrac{15}{100} \\times 360 = 54$ ، إذن قيس زاوية قطاعها $54^{\\circ}$.',
          ] },
        ],
      },
    ],
  },

  // ── 4 · emerald · valeur cachée par le متوسط, N pair, pourcentage ────────────────────────────────────
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — نادي البيئة وتدوير الورق',
    context: 'قيمة مجهولة يكشفها المتوسط',
    emoji: '♻️',
    source: SOURCE,
    tone: 'emerald',
    statement: 'النظافة من الإيمان. جمع نادي البيئة في المتوسطة الورق المستعمل ليعاد تدويره خلال ستة أيام، ويبيّن الجدول المقابل كتلة الورق المجمَّع كل يوم بالكيلوغرام (لم تُسجَّل كتلة اليوم السادس). يعلم النادي أنّ متوسط كتل الأيام الستة هو 25 كغ. بيع الورق بسعر 12 دج للكيلوغرام، وخُصّصت 40% من ثمنه لغرس أشجار في ساحة المتوسطة.',
    table: {
      caption: 'كتلة الورق المجمَّع كل يوم',
      head: ['اليوم', '1', '2', '3', '4', '5', '6'],
      rows: [['الكتلة (كغ)', '18', '22', '26', '30', '20', '؟']],
    },
    parts: [
      {
        label: '1)', title: 'كتلة اليوم السادس',
        question: 'ما كتلة الورق المجمَّع في اليوم السادس؟',
        asks: ['كتلة الورق في اليوم السادس'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['mutawassit-murajjah', 'muadala-ula'],
            prompt: 'نسمّي $x$ كتلة اليوم السادس. المتوسط 25 كغ يعطي المعادلة:',
            options: [
              '$\\dfrac{18 + 22 + 26 + 30 + 20 + x}{6} = 25$',
              '$\\dfrac{18 + 22 + 26 + 30 + 20 + x}{5} = 25$',
              '$18 + 22 + 26 + 30 + 20 + x = 25$',
            ],
            correct: 0, cols: 1,
            explain: 'المتوسط هو المجموع مقسومًا على عدد القيم، وعدد الأيام ستة (اليوم المجهول يُحسب). المجموع كله يساوي إذن $25 \\times 6$.' },
          { kind: 'numeric', role: 'compute', requires: ['mutawassit-murajjah'],
            prompt: 'مجموع الكتل في الأيام الستة (المتوسط × عدد الأيام):', expected: 150,
            explain: '$25 \\times 6 = 150$.' },
          { kind: 'numeric', role: 'compute', requires: ['mutawassit-murajjah'],
            prompt: 'مجموع الكتل الخمس المعلومة:', expected: 116,
            explain: '$18 + 22 + 26 + 30 + 20 = 116$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['muadala-ula'],
            prompt: 'كتلة اليوم السادس (بالكيلوغرام):', expected: 34, suffix: 'كغ',
            explain: '$116 + x = 150$ ، إذن $x = 150 - 116 = 34$.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\dfrac{18 + 22 + 26 + 30 + 20 + x}{6} = 25$ ، إذن $116 + x = 25 \\times 6 = 150$.',
            '$x = 150 - 116 = 34$ ؛ تحقّق: $\\dfrac{116 + 34}{6} = \\dfrac{150}{6} = 25$.',
            'جمع النادي 34 كغ في اليوم السادس.',
          ] },
        ],
      },
      {
        label: '2)', title: 'المدى والوسيط',
        question: 'احسب مدى السلسلة، ثم عيّن وسيطها.',
        asks: ['مدى السلسلة', 'وسيط السلسلة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mada'],
            prompt: 'مدى السلسلة (بالكيلوغرام):', expected: 16, suffix: 'كغ',
            explain: 'أكبر قيمة $34$ وأصغر قيمة $18$ : $34 - 18 = 16$.' },
          { kind: 'choice', role: 'translate', requires: ['wasit-rutba'],
            prompt: 'عدد القيم زوجي، فالوسيط هو نصف مجموع القيمتين الوسطيتين:',
            options: [
              'بعد ترتيب القيم الستة تصاعديًا',
              'كما هي مكتوبة في الجدول (اليومان الثالث والرابع)',
              'أكبر قيمة وأصغر قيمة',
            ],
            correct: 0,
            explain: 'الوسيط تعيّنه الرتبة، ولا تتحدّد الرتبة إلّا بعد الترتيب. اليومان الثالث والرابع في الجدول يعطيان $\\dfrac{26 + 30}{2} = 28$ وهو ليس الوسيط.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['wasit-rutba'],
            prompt: 'وسيط السلسلة (بالكيلوغرام):', expected: 24, suffix: 'كغ',
            explain: 'بعد الترتيب: $18$ ، $20$ ، $22$ ، $26$ ، $30$ ، $34$ ؛ الرتبتان $\\dfrac{6}{2} = 3$ و $4$ : $\\mathrm{Med} = \\dfrac{22 + 26}{2} = 24$.' },
          { kind: 'solution', ask: 0, lines: [
            'أكبر قيمة 34 وأصغر قيمة 18 : المدى $34 - 18 = 16$ كغ.',
            'بعد الترتيب $18$ ، $20$ ، $22$ ، $26$ ، $30$ ، $34$ ؛ الرتبتان 3 و 4 : $\\mathrm{Med} = \\dfrac{22 + 26}{2} = 24$ كغ.',
          ] },
        ],
      },
      {
        label: '3)', title: 'ثمن الورق والأشجار',
        question: 'ما ثمن الورق المجمَّع كله؟ وما المبلغ المخصّص لغرس الأشجار؟',
        asks: ['ثمن الورق المجمَّع', 'المبلغ المخصّص للأشجار'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, suffix: 'دج',
            prompt: 'ثمن الورق المجمَّع في الأيام الستة كلها (سعر الكيلوغرام 12 دج):', expected: 1800,
            explain: 'مجموع الكتل $25 \\times 6 = 150$ كغ، وثمنها $150 \\times 12 = 1800$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['nisba-min-adad'], suffix: 'دج',
            prompt: 'المبلغ المخصّص للأشجار، أي 40% من الثمن:', expected: 720,
            explain: '$\\dfrac{40}{100} \\times 1800 = 0{,}4 \\times 1800 = 720$.' },
          { kind: 'solution', ask: 0, lines: [
            'ثمن الورق: $150 \\times 12 = 1800$ دج.',
            'المخصّص للأشجار: $\\dfrac{40}{100} \\times 1800 = 720$ دج.',
          ] },
        ],
      },
    ],
  },

  // ── 5 · teal · effectif caché ────────────────────────────────────────────────────────────────────────
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — ورشة النجارة',
    context: 'تكرار ضائع، المتوسط والوسيط',
    emoji: '🪑',
    source: SOURCE,
    tone: 'teal',
    statement: 'من أتقن عمله أحبّه الله. يصنع النجّار ياسين كراسي خشبية في ورشته، وقد سجّل عدد الكراسي المنجزة كل يوم خلال 20 يوم عمل. يلخّص الجدول المقابل ما سجّله، غير أنّ تكرار القيمة 3 ضاع من دفتره. يمنحه صاحب الورشة مكافأة قدرها 300 دج عن كل يوم أنجز فيه 5 كراسٍ على الأقل.',
    table: {
      caption: 'عدد الكراسي المنجزة في اليوم',
      head: ['عدد الكراسي المنجزة', '2', '3', '4', '5', '6'],
      rows: [['عدد الأيام', '2', '؟', '6', '4', '3']],
    },
    parts: [
      {
        label: '1)', title: 'التكرار الضائع',
        question: 'ما تكرار القيمة 3 الضائع؟',
        asks: ['تكرار القيمة 3'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['takrar-kulli'],
            prompt: 'التكرار الكلي لهذه السلسلة، وهو عدد أيام العمل المذكور في الوضعية، يساوي:',
            options: [
              'مجموع تكرارات كل القيم، بما فيها التكرار الضائع',
              'مجموع القيم المختلفة $2 + 3 + 4 + 5 + 6$',
              'عدد الأعمدة في الجدول',
            ],
            correct: 0,
            explain: 'التكرار الكلي $N$ مجموع التكرارات كلها، ومنها تكرار القيمة 3 المجهول. مجموع القيم المختلفة لا علاقة له بعدد الأيام.' },
          { kind: 'numeric', role: 'compute', requires: ['takrar-kulli'],
            prompt: 'مجموع التكرارات المعلومة:', expected: 15,
            explain: '$2 + 6 + 4 + 3 = 15$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['takrar-kulli', 'muadala-ula'],
            prompt: 'تكرار القيمة 3:', expected: 5, suffix: 'أيام',
            explain: '$15 + a = 20$ ، إذن $a = 20 - 15 = 5$.' },
          { kind: 'solution', ask: 0, lines: [
            'نسمّي $a$ تكرار القيمة 3 : $2 + a + 6 + 4 + 3 = 20$ ، أي $15 + a = 20$.',
            '$a = 20 - 15 = 5$ : أنجز ياسين 3 كراسٍ في 5 أيام.',
          ] },
        ],
      },
      {
        label: '2)', title: 'المتوسط والوسيط',
        question: 'احسب متوسط عدد الكراسي المنجزة في اليوم، ثم عيّن الوسيط.',
        asks: ['متوسط عدد الكراسي في اليوم', 'وسيط السلسلة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['mutawassit-murajjah'],
            prompt: 'مجموع الكراسي المنجزة (كل قيمة في تكرارها، وتكرار القيمة 3 هو 5):', expected: 81,
            explain: '$2 \\times 2 + 3 \\times 5 + 4 \\times 6 + 5 \\times 4 + 6 \\times 3 = 4 + 15 + 24 + 20 + 18 = 81$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mutawassit-murajjah'],
            prompt: 'متوسط عدد الكراسي في اليوم:', expected: 4.05, display: '4,05',
            explain: '$m = \\dfrac{81}{20} = 4{,}05$ : نقسم على عدد الأيام $20$ لا على عدد القيم المختلفة $5$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['wasit-rutba', 'takrar-mujamma'],
            prompt: 'وسيط السلسلة:', expected: 4,
            explain: 'الرتبتان $\\dfrac{20}{2} = 10$ و $11$. التكرارات المجمعة الصاعدة: $2$ (القيمة 2)، $2 + 5 = 7$ (القيمة 3)، $7 + 6 = 13$ (القيمة 4): الرتبتان في القيمة 4، إذن $\\mathrm{Med} = 4$.' },
          { kind: 'solution', ask: 0, lines: [
            '$m = \\dfrac{2 \\times 2 + 3 \\times 5 + 4 \\times 6 + 5 \\times 4 + 6 \\times 3}{20} = \\dfrac{81}{20} = 4{,}05$.',
            'الرتبتان 10 و 11 : الصاعد $2$ ، $7$ ، $13$ ، فالقيمتان كلتاهما 4 ، إذن $\\mathrm{Med} = 4$.',
            'متوسط ما ينجزه ياسين $4{,}05$ كراسٍ في اليوم، ووسيط السلسلة 4 كراسٍ.',
          ] },
        ],
      },
      {
        label: '3)', title: 'المكافآت',
        question: 'كم يومًا استحقّ فيه ياسين المكافأة؟ وما نسبة هذه الأيام المئوية من أيام العمل؟ وكم تبلغ مكافآته في المجموع؟',
        asks: ['عدد أيام المكافأة', 'نسبتها المئوية من أيام العمل', 'مجموع المكافآت'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['takrar-mujamma'],
            prompt: 'الأيام التي أنجز فيها ياسين 5 كراسٍ على الأقل هي التكرار المجمع:',
            options: [
              'النازل للقيمة 5',
              'الصاعد للقيمة 5',
              'تكرار القيمة 5 وحدها',
            ],
            correct: 0, cols: 3,
            explain: '«5 على الأقل» تعني القيمتين 5 و 6 (فما فوق): هذا هو النازل. الصاعد للقيمة 5 يعطي «5 كراسٍ على الأكثر»: $2 + 5 + 6 + 4 = 17$ يومًا.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['takrar-mujamma'],
            prompt: 'عدد أيام المكافأة:', expected: 7, suffix: 'أيام',
            explain: '$4 + 3 = 7$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['nisba-min-adad'], suffix: '%',
            prompt: 'نسبة هذه الأيام المئوية من أيام العمل:', expected: 35,
            explain: '$\\dfrac{7}{20} = 0{,}35 = 35\\%$.' },
          { kind: 'numeric', role: 'answer', ask: 2, suffix: 'دج',
            prompt: 'مجموع المكافآت:', expected: 2100,
            explain: '$7 \\times 300 = 2100$.' },
          { kind: 'solution', ask: 0, lines: [
            '«5 كراسٍ على الأقل»: القيمتان 5 و 6 ، أي $4 + 3 = 7$ أيام.',
            '$\\dfrac{7}{20} = 0{,}35$ ، أي 35% من أيام العمل.',
            'تبلغ المكافآت $7 \\times 300 = 2100$ دج.',
          ] },
        ],
      },
    ],
  },

  // ── 6 · violet · histogramme en classes ──────────────────────────────────────────────────────────────
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — ساعات برّ الوالدين',
    context: 'مدرّج تكراري: متوسط تقريبي وفئة وسيطية',
    emoji: '👨‍👩‍👧',
    source: SOURCE,
    tone: 'violet',
    statement: 'برّ الوالدين من أعظم القربات. استجوب أستاذ التربية البدنية 40 تلميذًا من المتوسطة عن عدد الساعات التي يساعدون فيها والديهم في البيت كل أسبوع، ويمثّل المدرّج التكراري المقابل النتائج في أربع فئات: $[0 ; 2[$ و $[2 ; 4[$ و $[4 ; 6[$ و $[6 ; 8[$ (بالساعة). قرّر الأستاذ تكريم كل تلميذ يساعد والديه 4 ساعات فأكثر برحلة تكلّف 200 دج للتلميذ.',
    figure: {
      kind: 'chart', type: 'histogram',
      ariaLabel: 'مدرّج تكراري لعدد الساعات الأسبوعية التي يساعد فيها التلاميذ والديهم في أربع فئات',
      xTitle: 'الساعات في الأسبوع', yTitle: 'عدد التلاميذ', y: { max: 20, step: 4, minor: 2 },
      edges: [0, 2, 4, 6, 8], values: [12, 18, 6, 4],
    },
    parts: [
      {
        label: '1)', title: 'أقلّ من 4 ساعات',
        question: 'كم تلميذًا يساعد والديه أقلّ من 4 ساعات؟ وما نسبتهم المئوية من التلاميذ المستجوَبين؟',
        asks: ['عدد التلاميذ الذين يساعدون أقلّ من 4 ساعات', 'نسبتهم المئوية'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['takrar-mujamma'],
            prompt: 'عدد التلاميذ الذين يساعدون والديهم أقلّ من 4 ساعات (الفئتان الأولى والثانية):', expected: 30, suffix: 'تلميذًا',
            explain: 'ارتفاعا المستطيلين الأولين 12 و 18 : $12 + 18 = 30$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['nisba-min-adad'], suffix: '%',
            prompt: 'نسبتهم المئوية من التلاميذ الأربعين:', expected: 75,
            explain: '$\\dfrac{30}{40} = 0{,}75 = 75\\%$.' },
          { kind: 'solution', ask: 0, lines: [
            'الفئتان $[0 ; 2[$ و $[2 ; 4[$ : $12 + 18 = 30$ تلميذًا.',
            '$\\dfrac{30}{40} = 0{,}75$ ، أي 75% من التلاميذ المستجوَبين.',
          ] },
        ],
      },
      {
        label: '2)', title: 'المتوسط والفئة الوسيطية',
        question: 'احسب القيمة التقريبية لمتوسط الساعات الأسبوعية، ثم عيّن الفئة الوسيطية.',
        asks: ['القيمة التقريبية للمتوسط', 'الفئة الوسيطية'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['mutawassit-murajjah'],
            prompt: 'لا نعرف الساعات الدقيقة لكل تلميذ، فنحسب المتوسط التقريبي بـ:',
            options: [
              'مركز كل فئة (منتصف حدّيها) مضروبًا في تكرارها',
              'الحدّ الأدنى لكل فئة مضروبًا في تكرارها',
              'مجموع حدود الفئات مقسومًا على عددها',
            ],
            correct: 0,
            explain: 'نعوّض كل تلاميذ الفئة بمركزها: مركز $[0 ; 2[$ هو $\\dfrac{0 + 2}{2} = 1$ ، ومركز $[2 ; 4[$ هو $3$ ، ومركز $[4 ; 6[$ هو $5$ ، ومركز $[6 ; 8[$ هو $7$.' },
          { kind: 'numeric', role: 'compute', requires: ['mutawassit-murajjah'],
            prompt: 'مجموع (مركز الفئة × تكرارها) للفئات الأربع:', expected: 124,
            explain: '$1 \\times 12 + 3 \\times 18 + 5 \\times 6 + 7 \\times 4 = 12 + 54 + 30 + 28 = 124$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mutawassit-murajjah'],
            prompt: 'القيمة التقريبية للمتوسط (بالساعة):', expected: 3.1, display: '3,1',
            explain: '$m \\approx \\dfrac{124}{40} = 3{,}1$ ساعة في الأسبوع.' },
          { kind: 'numeric', role: 'compute', requires: ['wasit-rutba'],
            prompt: 'الرتبة الأولى من رتبتي الوسيط (عدد التلاميذ زوجي):', expected: 20,
            explain: '$\\dfrac{40}{2} = 20$ والرتبة الثانية $21$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['wasit-rutba', 'takrar-mujamma'],
            prompt: 'الفئة الوسيطية، وهي الفئة التي تقع فيها الرتبتان 20 و 21 ، هي:',
            options: ['$[2 ; 4[$', '$[0 ; 2[$', '$[4 ; 6[$'],
            correct: 0, cols: 3,
            explain: 'التكرارات المجمعة الصاعدة: $12$ (للفئة الأولى)، $12 + 18 = 30$ (للثانية). الرتبتان 20 و 21 أكبر من 12 وأصغر من 30 ، فهما في الفئة $[2 ; 4[$.' },
          { kind: 'solution', ask: 0, lines: [
            '$m \\approx \\dfrac{1 \\times 12 + 3 \\times 18 + 5 \\times 6 + 7 \\times 4}{40} = \\dfrac{124}{40} = 3{,}1$ ساعة.',
            'الرتبتان 20 و 21 : الصاعد $12$ ثم $30$ ، فالفئة الوسيطية هي $[2 ; 4[$.',
          ] },
        ],
      },
      {
        label: '3)', title: 'رحلة التكريم',
        question: 'كم تلميذًا يُكرَّم بالرحلة؟ وكم تبلغ تكلفتها؟',
        asks: ['عدد التلاميذ المكرَّمين', 'تكلفة الرحلة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['takrar-mujamma'],
            prompt: 'التلاميذ الذين يساعدون والديهم 4 ساعات فأكثر هم:',
            options: [
              'تلاميذ الفئتين $[4 ; 6[$ و $[6 ; 8[$ : التكرار المجمع النازل للفئة $[4 ; 6[$',
              'تلاميذ الفئة $[4 ; 6[$ وحدها',
              'تلاميذ الفئتين $[0 ; 2[$ و $[2 ; 4[$',
            ],
            correct: 0,
            explain: '«4 ساعات فأكثر» تبدأ من الحدّ 4 وتمتدّ إلى الأكبر: الفئتان الثالثة والرابعة، لا الثالثة وحدها.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['takrar-mujamma'],
            prompt: 'عدد التلاميذ المكرَّمين:', expected: 10, suffix: 'تلاميذ',
            explain: '$6 + 4 = 10$ ؛ والتلاميذ الباقون هم $40 - 10 = 30$.' },
          { kind: 'numeric', role: 'answer', ask: 1, suffix: 'دج',
            prompt: 'تكلفة الرحلة:', expected: 2000,
            explain: '$10 \\times 200 = 2000$.' },
          { kind: 'solution', ask: 0, lines: [
            '«4 ساعات فأكثر»: الفئتان $[4 ; 6[$ و $[6 ; 8[$ ، أي $6 + 4 = 10$ تلاميذ.',
            'تكلفة الرحلة $10 \\times 200 = 2000$ دج.',
          ] },
        ],
      },
    ],
  },
];

/** id → مسألة (lu par les modules). */
export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
