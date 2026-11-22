import MathText from '../../../../../common/components/MathText';
import { SourceTag } from '../../../../../common/textbook';
import KeySequence from './components/KeySequence';
import { ACTIVITY, KNOW3, KEYS_RULE, ROUNDING_RULE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « استعمال الحاسبة لحساب النسب المثلثية وتعيين قياس زاوية » — SOURCE UNIQUE.
 *
 *   module 1 (نشاط 4)  hasiba-nisba — angle connu → rapport (la fonction, l'angle, =) ; hasiba-zawiya — rapport connu
 *                      → angle (2nd puis sin⁻¹ …) : ce que le tableau et les trois angles du نشاط ont montré ;
 *   module 2 (معارف 3) barmaja-daraja — programmer en degrés (la phrase du manuel, le piège R) ; tadwir-dalaqa —
 *                      arrondir le résultat à la précision demandée (plateforme, déclaré `knowledge_formalization`).
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'hasiba-nisba', type: 'methodes',
        memo: {
          rule: "\\alpha\\ \\longrightarrow\\ \\textcolor{#e11d48}{\\cos\\alpha}",
          hook: "الدالة ثم الزاوية ثم يساوي",
          example: "\\cos40^{\\circ}\\approx0{,}77",
          trap: "نكتب الزاوية قبل الدالة",
          exam: "نكتب القيمة المقربة مع علامة التقريب",
          chip: "\\cos\\alpha\\approx0{,}77",
          quiz: [
            { q: "ترتيب الضغط لحساب جيب $40^{\\circ}$ :", options: ["$\\sin,\\ 40,\\ =$", "$40,\\ \\sin,\\ =$", "$\\sin,\\ =,\\ 40$"], correct: 0 },
            { q: "$\\cos40^{\\circ}\\approx$", options: ["$0{,}77$", "$0{,}64$", "$0{,}84$"], correct: 0 },
          ],
        },
        title: 'نسبة زاوية معلومة بالحاسبة',
        predictPrompt: 'في جدول الحاسبة حسبت $\\cos 75^{\\circ}$ فكتبت $0{,}26$ ، ثم نسب زوايا أخرى. لو طُلب منك جيب زاوية أخرى أو ظلها، أيّ لمسات تضغط وبأيّ ترتيب، وماذا تعطيك الشاشة بالضبط؟ اكتب الطريقة.',
        summary: 'لحساب جيب تمام زاوية معلومة أو جيبها أو ظلها نضغط الدالة ثم قيس الزاوية ثم يساوي، فتعرض الحاسبة قيمة مقربة للنسبة.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KEYS_RULE.direct}</MathText></p>
            <p className="flex flex-wrap items-center gap-2"><KeySequence keys={['ON', 'cos', '40', '=']} /> <MathText>{'$\\cos 40^{\\circ} \\approx 0{,}77$'}</MathText></p>
            <SourceTag source={ACTIVITY.source} />
          </div>
        ),
      },
      {
        id: 'hasiba-zawiya', type: 'methodes',
        memo: {
          rule: "\\sin x=0{,}52\\Rightarrow x=\\textcolor{#e11d48}{\\sin^{-1}(0{,}52)}",
          hook: "اللمسة الثانية ثم الدالة العكسية",
          example: "x=\\sin^{-1}(0{,}52)\\approx31{,}33^{\\circ}",
          trap: "نستعمل الدالة المباشرة بدل العكسية",
          exam: "نكتب قيس الزاوية بالدرجة",
          chip: "\\sin^{-1}(a)=x",
          quiz: [
            { q: "$\\sin x=0{,}5$ فإن $x=$", options: ["$30^{\\circ}$", "$60^{\\circ}$", "$0{,}5^{\\circ}$"], correct: 0 },
            { q: "لتعيين $x$ من $\\tan x=2$ نحسب:", options: ["$\\tan^{-1}(2)$", "$\\tan(2)$", "$\\dfrac{1}{\\tan2}$"], correct: 0 },
          ],
        },
        title: 'قيس زاوية من إحدى نسبها',
        predictPrompt: 'في السؤال 2 كنت تعرف $\\cos x = 0{,}25$ لا الزاوية، فلم تكفِ الدالة $\\cos$ وحدها، ومع ذلك وجدت $x$ . إذا عرفت جيب زاوية حادة أو جيب تمامها أو ظلها، كيف تجد قيسها بالحاسبة؟ اكتب اللمسات بالترتيب.',
        summary: 'لتعيين قيس زاوية حادة نعرف جيبها أو جيب تمامها أو ظلها نضغط اللمسة الثانية ثم الدالة العكسية ثم النسبة ثم يساوي، فتعرض الحاسبة قيس الزاوية بالدرجة.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KEYS_RULE.inverse}</MathText></p>
            <p className="flex flex-wrap items-center gap-2"><KeySequence keys={['ON', '2nd', 'sin⁻¹', '0,52', '=']} /> <MathText>{'$x \\approx 31{,}33^{\\circ}$'}</MathText></p>
            <SourceTag source={ACTIVITY.source} />
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'barmaja-daraja', type: 'regles',
        memo: {
          rule: "\\sin30^{\\circ}=\\textcolor{#e11d48}{0{,}5}",
          hook: "الحاسبة بالدرجة قبل كل شيء",
          example: "\\sin30=-0{,}99\\ (\\mathrm{RAD})",
          trap: "نترك الحاسبة في وضع الراديان",
          exam: "نتحقق من وحدة الحاسبة أولا",
          chip: "\\sin30^{\\circ}=0{,}5",
          quiz: [
            { q: "قبل حساب نسبة زاوية نتحقق أن الحاسبة مبرمجة بالوحدة:", options: ["الدرجة", "الراديان", "الغراد"], correct: 0 },
            { q: "في وضع الدرجة $\\sin30^{\\circ}=$", options: ["$0{,}5$", "$-0{,}99$", "$0{,}87$"], correct: 0 },
          ],
        },
        title: 'الحاسبة مبرمجة بالدرجة',
        predictPrompt: 'في بداية النشاط كان الحرف ⁦R⁩ في أعلى شاشة الحاسبة، فأعطت نسبًا كذّبها مثلث الدرون (حتى أعدادًا سالبة)، ثم صارت نتائجها توافق الرسم. ما الذي يجب التحقّق منه قبل أيّ حساب لنسبة مثلثية بالحاسبة، ولماذا؟ اكتب القاعدة بكلماتك.',
        summary: 'قبل استعمال الحاسبة يجب برمجتها بالوحدة الدرجة؛ في وضع الراديان تعطي أعدادا أخرى لا علاقة لها بنسب الزاوية.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW3.intro}</MathText></p>
            <p><MathText>{KEYS_RULE.radTrap}</MathText></p>
            <SourceTag source={KNOW3.source} />
          </div>
        ),
      },
      {
        id: 'tadwir-dalaqa', type: 'methodes',
        memo: {
          rule: "75{,}52248781\\approx\\textcolor{#e11d48}{75{,}52}",
          hook: "ننظر إلى الرقم الموالي",
          example: "75{,}52248781\\approx75{,}5\\approx76",
          trap: "ندوّر قبل نهاية الحساب",
          exam: "ندوّر النتيجة النهائية إلى الدقة المطلوبة",
          chip: "75{,}52\\to75{,}5",
          quiz: [
            { q: "تدوير $75{,}5225$ إلى الوحدة:", options: ["$76$", "$75$", "$75{,}5$"], correct: 0 },
            { q: "تدوير $75{,}5225$ إلى الجزء من المئة:", options: ["$75{,}52$", "$75{,}53$", "$75{,}5$"], correct: 0 },
          ],
        },
        title: 'تدوير نتيجة الحاسبة',
        predictPrompt: 'بخط القطع ✂ صارت الشاشة نفسها $75{,}52248781$ ثلاث نتائج: $75{,}52$ ثم $75{,}5$ ثم $76$ . كيف قرّرت في كل مرة هل تُبقي آخر رقم تكتبه كما هو أو تغيّره؟ اكتب طريقة تدوير نتيجة الحاسبة إلى الدقة المطلوبة.',
        summary: 'نحتفظ بالأرقام حتى الرقم الذي تطلبه الدقة، وننظر إلى الرقم الموالي: إذا كان 5 أو أكبر نضيف 1، وإلا نحتفظ بالرقم كما هو؛ وندوّر النتيجة النهائية فقط.',
        body: (
          <div className="space-y-1.5">
            <ol className="list-decimal space-y-0.5 ps-5">
              {ROUNDING_RULE.lines.map((l) => <li key={l}><MathText>{l}</MathText></li>)}
            </ol>
            <SourceTag source={ROUNDING_RULE.source} />
          </div>
        ),
      },
    ],
  },
};
