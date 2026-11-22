import MathText from '../../../../../common/components/MathText';
import { KNOW, ACT5_ANSWERS, ACTIVITY_6, METHOD_PERCENT, METHOD_COMPOUND, TAHWIL, BIDALALA } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس 4 « تطبيقات التناسبية (النسب المئوية والمقادير المركبة) » — SOURCE
 * UNIQUE. Une <KnowledgeBrick id="…"> dans un module et la carte rendent le même objet.
 *
 *   module 1 (نشاط 5)   nisba-akhdh — prendre t % (les filles du collège) ;
 *                       takhfid-darb — diminuer de t % (la consommation) ;
 *                       ziyada-darb — augmenter de t % (1200 → 1260) ;
 *                       dala-murfaqa — la fonction linéaire associée (y = 1,05x) ;
 *   module 2 (نشاط 6)   miqdar-qisma — grandeur quotient (vitesse, débit, masse volumique) ;
 *                       tahwil-murakkab — convertir une grandeur composée ;
 *   module 3 (معارف)    tatabu-darb — changements successifs (le réservoir, طرائق) ;
 *                       miqdar-jida — grandeur produit (aire, énergie) ;
 *                       miqdar-bidalala — une grandeur donnée en fonction d'une autre (P3).
 * Les `summary` sont du texte simple (carte, مذكرة) : les formules restent dans `body`.
 */
const M = ({ children }) => <MathText>{children}</MathText>;

