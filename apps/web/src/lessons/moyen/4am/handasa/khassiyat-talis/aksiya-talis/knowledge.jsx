import MathText from '../../../../../common/components/MathText';
import GeoFigure from '../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../common/textbook';
import { ACTIVITY, KNOWLEDGE3, KNOW1_REMARK1, METHOD } from './content/textbook';
import { FIG_KNOW3_REMARK } from './content/figures';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** Le rouge de la fiche de mémoire (MemoCard) : ce qui CHANGE dans la règle. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

/**
 * Les connaissances du درس « الخاصية العكسية لخاصية طالس وإثبات التوازي » — SOURCE UNIQUE.
 *
 *   module 1 (نشاط 2)  aksiya-nashat — le texte complété de la question 2 et la ملاحظة sur l'ordre ;
 *   module 2 (معارف)   khassiya-aksiya (معارف 3), shart-tartib (sa ملاحظة : rapports égaux, ordre différent),
 *                      nisbatan-mukhtalifatan (ملاحظة 1 de معارف 1, déclarée en double) ;
 *   module 3 (طرائق)   tariqa-tawazi, tariqa-adam-tawazi (la marche de طرائق p. 109, formulée par la plateforme).
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'aksiya-nashat', type: 'concepts', title: 'الخاصية العكسية في النشاط',
        memo: {
          rule: `\\begin{aligned}&\\dfrac{AB'}{AB}=${R("\\dfrac{AC'}{AC}")}\\\\[2pt]&\\Rightarrow (B'C')\\parallel(BC)\\end{aligned}`,
          hook: 'نسبتان متساويتان وترتيب واحد',
          example: `\\dfrac{2}{6}=${R("\\dfrac{3}{9}")}=\\dfrac{1}{3}`,
          trap: 'تساوي النسبتين وحده لا يكفي، انظر إلى جهتَي النقطتين',
          exam: 'اكتب النسبتين ثم قارنهما وتحقّق من الترتيب قبل أن تستنتج التوازي',
          chip: `\\tfrac{AB'}{AB}=${R("\\tfrac{AC'}{AC}")}`,
          quiz: [
            { q: "إذا كان $\\frac{AB'}{AB}=\\frac{AC'}{AC}$ والنقط مرتبة بالترتيب نفسه فإن:", options: ["$(B'C')\\parallel(BC)$", "$(B'C')\\perp(BC)$", "$B'C'=BC$"], correct: 0 },
            { q: "في الشكل 3 النسبتان متساويتان لكن الفقاعة مائلة، لأن:", options: ["B′ و C′ ليستا في الجهة نفسها من A", "النسبتين غير متساويتين", "اللوح قصير جدا"], correct: 0 },
          ],
        },
        predictPrompt: "في الأشكال الثلاثة كانت $\\dfrac{AB'}{AB} = \\dfrac{AC'}{AC} = \\dfrac{1}{3}$ ، لكن الفقاعة بقيت مائلة في الشكل 3 وحده. اكتب بكلماتك ما الذي يجعل $(B'C')$ موازيًا لـ $(BC)$ .",
        summary: 'إذا كانت النقط A، B، B′ والنقط A، C، C′ في استقامية ومرتبة بنفس الترتيب، وكانت النسبة AB′ على AB تساوي النسبة AC′ على AC، فإن المستقيمين (BC) و (B′C′) متوازيان.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{ACTIVITY.statement}</MathText></p>
            <p className="text-sm text-slate-700"><MathText>{ACTIVITY.remark}</MathText></p>
            <div className="flex flex-wrap gap-2" dir="ltr">
              {ACTIVITY.tables.map((row) => (
                <table key={row.join('')} className="border-collapse text-center font-mono text-sm">
                  <tbody>
                    <tr>{row.slice(0, 3).map((c, i) => <td key={i} className="border border-slate-400 px-2">{c}</td>)}</tr>
                    <tr>{row.slice(3).map((c, i) => <td key={i} className="border border-slate-400 px-2">{c}</td>)}</tr>
                  </tbody>
                </table>
              ))}
              <span className="self-center text-sm text-slate-600" dir="rtl">{ACTIVITY.tail}</span>
            </div>
            <SourceTag source={ACTIVITY.source} />
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'khassiya-aksiya', type: 'regles', title: 'الخاصية العكسية لخاصية طالس',
        memo: {
          rule: `\\begin{aligned}&\\dfrac{AB'}{AB}=\\dfrac{AC'}{AC}\\\\[2pt]&\\Rightarrow ${R("(BC)\\parallel(B'C')")}\\end{aligned}`,
          hook: 'النسبتان والترتيب يثبتان التوازي',
          example: `\\dfrac{3}{9}=\\dfrac{4}{12}=${R("\\dfrac{1}{3}")}`,
          trap: 'نكتفي بتساوي النسبتين وننسى ترتيب النقط',
          exam: 'تحقّق من الاستقامة والترتيب، ثم قارن النسبتين واستنتج التوازي',
          chip: `\\tfrac{AB'}{AB}=\\tfrac{AC'}{AC}\\Rightarrow${R("\\parallel")}`,
          quiz: [
            { q: "النقط A و B و B′ وA و C و C′ في الترتيب نفسه و $\\frac{AB'}{AB}=\\frac{AC'}{AC}$ . إذن:", options: ["$(BC)\\parallel(B'C')$", "المستقيمان متعامدان", "المستقيمان غير متوازيين"], correct: 0 },
            { q: "يكفي للبرهان على التوازي:", options: ["تساوي النسبتين مع الترتيب نفسه", "تساوي الطولين AB′ و AC′", "أن يكون AB = AC"], correct: 0 },
          ],
        },
        summary: '(d) و (d′) متقاطعان في A، B و B′ من (d) و C و C′ من (d′) تختلف عن A. إذا كان AB′ على AB يساوي AC′ على AC وكانت النقط A، B، B′ و A، C، C′ مرتبة بنفس الترتيب فإن (BC) و (B′C′) متوازيان.',
        body: (
          <div className="space-y-1">
            {KNOWLEDGE3.property.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <SourceTag source={KNOWLEDGE3.source} />
          </div>
        ),
      },
      {
        id: 'shart-tartib', type: 'memoriser', title: 'شرط الترتيب',
        memo: {
          rule: `\\begin{aligned}&\\dfrac{AB'}{AB}=\\dfrac{AC'}{AC}\\\\[2pt]&${R("\\not\\Rightarrow")}\\ (B'C')\\parallel(BC)\\end{aligned}`,
          hook: 'الترتيب شرط لا يُهمل',
          example: `\\dfrac{3}{9}=\\dfrac{4}{12}\\ ${R("\\not\\Rightarrow")}\\ \\parallel`,
          trap: 'نحكم بالتوازي من تساوي النسبتين دون النظر إلى جهة النقطتين',
          exam: 'اذكر صراحة أن النقط مرتبة بالترتيب نفسه، وإلا فلا استنتاج',
          chip: `\\tfrac{AB'}{AB}=\\tfrac{AC'}{AC}\\ ${R("\\not\\Rightarrow")}\\ \\parallel`,
          quiz: [
            { q: "النسبتان متساويتان لكن B′ بين A و B و C′ من الجهة الأخرى للنقطة A . المستقيمان:", options: ["غير متوازيين", "متوازيان", "متطابقان"], correct: 0 },
            { q: "ما الشرط الذي يُضاف إلى تساوي النسبتين؟", options: ["النقط مرتبة بالترتيب نفسه", "أن يكون AB = AC", "أن يكون المثلث قائما"], correct: 0 },
          ],
        },
        predictPrompt: "في الشكل 3 من النشاط كانت النسبتان متساويتين ( $\\dfrac{1}{3}$ ) ومع ذلك بقيت الفقاعة مائلة. ما الذي يختلف في الشكل 3 عن الشكلين الآخرين؟ هل يكفي تساوي النسبتين لنحكم بالتوازي؟ اكتب ما تستنتجه.",
        summary: 'تساوي النسبتين لا يكفي: إذا لم تكن النقط A، B، B′ و A، C، C′ مرتبة بنفس الترتيب فإن المستقيمين (BC) و (B′C′) غير متوازيين.',
        body: (
          <div className="space-y-1.5">
            <GeoFigure {...FIG_KNOW3_REMARK} />
            <p><MathText>{KNOWLEDGE3.remark}</MathText></p>
            <SourceTag source={KNOWLEDGE3.source} />
          </div>
        ),
      },
      {
        id: 'nisbatan-mukhtalifatan', type: 'regles', title: 'نسبتان مختلفتان',
        memo: {
          rule: `\\begin{aligned}&\\dfrac{AB'}{AB}${R("\\neq")}\\dfrac{AC'}{AC}\\\\[2pt]&\\Rightarrow (B'C')\\not\\parallel(BC)\\end{aligned}`,
          hook: 'نسبتان مختلفتان فلا توازي',
          example: `\\dfrac{4}{6}${R("\\neq")}\\dfrac{3}{9}`,
          trap: 'نقارن الطولين المقيسين بدل أن نقارن النسبتين',
          exam: 'لو كانا متوازيين لتساوت النسبتان، لكنهما مختلفتان، إذن غير متوازيين',
          chip: `\\tfrac{AB'}{AB}${R("\\neq")}\\tfrac{AC'}{AC}`,
          quiz: [
            { q: "إذا كان $\\frac{AB'}{AB}\\neq\\frac{AC'}{AC}$ فإن المستقيمين:", options: ["غير متوازيين", "متوازيان", "متعامدان"], correct: 0 },
            { q: "برهان عدم التوازي يستعمل:", options: ["خاصية طالس المباشرة: لو توازيا لتساوت النسب", "الخاصية العكسية فقط", "قياس الزوايا"], correct: 0 },
          ],
        },
        summary: 'يكفي عدم تساوي نسبتين من نسب طالس للقول إن المستقيمين غير متوازيين، لأنهما لو كانا متوازيين لتساوت النسب حسب خاصية طالس.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW1_REMARK1.text}</MathText></p>
            <p className="text-sm text-slate-700">{KNOW1_REMARK1.why}</p>
            <SourceTag source={KNOW1_REMARK1.source} />
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqa-tawazi', type: 'methodes', title: 'إثبات توازي مستقيمين',
        memo: {
          rule: `\\dfrac{AB'}{AB}${R("\\overset{?}{=}")}\\dfrac{AC'}{AC}`,
          hook: 'استقامة، ترتيب، نسبتان، استنتاج',
          example: `2\\times9=${R("18")}=3\\times6`,
          trap: 'نقارن النسبتين وننسى الاستقامة والترتيب',
          exam: 'اذكر الاستقامة والترتيب، احسب النسبتين، ثم استنتج بالخاصية العكسية',
          chip: `\\tfrac{AB'}{AB}${R("\\overset{?}{=}")}\\tfrac{AC'}{AC}`,
          quiz: [
            { q: "ما أول ما نتحقق منه قبل مقارنة النسبتين؟", options: ["أن النقط على استقامة ومرتبة بالترتيب نفسه", "أن الزوايا متساوية", "أن المثلثين متقايسان"], correct: 0 },
            { q: "لمقارنة $\\frac{2}{6}$ و $\\frac{3}{9}$ نقارن الجداءين $2\\times 9$ و:", options: ["$3\\times 6$", "$3\\times 9$", "$2\\times 6$"], correct: 0 },
          ],
        },
        predictPrompt: 'اخترت للتوّ النسبتين $\\dfrac{DA}{DF}$ و $\\dfrac{DB}{DC}$ لتثبت أنّ $(CF)$ يوازي $(AB)$ . لو أعطيناك شكلًا آخر فيه مستقيمان متقاطعان، بأيّ خطوات تبرهن أنّ مستقيمين متوازيان، وبأيّ ترتيب؟ اكتب الطريقة.',
        summary: 'نتحقق أن النقط في استقامية وبنفس الترتيب، ثم نحسب النسبتين ونقارنهما بالجداء المتصالب، ثم نستنتج التوازي حسب الخاصية العكسية لخاصية طالس.',
        body: (
          <div className="space-y-1.5">
            {METHOD.ruleParallel.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-700"><MathText>{METHOD.part1[2]}</MathText></p>
            <SourceTag source={METHOD.source} /> <SourceTag source={METHOD.ruleSource} />
          </div>
        ),
      },
      {
        id: 'tariqa-adam-tawazi', type: 'methodes', title: 'إثبات عدم توازي مستقيمين',
        memo: {
          rule: `\\begin{aligned}&\\dfrac{AB'}{AB}${R("\\neq")}\\dfrac{AC'}{AC}\\\\[2pt]&\\Rightarrow\\ \\not\\parallel\\end{aligned}`,
          hook: 'لو توازيا لتساوت النسب',
          example: `3{,}2\\times5=16${R("\\neq")}16{,}1=4{,}6\\times3{,}5`,
          trap: 'نقول إنهما مختلفان دون أن نذكر خاصية طالس',
          exam: 'ابدأ بعبارة «لو كانا متوازيين» ثم أظهر التناقض ثم استنتج',
          chip: `\\tfrac{a}{b}${R("\\neq")}\\tfrac{c}{d}`,
          quiz: [
            { q: "$3{,}2 \\times 5 = 16$ و $4{,}6 \\times 3{,}5 = 16{,}1$ . إذن النسبتان:", options: ["غير متساويتين فالمستقيمان غير متوازيين", "متساويتان فالمستقيمان متوازيان", "لا يمكن الحكم"], correct: 0 },
            { q: "لماذا نبدأ البرهان بعبارة «لو كان المستقيمان متوازيين»؟", options: ["لنطبّق خاصية طالس ونحصل على تساوي النسب", "لنقيس الزاوية", "لنرسم الموازي"], correct: 0 },
          ],
        },
        predictPrompt: 'وجدت $3{,}2 \\times 5 = 16$ و $4{,}6 \\times 3{,}5 = 16{,}1$ . كيف تكتب برهانًا كاملًا على أنّ $(BD)$ و $(EF)$ غير متوازيين؟ اكتب الخطوات، وبرّر استنتاجك.',
        summary: 'نجد نسبتين غير متساويتين، ثم نقول: لو كان المستقيمان متوازيين لتساوت النسبتان حسب خاصية طالس، لكن المساواة خاطئة، إذن المستقيمان غير متوازيين.',
        body: (
          <div className="space-y-1.5">
            {METHOD.ruleNotParallel.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-700"><MathText>{METHOD.part2[2]}</MathText></p>
            <SourceTag source={METHOD.source} /> <SourceTag source={METHOD.ruleSource} />
          </div>
        ),
      },
    ],
  },
};
