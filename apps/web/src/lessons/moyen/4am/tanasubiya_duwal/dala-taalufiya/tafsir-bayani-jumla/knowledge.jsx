import MathText from '../../../../../common/components/MathText';
import { ACTIVITY_LINES, KNOWLEDGE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس 4 « التفسير البياني لحل جملة معادلتين من الدرجة الأولى بمجهولين » — SOURCE UNIQUE.
 * Une <KnowledgeBrick id="…"> dans un module et la carte rendent le même objet. Le manuel fourni n'a pas de
 * معارف pour cette leçon : les items du module 2 sont la formalisation DÉCLARÉE de la plateforme
 * (content/textbook.js › KNOWLEDGE, `knowledge_formalization`).
 *
 *   module 1 (نشاط 5)  tafsir-nashat — « نقول إنّ … » : (36 ; 7), point commun des deux droites, est le حل ;
 *   module 2 (معارف)   muadala-mustaqim (l'équation et sa droite), hall-taqatu (le حل = l'intersection),
 *                      hall-bayani (la méthode, vérification comprise), qiraa-taqribiya (la lecture approchée),
 *                      halat-thalath (sécantes / parallèles / confondues).
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'tafsir-nashat', type: 'concepts', title: 'نقطة التقاطع وحلّ الجملة',
        memo: {
          rule: "(\\textcolor{#e11d48}{x}\\,;\\,\\textcolor{#e11d48}{y})\\in(d_1)\\cap(d_2)",
          hook: "نقطة التقاطع هي الحلّ",
          example: "(\\textcolor{#e11d48}{36}\\,;\\,\\textcolor{#e11d48}{7})\\in(d_1)\\cap(d_2)",
          trap: "نقطة من مستقيم واحد ليست حلًّا",
          exam: "اذكر أنّ النقطة على المستقيمين معًا",
          chip: "(d_1)\\cap(d_2)",
          quiz: [
            { q: "ثنائية حلّ للجملة إذا كانت النقطة المقابلة لها:", options: ["على المستقيمين معًا", "على المستقيم الأول فقط", "على محور الفواصل"], correct: 0 },
            { q: "النقطة $(40 ; 3)$ على $(d_1)$ فقط. هل هي حلّ للجملة؟", options: ["لا: ليست على $(d_2)$", "نعم: هي على مستقيم", "نعم: إحداثياتها موجبة"], correct: 0 },
          ],
        },
        predictPrompt: 'على لوحة صندوق القسم أضاء المصباحان معًا عند النقطة $(36 ; 7)$ وحدها، أمّا $(40 ; 3)$ من المستقيم $(d_1)$ فأضاءت مصباحًا واحدًا. ماذا تمثّل إحداثيتا النقطة المشتركة بين المستقيمين بالنسبة إلى جملة صندوق القسم؟ اكتب بكلماتك.',
        summary: 'نقطة تقاطع المستقيمين تحقّق المعادلتين معًا: إحداثيتاها، 36 قطعة من 100DA و 7 قطع من 200DA، هما حلّ جملة صندوق القسم.',
        body: (
          <div className="space-y-2">
            <p><MathText>{ACTIVITY_LINES.closing}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{ACTIVITY_LINES.point}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'muadala-mustaqim', type: 'concepts', title: KNOWLEDGE.equationLine.title,
        memo: {
          rule: "ax+by=c\\;\\Rightarrow\\;y=\\textcolor{#e11d48}{-\\dfrac{a}{b}}x+\\dfrac{c}{b}",
          hook: "اعزل المجهول الثاني أولًا",
          example: "100x+200y=5000\\Rightarrow y=\\textcolor{#e11d48}{-\\dfrac{1}{2}}x+25",
          trap: "نسيان تغيير الإشارة عند النقل",
          exam: "اكتب المعادلة على شكل دالة تآلفية قبل الرسم",
          chip: "y=\\textcolor{#e11d48}{-\\tfrac{a}{b}}x+\\tfrac{c}{b}",
          quiz: [
            { q: "المعادلة $2x - y = 1$ تُكتب:", options: ["$y = 2x - 1$", "$y = 2x + 1$", "$y = -2x + 1$"], correct: 0 },
            { q: "مستقيم المعادلة $x + y = 43$ معامل توجيهه:", options: ["$-1$", "$1$", "$43$"], correct: 0 },
          ],
        },
        predictPrompt: 'في النشاط نقلت وقسمت حتى كتبت $100x + 200y = 5000$ كتابةً أخرى قبلتها اللوحة فرسمتها. لو أعطيناك معادلة أخرى بمجهولين $x$ و $y$ ، كيف تكتبها؟ وما شكل مجموعة النقط التي تحقّق إحداثياتها هذه المعادلة؟ ومتى لا تستطيع كتابتها هكذا؟',
        summary: 'معادلة من الدرجة الأولى بمجهولين معامل y فيها غير معدوم تُكتب، بعزل y، على شكل دالة تآلفية؛ والنقط التي تحقّقها هي نقط مستقيم، تمثيلها البياني.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.equationLine.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.equationLine.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'hall-taqatu', type: 'concepts', title: KNOWLEDGE.solutionPoint.title,
        memo: {
          rule: "\\begin{cases}y_0=m_1x_0+p_1\\\\y_0=m_2x_0+p_2\\end{cases}",
          hook: "الفاصلة أولًا ثم الترتيب",
          example: "x=\\textcolor{#e11d48}{36},\\;y=\\textcolor{#e11d48}{7}\\;\\Rightarrow\\;(36\\,;\\,7)",
          trap: "قلب ترتيب الفاصلة والترتيب",
          exam: "اكتب الثنائية بين قوسين: الفاصلة ثم الترتيب",
          chip: "(x\\,;\\,y)",
          quiz: [
            { q: "نقطة التقاطع $(36 ; 7)$ : الثنائية الحلّ هي:", options: ["$(36 ; 7)$", "$(7 ; 36)$", "$(36 ; 36)$"], correct: 0 },
            { q: "في الثنائية $(x ; y)$ العدد الأول هو:", options: ["الفاصلة", "الترتيب", "المجموع"], correct: 0 },
          ],
        },
        predictPrompt: 'في صندوق القسم كان الجواب النقطة المشتركة بين مستقيمين. لو أعطيناك جملة أخرى مرسومًا مستقيماها في معلم واحد، كيف تعرف على الشكل الثنائية التي تحقّق المعادلتين معًا، وبأيّ ترتيب تكتب عدديها؟ وهل تصلح نقطة تقع على مستقيم واحد فقط؟',
        summary: 'ثنائية حلّ للجملة عندما تقع النقطة التي إحداثيتاها هذه الثنائية على المستقيمين معًا: حلّ الجملة هو إحداثيتا نقطة تقاطعهما، الفاصلة أولًا ثم الترتيب.',
        body: <p><MathText>{KNOWLEDGE.solutionPoint.text}</MathText></p>,
      },
      {
        id: 'hall-bayani', type: 'methodes', title: KNOWLEDGE.method.title,
        memo: {
          rule: "\\begin{cases}y=m_1x+p_1\\\\y=m_2x+p_2\\end{cases}\\to P",
          hook: "اكتب، ارسم، اقرأ، تحقّق",
          example: "\\begin{cases}x-y=1\\\\x+y=5\\end{cases}\\to(\\textcolor{#e11d48}{3}\\,;\\,\\textcolor{#e11d48}{2})",
          trap: "ترك التحقق بالتعويض في المعادلتين",
          exam: "اكتب التحقق: تعويض في المعادلتين",
          chip: "d_1\\cap d_2",
          quiz: [
            { q: "آخر خطوة بعد قراءة نقطة التقاطع:", options: ["التحقق بالتعويض في المعادلتين", "رسم مستقيم ثالث", "قسمة الإحداثيين"], correct: 0 },
            { q: "حلّ الجملة $x - y = 1$ و $x + y = 5$ هو:", options: ["$(3 ; 2)$", "$(2 ; 3)$", "$(5 ; 1)$"], correct: 0 },
          ],
        },
        predictPrompt: 'في صندوق القسم ثم في الجملة $\\begin{cases} x - y = 1 \\\\ x + y = 5 \\end{cases}$ وجدت الجواب على معلم. لو أعطيناك جملة جديدة لم يُرسم لها شيء، بأيّ خطوات تجد حلّها بيانيًا؟ وكيف تتأكّد في الأخير أنّ ما وجدته صحيح؟ اكتب الطريقة خطوةً خطوة.',
        summary: 'نكتب كل معادلة على شكل دالة تآلفية، نرسم المستقيمين في معلم واحد، نقرأ إحداثيتي نقطة التقاطع، ثم نتحقّق بالتعويض في المعادلتين.',
        body: (
          <div className="space-y-1">
            {KNOWLEDGE.method.steps.map((s) => <p key={s}><MathText>{s}</MathText></p>)}
          </div>
        ),
      },
      {
        id: 'qiraa-taqribiya', type: 'memoriser', title: KNOWLEDGE.approx.title,
        memo: {
          rule: "(x\\,;\\,y)\\approx(\\textcolor{#e11d48}{3{,}1}\\,;\\,\\textcolor{#e11d48}{1{,}9})",
          hook: "القراءة تقريب والحساب هو الدقة",
          example: "\\dfrac{7}{3}\\approx \\textcolor{#e11d48}{2{,}3}",
          trap: "اعتبار القراءة على الشكل حلًّا مضبوطًا دائمًا",
          exam: "اذكر أنّ القراءة تقريبية ثم احسب",
          chip: "x\\approx \\textcolor{#e11d48}{2{,}3}",
          quiz: [
            { q: "متى تكون القراءة البيانية دقيقة؟", options: ["حين تقع نقطة التقاطع على عقدة من الشبكة", "دائمًا", "حين يكون المستقيمان متوازيين"], correct: 0 },
            { q: "لإيجاد الحلّ المضبوط حين لا تقع نقطة التقاطع على عقدة نستعمل:", options: ["الحساب", "نظرًا أدقّ", "تقريب الأعداد"], correct: 0 },
          ],
        },
        predictPrompt: 'قرأ أمين $(3 ; 2)$ على الشكل، ثم تحقّق منها بالحساب. هل تثق دائمًا بما تقرؤه على الشكل؟ متى تكون القراءة دقيقة تمامًا، ومتى لا تكون؟ وماذا تفعل عندئذ لتجد الثنائية بدقة؟',
        summary: 'القراءة البيانية لا تعطي الحل المضبوط إلا إذا وقعت نقطة التقاطع على عقدة من الشبكة؛ وإلا فهي تقريبية، والحل المضبوط يعطيه الحساب.',
        body: <p><MathText>{KNOWLEDGE.approx.text}</MathText></p>,
      },
      {
        id: 'halat-thalath', type: 'regles', title: KNOWLEDGE.cases.title,
        memo: {
          rule: "m_1=m_2\\;\\begin{cases}p_1\\neq p_2:\\;0\\\\p_1=p_2:\\;\\infty\\end{cases}",
          hook: "متقاطعان، متوازيان، منطبقان",
          example: "y=-x+3,\\;y=-x+5\\to \\textcolor{#e11d48}{0}",
          trap: "المتوازيان لهما الميل نفسه لا الحدّ الثابت نفسه",
          exam: "قارن معاملَي التوجيه ثم الترتيبين عند المبدأ",
          chip: "m_1=m_2",
          quiz: [
            { q: "مستقيمان معامل توجيههما نفسه وترتيبهما عند المبدأ مختلف. عدد حلول الجملة:", options: ["لا حلّ", "حلّ واحد", "عدد لا نهائي"], correct: 0 },
            { q: "مستقيمان منطبقان: عدد حلول الجملة:", options: ["عدد لا نهائي", "لا حلّ", "حلّ واحد"], correct: 0 },
          ],
        },
        summary: 'مستقيمان متقاطعان: حلّ وحيد؛ متوازيان (معامل التوجيه نفسه وترتيبان مختلفان): لا حلّ؛ منطبقان (معامل التوجيه نفسه والترتيب نفسه): عدد لا نهائي من الحلول.',
        body: (
          <div className="space-y-1">
            {KNOWLEDGE.cases.items.map((s) => <p key={s}><MathText>{s}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.cases.link}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
