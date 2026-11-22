/**
 * Les trois « مسائل » du درس « حصر عدد عشري موجب » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem).
 * La مسألة 1 (`LESSON_CONFIG.lessonProblem`) : le ميزان d'une مطحنة qui arrondit à 0,1 kg et lit 24,9 kg (hasr de la masse, × 40 avec la propriété du × positif) ;
 * la 2 la consommation d'une voiture (437 km, 31 L : deux quotients lus sur la calculatrice) ; la 3 un chronométreur qui arrondit au centième (qui est le plus
 * rapide ?). Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt), les écrans de la calculatrice avec `quotientDigits`.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — كيس السميد',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🌾',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'الميزان يدوِّر الكتلة إلى 0,1 kg', useful: true },
      { id: 'd2', text: 'قرأ الميزان 24,9 kg على الكيس', useful: true },
      { id: 'd3', text: 'المطحنة تنتج السميد', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حصر الكتلة الحقيقية',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['حصر m'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-min-mudawwar'],
            prompt: 'مدوّر الكتلة $m$ إلى $0{,}1$ هو $24{,}9$ ، إذن:',
            options: ['$24{,}85\\leq m<24{,}95$', '$24{,}9\\leq m<25$', '$24{,}85<m<24{,}95$', '$24{,}8\\leq m<24{,}9$'], correct: 0, cols: 1,
            explain: 'نطرح نصف الرتبة $0{,}05$ من $24{,}9$ ونضيفه إليه: $24{,}85\\leq m<24{,}95$ ، والطرف الأيسر مشمول والأيمن غير مشمول.' },
          { kind: 'solution', ask: 0, lines: [
            'الميزان يدوِّر إلى $0{,}1$ ، فنصف الرتبة هو $0{,}05$ .',
            'إذن $24{,}9-0{,}05\\leq m<24{,}9+0{,}05$ أي $24{,}85\\leq m<24{,}95$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الكتلة 24,96 kg؟',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['هل يمكن؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-min-mudawwar'],
            prompt: 'هل يمكن أن تكون $m=24{,}96$ kg ؟',
            options: ['لا: مدوّر $24{,}96$ إلى $0{,}1$ هو $25$ وليس $24{,}9$', 'نعم: لأنّ $24{,}96$ قريب من $24{,}9$', 'نعم: لأنّ $24{,}96<25$'], correct: 0, cols: 1,
            explain: '$24{,}96\\geq24{,}95$ فهو خارج المجال: الميزان كان سيقرأ $25{,}0$ .' },
          { kind: 'solution', ask: 0, lines: [
            'من الجزء الأوّل $24{,}85\\leq m<24{,}95$ .',
            'و $24{,}96>24{,}95$ فهو خارج المجال: لا يمكن.',
          ] },
        ],
      },
      {
        label: '3)', title: 'أخفّ من 25 kg؟',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['هل هو أخفّ من 25؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-min-mudawwar'],
            prompt: 'هل الكيس أخفّ من $25$ kg بالتأكيد؟',
            options: ['نعم: لأنّ $m<24{,}95<25$', 'لا يمكن الجزم: قد تكون $m$ أكبر من $25$', 'لا: لأنّ $24{,}9$ قريب من $25$'], correct: 0, cols: 1,
            explain: 'كل قيمة ممكنة لـ $m$ أصغر من $24{,}95$ ، وهو أصغر من $25$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نعلم أنّ $m<24{,}95$ .',
            'و $24{,}95<25$ ، فالكيس أخفّ من $25\\,\\mathrm{kg}$ بالتأكيد.',
          ] },
        ],
      },
      {
        label: '4)', title: 'حصر كتلة 40 كيسًا',
        question: LESSON_CONFIG.lessonProblem.questions[3].text,
        asks: ['حصر 40m'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-min-mudawwar'],
            prompt: 'حصر كتلة الأكياس الأربعين $40m$ هو:',
            options: ['$994\\leq 40m<998$', '$994<40m<998$', '$996\\leq 40m<1000$', '$24{,}85\\leq 40m<24{,}95$'], correct: 0, cols: 1,
            explain: 'نضرب الأطراف الثلاثة من $24{,}85\\leq m<24{,}95$ في $40$ وهو موجب: $994\\leq 40m<998$ ، ويبقى الطرف الأيسر مشمولًا.' },
          { kind: 'solution', ask: 0, lines: [
            'نضرب $24{,}85\\leq m<24{,}95$ في $40$ وهو عدد موجب: الاتجاه نفسه.',
            'إذن $994\\leq 40m<998$ : كتلة الأكياس الأربعين بين $994\\,\\mathrm{kg}$ و $998\\,\\mathrm{kg}$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — رحلة العائلة',
    context: 'رحلة العائلة',
    emoji: '🚗',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'route', from: 'البيت', to: 'بيت الجدّ', distance: 437, unit: 'كم', vehicles: [{ icon: 'car', at: 0 }], ariaLabel: 'سيارة تنطلق من البيت نحو بيت الجدّ، والمسافة بينهما 437 كيلومترًا' },
    statement: 'قطعت سيارة عائلة 437 km واستهلكت 31 لترًا من الوقود.',
    data: [
      { id: 'km', text: 'المسافة 437 كيلومترًا', useful: true },
      { id: 'l', text: 'الوقود المستهلك 31 لترًا', useful: true },
      { id: 'time', text: 'الرحلة يوم العطلة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حصر الاستهلاك',
        question: 'الاستهلاك لكل $100$ km هو $c=\\frac{3100}{437}$ لترًا، وتُظهر الآلة الحاسبة $3100\\div437=7.093821510$ . احصر $c$ إلى $0{,}01$ .',
        asks: ['حصر c'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-rutba'],
            prompt: 'حصر $c$ إلى $0{,}01$ هو:',
            options: ['$7{,}09<c<7{,}10$', '$7{,}10<c<7{,}11$', '$7{,}08<c<7{,}09$', '$7{,}09<c<7{,}093$'], correct: 0, cols: 2,
            explain: 'نقرأ رقمين بعد الفاصلة: $7{,}09$ ثم نضيف $0{,}01$ فنجد $7{,}10$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نقرأ على الشاشة $7.0938\\ldots$ ونحتفظ برقمين بعد الفاصلة: $7{,}09$ .',
            'نضيف $0{,}01$ : $7{,}09<c<7{,}10$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'مدوّر الاستهلاك',
        question: 'أعط مدوّر $c$ إلى $0{,}1$ .',
        asks: ['المدوّر'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tadwir'],
            prompt: 'مدوّر $c$ إلى $0{,}1$ هو:',
            options: ['$7{,}1$', '$7$', '$7{,}09$', '$7{,}0$'], correct: 0, cols: 2,
            explain: 'الرقم الذي يلي الجزء من عشرة هو $9$ فنرفع: $7{,}0\\to7{,}1$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$c=7{,}0938\\ldots$ ، والرقم الذي يلي الجزء من عشرة هو $9$ .',
            'نرفع الرقم الأخير: مدوّر $c$ إلى $0{,}1$ هو $7{,}1$ لترًا لكل $100$ km .',
          ] },
        ],
      },
      {
        label: '3)', title: 'المسافة لكل لتر',
        question: 'المسافة المقطوعة بلتر واحد هي $d=\\frac{437}{31}$ كيلومترًا، وتُظهر الآلة $437\\div31=14.09677419$ . أعط مدوّر $d$ إلى الوحدة وإلى $0{,}1$ .',
        asks: ['المدوّران'],
        steps: [
          { kind: 'batch', role: 'answer', ask: 0, requires: ['hasr-rutba'], prompt: 'اختر المدوّر في كل رتبة:',
            rows: [
              { label: 'مدوّر $d$ إلى الوحدة', options: ['$14$', '$15$', '$14{,}1$'], correct: 0, correction: 'الرقم الذي يلي الوحدة هو $0$ فلا نرفع: $14$ .' },
              { label: 'مدوّر $d$ إلى $0{,}1$', options: ['$14{,}0$', '$14{,}1$', '$14{,}09$'], correct: 1, correction: 'الرقم الذي يلي الجزء من عشرة هو $9$ فنرفع: $14{,}1$ .' },
            ] },
          { kind: 'solution', ask: 0, lines: [
            'نقرأ على الشاشة $14.0967\\ldots$ .',
            'إلى الوحدة: الرقم التالي $0$ فنجد $14$ . إلى $0{,}1$ : الرقم التالي $9$ فنرفع فنجد $14{,}1$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — سباق 100 م',
    context: 'سباق 100 م',
    emoji: '🏃',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'timeline', icon: 'person', title: 'سباق العدّاءتين', marks: [{ label: 'زمن مريم', value: '12,47', unit: 'ث' }, { label: 'زمن سارة', value: '12,48', unit: 'ث' }], ariaLabel: 'سباق مئة متر: الميقاتي سجّل لمريم 12,47 ثانية ولسارة 12,48 ثانية' },
    statement: 'يكتب الميقاتي الزمن مدوّرًا إلى $0{,}01$ s . قرأ لمريم $12{,}47$ s ولسارة $12{,}48$ s .',
    data: [
      { id: 'r', text: 'الميقاتي يدوِّر الزمن إلى 0,01 ثانية', useful: true },
      { id: 'm', text: 'قرأ لمريم 12,47 ثانية ولسارة 12,48 ثانية', useful: true },
      { id: 'd', text: 'السباق في ملعب المتوسطة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'زمن مريم',
        question: 'احصر زمن مريم الحقيقي $t_M$ .',
        asks: ['حصر t_M'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-min-mudawwar'],
            prompt: 'حصر $t_M$ هو:',
            options: ['$12{,}465\\leq t_M<12{,}475$', '$12{,}47\\leq t_M<12{,}48$', '$12{,}465<t_M<12{,}475$', '$12{,}46\\leq t_M<12{,}47$'], correct: 0, cols: 1,
            explain: 'نصف الرتبة $0{,}005$ : $12{,}47-0{,}005=12{,}465$ و $12{,}47+0{,}005=12{,}475$ ، والأيمن غير مشمول.' },
          { kind: 'solution', ask: 0, lines: [
            'الرتبة $0{,}01$ ونصفها $0{,}005$ .',
            '$12{,}465\\leq t_M<12{,}475$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'زمن سارة',
        question: 'واحصر زمن سارة الحقيقي $t_S$ .',
        asks: ['حصر t_S'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-min-mudawwar'],
            prompt: 'حصر $t_S$ هو:',
            options: ['$12{,}475\\leq t_S<12{,}485$', '$12{,}48\\leq t_S<12{,}49$', '$12{,}475<t_S<12{,}485$', '$12{,}47\\leq t_S<12{,}48$'], correct: 0, cols: 1,
            explain: '$12{,}48-0{,}005=12{,}475$ و $12{,}48+0{,}005=12{,}485$ .' },
          { kind: 'solution', ask: 0, lines: [
            'المدوّر $12{,}48$ ونصف الرتبة $0{,}005$ .',
            '$12{,}475\\leq t_S<12{,}485$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'من الأسرع؟',
        question: 'هل يمكن الجزم أنّ مريم أسرع من سارة؟',
        asks: ['هل مريم أسرع؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-min-mudawwar'],
            prompt: 'هل يمكن الجزم أنّ مريم أسرع من سارة؟',
            options: ['نعم: لأنّ $t_M<12{,}475\\leq t_S$', 'لا يمكن الجزم: الزمنان متقاربان', 'لا: لأنّ الميزان يدوِّر'], correct: 0, cols: 1,
            explain: 'كل زمن ممكن لمريم أصغر من $12{,}475$ ، وكل زمن ممكن لسارة أكبر من أو يساوي $12{,}475$ .' },
          { kind: 'solution', ask: 0, lines: [
            'من الجزأين السابقين $t_M<12{,}475$ و $t_S\\geq12{,}475$ .',
            'إذن $t_M<t_S$ : مريم أسرع بالتأكيد.',
          ] },
        ],
      },
      {
        label: '4)', title: 'لو تساوت القراءتان',
        question: 'لو قرأ الميقاتي $12{,}47$ s للعدّاءتين معًا، هل يمكن الجزم أيّهما أسرع؟',
        asks: ['هل يمكن الجزم؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-min-mudawwar'],
            prompt: 'هل يمكن الجزم أيّهما أسرع؟',
            options: ['لا يمكن: لكل منهما أيّ زمن في $[12{,}465\\,;\\,12{,}475[$', 'نعم: الأولى لأنّها ركضت أوّلًا', 'نعم: متساويتان تمامًا'], correct: 0, cols: 1,
            explain: 'القراءة المتساوية تعني أنّ الزمنين في المجال نفسه، فقد يكون أيّ منهما أصغر.' },
          { kind: 'solution', ask: 0, lines: [
            'الزمنان معًا في المجال $12{,}465\\leq t<12{,}475$ .',
            'لا يمكن الجزم: قد يكون أيّ منهما الأصغر، وقد يتساويان.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
