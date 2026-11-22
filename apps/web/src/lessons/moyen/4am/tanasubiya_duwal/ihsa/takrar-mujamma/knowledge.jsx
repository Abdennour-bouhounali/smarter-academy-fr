import MathText from '../../../../../common/components/MathText';
import { SourceTag } from '../../../../../common/textbook';
import { ACTIVITY, KNOWLEDGE, PROPERTY, METHOD_VALUES, METHOD_CLASSES } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس 1 « التكرار المجمع والتواتر المجمع (الصاعد والنازل) » — SOURCE UNIQUE.
 *
 *   module 1 (نشاط 1)  mujamma-nashat — les deux phrases du manuel qui nomment (sous les tableaux 4 et 5) ;
 *   module 2 (معارف)   takrar-mujamma (معارف 1), tawatur-mujamma (معارف 2 + « التواتر »),
 *                      khasiyat-mujamma (les deux bouts des colonnes et up + down = N + f — plateforme, déclaré) ;
 *   module 3 (طرائق)   hisab-mujamma (la طريقة pour une valeur), tawatur-fiat (la طريقة pour une فئة).
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'mujamma-nashat', type: 'concepts', title: 'الصاعد والنازل الموافقان لقيمة',
        memo: {
          rule: `x${R('\\le')}t\\;\\to\\;\\uparrow\\quad x${R('\\ge')}t\\;\\to\\;\\downarrow`,
          hook: 'أصغر أو يساوي صاعد',
          example: `\\uparrow(159)=3+4+5=${R('12')}\\;,\\;\\downarrow(159)=5+5+3=${R('13')}`,
          trap: 'نسيان من قامتهم تساوي القيمة نفسها',
          exam: 'اكتب الشرط ثم اجمع التكرارات',
          chip: `${R('\\le')}t\\;\\uparrow`,
          quiz: [
            { q: 'تكرارات القيم $154,157,159,160,165$ هي $3,4,5,5,3$. عدد القيم $\\le 159$ هو:', options: ['$12$', '$7$', '$13$'], correct: 0 },
            { q: 'عدد القيم $\\ge 159$ في الجدول نفسه هو:', options: ['$8$', '$12$', '$13$'], correct: 2 },
          ],
        },
        predictPrompt: 'في جدولَي السؤالين 4 و 5 كتبت تحت كل قامة $t$ عددين: الأول يكبر من اليسار إلى اليمين (3 ، 7 ، 12 ، 17 ، 20) والثاني يصغر (20 ، 17 ، 13 ، 8 ، 3). اشرح بكلماتك لماذا يكبر الأول ويصغر الثاني حين تكبر $t$ (وهل يُعدّ التلميذ الذي قامته $t$ بالضبط؟)، ثم اقترح اسمًا لكل منهما.',
        summary: 'عدد التلاميذ الذين قاماتهم أصغر من أو تساوي t يسمى التكرار المجمع الصاعد الموافق للقيمة t، وعدد الذين قاماتهم أكبر من أو تساوي t يسمى التكرار المجمع النازل الموافق لها.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{ACTIVITY.namingUp}</MathText></p>
            <p><MathText>{ACTIVITY.namingDown}</MathText></p>
            <SourceTag source={ACTIVITY.source} />
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'takrar-mujamma', type: 'concepts', title: 'التكرار المجمع',
        memo: {
          rule: `\\uparrow(v)=f(v)+${R('\\textstyle\\sum_{u<v}f(u)')}`,
          hook: 'أضف ما قبلها',
          example: `\\uparrow(157)=4+${R('3')}=7`,
          trap: 'جمع كل التكرارات بدل ما قبل القيمة',
          exam: 'اكتب الجمع كاملا قبل النتيجة',
          chip: `f(v)+${R('\\sum f')}`,
          quiz: [
            { q: 'تكرارات $154,157,159,160,165$ هي $3,4,5,5,3$. الصاعد للقيمة $160$ هو:', options: ['$5$', '$12$', '$17$'], correct: 2 },
            { q: 'النازل للقيمة $160$ في الجدول نفسه هو:', options: ['$13$', '$8$', '$3$'], correct: 1 },
          ],
        },
        predictPrompt: 'في جدول القامات (التكرارات 3 ، 4 ، 5 ، 5 ، 3 للقامات 154 ، 157 ، 159 ، 160 ، 165) وجدت عند البوابة 12 تلميذًا قامتهم 159cm على الأكثر. كيف تحصل على هذا العدد من سطر التكرارات دون أن تعدّ التلاميذ واحدًا واحدًا؟ وكيف تحصل على عدد الذين قامتهم 159cm على الأقل؟ اكتب القاعدة بكلماتك لأيّ قيمة.',
        summary: 'التكرار المجمع الصاعد لقيمة هو مجموع تكرارها وتكرارات القيم الأصغر منها، والنازل هو مجموع تكرارها وتكرارات القيم الأكبر منها.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOWLEDGE.cumul.up}</MathText></p>
            <p><MathText>{KNOWLEDGE.cumul.down}</MathText></p>
            <SourceTag source={KNOWLEDGE.cumul.source} />
          </div>
        ),
      },
      {
        id: 'tawatur-mujamma', type: 'concepts', title: 'التواتر المجمع',
        memo: {
          rule: `\\dfrac{\\uparrow(v)}{${R('N')}}`,
          hook: 'اقسم على المجموع الكلي',
          example: `\\dfrac{12}{${R('20')}}=0{,}6`,
          trap: 'القسمة على آخر تكرار لا على التكرار الكلي',
          exam: 'اكتب الكسر ثم حوّله إلى عدد عشري',
          chip: `\\tfrac{\\uparrow}{N}`,
          quiz: [
            { q: 'الصاعد للقيمة $159$ هو $12$ والتكرار الكلي $20$. التواتر المجمع الصاعد:', options: ['$\\frac{5}{3}$', '$\\frac{12}{100}$', '$\\frac{3}{5}$'], correct: 2 },
            { q: 'تواتر مجمع صاعد $0{,}85$ من $40$ قيمة يوافق تكرارا مجمعا يساوي:', options: ['$8{,}5$', '$34$', '$47$'], correct: 1 },
          ],
        },
        summary: 'التكرار النسبي المجمع الصاعد (أو النازل) لقيمة هو مجموع التكرار النسبي لها والتكرارات النسبية للقيم الأصغر (أو الأكبر) منها؛ ونسميه أيضا التواتر المجمع الصاعد (أو النازل).',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOWLEDGE.relative.up}</MathText></p>
            <p><MathText>{KNOWLEDGE.relative.down}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.relative.note}</MathText></p>
            <SourceTag source={KNOWLEDGE.relative.source} />
          </div>
        ),
      },
      {
        id: 'khasiyat-mujamma', type: 'regles', title: 'طرفا جدول التكرارات المجمعة',
        memo: {
          rule: `\\uparrow(v)+\\downarrow(v)=N+${R('f(v)')}`,
          hook: 'القيمة تُعدّ مرتين',
          example: `12+13=20+${R('5')}`,
          trap: 'ظنّ المجموع يساوي التكرار الكلي',
          exam: 'تحقق أن الطرف الأخير يساوي التكرار الكلي',
          chip: `N+${R('f')}`,
          quiz: [
            { q: 'الصاعد للقيمة $160$ هو $17$ والنازل لها $8$ والتكرار الكلي $20$. تكرار القيمة $160$:', options: ['$25$', '$3$', '$5$'], correct: 2 },
            { q: 'الصاعد لأكبر قيمة في سلسلة تكرارها الكلي $35$ هو:', options: ['$35$', '$1$', '$34$'], correct: 0 },
          ],
        },
        summary: 'الصاعد لأكبر قيمة والنازل لأصغر قيمة يساويان التكرار الكلي، فالتواتر المجمع الأخير يساوي 1؛ ومن أجل قيمة واحدة: الصاعد زائد النازل يساوي التكرار الكلي زائد تكرار هذه القيمة.',
        body: (
          <div className="space-y-1.5">
            {PROPERTY.lines.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <SourceTag source={PROPERTY.source} />
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'hisab-mujamma', type: 'methodes', title: 'حساب التكرار المجمع لقيمة',
        memo: {
          rule: `\\uparrow(v)=f(v_1)+\\dots+f(${R('v')})`,
          hook: 'رتّب ثم اجمع',
          example: `\\uparrow(159)=3+4+5=${R('12')}`,
          trap: 'جمع القيم بدل جمع تكراراتها',
          exam: 'رتّب القيم في جدول قبل أي جمع',
          chip: `\\sum f`,
          quiz: [
            { q: 'القيم $2,4,6$ بتكرارات $5,3,2$. الصاعد للقيمة $4$ هو:', options: ['$6$', '$8$', '$5$'], correct: 1 },
            { q: 'النازل للقيمة $4$ في الجدول نفسه هو:', options: ['$8$', '$2$', '$5$'], correct: 2 },
          ],
        },
        predictPrompt: 'في تمرين الزلازل كانت القيم السبع عشرة غير مرتّبة، وكشفت كيف ملأ الكتاب سطري الصاعد والنازل. لو أعطيناك سلسلة أخرى غير مرتّبة: بأيّ خطوة تبدأ؟ ثم كيف تحسب الصاعد والنازل لكل قيمة؟ اكتب الطريقة بكلماتك.',
        summary: 'نرتّب القيم في جدول تكراري ترتيبا تصاعديا، ثم نجمع تكرار القيمة وتكرارات القيم الأصغر منها (للصاعد) أو الأكبر منها (للنازل).',
        body: (
          <div className="space-y-1.5">
            {METHOD_VALUES.rule.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <SourceTag source={METHOD_VALUES.source} />
          </div>
        ),
      },
      {
        id: 'tawatur-fiat', type: 'methodes', title: 'التواتر المجمع لفئة',
        memo: {
          rule: `\\dfrac{f_1+\\dots+f_i}{${R('N')}}`,
          hook: 'اجمع ثم اقسم',
          example: `\\dfrac{4+6}{${R('20')}}=0{,}5`,
          trap: 'قسمة تكرار الفئة وحده دون تجميع ما سبقها',
          exam: 'اكتب التواتر عشريا وتحقق من آخر قيمة',
          chip: `\\tfrac{\\sum f}{N}`,
          quiz: [
            { q: 'فئات تكراراتها $4,6,10$ (التكرار الكلي $20$). التواتر المجمع الصاعد للفئة الثانية:', options: ['$0{,}3$', '$0{,}2$', '$0{,}5$'], correct: 2 },
            { q: 'التواتر المجمع النازل للفئة الثانية في الجدول نفسه:', options: ['$0{,}5$', '$0{,}8$', '$0{,}3$'], correct: 1 },
          ],
        },
        predictPrompt: 'في أعمار العمال كانت المعطيات فئات وتكرارها الكلي 200، ورأيت الكتاب يصل إلى $0{,}25$ ثم $0{,}45$ للفئتين الثانية والثالثة. لو أعطيناك فئات أخرى بتكراراتها: بأيّ خطوات تحسب التواتر المجمع الصاعد لفئة؟ وبماذا يختلف حساب النازل؟',
        summary: 'نقسم تكرار كل فئة على التكرار الكلي، ثم نجمع تواتر الفئة وتواترات الفئات التي تسبقها (للصاعد) أو التي تليها (للنازل).',
        body: (
          <div className="space-y-1.5">
            {METHOD_CLASSES.rule.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <SourceTag source={METHOD_CLASSES.source} />
          </div>
        ),
      },
    ],
  },
};
