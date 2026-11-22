/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (modules 1 à 6) — des situations COMPLÈTES de type امتحان autour des six leçons de l'unité 3 de 2AM (التعليم على مستقيم مدرّج، المقارنة، المعلم،
 * الجمع والطرح، المجموع الجبري، المسافة), résolues pas à pas (GuidedProblem) AVANT l'analyse (module 7) et la situation évaluée (module 8). La feuille d'Excel du manuel (`integration`) est
 * REDESSINÉE en situation 1 (le budget d'une famille, semaine par semaine, montants propres, ni prêt ni intérêt) ; la « وضعية للتقويم » (`evaluation`) en situation 2 (les décalages d'HIVER
 * DONNÉS : la plateforme n'envoie jamais l'élève chercher sur internet) ; le تحدّي (`challenge`) en situation 3 (chott Melghir, Tahat, un avion, un puits : « حوالي ») ; la situation 4 est le
 * registre des situations d'examen « sol d'une classe dans un repère » (propre numérotation, propres nombres), les situations 5 et 6 sont de la plateforme. Aucune notion nouvelle ; ni produit ni
 * quotient de relatifs, ni équation, ni symétrie centrale, ni preuve de la nature d'un quadrilatère. Les réponses numériques sont des nombres décimaux signés (le GuidedProblem les saisit) ;
 * chaque nombre est recalculé dans ./problems.test.js (BigInt, centièmes).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const SOURCE = addition('exam_style_problem');
const S1 = src('integration', 52, 'أدمج تعلّماتي');
const S2 = src('evaluation', 52, 'وضعية للتقويم');
const S3 = src('challenge', 38, 'تحدّي');