/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'nisba-akhdh', type: 'concepts', title: 'أخذ نسبة مئوية من مقدار',
        memo: {
          rule: `x\\times\\dfrac{${R('t')}}{100}`,
          hook: 'النسبة تُضرب في المقدار',
          example: `95\\times\\dfrac{${R('40')}}{100}=38`,
          trap: 'لا نضرب في عدد النسبة وحده بل في النسبة على مئة',
          exam: 'اكتب العملية بالمقدار ثم احسب الناتج',
          chip: `\\tfrac{${R('t')}}{100}\\times x`,
          quiz: [
            { q: '$30\\%$ من $250$DA تساوي:', options: ['$75$', '$280$', '$7{,}5$'], correct: 0 },
            { q: 'النسبة المئوية لـ $20$ تلميذًا من $80$ هي:', options: ['$25\\%$', '$20\\%$', '$4\\%$'], correct: 0 },
          ],
        },
        predictPrompt: 'في الجدول: 40% من 95 تلميذًا في السنة الثانية بنات، فعددهنّ 38؛ ثم قارنت 205 بنتًا بـ 375 تلميذًا. اكتب القاعدتين بكلماتك: كيف تحسب $t\\%$ من مقدار $x$ ؟ وكيف تحسب النسبة المئوية لجزء من كلّ؟',
        summary: 'أخذ t بالمئة من مقدار x يعني ضرب x في t على 100. والنسبة المئوية لجزء من كلّ هي حاصل قسمة الجزء على الكلّ مضروبًا في 100.',
        body: (
          <div className="space-y-1">
            <p><M>{`${KNOW.percentTable[0].case} ${KNOW.percentTable[0].means} : ${KNOW.percentTable[0].fn}`}</M></p>
            <p className="text-sm text-slate-600"><M>{ACT5_ANSWERS.girlsPercent}</M></p>
          </div>
        ),
      },
      {
        id: 'takhfid-darb', type: 'regles', title: 'التخفيض بنسبة مئوية',
        memo: {
          rule: `x\\times\\left(1-\\dfrac{${R('t')}}{100}\\right)`,
          hook: 'التخفيض ضرب في عدد أصغر من واحد',
          example: `1000\\times\\left(1-\\dfrac{${R('20')}}{100}\\right)=800`,
          trap: 'لا نطرح عدد النسبة من السعر مباشرة',
          exam: 'اكتب المضاعف أولًا ثم اضرب',
          chip: `1-\\tfrac{${R('t')}}{100}`,
          quiz: [
            { q: 'تخفيض $25\\%$ على سعر $80$DA يعطي:', options: ['$60$', '$55$', '$20$'], correct: 0 },
            { q: 'مضاعف التخفيض بـ $30\\%$ هو:', options: ['$0{,}7$', '$0{,}3$', '$1{,}3$'], correct: 0 },
          ],
        },
        predictPrompt: 'انخفض الاستهلاك من $6{,}7L$ إلى $6{,}1L$ ، أي بحوالي $8{,}96\\%$ . لو انخفض مقدار $x$ بنسبة $t\\%$ ، كيف تحسب المقدار الجديد مباشرة، بعملية واحدة؟ اكتب القاعدة بدلالة $x$ و $t$ .',
        summary: 'تخفيض مقدار x بنسبة t بالمئة يعني ضربه في 1 ناقص t على 100: نضرب ولا نطرح العدد t.',
        body: (
          <div className="space-y-1">
            <p><M>{`${KNOW.percentTable[2].case} ${KNOW.percentTable[2].means} : ${KNOW.percentTable[2].fn}`}</M></p>
            <p className="text-sm text-slate-600"><M>{ACT5_ANSWERS.fuel}</M></p>
          </div>
        ),
      },
      {
        id: 'ziyada-darb', type: 'regles', title: 'الزيادة بنسبة مئوية',
        memo: {
          rule: `x\\times\\left(1+\\dfrac{${R('t')}}{100}\\right)`,
          hook: 'الزيادة ضرب في عدد أكبر من واحد',
          example: `1200\\times${R('1{,}05')}=1260`,
          trap: 'إضافة عدد النسبة وحده إلى السعر خطأ',
          exam: 'اكتب المضاعف أولًا ثم اضرب',
          chip: `1+\\tfrac{${R('t')}}{100}`,
          quiz: [
            { q: 'زيادة $5\\%$ على $1200$DA تعطي:', options: ['$1260$', '$1205$', '$1206$'], correct: 0 },
            { q: 'مضاعف الزيادة بـ $15\\%$ هو:', options: ['$1{,}15$', '$0{,}15$', '$1{,}015$'], correct: 0 },
          ],
        },
        predictPrompt: 'على بطاقة السعر: 1200 دج بعد زيادة 5% صارت 1260 دج، أمّا «إضافة 5» فأعطت 1205 دج فقط. كيف تحسب مباشرة، بعملية واحدة، سعرًا $x$ بعد زيادته بـ $t\\%$ ؟ اكتب القاعدة بدلالة $x$ و $t$ .',
        summary: 'زيادة مقدار x بنسبة t بالمئة تعني ضربه في 1 زائد t على 100: نضرب ولا نضيف العدد t.',
        body: (
          <div className="space-y-1">
            <p><M>{`${KNOW.percentTable[1].case} ${KNOW.percentTable[1].means} : ${KNOW.percentTable[1].fn}`}</M></p>
            <p className="text-sm text-slate-600"><M>{ACT5_ANSWERS.price}</M></p>
          </div>
        ),
      },
      {
        id: 'dala-murfaqa', type: 'concepts', title: 'الدالة الخطية المرفقة',
        memo: {
          rule: `y=${R('k')}x`,
          hook: 'مضاعف واحد لكل المقادير',
          example: `y=${R('1{,}05')}x`,
          trap: 'لا تظن أن الفرق بين السعرين هو الثابت',
          exam: 'اذكر أن حاصل القسمة ثابت فهي دالة خطية',
          chip: `x\\mapsto ${R('k')}x`,
          quiz: [
            { q: 'الدالة الخطية المرفقة بزيادة $20\\%$ هي:', options: ['$x \\mapsto 1{,}2x$', '$x \\mapsto 0{,}2x$', '$x \\mapsto x+20$'], correct: 0 },
            { q: 'في جدول زيادة $5\\%$ حاصل قسمة $y$ على $x$ هو:', options: ['$1{,}05$ في كل الأعمدة', '$5$ في كل الأعمدة', 'يختلف من عمود إلى آخر'], correct: 0 },
          ],
        },
        predictPrompt: 'في جدولك طبّقت الزيادة 5% نفسها على قطع مختلفة وقسمت $y$ على $x$ . ماذا تلاحظ في العمود الأخير؟ لو كانت الزيادة $t\\%$ بدل 5%، ماذا تستنتج عن العلاقة بين السعر بعد الزيادة والسعر قبلها؟ أيّ نوع من الدوال يربطهما، وما معاملها؟',
        summary: 'المقدار بعد زيادة أو تخفيض بنسبة ثابتة يتناسب مع المقدار قبلها: المضاعف نفسه لكل المقادير، فهو دالة خطية معاملها هذا المضاعف.',
        body: (
          <div className="space-y-1">
            <p><M>{ACT5_ANSWERS.fn}</M></p>
            <p className="text-sm text-slate-600"><M>{KNOW.percentExamples[2]}</M></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'miqdar-qisma', type: 'concepts', title: 'مقدار حاصل القسمة',
        memo: {
          rule: `v=\\dfrac{${R('d')}}{${R('t')}}`,
          hook: 'القسمة تصنع مقدارًا جديدًا',
          example: `\\dfrac{42}{1{,}5}=${R('28')}\\,\\text{km/h}`,
          trap: 'لا تهمل الوحدة المركبة بعد القسمة',
          exam: 'اكتب الوحدة المركبة مع الناتج',
          chip: `\\tfrac{${R('d')}}{${R('t')}}`,
          quiz: [
            { q: 'قطع قطار $240$ كلم في $3$ ساعات. سرعته المتوسطة:', options: ['80 كلم/سا', '720 كلم/سا', '0,0125 كلم/سا'], correct: 0 },
            { q: 'حاصل قسمة الكتلة على الحجم مقدار يسمى:', options: ['الكتلة الحجمية', 'السرعة', 'التدفق'], correct: 0 },
          ],
        },
        predictPrompt: 'السرعة $25m/s$ تعني 25 مترًا في كل ثانية، وحوّلتها إلى $90km/h$ لتقارنها باللافتة. كيف تحسب السرعة المتوسطة من مسافة ومدة؟ اكتب القاعدة، ثم اذكر مقدارًا آخر يُحسب بالطريقة نفسها من مقدارين.',
        summary: 'عندما نحسب حاصل قسمة مقدارين نتحصل على مقدار حاصل القسمة: السرعة المتوسطة (المسافة على المدة)، التدفق (الحجم على المدة)، الكتلة الحجمية (الكتلة على الحجم).',
        body: (
          <div className="space-y-1">
            <p><M>{KNOW.quotientQuantity}</M></p>
            <p className="text-sm"><M>{KNOW.quotientExamples[0]}</M></p>
            <p className="text-sm"><M>{KNOW.quotientExamples[1]}</M></p>
            <p className="text-sm text-slate-600"><M>{ACTIVITY_6.answers.flow}</M></p>
          </div>
        ),
      },
      {
        id: 'tahwil-murakkab', type: 'methodes', title: 'تحويل وحدة مقدار مركّب',
        memo: {
          rule: `1\\,\\text{m/s}=${R('3{,}6')}\\,\\text{km/h}`,
          hook: 'حوّل البسط ثم حوّل المقام',
          example: `25\\,\\text{m/s}=${R('90')}\\,\\text{km/h}`,
          trap: 'لا تحوّل وحدة واحدة وتنسى الأخرى',
          exam: 'اكتب تحويل البسط وتحويل المقام في سطرين',
          chip: `\\tfrac{\\text{m}}{\\text{s}}\\to\\tfrac{\\text{km}}{\\text{h}}`,
          quiz: [
            { q: '$18\\,\\text{km/h}$ بالمتر في الثانية:', options: ['$5$', '$64{,}8$', '$0{,}3$'], correct: 0 },
            { q: '$2\\,\\text{L/s}$ بالمتر المكعب في الساعة:', options: ['$7{,}2$', '$2000$', '$0{,}002$'], correct: 0 },
          ],
        },
        predictPrompt: 'لتكتب $7\\,200\\,000L$ في الساعة بالمتر المكعب في الثانية: ماذا فعلت بوحدة الحجم؟ وماذا فعلت بوحدة الزمن؟ اكتب الطريقة لتحويل وحدة أيّ مقدار مركّب.',
        summary: 'لتحويل وحدة مقدار مركّب نحوّل وحدة البسط ووحدة المقام كلًّا على حدة، ثم نحسب حاصل القسمة من جديد.',
        body: (
          <div className="space-y-1">
            <p><M>{TAHWIL.text}</M></p>
            <p className="text-sm text-slate-600"><M>{TAHWIL.rule}</M></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tatabu-darb', type: 'methodes', title: 'تغيّرات مئوية متتابعة',
        memo: {
          rule: `x\\times${R('k_1')}\\times${R('k_2')}`,
          hook: 'اضرب المضاعفات ولا تجمع النسب',
          example: `30\\times${R('0{,}7')}\\times${R('1{,}15')}=24{,}15`,
          trap: 'تخفيض ثم زيادة بالنسبة نفسها لا يعيد المقدار',
          exam: 'اكتب كل مضاعف ثم جداءها',
          chip: `k_1\\times k_2`,
          quiz: [
            { q: 'تخفيض $20\\%$ ثم زيادة $20\\%$ على $1000$DA يعطي:', options: ['$960$', '$1000$', '$1040$'], correct: 0 },
            { q: 'مضاعف زيادة $10\\%$ ثم زيادة $10\\%$ هو:', options: ['$1{,}21$', '$1{,}2$', '$1{,}1$'], correct: 0 },
          ],
        },
        predictPrompt: 'في الخزان: تفريغ 30% ثم إضافة 15% ممّا بقي أعطيا $24{,}15m^3$ ، وفي الحذاء: تخفيض 20% ثم زيادة 20% أعطيا 960 دج لا 1000 دج. لو تغيّر مقدار $x$ بنسبتين متتابعتين، كيف تحسب المقدار في النهاية مباشرة؟ اكتب الطريقة.',
        summary: 'تغيّران متتابعان بنسبتين مئويتين يعنيان الضرب في جداء المضاعفين: النسب المتتابعة لا تُجمع.',
        body: (
          <div className="space-y-1">
            <p><M>{METHOD_PERCENT.method}</M></p>
            <p className="text-sm text-slate-600"><M>{METHOD_PERCENT.solution[2]}</M></p>
          </div>
        ),
      },
      {
        id: 'miqdar-jida', type: 'concepts', title: 'مقدار جداء',
        memo: {
          rule: `A=${R('L')}\\times${R('\\ell')}`,
          hook: 'الضرب يصنع مقدار جداء',
          example: `A=7\\times4=28\\,\\text{m}^2`,
          trap: 'وحدة الناتج تجمع وحدتي العاملين',
          exam: 'اكتب الوحدة المركبة مع الناتج',
          chip: `E=${R('P')}\\times${R('t')}`,
          quiz: [
            { q: 'استطاعة $2$ كيلوواط مدة $3$ ساعات تعطي طاقة:', options: ['6 كيلوواط ساعي', '5 كيلوواط ساعي', '1,5 كيلوواط ساعي'], correct: 0 },
            { q: 'مساحة مستطيل طوله $7$ م وعرضه $4$ م:', options: ['28 م²', '11 م²', '28 م'], correct: 0 },
          ],
        },
        summary: 'عندما نحسب جداء مقدارين نتحصل على مقدار جداء: مساحة المستطيل (الطول في العرض)، الطاقة الكهربائية (الاستطاعة في المدة).',
        body: (
          <div className="space-y-1">
            <p><M>{KNOW.productQuantity}</M></p>
            {KNOW.productExamples.map((e) => <p key={e} className="text-sm"><M>{e}</M></p>)}
          </div>
        ),
      },
      {
        id: 'miqdar-bidalala', type: 'memoriser', title: 'مقدار بدلالة مقدار آخر',
        memo: {
          rule: `d=${R('v')}\\times t`,
          hook: 'المقدار الثابت هو معامل الدالة',
          example: `d=${R('28')}\\times t`,
          trap: 'لا يصح الضرب إذا لم يكن المقدار المركب ثابتًا',
          exam: 'اكتب المقدار بدلالة الآخر ثم عوّض',
          chip: `d=${R('v')}\\times t`,
          quiz: [
            { q: 'سرعة ثابتة $28$ كلم/سا. المسافة في ساعتين:', options: ['$56$', '$30$', '$14$'], correct: 0 },
            { q: 'كتلة حجمية ثابتة $2$ غ/سم³ . كتلة $5$ سم³:', options: ['$10$', '$2{,}5$', '$7$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المعارف: دراجة قطعت $42km$ في $1{,}5h$ ، فسرعتها المتوسطة $28km/h$ . إذا بقيت سرعتها ثابتة، جرّب: كم تقطع في $1h$ ؟ في $2h$ ؟ في $3h$ ؟ اكتب المسافة $d$ بدلالة المدة $t$ ، ثم اكتب ما تستنتجه عندما يكون المقدار المركّب ثابتًا.',
        summary: 'عندما يكون المقدار المركّب ثابتًا يُعطى مقدار بدلالة مقدار آخر بالضرب في هذا الثابت: المسافة بدلالة المدة، الكتلة بدلالة الحجم، الطاقة بدلالة المدة — دالة خطية.',
        body: (
          <div className="space-y-1">
            <p><M>{BIDALALA.text}</M></p>
            <p className="text-sm text-slate-600"><M>{BIDALALA.example}</M></p>
            <p className="text-sm text-slate-600"><M>{METHOD_COMPOUND.method}</M></p>
          </div>
        ),
      },
    ],
  },
};
