import MathText from '../../../../../common/components/MathText';
import { SourceTag } from '../../../../../common/textbook';
import { ACTIVITY, KNOW1, KNOW2, METHOD_RULE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** Le rouge de la fiche de mémoire (MemoCard) : ce qui CHANGE dans la règle. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

/**
 * Les connaissances du درس « خاصية طالس وحساب الأطوال » — SOURCE UNIQUE.
 *
 *   module 1 (نشاط 1)  talis-nashat — le texte complété du نشاط 1 (« يسمى هذا النص خاصية طالس ») ;
 *   module 2 (معارف)   khassiyat-talis (معارف 1 : la propriété, ses trois positions, le tableau de
 *                      proportionnalité), adam-tawazi (ملاحظة 1 et 2), muamil-tanasub (معارف 2 : k, تكبير / تصغير) ;
 *   module 3 (طرائق)   hisab-atwal (la طريقة « حساب أطوال », ses gestes nommés — plateforme, déclaré).
 *
 * LECTEUR DE MISSION (2026-11-10) : la carte est ouverte dès le début (`knowledgeMapOpen`) — aucune carte ne montre la مسألة du module 5 dans
 * son rôle (k = 2/5 sur AB = 10 → 4 était EXACTEMENT sa première question : les exemples de khassiyat-talis et muamil-tanasub ont d'autres
 * nombres) ; aucun texte ne renvoie au manuel (_unit/missionStrings.test.js).
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'talis-nashat', type: 'concepts', title: 'خاصية طالس (نص النشاط)',
        memo: {
          rule: `\\dfrac{AB'}{AB}=\\dfrac{AC'}{AC}=${R("\\dfrac{B'C'}{BC}")}`,
          hook: 'ثلاث نسب متساوية',
          example: `\\dfrac{2}{6}=\\dfrac{3}{9}=${R("\\dfrac{1}{3}")}`,
          trap: 'نخلط بين الطول من A والقطعة المتبقية',
          exam: 'اذكر الموازي أولا ثم اكتب النسب الثلاث بالترتيب نفسه',
          chip: `\\tfrac{AB'}{AB}=\\tfrac{AC'}{AC}=\\tfrac{B'C'}{BC}`,
          quiz: [
            { q: "إذا كان $(BC)\\parallel(B'C')$ فإن $\\frac{AB'}{AB}$ يساوي:", options: ["$\\frac{AC'}{AC}$", "$\\frac{AC}{AC'}$", "$\\frac{BC}{B'C'}$"], correct: 0 },
            { q: "النسبة الثالثة في خاصية طالس هي:", options: ["$\\frac{B'C'}{BC}$", "$\\frac{BB'}{BC}$", "$\\frac{AB}{BC}$"], correct: 0 },
          ],
        },
        predictPrompt: "في الساحة وجدتَ أنّ ظلّ كل شيء شاقولي ÷ طوله عدد واحد، وفي الشكل حسبتَ طولين في حالتين: $B'$ و $C'$ على $[AB]$ و $[AC]$ ($AB' = 3{,}2$ و $AB = 6$)، ثم من الجهة الأخرى للنقطة $A$ ($AB' = 1{,}6$ و $AB = 3{,}2$). أكمل النص بكلماتك: إذا كان المستقيمان $(BC)$ و $(B'C')$ متوازيين، فماذا نستنتج عن أطوال المثلثين $AB'C'$ و $ABC$؟",
        summary: 'إذا كانت النقط A و B و B′ على استقامة والنقط A و C و C′ على استقامة، وكان المستقيمان (BC) و (B′C′) متوازيين، فإن النسب AB′/AB و AC′/AC و B′C′/BC متساوية.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{ACTIVITY.statement}</MathText></p>
            <p className="text-sm text-slate-600">يسمى هذا النص «خاصية طالس».</p>
            <SourceTag source={ACTIVITY.source} />
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'khassiyat-talis', type: 'regles', title: 'خاصية طالس',
        memo: {
          rule: `\\dfrac{AM}{AB}=\\dfrac{AN}{AC}=${R("\\dfrac{MN}{BC}")}`,
          hook: 'موازيان يعطيان ثلاث نسب',
          example: `\\dfrac{AM}{AB}=\\dfrac{AN}{AC}=\\dfrac{MN}{BC}=${R("\\dfrac{3}{7}")}`,
          trap: 'نقارن MN بـ AB بدل أن نقارنها بـ BC',
          exam: 'ارسم الشكل وحدّد الرأس، ثم اكتب النسب الثلاث مع ذكر التوازي',
          chip: `\\tfrac{AM}{AB}=\\tfrac{AN}{AC}=\\tfrac{MN}{BC}`,
          quiz: [
            { q: "في وضعية طالس رأسها A النسبة $\\frac{MN}{BC}$ تساوي:", options: ["$\\frac{AM}{AB}$", "$\\frac{AB}{AM}$", "$\\frac{MB}{AB}$"], correct: 0 },
            { q: "المستقيمان المتوازيان هما:", options: ["$(MN)$ و $(BC)$", "$(AM)$ و $(AN)$", "$(AB)$ و $(AC)$"], correct: 0 },
          ],
        },
        predictPrompt: "في النشاط رأيتَ $B'$ و $C'$ بين $A$ و $B$ و $C$، ثم من الجهة الأخرى للنقطة $A$. وماذا لو كانتا أبعد من $B$ و $C$؟ اكتب الخاصية بكلماتك لمستقيمين متقاطعين في $A$ يقطعهما مستقيمان متوازيان $(MN)$ و $(BC)$: أين يمكن أن تقع $M$ و $N$، وما العلاقة بين أطوال المثلثين $AMN$ و $ABC$؟",
        summary: 'مستقيمان متقاطعان في A يقطعهما مستقيمان متوازيان (MN) و (BC): AM/AB = AN/AC = MN/BC، سواء كانت M و N على الضلعين أو على امتدادهما أو من الجهة الأخرى للنقطة A؛ وأطوال المثلثين AMN و ABC متناسبة.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW1.property}</MathText></p>
            <p><MathText>{`${KNOW1.results} ${KNOW1.resultsTable}`}</MathText></p>
            <p className="text-sm text-slate-600">{KNOW1.resultsEnd}</p>
            <SourceTag source={KNOW1.source} />
          </div>
        ),
      },
      {
        id: 'adam-tawazi', type: 'regles', title: 'نسبتان غير متساويتين',
        memo: {
          rule: `\\begin{aligned}&\\dfrac{AM}{AB}${R("\\neq")}\\dfrac{AN}{AC}\\\\[2pt]&\\Rightarrow(MN)\\not\\parallel(BC)\\end{aligned}`,
          hook: 'نسبتان مختلفتان فلا توازي',
          example: `\\dfrac{3}{5}${R("\\neq")}\\dfrac{4}{7}`,
          trap: 'نحكم بالقياس على الرسم لا بالنسب',
          exam: 'اكتب النسبتين وبيّن بالجداء المتصالب أنهما مختلفتان ثم استنتج',
          chip: `\\tfrac{AM}{AB}${R("\\neq")}\\tfrac{AN}{AC}`,
          quiz: [
            { q: "النسبتان $\\frac{3}{5}$ و $\\frac{4}{7}$ :", options: ["مختلفتان فالمستقيمان غير متوازيين", "متساويتان فالمستقيمان متوازيان", "يلزم قياس الزاوية"], correct: 0 },
            { q: "لإثبات عدم التوازي يكفي أن نجد:", options: ["نسبتين غير متساويتين", "نسبتين متساويتين", "زاويتين متساويتين"], correct: 0 },
          ],
        },
        predictPrompt: "في الشكل $AM = 2$ و $AB = 3$ و $AN = 1$ و $AC = 2$، وفي الساحة رأيت أنّ النسبة بين الظلّ والطول واحدة حين يتوازى الشيئان. قارن $\\dfrac{AM}{AB}$ و $\\dfrac{AN}{AC}$، ثم اكتب القاعدة بكلماتك: متى نستطيع أن نقول إنّ المستقيمين $(MN)$ و $(BC)$ ليسا متوازيين؟",
        summary: 'يكفي عدم تساوي نسبتين من النسب الثلاث للقول إن المستقيمين غير متوازيين؛ وتسمح خاصية طالس بحساب الأطوال والنسب وإثبات عدم توازي مستقيمين.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW1.remark1}</MathText></p>
            <p><MathText>{KNOW1.remark2}</MathText></p>
            <SourceTag source={KNOW1.source} />
          </div>
        ),
      },
      {
        id: 'muamil-tanasub', type: 'concepts', title: 'معامل التناسبية k',
        memo: {
          rule: `\\begin{aligned}AB'&=${R("k")}\\times AB\\\\[2pt]AC'&=${R("k")}\\times AC\\end{aligned}`,
          hook: 'اضرب كل الأطوال في k',
          example: `AB'=${R("\\dfrac{1}{4}")}\\times28=7`,
          trap: 'نضيف k إلى الطول بدل أن نضرب فيه',
          exam: 'اكتب k مرة واحدة ثم اضرب فيه كل ضلع في المثلث الأول',
          chip: `AB'=k\\times AB`,
          quiz: [
            { q: "إذا كان $k=\\frac{1}{4}$ و $AB=28$ فإن $AB'$ يساوي:", options: ["$7$", "$112$", "$28{,}25$"], correct: 0 },
            { q: "معامل التكبير k هو عدد:", options: ["أكبر من $1$", "أصغر من $1$", "يساوي $0$"], correct: 0 },
          ],
        },
        summary: 'في مثلثين في وضعية طالس تُضرب كل أطوال المثلث ABC في العدد نفسه k لنحصل على أطوال AB′C′؛ إذا كان k أصغر من 1 فهو معامل تصغير، وإذا كان أكبر من 1 فهو معامل تكبير.',
        body: (
          <div className="space-y-1.5">
            {KNOW2.lines.slice(2).map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <SourceTag source={KNOW2.source} />
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'hisab-atwal', type: 'methodes', title: 'حساب طول بخاصية طالس',
        memo: {
          rule: `\\begin{aligned}&\\dfrac{AM}{AB}=\\dfrac{AN}{AC}\\\\[2pt]&\\Rightarrow AN=${R("\\dfrac{AM\\times AC}{AB}")}\\end{aligned}`,
          hook: 'ثلاثة معلومة والرابع بالجداء المتصالب',
          example: `\\dfrac{4}{6}=\\dfrac{AN}{9}\\Rightarrow AN=\\dfrac{4\\times9}{6}=${R("6")}`,
          trap: 'نقسم على الطول الخطأ بعد الجداء المتصالب',
          exam: 'تحقّق من وضعية طالس، اكتب النسب، اختر المساواة المناسبة، ثم احسب',
          chip: `AN=\\tfrac{AM\\times AC}{AB}`,
          quiz: [
            { q: "$\\frac{4}{6}=\\frac{x}{9}$ ، إذن $x=$", options: ["$6$", "$13{,}5$", "$\\frac{8}{3}$"], correct: 0 },
            { q: "نكتب المساواة التي فيها:", options: ["المجهول وثلاثة أطوال معلومة", "ثلاثة مجاهيل", "نسبة واحدة فقط"], correct: 0 },
          ],
        },
        predictPrompt: "كشفت الحلّ سطرًا سطرًا لحساب $DN$ في متوازي الأضلاع. لو أعطيناك شكلًا آخر فيه طول مجهول، فبأيّ خطوات تحسبه؟ اكتب الطريقة بالترتيب.",
        summary: 'نتأكد من وضعية طالس، نكتب النسب الثلاث بالترتيب نفسه، نحتفظ بالمساواة التي فيها الطول المطلوب وثلاثة أطوال معلومة، ثم نحسب بالجداء المتصالب.',
        body: (
          <div className="space-y-1.5">
            <ol className="list-decimal space-y-0.5 ps-5">
              {METHOD_RULE.lines.map((l) => <li key={l}><MathText>{l}</MathText></li>)}
            </ol>
            <SourceTag source={METHOD.source} />
          </div>
        ),
      },
    ],
  },
};