export const PROBLEMS = [
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — ميزانية الأسرة في شهر',
    context: 'مداخيل (+) ومصاريف (−) في أربعة أسابيع',
    emoji: '💰',
    source: S1,
    tone: 'sky',
    table: { caption: 'مداخيل (+) ومصاريف (−) أسرة خلال شهر، بالدينار', head: ['', 'الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'],
      rows: [['مداخيل (+)', '$+56000$', '—', '$+6500$', '—'], ['مصاريف (−)', '$-12500$ ؛ $-3200$', '$-11800$ ؛ $-4600$', '$-13200$', '$-12900$ ؛ $-2400$']] },
    statement: 'سجّلت أسرة مداخيلها بإشارة $+$ ومصاريفها بإشارة $-$ خلال أربعة أسابيع من الشهر، وكتبت في كلّ أسبوع حصيلته مجموعًا جبريًا (انظر الجدول).',
    data: [
      { id: 'w1', text: 'الأسبوع 1: ⁦+56000⁩ ثمّ ⁦−12500⁩ و ⁦−3200⁩', useful: true },
      { id: 'w2', text: 'الأسبوع 2: ⁦−11800⁩ و ⁦−4600⁩', useful: true },
      { id: 'w3', text: 'الأسبوع 3: ⁦+6500⁩ و ⁦−13200⁩', useful: true },
      { id: 'w4', text: 'الأسبوع 4: ⁦−12900⁩ و ⁦−2400⁩', useful: true },
      { id: 'home', text: 'تسكن الأسرة في حيّ هادئ', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حصيلة كلّ أسبوع',
        question: 'ما حصيلة كلّ أسبوع من الأسابيع الأربعة؟',
        asks: ['حصيلة الأسبوع 1', 'حصيلة الأسبوع 2', 'حصيلة الأسبوع 3', 'حصيلة الأسبوع 4'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-majmu-jabri'], prompt: 'الأسبوع 1: $(+56000)+(-12500)+(-3200)=$', expected: 40300, suffix: 'DA', explain: 'السالبة $-12500-3200=-15700$ ، والمجموع $56000-15700=+40300$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['jam-nafs-ishara'], prompt: 'الأسبوع 2: $(-11800)+(-4600)=$', expected: -16400, suffix: 'DA', explain: 'عددان سالبان: نجمع المسافتين $11800+4600=16400$ ونحتفظ بالإشارة: $-16400$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['jam-ishara-mukhtalifa'], prompt: 'الأسبوع 3: $(+6500)+(-13200)=$', expected: -6700, suffix: 'DA', explain: 'إشارتان مختلفتان: $13200-6500=6700$ ، والأبعد عن الصفر هو $-13200$ ، فالحصيلة $-6700$ .' },
          { kind: 'numeric', role: 'answer', ask: 3, requires: ['jam-nafs-ishara'], prompt: 'الأسبوع 4: $(-12900)+(-2400)=$', expected: -15300, suffix: 'DA', explain: '$12900+2400=15300$ والإشارة سالبة: $-15300$ .' },
          { kind: 'solution', ask: 0, lines: ['الأسبوع 1: $(+56000)+(-12500)+(-3200)=+40300$ .', 'الأسابيع الأخرى: $-16400$ و $-6700$ و $-15300$ .'] },
        ],
      },
      {
        label: '2)', title: 'ترتيب الحصائل',
        question: 'رتّب الحصائل الأربع ترتيبًا تصاعديًا.',
        asks: ['ترتيب الحصائل'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['salibayn', 'mukhtalifayn'], prompt: 'الحصائل $+40300$ و $-16400$ و $-6700$ و $-15300$ ، مرتّبة تصاعديًا:',
            options: ['$-6700 < -15300 < -16400 < +40300$', '$-16400 < -15300 < -6700 < +40300$', '$+40300 < -6700 < -15300 < -16400$'], correct: 1, cols: 1,
            explain: 'بين العددين السالبين الأصغر هو الأبعد عن الصفر: $-16400 < -15300 < -6700$ ثمّ الموجب. الأوّل رتّب السالبة حسب مسافاتها، والثالث رتّب تنازليًا.' },
          { kind: 'solution', ask: 0, lines: ['السالبة أصغر من الموجبة، وبين السالبة الأصغر هو الأبعد عن الصفر.', '$-16400 < -15300 < -6700 < +40300$ .'] },
        ],
      },
      {
        label: '3)', title: 'حصيلة الشهر',
        question: 'ما حصيلة الشهر كلّه؟ وهل ادّخرت الأسرة؟',
        asks: ['حصيلة الشهر', 'هل ادّخرت الأسرة؟'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['tajmi-hudud'], prompt: 'مجموع الحصائل السالبة: $(-16400)+(-6700)+(-15300)=$', expected: -38400, explain: '$16400+6700+15300=38400$ ، والإشارة سالبة.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jam-ishara-mukhtalifa', 'qaidat-majmu-jabri'], prompt: 'حصيلة الشهر: $(+40300)+(-38400)=$', expected: 1900, suffix: 'DA', explain: '$40300-38400=1900$ ، والأبعد عن الصفر هو $+40300$ ، فالحصيلة $+1900$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['salibayn'], prompt: 'الحصيلة $+1900$ :',
            options: ['موجبة: ادّخرت الأسرة $1900\\,\\mathrm{DA}$', 'سالبة: صرفت الأسرة أكثر ممّا دخل', 'معدومة: لم يبق شيء'], correct: 0, cols: 1,
            explain: 'الحصيلة الموجبة تعني أنّ المداخيل أكبر من المصاريف، فبقي $1900\\,\\mathrm{DA}$ .' },
          { kind: 'solution', ask: 0, lines: ['المداخيل $56000+6500=62500$ والمصاريف $60600$ .', 'الحصيلة $+1900\\,\\mathrm{DA}$ : موجبة، فقد ادّخرت الأسرة.'] },
        ],
      },
      {
        label: '4)', title: 'الفرق بين أسبوعين',
        question: 'احسب الفرق بين حصيلة الأسبوع 3 وحصيلة الأسبوع 2.',
        asks: ['الفرق بين الحصيلتين'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarh-bi-muakis'], prompt: 'الطرح $(-6700)-(-16400)$ يساوي جمع:',
            options: ['$(-6700)+(+16400)$ ، أي معاكس العدد المطروح', '$(-6700)+(-16400)$', '$(+6700)+(+16400)$'], correct: 0, cols: 1,
            explain: 'نطرح عددًا بجمع معاكسه: معاكس $-16400$ هو $+16400$ . والخطآن أبقيا العدد المطروح كما هو أو غيّرا إشارة الأوّل.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tarh-bi-muakis'], prompt: '$(-6700)-(-16400)=$', expected: 9700, suffix: 'DA', explain: '$(-6700)+(+16400)$ : إشارتان مختلفتان، $16400-6700=9700$ والأبعد عن الصفر موجب، فالفرق $+9700$ .' },
          { kind: 'solution', ask: 0, lines: ['$(-6700)-(-16400)=(-6700)+(+16400)$ .', 'الفرق $+9700\\,\\mathrm{DA}$ ، أي أنّ حصيلة الأسبوع 3 أفضل بهذا القدر.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — فارق التوقيت',
    context: 'فروق التوقيت عن لندن في الشتاء',
    emoji: '🕒',
    source: S2,
    tone: 'amber',
    table: { caption: 'في فصل الشتاء: عدد الساعات التي تتقدّم بها الساعة (+) أو تتأخّر عنها (−) عن توقيت لندن',
      head: ['المدينة', 'الجزائر', 'القاهرة', 'بيروت', 'جوهانسبورغ', 'طوكيو', 'واشنطن'], rows: [['الفارق عن لندن', '$+1$', '$+2$', '$+2$', '$+2$', '$+9$', '$-5$']] },
    statement: 'في فصل الشتاء تتقدّم الساعة أو تتأخّر عن توقيت لندن (الصفر) في بعض المدن بعدد من الساعات يكتب عددًا نسبيًا (انظر الجدول). تشير الساعة إلى $12$ في الجزائر.',
    data: [
      { id: 'off', text: 'فوارق الشتاء الستّة عن لندن', useful: true },
      { id: 'noon', text: 'الساعة 12 في الجزائر', useful: true },
      { id: 'winter', text: 'الفوارق خاصّة بفصل الشتاء', useful: true },
      { id: 'flight', text: 'الرحلة إلى طوكيو تستغرق يومًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مستقيم مدرّج للفوارق',
        question: 'أيّ تدريجة تناسب تعليم الفوارق السبعة (ومنها لندن) على مستقيم مدرّج؟',
        asks: ['التدريجة المناسبة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ikhtiyar-tadrij', 'faasila'], prompt: 'الفوارق من $-5$ إلى $+9$ كلّها أعداد صحيحة بعضها فرديّ. تدريجة مناسبة:',
            options: ['تدريجة واحدة تساوي $1$', 'تدريجة واحدة تساوي $2$ ، فتقع $+1$ و $-5$ بين تدريجتين', 'تدريجة واحدة تساوي $0{,}1$ ، فتخرج $+9$ عن الورقة'], correct: 0, cols: 1,
            explain: 'تدريجة $1$ تعلّم كلّ الفوارق على تدريجات والمستقيم من $-5$ إلى $+9$ يتّسع للورقة. الثانية تترك $+1$ و $-5$ بين تدريجتين، والثالثة تحتاج $90$ تدريجة لبلوغ $+9$ .' },
          { kind: 'solution', ask: 0, lines: ['نحتاج تدريجة تقع عليها الفوارق كلّها: $-5$ و $0$ و $+1$ و $+2$ و $+9$ .', 'التدريجة $1$ هي المناسبة.'] },
        ],
      },
      {
        label: '2)', title: 'ترتيب الفوارق',
        question: 'رتّب الفوارق السبعة ترتيبًا تنازليًا.',
        asks: ['ترتيب الفوارق تنازليًا'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mukhtalifayn', 'tartib'], prompt: 'الفوارق $+9$ و $+2$ و $+2$ و $+2$ و $+1$ و $0$ و $-5$ ، مرتّبة تنازليًا:',
            options: ['$+9 > +2 = +2 = +2 > +1 > 0 > -5$', '$-5 < 0 < +1 < +2 = +2 = +2 < +9$', '$+9 > -5 > +2 = +2 = +2 > +1 > 0$'], correct: 0, cols: 1,
            explain: 'الأكبر أوّلًا: الموجبة ثمّ الصفر ثمّ السالب. الثاني ترتيب تصاعدي، والثالث وضع $-5$ بعد $+9$ لبعده عن الصفر.' },
          { kind: 'solution', ask: 0, lines: ['الموجبة أكبر من الصفر والصفر أكبر من السالب.', '$+9 > +2 = +2 = +2 > +1 > 0 > -5$ .'] },
        ],
      },
      {
        label: '3)', title: 'الساعة في المدن',
        question: 'ما الساعة في طوكيو؟ وفي واشنطن؟ وفي القاهرة؟',
        asks: ['الساعة في طوكيو', 'الساعة في واشنطن', 'الساعة في القاهرة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['tarh-bi-muakis'], prompt: 'طوكيو تتقدّم عن الجزائر بـ $(+9)-(+1)=$', expected: 8, explain: 'الفرق بين فارقي المدينتين عن لندن: $9-1=8$ ساعات.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jam-nafs-ishara'], prompt: 'الساعة في طوكيو: $12+8=$', expected: 20, suffix: 'h', explain: '$12+8=20$ ، أي الساعة العشرون.' },
          { kind: 'numeric', role: 'compute', requires: ['tarh-bi-muakis'], prompt: 'واشنطن تُغيّر الساعة بـ $(-5)-(+1)=$', expected: -6, explain: '$(-5)+(-1)=-6$ : تتأخّر $6$ ساعات عن الجزائر.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['jam-ishara-mukhtalifa'], prompt: 'الساعة في واشنطن: $12+(-6)=$', expected: 6, suffix: 'h', explain: '$12-6=6$ ، أي الساعة السادسة صباحًا.' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['tarh-bi-muakis'], prompt: 'الساعة في القاهرة: $12+[(+2)-(+1)]=$', expected: 13, suffix: 'h', explain: 'القاهرة تتقدّم عن الجزائر بساعة واحدة: $12+1=13$ . وكذلك بيروت وجوهانسبورغ.' },
          { kind: 'solution', ask: 0, lines: ['طوكيو $12+[(+9)-(+1)]=20$ ، وواشنطن $12+[(-5)-(+1)]=6$ .', 'القاهرة (وبيروت وجوهانسبورغ) $12+[(+2)-(+1)]=13$ .'] },
        ],
      },
      {
        label: '4)', title: 'الفارق بين طوكيو وواشنطن',
        question: 'ما الفارق بين توقيتي طوكيو وواشنطن؟',
        asks: ['الفارق بين التوقيتين'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['qaidat-masafa', 'masafa-abr-sifr'], prompt: 'طوكيو عند $+9$ وواشنطن عند $-5$ ، على جهتين من الصفر. الفارق هو:',
            options: ['$(+9)-(-5)$ ، أي مسافة بين عددين: الأكبر ناقص الأصغر', '$9-5$ لأنّنا نطرح المسافتين إلى الصفر', '$(-5)-(+9)$'], correct: 0, cols: 1,
            explain: 'الفارق مسافة بين عددين: الأكبر ناقص الأصغر. والنقطتان على جهتين من الصفر فنجمع المسافتين. الثاني طرح المسافتين خطأً، والثالث يعطي عددًا سالبًا.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-masafa'], prompt: '$(+9)-(-5)=$', expected: 14, suffix: 'h', explain: '$(+9)+(+5)=14$ ساعة.' },
          { kind: 'solution', ask: 0, lines: ['الفارق $(+9)-(-5)=(+9)+(+5)$ .', 'بين التوقيتين $14$ ساعة.'] },
        ],
      },
      {
        label: '5)', title: 'اتّصال بين المدينتين',
        question: 'اتّصلت عائلة في طوكيو بقريب لها في واشنطن في الساعة $20$ بتوقيت طوكيو. ما الساعة عنده؟',
        asks: ['الساعة في واشنطن'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jam-ishara-mukhtalifa'], prompt: 'واشنطن تتأخّر $14$ ساعة عن طوكيو: $20+(-14)=$', expected: 6, suffix: 'h', explain: '$20-14=6$ : الساعة السادسة، وهي الساعة التي وجدناها في الجزء 3.' },
          { kind: 'solution', ask: 0, lines: ['واشنطن متأخّرة عن طوكيو بـ $14$ ساعة: $20+(-14)=6$ .', 'الساعة عند القريب هي السادسة صباحًا.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — بين شطّ ملغيغ وقمّة تاهات',
    context: 'ارتفاعات موجبة وسالبة بالنسبة إلى سطح البحر',
    emoji: '⛰️',
    source: S3,
    tone: 'emerald',
    table: { caption: 'ارتفاعات بالمتر بالنسبة إلى مستوى سطح البحر (حوالي)', head: ['الموضع', 'الارتفاع'],
      rows: [['قمّة تاهات بالأهقار', '$+2908$'], ['شطّ ملغيغ', '$-40$'], ['طائرة في الجوّ', '$+3500$'], ['مستوى سطح البحر', '$0$']] },
    statement: 'أخفض نقطة في الجزائر هي شطّ ملغيغ، على حوالي $40\\,\\mathrm{m}$ تحت مستوى سطح البحر، وأعلى نقطة هي قمّة تاهات بالأهقار، على حوالي $2908\\,\\mathrm{m}$ فوقه. تحلّق طائرة على ارتفاع $3500\\,\\mathrm{m}$ ، وحفر فلّاح قرب الشطّ بئرًا عمقها $160\\,\\mathrm{m}$ من سطح الأرض.',
    data: [
      { id: 'tahat', text: 'قمّة تاهات: ⁦+2908 m⁩', useful: true },
      { id: 'chott', text: 'شطّ ملغيغ: ⁦−40 m⁩', useful: true },
      { id: 'plane', text: 'الطائرة: ⁦+3500 m⁩', useful: true },
      { id: 'well', text: 'عمق البئر: ⁦160 m⁩ من سطح الأرض', useful: true },
      { id: 'farmer', text: 'الفلّاح يزرع النخيل', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'فرق ارتفاع القمّة والشطّ',
        question: 'ما فرق الارتفاع بين قمّة تاهات وشطّ ملغيغ؟',
        asks: ['فرق الارتفاع بين القمّة والشطّ'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['qaidat-masafa'], prompt: 'القمّة عند $+2908$ والشطّ عند $-40$ ، على جهتين من مستوى البحر. فرق الارتفاع:',
            options: ['$(+2908)-(-40)$ ، أي الأعلى ناقص الأخفض', '$2908-40$', '$(-40)-(+2908)$'], correct: 0, cols: 1,
            explain: 'الفرق بين ارتفاعين مسافة: الأعلى ناقص الأخفض. والنقطتان على جهتين من الصفر فنجمع المسافتين. الثاني طرح المسافتين خطأً، والثالث سالب.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-masafa'], prompt: '$(+2908)-(-40)=$', expected: 2948, suffix: 'm', explain: '$2908+40=2948$ متر.' },
          { kind: 'solution', ask: 0, lines: ['$(+2908)-(-40)=(+2908)+(+40)$ .', 'فرق الارتفاع $2948\\,\\mathrm{m}$ .'] },
        ],
      },
      {
        label: '2)', title: 'علوّ الطائرة',
        question: 'كم مترًا تعلو الطائرة كلًّا من القمّة ومن الشطّ؟',
        asks: ['علوّ الطائرة فوق القمّة', 'علوّ الطائرة فوق الشطّ'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-masafa'], prompt: 'فوق القمّة: $(+3500)-(+2908)=$', expected: 592, suffix: 'm', explain: 'نقطتان فوق الصفر: $3500-2908=592$ متر.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qaidat-masafa'], prompt: 'فوق الشطّ: $(+3500)-(-40)=$', expected: 3540, suffix: 'm', explain: 'الشطّ تحت الصفر: $3500+40=3540$ متر.' },
          { kind: 'solution', ask: 0, lines: ['فوق القمّة $(+3500)-(+2908)=592$ .', 'فوق الشطّ $(+3500)-(-40)=3540$ ، فهي تعلو الشطّ أكثر.'] },
        ],
      },
      {
        label: '3)', title: 'قاع البئر',
        question: 'ما ارتفاع قاع البئر بالنسبة إلى مستوى سطح البحر؟',
        asks: ['ارتفاع قاع البئر'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarh-bi-muakis'], prompt: 'سطح الأرض عند $-40$ والبئر ينزل $160$ ، فقاعه عند:',
            options: ['$(-40)-(+160)$', '$(-40)+(+160)$', '$(+160)-(-40)$'], correct: 0, cols: 1,
            explain: 'النزول يخفض الارتفاع: $(-40)-(+160)$ . الثاني يرفع القاع، والثالث مسافة لا ارتفاع.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jam-nafs-ishara'], prompt: '$(-40)-(+160)=(-40)+(-160)=$', expected: -200, suffix: 'm', explain: 'عددان سالبان: $40+160=200$ والإشارة سالبة: $-200$ .' },
          { kind: 'solution', ask: 0, lines: ['$(-40)-(+160)=(-40)+(-160)$ .', 'قاع البئر عند $-200\\,\\mathrm{m}$ ، أي $200$ متر تحت مستوى البحر.'] },
        ],
      },
      {
        label: '4)', title: 'ترتيب الارتفاعات',
        question: 'رتّب ارتفاعات قاع البئر والشطّ ومستوى البحر والقمّة والطائرة ترتيبًا تصاعديًا.',
        asks: ['ترتيب الارتفاعات تصاعديًا'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['salibayn', 'mukhtalifayn'], prompt: 'الارتفاعات $-200$ و $-40$ و $0$ و $+2908$ و $+3500$ ، مرتّبة تصاعديًا:',
            options: ['$-40 < -200 < 0 < +2908 < +3500$', '$-200 < -40 < 0 < +2908 < +3500$', '$0 < -40 < -200 < +2908 < +3500$'], correct: 1, cols: 1,
            explain: 'السالبة أصغر من الصفر، وبينها الأصغر هو الأبعد عن الصفر: $-200 < -40$ . الأوّل رتّب السالبة حسب مسافاتها، والثالث وضع الصفر قبل السالبة.' },
          { kind: 'solution', ask: 0, lines: ['بين السالبتين الأصغر هو الأبعد عن الصفر: $-200 < -40$ .', '$-200 < -40 < 0 < +2908 < +3500$ .'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — تبليط قاعة القسم',
    context: 'مستطيل في معلم متعامد ومتجانس',
    emoji: '🧱',
    source: SOURCE,
    tone: 'violet',
    visual: {
      range: { xMin: -5, xMax: 6, yMin: -4, yMax: 4 },
      unit: 34,
      points: [{ id: 'E', x: -3, y: 2, name: 'E' }, { id: 'F', x: 4, y: 2, name: 'F' }, { id: 'G', x: 4, y: -3, name: 'G' }],
      frozen: true,
      caption: false,
      ariaLabel: 'معلم متعامد ومتجانس وحدته متر واحد: النقطة E فاصلتها −3 وترتيبها 2، والنقطة F فاصلتها 4 وترتيبها 2، والنقطة G فاصلتها 4 وترتيبها −3',
    },
    statement: 'مخطّط أرضية قسم في معلم متعامد ومتجانس وحدته $1\\,\\mathrm{m}$ : ثلاثة من رؤوسها $E(-3\\,;\\,2)$ و $F(4\\,;\\,2)$ و $G(4\\,;\\,-3)$ ، والرأس الرابع $H$ يجعل $EFGH$ مستطيلًا. تُبلَّط الأرضية ببلاطات مساحة الواحدة $0{,}25\\,\\mathrm{m}^2$ وثمنها $180\\,\\mathrm{DA}$ .',
    data: [
      { id: 'pts', text: 'الرؤوس ⁦E(−3 ; 2)⁩ و ⁦F(4 ; 2)⁩ و ⁦G(4 ; −3)⁩', useful: true },
      { id: 'unit', text: 'وحدة المعلم ⁦1 m⁩', useful: true },
      { id: 'tile', text: 'مساحة البلاطة ⁦0,25 m²⁩ وثمنها ⁦180 DA⁩', useful: true },
      { id: 'paint', text: 'جدران القسم مطليّة بالأبيض', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الرأس الرابع',
        question: 'عيّن إحداثيي النقطة $H$ التي تجعل $EFGH$ مستطيلًا.',
        asks: ['فاصلة H', 'ترتيب H'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['ihdathiyan', 'tartib-ihdathiyayn'], prompt: 'في المستطيل $EFGH$ الضلعان $[EF]$ و $[GH]$ أفقيان والضلعان $[FG]$ و $[HE]$ عموديان. إذن $H$ :',
            options: ['لها فاصلة $E$ وترتيب $G$', 'لها فاصلة $G$ وترتيب $E$', 'لها فاصلة $F$ وترتيب $F$'], correct: 0, cols: 1,
            explain: '$H$ على الرأسي المارّ بـ $E$ (فاصلتها $-3$ ) وعلى الأفقي المارّ بـ $G$ (ترتيبها $-3$ ). الثاني يعطي $F$ ، والثالث يعطي $F$ نفسها.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ihdathiyan-nuqta'], prompt: 'فاصلة $H$ :', expected: -3, explain: 'فاصلة $E$ هي $-3$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ihdathiyan-nuqta'], prompt: 'ترتيب $H$ :', expected: -3, explain: 'ترتيب $G$ هو $-3$ .' },
          { kind: 'solution', ask: 0, lines: ['$H$ لها فاصلة $E$ وترتيب $G$ .', '$H(-3\\,;\\,-3)$ .'] },
        ],
      },
      {
        label: '2)', title: 'طولا المستطيل',
        question: 'احسب الطولين $EF$ و $FG$ بالمتر.',
        asks: ['الطول EF', 'الطول FG'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-masafa'], prompt: '$EF$ : النقطتان في الترتيب نفسه، فنطرح الفاصلتين: $4-(-3)=$', expected: 7, suffix: 'm', explain: 'فاصلتان على جهتين من الصفر: $4+3=7$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qaidat-masafa'], prompt: '$FG$ : النقطتان في الفاصلة نفسها، فنطرح الترتيبين: $2-(-3)=$', expected: 5, suffix: 'm', explain: 'ترتيبان على جهتين من الصفر: $2+3=5$ .' },
          { kind: 'solution', ask: 0, lines: ['$EF=4-(-3)=7\\,\\mathrm{m}$ (الفاصلتان، فالضلع أفقي).', '$FG=2-(-3)=5\\,\\mathrm{m}$ (الترتيبان، فالضلع عمودي).'] },
        ],
      },
      {
        label: '3)', title: 'مساحة الأرضية',
        question: 'ما مساحة الأرضية؟',
        asks: ['مساحة الأرضية'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-masafa'], prompt: 'مساحة المستطيل: $7 \\times 5=$', expected: 35, suffix: 'm²', explain: 'مساحة المستطيل جداء بعديه: $7 \\times 5=35$ متر مربّع.' },
          { kind: 'solution', ask: 0, lines: ['المساحة $EF \\times FG=7 \\times 5$ .', 'المساحة $35\\,\\mathrm{m}^2$ .'] },
        ],
      },
      {
        label: '4)', title: 'عدد البلاطات وثمنها',
        question: 'كم بلاطة يلزم؟ وكم يكلّف التبليط؟',
        asks: ['عدد البلاطات', 'ثمن التبليط'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['qaidat-masafa'], prompt: 'مساحة البلاطة $0{,}25\\,\\mathrm{m}^2$ ، أي ربع المتر المربّع. في المتر المربّع الواحد:',
            options: ['أربع بلاطات لأنّ $0{,}25 \\times 4=1$', 'بلاطتان لأنّ $0{,}25 \\times 2=0{,}5$', 'بلاطة واحدة'], correct: 0, cols: 1,
            explain: 'أربع قطع ربعية تكوّن متر مربّع واحدًا: $4 \\times 0{,}25=1$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-masafa'], prompt: 'عدد البلاطات: $35 \\times 4=$', expected: 140, explain: '$35 \\times 4=140$ بلاطة.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qaidat-masafa'], prompt: 'الثمن: $140 \\times 180=$', expected: 25200, suffix: 'DA', explain: '$140 \\times 180=25200$ دينار.' },
          { kind: 'solution', ask: 0, lines: ['في كلّ متر مربّع أربع بلاطات: $35 \\times 4=140$ .', 'الثمن $140 \\times 180=25200\\,\\mathrm{DA}$ .'] },
        ],
      },
      {
        label: '5)', title: 'مكتب المعلّم',
        question: 'يوجد مكتب المعلّم عند النقطة $K(3{,}5\\,;\\,-2{,}5)$ . هل هو داخل القسم؟',
        asks: ['هل المكتب داخل القسم؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nuqta-ala-mihwar', 'tartib-ihdathiyayn'], prompt: 'القسم يضمّ النقط التي فاصلتها بين $-3$ و $4$ وترتيبها بين $-3$ و $2$ . بالنسبة إلى $K$ :',
            options: ['نعم: $-3 < 3{,}5 < 4$ و $-3 < -2{,}5 < 2$', 'لا: لأنّ الترتيب سالب', 'لا: لأنّ $3{,}5$ أكبر من $3$'], correct: 0, cols: 1,
            explain: 'نقارن كلّ إحداثية بحدّي مجالها: $-3 < 3{,}5 < 4$ و $-3 < -2{,}5 < 2$ ، فالنقطة داخل القسم. الإشارة السالبة وحدها لا تُخرج النقطة، والعدد $3$ ليس حدًّا.' },
          { kind: 'solution', ask: 0, lines: ['الفاصلة: $-3 < 3{,}5 < 4$ ؛ الترتيب: $-3 < -2{,}5 < 2$ .', 'نعم، المكتب داخل القسم.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — مصعد البرج',
    context: 'مجموع جبري لتحرّكات مصعد',
    emoji: '🏢',
    source: SOURCE,
    tone: 'indigo',
    table: { caption: 'ركب سمير المصعد من الطابق $-2$ (الطوابق السالبة تحت الأرض) ثم تحرّك خمس مرات', head: ['', 'الحركة 1', 'الحركة 2', 'الحركة 3', 'الحركة 4', 'الحركة 5'],
      rows: [['التغيّر في الطوابق', '$+9$', '$-4$', '$+6$', '$-12$', '$+3$']] },
    statement: 'ركب سمير مصعد برج من الطابق $-2$ ، وتحرّك المصعد خمس حركات بالترتيب: $+9$ ثمّ $-4$ ثمّ $+6$ ثمّ $-12$ ثمّ $+3$ طابقًا. الطابق $0$ هو الطابق الأرضي والطوابق السالبة تحت الأرض.',
    data: [
      { id: 'start', text: 'نقطة الانطلاق: الطابق ⁦−2⁩', useful: true },
      { id: 'moves', text: 'الحركات: ⁦+9⁩ ؛ ⁦−4⁩ ؛ ⁦+6⁩ ؛ ⁦−12⁩ ؛ ⁦+3⁩', useful: true },
      { id: 'ground', text: 'الطابق 0 هو الطابق الأرضي', useful: true },
      { id: 'name', text: 'اسم البرج «النجمة»', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'طابق الوصول',
        question: 'احسب المجموع الجبري $(-2)+(+9)+(-4)+(+6)+(-12)+(+3)$ ثمّ استنتج طابق وصول سمير.',
        asks: ['المجموع الجبري', 'طابق الوصول'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['tajmi-hudud'], prompt: 'مجموع الموجبة: $(+9)+(+6)+(+3)=$', expected: 18, explain: '$9+6+3=18$ .' },
          { kind: 'numeric', role: 'compute', requires: ['tajmi-hudud'], prompt: 'مجموع السالبة: $(-2)+(-4)+(-12)=$', expected: -18, explain: '$2+4+12=18$ والإشارة سالبة.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-majmu-jabri', 'mutaakisan-sifr'], prompt: 'المجموع الجبري: $(+18)+(-18)=$', expected: 0, explain: 'العددان متعاكسان فمجموعهما $0$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['faasila'], prompt: 'المجموع الجبري $0$ يعني أنّ سمير وصل إلى:',
            options: ['الطابق $0$ ، أي الطابق الأرضي', 'الطابق $-2$ ، أي حيث بدأ', 'الطابق $18$'], correct: 0, cols: 1,
            explain: 'المجموع الجبري يشمل الطابق الأوّل $-2$ وكلّ الحركات، فنتيجته هي طابق الوصول: $0$ .' },
          { kind: 'solution', ask: 0, lines: ['الموجبة $+18$ والسالبة $-18$ ، ومجموعهما $0$ .', 'وصل سمير إلى الطابق الأرضي $0$ .'] },
        ],
      },
      {
        label: '2)', title: 'الطوابق التي مرّ بها',
        question: 'ما الطابق الذي بلغه سمير بعد كلّ حركة؟',
        asks: ['الطوابق بعد الحركات'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['jam-ishara-mukhtalifa'], prompt: 'بعد الحركة الأولى: $(-2)+(+9)=$', expected: 7, explain: '$9-2=7$ والأبعد عن الصفر موجب.' },
          { kind: 'numeric', role: 'compute', requires: ['jam-ishara-mukhtalifa'], prompt: 'بعد الثانية: $(+7)+(-4)=$', expected: 3, explain: '$7-4=3$ .' },
          { kind: 'numeric', role: 'compute', requires: ['jam-nafs-ishara'], prompt: 'بعد الثالثة: $(+3)+(+6)=$', expected: 9, explain: '$3+6=9$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jam-ishara-mukhtalifa'], prompt: 'بعد الرابعة: $(+9)+(-12)=$', expected: -3, explain: '$12-9=3$ والأبعد عن الصفر سالب: $-3$ . وبعد الخامسة $(-3)+(+3)=0$ .' },
          { kind: 'solution', ask: 0, lines: ['الطوابق المتتالية: $7$ ثمّ $3$ ثمّ $9$ ثمّ $-3$ ثمّ $0$ .', 'بلغ الطابق $-3$ بعد الحركة الرابعة تحت الأرض.'] },
        ],
      },
      {
        label: '3)', title: 'أعلى وأدنى طابق',
        question: 'ما أعلى طابق بلغه سمير؟ وما أدنى طابق؟',
        asks: ['أعلى طابق', 'أدنى طابق'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['salibayn', 'mujabayn'], prompt: 'الطوابق $-2$ و $7$ و $3$ و $9$ و $-3$ و $0$ : أعلاها', expected: 9, explain: 'أكبر عدد في القائمة هو $9$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['salibayn', 'mukhtalifayn'], prompt: 'وأدناها (أصغر عدد)', expected: -3, explain: 'بين السالبة $-2$ و $-3$ الأصغر هو الأبعد عن الصفر: $-3$ .' },
          { kind: 'solution', ask: 0, lines: ['أعلى طابق $9$ .', 'أدنى طابق $-3$ ، لأنّ $-3 < -2 < 0$ .'] },
        ],
      },
      {
        label: '4)', title: 'الفرق بين الطابقين',
        question: 'كم طابقًا بين أعلى طابق وأدنى طابق؟',
        asks: ['عدد الطوابق بينهما'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-masafa'], prompt: '$(+9)-(-3)=$', expected: 12, explain: 'الطابقان على جهتين من الصفر: المسافة $9+3=12$ طابقًا.' },
          { kind: 'solution', ask: 0, lines: ['المسافة بين طابقين: الأكبر ناقص الأصغر.', '$(+9)-(-3)=12$ طابقًا.'] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — ورقة إجابات سليم',
    context: 'أحكم على حسابات زميل وأصحّحها',
    emoji: '📝',
    source: SOURCE,
    tone: 'rose',
    illustration: { kind: 'scene', icon: 'pen', bg: 'rose', chips: [{ label: 'عدد الإجابات', value: 5, tone: 'rose' }, { label: 'نقطة لكل إجابة صحيحة', value: 1, tone: 'green' }], ariaLabel: 'ورقة سليم: خمس إجابات تُمنح نقطة عن كل إجابة صحيحة' },
    statement: 'قدّم سليم ورقة بخمس إجابات: (a) $(-5)+(-3)=(+8)$ ، (b) $(-4)-(-9)=(+5)$ ، (c) $-2{,}7 > -2{,}07$ ، (d) المسافة بين $A(-6)$ و $B(-1)$ هي $7$ ، (e) نظيرة $M(-3\\,;\\,2)$ بالنسبة إلى محور الفواصل هي $(-3\\,;\\,-2)$ . يمنح الأستاذ نقطة عن كل إجابة صحيحة.',
    data: [
      { id: 'a', text: 'الإجابات الخمس (a) إلى (e)', useful: true },
      { id: 'mark', text: 'نقطة عن كل إجابة صحيحة', useful: true },
      { id: 'who', text: 'سليم تلميذ في القسم نفسه', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'صحيح أم خاطئ؟',
        question: 'احكم على كل إجابة من الإجابات الخمس.',
        asks: ['الحكم على الإجابات الخمس'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['jam-nafs-ishara', 'tarh-bi-muakis', 'salibayn', 'qaidat-masafa', 'nadhira-mihwar'], prompt: 'اختر الحكم:',
            rows: [
              { label: '$(-5)+(-3)=(+8)$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'عددان سالبان: نجمع المسافتين $5+3=8$ ونحتفظ بالإشارة السالبة، فالمجموع $-8$ .' },
              { label: '$(-4)-(-9)=(+5)$', options: ['صحيح', 'خطأ'], correct: 0, correction: '$(-4)+(+9)=+5$ لأنّ الأبعد عن الصفر موجب.' },
              { label: '$-2{,}7 > -2{,}07$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'العددان سالبان: الأبعد عن الصفر هو $-2{,}7$ فهو الأصغر، ولذلك $-2{,}7 < -2{,}07$ .' },
              { label: 'المسافة بين $A(-6)$ و $B(-1)$ هي $7$', options: ['صحيح', 'خطأ'], correct: 1, correction: 'النقطتان في جهة واحدة من المبدأ: $AB=(-1)-(-6)=5$ ، لا $6+1$ .' },
              { label: 'نظيرة $M(-3\\,;\\,2)$ بالنسبة إلى محور الفواصل هي $(-3\\,;\\,-2)$', options: ['صحيح', 'خطأ'], correct: 0, correction: 'النظير بالنسبة إلى محور الفواصل يبقي الفاصلة ويعاكس الترتيب: $(-3\\,;\\,-2)$ .' },
            ] },
          { kind: 'solution', ask: 0, lines: ['(a) خطأ، (b) صحيح، (c) خطأ، (d) خطأ، (e) صحيح.', 'نتحقّق من كل واحدة بقاعدتها: إشارة المجموع، والطرح بمعاكس، وترتيب السالبة، والمسافة بين نقطتين، ونظير نقطة.'] },
        ],
      },
      {
        label: '2)', title: 'تصحيح الخاطئة',
        question: 'ما القيمة الصحيحة في (a)؟ وما المسافة الصحيحة في (d)؟ وما المقارنة الصحيحة في (c)؟',
        asks: ['القيمة الصحيحة في (a)', 'المسافة الصحيحة في (d)', 'المقارنة الصحيحة في (c)'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jam-nafs-ishara'], prompt: '$(-5)+(-3)=$', expected: -8, explain: 'نجمع المسافتين ونحتفظ بالإشارة: $-8$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qaidat-masafa'], prompt: 'المسافة بين $A(-6)$ و $B(-1)$ : $(-1)-(-6)=$', expected: 5, explain: 'الأكبر ناقص الأصغر: $-1+6=5$ .' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['salibayn'], prompt: 'بين $-2{,}7$ و $-2{,}07$ :',
            options: ['$-2{,}7 < -2{,}07$', '$-2{,}7 > -2{,}07$', '$-2{,}7 = -2{,}07$'], correct: 0, cols: 3,
            explain: 'المسافتان إلى الصفر $2{,}7$ و $2{,}07$ ، والأكبر مسافة هو الأصغر عددًا بين السالبين.' },
          { kind: 'solution', ask: 0, lines: ['(a) $(-5)+(-3)=-8$ ، و (d) $AB=(-1)-(-6)=5$ .', '(c) $-2{,}7 < -2{,}07$ .'] },
        ],
      },
      {
        label: '3)', title: 'نقطة سليم',
        question: 'ما نقطة سليم من 5؟',
        asks: ['نقطة سليم'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jam-nafs-ishara'], prompt: 'عدد إجاباته الصحيحة، وهي (b) و (e):', expected: 2, explain: 'نقطة عن كل إجابة صحيحة، والصحيحتان (b) و (e): $2$ من $5$ .' },
          { kind: 'solution', ask: 0, lines: ['الإجابتان (b) و (e) صحيحتان.', 'نقطة سليم: $2$ من $5$ .'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
