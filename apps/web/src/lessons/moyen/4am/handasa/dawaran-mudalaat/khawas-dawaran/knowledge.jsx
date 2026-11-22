import MathText from '../../../../../common/components/MathText';
import { SourceTag } from '../../../../../common/textbook';
import { ACTIVITY, KNOW3, PERP, METHOD, NOW155, CENTER } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE dans la règle s'écrit en rouge. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

/**
 * Les connaissances du درس « خواص الدوران وتوظيفها في الأشكال الهندسية » — SOURCE UNIQUE.
 *
 *   module 1 (le papier calque)   thabat-dawaran — ce que la feuille qui tourne garde et ce qu'elle change (la
 *                                 situation de la plateforme, nommée après le geste) ;
 *   module 2 (معارف 3 + ajout)    khawas-dawaran (la propriété du manuel, p. 154), zawiya-sura (une droite et son image :
 *                                 l'angle α ; 90° ⇒ ⊥, 180° ⇒ ∥ — معارف من المنصّة) ;
 *   module 3 (طرائق p. 155)       istimal-khawas (prouver AC = BD et (BD) ⊥ (AC) par un دوران), surat-zawiya (l'image
 *                                 d'un angle, دوري الآن), markaz-dawaran (le centre : deux médiatrices — معارف من المنصّة).
 *
 * « أتوقّع القاعدة » (2026-10-06) : chaque règle prédictible a son `predictPrompt` (ancré sur le geste du laboratoire),
 * sauf khawas-dawaran, RAPPEL au module 2 (thabat-dawaran l'a déjà fait écrire au module 1) ; istimal-khawas est
 * prédite par la <PredictRule> qui enveloppe la solution du manuel (Module03Taraiq).
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'thabat-dawaran', type: 'concepts', title: 'ما يبقى وما يتغيّر',
        memo: {
          rule: `\\begin{aligned}${R("A'B'")}&=AB\\\\\\widehat{${R("A'B'C'")}}&=\\widehat{ABC}\\end{aligned}`,
          hook: 'الدوران يغيّر المكان لا الشكل',
          example: `${R("A'B'")}=AB=3`,
          trap: 'الورقة الممطّطة ليست دورانا لأنها تغيّر الطول',
          exam: 'اكتب: الدوران يحافظ على الأطوال والزوايا والمساحات والاستقامية',
          chip: `${R("A'B'")}=AB`,
          quiz: [
            { q: 'بعد دوران الورقة حول الدبوس، طول القطعة:', options: ['يبقى كما هو', 'يزيد بزاوية الدوران', 'يصغر كلما ابتعدت النسخة'], correct: 0 },
            { q: 'مثلث مساحته $3$ أدرناه $60^\\circ$ حول دبوس. مساحة صورته:', options: ['$3$', '$3+60$', '$\\frac{3}{60}$'], correct: 0 },
          ],
        },
        predictPrompt: 'طبعت نسخًا للبتلة $ABC$ وأنت تدير الورقة حول الدبوس، وقارنت كلّ نسخة بالبتلة سطرًا سطرًا على اللوحة. اكتب بكلماتك: ما الذي لا يتغيّر أبدًا مهما أدرت الورقة، وما الذي يتغيّر؟',
        summary: 'حين تدور الورقة الشفافة حول دبوسها لا يتغيّر طول ولا زاوية ولا مساحة ولا استقامية؛ يتغيّر موضع الشكل ومنحى مستقيماته فقط. والورقة الممطّطة تغيّر الأطوال، فليست دورانا.',
        body: (
          <div className="space-y-1.5">
            <p>{ACTIVITY.closing}</p>
            <p>الورقة الممطّطة تغيّر الطول والزاوية والمساحة: ما تعطيه ليس صورة بدوران.</p>
            <SourceTag source={ACTIVITY.source} />
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'khawas-dawaran', type: 'regles', title: KNOW3.title,
        memo: {
          rule: `\\begin{aligned}${R("A'B'")}&=AB\\\\${R("\\mathcal{A}'")}&=\\mathcal{A}\\end{aligned}`,
          hook: 'يحفظ الطول والزاوية والمساحة',
          example: `\\widehat{${R("A'B'C'")}}=\\widehat{ABC}=45^{\\circ}`,
          trap: 'ظنّ أن حفظ الاستقامية وحده يكفي ليكون التحويل دورانا',
          exam: 'اكتب: الدوران يحافظ على الأطوال والزوايا، إذن القياس نفسه',
          chip: `${R("A'B'")}=AB`,
          quiz: [
            { q: 'الدوران يحافظ على:', options: ['الأطوال والزوايا والمساحات والاستقامية', 'الأطوال فقط', 'الأطوال واتجاه المستقيمات'], correct: 0 },
            { q: 'صورة زاوية قيسها $45^\\circ$ بدوران زاويته $60^\\circ$ قيسها:', options: ['$45^\\circ$', '$105^\\circ$', '$60^\\circ$'], correct: 0 },
          ],
        },
        summary: 'الدوران يحافظ على الأطوال، وعلى استقامية النقط، وعلى أقياس الزوايا، وعلى المساحات.',
        body: (
          <div className="space-y-1.5">
            <p className="font-semibold">{KNOW3.property}</p>
            <ul className="list-disc space-y-0.5 ps-5">{KNOW3.items.map((l) => <li key={l}>{l}</li>)}</ul>
            <p className="text-sm"><MathText>{KNOW3.example}</MathText></p>
            <SourceTag source={KNOW3.source} />
          </div>
        ),
      },
      {
        id: 'zawiya-sura', type: 'regles', title: PERP.title,
        memo: {
          rule: `\\angle\\left((AB),(A'B')\\right)=${R('\\alpha')}`,
          hook: 'مستقيم وصورته: زاوية الدوران',
          example: `\\alpha=90^{\\circ}\\Rightarrow(A'B')${R('\\perp')}(AB)`,
          trap: 'القول إن صورة المستقيم تبقى موازية له دائما',
          exam: 'اكتب: زاوية الدوران قائمة، إذن المستقيم وصورته متعامدان',
          chip: `\\alpha=90^{\\circ}\\Rightarrow${R('\\perp')}`,
          quiz: [
            { q: 'دوران زاويته $90^\\circ$: المستقيم وصورته:', options: ['متعامدان', 'متوازيان', 'منطبقان'], correct: 0 },
            { q: 'دوران زاويته $180^\\circ$: المستقيم وصورته:', options: ['متوازيان', 'متعامدان', 'يصنعان $60^\\circ$'], correct: 0 },
          ],
        },
        predictPrompt: 'على اللوحة قرأت «الزاوية بين المستقيمين» $(AB)$ و $(A\'B\')$ : $60^\\circ$ للنسخة الأولى من الوردة، ثم أدرت الورقة $90^\\circ$ و $180^\\circ$ . كيف ترتبط الزاوية بين مستقيم وصورته بزاوية الدوران؟ وما وضع المستقيمين في هاتين الحالتين؟',
        summary: 'المستقيم وصورته بدوران زاويته ألفا يصنعان زاوية ألفا: صورة مستقيم بدوران زاويته قائمة تعامده، وبدوران زاويته مستقيمة (نصف دورة) توازيه.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{PERP.text}</MathText></p>
            <ul className="list-disc space-y-0.5 ps-5">{PERP.cases.map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ul>
            <SourceTag source={PERP.source} />
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'istimal-khawas', type: 'methodes', title: METHOD.title,
        memo: {
          rule: `AC=BD\\ ,\\ (AC)${R('\\perp')}(BD)`,
          hook: 'أثبت أن إحداهما صورة الأخرى',
          example: `B=r(A),\\ D=r(C)\\Rightarrow${R('BD')}=AC`,
          trap: 'تطبيق الخواص قبل تعيين مركز الدوران وزاويته',
          exam: 'اكتب أن إحدى القطعتين صورة الأخرى بدوران، مع مركزه وزاويته',
          chip: `[AC]\\to[BD]`,
          quiz: [
            { q: 'لإثبات $AC = BD$ بدوران نبدأ بـ:', options: ['تعيين دوران يحوّل $[AC]$ إلى $[BD]$', 'قياس القطعتين بالمسطرة', 'رسم محور $[AC]$'], correct: 0 },
            { q: 'زاوية الدوران $90^\\circ$ و $[BD]$ صورة $[AC]$:', options: ['$(AC) \\perp (BD)$', '$(AC) \\parallel (BD)$', '$(AC) = (BD)$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المستوى «متقدم» أدرت نسخة $[AC]$ حول $O$ حتى انطبقت على $[BD]$ ، ثم أثبتّ $AC = BD$ و $(BD) \\perp (AC)$ ببطاقات الخواص. لو أعطيناك قطعتين أخريين وطُلب منك أن تثبت أنهما متقايستان ومتعامدتان، بأيّ خطوات تبدأ؟ اكتب الطريقة.',
        summary: 'لإثبات تقايس قطعتين أو تعامد مستقيمين نبيّن أن إحدى القطعتين صورة الأخرى بدوران نعيّن مركزه وزاويته، ثم نطبّق خواص الدوران.',
        body: (
          <div className="space-y-1.5">
            <ol className="list-decimal space-y-0.5 ps-5">{METHOD.solution.map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ol>
            <p className="text-sm"><MathText>{METHOD.remark}</MathText></p>
            <SourceTag source={METHOD.source} />
          </div>
        ),
      },
      {
        id: 'surat-zawiya', type: 'methodes', title: 'صورة زاوية بدوران',
        memo: {
          rule: `\\widehat{${R("A'O'B'")}}=\\widehat{AOB}`,
          hook: 'الرأس ونقطتان من الضلعين',
          example: `\\widehat{AOB}=45^{\\circ}\\Rightarrow\\widehat{${R("A'O'B'")}}=45^{\\circ}`,
          trap: 'إضافة زاوية الدوران إلى قيس الزاوية',
          exam: 'اكتب: الدوران يحافظ على الزوايا، فقيس الصورة هو نفسه',
          chip: `\\widehat{${R("A'O'B'")}}=\\widehat{AOB}`,
          quiz: [
            { q: 'صورة زاوية قيسها $45^\\circ$ بدوران زاويته $60^\\circ$ قيسها:', options: ['$45^\\circ$', '$105^\\circ$', '$60^\\circ$'], correct: 0 },
            { q: 'لإنشاء صورة زاوية ننشئ صور:', options: ['الرأس ونقطتين من ضلعيها', 'الرأس وحده', 'نقطة من أحد الضلعين فقط'], correct: 0 },
          ],
        },
        predictPrompt: 'وجدت قيس صورة الزاوية $\\widehat{AOB}$ دون أن ترسمها. لو طُلب منك أن ترسمها فعلًا بالدوران الذي مركزه $K$ وزاويته $60^\\circ$ ، هل تدير كلّ نقط ضلعيها؟ أيّ النقط تكفي، وكيف تكمل الرسم؟ اكتب الطريقة.',
        summary: 'لإنشاء صورة زاوية بدوران ننشئ صور رأسها ونقطتين من ضلعيها؛ والصورة زاوية لها نفس القيس لأن الدوران يحافظ على الزوايا.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{NOW155.answer}</MathText></p>
            <SourceTag source={NOW155.source} />
          </div>
        ),
      },
      {
        id: 'markaz-dawaran', type: 'methodes', title: CENTER.title,
        memo: {
          rule: `${R('WM')}=${R("WM'")}`,
          hook: 'المركز تقاطع محورين',
          example: `${R('WM^2')}=${R("WM'^2")}=2`,
          trap: 'الاكتفاء بمحور واحد أو بمحورين منطبقين',
          exam: 'اكتب: المركز على محور كل قطعة تصل نقطة بصورتها، فهو تقاطع محورين',
          chip: `${R('WM')}=${R("WM'")}`,
          quiz: [
            { q: `مركز الدوران الذي يحوّل $M$ إلى $M'$ يقع:`, options: [`على محور $[MM']$`, `على المستقيم $(MM')$`, `على منتصف $[MM']$ دائما`], correct: 0 },
            { q: `محورا $[MM']$ و $[NN']$ منطبقان. نعيّن المركز بـ:`, options: [`محور قطعة ثالثة $[PP']$`, `منتصف $[MM']$`, 'لا مركز لهذا الدوران'], correct: 0 },
          ],
        },
        predictPrompt: 'في آخر المستوى «متقدم» (التمرين 18) كان الدبوس مخفيًّا، ولم يكن أمامك إلا نقط وصورها. على أيّ خطّ يقع مركز دوران يحوّل $M$ إلى $M\'$ ، ولماذا؟ وكيف تعيّن المركز نفسه بالضبط؟',
        summary: 'مركز الدوران على نفس البعد من كل نقطة ومن صورتها: هو نقطة تقاطع محوري قطعتين تصل كل منهما نقطة بصورتها.',
        body: (
          <div className="space-y-1.5">
            <ol className="list-decimal space-y-0.5 ps-5">{CENTER.lines.map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ol>
            <p className="text-sm text-orange-800"><MathText>{CENTER.warning}</MathText></p>
            <SourceTag source={CENTER.source} />
          </div>
        ),
      },
    ],
  },
};
