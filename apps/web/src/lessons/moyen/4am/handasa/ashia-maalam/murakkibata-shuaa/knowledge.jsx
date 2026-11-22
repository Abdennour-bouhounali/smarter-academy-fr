import MathText from '../../../../../common/components/MathText';
import { SourceTag } from '../../../../../common/textbook';
import { ACTIVITY, KNOW1, KNOW2, KNOW3, KNOW_ORIGIN, METHOD_DRAW } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « قراءة مركبتي شعاع وتمثيلهما في معلم » — SOURCE UNIQUE.
 *
 *   module 1 (نشاط 1)   murakkibatan — 8 et −2 sont les مركبتان de AB (le texte du نشاط 1 (3)) ;
 *   module 2 (معارف)    qiraa-bayaniya (lire les مركبتان sur le quadrillage, معارف 3 أ), murakkibata-om (OM ↔ M(x ; y),
 *                       معارف 1 et la نتيجة), anwa-maalim (les quatre معالم, معارف 2) ;
 *   module 3 (طرائق)    tamthil-shuaa (représenter un vecteur de composantes données).
 */
/** `memo` — la FICHE DE MÉMOIRE de chaque connaissance (MemoCard) : ce qui CHANGE dans la règle est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'murakkibatan', type: 'concepts', title: 'مركبتا شعاع',
        memo: {
          rule: `\\overrightarrow{AB}\\begin{pmatrix} ${R('a')} \\\\ ${R('b')} \\end{pmatrix}`,
          hook: 'أفقيًا أولًا ثم عموديًا',
          example: `\\overrightarrow{AB}\\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix}`,
          trap: 'نسيان الإشارة السالبة نحو اليسار أو الأسفل',
          exam: 'اكتب الشعاع بمركبتيه في عمود بين قوسين',
          chip: `\\begin{pmatrix} a \\\\ b \\end{pmatrix}`,
          quiz: [
      { q: 'للانتقال 3 وحدات يمينًا ووحدتين نزولًا مركبتا الشعاع:', options: ['$(3\\,;\\,-2)$', '$(3\\,;\\,2)$', '$(-3\\,;\\,2)$'], correct: 0 },
      { q: 'المركبة الأولى لشعاع تقيس:', options: ['الحركة الأفقية', 'الحركة العمودية', 'الطول فقط'], correct: 0 },
          ],
        },
        summary: 'للانتقال من A إلى B ننتقل بموازاة (OI) ثم بموازاة (OJ)؛ العددان الموافقان لهاتين الإزاحتين، بإشارتيهما، هما مركبتا الشعاع AB، ونكتبهما عموديا بين قوسين.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{ACTIVITY.part3.replace(/^3\) /, '')}</MathText></p>
            <SourceTag source={ACTIVITY.source} />
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'qiraa-bayaniya', type: 'methodes', title: 'القراءة في تمثيل بياني',
        memo: {
          rule: `\\overrightarrow{AB}\\begin{pmatrix} ${R('\\pm a')} \\\\ ${R('\\pm b')} \\end{pmatrix}`,
          hook: 'يمين وأعلى موجب، يسار وأسفل سالب',
          example: `\\overrightarrow{AB}\\begin{pmatrix} 8 \\\\ -2 \\end{pmatrix}`,
          trap: 'عدّ المربعات دون مراعاة الاتجاه',
          exam: 'اكتب العددين مع إشارتيهما',
          chip: `\\begin{pmatrix} \\pm a \\\\ \\pm b \\end{pmatrix}`,
          quiz: [
      { q: 'شعاع ينتقل 4 وحدات يسارًا ووحدة صعودًا مركبتاه:', options: ['$(-4\\,;\\,1)$', '$(4\\,;\\,-1)$', '$(4\\,;\\,1)$'], correct: 0 },
      { q: 'نقرأ المركبة الأولى بالانتقال بموازاة:', options: ['محور الفواصل', 'محور التراتيب', 'المحورين معًا'], correct: 0 },
          ],
        },
        predictPrompt: 'على الشكل: من A إلى B كُتب $+7$ ثم $+3$ ، ومن C إلى D كُتب $-5$ ثم $+1$ . اكتب بكلماتك طريقة قراءة مركبتي شعاع على الشبكة: من أيّ نقطة تنطلق وإلى أين تصل، وكيف تقرّر إشارة كل مركبة؟',
        summary: 'نقرأ مركبتي شعاع بالانتقال من مبدئه بالتوازي مع (OI) ثم مع (OJ) حتى نهايته: نحو اليمين أو نحو الأعلى العدد موجب، ونحو اليسار أو نحو الأسفل العدد سالب.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW3.ab}</MathText></p>
            <p><MathText>{KNOW3.cd}</MathText></p>
            <SourceTag source={KNOW3.source} />
          </div>
        ),
      },
      {
        id: 'murakkibata-om', type: 'regles', title: 'مركبتا الشعاع OM',
        memo: {
          rule: `M(${R('x')}\\,;\\,${R('y')})\\Rightarrow\\overrightarrow{OM}\\begin{pmatrix} ${R('x')} \\\\ ${R('y')} \\end{pmatrix}`,
          hook: 'من الأصل: الإحداثيتان هما المركبتان',
          example: `M(-3\\,;\\,2)\\Rightarrow\\overrightarrow{OM}\\begin{pmatrix} -3 \\\\ 2 \\end{pmatrix}`,
          trap: 'تطبيق القاعدة على شعاع لا ينطلق من الأصل',
          exam: 'اذكر أن المبدأ هو الأصل ثم استنتج المركبتين',
          chip: `\\overrightarrow{OM}(${R('x')}\\,;\\,${R('y')})`,
          quiz: [
      { q: 'مركبتا $\\overrightarrow{OM}$ مع $M(5\\,;\\,-2)$ :', options: ['$(5\\,;\\,-2)$', '$(-5\\,;\\,2)$', '$(-2\\,;\\,5)$'], correct: 0 },
      { q: 'تصحّ قاعدة «المركبتان هما الإحداثيتان» للشعاع:', options: ['الذي مبدؤه $O$', 'أي شعاع', 'الذي نهايته $O$'], correct: 0 },
          ],
        },
        predictPrompt: 'في طلبات المستودع انطلقت رحلاتك من O، وفي الشكل سهمان من O إلى B وإلى M. قارن، لكل سهم، مركبتي الشعاع بإحداثيتي نهايته: ماذا تستنتج عن مركبتي $\\overrightarrow{OM}$ إذا كانت $M(x\\,;\\,y)$ ؟ ولماذا لا يصحّ ذلك إذا انطلق السهم من نقطة غير O؟',
        summary: 'في معلم مبدؤه O، إذا كانت M نقطة إحداثيتاها x و y فإن مركبتي الشعاع OM هما x و y؛ ولتمثيل الشعاع OM يكفي تعليم النقطة M.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW1.property}</MathText></p>
            <p><MathText>{KNOW1.example}</MathText></p>
            <p><MathText>{KNOW_ORIGIN.remark}</MathText></p>
            <SourceTag source={KNOW1.source} />
          </div>
        ),
      },
      {
        id: 'anwa-maalim', type: 'vocabulaire', title: 'أنواع المعالم',
        memo: {
          rule: `${R('OI=OJ')}\\ ,\\ ${R('(OI)\\perp(OJ)')}`,
          hook: 'متعامد ومتجانس: محوران متعامدان ووحدتان متساويتان',
          example: `OI=OJ=1`,
          trap: 'الخلط بين متعامد ومتجانس',
          exam: 'اذكر الصفتين معًا: معلم متعامد ومتجانس',
          chip: `OI=OJ,\\ (OI)\\perp(OJ)`,
          quiz: [
      { q: 'المعلم المتعامد والمتجانس يتحقق فيه:', options: ['$OI=OJ$ والمحوران متعامدان', 'المحوران متعامدان فقط', '$OI=OJ$ فقط'], correct: 0 },
      { q: 'معلم محوراه متعامدان ووحدتاه مختلفتان هو معلم:', options: ['متعامد غير متجانس', 'متجانس', 'متعامد ومتجانس'], correct: 0 },
          ],
        },
        summary: 'المعلم (O ; I , J) متعامد ومتجانس إذا كان OI = OJ والمحوران متعامدين؛ متعامد إذا تعامد المحوران فقط؛ متجانس إذا تساوت الوحدتان فقط؛ وكيفي في غير ذلك.',
        body: (
          <div className="space-y-1.5">
            <ul className="list-disc space-y-0.5 ps-5">
              {KNOW2.cases.map((c) => <li key={c.id}><strong>{c.name}</strong>: <MathText>{c.conditions.join(' و ')}</MathText></li>)}
            </ul>
            <SourceTag source={KNOW2.source} />
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tamthil-shuaa', type: 'methodes', title: 'تمثيل شعاع علمت مركبتاه',
        memo: {
          rule: `Q=P+\\overrightarrow{u}\\Rightarrow(${R('x_P+a')}\\,;\\,${R('y_P+b')})`,
          hook: 'اختر مبدأ ثم تحرّك أفقيًا ثم عموديًا',
          example: `R(-3\\,;\\,-2),\\ \\overrightarrow{u}(2\\,;\\,4):\\quad U(-1\\,;\\,2)`,
          trap: 'الظنّ أن للشعاع تمثيلًا واحدًا فقط',
          exam: 'علّم المبدأ ثم تحرّك أفقيًا وعموديًا وارسم السهم',
          chip: `(x_P+a\\,;\\,y_P+b)`,
          quiz: [
      { q: 'تمثيل $\\overrightarrow{u}(2\\,;\\,4)$ بمبدأ $R(-3\\,;\\,-2)$ نهايته:', options: ['$(-1\\,;\\,2)$', '$(-5\\,;\\,-6)$', '$(2\\,;\\,4)$'], correct: 0 },
      { q: 'عدد ممثّلات شعاع:', options: ['لا نهائي', 'واحد فقط', 'اثنان'], correct: 0 },
          ],
        },
        predictPrompt: 'في تطبيق التوصيل وضعت دبوس الوجهة انطلاقًا من نقطة معطاة ورمز معطى، مثل $\\begin{pmatrix} 3 \\\\ -4 \\end{pmatrix}$ انطلاقًا من A. لو أعطيناك شعاعًا مركبتاه $a$ و $b$ ونقطة انطلاق أخرى، بأيّ خطوات تجد نهاية ممثّله؟ اكتب الطريقة.',
        summary: 'لتمثيل شعاع مركبتاه a و b نختار نقطة كمبدأ، ننقلها a وحدة بموازاة محور الفواصل ثم b وحدة بموازاة محور التراتيب، فنحصل على نهاية الممثّل؛ ولكل شعاع ممثّلات كثيرة.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{METHOD_DRAW.rule}</MathText></p>
            <SourceTag source={METHOD_DRAW.source} />
          </div>
        ),
      },
    ],
  },
};
